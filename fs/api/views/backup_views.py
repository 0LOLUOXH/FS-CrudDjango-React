import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from django.http import HttpResponse, Http404
from django.conf import settings
from fs.api.authentication import CookieTokenAuthentication
from fs.backup_service import (
    create_backup,
    restore_backup,
    list_backups,
    get_backups_dir
)

def _get_safe_backup_path(filename, backup_dir):
    """
    Prevención estricta de Path Traversal (CWE-22 / OWASP Top 10):
    Garantiza que el archivo resuelto resida estrictamente dentro de backup_dir.
    """
    clean_filename = os.path.basename(filename)
    safe_path = os.path.abspath(os.path.join(backup_dir, clean_filename))
    base_dir = os.path.abspath(backup_dir)
    
    if not safe_path.startswith(base_dir):
        raise PermissionError("Acceso no autorizado al sistema de archivos.")
    return safe_path, clean_filename

class BaseBackupView(APIView):
    authentication_classes = [CookieTokenAuthentication, TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

class CreateBackupView(BaseBackupView):
    def post(self, request):
        try:
            backup_type = request.data.get('type', 'full') if isinstance(request.data, dict) else 'full'
            metadata = create_backup(backup_type=backup_type)
            return Response({
                'status': 'success',
                'message': f'Copia de seguridad ({metadata.get("backup_type", "full")}) creada correctamente',
                'backup': metadata
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RestoreBackupView(BaseBackupView):
    def post(self, request):
        try:
            filename = request.data.get('filename') if isinstance(request.data, dict) else None
            if not filename:
                return Response({'status': 'error', 'message': 'Nombre de backup no proporcionado'}, status=status.HTTP_400_BAD_REQUEST)

            backup_dir = get_backups_dir()
            _, clean_filename = _get_safe_backup_path(filename, backup_dir)
            
            result = restore_backup(clean_filename)
            return Response({
                'status': 'success',
                'message': result.get('message', f'Base de datos restaurada desde {clean_filename}'),
                'pre_restore_backup': result.get('pre_restore_backup')
            }, status=status.HTTP_200_OK)
        except (FileNotFoundError, Http404) as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except PermissionError as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ListBackupsView(BaseBackupView):
    def get(self, request):
        try:
            backups = list_backups()
            return Response({
                'status': 'success',
                'backups': backups
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e), 'backups': []}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DownloadBackupView(BaseBackupView):
    def get(self, request):
        try:
            filename = request.GET.get('filename')
            if not filename:
                return Response({'status': 'error', 'message': 'Nombre de backup no proporcionado'}, status=status.HTTP_400_BAD_REQUEST)

            backup_dir = get_backups_dir()
            backup_path, clean_filename = _get_safe_backup_path(filename, backup_dir)

            if not os.path.exists(backup_path) or not os.path.isfile(backup_path):
                return Response({'status': 'error', 'message': 'Backup no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            with open(backup_path, 'rb') as fh:
                response = HttpResponse(fh.read(), content_type='application/octet-stream')
                response['Content-Disposition'] = f'attachment; filename={clean_filename}'
                return response
        except PermissionError as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeleteBackupView(BaseBackupView):
    def delete(self, request):
        try:
            filename = request.GET.get('filename') or (request.data.get('filename') if isinstance(request.data, dict) else None)
            if not filename:
                return Response({'status': 'error', 'message': 'Nombre de backup no proporcionado'}, status=status.HTTP_400_BAD_REQUEST)

            backup_dir = get_backups_dir()
            backup_path, clean_filename = _get_safe_backup_path(filename, backup_dir)
            meta_path = os.path.join(backup_dir, f"{clean_filename}.meta")

            if not os.path.exists(backup_path):
                return Response({'status': 'error', 'message': 'Backup no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            os.remove(backup_path)
            if os.path.exists(meta_path):
                os.remove(meta_path)

            return Response({'status': 'success', 'message': 'Backup eliminado correctamente'}, status=status.HTTP_200_OK)
        except PermissionError as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

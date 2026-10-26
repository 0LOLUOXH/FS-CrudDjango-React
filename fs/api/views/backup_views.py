import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import TokenAuthentication
from django.http import HttpResponse
from django.conf import settings
from fs.backup_service import (
    create_backup,
    restore_backup,
    list_backups,
    get_backups_dir
)

class CreateBackupView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

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

class RestoreBackupView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        try:
            filename = request.data.get('filename') if isinstance(request.data, dict) else None
            if not filename:
                return Response({'status': 'error', 'message': 'Nombre de backup no proporcionado'}, status=status.HTTP_400_BAD_REQUEST)

            result = restore_backup(filename)
            return Response({
                'status': 'success',
                'message': result.get('message', f'Base de datos restaurada desde {filename}'),
                'pre_restore_backup': result.get('pre_restore_backup')
            }, status=status.HTTP_200_OK)
        except FileNotFoundError as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ListBackupsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        try:
            backups = list_backups()
            return Response({
                'status': 'success',
                'backups': backups
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e), 'backups': []}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DownloadBackupView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        try:
            filename = request.GET.get('filename')
            if not filename:
                return Response({'status': 'error', 'message': 'Nombre de backup no proporcionado'}, status=status.HTTP_400_BAD_REQUEST)

            backup_dir = get_backups_dir()
            backup_path = os.path.join(backup_dir, filename)

            if not os.path.exists(backup_path) or not os.path.isfile(backup_path):
                return Response({'status': 'error', 'message': 'Backup no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            with open(backup_path, 'rb') as fh:
                response = HttpResponse(fh.read(), content_type='application/octet-stream')
                response['Content-Disposition'] = f'attachment; filename={os.path.basename(backup_path)}'
                return response
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeleteBackupView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request):
        try:
            filename = request.GET.get('filename') or (request.data.get('filename') if isinstance(request.data, dict) else None)
            if not filename:
                return Response({'status': 'error', 'message': 'Nombre de backup no proporcionado'}, status=status.HTTP_400_BAD_REQUEST)

            backup_dir = get_backups_dir()
            backup_path = os.path.join(backup_dir, filename)
            meta_path = os.path.join(backup_dir, f"{filename}.meta")

            if not os.path.exists(backup_path):
                return Response({'status': 'error', 'message': 'Backup no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            os.remove(backup_path)
            if os.path.exists(meta_path):
                os.remove(meta_path)

            return Response({'status': 'success', 'message': 'Backup eliminado correctamente'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.http import JsonResponse, HttpResponse
from django.conf import settings
from datetime import datetime
import os
import shutil
import json

class CreateBackupView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            db_path = settings.DATABASES['default']['NAME']
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"backup_{timestamp}.db"
            backup_path = os.path.join(settings.BACKUPS_DIR, backup_filename)

            shutil.copy2(db_path, backup_path)

            metadata = {
                'filename': backup_filename,
                'created_at': datetime.now().isoformat(),
                'size': os.path.getsize(backup_path),
                'db_path': str(db_path)
            }

            with open(os.path.join(settings.BACKUPS_DIR, f"{backup_filename}.meta"), 'w') as f:
                json.dump(metadata, f)

            return JsonResponse({
                'status': 'success',
                'message': 'Backup creado correctamente',
                'backup': metadata
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

class RestoreBackupView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = request.data
            backup_filename = data.get('filename')

            if not backup_filename:
                return JsonResponse({'status': 'error', 'message': 'Nombre de backup no proporcionado'}, status=400)

            backup_path = os.path.join(settings.BACKUPS_DIR, backup_filename)
            db_path = settings.DATABASES['default']['NAME']

            if not os.path.exists(backup_path):
                return JsonResponse({'status': 'error', 'message': 'Backup no encontrado'}, status=404)

            current_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pre_restore_backup = f"pre_restore_{current_timestamp}.db"
            shutil.copy2(db_path, os.path.join(settings.BACKUPS_DIR, pre_restore_backup))

            shutil.copy2(backup_path, db_path)

            return JsonResponse({
                'status': 'success',
                'message': f'Base de datos restaurada desde {backup_filename}',
                'pre_restore_backup': pre_restore_backup
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

class ListBackupsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            backups = []
            files = os.listdir(settings.BACKUPS_DIR)

            for file in files:
                if file.startswith('backup_') and file.endswith('.db'):
                    meta_file = os.path.join(settings.BACKUPS_DIR, f"{file}.meta")
                    if os.path.exists(meta_file):
                        try:
                            with open(meta_file, 'r') as f:
                                metadata = json.load(f)
                                backups.append(metadata)
                        except Exception as e:
                            print(f"Error leyendo {meta_file}: {str(e)}")

            backups.sort(key=lambda x: x['created_at'], reverse=True)

            return JsonResponse({
                'status': 'success',
                'backups': backups
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e), 'backups': []}, status=500)

class DownloadBackupView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            backup_filename = request.GET.get('filename')
            if not backup_filename:
                return JsonResponse({'status': 'error', 'message': 'Nombre de backup no proporcionado'}, status=400)

            backup_path = os.path.join(settings.BACKUPS_DIR, backup_filename)

            if not os.path.exists(backup_path):
                return JsonResponse({'status': 'error', 'message': 'Backup no encontrado'}, status=404)

            with open(backup_path, 'rb') as fh:
                response = HttpResponse(fh.read(), content_type='application/octet-stream')
                response['Content-Disposition'] = f'attachment; filename={os.path.basename(backup_path)}'
                return response
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

class DeleteBackupView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        try:
            backup_filename = request.GET.get('filename')
            if not backup_filename:
                return JsonResponse({'status': 'error', 'message': 'Nombre de backup no proporcionado'}, status=400)

            backup_path = os.path.join(settings.BACKUPS_DIR, backup_filename)
            meta_path = os.path.join(settings.BACKUPS_DIR, f"{backup_filename}.meta")

            if not os.path.exists(backup_path):
                return JsonResponse({'status': 'error', 'message': 'Backup no encontrado'}, status=404)

            os.remove(backup_path)
            if os.path.exists(meta_path):
                os.remove(meta_path)

            return JsonResponse({'status': 'success', 'message': 'Backup eliminado correctamente'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

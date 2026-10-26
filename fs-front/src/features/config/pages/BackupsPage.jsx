import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { GlassCard, Modal, Badge } from '../../../components/ui';
import { toast } from 'react-toastify';

export default function BackupsPage() {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [backupType, setBackupType] = useState('full');
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        content: '',
        action: null,
        isDestructive: false
    });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const fetchBackups = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/fs/backups/list/', {
                headers: getAuthHeaders()
            });
            
            if (response.data && Array.isArray(response.data.backups)) {
                setBackups(response.data.backups);
            } else {
                setBackups([]);
            }
        } catch (error) {
            console.error("Error en fetchBackups:", error);
            const errorMsg = error.response?.data?.message || 
                          error.response?.statusText || 
                          error.message;
            toast.error(`Error al cargar backups: ${errorMsg}`);
            setBackups([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBackups();
    }, [fetchBackups]);

    const handleCreateBackup = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                'http://localhost:8000/fs/backups/create/', 
                { type: backupType }, 
                { headers: getAuthHeaders() }
            );
            toast.success(response.data.message || 'Copia de seguridad creada correctamente');
            await fetchBackups();
        } catch (error) {
            toast.error('Error al crear backup: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, filename, successMessage) => {
        if (loading || !filename) return;

        try {
            setLoading(true);
            switch(action) {
                case 'download': {
                    const response = await axios.get(
                        `http://localhost:8000/fs/backups/download/?filename=${encodeURIComponent(filename)}`,
                        {
                            responseType: 'blob',
                            headers: getAuthHeaders()
                        }
                    );
                    
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                    break;
                }
                    
                case 'restore':
                    await axios.post(
                        'http://localhost:8000/fs/backups/restore/', 
                        { filename },
                        { headers: getAuthHeaders() }
                    );
                    break;
                    
                case 'delete':
                    await axios.delete(
                        `http://localhost:8000/fs/backups/delete/?filename=${encodeURIComponent(filename)}`,
                        { headers: getAuthHeaders() }
                    );
                    break;
                    
                default:
                    throw new Error('Acción no válida');
            }

            toast.success(successMessage);
            if (action !== 'download') {
                await fetchBackups();
            }
        } catch (error) {
            toast.error(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreClick = (filename) => {
        setConfirmDialog({
            open: true,
            title: 'Confirmar Restauración de Base de Datos',
            content: `¿Estás completamente seguro de que deseas restaurar el archivo "${filename}"? Esta operación sobrescribirá los datos del sistema con el estado exacto de esta copia de seguridad.`,
            action: () => handleAction('restore', filename, 'Backup restaurado correctamente'),
            isDestructive: false
        });
    };

    const handleDeleteClick = (filename) => {
        setConfirmDialog({
            open: true,
            title: 'Confirmar Eliminación de Respaldo',
            content: `¿Estás seguro de que deseas eliminar permanentemente el archivo "${filename}"? Esta acción no se puede deshacer.`,
            action: () => handleAction('delete', filename, 'Backup eliminado correctamente'),
            isDestructive: true
        });
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Métricas KPI
    const totalBytes = useMemo(() => {
        return backups.reduce((acc, b) => acc + (b.size || 0), 0);
    }, [backups]);

    return (
        <div className="w-full p-4 lg:p-6 space-y-6">
            {/* Cabecera Principal */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] flex items-center gap-2.5">
                        <i className="fa-solid fa-database text-[var(--primary)]"></i>
                        Copias de Seguridad (Backups)
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Respaldo, descarga y restauración de la base de datos operativa de Fusion Solar
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        onClick={fetchBackups}
                        disabled={loading}
                        className="btn btn-outline"
                    >
                        <i className={`fa-solid fa-rotate mr-1.5 ${loading ? 'fa-spin' : ''}`}></i>
                        Actualizar
                    </button>

                    {Array.isArray(backups) && backups.length > 0 && (
                        <button
                            onClick={() => handleRestoreClick(backups[0].filename)}
                            disabled={loading}
                            className="btn btn-outline text-amber-500 hover:border-amber-500"
                        >
                            <i className="fa-solid fa-clock-rotate-left mr-1.5"></i>
                            Restaurar Último
                        </button>
                    )}

                    <div className="flex items-center gap-2">
                        <select
                            value={backupType}
                            onChange={(e) => setBackupType(e.target.value)}
                            disabled={loading}
                            className="bg-[var(--bg-card)] border border-[var(--border-glass)] text-[var(--text-main)] text-sm rounded-lg px-3 py-2 outline-none font-medium cursor-pointer"
                            title="Seleccionar tipo de copia de seguridad"
                        >
                            <option value="full">Completo (Full)</option>
                            <option value="incremental">Incremental</option>
                            <option value="differential">Diferencial</option>
                        </select>

                        <button
                            onClick={handleCreateBackup}
                            disabled={loading}
                            className="btn btn-primary shadow-lg shadow-[var(--primary)]/20 whitespace-nowrap"
                        >
                            <i className="fa-solid fa-cloud-arrow-up mr-1.5"></i>
                            Crear Backup
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-hard-drive"></i>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Respaldos Almacenados</span>
                        <h3 className="text-2xl font-bold text-[var(--text-main)] mt-0.5">{backups.length}</h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-calendar-check"></i>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Última Copia Generada</span>
                        <h3 className="text-sm font-bold text-[var(--text-main)] mt-1 truncate max-w-[200px]">
                            {backups.length > 0 ? formatDate(backups[0].created_at) : 'Ninguna'}
                        </h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-server"></i>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Espacio en Disco Ocupado</span>
                        <h3 className="text-2xl font-bold text-[var(--text-main)] mt-0.5">{formatBytes(totalBytes)}</h3>
                    </div>
                </GlassCard>
            </div>

            {/* Advertencia de Seguridad */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-start gap-3">
                <i className="fa-solid fa-triangle-exclamation text-lg mt-0.5 shrink-0"></i>
                <div className="text-xs space-y-1">
                    <p className="font-semibold text-sm">Políticas y Recomendaciones de Seguridad:</p>
                    <p>
                        Se recomienda generar un respaldo preventivo al final de cada jornada o antes de aplicar actualizaciones masivas.
                        Al restaurar un backup se reescribirán todas las tablas con la información del momento exacto de su captura.
                    </p>
                </div>
            </div>

            {/* Tabla de Backups */}
            <GlassCard className="overflow-hidden p-4 sm:p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[var(--border-glass)]">
                    <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                        <i className="fa-solid fa-clock-rotate-left text-[var(--primary)]"></i>
                        Historial de Respaldos
                    </h2>
                    <span className="text-xs text-[var(--text-muted)] font-medium">
                        {backups.length} {backups.length === 1 ? 'archivo disponible' : 'archivos disponibles'}
                    </span>
                </div>

                <div className="table-responsive">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th>Archivo de Backup</th>
                                <th>Fecha de Generación</th>
                                <th>Tamaño</th>
                                <th className="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && backups.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-12">
                                        <i className="fa-solid fa-spinner fa-spin text-2xl text-[var(--primary)]"></i>
                                        <p className="text-sm text-[var(--text-muted)] mt-2">Cargando copias de seguridad...</p>
                                    </td>
                                </tr>
                            ) : backups.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-12 text-[var(--text-muted)]">
                                        <i className="fa-solid fa-cloud-arrow-up text-3xl mb-2 opacity-50 block"></i>
                                        No se han generado copias de seguridad aún. Haz clic en "Crear Nuevo Backup".
                                    </td>
                                </tr>
                            ) : (
                                backups.map((backup, index) => (
                                    <tr key={`${backup.filename}-${index}`}>
                                        <td>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm shrink-0">
                                                    <i className="fa-solid fa-file-zipper"></i>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-mono text-sm font-semibold text-[var(--text-main)]">
                                                            {backup.filename}
                                                        </span>
                                                        {backup.backup_type && (
                                                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                                                                backup.backup_type === 'full' ? 'bg-blue-500/15 text-blue-500' :
                                                                backup.backup_type === 'incremental' ? 'bg-purple-500/15 text-purple-500' :
                                                                backup.backup_type === 'differential' ? 'bg-amber-500/15 text-amber-500' :
                                                                backup.backup_type === 'pre_restore' ? 'bg-rose-500/15 text-rose-500' :
                                                                'bg-slate-500/15 text-slate-400'
                                                            }`}>
                                                                {backup.backup_type}
                                                            </span>
                                                        )}
                                                        {index === 0 && (
                                                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/15 text-emerald-500 uppercase tracking-wider">
                                                                Más reciente
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-sm text-[var(--text-muted)] flex items-center gap-1.5">
                                                <i className="fa-regular fa-clock text-xs"></i>
                                                {formatDate(backup.created_at)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-[var(--bg-card-subtle)] text-[var(--text-main)] border border-[var(--border-glass)]">
                                                {formatBytes(backup.size)}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleAction('download', backup.filename, 'Descargando copia de seguridad...')}
                                                    disabled={loading}
                                                    className="btn btn-icon p-2 text-blue-500 hover:bg-blue-500/15 rounded-lg transition-colors"
                                                    title="Descargar archivo"
                                                >
                                                    <i className="fa-solid fa-download"></i>
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleRestoreClick(backup.filename)}
                                                    disabled={loading}
                                                    className="btn btn-icon p-2 text-amber-500 hover:bg-amber-500/15 rounded-lg transition-colors"
                                                    title="Restaurar base de datos a este punto"
                                                >
                                                    <i className="fa-solid fa-clock-rotate-left"></i>
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleDeleteClick(backup.filename)}
                                                    disabled={loading}
                                                    className="btn btn-icon p-2 text-rose-500 hover:bg-rose-500/15 rounded-lg transition-colors"
                                                    title="Eliminar archivo permanentemente"
                                                >
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Modal de Confirmación Accesible */}
            <Modal
                isOpen={confirmDialog.open}
                onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
                title={confirmDialog.title}
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                        confirmDialog.isDestructive
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    }`}>
                        <i className={`text-xl mt-0.5 shrink-0 fa-solid ${
                            confirmDialog.isDestructive ? 'fa-trash-can' : 'fa-triangle-exclamation'
                        }`}></i>
                        <p className="text-sm leading-relaxed">
                            {confirmDialog.content}
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-glass)]">
                        <button
                            type="button"
                            onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
                            className="btn btn-outline"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (confirmDialog.action) confirmDialog.action();
                                setConfirmDialog(prev => ({ ...prev, open: false }));
                            }}
                            className={`btn ${
                                confirmDialog.isDestructive
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                                    : 'btn-primary'
                            }`}
                        >
                            Confirmar Acción
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

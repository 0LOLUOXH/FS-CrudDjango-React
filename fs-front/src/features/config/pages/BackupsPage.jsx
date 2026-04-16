import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Box, 
    Button, 
    Container, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Typography, 
    CircularProgress,
    Alert,
    Snackbar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { 
    Backup as BackupIcon, 
    Restore as RestoreIcon, 
    Refresh as RefreshIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon
} from '@mui/icons-material';

const BackupPage = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        content: '',
        action: null
    });

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

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
                showSnackbar('Formato de datos inválido', 'error');
            }
        } catch (error) {
            console.error("Error en fetchBackups:", error);
            const errorMsg = error.response?.data?.message || 
                          error.response?.statusText || 
                          error.message;
            showSnackbar(`Error al cargar backups: ${errorMsg}`, 'error');
            setBackups([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        
        const loadData = async () => {
            await fetchBackups();
        };

        if (isMounted) loadData();
        
        return () => { isMounted = false };
    }, [fetchBackups]);

    const handleCreateBackup = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                'http://localhost:8000/fs/backups/create/', 
                {}, 
                { headers: getAuthHeaders() }
            );
            showSnackbar(response.data.message);
            await fetchBackups();
        } catch (error) {
            showSnackbar('Error al crear backup: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, filename, successMessage) => {
        if (loading || !filename) return;

        try {
            setLoading(true);
            let response;
            
            switch(action) {
                case 'download': {
                    response = await axios.get(
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
                    response = await axios.post(
                        'http://localhost:8000/fs/backups/restore/', 
                        { filename },
                        { headers: getAuthHeaders() }
                    );
                    break;
                    
                case 'delete':
                    response = await axios.delete(
                        `http://localhost:8000/fs/backups/delete/?filename=${encodeURIComponent(filename)}`,
                        { headers: getAuthHeaders() }
                    );
                    break;
                    
                default:
                    throw new Error('Acción no válida');
            }

            showSnackbar(successMessage);
            if (action !== 'download') {
                await fetchBackups();
            }
        } catch (error) {
            showSnackbar(`Error: ${error.response?.data?.message || error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreClick = (filename) => {
        setConfirmDialog({
            open: true,
            title: 'Confirmar restauración',
            content: `¿Estás seguro de que deseas restaurar el backup ${filename}? Esto sobrescribirá la base de datos actual.`,
            action: () => handleAction('restore', filename, 'Backup restaurado correctamente')
        });
    };

    const handleDeleteClick = (filename) => {
        setConfirmDialog({
            open: true,
            title: 'Confirmar eliminación',
            content: `¿Estás seguro de que deseas eliminar permanentemente el backup ${filename}?`,
            action: () => handleAction('delete', filename, 'Backup eliminado correctamente')
        });
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i]);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Administración de Backups
                </Typography>
                
                <Typography variant="body1" color="text.secondary" paragraph>
                    Gestiona los backups de la base de datos. Crea nuevos, restaura versiones anteriores o descarga copias de seguridad.
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<BackupIcon />}
                        onClick={handleCreateBackup}
                        disabled={loading}
                    >
                        Crear Nuevo Backup
                    </Button>
                    
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchBackups}
                            disabled={loading}
                            sx={{ mr: 2 }}
                        >
                            Actualizar Lista
                        </Button>
                        
                        {Array.isArray(backups) && backups.length > 0 && (
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<RestoreIcon />}
                                onClick={() => handleRestoreClick(backups[0].filename)}
                                disabled={loading}
                            >
                                Restaurar Último
                            </Button>
                        )}
                    </Box>
                </Box>

                <Paper elevation={3}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nombre del Backup</TableCell>
                                    <TableCell>Fecha de Creación</TableCell>
                                    <TableCell>Tamaño</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading && backups.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                )}
                                
                                {!loading && (!Array.isArray(backups) || backups.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No hay backups disponibles
                                        </TableCell>
                                    </TableRow>
                                )}
                                
                                {Array.isArray(backups) && backups.map((backup, index) => (
                                    <TableRow key={`${backup.filename}-${index}`}>
                                        <TableCell>{backup.filename}</TableCell>
                                        <TableCell>{formatDate(backup.created_at)}</TableCell>
                                        <TableCell>{formatBytes(backup.size)}</TableCell>
                                        <TableCell align="center">
                                            <IconButton 
                                                color="primary" 
                                                onClick={() => handleAction('download', backup.filename, 'Backup descargado correctamente')}
                                                title="Descargar"
                                                disabled={loading}
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                            
                                            <IconButton 
                                                color="secondary" 
                                                onClick={() => handleRestoreClick(backup.filename)}
                                                title="Restaurar"
                                                disabled={loading}
                                            >
                                                <RestoreIcon />
                                            </IconButton>
                                            
                                            <IconButton 
                                                color="error" 
                                                onClick={() => handleDeleteClick(backup.filename)}
                                                title="Eliminar"
                                                disabled={loading}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            >
                <DialogTitle>{confirmDialog.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmDialog.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
                        color="primary"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={() => {
                            confirmDialog.action();
                            setConfirmDialog(prev => ({ ...prev, open: false }));
                        }}
                        color="secondary"
                        autoFocus
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default BackupPage;

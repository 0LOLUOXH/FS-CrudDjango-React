import React, { useState, useEffect, useMemo } from 'react';
import { getAllUser, getUser, createUser, updateUser } from '../../../api/auth_api';
import { GlassCard, Modal, FloatingInput, Badge } from '../../../components/ui';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EmployeeManagementPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        is_staff: false,
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const res = await getAllUser();
            setUsers(res.data || []);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Error al cargar la lista de usuarios');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openCreateModal = () => {
        setCurrentUser(null);
        setFormData({
            username: '',
            email: '',
            password: '',
            is_staff: false,
        });
        setIsModalOpen(true);
    };

    const openEditModal = async (id) => {
        try {
            const res = await getUser(id);
            const user = res.data;
            setCurrentUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                password: '',
                is_staff: user.is_staff,
            });
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error('Error al cargar usuario para edición');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentUser) {
                const userToUpdate = {
                    username: formData.username,
                    email: formData.email,
                    is_staff: formData.is_staff
                };
                if (formData.password) {
                    userToUpdate.password = formData.password;
                }
                const updatedUser = await updateUser(currentUser.id, userToUpdate);
                setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
                toast.success('Usuario actualizado correctamente');
            } else {
                const newUser = await createUser(formData);
                setUsers([...users, newUser]);
                toast.success('Usuario creado correctamente');
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving user:', error);
            if (error.response?.data) {
                Object.entries(error.response.data).forEach(([field, errors]) => {
                    toast.error(`${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`);
                });
            } else {
                toast.error('Error al guardar usuario');
            }
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const term = searchTerm.toLowerCase();
            return (
                (u.username || '').toLowerCase().includes(term) ||
                (u.email || '').toLowerCase().includes(term)
            );
        });
    }, [users, searchTerm]);

    const adminCount = useMemo(() => users.filter(u => u.is_staff).length, [users]);

    return (
        <div className="w-full p-4 lg:p-6 space-y-6">
            <ToastContainer position="top-right" autoClose={4000} />

            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] flex items-center gap-2.5">
                        <i className="fa-solid fa-users-gear text-[var(--primary)]"></i>
                        Gestión de Usuarios y Empleados
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Control de credenciales, roles administrativos y cuentas de acceso
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="btn btn-primary shadow-lg shadow-[var(--primary)]/20"
                >
                    <i className="fa-solid fa-user-plus mr-1.5"></i>
                    Nuevo Usuario
                </button>
            </div>

            {/* Tarjetas KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-users"></i>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total Usuarios</span>
                        <h3 className="text-2xl font-bold text-[var(--text-main)] mt-0.5">{users.length}</h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-user-shield"></i>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Administradores</span>
                        <h3 className="text-2xl font-bold text-purple-500 mt-0.5">{adminCount}</h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-user-check"></i>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Operadores Estándar</span>
                        <h3 className="text-2xl font-bold text-emerald-500 mt-0.5">{users.length - adminCount}</h3>
                    </div>
                </GlassCard>
            </div>

            {/* Tabla de Usuarios */}
            <GlassCard className="overflow-hidden p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm"></i>
                        <input
                            type="text"
                            placeholder="Buscar por usuario o correo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-main)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all"
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="w-20">ID</th>
                                <th>Usuario</th>
                                <th>Email</th>
                                <th>Rol / Nivel</th>
                                <th className="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12">
                                        <i className="fa-solid fa-spinner fa-spin text-2xl text-[var(--primary)]"></i>
                                        <p className="text-sm text-[var(--text-muted)] mt-2">Cargando usuarios...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-[var(--text-muted)]">
                                        <i className="fa-solid fa-user-xmark text-3xl mb-2 opacity-50 block"></i>
                                        No se encontraron usuarios que coincidan con la búsqueda
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-glass)]">
                                                #{user.id}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-bold shrink-0">
                                                    {(user.username || 'U')[0].toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-[var(--text-main)]">{user.username}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-sm text-[var(--text-muted)]">{user.email || '—'}</span>
                                        </td>
                                        <td>
                                            <Badge variant={user.is_staff ? 'warning' : 'neutral'}>
                                                <i className={`fa-solid ${user.is_staff ? 'fa-shield' : 'fa-user'} mr-1 text-[10px]`}></i>
                                                {user.is_staff ? 'Administrador' : 'Empleado'}
                                            </Badge>
                                        </td>
                                        <td className="text-right">
                                            <button
                                                onClick={() => openEditModal(user.id)}
                                                className="btn btn-icon p-2 text-amber-500 hover:bg-amber-500/15 rounded-lg transition-colors"
                                                title="Editar usuario"
                                            >
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Modal Creación / Edición */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentUser ? `Editar Usuario #${currentUser.id}` : 'Crear Nuevo Usuario'}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FloatingInput
                        label="Nombre de Usuario"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        icon={<i className="fa-solid fa-user text-sm"></i>}
                    />

                    <FloatingInput
                        label="Correo Electrónico"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        icon={<i className="fa-solid fa-envelope text-sm"></i>}
                    />

                    <FloatingInput
                        label={currentUser ? 'Nueva Contraseña (dejar en blanco para conservar)' : 'Contraseña'}
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!currentUser}
                        icon={<i className="fa-solid fa-lock text-sm"></i>}
                    />

                    <div className="p-3.5 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
                        <div className="space-y-0.5">
                            <label htmlFor="is_staff" className="text-sm font-semibold text-[var(--text-main)] cursor-pointer">
                                Rol de Administrador
                            </label>
                            <p className="text-xs text-[var(--text-muted)]">
                                Otorga acceso a configuración, copias de seguridad y altas de empleados
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            id="is_staff"
                            name="is_staff"
                            checked={formData.is_staff}
                            onChange={handleInputChange}
                            className="w-5 h-5 rounded text-[var(--primary)] focus:ring-[var(--primary)] border-[var(--border-glass)] cursor-pointer"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-glass)]">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn btn-outline"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            <i className="fa-solid fa-floppy-disk mr-1.5"></i>
                            {currentUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

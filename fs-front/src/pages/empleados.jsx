import React, { useState, useEffect } from 'react';
import { fetchUsers, fetchUser, createUser, updateUser, deleteUser } from '../api/user_api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Empleados = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        is_staff: false,
    });

    // Cargar usuarios al montar el componente
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await fetchUsers();
                setUsers(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading users:', error);
                toast.error('Error al cargar usuarios');
                setIsLoading(false);
            }
        };
        loadUsers();
    }, []);

    // Manejar cambios en los inputs del formulario
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Abrir modal para crear nuevo usuario
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

    // Abrir modal para editar usuario existente
    const openEditModal = async (id) => {
        try {
            const user = await fetchUser(id);
            setCurrentUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                password: '', // No mostramos la contraseña actual por seguridad
                is_staff: user.is_staff,
            });
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error('Error al cargar usuario');
        }
    };

    // Abrir modal de confirmación para eliminar
    const openDeleteModal = (user) => {
        setCurrentUser(user);
        setIsDeleteModalOpen(true);
    };

    // Manejar envío del formulario (crear o actualizar)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentUser) {
                // Actualizar usuario existente
                const userToUpdate = {
                    username: formData.username,
                    email: formData.email,
                    is_staff: formData.is_staff
                };
                
                // Solo incluir password si no está vacío
                if (formData.password) {
                    userToUpdate.password = formData.password;
                }

                const updatedUser = await updateUser(currentUser.id, userToUpdate);
                setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
                toast.success('Usuario actualizado correctamente');
            } else {
                // Crear nuevo usuario
                const newUser = await createUser(formData);
                setUsers([...users, newUser]);
                toast.success('Usuario creado correctamente');
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving user:', error);
            
            // Mostrar errores específicos del backend si existen
            if (error.response?.data) {
                Object.entries(error.response.data).forEach(([field, errors]) => {
                    toast.error(`${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`);
                });
            } else {
                toast.error('Error al guardar usuario');
            }
        }
    };

    // Manejar eliminación de usuario
    const handleDelete = async () => {
        try {
            await deleteUser(currentUser.id);
            setUsers(users.filter(user => user.id !== currentUser.id));
            toast.success('Usuario eliminado correctamente');
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Error al eliminar usuario');
        }
    };

   return (
    <div className="container mx-auto px-4 py-8">
        <ToastContainer position="top-right" autoClose={3000} />
        
        {/* Encabezado y botón de crear */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gestión de Empleados</h1>
            <button
                onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-3 rounded-lg transition duration-200 w-full sm:w-auto"
            >
                Crear usuario
            </button>
        </div>

        {/* Tabla de usuarios */}
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[150px] sm:max-w-none">{user.email}</td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.is_staff ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Sí</span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">No</span>
                                        )}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 sm:space-x-3">
                                        <button
                                            onClick={() => openEditModal(user.id)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(user)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Modal para crear/editar usuario */}
        {isModalOpen && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-2 sm:mx-0">
                    <div className="p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4">
                            {currentUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                    Nombre de usuario
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                    {currentUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required={!currentUser}
                                />
                            </div>
                            <div className="mb-4 flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_staff"
                                    name="is_staff"
                                    checked={formData.is_staff}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_staff" className="ml-2 block text-sm text-gray-700">
                                    Es administrador
                                </label>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {currentUser ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}

        {/* Modal de confirmación para eliminar */}
        {isDeleteModalOpen && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-2 sm:mx-0">
                    <div className="p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4">Confirmar Eliminación</h2>
                        <p className="mb-6">
                            ¿Estás seguro de que deseas eliminar al usuario "{currentUser?.username}"? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
);
};

export default Empleados;
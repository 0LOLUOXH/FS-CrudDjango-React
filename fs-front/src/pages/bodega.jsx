import { useEffect, useState } from 'react'
import { deleteBodega, fetchBodegas, updateBodega } from '../api/bodega_api'
import { Ingresar_Bodega } from '../components/ingresarbodega'
import { fetchUsers } from '../api/user_api'
import '../popup.css'

function Bodega() {
    const [bodegas, setBodegas] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [editingBodega, setEditingBodega] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        estado: true,
        capacidad: '',
        empleado: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [bodegasRes, empleadosRes] = await Promise.all([
                    fetchBodegas(),
                    fetchUsers()
                ]);
                setBodegas(bodegasRes);
                setEmpleados(empleadosRes);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [])

    const handleEditClick = (bodega) => {
        setEditingBodega(bodega);
        setFormData({
            nombre: bodega.nombre,
            estado: bodega.estado,
            capacidad: bodega.capacidad,
            empleado: bodega.empleado
        });
        setIsPopupOpen(true);
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateBodega(editingBodega.id, formData);
            const updatedBodegas = await fetchBodegas();
            setBodegas(updatedBodegas);
            setIsPopupOpen(false);
            setError(null);
        } catch (error) {
            setError('Error al actualizar la bodega');
            console.error('Error updating bodega:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDeleteClick = async (bodega) => {
        if (!window.confirm('¿Estás seguro de eliminar esta bodega?')) return;
        
        setIsLoading(true);
        try {
            await deleteBodega(bodega.id);
            const updatedBodegas = await fetchBodegas();
            setBodegas(updatedBodegas);
        } catch (error) {
            setError('Error al eliminar la bodega');
            console.error('Error deleting bodega:', error);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) return <div>Cargando datos...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Bodegas</h1>

            {bodegas.map((bodega) => {
                const empleado = empleados.find(e => e.id === bodega.empleado);
                return (
                    <div key={bodega.id}>
                        <h2>Identificador: {bodega.id}</h2>
                        <h2>Nombre: {bodega.nombre}</h2>
                        <h2>Estado: {bodega.estado ? 'Activo' : 'Inactivo'}</h2>
                        <h2>Capacidad: {bodega.capacidad}</h2>
                        <h2>Empleado: {empleado ? `${empleado.username}` : 'No asignado'}</h2>
                        <button className="buttonedit" onClick={() => handleEditClick(bodega)}>Editar</button>
                        <button onClick={() => handleDeleteClick(bodega)} className="buttonedit delete-btn">Eliminar</button>
                        <hr />
                    </div>
                );
            })}

            <Ingresar_Bodega />

            {/* Edit Popup */}
            {isPopupOpen && (
                <div className="popup-overlay backdrop-blur-sm bg-black/30">
                    <div className="popup-content">
                        <h2>Editar Bodega</h2>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre:</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="estado"
                                        checked={formData.estado}
                                        onChange={handleInputChange}
                                    />
                                    <span> Activo</span>
                                </label>
                            </div>
                            <div className="form-group">
                                <label>Capacidad:</label>
                                <input
                                    type="number"
                                    name="capacidad"
                                    value={formData.capacidad}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                />
                            </div>
                            <div className="form-group">
                                <label>Empleado:</label>
                                <select
                                    name="empleado"
                                    value={formData.empleado}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione un empleado</option>
                                    {empleados.map(empleado => (
                                        <option key={empleado.id} value={empleado.id}>
                                            {empleado.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="button-group">
                                <button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setIsPopupOpen(false)}
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Bodega
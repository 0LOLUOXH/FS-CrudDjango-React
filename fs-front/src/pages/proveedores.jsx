import { useEffect, useState } from 'react'
import { fetchProveedores, fetchProveedor, createProveedor, updateProveedor, deleteProveedor } from '../api/proveedor_api'
import { Ingresar_Proveedor } from '../components/ingresarproveedor'
import '../popup.css' 

function Proveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [editingProveedor, setEditingProveedor] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [formData, setFormData] = useState({
        cedula: '',
        nombre: '',
        apellido: '',
        telefono: '',
    });

    useEffect(() => {
        async function getProveedores() {
            const res = await fetchProveedores();
            setProveedores(res);
        }
        getProveedores();
    }, []);
    
    const handleEditClick = (proveedor) => {
        setEditingProveedor(proveedor);
        setFormData({
            id: proveedor.id,
            cedula: proveedor.cedula,
            nombre: proveedor.nombre,
            apellido: proveedor.apellido,
            telefono: proveedor.telefono
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
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (editingProveedor) {
            await updateProveedor(formData.id, formData);
        } else {
            await createProveedor(formData);
        }
        setIsPopupOpen(false);
        setEditingProveedor(null);
        setFormData({
            cedula: '',
            nombre: '',
            apellido: '',
            telefono: '',
        });
        const res = await fetchProveedores();
        setProveedores(res);
    }

    const handleDeleteClick = async (proveedor) => {
        try {
            await deleteProveedor(proveedor.id);
            // Refresh the proveedores list after delete
            const updatedProveedores = await fetchProveedores();
            setProveedores(updatedProveedores);
        } catch (error) {
            console.error('Error deleting proveedor:', error);
        }
    }

    return (
        <div>
            <h1>Proveedores</h1>

            {proveedores.map((proveedor) => (
                <div key={proveedor.id}>
                    <h2>ID: {proveedor.id}</h2>
                    <h2>Cedula: {proveedor.cedula}</h2>
                    <h2>Nombre: {proveedor.nombre}</h2>
                    <h2>Apellido: {proveedor.apellido}</h2>
                    <h2>Telefono: {proveedor.telefono}</h2>
                    <button className='buttonedit'onClick={() => handleEditClick(proveedor)}>Editar</button>
                    <button className='buttonedit delete-btn' onClick={() => handleDeleteClick(proveedor)}>Eliminar</button>
                    <hr />
                </div>
            ))}

            <Ingresar_Proveedor />

            {/* Edit Popup */}
            {isPopupOpen && (
                <div className="popup-overlay backdrop-blur-sm bg-black/30">
                    <div className="popup-content">
                        <h2>Editar Proveedor</h2>
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label>Cedula:</label>
                                <input
                                    type="text"
                                    name="cedula"
                                    value={formData.cedula}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
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
                                <label>Apellido:</label>
                                <input
                                    type="text"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Telefono:</label>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="button-group"> 
                                <button type="submit">Guardar cambios</button>
                                <button type="button" onClick={() => setIsPopupOpen(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Proveedores
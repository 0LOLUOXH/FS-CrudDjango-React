import { useEffect, useState } from 'react'
import { updateModelo, deleteModelo, fetchModelos } from '../api/modelo_api'
import { updateMarca, deleteMarca, fetchMarcas } from '../api/marca_api'
import { IngresarModelo, IngresarMarca } from '../components/ingresarmarcaymodelo'
import '../popup.css'

function MarcasyModelos() {
    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        nombre: '',
        marca: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [marcasData, modelosData] = await Promise.all([
                    fetchMarcas(),
                    fetchModelos()
                ]);
                setMarcas(marcasData);
                setModelos(modelosData);
            } catch (error) {
                setError('Error al cargar los datos');
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const handleDeleteClick = async (id, tipo) => { 
        if (!window.confirm('¿Estás seguro de eliminar este elemento?')) return;
        
        setIsLoading(true);
        try {
            if (tipo === 'marca') {
                await deleteMarca(id);
                const updatedMarcas = await fetchMarcas();
                setMarcas(updatedMarcas);
            } else {
                await deleteModelo(id);
                const updatedModelos = await fetchModelos();
                setModelos(updatedModelos);
            }
            setError(null);
        } catch (error) {
            setError('Error al eliminar el elemento');
            console.error('Error deleting:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateClick = (item, tipo) => {
        setEditingItem({ ...item, tipo });
        setFormData({
            id: item.id,
            nombre: item.nombre,
            marca: tipo === 'modelo' ? item.marca : ''
        });
        setIsPopupOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingItem.tipo === 'marca') {
                await updateMarca(editingItem.id, { nombre: formData.nombre });
                const updatedMarcas = await fetchMarcas();
                setMarcas(updatedMarcas);
            } else {
                await updateModelo(editingItem.id, { 
                    nombre: formData.nombre,
                    marca: formData.marca 
                });
                const updatedModelos = await fetchModelos();
                setModelos(updatedModelos);
            }
            setIsPopupOpen(false);
            setError(null);
        } catch (error) {
            setError('Error al actualizar el elemento');
            console.error('Error updating:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getMarcaNombre = (marcaId) => {
        const marca = marcas.find(m => m.id === marcaId);
        return marca ? marca.nombre : 'Desconocida';
    };

    if (isLoading) return <div>Cargando datos...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="marcas-modelos-container">
            <IngresarMarca />
            <IngresarModelo />

            <h1>Marcas y Modelos</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="section">
                <h2>Marcas</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {marcas.map(marca => (
                            <tr key={marca.id}>
                                <td>{marca.id}</td>
                                <td>{marca.nombre}</td>
                                <td className="actions">
                                    <button 
                                        onClick={() => handleUpdateClick(marca, 'marca')}
                                        className="edit-btn"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(marca.id, 'marca')}
                                        className="delete-btn"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="section">
                <h2>Modelos</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Marca</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modelos.map(modelo => (
                            <tr key={modelo.id}>
                                <td>{modelo.id}</td>
                                <td>{modelo.nombre}</td>
                                <td>{getMarcaNombre(modelo.marca)}</td>
                                <td className="actions">
                                    <button 
                                        onClick={() => handleUpdateClick(modelo, 'modelo')}
                                        className="edit-btn"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(modelo.id, 'modelo')}
                                        className="delete-btn"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Popup de edición */}
            {isPopupOpen && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Editar {editingItem.tipo === 'marca' ? 'Marca' : 'Modelo'}</h2>
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

                            {editingItem.tipo === 'modelo' && (
                                <div className="form-group">
                                    <label>Marca:</label>
                                    <select
                                        name="marca"
                                        value={formData.marca}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Seleccione una marca</option>
                                        {marcas.map(marca => (
                                            <option key={marca.id} value={marca.id}>
                                                {marca.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="button-group">
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="save-btn"
                                >
                                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setIsPopupOpen(false)}
                                    disabled={isLoading}
                                    className="cancel-btn"
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

export default MarcasyModelos
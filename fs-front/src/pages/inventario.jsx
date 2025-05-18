import { useEffect, useState } from 'react'
import { fetchProductos, updateProducto, deleteProducto } from '../api/producto_api'
import { fetchModelos } from '../api/modelo_api'
import { fetchMarcas } from '../api/marca_api'
import { fetchBodegas } from '../api/bodega_api'
import '../inventario.css'

function Inventario() {
    const [productos, setProductos] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [bodegas, setBodegas] = useState([]);
    const [editingProducto, setEditingProducto] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        cantidad: '',
        descripcion: '',
        modelo: '',
        bodega: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [productosRes, modelosRes, marcasRes, bodegasRes] = await Promise.all([
                    fetchProductos(),
                    fetchModelos(),
                    fetchMarcas(),
                    fetchBodegas()
                ]);
                setProductos(productosRes);
                setModelos(modelosRes);
                setMarcas(marcasRes);
                setBodegas(bodegasRes);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [])

    const handleEditClick = (producto) => {
        setEditingProducto(producto);
        setFormData({
            nombre: producto.nombre,
            cantidad: producto.cantidad,
            descripcion: producto.descripcion,
            modelo: producto.modeloandmarca,
            bodega: producto.codigobodega
        });
        setIsPopupOpen(true);
    }

    const handleDeleteClick = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
        
        setIsLoading(true);
        try {
            await deleteProducto(id);
            const updatedProductos = await fetchProductos();
            setProductos(updatedProductos);
        } catch (error) {
            setError('Error al eliminar el producto');
            console.error('Error deleting producto:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const productoData = {
                ...formData,
                cantidad: Number(formData.cantidad),
                modeloandmarca: Number(formData.modelo),
                codigobodega: Number(formData.bodega)
            };
            
            await updateProducto(editingProducto.id, productoData);
            const updatedProductos = await fetchProductos();
            setProductos(updatedProductos);
            setIsPopupOpen(false);
            setError(null);
        } catch (error) {
            setError('Error al actualizar el producto');
            console.error('Error updating producto:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const getMarcaNombre = (modeloId) => {
        const modelo = modelos.find(m => m.id === modeloId);
        if (!modelo) return 'Desconocida';
        const marca = marcas.find(m => m.id === modelo.marca);
        return marca ? marca.nombre : 'Desconocida';
    }

    const getModeloNombre = (modeloId) => {
        const modelo = modelos.find(m => m.id === modeloId);
        return modelo ? modelo.nombre : 'Desconocido';
    }

    const getBodegaNombre = (bodegaId) => {
        const bodega = bodegas.find(b => b.id === bodegaId);
        return bodega ? bodega.nombre : 'Desconocida';
    }

    if (isLoading) return <div className="loading">Cargando inventario...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="inventario-container">
            <h1>Inventario</h1>
            
            <div className="productos-grid">
                {productos.map((producto) => (
                    <div key={producto.id} className="producto-card">
                        <h2>{producto.nombre}</h2>
                        <p><strong>Cantidad:</strong> {producto.cantidad}</p>
                        <p><strong>Descripción:</strong> {producto.descripcion}</p>
                        <p><strong>Marca:</strong> {getMarcaNombre(producto.modelo)}</p>
                        <p><strong>Modelo:</strong> {getModeloNombre(producto.modelo)}</p>
                        <p><strong>Bodega:</strong> {getBodegaNombre(producto.codigobodega)}</p>
                        <div className="producto-actions">
                            <button 
                                onClick={() => handleEditClick(producto)}
                                className="edit-btn"
                            >
                                Editar
                            </button>
                            <button 
                                onClick={() => handleDeleteClick(producto.id)}
                                className="delete-btn"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Popup de edición */}
            {isPopupOpen && (
                <div className="popup-overlay backdrop-blur-sm bg-black/30">
                    <div className="popup-content">
                        <h2>Editar Producto</h2>
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
                                <label>Cantidad:</label>
                                <input
                                    type="number"
                                    name="cantidad"
                                    value={formData.cantidad}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Descripción:</label>
                                <textarea
                                    rows="3"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Modelo:</label>
                                <select
                                    name="modelo"
                                    value={formData.modelo}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione un modelo</option>
                                    {modelos.map(modelo => (
                                        <option key={modelo.id} value={modelo.id}>
                                            {getMarcaNombre(modelo.id)} - {modelo.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Bodega:</label>
                                <select
                                    name="bodega"
                                    value={formData.bodega}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione una bodega</option>
                                    {bodegas.map(bodega => (
                                        <option key={bodega.id} value={bodega.id}>
                                            {bodega.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

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

export default Inventario
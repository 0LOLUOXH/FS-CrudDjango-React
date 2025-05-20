import { useEffect, useState } from 'react';
import { fetchModelos } from '../api/modelo_api.js';
import { fetchMarcas } from '../api/marca_api.js';

export function ModeloSelect({ onModeloChange }) {
    const [modelos, setModelos] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [marcaSeleccionada, setMarcaSeleccionada] = useState('');
    const [modeloSeleccionado, setModeloSeleccionado] = useState('');

    useEffect(() => {
        async function cargarDatos() {
            try {
                const [modelosData, marcasData] = await Promise.all([
                    fetchModelos(),
                    fetchMarcas()
                ]);
                setModelos(modelosData);
                setMarcas(marcasData);
            } catch (error) {
                console.error('Error cargando datos:', error);
            }
        }
        cargarDatos();
    }, []);

    const handleMarcaChange = (e) => {
        const marcaId = e.target.value;
        setMarcaSeleccionada(marcaId);
        setModeloSeleccionado(''); // Resetear modelo al cambiar marca
    };

    const handleModeloChange = (e) => {
        const modeloId = e.target.value;
        setModeloSeleccionado(modeloId);
        if (onModeloChange) onModeloChange(modeloId); // Notificar al padre
    };

    // Filtrar modelos por marca seleccionada
    const modelosFiltrados = marcaSeleccionada 
        ? modelos.filter(modelo => modelo.marca.toString() === marcaSeleccionada)
        : [];

    return (
        <div className="modelo-selector">
            <div className="form-group">
                <label>Marca</label>
                <select 
                    name="marca" 
                    onChange={handleMarcaChange}
                    value={marcaSeleccionada}
                    className="form-control"
                >
                    <option value="">Seleccione una marca</option>
                    {marcas.map((marca) => (
                        <option key={`marca-${marca.id}`} value={marca.id}>
                            {marca.nombre}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Modelo</label>
                <select 
                    name="modelo" 
                    onChange={handleModeloChange}
                    value={modeloSeleccionado}
                    disabled={!marcaSeleccionada}
                    className="form-control"
                    required
                >
                    <option value="">
                        {marcaSeleccionada ? 'Seleccione un modelo' : 'Seleccione una marca primero'}
                    </option>
                    {modelosFiltrados.map((modelo) => (
                        <option key={`modelo-${modelo.id}`} value={modelo.id}>
                            {modelo.nombre}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
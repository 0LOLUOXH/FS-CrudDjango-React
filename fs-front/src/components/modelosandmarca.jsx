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
    <div className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Marca</label>
            <select 
                name="marca" 
                onChange={handleMarcaChange}
                value={marcaSeleccionada}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                <option value="">Seleccione una marca</option>
                {marcas.map((marca) => (
                    <option key={`marca-${marca.id}`} value={marca.id}>
                        {marca.nombre}
                    </option>
                ))}
            </select>
        </div>

        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Modelo</label>
            <select 
                name="modelo" 
                onChange={handleModeloChange}
                value={modeloSeleccionado}
                disabled={!marcaSeleccionada}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    !marcaSeleccionada ? 'bg-gray-100 text-gray-500' : ''
                }`}
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
);}
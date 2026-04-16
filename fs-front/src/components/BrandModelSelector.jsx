import { useEffect, useState } from 'react';
import { getAllModels, getAllBrands } from '../api/inventory_api.js';

export function BrandModelSelector({ onModelChange }) {
    const [models, setModels] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');

    useEffect(() => {
        async function loadData() {
            try {
                const [modelsRes, brandsRes] = await Promise.all([
                    getAllModels(),
                    getAllBrands()
                ]);
                setModels(modelsRes.data);
                setBrands(brandsRes.data);
            } catch (error) {
                console.error('Error cargando datos:', error);
            }
        }
        loadData();
    }, []);

    const handleBrandChange = (e) => {
        const brandId = e.target.value;
        setSelectedBrand(brandId);
        setSelectedModel('');
    };

    const handleModelChange = (e) => {
        const modelId = e.target.value;
        setSelectedModel(modelId);
        if (onModelChange) onModelChange(modelId);
    };

    const filteredModels = selectedBrand 
        ? models.filter(model => model.brand.toString() === selectedBrand)
        : [];

return (
    <div className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Marca</label>
            <select 
                name="brand" 
                onChange={handleBrandChange}
                value={selectedBrand}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                <option value="">Seleccione una marca</option>
                {brands.map((brand) => (
                    <option key={`brand-${brand.id}`} value={brand.id}>
                        {brand.name}
                    </option>
                ))}
            </select>
        </div>

        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Modelo</label>
            <select 
                name="model" 
                onChange={handleModelChange}
                value={selectedModel}
                disabled={!selectedBrand}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    !selectedBrand ? 'bg-gray-100 text-gray-500' : ''
                }`}
                required
            >
                <option value="">
                    {selectedBrand ? 'Seleccione un modelo' : 'Seleccione una marca primero'}
                </option>
                {filteredModels.map((model) => (
                    <option key={`model-${model.id}`} value={model.id}>
                        {model.name}
                    </option>
                ))}
            </select>
        </div>
    </div>
);}
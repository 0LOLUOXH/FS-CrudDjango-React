import { useEffect, useState } from 'react';
import { getAllModels, getAllBrands } from '../api/inventory_api.js';

export function BrandModelSelector({ onModelChange, defaultValue, className = "" }) {
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

    useEffect(() => {
        if (defaultValue && models.length > 0) {
            const foundModel = models.find(m => m.id === parseInt(defaultValue, 10) || m.id === defaultValue);
            if (foundModel) {
                setSelectedBrand(foundModel.brand.toString());
                setSelectedModel(foundModel.id.toString());
            }
        } else if (!defaultValue) {
            setSelectedBrand('');
            setSelectedModel('');
        }
    }, [defaultValue, models]);

    const handleBrandChange = (e) => {
        const brandId = e.target.value;
        setSelectedBrand(brandId);
        setSelectedModel('');
        if (onModelChange) onModelChange('');
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
        <div className={`space-y-4 ${className}`}>
            <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Marca *
                </label>
                <select 
                    name="brand" 
                    onChange={handleBrandChange}
                    value={selectedBrand}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                    required
                >
                    <option value="">Seleccione una marca</option>
                    {brands.map((brand) => (
                        <option key={`brand-${brand.id}`} value={brand.id}>
                            {brand.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Modelo *
                </label>
                <select 
                    name="model" 
                    onChange={handleModelChange}
                    value={selectedModel}
                    disabled={!selectedBrand}
                    className={`w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all ${
                        !selectedBrand ? 'opacity-60 cursor-not-allowed' : ''
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
    );
}
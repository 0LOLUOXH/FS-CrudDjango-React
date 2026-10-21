import React, { useEffect, useState, useMemo } from 'react';
import {
  getAllBrands,
  createBrand,
  updateBrand,
  getAllModels,
  createModel,
  updateModel
} from '../../../api/inventory_api';
import { GlassCard, Modal, FloatingInput, FloatingSelect, Badge } from '../../../components/ui';
import { toast } from 'react-toastify';

export default function BrandModelManagementPage() {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ id: null, name: '', brand: '' });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [mode, setMode] = useState('brand'); // 'brand' | 'model'
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [brandsRes, modelsRes] = await Promise.all([getAllBrands(), getAllModels()]);
      setBrands(brandsRes.data || []);
      setModels(modelsRes.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al cargar marcas y modelos');
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setFormData({ id: null, name: '', brand: mode === 'model' && brands.length > 0 ? brands[0].id : '' });
    setShowForm(true);
  };

  const handleCreateModel = async e => {
    e.preventDefault();
    if (!formData.name.trim() || (mode === 'model' && !formData.brand)) return;
    setIsLoading(true);
    try {
      if (mode === 'brand') {
        await createBrand({ name: formData.name.trim() });
        const res = await getAllBrands();
        setBrands(res.data);
        toast.success(`Marca "${formData.name}" creada con éxito`);
      } else {
        await createModel({ name: formData.name.trim(), brand: parseInt(formData.brand, 10) });
        const res = await getAllModels();
        setModels(res.data);
        toast.success(`Modelo "${formData.name}" creado con éxito`);
      }
      setFormData({ id: null, name: '', brand: '' });
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Error al crear el registro';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setFormData({
      id: item.id,
      name: item.name,
      brand: type === 'model' ? item.brand : ''
    });
    setIsPopupOpen(true);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitEdit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingItem.type === 'brand') {
        await updateBrand(formData.id, { name: formData.name.trim() });
        const res = await getAllBrands();
        setBrands(res.data);
        toast.success("Marca actualizada exitosamente");
      } else {
        await updateModel(formData.id, {
          name: formData.name.trim(),
          brand: parseInt(formData.brand, 10)
        });
        const res = await getAllModels();
        setModels(res.data);
        toast.success("Modelo actualizado exitosamente");
      }
      setIsPopupOpen(false);
      setError(null);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Error al actualizar el registro';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getBrandName = id => {
    const m = brands.find(x => x.id === id);
    return m ? m.name : '—';
  };

  // Filtrado de tablas
  const filteredBrands = useMemo(() => {
    return brands.filter(b => (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [brands, searchTerm]);

  const filteredModels = useMemo(() => {
    return models.filter(m => {
      const modelName = (m.name || '').toLowerCase();
      const brandName = (getBrandName(m.brand) || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      return modelName.includes(term) || brandName.includes(term);
    });
  }, [models, brands, searchTerm]);

  // Contar modelos por marca
  const getModelCountForBrand = brandId => {
    return models.filter(m => m.brand === brandId).length;
  };

  return (
    <div className="w-full p-4 lg:p-6 space-y-6">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] flex items-center gap-2.5">
            <i className="fa-solid fa-tags text-[var(--primary)]"></i>
            Clasificación: Marcas y Modelos
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Estructura técnica de catálogo para clasificación y compatibilidad de productos
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary shadow-lg shadow-[var(--primary)]/20"
        >
          <i className="fa-solid fa-plus mr-1.5"></i>
          {mode === 'brand' ? 'Nueva Marca' : 'Nuevo Modelo'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-award"></i>
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Marcas Registradas</span>
            <h3 className="text-2xl font-bold text-[var(--text-main)] mt-0.5">{brands.length}</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-microchip"></i>
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Modelos Registrados</span>
            <h3 className="text-2xl font-bold text-[var(--text-main)] mt-0.5">{models.length}</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-layer-group"></i>
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Promedio Modelos / Marca</span>
            <h3 className="text-2xl font-bold text-emerald-500 mt-0.5">
              {brands.length > 0 ? (models.length / brands.length).toFixed(1) : '0'}
            </h3>
          </div>
        </GlassCard>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-3">
          <i className="fa-solid fa-circle-exclamation text-lg"></i>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Main GlassCard Container */}
      <GlassCard className="overflow-hidden p-4 sm:p-6 space-y-4">
        {/* Controles de Navegación y Búsqueda */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Pestañas de Selección */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-glass)] w-full sm:w-auto">
            <button
              type="button"
              onClick={() => { setMode('brand'); setSearchTerm(''); }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === 'brand'
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <i className="fa-solid fa-award text-xs"></i>
              Marcas ({brands.length})
            </button>
            <button
              type="button"
              onClick={() => { setMode('model'); setSearchTerm(''); }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === 'model'
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <i className="fa-solid fa-microchip text-xs"></i>
              Modelos ({models.length})
            </button>
          </div>

          {/* Barra de Búsqueda */}
          <div className="relative w-full sm:w-80">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm"></i>
            <input
              type="text"
              placeholder={`Buscar en ${mode === 'brand' ? 'marcas' : 'modelos'}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-main)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all"
            />
          </div>
        </div>

        {/* Tabla según el Modo Activo */}
        {mode === 'brand' ? (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th className="w-24">ID</th>
                  <th>Nombre de la Marca</th>
                  <th>Modelos Vinculados</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && brands.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <i className="fa-solid fa-spinner fa-spin text-2xl text-[var(--primary)]"></i>
                      <p className="text-sm text-[var(--text-muted)] mt-2">Cargando marcas...</p>
                    </td>
                  </tr>
                ) : filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-[var(--text-muted)]">
                      <i className="fa-solid fa-award text-3xl mb-2 opacity-50 block"></i>
                      No se encontraron marcas registradas
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map(b => {
                    const count = getModelCountForBrand(b.id);
                    return (
                      <tr key={b.id}>
                        <td>
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-glass)]">
                            #{b.id}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-sm shrink-0">
                              <i className="fa-solid fa-award"></i>
                            </div>
                            <span className="font-semibold text-[var(--text-main)]">{b.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg-card-subtle)] border border-[var(--border-glass)] text-[var(--text-muted)]">
                            <i className="fa-solid fa-microchip text-[10px] text-[var(--primary)]"></i>
                            {count} {count === 1 ? 'modelo' : 'modelos'}
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => handleEdit(b, 'brand')}
                            className="btn btn-icon p-2 text-amber-500 hover:bg-amber-500/15 rounded-lg transition-colors"
                            title="Editar marca"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th className="w-24">ID</th>
                  <th>Nombre del Modelo</th>
                  <th>Marca Perteneciente</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && models.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <i className="fa-solid fa-spinner fa-spin text-2xl text-[var(--primary)]"></i>
                      <p className="text-sm text-[var(--text-muted)] mt-2">Cargando modelos...</p>
                    </td>
                  </tr>
                ) : filteredModels.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-[var(--text-muted)]">
                      <i className="fa-solid fa-microchip text-3xl mb-2 opacity-50 block"></i>
                      No se encontraron modelos registrados
                    </td>
                  </tr>
                ) : (
                  filteredModels.map(m => (
                    <tr key={m.id}>
                      <td>
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-glass)]">
                          #{m.id}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center text-sm shrink-0">
                            <i className="fa-solid fa-microchip"></i>
                          </div>
                          <span className="font-semibold text-[var(--text-main)]">{m.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <i className="fa-solid fa-award text-[10px]"></i>
                          {getBrandName(m.brand)}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleEdit(m, 'model')}
                          className="btn btn-icon p-2 text-amber-500 hover:bg-amber-500/15 rounded-lg transition-colors"
                          title="Editar modelo"
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
        )}
      </GlassCard>

      {/* Modal para Crear Marca / Modelo */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={mode === 'brand' ? 'Crear Nueva Marca' : 'Crear Nuevo Modelo'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateModel} className="space-y-4">
          <FloatingInput
            label={mode === 'brand' ? 'Nombre de la Marca' : 'Nombre del Modelo'}
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            icon={<i className={`fa-solid ${mode === 'brand' ? 'fa-award' : 'fa-microchip'} text-sm`}></i>}
          />

          {mode === 'model' && (
            <FloatingSelect
              label="Marca Asociada"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              required
              icon={<i className="fa-solid fa-award text-sm"></i>}
            >
              <option value="">Seleccione una marca</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </FloatingSelect>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-glass)]">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-1.5"></i>
                  Creando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-plus mr-1.5"></i>
                  Crear {mode === 'brand' ? 'Marca' : 'Modelo'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal para Editar Marca / Modelo */}
      <Modal
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title={editingItem?.type === 'brand' ? `Editar Marca #${formData.id}` : `Editar Modelo #${formData.id}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <FloatingInput
            label={editingItem?.type === 'brand' ? 'Nombre de la Marca' : 'Nombre del Modelo'}
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            icon={<i className={`fa-solid ${editingItem?.type === 'brand' ? 'fa-award' : 'fa-microchip'} text-sm`}></i>}
          />

          {editingItem?.type === 'model' && (
            <FloatingSelect
              label="Marca Asociada"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              required
              icon={<i className="fa-solid fa-award text-sm"></i>}
            >
              <option value="">Seleccione una marca</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </FloatingSelect>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-glass)]">
            <button
              type="button"
              onClick={() => setIsPopupOpen(false)}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-1.5"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk mr-1.5"></i>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

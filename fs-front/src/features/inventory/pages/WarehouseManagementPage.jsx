import React, { useEffect, useState, useMemo } from 'react';
import {
  getAllWarehouses,
  createWarehouse,
  updateWarehouse
} from '../../../api/inventory_api';
import { getAllUser } from '../../../api/auth_api';
import { GlassCard, Modal, FloatingInput, FloatingSelect, Badge } from '../../../components/ui';
import { toast } from 'react-toastify';

export default function WarehouseManagementPage() {
  // Estados
  const [warehouses, setWarehouses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    is_active: true,
    manager: ''
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

  // Carga inicial
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [warehousesRes, employeesRes] = await Promise.all([
        getAllWarehouses(),
        getAllUser()
      ]);
      setWarehouses(warehousesRes.data || []);
      setEmployees(employeesRes.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error cargando información de bodegas');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear o editar
  const openModal = (warehouse = null) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setFormData({
        name: warehouse.name || '',
        capacity: warehouse.capacity !== undefined ? warehouse.capacity : '',
        is_active: warehouse.is_active !== undefined ? warehouse.is_active : true,
        manager: warehouse.manager || ''
      });
    } else {
      setFormData({
        name: '',
        capacity: '',
        is_active: true,
        manager: ''
      });
      setEditingWarehouse(null);
    }
    setError(null);
    setIsModalOpen(true);
  };

  // Cambios en inputs
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity, 10),
        manager: formData.manager === '' ? null : parseInt(formData.manager, 10)
      };

      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse.id, payload);
        toast.success("Bodega actualizada exitosamente");
      } else {
        await createWarehouse(payload);
        toast.success("Bodega creada exitosamente");
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Error al guardar la bodega';
      setError(`Error: ${errMsg}`);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(w => {
      const matchesSearch = (w.name || '').toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter === 'active') return w.is_active;
      if (statusFilter === 'inactive') return !w.is_active;
      return true;
    });
  }, [warehouses, search, statusFilter]);

  // Métricas rápidas
  const totalCapacity = useMemo(() => {
    return warehouses.reduce((acc, w) => acc + (parseInt(w.capacity, 10) || 0), 0);
  }, [warehouses]);

  const activeCount = useMemo(() => {
    return warehouses.filter(w => w.is_active).length;
  }, [warehouses]);

  const inactiveCount = useMemo(() => {
    return warehouses.filter(w => !w.is_active).length;
  }, [warehouses]);

  return (
    <div className="w-full p-4 lg:p-6 space-y-6">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] flex items-center gap-2.5">
            <i className="fa-solid fa-warehouse text-[var(--primary)]"></i>
            Gestión de Bodegas
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Administración de almacenes, capacidades físicas y encargados de inventario
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="btn btn-primary shadow-lg shadow-[var(--primary)]/20"
        >
          <i className="fa-solid fa-plus mr-1.5"></i>
          Nueva Bodega
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-warehouse"></i>
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total Bodegas</span>
            <h3 className="text-2xl font-bold text-[var(--text-main)] mt-0.5">{warehouses.length}</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Bodegas Activas</span>
            <h3 className="text-2xl font-bold text-emerald-500 mt-0.5">{activeCount}</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-circle-xmark"></i>
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Bodegas Inactivas</span>
            <h3 className="text-2xl font-bold text-rose-500 mt-0.5">{inactiveCount}</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-cubes"></i>
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Capacidad Total</span>
            <h3 className="text-2xl font-bold text-[var(--text-main)] mt-0.5">
              {totalCapacity.toLocaleString()} <span className="text-xs font-normal text-[var(--text-muted)]">un.</span>
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

      {/* Contenedor Principal de la Tabla */}
      <GlassCard className="overflow-hidden p-4 sm:p-6 space-y-4">
        {/* Barra de Filtros y Búsqueda */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm"></i>
            <input
              type="text"
              placeholder="Buscar bodega por nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-main)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-glass)] w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Todas ({warehouses.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-emerald-500'
              }`}
            >
              Activas ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'inactive'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-rose-500'
              }`}
            >
              Inactivas ({inactiveCount})
            </button>
          </div>
        </div>

        {/* Tabla Responsiva */}
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th className="w-20">ID</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Capacidad Máxima</th>
                <th>Encargado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && warehouses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <i className="fa-solid fa-spinner fa-spin text-2xl text-[var(--primary)]"></i>
                    <p className="text-sm text-[var(--text-muted)] mt-2">Cargando bodegas...</p>
                  </td>
                </tr>
              ) : filteredWarehouses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-[var(--text-muted)]">
                    <i className="fa-solid fa-box-open text-3xl mb-2 opacity-50 block"></i>
                    No se encontraron bodegas que coincidan con el criterio
                  </td>
                </tr>
              ) : (
                filteredWarehouses.map(warehouse => {
                  const employee = employees.find(e => e.id === warehouse.manager);
                  return (
                    <tr 
                      key={warehouse.id}
                      className={!warehouse.is_active ? 'opacity-70' : ''}
                    >
                      <td>
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-glass)]">
                          #{warehouse.id}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm shrink-0">
                            <i className="fa-solid fa-warehouse"></i>
                          </div>
                          <span className="font-semibold text-[var(--text-main)]">
                            {warehouse.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge variant={warehouse.is_active ? 'success' : 'danger'}>
                          <i className={`fa-solid ${warehouse.is_active ? 'fa-circle-check' : 'fa-circle-xmark'} mr-1 text-[10px]`}></i>
                          {warehouse.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-boxes-stacked text-xs text-[var(--text-muted)]"></i>
                          <span className="font-medium text-[var(--text-main)]">
                            {warehouse.capacity?.toLocaleString() || 0}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">unidades</span>
                        </div>
                      </td>
                      <td>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-glass)] text-xs text-[var(--text-main)]">
                          <i className="fa-solid fa-user-tie text-[var(--primary)] opacity-80"></i>
                          <span>{employee?.username || 'Sin asignar'}</span>
                        </div>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => openModal(warehouse)}
                          className="btn btn-icon p-2 text-amber-500 hover:bg-amber-500/15 rounded-lg transition-colors"
                          title="Editar bodega"
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
      </GlassCard>

      {/* Modal Reutilizable de Creación/Edición */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarehouse ? `Editar Bodega #${editingWarehouse.id}` : 'Nueva Bodega'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            label="Nombre de la Bodega"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            icon={<i className="fa-solid fa-warehouse text-sm"></i>}
          />

          <FloatingInput
            label="Capacidad Máxima (unidades)"
            type="number"
            min="1"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            icon={<i className="fa-solid fa-cubes text-sm"></i>}
          />

          <FloatingSelect
            label="Encargado Responsable"
            name="manager"
            value={formData.manager}
            onChange={handleChange}
            icon={<i className="fa-solid fa-user-tie text-sm"></i>}
          >
            <option value="">Seleccione un empleado (opcional)</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.username} {emp.email ? `(${emp.email})` : ''}
              </option>
            ))}
          </FloatingSelect>

          {/* Toggle de Estado */}
          <div className="p-3.5 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="is_active" className="text-sm font-semibold text-[var(--text-main)] cursor-pointer">
                Bodega Operativa / Activa
              </label>
              <p className="text-xs text-[var(--text-muted)]">
                Permite la recepción y despacho de productos en esta ubicación
              </p>
            </div>
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-5 h-5 rounded text-[var(--primary)] focus:ring-[var(--primary)] border-[var(--border-glass)] cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-glass)]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-1.5"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk mr-1.5"></i>
                  {editingWarehouse ? 'Actualizar Bodega' : 'Crear Bodega'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

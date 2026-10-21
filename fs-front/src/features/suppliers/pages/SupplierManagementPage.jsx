import React, { useEffect, useState } from "react";
import {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
} from "../../../api/suppliers_api";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";

export default function SupplierManagementPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    ruc: "",
    company_name: "",
    representative: "",
    email: "",
    phone: "",
    is_active: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    setIsLoading(true);
    try {
      const res = await getAllSuppliers();
      setSuppliers(res.data || []);
      setError(null);
    } catch (err) {
      setError("Error cargando proveedores");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        id: supplier.id,
        ruc: supplier.tax_id,
        company_name: supplier.company_name,
        representative: supplier.representative || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        is_active: supplier.is_active,
      });
    } else {
      setFormData({
        ruc: "",
        company_name: "",
        representative: "",
        email: "",
        phone: "",
        is_active: true,
      });
      setEditingSupplier(null);
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supplierData = {
        tax_id: formData.ruc,
        company_name: formData.company_name,
        representative: formData.representative,
        email: formData.email,
        phone: formData.phone,
        is_active: formData.is_active,
      };

      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierData);
      } else {
        await createSupplier(supplierData);
      }

      await loadSuppliers();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error:", err);
      setError(
        `Error: ${
          err.response?.data?.message || err.message || "Error al guardar proveedor"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSuppliers = suppliers
    .filter((p) => {
      if (statusFilter === "active") return p.is_active;
      if (statusFilter === "inactive") return !p.is_active;
      return true;
    })
    .filter(
      (p) =>
        p.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.tax_id?.includes(search) ||
        p.representative?.toLowerCase().includes(search.toLowerCase()) ||
        p.phone?.includes(search) ||
        p.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.company_name.localeCompare(b.company_name));

  return (
    <div className="space-y-6 animate-[fadeUp_0.4s_var(--ease-bounce)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
            <i className="fa-solid fa-truck text-[var(--primary)]"></i>
            Gestión de Proveedores
          </h1>
          <p className="text-sm text-[var(--text-sec)] mt-1">
            Directorio y administración de proveedores de componentes y suministros solares.
          </p>
        </div>

        <button onClick={() => openModal()} className="btn btn-primary">
          <i className="fa-solid fa-plus"></i>
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="float-group max-w-md !mb-0">
          <input
            type="text"
            id="search-supplier"
            placeholder=" "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="has-val"
          />
          <label htmlFor="search-supplier">
            <i className="fa-solid fa-magnifying-glass mr-2"></i>
            Buscar por razón social, RUC, contacto o teléfono...
          </label>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`btn text-xs py-1.5 px-3 rounded-lg ${
              statusFilter === "all" ? "btn-primary" : "btn-outline"
            }`}
          >
            Todos ({suppliers.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`btn text-xs py-1.5 px-3 rounded-lg ${
              statusFilter === "active" ? "btn-primary" : "btn-outline"
            }`}
          >
            Activos ({suppliers.filter((s) => s.is_active).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            className={`btn text-xs py-1.5 px-3 rounded-lg ${
              statusFilter === "inactive" ? "btn-primary" : "btn-outline"
            }`}
          >
            Inactivos ({suppliers.filter((s) => !s.is_active).length})
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-responsive glass-card !p-0 overflow-hidden">
        <table className="table-custom">
          <thead>
            <tr>
              <th>ID</th>
              <th>RUC / Identificación</th>
              <th>Proveedor (Razón Social)</th>
              <th>Contacto / Representante</th>
              <th>Teléfono</th>
              <th>Correo Electrónico</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((p) => (
              <tr
                key={p.id}
                className={p.is_active ? "state-completed" : "state-pending"}
              >
                <td>
                  <strong>#{p.id}</strong>
                </td>
                <td>
                  <span className="font-mono text-xs bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded">
                    {p.tax_id}
                  </span>
                </td>
                <td>
                  <span className="font-semibold text-[var(--text-main)]">
                    {p.company_name}
                  </span>
                </td>
                <td>
                  <span className="text-sm text-[var(--text-sec)]">
                    {p.representative || "—"}
                  </span>
                </td>
                <td>
                  <span className="text-sm text-[var(--text-main)] flex items-center gap-1.5">
                    <i className="fa-solid fa-phone text-xs text-[var(--text-sec)]"></i>
                    {p.phone}
                  </span>
                </td>
                <td>
                  {p.email ? (
                    <span className="text-sm text-[var(--text-main)] flex items-center gap-1.5">
                      <i className="fa-regular fa-envelope text-[var(--primary)] text-xs"></i>
                      {p.email}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--text-sec)]">—</span>
                  )}
                </td>
                <td>
                  {p.is_active ? (
                    <Badge color="green">
                      <i className="fa-solid fa-circle-check text-xs mr-1"></i>
                      Activo
                    </Badge>
                  ) : (
                    <Badge color="red">
                      <i className="fa-solid fa-circle-xmark text-xs mr-1"></i>
                      Inactivo
                    </Badge>
                  )}
                </td>
                <td className="text-right">
                  <button
                    onClick={() => openModal(p)}
                    className="btn-icon"
                    title="Editar proveedor"
                    aria-label={`Editar proveedor ${p.company_name}`}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </td>
              </tr>
            ))}

            {filteredSuppliers.length === 0 && !isLoading && (
              <tr>
                <td colSpan="8" className="py-12 text-center text-[var(--text-sec)]">
                  <i className="fa-solid fa-truck-ramp-box text-3xl mb-3 block opacity-40"></i>
                  No se encontraron proveedores que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? "Editar Proveedor" : "Registrar Nuevo Proveedor"}
        maxWidth="520px"
      >
        {error && (
          <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-sm"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="float-group">
              <input
                type="text"
                id="field-ruc"
                name="ruc"
                placeholder=" "
                value={formData.ruc}
                onChange={handleChange}
                required
              />
              <label htmlFor="field-ruc">RUC / Identificación Fiscal</label>
            </div>

            <div className="float-group">
              <input
                type="text"
                id="field-company-name"
                name="company_name"
                placeholder=" "
                value={formData.company_name}
                onChange={handleChange}
                required
              />
              <label htmlFor="field-company-name">Razón Social</label>
            </div>
          </div>

          <div className="float-group">
            <input
              type="text"
              id="field-representative"
              name="representative"
              placeholder=" "
              value={formData.representative}
              onChange={handleChange}
            />
            <label htmlFor="field-representative">Contacto / Representante</label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="float-group">
              <input
                type="tel"
                id="field-supplier-phone"
                name="phone"
                placeholder=" "
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <label htmlFor="field-supplier-phone">Teléfono</label>
            </div>

            <div className="float-group">
              <input
                type="email"
                id="field-supplier-email"
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
              />
              <label htmlFor="field-supplier-email">Correo Electrónico</label>
            </div>
          </div>

          {/* Estado Activo */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-main)]">
            <input
              type="checkbox"
              id="field-supplier-isactive"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)] accent-[var(--primary)] cursor-pointer"
            />
            <label
              htmlFor="field-supplier-isactive"
              className="text-sm font-medium text-[var(--text-main)] cursor-pointer"
            >
              Proveedor Activo para Compras
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end items-center gap-3 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i>
                  <span>Guardar Proveedor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import {
  getAllIndividualCustomers,
  getAllCorporateCustomers,
  updateIndividualCustomer,
  updateCorporateCustomer,
  updateCustomer,
  createCustomer,
  createIndividualCustomer,
  createCorporateCustomer,
} from "../../../api/customers_api";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";

export default function CustomerManagementPage() {
  const [individuals, setIndividuals] = useState([]);
  const [corporates, setCorporates] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [formData, setFormData] = useState({
    type: "Individual",
    first_name: "",
    last_name: "",
    identity_card: "",
    phone: "",
    email: "",
    is_active: true,
    company_name: "",
    tax_id: "",
    representative: "",
  });
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const [indRes, corpRes] = await Promise.all([
        getAllIndividualCustomers(),
        getAllCorporateCustomers(),
      ]);
      setIndividuals(indRes.data || []);
      setCorporates(corpRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar clientes");
    } finally {
      setIsLoading(false);
    }
  };

  const allClients = [
    ...individuals.map((c) => ({
      type: "Individual",
      id: c.customer,
      name: c.first_name,
      lastName: c.last_name,
      document: c.identity_card,
      email: c.email,
      phone: c.phone || "",
      is_active: c.is_active,
      representative: "",
    })),
    ...corporates.map((c) => ({
      type: "Corporate",
      id: c.customer,
      name: c.company_name,
      document: c.tax_id,
      email: c.email,
      phone: c.phone || "",
      is_active: c.is_active,
      representative: c.representative,
    })),
  ]
    .filter((c) => {
      if (filterType === "all") return true;
      return c.type === filterType;
    })
    .filter(
      (c) =>
        (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.document || "").includes(search) ||
        (c.representative &&
          c.representative.toLowerCase().includes(search.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );

  const openModal = (customer = null) => {
    if (customer) {
      setEditing(customer);
      if (customer.type === "Individual") {
        setFormData({
          type: "Individual",
          first_name: customer.name || "",
          last_name: customer.lastName || "",
          identity_card: customer.document || "",
          phone: customer.phone || "",
          email: customer.email || "",
          is_active: customer.is_active,
          company_name: "",
          tax_id: "",
          representative: "",
        });
      } else {
        setFormData({
          type: "Corporate",
          first_name: "",
          last_name: "",
          identity_card: "",
          phone: customer.phone || "",
          email: customer.email || "",
          is_active: customer.is_active,
          company_name: customer.name || "",
          tax_id: customer.document || "",
          representative: customer.representative || "",
        });
      }
      setIsCreating(false);
    } else {
      setFormData({
        type: "Individual",
        first_name: "",
        last_name: "",
        identity_card: "",
        phone: "",
        email: "",
        is_active: true,
        company_name: "",
        tax_id: "",
        representative: "",
      });
      setEditing(null);
      setIsCreating(true);
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((d) => ({
      ...d,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isCreating) {
        const customerRes = await createCustomer({
          phone: formData.phone,
          customer_type: formData.type === "Individual" ? "I" : "C",
        });

        if (formData.type === "Individual") {
          await createIndividualCustomer({
            first_name: formData.first_name,
            last_name: formData.last_name,
            identity_card: formData.identity_card,
            customer: customerRes.data.id,
            email: formData.email,
            is_active: formData.is_active,
          });
        } else {
          await createCorporateCustomer({
            company_name: formData.company_name,
            tax_id: formData.tax_id,
            customer: customerRes.data.id,
            email: formData.email,
            is_active: formData.is_active,
            representative: formData.representative,
          });
        }
      } else {
        if (formData.type === "Individual") {
          await updateCustomer(editing.id, {
            phone: formData.phone,
            customer_type: "I",
          });

          await updateIndividualCustomer(editing.id, {
            first_name: formData.first_name,
            last_name: formData.last_name,
            identity_card: formData.identity_card,
            customer: editing.id,
            email: formData.email,
            is_active: formData.is_active,
          });
        } else {
          await updateCustomer(editing.id, {
            phone: formData.phone,
            customer_type: "C",
          });

          await updateCorporateCustomer(editing.id, {
            company_name: formData.company_name,
            tax_id: formData.tax_id,
            customer: editing.id,
            email: formData.email,
            is_active: formData.is_active,
            representative: formData.representative,
          });
        }
      }

      await loadCustomers();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error completo:", {
        message: err.message,
        response: err.response,
        request: err.request,
        config: err.config,
      });
      setError(
        `Error: ${
          err.response?.data?.message || err.message || "Verifica los datos"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeUp_0.4s_var(--ease-bounce)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
            <i className="fa-solid fa-users text-[var(--primary)]"></i>
            Gestión de Clientes
          </h1>
          <p className="text-sm text-[var(--text-sec)] mt-1">
            Directorio y administración de clientes naturales y jurídicos (B2B).
          </p>
        </div>

        <button onClick={() => openModal()} className="btn btn-primary">
          <i className="fa-solid fa-user-plus"></i>
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input with floating label */}
        <div className="float-group max-w-md !mb-0">
          <input
            type="text"
            id="search-client"
            placeholder=" "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="has-val"
          />
          <label htmlFor="search-client">
            <i className="fa-solid fa-magnifying-glass mr-2"></i>
            Buscar por nombre, documento, correo o representante...
          </label>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`btn text-xs py-1.5 px-3 rounded-lg ${
              filterType === "all" ? "btn-primary" : "btn-outline"
            }`}
          >
            Todos ({individuals.length + corporates.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("Individual")}
            className={`btn text-xs py-1.5 px-3 rounded-lg ${
              filterType === "Individual" ? "btn-primary" : "btn-outline"
            }`}
          >
            Naturales ({individuals.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("Corporate")}
            className={`btn text-xs py-1.5 px-3 rounded-lg ${
              filterType === "Corporate" ? "btn-primary" : "btn-outline"
            }`}
          >
            Jurídicos ({corporates.length})
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-responsive glass-card !p-0 overflow-hidden">
        <table className="table-custom">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Nombre / Razón Social</th>
              <th>Identificación</th>
              <th>Contacto</th>
              <th>Representante</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {allClients.map((c) => (
              <tr
                key={`${c.type}-${c.id}`}
                className={c.is_active ? "state-completed" : "state-pending"}
              >
                <td>
                  <strong>#{c.id}</strong>
                </td>
                <td>
                  {c.type === "Individual" ? (
                    <Badge color="orange">
                      <i className="fa-solid fa-user text-xs mr-1"></i>
                      Natural
                    </Badge>
                  ) : (
                    <Badge color="yellow">
                      <i className="fa-solid fa-building text-xs mr-1"></i>
                      Jurídico
                    </Badge>
                  )}
                </td>
                <td>
                  <span className="font-semibold text-[var(--text-main)]">
                    {c.type === "Individual"
                      ? `${c.name} ${c.lastName || ""}`
                      : c.name}
                  </span>
                </td>
                <td>
                  <span className="font-mono text-xs bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded">
                    {c.document || "N/A"}
                  </span>
                </td>
                <td>
                  <div className="text-xs">
                    {c.email && (
                      <p className="flex items-center gap-1.5 text-[var(--text-main)]">
                        <i className="fa-regular fa-envelope text-[var(--primary)]"></i>
                        {c.email}
                      </p>
                    )}
                    {c.phone && (
                      <p className="flex items-center gap-1.5 text-[var(--text-sec)] mt-0.5">
                        <i className="fa-solid fa-phone text-xs"></i>
                        {c.phone}
                      </p>
                    )}
                  </div>
                </td>
                <td>
                  <span className="text-sm text-[var(--text-sec)]">
                    {c.type === "Corporate" && c.representative
                      ? c.representative
                      : "—"}
                  </span>
                </td>
                <td>
                  {c.is_active ? (
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
                    onClick={() => openModal(c)}
                    className="btn-icon"
                    title="Editar cliente"
                    aria-label={`Editar cliente ${c.name}`}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </td>
              </tr>
            ))}

            {allClients.length === 0 && !isLoading && (
              <tr>
                <td colSpan="8" className="py-12 text-center text-[var(--text-sec)]">
                  <i className="fa-solid fa-users-slash text-3xl mb-3 block text-[var(--text-sec)] opacity-40"></i>
                  No se encontraron clientes registrados con ese criterio.
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
        title={isCreating ? "Registrar Nuevo Cliente" : "Editar Datos del Cliente"}
        maxWidth="540px"
      >
        {error && (
          <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-sm"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de cliente */}
          <div className="float-group">
            <select
              name="type"
              id="field-type"
              value={formData.type}
              onChange={handleChange}
              disabled={!isCreating}
              className="has-val"
            >
              <option value="Individual">Persona Natural</option>
              <option value="Corporate">Persona Jurídica (Empresa)</option>
            </select>
            <label htmlFor="field-type">Tipo de Cliente</label>
          </div>

          {/* Formulario Dinámico según Tipo */}
          {formData.type === "Individual" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="float-group">
                <input
                  type="text"
                  id="field-firstname"
                  name="first_name"
                  placeholder=" "
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="field-firstname">Nombre</label>
              </div>

              <div className="float-group">
                <input
                  type="text"
                  id="field-lastname"
                  name="last_name"
                  placeholder=" "
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="field-lastname">Apellido</label>
              </div>

              <div className="float-group sm:col-span-2">
                <input
                  type="text"
                  id="field-identity"
                  name="identity_card"
                  placeholder=" "
                  value={formData.identity_card}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="field-identity">Cédula de Identidad</label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="float-group">
                <input
                  type="text"
                  id="field-company"
                  name="company_name"
                  placeholder=" "
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="field-company">Razón Social de la Empresa</label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="float-group">
                  <input
                    type="text"
                    id="field-taxid"
                    name="tax_id"
                    placeholder=" "
                    value={formData.tax_id}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="field-taxid">RUC / Identificación Fiscal</label>
                </div>

                <div className="float-group">
                  <input
                    type="text"
                    id="field-representative"
                    name="representative"
                    placeholder=" "
                    value={formData.representative}
                    onChange={handleChange}
                    required={formData.type === "Corporate"}
                  />
                  <label htmlFor="field-representative">Representante Legal</label>
                </div>
              </div>
            </div>
          )}

          {/* Contacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="float-group">
              <input
                type="tel"
                id="field-phone"
                name="phone"
                placeholder=" "
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <label htmlFor="field-phone">Teléfono / Celular</label>
            </div>

            <div className="float-group">
              <input
                type="email"
                id="field-email"
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
              />
              <label htmlFor="field-email">Correo Electrónico</label>
            </div>
          </div>

          {/* Activo / Inactivo */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-main)]">
            <input
              type="checkbox"
              id="field-isactive"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)] accent-[var(--primary)] cursor-pointer"
            />
            <label htmlFor="field-isactive" className="text-sm font-medium text-[var(--text-main)] cursor-pointer">
              Cliente Activo en el Sistema
            </label>
          </div>

          {/* Actions */}
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
                  <span>Guardar Cliente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

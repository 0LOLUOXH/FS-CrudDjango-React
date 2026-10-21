import React, { useState, useMemo } from "react";
import { GlassCard, Accordion } from "../../../components/ui";

const modules = [
  {
    icon: "fa-solid fa-key",
    title: "Acceso al Sistema y Seguridad",
    subtitle: "Inicio de sesión, recuperación de contraseñas y bloqueos por intentos fallidos",
    content: `1. Ingresa tu nombre de usuario y contraseña en la pantalla de autenticación.
2. Si olvidaste tu contraseña, haz clic en “¿Olvidaste tu contraseña?” e ingresa tu correo registrado para recibir el enlace de restablecimiento.
3. El enlace de recuperación es de un solo uso y posee expiración temporal por seguridad.
4. Por prevención ante ataques de fuerza bruta, intentos fallidos consecutivos bloquearán el acceso temporalmente durante 60 segundos.`,
  },
  {
    icon: "fa-solid fa-cart-shopping",
    title: "Módulo de Compras a Proveedores",
    subtitle: "Registro de órdenes de compra, control de costos e ingreso de inventario",
    content: `1. Navega a la sección "Compras" desde la barra superior.
2. Haz clic en “Nueva Orden de Compra”.
3. Selecciona el proveedor del catálogo, especifica la forma de pago (Crédito, Contado, etc.) y añade los ítems requeridos.
4. Al confirmar la compra, las cantidades recibidas se sumarán automáticamente a las existencias físicas de la bodega asignada.
5. Puedes consultar el histórico completo y descargar reportes en PDF o Excel desde "Historial de Compras".`,
  },
  {
    icon: "fa-solid fa-cash-register",
    title: "Módulo de Ventas y Facturación (POS)",
    subtitle: "Punto de venta, carritos dinámicos, cálculo de IVA y proformas",
    content: `1. Accede a "Ventas" desde la barra de navegación.
2. Selecciona un cliente registrado (natural o corporativo).
3. Agrega los productos al carrito ajustando cantidades y descuentos aplicables.
4. Verifica los subtotales, IVA y total general en el panel lateral de checkout.
5. Puedes generar una Proforma en PDF con marca de agua oficial antes de finalizar la venta.
6. Al procesar la transacción, el inventario se descuenta de inmediato y queda registrada la trazabilidad del vendedor.`,
  },
  {
    icon: "fa-solid fa-boxes-stacked",
    title: "Inventario Físico y Catálogo de Productos",
    subtitle: "Modelos, precios base, alertas de stock mínimo y garantías",
    content: `1. Entra a "Catálogo de Productos".
2. Puedes filtrar registros en tiempo real, descargar el catálogo en CSV o crear nuevos productos.
3. Todo producto debe estar asociado a una marca, modelo técnico y bodega física.
4. Si un producto cae por debajo de su umbral de stock mínimo (default 5 unidades), el sistema emitirá notificaciones visuales automáticas de alerta.`,
  },
  {
    icon: "fa-solid fa-warehouse",
    title: "Gestión de Bodegas y Almacenes",
    subtitle: "Ubicaciones físicas, límites de capacidad y asignación de encargados",
    content: `1. Consulta y registra bodegas desde la vista "Bodegas".
2. Configura la capacidad física máxima (en unidades) y el empleado responsable a cargo.
3. Puedes deshabilitar temporalmente una bodega marcándola como "Inactiva", lo que restringirá nuevos despachos hacia ella.`,
  },
  {
    icon: "fa-solid fa-user-group",
    title: "Gestión de Clientes (Naturales y Corporativos)",
    subtitle: "Datos fiscales, teléfonos, direcciones y clasificación",
    content: `1. Ve al módulo "Clientes".
2. Soporta clientes naturales (con identificación personal) y clientes jurídicos/corporativos (con razón social y NIT/RUC).
3. Utiliza los filtros rápidos por tipo de cliente o la búsqueda predictiva para localizar perfiles y editar su información.`,
  },
  {
    icon: "fa-solid fa-truck-field",
    title: "Proveedores y Alianzas Comerciales",
    subtitle: "Directorio de proveedores de equipos solares e insumos",
    content: `1. En el módulo "Proveedores", registra empresas o distribuidores mayoristas de paneles, inversores y baterías.
2. Configura su estado (Activo / Inactivo) y consulta rápidamente sus datos de contacto directo (correo, teléfono y dirección).`,
  },
  {
    icon: "fa-solid fa-database",
    title: "Copias de Seguridad y Respaldo (Backups)",
    subtitle: "Políticas de respaldo de base de datos y recuperación ante desastres",
    content: `1. Este módulo exclusivo para administradores permite generar volcados completos de la base de datos SQL.
2. Recomendación de operación: Generar al menos un backup preventivo al cierre de cada turno o jornada.
3. Puedes descargar copias localmente a tu equipo o restaurar una versión anterior en caso de inconsistencias operativas.`,
  },
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredModules = useMemo(() => {
    if (!searchTerm.trim()) return modules;
    const term = searchTerm.toLowerCase();
    return modules.filter(
      (m) =>
        m.title.toLowerCase().includes(term) ||
        m.subtitle.toLowerCase().includes(term) ||
        m.content.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const accordionItems = useMemo(() => {
    return filteredModules.map((mod, idx) => ({
      id: `help-${idx}`,
      title: (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm shrink-0">
            <i className={mod.icon}></i>
          </div>
          <div>
            <div className="font-semibold text-sm text-[var(--text-main)]">{mod.title}</div>
            <div className="text-xs text-[var(--text-muted)] font-normal">{mod.subtitle}</div>
          </div>
        </div>
      ),
      content: (
        <div className="space-y-2 text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line pl-11">
          {mod.content}
        </div>
      ),
    }));
  }, [filteredModules]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Cabecera */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] text-2xl mb-2">
          <i className="fa-solid fa-circle-question"></i>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">
          Centro de Ayuda y Manual Operativo
        </h1>
        <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto">
          Guías paso a paso, procedimientos recomendados y preguntas frecuentes de la plataforma Fusion Solar ERP
        </p>
      </div>

      {/* Buscador */}
      <GlassCard className="p-3">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-base"></i>
          <input
            type="text"
            placeholder="Buscar por módulo, término o procedimiento (ej. 'ventas', 'backup', 'recuperar')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-main)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-rose-500"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </GlassCard>

      {/* Listado de Acordeón */}
      <GlassCard className="p-4 sm:p-6">
        {accordionItems.length > 0 ? (
          <Accordion items={accordionItems} />
        ) : (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <i className="fa-solid fa-book-open-reader text-3xl mb-2 opacity-50 block"></i>
            No se encontraron temas de ayuda que coincidan con "{searchTerm}".
          </div>
        )}
      </GlassCard>

      {/* Tarjeta de Soporte Directo */}
      <GlassCard className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-[var(--primary)]">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-headset"></i>
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--text-main)]">¿Necesitas asistencia técnica adicional?</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Comunícate con el equipo de soporte de infraestructura TI de Fusion Solar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] border border-[var(--border-glass)] text-[var(--text-main)]">
            soporte@fusionsolar.com
          </span>
        </div>
      </GlassCard>
    </div>
  );
}

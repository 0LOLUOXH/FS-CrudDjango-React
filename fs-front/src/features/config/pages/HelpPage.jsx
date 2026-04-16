import React, { useState } from "react";

const modules = [
  {
    title: "🔐 Login y Reestablecimiento de Contraseña",
    content: `1. Ingresa tu correo y contraseña en la página de inicio.
2. Si olvidaste tu contraseña, haz clic en “¿Olvidaste tu contraseña?” y sigue las instrucciones enviadas al correo.
3. Si hay intentos fallidos repetidos, el sistema bloqueará temporalmente el acceso.`,
  },
  {
    title: "🛒 Compras",
    content: `1. Ve al módulo "Compras".
2. Haz clic en “Nueva Compra”.
3. Selecciona el proveedor, agrega productos y guarda la compra.
4. Las compras actualizan automáticamente el inventario.`,
  },
  {
    title: "💰 Ventas",
    content: `1. Entra al módulo "Ventas".
2. Selecciona el cliente.
3. Agrega los productos vendidos.
4. Guarda la venta. El inventario se actualizará automáticamente.`,
  },
  {
    title: "📦 Productos",
    content: `1. Accede al módulo "Productos".
2. Puedes agregar, editar o eliminar productos.
3. Usa los filtros para buscar por nombre, marca o categoría.`,
  },
  {
    title: "🏬 Bodega",
    content: `1. Consulta el estado actual del inventario.
2. Puedes ver cantidades, movimientos y alertas de stock bajo.
3. Accede a históricos de ingreso y salida de productos.`,
  },
  {
    title: "👥 Clientes",
    content: `1. Ve al módulo "Clientes".
2. Agrega clientes naturales o jurídicos.
3. Puedes filtrar y editar la información desde la tabla.`,
  },
  {
    title: "🚚 Proveedores",
    content: `1. En el módulo "Proveedores", registra empresas o personas que suministran productos.
2. Relaciónalos con productos comprados.
3. Puedes editar o dar de baja un proveedor.`,
  },
  {
    title: "💾 Backups",
    content: `1. Este módulo permite hacer respaldos de seguridad del sistema.
2. Se recomienda realizar un backup diario antes de cerrar el sistema.
3. Solo los administradores pueden acceder a esta función.`,
  },
];

const HelpPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">📘 Centro de Ayuda</h1>
      {modules.map((mod, index) => (
        <div key={index} className="border rounded-xl mb-4 shadow">
          <button
            onClick={() => toggle(index)}
            className="w-full text-left px-4 py-3 font-semibold bg-blue-100 hover:bg-blue-200 rounded-t-xl transition"
          >
            {mod.title}
          </button>
          {openIndex === index && (
            <div className="px-4 py-3 bg-white whitespace-pre-line">
              {mod.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HelpPage;

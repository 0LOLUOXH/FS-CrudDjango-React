import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Navegation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [comprasOpen, setComprasOpen] = useState(false);
  const [ventasOpen, setVentasOpen] = useState(false);
  const [productoOpen, setProductoOpen] = useState(false);
  const location = useLocation();

  const pageTitles = {
    "/inicio": "Inicio",
    "/compras": "Compras",
    "/ventas": "Ventas",
    "/producto": "Producto",
    "/marcasymodelos": "Marcas y Modelos",
    "/clientes": "Clientes",
    "/bodega": "Bodega",
    "/proveedores": "Proveedor",
    "/empleados": "Empleados",
    "/inventario": "Inventario",
    "/historialventa": "Historial de ventas",
    "/historialcompra": "Historial de compras",
    "/backups": "Backups",
    "/ayuda": "Ayuda",
  };

  const currentPage = pageTitles[location.pathname] || "";
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkBase =
    "flex items-center gap-3 justify-start w-full px-4 py-2 mb-2 rounded-lg text-[17px] transition-colors duration-200";
  const linkInactive = "text-white hover:bg-[#15608B] hover:text-white";
  const linkActive = "bg-[#FEBA53] text-[#081A2D]";

  return (
    <>
 {/* Topbar */}
<div className="fixed top-0 left-0 right-0 bg-[#081A2D] py-4 px-4 z-50 shadow-md flex items-center justify-between">
  {/* Logo + Nombre empresa (SIEMPRE visible) */}
  <div className="flex items-center gap-2">
    <img
      src="https://i.postimg.cc/0yL2WnTP/Chat-GPT-Image-29-jun-2025-02-45-57.png"
      alt="Logo Fusión Solar"
      className="w-10 h-10"
    />
    <span className="text-[#FEBA53] font-bold text-lg">Fusión Solar</span>

    {/* Botón hamburguesa solo en móvil */}
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="ml-4 text-[#FEBA53] focus:outline-none lg:hidden"
    >
      ☰
    </button>
  </div>

  {/* Título centrado solo en desktop */}
  <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold text-[#FEBA53]">
    {currentPage}
  </div>

  {/* Usuario */}
  <div className="flex items-center space-x-2 ml-auto">
    <div className="relative">
      <button
        onClick={() => setUserMenuOpen(u => !u)}
        className="flex items-center space-x-1 focus:outline-none"
      >
        <span className="text-[#FEBA53] font-semibold">{user.username}</span>
        <img
          src="https://www.w3schools.com/howto/img_avatar.png"
          alt="Avatar usuario"
          className="h-8 w-8 rounded-full object-cover border-2 border-[#FEBA53]"
        />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke="#FEBA53" strokeWidth={2} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {userMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-[#081A2D] border border-[#FEBA53] shadow-lg rounded-lg">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 font-bold text-[#FEBA53] hover:bg-[#15608B] rounded transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  </div>
</div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-60 bg-[#081A2D] transform transition-transform duration-300 z-40 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex items-center mb-5 mt-4 px-4">
          <img
            src="https://i.postimg.cc/0yL2WnTP/Chat-GPT-Image-29-jun-2025-02-45-57.png"
            alt="Logo Fusión Solar"
            className="w-14 h-14 mr-2 ml-2"
          />
          <h1 className="text-yellow-400 font-bold text-lg mb-2">Fusión Solar</h1>
        </div>

        <nav className="mt-10 flex flex-col px-2">
          <Link to="/inicio" className={`${linkBase} ${location.pathname === "/inicio" ? linkActive : linkInactive}`} onClick={() => setSidebarOpen(false)}>🏠 Inicio</Link>
          <Link to="/clientes" className={`${linkBase} ${location.pathname === "/clientes" ? linkActive : linkInactive}`} onClick={() => setSidebarOpen(false)}>👤 Clientes</Link>

          {user?.is_staff && (
            <Link to="/proveedores" className={`${linkBase} ${location.pathname === "/proveedores" ? linkActive : linkInactive}`} onClick={() => setSidebarOpen(false)}>🏪 Proveedores</Link>
          )}

          {/* Compras */}
          {user?.is_staff && (
            <div onMouseEnter={() => setComprasOpen(true)} onMouseLeave={() => setComprasOpen(false)} className="w-full">
              <div className={`${linkBase} ${linkInactive} cursor-pointer select-none`}>🛒 Compras</div>
              <div className={`overflow-hidden transition-all duration-300 ${comprasOpen ? "max-h-40" : "max-h-0"}`}>
                <Link to="/compras" className={`${linkBase} ml-6 ${location.pathname === "/compras" ? linkActive : linkInactive}`} onClick={() => setSidebarOpen(false)}>Registrar compra</Link>
                <Link to="/historialcompra" className={`${linkBase} ml-6 ${location.pathname === "/historialcompra" ? linkActive : linkInactive}`} onClick={() => setSidebarOpen(false)}>Historial de compras</Link>
              </div>
            </div>
          )}

          {/* Ventas */}
          <div onMouseEnter={() => setVentasOpen(true)} onMouseLeave={() => setVentasOpen(false)} className="w-full">
            <div className={`${linkBase} ${linkInactive} cursor-pointer select-none`}>💰 Ventas</div>
            <div className={`overflow-hidden transition-all duration-300 ${ventasOpen ? "max-h-40" : "max-h-0"}`}>
              <Link to="/ventas" className={`${linkBase} ml-6 ${location.pathname === "/ventas" ? linkActive : linkInactive}`} onClick={() => setSidebarOpen(false)}>Registrar venta</Link>
              <Link to="/historialventa" className={`${linkBase} ml-6 ${location.pathname === "/historialventa" ? linkActive : linkInactive}`} onClick={() => setSidebarOpen(false)}>Historial de ventas</Link>
            </div>
          </div>

          {/* Producto */}
          <div onMouseEnter={() => setProductoOpen(true)} onMouseLeave={() => setProductoOpen(false)} className="w-full">
            <div className={`${linkBase} ${linkInactive} cursor-pointer select-none`}>📦 Productos</div>
            <div className={`overflow-hidden transition-all duration-300 ${productoOpen ? "max-h-56" : "max-h-0"}`}>
              <Link to="/producto" className={`${linkBase} ml-6 ${location.pathname === "/producto" ? linkActive : linkInactive}`} onClick={() => setSidebarOpen(false)}>Ver productos</Link>
              {user?.is_staff && (
                <>
                  <Link to="/marcasymodelos" className={`${linkBase} ml-6 ${location.pathname === "/marcasymodelos" ? linkActive : linkInactive}`} onClick={() => setSidebarOpen(false)}>Marcas y modelos</Link>
                  <Link to="/bodega" className={`${linkBase} ml-6 ${location.pathname === "/bodega" ? linkActive : linkInactive}`} onClick={() => setSidebarOpen(false)}>Bodega</Link>
                </>
              )}
            </div>
          </div>

          {user?.is_staff && (
            <>
              <Link to="/empleados" className={`${linkBase} ${location.pathname === "/empleados" ? linkActive : linkInactive}`} onClick={() => setSidebarOpen(false)}>👥 Empleados</Link>
              <Link to="/backups" className={`${linkBase} ${location.pathname === "/backups" ? linkActive : linkInactive}`} onClick={() => setSidebarOpen(false)}>💾 Backups</Link>
              <Link to="/ayuda" className={`${linkBase} ${location.pathname === "/ayuda" ? linkActive : linkInactive}`} onClick={() => setSidebarOpen(false)}>❓ Ayuda</Link>
            </>
          )}
        </nav>
      </div>

    </>
  );
}

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

export function MainNavigation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPurchasesOpen, setIsPurchasesOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const location = useLocation();

  const pageTitles = {
    "/home": "Inicio",
    "/purchases": "Compras",
    "/sales": "Ventas",
    "/products": "Producto",
    "/brands-models": "Marcas y Modelos",
    "/customers": "Clientes",
    "/warehouse": "Bodega",
    "/suppliers": "Proveedor",
    "/stock": "Inventario",
    "/sales-history": "Historial de ventas",
    "/purchases-history": "Historial de compras",
    "/backups": "Backups",
    "/help": "Ayuda",
  };

  const currentPage = pageTitles[location.pathname] || "";
  const { logout, user } = useUser();
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
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
        onClick={() => setIsUserMenuOpen(u => !u)}
        className="flex items-center space-x-1 focus:outline-none"
      >
        <span className="text-[#FEBA53] font-semibold">{user?.username || 'Usuario'}</span>
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
      {isUserMenuOpen && (
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
      <div className={`fixed top-0 left-0 h-screen w-60 bg-[#081A2D] transform transition-transform duration-300 z-40 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex items-center mb-5 mt-4 px-4">
          <img
            src="https://i.postimg.cc/0yL2WnTP/Chat-GPT-Image-29-jun-2025-02-45-57.png"
            alt="Logo Fusión Solar"
            className="w-14 h-14 mr-2 ml-2"
          />
          <h1 className="text-yellow-400 font-bold text-lg mb-2">Fusión Solar</h1>
        </div>

        <nav className="mt-10 flex flex-col px-2">
          <Link to="/home" className={`${linkBase} ${location.pathname === "/home" ? linkActive : linkInactive}`} onClick={() => setIsSidebarOpen(false)}>🏠 Inicio</Link>
          <Link to="/customers" className={`${linkBase} ${location.pathname === "/customers" ? linkActive : linkInactive}`} onClick={() => setIsSidebarOpen(false)}>👤 Clientes</Link>

          {user?.is_staff && (
            <Link to="/suppliers" className={`${linkBase} ${location.pathname === "/suppliers" ? linkActive : linkInactive}`} onClick={() => setIsSidebarOpen(false)}>🏪 Proveedores</Link>
          )}

          {/* Compras */}
          {user?.is_staff && (
            <div onMouseEnter={() => setIsPurchasesOpen(true)} onMouseLeave={() => setIsPurchasesOpen(false)} className="w-full">
              <div className={`${linkBase} ${linkInactive} cursor-pointer select-none`}>🛒 Compras</div>
              <div className={`overflow-hidden transition-all duration-300 ${isPurchasesOpen ? "max-h-40" : "max-h-0"}`}>
                <Link to="/purchases" className={`${linkBase} ml-6 ${location.pathname === "/purchases" ? linkActive : linkInactive}`} onClick={() => setIsSidebarOpen(false)}>Registrar compra</Link>
                <Link to="/purchases-history" className={`${linkBase} ml-6 ${location.pathname === "/purchases-history" ? linkActive : linkInactive}`} onClick={() => setIsSidebarOpen(false)}>Historial de compras</Link>
              </div>
            </div>
          )}

          {/* Ventas */}
          <div onMouseEnter={() => setIsSalesOpen(true)} onMouseLeave={() => setIsSalesOpen(false)} className="w-full">
            <div className={`${linkBase} ${linkInactive} cursor-pointer select-none`}>💰 Ventas</div>
            <div className={`overflow-hidden transition-all duration-300 ${isSalesOpen ? "max-h-40" : "max-h-0"}`}>
              <Link to="/sales" className={`${linkBase} ml-6 ${location.pathname === "/sales" ? linkActive : linkInactive}`} onClick={() => setIsSidebarOpen(false)}>Registrar venta</Link>
              <Link to="/sales-history" className={`${linkBase} ml-6 ${location.pathname === "/sales-history" ? linkActive : linkInactive}`} onClick={() => setIsSidebarOpen(false)}>Historial de ventas</Link>
            </div>
          </div>

          {/* Producto */}
          <div onMouseEnter={() => setIsProductsOpen(true)} onMouseLeave={() => setIsProductsOpen(false)} className="w-full">
            <div className={`${linkBase} ${linkInactive} cursor-pointer select-none`}>📦 Productos</div>
            <div className={`overflow-hidden transition-all duration-300 ${isProductsOpen ? "max-h-56" : "max-h-0"}`}>
              <Link to="/products" className={`${linkBase} ml-6 ${location.pathname === "/products" ? linkActive : linkInactive}`} onClick={() => setIsSidebarOpen(false)}>Ver productos</Link>
              {user?.is_staff && (
                <>
                  <Link to="/brands-models" className={`${linkBase} ml-6 ${location.pathname === "/brands-models" ? linkActive : linkInactive}`} onClick={() => setIsSidebarOpen(false)}>Marcas y modelos</Link>
                  <Link to="/warehouse" className={`${linkBase} ml-6 ${location.pathname === "/warehouse" ? linkActive : linkInactive}`} onClick={() => setIsSidebarOpen(false)}>Bodega</Link>
                </>
              )}
            </div>
          </div>

          {user?.is_staff && (
            <>
              <Link to="/backups" className={`${linkBase} ${location.pathname === "/backups" ? linkActive : linkInactive}`} onClick={() => setIsSidebarOpen(false)}>💾 Backups</Link>
              <Link to="/help" className={`${linkBase} ${location.pathname === "/help" ? linkActive : linkInactive}`} onClick={() => setIsSidebarOpen(false)}>❓ Ayuda</Link>
            </>
          )}
        </nav>
      </div>

    </>
  );
}

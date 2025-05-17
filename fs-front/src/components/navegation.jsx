import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Navegation() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const pageTitles = {
    "/": "Inicio",
    "/compras": "Compras",
    "/ventas": "Ventas",
    "/producto": "Producto",
    "/clientes": "Clientes",
    "/bodega": "Bodega",
    "/proveedores": "Proveedor",
    "/empleados": "Empleados",
    "/inventario": "Inventario",
    "/historialventa": "Historial de ventas",
    "/historialcompra": "Historial de compras",
  };
  const currentPage = pageTitles[location.pathname] || "";

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);

  const linkBase = "flex items-center justify-start w-full px-4 py-2 mb-2 rounded-lg transition-colors duration-200";
  const linkInactive = "text-white hover:bg-[#15608B] hover:text-white";
  const linkActive = "bg-[#FEBA53] text-[#081A2D] ";

  return (
    <>
      {/* Topbar */}
      <div className="relative bg-[#081A2D] py-3 px-4 shadow-md z-50 flex items-center justify-between">
        {/* IZQUIERDA: hamburguesa + logo */}
        <div className="flex items-center space-x-4">
          <button
            className="bg-[#8A5438] p-2 rounded lg:hidden"
            onClick={() => setOpen(true)}
            style={{ display: open ? "none" : undefined }}
            aria-label="Abrir menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#FEBA53" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-2">
            <img
              src="https://media-hosting.imagekit.io/0ce98b7c0e8f4d37/a4691a66-0e6a-4755-a9dc-4bc8a692161b.jpg?Expires=1841897748&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=etxNagLkJz5-XZmIIOq-0Css6i~wL7pdVz0589H9N5ux5ZbPXuwyEOy0Ga5LRuQ-ZuOlXw33rrMluMjGw0rFsw44Pkkgsgx-b9R08L9C1ifW01yKtVunIgANo5K106MIOlG13N97RgLNemZcRvOIgqQAqpzORzReKtna7V1hVfidGrfZ3zkvvUJAP-uErZDJChnuW2p0xSWH8XP~pI7CmQDqSOgVd0m0XRpBNDM5Lk5oBvkdSjrFVeiS3QWGFEvXhd6MSKUcECTjyKbo16J~LZK2FMxJkhvVIdx9HtJC83qBU4kyJC4tb2IW1W-7wXwXMBbSxuldftUliVxHjW1TqQ__"
              alt="Fusion Solar logo"
              className="h-8 w-8 rounded-full object-cover border-2 border-[#FEBA53]"
            />
            <span className="font-bold text-[#FEBA53]">Fusion Solar</span>
          </div>
        </div>

        {/* CENTRO: título */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold text-[#FEBA53]">
          {currentPage}
        </div>

        {/* DERECHA: dropdown usuario */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((u) => !u)}
              className="flex items-center space-x-1 focus:outline-none"
            >
              <span className="text-[#FEBA53] font-semibold">Usuario</span>
              <img
                src="https://www.w3schools.com/howto/img_avatar.png"
                alt="Avatar usuario"
                className="h-8 w-8 rounded-full object-cover border-2 border-[#FEBA53]"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#FEBA53" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-[#15608B] border border-[#FEBA53] shadow-lg rounded-lg">
                <button
                  onClick={() => {
                    /* lógica logout */
                  }}
                  className="w-full text-left px-4 py-2 text-[#081A2D] hover:bg-[#549ABE] rounded transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-30 transition-all duration-300 ${
          open ? "backdrop-blur-sm bg-black/30 pointer-events-auto" : "pointer-events-none bg-transparent"
        }`}
        aria-hidden="true"
      />

      {/* Hover zone (desktop) */}
      <div
        className="fixed top-0 left-0 h-screen w-3 z-50 hidden lg:block"
        onMouseEnter={handleMouseEnter}
        style={{ pointerEvents: open ? "none" : "auto" }}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 ${
          open ? "w-80" : "w-0"
        } overflow-hidden bg-[#05355D]`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Cerrar (móvil) */}
        <div className="ml-4 mt-4">
          <button
            className="block lg:hidden text-[#FEBA53]"
            onClick={() => setOpen(false)}
            style={{ display: open ? undefined : "none" }}
            aria-label="Cerrar menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#FEBA53" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-20 flex flex-col px-2">
          <Link
            to="/"
            className={`${linkBase} ${location.pathname === "/" ? linkActive : linkInactive}`}
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-3 text-[#FEBA53]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-6h-4v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10z" />
            </svg>
            Inicio
          </Link>
          <Link
            to="/compras"
            className={`${linkBase} ${location.pathname === "/compras" ? linkActive : linkInactive}`}
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-3 text-[#FEBA53]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2.4l.9 4.5H21l-1.8 9H6.3l-.9-4.5H3V3zM7 21a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            Compras
          </Link>
          <Link
            to="/ventas"
            className={`${linkBase} ${location.pathname === "/ventas" ? linkActive : linkInactive}`}
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-3 text-[#FEBA53]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.105 0-2 .672-2 1.5S10.895 11 12 11s2 .672 2 1.5S13.105 14 12 14M12 4v2m0 8v2" />
            </svg>
            Ventas
          </Link>
          <Link
            to="/producto"
            className={`${linkBase} ${location.pathname === "/producto" ? linkActive : linkInactive}`}
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-3 text-[#FEBA53]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4v11a1 1 0 001 1l7-4 7 4a1 1 0 001-1V7z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18" />
            </svg>
            Producto
          </Link>
          <Link
            to="/clientes"
            className={`${linkBase} ${location.pathname === "/clientes" ? linkActive : linkInactive}`}
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-3 text-[#FEBA53]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87" />
              <circle cx="12" cy="7" r="4" stroke="#FEBA53" strokeWidth={2} fill="none" />
            </svg>
            Clientes
          </Link>
          <Link
            to="/bodega"
            className={`${linkBase} ${location.pathname === "/bodega" ? linkActive : linkInactive}`}
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-3 text-[#FEBA53]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18v4H3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11v8a1 1 0 001 1h12a1 1 0 001-1v-8" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6v4H9z" />
            </svg>
            Bodega
          </Link>
          <Link
            to="/proveedores"
            className={`${linkBase} ${location.pathname === "/proveedores" ? linkActive : linkInactive}`}
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-3 text-[#FEBA53]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17H5a2 2 0 00-2-2V9h18v6a2 2 0 00-2 2h-4M7 9V5h10v4" />
              <circle cx="7" cy="17" r="2" stroke="#FEBA53" strokeWidth={2} fill="none" /><circle cx="17" cy="17" r="2" stroke="#FEBA53" strokeWidth={2} fill="none" />
            </svg>
            Proveedor
          </Link>
          <Link
            to="/empleados"
            className={`${linkBase} ${location.pathname === "/empleados" ? linkActive : linkInactive}`}
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-3 text-[#FEBA53]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
            Empleados
          </Link>
          <Link
            to="/inventario"
            className={`${linkBase} ${location.pathname === "/inventario" ? linkActive : linkInactive}`}
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-3 text-[#FEBA53]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6a2 2 0 012 2v12l-4-4-4 4V7a2 2 0 012-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6M9 13h6M9 17h6" />
            </svg>
            Inventario
          </Link>
          <Link
            to="/historialventa"
            className={`${linkBase} ${location.pathname === "/historialventa" ? linkActive : linkInactive}`}
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-3 text-[#FEBA53]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9l-4 4-4-4" />
            </svg>
            Historial de ventas
          </Link>
          <Link
            to="/historialcompra"
            className={`${linkBase} ${location.pathname === "/historialcompra" ? linkActive : linkInactive}`}
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-3 text-[#FEBA53]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2 2 4-4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 2H9a2 2 0 00-2 2v16l4-4 4 4V4a2 2 0 00-2-2z" />
            </svg>
            Historial de compras
          </Link>
        </nav>
      </div>
    </>
  );
}

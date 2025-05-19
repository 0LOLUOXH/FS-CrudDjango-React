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
    "/marcasymodelos": "Marcas y Modelos",
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
  {/* Inicio queda al principio */}
  <Link
    to="/"
    className={`${linkBase} ${location.pathname === "/" ? linkActive : linkInactive}`}
    onClick={() => setOpen(false)}
  >
    Inicio
  </Link>

  {/* + Compra */}
  <details className="w-full" open>
    <summary className={`${linkBase} ${linkInactive} cursor-pointer select-none`}>
      + Compra
    </summary>
    <div className="ml-4">
      <Link
        to="/compras"
        className={`${linkBase} ${location.pathname === "/compras" ? linkActive : linkInactive}`}
        onClick={() => setOpen(false)}
      >
        – Registrar compra
      </Link>
      <Link
        to="/historialcompra"
        className={`${linkBase} ${location.pathname === "/historialcompra" ? linkActive : linkInactive}`}
        onClick={() => setOpen(false)}
      >
        – Historial de compras
      </Link>
    </div>
  </details>

  {/* + Ventas */}
  <details className="w-full">
    <summary className={`${linkBase} ${linkInactive} cursor-pointer select-none`}>
      + Ventas
    </summary>
    <div className="ml-4">
      <Link
        to="/ventas"
        className={`${linkBase} ${location.pathname === "/ventas" ? linkActive : linkInactive}`}
        onClick={() => setOpen(false)}
      >
        – Registrar venta
      </Link>
      <Link
        to="/historialventa"
        className={`${linkBase} ${location.pathname === "/historialventa" ? linkActive : linkInactive}`}
        onClick={() => setOpen(false)}
      >
        – Historial de ventas
      </Link>
    </div>
  </details>

  {/* + Producto */}
  <details className="w-full">
    <summary className={`${linkBase} ${linkInactive} cursor-pointer select-none`}>
      + Producto
    </summary>
    <div className="ml-4">
      <Link
        to="/producto"
        className={`${linkBase} ${location.pathname === "/producto" ? linkActive : linkInactive}`}
        onClick={() => setOpen(false)}
      >
        – Ingresar producto
      </Link>
      <Link
        to="/marcasymodelos"
        className={`${linkBase} ${location.pathname === "/marcasymodelos" ? linkActive : linkInactive}`}
        onClick={() => setOpen(false)}
      >
        – Marcas y modelos
      </Link>
      <Link
        to="/bodega"
        className={`${linkBase} ${location.pathname === "/bodega" ? linkActive : linkInactive}`}
        onClick={() => setOpen(false)}
      >
        – Bodega
      </Link>
      <Link
        to="/inventario"
        className={`${linkBase} ${location.pathname === "/inventario" ? linkActive : linkInactive}`}
        onClick={() => setOpen(false)}
      >
        – Inventario
      </Link>
      <span className={linkBase}>– Stock</span>
    </div>
  </details>

  {/* Resto de enlaces directos */}
  <Link
    to="/clientes"
    className={`${linkBase} ${location.pathname === "/clientes" ? linkActive : linkInactive}`}
    onClick={() => setOpen(false)}
  >
    Clientes
  </Link>
  <Link
    to="/proveedores"
    className={`${linkBase} ${location.pathname === "/proveedores" ? linkActive : linkInactive}`}
    onClick={() => setOpen(false)}
  >
    Proveedor
  </Link>
  <Link
    to="/empleados"
    className={`${linkBase} ${location.pathname === "/empleados" ? linkActive : linkInactive}`}
    onClick={() => setOpen(false)}
  >
    Empleados
  </Link>
</nav>

      </div>
    </>
  );
}

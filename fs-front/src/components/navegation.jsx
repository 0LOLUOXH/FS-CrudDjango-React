import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Navegation() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [comprasOpen, setComprasOpen] = useState(false);
  const [ventasOpen, setVentasOpen] = useState(false);
  const [productoOpen, setProductoOpen] = useState(false);
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

  const linkBase =
    "flex items-center gap-3 justify-start w-full px-4 py-2 mb-2 rounded-lg text-[17px] font-serif transition-colors duration-200";
  const linkInactive = "text-white hover:bg-[#15608B] hover:text-white";
  const linkActive = "bg-[#FEBA53] text-[#081A2D]";

  return (
    <>
      {/* Topbar */}
      <div className="relative bg-[#081A2D] top-0 left-0 right-0 py-3 px-4 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Burger solo en móvil */}
          <button
            className="block lg:hidden bg-[#8A5438] p-2 rounded"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#FEBA53"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-2">
            <img
              src="https://media-hosting.imagekit.io/0ce98b7c0e8f4d37/a4691a66-0e6a-4755-a9dc-4bc8a692161b.jpg"
              alt="Fusion Solar logo"
              className="h-8 w-8 rounded-full object-cover border-2 border-[#FEBA53]"
            />
            <span className="font-bold text-[#FEBA53]">Fusion Solar</span>
          </div>
        </div>

        {/* Título solo en desktop */}
        <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold text-[#FEBA53]">
          {currentPage}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(u => !u)}
              className="flex items-center space-x-1 focus:outline-none"
            >
              <span className="text-[#FEBA53] font-semibold">Usuario</span>
              <img
                src="https://www.w3schools.com/howto/img_avatar.png"
                alt="Avatar usuario"
                className="h-8 w-8 rounded-full object-cover border-2 border-[#FEBA53]"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#FEBA53"
                strokeWidth={2}
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-[#15608B] border border-[#FEBA53] shadow-lg rounded-lg">
                <button
                  onClick={() => {/* lógica logout */}}
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
          open
            ? "backdrop-blur-sm bg-black/30 pointer-events-auto"
            : "pointer-events-none bg-transparent"
        }`}
        aria-hidden="true"
      />

      {/* Hover zone desktop */}
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
        {/* Cerrar en móvil */}
        <div className="ml-4 mt-4 lg:hidden">
          <button
            className="text-[#FEBA53]"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#FEBA53"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-10 flex flex-col px-2">
          {/* Inicio */}
          <Link
            to="/"
            className={`${linkBase} ${
              location.pathname === "/" ? linkActive : linkInactive
            }`}
            onClick={() => setOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-[#FEBA53]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10l9-7 9 7v11a2 2 0 01-2 2h-4a2 2 0 01-2-2v-6h-4v6a2 2 0 01-2 2H5a2 2 0 01-2-2V10z"
              />
            </svg>
            Inicio
          </Link>

          {/* Compras dropdown */}
          <div
            className="w-full"
            onMouseEnter={() => setComprasOpen(true)}
            onMouseLeave={() => setComprasOpen(false)}
          >
            <div className={`${linkBase} ${linkInactive} cursor-pointer select-none`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-[#FEBA53]">
                <path d="M1 1.75A.75.75 0 011.75 1h1.628a1.75 1.75 0 011.734 1.51L5.18 3a65.25 65.25 0 0113.36 1.412.75.75 0 01.58.875 48.645 48.645 0 01-1.618 6.2.75.75 0 01-.712.513H6a2.503 2.503 0 00-2.292 1.5H17.25a.75.75 0 010 1.5H2.76a.75.75 0 01-.748-.807 4.002 4.002 0 012.716-3.486L3.626 2.716a.25.25 0 00-.248-.216H1.75A.75.75 0 011 1.75Z" />
              </svg>
              Compras
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${comprasOpen ? "max-h-40" : "max-h-0"}`}>
              <Link
                to="/compras"
                className={`${linkBase} ${location.pathname === "/compras" ? linkActive : linkInactive} ml-6`}
                onClick={() => setOpen(false)}
              >
                Registrar compra
              </Link>
              <Link
                to="/historialcompra"
                className={`${linkBase} ${location.pathname === "/historialcompra" ? linkActive : linkInactive} ml-6`}
                onClick={() => setOpen(false)}
              >
                Historial de compras
              </Link>
            </div>
          </div>

          {/* Ventas dropdown */}
          <div
            className="w-full"
            onMouseEnter={() => setVentasOpen(true)}
            onMouseLeave={() => setVentasOpen(false)}
          >
            <div className={`${linkBase} ${linkInactive} cursor-pointer select-none`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-[#FEBA53]">
                <path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 00-1.743 1.598l-.826 9.5A1.75 1.75 0 003.84 19H16.16a1.75 1.75 0 001.743-1.902l-.826-9.5A1.75 1.75 0 0015.333 6H14V5a4 4 0 00-8 0Zm4-2.5A2.5 2.5 0 007.5 5v1h5V5A2.5 2.5 0 0010 2.5ZM7.5 10a2.5 2.5 0 005 0V8.75a.75.75 0 011.5 0V10a4 4 0 01-8 0V8.75a.75.75 0 011.5 0V10Z" clipRule="evenodd" />
              </svg>
              Ventas
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${ventasOpen ? "max-h-40" : "max-h-0"}`}>
              <Link
                to="/ventas"
                className={`${linkBase} ${location.pathname === "/ventas" ? linkActive : linkInactive} ml-6`}
                onClick={() => setOpen(false)}
              >
                Registrar venta
              </Link>
              <Link
                to="/historialventa"
                className={`${linkBase} ${location.pathname === "/historialventa" ? linkActive : linkInactive} ml-6`}
                onClick={() => setOpen(false)}
              >
                Historial de ventas
              </Link>
            </div>
          </div>

          {/* Producto dropdown */}
          <div
            className="w-full"
            onMouseEnter={() => setProductoOpen(true)}
            onMouseLeave={() => setProductoOpen(false)}
          >
            <div className={`${linkBase} ${linkInactive} cursor-pointer select-none`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-[#FEBA53]">
                <path fillRule="evenodd" d="M13.887 3.182c.396.037.79.08 1.183.128C16.194 3.45 17 4.414 17 5.517V16.75A2.25 2.25 0 0114.75 19h-9.5A2.25 2.25 0 013 16.75V5.517c0-1.103.806-2.068 1.93-2.207.393-.048.787-.09 1.183-.128A3.001 3.001 0 019 1h2c1.373 0 2.531.923 2.887 2.182ZM7.5 4A1.5 1.5 0 009 2.5h2A1.5 1.5 0 0112.5 4v.5h-5V4Z" clipRule="evenodd" />
              </svg>
              Producto
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${productoOpen ? "max-h-56" : "max-h-0"}`}>
              <Link
                to="/producto"
                className={`${linkBase} ${location.pathname === "/producto" ? linkActive : linkInactive} ml-6`}
                onClick={() => setOpen(false)}
              >
                Ingresar producto
              </Link>
              <Link
                to="/marcasymodelos"
                className={`${linkBase} ${location.pathname === "/marcasymodelos" ? linkActive : linkInactive} ml-6`}
                onClick={() => setOpen(false)}
              >
                Marcas y modelos
              </Link>
              <Link
                to="/bodega"
                className={`${linkBase} ${location.pathname === "/bodega" ? linkActive : linkInactive} ml-6`}
                onClick={() => setOpen(false)}
              >
                Bodega
              </Link>

              <Link
                to="/stock"
                className={`${linkBase} ${location.pathname === "/stock" ? linkActive : linkInactive} ml-6`}
                onClick={() => setOpen(false)}
              >
                Stock
              </Link>
              
            
            </div>
          </div>

          {/* Clientes */}
          <Link
            to="/clientes"
            className={`${linkBase} ${
              location.pathname === "/clientes" ? linkActive : linkInactive
            }`}
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-[#FEBA53]">
              <path d="M10 5a3 3 0 11-6 0 3 3 0 016 0ZM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572ZM16.25 5.75a.75.75 0 10-1.5 0v2h-2a.75.75 0 000 1.5h2v2a.75.75 0 001.5 0v-2h2a.75.75 0 000-1.5h-2v-2Z" />
            </svg>
            Clientes
          </Link>

          {/* Proveedores */}
          <Link
            to="/proveedores"
            className={`${linkBase} ${
              location.pathname === "/proveedores" ? linkActive : linkInactive
            }`}
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-[#FEBA53]">
              <path d="M6.5 3c-1.051 0-2.093.04-3.125.117A1.49 1.49 0 002 4.607V10.5h9V4.606c0-.771-.59-1.43-1.375-1.489A41.568 41.568 0 006.5 3ZM2 12v2.5A1.5 1.5 0 0 013.5 16h.041a3 3 0 015.918 0h.791a.75.75 0 00.75-.75V12H2Z" />
              <path d="M6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3ZM13.25 5a.75.75 0 00-.75.75v8.514a3.001 3.001 0 004.893 1.44c.37-.275.61-.719.595-1.227a24.905 24.905 0 00-1.784-8.549A1.486 1.486 0 0014.823 5H13.25ZM14.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3Z" />
            </svg>
            Proveedor
          </Link>

          {/* Empleados */}
          <Link
            to="/empleados"
            className={`${linkBase} ${
              location.pathname === "/empleados" ? linkActive : linkInactive
            }`}
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-[#FEBA53]">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6ZM6 8a2 2 0 11-4 0 2 2 0 014 0ZM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654ZM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654ZM18 8a2 2 0 11-4 0 2 2 0 014 0ZM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81Z" />
            </svg>
            Empleados
          </Link>
        </nav>
      </div>
    </>
  );
}

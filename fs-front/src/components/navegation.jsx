import { useState } from "react";
import { Link } from "react-router-dom";

export function Navegation() {
  const [open, setOpen] = useState(false);

  // Muestra la barra al acercar el mouse al borde izquierdo
  const handleMouseEnter = () => setOpen(true);
  // Oculta la barra al alejar el mouse del área de la barra
  const handleMouseLeave = () => setOpen(false);

  return (
    <>
      {/* Barra superior */}
      <div className="bg-white py-3  top-0 left-0 right-0 shadow-md z-50 flex items-center justify-center relative">
        <span className="font-bold text-cyan-700 text-lg mx-auto text-center block">
          Mi Aplicación
        </span>
        {/* Botón hamburguesa solo visible en pantallas pequeñas */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-cyan-600 p-2 rounded block lg:hidden"
          onClick={() => setOpen(true)}
          style={{ display: open ? "none" : undefined }}
          aria-label="Abrir menú"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>

      {/* Overlay con blur cuando la barra está extendida */}
      <div
        className={`fixed inset-0 z-30 transition-all duration-300 ${
          open ? "backdrop-blur-sm bg-black/30" : "pointer-events-none bg-transparent"
        }`}
        style={{}}
        aria-hidden="true"
      />

      {/* Área invisible en el borde izquierdo para detectar el mouse solo en pantallas grandes */}
      <div
        className="fixed top-0 left-0 h-screen w-3 z-50 hidden lg:block"
        onMouseEnter={handleMouseEnter}
        style={{ pointerEvents: open ? "none" : "auto" }}
      />

      {/* Barra lateral con transición */}
      <div
        className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 ${
          open ? "w-80" : "w-0"
        } overflow-hidden`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ background: "#0891b2" }} // bg-cyan-600
      >
        {/* Botón X solo visible en pantallas pequeñas */}
        <div className="ml-4 mt-4">
          <button
            className="block lg:hidden"
            onClick={() => setOpen(false)}
            style={{ display: open ? undefined : "none" }}
            aria-label="Cerrar menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </button>
        </div>
        <div className="mt-20">
          <div className="text-center text-white text-xl hover:bg-orange-400 cursor-pointer py-3 mb-2">
            Link 1
          </div>
          <div className="text-center text-white text-xl hover:bg-orange-400 cursor-pointer py-3 mb-2">
            Link 1
          </div>
          <div className="text-center text-white text-xl hover:bg-orange-400 cursor-pointer py-3 mb-2">
            Link 1
          </div>
          <div className="text-center text-white text-xl hover:bg-orange-400 cursor-pointer py-3 mb-2">
            Link 1
          </div>
        </div>
      </div>
    </>
  );
}
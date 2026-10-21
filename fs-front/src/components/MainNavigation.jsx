import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "../contexts/ThemeContext";

export function MainNavigation() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useUser();
  const { isDark, toggleTheme, isRotating } = useTheme();

  const userMenuRef = useRef(null);

  // Close menus when route changes
  useEffect(() => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
    setActiveMobileSubmenu(null);
  }, [location.pathname]);

  // Click outside to close user menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobileSubmenu = (menuName) => {
    setActiveMobileSubmenu((prev) => (prev === menuName ? null : menuName));
  };

  // Active path checkers
  const isPathActive = (path) => location.pathname === path;
  const isPurchasesActive = location.pathname.startsWith("/purchases");
  const isSalesActive = location.pathname.startsWith("/sales");
  const isProductsActive =
    ["/products", "/stock", "/brands-models", "/warehouse"].includes(location.pathname);

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.username || "Usuario"
  )}&background=F28C28&color=fff&rounded=true&bold=true`;

  return (
    <header className="navbar">
      {/* Brand */}
      <Link to="/home" className="nav-brand">
        <i className="fa-solid fa-sun text-[var(--primary)] text-2xl"></i>
        <span>Fusión Solar</span>
      </Link>

      {/* Navigation Menu */}
      <ul className={`nav-menu ${isMobileOpen ? "active" : ""}`} id="nav-menu">
        {/* 1. Dashboard / Inicio */}
        <li className={`nav-item ${isPathActive("/home") ? "active" : ""}`}>
          <Link to="/home" className="nav-link">
            <i className="fa-solid fa-house"></i>
            <span>Inicio</span>
          </Link>
        </li>

        {/* 2. Clientes */}
        <li className={`nav-item ${isPathActive("/customers") ? "active" : ""}`}>
          <Link to="/customers" className="nav-link">
            <i className="fa-solid fa-users"></i>
            <span>Clientes</span>
          </Link>
        </li>

        {/* 3. Proveedores (solo staff) */}
        {user?.is_staff && (
          <li className={`nav-item ${isPathActive("/suppliers") ? "active" : ""}`}>
            <Link to="/suppliers" className="nav-link">
              <i className="fa-solid fa-truck"></i>
              <span>Proveedores</span>
            </Link>
          </li>
        )}

        {/* 4. Compras (Dropdown - solo staff) */}
        {user?.is_staff && (
          <li
            className={`nav-item ${isPurchasesActive ? "active" : ""} ${
              activeMobileSubmenu === "compras" ? "mobile-open" : ""
            }`}
          >
            <button
              type="button"
              className="nav-link w-full text-left"
              onClick={() => toggleMobileSubmenu("compras")}
            >
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-cart-shopping"></i>
                <span>Compras</span>
              </span>
              <i className="fa-solid fa-chevron-down"></i>
            </button>
            <ul className="dropdown-menu">
              <li>
                <Link
                  to="/purchases"
                  className={`dropdown-item ${isPathActive("/purchases") ? "active" : ""}`}
                >
                  <i className="fa-solid fa-file-circle-plus"></i>
                  <span>Registrar compra</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/purchases-history"
                  className={`dropdown-item ${
                    isPathActive("/purchases-history") ? "active" : ""
                  }`}
                >
                  <i className="fa-solid fa-clock-rotate-left"></i>
                  <span>Historial de compras</span>
                </Link>
              </li>
            </ul>
          </li>
        )}

        {/* 5. Ventas (Dropdown) */}
        <li
          className={`nav-item ${isSalesActive ? "active" : ""} ${
            activeMobileSubmenu === "ventas" ? "mobile-open" : ""
          }`}
        >
          <button
            type="button"
            className="nav-link w-full text-left"
            onClick={() => toggleMobileSubmenu("ventas")}
          >
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-file-invoice-dollar"></i>
              <span>Ventas</span>
            </span>
            <i className="fa-solid fa-chevron-down"></i>
          </button>
          <ul className="dropdown-menu">
            <li>
              <Link
                to="/sales"
                className={`dropdown-item ${isPathActive("/sales") ? "active" : ""}`}
              >
                <i className="fa-solid fa-cash-register"></i>
                <span>Registrar venta</span>
              </Link>
            </li>
            <li>
              <Link
                to="/sales-history"
                className={`dropdown-item ${isPathActive("/sales-history") ? "active" : ""}`}
              >
                <i className="fa-solid fa-receipt"></i>
                <span>Historial de ventas</span>
              </Link>
            </li>
          </ul>
        </li>

        {/* 6. Productos / Inventario (Dropdown) */}
        <li
          className={`nav-item ${isProductsActive ? "active" : ""} ${
            activeMobileSubmenu === "productos" ? "mobile-open" : ""
          }`}
        >
          <button
            type="button"
            className="nav-link w-full text-left"
            onClick={() => toggleMobileSubmenu("productos")}
          >
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-boxes-stacked"></i>
              <span>Productos</span>
            </span>
            <i className="fa-solid fa-chevron-down"></i>
          </button>
          <ul className="dropdown-menu">
            <li>
              <Link
                to="/products"
                className={`dropdown-item ${isPathActive("/products") ? "active" : ""}`}
              >
                <i className="fa-solid fa-box"></i>
                <span>Catálogo de productos</span>
              </Link>
            </li>
            <li>
              <Link
                to="/stock"
                className={`dropdown-item ${isPathActive("/stock") ? "active" : ""}`}
              >
                <i className="fa-solid fa-warehouse"></i>
                <span>Stock / Inventario</span>
              </Link>
            </li>
            {user?.is_staff && (
              <>
                <li>
                  <Link
                    to="/brands-models"
                    className={`dropdown-item ${
                      isPathActive("/brands-models") ? "active" : ""
                    }`}
                  >
                    <i className="fa-solid fa-tags"></i>
                    <span>Marcas y modelos</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/warehouse"
                    className={`dropdown-item ${
                      isPathActive("/warehouse") ? "active" : ""
                    }`}
                  >
                    <i className="fa-solid fa-dolly"></i>
                    <span>Gestión de bodegas</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </li>

        {/* 7. Backups (solo staff) */}
        {user?.is_staff && (
          <li className={`nav-item ${isPathActive("/backups") ? "active" : ""}`}>
            <Link to="/backups" className="nav-link">
              <i className="fa-solid fa-database"></i>
              <span>Backups</span>
            </Link>
          </li>
        )}

        {/* 8. Ayuda */}
        <li className={`nav-item ${isPathActive("/help") ? "active" : ""}`}>
          <Link to="/help" className="nav-link">
            <i className="fa-solid fa-circle-question"></i>
            <span>Ayuda</span>
          </Link>
        </li>
      </ul>

      {/* Right Actions */}
      <div className="nav-actions">
        {/* Dark/Light Theme Button */}
        <button
          type="button"
          className={`theme-btn ${isRotating ? "rotating" : ""}`}
          onClick={toggleTheme}
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          aria-label="Cambiar tema"
        >
          <i
            className={`fa-solid ${isDark ? "fa-sun" : "fa-moon"}`}
            style={isDark ? { color: "var(--accent)" } : {}}
          ></i>
        </button>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 focus:outline-none p-1 rounded-full hover:ring-2 hover:ring-[var(--primary)] transition-all cursor-pointer"
            aria-label="Menú de usuario"
          >
            <img
              src={avatarUrl}
              alt="Avatar"
              className="user-avatar"
            />
            <span className="hidden md:inline font-semibold text-sm text-[var(--text-main)]">
              {user?.username || "Usuario"}
            </span>
            <i
              className={`fa-solid fa-chevron-down text-xs text-[var(--text-sec)] transition-transform duration-300 ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            ></i>
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-[var(--bg-glass-dropdown)] backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-2xl p-2 z-50 animate-[fadeUp_0.3s_var(--ease-bounce)]">
              <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                <p className="font-semibold text-sm text-[var(--text-main)]">
                  {user?.username || "Usuario"}
                </p>
                <p className="text-xs text-[var(--text-sec)] flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)] inline-block"></span>
                  {user?.is_staff ? "Administrador" : "Personal"}
                </p>
              </div>
              {user?.is_staff && (
                <Link
                  to="/employees"
                  className="w-full text-left px-3 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors flex items-center gap-2 font-medium cursor-pointer mb-1"
                >
                  <i className="fa-solid fa-users-gear text-[var(--primary)] text-xs"></i>
                  <span>Gestión de usuarios</span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-[var(--danger)] hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition-colors flex items-center gap-2 font-medium cursor-pointer"
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle (Hamburger) */}
        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-label="Abrir menú"
        >
          <i
            className={`fa-solid ${
              isMobileOpen ? "fa-xmark" : "fa-bars-staggered"
            }`}
          ></i>
        </button>
      </div>
    </header>
  );
}

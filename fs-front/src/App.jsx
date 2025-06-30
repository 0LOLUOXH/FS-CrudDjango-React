import React from 'react';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navegation } from './components/navegation';
import Login from './pages/login';
import ResetPassword from './pages/resetPassword';
import PasswordResetPage from './pages/PasswordResetPage';
import { PrivateRoute } from './auth/PrivateRoute';
import { AuthProvider } from './auth/AuthContext';
import './app.css';
import HelpPage from './pages/HelpPage'; // Importa la nueva página de ayuda

//  IMPORTACIONES PARA TOASTIFY
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fr } from 'date-fns/locale';

const pages = [
  { path: '/inicio', component: lazy(() => import('./pages/inicio')) },
  { path: '/compras', component: lazy(() => import('./pages/compras')) },
  { path: '/ventas', component: lazy(() => import('./pages/ventas')) },
  { path: '/producto', component: lazy(() => import('./pages/producto')) },
  { path: '/marcasymodelos', component: lazy(() => import('./pages/marcasymodelos')) },
  { path: '/clientes', component: lazy(() => import('./pages/clientes')) },
  { path: '/bodega', component: lazy(() => import('./pages/bodega')) },
  { path: '/proveedores', component: lazy(() => import('./pages/proveedores')) },
  { path: '/empleados', component: lazy(() => import('./pages/empleados')) },
  { path: '/stock', component: lazy(() => import('./pages/stock')) },
  { path: '/historialventa', component: lazy(() => import('./pages/historialventa')) },
  { path: '/historialcompra', component: lazy(() => import('./pages/historialcompra')) },
  { path: '/backups', component: lazy(() => import('./pages/backups')) },
  { path: '/ayuda', component: HelpPage }, // Ruta para la página de ayuda

];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirigir `/` a `/login` */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rutas públicas (sin autenticación) */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<PasswordResetPage />} />
          
          

          

          {/* Rutas protegidas (requieren autenticación) */}
          <Route element={<PrivateRoute />}>
            {pages.map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <>
                   <Navegation />
      <div className="ml-[260px] pt-[80px]"> {/* 👈 Contenedor corregido */}
        <Suspense fallback={<div>Cargando...</div>}>
          <Component />
        </Suspense>
      </div>
                  </>
                }
              />
            ))}
          </Route>
        </Routes>
        {/*  TOAST CONTAINER ACTIVO PARA TODA LA APP */}
        <ToastContainer position="top-right" autoClose={5000} pauseOnHover theme="colored" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
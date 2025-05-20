import React from 'react'
import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navegation } from './components/navegation'
import './app.css'

const pages = [
  { path: '/', component: lazy(() => import('./pages/inicio')) },
  { path: '/compras', component: lazy(() => import('./pages/compras')) },
  { path: '/ventas', component: lazy(() => import('./pages/ventas')) },
  { path: '/producto', component: lazy(() => import('./pages/producto')) }, 
  { path: '/marcasymodelos', component: lazy(() => import('./pages/marcasymodelos')) }, 
  { path: '/clientes', component: lazy(() => import('./pages/clientes')) }, 
  { path: '/bodega', component: lazy(() => import('./pages/bodega')) }, 
  { path: '/proveedores', component: lazy(() => import('./pages/proveedores')) }, 
  { path: '/empleados', component: lazy(() => import('./pages/empleados')) }, 
  { path: '/inventario', component: lazy(() => import('./pages/inventario')) }, 
  { path: '/stock', component: lazy(() => import('./pages/stock')) }, 
  { path: '/historialventa', component: lazy(() => import('./pages/historialventa')) }, 
  { path: '/historialcompra', component: lazy(() => import('./pages/historialcompra')) }, 
  // Agrega más rutas
];

function App (){
  return (
    <BrowserRouter>
    <Navegation />
      <Routes>
        {pages.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}

export default App
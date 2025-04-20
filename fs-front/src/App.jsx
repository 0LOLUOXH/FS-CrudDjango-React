import React from 'react'
import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navegation } from './components/navegation'
//import './app.css'

const pages = [
  { path: '/', component: lazy(() => import('./pages/inicio')) },
  { path: '/compras', component: lazy(() => import('./pages/compras')) },
  { path: '/ventas', component: lazy(() => import('./pages/ventas')) },
  { path: '/producto', component: lazy(() => import('./pages/producto')) }, 
  { path: '/addproducto', component: lazy(() => import('./pages/addproducto')) }, 
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
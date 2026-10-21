import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainNavigation } from './components/MainNavigation';
import Login from './features/auth/pages/LoginPage';
import ResetPassword from './features/auth/pages/ResetPasswordPage';
import PasswordResetPage from './features/auth/pages/PasswordResetPage';
import { PrivateRoute } from './auth/PrivateRoute';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';
import HelpPage from './features/config/pages/HelpPage'; 

import { ErrorBoundary } from './components/ErrorBoundary';

//  IMPORTACIONES PARA TOASTIFY
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy loaded components
const DashboardHomePage = lazy(() => import('./features/dashboard/pages/DashboardHomePage'));
const PurchaseOrderPage = lazy(() => import('./features/purchases/pages/PurchaseOrderPage'));
const PointOfSalePage = lazy(() => import('./features/sales/pages/PointOfSalePage'));
const ProductCatalogPage = lazy(() => import('./features/inventory/pages/ProductCatalogPage'));
const BrandModelManagementPage = lazy(() => import('./features/inventory/pages/BrandModelManagementPage'));
const CustomerManagementPage = lazy(() => import('./features/customers/pages/CustomerManagementPage'));
const WarehouseManagementPage = lazy(() => import('./features/inventory/pages/WarehouseManagementPage'));
const SupplierManagementPage = lazy(() => import('./features/suppliers/pages/SupplierManagementPage'));
const InventoryStockPage = lazy(() => import('./features/inventory/pages/InventoryStockPage'));
const SalesLedgerPage = lazy(() => import('./features/sales/pages/SalesLedgerPage'));
const PurchaseLedgerPage = lazy(() => import('./features/purchases/pages/PurchaseLedgerPage'));
const BackupsPage = lazy(() => import('./features/config/pages/BackupsPage'));
const EmployeeManagementPage = lazy(() => import('./features/inventory/pages/EmployeeManagementPage'));

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-500">
    <MainNavigation />
    <main className="flex-1 w-full max-w-7xl mx-auto pt-[70px] px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-3">
              <i className="fa-solid fa-sun fa-spin text-3xl text-[var(--primary)]"></i>
              <span className="text-sm text-[var(--text-sec)] font-medium">Cargando módulo...</span>
            </div>
          </div>
        }>
          {children}
        </Suspense>
      </ErrorBoundary>
    </main>
    <footer className="py-6 text-center text-sm border-t border-[var(--border)] text-[var(--text-sec)] mt-auto transition-colors">
      &copy; {new Date().getFullYear()} <strong className="text-[var(--primary)] font-semibold">Fusion Solar</strong> ERP. Energía que transforma.
    </footer>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<PasswordResetPage />} />
            <Route element={<PrivateRoute />}>
              <Route path="/home" element={<Layout><DashboardHomePage /></Layout>} />
              <Route path="/purchases" element={<Layout><PurchaseOrderPage /></Layout>} />
              <Route path="/sales" element={<Layout><PointOfSalePage /></Layout>} />
              <Route path="/products" element={<Layout><ProductCatalogPage /></Layout>} />
              <Route path="/brands-models" element={<Layout><BrandModelManagementPage /></Layout>} />
              <Route path="/customers" element={<Layout><CustomerManagementPage /></Layout>} />
              <Route path="/warehouse" element={<Layout><WarehouseManagementPage /></Layout>} />
              <Route path="/suppliers" element={<Layout><SupplierManagementPage /></Layout>} />
              <Route path="/stock" element={<Layout><InventoryStockPage /></Layout>} />
              <Route path="/sales-history" element={<Layout><SalesLedgerPage /></Layout>} />
              <Route path="/purchases-history" element={<Layout><PurchaseLedgerPage /></Layout>} />
              <Route path="/backups" element={<Layout><BackupsPage /></Layout>} />
              <Route path="/employees" element={<Layout><EmployeeManagementPage /></Layout>} />
              <Route path="/help" element={<Layout><HelpPage /></Layout>} />
            </Route>
          </Routes>
          <ToastContainer position="top-right" autoClose={5000} pauseOnHover theme="colored" />
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
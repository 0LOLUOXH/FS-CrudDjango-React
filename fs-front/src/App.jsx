import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainNavigation } from './components/MainNavigation';
import Login from './features/auth/pages/LoginPage';
import ResetPassword from './features/auth/pages/ResetPasswordPage';
import PasswordResetPage from './features/auth/pages/PasswordResetPage';
import { PrivateRoute } from './auth/PrivateRoute';
import { UserProvider } from './contexts/UserContext';
import './app.css';
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

const Layout = ({ children }) => (
  <>
    <MainNavigation />
    <div className="ml-0 lg:ml-60 mt-20 px-4 transition-all duration-300">
      <ErrorBoundary>
        <Suspense fallback={<div>Cargando...</div>}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </div>
  </>
);

function App() {
  return (
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
            <Route path="/help" element={<Layout><HelpPage /></Layout>} />
          </Route>
        </Routes>
        <ToastContainer position="top-right" autoClose={5000} pauseOnHover theme="colored" />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
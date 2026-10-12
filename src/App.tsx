import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MessProvider, useMess } from './store/MessContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BillingPage } from './pages/BillingPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { ProductsPage } from './pages/ProductsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { InventoryPage } from './pages/InventoryPage';
import { CashiersPage } from './pages/CashiersPage';
import { ReconciliationPage } from './pages/ReconciliationPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SettingsPage } from './pages/SettingsPage';

// Route guard for role-based access
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const { currentUser } = useMess();

  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/billing" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <MessProvider>
      <BrowserRouter>
        <Routes>
          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Core Application Layout */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/:id" element={<StudentProfilePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route
              path="analytics"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="inventory"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <InventoryPage />
                </ProtectedRoute>
              }
            />
            <Route path="cashiers" element={<CashiersPage />} />
            <Route
              path="reconciliation"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <ReconciliationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MessProvider>
  );
}

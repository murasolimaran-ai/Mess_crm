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
import { StudentPortalPage } from './pages/StudentPortalPage';

// Route guard for role-based access
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireAdmin?: boolean;
  staffOnly?: boolean;
}> = ({ children, requireAdmin = false, staffOnly = false }) => {
  const { currentUser, isLoggedIn } = useMess();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If a student tries to access admin or cashier staff pages, redirect strictly to their own portal
  if (currentUser.role === 'student') {
    return <Navigate to="/student-portal" replace />;
  }

  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/billing" replace />;
  }

  return <>{children}</>;
};

// Home index resolver based on role
const RoleIndexRedirect: React.FC = () => {
  const { currentUser, isLoggedIn } = useMess();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role === 'student') {
    return <Navigate to="/student-portal" replace />;
  }
  if (currentUser.role === 'cashier') {
    return <Navigate to="/billing" replace />;
  }
  return <DashboardPage />;
};

// Student Portal Route with Auth check
const StudentPortalRoute: React.FC = () => {
  const { isLoggedIn } = useMess();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <StudentPortalPage />;
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
            <Route index element={<RoleIndexRedirect />} />

            {/* Student Self-Service Portal (accessible to students, and admins for inspection) */}
            <Route path="student-portal" element={<StudentPortalRoute />} />

            {/* Staff / Cashier / Admin POS & Operational Pages */}
            <Route
              path="billing"
              element={
                <ProtectedRoute staffOnly={true}>
                  <BillingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="students"
              element={
                <ProtectedRoute staffOnly={true}>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="students/:id"
              element={
                <ProtectedRoute staffOnly={true}>
                  <StudentProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="products"
              element={
                <ProtectedRoute staffOnly={true}>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="transactions"
              element={
                <ProtectedRoute staffOnly={true}>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="cashiers"
              element={
                <ProtectedRoute staffOnly={true}>
                  <CashiersPage />
                </ProtectedRoute>
              }
            />

            {/* Admin-Only Management Pages */}
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

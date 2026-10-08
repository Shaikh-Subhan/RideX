import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ComparisonProvider } from './context/ComparisonContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';
import CompareDrawer from './components/renter/CompareDrawer';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Renter Pages
import HomePage from './pages/renter/HomePage';
import ExploreCarsPage from './pages/renter/ExploreCarsPage';
import VehicleDetailPage from './pages/renter/VehicleDetailPage';
import ComparePage from './pages/renter/ComparePage';
import MyBookingsPage from './pages/renter/MyBookingsPage';

// Owner Pages
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import MyVehiclesPage from './pages/owner/MyVehiclesPage';
import AddEditVehiclePage from './pages/owner/AddEditVehiclePage';
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage';
import OwnerEarningsPage from './pages/owner/OwnerEarningsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminVerificationPage from './pages/admin/AdminVerificationPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminVehiclesPage from './pages/admin/AdminVehiclesPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';

// Shared Pages
import NotificationsPage from './pages/common/NotificationsPage';
import ProfilePage from './pages/common/ProfilePage';
import NotFoundPage from './pages/common/NotFoundPage';

export function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ComparisonProvider>
              <div className="min-h-screen flex flex-col bg-rx-page text-rx-main font-sans antialiased selection:bg-rx-accent selection:text-rx-on-accent transition-colors duration-200">
                <Navbar />

                <main className="flex-1">
                  <Routes>
                  {/* Public Marketplace Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/cars" element={<ExploreCarsPage />} />
                  <Route path="/cars/:id" element={<VehicleDetailPage />} />
                  <Route path="/compare" element={<ComparePage />} />

                  {/* Authenticated User Routes */}
                  <Route
                    path="/bookings"
                    element={
                      <ProtectedRoute>
                        <MyBookingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Owner / Host Protected Routes */}
                  <Route
                    path="/owner"
                    element={
                      <RoleRoute allowedRoles={['owner']}>
                        <OwnerDashboardPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/owner/vehicles"
                    element={
                      <RoleRoute allowedRoles={['owner']}>
                        <MyVehiclesPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/owner/vehicles/new"
                    element={
                      <RoleRoute allowedRoles={['owner']}>
                        <AddEditVehiclePage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/owner/vehicles/:id/edit"
                    element={
                      <RoleRoute allowedRoles={['owner']}>
                        <AddEditVehiclePage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/owner/bookings"
                    element={
                      <RoleRoute allowedRoles={['owner']}>
                        <OwnerBookingsPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/owner/earnings"
                    element={
                      <RoleRoute allowedRoles={['owner']}>
                        <OwnerEarningsPage />
                      </RoleRoute>
                    }
                  />

                  {/* Admin Governance Routes */}
                  <Route
                    path="/admin"
                    element={
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/verification"
                    element={
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminVerificationPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminUsersPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/vehicles"
                    element={
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminVehiclesPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/bookings"
                    element={
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminBookingsPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/payments"
                    element={
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminPaymentsPage />
                      </RoleRoute>
                    }
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              <Footer />
              <CompareDrawer />
            </div>
          </ComparisonProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </Router>
);
}

export default App;

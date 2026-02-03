import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import NewDemande from './pages/NewDemande';
import DemandeDetails from './pages/DemandeDetails';

const AppRoutes = () => {
  const { user } = useAuth();

  const getDashboardRoute = () => {
    if (!user) return '/login';
    
    // Redirect admin users to admin dashboard
    if (['secretaire', 'doyen', 'libraire', 'bibliothecaire', 'comptable', 'academique'].includes(user.role)) {
      return '/admin';
    }
    
    return '/dashboard';
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes - Students */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['etudiant']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nouvelle-demande"
        element={
          <ProtectedRoute allowedRoles={['etudiant']}>
            <NewDemande />
          </ProtectedRoute>
        }
      />

      {/* Protected routes - Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['secretaire', 'doyen', 'libraire', 'bibliothecaire', 'comptable', 'academique']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected routes - All authenticated users */}
      <Route
        path="/demande/:id"
        element={
          <ProtectedRoute>
            <DemandeDetails />
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route
        path="/"
        element={<Navigate to={getDashboardRoute()} replace />}
      />

      {/* Catch all - redirect to appropriate dashboard */}
      <Route
        path="*"
        element={<Navigate to={getDashboardRoute()} replace />}
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
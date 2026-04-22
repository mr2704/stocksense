import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Signup from './pages/Signup';
import Login from './pages/Login';

// ── Guard: redirect to /login when not authenticated ────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-secondary)',
        fontSize: '14px', gap: '12px',
      }}>
        <span style={{ fontSize: '24px' }}>📦</span> Loading StockSense…
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login"  element={<Login />} />

            {/* Protected routes — require auth */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index              element={<Dashboard />} />
              <Route path="inventory"  element={<Inventory />} />
              <Route path="analytics"  element={<Analytics />} />
              <Route path="settings"   element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </InventoryProvider>
    </AuthProvider>
  );
}

export default App;

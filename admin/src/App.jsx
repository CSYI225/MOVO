import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Bailleurs from './pages/Bailleurs/Bailleurs';
import Locataires from './pages/Locataires/Locataires';
import Biens from './pages/Biens/Biens';
import Moderation from './pages/Moderation/Moderation';

function ProtectedLayout() {
  const { admin } = useAuth();
  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-layout">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bailleurs" element={<Bailleurs />} />
            <Route path="/locataires" element={<Locataires />} />
            <Route path="/biens" element={<Biens />} />
            <Route path="/moderation" element={<Moderation />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

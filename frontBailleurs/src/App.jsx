import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Biens from './pages/Biens/Biens';
import BienDetail from './pages/Biens/BienDetail';
import UnitDetail from './pages/Biens/UnitDetail';
import Locataires from './pages/Locataires/Locataires';
import LocataireDetail from './pages/Locataires/LocataireDetail';
import TenantHistoryDetail from './pages/Locataires/TenantHistoryDetail';
import Rapports from './pages/Rapports/Rapports';
import Abonnement from './pages/Abonnement/Abonnement';
import Profile from './pages/Profile/Profile';
import Auth from './pages/Auth/Auth';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

function AppRoutes() {
  const { user } = useAuth();

  if (!user?.isLoggedIn) {
    return <Auth />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="biens" element={<Biens />} />
        <Route path="biens/:id" element={<BienDetail />} />
        <Route path="biens/:id/unite/:unitId" element={<UnitDetail />} />
        <Route path="locataires" element={<Locataires />} />
        <Route path="locataires/:id" element={<LocataireDetail />} />
        <Route path="locataires/:id/historique/:historyId" element={<TenantHistoryDetail />} />
        <Route path="rapports" element={<Rapports />} />
        <Route path="abonnement" element={<Abonnement />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

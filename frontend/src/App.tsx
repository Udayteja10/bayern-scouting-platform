import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import SquadPage from './pages/Squad/SquadPage';
import PlayersPage from './pages/Players/PlayersPage';
import PlayerDetailPage from './pages/Players/PlayerDetailPage';
import ScoutingPage from './pages/Scouting/ScoutingPage';
import TransfersPage from './pages/Transfers/TransfersPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import SyncPage from './pages/Sync/SyncPage';
import { ShortlistProvider } from './store/shortlist';
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen bg-bayern-dark flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-bayern-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-bayern-text-secondary">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ShortlistProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="squad" element={<SquadPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="players/:id" element={<PlayerDetailPage />} />
          <Route path="scouting" element={<ScoutingPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="sync" element={<SyncPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
    </ShortlistProvider>
  );
}

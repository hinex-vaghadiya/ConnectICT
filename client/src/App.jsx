import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import People from './pages/People';
import CompanyExplorer from './pages/CompanyExplorer';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Jobs from './pages/Jobs';
import Forum from './pages/Forum';
import PostDetail from './pages/PostDetail';
import Messages from './pages/Messages';
import Events from './pages/Events';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  return user?.isAdmin ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
        <Route path="/companies" element={<ProtectedRoute><CompanyExplorer /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
        <Route path="/forum/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

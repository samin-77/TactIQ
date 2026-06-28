import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Trophy, Home as HomeIcon, Calendar, Users, BarChart3, ShieldAlert, LogOut } from 'lucide-react';
import './index.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Standings from './pages/Standings';
import MatchDetail from './pages/MatchDetail';
import Fantasy from './pages/Fantasy';
import Stats from './pages/Stats';
import AdminDashboard from './pages/AdminDashboard';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <Trophy size={28} />
        <span>TactIQ</span>
      </Link>
      <div className="navbar-links">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          <HomeIcon size={18} /> Home
        </Link>
        <Link to="/standings" className={`nav-link ${isActive('/standings') ? 'active' : ''}`}>
          <Calendar size={18} /> Standings
        </Link>
        <Link to="/fantasy" className={`nav-link ${isActive('/fantasy') ? 'active' : ''}`}>
          <Users size={18} /> Fantasy
        </Link>
        <Link to="/stats" className={`nav-link ${isActive('/stats') ? 'active' : ''}`}>
          <BarChart3 size={18} /> Stats
        </Link>
        {user && user.role === 'ADMIN' && (
          <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
            <ShieldAlert size={18} /> Admin
          </Link>
        )}
        {user ? (
          <button onClick={logout} className="nav-btn-logout">
            <LogOut size={16} /> Logout
          </button>
        ) : (
          <>
            <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>Login</Link>
            <Link to="/register" className={`nav-link ${isActive('/register') ? 'active' : ''}`}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
          <Route path="/fantasy" element={<Fantasy />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; 2026 TactIQ - FIFA World Cup 2026 Fan & Analytics Platform</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

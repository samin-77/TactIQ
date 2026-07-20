import { useState, useEffect, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Trophy, Home as HomeIcon, Calendar, Users, BarChart3, ShieldAlert, LogOut, Moon, Sun, BookOpen, Brain, MapPin, Shirt } from 'lucide-react';
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
import History from './pages/History';
import Quiz from './pages/Quiz';
import Venues from './pages/Venues';
import Squads from './pages/Squads';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ color: 'var(--color-gold)' }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>An unexpected error occurred. Please try refreshing the page.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go Home</Link>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '4rem', color: 'var(--color-gold)', margin: 0 }}>404</h1>
      <h2 style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('tactiq-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tactiq-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

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
        {user && (
          <>
            <Link to="/standings" className={`nav-link ${isActive('/standings') ? 'active' : ''}`}>
              <Calendar size={18} /> Standings
            </Link>
            <Link to="/fantasy" className={`nav-link ${isActive('/fantasy') ? 'active' : ''}`}>
              <Users size={18} /> Fantasy
            </Link>
            <Link to="/stats" className={`nav-link ${isActive('/stats') ? 'active' : ''}`}>
              <BarChart3 size={18} /> Stats
            </Link>
            <Link to="/history" className={`nav-link ${isActive('/history') ? 'active' : ''}`}>
              <BookOpen size={18} /> History
            </Link>
            <Link to="/quiz" className={`nav-link ${isActive('/quiz') ? 'active' : ''}`}>
              <Brain size={18} /> Quiz
            </Link>
            <Link to="/venues" className={`nav-link ${isActive('/venues') ? 'active' : ''}`}>
              <MapPin size={18} /> Venues
            </Link>
            <Link to="/squads" className={`nav-link ${isActive('/squads') ? 'active' : ''}`}>
              <Shirt size={18} /> Squads
            </Link>
            {user.role === 'ADMIN' && (
              <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                <ShieldAlert size={18} /> Admin
              </Link>
            )}
          </>
        )}
        <button onClick={toggleTheme} className="theme-toggle" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
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
    <ErrorBoundary>
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
          <Route path="/history" element={<History />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/squads" element={<Squads />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; 2026 TactIQ &mdash; Made with ❤️ by Ishfak Mahbub Samin &bull; Syed Owin Efaz &bull; Sharmin Akter Mim</p>
      </footer>
    </div>
    </ErrorBoundary>
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

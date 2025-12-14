import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <header className="App-header">
      <h1>
        <Link to="/" className="logo-link">
          Sweet Shop Management System
        </Link>
      </h1>
      <nav className="nav-links">
        <Link to="/dashboard" className="nav-link">
          Dashboard
        </Link>
        {isAuthenticated() ? (
          <>
            <span className="user-info">
              Welcome, {user?.name} {user?.role === 'admin' && '(Admin)'}
            </span>
            <button onClick={logout} className="nav-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link">
              Register
            </Link>
          </>
function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-container">
      <h2>Welcome to Sweet Shop Management System</h2>
      {isAuthenticated() ? (
        <div>
          <p>Hello, {user?.name}! You are logged in.</p>
          {user?.role === 'admin' && (
            <p className="admin-badge">You have administrator privileges.</p>
          )}
          <div className="home-actions">
            <Link to="/dashboard" className="home-link">
              View Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <p>Please login or register to continue.</p>
          <div className="home-actions">
            <Link to="/dashboard" className="home-link">
              Browse Sweets
            </Link>
            <Link to="/login" className="home-link">
              Login
            </Link>
            <Link to="/register" className="home-link">
              Register
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}             Register
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

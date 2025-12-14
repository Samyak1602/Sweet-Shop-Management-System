import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
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
      <h1>Sweet Shop Management System</h1>
      <nav className="nav-links">
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
        )}
      </nav>
    </header>
  );
}

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
        </div>
      ) : (
        <div>
          <p>Please login or register to continue.</p>
          <div className="home-actions">
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
}

export default App;

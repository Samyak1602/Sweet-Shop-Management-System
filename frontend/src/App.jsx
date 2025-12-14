import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Sweet Shop Management System</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* TODO: Add more routes */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h2>Welcome to Sweet Shop Management System</h2>
      <p>Frontend is ready for development!</p>
    </div>
  );
}

export default App;

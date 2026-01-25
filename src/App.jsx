import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LocusPage from './pages/LocusPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="main-nav">
          <Link to="/" className="nav-logo">CGD</Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <a href="#browse">Browse</a>
            <a href="#tools">Tools</a>
            <a href="#download">Download</a>
            <a href="#about">About</a>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/locus/:name" element={<LocusPage />} />
        </Routes>

        <footer className="main-footer">
          <p>&copy; 2024 Candida Genome Database. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;

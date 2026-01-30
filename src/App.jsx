import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LocusPage from './pages/LocusPage';
import ReferencePage from './pages/ReferencePage';
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
          <Route path="/reference/:id" element={<ReferencePage />} />
        </Routes>

        <footer className="main-footer">
          <div className="footer-nav">
            <div className="footer-left">
              <Link to="/">
                <span className="arrow-up">↑</span> Return to CGD
              </Link>
            </div>
            <div className="footer-right">
              <a href="/cgi-bin/suggestion">
                Send a Message to the CGD Curators <span className="email-icon">✉</span>
              </a>
            </div>
          </div>
          <div className="footer-copyright">
            <p>
              &copy; 2004–{new Date().getFullYear()} The Board of Trustees of the Leland Stanford Junior University.
              {' '}Please see <a href="/HowToCite.shtml">How to cite CGD</a>.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

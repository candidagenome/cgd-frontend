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
              <strong>CGD Copyright</strong> &copy; 2004–{new Date().getFullYear()} The Board of Trustees, Leland Stanford Junior University.
            </p>
            <p>
              Permission to use the information contained in this database was given by the researchers/institutes
              who contributed or published the information. Users of the database are solely responsible for compliance
              with any copyright restrictions, including those applying to the author abstracts. Documents from this
              server are provided "AS-IS" without any warranty, expressed or implied.
            </p>
            <p className="citation-text">
              <span className="cite-label">To cite CGD</span>, please use the following reference:{' '}
              Skrzypek MS, Binkley J, Binkley G, Miyasato SR, Simison M, Sherlock G (2017).{' '}
              The Candida Genome Database (CGD): incorporation of Assembly 22, systematic identifiers
              and visualization of high throughput sequencing data.{' '}
              <em>Nucleic Acids Res</em> <strong>45</strong> (D1); D592-D596;{' '}
              see <a href="/HowToCite.shtml">How to cite CGD</a>.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

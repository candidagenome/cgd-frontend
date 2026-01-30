import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LocusPage from './pages/LocusPage';
import ReferencePage from './pages/ReferencePage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import HowToCitePage from './pages/HowToCitePage';
import SiteMapPage from './pages/SiteMapPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        {/* =========================
            CGD-style Header (legacy-like)
           ========================= */}
        <header className="site-header">
          {/* Top utility row */}
          <div className="header-top">
            <div className="header-left">
              <Link to="/" className="site-logo">
                <img src="/images/logo1.jpg" alt="Candida Genome Database" />
              </Link>
            </div>

            <div className="header-right">
              <div className="header-utils">
                <nav className="utility-links" aria-label="Utility">
                  <Link to="/about">About</Link>
                  <Link to="/sitemap">Site Map</Link>
                  <Link to="/how-to-cite">How to Cite</Link>
                  <Link to="/help">Help</Link>
                </nav>

                <div className="header-icons">
                  <a
                    href="http://www.facebook.com/pages/Candida-Genome-Database/173482099381649"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="icon-link"
                    title="CGD on Facebook"
                  >
                    <span className="icon-facebook">f</span>
                  </a>

                  <a
                    href="/cgi-bin/suggestion"
                    className="icon-link"
                    title="Send a suggestion to CGD"
                  >
                    <span className="icon-email">✉</span>
                  </a>
                </div>
              </div>

              <form className="site-search" role="search" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  placeholder="search our site"
                  aria-label="Search CGD"
                />
                <button type="submit">Go</button>
              </form>
            </div>
          </div>

          {/* Main navigation bar */}
          <nav className="header-nav" aria-label="Main">
            <Link to="/">Home</Link>
            <a href="#search">Search</a>
            <a href="#jbrowse">JBrowse</a>
            <a href="#sequence">Sequence</a>
            <a href="#go">GO</a>
            <a href="#tools">Tools</a>
            <a href="#literature">Literature</a>
            <a href="#download">Download</a>
            <a href="#community">Community</a>
          </nav>
        </header>

        {/* =========================
            Routes
           ========================= */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/locus/:name" element={<LocusPage />} />
          <Route path="/reference/:id" element={<ReferencePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/how-to-cite" element={<HowToCitePage />} />
          <Route path="/sitemap" element={<SiteMapPage />} />
        </Routes>

        {/* =========================
            Footer (CGD-style)
           ========================= */}
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
              <strong>CGD Copyright</strong> © 2004–{new Date().getFullYear()} The Board of Trustees,
              Leland Stanford Junior University.
            </p>

            <p>
              Permission to use the information contained in this database was given by the
              researchers/institutes who contributed or published the information. Users of the
              database are solely responsible for compliance with any copyright restrictions,
              including those applying to the author abstracts. Documents from this server are
              provided "AS-IS" without any warranty, expressed or implied.
            </p>

            <p className="citation-text">
              <span className="cite-label">To cite CGD</span>, please use the following reference:{' '}
              Skrzypek MS, Binkley J, Binkley G, Miyasato SR, Simison M, Sherlock G (2017).
              The Candida Genome Database (CGD): incorporation of Assembly 22, systematic identifiers
              and visualization of high throughput sequencing data.{' '}
              <em>Nucleic Acids Res</em> <strong>45</strong> (D1); D592–D596; see{' '}
              <Link to="/how-to-cite">How to cite CGD</Link>.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

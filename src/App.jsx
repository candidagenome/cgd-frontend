import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LocusPage from './pages/LocusPage';
import ReferencePage from './pages/ReferencePage';
import './App.css';

// Menu configuration based on menu.conf
const menuConfig = [
  { label: 'Home', url: '/' },
  {
    label: 'Search',
    url: '/SearchContents.shtml',
    submenu: [
      { label: 'BLAST', url: '/cgi-bin/compute/blast_clade.pl' },
      { label: 'GO Term Finder', url: '/cgi-bin/GO/goTermFinder' },
      { label: 'GO Slim Mapper', url: '/cgi-bin/GO/goTermMapper' },
      { label: 'Text Search', url: '/SearchContents.shtml' },
      { label: 'Primers', url: '/cgi-bin/compute/web-primer' },
      { label: 'PatMatch', url: '/cgi-bin/PATMATCH/nph-patmatch' },
      { label: 'Advanced Search', url: '/cgi-bin/search/featureSearch' },
    ],
  },
  {
    label: 'JBrowse',
    url: '/JBrowseContents.shtml',
    submenu: [
      { label: 'C. albicans', url: '/jbrowse/index.html?data=cgd_data%2FC_albicans_SC5314', italic: true },
      { label: 'C. auris', url: '/jbrowse/index.html?data=cgd_data%2FC_auris_B8441', italic: true },
      { label: 'C. dubliniensis', url: '/jbrowse/index.html?data=cgd_data%2FC_dubliniensis_CD36', italic: true },
      { label: 'C. glabrata', url: '/jbrowse/index.html?data=cgd_data%2FC_glabrata_CBS138', italic: true },
      { label: 'C. parapsilosis', url: '/jbrowse/index.html?data=cgd_data%2FC_parapsilosis_CDC317', italic: true },
    ],
  },
  {
    label: 'Sequence',
    url: '/SequenceContents.shtml',
    submenu: [
      { label: 'Gene/Seq Resources', url: '/cgi-bin/seqTools' },
      { label: 'PatMatch', url: '/cgi-bin/PATMATCH/nph-patmatch' },
      { label: 'Primers', url: '/cgi-bin/compute/web-primer' },
      { label: 'Genome Versions', url: '/cgi-bin/genomeVersionHistory.pl' },
      { label: 'Download Sequence', url: '/download/sequence/' },
      { label: 'Restriction Mapper', url: '/cgi-bin/PATMATCH/RestrictionMapper' },
    ],
  },
  {
    label: 'GO',
    url: '/GOContents.shtml',
    submenu: [
      { label: 'What is GO?', url: 'http://www.geneontology.org/page/ontology-documentation', external: true },
      { label: 'GO Slim Mapper', url: '/cgi-bin/GO/goTermMapper' },
      { label: 'GO Term Finder', url: '/cgi-bin/GO/goTermFinder' },
      { label: 'GO Consortium', url: 'http://www.geneontology.org/', external: true },
      { label: 'GO File Downloads', url: '/download/go/' },
    ],
  },
  {
    label: 'Tools',
    url: '/ToolContents.shtml',
    submenu: [
      { label: 'Batch Download', url: '/cgi-bin/batchDownload' },
      { label: 'Phenotypes', url: '/cache/PhenotypeTree.html' },
      { label: 'BLAST', url: '/cgi-bin/compute/blast_clade.pl' },
      { label: 'C. albicans Genome Snapshot', url: '/cache/C_albicans_SC5314_genomeSnapshot.html', italic: true },
      { label: 'C. auris Genome Snapshot', url: '/cache/C_auris_B8441_genomeSnapshot.html', italic: true },
      { label: 'C. dubliniensis Genome Snapshot', url: '/cache/C_dubliniensis_CD36_genomeSnapshot.html', italic: true },
      { label: 'C. glabrata Genome Snapshot', url: '/cache/C_glabrata_CBS138_genomeSnapshot.html', italic: true },
      { label: 'C. parapsilosis Genome Snapshot', url: '/cache/C_parapsilosis_CDC317_genomeSnapshot.html', italic: true },
    ],
  },
  {
    label: 'Literature',
    url: '/LiteratureContents.shtml',
    submenu: [
      { label: 'Highlighted Topics', url: '/TopicBiblios.shtml' },
      { label: 'Laboratory Strains and Lineage', url: '/Strains.shtml' },
    ],
  },
  {
    label: 'Download',
    url: '/DownloadContents.shtml',
    submenu: [
      { label: 'Batch Download', url: '/cgi-bin/batchDownload' },
      { label: 'GO Annotations', url: '/download/go/' },
      { label: 'Chromosomal Features', url: '/download/chromosomal_feature_files/' },
      { label: 'Sequence', url: '/download/sequence/' },
      { label: 'Datasets', url: '/cgi-bin/reference/refsWithData.pl' },
      { label: 'Browse Downloads', url: '/download/' },
    ],
  },
  {
    label: 'Community',
    url: '/ComContents.shtml',
    submenu: [
      { label: 'Search CGD colleagues', url: '/cgi-bin/colleague/colleagueInfoSearch' },
      { label: 'Find Candida labs', url: '/cache/Labs.html', italic: true },
      { label: 'Colleague Update', url: '/cgi-bin/colleague/colleagueSearch' },
      { label: 'CGD Public Wiki', url: 'http://publicwiki.candidagenome.org', external: true },
      { label: 'Community News', url: '/CommunityNews.shtml' },
      { label: 'Job Opportunities', url: '/JobPostings.shtml' },
      { label: 'Meetings & Courses', url: '/Meetings.shtml' },
      { label: 'Nomenclature Guide', url: '/Nomenclature.shtml' },
      { label: 'External Resources', url: '/ExternalResources.shtml' },
      { label: 'Gene Registry', url: '/cgi-bin/registry/geneRegistry' },
    ],
  },
];

function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/cgi-bin/search/quickSearch?query=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="cgd-header">
      {/* Top bar with logo, utility links, and search */}
      <div className="header-top">
        <div className="header-logo">
          <Link to="/" className="logo-link">
            <span className="logo-text">CGD</span>
          </Link>
        </div>

        <div className="header-right">
          <div className="header-links">
            <a href="/cgi-bin/suggestion" className="icon-link" title="Contact CGD">
              <span className="icon-email">✉</span>
            </a>
            <a
              href="http://www.facebook.com/pages/Candida-Genome-Database/173482099381649"
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link"
              title="CGD on Facebook"
            >
              <span className="icon-facebook">f</span>
            </a>
            <div className="header-menu">
              <a href="/AboutContents.shtml">About</a>
              <a href="/sitemap.shtml">Site Map</a>
              <a href="/HowToCite.shtml">How to Cite</a>
              <a href="/HelpContents.shtml">Help</a>
            </div>
          </div>

          <div className="header-search">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="search our site"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                Go
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main navigation menu */}
      <nav className="main-nav">
        <ul className="nav-menu">
          {menuConfig.map((item, index) => (
            <li
              key={index}
              className={`nav-item ${item.submenu ? 'has-submenu' : ''}`}
              onMouseEnter={() => setActiveMenu(index)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <a href={item.url} className="nav-link">
                {item.label}
                {item.submenu && <span className="dropdown-arrow">▼</span>}
              </a>
              {item.submenu && activeMenu === index && (
                <ul className="submenu">
                  {item.submenu.map((subItem, subIndex) => (
                    <li key={subIndex} className="submenu-item">
                      <a
                        href={subItem.url}
                        target={subItem.external ? '_blank' : undefined}
                        rel={subItem.external ? 'noopener noreferrer' : undefined}
                      >
                        {subItem.italic ? <em>{subItem.label}</em> : subItem.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Header />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/locus/:name" element={<LocusPage />} />
          <Route path="/reference/:id" element={<ReferencePage />} />
        </Routes>
        <footer className="main-footer">
          {/* Top navigation strip */}
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

        {/* Copyright block */}
        <div className="footer-copyright">
          <p>
            <strong>CGD Copyright</strong> © 2004–{new Date().getFullYear()} The Board of Trustees, Leland Stanford Junior University.
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
            <a href="/HowToCite.shtml">How to cite CGD</a>.
          </p>
        </div>
      </footer>	  	  
      </div>
    </Router>
  );
}

export default App;

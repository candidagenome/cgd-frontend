import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LocusPage from './pages/LocusPage';
import ReferencePage from './pages/ReferencePage';
import ProteinPropertyPage from './pages/ProteinPropertyPage';
import DomainPage from './pages/DomainPage';
import GoTermPage from './pages/GoTermPage';
import GoEvidencePage from './pages/GoEvidencePage';
import PhenotypeSearchPage from './pages/PhenotypeSearchPage';
import ObservableTermsPage from './pages/ObservableTermsPage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import HowToCitePage from './pages/HowToCitePage';
import SiteMapPage from './pages/SiteMapPage';
import GenomeSnapshotPage from './pages/GenomeSnapshotPage';
import LabsPage from './pages/LabsPage';
import GenomeWideAnalysisPage from './pages/GenomeWideAnalysisPage';
import StaffPage from './pages/StaffPage';
import FAQPage from './pages/FAQPage';
import GOResourcesPage from './pages/GOResourcesPage';
import CommunityPage from './pages/CommunityPage';
import SubmitDataPage from './pages/SubmitDataPage';
import SearchPage from './pages/SearchPage';
import MeetingsPage from './pages/MeetingsPage';
import CommunityNewsPage from './pages/CommunityNewsPage';
import JobPostingsPage from './pages/JobPostingsPage';
import ExternalResourcesPage from './pages/ExternalResourcesPage';
import NomenclaturePage from './pages/NomenclaturePage';
import DownloadPage from './pages/DownloadPage';
import LiteraturePage from './pages/LiteraturePage';
import TopicBibliosPage from './pages/TopicBibliosPage';
import StrainsPage from './pages/StrainsPage';
import ContactPage from './pages/ContactPage';

// Help documentation pages
import GettingStartedHelp from './pages/help/GettingStartedHelp';
import SequenceHelp from './pages/help/SequenceHelp';
import SearchFormHelp from './pages/help/SearchFormHelp';
import FeatureSearchHelp from './pages/help/FeatureSearchHelp';
import BlastHelp from './pages/help/BlastHelp';
import BlastResultsHelp from './pages/help/BlastResultsHelp';
import BiochemPathwaysHelp from './pages/help/BiochemPathwaysHelp';
import PhenoSearchHelp from './pages/help/PhenoSearchHelp';
import LiteratureTopicsHelp from './pages/help/LiteratureTopicsHelp';
import GSResourcesHelp from './pages/help/GSResourcesHelp';
import JBrowseHelp from './pages/help/JBrowseHelp';
import BatchDownloadHelp from './pages/help/BatchDownloadHelp';
import PatmatchHelp from './pages/help/PatmatchHelp';
import WebprimerHelp from './pages/help/WebprimerHelp';
import RestrictionMapHelp from './pages/help/RestrictionMapHelp';
import GOSlimHelp from './pages/help/GOSlimHelp';
import GOTermFinderHelp from './pages/help/GOTermFinderHelp';
import ColleagueUpdateHelp from './pages/help/ColleagueUpdateHelp';
import GenomeSnapshotHelp from './pages/help/GenomeSnapshotHelp';
import CodeTablesHelp from './pages/help/CodeTablesHelp';
import LocusHelp from './pages/help/LocusHelp';
import CuratedPaperHelp from './pages/help/CuratedPaperHelp';
import PhenotypeHelp from './pages/help/PhenotypeHelp';
import ProteinPageHelp from './pages/help/ProteinPageHelp';
import ProteinMotifsHelp from './pages/help/ProteinMotifsHelp';
import ProteinPropertiesHelp from './pages/help/ProteinPropertiesHelp';
import PDBHomologHelp from './pages/help/PDBHomologHelp';

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

                  <Link
                    to="/contact"
                    className="icon-link"
                    title="Send a suggestion to CGD"
                  >
                    <span className="icon-email">✉</span>
                  </Link>
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
            <Link to="/search">Search</Link>
            <a href="/jbrowse/index.html">JBrowse</a>
            <a href="/cgi-bin/seqTools">Sequence</a>
            <Link to="/go-resources">GO</Link>
            <a href="/cgi-bin/compute/blast_clade.pl">Tools</a>
            <Link to="/literature">Literature</Link>
            <Link to="/download">Download</Link>
            <Link to="/community">Community</Link>
          </nav>
        </header>

        {/* =========================
            Routes
           ========================= */}
        <Routes>
          {/* Main pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/locus/:name" element={<LocusPage />} />
          <Route path="/reference/:id" element={<ReferencePage />} />
          <Route path="/protein/:name/properties" element={<ProteinPropertyPage />} />
          <Route path="/protein/:name/domains" element={<DomainPage />} />
          <Route path="/go/evidence" element={<GoEvidencePage />} />
          <Route path="/go/:goid" element={<GoTermPage />} />
          <Route path="/phenotype/search" element={<PhenotypeSearchPage />} />
          <Route path="/phenotype/terms" element={<ObservableTermsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/how-to-cite" element={<HowToCitePage />} />
          <Route path="/sitemap" element={<SiteMapPage />} />
          <Route path="/genome-snapshot/:organism" element={<GenomeSnapshotPage />} />
          <Route path="/labs" element={<LabsPage />} />
          <Route path="/genome-wide-analysis" element={<GenomeWideAnalysisPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/go-resources" element={<GOResourcesPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/submit-data" element={<SubmitDataPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/community-news" element={<CommunityNewsPage />} />
          <Route path="/job-postings" element={<JobPostingsPage />} />
          <Route path="/external-resources" element={<ExternalResourcesPage />} />
          <Route path="/nomenclature" element={<NomenclaturePage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/literature" element={<LiteraturePage />} />
          <Route path="/topic-biblios" element={<TopicBibliosPage />} />
          <Route path="/strains" element={<StrainsPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Help documentation pages */}
          <Route path="/help/getting-started" element={<GettingStartedHelp />} />
          <Route path="/help/sequence" element={<SequenceHelp />} />
          <Route path="/help/search-form" element={<SearchFormHelp />} />
          <Route path="/help/feature-search" element={<FeatureSearchHelp />} />
          <Route path="/help/blast" element={<BlastHelp />} />
          <Route path="/help/blast-results" element={<BlastResultsHelp />} />
          <Route path="/help/biochem-pathways" element={<BiochemPathwaysHelp />} />
          <Route path="/help/pheno-search" element={<PhenoSearchHelp />} />
          <Route path="/help/literature-topics" element={<LiteratureTopicsHelp />} />
          <Route path="/help/gs-resources" element={<GSResourcesHelp />} />
          <Route path="/help/jbrowse" element={<JBrowseHelp />} />
          <Route path="/help/batch-download" element={<BatchDownloadHelp />} />
          <Route path="/help/patmatch" element={<PatmatchHelp />} />
          <Route path="/help/webprimer" element={<WebprimerHelp />} />
          <Route path="/help/restriction-map" element={<RestrictionMapHelp />} />
          <Route path="/help/go-slim" element={<GOSlimHelp />} />
          <Route path="/help/go-term-finder" element={<GOTermFinderHelp />} />
          <Route path="/help/colleague-update" element={<ColleagueUpdateHelp />} />
          <Route path="/help/genome-snapshot" element={<GenomeSnapshotHelp />} />
          <Route path="/help/code-tables" element={<CodeTablesHelp />} />
          <Route path="/help/locus" element={<LocusHelp />} />
          <Route path="/help/curated-paper" element={<CuratedPaperHelp />} />
          <Route path="/help/phenotype" element={<PhenotypeHelp />} />
          <Route path="/help/protein-page" element={<ProteinPageHelp />} />
          <Route path="/help/protein-motifs" element={<ProteinMotifsHelp />} />
          <Route path="/help/protein-properties" element={<ProteinPropertiesHelp />} />
          <Route path="/help/pdb-homolog" element={<PDBHomologHelp />} />
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
              <Link to="/contact">
                Send a Message to the CGD Curators <span className="email-icon">✉</span>
              </Link>
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

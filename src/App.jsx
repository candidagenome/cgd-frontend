import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HeaderSearchForm from './components/HeaderSearchForm';
import HeaderNav from './components/HeaderNav';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LocusPage from './pages/LocusPage';
import ReferencePage from './pages/ReferencePage';
import NewPapersThisWeekPage from './pages/NewPapersThisWeekPage';
import GenomeWideAnalysisPapersPage from './pages/GenomeWideAnalysisPapersPage';
import DiseaseRelatedPapersPage from './pages/DiseaseRelatedPapersPage';
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
import SearchResultsPage from './pages/SearchResultsPage';
import TextSearchResultsPage from './pages/TextSearchResultsPage';
import TextSearchPage from './pages/TextSearchPage';
import MeetingsPage from './pages/MeetingsPage';
import CommunityNewsPage from './pages/CommunityNewsPage';
import NewsArchivePage from './pages/NewsArchivePage';
import JobPostingsPage from './pages/JobPostingsPage';
import ExternalResourcesPage from './pages/ExternalResourcesPage';
import NomenclaturePage from './pages/NomenclaturePage';
import DownloadPage from './pages/DownloadPage';
import DatasetsPage from './pages/DatasetsPage';
import LiteraturePage from './pages/LiteraturePage';
import TopicBibliosPage from './pages/TopicBibliosPage';
import StrainsPage from './pages/StrainsPage';
import ContactPage from './pages/ContactPage';
import SeqToolsPage from './pages/SeqToolsPage';
import SeqToolsResultsPage from './pages/SeqToolsResultsPage';
import BlastSearchPage from './pages/BlastSearchPage';
import BlastResultsPage from './pages/BlastResultsPage';
import PatmatchSearchPage from './pages/PatmatchSearchPage';
import PatmatchResultsPage from './pages/PatmatchResultsPage';
import BatchDownloadPage from './pages/BatchDownloadPage';
import RestrictionMapperSearchPage from './pages/RestrictionMapperSearchPage';
import RestrictionMapperResultsPage from './pages/RestrictionMapperResultsPage';
import FeatureSearchPage from './pages/FeatureSearchPage';
import FeatureSearchResultsPage from './pages/FeatureSearchResultsPage';
import GenomeVersionHistoryPage from './pages/GenomeVersionHistoryPage';
import ColleagueSearchPage from './pages/ColleagueSearchPage';
import ColleagueSearchResultsPage from './pages/ColleagueSearchResultsPage';
import ColleagueDetailPage from './pages/ColleagueDetailPage';
import ColleagueUpdatePage from './pages/ColleagueUpdatePage';
import GeneRegistryPage from './pages/GeneRegistryPage';
import ChromosomePage from './pages/ChromosomePage';
import ChromosomeListPage from './pages/ChromosomeListPage';
import WebPrimerSearchPage from './pages/WebPrimerSearchPage';
import WebPrimerResultsPage from './pages/WebPrimerResultsPage';
import GoTermFinderSearchPage from './pages/GoTermFinderSearchPage';
import GoTermFinderResultsPage from './pages/GoTermFinderResultsPage';
import GoSlimMapperSearchPage from './pages/GoSlimMapperSearchPage';
import GoSlimMapperResultsPage from './pages/GoSlimMapperResultsPage';
import GoAnnotationSummaryPage from './pages/GoAnnotationSummaryPage';
import LiteratureTopicSearchPage from './pages/LiteratureTopicSearchPage';
import ToolsPage from './pages/ToolsPage';
import ApiDocPage from './pages/ApiDocPage';
import SyntenyBrowserPage from './pages/SyntenyBrowserPage';

// Curation pages (protected)
import CuratorCentralPage from './pages/curation/CuratorCentralPage';
import GoTodoListPage from './pages/curation/GoTodoListPage';
import LitGuideTodoListPage from './pages/curation/LitGuideTodoListPage';
import GoCurationPage from './pages/curation/GoCurationPage';
import ReferenceCurationPage from './pages/curation/ReferenceCurationPage';
import PhenotypeCurationPage from './pages/curation/PhenotypeCurationPage';
import ColleagueCurationPage from './pages/curation/ColleagueCurationPage';
import LocusCurationPage from './pages/curation/LocusCurationPage';
import LitGuideCurationPage from './pages/curation/LitGuideCurationPage';
import NoteCurationPage from './pages/curation/NoteCurationPage';
import NewFeaturePage from './pages/curation/NewFeaturePage';
import NewLocationPage from './pages/curation/NewLocationPage';
import LinkCurationPage from './pages/curation/LinkCurationPage';
import GeneRegistryCurationPage from './pages/curation/GeneRegistryCurationPage';
import ParagraphCurationPage from './pages/curation/ParagraphCurationPage';
import LitReviewPage from './pages/curation/LitReviewPage';
import ReferenceSearchPage from './pages/curation/ReferenceSearchPage';
import ReferenceSearchResultsPage from './pages/curation/ReferenceSearchResultsPage';
import RefAnnotationCurationPage from './pages/curation/RefAnnotationCurationPage';
import DbSearchPage from './pages/curation/DbSearchPage';
import SequenceCurationPage from './pages/curation/SequenceCurationPage';
import CoordinateCurationPage from './pages/curation/CoordinateCurationPage';
import SeqAlignmentPage from './pages/curation/SeqAlignmentPage';

// Help documentation pages
import WhatIsGOPage from './pages/help/WhatIsGOHelp';
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
import GlabrataChanges2022Help from './pages/help/GlabrataChanges2022Help';

import ScrollToTop from './components/ScrollToTop';
import './App.css';

function App() {
  return (
    <AuthProvider>
    <Router>
      <ScrollToTop />
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
                  <a href="http://publicwiki.candidagenome.org" target="_blank" rel="noopener noreferrer">CGD Public Wiki</a>
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

              <HeaderSearchForm />
            </div>
          </div>

          {/* Main navigation bar with dropdowns */}
          <HeaderNav />
        </header>

        {/* =========================
            Routes
           ========================= */}
        <Routes>
          {/* Main pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/locus/:name" element={<LocusPage />} />
          <Route path="/reference/NewPapersThisWeek" element={<NewPapersThisWeekPage />} />
          <Route path="/reference/GenomewideAnalysisPapers" element={<GenomeWideAnalysisPapersPage />} />
          <Route path="/genome-wide-analysis-papers" element={<GenomeWideAnalysisPapersPage />} />
          <Route path="/disease-related-papers" element={<DiseaseRelatedPapersPage />} />
          <Route path="/reference/:id" element={<ReferencePage />} />
          <Route path="/protein/:name/properties" element={<ProteinPropertyPage />} />
          <Route path="/protein/:name/domains" element={<DomainPage />} />
          <Route path="/go/evidence" element={<GoEvidencePage />} />
          <Route path="/go/:goid" element={<GoTermPage />} />
          <Route path="/phenotype/search" element={<PhenotypeSearchPage />} />
          <Route path="/phenotype/terms" element={<ObservableTermsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/developer/api" element={<ApiDocPage />} />
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
          <Route path="/search/results" element={<SearchResultsPage />} />
          <Route path="/search/text" element={<TextSearchPage />} />
          <Route path="/search/text/results" element={<TextSearchResultsPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/community-news" element={<CommunityNewsPage />} />
          <Route path="/news/archive" element={<NewsArchivePage />} />
          <Route path="/job-postings" element={<JobPostingsPage />} />
          <Route path="/external-resources" element={<ExternalResourcesPage />} />
          <Route path="/nomenclature" element={<NomenclaturePage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/datasets" element={<DatasetsPage />} />
          <Route path="/literature" element={<LiteraturePage />} />
          <Route path="/literature-topic-search" element={<LiteratureTopicSearchPage />} />
          <Route path="/topic-biblios" element={<TopicBibliosPage />} />
          <Route path="/strains" element={<StrainsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/seq-tools" element={<SeqToolsPage />} />
          <Route path="/seq-tools/results" element={<SeqToolsResultsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/synteny-browser" element={<SyntenyBrowserPage />} />
          <Route path="/blast" element={<BlastSearchPage />} />
          <Route path="/blast/results" element={<BlastResultsPage />} />
          <Route path="/patmatch" element={<PatmatchSearchPage />} />
          <Route path="/patmatch/results" element={<PatmatchResultsPage />} />
          <Route path="/restriction-mapper" element={<RestrictionMapperSearchPage />} />
          <Route path="/restriction-mapper/results" element={<RestrictionMapperResultsPage />} />
          <Route path="/webprimer" element={<WebPrimerSearchPage />} />
          <Route path="/webprimer/results" element={<WebPrimerResultsPage />} />
          <Route path="/go-term-finder" element={<GoTermFinderSearchPage />} />
          <Route path="/go-term-finder/results" element={<GoTermFinderResultsPage />} />
          <Route path="/go-slim-mapper" element={<GoSlimMapperSearchPage />} />
          <Route path="/go-slim-mapper/results" element={<GoSlimMapperResultsPage />} />
          <Route path="/go-annotation-summary" element={<GoAnnotationSummaryPage />} />
          <Route path="/batch-download" element={<BatchDownloadPage />} />
          <Route path="/feature-search" element={<FeatureSearchPage />} />
          <Route path="/feature-search/results" element={<FeatureSearchResultsPage />} />
          <Route path="/genome-version-history" element={<GenomeVersionHistoryPage />} />
          <Route path="/colleague/search" element={<ColleagueSearchResultsPage />} />
          <Route path="/colleague/update/:colleagueNo" element={<ColleagueUpdatePage />} />
          <Route path="/colleague/update" element={<ColleagueUpdatePage />} />
          <Route path="/colleague-update/:colleagueNo" element={<ColleagueUpdatePage />} />
          <Route path="/colleague-update" element={<ColleagueUpdatePage />} />
          <Route path="/gene-registry" element={<GeneRegistryPage />} />
          <Route path="/chromosome" element={<ChromosomeListPage />} />
          <Route path="/chromosome/:name" element={<ChromosomePage />} />
          <Route path="/colleague/:colleagueNo" element={<ColleagueDetailPage />} />
          <Route path="/colleague" element={<ColleagueSearchPage />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Curation routes (protected) */}
          <Route
            path="/curation"
            element={
              <ProtectedRoute>
                <CuratorCentralPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/feature/new"
            element={
              <ProtectedRoute>
                <NewFeaturePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/location/new"
            element={
              <ProtectedRoute>
                <NewLocationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/links"
            element={
              <ProtectedRoute>
                <LinkCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/go/todo"
            element={
              <ProtectedRoute>
                <GoTodoListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/go"
            element={
              <ProtectedRoute>
                <GoCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/go/:featureName"
            element={
              <ProtectedRoute>
                <GoCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/litguide/todo"
            element={
              <ProtectedRoute>
                <LitGuideTodoListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/reference/create"
            element={
              <ProtectedRoute>
                <ReferenceCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/reference/:referenceNo"
            element={
              <ProtectedRoute>
                <ReferenceCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/phenotype"
            element={
              <ProtectedRoute>
                <PhenotypeCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/phenotype/:featureName"
            element={
              <ProtectedRoute>
                <PhenotypeCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/colleague/list"
            element={
              <ProtectedRoute>
                <ColleagueCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/colleague/:colleagueNo"
            element={
              <ProtectedRoute>
                <ColleagueCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/locus-guide"
            element={
              <ProtectedRoute>
                <LocusCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/locus/:featureName"
            element={
              <ProtectedRoute>
                <LocusCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/litguide"
            element={
              <ProtectedRoute>
                <LitGuideCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/litguide/:featureName"
            element={
              <ProtectedRoute>
                <LitGuideCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/note/new"
            element={
              <ProtectedRoute>
                <NoteCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/note/edit"
            element={
              <ProtectedRoute>
                <NoteCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/note/:noteNo"
            element={
              <ProtectedRoute>
                <NoteCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/gene-registry/list"
            element={
              <ProtectedRoute>
                <GeneRegistryCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/paragraph"
            element={
              <ProtectedRoute>
                <ParagraphCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/literature/review"
            element={
              <ProtectedRoute>
                <LitReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/reference/search"
            element={
              <ProtectedRoute>
                <ReferenceSearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/reference/search/results"
            element={
              <ProtectedRoute>
                <ReferenceSearchResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/reference/annotation"
            element={
              <ProtectedRoute>
                <RefAnnotationCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/db-search"
            element={
              <ProtectedRoute>
                <DbSearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/sequence"
            element={
              <ProtectedRoute>
                <SequenceCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/coordinates"
            element={
              <ProtectedRoute>
                <CoordinateCurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curation/seq-alignment"
            element={
              <ProtectedRoute>
                <SeqAlignmentPage />
              </ProtectedRoute>
            }
          />

          {/* Help documentation pages */}
	  <Route path="/help/what-is-go" element={<WhatIsGOPage />} />  
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
          <Route path="/help/glabrata-changes-2022" element={<GlabrataChanges2022Help />} />
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
    </AuthProvider>
  );
}

export default App;

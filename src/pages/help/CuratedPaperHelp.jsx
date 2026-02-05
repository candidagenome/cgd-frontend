import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function CuratedPaperHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: CGD Curated Paper Pages</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li>
              <a href="#description">Description &amp; Usage</a>
              <ol>
                <li><a href="#citation">Citation &amp; Abstract</a></li>
                <li><a href="#summary">Summary Chart</a></li>
                <li><a href="#search">Author Search</a></li>
              </ol>
            </li>
            <li><a href="#accessing">Accessing a CGD Curated Paper page</a></li>
            <li><a href="#links">Other Relevant Links</a></li>
            <li><a href="#glossary">Associated Glossary Terms</a></li>
          </ul>
        </div>

        <hr />

        <div className="info-section">
          <h2 id="description">Description &amp; Usage</h2>
          <p>
            CGD Curated Paper pages display relevant information for individual publications referenced in
            CGD. Each Curated Paper page contains three sections:
          </p>

          <h3 id="citation">(1) Citation &amp; Abstract</h3>
          <p>
            This section lists the paper citation, the abstract, and other relevant details including
            publication status and type, CGD's source for the citation, and the publication's PubMed ID. If
            the publication has multiple authors, only the first author is listed in the citation. All other
            authors can be found in the Author Search pulldown menu.
          </p>
          <p>
            When appropriate, several icons are included in this section as links to additional information.
            The PubMed icon links to the PubMed's entry for the publication. If full text is available
            online, it can be accessed through an Online Journal icon. If no Online Journal icon appears on
            the page, then CGD does not have ready access to online full text. If there are comments or
            errata relevant to this citation, either published or personal communication to CGD, they will be
            linked via a Comments &amp; Errata icon. The absence of the Comments &amp; Errata icon indicates
            that CGD has not cataloged any comments or errata relevant to this citation.
          </p>

          <h3 id="summary">(2) Summary Chart</h3>
          <p>
            This section contains a chart summarizing the genes and Literature covered by the publication.
            Literature topics are listed as row headings (y-axis) while genes are listed as column headings
            (x-axis). An "X" in the chart indicates that this paper addresses that Literature Topic for that
            gene. Other papers that address the same Literature Topic and gene can be retrieved by clicking
            on the appropriate "X." More literature, as well as detailed gene information, is available
            through individual CGD Locus pages. Each gene name is hyperlinked to the appropriate CGD Locus
            page.
          </p>
          <p>
            Curation of papers in CGD is an ongoing process and some citations may be linked to genes but not
            curated for all, or any, of those genes. In these cases a computerized key-word search has
            identified that the publication may address certain genes, but that assessment has not yet been
            confirmed by a CGD scientific curator. CGD scientific curators read abstracts and papers, confirm
            the genes addressed, and assign Literature topics. If the publication has not yet been completely
            curated, the message, "There are # 'not yet curated' genes for this paper," will appear in
            addition to, or in place of, the summary chart. This message will be followed by a list of 'not
            yet curated' genes which have been tentatively linked to the publication.
          </p>

          <h3 id="search">(3) Author Search</h3>
          <p>
            This feature allows users to find contact information or other publications by the authors of the
            publication. The authors are listed in the first pulldown menu while the search options are
            listed in the second pulldown menu. The search options include "Papers in CGD," "Colleagues in
            CGD," and "PubMed." Searching in "Papers in CGD" will look for other yeast publications by that
            author. Searching in "Colleagues in CGD" will find out if that author has voluntarily listed
            contact information with CGD. Finally, searching in "PubMed" will look for publications by that
            author on any subject. To use the Author Search, choose an author and a search parameter and then
            click the "Search!" button.
          </p>
        </div>

        <div className="info-section">
          <h2 id="accessing">Accessing a Curated Paper page</h2>
          <p>
            CGD Curated Paper pages can be accessed by Author or Literature searches and through any page
            where references are listed.
          </p>
        </div>

        <div className="info-section">
          <h2 id="links">Other Relevant Links</h2>
          <ol>
            <li>
              <strong>CGD Pages</strong>
              <ol type="a">
                <li>
                  <Link to="/help/literature-topics">CGD Help: Literature Guide</Link>
                </li>
                <li>
                  <Link to="/help/locus">CGD Help: Locus Page</Link>
                </li>
                <li>
                  <a href="/search">Search CGD</a>
                </li>
              </ol>
            </li>
            <li>
              <strong>External Sites</strong>
              <ol type="a">
                <li>
                  <a
                    href="http://www4.ncbi.nlm.nih.gov/PubMed/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    PubMed
                  </a>
                </li>
                <li>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/entrez/jrbrowser.cgi"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    PubMed Journal Browser
                  </a>
                  : can be used to find the full length journal name from the abbreviation; CGD uses the
                  MEDLINE abbreviations used at PubMed.
                </li>
              </ol>
            </li>
          </ol>
        </div>

        <div className="info-section">
          <h2 id="glossary">Associated Glossary Terms</h2>
          <ul>
            <li>
              <Link to="/help/glossary#literature-topics">Literature Guide</Link>
            </li>
            <li>
              <Link to="/help/glossary#topic">Literature Topic</Link>
            </li>
            <li>
              <Link to="/help/glossary#locus">Locus Page</Link>
            </li>
            <li>
              <Link to="/help/glossary#Colleagues">Colleagues</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CuratedPaperHelp;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const SearchPage = () => {
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [textSearchQuery, setTextSearchQuery] = useState('');
  const [orthologSearchQuery, setOrthologSearchQuery] = useState('');
  const [googleSearchQuery, setGoogleSearchQuery] = useState('');

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickSearchQuery.trim()) {
      window.location.href = `/search/results?query=${encodeURIComponent(quickSearchQuery)}`;
    }
  };

  const handleTextSearch = (e) => {
    e.preventDefault();
    if (textSearchQuery.trim()) {
      window.location.href = `/cgi-bin/search/textSearch?query=${encodeURIComponent(textSearchQuery)}`;
    }
  };

  const handleOrthologSearch = (e) => {
    e.preventDefault();
    if (orthologSearchQuery.trim()) {
      window.location.href = `/cgi-bin/search/textSearch?type=homolog&query=${encodeURIComponent(orthologSearchQuery)}`;
    }
  };

  const handleGoogleSearch = (e) => {
    e.preventDefault();
    if (googleSearchQuery.trim()) {
      window.location.href = `/cgi-bin/google.pl?input=${encodeURIComponent(googleSearchQuery)}`;
    }
  };

  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Search Options</h1>
        <hr />

        <p style={{ fontSize: '0.9em', marginBottom: '20px' }}>
          All the search options listed below search for information within the <em>Candida</em> Genome Database
        </p>

        {/* Basic Searches */}
        <div className="info-section">
          <h2>CGD Basic Searches</h2>

          <div className="search-block">
            <p style={{ fontSize: '0.9em', fontStyle: 'italic', marginBottom: '15px' }}>
              Note: All searches are case insensitive; wildcard character (*) ok; only last names of colleagues are searched
            </p>

            <div className="search-form-container">
              <strong>CGD Quick Search:</strong>
              <form onSubmit={handleQuickSearch} className="inline-search-form">
                <input
                  type="text"
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                  size="20"
                  placeholder="Search..."
                />
                <button type="submit">Submit</button>
              </form>
              <p style={{ fontSize: '0.9em', marginTop: '8px' }}>
                Use a keyword to simultaneously search by major categories of information in CGD (gene name,
                locus description, GO terms, GO IDs, phenotypes, colleagues, authors, PubMed IDs, biochemical
                pathway names, orthologs and best hits in <em>S. cerevisiae</em> and other <em>Candida</em> species.
                Examples: 'ACT1', 'orf19.2203', 'orf6.1022', 'transcription', 'Smith'. The asterisk character (*)
                may be used as a wild card.
              </p>
            </div>

            <div className="search-form-container" style={{ marginTop: '20px' }}>
              <strong>CGD Text Search:</strong>
              <form onSubmit={handleTextSearch} className="inline-search-form">
                <input
                  type="text"
                  value={textSearchQuery}
                  onChange={(e) => setTextSearchQuery(e.target.value)}
                  size="20"
                  placeholder="Search..."
                />
                <button type="submit">Submit</button>
              </form>
              <p style={{ fontSize: '0.9em', marginTop: '8px' }}>
                Use a keyword to simultaneously search all of the categories of information in CGD that are
                included in the Quick Search, plus locus history notes, paper abstracts, and gene name descriptions.
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Searches */}
        <div className="info-section">
          <h2>CGD Advanced Searches</h2>

          <div className="help-item">
            <h3><Link to="/cgi-bin/search/featureSearch">Advanced Search</Link></h3>
            <p>Find a chromosomal feature (e.g., gene, ORF, centromere) based on selected criteria (e.g., chromosome number, GO-Slim terms, etc.)</p>
          </div>

          <div className="help-item">
            <h3>
              <a href="http://textpresso.candidagenome.org/cgi-bin/textpresso/search/" target="_blank" rel="noopener noreferrer">
                Full-text Literature Search
              </a>
            </h3>
            <p>
              Customizable keyword searching of the full-text of over 16,500 <em>Candida</em> journal articles with{' '}
              <a href="http://biology.plosjournals.org/perlserv/?request=get-document&doi=10.1371/journal.pbio.0020309" target="_blank" rel="noopener noreferrer">
                Textpresso
              </a>, a tool developed at{' '}
              <a href="http://wormbase.org/" target="_blank" rel="noopener noreferrer">Wormbase</a>
            </p>
          </div>

          <div className="help-item">
            <h3><Link to="/cgi-bin/batchDownload">Batch Download</Link></h3>
            <p>Simultaneous retrieval of multiple types of data for a list of gene or feature names</p>
          </div>

          <div className="help-item">
            <h3><Link to="/cgi-bin/phenotype/phenotype.pl">Expanded Phenotype Search</Link></h3>
            <p>
              Search the text of all phenotype information to find phenotypes of interest and view the genes
              associated with them, or <Link to="/cace/PhenotypeTree.html">browse the entire list</Link> of phenotype terms
            </p>
          </div>

          <div className="help-item">
            <h3><Link to="/cgi-bin/GO/goTermMapper">GO Slim Mapper</Link></h3>
            <p>This tool determines to which GO-slim terms a set of <em>Candida</em> genes is annotated</p>
          </div>

          <div className="help-item">
            <h3><Link to="/cgi-bin/GO/goTermFinder">GO Term Finder</Link></h3>
            <p>This tool determines the significant GO terms that a set of <em>Candida</em> genes shares in common</p>
          </div>
        </div>

        {/* Pathway Searches */}
        <div className="info-section">
          <h2>Specialized Pathway Searches</h2>

          <div className="help-item">
            <h3>
              <a href="http://pathway.stanford.edu/" target="_blank" rel="noopener noreferrer">
                Pathway Query Page
              </a>
            </h3>
            <p>Search biochemical pathway information in CGD, using the query functionality integral to the Pathway Tools software.</p>
          </div>
        </div>

        {/* Gene and Sequence Searches */}
        <div className="info-section">
          <h2>Specialized Gene and Sequence Searches</h2>

          <div className="help-item">
            <h3><Link to="/cgi-bin/seqTools">Gene/Sequence Resources (Get Sequence)</Link></h3>
            <p>Retrieve, display, and analyze a gene or sequence in many ways, such as protein translation and restriction mapping.</p>
          </div>

          <div className="help-item">
            <h3><Link to="/cgi-bin/compute/blast_clade.pl">BLAST</Link></h3>
            <p>Compare any query sequence against various <em>Candida</em> datasets</p>
          </div>

          <div className="help-item">
            <h3>GBrowse Genome Browser</h3>
            <p style={{ marginBottom: '5px' }}>
              for <Link to="/cgi-bin/gbrowse2/gbrowse/candida_22/?ref=Ca22chrRA_C_albicans_SC5314;start=1729234;stop=1794843"><em>C. albicans</em> SC5314 Assembly 22</Link><br />
              for <Link to="/cgi-bin/gbrowse2/gbrowse/candida_21/?ref=Ca21chrR_C_albicans_SC5314;start=1729234;stop=1794843"><em>C. albicans</em> SC5314 Assembly 21</Link><br />
              for <Link to="/cgi-bin/gbrowse2/gbrowse/candida/?name=Contig19-10014%3A1..23104"><em>C. albicans</em> SC5314 Assembly 19</Link><br />
              for <Link to="/cgi-bin/gbrowse2/gbrowse/cauris_b8441/?name=PEKT02000008_C_auris_B8441:785301..787300"><em>C. auris</em> B8441</Link><br />
              for <Link to="/cgi-bin/gbrowse2/gbrowse/cdub_cd36/?name=Chr4_C_dubliniensis_CD36:143191..163190"><em>C. dubliniensis</em> CD36</Link><br />
              for <Link to="/cgi-bin/gbrowse2/gbrowse/cglab_cbs138/?name=ChrM_C_glabrata_CBS138:193616..218115"><em>C. glabrata</em> CBS138</Link><br />
              for <Link to="/cgi-bin/gbrowse2/gbrowse/cpar_cdc317/?name=ChrM_C_parapsilosis_CDC317:193616..218115"><em>C. parapsilosis</em> CDC317</Link>
            </p>
            <p>View and navigate genomic sequence</p>
          </div>

          <div className="help-item">
            <h3>JBrowse Genome Browser</h3>
            <p style={{ marginBottom: '5px' }}>
              for <Link to="/jbrowse/index.html?data=cgd_data%2FC_albicans_SC5314"><em>C. albicans</em> SC5314 Assembly 22</Link><br />
              for <Link to="/jbrowse/index.html?data=cgd_data%2FC_auris_B8441"><em>C. auris</em> B8441</Link><br />
              for <Link to="/jbrowse/index.html?data=cgd_data%2FC_dubliniensis_CD36"><em>C. dubliniensis</em> CD36</Link><br />
              for <Link to="/jbrowse/index.html?data=cgd_data%2FC_glabrata_CBS138"><em>C. glabrata</em> CBS138</Link><br />
              for <Link to="/jbrowse/index.html?data=cgd_data%2FC_parapsilosis_CDC317"><em>C. parapsilosis</em> CDC317</Link>
            </p>
            <p>View high-throughput genomics data</p>
          </div>

          <div className="help-item">
            <h3><Link to="/cgi-bin/chromosomeHistory.pl">Chromosome History Search</Link></h3>
            <p>View the complete sequence and annotation history of each Assembly 22 chromosome</p>
          </div>

          <div className="help-item">
            <h3><Link to="/cgi-bin/genomeVersionHistory.pl">Summary of Genome Versions</Link></h3>
            <p>View the complete history of sequence and annotation changes for each genome</p>
          </div>

          <div className="help-item">
            <h3><Link to="/cgi-bin/PATMATCH/nph-patmatch">Pattern Matching</Link></h3>
            <p>Locate DNA or protein sequence patterns</p>
          </div>

          <div className="help-item">
            <h3><Link to="/cgi-bin/compute/web-primer">Design Primers</Link></h3>
            <p>Design sequencing and PCR primers</p>
          </div>

          <div className="help-item">
            <h3><Link to="/cgi-bin/PATMATCH/RestrictionMapper">Restriction Analysis</Link></h3>
            <p>Display the restriction map for a sequence</p>
          </div>
        </div>

        {/* Ortholog Search */}
        <div className="info-section">
          <h2>Search Orthologs and Best Hits</h2>

          <div className="search-form-container">
            <form onSubmit={handleOrthologSearch} className="inline-search-form">
              <input
                type="text"
                value={orthologSearchQuery}
                onChange={(e) => setOrthologSearchQuery(e.target.value)}
                size="20"
                placeholder="Search orthologs..."
              />
              <button type="submit">Submit</button>
            </form>
            <p style={{ fontSize: '0.9em', marginTop: '8px' }}>
              Search orthologs or best hits to <em>S. cerevisiae</em> genes or genes in other <em>Candida</em> species
              by gene name. Case insensitive and wildcard character (*) searches are allowed.
            </p>
          </div>
        </div>

        {/* Web Page Search */}
        <div className="info-section">
          <h2>Search CGD Web Pages</h2>

          <div className="search-form-container">
            <form onSubmit={handleGoogleSearch} className="inline-search-form">
              <input
                type="text"
                value={googleSearchQuery}
                onChange={(e) => setGoogleSearchQuery(e.target.value)}
                size="40"
                placeholder="Search CGD web pages..."
              />
              <button type="submit">Google Search</button>
            </form>
          </div>
        </div>

        {/* Literature Search */}
        <div className="info-section">
          <h2>Search <em>Candida</em> Literature</h2>

          <div className="help-item">
            <h3><Link to="/cgi-bin/reference/litGuide.pl">Search Literature in CGD</Link></h3>
            <p>View CGD's annotated literature guide for any gene</p>
          </div>

          <div className="help-item">
            <h3><Link to="/cache/genome-wide-analysis.html">List of genome-wide analysis papers</Link></h3>
            <p>Link to a list of genome-wide analysis papers (e.g., microarray analysis publications) stored in CGD</p>
          </div>
        </div>

        {/* Colleague Search */}
        <div className="info-section">
          <h2>Search Colleague Information</h2>

          <div className="help-item">
            <h3><Link to="/cgi-bin/colleague/colleagueInfoSearch">Search CGD Colleagues</Link></h3>
            <p>Search contact information submitted to CGD by <em>Candida</em> researchers</p>
          </div>

          <div className="help-item">
            <h3><Link to="/cache/Labs.html"><em>Candida</em> Laboratories</Link></h3>
            <p>Links to PIs of laboratories that study <em>Candida</em></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

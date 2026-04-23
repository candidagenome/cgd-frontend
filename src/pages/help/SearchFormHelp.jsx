import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

const SearchFormHelp = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: Search CGD</h1>
        <hr />

        <div className="info-section">
          <h2>Contents:</h2>
          <ul>
            <li><a href="#overview">CGD Search Overview</a></li>
            <li><a href="#basic">CGD Basic Searches</a></li>
            <li><a href="#advanced">CGD Advanced Searches</a></li>
            <li><a href="#tools">Specialized Gene and Sequence Searches</a></li>
            <li><a href="#orthologs">Orthologs and Best Hits</a></li>
            <li><a href="#web">Search CGD Web Pages</a></li>
            <li><a href="#literature">Search <em>Candida</em> Literature</a></li>
            <li><a href="#colleague">Search for Colleagues</a></li>
          </ul>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />

        <div className="info-section" id="overview">
          <h2>CGD Search Overview</h2>
          <p>
            Searches at CGD provide access to information stored in the database. This help page gives you
            an overview of the searches available at CGD, along with detailed descriptions of the types of
            search parameters associated with each of the searches.
          </p>
        </div>

        <div className="info-section" id="basic">
          <h2>CGD Basic Searches</h2>
          <p>
            Both the Quick Search and the Text Search are <strong>case insensitive</strong> and{' '}
            <strong>support wildcard</strong> searches. The{' '}
            <a href="http://www.yeastgenome.org/help/glossary.html#wildcardcharacter" target="_blank" rel="noopener noreferrer">
              wildcard character
            </a>{' '}
            (*) can be used in the beginning and/or at the end of the term to be searched. Quick Search and
            Text Search results are displayed in sections organized by species. Results that are not
            species-specific (e.g., GO terms, colleagues, references) are listed in a separate section on the
            results page.
          </p>

          <h3>A. Quick Search</h3>
          <p>
            The Quick Search is available in the toolbar located at the top of most pages. It is{' '}
            <strong>case insensitive</strong> and <strong>supports wildcard</strong> searches. Queries using
            the Quick Search option search a limited set of information in the database. The results of the
            Quick Search can include matches in the following categories:
          </p>
          <ul>
            <li>Gene name (systematic ORF name, standard gene name, or alias)</li>
            <li>CGD ID (Primary CGDID, e.g., CAL0000123456)</li>
            <li>Gene name of ortholog or Best Hit from <em>S. cerevisiae</em> or other <em>Candida</em> species</li>
            <li>Gene description</li>
            <li>Gene Ontology (GO) term (a term name or a synonym)</li>
            <li>Gene Ontology (GO) ID</li>
            <li>Phenotypes</li>
            <li>Locus Summary Notes</li>
            <li>Colleague</li>
            <li>Author of a reference stored at CGD</li>
            <li>PubMed IDs</li>
          </ul>

          <h3>B. Text Search</h3>
          <p>
            The Text Search searches additional fields in the database. It is the best search option to
            perform a broad search based on your search criterion. Like the Quick Search it is{' '}
            <strong>case insensitive</strong> and <strong>supports wildcard</strong> searches. The results of
            the Text Search can include matches in the following categories:
          </p>
          <ul>
            <li>Gene name (systematic ORF name, standard gene name, or alias)</li>
            <li>CGD ID (Primary CGDID, e.g., CAL0000123456)</li>
            <li>Gene name of ortholog or Best Hit from <em>S. cerevisiae</em> or other <em>Candida</em> species</li>
            <li>Gene description</li>
            <li>Gene Ontology (GO) term (a term name or a synonym)</li>
            <li>Gene Ontology (GO) ID</li>
            <li>Phenotypes</li>
            <li>Locus Summary Notes</li>
            <li>Colleague</li>
            <li>Author of a reference stored at CGD</li>
            <li>PubMed IDs</li>
            <li>Abstracts</li>
            <li>Name descriptions</li>
            <li>Locus History notes</li>
          </ul>
        </div>

        <div className="info-section" id="advanced">
          <h2>CGD Advanced Searches</h2>

          <h3>A. Advanced Search</h3>
          <p>
            This search allows one to find a chromosomal feature (e.g. gene, ORF, centromere) based on
            selected criteria (e.g. feature type, annotation/sequence properties, chromosome number, GO-Slim
            terms, etc.). For more information on the{' '}
            <a href="/feature-search" target="_blank" rel="noopener noreferrer">Advanced Search</a>,
            please see the <Link to="/help/feature-search">CGD Help: Advanced Search</Link>.
          </p>

          <h3>B. Batch Download</h3>
          <p>
            The tool allows simultaneous retrieval of DNA and Protein sequences for a list of Standard gene
            names or Feature names. For more information on the{' '}
            <Link to="/batch-download">Batch Download Tool</Link>,
            please see the <Link to="/help/batch-download">CGD Help: Batch Data Download</Link>.
          </p>

          <h3>C. Expanded Phenotype Search</h3>
          <p>
            The tool searches the text of all of the information associated with the phenotype curation,
            including alleles, experimental conditions, and notes, in addition to the basic description of
            the phenotype itself. For more information about this resource, please see the{' '}
            <Link to="/help/phenotype-search">Searching Phenotype Data</Link> help page.
          </p>
        </div>

        <div className="info-section" id="tools">
          <h2>Specialized Gene and Sequence Searches</h2>

          <h3>A. Gene/Sequence Resources (Get Sequence)</h3>
          <p>
            <a href="/seq-tools" target="_blank" rel="noopener noreferrer">Gene/Sequence Resources</a>{' '}
            allows one to retrieve a list of options for accessing information available for 1) a named gene
            or sequence, 2) a specified chromosomal region, or 3) a raw DNA or protein sequence. This
            information includes biological information, table/map displays, and sequence analysis and
            retrieval options. For specific help on this resource, see{' '}
            <Link to="/help/gs-resources">CGD Help: Gene/Sequence Resources</Link>.
          </p>

          <h3>B. BLAST</h3>
          <p>
            This tool allows comparing any DNA or protein sequence against several <em>Candida</em> datasets.
            For more information on the <Link to="/blast">BLAST</Link> resource, please see{' '}
            <Link to="/help/blast">CGD Help: BLAST Searches</Link>.
          </p>

          <h3>C. GBrowse Genome Browser</h3>
          <p>
            GBrowse is a genome visualization tool that allows one to view and navigate genomic sequence. For
            more specific help about GBrowse, please visit the{' '}
            <Link to="/help/jbrowse">JBrowse Help</Link>.
          </p>

          <h3>D. Pattern Matching</h3>
          <p>
            This tool allows searching for short (&lt;20 residues) nucleotide or peptide sequences, or
            peptide sequences, or ambiguous/degenerate patterns. It uses the same datasets as CGD{' '}
            <Link to="/blast">BLAST</Link>. More specific information on this resource is available at{' '}
            <Link to="/help/pattern-match">CGD Help: Pattern Matching</Link>.
          </p>

          <h3>E. Design Primer</h3>
          <p>
            The tool helps in designing sequencing or PCR primers based on <em>Candida</em> sequences. More
            help on how to use{' '}
            <a href="/webprimer" target="_blank" rel="noopener noreferrer">Web Primer</a> is
            available at the <Link to="/help/web-primer">Using Web Primer</Link> help pages.
          </p>

          <h3>F. Restriction Analysis</h3>
          <p>
            This tool can be used to generate a restriction map of a DNA sequence (either the gene name, or
            ORF name, or an actual DNA sequence, can be given as input). More information on the{' '}
            <a href="/restriction-mapper" target="_blank" rel="noopener noreferrer">
              CGD Restriction Analysis
            </a>{' '}
            tool is available at{' '}
            <Link to="/help/restriction-map">CGD Help: Candida Genome Restriction Analysis</Link>.
          </p>
        </div>

        <div className="info-section" id="orthologs">
          <h2>Search Orthologs and Best Hits</h2>
          <p>
            This tool allows searches for orthologs of CGD genes by the name (gene name, systematic name, or
            alias) of the ortholog. You may enter a gene name (wildcards permitted) and the search will return
            any match to orthologs of <em>C. albicans</em> or <em>C. glabrata</em> genes (additional species
            will be included in the future). CGD contains mappings of <em>C. albicans</em> and{' '}
            <em>C. glabrata</em> genes to their orthologs in other <em>Candida</em> species and to orthologs
            in <em>S. cerevisiae</em>; both sets are queried by this tool.
          </p>
          <p>
            Orthologs among the <em>Candida</em> are computed as described{' '}
            <Link to="/reference/CAL0142012">here</Link>.
          </p>
          <p>
            The Search results return two columns. The first column contains the name of the gene that: 1.
            matched the query entered in the search box, and 2. has an ortholog in <em>C. albicans</em> or{' '}
            <em>C. glabrata</em>. The second column contains the name of the <em>C. albicans</em> or{' '}
            <em>C. glabrata</em> gene(s) whose ortholog is listed in Column 1.
          </p>
          <p>
            Please note, regarding specifics of the query and the results displayed: The query searches the
            standard name, systematic name, and alias names (if any) of the genes in the CGD ortholog mappings.
            However, the search results display the standard and systematic name only; alias names are not
            displayed, so it is possible that the gene name that matched the query is an alias that is not
            shown on the results page. For orthologs in <em>S. cerevisiae</em>, only the Standard Name of the{' '}
            <em>S. cerevisiae</em> gene, as defined at the{' '}
            <a href="http://www.yeastgenome.org/" target="_blank" rel="noopener noreferrer">
              <em>Saccharomyces</em> Genome Database
            </a>, is searched. For genes that do not have a Standard Name, the systematic name is searched.
            Other <em>S. cerevisiae</em> gene aliases will not be recognized by the query.
          </p>
          <p>
            The ortholog and Best Hit mapping files may also be{' '}
            <Link to="/download">downloaded</Link> in bulk from the CGD web site.
          </p>
          <p>
            If there is only one match to your search criterion, you will be immediately redirected to the
            Locus Summary page for that gene or ORF. If there is more than one match, the results will be
            displayed in a table.
          </p>
        </div>

        <div className="info-section" id="web">
          <h2>Search CGD Web Pages</h2>
          <p>
            This is a Google Search of the html pages for the site "http://candidagenome.org/" To search,
            enter one or more keywords into the box and click "Seek." The results displayed are those of a
            Google search and include a list of html pages that contain all of the words typed in the search
            box. For more information on the Google Search, please see{' '}
            <a href="http://www.google.com/help/basics.html" target="_blank" rel="noopener noreferrer">
              The Basics of Google Search
            </a>.{' '}
            <em>Please note that this search does not search the CGD relational database.</em>
          </p>
        </div>

        <div className="info-section" id="literature">
          <h2>Search <em>Candida</em> Literature</h2>

          <h3>A. Search CGD Literature Guide</h3>
          <p>
            Type in a gene name, reserved gene name, alias, or ORF name to go to the Literature Guide,
            featuring CGD curated papers, for the gene or ORF. The search is <strong>case insensitive</strong>{' '}
            and <strong>supports the wildcard character</strong> (*). If there is only 1 match to your search
            criterion, you will be immediately redirected to the literature guide page for that gene or ORF.
            If there is more than 1 match, the results will be a list of genes or ORFs. Each gene or ORF name
            is a link to the literature guide.
          </p>

          <h3>B. List of Genome-Wide Analysis Papers</h3>
          <p>
            This link takes you to all CGD curated papers that have been associated with the Literature Guide
            topic "Genome-Wide Analysis." For a description of the "Genome-Wide Analysis" topic and general
            help on the CGD Literature Guide feature, please view{' '}
            <Link to="/help/literature-topics">CGD Help: Literature Guide</Link>.
          </p>
        </div>

        <div className="info-section" id="colleague">
          <h2>Search Colleague Information</h2>

          <h3>A. Search CGD Colleagues</h3>
          <p>
            The query will be restricted to searching the <span style={{ color: 'red' }}>last names</span> of
            the colleagues who have submitted information to the database. Since the information is searched
            EXACTLY how it is entered in the database, a wildcard search is especially useful here.
          </p>
          <p>
            If there is only 1 match to your search criterion, you will be immediately redirected to the
            colleague page. If there is more than 1 match, the results will be displayed in a table that
            contains the following information: colleague name, the organization, and basic contact information
            such as phone number, fax number, and email address. The colleague name is a link to the full
            colleague information.
          </p>

          <h3>B. <em>Candida</em> Laboratories</h3>
          <p>
            The{' '}
            <a href="/cache/Labs.html" target="_blank" rel="noopener noreferrer">
              <em>Candida</em> Laboratories
            </a>{' '}
            page provides a list of <em>Candida</em> research laboratories and displays contact information,
            links to web pages, gene names and keywords as provided by colleagues.
          </p>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />
      </div>
    </div>
  );
};

export default SearchFormHelp;

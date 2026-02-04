import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

function SiteMapPage() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Site Map</h1>
        <hr />

        <section className="info-section">
          <h2>Contents:</h2>
          <div className="sitemap-contents">
            <ul>
              <li><a href="#overview">Overview</a></li>
              <li><a href="#search">Search Options</a></li>
              <li><a href="#help">Help Resources</a></li>
              <li><a href="#tools">Analysis & Tools</a></li>
            </ul>
            <ul>
              <li><a href="#go">GO Resources</a></li>
              <li><a href="#community">Community Info</a></li>
              <li><a href="#submit">Submit Data</a></li>
              <li><a href="#download">Download Data</a></li>
              <li><a href="#about">About CGD</a></li>
            </ul>
          </div>
        </section>

        <hr />

        <section className="info-section" id="overview">
          <h2>Overview</h2>
          <p>
            The CGD site map provides a comprehensive listing of major CGD resources and tools. It
            is organized by the major categories available at CGD, which correspond to the links
            located on the left side of the home page. The resources and tools available in that
            category are listed, followed by a description of the resource and its primary use. A
            link to the help documentation is also provided, if it is available for that resource.
          </p>
          <p>
            For more information on how to navigate around CGD, please read the{' '}
            <Link to="/help/getting-started">Getting Started</Link> page.
          </p>
        </section>

        <h2>Site Map</h2>

        <table className="sitemap-table">
          <thead>
            <tr>
              <th id="search">Category</th>
              <th>Resource</th>
              <th style={{ width: '35%' }}>Description</th>
              <th style={{ width: '25%' }}>Primary Use</th>
              <th>Help Page</th>
            </tr>
          </thead>
          <tbody>
            {/* Search Options */}
            <tr>
              <td className="category-header" rowSpan="7">
                <Link to="/search">Search Options</Link>
              </td>
              <td><Link to="/search">Quick Search and Text Search</Link></td>
              <td>Search the CGD relational database, including literature guide, colleague information, protein information, and text.</td>
              <td>Search CGD database using keywords.</td>
              <td className="check-icon"><Link to="/help/search-form">✓</Link></td>
            </tr>
            <tr>
              <td><a href="/cgi-bin/search/featureSearch">Advanced Search</a></td>
              <td>Find a chromosomal feature (e.g., gene, ORF, centromere) based on selected criteria (e.g., chromosome number, GO-Slim terms, etc.)</td>
              <td>Find chromosomal features that match specific properties or annotations.</td>
              <td className="check-icon"><Link to="/help/feature-search">✓</Link></td>
            </tr>
            <tr>
              <td><a href="http://textpresso.candidagenome.org/cgi-bin/textpresso/search" target="_blank" rel="noopener noreferrer">Full-text Literature Search</a></td>
              <td>Customizable keyword searching of the full-text of over 16,500 <em>Candida</em> journal articles with Textpresso.</td>
              <td>Search full-text of published papers about <em>Candida</em>.</td>
              <td className="check-icon"><a href="http://textpresso.candidagenome.org/cgi-bin/textpresso/user_guide" target="_blank" rel="noopener noreferrer">✓</a></td>
            </tr>
            <tr>
              <td><a href="http://pathway.stanford.edu/" target="_blank" rel="noopener noreferrer">Biochemical Pathway Search</a></td>
              <td>Search or browse pathway information in CGD, including pathways, reactions, enzymes, and chemical compounds.</td>
              <td>Find metabolic pathways and related information.</td>
              <td className="check-icon"><Link to="/help/biochem-pathways">✓</Link></td>
            </tr>
            <tr>
              <td><a href="/cgi-bin/phenotype/phenotype.pl">Expanded Phenotype Search</a></td>
              <td>Search the text of all phenotype information to find phenotypes of interest and view the genes associated with them.</td>
              <td>Enter keywords associated with a phenotype (e.g., 'hyphal', 'virulence') to search for features.</td>
              <td className="check-icon"><Link to="/help/pheno-search">✓</Link></td>
            </tr>
            <tr>
              <td><Link to="/search">Search CGD Web Pages</Link></td>
              <td>Search CGD HTML pages, excludes the relational database.</td>
              <td>Find CGD web pages using keywords located on the page.</td>
              <td className="check-icon"><Link to="/help/search-form">✓</Link></td>
            </tr>
            <tr>
              <td><Link to="/genome-wide-analysis">List of genome-wide analysis papers</Link></td>
              <td>Link to a list of genome-wide analysis papers (e.g., microarray analysis publications) curated at CGD.</td>
              <td>Find CGD curated papers that analyze the entire genome.</td>
              <td className="check-icon"><Link to="/help/literature-topics">✓</Link></td>
            </tr>

            {/* Help Resources */}
            <tr>
              <th>Category</th>
              <th>Resource</th>
              <th>Description</th>
              <th>Primary Use</th>
              <th>Help Page</th>
            </tr>
            <tr>
              <td className="category-header" id="help" rowSpan="4">
                <Link to="/help">Help Resources</Link>
              </td>
              <td><Link to="/help/getting-started">Getting Started</Link></td>
              <td>Common uses of CGD for the first time user.</td>
              <td>Get a brief overview of navigating around CGD.</td>
              <td></td>
            </tr>
            <tr>
              <td><Link to="/faq">FAQ</Link></td>
              <td>Answers to some of the most frequently asked questions about CGD.</td>
              <td>Get an answer to a commonly asked question.</td>
              <td></td>
            </tr>
            <tr>
              <td><Link to="/">What's New in CGD</Link></td>
              <td>Changes and additions to CGD resources.</td>
              <td>Find new resources at CGD and when they were added.</td>
              <td></td>
            </tr>
            <tr>
              <td><a href="http://www.yeastgenome.org/help/glossary.html" target="_blank" rel="noopener noreferrer">SGD's Glossary</a></td>
              <td>List of terms and definitions at SGD.</td>
              <td>Find the definition of a new term.</td>
              <td></td>
            </tr>

            {/* Analysis & Tools */}
            <tr>
              <th>Category</th>
              <th>Resource</th>
              <th>Description</th>
              <th>Primary Use</th>
              <th>Help Page</th>
            </tr>
            <tr>
              <td className="category-header" id="tools" rowSpan="8">
                <Link to="/search">Analysis & Tools</Link>
              </td>
              <td><a href="/cgi-bin/compute/blast_clade.pl">BLAST</a></td>
              <td>Search <em>Candida</em> DNA and protein sequence datasets for similarities to a particular sequence.</td>
              <td>Find similarities between a sequence and <em>Candida</em> DNA or protein sequences.</td>
              <td className="check-icon"><Link to="/help/blast">✓</Link></td>
            </tr>
            <tr>
              <td><a href="/cgi-bin/seqTools">Gene/Sequence Resources</a></td>
              <td>Retrieve <em>Candida</em> genomic sequence from CGD or paste in a DNA or protein sequence to analyze.</td>
              <td>Display and analyze a <em>Candida</em> sequence in many ways.</td>
              <td className="check-icon"><Link to="/help/gs-resources">✓</Link></td>
            </tr>
            <tr>
              <td>
                GBrowse Genome Browser<br />
                <a href="/cgi-bin/gbrowse2/gbrowse/candida_22/"><em>C. albicans</em> A22</a> |{' '}
                <a href="/cgi-bin/gbrowse2/gbrowse/cauris_b8441/"><em>C. auris</em></a> |{' '}
                <a href="/cgi-bin/gbrowse2/gbrowse/cdub_cd36/"><em>C. dubliniensis</em></a> |{' '}
                <a href="/cgi-bin/gbrowse2/gbrowse/cglab_cbs138/"><em>C. glabrata</em></a> |{' '}
                <a href="/cgi-bin/gbrowse2/gbrowse/cpar_cdc317/"><em>C. parapsilosis</em></a>
              </td>
              <td>GBrowse allows viewing and navigation of genomic sequence.</td>
              <td>Navigate chromosomes of the <em>Candida</em> species. View annotated features.</td>
              <td className="check-icon"><a href="/cgi-bin/gbrowse2/gbrowse/candida?help=general">✓</a></td>
            </tr>
            <tr>
              <td>
                JBrowse Genome Browser<br />
                <a href="/jbrowse/index.html?data=cgd_data%2FC_albicans_SC5314"><em>C. albicans</em> A22</a> |{' '}
                <a href="/jbrowse/index.html?data=cgd_data%2FC_auris_B8441"><em>C. auris</em></a> |{' '}
                <a href="/jbrowse/index.html?data=cgd_data%2FC_dubliniensis_CD36"><em>C. dubliniensis</em></a> |{' '}
                <a href="/jbrowse/index.html?data=cgd_data%2FC_glabrata_CBS138"><em>C. glabrata</em></a> |{' '}
                <a href="/jbrowse/index.html?data=cgd_data%2FC_parapsilosis_CDC317"><em>C. parapsilosis</em></a>
              </td>
              <td>JBrowse allows viewing and navigation of genomic sequence and high-throughput genomics data.</td>
              <td>Viewing large-scale data sets, such as RNA-Seq, DNA-Seq, ChIP-Seq, etc.</td>
              <td className="check-icon"><Link to="/help/jbrowse">✓</Link></td>
            </tr>
            <tr>
              <td><a href="/cgi-bin/PATMATCH/nph-patmatch">Pattern Matching</a></td>
              <td>A pattern matching program that allows ambiguous matches but not gaps.</td>
              <td>Find short DNA/protein sequence matches in <em>Candida</em> sequences.</td>
              <td className="check-icon"><Link to="/help/patmatch">✓</Link></td>
            </tr>
            <tr>
              <td><a href="/cgi-bin/compute/web-primer">Design Primers</a></td>
              <td>Recommends primers appropriate for either PCR or sequencing of a given gene or DNA sequence.</td>
              <td>Design sequencing and PCR primers for <em>Candida</em> or other input sequences.</td>
              <td className="check-icon"><Link to="/help/webprimer">✓</Link></td>
            </tr>
            <tr>
              <td><a href="/cgi-bin/PATMATCH/RestrictionMapper">Genome Restriction Analysis</a></td>
              <td>Generates a restriction map of a specified DNA sequence.</td>
              <td>Display restriction maps for <em>Candida</em> or other input sequences.</td>
              <td className="check-icon"><Link to="/help/restriction-map">✓</Link></td>
            </tr>
            <tr>
              <td><a href="http://seq.yeastgenome.org/cgi-bin/blast-fungal.pl" target="_blank" rel="noopener noreferrer">SGD's Fungal BLAST</a></td>
              <td>Search multiple fungal genomes, including <em>Candida</em> genomes, for similarity to a particular sequence.</td>
              <td>Find similarities between a sequence of interest and fungal nucleotide or protein sequences.</td>
              <td className="check-icon"><a href="http://www.yeastgenome.org/help/fungal-blast.html" target="_blank" rel="noopener noreferrer">✓</a></td>
            </tr>

            {/* GO Resources */}
            <tr>
              <th>Category</th>
              <th>Resource</th>
              <th>Description</th>
              <th>Primary Use</th>
              <th>Help Page</th>
            </tr>
            <tr>
              <td className="category-header" id="go" rowSpan="4">
                <Link to="/go-resources">GO Resources</Link>
              </td>
              <td><a href="http://www.yeastgenome.org/help/GO.html" target="_blank" rel="noopener noreferrer">What is GO?</a></td>
              <td>SGD help page that explains the philosophy of GO.</td>
              <td>Get an overview of Gene Ontology (GO).</td>
              <td></td>
            </tr>
            <tr>
              <td><a href="http://www.yeastgenome.org/help/gotutorial.html" target="_blank" rel="noopener noreferrer">SGD's GO Tutorial</a></td>
              <td>Tutorial that highlights pages and tools that use GO annotations.</td>
              <td>Learn where GO annotations are located on CGD pages and how to use them.</td>
              <td></td>
            </tr>
            <tr>
              <td><a href="/cgi-bin/GO/goTermMapper">GO Slim Mapper</a></td>
              <td>GO Slim is a set of GO terms that represent major sections of the ontology. This tool traces specific annotations to broader GO Slim terms.</td>
              <td>Map a set of CGD genes to broad GO Slim categories.</td>
              <td className="check-icon"><Link to="/help/go-slim">✓</Link></td>
            </tr>
            <tr>
              <td><a href="/cgi-bin/GO/goTermFinder">GO Term Finder</a></td>
              <td>This tool determines the GO terms that a set of CGD genes shares in common and graphically displays the significant lineage.</td>
              <td>Find GO terms that are shared by a group of CGD genes.</td>
              <td className="check-icon"><Link to="/help/go-term-finder">✓</Link></td>
            </tr>

            {/* Community Info */}
            <tr>
              <th>Category</th>
              <th>Resource</th>
              <th>Description</th>
              <th>Primary Use</th>
              <th>Help Page</th>
            </tr>
            <tr>
              <td className="category-header" id="community" rowSpan="5">
                <Link to="/community">Community Info</Link>
              </td>
              <td><Link to="/meetings">Conferences & Courses</Link></td>
              <td>Link to a list of conferences & courses.</td>
              <td>Find an upcoming conference.</td>
              <td></td>
            </tr>
            <tr>
              <td><Link to="/community-news">Community News</Link></td>
              <td>Links to <em>Candida</em> news postings.</td>
              <td>Find out about items of interest to the research community.</td>
              <td></td>
            </tr>
            <tr>
              <td><Link to="/labs"><em>Candida</em> Laboratories</Link></td>
              <td>Links to laboratories who have submitted colleague information to CGD.</td>
              <td>Find a PI (principal investigator) of a <em>Candida</em> laboratory.</td>
              <td></td>
            </tr>
            <tr>
              <td><Link to="/job-postings"><em>Candida</em> Community Job Postings</Link></td>
              <td>Announcements of employment opportunities related to <em>Candida</em> biology.</td>
              <td>View job openings.</td>
              <td></td>
            </tr>
            <tr>
              <td><Link to="/external-resources">External Links</Link></td>
              <td>List of useful external sites.</td>
              <td>Find a web site for information not available at CGD.</td>
              <td></td>
            </tr>

            {/* Submit Data */}
            <tr>
              <th>Category</th>
              <th>Resource</th>
              <th>Description</th>
              <th>Primary Use</th>
              <th>Help Page</th>
            </tr>
            <tr>
              <td className="category-header" id="submit" rowSpan="4">
                <Link to="/submit-data">Submit Data</Link>
              </td>
              <td><a href="/cgi-bin/registry/geneRegistry">Gene Registry</a></td>
              <td>Form to register a gene name.</td>
              <td>Register a gene name at CGD.</td>
              <td></td>
            </tr>
            <tr>
              <td><Link to="/nomenclature">Gene Naming Guidelines</Link></td>
              <td>Guidelines for choosing and registering a gene name as agreed upon by the members of the <em>C. albicans</em> community.</td>
              <td>Find information about registering a gene name.</td>
              <td></td>
            </tr>
            <tr>
              <td><a href="/cgi-bin/colleague/colleagueSearch">Colleague Submission/Update Form</a></td>
              <td>Form to submit colleague information to CGD.</td>
              <td>Add or update your information in CGD.</td>
              <td className="check-icon"><Link to="/help/colleague-update">✓</Link></td>
            </tr>
            <tr>
              <td><Link to="/contact">Contact CGD</Link></td>
              <td>Form to submit suggestions or questions to CGD.</td>
              <td>Send suggestions or questions to CGD.</td>
              <td></td>
            </tr>

            {/* Download Data */}
            <tr>
              <th>Category</th>
              <th>Resource</th>
              <th>Description</th>
              <th>Primary Use</th>
              <th>Help Page</th>
            </tr>
            <tr>
              <td className="category-header" id="download" rowSpan="7">
                <Link to="/download">Download Data</Link>
              </td>
              <td><Link to="/batch-download">Batch Download</Link></td>
              <td>Tool that allows simultaneous retrieval of DNA sequences, protein sequences, and chromosomal coordinate information for a list of gene names.</td>
              <td>Download information for a list of genes from CGD.</td>
              <td className="check-icon"><Link to="/help/batch-download">✓</Link></td>
            </tr>
            <tr>
              <td><a href="/download/go/gene_association.cgd.gz">Gene Ontology (GO) Annotations File</a></td>
              <td>The gene_association.cgd file contains the Gene Ontology (GO) curation from CGD.</td>
              <td>Download tab-delimited files of GO information from CGD.</td>
              <td className="check-icon"><a href="/download/go/gene_association_README.txt">✓</a></td>
            </tr>
            <tr>
              <td><a href="/download/chromosomal_feature_files/">Chromosomal Feature Files</a></td>
              <td>Tab-delimited files of information about current chromosomal features in CGD.</td>
              <td>Download feature (gene) names, aliases, descriptions, and other information.</td>
              <td className="check-icon"><a href="/download/chromosomal_feature_files/README">✓</a></td>
            </tr>
            <tr>
              <td><a href="/download/sequence/">Sequence Files</a></td>
              <td>The sequence download directory contains sequence from the <em>Candida</em> sequencing projects.</td>
              <td>Download current or archived sequence data.</td>
              <td className="check-icon"><a href="/download/sequence/README">✓</a></td>
            </tr>
            <tr>
              <td><a href="/download/phenotype/">Phenotypes</a></td>
              <td>Tab-delimited files containing the CGD phenotype curation.</td>
              <td>Download phenotype data.</td>
              <td className="check-icon"><a href="/download/phenotype/README">✓</a></td>
            </tr>
            <tr>
              <td><a href="/download/homology/">Orthologs and Best Hits</a></td>
              <td>This directory contains the mappings among <em>Candida</em> genes and predicted orthologs.</td>
              <td>Download homolog data.</td>
              <td className="check-icon"><a href="/download/homology/README">✓</a></td>
            </tr>
            <tr>
              <td><Link to="/download">Datasets archived at CGD</Link></td>
              <td>Archive of published and freely available datasets.</td>
              <td>Download large-scale datasets.</td>
              <td></td>
            </tr>

            {/* About CGD */}
            <tr>
              <th>Category</th>
              <th>Resource</th>
              <th>Description</th>
              <th>Primary Use</th>
              <th>Help Page</th>
            </tr>
            <tr>
              <td className="category-header" id="about" rowSpan="4">
                <Link to="/about">About CGD</Link>
              </td>
              <td><Link to="/about">About CGD</Link></td>
              <td>About the CGD project.</td>
              <td>Find out background information on the CGD project.</td>
              <td></td>
            </tr>
            <tr>
              <td>
                CGD Genome Snapshot<br />
                <Link to="/genome-snapshot/C_albicans_SC5314"><em>C. albicans</em></Link> |{' '}
                <Link to="/genome-snapshot/C_auris_B8441"><em>C. auris</em></Link> |{' '}
                <Link to="/genome-snapshot/C_dubliniensis_CD36"><em>C. dubliniensis</em></Link> |{' '}
                <Link to="/genome-snapshot/C_glabrata_CBS138"><em>C. glabrata</em></Link> |{' '}
                <Link to="/genome-snapshot/C_parapsilosis_CDC317"><em>C. parapsilosis</em></Link>
              </td>
              <td>Annotation statistics, updated daily.</td>
              <td>Find information about the characterization of the genomes in CGD.</td>
              <td className="check-icon"><Link to="/help/genome-snapshot">✓</Link></td>
            </tr>
            <tr>
              <td><Link to="/how-to-cite">Citing CGD</Link></td>
              <td>How to cite CGD in publications.</td>
              <td>References to use in citing CGD.</td>
              <td></td>
            </tr>
            <tr>
              <td><Link to="/staff">Staff</Link></td>
              <td>Names and addresses of CGD staff.</td>
              <td>Find out who works at CGD.</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <hr style={{ marginTop: '30px' }} />

        <p>
          A complete list of genes may be found <a href="/genelist.shtml">here</a>.
        </p>
      </div>
    </div>
  );
}

export default SiteMapPage;

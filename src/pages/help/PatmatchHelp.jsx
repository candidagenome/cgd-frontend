import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function PatmatchHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: Pattern Matching</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li><a href="#description">Description</a></li>
            <li><a href="#using">Using PatMatch</a></li>
            <li><a href="#accessing">Accessing the PatMatch Search Page</a></li>
            <li><a href="#links">Other Relevant Links</a></li>
          </ul>
        </div>

        <hr />

        <div className="info-section">
          <h2 id="description">Description</h2>
          <p>
            <a href="/cgi-bin/PATMATCH/nph-patmatch">PatMatch</a> permits the identification of patterns or motifs within
            the collection of all CGD protein or DNA sequences. The pattern can be either a simple string or a regular
            expression. Standard substitutions are allowed in the string, such as using "R" for any purine base when
            performing a nucleotide search. Pattern matching offers an alternative to sequence alignment techniques such
            as BLAST for identifying nucleotide or peptide sequences with conserved or biologically interesting regions.
          </p>
        </div>

        <div className="info-section">
          <h2 id="using">Using PatMatch</h2>
          <p>
            CGD offers a selection of sequence datasets that can be searched, depending on the user's requirements,
            including datasets from both Assembly 21 and Assembly 19 for <em>C. albicans</em>.
          </p>
          <ul>
            <li>Complete sequence of chromosomes (or contigs) and/or mitochondrion</li>
            <li>ORF DNA, coding sequences of defined ORFs (DNA)</li>
            <li>ORF DNA, genomic (coding and intronic) sequences of defined ORFs (DNA)</li>
            <li>ORF DNA, genomic sequence plus 1000 bp up- and down-stream</li>
            <li>Intergenic DNA, sequence between ORFs and other annotated genomic features (DNA)</li>
            <li>Other (Non-coding) features, genomic sequences</li>
            <li>Other (Non-coding) features, sequence with introns removed</li>
            <li>Other (Non-coding) features, genomic sequences</li>
            <li>ORF translations, protein translations of defined ORFs (Protein)</li>
          </ul>

          <p><strong>Tips for Pattern Matching:</strong></p>
          <ol>
            <li>
              The pattern may be <strong>lowercase or uppercase</strong>. There is no maximum or minimum pattern size.
            </li>
            <li>
              A description of the allowed <strong>syntax</strong> of the pattern is provided at the bottom of the
              Pattern Matching page.
            </li>
            <li>
              The <strong>Strand option</strong> is used for restricting NUCLEOTIDE searches to only one strand of the
              specified dataset. The default is that both strands are searched. If the "Strand in dataset" option is
              chosen, then only the strand that is actually present in the dataset will be searched. Choosing "Reverse
              complement of strand in dataset" restricts the PatMatch search to the reverse complement of the strands
              described above.
              <br />
              Please note that in the displayed sequence, only the Watson strand will be shown, regardless of which
              strand option is chosen. If your pattern has a match on the Crick strand, the reverse complement of the
              pattern will be highlighted in the Watson sequence.
            </li>
            <li>
              The <strong>Mismatch, Deletion or Insertion options</strong> will permit matches to sequences that contain
              a defined number of substitutions, deletions or insertions relative to the input pattern. This number can
              range from 1 to 3. At this time, patterns containing regular expressions do not support the mismatch,
              deletion and insertion options.
            </li>
            <li>
              <strong>When searching for patterns near the beginning or end of a sequence</strong>, bear in mind that
              nucleotide sequences will include the stop codon (TAA, TAG, or TGA) and start codon (5' ATG). Peptide
              sequence will include the initiator methionine, whether or not it is removed <em>in vivo</em>.
            </li>
            <li>
              The sequences with hits are listed in the table based on the <strong>number of the hits</strong> and{' '}
              <strong>sequence name</strong>.
            </li>
            <li>At this time, PatMatch will not find overlapping hits.</li>
          </ol>

          <p>
            If a PatMatch search results in no or few matches, the user may try to increase the number of matches in a
            number of ways. Going back to the PatMatch search page, the user can change the database searched, use a
            less selective pattern, or increase the number of allowed mismatches, deletions or insertions.
          </p>

          <p>
            <strong>Aborting a PatMatch Search</strong>
          </p>
          <p>
            To abort a search, the user should click on the button labeled "Click here to abort the search", which will
            actually stop the process running on the CGD server. This is better than hitting the "Back" button on the
            browser, since otherwise the CGD computer will continue to process the search request.
          </p>
        </div>

        <div className="info-section">
          <h2 id="accessing">Accessing the PatMatch Search Page</h2>
          <p>PatMatch can be accessed:</p>
          <ol>
            <li>
              by selecting the "PatMatch" hypertext link on the tool bar at the top of most CGD WWW pages.
            </li>
            <li>
              by selecting the "PatMatch" hypertext link on the sidebar displayed on the left-hand side of the home page
              and index pages
            </li>
            <li>
              by selecting the "Pattern Matching" link under Specialized Gene and Sequence Searches on the{' '}
              <Link to="/search">Search Options</Link> index page
            </li>
          </ol>
        </div>

        <div className="info-section">
          <h2 id="links">Other Relevant Links</h2>
          <ol>
            <li>
              <a href="/cgi-bin/compute/blast_clade.pl">BLAST</a> Search Page
            </li>
            <li>
              <a
                href="http://www.ncbi.nlm.nih.gov/Genbank/GenbankOverview.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                GenBank
              </a>
            </li>
          </ol>
        </div>

        <p>
          <strong>
            Go to <a href="/cgi-bin/PATMATCH/nph-patmatch">PatMatch</a>
          </strong>
        </p>
      </div>
    </div>
  );
}

export default PatmatchHelp;

import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

const BlastHelp = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: BLAST Searches</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li><a href="#description">Description</a></li>
            <li><a href="#using">Using BLAST</a></li>
            <li><a href="#accessing">Accessing the BLAST Search Page</a></li>
          </ul>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />

        <div className="info-section" id="description">
          <h2>Description</h2>
          <p>
            BLAST stands for Basic Local Alignment Search Tool and was developed by Altschul et al. (1990).
            It is a very fast search algorithm that is used to separately search protein or DNA sequence
            databases. BLAST is best used for sequence similarity searching, rather than for motif searching.
          </p>
          <p>
            A fairly complete on-line guide to BLAST searching can be found at the{' '}
            <a href="http://www.ncbi.nlm.nih.gov/BLAST/blast_help.shtml" target="_blank" rel="noopener noreferrer">
              NCBI BLAST Help Manual
            </a>. CGD has a separate{' '}
            <Link to="/help/blast-results">help document for the BLAST results page</Link>. Documentation
            about WU-BLAST2 is posted{' '}
            <a href="/help/WU-BLAST_README.html" target="_blank" rel="noopener noreferrer">here</a>.
          </p>
          <p>
            BLAST searches offered by CGD allow users to compare any query sequence to <em>Candida</em>{' '}
            sequence datasets. To search other fungal sequences, use SGD's{' '}
            <a href="http://seq.yeastgenome.org/cgi-bin/blast-fungal.pl" target="_blank" rel="noopener noreferrer">
              Fungal BLAST
            </a>{' '}
            tool. To search other datasets,{' '}
            <a href="http://www.ncbi.nlm.nih.gov/BLAST/" target="_blank" rel="noopener noreferrer">NCBI BLAST</a>{' '}
            can be used.
          </p>
        </div>

        <div className="info-section" id="using">
          <h2>Using BLAST</h2>
          <p>
            First, enter the sequence that you would like to compare in Step 1, "Enter your query sequence."
          </p>
          <p>
            The sequence can be entered directly in the box provided. (Alternately, the sequence may be
            uploaded from a text file; the ability to utilize this option is provided in the "Optional: upload
            a local sequence TEXT file" section near the bottom of the page.)
          </p>
          <p>
            In Step 2, "Select one or more target genomes," select the organism dataset(s) against which your
            sequence will be compared.
          </p>
          <p>
            More than one target dataset may be available for a given organism. For example, for{' '}
            <em>C. albicans</em> SC5314, we provide the option to search against{' '}
            <Link to="/help/sequence#A21inCGD">Assembly 21</Link> (haploid, chromosome-level genome assembly)
            or <Link to="/help/sequence#A19inCGD">Assembly 19</Link> (diploid, contig-level assembly).
          </p>
          <p>
            In Step 3, "Select Target Sequence Dataset," choose the type of dataset against which your
            sequence will be compared. Options include: genomes (chromosomal or contig sequences), genes
            (ORFs plus any intronic sequence), coding sequences (ORFs, with intronic sequence removed),
            proteins (translations of ORF sequences), genomic sequence of non-coding features (including
            intronic sequence), and sequence of non-coding features with intronic sequences removed. The
            selection available for an individual organism will depend on the annotation available for the
            organism, and some types of dataset are not available for some of the organisms included.
          </p>
          <p>
            In step 4, "Choose Appropriate BLAST Program," select the type of search to run. CGD offers these
            BLAST programs to accommodate different types of searches:
          </p>
          <ol>
            <li>BLASTN compares a nucleotide query sequence against a nucleotide sequence dataset;</li>
            <li>
              TBLASTX compares the six-frame translations of a DNA sequence to the six-frame translations of
              a nucleotide sequence dataset;
            </li>
            <li>
              BLASTX compares the six-frame conceptual translation products of a nucleotide query sequence
              (both strands) against a protein sequence dataset;
            </li>
            <li>BLASTP compares an amino acid query sequence against a protein sequence dataset;</li>
            <li>
              TBLASTN compares a protein query sequence against a nucleotide sequence dataset dynamically
              translated in all six reading frames (both strands).
            </li>
          </ol>
          <p>
            Program options are limited by Query Sequence type and Target Sequence Dataset choice. We try to
            guess your Query Sequence type from its text content. If that guess is wrong, you can override it
            using the radio-button selection option for "DNA" or "protein" located below the program selection
            pull-down menu.
          </p>
          <p>
            <strong>NOTE</strong><br />
            For BLASTX and TBLASTX searches:<br />
            You may choose an alternate genetic code to use for query translation. Queries for which this may
            be appropriate include DNA sequences from most <em>Candida albicans</em>-related species (use 12:
            Alternative Yeast Nuclear Code) or mitochondrial DNA sequences. <em>C. glabrata</em> uses the
            standard code, Translation Table 1, for translation of its nuclear genome. See the{' '}
            <Link to="/help/code-tables">Non-standard Genetic Codes Help Page</Link> for more details. The
            default code for CGD is: 12: Alternative Yeast Nuclear Code.
          </p>
          <p>
            In Step 5, you may submit the query, or clear the form to re-enter data.
          </p>
          <p>
            Note: Two additional, optional sections of the BLAST submission form allow (1) query submission
            using a text file, and (2) customization of BLAST parameters, respectively.
          </p>
          <p>
            1) Sequences can be submitted for a BLAST search in two different ways. The sequence can be
            uploaded from a local text file with FASTA, GCG, or RAW formatting, or the sequence can be typed
            or pasted into the Query Sequence window. (Note: The contents of an uploaded sequence file will
            not be displayed in the Query Sequence window of the search page.)
          </p>
          <p>To use the Upload Local File option:</p>
          <ul>
            <li>
              <strong>Macintosh</strong>
              <ol>
                <li>Click on Browse button</li>
                <li>Click on folders to open them, and on the file to upload it</li>
              </ol>
            </li>
            <li>
              <strong>PC</strong>
              <ol>
                <li>Click on the Browse button</li>
                <li>Change the file type from "HTML" to "all files"</li>
                <li>Click on folders to open them, and on the file to upload it</li>
              </ol>
            </li>
            <li>
              <strong>UNIX</strong>
              <ol>
                <li>Click on the Browse button</li>
                <li>Change *.html to * at the end of the string in the Filter box</li>
                <li>Click on a folder and then the Filter button to open the folder</li>
                <li>Click on a file and then the OK button to upload it</li>
              </ol>
            </li>
          </ul>
          <p>
            2) Other options are available, including the ability to add a note to the BLAST output, or to
            receive the results by email.
          </p>
          <p>Changing other search parameters can also change the outcome of the BLAST search:</p>
          <p>
            You may choose to allow (default) or disallow gapped alignments using the Yes/No option on the
            interface.
          </p>
          <p>
            BLAST searches are subject to filtering. A filter will remove repetitive sequences from a query,
            so that the results of the BLAST search will be less numerous and, ideally, more informative. For
            nucleic acid query sequences, the "dust" filter is used as the default. For all other searches,
            the "seg" filter is the default. You can remove filtering using the On/Off option on the interface.
          </p>
          <p>
            The Expect threshold ("E") reflects the number of matches expected to be found by chance. If the
            statistical significance of a match is greater than the Expect threshold, the match will not be
            reported. The E threshold default is set to 10. Decreasing the E threshold will increase the
            stringency of the search: fewer matches will be reported. On the other hand, increasing the E
            threshold will decrease the stringency of the search and result in more matches being reported.
          </p>
          <p>
            The default scoring matrix used is BLOSUM62; however, other matrices may be selected from the
            pull-down menu provided on the interface.
          </p>
          <p>The number of alignments displayed on the results page is customizable.</p>
          <p>
            The user can also change the word length (W): BLAST first searches for a perfect match of at least
            the word length. Once a match is found then it tries to extend the high-scoring segment pair (HSP).
            The default W value for BLASTN is 11; for all other programs the default is 3. If the word length
            is less than 11 the query sequence must be less than 5000 bp.
          </p>
          <p>
            If a query sequence is short (less than about 30 residues), the user may want to adjust the Cutoff
            Score ("S") to a lower value, which will result in a less stringent criterion for reporting matches.
          </p>
          <p>
            <strong>A note on translation tables:</strong><br />
            In <em>C. albicans</em>, nuclear encoded proteins are translated using{' '}
            <a href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi?mode=c#SG12" target="_blank" rel="noopener noreferrer">
              Translation table 12 (Alternative Yeast Nuclear)
            </a>, whereas mitochondrial encoded proteins are translated using{' '}
            <a href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi?mode=c#SG4" target="_blank" rel="noopener noreferrer">
              Translation table 4 (Mold Mitochondrial; Protozoan Mitochondrial; Coelenterate Mitochondrial;
              Mycoplasma; Spiroplasma)
            </a>. For BLAST searches where a nucleotide dataset must be translated (TBLASTN and TBLASTX), the
            CGD BLAST tool uses Table 4 for translation of the mitochondrial dataset, and Table 12 for
            translation of the datasets containing nuclear genes that are available as BLAST target datasets
            in CGD. When a nucleotide query sequence is entered by the user, and this sequence is to be used
            in a BLAST search that requires its translation (BLASTX and TBLASTX), a choice must be made as to
            which translation table should be used. To handle these query sequences accurately, the "Query
            translation table" parameter should be set by the user to specify the translation table used to
            translate the query sequence. By default, the user-supplied query sequence is translated using the
            same table that is appropriate for the dataset against which it is being searched (i.e., Table 4
            is used if the query sequence is being BLASTed against the mitochondrial dataset, and Table 12 in
            all other cases). However, if, for example, an S. cerevisiae nucleotide sequence were being used
            in a BLASTX or TBLASTX search, then translation Table 1 (the Standard table) should be selected.
            Please see NCBI's Taxonomy browser and Translation Table web page for more information about
            alternate translation tables.
          </p>
        </div>

        <div className="info-section" id="accessing">
          <h2>Accessing the BLAST Search Page</h2>
          <p>
            BLAST can be accessed by selecting the hypertext link on the menu bar at the top of most CGD WWW
            pages, or by using the Sequence Analysis Tools menu on the right-hand sidebar of any CGD Locus
            Page, where the user is given the option of a BLAST search page with the sequence already filled
            in.
          </p>
          <p>
            <strong>Go to <Link to="/blast">BLAST</Link></strong>
          </p>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />
      </div>
    </div>
  );
};

export default BlastHelp;

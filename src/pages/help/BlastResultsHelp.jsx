import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

const BlastResultsHelp = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: BLAST Results</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li>
              <a href="#description">Description</a>
              <ul>
                <li><a href="#graphic">Graphic Display</a></li>
                <li><a href="#oneline">One-line Descriptions</a></li>
                <li><a href="#alignment">Sequence Alignments</a></li>
                <li><a href="#parameter">Parameters & Statistics</a></li>
              </ul>
            </li>
            <li><a href="#accessing">Accessing BLAST Results</a></li>
            <li><a href="#links">Other Relevant Links</a></li>
          </ul>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />

        <div className="info-section" id="description">
          <h2>Description</h2>
          <p>
            The results of a BLAST query are reported in roughly the same format, regardless of the program
            selected. The first section is a <a href="#graphic">graphical overview</a> of the results, the
            second is a series of <a href="#oneline">one-line descriptions</a> of matching database sequences,
            the third is a set of the actual <a href="#alignment">alignments</a> of the query sequence with
            database sequences, and the last section lists the{' '}
            <a href="#parameter">parameters used and the statistics generated</a> during the search. More
            information is available in the <Link to="/help/blast">help document for the BLAST input form</Link>.
          </p>
          <p>
            The graphic display and one-line descriptions give information about database sequences that form
            a High-Scoring Segment Pair (HSP) with the query sequence. An HSP is created when two sequence
            fragments (one from the query sequence and the other from a database sequence) show a locally
            maximal alignment for which the alignment exceeds a pre-defined cutoff score. BLAST uses HSPs to
            identify hits.
          </p>
        </div>

        <div className="info-section" id="graphic">
          <h2>Graphic Display</h2>
          <p style={{ textAlign: 'center', backgroundColor: '#cc9966', padding: '10px', borderRadius: '4px' }}>
            <img src="/images/blast-help/graphic1.gif" alt="BLAST graphical overview example" />
          </p>
          <p>
            The above is a reduced example of the new BLAST graphical overview format. The graph's purpose is
            to give the user a brief summary of the entire result set that provides a broad perspective on the
            data. Significant features include:
          </p>
          <ul>
            <li>Color coding of P-values</li>
            <li>A wider selection of hits</li>
            <li>Annotations displayed via JavaScript</li>
            <li>A date stamp for archival reference</li>
          </ul>
          <p>
            The graph is meant simply to be a short sketch of the (possibly huge) results so its size is
            limited; sometimes not all hits can be shown.
          </p>

          <h4>How HSPs are Shown</h4>
          <p>
            Each hit may contain one or more high-scoring segment pairs (HSPs). Each HSP is drawn as a line,
            and is aligned with the query sequence. In the close-up we see two short HSPs, and three long ones
            running off the right edge. The smallest HSP begins at 185 bp and ends at 233 bp along the query
            sequence.
          </p>
          <p style={{ textAlign: 'center', backgroundColor: '#cc9966', padding: '10px', borderRadius: '4px' }}>
            <img src="/images/blast-help/HSP.gif" alt="HSP display example" />
          </p>

          <h4>HSPs are Directional</h4>
          <p>
            In the full text BLAST results, each HSP is either <em>plus</em> or <em>minus</em>. If the query
            and HSP strands are the same, the HSP is termed <em>forward</em>. If they differ, the HSP is
            termed <em>reverse</em>.
          </p>
          <p style={{ textAlign: 'center', backgroundColor: '#cc9966', padding: '10px', borderRadius: '4px' }}>
            <img src="/images/blast-help/direction.gif" alt="HSP direction example" />
          </p>

          <h4>HSPs Share a Background Color</h4>
          <p>
            All HSPs for a displayed hit are drawn. They share a single background color to signify their
            relationship. Here are two hits, each containing multiple HSPs:
          </p>
          <p style={{ textAlign: 'center', backgroundColor: '#cc9966', padding: '10px', borderRadius: '4px' }}>
            <img src="/images/blast-help/hits.gif" alt="Multiple HSPs example" />
          </p>
          <p>
            Thus for the first hit, orf19.13673, the background is white. For the second, orf19.5015, it is
            gray.
          </p>

          <h4>Hits are Color Coded</h4>
          <p>
            The hits are color coded according to their P value. A set of five fixed ranges is used to
            determine a color for each hit. These ranges, from "worst" to "best," are:
          </p>
          <table style={{ margin: '10px auto', textAlign: 'center' }}>
            <tbody>
              <tr>
                <td style={{ textAlign: 'right', paddingRight: '10px' }}>1.0</td>
                <td>to</td>
                <td style={{ textAlign: 'left', paddingLeft: '10px' }}>1e-10</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'right', paddingRight: '10px' }}>1e-10</td>
                <td>to</td>
                <td style={{ textAlign: 'left', paddingLeft: '10px' }}>1e-50</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'right', paddingRight: '10px' }}>1e-50</td>
                <td>to</td>
                <td style={{ textAlign: 'left', paddingLeft: '10px' }}>1e-100</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'right', paddingRight: '10px' }}>1e-100</td>
                <td>to</td>
                <td style={{ textAlign: 'left', paddingLeft: '10px' }}>1e-200</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'right', paddingRight: '10px' }}>1e-200</td>
                <td>to</td>
                <td style={{ textAlign: 'left', paddingLeft: '10px' }}>0.0</td>
              </tr>
            </tbody>
          </table>
          <p>
            The key shows these colors, and notes the value of the negative exponents in each range. It
            progresses from "worst" on the left to "best" on the right.
          </p>
          <p style={{ textAlign: 'center', backgroundColor: '#cc9966', padding: '10px', borderRadius: '4px' }}>
            <img src="/images/blast-help/colorkey.gif" alt="Color key example" />
          </p>
          <p>
            Note that ranges might not contain any hits, since the ranges are fixed while the hit P-values are
            not. When ranges share a boundary value (e.g.: 1e-50), that value falls in the "better" range and
            will be colored thus (e.g.: green).
          </p>

          <h4>How Hits are Chosen for Display</h4>
          <p>
            Often, there will be more data available than can be displayed in the graphic. The current system
            takes a particular approach to selecting data to include, biased in favour of giving a complete
            overview of the data rather than showing only the top hits. The rationale is that it can be
            important to show results further away from identity.
          </p>
          <p>
            First, the hits are sorted into color coded ranges. Next, the top hit from each range is picked,
            starting with the "best." It keeps track of how much space each hit will take up when drawn; if,
            after including those, there is still room left over, it iterates once more, picking the next top
            hit from each range. This process continues until there are either no more hits, or there is no
            room left in the display.
          </p>
          <p>
            Note that the final drawing of the hits will be in proper order, even though they have been
            selected in an interleaved fashion: all of the best hits are drawn at the top of the image.
          </p>

          <h4>Range Counts</h4>
          <p>
            If not all hits are shown, range counts will appear at the right side of the graph. In our example,
            all hits from the top range are shown and thus the annotation says "All." However, not all hits in
            the next range were able to be displayed so "1/3" indicates two omitted hits.
          </p>
          <p style={{ textAlign: 'center', backgroundColor: '#cc9966', padding: '10px', borderRadius: '4px' }}>
            <img src="/images/blast-help/counts.gif" alt="Range counts example" />
          </p>
          <p>
            Note that if a range contains no hits, no count is shown (thus, there are no green or cyan notations
            in our example). If all of the BLAST results fit into the graph, no range counts are displayed at all.
          </p>

          <h4>Static and JavaScript Annotations</h4>
          <p>Hit names and P-values are displayed at the left side of the graph.</p>
          <p style={{ textAlign: 'center', backgroundColor: '#cc9966', padding: '10px', borderRadius: '4px' }}>
            <img src="/images/blast-help/names.gif" alt="Hit names example" />
          </p>
          <p>
            If you enable JavaScript in your web browser, annotations for each hit will be displayed in a text
            field just above the graph as you move the mouse; score is included along with P-value.
          </p>
          <p style={{ textAlign: 'center', fontFamily: 'monospace', padding: '10px' }}>
            p=0.0e0 s=7741 YOR326W|MYO2, Chr XV from 925712-930436
          </p>
        </div>

        <div className="info-section" id="oneline">
          <h2>One-line Descriptions</h2>
          <p>
            The one-line descriptions summarize information about the database sequences that form HSPs with
            the query sequence. At the left end of each one-line description is the name of the database
            sequence that forms an HSP with the query sequence. Each description also includes the score and
            P-value for the hit.
          </p>
        </div>

        <div className="info-section" id="alignment">
          <h2>Sequence Alignments</h2>
          <p>
            The sequence alignments show the query sequence at the top, with the aligned database sequence
            (Sbjct, or subject) at the bottom. The starting and ending coordinates of the areas of similarity
            are shown at the left and right of the aligned sequences. When nucleotide sequences are being
            aligned, vertical lines between the bases signify identities. Amino acid identities are shown by
            the repetition of the one-letter code for that amino acid between the residues. Conservative amino
            acid changes are shown by a "+" sign between the aligned residues. Places where gaps had to be
            introduced to achieve the alignment are signified by a "-" in the query or subject sequences.
          </p>
          <p>
            The database sequences that are similar to the query sequence can be retrieved by using the{' '}
            <a href="/cgi-bin/seqTools" target="_blank" rel="noopener noreferrer">"Gene/Sequence Resources"</a>{' '}
            link.
          </p>
        </div>

        <div className="info-section" id="parameter">
          <h2>Parameters & Statistics</h2>
          <p>
            For amino acid sequences, the default filter setting is "seg." This filter removes repetitive
            sequences. Removed residues are indicated by Xs. For nucleic acid sequences, the default filter
            setting is "dust." The removed residues are represented as Ns. To turn off this filter, return to
            the BLAST search page and select "none" as a filter option. You can also use the pull-down "Filter
            options" menu to select a different type of filter.
          </p>
          <p>
            If a BLAST search results in no, or few, matches, the user may try to increase the number of
            matches in a number of ways. Going back to the BLAST search page, one can change the database
            searched, change the comparison matrix, or increase the number of alignments shown.
          </p>
          <p>
            For a more detailed description of BLAST results and the statistical information they provide,
            please refer to the{' '}
            <a href="http://www.ncbi.nlm.nih.gov/BLAST/blast_help.shtml" target="_blank" rel="noopener noreferrer">
              NCBI BLAST Help Manual
            </a>.
          </p>
        </div>

        <div className="info-section" id="accessing">
          <h2>Accessing BLAST Search Results</h2>
          <p>
            BLAST results can be accessed by entering a sequence using the{' '}
            <Link to="/blast">BLAST Search</Link> Page, then choosing the appropriate BLAST Program. The
            S-score can be set to 30 to facilitate searches for very short input sequences. For more
            information about performing a BLAST search, see the CGD's{' '}
            <Link to="/help/blast">BLAST Searches help page</Link>.
          </p>
        </div>

        <div className="info-section" id="links">
          <h2>Other Relevant Links</h2>
          <ol>
            <li>
              <strong>Links within CGD</strong>
              <ol type="a">
                <li>
                  <a href="/cgi-bin/seqTools" target="_blank" rel="noopener noreferrer">Gene/Sequence Resources</a>
                </li>
                <li>
                  <Link to="/help/blast">Help document for the BLAST input form</Link>
                </li>
              </ol>
            </li>
            <li>
              <strong>External links</strong>
              <ol type="a">
                <li>
                  <a href="http://www.ncbi.nlm.nih.gov/BLAST/blast_help.shtml" target="_blank" rel="noopener noreferrer">
                    NCBI BLAST Help Manual
                  </a>
                </li>
                <li>
                  <a href="http://www.ncbi.nlm.nih.gov/Entrez/" target="_blank" rel="noopener noreferrer">
                    Entrez
                  </a>
                </li>
                <li>
                  <a href="http://www.ncbi.nlm.nih.gov/Web/Genbank/index.html" target="_blank" rel="noopener noreferrer">
                    GenBank
                  </a>
                </li>
                <li>
                  <a href="http://www.expasy.org/sprot/sprot-top.html" target="_blank" rel="noopener noreferrer">
                    SWISS-PROT
                  </a>
                </li>
              </ol>
            </li>
          </ol>
          <p>
            <strong>Go to <Link to="/blast">BLAST</Link></strong>
          </p>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />
      </div>
    </div>
  );
};

export default BlastResultsHelp;

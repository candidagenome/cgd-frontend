import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function RestrictionMapHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: CGD Restriction Analysis</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li><a href="#description">Description</a></li>
            <li><a href="#using">Using CGD Restriction Analysis</a></li>
            <li><a href="#re">Restriction Enzymes Included</a></li>
            <li><a href="#accessing">Accessing CGD Restriction Analysis</a></li>
            <li><a href="#links">Other Relevant Links</a></li>
          </ul>
        </div>

        <hr />

        <div className="info-section">
          <h2 id="description">Description</h2>
          <p>
            The <a href="/cgi-bin/PATMATCH/RestrictionMapper">CGD Restriction Analysis</a> software can be used to
            generate a restriction map of a given DNA sequence. Either the name of the sequence (gene name, ORF name)
            can be given or an actual DNA sequence. The user can choose whether the restriction map shows all enzymes,
            enzymes that generate 3' overhangs, 5' overhangs, or blunt ends, or enzymes that cut once or twice.
          </p>
        </div>

        <div className="info-section">
          <h2 id="using">Using the CGD Restriction Analysis tool</h2>
          <ol>
            <li>
              <p><strong>Select or enter a sequence</strong></p>
              <ol type="a">
                <li>
                  <p><strong>Enter a gene name and select a species</strong></p>
                  <p>
                    With this input option, you can enter a gene name, or an ORF name. Note that you can also enter the
                    first few characters of a sequence name, followed by an asterisk: you will be presented with a list
                    of possible completions from which you can select a single sequence (click on the "Reset form"
                    button if you want to delete your current entry and enter a new one). Select a species from the
                    pull-down menu.
                  </p>
                </li>
                <li>
                  <p><strong>Enter a sequence</strong></p>
                  <p>
                    With this input option, you can type or paste a DNA sequence. Only the four letters, "A", "G", "C",
                    and "T" should be entered (although numbers are allowed). Any other text will be interpreted as not
                    matching the enzyme recognition sequences, although no error message will be given.
                  </p>
                </li>
              </ol>
            </li>
            <li>
              <p><strong>Choose the category of enzymes</strong></p>
              <p>
                Six different restriction maps can be generated, depending on the category of enzymes chosen: all
                enzymes; enzymes that generate 3' overhangs, 5' overhangs, or blunt ends; or enzymes that cut once or
                twice. The category can be chosen from the pull-down menu. To get a list of the enzymes that do not cut
                the given sequence, choose "all" enzymes: the output page will also list at the bottom of the page those
                enzymes that do not cut.
              </p>
            </li>
            <li>
              <p><strong>Click the "Display Map" button</strong></p>
              <p>
                The output display consists of a single line, representing the input sequence (along with coordinate
                numbers), and a line for each enzyme (within the chosen category) that cuts the sequence. The location
                of a recognition site is shown with a red or blue tick mark. A red tick mark indicates where the
                recognition sequence was found in the Watson (5'--&gt;3') strand, while a blue tick mark indicates where
                the recognition sequence was found in the Crick (3'--&gt;5') strand.
              </p>
              <p>
                The enzymes (within the chosen category) that cut the sequence are listed in alphabetical order on the
                right side of the graphic. Clicking on the name of an enzyme will provide further information about the
                enzyme, including its recognition sequence, the exact coordinates of where the enzyme cuts the input
                sequence, and a size-sorted list of the fragments that would be generated if the input sequence were
                digested with that enzyme only. Enzymes that generate 3' overhangs are displayed with a green name,
                while magenta and orange are used for enzymes that generate 5' overhangs and blunt ends, respectively.
              </p>
              <p>
                The enzymes that do not cut the sequence are listed in alphabetical order below the main display.
              </p>
              <p>
                The output display may be split over more than one page if many enzymes cut the input sequence, in which
                case clicking on the link labeled "View next page of Restriction Map, enzyme..." or "View previous page
                of Restriction Map, enzyme..." will bring up the other page of display.
              </p>
            </li>
          </ol>
        </div>

        <div className="info-section">
          <h2 id="re">Restriction Enzymes Included</h2>
          <p>
            The tool includes a non-redundant set of enzymes. If a restriction enzyme has several isoschizomers, only
            one enzyme that cuts each site will be included in the analysis. In order to identify isoschizomers, you can
            search the{' '}
            <a href="http://rebase.neb.com/rebase/rebase.html" target="_blank" rel="noopener noreferrer">
              Restriction Enzyme Database
            </a>{' '}
            at New England Biolabs.
          </p>
        </div>

        <div className="info-section">
          <h2 id="accessing">Accessing the CGD Restriction Analysis tool</h2>
          <p>
            The CGD Restriction Analysis page can be accessed by selecting the "Restriction Analysis" link on the{' '}
            <Link to="/search">Search Options</Link> contents page.
          </p>
        </div>

        <div className="info-section">
          <h2 id="links">Other Relevant Links</h2>
          <ol>
            <li>
              <a href="/cgi-bin/seqTools">Gene/Sequence Resources</a> at CGD, where can be found alternative restriction
              digest software provided by GCG.
            </li>
            <li>
              <a href="http://rebase.neb.com/rebase/rebase.html" target="_blank" rel="noopener noreferrer">
                Restriction Enzyme Database
              </a>
              , for identifying isoschizomers
            </li>
          </ol>
        </div>

        <p>
          <strong>
            Go to <a href="/cgi-bin/PATMATCH/RestrictionMapper">Candida Genome Restriction Analysis</a>
          </strong>
        </p>
      </div>
    </div>
  );
}

export default RestrictionMapHelp;

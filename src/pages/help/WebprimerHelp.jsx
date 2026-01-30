import React from 'react';
import '../InfoPages.css';

function WebprimerHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Web Primer Information</h1>
        <hr />

        <div className="info-section">
          <h2 id="uses">Uses &amp; Input</h2>
          <p>
            The user must choose a purpose for the primers to be designed. Current choices are limited to sequencing and
            PCR. Sequencing primers will be evenly spaced along the DNA. PCR primers will be at the ends of the DNA
            selected in a region of DNA, the length of which is user defined.
          </p>
        </div>

        <div className="info-section">
          <h2 id="dna">DNA Source</h2>
          <p>
            The user must the DNA sequence from which the primers will be chosen. The DNA sequence may include numbers
            but should NOT include letter characters (other than the DNA sequence).
          </p>
        </div>

        <div className="info-section">
          <h2 id="pcr">
            PCR primers <a href="/help/pcrinfo.primer.html">[more]</a>
          </h2>
          <p>
            There are many factors which influence the success of a pair of primers. Some of the properties of primers
            which can affect the outcome of PCR include: the GC / AT ratio, length, melting temperature, and the extent
            of annealing between primers. The location of a primer also heavily influences its usefulness. All of these
            variables are able to be influenced by the user and are further described below.
          </p>
        </div>

        <div className="info-section">
          <h2 id="seq">
            Sequencing Primers <a href="/help/seqinfo.primer.html">[more]</a>
          </h2>
          <p>
            Sequencing primers are also highly customizable. Potential valid primers are evenly spaced along the DNA of
            interest starting at each 5' end. The user is allowed to specify the area of DNA to be sequenced, for which
            strand(s) to order primers, the approximate distance between primers, the length and percent GC content of
            the primers, and the maximum self-annealing of the primers.
          </p>
        </div>
      </div>
    </div>
  );
}

export default WebprimerHelp;

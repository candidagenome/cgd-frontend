import React from 'react';
import '../InfoPages.css';

function CodeTablesHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: Non-standard Genetic Codes</h1>
        <hr />

        <div className="info-section">
          <p>
            <em>Candida albicans</em> and related species use a non-standard genetic code to translate
            nuclear genes. In these species, called the 'CTG clade' as a group, the CUG codon encodes the
            amino acid serine instead of leucine, as in the standard code. This code is generally referred
            to as "Translation table 12: Alternative Yeast Nuclear Code." Note that{' '}
            <em>Candida glabrata</em>, which is more closely related to <em>Saccharomyces cerevisiae</em>{' '}
            than other <em>Candida</em> species, uses the standard genetic code ("Translation table 1") for
            nuclear genes.
          </p>
          <p>
            Many eukaryotes use non-standard codes to translate mitochondrial genes. Most fungi, including{' '}
            <em>Candida albicans</em> and related species, use "Translation table 4: The Mold, Protozoan,
            and Coelenterate Mitochondrial Code and the Mycoplasma/Spiroplasma Code", while{' '}
            <em>Saccharomyces</em> and closely related species (including <em>Candida glabrata</em>) use
            "Translation table 3: The Yeast Mitochondrial Code."
          </p>
          <p>
            For a complete description of all the translation tables, see{' '}
            <a
              href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi"
              target="_blank"
              rel="noopener noreferrer"
            >
              NCBI's Genetic Codes page
            </a>
            .
          </p>
          <p>
            The table below shows the nuclear and mitochondrial codes for all organisms available at CGD, as
            well as some other common organisms.
          </p>
        </div>

        <div className="info-section">
          <table className="sitemap-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Organism</th>
                <th style={{ textAlign: 'center', width: '80px' }}>Nuclear</th>
                <th style={{ textAlign: 'center' }}>Mitochondrial</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3}>
                  <strong>CGD species</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Candida albicans</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG12"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    12
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    4
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Candida auris</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG12"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    12
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    4
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Candida dubliniensis</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG12"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    12
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    4
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Candida glabrata</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG3"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    3
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Candida guilliermondii</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG12"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    12
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    4
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Candida lusitaniae</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG12"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    12
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    4
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Candida parapsilosis</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG12"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    12
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    4
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Candida tropicalis</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG12"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    12
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    4
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Debaryomyces hansenii</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG12"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    12
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    4
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Lodderomyces elongisporus</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG12"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    12
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    4
                  </a>
                </td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <strong>Other Fungi</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Saccharomyces cerevisiae</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG3"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    3
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Aspergillus nidulans</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    4
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Neurospora crassa</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    4
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Schizosaccharomyces pombe</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    4
                  </a>
                </td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <strong>Other species of interest</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Homo sapiens</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    2
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Drosophila melanogaster</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG5"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    5
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Caenorhabditis elegans</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG5"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    5
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Arabidopsis thaliana</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Oryza sativa</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <em>Escherichia coli</em>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <a
                    href="http://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG11"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    11
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>NA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CodeTablesHelp;

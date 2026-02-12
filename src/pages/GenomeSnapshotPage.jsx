import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './InfoPages.css';

const ORGANISMS = {
  'C_albicans_SC5314': {
    name: 'Candida albicans',
    strain: 'SC5314',
    description: 'The most commonly isolated human fungal pathogen and the best-studied Candida species.',
    lastUpdated: 'January 22, 2026',
    totalORFs: 12405,
    haploidORFs: 6198,
    verifiedORFs: 4032,
    uncharacterizedORFs: 8070,
    dubiousORFs: 303,
    tRNA: 282,
    chromosomes: [
      'chr1A', 'chr1B', 'chr2A', 'chr2B', 'chr3A', 'chr3B', 'chr4A', 'chr4B',
      'chr5A', 'chr5B', 'chr6A', 'chr6B', 'chr7A', 'chr7B', 'chrRA', 'chrRB', 'chrM'
    ],
    genomeLength: '28,605,416 bp',
    goAnnotations: {
      molecularFunction: 3092,
      cellularComponent: 2332,
      biologicalProcess: 3297,
      total: 8721
    }
  },
  'C_auris_B8441': {
    name: 'Candida auris',
    strain: 'B8441',
    description: 'An emerging multidrug-resistant pathogen causing healthcare-associated infections worldwide.',
    lastUpdated: 'January 22, 2026',
    totalORFs: 5397,
    haploidORFs: 5397,
    verifiedORFs: 773,
    uncharacterizedORFs: 4581,
    dubiousORFs: 43,
    tRNA: 128,
    chromosomes: ['Chr1', 'Chr2', 'Chr3', 'Chr4', 'Chr5', 'Chr6', 'Chr7'],
    genomeLength: '12,373,041 bp',
    goAnnotations: {
      molecularFunction: 1067,
      cellularComponent: 889,
      biologicalProcess: 1138,
      total: 3094
    }
  },
  'C_dubliniensis_CD36': {
    name: 'Candida dubliniensis',
    strain: 'CD36',
    description: 'A closely related species to C. albicans, often associated with oral candidiasis in immunocompromised patients.',
    lastUpdated: 'January 22, 2026',
    totalORFs: 5983,
    haploidORFs: 5983,
    verifiedORFs: 816,
    uncharacterizedORFs: 5100,
    dubiousORFs: 67,
    tRNA: 131,
    chromosomes: ['Chr1', 'Chr2', 'Chr3', 'Chr4', 'Chr5', 'Chr6', 'Chr7', 'ChrR'],
    genomeLength: '14,618,422 bp',
    goAnnotations: {
      molecularFunction: 1091,
      cellularComponent: 901,
      biologicalProcess: 1149,
      total: 3141
    }
  },
  'C_glabrata_CBS138': {
    name: 'Candida glabrata',
    strain: 'CBS138',
    description: 'The second most common cause of candidiasis, more closely related to Saccharomyces cerevisiae than to C. albicans.',
    lastUpdated: 'January 22, 2026',
    totalORFs: 5283,
    haploidORFs: 5283,
    verifiedORFs: 3283,
    uncharacterizedORFs: 1918,
    dubiousORFs: 82,
    tRNA: 207,
    chromosomes: ['ChrA', 'ChrB', 'ChrC', 'ChrD', 'ChrE', 'ChrF', 'ChrG', 'ChrH', 'ChrI', 'ChrJ', 'ChrK', 'ChrL', 'ChrM', 'Mito'],
    genomeLength: '12,338,433 bp',
    goAnnotations: {
      molecularFunction: 3565,
      cellularComponent: 3212,
      biologicalProcess: 3730,
      total: 10507
    }
  },
  'C_parapsilosis_CDC317': {
    name: 'Candida parapsilosis',
    strain: 'CDC317',
    description: 'A significant cause of bloodstream infections, particularly in neonates and patients with indwelling catheters.',
    lastUpdated: 'January 22, 2026',
    totalORFs: 5836,
    haploidORFs: 5836,
    verifiedORFs: 828,
    uncharacterizedORFs: 4936,
    dubiousORFs: 72,
    tRNA: 131,
    chromosomes: ['Contig005809', 'Contig005805', 'Contig005806', 'Contig005807', 'Contig005808', 'Contig005569', 'Contig005570', 'Contig005571'],
    genomeLength: '13,030,522 bp',
    goAnnotations: {
      molecularFunction: 1105,
      cellularComponent: 918,
      biologicalProcess: 1168,
      total: 3191
    }
  },
};

function GenomeSnapshotPage() {
  const { organism } = useParams();
  const orgData = ORGANISMS[organism];

  if (!orgData) {
    return (
      <div className="info-page">
        <div className="info-page-content">
          <h1>Genome Snapshot</h1>
          <hr />
          <p>Select a genome to view its snapshot:</p>
          <ul>
            {Object.entries(ORGANISMS).map(([key, data]) => (
              <li key={key}>
                <Link to={`/genome-snapshot/${key}`}>
                  <em>{data.name}</em> {data.strain}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const verifiedPercent = ((orgData.verifiedORFs / orgData.haploidORFs) * 100).toFixed(2);
  const uncharPercent = ((orgData.uncharacterizedORFs / orgData.haploidORFs) * 100).toFixed(2);
  const dubiousPercent = ((orgData.dubiousORFs / orgData.haploidORFs) * 100).toFixed(2);

  return (
    <div className="info-page genome-snapshot-page">
      <div className="info-page-content">
        <div className="snapshot-header">
          <h1>
            <em>{orgData.name} {orgData.strain}</em> Genome Snapshot/Overview
          </h1>
          <Link to="/help/genome-snapshot" className="help-button">
            <img src="/images/help-button.png" alt="Help" width="30" height="30" />
          </Link>
        </div>
        <hr />

        <p style={{ textAlign: 'right', color: '#666', fontSize: '0.9em', marginBottom: '15px' }}>
          <strong>Last updated:</strong> {orgData.lastUpdated}
        </p>

        <p>
          This page provides information on the status of the <em>{orgData.name} {orgData.strain}</em> genome.
          Data on this page are updated periodically. All the data displayed on this page are available in one
          or more files (Chromosomal Feature File; GO Annotations File; Candida Go Slim Annotations File) on the
          CGD <Link to="/download">Download Data</Link> page. The{' '}
          <a href="/feature-search">Advanced Search</a> tool can also be used to retrieve
          chromosomal features that match specific criteria.
        </p>

        {/* Table of Contents */}
        <section className="info-section">
          <h2>Contents</h2>
          <ol className="toc-list">
            <li><a href="#pieChart">Graphical View of Protein Coding Genes</a></li>
            <li><a href="#genomeInventory">Genome Inventory</a></li>
            <li><a href="#goAnnotations">Summary of GO annotations</a></li>
            <li><a href="#barCharts">Distribution of Gene Products by Process, Function, and Component</a></li>
          </ol>
        </section>

        {/* Pie Chart Section */}
        <section className="info-section" id="pieChart">
          <h3>Graphical View of Protein Coding Genes</h3>
          <div className="chart-container">
            <img
              src={`http://www.candidagenome.org/images/genome_snapshot/pieChart_${organism}.png`}
              alt={`${orgData.name} ORF Distribution Pie Chart`}
              className="snapshot-chart"
            />
          </div>
          <div className="legend-container">
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#4169E1' }}></span>
              {orgData.verifiedORFs} ORFs, {verifiedPercent}% Verified
            </span>
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#228B22' }}></span>
              {orgData.uncharacterizedORFs} ORFs, {uncharPercent}% Uncharacterized
            </span>
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#DC143C' }}></span>
              {orgData.dubiousORFs} ORFs, {dubiousPercent}% Dubious
            </span>
          </div>
        </section>

        {/* Genome Inventory Section */}
        <section className="info-section" id="genomeInventory">
          <h3>Genome Inventory</h3>
          <p>
            This table reports the number and types of features annotated in CGD. To get a list of all
            features of a certain type (e.g., Verified ORF, tRNA, etc.), select that feature type.
          </p>

          <table className="snapshot-table">
            <thead>
              <tr>
                <th>Feature Type</th>
                <th>Total</th>
                <th>Haploid Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total ORFs</td>
                <td>{orgData.totalORFs.toLocaleString()}</td>
                <td>{orgData.haploidORFs.toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  <a href={`/feature-search?featuretype=Verified ORFs&organism=${organism}&qualifier=Verified`}>
                    Verified ORFs
                  </a>
                </td>
                <td>{orgData.verifiedORFs.toLocaleString()}</td>
                <td>{Math.round(orgData.verifiedORFs / (organism.includes('albicans') ? 2 : 1)).toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  <a href={`/feature-search?featuretype=Uncharacterized ORFs&organism=${organism}&qualifier=Uncharacterized`}>
                    Uncharacterized ORFs
                  </a>
                </td>
                <td>{orgData.uncharacterizedORFs.toLocaleString()}</td>
                <td>{Math.round(orgData.uncharacterizedORFs / (organism.includes('albicans') ? 2 : 1)).toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  <a href={`/feature-search?featuretype=Dubious ORFs&organism=${organism}&qualifier=Dubious`}>
                    Dubious ORFs
                  </a>
                </td>
                <td>{orgData.dubiousORFs.toLocaleString()}</td>
                <td>{Math.round(orgData.dubiousORFs / (organism.includes('albicans') ? 2 : 1)).toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  <a href={`/feature-search?featuretype=tRNA&organism=${organism}`}>
                    tRNA
                  </a>
                </td>
                <td>{orgData.tRNA.toLocaleString()}</td>
                <td>{Math.round(orgData.tRNA / (organism.includes('albicans') ? 2 : 1)).toLocaleString()}</td>
              </tr>
              <tr className="total-row">
                <th>Genome length</th>
                <td colSpan="2">{orgData.genomeLength}</td>
              </tr>
            </tbody>
          </table>

          <p style={{ marginTop: '15px' }}>
            <strong>Chromosomes:</strong> {orgData.chromosomes.join(', ')}
          </p>
        </section>

        {/* GO Annotations Section */}
        <section className="info-section" id="goAnnotations">
          <h3>Summary of Gene Ontology (GO) annotations</h3>
          <p>
            This table displays the current total number of <em>{orgData.name} {orgData.strain}</em> gene
            products that have been annotated to one or more terms in each GO aspect (Process, Function,
            Component). These counts include GO annotations made for ORFs classified as either "Verified"
            or "Uncharacterized", transposable element genes, and all RNA gene products.
          </p>

          <table className="snapshot-table go-table">
            <thead>
              <tr>
                <th>Ontology</th>
                <th>Total Number of Annotations</th>
                <th>Graphical View</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Molecular Function</td>
                <td>{orgData.goAnnotations.molecularFunction.toLocaleString()}</td>
                <td><a href="#function">Go to Molecular Function Graph</a></td>
              </tr>
              <tr>
                <td>Cellular Component</td>
                <td>{orgData.goAnnotations.cellularComponent.toLocaleString()}</td>
                <td><a href="#component">Go to Cellular Component Graph</a></td>
              </tr>
              <tr>
                <td>Biological Process</td>
                <td>{orgData.goAnnotations.biologicalProcess.toLocaleString()}</td>
                <td><a href="#process">Go to Biological Process Graph</a></td>
              </tr>
              <tr className="total-row">
                <th>All Ontologies</th>
                <td>{orgData.goAnnotations.total.toLocaleString()}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Bar Charts Section */}
        <section className="info-section" id="barCharts">
          <h3>Distribution of Gene Products by Process, Function, and Component</h3>
          <p>
            These graphical views representing the GO annotation state of the entire genome are provided
            using a GO Slim (a high-level subset of Gene Ontology terms that allows grouping of genes
            into broad categories such as "DNA replication", "protein kinase activity", or "nucleus")
            tailored to <em>Candida</em> biology.
          </p>
          <p>
            More information on GO and GO Slim can be found at SGD's{' '}
            <a href="https://sites.google.com/view/yeastgenome-help/function-help/gene-ontology-go" target="_blank" rel="noopener noreferrer">
              GO help page
            </a>{' '}
            or in the Gene Ontology{' '}
            <a href="http://www.geneontology.org/GO.doc.shtml" target="_blank" rel="noopener noreferrer">
              documentation
            </a>.
            To obtain the GO data summarized in these graphs, you may use the{' '}
            <a href="/go-slim-mapper">GO Slim Mapper</a>.
          </p>

          <div id="function" className="chart-section">
            <h4>Distribution of Gene Products among Molecular Function Categories</h4>
            <div className="chart-container">
              <img
                src={`http://www.candidagenome.org/images/genome_snapshot/function_${organism}.png`}
                alt={`${orgData.name} Molecular Function Distribution`}
                className="snapshot-chart bar-chart"
              />
            </div>
          </div>

          <div id="component" className="chart-section">
            <h4>Distribution of Gene Products among Cellular Component Categories</h4>
            <div className="chart-container">
              <img
                src={`http://www.candidagenome.org/images/genome_snapshot/component_${organism}.png`}
                alt={`${orgData.name} Cellular Component Distribution`}
                className="snapshot-chart bar-chart"
              />
            </div>
          </div>

          <div id="process" className="chart-section">
            <h4>Distribution of Gene Products among Biological Process Categories</h4>
            <div className="chart-container">
              <img
                src={`http://www.candidagenome.org/images/genome_snapshot/process_${organism}.png`}
                alt={`${orgData.name} Biological Process Distribution`}
                className="snapshot-chart bar-chart"
              />
            </div>
          </div>
        </section>

        <hr />

        {/* Other Genome Snapshots */}
        <section className="info-section">
          <h3>Other Genome Snapshots</h3>
          <ul>
            {Object.entries(ORGANISMS)
              .filter(([key]) => key !== organism)
              .map(([key, data]) => (
                <li key={key}>
                  <Link to={`/genome-snapshot/${key}`}>
                    <em>{data.name}</em> {data.strain}
                  </Link>
                </li>
              ))}
          </ul>
        </section>

        {/* Related Resources */}
        <section className="info-section">
          <h3>Related Resources</h3>
          <ul>
            <li>
              <a href="/feature-search">Advanced Search Tool</a> - Search for chromosomal features
            </li>
            <li>
              <Link to="/download">Download Data</Link> - Download feature files, GO annotations, and sequences
            </li>
            <li>
              <Link to="/help/genome-snapshot">Genome Snapshot Help</Link> - Documentation about this resource
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default GenomeSnapshotPage;

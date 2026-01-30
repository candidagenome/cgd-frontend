import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './InfoPages.css';

const ORGANISMS = {
  'C_albicans_SC5314': {
    name: 'Candida albicans',
    strain: 'SC5314',
    description: 'The most commonly isolated human fungal pathogen and the best-studied Candida species.',
  },
  'C_auris_B8441': {
    name: 'Candida auris',
    strain: 'B8441',
    description: 'An emerging multidrug-resistant pathogen causing healthcare-associated infections worldwide.',
  },
  'C_dubliniensis_CD36': {
    name: 'Candida dubliniensis',
    strain: 'CD36',
    description: 'A closely related species to C. albicans, often associated with oral candidiasis in immunocompromised patients.',
  },
  'C_glabrata_CBS138': {
    name: 'Candida glabrata',
    strain: 'CBS138',
    description: 'The second most common cause of candidiasis, more closely related to Saccharomyces cerevisiae than to C. albicans.',
  },
  'C_parapsilosis_CDC317': {
    name: 'Candida parapsilosis',
    strain: 'CDC317',
    description: 'A significant cause of bloodstream infections, particularly in neonates and patients with indwelling catheters.',
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
          <div className="placeholder-notice">
            <p>Unknown organism specified. Please select from the available genomes:</p>
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
      </div>
    );
  }

  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>
          <em>{orgData.name}</em> {orgData.strain} Genome Snapshot
        </h1>
        <hr />

        <div className="placeholder-notice">
          <h3>Page Under Development</h3>
          <p>
            This page will display daily-updated genome statistics for{' '}
            <em>{orgData.name}</em> {orgData.strain}.
          </p>
          <p>{orgData.description}</p>
        </div>

        <section className="info-section">
          <h2>Planned Content</h2>
          <p>When complete, this page will include:</p>
          <ul>
            <li>
              <strong>Graphical View of Protein Coding Genes</strong> - Pie chart showing ORF
              classifications (Verified, Uncharacterized, Dubious)
            </li>
            <li>
              <strong>Genome Inventory</strong> - Table of feature counts per chromosome including
              ORFs, tRNAs, rRNAs, centromeres, and other genomic elements
            </li>
            <li>
              <strong>Summary of GO Annotations</strong> - Statistics on Gene Ontology annotations
              for Biological Process, Molecular Function, and Cellular Component
            </li>
            <li>
              <strong>GO-Slim Distribution</strong> - Bar graphs showing distribution of gene
              products by Process, Function, and Component categories
            </li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Other Genome Snapshots</h2>
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

        <section className="info-section">
          <h2>Related Resources</h2>
          <ul>
            <li>
              <a href="/cgi-bin/search/featureSearch">Advanced Search Tool</a> - Search for
              chromosomal features by various criteria
            </li>
            <li>
              <a href="/DownloadContents.shtml">Download Data</a> - Download chromosomal feature
              files, GO annotations, and sequence data
            </li>
            <li>
              <a href="/help/genomeSnapshot.shtml">Genome Snapshot Help</a> - Documentation about
              this resource
            </li>
          </ul>
        </section>

        <div className="placeholder-notice" style={{ marginTop: '30px' }}>
          <p>
            <strong>Note:</strong> For the current live version of this page with real-time data,
            please visit the{' '}
            <a href={`/cache/${organism}_genomeSnapshot.html`}>backend Genome Snapshot page</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GenomeSnapshotPage;

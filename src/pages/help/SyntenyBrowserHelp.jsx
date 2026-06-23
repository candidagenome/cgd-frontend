import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function SyntenyBrowserHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>About the Synteny Browser</h1>
        <hr />

        <div className="info-section">
          <h2>Overview</h2>
          <p>
            The Synteny Browser compares genomic neighborhoods across <em>Candida</em> species.
            Search for a gene to view nearby genes, predicted orthologs, and conserved gene
            order across CGD species.
          </p>
          <p>
            The browser is intended as a way to evaluate local gene context and ortholog
            relationships. It complements the ortholog and best-hit information shown on
            individual <Link to="/help/locus">Locus pages</Link>.
          </p>
        </div>

        <div className="info-section">
          <h2>How Orthology Is Calculated</h2>
          <p>
            CGD uses the standard evolutionary definition of orthology: genes descended from a
            common ancestral gene sequence. Orthology does not require that the genes have
            identical functions after the species diverged, although that is often the case.
          </p>
          <p>
            The ortholog relationships shown in the Synteny Browser are based on CGOB
            (Candida Gene Order Browser) clusters, which use a combination of sequence similarity
            and conserved gene order, or synteny, to identify orthologs across fungal species.
          </p>
          <p>
            Ribbons in the display connect genes that belong to the same ortholog cluster. These
            connections can help users evaluate whether an ortholog assignment is supported by
            neighboring genes as well as by sequence similarity.
          </p>
        </div>

        <div className="info-section">
          <h2>Orientation and Gene Direction</h2>
          <p>
            Gene arrows show the strand recorded in the genome assembly for each species. The
            orientation of a chromosome or contig in an assembly is essentially arbitrary because
            it depends on the direction in which that chromosome was sequenced, assembled, and
            deposited.
          </p>
          <p>
            For that reason, plus and minus strand labels are meaningful within a single assembly,
            but the left-to-right orientation of one species track should not be interpreted as an
            absolute biological direction relative to another species. Conserved neighborhoods and
            ortholog connections are the important comparison points.
          </p>
        </div>

        <div className="info-section">
          <h2>Display Guide</h2>
          <ul>
            <li><strong>Dark red gene:</strong> The query gene you searched for.</li>
            <li><strong>Light red genes:</strong> Orthologs of the query gene in other species.</li>
            <li><strong>Blue genes:</strong> Genes with orthologs in other CGD species.</li>
            <li><strong>Gray genes:</strong> Species-specific genes without orthologs in other CGD species.</li>
            <li><strong>Connecting ribbons:</strong> Links between orthologous genes across species tracks.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SyntenyBrowserHelp;

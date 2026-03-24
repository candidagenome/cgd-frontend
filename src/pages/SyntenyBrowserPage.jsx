import React from 'react';
import GenomeSyntenyBrowser from '../components/synteny/GenomeSyntenyBrowser';
import './SyntenyBrowserPage.css';

function SyntenyBrowserPage() {
  return (
    <main className="synteny-browser-page">
      <div className="page-header">
        <h1>Synteny Browser</h1>
        <p className="page-description">
          Compare syntenic regions across <em>Candida</em> species.
          Search for a gene to view its genomic neighborhood and ortholog relationships across all CGD species.
        </p>
      </div>

      <div className="browser-wrapper">
        <GenomeSyntenyBrowser />
      </div>

      <div className="page-help">
        <h2>How to Use</h2>
        <ul>
          <li><strong>Search for a gene:</strong> Enter a gene name (e.g., ACT1, CDC19, ERG11) to view its syntenic region across species.</li>
          <li><strong>Adjust flanking genes:</strong> Change the number of upstream/downstream genes shown (5-50).</li>
          <li><strong>Zoom in/out:</strong> Use the + / - buttons or scroll with your mouse wheel to zoom.</li>
          <li><strong>Filter species:</strong> Use checkboxes to show/hide specific species tracks.</li>
          <li><strong>View gene details:</strong> Hover over any gene to see its name, coordinates, and ortholog cluster.</li>
          <li><strong>Navigate to locus:</strong> Click on any gene to open its full locus page.</li>
          <li><strong>Download:</strong> Export the current view as a PNG image.</li>
        </ul>

        <h3>Understanding the Display</h3>
        <ul>
          <li><strong>Red gene:</strong> The query gene you searched for.</li>
          <li><strong>Colored genes:</strong> Genes colored by their CGOB ortholog cluster. Same color = same ortholog group.</li>
          <li><strong>Gray genes:</strong> Species-specific genes without orthologs in other CGD species.</li>
          <li><strong>Connecting lines:</strong> Lines between tracks connect orthologous genes across species.</li>
          <li><strong>Gene direction:</strong> Arrow shapes indicate gene strand (Watson/+ or Crick/-).</li>
        </ul>
      </div>
    </main>
  );
}

export default SyntenyBrowserPage;

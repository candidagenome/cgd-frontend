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
          <li><strong>Zoom in/out:</strong> Use the + / - buttons to zoom in or out.</li>
          <li><strong>Filter species:</strong> Use checkboxes to show/hide specific species tracks.</li>
          <li><strong>View gene details:</strong> Hover over any gene to see its name, coordinates, and ortholog cluster.</li>
          <li><strong>Navigate to locus:</strong> Click on any gene to see details and access its locus page.</li>
          <li><strong>Download:</strong> Export the current view as PNG or SVG.</li>
        </ul>

        <h3>Understanding the Display</h3>
        <ul>
          <li><strong>Dark red gene:</strong> The query gene you searched for.</li>
          <li><strong>Light red genes:</strong> Orthologs of your query gene in other species.</li>
          <li><strong>Blue genes:</strong> Genes with orthologs in other CGD species (not the query ortholog group).</li>
          <li><strong>Gray genes:</strong> Species-specific genes without orthologs in other CGD species.</li>
          <li><strong>Connecting ribbons:</strong> Ribbons between tracks connect orthologous genes across species.</li>
          <li><strong>Gene direction:</strong> Arrow shapes indicate gene strand (Watson/+ or Crick/-).</li>
          <li><strong>Consistent scale:</strong> Gene sizes are drawn to the same scale across all species, allowing direct size comparisons.</li>
        </ul>
      </div>
    </main>
  );
}

export default SyntenyBrowserPage;

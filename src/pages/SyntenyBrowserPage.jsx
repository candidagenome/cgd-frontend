import React from 'react';
import GenomeSyntenyBrowser from '../components/synteny/GenomeSyntenyBrowser';
import './SyntenyBrowserPage.css';

function SyntenyBrowserPage() {
  return (
    <main className="synteny-browser-page">
      <div className="page-header">
        <h1>Whole-Genome Synteny Browser</h1>
        <p className="page-description">
          Compare chromosomal regions across <em>Candida</em> species to explore conserved gene order and ortholog relationships.
          Use the controls to select a chromosome, search for genes, zoom in/out, and pan across the genome.
        </p>
      </div>

      <div className="browser-wrapper">
        <GenomeSyntenyBrowser />
      </div>

      <div className="page-help">
        <h2>How to Use</h2>
        <ul>
          <li><strong>Select a chromosome:</strong> Use the dropdown menus to choose an organism and chromosome to view.</li>
          <li><strong>Search for genes:</strong> Type a gene name in the search box to find and highlight specific genes.</li>
          <li><strong>Zoom in/out:</strong> Use the + / - buttons or scroll with your mouse wheel to zoom.</li>
          <li><strong>Pan:</strong> Click and drag to pan across the chromosome.</li>
          <li><strong>View gene details:</strong> Hover over any gene to see its name, coordinates, and ortholog information.</li>
          <li><strong>Navigate to locus:</strong> Click on any gene to open its locus page.</li>
          <li><strong>Filter species:</strong> Use the checkboxes to show/hide specific species tracks.</li>
          <li><strong>Download:</strong> Export the current view as a PNG image.</li>
        </ul>

        <h3>Understanding the Display</h3>
        <ul>
          <li><strong>Colored genes:</strong> Genes are colored by their ortholog cluster. Genes with the same color belong to the same ortholog group.</li>
          <li><strong>Gray genes:</strong> Species-specific genes without orthologs in the displayed species.</li>
          <li><strong>Connecting lines:</strong> Lines between tracks connect orthologous genes across species.</li>
          <li><strong>Gene direction:</strong> Arrow shapes indicate gene strand (Watson/+ or Crick/-).</li>
        </ul>
      </div>
    </main>
  );
}

export default SyntenyBrowserPage;

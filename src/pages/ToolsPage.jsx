import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const ToolsPage = () => {
  const tools = [
    {
      title: 'Batch Download',
      url: '/batch-download',
      description: 'Download sequences and annotation data for a list of genes'
    },
    {
      title: 'BLAST',
      url: '/blast',
      description: 'Search Candida sequences by similarity to a nucleotide or protein query'
    },
    {
      title: 'CRISPR Guide Designer',
      url: '/crispr',
      description: 'Design sgRNAs for Candida CRISPRi/CRISPRa/CRISPR cut experiments, with off-target evaluation and cloning primers'
    },
    {
      title: 'Gene/Sequence Resources',
      url: '/seq-tools',
      description: 'Retrieve sequences and annotation for a gene or chromosomal region'
    },
    {
      title: 'GO Slim Mapper',
      url: '/go-slim-mapper',
      description: 'Map annotations of a gene list to broad GO Slim terms'
    },
    {
      title: 'GO Term Finder',
      url: '/go-term-finder',
      description: 'Find significantly shared GO terms among a list of genes'
    },
    {
      title: 'Ortholog Converter',
      url: '/ortholog-converter',
      description: 'Convert gene lists between Candida species or to S. cerevisiae for functional analysis'
    },
    {
      title: 'PatMatch',
      url: '/patmatch',
      description: 'Search for short nucleotide or peptide sequences, or sequence patterns, in Candida genomes'
    },
    {
      title: 'Phenotype Search',
      url: '/phenotype/search',
      description: 'Search for genes by phenotype annotations'
    },
    {
      title: 'Primers',
      url: '/webprimer',
      description: 'Design PCR primers for Candida sequences'
    },
    {
      title: 'Restriction Mapper',
      url: '/restriction-mapper',
      description: 'Find restriction enzyme sites in Candida sequences'
    },
    {
      title: 'Synteny Browser',
      url: '/synteny-browser',
      description: 'Compare syntenic regions across Candida species'
    },
    {
      title: 'Virulence Factor Browser',
      url: '/virulence-factor-browser',
      description: 'Search and filter Candida virulence-related genes with curated summaries and supporting literature'
    }
  ];

  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Tools</h1>
        <hr />

        <div className="info-section">
          {tools.map((tool, index) => (
            <div key={index} className="help-item">
              <h3>
                <Link to={tool.url}>{tool.title}</Link>
              </h3>
              <p>{tool.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;

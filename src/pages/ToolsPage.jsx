import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const ToolsPage = () => {
  const sequenceTools = [
    {
      title: 'BLAST',
      url: '/blast',
      description: 'Search Candida genome sequences using BLAST (Basic Local Alignment Search Tool)'
    },
    {
      title: 'PatMatch',
      url: '/patmatch',
      description: 'Search for short nucleotide or peptide sequences, or sequence patterns, in Candida'
    },
    {
      title: 'Web Primer',
      url: '/webprimer',
      description: 'Design PCR primers for Candida sequences'
    },
    {
      title: 'Restriction Mapper',
      url: '/restriction-mapper',
      description: 'Find restriction enzyme sites in Candida sequences'
    },
    {
      title: 'Gene/Sequence Resources',
      url: '/seq-tools',
      description: 'Retrieve, display, and analyze gene or sequence information'
    }
  ];

  const goTools = [
    {
      title: 'GO Term Finder',
      url: '/go-term-finder',
      description: 'Find significant GO terms shared by a set of Candida genes'
    },
    {
      title: 'GO Slim Mapper',
      url: '/go-slim-mapper',
      description: 'Map Candida genes to broad GO Slim categories'
    }
  ];

  const searchTools = [
    {
      title: 'Advanced Search',
      url: '/feature-search',
      description: 'Search for genes and features using multiple criteria'
    },
    {
      title: 'Batch Download',
      url: '/batch-download',
      description: 'Download sequences and annotations for multiple genes'
    },
    {
      title: 'Phenotype Search',
      url: '/phenotype-search',
      description: 'Search for genes by phenotype annotations'
    }
  ];

  const genomeSnapshots = [
    {
      title: 'C. albicans SC5314 Genome Snapshot',
      url: '/genome-snapshot/C_albicans_SC5314',
      description: 'Overview of genome features and statistics'
    },
    {
      title: 'C. auris B8441 Genome Snapshot',
      url: '/genome-snapshot/C_auris_B8441',
      description: 'Overview of genome features and statistics'
    },
    {
      title: 'C. dubliniensis CD36 Genome Snapshot',
      url: '/genome-snapshot/C_dubliniensis_CD36',
      description: 'Overview of genome features and statistics'
    },
    {
      title: 'C. glabrata CBS138 Genome Snapshot',
      url: '/genome-snapshot/C_glabrata_CBS138',
      description: 'Overview of genome features and statistics'
    },
    {
      title: 'C. parapsilosis CDC317 Genome Snapshot',
      url: '/genome-snapshot/C_parapsilosis_CDC317',
      description: 'Overview of genome features and statistics'
    }
  ];

  const renderToolSection = (title, tools) => (
    <div className="info-section">
      <h2>{title}</h2>
      {tools.map((tool, index) => (
        <div key={index} className="help-item">
          <h3>
            <Link to={tool.url}>{tool.title}</Link>
          </h3>
          <p>{tool.description}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Tools</h1>
        <hr />

        {renderToolSection('Sequence Analysis', sequenceTools)}
        {renderToolSection('Gene Ontology Tools', goTools)}
        {renderToolSection('Search & Download', searchTools)}
        {renderToolSection('Genome Snapshots', genomeSnapshots)}
      </div>
    </div>
  );
};

export default ToolsPage;

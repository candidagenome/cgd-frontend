import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const ToolsPage = () => {
  const tools = [
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
      title: 'Primers',
      url: '/webprimer',
      description: 'Design PCR primers for Candida sequences'
    },
    {
      title: 'Phenotype Search',
      url: '/phenotype/search',
      description: 'Search for genes by phenotype annotations'
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

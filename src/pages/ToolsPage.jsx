import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const ToolsPage = () => {
  const toolGroups = [
    {
      heading: 'Sequence Analysis',
      blurb: 'Start from a sequence or retrieve sequences for genes and regions.',
      tools: [
        {
          title: 'BLAST',
          url: '/blast',
          description: 'Search Candida sequences by similarity to a nucleotide or protein query'
        },
        {
          title: 'PatMatch',
          url: '/patmatch',
          description: 'Search for short nucleotide or peptide sequences, or sequence patterns, in Candida genomes'
        },
        {
          title: 'Gene/Sequence Resources',
          url: '/seq-tools',
          description: 'Retrieve sequences and annotation for a gene or chromosomal region'
        },
        {
          title: 'Batch Download',
          url: '/batch-download',
          description: 'Download sequences and annotation data for a list of genes'
        }
      ]
    },
    {
      heading: 'Experimental Design',
      blurb: 'Design reagents for the bench.',
      tools: [
        {
          title: 'CRISPR Guide Designer',
          url: '/crispr',
          description: 'Design sgRNAs for Candida CRISPRi/CRISPRa/CRISPR cut experiments, with off-target evaluation and cloning primers'
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
        }
      ]
    },
    {
      heading: 'Function & Phenotype',
      blurb: 'Interpret gene lists and explore annotations.',
      tools: [
        {
          title: 'GO Term Finder',
          url: '/go-term-finder',
          description: 'Find significantly shared GO terms among a list of genes'
        },
        {
          title: 'GO Slim Mapper',
          url: '/go-slim-mapper',
          description: 'Map annotations of a gene list to broad GO Slim terms'
        },
        {
          title: 'Phenotype Search',
          url: '/phenotype/search',
          description: 'Search for genes by phenotype annotations'
        },
        {
          title: 'Virulence Factor Browser',
          url: '/virulence-factor-browser',
          description: 'Search and filter Candida virulence-related genes with curated summaries and supporting literature'
        }
      ]
    },
    {
      heading: 'Comparative Genomics',
      blurb: 'Work across Candida species and S. cerevisiae.',
      tools: [
        {
          title: 'Ortholog Converter',
          url: '/ortholog-converter',
          description: 'Convert gene lists between Candida species or to S. cerevisiae for functional analysis'
        },
        {
          title: 'Synteny Browser',
          url: '/synteny-browser',
          description: 'Compare syntenic regions across Candida species'
        }
      ]
    }
  ];

  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Tools</h1>
        <hr />

        {toolGroups.map((group) => (
          <div key={group.heading} className="info-section">
            <h2>{group.heading}</h2>
            <p className="tools-group-blurb">{group.blurb}</p>
            {group.tools.map((tool) => (
              <div key={tool.title} className="help-item">
                <h3>
                  <Link to={tool.url}>{tool.title}</Link>
                </h3>
                <p>{tool.description}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolsPage;

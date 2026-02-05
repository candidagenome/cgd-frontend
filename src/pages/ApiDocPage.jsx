import React, { useState } from 'react';
import './ApiDocPage.css';

const ApiDocPage = () => {
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const apiGroups = [
    {
      name: 'Search',
      description: 'Search across genes, GO terms, phenotypes, and references',
      endpoints: [
        { method: 'GET', path: '/api/search/resolve', description: 'Resolve an identifier to a direct URL', params: 'query' },
        { method: 'GET', path: '/api/search/quick', description: 'Quick search across all categories', params: 'query, limit' },
        { method: 'GET', path: '/api/search/autocomplete', description: 'Get autocomplete suggestions', params: 'query, limit' },
        { method: 'GET', path: '/api/search/category', description: 'Search within a specific category with pagination', params: 'query, category, page, page_size' },
      ]
    },
    {
      name: 'Locus',
      description: 'Gene/locus information and annotations',
      endpoints: [
        { method: 'GET', path: '/api/locus/{name}', description: 'Get basic locus info (aliases, external links)' },
        { method: 'GET', path: '/api/locus/{name}/go_details', description: 'Get GO annotations for a locus' },
        { method: 'GET', path: '/api/locus/{name}/phenotype_details', description: 'Get phenotype annotations' },
        { method: 'GET', path: '/api/locus/{name}/interaction_details', description: 'Get interaction data' },
        { method: 'GET', path: '/api/locus/{name}/protein_details', description: 'Get protein information' },
        { method: 'GET', path: '/api/locus/{name}/homology_details', description: 'Get homology/orthologs' },
        { method: 'GET', path: '/api/locus/{name}/sequence_details', description: 'Get sequence and location info' },
        { method: 'GET', path: '/api/locus/{name}/references', description: 'Get references for a locus' },
        { method: 'GET', path: '/api/locus/{name}/summary_notes', description: 'Get summary notes/paragraphs' },
        { method: 'GET', path: '/api/locus/{name}/history', description: 'Get locus history' },
        { method: 'GET', path: '/api/locus/{name}/protein_properties', description: 'Get protein physico-chemical properties' },
        { method: 'GET', path: '/api/locus/{name}/domain_details', description: 'Get protein domain/motif details' },
      ]
    },
    {
      name: 'Gene Ontology (GO)',
      description: 'GO terms, evidence codes, and hierarchy',
      endpoints: [
        { method: 'GET', path: '/api/go/{goid}', description: 'Get GO term info and annotations by GOID' },
        { method: 'GET', path: '/api/go/evidence', description: 'Get all GO evidence codes with definitions' },
        { method: 'GET', path: '/api/go/{goid}/hierarchy', description: 'Get GO term hierarchy for visualization', params: 'max_nodes' },
      ]
    },
    {
      name: 'GO Term Finder',
      description: 'GO enrichment analysis tools',
      endpoints: [
        { method: 'GET', path: '/api/go-term-finder/config', description: 'Get configuration (organisms, evidence codes, annotation types)' },
        { method: 'POST', path: '/api/go-term-finder/validate-genes', description: 'Validate a list of genes' },
        { method: 'POST', path: '/api/go-term-finder/analyze', description: 'Run GO Term Finder enrichment analysis' },
        { method: 'POST', path: '/api/go-term-finder/graph', description: 'Get enrichment graph for visualization' },
        { method: 'POST', path: '/api/go-term-finder/download/{format}', description: 'Download results (tsv/csv)' },
      ]
    },
    {
      name: 'GO Slim Mapper',
      description: 'Map genes to GO Slim categories',
      endpoints: [
        { method: 'GET', path: '/api/go-slim-mapper/config', description: 'Get configuration (organisms, GO Slim sets)' },
        { method: 'GET', path: '/api/go-slim-mapper/slim-sets', description: 'Get all available GO Slim sets' },
        { method: 'GET', path: '/api/go-slim-mapper/slim-terms/{setName}/{aspect}', description: 'Get GO Slim terms for a set and aspect' },
        { method: 'POST', path: '/api/go-slim-mapper/analyze', description: 'Run GO Slim Mapper analysis' },
        { method: 'POST', path: '/api/go-slim-mapper/download/{format}', description: 'Download results (tsv/csv)' },
      ]
    },
    {
      name: 'Phenotype',
      description: 'Phenotype search and observable terms',
      endpoints: [
        { method: 'GET', path: '/api/phenotype/search', description: 'Search phenotypes by criteria', params: 'observable, qualifier, experiment_type, mutant_type, page, limit' },
        { method: 'GET', path: '/api/phenotype/observables', description: 'Get hierarchical tree of observable CV terms' },
      ]
    },
    {
      name: 'Reference',
      description: 'Literature and publication information',
      endpoints: [
        { method: 'GET', path: '/api/reference/{id}', description: 'Get basic reference info by PubMed ID or CGD ID' },
        { method: 'GET', path: '/api/reference/{id}/locus_details', description: 'Get loci addressed in a paper' },
        { method: 'GET', path: '/api/reference/{id}/go_details', description: 'Get GO annotations citing this reference' },
        { method: 'GET', path: '/api/reference/{id}/phenotype_details', description: 'Get phenotype annotations citing this reference' },
        { method: 'GET', path: '/api/reference/{id}/interaction_details', description: 'Get interactions citing this reference' },
        { method: 'GET', path: '/api/reference/{id}/literature_topics', description: 'Get literature topics for this reference' },
        { method: 'GET', path: '/api/reference/search/author', description: 'Search references by author name', params: 'author' },
        { method: 'GET', path: '/api/reference/new-papers-this-week', description: 'Get new papers added this week', params: 'days' },
        { method: 'GET', path: '/api/reference/genome-wide-analysis', description: 'Get genome-wide analysis papers', params: 'topic, page, page_size' },
      ]
    },
    {
      name: 'Chromosome',
      description: 'Chromosome and contig information',
      endpoints: [
        { method: 'GET', path: '/api/chromosome', description: 'List all chromosomes grouped by organism' },
        { method: 'GET', path: '/api/chromosome/{name}', description: 'Get basic chromosome/contig info' },
        { method: 'GET', path: '/api/chromosome/{name}/history', description: 'Get chromosome history (sequence/annotation changes)' },
        { method: 'GET', path: '/api/chromosome/{name}/references', description: 'Get chromosome references' },
        { method: 'GET', path: '/api/chromosome/{name}/summary_notes', description: 'Get chromosome summary notes' },
      ]
    },
    {
      name: 'Sequence Tools',
      description: 'Gene/sequence retrieval and analysis',
      endpoints: [
        { method: 'GET', path: '/api/seq-tools/assemblies', description: 'Get list of available assemblies' },
        { method: 'GET', path: '/api/seq-tools/chromosomes', description: 'Get list of chromosomes for an assembly', params: 'seq_source' },
        { method: 'POST', path: '/api/seq-tools/resolve', description: 'Resolve gene/coordinates/sequence and get available tools' },
      ]
    },
    {
      name: 'BLAST',
      description: 'BLAST sequence similarity search',
      endpoints: [
        { method: 'GET', path: '/api/blast/config', description: 'Get BLAST configuration (programs, databases, defaults)' },
        { method: 'GET', path: '/api/blast/programs', description: 'Get list of available BLAST programs' },
        { method: 'GET', path: '/api/blast/databases', description: 'Get list of available databases', params: 'program' },
        { method: 'GET', path: '/api/blast/databases/{program}', description: 'Get databases compatible with a program' },
        { method: 'GET', path: '/api/blast/programs/{database}', description: 'Get programs compatible with a database' },
        { method: 'POST', path: '/api/blast/search', description: 'Run a BLAST search' },
        { method: 'POST', path: '/api/blast/search/text', description: 'Run BLAST and get results as plain text' },
      ]
    },
    {
      name: 'PatMatch',
      description: 'Pattern matching search',
      endpoints: [
        { method: 'GET', path: '/api/patmatch/config', description: 'Get pattern match configuration (datasets, limits)' },
        { method: 'GET', path: '/api/patmatch/datasets', description: 'Get list of available datasets', params: 'pattern_type' },
        { method: 'POST', path: '/api/patmatch/search', description: 'Run a pattern match search' },
      ]
    },
    {
      name: 'Colleague',
      description: 'Colleague/researcher information',
      endpoints: [
        { method: 'GET', path: '/api/colleague/search', description: 'Search colleagues by last name', params: 'last_name, page, page_size' },
        { method: 'GET', path: '/api/colleague/{colleagueNo}', description: 'Get detailed information for a colleague' },
        { method: 'GET', path: '/api/colleague/form-config', description: 'Get form configuration (countries, states, etc.)' },
        { method: 'POST', path: '/api/colleague/submit', description: 'Submit colleague registration or update' },
      ]
    },
  ];

  const getMethodClass = (method) => {
    switch (method) {
      case 'GET': return 'method-get';
      case 'POST': return 'method-post';
      case 'PUT': return 'method-put';
      case 'DELETE': return 'method-delete';
      default: return '';
    }
  };

  return (
    <div className="api-doc-page">
      <div className="api-doc-content">
        <h1>CGD API Documentation</h1>
        <hr />

        <div className="api-intro">
          <p>
            This page documents the CGD REST API endpoints. The API provides programmatic access
            to gene, GO, phenotype, reference, and other data in the Candida Genome Database.
          </p>
          <p>
            <strong>Base URL:</strong> <code>https://backend.candidagenome.org</code>
          </p>
          <p>
            <strong>Response Format:</strong> All endpoints return JSON unless otherwise noted.
          </p>
        </div>

        <div className="api-groups">
          {apiGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="api-group">
              <div
                className="api-group-header"
                onClick={() => toggleGroup(group.name)}
              >
                <div className="group-title">
                  <span className={`expand-icon ${expandedGroups[group.name] ? 'expanded' : ''}`}>
                    {expandedGroups[group.name] ? '▼' : '▶'}
                  </span>
                  <h2>{group.name}</h2>
                  <span className="endpoint-count">({group.endpoints.length} endpoints)</span>
                </div>
                <p className="group-description">{group.description}</p>
              </div>

              {expandedGroups[group.name] && (
                <div className="api-endpoints">
                  {group.endpoints.map((endpoint, endpointIndex) => (
                    <div key={endpointIndex} className="api-endpoint">
                      <div className="endpoint-header">
                        <span className={`method-badge ${getMethodClass(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <code className="endpoint-path">{endpoint.path}</code>
                      </div>
                      <p className="endpoint-description">{endpoint.description}</p>
                      {endpoint.params && (
                        <div className="endpoint-params">
                          <strong>Parameters:</strong> <code>{endpoint.params}</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="api-note">
          <h3>Notes</h3>
          <ul>
            <li>Path parameters are shown in curly braces, e.g., <code>{'{name}'}</code></li>
            <li>Query parameters are passed as URL query strings</li>
            <li>POST endpoints accept JSON request bodies</li>
            <li>Authentication is not required for read-only endpoints</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiDocPage;

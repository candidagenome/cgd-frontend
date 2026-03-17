import React, { useState } from 'react';
import './ApiDocPage.css';

const ApiDocPage = () => {
  const [expandedGroups, setExpandedGroups] = useState({});

  // Get base URL from environment or use default
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend.dev.candidagenome.org';

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const apiGroups = [
    {
      name: 'Locus',
      description: 'Gene/locus information and annotations',
      endpoints: [
        { method: 'GET', path: '/api/locus/{name}', description: 'Get basic locus info (aliases, external links)', example: '/api/locus/ACT1' },
        { method: 'GET', path: '/api/locus/{name}/go_details', description: 'Get GO annotations for a locus', example: '/api/locus/ACT1/go_details' },
        { method: 'GET', path: '/api/locus/{name}/phenotype_details', description: 'Get phenotype annotations', example: '/api/locus/ACT1/phenotype_details' },
        { method: 'GET', path: '/api/locus/{name}/protein_details', description: 'Get protein information', example: '/api/locus/ACT1/protein_details' },
        { method: 'GET', path: '/api/locus/{name}/homology_details', description: 'Get homology/orthologs', example: '/api/locus/ACT1/homology_details' },
        { method: 'GET', path: '/api/locus/{name}/sequence_details', description: 'Get sequence and location info', example: '/api/locus/ACT1/sequence_details' },
        { method: 'GET', path: '/api/locus/{name}/references', description: 'Get references for a locus', example: '/api/locus/ACT1/references' },
        { method: 'GET', path: '/api/locus/{name}/summary_notes', description: 'Get summary notes/paragraphs', example: '/api/locus/ACT1/summary_notes' },
        { method: 'GET', path: '/api/locus/{name}/history', description: 'Get locus history', example: '/api/locus/ACT1/history' },
        { method: 'GET', path: '/api/locus/{name}/protein_properties', description: 'Get protein physico-chemical properties', example: '/api/locus/ACT1/protein_properties' },
        { method: 'GET', path: '/api/locus/{name}/domain_details', description: 'Get protein domain/motif details', example: '/api/locus/ACT1/domain_details' },
      ]
    },
    {
      name: 'Gene Ontology (GO)',
      description: 'GO terms, evidence codes, and hierarchy',
      endpoints: [
        { method: 'GET', path: '/api/go/{goid}', description: 'Get GO term info and annotations by GOID', example: '/api/go/GO:0005634' },
        { method: 'GET', path: '/api/go/evidence', description: 'Get all GO evidence codes with definitions', example: '/api/go/evidence' },
        { method: 'GET', path: '/api/go/{goid}/hierarchy', description: 'Get GO term hierarchy for visualization', params: 'max_nodes', example: '/api/go/GO:0005634/hierarchy?max_nodes=30' },
      ]
    },
    {
      name: 'Phenotype',
      description: 'Phenotype search and observable terms',
      endpoints: [
        { method: 'GET', path: '/api/phenotype/search', description: 'Search phenotypes by criteria', params: 'observable, qualifier, experiment_type, mutant_type, page, limit', example: '/api/phenotype/search?observable=hyphal%20growth&page=1&limit=25' },
        { method: 'GET', path: '/api/phenotype/observables', description: 'Get hierarchical tree of observable CV terms', example: '/api/phenotype/observables' },
      ]
    },
    {
      name: 'Reference',
      description: 'Literature and publication information',
      endpoints: [
        { method: 'GET', path: '/api/reference/{id}', description: 'Get basic reference info by PubMed ID or CGD ID', example: '/api/reference/40323423' },
        { method: 'GET', path: '/api/reference/{id}/locus_details', description: 'Get loci addressed in a paper', example: '/api/reference/40323423/locus_details' },
        { method: 'GET', path: '/api/reference/{id}/go_details', description: 'Get GO annotations citing this reference', example: '/api/reference/40323423/go_details' },
        { method: 'GET', path: '/api/reference/{id}/phenotype_details', description: 'Get phenotype annotations citing this reference', example: '/api/reference/40323423/phenotype_details' },
        { method: 'GET', path: '/api/reference/{id}/literature_topics', description: 'Get literature topics for this reference', example: '/api/reference/40323423/literature_topics' },
        { method: 'GET', path: '/api/reference/search/author', description: 'Search references by author name', params: 'author', example: '/api/reference/search/author?author=Smith' },
        { method: 'GET', path: '/api/reference/new-papers-this-week', description: 'Get new papers added this week', params: 'days', example: '/api/reference/new-papers-this-week?days=7' },
        { method: 'GET', path: '/api/reference/genome-wide-analysis', description: 'Get genome-wide analysis papers', params: 'topic, page, page_size', example: '/api/reference/genome-wide-analysis?page=1&page_size=50' },
      ]
    },
    {
      name: 'Search',
      description: 'Search across genes, GO terms, phenotypes, and references',
      endpoints: [
        { method: 'GET', path: '/api/search/resolve', description: 'Resolve an identifier to a direct URL', params: 'query', example: '/api/search/resolve?query=ACT1' },
        { method: 'GET', path: '/api/search/quick', description: 'Quick search across all categories', params: 'query, limit', example: '/api/search/quick?query=ACT1&limit=20' },
        { method: 'GET', path: '/api/search/autocomplete', description: 'Get autocomplete suggestions', params: 'query, limit', example: '/api/search/autocomplete?query=ACT&limit=10' },
        { method: 'GET', path: '/api/search/category', description: 'Search within a specific category with pagination', params: 'query, category, page, page_size', example: '/api/search/category?query=kinase&category=genes&page=1&page_size=20' },
        { method: 'GET', path: '/api/search/text', description: 'Full text search across database', params: 'query, page, page_size', example: '/api/search/text?query=biofilm&page=1&page_size=20' },
        { method: 'GET', path: '/api/search/text/category', description: 'Full text search within a category', params: 'query, category, page, page_size', example: '/api/search/text/category?query=biofilm&category=genes&page=1&page_size=20' },
      ]
    },
    {
      name: 'Sequence Tools',
      description: 'Gene/sequence retrieval and analysis',
      endpoints: [
        { method: 'GET', path: '/api/seq-tools/assemblies', description: 'Get list of available assemblies', example: '/api/seq-tools/assemblies' },
        { method: 'GET', path: '/api/seq-tools/chromosomes', description: 'Get list of chromosomes for an assembly', params: 'seq_source', example: '/api/seq-tools/chromosomes?seq_source=C_albicans_SC5314_A22' },
        { method: 'POST', path: '/api/seq-tools/resolve', description: 'Resolve gene/coordinates/sequence and get available tools' },
      ]
    },
    {
      name: 'GO Term Finder',
      description: 'GO enrichment analysis tools',
      endpoints: [
        { method: 'GET', path: '/api/go-term-finder/config', description: 'Get configuration (organisms, evidence codes, annotation types)', example: '/api/go-term-finder/config' },
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
        { method: 'GET', path: '/api/go-slim-mapper/config', description: 'Get configuration (organisms, GO Slim sets)', example: '/api/go-slim-mapper/config' },
        { method: 'GET', path: '/api/go-slim-mapper/slim-sets', description: 'Get all available GO Slim sets', example: '/api/go-slim-mapper/slim-sets' },
        { method: 'GET', path: '/api/go-slim-mapper/slim-terms/{setName}/{aspect}', description: 'Get GO Slim terms for a set and aspect', example: '/api/go-slim-mapper/slim-terms/Yeast%20GO-Slim/P' },
        { method: 'POST', path: '/api/go-slim-mapper/analyze', description: 'Run GO Slim Mapper analysis' },
        { method: 'POST', path: '/api/go-slim-mapper/download/{format}', description: 'Download results (tsv/csv)' },
      ]
    },
    {
      name: 'BLAST',
      description: 'BLAST sequence similarity search',
      endpoints: [
        { method: 'GET', path: '/api/blast/config', description: 'Get BLAST configuration (programs, databases, defaults)', example: '/api/blast/config' },
        { method: 'GET', path: '/api/blast/programs', description: 'Get list of available BLAST programs', example: '/api/blast/programs' },
        { method: 'GET', path: '/api/blast/databases', description: 'Get list of available databases', params: 'program', example: '/api/blast/databases?program=blastn' },
        { method: 'GET', path: '/api/blast/databases/{program}', description: 'Get databases compatible with a program', example: '/api/blast/databases/blastn' },
        { method: 'GET', path: '/api/blast/programs/{database}', description: 'Get programs compatible with a database', example: '/api/blast/programs/C_albicans_SC5314_A22_chromosomes' },
        { method: 'POST', path: '/api/blast/search', description: 'Run a BLAST search' },
        { method: 'POST', path: '/api/blast/search/text', description: 'Run BLAST and get results as plain text' },
      ]
    },
    {
      name: 'PatMatch',
      description: 'Pattern matching search',
      endpoints: [
        { method: 'GET', path: '/api/patmatch/config', description: 'Get pattern match configuration (datasets, limits)', example: '/api/patmatch/config' },
        { method: 'GET', path: '/api/patmatch/datasets', description: 'Get list of available datasets', params: 'pattern_type', example: '/api/patmatch/datasets?pattern_type=dna' },
        { method: 'POST', path: '/api/patmatch/search', description: 'Run a pattern match search' },
      ]
    },
    {
      name: 'Colleague',
      description: 'Colleague/researcher information',
      endpoints: [
        { method: 'GET', path: '/api/colleague/search', description: 'Search colleagues by last name', params: 'last_name, page, page_size', example: '/api/colleague/search?last_name=Smith&page=1&page_size=20' },
        { method: 'GET', path: '/api/colleague/{colleagueNo}', description: 'Get detailed information for a colleague', example: '/api/colleague/12345' },
        { method: 'GET', path: '/api/colleague/form-config', description: 'Get form configuration (countries, states, etc.)', example: '/api/colleague/form-config' },
      ]
    },
    {
      name: 'Chromosome',
      description: 'Chromosome information and features',
      endpoints: [
        { method: 'GET', path: '/api/chromosome', description: 'Get list of all chromosomes', example: '/api/chromosome' },
        { method: 'GET', path: '/api/chromosome/{name}', description: 'Get chromosome details', example: '/api/chromosome/Ca22chr1A_C_albicans_SC5314' },
        { method: 'GET', path: '/api/chromosome/{name}/history', description: 'Get chromosome history', example: '/api/chromosome/Ca22chr1A_C_albicans_SC5314/history' },
        { method: 'GET', path: '/api/chromosome/{name}/references', description: 'Get chromosome references', example: '/api/chromosome/Ca22chr1A_C_albicans_SC5314/references' },
        { method: 'GET', path: '/api/chromosome/{name}/summary_notes', description: 'Get chromosome summary notes', example: '/api/chromosome/Ca22chr1A_C_albicans_SC5314/summary_notes' },
      ]
    },
    {
      name: 'Homology',
      description: 'Homolog and ortholog information',
      endpoints: [
        { method: 'GET', path: '/api/orthologs/{name}', description: 'Get orthologs for a gene', example: '/api/orthologs/ACT1' },
        { method: 'GET', path: '/api/orthologs/{name}/{org_name}', description: 'Get orthologs for a gene in a specific organism', example: '/api/orthologs/ACT1/S_cerevisiae' },
        { method: 'GET', path: '/api/homolog/C_albicans_SC5314_A22/{name}', description: 'Get homologs for a C. albicans gene', example: '/api/homolog/C_albicans_SC5314_A22/ACT1' },
      ]
    },
    {
      name: 'Sequence',
      description: 'Sequence retrieval',
      endpoints: [
        { method: 'GET', path: '/api/sequence', description: 'List available sequences', example: '/api/sequence' },
        { method: 'GET', path: '/api/sequence/region', description: 'Get sequence for a genomic region', params: 'seq_source, chromosome, start, end, strand', example: '/api/sequence/region?seq_source=C_albicans_SC5314_A22&chromosome=Ca22chr1A_C_albicans_SC5314&start=1&end=1000' },
        { method: 'GET', path: '/api/sequence/fasta/{identifier}', description: 'Get FASTA sequence for a gene', example: '/api/sequence/fasta/ACT1' },
      ]
    },
    {
      name: 'Genome Version',
      description: 'Genome assembly version history',
      endpoints: [
        { method: 'GET', path: '/api/genome-version/config', description: 'Get genome version configuration', example: '/api/genome-version/config' },
        { method: 'GET', path: '/api/genome-version/history', description: 'Get version history for all genomes', example: '/api/genome-version/history' },
        { method: 'GET', path: '/api/genome-version/history/{seq_source}', description: 'Get version history for a specific genome', example: '/api/genome-version/history/C_albicans_SC5314_A22' },
      ]
    },
    {
      name: 'Genome Snapshot',
      description: 'Genome statistics and overview',
      endpoints: [
        { method: 'GET', path: '/api/genome-snapshot/organisms', description: 'Get list of organisms with snapshots', example: '/api/genome-snapshot/organisms' },
        { method: 'GET', path: '/api/genome-snapshot/{organism_abbrev}', description: 'Get genome snapshot for an organism', example: '/api/genome-snapshot/C_albicans_SC5314' },
        { method: 'GET', path: '/api/genome-snapshot/{organism_abbrev}/go-slim', description: 'Get GO Slim data for genome snapshot', example: '/api/genome-snapshot/C_albicans_SC5314/go-slim' },
      ]
    },
    {
      name: 'Feature Search',
      description: 'Advanced feature/gene search',
      endpoints: [
        { method: 'GET', path: '/api/feature-search/config', description: 'Get feature search configuration', example: '/api/feature-search/config' },
        { method: 'GET', path: '/api/feature-search/chromosomes/{organism}', description: 'Get chromosomes for an organism', example: '/api/feature-search/chromosomes/C_albicans_SC5314' },
        { method: 'POST', path: '/api/feature-search/search', description: 'Run advanced feature search' },
        { method: 'POST', path: '/api/feature-search/download', description: 'Download search results' },
      ]
    },
    {
      name: 'Batch Download',
      description: 'Bulk data download',
      endpoints: [
        { method: 'GET', path: '/api/batch-download', description: 'Get batch download info', example: '/api/batch-download' },
        { method: 'GET', path: '/api/batch-download/types', description: 'Get available download types', example: '/api/batch-download/types' },
        { method: 'GET', path: '/api/batch-download/metadata', description: 'Get metadata for downloads', example: '/api/batch-download/metadata' },
        { method: 'POST', path: '/api/batch-download', description: 'Request a batch download' },
        { method: 'POST', path: '/api/batch-download/upload', description: 'Upload a gene list for batch download' },
      ]
    },
    {
      name: 'Restriction Mapper',
      description: 'Restriction enzyme analysis',
      endpoints: [
        { method: 'GET', path: '/api/restriction-mapper/config', description: 'Get restriction mapper configuration', example: '/api/restriction-mapper/config' },
        { method: 'GET', path: '/api/restriction-mapper/search', description: 'Search for restriction sites (GET)', params: 'locus, enzymes', example: '/api/restriction-mapper/search?locus=ACT1' },
        { method: 'POST', path: '/api/restriction-mapper/search', description: 'Search for restriction sites (POST)' },
        { method: 'POST', path: '/api/restriction-mapper/download', description: 'Download restriction map results' },
      ]
    },
    {
      name: 'WebPrimer',
      description: 'Primer design tool',
      endpoints: [
        { method: 'GET', path: '/api/webprimer/config', description: 'Get primer design configuration', example: '/api/webprimer/config' },
        { method: 'GET', path: '/api/webprimer/sequence/{locus}', description: 'Get sequence for primer design', example: '/api/webprimer/sequence/ACT1' },
        { method: 'POST', path: '/api/webprimer/sequence', description: 'Submit custom sequence for primer design' },
        { method: 'POST', path: '/api/webprimer/design', description: 'Design primers for a sequence' },
      ]
    },
    {
      name: 'GO Annotation Summary',
      description: 'GO annotation analysis and download',
      endpoints: [
        { method: 'POST', path: '/api/go-annotation-summary/analyze', description: 'Analyze GO annotations for a gene list' },
        { method: 'POST', path: '/api/go-annotation-summary/download/{format}', description: 'Download GO annotation summary (tsv/csv)' },
      ]
    },
    {
      name: 'Literature Topic',
      description: 'Literature topic search and browsing',
      endpoints: [
        { method: 'GET', path: '/api/literature-topic/tree', description: 'Get literature topic hierarchy tree', example: '/api/literature-topic/tree' },
        { method: 'GET', path: '/api/literature-topic/search', description: 'Search literature by topic (GET)', params: 'topic, page, page_size', example: '/api/literature-topic/search?topic=biofilm' },
        { method: 'POST', path: '/api/literature-topic/search', description: 'Search literature by topic (POST)' },
      ]
    },
    {
      name: 'Gene Registry',
      description: 'Gene name registration',
      endpoints: [
        { method: 'GET', path: '/api/gene-registry/config', description: 'Get gene registry configuration', example: '/api/gene-registry/config' },
        { method: 'GET', path: '/api/gene-registry/search', description: 'Search gene registry', params: 'query', example: '/api/gene-registry/search?query=ACT' },
        { method: 'POST', path: '/api/gene-registry/submit', description: 'Submit a gene name registration request' },
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
            <strong>Base URL:</strong> <code>{API_BASE_URL}</code>
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
                      {endpoint.example && (
                        <div className="endpoint-example">
                          <strong>Example:</strong>{' '}
                          <a
                            href={`${API_BASE_URL}${endpoint.example}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="example-link"
                          >
                            {API_BASE_URL}{endpoint.example}
                          </a>
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
            <li>All endpoints are read-only and do not modify data</li>
            <li>Click on example URLs to test them in your browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiDocPage;

import React, { useState } from 'react';
import './ApiDocPage.css';

// Characters of a non-JSON (FASTA, Newick, ...) response shown in the playground
const TEXT_PREVIEW_CHARS = 5000;

// Path and query parameter values taken from an endpoint's example URL, so the
// playground opens ready to run (e.g. {name} -> ACT1).
const exampleParams = (endpoint) => {
  const pathParams = {};
  const queryParams = {};
  if (!endpoint.example) return { pathParams, queryParams };
  const [examplePath, exampleQuery = ''] = endpoint.example.split('?');
  const templateParts = endpoint.path.split('/');
  const exampleParts = examplePath.split('/');
  if (templateParts.length === exampleParts.length) {
    templateParts.forEach((part, i) => {
      const match = part.match(/^\{([^}]+)\}$/);
      if (match) pathParams[match[1]] = decodeURIComponent(exampleParts[i]);
    });
  }
  new URLSearchParams(exampleQuery).forEach((value, key) => {
    queryParams[key] = value;
  });
  return { pathParams, queryParams };
};

// API Playground Component
const ApiPlayground = ({ endpoint, baseUrl, onClose }) => {
  const [pathParams, setPathParams] = useState(() => exampleParams(endpoint).pathParams);
  const [queryParams, setQueryParams] = useState(() => exampleParams(endpoint).queryParams);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('response');

  // Extract path parameters from endpoint path (e.g., {name}, {id})
  const pathParamMatches = endpoint.path.match(/\{([^}]+)\}/g) || [];
  const pathParamNames = pathParamMatches.map(p => p.slice(1, -1));

  // Extract query parameters from endpoint params string
  const queryParamNames = endpoint.params
    ? endpoint.params.split(',').map(p => p.trim())
    : [];
  const missingPathParams = pathParamNames.filter(param => !pathParams[param]);

  // Build the actual URL with parameters
  const buildUrl = () => {
    let url = endpoint.path;
    // Replace path parameters
    pathParamNames.forEach(param => {
      url = url.replace(`{${param}}`, encodeURIComponent(pathParams[param] || ''));
    });
    // Add query parameters
    const queryString = queryParamNames
      .filter(param => queryParams[param])
      .map(param => `${param}=${encodeURIComponent(queryParams[param])}`)
      .join('&');
    if (queryString) {
      url += '?' + queryString;
    }
    return url;
  };

  const executeRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    const url = baseUrl + buildUrl();

    try {
      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || '';
      let data;
      let text = null;
      if (contentType.includes('json')) {
        data = await res.json();
      } else if (contentType.startsWith('text/') || contentType.includes('fasta')) {
        // FASTA, Newick, plain-text and TSV endpoints
        text = await res.text();
      } else {
        const blob = await res.blob();
        text = `Binary file (${contentType || 'unknown type'}, ${blob.size} bytes). `
          + 'Use the cURL, Python or R snippet, or open the example link, to download it.';
      }
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
        text,
      });
      setActiveTab('response');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate code snippets
  const fullUrl = baseUrl + buildUrl();

  const curlSnippet = `curl -X GET "${fullUrl}"`;

  const pythonSnippet = `import requests

url = "${fullUrl}"
response = requests.get(url)
data = response.json()
print(data)`;

  const rSnippet = `library(httr)
library(jsonlite)

url <- "${fullUrl}"
response <- GET(url)
data <- fromJSON(content(response, "text"))
print(data)`;

  return (
    <div className="api-playground">
      <div className="playground-header">
        <h4>API Playground</h4>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="playground-content">
        {/* Path Parameters */}
        {pathParamNames.length > 0 && (
          <div className="param-section">
            <h5>Path Parameters</h5>
            {pathParamNames.map(param => (
              <div key={param} className="param-input">
                <label>{param}</label>
                <input
                  type="text"
                  placeholder={`Enter ${param}`}
                  value={pathParams[param] || ''}
                  onChange={(e) => setPathParams({...pathParams, [param]: e.target.value})}
                />
              </div>
            ))}
          </div>
        )}

        {/* Query Parameters */}
        {queryParamNames.length > 0 && (
          <div className="param-section">
            <h5>Query Parameters</h5>
            {queryParamNames.map(param => (
              <div key={param} className="param-input">
                <label>{param}</label>
                <input
                  type="text"
                  placeholder={`Enter ${param}`}
                  value={queryParams[param] || ''}
                  onChange={(e) => setQueryParams({...queryParams, [param]: e.target.value})}
                />
              </div>
            ))}
          </div>
        )}

        {/* URL Preview */}
        <div className="url-preview">
          <strong>Request URL:</strong>
          <code>{fullUrl}</code>
        </div>

        {/* Execute Button */}
        <button
          className="execute-btn"
          onClick={executeRequest}
          disabled={loading || missingPathParams.length > 0}
          title={missingPathParams.length > 0 ? `Enter ${missingPathParams.join(', ')}` : undefined}
        >
          {loading ? 'Loading...' : 'Execute'}
        </button>
        {missingPathParams.length > 0 && (
          <span className="missing-params">Enter {missingPathParams.join(', ')} to run this request</span>
        )}

        {/* Tabs */}
        <div className="playground-tabs">
          <button
            className={`tab-btn ${activeTab === 'response' ? 'active' : ''}`}
            onClick={() => setActiveTab('response')}
          >
            Response
          </button>
          <button
            className={`tab-btn ${activeTab === 'curl' ? 'active' : ''}`}
            onClick={() => setActiveTab('curl')}
          >
            cURL
          </button>
          <button
            className={`tab-btn ${activeTab === 'python' ? 'active' : ''}`}
            onClick={() => setActiveTab('python')}
          >
            Python
          </button>
          <button
            className={`tab-btn ${activeTab === 'r' ? 'active' : ''}`}
            onClick={() => setActiveTab('r')}
          >
            R
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'response' && (
            <div className="response-panel">
              {error && <div className="error-msg">Error: {error}</div>}
              {response && (
                <>
                  <div className={`status-badge ${response.status < 400 ? 'success' : 'error'}`}>
                    {response.status} {response.statusText}
                  </div>
                  <pre className="json-response">
                    {response.text !== null
                      ? response.text.slice(0, TEXT_PREVIEW_CHARS)
                        + (response.text.length > TEXT_PREVIEW_CHARS ? '\n…' : '')
                      : JSON.stringify(response.data, null, 2)}
                  </pre>
                </>
              )}
              {!response && !error && !loading && (
                <div className="placeholder">Click "Execute" to send the request</div>
              )}
            </div>
          )}
          {activeTab === 'curl' && (
            <div className="code-panel">
              <button className="copy-btn" onClick={() => navigator.clipboard.writeText(curlSnippet)}>
                Copy
              </button>
              <pre>{curlSnippet}</pre>
            </div>
          )}
          {activeTab === 'python' && (
            <div className="code-panel">
              <button className="copy-btn" onClick={() => navigator.clipboard.writeText(pythonSnippet)}>
                Copy
              </button>
              <pre>{pythonSnippet}</pre>
            </div>
          )}
          {activeTab === 'r' && (
            <div className="code-panel">
              <button className="copy-btn" onClick={() => navigator.clipboard.writeText(rSnippet)}>
                Copy
              </button>
              <pre>{rSnippet}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ApiDocPage = () => {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [activePlayground, setActivePlayground] = useState(null);

  // Get base URL from environment or use default
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend.dev.candidagenome.org';

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const openPlayground = (endpoint, groupIndex, endpointIndex) => {
    setActivePlayground({ endpoint, key: `${groupIndex}-${endpointIndex}` });
  };

  const closePlayground = () => {
    setActivePlayground(null);
  };

  const apiGroups = [
    {
      name: 'Locus',
      description: 'Gene/locus information and annotations',
      endpoints: [
        { method: 'GET', path: '/api/locus/{name}', description: 'Get basic locus info (aliases, external links)', example: '/api/locus/ACT1' },
        { method: 'GET', path: '/api/locus/{name}/go_details', description: 'Get GO annotations for a locus', example: '/api/locus/ACT1/go_details' },
        { method: 'GET', path: '/api/locus/{name}/phenotype_details', description: 'Get phenotype annotations', example: '/api/locus/ACT1/phenotype_details' },
        { method: 'GET', path: '/api/locus/{name}/interaction_details', description: 'Get physical and genetic interactions (curated, STRING and inferred)', example: '/api/locus/ACT1/interaction_details' },
        { method: 'GET', path: '/api/locus/{name}/interaction_network', description: 'Get the interaction network around a gene', params: 'depth, include_string, string_score', example: '/api/locus/ACT1/interaction_network?depth=1' },
        { method: 'GET', path: '/api/locus/{name}/network_enrichment', description: 'Get GO enrichment of a gene\'s interaction network', params: 'include_string, p_value_cutoff', example: '/api/locus/ACT1/network_enrichment' },
        { method: 'GET', path: '/api/locus/{name}/string_enrichment', description: 'Get STRING functional enrichment for a gene\'s network', params: 'string_score', example: '/api/locus/ACT1/string_enrichment' },
        { method: 'GET', path: '/api/locus/{name}/regulation_details', description: 'Get transcriptional regulators and targets (PathoYeastract and CGD curation)', example: '/api/locus/EFG1/regulation_details' },
        { method: 'GET', path: '/api/locus/{name}/expression_details', description: 'Get RNA-seq expression data for a locus', example: '/api/locus/ACT1/expression_details' },
        { method: 'GET', path: '/api/locus/{name}/protein_details', description: 'Get protein information', example: '/api/locus/ACT1/protein_details' },
        { method: 'GET', path: '/api/locus/{name}/protein_properties', description: 'Get protein physico-chemical properties', example: '/api/locus/ACT1/protein_properties' },
        { method: 'GET', path: '/api/locus/{name}/domain_details', description: 'Get protein domain/motif details', example: '/api/locus/ACT1/domain_details' },
        { method: 'GET', path: '/api/locus/{name}/homology_details', description: 'Get homology/orthologs', example: '/api/locus/ACT1/homology_details' },
        { method: 'GET', path: '/api/locus/{name}/ortholog_organisms', description: 'Get the organisms in which a gene has orthologs', example: '/api/locus/ACT1/ortholog_organisms' },
        { method: 'GET', path: '/api/locus/{name}/synteny', description: 'Get the syntenic neighborhood of a gene across species', params: 'flanking_count', example: '/api/locus/ACT1/synteny?flanking_count=5' },
        { method: 'GET', path: '/api/locus/{name}/sequence_details', description: 'Get sequence and location info', example: '/api/locus/ACT1/sequence_details' },
        { method: 'GET', path: '/api/locus/{name}/references', description: 'Get references for a locus', example: '/api/locus/ACT1/references' },
        { method: 'GET', path: '/api/locus/{name}/summary_notes', description: 'Get summary notes/paragraphs', example: '/api/locus/ACT1/summary_notes' },
        { method: 'GET', path: '/api/locus/{name}/history', description: 'Get locus history', example: '/api/locus/ACT1/history' },
      ]
    },
    {
      name: 'Gene Ontology (GO)',
      description: 'GO terms, evidence codes, and hierarchy',
      endpoints: [
        { method: 'GET', path: '/api/go/{goid}', description: 'Get GO term info and annotations by GOID', example: '/api/go/GO:0005634' },
        { method: 'GET', path: '/api/go/{goid}/genes', description: 'Get genes annotated to a GO term in one organism (organism_no from /api/organisms)', params: 'organism_no, include_descendants, include_computational', example: '/api/go/GO:0005634/genes?organism_no=3' },
        { method: 'GET', path: '/api/go/evidence', description: 'Get all GO evidence codes with definitions', example: '/api/go/evidence' },
        { method: 'GET', path: '/api/go/{goid}/hierarchy', description: 'Get GO term hierarchy for visualization', params: 'max_nodes', example: '/api/go/GO:0005634/hierarchy?max_nodes=30' },
      ]
    },
    {
      name: 'Phenotype',
      description: 'Phenotype search and observable terms',
      endpoints: [
        { method: 'GET', path: '/api/phenotype/search', description: 'Search phenotypes by criteria', params: 'observable, qualifier, experiment_type, mutant_type, page, limit', example: '/api/phenotype/search?observable=hyphal%20growth&page=1&limit=25' },
        { method: 'GET', path: '/api/phenotype/search/summary', description: 'Summarize phenotype annotations matching a search', params: 'query', example: '/api/phenotype/search/summary?query=hyphal' },
        { method: 'GET', path: '/api/phenotype/observables', description: 'Get hierarchical tree of observable CV terms', example: '/api/phenotype/observables' },
        { method: 'GET', path: '/api/phenotype/observables/genes', description: 'Get genes with a phenotype observable in one organism', params: 'term, organism_no, include_descendants, qualifier, include_normal', example: '/api/phenotype/observables/genes?term=hyphal%20growth&organism_no=3' },
      ]
    },
    {
      name: 'Phenotype Enrichment',
      description: 'Phenotype enrichment analysis for a gene list',
      endpoints: [
        { method: 'GET', path: '/api/phenotype-enrichment/config', description: 'Get configuration (organisms, options)', example: '/api/phenotype-enrichment/config' },
        { method: 'POST', path: '/api/phenotype-enrichment/validate-genes', description: 'Validate a list of genes' },
        { method: 'POST', path: '/api/phenotype-enrichment/analyze', description: 'Run phenotype enrichment analysis' },
        { method: 'POST', path: '/api/phenotype-enrichment/download/{format}', description: 'Download results (tsv/csv)' },
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
        { method: 'GET', path: '/api/reference/{id}/interaction_details', description: 'Get interactions citing this reference', example: '/api/reference/31283755/interaction_details' },
        { method: 'GET', path: '/api/reference/{id}/regulation_details', description: 'Get regulatory associations reported by this reference (PathoYeastract and CGD curation)', example: '/api/reference/39078139/regulation_details' },
        { method: 'GET', path: '/api/reference/{id}/literature_topics', description: 'Get literature topics for this reference', example: '/api/reference/40323423/literature_topics' },
        { method: 'GET', path: '/api/reference/search/author', description: 'Search references by author name', params: 'author', example: '/api/reference/search/author?author=Smith' },
        { method: 'GET', path: '/api/reference/new-papers-this-week', description: 'Get new papers added this week', params: 'days', example: '/api/reference/new-papers-this-week?days=7' },
        { method: 'GET', path: '/api/reference/genome-wide-analysis', description: 'Get genome-wide analysis papers', params: 'topic, page, page_size', example: '/api/reference/genome-wide-analysis?page=1&page_size=50' },
        { method: 'GET', path: '/api/reference/disease-related', description: 'Get disease-related papers', params: 'topic, page, page_size', example: '/api/reference/disease-related?page=1&page_size=50' },
        { method: 'GET', path: '/api/reference/datasets', description: 'Get papers with datasets archived at CGD', example: '/api/reference/datasets' },
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
      name: 'Expression',
      description: 'RNA-seq expression data',
      endpoints: [
        { method: 'GET', path: '/api/expression/config', description: 'Get expression configuration (organisms, studies)', example: '/api/expression/config' },
        { method: 'GET', path: '/api/expression/gene/{gene_name}', description: 'Get expression data for a gene', params: 'organism', example: '/api/expression/gene/ACT1?organism=C_albicans_SC5314' },
        { method: 'GET', path: '/api/expression/gene/{gene_name}/similar', description: 'Find genes with similar expression profiles', params: 'organism, limit, metric, min_conditions, direction', example: '/api/expression/gene/ACT1/similar?organism=C_albicans_SC5314&limit=10' },
        { method: 'POST', path: '/api/expression/batch', description: 'Get expression data for multiple genes' },
        { method: 'POST', path: '/api/expression/matrix/download', description: 'Download an expression matrix (TSV)' },
      ]
    },
    {
      name: 'Sequence Tools',
      description: 'Gene/sequence retrieval and analysis',
      endpoints: [
        { method: 'GET', path: '/api/seq-tools/assemblies', description: 'Get list of available assemblies', example: '/api/seq-tools/assemblies' },
        { method: 'GET', path: '/api/seq-tools/chromosomes', description: 'Get list of chromosomes for an assembly', params: 'seq_source', example: '/api/seq-tools/chromosomes?seq_source=C_albicans_SC5314_A22' },
        { method: 'GET', path: '/api/seq-tools/resolve', description: 'Resolve gene/coordinates/sequence and get available tools', params: 'locus, seq_source, chr, beg, end, seq, seq_type, flankl, flankr, rev', example: '/api/seq-tools/resolve?locus=ACT1' },
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
        { method: 'GET', path: '/api/blast/programs/{database}', description: 'Get programs compatible with a database (database names from /api/blast/databases)', example: '/api/blast/programs/default_genomic_C_albicans_SC5314_A22' },
        { method: 'GET', path: '/api/blast/organisms', description: 'Get organisms with BLAST databases', example: '/api/blast/organisms' },
        { method: 'GET', path: '/api/blast/genetic-codes', description: 'Get genetic codes for translated searches', example: '/api/blast/genetic-codes' },
        { method: 'GET', path: '/api/blast/search', description: 'Run a BLAST search (GET)', params: 'seq, locus, program, db, evalue, hits, word, filter, matrix, strand', example: '/api/blast/search?locus=ACT1&program=blastp&db=default_protein_C_albicans_SC5314_A22' },
        { method: 'POST', path: '/api/blast/search', description: 'Run a BLAST search' },
        { method: 'POST', path: '/api/blast/search/multi', description: 'Run a BLAST search against several databases' },
        { method: 'POST', path: '/api/blast/search/text', description: 'Run BLAST and get results as plain text' },
        { method: 'POST', path: '/api/blast/search/download/{format}', description: 'Download BLAST results' },
      ]
    },
    {
      name: 'PatMatch',
      description: 'Pattern matching search',
      endpoints: [
        { method: 'GET', path: '/api/patmatch/config', description: 'Get pattern match configuration (datasets, limits)', example: '/api/patmatch/config' },
        { method: 'GET', path: '/api/patmatch/datasets', description: 'Get list of available datasets', params: 'pattern_type', example: '/api/patmatch/datasets?pattern_type=dna' },
        { method: 'GET', path: '/api/patmatch/search', description: 'Run a pattern match search (GET)', params: 'pattern, type, ds, strand, mm, ins, del, max', example: '/api/patmatch/search?pattern=GATAAG&type=dna&ds=C_albicans_SC5314_A22_chromosomes&max=20' },
        { method: 'POST', path: '/api/patmatch/search', description: 'Run a pattern match search' },
        { method: 'POST', path: '/api/patmatch/download', description: 'Download pattern match results' },
      ]
    },
    {
      name: 'CRISPR Guide Design',
      description: 'CRISPR guide RNA design',
      endpoints: [
        { method: 'GET', path: '/api/crispr/config', description: 'Get CRISPR design configuration', example: '/api/crispr/config' },
        { method: 'GET', path: '/api/crispr/organisms', description: 'Get organisms/assemblies available for guide design', example: '/api/crispr/organisms' },
        { method: 'GET', path: '/api/crispr/pam-options', description: 'Get supported PAM sequences', example: '/api/crispr/pam-options' },
        { method: 'GET', path: '/api/crispr/gene/{gene_name}', description: 'Get gene sequence and coordinates for guide design', params: 'organism', example: '/api/crispr/gene/ACT1?organism=C_albicans_SC5314_A22' },
        { method: 'GET', path: '/api/crispr/design', description: 'Design guides for a gene or sequence (GET)', params: 'gene, seq, organism, pam, guide_length, target_region, max_guides', example: '/api/crispr/design?gene=ACT1&organism=C_albicans_SC5314_A22&max_guides=5' },
        { method: 'POST', path: '/api/crispr/design', description: 'Design guides for a gene or sequence' },
        { method: 'POST', path: '/api/crispr/download/{format}', description: 'Download designed guides' },
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
      description: 'Orthologs, homology clusters, alignments and trees',
      endpoints: [
        { method: 'GET', path: '/api/orthologs/targets', description: 'Get the organisms a gene list can be converted to', example: '/api/orthologs/targets' },
        { method: 'POST', path: '/api/orthologs/convert', description: 'Convert a gene list to orthologs in another organism' },
        { method: 'POST', path: '/api/orthologs/convert/ids-only', description: 'Convert a gene list and return just the ortholog IDs', params: 'include_missing' },
        { method: 'POST', path: '/api/orthologs/convert/download', description: 'Download an ortholog conversion (CSV/TSV)', params: 'format' },
        { method: 'GET', path: '/api/homolog-sequences', description: 'Download a homology cluster\'s sequences (type: protein, cds, genomic or genomic_extended)', params: 'cluster, type', format: 'FASTA', example: '/api/homolog-sequences?cluster=C1_13700W_A&type=protein' },
        { method: 'GET', path: '/api/homology/alignment/{dbid}/{alignment_type}/fasta', description: 'Download a cluster alignment (alignment_type: protein or coding; dbid from /api/locus/{name}/homology_details)', format: 'FASTA', example: '/api/homology/alignment/CAL0000191211/protein/fasta' },
        { method: 'GET', path: '/api/homology/alignment/{dbid}/{alignment_type}/clustalw', description: 'Download a cluster alignment in ClustalW format, where available', format: 'ClustalW' },
        { method: 'GET', path: '/api/homology/tree/{dbid}/{tree_type}', description: 'Download a cluster\'s phylogenetic tree', format: 'Newick', example: '/api/homology/tree/CAL0000191211/unrooted' },
      ]
    },
    {
      name: 'Synteny',
      description: 'Cross-species gene order',
      endpoints: [
        { method: 'GET', path: '/api/synteny/chromosomes', description: 'Get chromosomes available in the synteny browser', example: '/api/synteny/chromosomes' },
        { method: 'GET', path: '/api/synteny/chromosome/{name}', description: 'Get the genes in a chromosome window', params: 'window_start, window_end', example: '/api/synteny/chromosome/Ca20chr1?window_start=1&window_end=50000' },
        { method: 'GET', path: '/api/synteny/resolve', description: 'Resolve a gene to its synteny browser location', params: 'gene, sgdid, source', example: '/api/synteny/resolve?gene=ACT1' },
      ]
    },
    {
      name: 'Sequence',
      description: 'Sequence retrieval',
      endpoints: [
        { method: 'GET', path: '/api/sequence', description: 'Get the sequence of a gene', params: 'locus, gene, orf, seq, seqname, sgdid, seqtype, format, flankl, flankr, rev', format: 'FASTA', example: '/api/sequence?locus=ACT1&seqtype=protein' },
        { method: 'GET', path: '/api/sequence/region', description: 'Get sequence for a genomic region', params: 'chr, start, end, strand, format, rev', format: 'FASTA', example: '/api/sequence/region?chr=Ca22chr1A_C_albicans_SC5314&start=1&end=1000' },
        { method: 'GET', path: '/api/sequence/fasta/{identifier}', description: 'Get FASTA sequence for a gene', params: 'type, flankl, flankr', format: 'FASTA', example: '/api/sequence/fasta/ACT1' },
      ]
    },
    {
      name: 'Genome Version',
      description: 'Genome assembly version history',
      endpoints: [
        { method: 'GET', path: '/api/genome-version/config', description: 'Get genome version configuration', example: '/api/genome-version/config' },
        { method: 'GET', path: '/api/genome-version/history', description: 'Get version history for a genome', params: 'seq_source, page, page_size, version_type', example: '/api/genome-version/history?seq_source=C_albicans_SC5314' },
        { method: 'GET', path: '/api/genome-version/history/{seq_source}', description: 'Get version history for a specific genome', params: 'page, page_size, version_type', example: '/api/genome-version/history/C_albicans_SC5314' },
      ]
    },
    {
      name: 'Genome Snapshot',
      description: 'Genome statistics and overview',
      endpoints: [
        { method: 'GET', path: '/api/genome-snapshot/organisms', description: 'Get list of organisms with snapshots', example: '/api/genome-snapshot/organisms' },
        { method: 'GET', path: '/api/genome-snapshot/{organism_abbrev}', description: 'Get genome snapshot for an organism', example: '/api/genome-snapshot/C_albicans_SC5314' },
        { method: 'GET', path: '/api/genome-snapshot/{organism_abbrev}/go-slim', description: 'Get GO Slim data for genome snapshot', example: '/api/genome-snapshot/C_albicans_SC5314/go-slim' },
        { method: 'GET', path: '/api/genome-snapshot/{organism_abbrev}/chromosome-inventory', description: 'Get feature counts per chromosome', example: '/api/genome-snapshot/C_albicans_SC5314/chromosome-inventory' },
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
        { method: 'GET', path: '/api/batch-download', description: 'Download data for a gene list (comma-separated genes)', params: 'genes, types, flankl, flankr, compress, format', format: 'file (gzip by default)', example: '/api/batch-download?genes=ACT1&types=protein' },
        { method: 'GET', path: '/api/batch-download/types', description: 'Get available download types', example: '/api/batch-download/types' },
        { method: 'GET', path: '/api/batch-download/metadata', description: 'Get what a batch download would contain', params: 'genes, types, flankl, flankr, compress', example: '/api/batch-download/metadata?genes=ACT1,EFG1' },
        { method: 'POST', path: '/api/batch-download', description: 'Request a batch download' },
        { method: 'POST', path: '/api/batch-download/metadata', description: 'Get what a batch download would contain' },
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
        { method: 'POST', path: '/api/restriction-mapper/download/no-cut', description: 'Download the enzymes that do not cut' },
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
        { method: 'GET', path: '/api/literature-topic/tree', description: 'Get literature topic hierarchy tree (topic IDs are the cv_term_no values)', example: '/api/literature-topic/tree' },
        { method: 'GET', path: '/api/literature-topic/search', description: 'Search literature by topic IDs (comma-separated cv_term_no values)', params: 'topics', example: '/api/literature-topic/search?topics=625304' },
        { method: 'POST', path: '/api/literature-topic/search', description: 'Search literature by topic (POST)' },
      ]
    },
    {
      name: 'Virulence',
      description: 'Virulence factor catalog',
      endpoints: [
        { method: 'GET', path: '/api/virulence/categories', description: 'Get virulence factor categories', params: 'organism', example: '/api/virulence/categories' },
        { method: 'GET', path: '/api/virulence/factors', description: 'Search virulence factors', params: 'categories, organisms, search_term, page, page_size, max_evidence_tier, min_confidence_score, hide_housekeeping, sort_by, sort_order, evidence_types, min_paper_count, max_paper_count', example: '/api/virulence/factors?search_term=ALS3&page=1&page_size=20' },
        { method: 'GET', path: '/api/virulence/factors/{gene_name}', description: 'Get details for one virulence factor', example: '/api/virulence/factors/ALS3' },
        { method: 'GET', path: '/api/virulence/stats', description: 'Get virulence catalog statistics (slow: can take about a minute)', example: '/api/virulence/stats' },
        { method: 'POST', path: '/api/virulence/factors/download', description: 'Download virulence factors' },
      ]
    },
    {
      name: 'Gene Registry',
      description: 'Gene name registration',
      endpoints: [
        { method: 'GET', path: '/api/gene-registry/config', description: 'Get gene registry configuration', example: '/api/gene-registry/config' },
        { method: 'GET', path: '/api/gene-registry/search', description: 'Check a proposed gene name before registering it', params: 'last_name, gene_name, orf_name, organism', example: '/api/gene-registry/search?last_name=Smith&gene_name=ABC1&organism=C_albicans_SC5314' },
        { method: 'POST', path: '/api/gene-registry/submit', description: 'Submit a gene name registration request' },
      ]
    },
    {
      name: 'Statistics & Organisms',
      description: 'Database statistics, organisms and service status',
      endpoints: [
        { method: 'GET', path: '/api/organisms', description: 'Get organisms in CGD (with organism_no values used by other endpoints)', example: '/api/organisms' },
        { method: 'GET', path: '/api/stats/summary', description: 'Get database summary statistics', params: 'refresh', example: '/api/stats/summary' },
        { method: 'GET', path: '/api/stats/counts-by-organism', description: 'Get annotation counts by organism', params: 'refresh', example: '/api/stats/counts-by-organism' },
        { method: 'GET', path: '/api/stats/recent-activity', description: 'Get recent curation activity', params: 'days', example: '/api/stats/recent-activity?days=30' },
        { method: 'GET', path: '/api/stats/recent-ortholog-clusters', description: 'Get recently updated ortholog clusters', params: 'days, page, limit, query', example: '/api/stats/recent-ortholog-clusters?days=30&page=1&limit=20' },
        { method: 'GET', path: '/api/gene-of-the-day', description: 'Get the gene of the day', example: '/api/gene-of-the-day' },
        { method: 'GET', path: '/api/health', description: 'Check that the API is up', example: '/api/health' },
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
            <strong>Response Format:</strong> All endpoints return JSON unless a response format is listed.
          </p>
          <p>
            <strong>Try it out:</strong> Click the "Try it" button on any GET endpoint to test it interactively;
            it opens with the example values filled in.
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
                        {endpoint.method === 'GET' && (
                          <button
                            className="try-it-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPlayground(endpoint, groupIndex, endpointIndex);
                            }}
                          >
                            Try it
                          </button>
                        )}
                      </div>
                      <p className="endpoint-description">{endpoint.description}</p>
                      {endpoint.params && (
                        <div className="endpoint-params">
                          <strong>Parameters:</strong> <code>{endpoint.params}</code>
                        </div>
                      )}
                      {endpoint.format && (
                        <div className="endpoint-params">
                          <strong>Response:</strong> {endpoint.format}
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

                      {/* Show playground inline when active */}
                      {activePlayground?.key === `${groupIndex}-${endpointIndex}` && (
                        <ApiPlayground
                          endpoint={endpoint}
                          baseUrl={API_BASE_URL}
                          onClose={closePlayground}
                        />
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
            <li>All endpoints are read-only, except the gene registry submission</li>
            <li>Endpoints return JSON unless a response format (e.g. FASTA) is listed</li>
            <li>Click on example URLs to test them in your browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiDocPage;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useReferenceData from '../hooks/useReferenceData';
import referenceApi from '../api/referenceApi';
import { formatCitationString, CitationLinksBelow, renderCitationItem } from '../utils/formatCitation.jsx';
import './ReferencePage.css';

const GENES_PER_TABLE = 10;
const ROWS_PER_PAGE = 10;

// Citation links (from ref_url) that point at the paper's data files
const DATA_LINK_NAMES = ['Reference Data', 'Download Datasets', 'Reference Supplement'];
const DATA_LINK_DESCRIPTIONS = {
  'Reference Data': 'Datasets from this paper archived at CGD',
  'Download Datasets': 'Datasets from this paper archived at CGD',
  'Reference Supplement': 'Supplementary material published with the paper',
};

const EVIDENCE_LABELS = { Direct: 'DNA binding', Indirect: 'Expression' };
const CONDITION_MAX_CHARS = 80;
const EFFECT_LABELS = { Positive: 'activation', Negative: 'repression' };

// Gene link for an interaction/regulation participant; unresolved names are plain text
const renderGeneLink = (gene) => (
  gene.feature_name
    ? <Link to={`/locus/${gene.feature_name}`}>{gene.gene_name || gene.feature_name.replace(/_[A-Z]$/, '')}</Link>
    : gene.display_name
);

// Download data as TSV file
const downloadAsTsv = (data, headers, filename) => {
  const headerRow = headers.join('\t');
  const dataRows = data.map(row => row.join('\t')).join('\n');
  const tsvContent = `${headerRow}\n${dataRows}`;

  const blob = new Blob([tsvContent], { type: 'text/tab-separated-values' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Get display name for a gene - use gene_name if available, otherwise strip _A suffix from feature_name
const getGeneDisplayName = (feature) => {
  if (feature.gene_name) {
    return feature.gene_name;
  }
  // Strip _A, _B etc. suffix from feature_name (e.g., "C3_06760W_A" -> "C3_06760W")
  return feature.feature_name.replace(/_[A-Z]$/, '');
};

// Abbreviate organism name (e.g., "Candida albicans SC5314" -> "C. albicans")
const getOrganismAbbrev = (organismName) => {
  if (!organismName) return '';
  // Split into words, take first letter of genus + species name
  const parts = organismName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}. ${parts[1]}`;
  }
  return organismName;
};

function ReferencePage() {
  const { id } = useParams();
  const { data, loading, errors, loaders } = useReferenceData(id);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [searchType, setSearchType] = useState('CGD');
  const [selectedJumpLabel, setSelectedJumpLabel] = useState('');
  const [authorSearchResults, setAuthorSearchResults] = useState(null);
  const [authorSearchLoading, setAuthorSearchLoading] = useState(false);
  const [authorSearchError, setAuthorSearchError] = useState(null);
  const [goPage, setGoPage] = useState(1);
  const [phenotypePage, setPhenotypePage] = useState(1);
  const [interactionPage, setInteractionPage] = useState(1);
  const [regulationPage, setRegulationPage] = useState(1);
  const [regulationEvidence, setRegulationEvidence] = useState('');

  // Reset pagination when reference changes
  useEffect(() => {
    setGoPage(1);
    setPhenotypePage(1);
    setInteractionPage(1);
    setRegulationPage(1);
    setRegulationEvidence('');
  }, [id]);

  // Load literature topics and every annotation type on mount
  useEffect(() => {
    if (loaders.loadLiteratureTopics) {
      loaders.loadLiteratureTopics();
    }
    if (loaders.loadGoDetails) {
      loaders.loadGoDetails();
    }
    if (loaders.loadPhenotypeDetails) {
      loaders.loadPhenotypeDetails();
    }
    if (loaders.loadInteractionDetails) {
      loaders.loadInteractionDetails();
    }
    if (loaders.loadRegulationDetails) {
      loaders.loadRegulationDetails();
    }
  }, [loaders]);

  const handleAuthorSearch = async (e) => {
    e.preventDefault();
    if (!selectedAuthor) return;

    const lastName = selectedAuthor.split(' ')[0];

    switch (searchType) {
      case 'CGD':
        // Search CGD database via API - use full author name
        setAuthorSearchLoading(true);
        setAuthorSearchError(null);
        try {
          const results = await referenceApi.searchByAuthor(selectedAuthor);
          setAuthorSearchResults(results);
        } catch (error) {
          setAuthorSearchError(error.response?.data?.detail || error.message);
          setAuthorSearchResults(null);
        } finally {
          setAuthorSearchLoading(false);
        }
        break;
      case 'PubMed':
        window.open(`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(selectedAuthor)}`, '_blank');
        break;
      case 'Google Scholar':
        window.open(`https://scholar.google.com/scholar?q=author:${encodeURIComponent(lastName)}`, '_blank');
        break;
      default:
        break;
    }
  };

  const handleJumpChange = (e) => {
    const label = e.target.value;
    setSelectedJumpLabel(label);
    if (label) {
      const element = document.getElementById(label);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Render citation section
  const renderCitation = () => {
    if (loading.info) return <div className="loading">Loading reference information...</div>;
    if (errors.info) return <div className="error">Error: {errors.info}</div>;
    if (!data.info || !data.info.result) return <div className="no-data">No reference data available</div>;

    const ref = data.info.result;

    // Use links from API response (includes CGD Paper, PubMed, Full Text, Reference Data, etc.)
    const links = ref.links || [];

    return (
      <div className="citation-section">
        <div className="citation-text">
          {ref.citation ? (
            formatCitationString(ref.citation, ref.journal_name)
          ) : (
            <>
              <strong>{ref.authors?.map(a => a.author_name).join(', ')}</strong>
              {ref.year && ` (${ref.year})`}
              {ref.title && ` ${ref.title}`}
              {ref.journal_name && <> <em>{ref.journal_name}</em></>}
              {ref.volume && ` ${ref.volume}`}
              {ref.issue && `(${ref.issue})`}
              {ref.page && `:${ref.page}`}
            </>
          )}
          {ref.pubmed && <span className="citation-pmid"> PMID: {ref.pubmed}</span>}
        </div>
        <CitationLinksBelow links={links} />
      </div>
    );
  };

  // Render abstract section
  const renderAbstract = () => {
    if (!data.info?.result?.abstract) return null;

    return (
      <div className="section" id="abstract">
        <h2 className="section-header">Abstract</h2>
        <div className="section-content">
          <p className="abstract-text">{data.info.result.abstract}</p>
        </div>
      </div>
    );
  };

  // Data files linked to the paper (archived datasets, supplements)
  const getDataLinks = () => (data.info?.result?.links || []).filter(l => DATA_LINK_NAMES.includes(l.name));

  // Render the paper's downloadable data files
  const renderDataSection = () => {
    const dataLinks = getDataLinks();
    if (dataLinks.length === 0) return null;

    return (
      <div className="section" id="data-downloads">
        <h2 className="section-header">Data &amp; Downloads</h2>
        <div className="section-content">
          <ul className="data-links-list">
            {dataLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
                {DATA_LINK_DESCRIPTIONS[link.name] && (
                  <span className="data-link-description"> &ndash; {DATA_LINK_DESCRIPTIONS[link.name]}</span>
                )}
              </li>
            ))}
          </ul>
          <p className="data-links-note">
            Annotations made from this paper can be downloaded from each annotation section below.
          </p>
        </div>
      </div>
    );
  };

  // Generate batch labels for jump navigation
  const generateBatchLabels = (features) => {
    const labels = [];
    for (let i = 0; i < features.length; i += GENES_PER_TABLE) {
      const endIdx = Math.min(i + GENES_PER_TABLE - 1, features.length - 1);
      const startNum = i + 1;
      const endNum = endIdx + 1;
      const startGene = getGeneDisplayName(features[i]);
      const endGene = getGeneDisplayName(features[endIdx]);
      const label = `#${startNum}-${endNum}(${startGene}-${endGene})`;
      labels.push({
        id: label,
        startIdx: i,
        endIdx: endIdx,
        displayLabel: `#${startNum}-${endNum}`,
        geneRange: `(${startGene}-${endGene})`
      });
    }
    return labels;
  };

  // Render a single gene-topic matrix table
  const renderGeneTable = (features, topics, topicFeatureMap, nonGeneTopics, label, showNonGene = false) => {
    const allTopics = [...topics.filter(t => t.features.length > 0), ...nonGeneTopics];

    return (
      <div key={label} id={label} className="gene-table-section">
        {label && (
          <h3 className="table-label">Genes linked to topics {label}</h3>
        )}
        <div className="topic-matrix-wrapper">
          <table className="topic-matrix">
            <thead>
              <tr>
                <th className="topic-header">Topic</th>
                {showNonGene && nonGeneTopics.length > 0 && (
                  <th className="non-gene-header">Topics not linked to Genes</th>
                )}
                {features.map((feature, idx) => (
                  <th key={idx} className="gene-header">
                    <Link to={`/locus/${feature.feature_name}`}>
                      {getGeneDisplayName(feature)}
                    </Link>
                    <br />
                    <span className="organism-label">
                      (<em>{getOrganismAbbrev(feature.organism_name)}</em>)
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allTopics.map((topic, tIdx) => {
                const isNonGene = topic.features.length === 0;
                // Only show row if it has at least one marker in this table
                const hasMarkerInTable = features.some(f =>
                  topicFeatureMap[topic.topic]?.has(f.feature_no)
                ) || (showNonGene && isNonGene);

                if (!hasMarkerInTable) return null;

                return (
                  <tr key={tIdx}>
                    <td className="topic-name">{topic.topic}</td>
                    {showNonGene && nonGeneTopics.length > 0 && (
                      <td className="topic-cell non-gene-cell">
                        {isNonGene && (
                          <span className="topic-marker non-gene-marker" title={topic.topic}>●</span>
                        )}
                      </td>
                    )}
                    {features.map((feature, fIdx) => (
                      <td key={fIdx} className="topic-cell">
                        {topicFeatureMap[topic.topic]?.has(feature.feature_no) && (
                          <span className="topic-marker gene-marker" title={`${topic.topic} - ${getGeneDisplayName(feature)}`}>
                            ●
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render the note explaining the colored balls. The gene-specific items
  // (blue marker and "click on the gene name") are hidden when the paper has
  // no genes, since there are no blue markers or gene names to explain.
  const renderNote = (showGeneItems = true) => (
    <div className="topics-note">
      <ul>
        {showGeneItems && (
          <li>
            <span className="topic-marker gene-marker">●</span> displays other papers with information about that topic for that gene.
          </li>
        )}
        <li>
          <span className="topic-marker non-gene-marker">●</span> displays other papers in CGD that are associated with that topic.
          The topic is addressed in these papers but does not describe a specific gene or chromosomal feature.
        </li>
        {showGeneItems && (
          <li>To go to the Locus page for a gene, click on the gene name.</li>
        )}
      </ul>
    </div>
  );

  // Render jump dropdown for >20 genes
  const renderJumpDropdown = (batchLabels) => (
    <div className="jump-dropdown-container">
      <strong>Jump to Summary Chart for: </strong>
      <select
        value={selectedJumpLabel}
        onChange={handleJumpChange}
        className="jump-select"
      >
        <option value="">-- Select --</option>
        {batchLabels.map((batch) => (
          <option key={batch.id} value={batch.id}>
            {batch.displayLabel}{batch.geneRange}
          </option>
        ))}
      </select>
    </div>
  );

  // Render jump links for 10-20 genes
  const renderJumpLinks = (batchLabels) => (
    <div className="jump-links-container">
      <strong>Jump to Summary Chart for: </strong>
      {batchLabels.map((batch, idx) => (
        <span key={batch.id}>
          {idx > 0 && ' | '}
          <a href={`#${batch.id}`}>{batch.displayLabel}</a>
          {' '}{batch.geneRange}
        </span>
      ))}
    </div>
  );

  // Render topics/gene matrix section
  const renderTopicsSection = () => {
    if (loading.literatureTopics) {
      return (
        <div className="section" id="summary">
          <h2 className="section-header">Topics addressed in this paper</h2>
          <div className="section-content">
            <div className="loading">Loading topics...</div>
          </div>
        </div>
      );
    }

    if (errors.literatureTopics || !data.literatureTopics) {
      return null;
    }

    const { topics, all_features } = data.literatureTopics;

    if (topics.length === 0 && all_features.length === 0) {
      return null;
    }

    // Build a lookup for quick checking: topic -> Set of feature_nos
    const topicFeatureMap = {};
    topics.forEach(t => {
      topicFeatureMap[t.topic] = new Set(t.features.map(f => f.feature_no));
    });

    const geneLinkedTopics = topics.filter(t => t.features.length > 0);
    const nonGeneTopics = topics.filter(t => t.features.length === 0);
    const numGenes = all_features.length;

    // Generate batch labels if needed
    const batchLabels = numGenes > GENES_PER_TABLE ? generateBatchLabels(all_features) : [];

    return (
      <div className="section" id="summary">
        <h2 className="section-header">Topics addressed in this paper</h2>
        <div className="section-content">

          {/* Gene count and jump navigation for many genes */}
          {numGenes > GENES_PER_TABLE && (
            <div className="gene-count-header">
              <p className="gene-count-message">
                There are <span className="gene-count-number">{numGenes}</span> different genes addressed in this paper.
              </p>
              {numGenes > 20 ? renderJumpDropdown(batchLabels) : renderJumpLinks(batchLabels)}
              <div className="divider" />
            </div>
          )}

          {/* Render note */}
          {(geneLinkedTopics.length > 0 || nonGeneTopics.length > 0) && renderNote(numGenes > 0)}

          {/* Render tables based on number of genes */}
          {numGenes > GENES_PER_TABLE ? (
            // Multiple tables for many genes
            <>
              {batchLabels.map((batch, batchIdx) => {
                const batchFeatures = all_features.slice(batch.startIdx, batch.endIdx + 1);
                return (
                  <div key={batch.id}>
                    {renderGeneTable(
                      batchFeatures,
                      topics,
                      topicFeatureMap,
                      nonGeneTopics,
                      batch.id,
                      batchIdx === 0 // Show non-gene column only in first table
                    )}
                    {batchIdx < batchLabels.length - 1 && (
                      <>
                        {renderNote()}
                        {numGenes > 20 && batchIdx % 3 === 2 && renderJumpDropdown(batchLabels)}
                      </>
                    )}
                  </div>
                );
              })}
              {/* Repeat jump navigation at bottom */}
              <div className="jump-footer">
                {numGenes > 20 ? renderJumpDropdown(batchLabels) : renderJumpLinks(batchLabels)}
              </div>
            </>
          ) : numGenes > 0 ? (
            // Single table for few genes
            renderGeneTable(all_features, topics, topicFeatureMap, nonGeneTopics, '', true)
          ) : (
            // No genes: render the same matrix (Topic + "Topics not linked
            // to Genes" green dots) used when genes are present, instead of a
            // plain comma-separated line, so these topics are less likely to
            // be missed.
            topics.length > 0 &&
              renderGeneTable(all_features, topics, topicFeatureMap, nonGeneTopics, '', true)
          )}

          {/* Gene count summary at bottom for small tables */}
          {numGenes > 0 && numGenes <= GENES_PER_TABLE && (
            <p className="gene-count">
              There {numGenes === 1 ? 'is' : 'are'}{' '}
              <strong>{numGenes}</strong> gene{numGenes !== 1 ? 's' : ''} addressed in this paper.
            </p>
          )}
        </div>
      </div>
    );
  };

  // Aspect labels for GO annotations
  const ASPECT_LABELS = {
    'F': 'Molecular Function',
    'P': 'Biological Process',
    'C': 'Cellular Component',
  };

  // Render pagination controls
  const renderPagination = (currentPage, totalPages, onPageChange, totalItems, itemName) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * ROWS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ROWS_PER_PAGE, totalItems);

    return (
      <div className="pagination-controls">
        <span className="pagination-info">
          Showing {startItem}-{endItem} of {totalItems} {itemName}
        </span>
        <div className="pagination-buttons">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="pagination-btn"
            title="First page"
          >
            &laquo;
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-page">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
            title="Last page"
          >
            &raquo;
          </button>
        </div>
      </div>
    );
  };

  // Render GO annotations section
  const renderGoSection = () => {
    if (loading.goDetails) {
      return (
        <div className="section" id="go-annotations">
          <h2 className="section-header">GO Annotations</h2>
          <div className="section-content">
            <div className="loading">Loading GO annotations...</div>
          </div>
        </div>
      );
    }

    if (errors.goDetails || !data.goDetails) {
      return null;
    }

    const { annotations } = data.goDetails;

    if (!annotations || annotations.length === 0) {
      return null;
    }

    const totalPages = Math.ceil(annotations.length / ROWS_PER_PAGE);
    const startIdx = (goPage - 1) * ROWS_PER_PAGE;
    const endIdx = startIdx + ROWS_PER_PAGE;
    const paginatedAnnotations = annotations.slice(startIdx, endIdx);

    // Group paginated annotations by aspect
    const groupedByAspect = {};
    paginatedAnnotations.forEach(ann => {
      const aspect = ann.go_aspect || 'P';
      if (!groupedByAspect[aspect]) {
        groupedByAspect[aspect] = [];
      }
      groupedByAspect[aspect].push(ann);
    });

    // Download handler for GO annotations
    const handleGoDownload = () => {
      const headers = ['Gene', 'Gene Name', 'Organism', 'GO Aspect', 'GO Term', 'GO ID', 'Evidence'];
      const rows = annotations.map(ann => [
        ann.feature_name,
        ann.gene_name || '',
        ann.organism_name,
        ASPECT_LABELS[ann.go_aspect] || ann.go_aspect,
        ann.go_term,
        ann.goid,
        ann.evidence,
      ]);
      downloadAsTsv(rows, headers, `go_annotations_${id}.tsv`);
    };

    return (
      <div className="section" id="go-annotations">
        <h2 className="section-header">GO Annotations</h2>
        <div className="section-content">
          <div className="annotation-header-row">
            <p className="annotation-intro">
              This reference has been used to make <strong>{annotations.length}</strong> GO annotation{annotations.length !== 1 ? 's' : ''}.
            </p>
            <button onClick={handleGoDownload} className="download-btn" title="Download GO annotations as TSV">
              Download
            </button>
          </div>

          {annotations.length > ROWS_PER_PAGE && renderPagination(goPage, totalPages, setGoPage, annotations.length, 'annotations')}

          {['F', 'P', 'C'].map(aspect => {
            const aspectAnnotations = groupedByAspect[aspect];
            if (!aspectAnnotations || aspectAnnotations.length === 0) return null;

            return (
              <div key={aspect} className="annotation-aspect-section">
                <h4 className="aspect-header">
                  {ASPECT_LABELS[aspect]}
                  <span className="count-badge">{aspectAnnotations.length}</span>
                </h4>
                <table className="data-table annotation-table">
                  <thead>
                    <tr>
                      <th>Gene</th>
                      <th>GO Term</th>
                      <th>GO ID</th>
                      <th>Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aspectAnnotations.map((ann, idx) => (
                      <tr key={idx}>
                        <td>
                          <Link to={`/locus/${ann.feature_name}`}>
                            {ann.gene_name || ann.feature_name.replace(/_[A-Z]$/, '')}
                          </Link>
                          <br />
                          <span className="organism-label">
                            (<em>{getOrganismAbbrev(ann.organism_name)}</em>)
                          </span>
                        </td>
                        <td>
                          <Link to={`/go/${ann.goid}`}>{ann.go_term}</Link>
                        </td>
                        <td>
                          <Link to={`/go/${ann.goid}`}>{ann.goid}</Link>
                        </td>
                        <td>{ann.evidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}

          {annotations.length > ROWS_PER_PAGE && renderPagination(goPage, totalPages, setGoPage, annotations.length, 'annotations')}
        </div>
      </div>
    );
  };

  // Render phenotype annotations section
  const renderPhenotypeSection = () => {
    if (loading.phenotypeDetails) {
      return (
        <div className="section" id="phenotype-annotations">
          <h2 className="section-header">Phenotype Annotations</h2>
          <div className="section-content">
            <div className="loading">Loading phenotype annotations...</div>
          </div>
        </div>
      );
    }

    if (errors.phenotypeDetails || !data.phenotypeDetails) {
      return null;
    }

    const { annotations } = data.phenotypeDetails;

    if (!annotations || annotations.length === 0) {
      return null;
    }

    const totalPages = Math.ceil(annotations.length / ROWS_PER_PAGE);
    const startIdx = (phenotypePage - 1) * ROWS_PER_PAGE;
    const endIdx = startIdx + ROWS_PER_PAGE;
    const paginatedAnnotations = annotations.slice(startIdx, endIdx);

    // Download handler for phenotype annotations
    const handlePhenotypeDownload = () => {
      const headers = ['Gene', 'Gene Name', 'Organism', 'Phenotype', 'Qualifier', 'Experiment Type', 'Mutant Type'];
      const rows = annotations.map(ann => [
        ann.feature_name,
        ann.gene_name || '',
        ann.organism_name,
        ann.observable,
        ann.qualifier || '',
        ann.experiment_type,
        ann.mutant_type,
      ]);
      downloadAsTsv(rows, headers, `phenotype_annotations_${id}.tsv`);
    };

    return (
      <div className="section" id="phenotype-annotations">
        <h2 className="section-header">Phenotype Annotations</h2>
        <div className="section-content">
          <div className="annotation-header-row">
            <p className="annotation-intro">
              This reference has been used to make <strong>{annotations.length}</strong> phenotype annotation{annotations.length !== 1 ? 's' : ''}.
            </p>
            <button onClick={handlePhenotypeDownload} className="download-btn" title="Download phenotype annotations as TSV">
              Download
            </button>
          </div>

          {annotations.length > ROWS_PER_PAGE && renderPagination(phenotypePage, totalPages, setPhenotypePage, annotations.length, 'annotations')}

          <table className="data-table annotation-table">
            <thead>
              <tr>
                <th>Gene</th>
                <th>Phenotype</th>
                <th>Experiment Type</th>
                <th>Mutant Type</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAnnotations.map((ann, idx) => (
                <tr key={idx}>
                  <td>
                    <Link to={`/locus/${ann.feature_name}`}>
                      {ann.gene_name || ann.feature_name.replace(/_[A-Z]$/, '')}
                    </Link>
                    <br />
                    <span className="organism-label">
                      (<em>{getOrganismAbbrev(ann.organism_name)}</em>)
                    </span>
                  </td>
                  <td>
                    <Link to={`/phenotype/search?observable=${encodeURIComponent(ann.observable)}`}>
                      {ann.observable}
                    </Link>
                    {ann.qualifier && `: ${ann.qualifier}`}
                  </td>
                  <td>{ann.experiment_type}</td>
                  <td>{ann.mutant_type}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {annotations.length > ROWS_PER_PAGE && renderPagination(phenotypePage, totalPages, setPhenotypePage, annotations.length, 'annotations')}
        </div>
      </div>
    );
  };

  // Render interactions section
  const renderInteractionSection = () => {
    if (loading.interactionDetails) {
      return (
        <div className="section" id="interactions">
          <h2 className="section-header">Interactions</h2>
          <div className="section-content">
            <div className="loading">Loading interactions...</div>
          </div>
        </div>
      );
    }

    const interactions = data.interactionDetails?.interactions;
    if (errors.interactionDetails || !interactions || interactions.length === 0) {
      return null;
    }

    // Physical-interaction papers have no phenotypes; drop the empty column
    const hasPhenotypes = interactions.some(i => i.phenotypes.length > 0);
    const totalPages = Math.ceil(interactions.length / ROWS_PER_PAGE);
    const startIdx = (interactionPage - 1) * ROWS_PER_PAGE;
    const paginatedInteractions = interactions.slice(startIdx, startIdx + ROWS_PER_PAGE);

    const handleInteractionDownload = () => {
      const headers = ['Interactors', 'Interactor Gene Names', 'Actions', 'Organism', 'Experiment Type',
        'Phenotype', 'Description', 'Source'];
      const rows = interactions.map(i => [
        i.interactors.map(x => x.feature_name).join('|'),
        i.interactors.map(x => x.gene_name || '').join('|'),
        i.interactors.map(x => x.action || '').join('|'),
        i.organism_name || '',
        i.experiment_type,
        i.phenotypes.join('|'),
        i.description || '',
        i.source || '',
      ]);
      downloadAsTsv(rows, headers, `interactions_${id}.tsv`);
    };

    return (
      <div className="section" id="interactions">
        <h2 className="section-header">Interactions</h2>
        <div className="section-content">
          <div className="annotation-header-row">
            <p className="annotation-intro">
              This reference has been used to make <strong>{interactions.length}</strong> interaction annotation{interactions.length !== 1 ? 's' : ''}.
            </p>
            <button onClick={handleInteractionDownload} className="download-btn" title="Download interactions as TSV">
              Download
            </button>
          </div>

          {interactions.length > ROWS_PER_PAGE && renderPagination(interactionPage, totalPages, setInteractionPage, interactions.length, 'interactions')}

          <table className="data-table annotation-table">
            <thead>
              <tr>
                <th>Interactors</th>
                <th>Experiment Type</th>
                {hasPhenotypes && <th>Phenotype</th>}
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInteractions.map(interaction => (
                <tr key={interaction.interaction_no}>
                  <td>
                    {interaction.interactors.map((x, idx) => (
                      <span key={idx}>
                        {idx > 0 && <br />}
                        {renderGeneLink(x)}
                        {x.action && <span className="interactor-action"> ({x.action})</span>}
                      </span>
                    ))}
                    {interaction.organism_name && (
                      <>
                        <br />
                        <span className="organism-label">
                          (<em>{getOrganismAbbrev(interaction.organism_name)}</em>)
                        </span>
                      </>
                    )}
                  </td>
                  <td>
                    {interaction.experiment_type}
                    {interaction.description && <div className="ref-note">{interaction.description}</div>}
                  </td>
                  {hasPhenotypes && <td>{interaction.phenotypes.join('; ')}</td>}
                  <td>{interaction.source}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {interactions.length > ROWS_PER_PAGE && renderPagination(interactionPage, totalPages, setInteractionPage, interactions.length, 'interactions')}
        </div>
      </div>
    );
  };

  // Render regulation section
  const renderRegulationSection = () => {
    if (loading.regulationDetails) {
      return (
        <div className="section" id="regulation">
          <h2 className="section-header">Regulation</h2>
          <div className="section-content">
            <div className="loading">Loading regulation...</div>
          </div>
        </div>
      );
    }

    const allRegulations = data.regulationDetails?.regulations;
    if (errors.regulationDetails || !allRegulations || allRegulations.length === 0) {
      return null;
    }

    const regulations = regulationEvidence
      ? allRegulations.filter(r => r.evidence_code === regulationEvidence)
      : allRegulations;
    const bindingCount = allRegulations.filter(r => r.evidence_code === 'Direct').length;
    const expressionCount = allRegulations.filter(r => r.evidence_code === 'Indirect').length;
    const regulatorCount = new Set(allRegulations.map(r => r.regulator.feature_name || r.regulator.name)).size;
    const targetCount = new Set(allRegulations.map(r => r.target.feature_name || r.target.name)).size;
    const release = data.regulationDetails.pathoyeastract_release;

    const totalPages = Math.ceil(regulations.length / ROWS_PER_PAGE);
    const startIdx = (regulationPage - 1) * ROWS_PER_PAGE;
    const paginatedRegulations = regulations.slice(startIdx, startIdx + ROWS_PER_PAGE);

    const handleRegulationDownload = () => {
      const headers = ['Regulator', 'Regulator Gene Name', 'Target', 'Target Gene Name', 'Organism', 'Evidence',
        'Experiment', 'Effect', 'Mutant Type', 'Strain', 'Environmental Condition', 'Log2FC', 'Source', 'Note'];
      const rows = regulations.map(r => [
        r.regulator.feature_name || r.regulator.name,
        r.regulator.gene_name || '',
        r.target.feature_name || r.target.name,
        r.target.gene_name || '',
        r.organism_name,
        EVIDENCE_LABELS[r.evidence_code] || r.evidence_code || '',
        r.experiment || '',
        EFFECT_LABELS[r.association_type] || '',
        r.mutant_type || '',
        r.strain || '',
        r.environmental_condition || '',
        r.log2fc ?? '',
        r.source,
        r.note || '',
      ]);
      downloadAsTsv(rows, headers, `regulation_${id}.tsv`);
    };

    return (
      <div className="section" id="regulation">
        <h2 className="section-header">Regulation</h2>
        <div className="section-content">
          <div className="annotation-header-row">
            <p className="annotation-intro">
              This paper reports <strong>{allRegulations.length}</strong> transcriptional regulatory
              association{allRegulations.length !== 1 ? 's' : ''} (<strong>{bindingCount}</strong> with DNA binding
              evidence, <strong>{expressionCount}</strong> from expression) between{' '}
              <strong>{regulatorCount}</strong> regulator{regulatorCount !== 1 ? 's' : ''} and{' '}
              <strong>{targetCount}</strong> target gene{targetCount !== 1 ? 's' : ''}.
            </p>
            <button onClick={handleRegulationDownload} className="download-btn" title="Download regulation as TSV">
              Download
            </button>
          </div>
          {release && (
            <p className="ref-note">
              Includes associations from{' '}
              <a href="https://yeastract-plus.org/pathoyeastract/" target="_blank" rel="noopener noreferrer">PathoYeastract</a>{' '}
              (release {release}).
            </p>
          )}

          {bindingCount > 0 && expressionCount > 0 && (
            <div className="regulation-filter">
              <label>
                Evidence:{' '}
                <select
                  value={regulationEvidence}
                  onChange={(e) => {
                    setRegulationEvidence(e.target.value);
                    setRegulationPage(1);
                  }}
                >
                  <option value="">All ({allRegulations.length})</option>
                  <option value="Direct">DNA binding ({bindingCount})</option>
                  <option value="Indirect">Expression ({expressionCount})</option>
                </select>
              </label>
            </div>
          )}

          {regulations.length > ROWS_PER_PAGE && renderPagination(regulationPage, totalPages, setRegulationPage, regulations.length, 'associations')}

          <table className="data-table annotation-table regulation-table">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>Regulator</th>
                <th style={{ width: '11%' }}>Target</th>
                <th style={{ width: '17%' }}>Evidence</th>
                <th style={{ width: '11%' }}>Effect</th>
                <th style={{ width: '36%' }}>Details</th>
                <th style={{ width: '13%' }}>Source</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRegulations.map((r, idx) => (
                <tr key={startIdx + idx}>
                  <td>
                    {renderGeneLink(r.regulator)}
                    <br />
                    <span className="organism-label">
                      (<em>{getOrganismAbbrev(r.organism_name)}</em>)
                    </span>
                  </td>
                  <td>{renderGeneLink(r.target)}</td>
                  <td>
                    {EVIDENCE_LABELS[r.evidence_code] || r.evidence_code}
                    {r.experiment && <div className="ref-note">{r.experiment}</div>}
                  </td>
                  <td className="nowrap-cell">
                    {r.association_type === 'Positive' && <span className="effect-up">&#9650; activation</span>}
                    {r.association_type === 'Negative' && <span className="effect-down">&#9660; repression</span>}
                  </td>
                  <td className="ref-note">
                    {[
                      r.mutant_type && `mutant: ${r.mutant_type}`,
                      r.strain && `strain: ${r.strain}`,
                      r.log2fc != null && `log2FC ${r.log2fc.toFixed(2)}`,
                      r.note,
                    ].filter(Boolean).join('; ')}
                    {r.environmental_condition && (
                      <div title={r.environmental_condition}>
                        {r.environmental_condition.length > CONDITION_MAX_CHARS
                          ? `${r.environmental_condition.slice(0, CONDITION_MAX_CHARS)}…`
                          : r.environmental_condition}
                      </div>
                    )}
                  </td>
                  <td>{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {regulations.length > ROWS_PER_PAGE && renderPagination(regulationPage, totalPages, setRegulationPage, regulations.length, 'associations')}
        </div>
      </div>
    );
  };

  // Render author search section
  // Highlight author name in author list
  const highlightAuthor = (authorList, searchQuery) => {
    if (!searchQuery) return authorList;
    const query = searchQuery.replace(/[*%]/g, '');
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = authorList.split(regex);
    return parts.map((part, idx) =>
      regex.test(part) ? <mark key={idx} className="author-highlight">{part}</mark> : part
    );
  };

  // Render author search results
  const renderAuthorSearchResults = () => {
    if (authorSearchLoading) {
      return <div className="loading">Searching...</div>;
    }

    if (authorSearchError) {
      return <div className="error">Error: {authorSearchError}</div>;
    }

    if (!authorSearchResults) {
      return null;
    }

    const { author_query, author_count, reference_count, references } = authorSearchResults;

    return (
      <div className="author-search-results">
        <p className="search-results-summary">
          There are <span className="highlight-count">{author_count}</span> authors associated with{' '}
          <span className="highlight-count">{reference_count}</span> papers found for author like{' '}
          <span className="highlight-count">{author_query}</span> in database
        </p>

        {references.length > 0 && (
          <table className="author-results-table">
            <thead>
              <tr>
                <th>Author(s)</th>
                <th>Citation</th>
              </tr>
            </thead>
            <tbody>
              {references.map((ref, idx) => (
                <tr key={ref.reference_no} className={idx % 2 === 0 ? '' : 'alt-row'}>
                  <td className="authors-cell">
                    {highlightAuthor(ref.author_list, author_query)}
                  </td>
                  <td className="citation-cell">
                    {renderCitationItem(ref)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const renderAuthorSearch = () => {
    if (!data.info?.result?.authors || data.info.result.authors.length === 0) {
      return null;
    }

    const authors = data.info.result.authors;

    // Set default author if not set
    if (!selectedAuthor && authors.length > 0) {
      setSelectedAuthor(authors[0].author_name);
    }

    return (
      <div className="section" id="author">
        <h2 className="section-header">Author Searches</h2>
        <div className="section-content author-search-content">
          <p>
            To find contact information or other publications by the authors of this paper,
            follow these three steps:
          </p>
          <form onSubmit={handleAuthorSearch} className="author-search-form">
            <div className="search-step">
              <label>(1) Choose an author:</label>
              <select
                value={selectedAuthor}
                onChange={(e) => {
                  setSelectedAuthor(e.target.value);
                  setAuthorSearchResults(null); // Clear previous results
                }}
                className="author-select"
              >
                {authors.map((author, idx) => (
                  <option key={idx} value={author.author_name}>
                    {author.author_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="search-step">
              <label>(2) Choose a search parameter:</label>
              <select
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value);
                  setAuthorSearchResults(null); // Clear previous results
                }}
                className="search-type-select"
              >
                <option value="CGD">Papers in CGD</option>
                <option value="PubMed">PubMed</option>
                <option value="Google Scholar">Google Scholar</option>
              </select>
            </div>
            <div className="search-step">
              <label>(3) Click to implement:</label>
              <button type="submit" className="search-button" disabled={authorSearchLoading}>
                {authorSearchLoading ? 'Searching...' : 'Search!'}
              </button>
            </div>
          </form>

          {renderAuthorSearchResults()}
        </div>
      </div>
    );
  };

  // Page navigation links
  const renderPageNav = () => {
    const links = [];

    if (data.info?.result?.abstract) {
      links.push({ id: 'abstract', label: 'Abstract' });
    }

    if (data.literatureTopics?.all_features?.length > 0 || data.literatureTopics?.topics?.length > 0) {
      links.push({ id: 'summary', label: 'Summary Chart' });
    }

    if (getDataLinks().length > 0) {
      links.push({ id: 'data-downloads', label: 'Data & Downloads' });
    }

    if (data.goDetails?.annotations?.length > 0) {
      links.push({ id: 'go-annotations', label: 'GO Annotations' });
    }

    if (data.phenotypeDetails?.annotations?.length > 0) {
      links.push({ id: 'phenotype-annotations', label: 'Phenotype Annotations' });
    }

    if (data.interactionDetails?.interactions?.length > 0) {
      links.push({ id: 'interactions', label: 'Interactions' });
    }

    if (data.regulationDetails?.regulations?.length > 0) {
      links.push({ id: 'regulation', label: 'Regulation' });
    }

    if (data.info?.result?.authors?.length > 0) {
      links.push({ id: 'author', label: 'Author Search' });
    }

    if (links.length === 0) return null;

    return (
      <nav className="page-nav">
        {links.map((link, idx) => (
          <span key={link.id}>
            {idx > 0 && ' | '}
            <a href={`#${link.id}`}>{link.label}</a>
          </span>
        ))}
      </nav>
    );
  };

  // Get display title for the page
  const getDisplayTitle = () => {
    if (data.info && data.info.result) {
      return 'CGD Paper';
    }
    return `Reference: ${id}`;
  };

  return (
    <div className="reference-page">
      <header className="reference-header">
        <h1>{getDisplayTitle()}</h1>
      </header>

      {renderPageNav()}

      <div className="divider" />

      {renderCitation()}

      {renderAbstract()}
      {data.info?.result?.abstract && renderPageNav()}

      {renderTopicsSection()}
      {(data.literatureTopics?.all_features?.length > 0 || data.literatureTopics?.topics?.length > 0) && renderPageNav()}

      {renderDataSection()}
      {getDataLinks().length > 0 && renderPageNav()}

      {renderGoSection()}
      {data.goDetails?.annotations?.length > 0 && renderPageNav()}

      {renderPhenotypeSection()}
      {data.phenotypeDetails?.annotations?.length > 0 && renderPageNav()}

      {renderInteractionSection()}
      {data.interactionDetails?.interactions?.length > 0 && renderPageNav()}

      {renderRegulationSection()}
      {data.regulationDetails?.regulations?.length > 0 && renderPageNav()}

      {renderAuthorSearch()}

      <div className="divider" />

      {renderPageNav()}
    </div>
  );
}

export default ReferencePage;

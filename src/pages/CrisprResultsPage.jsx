import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import crisprApi from '../api/crisprApi';
import './CrisprResultsPage.css';

function CrisprResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [params, setParams] = useState(null);
  const [expandedGuides, setExpandedGuides] = useState(new Set());
  const [sortField, setSortField] = useState('rank');
  const [sortDirection, setSortDirection] = useState('asc');
  const [downloading, setDownloading] = useState(null);

  // Load results from session storage
  useEffect(() => {
    const storedResults = sessionStorage.getItem('crisprResults');
    const storedParams = sessionStorage.getItem('crisprParams');

    if (storedResults) {
      const parsed = JSON.parse(storedResults);
      setResults(parsed);
    }
    if (storedParams) {
      setParams(JSON.parse(storedParams));
    }
  }, []);

  // Toggle guide expansion
  const toggleGuide = (rank) => {
    const newExpanded = new Set(expandedGuides);
    if (newExpanded.has(rank)) {
      newExpanded.delete(rank);
    } else {
      newExpanded.add(rank);
    }
    setExpandedGuides(newExpanded);
  };

  // Expand/collapse all
  const expandAll = () => {
    if (results?.guides) {
      setExpandedGuides(new Set(results.guides.map(g => g.rank)));
    }
  };

  const collapseAll = () => {
    setExpandedGuides(new Set());
  };

  // Sort guides
  const sortedGuides = React.useMemo(() => {
    if (!results?.guides) return [];

    return [...results.guides].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [results?.guides, sortField, sortDirection]);

  // Handle sort click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'rank' ? 'asc' : 'desc');
    }
  };

  // Get score color class
  const getScoreClass = (score) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-moderate';
    return 'score-poor';
  };

  // Check if guide is recommended (high specificity + decent efficiency)
  const isRecommended = (guide) => {
    return guide.specificity_score >= 100 && guide.efficiency_score >= 50;
  };

  // Format mismatch positions for display
  const formatMismatchPositions = (positions) => {
    if (!positions || positions.length === 0) return '-';
    return positions.map(p => p + 1).join(', '); // Convert to 1-based
  };

  // Copy to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log(`Copied ${label}`);
    });
  };

  // Download results
  const handleDownload = async (format) => {
    if (!results) return;

    setDownloading(format);
    try {
      const downloadParams = {
        guides: results.guides,
        gene_info: results.gene_info,
        format,
        include_primers: true,
        include_offtargets: false,
      };

      const response = await crisprApi.download(format, downloadParams);
      const blob = response.data;

      // Get filename from Content-Disposition or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `crispr_guides.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=([^;]+)/);
        if (match) {
          filename = match[1].replace(/"/g, '');
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download results. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  // Go back to search
  const goToSearch = () => {
    navigate('/crispr');
  };

  if (!results) {
    return (
      <div className="crispr-results-page">
        <div className="crispr-content">
          <h1>CRISPR Guide Results</h1>
          <hr />
          <div className="no-results">
            <p>No CRISPR results available.</p>
            <button onClick={goToSearch} className="back-button">
              Design New Guides
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="crispr-results-page">
      <div className="crispr-content">
        <h1>CRISPR Guide Results</h1>
        <hr />

        {/* Summary Section */}
        <div className="results-summary">
          <div className="summary-grid">
            {results.gene_info && (
              <>
                <div className="summary-item">
                  <span className="label">Gene:</span>
                  <span className="value">
                    <strong>{results.gene_info.gene_name || results.gene_info.feature_name}</strong>
                    {results.gene_info.gene_name && (
                      <span className="secondary"> ({results.gene_info.feature_name})</span>
                    )}
                  </span>
                </div>
                {results.gene_info.description && (
                  <div className="summary-item full-width">
                    <span className="label">Description:</span>
                    <span className="value">{results.gene_info.description}</span>
                  </div>
                )}
              </>
            )}
            <div className="summary-item">
              <span className="label">Organism:</span>
              <span className="value">{results.organism}</span>
            </div>
            <div className="summary-item">
              <span className="label">PAM:</span>
              <span className="value">{results.pam}</span>
            </div>
            <div className="summary-item">
              <span className="label">Guide Length:</span>
              <span className="value">{results.guide_length} bp</span>
            </div>
            <div className="summary-item">
              <span className="label">Target Length:</span>
              <span className="value">{results.target_length} bp</span>
            </div>
            <div className="summary-item">
              <span className="label">Guides Found:</span>
              <span className="value">
                <strong>{results.guides.length}</strong>
                {results.total_guides_found > results.guides.length && (
                  <span className="secondary"> (of {results.total_guides_found} total)</span>
                )}
              </span>
            </div>
          </div>

          {/* Links */}
          {results.gene_info && (
            <div className="summary-links">
              {results.gene_info.cgd_url && (
                <Link to={results.gene_info.cgd_url} className="link-button">
                  View in CGD
                </Link>
              )}
              {results.gene_info.jbrowse_url && (
                <a href={results.gene_info.jbrowse_url} target="_blank" rel="noopener noreferrer" className="link-button">
                  View in JBrowse
                </a>
              )}
            </div>
          )}
        </div>

        {/* Warnings */}
        {results.warnings && results.warnings.length > 0 && (
          <div className="warnings-section">
            {results.warnings.map((warning, i) => (
              <div key={i} className="warning-item">
                {warning}
              </div>
            ))}
          </div>
        )}

        {/* Actions Bar */}
        {results.guides.length > 0 && (
          <div className="actions-bar">
            <div className="action-group">
              <button onClick={goToSearch} className="action-button secondary">
                New Search
              </button>
            </div>
            <div className="action-group">
              <button onClick={expandAll} className="action-button small">
                Expand All
              </button>
              <button onClick={collapseAll} className="action-button small">
                Collapse All
              </button>
            </div>
            <div className="action-group">
              <span className="action-label">Download:</span>
              <button
                onClick={() => handleDownload('tsv')}
                className="action-button small"
                disabled={downloading === 'tsv'}
              >
                {downloading === 'tsv' ? 'Downloading...' : 'TSV'}
              </button>
              <button
                onClick={() => handleDownload('csv')}
                className="action-button small"
                disabled={downloading === 'csv'}
              >
                {downloading === 'csv' ? 'Downloading...' : 'CSV'}
              </button>
              <button
                onClick={() => handleDownload('fasta')}
                className="action-button small"
                disabled={downloading === 'fasta'}
              >
                {downloading === 'fasta' ? 'Downloading...' : 'FASTA'}
              </button>
            </div>
          </div>
        )}

        {/* Results Table */}
        {results.guides.length > 0 ? (
          <div className="guides-table-container">
            <table className="guides-table">
              <thead>
                <tr>
                  <th className="col-expand"></th>
                  <th className={`col-rank sortable ${sortField === 'rank' ? 'sorted' : ''}`} onClick={() => handleSort('rank')}>
                    Rank {sortField === 'rank' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="col-sequence">Guide Sequence</th>
                  <th className="col-pam">PAM</th>
                  <th className="col-position">Position</th>
                  <th className={`col-score sortable ${sortField === 'efficiency_score' ? 'sorted' : ''}`} onClick={() => handleSort('efficiency_score')}>
                    Efficiency {sortField === 'efficiency_score' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className={`col-score sortable ${sortField === 'specificity_score' ? 'sorted' : ''}`} onClick={() => handleSort('specificity_score')}>
                    Specificity {sortField === 'specificity_score' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className={`col-gc sortable ${sortField === 'gc_content' ? 'sorted' : ''}`} onClick={() => handleSort('gc_content')}>
                    GC% {sortField === 'gc_content' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="col-flags">Flags</th>
                </tr>
              </thead>
              <tbody>
                {sortedGuides.map((guide) => (
                  <React.Fragment key={guide.rank}>
                    <tr
                      className={`guide-row ${expandedGuides.has(guide.rank) ? 'expanded' : ''}`}
                      onClick={() => toggleGuide(guide.rank)}
                    >
                      <td className="col-expand">
                        <span className="expand-icon">{expandedGuides.has(guide.rank) ? '▼' : '▶'}</span>
                      </td>
                      <td className="col-rank">
                        {guide.rank}
                        {isRecommended(guide) && (
                          <span className="recommended-badge" title="High specificity, good efficiency">★</span>
                        )}
                      </td>
                      <td className="col-sequence">
                        <code className="sequence">{guide.sequence}</code>
                      </td>
                      <td className="col-pam">
                        <code className="pam">{guide.pam}</code>
                      </td>
                      <td className="col-position">
                        {guide.position} ({guide.strand})
                      </td>
                      <td className="col-score">
                        <span className={`score-badge ${getScoreClass(guide.efficiency_score)}`}>
                          {guide.efficiency_score.toFixed(0)}
                        </span>
                      </td>
                      <td className="col-score">
                        <span className={`score-badge ${getScoreClass(guide.specificity_score)}`}>
                          {guide.specificity_score.toFixed(0)}
                        </span>
                      </td>
                      <td className="col-gc">{guide.gc_content.toFixed(0)}%</td>
                      <td className="col-flags">
                        {isRecommended(guide) && (
                          <span className="flag flag-recommended" title="Recommended: High specificity, good efficiency">
                            Recommended
                          </span>
                        )}
                        {guide.has_poly_t && <span className="flag flag-warning" title="Contains TTTT - may cause Pol III termination">T4</span>}
                        {guide.restriction_sites.length > 0 && (
                          <span className="flag flag-info" title={guide.restriction_sites.map(r => r.enzyme).join(', ')}>
                            RE
                          </span>
                        )}
                        {guide.offtarget_count > 0 && (
                          <span className="flag flag-warning" title={`${guide.offtarget_count} off-target sites found`}>
                            OT:{guide.offtarget_count}
                          </span>
                        )}
                      </td>
                    </tr>
                    {expandedGuides.has(guide.rank) && (
                      <tr className="guide-details-row">
                        <td colSpan="9">
                          <div className="guide-details">
                            <div className="detail-grid">
                              <div className="detail-section">
                                <h4>Target Site</h4>
                                <div className="detail-item">
                                  <span className="detail-label">Full Target:</span>
                                  <code className="detail-value">{guide.full_target}</code>
                                  <button
                                    className="copy-btn"
                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(guide.full_target, 'target'); }}
                                  >
                                    Copy
                                  </button>
                                </div>
                                {guide.genomic_start && (
                                  <div className="detail-item">
                                    <span className="detail-label">Genomic Position:</span>
                                    <span className="detail-value">
                                      {guide.chromosome}:{guide.genomic_start}-{guide.genomic_end}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="detail-section">
                                <h4>Scores</h4>
                                <div className="scores-grid">
                                  <div className="score-item">
                                    <span className="score-label">Efficiency:</span>
                                    <span className={`score-value ${getScoreClass(guide.efficiency_score)}`}>
                                      {guide.efficiency_score.toFixed(1)}
                                    </span>
                                  </div>
                                  <div className="score-item">
                                    <span className="score-label">Specificity:</span>
                                    <span className={`score-value ${getScoreClass(guide.specificity_score)}`}>
                                      {guide.specificity_score.toFixed(1)}
                                    </span>
                                  </div>
                                  <div className="score-item">
                                    <span className="score-label">Combined:</span>
                                    <span className={`score-value ${getScoreClass(guide.combined_score)}`}>
                                      {guide.combined_score.toFixed(1)}
                                    </span>
                                  </div>
                                  <div className="score-item">
                                    <span className="score-label">GC Content:</span>
                                    <span className="score-value">{guide.gc_content.toFixed(1)}%</span>
                                  </div>
                                </div>
                                <div className="score-methodology">
                                  Efficiency: Rule Set 2 (Doench 2016), adapted for yeast.
                                  Specificity: 100 = no off-targets; lower = more off-target risk.
                                </div>
                              </div>

                              {guide.primers && (
                                <div className="detail-section">
                                  <h4>Cloning Primers ({guide.primers.vector_system})</h4>
                                  <div className="primer-list">
                                    <div className="primer-item">
                                      <span className="primer-label">Forward:</span>
                                      <code className="primer-seq">{guide.primers.forward}</code>
                                      <button
                                        className="copy-btn"
                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(guide.primers.forward, 'forward primer'); }}
                                      >
                                        Copy
                                      </button>
                                    </div>
                                    <div className="primer-item">
                                      <span className="primer-label">Reverse:</span>
                                      <code className="primer-seq">{guide.primers.reverse}</code>
                                      <button
                                        className="copy-btn"
                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(guide.primers.reverse, 'reverse primer'); }}
                                      >
                                        Copy
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {guide.restriction_sites.length > 0 && (
                                <div className="detail-section">
                                  <h4>Restriction Sites</h4>
                                  <div className="restriction-sites">
                                    {guide.restriction_sites.map((site, i) => (
                                      <span key={i} className="restriction-site">
                                        {site.enzyme} ({site.sequence}) at position {site.position}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {guide.offtarget_count > 0 && (
                                <div className="detail-section full-width">
                                  <h4>Off-targets ({guide.offtarget_count} found)</h4>
                                  <div className="offtarget-summary">
                                    <span className="ot-count">0mm: {guide.offtarget_0mm}</span>
                                    <span className="ot-count">1mm: {guide.offtarget_1mm}</span>
                                    <span className="ot-count">2mm: {guide.offtarget_2mm}</span>
                                    <span className="ot-count">3mm: {guide.offtarget_3mm}</span>
                                  </div>
                                  {guide.offtargets && guide.offtargets.length > 0 && (
                                    <table className="offtarget-table">
                                      <thead>
                                        <tr>
                                          <th>Location</th>
                                          <th>Gene</th>
                                          <th>Region</th>
                                          <th>Mismatches</th>
                                          <th>Positions</th>
                                          <th>Sequence</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {guide.offtargets.map((ot, idx) => (
                                          <tr key={idx} className={ot.mismatches === 0 ? 'ot-exact' : ''}>
                                            <td className="ot-location">
                                              {ot.chromosome}:{ot.position} ({ot.strand})
                                            </td>
                                            <td className="ot-gene">
                                              {ot.gene_name ? (
                                                <Link to={`/locus/${ot.gene_name}`}>{ot.gene_name}</Link>
                                              ) : (
                                                <span className="ot-intergenic">intergenic</span>
                                              )}
                                            </td>
                                            <td className="ot-region">{ot.gene_region || '-'}</td>
                                            <td className="ot-mm">
                                              <span className={`mm-badge mm-${ot.mismatches}`}>
                                                {ot.mismatches}
                                              </span>
                                            </td>
                                            <td className="ot-positions">
                                              {formatMismatchPositions(ot.mismatch_positions)}
                                            </td>
                                            <td className="ot-seq">
                                              <code>{ot.sequence}</code>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-guides">
            <p>No guide RNAs were found for the specified target and parameters.</p>
            <p>Try adjusting the target region or PAM sequence.</p>
            <button onClick={goToSearch} className="back-button">
              Modify Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CrisprResultsPage;

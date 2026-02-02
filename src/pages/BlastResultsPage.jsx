import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './BlastResultsPage.css';

function BlastResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [params, setParams] = useState(null);
  const [expandedHits, setExpandedHits] = useState(new Set([0])); // First hit expanded by default

  // Load results from session storage
  useEffect(() => {
    const storedResults = sessionStorage.getItem('blastResults');
    const storedParams = sessionStorage.getItem('blastParams');

    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    if (storedParams) {
      setParams(JSON.parse(storedParams));
    }
  }, []);

  // Toggle hit expansion
  const toggleHit = (index) => {
    const newExpanded = new Set(expandedHits);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedHits(newExpanded);
  };

  // Expand/collapse all
  const expandAll = () => {
    setExpandedHits(new Set(results.hits.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedHits(new Set());
  };

  // Format E-value for display
  const formatEvalue = (evalue) => {
    if (evalue < 0.001) {
      return evalue.toExponential(2);
    }
    return evalue.toFixed(3);
  };

  // Go back to search
  const goToSearch = () => {
    navigate('/blast');
  };

  if (!results) {
    return (
      <div className="blast-results-page">
        <div className="blast-content">
          <h1>BLAST Results</h1>
          <hr />
          <div className="no-results">
            <p>No BLAST results available.</p>
            <button onClick={goToSearch} className="back-button">
              Run a New Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blast-results-page">
      <div className="blast-content">
        <h1>BLAST Results</h1>
        <hr />

        {/* Search Summary */}
        <div className="search-summary">
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Program:</span>
              <span className="value">{results.program}</span>
            </div>
            <div className="summary-item">
              <span className="label">Query:</span>
              <span className="value">
                {results.query_def || results.query_id} ({results.query_length}{' '}
                letters)
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Database:</span>
              <span className="value">{results.database}</span>
            </div>
            <div className="summary-item">
              <span className="label">Sequences:</span>
              <span className="value">
                {results.database_sequences?.toLocaleString() || 'N/A'}
              </span>
            </div>
          </div>
          <button onClick={goToSearch} className="new-search-button">
            New Search
          </button>
        </div>

        {/* Results Summary */}
        {results.hits.length === 0 ? (
          <div className="no-hits">
            <p>No significant hits found.</p>
            <p className="hint">
              Try adjusting your search parameters (e.g., increase E-value
              threshold or try a different database).
            </p>
          </div>
        ) : (
          <>
            {/* Hits Table */}
            <div className="results-section">
              <div className="section-header">
                <h2>
                  {results.hits.length} Sequence{results.hits.length !== 1 ? 's' : ''}{' '}
                  Found
                </h2>
                <div className="expand-controls">
                  <button onClick={expandAll} className="expand-btn">
                    Expand All
                  </button>
                  <button onClick={collapseAll} className="expand-btn">
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Summary Table */}
              <table className="hits-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Score</th>
                    <th>E-value</th>
                    <th>Identity</th>
                    <th>Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {results.hits.map((hit, index) => (
                    <tr
                      key={index}
                      className={expandedHits.has(index) ? 'expanded' : ''}
                      onClick={() => toggleHit(index)}
                    >
                      <td>{hit.num}</td>
                      <td className="description-cell">
                        <span className="expand-icon">
                          {expandedHits.has(index) ? '▼' : '▶'}
                        </span>
                        {hit.locus_link ? (
                          <Link
                            to={hit.locus_link}
                            onClick={(e) => e.stopPropagation()}
                            className="locus-link"
                          >
                            {hit.description.length > 60
                              ? hit.description.substring(0, 57) + '...'
                              : hit.description}
                          </Link>
                        ) : (
                          <span title={hit.description}>
                            {hit.description.length > 60
                              ? hit.description.substring(0, 57) + '...'
                              : hit.description}
                          </span>
                        )}
                      </td>
                      <td>{hit.best_bit_score.toFixed(1)}</td>
                      <td>{formatEvalue(hit.best_evalue)}</td>
                      <td>{hit.hsps[0]?.percent_identity?.toFixed(1)}%</td>
                      <td>{hit.query_cover?.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Detailed Alignments */}
              <div className="alignments-section">
                {results.hits.map(
                  (hit, hitIndex) =>
                    expandedHits.has(hitIndex) && (
                      <div key={hitIndex} className="hit-alignments" id={`hit-${hitIndex}`}>
                        <div className="hit-header">
                          <h3>
                            {hit.locus_link ? (
                              <Link to={hit.locus_link}>{hit.description}</Link>
                            ) : (
                              hit.description
                            )}
                          </h3>
                          <div className="hit-meta">
                            <span>Length: {hit.length.toLocaleString()}</span>
                            <span>Accession: {hit.accession}</span>
                          </div>
                        </div>

                        {hit.hsps.map((hsp, hspIndex) => (
                          <div key={hspIndex} className="hsp-alignment">
                            <div className="hsp-stats">
                              <span>
                                <strong>Score:</strong> {hsp.bit_score.toFixed(1)}{' '}
                                bits ({hsp.score})
                              </span>
                              <span>
                                <strong>E-value:</strong> {formatEvalue(hsp.evalue)}
                              </span>
                              <span>
                                <strong>Identities:</strong> {hsp.identity}/
                                {hsp.align_len} ({hsp.percent_identity.toFixed(0)}%)
                              </span>
                              {hsp.positive && (
                                <span>
                                  <strong>Positives:</strong> {hsp.positive}/
                                  {hsp.align_len} ({hsp.percent_positive?.toFixed(0)}%)
                                </span>
                              )}
                              <span>
                                <strong>Gaps:</strong> {hsp.gaps}/{hsp.align_len}
                              </span>
                              {hsp.query_frame && (
                                <span>
                                  <strong>Frame:</strong> {hsp.query_frame}
                                </span>
                              )}
                            </div>

                            <pre className="alignment-block">
                              {formatAlignment(hsp)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Format alignment for display in chunks
 */
function formatAlignment(hsp, chunkSize = 60) {
  const lines = [];
  const querySeq = hsp.query_seq;
  const hitSeq = hsp.hit_seq;
  const midline = hsp.midline;

  for (let i = 0; i < querySeq.length; i += chunkSize) {
    const qChunk = querySeq.substring(i, i + chunkSize);
    const mChunk = midline.substring(i, i + chunkSize);
    const sChunk = hitSeq.substring(i, i + chunkSize);

    const qStart = hsp.query_start + i;
    const qEnd = qStart + qChunk.replace(/-/g, '').length - 1;
    const sStart = hsp.hit_start + i;
    const sEnd = sStart + sChunk.replace(/-/g, '').length - 1;

    lines.push(`Query  ${String(qStart).padStart(7)}  ${qChunk}  ${qEnd}`);
    lines.push(`       ${' '.repeat(7)}  ${mChunk}`);
    lines.push(`Sbjct  ${String(sStart).padStart(7)}  ${sChunk}  ${sEnd}`);
    lines.push('');
  }

  return lines.join('\n');
}

export default BlastResultsPage;

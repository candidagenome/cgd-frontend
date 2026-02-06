import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import blastApi from '../api/blastApi';
import './BlastResultsPage.css';

function BlastResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [params, setParams] = useState(null);
  const [expandedHits, setExpandedHits] = useState(new Set());
  const [downloading, setDownloading] = useState(null);
  const [displayedSequences, setDisplayedSequences] = useState(new Set());

  // Toggle sequence display for a hit
  const toggleSequenceDisplay = (index) => {
    setDisplayedSequences((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Format sequence for display (60 chars per line)
  const formatSequence = (hit) => {
    // Use the first HSP's hit sequence as an approximation
    // In a real implementation, this would fetch the full sequence from the server
    const hsp = hit.hsps[0];
    if (!hsp) return '';

    const seq = hsp.hit_seq.replace(/-/g, ''); // Remove gaps
    const lines = [];
    for (let i = 0; i < seq.length; i += 80) {
      lines.push(seq.substring(i, i + 80));
    }
    return lines.join('\n');
  };

  // Load results from session storage
  useEffect(() => {
    const storedResults = sessionStorage.getItem('blastResults');
    const storedParams = sessionStorage.getItem('blastParams');

    if (storedResults) {
      const parsed = JSON.parse(storedResults);
      setResults(parsed);
      // Expand all hits by default
      if (parsed.hits) {
        setExpandedHits(new Set(parsed.hits.map((_, i) => i)));
        // Debug: log hit data to see jbrowse_url
        console.log('BLAST hits data:', parsed.hits.map(h => ({
          id: h.id,
          jbrowse_url: h.jbrowse_url,
          organism_tag: h.organism_tag,
          organism_name: h.organism_name
        })));
      }
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

  // Get color for alignment score (NCBI-style color scheme)
  const getScoreColor = (score, maxScore) => {
    // Color ranges based on bit score (similar to NCBI BLAST)
    if (score >= 200) return '#ff0000';      // Red - excellent
    if (score >= 80) return '#ff66ff';       // Pink/magenta - good
    if (score >= 50) return '#00ff00';       // Green - moderate
    if (score >= 40) return '#0000ff';       // Blue - weak
    return '#000000';                         // Black - very weak
  };

  // Go back to search
  const goToSearch = () => {
    navigate('/blast');
  };

  // Download results in specified format
  const handleDownload = async (format) => {
    if (!params) return;

    setDownloading(format);
    try {
      const response = await blastApi.download(format, params);
      const blob = response.data;

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `blast_results.${format === 'tab' ? 'tsv' : format === 'raw' ? 'txt' : format}`;
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
    <div className="blast-results-page" id="top">
      <div className="blast-content">
        <h1>BLAST Results</h1>
        <hr />

        {/* Navigation Links */}
        {results.hits.length > 0 && (
          <nav className="results-nav">
            <span>Jump to:</span>
            <a href="#hits-list">List of Hits</a>
            <span className="nav-separator">|</span>
            <a href="#download-section">Download Results</a>
            <span className="nav-separator">|</span>
            <a href="#alignments-section">Hit Alignments</a>
          </nav>
        )}

        {/* Search Summary */}
        <div className="search-summary">
          <div className="summary-top-row">
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Program:</span>
                <span className="value">{results.program}</span>
              </div>
              <div className="summary-item">
                <span className="label">Query:</span>
                <span className="value">
                  {params?.query_comment || results.query_def || results.query_id} ({results.query_length}{' '}
                  letters)
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Sequences:</span>
                <span className="value">
                  {results.database_sequences?.toLocaleString() || 'N/A'}
                </span>
              </div>
            </div>
            <div className="summary-actions">
              <button onClick={goToSearch} className="new-search-button">
                New Search
              </button>
            </div>
          </div>
          <div className="summary-item summary-database">
            <span className="label">Database:</span>
            <span className="value">{results.database}</span>
          </div>
        </div>

        {/* Download Options */}
        {results.hits.length > 0 && (
          <div className="download-section" id="download-section">
            <span className="download-label">Download results:</span>
            <div className="download-buttons">
              <button
                onClick={() => handleDownload('fasta')}
                disabled={downloading !== null}
                className="download-btn"
              >
                {downloading === 'fasta' ? 'Downloading...' : 'FASTA'}
              </button>
              <button
                onClick={() => handleDownload('tab')}
                disabled={downloading !== null}
                className="download-btn"
              >
                {downloading === 'tab' ? 'Downloading...' : 'Tab-delimited'}
              </button>
              <button
                onClick={() => handleDownload('raw')}
                disabled={downloading !== null}
                className="download-btn"
              >
                {downloading === 'raw' ? 'Downloading...' : 'Text'}
              </button>
            </div>
          </div>
        )}

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
            {/* Graphic Summary */}
            <div className="graphic-summary">
              <h3>Distribution of BLAST Hits on Query Sequence</h3>
              <div className="color-legend">
                <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#ff0000'}}></span> &gt;=200</span>
                <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#ff66ff'}}></span> 80-200</span>
                <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#00ff00'}}></span> 50-80</span>
                <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#0000ff'}}></span> 40-50</span>
                <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#000000'}}></span> &lt;40</span>
              </div>
              <div className="query-ruler">
                <div className="ruler-label">Query</div>
                <div className="ruler-track">
                  <div className="ruler-scale">
                    {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                      <span key={fraction} className="scale-mark" style={{left: `${fraction * 100}%`}}>
                        {Math.round(fraction * results.query_length)}
                      </span>
                    ))}
                  </div>
                  <div className="ruler-bar"></div>
                </div>
              </div>
              <div className="hits-graphic">
                {results.hits.slice(0, 100).map((hit, index) => (
                  <div key={index} className="hit-row" title={`${hit.description}\nScore: ${hit.best_bit_score.toFixed(1)}, E-value: ${formatEvalue(hit.best_evalue)}`}>
                    <div className="hit-label">{index + 1}</div>
                    <div className="hit-track">
                      {hit.hsps.map((hsp, hspIndex) => {
                        const left = ((hsp.query_start - 1) / results.query_length) * 100;
                        const width = ((hsp.query_end - hsp.query_start + 1) / results.query_length) * 100;
                        return (
                          <div
                            key={hspIndex}
                            className="hsp-bar"
                            style={{
                              left: `${left}%`,
                              width: `${Math.max(width, 0.5)}%`,
                              backgroundColor: getScoreColor(hsp.bit_score),
                            }}
                            title={`HSP ${hspIndex + 1}: ${hsp.query_start}-${hsp.query_end}, Score: ${hsp.bit_score.toFixed(1)}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {results.hits.length > 100 && (
                <p className="truncation-note">Showing first 100 of {results.hits.length} hits</p>
              )}
            </div>

            {/* Hits Table */}
            <div className="results-section" id="hits-list">
              <div className="section-header">
                <h2>
                  List of {results.program.toUpperCase()} Hits
                </h2>
                <div className="expand-controls">
                  <button onClick={expandAll} className="expand-btn">
                    Expand
                  </button>
                  <button onClick={collapseAll} className="expand-btn">
                    Collapse
                  </button>
                </div>
              </div>

              <p className="hits-instruction">
                Click on the sequence ID to jump directly to the alignment.
              </p>

              {/* Summary Table */}
              <table className="hits-table">
                <thead>
                  <tr>
                    <th>Sequence Hits in Target Database</th>
                    <th>Score (bits)</th>
                    <th>E value</th>
                  </tr>
                </thead>
                <tbody>
                  {results.hits.map((hit, index) => (
                    <tr
                      key={index}
                      className={expandedHits.has(index) ? 'expanded' : ''}
                    >
                      <td className="description-cell">
                        <a
                          href={`#hit-${index}`}
                          className="sequence-link"
                          onClick={(e) => {
                            e.preventDefault();
                            // Expand this hit and scroll to it
                            const newExpanded = new Set(expandedHits);
                            newExpanded.add(index);
                            setExpandedHits(newExpanded);
                            // Scroll after a brief delay to allow expansion
                            setTimeout(() => {
                              document.getElementById(`hit-${index}`)?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                        >
                          {hit.accession}
                        </a>
                        {hit.organism_name && (
                          <span className="organism-name"> {hit.organism_name}</span>
                        )}
                      </td>
                      <td>{hit.best_bit_score.toFixed(0)}</td>
                      <td>{hit.best_evalue === 0 ? '0.0e+00' : formatEvalue(hit.best_evalue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Detailed Alignments */}
              <h2 className="alignments-title" id="alignments-section">
                Alignments of {results.program.toUpperCase()} Hits
              </h2>
              <nav className="section-nav">
                <span>Jump to:</span>
                <a href="#top">Top</a>
                <span className="nav-separator">|</span>
                <a href="#hits-list">List of Hits</a>
                <span className="nav-separator">|</span>
                <a href="#download-section">Download Results</a>
              </nav>
              <div className="alignments-section">
                {results.hits.map(
                  (hit, hitIndex) =>
                    expandedHits.has(hitIndex) && (
                      <div key={hitIndex} className="hit-alignments" id={`hit-${hitIndex}`}>
                        <div className="hit-header">
                          <h3>
                            {hit.accession}{' '}
                            {hit.organism_name && <span className="hit-organism">{hit.organism_name}</span>}
                          </h3>
                          <div className="hit-meta">
                            <span>Length = {hit.length.toLocaleString()}</span>
                            <span>Score = {hit.hsps[0]?.score} ({hit.best_bit_score.toFixed(0)} bits)</span>
                            <span>Expect = {hit.best_evalue === 0 ? '0.0' : formatEvalue(hit.best_evalue)}</span>
                            {hit.hsps[0]?.percent_identity && (
                              <span>
                                Identities = {hit.hsps[0].identity}/{hit.hsps[0].align_len} ({hit.hsps[0].percent_identity.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                          <div className="hit-actions">
                            {hit.jbrowse_url ? (
                              <a
                                href={hit.jbrowse_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="jbrowse-link"
                              >
                                CGD Genome Browser
                              </a>
                            ) : (
                              <span style={{ color: '#999', fontSize: '0.85em' }}>
                                (No JBrowse link - tag: {hit.organism_tag || 'none'})
                              </span>
                            )}
                            <button
                              type="button"
                              className="display-seq-btn"
                              onClick={() => toggleSequenceDisplay(hitIndex)}
                            >
                              {displayedSequences.has(hitIndex) ? 'Hide Sequence' : 'Display Sequence'}
                            </button>
                          </div>
                          {displayedSequences.has(hitIndex) && (
                            <div className="sequence-display">
                              <pre className="sequence-fasta">
                                {`>${hit.accession}:${hit.hsps[0]?.hit_start}-${hit.hsps[0]?.hit_end} (${hit.length} nucleotides)\n${formatSequence(hit)}`}
                              </pre>
                            </div>
                          )}
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

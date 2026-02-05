import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './WebPrimerResultsPage.css';

function WebPrimerResultsPage() {
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [params, setParams] = useState(null);
  const [showAllPairs, setShowAllPairs] = useState(false);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('webprimerResults');
    const storedParams = sessionStorage.getItem('webprimerParams');

    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    if (storedParams) {
      setParams(JSON.parse(storedParams));
    }

    if (!storedResults) {
      navigate('/webprimer');
    }
  }, [navigate]);

  const formatSequence = (seq, lineLength = 50) => {
    if (!seq) return null;
    const lines = [];
    for (let i = 0; i < seq.length; i += lineLength) {
      lines.push({
        position: i + 1,
        text: seq.slice(i, i + lineLength).match(/.{1,10}/g)?.join(' ') || '',
      });
    }
    return lines;
  };

  if (!results) {
    return (
      <div className="webprimer-results-page">
        <div className="webprimer-results-content">
          <h1>Web Primer Results</h1>
          <hr />
          <div className="loading-state">Loading...</div>
        </div>
      </div>
    );
  }

  if (!results.success) {
    return (
      <div className="webprimer-results-page">
        <div className="webprimer-results-content">
          <h1>Web Primer Results</h1>
          <hr />

          <div className="error-message">
            <strong>Error:</strong> {results.error}
          </div>

          {/* Stats */}
          <div className="stats-section">
            <h3>Filter Statistics</h3>
            <table className="stats-table">
              <tbody>
                <tr>
                  <th>Forward primers with valid GC:</th>
                  <td>{results.forward_gc_valid || 0}</td>
                </tr>
                <tr>
                  <th>Forward primers with valid Tm:</th>
                  <td>{results.forward_tm_valid || 0}</td>
                </tr>
                <tr>
                  <th>Forward primers with valid self-annealing:</th>
                  <td>{results.forward_self_valid || 0}</td>
                </tr>
                <tr>
                  <th>Reverse primers with valid GC:</th>
                  <td>{results.reverse_gc_valid || 0}</td>
                </tr>
                <tr>
                  <th>Reverse primers with valid Tm:</th>
                  <td>{results.reverse_tm_valid || 0}</td>
                </tr>
                <tr>
                  <th>Reverse primers with valid self-annealing:</th>
                  <td>{results.reverse_self_valid || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="nav-links">
            <Link to="/webprimer">&larr; Back to Primer Design</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="webprimer-results-page">
      <div className="webprimer-results-content">
        <h1>Web Primer Results</h1>
        <hr />

        {/* Summary */}
        <div className="summary-section">
          <h3>Summary</h3>
          <p>
            <strong>Purpose:</strong> {results.purpose}
            <br />
            <strong>Sequence Length:</strong> {results.sequence_length} bp
            {params?.locus && (
              <>
                <br />
                <strong>Locus:</strong> {params.locus}
              </>
            )}
          </p>
        </div>

        {/* Warnings */}
        {results.warnings?.length > 0 && (
          <div className="warnings-section">
            {results.warnings.map((w, i) => (
              <div key={i} className="warning-item">{w}</div>
            ))}
          </div>
        )}

        {/* PCR Results */}
        {results.purpose === 'PCR' && results.best_pair && (
          <>
            {/* Best Pair */}
            <div className="best-pair-section">
              <h3>Best Primer Pair</h3>

              <table className="primer-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Forward Primer</th>
                    <th>Reverse Primer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Sequence</th>
                    <td className="sequence-cell">{results.best_pair.forward.sequence}</td>
                    <td className="sequence-cell">{results.best_pair.reverse.sequence}</td>
                  </tr>
                  <tr>
                    <th>Length</th>
                    <td>{results.best_pair.forward.length} bp</td>
                    <td>{results.best_pair.reverse.length} bp</td>
                  </tr>
                  <tr>
                    <th>Tm</th>
                    <td>{results.best_pair.forward.tm.toFixed(1)}°C</td>
                    <td>{results.best_pair.reverse.tm.toFixed(1)}°C</td>
                  </tr>
                  <tr>
                    <th>GC %</th>
                    <td>{results.best_pair.forward.gc_percent.toFixed(1)}%</td>
                    <td>{results.best_pair.reverse.gc_percent.toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <th>Self-Anneal</th>
                    <td>{results.best_pair.forward.self_anneal}</td>
                    <td>{results.best_pair.reverse.self_anneal}</td>
                  </tr>
                  <tr>
                    <th>End-Anneal</th>
                    <td>{results.best_pair.forward.self_end_anneal}</td>
                    <td>{results.best_pair.reverse.self_end_anneal}</td>
                  </tr>
                  <tr>
                    <th>Position</th>
                    <td>{results.best_pair.forward.position}</td>
                    <td>{results.best_pair.reverse.position}</td>
                  </tr>
                </tbody>
              </table>

              <div className="pair-stats">
                <p>
                  <strong>Pair Annealing:</strong> {results.best_pair.pair_anneal}
                  <br />
                  <strong>Pair End-Annealing:</strong> {results.best_pair.pair_end_anneal}
                  <br />
                  <strong>Product Length:</strong> {results.best_pair.product_length} bp
                </p>
              </div>
            </div>

            {/* Amplified Sequence */}
            {results.amplified_sequence && (
              <div className="sequence-section">
                <h3>Amplified Sequence ({results.amplified_sequence.length} bp)</h3>
                <div className="sequence-display">
                  <table className="sequence-table">
                    <tbody>
                      {formatSequence(results.amplified_sequence).map((line, i) => (
                        <tr key={i}>
                          <td className="position">{line.position}</td>
                          <td className="bases">{line.text}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* All Pairs */}
            {results.all_pairs?.length > 1 && (
              <div className="all-pairs-section">
                <h3>
                  All Valid Primer Pairs ({results.total_pairs})
                  <button
                    className="toggle-btn"
                    onClick={() => setShowAllPairs(!showAllPairs)}
                  >
                    {showAllPairs ? 'Hide' : 'Show'}
                  </button>
                </h3>

                {showAllPairs && (
                  <table className="pairs-list-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Forward Primer</th>
                        <th>Reverse Primer</th>
                        <th>F-Tm</th>
                        <th>R-Tm</th>
                        <th>F-GC</th>
                        <th>R-GC</th>
                        <th>Pair</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.all_pairs.map((pair) => (
                        <tr key={pair.rank} className={pair.rank === 1 ? 'best-row' : ''}>
                          <td>{pair.rank}</td>
                          <td className="primer-seq">{pair.forward.sequence}</td>
                          <td className="primer-seq">{pair.reverse.sequence}</td>
                          <td>{pair.forward.tm.toFixed(1)}</td>
                          <td>{pair.reverse.tm.toFixed(1)}</td>
                          <td>{pair.forward.gc_percent.toFixed(0)}%</td>
                          <td>{pair.reverse.gc_percent.toFixed(0)}%</td>
                          <td>{pair.pair_anneal}</td>
                          <td>{pair.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}

        {/* Sequencing Results */}
        {results.purpose === 'SEQUENCING' && (
          <>
            {results.coding_primers?.length > 0 && (
              <div className="sequencing-section">
                <h3>Coding Strand Primers ({results.coding_primers.length})</h3>
                <table className="sequencing-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Sequence</th>
                      <th>Position</th>
                      <th>Length</th>
                      <th>Tm</th>
                      <th>GC %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.coding_primers.map((p) => (
                      <tr key={p.rank}>
                        <td>{p.rank}</td>
                        <td className="primer-seq">{p.primer.sequence}</td>
                        <td>{p.primer.position}</td>
                        <td>{p.primer.length}</td>
                        <td>{p.primer.tm.toFixed(1)}</td>
                        <td>{p.primer.gc_percent.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {results.noncoding_primers?.length > 0 && (
              <div className="sequencing-section">
                <h3>Non-coding Strand Primers ({results.noncoding_primers.length})</h3>
                <table className="sequencing-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Sequence</th>
                      <th>Position</th>
                      <th>Length</th>
                      <th>Tm</th>
                      <th>GC %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.noncoding_primers.map((p) => (
                      <tr key={p.rank}>
                        <td>{p.rank}</td>
                        <td className="primer-seq">{p.primer.sequence}</td>
                        <td>{p.primer.position}</td>
                        <td>{p.primer.length}</td>
                        <td>{p.primer.tm.toFixed(1)}</td>
                        <td>{p.primer.gc_percent.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="nav-links">
          <Link to="/webprimer">&larr; New Primer Design</Link>
        </div>
      </div>
    </div>
  );
}

export default WebPrimerResultsPage;

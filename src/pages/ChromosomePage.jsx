import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import chromosomeApi from '../api/chromosomeApi';
import './ChromosomePage.css';

function ChromosomePage() {
  const { name } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [chromosome, setChromosome] = useState(null);
  const [history, setHistory] = useState(null);
  const [references, setReferences] = useState(null);
  const [summaryNotes, setSummaryNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    const fetchChromosome = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await chromosomeApi.getInfo(name);
        setChromosome(data.result);
      } catch (err) {
        console.error('Chromosome error:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load chromosome');
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      fetchChromosome();
    }
  }, [name]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (activeTab === 'history' && !history) {
        try {
          const data = await chromosomeApi.getHistory(name);
          setHistory(data.result);
        } catch (err) {
          console.error('History error:', err);
        }
      }
    };

    const fetchReferences = async () => {
      if (activeTab === 'references' && !references) {
        try {
          const data = await chromosomeApi.getReferences(name);
          setReferences(data);
        } catch (err) {
          console.error('References error:', err);
        }
      }
    };

    const fetchSummary = async () => {
      if (activeTab === 'summary' && !summaryNotes) {
        try {
          const data = await chromosomeApi.getSummaryNotes(name);
          setSummaryNotes(data);
        } catch (err) {
          console.error('Summary error:', err);
        }
      }
    };

    fetchHistory();
    fetchReferences();
    fetchSummary();
  }, [activeTab, name, history, references, summaryNotes]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="chromosome-page">
        <div className="chromosome-content">
          <h1>Chromosome/Contig</h1>
          <hr />
          <div className="loading-state">
            <span className="loading-spinner"></span>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chromosome-page">
        <div className="chromosome-content">
          <h1>Chromosome/Contig</h1>
          <hr />
          <div className="error-state">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  if (!chromosome) {
    return null;
  }

  return (
    <div className="chromosome-page">
      <div className="chromosome-content">
        <h1>Chromosome/Contig: {chromosome.feature_name}</h1>
        <hr />

        {/* Basic Info Header */}
        <div className="chromosome-header">
          <table className="header-table">
            <tbody>
              <tr>
                <th>Feature Name</th>
                <td>{chromosome.feature_name}</td>
              </tr>
              <tr>
                <th>Feature Type</th>
                <td>{chromosome.feature_type}</td>
              </tr>
              <tr>
                <th>CGD ID</th>
                <td>{chromosome.dbxref_id}</td>
              </tr>
              <tr>
                <th>Organism</th>
                <td>{chromosome.organism_name}</td>
              </tr>
              {chromosome.headline && (
                <tr>
                  <th>Description</th>
                  <td>{chromosome.headline}</td>
                </tr>
              )}
              {(chromosome.start_coord || chromosome.stop_coord) && (
                <tr>
                  <th>Coordinates</th>
                  <td>
                    {formatNumber(chromosome.start_coord)} - {formatNumber(chromosome.stop_coord)}
                    {chromosome.stop_coord && ` (${formatNumber(chromosome.stop_coord - (chromosome.start_coord || 0) + 1)} bp)`}
                  </td>
                </tr>
              )}
              {chromosome.seq_source && (
                <tr>
                  <th>Sequence Source</th>
                  <td>{chromosome.seq_source}</td>
                </tr>
              )}
              {chromosome.aliases?.length > 0 && (
                <tr>
                  <th>Aliases</th>
                  <td>
                    {chromosome.aliases.map((alias, idx) => (
                      <span key={idx} className="alias-item">
                        {alias.alias_name}
                        <span className="alias-type">({alias.alias_type})</span>
                        {idx < chromosome.aliases.length - 1 && ', '}
                      </span>
                    ))}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* History Summary */}
        {chromosome.history_summary && (
          <div className="history-summary">
            <h3>History Summary</h3>
            <table className="summary-table">
              <tbody>
                <tr>
                  <td>
                    <strong>{chromosome.history_summary.sequence_updates}</strong> sequence update(s)
                    {chromosome.history_summary.sequence_last_update && (
                      <span className="last-date">
                        (last: {chromosome.history_summary.sequence_last_update})
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>{chromosome.history_summary.annotation_updates}</strong> annotation update(s)
                    {chromosome.history_summary.annotation_last_update && (
                      <span className="last-date">
                        (last: {chromosome.history_summary.annotation_last_update})
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>{chromosome.history_summary.curatorial_notes}</strong> curatorial note(s)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleTabChange('history')}
          >
            History
          </button>
          <button
            className={`tab ${activeTab === 'references' ? 'active' : ''}`}
            onClick={() => handleTabChange('references')}
          >
            References
          </button>
          <button
            className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => handleTabChange('summary')}
          >
            Summary Notes
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <h3>Overview</h3>
              <p>
                This page displays information about {chromosome.feature_type}{' '}
                <strong>{chromosome.feature_name}</strong> from{' '}
                <em>{chromosome.organism_name}</em>.
              </p>

              {chromosome.stop_coord && (
                <div className="stats-section">
                  <h4>Sequence Statistics</h4>
                  <ul>
                    <li>
                      <strong>Length:</strong>{' '}
                      {formatNumber(chromosome.stop_coord - (chromosome.start_coord || 0) + 1)} bp
                    </li>
                    {chromosome.seq_source && (
                      <li>
                        <strong>Assembly:</strong> {chromosome.seq_source}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="links-section">
                <h4>External Links</h4>
                <ul>
                  <li>
                    <a
                      href={`/jbrowse/index.html?data=C_albicans_SC5314&loc=${chromosome.feature_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View in JBrowse
                    </a>
                  </li>
                  <li>
                    <a
                      href={`https://www.ncbi.nlm.nih.gov/nuccore/${chromosome.dbxref_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      NCBI Nucleotide
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-tab">
              <h3>Change History</h3>

              {!history ? (
                <div className="loading-inline">Loading history...</div>
              ) : (
                <>
                  {/* Sequence Changes */}
                  <div className="history-section">
                    <h4>Sequence Changes ({history.sequence_changes?.length || 0})</h4>
                    {history.sequence_changes?.length > 0 ? (
                      <table className="history-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Coordinates</th>
                            <th>Affected Features</th>
                            <th>Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.sequence_changes.map((change, idx) => (
                            <tr key={idx}>
                              <td>{change.date}</td>
                              <td>{change.change_type}</td>
                              <td>
                                {formatNumber(change.start_coord)} - {formatNumber(change.stop_coord)}
                              </td>
                              <td>
                                {change.affected_features.map((feat, fidx) => (
                                  <span key={fidx}>
                                    <Link to={`/locus/${feat}`}>{feat}</Link>
                                    {fidx < change.affected_features.length - 1 && ', '}
                                  </span>
                                ))}
                              </td>
                              <td>{change.note || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="no-data">No sequence changes recorded.</p>
                    )}
                  </div>

                  {/* Annotation Changes */}
                  <div className="history-section">
                    <h4>Annotation Changes ({history.annotation_changes?.length || 0})</h4>
                    {history.annotation_changes?.length > 0 ? (
                      <table className="history-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Affected Features</th>
                            <th>Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.annotation_changes.map((change, idx) => (
                            <tr key={idx}>
                              <td>{change.date}</td>
                              <td>
                                {change.affected_features.map((feat, fidx) => (
                                  <span key={fidx}>
                                    <Link to={`/locus/${feat}`}>{feat}</Link>
                                    {fidx < change.affected_features.length - 1 && ', '}
                                  </span>
                                ))}
                              </td>
                              <td>{change.note || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="no-data">No annotation changes recorded.</p>
                    )}
                  </div>

                  {/* Curatorial Notes */}
                  <div className="history-section">
                    <h4>Curatorial Notes ({history.curatorial_notes?.length || 0})</h4>
                    {history.curatorial_notes?.length > 0 ? (
                      <ul className="notes-list">
                        {history.curatorial_notes.map((note, idx) => (
                          <li key={idx}>
                            <span className="note-date">{note.date}:</span> {note.note}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-data">No curatorial notes recorded.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'references' && (
            <div className="references-tab">
              <h3>References</h3>

              {!references ? (
                <div className="loading-inline">Loading references...</div>
              ) : references.references?.length > 0 ? (
                <table className="references-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Citation</th>
                      <th>PubMed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {references.references.map((ref, idx) => (
                      <tr key={idx}>
                        <td>{ref.year}</td>
                        <td>
                          <Link to={`/reference/${ref.reference_no}`}>
                            {ref.title || ref.citation}
                          </Link>
                        </td>
                        <td>
                          {ref.pubmed ? (
                            <a
                              href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pubmed}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {ref.pubmed}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">No references found for this chromosome.</p>
              )}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="summary-tab">
              <h3>Summary Notes</h3>

              {!summaryNotes ? (
                <div className="loading-inline">Loading summary notes...</div>
              ) : summaryNotes.summary_notes?.length > 0 ? (
                <div className="summary-notes">
                  {summaryNotes.summary_notes.map((note, idx) => (
                    <div key={idx} className="summary-paragraph">
                      <p>{note.paragraph_text}</p>
                      <div className="paragraph-meta">
                        Last edited: {formatDate(note.date_edited)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No summary notes available for this chromosome.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChromosomePage;

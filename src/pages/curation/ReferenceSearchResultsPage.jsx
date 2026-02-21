/**
 * Reference Search Results Page
 *
 * Displays search results for references. Users can:
 * - View list of matching references
 * - Select a reference to view/edit details
 * - Delete references (if not in use)
 */
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import referenceCurationApi from '../../api/referenceCurationApi';

function ReferenceSearchResultsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Results state
  const [results, setResults] = useState([]);
  const [selectedRef, setSelectedRef] = useState(null);
  const [refUsage, setRefUsage] = useState(null);
  const [searchCriteria, setSearchCriteria] = useState('');

  // Delete form state
  const [deleteLogComment, setDeleteLogComment] = useState('');
  const [secondaryForId, setSecondaryForId] = useState('');
  const [secondaryIdType, setSecondaryIdType] = useState('CGDID');

  // Add URL form state - with fallback default values
  const defaultUrlTypes = ['Reference Data', 'Reference LINKOUT', 'Reference full text', 'Reference full text all', 'Reference Supplement'];
  const defaultUrlSources = ['Author', 'NCBI', 'Publisher'];
  const [urlOptions, setUrlOptions] = useState({ url_types: defaultUrlTypes, url_sources: defaultUrlSources });
  const [newUrl, setNewUrl] = useState('');
  const [newUrlType, setNewUrlType] = useState('Reference full text');
  const [newUrlSource, setNewUrlSource] = useState('Author');

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Load URL options on mount
  useEffect(() => {
    const loadUrlOptions = async () => {
      try {
        const options = await referenceCurationApi.getUrlOptions();
        if (options.url_types?.length > 0 && options.url_sources?.length > 0) {
          setUrlOptions(options);
          setNewUrlSource(options.url_sources[0]);
          setNewUrlType(options.url_types[0]);
        }
      } catch (err) {
        console.error('Failed to load URL options:', err);
        // Keep default values already set in state
      }
    };
    loadUrlOptions();
  }, []);

  // Perform search based on URL params
  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      setError(null);

      const params = {};
      let criteriaText = '';

      // Parse URL search params
      const pubmed = searchParams.get('pubmed');
      const referenceNo = searchParams.get('reference_no');
      const dbxrefId = searchParams.get('dbxref_id');
      const volume = searchParams.get('volume');
      const page = searchParams.get('page');
      const author = searchParams.get('author');
      const author2 = searchParams.get('author2');
      const keyword = searchParams.get('keyword');
      const minYear = searchParams.get('min_year');
      const maxYear = searchParams.get('max_year');

      if (pubmed) {
        params.pubmed = parseInt(pubmed, 10);
        criteriaText = `PubMed ID: ${pubmed}`;
      } else if (referenceNo) {
        params.reference_no = parseInt(referenceNo, 10);
        criteriaText = `Reference No: ${referenceNo}`;
      } else if (dbxrefId) {
        params.dbxref_id = dbxrefId;
        criteriaText = `CGDID: ${dbxrefId}`;
      } else if (volume && page) {
        params.volume = volume;
        params.page = page;
        criteriaText = `Volume: ${volume}, Page: ${page}`;
      } else {
        if (author) {
          params.author = author;
          criteriaText = `Author: ${author}`;
        }
        if (author2) {
          params.author2 = author2;
          criteriaText += criteriaText ? `, Author: ${author2}` : `Author: ${author2}`;
        }
        if (keyword) {
          params.keyword = keyword;
          criteriaText += criteriaText ? `, Keyword: ${keyword}` : `Keyword: ${keyword}`;
        }
        if (minYear) params.min_year = parseInt(minYear, 10);
        if (maxYear) params.max_year = parseInt(maxYear, 10);
      }

      setSearchCriteria(criteriaText);

      if (Object.keys(params).length === 0) {
        setError('No search criteria provided');
        setLoading(false);
        return;
      }

      try {
        const data = await referenceCurationApi.searchReferences(params);
        setResults(data.results);

        if (data.results.length === 0) {
          setMessage('No references found matching your search criteria.');
        } else if (data.results.length === 1) {
          // Auto-select single result
          await loadReferenceDetails(data.results[0].reference_no);
        }
      } catch (err) {
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchParams]);

  const loadReferenceDetails = async (refNo) => {
    try {
      const [details, usage] = await Promise.all([
        referenceCurationApi.getCurationDetails(refNo),
        referenceCurationApi.getReferenceUsage(refNo),
      ]);
      setSelectedRef(details);
      setRefUsage(usage);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedRef) return;

    if (!window.confirm(`Are you sure you want to delete reference ${selectedRef.reference_no}?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const options = {};
      if (deleteLogComment) {
        options.delete_log_comment = deleteLogComment;
      }
      if (secondaryForId) {
        let targetRefNo;
        if (secondaryIdType === 'reference_no') {
          targetRefNo = parseInt(secondaryForId, 10);
        } else {
          const searchParamsObj = secondaryIdType === 'CGDID'
            ? { dbxref_id: secondaryForId }
            : { pubmed: parseInt(secondaryForId, 10) };
          const searchResult = await referenceCurationApi.searchReferences(searchParamsObj);
          if (searchResult.results.length > 0) {
            targetRefNo = searchResult.results[0].reference_no;
          }
        }
        if (targetRefNo) {
          options.make_secondary_for = targetRefNo;
        }
      }

      const result = await referenceCurationApi.deleteWithCleanup(
        selectedRef.reference_no,
        options
      );

      setMessage(result.messages.join('\n'));
      setSelectedRef(null);
      setRefUsage(null);
      setResults(results.filter((r) => r.reference_no !== selectedRef.reference_no));
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCitation = (ref) => {
    if (ref.citation) return ref.citation;
    return `Reference ${ref.reference_no}`;
  };

  const handleAddUrl = async () => {
    if (!selectedRef || !newUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await referenceCurationApi.addReferenceUrl(
        selectedRef.reference_no,
        newUrl.trim(),
        newUrlType,
        newUrlSource
      );
      setMessage(result.message);
      setNewUrl('');
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Reference Search Results</h1>
        <div style={styles.userInfo}>
          <span>Curator: {user?.first_name} {user?.last_name}</span>
          <Link to="/curation/reference/search" style={styles.link}>New Search</Link>
          <Link to="/curation" style={styles.link}>Return to Curator Central</Link>
        </div>
      </div>

      {searchCriteria && (
        <div style={styles.criteriaBox}>
          <strong>Search Criteria:</strong> {searchCriteria}
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}
      {message && <div style={styles.success}>{message}</div>}

      {loading && <div style={styles.loading}>Searching...</div>}

      {/* Results List */}
      {!loading && results.length > 1 && !selectedRef && (
        <div style={styles.resultsSection}>
          <h3>Search Results ({results.length} references found)</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Reference No</th>
                <th style={styles.th}>Citation</th>
                <th style={styles.th}>Source</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>PubMed</th>
                <th style={styles.th}>CGDID</th>
              </tr>
            </thead>
            <tbody>
              {results.map((ref) => (
                <tr key={ref.reference_no} style={styles.tr}>
                  <td style={styles.td}>
                    <button
                      onClick={() => loadReferenceDetails(ref.reference_no)}
                      style={styles.linkButton}
                    >
                      {ref.reference_no}
                    </button>
                  </td>
                  <td style={styles.td}>{ref.citation || ref.title}</td>
                  <td style={styles.td}>{ref.source}</td>
                  <td style={styles.td}>{ref.status}</td>
                  <td style={styles.td}>{ref.pubmed || '-'}</td>
                  <td style={styles.td}>{ref.dbxref_id || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && !error && (
        <div style={styles.noResults}>
          <p>No references found matching your search criteria.</p>
          <Link to="/curation/reference/search" style={styles.link}>Try a new search</Link>
        </div>
      )}

      {/* Selected Reference Details */}
      {selectedRef && (
        <div style={styles.detailsSection}>
          <h3>Reference Details</h3>

          <div style={styles.citationBlock}>
            <div>
              <strong>{formatCitation(selectedRef)}</strong>
              {selectedRef.pubmed && (
                <span style={styles.pmidText}> PMID: {selectedRef.pubmed}</span>
              )}
            </div>
            <div style={styles.citationLinks}>
              <a
                href={`/reference/${selectedRef.dbxref_id || selectedRef.reference_no}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                CGD Paper
              </a>
              {selectedRef.pubmed && (
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${selectedRef.pubmed}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: '0.5rem' }}
                >
                  PubMed
                </a>
              )}
            </div>
          </div>

          <table style={styles.infoTable}>
            <tbody>
              <tr>
                <td style={styles.infoLabel}>CGDID:</td>
                <td>{selectedRef.dbxref_id || '-'}</td>
              </tr>
              <tr>
                <td style={styles.infoLabel}>Reference No:</td>
                <td>{selectedRef.reference_no}</td>
              </tr>
              {selectedRef.pubmed && (
                <tr>
                  <td style={styles.infoLabel}>PubMed ID:</td>
                  <td>
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${selectedRef.pubmed}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedRef.pubmed}
                    </a>
                  </td>
                </tr>
              )}
              <tr>
                <td style={styles.infoLabel}>Year:</td>
                <td>{selectedRef.year || '-'}</td>
              </tr>
              <tr>
                <td style={styles.infoLabel}>Volume:</td>
                <td>{selectedRef.volume || '-'}</td>
              </tr>
              <tr>
                <td style={styles.infoLabel}>Pages:</td>
                <td>{selectedRef.pages || '-'}</td>
              </tr>
              <tr>
                <td style={styles.infoLabel}>Status:</td>
                <td>{selectedRef.status}</td>
              </tr>
              <tr>
                <td style={styles.infoLabel}>Source:</td>
                <td>{selectedRef.source}</td>
              </tr>
              {selectedRef.curation_status && (
                <tr>
                  <td style={styles.infoLabel}>Curation Status:</td>
                  <td>{selectedRef.curation_status}</td>
                </tr>
              )}
            </tbody>
          </table>

          {selectedRef.abstract && (
            <div style={styles.abstractBlock}>
              <strong>Abstract:</strong> {selectedRef.abstract}
            </div>
          )}

          {/* Actions */}
          <div style={styles.actionsSection}>
            <h4>
              <Link to={`/curation/reference/${selectedRef.reference_no}`}>
                Edit reference information
              </Link>
            </h4>

            {/* Add URL Section */}
            <div style={styles.addUrlSection}>
              <h4>Add a New Reference URL</h4>
              <div style={styles.addUrlForm}>
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>Source:</label>
                  <select
                    value={newUrlSource}
                    onChange={(e) => setNewUrlSource(e.target.value)}
                    style={styles.select}
                  >
                    {urlOptions.url_sources.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>URL Type:</label>
                  <select
                    value={newUrlType}
                    onChange={(e) => setNewUrlType(e.target.value)}
                    style={styles.select}
                  >
                    {urlOptions.url_types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>URL:</label>
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    style={{ ...styles.input, width: '800px' }}
                    placeholder="Enter URL"
                  />
                </div>
                <button
                  onClick={handleAddUrl}
                  disabled={loading || !newUrl.trim()}
                  style={styles.addButton}
                >
                  Add URL
                </button>
              </div>
            </div>

            {refUsage && refUsage.in_use ? (
              <div style={styles.inUseWarning}>
                <p>
                  <strong>This reference is linked to data:</strong>
                </p>
                <ul>
                  {refUsage.go_ref_count > 0 && (
                    <li>GO annotations: {refUsage.go_ref_count}</li>
                  )}
                  {refUsage.ref_link_count > 0 && (
                    <li>Reference links: {refUsage.ref_link_count}</li>
                  )}
                  {refUsage.refprop_feat_count > 0 && (
                    <li>Feature links: {refUsage.refprop_feat_count}</li>
                  )}
                </ul>
                <p>
                  To delete this reference, first transfer or remove the linked data.
                </p>
              </div>
            ) : (
              <div style={styles.deleteSection}>
                <h4>Delete reference and manage CGDID</h4>
                <p style={styles.note}>
                  This reference is not linked to any information in the database.
                </p>

                <div style={styles.deleteForm}>
                  <div style={styles.formRow}>
                    <label style={styles.formLabel}>Delete this reference</label>
                    <label>
                      Delete log comments:{' '}
                      <input
                        type="text"
                        value={deleteLogComment}
                        onChange={(e) => setDeleteLogComment(e.target.value)}
                        style={{ ...styles.input, width: '300px' }}
                      />
                    </label>
                  </div>

                  <div style={styles.formRow}>
                    <label>
                      Make this CGDID a secondary CGDID for reference:{' '}
                    </label>
                    <input
                      type="text"
                      value={secondaryForId}
                      onChange={(e) => setSecondaryForId(e.target.value)}
                      style={{ ...styles.input, width: '150px', marginLeft: '0.5rem' }}
                    />
                    <select
                      value={secondaryIdType}
                      onChange={(e) => setSecondaryIdType(e.target.value)}
                      style={{ ...styles.select, marginLeft: '0.5rem' }}
                    >
                      <option value="CGDID">CGDID</option>
                      <option value="reference_no">reference_no</option>
                      <option value="PMID">PMID</option>
                    </select>
                  </div>

                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    style={styles.deleteButton}
                  >
                    Delete Reference
                  </button>
                </div>
              </div>
            )}
          </div>

          {results.length > 1 && (
            <button
              onClick={() => {
                setSelectedRef(null);
                setRefUsage(null);
              }}
              style={styles.backButton}
            >
              Back to Results
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '1rem auto',
    padding: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #333',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.25rem',
    fontSize: '0.9rem',
  },
  link: {
    color: '#0066cc',
  },
  criteriaBox: {
    backgroundColor: '#e3f2fd',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #90caf9',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  success: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    whiteSpace: 'pre-line',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  resultsSection: {
    marginTop: '1rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    border: '1px solid #ddd',
    padding: '0.5rem',
    textAlign: 'left',
    backgroundColor: '#f0f0f0',
  },
  td: {
    border: '1px solid #ddd',
    padding: '0.5rem',
    textAlign: 'left',
  },
  tr: {
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#0066cc',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
  },
  detailsSection: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#fafafa',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  citationBlock: {
    marginBottom: '1rem',
    padding: '0.5rem',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  pmidText: {
    fontWeight: 'normal',
  },
  citationLinks: {
    marginTop: '0.25rem',
  },
  infoTable: {
    marginBottom: '1rem',
  },
  infoLabel: {
    fontWeight: 'bold',
    paddingRight: '1rem',
    width: '150px',
  },
  abstractBlock: {
    marginBottom: '1rem',
    padding: '0.5rem',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  actionsSection: {
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #ccc',
  },
  inUseWarning: {
    backgroundColor: '#fff3e0',
    padding: '1rem',
    borderRadius: '4px',
    border: '1px solid #ffb74d',
  },
  deleteSection: {
    backgroundColor: '#ffebee',
    padding: '1rem',
    borderRadius: '4px',
    border: '1px solid #ef9a9a',
  },
  note: {
    color: '#666',
    marginBottom: '1rem',
  },
  deleteForm: {
    marginTop: '1rem',
  },
  formRow: {
    marginBottom: '0.5rem',
  },
  input: {
    padding: '0.375rem 0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  select: {
    padding: '0.375rem 0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  addUrlSection: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    marginBottom: '1rem',
  },
  addUrlForm: {
    marginTop: '0.5rem',
  },
  formLabel: {
    display: 'inline-block',
    width: '80px',
    fontWeight: 'bold',
  },
  addButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
};

export default ReferenceSearchResultsPage;

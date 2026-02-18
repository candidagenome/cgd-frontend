/**
 * Reference Search Page
 *
 * Allows curators to search for references by various criteria:
 * - PubMed ID
 * - Reference number
 * - CGDID (dbxref_id)
 * - Volume/Page
 * - Author name
 * - Keywords in title/abstract
 *
 * From search results, curators can:
 * - View/edit reference details
 * - Delete references (if not in use)
 * - Transfer annotations (if in use)
 */
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import referenceCurationApi from '../../api/referenceCurationApi';

function ReferenceSearchPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Search form state
  const [searchType, setSearchType] = useState('pubmed');
  const [pubmed, setPubmed] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [dbxrefId, setDbxrefId] = useState('');
  const [volume, setVolume] = useState('');
  const [page, setPage] = useState('');
  const [author1, setAuthor1] = useState('');
  const [author2, setAuthor2] = useState('');
  const [keyword, setKeyword] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [yearRange, setYearRange] = useState({ min_year: 1900, max_year: 2026 });

  // Results state
  const [results, setResults] = useState([]);
  const [selectedRef, setSelectedRef] = useState(null);
  const [refUsage, setRefUsage] = useState(null);

  // Delete form state
  const [deleteLogComment, setDeleteLogComment] = useState('');
  const [makeSecondary, setMakeSecondary] = useState(false);
  const [secondaryForId, setSecondaryForId] = useState('');
  const [secondaryIdType, setSecondaryIdType] = useState('CGDID');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Load year range on mount
  useEffect(() => {
    const loadYearRange = async () => {
      try {
        const data = await referenceCurationApi.getYearRange();
        setYearRange(data);
        setMinYear(data.min_year.toString());
        setMaxYear(data.max_year.toString());
      } catch (err) {
        console.error('Failed to load year range:', err);
      }
    };
    loadYearRange();
  }, []);

  // Handle URL params for direct search
  useEffect(() => {
    const pmid = searchParams.get('pubmed');
    const refNo = searchParams.get('reference_no') || searchParams.get('refNo');
    const dbid = searchParams.get('dbid') || searchParams.get('dbxref_id');

    if (pmid) {
      setPubmed(pmid);
      setSearchType('pubmed');
      handleSearch({ pubmed: parseInt(pmid, 10) });
    } else if (refNo) {
      setReferenceNo(refNo);
      setSearchType('reference_no');
      handleSearch({ reference_no: parseInt(refNo, 10) });
    } else if (dbid) {
      setDbxrefId(dbid);
      setSearchType('dbxref_id');
      handleSearch({ dbxref_id: dbid });
    }
  }, [searchParams]);

  const handleSearch = async (overrideParams = null) => {
    console.log('handleSearch called, searchType:', searchType, 'pubmed:', pubmed);
    setLoading(true);
    setError(null);
    setMessage(null);
    setSelectedRef(null);
    setRefUsage(null);

    try {
      let params = overrideParams;

      if (!params) {
        params = {};

        if (searchType === 'pubmed' && pubmed) {
          params.pubmed = parseInt(pubmed, 10);
        } else if (searchType === 'reference_no' && referenceNo) {
          params.reference_no = parseInt(referenceNo, 10);
        } else if (searchType === 'dbxref_id' && dbxrefId) {
          params.dbxref_id = dbxrefId;
        } else if (searchType === 'citation' && volume && page) {
          params.volume = volume;
          params.page = page;
        } else if (searchType === 'keyword') {
          if (author1) params.author = author1;
          if (keyword) params.keyword = keyword;
          if (minYear) params.min_year = parseInt(minYear, 10);
          if (maxYear) params.max_year = parseInt(maxYear, 10);
        }
      }

      console.log('Search params:', params);

      if (Object.keys(params).length === 0) {
        setError('Please enter search criteria');
        setLoading(false);
        return;
      }

      console.log('Calling searchReferences API...');
      const data = await referenceCurationApi.searchReferences(params);
      console.log('API response:', data);
      setResults(data.results);

      if (data.results.length === 0) {
        setMessage('No references found matching your search criteria.');
      } else if (data.results.length === 1) {
        // Auto-select single result
        await loadReferenceDetails(data.results[0].reference_no);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

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
      if (makeSecondary && secondaryForId) {
        // Need to resolve the ID to a reference_no
        let targetRefNo;
        if (secondaryIdType === 'reference_no') {
          targetRefNo = parseInt(secondaryForId, 10);
        } else {
          // Search for the reference first
          const searchParams = secondaryIdType === 'CGDID'
            ? { dbxref_id: secondaryForId }
            : { pubmed: parseInt(secondaryForId, 10) };
          const searchResult = await referenceCurationApi.searchReferences(searchParams);
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Reference Search</h1>
        <div style={styles.userInfo}>
          <span>Curator: {user?.first_name} {user?.last_name}</span>
          <Link to="/curation" style={styles.link}>Return to Curator Central</Link>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {message && <div style={styles.success}>{message}</div>}

      {/* Search Form */}
      <div style={styles.searchSection}>
        <p style={styles.description}>
          Search for a reference to view details, edit information, or delete if not in use.
        </p>

        {/* Search by PubMed */}
        <div style={styles.searchRow}>
          <div style={styles.searchLabel}>
            <strong>Search by PubMed ID</strong>
          </div>
          <div style={styles.searchInput}>
            <input
              type="text"
              value={pubmed}
              onChange={(e) => {
                setPubmed(e.target.value);
                setSearchType('pubmed');
              }}
              style={styles.input}
              placeholder="e.g., 12345678"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !pubmed}
              style={styles.searchButton}
            >
              Search
            </button>
          </div>
        </div>

        <hr style={styles.hr} />

        {/* Search by Reference No */}
        <div style={styles.searchRow}>
          <div style={styles.searchLabel}>
            <strong>Search by Reference Number</strong>
          </div>
          <div style={styles.searchInput}>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => {
                setReferenceNo(e.target.value);
                setSearchType('reference_no');
              }}
              style={styles.input}
              placeholder="e.g., 12345"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !referenceNo}
              style={styles.searchButton}
            >
              Search
            </button>
          </div>
        </div>

        <hr style={styles.hr} />

        {/* Search by CGDID */}
        <div style={styles.searchRow}>
          <div style={styles.searchLabel}>
            <strong>Search by CGDID</strong>
          </div>
          <div style={styles.searchInput}>
            <input
              type="text"
              value={dbxrefId}
              onChange={(e) => {
                setDbxrefId(e.target.value);
                setSearchType('dbxref_id');
              }}
              style={styles.input}
              placeholder="e.g., CGD_REF:CAL0000001"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !dbxrefId}
              style={styles.searchButton}
            >
              Search
            </button>
          </div>
        </div>

        <hr style={styles.hr} />

        {/* Search by Citation */}
        <div style={styles.searchRow}>
          <div style={styles.searchLabel}>
            <strong>Search by Citation</strong>
          </div>
          <div style={styles.searchInput}>
            <label>
              Volume:{' '}
              <input
                type="text"
                value={volume}
                onChange={(e) => {
                  setVolume(e.target.value);
                  setSearchType('citation');
                }}
                style={{ ...styles.input, width: '80px' }}
              />
            </label>
            <label style={{ marginLeft: '1rem' }}>
              Page:{' '}
              <input
                type="text"
                value={page}
                onChange={(e) => {
                  setPage(e.target.value);
                  setSearchType('citation');
                }}
                style={{ ...styles.input, width: '80px' }}
              />
            </label>
            <button
              onClick={() => handleSearch()}
              disabled={loading || !volume || !page}
              style={styles.searchButton}
            >
              Search
            </button>
          </div>
        </div>

        <hr style={styles.hr} />

        {/* Search by Author/Keyword */}
        <div style={styles.searchRow}>
          <div style={styles.searchLabel}>
            <strong>Search by Author or Keyword</strong>
          </div>
          <div style={styles.searchInputColumn}>
            <div style={styles.formRow}>
              <label>
                Author (Last Name, First Initial):{' '}
                <input
                  type="text"
                  value={author1}
                  onChange={(e) => {
                    setAuthor1(e.target.value);
                    setSearchType('keyword');
                  }}
                  style={styles.input}
                  placeholder="e.g., Smith J"
                />
              </label>
            </div>
            <div style={styles.formRow}>
              <label>
                Keyword in Title/Abstract:{' '}
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setSearchType('keyword');
                  }}
                  style={styles.input}
                  placeholder="e.g., biofilm"
                />
              </label>
            </div>
            <div style={styles.formRow}>
              <label>
                From year:{' '}
                <select
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  style={styles.select}
                >
                  {Array.from(
                    { length: yearRange.max_year - yearRange.min_year + 1 },
                    (_, i) => yearRange.min_year + i
                  ).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </label>
              <label style={{ marginLeft: '1rem' }}>
                through:{' '}
                <select
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                  style={styles.select}
                >
                  {Array.from(
                    { length: yearRange.max_year - yearRange.min_year + 1 },
                    (_, i) => yearRange.min_year + i
                  ).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </label>
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading || (!author1 && !keyword)}
              style={styles.searchButton}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && <div style={styles.loading}>Searching...</div>}

      {results.length > 1 && !selectedRef && (
        <div style={styles.resultsSection}>
          <h3>Search Results ({results.length} references found)</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Reference No</th>
                <th>Citation</th>
                <th>Source</th>
                <th>Status</th>
                <th>PubMed</th>
                <th>CGDID</th>
              </tr>
            </thead>
            <tbody>
              {results.map((ref) => (
                <tr key={ref.reference_no}>
                  <td>
                    <button
                      onClick={() => loadReferenceDetails(ref.reference_no)}
                      style={styles.linkButton}
                    >
                      {ref.reference_no}
                    </button>
                  </td>
                  <td>{ref.citation || ref.title}</td>
                  <td>{ref.source}</td>
                  <td>{ref.status}</td>
                  <td>{ref.pubmed || '-'}</td>
                  <td>{ref.dbxref_id || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Reference Details */}
      {selectedRef && (
        <div style={styles.detailsSection}>
          <h3>Reference Details</h3>

          <div style={styles.citationBlock}>
            <strong>{formatCitation(selectedRef)}</strong>
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
                <h4>Delete Reference</h4>
                <p style={styles.note}>
                  This reference is not linked to any information in the database.
                </p>

                <div style={styles.deleteForm}>
                  <div style={styles.formRow}>
                    <label>
                      Delete log comment:{' '}
                      <input
                        type="text"
                        value={deleteLogComment}
                        onChange={(e) => setDeleteLogComment(e.target.value)}
                        style={{ ...styles.input, width: '300px' }}
                        placeholder="Reason for deletion"
                      />
                    </label>
                  </div>

                  <div style={styles.formRow}>
                    <label>
                      <input
                        type="checkbox"
                        checked={makeSecondary}
                        onChange={(e) => setMakeSecondary(e.target.checked)}
                      />{' '}
                      Make this CGDID a secondary CGDID for reference:
                    </label>
                    <input
                      type="text"
                      value={secondaryForId}
                      onChange={(e) => setSecondaryForId(e.target.value)}
                      disabled={!makeSecondary}
                      style={{ ...styles.input, width: '150px', marginLeft: '0.5rem' }}
                    />
                    <select
                      value={secondaryIdType}
                      onChange={(e) => setSecondaryIdType(e.target.value)}
                      disabled={!makeSecondary}
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

          <button
            onClick={() => {
              setSelectedRef(null);
              setRefUsage(null);
            }}
            style={styles.backButton}
          >
            Back to Results
          </button>
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
  description: {
    marginBottom: '1rem',
    color: '#666',
  },
  searchSection: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  searchRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  searchLabel: {
    width: '200px',
    backgroundColor: '#e0e0e0',
    padding: '0.5rem',
    borderRadius: '4px',
    textAlign: 'center',
  },
  searchInput: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  searchInputColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  input: {
    padding: '0.375rem 0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '200px',
  },
  select: {
    padding: '0.375rem 0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  searchButton: {
    padding: '0.375rem 1rem',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #ccc',
    margin: '1rem 0',
  },
  formRow: {
    marginBottom: '0.5rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  resultsSection: {
    marginTop: '1.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
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
};

// Add table styles
const tableStyles = `
  .reference-search-table th,
  .reference-search-table td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
  }
  .reference-search-table th {
    background-color: #f0f0f0;
  }
  .reference-search-table tr:hover {
    background-color: #f5f5f5;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = tableStyles;
  document.head.appendChild(styleSheet);
}

export default ReferenceSearchPage;

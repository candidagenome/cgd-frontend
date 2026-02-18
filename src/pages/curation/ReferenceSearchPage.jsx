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
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import referenceCurationApi from '../../api/referenceCurationApi';

function ReferenceSearchPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search form state
  const [searchType, setSearchType] = useState('pubmed');
  const [pubmed, setPubmed] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [dbxrefId, setDbxrefId] = useState('');
  const [volume, setVolume] = useState('');
  const [page, setPage] = useState('');
  const [author1, setAuthor1] = useState('');
  const [keyword, setKeyword] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [yearRange, setYearRange] = useState({ min_year: 1900, max_year: 2026 });

  // UI state
  const [error, setError] = useState(null);

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

  // Handle URL params for direct search - redirect to results page
  useEffect(() => {
    const pmid = searchParams.get('pubmed');
    const refNo = searchParams.get('reference_no') || searchParams.get('refNo');
    const dbid = searchParams.get('dbid') || searchParams.get('dbxref_id');

    if (pmid) {
      navigate(`/curation/reference/search/results?pubmed=${pmid}`);
    } else if (refNo) {
      navigate(`/curation/reference/search/results?reference_no=${refNo}`);
    } else if (dbid) {
      navigate(`/curation/reference/search/results?dbxref_id=${dbid}`);
    }
  }, [searchParams, navigate]);

  const handleSearch = () => {
    setError(null);

    // Build URL params based on search type
    const params = new URLSearchParams();

    if (searchType === 'pubmed' && pubmed) {
      params.set('pubmed', pubmed);
    } else if (searchType === 'reference_no' && referenceNo) {
      params.set('reference_no', referenceNo);
    } else if (searchType === 'dbxref_id' && dbxrefId) {
      params.set('dbxref_id', dbxrefId);
    } else if (searchType === 'citation' && volume && page) {
      params.set('volume', volume);
      params.set('page', page);
    } else if (searchType === 'keyword') {
      if (author1) params.set('author', author1);
      if (keyword) params.set('keyword', keyword);
      if (minYear) params.set('min_year', minYear);
      if (maxYear) params.set('max_year', maxYear);
    }

    if (params.toString() === '') {
      setError('Please enter search criteria');
      return;
    }

    // Navigate to results page with search params
    navigate(`/curation/reference/search/results?${params.toString()}`);
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
              disabled={!pubmed}
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
              disabled={!referenceNo}
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
              disabled={!dbxrefId}
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
              disabled={!volume || !page}
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
              disabled={!author1 && !keyword}
              style={styles.searchButton}
            >
              Search
            </button>
          </div>
        </div>
      </div>
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
};

export default ReferenceSearchPage;

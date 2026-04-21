/**
 * Literature Guide Todo List Page
 *
 * Displays references that need curation, filtered by status and year.
 * Mirrors legacy curateLitTodo.pl functionality.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import todoListApi from '../../api/todoListApi';
import litguideCurationApi from '../../api/litguideCurationApi';

function LitGuideTodoListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [years, setYears] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('High Priority');
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // PMID search state
  const [pmidSearch, setPmidSearch] = useState('');
  const [pmidSearching, setPmidSearching] = useState(false);
  const [pmidError, setPmidError] = useState(null);

  // Load available years and statuses on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [yearsData, statusesData] = await Promise.all([
          todoListApi.getLitguideYears(),
          todoListApi.getLitguideStatuses(),
        ]);
        setYears(yearsData.years);
        setStatuses(statusesData.statuses);
      } catch (err) {
        setError('Failed to load filter options');
      }
    };

    loadFilters();
  }, []);

  // Load todo list when filters change
  useEffect(() => {
    const loadTodoList = async () => {
      setLoading(true);
      setError(null);

      try {
        const yearParam = selectedYear ? parseInt(selectedYear, 10) : null;
        const data = await todoListApi.getLitguideTodoList(
          selectedStatus,
          yearParam,
          100
        );
        // Sort by date_last_reviewed ascending (oldest first)
        const sortedItems = [...data.items].sort((a, b) => {
          const dateA = a.date_last_reviewed || '';
          const dateB = b.date_last_reviewed || '';
          return dateA.localeCompare(dateB);
        });
        setItems(sortedItems);
        setTotalCount(data.total_count);
      } catch (err) {
        setError('Failed to load literature guide todo list');
      } finally {
        setLoading(false);
      }
    };

    loadTodoList();
  }, [selectedStatus, selectedYear]);

  // Handle PMID search
  const handlePmidSearch = async (e) => {
    e.preventDefault();
    const pmid = pmidSearch.trim();
    if (!pmid) return;

    setPmidSearching(true);
    setPmidError(null);

    try {
      // Search for the reference by PMID
      const data = await litguideCurationApi.searchReferences(pmid);
      if (data.references && data.references.length > 0) {
        // Find the exact PMID match
        const exactMatch = data.references.find(
          (ref) => ref.pubmed === pmid || ref.pubmed === parseInt(pmid, 10)
        );
        if (exactMatch) {
          navigate(`/curation/litguide/${exactMatch.reference_no}`);
        } else {
          navigate(`/curation/litguide/${data.references[0].reference_no}`);
        }
      } else {
        setPmidError(`No reference found for PMID: ${pmid}`);
      }
    } catch (err) {
      setPmidError('Failed to search for PMID');
    } finally {
      setPmidSearching(false);
    }
  };

  return (
    <div className="litguide-todo-list-page" style={styles.container}>
      {/* CSS for visited link styling */}
      <style>{`
        .litguide-curate-link {
          color: #337ab7;
          text-decoration: none;
          white-space: nowrap;
        }
        .litguide-curate-link:visited {
          color: #800080;
        }
        .litguide-curate-link:hover {
          text-decoration: underline;
        }
      `}</style>
      <div style={styles.header}>
        <h1>Literature Guide Todo List</h1>
        <div style={styles.headerRight}>
          <span>Curator: {user?.first_name} {user?.last_name}</span>
          <Link to="/curation" style={styles.headerLink}>
            Curator Central
          </Link>
        </div>
      </div>

      <div style={styles.controls}>
        <div style={styles.filterGroup}>
          <label htmlFor="status-select" style={styles.label}>
            <strong>Curation Status:</strong>
          </label>
          <select
            id="status-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={styles.select}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label htmlFor="year-select" style={styles.label}>
            <strong>Year:</strong>
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={styles.select}
          >
            <option value="">Any Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <form onSubmit={handlePmidSearch} style={styles.pmidSearchForm}>
            <input
              type="text"
              value={pmidSearch}
              onChange={(e) => setPmidSearch(e.target.value)}
              placeholder="Search by PMID..."
              style={styles.pmidInput}
            />
            <button
              type="submit"
              disabled={pmidSearching}
              style={styles.pmidButton}
            >
              {pmidSearching ? '...' : 'Go'}
            </button>
          </form>
          {pmidError && <div style={styles.pmidError}>{pmidError}</div>}
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : (
        <div style={styles.results}>
          <p style={styles.summary}>
            <strong>Status:</strong> {selectedStatus}
            {selectedYear && <> | <strong>Year:</strong> {selectedYear}</>}
            {' | '}
            <strong>Total references:</strong> {totalCount}
          </p>

          {items.length === 0 ? (
            <p style={styles.noResults}>No references found matching the selected criteria.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Ref #</th>
                  <th style={styles.th}>PubMed</th>
                  <th style={styles.th}>Year</th>
                  <th style={styles.th}>Citation</th>
                  <th style={styles.th}>Last Reviewed</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.reference_no}>
                    <td style={styles.td}>{item.reference_no}</td>
                    <td style={styles.td}>
                      {item.pubmed ? (
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${item.pubmed}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.pubmed}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td style={styles.td}>{item.year}</td>
                    <td style={styles.tdCitation}>
                      <Link to={`/reference/${item.reference_no}`}>
                        {item.citation.length > 100
                          ? item.citation.substring(0, 100) + '...'
                          : item.citation}
                      </Link>
                    </td>
                    <td style={styles.td}>{item.date_last_reviewed || '-'}</td>
                    <td style={styles.td}>
                      <a
                        href={`/curation/litguide/${item.reference_no}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="litguide-curate-link"
                      >
                        Curate
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '1rem auto',
    padding: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '2px solid #333',
    paddingBottom: '0.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.9rem',
  },
  headerLink: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    textDecoration: 'none',
    color: '#333',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  label: {
    whiteSpace: 'nowrap',
  },
  select: {
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    minWidth: '150px',
  },
  pmidSearchForm: {
    display: 'flex',
    gap: '0.25rem',
  },
  pmidInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '180px',
  },
  pmidButton: {
    padding: '0.5rem 0.75rem',
    fontSize: '1rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  pmidError: {
    color: '#c00',
    fontSize: '0.85rem',
    marginLeft: '0.5rem',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c00',
    marginBottom: '1rem',
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
  },
  results: {
    marginTop: '1rem',
  },
  summary: {
    marginBottom: '1rem',
    padding: '0.5rem',
    backgroundColor: '#e8f4e8',
    borderRadius: '4px',
  },
  noResults: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.5rem',
    borderBottom: '2px solid #333',
    backgroundColor: '#f5f5f5',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '0.5rem',
    borderBottom: '1px solid #ddd',
    verticalAlign: 'top',
  },
  tdCitation: {
    padding: '0.5rem',
    borderBottom: '1px solid #ddd',
    verticalAlign: 'top',
    maxWidth: '400px',
  },
  actionLink: {
    whiteSpace: 'nowrap',
  },
};

export default LitGuideTodoListPage;

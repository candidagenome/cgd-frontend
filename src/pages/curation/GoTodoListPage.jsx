/**
 * GO Todo List Page
 *
 * Displays GO annotations that need review, filtered by year.
 * Mirrors legacy curateGOtodo.pl functionality.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import todoListApi from '../../api/todoListApi';

function GoTodoListPage() {
  const { user } = useAuth();

  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load available years on mount
  useEffect(() => {
    const loadYears = async () => {
      try {
        const data = await todoListApi.getGoYears();
        setYears(data.years);
        if (data.years.length > 0) {
          setSelectedYear(data.years[0]); // Default to most recent year
        }
      } catch (err) {
        setError('Failed to load years');
      }
    };

    loadYears();
  }, []);

  // Load todo list when year changes
  useEffect(() => {
    if (!selectedYear) return;

    const loadTodoList = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await todoListApi.getGoTodoList(selectedYear);
        setItems(data.items);
      } catch (err) {
        setError('Failed to load GO todo list');
      } finally {
        setLoading(false);
      }
    };

    loadTodoList();
  }, [selectedYear]);

  // Group items by organism
  const itemsByOrganism = items.reduce((acc, item) => {
    const org = item.organism_name || 'Unknown';
    if (!acc[org]) acc[org] = [];
    acc[org].push(item);
    return acc;
  }, {});

  return (
    <div className="go-todo-list-page" style={styles.container}>
      <div style={styles.header}>
        <h1>GO Todo List</h1>
        <p>Welcome, {user?.first_name} {user?.last_name}</p>
      </div>

      <div style={styles.controls}>
        <label htmlFor="year-select" style={styles.label}>
          <strong>Select Year:</strong>
        </label>
        <select
          id="year-select"
          value={selectedYear || ''}
          onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          style={styles.select}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <Link to="/curation" style={styles.backLink}>
          Back to Curator Central
        </Link>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : (
        <div style={styles.results}>
          <p>
            <strong>Total annotations last reviewed in {selectedYear}:</strong> {items.length}
          </p>

          {Object.entries(itemsByOrganism).map(([organism, orgItems]) => (
            <section key={organism} style={styles.section}>
              <h3 style={styles.organismHeader}>{organism} ({orgItems.length})</h3>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Feature</th>
                    <th style={styles.th}>Gene</th>
                    <th style={styles.th}>GO ID</th>
                    <th style={styles.th}>Term</th>
                    <th style={styles.th}>Aspect</th>
                    <th style={styles.th}>Evidence</th>
                    <th style={styles.th}>Last Reviewed</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orgItems.map((item) => (
                    <tr key={item.go_annotation_no}>
                      <td style={styles.td}>
                        <Link to={`/locus/${item.feature_name}`}>
                          {item.feature_name}
                        </Link>
                      </td>
                      <td style={styles.td}>{item.gene_name || '-'}</td>
                      <td style={styles.td}>GO:{item.goid}</td>
                      <td style={styles.td}>{item.go_term}</td>
                      <td style={styles.td}>{item.go_aspect}</td>
                      <td style={styles.td}>{item.go_evidence}</td>
                      <td style={styles.td}>{item.date_last_reviewed}</td>
                      <td style={styles.td}>
                        <Link to={`/curation/go/${item.feature_name}`}>
                          Curate
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
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
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  label: {
    marginRight: '0.5rem',
  },
  select: {
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  backLink: {
    marginLeft: 'auto',
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
  section: {
    marginBottom: '2rem',
  },
  organismHeader: {
    backgroundColor: '#CCCCFF',
    padding: '0.5rem',
    margin: '0 0 0.5rem 0',
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
  },
  td: {
    padding: '0.5rem',
    borderBottom: '1px solid #ddd',
  },
};

export default GoTodoListPage;

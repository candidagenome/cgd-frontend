/**
 * Database Search Page
 *
 * Search phenotypes and view associated features.
 * Mirrors functionality from legacy SearchDB.pm.
 */
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import dbSearchApi from '../../api/dbSearchApi';

function DbSearchPage() {
  useAuth();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [selectedPhenotype, setSelectedPhenotype] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async () => {
    if (!query || query.length < 2) {
      setError('Query must be at least 2 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSelectedPhenotype(null);

    try {
      const data = await dbSearchApi.searchPhenotypes(query);
      setSearchResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Search failed');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectPhenotype = useCallback(async (phenotypeNo) => {
    setLoading(true);
    setError('');

    try {
      const data = await dbSearchApi.getPhenotypeDetails(phenotypeNo);
      setSelectedPhenotype(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load phenotype details');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Database Search</h1>

      <p style={styles.description}>
        Search phenotypes by observable, qualifier, experiment type, or mutant type.
        Click on a phenotype to see associated features.
      </p>

      <div style={styles.searchSection}>
        <div style={styles.searchRow}>
          <label htmlFor="query" style={styles.label}>Search Term:</label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter search term (min 2 characters)"
            style={styles.input}
          />
          <button
            onClick={handleSearch}
            disabled={loading || query.length < 2}
            style={styles.button}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.resultsContainer}>
        {/* Search Results Panel */}
        <div style={styles.resultsPanel}>
          <h2 style={styles.panelHeader}>Phenotype Search Results</h2>

          {searchResults && (
            <div>
              <p style={styles.resultCount}>
                Found {searchResults.count} phenotype(s) matching &quot;{searchResults.query}&quot;
              </p>

              {searchResults.results.length > 0 ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Phenotype No</th>
                      <th style={styles.th}>Display</th>
                      <th style={styles.th}>Experiment Type</th>
                      <th style={styles.th}>Source</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.results.map((p) => (
                      <tr
                        key={p.phenotype_no}
                        style={
                          selectedPhenotype?.phenotype_no === p.phenotype_no
                            ? styles.selectedRow
                            : styles.tr
                        }
                      >
                        <td style={styles.td}>{p.phenotype_no}</td>
                        <td style={styles.td}>{p.display_text}</td>
                        <td style={styles.td}>{p.experiment_type}</td>
                        <td style={styles.td}>{p.source}</td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleSelectPhenotype(p.phenotype_no)}
                            style={styles.selectButton}
                          >
                            View Features
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No phenotypes found.</p>
              )}
            </div>
          )}

          {!searchResults && !loading && (
            <p style={styles.placeholder}>
              Enter a search term and click Search to find phenotypes.
            </p>
          )}
        </div>

        {/* Phenotype Details Panel */}
        <div style={styles.detailsPanel}>
          <h2 style={styles.panelHeader}>Phenotype Details</h2>

          {selectedPhenotype ? (
            <div>
              <div style={styles.detailSection}>
                <h3 style={styles.detailHeader}>Phenotype Information</h3>
                <table style={styles.detailTable}>
                  <tbody>
                    <tr>
                      <td style={styles.detailLabel}>Phenotype No:</td>
                      <td style={styles.detailValue}>{selectedPhenotype.phenotype_no}</td>
                    </tr>
                    <tr>
                      <td style={styles.detailLabel}>Observable:</td>
                      <td style={styles.detailValue}>{selectedPhenotype.observable || '-'}</td>
                    </tr>
                    <tr>
                      <td style={styles.detailLabel}>Qualifier:</td>
                      <td style={styles.detailValue}>{selectedPhenotype.qualifier || '-'}</td>
                    </tr>
                    <tr>
                      <td style={styles.detailLabel}>Experiment Type:</td>
                      <td style={styles.detailValue}>{selectedPhenotype.experiment_type}</td>
                    </tr>
                    <tr>
                      <td style={styles.detailLabel}>Mutant Type:</td>
                      <td style={styles.detailValue}>{selectedPhenotype.mutant_type}</td>
                    </tr>
                    <tr>
                      <td style={styles.detailLabel}>Source:</td>
                      <td style={styles.detailValue}>{selectedPhenotype.source}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={styles.detailSection}>
                <h3 style={styles.detailHeader}>
                  Associated Features ({selectedPhenotype.feature_count})
                </h3>

                {selectedPhenotype.features.length > 0 ? (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Feature No</th>
                        <th style={styles.th}>Feature Name</th>
                        <th style={styles.th}>Gene Name</th>
                        <th style={styles.th}>Annotation No</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPhenotype.features.map((f) => (
                        <tr key={f.pheno_annotation_no} style={styles.tr}>
                          <td style={styles.td}>{f.feature_no}</td>
                          <td style={styles.td}>
                            <Link to={`/locus/${f.feature_name}`}>{f.feature_name}</Link>
                          </td>
                          <td style={styles.td}>{f.gene_name || '-'}</td>
                          <td style={styles.td}>{f.pheno_annotation_no}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No features associated with this phenotype.</p>
                )}
              </div>
            </div>
          ) : (
            <p style={styles.placeholder}>
              Select a phenotype from the search results to view details.
            </p>
          )}
        </div>
      </div>

      <div style={styles.backLink}>
        <Link to="/curation">Back to Curator Central</Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '1rem auto',
    padding: '1rem',
  },
  title: {
    marginBottom: '0.5rem',
  },
  description: {
    color: '#666',
    marginBottom: '1.5rem',
  },
  searchSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  label: {
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  input: {
    flex: 1,
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  button: {
    padding: '0.5rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#fee',
    border: '1px solid #c00',
    borderRadius: '4px',
    color: '#c00',
    marginBottom: '1rem',
  },
  resultsContainer: {
    display: 'flex',
    gap: '1.5rem',
  },
  resultsPanel: {
    flex: 1,
    minWidth: 0,
  },
  detailsPanel: {
    flex: 1,
    minWidth: 0,
  },
  panelHeader: {
    backgroundColor: '#CCCCFF',
    padding: '0.5rem',
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
  },
  resultCount: {
    marginBottom: '1rem',
    fontStyle: 'italic',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    backgroundColor: '#e0e0e0',
    padding: '0.5rem',
    textAlign: 'left',
    borderBottom: '2px solid #999',
  },
  tr: {
    borderBottom: '1px solid #ddd',
  },
  selectedRow: {
    borderBottom: '1px solid #ddd',
    backgroundColor: '#e6f3ff',
  },
  td: {
    padding: '0.5rem',
    verticalAlign: 'top',
  },
  selectButton: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.85rem',
    backgroundColor: '#4a90d9',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  placeholder: {
    color: '#666',
    fontStyle: 'italic',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  },
  detailSection: {
    marginBottom: '1.5rem',
  },
  detailHeader: {
    fontSize: '1rem',
    marginBottom: '0.5rem',
    borderBottom: '1px solid #ccc',
    paddingBottom: '0.25rem',
  },
  detailTable: {
    width: '100%',
  },
  detailLabel: {
    fontWeight: 'bold',
    padding: '0.25rem 0.5rem 0.25rem 0',
    verticalAlign: 'top',
    width: '140px',
  },
  detailValue: {
    padding: '0.25rem 0',
  },
  backLink: {
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid #ddd',
  },
};

export default DbSearchPage;

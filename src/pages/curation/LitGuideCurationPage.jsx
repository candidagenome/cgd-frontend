/**
 * Literature Guide Curation Page
 *
 * Feature-centric literature curation interface.
 * - Search for features
 * - View curated and uncurated references
 * - Add/remove topic associations
 * - Set curation status
 *
 * Mirrors legacy LitGuideCurationPage.pm functionality.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import litguideCurationApi from '../../api/litguideCurationApi';

function LitGuideCurationPage() {
  const { featureName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Search state
  const [featureSearch, setFeatureSearch] = useState('');
  const [refSearch, setRefSearch] = useState('');
  const [refSearchResults, setRefSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Feature and literature state
  const [featureData, setFeatureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Available options
  const [topics, setTopics] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // Add topic form state
  const [selectedRef, setSelectedRef] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');

  // Load available topics and statuses
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [topicsData, statusesData] = await Promise.all([
          litguideCurationApi.getTopics(),
          litguideCurationApi.getStatuses(),
        ]);
        setTopics(topicsData.topics);
        setStatuses(statusesData.statuses);
      } catch (err) {
        console.error('Failed to load options:', err);
      }
    };

    loadOptions();
  }, []);

  // Load feature literature
  const loadFeatureLiterature = useCallback(async (identifier) => {
    if (!identifier) return;

    setLoading(true);
    setError(null);

    try {
      const data = await litguideCurationApi.getFeatureLiterature(identifier);
      setFeatureData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Feature '${identifier}' not found`);
      } else {
        setError('Failed to load feature literature');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load feature on mount if featureName provided
  useEffect(() => {
    if (featureName) {
      loadFeatureLiterature(featureName);
    }
  }, [featureName, loadFeatureLiterature]);

  // Handle feature search
  const handleFeatureSearch = (e) => {
    e.preventDefault();
    if (!featureSearch.trim()) return;
    navigate(`/curation/litguide/${featureSearch.trim()}`);
  };

  // Handle reference search
  const handleRefSearch = async (e) => {
    e.preventDefault();
    if (!refSearch.trim()) return;

    setSearching(true);
    try {
      const data = await litguideCurationApi.searchReferences(refSearch);
      setRefSearchResults(data);
    } catch (err) {
      setError('Reference search failed');
    } finally {
      setSearching(false);
    }
  };

  // Handle add topic association
  const handleAddTopic = async () => {
    if (!selectedRef || !selectedTopic) return;

    try {
      await litguideCurationApi.addTopicAssociation(
        featureData.feature_no,
        selectedRef.reference_no,
        selectedTopic
      );
      setSuccessMessage(`Topic '${selectedTopic}' added`);
      setSelectedRef(null);
      setSelectedTopic('');
      setRefSearchResults(null);
      setRefSearch('');
      loadFeatureLiterature(featureData.feature_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add topic');
    }
  };

  // Handle remove topic association
  const handleRemoveTopic = async (refpropFeatNo) => {
    if (!window.confirm('Are you sure you want to remove this topic association?')) return;

    try {
      await litguideCurationApi.removeTopicAssociation(refpropFeatNo);
      setSuccessMessage('Topic association removed');
      loadFeatureLiterature(featureData.feature_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove topic');
    }
  };

  // Handle set curation status
  const handleSetStatus = async (referenceNo, status) => {
    try {
      await litguideCurationApi.setReferenceStatus(referenceNo, status);
      setSuccessMessage(`Curation status set to '${status}'`);
      loadFeatureLiterature(featureData.feature_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to set status');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Literature Guide Curation</h1>
        <div style={styles.headerRight}>
          <span>Curator: {user?.first_name} {user?.last_name}</span>
          <Link to="/curation/litguide/todo" style={styles.headerLink}>
            LitGuide Todo
          </Link>
          <Link to="/curation" style={styles.headerLink}>
            Curator Central
          </Link>
        </div>
      </div>

      {successMessage && <div style={styles.success}>{successMessage}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* Feature Search */}
      <div style={styles.searchSection}>
        <h3>Find Feature</h3>
        <form onSubmit={handleFeatureSearch} style={styles.searchForm}>
          <input
            type="text"
            value={featureSearch}
            onChange={(e) => setFeatureSearch(e.target.value)}
            placeholder="Enter feature name or gene name..."
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>
            Search
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && <div style={styles.loading}>Loading feature literature...</div>}

      {/* Feature Literature */}
      {featureData && !loading && (
        <div style={styles.featureSection}>
          <div style={styles.featureHeader}>
            <h2>
              {featureData.feature_name}
              {featureData.gene_name && ` (${featureData.gene_name})`}
            </h2>
            <Link to={`/locus/${featureData.feature_name}`} style={styles.headerLink}>
              View Locus Page
            </Link>
          </div>

          {/* Add Topic Association */}
          <div style={styles.addSection}>
            <h3 style={styles.sectionHeader}>Add Literature Topic</h3>

            {/* Reference Search */}
            <div style={styles.refSearchRow}>
              <form onSubmit={handleRefSearch} style={styles.searchForm}>
                <input
                  type="text"
                  value={refSearch}
                  onChange={(e) => setRefSearch(e.target.value)}
                  placeholder="Search by PubMed ID, title, or citation..."
                  style={styles.searchInput}
                />
                <button type="submit" disabled={searching} style={styles.searchButton}>
                  {searching ? 'Searching...' : 'Find Reference'}
                </button>
              </form>
            </div>

            {/* Reference Search Results */}
            {refSearchResults && (
              <div style={styles.refResults}>
                <h4>Select Reference ({refSearchResults.total} found)</h4>
                {refSearchResults.references.length === 0 ? (
                  <p>No references found.</p>
                ) : (
                  <div style={styles.refList}>
                    {refSearchResults.references.slice(0, 20).map((ref) => (
                      <div
                        key={ref.reference_no}
                        style={{
                          ...styles.refItem,
                          backgroundColor: selectedRef?.reference_no === ref.reference_no ? '#e6f3ff' : 'transparent',
                        }}
                        onClick={() => setSelectedRef(ref)}
                      >
                        <strong>
                          {ref.pubmed ? `PMID:${ref.pubmed}` : `Ref:${ref.reference_no}`}
                        </strong>
                        <span style={styles.refYear}>({ref.year || 'N/A'})</span>
                        <div style={styles.refTitle}>{ref.title || ref.citation}</div>
                        {ref.curation_status && (
                          <span style={styles.refStatus}>{ref.curation_status}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => setRefSearchResults(null)} style={styles.closeButton}>
                  Close
                </button>
              </div>
            )}

            {/* Selected Reference and Topic */}
            {selectedRef && (
              <div style={styles.selectedRefBox}>
                <p>
                  <strong>Selected:</strong>{' '}
                  {selectedRef.pubmed ? `PMID:${selectedRef.pubmed}` : `Ref:${selectedRef.reference_no}`}
                  {' - '}{selectedRef.title || selectedRef.citation}
                </p>
                <div style={styles.topicSelectRow}>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    style={styles.topicSelect}
                  >
                    <option value="">Select topic...</option>
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddTopic}
                    disabled={!selectedTopic}
                    style={styles.addButton}
                  >
                    Add Topic Association
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRef(null);
                      setSelectedTopic('');
                    }}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Curated Literature */}
          <div style={styles.literatureSection}>
            <h3 style={styles.sectionHeader}>
              Curated Literature ({featureData.curated?.length || 0})
            </h3>

            {featureData.curated?.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Reference</th>
                    <th style={styles.th}>Year</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Topics</th>
                  </tr>
                </thead>
                <tbody>
                  {featureData.curated.map((ref) => (
                    <tr key={ref.reference_no}>
                      <td style={styles.td}>
                        <Link to={`/reference/${ref.reference_no}`}>
                          {ref.pubmed ? `PMID:${ref.pubmed}` : `Ref:${ref.reference_no}`}
                        </Link>
                      </td>
                      <td style={styles.td}>{ref.year || '-'}</td>
                      <td style={styles.td}>{ref.title || ref.citation}</td>
                      <td style={styles.td}>
                        {ref.topics.map((topic) => (
                          <div key={topic.refprop_feat_no} style={styles.topicTag}>
                            {topic.topic}
                            <button
                              onClick={() => handleRemoveTopic(topic.refprop_feat_no)}
                              style={styles.removeTopicBtn}
                              title="Remove topic"
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.noItems}>No curated literature.</p>
            )}
          </div>

          {/* Uncurated Literature */}
          <div style={styles.literatureSection}>
            <h3 style={styles.sectionHeader}>
              Uncurated Literature ({featureData.uncurated?.length || 0})
            </h3>

            {featureData.uncurated?.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Reference</th>
                    <th style={styles.th}>Year</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {featureData.uncurated.map((ref) => (
                    <tr key={ref.reference_no}>
                      <td style={styles.td}>
                        <Link to={`/reference/${ref.reference_no}`}>
                          {ref.pubmed ? `PMID:${ref.pubmed}` : `Ref:${ref.reference_no}`}
                        </Link>
                      </td>
                      <td style={styles.td}>{ref.year || '-'}</td>
                      <td style={styles.td}>{ref.title || ref.citation}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => {
                            setSelectedRef(ref);
                            setRefSearchResults(null);
                          }}
                          style={styles.actionButton}
                        >
                          Add Topic
                        </button>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleSetStatus(ref.reference_no, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          style={styles.statusSelect}
                          defaultValue=""
                        >
                          <option value="">Set Status...</option>
                          {statuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.noItems}>No uncurated literature.</p>
            )}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!featureData && !loading && !featureName && (
        <div style={styles.noFeature}>
          <p>Search for a feature above to begin literature curation.</p>
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
  success: {
    padding: '1rem',
    backgroundColor: '#efe',
    border: '1px solid #cfc',
    borderRadius: '4px',
    color: '#060',
    marginBottom: '1rem',
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
  searchSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  searchForm: {
    display: 'flex',
    gap: '0.5rem',
  },
  searchInput: {
    flex: 1,
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  searchButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  featureSection: {
    marginTop: '1rem',
  },
  featureHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  addSection: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  sectionHeader: {
    backgroundColor: '#CCCCFF',
    padding: '0.5rem',
    margin: '0 0 1rem 0',
    fontSize: '1rem',
  },
  refSearchRow: {
    marginBottom: '1rem',
  },
  refResults: {
    padding: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '1rem',
    maxHeight: '400px',
    overflow: 'auto',
  },
  refList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  refItem: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  refYear: {
    marginLeft: '0.5rem',
    color: '#666',
  },
  refTitle: {
    fontSize: '0.9rem',
    color: '#333',
    marginTop: '0.25rem',
  },
  refStatus: {
    fontSize: '0.8rem',
    color: '#666',
    fontStyle: 'italic',
  },
  closeButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  selectedRefBox: {
    padding: '1rem',
    backgroundColor: '#e6f3ff',
    border: '1px solid #99c9ff',
    borderRadius: '4px',
    marginTop: '1rem',
  },
  topicSelectRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    marginTop: '0.5rem',
  },
  topicSelect: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '200px',
  },
  addButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#999',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  literatureSection: {
    marginBottom: '1.5rem',
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
    verticalAlign: 'top',
  },
  topicTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#e6f3ff',
    border: '1px solid #99c9ff',
    borderRadius: '4px',
    marginRight: '0.5rem',
    marginBottom: '0.25rem',
    fontSize: '0.85rem',
  },
  removeTopicBtn: {
    background: 'none',
    border: 'none',
    color: '#c00',
    cursor: 'pointer',
    padding: '0 0.25rem',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
  actionButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginRight: '0.5rem',
    fontSize: '0.85rem',
  },
  statusSelect: {
    padding: '0.25rem',
    fontSize: '0.85rem',
    border: '1px solid #ccc',
    borderRadius: '3px',
  },
  noItems: {
    color: '#666',
    fontStyle: 'italic',
    padding: '1rem',
  },
  noFeature: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  },
};

export default LitGuideCurationPage;

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
  const [pmidSearch, setPmidSearch] = useState('');
  const [pmidSearching, setPmidSearching] = useState(false);
  const [pmidError, setPmidError] = useState(null);
  const [refSearch, setRefSearch] = useState('');
  const [refSearchResults, setRefSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Feature and literature state (feature-centric view)
  const [featureData, setFeatureData] = useState(null);
  // Reference and literature state (reference-centric view)
  const [referenceData, setReferenceData] = useState(null);
  const [viewMode, setViewMode] = useState(null); // 'feature' or 'reference'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Available options
  const [topics, setTopics] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // Add feature form state (for reference view)
  const [newFeature, setNewFeature] = useState('');
  const [newFeatureTopic, setNewFeatureTopic] = useState('');

  // Unlink feature state (for reference view)
  const [unlinkFeature, setUnlinkFeature] = useState('');
  const [unlinking, setUnlinking] = useState(false);

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

  // Load feature literature (feature-centric view)
  const loadFeatureLiterature = useCallback(async (identifier) => {
    if (!identifier) return;

    setLoading(true);
    setError(null);
    setReferenceData(null);

    try {
      const data = await litguideCurationApi.getFeatureLiterature(identifier);
      setFeatureData(data);
      setViewMode('feature');
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

  // Load reference literature (reference-centric view)
  const loadReferenceLiterature = useCallback(async (referenceNo) => {
    if (!referenceNo) return;

    setLoading(true);
    setError(null);
    setFeatureData(null);

    try {
      const data = await litguideCurationApi.getReferenceLiterature(referenceNo);
      setReferenceData(data);
      setViewMode('reference');
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Reference '${referenceNo}' not found`);
      } else {
        setError('Failed to load reference literature');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount based on featureName type
  // Numeric = reference view, otherwise = feature view
  useEffect(() => {
    if (featureName) {
      // Check if it's a pure numeric value (reference_no)
      if (/^\d+$/.test(featureName)) {
        loadReferenceLiterature(featureName);
      } else {
        loadFeatureLiterature(featureName);
      }
    }
  }, [featureName, loadFeatureLiterature, loadReferenceLiterature]);

  // Handle feature search
  const handleFeatureSearch = (e) => {
    e.preventDefault();
    if (!featureSearch.trim()) return;
    navigate(`/curation/litguide/${featureSearch.trim()}`);
  };

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
        const exactMatch = data.references.find(ref => ref.pubmed === pmid || ref.pubmed === parseInt(pmid, 10));
        if (exactMatch) {
          // Navigate to reference-centric view using reference_no
          navigate(`/curation/litguide/${exactMatch.reference_no}`);
        } else {
          // If no exact match, use the first result
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
      if (viewMode === 'feature' && featureData) {
        loadFeatureLiterature(featureData.feature_no);
      } else if (viewMode === 'reference' && referenceData) {
        loadReferenceLiterature(referenceData.reference_no);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to set status');
    }
  };

  // Handle add feature to reference (reference view)
  const handleAddFeatureToReference = async () => {
    if (!referenceData || !newFeature || !newFeatureTopic) return;

    try {
      await litguideCurationApi.addFeatureToReference(
        referenceData.reference_no,
        newFeature,
        newFeatureTopic
      );
      setSuccessMessage(`Feature '${newFeature}' added with topic '${newFeatureTopic}'`);
      setNewFeature('');
      setNewFeatureTopic('');
      loadReferenceLiterature(referenceData.reference_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add feature');
    }
  };

  // Handle remove topic (works for both views)
  const handleRemoveTopicForReference = async (refpropFeatNo) => {
    if (!window.confirm('Are you sure you want to remove this topic association?')) return;

    try {
      await litguideCurationApi.removeTopicAssociation(refpropFeatNo);
      setSuccessMessage('Topic association removed');
      if (referenceData) {
        loadReferenceLiterature(referenceData.reference_no);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove topic');
    }
  };

  // Handle unlink feature from reference
  const handleUnlinkFeature = async () => {
    if (!referenceData || !unlinkFeature.trim()) return;

    // Parse multiple features (separated by | or space)
    const featureNames = unlinkFeature
      .split(/[|\s]+/)
      .map((f) => f.trim())
      .filter((f) => f);

    if (featureNames.length === 0) return;

    const confirmMsg =
      featureNames.length === 1
        ? `Are you sure you want to unlink '${featureNames[0]}' from this paper?`
        : `Are you sure you want to unlink ${featureNames.length} features from this paper?\n\nFeatures: ${featureNames.join(', ')}`;

    if (!window.confirm(confirmMsg)) return;

    setUnlinking(true);
    setError(null);

    const results = { success: [], failed: [] };

    for (const featureName of featureNames) {
      try {
        const result = await litguideCurationApi.unlinkFeatureFromReference(
          referenceData.reference_no,
          featureName
        );
        results.success.push(result.feature_name);
      } catch (err) {
        results.failed.push({
          name: featureName,
          error: err.response?.data?.detail || 'Unknown error',
        });
      }
    }

    setUnlinking(false);
    setUnlinkFeature('');

    if (results.success.length > 0) {
      setSuccessMessage(
        `Unlinked ${results.success.length} feature(s): ${results.success.join(', ')}`
      );
      loadReferenceLiterature(referenceData.reference_no);
      setTimeout(() => setSuccessMessage(null), 5000);
    }

    if (results.failed.length > 0) {
      setError(
        `Failed to unlink: ${results.failed.map((f) => `${f.name} (${f.error})`).join('; ')}`
      );
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

      {/* Search Section */}
      <div style={styles.searchSection}>
        <div style={styles.searchRow}>
          {/* Feature Search */}
          <div style={styles.searchBox}>
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

          {/* PMID Search */}
          <div style={styles.searchBox}>
            <h3>Find by PMID</h3>
            <form onSubmit={handlePmidSearch} style={styles.searchForm}>
              <input
                type="text"
                value={pmidSearch}
                onChange={(e) => setPmidSearch(e.target.value)}
                placeholder="Enter PMID..."
                style={styles.searchInput}
              />
              <button type="submit" disabled={pmidSearching} style={styles.searchButton}>
                {pmidSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
            {pmidError && <div style={styles.searchError}>{pmidError}</div>}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && <div style={styles.loading}>Loading...</div>}

      {/* Feature Literature (feature-centric view) */}
      {viewMode === 'feature' && featureData && !loading && (
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

      {/* Reference-centric View */}
      {viewMode === 'reference' && referenceData && !loading && (
        <div style={styles.referenceSection}>
          <div style={styles.referenceHeader}>
            <h2>
              {referenceData.pubmed ? `PMID:${referenceData.pubmed}` : `Reference ${referenceData.reference_no}`}
              <span style={styles.refYear}> ({referenceData.year || 'N/A'})</span>
            </h2>
            <div style={styles.headerActions}>
              <Link to={`/reference/${referenceData.reference_no}`} style={styles.headerLink}>
                View Reference Page
              </Link>
              <Link to={`/curation/reference/${referenceData.reference_no}`} style={styles.headerLink}>
                Reference Curation
              </Link>
            </div>
          </div>

          {/* Reference Details */}
          <div style={styles.refDetailsBox}>
            <p><strong>Title:</strong> {referenceData.title || 'N/A'}</p>
            <p><strong>Citation:</strong> {referenceData.citation || 'N/A'}</p>
            <p>
              <strong>Curation Status:</strong>{' '}
              <select
                value={referenceData.curation_status || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    handleSetStatus(referenceData.reference_no, e.target.value);
                  }
                }}
                style={styles.statusSelectInline}
              >
                <option value="">Not yet curated</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </p>
          </div>

          {/* Add Feature Form */}
          <div style={styles.addSection}>
            <h3 style={styles.sectionHeader}>Add Feature with Topic</h3>
            <div style={styles.addFeatureRow}>
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Feature name or gene name..."
                style={styles.featureInput}
              />
              <select
                value={newFeatureTopic}
                onChange={(e) => setNewFeatureTopic(e.target.value)}
                style={styles.topicSelect}
              >
                <option value="">Select topic...</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              <button
                onClick={handleAddFeatureToReference}
                disabled={!newFeature || !newFeatureTopic}
                style={styles.addButton}
              >
                Add Feature
              </button>
            </div>
          </div>

          {/* Unlink Feature Section */}
          {referenceData.pubmed && (
            <div style={styles.unlinkSection}>
              <h3 style={styles.unlinkHeader}>Unlink Feature from Paper</h3>
              <div style={styles.unlinkRow}>
                <input
                  type="text"
                  value={unlinkFeature}
                  onChange={(e) => setUnlinkFeature(e.target.value)}
                  placeholder="Feature name(s) to unlink..."
                  style={styles.unlinkInput}
                />
                <button
                  onClick={handleUnlinkFeature}
                  disabled={!unlinkFeature.trim() || unlinking}
                  style={styles.unlinkButton}
                >
                  {unlinking ? 'Unlinking...' : 'Unlink'}
                </button>
              </div>
              <p style={styles.unlinkHelp}>
                Separate multiple features with | or space. This will remove the link between the paper and feature(s), including any topic associations.
              </p>
            </div>
          )}

          {/* Features with Topics */}
          <div style={styles.literatureSection}>
            <h3 style={styles.sectionHeader}>
              Associated Features ({referenceData.features?.length || 0})
            </h3>

            {referenceData.features?.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Feature</th>
                    <th style={styles.th}>Gene Name</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Topics</th>
                    <th style={styles.th}>Curate</th>
                  </tr>
                </thead>
                <tbody>
                  {referenceData.features.map((feat) => (
                    <tr key={feat.feature_no}>
                      <td style={styles.td}>
                        <Link to={`/locus/${feat.feature_name}`}>
                          {feat.feature_name}
                        </Link>
                      </td>
                      <td style={styles.td}>{feat.gene_name || '-'}</td>
                      <td style={styles.td}>{feat.feature_type || '-'}</td>
                      <td style={styles.td}>
                        {feat.topics.map((topic) => (
                          <div key={topic.refprop_feat_no} style={styles.topicTag}>
                            {topic.topic}
                            <button
                              onClick={() => handleRemoveTopicForReference(topic.refprop_feat_no)}
                              style={styles.removeTopicBtn}
                              title="Remove topic"
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </td>
                      <td style={styles.td}>
                        <Link
                          to={`/curation/phenotype/${feat.feature_name}`}
                          style={styles.curateLink}
                        >
                          Phenotype
                        </Link>
                        {' | '}
                        <Link
                          to={`/curation/go/${feat.feature_name}`}
                          style={styles.curateLink}
                        >
                          GO
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.noItems}>No features associated with this reference yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!featureData && !referenceData && !loading && !featureName && (
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
  searchRow: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: '300px',
  },
  searchError: {
    marginTop: '0.5rem',
    color: '#c00',
    fontSize: '0.9rem',
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
  curateLink: {
    color: '#337ab7',
    textDecoration: 'none',
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
  // Reference view styles
  referenceSection: {
    marginTop: '1rem',
  },
  referenceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  refDetailsBox: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  statusSelectInline: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginLeft: '0.5rem',
  },
  addFeatureRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  featureInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '200px',
  },
  // Unlink section styles
  unlinkSection: {
    padding: '1rem',
    backgroundColor: '#fff8e6',
    border: '1px solid #f0d080',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  unlinkHeader: {
    backgroundColor: '#f0d080',
    padding: '0.5rem',
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    color: '#664400',
  },
  unlinkRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  unlinkInput: {
    flex: 1,
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    maxWidth: '400px',
  },
  unlinkButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  unlinkHelp: {
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic',
  },
};

export default LitGuideCurationPage;

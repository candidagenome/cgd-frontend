/**
 * Literature Review Page
 *
 * Allows curators to review and triage papers from the PubMed
 * literature review queue (REF_TEMP table).
 *
 * Actions:
 * - Add: Add paper with "Not yet curated" status
 * - High Priority: Add with "High Priority" status, optionally link to genes
 * - Discard: Add to REF_BAD (papers not relevant)
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getPendingPapers,
  getOrganisms,
  triageAdd,
  triageHighPriority,
  triageDiscard,
  triageBatch,
} from '../../api/litReviewApi';
import { filterAllowedOrganisms } from '../../constants/organisms';

const PUBMED_URL = 'https://pubmed.ncbi.nlm.nih.gov';
const ITEMS_PER_PAGE = 50;

function LitReviewPage() {
  const { user } = useAuth();

  // Data state
  const [papers, setPapers] = useState([]);
  const [organisms, setOrganisms] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hideAbstracts, setHideAbstracts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Triage selections per paper
  const [selections, setSelections] = useState({});
  // For high priority: gene names input
  const [geneInputs, setGeneInputs] = useState({});
  // For high priority: organism selection
  const [organismSelections, setOrganismSelections] = useState({});

  // Results after submission
  const [results, setResults] = useState(null);

  // Load papers and organisms
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [papersData, orgsData] = await Promise.all([
        getPendingPapers({ limit: ITEMS_PER_PAGE, offset }),
        getOrganisms(),
      ]);
      setPapers(papersData.papers);
      setTotal(papersData.total);
      setOrganisms(filterAllowedOrganisms(orgsData.organisms));
      // Reset selections
      setSelections({});
      setGeneInputs({});
      setOrganismSelections({});
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle radio button selection
  const handleSelection = (pubmed, action) => {
    setSelections((prev) => ({
      ...prev,
      [pubmed]: action,
    }));
  };

  // Handle gene name input for high priority
  const handleGeneInput = (pubmed, value) => {
    setGeneInputs((prev) => ({
      ...prev,
      [pubmed]: value,
    }));
  };

  // Handle organism selection for high priority
  const handleOrganismSelection = (pubmed, value) => {
    setOrganismSelections((prev) => ({
      ...prev,
      [pubmed]: value,
    }));
  };

  // Submit single paper action
  const handleSubmitSingle = async (pubmed) => {
    const action = selections[pubmed];
    if (!action) {
      alert('Please select an action first');
      return;
    }

    setSubmitting(true);
    try {
      let result;
      if (action === 'add') {
        result = await triageAdd(pubmed);
      } else if (action === 'high_priority') {
        const geneInput = geneInputs[pubmed] || '';
        const featureNames = geneInput
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean);
        result = await triageHighPriority({
          pubmed,
          feature_names: featureNames.length > 0 ? featureNames : undefined,
          organism_abbrev: organismSelections[pubmed] || undefined,
        });
      } else if (action === 'discard') {
        result = await triageDiscard(pubmed);
      }

      // Remove paper from list on success
      if (result.success) {
        setPapers((prev) => prev.filter((p) => p.pubmed !== pubmed));
        setTotal((prev) => prev - 1);
      }

      setResults({
        results: [{ pubmed, action, ...result }],
        total_processed: 1,
        successful: result.success ? 1 : 0,
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit all selections as batch
  const handleSubmitAll = async () => {
    const actions = Object.entries(selections)
      .filter(([, action]) => action)
      .map(([pubmed, action]) => {
        const result = {
          pubmed: parseInt(pubmed, 10),
          action,
        };
        if (action === 'high_priority') {
          const geneInput = geneInputs[pubmed] || '';
          const featureNames = geneInput
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean);
          if (featureNames.length > 0) {
            result.feature_names = featureNames;
          }
          if (organismSelections[pubmed]) {
            result.organism_abbrev = organismSelections[pubmed];
          }
        }
        return result;
      });

    if (actions.length === 0) {
      alert('No actions selected');
      return;
    }

    setSubmitting(true);
    try {
      const result = await triageBatch(actions);
      setResults(result);

      // Remove successful papers from list
      const successfulPubmeds = result.results
        .filter((r) => r.success)
        .map((r) => r.pubmed);

      setPapers((prev) => prev.filter((p) => !successfulPubmeds.includes(p.pubmed)));
      setTotal((prev) => prev - successfulPubmeds.length);

      // Clear selections for processed papers
      const processed = new Set(result.results.map((r) => r.pubmed));
      setSelections((prev) => {
        const next = { ...prev };
        processed.forEach((id) => delete next[id]);
        return next;
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Highlight search terms (genus name)
  const highlightTerms = (text) => {
    if (!text) return '';
    // Highlight "Candida" (genus)
    return text.replace(
      /(Candida)/gi,
      '<b style="background-color:#ffff66">$1</b>'
    );
  };

  // Format citation with bold author and italic "et al."
  const formatCitation = (citation) => {
    if (!citation) return '';
    let formatted = citation;
    // Bold author (up to year)
    formatted = formatted.replace(/^(.*?\(\d*\))/, '<b>$1</b>');
    // Italic "et al."
    formatted = formatted.replace(/(et al\.)/, '<i>$1</i>');
    return highlightTerms(formatted);
  };

  // Pagination
  const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    if (offset >= ITEMS_PER_PAGE) {
      setOffset(offset - ITEMS_PER_PAGE);
    }
  };

  const handleNextPage = () => {
    if (offset + ITEMS_PER_PAGE < total) {
      setOffset(offset + ITEMS_PER_PAGE);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>PubMed New Literature Review</h1>
        <div style={styles.userInfo}>
          <span>Curator: {user?.first_name} {user?.last_name}</span>
          <Link to="/curation" style={styles.link}>Return to Curator Central</Link>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {results && (
        <div style={styles.resultsPanel}>
          <h3>Results</h3>
          <p>
            Processed: {results.total_processed}, Successful: {results.successful}
          </p>
          <ul style={styles.messageList}>
            {results.results.map((r, idx) => (
              <li key={idx}>
                <strong>PMID:{r.pubmed}</strong> ({r.action}):{' '}
                {r.success ? (
                  <span style={{ color: 'green' }}>Success</span>
                ) : (
                  <span style={{ color: 'red' }}>Failed</span>
                )}
                {r.reference_no && (
                  <span> - reference_no: {r.reference_no}</span>
                )}
                {r.messages && r.messages.length > 0 && (
                  <ul>
                    {r.messages.map((msg, i) => (
                      <li
                        key={i}
                        dangerouslySetInnerHTML={{ __html: msg }}
                      />
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <button onClick={() => setResults(null)} style={styles.button}>
            Dismiss
          </button>
        </div>
      )}

      <div style={styles.controlBar}>
        <span>
          There are <span style={{ color: 'red', fontWeight: 'bold' }}>{total}</span> new references to review.
        </span>
        <div style={styles.toggleLinks}>
          <button
            onClick={() => setHideAbstracts(false)}
            style={hideAbstracts ? styles.linkButton : styles.linkButtonActive}
          >
            Show all abstracts
          </button>
          {' | '}
          <button
            onClick={() => setHideAbstracts(true)}
            style={!hideAbstracts ? styles.linkButton : styles.linkButtonActive}
          >
            Hide all abstracts
          </button>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={handlePrevPage}
            disabled={offset === 0}
            style={styles.pageButton}
          >
            &laquo; Previous
          </button>
          <span style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={offset + ITEMS_PER_PAGE >= total}
            style={styles.pageButton}
          >
            Next &raquo;
          </button>
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Loading papers...</div>
      ) : papers.length === 0 ? (
        <div style={styles.empty}>No papers pending review.</div>
      ) : (
        <div style={styles.paperList}>
          {papers.map((paper) => (
            <div key={paper.pubmed} style={styles.paperBlock}>
              <hr />
              {/* Citation */}
              <div style={styles.citation}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: formatCitation(paper.citation),
                  }}
                />
                &nbsp;&nbsp;
                <span style={{ color: 'red' }}>(PMID:{paper.pubmed})</span>
                &nbsp;&nbsp;
                <a
                  href={`${PUBMED_URL}/${paper.pubmed}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PubMed
                </a>
                {paper.fulltext_url && (
                  <>
                    &nbsp;&nbsp;
                    <a
                      href={paper.fulltext_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Full Text
                    </a>
                  </>
                )}
              </div>

              {/* Abstract */}
              {!hideAbstracts && paper.abstract && (
                <blockquote
                  style={styles.abstract}
                  dangerouslySetInnerHTML={{
                    __html: highlightTerms(paper.abstract),
                  }}
                />
              )}

              {/* Action group */}
              <div style={styles.actionGroup}>
                {/* Add option */}
                <div style={styles.actionRow}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name={`radio_${paper.pubmed}`}
                      checked={selections[paper.pubmed] === 'add'}
                      onChange={() => handleSelection(paper.pubmed, 'add')}
                    />
                    Add this paper to the database with "Not yet curated" status
                  </label>
                </div>

                {/* High priority option */}
                <div style={styles.actionRow}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name={`radio_${paper.pubmed}`}
                      checked={selections[paper.pubmed] === 'high_priority'}
                      onChange={() => handleSelection(paper.pubmed, 'high_priority')}
                    />
                    Add this paper with "High Priority" status, and link to gene(s)
                    <span style={styles.hint}> (separate multiples by |)</span>:
                  </label>
                  <input
                    type="text"
                    value={geneInputs[paper.pubmed] || ''}
                    onChange={(e) => handleGeneInput(paper.pubmed, e.target.value)}
                    style={styles.geneInput}
                    placeholder="e.g., ACT1|CDC42"
                    disabled={selections[paper.pubmed] !== 'high_priority'}
                  />
                  <span> from </span>
                  <select
                    value={organismSelections[paper.pubmed] || ''}
                    onChange={(e) =>
                      handleOrganismSelection(paper.pubmed, e.target.value)
                    }
                    style={styles.select}
                    disabled={selections[paper.pubmed] !== 'high_priority'}
                  >
                    <option value="">Select organism</option>
                    {organisms.map((org) => (
                      <option key={org.organism_abbrev} value={org.organism_abbrev}>
                        {org.organism_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Discard option */}
                <div style={styles.actionRow}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name={`radio_${paper.pubmed}`}
                      checked={selections[paper.pubmed] === 'discard'}
                      onChange={() => handleSelection(paper.pubmed, 'discard')}
                    />
                    Discard this paper
                  </label>
                  <button
                    onClick={() => handleSubmitSingle(paper.pubmed)}
                    disabled={!selections[paper.pubmed] || submitting}
                    style={styles.submitButton}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit all button */}
      {papers.length > 0 && (
        <div style={styles.submitAllBar}>
          <button
            onClick={handleSubmitAll}
            disabled={Object.keys(selections).length === 0 || submitting}
            style={styles.submitAllButton}
          >
            {submitting ? 'Processing...' : 'Submit All Selected'}
          </button>
          <span style={styles.selectedCount}>
            {Object.values(selections).filter(Boolean).length} paper(s) selected
          </span>
        </div>
      )}

      {/* Pagination (bottom) */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={handlePrevPage}
            disabled={offset === 0}
            style={styles.pageButton}
          >
            &laquo; Previous
          </button>
          <span style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={offset + ITEMS_PER_PAGE >= total}
            style={styles.pageButton}
          >
            Next &raquo;
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
  resultsPanel: {
    backgroundColor: '#e8f5e9',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  messageList: {
    margin: '0.5rem 0',
    paddingLeft: '1.5rem',
  },
  controlBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    padding: '0.5rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  toggleLinks: {
    fontSize: '0.9rem',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#0066cc',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '0.9rem',
  },
  linkButtonActive: {
    background: 'none',
    border: 'none',
    color: '#333',
    cursor: 'default',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    margin: '1rem 0',
  },
  pageButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  pageInfo: {
    fontSize: '0.9rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  paperList: {
    marginTop: '1rem',
  },
  paperBlock: {
    marginBottom: '1.5rem',
  },
  citation: {
    marginBottom: '0.5rem',
    lineHeight: '1.5',
  },
  abstract: {
    margin: '0.5rem 0 0.5rem 2rem',
    padding: '0.5rem',
    backgroundColor: '#fafafa',
    borderLeft: '3px solid #ccc',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  actionGroup: {
    backgroundColor: '#e8e8ff',
    padding: '0.75rem',
    marginTop: '0.5rem',
    borderRadius: '4px',
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    cursor: 'pointer',
  },
  hint: {
    color: 'red',
    fontSize: '0.8rem',
  },
  geneInput: {
    padding: '0.25rem 0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '150px',
  },
  select: {
    padding: '0.25rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  submitButton: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  submitAllBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  submitAllButton: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  selectedCount: {
    fontSize: '0.9rem',
    color: '#666',
  },
  button: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default LitReviewPage;

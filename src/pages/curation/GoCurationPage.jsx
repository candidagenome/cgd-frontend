/**
 * GO Curation Page
 *
 * Full GO annotation curation interface for a feature.
 * - Display existing annotations grouped by aspect (F/P/C)
 * - Add new annotations with validation
 * - Mark annotations as reviewed
 * - Delete annotations
 *
 * Mirrors legacy goCuration CGI functionality (UpdateGO.pm).
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import goCurationApi from '../../api/goCurationApi';
import api from '../../api/config';
import { getOrganisms } from '../../api/litReviewApi';
import { filterAllowedOrganisms } from '../../constants/organisms';

// Evidence codes that require "with/from" support
const EVIDENCE_CODES_WITH_FROM = ['IGI', 'IPI', 'ISS', 'ISA', 'ISM', 'IGC', 'ISO'];

// Number of annotation rows to show initially
const INITIAL_ROWS = 4;
const MORE_ROWS_INCREMENT = 3;

function GoCurationPage() {
  const { featureName } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Organism state
  const [organisms, setOrganisms] = useState([]);
  const [selectedOrganism, setSelectedOrganism] = useState('');

  // Search form state (when no feature specified)
  const [searchQuery, setSearchQuery] = useState('');

  // Feature and annotations state
  const [featureData, setFeatureData] = useState(null);
  const [loading, setLoading] = useState(!!featureName); // Only loading if we have a feature
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // New annotation form state - multiple rows like Perl version
  const [showAddForm, setShowAddForm] = useState(false);
  const [evidenceCodes, setEvidenceCodes] = useState([]);
  const [rowCount, setRowCount] = useState(INITIAL_ROWS);

  // Create empty row template
  const createEmptyRow = () => ({
    ontology: '', // P/F/C
    goid: '',
    reference_no: '',
    pubmed: '',
    cgdid: '', // CGDID for reference lookup
    evidence: '',
    qualifiers: [],
    ic_from_goid: '',
    with_db: '',
    with_id: '',
    with_evidence_codes: [], // Selected evidence codes for with/from (IGI, IPI, etc.)
    feature_list: '', // For sharing annotations with other features
  });

  // Initialize annotation rows
  const [annotationRows, setAnnotationRows] = useState(
    Array(INITIAL_ROWS).fill(null).map(() => createEmptyRow())
  );
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // For "mark all reviewed" checkbox
  const [markAllReviewed, setMarkAllReviewed] = useState(null); // null, 'Yes', or 'No'

  // Load feature annotations
  const loadAnnotations = useCallback(async () => {
    if (!featureName) return;

    setLoading(true);
    setError(null);

    try {
      const data = await goCurationApi.getAnnotations(featureName);
      setFeatureData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Feature '${featureName}' not found`);
      } else {
        setError('Failed to load GO annotations');
      }
    } finally {
      setLoading(false);
    }
  }, [featureName]);

  // Load evidence codes and organisms
  useEffect(() => {
    const loadEvidenceCodes = async () => {
      try {
        const data = await goCurationApi.getEvidenceCodes();
        setEvidenceCodes(data.evidence_codes);
      } catch (err) {
        console.error('Failed to load evidence codes:', err);
      }
    };

    const loadOrganisms = async () => {
      try {
        const data = await getOrganisms();
        const filteredOrganisms = filterAllowedOrganisms(data.organisms || []);
        setOrganisms(filteredOrganisms);
        if (filteredOrganisms.length > 0) {
          setSelectedOrganism(filteredOrganisms[0].organism_abbrev);
        }
      } catch (err) {
        console.error('Failed to load organisms:', err);
      }
    };

    loadEvidenceCodes();
    loadOrganisms();
  }, []);

  // Load annotations on mount and when featureName changes
  useEffect(() => {
    loadAnnotations();
  }, [loadAnnotations]);

  // Group annotations by aspect
  const annotationsByAspect = featureData?.annotations?.reduce((acc, ann) => {
    const aspect = ann.go_aspect || 'Unknown';
    if (!acc[aspect]) acc[aspect] = [];
    acc[aspect].push(ann);
    return acc;
  }, {}) || {};

  // Handle mark as reviewed
  const handleMarkReviewed = async (annotationNo) => {
    try {
      await goCurationApi.markAsReviewed(annotationNo);
      setSuccessMessage('Annotation marked as reviewed');
      loadAnnotations();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to mark annotation as reviewed');
    }
  };

  // Handle delete annotation
  const handleDelete = async (annotationNo) => {
    if (!window.confirm('Are you sure you want to delete this annotation?')) {
      return;
    }

    try {
      await goCurationApi.deleteAnnotation(annotationNo);
      setSuccessMessage('Annotation deleted');
      loadAnnotations();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete annotation');
    }
  };

  // Handle row field change
  const handleRowChange = (rowIndex, field, value) => {
    setAnnotationRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [field]: value };
      return updated;
    });
    setFormError(null);
  };

  // Add more rows
  const handleMoreRows = () => {
    setAnnotationRows((prev) => [
      ...prev,
      ...Array(MORE_ROWS_INCREMENT).fill(null).map(() => createEmptyRow()),
    ]);
    setRowCount((prev) => prev + MORE_ROWS_INCREMENT);
  };

  // Helper to look up reference by pubmed
  const lookupReferenceByPubmed = async (pubmed) => {
    try {
      const response = await api.get(`/api/reference/${pubmed}`);
      return response.data.reference_no;
    } catch {
      return null;
    }
  };

  // Helper to look up reference by CGDID
  const lookupReferenceByCgdid = async (cgdid) => {
    try {
      // CGDID format is like "CGD_REF:xxx" or just the number
      const formattedId = cgdid.includes('CGD_REF:') ? cgdid : `CGD_REF:${cgdid}`;
      const response = await api.get(`/api/reference/${formattedId}`);
      return response.data.reference_no;
    } catch {
      return null;
    }
  };

  // Handle submit - process all rows with data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const results = [];
    const errors = [];

    try {
      // Process each row that has data
      for (let i = 0; i < annotationRows.length; i++) {
        const row = annotationRows[i];

        // Skip empty rows
        if (!row.goid) continue;

        // Validate required fields
        if (!row.ontology) {
          errors.push(`Row ${i + 1}: Ontology selection is required`);
          continue;
        }
        if (!row.evidence) {
          errors.push(`Row ${i + 1}: Evidence code is required`);
          continue;
        }
        if (!row.reference_no && !row.pubmed && !row.cgdid) {
          errors.push(`Row ${i + 1}: Reference number, PubMed ID, or CGDID is required`);
          continue;
        }

        // Validate IC evidence requires from GOid
        if (row.evidence === 'IC' && !row.ic_from_goid) {
          errors.push(`Row ${i + 1}: IC evidence requires "from GO ID" value`);
          continue;
        }

        // Validate with/from for evidence codes that require it
        if (EVIDENCE_CODES_WITH_FROM.includes(row.evidence) && row.with_db && !row.with_id) {
          errors.push(`Row ${i + 1}: With ID is required when DB is selected`);
          continue;
        }

        // Get reference_no (from pubmed or cgdid if needed)
        let refNo = row.reference_no ? parseInt(row.reference_no, 10) : null;
        if (!refNo && row.pubmed) {
          refNo = await lookupReferenceByPubmed(row.pubmed);
          if (!refNo) {
            errors.push(`Row ${i + 1}: PubMed ${row.pubmed} not found in database`);
            continue;
          }
        }
        if (!refNo && row.cgdid) {
          refNo = await lookupReferenceByCgdid(row.cgdid);
          if (!refNo) {
            errors.push(`Row ${i + 1}: CGDID ${row.cgdid} not found in database`);
            continue;
          }
        }

        // Clean up GO ID - remove "GO:" prefix if present and parse as integer
        let goidValue = row.goid.toString().trim();
        goidValue = goidValue.replace(/^GO:/i, '').replace(/^0+/, ''); // Remove GO: prefix and leading zeros
        const goidNum = parseInt(goidValue, 10);
        if (isNaN(goidNum)) {
          errors.push(`Row ${i + 1}: Invalid GO ID format: ${row.goid}`);
          continue;
        }

        const data = {
          goid: goidNum,
          evidence: row.evidence,
          reference_no: refNo,
        };

        if (row.qualifiers.length > 0) {
          data.qualifiers = row.qualifiers;
        }

        if (row.ic_from_goid) {
          // Clean up IC from GOid - remove "GO:" prefix if present
          let icGoidValue = row.ic_from_goid.toString().trim();
          icGoidValue = icGoidValue.replace(/^GO:/i, '').replace(/^0+/, '');
          const icGoidNum = parseInt(icGoidValue, 10);
          if (isNaN(icGoidNum)) {
            errors.push(`Row ${i + 1}: Invalid IC from GO ID format: ${row.ic_from_goid}`);
            continue;
          }
          data.ic_from_goid = icGoidNum;
        }

        // Feature list - create annotation for each feature
        const featuresToAnnotate = [featureName];
        if (row.feature_list) {
          const additionalFeatures = row.feature_list.split('|').map((f) => f.trim()).filter(Boolean);
          featuresToAnnotate.push(...additionalFeatures);
        }

        for (const feat of featuresToAnnotate) {
          try {
            await goCurationApi.createAnnotation(feat, data);
            results.push(`Row ${i + 1}: Annotation created for ${feat}`);
          } catch (err) {
            errors.push(`Row ${i + 1} (${feat}): ${err.response?.data?.detail || err.message}`);
          }
        }
      }

      // Handle "mark all reviewed" if selected
      if (markAllReviewed === 'Yes' && featureData?.annotations?.length > 0) {
        for (const ann of featureData.annotations) {
          try {
            await goCurationApi.markAsReviewed(ann.go_annotation_no);
          } catch {
            // Ignore individual errors for bulk review
          }
        }
        results.push('All existing annotations marked as reviewed');
      }

      if (errors.length > 0) {
        setFormError(errors.join('\n'));
      }

      if (results.length > 0) {
        setSuccessMessage(results.join('; '));
        // Reset form
        setAnnotationRows(Array(INITIAL_ROWS).fill(null).map(() => createEmptyRow()));
        setRowCount(INITIAL_ROWS);
        setShowAddForm(false);
        setMarkAllReviewed(null);
        loadAnnotations();
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err) {
      setFormError(err.response?.data?.detail || err.message || 'Failed to create annotations');
    } finally {
      setSubmitting(false);
    }
  };

  // Aspect display names
  const aspectNames = {
    function: 'Molecular Function (F)',
    process: 'Biological Process (P)',
    component: 'Cellular Component (C)',
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/curation/go/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Show search form when no feature is specified
  if (!featureName) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>GO Curation</h1>
          <div style={styles.headerRight}>
            <span>Curator: {user?.first_name} {user?.last_name}</span>
            <Link to="/curation" style={styles.headerLink}>
              Curator Central
            </Link>
          </div>
        </div>

        <div style={styles.searchContainer}>
          <h2>Search for a Feature</h2>
          <p style={styles.searchHint}>
            Enter a feature name (systematic name or gene name) to view and edit its GO annotations.
          </p>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <select
              value={selectedOrganism}
              onChange={(e) => setSelectedOrganism(e.target.value)}
              style={styles.organismSelect}
            >
              <option value="">All organisms</option>
              {organisms.map((org) => (
                <option key={org.organism_abbrev} value={org.organism_abbrev}>
                  {org.organism_name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., orf19.123 or ACT1"
              style={styles.searchInput}
              autoFocus
            />
            <button type="submit" style={styles.searchButton}>
              Search
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading GO annotations...</div>
      </div>
    );
  }

  if (error && !featureData) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <Link to="/curation">Back to Curator Central</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>GO Curation: {featureData?.feature_name}</h1>
        <div style={styles.headerRight}>
          <span>Curator: {user?.first_name} {user?.last_name}</span>
          <Link to="/curation" style={styles.headerLink}>
            Curator Central
          </Link>
        </div>
      </div>

      {featureData?.gene_name && (
        <p style={styles.subtitle}>
          Gene: <strong>{featureData.gene_name}</strong>
          {' | '}
          <Link to={`/locus/${featureData.feature_name}`}>View Locus Page</Link>
        </p>
      )}

      {successMessage && <div style={styles.success}>{successMessage}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* Add Annotation Button */}
      <div style={styles.actions}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={styles.addButton}
        >
          {showAddForm ? 'Cancel' : '+ Add New GO Annotation'}
        </button>
      </div>

      {/* Add Annotation Form - Multiple Rows like Perl version */}
      {showAddForm && (
        <div style={styles.formContainer}>
          <h3 style={styles.sectionTitle}>Enter New Annotations</h3>
          {formError && (
            <div style={styles.formError}>
              {formError.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Header row */}
            <table style={styles.annotationTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Choose Ontology</th>
                  <th style={styles.th}>
                    Enter GO ID number<br />
                    <span style={styles.thHint}>and relevant qualifier(s)</span>
                  </th>
                  <th style={styles.th}>
                    Enter reference_no OR pubmed OR CGDID<br />
                    <span style={styles.thHint}>(if more than one, enter in another row)</span>
                  </th>
                  <th style={styles.th}>Choose Evidence code</th>
                  <th style={styles.th}>
                    Enter With OR From Association<br />
                    <span style={styles.thHint}>(if more than one DB, enter in another row)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {annotationRows.map((row, idx) => (
                  <React.Fragment key={idx}>
                    <tr style={styles.annotationRow}>
                      {/* Ontology */}
                      <td style={styles.td}>
                        <select
                          value={row.ontology}
                          onChange={(e) => handleRowChange(idx, 'ontology', e.target.value)}
                          style={styles.formSelect}
                        >
                          <option value="">-Ontology-</option>
                          <option value="P">Process</option>
                          <option value="F">Function</option>
                          <option value="C">Component</option>
                        </select>
                      </td>

                      {/* GO ID and Qualifiers */}
                      <td style={styles.td}>
                        <div style={styles.fieldGroup}>
                          <label style={styles.smallLabel}>GO#:</label>
                          <input
                            type="text"
                            value={row.goid}
                            onChange={(e) => handleRowChange(idx, 'goid', e.target.value)}
                            style={styles.smallInput}
                            placeholder="e.g., 5515"
                          />
                        </div>
                        <div style={styles.qualifierGroup}>
                          {['NOT', 'contributes_to', 'colocalizes_with'].map((q) => (
                            <label key={q} style={styles.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={row.qualifiers.includes(q)}
                                onChange={(e) => {
                                  const newQualifiers = e.target.checked
                                    ? [...row.qualifiers, q]
                                    : row.qualifiers.filter((x) => x !== q);
                                  handleRowChange(idx, 'qualifiers', newQualifiers);
                                }}
                              />
                              <span style={styles.qualifierLabel}>{q}</span>
                            </label>
                          ))}
                        </div>
                      </td>

                      {/* Reference */}
                      <td style={styles.td}>
                        <div style={styles.fieldGroup}>
                          <label style={styles.smallLabel}>Reference_No:</label>
                          <input
                            type="text"
                            value={row.reference_no}
                            onChange={(e) => handleRowChange(idx, 'reference_no', e.target.value)}
                            style={styles.smallInput}
                          />
                        </div>
                        <div style={styles.orDivider}>OR</div>
                        <div style={styles.fieldGroup}>
                          <label style={styles.smallLabel}>Pubmed:</label>
                          <input
                            type="text"
                            value={row.pubmed}
                            onChange={(e) => handleRowChange(idx, 'pubmed', e.target.value)}
                            style={styles.smallInput}
                          />
                        </div>
                        <div style={styles.orDivider}>OR</div>
                        <div style={styles.fieldGroup}>
                          <label style={styles.smallLabel}>CGDID:</label>
                          <input
                            type="text"
                            value={row.cgdid}
                            onChange={(e) => handleRowChange(idx, 'cgdid', e.target.value)}
                            style={styles.smallInput}
                          />
                        </div>
                      </td>

                      {/* Evidence Code */}
                      <td style={styles.td}>
                        <div style={styles.evidenceCheckboxes}>
                          {evidenceCodes.map((code) => (
                            <label key={code} style={styles.evidenceLabel}>
                              <input
                                type="radio"
                                name={`evidence-${idx}`}
                                value={code}
                                checked={row.evidence === code}
                                onChange={(e) => handleRowChange(idx, 'evidence', e.target.value)}
                              />
                              {code}
                            </label>
                          ))}
                        </div>
                      </td>

                      {/* With/From */}
                      <td style={styles.td}>
                        <div style={styles.withFromSection}>
                          {/* Evidence code checkboxes for with/from */}
                          <div style={styles.withEvidenceCheckboxes}>
                            {EVIDENCE_CODES_WITH_FROM.map((code) => (
                              <label key={code} style={styles.checkboxLabel}>
                                <input
                                  type="checkbox"
                                  checked={row.with_evidence_codes?.includes(code) || false}
                                  onChange={(e) => {
                                    const newCodes = e.target.checked
                                      ? [...(row.with_evidence_codes || []), code]
                                      : (row.with_evidence_codes || []).filter((c) => c !== code);
                                    handleRowChange(idx, 'with_evidence_codes', newCodes);
                                  }}
                                />
                                {code}
                              </label>
                            ))}
                            <span style={styles.withLabel}>with:</span>
                          </div>
                          <div style={styles.fieldGroup}>
                            <label style={styles.smallLabel}>DB:</label>
                            <select
                              value={row.with_db}
                              onChange={(e) => handleRowChange(idx, 'with_db', e.target.value)}
                              style={styles.smallSelect}
                            >
                              <option value="">-select database-</option>
                              <option value="CGD">CGD</option>
                              <option value="SGD">SGD</option>
                              <option value="UniProtKB">UniProtKB</option>
                              <option value="PANTHER">PANTHER</option>
                              <option value="InterPro">InterPro</option>
                              <option value="Pfam">Pfam</option>
                            </select>
                          </div>
                          <div style={styles.fieldGroup}>
                            <label style={styles.smallLabel}>ID:</label>
                            <input
                              type="text"
                              value={row.with_id}
                              onChange={(e) => handleRowChange(idx, 'with_id', e.target.value)}
                              style={styles.smallInput}
                              placeholder="separate by |"
                            />
                          </div>
                          <div style={styles.orDivider}>---- OR ----</div>
                          <div style={styles.fieldGroup}>
                            <label style={styles.smallLabel}>IC from GOid:</label>
                            <input
                              type="text"
                              value={row.ic_from_goid}
                              onChange={(e) => handleRowChange(idx, 'ic_from_goid', e.target.value)}
                              style={styles.smallInput}
                              placeholder="separate by |"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Feature list row */}
                    <tr>
                      <td colSpan="2" style={styles.featureListLabel}>
                        <span style={styles.smallText}>
                          Enter features that share this GO annotation; Note, only{' '}
                          <strong style={{ color: 'red' }}>{featureData?.organism_name || 'this species'}</strong>{' '}
                          genes are allowed here. Separate multiples by |
                        </span>
                      </td>
                      <td colSpan="3" style={styles.td}>
                        <input
                          type="text"
                          value={row.feature_list}
                          onChange={(e) => handleRowChange(idx, 'feature_list', e.target.value)}
                          style={styles.featureListInput}
                          placeholder="e.g., ACT1|CDC19"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" style={styles.rowSeparator}>
                        <hr />
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* Mark all reviewed checkbox - only show if there are existing annotations */}
            {featureData?.annotations?.length > 0 && (
              <div style={styles.reviewSection}>
                <span style={styles.reviewLabel}>
                  Curator had examined and agrees with ALL of the current annotations for the 3 ontologies?
                </span>
                <label style={styles.checkboxLabel}>
                  <input
                    type="radio"
                    name="markAllReviewed"
                    value="Yes"
                    checked={markAllReviewed === 'Yes'}
                    onChange={() => setMarkAllReviewed('Yes')}
                  />
                  Yes
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="radio"
                    name="markAllReviewed"
                    value="No"
                    checked={markAllReviewed === 'No'}
                    onChange={() => setMarkAllReviewed('No')}
                  />
                  No
                </label>
                <div style={styles.reviewHint}>
                  (checking "YES" updates the Last Reviewed date on the annotation page to today&apos;s date)
                </div>
              </div>
            )}

            <div style={styles.formButtons}>
              <button
                type="button"
                onClick={handleMoreRows}
                style={styles.moreRowsButton}
              >
                More Rows
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={styles.submitButton}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setAnnotationRows(Array(INITIAL_ROWS).fill(null).map(() => createEmptyRow()));
                  setRowCount(INITIAL_ROWS);
                  setMarkAllReviewed(null);
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Annotations */}
      <div style={styles.annotations}>
        <h2>Existing GO Annotations ({featureData?.annotations?.length || 0})</h2>

        {Object.entries(annotationsByAspect).length === 0 ? (
          <p style={styles.noAnnotations}>No GO annotations found for this feature.</p>
        ) : (
          Object.entries(annotationsByAspect).map(([aspect, annotations]) => (
            <section key={aspect} style={styles.aspectSection}>
              <h3 style={styles.aspectHeader}>
                {aspectNames[aspect] || aspect} ({annotations.length})
              </h3>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>GO ID</th>
                    <th style={styles.th}>Term</th>
                    <th style={styles.th}>Evidence</th>
                    <th style={styles.th}>Evidence Support</th>
                    <th style={styles.th}>References</th>
                    <th style={styles.th}>Last Reviewed</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {annotations.map((ann) => (
                    <tr key={ann.go_annotation_no}>
                      <td style={styles.td}>
                        <a
                          href={`http://amigo.geneontology.org/amigo/term/GO:${String(ann.goid).padStart(7, '0')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GO:{String(ann.goid).padStart(7, '0')}
                        </a>
                      </td>
                      <td style={styles.td}>
                        {ann.references?.some((r) => r.qualifiers?.length > 0) && (
                          <span style={styles.termQualifier}>
                            {ann.references.find((r) => r.qualifiers?.length > 0)?.qualifiers?.[0]?.toLowerCase()}{' '}
                          </span>
                        )}
                        {ann.go_term}
                      </td>
                      <td style={styles.td}>{ann.go_evidence}</td>
                      <td style={styles.td}>
                        {/* Evidence support (with/from info) - displayed if available */}
                        {ann.with_support_text || ann.from_goid ? (
                          <span>
                            {ann.with_support_text && <span>with {ann.with_support_text}</span>}
                            {ann.from_goid && (
                              <span>
                                from{' '}
                                <a
                                  href={`http://amigo.geneontology.org/amigo/term/GO:${String(ann.from_goid).padStart(7, '0')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  GO:{String(ann.from_goid).padStart(7, '0')}
                                </a>
                              </span>
                            )}
                          </span>
                        ) : (
                          <span style={styles.noSupport}>-</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {ann.references?.map((ref, idx) => (
                          <div key={ref.go_ref_no}>
                            <Link to={`/reference/${ref.reference_no}`}>
                              {ref.pubmed ? `PMID:${ref.pubmed}` : `Ref:${ref.reference_no}`}
                            </Link>
                            {ref.qualifiers?.length > 0 && (
                              <span style={styles.qualifiers}>
                                {' '}({ref.qualifiers.join(', ')})
                              </span>
                            )}
                          </div>
                        ))}
                      </td>
                      <td style={styles.td}>
                        {ann.date_last_reviewed?.split('T')[0] || '-'}
                      </td>
                      <td style={styles.td}>
                        <button
                          type="button"
                          onClick={() => handleMarkReviewed(ann.go_annotation_no)}
                          style={styles.actionButton}
                          title="Mark as reviewed (update date)"
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ann.go_annotation_no)}
                          style={styles.deleteButton}
                          title="Delete annotation"
                        >
                          Delete
                        </button>
                        {/* Show "update date" option for "unknown" terms like Perl version */}
                        {ann.go_term?.toLowerCase().includes('unknown') && (
                          <button
                            type="button"
                            onClick={() => handleMarkReviewed(ann.go_annotation_no)}
                            style={styles.updateDateButton}
                            title="Update date_created for unknown term"
                          >
                            Update Date
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '1rem auto',
    padding: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
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
  },
  subtitle: {
    marginBottom: '1rem',
    color: '#666',
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c00',
    marginBottom: '1rem',
  },
  success: {
    padding: '1rem',
    backgroundColor: '#efe',
    border: '1px solid #cfc',
    borderRadius: '4px',
    color: '#060',
    marginBottom: '1rem',
  },
  actions: {
    marginBottom: '1rem',
  },
  addButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  formContainer: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  formLabel: {
    width: '120px',
    fontWeight: 'bold',
    paddingTop: '0.5rem',
  },
  required: {
    color: '#c00',
  },
  formInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '200px',
  },
  formSelect: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '200px',
  },
  formHint: {
    fontSize: '0.85rem',
    color: '#666',
    paddingTop: '0.5rem',
  },
  checkboxGroup: {
    display: 'flex',
    gap: '1rem',
    paddingTop: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  formButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  submitButton: {
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
  formError: {
    padding: '0.5rem',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c00',
    marginBottom: '1rem',
  },
  annotations: {
    marginTop: '1.5rem',
  },
  aspectSection: {
    marginBottom: '1.5rem',
  },
  aspectHeader: {
    backgroundColor: '#CCCCFF',
    padding: '0.5rem',
    margin: '0 0 0.5rem 0',
  },
  noAnnotations: {
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
  },
  td: {
    padding: '0.5rem',
    borderBottom: '1px solid #ddd',
    verticalAlign: 'top',
  },
  qualifiers: {
    fontSize: '0.85rem',
    color: '#666',
  },
  termQualifier: {
    color: 'red',
    fontStyle: 'italic',
  },
  noSupport: {
    color: '#999',
  },
  actionButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginRight: '0.25rem',
    fontSize: '0.85rem',
  },
  deleteButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  updateDateButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f0ad4e',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    marginTop: '0.25rem',
    display: 'block',
  },
  sectionTitle: {
    backgroundColor: '#CCCCFF',
    padding: '0.5rem',
    marginBottom: '1rem',
  },
  annotationTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  annotationRow: {
    verticalAlign: 'top',
  },
  thHint: {
    fontSize: '0.75rem',
    fontWeight: 'normal',
    fontStyle: 'italic',
  },
  fieldGroup: {
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexWrap: 'wrap',
  },
  smallLabel: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    minWidth: '80px',
  },
  smallInput: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.85rem',
    border: '1px solid #ccc',
    borderRadius: '3px',
    width: '100px',
  },
  smallSelect: {
    padding: '0.25rem',
    fontSize: '0.85rem',
    border: '1px solid #ccc',
    borderRadius: '3px',
  },
  orDivider: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: '#666',
    margin: '0.25rem 0',
  },
  qualifierGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    marginTop: '0.5rem',
  },
  qualifierLabel: {
    fontSize: '0.8rem',
    marginLeft: '0.25rem',
  },
  evidenceCheckboxes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.15rem',
    fontSize: '0.8rem',
  },
  evidenceLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.1rem',
    fontSize: '0.8rem',
  },
  withFromSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  withEvidenceCheckboxes: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    alignItems: 'center',
    marginBottom: '0.5rem',
    fontSize: '0.8rem',
  },
  withLabel: {
    fontWeight: 'bold',
    marginLeft: '0.25rem',
  },
  featureListLabel: {
    padding: '0.5rem',
    fontSize: '0.85rem',
    textAlign: 'left',
  },
  featureListInput: {
    width: '100%',
    padding: '0.25rem 0.5rem',
    fontSize: '0.85rem',
    border: '1px solid #ccc',
    borderRadius: '3px',
  },
  smallText: {
    fontSize: '0.8rem',
  },
  rowSeparator: {
    padding: '0',
  },
  reviewSection: {
    padding: '1rem',
    backgroundColor: '#fff8dc',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  reviewLabel: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: 'red',
    marginRight: '1rem',
  },
  reviewHint: {
    fontSize: '0.8rem',
    color: '#666',
    marginTop: '0.25rem',
    fontStyle: 'italic',
  },
  moreRowsButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '0.5rem',
  },
  searchContainer: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '8px',
    textAlign: 'center',
  },
  searchHint: {
    color: '#666',
    marginBottom: '1.5rem',
  },
  searchForm: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  searchInput: {
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '200px',
  },
  organismSelect: {
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '180px',
  },
  searchButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default GoCurationPage;

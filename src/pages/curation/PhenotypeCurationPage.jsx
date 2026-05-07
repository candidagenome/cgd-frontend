/**
 * Phenotype Curation Page
 *
 * Full phenotype annotation curation interface for a feature.
 * - Display existing phenotype annotations
 * - Add new annotations with experiment type, mutant type, observable, qualifier
 * - Add experiment properties (strain_background, allele, etc.)
 * - Delete annotations
 *
 * Mirrors legacy UpdatePhenotype.pm functionality with:
 * - Tree-structured dropdowns for Experiment Type, Mutant Type, Qualifier
 * - Browse Observable modal with expandable tree
 * - Multiple annotation sections (5 by default) with "More Rows" button
 * - Property type rows with CV tree browsers for appropriate types
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import phenotypeCurationApi from '../../api/phenotypeCurationApi';
import { getOrganisms } from '../../api/litReviewApi';
import { filterAllowedOrganisms } from '../../constants/organisms';
import CVTreeSelect from '../../components/curation/CVTreeSelect';
import ObservableBrowseModal from '../../components/curation/ObservableBrowseModal';
import { renderCitationItem } from '../../utils/formatCitation.jsx';

// Default number of new annotation sections to show
const MIN_NEW_SECTIONS = 1;
const ADD_SECTIONS_COUNT = 1;

// Property types that have CV tree browsers
// Note: chebi_ontology is intentionally NOT included here because the CHEBI
// ontology has 100,000+ terms which crashes the browser when loaded into a
// dropdown. Instead, curators enter CHEBI IDs directly as text (e.g., "CHEBI:12345")
const PROPERTY_CV_MAP = {
  strain_background: 'strain_background',
  virulence_model: 'virulence_model',
};

// Property types to exclude from the form
const EXCLUDED_PROPERTY_TYPES = [
  'fungal_anatomy_ontology',
  'Numerical_value',
  'strain_name',
];

// Property types that allow multiple values (separate by |)
const ALLOW_MULTIPLES_TYPES = [
  'chebi_ontology',
  'Chemical_pending',
  'Condition',
  'Details',
];

// Required property types to always show (matching Perl version)
// These are shown in order, with any additional types from DB appended
const REQUIRED_PROPERTY_TYPES = [
  'strain_background',
  'chebi_ontology',
  'Chemical_pending',
  'virulence_model',
  'Allele',
  'Reporter',
  'Condition',
  'Details',
  'Note',
];

function PhenotypeCurationPage() {
  const { featureName: paramFeatureName } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Support both route param and query param for feature name
  const featureName = paramFeatureName || searchParams.get('query');

  // Feature and annotations state
  const [featureData, setFeatureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search state (when no feature specified)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrganism, setSelectedOrganism] = useState('');
  const [organisms, setOrganisms] = useState([]);

  // Multiple annotation sections state
  const [annotationSections, setAnnotationSections] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Observable browse modal state
  const [observableModalOpen, setObservableModalOpen] = useState(false);
  const [observableModalSectionIndex, setObservableModalSectionIndex] = useState(null);

  // Initialize empty annotation section
  const createEmptySection = () => ({
    reference_no: '',
    pubmed: '',
    experiment_type: '',
    mutant_type: '',
    qualifier: '',
    observables: [],
    experiment_comment: '',
    properties: {},
    feature_list: '', // genes/features that share this annotation
  });

  // Storage key for preserving form state
  const storageKey = `phenotype_curation_form_${featureName}_${searchParams.get('organism') || ''}`;

  // Initialize organism from URL params
  useEffect(() => {
    const organismParam = searchParams.get('organism');
    if (organismParam) {
      setSelectedOrganism(organismParam);
    }
  }, [searchParams]);

  // Restore form state from sessionStorage on mount
  useEffect(() => {
    if (!featureName) return;

    try {
      const savedState = sessionStorage.getItem(storageKey);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.annotationSections && parsed.annotationSections.length > 0) {
          setAnnotationSections(parsed.annotationSections);
        }
      }
    } catch (err) {
      console.error('Failed to restore form state:', err);
    }
  }, [featureName, storageKey]);

  // Save form state to sessionStorage whenever it changes
  useEffect(() => {
    if (!featureName || annotationSections.length === 0) return;

    try {
      sessionStorage.setItem(storageKey, JSON.stringify({
        annotationSections,
      }));
    } catch (err) {
      console.error('Failed to save form state:', err);
    }
  }, [annotationSections, featureName, storageKey]);

  // Load organisms on mount
  useEffect(() => {
    const loadOrganisms = async () => {
      try {
        const data = await getOrganisms();
        setOrganisms(filterAllowedOrganisms(data.organisms || []));
      } catch (err) {
        console.error('Failed to load organisms:', err);
      }
    };

    loadOrganisms();
  }, []);

  // Load property types (merge required types with database types, exclude unwanted)
  useEffect(() => {
    const loadPropertyTypes = async () => {
      try {
        const data = await phenotypeCurationApi.getPropertyTypes();
        const dbTypes = data.property_types || [];
        // Start with required types, then add any additional types from DB
        const allTypes = [...REQUIRED_PROPERTY_TYPES];
        for (const t of dbTypes) {
          if (!allTypes.includes(t)) {
            allTypes.push(t);
          }
        }
        // Filter out excluded property types
        const filteredTypes = allTypes.filter(t => !EXCLUDED_PROPERTY_TYPES.includes(t));
        setPropertyTypes(filteredTypes);
      } catch (err) {
        console.error('Failed to load property types:', err);
        // Fall back to required types (already filtered) if API fails
        setPropertyTypes(REQUIRED_PROPERTY_TYPES.filter(t => !EXCLUDED_PROPERTY_TYPES.includes(t)));
      }
    };

    loadPropertyTypes();
  }, []);

  // Initialize annotation sections when feature is loaded (only if no restored state)
  useEffect(() => {
    if (featureName && annotationSections.length === 0) {
      // Check if we have saved state first
      try {
        const savedState = sessionStorage.getItem(storageKey);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          if (parsed.annotationSections && parsed.annotationSections.length > 0) {
            // Restored state will be set by the restore useEffect
            return;
          }
        }
      } catch (err) {
        // Ignore parse errors
      }

      const sections = [];
      for (let i = 0; i < MIN_NEW_SECTIONS; i++) {
        sections.push(createEmptySection());
      }
      setAnnotationSections(sections);
    }
  }, [featureName, annotationSections.length, storageKey]);

  // Load feature annotations
  const loadAnnotations = useCallback(async () => {
    if (!featureName) return;

    setLoading(true);
    setError(null);

    try {
      const organismParam = searchParams.get('organism') || selectedOrganism;
      const data = await phenotypeCurationApi.getAnnotations(featureName, organismParam || null);
      setFeatureData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Feature '${featureName}' not found`);
      } else {
        setError('Failed to load phenotype annotations');
      }
      setFeatureData(null);
    } finally {
      setLoading(false);
    }
  }, [featureName, searchParams, selectedOrganism]);

  // Load annotations on mount and when featureName changes
  useEffect(() => {
    if (featureName) {
      loadAnnotations();
    }
  }, [loadAnnotations, featureName]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      let url = `/curation/phenotype?query=${encodeURIComponent(searchQuery.trim())}`;
      if (selectedOrganism) {
        url += `&organism=${encodeURIComponent(selectedOrganism)}`;
      }
      window.location.href = url;
    }
  };

  // Handle delete annotation
  const handleDelete = async (annotationNo) => {
    if (!window.confirm('Are you sure you want to delete this annotation?')) {
      return;
    }

    try {
      await phenotypeCurationApi.deleteAnnotation(annotationNo);
      setSuccessMessage('Annotation deleted');
      loadAnnotations();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete annotation');
    }
  };

  // Add more annotation sections
  const handleAddMoreSections = () => {
    const newSections = [];
    for (let i = 0; i < ADD_SECTIONS_COUNT; i++) {
      newSections.push(createEmptySection());
    }
    setAnnotationSections([...annotationSections, ...newSections]);
  };

  // Update annotation section field
  const updateSection = (index, field, value) => {
    setAnnotationSections((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setFormError(null);
  };

  // Update property in section
  const updateSectionProperty = (sectionIndex, propType, field, value) => {
    setAnnotationSections((prev) => {
      const updated = [...prev];
      const properties = { ...updated[sectionIndex].properties };
      if (!properties[propType]) {
        properties[propType] = { value: '', description: '' };
      }
      properties[propType] = { ...properties[propType], [field]: value };
      updated[sectionIndex] = { ...updated[sectionIndex], properties };
      return updated;
    });
  };

  // Open observable browse modal for a section
  const openObservableModal = (sectionIndex) => {
    setObservableModalSectionIndex(sectionIndex);
    setObservableModalOpen(true);
  };

  // Handle observable selection from modal
  const handleObservableSelect = (selectedTerms) => {
    if (observableModalSectionIndex !== null) {
      updateSection(observableModalSectionIndex, 'observables', selectedTerms);
    }
  };

  // Remove observable from section
  const removeObservable = (sectionIndex, term) => {
    const section = annotationSections[sectionIndex];
    const newObservables = section.observables.filter((o) => o !== term);
    updateSection(sectionIndex, 'observables', newObservables);
  };

  // Submit all annotations
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      let successCount = 0;

      for (const section of annotationSections) {
        // Skip empty sections
        if (
          !section.experiment_type &&
          !section.mutant_type &&
          section.observables.length === 0
        ) {
          continue;
        }

        // Validate required fields
        if (!section.reference_no && !section.pubmed) {
          throw new Error('Reference is required: Please enter a PubMed ID or Reference number');
        }
        if (!section.experiment_type) {
          throw new Error('Experiment type is required: Please select an experiment type');
        }
        if (!section.mutant_type) {
          throw new Error('Mutant type is required: Please select a mutant type');
        }
        if (section.observables.length === 0) {
          throw new Error('Observable is required: Please select at least one observable');
        }
        // Check strain_background is filled
        if (!section.properties?.strain_background?.value) {
          throw new Error('Strain background is required: Please select a strain background');
        }

        // Parse reference fields - backend accepts either reference_no or pubmed
        const refNo = section.reference_no ? parseInt(section.reference_no, 10) : null;
        const pubmedId = section.pubmed ? parseInt(section.pubmed, 10) : null;

        if (!refNo && !pubmedId) {
          throw new Error('Valid reference number or PubMed ID is required');
        }

        // Build properties array
        const properties = [];
        for (const [propType, propData] of Object.entries(section.properties)) {
          if (propData.value) {
            properties.push({
              property_type: propType,
              property_value: propData.value,
              property_description: propData.description || null,
            });
          }
        }

        // Build list of features to annotate (main feature + feature_list)
        const featuresToAnnotate = [featureName];
        if (section.feature_list) {
          const additionalFeatures = section.feature_list
            .split('|')
            .map((f) => f.trim())
            .filter(Boolean);
          featuresToAnnotate.push(...additionalFeatures);
        }

        // Create annotation for each feature and observable
        for (const targetFeature of featuresToAnnotate) {
          for (const observable of section.observables) {
            const data = {
              experiment_type: section.experiment_type,
              mutant_type: section.mutant_type,
              observable: observable,
              qualifier: section.qualifier || null,
              experiment_comment: section.experiment_comment || null,
            };

            // Add reference identifier (backend accepts reference_no or pubmed)
            if (refNo) {
              data.reference_no = refNo;
            } else if (pubmedId) {
              data.pubmed = pubmedId;
            }

            if (properties.length > 0) {
              data.properties = properties;
            }

            // Include organism to disambiguate features with same name across species
            const organismParam = searchParams.get('organism') || selectedOrganism;
            if (organismParam) {
              data.organism = organismParam;
            }

            await phenotypeCurationApi.createAnnotation(targetFeature, data);
            successCount++;
          }
        }
      }

      if (successCount > 0) {
        setSuccessMessage(`Created ${successCount} annotation(s) successfully`);
        // Keep form data so curator can adjust and submit another annotation
        // Clear observables and feature_list since those were just submitted
        setAnnotationSections((prev) =>
          prev.map((section) => ({
            ...section,
            observables: [], // Clear observables since they were submitted
            feature_list: '', // Clear feature_list since those features were annotated
          }))
        );
        loadAnnotations();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setFormError('No annotations to create. Please fill in at least one section.');
      }
    } catch (err) {
      setFormError(
        err.response?.data?.detail || err.message || 'Failed to create annotations'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Show search form if no feature name
  if (!featureName) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Phenotype Curation</h1>
          <div style={styles.headerRight}>
            <span>
              Curator: {user?.first_name} {user?.last_name}
            </span>
            <Link to="/curation" style={styles.headerLink}>
              Curator Central
            </Link>
          </div>
        </div>

        <div style={styles.searchForm}>
          <p>Enter a gene/feature name to curate phenotype annotations:</p>
          <form onSubmit={handleSearch} style={styles.searchFormInner}>
            <select
              value={selectedOrganism}
              onChange={(e) => setSelectedOrganism(e.target.value)}
              style={styles.organismSelect}
            >
              <option value="">Select species...</option>
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
              placeholder="Enter ORF/gene name"
              style={styles.searchInput}
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
        <div style={styles.loading}>Loading phenotype annotations...</div>
      </div>
    );
  }

  if (error && !featureData) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <Link to="/curation/phenotype">Search for another feature</Link>
        {' | '}
        <Link to="/curation">Back to Curator Central</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>
          Phenotype Curation: {featureData?.feature_name}
          {featureData?.gene_name && featureData.gene_name !== featureData.feature_name && (
            <span> / {featureData.gene_name}</span>
          )}
          {selectedOrganism && organisms.length > 0 && (
            <span style={styles.speciesInTitle}>
              {' '}({organisms.find(o => o.organism_abbrev === selectedOrganism)?.organism_name || selectedOrganism})
            </span>
          )}
        </h1>
        <div style={styles.headerRight}>
          <span>
            Curator: {user?.first_name} {user?.last_name}
          </span>
          <Link to="/curation/phenotype" style={styles.headerLink}>
            New Search
          </Link>
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

      {/* Existing Annotations */}
      <div style={styles.existingSection}>
        <h2 style={styles.existingHeader}>
          Current Data ({featureData?.annotations?.length || 0})
        </h2>

        {featureData?.annotations?.length === 0 ? (
          <p style={styles.noAnnotations}>
            No phenotype annotations found for this feature.
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Experiment Type</th>
                <th style={styles.th}>Mutant Type</th>
                <th style={styles.th}>Qualifier</th>
                <th style={styles.th}>Observable</th>
                <th style={styles.th}>Properties</th>
                <th style={styles.th}>Comment</th>
                <th style={styles.th}>Reference(s)</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {featureData?.annotations?.map((ann) => (
                <tr key={ann.pheno_annotation_no}>
                  <td style={styles.td}>{ann.experiment_type}</td>
                  <td style={styles.td}>{ann.mutant_type}</td>
                  <td style={styles.td}>{ann.qualifier || '-'}</td>
                  <td style={styles.td}>{ann.observable}</td>
                  <td style={styles.td}>
                    {ann.properties?.length > 0 ? (
                      <ul style={styles.propertyList}>
                        {ann.properties.map((prop, idx) => (
                          <li key={idx}>
                            {prop.property_type}|{prop.property_value}
                            {prop.property_description &&
                              `|${prop.property_description}`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={styles.td}>
                    {ann.experiment?.experiment_comment || '-'}
                  </td>
                  <td style={styles.td}>
                    {ann.references?.map((ref, idx) => (
                      <div key={idx} style={styles.refItem}>
                        {renderCitationItem(ref, { itemClassName: '' })}
                      </div>
                    ))}
                  </td>
                  <td style={styles.td}>
                    <label style={styles.deleteLabel}>
                      <input
                        type="checkbox"
                        onChange={() => handleDelete(ann.pheno_annotation_no)}
                      />
                      {' '}delete
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Annotation Form */}
      <form onSubmit={handleSubmit}>
        <div style={styles.newEntryHeader}>
          <strong>Enter new data below:</strong>
        </div>

        {formError && <div style={styles.formError}>{formError}</div>}

        {annotationSections.map((section, sectionIndex) => (
          <div key={sectionIndex} style={styles.annotationSection}>
            {/* Main fields row */}
            <table style={styles.sectionTable}>
              <thead>
                <tr>
                  <th style={styles.sectionTh}>Reference</th>
                  <th style={styles.sectionTh}>Experiment type</th>
                  <th style={styles.sectionTh}>Mutant type</th>
                  <th style={styles.sectionTh}>Qualifier</th>
                  <th style={styles.sectionTh}>Observable</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.sectionTd}>
                    <div style={styles.refFields}>
                      <label>
                        <small>PubMed:</small>
                        <input
                          type="text"
                          value={section.pubmed}
                          onChange={(e) =>
                            updateSection(sectionIndex, 'pubmed', e.target.value)
                          }
                          style={styles.refInput}
                        />
                      </label>
                      <label>
                        <small>or RefNo:</small>
                        <input
                          type="text"
                          value={section.reference_no}
                          onChange={(e) =>
                            updateSection(sectionIndex, 'reference_no', e.target.value)
                          }
                          style={styles.refInput}
                        />
                      </label>
                    </div>
                  </td>
                  <td style={styles.sectionTd}>
                    <CVTreeSelect
                      cvName="experiment_type"
                      value={section.experiment_type}
                      onChange={(val) =>
                        updateSection(sectionIndex, 'experiment_type', val)
                      }
                      style={styles.cvSelect}
                    />
                  </td>
                  <td style={styles.sectionTd}>
                    <CVTreeSelect
                      cvName="mutant_type"
                      value={section.mutant_type}
                      onChange={(val) =>
                        updateSection(sectionIndex, 'mutant_type', val)
                      }
                      style={styles.cvSelect}
                    />
                  </td>
                  <td style={styles.sectionTd}>
                    <CVTreeSelect
                      cvName="qualifier"
                      value={section.qualifier}
                      onChange={(val) =>
                        updateSection(sectionIndex, 'qualifier', val)
                      }
                      placeholder="-- no selection --"
                      style={styles.cvSelect}
                    />
                  </td>
                  <td style={styles.sectionTd}>
                    <div style={styles.observableField}>
                      <select
                        multiple
                        value={section.observables}
                        readOnly
                        style={styles.observableSelect}
                      >
                        {section.observables.map((obs, idx) => (
                          <option key={idx} value={obs}>
                            {obs}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => openObservableModal(sectionIndex)}
                        style={styles.browseButton}
                      >
                        Browse Observables
                      </button>
                      {section.observables.length > 0 && (
                        <div style={styles.selectedObservables}>
                          {section.observables.map((obs) => (
                            <span key={obs} style={styles.observableTag}>
                              {obs}
                              <button
                                type="button"
                                onClick={() => removeObservable(sectionIndex, obs)}
                                style={styles.removeObsBtn}
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Experiment Comment */}
            <div style={styles.commentRow}>
              <label>
                <strong>Experiment_comment:</strong>{' '}
                <input
                  type="text"
                  value={section.experiment_comment}
                  onChange={(e) =>
                    updateSection(sectionIndex, 'experiment_comment', e.target.value)
                  }
                  style={styles.commentInput}
                />
              </label>
            </div>

            {/* Property Types */}
            <div style={styles.propertiesSection}>
              <table style={styles.propertyTable}>
                <thead>
                  <tr>
                    <th style={styles.propTh}>Property_type</th>
                    <th style={styles.propTh}>Property_value</th>
                    <th style={styles.propTh}>Property_description</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyTypes.map((propType) => (
                    <tr key={propType}>
                      <td style={styles.propTd}>{propType}</td>
                      <td style={styles.propTd}>
                        {PROPERTY_CV_MAP[propType] ? (
                          <CVTreeSelect
                            cvName={PROPERTY_CV_MAP[propType]}
                            value={section.properties[propType]?.value || ''}
                            onChange={(val) =>
                              updateSectionProperty(sectionIndex, propType, 'value', val)
                            }
                            placeholder="-- select --"
                            style={styles.propInput}
                          />
                        ) : (
                          <input
                            type="text"
                            value={section.properties[propType]?.value || ''}
                            onChange={(e) =>
                              updateSectionProperty(
                                sectionIndex,
                                propType,
                                'value',
                                e.target.value
                              )
                            }
                            placeholder={propType === 'chebi_ontology' ? 'CHEBI:12345 | CHEBI:67890' : ''}
                            style={styles.propInput}
                          />
                        )}
                        {ALLOW_MULTIPLES_TYPES.includes(propType) && (
                          <div style={styles.multiplesNote}>
                            allows multiples, separate by |
                          </div>
                        )}
                        {propType === 'chebi_ontology' && (
                          <div style={styles.chebiSearchLink}>
                            <a
                              href="https://www.ebi.ac.uk/chebi/advancedSearchFT.do"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Search CHEBI at EBI
                            </a>
                            {' '}to find chemical IDs
                          </div>
                        )}
                      </td>
                      <td style={styles.propTd}>
                        <input
                          type="text"
                          value={section.properties[propType]?.description || ''}
                          onChange={(e) =>
                            updateSectionProperty(
                              sectionIndex,
                              propType,
                              'description',
                              e.target.value
                            )
                          }
                          style={styles.propInput}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Feature list for shared annotations */}
            <div style={styles.featureListRow}>
              <span>
                Enter gene/feature names that will share all checked annotations.
                Note, only <em style={{ color: 'red' }}>{selectedOrganism ? organisms.find(o => o.organism_abbrev === selectedOrganism)?.organism_name || selectedOrganism : 'selected species'}</em> genes are allowed here.
              </span>
              <input
                type="text"
                value={section.feature_list}
                onChange={(e) =>
                  updateSection(sectionIndex, 'feature_list', e.target.value)
                }
                style={styles.featureListInput}
              />
              <span style={styles.separatorNote}>separate multiples by |</span>
            </div>

            {/* Section divider */}
            <hr style={styles.sectionHr} />
          </div>
        ))}

        {/* Buttons at bottom - outside the section loop */}
        <div style={styles.formButtons}>
          <button
            type="button"
            onClick={handleAddMoreSections}
            style={styles.moreRowsBtn}
          >
            + More Phenotype Rows
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={styles.submitBtn}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
          <button type="reset" style={styles.resetBtn}>
            Reset
          </button>
        </div>
      </form>

      {/* Observable Browse Modal */}
      <ObservableBrowseModal
        isOpen={observableModalOpen}
        onClose={() => setObservableModalOpen(false)}
        onSelect={handleObservableSelect}
        selectedTerms={
          observableModalSectionIndex !== null
            ? annotationSections[observableModalSectionIndex]?.observables || []
            : []
        }
      />
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
  speciesInTitle: {
    fontSize: '0.85em',
    fontWeight: 'normal',
    color: '#666',
    fontStyle: 'italic',
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
  searchForm: {
    padding: '2rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
    textAlign: 'center',
  },
  searchFormInner: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  searchInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '300px',
  },
  searchButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  organismSelect: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '200px',
  },
  existingSection: {
    marginBottom: '1.5rem',
    padding: '0.5rem',
    border: '1px solid #ddd',
  },
  existingHeader: {
    backgroundColor: '#CCCCFF',
    padding: '0.5rem',
    margin: '-0.5rem -0.5rem 0.5rem -0.5rem',
  },
  noAnnotations: {
    padding: '1rem',
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  th: {
    textAlign: 'center',
    padding: '0.5rem',
    borderBottom: '2px solid #333',
    backgroundColor: '#f5f5f5',
  },
  td: {
    padding: '0.5rem',
    borderBottom: '1px solid #ddd',
    verticalAlign: 'top',
  },
  propertyList: {
    margin: 0,
    padding: '0 0 0 1rem',
    fontSize: '0.8rem',
  },
  deleteLabel: {
    fontSize: '0.85rem',
  },
  refItem: {
    marginBottom: '0.5rem',
  },
  newEntryHeader: {
    backgroundColor: '#CCCCFF',
    padding: '0.5rem',
    marginBottom: '1rem',
  },
  formError: {
    padding: '0.75rem',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c00',
    marginBottom: '1rem',
  },
  annotationSection: {
    marginBottom: '0.5rem',
  },
  sectionTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '0.5rem',
  },
  sectionTh: {
    textAlign: 'center',
    padding: '0.5rem',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  sectionTd: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    verticalAlign: 'top',
  },
  refFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  refInput: {
    padding: '0.25rem',
    width: '80px',
    marginLeft: '0.25rem',
    border: '1px solid #ccc',
    borderRadius: '3px',
  },
  cvSelect: {
    width: '100%',
    maxWidth: '200px',
  },
  observableField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  observableSelect: {
    height: '100px',
    width: '200px',
    border: '1px solid #ccc',
    borderRadius: '3px',
  },
  browseButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  selectedObservables: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
  },
  observableTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.1rem 0.4rem',
    backgroundColor: '#e0f0ff',
    borderRadius: '3px',
    fontSize: '0.8rem',
  },
  removeObsBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#c00',
    fontSize: '1rem',
    lineHeight: 1,
  },
  commentRow: {
    padding: '0.5rem',
    backgroundColor: '#f9f9f9',
  },
  commentInput: {
    padding: '0.35rem',
    width: '400px',
    border: '1px solid #ccc',
    borderRadius: '3px',
  },
  propertiesSection: {
    padding: '0.5rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    marginTop: '0.5rem',
  },
  propertyTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  propTh: {
    textAlign: 'center',
    padding: '0.35rem',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    fontSize: '0.85rem',
  },
  propTd: {
    padding: '0.35rem',
    border: '1px solid #ddd',
    fontSize: '0.85rem',
  },
  propInput: {
    padding: '0.25rem',
    width: '90%',
    border: '1px solid #ccc',
    borderRadius: '3px',
  },
  sectionHr: {
    border: 'none',
    borderTop: '2px dashed #ccc',
    margin: '1rem 0',
  },
  formButtons: {
    display: 'flex',
    gap: '0.5rem',
    padding: '1rem 0',
    borderTop: '3px solid #6A6A6A',
    marginTop: '0.5rem',
  },
  moreRowsBtn: {
    padding: '0.4rem 0.75rem',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  submitBtn: {
    padding: '0.4rem 0.75rem',
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  resetBtn: {
    padding: '0.4rem 0.75rem',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  multiplesNote: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '0.25rem',
    fontStyle: 'italic',
  },
  chebiSearchLink: {
    fontSize: '0.8rem',
    marginTop: '0.25rem',
  },
  featureListRow: {
    padding: '0.5rem',
    backgroundColor: '#CCCCCC',
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  featureListInput: {
    padding: '0.35rem',
    width: '400px',
    border: '1px solid #ccc',
    borderRadius: '3px',
  },
  separatorNote: {
    fontSize: '0.85rem',
    color: '#666',
  },
};

export default PhenotypeCurationPage;

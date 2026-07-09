/**
 * New Feature Curation Page - Create new features (ORFs, genes, etc.)
 *
 * Allows curators to create new features with optional coordinates and references.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getOrganisms,
  getChromosomes,
  getFeatureTypes,
  getFeatureQualifiers,
  getStrands,
  checkFeatureExists,
  createFeature,
} from '../../api/featureCurationApi';
import litguideCurationApi from '../../api/litguideCurationApi';
import { filterAllowedOrganisms } from '../../constants/organisms';

export default function NewFeaturePage() {
  // State for dropdowns
  const [organisms, setOrganisms] = useState([]);
  const [chromosomes, setChromosomes] = useState([]);
  const [featureTypes, setFeatureTypes] = useState([]);
  const [qualifiers, setQualifiers] = useState([]);
  const [strands, setStrands] = useState([]);

  // Form state
  const [featureName, setFeatureName] = useState('');
  const [geneName, setGeneName] = useState('');
  const [featureType, setFeatureType] = useState('');
  const [organismAbbrev, setOrganismAbbrev] = useState('');
  const [chromosomeName, setChromosomeName] = useState('');
  const [startCoord, setStartCoord] = useState('');
  const [stopCoord, setStopCoord] = useState('');
  const [strand, setStrand] = useState('');
  const [selectedQualifiers, setSelectedQualifiers] = useState([]);
  const [referenceNo, setReferenceNo] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [featureExists, setFeatureExists] = useState(null);
  const [createdFeature, setCreatedFeature] = useState(null);

  // Reference search state
  const [refSearchQuery, setRefSearchQuery] = useState('');
  const [refSearchResults, setRefSearchResults] = useState([]);
  const [searchingRefs, setSearchingRefs] = useState(false);
  const [refSearchMessage, setRefSearchMessage] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [orgsData, typesData, qualsData, strandsData] = await Promise.all([
          getOrganisms(),
          getFeatureTypes(),
          getFeatureQualifiers(),
          getStrands(),
        ]);

        const filteredOrganisms = filterAllowedOrganisms(orgsData.organisms);
        setOrganisms(filteredOrganisms);
        setFeatureTypes(typesData.feature_types);
        setQualifiers(qualsData.qualifiers);
        setStrands(strandsData.strands);

        // Set default organism if available
        if (filteredOrganisms.length > 0) {
          setOrganismAbbrev(filteredOrganisms[0].organism_abbrev);
        }
      } catch (err) {
        setError('Failed to load form data: ' + (err.response?.data?.detail || err.message));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load chromosomes when organism changes.
  // Clear any previously selected chromosome and stale list first, and guard
  // against out-of-order responses: a slower fetch for a previously selected
  // organism must not overwrite the current organism's chromosomes.
  useEffect(() => {
    setChromosomes([]);
    setChromosomeName('');

    if (!organismAbbrev) {
      return;
    }

    let cancelled = false;
    const loadChromosomes = async () => {
      try {
        const data = await getChromosomes(organismAbbrev);
        if (!cancelled) {
          setChromosomes(data.chromosomes);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load chromosomes:', err);
          setChromosomes([]);
        }
      }
    };

    loadChromosomes();
    return () => {
      cancelled = true;
    };
  }, [organismAbbrev]);

  // Check if feature exists when name changes
  useEffect(() => {
    if (!featureName.trim()) {
      setFeatureExists(null);
      return;
    }

    const checkName = async () => {
      setChecking(true);
      try {
        const result = await checkFeatureExists(featureName.trim());
        setFeatureExists(result.exists ? result : null);
      } catch (err) {
        console.error('Failed to check feature:', err);
      } finally {
        setChecking(false);
      }
    };

    // Debounce the check
    const timer = setTimeout(checkName, 500);
    return () => clearTimeout(timer);
  }, [featureName]);

  // Search references
  const handleRefSearch = async () => {
    if (!refSearchQuery.trim()) return;

    setSearchingRefs(true);
    setRefSearchMessage(null);
    try {
      const data = await litguideCurationApi.searchReferences(refSearchQuery, 1, 10);
      const results = data.references || [];
      setRefSearchResults(results);
      if (results.length === 0) {
        setRefSearchMessage(`No references found for "${refSearchQuery.trim()}".`);
      }
    } catch (err) {
      console.error('Reference search failed:', err);
      setRefSearchResults([]);
      setRefSearchMessage(
        'Reference search failed: ' +
          (err.response?.data?.detail || err.message || 'Unknown error') +
          '. If this persists, try reloading the page or logging in again.'
      );
    } finally {
      setSearchingRefs(false);
    }
  };

  // Handle qualifier checkbox changes
  const handleQualifierChange = (qual) => {
    setSelectedQualifiers((prev) =>
      prev.includes(qual) ? prev.filter((q) => q !== qual) : [...prev, qual]
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!featureName.trim()) {
      setError('Feature name is required');
      return;
    }
    if (!featureType) {
      setError('Feature type is required');
      return;
    }
    if (!organismAbbrev) {
      setError('Organism is required');
      return;
    }

    // Validate coordinates if chromosome is selected
    if (chromosomeName && (!startCoord || !stopCoord)) {
      setError('Start and stop coordinates are required when chromosome is specified');
      return;
    }

    // Validate strand requirement
    const requiresStrand = !['not in systematic sequence', 'not physically mapped', 'ARS', 'ARS consensus sequence', 'telomere'].includes(featureType);
    if (chromosomeName && requiresStrand && !strand) {
      setError(`Strand is required for feature type '${featureType}'`);
      return;
    }

    setSubmitting(true);

    try {
      const data = {
        feature_name: featureName.trim(),
        feature_type: featureType,
        organism_abbrev: organismAbbrev,
      };

      if (geneName.trim()) {
        data.gene_name = geneName.trim();
      }

      if (chromosomeName) {
        data.chromosome_name = chromosomeName;
        data.start_coord = parseInt(startCoord, 10);
        data.stop_coord = parseInt(stopCoord, 10);
        if (strand) data.strand = strand;
      }

      if (selectedQualifiers.length > 0) {
        data.qualifiers = selectedQualifiers;
      }

      if (referenceNo) {
        data.reference_no = parseInt(referenceNo, 10);
      }

      const result = await createFeature(data);
      setSuccess(result.message);
      setCreatedFeature(result);

      // Clear form
      setFeatureName('');
      setGeneName('');
      setFeatureType('');
      setChromosomeName('');
      setStartCoord('');
      setStopCoord('');
      setStrand('');
      setSelectedQualifiers([]);
      setReferenceNo('');
      setFeatureExists(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create feature');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backTop}>
        <Link to="/curation" style={styles.link}>
          &larr; Back to Curator Central
        </Link>
      </div>

      <h1 style={styles.title}>Add a New Feature</h1>

      <p style={styles.subtitle}>
        Use this form to add a new feature (ORF, gene, etc.) to the database.
        For mapped features, provide chromosome, coordinates, and strand.
      </p>

      {error && <div style={styles.error}>{error}</div>}

      {success && (
        <div style={styles.success}>
          {success}
          {createdFeature && (
            <div style={styles.successLinkRow}>
              <Link
                to={`/curation/locus/${createdFeature.feature_name}`}
                style={styles.successLink}
              >
                Go to Locus Curation Page for {createdFeature.feature_name}
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Feature Name */}
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>Feature Name</h2>
          <div style={styles.inlineRow}>
            <input
              type="text"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              placeholder="Enter systematic name (e.g., orf19.1234)"
              style={styles.textInput}
              required
            />
            {checking && <span style={styles.muted}>Checking...</span>}
          </div>
          {featureExists && (
            <div style={styles.warningBox}>
              <strong>Warning:</strong> This name already exists as{' '}
              <strong>{featureExists.feature_name}</strong>
              {featureExists.gene_name && ` (${featureExists.gene_name})`} -{' '}
              {featureExists.feature_type}
            </div>
          )}

          <label style={styles.subFieldLabel}>Standard Gene Name (Optional)</label>
          <input
            type="text"
            value={geneName}
            onChange={(e) => setGeneName(e.target.value)}
            placeholder="Standard gene name, e.g. CDR1"
            style={styles.textInput}
          />
          <p style={styles.hint}>
            Leave blank if the feature has no standard gene name yet.
          </p>
        </div>

        {/* Organism Selection */}
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>Organism</h2>
          <select
            value={organismAbbrev}
            onChange={(e) => setOrganismAbbrev(e.target.value)}
            style={styles.select}
            required
          >
            <option value="">-- Select Organism --</option>
            {organisms.map((org) => (
              <option key={org.organism_abbrev} value={org.organism_abbrev}>
                {org.organism_name}
              </option>
            ))}
          </select>
        </div>

        {/* Feature Type */}
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>Feature Type</h2>
          <select
            value={featureType}
            onChange={(e) => setFeatureType(e.target.value)}
            style={styles.select}
            required
          >
            <option value="">-- Select Feature Type --</option>
            {featureTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Feature Qualifiers */}
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>Feature Qualifiers (Optional)</h2>
          <div style={styles.qualifierGrid}>
            {qualifiers.map((qual) => (
              <label key={qual} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedQualifiers.includes(qual)}
                  onChange={() => handleQualifierChange(qual)}
                />
                {qual}
              </label>
            ))}
          </div>
        </div>

        {/* Positional Info */}
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>Positional Information (For Mapped Features)</h2>
          <p style={styles.hint}>
            Leave blank for unmapped features (not physically mapped, not in systematic sequence).
          </p>

          <div style={styles.coordGrid}>
            <div>
              <label style={styles.fieldLabel}>Chromosome / Contig</label>
              <select
                value={chromosomeName}
                onChange={(e) => setChromosomeName(e.target.value)}
                style={styles.select}
              >
                <option value="">-- Select Chromosome / Contig --</option>
                {chromosomes.map((chr) => (
                  <option key={chr.feature_no} value={chr.feature_name}>
                    {chr.feature_name}
                  </option>
                ))}
              </select>
              {organismAbbrev && chromosomes.length === 0 && (
                <p style={styles.hint}>
                  No chromosomes or contigs are available for this organism. Leave the
                  positional fields blank to create an unmapped feature.
                </p>
              )}
            </div>

            <div>
              <label style={styles.fieldLabel}>Strand</label>
              <select
                value={strand}
                onChange={(e) => setStrand(e.target.value)}
                style={styles.select}
                disabled={!chromosomeName}
              >
                <option value="">-- Select Strand --</option>
                {strands.map((s) => (
                  <option key={s} value={s}>
                    {s === 'W' ? 'W (Watson/Forward)' : 'C (Crick/Reverse)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.fieldLabel}>Start Coordinate</label>
              <input
                type="number"
                value={startCoord}
                onChange={(e) => setStartCoord(e.target.value)}
                style={styles.select}
                disabled={!chromosomeName}
                placeholder="e.g., 12345"
              />
            </div>

            <div>
              <label style={styles.fieldLabel}>Stop Coordinate</label>
              <input
                type="number"
                value={stopCoord}
                onChange={(e) => setStopCoord(e.target.value)}
                style={styles.select}
                disabled={!chromosomeName}
                placeholder="e.g., 13456"
              />
            </div>
          </div>

          {strand && (
            <p style={styles.hint}>
              {strand === 'W'
                ? 'Watson strand: start_coord should be < stop_coord'
                : 'Crick strand: start_coord should be > stop_coord'}
            </p>
          )}
        </div>

        {/* Reference */}
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>Reference (Optional)</h2>

          <div style={styles.refSearchRow}>
            <input
              type="text"
              value={refSearchQuery}
              onChange={(e) => setRefSearchQuery(e.target.value)}
              placeholder="Search by PubMed ID, title, or citation"
              style={styles.textInputFlex}
            />
            <button
              type="button"
              onClick={handleRefSearch}
              disabled={searchingRefs}
              style={styles.secondaryButton}
            >
              {searchingRefs ? 'Searching...' : 'Search'}
            </button>
          </div>

          {refSearchMessage && (
            <div style={styles.refSearchMessage}>{refSearchMessage}</div>
          )}

          {refSearchResults.length > 0 && (
            <div style={styles.refResults}>
              {refSearchResults.map((ref) => (
                <div
                  key={ref.reference_no}
                  onClick={() => {
                    setReferenceNo(ref.reference_no.toString());
                    setRefSearchResults([]);
                    setRefSearchMessage(null);
                  }}
                  style={styles.refResultItem}
                >
                  <span style={styles.bold}>
                    {ref.pubmed ? `PMID:${ref.pubmed}` : `Ref:${ref.reference_no}`}
                  </span>
                  {' - '}
                  <span style={styles.muted}>
                    {ref.citation || ref.title || 'No title'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={styles.inlineRow}>
            <label style={styles.bold}>Reference No:</label>
            <input
              type="number"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              style={styles.coordInput}
              placeholder="e.g., 12345"
            />
            {referenceNo && (
              <button
                type="button"
                onClick={() => setReferenceNo('')}
                style={styles.clearButton}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Submit */}
        <div style={styles.buttonRow}>
          <button
            type="submit"
            disabled={submitting || !!featureExists}
            style={{
              ...styles.primaryButton,
              ...(submitting || featureExists ? styles.disabledButton : {}),
            }}
          >
            {submitting ? 'Creating...' : 'Create Feature'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFeatureName('');
              setGeneName('');
              setFeatureType('');
              setChromosomeName('');
              setStartCoord('');
              setStopCoord('');
              setStrand('');
              setSelectedQualifiers([]);
              setReferenceNo('');
              setFeatureExists(null);
              setError(null);
              setSuccess(null);
            }}
            style={styles.secondaryButton}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '1rem auto', padding: '1rem' },
  loading: { padding: '2rem', textAlign: 'center', color: '#666' },
  backTop: { marginBottom: '1rem' },
  link: { color: '#0066cc', textDecoration: 'none' },
  title: { marginBottom: '0.5rem' },
  subtitle: { marginBottom: '1.5rem', color: '#666' },
  error: {
    padding: '0.75rem', backgroundColor: '#fee', border: '1px solid #c00',
    borderRadius: '4px', color: '#c00', marginBottom: '1rem',
  },
  success: {
    padding: '0.75rem', backgroundColor: '#e6f4ea', border: '1px solid #34a853',
    borderRadius: '4px', color: '#0a6e2e', marginBottom: '1rem',
  },
  successLinkRow: { marginTop: '0.5rem' },
  successLink: { color: '#0a6e2e', textDecoration: 'underline', fontWeight: 600 },
  section: {
    backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px',
    padding: '1rem', marginBottom: '1.25rem',
  },
  sectionHeader: {
    backgroundColor: '#CCCCFF', padding: '0.4rem 0.6rem', margin: '-1rem -1rem 1rem -1rem',
    borderRadius: '6px 6px 0 0', fontSize: '1rem',
  },
  inlineRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
  textInput: {
    flex: 1, minWidth: '260px', padding: '0.45rem', fontSize: '1rem',
    border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'monospace',
  },
  textInputFlex: {
    flex: 1, minWidth: '260px', padding: '0.45rem', fontSize: '1rem',
    border: '1px solid #ccc', borderRadius: '4px',
  },
  select: {
    width: '100%', padding: '0.45rem', fontSize: '1rem',
    border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box',
  },
  coordInput: {
    width: '140px', padding: '0.45rem', fontSize: '1rem',
    border: '1px solid #ccc', borderRadius: '4px',
  },
  fieldLabel: { display: 'block', fontWeight: 600, marginBottom: '0.3rem' },
  subFieldLabel: { display: 'block', fontWeight: 600, margin: '1rem 0 0.3rem' },
  hint: { fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' },
  qualifierGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem',
  },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  coordGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem',
  },
  warningBox: {
    marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: '#fff3cd',
    border: '1px solid #ffc107', borderRadius: '4px', color: '#856404',
  },
  refSearchRow: { display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' },
  refSearchMessage: {
    marginBottom: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: '#f8f9fa',
    border: '1px solid #ddd', borderRadius: '4px', color: '#555', fontSize: '0.9rem',
  },
  refResults: {
    border: '1px solid #ddd', borderRadius: '4px', maxHeight: '10rem',
    overflowY: 'auto', marginBottom: '0.75rem',
  },
  refResultItem: {
    padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #eee',
  },
  bold: { fontWeight: 600 },
  muted: { color: '#888', fontSize: '0.9rem' },
  buttonRow: { display: 'flex', gap: '1rem', marginTop: '0.5rem' },
  primaryButton: {
    padding: '0.5rem 1.5rem', fontSize: '1rem', backgroundColor: '#0066cc',
    color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
  },
  secondaryButton: {
    padding: '0.5rem 1rem', fontSize: '0.95rem', backgroundColor: '#6c757d',
    color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
  },
  clearButton: {
    background: 'none', border: 'none', color: '#c0392b',
    cursor: 'pointer', textDecoration: 'underline', padding: 0,
  },
  disabledButton: { opacity: 0.5, cursor: 'not-allowed' },
};

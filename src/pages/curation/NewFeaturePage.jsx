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
import { searchReferences } from '../../api/referenceCurationApi';

export default function NewFeaturePage() {
  // State for dropdowns
  const [organisms, setOrganisms] = useState([]);
  const [chromosomes, setChromosomes] = useState([]);
  const [featureTypes, setFeatureTypes] = useState([]);
  const [qualifiers, setQualifiers] = useState([]);
  const [strands, setStrands] = useState([]);

  // Form state
  const [featureName, setFeatureName] = useState('');
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

        setOrganisms(orgsData.organisms);
        setFeatureTypes(typesData.feature_types);
        setQualifiers(qualsData.qualifiers);
        setStrands(strandsData.strands);

        // Set default organism if available
        if (orgsData.organisms.length > 0) {
          setOrganismAbbrev(orgsData.organisms[0].organism_abbrev);
        }
      } catch (err) {
        setError('Failed to load form data: ' + (err.response?.data?.detail || err.message));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load chromosomes when organism changes
  useEffect(() => {
    if (!organismAbbrev) {
      setChromosomes([]);
      return;
    }

    const loadChromosomes = async () => {
      try {
        const data = await getChromosomes(organismAbbrev);
        setChromosomes(data.chromosomes);
      } catch (err) {
        console.error('Failed to load chromosomes:', err);
        setChromosomes([]);
      }
    };

    loadChromosomes();
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
    try {
      const data = await searchReferences(refSearchQuery, 1, 10);
      setRefSearchResults(data.references);
    } catch (err) {
      console.error('Reference search failed:', err);
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
      <div className="container mx-auto p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link to="/curation" className="text-blue-600 hover:underline">
          &larr; Back to Curator Central
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Add a New Feature</h1>

      <p className="mb-4 text-gray-600">
        Use this form to add a new feature (ORF, gene, etc.) to the database.
        For mapped features, provide chromosome, coordinates, and strand.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
          {createdFeature && (
            <div className="mt-2">
              <Link
                to={`/curation/locus/${createdFeature.feature_name}`}
                className="text-green-800 underline"
              >
                Go to Locus Curation Page for {createdFeature.feature_name}
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Feature Name */}
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-3">Feature Name</h2>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              placeholder="Enter systematic name (e.g., orf19.1234)"
              className="flex-1 border rounded px-3 py-2"
              required
            />
            {checking && <span className="text-gray-500">Checking...</span>}
          </div>
          {featureExists && (
            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-yellow-800">
              <strong>Warning:</strong> This name already exists as{' '}
              <strong>{featureExists.feature_name}</strong>
              {featureExists.gene_name && ` (${featureExists.gene_name})`} -{' '}
              {featureExists.feature_type}
            </div>
          )}
        </div>

        {/* Organism Selection */}
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-3">Organism</h2>
          <select
            value={organismAbbrev}
            onChange={(e) => setOrganismAbbrev(e.target.value)}
            className="w-full border rounded px-3 py-2"
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
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-3">Feature Type</h2>
          <select
            value={featureType}
            onChange={(e) => setFeatureType(e.target.value)}
            className="w-full border rounded px-3 py-2"
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
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-3">Feature Qualifiers (Optional)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {qualifiers.map((qual) => (
              <label key={qual} className="flex items-center gap-2">
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
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-3">Positional Information (For Mapped Features)</h2>
          <p className="text-sm text-gray-600 mb-3">
            Leave blank for unmapped features (not physically mapped, not in systematic sequence).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Chromosome</label>
              <select
                value={chromosomeName}
                onChange={(e) => setChromosomeName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Select Chromosome --</option>
                {chromosomes.map((chr) => (
                  <option key={chr.feature_no} value={chr.feature_name}>
                    {chr.feature_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Strand</label>
              <select
                value={strand}
                onChange={(e) => setStrand(e.target.value)}
                className="w-full border rounded px-3 py-2"
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
              <label className="block font-medium mb-1">Start Coordinate</label>
              <input
                type="number"
                value={startCoord}
                onChange={(e) => setStartCoord(e.target.value)}
                className="w-full border rounded px-3 py-2"
                disabled={!chromosomeName}
                placeholder="e.g., 12345"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Stop Coordinate</label>
              <input
                type="number"
                value={stopCoord}
                onChange={(e) => setStopCoord(e.target.value)}
                className="w-full border rounded px-3 py-2"
                disabled={!chromosomeName}
                placeholder="e.g., 13456"
              />
            </div>
          </div>

          {strand && (
            <p className="mt-2 text-sm text-gray-600">
              {strand === 'W'
                ? 'Watson strand: start_coord should be < stop_coord'
                : 'Crick strand: start_coord should be > stop_coord'}
            </p>
          )}
        </div>

        {/* Reference */}
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-3">Reference (Optional)</h2>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={refSearchQuery}
              onChange={(e) => setRefSearchQuery(e.target.value)}
              placeholder="Search by PubMed ID, title, or citation"
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              type="button"
              onClick={handleRefSearch}
              disabled={searchingRefs}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              {searchingRefs ? 'Searching...' : 'Search'}
            </button>
          </div>

          {refSearchResults.length > 0 && (
            <div className="border rounded max-h-40 overflow-y-auto mb-3">
              {refSearchResults.map((ref) => (
                <div
                  key={ref.reference_no}
                  onClick={() => {
                    setReferenceNo(ref.reference_no.toString());
                    setRefSearchResults([]);
                  }}
                  className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                >
                  <span className="font-medium">
                    {ref.pubmed ? `PMID:${ref.pubmed}` : `Ref:${ref.reference_no}`}
                  </span>
                  {' - '}
                  <span className="text-sm text-gray-600">
                    {ref.citation || ref.title || 'No title'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="font-medium">Reference No:</label>
            <input
              type="number"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="border rounded px-3 py-2 w-32"
              placeholder="e.g., 12345"
            />
            {referenceNo && (
              <button
                type="button"
                onClick={() => setReferenceNo('')}
                className="text-red-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting || !!featureExists}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Feature'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFeatureName('');
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
            className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

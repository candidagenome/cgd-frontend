/**
 * New Location Page - Add genomic location to an existing feature.
 *
 * Used when a feature needs coordinates added for an additional assembly/genome version.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getOrganisms,
  getChromosomes,
  getStrands,
  getFeatureInfo,
  addLocation,
} from '../../api/featureCurationApi';
import { filterAllowedOrganisms } from '../../constants/organisms';

export default function NewLocationPage() {
  // State for dropdowns
  const [organisms, setOrganisms] = useState([]);
  const [chromosomes, setChromosomes] = useState([]);
  const [strands, setStrands] = useState([]);

  // Form state
  const [featureName, setFeatureName] = useState('');
  const [organismAbbrev, setOrganismAbbrev] = useState('');
  const [chromosomeName, setChromosomeName] = useState('');
  const [startCoord, setStartCoord] = useState('');
  const [stopCoord, setStopCoord] = useState('');
  const [strand, setStrand] = useState('');

  // Feature info state
  const [featureInfo, setFeatureInfo] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [orgsData, strandsData] = await Promise.all([
          getOrganisms(),
          getStrands(),
        ]);

        const filteredOrganisms = filterAllowedOrganisms(orgsData.organisms);
        setOrganisms(filteredOrganisms);
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

  // Look up feature info
  const handleLookupFeature = async () => {
    if (!featureName.trim() || !organismAbbrev) {
      setError('Please enter a feature name and select an organism');
      return;
    }

    setLookingUp(true);
    setError(null);
    setFeatureInfo(null);

    try {
      const data = await getFeatureInfo(organismAbbrev, featureName.trim());
      if (data.found) {
        setFeatureInfo(data);
      } else {
        setError(`Feature '${featureName}' not found for the selected organism`);
      }
    } catch (err) {
      setError('Failed to look up feature: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLookingUp(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!featureInfo) {
      setError('Please look up a valid feature first');
      return;
    }
    if (!chromosomeName) {
      setError('Chromosome is required');
      return;
    }
    if (!startCoord || !stopCoord) {
      setError('Start and stop coordinates are required');
      return;
    }

    // Validate strand for certain feature types
    const noStrandTypes = ['ARS', 'ARS consensus sequence', 'telomere'];
    if (!noStrandTypes.includes(featureInfo.feature_type) && !strand) {
      setError(`Strand is required for feature type '${featureInfo.feature_type}'`);
      return;
    }

    setSubmitting(true);

    try {
      const data = {
        feature_name: featureInfo.feature_name,
        organism_abbrev: organismAbbrev,
        chromosome_name: chromosomeName,
        start_coord: parseInt(startCoord, 10),
        stop_coord: parseInt(stopCoord, 10),
      };

      if (strand) {
        data.strand = strand;
      }

      const result = await addLocation(data);
      setSuccess(result.message);

      // Clear form (keep feature info for reference)
      setChromosomeName('');
      setStartCoord('');
      setStopCoord('');
      setStrand('');

      // Refresh feature info to show new location
      const refreshed = await getFeatureInfo(organismAbbrev, featureInfo.feature_name);
      if (refreshed.found) {
        setFeatureInfo(refreshed);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add location');
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

      <h1 className="text-2xl font-bold mb-6">Add New Location for Existing Feature</h1>

      <p className="mb-4 text-gray-600">
        Use this form to add new genomic coordinates (location) for an existing feature.
        This is mainly used when adding coordinates for a feature in an additional assembly.
      </p>

      <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-6">
        <strong>Note:</strong> After adding a new location, use the &quot;Update Feature
        Sequence and Coords&quot; and &quot;Recreate Sequence Files&quot; tools to load
        the sequence data and add subfeatures.
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Feature Lookup */}
      <div className="bg-white border rounded p-4 mb-6">
        <h2 className="font-semibold mb-3">Step 1: Look Up Feature</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1">Organism</label>
            <select
              value={organismAbbrev}
              onChange={(e) => {
                setOrganismAbbrev(e.target.value);
                setFeatureInfo(null);
              }}
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

          <div>
            <label className="block font-medium mb-1">Feature Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureName}
                onChange={(e) => {
                  setFeatureName(e.target.value);
                  setFeatureInfo(null);
                }}
                placeholder="Enter feature/gene name"
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                type="button"
                onClick={handleLookupFeature}
                disabled={lookingUp}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {lookingUp ? 'Looking up...' : 'Look Up'}
              </button>
            </div>
          </div>
        </div>

        {/* Feature Info Display */}
        {featureInfo && (
          <div className="mt-4 p-4 bg-gray-50 border rounded">
            <h3 className="font-semibold mb-2">Feature Found</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Feature Name:</span>{' '}
                <strong>{featureInfo.feature_name}</strong>
              </div>
              {featureInfo.gene_name && (
                <div>
                  <span className="text-gray-600">Gene Name:</span>{' '}
                  <strong>{featureInfo.gene_name}</strong>
                </div>
              )}
              <div>
                <span className="text-gray-600">Feature Type:</span>{' '}
                <strong>{featureInfo.feature_type}</strong>
              </div>
              <div>
                <span className="text-gray-600">Feature No:</span>{' '}
                <strong>{featureInfo.feature_no}</strong>
              </div>
            </div>

            {/* Existing Locations */}
            {featureInfo.locations && featureInfo.locations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Existing Locations:</h4>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1 text-left">Chromosome</th>
                      <th className="border px-2 py-1 text-left">Start</th>
                      <th className="border px-2 py-1 text-left">Stop</th>
                      <th className="border px-2 py-1 text-left">Strand</th>
                      <th className="border px-2 py-1 text-left">Current</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureInfo.locations.map((loc) => (
                      <tr key={loc.feat_location_no}>
                        <td className="border px-2 py-1">{loc.chromosome || '-'}</td>
                        <td className="border px-2 py-1">{loc.start_coord}</td>
                        <td className="border px-2 py-1">{loc.stop_coord}</td>
                        <td className="border px-2 py-1">{loc.strand || '-'}</td>
                        <td className="border px-2 py-1">{loc.is_current}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(!featureInfo.locations || featureInfo.locations.length === 0) && (
              <p className="mt-2 text-gray-600 italic">No existing locations found.</p>
            )}
          </div>
        )}
      </div>

      {/* Add Location Form */}
      {featureInfo && (
        <form onSubmit={handleSubmit}>
          <div className="bg-white border rounded p-4 mb-6">
            <h2 className="font-semibold mb-3">Step 2: Add New Location</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Chromosome</label>
                <select
                  value={chromosomeName}
                  onChange={(e) => setChromosomeName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
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
                  placeholder="e.g., 12345"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Stop Coordinate</label>
                <input
                  type="number"
                  value={stopCoord}
                  onChange={(e) => setStopCoord(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 13456"
                  required
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

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Adding Location...' : 'Add Location'}
            </button>
            <button
              type="button"
              onClick={() => {
                setChromosomeName('');
                setStartCoord('');
                setStopCoord('');
                setStrand('');
                setError(null);
                setSuccess(null);
              }}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Reset Form
            </button>
          </div>
        </form>
      )}

      {/* Link to locus curation after success */}
      {success && featureInfo && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="mb-2">
            <Link
              to={`/curation/locus/${featureInfo.feature_name}`}
              className="text-blue-600 hover:underline"
            >
              Go to Locus Curation Page for {featureInfo.feature_name}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

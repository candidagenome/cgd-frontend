/**
 * Link Curation Page - Add links and pull-downs to Locus page.
 *
 * Allows curators to manage which URL links appear on the Locus page for a feature.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getFeatureInfo,
  getAvailableLinks,
  getCurrentLinks,
  updateLinks,
} from '../../api/linkCurationApi';
import { getOrganisms } from '../../api/featureCurationApi';

export default function LinkCurationPage() {
  // State for organisms dropdown
  const [organisms, setOrganisms] = useState([]);

  // Form state
  const [featureName, setFeatureName] = useState('');
  const [organismAbbrev, setOrganismAbbrev] = useState('');

  // Feature info state
  const [featureInfo, setFeatureInfo] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);

  // Links state
  const [availableLinks, setAvailableLinks] = useState([]);
  const [currentLinks, setCurrentLinks] = useState(new Set());
  const [linkTableMap, setLinkTableMap] = useState({});
  const [loadingLinks, setLoadingLinks] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const orgsData = await getOrganisms();
        setOrganisms(orgsData.organisms);

        if (orgsData.organisms.length > 0) {
          setOrganismAbbrev(orgsData.organisms[0].organism_abbrev);
        }
      } catch (err) {
        setError('Failed to load organisms: ' + (err.response?.data?.detail || err.message));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Look up feature info
  const handleLookupFeature = async () => {
    if (!featureName.trim() || !organismAbbrev) {
      setError('Please enter a feature name and select an organism');
      return;
    }

    setLookingUp(true);
    setError(null);
    setFeatureInfo(null);
    setAvailableLinks([]);
    setCurrentLinks(new Set());

    try {
      const data = await getFeatureInfo(organismAbbrev, featureName.trim());
      if (data.found) {
        setFeatureInfo(data.feature);
        await loadLinks(data.feature);
      } else {
        setError(`Feature '${featureName}' not found for the selected organism`);
      }
    } catch (err) {
      setError('Failed to look up feature: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLookingUp(false);
    }
  };

  // Load available and current links
  const loadLinks = async (feature) => {
    setLoadingLinks(true);
    try {
      const [availData, currentData] = await Promise.all([
        getAvailableLinks(feature.feature_type),
        getCurrentLinks(feature.feature_no),
      ]);

      setAvailableLinks(availData.links);

      // Build current links set and link_table map
      const currentSet = new Set();
      const tableMap = {};
      currentData.links.forEach((link) => {
        currentSet.add(link.url_no);
        tableMap[link.url_no] = link.link_table;
      });
      setCurrentLinks(currentSet);
      setLinkTableMap(tableMap);
    } catch (err) {
      console.error('Failed to load links:', err);
      setError('Failed to load links: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingLinks(false);
    }
  };

  // Toggle a link selection
  const handleToggleLink = (urlNo, linkTable) => {
    const newSet = new Set(currentLinks);
    const newMap = { ...linkTableMap };

    if (newSet.has(urlNo)) {
      newSet.delete(urlNo);
      delete newMap[urlNo];
    } else {
      newSet.add(urlNo);
      newMap[urlNo] = linkTable;
    }

    setCurrentLinks(newSet);
    setLinkTableMap(newMap);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!featureInfo) {
      setError('Please look up a valid feature first');
      return;
    }

    setSubmitting(true);

    try {
      const selectedLinks = Array.from(currentLinks).map((urlNo) => ({
        url_no: urlNo,
        link_table: linkTableMap[urlNo] || 'FEAT_URL',
      }));

      const result = await updateLinks(featureInfo.feature_no, selectedLinks);
      setSuccess(result.message);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update links');
    } finally {
      setSubmitting(false);
    }
  };

  // Group links by location
  const groupedLinks = availableLinks.reduce((acc, link) => {
    const location = link.label_location;
    if (!acc[location]) {
      acc[location] = { commonToAll: [], commonToSome: [] };
    }
    if (link.is_common_to_all) {
      acc[location].commonToAll.push(link);
    } else {
      acc[location].commonToSome.push(link);
    }
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <Link to="/curation" className="text-blue-600 hover:underline">
          &larr; Back to Curator Central
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Add Links and Pull-downs to Locus Page</h1>

      <div className="mb-6 text-gray-600 text-sm">
        <p className="mb-2">
          All links and pull-downs that appear on the Locus Page are stored in the database.
          When a new feature is added, the links must be configured using this interface.
        </p>
        <p className="mb-2">
          <strong>Common to some:</strong> Links that only appear for some features of this type.
          Additional data may be required for these links to work.
        </p>
        <p>
          <strong>Common to all:</strong> Links that appear for all features of this type,
          typically CGD tools and resources.
        </p>
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
        <h2 className="font-semibold mb-3">Look Up Feature</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1">Organism</label>
            <select
              value={organismAbbrev}
              onChange={(e) => {
                setOrganismAbbrev(e.target.value);
                setFeatureInfo(null);
                setAvailableLinks([]);
              }}
              className="w-full border rounded px-3 py-2"
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
                  setAvailableLinks([]);
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
          </div>
        )}
      </div>

      {/* Links Form */}
      {featureInfo && !loadingLinks && (
        <form onSubmit={handleSubmit}>
          <div className="bg-white border rounded p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">
                Available Links for {featureInfo.feature_type}
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Select all "common to all" links
                    const newSet = new Set();
                    const newMap = {};
                    availableLinks.forEach((link) => {
                      if (link.is_common_to_all) {
                        newSet.add(link.url_no);
                        newMap[link.url_no] = link.link_table;
                      }
                    });
                    setCurrentLinks(newSet);
                    setLinkTableMap(newMap);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Select Common
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentLinks(new Set());
                    setLinkTableMap({});
                  }}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Clear All
                </button>
              </div>
            </div>

            {availableLinks.length === 0 ? (
              <p className="text-gray-600">
                No links available for feature type &quot;{featureInfo.feature_type}&quot;.
              </p>
            ) : (
              <div className="space-y-6">
                {/* Common to Some */}
                {Object.entries(groupedLinks).some(
                  ([, group]) => group.commonToSome.length > 0
                ) && (
                  <div>
                    <h3 className="font-medium bg-gray-100 p-2 mb-2">Common to Some</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(groupedLinks).map(([location, group]) => (
                        group.commonToSome.length > 0 && (
                          <div key={`some-${location}`} className="border rounded p-3">
                            <h4 className="font-medium text-sm bg-purple-100 px-2 py-1 mb-2">
                              {location}
                            </h4>
                            <div className="space-y-1">
                              {group.commonToSome.map((link) => (
                                <label
                                  key={link.url_no}
                                  className="flex items-start gap-2 text-sm cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={currentLinks.has(link.url_no)}
                                    onChange={() =>
                                      handleToggleLink(link.url_no, link.link_table)
                                    }
                                    className="mt-1"
                                  />
                                  <span>
                                    {link.label_name}
                                    <span className="text-gray-500 text-xs ml-1">
                                      ({link.usage_count} features)
                                    </span>
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Common to All */}
                {Object.entries(groupedLinks).some(
                  ([, group]) => group.commonToAll.length > 0
                ) && (
                  <div>
                    <h3 className="font-medium bg-gray-100 p-2 mb-2">Common to All</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(groupedLinks).map(([location, group]) => (
                        group.commonToAll.length > 0 && (
                          <div key={`all-${location}`} className="border rounded p-3">
                            <h4 className="font-medium text-sm bg-purple-100 px-2 py-1 mb-2">
                              {location}
                            </h4>
                            <div className="space-y-1">
                              {group.commonToAll.map((link) => (
                                <label
                                  key={link.url_no}
                                  className="flex items-start gap-2 text-sm cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={currentLinks.has(link.url_no)}
                                    onChange={() =>
                                      handleToggleLink(link.url_no, link.link_table)
                                    }
                                    className="mt-1"
                                  />
                                  <span>{link.label_name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Links'}
            </button>
          </div>
        </form>
      )}

      {loadingLinks && (
        <div className="bg-white border rounded p-4 mb-6">
          <p>Loading available links...</p>
        </div>
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

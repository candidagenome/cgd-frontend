/**
 * Paragraph Curation Page - Manage locus page paragraphs.
 *
 * Allows curators to:
 * - Create new paragraphs and link to features
 * - Edit existing paragraph text
 * - Reorder paragraphs on feature pages
 * - Link/unlink paragraphs to/from features
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getOrganisms,
  getParagraphsForFeature,
  getParagraphDetails,
  createParagraph,
  updateParagraph,
  reorderParagraphs,
  linkFeature,
  unlinkFeature,
} from '../../api/paragraphCurationApi';
import { filterAllowedOrganisms } from '../../constants/organisms';

export default function ParagraphCurationPage() {
  // Mode state
  const [mode, setMode] = useState('entry'); // 'entry', 'view', 'edit', 'create'

  // Entry form state
  const [entryFeatureName, setEntryFeatureName] = useState('');
  const [entryParagraphNo, setEntryParagraphNo] = useState('');
  const [entryOrganism, setEntryOrganism] = useState('');
  const [createNew, setCreateNew] = useState(false);

  // Organisms dropdown
  const [organisms, setOrganisms] = useState([]);

  // Feature view state
  const [featureData, setFeatureData] = useState(null);
  const [paragraphOrders, setParagraphOrders] = useState({});

  // Paragraph edit state
  const [paragraphDetails, setParagraphDetails] = useState(null);
  const [editText, setEditText] = useState('');
  const [updateDate, setUpdateDate] = useState(false);
  const [linkFeatureName, setLinkFeatureName] = useState('');
  const [linkOrganism, setLinkOrganism] = useState('');

  // Create paragraph state
  const [newParagraphText, setNewParagraphText] = useState('');
  const [newFeatureList, setNewFeatureList] = useState('');
  const [newOrganism, setNewOrganism] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load organisms on mount
  useEffect(() => {
    const loadOrganisms = async () => {
      try {
        const data = await getOrganisms();
        const filteredOrganisms = filterAllowedOrganisms(data.organisms);
        setOrganisms(filteredOrganisms);
        if (filteredOrganisms.length > 0) {
          setEntryOrganism(filteredOrganisms[0].organism_abbrev);
          setNewOrganism(filteredOrganisms[0].organism_abbrev);
          setLinkOrganism(filteredOrganisms[0].organism_abbrev);
        }
      } catch (err) {
        console.error('Failed to load organisms:', err);
      }
    };
    loadOrganisms();
  }, []);

  // Handle entry form submit
  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (createNew) {
      setMode('create');
      return;
    }

    if (!entryFeatureName && !entryParagraphNo) {
      setError('Enter a feature name or paragraph number');
      return;
    }

    setLoading(true);

    try {
      if (entryParagraphNo) {
        // Load paragraph details
        const data = await getParagraphDetails(parseInt(entryParagraphNo, 10));
        setParagraphDetails(data);
        setEditText(data.paragraph_text);
        setMode('edit');
      } else {
        // Load feature paragraphs
        const data = await getParagraphsForFeature(entryFeatureName, entryOrganism);
        setFeatureData(data);
        // Initialize order dropdowns
        const orders = {};
        data.paragraphs.forEach((p) => {
          orders[p.paragraph_no] = p.paragraph_order;
        });
        setParagraphOrders(orders);
        setMode('view');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Handle paragraph update
  const handleUpdateParagraph = async () => {
    if (!paragraphDetails) return;

    setLoading(true);
    setError(null);

    try {
      await updateParagraph(paragraphDetails.paragraph_no, {
        paragraph_text: editText,
        update_date: updateDate,
      });
      setSuccess('Paragraph updated successfully');
      // Reload details
      const data = await getParagraphDetails(paragraphDetails.paragraph_no);
      setParagraphDetails(data);
      setEditText(data.paragraph_text);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update paragraph');
    } finally {
      setLoading(false);
    }
  };

  // Handle reorder
  const handleReorder = async () => {
    if (!featureData) return;

    setLoading(true);
    setError(null);

    try {
      const orders = Object.entries(paragraphOrders).map(([pno, order]) => ({
        paragraph_no: parseInt(pno, 10),
        order: parseInt(order, 10),
      }));

      await reorderParagraphs(featureData.feature_no, orders);
      setSuccess('Paragraphs reordered');
      // Reload
      const data = await getParagraphsForFeature(
        featureData.feature_name,
        featureData.organism_abbrev
      );
      setFeatureData(data);
      const newOrders = {};
      data.paragraphs.forEach((p) => {
        newOrders[p.paragraph_no] = p.paragraph_order;
      });
      setParagraphOrders(newOrders);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reorder paragraphs');
    } finally {
      setLoading(false);
    }
  };

  // Handle create paragraph
  const handleCreateParagraph = async () => {
    if (!newParagraphText.trim()) {
      setError('Paragraph text is required');
      return;
    }
    if (!newFeatureList.trim()) {
      setError('At least one feature name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const featureNames = newFeatureList
        .split('|')
        .map((f) => f.trim())
        .filter((f) => f);

      const result = await createParagraph({
        paragraph_text: newParagraphText,
        feature_names: featureNames,
        organism_abbrev: newOrganism,
      });

      setSuccess(
        `Paragraph ${result.paragraph_no} created and linked to ${result.linked_features.length} feature(s)`
      );
      setNewParagraphText('');
      setNewFeatureList('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create paragraph');
    } finally {
      setLoading(false);
    }
  };

  // Handle link feature
  const handleLinkFeature = async () => {
    if (!paragraphDetails || !linkFeatureName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await linkFeature(
        paragraphDetails.paragraph_no,
        linkFeatureName,
        linkOrganism
      );
      setSuccess(`Linked to ${linkFeatureName}`);
      setLinkFeatureName('');
      // Reload details
      const data = await getParagraphDetails(paragraphDetails.paragraph_no);
      setParagraphDetails(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to link feature');
    } finally {
      setLoading(false);
    }
  };

  // Handle unlink feature
  const handleUnlinkFeature = async (featureNo, featureName) => {
    if (!paragraphDetails) return;
    if (!confirm(`Unlink paragraph from ${featureName}?`)) return;

    setLoading(true);
    setError(null);

    try {
      await unlinkFeature(paragraphDetails.paragraph_no, featureNo);
      setSuccess(`Unlinked from ${featureName}`);
      // Reload details
      const data = await getParagraphDetails(paragraphDetails.paragraph_no);
      setParagraphDetails(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to unlink feature');
    } finally {
      setLoading(false);
    }
  };

  // Entry form
  if (mode === 'entry') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Link to="/curation" className="text-blue-600 hover:underline">
            &larr; Back to Curator Central
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Paragraph Curation Interface</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white border rounded p-6">
          <p className="mb-4">
            This is the entry page for the Paragraph Curation Interface. Choose one:
          </p>

          <form onSubmit={handleEntrySubmit}>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={createNew}
                  onChange={() => setCreateNew(true)}
                />
                <span className="font-medium">Load a New Paragraph</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!createNew}
                  onChange={() => setCreateNew(false)}
                />
                <span className="font-medium">Edit an Existing Paragraph for:</span>
              </label>
            </div>

            <div className="ml-6 space-y-4">
              <div className="flex items-center gap-4">
                <label className="w-32">Feature Name:</label>
                <input
                  type="text"
                  value={entryFeatureName}
                  onChange={(e) => setEntryFeatureName(e.target.value)}
                  className="border rounded px-3 py-2 w-40"
                  disabled={createNew}
                />
                <label>Organism:</label>
                <select
                  value={entryOrganism}
                  onChange={(e) => setEntryOrganism(e.target.value)}
                  className="border rounded px-3 py-2"
                  disabled={createNew}
                >
                  {organisms.map((o) => (
                    <option key={o.organism_abbrev} value={o.organism_abbrev}>
                      {o.organism_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center font-bold">OR</div>

              <div className="flex items-center gap-4">
                <label className="w-32">Paragraph No:</label>
                <input
                  type="number"
                  value={entryParagraphNo}
                  onChange={(e) => setEntryParagraphNo(e.target.value)}
                  className="border rounded px-3 py-2 w-40"
                  disabled={createNew}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Submit'}
              </button>
              <button
                type="reset"
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => {
                  setEntryFeatureName('');
                  setEntryParagraphNo('');
                  setCreateNew(false);
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Create mode
  if (mode === 'create') {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setMode('entry')}
            className="text-blue-600 hover:underline"
          >
            &larr; Back
          </button>
          <Link to="/curation" className="text-blue-600 hover:underline">
            Curator Central
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Load New Paragraph</h1>

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

        <div className="bg-white border rounded p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
            <strong>Markup Examples:</strong>
            <ul className="list-disc ml-6 mt-2">
              <li>Reference: &lt;reference:S000123456&gt;</li>
              <li>Feature: &lt;feature:S000012345&gt;ACT1&lt;/feature&gt;</li>
              <li>GO term: &lt;go:1234&gt;term text&lt;/go&gt;</li>
            </ul>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Enter text of new paragraph:
            </label>
            <textarea
              value={newParagraphText}
              onChange={(e) => setNewParagraphText(e.target.value)}
              rows={12}
              className="w-full border rounded px-3 py-2 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Link paragraph to features (separate with |):
            </label>
            <input
              type="text"
              value={newFeatureList}
              onChange={(e) => setNewFeatureList(e.target.value)}
              placeholder="e.g., ACT1|CYC1|TUB2"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-4">
            <label>Organism:</label>
            <select
              value={newOrganism}
              onChange={(e) => setNewOrganism(e.target.value)}
              className="border rounded px-3 py-2"
            >
              {organisms.map((o) => (
                <option key={o.organism_abbrev} value={o.organism_abbrev}>
                  {o.organism_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCreateParagraph}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Submit'}
          </button>
        </div>
      </div>
    );
  }

  // View feature paragraphs
  if (mode === 'view' && featureData) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setMode('entry')}
            className="text-blue-600 hover:underline"
          >
            &larr; Back
          </button>
          <Link to="/curation" className="text-blue-600 hover:underline">
            Curator Central
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Paragraphs for{' '}
          <em>{featureData.organism_name}</em>{' '}
          <Link
            to={`/locus/${featureData.feature_name}`}
            className="text-blue-600 hover:underline"
          >
            {featureData.gene_name || featureData.feature_name}
          </Link>
        </h1>

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

        <p className="text-sm text-gray-600 mb-4">
          To change paragraph order, use the dropdowns and click &quot;Reorder Paragraphs&quot;.
        </p>

        {featureData.paragraphs.length === 0 ? (
          <p className="text-gray-600">No paragraphs for this feature.</p>
        ) : (
          <div className="space-y-6">
            {featureData.paragraphs.map((para) => (
              <div key={para.paragraph_no} className="bg-white border rounded">
                <div className="bg-purple-100 px-4 py-2 flex justify-between items-center">
                  <span className="font-bold text-red-600">
                    {para.paragraph_order}. PARAGRAPH_NO = {para.paragraph_no}
                  </span>
                  <button
                    onClick={() => {
                      setEntryParagraphNo(para.paragraph_no.toString());
                      handleEntrySubmit({ preventDefault: () => {} });
                    }}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit this paragraph
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <label>Change order to:</label>
                    <select
                      value={paragraphOrders[para.paragraph_no] || para.paragraph_order}
                      onChange={(e) =>
                        setParagraphOrders({
                          ...paragraphOrders,
                          [para.paragraph_no]: parseInt(e.target.value, 10),
                        })
                      }
                      className="border rounded px-2 py-1"
                    >
                      {featureData.paragraphs.map((_, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {idx + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Features linked:</strong>{' '}
                    {para.linked_features.map((f, idx) => (
                      <span key={f.feature_no}>
                        {idx > 0 && ' | '}
                        {f.feature_name === featureData.feature_name ? (
                          f.gene_name || f.feature_name
                        ) : (
                          <button
                            onClick={() => {
                              setEntryFeatureName(f.feature_name);
                              handleEntrySubmit({ preventDefault: () => {} });
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            {f.gene_name || f.feature_name}
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                    {para.paragraph_text}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleReorder}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Reorder Paragraphs'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Edit paragraph
  if (mode === 'edit' && paragraphDetails) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setMode('entry')}
            className="text-blue-600 hover:underline"
          >
            &larr; Back
          </button>
          <Link to="/curation" className="text-blue-600 hover:underline">
            Curator Central
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">Edit Paragraph</h1>
        <h2 className="text-lg mb-4">
          Paragraph_no = {paragraphDetails.paragraph_no}
        </h2>

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

        {/* Current paragraph */}
        <section className="bg-white border rounded mb-6">
          <div className="bg-purple-100 px-4 py-2 font-bold">
            Current Paragraph &amp; References
          </div>
          <div className="p-4">
            <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap mb-4">
              {paragraphDetails.paragraph_text}
            </div>
            {paragraphDetails.linked_references.length > 0 && (
              <div className="text-sm">
                <strong>Linked References:</strong>
                <ul className="list-disc ml-6">
                  {paragraphDetails.linked_references.map((r) => (
                    <li key={r.reference_no}>
                      {r.dbxref_id}: {r.citation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Edit form */}
        <section className="bg-white border rounded mb-6">
          <div className="bg-blue-100 px-4 py-2 font-bold">Edit Paragraph</div>
          <div className="p-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm mb-4">
              <strong>Markup Examples:</strong>
              <br />
              Reference: &lt;reference:S000123456&gt;
              <br />
              Feature: &lt;feature:S000012345&gt;ACT1&lt;/feature&gt;
              <br />
              GO term: &lt;go:1234&gt;term text&lt;/go&gt;
            </div>

            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={12}
              className="w-full border rounded px-3 py-2 font-mono text-sm mb-4"
            />

            <div className="flex items-center gap-4 mb-4">
              <span className="text-red-600 font-bold">REQUIRED:</span>
              <span className="font-medium">
                Update &apos;Date Edited&apos; to today&apos;s date?
              </span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={!updateDate}
                  onChange={() => setUpdateDate(false)}
                />
                NO
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={updateDate}
                  onChange={() => setUpdateDate(true)}
                />
                YES
              </label>
            </div>

            <button
              onClick={handleUpdateParagraph}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </section>

        {/* Link/Unlink features */}
        <section className="bg-white border rounded">
          <div className="bg-purple-100 px-4 py-2 font-bold">
            Link/Unlink Paragraph To Features
          </div>
          <div className="p-4">
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border px-3 py-2">Features linked</th>
                  <th className="border px-3 py-2">Current order</th>
                  <th className="border px-3 py-2">Unlink</th>
                </tr>
              </thead>
              <tbody>
                {paragraphDetails.linked_features.map((f) => (
                  <tr key={f.feature_no}>
                    <td className="border px-3 py-2 text-center">
                      <Link
                        to={`/locus/${f.feature_name}`}
                        className="text-blue-600 hover:underline"
                      >
                        {f.gene_name || f.feature_name}
                      </Link>
                    </td>
                    <td className="border px-3 py-2 text-center">
                      {f.paragraph_order}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      <button
                        onClick={() =>
                          handleUnlinkFeature(
                            f.feature_no,
                            f.gene_name || f.feature_name
                          )
                        }
                        className="text-red-600 hover:underline text-sm"
                      >
                        Unlink
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center gap-4">
              <span>Link to feature:</span>
              <input
                type="text"
                value={linkFeatureName}
                onChange={(e) => setLinkFeatureName(e.target.value)}
                placeholder="Feature name"
                className="border rounded px-3 py-2"
              />
              <select
                value={linkOrganism}
                onChange={(e) => setLinkOrganism(e.target.value)}
                className="border rounded px-3 py-2"
              >
                {organisms.map((o) => (
                  <option key={o.organism_abbrev} value={o.organism_abbrev}>
                    {o.organism_name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleLinkFeature}
                disabled={loading || !linkFeatureName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Link
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return null;
}

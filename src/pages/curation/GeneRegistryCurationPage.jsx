/**
 * Gene Registry Curation Page - Process gene registry submissions.
 *
 * Allows curators to review and commit gene name reservations.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  listPendingSubmissions,
  getSubmissionDetails,
  processSubmission,
  delaySubmission,
  deleteSubmission,
} from '../../api/geneRegistryCurationApi';

export default function GeneRegistryCurationPage() {
  // List state
  const [submissions, setSubmissions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Selected submission state
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form state for processing
  const [geneName, setGeneName] = useState('');
  const [orfName, setOrfName] = useState('');
  const [organismAbbrev, setOrganismAbbrev] = useState('');
  const [description, setDescription] = useState('');
  const [headline, setHeadline] = useState('');
  const [aliases, setAliases] = useState('');
  const [referenceNo, setReferenceNo] = useState('');

  // UI state
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load pending submissions
  const loadSubmissions = async () => {
    setLoadingList(true);
    try {
      const data = await listPendingSubmissions();
      setSubmissions(data.submissions);
    } catch (err) {
      setError('Failed to load submissions: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // Load submission details
  const handleSelectSubmission = async (id) => {
    setSelectedId(id);
    setLoadingDetails(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await getSubmissionDetails(id);
      if (data.found) {
        setDetails(data.submission);

        // Pre-fill form
        const innerData = data.submission.data || {};
        setGeneName(data.submission.gene_name || innerData.gene_name || '');
        setOrfName(data.submission.orf_name || innerData.orf_name || '');
        setOrganismAbbrev(data.submission.organism || innerData.organism || '');
        setDescription(innerData.description || '');
        setHeadline(data.submission.orf_info?.headline || '');
        setAliases(innerData.aliases || '');
        setReferenceNo('');
      } else {
        setError('Submission not found');
        setDetails(null);
      }
    } catch (err) {
      setError('Failed to load details: ' + (err.response?.data?.detail || err.message));
      setDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Process submission
  const handleProcess = async () => {
    if (!geneName.trim()) {
      setError('Gene name is required');
      return;
    }
    if (!organismAbbrev) {
      setError('Organism is required');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const aliasesList = aliases
        .split(/[,;|]/)
        .map((a) => a.trim())
        .filter((a) => a);

      const result = await processSubmission({
        submission_id: selectedId,
        gene_name: geneName.trim(),
        orf_name: orfName.trim() || null,
        organism_abbrev: organismAbbrev,
        description: description.trim() || null,
        headline: headline.trim() || null,
        aliases: aliasesList.length > 0 ? aliasesList : null,
        reference_no: referenceNo ? parseInt(referenceNo, 10) : null,
      });

      setSuccess(result.message);
      setSelectedId(null);
      setDetails(null);
      loadSubmissions();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process submission');
    } finally {
      setProcessing(false);
    }
  };

  // Delay submission
  const handleDelay = async () => {
    const comment = prompt('Enter delay comment (optional):');

    try {
      await delaySubmission(selectedId, comment);
      setSuccess('Submission delayed');
      loadSubmissions();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delay submission');
    }
  };

  // Delete submission
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      await deleteSubmission(selectedId);
      setSuccess('Submission deleted');
      setSelectedId(null);
      setDetails(null);
      loadSubmissions();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete submission');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Link to="/curation" className="text-blue-600 hover:underline">
          &larr; Back to Curator Central
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Process Gene Registry Forms</h1>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Submissions List */}
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-4">Pending Submissions</h2>

          {loadingList ? (
            <p>Loading...</p>
          ) : submissions.length === 0 ? (
            <p className="text-gray-600">No pending submissions.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubmission(sub.id)}
                  className={`p-3 border rounded cursor-pointer hover:bg-blue-50 ${
                    selectedId === sub.id ? 'bg-blue-100 border-blue-400' : ''
                  }`}
                >
                  <div className="font-medium">{sub.gene_name || 'Unknown gene'}</div>
                  <div className="text-sm text-gray-600">
                    {sub.orf_name && <span>ORF: {sub.orf_name} | </span>}
                    {sub.organism}
                  </div>
                  <div className="text-sm text-gray-500">
                    From: {sub.submitter_name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {sub.submitted_at?.split('T')[0]}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={loadSubmissions}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Refresh List
          </button>
        </div>

        {/* Submission Details / Processing Form */}
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-4">
            {details ? 'Process Submission' : 'Select a submission'}
          </h2>

          {loadingDetails ? (
            <p>Loading details...</p>
          ) : details ? (
            <div className="space-y-4">
              {/* Submitter Info */}
              {details.colleague_info && (
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <strong>Submitter:</strong> {details.colleague_info.name}
                  {details.colleague_info.email && (
                    <span className="text-gray-600"> ({details.colleague_info.email})</span>
                  )}
                  <br />
                  {details.colleague_info.institution}
                </div>
              )}

              {/* ORF Info */}
              {details.orf_info && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <strong>ORF Found:</strong> {details.orf_info.feature_name}
                  {details.orf_info.gene_name && (
                    <span className="text-red-600">
                      {' '}(Already named: {details.orf_info.gene_name})
                    </span>
                  )}
                  <br />
                  Type: {details.orf_info.feature_type}
                </div>
              )}

              {/* Processing Form */}
              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-sm mb-1">Gene Name *</label>
                  <input
                    type="text"
                    value={geneName}
                    onChange={(e) => setGeneName(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-medium text-sm mb-1">ORF Name</label>
                  <input
                    type="text"
                    value={orfName}
                    onChange={(e) => setOrfName(e.target.value)}
                    placeholder="Defaults to gene name (uppercased)"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-medium text-sm mb-1">Organism *</label>
                  <input
                    type="text"
                    value={organismAbbrev}
                    onChange={(e) => setOrganismAbbrev(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-medium text-sm mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-medium text-sm mb-1">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-medium text-sm mb-1">
                    Aliases (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={aliases}
                    onChange={(e) => setAliases(e.target.value)}
                    placeholder="e.g., ABC1, XYZ2"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-medium text-sm mb-1">Reference No</label>
                  <input
                    type="number"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="Optional"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Commit'}
                </button>
                <button
                  onClick={handleDelay}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Delay
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">
              Select a submission from the list to view details and process it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

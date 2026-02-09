/**
 * Reference Annotation Curation Page
 *
 * Allows curators to manage annotations linked to a reference:
 * - Literature Guide entries (REF_PROPERTY, REFPROP_FEAT)
 * - GO annotations (GO_REF, GO_ANNOTATION)
 * - REF_LINK entries (FEATURE, PHENO_ANNOTATION, FEAT_ALIAS, etc.)
 *
 * Actions available:
 * - Delete individual entries
 * - Transfer individual entries to another reference
 * - Bulk delete all entries of a type
 * - Bulk transfer all entries to another reference
 */
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import refAnnotationCurationApi from '../../api/refAnnotationCurationApi';
import referenceCurationApi from '../../api/referenceCurationApi';

function RefAnnotationCurationPage() {
  useAuth(); // Ensure user is authenticated
  const [searchParams] = useSearchParams();

  // Search form state
  const [searchType, setSearchType] = useState('pubmed');
  const [searchValue, setSearchValue] = useState('');

  // Annotations state
  const [reference, setReference] = useState(null);
  const [litGuide, setLitGuide] = useState([]);
  const [goAnnotations, setGoAnnotations] = useState([]);
  const [refLinks, setRefLinks] = useState(null);

  // Transfer target state
  const [transferRefId, setTransferRefId] = useState('');
  const [transferIdType, setTransferIdType] = useState('CGDID');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionMessages, setActionMessages] = useState([]);

  const loadAnnotations = useCallback(async (refNo) => {
    setLoading(true);
    setError(null);
    setActionMessages([]);

    try {
      const data = await refAnnotationCurationApi.getAnnotations(refNo);
      setReference(data.reference);
      setLitGuide(data.lit_guide);
      setGoAnnotations(data.go_annotations);
      setRefLinks(data.ref_links);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadByPubmed = useCallback(async (pubmed) => {
    setLoading(true);
    setError(null);

    try {
      const data = await referenceCurationApi.searchReferences({ pubmed });
      if (data.results.length > 0) {
        await loadAnnotations(data.results[0].reference_no);
      } else {
        setError(`No reference found with PubMed ID ${pubmed}`);
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      setLoading(false);
    }
  }, [loadAnnotations]);

  const loadByDbxrefId = useCallback(async (dbxrefId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await referenceCurationApi.searchReferences({ dbxref_id: dbxrefId });
      if (data.results.length > 0) {
        await loadAnnotations(data.results[0].reference_no);
      } else {
        setError(`No reference found with CGDID ${dbxrefId}`);
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      setLoading(false);
    }
  }, [loadAnnotations]);

  // Handle URL params for direct load
  useEffect(() => {
    const pmid = searchParams.get('pubmed');
    const refNo = searchParams.get('reference_no') || searchParams.get('refNo');
    const dbid = searchParams.get('dbid') || searchParams.get('dbxref_id');

    if (pmid) {
      setSearchValue(pmid);
      setSearchType('pubmed');
      loadByPubmed(parseInt(pmid, 10));
    } else if (refNo) {
      setSearchValue(refNo);
      setSearchType('reference_no');
      loadAnnotations(parseInt(refNo, 10));
    } else if (dbid) {
      setSearchValue(dbid);
      setSearchType('dbxref_id');
      loadByDbxrefId(dbid);
    }
  }, [searchParams, loadAnnotations, loadByPubmed, loadByDbxrefId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      setError('Please enter a search value');
      return;
    }

    if (searchType === 'pubmed') {
      await loadByPubmed(parseInt(searchValue, 10));
    } else if (searchType === 'reference_no') {
      await loadAnnotations(parseInt(searchValue, 10));
    } else if (searchType === 'dbxref_id') {
      await loadByDbxrefId(searchValue);
    }
  };

  const resolveTransferReference = async () => {
    if (!transferRefId.trim()) {
      throw new Error('Please enter a target reference ID');
    }

    let refNo;
    if (transferIdType === 'reference_no') {
      refNo = parseInt(transferRefId, 10);
    } else if (transferIdType === 'pubmed') {
      const data = await referenceCurationApi.searchReferences({
        pubmed: parseInt(transferRefId, 10),
      });
      if (data.results.length === 0) {
        throw new Error(`No reference found with PubMed ID ${transferRefId}`);
      }
      refNo = data.results[0].reference_no;
    } else {
      const data = await referenceCurationApi.searchReferences({
        dbxref_id: transferRefId,
      });
      if (data.results.length === 0) {
        throw new Error(`No reference found with CGDID ${transferRefId}`);
      }
      refNo = data.results[0].reference_no;
    }

    return refNo;
  };

  // Literature Guide actions
  const handleLitGuideDelete = async (entry) => {
    if (!window.confirm('Delete this literature guide entry?')) return;

    try {
      const result = await refAnnotationCurationApi.deleteLitGuide({
        refprop_feat_no: entry.refprop_feat_no,
        ref_property_no: entry.ref_property_no,
      });
      setActionMessages((prev) => [...prev, ...result.messages]);
      await loadAnnotations(reference.reference_no);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  const handleLitGuideTransfer = async (entry) => {
    try {
      const newRefNo = await resolveTransferReference();
      const result = await refAnnotationCurationApi.transferLitGuide({
        refprop_feat_no: entry.refprop_feat_no,
        ref_property_no: entry.ref_property_no,
        new_reference_no: newRefNo,
      });
      setActionMessages((prev) => [...prev, ...result.messages]);
      await loadAnnotations(reference.reference_no);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  // GO annotation actions
  const handleGoRefDelete = async (entry) => {
    if (!window.confirm('Delete this GO annotation entry?')) return;

    try {
      const result = await refAnnotationCurationApi.deleteGoRef(entry.go_ref_no);
      setActionMessages((prev) => [...prev, ...result.messages]);
      await loadAnnotations(reference.reference_no);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  const handleGoRefTransfer = async (entry) => {
    try {
      const newRefNo = await resolveTransferReference();
      const result = await refAnnotationCurationApi.transferGoRef(
        entry.go_ref_no,
        newRefNo
      );
      setActionMessages((prev) => [...prev, ...result.messages]);
      await loadAnnotations(reference.reference_no);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  // REF_LINK actions
  const handleRefLinkDelete = async (entry) => {
    if (!window.confirm('Delete this REF_LINK entry? The underlying data will NOT be deleted.')) return;

    try {
      const result = await refAnnotationCurationApi.deleteRefLink(entry.ref_link_no);
      setActionMessages((prev) => [
        ...prev,
        result.message,
        ...(result.warning ? [result.warning] : []),
      ]);
      await loadAnnotations(reference.reference_no);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  const handleRefLinkTransfer = async (entry) => {
    try {
      const newRefNo = await resolveTransferReference();
      const result = await refAnnotationCurationApi.transferRefLink(
        entry.ref_link_no,
        newRefNo
      );
      setActionMessages((prev) => [...prev, result.message]);
      await loadAnnotations(reference.reference_no);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  // Bulk actions
  const handleBulkDelete = async (entryType) => {
    const typeLabels = {
      lit_guide: 'Literature Guide',
      go_annotation: 'GO Annotation',
      ref_link: 'REF_LINK',
    };
    if (!window.confirm(`Delete ALL ${typeLabels[entryType]} entries for this reference?`)) return;

    try {
      const result = await refAnnotationCurationApi.bulkDelete(
        reference.reference_no,
        entryType
      );
      setActionMessages((prev) => [...prev, ...result.messages]);
      await loadAnnotations(reference.reference_no);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  const handleBulkTransfer = async (entryType) => {
    try {
      const newRefNo = await resolveTransferReference();
      const result = await refAnnotationCurationApi.bulkTransfer(
        reference.reference_no,
        entryType,
        newRefNo
      );
      setActionMessages((prev) => [...prev, ...result.messages]);
      await loadAnnotations(reference.reference_no);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  const hasAnnotations =
    litGuide.length > 0 ||
    goAnnotations.length > 0 ||
    (refLinks && (
      refLinks.feature.length > 0 ||
      refLinks.pheno_annotation.length > 0 ||
      refLinks.feat_alias.length > 0 ||
      refLinks.other.length > 0
    ));

  // Count genes linked to this reference
  const linkedGenes = new Set();
  litGuide.forEach((e) => e.feature_name && linkedGenes.add(e.feature_name));
  goAnnotations.forEach((e) => linkedGenes.add(e.feature_name));
  refLinks?.feature.forEach((e) => e.feature_name && linkedGenes.add(e.feature_name));
  refLinks?.pheno_annotation.forEach((e) => e.feature_name && linkedGenes.add(e.feature_name));
  refLinks?.feat_alias.forEach((e) => e.feature_name && linkedGenes.add(e.feature_name));

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <h1>Reference Annotation Curation</h1>

      <p style={{ marginBottom: '20px', color: '#666' }}>
        Manage existing annotations associated with a reference. You can delete or transfer
        individual entries, or perform bulk operations on all entries of a given type.
      </p>

      {/* Search Form */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="pubmed">PubMed ID</option>
              <option value="reference_no">Reference No</option>
              <option value="dbxref_id">CGDID</option>
            </select>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={`Enter ${searchType}`}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 20px',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Error/Message Display */}
      {error && (
        <div style={{ padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {actionMessages.length > 0 && (
        <div style={{ padding: '15px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '20px' }}>
          {actionMessages.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      )}

      {/* Reference Info */}
      {reference && (
        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0 }}>Reference Data Association Curation</h2>
          <div style={{ marginBottom: '10px' }}>
            <strong>CGDID:</strong> {reference.dbxref_id || 'N/A'}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Reference No:</strong> {reference.reference_no}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>PubMed ID:</strong> {reference.pubmed || 'N/A'}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Citation:</strong> {reference.citation}
          </div>
          {reference.title && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Title:</strong> {reference.title}
            </div>
          )}

          {linkedGenes.size > 0 && (
            <div style={{ marginTop: '15px' }}>
              <strong>Gene(s) linked to this reference:</strong>{' '}
              {[...linkedGenes].sort().map((gene, i) => (
                <span key={gene}>
                  {i > 0 && ' | '}
                  <Link to={`/locus/${gene}`}>{gene}</Link>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transfer Target Box */}
      {reference && hasAnnotations && (
        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>Transfer Annotations To:</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={transferRefId}
              onChange={(e) => setTransferRefId(e.target.value)}
              placeholder="Enter reference ID"
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
            />
            <select
              value={transferIdType}
              onChange={(e) => setTransferIdType(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="CGDID">CGDID</option>
              <option value="reference_no">Reference No</option>
              <option value="pubmed">PubMed ID</option>
            </select>
            <button
              onClick={() => handleBulkTransfer('lit_guide')}
              disabled={litGuide.length === 0}
              style={{
                padding: '8px 15px',
                backgroundColor: litGuide.length > 0 ? '#ff9800' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: litGuide.length > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              Transfer All Lit Guide
            </button>
            <button
              onClick={() => handleBulkDelete('lit_guide')}
              disabled={litGuide.length === 0}
              style={{
                padding: '8px 15px',
                backgroundColor: litGuide.length > 0 ? '#f44336' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: litGuide.length > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              Delete All Lit Guide
            </button>
          </div>
        </div>
      )}

      {/* Literature Guide Section */}
      {litGuide.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ backgroundColor: '#ccccff', padding: '10px', borderRadius: '4px' }}>
            <a name="litGuide">Literature Guide</a> info associated with this reference
          </h3>
          <p style={{ color: 'red' }}>
            <strong>NOTE:</strong> The &apos;Delete&apos; option will delete the row from the REFPROP_FEAT
            (and if necessary, REF_PROPERTY) table. The &apos;Transfer&apos; option will both delete
            the row and add a new row for the new reference.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Gene</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Topic</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Date Created</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Created By</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Delete</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Transfer</th>
              </tr>
            </thead>
            <tbody>
              {litGuide.map((entry, i) => (
                <tr key={`${entry.ref_property_no}-${entry.refprop_feat_no || 'ng'}-${i}`}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {entry.feature_name ? (
                      <Link to={`/locus/${entry.feature_name}`}>
                        {entry.gene_name ? `${entry.gene_name}/${entry.feature_name}` : entry.feature_name}
                      </Link>
                    ) : (
                      <em>(Non-gene topic)</em>
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.property_value}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.date_created?.split('T')[0]}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.created_by}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button
                      onClick={() => handleLitGuideDelete(entry)}
                      style={{ padding: '5px 10px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button
                      onClick={() => handleLitGuideTransfer(entry)}
                      disabled={!transferRefId}
                      style={{
                        padding: '5px 10px',
                        cursor: transferRefId ? 'pointer' : 'not-allowed',
                        opacity: transferRefId ? 1 : 0.5,
                      }}
                    >
                      Transfer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* GO Annotations Section */}
      {goAnnotations.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ backgroundColor: '#ccccff', padding: '10px', borderRadius: '4px' }}>
            <a name="goAnnot">GO Annotations</a> info associated with this reference
            <button
              onClick={() => handleBulkTransfer('go_annotation')}
              disabled={!transferRefId}
              style={{ marginLeft: '20px', padding: '5px 15px' }}
            >
              Transfer All
            </button>
            <button
              onClick={() => handleBulkDelete('go_annotation')}
              style={{ marginLeft: '10px', padding: '5px 15px' }}
            >
              Delete All
            </button>
          </h3>
          <p style={{ color: 'red' }}>
            <strong>NOTE:</strong> The &apos;Delete&apos; option will remove the selected GO annotation.
            The &apos;Transfer&apos; option will transfer the annotation to the new reference.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Gene</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Aspect</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Qualifier</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>GO Term</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Evidence</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>With</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Delete</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Transfer</th>
              </tr>
            </thead>
            <tbody>
              {goAnnotations.map((entry) => (
                <tr key={entry.go_ref_no}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <Link to={`/locus/${entry.feature_name}`}>
                      {entry.gene_name ? `${entry.gene_name}/${entry.feature_name}` : entry.feature_name}
                    </Link>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.go_aspect}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.qualifier || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {entry.go_term} (GO:{entry.goid.toString().padStart(7, '0')})
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.go_evidence}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.support || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.date_created?.split('T')[0]}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button
                      onClick={() => handleGoRefDelete(entry)}
                      style={{ padding: '5px 10px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button
                      onClick={() => handleGoRefTransfer(entry)}
                      disabled={!transferRefId}
                      style={{
                        padding: '5px 10px',
                        cursor: transferRefId ? 'pointer' : 'not-allowed',
                        opacity: transferRefId ? 1 : 0.5,
                      }}
                    >
                      Transfer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REF_LINK Section - Feature */}
      {refLinks?.feature.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ backgroundColor: '#ccccff', padding: '10px', borderRadius: '4px' }}>
            <a name="others">FEATURE</a> info associated with this reference via REF_LINK
          </h3>
          <p style={{ color: 'red' }}>
            <strong>NOTE:</strong> The &apos;Delete&apos; option will remove the REF_LINK row;
            it will not remove the data. The &apos;Transfer&apos; option will update the REF_LINK row.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Gene/Feature</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Feature No</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Column</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Date Created</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Created By</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Delete</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Transfer</th>
              </tr>
            </thead>
            <tbody>
              {refLinks.feature.map((entry) => (
                <tr key={entry.ref_link_no}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {entry.feature_name ? (
                      <Link to={`/locus/${entry.feature_name}`}>
                        {entry.gene_name ? `${entry.gene_name}/${entry.feature_name}` : entry.feature_name}
                      </Link>
                    ) : (
                      entry.primary_key
                    )}
                    {entry.feature_type && <div><small>{entry.feature_type}</small></div>}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.primary_key}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.col_name}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.date_created?.split('T')[0]}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.created_by}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button onClick={() => handleRefLinkDelete(entry)} style={{ padding: '5px 10px' }}>
                      Delete
                    </button>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button
                      onClick={() => handleRefLinkTransfer(entry)}
                      disabled={!transferRefId}
                      style={{ padding: '5px 10px', opacity: transferRefId ? 1 : 0.5 }}
                    >
                      Transfer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REF_LINK Section - Pheno Annotation */}
      {refLinks?.pheno_annotation.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ backgroundColor: '#ccccff', padding: '10px', borderRadius: '4px' }}>
            PHENO_ANNOTATION info associated with this reference via REF_LINK
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Gene/Feature</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Pheno Annotation No</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Observable</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Qualifier</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Date Created</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Delete</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Transfer</th>
              </tr>
            </thead>
            <tbody>
              {refLinks.pheno_annotation.map((entry) => (
                <tr key={entry.ref_link_no}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {entry.feature_name ? (
                      <Link to={`/locus/${entry.feature_name}`}>
                        {entry.gene_name ? `${entry.gene_name}/${entry.feature_name}` : entry.feature_name}
                      </Link>
                    ) : (
                      entry.primary_key
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.pheno_annotation_no}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.observable}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.qualifier || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.date_created?.split('T')[0]}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button onClick={() => handleRefLinkDelete(entry)} style={{ padding: '5px 10px' }}>
                      Delete
                    </button>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button
                      onClick={() => handleRefLinkTransfer(entry)}
                      disabled={!transferRefId}
                      style={{ padding: '5px 10px', opacity: transferRefId ? 1 : 0.5 }}
                    >
                      Transfer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REF_LINK Section - Feat Alias */}
      {refLinks?.feat_alias.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ backgroundColor: '#ccccff', padding: '10px', borderRadius: '4px' }}>
            FEAT_ALIAS info associated with this reference via REF_LINK
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Gene/Feature</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Feat Alias No</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Alias</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Date Created</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Delete</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Transfer</th>
              </tr>
            </thead>
            <tbody>
              {refLinks.feat_alias.map((entry) => (
                <tr key={entry.ref_link_no}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {entry.feature_name ? (
                      <Link to={`/locus/${entry.feature_name}`}>
                        {entry.gene_name ? `${entry.gene_name}/${entry.feature_name}` : entry.feature_name}
                      </Link>
                    ) : (
                      entry.primary_key
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.feat_alias_no}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.alias_name}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.date_created?.split('T')[0]}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button onClick={() => handleRefLinkDelete(entry)} style={{ padding: '5px 10px' }}>
                      Delete
                    </button>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button
                      onClick={() => handleRefLinkTransfer(entry)}
                      disabled={!transferRefId}
                      style={{ padding: '5px 10px', opacity: transferRefId ? 1 : 0.5 }}
                    >
                      Transfer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REF_LINK Section - Other tables */}
      {refLinks?.other.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ backgroundColor: '#ccccff', padding: '10px', borderRadius: '4px' }}>
            OTHER_TABLE info associated with this reference via REF_LINK
            <button
              onClick={() => handleBulkTransfer('ref_link')}
              disabled={!transferRefId}
              style={{ marginLeft: '20px', padding: '5px 15px' }}
            >
              Transfer All REF_LINK
            </button>
            <button
              onClick={() => handleBulkDelete('ref_link')}
              style={{ marginLeft: '10px', padding: '5px 15px' }}
            >
              Delete All REF_LINK
            </button>
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Table Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Primary Key</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Column Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Date Created</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Created By</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Delete</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Transfer</th>
              </tr>
            </thead>
            <tbody>
              {refLinks.other.map((entry) => (
                <tr key={entry.ref_link_no}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.tab_name}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.primary_key}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.col_name}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.date_created?.split('T')[0]}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.created_by}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {entry.tab_name === 'PARAGRAPH' ? (
                      <Link to={`/curation/paragraph?paragraph_no=${entry.primary_key}`}>
                        Curate this paragraph
                      </Link>
                    ) : (
                      <button onClick={() => handleRefLinkDelete(entry)} style={{ padding: '5px 10px' }}>
                        Delete
                      </button>
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {entry.tab_name !== 'PARAGRAPH' && (
                      <button
                        onClick={() => handleRefLinkTransfer(entry)}
                        disabled={!transferRefId}
                        style={{ padding: '5px 10px', opacity: transferRefId ? 1 : 0.5 }}
                      >
                        Transfer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No annotations message */}
      {reference && !hasAnnotations && (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
          <p>No annotations found for this reference.</p>
        </div>
      )}

      {/* Navigation links */}
      {reference && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <Link to={`/curation/reference/search?reference_no=${reference.reference_no}`}>
            Return to Edit Reference Page
          </Link>
          {' | '}
          <Link to="/curation">Return to Curator Central</Link>
        </div>
      )}
    </div>
  );
}

export default RefAnnotationCurationPage;

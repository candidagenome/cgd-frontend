import React, { useEffect, useMemo, useState } from 'react';
import './LocusComponents.css';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';

/**
 * Goal layout (like legacy CGD):
 * 1) Nomenclature History (Standard Name + Alias Name(s))
 * 2) Sequence Annotation Notes
 * 3) Curation Notes
 *
 * Data shape differences happen across endpoints. This component supports:
 * - orgData.nomenclature?.standard / orgData.nomenclature?.aliases   (preferred)
 * - orgData.history[] events fallback (classifies by keywords/event_type)
 *
 * IMPORTANT: All hooks must be called unconditionally (no hooks after early returns).
 */

function History({ data, loading, error }) {
  const [selectedOrganism, setSelectedOrganism] = useState(null);

  // Organism list (stable)
  const organismNames = useMemo(() => {
    return data?.results ? Object.keys(data.results) : [];
  }, [data]);

  // Ensure a default organism is selected once organisms are known
  useEffect(() => {
    if (organismNames.length > 0 && !selectedOrganism) {
      setSelectedOrganism(getDefaultOrganism(organismNames));
    }
  }, [organismNames, selectedOrganism]);

  // Selected organism data (stable)
  const orgData = useMemo(() => {
    if (!selectedOrganism) return null;
    return data?.results?.[selectedOrganism] || null;
  }, [data, selectedOrganism]);

  const safeLower = (s) => (s || '').toString().toLowerCase();

  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString();
  };

  const looksLikeNomenclature = (event) => {
    const type = safeLower(event?.event_type);
    const note = safeLower(event?.note);
    return (
      type.includes('nomen') ||
      note.includes('standard name') ||
      note.includes('alias name') ||
      note.includes('nomenclature')
    );
  };

  const looksLikeSequenceAnnotation = (event) => {
    const type = safeLower(event?.event_type);
    const note = safeLower(event?.note);

    // tune keywords as you see more records
    return (
      type.includes('sequence') ||
      type.includes('annotation') ||
      note.includes('assembly') ||
      note.includes('intron') ||
      note.includes('coordinates') ||
      note.includes('sequence annotation')
    );
  };

  const looksLikeCurationNote = (event) => {
    const type = safeLower(event?.event_type);
    const note = safeLower(event?.note);

    return (
      type.includes('curation') ||
      note.includes('annotation working group') ||
      note.includes('/product') ||
      note.includes('/remarks') ||
      note.includes('please see the cgd sequence') ||
      note.includes('no sequence changes')
    );
  };

  // Reference rendering:
  // - If backend gives HTML, render it.
  // - Otherwise show display_name/formatted_citation (short "Author et al" format) or citation, optionally linked.
  const renderReference = (ref) => {
    if (!ref) return null;
    if (typeof ref === 'string') return <span>{ref}</span>;

    if (ref.html) {
      return <span dangerouslySetInnerHTML={{ __html: ref.html }} />;
    }

    // Prefer display_name or formatted_citation (short format) over full citation
    const label = ref.display_name || ref.formatted_citation || ref.citation || ref.title || ref.text;
    const link = ref.link || ref.url;

    if (link && label) {
      return (
        <a href={link} className="history-ref-link" target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }

    if (label) return <span>{label}</span>;
    return null;
  };

  // Derive blocks from history as a fallback if explicit fields are absent.
  // NOTE: This hook MUST run on every render (even before data loads).
  const derived = useMemo(() => {
    const history = Array.isArray(orgData?.history) ? orgData.history : [];

    const sortedHistory = [...history].sort((a, b) => {
      const ad = new Date(a?.date || 0).getTime();
      const bd = new Date(b?.date || 0).getTime();
      return bd - ad; // newest first
    });

    const fallbackStandard = [];
    const fallbackAliases = [];

    sortedHistory.forEach((ev) => {
      if (!looksLikeNomenclature(ev)) return;

      const name = ev?.name || ev?.value || ev?.symbol || null;
      const nameType = safeLower(ev?.name_type || ev?.subtype || ev?.note);

      if (!name) return;

      if (nameType.includes('standard')) {
        fallbackStandard.push({
          name,
          reference: ev?.reference || ev?.ref || ev?.citation || null,
        });
      } else {
        fallbackAliases.push({
          name,
          reference: ev?.reference || ev?.ref || ev?.citation || null,
        });
      }
    });

    const seqNotes = sortedHistory.filter((ev) => looksLikeSequenceAnnotation(ev));
    const curNotes = sortedHistory.filter((ev) => looksLikeCurationNote(ev));

    const other = sortedHistory.filter(
      (ev) => !looksLikeNomenclature(ev) && !looksLikeSequenceAnnotation(ev) && !looksLikeCurationNote(ev)
    );

    return {
      sortedHistory,
      fallbackStandard,
      fallbackAliases,
      seqNotes,
      curNotes,
      other,
    };
  }, [orgData]); // helpers are stable inside component; orgData drives recompute

  const nomenclatureStandard = orgData?.nomenclature?.standard || derived.fallbackStandard;
  const nomenclatureAliases = orgData?.nomenclature?.aliases || derived.fallbackAliases;

  const sequenceNotes = orgData?.sequence_annotation_notes || derived.seqNotes;
  const curationNotes = orgData?.curation_notes || derived.curNotes;
  const otherHistory = derived.other;

  // ✅ Early returns AFTER all hooks
  if (loading) return <div className="loading">Loading history...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No history data available</div>;
  if (organismNames.length === 0) return <div className="no-data">No history found</div>;

  return (
    <div className="history-details">
      <OrganismSelector
        organisms={organismNames}
        selectedOrganism={selectedOrganism}
        onOrganismChange={setSelectedOrganism}
        dataType="history"
      />

      {selectedOrganism && orgData ? (
        <div className="organism-section">
          <h3 className="organism-name">{selectedOrganism}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {/* 1) Nomenclature History */}
          <div className="history-block">
            <div className="history-block-title">Nomenclature History</div>

            {/* Standard Name */}
            <div className="history-subtitle">Standard Name</div>
            {Array.isArray(nomenclatureStandard) && nomenclatureStandard.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr>
                    <th className="history-col-name">Standard Name</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {nomenclatureStandard.map((row, idx) => (
                    <tr key={`std-${idx}`}>
                      <td className="history-name">{row?.name || '-'}</td>
                      <td>{renderReference(row?.reference) || <span className="muted">-</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="muted history-empty">No standard name history found</div>
            )}

            {/* Alias Name(s) */}
            <div className="history-subtitle">Alias Name(s)</div>
            {Array.isArray(nomenclatureAliases) && nomenclatureAliases.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr>
                    <th className="history-col-name">Alias Name(s)</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {nomenclatureAliases.map((row, idx) => (
                    <tr key={`alias-${idx}`}>
                      <td className="history-name">{row?.name || '-'}</td>
                      <td>{renderReference(row?.reference) || <span className="muted">-</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="muted history-empty">No alias history found</div>
            )}
          </div>

          {/* 2) Sequence Annotation Notes */}
          <div className="history-block">
            <div className="history-block-title">
              Sequence Annotation Notes
              <span className="count-badge">{Array.isArray(sequenceNotes) ? sequenceNotes.length : 0}</span>
            </div>

            {Array.isArray(sequenceNotes) && sequenceNotes.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr>
                    <th className="history-col-date">Date</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {sequenceNotes.map((ev, idx) => (
                    <tr key={`seq-${idx}`}>
                      <td className="history-date">{formatDate(ev?.date)}</td>
                      <td className="history-note">
                        {ev?.note ? (
                          <span dangerouslySetInnerHTML={{ __html: ev.note }} />
                        ) : (
                          <span className="muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="muted history-empty">No sequence annotation notes</div>
            )}
          </div>

          {/* 3) Curation Notes */}
          <div className="history-block">
            <div className="history-block-title">
              Curation Notes
              <span className="count-badge">{Array.isArray(curationNotes) ? curationNotes.length : 0}</span>
            </div>

            {Array.isArray(curationNotes) && curationNotes.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr>
                    <th className="history-col-date">Date</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {curationNotes.map((ev, idx) => (
                    <tr key={`cur-${idx}`}>
                      <td className="history-date">{formatDate(ev?.date)}</td>
                      <td className="history-note">
                        {ev?.note ? (
                          <span dangerouslySetInnerHTML={{ __html: ev.note }} />
                        ) : (
                          <span className="muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="muted history-empty">No curation notes</div>
            )}
          </div>

          {/* Optional: Other History */}
          {Array.isArray(otherHistory) && otherHistory.length > 0 && (
            <div className="history-block history-block-subtle">
              <div className="history-block-title">
                Other History
                <span className="count-badge">{otherHistory.length}</span>
              </div>

              <table className="history-table">
                <thead>
                  <tr>
                    <th className="history-col-date">Date</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {otherHistory.map((ev, idx) => (
                    <tr key={`oth-${idx}`}>
                      <td className="history-date">{formatDate(ev?.date)}</td>
                      <td className="history-note">
                        {ev?.note ? (
                          <span dangerouslySetInnerHTML={{ __html: ev.note }} />
                        ) : (
                          <span className="muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <p className="no-data">Select an organism to view history</p>
      )}
    </div>
  );
}

export default History;

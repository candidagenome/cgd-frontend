import React, { useEffect, useMemo, useState } from 'react';
import './LocusComponents.css';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import { formatHistoryReference } from '../../utils/formatCitation.jsx';

/**
 * Goal layout:
 * 1) Nomenclature History (Standard Name + Alias Name(s))
 * 2) Sequence Annotation Notes
 * 3) Curation Notes
 *
 * Supports:
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

  // yyyy-mm-dd
  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);

    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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

  // Reference rendering using shared utility
  const renderReference = (ref) => {
    return formatHistoryReference(ref);
  };

  // Derive blocks from history as a fallback if explicit fields are absent.
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

    return { fallbackStandard, fallbackAliases };
  }, [orgData]);

  const nomenclatureStandard = orgData?.nomenclature?.standard || derived.fallbackStandard;
  const nomenclatureAliases = orgData?.nomenclature?.aliases || derived.fallbackAliases;

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
            {Array.isArray(nomenclatureStandard) && nomenclatureStandard.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr>
                    {/* ✅ remove duplicate "Standard Name" header row by not repeating the subtitle here */}
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
            {Array.isArray(nomenclatureAliases) && nomenclatureAliases.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr>
                    {/* ✅ remove duplicate "Alias Name(s)" header row by not repeating the subtitle here */}
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

          {/* 2) Note Categories (from backend) */}
          {Array.isArray(orgData?.note_categories) && orgData.note_categories.map((cat, catIdx) => (
            <div key={`cat-${catIdx}`} className="history-block">
              <div className="history-block-title">
                {cat.category}
                <span className="count-badge">{Array.isArray(cat.notes) ? cat.notes.length : 0}</span>
              </div>

              {Array.isArray(cat.notes) && cat.notes.length > 0 ? (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th className="history-col-date">Date</th>
                      <th>Note</th>
                      <th>Reference(s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.notes.map((noteItem, noteIdx) => (
                      <tr key={`cat-${catIdx}-note-${noteIdx}`}>
                        <td className="history-date">{formatDate(noteItem?.date)}</td>
                        <td className="history-note">
                          {noteItem?.note ? (
                            <span dangerouslySetInnerHTML={{ __html: noteItem.note }} />
                          ) : (
                            <span className="muted">-</span>
                          )}
                        </td>
                        <td>{renderReference(noteItem?.references) || <span className="muted">-</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="muted history-empty">No notes</div>
              )}
            </div>
          ))}

        </div>
      ) : (
        <p className="no-data">Select an organism to view history</p>
      )}
    </div>
  );
}

export default History;

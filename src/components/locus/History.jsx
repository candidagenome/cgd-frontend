import React, { useEffect, useMemo, useState } from 'react';
import './LocusComponents.css';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import { formatHistoryReference } from '../../utils/formatCitation.jsx';

/**
 * Goal layout:
 * 1) Nomenclature History
 *    - Reserved Name (with contacts, dates, references) OR
 *    - Standard Name (with date standardized, references)
 *    - Alias Name(s) (with references)
 * 2) Note Categories (Nomenclature History Notes, Sequence Annotation Notes,
 *    Curation Notes, Mapping Notes, Other Notes, etc.)
 *
 * IMPORTANT: All hooks must be called unconditionally.
 */

function History({ data, loading, error }) {
  const [selectedOrganism, setSelectedOrganism] = useState(null);

  /* -------------------------
   * Organism handling
   * ------------------------- */
  const organismNames = useMemo(() => {
    return data?.results ? Object.keys(data.results) : [];
  }, [data]);

  useEffect(() => {
    if (organismNames.length > 0 && !selectedOrganism) {
      setSelectedOrganism(getDefaultOrganism(organismNames));
    }
  }, [organismNames, selectedOrganism]);

  const orgData = useMemo(() => {
    if (!selectedOrganism) return null;
    return data?.results?.[selectedOrganism] || null;
  }, [data, selectedOrganism]);

  /* -------------------------
   * Helpers
   * ------------------------- */
  const safeLower = (s) => (s || '').toString().toLowerCase();

  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
      dt.getDate()
    ).padStart(2, '0')}`;
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

  const renderReference = (ref) => formatHistoryReference(ref);

  /* -------------------------
   * Fallback derivation
   * (CRITICAL: keep full ref objects so PMID is shown)
   * ------------------------- */
  const derived = useMemo(() => {
    const history = Array.isArray(orgData?.history) ? orgData.history : [];

    const sorted = [...history].sort((a, b) => {
      return new Date(b?.date || 0) - new Date(a?.date || 0);
    });

    const fallbackStandard = [];
    const fallbackAliases = [];

    sorted.forEach((ev) => {
      if (!looksLikeNomenclature(ev)) return;

      const name = ev?.name || ev?.value || ev?.symbol;
      if (!name) return;

      const nameType = safeLower(ev?.name_type || ev?.subtype || ev?.note);

      // ✅ Preserve full reference object when available
      const refObj = ev?.reference || ev?.ref || null;
      const refFallback = ev?.citation || null;

      const row = {
        name,
        reference: refObj || refFallback,
      };

      if (nameType.includes('standard')) {
        fallbackStandard.push(row);
      } else {
        fallbackAliases.push(row);
      }
    });

    return { fallbackStandard, fallbackAliases };
  }, [orgData]);

  // Use nomenclature_history for full detail (reserved name, date standardized)
  const nomenclatureHistory = orgData?.nomenclature_history || null;

  // Fallback to simplified nomenclature format
  const nomenclatureStandard =
    orgData?.nomenclature?.standard || derived.fallbackStandard;

  const nomenclatureAliases =
    orgData?.nomenclature?.aliases || derived.fallbackAliases;

  /* -------------------------
   * Early returns (after hooks)
   * ------------------------- */
  if (loading) return <div className="loading">Loading history...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No history data available</div>;
  if (organismNames.length === 0) return <div className="no-data">No history found</div>;

  /* -------------------------
   * Render
   * ------------------------- */
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
          {/* =========================
           * 1) Nomenclature History
           * ========================= */}
          <div className="history-block">
            <div className="history-block-title">Nomenclature History</div>

            {/* Reserved Name (if name is still reserved, not yet standardized) */}
            {nomenclatureHistory?.reserved_name_info && (
              <table className="history-table">
                <thead>
                  <tr>
                    <th className="history-col-name">Reserved Name</th>
                    <th>Contact</th>
                    <th>Reservation Date</th>
                    <th>Reservation Expires</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="history-name">
                      {nomenclatureHistory.reserved_name_info.reserved_name || '-'}
                    </td>
                    <td>
                      {nomenclatureHistory.reserved_name_info.contacts?.length > 0 ? (
                        nomenclatureHistory.reserved_name_info.contacts.map((contact, idx) => (
                          <span key={idx}>
                            {idx > 0 && <br />}
                            <a href={`/colleague/${contact.colleague_no}`}>
                              {contact.first_name} {contact.last_name}
                            </a>
                          </span>
                        ))
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td>
                      {nomenclatureHistory.reserved_name_info.reservation_date
                        ? formatDate(nomenclatureHistory.reserved_name_info.reservation_date)
                        : '-'}
                    </td>
                    <td>
                      {nomenclatureHistory.reserved_name_info.expiration_date
                        ? formatDate(nomenclatureHistory.reserved_name_info.expiration_date)
                        : '-'}
                    </td>
                    <td>
                      {nomenclatureHistory.reserved_name_info.references?.length > 0
                        ? renderReference(nomenclatureHistory.reserved_name_info.references)
                        : <span className="muted">-</span>}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* Standard Name (if standardized) */}
            {nomenclatureHistory?.standard_name_info ? (
              <table className="history-table">
                <thead>
                  <tr>
                    <th className="history-col-name">Standard Name</th>
                    {nomenclatureHistory.standard_name_info.date_standardized && (
                      <th>Date Standardized</th>
                    )}
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="history-name">
                      {nomenclatureHistory.standard_name_info.standard_name || '-'}
                    </td>
                    {nomenclatureHistory.standard_name_info.date_standardized && (
                      <td>{formatDate(nomenclatureHistory.standard_name_info.date_standardized)}</td>
                    )}
                    <td>
                      {nomenclatureHistory.standard_name_info.references?.length > 0
                        ? renderReference(nomenclatureHistory.standard_name_info.references)
                        : <span className="muted">-</span>}
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              /* Fallback to simplified nomenclature format if no nomenclature_history */
              Array.isArray(nomenclatureStandard) && nomenclatureStandard.length > 0 ? (
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
              ) : !nomenclatureHistory?.reserved_name_info && (
                <div className="muted history-empty">No standard name history found</div>
              )
            )}

            {/* Alias Name(s) */}
            {nomenclatureHistory?.alias_names?.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr>
                    <th className="history-col-name">Alias Name(s)</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {nomenclatureHistory.alias_names.map((alias, idx) => (
                    <tr key={`alias-${idx}`}>
                      <td className="history-name">{alias.alias_name || '-'}</td>
                      <td>
                        {alias.references?.length > 0
                          ? renderReference(alias.references)
                          : <span className="muted">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* Fallback to simplified nomenclature format */
              Array.isArray(nomenclatureAliases) && nomenclatureAliases.length > 0 ? (
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
              )
            )}
          </div>

          {/* =========================
           * 2) Note Categories
           * ========================= */}
          {Array.isArray(orgData?.note_categories) &&
            orgData.note_categories.map((cat, catIdx) => (
              <div key={`cat-${catIdx}`} className="history-block">
                <div className="history-block-title">
                  {cat.category}
                  <span className="count-badge">
                    {Array.isArray(cat.notes) ? cat.notes.length : 0}
                  </span>
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
                          <td>
                            {renderReference(noteItem?.references) || (
                              <span className="muted">-</span>
                            )}
                          </td>
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

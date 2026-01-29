import React, { useState, useEffect } from 'react';
import './LocusComponents.css';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';

function History({ data, loading, error }) {
  const [selectedOrganism, setSelectedOrganism] = useState(null);

  const organismNames = data?.results ? Object.keys(data.results) : [];

  useEffect(() => {
    if (organismNames.length > 0 && !selectedOrganism) {
      setSelectedOrganism(getDefaultOrganism(organismNames));
    }
  }, [organismNames, selectedOrganism]);

  if (loading) return <div className="loading">Loading history...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No history data available</div>;

  if (organismNames.length === 0) {
    return <div className="no-data">No history found</div>;
  }

  // Filter to selected organism only
  const organisms = selectedOrganism
    ? [[selectedOrganism, data.results[selectedOrganism]]].filter(([, v]) => v)
    : Object.entries(data.results);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  // Render a reference link
  const renderReference = (ref) => (
    <a
      key={ref.reference_no}
      href={`/reference/${ref.dbxref_id}`}
      className="reference-link"
    >
      {ref.formatted_citation}
    </a>
  );

  // Render references list
  const renderReferences = (references) => {
    if (!references || references.length === 0) return null;
    return (
      <span>
        {references.map((ref, idx) => (
          <span key={ref.reference_no}>
            {idx > 0 && <br />}
            {renderReference(ref)}
          </span>
        ))}
      </span>
    );
  };

  // Render Nomenclature History section
  const renderNomenclatureHistory = (nomenclatureHistory) => {
    if (!nomenclatureHistory) return null;

    const { reserved_name_info, standard_name_info, alias_names } = nomenclatureHistory;

    // Check if there's anything to display
    if (!reserved_name_info && !standard_name_info && (!alias_names || alias_names.length === 0)) {
      return null;
    }

    return (
      <div className="nomenclature-history">
        <h4>Nomenclature History</h4>

        {/* Reserved Name Table */}
        {reserved_name_info && (
          <table className="nomenclature-table">
            <thead>
              <tr>
                <th>Reserved Name</th>
                <th>Contact</th>
                <th>Reservation Date</th>
                <th>Reservation Expires</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{reserved_name_info.reserved_name}</td>
                <td>
                  {reserved_name_info.contacts?.map((contact, idx) => (
                    <span key={contact.colleague_no}>
                      {idx > 0 && <br />}
                      <a href={`/colleague/${contact.colleague_no}`}>
                        {contact.first_name} {contact.last_name}
                      </a>
                    </span>
                  ))}
                </td>
                <td>{formatDate(reserved_name_info.reservation_date)}</td>
                <td>{formatDate(reserved_name_info.expiration_date)}</td>
                <td>{renderReferences(reserved_name_info.references)}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Standard Name Table */}
        {standard_name_info && (
          <table className="nomenclature-table">
            <thead>
              <tr>
                <th>Standard Name</th>
                {standard_name_info.date_standardized && <th>Date Standardized</th>}
                {standard_name_info.references?.length > 0 && <th>Reference</th>}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{standard_name_info.standard_name}</td>
                {standard_name_info.date_standardized && (
                  <td>{formatDate(standard_name_info.date_standardized)}</td>
                )}
                {standard_name_info.references?.length > 0 && (
                  <td>{renderReferences(standard_name_info.references)}</td>
                )}
              </tr>
            </tbody>
          </table>
        )}

        {/* Alias Names Table */}
        {alias_names && alias_names.length > 0 && (
          <table className="nomenclature-table">
            <thead>
              <tr>
                <th>Alias Name(s)</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {alias_names.map((alias, idx) => (
                <tr key={idx}>
                  <td>{alias.alias_name}</td>
                  <td>{renderReferences(alias.references)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // Render Note Categories section
  const renderNoteCategories = (noteCategories) => {
    if (!noteCategories || noteCategories.length === 0) return null;

    return (
      <div className="note-categories">
        {noteCategories.map((category, catIdx) => (
          <div key={catIdx} className="note-category">
            <h4>{category.category}</h4>
            <table className="notes-table">
              <thead>
                <tr>
                  <th className="date-column">Date</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {category.notes.map((note, noteIdx) => (
                  <tr key={noteIdx}>
                    <td className="date-column">{formatDate(note.date)}</td>
                    <td>
                      <div className="note-text">{note.note}</div>
                      {note.references && note.references.length > 0 && (
                        <div className="note-references">
                          {renderReferences(note.references)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="history-details">
      <OrganismSelector
        organisms={organismNames}
        selectedOrganism={selectedOrganism}
        onOrganismChange={setSelectedOrganism}
        dataType="history"
      />
      {organisms.map(([orgName, orgData]) => (
        <div key={orgName} className="organism-section">
          <h3 className="organism-name">{orgName}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {/* Nomenclature History Section */}
          {renderNomenclatureHistory(orgData.nomenclature_history)}

          {/* Note Categories Section */}
          {renderNoteCategories(orgData.note_categories)}

          {/* Show message if no history data */}
          {!orgData.nomenclature_history &&
           (!orgData.note_categories || orgData.note_categories.length === 0) && (
            <p className="no-data">No history for this organism</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default History;

import React from 'react';
import './LocusComponents.css';

function SummaryNotes({ data, loading, error }) {
  if (loading) return <div className="loading">Loading summary notes...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No summary notes available</div>;

  const organisms = Object.entries(data.results);

  if (organisms.length === 0) {
    return <div className="no-data">No summary notes found</div>;
  }

  return (
    <div className="summary-notes">
      {organisms.map(([orgName, orgData]) => (
        <div key={orgName} className="organism-section">
          <h3 className="organism-name">{orgName}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {orgData.summary_notes && orgData.summary_notes.length > 0 ? (
            <div className="notes-list">
              {orgData.summary_notes.map((note, idx) => (
                <div key={idx} className="note-block">
                  <div className="note-content">
                    <p>{note.paragraph_text}</p>
                  </div>
                  <div className="note-meta">
                    Last edited: {new Date(note.date_edited).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No summary notes for this organism</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default SummaryNotes;

import React, { useState, useEffect } from 'react';
import './LocusComponents.css';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';

// Convert <feature:ID>NAME</feature> tags to hyperlinks
const parseFeatureTags = (html) => {
  if (!html) return '';
  return html.replace(/<feature:([^>]+)>([^<]+)<\/feature>/g, '<a href="/locus/$1">$2</a>');
};

function SummaryNotes({ data, loading, error }) {
  const [selectedOrganism, setSelectedOrganism] = useState(null);

  const organismNames = data?.results ? Object.keys(data.results) : [];

  useEffect(() => {
    if (organismNames.length > 0 && !selectedOrganism) {
      setSelectedOrganism(getDefaultOrganism(organismNames));
    }
  }, [organismNames, selectedOrganism]);

  if (loading) return <div className="loading">Loading summary notes...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No summary notes available</div>;

  if (organismNames.length === 0) {
    return <div className="no-data">No summary notes found</div>;
  }

  // Filter to selected organism only
  const organisms = selectedOrganism
    ? [[selectedOrganism, data.results[selectedOrganism]]].filter(([, v]) => v)
    : Object.entries(data.results);

  return (
    <div className="summary-notes">
      <OrganismSelector
        organisms={organismNames}
        selectedOrganism={selectedOrganism}
        onOrganismChange={setSelectedOrganism}
        dataType="summary-notes"
      />
      {organisms.map(([orgName, orgData]) => (
        <div key={orgName} className="organism-section">
          <h3 className="organism-name">{orgName}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {orgData.summary_notes && orgData.summary_notes.length > 0 ? (
            <div className="notes-list">
              {orgData.summary_notes.map((note, idx) => (
                <div key={idx} className="note-block">
                  <div className="note-content">
                    <p dangerouslySetInnerHTML={{ __html: parseFeatureTags(note.paragraph_text) }} />
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

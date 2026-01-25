import React from 'react';
import './LocusComponents.css';

function History({ data, loading, error }) {
  if (loading) return <div className="loading">Loading history...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No history data available</div>;

  const organisms = Object.entries(data.results);

  if (organisms.length === 0) {
    return <div className="no-data">No history found</div>;
  }

  const getEventTypeClass = (eventType) => {
    const type = eventType?.toLowerCase() || '';
    if (type.includes('curatorial')) return 'event-curatorial';
    if (type.includes('annotation')) return 'event-annotation';
    if (type.includes('sequence')) return 'event-sequence';
    return 'event-default';
  };

  return (
    <div className="history-details">
      {organisms.map(([orgName, orgData]) => (
        <div key={orgName} className="organism-section">
          <h3 className="organism-name">{orgName}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {orgData.history && orgData.history.length > 0 ? (
            <div className="history-timeline">
              {orgData.history.map((event, idx) => (
                <div key={idx} className={`history-event ${getEventTypeClass(event.event_type)}`}>
                  <div className="event-header">
                    <span className="event-type">{event.event_type}</span>
                    <span className="event-date">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  {event.note && (
                    <div className="event-note">
                      <p>{event.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No history for this organism</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default History;

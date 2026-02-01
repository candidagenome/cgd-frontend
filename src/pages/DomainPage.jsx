import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import locusApi from '../api/locusApi';
import './DomainPage.css';

function DomainPage() {
  const { name } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrganism, setSelectedOrganism] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await locusApi.getDomainDetails(name);
        setData(result);
        // Set default organism
        const organisms = Object.keys(result.results || {});
        if (organisms.length > 0) {
          setSelectedOrganism(organisms[0]);
        }
      } catch (err) {
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      fetchData();
    }
  }, [name]);

  if (loading) {
    return (
      <div className="domain-page">
        <div className="loading">Loading domain information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="domain-page">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!data || !data.results || Object.keys(data.results).length === 0) {
    return (
      <div className="domain-page">
        <div className="no-data">No domain data available for {name}</div>
      </div>
    );
  }

  const organisms = Object.keys(data.results);
  const currentData = selectedOrganism ? data.results[selectedOrganism] : null;

  const renderOrganismSelector = () => {
    if (organisms.length <= 1) return null;

    return (
      <div className="organism-selector">
        <label>Select organism: </label>
        <select
          value={selectedOrganism || ''}
          onChange={(e) => setSelectedOrganism(e.target.value)}
        >
          {organisms.map((org) => (
            <option key={org} value={org}>{org}</option>
          ))}
        </select>
      </div>
    );
  };

  const renderDescription = () => (
    <div className="description">
      <p>
        This page displays predicted protein domains and motifs for{' '}
        <span className="protein-name">{currentData.protein_name}</span>.
        Domain predictions are from InterPro member databases.
        Transmembrane domains are predicted using TMHMM, and signal peptides using SignalP.
      </p>
      <p className="return-link">
        Return to <Link to={`/locus/${currentData.locus_display_name}#protein`}>
          {currentData.protein_name} Protein Information Page
        </Link>
      </p>
    </div>
  );

  const renderConservedDomains = () => {
    if (!currentData.interpro_domains || currentData.interpro_domains.length === 0) {
      return (
        <div className="property-section">
          <h3 className="section-header">Conserved Domains</h3>
          <p className="no-data-message">
            No conserved domains found for <span className="protein-name">{currentData.protein_name}</span>.
          </p>
        </div>
      );
    }

    return (
      <div className="property-section">
        <h3 className="section-header">Conserved Domains</h3>
        {currentData.interpro_domains.map((ipr, idx) => (
          <div key={idx} className="interpro-group">
            <div className="interpro-header">
              {ipr.interpro_id ? (
                <>
                  <span className="interpro-label">InterPro</span>{' '}
                  <a href={ipr.interpro_url} target="_blank" rel="noopener noreferrer" className="interpro-id">
                    {ipr.interpro_id}
                  </a>
                  {ipr.interpro_description && (
                    <span className="interpro-desc"> - {ipr.interpro_description}</span>
                  )}
                </>
              ) : (
                <span className="interpro-label unintegrated">Unintegrated</span>
              )}
            </div>
            <table className="domain-table">
              <thead>
                <tr>
                  <th>Database</th>
                  <th>Accession</th>
                  <th>Description</th>
                  <th>Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {ipr.member_domains.map((member, midx) => (
                  <tr key={midx}>
                    <td>{member.member_db}</td>
                    <td>
                      {member.member_url ? (
                        <a href={member.member_url} target="_blank" rel="noopener noreferrer">
                          {member.member_id}
                        </a>
                      ) : (
                        member.member_id
                      )}
                    </td>
                    <td>{member.description}</td>
                    <td className="coords">
                      {member.hits.map((hit, hidx) => (
                        <span key={hidx}>
                          {hit.start_coord}-{hit.stop_coord}
                          {hidx < member.hits.length - 1 && ', '}
                        </span>
                      ))}
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

  const renderTransmembraneDomains = () => {
    if (!currentData.transmembrane_domains || currentData.transmembrane_domains.length === 0) {
      return (
        <div className="property-section">
          <h3 className="section-header">Transmembrane Domains</h3>
          <p className="no-data-message">
            No transmembrane domains predicted for <span className="protein-name">{currentData.protein_name}</span>.
          </p>
        </div>
      );
    }

    return (
      <div className="property-section">
        <h3 className="section-header">Transmembrane Domains</h3>
        <p className="section-note">Predicted using TMHMM</p>
        <table className="property-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {currentData.transmembrane_domains.map((tm, idx) => (
              <tr key={idx}>
                <td>{tm.type}</td>
                <td className="center">{tm.start_coord}</td>
                <td className="center">{tm.stop_coord}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSignalPeptides = () => {
    if (!currentData.signal_peptides || currentData.signal_peptides.length === 0) {
      return (
        <div className="property-section">
          <h3 className="section-header">Signal Peptides</h3>
          <p className="no-data-message">
            No signal peptides predicted for <span className="protein-name">{currentData.protein_name}</span>.
          </p>
        </div>
      );
    }

    return (
      <div className="property-section">
        <h3 className="section-header">Signal Peptides</h3>
        <p className="section-note">Predicted using SignalP</p>
        <table className="property-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {currentData.signal_peptides.map((sp, idx) => (
              <tr key={idx}>
                <td>{sp.type}</td>
                <td className="center">{sp.start_coord}</td>
                <td className="center">{sp.stop_coord || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderExternalLinks = () => {
    if (!currentData.external_links || currentData.external_links.length === 0) {
      return null;
    }

    return (
      <div className="property-section">
        <h3 className="section-header">External Domain Search</h3>
        <p className="section-note">
          Search external databases for domain/motif information for{' '}
          <span className="protein-name">{currentData.protein_name}</span>
        </p>
        <div className="external-links">
          {currentData.external_links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="external-link-button"
              title={link.description}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="domain-page">
      <header className="page-header">
        <h1>
          <em>{selectedOrganism}</em>{' '}
          <span className="protein-name">{currentData.protein_name}</span>{' '}
          Conserved Domains
        </h1>
      </header>

      {renderOrganismSelector()}

      {renderDescription()}

      {renderConservedDomains()}

      {renderTransmembraneDomains()}

      {renderSignalPeptides()}

      {renderExternalLinks()}
    </div>
  );
}

export default DomainPage;

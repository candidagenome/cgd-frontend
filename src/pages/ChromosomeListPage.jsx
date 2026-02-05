import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import chromosomeApi from '../api/chromosomeApi';
import './ChromosomeListPage.css';

function ChromosomeListPage() {
  const navigate = useNavigate();

  const [organisms, setOrganisms] = useState([]);
  const [selectedOrganism, setSelectedOrganism] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChromosomes = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await chromosomeApi.list();
        setOrganisms(data.organisms || []);
        // Auto-select first organism if available
        if (data.organisms?.length > 0) {
          setSelectedOrganism(data.organisms[0].organism_abbrev);
        }
      } catch (err) {
        console.error('Chromosome list error:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load chromosomes');
      } finally {
        setLoading(false);
      }
    };

    fetchChromosomes();
  }, []);

  const handleOrganismChange = (e) => {
    setSelectedOrganism(e.target.value);
  };

  const handleChromosomeClick = (name) => {
    navigate(`/chromosome/${encodeURIComponent(name)}`);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString();
  };

  const selectedOrg = organisms.find((org) => org.organism_abbrev === selectedOrganism);

  if (loading) {
    return (
      <div className="chromosome-list-page">
        <div className="chromosome-list-content">
          <h1>Chromosomes & Contigs</h1>
          <hr />
          <div className="loading-state">
            <span className="loading-spinner"></span>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chromosome-list-page">
        <div className="chromosome-list-content">
          <h1>Chromosomes & Contigs</h1>
          <hr />
          <div className="error-state">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chromosome-list-page">
      <div className="chromosome-list-content">
        <h1>Chromosomes & Contigs</h1>
        <hr />

        <p className="page-description">
          Select an organism to view its chromosomes and contigs.
          Click on a chromosome name to view detailed information.
        </p>

        {/* Organism Selector */}
        <div className="organism-selector">
          <label htmlFor="organism-select">Select Organism:</label>
          <select
            id="organism-select"
            value={selectedOrganism}
            onChange={handleOrganismChange}
          >
            {organisms.map((org) => (
              <option key={org.organism_abbrev} value={org.organism_abbrev}>
                {org.organism_name} ({org.chromosomes.length} chromosomes/contigs)
              </option>
            ))}
          </select>
        </div>

        {/* Chromosome List */}
        {selectedOrg && (
          <div className="chromosome-list">
            <h2>{selectedOrg.organism_name}</h2>
            <p className="chromosome-count">
              {selectedOrg.chromosomes.length} chromosome(s)/contig(s)
            </p>

            <table className="chromosome-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Length (bp)</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrg.chromosomes.map((chr) => (
                  <tr
                    key={chr.feature_no}
                    onClick={() => handleChromosomeClick(chr.feature_name)}
                    className="clickable-row"
                  >
                    <td>
                      <Link to={`/chromosome/${encodeURIComponent(chr.feature_name)}`}>
                        {chr.feature_name}
                      </Link>
                    </td>
                    <td>{chr.feature_type}</td>
                    <td className="length-cell">{formatNumber(chr.length)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {organisms.length === 0 && (
          <p className="no-data">No chromosomes found in the database.</p>
        )}
      </div>
    </div>
  );
}

export default ChromosomeListPage;

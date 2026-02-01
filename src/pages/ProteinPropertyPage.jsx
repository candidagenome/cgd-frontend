import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import locusApi from '../api/locusApi';
import './ProteinPropertyPage.css';

function ProteinPropertyPage() {
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
        const result = await locusApi.getProteinProperties(name);
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
      <div className="protein-property-page">
        <div className="loading">Loading protein properties...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="protein-property-page">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!data || !data.results || Object.keys(data.results).length === 0) {
    return (
      <div className="protein-property-page">
        <div className="no-data">No protein property data available for {name}</div>
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
        Composition statistics, extinction coefficients and bulk protein properties were calculated
        based on a conceptual translation of the complete open reading frame, and assume no
        post-translational processing or modifications. Codon usage statistics were generated
        using the CodonW program on the ORF DNA sequence.
      </p>
      <p className="return-link">
        Return to <Link to={`/locus/${currentData.locus_display_name}#protein`}>
          {currentData.protein_name} Protein Information Page
        </Link>
      </p>
    </div>
  );

  const renderAminoAcidComposition = () => {
    if (!currentData.amino_acid_composition || currentData.amino_acid_composition.length === 0) {
      return null;
    }

    return (
      <div className="property-section">
        <h3 className="section-header">Amino Acid Composition</h3>
        <table className="property-table aa-table">
          <thead>
            <tr>
              <th>Amino Acid</th>
              <th>Count</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {currentData.amino_acid_composition.map((aa, idx) => (
              <tr key={idx}>
                <td>{aa.amino_acid}</td>
                <td className="center">{aa.count}</td>
                <td className="center">{aa.percentage.toFixed(1)}%</td>
              </tr>
            ))}
            <tr className="total-row">
              <td><strong>Total Length</strong></td>
              <td colSpan="2" className="center"><strong>{currentData.protein_length}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderBulkProperties = () => {
    if (!currentData.bulk_properties || currentData.bulk_properties.length === 0) {
      return null;
    }

    return (
      <div className="property-section">
        <h3 className="section-header">Bulk Protein Properties</h3>
        <table className="property-table">
          <tbody>
            {currentData.bulk_properties.map((prop, idx) => (
              <tr key={idx}>
                <td>{prop.label}</td>
                <td className="center">
                  {prop.value}
                  {prop.note && <span className="note"> {prop.note}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderExtinctionCoefficients = () => {
    if (!currentData.extinction_coefficients || currentData.extinction_coefficients.length === 0) {
      return null;
    }

    return (
      <div className="property-section">
        <h3 className="section-header">Extinction Coefficients</h3>
        <table className="property-table">
          <tbody>
            {currentData.extinction_coefficients.map((ec, idx) => (
              <tr key={idx}>
                <td>{ec.condition}</td>
                <td className="center">{ec.value.toFixed(0)} {ec.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCodonUsage = () => {
    if (!currentData.codon_usage || currentData.codon_usage.length === 0) {
      return null;
    }

    return (
      <div className="property-section">
        <h3 className="section-header">Codon Usage Statistics</h3>
        <table className="property-table">
          <tbody>
            {currentData.codon_usage.map((cu, idx) => (
              <tr key={idx}>
                <td>{cu.label}</td>
                <td className="center">{cu.value.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAtomicComposition = () => {
    if (!currentData.atomic_composition || currentData.atomic_composition.length === 0) {
      return null;
    }

    return (
      <div className="property-section">
        <h3 className="section-header">Atomic Composition</h3>
        <table className="property-table">
          <tbody>
            {currentData.atomic_composition.map((ac, idx) => (
              <tr key={idx}>
                <td>{ac.atom}</td>
                <td className="center">{ac.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (currentData.has_ambiguous_residues) {
    return (
      <div className="protein-property-page">
        <header className="page-header">
          <h1>
            <em>{selectedOrganism}</em>{' '}
            <span className="protein-name">{currentData.protein_name}</span>{' '}
            Physicochemical Properties
          </h1>
        </header>
        {renderOrganismSelector()}
        <div className="error-message">
          We're sorry: properties for {currentData.protein_name} were not calculated because
          its protein sequence contains ambiguous residues.
        </div>
        <p className="return-link">
          Return to <Link to={`/locus/${currentData.locus_display_name}#protein`}>
            {currentData.protein_name} Protein Information Page
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="protein-property-page">
      <header className="page-header">
        <h1>
          <em>{selectedOrganism}</em>{' '}
          <span className="protein-name">{currentData.protein_name}</span>{' '}
          Physicochemical Properties
        </h1>
      </header>

      {renderOrganismSelector()}

      {renderDescription()}

      <div className="properties-layout">
        <div className="left-column">
          {renderAminoAcidComposition()}
        </div>
        <div className="right-column">
          {renderBulkProperties()}
          {renderExtinctionCoefficients()}
          {renderCodonUsage()}
          {renderAtomicComposition()}
        </div>
      </div>
    </div>
  );
}

export default ProteinPropertyPage;

import React, { useState, useEffect } from 'react';
import { locusApi } from '../../api/locusApi';

// Species display order and abbreviations
const SPECIES_ORDER = [
  'Candida albicans SC5314',
  'Candida glabrata CBS138',
  'Candida parapsilosis CDC317',
  'Candida dubliniensis CD36',
  'Candida auris B8441',
];

const SPECIES_ABBREV = {
  'Candida albicans SC5314': 'C. albicans',
  'Candida glabrata CBS138': 'C. glabrata',
  'Candida parapsilosis CDC317': 'C. parapsilosis',
  'Candida dubliniensis CD36': 'C. dubliniensis',
  'Candida auris B8441': 'C. auris',
};

function ChromosomeSelector({ selectedChromosome, onSelect, loading: externalLoading }) {
  const [chromosomeData, setChromosomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrganism, setSelectedOrganism] = useState(SPECIES_ORDER[0]);

  // Fetch chromosome list on mount
  useEffect(() => {
    const fetchChromosomes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await locusApi.getChromosomeList();
        setChromosomeData(data.chromosomes);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load chromosomes');
      } finally {
        setLoading(false);
      }
    };

    fetchChromosomes();
  }, []);

  // Handle organism selection change
  const handleOrganismChange = (e) => {
    setSelectedOrganism(e.target.value);
  };

  // Handle chromosome selection change
  const handleChromosomeChange = (e) => {
    const chromosomeName = e.target.value;
    if (chromosomeName && chromosomeData) {
      // Find the chromosome data
      const orgChromosomes = chromosomeData[selectedOrganism] || [];
      const chrData = orgChromosomes.find(c => c.chromosome === chromosomeName);
      if (chrData) {
        onSelect(chrData);
      }
    }
  };

  if (loading) {
    return (
      <div className="chromosome-selector">
        <span className="selector-loading">Loading chromosomes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chromosome-selector">
        <span className="selector-error">Error: {error}</span>
      </div>
    );
  }

  // Get chromosomes for selected organism
  const availableChromosomes = chromosomeData?.[selectedOrganism] || [];

  // Get available organisms
  const availableOrganisms = SPECIES_ORDER.filter(org => chromosomeData?.[org]?.length > 0);

  return (
    <div className="chromosome-selector">
      <div className="selector-group">
        <label htmlFor="organism-select">Organism:</label>
        <select
          id="organism-select"
          value={selectedOrganism}
          onChange={handleOrganismChange}
          disabled={externalLoading}
        >
          {availableOrganisms.map(org => (
            <option key={org} value={org}>
              {SPECIES_ABBREV[org] || org}
            </option>
          ))}
        </select>
      </div>

      <div className="selector-group">
        <label htmlFor="chromosome-select">Chromosome:</label>
        <select
          id="chromosome-select"
          value={selectedChromosome?.chromosome || ''}
          onChange={handleChromosomeChange}
          disabled={externalLoading || availableChromosomes.length === 0}
        >
          <option value="">Select a chromosome...</option>
          {availableChromosomes.map(chr => (
            <option key={chr.chromosome} value={chr.chromosome}>
              {chr.chromosome.replace(/_C_.*$/, '')} ({chr.gene_count.toLocaleString()} genes, {(chr.length / 1000).toFixed(0)} kb)
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ChromosomeSelector;

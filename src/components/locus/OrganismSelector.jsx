import React from 'react';
import './LocusComponents.css';

const DEFAULT_ORGANISM = 'Candida albicans SC5314';

/**
 * Reusable organism selector component for tab pages.
 * Defaults to "Candida albicans SC5314" if it has data.
 */
function OrganismSelector({ organisms, selectedOrganism, onOrganismChange, dataType }) {
  if (!organisms || organisms.length === 0) {
    return null;
  }

  // If only one organism, show info text instead of dropdown
  if (organisms.length === 1) {
    return (
      <div className="organism-selector single-organism">
        <span className="organism-info">Organism: <strong>{organisms[0]}</strong></span>
      </div>
    );
  }

  return (
    <div className="organism-selector">
      <label htmlFor={`organism-select-${dataType || 'default'}`}>Select Organism: </label>
      <select
        id={`organism-select-${dataType || 'default'}`}
        value={selectedOrganism || ''}
        onChange={(e) => onOrganismChange(e.target.value)}
        className="organism-dropdown"
      >
        {organisms.map(org => (
          <option key={org} value={org}>{org}</option>
        ))}
      </select>
    </div>
  );
}

/**
 * Helper function to determine the best default organism.
 * Prefers "Candida albicans SC5314" if available, otherwise uses the first organism.
 */
export function getDefaultOrganism(organisms) {
  if (!organisms || organisms.length === 0) {
    return null;
  }
  // Check if default organism exists
  if (organisms.includes(DEFAULT_ORGANISM)) {
    return DEFAULT_ORGANISM;
  }
  // Otherwise return the first organism
  return organisms[0];
}

export { DEFAULT_ORGANISM };
export default OrganismSelector;

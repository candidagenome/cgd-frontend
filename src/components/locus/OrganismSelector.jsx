import React from 'react';
import { useParams } from 'react-router-dom';
import './LocusComponents.css';

const DEFAULT_ORGANISM = 'Candida albicans SC5314';

/**
 * Detect the type of locus identifier and return appropriate label.
 * - CGDID: starts with "CAL" followed by digits (e.g., CAL0000191211)
 * - Systematic name: other identifier formats (e.g., C1_13700W_A)
 */
function getIdentifierLabel(identifier) {
  if (!identifier) return null;

  if (/^CAL\d+$/i.test(identifier)) {
    return `CGDID ${identifier}`;
  }
  return `Systematic name ${identifier}`;
}

/**
 * Reusable organism selector component for tab pages.
 * Defaults to "Candida albicans SC5314" if it has data.
 */
function OrganismSelector({ organisms, selectedOrganism, onOrganismChange, dataType }) {
  const { name } = useParams();

  if (!organisms || organisms.length === 0) {
    return null;
  }

  // If only one organism, show info text instead of dropdown
  if (organisms.length === 1) {
    const identifierLabel = getIdentifierLabel(name);
    return (
      <div className="organism-selector single-organism">
        <div className="organism-info-container">
          <span className="organism-info">Organism: <strong>{organisms[0]}</strong></span>
          {identifierLabel && (
            <span className="organism-availability-note">({identifierLabel} is specific to this organism)</span>
          )}
        </div>
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

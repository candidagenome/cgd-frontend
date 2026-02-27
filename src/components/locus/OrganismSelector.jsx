import React from 'react';
import { useParams } from 'react-router-dom';
import './LocusComponents.css';

const DEFAULT_ORGANISM = 'Candida albicans SC5314';
const ALL_ORGANISMS_VALUE = '__all__';

/**
 * Reusable organism selector component for tab pages.
 * Defaults to "Candida albicans SC5314" if it has data.
 *
 * @param {string} context - 'locus' (default) or 'search' to customize messaging
 * @param {Object} organismCounts - Optional map of organism name to count (for search context)
 * @param {boolean} showAllOption - Whether to show "All Organisms" option (default: false)
 * @param {number} totalCount - Optional explicit total count for "All Organisms" (overrides calculated sum)
 */
function OrganismSelector({
  organisms,
  selectedOrganism,
  onOrganismChange,
  dataType,
  context = 'locus',
  organismCounts = null,
  showAllOption = false,
  totalCount: explicitTotalCount = null
}) {
  const { name } = useParams();

  if (!organisms || organisms.length === 0) {
    return null;
  }

  // Calculate total count for "All Organisms" option
  // Use explicit totalCount if provided, otherwise sum organismCounts or fall back to organisms.length
  const totalCount = explicitTotalCount !== null
    ? explicitTotalCount
    : (organismCounts
        ? Object.values(organismCounts).reduce((sum, count) => sum + count, 0)
        : organisms.length);

  // Helper to format organism label with count
  const formatOrganismLabel = (org) => {
    if (organismCounts && organismCounts[org] !== undefined) {
      return `${org} (${organismCounts[org]})`;
    }
    return org;
  };

  // If only one organism, show info text instead of dropdown
  if (organisms.length === 1 && !showAllOption) {
    const note = context === 'search'
      ? '(Results are only found in this organism)'
      : name
        ? `(Identifier ${name} is specific to this organism)`
        : null;

    return (
      <div className="organism-selector single-organism">
        <div className="organism-info-container">
          <span className="organism-info">Organism: <strong>{formatOrganismLabel(organisms[0])}</strong></span>
          {note && (
            <span className="organism-availability-note">{note}</span>
          )}
        </div>
      </div>
    );
  }

  // Handle dropdown change - convert special "all" value to null
  const handleChange = (e) => {
    const value = e.target.value;
    onOrganismChange(value === ALL_ORGANISMS_VALUE ? null : value);
  };

  return (
    <div className="organism-selector">
      <label htmlFor={`organism-select-${dataType || 'default'}`}>Select Organism: </label>
      <select
        id={`organism-select-${dataType || 'default'}`}
        value={selectedOrganism || ALL_ORGANISMS_VALUE}
        onChange={handleChange}
        className="organism-dropdown"
      >
        {showAllOption && (
          <option value={ALL_ORGANISMS_VALUE}>All Organisms ({totalCount})</option>
        )}
        {organisms.map(org => (
          <option key={org} value={org}>{formatOrganismLabel(org)}</option>
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

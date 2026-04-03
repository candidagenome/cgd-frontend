import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './LocusComponents.css';

const DEFAULT_ORGANISM = 'Candida albicans SC5314';
const ALL_ORGANISMS_VALUE = '__all__';
const ORTHOLOG_PREFIX = '__ortholog__';

/**
 * Reusable organism selector component for tab pages.
 * Defaults to "Candida albicans SC5314" if it has data.
 *
 * @param {string} context - 'locus' (default) or 'search' to customize messaging
 * @param {Object} organismCounts - Optional map of organism name to count (for search context)
 * @param {boolean} showAllOption - Whether to show "All Organisms" option (default: false)
 * @param {number} totalCount - Optional explicit total count for "All Organisms" (overrides calculated sum)
 * @param {Array} orthologOrganisms - Optional list of {organism, feature_name} for ortholog navigation
 */
function OrganismSelector({
  organisms,
  selectedOrganism,
  onOrganismChange,
  dataType,
  context = 'locus',
  organismCounts = null,
  showAllOption = false,
  totalCount: explicitTotalCount = null,
  orthologOrganisms = []
}) {
  const { name } = useParams();
  const navigate = useNavigate();

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

  // Filter out ortholog organisms that are already in the main organisms list
  // (computed early so we can use it in the single-organism check)
  const filteredOrthologOrganisms = orthologOrganisms.filter(
    orth => !organisms.includes(orth.organism)
  );

  // Handle dropdown change - convert special "all" value to null, navigate for orthologs
  const handleChange = (e) => {
    const value = e.target.value;

    // Check if it's an ortholog selection (navigate to ortholog locus)
    if (value.startsWith(ORTHOLOG_PREFIX)) {
      const featureName = value.substring(ORTHOLOG_PREFIX.length);
      navigate(`/locus/${featureName}`);
      return;
    }

    onOrganismChange(value === ALL_ORGANISMS_VALUE ? null : value);
  };

  // If only one organism AND no orthologs to show, display info text instead of dropdown
  // But if there are orthologs, show dropdown so users can navigate to them
  if (organisms.length === 1 && !showAllOption && filteredOrthologOrganisms.length === 0) {
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
        {filteredOrthologOrganisms.length > 0 && (
          <>
            <option disabled>─── Orthologs in ───</option>
            {filteredOrthologOrganisms.map(orth => (
              <option
                key={`ortholog-${orth.feature_name}`}
                value={`${ORTHOLOG_PREFIX}${orth.feature_name}`}
                className="ortholog-option"
              >
                {orth.organism}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
}

/**
 * Helper function to determine the best default organism.
 * Priority:
 * 1. queryOrganism (the organism the searched gene belongs to)
 * 2. "Candida albicans SC5314" if available
 * 3. First organism in the list
 *
 * @param {Array} organisms - List of available organisms
 * @param {string} queryOrganism - The organism that the queried gene belongs to (from API)
 */
export function getDefaultOrganism(organisms, queryOrganism = null) {
  if (!organisms || organisms.length === 0) {
    return null;
  }
  // If queryOrganism is provided and exists in the list, use it
  if (queryOrganism && organisms.includes(queryOrganism)) {
    return queryOrganism;
  }
  // Fall back to default organism if available
  if (organisms.includes(DEFAULT_ORGANISM)) {
    return DEFAULT_ORGANISM;
  }
  // Otherwise return the first organism
  return organisms[0];
}

export { DEFAULT_ORGANISM };
export default OrganismSelector;

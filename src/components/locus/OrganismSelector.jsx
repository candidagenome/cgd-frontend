import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './LocusComponents.css';

const DEFAULT_ORGANISM = 'Candida albicans SC5314';
const ALL_ORGANISMS_VALUE = '__all__';
const ORTHOLOG_PREFIX = '__ortholog__';
const NO_ORTHOLOG_PREFIX = '__no_ortholog__';

// Consistent CGD organism list for locus pages
const CGOB_LOCUS_ORGANISMS = [
  'Candida albicans SC5314',
  'Candida dubliniensis CD36',
  'Candida tropicalis MYA-3404',
  'Candida parapsilosis CDC317',
  'Candida auris B8441',
  'Candida glabrata CBS138',
];

/**
 * Reusable organism selector component for tab pages.
 * Defaults to "Candida albicans SC5314" if it has data.
 *
 * @param {string} context - 'locus' (default) or 'search' to customize messaging
 * @param {Object} organismCounts - Optional map of organism name to count (for search context)
 * @param {boolean} showAllOption - Whether to show "All Organisms" option (default: false)
 * @param {number} totalCount - Optional explicit total count for "All Organisms" (overrides calculated sum)
 * @param {Array} orthologOrganisms - Optional list of {organism, feature_name} for ortholog navigation
 * @param {boolean} showConsistentCgobList - Show all 5 CGOB organisms consistently (default: true for locus context)
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
  orthologOrganisms = [],
  showConsistentCgobList = null,  // null means auto-detect based on context
}) {
  const { name } = useParams();
  const navigate = useNavigate();

  // Determine if we should show consistent CGOB list
  // Default: true for locus context, false for search context
  const useConsistentList = showConsistentCgobList !== null
    ? showConsistentCgobList
    : (context === 'locus');

  // If no organisms with data AND no orthologs AND not using consistent list, hide selector
  const hasOrganisms = organisms && organisms.length > 0;
  const hasOrthologs = orthologOrganisms && orthologOrganisms.length > 0;

  if (!hasOrganisms && !hasOrthologs && !useConsistentList) {
    return null;
  }

  // Normalize organisms to empty array if null/undefined
  const safeOrganisms = organisms || [];

  // Calculate total count for "All Organisms" option
  // Use explicit totalCount if provided, otherwise sum organismCounts or fall back to organisms.length
  const totalCount = explicitTotalCount !== null
    ? explicitTotalCount
    : (organismCounts
        ? Object.values(organismCounts).reduce((sum, count) => sum + count, 0)
        : safeOrganisms.length);

  // Helper to format organism label with count
  const formatOrganismLabel = (org) => {
    if (organismCounts && organismCounts[org] !== undefined) {
      return `${org} (${organismCounts[org]})`;
    }
    return org;
  };

  // Build a map of ortholog organisms for quick lookup
  const orthologMap = {};
  orthologOrganisms.forEach(orth => {
    orthologMap[orth.organism] = orth.feature_name;
  });

  // Filter out ortholog organisms that are already in the main organisms list
  // (computed early so we can use it in the single-organism check)
  const filteredOrthologOrganisms = orthologOrganisms.filter(
    orth => !safeOrganisms.includes(orth.organism)
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

    // Ignore selection of "no ortholog" items
    if (value.startsWith(NO_ORTHOLOG_PREFIX)) {
      return;
    }

    onOrganismChange(value === ALL_ORGANISMS_VALUE ? null : value);
  };

  // If only one organism AND no orthologs to show AND not using consistent list,
  // display info text instead of dropdown
  if (safeOrganisms.length === 1 && !showAllOption && filteredOrthologOrganisms.length === 0 && !useConsistentList) {
    const note = context === 'search'
      ? '(Results are only found in this organism)'
      : name
        ? `(Identifier ${name} is specific to this organism)`
        : null;

    return (
      <div className="organism-selector single-organism">
        <div className="organism-info-container">
          <span className="organism-info">Organism: <strong>{formatOrganismLabel(safeOrganisms[0])}</strong></span>
          {note && (
            <span className="organism-availability-note">{note}</span>
          )}
        </div>
      </div>
    );
  }

  // When using consistent CGOB list, show all 5 organisms in order
  if (useConsistentList) {
    // Compute the effective dropdown value - must match an actual option value
    // IMPORTANT: Respect the user's selected organism, even if it has no data
    const selectedIsCgobOrg = selectedOrganism && CGOB_LOCUS_ORGANISMS.includes(selectedOrganism);
    const selectedHasDirectData = selectedOrganism && safeOrganisms.includes(selectedOrganism);
    const selectedHasOrtholog = selectedOrganism && orthologMap[selectedOrganism];
    const firstOrgWithData = CGOB_LOCUS_ORGANISMS.find(org => safeOrganisms.includes(org));

    // Determine the dropdown value - always respect user's selection if it's a valid CGOB organism
    let dropdownValue;
    if (selectedIsCgobOrg) {
      // User selected a CGOB organism - use the appropriate option value
      if (selectedHasDirectData) {
        dropdownValue = selectedOrganism;
      } else if (selectedHasOrtholog) {
        dropdownValue = `${ORTHOLOG_PREFIX}${orthologMap[selectedOrganism]}`;
      } else {
        dropdownValue = `${NO_ORTHOLOG_PREFIX}${selectedOrganism}`;
      }
    } else if (showAllOption) {
      dropdownValue = ALL_ORGANISMS_VALUE;
    } else if (firstOrgWithData) {
      // No organism selected yet - default to first with data
      dropdownValue = firstOrgWithData;
    } else {
      // No data for any organism - default to first CGOB organism
      dropdownValue = `${NO_ORTHOLOG_PREFIX}${CGOB_LOCUS_ORGANISMS[0]}`;
    }

    return (
      <div className="organism-selector">
        <label htmlFor={`organism-select-${dataType || 'default'}`}>Select Organism: </label>
        <select
          id={`organism-select-${dataType || 'default'}`}
          value={dropdownValue}
          onChange={handleChange}
          className="organism-dropdown"
        >
          {showAllOption && (
            <option value={ALL_ORGANISMS_VALUE}>All Organisms ({totalCount})</option>
          )}
          {CGOB_LOCUS_ORGANISMS.map(org => {
            const hasDirectData = safeOrganisms.includes(org);
            const hasOrtholog = orthologMap[org];

            if (hasDirectData) {
              // Organism has direct data - show as normal selectable option
              return (
                <option key={org} value={org}>{formatOrganismLabel(org)}</option>
              );
            } else if (hasOrtholog) {
              // Organism has ortholog - navigate to ortholog locus
              return (
                <option
                  key={`ortholog-${org}`}
                  value={`${ORTHOLOG_PREFIX}${hasOrtholog}`}
                >
                  {org}
                </option>
              );
            } else {
              // No data for this organism - show as disabled
              return (
                <option
                  key={`no-ortholog-${org}`}
                  value={`${NO_ORTHOLOG_PREFIX}${org}`}
                  disabled
                  style={{ color: '#999' }}
                >
                  {org}
                </option>
              );
            }
          })}
        </select>
      </div>
    );
  }

  // Original behavior: show organisms with data + orthologs section
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
        {safeOrganisms.map(org => (
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

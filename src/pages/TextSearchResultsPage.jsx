import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { searchApi } from '../api/searchApi';
import { CitationLinksBelow, formatCitationString } from '../utils/formatCitation.jsx';
import './TextSearchResultsPage.css';

// Register AG Grid modules once
if (!ModuleRegistry.__cgdRegistered) {
  ModuleRegistry.registerModules([AllCommunityModule]);
  ModuleRegistry.__cgdRegistered = true;
}

// Default organisms to show in facet
const DEFAULT_ORGANISMS = [
  { organism_abbrev: 'C_albicans_SC5314', organism_name: 'Candida albicans SC5314' },
  { organism_abbrev: 'C_glabrata_CBS138', organism_name: 'Candida glabrata CBS138' },
  { organism_abbrev: 'C_parapsilosis_CDC317', organism_name: 'Candida parapsilosis CDC317' },
  { organism_abbrev: 'C_tropicalis_MYA-3404', organism_name: 'Candida tropicalis MYA-3404' },
  { organism_abbrev: 'C_auris_B8441', organism_name: 'Candida auris B8441' },
];

// Combined cell renderer for identifier + description
const CombinedResultRenderer = (props) => {
  const data = props.data;
  if (!data) return '-';

  const displayName = data.highlighted_name || data.name;
  const displayDesc = data.highlighted_description || data.description;
  const id = data.id;
  const organism = data.organism;

  // For locus-related categories, use gene name for the link URL
  // Prefer gene_name (standard name like "HOG1") over name (which may be orf ID like "orf19.8514")
  // This ensures we use "/locus/HOG1" instead of "/locus/orf19.xxx"
  const isLocusCategory = ['genes', 'descriptions', 'paragraphs', 'name_descriptions', 'notes', 'orthologs'].includes(data.category);
  const locusIdentifier = data.gene_name || data.name;
  const link = isLocusCategory && locusIdentifier ? `/locus/${locusIdentifier}` : data.link;

  // For abstracts category (Paper Abstracts):
  // - name = citation text
  // - description = abstract snippet (context around match)
  // - links = citation links from API
  const isAbstracts = data.category === 'abstracts';

  // For paper_titles category (Paper Titles):
  // - name = paper title (with highlighting)
  // - citation = full citation "Author (Year) Title. Journal..."
  // - links = citation links from API
  // - link = link to reference page
  const isPaperTitles = data.category === 'paper_titles';

  const renderNameLink = () => {
    if (!link) {
      return <span className="result-name" dangerouslySetInnerHTML={{ __html: displayName }} />;
    }
    // Use named target so all search result links open in the same tab
    // Only add rel="noopener noreferrer" for external links (internal links don't need it)
    const isExternal = link.startsWith('http');
    return (
      <a
        href={link}
        target="_blank"
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="result-name"
        dangerouslySetInnerHTML={{ __html: displayName }}
      />
    );
  };

  if (isAbstracts) {
    // For abstracts: show citation (name), links below citation, then abstract snippet (description)
    return (
      <div className="combined-result-cell abstracts-cell">
        <div className="result-header">
          {/* Citation text (no link for abstracts - link is null) */}
          <span className="result-citation" dangerouslySetInnerHTML={{ __html: displayName }} />
          {id && <span className="result-id">({id})</span>}
          {organism && <span className="result-organism">{organism}</span>}
        </div>
        {/* Links right below the citation */}
        {data.links && data.links.length > 0 && (
          <CitationLinksBelow links={data.links} className="search-result-links" target="_blank" />
        )}
        {/* Abstract snippet below the links */}
        {displayDesc && (
          <div
            className="result-abstract"
            dangerouslySetInnerHTML={{ __html: displayDesc }}
          />
        )}
      </div>
    );
  }

  if (isPaperTitles) {
    // For paper_titles: show highlighted title prominently, then author/year/journal below
    // highlighted_name = title with <mark> tags for search highlighting
    // citation = "Author (Year) Title. Journal..." format
    // link = reference page URL (e.g., /reference/CAL0000001)
    const highlightedTitle = data.highlighted_name || data.name;
    const citation = data.citation || '';
    const referenceLink = data.link;

    // Extract author/year and journal from citation
    // Pattern: "Author(s) (Year) Title. Journal Volume(Issue):Pages"
    const authorYearMatch = citation.match(/^([^(]+\([0-9]{4}\))/);
    const authorYear = authorYearMatch ? authorYearMatch[1].trim() : '';

    // Extract journal info (everything after title, which ends with a period before journal)
    // The title is in highlighted_name, so look for journal after a period followed by space and capital
    const journalMatch = citation.match(/\.\s+([A-Z][^.]+)$/);
    const journalInfo = journalMatch ? journalMatch[1].trim() : '';

    return (
      <div className="combined-result-cell paper-titles-cell">
        {/* Highlighted title prominently displayed */}
        <div
          className="result-title"
          dangerouslySetInnerHTML={{ __html: highlightedTitle }}
        />
        {/* Author/year linked to CGD Paper + journal info */}
        {authorYear && (
          <div className="result-meta">
            {referenceLink ? (
              <a href={referenceLink} target="_blank" className="author-year-link">
                {authorYear}
              </a>
            ) : (
              <span className="author-year">{authorYear}</span>
            )}
            {journalInfo && <span className="journal-info"> {journalInfo}</span>}
          </div>
        )}
        {/* Links right below */}
        {data.links && data.links.length > 0 && (
          <CitationLinksBelow links={data.links} className="search-result-links" target="_blank" />
        )}
      </div>
    );
  }

  return (
    <div className="combined-result-cell">
      <div className="result-header">
        {renderNameLink()}
        {id && <span className="result-id">({id})</span>}
        {organism && <span className="result-organism">{organism}</span>}
      </div>
      {displayDesc && (
        <div
          className="result-description"
          dangerouslySetInnerHTML={{ __html: displayDesc }}
        />
      )}
    </div>
  );
};

// Category labels for display
const CATEGORY_LABELS = {
  genes: 'Genes / Loci',
  descriptions: 'Locus Descriptions',
  go_terms: 'GO Terms',
  colleagues: 'Colleagues',
  authors: 'Authors',
  pathways: 'Pathways',
  paragraphs: 'Locus Summary Notes',
  abstracts: 'Papers',
  paper_titles: 'Paper Titles',
  name_descriptions: 'Gene Name Descriptions',
  phenotypes: 'Phenotypes',
  notes: 'History Notes',
  external_ids: 'External Database IDs',
  orthologs: 'Orthologs / Best Hits',
  literature_topics: 'Literature Topics',
};

// Get dynamic category label - for orthologs, include the query to clarify context
const getCategoryLabel = (category, query) => {
  if (category === 'orthologs' && query) {
    return `Orthologs of C. albicans ${query}`;
  }
  return CATEGORY_LABELS[category] || category;
};

// Order in which categories are displayed
const CATEGORY_ORDER = [
  'genes', 'descriptions', 'go_terms', 'colleagues', 'authors',
  'pathways', 'paragraphs', 'paper_titles', 'name_descriptions',
  'phenotypes', 'notes', 'external_ids', 'orthologs', 'literature_topics'
];

// Paper search field options (vs category filters)
const PAPER_SEARCH_FIELDS = ['all', 'both', 'title', 'abstract', 'abstracts'];

// Helper to extract year from a paper result
const extractYearFromResult = (r) => {
  if (r.year) return String(r.year);
  const textToSearch = r.citation || r.name || '';
  const yearMatch = textToSearch.match(/\((\d{4})\)/);
  return yearMatch ? yearMatch[1] : null;
};

const TextSearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('query') || '';
  const type = searchParams.get('type') || null; // 'homolog' for ortholog-only search
  const searchFieldParam = searchParams.get('search_field') || 'all';
  const matchMode = searchParams.get('match_mode') || 'all'; // Default to AND

  // Determine if searchField is a category filter or paper search option
  const isCategory = !PAPER_SEARCH_FIELDS.includes(searchFieldParam);
  const categoryFilter = isCategory ? searchFieldParam : null;
  // For paper search field, map 'abstracts' to 'both' (title+abstract)
  const searchField = isCategory ? 'both' : (searchFieldParam === 'abstracts' ? 'both' : searchFieldParam);

  // Initial search results (for category counts)
  const [initialResults, setInitialResults] = useState(null);
  // All results for selected category
  const [categoryResults, setCategoryResults] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Organism filtering state - allOrganisms is the full list, availableOrganisms has results
  const [allOrganisms, setAllOrganisms] = useState([]);
  const [availableOrganisms, setAvailableOrganisms] = useState([]);
  const [selectedOrganism, setSelectedOrganism] = useState(null);
  const [organismCounts, setOrganismCounts] = useState({});
  const [hasApiOrganismCounts, setHasApiOrganismCounts] = useState(false);
  // Aggregated organism counts from genes + orthologs (for sidebar display)
  const [aggregatedOrganismCounts, setAggregatedOrganismCounts] = useState({});

  // Year filtering state (for paper_titles category)
  const [selectedYear, setSelectedYear] = useState(null);
  const [yearCounts, setYearCounts] = useState({});

  // Quick filter state: pending (what user types) vs applied (what filters)
  const [pendingQuickFilter, setPendingQuickFilter] = useState('');
  const [appliedQuickFilter, setAppliedQuickFilter] = useState('');

  const applyFilter = useCallback(() => {
    setAppliedQuickFilter(pendingQuickFilter);
  }, [pendingQuickFilter]);

  const clearFilter = useCallback(() => {
    setPendingQuickFilter('');
    setAppliedQuickFilter('');
  }, []);

  const hasPendingChanges = pendingQuickFilter !== appliedQuickFilter;

  // Fetch all organisms on mount for facet display, merge with defaults
  useEffect(() => {
    const fetchOrganisms = async () => {
      try {
        const data = await searchApi.getOrganisms();
        const apiOrganisms = data.organisms || [];
        // Merge API organisms with defaults, avoiding duplicates
        const existingAbbrevs = new Set(apiOrganisms.map(o => o.organism_abbrev));
        const mergedOrganisms = [
          ...apiOrganisms,
          ...DEFAULT_ORGANISMS.filter(o => !existingAbbrevs.has(o.organism_abbrev))
        ];
        setAllOrganisms(mergedOrganisms);
      } catch (err) {
        console.error('Failed to fetch organisms:', err);
        // Use defaults on error
        setAllOrganisms(DEFAULT_ORGANISMS);
      }
    };
    fetchOrganisms();
  }, []);

  // AG Grid column definitions - single combined column
  const columnDefs = useMemo(() => [
    {
      headerName: selectedCategory ? getCategoryLabel(selectedCategory, query) : 'Results',
      field: 'name',
      cellRenderer: CombinedResultRenderer,
      sortable: true,
      flex: 1,
      wrapText: true,
      autoHeight: true,
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.4', padding: '10px 12px' },
    },
  ], [selectedCategory, query]);

  // AG Grid default column definitions
  const defaultColDef = useMemo(() => ({
    resizable: true,
  }), []);

  // Filter results by applied quick filter text
  const getFilteredResults = useCallback((results) => {
    if (!appliedQuickFilter.trim()) return results;
    const searchLower = appliedQuickFilter.toLowerCase().trim();
    return results.filter((r) => {
      const searchFields = [
        r.name,
        r.description,
        r.id,
        r.organism,
        r.highlighted_name,
        r.highlighted_description,
      ];
      return searchFields.some((field) => field && String(field).toLowerCase().includes(searchLower));
    });
  }, [appliedQuickFilter]);

  // Fetch all results for a category
  const fetchCategoryResults = useCallback(async (category) => {
    if (!query.trim() || !category) return;

    setCategoryLoading(true);
    try {
      const data = await searchApi.textSearchCategory(query, category, searchField, matchMode);
      setCategoryResults(data.results);
      setTotalCount(data.total_count || data.results?.length || 0);
      // Use organism counts from API if provided
      if (data.organism_counts) {
        const organisms = Object.keys(data.organism_counts);
        setOrganismCounts(data.organism_counts);
        setAvailableOrganisms(organisms);
        setHasApiOrganismCounts(true);
        // Validate selectedOrganism against the fresh organism list
        setSelectedOrganism(prev => {
          if (prev !== null && !organisms.includes(prev)) {
            return null;
          }
          return prev;
        });
      } else {
        setHasApiOrganismCounts(false);
      }
    } catch (err) {
      console.error('Category search error:', err);
      setError('Failed to load results. Please try again.');
    } finally {
      setCategoryLoading(false);
    }
  }, [query, searchField, matchMode]);

  // Initial search effect
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setInitialResults(null);
        setSelectedCategory(null);
        setCategoryResults(null);
        setTotalCount(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Perform text search (with type filter and search options)
        const data = await searchApi.textSearch(query, 10, type, searchField, matchMode);
        setInitialResults(data);

        // Calculate aggregated organism counts from genes + orthologs categories
        // This ensures species with orthologs (but no direct gene matches) appear in the filter
        const aggregatedCounts = {};
        const relevantCategories = ['genes', 'orthologs'];
        relevantCategories.forEach(catKey => {
          const categoryData = data.categories?.find(c => c.category === catKey);
          if (categoryData?.results) {
            categoryData.results.forEach(r => {
              if (r.organism) {
                aggregatedCounts[r.organism] = (aggregatedCounts[r.organism] || 0) + 1;
              }
            });
          }
        });
        setAggregatedOrganismCounts(aggregatedCounts);

        // Determine which categories to show
        let categoriesToShow;
        if (type === 'homolog') {
          categoriesToShow = ['orthologs'];
        } else if (categoryFilter) {
          // If a specific category was selected from search page, only show that
          categoriesToShow = [categoryFilter];
        } else {
          categoriesToShow = CATEGORY_ORDER;
        }

        // Auto-select first category with results (or the filtered category)
        const firstCategoryWithResults = categoriesToShow.find(cat => {
          const categoryData = data.categories.find(c => c.category === cat);
          return categoryData && categoryData.count > 0;
        });

        if (firstCategoryWithResults) {
          setSelectedCategory(firstCategoryWithResults);
          // Fetch all results for this category
          await fetchCategoryResults(firstCategoryWithResults);
        } else if (categoryFilter) {
          // Even if no results, select the filtered category
          setSelectedCategory(categoryFilter);
          setCategoryResults([]);
          setTotalCount(0);
        } else {
          setSelectedCategory(null);
          setCategoryResults(null);
          setTotalCount(0);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to perform search. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, type, searchField, matchMode, categoryFilter, navigate, fetchCategoryResults]);

  // Extract organisms and calculate counts when category results change (fallback when API doesn't provide counts)
  useEffect(() => {
    // Skip if API already provided organism counts (validation is handled in fetchCategoryResults)
    if (hasApiOrganismCounts) {
      return;
    }

    if (categoryResults && categoryResults.length > 0) {
      // Calculate counts per organism from current page (fallback)
      const counts = {};
      categoryResults.forEach(r => {
        if (r.organism) {
          counts[r.organism] = (counts[r.organism] || 0) + 1;
        }
      });
      setOrganismCounts(counts);

      const organisms = Object.keys(counts);
      setAvailableOrganisms(organisms);
      // Reset organism selection if the previously selected one is not available
      setSelectedOrganism(prev => {
        if (prev !== null && !organisms.includes(prev)) {
          return null;
        }
        return prev;
      });
    } else {
      setAvailableOrganisms([]);
      setOrganismCounts({});
      setSelectedOrganism(null);
    }
  }, [categoryResults, hasApiOrganismCounts]);

  // Calculate year counts for paper_titles category
  useEffect(() => {
    if (selectedCategory === 'paper_titles' && categoryResults && categoryResults.length > 0) {
      const counts = {};
      categoryResults.forEach(r => {
        const year = extractYearFromResult(r);
        if (year) {
          counts[year] = (counts[year] || 0) + 1;
        }
      });
      setYearCounts(counts);
    } else {
      setYearCounts({});
      setSelectedYear(null);
    }
  }, [categoryResults, selectedCategory]);

  // Handle category change
  const handleCategoryChange = async (category, keepOrganism = false) => {
    if (category === selectedCategory) return;

    setSelectedCategory(category);
    setCategoryResults(null);
    setTotalCount(0);
    // Reset organism and year selection when changing category (unless keepOrganism)
    setAvailableOrganisms([]);
    setOrganismCounts({});
    if (!keepOrganism) {
      setSelectedOrganism(null);
    }
    setHasApiOrganismCounts(false);
    setYearCounts({});
    setSelectedYear(null);
    await fetchCategoryResults(category);
  };

  // Handle organism selection - switch to orthologs category if needed
  const handleOrganismSelect = async (organism) => {
    if (organism === null) {
      setSelectedOrganism(null);
      return;
    }

    // Check if this organism has results in current category
    const hasCurrentCategoryResults = (organismCounts[organism] || 0) > 0;

    if (hasCurrentCategoryResults) {
      // Just select the organism, stay in current category
      setSelectedOrganism(organism);
    } else {
      // Check if organism has results in orthologs category
      const orthologsCategory = initialResults?.categories?.find(c => c.category === 'orthologs');
      const hasOrthologResults = orthologsCategory?.results?.some(r => r.organism === organism);

      if (hasOrthologResults && selectedCategory !== 'orthologs') {
        // Switch to orthologs category and select the organism
        setSelectedOrganism(organism);
        await handleCategoryChange('orthologs', true);
      } else {
        // Just select the organism anyway
        setSelectedOrganism(organism);
      }
    }
  };


  // Render facets (category filters)
  const renderFacets = () => {
    // Get category counts from initial results
    const getCategoryCount = (categoryKey) => {
      if (!initialResults?.categories) return 0;
      const cat = initialResults.categories.find(c => c.category === categoryKey);
      return cat ? cat.count : 0;
    };

    // Filter categories if type=homolog
    const categoriesToShow = type === 'homolog' ? ['orthologs'] : CATEGORY_ORDER;

    // Filter results by selected organism or year for display count
    const results = categoryResults || [];
    const isPaperTitles = selectedCategory === 'paper_titles';
    let filteredResults = results;
    if (isPaperTitles && selectedYear) {
      filteredResults = results.filter(r => extractYearFromResult(r) === selectedYear);
    } else if (selectedOrganism) {
      filteredResults = results.filter(r => r.organism === selectedOrganism);
    }
    const displayCount = (selectedOrganism || selectedYear) ? filteredResults.length : totalCount;

    // Get sorted years (descending - most recent first)
    const sortedYears = Object.keys(yearCounts).sort((a, b) => parseInt(b) - parseInt(a));

    return (
      <div className="text-search-facets">
        {/* Year filter facet - only for paper_titles category */}
        {isPaperTitles && sortedYears.length > 0 && (
          <div className="year-facet">
            <h3>Year</h3>
            <ul className="facet-list">
              <li
                className={`facet-item ${selectedYear === null ? 'selected' : ''}`}
                onClick={() => setSelectedYear(null)}
              >
                <span className="facet-label">All Years</span>
                <span className="facet-count">{totalCount}</span>
              </li>
              {sortedYears.map(year => {
                const count = yearCounts[year] || 0;
                return (
                  <li
                    key={year}
                    className={`facet-item ${selectedYear === year ? 'selected' : ''}`}
                    onClick={() => setSelectedYear(year)}
                  >
                    <span className="facet-label">{year}</span>
                    <span className="facet-count">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Organism filter facet - hide for paper_titles category */}
        {/* Use aggregated counts (genes + orthologs) so species with orthologs appear */}
        {!isPaperTitles && (() => {
          // Merge current category counts with aggregated counts from genes+orthologs
          const mergedCounts = { ...aggregatedOrganismCounts };
          // Also include any organisms from current category that might not be in genes/orthologs
          Object.entries(organismCounts).forEach(([org, count]) => {
            mergedCounts[org] = Math.max(mergedCounts[org] || 0, count);
          });
          const organismsWithResults = Object.keys(mergedCounts).sort();
          const hasAnyOrganisms = organismsWithResults.length > 0 || allOrganisms.length > 0;

          if (!hasAnyOrganisms) return null;

          return (
            <div className="organism-facet">
              <h3>Organism</h3>
              <ul className="facet-list">
                <li
                  className={`facet-item ${selectedOrganism === null ? 'selected' : ''}`}
                  onClick={() => handleOrganismSelect(null)}
                >
                  <span className="facet-label">All Organisms</span>
                  <span className="facet-count">
                    {Object.values(mergedCounts).reduce((sum, count) => sum + count, 0) || totalCount}
                  </span>
                </li>
                {/* Show organisms with results (from merged counts) */}
                {organismsWithResults.map(organism => {
                  const count = mergedCounts[organism] || 0;
                  // Check if this organism has results in the current category
                  const hasCurrentCategoryResults = (organismCounts[organism] || 0) > 0;
                  return (
                    <li
                      key={organism}
                      className={`facet-item ${selectedOrganism === organism ? 'selected' : ''} ${!hasCurrentCategoryResults ? 'other-category' : ''}`}
                      onClick={() => handleOrganismSelect(organism)}
                      title={!hasCurrentCategoryResults ? 'Click to view results in Orthologs / Best Hits' : ''}
                    >
                      <span className="facet-label">{organism}</span>
                      <span className="facet-count">{count}</span>
                    </li>
                  );
                })}
                {/* Show remaining organisms from allOrganisms with 0 count */}
                {allOrganisms
                  .filter(org => !organismsWithResults.includes(org.organism_name))
                  .map(org => (
                    <li
                      key={org.organism_abbrev}
                      className="facet-item zero-count"
                    >
                      <span className="facet-label">{org.organism_name}</span>
                      <span className="facet-count">0</span>
                    </li>
                  ))}
              </ul>
            </div>
          );
        })()}

        <h3>Categories</h3>
        <ul className="facet-list">
          {categoriesToShow.map(categoryKey => {
            // Use totalCount for selected category, otherwise use initial count
            let count;
            if (selectedCategory === categoryKey) {
              count = displayCount;
            } else {
              count = getCategoryCount(categoryKey);
            }
            const isSelected = selectedCategory === categoryKey;
            const hasResults = count > 0 || (isSelected && totalCount > 0);

            return (
              <li
                key={categoryKey}
                className={`facet-item ${isSelected ? 'selected' : ''} ${!hasResults ? 'disabled' : ''}`}
                onClick={() => hasResults && handleCategoryChange(categoryKey)}
              >
                <span className="facet-label">{CATEGORY_LABELS[categoryKey]}</span>
                <span className="facet-count">{count}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // Render main results
  const renderResults = () => {
    if (!selectedCategory) {
      return (
        <div className="text-search-no-selection">
          Select a category to view results.
        </div>
      );
    }

    if (categoryLoading) {
      return (
        <div className="text-search-loading">
          Loading results...
        </div>
      );
    }

    const results = categoryResults || [];
    const isPaperTitles = selectedCategory === 'paper_titles';
    const isOrthologs = selectedCategory === 'orthologs';

    // Filter results by selected year (for paper_titles) or organism (for other categories)
    let facetFiltered = results;
    if (isPaperTitles && selectedYear) {
      facetFiltered = results.filter(r => extractYearFromResult(r) === selectedYear);
    } else if (selectedOrganism) {
      facetFiltered = results.filter(r => r.organism === selectedOrganism);
    }
    // Apply quick filter
    const filteredResults = getFilteredResults(facetFiltered);

    // Special rendering for orthologs with organism filter - show relationship table
    if (isOrthologs && selectedOrganism && facetFiltered.length > 0) {
      // Build relationship table data
      // For each gene in selected organism, show which external orthologs map to it
      const relationshipData = [];

      facetFiltered.forEach(gene => {
        if (gene.related_orthologs && gene.related_orthologs.length > 0) {
          gene.related_orthologs.forEach(ortholog => {
            relationshipData.push({
              ortholog_name: ortholog.name,
              ortholog_source: ortholog.source,
              ortholog_organism: ortholog.organism,
              ortholog_link: ortholog.link,
              cgd_gene_name: gene.gene_name || gene.name,
              cgd_gene_link: gene.link,
              cgd_gene_organism: gene.organism,
            });
          });
        }
      });

      // If we have relationship data, show the relationship table
      if (relationshipData.length > 0) {
        return (
          <div>
            <div className="ortholog-relationship-header">
              <p>
                Your query <strong style={{ color: '#c62828' }}>{query}</strong> matched the following ortholog(s) or Best Hit(s) associated with the following genes in{' '}
                <strong style={{ color: '#1976d2' }}><em>{selectedOrganism.replace('Candida ', 'C. ')}</em></strong>
              </p>
            </div>

            <table className="ortholog-relationship-table">
              <thead>
                <tr>
                  <th>Ortholog or Best Hit to CGD genes</th>
                  <th>CGD Genes</th>
                </tr>
              </thead>
              <tbody>
                {relationshipData.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      {row.ortholog_link ? (
                        <a href={row.ortholog_link} target="_blank" rel="noopener noreferrer">
                          {row.ortholog_name}
                        </a>
                      ) : (
                        <span>{row.ortholog_name}</span>
                      )}
                      {' '}
                      <span className="ortholog-type">
                        ({row.ortholog_source === 'CGOB' || row.ortholog_source === 'Orthologous genes in Candida species' ? 'Ortholog' : `${row.ortholog_source} Ortholog`})
                      </span>
                    </td>
                    <td>
                      <a href={row.cgd_gene_link} target="_blank" rel="noopener noreferrer">
                        {row.cgd_gene_name}
                      </a>
                      {' '}
                      <span className="cgd-gene-organism">
                        ({row.cgd_gene_organism?.replace('Candida ', 'C. ')})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="ortholog-table-footer">
              <p>{relationshipData.length} ortholog relationship(s) found</p>
            </div>
          </div>
        );
      }
    }

    return (
      <div>
        {/* Quick Filter Box */}
        <div className="filter-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 15px', background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '4px', marginBottom: '10px' }}>
          <label htmlFor="quick-filter" style={{ fontWeight: 500, color: '#333', whiteSpace: 'nowrap' }}>Filter results: </label>
          <input
            type="text"
            id="quick-filter"
            value={pendingQuickFilter}
            onChange={(e) => setPendingQuickFilter(e.target.value)}
            placeholder="Type to filter..."
            style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', width: '200px' }}
          />
          <button
            type="button"
            onClick={applyFilter}
            disabled={!hasPendingChanges}
            style={{ padding: '6px 12px', border: 'none', background: hasPendingChanges ? '#1976d2' : '#90caf9', color: 'white', fontWeight: 500, cursor: hasPendingChanges ? 'pointer' : 'not-allowed', borderRadius: '4px', fontSize: '14px' }}
          >
            Apply
          </button>
          {(appliedQuickFilter || pendingQuickFilter) && (
            <button
              type="button"
              onClick={clearFilter}
              title="Clear filter"
              style={{ padding: '4px 8px', border: 'none', background: '#e0e0e0', color: '#666', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', lineHeight: 1 }}
            >
              ×
            </button>
          )}
          {appliedQuickFilter && (
            <span style={{ fontSize: '0.9rem', color: '#555' }}>
              Showing {filteredResults.length} of {facetFiltered.length} results
            </span>
          )}
        </div>

        <div className="ag-grid-wrapper">
          <AgGridReact
            rowData={filteredResults}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            domLayout="autoHeight"
            suppressCellFocus={true}
            enableCellTextSelection={true}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            getRowId={(params) => {
              // For orthologs, include ortholog_display to make row ID unique
              // since multiple orthologs can have the same CGD gene ID
              if (params.data.category === 'orthologs' && params.data.ortholog_display) {
                return `${params.data.category}-${params.data.id}-${params.data.ortholog_display}`;
              }
              return `${params.data.category}-${params.data.id}`;
            }}
          />
        </div>
      </div>
    );
  };

  const totalResults = initialResults?.total_results || 0;
  const searchTypeLabel = type === 'homolog' ? 'Ortholog Search' : 'Text Search';

  return (
    <div className="text-search-results-page">
      <div className="text-search-results-content">
        <h1>{searchTypeLabel} Results</h1>
        <hr />

        {query && (
          <p className="search-query-info">
            Results for: <strong>"{query}"</strong>
            {initialResults && ` - ${totalResults} total results found`}
            {(searchField !== 'all' && searchField !== 'both') || matchMode === 'all' || matchMode === 'exact' ? (
              <span className="search-options-summary">
                {' '}(
                {searchField === 'title' && 'Paper titles only'}
                {searchField === 'abstract' && 'Paper abstracts only'}
                {(searchField === 'title' || searchField === 'abstract') && (matchMode === 'all' || matchMode === 'exact') && ', '}
                {matchMode === 'all' && 'All words'}
                {matchMode === 'exact' && 'Exact phrase'}
                )
              </span>
            ) : null}
          </p>
        )}

        {!query && (
          <div className="text-search-no-results">
            Please enter a search term.
          </div>
        )}

        {loading && (
          <div className="text-search-loading">
            Searching...
          </div>
        )}

        {error && (
          <div className="text-search-error">
            {error}
          </div>
        )}

        {!loading && !error && initialResults && totalResults === 0 && (
          <div className="text-search-no-results">
            No results found for "{query}". Try a different search term.
          </div>
        )}

        {!loading && !error && initialResults && totalResults > 0 && (
          <div className="text-search-layout">
            <aside className="text-search-sidebar">
              {renderFacets()}
            </aside>
            <main className="text-search-main">
              {renderResults()}
            </main>
          </div>
        )}

        <div className="back-to-search">
          <Link to="/search/text">Back to Text Search</Link>
        </div>
      </div>
    </div>
  );
};

export default TextSearchResultsPage;

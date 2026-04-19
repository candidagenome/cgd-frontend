import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import virulenceFactorApi from '../api/virulenceFactorApi';
import './VirulenceFactorBrowserPage.css';

// Category color mapping for visual distinction
const CATEGORY_COLORS = {
  // Adhesion & Biofilm - Blues
  adhesion: 'cat-blue',
  biofilm: 'cat-blue-light',
  biofilm_formation: 'cat-blue-light',
  // Host Interaction - Reds
  host_interaction: 'cat-red',
  immune_evasion: 'cat-red-light',
  // Secreted Enzymes - Greens
  secreted_enzymes: 'cat-green',
  cell_wall: 'cat-green-light',
  // Morphogenesis - Purple
  morphogenesis: 'cat-purple',
  filamentation: 'cat-purple-light',
  // Stress & Drug Resistance - Orange/Pink
  stress_response: 'cat-orange',
  drug_resistance: 'cat-pink',
};

// Get color class for a category
const getCategoryColorClass = (categoryKey) => {
  if (!categoryKey) return 'cat-default';
  // Try exact match first
  if (CATEGORY_COLORS[categoryKey]) {
    return CATEGORY_COLORS[categoryKey];
  }
  // Try lowercase normalized
  const normalized = categoryKey.toLowerCase().replace(/[\s-]/g, '_');
  if (CATEGORY_COLORS[normalized]) {
    return CATEGORY_COLORS[normalized];
  }
  // Default
  return 'cat-default';
};

// Categorize match reason and return type info
const categorizeMatchReason = (reason) => {
  const reasonLower = reason.toLowerCase();
  if (reasonLower.includes('go:') || reasonLower.includes('gene ontology') ||
      reasonLower.includes('biological process') || reasonLower.includes('molecular function') ||
      reasonLower.includes('cellular component')) {
    return { type: 'go', label: 'GO', tooltip: 'Gene Ontology' };
  }
  if (reasonLower.includes('phenotype') || reasonLower.includes('resistance') ||
      reasonLower.includes('sensitivity') || reasonLower.includes('defect') ||
      reasonLower.includes('mutant')) {
    return { type: 'phe', label: 'PHE', tooltip: 'Phenotype' };
  }
  return { type: 'kw', label: 'KW', tooltip: 'Keyword (text-based match)' };
};

// Abbreviate organism name (e.g., "Candida albicans SC5314" -> "C. albicans")
const getOrganismAbbrev = (organismName) => {
  if (!organismName) return '';
  const parts = organismName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}. ${parts[1]}`;
  }
  return organismName;
};

// Format locus display name like "AAF1/C3_06470W_A"
const formatLocusName = (result) => {
  if (result.gene_name && result.gene_name !== result.feature_name) {
    return `${result.gene_name}/${result.feature_name}`;
  }
  return result.feature_name || result.gene_name || '-';
};

// Format ortholog display with short species abbreviation
const formatOrthologDisplay = (orthologs) => {
  if (!orthologs || orthologs.length === 0) return null;

  // Sort by organism_abbrev for consistent display
  const sorted = [...orthologs].sort((a, b) =>
    (a.organism_abbrev || '').localeCompare(b.organism_abbrev || '')
  );

  // Create short species abbreviation (e.g., "Candida auris B8441" -> "C. auris")
  const getShortSpecies = (org) => {
    if (!org.organism_name) return org.organism_abbrev || '';
    const parts = org.organism_name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}. ${parts[1]}`;
    }
    return org.organism_abbrev || org.organism_name;
  };

  // Show first 2 species, then "+N more"
  const displaySpecies = sorted.slice(0, 2).map(getShortSpecies);
  const remaining = sorted.length - 2;

  let text = displaySpecies.join(', ');
  if (remaining > 0) {
    text += `, +${remaining} more`;
  }

  return { text, count: sorted.length };
};

// SearchHighlight component - highlights all occurrences of search term (case-insensitive)
const SearchHighlight = ({ text, searchTerm }) => {
  if (!searchTerm || !text) {
    return <>{text}</>;
  }

  const searchLower = searchTerm.toLowerCase();
  const parts = [];
  let lastIndex = 0;
  let textLower = text.toLowerCase();
  let index = textLower.indexOf(searchLower);

  while (index !== -1) {
    // Add text before the match
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    // Add the highlighted match
    parts.push(
      <mark key={index} className="search-highlight">
        {text.slice(index, index + searchTerm.length)}
      </mark>
    );
    lastIndex = index + searchTerm.length;
    index = textLower.indexOf(searchLower, lastIndex);
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};

function VirulenceFactorBrowserPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Config/metadata state
  const [categories, setCategories] = useState([]);
  const [organisms, setOrganisms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(null);

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedOrganism, setSelectedOrganism] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvidenceTypes, setSelectedEvidenceTypes] = useState([]);

  // Evidence type options
  const EVIDENCE_TYPE_OPTIONS = [
    { key: 'GO', label: 'GO Annotation', description: 'Gene Ontology terms' },
    { key: 'PHE', label: 'Phenotype', description: 'Phenotype and virulence model evidence' },
    { key: 'KW', label: 'Keyword', description: 'Gene pattern, headline, or literature matches' },
  ];

  // Results state
  const [results, setResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);

  // Quick filter state: pending (what user types) vs applied (what filters)
  const [pendingQuickFilter, setPendingQuickFilter] = useState('');
  const [appliedQuickFilter, setAppliedQuickFilter] = useState('');

  // Track which rows have expanded PMID list
  const [expandedPmidRows, setExpandedPmidRows] = useState(new Set());

  // Request counter to handle race conditions - only use response from latest request
  const requestCounterRef = useRef(0);

  const applyQuickFilter = () => {
    setAppliedQuickFilter(pendingQuickFilter);
  };

  const clearQuickFilter = () => {
    setPendingQuickFilter('');
    setAppliedQuickFilter('');
  };

  const hasPendingChanges = pendingQuickFilter !== appliedQuickFilter;

  // Load config (categories and organisms) on mount - only runs once
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const [categoriesData, organismsData] = await Promise.all([
          virulenceFactorApi.getCategories(),
          virulenceFactorApi.getOrganisms(),
        ]);
        setCategories(categoriesData.categories || categoriesData || []);
        setOrganisms(organismsData || []);

        // Parse URL params for initial state (only on mount)
        const params = new URLSearchParams(window.location.search);
        const urlCategories = params.getAll('categories');
        const urlOrganism = params.get('organism') || '';
        const urlSearch = params.get('search') || '';

        if (urlCategories.length > 0) {
          setSelectedCategories(urlCategories);
        }
        if (urlOrganism) {
          setSelectedOrganism(urlOrganism);
        }
        if (urlSearch) {
          setSearchTerm(urlSearch);
        }
      } catch (err) {
        console.error('Failed to fetch config:', err);
        setConfigError('Failed to load virulence categories');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update URL params when filters change
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    selectedCategories.forEach((cat) => params.append('categories', cat));
    if (selectedOrganism) params.set('organism', selectedOrganism);
    if (searchTerm) params.set('search', searchTerm);
    setSearchParams(params, { replace: true });
  }, [selectedCategories, selectedOrganism, searchTerm, setSearchParams]);

  useEffect(() => {
    const timeoutId = setTimeout(updateUrlParams, 300);
    return () => clearTimeout(timeoutId);
  }, [updateUrlParams]);

  // Fetch results when filters change
  const fetchResults = useCallback(async () => {
    // Don't fetch if no categories selected and no search term
    if (selectedCategories.length === 0 && !searchTerm.trim()) {
      setResults(null);
      return;
    }

    // Increment request counter to track this request
    requestCounterRef.current += 1;
    const thisRequestId = requestCounterRef.current;

    setResultsLoading(true);
    setResultsError(null);

    try {
      const params = {
        categories: selectedCategories,
        organisms: selectedOrganism ? [selectedOrganism] : [],
        search_term: searchTerm.trim() || undefined,
        evidence_types: selectedEvidenceTypes.length > 0 ? selectedEvidenceTypes : undefined,
        page: 1,
        page_size: 5000, // Get all results for client-side filtering
      };

      const data = await virulenceFactorApi.getFactors(params);

      // Only update state if this is still the latest request
      if (thisRequestId === requestCounterRef.current) {
        setResults(data);
      }
    } catch (err) {
      // Only update error state if this is still the latest request
      if (thisRequestId === requestCounterRef.current) {
        console.error('Failed to fetch virulence factors:', err);
        // Handle Pydantic validation errors (detail can be array of objects)
        let errorMsg = 'Search failed';
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          errorMsg = detail.map((e) => e.msg || JSON.stringify(e)).join('; ');
        } else if (err.message) {
          errorMsg = err.message;
        }
        setResultsError(errorMsg);
      }
    } finally {
      // Only clear loading if this is still the latest request
      if (thisRequestId === requestCounterRef.current) {
        setResultsLoading(false);
      }
    }
  }, [selectedCategories, selectedOrganism, searchTerm, selectedEvidenceTypes]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(fetchResults, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchResults]);

  // Handle category checkbox change
  const handleCategoryChange = (categoryKey, checked) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, categoryKey]);
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== categoryKey));
    }
  };

  // Select all / clear all categories
  const selectAllCategories = () => {
    setSelectedCategories(categories.map((c) => c.key));
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  // Handle evidence type checkbox change
  const handleEvidenceTypeChange = (typeKey, checked) => {
    if (checked) {
      setSelectedEvidenceTypes((prev) => [...prev, typeKey]);
    } else {
      setSelectedEvidenceTypes((prev) => prev.filter((t) => t !== typeKey));
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedOrganism('');
    setSearchTerm('');
    setSelectedEvidenceTypes([]);
    setPendingQuickFilter('');
    setAppliedQuickFilter('');
  };

  // Client-side download
  const handleClientDownload = (format = 'csv') => {
    if (!filteredResults || filteredResults.length === 0) return;

    const headers = [
      'Gene Name',
      'Systematic Name',
      'Organism',
      'Categories',
      'Matched By',
      'Description',
    ];

    const rows = filteredResults.map((item) => [
      item.gene_name || '',
      item.feature_name || '',
      getOrganismAbbrev(item.organism),
      (item.categories || []).join('; '),
      (item.match_reasons || []).join('; '),
      item.description || '',
    ]);

    const separator = format === 'csv' ? ',' : '\t';
    const escapeField = (val) => {
      const str = String(val || '');
      if (format === 'csv' && (str.includes(',') || str.includes('"') || str.includes('\n'))) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const content = [
      headers.map(escapeField).join(separator),
      ...rows.map((row) => row.map(escapeField).join(separator)),
    ].join('\n');

    const mimeType = format === 'csv' ? 'text/csv' : 'text/tab-separated-values';
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `virulence_factors.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter results by quick filter text
  const filteredResults = useMemo(() => {
    if (!results?.items) return [];
    let items = results.items;

    if (appliedQuickFilter.trim()) {
      const searchLower = appliedQuickFilter.toLowerCase().trim();
      items = items.filter((item) => {
        const searchFields = [
          item.gene_name,
          item.feature_name,
          item.organism,
          item.description,
          ...(item.categories || []),
          ...(item.match_reasons || []),
        ];
        return searchFields.some((field) => field && String(field).toLowerCase().includes(searchLower));
      });
    }

    return items;
  }, [results?.items, appliedQuickFilter]);

  // Compute tier counts for results summary
  const tierCounts = useMemo(() => {
    if (!filteredResults || filteredResults.length === 0) {
      return { total: 0, withExperimental: 0, withGO: 0, validatedInVivo: 0 };
    }

    let withExperimental = 0;
    let withGO = 0;
    let validatedInVivo = 0;

    filteredResults.forEach((item) => {
      const directEvidence = item.direct_evidence || [];
      const indirectEvidence = item.indirect_evidence || [];
      const allEvidence = [...directEvidence, ...indirectEvidence];

      // Count genes with experimental evidence (virulence model or phenotype)
      const hasExperimental = allEvidence.some((e) => {
        const eLower = e.toLowerCase();
        return eLower.startsWith('virulence model:') || eLower.startsWith('phenotype:');
      });

      // Count genes with GO annotations (in either direct or indirect)
      const hasGO = allEvidence.some((e) => {
        const eLower = e.toLowerCase();
        return eLower.startsWith('go:');
      });

      if (hasExperimental) {
        withExperimental++;
      }
      if (hasGO) {
        withGO++;
      }

      // Count genes validated in vivo (high importance = virulence model evidence)
      if (item.importance_level === 'high') {
        validatedInVivo++;
      }
    });

    return {
      total: filteredResults.length,
      withExperimental,
      withGO,
      validatedInVivo,
    };
  }, [filteredResults]);

  // AG Grid column definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Gene',
        field: 'gene',
        flex: 1.4,
        minWidth: 280,
        autoHeight: true,
        wrapText: true,
        valueGetter: (params) => formatLocusName(params.data),
        cellRenderer: (params) => {
          const importanceLevel = params.data.importance_level || 'low';
          const importanceLabel = params.data.importance_label || '';
          // Short text badge based on importance level
          const badgeText = importanceLevel === 'high' ? 'In vivo' : importanceLevel === 'medium' ? 'Multi-study' : '';

          return (
            <div className="gene-card">
              <div className="gene-card-header">
                <Link to={`/locus/${params.data.feature_name || params.data.gene_name}`} className="gene-link">
                  {formatLocusName(params.data)}
                </Link>
                {badgeText && (
                  <span
                    className={`importance-badge importance-${importanceLevel}`}
                    title={importanceLabel}
                  >
                    {badgeText}
                  </span>
                )}
                {params.data.alphafold_url && (
                  <a
                    href={params.data.alphafold_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="alphafold-link"
                    title={`View predicted structure (UniProt: ${params.data.uniprot_id})`}
                  >
                    🔬
                  </a>
                )}
              </div>
              {params.data.summary && (
                <div className="gene-summary">
                  {params.data.summary}
                </div>
              )}
              {params.data.orthologs && params.data.orthologs.length > 0 && (
                <div className="gene-orthologs">
                  <span className="orthologs-label">Orthologs:</span>{' '}
                  <span className="orthologs-species">
                    {formatOrthologDisplay(params.data.orthologs)?.text}
                  </span>
                  <a
                    href={`/synteny-viewer?gene=${params.data.feature_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="synteny-link"
                    title={`View ${params.data.orthologs.length} orthologs in synteny viewer`}
                  >
                    View in synteny viewer →
                  </a>
                </div>
              )}
            </div>
          );
        },
      },
      {
        headerName: 'Organism',
        field: 'organism',
        flex: 0.6,
        minWidth: 100,
        valueGetter: (params) => getOrganismAbbrev(params.data.organism),
        cellRenderer: (params) => <em>{getOrganismAbbrev(params.data.organism)}</em>,
      },
      {
        headerName: 'Categories',
        field: 'categories',
        flex: 1,
        minWidth: 150,
        wrapText: true,
        cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
        valueGetter: (params) => (params.data.categories || []).join(', '),
        cellRenderer: (params) => {
          const cats = params.data.categories || [];
          if (cats.length === 0) return '-';
          return (
            <div className="categories-cell">
              {cats.map((cat, idx) => {
                // Find the category key for this display name
                const catObj = categories.find(
                  (c) => c.name === cat || c.key === cat
                );
                const catKey = catObj?.key || cat.toLowerCase().replace(/[\s-]/g, '_');
                return (
                  <span key={idx} className={`category-tag ${getCategoryColorClass(catKey)}`}>
                    {cat}
                  </span>
                );
              })}
            </div>
          );
        },
      },
      {
        headerName: 'Confidence',
        field: 'confidence_tier',
        flex: 0.5,
        minWidth: 90,
        cellRenderer: (params) => {
          const tier = params.data.confidence_tier || 'Low';
          const score = params.data.confidence_score || 0;
          const tierClass = tier.toLowerCase();
          const breakdown = params.data.evidence_breakdown || {};

          // Build detailed tooltip from evidence breakdown
          const breakdownParts = [];
          if (breakdown.virulence_models > 0) {
            breakdownParts.push(`Virulence models: ${breakdown.virulence_models}`);
          }
          if (breakdown.go_annotations > 0) {
            breakdownParts.push(`GO annotations: ${breakdown.go_annotations}`);
          }
          if (breakdown.phenotypes > 0) {
            breakdownParts.push(`Phenotypes: ${breakdown.phenotypes}`);
          }
          if (breakdown.keyword_matches > 0) {
            breakdownParts.push(`Keyword matches: ${breakdown.keyword_matches}`);
          }
          if (breakdown.papers > 0) {
            breakdownParts.push(`Papers: ${breakdown.papers}`);
          }

          const tooltipText = breakdownParts.length > 0
            ? `Score: ${score}/20\n${breakdownParts.join('\n')}`
            : `Score: ${score}/20`;

          return (
            <span
              className={`confidence-badge confidence-${tierClass}`}
              title={tooltipText}
            >
              {tier}
            </span>
          );
        },
      },
      {
        headerName: 'Evidence',
        field: 'direct_evidence',
        flex: 1.7,
        minWidth: 270,
        wrapText: true,
        cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
        valueGetter: (params) => {
          const direct = params.data.direct_evidence || [];
          const indirect = params.data.indirect_evidence || [];
          return [...direct, ...indirect].join('; ');
        },
        cellRenderer: (params) => {
          const directEvidence = params.data.direct_evidence || [];
          const indirectEvidence = params.data.indirect_evidence || [];

          if (directEvidence.length === 0 && indirectEvidence.length === 0) {
            return '-';
          }

          return (
            <div className="evidence-split-cell">
              {directEvidence.length > 0 && (
                <div className="evidence-group evidence-direct">
                  <span className="evidence-group-label" title="Direct virulence evidence">Direct</span>
                  {directEvidence.map((reason, idx) => {
                    const { type, label, tooltip } = categorizeMatchReason(reason);
                    return (
                      <div key={`d-${idx}`} className={`match-reason match-reason-${type}`}>
                        <span className={`match-type-badge badge-${type}`} title={tooltip}>{label}</span>
                        <span className="match-reason-text">{reason}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {indirectEvidence.length > 0 && (
                <div className="evidence-group evidence-indirect">
                  <span className="evidence-group-label" title="Indirect/supporting evidence">Indirect</span>
                  {indirectEvidence.map((reason, idx) => {
                    const { type, label, tooltip } = categorizeMatchReason(reason);
                    return (
                      <div key={`i-${idx}`} className={`match-reason match-reason-${type}`}>
                        <span className={`match-type-badge badge-${type}`} title={tooltip}>{label}</span>
                        <span className="match-reason-text">{reason}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        },
      },
      {
        headerName: 'Papers',
        field: 'paper_count',
        flex: 0.7,
        minWidth: 120,
        cellRenderer: (params) => {
          const count = params.data.paper_count || 0;
          const pmids = params.data.pmids || [];
          const rowId = params.data.feature_no;
          const isExpanded = expandedPmidRows.has(rowId);

          if (count === 0) return '-';

          // Show 3 by default, all available when expanded
          const visiblePmids = isExpanded ? pmids : pmids.slice(0, 3);
          // Calculate how many more PMIDs we can show (not total papers)
          const moreAvailable = pmids.length - 3;

          const toggleExpand = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpandedPmidRows(prev => {
              const newSet = new Set(prev);
              if (newSet.has(rowId)) {
                newSet.delete(rowId);
              } else {
                newSet.add(rowId);
              }
              return newSet;
            });
          };

          return (
            <div className="papers-cell">
              <div className="papers-header">
                <span className="paper-count">{count}</span>
                {isExpanded && pmids.length > 3 && (
                  <span
                    className="pmid-more-btn"
                    onClick={toggleExpand}
                    title="Show less"
                  >
                    show less
                  </span>
                )}
              </div>
              {pmids.length > 0 && (
                <div className="pmid-links">
                  {visiblePmids.map((pmid) => (
                    <a
                      key={pmid}
                      href={`/reference/${pmid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pmid-link"
                      title={`View reference for PMID: ${pmid}`}
                    >
                      PMID:{pmid}
                    </a>
                  ))}
                  {!isExpanded && moreAvailable > 0 && (
                    <span
                      className="pmid-more-btn"
                      onClick={toggleExpand}
                      title={`Show ${moreAvailable} more PMIDs`}
                    >
                      +{moreAvailable} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [categories, searchTerm, appliedQuickFilter, expandedPmidRows]
  );

  // Default column properties
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
    }),
    []
  );

  // Calculate row height based on content
  const getRowHeight = useCallback((params) => {
    const minHeight = 150;
    const lineHeight = 22;

    const categories = params.data.categories || [];
    const directEvidence = params.data.direct_evidence || [];
    const indirectEvidence = params.data.indirect_evidence || [];
    const description = params.data.description || '';

    // Calculate lines needed for each column
    const categoryLines = Math.max(1, categories.length);
    // Evidence column has DIRECT + INDIRECT sections with labels
    const evidenceLines = (directEvidence.length + indirectEvidence.length) * 1.8 + 2;
    const descLines = Math.ceil(description.length / 50); // ~50 chars per line

    const maxLines = Math.max(5, categoryLines, evidenceLines, descLines);
    return Math.max(minHeight, maxLines * lineHeight + 30);
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className="virulence-factor-browser-page">
        <header className="page-header">
          <h1>Virulence Factor Browser</h1>
          <hr />
        </header>
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading virulence categories...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (configError) {
    return (
      <div className="virulence-factor-browser-page">
        <header className="page-header">
          <h1>Virulence Factor Browser</h1>
          <hr />
        </header>
        <div className="error-section">
          <div className="error-icon">&#9888;</div>
          <p className="error-message">{configError}</p>
        </div>
      </div>
    );
  }

  const hasFilters = selectedCategories.length > 0 || selectedOrganism || searchTerm || selectedEvidenceTypes.length > 0;
  const hasResults = results?.items && results.items.length > 0;

  return (
    <div className="virulence-factor-browser-page">
      <header className="page-header">
        <h1>Virulence Factor Browser</h1>
        <hr />
        <p className="subtitle">
          Searchable catalog of Candida virulence-related genes including adhesins, secreted enzymes,
          morphogenesis genes, host interaction factors, biofilm-related genes, and immune evasion genes.
        </p>
      </header>

      <div className="browser-layout">
        {/* Filter Sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-section">
            <h3>Virulence Categories</h3>
            <div className="category-actions">
              <button type="button" onClick={selectAllCategories} className="action-link">
                Select All
              </button>
              <span className="separator">|</span>
              <button type="button" onClick={clearAllCategories} className="action-link">
                Clear All
              </button>
            </div>
            <div className="category-list">
              {categories.map((category) => (
                <label key={category.key} className="category-item">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.key)}
                    onChange={(e) => handleCategoryChange(category.key, e.target.checked)}
                  />
                  <span className="category-name">{category.name}</span>
                  <span className="category-count">({category.count || 0})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Organism</h3>
            <select
              value={selectedOrganism}
              onChange={(e) => setSelectedOrganism(e.target.value)}
              className="organism-dropdown"
            >
              <option value="">All Organisms</option>
              {organisms.map((org) => (
                <option key={org.organism_abbrev || org.name} value={org.organism_abbrev || org.name}>
                  {org.name || org.organism_abbrev}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <h3>Search</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Gene name or keyword..."
              className="search-input"
            />
          </div>

          <div className="filter-section">
            <h3>Evidence Type</h3>
            <div className="evidence-type-list">
              {EVIDENCE_TYPE_OPTIONS.map((et) => (
                <label key={et.key} className="evidence-type-item" title={et.description}>
                  <input
                    type="checkbox"
                    checked={selectedEvidenceTypes.includes(et.key)}
                    onChange={(e) => handleEvidenceTypeChange(et.key, e.target.checked)}
                  />
                  <span className={`evidence-badge badge-${et.key.toLowerCase()}`}>{et.key}</span>
                  <span className="evidence-label">{et.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-actions">
            <button
              type="button"
              onClick={clearAllFilters}
              className="btn-clear"
              disabled={!hasFilters}
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* Results Panel */}
        <main className="results-panel">
          {/* Active filters chips */}
          {hasFilters && (
            <div className="active-filters">
              <span className="filters-label">Active Filters:</span>
              {selectedCategories.map((catKey) => {
                const cat = categories.find((c) => c.key === catKey);
                return (
                  <span key={catKey} className="filter-chip">
                    {cat?.name || catKey}
                    <button
                      type="button"
                      onClick={() => handleCategoryChange(catKey, false)}
                      className="chip-remove"
                    >
                      &times;
                    </button>
                  </span>
                );
              })}
              {selectedOrganism && (
                <span className="filter-chip">
                  Organism: {selectedOrganism}
                  <button
                    type="button"
                    onClick={() => setSelectedOrganism('')}
                    className="chip-remove"
                  >
                    &times;
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="filter-chip">
                  Search: &quot;{searchTerm}&quot;
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="chip-remove"
                  >
                    &times;
                  </button>
                </span>
              )}
              {selectedEvidenceTypes.map((et) => (
                <span key={et} className="filter-chip">
                  Evidence: {et}
                  <button
                    type="button"
                    onClick={() => handleEvidenceTypeChange(et, false)}
                    className="chip-remove"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Loading state */}
          {resultsLoading && (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>Searching virulence factors...</p>
            </div>
          )}

          {/* Error state */}
          {resultsError && (
            <div className="error-section">
              <div className="error-icon">&#9888;</div>
              <p className="error-message">{resultsError}</p>
            </div>
          )}

          {/* No filters selected */}
          {!resultsLoading && !resultsError && !hasFilters && (
            <div className="empty-state">
              <p>Select one or more virulence categories to browse genes.</p>
              <p>You can also search by gene name or keyword.</p>
            </div>
          )}

          {/* No results */}
          {!resultsLoading && !resultsError && hasFilters && !hasResults && (
            <div className="no-results">
              <p>No virulence factors found matching your criteria.</p>
              <p>Try selecting different categories or broadening your search.</p>
            </div>
          )}

          {/* Results */}
          {!resultsLoading && !resultsError && hasResults && (
            <>
              <div className="results-summary">
                <div className="results-summary-left">
                  <div className="results-count">
                    Found <strong>{tierCounts.total}</strong> virulence-related gene{tierCounts.total !== 1 ? 's' : ''}
                  </div>
                  <div className="results-tiers">
                    {tierCounts.withExperimental > 0 && (
                      <span className="tier-item tier-experimental">
                        <strong>{tierCounts.withExperimental}</strong> with experimental phenotype evidence
                        {tierCounts.validatedInVivo > 0 && (
                          <span className="tier-sub">
                            ({tierCounts.validatedInVivo} in vivo)
                          </span>
                        )}
                      </span>
                    )}
                    {tierCounts.withGO > 0 && (
                      <span className="tier-item tier-go">
                        <strong>{tierCounts.withGO}</strong> supported by GO annotations
                      </span>
                    )}
                  </div>
                </div>
                <div className="results-summary-right">
                  <button
                    type="button"
                    className="btn-download"
                    onClick={() => handleClientDownload('csv')}
                  >
                    Download CSV
                  </button>
                  <button
                    type="button"
                    className="btn-download"
                    onClick={() => handleClientDownload('tsv')}
                  >
                    Download TSV
                  </button>
                </div>
              </div>

              {/* Quick filter */}
              <div className="filter-controls" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div className="filter-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor="quick-filter">Filter results: </label>
                  <input
                    type="text"
                    id="quick-filter"
                    value={pendingQuickFilter}
                    onChange={(e) => setPendingQuickFilter(e.target.value)}
                    placeholder="Type to filter..."
                    className="quick-filter-input"
                  />
                  <button
                    type="button"
                    className="apply-filter-btn"
                    onClick={applyQuickFilter}
                    disabled={!hasPendingChanges}
                  >
                    Apply
                  </button>
                  {(appliedQuickFilter || pendingQuickFilter) && (
                    <button
                      type="button"
                      className="clear-filter-btn"
                      onClick={clearQuickFilter}
                      title="Clear filter"
                    >
                      &times;
                    </button>
                  )}
                </div>

                {appliedQuickFilter && (
                  <div className="filter-status">
                    Showing {filteredResults.length} of {results.items.length} results
                    <span className="filter-tag">Filter: &quot;{appliedQuickFilter}&quot;</span>
                  </div>
                )}
              </div>

              {/* Results table */}
              <div className="results-grid-wrapper ag-theme-alpine" style={{ width: '100%' }}>
                <AgGridReact
                  rowData={filteredResults}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  domLayout="autoHeight"
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 25, 50, 100]}
                  suppressCellFocus={true}
                  getRowHeight={getRowHeight}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default VirulenceFactorBrowserPage;

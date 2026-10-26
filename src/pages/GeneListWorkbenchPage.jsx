import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { goTermFinderApi } from '../api/goTermFinderApi';
import { phenotypeEnrichmentApi } from '../api/phenotypeEnrichmentApi';
import { expressionApi } from '../api/expressionApi';
import { orthologApi } from '../api/orthologApi';
import batchDownloadApi from '../api/batchDownloadApi';
import goApi from '../api/goApi';
import { phenotypeApi } from '../api/phenotypeApi';
import { searchApi } from '../api/searchApi';
import EnrichmentResultsPanel from '../components/locus/EnrichmentResultsPanel';
import MultiGeneHeatmap from '../components/locus/MultiGeneHeatmap';
import '../components/locus/LocusComponents.css';
import './GeneListWorkbenchPage.css';

// Each analysis API identifies organisms differently, so keep one row per
// species with every identifier the workbench needs.
const ORGANISMS = [
  { no: 3, name: 'Candida albicans SC5314', abbrev: 'C_albicans_SC5314', orthologId: 'C_albicans_SC5314' },
  { no: 11, name: 'Candida auris B8441', abbrev: 'C_auris_B8441', orthologId: 'C_auris_B8441' },
  { no: 9, name: 'Candida dubliniensis CD36', abbrev: 'C_dubliniensis_CD36', orthologId: 'C_dubliniensis_CD36' },
  { no: 5, name: 'Candida glabrata CBS138', abbrev: 'C_glabrata_CBS138', orthologId: 'C_glabrata_CBS138' },
  { no: 7, name: 'Candida parapsilosis CDC317', abbrev: 'C_parapsilosis_CDC317', orthologId: 'C_parapsilosis_CDC317' },
  { no: 12, name: 'Candida tropicalis MYA-3404', abbrev: 'C_tropicalis', orthologId: 'C_tropicalis_MYA3404' },
];

const SCER_TARGET = { orthologId: 'S_cerevisiae', name: 'Saccharomyces cerevisiae' };

// The batch expression endpoint accepts at most 50 genes per request
const MAX_HEATMAP_GENES = 50;
// The matrix download is served from a precomputed matrix (endpoint max
// 10000); if that is out of date the server reads live and allows 200
const MAX_MATRIX_GENES = 10000;

const ENRICHMENT_PARAMS = {
  p_value_cutoff: 0.05,
  correction_method: 'bh',
  min_genes_in_term: 2,
};

const TABS = [
  { key: 'go', label: 'GO Enrichment' },
  { key: 'phenotype', label: 'Phenotype Enrichment' },
  { key: 'expression', label: 'Expression' },
  { key: 'orthologs', label: 'Orthologs' },
  { key: 'download', label: 'Download' },
];

const DOWNLOAD_TYPES = [
  { value: 'coords', label: 'Chromosomal coordinates (TSV)' },
  { value: 'genomic', label: 'Genomic DNA (FASTA)' },
  { value: 'coding', label: 'Coding sequence (FASTA)' },
  { value: 'protein', label: 'Protein sequence (FASTA)' },
  { value: 'go', label: 'GO annotations (GAF)' },
  { value: 'phenotype', label: 'Phenotype data (TSV)' },
  { value: 'ortholog', label: 'Ortholog data (TSV)' },
];

const EXAMPLE_GENES = 'ALS3\nHWP1\nECE1\nSAP5\nHYR1\nIHD1\nRBT1\nRBT4\nEFG1\nUME6\nBRG1\nTEC1\nNRG1\nHGC1';

const EMPTY_RESULT = { loading: false, data: null, error: null };

const GOID_PATTERN = /^GO:\d{7}$/i;

// Phenotype qualifiers (CV 'qualifier'); '' = any except "normal" results,
// ANY_QUALIFIER = every annotation including "normal"
const ANY_QUALIFIER = '__any__';
const PHENOTYPE_QUALIFIERS = [
  'decreased', 'increased', 'abnormal', 'absent', 'decreased rate', 'increased rate',
  'delayed', 'arrested', 'premature', 'decreased duration', 'increased duration', 'normal',
];

// Observable tree -> select options, indented by depth, without the root
const flattenObservables = (nodes, depth = 0, out = []) => {
  nodes.forEach(node => {
    if (node.term !== 'observable') out.push({ term: node.term, depth, count: node.count });
    flattenObservables(node.children || [], node.term === 'observable' ? depth : depth + 1, out);
  });
  return out;
};

// Split on whitespace, commas and semicolons; keep first-seen order, drop
// case-insensitive duplicates
const parseGeneList = (text) => {
  const seen = new Set();
  return text
    .split(/[\s,;]+/)
    .map(g => g.trim())
    .filter(g => {
      if (!g) return false;
      const key = g.toUpperCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const errorMessage = (err, fallback) =>
  err.response?.data?.detail || err.message || fallback;

// Blob downloads return their JSON error body as a Blob
const blobErrorMessage = async (err, fallback) => {
  const data = err.response?.data;
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text()).detail || fallback;
    } catch {
      return fallback;
    }
  }
  return errorMessage(err, fallback);
};

const saveBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const filenameFromResponse = (response, fallback) => {
  const contentDisposition = response.headers?.['content-disposition'];
  const match = contentDisposition?.match(/filename="?([^";]+)"?/);
  return match ? match[1] : fallback;
};

const GeneListWorkbenchPage = () => {
  const [searchParams] = useSearchParams();

  const [inputText, setInputText] = useState(() =>
    parseGeneList(searchParams.get('genes') || '').join('\n'));
  const [organismNo, setOrganismNo] = useState(() => {
    const no = parseInt(searchParams.get('organism'), 10);
    return ORGANISMS.some(o => o.no === no) ? no : 3;
  });

  // The analyzed list: validated genes + the organism they were validated in
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [geneSet, setGeneSet] = useState(null);

  const [activeTab, setActiveTab] = useState('go');
  const [goResult, setGoResult] = useState(EMPTY_RESULT);
  const [phenoResult, setPhenoResult] = useState(EMPTY_RESULT);
  const [exprResult, setExprResult] = useState(EMPTY_RESULT);
  const [matrixDownloading, setMatrixDownloading] = useState(false);
  const [orthoResult, setOrthoResult] = useState(EMPTY_RESULT);

  const [downloadTypes, setDownloadTypes] = useState(['coords', 'protein']);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  // Build the list from a GO term (and its descendants) instead of pasting
  const goParam = searchParams.get('go');
  const phenotypeParam = searchParams.get('phenotype');
  const [inputMode, setInputMode] = useState(goParam ? 'go' : phenotypeParam ? 'phenotype' : 'paste');
  const [goQuery, setGoQuery] = useState(goParam || '');
  const [goSuggestions, setGoSuggestions] = useState([]);
  const [goTerm, setGoTerm] = useState(goParam ? { id: goParam.toUpperCase(), name: '' } : null);
  const [includeDescendants, setIncludeDescendants] = useState(searchParams.get('descendants') !== '0');
  const [includeComputational, setIncludeComputational] = useState(true);
  const [goLoading, setGoLoading] = useState(false);
  const autoLoaded = useRef(false);

  // ... or from a phenotype (observable) term and its descendants
  const [observableOptions, setObservableOptions] = useState(null);
  const [phenoTerm, setPhenoTerm] = useState(phenotypeParam || '');
  const [phenoDescendants, setPhenoDescendants] = useState(searchParams.get('descendants') !== '0');
  const [phenoQualifier, setPhenoQualifier] = useState(searchParams.get('qualifier') || '');

  const inputGenes = useMemo(() => parseGeneList(inputText), [inputText]);

  const organism = geneSet ? ORGANISMS.find(o => o.no === geneSet.organismNo) : null;
  // Systematic names are unambiguous across every downstream API
  const geneNames = useMemo(
    () => (geneSet ? geneSet.found.map(g => g.systematic_name) : []),
    [geneSet]
  );

  const orthologTargets = useMemo(() => {
    if (!organism) return [];
    return [...ORGANISMS.filter(o => o.no !== organism.no), SCER_TARGET];
  }, [organism]);

  const analyzeGenes = async (genes, source = null) => {
    if (genes.length === 0) {
      setValidationError('Please enter at least one gene.');
      return;
    }
    setValidating(true);
    setValidationError(null);
    try {
      const result = await goTermFinderApi.validateGenes(genes, organismNo);
      setGoResult(EMPTY_RESULT);
      setPhenoResult(EMPTY_RESULT);
      setExprResult(EMPTY_RESULT);
      setOrthoResult(EMPTY_RESULT);
      setDownloadError(null);
      if (result.found.length === 0) {
        setGeneSet(null);
        const orgName = ORGANISMS.find(o => o.no === organismNo)?.name;
        setValidationError(`None of the ${genes.length} genes were found in ${orgName}. `
          + 'Check the organism selection.');
        return;
      }
      // A gene entered under two names (e.g. ACT1 and C1_13700W_A) counts once
      const seenFeatures = new Set();
      const found = result.found.filter(g => {
        if (seenFeatures.has(g.feature_no)) return false;
        seenFeatures.add(g.feature_no);
        return true;
      });
      setGeneSet({ organismNo, found, notFound: result.not_found, submitted: genes.length, source });
      setActiveTab('go');
    } catch (err) {
      setValidationError(errorMessage(err, 'Gene validation failed.'));
    } finally {
      setValidating(false);
    }
  };

  const handleAnalyze = () => analyzeGenes(inputGenes);

  // Fetch the term's genes in the selected organism, show them in the paste
  // box (so the list can be edited and re-run), and analyze them
  const loadGoTermGenes = async (term) => {
    setGoLoading(true);
    setValidationError(null);
    try {
      const data = await goApi.getGoTermGenes(term.id, organismNo, { includeDescendants, includeComputational });
      const label = `${data.go_term} (${data.goid})`;
      setGoTerm({ id: data.goid, name: data.go_term });
      setGoQuery(label);
      if (data.genes.length === 0) {
        const orgName = ORGANISMS.find(o => o.no === organismNo)?.name;
        setValidationError(`No ${orgName} genes are annotated to ${label}`
          + `${includeDescendants ? ' or its descendants' : ''}.`);
        return;
      }
      const names = data.genes.map(g => g.feature_name);
      setInputText(names.join('\n'));
      await analyzeGenes(names, {
        label,
        relation: 'annotated to',
        url: `/go/${data.goid}`,
        includeDescendants: data.include_descendants,
        termCount: data.term_count,
      });
    } catch (err) {
      setValidationError(errorMessage(err, 'Loading genes for the GO term failed.'));
    } finally {
      setGoLoading(false);
    }
  };

  const loadPhenotypeGenes = async (term) => {
    setGoLoading(true);
    setValidationError(null);
    try {
      const data = await phenotypeApi.getObservableGenes(term, organismNo, {
        includeDescendants: phenoDescendants,
        qualifier: phenoQualifier && phenoQualifier !== ANY_QUALIFIER ? phenoQualifier : null,
        includeNormal: phenoQualifier === ANY_QUALIFIER,
      });
      const label = data.apo_id ? `${data.term} (${data.apo_id})` : data.term;
      if (data.genes.length === 0) {
        const orgName = ORGANISMS.find(o => o.no === organismNo)?.name;
        setValidationError(`No ${orgName} genes have the phenotype ${label}`
          + `${phenoDescendants ? ' or its descendants' : ''}`
          + `${data.qualifier ? ` with qualifier "${data.qualifier}"` : ''}.`);
        return;
      }
      const names = data.genes.map(g => g.feature_name);
      setInputText(names.join('\n'));
      await analyzeGenes(names, {
        label,
        relation: 'with the phenotype',
        url: `/phenotype/search?observable=${encodeURIComponent(data.term)}`,
        includeDescendants: data.include_descendants,
        termCount: data.term_count,
        qualifier: data.qualifier || (data.include_normal ? null : 'excluding "normal"'),
      });
    } catch (err) {
      setValidationError(errorMessage(err, 'Loading genes for the phenotype failed.'));
    } finally {
      setGoLoading(false);
    }
  };

  // The phenotype term list, loaded the first time that mode is opened
  useEffect(() => {
    if (inputMode !== 'phenotype' || observableOptions) return;
    phenotypeApi.getObservableTree()
      .then(data => setObservableOptions(flattenObservables(data.tree || [])))
      .catch(err => setValidationError(errorMessage(err, 'Loading phenotype terms failed.')));
  }, [inputMode, observableOptions]);

  // Linked from a GO term page (?go=GO:...&organism=...) or the phenotype
  // term browser (?phenotype=<term>&organism=...)
  useEffect(() => {
    if (autoLoaded.current) return;
    autoLoaded.current = true;
    if (goTerm && inputMode === 'go') loadGoTermGenes(goTerm);
    if (phenoTerm && inputMode === 'phenotype') loadPhenotypeGenes(phenoTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Term-name suggestions while typing (a GO ID is used as typed)
  useEffect(() => {
    const query = goQuery.trim();
    if (inputMode !== 'go' || query.length < 3 || GOID_PATTERN.test(query)
        || (goTerm && query === `${goTerm.name} (${goTerm.id})`)) {
      setGoSuggestions([]);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const data = await searchApi.searchCategory(query, 'go_terms');
        // The search ranks longer terms that contain the query above the term
        // itself; put an exact match first, then prefix matches, then the
        // shorter (broader) names
        const q = query.toLowerCase();
        const rank = (r) => {
          const name = (r.name || '').toLowerCase();
          return [name === q ? 0 : name.startsWith(q) ? 1 : 2, name.length];
        };
        const ranked = [...(data.results || [])].sort((x, y) => {
          const [ax, lx] = rank(x);
          const [ay, ly] = rank(y);
          return ax - ay || lx - ly;
        });
        if (!cancelled) setGoSuggestions(ranked.slice(0, 10));
      } catch {
        if (!cancelled) setGoSuggestions([]);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [goQuery, inputMode, goTerm]);

  const handleGoQueryChange = (value) => {
    setGoQuery(value);
    const id = value.trim().toUpperCase();
    setGoTerm(GOID_PATTERN.test(id) ? { id, name: '' } : null);
  };

  const selectGoSuggestion = (suggestion) => {
    setGoTerm({ id: suggestion.id, name: suggestion.name });
    setGoQuery(`${suggestion.name} (${suggestion.id})`);
    setGoSuggestions([]);
  };

  const runGo = useCallback(async () => {
    setGoResult({ loading: true, data: null, error: null });
    try {
      const data = await goTermFinderApi.runAnalysis({
        genes: geneNames,
        organism_no: geneSet.organismNo,
        ontology: 'all',
        ...ENRICHMENT_PARAMS,
      });
      setGoResult({ loading: false, data, error: null });
    } catch (err) {
      setGoResult({ loading: false, data: null, error: errorMessage(err, 'GO enrichment failed.') });
    }
  }, [geneNames, geneSet]);

  const runPhenotype = useCallback(async () => {
    setPhenoResult({ loading: true, data: null, error: null });
    try {
      const data = await phenotypeEnrichmentApi.runAnalysis({
        genes: geneNames,
        organism_no: geneSet.organismNo,
        ...ENRICHMENT_PARAMS,
      });
      setPhenoResult({ loading: false, data, error: null });
    } catch (err) {
      setPhenoResult({ loading: false, data: null, error: errorMessage(err, 'Phenotype enrichment failed.') });
    }
  }, [geneNames, geneSet]);

  const runExpression = useCallback(async () => {
    setExprResult({ loading: true, data: null, error: null });
    try {
      const names = geneNames.slice(0, MAX_HEATMAP_GENES);
      const results = await expressionApi.getMultiGeneExpression(names, organism.name);
      const rows = geneSet.found.slice(0, MAX_HEATMAP_GENES).map(gene => {
        const entry = results.find(r =>
          r.geneName === gene.systematic_name || r.data?.feature_name === gene.systematic_name);
        return {
          geneName: gene.gene_name || gene.systematic_name,
          data: {
            ...(entry?.data || {}),
            gene_name: gene.gene_name || gene.systematic_name,
            feature_name: gene.systematic_name,
            studies: entry?.data?.studies || [],
          },
          error: entry?.error || null,
        };
      });
      setExprResult({ loading: false, data: rows, error: null });
    } catch (err) {
      setExprResult({ loading: false, data: null, error: errorMessage(err, 'Loading expression data failed.') });
    }
  }, [geneNames, geneSet, organism]);

  const runOrthologs = useCallback(async () => {
    setOrthoResult({ loading: true, data: null, error: null });
    try {
      const data = await orthologApi.convert(geneNames, orthologTargets.map(t => t.orthologId));
      setOrthoResult({ loading: false, data, error: null });
    } catch (err) {
      setOrthoResult({ loading: false, data: null, error: errorMessage(err, 'Ortholog lookup failed.') });
    }
  }, [geneNames, orthologTargets]);

  // Run each analysis lazily, the first time its tab is opened for this list
  useEffect(() => {
    if (!geneSet) return;
    const pending = (r) => !r.loading && !r.data && !r.error;
    if (activeTab === 'go' && pending(goResult)) runGo();
    if (activeTab === 'phenotype' && pending(phenoResult)) runPhenotype();
    if (activeTab === 'expression' && pending(exprResult)) runExpression();
    if (activeTab === 'orthologs' && pending(orthoResult)) runOrthologs();
  }, [activeTab, geneSet, goResult, phenoResult, exprResult, orthoResult,
    runGo, runPhenotype, runExpression, runOrthologs]);

  // Hand the list to GO Term Finder / Batch Download for their full options
  const handOffGeneList = () => {
    try {
      localStorage.setItem('phenotypeSearchGeneList', JSON.stringify(geneNames));
      localStorage.setItem('phenotypeSearchOrganism', organism.name);
    } catch (err) {
      console.error('localStorage error:', err);
    }
  };

  const handleOrthologDownload = async () => {
    try {
      const blob = await orthologApi.downloadConversion(
        geneNames, orthologTargets.map(t => t.orthologId), 'tsv');
      saveBlob(blob, 'gene_list_orthologs.tsv');
    } catch (err) {
      setOrthoResult(prev => ({ ...prev, error: errorMessage(err, 'Ortholog download failed.') }));
    }
  };

  const handleExpressionDownload = async () => {
    setMatrixDownloading(true);
    try {
      await expressionApi.downloadExpressionMatrix(geneNames.slice(0, MAX_MATRIX_GENES), organism.name);
    } catch (err) {
      const message = await blobErrorMessage(err, 'Expression download failed.');
      setExprResult(prev => ({ ...prev, error: message }));
    } finally {
      setMatrixDownloading(false);
    }
  };

  const toggleDownloadType = (value) => {
    setDownloadTypes(prev => (prev.includes(value)
      ? prev.filter(t => t !== value)
      : [...prev, value]));
  };

  const handleBatchDownload = async () => {
    if (downloadTypes.length === 0) {
      setDownloadError('Select at least one data type.');
      return;
    }
    setDownloading(true);
    setDownloadError(null);
    try {
      const response = await batchDownloadApi.download({
        genes: geneNames,
        organism: organism.abbrev,
        dataTypes: downloadTypes,
        compress: true,
      });
      saveBlob(response.data, filenameFromResponse(response, 'gene_list_download.gz'));
    } catch (err) {
      setDownloadError(errorMessage(err, 'Download failed.'));
    } finally {
      setDownloading(false);
    }
  };

  // Pivot ortholog rows into one row per input gene, one column per species
  const orthologTable = useMemo(() => {
    const results = orthoResult.data?.results;
    if (!results) return [];
    const byGene = new Map();
    results.forEach(r => {
      if (!byGene.has(r.input_id)) {
        byGene.set(r.input_id, {
          input: r.input_gene_name || r.input_feature_name || r.input_id,
          featureName: r.input_feature_name || r.input_id,
          cells: {},
        });
      }
      if (!r.found || !r.ortholog_id) return;
      const row = byGene.get(r.input_id);
      (row.cells[r.target_organism] ||= []).push(r);
    });
    return Array.from(byGene.values());
  }, [orthoResult.data]);

  const renderStatus = (result, label) => {
    if (result.loading) return <div className="workbench-status">Loading {label}...</div>;
    if (result.error) return <div className="workbench-error">{result.error}</div>;
    return null;
  };

  const renderOrthologs = () => {
    const status = renderStatus(orthoResult, 'orthologs');
    if (status && !orthoResult.data) return status;
    return (
      <div>
        {status}
        <div className="workbench-tab-actions">
          <span>
            {orthoResult.data?.found_count ?? 0} of {geneNames.length} genes have
            orthologs in at least one species.
          </span>
          <button type="button" className="workbench-secondary-btn" onClick={handleOrthologDownload}>
            Download TSV
          </button>
          <Link to="/ortholog-converter" className="workbench-link">Ortholog Converter</Link>
        </div>
        <div className="workbench-table-wrap">
          <table className="workbench-ortholog-table">
            <thead>
              <tr>
                <th>{organism.name}</th>
                {orthologTargets.map(t => <th key={t.orthologId}>{t.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {orthologTable.map(row => (
                <tr key={row.featureName}>
                  <td><Link to={`/locus/${row.featureName}`}>{row.input}</Link></td>
                  {orthologTargets.map(t => {
                    const hits = row.cells[t.name] || [];
                    return (
                      <td key={t.orthologId}>
                        {hits.length === 0 && <span className="workbench-none">-</span>}
                        {hits.map(h => {
                          const label = h.ortholog_gene_name || h.ortholog_feature_name || h.ortholog_id;
                          return (
                            <div key={h.ortholog_id} title={h.ortholog_description || ''}>
                              {h.ortholog_url && h.ortholog_url.startsWith('/')
                                ? <Link to={h.ortholog_url}>{label}</Link>
                                : h.ortholog_url
                                  ? <a href={h.ortholog_url} target="_blank" rel="noopener noreferrer">{label}</a>
                                  : label}
                              {h.relationship && h.relationship !== '1:1' && (
                                <span className="workbench-rel"> ({h.relationship})</span>
                              )}
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderExpression = () => {
    const status = renderStatus(exprResult, 'expression data');
    if (status && !exprResult.data) return status;
    const withData = (exprResult.data || []).filter(r => r.data.studies.length > 0).length;
    return (
      <div>
        {status}
        <div className="workbench-tab-actions">
          <span>
            RNA-seq fold changes for {withData} of {Math.min(geneNames.length, MAX_HEATMAP_GENES)} genes
            {geneNames.length > MAX_HEATMAP_GENES && ` (first ${MAX_HEATMAP_GENES} genes of your list)`}.
          </span>
          {withData > 0 && (
            <button
              type="button"
              className="workbench-secondary-btn"
              onClick={handleExpressionDownload}
              disabled={matrixDownloading}
            >
              {matrixDownloading ? 'Preparing matrix...' : 'Download matrix (TSV)'}
            </button>
          )}
        </div>
        {geneNames.length > MAX_HEATMAP_GENES && (
          <p className="workbench-hint">
            The heatmap shows the first {MAX_HEATMAP_GENES} genes; the matrix download includes
            {geneNames.length > MAX_MATRIX_GENES
              ? ` the first ${MAX_MATRIX_GENES} of ${geneNames.length}.`
              : ` all ${geneNames.length}.`}
          </p>
        )}
        {withData === 0
          ? <div className="workbench-status">No expression data is available for these genes.</div>
          : (
            <MultiGeneHeatmap
              similarGenes={[]}
              expressionData={exprResult.data}
              loading={false}
              inline={true}
              geneListMode={true}
            />
          )}
      </div>
    );
  };

  const renderDownload = () => (
    <div className="workbench-download">
      <p>Download data for the {geneNames.length} recognized genes (gzip-compressed).</p>
      <div className="workbench-download-types">
        {DOWNLOAD_TYPES.map(t => (
          <label key={t.value}>
            <input
              type="checkbox"
              checked={downloadTypes.includes(t.value)}
              onChange={() => toggleDownloadType(t.value)}
            />
            {t.label}
          </label>
        ))}
      </div>
      <div className="workbench-tab-actions">
        <button
          type="button"
          className="workbench-primary-btn"
          onClick={handleBatchDownload}
          disabled={downloading}
        >
          {downloading ? 'Preparing...' : 'Download'}
        </button>
        <Link to="/batch-download" className="workbench-link" onClick={handOffGeneList}>
          More options in Batch Download
        </Link>
      </div>
      {downloadError && <div className="workbench-error">{downloadError}</div>}
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'go':
        return (
          <>
            <EnrichmentResultsPanel
              title="GO Enrichment Results"
              type="go"
              data={goResult.data}
              loading={goResult.loading}
              error={goResult.error}
              onRetry={runGo}
            />
            <div className="workbench-tab-actions">
              <span>Benjamini-Hochberg corrected p &lt; 0.05, at least 2 genes per term.</span>
              <Link to="/go-term-finder" className="workbench-link" onClick={handOffGeneList}>
                Change settings in GO Term Finder
              </Link>
            </div>
          </>
        );
      case 'phenotype':
        return (
          <>
            <EnrichmentResultsPanel
              title="Phenotype Enrichment Results"
              type="phenotype"
              data={phenoResult.data}
              loading={phenoResult.loading}
              error={phenoResult.error}
              onRetry={runPhenotype}
            />
            <div className="workbench-tab-actions">
              <span>Benjamini-Hochberg corrected p &lt; 0.05, at least 2 genes per phenotype.</span>
            </div>
          </>
        );
      case 'expression':
        return renderExpression();
      case 'orthologs':
        return renderOrthologs();
      case 'download':
        return renderDownload();
      default:
        return null;
    }
  };

  return (
    <div className="gene-list-workbench-page">
      <div className="page-header">
        <h1>Gene List Workbench</h1>
        <p className="page-description">
          Paste a list of genes, for example hits from an RNA-seq or screening experiment, or build one
          from a GO term or a phenotype and their descendants, to see enriched GO terms and phenotypes, expression across
          RNA-seq studies, orthologs in other species, and to download data for the whole list.
        </p>
      </div>

      <div className="workbench-mode" role="tablist" aria-label="Gene list source">
        {[['paste', 'Paste genes'], ['go', 'From a GO term'], ['phenotype', 'From a phenotype']].map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={inputMode === mode}
            className={`workbench-mode-btn ${inputMode === mode ? 'active' : ''}`}
            onClick={() => setInputMode(mode)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="workbench-input">
        {inputMode === 'phenotype' ? (
          <div className="workbench-input-main">
            <label htmlFor="workbench-phenotype">
              Phenotype <span className="workbench-hint">(observable term; annotation counts in parentheses)</span>
            </label>
            <select
              id="workbench-phenotype"
              className="workbench-phenotype-select"
              value={phenoTerm}
              onChange={(e) => setPhenoTerm(e.target.value)}
              disabled={!observableOptions}
            >
              <option value="">{observableOptions ? 'Choose a phenotype...' : 'Loading phenotype terms...'}</option>
              {/* keep the linked term selectable while the list loads */}
              {!observableOptions && phenoTerm && <option value={phenoTerm}>{phenoTerm}</option>}
              {(observableOptions || []).map(o => (
                <option key={o.term} value={o.term}>
                  {'\u00a0\u00a0\u00a0'.repeat(o.depth)}{o.term}{o.count > 0 ? ` (${o.count})` : ''}
                </option>
              ))}
            </select>
            <div className="workbench-go-options">
              <label>
                <input
                  type="checkbox"
                  checked={phenoDescendants}
                  onChange={(e) => setPhenoDescendants(e.target.checked)}
                />
                Include genes annotated to descendant (more specific) terms
              </label>
              <label htmlFor="workbench-qualifier" className="workbench-qualifier">
                Qualifier
                <select
                  id="workbench-qualifier"
                  value={phenoQualifier}
                  onChange={(e) => setPhenoQualifier(e.target.value)}
                >
                  <option value="">Any except normal (no phenotype)</option>
                  <option value={ANY_QUALIFIER}>Any, including normal</option>
                  {PHENOTYPE_QUALIFIERS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </label>
            </div>
            <p className="workbench-hint">
              The genes are loaded into the paste box, so you can edit the list and re-run it.
            </p>
          </div>
        ) : inputMode === 'go' ? (
          <div className="workbench-input-main">
            <label htmlFor="workbench-go">
              GO term <span className="workbench-hint">(term name or GO ID)</span>
            </label>
            <div className="workbench-go-search">
              <input
                id="workbench-go"
                type="text"
                value={goQuery}
                onChange={(e) => handleGoQueryChange(e.target.value)}
                placeholder="e.g. trehalose metabolic process or GO:0005991"
                autoComplete="off"
              />
              {goSuggestions.length > 0 && (
                <ul className="workbench-go-suggestions" role="listbox">
                  {goSuggestions.map(sug => (
                    <li key={sug.id}>
                      <button type="button" onClick={() => selectGoSuggestion(sug)}>
                        <span>{sug.name}</span>
                        <span className="workbench-go-id">{sug.id}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="workbench-go-options">
              <label>
                <input
                  type="checkbox"
                  checked={includeDescendants}
                  onChange={(e) => setIncludeDescendants(e.target.checked)}
                />
                Include genes annotated to descendant (more specific) terms
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={includeComputational}
                  onChange={(e) => setIncludeComputational(e.target.checked)}
                />
                Include computational annotations
              </label>
            </div>
            <p className="workbench-hint">
              The genes are loaded into the paste box, so you can edit the list and re-run it.
            </p>
          </div>
        ) : (
          <div className="workbench-input-main">
            <label htmlFor="workbench-genes">
              Genes <span className="workbench-hint">(gene names or systematic names, one per line)</span>
            </label>
            <textarea
              id="workbench-genes"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              placeholder={'ALS3\nHWP1\nC1_13700W_A\n...'}
            />
            <div className="workbench-input-meta">
              <span>{inputGenes.length} unique entries</span>
              <button type="button" className="workbench-text-btn" onClick={() => setInputText(EXAMPLE_GENES)}>
                Example list
              </button>
              {inputText && (
                <button type="button" className="workbench-text-btn" onClick={() => setInputText('')}>
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
        <div className="workbench-input-side">
          <label htmlFor="workbench-organism">Organism</label>
          <select
            id="workbench-organism"
            value={organismNo}
            onChange={(e) => setOrganismNo(parseInt(e.target.value, 10))}
          >
            {ORGANISMS.map(o => <option key={o.no} value={o.no}>{o.name}</option>)}
          </select>
          {inputMode === 'go' || inputMode === 'phenotype' ? (
            <button
              type="button"
              className="workbench-primary-btn"
              onClick={() => (inputMode === 'go' ? loadGoTermGenes(goTerm) : loadPhenotypeGenes(phenoTerm))}
              disabled={goLoading || validating || (inputMode === 'go' ? !goTerm : !phenoTerm)}
            >
              {goLoading ? 'Loading genes...' : validating ? 'Checking genes...' : 'Get genes'}
            </button>
          ) : (
            <button
              type="button"
              className="workbench-primary-btn"
              onClick={handleAnalyze}
              disabled={validating || inputGenes.length === 0}
            >
              {validating ? 'Checking genes...' : 'Analyze'}
            </button>
          )}
        </div>
      </div>

      {validationError && <div className="workbench-error">{validationError}</div>}

      {geneSet && (
        <div className="workbench-results">
          <div className="workbench-summary">
            <strong>{geneSet.found.length}</strong> genes recognized in <em>{organism.name}</em>
            {geneSet.source ? (
              <>
                {' '}{geneSet.source.relation} <Link to={geneSet.source.url}>{geneSet.source.label}</Link>
                {geneSet.source.includeDescendants && geneSet.source.termCount > 1
                  && ` or its ${geneSet.source.termCount - 1} descendant terms`}
                {geneSet.source.qualifier && ` (${geneSet.source.qualifier})`}.
              </>
            ) : (
              <>{' '}from {geneSet.submitted} entries.</>
            )}
            {geneSet.notFound.length > 0 && (
              <details className="workbench-not-found">
                <summary>{geneSet.notFound.length} not found</summary>
                <span>{geneSet.notFound.join(', ')}</span>
              </details>
            )}
          </div>

          <div className="workbench-tabs" role="tablist">
            {TABS.map(t => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={activeTab === t.key}
                className={`workbench-tab ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="workbench-tab-panel">{renderTab()}</div>
        </div>
      )}
    </div>
  );
};

export default GeneListWorkbenchPage;

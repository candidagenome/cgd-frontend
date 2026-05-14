import React, { useState, useEffect, useCallback } from 'react';
import { orthologApi } from '../api/orthologApi';
import './OrthologConverterPage.css';

// Display names for organisms
const ORGANISM_DISPLAY_NAMES = {
  C_albicans_SC5314: 'C. albicans SC5314',
  C_dubliniensis_CD36: 'C. dubliniensis CD36',
  C_tropicalis_MYA3404: 'C. tropicalis MYA-3404',
  C_parapsilosis_CDC317: 'C. parapsilosis CDC317',
  C_auris_B8441: 'C. auris B8441',
  C_glabrata_CBS138: 'C. glabrata CBS138',
  S_cerevisiae: 'S. cerevisiae (SGD)',
  S_pombe: 'S. pombe (PomBase)',
  A_nidulans: 'A. nidulans (AspGD)',
  N_crassa: 'N. crassa',
};

function OrthologConverterPage() {
  // State
  const [geneInput, setGeneInput] = useState('');
  const [targetOrganism, setTargetOrganism] = useState('S_cerevisiae');
  const [targets, setTargets] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingTargets, setLoadingTargets] = useState(true);

  // Load available targets on mount
  useEffect(() => {
    const loadTargets = async () => {
      try {
        const data = await orthologApi.getTargets();
        setTargets(data.targets || []);
      } catch (err) {
        console.error('Failed to load targets:', err);
        // Use default targets if API fails
        setTargets([
          { id: 'S_cerevisiae', name: 'Saccharomyces cerevisiae', source: 'SGD', is_external: true },
          { id: 'C_albicans_SC5314', name: 'Candida albicans SC5314', source: 'CGD', is_external: false },
          { id: 'C_glabrata_CBS138', name: 'Candida glabrata CBS138', source: 'CGD', is_external: false },
          { id: 'C_dubliniensis_CD36', name: 'Candida dubliniensis CD36', source: 'CGD', is_external: false },
          { id: 'C_tropicalis_MYA3404', name: 'Candida tropicalis MYA-3404', source: 'CGD', is_external: false },
          { id: 'C_parapsilosis_CDC317', name: 'Candida parapsilosis CDC317', source: 'CGD', is_external: false },
          { id: 'C_auris_B8441', name: 'Candida auris B8441', source: 'CGD', is_external: false },
        ]);
      } finally {
        setLoadingTargets(false);
      }
    };
    loadTargets();
  }, []);

  // Parse gene input into array
  const parseGeneInput = useCallback((input) => {
    return input
      .split(/[\n,\t\s]+/)
      .map((g) => g.trim())
      .filter((g) => g.length > 0);
  }, []);

  // Handle conversion
  const handleConvert = async () => {
    const geneIds = parseGeneInput(geneInput);
    if (geneIds.length === 0) {
      setError('Please enter at least one gene ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await orthologApi.convert(geneIds, targetOrganism);
      setResults(data);
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err.response?.data?.detail || err.message || 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setGeneInput(e.target.result);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  // Download results as CSV
  const handleDownloadCSV = async () => {
    const geneIds = parseGeneInput(geneInput);
    try {
      const blob = await orthologApi.downloadConversion(geneIds, targetOrganism, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ortholog_conversion_${targetOrganism}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Download failed');
    }
  };

  // Download results as TSV
  const handleDownloadTSV = async () => {
    const geneIds = parseGeneInput(geneInput);
    try {
      const blob = await orthologApi.downloadConversion(geneIds, targetOrganism, 'tsv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ortholog_conversion_${targetOrganism}.tsv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Download failed');
    }
  };

  // Copy ortholog IDs to clipboard
  const handleCopyOrthologIds = async () => {
    if (!results) return;
    const ids = results.results
      .filter((r) => r.ortholog_id)
      .map((r) => r.ortholog_id)
      .join('\n');
    try {
      await navigator.clipboard.writeText(ids);
      // Could show a toast notification here
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  // Get relationship badge class
  const getRelationshipClass = (relationship) => {
    switch (relationship) {
      case '1:1':
        return 'relationship-one-to-one';
      case '1:many':
      case 'many:1':
        return 'relationship-one-to-many';
      case 'many:many':
        return 'relationship-many-to-many';
      case 'no_ortholog':
        return 'relationship-none';
      case 'not_found':
        return 'relationship-not-found';
      case 'same_organism':
        return 'relationship-same';
      default:
        return '';
    }
  };

  // Group targets by type
  const cgdTargets = targets.filter((t) => !t.is_external);
  const externalTargets = targets.filter((t) => t.is_external);

  const geneCount = parseGeneInput(geneInput).length;

  return (
    <main className="ortholog-converter-page">
      <div className="page-header">
        <h1>Ortholog Converter</h1>
        <p className="page-description">
          Convert a list of genes from one species to their orthologs in another species.
          Useful for transferring gene lists between <em>Candida</em> species or to{' '}
          <em>S. cerevisiae</em> for functional analysis.
        </p>
      </div>

      <div className="converter-container">
        {/* Input Section */}
        <div className="input-section">
          <div className="input-panel">
            <h2>1. Enter Gene List</h2>
            <p className="input-help">
              Enter gene names, systematic names, or CGD IDs (one per line, or separated by
              commas/tabs/spaces)
            </p>
            <textarea
              className="gene-input"
              value={geneInput}
              onChange={(e) => setGeneInput(e.target.value)}
              placeholder="ACT1&#10;ERG11&#10;C1_00010W_A&#10;CDC19&#10;..."
              rows={12}
            />
            <div className="input-actions">
              <label className="file-upload-btn">
                <input type="file" accept=".txt,.csv,.tsv" onChange={handleFileUpload} />
                Upload File
              </label>
              <button
                type="button"
                className="clear-btn"
                onClick={() => setGeneInput('')}
                disabled={!geneInput}
              >
                Clear
              </button>
              <span className="gene-count">
                {geneCount} gene{geneCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="target-panel">
            <h2>2. Select Target Species</h2>
            <p className="input-help">Choose the organism to convert orthologs to</p>

            {loadingTargets ? (
              <div className="loading-targets">Loading organisms...</div>
            ) : (
              <div className="target-groups">
                <div className="target-group">
                  <h3>External Databases</h3>
                  {externalTargets.map((t) => (
                    <label key={t.id} className="target-option">
                      <input
                        type="radio"
                        name="target"
                        value={t.id}
                        checked={targetOrganism === t.id}
                        onChange={(e) => setTargetOrganism(e.target.value)}
                      />
                      <span className="target-name">
                        <em>{t.name.split(' ').slice(0, 2).join(' ')}</em>
                        {t.name.includes('(') && (
                          <span className="target-source">
                            {' '}
                            ({t.name.split('(')[1]?.replace(')', '') || t.source})
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="target-group">
                  <h3>CGD Species</h3>
                  {cgdTargets.map((t) => (
                    <label key={t.id} className="target-option">
                      <input
                        type="radio"
                        name="target"
                        value={t.id}
                        checked={targetOrganism === t.id}
                        onChange={(e) => setTargetOrganism(e.target.value)}
                      />
                      <span className="target-name">
                        <em>{t.name}</em>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Convert Button */}
        <div className="convert-section">
          <button
            type="button"
            className="convert-btn"
            onClick={handleConvert}
            disabled={loading || geneCount === 0}
          >
            {loading ? 'Converting...' : 'Convert to Orthologs'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="results-section">
            <div className="results-header">
              <h2>Results</h2>
              <div className="results-summary">
                <span className="summary-item">
                  <strong>{results.total_input}</strong> input genes
                </span>
                <span className="summary-item">
                  <strong>{results.found_count}</strong> found in CGD
                </span>
                <span className="summary-item">
                  <strong>{results.converted_count}</strong> with orthologs in{' '}
                  <em>{ORGANISM_DISPLAY_NAMES[targetOrganism] || results.target_organism}</em>
                </span>
              </div>
              <div className="results-actions">
                <button type="button" onClick={handleCopyOrthologIds} className="action-btn">
                  Copy Ortholog IDs
                </button>
                <button type="button" onClick={handleDownloadCSV} className="action-btn">
                  Download CSV
                </button>
                <button type="button" onClick={handleDownloadTSV} className="action-btn">
                  Download TSV
                </button>
              </div>
            </div>

            <div className="results-table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Input Gene</th>
                    <th>Input Name</th>
                    <th>Input Organism</th>
                    <th>Ortholog ID</th>
                    <th>Ortholog Name</th>
                    <th>Target Organism</th>
                    <th>Relationship</th>
                    <th>Cluster</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((r, idx) => (
                    <tr key={idx} className={r.found ? '' : 'not-found-row'}>
                      <td className="input-id">{r.input_id}</td>
                      <td>{r.input_gene_name || '-'}</td>
                      <td className="organism-cell">
                        {r.input_organism ? <em>{r.input_organism}</em> : '-'}
                      </td>
                      <td className="ortholog-id">
                        {r.ortholog_url && r.ortholog_id ? (
                          <a
                            href={
                              r.ortholog_url.startsWith('http')
                                ? r.ortholog_url
                                : r.ortholog_url
                            }
                            target={r.ortholog_url.startsWith('http') ? '_blank' : '_self'}
                            rel={r.ortholog_url.startsWith('http') ? 'noopener noreferrer' : ''}
                          >
                            {r.ortholog_id}
                          </a>
                        ) : (
                          r.ortholog_id || '-'
                        )}
                      </td>
                      <td>{r.ortholog_gene_name || '-'}</td>
                      <td className="organism-cell">
                        {r.target_organism ? <em>{r.target_organism}</em> : '-'}
                      </td>
                      <td>
                        <span className={`relationship-badge ${getRelationshipClass(r.relationship)}`}>
                          {r.relationship || '-'}
                        </span>
                      </td>
                      <td className="cluster-cell">
                        {r.cluster_id ? (
                          <a
                            href={`http://cgob3.ucd.ie/cgob.pl?gene=${r.input_feature_name || r.input_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View in CGOB"
                          >
                            {r.cluster_id}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="notes-cell">{r.notes || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="page-help">
        <h2>How to Use</h2>
        <ul>
          <li>
            <strong>Enter genes:</strong> Paste or type gene identifiers in the text box, or upload
            a text file. Accepts gene names (ACT1), systematic names (C1_00010W_A), or CGD IDs.
          </li>
          <li>
            <strong>Select target:</strong> Choose the organism you want to convert to. Popular
            choice is <em>S. cerevisiae</em> for using SGD tools.
          </li>
          <li>
            <strong>Convert:</strong> Click the button to find orthologs. Results show the mapping
            with relationship type.
          </li>
          <li>
            <strong>Download:</strong> Export results as CSV/TSV, or copy just the ortholog IDs for
            pasting into other tools.
          </li>
        </ul>

        <h3>Relationship Types</h3>
        <ul>
          <li>
            <strong>1:1</strong> - Clear one-to-one ortholog relationship
          </li>
          <li>
            <strong>1:many</strong> - One input gene has multiple orthologs in target
          </li>
          <li>
            <strong>many:1</strong> - Multiple input genes share one ortholog
          </li>
          <li>
            <strong>many:many</strong> - Complex relationship with multiple genes on both sides
          </li>
          <li>
            <strong>no_ortholog</strong> - Gene found but no ortholog in target organism
          </li>
          <li>
            <strong>not_found</strong> - Gene not found in CGD database
          </li>
        </ul>

        <h3>Data Source</h3>
        <p>
          Ortholog relationships are based on CGOB (Candida Gene Order Browser) clusters, which use
          a combination of sequence similarity and synteny conservation to identify orthologs across
          fungal species.
        </p>
      </div>
    </main>
  );
}

export default OrthologConverterPage;

import React, { useEffect, useRef, useState } from 'react';
import './AlphaFoldViewer.css';

/**
 * AlphaFold 3D Structure Viewer using PDBe Mol* (Molstar)
 * Based on SGD implementation
 */
function AlphaFoldViewer({ uniprotId }) {
  const containerRef = useRef(null);
  const viewerInstanceRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uniprotId) {
      setLoading(false);
      return;
    }

    // Load PDBe Molstar CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://www.ebi.ac.uk/pdbe/pdb-component-library/css/pdbe-molstar-light-3.1.0.css';
    document.head.appendChild(cssLink);

    // Load PDBe Molstar JS
    const script = document.createElement('script');
    script.src = 'https://www.ebi.ac.uk/pdbe/pdb-component-library/js/pdbe-molstar-plugin-3.1.0.js';
    script.async = true;

    script.onload = () => {
      initViewer();
    };

    script.onerror = () => {
      setError('Failed to load AlphaFold viewer script');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.clear();
        } catch (e) {
          console.warn('Error clearing viewer:', e);
        }
      }
    };
  }, [uniprotId]);

  const initViewer = async () => {
    if (!containerRef.current || !window.PDBeMolstarPlugin) {
      setError('AlphaFold viewer unavailable');
      setLoading(false);
      return;
    }

    try {
      const picked = await resolveAlphaFoldUrl(uniprotId);
      if (!picked) {
        setError('AlphaFold structure not available');
        setLoading(false);
        return;
      }

      // Prefetch as blob for better performance
      let blobUrl = null;
      try {
        blobUrl = await prefetchAsBlob(picked.url, picked.format);
      } catch (e) {
        console.warn('Prefetch failed, falling back to direct URL:', e);
        blobUrl = picked.url;
      }

      // Initialize viewer
      const instance = new window.PDBeMolstarPlugin();
      viewerInstanceRef.current = instance;

      instance.render(containerRef.current, {
        customData: { url: blobUrl, format: picked.format, binary: picked.format === 'bcif' },
        alphafoldView: true,
        bgColor: { r: 255, g: 255, b: 255 },
        hideControls: true,
        hideCanvasControls: ['expand', 'animation', 'controlToggle', 'controlInfo']
      });

      setLoading(false);

      // Clean up Blob URL later to free memory
      if (blobUrl && blobUrl.startsWith('blob:')) {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
      }
    } catch (e) {
      console.error('AlphaFold viewer error:', e);
      setError(e.message || 'Failed to load AlphaFold structure');
      setLoading(false);
    }
  };

  // Resolve AlphaFold URL with caching
  const resolveAlphaFoldUrl = async (id) => {
    const CACHE_KEY = `af_url_${id}`;
    const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

    // Check cache
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const { url, format, binary, ts } = JSON.parse(raw);
        if (url && format && ts && Date.now() - ts < CACHE_TTL_MS) {
          return { url, format, binary };
        }
      }
    } catch (e) {
      // Cache miss
    }

    const tried = new Set();
    const upper = (id || '').toUpperCase();
    const base = upper.replace(/-\d+$/, '');

    const candidates = [
      upper,
      base,
      `AF-${upper}-F1`,
      `AF-${base}-F1`,
    ];

    const pickFromPayload = (p) => {
      if (p?.bcifUrl) return { url: p.bcifUrl, format: 'bcif', binary: true };
      if (p?.cifUrl) return { url: p.cifUrl, format: 'cif', binary: false };
      if (p?.pdbUrl) return { url: p.pdbUrl, format: 'pdb', binary: false };

      const maybe =
        p?.files?.bcif?.url || p?.files?.cif?.url || p?.files?.pdb?.url ||
        p?.model?.bcifUrl || p?.model?.cifUrl || p?.model?.pdbUrl;
      if (maybe) {
        const fmt = maybe.includes('.bcif') ? 'bcif' : maybe.includes('.cif') ? 'cif' : 'pdb';
        return { url: maybe, format: fmt, binary: fmt === 'bcif' };
      }
      return null;
    };

    const normalizePredictionResponse = (json) => {
      if (Array.isArray(json)) return json;
      if (json && Array.isArray(json.results)) return json.results;
      if (json && Array.isArray(json.predictions)) return json.predictions;
      if (json && typeof json === 'object') return [json];
      return [];
    };

    for (const cand of candidates) {
      if (!cand || tried.has(cand)) continue;
      tried.add(cand);

      try {
        const res = await fetch(
          `https://alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(cand)}`,
          { mode: 'cors', cache: 'no-store' }
        );
        if (!res.ok) continue;

        const json = await res.json();
        const preds = normalizePredictionResponse(json);
        if (!preds.length) continue;

        const picked = pickFromPayload(preds[0]);
        if (picked) {
          // Cache the result
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ ...picked, ts: Date.now() }));
          } catch (e) {
            // Cache write failed
          }
          return picked;
        }
      } catch (e) {
        // Try next candidate
      }
    }

    throw new Error('No AlphaFold prediction found for this UniProt ID');
  };

  // Prefetch structure as Blob URL
  const prefetchAsBlob = async (url, format) => {
    const res = await fetch(url, { mode: 'cors', cache: 'force-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const ab = await res.arrayBuffer();
    const mime = format === 'bcif' ? 'application/octet-stream'
      : format === 'cif' ? 'chemical/x-mmcif'
        : 'chemical/x-pdb';
    return URL.createObjectURL(new Blob([ab], { type: mime }));
  };

  if (!uniprotId) {
    return <span className="no-value">No predicted structure available</span>;
  }

  return (
    <div className="alphafold-wrapper">
      <div className="alphafold-viewer-container">
        {loading && <div className="alphafold-loading">Loading AlphaFold structure...</div>}
        {error && <div className="alphafold-error">{error}</div>}
        <div
          ref={containerRef}
          className="alphafold-viewer"
          style={{ display: loading || error ? 'none' : 'block' }}
        />
      </div>

      <div className="alphafold-sidebar">
        <div className="alphafold-resources">
          <h4>Resources</h4>
          <ul>
            <li>
              <a
                href={`https://alphafold.ebi.ac.uk/entry/AF-${uniprotId}-F1`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View full AlphaFold page
              </a>
            </li>
            <li>
              <a
                href="https://molstar.org/viewer-docs/#mouse-controls"
                target="_blank"
                rel="noopener noreferrer"
              >
                Viewer control documentation
              </a>
            </li>
          </ul>
        </div>

        <div className="alphafold-legend">
          <h4>Model Confidence</h4>
          <div className="legend-item">
            <div className="legend-box legend-dark-blue"></div>
            <span>Very high (pLDDT &gt; 90)</span>
          </div>
          <div className="legend-item">
            <div className="legend-box legend-light-blue"></div>
            <span>Confident (70 &lt; pLDDT &lt; 90)</span>
          </div>
          <div className="legend-item">
            <div className="legend-box legend-light-yellow"></div>
            <span>Low (50 &lt; pLDDT &lt; 70)</span>
          </div>
          <div className="legend-item">
            <div className="legend-box legend-light-red"></div>
            <span>Very low (pLDDT &lt; 50)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlphaFoldViewer;

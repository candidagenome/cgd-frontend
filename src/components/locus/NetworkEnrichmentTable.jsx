import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';

const GENES_TO_SHOW = 6;

function fmtPval(v) {
  if (v == null) return '-';
  return v < 0.001 ? v.toExponential(1) : v.toFixed(3);
}

// Renders the hit-gene list as locus links (when feature_name is known),
// with a "+N more" / "show less" expander, matching the GO Term Finder grid.
const GenesRenderer = (props) => {
  const { data, context } = props;
  const genes = data?.genes || [];
  if (genes.length === 0) return '-';
  const expanded = context?.expanded?.has(data.key);
  const shown = expanded ? genes : genes.slice(0, GENES_TO_SHOW);
  const hasMore = genes.length > GENES_TO_SHOW;

  return (
    <div className="enrich-genes-cell">
      {shown.map((g, idx) => (
        <React.Fragment key={`${g.label}-${idx}`}>
          {g.feature_name ? (
            <Link to={`/locus/${g.feature_name}`} target="_blank" rel="noopener noreferrer">
              {g.label}
            </Link>
          ) : (
            <span>{g.label}</span>
          )}
          {idx < shown.length - 1 && ', '}
        </React.Fragment>
      ))}
      {hasMore && (
        <button className="enrich-more-btn" onClick={() => context.toggle(data.key)}>
          {expanded ? ' show less' : ` +${genes.length - GENES_TO_SHOW} more`}
        </button>
      )}
    </div>
  );
};

/**
 * AgGrid table for enrichment results with a hit-gene column.
 *
 * @param {Array} rows - normalized rows: { key, category, description, termId,
 *                       termUrl (optional), count, fold (nullable), fdr,
 *                       genes: [{label, feature_name}] }
 * @param {boolean} showCategory - show the Category column
 * @param {boolean} showFold - show the Fold-enrichment column
 * @param {number} pageSize - rows per page (enables pagination when set)
 */
function NetworkEnrichmentTable({ rows, showCategory = true, showFold = true, pageSize = null }) {
  const gridRef = useRef(null);
  const [expanded, setExpanded] = useState(new Set());

  const toggle = useCallback((key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    setTimeout(() => {
      gridRef.current?.api?.refreshCells({ columns: ['genes'], force: true });
      gridRef.current?.api?.resetRowHeights();
    }, 0);
  }, []);

  const context = useMemo(() => ({ expanded, toggle }), [expanded, toggle]);

  const columnDefs = useMemo(() => {
    const cols = [];
    if (showCategory) {
      cols.push({ headerName: 'Category', field: 'category', flex: 0.9, minWidth: 130 });
    }
    cols.push({
      headerName: 'Term', field: 'description', flex: 1.6, minWidth: 200,
      wrapText: true, autoHeight: true,
      cellRenderer: (p) => (
        <span>
          {p.data.termUrl ? (
            <Link to={p.data.termUrl} target="_blank" rel="noopener noreferrer">
              {p.data.description}
            </Link>
          ) : (
            p.data.description
          )}
          {p.data.termId ? <span className="enrich-term-id"> ({p.data.termId})</span> : null}
        </span>
      ),
    });
    cols.push({
      headerName: '#', field: 'count', width: 70,
      type: 'numericColumn', headerTooltip: 'Query genes annotated to this term',
    });
    if (showFold) {
      cols.push({
        headerName: 'Fold', field: 'fold', width: 85, type: 'numericColumn',
        valueFormatter: (p) => (p.value == null ? '-' : `${p.value.toFixed(1)}×`),
      });
    }
    cols.push({
      headerName: 'FDR', field: 'fdr', width: 95, type: 'numericColumn',
      valueFormatter: (p) => fmtPval(p.value),
    });
    cols.push({
      headerName: 'Genes', field: 'genes', flex: 2, minWidth: 240,
      sortable: false, wrapText: true, autoHeight: true, cellRenderer: GenesRenderer,
    });
    return cols;
  }, [showCategory, showFold]);

  const defaultColDef = useMemo(() => ({ sortable: true, resizable: true }), []);

  return (
    <div className="ag-theme-alpine enrichment-aggrid" style={{ width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        context={context}
        domLayout="autoHeight"
        pagination={!!pageSize}
        paginationPageSize={pageSize || 100}
        suppressCellFocus={true}
      />
    </div>
  );
}

export default NetworkEnrichmentTable;

/**
 * AnnotationTable - Reusable table component for displaying annotations.
 *
 * Supports sortable columns, row actions, and customizable rendering.
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable annotation table with sorting and actions.
 *
 * @param {Object} props
 * @param {Array} props.data - Array of annotation objects
 * @param {Array} props.columns - Column definitions [{key, label, render?, sortable?, width?}]
 * @param {Function} props.onRowAction - Handler for row actions (action, row) => void
 * @param {Array} props.actions - Action buttons [{label, action, style?, confirm?}]
 * @param {string} props.keyField - Field to use as row key (default: 'id')
 * @param {string} props.emptyMessage - Message when no data
 */
function AnnotationTable({
  data = [],
  columns = [],
  onRowAction,
  actions = [],
  keyField = 'id',
  emptyMessage = 'No data available.',
}) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Handle column header click for sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;
      if (typeof aVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else {
        comparison = aVal - bVal;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection]);

  // Handle action button click
  const handleAction = (action, row) => {
    const actionDef = actions.find((a) => a.action === action);

    if (actionDef?.confirm) {
      const message = typeof actionDef.confirm === 'string'
        ? actionDef.confirm
        : `Are you sure you want to ${action}?`;

      if (!window.confirm(message)) {
        return;
      }
    }

    onRowAction?.(action, row);
  };

  // Render cell value
  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }

    const value = row[column.key];

    // Handle null/undefined
    if (value == null) return '-';

    // Handle arrays
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return value;
  };

  if (data.length === 0) {
    return <p style={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  ...styles.th,
                  width: col.width,
                  cursor: col.sortable ? 'pointer' : 'default',
                }}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                {col.label}
                {col.sortable && sortField === col.key && (
                  <span style={styles.sortIndicator}>
                    {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                  </span>
                )}
              </th>
            ))}
            {actions.length > 0 && (
              <th style={styles.th}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={row[keyField] || idx} style={styles.row}>
              {columns.map((col) => (
                <td key={col.key} style={styles.td}>
                  {renderCell(row, col)}
                </td>
              ))}
              {actions.length > 0 && (
                <td style={styles.td}>
                  <div style={styles.actions}>
                    {actions.map((action) => (
                      <button
                        key={action.action}
                        onClick={() => handleAction(action.action, row)}
                        style={{
                          ...styles.actionButton,
                          ...(action.style || {}),
                        }}
                        title={action.title}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Helper component for rendering links in table cells.
 */
export function TableLink({ to, children, external = false }) {
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return <Link to={to}>{children}</Link>;
}

/**
 * Helper component for rendering a list of items in a cell.
 */
export function TableList({ items, renderItem, separator = ', ' }) {
  if (!items || items.length === 0) return '-';

  return (
    <>
      {items.map((item, idx) => (
        <span key={idx}>
          {idx > 0 && separator}
          {renderItem ? renderItem(item, idx) : item}
        </span>
      ))}
    </>
  );
}

const styles = {
  container: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.5rem',
    borderBottom: '2px solid #333',
    backgroundColor: '#f5f5f5',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  sortIndicator: {
    fontSize: '0.75rem',
  },
  row: {
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
  },
  td: {
    padding: '0.5rem',
    borderBottom: '1px solid #ddd',
    verticalAlign: 'top',
  },
  empty: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  actions: {
    display: 'flex',
    gap: '0.25rem',
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
  },
};

export default AnnotationTable;

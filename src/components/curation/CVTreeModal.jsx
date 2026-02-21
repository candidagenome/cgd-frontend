/**
 * CVTreeModal - Modal for selecting CV terms from a hierarchical tree.
 *
 * Displays CV terms in a tree structure with checkboxes for multi-select.
 * Used for Literature Topics and Curation Status selection.
 */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import phenotypeCurationApi from '../../api/phenotypeCurationApi';

/**
 * Flatten tree structure into array with depth info.
 */
function flattenTree(nodes, depth = 0) {
  const result = [];
  for (const node of nodes) {
    result.push({ term: node.term, depth });
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, depth + 1));
    }
  }
  return result;
}

function CVTreeModal({
  isOpen,
  onClose,
  onSelect,
  cvName,
  title,
  selectedTerms = [],
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localSelected, setLocalSelected] = useState(new Set(selectedTerms));

  useEffect(() => {
    if (!isOpen) return;

    const loadTree = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await phenotypeCurationApi.getCVTermTree(cvName);
        const flattened = flattenTree(data.tree || []);
        setOptions(flattened);
      } catch (err) {
        console.error(`Failed to load CV tree for ${cvName}:`, err);
        // Fall back to flat list
        try {
          const flatData = await phenotypeCurationApi.getCVTerms(cvName);
          setOptions((flatData.terms || []).map((term) => ({ term, depth: 0 })));
        } catch {
          setError('Failed to load options');
        }
      } finally {
        setLoading(false);
      }
    };

    loadTree();
  }, [cvName, isOpen]);

  useEffect(() => {
    setLocalSelected(new Set(selectedTerms));
  }, [selectedTerms, isOpen]);

  const handleToggle = (term) => {
    const newSelected = new Set(localSelected);
    if (newSelected.has(term)) {
      newSelected.delete(term);
    } else {
      newSelected.add(term);
    }
    setLocalSelected(newSelected);
  };

  const handleConfirm = () => {
    onSelect(Array.from(localSelected));
    onClose();
  };

  const handleClear = () => {
    setLocalSelected(new Set());
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button onClick={onClose} style={styles.closeBtn}>&times;</button>
        </div>

        <div style={styles.content}>
          {loading && <p>Loading...</p>}
          {error && <p style={styles.error}>{error}</p>}
          {!loading && !error && (
            <div style={styles.treeContainer}>
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.treeItem,
                    paddingLeft: `${opt.depth * 20 + 10}px`,
                  }}
                >
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={localSelected.has(opt.term)}
                      onChange={() => handleToggle(opt.term)}
                      style={styles.checkbox}
                    />
                    {opt.depth > 0 && <span style={styles.indent}>{'└ '}</span>}
                    {opt.term}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <div style={styles.selectedCount}>
            {localSelected.size} selected
          </div>
          <div style={styles.buttons}>
            <button onClick={handleClear} style={styles.clearBtn}>
              Clear
            </button>
            <button onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button onClick={handleConfirm} style={styles.confirmBtn}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '500px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #ddd',
    backgroundColor: 'navajowhite',
    borderRadius: '8px 8px 0 0',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0 0.5rem',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '0.5rem',
  },
  treeContainer: {
    maxHeight: '400px',
    overflow: 'auto',
  },
  treeItem: {
    padding: '0.3rem 0',
    borderBottom: '1px solid #f0f0f0',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  checkbox: {
    marginRight: '0.5rem',
  },
  indent: {
    color: '#999',
    marginRight: '0.25rem',
  },
  error: {
    color: 'red',
    padding: '1rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderTop: '1px solid #ddd',
    backgroundColor: '#f9f9f9',
    borderRadius: '0 0 8px 8px',
  },
  selectedCount: {
    fontSize: '0.9rem',
    color: '#666',
  },
  buttons: {
    display: 'flex',
    gap: '0.5rem',
  },
  clearBtn: {
    padding: '0.5rem 1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '0.5rem 1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  confirmBtn: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
  },
};

CVTreeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  cvName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  selectedTerms: PropTypes.arrayOf(PropTypes.string),
};

export default CVTreeModal;

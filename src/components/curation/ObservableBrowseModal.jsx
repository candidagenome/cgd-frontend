/**
 * ObservableBrowseModal - Modal with expandable tree for selecting observables
 *
 * Mirrors the Perl version's makeTree.pl popup window behavior.
 * Allows selecting multiple observables from a hierarchical tree.
 */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import phenotypeCurationApi from '../../api/phenotypeCurationApi';

function ObservableBrowseModal({ isOpen, onClose, onSelect, selectedTerms = [] }) {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [localSelected, setLocalSelected] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setLocalSelected([...selectedTerms]);
      loadTree();
    }
  }, [isOpen, selectedTerms]);

  const loadTree = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await phenotypeCurationApi.getCVTermTree('observable');
      setTree(data.tree || []);
      // Expand root level by default
      const initialExpanded = {};
      (data.tree || []).forEach((_, idx) => {
        initialExpanded[`root-${idx}`] = true;
      });
      setExpandedNodes(initialExpanded);
    } catch (err) {
      console.error('Failed to load observable tree:', err);
      setError('Failed to load observable terms');
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeKey) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey],
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    const addAllNodes = (nodes, parentKey = 'root') => {
      nodes.forEach((node, idx) => {
        const nodeKey = `${parentKey}-${idx}`;
        if (node.children && node.children.length > 0) {
          allExpanded[nodeKey] = true;
          addAllNodes(node.children, nodeKey);
        }
      });
    };
    addAllNodes(tree);
    setExpandedNodes(allExpanded);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const handleTermClick = (term) => {
    setLocalSelected((prev) => {
      if (prev.includes(term)) {
        return prev.filter((t) => t !== term);
      }
      return [...prev, term];
    });
  };

  const handleConfirm = () => {
    onSelect(localSelected);
    onClose();
  };

  const handleClear = () => {
    setLocalSelected([]);
  };

  const renderTreeNode = (node, nodeKey, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[nodeKey];
    const isSelected = localSelected.includes(node.term);

    return (
      <div key={nodeKey} style={{ marginLeft: `${depth * 20}px` }}>
        <div style={styles.nodeContent}>
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleNode(nodeKey)}
              style={styles.expandBtn}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span style={styles.leafSpacer}>•</span>
          )}
          <button
            type="button"
            onClick={() => handleTermClick(node.term)}
            style={{
              ...styles.termLink,
              backgroundColor: isSelected ? '#cce5ff' : 'transparent',
              fontWeight: isSelected ? 'bold' : 'normal',
            }}
          >
            {node.term}
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child, idx) =>
              renderTreeNode(child, `${nodeKey}-${idx}`, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Browse Observables</h3>
          <button type="button" onClick={onClose} style={styles.closeBtn}>
            &times;
          </button>
        </div>

        <div style={styles.controls}>
          <button type="button" onClick={expandAll} style={styles.controlBtn}>
            Expand All
          </button>
          <button type="button" onClick={collapseAll} style={styles.controlBtn}>
            Collapse All
          </button>
          <button type="button" onClick={handleClear} style={styles.controlBtn}>
            Clear Selection
          </button>
        </div>

        <div style={styles.selectedInfo}>
          Selected: {localSelected.length} term(s)
          {localSelected.length > 0 && (
            <span style={styles.selectedList}>
              {' '}
              ({localSelected.join(', ')})
            </span>
          )}
        </div>

        <div style={styles.treeContainer}>
          {loading && <div style={styles.loading}>Loading...</div>}
          {error && <div style={styles.error}>{error}</div>}
          {!loading &&
            !error &&
            tree.map((node, idx) => renderTreeNode(node, `root-${idx}`, 0))}
        </div>

        <div style={styles.footer}>
          <button type="button" onClick={handleConfirm} style={styles.confirmBtn}>
            Add Selected ({localSelected.length})
          </button>
          <button type="button" onClick={onClose} style={styles.cancelBtn}>
            Cancel
          </button>
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
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '600px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #ddd',
  },
  title: {
    margin: 0,
    fontSize: '1.2rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0 0.5rem',
  },
  controls: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid #eee',
  },
  controlBtn: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.85rem',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  selectedInfo: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f9f9f9',
    fontSize: '0.9rem',
    borderBottom: '1px solid #eee',
  },
  selectedList: {
    color: '#666',
    fontSize: '0.85rem',
  },
  treeContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '1rem',
    minHeight: '300px',
    maxHeight: '400px',
  },
  nodeContent: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 0',
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '20px',
    fontSize: '0.7rem',
    color: '#666',
  },
  leafSpacer: {
    width: '20px',
    textAlign: 'center',
    color: '#999',
    fontSize: '0.6rem',
  },
  termLink: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '0.9rem',
    color: '#0066cc',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '1rem',
    color: '#c00',
    backgroundColor: '#fee',
    borderRadius: '4px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    padding: '1rem',
    borderTop: '1px solid #ddd',
  },
  confirmBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  cancelBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#999',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};

ObservableBrowseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedTerms: PropTypes.arrayOf(PropTypes.string),
};

export default ObservableBrowseModal;

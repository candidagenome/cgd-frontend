/**
 * CVTreeSelect - Hierarchical dropdown for CV terms
 *
 * Displays CV terms with visual indentation showing parent-child relationships.
 * Mirrors the Perl version's format_cv_tree() display.
 */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import phenotypeCurationApi from '../../api/phenotypeCurationApi';

/**
 * Flatten tree structure into array with depth info for select options.
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

function CVTreeSelect({
  cvName,
  value,
  onChange,
  required = false,
  placeholder = '-- select --',
  disabled = false,
  style = {},
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
        } catch (flatErr) {
          setError('Failed to load options');
        }
      } finally {
        setLoading(false);
      }
    };

    loadTree();
  }, [cvName]);

  if (loading) {
    return (
      <select disabled style={{ ...defaultStyles.select, ...style }}>
        <option>Loading...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select disabled style={{ ...defaultStyles.select, ...style }}>
        <option>{error}</option>
      </select>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      style={{ ...defaultStyles.select, ...style }}
    >
      <option value="">{placeholder}</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt.term}>
          {/* Visual indentation using spaces/dashes */}
          {opt.depth > 0 ? '\u00A0'.repeat(opt.depth * 3) + '└ ' : ''}
          {opt.term}
        </option>
      ))}
    </select>
  );
}

const defaultStyles = {
  select: {
    padding: '0.5rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '200px',
    maxWidth: '350px',
  },
};

CVTreeSelect.propTypes = {
  cvName: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  style: PropTypes.object,
};

export default CVTreeSelect;

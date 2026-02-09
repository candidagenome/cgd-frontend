/**
 * ReferenceSelector - Component for selecting references in curation forms.
 *
 * Supports:
 * - Input by reference number
 * - Input by PubMed ID
 * - Search/autocomplete (future)
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import referenceApi from '../../api/referenceApi';

/**
 * Reference selector with validation.
 *
 * @param {Object} props
 * @param {number} props.value - Current reference_no value
 * @param {Function} props.onChange - Called with (reference_no, referenceData)
 * @param {boolean} props.required - Whether field is required
 * @param {boolean} props.disabled - Whether field is disabled
 * @param {string} props.placeholder - Input placeholder
 */
function ReferenceSelector({
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = 'Enter reference number or PubMed ID',
}) {
  const [inputValue, setInputValue] = useState(value?.toString() || '');
  const [inputType, setInputType] = useState('reference'); // 'reference' or 'pubmed'
  const [referenceData, setReferenceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update input when value prop changes
  useEffect(() => {
    if (value && value.toString() !== inputValue) {
      setInputValue(value.toString());
    }
  }, [value]);

  // Validate and lookup reference
  const handleLookup = async () => {
    if (!inputValue.trim()) {
      setReferenceData(null);
      onChange(null, null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const numValue = parseInt(inputValue.trim(), 10);

      if (isNaN(numValue)) {
        throw new Error('Please enter a valid number');
      }

      // Try to fetch reference info
      // If inputType is 'pubmed', we'd need to search by pubmed
      // For now, assume reference_no
      const data = await referenceApi.getReferenceInfo(numValue);

      if (data) {
        setReferenceData(data);
        onChange(data.reference_no || numValue, data);
      } else {
        throw new Error('Reference not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to lookup reference');
      setReferenceData(null);
      onChange(null, null);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setError(null);
    // Clear reference data when input changes
    if (referenceData) {
      setReferenceData(null);
    }
  };

  // Handle blur - trigger lookup
  const handleBlur = () => {
    if (inputValue.trim() && !referenceData) {
      handleLookup();
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookup();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputRow}>
        <select
          value={inputType}
          onChange={(e) => setInputType(e.target.value)}
          style={styles.typeSelect}
          disabled={disabled}
        >
          <option value="reference">Ref #</option>
          <option value="pubmed">PubMed</option>
        </select>

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          style={styles.input}
        />

        <button
          type="button"
          onClick={handleLookup}
          disabled={disabled || loading || !inputValue.trim()}
          style={styles.lookupButton}
        >
          {loading ? '...' : 'Lookup'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {referenceData && (
        <div style={styles.referenceInfo}>
          <div style={styles.referenceHeader}>
            <strong>Reference #{referenceData.reference_no}</strong>
            {referenceData.pubmed && (
              <span style={styles.pubmed}>
                (PMID:{' '}
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${referenceData.pubmed}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {referenceData.pubmed}
                </a>
                )
              </span>
            )}
          </div>

          <div style={styles.citation}>
            {referenceData.citation ||
              referenceData.title ||
              'No citation available'}
          </div>

          <Link
            to={`/reference/${referenceData.reference_no}`}
            target="_blank"
            style={styles.viewLink}
          >
            View Reference →
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Simplified version - just an input that returns the number.
 */
export function SimpleReferenceInput({
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = 'Reference number',
}) {
  return (
    <input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      style={styles.simpleInput}
    />
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  inputRow: {
    display: 'flex',
    gap: '0.25rem',
  },
  typeSelect: {
    padding: '0.5rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px 0 0 4px',
    backgroundColor: '#f5f5f5',
    width: '80px',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderLeft: 'none',
    flex: 1,
    minWidth: '150px',
  },
  simpleInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '150px',
  },
  lookupButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: '1px solid #2e6da4',
    borderRadius: '0 4px 4px 0',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  error: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c00',
    fontSize: '0.85rem',
  },
  referenceInfo: {
    padding: '0.5rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  referenceHeader: {
    marginBottom: '0.25rem',
  },
  pubmed: {
    marginLeft: '0.5rem',
    color: '#666',
  },
  citation: {
    color: '#333',
    marginBottom: '0.25rem',
    maxHeight: '60px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  viewLink: {
    fontSize: '0.85rem',
  },
};

export default ReferenceSelector;

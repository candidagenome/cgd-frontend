import React, { useState, useEffect, useRef, useCallback } from 'react';
import { locusApi } from '../../api/locusApi';

function GeneSearch({ onGeneSelect, disabled }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const data = await locusApi.searchGenesForSynteny(searchQuery);
      const genes = data.genes || data.results || data || [];
      setResults(genes.slice(0, 10));
      setShowDropdown(genes.length > 0);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Gene search error:', err);
      setResults([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timeout (300ms)
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) {
      if (e.key === 'Enter' && query.length >= 2) {
        performSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          selectGene(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Select a gene from the dropdown
  const selectGene = (gene) => {
    setQuery(gene.gene_name || gene.feature_name || gene.name || '');
    setShowDropdown(false);
    setSelectedIndex(-1);
    if (onGeneSelect) {
      onGeneSelect(gene);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="gene-search">
      <div className="gene-search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for a gene..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setShowDropdown(true);
            }
          }}
          disabled={disabled}
          className="gene-search-input"
          autoComplete="off"
        />
        {loading && <span className="gene-search-spinner" />}
      </div>

      {showDropdown && results.length > 0 && (
        <div ref={dropdownRef} className="gene-search-dropdown">
          {results.map((gene, index) => (
            <div
              key={gene.feature_name || gene.name || index}
              className={`gene-search-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => selectGene(gene)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="gene-name">
                {gene.gene_name || gene.feature_name || gene.name}
              </span>
              {gene.gene_name && gene.feature_name && gene.gene_name !== gene.feature_name && (
                <span className="gene-systematic">({gene.feature_name})</span>
              )}
              {gene.organism_name && (
                <span className="gene-organism">{gene.organism_name}</span>
              )}
              {gene.headline && (
                <span className="gene-description">{gene.headline}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GeneSearch;

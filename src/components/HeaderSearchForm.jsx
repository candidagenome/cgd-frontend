import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import searchApi from '../api/searchApi';
import './HeaderSearchForm.css';

/**
 * Header search form component with autocomplete suggestions.
 * Uses debouncing to avoid excessive API calls.
 */
const HeaderSearchForm = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced fetch suggestions
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await searchApi.autocomplete(query, 10);
      setSuggestions(result.suggestions || []);
      setShowSuggestions(result.suggestions?.length > 0);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timer (300ms delay)
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search/results?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(suggestion.link);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
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

  // Get category label for display
  const getCategoryLabel = (category) => {
    const labels = {
      gene: 'Gene',
      go_term: 'GO',
      phenotype: 'Phenotype',
      reference: 'Reference',
    };
    return labels[category] || category;
  };

  return (
    <div className="search-autocomplete-container">
      <form className="site-search" role="search" onSubmit={handleSearch}>
        <input
          ref={inputRef}
          type="text"
          placeholder="search our site"
          aria-label="Search CGD"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        <button type="submit">Go</button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul
          ref={suggestionsRef}
          className="autocomplete-suggestions"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.category}-${suggestion.text}-${index}`}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className={`suggestion-category category-${suggestion.category}`}>
                {getCategoryLabel(suggestion.category)}
              </span>
              <span
                className="suggestion-text"
                dangerouslySetInnerHTML={{
                  __html: suggestion.highlighted_text || suggestion.text
                }}
              />
              {suggestion.description && (
                <span
                  className="suggestion-description"
                  dangerouslySetInnerHTML={{
                    __html: suggestion.highlighted_description || suggestion.description
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {isLoading && searchQuery.length >= 2 && (
        <div className="autocomplete-loading">Loading...</div>
      )}
    </div>
  );
};

export default HeaderSearchForm;

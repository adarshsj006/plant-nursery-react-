import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = "Search plants...", delay = 300 }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, delay);
  const inputRef = useRef(null);

  // Notify parent when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={`search-bar ${isFocused ? 'focused' : ''}`}>
      <div className="search-input-container">
        <div className="search-icon">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="search-input"
          aria-label="Search plants"
        />
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="clear-button"
            aria-label="Clear search"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <button
          type="submit"
          className="search-button"
          aria-label="Search"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
      
      {query && (
        <div className="search-hint">
          <span className="hint-text">
            Press <kbd>Enter</kbd> to search or <kbd>Esc</kbd> to clear
          </span>
        </div>
      )}
    </form>
  );
};

export default SearchBar;
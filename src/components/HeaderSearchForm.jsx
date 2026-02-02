import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Header search form component that uses React Router navigation.
 * This ensures proper browser history handling (back button works).
 */
const HeaderSearchForm = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Use React Router navigation instead of window.location.href
      // This preserves browser history and enables back button
      navigate(`/search/results?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear input after search
    }
  };

  return (
    <form className="site-search" role="search" onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="search our site"
        aria-label="Search CGD"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button type="submit">Go</button>
    </form>
  );
};

export default HeaderSearchForm;

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from '../utils/analytics';

// Initializes Google Analytics 4 (only when VITE_GA_ID is set) and reports a
// page_view on every client-side route change. Renders nothing; mount once
// inside the Router.
const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

export default Analytics;

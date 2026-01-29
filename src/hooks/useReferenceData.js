import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import referenceApi from '../api/referenceApi';

export function useReferenceData(pubmedId) {
  const [data, setData] = useState({
    info: null,
    locusDetails: null,
    goDetails: null,
    phenotypeDetails: null,
    interactionDetails: null,
  });
  const [loading, setLoading] = useState({
    info: false,
    locusDetails: false,
    goDetails: false,
    phenotypeDetails: false,
    interactionDetails: false,
  });
  const [errors, setErrors] = useState({});

  // Use refs for state to keep loader identities stable
  // This prevents unnecessary re-renders and infinite API call loops
  // Update refs synchronously during render (not in useEffect) to avoid stale values
  const dataRef = useRef(data);
  const loadingRef = useRef(loading);
  dataRef.current = data;
  loadingRef.current = loading;

  const fetchData = useCallback(async (key, fetchFn) => {
    if (!pubmedId) return;

    setLoading(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: null }));

    try {
      const result = await fetchFn(pubmedId);
      setData(prev => ({ ...prev, [key]: result }));
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [key]: error.response?.data?.detail || error.message
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [pubmedId]);

  // Fetch basic info on mount
  useEffect(() => {
    if (pubmedId) {
      fetchData('info', referenceApi.getReferenceInfo);
    }
  }, [pubmedId, fetchData]);

  // Lazy loaders for tab data - use refs for guards to keep stable identities
  const loadLocusDetails = useCallback(() => {
    if (!dataRef.current.locusDetails && !loadingRef.current.locusDetails) {
      fetchData('locusDetails', referenceApi.getLocusDetails);
    }
  }, [fetchData]);

  const loadGoDetails = useCallback(() => {
    if (!dataRef.current.goDetails && !loadingRef.current.goDetails) {
      fetchData('goDetails', referenceApi.getGoDetails);
    }
  }, [fetchData]);

  const loadPhenotypeDetails = useCallback(() => {
    if (!dataRef.current.phenotypeDetails && !loadingRef.current.phenotypeDetails) {
      fetchData('phenotypeDetails', referenceApi.getPhenotypeDetails);
    }
  }, [fetchData]);

  const loadInteractionDetails = useCallback(() => {
    if (!dataRef.current.interactionDetails && !loadingRef.current.interactionDetails) {
      fetchData('interactionDetails', referenceApi.getInteractionDetails);
    }
  }, [fetchData]);

  // Loaders object is now stable since all loader functions have stable identities
  const loaders = useMemo(() => ({
    loadLocusDetails,
    loadGoDetails,
    loadPhenotypeDetails,
    loadInteractionDetails,
  }), [
    loadLocusDetails,
    loadGoDetails,
    loadPhenotypeDetails,
    loadInteractionDetails,
  ]);

  return {
    data,
    loading,
    errors,
    loaders,
  };
}

export default useReferenceData;

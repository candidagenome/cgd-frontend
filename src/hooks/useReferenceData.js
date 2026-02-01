import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import referenceApi from '../api/referenceApi';

export function useReferenceData(pubmedId) {
  const [data, setData] = useState({
    info: null,
    locusDetails: null,
    goDetails: null,
    phenotypeDetails: null,
    interactionDetails: null,
    literatureTopics: null,
  });
  const [loading, setLoading] = useState({
    info: false,
    locusDetails: false,
    goDetails: false,
    phenotypeDetails: false,
    interactionDetails: false,
    literatureTopics: false,
  });
  const [errors, setErrors] = useState({});

  // Track which endpoints have been requested to prevent duplicate calls
  // This is updated synchronously BEFORE any async operation
  const requestedRef = useRef({});

  // Reset requested state when pubmedId changes
  useEffect(() => {
    requestedRef.current = {};
  }, [pubmedId]);

  const fetchData = useCallback(async (key, fetchFn) => {
    if (!pubmedId) return;

    // Synchronous guard - check and set in same operation
    if (requestedRef.current[key]) {
      return;
    }
    requestedRef.current[key] = true;

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
      // Allow retry on error
      requestedRef.current[key] = false;
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

  // Lazy loaders for tab data
  const loadLocusDetails = useCallback(() => {
    fetchData('locusDetails', referenceApi.getLocusDetails);
  }, [fetchData]);

  const loadGoDetails = useCallback(() => {
    fetchData('goDetails', referenceApi.getGoDetails);
  }, [fetchData]);

  const loadPhenotypeDetails = useCallback(() => {
    fetchData('phenotypeDetails', referenceApi.getPhenotypeDetails);
  }, [fetchData]);

  const loadInteractionDetails = useCallback(() => {
    fetchData('interactionDetails', referenceApi.getInteractionDetails);
  }, [fetchData]);

  const loadLiteratureTopics = useCallback(() => {
    fetchData('literatureTopics', referenceApi.getLiteratureTopics);
  }, [fetchData]);

  const loaders = useMemo(() => ({
    loadLocusDetails,
    loadGoDetails,
    loadPhenotypeDetails,
    loadInteractionDetails,
    loadLiteratureTopics,
  }), [
    loadLocusDetails,
    loadGoDetails,
    loadPhenotypeDetails,
    loadInteractionDetails,
    loadLiteratureTopics,
  ]);

  return {
    data,
    loading,
    errors,
    loaders,
  };
}

export default useReferenceData;

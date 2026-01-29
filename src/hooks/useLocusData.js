import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import locusApi from '../api/locusApi';

export function useLocusData(locusName) {
  const [data, setData] = useState({
    info: null,
    goDetails: null,
    phenotypeDetails: null,
    interactionDetails: null,
    proteinDetails: null,
    homologyDetails: null,
    sequenceDetails: null,
    references: null,
    summaryNotes: null,
    history: null,
  });
  const [loading, setLoading] = useState({
    info: false,
    goDetails: false,
    phenotypeDetails: false,
    interactionDetails: false,
    proteinDetails: false,
    homologyDetails: false,
    sequenceDetails: false,
    references: false,
    summaryNotes: false,
    history: false,
  });
  const [errors, setErrors] = useState({});

  // Use refs for state to keep loader identities stable
  // This prevents unnecessary re-renders and infinite API call loops
  const dataRef = useRef(data);
  const loadingRef = useRef(loading);

  // Keep refs in sync with state
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const fetchData = useCallback(async (key, fetchFn) => {
    if (!locusName) return;

    setLoading(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: null }));

    try {
      const result = await fetchFn(locusName);
      setData(prev => ({ ...prev, [key]: result }));
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [key]: error.response?.data?.detail || error.message
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [locusName]);

  // Fetch basic info on mount
  useEffect(() => {
    if (locusName) {
      fetchData('info', locusApi.getLocusInfo);
    }
  }, [locusName, fetchData]);

  // Lazy loaders for tab data - use refs for guards to keep stable identities
  const loadGoDetails = useCallback(() => {
    if (!dataRef.current.goDetails && !loadingRef.current.goDetails) {
      fetchData('goDetails', locusApi.getGoDetails);
    }
  }, [fetchData]);

  const loadPhenotypeDetails = useCallback(() => {
    if (!dataRef.current.phenotypeDetails && !loadingRef.current.phenotypeDetails) {
      fetchData('phenotypeDetails', locusApi.getPhenotypeDetails);
    }
  }, [fetchData]);

  // Load GO, Phenotype, and Sequence details for Summary tab
  const loadSummaryData = useCallback(() => {
    if (!dataRef.current.goDetails && !loadingRef.current.goDetails) {
      fetchData('goDetails', locusApi.getGoDetails);
    }
    if (!dataRef.current.phenotypeDetails && !loadingRef.current.phenotypeDetails) {
      fetchData('phenotypeDetails', locusApi.getPhenotypeDetails);
    }
    if (!dataRef.current.sequenceDetails && !loadingRef.current.sequenceDetails) {
      fetchData('sequenceDetails', locusApi.getSequenceDetails);
    }
  }, [fetchData]);

  const loadInteractionDetails = useCallback(() => {
    if (!dataRef.current.interactionDetails && !loadingRef.current.interactionDetails) {
      fetchData('interactionDetails', locusApi.getInteractionDetails);
    }
  }, [fetchData]);

  const loadProteinDetails = useCallback(() => {
    if (!dataRef.current.proteinDetails && !loadingRef.current.proteinDetails) {
      fetchData('proteinDetails', locusApi.getProteinDetails);
    }
  }, [fetchData]);

  const loadHomologyDetails = useCallback(() => {
    if (!dataRef.current.homologyDetails && !loadingRef.current.homologyDetails) {
      fetchData('homologyDetails', locusApi.getHomologyDetails);
    }
  }, [fetchData]);

  const loadSequenceDetails = useCallback(() => {
    if (!dataRef.current.sequenceDetails && !loadingRef.current.sequenceDetails) {
      fetchData('sequenceDetails', locusApi.getSequenceDetails);
    }
  }, [fetchData]);

  const loadReferences = useCallback(() => {
    if (!dataRef.current.references && !loadingRef.current.references) {
      fetchData('references', locusApi.getReferences);
    }
  }, [fetchData]);

  const loadSummaryNotes = useCallback(() => {
    if (!dataRef.current.summaryNotes && !loadingRef.current.summaryNotes) {
      fetchData('summaryNotes', locusApi.getSummaryNotes);
    }
  }, [fetchData]);

  const loadHistory = useCallback(() => {
    if (!dataRef.current.history && !loadingRef.current.history) {
      fetchData('history', locusApi.getHistory);
    }
  }, [fetchData]);

  // Loaders object is now stable since all loader functions have stable identities
  const loaders = useMemo(() => ({
    loadGoDetails,
    loadPhenotypeDetails,
    loadSummaryData,
    loadInteractionDetails,
    loadProteinDetails,
    loadHomologyDetails,
    loadSequenceDetails,
    loadReferences,
    loadSummaryNotes,
    loadHistory,
  }), [
    loadGoDetails,
    loadPhenotypeDetails,
    loadSummaryData,
    loadInteractionDetails,
    loadProteinDetails,
    loadHomologyDetails,
    loadSequenceDetails,
    loadReferences,
    loadSummaryNotes,
    loadHistory,
  ]);

  return {
    data,
    loading,
    errors,
    loaders,
  };
}

export default useLocusData;

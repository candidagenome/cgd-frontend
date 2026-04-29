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
    expressionDetails: null,
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
    expressionDetails: false,
  });
  const [errors, setErrors] = useState({});

  // Track which endpoints have been requested to prevent duplicate calls
  // This is updated synchronously BEFORE any async operation
  const requestedRef = useRef({});

  // Reset requested state and clear data when locusName changes
  useEffect(() => {
    requestedRef.current = {};
    // Clear all data when switching to a new locus
    setData({
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
      expressionDetails: null,
    });
    setErrors({});
  }, [locusName]);

  const fetchData = useCallback(async (key, fetchFn) => {
    if (!locusName) return;

    // Synchronous guard - check and set in same operation
    if (requestedRef.current[key]) {
      return;
    }
    requestedRef.current[key] = true;

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
      // Allow retry on error
      requestedRef.current[key] = false;
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

  // Lazy loaders for tab data
  const loadGoDetails = useCallback(() => {
    fetchData('goDetails', locusApi.getGoDetails);
  }, [fetchData]);

  const loadPhenotypeDetails = useCallback(() => {
    fetchData('phenotypeDetails', locusApi.getPhenotypeDetails);
  }, [fetchData]);

  const loadSummaryData = useCallback(() => {
    fetchData('goDetails', locusApi.getGoDetails);
    fetchData('phenotypeDetails', locusApi.getPhenotypeDetails);
    fetchData('sequenceDetails', locusApi.getSequenceDetails);
  }, [fetchData]);

  const loadInteractionDetails = useCallback(() => {
    fetchData('interactionDetails', locusApi.getInteractionDetails);
  }, [fetchData]);

  const loadProteinDetails = useCallback(() => {
    fetchData('proteinDetails', locusApi.getProteinDetails);
  }, [fetchData]);

  const loadHomologyDetails = useCallback(() => {
    fetchData('homologyDetails', locusApi.getHomologyDetails);
  }, [fetchData]);

  const loadSequenceDetails = useCallback(() => {
    fetchData('sequenceDetails', locusApi.getSequenceDetails);
  }, [fetchData]);

  const loadReferences = useCallback(() => {
    fetchData('references', locusApi.getReferences);
  }, [fetchData]);

  const loadSummaryNotes = useCallback(() => {
    fetchData('summaryNotes', locusApi.getSummaryNotes);
  }, [fetchData]);

  const loadHistory = useCallback(() => {
    fetchData('history', locusApi.getHistory);
  }, [fetchData]);

  const loadExpressionDetails = useCallback(() => {
    fetchData('expressionDetails', locusApi.getExpressionDetails);
  }, [fetchData]);

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
    loadExpressionDetails,
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
    loadExpressionDetails,
  ]);

  return {
    data,
    loading,
    errors,
    loaders,
  };
}

export default useLocusData;

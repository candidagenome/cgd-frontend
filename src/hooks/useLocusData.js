import { useState, useEffect, useCallback } from 'react';
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

  // Lazy loaders for tab data
  const loadGoDetails = useCallback(() => {
    if (!data.goDetails && !loading.goDetails) {
      fetchData('goDetails', locusApi.getGoDetails);
    }
  }, [data.goDetails, loading.goDetails, fetchData]);

  const loadPhenotypeDetails = useCallback(() => {
    if (!data.phenotypeDetails && !loading.phenotypeDetails) {
      fetchData('phenotypeDetails', locusApi.getPhenotypeDetails);
    }
  }, [data.phenotypeDetails, loading.phenotypeDetails, fetchData]);

  const loadInteractionDetails = useCallback(() => {
    if (!data.interactionDetails && !loading.interactionDetails) {
      fetchData('interactionDetails', locusApi.getInteractionDetails);
    }
  }, [data.interactionDetails, loading.interactionDetails, fetchData]);

  const loadProteinDetails = useCallback(() => {
    if (!data.proteinDetails && !loading.proteinDetails) {
      fetchData('proteinDetails', locusApi.getProteinDetails);
    }
  }, [data.proteinDetails, loading.proteinDetails, fetchData]);

  const loadHomologyDetails = useCallback(() => {
    if (!data.homologyDetails && !loading.homologyDetails) {
      fetchData('homologyDetails', locusApi.getHomologyDetails);
    }
  }, [data.homologyDetails, loading.homologyDetails, fetchData]);

  const loadSequenceDetails = useCallback(() => {
    if (!data.sequenceDetails && !loading.sequenceDetails) {
      fetchData('sequenceDetails', locusApi.getSequenceDetails);
    }
  }, [data.sequenceDetails, loading.sequenceDetails, fetchData]);

  const loadReferences = useCallback(() => {
    if (!data.references && !loading.references) {
      fetchData('references', locusApi.getReferences);
    }
  }, [data.references, loading.references, fetchData]);

  const loadSummaryNotes = useCallback(() => {
    if (!data.summaryNotes && !loading.summaryNotes) {
      fetchData('summaryNotes', locusApi.getSummaryNotes);
    }
  }, [data.summaryNotes, loading.summaryNotes, fetchData]);

  const loadHistory = useCallback(() => {
    if (!data.history && !loading.history) {
      fetchData('history', locusApi.getHistory);
    }
  }, [data.history, loading.history, fetchData]);

  return {
    data,
    loading,
    errors,
    loaders: {
      loadGoDetails,
      loadPhenotypeDetails,
      loadInteractionDetails,
      loadProteinDetails,
      loadHomologyDetails,
      loadSequenceDetails,
      loadReferences,
      loadSummaryNotes,
      loadHistory,
    },
  };
}

export default useLocusData;

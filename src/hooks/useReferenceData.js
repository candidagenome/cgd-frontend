import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Lazy loaders for tab data
  const loadLocusDetails = useCallback(() => {
    if (!data.locusDetails && !loading.locusDetails) {
      fetchData('locusDetails', referenceApi.getLocusDetails);
    }
  }, [data.locusDetails, loading.locusDetails, fetchData]);

  const loadGoDetails = useCallback(() => {
    if (!data.goDetails && !loading.goDetails) {
      fetchData('goDetails', referenceApi.getGoDetails);
    }
  }, [data.goDetails, loading.goDetails, fetchData]);

  const loadPhenotypeDetails = useCallback(() => {
    if (!data.phenotypeDetails && !loading.phenotypeDetails) {
      fetchData('phenotypeDetails', referenceApi.getPhenotypeDetails);
    }
  }, [data.phenotypeDetails, loading.phenotypeDetails, fetchData]);

  const loadInteractionDetails = useCallback(() => {
    if (!data.interactionDetails && !loading.interactionDetails) {
      fetchData('interactionDetails', referenceApi.getInteractionDetails);
    }
  }, [data.interactionDetails, loading.interactionDetails, fetchData]);

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

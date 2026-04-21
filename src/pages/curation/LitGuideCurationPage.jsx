/**
 * Literature Guide Curation Page
 *
 * Feature-centric literature curation interface.
 * - Search for features
 * - View curated and uncurated references
 * - Add/remove topic associations
 * - Set curation status
 *
 * Mirrors legacy LitGuideCurationPage.pm functionality.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import litguideCurationApi from '../../api/litguideCurationApi';
import { renderCitationItem, buildCitationLinks, CitationLinksBelow } from '../../utils/formatCitation';
import TopicAssignmentRow from '../../components/curation/TopicAssignmentRow';
import CVTreeModal from '../../components/curation/CVTreeModal';

function LitGuideCurationPage() {
  const { featureName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Organism state
  const [organisms, setOrganisms] = useState([]);
  const [currentOrganism, setCurrentOrganism] = useState(searchParams.get('organism') || null);

  // Search state
  const [featureSearch, setFeatureSearch] = useState('');
  const [pmidSearch, setPmidSearch] = useState('');
  const [pmidSearching, setPmidSearching] = useState(false);
  const [pmidError, setPmidError] = useState(null);
  const [refSearch, setRefSearch] = useState('');
  const [refSearchResults, setRefSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Feature and literature state (feature-centric view)
  const [featureData, setFeatureData] = useState(null);
  // Reference and literature state (reference-centric view)
  const [referenceData, setReferenceData] = useState(null);
  const [viewMode, setViewMode] = useState(null); // 'feature' or 'reference'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Available options
  const [topics, setTopics] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // Add feature form state (for reference view)
  const [newFeature, setNewFeature] = useState('');
  const [newFeatureTopic, setNewFeatureTopic] = useState('');

  // Unlink feature state (for reference view)
  const [unlinkFeature, setUnlinkFeature] = useState('');
  const [unlinking, setUnlinking] = useState(false);

  // Notes state (for reference view)
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // Non-gene topics state (for reference view)
  const [nongeneTopics, setNongeneTopics] = useState({ public_topics: [], internal_topics: [] });
  const [nongeneTopicsLoading, setNongeneTopicsLoading] = useState(false);
  const [nongeneTopicModalOpen, setNongeneTopicModalOpen] = useState(false);

  // Help section state
  const [showHelp, setShowHelp] = useState(false);

  // Bulk delete state
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Add topic form state
  const [selectedRef, setSelectedRef] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');

  // Topic assignment rows state (for "Assign Literature Guide Topics" section)
  const NUM_BLANK_ROWS = 2;
  const createEmptyRow = () => ({
    features: '',
    literatureTopics: [],
  });
  const [assignmentRows, setAssignmentRows] = useState(
    Array.from({ length: NUM_BLANK_ROWS }, createEmptyRow)
  );
  // Reference-level curation status (applies to entire paper, set once)
  const [refCurationStatus, setRefCurationStatus] = useState([]);
  const [refStatusModalOpen, setRefStatusModalOpen] = useState(false);
  const [submittingRefStatus, setSubmittingRefStatus] = useState(false);
  const [refStatusSuccess, setRefStatusSuccess] = useState(null);
  const [refStatusError, setRefStatusError] = useState(null);
  const [submittingAssignments, setSubmittingAssignments] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(null);
  const [assignmentError, setAssignmentError] = useState(null);

  // Edit existing topics state
  const [editRows, setEditRows] = useState([]);
  const [submittingEdits, setSubmittingEdits] = useState(false);
  const [editSuccess, setEditSuccess] = useState(null);
  const [editError, setEditError] = useState(null);
  // Modal state for edit section
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalRowIndex, setEditModalRowIndex] = useState(null);
  const [editModalType, setEditModalType] = useState(null); // 'literature_topic' or 'curation_status'

  // Load available topics, statuses, and organisms
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [topicsData, statusesData, organismsData] = await Promise.all([
          litguideCurationApi.getTopics(),
          litguideCurationApi.getStatuses(),
          litguideCurationApi.getOrganisms(),
        ]);
        setTopics(topicsData.topics);
        setStatuses(statusesData.statuses);
        const orgList = organismsData.organisms || [];
        setOrganisms(orgList);

        // Auto-select C. albicans as default if no organism is selected
        // This ensures we can see features from other species in the UI
        if (!currentOrganism && orgList.length > 0) {
          const calbicans = orgList.find((o) =>
            o.organism_abbrev?.toLowerCase().includes('sc5314') ||
            o.organism_name?.toLowerCase().includes('albicans')
          );
          if (calbicans) {
            setCurrentOrganism(calbicans.organism_abbrev);
          }
        }
      } catch (err) {
        console.error('Failed to load options:', err);
      }
    };

    loadOptions();
  }, []);

  // Load feature literature (feature-centric view)
  const loadFeatureLiterature = useCallback(async (identifier, organism = null) => {
    if (!identifier) return;

    setLoading(true);
    setError(null);
    setReferenceData(null);

    try {
      const data = await litguideCurationApi.getFeatureLiterature(identifier, organism);
      setFeatureData(data);
      setViewMode('feature');
    } catch (err) {
      if (err.response?.status === 404) {
        const orgText = organism ? ` in organism '${organism}'` : '';
        setError(`Feature '${identifier}' not found${orgText}`);
      } else {
        setError('Failed to load feature literature');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load reference literature (reference-centric view)
  const loadReferenceLiterature = useCallback(async (referenceNo, organism = null) => {
    if (!referenceNo) return;

    setLoading(true);
    setError(null);
    setFeatureData(null);

    try {
      const data = await litguideCurationApi.getReferenceLiterature(referenceNo, organism);
      setReferenceData(data);
      setViewMode('reference');
      // Update current organism from response if available
      if (data.current_organism) {
        setCurrentOrganism(data.current_organism.organism_abbrev);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Reference '${referenceNo}' not found`);
      } else {
        setError('Failed to load reference literature');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount based on featureName type
  // Numeric = reference view, otherwise = feature view
  useEffect(() => {
    if (featureName) {
      const orgParam = searchParams.get('organism');
      // Check if it's a pure numeric value (reference_no)
      if (/^\d+$/.test(featureName)) {
        loadReferenceLiterature(featureName, orgParam);
      } else {
        loadFeatureLiterature(featureName, orgParam);
      }
    }
  }, [featureName, searchParams, loadFeatureLiterature, loadReferenceLiterature]);

  // Handle organism change
  const handleOrganismChange = (newOrganism) => {
    setCurrentOrganism(newOrganism);
    if (newOrganism) {
      setSearchParams({ organism: newOrganism });
    } else {
      setSearchParams({});
    }
    if (referenceData?.reference_no) {
      loadReferenceLiterature(referenceData.reference_no, newOrganism);
    }
  };

  // Reload reference data when organism is auto-selected after initial load
  // This ensures other_organisms is populated when defaulting to C. albicans
  useEffect(() => {
    // Only reload if we have reference data loaded without organism filter
    // and an organism has been selected (auto or manual)
    if (
      referenceData?.reference_no &&
      currentOrganism &&
      !referenceData.current_organism
    ) {
      loadReferenceLiterature(referenceData.reference_no, currentOrganism);
    }
  }, [currentOrganism, referenceData?.reference_no, referenceData?.current_organism, loadReferenceLiterature]);

  // Load notes when reference data changes
  useEffect(() => {
    const loadNotes = async () => {
      if (!referenceData?.reference_no) {
        setNotes([]);
        return;
      }

      setNotesLoading(true);
      try {
        const data = await litguideCurationApi.getReferenceNotes(referenceData.reference_no);
        setNotes(data.notes || []);
      } catch (err) {
        console.error('Failed to load notes:', err);
        setNotes([]);
      } finally {
        setNotesLoading(false);
      }
    };

    loadNotes();
  }, [referenceData?.reference_no]);

  // Load non-gene topics when reference data changes
  useEffect(() => {
    const loadNongeneTopics = async () => {
      if (!referenceData?.reference_no) {
        setNongeneTopics({ public_topics: [], internal_topics: [] });
        return;
      }

      setNongeneTopicsLoading(true);
      try {
        const data = await litguideCurationApi.getNongeneTopics(referenceData.reference_no);
        setNongeneTopics(data);
      } catch (err) {
        console.error('Failed to load non-gene topics:', err);
        setNongeneTopics({ public_topics: [], internal_topics: [] });
      } finally {
        setNongeneTopicsLoading(false);
      }
    };

    loadNongeneTopics();
  }, [referenceData?.reference_no]);

  // Initialize edit rows when reference data changes
  useEffect(() => {
    if (!referenceData?.features?.length) {
      setEditRows([]);
      return;
    }

    // Group features by their topic combinations (same as Perl version)
    const groups = {};
    referenceData.features.forEach((feat) => {
      const litTopics = feat.topics
        .filter((t) => t.property_type === 'literature_topic')
        .map((t) => t.topic)
        .sort();
      const curationStatuses = feat.topics
        .filter((t) => t.property_type === 'curation_status')
        .map((t) => t.topic)
        .sort();
      const key = `${litTopics.join('|')}::${curationStatuses.join('|')}`;
      if (!groups[key]) {
        groups[key] = {
          features: [],
          featureNos: [], // Store feature_no for precise identification
          litTopics,
          curationStatuses,
        };
      }
      groups[key].features.push(feat.gene_name || feat.feature_name);
      groups[key].featureNos.push(feat.feature_no);
    });

    // Convert groups to edit rows
    const rows = Object.values(groups).map((group) => ({
      features: group.features.join(' '),
      featureNos: [...group.featureNos], // Include feature_no array
      literatureTopics: [...group.litTopics],
      curationStatuses: [...group.curationStatuses],
      // Track original values for comparison
      originalFeatures: group.features.join(' '),
      originalFeatureNos: [...group.featureNos],
      originalLitTopics: [...group.litTopics],
      originalCurationStatuses: [...group.curationStatuses],
    }));

    setEditRows(rows);
  }, [referenceData?.features]);

  // Handle feature search
  const handleFeatureSearch = (e) => {
    e.preventDefault();
    if (!featureSearch.trim()) return;
    let url = `/curation/litguide/${featureSearch.trim()}`;
    if (currentOrganism) {
      url += `?organism=${encodeURIComponent(currentOrganism)}`;
    }
    navigate(url);
  };

  // Handle PMID search
  const handlePmidSearch = async (e) => {
    e.preventDefault();
    const pmid = pmidSearch.trim();
    if (!pmid) return;

    setPmidSearching(true);
    setPmidError(null);

    try {
      // Search for the reference by PMID
      const data = await litguideCurationApi.searchReferences(pmid);
      if (data.references && data.references.length > 0) {
        // Find the exact PMID match
        const exactMatch = data.references.find(ref => ref.pubmed === pmid || ref.pubmed === parseInt(pmid, 10));
        if (exactMatch) {
          // Navigate to reference-centric view using reference_no
          navigate(`/curation/litguide/${exactMatch.reference_no}`);
        } else {
          // If no exact match, use the first result
          navigate(`/curation/litguide/${data.references[0].reference_no}`);
        }
      } else {
        setPmidError(`No reference found for PMID: ${pmid}`);
      }
    } catch (err) {
      setPmidError('Failed to search for PMID');
    } finally {
      setPmidSearching(false);
    }
  };

  // Handle reference search
  const handleRefSearch = async (e) => {
    e.preventDefault();
    if (!refSearch.trim()) return;

    setSearching(true);
    try {
      const data = await litguideCurationApi.searchReferences(refSearch);
      setRefSearchResults(data);
    } catch (err) {
      setError('Reference search failed');
    } finally {
      setSearching(false);
    }
  };

  // Handle add topic association
  const handleAddTopic = async () => {
    if (!selectedRef || !selectedTopic) return;

    try {
      await litguideCurationApi.addTopicAssociation(
        featureData.feature_no,
        selectedRef.reference_no,
        selectedTopic
      );
      setSuccessMessage(`Topic '${selectedTopic}' added`);
      setSelectedRef(null);
      setSelectedTopic('');
      setRefSearchResults(null);
      setRefSearch('');
      loadFeatureLiterature(featureData.feature_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add topic');
    }
  };

  // Handle remove topic association
  const handleRemoveTopic = async (refpropFeatNo) => {
    if (!window.confirm('Are you sure you want to remove this topic association?')) return;

    try {
      await litguideCurationApi.removeTopicAssociation(refpropFeatNo);
      setSuccessMessage('Topic association removed');
      loadFeatureLiterature(featureData.feature_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove topic');
    }
  };

  // Handle set curation status
  const handleSetStatus = async (referenceNo, status) => {
    try {
      await litguideCurationApi.setReferenceStatus(referenceNo, status);
      setSuccessMessage(`Curation status set to '${status}'`);
      if (viewMode === 'feature' && featureData) {
        loadFeatureLiterature(featureData.feature_no);
      } else if (viewMode === 'reference' && referenceData) {
        loadReferenceLiterature(referenceData.reference_no, currentOrganism);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to set status');
    }
  };

  // Handle add feature to reference (reference view)
  const handleAddFeatureToReference = async () => {
    if (!referenceData || !newFeature || !newFeatureTopic) return;

    try {
      await litguideCurationApi.addFeatureToReference(
        referenceData.reference_no,
        newFeature,
        newFeatureTopic
      );
      setSuccessMessage(`Feature '${newFeature}' added with topic '${newFeatureTopic}'`);
      setNewFeature('');
      setNewFeatureTopic('');
      loadReferenceLiterature(referenceData.reference_no, currentOrganism);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add feature');
    }
  };

  // Handle remove topic (works for both views)
  const handleRemoveTopicForReference = async (refpropFeatNo) => {
    if (!window.confirm('Are you sure you want to remove this topic association?')) return;

    try {
      await litguideCurationApi.removeTopicAssociation(refpropFeatNo);
      setSuccessMessage('Topic association removed');
      if (referenceData) {
        loadReferenceLiterature(referenceData.reference_no, currentOrganism);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove topic');
    }
  };

  // Handle unlink feature from reference
  const handleUnlinkFeature = async () => {
    if (!referenceData || !unlinkFeature.trim()) return;

    // Parse multiple features (separated by | or space)
    const featureNames = unlinkFeature
      .split(/[|\s]+/)
      .map((f) => f.trim())
      .filter((f) => f);

    if (featureNames.length === 0) return;

    const confirmMsg =
      featureNames.length === 1
        ? `Are you sure you want to unlink '${featureNames[0]}' from this paper?`
        : `Are you sure you want to unlink ${featureNames.length} features from this paper?\n\nFeatures: ${featureNames.join(', ')}`;

    if (!window.confirm(confirmMsg)) return;

    setUnlinking(true);
    setError(null);

    const results = { success: [], failed: [] };

    for (const featureName of featureNames) {
      try {
        const result = await litguideCurationApi.unlinkFeatureFromReference(
          referenceData.reference_no,
          featureName,
          currentOrganism
        );
        results.success.push(result.feature_name);
      } catch (err) {
        results.failed.push({
          name: featureName,
          error: err.response?.data?.detail || 'Unknown error',
        });
      }
    }

    setUnlinking(false);
    setUnlinkFeature('');

    if (results.success.length > 0) {
      setSuccessMessage(
        `Unlinked ${results.success.length} feature(s): ${results.success.join(', ')}`
      );
      loadReferenceLiterature(referenceData.reference_no, currentOrganism);
      setTimeout(() => setSuccessMessage(null), 5000);
    }

    if (results.failed.length > 0) {
      setError(
        `Failed to unlink: ${results.failed.map((f) => `${f.name} (${f.error})`).join('; ')}`
      );
    }
  };

  // Handle toggle selection for bulk delete
  const handleToggleDeleteSelection = (refpropFeatNo) => {
    setSelectedForDelete((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(refpropFeatNo)) {
        newSet.delete(refpropFeatNo);
      } else {
        newSet.add(refpropFeatNo);
      }
      return newSet;
    });
  };

  // Handle select all for bulk delete
  const handleSelectAllForDelete = () => {
    if (!referenceData?.features) return;
    const allIds = new Set();
    referenceData.features.forEach((feat) => {
      feat.topics.forEach((topic) => {
        allIds.add(topic.refprop_feat_no);
      });
    });
    setSelectedForDelete(allIds);
  };

  // Handle clear selection
  const handleClearSelection = () => {
    setSelectedForDelete(new Set());
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedForDelete.size === 0) return;

    const confirmMsg = `Are you sure you want to delete ${selectedForDelete.size} topic association(s)?`;
    if (!window.confirm(confirmMsg)) return;

    setBulkDeleting(true);
    setError(null);

    let successCount = 0;
    let failCount = 0;

    for (const refpropFeatNo of selectedForDelete) {
      try {
        await litguideCurationApi.removeTopicAssociation(refpropFeatNo);
        successCount++;
      } catch (err) {
        failCount++;
        console.error(`Failed to delete ${refpropFeatNo}:`, err);
      }
    }

    setBulkDeleting(false);
    setSelectedForDelete(new Set());
    setBulkDeleteMode(false);

    if (successCount > 0) {
      setSuccessMessage(`Deleted ${successCount} topic association(s)`);
      loadReferenceLiterature(referenceData.reference_no, currentOrganism);
      setTimeout(() => setSuccessMessage(null), 3000);
    }

    if (failCount > 0) {
      setError(`Failed to delete ${failCount} topic association(s)`);
    }
  };

  // Handle add non-gene topics from modal
  const handleAddNongeneTopics = async (selectedTopics) => {
    if (!referenceData || selectedTopics.length === 0) return;

    let addedCount = 0;
    const errors = [];

    for (const topic of selectedTopics) {
      try {
        await litguideCurationApi.addNongeneTopic(referenceData.reference_no, topic);
        addedCount++;
      } catch (err) {
        errors.push(`${topic}: ${err.response?.data?.detail || err.message}`);
      }
    }

    // Reload non-gene topics
    const data = await litguideCurationApi.getNongeneTopics(referenceData.reference_no);
    setNongeneTopics(data);

    if (addedCount > 0) {
      setSuccessMessage(`${addedCount} non-gene topic(s) added`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
    if (errors.length > 0) {
      setError(`Failed to add some topics: ${errors.join(', ')}`);
    }
  };

  // Handle remove non-gene topic
  const handleRemoveNongeneTopic = async (refPropertyNo, topicName) => {
    if (!window.confirm(`Are you sure you want to remove the topic '${topicName}'?`)) return;

    try {
      await litguideCurationApi.removeNongeneTopic(referenceData.reference_no, refPropertyNo);
      setSuccessMessage(`Non-gene topic '${topicName}' removed`);
      // Reload non-gene topics
      const data = await litguideCurationApi.getNongeneTopics(referenceData.reference_no);
      setNongeneTopics(data);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove non-gene topic');
    }
  };

  // Handle topic assignment row updates
  const updateAssignmentRow = (index, field, value) => {
    setAssignmentRows((prev) => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], [field]: value };
      return newRows;
    });
  };

  // Handle reference-level curation status change
  const handleRefStatusChange = (statuses) => {
    // Auto-remove "High Priority" when a "Done:" status is added
    const hasDoneStatus = statuses.some((s) => s.toLowerCase().startsWith('done'));
    if (hasDoneStatus) {
      setRefCurationStatus(statuses.filter((s) => s !== 'High Priority'));
    } else {
      setRefCurationStatus(statuses);
    }
  };

  // Submit reference-level curation status
  const handleSubmitRefStatus = async () => {
    if (!referenceData || refCurationStatus.length === 0) {
      setRefStatusError('Please select a curation status');
      return;
    }

    setSubmittingRefStatus(true);
    setRefStatusError(null);
    setRefStatusSuccess(null);

    try {
      // Set each selected status (typically just one)
      for (const status of refCurationStatus) {
        await litguideCurationApi.setReferenceStatus(referenceData.reference_no, status);
      }

      setRefStatusSuccess('Reference curation status updated');
      setTimeout(() => setRefStatusSuccess(null), 5000);

      // Reload reference data to reflect changes
      const data = await litguideCurationApi.getReferenceLiterature(
        referenceData.reference_no,
        currentOrganism
      );
      setReferenceData(data);
    } catch (err) {
      setRefStatusError(err.response?.data?.detail || 'Failed to update reference status');
    } finally {
      setSubmittingRefStatus(false);
    }
  };

  const addAssignmentRow = () => {
    setAssignmentRows((prev) => [...prev, createEmptyRow()]);
  };

  const removeAssignmentRow = (index) => {
    if (assignmentRows.length <= 1) return;
    setAssignmentRows((prev) => prev.filter((_, i) => i !== index));
  };

  const resetAssignmentRows = () => {
    setAssignmentRows(Array.from({ length: NUM_BLANK_ROWS }, createEmptyRow));
    setRefCurationStatus([]);
  };

  // Handle batch submit of topic assignments
  const handleSubmitAssignments = async () => {
    if (!referenceData) return;

    // Collect rows with features (for feature-level assignments)
    const rowsWithFeatures = assignmentRows.filter(
      (row) =>
        row.features.trim() &&
        (row.literatureTopics.length > 0 || row.curationStatuses.length > 0)
    );

    // Collect rows without features but with topics (nongene topics)
    const rowsWithNongeneTopics = assignmentRows.filter(
      (row) =>
        !row.features.trim() &&
        row.literatureTopics.length > 0
    );

    // Check: nongene topics require "not gene specific" status
    if (rowsWithNongeneTopics.length > 0 && !refCurationStatus.includes('not gene specific')) {
      setAssignmentError('Literature topics without features require the "not gene specific" curation status to be selected.');
      return;
    }

    // Check: must have something to submit
    const hasTopicsToAssign = rowsWithFeatures.length > 0 || rowsWithNongeneTopics.length > 0;
    const hasStatusToSet = refCurationStatus.length > 0;

    if (!hasTopicsToAssign && !hasStatusToSet) {
      setAssignmentError('Please enter at least one feature with topics, or select a curation status');
      return;
    }

    setSubmittingAssignments(true);
    setAssignmentError(null);
    setAssignmentSuccess(null);

    try {
      let totalSuccessful = 0;
      let totalFailed = 0;
      let refStatusSet = false;
      const errors = [];

      // Handle rows with features (feature-level topic assignments)
      for (const row of rowsWithFeatures) {
        // Parse features (split by space or |)
        const features = row.features
          .split(/[\s|]+/)
          .map((f) => f.trim())
          .filter((f) => f);

        if (features.length === 0) continue;

        const result = await litguideCurationApi.batchAssignTopics(
          referenceData.reference_no,
          features,
          row.literatureTopics,
          [], // curation status is now set at reference level, not per-row
          currentOrganism
        );

        totalSuccessful += result.successful;
        totalFailed += result.failed;

        // Collect any errors
        result.results
          .filter((r) => !r.success)
          .forEach((r) => errors.push(`${r.feature}/${r.topic}: ${r.message}`));
      }

      // Handle nongene topics (topics without features)
      for (const row of rowsWithNongeneTopics) {
        for (const topic of row.literatureTopics) {
          try {
            await litguideCurationApi.addNongeneTopic(referenceData.reference_no, topic);
            totalSuccessful++;
          } catch (err) {
            errors.push(`Failed to add nongene topic '${topic}': ${err.response?.data?.detail || err.message}`);
            totalFailed++;
          }
        }
      }

      // Set reference-level curation status (once for the entire paper)
      for (const status of refCurationStatus) {
        try {
          await litguideCurationApi.setReferenceStatus(referenceData.reference_no, status);
          refStatusSet = true;
        } catch (err) {
          errors.push(`Failed to set reference status '${status}': ${err.response?.data?.detail || err.message}`);
          totalFailed++;
        }
      }

      const messages = [];
      if (totalSuccessful > 0) {
        messages.push(`${totalSuccessful} topic association(s) added`);
      }
      if (refStatusSet) {
        messages.push('Reference curation status updated');
      }

      if (messages.length > 0) {
        setAssignmentSuccess(messages.join('. '));
        // Reload reference data
        const data = await litguideCurationApi.getReferenceLiterature(
          referenceData.reference_no,
          currentOrganism
        );
        setReferenceData(data);
        // Reset form
        resetAssignmentRows();
        setTimeout(() => setAssignmentSuccess(null), 5000);
      }

      if (totalFailed > 0) {
        setAssignmentError(
          `${totalFailed} assignment(s) failed:\n${errors.slice(0, 5).join('\n')}${
            errors.length > 5 ? `\n...and ${errors.length - 5} more` : ''
          }`
        );
      }
    } catch (err) {
      setAssignmentError(err.response?.data?.detail || 'Failed to submit topic assignments');
    } finally {
      setSubmittingAssignments(false);
    }
  };

  // Handle edit row updates
  const updateEditRow = (index, field, value) => {
    setEditRows((prev) => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], [field]: value };
      return newRows;
    });
  };

  // Handle submit of edit changes
  const handleSubmitEdits = async () => {
    if (!referenceData) return;

    setSubmittingEdits(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      let totalAdded = 0;
      let totalRemoved = 0;
      const errors = [];

      for (const row of editRows) {
        // Parse current features from the textarea (space or | separated)
        const currentFeatureNames = row.features
          .split(/[\s|]+/)
          .map((f) => f.trim())
          .filter((f) => f.length > 0);

        // Get original feature names
        const originalFeatureNames = row.originalFeatures
          .split(/[\s|]+/)
          .map((f) => f.trim())
          .filter((f) => f.length > 0);

        // Find features to add (in current but not in original)
        const featuresToAdd = currentFeatureNames.filter(
          (f) => !originalFeatureNames.some((o) => o.toLowerCase() === f.toLowerCase())
        );

        // Find features to remove (in original but not in current)
        const featuresToRemove = originalFeatureNames.filter(
          (f) => !currentFeatureNames.some((c) => c.toLowerCase() === f.toLowerCase())
        );

        // Handle removed features - unlink them
        for (const featName of featuresToRemove) {
          try {
            await litguideCurationApi.unlinkFeatureFromReference(
              referenceData.reference_no,
              featName,
              currentOrganism
            );
            totalRemoved++;
          } catch (err) {
            errors.push(`Failed to unlink ${featName}: ${err.message}`);
          }
        }

        // Handle added features - assign existing topics to them
        if (featuresToAdd.length > 0 && row.literatureTopics.length > 0) {
          try {
            const result = await litguideCurationApi.batchAssignTopics(
              referenceData.reference_no,
              featuresToAdd,
              row.literatureTopics,
              [], // No curation statuses at feature level anymore
              currentOrganism
            );
            totalAdded += result.successful;
          } catch (err) {
            errors.push(`Failed to add topics for new features: ${err.message}`);
          }
        }

        // Use remaining feature_no array for topic changes (only original features that weren't removed)
        const remainingFeatureNos = (row.originalFeatureNos || []).filter((no, idx) => {
          const name = originalFeatureNames[idx];
          return !featuresToRemove.some((f) => f.toLowerCase() === name?.toLowerCase());
        });
        const featureIdentifiers = remainingFeatureNos.map((no) => String(no));

        // Find topics to add (in current but not in original)
        const topicsToAdd = [
          ...row.literatureTopics.filter((t) => !row.originalLitTopics.includes(t)),
          ...row.curationStatuses.filter((t) => !row.originalCurationStatuses.includes(t)),
        ];

        // Find topics to remove (in original but not in current)
        const litTopicsToRemove = row.originalLitTopics.filter(
          (t) => !row.literatureTopics.includes(t)
        );
        const statusesToRemove = row.originalCurationStatuses.filter(
          (t) => !row.curationStatuses.includes(t)
        );

        // Add new topics using feature_no for precise identification
        if (topicsToAdd.length > 0 && featureIdentifiers.length > 0) {
          try {
            const result = await litguideCurationApi.batchAssignTopics(
              referenceData.reference_no,
              featureIdentifiers,
              row.literatureTopics.filter((t) => !row.originalLitTopics.includes(t)),
              row.curationStatuses.filter((t) => !row.originalCurationStatuses.includes(t)),
              currentOrganism
            );
            totalAdded += result.successful;
          } catch (err) {
            errors.push(`Failed to add topics: ${err.message}`);
          }
        }

        // Remove old topics - need to find the refprop_feat_no for each
        // This requires looking up the feature-topic associations
        for (const topic of [...litTopicsToRemove, ...statusesToRemove]) {
          // Find features with this topic and remove the association
          for (const feat of referenceData.features) {
            // Use feature_no for precise matching
            if (row.originalFeatureNos?.includes(feat.feature_no)) {
              const topicAssoc = feat.topics.find((t) => t.topic === topic);
              if (topicAssoc) {
                try {
                  await litguideCurationApi.removeTopicAssociation(topicAssoc.refprop_feat_no);
                  totalRemoved++;
                } catch (err) {
                  const featName = feat.gene_name || feat.feature_name;
                  errors.push(`Failed to remove ${topic} from ${featName}: ${err.message}`);
                }
              }
            }
          }
        }
      }

      if (totalAdded > 0 || totalRemoved > 0) {
        setEditSuccess(
          `Changes saved: ${totalAdded} topic(s) added, ${totalRemoved} topic(s) removed`
        );
        // Reload reference data
        const data = await litguideCurationApi.getReferenceLiterature(
          referenceData.reference_no,
          currentOrganism
        );
        setReferenceData(data);
        setTimeout(() => setEditSuccess(null), 5000);
      } else if (errors.length === 0) {
        setEditSuccess('No changes to save');
        setTimeout(() => setEditSuccess(null), 3000);
      }

      if (errors.length > 0) {
        setEditError(errors.slice(0, 5).join('\n'));
      }
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Failed to save changes');
    } finally {
      setSubmittingEdits(false);
    }
  };

  // Handle opening the edit modal
  const openEditModal = (rowIndex, type) => {
    setEditModalRowIndex(rowIndex);
    setEditModalType(type);
    setEditModalOpen(true);
  };

  // Handle closing the edit modal
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditModalRowIndex(null);
    setEditModalType(null);
  };

  // Handle selecting terms in the edit modal
  const handleEditModalSelect = (selectedTerms) => {
    if (editModalRowIndex === null || !editModalType) return;

    setEditRows((prev) => {
      const newRows = [...prev];
      if (editModalType === 'literature_topic') {
        newRows[editModalRowIndex] = {
          ...newRows[editModalRowIndex],
          literatureTopics: selectedTerms,
        };
      } else if (editModalType === 'curation_status') {
        // Auto-remove "High Priority" when a "Done:" status is added
        let finalStatuses = selectedTerms;
        const hasDoneStatus = selectedTerms.some((s) => s.toLowerCase().startsWith('done'));
        if (hasDoneStatus) {
          finalStatuses = selectedTerms.filter((s) => s !== 'High Priority');
        }
        newRows[editModalRowIndex] = {
          ...newRows[editModalRowIndex],
          curationStatuses: finalStatuses,
        };
      }
      return newRows;
    });
  };

  // Handle removing a topic from an edit row
  const removeEditTopic = (rowIndex, topicToRemove, type) => {
    setEditRows((prev) => {
      const newRows = [...prev];
      if (type === 'literature_topic') {
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          literatureTopics: newRows[rowIndex].literatureTopics.filter(
            (t) => t !== topicToRemove
          ),
        };
      } else if (type === 'curation_status') {
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          curationStatuses: newRows[rowIndex].curationStatuses.filter(
            (t) => t !== topicToRemove
          ),
        };
      }
      return newRows;
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Literature Guide Curation</h1>
        <div style={styles.headerRight}>
          <span>Curator: {user?.first_name} {user?.last_name}</span>
          <Link to="/curation/litguide/todo" style={styles.headerLink}>
            LitGuide Todo
          </Link>
          <Link to="/curation" style={styles.headerLink}>
            Curator Central
          </Link>
        </div>
      </div>

      {successMessage && <div style={styles.success}>{successMessage}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* Help Section */}
      <div style={styles.helpSection}>
        <button
          onClick={() => setShowHelp(!showHelp)}
          style={styles.helpToggle}
        >
          {showHelp ? '▼ Hide Help' : '► Show Help'}
        </button>
        {showHelp && (
          <div style={styles.helpContent}>
            <h4 style={styles.helpTitle}>Literature Guide Curation Help</h4>
            <ul style={styles.helpList}>
              <li>
                <strong>Feature Search:</strong> Enter a gene name or ORF name to view literature
                associated with that feature.
              </li>
              <li>
                <strong>PMID Search:</strong> Enter a PubMed ID to view and curate that reference directly.
              </li>
              <li>
                <strong>Adding Topics:</strong> Use the dropdown menus to select literature topics.
                Click "Add" to associate a topic with a feature-reference pair.
              </li>
              <li>
                <strong>Removing Topics:</strong> Click the "x" button next to any topic to remove
                the association.
              </li>
              <li>
                <strong>Non-Gene Topics:</strong> Topics can be associated with a reference without
                linking to a specific feature. Use the "Add Topic" dropdown in the non-gene topics section.
              </li>
              <li>
                <strong>Unlinking Features:</strong> To unlink a feature from a paper, enter the
                feature name(s) in the unlink box. Separate multiple features with spaces or | (pipe).
              </li>
              <li>
                <strong>Multi-Species:</strong> Use the organism dropdown to filter features by species.
                Features from other species are shown in a separate read-only section - click the
                species name to switch context.
              </li>
              <li>
                <strong>Curation Status:</strong> Set the curation status using the dropdown to track
                progress (e.g., "Not Yet Curated", "High Priority", "Done: Curated").
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div style={styles.searchSection}>
        {/* Species Selector */}
        <div style={styles.speciesSelectorRow}>
          <label style={styles.speciesLabel}>Species:</label>
          <select
            value={currentOrganism || ''}
            onChange={(e) => handleOrganismChange(e.target.value || null)}
            style={styles.speciesSelect}
          >
            <option value="">Select species...</option>
            {organisms.map((org) => (
              <option key={org.organism_abbrev} value={org.organism_abbrev}>
                {org.organism_name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.searchRow}>
          {/* Feature Search */}
          <div style={styles.searchBox}>
            <h3>Find Feature</h3>
            <form onSubmit={handleFeatureSearch} style={styles.searchForm}>
              <input
                type="text"
                value={featureSearch}
                onChange={(e) => setFeatureSearch(e.target.value)}
                placeholder="Enter feature name or gene name..."
                style={styles.searchInput}
              />
              <button type="submit" style={styles.searchButton}>
                Search
              </button>
            </form>
          </div>

          {/* PMID Search */}
          <div style={styles.searchBox}>
            <h3>Find by PMID</h3>
            <form onSubmit={handlePmidSearch} style={styles.searchForm}>
              <input
                type="text"
                value={pmidSearch}
                onChange={(e) => setPmidSearch(e.target.value)}
                placeholder="Enter PMID..."
                style={styles.searchInput}
              />
              <button type="submit" disabled={pmidSearching} style={styles.searchButton}>
                {pmidSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
            {pmidError && <div style={styles.searchError}>{pmidError}</div>}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && <div style={styles.loading}>Loading...</div>}

      {/* Feature Literature (feature-centric view) */}
      {viewMode === 'feature' && featureData && !loading && (
        <div style={styles.featureSection}>
          <div style={styles.featureHeader}>
            <h2>
              {featureData.feature_name}
              {featureData.gene_name && ` (${featureData.gene_name})`}
            </h2>
            <Link to={`/locus/${featureData.feature_name}`} style={styles.headerLink}>
              View Locus Page
            </Link>
          </div>

          {/* Add Topic Association */}
          <div style={styles.addSection}>
            <h3 style={styles.sectionHeader}>Add Literature Topic</h3>

            {/* Reference Search */}
            <div style={styles.refSearchRow}>
              <form onSubmit={handleRefSearch} style={styles.searchForm}>
                <input
                  type="text"
                  value={refSearch}
                  onChange={(e) => setRefSearch(e.target.value)}
                  placeholder="Search by PubMed ID, title, or citation..."
                  style={styles.searchInput}
                />
                <button type="submit" disabled={searching} style={styles.searchButton}>
                  {searching ? 'Searching...' : 'Find Reference'}
                </button>
              </form>
            </div>

            {/* Reference Search Results */}
            {refSearchResults && (
              <div style={styles.refResults}>
                <h4>Select Reference ({refSearchResults.total} found)</h4>
                {refSearchResults.references.length === 0 ? (
                  <p>No references found.</p>
                ) : (
                  <div style={styles.refList}>
                    {refSearchResults.references.slice(0, 20).map((ref) => (
                      <div
                        key={ref.reference_no}
                        style={{
                          ...styles.refItem,
                          backgroundColor: selectedRef?.reference_no === ref.reference_no ? '#e6f3ff' : 'transparent',
                        }}
                        onClick={() => setSelectedRef(ref)}
                      >
                        <strong>
                          {ref.pubmed ? `PMID:${ref.pubmed}` : `Ref:${ref.reference_no}`}
                        </strong>
                        <span style={styles.refYear}>({ref.year || 'N/A'})</span>
                        <div style={styles.refTitle}>{ref.title || ref.citation}</div>
                        {ref.curation_status && (
                          <span style={styles.refStatus}>{ref.curation_status}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => setRefSearchResults(null)} style={styles.closeButton}>
                  Close
                </button>
              </div>
            )}

            {/* Selected Reference and Topic */}
            {selectedRef && (
              <div style={styles.selectedRefBox}>
                <p>
                  <strong>Selected:</strong>{' '}
                  {selectedRef.pubmed ? `PMID:${selectedRef.pubmed}` : `Ref:${selectedRef.reference_no}`}
                  {' - '}{selectedRef.title || selectedRef.citation}
                </p>
                <div style={styles.topicSelectRow}>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    style={styles.topicSelect}
                  >
                    <option value="">Select topic...</option>
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddTopic}
                    disabled={!selectedTopic}
                    style={styles.addButton}
                  >
                    Add Topic Association
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRef(null);
                      setSelectedTopic('');
                    }}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Curated Literature */}
          <div style={styles.literatureSection}>
            <h3 style={styles.sectionHeader}>
              Curated Literature ({featureData.curated?.length || 0})
            </h3>

            {featureData.curated?.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Reference</th>
                    <th style={styles.th}>Topics</th>
                    <th style={styles.thAction}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {featureData.curated.map((ref) => (
                      <tr key={ref.reference_no}>
                        <td style={styles.td}>
                          {renderCitationItem(ref, { itemClassName: '' })}
                        </td>
                        <td style={styles.td}>
                          {ref.topics.map((topic) => (
                            <div key={topic.refprop_feat_no} style={styles.topicTag}>
                              {topic.topic}
                              <button
                                onClick={() => handleRemoveTopic(topic.refprop_feat_no)}
                                style={styles.removeTopicBtn}
                                title="Remove topic"
                              >
                                x
                              </button>
                            </div>
                          ))}
                        </td>
                        <td style={styles.tdAction}>
                          <Link
                            to={`/curation/litguide/${ref.reference_no}${currentOrganism ? `?organism=${currentOrganism}` : ''}`}
                            style={styles.curateLink}
                          >
                            Curate
                          </Link>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.noItems}>No curated literature.</p>
            )}
          </div>

          {/* Uncurated Literature */}
          <div style={styles.literatureSection}>
            <h3 style={styles.sectionHeader}>
              Uncurated Literature ({featureData.uncurated?.length || 0})
            </h3>

            {featureData.uncurated?.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Reference</th>
                    <th style={styles.th}>Actions</th>
                    <th style={styles.thAction}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {featureData.uncurated.map((ref) => (
                      <tr key={ref.reference_no}>
                        <td style={styles.td}>
                          {renderCitationItem(ref, { itemClassName: '' })}
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => {
                              setSelectedRef(ref);
                              setRefSearchResults(null);
                            }}
                            style={styles.actionButton}
                          >
                            Add Topic
                          </button>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleSetStatus(ref.reference_no, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            style={styles.statusSelect}
                            defaultValue=""
                          >
                            <option value="">Set Status...</option>
                            {statuses.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td style={styles.tdAction}>
                          <Link
                            to={`/curation/litguide/${ref.reference_no}${currentOrganism ? `?organism=${currentOrganism}` : ''}`}
                            style={styles.curateLink}
                          >
                            Curate
                          </Link>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.noItems}>No uncurated literature.</p>
            )}
          </div>
        </div>
      )}

      {/* Reference-centric View */}
      {viewMode === 'reference' && referenceData && !loading && (
        <div style={styles.referenceSection}>
          <div style={styles.referenceHeader}>
            <h2>
              {referenceData.pubmed ? `PMID:${referenceData.pubmed}` : `Reference ${referenceData.reference_no}`}
              <span style={styles.refYear}> ({referenceData.year || 'N/A'})</span>
            </h2>
            <div style={styles.headerActions}>
              {/* Organism Selector */}
              <div style={styles.organismSelector}>
                <label style={styles.organismLabel}>Organism:</label>
                <select
                  value={currentOrganism || ''}
                  onChange={(e) => handleOrganismChange(e.target.value || null)}
                  style={styles.organismSelect}
                >
                  <option value="">All Species</option>
                  {organisms.map((org) => (
                    <option key={org.organism_abbrev} value={org.organism_abbrev}>
                      {org.organism_name}
                    </option>
                  ))}
                </select>
              </div>
              <Link to={`/reference/${referenceData.reference_no}`} style={styles.headerLink}>
                View Reference Page
              </Link>
              <Link to={`/curation/reference/${referenceData.reference_no}`} style={styles.headerLink}>
                Reference Curation
              </Link>
            </div>
          </div>

          {/* In-Page Navigation */}
          <div style={styles.inPageNav}>
            <a href="#AddFeature" style={styles.navLink}>Add Feature</a>
            {' | '}
            <a href="#NongeneTopics" style={styles.navLink}>Non-Gene Topics</a>
            {' | '}
            <a href="#Features" style={styles.navLink}>Features</a>
            {' | '}
            <a href="#Notes" style={styles.navLink}>Notes</a>
            {' | '}
            <Link to={`/curation/phenotype?query=`} style={styles.navLink}>Curate Phenotype</Link>
            {' | '}
            <Link to={`/curation/go`} style={styles.navLink}>Curate GO</Link>
          </div>

          {/* Reference Details / Abstract */}
          <div style={styles.abstractSection}>
            <h3 style={styles.abstractHeader}>Abstract</h3>
            <div style={styles.abstractContent}>
              <p>{referenceData.citation || 'N/A'}</p>
              <CitationLinksBelow
                links={buildCitationLinks({
                  dbxref_id: referenceData.dbxref_id,
                  reference_no: referenceData.reference_no,
                  pubmed: referenceData.pubmed,
                  urls: referenceData.urls,
                })}
              />
              <p style={styles.refIdentifiers}>
                (CGD:{referenceData.reference_no}, PMID:{referenceData.pubmed || 'N/A'}, CGDID:{referenceData.dbxref_id || 'N/A'})
              </p>
              {referenceData.abstract ? (
                <blockquote style={styles.abstractText}>{referenceData.abstract}</blockquote>
              ) : (
                <p style={styles.noAbstract}>No abstract available.</p>
              )}
            </div>
          </div>

          {/* Features Linked to this Paper - Summary Section */}
          {(() => {
            // Categorize features based on topic property_type
            const publicCurated = [];
            const notYetCurated = [];
            const internalCurated = [];

            referenceData.features?.forEach((feat) => {
              const displayName = feat.gene_name || feat.feature_name;
              const hasPublicTopic = feat.topics?.some(
                (t) => t.property_type === 'literature_topic' && t.topic !== 'Not yet curated'
              );
              const hasNotYetCurated = feat.topics?.some(
                (t) => t.topic === 'Not yet curated'
              );
              const hasInternalTopic = feat.topics?.some(
                (t) => t.property_type === 'curation_status' && t.topic !== 'Not yet curated'
              );

              if (hasPublicTopic && !publicCurated.includes(displayName)) {
                publicCurated.push(displayName);
              }
              if (hasNotYetCurated && !notYetCurated.includes(displayName)) {
                notYetCurated.push(displayName);
              }
              if (hasInternalTopic && !internalCurated.includes(displayName)) {
                internalCurated.push(displayName);
              }
            });

            const unlinkedFeatures = referenceData.unlinked_features || [];

            return (
              <div style={styles.featuresLinkedSection}>
                <h3 style={styles.featuresLinkedHeader}>Features Linked to this Paper</h3>
                <div style={styles.featuresLinkedContent}>
                  <div style={styles.featuresLinkedRow}>
                    <strong>Public Topics Curated for:</strong>{' '}
                    <span>
                      {publicCurated.length > 0
                        ? publicCurated.map((name, idx) => (
                            <span key={name}>
                              <Link to={`/locus/${name}`} style={styles.featureLinkInline}>
                                {name}
                              </Link>
                              {idx < publicCurated.length - 1 && ' | '}
                            </span>
                          ))
                        : <span style={styles.nothingYet}>nothing yet</span>
                      }
                    </span>
                  </div>
                  <div style={styles.featuresLinkedRowAlt}>
                    <strong>Not yet curated for:</strong>{' '}
                    <span>
                      {notYetCurated.length > 0
                        ? notYetCurated.map((name, idx) => (
                            <span key={name}>
                              <Link to={`/locus/${name}`} style={styles.featureLinkInline}>
                                {name}
                              </Link>
                              {idx < notYetCurated.length - 1 && ' | '}
                            </span>
                          ))
                        : <span style={styles.nothingYet}>nothing yet</span>
                      }
                    </span>
                  </div>
                  <div style={styles.featuresLinkedRowInternal}>
                    <strong>Internal Topics Curated for:</strong>{' '}
                    <span>
                      {internalCurated.length > 0
                        ? internalCurated.map((name, idx) => (
                            <span key={name}>
                              <Link to={`/locus/${name}`} style={styles.featureLinkInline}>
                                {name}
                              </Link>
                              {idx < internalCurated.length - 1 && ' | '}
                            </span>
                          ))
                        : <span style={styles.nothingYet}>nothing yet</span>
                      }
                    </span>
                  </div>
                  {referenceData.pubmed && unlinkedFeatures.length > 0 && (
                    <div style={styles.featuresLinkedRowUnlinked}>
                      <strong>Unlinked from:</strong>{' '}
                      <span>
                        {unlinkedFeatures.map((feat, idx) => (
                          <span key={feat.feature_no}>
                            <Link to={`/locus/${feat.feature_name}`} style={styles.featureLinkInline}>
                              {feat.gene_name || feat.feature_name}
                            </Link>
                            {idx < unlinkedFeatures.length - 1 && ' | '}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Unlink Feature Section */}
          {referenceData.pubmed && (
            <div style={styles.unlinkSection}>
              <h3 style={styles.unlinkHeader}>Unlink Feature from Paper</h3>
              <div style={styles.unlinkRow}>
                <input
                  type="text"
                  value={unlinkFeature}
                  onChange={(e) => setUnlinkFeature(e.target.value)}
                  placeholder="Feature name(s) to unlink..."
                  style={styles.unlinkInput}
                />
                <button
                  onClick={handleUnlinkFeature}
                  disabled={!unlinkFeature.trim() || unlinking}
                  style={styles.unlinkButton}
                >
                  {unlinking ? 'Unlinking...' : 'Unlink'}
                </button>
              </div>
              <p style={styles.unlinkHelp}>
                Separate multiple features with | or space. This will remove the link between the paper and feature(s), including any topic associations.
              </p>
            </div>
          )}

          {/* Reference Curation Status Section (standalone, applies to entire paper) */}
          <div style={styles.refStatusStandaloneSection}>
            <h3 style={styles.refStatusStandaloneHeader}>Reference Curation Status</h3>
            {refStatusSuccess && (
              <div style={styles.refStatusSuccessMsg}>{refStatusSuccess}</div>
            )}
            {refStatusError && (
              <div style={styles.refStatusErrorMsg}>{refStatusError}</div>
            )}
            <div style={styles.refStatusContent}>
              <button
                type="button"
                onClick={() => setRefStatusModalOpen(true)}
                style={styles.refStatusButton}
              >
                Select Status
              </button>
              <div style={styles.refStatusList}>
                {refCurationStatus.length > 0 ? (
                  refCurationStatus.map((status, idx) => (
                    <span key={idx} style={styles.refStatusItem}>
                      {status}
                      <button
                        type="button"
                        onClick={() => setRefCurationStatus(refCurationStatus.filter((_, i) => i !== idx))}
                        style={styles.refStatusRemoveBtn}
                      >
                        &times;
                      </button>
                    </span>
                  ))
                ) : (
                  <span style={styles.refStatusNone}>None selected</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSubmitRefStatus}
                disabled={submittingRefStatus || refCurationStatus.length === 0}
                style={styles.refStatusSubmitBtn}
              >
                {submittingRefStatus ? 'Saving...' : 'Save Status'}
              </button>
            </div>
            <p style={styles.refStatusHelp}>
              This status applies to the entire paper. Select &quot;not gene specific&quot; to add topics without features.
            </p>
            <CVTreeModal
              isOpen={refStatusModalOpen}
              onClose={() => setRefStatusModalOpen(false)}
              onSelect={handleRefStatusChange}
              cvName="curation_status"
              title="Select Reference Curation Status"
              selectedTerms={refCurationStatus}
            />
          </div>

          {/* Assign Literature Guide Topics Section */}
          <div id="Assign" style={styles.assignSection}>
            <h3 style={styles.assignHeader}>Assign Literature Guide Topics to this Paper</h3>
            {assignmentSuccess && (
              <div style={styles.assignSuccess}>{assignmentSuccess}</div>
            )}
            {assignmentError && (
              <div style={styles.assignError}>{assignmentError}</div>
            )}
            <p style={styles.assignHelp}>
              Separate multiple features by spaces or | (pipe). Topics will be applied to all
              listed features. Leave features empty to add non-gene topics.
            </p>
            <div style={styles.assignRows}>
              {assignmentRows.map((row, index) => (
                <TopicAssignmentRow
                  key={index}
                  features={row.features}
                  literatureTopics={row.literatureTopics}
                  onFeaturesChange={(value) => updateAssignmentRow(index, 'features', value)}
                  onLiteratureTopicsChange={(value) => updateAssignmentRow(index, 'literatureTopics', value)}
                  onRemove={() => removeAssignmentRow(index)}
                  showRemoveButton={assignmentRows.length > 1}
                  hideCurationStatus={true}
                />
              ))}
            </div>

            <div style={styles.assignButtons}>
              <button
                type="button"
                onClick={addAssignmentRow}
                style={styles.addRowBtn}
              >
                + Add Row
              </button>
              <button
                type="button"
                onClick={resetAssignmentRows}
                style={styles.resetBtn}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSubmitAssignments}
                disabled={submittingAssignments}
                style={styles.submitAssignBtn}
              >
                {submittingAssignments ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>

          {/* Edit Current Literature Guide Curation Topics */}
          {editRows.length > 0 && (
            <div id="Edit" style={styles.editTopicsSection}>
              <h3 style={styles.editTopicsHeader}>Edit Current Literature Guide Curation Topics</h3>

              {editSuccess && <div style={styles.editSuccess}>{editSuccess}</div>}
              {editError && <div style={styles.editError}>{editError}</div>}

              <div style={styles.editTopicsContent}>
                {editRows.map((row, idx) => (
                  <div key={idx} style={styles.editTopicsRow}>
                    <div style={styles.editTopicsRowContent}>
                      {/* Features (editable) */}
                      <div style={styles.editTopicsFeaturesSection}>
                        <label style={styles.editTopicsLabel}>Features:</label>
                        <textarea
                          value={row.features}
                          onChange={(e) => updateEditRow(idx, 'features', e.target.value)}
                          placeholder="Enter feature names separated by space"
                          style={styles.editTopicsFeaturesTextarea}
                          rows={2}
                        />
                      </div>

                      {/* Literature Topics (editable) */}
                      <div style={styles.editTopicsListSection}>
                        <button
                          type="button"
                          onClick={() => openEditModal(idx, 'literature_topic')}
                          style={styles.editTopicsButton}
                        >
                          Literature Topics
                        </button>
                        <div style={styles.editTopicsListBox}>
                          {row.literatureTopics.length > 0 ? (
                            row.literatureTopics.map((topic, i) => (
                              <div key={i} style={styles.editTopicsItemEditable}>
                                {topic}
                                <button
                                  type="button"
                                  onClick={() => removeEditTopic(idx, topic, 'literature_topic')}
                                  style={styles.editTopicsRemoveBtn}
                                  title="Remove topic"
                                >
                                  &times;
                                </button>
                              </div>
                            ))
                          ) : (
                            <span style={styles.nothingYet}>none</span>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}

                <div style={styles.editTopicsActions}>
                  <button
                    type="button"
                    onClick={handleSubmitEdits}
                    disabled={submittingEdits}
                    style={styles.submitEditBtn}
                  >
                    {submittingEdits ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Edit Modal */}
              <CVTreeModal
                isOpen={editModalOpen}
                onClose={closeEditModal}
                onSelect={handleEditModalSelect}
                cvName={editModalType || 'literature_topic'}
                title={editModalType === 'curation_status' ? 'Select Curation Status' : 'Select Literature Topics'}
                selectedTerms={
                  editModalRowIndex !== null && editModalType
                    ? editModalType === 'literature_topic'
                      ? editRows[editModalRowIndex]?.literatureTopics || []
                      : editRows[editModalRowIndex]?.curationStatuses || []
                    : []
                }
              />
            </div>
          )}

          {/* Non-Gene Topics Section */}
          <div id="NongeneTopics" style={styles.nongeneSection}>
            <h3 style={styles.nongeneHeader}>
              Literature Topics Linked to this Paper (not associated with features)
              {nongeneTopicsLoading && <span style={styles.notesLoading}> (loading...)</span>}
            </h3>

            <div style={styles.nongeneContent}>
              {/* Public Topics */}
              <div style={styles.nongeneRow}>
                <strong style={styles.nongeneLabel}>Public Topics:</strong>
                <span style={styles.nongeneTopics}>
                  {nongeneTopics.public_topics.length > 0 ? (
                    nongeneTopics.public_topics.map((t, idx) => (
                      <span key={t.ref_property_no} style={styles.nongeneTopicTag}>
                        {t.topic}
                        <button
                          onClick={() => handleRemoveNongeneTopic(t.ref_property_no, t.topic)}
                          style={styles.removeTopicBtn}
                          title="Remove topic"
                        >
                          x
                        </button>
                        {idx < nongeneTopics.public_topics.length - 1 && ' | '}
                      </span>
                    ))
                  ) : (
                    <span style={styles.nothingYet}>nothing yet</span>
                  )}
                </span>
              </div>

              {/* Add Non-Gene Topic */}
              <div style={styles.addNongeneRow}>
                <span style={styles.nongeneLabel}>Add Topic:</span>
                <button
                  type="button"
                  onClick={() => setNongeneTopicModalOpen(true)}
                  style={styles.addNongeneBtn}
                >
                  Select Topics to Add
                </button>
              </div>

              <CVTreeModal
                isOpen={nongeneTopicModalOpen}
                onClose={() => setNongeneTopicModalOpen(false)}
                onSelect={handleAddNongeneTopics}
                cvName="literature_topic"
                title="Select Literature Topics to Add"
                selectedTerms={[]}
              />

              {/* Edit/Delete Reference Data Link */}
              <div style={styles.editRefRow}>
                Use the{' '}
                <Link
                  to={`/curation/reference/${referenceData.reference_no}`}
                  style={styles.editRefLink}
                >
                  Edit/Delete Reference Data
                </Link>
                {' '}page to delete specific database records or the entire reference and all associations.
              </div>
            </div>
          </div>

          {/* Features with Topics */}
          <div id="Features" style={styles.literatureSection}>
            <div style={styles.sectionHeaderRow}>
              <h3 style={styles.sectionHeaderInline}>
                {referenceData.current_organism
                  ? `Features from ${referenceData.current_organism.organism_name}`
                  : 'Associated Features'
                }
                {' '}({referenceData.features?.length || 0})
              </h3>
              {referenceData.features?.length > 0 && (
                <div style={styles.bulkDeleteControls}>
                  {bulkDeleteMode ? (
                    <>
                      <button onClick={handleSelectAllForDelete} style={styles.bulkBtn}>
                        Select All
                      </button>
                      <button onClick={handleClearSelection} style={styles.bulkBtn}>
                        Clear
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        disabled={selectedForDelete.size === 0 || bulkDeleting}
                        style={styles.bulkDeleteBtn}
                      >
                        {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedForDelete.size})`}
                      </button>
                      <button
                        onClick={() => {
                          setBulkDeleteMode(false);
                          setSelectedForDelete(new Set());
                        }}
                        style={styles.bulkCancelBtn}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setBulkDeleteMode(true)}
                      style={styles.bulkModeBtn}
                    >
                      Bulk Delete Mode
                    </button>
                  )}
                </div>
              )}
            </div>

            {referenceData.features?.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Feature</th>
                    <th style={styles.th}>Gene Name</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Topics</th>
                    <th style={styles.th}>Curate</th>
                  </tr>
                </thead>
                <tbody>
                  {referenceData.features.map((feat) => (
                    <tr key={feat.feature_no}>
                      <td style={styles.td}>
                        <Link to={`/locus/${feat.feature_name}`}>
                          {feat.feature_name}
                        </Link>
                      </td>
                      <td style={styles.td}>{feat.gene_name || '-'}</td>
                      <td style={styles.td}>{feat.feature_type || '-'}</td>
                      <td style={styles.td}>
                        {feat.topics.map((topic) => (
                          <div key={topic.refprop_feat_no} style={styles.topicTag}>
                            {bulkDeleteMode && (
                              <input
                                type="checkbox"
                                checked={selectedForDelete.has(topic.refprop_feat_no)}
                                onChange={() => handleToggleDeleteSelection(topic.refprop_feat_no)}
                                style={styles.bulkCheckbox}
                              />
                            )}
                            {topic.topic}
                            {!bulkDeleteMode && (
                              <button
                                onClick={() => handleRemoveTopicForReference(topic.refprop_feat_no)}
                                style={styles.removeTopicBtn}
                                title="Remove topic"
                              >
                                x
                              </button>
                            )}
                          </div>
                        ))}
                      </td>
                      <td style={styles.td}>
                        <Link
                          to={`/curation/phenotype/${feat.feature_name}`}
                          style={styles.curateLink}
                        >
                          Phenotype
                        </Link>
                        {' | '}
                        <Link
                          to={`/curation/go/${feat.feature_name}`}
                          style={styles.curateLink}
                        >
                          GO
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.noItems}>No features associated with this reference yet.</p>
            )}
          </div>

          {/* Other Species Section (only shown when organism is selected) */}
          {currentOrganism && referenceData.other_organisms && Object.keys(referenceData.other_organisms).length > 0 && (
            <div style={styles.otherSpeciesSection}>
              <h3 style={styles.otherSpeciesHeader}>
                Current Literature Guide Curation Topics to other species
              </h3>
              <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                (Click on the Species name to curate this reference for a different species)
              </p>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Species</th>
                    <th style={styles.th}>Features</th>
                    <th style={styles.th}>Literature Topics</th>
                    <th style={styles.th}>Curation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(referenceData.other_organisms).map((orgData) => (
                    <tr key={orgData.organism_abbrev}>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleOrganismChange(orgData.organism_abbrev)}
                          style={styles.speciesLink}
                          title={`Switch to ${orgData.organism_name}`}
                        >
                          <em>{orgData.organism_name}</em>
                        </button>
                      </td>
                      <td style={styles.td}>
                        {orgData.features.map((f, idx) => (
                          <span key={f.feature_no}>
                            {f.gene_name || f.feature_name}
                            {idx < orgData.features.length - 1 && ', '}
                          </span>
                        ))}
                      </td>
                      <td style={styles.td}>
                        {/* Literature topics from all features */}
                        {[...new Set(orgData.features.flatMap(f =>
                          f.topics.filter(t => t.property_type === 'literature_topic').map(t => t.topic)
                        ))].join(', ') || '-'}
                      </td>
                      <td style={styles.td}>
                        {/* Curation statuses from all features */}
                        {[...new Set(orgData.features.flatMap(f =>
                          f.topics.filter(t => t.property_type === 'curation_status').map(t => t.topic)
                        ))].join(', ') || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Associated Notes Section */}
          <div id="Notes" style={styles.notesSection}>
            <h3 style={styles.notesHeader}>
              Associated Notes
              {notesLoading && <span style={styles.notesLoading}> (loading...)</span>}
            </h3>

            {notes.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '15%' }}>Feature</th>
                    <th style={{ ...styles.th, width: '20%' }}>Topic</th>
                    <th style={{ ...styles.th, width: '65%' }}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{note.feature_name || '-'}</td>
                      <td style={styles.tdTopic}>{note.topic}</td>
                      <td style={styles.td}>{note.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.noItems}>
                {notesLoading ? 'Loading notes...' : 'No notes found.'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!featureData && !referenceData && !loading && !featureName && (
        <div style={styles.noFeature}>
          <p>Search for a feature above to begin literature curation.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '1rem auto',
    padding: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '2px solid #333',
    paddingBottom: '0.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.9rem',
  },
  headerLink: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    textDecoration: 'none',
    color: '#333',
  },
  success: {
    padding: '1rem',
    backgroundColor: '#efe',
    border: '1px solid #cfc',
    borderRadius: '4px',
    color: '#060',
    marginBottom: '1rem',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c00',
    marginBottom: '1rem',
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
  },
  searchSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  speciesSelectorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #ddd',
  },
  speciesLabel: {
    fontWeight: 'bold',
    fontSize: '0.95rem',
  },
  speciesSelect: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '250px',
  },
  searchRow: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: '300px',
  },
  searchError: {
    marginTop: '0.5rem',
    color: '#c00',
    fontSize: '0.9rem',
  },
  searchForm: {
    display: 'flex',
    gap: '0.5rem',
  },
  searchInput: {
    flex: 1,
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  searchButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  featureSection: {
    marginTop: '1rem',
  },
  featureHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  addSection: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  sectionHeader: {
    backgroundColor: '#e0e0e0',
    padding: '0.5rem',
    margin: '0 0 1rem 0',
    fontSize: '1rem',
  },
  refSearchRow: {
    marginBottom: '1rem',
  },
  refResults: {
    padding: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '1rem',
    maxHeight: '400px',
    overflow: 'auto',
  },
  refList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  refItem: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  refYear: {
    marginLeft: '0.5rem',
    color: '#666',
  },
  refTitle: {
    fontSize: '0.9rem',
    color: '#333',
    marginTop: '0.25rem',
  },
  refStatus: {
    fontSize: '0.8rem',
    color: '#666',
    fontStyle: 'italic',
  },
  closeButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  selectedRefBox: {
    padding: '1rem',
    backgroundColor: '#e6f3ff',
    border: '1px solid #99c9ff',
    borderRadius: '4px',
    marginTop: '1rem',
  },
  topicSelectRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    marginTop: '0.5rem',
  },
  topicSelect: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '200px',
  },
  addButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#999',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  literatureSection: {
    marginBottom: '1.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.5rem',
    borderBottom: '2px solid #333',
    backgroundColor: '#f5f5f5',
  },
  td: {
    padding: '0.5rem',
    borderBottom: '1px solid #ddd',
    verticalAlign: 'top',
  },
  tdAction: {
    padding: '0.5rem',
    borderBottom: '1px solid #ddd',
    verticalAlign: 'top',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  thAction: {
    textAlign: 'center',
    padding: '0.5rem',
    borderBottom: '2px solid #333',
    backgroundColor: '#f5f5f5',
    width: '80px',
  },
  citationLine: {
    marginBottom: '0.25rem',
  },
  pmidText: {
    color: '#666',
    fontSize: '0.9em',
  },
  topicTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#e6f3ff',
    border: '1px solid #99c9ff',
    borderRadius: '4px',
    marginRight: '0.5rem',
    marginBottom: '0.25rem',
    fontSize: '0.85rem',
  },
  removeTopicBtn: {
    background: 'none',
    border: 'none',
    color: '#c00',
    cursor: 'pointer',
    padding: '0 0.25rem',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
  actionButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginRight: '0.5rem',
    fontSize: '0.85rem',
  },
  curateLink: {
    color: '#337ab7',
    textDecoration: 'none',
    fontSize: '0.85rem',
  },
  statusSelect: {
    padding: '0.25rem',
    fontSize: '0.85rem',
    border: '1px solid #ccc',
    borderRadius: '3px',
  },
  noItems: {
    color: '#666',
    fontStyle: 'italic',
    padding: '1rem',
  },
  noFeature: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  },
  // Reference view styles
  referenceSection: {
    marginTop: '1rem',
  },
  referenceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  refDetailsBox: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  // Abstract section styles
  abstractSection: {
    marginBottom: '1.5rem',
  },
  abstractHeader: {
    backgroundColor: '#d9edf7',
    padding: '0.5rem',
    margin: '0 0 0.5rem 0',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  abstractContent: {
    padding: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  refLinks: {
    marginBottom: '0.5rem',
  },
  refEntryLink: {
    color: '#337ab7',
    textDecoration: 'none',
    marginRight: '1rem',
  },
  refIdentifiers: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
  },
  abstractText: {
    margin: '1rem 2rem',
    padding: '0.5rem',
    borderLeft: '3px solid #ccc',
    fontStyle: 'normal',
    color: '#333',
    lineHeight: '1.5',
  },
  noAbstract: {
    color: '#666',
    fontStyle: 'italic',
    margin: '1rem 0',
  },
  curationStatusRow: {
    marginTop: '1rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #eee',
  },
  // Features Linked to this Paper section
  featuresLinkedSection: {
    marginBottom: '1.5rem',
  },
  featuresLinkedHeader: {
    backgroundColor: '#d9edf7',
    padding: '0.5rem',
    margin: '0 0 0.5rem 0',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  featuresLinkedContent: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  featuresLinkedRow: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f5f5f5',
    fontSize: '0.9rem',
  },
  featuresLinkedRowAlt: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f5f5f5',
    fontSize: '0.9rem',
  },
  featuresLinkedRowInternal: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f9f9f9',
    fontSize: '0.9rem',
  },
  featuresLinkedRowUnlinked: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f0f0f0',
    fontSize: '0.9rem',
  },
  featureLinkInline: {
    color: '#337ab7',
    textDecoration: 'none',
  },
  // Assign Topics section styles
  assignSection: {
    marginBottom: '1.5rem',
  },
  assignHeader: {
    backgroundColor: '#d9edf7',
    padding: '0.5rem',
    margin: '0 0 0.5rem 0',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  assignHelp: {
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#fff',
  },
  assignSuccess: {
    padding: '0.75rem 1rem',
    marginBottom: '0.5rem',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
  },
  assignError: {
    padding: '0.75rem 1rem',
    marginBottom: '0.5rem',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    whiteSpace: 'pre-wrap',
  },
  assignRows: {
    marginBottom: '0.5rem',
  },
  refStatusSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    backgroundColor: '#f0f7ff',
    border: '1px solid #cce5ff',
    borderRadius: '4px',
    flexWrap: 'wrap',
  },
  refStatusLabel: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
  },
  refStatusButton: {
    padding: '0.4rem 0.75rem',
    fontSize: '0.85rem',
    backgroundColor: '#fff',
    border: '1px solid #007bff',
    borderRadius: '4px',
    color: '#007bff',
    cursor: 'pointer',
  },
  refStatusList: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  refStatusItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#e0e0e0',
    borderRadius: '3px',
    fontSize: '0.85rem',
  },
  refStatusRemoveBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#666',
    padding: '0 0.1rem',
    lineHeight: 1,
  },
  refStatusNone: {
    color: '#999',
    fontSize: '0.85rem',
    fontStyle: 'italic',
  },
  refStatusStandaloneSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f0f7ff',
    border: '1px solid #cce5ff',
    borderRadius: '8px',
  },
  refStatusStandaloneHeader: {
    margin: '0 0 0.75rem 0',
    fontSize: '1.1rem',
    color: '#004085',
    borderBottom: '1px solid #cce5ff',
    paddingBottom: '0.5rem',
  },
  refStatusContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  refStatusHelp: {
    margin: '0.5rem 0 0 0',
    fontSize: '0.85rem',
    color: '#666',
    width: '100%',
  },
  refStatusSubmitBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  refStatusSuccessMsg: {
    padding: '0.5rem',
    marginBottom: '0.5rem',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
  },
  refStatusErrorMsg: {
    padding: '0.5rem',
    marginBottom: '0.5rem',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
  },
  assignButtons: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  },
  addRowBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  resetBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  submitAssignBtn: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  // Edit Current Topics section
  editTopicsSection: {
    marginBottom: '1.5rem',
  },
  editTopicsHeader: {
    backgroundColor: '#d9edf7',
    padding: '0.5rem',
    margin: '0 0 0.5rem 0',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  editTopicsContent: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '0.5rem',
  },
  editTopicsRow: {
    padding: '0.75rem',
    backgroundColor: '#fafafa',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '0.5rem',
  },
  editTopicsRowContent: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  editTopicsFeaturesSection: {
    flex: '1 1 200px',
    minWidth: '200px',
  },
  editTopicsLabel: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
    fontSize: '0.9rem',
  },
  editTopicsFeaturesList: {
    padding: '0.5rem',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '0.9rem',
    minHeight: '2rem',
  },
  editTopicsFeaturesTextarea: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  editTopicsListSection: {
    flex: '1 1 150px',
    minWidth: '150px',
  },
  editTopicsListBox: {
    padding: '0.25rem',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minHeight: '60px',
    maxHeight: '100px',
    overflow: 'auto',
  },
  editTopicsItem: {
    padding: '0.2rem 0.4rem',
    margin: '0.1rem',
    backgroundColor: '#e8e8e8',
    borderRadius: '3px',
    fontSize: '0.85rem',
  },
  editTopicsNote: {
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic',
    marginTop: '0.5rem',
    marginBottom: 0,
  },
  editTopicsButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  editTopicsItemEditable: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.15rem 0.4rem',
    margin: '0.1rem',
    backgroundColor: '#e0e0e0',
    borderRadius: '3px',
    fontSize: '0.8rem',
  },
  editTopicsRemoveBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#666',
    padding: '0 0.1rem',
    lineHeight: 1,
  },
  editTopicsActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #ddd',
  },
  submitEditBtn: {
    padding: '0.5rem 1.5rem',
    fontSize: '0.9rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  editSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
  },
  editError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    whiteSpace: 'pre-wrap',
  },
  statusSelectInline: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginLeft: '0.5rem',
  },
  addFeatureRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  featureInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '200px',
  },
  // Unlink section styles
  unlinkSection: {
    padding: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  unlinkHeader: {
    backgroundColor: '#d9edf7',
    padding: '0.5rem',
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  unlinkRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  unlinkInput: {
    flex: 1,
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    maxWidth: '400px',
  },
  unlinkButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  unlinkHelp: {
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic',
  },
  // Notes section styles
  notesSection: {
    marginTop: '1.5rem',
  },
  notesHeader: {
    backgroundColor: '#d9edf7',
    padding: '0.5rem',
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  notesLoading: {
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: '#666',
  },
  tdTopic: {
    padding: '0.5rem',
    borderBottom: '1px solid #ddd',
    verticalAlign: 'top',
    fontSize: '0.85rem',
  },
  // Non-gene topics section styles
  nongeneSection: {
    marginBottom: '1.5rem',
  },
  nongeneHeader: {
    backgroundColor: '#d9edf7',
    padding: '0.5rem',
    margin: '0 0 0.5rem 0',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  nongeneContent: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  nongeneRow: {
    padding: '0.5rem',
    backgroundColor: '#f5f5f5',
    fontSize: '0.9rem',
  },
  nongeneRowInternal: {
    padding: '0.5rem',
    backgroundColor: '#f9f9f9',
    fontSize: '0.9rem',
  },
  nongeneLabel: {
    marginRight: '0.5rem',
  },
  nongeneTopics: {
    display: 'inline',
  },
  nongeneTopicTag: {
    display: 'inline',
  },
  nothingYet: {
    fontStyle: 'italic',
    color: '#666',
  },
  addNongeneRow: {
    padding: '0.5rem',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  nongeneSelect: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  addNongeneBtn: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  // Organism selector styles
  organismSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginRight: '1rem',
  },
  organismLabel: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
  organismSelect: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '180px',
  },
  // Other species section styles
  otherSpeciesSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  otherSpeciesHeader: {
    backgroundColor: '#e0e0e0',
    padding: '0.5rem',
    margin: '0 0 1rem 0',
    fontSize: '1rem',
  },
  speciesLink: {
    background: 'none',
    border: 'none',
    color: '#337ab7',
    cursor: 'pointer',
    padding: 0,
    fontSize: '0.9rem',
    textDecoration: 'underline',
  },
  // Edit/Delete reference link styles
  editRefRow: {
    padding: '0.5rem',
    backgroundColor: '#f0f0f0',
    fontSize: '0.85rem',
    color: '#666',
    borderTop: '1px solid #ddd',
  },
  editRefLink: {
    color: '#337ab7',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  // Help section styles
  helpSection: {
    marginBottom: '1rem',
  },
  helpToggle: {
    background: 'none',
    border: 'none',
    color: '#337ab7',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0.25rem 0',
  },
  helpContent: {
    padding: '1rem',
    backgroundColor: '#fffef0',
    border: '1px solid #e0d890',
    borderRadius: '4px',
    marginTop: '0.5rem',
  },
  helpTitle: {
    margin: '0 0 0.75rem 0',
    color: '#665500',
  },
  helpList: {
    margin: 0,
    paddingLeft: '1.5rem',
    lineHeight: '1.6',
    fontSize: '0.9rem',
  },
  // In-page navigation styles
  inPageNav: {
    padding: '0.5rem',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  navLink: {
    color: '#337ab7',
    textDecoration: 'none',
  },
  // Bulk delete styles
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    padding: '0.5rem',
    marginBottom: '0.5rem',
  },
  sectionHeaderInline: {
    margin: 0,
    fontSize: '1rem',
  },
  bulkDeleteControls: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  bulkModeBtn: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f0ad4e',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  bulkBtn: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#5bc0de',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  bulkDeleteBtn: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  bulkCancelBtn: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#777',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  bulkCheckbox: {
    marginRight: '0.25rem',
    cursor: 'pointer',
  },
};

export default LitGuideCurationPage;

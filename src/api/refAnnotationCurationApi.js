/**
 * Reference Annotation Curation API module for managing annotations linked to a reference.
 *
 * Requires curator authentication.
 */
import api from './config';

export const refAnnotationCurationApi = {
  /**
   * Get all annotations associated with a reference.
   *
   * @param {number} referenceNo - Reference number
   * @returns {Promise<Object>} Annotations grouped by type
   */
  getAnnotations: async (referenceNo) => {
    const response = await api.get(`/api/curation/reference-annotation/${referenceNo}`);
    return response.data;
  },

  /**
   * Delete a literature guide entry.
   *
   * @param {Object} data - Delete request data
   * @param {number} [data.refprop_feat_no] - RefpropFeat ID (for feature links)
   * @param {number} data.ref_property_no - RefProperty ID
   * @returns {Promise<Object>} Result with messages
   */
  deleteLitGuide: async (data) => {
    const response = await api.post('/api/curation/reference-annotation/lit-guide/delete', data);
    return response.data;
  },

  /**
   * Transfer a literature guide entry to another reference.
   *
   * @param {Object} data - Transfer request data
   * @param {number} [data.refprop_feat_no] - RefpropFeat ID (for feature links)
   * @param {number} data.ref_property_no - RefProperty ID
   * @param {number} data.new_reference_no - Target reference number
   * @returns {Promise<Object>} Result with messages
   */
  transferLitGuide: async (data) => {
    const response = await api.post('/api/curation/reference-annotation/lit-guide/transfer', data);
    return response.data;
  },

  /**
   * Delete a GO annotation entry.
   *
   * @param {number} goRefNo - GoRef ID
   * @returns {Promise<Object>} Result with messages
   */
  deleteGoRef: async (goRefNo) => {
    const response = await api.post('/api/curation/reference-annotation/go-ref/delete', {
      go_ref_no: goRefNo,
    });
    return response.data;
  },

  /**
   * Transfer a GO annotation to another reference.
   *
   * @param {number} goRefNo - GoRef ID
   * @param {number} newReferenceNo - Target reference number
   * @returns {Promise<Object>} Result with messages
   */
  transferGoRef: async (goRefNo, newReferenceNo) => {
    const response = await api.post('/api/curation/reference-annotation/go-ref/transfer', {
      go_ref_no: goRefNo,
      new_reference_no: newReferenceNo,
    });
    return response.data;
  },

  /**
   * Delete a REF_LINK entry.
   *
   * @param {number} refLinkNo - RefLink ID
   * @returns {Promise<Object>} Result with messages
   */
  deleteRefLink: async (refLinkNo) => {
    const response = await api.post('/api/curation/reference-annotation/ref-link/delete', {
      ref_link_no: refLinkNo,
    });
    return response.data;
  },

  /**
   * Transfer a REF_LINK entry to another reference.
   *
   * @param {number} refLinkNo - RefLink ID
   * @param {number} newReferenceNo - Target reference number
   * @returns {Promise<Object>} Result with messages
   */
  transferRefLink: async (refLinkNo, newReferenceNo) => {
    const response = await api.post('/api/curation/reference-annotation/ref-link/transfer', {
      ref_link_no: refLinkNo,
      new_reference_no: newReferenceNo,
    });
    return response.data;
  },

  /**
   * Bulk delete all annotations of a given type for a reference.
   *
   * @param {number} referenceNo - Reference number
   * @param {string} entryType - Entry type: 'lit_guide', 'go_annotation', or 'ref_link'
   * @returns {Promise<Object>} Result with count and messages
   */
  bulkDelete: async (referenceNo, entryType) => {
    const response = await api.post(
      `/api/curation/reference-annotation/${referenceNo}/bulk-delete`,
      { entry_type: entryType }
    );
    return response.data;
  },

  /**
   * Bulk transfer all annotations of a given type to another reference.
   *
   * @param {number} referenceNo - Source reference number
   * @param {string} entryType - Entry type: 'lit_guide', 'go_annotation', or 'ref_link'
   * @param {number} newReferenceNo - Target reference number
   * @returns {Promise<Object>} Result with count and messages
   */
  bulkTransfer: async (referenceNo, entryType, newReferenceNo) => {
    const response = await api.post(
      `/api/curation/reference-annotation/${referenceNo}/bulk-transfer`,
      {
        entry_type: entryType,
        new_reference_no: newReferenceNo,
      }
    );
    return response.data;
  },
};

export default refAnnotationCurationApi;

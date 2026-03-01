import api from './config';

export const literatureTopicApi = {
  /**
   * Get hierarchical tree of literature topics
   */
  getTopicTree: async () => {
    const response = await api.get('/api/literature-topic/tree');
    return response.data;
  },

  /**
   * Search references by literature topics
   * @param {number[]} topicCvTermNos - Array of cv_term_no values for topics
   */
  searchByTopics: async (topicCvTermNos) => {
    const topicsStr = topicCvTermNos.join(',');
    const response = await api.get(`/api/literature-topic/search?topics=${topicsStr}`);
    return response.data;
  },
};

export default literatureTopicApi;

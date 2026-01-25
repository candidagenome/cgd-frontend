import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend.dev.candidagenome.org';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
export { API_BASE_URL };

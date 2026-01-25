import axios from 'axios';

// In development, use relative URLs to leverage Vite's proxy (avoids CORS issues)
// In production, use the configured API URL or empty string for same-origin deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
export { API_BASE_URL };

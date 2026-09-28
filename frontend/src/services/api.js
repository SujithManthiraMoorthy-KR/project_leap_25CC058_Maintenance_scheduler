import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 second timeout for backend connectivity check
});

// Response interceptor for friendly error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let customError = 'An unexpected error occurred.';
    
    if (error.response) {
      // Backend returned error status
      const data = error.response.data;
      if (typeof data === 'string') {
        customError = data;
      } else if (data && data.error) {
        customError = data.error;
      } else if (data && typeof data === 'object') {
        // Validation errors map
        const messages = Object.values(data).join(', ');
        customError = messages || 'Validation error.';
      }
    } else if (error.request) {
      // Request made but no response (Network/Server down)
      customError = 'Unable to connect to the backend server (http://localhost:8080). Operating in demo/mock data mode.';
    } else {
      customError = error.message;
    }
    
    return Promise.reject(new Error(customError));
  }
);

export default api;

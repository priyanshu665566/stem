import axios from 'axios';

// If token is passed via URL (from admin redirect), save it to localStorage
const params = new URLSearchParams(window.location.search);
const urlToken = params.get('token');
if (urlToken) {
  localStorage.setItem('accessToken', urlToken);
  // Clean token from URL without reloading the page
  const cleanUrl = window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
}

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 Unauthorized
    if (error.response?.status === 401) {
      const token = localStorage.getItem('accessToken');
      
      // Only clear if token exists (to avoid infinite loop)
      if (token && !error.config.__isRetry) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Mark this as a retry to prevent infinite loops
        error.config.__isRetry = true;
        
        // Remove the invalid token and retry
        delete error.config.headers['Authorization'];
        return API(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
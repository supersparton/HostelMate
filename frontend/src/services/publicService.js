import axios from 'axios';

// Base URL for API calls
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance for public APIs (no auth required)
const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const publicService = {
  // Health check
  getHealth: () => {
    return publicApi.get('/health');
  },

  // Public website information
  getHomeInfo: () => {
    return publicApi.get('/public/home');
  },

  getVisionInfo: () => {
    return publicApi.get('/public/vision');
  },

  getContactInfo: () => {
    return publicApi.get('/public/contact');
  },

  getRulesInfo: () => {
    return publicApi.get('/public/rules');
  },

  getFeesInfo: () => {
    return publicApi.get('/public/fees');
  },

  // Contact form submission
  submitContactForm: (formData) => {
    return publicApi.post('/public/contact', formData);
  },
};

export default publicService;

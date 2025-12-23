import axios from 'axios';

// Base URL for Django API
const PROD_API = "https://api.rivals.blurryshady.dev";
export const API_ROOT =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? PROD_API : "http://127.0.0.1:8000");

const API_BASE_URL = `${API_ROOT}/api`;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
console.log("VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
console.log("API_ROOT =", API_ROOT);
console.log("API_BASE_URL =", API_BASE_URL);
console.log("FRONTEND BUILD =", "HEROKU API SWITCH 2025-12-22");



// Add auth token to requests (if user is logged in)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// API functions
export const heroAPI = {
  // Get all heroes
  getAll: () => apiClient.get('/heroes/'),
  
  // Get single hero by ID
  getById: (id) => apiClient.get(`/heroes/${id}/`),
  
  // Filter heroes by role
  getByRole: (role) => apiClient.get(`/heroes/by_role/?role=${role}`),
};

export const teamAPI = {
  // Get all teams
  getAll: (params) => apiClient.get('/teams/', { params }),
  
  // Get single team by slug
  getBySlug: (slug) => apiClient.get(`/teams/${slug}/`),
  
  // Create new team
  create: (data) => {
    const token = localStorage.getItem('token');
    return apiClient.post('/teams/', data, {
      headers: token ? { Authorization: `Token ${token}` } : {}
    });
  },
  
  // Update team
  update: (slug, data) => apiClient.put(`/teams/${slug}/`, data),
  
  // Delete team
  delete: (slug) => apiClient.delete(`/teams/${slug}/`),
  
  // Vote on team
  vote: (slug) => apiClient.post(`/teams/${slug}/vote/`),
  
  // Get team comments
  getComments: (slug) => apiClient.get(`/teams/${slug}/comments/`),
  
  // Add comment
  addComment: (slug, text) => apiClient.post(`/teams/${slug}/comments/`, { text }),
  
  // Get current user's teams
  getMyTeams: () => apiClient.get('/teams/my_teams/'),
};

export const accountAPI = {
  getProfile: () => apiClient.get('/auth/profile/'),
  getPublicProfile: (username) => apiClient.get(`/auth/users/${username}/`),
  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.put('/auth/profile/avatar/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default apiClient;
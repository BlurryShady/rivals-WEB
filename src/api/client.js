import axios from "axios";

// Base URL for Django API
export const PROD_API = "https://api.rivals.blurryshady.dev";

export const API_ROOT =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? PROD_API : "http://127.0.0.1:8000");

export const API_BASE_URL = `${API_ROOT}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

console.log("VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
console.log("API_ROOT =", API_ROOT);
console.log("API_BASE_URL =", API_BASE_URL);
console.log("FRONTEND BUILD =", "HEROKU API SWITCH 2025-12-22");

// Add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

// API functions
export const heroAPI = {
  getAll: () => apiClient.get("/heroes/"),
  getById: (id) => apiClient.get(`/heroes/${id}/`),
  getByRole: (role) => apiClient.get(`/heroes/by_role/?role=${role}`),
};

export const teamAPI = {
  getAll: (params) => apiClient.get("/teams/", { params }),
  getBySlug: (slug) => apiClient.get(`/teams/${slug}/`),
  create: (data) => apiClient.post("/teams/", data),
  update: (slug, data) => apiClient.put(`/teams/${slug}/`, data),
  delete: (slug) => apiClient.delete(`/teams/${slug}/`),
  vote: (slug) => apiClient.post(`/teams/${slug}/vote/`),
  getComments: (slug) => apiClient.get(`/teams/${slug}/comments/`),
  addComment: (slug, text) => apiClient.post(`/teams/${slug}/comments/`, { text }),
  getMyTeams: () => apiClient.get("/teams/my_teams/"),
};

export const accountAPI = {
  getProfile: () => apiClient.get("/auth/profile/"),
  getPublicProfile: (username) => apiClient.get(`/auth/users/${username}/`),
  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.put("/auth/profile/avatar/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default apiClient;

import axios from "axios";

const TOKEN_KEY = "access_token";

const AUTH_ENDPOINTS = ["/auth/login", "/auth/register"];

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

// Agregar el token automáticamente a las solicitudes.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Centralizar el manejo de respuestas HTTP.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const endpoint = (error.config?.url || "").split("?")[0];

    const isAuthEndpoint = AUTH_ENDPOINTS.includes(endpoint);

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem(TOKEN_KEY);
    }

    return Promise.reject(error);
  },
);

export default apiClient;

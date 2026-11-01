import apiClient from "./api-client.js";

export async function loginRequest(credentials) {
  const response = await apiClient.post("/auth/login", credentials);
  return response.data;
}

export async function registerRequest(userData) {
  const response = await apiClient.post("/auth/register", userData);
  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get("/auth/me");
  return response.data;
}

export async function getUserProfile() {
  const response = await apiClient.get("/users/me");
  return response.data;
}

export async function updateUserProfile(profileData) {
  const response = await apiClient.put("/users/me", profileData);
  return response.data;
}

export async function changeUserPassword(passwordData) {
  const response = await apiClient.put("/users/me/password", passwordData);

  return response.data;
}

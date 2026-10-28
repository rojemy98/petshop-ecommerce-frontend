
import apiClient from "./api-client.js";

export async function getProducts() {
  const response = await apiClient.get("/products");
  return response.data;
}

export async function getProductById(id) {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
}
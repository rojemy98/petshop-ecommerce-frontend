import apiClient from "./api-client.js";

export async function getProducts() {
  const response = await apiClient.get("/products");
  return response.data;
}

export async function getProductById(id) {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
}

export async function createProduct(productData) {
  const response = await apiClient.post("/products", productData);
  return response.data;
}

export async function updateProduct(id, productData) {
  const response = await apiClient.put(`/products/${id}`, productData);
  return response.data;
}

export async function deleteProduct(id) {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
}

export async function getAdminProducts() {
  const response = await apiClient.get("/products/admin");
  return response.data;
}

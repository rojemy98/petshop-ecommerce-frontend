
import apiClient from "./api-client.js";

export async function getProducts() {
  const response = await apiClient.get("/products");
  return response.data;
}

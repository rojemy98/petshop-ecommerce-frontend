import apiClient from "./api-client.js";

export async function getActiveCart() {
  const response = await apiClient.get("/carts/active");
  return response.data;
}

export async function createCart() {
  const response = await apiClient.post("/carts");
  return response.data;
}

export async function addCartItem(cartId, productId, quantity) {
  const response = await apiClient.post(`/carts/${cartId}/items`, {
    product_id: productId,
    quantity,
  });

  return response.data;
}

export async function updateCartItem(cartId, productId, quantity) {
  const response = await apiClient.put(`/carts/${cartId}/items/${productId}`, {
    quantity,
  });

  return response.data;
}

export async function removeCartItem(cartId, productId) {
  const response = await apiClient.delete(
    `/carts/${cartId}/items/${productId}`,
  );

  return response.data;
}

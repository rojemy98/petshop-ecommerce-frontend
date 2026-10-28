import apiClient from "./api-client.js";

export async function checkoutCart(cartId, checkoutData) {
  const response = await apiClient.post(
    `/carts/${cartId}/checkout`,
    checkoutData,
  );

  return response.data;
}

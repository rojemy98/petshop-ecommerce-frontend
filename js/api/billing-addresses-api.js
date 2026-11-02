import apiClient from "./api-client.js";

export async function getBillingAddresses() {
  const response = await apiClient.get("/billing-addresses");
  return response.data;
}

export async function createBillingAddress(addressData) {
  const response = await apiClient.post("/billing-addresses", addressData);

  return response.data;
}

export async function updateBillingAddress(addressId, addressData) {
  const response = await apiClient.put(
    `/billing-addresses/${addressId}`,
    addressData,
  );

  return response.data;
}

export async function deleteBillingAddress(addressId) {
  const response = await apiClient.delete(`/billing-addresses/${addressId}`);

  return response.status;
}

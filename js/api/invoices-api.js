import apiClient from "./api-client.js";

export async function getInvoices() {
  const response = await apiClient.get("/invoices");
  return response.data;
}

export async function getInvoiceByNumber(invoiceNumber) {
  const response = await apiClient.get(
    `/invoices/${encodeURIComponent(invoiceNumber)}`,
  );

  return response.data;
}

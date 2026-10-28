import { getCartCount } from "./cart-service.js";

export function updateCartHeader() {
  const cartCount = document.querySelector("#cart-count");

  if (cartCount) {
    cartCount.textContent = String(getCartCount());
  }
}

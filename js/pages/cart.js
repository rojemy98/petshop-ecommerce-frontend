import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getCartCount,
  getCartTotal,
} from "../services/cart-service.js";

import { updateCartHeader } from "../services/cart-header.js";

const cartItems = document.querySelector("#cart-items");
const cartMessage = document.querySelector("#cart-message");
const cartTotal = document.querySelector("#cart-total");
const clearButton = document.querySelector("#clear-cart");
const checkoutButton = document.querySelector("#checkout-button");

function formatPrice(value) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(value);
}

function showMessage(text, type = "") {
  cartMessage.textContent = text;
  cartMessage.className = type;
}

function renderCart() {
  const items = getCart();

  cartItems.replaceChildren();

  const isEmpty = items.length === 0;

  clearButton.disabled = isEmpty;
  checkoutButton.disabled = isEmpty;

  if (isEmpty) {
    showMessage("Tu carrito está vacío.");
    cartTotal.textContent = formatPrice(0);
    return;
  }

  showMessage(`${getCartCount()} unidad(es) en tu carrito.`);

  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "cart-item";

    const details = document.createElement("div");
    details.className = "cart-item-details";

    const name = document.createElement("h2");
    name.textContent = item.name;

    const price = document.createElement("p");
    price.textContent = `Precio: ${formatPrice(item.price)}`;

    const quantityLabel = document.createElement("label");
    quantityLabel.textContent = "Cantidad ";

    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.min = "1";
    quantityInput.max = String(item.stock);
    quantityInput.step = "1";
    quantityInput.value = String(item.quantity);
    quantityInput.setAttribute("aria-label", `Cantidad de ${item.name}`);

    quantityLabel.append(quantityInput);

    const subtotal = document.createElement("p");
    subtotal.className = "cart-item-subtotal";
    subtotal.textContent = `Subtotal: ${formatPrice(item.price * item.quantity)}`;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-item-button";
    removeButton.textContent = "Eliminar";

    quantityInput.addEventListener("change", () => {
      try {
        updateCartQuantity(item.id, quantityInput.value);
        showMessage("");
        renderCart();
      } catch (error) {
        showMessage(error.message, "error-message");
        quantityInput.value = String(item.quantity);
      }
    });

    removeButton.addEventListener("click", () => {
      removeFromCart(item.id);
      showMessage("Producto eliminado del carrito.", "success-message");
      renderCart();
    });

    details.append(name, price, quantityLabel, subtotal, removeButton);

    article.append(details);
    cartItems.append(article);
  });

  cartTotal.textContent = formatPrice(getCartTotal());
}

clearButton.addEventListener("click", () => {
  clearCart();
  renderCart();
  showMessage("Has vaciado el carrito.");
});

checkoutButton.addEventListener("click", () => {
  showMessage("El checkout se conectará con el backend en el siguiente paso.");
});

renderCart();
updateCartHeader();

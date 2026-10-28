import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getCartCount,
  getCartTotal,
} from "../services/cart-service.js";

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

function renderCart() {
  const items = getCart();
  cartItems.replaceChildren();

  if (items.length === 0) {
    cartMessage.textContent = "Tu carrito está vacío.";
    cartTotal.textContent = formatPrice(0);
    clearButton.disabled = true;
    checkoutButton.disabled = true;
    return;
  }

  cartMessage.textContent = `${getCartCount()} artículo(s) en tu carrito.`;
  clearButton.disabled = false;
  checkoutButton.disabled = false;

  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "cart-item";

    const details = document.createElement("div");

    const name = document.createElement("h2");
    name.textContent = item.name;

    const price = document.createElement("p");
    price.textContent = formatPrice(item.price);

    const quantityLabel = document.createElement("label");
    quantityLabel.textContent = "Cantidad ";

    const quantity = document.createElement("input");
    quantity.type = "number";
    quantity.min = "1";
    quantity.max = String(item.stock);
    quantity.step = "1";
    quantity.value = String(item.quantity);

    quantityLabel.append(quantity);

    const subtotal = document.createElement("p");
    subtotal.textContent = `Subtotal: ${formatPrice(item.price * item.quantity)}`;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Eliminar";

    quantity.addEventListener("change", () => {
      try {
        updateCartQuantity(item.id, quantity.value);
        cartMessage.textContent = "";
        renderCart();
      } catch (error) {
        cartMessage.textContent = error.message;
        quantity.value = String(item.quantity);
      }
    });

    removeButton.addEventListener("click", () => {
      removeFromCart(item.id);
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
});

checkoutButton.addEventListener("click", () => {
  cartMessage.textContent =
    "El proceso de compra se conectará con el backend en el siguiente paso.";
});

renderCart();

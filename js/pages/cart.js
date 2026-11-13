import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getCartCount,
  getCartTotal,
} from "../services/cart-service.js";

import { updateCartHeader } from "../services/cart-header.js";
import { validateSession } from "../services/auth-service.js";
import { formatPrice } from "../utils/formatters.js";
import { formatMessage } from "../utils/messages.js";

const list = document.querySelector("#cart-items"),
  msg = document.querySelector("#cart-message"),
  total = document.querySelector("#cart-total"),
  clear = document.querySelector("#clear-cart"),
  next = document.querySelector("#checkout-button");

function render() {
  const items = getCart();

  list.replaceChildren();

  clear.disabled = next.disabled = !items.length;

  if (!items.length) {
    formatMessage(msg, "Tu carrito está vacío.");
    total.textContent = formatPrice(0);
    return;
  }

  formatMessage(msg, `${getCartCount()} unidad(es) en tu carrito.`);

  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "cart-item";

    const details = document.createElement("div");
    details.className = "cart-item-details";

    const name = document.createElement("h2");
    name.textContent = item.name;

    const price = document.createElement("p");
    price.textContent = `Precio: ${formatPrice(item.price)}`;

    const label = document.createElement("label");
    label.textContent = "Cantidad ";

    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.max = String(item.stock);
    input.step = "1";
    input.value = String(item.quantity);
    input.setAttribute("aria-label", `Cantidad de ${item.name}`);
    label.append(input);

    const subtotal = document.createElement("p");
    subtotal.textContent = `Subtotal: ${formatPrice(item.price * item.quantity)}`;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-item-button";
    remove.textContent = "Eliminar";

    input.addEventListener("change", () => {
      try {
        updateCartQuantity(item.id, input.value);
        render();
        updateCartHeader();
      } catch (e) {
        formatMessage(msg, e.message, "error");
        input.value = String(item.quantity);
      }
    });

    remove.addEventListener("click", () => {
      removeFromCart(item.id);
      render();
      updateCartHeader();
      formatMessage(msg, "Producto eliminado del carrito.", "success");
    });

    details.append(name, price, label, subtotal, remove);
    article.append(details);
    list.append(article);
  });
  total.textContent = formatPrice(getCartTotal());
}

next.addEventListener("click", async () => {
  if (!getCart().length) return;

  next.disabled = true;

  try {
    const session = await validateSession();
    if (!session.valid) {
      location.href = "/login.html";
      return;
    }
    location.href = "/checkout.html";
  } catch (e) {
    formatMessage(
      msg,
      e.response?.data?.message || e.message || "No se pudo validar la sesión.",
      "error",
    );
  } finally {
    next.disabled = !getCart().length;
  }
});

clear.addEventListener("click", () => {
  clearCart();
  render();
  updateCartHeader();
  formatMessage(msg, "Has vaciado el carrito.", "success");
});

async function init() {
  const session = await validateSession();
  if (!session.valid) {
    location.href = "/login.html";
    return;
  }
  render();
  updateCartHeader();
}

init().catch((e) =>
  formatMessage(msg, e.message || "No fue posible cargar el carrito.", "error"),
);

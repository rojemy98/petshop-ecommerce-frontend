import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getCartCount,
  getCartTotal,
} from "../services/cart-service.js";

import { updateCartHeader } from "../services/cart-header.js";
import {
  getActiveCart,
  createCart,
  addCartItem,
  updateCartItem,
} from "../api/cart-api.js";

import {
  getBillingAddresses,
  createBillingAddress,
} from "../api/billing-addresses-api.js";

import { checkoutCart } from "../api/checkout-api.js";

const cartItems = document.querySelector("#cart-items");
const cartMessage = document.querySelector("#cart-message");
const cartTotal = document.querySelector("#cart-total");
const clearButton = document.querySelector("#clear-cart");
const checkoutButton = document.querySelector("#checkout-button");

const checkoutSection = document.querySelector("#checkout-section");
const checkoutMessage = document.querySelector("#checkout-message");
const billingAddressSelect = document.querySelector("#billing-address");
const addressForm = document.querySelector("#billing-address-form");
const showAddressFormButton = document.querySelector("#show-address-form");
const cancelAddressFormButton = document.querySelector("#cancel-address-form");
const confirmCheckoutButton = document.querySelector("#confirm-checkout");

const purchaseConfirmation = document.querySelector("#purchase-confirmation");
const confirmationInvoice = document.querySelector("#confirmation-invoice");
const confirmationTotal = document.querySelector("#confirmation-total");

let billingAddresses = [];
let currentBackendCart = null;
let checkoutInProgress = false;

function formatPrice(value) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(Number(value) || 0);
}

function showMessage(text, type = "") {
  cartMessage.textContent = text;
  cartMessage.className = type;
}

function showCheckoutMessage(text, type = "") {
  checkoutMessage.textContent = text;
  checkoutMessage.className = type;
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Ocurrió un error inesperado."
  );
}

function renderCart() {
  const items = getCart();

  cartItems.replaceChildren();

  const isEmpty = items.length === 0;

  clearButton.disabled = isEmpty;
  checkoutButton.disabled = isEmpty || checkoutInProgress;

  if (isEmpty) {
    showMessage("Tu carrito está vacío.");
    cartTotal.textContent = formatPrice(0);
    checkoutSection.hidden = true;
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
        updateCartHeader();
      } catch (error) {
        showMessage(getErrorMessage(error), "error-message");
        quantityInput.value = String(item.quantity);
      }
    });

    removeButton.addEventListener("click", () => {
      removeFromCart(item.id);
      showMessage("Producto eliminado del carrito.", "success-message");
      renderCart();
      updateCartHeader();
    });

    details.append(name, price, quantityLabel, subtotal, removeButton);
    article.append(details);
    cartItems.append(article);
  });

  cartTotal.textContent = formatPrice(getCartTotal());
}

async function getOrCreateBackendCart() {
  try {
    return await getActiveCart();
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }
  }

  return await createCart();
}

function getBackendCartItems(cart) {
  return cart.products || cart.cart_products || [];
}

async function synchronizeCart() {
  const localItems = getCart();

  if (localItems.length === 0) {
    throw new Error("Tu carrito está vacío.");
  }

  let backendCart = await getOrCreateBackendCart();

  if (backendCart.status !== "ACTIVE") {
    throw new Error("El carrito del servidor ya no está activo.");
  }

  let backendItems = getBackendCartItems(backendCart);

  for (const localItem of localItems) {
    const productId = Number(localItem.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      throw new Error(
        `El identificador del producto "${localItem.name}" no es válido.`,
      );
    }

    const existingItem = backendItems.find((item) => {
      const existingProductId = item.product_id ?? item.product?.id ?? item.id;

      return Number(existingProductId) === productId;
    });

    if (existingItem) {
      const existingProductId =
        existingItem.product_id ?? existingItem.product?.id ?? existingItem.id;

      // Si el producto ya existe en el carrito del servidor,
      // actualizamos su cantidad para evitar duplicarlo.
      if (Number(existingProductId) !== productId) {
        throw new Error(
          "No se pudo identificar correctamente un producto del carrito.",
        );
      }

      backendCart = await updateCartItem(
        backendCart.id,
        productId,
        Number(localItem.quantity),
      );
    } else {
      backendCart = await addCartItem(
        backendCart.id,
        productId,
        Number(localItem.quantity),
      );
    }

    backendItems = getBackendCartItems(backendCart);
  }

  currentBackendCart = backendCart;
  return backendCart;
}

function renderBillingAddresses() {
  billingAddressSelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = billingAddresses.length
    ? "Selecciona una dirección"
    : "No tienes direcciones guardadas";

  billingAddressSelect.append(placeholder);

  billingAddresses.forEach((address) => {
    const option = document.createElement("option");
    option.value = String(address.id);

    option.textContent = [
      address.address,
      address.city,
      address.province,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");

    billingAddressSelect.append(option);
  });
}

async function loadBillingAddresses() {
  const response = await getBillingAddresses();

  billingAddresses = Array.isArray(response)
    ? response
    : response.addresses || [];

  renderBillingAddresses();
}

checkoutButton.addEventListener("click", async () => {
  if (getCart().length === 0 || checkoutInProgress) {
    return;
  }

  checkoutInProgress = true;
  checkoutButton.disabled = true;

  try {
    showMessage("Preparando tu carrito...", "");

    await synchronizeCart();
    await loadBillingAddresses();

    checkoutSection.hidden = false;
    showCheckoutMessage(
      "Carrito sincronizado. Selecciona tu dirección de facturación.",
    );

    checkoutSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    showMessage("Tu carrito está listo para finalizar la compra.");
  } catch (error) {
    showMessage(
      `No se pudo preparar el checkout: ${getErrorMessage(error)}`,
      "error-message",
    );
  } finally {
    checkoutInProgress = false;
    checkoutButton.disabled = getCart().length === 0;
  }
});

showAddressFormButton.addEventListener("click", () => {
  addressForm.hidden = false;
  showAddressFormButton.hidden = true;
});

cancelAddressFormButton.addEventListener("click", () => {
  addressForm.reset();
  addressForm.hidden = true;
  showAddressFormButton.hidden = false;
});

addressForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const postalCode = Number(addressForm.elements["postal_code"].value);

  if (!Number.isSafeInteger(postalCode) || postalCode < 0) {
    showCheckoutMessage("Ingresa un código postal válido.", "error-message");
    return;
  }

  const addressData = {
    address: addressForm.elements["address"].value.trim(),
    city: addressForm.elements["city"].value.trim(),
    province: addressForm.elements["province"].value.trim(),
    postal_code: postalCode,
    country: addressForm.elements["country"].value.trim(),
  };

  if (
    !addressData.address ||
    !addressData.city ||
    !addressData.province ||
    !addressData.country
  ) {
    showCheckoutMessage(
      "Completa todos los campos de la dirección.",
      "error-message",
    );
    return;
  }

  const saveButton = addressForm.querySelector('button[type="submit"]');

  saveButton.disabled = true;

  try {
    const createdAddress = await createBillingAddress(addressData);

    await loadBillingAddresses();

    const addressId = createdAddress.id;

    if (addressId != null) {
      billingAddressSelect.value = String(addressId);
    }

    addressForm.reset();
    addressForm.hidden = true;
    showAddressFormButton.hidden = false;

    showCheckoutMessage("Dirección guardada correctamente.", "success-message");
  } catch (error) {
    showCheckoutMessage(
      `No se pudo guardar la dirección: ${getErrorMessage(error)}`,
      "error-message",
    );
  } finally {
    saveButton.disabled = false;
  }
});

confirmCheckoutButton.addEventListener("click", async () => {
  if (checkoutInProgress) {
    return;
  }

  const addressId = Number(billingAddressSelect.value);

  if (!Number.isInteger(addressId) || addressId <= 0) {
    showCheckoutMessage(
      "Selecciona una dirección de facturación.",
      "error-message",
    );
    return;
  }

  if (!currentBackendCart?.id) {
    showCheckoutMessage(
      "Prepara nuevamente el carrito antes de continuar.",
      "error-message",
    );
    return;
  }

  checkoutInProgress = true;
  confirmCheckoutButton.disabled = true;
  checkoutButton.disabled = true;

  try {
    // Sincronizar el carrito antes de confirmar la compra.
    const backendCart = await synchronizeCart();

    const result = await checkoutCart(backendCart.id, {
      billing_address_id: addressId,
      payment_method: "CARD",
      payment_reference: `DEMO-${Date.now()}`,
    });

    // Limpiar el carrito local después de confirmar el checkout.
    clearCart();
    currentBackendCart = null;

    renderCart();
    updateCartHeader();

    // Mostrar la pantalla de confirmación.
    confirmationInvoice.textContent = result.invoice_number;
    confirmationTotal.textContent = formatPrice(result.total);
    purchaseConfirmation.hidden = false;

    // Ocultar el contenido anterior del carrito.
    cartItems.hidden = true;

    const cartSummary = document.querySelector(".cart-summary");

    if (cartSummary) {
      cartSummary.hidden = true;
    }

    // Ocultar el formulario de checkout.
    checkoutSection.hidden = true;

    // Mostrar mensaje general de éxito.
    showMessage("Tu compra se completó correctamente.", "success-message");

    purchaseConfirmation.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (error) {
    showCheckoutMessage(
      `No se pudo completar la compra: ${getErrorMessage(error)}`,
      "error-message",
    );
  } finally {
    checkoutInProgress = false;
    confirmCheckoutButton.disabled = false;
    checkoutButton.disabled = getCart().length === 0;
  }
});

clearButton.addEventListener("click", () => {
  clearCart();
  currentBackendCart = null;
  checkoutSection.hidden = true;

  renderCart();
  updateCartHeader();

  showMessage("Has vaciado el carrito.");
});

renderCart();
updateCartHeader();

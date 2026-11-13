import { renderSessionHeader } from "../services/session-header.js";
import { getCart, clearCart } from "../services/cart-service.js";
import { updateCartHeader } from "../services/cart-header.js";
import { validateSession, getUserId } from "../services/auth-service.js";
import {
  getActiveCart,
  createCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
} from "../api/cart-api.js";
import {
  getBillingAddresses,
  createBillingAddress,
} from "../api/billing-addresses-api.js";
import { checkoutCart } from "../api/checkout-api.js";
import { formatPrice } from "../utils/formatters.js";
import { formatMessage } from "../utils/messages.js";

renderSessionHeader();

const msg = document.querySelector("#checkout-message"),
  itemsBox = document.querySelector("#checkout-items"),
  totalBox = document.querySelector("#checkout-total"),
  select = document.querySelector("#billing-address"),
  form = document.querySelector("#billing-address-form"),
  showForm = document.querySelector("#show-address-form"),
  cancelForm = document.querySelector("#cancel-address-form"),
  confirm = document.querySelector("#confirm-checkout");

let busy = false;

const err = (e) =>
  e.response?.data?.message ||
  e.response?.data?.error ||
  e.message ||
  "Ocurrió un error inesperado.";

const remoteItems = (cart) => cart.products;
const remoteId = (cartProduct) => Number(cartProduct.product_id);

async function getOrCreate() {
  try {
    return await getActiveCart();
  } catch (e) {
    if (e.response?.status !== 404) throw e;
    return createCart();
  }
}

async function syncCart() {
  const local = getCart();

  if (!local.length) throw Error("Tu carrito está vacío.");

  let remote = await getOrCreate();

  if (remote.status && remote.status !== "ACTIVE")
    throw Error("El carrito del servidor ya no está activo.");

  let rows = remoteItems(remote);

  const ids = new Set(local.map((i) => Number(i.id)));

  for (const row of [...rows]) {
    const id = remoteId(row);
    if (!ids.has(id)) {
      remote = await removeCartItem(remote.id, id);
      rows = remoteItems(remote);
    }
  }

  for (const item of local) {
    const id = Number(item.id),
      qty = Number(item.quantity);

    if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(qty) || qty <= 0)
      throw Error(`Datos inválidos para ${item.name}.`);

    const exists = rows.some((r) => remoteId(r) === id);

    remote = exists
      ? await updateCartItem(remote.id, id, qty)
      : await addCartItem(remote.id, id, qty);

    rows = remoteItems(remote);
  }

  return remote;
}

function renderOrder() {
  const cartItems = getCart();

  itemsBox.replaceChildren();

  cartItems.forEach((cartItem) => {
    const itemContainer = document.createElement("article");
    itemContainer.className = "cart-item";

    const itemDetails = document.createElement("div");
    itemDetails.className = "cart-item-details";

    const productName = document.createElement("h3");
    productName.textContent = cartItem.name;

    const productQuantity = document.createElement("p");
    productQuantity.textContent = `${cartItem.quantity} × ${formatPrice(cartItem.price)}`;

    const productSubtotal = document.createElement("strong");
    productSubtotal.textContent = formatPrice(
      cartItem.price * cartItem.quantity,
    );

    itemDetails.append(productName, productQuantity, productSubtotal);

    itemContainer.append(itemDetails);
    itemsBox.append(itemContainer);
  });

  const orderTotal = cartItems.reduce(
    (total, cartItem) =>
      total + Number(cartItem.price) * Number(cartItem.quantity),
    0,
  );

  totalBox.textContent = formatPrice(orderTotal);
}

async function loadAddresses() {
  const addresses = await getBillingAddresses();

  select.replaceChildren();

  const empty = document.createElement("option");

  empty.value = "";

  empty.textContent = addresses.length
    ? "Selecciona una dirección"
    : "No tienes direcciones guardadas";

  select.append(empty);

  addresses.forEach((a) => {
    const o = document.createElement("option");
    o.value = String(a.id);
    o.textContent = [a.address, a.city, a.province, a.country]
      .filter(Boolean)
      .join(", ");
    select.append(o);
  });
}

showForm.addEventListener("click", () => {
  form.hidden = false;
  showForm.hidden = true;
});

cancelForm.addEventListener("click", () => {
  form.reset();
  form.hidden = true;
  showForm.hidden = false;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const postalText = form.elements.postal_code.value.trim(),
    postal = Number(postalText),
    data = {
      address: form.elements.address.value.trim(),
      city: form.elements.city.value.trim(),
      province: form.elements.province.value.trim(),
      postal_code: postal,
      country: form.elements.country.value.trim(),
    };

  if (
    !data.address ||
    !data.city ||
    !data.province ||
    !data.country ||
    !/^\d+$/.test(postalText) ||
    !Number.isSafeInteger(postal)
  ) {
    formatMessage(msg, "Completa todos los campos correctamente.", "error");
    return;
  }

  const button = form.querySelector('[type="submit"]');

  button.disabled = true;

  try {
    const created = await createBillingAddress(data);
    await loadAddresses();
    if (created?.id != null) select.value = String(created.id);
    form.reset();
    form.hidden = true;
    showForm.hidden = false;
    formatMessage(msg, "Dirección guardada correctamente.", "success");
  } catch (error) {
    formatMessage(
      msg,
      `No se pudo guardar la dirección: ${err(error)}`,
      "error",
    );
  } finally {
    button.disabled = false;
  }
});

confirm.addEventListener("click", async () => {
  if (busy) return;

  const addressId = Number(select.value);

  if (!Number.isInteger(addressId) || addressId <= 0) {
    formatMessage(msg, "Selecciona una dirección de facturación.", "error");
    return;
  }

  busy = true;

  confirm.disabled = true;

  try {
    const session = await validateSession();

    if (!session.valid) {
      location.href = "/login.html";
      return;
    }

    const cart = await syncCart();
    const result = await checkoutCart(cart.id, {
      billing_address_id: addressId,
      payment_method: "CARD",
      payment_reference: `DEMO-${Date.now()}`,
    });

    if (!result.invoice_number)
      throw Error(
        "El servidor no devolvió el número de factura. Revisa tus facturas antes de volver a intentar.",
      );

    localStorage.setItem(
      `mokka_pets_last_purchase:user:${getUserId()}`,
      JSON.stringify({
        invoice_number: result.invoice_number,
        total: result.total,
        created_at: new Date().toISOString(),
      }),
    );

    clearCart();
    updateCartHeader();

    location.href = "/purchase-confirmation.html";
  } catch (error) {
    formatMessage(
      msg,
      `No se pudo completar la compra: ${err(error)}`,
      "error",
    );
  } finally {
    busy = false;
    confirm.disabled = false;
  }
});

async function init() {
  const session = await validateSession();

  if (!session.valid) {
    location.href = "/login.html";
    return;
  }

  if (!getCart().length) {
    location.href = "/cart.html";
    return;
  }

  renderOrder();
  await syncCart();
  await loadAddresses();
}

init().catch((e) =>
  formatMessage(msg, `No se pudo preparar el pedido: ${err(e)}`, "error"),
);

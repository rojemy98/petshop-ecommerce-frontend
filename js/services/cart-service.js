import { getUserId } from "./session-storage.js";

const CART_KEY = "mokka_pets_cart";

function getCartKey() {
  const userId = getUserId();

  return userId ? `${CART_KEY}:user:${userId}` : `${CART_KEY}:guest`;
}

export function migrateCartToUser(userId, previousToken) {
  if (!userId || !previousToken) return;

  const stableKey = `${CART_KEY}:user:${userId}`;
  const legacyKey = `${CART_KEY}:${previousToken}`;
  const legacyCart = localStorage.getItem(legacyKey);

  if (legacyCart) {
    let legacyItems = [];
    let stableItems = [];

    try {
      legacyItems = JSON.parse(legacyCart);
      stableItems = JSON.parse(localStorage.getItem(stableKey) || "[]");
    } catch {
      legacyItems = [];
      stableItems = [];
    }

    if (!Array.isArray(legacyItems)) legacyItems = [];
    if (!Array.isArray(stableItems)) stableItems = [];

    const mergedItems = [...stableItems];

    legacyItems.forEach((legacyItem) => {
      const existingItem = mergedItems.find(
        (item) => String(item.id) === String(legacyItem.id),
      );

      if (existingItem) {
        const maximumStock = Number(existingItem.stock ?? legacyItem.stock);
        existingItem.quantity = Math.min(
          maximumStock,
          Number(existingItem.quantity) + Number(legacyItem.quantity),
        );
      } else {
        mergedItems.push(legacyItem);
      }
    });

    localStorage.setItem(stableKey, JSON.stringify(mergedItems));
  }

  // Remove legacy token-keyed carts after migrating the active session.
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);

    if (
      key?.startsWith(`${CART_KEY}:`) &&
      !key.startsWith(`${CART_KEY}:user:`) &&
      key !== stableKey &&
      key !== `${CART_KEY}:guest`
    ) {
      localStorage.removeItem(key);
    }
  }
}

function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(getCartKey()) || "[]");

    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
}

export function getCart() {
  return readCart();
}

export function addToCart(product, quantity = 1) {
  const amount = Number(quantity);
  const stock = Number(product.stock);

  if (!Number.isInteger(amount) || amount < 1) {
    throw new Error("La cantidad debe ser un número entero mayor que cero.");
  }

  if (!Number.isFinite(stock) || stock < amount) {
    throw new Error("No hay suficiente stock para esa cantidad.");
  }

  const cart = readCart();

  const existingItem = cart.find(
    (item) => String(item.id) === String(product.id),
  );

  const newQuantity = (existingItem?.quantity ?? 0) + amount;

  if (newQuantity > stock) {
    throw new Error("La cantidad supera el stock disponible.");
  }

  if (existingItem) {
    existingItem.quantity = newQuantity;
    existingItem.stock = stock;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      stock,
      quantity: amount,
    });
  }

  saveCart(cart);

  return cart;
}

export function updateCartQuantity(productId, quantity) {
  const amount = Number(quantity);
  const cart = readCart();

  const item = cart.find((product) => String(product.id) === String(productId));

  if (!item) {
    throw new Error("El producto no está en el carrito.");
  }

  if (!Number.isInteger(amount) || amount < 1) {
    throw new Error("La cantidad debe ser un entero mayor que cero.");
  }

  if (amount > item.stock) {
    throw new Error("La cantidad supera el stock disponible.");
  }

  item.quantity = amount;

  saveCart(cart);

  return cart;
}

export function removeFromCart(productId) {
  const cart = readCart().filter(
    (item) => String(item.id) !== String(productId),
  );

  saveCart(cart);

  return cart;
}

export function clearCart() {
  localStorage.removeItem(getCartKey());
}

export function getCartCount() {
  return readCart().reduce((total, item) => total + Number(item.quantity), 0);
}

export function getCartTotal() {
  return readCart().reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0,
  );
}

export function getCartItemQuantity(productId) {
  const item = readCart().find(
    (product) => String(product.id) === String(productId),
  );

  return item ? Number(item.quantity) : 0;
}

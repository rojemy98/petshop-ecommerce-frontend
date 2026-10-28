const CART_KEY = "mokka_pets_cart";

function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
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
      image_url: product.image_url ?? product.image ?? null,
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
  localStorage.removeItem(CART_KEY);
}

export function getCartCount() {
  return readCart().reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotal() {
  return readCart().reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
}

export function getCartItemQuantity(productId) {
  const cart = readCart();

  const item = cart.find((product) => String(product.id) === String(productId));

  return item ? Number(item.quantity) : 0;
}

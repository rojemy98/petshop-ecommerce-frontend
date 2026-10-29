import { getProductById } from "../api/products-api.js";
import { addToCart, getCartItemQuantity } from "../services/cart-service.js";
import { updateCartHeader } from "../services/cart-header.js";

const message = document.querySelector("#detail-message");
const detail = document.querySelector("#product-detail");

const productId = new URLSearchParams(window.location.search).get("id");

function formatPrice(value) {
  const price = Number(value);

  if (
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(price)
  ) {
    return "Precio no disponible";
  }

  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(price);
}

let currentProduct = null;

async function loadProduct() {
  if (!productId || !/^\d+$/.test(productId)) {
    message.textContent = "El identificador del producto no es válido.";
    return;
  }

  try {
    const response = await getProductById(productId);
    const product = response.product ?? response.data ?? response;

    currentProduct = product;

    document.querySelector("#detail-name").textContent =
      product.name ?? "Producto sin nombre";

    document.querySelector("#detail-price").textContent = formatPrice(
      product.price,
    );

    document.querySelector("#detail-description").textContent =
      product.description ?? "Consulta los detalles de este producto.";

    // Calcular el stock disponible considerando el carrito.
    const stockElement = document.querySelector("#detail-stock");
    const stock = Number(product.stock ?? 0);
    const quantityInCart = getCartItemQuantity(product.id);
    const availableStock = Math.max(0, stock - quantityInCart);

    stockElement.textContent =
      availableStock > 0
        ? `Disponibles: ${availableStock}`
        : "No quedan unidades disponibles.";

    // Mostrar la imagen del producto.
    const imageContainer = document.querySelector("#detail-image");
    const imageUrl =
      product.image_url ??
      product.image ??
      product.image_path ??
      product.imageUrl;

    if (imageUrl) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = product.name ?? "Producto para mascotas";
      image.loading = "lazy";

      image.addEventListener("error", () => {
        imageContainer.textContent = "🐾";
      });

      imageContainer.replaceChildren(image);
    } else {
      imageContainer.textContent = "🐾";
    }

    // Actualizar el selector de cantidad.
    const quantity = document.querySelector("#quantity");
    quantity.min = "1";
    quantity.max = String(availableStock);
    quantity.value = availableStock > 0 ? "1" : "0";
    quantity.disabled = availableStock <= 0;

    // Deshabilitar el botón si no quedan unidades.
    const addButton = document.querySelector("#add-to-cart");
    addButton.disabled = availableStock <= 0;

    message.textContent = "";
    detail.hidden = false;
  } catch (error) {
    console.error("Error al cargar el detalle:", error);

    if (error.response?.status === 401) {
      message.textContent = "Inicia sesión para consultar este producto.";
    } else if (error.response?.status === 404) {
      message.textContent = "No encontramos este producto.";
    } else {
      message.textContent = "No fue posible cargar el producto.";
    }
  }
}

loadProduct();

const addButton = document.querySelector("#add-to-cart");
const quantityInput = document.querySelector("#quantity");
const cartMessage = document.querySelector("#cart-message");

addButton.addEventListener("click", () => {
  try {
    if (!currentProduct) {
      throw new Error("El producto todavía no está disponible.");
    }

    // Obtener la cantidad seleccionada.
    const quantity = Number(quantityInput.value);

    // Obtener el stock y las unidades que ya están en el carrito.
    const stock = Number(currentProduct.stock ?? 0);
    const quantityInCart = getCartItemQuantity(currentProduct.id);
    const availableStock = Math.max(0, stock - quantityInCart);

    // Validar la cantidad ingresada.
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Selecciona una cantidad válida.");
    }

    if (quantity > availableStock) {
      throw new Error(`Solo quedan ${availableStock} unidades disponibles.`);
    }

    // Agregar el producto al carrito.
    addToCart(currentProduct, quantity);

    updateCartHeader();

    // Calcular el stock restante después de agregarlo.
    const remainingStock = Math.max(0, availableStock - quantity);

    // Actualizar el stock visible.
    document.querySelector("#detail-stock").textContent =
      remainingStock > 0
        ? `Disponibles: ${remainingStock}`
        : "No quedan unidades disponibles.";

    // Actualizar el campo HTML de cantidad.
    quantityInput.max = String(remainingStock);
    quantityInput.value = remainingStock > 0 ? "1" : "0";
    quantityInput.disabled = remainingStock <= 0;

    // Deshabilitar el botón si no quedan unidades.
    addButton.disabled = remainingStock <= 0;

    // Mostrar confirmación.
    cartMessage.textContent = "¡Producto agregado al carrito!";
    cartMessage.className = "success-message";
  } catch (error) {
    cartMessage.textContent = error.message;
    cartMessage.className = "error-message";
  }
});

// Inicializar el contador del carrito al cargar el detalle.
updateCartHeader();

import { getProductById } from "../api/products-api.js";

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

async function loadProduct() {
  if (!productId || !/^\d+$/.test(productId)) {
    message.textContent = "El identificador del producto no es válido.";
    return;
  }

  try {
    const response = await getProductById(productId);

    const product = response.product ?? response.data ?? response;

    document.querySelector("#detail-name").textContent =
      product.name ?? "Producto sin nombre";

    document.querySelector("#detail-price").textContent = formatPrice(
      product.price,
    );

    document.querySelector("#detail-description").textContent =
      product.description ?? "Consulta los detalles de este producto.";

    const stockElement = document.querySelector("#detail-stock");
    const stock = Number(product.stock ?? 0);

    stockElement.textContent = stock > 0 ? `Disponibles: ${stock}` : "Agotado";

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
      imageContainer.replaceChildren(image);
    } else {
      imageContainer.textContent = "🐾";
    }

    const quantity = document.querySelector("#quantity");
    quantity.max = String(stock);
    quantity.disabled = stock <= 0;

    const addButton = document.querySelector("#add-to-cart");
    addButton.disabled = stock <= 0;

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

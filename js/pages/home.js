
import { getProducts } from "../api/products-api.js";

const productGrid = document.querySelector("#product-grid");
const productsMessage = document.querySelector("#products-message");

function normalizeProducts(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.products)) {
    return response.products;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") {
    return "Precio no disponible";
  }

  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "Precio no disponible";
  }

  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC"
  }).format(price);
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const imageContainer = document.createElement("div");
  imageContainer.className = "product-image";

  const imageUrl =
    product.image_url ??
    product.image ??
    product.image_path ??
    product.imageUrl;

  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = product.name ?? product.title ?? "Producto para mascotas";
    image.loading = "lazy";

    image.addEventListener("error", () => {
      imageContainer.replaceChildren();
      imageContainer.classList.add("product-image-placeholder");
      imageContainer.textContent = "🐾";
    });

    imageContainer.append(image);
  } else {
    imageContainer.classList.add("product-image-placeholder");
    imageContainer.textContent = "🐾";
  }

  const info = document.createElement("div");
  info.className = "product-info";

  const name = document.createElement("h3");
  name.textContent =
    product.name ?? product.title ?? "Producto sin nombre";

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = formatPrice(product.price);

  const stock = document.createElement("p");
  stock.className = "product-stock";

  const stockValue = product.stock ?? product.quantity;

  if (stockValue === undefined || stockValue === null) {
    stock.textContent = "";
  } else {
    stock.textContent =
      Number(stockValue) > 0 ? "Disponible" : "Agotado";

    stock.classList.toggle(
      "out-of-stock",
      Number(stockValue) <= 0
    );
  }

  info.append(name, price, stock);
  card.append(imageContainer, info);

  return card;
}

async function loadProducts() {
  if (!productGrid || !productsMessage) {
    console.error(
      "No se encontraron #product-grid o #products-message en index.html."
    );
    return;
  }

  productGrid.replaceChildren();
  productsMessage.textContent = "Cargando productos...";

  try {
    const response = await getProducts();

    console.log("Respuesta del catálogo:", response);

    const products = normalizeProducts(response);

    if (products.length === 0) {
      productsMessage.textContent =
        "No hay productos disponibles para mostrar.";
      return;
    }

    const fragment = document.createDocumentFragment();

    products.forEach((product) => {
      fragment.appendChild(createProductCard(product));
    });

    productGrid.appendChild(fragment);
    productsMessage.textContent = "";
  } catch (error) {
    console.error("Error al cargar productos:", error);

    if (error.response?.status === 401) {
      productsMessage.textContent =
        "Inicia sesión para consultar el catálogo.";

      const loginLink = document.createElement("a");
      loginLink.href = "/login.html";
      loginLink.textContent = "Iniciar sesión";
      loginLink.className = "catalog-login-link";

      productsMessage.append(" ", loginLink);
    } else if (error.response?.status === 403) {
      productsMessage.textContent =
        "No tienes permisos para consultar estos productos.";
    } else {
      productsMessage.textContent =
        "No pudimos cargar los productos. Verifica que el backend esté funcionando.";
    }
  }
}

loadProducts();

import { renderSessionHeader } from "../services/session-header.js";
import { formatPrice } from "../utils/formatters.js";
import { getProducts } from "../api/products-api.js";
import { updateCartHeader } from "../services/cart-header.js";
import { validateSession } from "../services/auth-service.js";

renderSessionHeader();

const productGrid = document.querySelector("#product-grid");
const productsMessage = document.querySelector("#products-message");
const searchInput = document.querySelector("#product-search");
const categoryFilter = document.querySelector("#category-filter");
const clearFiltersButton = document.querySelector("#clear-filters");

let allProducts = [];

const pagination = document.querySelector("#products-pagination");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const paginationInfo = document.querySelector("#pagination-info");

const PRODUCTS_PER_PAGE = 10;

let currentPage = 1;

function filterProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value.toLowerCase();

  const filteredProducts = allProducts.filter((product) => {
    const matchesName = product.name.toLowerCase().includes(searchTerm);

    const matchesCategory =
      !selectedCategory || product.category?.toLowerCase() === selectedCategory;

    return matchesName && matchesCategory;
  });

  productGrid.replaceChildren();

  if (filteredProducts.length === 0) {
    productsMessage.textContent =
      "No encontramos productos con esos criterios.";

    pagination.hidden = true;
    return;
  }

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  // Evitar permanecer en una página que ya no existe.
  currentPage = Math.min(currentPage, totalPages);

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;

  const productsToDisplay = filteredProducts.slice(startIndex, endIndex);

  const fragment = document.createDocumentFragment();

  productsToDisplay.forEach((product) => {
    fragment.appendChild(createProductCard(product));
  });

  productGrid.appendChild(fragment);

  productsMessage.textContent = "";

  updatePagination(totalPages);
}

function updatePagination(totalPages) {
  pagination.hidden = totalPages <= 1;

  paginationInfo.textContent = `Página ${currentPage} de ${totalPages}`;

  previousPageButton.disabled = currentPage === 1;

  nextPageButton.disabled = currentPage === totalPages;
}

async function renderAdminNavigation() {
  try {
    const session = await validateSession();

    if (!session.valid || session.user.role !== "ADMIN") {
      return;
    }

    const headerActions = document.querySelector(".header-actions");

    if (!headerActions || document.querySelector("#admin-panel-link")) {
      return;
    }

    const adminLink = document.createElement("a");

    adminLink.id = "admin-panel-link";
    adminLink.href = "/admin-products.html";
    adminLink.textContent = "Administración";
    adminLink.className = "account-link";

    headerActions.prepend(adminLink);
  } catch (error) {
    console.error("Error al verificar el acceso administrativo:", error);
  }
}

function normalizeProducts(response) {
  return Array.isArray(response) ? response : [];
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const imageContainer = document.createElement("div");
  imageContainer.className = "product-image";

  imageContainer.classList.add("product-image-placeholder");
  imageContainer.textContent = "🐾";

  const info = document.createElement("div");
  info.className = "product-info";

  const name = document.createElement("h3");
  name.textContent = product.name ?? product.title ?? "Producto sin nombre";

  const button = document.createElement("button");

  button.type = "button";
  button.className = "button button-primary";
  button.textContent = "Ver producto";

  button.addEventListener("click", () => {
    const params = new URLSearchParams({
      id: String(product.id),
    });

    window.location.href = `/product-detail.html?${params.toString()}`;
  });

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = formatPrice(product.price);

  const stock = document.createElement("p");
  stock.className = "product-stock";

  const stockValue = product.stock ?? product.quantity;

  if (stockValue === undefined || stockValue === null) {
    stock.textContent = "";
  } else {
    stock.textContent = Number(stockValue) > 0 ? "Disponible" : "Agotado";

    stock.classList.toggle("out-of-stock", Number(stockValue) <= 0);
  }

  info.append(name, price, stock, button);
  card.append(imageContainer, info);

  return card;
}

async function loadProducts() {
  if (!productGrid || !productsMessage) {
    console.error(
      "No se encontraron #product-grid o #products-message en index.html.",
    );
    return;
  }

  productGrid.replaceChildren();
  productsMessage.textContent = "Cargando productos...";

  try {
    const response = await getProducts();


    // Guardar todos los productos para aplicar los filtros.
    allProducts = normalizeProducts(response);

    if (allProducts.length === 0) {
      productsMessage.textContent =
        "No hay productos disponibles para mostrar.";
      return;
    }

    // Mostrar productos aplicando los filtros actuales.
    filterProducts();
  } catch (error) {
    console.error("Error al cargar productos:", error);

    if (error.response?.status === 401) {
      productsMessage.textContent = "Inicia sesión para consultar el catálogo.";

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

updateCartHeader();
loadProducts();
renderAdminNavigation();

/* Navegación activa según la sección visible */
const navLinks = document.querySelectorAll(".main-nav .nav-link");

const navSections = document.querySelectorAll(
  "#inicio, #categorias, #destacados",
);

function updateActiveNav() {
  const scrollPosition = window.scrollY + 160;
  let currentSection = "inicio";

  navSections.forEach((section) => {
    if (section.offsetTop <= scrollPosition) {
      currentSection = section.id;
    }
  });

  navLinks.forEach((link) => {
    const target = link.getAttribute("href");
    const isActive = target === `#${currentSection}`;

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

window.addEventListener("scroll", updateActiveNav, { passive: true });
window.addEventListener("load", updateActiveNav);
updateActiveNav();

searchInput.addEventListener("input", () => {
  currentPage = 1;
  filterProducts();
});

categoryFilter.addEventListener("change", () => {
  currentPage = 1;
  filterProducts();
});

clearFiltersButton.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "";

  currentPage = 1;
  filterProducts();
});

document.querySelectorAll(".category-card").forEach((card) => {
  card.addEventListener("click", () => {
    const category = card.dataset.category;

    const categoryMap = {
      alimentos: "Alimentos",
      accesorios: "Accesorios",
      higiene: "Higiene",
      camas: "Camas y descanso",
      juguetes: "Juguetes",
    };

    categoryFilter.value = categoryMap[category] || "";
    currentPage = 1;

    filterProducts();
  });
});

previousPageButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    filterProducts();

    document.querySelector("#destacados").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
});

nextPageButton.addEventListener("click", () => {
  currentPage++;
  filterProducts();

  document.querySelector("#destacados").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

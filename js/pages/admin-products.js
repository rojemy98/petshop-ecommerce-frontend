import { validateSession, logout } from "../services/auth-service.js";

import {
  getAdminProducts,
  createProduct,
  updateProduct,
} from "../api/products-api.js";

import { getInvoices } from "../api/invoices-api.js";

const formSection = document.querySelector("#product-form-section");
const productForm = document.querySelector("#product-form");
const formTitle = document.querySelector("#product-form-title");
const formMessage = document.querySelector("#product-form-message");

const nameInput = document.querySelector("#product-name");
const priceInput = document.querySelector("#product-price");
const stockInput = document.querySelector("#product-stock");

const showFormButton = document.querySelector("#show-product-form");
const cancelFormButton = document.querySelector("#cancel-product-form");
const saveButton = document.querySelector("#save-product-button");

const tableBody = document.querySelector("#products-table-body");
const productsMessage = document.querySelector("#products-message");
const searchInput = document.querySelector("#product-search");
const categoryInput = document.querySelector("#product-category");

const salesMessage = document.querySelector("#sales-message");
const salesTableBody = document.querySelector("#sales-table-body");
const totalInvoicesElement = document.querySelector("#total-invoices");
const totalSalesElement = document.querySelector("#total-sales");

let products = [];
let editingProductId = null;

function formatDate(value) {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function renderSales(invoices) {
  salesTableBody.replaceChildren();

  if (!Array.isArray(invoices)) {
    salesMessage.textContent =
      "La respuesta de ventas no tiene un formato válido.";
    return;
  }

  totalInvoicesElement.textContent = invoices.length;

  const paidInvoices = invoices.filter((invoice) => invoice.status === "PAID");

  const totalSales = paidInvoices.reduce(
    (total, invoice) => total + Number(invoice.total || 0),
    0,
  );

  totalSalesElement.textContent = formatPrice(totalSales);

  if (invoices.length === 0) {
    salesMessage.textContent = "Todavía no hay ventas registradas.";
    return;
  }

  salesMessage.textContent = `Se encontraron ${invoices.length} factura(s).`;

  const fragment = document.createDocumentFragment();

  invoices.forEach((invoice) => {
    const row = document.createElement("tr");

    row.append(
      createCell(invoice.invoice_number),
      createCell(invoice.user_id),
      createCell(formatDate(invoice.purchase_date)),
      createCell(invoice.status),
      createCell(formatPrice(invoice.total)),
    );

    fragment.append(row);
  });

  salesTableBody.append(fragment);
}

async function loadSales() {
  salesMessage.textContent = "Cargando ventas...";

  try {
    const invoices = await getInvoices();

    renderSales(invoices);
  } catch (error) {
    console.error("Error al cargar ventas:", error);

    if (error.response?.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    salesMessage.textContent =
      error.response?.data?.message ||
      "No fue posible cargar el historial de ventas.";
  }
}

function normalizeProducts(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.products)) return response.products;
  return [];
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(Number(value));
}

function showFormMessage(message, type = "error") {
  formMessage.textContent = message;
  formMessage.style.color = type === "success" ? "#386641" : "#a12b22";
}

function resetForm() {
  productForm.reset();
  editingProductId = null;

  formTitle.textContent = "Nuevo producto";
  saveButton.textContent = "Guardar producto";

  showFormMessage("");
  formSection.hidden = true;
  showFormButton.hidden = false;
}

function openCreateForm() {
  resetForm();

  formSection.hidden = false;
  showFormButton.hidden = true;

  formSection.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

function openEditForm(product) {
  editingProductId = product.id;

  nameInput.value = product.name;
  priceInput.value = product.price;
  stockInput.value = product.stock;
  categoryInput.value = product.category;

  formTitle.textContent = "Editar producto";
  saveButton.textContent = "Actualizar producto";

  formSection.hidden = false;
  showFormButton.hidden = true;

  formSection.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

function createCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  return cell;
}

function createActionButton(label, className, callback) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = label;
  button.className = className;
  button.addEventListener("click", callback);

  return button;
}

function renderProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm),
  );

  tableBody.replaceChildren();

  if (filteredProducts.length === 0) {
    productsMessage.textContent = "No se encontraron productos.";
    return;
  }

  productsMessage.textContent = "";

  const fragment = document.createDocumentFragment();

  filteredProducts.forEach((product) => {
    const row = document.createElement("tr");

    const statusCell = document.createElement("td");
    const status = document.createElement("span");

    status.className = product.is_active
      ? "product-status active"
      : "product-status inactive";

    status.textContent = product.is_active ? "Activo" : "Inactivo";
    statusCell.append(status);

    const actionsCell = document.createElement("td");
    actionsCell.className = "admin-actions";

    const editButton = createActionButton(
      "Editar",
      "button button-secondary",
      () => openEditForm(product),
    );

    const toggleButton = createActionButton(
      product.is_active ? "Desactivar" : "Reactivar",
      "button button-secondary",
      () => toggleProductStatus(product),
    );

    actionsCell.append(editButton, toggleButton);

    row.append(
      createCell(product.id),
      createCell(product.name),
      createCell(product.category),
      createCell(formatPrice(product.price)),
      createCell(product.stock),
      statusCell,
      actionsCell,
    );

    fragment.append(row);
  });

  tableBody.append(fragment);
}

async function loadProducts() {
  productsMessage.textContent = "Cargando productos...";

  try {
    const response = await getAdminProducts();

    products = normalizeProducts(response);

    renderProducts();
  } catch (error) {
    console.error("Error al cargar productos:", error);

    if (error.response?.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    productsMessage.textContent =
      error.response?.data?.message || "No fue posible cargar los productos.";
  }
}

async function toggleProductStatus(product) {
  const newStatus = !product.is_active;

  const action = newStatus ? "reactivar" : "desactivar";

  const confirmed = window.confirm(
    `¿Estás seguro de que deseas ${action} "${product.name}"?`,
  );

  if (!confirmed) return;

  try {
    await updateProduct(product.id, {
      is_active: newStatus,
    });

    await loadProducts();
  } catch (error) {
    console.error("Error al cambiar estado:", error);

    window.alert(
      error.response?.data?.message ||
        "No fue posible actualizar el estado del producto.",
    );
  }
}

function validateProductForm() {
  const name = nameInput.value.trim();
  const price = Number(priceInput.value);
  const stock = Number(stockInput.value);
  const category = categoryInput.value.trim();

  if (!category) {
    showFormMessage("Selecciona una categoría.");
    categoryInput.focus();
    return false;
  }

  if (!name || name.length > 150) {
    showFormMessage("Ingresa un nombre válido.");
    nameInput.focus();
    return false;
  }

  if (!Number.isFinite(price) || price < 0) {
    showFormMessage("Ingresa un precio válido.");
    priceInput.focus();
    return false;
  }

  if (!Number.isSafeInteger(stock) || stock < 0) {
    showFormMessage("El inventario debe ser un número entero no negativo.");
    stockInput.focus();
    return false;
  }

  return true;
}

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showFormMessage("");

  if (!validateProductForm()) return;

  const productData = {
    name: nameInput.value.trim(),
    category: categoryInput.value,
    price: Number(priceInput.value),
    stock: Number(stockInput.value),
  };

  saveButton.disabled = true;

  try {
    if (editingProductId !== null) {
      await updateProduct(editingProductId, productData);
    } else {
      await createProduct(productData);
    }

    resetForm();
    await loadProducts();
  } catch (error) {
    console.error("Error al guardar producto:", error);

    showFormMessage(
      error.response?.data?.message || "No fue posible guardar el producto.",
    );
  } finally {
    saveButton.disabled = false;
  }
});

showFormButton.addEventListener("click", openCreateForm);

cancelFormButton.addEventListener("click", resetForm);

searchInput.addEventListener("input", renderProducts);

async function initializeAdminPage() {
  try {
    const session = await validateSession();

    if (!session.valid) {
      window.location.href = "/login.html";
      return;
    }

    if (session.user.role !== "ADMIN") {
      window.location.href = "/index.html";
      return;
    }

    await Promise.all([loadProducts(), loadSales()]);
  } catch (error) {
    console.error("Error al validar sesión:", error);

    productsMessage.textContent =
      "No fue posible verificar tu sesión. Inténtalo nuevamente.";
  }
}

initializeAdminPage();

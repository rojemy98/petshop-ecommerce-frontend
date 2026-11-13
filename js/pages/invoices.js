import { formatPrice, formatDate } from "../utils/formatters.js";
import { getInvoices, getInvoiceByNumber } from "../api/invoices-api.js";
import { validateSession } from "../services/auth-service.js";
import { formatMessage } from "../utils/messages.js";

const invoicesMessage = document.querySelector("#invoices-message");
const invoicesList = document.querySelector("#invoices-list");
const invoiceDetail = document.querySelector("#invoice-detail");
const invoiceDetailContent = document.querySelector("#invoice-detail-content");
const backButton = document.querySelector("#back-to-invoices");

function showMessage(message, type = "") {
  formatMessage(invoicesMessage, message, type);
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;

  return element;
}

function getErrorMessage(error) {
  if (error.response?.status === 401) {
    return "Tu sesión expiró. Inicia sesión para consultar tus facturas.";
  }

  return (
    error.response?.data?.message ||
    error.message ||
    "No se pudieron cargar las facturas."
  );
}

function renderInvoices(invoices) {
  invoicesList.replaceChildren();

  if (!Array.isArray(invoices) || invoices.length === 0) {
    showMessage("Todavía no tienes facturas registradas.");
    return;
  }

  showMessage(`Encontramos ${invoices.length} factura(s).`);

  invoices.forEach((invoice) => {
    const card = createElement("article", "invoice-card");

    const title = createElement(
      "h2",
      "",
      invoice.invoice_number || "Factura sin número",
    );

    const date = createElement(
      "p",
      "invoice-date",
      formatDate(invoice.purchase_date),
    );

    const status = createElement(
      "span",
      "invoice-status",
      invoice.status || "Sin estado",
    );

    const total = createElement(
      "p",
      "invoice-total",
      formatPrice(invoice.total),
    );

    const button = createElement("button", "primary-button", "Ver factura");

    button.type = "button";
    button.addEventListener("click", () => {
      openInvoice(invoice.invoice_number);
    });

    card.append(title, date, status, total, button);
    invoicesList.append(card);
  });
}

function renderInvoiceDetail(invoice) {
  invoiceDetailContent.replaceChildren();

  const title = createElement("h2", "", `Factura ${invoice.invoice_number}`);

  const date = createElement(
    "p",
    "",
    `Fecha: ${formatDate(invoice.purchase_date)}`,
  );

  const status = createElement(
    "p",
    "",
    `Estado: ${invoice.status || "No disponible"}`,
  );

  const productsTitle = createElement("h3", "", "Productos");

  const productsList = createElement("div", "invoice-products");
  const products = Array.isArray(invoice.products) ? invoice.products : [];

  if (products.length === 0) {
    productsList.append(
      createElement("p", "", "No hay productos disponibles para mostrar."),
    );
  } else {
    products.forEach((product) => {
      const row = createElement("div", "invoice-product");

      const name = createElement(
        "span",
        "",
        product.product_name ||
          product.name ||
          product.product?.name ||
          `Producto #${product.product_id ?? product.id ?? ""}`,
      );

      const quantity = createElement(
        "span",
        "",
        `Cantidad: ${product.quantity ?? "—"}`,
      );

      const price = createElement(
        "span",
        "",
        formatPrice(
          product.subtotal ??
            product.total ??
            Number(product.quantity || 0) *
              Number(product.price_at_purchase ?? product.price ?? 0),
        ),
      );

      row.append(name, quantity, price);
      productsList.append(row);
    });
  }

  const total = createElement(
    "p",
    "invoice-detail-total",
    `Total: ${formatPrice(invoice.total)}`,
  );

  invoiceDetailContent.append(
    title,
    date,
    status,
    productsTitle,
    productsList,
    total,
  );
}

async function openInvoice(invoiceNumber) {
  if (!invoiceNumber) return;

  showMessage("Cargando factura...");

  try {
    const invoice = await getInvoiceByNumber(invoiceNumber);

    renderInvoiceDetail(invoice);

    invoicesList.hidden = true;
    invoiceDetail.hidden = false;

    showMessage("");

    // Esperar a que el navegador actualice la vista antes de desplazarse.
    requestAnimationFrame(() => {
      invoiceDetail.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  } catch (error) {
    showMessage(getErrorMessage(error), "error-message");
  }
}

backButton.addEventListener("click", () => {
  invoiceDetail.hidden = true;
  invoicesList.hidden = false;

  invoiceDetailContent.replaceChildren();
  showMessage("");

  // Regresar al inicio de la página de facturas.
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

async function init() {
  showMessage("Validando sesión...");

  try {
    const session = await validateSession();

    if (!session.valid) {
      window.location.href = "/login.html";
      return;
    }

    const invoices = await getInvoices();
    renderInvoices(invoices);
  } catch (error) {
    showMessage(
      error.response?.status >= 500 || !error.response
        ? "No pudimos verificar tu sesión. Comprueba tu conexión e inténtalo nuevamente."
        : getErrorMessage(error),
      "error-message",
    );
  }
}

init();

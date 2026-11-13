import { renderSessionHeader } from "../services/session-header.js";
import { getInvoiceByNumber } from "../api/invoices-api.js";
import { validateSession, getUserId } from "../services/auth-service.js";
import { formatPrice } from "../utils/formatters.js";
import { formatMessage } from "../utils/messages.js";

renderSessionHeader();

const invoice = document.querySelector("#confirmation-invoice"),
  total = document.querySelector("#confirmation-total"),
  msg = document.querySelector("#confirmation-message");

async function init() {
  const session = await validateSession();

  if (!session.valid) {
    location.href = "/login.html";
    return;
  }

  let saved;

  try {
    saved = JSON.parse(
      localStorage.getItem(`mokka_pets_last_purchase:user:${getUserId()}`) || "null",
    );
  } catch {
    saved = null;
  }

  if (!saved?.invoice_number) {
    formatMessage(
      msg,
      "No encontramos una compra reciente. Puedes consultar tus facturas.",
      "error",
    );
    return;
  }

  invoice.textContent = saved.invoice_number;
  total.textContent = formatPrice(saved.total);

  try {
    const detail = await getInvoiceByNumber(saved.invoice_number);
    if (detail?.total != null) total.textContent = formatPrice(detail.total);
  } catch {
    /* La confirmación guardada permite recargar aunque el detalle no responda. */
  }
}

init().catch((e) =>
  formatMessage(
    msg,
    e.message || "No fue posible recuperar la confirmación.",
    "error",
  ),
);

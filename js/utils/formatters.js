const priceFormatter = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
});

const dateFormatter = new Intl.DateTimeFormat("es-CR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatPrice(value) {
  if (value === null || value === undefined || value === "") {
    return "Precio no disponible";
  }

  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "Precio no disponible";
  }

  return priceFormatter.format(price);
}

export function formatDate(value) {
  if (!value) {
    return "Fecha no disponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return dateFormatter.format(date);
}

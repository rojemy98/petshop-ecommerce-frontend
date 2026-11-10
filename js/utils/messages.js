export function formatMessage(element, text, type = "") {
  if (!element) return;

  element.textContent = text;
  element.className = "";

  if (type === "success" || type === "success-message") {
    element.classList.add("success-message");
  } else if (type === "error" || type === "error-message") {
    element.classList.add("error-message");
  }
}

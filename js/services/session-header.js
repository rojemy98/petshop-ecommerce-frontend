import { getToken } from "./session-storage.js";
import { logout } from "./auth-service.js";

export function renderSessionHeader() {
  if (!getToken() || document.querySelector("#logout-button")) {
    return;
  }

  const header = document.querySelector(".site-header");
  const navigation = header?.querySelector("nav, .header-actions");

  if (!header) return;

  let target = navigation;

  if (!target) {
    target = document.createElement("nav");
    target.className = "header-actions";
    target.setAttribute("aria-label", "Acciones de cuenta");
    header.append(target);
  }

  const logoutButton = document.createElement("button");
  logoutButton.id = "logout-button";
  logoutButton.type = "button";
  logoutButton.className = "button button-secondary";
  logoutButton.textContent = "Cerrar sesión";
  logoutButton.addEventListener("click", logout);

  target.append(logoutButton);
}

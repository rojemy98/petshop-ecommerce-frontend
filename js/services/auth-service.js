import { loginRequest, getCurrentUser } from "../api/auth-api.js";
import { clearCart } from "./cart-service.js";

const TOKEN_KEY = "access_token";

export async function login(email, password) {
  const data = await loginRequest({ email, password });

  if (
    typeof data.access_token !== "string" ||
    data.access_token.trim() === ""
  ) {
    throw new Error("El servidor no devolvió un token válido.");
  }

  localStorage.setItem(TOKEN_KEY, data.access_token);

  return data;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  // Eliminar el carrito asociado a la sesión actual.
  clearCart();

  localStorage.removeItem(TOKEN_KEY);

  window.location.href = "/login.html";
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function validateSession() {
  const token = getToken();

  if (!token) {
    return {
      valid: false,
      user: null,
    };
  }

  try {
    const data = await getCurrentUser();

    if (!data?.user) {
      return {
        valid: false,
        user: null,
      };
    }

    return {
      valid: true,
      user: data.user,
    };
  } catch (error) {
    if (error.response?.status === 401) {
      clearCart();
      localStorage.removeItem(TOKEN_KEY);

      return {
        valid: false,
        user: null,
      };
    }

    // Un error de conexión no significa necesariamente que
    // la sesión haya expirado.
    throw error;
  }
}

// Añade una acción de cierre de sesión a la navegación de páginas autenticadas.
function addLogoutControl() {
  if (!getToken() || document.querySelector("#logout-button")) return;
  const nav = document.querySelector(".site-header nav");
  if (!nav) return;
  const button = document.createElement("button");
  button.id = "logout-button"; button.type = "button"; button.className = "button button-secondary"; button.textContent = "Cerrar sesión";
  button.addEventListener("click", logout); nav.append(button);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addLogoutControl);
else addLogoutControl();

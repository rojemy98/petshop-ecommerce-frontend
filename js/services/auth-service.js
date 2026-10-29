import { loginRequest, getCurrentUser } from "../api/auth-api.js";

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
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);

      return {
        valid: false,
        user: null,
      };
    }

    // Un error de red o del servidor no demuestra que
    // la sesión haya expirado.
    throw error;
  }
}

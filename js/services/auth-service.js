import { loginRequest, getCurrentUser } from "../api/auth-api.js";
import { clearCart, migrateCartToUser } from "./cart-service.js";
import {
  getToken,
  getUserId,
  saveUserId,
  migrateLastPurchase,
  removeLastPurchase,
  TOKEN_KEY,
  USER_ID_KEY,
} from "./session-storage.js";

export { getToken, getUserId };

export async function login(email, password) {
  const previousToken = getToken();
  const data = await loginRequest({ email, password });

  if (
    typeof data.access_token !== "string" ||
    data.access_token.trim() === ""
  ) {
    throw new Error("El servidor no devolvió un token válido.");
  }

  localStorage.setItem(TOKEN_KEY, data.access_token);

  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser.user?.id;

    if (userId === null || userId === undefined) {
      throw new Error("El servidor no devolvió el identificador del usuario.");
    }

    saveUserId(userId);
    migrateCartToUser(userId, previousToken);
    migrateLastPurchase(previousToken, userId);

    return data;
  } catch (error) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    throw error;
  }
}

export function logout() {
  const userId = getUserId();

  clearCart();
  removeLastPurchase(userId);

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);

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

    const userId = data.user.id;

    if (userId === null || userId === undefined) {
      throw new Error("El servidor no devolvió el identificador del usuario.");
    }

    saveUserId(userId);
    migrateCartToUser(userId, token);
    migrateLastPurchase(token, userId);

    return {
      valid: true,
      user: data.user,
    };
  } catch (error) {
    if (error.response?.status === 401) {
      clearCart();
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);

      return {
        valid: false,
        user: null,
      };
    }

    throw error;
  }
}

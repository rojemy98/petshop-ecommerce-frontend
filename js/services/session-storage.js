export const TOKEN_KEY = "access_token";
export const USER_ID_KEY = "user_id";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUserId() {
  return localStorage.getItem(USER_ID_KEY);
}

export function saveUserId(userId) {
  if (userId !== null && userId !== undefined) {
    localStorage.setItem(USER_ID_KEY, String(userId));
  }
}

export function migrateLastPurchase(previousToken, userId) {
  if (!previousToken || !userId) return;

  const previousKey = `mokka_pets_last_purchase:${previousToken}`;
  const stableKey = `mokka_pets_last_purchase:user:${userId}`;
  const previousPurchase = localStorage.getItem(previousKey);

  if (previousPurchase && !localStorage.getItem(stableKey)) {
    localStorage.setItem(stableKey, previousPurchase);
  }

  // Remove token-based purchase records to prevent stale keys accumulating.
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);

    if (
      key?.startsWith("mokka_pets_last_purchase:") &&
      !key.startsWith("mokka_pets_last_purchase:user:") &&
      key !== stableKey
    ) {
      localStorage.removeItem(key);
    }
  }
}

export function removeLastPurchase(userId) {
  if (userId) {
    localStorage.removeItem(`mokka_pets_last_purchase:user:${userId}`);
  }
}

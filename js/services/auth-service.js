
import { loginRequest } from "../api/auth-api.js";

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

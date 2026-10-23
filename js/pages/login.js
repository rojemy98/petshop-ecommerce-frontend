
import { login } from "../services/auth-service.js";

const form = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const message = document.querySelector("#form-message");
const submitButton = document.querySelector("#login-button");

function showMessage(text) {
  message.textContent = text;
}

function validateForm() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  emailInput.setAttribute("aria-invalid", "false");
  passwordInput.setAttribute("aria-invalid", "false");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email) || email.length > 254) {
    emailInput.setAttribute("aria-invalid", "true");
    showMessage("Ingresa un correo electrónico válido.");
    emailInput.focus();
    return false;
  }

  if (!password || password.length > 128) {
    passwordInput.setAttribute("aria-invalid", "true");
    showMessage("Ingresa una contraseña válida.");
    passwordInput.focus();
    return false;
  }

  return true;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("");

  if (!validateForm()) {
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Iniciando sesión...";

  try {
    await login(emailInput.value.trim(), passwordInput.value);

    showMessage("");
    window.location.href = "/index.html";
  } catch (error) {
    console.error("Error durante el login:", error);

    const status = error.response?.status;

    if (status === 401) {
      showMessage("Correo o contraseña incorrectos.");
    } else if (status === 400) {
      showMessage("Verifica los datos ingresados.");
    } else if (error.response) {
      showMessage(
        error.response.data?.message ||
        "No fue posible iniciar sesión. Inténtalo nuevamente."
      );
    } else {
      showMessage(
        "No pudimos conectar con el servidor. Comprueba que el backend esté funcionando."
      );
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Iniciar sesión";
  }
});

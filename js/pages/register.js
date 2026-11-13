import { registerRequest } from "../api/auth-api.js";

const form = document.querySelector("#register-form");

const nameInput = document.querySelector("#name");
const lastNameInput = document.querySelector("#last_name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirm-password");

const message = document.querySelector("#form-message");
const submitButton = document.querySelector("#register-button");

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className =
    type === "success"
      ? "success-message"
      : type === "error"
        ? "error-message"
        : "";
}

function validateForm() {
  const name = nameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[\p{L}]+(?:[\s\p{L}]*[\p{L}]+)?$/u;

  const inputs = [
    nameInput,
    lastNameInput,
    emailInput,
    passwordInput,
    confirmPasswordInput,
  ];

  inputs.forEach((input) => {
    input.setAttribute("aria-invalid", "false");
  });

  if (!name || name.length > 100 || !nameRegex.test(name)) {
    nameInput.setAttribute("aria-invalid", "true");
    showMessage(
      "Ingresa un nombre válido. Utiliza únicamente letras y espacios.",
    );
    nameInput.focus();
    return false;
  }

  if (!lastName || lastName.length > 100 || !nameRegex.test(lastName)) {
    lastNameInput.setAttribute("aria-invalid", "true");
    showMessage(
      "Ingresa apellidos válidos. Utiliza únicamente letras y espacios.",
    );
    lastNameInput.focus();
    return false;
  }

  if (!email || !emailRegex.test(email) || email.length > 254) {
    emailInput.setAttribute("aria-invalid", "true");
    showMessage("Ingresa un correo electrónico válido.");
    emailInput.focus();
    return false;
  }

  if (password.length < 8 || password.length > 128) {
    passwordInput.setAttribute("aria-invalid", "true");
    showMessage("La contraseña debe tener entre 8 y 128 caracteres.");
    passwordInput.focus();
    return false;
  }

  if (password !== confirmPassword) {
    confirmPasswordInput.setAttribute("aria-invalid", "true");
    showMessage("Las contraseñas no coinciden.");
    confirmPasswordInput.focus();
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
  submitButton.textContent = "Creando cuenta...";

  const userData = {
    name: nameInput.value.trim(),
    last_name: lastNameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
  };

  try {
    await registerRequest(userData);

    showMessage("Cuenta creada correctamente. Redirigiendo...", "success");

    form.reset();

    window.location.href = "/login.html";
  } catch (error) {
    console.error("Error durante el registro:", error);

    const status = error.response?.status;
    const responseMessage = error.response?.data?.message;

    if (status === 400) {
      showMessage(responseMessage || "Verifica los datos ingresados.");
    } else if (status === 409) {
      showMessage("Este correo electrónico ya está registrado.");
    } else if (error.response) {
      showMessage(
        responseMessage ||
          "No fue posible crear tu cuenta. Inténtalo nuevamente.",
      );
    } else {
      showMessage(
        "No pudimos conectar con el servidor. Comprueba que el backend esté funcionando.",
      );
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Crear cuenta";
  }
});

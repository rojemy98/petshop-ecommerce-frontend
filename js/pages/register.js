import { registerRequest } from "../api/auth-api.js";

const form = document.querySelector("#register-form");

const nameInput = document.querySelector("#name");
const lastNameInput = document.querySelector("#last_name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirm-password");

const message = document.querySelector("#form-message");
const submitButton = document.querySelector("#register-button");

function showMessage(text) {
  message.textContent = text;
}

function validateForm() {
  const name = nameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  if (!name || name.length > 100) {
    nameInput.setAttribute("aria-invalid", "true");
    showMessage("Ingresa un nombre válido.");
    nameInput.focus();
    return false;
  }

  if (!lastName || lastName.length > 100) {
    lastNameInput.setAttribute("aria-invalid", "true");
    showMessage("Ingresa tus apellidos.");
    lastNameInput.focus();
    return false;
  }

  if (!email || !emailRegex.test(email) || email.length > 254) {
    emailInput.setAttribute("aria-invalid", "true");
    showMessage("Ingresa un correo electrónico válido.");
    emailInput.focus();
    return false;
  }

  if (!password) {
    passwordInput.setAttribute("aria-invalid", "true");
    showMessage("Ingresa una contraseña.");
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

    showMessage("Cuenta creada correctamente. Redirigiendo...");

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

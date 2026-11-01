import { validateSession } from "../services/auth-service.js";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../api/auth-api.js";

const form = document.querySelector("#profile-form");

const nameInput = document.querySelector("#name");
const lastNameInput = document.querySelector("#last-name");
const emailInput = document.querySelector("#email");

const message = document.querySelector("#form-message");
const saveButton = document.querySelector("#save-profile-button");

const passwordForm = document.querySelector("#password-form");

const currentPasswordInput = document.querySelector("#current-password");
const newPasswordInput = document.querySelector("#new-password");
const confirmPasswordInput = document.querySelector("#confirm-password");

const passwordMessage = document.querySelector("#password-message");
const changePasswordButton = document.querySelector("#change-password-button");

function showPasswordMessage(text, type = "error") {
  passwordMessage.textContent = text;

  passwordMessage.style.color = type === "success" ? "#386641" : "#a12b22";
}

function validatePasswordForm() {
  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  [currentPasswordInput, newPasswordInput, confirmPasswordInput].forEach(
    (input) => {
      input.setAttribute("aria-invalid", "false");
    },
  );

  if (!currentPassword) {
    currentPasswordInput.setAttribute("aria-invalid", "true");
    showPasswordMessage("Ingresa tu contraseña actual.");
    currentPasswordInput.focus();
    return false;
  }

  if (newPassword.length < 8 || newPassword.length > 128) {
    newPasswordInput.setAttribute("aria-invalid", "true");
    showPasswordMessage(
      "La nueva contraseña debe tener entre 8 y 128 caracteres.",
    );
    newPasswordInput.focus();
    return false;
  }

  if (newPassword !== confirmPassword) {
    confirmPasswordInput.setAttribute("aria-invalid", "true");
    showPasswordMessage("Las contraseñas nuevas no coinciden.");
    confirmPasswordInput.focus();
    return false;
  }

  return true;
}

function showMessage(text, type = "error") {
  message.textContent = text;

  message.style.color = type === "success" ? "#386641" : "#a12b22";
}

function validateForm() {
  const name = nameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();

  [nameInput, lastNameInput, emailInput].forEach((input) => {
    input.setAttribute("aria-invalid", "false");
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || name.length > 100) {
    nameInput.setAttribute("aria-invalid", "true");
    showMessage("Ingresa un nombre válido.");
    nameInput.focus();
    return false;
  }

  if (!lastName || lastName.length > 100) {
    lastNameInput.setAttribute("aria-invalid", "true");
    showMessage("Ingresa un apellido válido.");
    lastNameInput.focus();
    return false;
  }

  if (!email || email.length > 150 || !emailRegex.test(email)) {
    emailInput.setAttribute("aria-invalid", "true");
    showMessage("Ingresa un correo electrónico válido.");
    emailInput.focus();
    return false;
  }

  return true;
}

async function loadProfile() {
  saveButton.disabled = true;
  saveButton.textContent = "Cargando perfil...";

  try {
    const session = await validateSession();

    if (!session.valid) {
      window.location.href = "/login.html";
      return;
    }

    const data = await getUserProfile();
    const user = data.user;

    if (!user) {
      throw new Error("No se pudo obtener la información del usuario.");
    }

    nameInput.value = user.name ?? "";
    lastNameInput.value = user.last_name ?? "";
    emailInput.value = user.email ?? "";
  } catch (error) {
    console.error("Error al cargar el perfil:", error);

    if (error.response?.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    showMessage(
      error.response?.data?.message ||
        "No fue posible cargar tu perfil. Inténtalo nuevamente.",
    );
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Guardar cambios";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("");

  if (!validateForm()) {
    return;
  }

  const profileData = {
    name: nameInput.value.trim(),
    last_name: lastNameInput.value.trim(),
    email: emailInput.value.trim(),
  };

  saveButton.disabled = true;
  saveButton.textContent = "Guardando cambios...";

  try {
    const response = await updateUserProfile(profileData);

    const updatedUser = response.user;

    if (updatedUser) {
      nameInput.value = updatedUser.name;
      lastNameInput.value = updatedUser.last_name;
      emailInput.value = updatedUser.email;
    }

    showMessage("Tu perfil se actualizó correctamente.", "success");
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);

    const status = error.response?.status;

    if (status === 401) {
      window.location.href = "/login.html";
      return;
    }

    if (status === 400) {
      showMessage(
        error.response.data?.message || "Verifica la información ingresada.",
      );
    } else {
      showMessage(
        error.response?.data?.message ||
          "No fue posible actualizar tu perfil. Inténtalo nuevamente.",
      );
    }
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Guardar cambios";
  }
});

passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showPasswordMessage("");

  if (!validatePasswordForm()) {
    return;
  }

  const passwordData = {
    current_password: currentPasswordInput.value,
    new_password: newPasswordInput.value,
    confirm_password: confirmPasswordInput.value,
  };

  changePasswordButton.disabled = true;
  changePasswordButton.textContent = "Actualizando contraseña...";

  try {
    const response = await changeUserPassword(passwordData);

    passwordForm.reset();

    showPasswordMessage(
      response.message || "Tu contraseña se actualizó correctamente.",
      "success",
    );
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);

    if (error.response?.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    showPasswordMessage(
      error.response?.data?.message ||
        "No fue posible actualizar tu contraseña. Inténtalo nuevamente.",
    );
  } finally {
    changePasswordButton.disabled = false;
    changePasswordButton.textContent = "Actualizar contraseña";
  }
});

loadProfile();

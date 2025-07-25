// js/login.js

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const messageDiv = document.getElementById("loginMessage");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    messageDiv.textContent = "";
    messageDiv.className = "";

    if (!email || !password) {
      messageDiv.textContent = "Completa todos los campos.";
      messageDiv.className = "error";
      return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "index.html"; // O dashboard.html si prefieres
      })
      .catch((error) => {
        messageDiv.textContent = "Error de autenticación.";
        messageDiv.className = "error";
        console.error(error);
      });
  });
});

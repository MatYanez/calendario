document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const messageDiv = document.getElementById("loginMessage");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    messageDiv.textContent = "";
    messageDiv.className = "";

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch((error) => {
        messageDiv.textContent = "Correo o contraseña incorrectos.";
        console.error(error);
      });
  });
});

//v1
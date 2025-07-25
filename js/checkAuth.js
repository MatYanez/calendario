// js/checkAuth.js

document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();

  firebase.auth().onAuthStateChanged(function(user) {
    // Redirigir solo si NO está en login.html y NO hay sesión
    if (!user && currentPage !== "login.html") {
      window.location.href = "login.html";
    }

    // Si ya está logueado y está en login.html, redirigir al dashboard
    if (user && currentPage === "login.html") {
      window.location.href = "index.html";
    }
  });

  // Función logout disponible en cualquier página
  window.logout = function () {
    firebase.auth().signOut()
      .then(() => window.location.href = "login.html")
      .catch(err => {
        console.error("Error al cerrar sesión:", err);
        alert("Error al cerrar sesión.");
      });
  };
});

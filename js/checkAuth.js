// js/checkAuth.js

document.addEventListener("DOMContentLoaded", () => {
  const check = setInterval(() => {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
          window.location.href = "login.html";
        }
      });

      window.logout = function () {
        firebase.auth().signOut()
          .then(() => {
            window.location.href = "login.html";
          })
          .catch((error) => {
            console.error("Error al cerrar sesión:", error);
            alert("Error al cerrar sesión.");
          });
      };

      clearInterval(check);
    }
  }, 100);
});

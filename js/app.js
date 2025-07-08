// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Función para iniciar sesión con email/password
function login(email, password) {
  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log("Usuario autenticado:", userCredential.user.uid);
      // aquí llamas a tu función que carga los datos del Firestore
      loadProjects();
    })
    .catch(error => {
      console.error("Error al iniciar sesión:", error);
    });
}

// Ejemplo: login al cargar la página (solo para prueba)
document.addEventListener('DOMContentLoaded', () => {
  // ⚠️ Aquí puedes reemplazar por un formulario en tu página
  login('usuario@ejemplo.com', 'contraseña123');
});

// Función para leer proyectos solo si está autenticado
function loadProjects() {
  db.collection("projects").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, "=>", doc.data());
      });
    })
    .catch(error => {
      console.error("Error al leer proyectos:", error);
    });
}

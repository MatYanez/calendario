// ✅ Configura Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBkOn-up3m6LVbEoWZh-7yT-sYFtCN_ja0",
  authDomain: "balesch-c4277.firebaseapp.com",
  projectId: "balesch-c4277",
  storageBucket: "balesch-c4277.appspot.com",
  messagingSenderId: "866172124153",
  appId: "1:866172124153:web:8ecd00f213e4886c0d9b28"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Elementos de la UI
const loginScreen = document.getElementById('login-screen');
const appScreen = document.querySelector('.app');
const loginBtn = document.getElementById('login-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Mostrar/ocultar según estado
auth.onAuthStateChanged(user => {
  if (user) {
    loginScreen.style.display = 'none';
    appScreen.style.display = 'flex';
    cargarProyectos();
  } else {
    loginScreen.style.display = 'flex';
    appScreen.style.display = 'none';
  }
});

// Login
loginBtn.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  auth.signInWithEmailAndPassword(email, password)
    .catch(error => {
      alert("Error de autenticación: " + error.message);
    });
});

// Logout (opcional: agrega un botón con id="logout-btn")
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => auth.signOut());
}

// Cargar proyectos de Firestore
function cargarProyectos() {
  const tbody = document.querySelector('#projects-table tbody');
  tbody.innerHTML = '';

  db.collection('proyectos').get().then(querySnapshot => {
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${data.nombre || ''}</td>
        <td>${data.prioridad || ''}</td>
        <td>${data.categorizacion || ''}</td>
        <td>${data.propietario || ''}</td>
        <td>${data.estado || ''}</td>
        <td>${data.limiteVraCat || ''}</td>
        <td>${data.vraCat || ''}</td>
        <td>${data.limiteFirma || ''}</td>
        <td>${data.firmaSg || ''}</td>
        <td>${data.fechaCierre || ''}</td>
        <td>${data.notas || ''}</td>
        <td>${data.distribuible ? 'Sí' : 'No'}</td>
      `;
      tbody.appendChild(tr);
    });
  }).catch(err => {
    console.error("Error al cargar proyectos: ", err);
  });
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      console.log("Sesión cerrada");
      location.reload(); // Opcional, recarga para volver al login
    })
    .catch((error) => {
      console.error("Error al cerrar sesión", error);
    });
});

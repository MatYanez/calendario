// Configura Firebase
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
const tbody = document.querySelector('#projects-table tbody');

// Manejar cambio de estado
auth.onAuthStateChanged(user => {
  if (user) {
    mostrarApp(user);
  } else {
    mostrarLogin();
  }
});

function mostrarLogin() {
  loginScreen.style.display = 'flex';
  appScreen.style.display = 'none';
  loginScreen.innerHTML = `
    <div class="login-box">
      <h1>Iniciar Sesión</h1>
      <input type="email" id="email" placeholder="Correo electrónico">
      <input type="password" id="password" placeholder="Contraseña">
      <button id="login-btn">Entrar</button>
    </div>
  `;

  document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
      .catch(err => alert(err.message));
  });
}

function mostrarApp(user) {
  loginScreen.style.display = 'none';
  appScreen.style.display = 'flex';

  cargarProyectos();

  // Agregar botón de logout si no existe
  if (!document.getElementById('logout-btn')) {
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logout-btn';
    logoutBtn.textContent = 'Cerrar sesión';
    logoutBtn.style.margin = '10px';
    logoutBtn.addEventListener('click', () => auth.signOut());
    appScreen.prepend(logoutBtn);
  }
}

function cargarProyectos() {
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
  }).catch(err => console.error(err));
}

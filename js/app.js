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


const hamburger = document.getElementById('hamburger');
const sidebar = document.querySelector('.sidebar');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}


// Inicializar modal Bootstrap
const addModal = new bootstrap.Modal(document.getElementById('addModal'));

document.querySelector('.add-btn').addEventListener('click', () => {
  addModal.show();
});

// Manejar “Otro”
function handleOtro(selectId, inputId) {
  const select = document.getElementById(selectId);
  const input = document.getElementById(inputId);
  select.addEventListener('change', () => {
    input.style.display = select.value === 'Otro' ? 'block' : 'none';
  });
}

handleOtro('proyecto', 'proyectoOtro');
handleOtro('p0', 'p0Otro');
handleOtro('estado', 'estadoOtro');
handleOtro('firmaSg', 'firmaSgOtro');




document.getElementById('addForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const getValue = (selectId, otroId) => {
    const select = document.getElementById(selectId);
    const otro = document.getElementById(otroId);
    return select.value === 'Otro' ? otro.value.trim() : select.value;
  };

  const proyecto = getValue('proyecto', 'proyectoOtro');
  const p0 = getValue('p0', 'p0Otro');
  const categorizacion = document.getElementById('categorizacion').value.trim();
  const propietario = document.getElementById('propietario').value.trim();
  const estado = getValue('estado', 'estadoOtro');
  const limiteVraCat = document.getElementById('limiteVraCat').value;
  const vraCat = document.getElementById('vraCat').value.trim();
  const limiteFirma = document.getElementById('limiteFirma').value;
  const firmaSg = getValue('firmaSg', 'firmaSgOtro');
  const fechaCierre = document.getElementById('fechaCierre').value;
  const notas = document.getElementById('notas').value.trim();
  const distribuible = document.getElementById('distribuible').value.trim();

  db.collection('proyectos').add({
    nombre: proyecto,
    prioridad: p0,
    categorizacion,
    propietario,
    estado,
    limiteVraCat,
    vraCat,
    limiteFirma,
    firmaSg,
    fechaCierre,
    notas,
    distribuible
  }).then(() => {
    console.log("Proyecto agregado");
    bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
    document.getElementById('addForm').reset();
    // Ocultar inputs “otro”
    document.querySelectorAll('#addForm input[type="text"]').forEach(input => {
      if (input.id.endsWith('Otro')) input.style.display = 'none';
    });
    cargarProyectos();
  }).catch(err => {
    console.error("Error al agregar proyecto: ", err);
    alert("Error al agregar proyecto: " + err.message);
  });
});

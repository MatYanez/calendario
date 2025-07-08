// Configura Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBkOn-up3m6LVbEoWZh-7yT-sYFtCN_ja0",
  authDomain: "balesch-c4277.firebaseapp.com",
  projectId: "balesch-c4277",
  storageBucket: "balesch-c4277.appspot.com",
  messagingSenderId: "866172124153",
  appId: "1:866172124153:web:8ecd00f213e4886c0d9b28"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// UI Elements
const loginScreen = document.getElementById('login-screen');
const appScreen = document.querySelector('.app');
const tbody = document.querySelector('#projects-table tbody');
const form = document.getElementById('addForm');
const addModalEl = document.getElementById('addModal');
const addModal = new bootstrap.Modal(addModalEl);

let editId = null;

// Estado de auth
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
    auth.signInWithEmailAndPassword(email, password).catch(err => alert(err.message));
  });
}

function mostrarApp(user) {
  loginScreen.style.display = 'none';
  appScreen.style.display = 'flex';
  cargarProyectos();
}

// Cargar tabla
function cargarProyectos() {
  tbody.innerHTML = '';

  db.collection('proyectos').get().then(snapshot => {
    snapshot.forEach(doc => {
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
        <td>${data.distribuible || ''}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn" data-id="${doc.id}">Editar</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${doc.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = () => editarProyecto(btn.dataset.id);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = () => eliminarProyecto(btn.dataset.id);
    });
  });
}

// Manejo “Otro”
function handleOtro(selectId, inputId) {
  const select = document.getElementById(selectId);
  const input = document.getElementById(inputId);
  select.addEventListener('change', () => {
    input.style.display = select.value === 'Otro' ? 'block' : 'none';
  });
}

['proyecto', 'p0', 'estado', 'firmaSg'].forEach(id => {
  handleOtro(id, id + 'Otro');
});

document.querySelector('.add-btn').addEventListener('click', () => {
  editId = null;
  form.reset();
  document.querySelectorAll('#addForm input[type="text"]').forEach(input => {
    if (input.id.endsWith('Otro')) input.style.display = 'none';
  });
  addModal.show();
});

// Enviar formulario
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const getValue = (selectId, otroId) => {
    const select = document.getElementById(selectId);
    const otro = document.getElementById(otroId);
    return select.value === 'Otro' ? otro.value.trim() : select.value;
  };

  const data = {
    nombre: getValue('proyecto', 'proyectoOtro'),
    prioridad: getValue('p0', 'p0Otro'),
    categorizacion: document.getElementById('categorizacion').value.trim(),
    propietario: document.getElementById('propietario').value.trim(),
    estado: getValue('estado', 'estadoOtro'),
    limiteVraCat: document.getElementById('limiteVraCat').value,
    vraCat: document.getElementById('vraCat').value.trim(),
    limiteFirma: document.getElementById('limiteFirma').value,
    firmaSg: getValue('firmaSg', 'firmaSgOtro'),
    fechaCierre: document.getElementById('fechaCierre').value,
    notas: document.getElementById('notas').value.trim(),
    distribuible: document.getElementById('distribuible').value.trim()
  };

  if (editId) {
    db.collection('proyectos').doc(editId).update(data).then(() => {
      console.log("Proyecto actualizado");
      addModal.hide();
      cargarProyectos();
      editId = null;
    }).catch(err => {
      alert("Error al actualizar: " + err.message);
    });
  } else {
    db.collection('proyectos').add(data).then(() => {
      console.log("Proyecto agregado");
      addModal.hide();
      cargarProyectos();
    }).catch(err => {
      alert("Error al agregar: " + err.message);
    });
  }
});

function eliminarProyecto(id) {
  if (confirm("¿Eliminar proyecto?")) {
    db.collection('proyectos').doc(id).delete().then(() => {
      cargarProyectos();
    }).catch(err => {
      alert("Error al eliminar: " + err.message);
    });
  }
}

function editarProyecto(id) {
  db.collection('proyectos').doc(id).get().then(doc => {
    if (!doc.exists) return;

    const data = doc.data();
    editId = id;

    document.getElementById('proyecto').value = data.nombre || '';
    document.getElementById('p0').value = data.prioridad || '';
    document.getElementById('categorizacion').value = data.categorizacion || '';
    document.getElementById('propietario').value = data.propietario || '';
    document.getElementById('estado').value = data.estado || '';
    document.getElementById('limiteVraCat').value = data.limiteVraCat || '';
    document.getElementById('vraCat').value = data.vraCat || '';
    document.getElementById('limiteFirma').value = data.limiteFirma || '';
    document.getElementById('firmaSg').value = data.firmaSg || '';
    document.getElementById('fechaCierre').value = data.fechaCierre || '';
    document.getElementById('notas').value = data.notas || '';
    document.getElementById('distribuible').value = data.distribuible || '';

    addModal.show();
  });
}

document.querySelectorAll('.sidebar .tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.sidebar .tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    // Aquí puedes cambiar contenido según tab.dataset.tab
  });
});

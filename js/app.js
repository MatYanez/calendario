// Inicializa Firebase
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

const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app');

document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log("Autenticado:", userCredential.user.uid);
      showApp();
    })
    .catch(err => {
      alert("Error: " + err.message);
    });
});

auth.onAuthStateChanged(user => {
  if (user) {
    showApp();
  } else {
    showLogin();
  }
});

function showApp() {
  loginScreen.style.display = 'none';
  appScreen.style.display = 'flex';
}

function showLogin() {
  loginScreen.style.display = 'flex';
  appScreen.style.display = 'none';
}

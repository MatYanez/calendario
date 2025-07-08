// Inicializa Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBkOn-up3m6LVbEoWZh-7yT-sYFtCN_ja0",
  authDomain: "balesch-c4277.firebaseapp.com",
  projectId: "balesch-c4277",
  storageBucket: "balesch-c4277.firebasestorage.app",
  messagingSenderId: "866172124153",
  appId: "1:866172124153:web:8ecd00f213e4886c0d9b28"
});

// Obtén la instancia de Firestore
const db = firebase.firestore();

// Ejemplo: prueba leer una colección
db.collection("proyectos").get().then(snapshot => {
  snapshot.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
}).catch(console.error);

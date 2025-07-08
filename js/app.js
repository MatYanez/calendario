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

// Ejemplo: lee una colección
db.collection("proyectos").get().then(snapshot => {
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data());
  });
});

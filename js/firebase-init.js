// js/firebase-init.js

function loadFirebaseScript(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = callback;
  script.defer = true;
  document.head.appendChild(script);
}

// Cargar scripts en orden
loadFirebaseScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js", () => {
  loadFirebaseScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js", () => {
    loadFirebaseScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js", () => {
      const firebaseConfig = {
        apiKey: "AIzaSyBkOn-up3m6LVbEoWZh-7yT-sYFtCN_ja0",
        authDomain: "balesch-c4277.firebaseapp.com",
        projectId: "balesch-c4277",
        storageBucket: "balesch-c4277.appspot.com",
        messagingSenderId: "866172124153",
        appId: "1:866172124153:web:8ecd00f213e4886c0d9b28"
      };
      firebase.initializeApp(firebaseConfig);
    });
  });
});


// v1
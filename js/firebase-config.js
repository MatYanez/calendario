// js/firebase-init.js

document.write('<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"><\/script>');
document.write('<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"><\/script>');
document.write('<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"><\/script>');

document.addEventListener('DOMContentLoaded', () => {
  const interval = setInterval(() => {
    if (typeof firebase !== 'undefined') {
      const firebaseConfig = {
        apiKey: "AIzaSyBkOn-up3m6LVbEoWZh-7yT-sYFtCN_ja0",
        authDomain: "balesch-c4277.firebaseapp.com",
        projectId: "balesch-c4277",
        storageBucket: "balesch-c4277.appspot.com",
        messagingSenderId: "866172124153",
        appId: "1:866172124153:web:8ecd00f213e4886c0d9b28"
      };
      firebase.initializeApp(firebaseConfig);
      clearInterval(interval);
    }
  }, 100);
});

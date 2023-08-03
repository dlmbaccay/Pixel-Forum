import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, browserLocalPersistence} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA_Ntm5xqsg9YjeBez1WNKAvYVS83zxKJE",
    authDomain: "forum-f54c2.firebaseapp.com",
    databaseURL: "https://forum-f54c2-default-rtdb.firebaseio.com/",
    projectId: "forum-f54c2",
    storageBucket: "forum-f54c2.appspot.com",
    messagingSenderId: "523981927486",
    appId: "1:523981927486:web:6e3cc9b5ecf3f2696dcd6f",
    measurementId: "G-VY578NGFLP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.querySelector("#loginButton").addEventListener("click", function () {
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;
  const rememberMe = document.querySelector("#rememberMe");

    let persistenceType = browserSessionPersistence;
    if (rememberMe.checked) persistenceType = browserLocalPersistence;
    // SESSION : Indicates that the state will only be persisted in the current session or tab, and will be cleared when the tab or window in which the user authenticated is closed. Applies only to web apps.
    // LOCAL : Indicates that the state will be persisted even when the browser window is closed or the activity is destroye. An explicit sign out is needed to clear that state. Applies only to web apps.

    // Set the persistence based on the checkbox selection
    setPersistence(auth, persistenceType)
    .then(() => {
      // Sign in with email and password
      return signInWithEmailAndPassword(auth, email, password);
    })
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem('user', JSON.stringify(user));
      alert(email + " logged in successfully!");
      window.location.href = "/html/home.html";
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(errorMessage);
    });
});
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Add an auth state change listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log(user.uid + ' is signed in');
    } else {
        // User is signed out
        console.log('No user signed in');
        // Perform actions for when the user is not signed in
    }
});

document.querySelector("#logoutButton").addEventListener("click", function () {
    signOut(auth)
    .then(() => {
        // Sign-out successful.
            alert("Signed out successfully!");
            window.location.href = "/html/landing.html";
        }
    ).catch((error) => {
        // An error happened.
            alert(error.message);
        }
    );
});
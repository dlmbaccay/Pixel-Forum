// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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
const database = getDatabase();

document.querySelector("#registerButton").addEventListener("click", function () {

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const profilePicture = "img/default-user-icon.jpg";
    
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        
        const userRef = ref(database, 'users/' + user.uid);

        const userData = {
            email: email,
            password: password,
            username: email.split("@")[0],
            profilePicture: '/' + profilePicture,
            uid: user.uid,
            desc: "Hi! I'm new here."
        };

        return set(userRef, userData).then(() => {
            return userData;
        });
    })
    .then((userData) => {
        alert(userData.email + " account created successfully!");
        window.location.href = "/html/login.html";
    })
    .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
    })
});
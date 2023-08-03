// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, onValue , orderByChild, limitToLast, get, update, query} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
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

// Retrieve the username from the Firebase Realtime Database
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            let profileHeader = document.getElementById("profile-header");
            let profileButton = document.getElementById("my-profile");

            profileButton.addEventListener("click", function(){
                window.location.href='profile.html?id='+data.uid;
            });
            if (profileHeader) {
                profileHeader.addEventListener("click", function(){
                    window.location.href='profile.html?id='+data.uid;
                })
            }
        });
    }
});
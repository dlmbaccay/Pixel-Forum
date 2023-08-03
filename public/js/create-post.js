// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

// create post

// create a post, a post has a postid, title, tag, content, date, and user

const createPostForm = document.querySelector("#createPostForm");

createPostForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (createPostForm["postTitle"].value == "" || createPostForm["postTag"].value == "" || createPostForm["postContent"].value == "") {
        document.querySelector("#error").classList.toggle("hide");
        return;
    } else {
        const title = createPostForm["postTitle"].value;
        const tag = createPostForm["postTag"].value;
        const content = createPostForm["postContent"].value;

        // Split the content into paragraphs
        const paragraphs = content.split('\n');
        // Wrap each paragraph in <p> tags
        const formattedContent = paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('');


        const user = auth.currentUser;
        const postsRef = ref(database, 'posts');
        const newPostRef = push(postsRef);

        set(newPostRef, {
            postID: newPostRef.key,
            title: title,
            tag: tag,
            content: formattedContent,
            // time and date
            time: new Date().toLocaleTimeString('en-PH'),
            date: new Date().toLocaleDateString('en-PH'),
            author: user.uid,
            upvotes: 0,
            downvotes: 0,
            comments: [],
            edited: false
        });

        createPostForm.reset();

        // redirect to newly created post
        window.location.href = "/html/post.html?id=" + newPostRef.key;
    }
});

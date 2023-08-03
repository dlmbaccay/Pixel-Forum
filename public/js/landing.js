// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, onValue, orderByChild, limitToLast, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

// Get the posts container element
const recentPostsContainer = document.querySelector('.recent');

let recentPosts = [];

const postsRef = ref(database, 'posts');

onValue(postsRef, (snapshot) => {
    snapshot.forEach((postSnapshot) => {
        const post = postSnapshot.val();
        recentPosts.push(post);
    });

    recentPosts.sort((a, b) => {
        // Compare date and time
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
    
        return dateB - dateA;
    });

    recentPostsContainer.innerHTML = '';

    recentPosts.slice(0, 15).forEach((post) => {
        generatePostSnippet(post, "recent");
    });
});

// Function to generate the HTML for a single post snippet
function generatePostSnippet(post) {
    // get username nad profile pic from post.author
    const userRef = ref(database, 'users/' + post.author);
    get(userRef).then((snapshot) => {
        const user = snapshot.val();
        const username = user.username;
        const profilePicture = user.profilePicture;

        (async () => {
            try {
            const totalCommentsAndReplies = await getTotalCommentsAndReplies(post.postID);
                console.log('Total Comments + Replies:', totalCommentsAndReplies);
                console.log(post.postID);
                const postSnippet = `
                    <div class="post-snippet" onclick="window.location.href='/html/login.html'">
                        <aside class="post-control">
                            <button class="post-item" id="upvoteButton">
                            <span class="post-item-count">${post.upvotes}</span><i class="fas fa-arrow-up"></i>
                            </button>
                            <button class="post-item" id="downvoteButton">
                            <span class="post-item-count">${post.downvotes}</span><i class="fas fa-arrow-down"></i>
                            </button>
                        </aside>
                        <div class="snippet-proper">
                            <header onclick="window.location.href='/html/login.html'">
                            <p class="post-tag">${post.tag}</p>
                            <p class="post-title">${post.title}</p>
                            </header>
                            <article class="post-content" onclick="window.location.href='/html/login.html'">${post.content}</article>
                            <footer class="post-meta">
                            <p class="author-meta">
                                <img class="author-picture" src="${profilePicture}">
                                <span class="author-username">${username}</span>
                            </p>
                            <p class="post-date" onclick="window.location.href='/html/login.html'">${post.date}</p>
                            <button class="post-item" id="commentButton" onclick="window.location.href='/html/login.html'">
                                <i class="fas fa-comment"></i><span class="post-item-count">${totalCommentsAndReplies}</span>
                            </button>
                            </footer>
                        </div>
                    </div>
                `;

                recentPostsContainer.innerHTML += postSnippet;
            } catch (error) {
              console.error('Error getting total comments and replies:', error);
            }
          })();
    });
}

// Function to get the total number of comments + replies for a post
async function getTotalCommentsAndReplies(postId) {
    const postRef = ref(database, 'posts/' + postId + '/comments');
  
    try {
      // Fetch all comments for the post
      const snapshot = await get(postRef);
      const comments = snapshot.val();
      if (!comments) {
        return 0; // No comments or replies found
      }
  
      let totalCommentsAndReplies = Object.keys(comments).length;
  
      // Recursive function to traverse replies and count them
      function countReplies(comment) {
        if (comment.replies) {
          totalCommentsAndReplies += Object.keys(comment.replies).length;
          Object.values(comment.replies).forEach(countReplies);
        }
      }
  
      // Traverse through each comment and count its replies
      Object.values(comments).forEach(countReplies);
  
      return totalCommentsAndReplies;
    } catch (error) {
      console.error('Error fetching comments and replies:', error);
      return 0;
    }
  }

// check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User is signed in");
        console.log(user);
        // redirect to home page
        window.location.href = '../html/home.html';
    } else {
        // User is signed out
        console.log('No user signed in');
    }
});
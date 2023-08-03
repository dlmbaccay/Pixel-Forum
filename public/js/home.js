// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, onValue, get, set, remove, runTransaction } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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
var currentUser;

// Retrieve the username from the Firebase Realtime Database
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            currentUser = data;
            const usernameElements = document.querySelectorAll('.username');
            usernameElements.forEach((element) => {
                element.innerHTML = '@' + data.username;
            }); 

            console.log(data.username);
        });
    } else {
        console.log('user is not logged in');
        // redirect to landing page
        window.location.href = '../html/landing.html';
    }
});

// Retrieve user profile picture from the Firebase Realtime Database
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
            const data = snapshot.val();

            const profilePictureElements = document.querySelectorAll('.profilePicture');
            profilePictureElements.forEach((element) => {
                element.src = '../'+data.profilePicture;
            });
            
            console.log(data.profilePicture);
        });
    } else {
      console.log('user is not logged in');
      // redirect to landing page
      window.location.href = '../html/landing.html';
  }
});

// Get the buttons and content elements
const postButton = document.getElementById('postButton');
const trendingButton = document.getElementById('trendingButton');
const recentButton = document.getElementById('recentButton');
const searchButton = document.getElementById('searchPostBtn');
const postContent = document.querySelector('.create-post');
const trendingContent = document.querySelector('.trending');
const recentContent = document.querySelector('.recent');
const searchContent = document.querySelector('.search-results');

// Add event listeners to the buttons
trendingButton.addEventListener('click', toggleTrending);
recentButton.addEventListener('click', toggleRecent);
postButton.addEventListener('click', toggleCreatePost);
searchButton.addEventListener('click', handleSearch);

// Function to toggle to trending content
function toggleTrending() {
    postButton.classList.remove('active');
    trendingButton.classList.add('active');
    recentButton.classList.remove('active');
    postContent.classList.remove('active');
    trendingContent.classList.add('active');
    recentContent.classList.remove('active');
    searchContent.classList.remove('active');
}

// Function to toggle to recent content
function toggleRecent() {
    postButton.classList.remove('active');
    recentButton.classList.add('active');
    trendingButton.classList.remove('active');
    postContent.classList.remove('active');
    recentContent.classList.add('active');
    trendingContent.classList.remove('active');
    searchContent.classList.remove('active');
}

// Function to toggle to create post
function toggleCreatePost() {
    postButton.classList.add('active');
    recentButton.classList.remove('active');
    trendingButton.classList.remove('active');
    postContent.classList.add('active');
    recentContent.classList.remove('active');
    trendingContent.classList.remove('active');
    searchContent.classList.remove('active');
}

var holdSearchText="";

function handleSearch() {
    postButton.classList.remove('active');
    recentButton.classList.remove('active');
    trendingButton.classList.remove('active');
    postContent.classList.remove('active');
    recentContent.classList.remove('active');
    trendingContent.classList.remove('active');
    searchContent.classList.add('active');
    const searchText = document.getElementById("searchInput").value;
    holdSearchText = searchText;
    console.log(searchText);
    searchPosts(searchText);
}

// Get the form element
const createPostForm = document.getElementById("createPostForm");

// Get the clear button element
const clearFormButton = document.getElementById("clearForm");

// Add event listener to the clear button
clearFormButton.addEventListener("click", function() {
    // Reset the form fields
    createPostForm.reset();
});

// Get the posts container element
const recentPostsContainer = document.querySelector('.recent');
const trendingPostsContainer = document.querySelector('.trending');
const usersRef = ref(database, 'users');

onValue(usersRef, (snapshot) => {
    const postsRef = ref(database, 'posts');

    onValue(postsRef, (snapshot) => {
        let recentPosts = [];
        let trendingPosts = [];
        snapshot.forEach((postSnapshot) => {
            const post = postSnapshot.val();
            recentPosts.push(post);
            trendingPosts.push(post);
        });

        recentPosts.sort((a, b) => {
            // Compare date and time
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
      
            return dateB - dateA;
        });
        trendingPosts.sort((a, b) => b.upvotes - a.upvotes);

        // Clear the containers
        recentPostsContainer.innerHTML = "";
        trendingPostsContainer.innerHTML = "";
        searchResults.innerHTML = "";

        // Repopulate the containers with the updated data
        recentPosts.forEach((post) => {
            generatePostSnippet(post, "recent");
        });

        trendingPosts.forEach((post) => {
            generatePostSnippet(post, "trending");
        });
        if(holdSearchText != '') {
            searchPosts(holdSearchText);}
    });
});

const searchResults = document.querySelector('.search-results');

function searchPosts(searchText) {
    const postsRef = ref(database, 'posts');
    
    searchResults.innerHTML = ""; // Clear previous results

    get(postsRef).then(snapshot => {
        const mergedResults = {};
        snapshot.forEach(postSnapshot => {
        const postId = postSnapshot.key;
        const post = postSnapshot.val();
        if (post.title.toLowerCase().includes(searchText.toLowerCase()) || post.content.toLowerCase().includes(searchText.toLowerCase()) || post.tag.toLowerCase().includes(searchText.toLowerCase())) {
            mergedResults[postId] = post;
        }
        });

        // Display the search results
        for (const postId in mergedResults) {
            const post = mergedResults[postId];
            generatePostSnippet(post, "search");
        }

        if (Object.keys(mergedResults).length === 0) {
            searchResults.innerHTML = '<p">No results found</p>';
        }
    }).catch(error => {
        console.error("Error fetching posts:", error);
    });
}

// Function to generate the HTML for a single post snippet
function generatePostSnippet(post, container) {

    // get username nad profile pic from post.author
    const userRef = ref(database, 'users/' + post.author);
    get(userRef).then((snapshot) => {
        const user = snapshot.val();
        const username = user.username;
        const profilePicture = user.profilePicture;

        // if no comments
        if (post.comments === undefined) post.comments = []; 
        else post.comments = Object.values(post.comments);

        (async () => {
            try {
            const totalCommentsAndReplies = await getTotalCommentsAndReplies(post.postID);
                console.log('Total Comments + Replies:', totalCommentsAndReplies);
                console.log(post.postID);
                const postSnippet = `
                    <div class="post-snippet">
                        <aside class="post-control">
                            <button class="post-item" id="upvoteButton" onclick="handleVote('${post.postID}','${currentUser.uid}','upvote')">
                            <span class="post-item-count">${post.upvotes}</span><i class="fas fa-arrow-up"></i>
                            </button>
                            <button class="post-item" id="downvoteButton" onclick="handleVote('${post.postID}','${currentUser.uid}','downvote')">
                            <span class="post-item-count">${post.downvotes}</span><i class="fas fa-arrow-down"></i>
                            </button>
                        </aside>
                        <div class="snippet-proper">
                            <header onclick="window.location.href='post.html?id=${post.postID}'">
                            <p class="post-tag">${post.tag}</p>
                            <p class="post-title">${post.title}</p>
                            </header>
                            <article class="post-content" onclick="window.location.href='post.html?id=${post.postID}'">${post.content}</article>
                            <footer class="post-meta">
                            <p class="author-meta" onclick="window.location.href='profile.html?id=${post.author}'">
                                <img class="author-picture" src="${profilePicture}">
                                <span class="author-username">${username}</span>
                            </p>
                            <p class="post-date" onclick="window.location.href='post.html?id=${post.postID}'">${post.date}</p>
                            <button class="post-item" id="commentButton" onclick="window.location.href='post.html?id=${post.postID}'">
                                <i class="fas fa-comment"></i><span class="post-item-count">${totalCommentsAndReplies}</span>
                            </button>
                            </footer>
                        </div>
                    </div>
                `;

                if (container == "recent")
                    recentPostsContainer.innerHTML += postSnippet;
                else if (container == "trending")
                    trendingPostsContainer.innerHTML += postSnippet;
                else if (container == "search")
                    searchResults.innerHTML += postSnippet;
            } catch (error) {
              console.error('Error getting total comments and replies:', error);
            }
          })();
      
        let users = [];

        onValue(usersRef, (snapshot) => {
            snapshot.forEach((userSnapshot) => {
                const user = userSnapshot.val();
                users.push(user);
            });
        });

        const authorName = document.getElementsByClassName("author-username");

        for (var i = 0; i < authorName.length; i++) {
            let userID = getElementByProperty(users, 'username', authorName[i].textContent);
            let holder = '@'+authorName[i].textContent;
            authorName[i].addEventListener('click', function(){
                localStorage.setItem("newContent", holder);
                window.location.href = 'profile.html?id='+userID.uid;
            })
        };
        
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

// Function to handle user voting on a post
function handleVote(postId, userId, voteType) {
    const voteRef = ref(database, `user_votes/${postId}/${userId}`);
    console.log(userId);
    
    // Check if the user has already voted for this post
    get(voteRef).then((snapshot) => {
      const existingVote = snapshot.val();
  
      if (existingVote) {
        // User has already voted for this post
        const previousVoteType = existingVote;
  
        if (previousVoteType === voteType) {
          // If the user's new vote is the same as the previous vote, remove the vote
          remove(voteRef)
            .then(() => {
              console.log('Vote removed successfully.');
            })
            .catch((error) => {
              console.error('Error removing vote:', error);
            });
          
          // Update the post's upvote or downvote count based on the removed vote
          const postRef = ref(database, `posts/${postId}`);
          const voteField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
  
          runTransaction(postRef, (post) => {
            if (!post) {
              return post;
            }
  
            if (voteType === 'upvote') {
              post.upvotes = (post.upvotes || 0) - 1;
            } else {
              post.downvotes = (post.downvotes || 0) - 1;
            }
  
            return post;
          }).then(() => {
            console.log('Vote count updated successfully.');
          }).catch((error) => {
            console.error('Error updating post vote count:', error);
          });
        } else {
          // If the user's new vote is different from the previous vote, update the vote
          set(voteRef, voteType)
            .then(() => {
              console.log('Vote updated successfully.');
            })
            .catch((error) => {
              console.error('Error updating vote:', error);
            });
  
          // Update the post's upvote or downvote count based on the new vote
          const postRef = ref(database, `posts/${postId}`);
          const previousVoteField = previousVoteType === 'upvote' ? 'upvotes' : 'downvotes';
          const newVoteField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
  
          runTransaction(postRef, (post) => {
            if (!post) {
              return post;
            }
  
            post[previousVoteField] = (post[previousVoteField] || 0) - 1;
            post[newVoteField] = (post[newVoteField] || 0) + 1;
            return post;
          }).then(() => {
            console.log('Vote count updated successfully.');
          }).catch((error) => {
            console.error('Error updating post vote count:', error);
          });
        }
      } else {
        // User has not voted on this post
        // Update the post's upvote or downvote count
        const postRef = ref(database, `posts/${postId}`);
        const voteField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
        
        runTransaction(postRef, (post) => {
          if (!post) {
            return post;
          }
  
          if (voteType === 'upvote') {
            post.upvotes = (post.upvotes || 0) + 1;
          } else {
            post.downvotes = (post.downvotes || 0) + 1;
          }
          
          return post;
        }).then(() => {
          // Record the user's vote in the user_votes collection
          set(voteRef, voteType)
            .then(() => {
              console.log('Vote recorded successfully.');
              
            })
            .catch((error) => {
              console.error('Error recording vote:', error);
            });
        }).catch((error) => {
          console.error('Error updating post vote count:', error);
        });
      }

    }).catch((error) => {
      console.error('Error checking user vote:', error);
    });
  }

// Function to find an element by property value
function getElementByProperty(arr, propertyName, propertyValue) {
    return arr.find(item => item[propertyName] === propertyValue);
}

window.handleVote = handleVote;
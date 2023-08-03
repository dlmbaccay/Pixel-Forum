// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, onValue , get, update, query, set, remove, runTransaction } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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
            let displayUsername = document.getElementById("display-username");
            let user = data.username;
            
            let editProfileButton = document.getElementById("edit-profile-button");
            let userDesc = document.getElementById("description");
            userDesc.textContent = data.desc;

            if (user === displayUsername.textContent){
                editProfileButton.classList.remove('hidden');
            }
            console.log(data.username);
        });
    }
});

function getUserIDFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

const userID = getUserIDFromURL();

const userRef = ref(database, 'users/'+ userID);

onValue(userRef, (snapshot) => {
    const user = snapshot.val();
    console.log(user.profilePicture, user.username, user.desc);
    document.querySelector(".profilePicture").src = user.profilePicture;
    document.querySelector("#display-username").innerHTML = user.username;
    document.querySelector("#user-description").innerHTML = user.desc;
    origPicSrc = user.profilePicture;
});

var editProfileButton = document.querySelector("#edit-profile-button");
var editProfileCard = document.querySelector(".edit-profile-card");
var profileInfo = document.querySelector(".profile-info-container");
var cancelButton = document.querySelector("#cancel-button");
var saveButton = document.querySelector("#save-button");

editProfileButton.addEventListener("click", function() {
    profileInfo.classList.add("hidden");
    editProfileCard.classList.remove("hidden");
    editProfileButton.classList.add("hidden");
});
// Get references to the select element and the profile picture img element
const profilePictureSelect = document.getElementById("profile-picture");
const profilePictureImg = document.querySelector(".profilePicture");
var origPicSrc;

cancelButton.addEventListener("click", function(event) {
    event.preventDefault();
    editProfileCard.classList.add("hidden");
    profileInfo.classList.remove("hidden");
    editProfileButton.classList.remove("hidden");
    profilePictureImg.src = origPicSrc;

});

saveButton.addEventListener("click", function(event){
    event.preventDefault();
    var inputDescription = document.getElementById("description");
    var descContainer = document.getElementById("user-description");
    const selectedOption = profilePictureSelect.options[profilePictureSelect.selectedIndex];
    const selectedImage = selectedOption.getAttribute("data-image");

    descContainer.textContent = inputDescription.value;
    profilePictureImg.src = selectedImage;

    inputDescription.value = inputDescription.placeholder;
    // profilePic.value = profilePic.placeholder;
    
    editProfileCard.classList.add("hidden");
    profileInfo.classList.remove("hidden");
    editProfileButton.classList.remove("hidden");

    // Retrieve the username from the Firebase Realtime Database
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const updates = {};
            updates['users/'+user.uid+'/desc'] = descContainer.textContent;
            updates['users/'+user.uid+'/profilePicture'] = selectedImage;
            update(ref(database), updates);
            location.reload();
        }
    });
});

var postContainer = document.getElementById("posts");
var commentContainer = document.getElementById("comments");
var postButton = document.getElementById("postButton");
var commentButton = document.getElementById("commentButton");

postButton.addEventListener('click', togglePosts);
commentButton.addEventListener('click', toggleComments);

// Function to toggle to recent posts
function togglePosts() {
    postButton.classList.add('active');
    commentButton.classList.remove('active');
    postContainer.classList.add('active');
    commentContainer.classList.remove('active');
}

// Function to toggle to recent posts
function toggleComments() {
    postButton.classList.remove('active');
    commentButton.classList.add('active');
    postContainer.classList.remove('active');
    commentContainer.classList.add('active');
}

const usersRef = ref(database, 'users');

// render user's recent posts
// onValue(usersRef, (snapshot) => {
//     let recentPosts = [];

//     const postsRef = ref(database, 'posts');

//     onValue(postsRef, (snapshot) => {
//         snapshot.forEach((postSnapshot) => {
//             const post = postSnapshot.val();
//             recentPosts.push(post);
//         });
//         recentPosts.sort((a, b) => {
//             // Compare date and time
//             const dateA = new Date(a.date + ' ' + a.time);
//             const dateB = new Date(b.date + ' ' + b.time);
    
//             return dateB - dateA;
//         });

//         // postContainer.innerHTML = '';

//         if (recentPosts.length == 0) {
//             postContainer.innerHTML = '<p class="no-posts">No posts yet.</p>';
//         }

//         recentPosts.slice(0, 15).forEach((post) => {
//             generatePostSnippet(post, "posts");
//         });
//     });
// });

// render user recent posts

onValue(usersRef, (snapshot) => {
    const postsRef = ref(database, 'posts');

    onValue(postsRef, (snapshot) => {
        let recentPosts = [];
        let userPost = [];
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

        // postContainer.innerHTML = '';
        postContainer.innerHTML = "";
        if (recentPosts.length == 0) {
            postContainer.innerHTML = '<p class="no-posts">No posts yet.</p>';
        }

        recentPosts.forEach((post) => {
            if (post.author == userID) {
                userPost.push(post);
            }
        });
        
        if (userPost.length == 0) {
            postContainer.innerHTML = '<p class="no-posts">No posts yet.</p>';
        }
        postContainer.innerHTML = "";
        userPost.forEach((post) => {
            generatePostSnippet(post, "posts");
        });
    });
});



// Function to generate the HTML for a single post snippet
function generatePostSnippet(post, container) {
    // get username and profile pic from post.author
    const userRef = ref(database, 'users/' + post.author);
    get(userRef).then((snapshot) => {
        const user = snapshot.val();
        const username = user.username;
        const profilePicture = user.profilePicture;
        let displayUsername = document.getElementById('display-username').textContent;

        if (username === displayUsername){
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
                                <p class="author-meta">
                                    <img class="author-picture" src="${profilePicture}">
                                    <span class="author-username">${username}</span>
                                </p>
                                <p class="post-date" onclick="window.location.href='post.html?id=${post.postID}'">${post.date}</p>
                                <button class="post-item" id="commentButton">
                                    <i class="fas fa-comment"></i><span class="post-item-count">${totalCommentsAndReplies}</span>
                                </button>
                                </footer>
                            </div>
                        </div>
                    `;
    
                    if (container == "posts")
                    postContainer.innerHTML += postSnippet;
                    
                   
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
        }
    });
}

// Function to find an element by property value
function getElementByProperty(arr, propertyName, propertyValue) {
    return arr.find(item => item[propertyName] === propertyValue);
}

// render user's recent comments

onValue(usersRef, (snapshot) => {
    let recentComments = [];
    let recentPosts = [];

    const postsRef = ref(database, 'posts');
    onValue(postsRef, (snapshot) => {
        snapshot.forEach((postSnapshot) => {
            const post = postSnapshot.val();
            recentPosts.push(post); // this is to get all posts
            const commentsRef = ref(database, 'posts/' + post.postID + '/comments');
            onValue(commentsRef, (snapshot) => {
                snapshot.forEach((commentSnapshot) => {
                    const comment = commentSnapshot.val();
                    const commentAuthor = comment.author;

                    if (commentAuthor === userID) {
                        recentComments.push(comment);
                    }
                });
            });
        });

        recentComments.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            
            return dateB - dateA;
        });

        // commentContainer.innerHTML = '';

        const userRef = ref(database, 'users/'+ userID);

        onValue(userRef, (snapshot) => {
            const user = snapshot.val();
            const username = user.username;
            const profilePicture = user.profilePicture;

            if (recentComments.length == 0) {
                commentContainer.innerHTML = `
                <div class="no-comments">
                    <p>No comments on any posts yet.</p>
                </div>
                `;
            }

            recentComments.forEach((comment) => {
                commentContainer.innerHTML += generateCommentSnippet(comment, username, profilePicture);
            });
        });
    });
});

// render user's recent replies on comments

onValue(usersRef, (snapshot) => {
    let recentReplies = [];
    let recentPosts = [];

    const postsRef = ref(database, 'posts');
    onValue(postsRef, (snapshot) => {
        snapshot.forEach((postSnapshot) => {
            const post = postSnapshot.val();
            recentPosts.push(post); // this is to get all posts
            const commentsRef = ref(database, 'posts/' + post.postID + '/comments');
            onValue(commentsRef, (snapshot) => {
                snapshot.forEach((commentSnapshot) => {
                    const comment = commentSnapshot.val();
                    const commentAuthor = comment.author;
                    const repliesRef = ref(database, 'posts/' + post.postID + '/comments/' + comment.commentID + '/replies');
                    onValue(repliesRef, (snapshot) => {
                        snapshot.forEach((replySnapshot) => {
                            const reply = replySnapshot.val();
                            const replyAuthor = reply.author;

                            if (replyAuthor === userID) {
                                recentReplies.push(reply);
                            }
                        });
                    });
                });
            });
        });

        recentReplies.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);

            return dateB - dateA;
        });

        // commentContainer.innerHTML = '';

        const userRef = ref(database, 'users/'+ userID);

        onValue(userRef, (snapshot) => {
            const user = snapshot.val();
            const username = user.username;
            const profilePicture = user.profilePicture;

            recentReplies.forEach((reply) => {
                commentContainer.innerHTML += generateReplySnippet(reply, username, profilePicture);
            });
        });
    });
});

function generateCommentSnippet(comment, username, profilePicture) {
    return `
    <div class="comment-snippet" onclick="window.location.href='post.html?id=${comment.postID}'">
        <header class="commented-post" onclick="window.location.href='post.html?id=${comment.postID}'">
        ${comment.postTitle}
        </header>

        <article class="comment-content" onclick="window.location.href='post.html?id=${comment.postID}'">
        ${comment.content}
        </article>

        <footer class="comment-meta">
        <div class="author-meta">
            <img class="author-picture" src="${profilePicture}">
            <span class="author-username">${username}</span>
        </div>
        <p class="comment-date">${comment.date}</p>
        </footer>
    </div>
    `;
}

function generateReplySnippet(reply, username, profilePicture) {

    return `
    <div class="comment-snippet" onclick="window.location.href='post.html?id=${reply.postID}'">
        <header class="commented-post" onclick="window.location.href='post.html?id=${reply.postID}'">
        ${reply.postTitle}
        </header>

        <article class="comment-content" onclick="window.location.href='post.html?id=${reply.postID}'">
        ${reply.content}
        </article>

        <footer class="comment-meta">
        <div class="author-meta">
            <img class="author-picture" src="${profilePicture}">
            <span class="author-username">${username}</span>
        </div>
        <p class="comment-date">${reply.date}</p>
        </footer>
    </div>
    `;
}



// Add an event listener to the select element
profilePictureSelect.addEventListener("change", function() {
    // Get the selected option's data-image attribute
    const selectedOption = profilePictureSelect.options[profilePictureSelect.selectedIndex];
    const selectedImage = selectedOption.getAttribute("data-image");

    // Update the profile picture img element with the chosen image
    profilePictureImg.src = selectedImage;
});

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

window.handleVote = handleVote;
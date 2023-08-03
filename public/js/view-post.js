// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, child, onValue, increment, get, set, update, remove, push, runTransaction} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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
const databaseRef = ref(database);

function handleVote(postId, userId, voteType) {
    const voteRef = ref(database, `user_votes/${postId}/${userId}`);
    console.log("ran");

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
                    // Remove the active class from both vote buttons
                    document.getElementById("upvoteButton").classList.remove("active");
                    document.getElementById("downvoteButton").classList.remove("active");
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
                    // Add active class to the appropriate vote button and remove from the other
                    if (voteType === 'upvote') {
                        document.getElementById("upvoteButton").classList.add("active");
                        document.getElementById("downvoteButton").classList.remove("active");
                    } else {
                        document.getElementById("downvoteButton").classList.add("active");
                        document.getElementById("upvoteButton").classList.remove("active");
                    }
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
                    // Add active class to the appropriate vote button and remove from the other
                    if (voteType === 'upvote') {
                        document.getElementById("upvoteButton").classList.add("active");
                        document.getElementById("downvoteButton").classList.remove("active");
                    } else {
                        document.getElementById("downvoteButton").classList.add("active");
                        document.getElementById("upvoteButton").classList.remove("active");
                    }
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

function getPostIDFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

const postID = getPostIDFromURL();

const postRef = ref(database, 'posts/' + postID);

var currUser;

// Retrieve the username from the Firebase Realtime Database
onAuthStateChanged(auth, (user) => {
    if (user) {
        currUser = user;
    }
});

// upvote
const upvoteButton = document.querySelector("#upvoteButton");
upvoteButton.addEventListener('click', function(){
    handleVote(postID, currUser.uid, "upvote");
});

// downvote
const downvoteButton = document.querySelector("#downvoteButton");
downvoteButton.addEventListener('click', function(){
    handleVote(postID, currUser.uid, "downvote");
});

onValue(postRef, (snapshot) => {
    const post = snapshot.val();

    document.querySelector("#postTitle").innerHTML = post.title;
    document.querySelector("#postTag").innerHTML = post.tag;
    document.querySelector("#postContent").innerHTML = post.content;
    document.querySelector("#postDate").innerHTML = post.date;
    document.querySelector("#postUpvotes").innerHTML = post.upvotes;
    document.querySelector("#postDownvotes").innerHTML = post.downvotes;

    (async () => {
        try {
        const totalCommentsAndReplies = await getTotalCommentsAndReplies(post.postID);
            console.log('Total Comments + Replies:', totalCommentsAndReplies);
            document.querySelector("#postCommentCount").innerHTML = totalCommentsAndReplies;
        } catch (error) {
          console.error('Error getting total comments and replies:', error);
        }
    })();
    
    if (post.edited == true){
        document.querySelector(".edited").classList.remove("hidden");
    }

    // get user from post.uid
    const userRef = ref(database, 'users/' + post.author);
        get(userRef).then((snapshot) => {
            const user = snapshot.val();
            document.querySelector("#authorName").innerHTML = user.username;
            document.querySelector("#authorProfilePicture").src = user.profilePicture;
    });

    // go to author profile when .author-meta is clicked
    const authorMeta = document.querySelector(".author-profile");
    authorMeta.addEventListener('click', function(){
        window.location.href = 'profile.html?id='+post.author;
    });
    
    // upvotes and downvotes are anonymous, only tally the number of upvotes and downvotes not the users who upvoted or downvoted
    // can only upvote or downvote once, cannot undo upvote or downvote, disable button after upvote or downvote

    // delete post
    const deleteButton = document.querySelector("#deleteButton");
    deleteButton.addEventListener('click', function(){
        // delete post
        remove(ref(database, 'posts/' + postID));

        // delete post from user's posts
        const userRef = ref(database, 'users/' + auth.currentUser.uid + '/posts/' + postID);
        remove(userRef);
        
        // go back to home page
        window.location.href = 'home.html';
    });

    // only show author-control when the user logged in is the author of the post
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = ref(database, 'users/' + user.uid);
            get(userRef).then((snapshot) => {
                const currentUser = snapshot.val();
                if (currentUser.uid == post.author) {
                    document.querySelector(".author-control").style.display = "flex";
                }
            });
        }
    });

    const editContainer = document.querySelector('.edit-container');
    const viewContainer = document.querySelector('.post');

    const editButton = document.querySelector("#editButton");
    editButton.addEventListener('click', function(){

        editContainer.classList.remove("hidden");
        viewContainer.classList.add("hidden");

        // get post data
        const postRef = ref(database, 'posts/' + postID);
        get(postRef).then((snapshot) => {
            const post = snapshot.val();
            document.getElementById("newPostContent").value = post.content;
            document.getElementById("newPostTag").value = post.tag;
            document.getElementById("newPostTitle").value = post.title;
        }
        );
    });

    const cancelButton = document.querySelector("#cancelForm");
    cancelButton.addEventListener('click',function(){
        clearForm();
        viewContainer.classList.remove("hidden");
        editContainer.classList.add("hidden");
    });

    const clearButton = document.querySelector("#clearForm");
    clearButton.addEventListener('click',function(){
        clearForm();
    });

    const editPostForm = document.querySelector("#editPostForm");

    function clearForm(){
        editPostForm.reset();
    }

    const saveButton = document.querySelector("#saveEditButton");
    saveButton.addEventListener('click', function(event){
        event.preventDefault();
        let newPostContent = document.getElementById("newPostContent").value;
        let newPostTag = document.getElementById("newPostTag").value;
        let newPostTitle = document.getElementById("newPostTitle").value;

        console.log(newPostContent, newPostTag, newPostTitle, postRef+'/desc');
        
        const updates = {};
        updates['posts/'+postID+'/content'] = newPostContent;
        updates['posts/'+postID+'/tag'] = newPostTag;
        updates['posts/'+postID+'/title'] = newPostTitle;
        updates['posts/'+postID+'/edited'] = true;
        update(ref(database), updates);
        location.reload();
    });

    // render comments, comments need the author's username and profile picture
    if (post.comments) {
        // get all comments
        const comments = Object.values(post.comments);

        // get all comment authors' usernames and profile pictures
        const commentAuthorsRef = ref(database, 'users');
        get(commentAuthorsRef).then((snapshot) => {
            const commentAuthors = snapshot.val();
            
            commentsContainer.innerHTML = '';
            
            comments.forEach(comment => {
                const commentAuthor = commentAuthors[comment.author];
                // render comment
                commentsContainer.innerHTML += generateCommentHTML(comment, commentAuthor.username, commentAuthor.profilePicture);
            });
        });
    }

    // render replies inside replies div
    if (post.comments) {
        const comments = Object.values(post.comments);
        const commentAuthorsRef = ref(database, 'users');
        get(commentAuthorsRef).then((snapshot) => {
            const commentAuthors = snapshot.val();
            comments.forEach(comment => {
                const commentAuthor = commentAuthors[comment.author];
                if (comment.replies) {
                    const replies = Object.values(comment.replies);
                    replies.forEach(reply => {
                        const replyAuthor = commentAuthors[reply.author];
                        document.querySelector(`#${comment.commentID} .replies`).innerHTML += generateReplyHTML(reply, replyAuthor.username, replyAuthor.profilePicture, comment.commentID);
                    });
                }
            });
        });
    }

    const commentsContainer = document.querySelector(".comment-container");

    const commentButton = document.querySelector("#commentButton");
    commentButton.addEventListener('click', function(){
        const commentContent = document.querySelector("#commentContent").value;
        const commentDate = new Date().toLocaleString();
    
        // if comment is empty, do not add comment
        if (commentContent == "") {
            return;
        } else {
            const userRef = ref(database, 'users/' + auth.currentUser.uid);
            get(userRef).then((snapshot) => {
                const user = snapshot.val();
                const username = user.username;
    
                const commentRef = ref(database, 'posts/' + postID + '/comments');
                const newCommentRef = push(commentRef);
            
                set(newCommentRef, {
                    commentID: newCommentRef.key,
                    content: commentContent,
                    date: commentDate,
                    author: auth.currentUser.uid,
                    username: username,
                    postID: postID,
                    postTitle: post.title,
                    replies: {},
                    upvotes: 0,
                    downvotes: 0
                }).then(() => {
                    document.querySelector("#commentContent").value = "";
                    window.location.reload();
    
                }).catch((error) => {
                    console.log("Error adding comment:", error);
                });
            });
        }
    });
    
    function generateCommentHTML(comment, username, profilePicture) {
        const isCurrentUser = (auth.currentUser.uid === comment.author) ? "active" : "";
        const isEdited = (comment.edited === true) ? "" : "hidden";

        return `
            <div class="comment" id="${comment.commentID}">
                <div class="edit-comment hidden">
                    <form id="editCommentForm">
                        <div class="form-control comment-body">
                            <label for="newCommentContent">Edit Comment</label>
                            <textarea name="newCommentContent" class="newCommentContent"></textarea>
                        </div>
    
                        <div class="edit-button-control">
                            <button type="button" class="cancelForm">Cancel</button>
                            <button type="submit" class="saveEditButton">Save</button>
                        </div>
                    </form>
                </div>
    
                <header class="view-comment">
                    <div class="comment-meta">
                        <div class="comment-profile" onclick="window.location.href='profile.html?id=${comment.author}'">
                            <img src="${profilePicture}" id="commentProfilePicture">
                            <span id="commentAuthorName">${username}</span>
                        </div>
    
                        <button class="toggleReplyForm" onclick="toggleReplyForm(this)"><i class="fas fa-reply"></i></button>
                        <div class="author-comment-control ${isCurrentUser}">
                            <button class="commentEditButton" onclick="editComment('${comment.commentID}')"><i class="fas fa-edit"></i></button>
                            <button class="commentDeleteButton" onclick="deleteComment('${comment.commentID}')"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                    <span id="commentDate">${comment.date}</span>

                    <div class="comment-vote-buttons">
                        <div class="comment-upvote-control">
                            <button id="commentUpvote" class="comment-upvote-${comment.commentID}" onclick="handleCommentVote('${comment.commentID}', 'upvote')"><i class="fas fa-arrow-up"></i></button>
                            <span class="upvoteCount"> ${comment.upvotes} </span>
                        </div>

                        <div class="comment-downvote-control">
                            <button id="commentDownvote" class="comment-downvote-${comment.commentID}" onclick="handleCommentVote('${comment.commentID}', 'downvote')"><i class="fas fa-arrow-down"></i></button>
                            <span class="downvoteCount"> ${comment.downvotes} </span>
                        </div>
                    </div>
                </header>
    
                <article id="commentContent">
                    <span class="editedTag ${isEdited}">Edited</span>
                    ${comment.content}
                </article>

                <footer>
                    <form class="replyForm hidden">
                        <textarea id="replyContent-${comment.commentID}" placeholder="Reply to this comment..."></textarea>
                        <input type="button" class="replySubmitButton" value="Reply" onclick="replyToComment('${comment.commentID}', '${comment.author}', '${username}')">
                    </form>

                    <div class="replies">
                    </div>
                </footer>
            </div>
        `;
    }

    function generateReplyHTML(reply, username, profilePicture, parentCommentID) {  
        const isCurrentUser = (auth.currentUser.uid === reply.author) ? "active" : "";
        const isEdited = (reply.edited === true) ? "" : "hidden";

        return `
        <div class="comment" id="${reply.commentID}">
            <div class="edit-comment hidden">
                <form id="editCommentForm">
                    <div class="form-control comment-body">
                        <label for="newCommentContent">Edit Comment</label>
                        <textarea name="newCommentContent" class="newCommentContent"></textarea>
                    </div>

                    <div class="edit-button-control">
                        <button type="button" class="cancelForm">Cancel</button>
                        <button type="submit" class="saveEditButton">Save</button>
                    </div>
                </form>
            </div>

            <header class="view-comment">
                <div class="comment-meta">
                    <div class="comment-profile" onclick="window.location.href='profile.html?id=${reply.author}'">
                        <img src="${profilePicture}" id="commentProfilePicture">
                        <span id="commentAuthorName">${username}</span>
                    </div>

                    <button class="toggleReplyForm" onclick="toggleReplyForm(this)"><i class="fas fa-reply"></i></button>

                    <div class="author-comment-control ${isCurrentUser}">
                        <button class="commentEditButton" onclick="editReply('${reply.commentID}', '${parentCommentID}')"><i class="fas fa-edit"></i></button>
                        <button class="commentDeleteButton" onclick="deleteReply('${reply.commentID}', '${parentCommentID}')"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <span id="commentDate">${reply.date}</span>

                <div class="reply-vote-buttons">
                    <div class="reply-upvote-control">
                        <button class="reply-upvote-${reply.commentID}" onclick="handleReplyVote('${parentCommentID}', '${reply.commentID}', 'upvote')"><i class="fas fa-arrow-up"></i></button>
                        <span class="upvoteCount"> ${reply.upvotes} </span>
                    </div>

                    <div class="reply-downvote-control">
                        <button class="reply-downvote-${reply.commentID}" onclick="handleReplyVote('${parentCommentID}', '${reply.commentID}', 'downvote')"><i class="fas fa-arrow-down"></i></button>
                        <span class="downvoteCount"> ${reply.downvotes} </span>
                    </div>
                </div>
            </header>

            <article id="commentContent">
                <span class="editedTag ${isEdited}">Edited</span>
                <span class="replyAuthor">@${reply.replyToUsername} </span>
                ${reply.content}
            </article>

            <footer>
                <form class="replyForm hidden">
                    <textarea id="replyContent-${reply.commentID}" placeholder="Reply to this comment..."></textarea>
                    <input type="button" class="replySubmitButton" value="Reply" onclick="replyToReply('${reply.commentID}', '${parentCommentID}')">
                </form>
            </footer>
        </div>
        `;
    }

    window.replyToComment = function(commentID) {
        const replyContent = document.querySelector(`#replyContent-${commentID}`).value;
        const replyDate = new Date().toLocaleString();
        
        // if reply content is empty, show error message
        if (replyContent == "") {
            return;
        } else {
            const replyRef = ref(database, 'posts/' + postID + '/comments/' + commentID + '/replies');
            const newReplyRef = push(replyRef);
            
            const commentRef = ref(database, 'posts/' + postID + '/comments/' + commentID);
            get(commentRef).then((snapshot) => {
                const comment = snapshot.val();
                const replyToUID = comment.author;
                const replyToUsername = comment.username;
    
                set(newReplyRef, {
                    commentID: newReplyRef.key,
                    content: replyContent,
                    date: replyDate,
                    author: auth.currentUser.uid,
                    replyToUID: replyToUID,
                    replyToUsername: replyToUsername,
                    postID: postID,
                    postTitle: post.title,
                    upvotes: 0,
                    downvotes: 0
                }).then(() => {
                    // Clear comment input
                    document.querySelector(`#replyContent-${commentID}`).value = "";
                    // reload page
                    window.location.reload();
                }).catch((error) => {
                    console.log("Error adding comment:", error);
                });
            });
        }
    }

    window.replyToReply = function(replyID, parentCommentID) {
        const replyRef = ref(database, 'posts/' + postID + '/comments/' + parentCommentID + '/replies/' + replyID);
        
        get(replyRef).then((snapshot) => {
            const reply = snapshot.val();
            console.log(reply);
            const replyAuthor = reply.author;     
            
            const replyContent = document.querySelector(`#replyContent-${replyID}`).value;
            const replyDate = new Date().toLocaleString();

            // if reply content is empty, show error message
            if (replyContent == "") {
                return;
            } else {
                const replyRef = ref(database, 'posts/' + postID + '/comments/' + parentCommentID + '/replies');
                const newReplyRef = push(replyRef);
            
                // get username of replyAuthor
                const userRef = ref(database, 'users/' + replyAuthor);
                get(userRef).then((snapshot) => {
                    const user = snapshot.val();
                    const replyUsername = user.username;
                    console.log(replyUsername);
    
                    set(newReplyRef, {
                        commentID: newReplyRef.key,
                        content: replyContent,
                        date: replyDate,
                        replyToUID: replyAuthor,
                        replyToUsername: replyUsername,
                        author: auth.currentUser.uid,
                        postID: postID,
                        postTitle: post.title,
                        upvotes: 0,
                        downvotes: 0
                    }).then(() => {
                        document.querySelector(`#replyContent-${replyID}`).value = "";
                        window.location.reload();
                    }).catch((error) => {
                        console.log("Error adding comment:", error);
                    });
                });
            }
        });
    }

    window.deleteComment = function(commentID) {
        // Delete the comment
        remove(ref(database, `posts/${postID}/comments/${commentID}`))
          .then(() => {
            console.log('Comment deleted successfully.');
            // If you are using a frontend framework, you might have a more optimized way to update the view.
            window.location.reload();
          })
          .catch(error => {
            console.error('Error deleting comment:', error);
          });
    };

    window.deleteReply = function(replyID, parentCommentID) {
        remove(ref(database, `posts/${postID}/comments/${parentCommentID}/replies/${replyID}`))
          .then(() => {
            console.log('Comment deleted successfully.');
            window.location.reload();
          })
          .catch(error => {
            console.error('Error deleting comment:', error);
          });
    }

    window.editComment = function(commentID) {
        const commentContainer = document.getElementById(commentID);
        const viewComment = commentContainer.querySelector('.view-comment');
        const editComment = commentContainer.querySelector('.edit-comment');
    
        viewComment.classList.add("hidden");
        editComment.classList.remove("hidden");
    
        const commentRef = ref(database, 'posts/' + postID + '/comments/' + commentID);
        get(commentRef).then((snapshot) => {
            const comment = snapshot.val();
            const commentContentInput = commentContainer.querySelector(".newCommentContent");
            commentContentInput.value = comment.content;
        });
    
        const cancelButton = commentContainer.querySelector('.cancelForm');
        cancelButton.addEventListener('click', function() {
            viewComment.classList.remove("hidden");
            editComment.classList.add("hidden");
        });

        const saveButton = commentContainer.querySelector('.saveEditButton');
        saveButton.addEventListener('click', function(event) {
            event.preventDefault();
            const newCommentContent = commentContainer.querySelector(".newCommentContent").value;
            const updates = {};
            updates['posts/' + postID + '/comments/' + commentID + '/content'] = newCommentContent;
            updates['posts/' + postID + '/comments/' + commentID + '/edited'] = true;
            update(ref(database), updates);
            location.reload();
        });
    }
    
    window.editReply = function(replyID, parentCommentID) {
        const replyContainer = document.getElementById(replyID);
        const viewComment = replyContainer.querySelector('.view-comment');
        const editComment = replyContainer.querySelector('.edit-comment');
    
        viewComment.classList.add("hidden");
        editComment.classList.remove("hidden");
    
        const replyRef = ref(database, 'posts/' + postID + '/comments/' + parentCommentID + '/replies/' + replyID);
        get(replyRef).then((snapshot) => {
            const reply = snapshot.val();
            const replyContentInput = replyContainer.querySelector(".newCommentContent");
            replyContentInput.value = reply.content;
        });
    
        const cancelButton = replyContainer.querySelector('.cancelForm');
        cancelButton.addEventListener('click', function() {
            viewComment.classList.remove("hidden");
            editComment.classList.add("hidden");
        });
    
        const saveButton = replyContainer.querySelector('.saveEditButton');
        saveButton.addEventListener('click', function(event) {
            event.preventDefault();
            const newCommentContent = replyContainer.querySelector(".newCommentContent").value;
            const updates = {};
            updates['posts/' + postID + '/comments/' + parentCommentID + '/replies/' + replyID + '/content'] = newCommentContent;
            updates['posts/' + postID + '/comments/' + parentCommentID + '/replies/' + replyID + '/edited'] = true;
            update(ref(database), updates);
            location.reload();
        });
    }

    window.toggleReplyForm = function(button) {
        const commentElement = button.closest('.comment');
        const replyForm = commentElement.querySelector('.replyForm');
        replyForm.classList.toggle("hidden");
    }

    // check if user has upvoted or downvoted this post and change button color accordingly
    const voteRef = ref(database, 'user_votes/' + postID + '/' + auth.currentUser.uid);
    console.log('vote ref ' + voteRef);

    // // check if user has upvoted or downvoted this post
    get(voteRef).then((snapshot) => {
        const voteData = snapshot.val();

        console.log('vote data ' + voteData);

        if (voteData == 'upvote') {
            document.getElementById("upvoteButton").classList.add("active");
            document.getElementById("downvoteButton").classList.remove("active");
        } else if (voteData == 'downvote') {
            document.getElementById("downvoteButton").classList.add("active");
            document.getElementById("upvoteButton").classList.remove("active");
        } else {
            document.getElementById("upvoteButton").classList.remove("active");
            document.getElementById("downvoteButton").classList.remove("active");
        }
    });

    // check if user has upvoted or downvoted the comments and change button color accordingly
    const commentRef = ref(database, 'posts/' + postID + '/comments');
    get(commentRef).then((snapshot) => {
        const comments = snapshot.val();
        for (const commentID in comments) {
            const comment = comments[commentID];
            const commentVoteRef = ref(database, 'user_comment_votes/' + postID + '/' + commentID + '/' + auth.currentUser.uid);
            get(commentVoteRef).then((snapshot) => {
                const voteData = snapshot.val();
                if (voteData == 'upvote') {
                    document.querySelector(".comment-upvote-" + comment.commentID).classList.add("active");
                    document.querySelector(".comment-downvote-" + comment.commentID).classList.remove("active");
                } else if (voteData == 'downvote') {
                    document.querySelector(".comment-downvote-" + comment.commentID).classList.add("active");
                    document.querySelector(".comment-upvote-" + comment.commentID).classList.remove("active");
                } else {
                    document.querySelector(".comment-upvote-" + comment.commentID).classList.remove("active");
                    document.querySelector(".comment-downvote-" + comment.commentID).classList.remove("active");
                }
            });
        }
    });

    // check if user has upvoted or downvoted the replies and change button color accordingly
    const replyRef = ref(database, 'posts/' + postID + '/comments');
    get(replyRef).then((snapshot) => {
        const comments = snapshot.val();
        for (const commentID in comments) {
            const comment = comments[commentID];
            const replies = comment.replies;
            for (const replyID in replies) {
                const reply = replies[replyID];
                const replyVoteRef = ref(database, 'user_reply_votes/' + postID + '/' + commentID + '/' + replyID + '/' + auth.currentUser.uid);
                get(replyVoteRef).then((snapshot) => {
                    const voteData = snapshot.val();
                    if (voteData == 'upvote') {
                        document.querySelector(".reply-upvote-" + reply.commentID).classList.add("active");
                        document.querySelector(".reply-downvote-" + reply.commentID).classList.remove("active");
                    } else if (voteData == 'downvote') {
                        document.querySelector(".reply-downvote-" + reply.commentID).classList.add("active");
                        document.querySelector(".reply-upvote-" + reply.commentID).classList.remove("active");
                    } else {
                        document.querySelector(".reply-upvote-" + reply.commentID).classList.remove("active");
                        document.querySelector(".reply-downvote-" + reply.commentID).classList.remove("active");
                    }
                });
            }
        }
    });


    window.handleCommentVote = function(commentID, voteType) {
        const commentRef = ref(database, 'posts/' + postID + '/comments/' + commentID);
        const commentVoteRef = ref(database, 'user_comment_votes/' + postID + '/' + commentID + '/' + auth.currentUser.uid);
    
        get(commentVoteRef).then((snapshot) => {

            // if comment has no vote yet
            if (!snapshot.exists()) {
                if (voteType == 'upvote') {
                    update(commentRef, {
                        upvotes: increment(1)
                    });
                    set(commentVoteRef, 'upvote').then(() => { 
                        // change button color
                        document.querySelector(".comment-upvote-" + commentID).classList.add("active");
                        document.querySelector(".comment-downvote-" + commentID).classList.remove("active");
                    });
                } else if (voteType == 'downvote') {
                    update(commentRef, {
                        downvotes: increment(1)
                    });
                    set(commentVoteRef, 'downvote').then(() => {
                        // change button color
                        document.querySelector(".comment-downvote-" + commentID).classList.add("active");
                        document.querySelector(".comment-upvote-" + commentID).classList.remove("active");
                    });
                }
            }

            // if comment has already been voted on
            else {
                // if upvote -> downvote
                if (snapshot.val() == 'upvote' && voteType == 'downvote') {
                    update(commentRef, {
                        upvotes: increment(-1),
                        downvotes: increment(1)
                    });
                    set(commentVoteRef, 'downvote').then(() => {
                        // change button color
                        document.querySelector(".comment-downvote-" + commentID).classList.add("active");
                        document.querySelector(".comment-upvote-" + commentID).classList.remove("active");
                    });
                }
                // if downvote -> upvote
                else if (snapshot.val() == 'downvote' && voteType == 'upvote') {
                    update(commentRef, {
                        upvotes: increment(1),
                        downvotes: increment(-1)
                    });
                    set(commentVoteRef, 'upvote').then(() => {
                        // change button color
                        document.querySelector(".comment-upvote-" + commentID).classList.add("active");
                        document.querySelector(".comment-downvote-" + commentID).classList.remove("active");
                    });
                }
                // if upvote -> remove vote
                else if (snapshot.val() == 'upvote' && voteType == 'upvote') {
                    update(commentRef, {
                        upvotes: increment(-1)
                    });
                    remove(commentVoteRef).then(() => {
                        // change button color
                        document.querySelector(".comment-upvote-" + commentID).classList.remove("active");
                        document.querySelector(".comment-downvote-" + commentID).classList.remove("active");
                    });
                }
                // if downvote -> remove vote
                else if (snapshot.val() == 'downvote' && voteType == 'downvote') {
                    update(commentRef, {
                        downvotes: increment(-1)
                    });
                    remove(commentVoteRef).then(() => {
                        // change button color
                        document.querySelector(".comment-upvote-" + commentID).classList.remove("active");
                        document.querySelector(".comment-downvote-" + commentID).classList.remove("active");
                    });
                }
            }
        });
    };    

    window.handleReplyVote = function(commentID, replyID, voteType) {
        const replyRef = ref(database, 'posts/' + postID + '/comments/' + commentID + '/replies/' + replyID);
        const replyVoteRef = ref(database, 'user_reply_votes/' + postID + '/' + commentID + '/' + replyID + '/' + auth.currentUser.uid);
    
        console.log(' ' + replyVoteRef);
        console.log('reply id" ' + replyID);

        get(replyVoteRef).then((snapshot) => {

            // if reply has no vote yet
            if (!snapshot.exists()) {
                if (voteType == 'upvote') {
                    update(replyRef, {
                        upvotes: increment(1)
                    });
                    set(replyVoteRef, 'upvote').then(() => {
                        // change button color
                        document.querySelector(".reply-upvote-" + replyID).classList.add("active");
                        document.querySelector(".reply-downvote-" + replyID).classList.remove("active");
                    });
                } else if (voteType == 'downvote') {
                    update(replyRef, {
                        downvotes: increment(1)
                    });
                    set(replyVoteRef, 'downvote').then(() => {
                        // change button color
                        document.querySelector(".reply-downvote-" + replyID).classList.add("active");
                        document.querySelector(".reply-upvote-" + replyID).classList.remove("active");
                    });
                }
            }

            // if reply has already been voted on
            else {
                // if upvote -> downvote
                if (snapshot.val() == 'upvote' && voteType == 'downvote') {
                    update(replyRef, {
                        upvotes: increment(-1),
                        downvotes: increment(1)
                    });
                    set(replyVoteRef, 'downvote').then(() => {
                        // change button color
                        document.querySelector(".reply-downvote-" + replyID).classList.add("active");
                        document.querySelector(".reply-upvote-" + replyID).classList.remove("active");
                    });
                }
                // if downvote -> upvote
                else if (snapshot.val() == 'downvote' && voteType == 'upvote') {
                    update(replyRef, {
                        upvotes: increment(1),
                        downvotes: increment(-1)
                    });
                    set(replyVoteRef, 'upvote').then(() => {
                        // change button color
                        document.querySelector(".reply-upvote-" + replyID).classList.add("active");
                        document.querySelector(".reply-downvote-" + replyID).classList.remove("active");
                    });
                }
                // if upvote -> remove vote
                else if (snapshot.val() == 'upvote' && voteType == 'upvote') {
                    update(replyRef, {
                        upvotes: increment(-1)
                    });
                    remove(replyVoteRef).then(() => {
                        // change button color
                        document.querySelector(".reply-upvote-" + replyID).classList.remove("active");
                        document.querySelector(".reply-downvote-" + replyID).classList.remove("active");
                    });
                }
                // if downvote -> remove vote
                else if (snapshot.val() == 'downvote' && voteType == 'downvote') {
                    update(replyRef, {
                        downvotes: increment(-1)
                    });
                    remove(replyVoteRef).then(() => {
                        // change button color
                        document.querySelector(".reply-upvote-" + replyID).classList.remove("active");
                        document.querySelector(".reply-downvote-" + replyID).classList.remove("active");
                    });
                }
            }
        });
    };
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


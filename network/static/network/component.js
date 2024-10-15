
var DECREMENT = -1;
var INCREMENT = 1;

document.addEventListener('DOMContentLoaded', function() {

    document.querySelector('#followed-posts').addEventListener('click', () => viewPosts('following'));
    document.querySelector('#all-posts').addEventListener('click', () => viewPosts('all'));
    
    const profile = document.querySelectorAll('#profile');
    profile.forEach(profile => {
        profile.addEventListener('click', (event) => {
            event.preventDefault();
            const username = profile.querySelector('b').textContent.toLowerCase();
            viewProfile(username);
        });
    });

    const content = document.querySelectorAll('#content');
    content.forEach(content => {
        content.addEventListener('click', (event) => {
            event.preventDefault();
            viewContent(this.dataset.id);
        });
    });

    const container = document.querySelector('#create-view');
    container.innerHTML = `
        <div id="create-post" class="create-tweet">
            <textarea id="new-post" class="tweet-compose" placeholder="What's happening?"></textarea>
            <div class="image-upload">
                <input type="file" id="post-image" accept="*.png" style="display: none; ">
                <label for="post-image" class="image-upload-label">📷 Add Image</label>
                <div id="image-preview"></div>
            </div>
            <button id="submit-post" class="tweet-button" disabled>Post</button>
        </div>
    `;
    
    const submit = document.getElementById('submit-post');
    const newPost = document.getElementById('new-post');
    const imageInput = document.getElementById('post-image');
    const imagePreview = document.getElementById('image-preview');
    let selectedImage = '';
    
    function updateSubmitButton() {
        submit.disabled = newPost.value.trim() === '';
    }
    
    newPost.addEventListener('input', updateSubmitButton);
    
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 200px;">`;
            }
            reader.readAsDataURL(file);
            selectedImage = file;
        } else {
            imagePreview.innerHTML = '';
            selectedImage = '';
        }
    });
    
    submit.addEventListener('click', (e) => {
        e.preventDefault();
        submit.disabled = true;
    
        const formData = new FormData();
        formData.append('content', newPost.value);
        if (selectedImage) {
            formData.append('media', selectedImage);
        }
    
        fetch('/posts/create', {  // Ensure the correct URL
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                newPost.value = '';
                imagePreview.innerHTML = '';
                selectedImage = '';
                updateSubmitButton();
                viewPosts('all');
            } else {
                console.error('Error adding post:', data.error);
            }
        })
        .finally(() => {
            submit.disabled = false;
        });
    });
    viewPosts('all');
});

function addComment(postId, content) {
    fetch(`/post/${postId}`, {
        method: 'POST',
        body: JSON.stringify({ content: content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.comment) {
            document.getElementById('new-comment').value = '';
            viewComments(postId);  
        } else {
            console.error('Error adding comment:', data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}

function viewComments(postId) {
    fetch(`/post/${postId}`)
        .then(response => response.json())
        .then(data => {
            const commentsList = document.getElementById('comments-list');
            const commentCount = data.comments.length;
            commentsList.innerHTML = '';
            commentsList.innerHTML = `${commentCount} replies.`;
            data.comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                    <a href="#" data-username="${comment.author.username}" class="profile-link"  id="profile"> <b>${comment.author.first_name}</b> @${comment.author.username}</a> 
                    <small class="timestamp">${comment.created_at}</small>
                    <p>${comment.content}</p>
                `;

                const profile = commentElement.querySelector ('.profile-link');
                    profile.addEventListener('click', function(event) {
                    event.preventDefault();
                    viewProfile(this.dataset.username);
                });
                
                commentsList.appendChild(commentElement);
            });
        })
        .catch(error => console.error('Error:', error));
}


function likePost(state, postId) {
    const postElement = state === 'content' 
        ? document.querySelector('.content-card') 
        : document.querySelector(`.post-card[data-id="${postId}"]`);

    if (!postElement) return;

    const likeButton = postElement.querySelector('.like-button');
    const isLiked = likeButton.dataset.liked === 'true';

    fetch(`/post/${postId}/like`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            is_liked: !isLiked
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const likesCountElement = postElement.querySelector('.likes-count');
            const likeTextElement = likeButton.querySelector('span');
            
            likeButton.dataset.liked = data.is_liked;
            likeTextElement.textContent = data.is_liked ? 'Unlike' : 'Like';
            likesCountElement.textContent = `${data.likes_count} likes`;
            likeButton.classList.toggle('liked', data.is_liked);
        } else {
            console.error('Error updating like status:', data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}
function followUser (username, isFollowing, windowState, key) {

    fetch (`profile/${username}/follow`, {
        method: 'PUT',
        body: JSON.stringify({
            is_following: !isFollowing
        })
    })
    .then(() => {
        if (windowState == 'post') {
            viewContent(key)
        } 
        if (windowState == 'profile'){
            viewProfile(username)
        } 
        if (windowState == 'followlist'){
            if (isFollowing) {
                key.currentFollowing = key.currentFollowing.filter(user => user.username !== username);
            } else {
                key.currentFollowing.push({ username: username });
            }
            viewFollowList(key.followList, key.currentFollowing, key.currentUser);
        
        }
    })
}

function editPost(postId, updatedContent) {
    fetch (`/post/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({
            content: updatedContent
        })
    })
    .then(() => viewContent(postId))
}

function editProfile (username, page, updatedContent, profilePicture) {

    const data = new FormData();
    data.append('bio', updatedContent);
    if (profilePicture) {
        data.append('profile_picture', profilePicture);
    }

    console.log('FormData contents:');
    for (let [key, value] of data.entries()) {
        console.log(key, value instanceof File ? value.name : value);
    }

    fetch (`/profile/${username}/${page}`, {
        method: 'POST',
        body: data
    })
    .then(() => viewProfile(username))

}

function viewContent (postId) {

    document.querySelector('.feed').classList.add('hidden');
    document.querySelector('.profile').classList.add('hidden');
    document.querySelector('.content').classList.remove('hidden');
    const container = document.querySelector('#content-view');
    container.innerHTML = '';
    fetch (`/post/${postId}`)
        .then (response => response.json())
        .then (data => {
            const content = document.createElement ('div');
            content.className = 'content-card';
            content.innerHTML = `
                <button id="back-to-posts" class="back-button" >Back to Posts</button>
                <div class="content-header">
                   <span> <a href="#" class="profile-link" data-username="${data.post.author.username}" id="profile"> <b>${data.post.author.first_name} </b> @${data.post.author.username} </a>
                    <small class="post-date">${data.post.created_at}</small></span>
                    <button id="follow-button" class="follow-button">${data.is_following ? "Unfollow" : "Follow"}</button>
                    <button id="edit-button">Edit</button>
                 </div> 
                 <small id="edit-time-${data.post.id}" ${data.post.modified_at !== data.post.created_at ? '' : 'style="display: none;"'}>LAST EDITED: ${data.post.modified_at}</small>

                    
                <p id="post-content" class="post-content" >${data.post.content} </p>
                 ${data.post.media ? `<img src="${data.post.media}" style="max-width: 100%; max-height: 200px;">` : ''}

                <div id="content-form" style="display: none;">
                <textarea id="edit-content" class="content-edit">${data.post.content}</textarea>
                    <button id="save-edit" class="save" >Save</button>
                    <button id="cancel-edit">Cancel</button>
                </div>
                
                <p class="likes-count"> ${data.post.likes_count} likes. </p><br>

                <div class="tweet-actions ">
                    <button class="like-button" data-id="${data.post.id}" data-liked="${data.is_liked ? 'true' : 'false'}">
                    <svg viewBox="0 0 24 24" class="heart-icon">
                        <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"/>
                    </svg>
                    <span>${data.is_liked ? 'Unlike' : 'Like'}</span>
                    </button>
                </div><br>
  
                <section id="comments-section" class="comments-section">
                    <div class="compose-view">
                        <textarea id="new-comment" class="comment-compose" placeholder="Post your reply"></textarea>
                        <button id="submit-comment" class="reply-button">Reply</button>
                    </div>
                </section><br>

                <div id="comments-list"></div>
                    
                `;

            const likeButton = content.querySelector('.like-button');
            likeButton.addEventListener ('click', function() { 
                likePost('content', this.dataset.id, this.textContent === 'Unlike');
            });
            
            const followButton = content.querySelector('#follow-button');
            followButton.addEventListener ('click', function() { 
                followUser (data.post.author.username, data.is_following, 'post', data.post.id); 
            })
            
            const editButton = content.querySelector('#edit-button');
            editButton.addEventListener('click', function() {
                content.querySelector(`#content-form`).style.display = 'block';
                content.querySelector(`.comments-section`).style.display = 'none';
                content.querySelector(`#comments-list`).style.display = 'none';
                content.querySelector(`.post-content`).style.display = 'none';
                content.querySelector(`.tweet-actions`).style.display = 'none';
                content.querySelector(`.likes-count`).style.display = 'none';
                content.querySelector(`.back-button`).style.display = 'none';
                likeButton.style.display = 'none';
                editButton.style.display = 'none';
            });
            
            if (data.can_edit) { followButton.style.display = 'none'; }
            else { editButton.style.display = 'none'; }
            
            const cancelEdit = content.querySelector(`#cancel-edit`);
            cancelEdit.addEventListener('click', function() { 
                viewContent(data.post.id); 
            });

            const backButton = content.querySelector('.back-button');
            backButton.addEventListener('click', function() { 
                viewPosts('all'); 
            });

            const saveEdit = content.querySelector(`#save-edit`);
            saveEdit.addEventListener('click', function() {
                const updatedContent = content.querySelector(`#edit-content`).value;
                editPost(data.post.id, updatedContent);
            });
            
            const profileLink = content.querySelector('.profile-link');
            profileLink.addEventListener('click', function(event) {
                event.preventDefault();
                viewProfile(this.dataset.username);
            });

            const submitComment = content.querySelector(`#submit-comment`);
            submitComment.addEventListener('click', () => {
                const comment = document.getElementById('new-comment').value;
                if (comment) {
                    addComment(postId, comment);
                }
            });
            container.appendChild(content);
            viewComments(data.post.id);
            window.scrollTo(0, 0);
        })
        .catch(error => console.error('Error:', error));
}
function viewFollowList (followList, currentFollowing, currentUser) {

    document.querySelector('.profile-view').classList.add('hidden');
    document.querySelector ('.follow-header').style.display = 'block';
    document.querySelector('.follow-list').classList.remove('hidden');
    document.querySelector('.feed').classList.add('hidden');

    const container = document.querySelector ('.follow-list');
    container.innerHTML = ``;
    followList.forEach(profile => { 
        const profilePictureURL = profile.profile_picture ? profile.profile_picture : "/media/profile_pictures/default.png";
        const isFollowing = currentFollowing.some(following => following.username === profile.username);
        console.log(isFollowing);
        const user = document.createElement('span');
        user.className = 'follow-card'
        user.dataset.username = profile.username;
        user.innerHTML = `
        <span>
                <img class="profile-frame" src="${profilePictureURL}" style="max-width: 100%; border-radius: 50%; max-height: 30px;">
                <a href="#" class="profile-link" data-username="${profile.username}" id="profile"><b>${profile.first_name}</b> @${profile.username}</a>
            </span>
                <button id="follow-button" class="follow-button" data-username="${profile.username}">${isFollowing ? "Unfollow" : "Follow"}</button>
            `;
            const userProfile = user.querySelector ('.profile-link');
            userProfile.addEventListener('click', function(event) {
                event.preventDefault();
                viewProfile(this.dataset.username);
            });
            
            const followButton = user.querySelector(`.follow-button`);
            if (profile.username == currentUser.username) { followButton.style.display = 'none'; }
            followButton.addEventListener ('click', function() {
                followUser(this.dataset.username, isFollowing, 'followlist', {followList, currentFollowing, currentUser});
            })
            container.appendChild(user);
    })
    
}
function viewProfile(username, page = 1) {
    window.scrollTo(0, 0);
    document.querySelector('.content').classList.add('hidden');
    document.querySelector('.create-view').classList.add('hidden');
    document.querySelector('.follow-list').classList.add('hidden');

    document.querySelector('.profile-view').classList.remove('hidden');
    document.querySelector('.profile').classList.remove('hidden');
    document.querySelector('.feed').classList.remove('hidden');

    document.querySelector ('.follow-header').style.display = 'none';
    
    fetch(`/profile/${encodeURIComponent(username)}/${page}`)
        .then(response => response.json())
        .then(data => {
            const postsCount = data.posts.length;
            const profilePictureURL = data.profile.user.profile_picture ? data.profile.user.profile_picture : "/media/profile_pictures/default.png";
            const container = document.querySelector('#profile-view');
            
            const joinedDate = new Date(data.profile.created_at);
            const formattedDate = joinedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

            container.innerHTML = ''; 
            container.innerHTML = `

            <header class="profile-header"><a href="#" id="back-button">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
                </svg></a>
                <div>
                    <h1> ${data.profile.user.first_name} </h1>
                    <p class="posts-count"> ${postsCount} posts</p>
                </div>
            </header>
            
            <div class="cover-photo"></div> 

            <div class="profile-container">
            <img src="${profilePictureURL}" class="profile-picture" alt="@${data.profile.user.username}'s profile picture" >
            <button id="follow-button" class="follow-button">${data.is_following ? "Unfollow" : "Follow"}</button>
            <button id="edit-button" class="edit-button" > Edit </button>
                <div class="profile-info">
                        <h2 class="profile-name"> ${data.profile.user.first_name} </h2> 
                        <p class="profile-handle"> @${data.profile.user.username} </p>
                        <p class="profile-bio">${data.has_bio ? data.profile.bio : 'No bio yet.'}</p>
                    <div class="profile-meta">
                        <div> 📍 white space </div>
                        <div> 🔗<a href="https://cs50.harvard.edu/">https://cs50.harvard.edu/</a> </div>
                        <div> 📆 Joined ${formattedDate} </div>
                    </div>
                    <div class="profile-stats">
                        <div><span class="stat-value"><a id="following-list" href="#"> ${data.following} </a></span><span class="stat-label"> Following</span></div>
                        <div><span class="stat-value"><a id="follower-list" href="#">${data.followers} </a></span><span class="stat-label"> Followers</span></div>
                    </div>
                </div>
            </div>
                    
            <div id="bio-form" class ="bio-from" style="display: none;">
                <textarea id="edit-bio" class="bio-edit" >${data.has_bio ? data.profile.bio : 'No bio yet.'} </textarea>
                <input type="file" id="edit-profile-picture" accept="image/*">
                <div id="profile-picture-preview"></div><br>
                <button id="save-bio" class="save" >Save</button>
                <button id="cancel-bio">Cancel</button>
            </div>    
            `;
            const backButton = container.querySelector(`#back-button`);
            backButton.addEventListener('click', function() { 
                viewPosts('all'); 
            });
            const followingList = container.querySelector (`#following-list`);
            followingList.addEventListener('click', function(event) {
                event.preventDefault();
                if (data.following > 0) {
                    document.querySelector('.follow-header').innerHTML =` <center><h1>@${data.profile.user.username}'s Following List</h1></center><br>`;
                    viewFollowList (data.following_list, data.current_following, data.current_user);
                }
                });
            
            const followerList = container.querySelector(`#follower-list`);
            followerList.addEventListener('click', function(event) {
                event.preventDefault();
                if (data.followers > 0) {
                    document.querySelector('.follow-header').innerHTML =`<center><h1>@${data.profile.user.username}'s Follower List</h1></center><br>`;
                    viewFollowList (data.follower_list, data.current_following, data.current_user);
                }
            }); 

            const followButton = container.querySelector(`#follow-button`);
            followButton.addEventListener ('click', function() {
                followUser(data.profile.user.username, data.is_following, 'profile', null);
            })

            const saveProfile = container.querySelector(`#save-bio`);
            const updatedBio = container.querySelector(`#edit-bio`);
            const profilePicturePreview = container.querySelector(`#profile-picture-preview`);
            const updatedProfilePicture = container.querySelector(`#edit-profile-picture`);
            
            updatedProfilePicture.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        profilePicturePreview.innerHTML = `<img src="${e.target.result}" alt="Profile Picture Preview" style="max-width: 200px; max-height: 200px;">`;
                    }
                    reader.readAsDataURL(file);
                }
            });
        
            saveProfile.addEventListener('click', function() {
                editProfile(username, page, updatedBio.value, updatedProfilePicture.files[0]);
            });
            
            const cancelBio = container.querySelector(`#cancel-bio`);
            cancelBio.addEventListener('click', function() {
                viewProfile(data.profile.user.username);
            });

            const editButton = container.querySelector(`#edit-button`);
            editButton.addEventListener('click', function() {
                const editForm = container.querySelector(`#bio-form`);
                document.querySelector(`.profile-stats`).style.display = 'none';
                document.querySelector('.feed').classList.add('hidden');
                editForm.style.display = 'block';
                editButton.style.display = 'none';

            });
            
            if (data.can_edit) { followButton.style.display = 'none'; }
            else { editButton.style.display = 'none'; }
            loadPosts (data.profile.user.username, data, true);
            window.scrollTo(0, 0);
        })
}

function viewPosts(scope, page = 1) {

    document.querySelector('.create-view').classList.remove('hidden');
    document.querySelector('.feed').classList.remove('hidden');

    document.querySelector('.profile').classList.add('hidden');
    document.querySelector('.content').classList.add('hidden');

        fetch(`/posts/${encodeURIComponent(scope)}/${page}`)
        .then (response => response.json())
        .then (posts => {
            loadPosts (scope, posts, false)
        })
        .catch (error => {
            console.error('Error:', error);
        });

}

function loadPosts (scope, posts, isProfile) {

    const container = document.querySelector ('#posts-view');
    container.innerHTML = '';
    posts.posts.forEach (entry  => {
        const post = document.createElement ('div'); 
        post.className = 'post-card';
        post.dataset.id = entry.id;
        const profilePictureURL = entry.author.profile_picture ? entry.author.profile_picture : "/media/profile_pictures/default.png";
        post.innerHTML = `
        <div class="entry-card">
        <span class="entry-header">
            <img class="profile-frame" src="${profilePictureURL}" style="max-width: 100%; border-radius: 50%; max-height: 30px;">
            <a href="#" class="profile-link" data-username="${entry.author.username}" id="profile"><b>${entry.author.first_name}</b> @${entry.author.username}</a>
            <small class="timestamp">${entry.created_at}</small>
        </span>
            <a href="#" id="content" data-id="${entry.id}" class="content-link">${entry.content} </a>
             ${entry.media ? `<img src="${entry.media}" style="max-width: 100%; max-height: 200px;">` : ''}
            <p class="likes-count">${entry.likes_count} likes. </p>
            
            <div class="tweet-actions">

                <button class="like-button" data-id="${entry.id}" data-liked="${entry.is_liked ? 'true' : 'false'}">
                    <svg viewBox="0 0 24 24" class="heart-icon">
                        <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"/>
                    </svg>
                    <span>${entry.is_liked ? 'Unlike' : 'Like'}</span>
                </button>

                <button class="comment-button" data-id="${entry.id}">
                    <svg viewBox="0 0 24 24" class="comment-icon">
                        <path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z"/>
                    </svg>
                    <span>Comment</span>
                </button>

            </div>
        </div>
        `;

        const profile = post.querySelector ('.profile-link');
        profile.addEventListener('click', function(event) {
            event.preventDefault();
            viewProfile(this.dataset.username);
        });

        const content = post.querySelector ('.content-link');
        content.addEventListener('click', function(event) {
            event.preventDefault();
            viewContent(this.dataset.id);
        });
        const commentButton = post.querySelector('.comment-button');
        commentButton.addEventListener('click', function() {
            viewContent(this.dataset.id);
        });
        const likeButton = post.querySelector('.like-button');
        likeButton.addEventListener('click', function() {
            likePost('view', this.dataset.id, this.textContent === 'Unlike');
        });

        container.appendChild(post);
        window.scrollTo(0, 0);
    });

    const paginator = document.querySelector ('#paginator');
    paginator.innerHTML = '';
    
    paginatorButton (posts, scope, isProfile, 'Previous', DECREMENT, posts.has_previous);

    const currentPage = document.createElement('span');
    currentPage.textContent = `${posts.page_number}`
    paginator.appendChild(currentPage);
    
    paginatorButton (posts, scope, isProfile, 'Next', INCREMENT, posts.has_next);
}

function paginatorButton (posts, scope, isProfile, buttonName, buttonIndex, buttonCondition) {

    if (buttonCondition) {
        const button = document.createElement ('button');
        button.textContent = buttonName;
        button.addEventListener ('click', () => {
            if (isProfile) { viewProfile(scope, posts.page_number + buttonIndex) } 
            else {viewPosts (scope, posts.page_number + buttonIndex)}
        });
        paginator.appendChild (button);
    }
}

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

    const container = document.querySelector('#create-view')
    container.innerHTML = `
        <div id="create-post" class="create-tweet">
            <textarea id="new-post" class="tweet-compose" placeholder="What's happening?"></textarea>
            <button id="submit-post" class="tweet-button" disabled>Post</button>
        </div>
    `;
    
    const submit = document.getElementById('submit-post')
    const newPost = document.getElementById('new-post');
    
    function updateSubmitButton() {
        submit.disabled = newPost.value.trim() === '';
    }
    
    newPost.addEventListener('input', updateSubmitButton);
    
    submit.addEventListener('click', (e) => {
        e.preventDefault();
        submit.disabled = true;
    
        fetch('/posts/create', {
            method: 'POST',
            body: JSON.stringify({ content: newPost.value })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                newPost.value = '';
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

function createButton(label) {
    const button = document.createElement('button');
    // button.className = className;
    button.innerHTML = `${label}`;
    return button;
  }

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
            commentsList.innerHTML = '';
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

function editProfile (username, page, updatedContent) {

    fetch (`/profile/${username}/${page}`, {
        method: 'PUT',
        body: JSON.stringify({
            bio: updatedContent
        })
    })
    .then(() => viewProfile(username))
}

function viewContent (postId) {

    document.querySelector('.feed').classList.add('hidden');
    document.querySelector('#content-view').style.display = 'block';
    const container = document.querySelector('#content-view');
    container.innerHTML = '';
    fetch (`/post/${postId}`)
        .then (response => response.json())
        .then (data => {
            const content = document.createElement ('div');
            content.className = 'content-card';
            content.innerHTML = `
                <button id="back-to-posts" class="back-btn" >Back to Posts</button>
                <div class="content-header">
                   <span> <a href="#" class="profile-link" data-username="${data.post.author.username}" id="profile"> <b>${data.post.author.first_name} </b> @${data.post.author.username} </a>
                    <small>${data.post.created_at}</small></span>
                    <button id="follow-button" class="follow-button">${data.is_following ? "Unfollow" : "Follow"}</button>
                    <button id="edit-button">Edit</button>
                 </div> 

                    
                    <p id="post-content">${data.post.content} </p>
              
                
                <div id="content-form" style="display: none;">
                <textarea id="edit-content">${data.post.content}</textarea>
                <button id="save-edit">Save</button>
                <button id="cancel-edit">Cancel</button>
                </div>
                
                <p class="likes-count"> ${data.post.likes_count} likes. ${data.comments_count} replies.</p>
                <small id="edit-time-${data.post.id}" ${data.post.modified_at !== data.post.created_at ? '' : 'style="display: none;"'}>LAST EDITED: ${data.post.modified_at}</small>


                <hr>
                <div class="tweet-actions">
                    <button class="like-button" data-id="${data.post.id}" data-liked="${data.is_liked ? 'true' : 'false'}">
                    <svg viewBox="0 0 24 24" class="heart-icon">
                        <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"/>
                    </svg>
                    <span>${data.is_liked ? 'Unlike' : 'Like'}</span>
                    </button>
                </div>
  

                <div id="comments-section" >
              
                        <div class="compose-view">
                        <textarea id="new-comment" class="comment-compose" placeholder="Post your reply"></textarea>
                        <button id="submit-comment" class="reply-button">Reply</button>
                        </div>
                    <div id="comments-list"></div>
                </div>

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
                content.querySelector(`#comments-section`).style.display = 'none';
                content.querySelector(`#post-content`).style.display = 'none';
                content.querySelector(`.timestamp`).style.display = 'none';
                content.querySelector(`.likes-count`).style.display = 'none';
                content.querySelector(`.back-btn`).style.display = 'none';
                likeButton.style.display = 'none';
                editButton.style.display = 'none';
            });
            
            if (data.can_edit) { followButton.style.display = 'none'; }
            else { editButton.style.display = 'none'; }
            
            const cancelEdit = content.querySelector(`#cancel-edit`);
            cancelEdit.addEventListener('click', function() { 
                viewContent(data.post.id); 
            });

            const backButton = content.querySelector('.back-btn');
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

function viewProfile(username, page = 1) {
    
    document.querySelector('#profile-view').style.display = 'block';
    document.querySelector('#content-view').style.display = 'none';
    document.querySelector('.feed').classList.remove('hidden');
    document.querySelector('.create-view').classList.add('hidden');

    fetch(`/profile/${encodeURIComponent(username)}/${page}`)
        .then(response => response.json())
        .then(data => {

            const container = document.querySelector('#profile-view');
            container.innerHTML = ''; 
            container.innerHTML = `
                <div class="profile-header">
                    <h1 class="profile-name"><b>${data.profile.user.first_name}</b> (@${data.profile.user.username})</h1>
                    <button id="follow-button" class="follow-button">${data.is_following ? "Unfollow" : "Follow"}</button>
                    <button id="edit-button" class="edit-button">Edit</button>
                </div>
                <small class="joined-date">Joined ${data.profile.created_at}</small>

                <p id="bio-content" class="bio-content">${data.has_bio ? data.profile.bio : 'No bio yet.'}</p>
                
                <div id="bio-form" style="display: none;">
                    <textarea id="edit-bio">${data.has_bio ? data.profile.bio : 'No bio yet.'}</textarea>
                    <button id="save-bio">Save</button>
                    <button id="cancel-bio">Cancel</button>
                </div>
                <p class="follow-data">${data.following} following. ${data.followers} followers.</p>
                

            `;

            const followButton = document.querySelector(`#follow-button`);
            followButton.addEventListener ('click', function() {
                
                followUser(data.profile.user.username, data.is_following, 'profile', null);
            })

            const saveBio = document.querySelector(`#save-bio`);
            saveBio.addEventListener('click', function() {
                const updatedContent = document.querySelector(`#edit-bio`).value;
                editProfile(username, page, updatedContent);
            });
            
            const cancelBio = document.querySelector(`#cancel-bio`);
            cancelBio.addEventListener('click', function() {
                viewProfile(data.profile.user.username);
            });

            const editButton = document.querySelector(`#edit-button`);
            editButton.addEventListener('click', function() {
                const editForm = document.querySelector(`#bio-form`);
                const content = document.querySelector(`#bio-content`);
                document.querySelector(`.follow-data`).style.display = 'none';
                editForm.style.display = 'block';
                content.style.display = 'none';
                editButton.style.display = 'none';
            });
            
            if (data.can_edit) { followButton.style.display = 'none'; }
            else { editButton.style.display = 'none'; }
            loadPosts (data.profile.user.username, data, true);
            window.scrollTo(0, 0);
        })
}

function viewPosts(scope, page = 1) {

    document.querySelector('#content-view').style.display = 'none';
    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('.create-view').classList.remove('hidden');
    document.querySelector('.feed').classList.remove('hidden');

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
        post.innerHTML = `
        <div class="entry-card">

            <a href="#" class="profile-link" data-username="${entry.author.username}" id="profile"><b>${entry.author.first_name}</b> @${entry.author.username}</a>
            <small class="timestamp">${entry.created_at}</small>
            <a href="#" id="content" data-id="${entry.id}" class="content-link">${entry.content}</a>
            <p class="likes-count">${entry.likes_count} likes</p>
            
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

var INITIALIZED = true;
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

    INITIALIZED = INITIALIZED ? !INITIALIZED : createPost();
    viewPosts('all');
});

function createPost() {
    
    const form = document.getElementById('create-form');
    const submitButton = document.getElementById('submit-post');
    const contentTextarea = document.querySelector('textarea[name="content"]');

    document.addEventListener('keyup', () => { submitButton.disabled = contentTextarea.value === '';});
    form.addEventListener('submit', function(e) {
        
        e.preventDefault();
        submitButton.disabled = true;

        const formData = new FormData(form);
        
        fetch('/posts/create', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                form.reset();
                viewPosts('all');
            } else {
                console.error('Error creating post:', data.error);
            }
        })
    });
}

function createButton(label) {
    const button = document.createElement('button');
    // button.className = className;
    button.innerHTML = `${label}`;
    return button;
  }

function likePost (postId, isLiked, windowState, username) {

    fetch (`/post/${postId}/like`, {
        method: 'PUT',
        body: JSON.stringify({
            is_liked: !isLiked
        })
    })
    .then(() => {
        if (windowState == 'following') { viewPosts('following') }
        if (windowState == 'all') { viewPosts('all') }
        if (windowState == 'content') { viewContent(postId) }
        if (windowState == 'profile') { viewProfile(username) }
        // if (windowState == 'follow_list') {}
    })
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

    document.querySelector('#content-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('#create-view').style.display = 'none';
    document.querySelector('#posts-view').style.display = 'none';
    document.querySelector('#paginator').style.display = 'none'; 
    fetch (`/post/${postId}`)
        .then (response => response.json())
        .then (data => {
            console.log(data);
            const container = document.querySelector('#content-view');
            container.innerHTML = `
            <div>
            <button id="back-to-posts" class="back-btn" >Back to Posts</button><br><br>
                <a href="#" class="profile-link" data-username="${data.post.author.username}" id="profile">${data.post.author.first_name} <b>${data.post.author.username}</b></a>
                <small>${data.post.created_at}</small>
                
                <p id="post-content">${data.post.content} </p>
                <b> ${data.post.likes_count} likes.</b><br><br>
                <small id="edit-time-${data.post.id}" ${data.post.modified_at !== data.post.created_at ? '' : 'style="display: none;"'}>LAST EDITED: ${data.post.modified_at}</small>
                    <div id="edit-form" style="display: none;">
                        <textarea id="edit-content">${data.post.content}</textarea>
                        <button id="save-edit">Save</button>
                        <button id="cancel-edit">Cancel</button>
                    </div>
            </div>
                `;
                
            const editButton = createButton ("Edit");
            const likeButton = createButton (data.is_liked ? "Unlike" : "Like");
            const followButton = createButton (data.is_following ? "Unfollow" : "Follow");

            likeButton.addEventListener ('click', function() {
                likePost(data.post.id, data.is_liked, 'content', null);
            })

            followButton.addEventListener ('click', function() {
                followUser(data.post.author.username, data.is_following, 'post', data.post.id);
            })

            editButton.addEventListener('click', function() {
                const editForm = document.querySelector(`#edit-form`);
                const content = document.querySelector(`#post-content`);
                editForm.style.display = 'block';
                content.style.display = 'none';
                likeButton.style.display = 'none';
                editButton.style.display = 'none';
            });
            
            const saveEdit = document.querySelector(`#save-edit`);
            const cancelEdit = document.querySelector(`#cancel-edit`);
            
            saveEdit.addEventListener('click', function() {
                const updatedContent = document.querySelector(`#edit-content`).value;
                editPost(data.post.id, updatedContent);
            });

            cancelEdit.addEventListener('click', function() {
                viewContent(data.post.id);
            });

            container.append(likeButton);

            if (data.can_edit) { container.append(editButton); }
            else { container.append(followButton); }

            
            const profileLink = container.querySelector('.profile-link');
            profileLink.addEventListener('click', function(event) {
                event.preventDefault();
                viewProfile(this.dataset.username);
            });

            const backButton = container.querySelector('.back-btn');
            backButton.addEventListener('click', function() {
                viewPosts('all');
            });
        })
        .catch(error => console.error('Error:', error));
}

function viewProfile(username, page = 1) {

    document.querySelector('#profile-view').style.display = 'block';
    document.querySelector('#create-view').style.display = 'none';
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#paginator').style.display = 'block';

    fetch(`/profile/${encodeURIComponent(username)}/${page}`)
        .then(response => response.json())
        .then(data => {

            const container = document.querySelector('#profile-view');
            container.innerHTML = ''; 
            // const profile = document.createElement('div');
            container.innerHTML = `
                <h2>${data.profile.user.first_name} (@${data.profile.user.username})</h2>
                <small>Joined ${data.profile.created_at}</small>

                <p id="bio-content">${data.has_bio ? data.profile.bio : 'No bio yet.'}</p>
                <p>${data.following} following. ${data.followers} followers.</p>
                <div id="bio-form" style="display: none;">
                        <textarea id="edit-bio">${data.has_bio ? data.profile.bio : 'No bio yet.'}</textarea>
                        <button id="save-bio">Save</button>
                        <button id="cancel-bio">Cancel</button>
                </div>

            `;
            const editButton = createButton ("Edit");
            const followButton = createButton (data.is_following ? "Unfollow" : "Follow");

            const saveBio = document.querySelector(`#save-bio`);
            const cancelBio = document.querySelector(`#cancel-bio`);
            
            followButton.addEventListener ('click', function() {
                followUser(data.profile.user.username, data.is_following, 'profile', null);
            })
            saveBio.addEventListener('click', function() {
                const updatedContent = document.querySelector(`#edit-bio`).value;
                editProfile(username, page, updatedContent);
            });

            cancelBio.addEventListener('click', function() {
                viewProfile(data.profile.user.username);
            });

            editButton.addEventListener('click', function() {
                const editForm = document.querySelector(`#bio-form`);
                const content = document.querySelector(`#bio-content`);
                editForm.style.display = 'block';
                content.style.display = 'none';
                editButton.style.display = 'none';
            });
            
            if (data.can_edit) { container.append(editButton); }
            else { container.append(followButton); }


            loadPosts (data.profile.user.username, data, true)
        })
}

function viewPosts(scope, page = 1) {

    document.querySelector('#content-view').style.display = 'none';
    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('#create-view').style.display = 'block';
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#paginator').style.display = 'block';

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
        post.innerHTML = `
        <hr> <br>
            <a href="#" class="profile-link" data-username="${entry.author.username}" id="profile">${entry.author.first_name} <b>${entry.author.username}</b></a>
            <small>${entry.created_at}</small>
            <a href="# id="content" data-id="${entry.id}" class="content-link" >${entry.content}</a>
            <p>${entry.likes_count} likes. </p><br>
            <button class="like-button" data-id="${entry.id}">${entry.is_liked ? 'Unlike' : 'Like'}</button>

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
        const likeButton = post.querySelector('.like-button');
        likeButton.addEventListener ('click', function() {
            if (isProfile) {
                likePost(this.dataset.id, entry.is_liked, 'profile', entry.author.username);
            } else {   
                likePost(this.dataset.id, entry.is_liked, scope, null);
            }
        })
        container.appendChild(post);
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
            if (isProfile) {
                viewProfile(scope, posts.page_number + buttonIndex)
            } else {
                viewPosts (scope, posts.page_number + buttonIndex)
            }
        }
    );
        paginator.appendChild (button);
    }
}
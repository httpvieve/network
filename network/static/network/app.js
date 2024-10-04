
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

function likePost (post_id, is_liked) {

    fetch (`/post/${post_id}/like`, {
        method: 'PUT',
        body: JSON.stringify({
            is_liked: !is_liked
        })
    })
    .then(() => viewContent(post_id))
}
function followUser (username, is_following, post_id) {

    fetch (`profile/${username}/follow`, {
        method: 'PUT',
        body: JSON.stringify({
            is_following: !is_following
        })
    })
    .then(() => viewContent(post_id))
    // .then(() => viewProfile(username))
}

function viewContent (post_id) {

    document.querySelector('#content-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('#create-view').style.display = 'none';
    document.querySelector('#posts-view').style.display = 'none';
    document.querySelector('#paginator').style.display = 'none'; 
    fetch (`/post/${post_id}`)
        .then (response => response.json())
        .then (data => {
            console.log(data);
            const container = document.querySelector('#content-view');
            container.innerHTML = `
            <div>
            <button id="back-to-posts" class="back-btn" >Back to Posts</button><br><br>
                <a href="#" class="profile-link" data-username="${data.post.author.username}" id="profile">${data.post.author.first_name} <b>${data.post.author.username}</b></a>
                <small>${data.post.created_at}</small>
                <small>can_edit: ${data.can_edit}</small>
                <small>is_liked: ${data.is_liked}</small>
                 <small>is_following: ${data.is_following}</small>
                <small>follower count: ${data.post.author.followers|length}</small>
                <p>${data.post.content} </p>
                <b> ${data.post.likes_count} likes.</b><br><br>
                </div>
                `;
                
              
            const likeButton = createButton (data.is_liked ? "Unlike" : "Like");
            likeButton.addEventListener ('click', function() {
                likePost(data.post.id, data.is_liked);
            })
            const followButton = createButton (data.is_following ? "Unfollow" : "Follow");
            container.append(likeButton);

            followButton.addEventListener ('click', function() {
                followUser(data.post.author.username, data.is_following, data.post.id);
            })
            container.append(followButton);

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
            const profile = document.createElement('div');
            profile.innerHTML = `
                <h2>${data.profile.user.first_name} (@${data.profile.user.username})</h2>
                <small>Joined ${data.profile.created_at}</small>
                <p>${data.profile.bio}</p>
                <p>${data.following} following. ${data.followers} followers.</p>
            `;
            container.appendChild(profile);
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
            <a href="#" class="profile-link" data-username="${entry.author.username}" id="profile">${entry.author.first_name} <b>${entry.author.username}</b></a>
            <small>${entry.created_at}</small>
            <a href="# id="content" data-id="${entry.id}" class="content-link" >${entry.content}</a>
            <p>${entry.likes_count} likes. </p><br>

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
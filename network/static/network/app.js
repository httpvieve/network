var initialized = true;

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

    initialized = initialized ? !initialized : createPost();
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


function viewProfile(username, page = 1) {

    document.querySelector('#profile-view').style.display = 'block';
    document.querySelector('#create-view').style.display = 'none';
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#paginator').style.display = 'block';

    fetch(`/profile/${encodeURIComponent(username)}/${page}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const container = document.querySelector('#profile-view');
            container.innerHTML = ''; 
            const profile = document.createElement('div');
            profile.innerHTML = `
                <h2>${data.profile.user.first_name} (@${data.profile.user.username})</h2>
                <p>${data.profile.bio}</p>
                <p>${data.following} following. ${data.followers } followers.</p>
            `;
            container.appendChild(profile);
            loadPosts (data.profile.user.username, data, true)
        })
}

function viewPosts(scope, page = 1) {
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
            <p>${entry.content}</p>
            <p>${entry.likes_count} likes. </p><br>
        `;

        const profile = post.querySelector ('.profile-link');
        profile.addEventListener('click', function(event) {
            event.preventDefault();
            viewProfile(this.dataset.username);
        });

        container.appendChild(post);
    });

    const paginator = document.querySelector ('#paginator');
    paginator.innerHTML = '';
    
    if (posts.has_previous) {
        const prevButton = document.createElement ('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener ('click', () => {
            if (isProfile) {
                viewProfile(scope, posts.page_number - 1)
            } else {
                viewPosts (scope, posts.page_number - 1)
            }
        }
    );
        paginator.appendChild (prevButton);
    }
    const currentPage = document.createElement('span');
    currentPage.textContent = `${posts.page_number}`
    paginator.appendChild(currentPage);

    if (posts.has_next) {
        const nextButton = document.createElement ('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener ('click', () => {
            if (isProfile) {
                viewProfile(scope, posts.page_number + 1)
            } else {
                viewPosts (scope, posts.page_number + 1)
            }
        }
    );
        paginator.appendChild (nextButton);
    }
    
}

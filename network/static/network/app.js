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
        .catch(error => {
            console.error('Error:', error);
        })
    });
}


function viewProfile(username) {

    document.querySelector('#profile-view').style.display = 'block';
    document.querySelector('#create-view').style.display = 'none';
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#paginator').style.display = 'none';

    fetch(`/profile/${username}`)
        .then(response => response.json())
        .then(data => {

            const container = document.querySelector('#profile-view');
            container.innerHTML = ''; 
            const profile = document.createElement('div');
            profile.innerHTML = `
                <h2>${data.profile.user.first_name} (@${data.profile.user.username})</h2>
                <p>${data.profile.bio}</p>
                <p>${data.following} following. ${data.followers } followers.</p>
            `;
            container.appendChild(profile);

            // Display user's posts
            const postsContainer = document.querySelector('#posts-view');
            postsContainer.innerHTML = `<h3> ${data.profile.user.first_name}'s Posts</h3>`;
            data.posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post';
                postElement.innerHTML = `
                    <p>${post.content}</p>
                    <small>Posted on ${post.created_at}</small>
                `;
                postsContainer.appendChild(postElement);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
function viewPosts(scope, page = 1) {

    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('#create-view').style.display = 'block';
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#paginator').style.display = 'block';

    // const container = document.querySelector (html);
    // const scopeTitle = document.createElement('h3');
    // scopeTitle.innerText = `${scope}`
    // container.appendChild(scopeTitle);
        fetch (`/posts/${scope}/${page}`)
        .then (response => response.json())
        .then (posts => {
            loadPosts (posts)
            loadPage (posts, scope)
        })
        .catch (error => {
            console.error('Error:', error);
        });
}



function loadPosts (posts) {

    const container = document.querySelector ('#posts-view');
    container.innerHTML = '';
    posts.posts.forEach (entry  => {
        const post = document.createElement ('div'); 
        post.className = 'post-card';
        post.innerHTML = `
            <a href="/profile/${entry.author.username}" id="profile">${entry.author.first_name} <b>${entry.author.username}</b></a>
            <small>${entry.created_at}</small>
            <p>${entry.content}</p>
            <p>${entry.likes_count} likes. </p><br>
        `;
        container.appendChild(post);

        post.addEventListener('click', (event) => {
            event.preventDefault();
            viewProfile(entry.author.username);
        });
    });


    
}

function loadPage (posts, scope) {

    const paginator = document.querySelector ('#paginator');
    paginator.innerHTML = '';
    
    if (posts.has_previous) {
        const prevButton = document.createElement ('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener ('click', () => viewPosts (scope, --posts.page_number));
        paginator.appendChild (prevButton);
    }
    const currentPage = document.createElement('span');
    currentPage.textContent = `${posts.page_number}`
    paginator.appendChild(currentPage);

    if (posts.has_next) {
        const nextButton = document.createElement ('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener ('click', () => viewPosts (scope, ++posts.page_number));
        paginator.appendChild (nextButton);
    }

}
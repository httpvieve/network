document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#followed-posts').addEventListener('click', () => viewPosts('following'));
    document.querySelector('#all-posts').addEventListener('click', () => viewPosts('all'));
    const myProfile = document.querySelector('#my-profile');
    document.querySelector('#my-profile').addEventListener('click', (event) => viewProfile(myProfile))
    document.querySelector
    viewPosts('all');
});
function viewProfile (username) {
    document.querySelector('#profile-view').style.display = 'block';
    document.querySelector('#create-view').style.display = 'none';
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#paginator').style.display = 'block';

    fetch (`/profile/${username}`)
        .then (response => response.json())
        .then (data => {
            const container = document.querySelector('#profile-view');
            const profile = document.createElement('div');
            profile.innerHTML = `
                <h2> ${data.user.first_name} (@${data.user.username})</h2>
                <img src="${data.profile_picture || '/static/media/fish.png'}" alt="Profile Picture">
                <p>${data.bio}</p>
                <p>${data.following.length} followings. ${data.followers.length} followers.</p>
            `;
            container.appendChild(profile);
        });
}
function viewPosts(scope, page = 1) {

    document.querySelector('#profile-view').style.display = 'block';
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
            <h3><b>${entry.author.first_name}<b> @${entry.author.username}</h3>
            <small>${entry.created_at}</small>
            <p>${entry.content}</p>
            <p>${entry.likes_count} likes. </p><br>
        `;
        container.appendChild(post);
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
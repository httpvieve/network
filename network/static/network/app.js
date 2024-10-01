document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#followed-posts').addEventListener('click', () => viewPosts('following'));
    document.querySelector('#all-posts').addEventListener('click', () => viewPosts('all'));

    viewPosts('all');
});

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
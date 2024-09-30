document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#followed-posts').addEventListener('click', () => viewPosts('following'));
    document.querySelector('#all-posts').addEventListener('click', () => viewPosts('all'));

    // Initial load of all posts
    viewPosts('all');
});

function viewPosts(scope, page = 1) {
    fetch(`/posts/${scope}?page=${page}`)
        .then(response => response.text())
        .then(html => {
            const postsView = document.querySelector('#posts-view');
            postsView.innerHTML = html;

            // Update active button state
            document.querySelector('#all-posts').classList.toggle('active', scope === 'all');
            document.querySelector('#followed-posts').classList.toggle('active', scope === 'following');

            // Update pagination links
            updatePaginationLinks(scope);
        })
        .catch(error => {
            console.error('Error:', error);
        });

    // Show relevant views
    document.querySelector('#profile-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#posts-view').style.display = 'block';
}

function updatePaginationLinks(scope) {
    const links = document.querySelectorAll('#posts-view a');
    links.forEach(link => {
        if (link.href.includes('page=')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const url = new URL(this.href);
                const page = url.searchParams.get('page');
                viewPosts(scope, page);
            });
        }
    });
}
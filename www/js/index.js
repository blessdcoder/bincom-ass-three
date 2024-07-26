const postsContainer = document.getElementById('posts-container');
const apiUrl = 'https://api.jsonbin.io/v3/b/66a27d87acd3cb34a86b3546';
const apiKey = '$2a$10$NUYjfL8kAkknlCMCACEFR.im.LBIpHsNWpw/MZHvGizy8S5h7ZxyO'; // Replace with your actual API key

function fetchAndDisplayPosts() {
    fetch(`${apiUrl}/latest`, {
        headers: { 'X-Master-Key': apiKey }
    })
    .then(response => response.json())
    .then(data => {
        postsContainer.innerHTML = ''; // Clear previous posts
        (data.record.record.posts || []).forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p>${post.content}</p>
                <button class="delete-button" data-id="${post.id}">Delete</button>
            `;
            postElement.querySelector('.delete-button').addEventListener('click', () => deletePost(post.id));
            postsContainer.appendChild(postElement);
        });
    })
    .catch(console.error);
}


// Fetch and display posts on page load
fetchAndDisplayPosts();

// Handle form submission/
document.getElementById('post-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const newPost = {
        id: Date.now().toString(), // Generate a unique ID using current timestamp
        title: formData.get('title'),
        content: formData.get('content')
    };

    fetch(`${apiUrl}/latest`, {
        headers: { 'X-Master-Key': apiKey }
    })
    .then(response => response.json())
    .then(data => {
        data.record.record.posts.push(newPost);
        return fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey
            },
            body: JSON.stringify({ record: data.record.record })
        });
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to add post');
        fetchAndDisplayPosts();
        this.reset();
    })
    .catch(console.error);
});

// Deleting Post from Backend
function deletePost(postId) {
    fetch(`${apiUrl}/latest`, {
        headers: { 'X-Master-Key': apiKey }
    })
    .then(response => response.json())
    .then(data => {
        const postIndex = data.record.record.posts.findIndex(post => post.id === postId);
        if (postIndex === -1) {
            throw new Error('Post not found');
        }
        data.record.record.posts.splice(postIndex, 1);
        return fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey
            },
            body: JSON.stringify({ record: data.record.record })
        });
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to delete post');
        fetchAndDisplayPosts();
    })
    .catch(error => console.error('Error deleting post:', error));
}
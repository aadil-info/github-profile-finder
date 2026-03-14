const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const mainContainer = document.getElementById('main-container');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');

const API_URL = 'https://api.github.com/users/';

// Fetch user data
async function getUser(username) {
    try {
        showLoading();
        const response = await fetch(API_URL + username);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('User not found');
            }
            throw new Error('Something went wrong');
        }

        const data = await response.json();
        
        // Fetch top 5 repos
        const reposData = await getRepos(username);
        
        createProfileCard(data, reposData);
    } catch (error) {
        showError(error.message);
    }
}

// Fetch user repositories
async function getRepos(username) {
    try {
        const response = await fetch(API_URL + username + '/repos?sort=updated&per_page=100');
        if (!response.ok) throw new Error('Could not fetch repos');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Show loading spinner
function showLoading() {
    mainContainer.innerHTML = '';
    errorMessage.classList.add('hidden');
    loading.classList.remove('hidden');
}

// Show error message
function showError(msg) {
    loading.classList.add('hidden');
    mainContainer.innerHTML = '';
    errorMessage.classList.remove('hidden');
    errorMessage.querySelector('p').innerText = msg;
}

// Create and inject the profile card
function createProfileCard(user, repos) {
    loading.classList.add('hidden');
    
    const bio = user.bio ? user.bio : 'This profile has no bio';
    const location = user.location ? `<div class="location"><i class="fas fa-map-marker-alt"></i> ${user.location}</div>` : '';
    const name = user.name ? user.name : user.login;
    const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'});

    let reposHTML = '';
    if (repos && repos.length > 0) {
        // Sort by stars descending and take top 5
        const sortedRepos = repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5);
        
        reposHTML = `
            <div class="repos">
                <h3>Top Repositories</h3>
                <div class="repo-list">
                    ${sortedRepos.map(repo => `
                        <a href="${repo.html_url}" target="_blank" class="repo-item">
                            <div class="repo-info">
                                <div class="repo-name">${repo.name}</div>
                                <div class="repo-stats">
                                    <span><i class="fas fa-star" style="color:#e3b341;"></i> ${repo.stargazers_count}</span>
                                    <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                                </div>
                            </div>
                            <i class="fas fa-external-link-alt" style="color: var(--text-secondary); font-size: 0.9rem;"></i>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    const cardHTML = `
        <div class="card">
            <div class="profile-header">
                <img src="${user.avatar_url}" alt="${name}" class="avatar">
                <div class="profile-info">
                    <div class="profile-info-top">
                        <div>
                            <h2>${name}</h2>
                            <a href="${user.html_url}" target="_blank" class="username">@${user.login}</a>
                        </div>
                        <div class="joined">Joined ${joinedDate}</div>
                    </div>
                    ${location}
                    <p class="bio">${bio}</p>
                </div>
            </div>
            
            <div class="stats">
                <div class="stat">
                    <span class="stat-label">Repos</span>
                    <span class="stat-value">${user.public_repos}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Followers</span>
                    <span class="stat-value">${user.followers}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Following</span>
                    <span class="stat-value">${user.following}</span>
                </div>
            </div>

            ${reposHTML}
        </div>
    `;

    mainContainer.innerHTML = cardHTML;
}

// Event Listeners
searchButton.addEventListener('click', () => {
    const user = searchInput.value.trim();
    if (user) {
        getUser(user);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const user = searchInput.value.trim();
        if (user) {
            getUser(user);
        }
    }
});

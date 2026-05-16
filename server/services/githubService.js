const axios = require('axios');

const searchUserRepos = async (username, keyword) => {
  try {
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: `${keyword} in:readme user:${username}`,
        sort: 'updated',
        order: 'desc',
        per_page: 30,
      },
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'ConnectICT-App',
      },
    });

    return response.data.items.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || '',
      url: repo.html_url,
      homepage: repo.homepage || '',
      language: repo.language || 'Unknown',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      topics: repo.topics || [],
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
    }));
  } catch (error) {
    console.error('GitHub API Error:', error.response?.data?.message || error.message);
    return [];
  }
};

const getUserProfile = async (username) => {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'ConnectICT-App',
      },
    });

    return {
      login: response.data.login,
      name: response.data.name,
      avatar: response.data.avatar_url,
      bio: response.data.bio,
      publicRepos: response.data.public_repos,
      followers: response.data.followers,
      following: response.data.following,
    };
  } catch (error) {
    console.error('GitHub Profile Error:', error.message);
    return null;
  }
};

const getRepoReadme = async (owner, repo) => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
        'User-Agent': 'ConnectICT-App',
      },
    });
    return response.data;
  } catch (error) {
    console.error('GitHub README Error:', error.message);
    return null;
  }
};

module.exports = { searchUserRepos, getUserProfile, getRepoReadme };

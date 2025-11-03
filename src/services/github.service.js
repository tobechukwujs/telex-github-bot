// src/services/github.service.js
const axios = require('axios');

// --- GitHub Configuration ---
const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

// --- Axios instance for GitHub API ---
const githubApi = axios.create({
  baseURL: GITHUB_API_URL,
  headers: {
    'Authorization': `token ${GITHUB_PAT}`,
    'Accept': 'application/vnd.github.v3+json'
  }
});

/**
 * Fetches the 5 most recent open issues from the repo.
 */
async function listOpenIssues() {
  try {
    const response = await githubApi.get('/issues', {
      params: {
        state: 'open',
        sort: 'created',
        direction: 'desc',
        per_page: 5
      }
    });

    const issues = response.data;
    if (issues.length === 0) {
      return `No open issues found in ${GITHUB_OWNER}/${GITHUB_REPO}.`;
    }

    let issueList = `Here are the 5 most recent open issues for ${GITHUB_OWNER}/${GITHUB_REPO}:\n\n`;
    issues.forEach(issue => {
      issueList += `* **#${issue.number}**: ${issue.title}\n    *Link:* ${issue.html_url}\n`;
    });
    return issueList;

  } catch (error) {
    console.error("Error fetching issues:", error.response ? error.response.data : error.message);
    throw new Error("Could not fetch issues from GitHub.");
  }
}

/**
 * Creates a new issue in the repo.
 * Command format: /@agent gh create "Issue Title" "Issue Body"
 */
async function createNewIssue(command) {
  // Simple regex to parse the command
  
  const regex = /\/@agent gh create \"(.*?)\" \"(.*?)\"/; 

  const match = command.match(regex);

  if (!match || !match[1] || !match[2]) {
    return "Invalid format. Please use: `/@agent gh create \"Title\" \"Body\"`";
  }

  const title = match[1];
  const body = match[2];

  try {
    const response = await githubApi.post('/issues', {
      title: title,
      body: body
    });

    const newIssue = response.data;
    return `✅ **Issue Created!**\n\n* **#${newIssue.number}**: ${newIssue.title}\n* *Link:* ${newIssue.html_url}`;

  } catch (error) {
    console.error("Error creating issue:", error.response ? error.response.data : error.message);
    throw new Error("Could not create the issue on GitHub.");
  }
}

module.exports = {
  listOpenIssues,
  createNewIssue
};


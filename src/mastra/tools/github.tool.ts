import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// --- Robust .env loading ---
// Load .env file from the project root, regardless of where this file is run from
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
// --- End robust .env loading ---

// --- Use variable names from your .env file ---
const GITHUB_PAT = process.env.GITHUB_TOKEN; // Changed from GITHUB_PAT
const GITHUB_OWNER = process.env.GITHUB_REPO_OWNER; // Changed from GITHUB_OWNER
const GITHUB_REPO = process.env.GITHUB_REPO_NAME; // Changed from GITHUB_REPO
// --- End variable name changes ---

const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

// Check for missing env variables
if (!GITHUB_PAT || !GITHUB_OWNER || !GITHUB_REPO) {
  console.error("Error: Missing GitHub environment variables!");
  // In a real app, you might throw an error, but for the server to start,
  // we'll log it. The first API call will fail.
} else {
  console.log(`[GitHub Tool] Configured to use repo: ${GITHUB_OWNER}/${GITHUB_REPO}`);
}

// Create a pre-configured Axios instance for GitHub API calls
const github = axios.create({
  baseURL: GITHUB_API_URL,
  headers: {
    'Authorization': `token ${GITHUB_PAT}`,
    'Accept': 'application/vnd.github.v3+json'
  }
});

/**
 * Fetches the 5 most recent open issues from the repo.
 */
export async function listIssues(): Promise<string> {
  try {
    const response = await github.get('/issues', {
      params: {
        state: 'open',
        sort: 'created',
        direction: 'desc',
        per_page: 5
      }
    });

    // We must cast the response data to an array of issues
    // We only care about title, number, and html_url
    const issues = response.data as { number: number, title: string, html_url: string }[];

    if (issues.length === 0) {
      return `No open issues found in ${GITHUB_OWNER}/${GITHUB_REPO}.`;
    }

    // --- Format the output ---
    // This is the fix for the raw JSON bug
    let issueList = `Here are the 5 most recent open issues for ${GITHUB_OWNER}/${GITHUB_REPO}:\n\n`;
    issues.forEach(issue => {
      issueList += `* **#${issue.number}**: ${issue.title}\n    *Link:* ${issue.html_url}\n`;
    });
    return issueList;
    // --- End formatting ---

  } catch (error: any) {
    console.error("Error fetching issues:", error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 401) {
      // Updated error message to use your variable name
      return "Error: Could not fetch issues. Check GITHUB_TOKEN (Bad credentials).";
    }
    return "Error: Could not fetch issues from GitHub.";
  }
}

/**
 * Creates a new issue in the repo.
 */
export async function createIssue(title: string, body: string): Promise<string> {
  try {
    const response = await github.post('/issues', {
      title: title,
      body: body
    });

    const newIssue = response.data;
    // Format a nice response
    return `✅ **Issue Created!**\n\n* **#${newIssue.number}**: ${newIssue.title}\n* *Link:* ${newIssue.html_url}`;

  } catch (error: any) {
    console.error("Error creating issue:", error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 401) {
      // Updated error message to use your variable name
      return "Error: Could not create issue. Check GITHUB_TOKEN (Bad credentials).";
    }
    return "Error: Could not create the issue on GitHub.";
  }
}


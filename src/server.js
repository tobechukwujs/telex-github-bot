
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`GitHub Bot server is running on http://localhost:${PORT}`);
  console.log(`Using repo: ${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`);
  if (!process.env.GITHUB_PAT) {
    console.warn("WARNING: GITHUB_PAT is not set. API calls will fail.");
  }
});

// src/mastra/index.js
// This is the main entrypoint Mastra is looking for.
// This file will now ALSO act as our local server for testing.

require('dotenv').config({ path: '../../.env' }); // Make sure it finds the .env file in the root
const { handleMessage } = require('./agents/github.agent.js');

// --- Mastra-required export ---
// Mastra will look for this to run the agent logic.
module.exports.agentHandler = handleMessage;


// --- Local Testing Server ---
// We add this so we can test our bot locally using 'npm run dev'.
// Mastra will ignore this part when it deploys.
if (process.env.NODE_ENV !== 'production') {
  const http = require('http');
  const PORT = process.env.PORT || 3000;

  const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/api/telex') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const { message, user } = JSON.parse(body);
          console.log(`Received message from ${user.name}: ${message.content}`);
          
          const responseText = await handleMessage(message.content);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: { content: responseText } }));
        } catch (e) {
          console.error("Error in server:", e);
          res.writeHead(500);
          res.end("Server Error");
        }
      });
    } else {
      res.writeHead(404);
      res.end("Not Found. POST to /api/telex");
    }
  });

  server.listen(PORT, () => {
    console.log(`GitHub Bot server (JS) is running on http://localhost:${PORT}`);
    console.log(`Using repo: ${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`);
  });
}


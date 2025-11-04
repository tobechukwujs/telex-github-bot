// src/mastra/index.ts
// This is the main entrypoint Mastra is looking for.

import * as dotenv from 'dotenv';
import * as path from 'path';

// Use path.resolve to find the .env file in the root
// __dirname is the current folder (dist/mastra)
// ../../ goes up two levels to the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); 

import { handleMessage } from './agents/github.agent';
import { workflowExample } from './workflows/github-workflow'; // <-- NEW IMPORT
import * as http from 'http';

// --- Mastra-required exports ---
export const agentHandler = handleMessage;
export const workflowHandler = workflowExample; // <-- NEW EXPORT


// --- Local Testing Server ---
// We add this so we can test our bot locally.
// Mastra will ignore this part when it deploys.
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;

  const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/api/telex') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          // Define types for the incoming request
          interface TelexUser { name: string; }
          interface TelexMessage { content: string; }
          interface TelexRequest { message: TelexMessage; user: TelexUser; }

          const { message, user } = JSON.parse(body) as TelexRequest;
          console.log(`Received message from ${user.name}: ${message.content}`);
          
          const responseText = await handleMessage(message.content);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: { content: responseText } }));
        } catch (e: any) {
          console.error("Error in server:", e.message);
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
    console.log(`GitHub Bot server (TS) is running on http://localhost:${PORT}`);
    console.log(`Using repo: ${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`);
  });
}
"use strict";
// src/mastra/index.ts
// This is the main entrypoint Mastra is looking for.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowHandler = exports.agentHandler = void 0;
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Use path.resolve to find the .env file in the root
// __dirname is the current folder (dist/mastra)
// ../../ goes up two levels to the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const github_agent_1 = require("./agents/github.agent");
const github_workflow_1 = require("./workflows/github-workflow"); // <-- NEW IMPORT
const http = __importStar(require("http"));
// --- Mastra-required exports ---
exports.agentHandler = github_agent_1.handleMessage;
exports.workflowHandler = github_workflow_1.workflowExample; // <-- NEW EXPORT
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
                    const { message, user } = JSON.parse(body);
                    console.log(`Received message from ${user.name}: ${message.content}`);
                    const responseText = await (0, github_agent_1.handleMessage)(message.content);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: { content: responseText } }));
                }
                catch (e) {
                    console.error("Error in server:", e.message);
                    res.writeHead(500);
                    res.end("Server Error");
                }
            });
        }
        else {
            res.writeHead(404);
            res.end("Not Found. POST to /api/telex");
        }
    });
    server.listen(PORT, () => {
        console.log(`GitHub Bot server (TS) is running on http://localhost:${PORT}`);
        console.log(`Using repo: ${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`);
    });
}

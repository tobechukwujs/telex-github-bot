// src/mastra/agents/github.agent.js
// This is our "agent" logic. It parses the command
// and calls the correct tool.

const { listOpenIssues, createNewIssue } = require('../tools/github.tool.js');

async function handleMessage(command) {
  const trimmedCommand = command.trim();
  let responseText;

  try {
    // --- Route "List Issues" ---
    if (trimmedCommand.startsWith('/@agent gh issues')) {
      responseText = await listOpenIssues();
    }
    // --- Route "Create Issue" ---
    else if (trimmedCommand.startsWith('/@agent gh create')) {
      const regex = /\/@agent gh create \"(.*?)\" \"(.*?)\"/;
      const match = trimmedCommand.match(regex);

      if (!match || !match[1] || !match[2]) {
        responseText = "Invalid format. Please use: `/@agent gh create \"Title\" \"Body\"`";
      } else {
        const title = match[1];
        const body = match[2];
        responseText = await createNewIssue(title, body);
      }
    }
    // --- Fallback ---
    else {
      responseText = "Sorry, I don't understand that command. Try `/@agent gh issues` or `/@agent gh create \"Title\" \"Body\"`";
    }
  } catch (error) {
    console.error("Error processing command:", error.message);
    responseText = `An error occurred: ${error.message}`;
  }

  return responseText;
}

module.exports = { handleMessage };


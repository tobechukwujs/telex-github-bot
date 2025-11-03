
const githubService = require('../services/github.service');

/**
 * Main webhook handler for all incoming Telex messages.
 */
async function handleTelexWebhook(req, res) {
  const { message, user } = req.body;
  if (!message || !message.content || !user) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  console.log(`Received message from ${user.name}: ${message.content}`);

  const command = message.content.trim();
  let responseText;

  try {
    if (command.startsWith('/@agent gh issues')) {
      responseText = await githubService.listOpenIssues();
      
    } else if (command.startsWith('/@agent gh create')) {
      responseText = await githubService.createNewIssue(command);

    } else {
      responseText = "Sorry, I don't understand that command. Try `/@agent gh issues` or `/@agent gh create \"Title\" \"Body\"`";
    }

  } catch (error) {
    console.error("Error processing command:", error.message);
    responseText = `An error occurred: ${error.message}`;
  }
  
  res.json({
    message: {
      content: responseText
    }
  });
}

module.exports = {
  handleTelexWebhook
};

import { createIssue, listIssues } from '../tools/github.tool';

// This is our "agent" logic. It parses the command
// and calls the correct tool.

export async function handleMessage(command: string): Promise<string> {
  const trimmedCommand = command.trim();
  let responseText: string;

  try {
    if (trimmedCommand === '/@agent gh issues') {
      // --- Handle "List Issues" ---
      responseText = await listIssues();

    } else if (trimmedCommand.startsWith('/@agent gh create')) {
      // --- Handle "Create Issue" ---

      // --- This is the new, more robust regex ---
      // It looks for /@agent gh create "anything in quotes" "anything else in quotes"
      const regex = /\/@agent gh create \"(.*?)\" \"(.*?)\"/;
      const match = trimmedCommand.match(regex);
      // --- End regex fix ---

      if (!match || !match[1] || !match[2]) {
        // If the regex fails, return the help text
        return "Invalid format. Please use: `/@agent gh create \"Title\" \"Body\"`";
      }
      
      const title = match[1];
      const body = match[2];
      
      responseText = await createIssue(title, body);

    } else {
      // --- Handle Unknown Command ---
      responseText = "Sorry, I don't understand that command. Try `/@agent gh issues` or `/@agent gh create \"Title\" \"Body\"`";
    }

  } catch (error: any) {
    console.error("Agent Error:", error.message);
    responseText = `An error occurred while processing your request: ${error.message}`;
  }

  return responseText;
}



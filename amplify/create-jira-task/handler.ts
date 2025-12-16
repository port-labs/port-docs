import type { Handler } from "aws-lambda";

/**
 * Lambda handler function to create JIRA tasks from Kapa feedback
 * 
 * This function receives downvote feedback from Kapa and creates a JIRA task.
 * 
 * Environment variables (set in Amplify Console):
 * - JIRA_URL: Your JIRA instance URL (e.g., https://your-domain.atlassian.net)
 * - JIRA_EMAIL: Your JIRA account email
 * - JIRA_API_TOKEN: Your JIRA API token
 * - JIRA_PROJECT_KEY: The JIRA project key (e.g., "PROJ")
 * - JIRA_ISSUE_TYPE: The issue type (e.g., "Task", "Bug", "Story")
 */

interface KapaFeedbackEvent {
  reaction: string;
  comment?: {
    issue?: string;
    irrelevant?: boolean;
    incorrect?: boolean;
    unaddressed?: boolean;
  };
  threadId?: string;
  questionAnswerId: string;
  question: string;
  answer: string;
  conversation?: Array<{
    questionAnswerId: string;
    question: string;
    answer: string;
  }>;
}

export const handler: Handler = async (event) => {
  // CORS headers for browser requests
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // In production, replace * with your domain
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight OPTIONS request
  if (
    event.requestContext?.http?.method === "OPTIONS" ||
    event.httpMethod === "OPTIONS"
  ) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "OK" }),
    };
  }

  try {
    // Parse the request body
    const body: KapaFeedbackEvent =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    // Validate required fields
    if (!body.reaction || body.reaction !== "downvote") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Invalid request. Expected downvote reaction.",
        }),
      };
    }

    // Get environment variables
    const jiraUrl = process.env.JIRA_URL;
    const jiraEmail = process.env.JIRA_EMAIL;
    const jiraApiToken = process.env.JIRA_API_TOKEN;
    const jiraProjectKey = process.env.JIRA_PROJECT_KEY || "PROJ";
    const jiraIssueType = process.env.JIRA_ISSUE_TYPE || "Task";

    // Validate environment variables
    if (!jiraUrl || !jiraEmail || !jiraApiToken) {
      console.error("Missing required environment variables");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "Server configuration error. Missing JIRA credentials.",
        }),
      };
    }

    // Build the JIRA issue
    const summary = `Kapa AI Answer Downvoted: ${body.question.substring(0, 100)}${
      body.question.length > 100 ? "..." : ""
    }`;

    let description = `A user downvoted a Kapa AI answer.\n\n`;
    description += `*Question:* ${body.question}\n\n`;
    description += `*Answer:* ${body.answer}\n\n`;

    if (body.comment) {
      description += `*User Feedback:*\n`;
      if (body.comment.issue) {
        description += `- Issue: ${body.comment.issue}\n`;
      }
      if (body.comment.irrelevant) description += `- Marked as irrelevant\n`;
      if (body.comment.incorrect) description += `- Marked as incorrect\n`;
      if (body.comment.unaddressed) description += `- Marked as unaddressed\n`;
      description += `\n`;
    }

    description += `*Metadata:*\n`;
    description += `- Thread ID: ${body.threadId || "N/A"}\n`;
    description += `- Question Answer ID: ${body.questionAnswerId}\n`;

    if (body.conversation && body.conversation.length > 0) {
      description += `\n*Conversation History:*\n`;
      body.conversation.forEach((msg, idx) => {
        description += `${idx + 1}. Q: ${msg.question}\n   A: ${msg.answer.substring(0, 200)}${
          msg.answer.length > 200 ? "..." : ""
        }\n\n`;
      });
    }

    // Create JIRA issue using REST API v3
    const jiraIssue = {
      fields: {
        project: {
          key: jiraProjectKey,
        },
        summary: summary,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: description,
                },
              ],
            },
          ],
        },
        issuetype: {
          name: jiraIssueType,
        },
      },
    };

    // Make request to JIRA API
    const jiraApiUrl = `${jiraUrl}/rest/api/3/issue`;
    const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString("base64");

    const response = await fetch(jiraApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(jiraIssue),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `JIRA API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        jiraIssue: result,
        message: "JIRA task created successfully",
      }),
    };
  } catch (error) {
    console.error("Error creating JIRA task:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to create JIRA task",
        message: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};


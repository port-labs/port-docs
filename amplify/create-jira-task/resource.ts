import { defineFunction } from "@aws-amplify/backend";

/**
 * Lambda function to create JIRA tasks from Kapa feedback
 * 
 * Environment variables should be set in Amplify Console:
 * - Go to Functions → create-jira-task → Configuration → Environment variables
 * - Add: JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY, JIRA_ISSUE_TYPE
 */
export const createJiraTask = defineFunction({
  name: "create-jira-task",
  entry: "./handler.ts",
  // Environment variables are set in Amplify Console, not here
  // This keeps your credentials secure!
});


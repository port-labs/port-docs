import { defineBackend } from "@aws-amplify/backend";
import { createJiraTask } from "./create-jira-task/resource";

/**
 * Amplify Backend Configuration
 * 
 * This file defines your Amplify backend resources.
 * Add your function here so Amplify knows to deploy it.
 */
export const backend = defineBackend({
  createJiraTask,
});


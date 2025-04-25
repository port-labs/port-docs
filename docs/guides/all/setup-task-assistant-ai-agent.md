---
displayed_sidebar: null
description: Set up a Task Assistant AI agent to provide contextual information and insights to task assignees
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Set up the Task Assistant AI agent

## Overview

This guide will walk you through setting up a "Task Assistant" AI agent in Port.  
By the end of this guide, your developers will receive automated, contextual insights when they start working on tasks, including related issues, pull requests, and potential collaborators.

<img src="/img/ai-agents/AIAgentTaskAssistantExample.png" width="100%" border="1px" />

## Common use cases

- Automatically provide context when developers start working on tasks
- Identify related issues and pull requests
- Suggest potential collaborators based on task context
- Enable easy commenting on Jira issues through Port


## Prerequisites

This guide assumes you have:
- A Port account with the [AI agents feature enabled](/ai-agents/overview#access-to-the-feature)
- Appropriate permissions to create and configure AI agents
- [Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/) configured in your Port instance
- [GitHub integration](/build-your-software-catalog/sync-data-to-catalog/git/github/) configured in your Port instance

## Set up data model

To create an Task Assistant AI agent in Port, we'll need to configure the following components as described in our [Build an AI agent](/ai-agents/build-an-ai-agent) guide:
-  The data sources it will use to answer questions about tasks and their related issues and collaborators.
-  The agent configuration that defines its capabilities and conversation starters.
-  An automation to analyze the task and trigger the agent.
-  A self-service action to comment on the Jira issue.

### Configure data source access

For this guide, we will be using **Jira** as our primary data source to provide comprehensive task management capabilities. 
This integration will automatically create and configure all the necessary resources needed by the Task Assistant AI agent.

Install the following integration to have access to these data sources:
- [Port's Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/) for projects, tasks and issues.

    :::info Optional tools
    While this guide uses Jira, you can choose tools that best fit your organization's needs. 
    For example, GitHub or ServiceNow.
    :::

### Create the agent configuration

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page
2. Click on `+ AI Agent`
3. Toggle `Json mode` on
4. Copy and paste the following JSON schema:

   <details>
   <summary><b>Task Assistant AI agent configuration (Click to expand)</b></summary>

   ```json showLineNumbers
   {
     "identifier": "task_assistant_ai_agent",
     "title": "Task Assistant AI Agent",
     "icon": "Airflow",
     "properties": {
       "status": "active",
       "allowed_blueprints": [
         "service",
         "githubRepository",
         "_user",
         "githubPullRequest",
         "jiraIssue",
         "jiraProject",
         "githubUser",
         "_team",
         "jiraUser"
       ],
       "allowed_actions": [
         "comment_on_jira_issue"
       ],
       "executionMode": "Automatic",
       "prompt": "A user has just started working on a task. Please greet them using their first name. Then send them a list of other other tasks that might be related to the topic of the task and the users assigned to them, and a list of other pull requests that could be related to the topic of the task and the users that created them. Note that this is an automatic process, that was not initiated by the user. \n\nThe format for the message is:\n\nHey there (Enter user's name here), it's Clarity :crystal_ball: - The Port AI agent!\nI noticed you just started working on a new task- (assigned issue here, which is a link to the port issue)\nHere's some context to help you get started :blobdance:\n\n:male-technologist: Devs who I think will have some input here\n    (put a list of at most 3 items, ordered by relevance and add the assigned person and explain why you chose it- Don't use the user which you send the message to. The list can contain less than 3 items, but if empty leave a meaningful explaination)\n\n:jira:  Similar Jira Issues\n    (put a list of at most 3 items, ordered by relevance and add the assigned person and explain why you chose it- Don't use issues im assigned to. The list can contain less than 3 items, but if empty leave a meaningful explaination)\n\n:github_on_fire:  Similar Pull Requests\n    (put a list of at most 3 items, ordered by relevance and add the assigned person and explain why you chose it- don't put pull requests im assigned to. The list can contain less than 3 items, but if empty leave a meaningful explaination)",
       "allowed_tools": [
         "Entities Search",
         "Entities Similarity Search",
         "Entities Group"
       ]
     },
     "relations": {}
   }
   ```
   </details>

5. Click on `Create` to save the agent

### Set up the automation trigger

Now that we have created the Task Assistant AI agent, we need to set up an automation that will be triggered automatically whenever a task is assigned or the status is changed to "In Progress".

Follow the steps below to set up the automation:

1. Go to the [Automations](https://app.getport.io/automations) page
2. Click on `+ Automation`
3. Copy and paste the following JSON schema:

   <details>
   <summary><b>Send context to task assignee automation (Click to expand)</b></summary>

   ```json showLineNumbers
   {
     "identifier": "send_context_to_task_assignee",
     "title": "Send context to task assignee",
     "description": "Triggers on Jira task status change to In Progress or assignee",
     "trigger": {
       "type": "automation",
       "event": {
         "type": "ENTITY_UPDATED",
         "blueprintIdentifier": "jiraIssue"
       },
       "condition": {
         "type": "JQ",
         "expressions": [
           ".diff.after.relations.assignee != null",
           ".diff.after.properties.status == \"In Progress\"",
           ".diff.before.properties.status == \"To Do\" or .diff.before.relations.assignee != .diff.after.relations.assignee"
         ],
         "combinator": "and"
       }
     },
     "invocationMethod": {
       "type": "WEBHOOK",
       "url": "https://api.getport.io/v1/agent/task_assistant_ai_agent/invoke",
       "synchronized": true,
       "body": {
         "prompt": "The user's email is \"{{.event.diff.after.relations.assignee}}\" and the task's title is \"{{.event.diff.after.title}}\".",
         "labels": {
           "source": "Automation"
         }
       }
     },
     "publish": true
   }
   ```
   </details>

4. Click on `Create` to save the automation

### Configure the self-service action

We need to configure a self-service action which can be triggered by the agent or manually by the user to comment on issues directly from Port.

1. Go to the [Self Service Actions](https://app.getport.io/self-service) page
2. Click on `+ Action`
3. Copy and paste the following JSON schema:

   <details>
   <summary><b>Comment on Jira issue action (Click to expand)</b></summary>

   ```json showLineNumbers
   {
     "identifier": "comment_on_jira_issue",
     "title": "Comment on a Jira issue",
     "icon": "Jira",
     "description": "Comments on an existing Jira issue",
     "trigger": {
       "type": "self-service",
       "operation": "DAY-2",
       "userInputs": {
         "properties": {
           "assignee": {
             "title": "Assignee",
             "icon": "DefaultProperty",
             "type": "string",
             "blueprint": "_user",
             "format": "entity",
             "dataset": {
               "combinator": "and",
               "rules": [
                 {
                   "property": "jira_user_id",
                   "operator": "isNotEmpty"
                 }
               ]
             }
           },
           "comment": {
             "title": "Comment",
             "icon": "DefaultProperty",
             "type": "string",
             "format": "markdown"
           }
         },
         "required": [],
         "order": [
           "comment",
           "assignee"
         ]
       },
       "blueprintIdentifier": "jiraIssue"
     },
     "invocationMethod": {
       "type": "WEBHOOK",
       "url": "https://api.atlassian.com/ex/jira/1a2bd5d3-0dad-4011-9b5b-2098904ca3c3/rest/api/3/issue/{{ .entity.identifier }}/comment",
       "agent": false,
       "synchronized": true,
       "method": "POST",
       "headers": {
         "Authorization": "Bearer {{ .secrets.__JIRA_JIRA_ATLASSIAN_USER_TOKEN }}",
         "Content-Type": "application/json"
       },
       "body": {
         "body": {
           "content": [
             {
               "content": [
                 {
                   "text": "{{ .inputs.comment }}",
                   "type": "text"
                 }
               ],
               "type": "paragraph"
             }
           ],
           "type": "doc",
           "version": 1
         },
         "visibility": {
           "identifier": "Administrators",
           "type": "role",
           "value": "Administrators"
         }
       }
     },
     "requiredApproval": false
   }
   ```
   </details>

4. Click on `Create` to save the action



## Best practices

To get the most out of your Task Assistant agent:

1. **Maintain integrations**: Keep your Jira and GitHub integrations up to date.

2. **Monitor responses**: Review the agent's messages to ensure they provide valuable context.

3. **Refine the prompt**: Adjust the agent's prompt based on your team's needs and feedback.

4. **Test thoroughly**: Create test issues to verify both automated messages and manual comments work as expected.

## Possible enhancements

You can further enhance the Task Assistant setup by:

- **Integration expansion**: Add more data sources like Confluence or ServiceNow for broader context.

- **Custom triggers**: Configure additional automation triggers based on other task events.


- **Enhanced context**: Modify the prompt to include more specific information like deployment status or test coverage.

- **Team customization**: Adjust the message format and content based on team preferences. 
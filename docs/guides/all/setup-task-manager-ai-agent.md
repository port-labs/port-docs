---
displayed_sidebar: null
description: Set up a Task Manager AI agent to help developers track and manage tasks efficiently
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Set up the Task Manager AI agent

## Overview

This guide will walk you through setting up a "Task Manager" AI agent in Port.  
By the end of this guide, your developers will be able to get information about their tasks via Port's AI chat.

<img src="/img/ai-agents/AIAgentTaskMangerAgentPage.png" width="100%" border="1px" />

## Common use cases

- Get a quick overview of assigned tasks and their priorities.
- Monitor pull requests waiting for review.
- Track task progress and status updates.

## Prerequisites

This guide assumes you have:
- A Port account with the [AI agents feature enabled](/ai-agents/overview#access-to-the-feature).
- Appropriate permissions to create and configure AI agents.

## Set up data model

To create a Task Manager AI agent in Port, we'll need to configure two main components as described in our [Build an AI agent](/ai-agents/build-an-ai-agent) guide:
-  The data sources it will use to answer questions about tasks and pull requests.
-  The agent configuration that defines its capabilities and conversation starters.


### Configure data source access

For this guide, we will be using **GitHub** and **Jira** as our data sources to provide comprehensive task management capabilities. 
These integrations will automatically create and configure all the necessary resources needed by the Task Manager AI agent.

Install the following integrations to have access to these data sources:
- [Port's GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/) for pull requests and code changes.
- [Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/) for task and issue tracking.

:::info Optional tools
While this guide uses GitHub and Jira, you can choose tools that best fit your organization's needs. 
For example:
- GitLab or Azure DevOps instead of GitHub.
- Opsgenie instead of PagerDuty.
:::


### Create the agent configuration

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Toggle `Json mode` on.
4. Copy and paste the following JSON schema:

   <details>
   <summary><b>Task Manager agent configuration (Click to expand)</b></summary>

   ```json
   {
     "identifier": "task_manager",
     "title": "Task Manager",
     "icon": "Details",
     "properties": {
       "description": "Task Manager responsible for answering questions about Jira issues, repositories (including READMEs), pull requests, services, and teams.",
       "status": "active",
       "allowed_blueprints": [
         "jiraIssue",
         "jiraProject",
         "jiraUser",
         "githubTeam",
         "githubPullRequest",
         "githubRepository",
         "githubUser",
         "_team",
         "_user",
         "service"
       ],
       "prompt":"You are an agent responsible for answering questions about Jira issues, Pull Requests, Repositories, and teams.\n### Guidelines \n - Provide clear information about active issues (can be also referred as open issues ) with statuses: To Do and In Progress \n - Provide clear information about completed issues (can be also referred as close issues ) with statuses: Closed and Done \n - Identify pull requests that require attention (open pull requests)  \n - Provide clear information about repositories like their related service, README, team (in case \"owning team\" is empty, provide the \"Team\" related to the \"gitHub Teams\" property), last contributer, etc. \n - Identify connections between repositories, pull requests and issues to services",
       "execution_mode": "Approval Required",
       "allowed_actions": [ "_createJiraIssue" ],
       "conversation_starters": [
         "Which tasks are assigned to me",
         "How many tasks are currently in progress",
         "Which PRs should I review?"
       ]
     }
   }
   ```
   </details>

5. Click on `Create` to save the agent.


## Interact with the Task Manager

You can interact with the task manager AI agent in [several ways](/ai-agents/interact-with-ai-agents).  
This guide will demonstrate the two main ways.

<Tabs groupId="interaction-methods" queryString>
<TabItem value="ui" label="Port UI">

The Task Manager AI agent can be accessed through an **AI Agent widget** in your Port dashboard.   
Follow the step below to set it up:

1. Go to the [homepage](https://app.getport.io/organization/home) of your portal

2. Click on `+ Widget`.

3. Choose `AI agent`.

4. Type **Task Manager** for `Title`.

5. Select **Task Manager** from the `Agent` dropdown.
   
   <img src="/img/ai-agents/AIAgentsTaskManagerWidget.png" width="60%" border="1px" />

6. Click on `Save`.

Once the widget is set up, you can:

- Use the conversation starter buttons to quickly check:
  - Your assigned tasks.
  - Work in progress.
  - Pull requests needing review.

- Type custom questions in the chat field about:
  - Tasks and tickets.
  - Pull requests.

- Engage in natural follow-up conversations to explore specific topics.

<img src="/img/ai-agents/AIAgentTaskManagerDashboard.png" width="100%" border="1px" />

</TabItem>
<TabItem value="slack" label="Slack Integration">

The Slack integration provides a natural way to interact with the Task Manager agent. Before using this method, ensure you have installed and configured the **[Port AI Assistant Slack App](/ai-agents/slack-app)**

You can interact with the Task Manager agent in two ways:
1. **Direct message** the Port AI Assistant.
2. **Mention** the app in any channel it's invited to.

When you send a message, the app will:
1. Open a thread.
2. Respond with the agent's answer.

Example queries:
```markdown
@Port task-manager What tasks are assigned to me?
@Port Show me all PRs waiting for my review
@Port How many tasks are currently in progress?
```

:::tip Including the agent name
While including "task-manager" in your message can help when you have multiple agents, it's not mandatory.   
The Slack app is smart enough to route your request to the appropriate agent based on the context.
:::

<img src="/img/ai-agents/AIAgentTaskManagerSlack.png" width="100%" border="1px" />


</TabItem>
</Tabs>

## Example questions

Here are some questions you can ask the Task Manager agent:

- "Which of Jane Doe's pull requests need attention?".
- "Who are the code owners for the billing service repository?".
- "Which repository contains the code for the PaymentProcessor service?".
- "How many issues were closed by the frontend team in March 2025?".
- "What are the unresolved issues in my current sprint?".
- "Please open a Jira task to add a new payment method".

## Best practices

To get the most out of your Task Manager agent:

1. **Try it out**: Start with simple queries and see how the agent responds.
2. **Add context**: If the response isn't what you expected, try asking again with more details.
3. **Troubleshoot**: If you're still not getting the right answers, check our [troubleshooting guide](/ai-agents/interact-with-ai-agents#troubleshooting--faq) for common issues and solutions.

## Possible enhancements

You can further enhance the Task Manager setup by:
- **Integration expansion**: [Add more data sources](/ai-agents/build-an-ai-agent#step-2-configure-data-access) like GitLab or Azure DevOps.
- **Automated notifications**: [Configure the agent](/ai-agents/interact-with-ai-agents#actions-and-automations) to proactively notify about important updates.
- **Custom conversation starters**: Add organization-specific queries to the [conversation starters](/ai-agents/build-an-ai-agent#step-5-add-conversation-starters).
- **Monitor and improve**: [Check how your developers are interacting](/ai-agents/interact-with-ai-agents#ai-interaction-details) with the agent and improve it according to feedback.

---
displayed_sidebar: null
description: Set up a Task Manager AI agent to help developers track and manage tasks efficiently
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Set up a Task Manager AI agent

## Overview

This guide will walk you through setting up a Task Manager AI agent in Port.


## Common use cases

- Get a quick overview of assigned tasks and their priorities
- Track ongoing incidents and their status
- Monitor pull requests waiting for review
- Stay informed about on-call schedules and team responsibilities

## Prerequisites

This guide assumes you have:
- A Port account with AI agents feature enabled
- Appropriate permissions to create and configure AI agents


## Set up data model

To create a Task Manager AI agent in Port, we'll need to configure two main components:
-  The agent configuration that defines its capabilities and conversation starters
-  The data sources it will use to answer questions about tasks, incidents, and pull requests

### Create the agent configuration

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal
2. Click on `+ AI Agent`
3. Toggle `Json mode` on
4. Copy and paste the following JSON schema:

   <details>
   <summary><b>Task Manager agent configuration (Click to expand)</b></summary>

   ```json
   {
     "identifier": "task_manager",
     "title": "Task Manager",
     "icon": "Details",
     "properties": {
       "description": "Helps developers manage their ongoing tasks",
       "status": "active",
       "allowed_blueprints": [
         "pagerdutyService",
         "service",
         "_user",
         "jiraIssue",
         "pagerdutyIncident",
         "githubPullRequest",
         "_team",
         "pagerdutyOncall"
       ],
       "prompt": "You are an expert in managing tasks and helping developers remain in flow state. You can answer questions around priorities, tasks, bugs and incidents.",
       "execution_mode": "Approval Required",
       "conversation_starters": [
         "Which tasks are assigned to me",
         "How many tasks are currently in progress",
         "When was the last incident"
       ]
     }
   }
   ```
   </details>

5. Click on `Create` to save the agent

### Configure data source access

For this guide, we will be using **GitHub**, **Jira**, and **PagerDuty** as our data sources to provide comprehensive task management capabilities. These integrations will automatically create and configure all the necessary resources needed by the Task Manager AI agent.

Install the following integrations to have use these data sources:
- [Port's GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/) for pull requests and code changes
- [Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/) for task and issue tracking
- [PagerDuty integration](/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty/) for incident management

## Interact with the Task Manager

You can interact with the task manager AI agent in several ways.  
But in this guide we will demonstrate two ways to interact with the agent.

<Tabs groupId="interaction-methods" queryString>
<TabItem value="ui" label="Port UI">

The Task Manager AI agent can be accessed through an **AI Agent widget** in your Port dashboard.   
Follow the step below to set it up:

1. Go to the [homepage](https://app.getport.io/organization/home) of your portal

2. Click on `+ Widget`

3. Choose `AI agent`

4. Type **Task Manager** for `Title`

5. Select **Task Manager** from the `Agent` dropdown
   
   <img src="/img/ai-agents/AIAgentsTaskManagerWidget.png" width="60%" border="1px" />

6. Click on `Save` 

Once the widget is set up, you can:

- Use the conversation starter buttons to quickly check:
  - Your assigned tasks
  - Work in progress
  - Recent incidents

- Type custom questions in the chat field about:
  - Tasks and tickets
  - Incidents
  - Pull requests

- Engage in natural follow-up conversations to explore specific topics

<img src="/img/ai-agents/AIAgentTaskManagerDashboard.png" width="100%" border="1px" />

</TabItem>
<TabItem value="slack" label="Slack Integration">

The Slack integration provides a natural way to interact with the Task Manager agent. Before using this method, ensure you have installed and configured the **Port AI Assistant Slack App**

You can interact with the Task Manager agent in two ways:
1. **Direct message** the Port AI Assistant
2. **Mention** the app in any channel it's invited to

When you send a message, the app will:
1. Open a thread
2. Respond with the agent's answer

Example queries:
```markdown
@Port task-manager What tasks are assigned to me?
@Port task-manager How many critical incidents occurred this week?
@Port task-manager Show me all PRs waiting for my review
```

:::tip  Effective Slack interactions
- Always include "task-manager" in your message to target this specific agent
- Send follow-up messages in the same thread and mention the app again
- Keep conversations focused on task-related topics
- Limit threads to five consecutive messages for optimal performance
- Start new threads for new topics or questions
:::


</TabItem>
</Tabs>

## Best practices

To get the most out of your Task Manager agent:

1. **Be specific in your queries**: Instead of asking "what are my tasks?", try "what are my high-priority Jira tickets?"
2. **Use context**: Include relevant information like time periods or specific services
3. **Follow up**: Use threaded conversations to drill down into specific details
4. **Combine sources**: Ask questions that combine information from different systems

## Possible enhancements

You can further enhance the Task Manager setup by:
- **Custom metrics**: Add widgets showing task completion rates and average resolution times
- **Team views**: Create team-specific dashboards with filtered task views
- **Integration expansion**: Add more data sources like GitLab or Azure DevOps
- **Automated notifications**: Configure the agent to proactively notify about important updates
- **Custom conversation starters**: Add organization-specific queries to the conversation starters 
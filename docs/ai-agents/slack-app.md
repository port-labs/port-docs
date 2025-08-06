# Slack application

Port's Slack app brings your developer portal experience into your team's daily communication flow — allowing you to interact with Port directly from Slack and receive real-time notifications from Port right where your team collaborates.

## Use-cases

### Manage notifications

The Slack app allows you to send messages to any Slack channel directly from Port, without the need to create a separate webhook for each channel.  

This can be used to communicate important notifications to people in your organization, such as:

- A new PagerDuty incident has been created.
- A new GitHub issue has been created.
- A GitLab merge request has been merged.

### Interact with AI agents

Another powerful use-case of the Slack app is to interact with the AI agents in your portal directly from Slack.

This can be used to get quick answers to questions about your resources, such as:

- Which services had an incident in the last 30 days?
- How many open Jira tickets are there for the service 'x'?
- What is the status of the deployment 'y'?

## Prerequisites

- A Port account with **admin** permissions.

- To install the Slack app, you will first need to apply for access to Port's AI program by filling out [this form](https://forms.gle/krhMY7c9JM8MyJJf7).

- To interact with AI agents, you need to have at least one agent deployed in your portal.  
  See the [Build an AI agent](https://docs.port.dev/ai-agents/build-an-ai-agent) page to learn more.

## Installation

To install the Slack app, follow these steps:

- Navigate to the [Slack app installation page](https://app.port.io/settings/slack-app). This page will be accessible only after being approved for the AI program (see prerequisites above).

- Click on the "Add to Slack" button.

- Select the workspace where you'd like to install the app, then click "Allow".

- Once installed, you will receive a Slack message from Port's bot with a summary of the app's capabilities:

    <img src='/img/ai-agents/SlackAppInstallMessage.png' width='80%'/>

## Send notifications from Port

### Slack app bot token

Once the app is installed into the Slack workspace, a new system secret will be created in your Port organization named `__SLACK_APP_BOT_TOKEN_T<team_id>`, where `<team_id>` is the ID of the Slack workspace.  
You can copy it and use it in actions & automations to send messages to a specific Slack channel.

:::tip System secrets
To view your system secrets, click on the `...` button in the top right corner of your Port application, select `Credentials` and then click on the `Secrets` tab.
:::

### Usage example

The following snippet defines an automation that sends a Slack message to a specific channel when a new PagerDuty incident is created in Port, using the Slack app's bot token:

```json
{
  "identifier": "pagerduty_incident_to_slack",
  "title": "PagerDuty incident to slack",
  "icon": "pagerduty",
  "description": "Sends a Slack message on new incident",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_CREATED",
      "blueprintIdentifier": "pagerdutyIncident"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://slack.com/api/chat.postMessage",
    "synchronized": true,
    "method": "POST",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Bearer {{ .secrets.\"__SLACK_APP_BOT_TOKEN_T123\" }}"
    },
    "body": {
      "blocks": [
        {
          "type": "markdown",
          "text": "There is a new incident!\nTitle: {{ .event.diff.after.title }}\nOwner: {{ .event.diff.after.properties.assignees }}"
        }
      ],
      "channel": "C06BUh123"
    }
  },
  "publish": true
}
```

### Customize messages

You can customize messages with blocks following the [Slack formatting guidelines](https://slack.com/help/articles/202288908-Format-your-messages). 

<!-- You can also insert the Slack channel dynamically:

- Save the Slack channel ID for services/teams.
- Mirror it into the _user blueprint.
- Reference it in the automation

[[need to add example and see it works]]

You can also set under which name & icon the message will be sent (add example) -->

## Interact with Port from Slack

### New user authentication flow

When a new team member first tries to use the Slack app, a private message with a "Connect to Port" button will be sent to them:

<img src='/img/ai-agents/SlackAppNewUserMessage.png' width='60%'/>
<br/><br/>

Once the user is authenticated, they can:

- Mention `@Port` in any channel it's invited to.
- Start interacting with Port directly from Slack.

### Slash commands

The Slack app responds to the `/port` slash command with these options:

- `/port` (or `/port help`) - Shows general help and available actions.
- `/port agents` - Lists all Port AI agents in your organization.

To ask the app a question, simply mention `@Port` and ask away, for example:

```text
@Port is there an active incident for the service 'x'?
```

### Use the Slack AI assistant interface

On paid Slack workspaces, you can also interact with Port through Slack's AI assistant interface, which provides enhanced features:

1. Chat history for previous interactions with Port is available when using direct messages with the app.
   <img src='/img/ai-agents/SlackAppAgentChat.png' alt='Slack app chat history with Port' width='80%'/>

2. You can start a new conversation easily using the "New Chat" button in the top-right corner.

3. For quicker access, add Port to your Slack top bar by clicking the three dots menu and selecting "Add assistant to top bar".
   <img src='/img/ai-agents/SlackAppAddTopBar.png' alt='Adding Port to Slack top bar' width='80%'/>

4. Once added, you can access Port from anywhere in Slack through a side panel, without leaving your current conversation.
   <img src='/img/ai-agents/SlackAppAgentInteraction.png' alt='Interacting with Port through Slack side panel' width='60%'/>

This provides a more seamless way to interact with your Port AI agents while working in Slack.

## Advanced configuration

### Renaming the Slack Bot

You can rename the Port Slack bot in your workspace. This can be useful if you want the bot to have a name that is more recognizable to your organization, instead of the default "Port".

Follow these steps to rename the bot:

1.  In your Slack workspace, find the Port app. Right-click on it and select "View app details".
    <img src='/img/ai-agents/SlackAppViewAppDetails.png' alt='View Port App Details in Slack' width='60%'/>

2.  In the app details view, click on the "Configuration" tab. This will open a new page in your web browser. Scroll down to the "Bot User" section.
    <img src='/img/ai-agents/SlackAppEditBot.png' alt='Slack App Configuration Page - Bot User Section' width='80%'/>

3.  Click on the "Edit" button next to the bot user. In the modal that appears, enter the new desired name for your bot and click "Save Changes". The change will apply immediately.
    <img src='/img/ai-agents/SlackAppEditBotModal.png' alt='Edit Bot Name Modal in Slack' width='60%'/>


## Limitations

- The Slack app can only operate in channels it's invited to and in private DMs with the bot.

- Users must authenticate individually.

- You can install only one Slack app, related to one Port organization, in each Slack workspace.

- When sending a message from Port to Slack, up to 50 `blocks` can be used, and each `text` value can be up to 3000 characters long.
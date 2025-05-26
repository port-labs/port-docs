---
displayed_sidebar: null
title:  Automate Slack Alert for Overdue PRs
description: Set up automated Slack alerts for overdue PRs in Port, ensuring timely reviews and efficient project management.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"


#  Automate Slack Alert for Overdue PRs

This automation helps you set up a Slack notification for Pull Requests
(PRs) that have been open longer than a specified time.
While this guide uses 3 days as an example, you can customize the timeframe to suit your needs,
ensuring that your team stays on top of PRs and keeps the review process moving smoothly.

## Prerequisites

To use this automation, ensure you have:
- Installed Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).
- Configured a [Slack app](https://api.slack.com/apps) that can post messages to a Slack channel with the `chat:write` bot scope under OAuth & Permissions, or created a [Slack webhook](https://api.slack.com/messaging/webhooks) to send messages to Slack.


## Data Model Setup

For this guide, we will be using the same data model as in the [GitHub installation](/build-your-software-catalog/sync-data-to-catalog/git/github/#setup) and the [Resource mapping examples](/build-your-software-catalog/sync-data-to-catalog/git/github/examples/#map-repositories-and-pull-requests) guide.

### Update the `Service` blueprint

Add the `slackChannel` and `slackURL` properties, if they do not exist, with the schema below:

```json showLineNumbers
   "slackChannel": {
     "icon": "Slack",
     "type": "string",
     "title": "Slack Channel",
     "description": "The Slack channel name where notifications will be sent."
   },
   "slackURL": {
     "icon": "Slack",
     "type": "string",
     "title": "Slack Webhook URL",
     "format": "url",
     "description": "The Slack incoming webhook URL to send messages in channel."
   }
```

### Update the `Pull Request` Blueprint

1. Navigate to the `Pull Request` blueprint in your Port [Builder](https://app.getport.io/settings/data-model).
2. Hover over it, click on the `...` button on the right, and select `Edit JSON`.
3. Add the following properties:

   ```json
   "prOpenTimer": {
       "title": "Pr Open Timer",
       "type": "string",
       "format": "timer"
   },
   "isNotificationSent": {
       "title": "Notification Sent",
       "type": "boolean",
       "default": false
   }
   ```

   :::tip Explanation
   - **`prOpenTimer`**: This property is used to set a timer for how long a PR has been open. When this timer expires (after 3 days), a notification is triggered.
   - **`isNotificationSent`**: This property is a boolean flag that helps prevent multiple notifications for the same PR. Once a notification is sent, this property is set to `true`, ensuring that no further notifications are sent for that PR.
     :::

4. Add the mirror properties:

   ```json
   "mirrorProperties": {
       "serviceSlackChannel": {
         "title": "Service Slack Channel",
         "path": "service.slackChannel"
       },
       "serviceSlackUrl": {
         "title": "Service Slack Url",
         "path": "service.slackURL"
       }
   }
   ```

:::note Mirror Properties
Make sure to add the mirror properties.
These mirror properties allow the `Pull Request` blueprint
to access the Slack channel and webhook URL from the related `Service` blueprint.

To read more about mirror properties and understand their usage better, visit the [Port Documentation on Mirror Properties](https://docs.port.io/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/mirror-property).
:::


### Ingest GitHub PR Data
    - Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your GitHub integration:

      <img src='/img/guides/githubAppIntegration.png' border='1px' />

    - Under the `resources` key, add the following YAML block to map the pull request entities and click `Save & Resync`:

   <details>
     <summary>Configuration mapping (click to expand)</summary>

   ```yaml showLineNumbers
   resources:
     - kind: pull-request
       selector:
           query: "true"
       port:
           entity:
           mappings:
               identifier: ".head.repo.name + '-' + (.number|tostring)" # The Entity identifier will be the repository name + the pull request number
               title: ".title"
               blueprint: '"githubPullRequest"'
               properties:
                   creator: ".user.login"
                   assignees: "[.assignees[].login]"
                   reviewers: "[.requested_reviewers[].login]"
                   status: ".state"
                   closedAt: ".closed_at"
                   updatedAt: ".updated_at"
                   mergedAt: ".merged_at"
                   prNumber: ".id"
                   link: ".html_url"
                   prOpenTimer: "((.created_at | fromdateiso8601) + (3 * 24 * 60 * 60) | todateiso8601)" # For 1-minute timer, use ((.created_at | fromdateiso8601) + 60 | todateiso8601)
   ```

   </details>

:::tip Update property value
Set the webhook URL as the value for the `slack` property in the `Service` blueprint,
and ensure the Slack channel name is correctly set in the `slackChannel` property.
:::



## Automation Setup
This section will guide you
through setting up the automation that sends Slack notifications for PRs that have been open too long.

### Automation to send slack notification
By using the `TIMER_PROPERTY_EXPIRED` trigger type,
we can run custom logic whenever the `prOpenTimer` timer property expires on a `githubPullRequest` entity:

<details>
<summary>Automation for sending Slack notifications (click to expand)</summary>

```json showLineNumbers
{
   "identifier": "prOpenForMoreThan3Days",
   "title": "Notify Slack on PR Open for More Than 3 Days",
   "icon": "Slack",
   "description": "Sends a Slack message when a PR has been open for more than 3 Days.",
   "trigger": {
      "type": "automation",
      "event": {
         "type": "TIMER_PROPERTY_EXPIRED",
         "blueprintIdentifier": "githubPullRequest",
         "propertyIdentifier": "prOpenTimer"
      },
      "condition": {
         "type": "JQ",
         "expressions": [
            ".diff.after.properties.status == \"open\"",
            ".diff.after.properties.isNotificationSent == false"
         ],
         "combinator": "and"
      }
   },
   "invocationMethod": {
      "type": "WEBHOOK",
      "url": "{{ .event.diff.after.properties.serviceSlackUrl }}",
      "agent": false,
      "synchronized": true,
      "body": {
         "channel": "{{ .event.diff.after.properties.serviceSlackChannel }}",
         "text": "* <{{ .event.diff.after.properties.link }}| {{ .event.diff.after.title }} > has been open for more than 3 days *\n\n *Title:* {{ .event.diff.after.title }}\n\n *Link:* <{{ .event.diff.after.properties.link }}|View PR>\n\n *Creator:* {{ .event.diff.after.properties.creator }}\n\n *Assignees:* {{ .event.diff.after.properties.assignees }}\n\n *Reviewers:* {{ .event.diff.after.properties.reviewers }}\n\n"
      }
   },
   "publish": true
}
```

</details>

###  Automation to manage sent notifications
This automation marks the PR's `isNotificationSent` property as true after the notification is sent, ensuring that only one notification is sent per PR.

<details>
  <summary>Automation for marking notification as sent (click to expand)</summary>

```json showLineNumbers
{
   "identifier": "markNudgeSent",
   "title": "Mark Notification as Sent",
   "description": "Marks the PR's isNotificationSent property as true after the notification is sent.",
   "trigger": {
      "type": "automation",
      "event": {
         "type": "TIMER_PROPERTY_EXPIRED",
         "blueprintIdentifier": "githubPullRequest",
         "propertyIdentifier": "prOpenTimer"
      },
      "condition": {
         "type": "JQ",
         "expressions": [
            ".diff.after.properties.status == \"open\"",
            ".diff.after.properties.isNotificationSent == false"
         ],
         "combinator": "and"
      }
   },
   "invocationMethod": {
      "type": "UPSERT_ENTITY",
      "blueprintIdentifier": "githubPullRequest",
      "mapping": {
         "identifier": "{{ .event.context.entityIdentifier }}",
         "properties": {
            "isNotificationSent": true
         }
      }
   },
   "publish": true
}
```

</details>

##  Example slack message

Here’s an example of the Slack message you’ll receive when a PR has been open for more than 3 days:

<img src='/img/guides/overduePrSlackNotification.png' border='1px' />

By following these steps, you can effectively automate notifications for overdue PRs, ensuring timely reviews and merges.


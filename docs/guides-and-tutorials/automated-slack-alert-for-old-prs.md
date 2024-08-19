---
sidebar_position: 9
title:  Automated Slack Alert for Old PRs
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx" 


#  Automated Slack Alert for Old PRs

This automation helps you set up a Slack notification for Pull Requests
(PRs) that have been open longer than a specified time.
While this guide uses 3 days as an example, you can customize the timeframe to suit your needs,
ensuring that your team stays on top of PRs and keeps the review process moving smoothly.

## Prerequisites

To use this automation, ensure you have:
- Installed Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).
- Configure a [Slack app](https://api.slack.com/apps) that can post a message to a Slack channel. The app should have a `chat:write` bot scope under OAuth & Permissions.

## Integrate GitHub Resources with Port

The goal of this section is to fill the software catalog with data directly from your GitHub organization. Port's GitHub app allows you to import `repositories`, `pull requests`, `workflows`, `teams`, and other GitHub objects. For the purpose of this guide, we will focus on the pull requests (PR) object only. Follow the steps below to ingest your PR data to Port.

:::info Note
For the GitHub app installation, you will need to have a registered organization in Port, and your Port user role must be set to `Admin`.
:::

1. Install Port's GitHub app:
   Follow the [installation guide](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/github/installation).

2. Create the `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip> if it doesn't exist:
    - Go to your [Builder](https://app.getport.io/settings/data-model).
    - If the `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip> exists, proceed to step 3 to add the `openDuration`, `nudgeSent`, and mirror properties.
    - If the `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip> does not exist, create it with the schema provided below.

    <details>
    <summary>GitHub pull request blueprint (click to expand)</summary>

    ```json showLineNumbers
    {
      "identifier": "githubPullRequest",
      "title": "Pull Request",
      "icon": "Github",
      "schema": {
        "properties": {
          "creator": {
            "title": "Creator",
            "type": "string"
          },
          "assignees": {
            "title": "Assignees",
            "type": "array"
          },
          "reviewers": {
            "title": "Reviewers",
            "type": "array"
          },
          "status": {
            "title": "Status",
            "type": "string",
            "enum": [
              "merged",
              "open",
              "closed"
            ],
            "enumColors": {
              "merged": "purple",
              "open": "green",
              "closed": "red"
            }
          },
          "closedAt": {
            "title": "Closed At",
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "title": "Updated At",
            "type": "string",
            "format": "date-time"
          },
          "mergedAt": {
            "title": "Merged At",
            "type": "string",
            "format": "date-time"
          },
          "link": {
            "type": "string",
            "format": "url"
          },
          "nudgeSent": {
            "title": "Nudge Sent",
            "type": "boolean",
            "default": false
          },
          "openDuration": {
            "title": "Open Duration",
            "type": "string",
            "format": "timer"
          }
        },
        "required": []
      },
      "mirrorProperties": {
        "serviceSlackChannel": {
          "title": "Service Slack Channel",
          "path": "service.slackChannel"
        },
        "serviceSlackUrl": {
          "title": "Service Slack Url",
          "path": "service.slack"
        }
      },
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "service": {
          "title": "Service",
          "target": "service",
          "required": false,
          "many": false
        }
      }
    }
    ```

    </details>

### Add the `openDuration` and `nudgeSent` Properties to the `Pull Request` Blueprint

1. Navigate to the `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip> in your Port Builder.
2. Hover over it, click on the `...` button on the right, and select `Edit JSON`.
3. Add the following properties:

```json showLineNumbers
"openDuration": {
    "title": "Open Duration",
    "type": "string",
    "format": "timer"
},
"nudgeSent": {
    "title": "Nudge Sent",
    "type": "boolean",
    "default": false
}
```

:::tip Explanation
- **`openDuration`**: This property is used to set a timer for how long a PR has been open. When this timer expires (after 3 days), a notification is triggered.
- **`nudgeSent`**: This property is a boolean flag that helps prevent multiple notifications for the same PR. Once a notification is sent, this property is set to `true`, ensuring that no further notifications are sent for that PR.
  :::

### Add the Mirror Properties to the `Pull Request` Blueprint

1. While still in the `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip> JSON editor, ensure the following mirror properties are added:

```json showLineNumbers
"mirrorProperties": {
    "serviceSlackChannel": {
      "title": "Service Slack Channel",
      "path": "service.slackChannel"
    },
    "serviceSlackUrl": {
      "title": "Service Slack Url",
      "path": "service.slack"
    }
}
```

:::note Mirror Properties
If these mirror properties are not already present in the `Pull Request` blueprint, make sure to add them. These mirror properties allow the `Pull Request` blueprint to access the Slack channel and webhook URL from the related `Service` blueprint.

To read more about mirror properties and understand their usage better, visit the [Port Documentation on Mirror Properties](https://docs.getport.io/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/mirror-property).
:::

### Update/Create the `Service` Blueprint

If the `Service` blueprint already exists, you will need to add the `slackChannel` property. If it does not exist, you can create it with the schema below:

<details>
<summary>Service blueprint (click to expand)</summary>

```json showLineNumbers
{
  "identifier": "service",
  "title": "Service",
  "icon": "Github",
  "schema": {
    "properties": {
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown",
        "icon": "Book"
      },
      "url": {
        "title": "URL",
        "format": "url",
        "type": "string",
        "icon": "Link"
      },
      "language": {
        "icon": "Git",
        "type": "string",
        "title": "Language",
        "enum": [
          "GO",
          "Python",
          "Node",
          "React"
        ],
        "enumColors": {
          "GO": "red",
          "Python": "green",
          "Node": "blue",
          "React": "yellow"
        }
      },
      "slack": {
        "icon": "Slack",
        "type": "string",
        "title": "Slack",
        "format": "url"
      },
      "slackChannel": {
        "icon": "Slack",
        "type": "string",
        "title": "Slack Channel",
        "description": "The Slack channel name where notifications will be sent."
      },
      "code_owners": {
        "title": "Code owners",
        "description": "This service's code owners",
        "type": "string",
        "icon": "TwoUsers"
      },
      "type": {
        "title": "Type",
        "description": "This service's type",
        "type": "string",
        "enum": [
          "Backend",
          "Frontend",
          "Library"
        ],
        "enumColors": {
          "Backend": "purple",
          "Frontend": "pink",
          "Library": "green"
        },
        "icon": "DefaultProperty"
      },
      "lifecycle": {
        "title": "Lifecycle",
        "type": "string",
        "enum": [
          "Production",
          "Staging",
          "Development"
        ],
        "enumColors": {
          "Production": "green",
          "Staging": "yellow",
          "Development": "blue"
        },
        "icon": "DefaultProperty"
      },
      "locked_in_prod": {
        "icon": "DefaultProperty",
        "title": "Locked in Prod",
        "type": "boolean",
        "default": false
      },
      "locked_reason_prod": {
        "icon": "DefaultProperty",
        "title": "Locked Reason Prod",
        "type": "string"
      },
      "locked_in_test": {
        "icon": "DefaultProperty",
        "title": "Locked in Test",
        "type": "boolean",
        "default": false
      },
      "locked_reason_test": {
        "icon": "DefaultProperty",
        "title": "Locked Reason Test",
        "type": "string"
      },
      "trigger_type": {
        "icon": "DefaultProperty",
        "title": "Lock or Unlock",
        "type": "string"
      },
      "triggered_environment": {
        "icon": "DefaultProperty",
        "title": "Triggered Environment",
        "type": "string"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```

</details>

:::note
If the `Service` blueprint already exists, simply add the `slackChannel` property to ensure that the blueprint can store the Slack channel name where notifications will be sent.
:::

4. Ingest GitHub PR Data:
    - Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your GitHub integration:

      <img src='/img/guides/githubAppIntegration.png' border='1px' />

    - Under the `resources` key, add the following YAML block to map the pull request entities and click `Save & Resync`:

    <details>
    <summary>Relation mapping (click to expand)</summary>

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
                    openDuration: "((now | tonumber) + (3 * 24 * 60 * 60) | todateiso8601)" # For 1-minute timer, use ((now | tonumber) + 60 | todateiso8601)
    ```

    </details>

   You should now be able to see your GitHub pull requests ingested successfully in the software catalog.

## Create a Slack Webhook

To send messages to Slack, you need to create a Slack webhook. Follow the steps in the [Slack Incoming Webhooks Guide](https://api.slack.com/messaging/webhooks) to create one.

:::tip Update property value
After creating the Slack webhook, set the webhook URL as the value for the `slack` property in the `Service` blueprint, and ensure the Slack channel name is correctly set in the `slackChannel` property.
:::

## Automation Definition

### 1. Automation to Send Slack Notification
By using the `TIMER_PROPERTY_EXPIRED` trigger type, we can run custom logic whenever the `openDuration` timer property expires on a `githubPullRequest` entity:

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
         "propertyIdentifier": "openDuration"
      },
      "condition": {
         "type": "JQ",
         "expressions": [
            ".diff.after.properties.status == \"open\"",
            ".diff.after.properties.nudgeSent == false"
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
         "text": "*PR Overdue Notification*\n\n *Title:* {{ .event.diff.after.title }}\n\n *Link:* <{{ .event.diff.after.properties.link }}|View PR>\n\n *Creator:* {{ .event.diff.after.properties.creator }}\n\n *Assignees:* {{ .event.diff.after.properties.assignees }}\n\n *Reviewers:* {{ .event.diff.after.properties.reviewers }}"
      }
   },
   "publish": true
}
```

### 2. Automation to Mark Nudge as Sent
This automation marks the PR's `nudgeSent` property as true after the notification is sent, ensuring that only one notification is sent per PR.

```json showLineNumbers
{
  "identifier": "markNudgeSent",
  "title": "Mark Nudge as Sent",
  "description": "Marks the PR's nudgeSent property as true after the notification is sent.",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "TIMER_PROPERTY_EXPIRED",
      "blueprintIdentifier": "githubPullRequest",
      "propertyIdentifier": "openDuration"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.after.properties.status == \"open\"",
        ".diff.after.properties.nudgeSent == false"
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
        "nudgeSent": true
      }
    }
  },
  "publish": true
}
```

## Slack Message Example

Here’s an example of the Slack message you’ll receive when a PR has been open for more than 3 days:

<img src='/img/guides/overduePrSlackNotification.png' border='1px' />

By following these steps, you can effectively automate notifications for overdue PRs, ensuring timely reviews and merges.


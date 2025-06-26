---
sidebar_position: 8
displayed_sidebar: null
description: Learn how to lock and unlock services in Port, ensuring secure and controlled access to critical resources.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Lock and Unlock Service

In this guide, we will create a self-service action in Port that uses the [upsert entity](https://docs.port.io/actions-and-automations/setup-backend/create-update-entity/) backend to lock and unlock a service.
The locking and unlocking mechanism involves
updating the `locked` property in Port on a `production` or `development` environment.
Additionally, the action will send a Slack notification to a designated channel.

## Use cases
1. **Maintenance & Critical Events**: Lock deployment during maintenance, peak traffic, or critical events to maintain stability.
2. **Emergency Situations**: Lock deployment in emergencies such as security breaches or vulnerabilities to mitigate risks and prevent further issues.
3. **Post-Incident Fixes**: Unlock deployment to allow teams to implement necessary fixes or updates swiftly and restore system functionality.

## Prerequisites
1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).

   The `service` blueprint that was created for you as part of the onboarding process will need
   to be extended with additional properties.
   Below, you can find the JSON definition for the blueprint with the required properties.  
   You can add these properties manually in the Port UI or use the JSON below to replace the existing blueprint.

    <details>
    <summary><b>Service blueprint (click to expand)</b></summary>

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

   :::note Lock property
   Our Service blueprint has a boolean property called `locked_in_prod`.
   When the `UPDATE_ENTITY` backend is triggered,
   we will update the value of this field to `true` if locking and `false` if unlocking.
   The `locked_reason_prod` property will be updated to reflect the reason for the lock or unlock.
   The same logic applies to the development environment (`locked_in_test`).

   Additionally, the `trigger_type` property will be set to either "Locked" or "Unlocked" based on the action,
   and the `triggered_environment` property will be set to indicate which environment (Production or Test) was affected.
   :::


2. Create a Slack Webhook:

- To create a Slack webhook URL, follow the steps in the [Slack Incoming Webhooks Guide](https://api.slack.com/messaging/webhooks).


##  Create Service Action

Follow these steps to get started:

1. Create two Port actions in the [self-service page](https://app.getport.io/self-serve) on the `Service` blueprint with the following JSON definitions:

<details>
  <summary>Port Action - Lock Service (click to expand)</summary>

```json showLineNumbers
{
  "identifier": "lock_service",
  "title": "Lock Service",
  "icon": "Lock",
  "description": "Lock service in Port",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "reason": {
          "type": "string",
          "title": "Reason"
        },
        "environment": {
          "type": "string",
          "title": "Environment",
          "enum": [
            "Production",
            "Staging",
            "Development"
          ],
          "enumColors": {
            "Production": "green",
            "Staging": "orange",
            "Development": "blue"
          }
        }
      },
      "required": [],
      "order": [
        "reason"
      ]
    },
    "blueprintIdentifier": "service"
  },
  "invocationMethod": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "service",
    "mapping": {
      "identifier": "{{ .entity.identifier }}",
      "title": "{{ .entity.title }}",
      "properties": {
        "{{ if .inputs.environment == 'Production' then 'locked_in_prod' else 'locked_in_test' end }}": true,
        "{{ if .inputs.environment == 'Production' then 'locked_reason_prod' else 'locked_reason_test' end }}": "{{ .inputs.reason }}",
        "trigger_type": "Locked",
        "triggered_environment": "{{ .inputs.environment }}"
      }
    }
  },
  "requiredApproval": false
}
```

</details>

<details>
  <summary>Port Action - Unlock Service (click to expand)</summary>

```json showLineNumbers
{
  "identifier": "unlock_service",
  "title": "Unlock Service",
  "icon": "Unlock",
  "description": "Unlock service in Port",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "reason": {
          "type": "string",
          "title": "Reason"
        },
        "environment": {
          "type": "string",
          "title": "Environment",
          "enum": [
            "Production",
            "Staging",
            "Development"
          ],
          "enumColors": {
            "Production": "green",
            "Staging": "orange",
            "Development": "blue"
          }
        }
      },
      "required": [],
      "order": [
        "reason",
        "environment"
      ]
    },
    "blueprintIdentifier": "service"
  },
  "invocationMethod": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "service",
    "mapping": {
      "identifier": "{{ .entity.identifier }}",
      "title": "{{ .entity.title }}",
      "properties": {
        "{{ if .inputs.environment == 'Production' then 'locked_in_prod' else 'locked_in_test' end }}": false,
        "{{ if .inputs.environment == 'Production' then 'locked_reason_prod' else 'locked_reason_test' end }}": "{{ .inputs.reason }}",
        "trigger_type": "Unlocked",
        "triggered_environment": "{{ .inputs.environment }}"
      }
    }
  },
  "requiredApproval": false
}
```

</details>





## Automation for Slack Notification

Create an [automation](/actions-and-automations/create-self-service-experiences/) that listens to changes in the `locked` field of the entity and makes a `WEBHOOK` backend request to send a Slack message.

:::info Note
Replace `<Your Generated Slack Webhook>` in the automation definition with your actual Slack webhook URL.
:::

<details>
  <summary>Automation - Notify Slack on Service Lock Status (click to expand)</summary>

```json showLineNumbers
{
  "identifier": "serviceLockStatusChange",
  "title": "Notify Slack on Service Lock Status Change",
  "icon": "Slack",
  "description": "Sends a Slack message when the service lock status changes.",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "service"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.after.properties.locked_in_prod != .diff.before.properties.locked_in_prod or .diff.after.properties.locked_in_test != .diff.before.properties.locked_in_test"
      ],
      "combinator": "or"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "<Your Generated Slack Webhook>",
    "agent": false,
    "synchronized": true,
    "body": {
      "text": "*Port Service {{ .event.diff.after.properties.trigger_type }}*\n\n*Service Name*: {{ .event.diff.after.title }}\n*Link*: https://app.getport.io/{{ .event.context.blueprintIdentifier }}Entity?identifier={{ .event.context.entityIdentifier }}\n\n*Environment:* {{ .event.diff.after.properties.triggered_environment }}\n*Reason:* {{ if .event.diff.after.properties.triggered_environment == 'Production' then .event.diff.after.properties.locked_reason_prod else .event.diff.after.properties.locked_reason_test end }}"
    }
  },
  "publish": true
}
```

</details>


## Test the lock and unlock actions

Below is the result of a successful service lock and unlock alert sent to a Slack channel after triggering the action in the [self-service](https://app.getport.io/self-serve) page of your Port application:

<img src="/img/guides/lockServiceSlackAlert.png" border="1px" />
<img src="/img/guides/unlockServiceSlackAlert.png" border="1px" />

## More relevant guides and examples
- [Mini guide on controlling deployment using service lock](/guides/all/service-lock-github-workflow.md)
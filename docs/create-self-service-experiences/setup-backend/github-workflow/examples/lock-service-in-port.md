---
sidebar_position: 9
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Lock Service

In this guide, we will create a self-service action in Port that executes a GitHub workflow to lock a service. The locking mechanism involves updating the `locked` entity property in Port and sending Slack notification to a channel.

## Prerequisites
1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new)
2. Configure a Slack app that can post a message to a Slack channel. Tha app should have a `chat:write` bot scope under **OAuth & Permissions**
3. GitHub repository in which you can trigger a workflow that we will use in this guide

Below you can find the JSON for the `Service` blueprint required for the guide:

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
Our Service blueprint has a property called `locked_in_prod` with a boolean value. When the action is triggered, we will update the value of this field to `true`. The `locked_reason_prod` property will equally be updated to reflect the reason for the lock.
:::

## Create Github workflow

Follow these steps to get started:

1. Create the following GitHub Action secrets:
    - `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `SLACK_BOT_TOKEN` - The app's Bot Token from the **OAuth & Permissions** page on Slack

<br />

2. Create a Port action in the [self-service page](https://app.getport.io/self-serve) on the `Service` blueprint with the following JSON definition:

<details>

  <summary>Port Action: Lock Service</summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::


```json showLineNumbers
[
{
  "identifier": "lock_service",
  "title": "Lock Service",
  "icon": "Lock",
  "userInputs": {
    "properties": {
      "reason": {
        "title": "Reason",
        "type": "string"
      },
      "environment": {
        "icon": "DefaultProperty",
        "title": "Environment",
        "type": "string",
        "enum": [
          "Production",
          "Development",
          "Staging"
        ],
        "enumColors": {
          "Production": "lightGray",
          "Development": "lightGray",
          "Staging": "lightGray"
        }
      }
    },
    "required": [
      "environment",
      "reason"
    ],
    "order": [
      "environment",
      "reason"
    ]
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "lock_service.yaml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "DAY-2",
  "description": "lock service in Port",
  "requiredApproval": false
}
]
```

</details>
<br />

3. Create a workflow file under `.github/workflows/lock_service.yml` with the following content:

<details>

<summary>GitHub workflow script</summary>

```yaml showLineNumbers title="lock_service.yml"
name: Lock Service in Port
on:
  workflow_dispatch:
    inputs:
      environment:
        type: string
        required: true
      reason:
        type: string
        required: true
      port_payload:
        required: true
        description: Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
        type: string
jobs:
  lock-service-in-port:
    runs-on: ubuntu-latest
    steps:
      - name: Inform execution of request to lock service in Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "About to lock a service in ${{ github.event.inputs.environment }} environment ..."
          
      - name: Lock Service in Production
        id: lock-prod-service
        if: ${{ github.event.inputs.environment == 'Production' }}
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{ fromJson(github.event.inputs.port_payload).context.entity }}
          title: ${{ fromJson(github.event.inputs.port_payload).payload.entity.title }}
          blueprint: ${{ fromJson(github.event.inputs.port_payload).context.blueprint }}
          properties: |-
            {
              "locked_in_prod": true,
              "locked_reason_prod": "${{ github.event.inputs.reason }}"
            }
          relations: "{}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{fromJson(inputs.port_payload).context.runId}}

      - name: Lock Service in Development
        id: lock-test-service
        if: ${{ github.event.inputs.environment == 'Development' }}
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{ fromJson(github.event.inputs.port_payload).context.entity }}
          title: ${{ fromJson(github.event.inputs.port_payload).payload.entity.title }}
          blueprint: ${{ fromJson(github.event.inputs.port_payload).context.blueprint }}
          properties: |-
            {
              "locked_in_test": true,
              "locked_reason_test": "${{ github.event.inputs.reason }}"
            }
          relations: "{}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          
      - name: Send Slack Announcement
        if: ${{ steps.lock-prod-service.outcome == 'success' || steps.lock-test-service.outcome == 'success' }}
        id: slack
        uses: slackapi/slack-github-action@v1.25.0
        with:
          channel-id: 'C06KE3PT2BX' ## replace this value with your Slack channel ID
          slack-message: "*Port Service Lock Update*\n\n*Service Name*: ${{ fromJson(github.event.inputs.port_payload).payload.entity.title }}\n*Environment*: ${{ github.event.inputs.environment }}\n*Reporter*: ${{ fromJson(github.event.inputs.port_payload).trigger.by.user.email }}.\n*Reason*: ${{ github.event.inputs.reason }}"
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}

      - name: Inform Port about outcome of sending slack alert
        if: ${{ steps.lock-prod-service.outcome == 'success' || steps.lock-test-service.outcome == 'success' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "The lock operation has been completed successfully and the details is being broadcasted to Slack. The outcome of the Slack announcement is ${{ steps.slack.outcome }}"
          
      - name: Inform unsuccessful service locking in Port
        if: ${{ (steps.lock-prod-service.outcome != 'success' && steps.lock-prod-service.outcome != 'skipped') || (steps.lock-test-service.outcome != 'success' && steps.lock-test-service.outcome != 'skipped') }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: The attempt to lock the service was not successful
```

</details>
<br />
4. Trigger the action from the [self-service](https://app.getport.io/self-serve) page of your Port application.

Below is the result of a succesful service lock alert sent to a Slack channel

<img src="/img/self-service-actions/lockServiceSlackAlert.png" border="1px" />
---
sidebar_position: 9
displayed_sidebar: null
description: Learn how to open a Slack channel in Port, enhancing team collaboration and communication with this easy guide.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";
import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Create Slack channel for Incident Management

## Overview

Streamline incident response with this self-service action. It automatically creates dedicated Slack channels for your services, optionally adding key team members during setup.

:::tip Key Benefits

- **Faster Incident Response**: Instantly create communication channels when issues arise.
- **Consistent Process**: Ensure standard channel naming and member inclusion.
- **Developer Self-Service**: Empower teams to create incident channels without needing extra Slack permissions.
- **Reduced Manual Steps**: Automate a routine task, freeing up time for your team.
:::

## Prerequisites

1. [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed.
2. Setup Slack App:
    1. [Create a slack app](https://api.slack.com/start/quickstart#creating) and install it on a workspace.
    2. [Add the following permissions](https://api.slack.com/quickstart#scopes) to the slack app:
        * [Create channel](https://api.slack.com/methods/conversations.create) (**Required**) :
          `channels:manage`
          `groups:write`
          `im:write`
          `mpim:write`
        * [Find a user with an email address](https://api.slack.com/methods/users.lookupByEmail) (**Optional**) :
          `users:read.email`
        * [Invite users to channel](https://api.slack.com/methods/conversations.invite) (**Optional**) :
          `channels:write.invites`
          `groups:write.invites`
          `mpim:write.invites`
    :::warning
    Without scopes for `Find a user with an email address` and `Invite users to channel`, the channel will be created but users will not be added to it.
    :::
    3. Then [install the app in your slack workspace](https://api.slack.com/quickstart#installing).
    4. Navigate back to the **OAuth & Permissions page**. You'll see an access token under OAuth Tokens for Your Workspace that you will use in the `BOT_USER_OAUTH_TOKEN ` GitHub secret.
    <br />
    <img src='/img/self-service-actions/setup-backend/github-workflow/slack-app.png' width='85%' border="1px" />


3. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
      - `BOT_USER_OAUTH_TOKEN` - [Slack Bot User Oauth Token](https://api.slack.com/authentication/token-types#bot) generated for the slack app.
      - `PORT_CLIENT_ID` - Your port [client id](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
      - `PORT_CLIENT_SECRET` - Your port [client secret](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
4. Create a service <PortTooltip id="blueprint">blueprint</PortTooltip> with the following JSON definition:

<details>
   <summary><b>Service Blueprint (Click to expand)</b></summary>

```json showLineNumbers title='service blueprint'
{
  "identifier": "service",
  "title": "Service",
  "icon": "Github",
  "teamInheritance": {
    "path": "team"
  },
  "schema": {
    "properties": {
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown",
        "icon": "Book"
      },
      "language": {
        "icon": "Git",
        "type": "string",
        "title": "Language",
        "enum": ["GO", "Python", "Node", "React"],
        "enumColors": {
          "GO": "red",
          "Python": "green",
          "Node": "blue",
          "React": "yellow"
        }
      },
      "tier": {
        "icon": "DefaultProperty",
        "title": "Tier",
        "description": "Service Tiers indicate the significance or importance of a Service for business operations",
        "type": "string",
        "enum": [
          "Mission Critical",
          "Customer Facing",
          "Internal Service",
          "Other"
        ],
        "enumColors": {
          "Mission Critical": "turquoise",
          "Customer Facing": "green",
          "Internal Service": "darkGray",
          "Other": "yellow"
        }
      },
      "code_owners": {
        "title": "Code owners",
        "description": "This service's code owners",
        "type": "array",
        "icon": "TwoUsers"
      },
      "resource_definitions": {
        "title": "Resource definitions",
        "description": "A link to the service's resource definitions",
        "icon": "Terraform",
        "type": "string",
        "format": "url"
      },
      "type": {
        "title": "Type",
        "description": "This service's type",
        "type": "string",
        "enum": ["Backend", "Frontend", "Library"],
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
        "enum": ["Production", "Experimental", "Deprecated"],
        "enumColors": {
          "Production": "green",
          "Experimental": "yellow",
          "Deprecated": "red"
        },
        "icon": "DefaultProperty"
      },
      "require_approval_count": {
        "title": "Require approvals",
        "type": "number",
        "icon": "DefaultProperty"
      },
      "is_protected": {
        "title": "Is branch protected",
        "type": "boolean",
        "icon": "DefaultProperty"
      },
      "require_code_owner_review": {
        "title": "Require code owner review",
        "type": "boolean",
        "icon": "DefaultProperty"
      },
      "locked_in_prod": {
        "icon": "DefaultProperty",
        "title": "Locked in Prod",
        "type": "boolean",
        "default": false
      },
      "last_push": {
        "icon": "GitPullRequest",
        "title": "Last push",
        "description": "Last commit to the main branch",
        "type": "string",
        "format": "date-time"
      },
      "required_approvals": {
        "icon": "Lock",
        "title": "Required approvals",
        "type": "number",
        "description": "Number of required approvals for a PR to be merged to main branch"
      },
      "locked_reason_prod": {
        "icon": "DefaultProperty",
        "title": "Locked Reason Prod",
        "type": "string"
      },
      "locked_reason_test": {
        "title": "Locked Reason Test",
        "type": "string",
        "icon": "DefaultProperty"
      },
      "locked_in_test": {
        "title": "Locked in Test",
        "type": "boolean",
        "default": false,
        "icon": "DefaultProperty"
      },
      "runbooks": {
        "title": "Runbooks",
        "type": "array",
        "icon": "Misconfiguration",
        "items": {
          "type": "string",
          "format": "url"
        }
      },
      "monitor_dashboards": {
        "title": "Monitor Dashboards",
        "type": "array",
        "icon": "Grafana",
        "items": {
          "type": "string",
          "format": "url"
        }
      },
      "spec": {
        "title": "Spec",
        "type": "string",
        "description": "Spec in Prod",
        "icon": "Swagger",
        "format": "yaml",
        "spec": "open-api"
      },
      "last_contributer": {
        "icon": "TwoUsers",
        "title": "Last contributor",
        "type": "string",
        "format": "user"
      },
      "url": {
        "title": "URL",
        "format": "url",
        "type": "string",
        "icon": "Link"
      }
    },
    "required": []
  },
  "mirrorProperties": {
    "on_call": {
      "path": "pager_duty_service.oncall"
    },
    "coverage": {
      "path": "sonar_qube_project.coverage"
    },
    "sonar_qube_vulnerabilities": {
      "path": "sonar_qube_project.numberOfVulnerabilities"
    },
    "security_hotspots": {
      "path": "sonar_qube_project.numberOfHotSpots"
    },
    "prod_health": {
      "path": "prod_runtime.healthStatus"
    },
    "synced_in_prod": {
      "path": "prod_runtime.syncStatus"
    },
    "test_health": {
      "path": "test_runtime.healthStatus"
    },
    "synced_in_test": {
      "path": "test_runtime.syncStatus"
    },
    "health_status": {
      "path": "dev_runtime.healthStatus"
    },
    "sync_status": {
      "path": "dev_runtime.syncStatus"
    },
    "status": {
      "path": "pager_duty_service.status"
    }
  },
  "calculationProperties": {
    "freshness": {
      "title": "Freshness",
      "icon": "Clock",
      "calculation": "((now - ((.properties.last_push) | fromdate)) / 86400) | floor",
      "type": "number",
      "colorized": false,
      "colors": {}
    },
    "slack": {
      "title": "Slack",
      "icon": "Slack",
      "calculation": "\"https://slack.com/\" + .identifier",
      "type": "string"
    }
  },
  "aggregationProperties": {},
  "relations": {
    "sonar_qube_project": {
      "title": "SonarQube Project",
      "target": "sonarQubeProject",
      "required": false,
      "many": false
    },
    "prod_runtime": {
      "title": "Prod runtime",
      "description": "The service's prod runtime",
      "target": "running_service",
      "required": false,
      "many": false
    },
    "snyk_project": {
      "title": "Snyk Project",
      "target": "snykProject",
      "required": false,
      "many": false
    },
    "ecr_repo": {
      "title": "ECR Repo",
      "target": "ecrRepository",
      "required": false,
      "many": false
    },
    "githubTeams": {
      "title": "GitHub teams",
      "target": "githubTeam",
      "required": false,
      "many": true
    },
    "test_runtime": {
      "title": "Test runtime",
      "description": "The service's test runtime",
      "target": "running_service",
      "required": false,
      "many": false
    },
    "pager_duty_service": {
      "title": "PagerDuty Service",
      "description": "Corresponding Pagerduty Service",
      "target": "pagerdutyService",
      "required": false,
      "many": false
    },
    "consumes_api": {
      "title": "Consumes API",
      "target": "api",
      "required": false,
      "many": true
    },
    "dora_last_7_days": {
      "title": "DORA last 7 days",
      "target": "doraMetrics",
      "required": false,
      "many": false
    },
    "team": {
      "title": "Team",
      "target": "idp_team",
      "required": false,
      "many": false
    },
    "domain": {
      "title": "Domain",
      "description": "The domain this service belongs to",
      "target": "domain",
      "required": false,
      "many": false
    },
    "provides_api": {
      "title": "Provides API",
      "target": "api",
      "required": false,
      "many": false
    },
    "dev_runtime": {
      "title": "Dev Runtime",
      "target": "running_service",
      "required": false,
      "many": false
    },
    "dora_last_30_days": {
      "title": "DORA last 30 days",
      "target": "doraMetrics",
      "required": false,
      "many": false
    }
  }
}
```

</details>

## GitHub Workflow

Create the file `.github/workflows/open-slack-channel.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary><b>Github Workflow: Open Slack Channel (Click to expand)</b></summary>

```yaml showLineNumbers  title='.github/workflows/open-slack-channel.yaml'
name: Open Slack Channel
on:
  workflow_dispatch:
    inputs:
      channel_name:
        description: Name of the public or private channel to create.
        required: true
        type: string
      is_private:
        description: Create a private channel instead of a public one.
        required: false
        type: boolean
      members:
        description: Add members manually to the channel.
        type: array
        required: false
      port_context:
        description: Details of the action and general port_context (blueprint, run ID, entity identifier from Port, etc...).
        required: true

jobs:
  open-slack-channel:
    runs-on: ubuntu-latest
    steps:
      - name: Log Executing Request to Open Channel
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(github.event.inputs.port_context).runId }}
          logMessage: "About to create a conversation channel in slack..."

      - name: Create Slack Channel
        id: create_channel
        env:
          SLACK_TOKEN: ${{ secrets.BOT_USER_OAUTH_TOKEN }}
        run: |
          response=$(curl -s -X POST "https://slack.com/api/conversations.create" \
            -H "Authorization: Bearer $SLACK_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"name\": \"${{ github.event.inputs.channel_name }}\",\"is_private\": ${{ github.event.inputs.is_private }} }")

          echo "API Response: $response"

          if [[ "$(echo $response | jq -r '.ok')" == "true" ]]; then
            channel_id=$(echo $response | jq -r '.channel.id')
            echo "Channel ID: $channel_id"
            echo "CHANNEL_ID=$channel_id" >> $GITHUB_ENV

          else
            echo "Failed to create Slack channel. Channel ID is null."
            error=$(echo $response | jq -r '.error')
            error_message="${error//_/ }"
            echo "Error: $error_message"
            echo "CREATE_CHANNEL_ERROR=$error_message" >> $GITHUB_ENV
            exit 1
          fi

      - name: Log If Create Channel Request Fails
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(github.event.inputs.port_context).runId }}
          logMessage: "Failed to create slack channel: ${{env.CREATE_CHANNEL_ERROR}} ❌"

      - name: Log If Create Channel Request is Successful
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(github.event.inputs.port_context).runId }}
          logMessage: "Channel created successfully, channel Id: ${{env.CHANNEL_ID}} ✅"

      - name: Checkout code
        uses: actions/checkout@v4

      - name: Add Members to Slack Channel
        id: add_members
        if: success()
        env:
          SLACK_TOKEN: ${{ secrets.BOT_USER_OAUTH_TOKEN }}
          CHANNEL_ID: ${{env.CHANNEL_ID}}
          CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
          CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
          RUN_ID: ${{ fromJson(github.event.inputs.port_context).runId }}
          MEMBER_EMAILS: ${{ toJSON(github.event.inputs.members) }}
        run: |
          cd slack
          chmod +x add-members-to-channel.sh
          bash add-members-to-channel.sh "$SLACK_TOKEN" "$CHANNEL_ID" "$CLIENT_ID" "$CLIENT_SECRET" "$RUN_ID" "$MEMBER_EMAILS"

      - name: Log Successful Action
        if: steps.add_members.outcome == 'failure'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          status: "FAILURE"
          runId: ${{ fromJson(github.event.inputs.port_context).runId }}
          logMessage: "Failed to add members to channel ❌"
```

</details>

5. Create a bash script (`add-members-to-channel.sh`) in a folder named `slack` at the root of your GitHub repository with this content:

<details>
<summary><b>Bash Script: Add Members to Channel (Click to expand)</b></summary>

```bash showLineNumbers title="slack/add-members-to-channel.sh"
#!/bin/bash

# Assign arguments to variables
SLACK_TOKEN=$1
CHANNEL_ID=$2
clientId=$3
clientSecret=$4
run_id=$5
MEMBER_EMAILS_JSON=$6

# Get the Port access token
PORT_TOKEN_RESPONSE=$(curl -s -X 'POST' \
  'https://api.getport.io/v1/auth/access_token' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d "{
        \"clientId\": \"$clientId\",
        \"clientSecret\": \"$clientSecret\"
      }"
    )

echo $PORT_TOKEN_RESPONSE
PORT_ACCESS_TOKEN=$(echo $PORT_TOKEN_RESPONSE | jq -r '.accessToken')

# Ensure the access token was obtained successfully
if [ -z "$PORT_ACCESS_TOKEN" ] || [ "$PORT_ACCESS_TOKEN" == "null" ]; then
  error_message="Failed to obtain Port access token ❌"
  echo $error_message
  report_error "$error_message"
  exit 1
fi

# Function to report error
report_error() {
  local message=$1
  echo $message
  echo "ADD_MEMBER_TO_CHANNEL_ERROR=$message" >> $GITHUB_ENV
  curl -s -X POST "https://api.getport.io/v1/actions/runs/$run_id/logs" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $PORT_ACCESS_TOKEN" \
    -d "{\"message\": \"$message\"}"
}

user_ids=""

# Convert MEMBER_EMAILS_JSON to an array
readarray -t MEMBER_EMAILS < <(echo $MEMBER_EMAILS_JSON | jq -r 'fromjson | .[]')

for email in "${MEMBER_EMAILS[@]}"; do
  user_response=$(curl -s -X GET "https://slack.com/api/users.lookupByEmail?email=$email" \
    -H "Authorization: Bearer $SLACK_TOKEN")

  if [[ "$(echo $user_response | jq -r '.ok')" == "true" ]]; then
    user_id=$(echo $user_response | jq -r '.user.id')
    user_ids+="${user_id},"
  else
    error_message="Failed to retrieve user id for $email: $(echo $user_response | jq -r '.error' | tr '_' ' ') ⚠️"
    report_error "$error_message"
  fi
done

user_ids=${user_ids%,}

if [[ -n "$user_ids" ]]; then
  invite_response=$(curl -s -X POST "https://slack.com/api/conversations.invite" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SLACK_TOKEN" \
    --data "{\"channel\":\"$CHANNEL_ID\",\"users\":\"$user_ids\"}")

  if [[ "$(echo $invite_response | jq -r '.ok')" == "false" ]]; then
    error_message="Failed to invite users to channel: $(echo $invite_response | jq -r '.error' | tr '_' ' ') ⚠️"
    report_error "$error_message"
  fi
else
  report_error "No user IDs found to invite."
fi
```
</details>

## Port Configuration

Create a new self service action using the following JSON configuration.

<details>
<summary><b>Open Slack Channel (Click to expand)</b></summary>
<GithubActionModificationHint/>

```json showLineNumbers
{
  "identifier": "open_slack_channel",
  "title": "Open Slack Channel",
  "icon": "Slack",
  "description": "Create and slack channel and optionally add members to it",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "channel_name": {
          "icon": "Slack",
          "title": "Channel Name",
          "type": "string",
          "default": {
            "jqQuery": "\"incident-\"+.entity.identifier"
          }
        },
        "is_private": {
          "description": "Create a private channel instead of a public one",
          "title": "Is Private",
          "type": "boolean",
          "default": false,
          "icon": "Slack"
        },
        "members": {
          "items": {
            "type": "string",
            "format": "user"
          },
          "title": "Members",
          "icon": "Slack",
          "type": "array",
          "description": "Add members manually to the channel.",
          "default": {
            "jqQuery": ".entity.properties.code_owners"
          }
        }
      },
      "required": [
        "channel_name"
      ],
      "order": [
        "channel_name",
        "members",
        "is_private"
      ]
    },
    "blueprintIdentifier": "service"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "open-slack-channel.yaml",
    "workflowInputs": {
      "channel_name": "{{.inputs.\"channel_name\"}}",
      "is_private": "{{.inputs.\"is_private\"}}",
      "members": "{{.inputs.\"members\"}}",
      "port_context": {
        "entity": "{{.entity}}",
        "blueprint": "{{.action.blueprint}}",
        "runId": "{{.run.id}}",
        "trigger": "{{ .trigger }}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```

</details>

Now you should see the `Open Slack Channel` action in the self-service page. 🎉

## Let's test it!

1. Head to the [Self Service hub](https://app.getport.io/self-serve)
2. Click on the `Open Slack Channel` action
3. Enter your preferred details for `channel_name` and optionally add `members`. You can toggle the `is_private` flag to make the channel private.
6. Click on `Execute`
7. Done! wait for the channel to be created in slack.

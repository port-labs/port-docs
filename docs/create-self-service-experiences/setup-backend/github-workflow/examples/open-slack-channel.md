import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Open Slack Channel

## Overview

In this guide, we will demonstrate how to create a self-service action in Port that not only automates the creation of a new Slack channel for a service but also includes the option to add members during the channel's setup.

## Prerequisites

1. [Create a slack app](https://api.slack.com/start/quickstart#creating) and install it on a workspace.
2. Generate a [Slack Bot User Oauth Token](https://api.slack.com/apps/A06PVJZQBHB/oauth?success=1) with permissions to create a new channel and invite users of the slack workspace to the slack channel.
   _ [Bot User Scopes](https://api.slack.com/start/quickstart#scopes):
   _ [Create channel](https://api.slack.com/methods/conversations.invite) (**Required**) :
   `channels:manage`
   `groups:write`
   `im:write`
   `mpim:write`
   _ [Find a user with an email address](https://api.slack.com/methods/users.lookupByEmail) (**Optional**) :
   `users:read.email`
   _ [Invite users to channel](https://api.slack.com/methods/conversations.invite) (**Optional**) :
   `channels:write.invites`
   `groups:write.invites`
   `mpim:write.invites`
   `channels:manage`
   `groups:write`
   `im:write`
   `mpim:write`  
   :::note
   Without scopes for `Find a user with an email address` and `Invite users to channel`, the channel will be created but users will not be added to it.
   :::
3. [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed.

## Steps

1. Create the following GitHub action secrets

- `BOT_USER_OAUTH_TOKEN` - [Slack Bot User Oauth Token](https://api.slack.com/authentication/token-types#bot) generated for the slack app.
- `PORT_CLIENT_ID` - Your port [client id](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
- `PORT_CLIENT_SECRET` - Your port [client secret](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

2. Create a <PortTooltip id="blueprint">blueprint</PortTooltip> for the service with the following JSON definition:

<details>
   <summary><b>Service Blueprint (Click to expand)</b></summary>

```json showLineNumbers
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
        "title": "Last contributer",
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

3. Create an action in Port on the service blueprint
   :::tip Action usage
   This action is utilized within the Service blueprint in Port and can be triggered manually via self service action or the catalog
   :::

<details>
<summary><b>Open Slack Channel Action (Click to expand)</b></summary>
:::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::

```json showLineNumbers
{
  "identifier": "open_slack_channel",
  "title": "Open Slack Channel",
  "icon": "Slack",
  "userInputs": {
    "properties": {
      "channel_name": {
        "icon": "Slack",
        "title": "Channel Name",
        "type": "string",
        "default": {
          "jqQuery": "\"incident-\"+.entity.title"
        }
      },
      "is_private": {
        "description": "Create a private channel instead of a public one",
        "title": "Is Private",
        "type": "boolean",
        "default": false,
        "icon": "Slack"
      },
      "team_id": {
        "description": "Encoded team id to create the channel in, required if org token is used",
        "title": "Team ID",
        "icon": "Slack",
        "type": "string"
      },
      "members": {
        "items": {
          "type": "string"
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
    "required": ["members"],
    "order": ["channel_name", "members", "is_private", "team_id"]
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "open-slack-channel.yaml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "DAY-2",
  "requiredApproval": false
}
```

</details>

4. Create a workflow file under `.github/workflows/open-slack-channel.yaml` using the workflow:

<details>
<summary><b>Open Slack Channel (Click to expand)</b></summary>

```yaml showLineNumbers
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
      team_id:
        description: Encoded team ID to create the channel in, required if org token is used.
        type: string
        required: false
      members:
        description: Add members manually to the channel.
        type: array
        required: false
      port_payload:
        description: Port's payload, including details for who triggered the action and general context (blueprint, run ID, etc...).
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
          runId: ${{ fromJson(github.event.inputs.port_payload).context.runId }}
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
          runId: ${{ fromJson(github.event.inputs.port_payload).context.runId }}
          logMessage: "Failed to create slack channel: ${{env.CREATE_CHANNEL_ERROR}} ❌"

      - name: Log If Create Channel Request is Successful
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(github.event.inputs.port_payload).context.runId }}
          logMessage: "Channel created successfully, channel Id: ${{env.CHANNEL_ID}} ✅"

      - name: Checkout code
        uses: actions/checkout@v2

      - name: Add Members to Slack Channel
        id: add_members
        if: success()
        env:
          SLACK_TOKEN: ${{ secrets.BOT_USER_OAUTH_TOKEN }}
          CHANNEL_ID: ${{env.CHANNEL_ID}}
          CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
          CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
          RUN_ID: ${{ fromJson(github.event.inputs.port_payload).context.runId }}
          MEMBER_EMAILS: ${{ toJSON(github.event.inputs.members) }}
        run: |
          cd slack
          chmod +x add-members-to-channel.sh
          bash add-members-to-channel.sh "$SLACK_TOKEN" "$CHANNEL_ID" "$CLIENT_ID" "$CLIENT_SECRET" "$RUN_ID" "$MEMBER_EMAILS"

      - name: Log Successful Action
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(github.event.inputs.port_payload).context.runId }}
          logMessage: "Successfully opened slack channel: ${{env.CHANNEL_ID}} ✅"
```

</details>

5. Create the following bash script (`add-members-to-channel.sh`) in `slack` folder at the root of your GitHub repository:

6. Trigger the action from Port's [Self Service hub](https://app.getport.io/self-serve)

7. Done! wait for the slack channel to be created.

Congrats 🎉 You've successfully opened a slack channel from Port 🔥

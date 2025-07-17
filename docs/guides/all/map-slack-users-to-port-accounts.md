---
displayed_sidebar: null
description: Map Slack users to their Port user accounts for seamless integration
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Map Slack users to Port user accounts

This guide demonstrates how to set up a mapping between Slack users and Port user accounts, enabling seamless integration between your Slack workspace and Port.

## Common use cases

- Automatically assign Slack users to Port user entities based on their Slack profile information.
- Send notifications to specific Slack channels based on Port user assignments.
- Create self-service actions that can interact with users through Slack.
- Build automations that reference Slack user data when creating or updating Port entities.
- Enable the Slack app to properly identify and authenticate users.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- You have [installed Port's Slack app](https://docs.port.io/ai-agents/slack-app).
- You have a Slack workspace with admin permissions to create apps and generate bot tokens.

## Set up data model

To properly map Slack users to Port accounts, we need to create Slack User and Slack Channel blueprints and establish relationships between them and Port users.

### Create Slack User blueprint

Create a Slack User blueprint to store Slack user data:

1. Go to the [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Click on "+ Blueprint".

3. Click on the `Edit JSON` button in the top right corner.

4. Paste the following JSON schema:

    <details>
    <summary><b>Slack User blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "slack_user",
        "description": "Slack User",
        "title": "Slack User",
        "icon": "Slack",
        "schema": {
        "properties": {
            "tz": {
            "type": "string",
            "description": "The user's time zone."
            },
            "is_restricted": {
            "type": "boolean",
            "description": "Indicates if the user is restricted."
            },
            "is_primary_owner": {
            "type": "boolean",
            "description": "Indicates if the user is the primary owner."
            },
            "real_name": {
            "type": "string",
            "description": "The user's real name."
            },
            "team_id": {
            "type": "string",
            "description": "The user's team ID."
            },
            "is_admin": {
            "type": "boolean",
            "description": "Indicates if the user is an admin."
            },
            "is_app_user": {
            "type": "boolean",
            "description": "Indicates if the user is an app user."
            },
            "deleted": {
            "type": "boolean",
            "description": "Indicates if the user is deleted."
            },
            "is_bot": {
            "type": "boolean",
            "description": "Indicates if the user is a bot."
            },
            "email": {
            "type": "string",
            "title": "email"
            }
        },
        "required": []
        },
        "mirrorProperties": {},
        "calculationProperties": {},
        "aggregationProperties": {},
        "relations": {
        "user": {
            "title": "User",
            "target": "_user",
            "required": false,
            "many": false
        }
        }
    }
    ```

    </details>

5. Click on `Save` to create the blueprint.

### Create Slack Channel blueprint

Create a Slack Channel blueprint to store Slack channel data and relate channels to their members:

1. Go to the [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Click on "+ Blueprint".

3. Click on the `Edit JSON` button in the top right corner.

4. Paste the following JSON schema:

    <details>
    <summary><b>Slack Channel blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "slack_channel",
    "description": "Slack Channel",
    "title": "Slack Channel",
    "icon": "Slack",
    "schema": {
        "properties": {
        "is_private": {
            "type": "boolean",
            "description": "Indicates if the channel is private."
        },
        "context_team_id": {
            "type": "string",
            "description": "ID of the team the channel belongs to."
        },
        "is_channel": {
            "type": "boolean",
            "description": "Indicates if this is a channel (true) or a direct message (false)."
        },
        "is_shared": {
            "type": "boolean",
            "description": "Indicates if the channel is shared across teams."
        },
        "previous_names": {
            "type": "array",
            "description": "List of previous names of the channel."
        },
        "creator": {
            "type": "string",
            "description": "ID of the user who created the channel."
        },
        "createdAt": {
            "type": "number",
            "description": "Timestamp of when the channel was created."
        },
        "is_ext_shared": {
            "type": "boolean",
            "description": "Indicates if the channel is externally shared."
        },
        "is_group": {
            "type": "boolean",
            "description": "Indicates if this is a group DM."
        },
        "is_archived": {
            "type": "boolean",
            "description": "Indicates if the channel is archived."
        },
        "shared_team_ids": {
            "type": "array",
            "description": "List of teams the channel is shared with."
        },
        "is_org_shared": {
            "type": "boolean",
            "description": "Indicates if the channel is shared across the entire organization."
        },
        "num_members": {
            "type": "number",
            "title": "num_members"
        },
        "purpose": {
            "type": "string",
            "description": "Information about the channel's purpose."
        },
        "topic": {
            "type": "string",
            "description": "Information about the channel's topic."
        }
        },
        "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
        "members": {
        "title": "Members",
        "target": "slack_user",
        "required": false,
        "many": true
        }
    }
    }
    ```

    </details>

5. Click on `Save` to create the blueprint.




## Implementation

You can implement this integration in two ways:
1. **Manual sync**: User-triggered self-service actions that use GitHub workflows to sync Slack data on-demand.
2. **Automated sync**: Event-driven automations that automatically sync data when Port entities are created or updated.



<Tabs>

  <TabItem value="manual" label="Manual sync" default>

    This approach uses self-service actions that trigger GitHub workflows to manually sync Slack data when needed.

    <h3> Add GitHub secrets </h3>

    In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
    - `SLACK_BOT_TOKEN` - Your Slack bot token with `users:read` scope. [How to get the token](https://api.slack.com/authentication/token-types#bot)
    - `PORT_CLIENT_ID` - Your Port client ID [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials)
    - `PORT_CLIENT_SECRET` - Your Port client secret [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials)


    <h3> Create self-service actions </h3>

    Create self-service actions that trigger GitHub workflows to sync Slack data on-demand.

    <h4> "Sync Slack Users" action </h4>

    1. Head to the [self-service](https://app.getport.io/self-serve) page.
    2. Click on the `+ Action` button.
    3. Click on the `Edit JSON` button.
    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Sync Slack Users action (Click to expand)</b></summary>

        :::tip Replace the placeholders
        - `<GITHUB_ORG>` - your GitHub organization or user name.
        - `<GITHUB_REPO>` - your GitHub repository name.
        :::

        ```json showLineNumbers
        {
          "identifier": "sync_slack_users",
          "title": "Sync Slack Users",
          "icon": "Slack",
          "description": "Manually sync all Slack users to Port via GitHub workflow",
          "trigger": {
            "type": "self-service",
            "operation": "CREATE",
            "userInputs": {
              "properties": {},
              "required": [],
              "order": []
            }
          },
          "invocationMethod": {
            "type": "GITHUB",
            "org": "<GITHUB_ORG>",
            "repo": "<GITHUB_REPO>",
            "workflow": "sync-slack-users.yml",
            "workflowInputs": {
              "port_context": {
                "blueprint": "{{.action.blueprint}}",
                "run_id": "{{.run.id}}",
                "trigger": "{{.trigger}}"
              }
            },
            "reportWorkflowStatus": true
          },
          "requiredApproval": false
        }
        ```

        </details>

    5. Click `Save`.

    <h4> "Sync Slack Channels" action </h4>

    Create a similar action for syncing channels:

    <details>
    <summary><b>Sync Slack Channels action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "sync_slack_channels",
      "title": "Sync Slack Channels",
      "icon": "Slack",
      "description": "Manually sync all Slack channels to Port via GitHub workflow",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        }
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB_ORG>",
        "repo": "<GITHUB_REPO>",
        "workflow": "sync-slack-channels.yml",
        "workflowInputs": {
          "port_context": {
            "blueprint": "{{.action.blueprint}}",
            "run_id": "{{.run.id}}",
            "trigger": "{{.trigger}}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```

    </details>

    Now you should see the `Sync Slack Users` and `Sync Slack Channels` actions in the self-service page. 🎉

    <h3> Add GitHub workflows </h3>

    Create GitHub workflows that handle both manual and event-driven syncing of data from Slack.

    <h4> Create Slack users sync workflow </h4>

    Create a file `.github/workflows/sync-slack-users.yml` in your repository:

    <details>
    <summary><b>Manual Slack users sync workflow (Click to expand)</b></summary>

    ```yaml showLineNumbers
    name: Sync Slack Users to Port

    on:
      workflow_dispatch:
        inputs:
          port_context:
            required: true
            description: 'Action and general context (blueprint, run id, etc...)'
            type: string

    jobs:
      sync-slack-users:
        runs-on: ubuntu-latest
        
        steps:
        - name: Log Starting of Sync
          uses: port-labs/port-github-action@v1
          with:
            clientId: ${{ secrets.PORT_CLIENT_ID }}
            clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
            baseUrl: https://api.getport.io
            operation: PATCH_RUN
            runId: ${{ fromJson(inputs.port_context || '{}').run_id }}
            logMessage: "Starting manual sync of Slack users..."

        - name: Fetch and Sync Slack Users
          run: |
            echo "Fetching Slack users..."
            
            USERS_RESPONSE=$(curl -s -H "Authorization: Bearer ${{ secrets.SLACK_BOT_TOKEN }}" \
              "https://slack.com/api/users.list")
            
            if [ $? -ne 0 ]; then
              echo "Error fetching users from Slack API"
              exit 1
            fi
            
            # Process each user and create Port entities
            echo "$USERS_RESPONSE" | jq -c '.members[] | select(.is_bot == false and .deleted == false)' > users_temp.json
            
            user_count=$(wc -l < users_temp.json)
            echo "Found $user_count users to sync"
            
            counter=1
            while IFS= read -r user; do
              user_id=$(echo "$user" | jq -r '.id')
              username=$(echo "$user" | jq -r '.name')
              email=$(echo "$user" | jq -r '.profile.email // ""')
              
              echo "Processing user $counter/$user_count: $username ($user_id)"
              
              # Create Port entity using API call
              entity_payload=$(echo "$user" | jq '{
                identifier: .id,
                title: .name,
                properties: {
                  tz: (.tz // ""),
                  is_restricted: (.is_restricted // false),
                  is_primary_owner: (.is_primary_owner // false),
                  real_name: (.real_name // ""),
                  team_id: (.team_id // ""),
                  is_admin: (.is_admin // false),
                  is_app_user: (.is_app_user // false),
                  deleted: (.deleted // false),
                  is_bot: (.is_bot // false),
                  email: (.profile.email // "")
                },
                relations: {
                  user: (.profile.email // "")
                }
              }')
              
              # Get Port access token
              access_token=$(curl -s --location --request POST "https://api.getport.io/v1/auth/access_token" \
                --header "Content-Type: application/json" \
                --data-raw "{
                  \"clientId\": \"${{ secrets.PORT_CLIENT_ID }}\",
                  \"clientSecret\": \"${{ secrets.PORT_CLIENT_SECRET }}\"
                }" | jq -r '.accessToken')
              
              # Upsert entity to Port
              curl -s --location --request POST "https://api.getport.io/v1/blueprints/slack_user/entities?upsert=true" \
                --header "Authorization: Bearer $access_token" \
                --header "Content-Type: application/json" \
                --data-raw "$entity_payload"
              
              echo "✓ Synced user: $username"
              counter=$((counter + 1))
              sleep 0.2  # Rate limiting
            done < users_temp.json
            
            echo "✅ Successfully synced $user_count Slack users to Port"

        - name: Log Completion of Sync
          uses: port-labs/port-github-action@v1
          with:
            clientId: ${{ secrets.PORT_CLIENT_ID }}
            clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
            baseUrl: https://api.getport.io
            operation: PATCH_RUN
            runId: ${{ fromJson(inputs.port_context || '{}').run_id }}
            logMessage: "✅ Manual Slack users sync completed successfully"
    ```

    </details>



    <h4> Create Slack channels sync workflow </h4>

    Create a file `.github/workflows/sync-slack-channels.yml` in your repository:

    <details>
    <summary><b>Manual Slack channels sync workflow (Click to expand)</b></summary>

    ```yaml showLineNumbers
    name: Sync Slack Channels to Port

    on:
      workflow_dispatch:
        inputs:
          port_context:
            required: true
            description: 'Action and general context (blueprint, run id, etc...)'
            type: string

    jobs:
      sync-slack-channels:
        runs-on: ubuntu-latest
        
        steps:
        - name: Log Starting of Sync
          uses: port-labs/port-github-action@v1
          with:
            clientId: ${{ secrets.PORT_CLIENT_ID }}
            clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
            baseUrl: https://api.getport.io
            operation: PATCH_RUN
            runId: ${{ fromJson(inputs.port_context || '{}').run_id }}
            logMessage: "Starting manual sync of Slack channels..."

        - name: Fetch and Sync Slack Channels
          run: |
            echo "Fetching Slack channels..."
            
            CHANNELS_RESPONSE=$(curl -s -H "Authorization: Bearer ${{ secrets.SLACK_BOT_TOKEN }}" \
              "https://slack.com/api/conversations.list?types=public_channel,private_channel")
            
            if [ $? -ne 0 ]; then
              echo "Error fetching channels from Slack API"
              exit 1
            fi
            
            # Process each channel and create Port entities
            echo "$CHANNELS_RESPONSE" | jq -c '.channels[] | select(.is_archived == false)' > channels_temp.json
            
            channel_count=$(wc -l < channels_temp.json)
            echo "Found $channel_count channels to sync"
            
            counter=1
            while IFS= read -r channel; do
              channel_id=$(echo "$channel" | jq -r '.id')
              channel_name=$(echo "$channel" | jq -r '.name')
              
              echo "Processing channel $counter/$channel_count: $channel_name ($channel_id)"
              
              # Create Port entity using API call
              entity_payload=$(echo "$channel" | jq '{
                identifier: .id,
                title: (.name_normalized // .name),
                properties: {
                  is_private: (.is_private // false),
                  purpose: (.purpose.value // ""),
                  context_team_id: (.context_team_id // ""),
                  is_shared: (.is_shared // false),
                  previous_names: (.previous_names // []),
                  creator: (.creator // ""),
                  createdAt: (.created // 0),
                  is_ext_shared: (.is_ext_shared // false),
                  is_group: (.is_group // false),
                  is_archived: (.is_archived // false),
                  num_members: (.num_members // 0),
                  topic: (.topic.value // ""),
                  shared_team_ids: (.shared_team_ids // []),
                  is_org_shared: (.is_org_shared // false)
                },
                relations: {
                  members: (.members // [])
                }
              }')
              
              # Get Port access token
              access_token=$(curl -s --location --request POST "https://api.getport.io/v1/auth/access_token" \
                --header "Content-Type: application/json" \
                --data-raw "{
                  \"clientId\": \"${{ secrets.PORT_CLIENT_ID }}\",
                  \"clientSecret\": \"${{ secrets.PORT_CLIENT_SECRET }}\"
                }" | jq -r '.accessToken')
              
              # Upsert entity to Port
              curl -s --location --request POST "https://api.getport.io/v1/blueprints/slack_channel/entities?upsert=true" \
                --header "Authorization: Bearer $access_token" \
                --header "Content-Type: application/json" \
                --data-raw "$entity_payload"
              
              echo "✓ Synced channel: $channel_name"
              counter=$((counter + 1))
              sleep 0.2  # Rate limiting
            done < channels_temp.json
            
            echo "✅ Successfully synced $channel_count Slack channels to Port"

        - name: Log Completion of Sync
          uses: port-labs/port-github-action@v1
          with:
            clientId: ${{ secrets.PORT_CLIENT_ID }}
            clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
            baseUrl: https://api.getport.io
            operation: PATCH_RUN
            runId: ${{ fromJson(inputs.port_context || '{}').run_id }}
            logMessage: "✅ Manual Slack channels sync completed successfully"
    ```

    </details>

   </TabItem>

  <TabItem value="automated" label="Automated sync">

    This approach uses Port's built-in automations to automatically sync data when events occur, without requiring manual intervention.

    <h3> Add Port secrets </h3>

    First, add your Slack bot token to Port's secrets:

    1. Click on the `...` button in the top right corner of your Port application.
    2. Click on **Credentials**.
    3. Click on the `Secrets` tab.
    4. Click on `+ Secret` and add the following secret:
       - `SLACK_BOT_TOKEN` - Your Slack bot token (starts with `xoxb-`)

    :::tip Slack bot token
    You can find your Slack bot token in your Slack app settings under "OAuth & Permissions". The token should start with `xoxb-`.
    :::


    <h3> Automation for new user creation </h3>

    Create an automation that triggers when a new Port user is created and looks up their Slack user data:

    1. Go to the [Actions & Automations](https://app.getport.io/actions-automations) page of your portal
    2. Click on `+ Automation`
    3. Click on the `Edit JSON` button in the top right corner
    4. Copy and paste the following automation configuration:

        <details>
        <summary><b>Sync Slack data on user creation automation (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "sync_slack_on_user_creation",
          "title": "Sync Slack Data on User Creation",
          "description": "Automatically sync Slack data when a new Port user is created",
          "icon": "Slack",
          "trigger": {
            "type": "automation",
            "event": {
              "type": "ENTITY_CREATED",
              "blueprintIdentifier": "_user"
            }
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://slack.com/api/users.lookupByEmail",
            "synchronized": true,
            "method": "POST",
            "headers": {
              "Authorization": "Bearer {{ .secrets.\"SLACK_BOT_TOKEN\" }}",
              "Content-Type": "application/x-www-form-urlencoded"
            },
            "body": {
              "email": "{{ .event.diff.after.identifier }}"
            }
          },
          "publish": true
        }
        ```

        </details>

    5. Click `Save` to create the automation.


    <h3> Create Slack user entity automation </h3>

    Create an automation that creates a Slack user entity when the lookup succeeds:

    1. Go to the [Actions & Automations](https://app.getport.io/actions-automations) page of your portal
    2. Click on `+ Automation`
    3. Click on the `Edit JSON` button in the top right corner
    4. Copy and paste the following automation configuration:

        <details>
        <summary><b>Create Slack user entity automation (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "create_slack_user_entity",
          "title": "Create Slack User Entity",
          "description": "Creates a Slack user entity when user lookup succeeds",
          "icon": "Slack",
          "trigger": {
            "type": "automation",
            "event": {
              "type": "RUN_UPDATED",
              "actionIdentifier": "sync_slack_on_user_creation"
            },
            "condition": {
              "type": "JQ",
              "expressions": [
                ".diff.after.status == \"SUCCESS\"",
                ".diff.after.response.ok == true"
              ],
              "combinator": "and"
            }
          },
          "invocationMethod": {
            "type": "UPSERT_ENTITY",
            "blueprintIdentifier": "slack_user",
            "mapping": {
              "identifier": "{{ .event.diff.after.response.user.id }}",
              "title": "{{ .event.diff.after.response.user.name }}",
              "properties": {
                "tz": "{{ .event.diff.after.response.user.tz }}",
                "is_restricted": "{{ .event.diff.after.response.user.is_restricted }}",
                "is_primary_owner": "{{ .event.diff.after.response.user.is_primary_owner }}",
                "real_name": "{{ .event.diff.after.response.user.real_name }}",
                "team_id": "{{ .event.diff.after.response.user.team_id }}",
                "is_admin": "{{ .event.diff.after.response.user.is_admin }}",
                "is_app_user": "{{ .event.diff.after.response.user.is_app_user }}",
                "deleted": "{{ .event.diff.after.response.user.deleted }}",
                "is_bot": "{{ .event.diff.after.response.user.is_bot }}",
                "email": "{{ .event.diff.after.response.user.profile.email }}"
              },
              "relations": {
                "user": "{{ .event.diff.after.response.user.profile.email }}"
              }
            }
          },
          "publish": true
        }
        ```

        </details>

    5. Click `Save` to create the automation.

  

   </TabItem>

</Tabs>

## Create Slack notification actions

Now you can create actions that leverage the Slack user mapping to send notifications:

### "Send Slack notification" action

Create an action that sends notifications to specific Slack users:

<details>
<summary><b>Send Slack notification action (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "send_slack_notification",
  "title": "Send Slack Notification",
  "description": "Send a notification to a specific user via Slack",
  "icon": "Slack",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "message": {
          "type": "string",
          "title": "Message",
          "description": "The message to send to the user"
        }
      },
      "required": ["message"]
    },
    "blueprintIdentifier": "slack_user"
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
      "channel": "{{ .entity.identifier }}",
      "text": "{{ .inputs.message }}",
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "{{ .inputs.message }}"
          }
        }
      ]
    }
  },
  "requiredApproval": false
}
```

</details>

### "Send Slack notification to channel" action

Create an action that sends notifications to specific Slack channels:

<details>
<summary><b>Send Slack notification to channel action (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "send_slack_channel_notification",
  "title": "Send Slack Channel Notification",
  "description": "Send a notification to a specific Slack channel",
  "icon": "Slack",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "message": {
          "type": "string",
          "title": "Message",
          "description": "The message to send to the channel"
        }
      },
      "required": ["message"]
    },
    "blueprintIdentifier": "slack_channel"
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
      "channel": "{{ .entity.identifier }}",
      "text": "{{ .inputs.message }}",
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "{{ .inputs.message }}"
          }
        }
      ]
    }
  },
  "requiredApproval": false
}
```

</details>

:::tip Slack bot token secret
Make sure to add your Slack bot token to Port secrets with the appropriate name referenced in the actions.
:::

## Test the integration

### Test manual sync

1. Go to the [self-service page](https://app.getport.io/self-serve) of your portal
2. If using the manual sync approach:
   - Execute the "Sync Slack Users" action
   - Execute the "Sync Slack Channels" action
3. Check that Slack user and channel entities are created in Port
4. Verify that channels are properly related to their creators (Slack users)

### Test automated sync

1. Create a new Port user entity with an email address that exists in your Slack workspace
2. Verify that the automation triggers and looks up the corresponding Slack user
3. Check that a Slack user entity is automatically created and linked to the Port user
4. Review the automation logs to see if the user was found and synced successfully

### Verify user mapping

1. Check that the automation creates corresponding Port user entities
2. Verify that the email addresses match between Slack and Port users
3. Confirm that the relationship between Slack users and Port users is established

### Test Slack app functionality

1. Mention `@Port` in a Slack channel where the app is installed
2. Ask a question about your resources, such as "Which services had incidents in the last 30 days?"
3. Verify that the app responds with relevant information

### Test notifications

1. Execute the "Send Slack notification" action for a Slack user
2. Verify that the user receives the notification in Slack
3. Test the channel notification action by sending a message to a Slack channel

## Possible enhancements

This guide provides a robust, event-driven setup for mapping Slack users to Port accounts. You can enhance the integration by:

- **Advanced event triggers**: Create automations for user updates, deletions, or other events
- **Error handling**: Add better error handling and retry logic to the workflows
- **Slack event webhooks**: Set up Slack webhooks to trigger Port syncing when users join/leave Slack
- **Multiple workspaces**: Handle multiple Slack workspaces within a single Port organization
- **Advanced notifications**: Create rich Slack messages with buttons, attachments, and interactive elements
- **Channel membership tracking**: Extend the workflows to sync channel membership data
- **Custom user matching**: Implement more sophisticated matching algorithms beyond email addresses
- **Bidirectional sync**: Sync changes from Port back to Slack when needed 
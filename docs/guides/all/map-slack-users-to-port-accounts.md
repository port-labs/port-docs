---
displayed_sidebar: null
description: Injest and map Slack users to their Port user accounts for seamless integration
---

# Ingest and map Slack users to Port user accounts

This guide demonstrates how to ingest Slack users into your Port software catalog and automatically map them to existing Port user accounts based on email addresses.

Once implemented users will be able to:
  - Maintain a complete inventory of all Slack users in your organization within Port.
  - Automatically link Slack users to their corresponding Port user accounts for seamless integration.
  - Provide visibility into which Slack users have Port accounts and which don't.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- You have a Slack workspace with admin permissions to create apps and generate bot tokens.
- You have permissions to create blueprints, self-service actions, and automations in Port.

## Set up data model

To represent Slack users in your portal, we need to create a Slack User blueprint that can store Slack user data and optionally link to Port user accounts.

<h3> Create the Slack User blueprint</h3>

1. Go to the [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following JSON schema:

    <details>
    <summary><b>Slack user blueprint (Click to expand)</b></summary>

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
            "title": "Email",
            "description": "The user's email address"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "user": {
          "title": "Port User",
          "target": "_user",
          "required": false,
          "many": false
        }
      }
    }
    ```

    </details>

5. Click on `Save` to create the blueprint.

<h3> Add Port secrets</h3>

First, add your Slack bot token to Port's secrets:

1. Click on the `...` button in the top right corner of your Port application.
2. Click on **Credentials**.
3. Click on the `Secrets` tab.
4. Click on `+ Secret` and add the following secret:
   - `SLACK_BOT_TOKEN` - Your Slack bot token with `users:read` and `users:read.email` scopes. [How to get the token](https://api.slack.com/authentication/token-types#bot)


## Set up webhook integration

We'll create a webhook integration that can ingest multiple Slack users at once and automatically establish relationships with existing Port users.
Follow the steps below to create the webhook integration:

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page.

2. Click on `+ Data Source`.

3. Select **Webhook** and click on **Custom integration**.

4. Name it "Slack Users Sync".

5. Copy the webhook URL - you'll need this for the automation.

6. Copy and paste the following mapping into the **Map the data from the external system into Port** field:

    <details>
    <summary><b>Slack users webhook mapping (Click to expand)</b></summary>

    ```json showLineNumbers
    [
      {
        "blueprint": "slack_user",
        "operation": "create",
        "filter": "(.body.response | has(\"members\")) and (.body.response.members | type == \"array\")",
        "itemsToParse": ".body.response.members | map(select(.deleted == false))",
        "entity": {
          "identifier": ".item.id | tostring",
          "title": ".item.name | tostring",
          "properties": {
            "tz": ".item.tz",
            "is_restricted": ".item.is_restricted",
            "is_primary_owner": ".item.is_primary_owner",
            "real_name": ".item.real_name",
            "team_id": ".item.team_id",
            "is_admin": ".item.is_admin",
            "is_app_user": ".item.is_app_user",
            "deleted": ".item.deleted",
            "is_bot": ".item.is_bot",
            "email": ".item.profile.email"
          },
          "relations": {
            "user": ".item.profile.email"
          }
        }
      }
    ]
    ```

    </details>

    :::info Relationship creation requirements
    **Important**: This webhook mapping will only successfully create Slack user entities for:
    - **Bot users** (regardless of whether they have email addresses)
    - **Human users who already exist as Port users** with matching email addresses

    Human users without corresponding Port user accounts will fail to be created due to the relationship mapping. If you want to ingest all Slack users regardless of Port user existence, temporarily remove the `relations` section from the mapping.
    :::

7. Click on `Save`.


## Set up automations

Now we'll create an automation that processes the Slack users list and sends it to the webhook for bulk ingestion.

<h4> Create automation to process Slack users</h4>

1. Go to the [Actions & Automations](https://app.getport.io/actions-automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following automation configuration:

    <details>
    <summary><b>Process Slack users automation (Click to expand)</b></summary>

    :::tip Replace the webhook URL
    Replace the webhook URL with the one you created in the previous step.
    :::

    ```json showLineNumbers
    {
      "identifier": "process_slack_users",
      "title": "Process Slack Users",
      "description": "Processes Slack users list and sends to webhook for bulk ingestion",
      "icon": "Slack",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "sync_slack_users"
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
        "type": "WEBHOOK",
        "url": "<YOUR_WEBHOOK_URL>",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "response": "{{ .event.diff.after.response }}"
        }
      },
      "publish": true
    }
    ```

    </details>

5. Click `Save` to create the automation.


<h4> Create automation to sync Slack users when a new Port user is added</h4>

To ensure new Port users get mapped to Slack users automatically, we'll create an automation that triggers when a new Port user is created.

Follow the steps below to create the automation:

1. Go to the [Actions & Automations](https://app.getport.io/actions-automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following automation configuration:

    <details>
    <summary><b>Automation to sync Slack users when a new Port user is added (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "trigger_sync_slack_users_on_user_created",
        "title": "Trigger sync_slack_users when user is created",
        "description": "Triggers the sync_slack_users self-service action when a new user entity is created.",
        "icon": "Slack",
        "trigger": {
            "type": "automation",
            "event": {
            "type": "ENTITY_CREATED",
            "blueprintIdentifier": "_user"
            },
            "condition": {
            "type": "JQ",
            "expressions": [],
            "combinator": "and"
            }
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://api.getport.io/v1/actions/sync_slack_users/runs",
            "agent": false,
            "synchronized": true,
            "method": "POST",
            "headers": {
            "RUN_ID": "{{ .run.id }}",
            "Content-Type": "application/json"
            },
            "body": {
            "properties": {}
            }
        },
        "publish": true
    }
    ```

    </details>

5. Click `Save` to create the automation.


## Set up self-service action

We'll create a self-service action that fetches Slack users and sends them to the webhook for processing.

Follow the steps below to create the action:

1. Go to the [Self-service](https://app.getport.io/self-serve) page.

2. Click on `+ Action`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following action configuration:

    <details>
    <summary><b>Sync Slack Users action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "sync_slack_users",
        "title": "Sync Slack Users",
        "icon": "Slack",
        "description": "Fetch and sync all Slack users to Port",
        "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
            "properties": {},
            "required": [],
            "order": []
            }
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://slack.com/api/users.list",
            "agent": false,
            "synchronized": true,
            "method": "GET",
            "headers": {
            "RUN_ID": "{{ .run.id }}",
            "Content-Type": "application/json",
            "Authorization": "Bearer {{ .secrets.SLACK_BOT_TOKEN}}"
            }
        },
        "requiredApproval": false
    }
    ```

    </details>

5. Click `Save` to create the action.



## Let's test it

1. Go to the [Self-service](https://app.getport.io/self-serve) page.

2. Find and execute the "Sync Slack Users" action.

3. Monitor the action execution in the [Actions & Automations](https://app.getport.io/actions-automations) page.

4. Verify that Slack users are created in your catalog with proper relationships.

## Conclusion

You've successfully ingested Slack users into your Port catalog and automatically mapped them to existing Port user accounts based on email addresses.

<img src="/img/guides/slackUserIngested.png" border="1px" />

<img src="/img/guides/slackMappedIngestedUser.png" border="1px" />


## Possible enhancements

- **Add Slack Channel blueprint**: Create a similar blueprint for Slack channels and ingest channel data along with user data
- **Create Slack-based notifications**: Build self-service actions that can send notifications to specific Slack users or channels
- **Add user status tracking**: Include properties to track when users were last active in Slack
- **Implement incremental sync**: Modify the sync action to only fetch users that have changed since the last sync
- **Add user role mapping**: Map Slack user roles (admin, owner, etc.) to Port user roles or teams
- **Create Slack user dashboards**: Build dashboards to visualize Slack user distribution and activity
- **Add Slack workspace information**: Include workspace-level data to support multiple Slack workspaces 
---
displayed_sidebar: null
description: Ingest and map Slack users to their Port user accounts for seamless integration
---

# Ingest and map Slack users to Port user accounts

This guide demonstrates how to ingest Slack users into your Port software catalog and automatically map them to existing Port user accounts.

We will leverage on Port's custom webhook integration, self-service actions and automations to ingest data from Slack and map them to Port user accounts.

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
      "relations": {}
    }
    ```

    </details>

5. Click on `Save` to create the blueprint.

<h3> Enhance the Port User blueprint</h3>

Now we need to enhance the Port User blueprint to add a relation to the Slack User blueprint and mirror properties to display Slack information.

1. Go to the [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Find the `User` blueprint and click on it.

3. Click on the `Edit JSON` button in the top right corner.

4. Add the following relation to the `relations` object:

    <details>
    <summary><b>Port User blueprint relation (Click to expand)</b></summary>

    ```json showLineNumbers
    "relations": {
      "slack_user": {
        "title": "Slack User",
        "target": "slack_user",
        "required": false,
        "many": false
      }
    }
    ```

    </details>

5. Add the following mirror property to the `mirrorProperties` object to display the Slack real name:

    <details>
    <summary><b>Port User blueprint mirror property (Click to expand)</b></summary>

    ```json showLineNumbers
    "mirrorProperties": {
      "slack_real_name": {
        "title": "Slack real name",
        "path": "slack_user.real_name"
      }
    }
    ```

    </details>

6. Click on `Save` to update the blueprint.

:::info Additional mirror properties
You can add more mirror properties to display other Slack user attributes like timezone (`slack_user.tz`), admin status (`slack_user.is_admin`), or any other property from the Slack User blueprint that would be useful for your organization.
:::



<h3> Add Port secrets</h3>

Now let's add your Slack bot token to Port's secrets:

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
            "relations": {}
            }
        },
        {
            "blueprint": "slack_user",
            "operation": "create",
            "filter": ".body.response.user != null",
            "entity": {
            "identifier": ".body.response.user.id | tostring",
            "title": ".body.response.user.name | tostring",
            "properties": {
                "tz": ".body.response.user.tz",
                "is_restricted": ".body.response.user.is_restricted",
                "is_primary_owner": ".body.response.user.is_primary_owner",
                "real_name": ".body.response.user.real_name",
                "team_id": ".body.response.user.team_id",
                "is_admin": ".body.response.user.is_admin",
                "is_app_user": ".body.response.user.is_app_user",
                "deleted": ".body.response.user.deleted",
                "is_bot": ".body.response.user.is_bot",
                "email": ".body.response.user.profile.email"
            },
            "relations": {}
            }
        }
    ]
    ```
    </details>

7. Click on `Save`.


## Set up self-service actions

We'll create three self-service actions in this section, one for fetching Slack users and another for fetching a Slack user via email for the automation and webhook to ingest data and the last one is used to set up automatic discovery to properly link the Port user entities to their corresponding Slack user entities using the **identifier** of the Slack user entity.


<h3> Sync Slack Users self-service action</h3>

This action fetches all Slack users and send them to the [process Slack users automation](#create-automation-to-bulk-ingest-slack-users) for processing.
The automation will then send the response to the webhook for ingestion.

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
        },
        "body": {}
      },
      "requiredApproval": false
    }
    ```

    </details>

5. Click `Save` to create the action.

<h3> Get Slack user by email self-service action</h3>

This action fetches a single **Slack** user by email and send the response to a [process single slack user automation](#create-automation-to-process-single-slack-user) for processing.
The automation will then send the response to the webhook for ingestion.

Follow the steps below to create the action:

1. Go to the [Self-service](https://app.getport.io/self-serve) page.

2. Click on `+ Action`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following action configuration:

    <details>
    <summary><b>Get Slack user by email action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "get_single_slack_user",
      "title": "Get Slack User by Email",
      "icon": "Slack",
      "description": "Fetch a Slack user to Port",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "email": {
              "icon": "DefaultProperty",
              "type": "string",
              "title": "Email of user",
              "description": "Email of the slack user"
            }
          },
          "required": [],
          "order": [
            "email"
          ]
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://slack.com/api/users.lookupByEmail?email={{ .inputs.email }}",
        "synchronized": true,
        "method": "GET",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json",
          "Authorization": "Bearer {{ .secrets.SLACK_BOT_TOKEN}}"
        },
        "body": {}
      },
      "requiredApproval": false
    }
    ```

    </details>

5. Click `Save` to create the action.

<h3> Port User-Slack User discovery self-service action</h3>

This action set's up automatic discovery to properly link the Port user entities to their corresponding Slack user entities using the **identifier** of the Slack user entity.

Follow the steps below to create the action:

1. Go to the [Self-service](https://app.getport.io/self-serve) page.

2. Click on `+ Action`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following action configuration:

    <details>
    <summary><b>User-Slack discovery action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "update_user_slack_relation_identifier",
      "title": "Link Port User to Slack User",
      "icon": "Slack",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "slack_user_id": {
              "icon": "DefaultProperty",
              "type": "string",
              "title": "slack_user_id"
            },
            "email": {
              "icon": "DefaultProperty",
              "type": "string",
              "title": "email"
            }
          },
          "required": [],
          "order": [
            "slack_user_id",
            "email"
          ]
        },
        "actionCardButtonText": "Sync",
        "executeActionButtonText": "Sync",
        "blueprintIdentifier": "_user"
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "_user",
        "mapping": {
          "identifier": "{{.inputs.email}}",
          "relations": {
            "slack_user": "{{.inputs.slack_user_id}}"
          }
        }
      },
      "requiredApproval": false
    }
    ```

    </details>

5. Click `Save` to create the action.


## Set up automations

Now we'll create the automations that process the Slack users list and sends the response to the webhook for bulk ingestion and single user ingestion.

<h3> Create automation to bulk ingest Slack users</h3>

This automation will trigger when the [Sync Slack Users](#sync-slack-users-self-service-action) action is executed.
It will then process the Slack users list and send the response to the webhook for bulk ingestion.

Follow the steps below to create the automation:

1. Go to the [Automations](https://app.getport.io/settings/automations) page of your portal.

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

<h3> Create automation to process single Slack user</h3>

This automation will trigger when the [Get Slack user by email](#get-slack-user-by-email-self-service-action) action is executed.
It will then process the Slack user and send the response to the webhook for single user ingestion.

Follow the steps below to create the automation:

1. Go to the [Automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following automation configuration:

    <details>
    <summary><b>Process single Slack user automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "process_single_slack_user",
      "title": "Process Single Slack Users",
      "description": "Processes Slack user and sends to webhook for ingestion",
      "icon": "Slack",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "get_single_slack_user"
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


<h3> Create automation for automatic user-Slack discovery</h3>

This automation will trigger when a new Slack user is created and automatically link them to the corresponding Port user based on email address.

Follow the steps below to create the automation:

1. Go to the [Automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following automation configuration:

    <details>
    <summary><b>Automatic user-Slack discovery automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "sync_with_the_port_users_for_slack",
      "title": "Auto-link Port Users with Slack Users",
      "description": "Automatically creates relationships between Port users and Slack users when a new Slack user is created",
      "icon": "Slack",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_CREATED",
          "blueprintIdentifier": "slack_user"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.properties.email != null"
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/actions/update_user_slack_relation_identifier/runs",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "entity": ".event.diff.after.properties.email",
          "properties": {
            "slack_user_id": "{{ .event.diff.after.identifier }}",
            "email": "{{ .event.diff.after.properties.email }}"
          }
        }
      },
      "publish": true
    }
    ```

    </details>

5. Click `Save` to create the automation.


<h3> Create automation to sync Slack users when a new Port user is added</h3>

To ensure new Port users get mapped to Slack users automatically, we'll create an automation that triggers when a new Port user is created.
This automation will trigger the [Get Slack user by email](#get-slack-user-by-email-self-service-action) action to fetch details of the Slack user by email and trigger the [process single slack user automation](#create-automation-to-process-single-slack-user) for processing.

Follow the steps below to create the automation:

1. Go to the [Automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following automation configuration:

    <details>
    <summary><b>Automation to sync Slack users when a new Port user is added (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "ingest_slack_user",
      "title": "Trigger slack_user ingestion automation",
      "description": "This will call the webhook endpoint to ingest a single slack user",
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
        "url": "https://api.getport.io/v1/actions/get_single_slack_user/runs",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "properties": {
            "email": "{{ .event.diff.after.identifier }}"
          }
        }
      },
      "publish": true
    }
    ```

    </details>

5. Click `Save` to create the automation.




## Let's test it

1. Go to the [Self-service](https://app.getport.io/self-serve) page.

2. Find the "Sync Slack Users" action.

3. Click `Execute`.

4. Monitor the action execution in the [Audit logs](https://app.getport.io/settings/AuditLog?activeTab=5) page.

5. Verify that Slack users are created in your catalog with proper relationships.

6. Verify that the Slack user is created in your catalog with proper relationships.

## Conclusion

You've successfully ingested Slack users into your Port catalog and automatically mapped them to existing Port user accounts based on email addresses.


## Related guides

- [Slack application](https://docs.port.io/ai-agents/slack-app)
- [Send Slack message](https://docs.port.io/actions-and-automations/setup-backend/send-slack-message)

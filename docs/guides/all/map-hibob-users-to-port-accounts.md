---
displayed_sidebar: null
description: Ingest and map HiBob users to their Port user accounts for seamless integration
---

# Ingest and map HiBob users to Port user accounts

This guide demonstrates how to ingest HiBob users into your Port software catalog and automatically map them to existing Port user accounts based on email addresses.

We will leverage on Port's custom webhook integration, self-service actions and automations to ingest data from HiBob and map them to Port user accounts.

Once implemented users will be able to:
  - Maintain a complete inventory of all HiBob users in your organization within Port.
  - Automatically link HiBob users to their corresponding Port user accounts for seamless integration.
  - Provide visibility into which HiBob users have Port accounts and which don't.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- You have a HiBob instance with admin permissions to create service users and configure permissions. [Learn about HiBob API Service Users](https://apidocs.hibob.com/docs/api-service-users).
- You have created a HiBob service user with appropriate permissions to access employee data via the People search API.
- You have permissions to create blueprints, self-service actions, and automations in Port.

## Set up data model

To represent HiBob users in your portal, we need to create a HiBob User blueprint that can store HiBob user data and optionally link to Port user accounts.

<h3> Create the HiBob User blueprint</h3>

1. Go to the [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following JSON schema:

    <details>
    <summary><b>HiBob user blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "hibob_user",
      "description": "HiBob User",
      "title": "HiBob User",
      "icon": "User",
      "schema": {
        "properties": {
          "id": {
            "type": "string",
            "title": "ID",
            "description": "The user's unique identifier"
          },
          "displayName": {
            "type": "string",
            "title": "Display Name",
            "description": "The user's display name"
          },
          "firstName": {
            "type": "string",
            "title": "First Name",
            "description": "The user's first name"
          },
          "surname": {
            "type": "string",
            "title": "Last Name",
            "description": "The user's last name"
          },
          "email": {
            "type": "string",
            "title": "Email",
            "description": "The user's email address"
          },
          "companyId": {
            "type": "string",
            "title": "Company ID",
            "description": "The user's company identifier"
          },
          "state": {
            "type": "string",
            "title": "State",
            "description": "The user's employment state"
          },
          "avatarUrl": {
            "type": "string",
            "title": "Avatar URL",
            "description": "URL to the user's avatar image"
          },
          "coverImageUrl": {
            "type": "string",
            "title": "Cover Image URL",
            "description": "URL to the user's cover image"
          },
          "fullName": {
            "type": "string",
            "title": "Full Name",
            "description": "The user's full name"
          },
          "creationDate": {
            "type": "string",
            "title": "Creation Date",
            "description": "When the user was created"
          },
          "creationDatetime": {
            "type": "string",
            "title": "Creation DateTime",
            "description": "When the user was created (with time)"
          },
          "isManager": {
            "type": "boolean",
            "title": "Is Manager",
            "description": "Indicates if the user is a manager"
          },
          "durationOfEmployment": {
            "type": "string",
            "title": "Duration of Employment",
            "description": "How long the user has been employed"
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

Now we need to enhance the Port User blueprint to add a relation to the HiBob User blueprint and mirror properties to display HiBob information.

1. Go to the [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Find the `User` blueprint and click on it.

3. Click on the `Edit JSON` button in the top right corner.

4. Add the following relation to the `relations` object:

    <details>
    <summary><b>Port User blueprint relation (Click to expand)</b></summary>

    ```json showLineNumbers
    "relations": {
      "hibob_user": {
        "title": "HiBob User",
        "target": "hibob_user",
        "required": false,
        "many": false
      }
    }
    ```

    </details>

5. Add the following mirror property to the `mirrorProperties` object to display the HiBob display name:

    <details>
    <summary><b>Port User blueprint mirror property (Click to expand)</b></summary>

    ```json showLineNumbers
    "mirrorProperties": {
      "hibob_display_name": {
        "title": "HiBob display name",
        "path": "hibob_user.displayName"
      }
    }
    ```

    </details>

6. Click on `Save` to update the blueprint.

:::info Additional mirror properties
You can add more mirror properties to display other HiBob user attributes like full name (`hibob_user.fullName`), manager status (`hibob_user.isManager`), or any other property from the HiBob User blueprint that would be useful for your organization.
:::

<h3> Add Port secrets</h3>

Now let's add your HiBob credentials to Port's secrets:

1. Click on the `...` button in the top right corner of your Port application.
2. Click on **Credentials**.
3. Click on the `Secrets` tab.
4. Click on `+ Secret` and add the following secrets:
   - `HIBOB_API_URL` - Your HiBob API base URL (e.g., https://api.hibob.com/v1)
   - `HIBOB_SERVICE_USER_ID` - Your HiBob service user ID
   - `HIBOB_SERVICE_USER_TOKEN` - Your HiBob service user token

:::info HiBob Authentication
HiBob uses service user authentication with both an ID and token. You'll need to create a service user in HiBob with appropriate permissions to access employee data. Learn more about [creating HiBob service users](https://apidocs.hibob.com/docs/api-service-users).
:::


## Set up webhook integration

We'll create a webhook integration that can ingest multiple HiBob users at once and automatically establish relationships with existing Port users.

Follow the steps below to create the webhook integration:

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page.

2. Click on `+ Data Source`.

3. Select **Webhook** and click on **Custom integration**.

4. Name it "HiBob Users Sync".

5. Copy the webhook URL - you'll need this for the automation.

6. Copy and paste the following mapping into the **Map the data from the external system into Port** field:

    <details>
    <summary><b>HiBob users webhook mapping (Click to expand)</b></summary>

    ```json showLineNumbers
    [
        {
            "blueprint": "hibob_user",
            "operation": "create",
            "filter": "(.body.response | has(\"employees\")) and (.body.response.employees | type == \"array\")",
            "itemsToParse": ".body.response.employees | map(select(.state != \"inactive\"))",
            "entity": {
                "identifier": ".item.id | tostring",
                "title": ".item.displayName | tostring",
                "properties": {
                    "id": ".item.id",
                    "displayName": ".item.displayName",
                    "firstName": ".item.firstName",
                    "surname": ".item.surname",
                    "email": ".item.email",
                    "companyId": ".item.companyId",
                    "state": ".item.state",
                    "avatarUrl": ".item.avatarUrl",
                    "coverImageUrl": ".item.coverImageUrl",
                    "fullName": ".item.fullName",
                    "creationDate": ".item.creationDate",
                    "creationDatetime": ".item.creationDatetime",
                    "isManager": ".item.work.isManager",
                    "durationOfEmployment": ".item.work.durationOfEmployment.humanize"
                }
            }
        },
        {
            "blueprint": "_user",
            "operation": "create",
            "filter": "(.body.response | has(\"employees\")) and (.body.response.employees | type == \"array\")",
            "itemsToParse": ".body.response.employees | map(select(.state != \"inactive\" and .email != null))",
            "entity": {
                "identifier": ".item.email",
                "relations": {
                    "hibob_user": ".item.id | tostring"
                }
            }
        },
        {
            "blueprint": "hibob_user",
            "operation": "create",
            "filter": ".body.response.employee != null",
            "entity": {
                "identifier": ".body.response.employee.id | tostring",
                "title": ".body.response.employee.displayName | tostring",
                "properties": {
                    "id": ".body.response.employee.id",
                    "displayName": ".body.response.employee.displayName",
                    "firstName": ".body.response.employee.firstName",
                    "surname": ".body.response.employee.surname",
                    "email": ".body.response.employee.email",
                    "companyId": ".body.response.employee.companyId",
                    "state": ".body.response.employee.state",
                    "avatarUrl": ".body.response.employee.avatarUrl",
                    "coverImageUrl": ".body.response.employee.coverImageUrl",
                    "fullName": ".body.response.employee.fullName",
                    "creationDate": ".body.response.employee.creationDate",
                    "creationDatetime": ".body.response.employee.creationDatetime",
                    "isManager": ".body.response.employee.work.isManager",
                    "durationOfEmployment": ".body.response.employee.work.durationOfEmployment.humanize"
                }
            }
        },
        {
            "blueprint": "_user",
            "operation": "create",
            "filter": ".body.response.employee != null and .body.response.employee.email != null",
            "entity": {
                "identifier": ".body.response.employee.email",
                "relations": {
                    "hibob_user": ".body.response.employee.id | tostring"
                }
            }
        }
    ]
    ```

    </details>

7. Click on `Save`.

:::info Port User creation
When the webhook processes HiBob users, it will automatically create Port User entities for any HiBob users that don't already exist in your Port organization. These newly created Port users will have a `Disabled` status by default, meaning they won't receive email invitations and won't be able to access Port until an admin manually activates their accounts.
:::


## Set up self-service actions

We'll create two self-service actions in this section, one for fetching HiBob users and another for fetching a HiBob user via email for the automation and webhook to ingest data.

<h3> Sync HiBob Users self-service action</h3>

This action fetches all HiBob users and send them to the [process HiBob users automation](#create-automation-to-bulk-ingest-hibob-users) for processing.
The automation will then send the response to the webhook for ingestion.

Follow the steps below to create the action:

1. Go to the [Self-service](https://app.getport.io/self-serve) page.

2. Click on `+ Action`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following action configuration:

    <details>
    <summary><b>Sync HiBob Users action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "sync_hibob_users",
      "title": "Sync HiBob Users",
      "icon": "User",
      "description": "Fetch and sync all HiBob users to Port",
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
        "url": "{{ .secrets.HIBOB_API_URL }}/people",
        "agent": false,
        "synchronized": true,
        "method": "GET",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json",
          "Authorization": "Basic {{ .secrets.HIBOB_SERVICE_USER_ID }}:{{ .secrets.HIBOB_SERVICE_USER_TOKEN }}"
        },
        "body": {}
      },
      "requiredApproval": false
    }
    ```

    </details>

5. Click `Save` to create the action.

<h3> Get HiBob user by email self-service action</h3>

This action fetches a single **HiBob** user by email and send the response to a [process single hibob user automation](#create-automation-to-process-single-hibob-user) for processing.
The automation will then send the response to the webhook for ingestion.

Follow the steps below to create the action:

1. Go to the [Self-service](https://app.getport.io/self-serve) page.

2. Click on `+ Action`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following action configuration:

    <details>
    <summary><b>Get HiBob user by email action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "get_single_hibob_user",
      "title": "Get HiBob User by Email",
      "icon": "User",
      "description": "Fetch a HiBob user to Port",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "email": {
              "icon": "DefaultProperty",
              "type": "string",
              "title": "Email of user",
              "description": "Email of the hibob user"
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
        "url": "{{ .secrets.HIBOB_API_URL }}/people?email={{ .inputs.email }}",
        "synchronized": true,
        "method": "GET",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json",
          "Authorization": "Basic {{ .secrets.HIBOB_SERVICE_USER_ID }}:{{ .secrets.HIBOB_SERVICE_USER_TOKEN }}"
        },
        "body": {}
      },
      "requiredApproval": false
    }
    ```

    </details>

5. Click `Save` to create the action.


## Set up automations

Now we'll create the automations that process the HiBob users list and sends the response to the webhook for bulk ingestion and single user ingestion.

<h3> Create automation to bulk ingest HiBob users</h3>

This automation will trigger when the [Sync HiBob Users](#sync-hibob-users-self-service-action) action is executed.
It will then process the HiBob users list and send the response to the webhook for bulk ingestion.

Follow the steps below to create the automation:

1. Go to the [Automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following automation configuration:

    <details>
    <summary><b>Process HiBob users automation (Click to expand)</b></summary>

    :::tip Replace the webhook URL
    Replace the webhook URL with the one you created in the previous step.
    :::

    ```json showLineNumbers
    {
      "identifier": "process_hibob_users",
      "title": "Process HiBob Users",
      "description": "Processes HiBob users list and sends to webhook for bulk ingestion",
      "icon": "User",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "sync_hibob_users"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.status == \"SUCCESS\""
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

<h3> Create automation to process single HiBob user</h3>

This automation will trigger when the [Get HiBob user by email](#get-hibob-user-by-email-self-service-action) action is executed.
It will then process the HiBob user and send the response to the webhook for single user ingestion.

Follow the steps below to create the automation:

1. Go to the [Automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following automation configuration:

    <details>
    <summary><b>Process single HiBob user automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "process_single_hibob_user",
      "title": "Process Single HiBob Users",
      "description": "Processes HiBob user and sends to webhook for ingestion",
      "icon": "User",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "get_single_hibob_user"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.status == \"SUCCESS\""
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

<h3> Create automation to sync HiBob users when a new Port user is added</h3>

To ensure new Port users get mapped to HiBob users automatically, we'll create an automation that triggers when a new Port user is created.
This automation will trigger the [Get HiBob user by email](#get-hibob-user-by-email-self-service-action) action to fetch details of the HiBob user by email and trigger the [process single hibob user automation](#create-automation-to-process-single-hibob-user) for processing.

Follow the steps below to create the automation:

1. Go to the [Automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following automation configuration:

    <details>
    <summary><b>Automation to sync HiBob users when a new Port user is added (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "ingest_hibob_user",
      "title": "Trigger hibob_user ingestion automation",
      "description": "This will call the webhook endpoint to ingest a single hibob user",
      "icon": "User",
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
        "url": "https://api.getport.io/v1/actions/get_single_hibob_user/runs",
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

2. Find the "Sync HiBob Users" action.

3. Click `Execute`.

4. Monitor the action execution in the [Audit logs](https://app.getport.io/settings/AuditLog?activeTab=5) page.

5. Verify that HiBob users are created in your catalog with proper relationships.

6. Verify that the HiBob user is created in your catalog with proper relationships.

## Conclusion

You've successfully ingested HiBob users into your Port catalog and automatically mapped them to existing Port user accounts based on email addresses.


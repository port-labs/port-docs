---
displayed_sidebar: null
description: Learn how to manage and track PagerDuty on-call schedules across teams and services with dashboards and self-service actions.
---

import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'

# Manage PagerDuty on-call schedules

This guide demonstrates how to bring your on-call management experience into Port using PagerDuty. You will learn how to:

- Set up **self-service actions** to manage on-call schedules (view schedules, change on-call users, create overrides).
- Build **dashboards** in Port to visualize on-call coverage, rotation schedules, and team assignments.
- Track on-call engineers across different teams and services.

<img src="/img/guides/pagerDutyOnCallDashboard.png" border="1px" width="100%" />

## Common use cases

- **On-call visibility**: Get a centralized view of who's on-call across all teams and services.
- **Schedule management**: Easily change on-call assignments and create temporary overrides.
- **Team coordination**: Track on-call rotations and ensure proper coverage across services.
- **Escalation planning**: Visualize escalation policies and on-call hierarchies.
- **Burnout prevention**: Monitor on-call frequency and distribute responsibilities fairly.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [PagerDuty integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty) is installed in your account.
- Access to your PagerDuty organization with permissions to manage schedules and on-call assignments.

## Set up data model

If you haven't installed the [PagerDuty integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty), you'll need to create blueprints for PagerDuty schedules and users.  
However, we highly recommend you install the [PagerDuty integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty) to have these automatically set up for you.

### Create the PagerDuty Schedule blueprint

<details>
<summary>PagerDuty Schedule Blueprint</summary>

```json showLineNumbers
{
  "identifier": "pagerdutySchedule",
  "description": "This blueprint represents a PagerDuty schedule in our software catalog",
  "title": "PagerDuty Schedule",
  "icon": "pagerduty",
  "schema": {
    "properties": {
      "url": {
        "type": "string",
        "format": "url",
        "title": "Schedule URL"
      },
      "timezone": {
        "type": "string",
        "title": "Timezone"
      },
      "description": {
        "type": "string",
        "title": "Description"
      },
      "final_schedule": {
        "type": "object",
        "title": "Final Schedule"
      },
      "overrides_subschedule": {
        "type": "object",
        "title": "Overrides"
      },
      "created_at": {
        "title": "Created At",
        "type": "string",
        "format": "date-time"
      },
      "updated_at": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "pagerdutyService": {
      "title": "PagerDuty Service",
      "target": "pagerdutyService",
      "required": false,
      "many": true
    }
  }
}
```
</details>

### Create the PagerDuty User blueprint

<details>
<summary>PagerDuty User Blueprint</summary>

```json showLineNumbers
{
  "identifier": "pagerdutyUser",
  "description": "This blueprint represents a PagerDuty user in our software catalog",
  "title": "PagerDuty User",
  "icon": "pagerduty",
  "schema": {
    "properties": {
      "email": {
        "type": "string",
        "format": "email",
        "title": "Email"
      },
      "time_zone": {
        "type": "string",
        "title": "Time Zone"
      },
      "color": {
        "type": "string",
        "title": "Color"
      },
      "role": {
        "type": "string",
        "title": "Role"
      },
      "avatar_url": {
        "type": "string",
        "format": "url",
        "title": "Avatar URL"
      },
      "description": {
        "type": "string",
        "title": "Description"
      },
      "created_at": {
        "title": "Created At",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "pagerdutyTeam": {
      "title": "PagerDuty Team",
      "target": "pagerdutyTeam",
      "required": false,
      "many": true
    }
  }
}
```
</details>

## Set up self-service actions

Now let's set up self-service actions to manage your PagerDuty on-call schedules directly from Port. We'll implement key on-call management workflows using webhook-based actions.

### Add Port secrets

<ExistingSecretsCallout integration="PagerDuty" />

First, add the required secret to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secret:

   - `PAGERDUTY_API_KEY`: Your PagerDuty API token.

### View current on-call user

Get information about who is currently on-call for a specific schedule.

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration into the editor:

    <details>
    <summary><b>View current on-call user (click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "view_current_oncall",
        "title": "View current on-call user",
        "icon": "pagerduty",
        "description": "Get information about who is currently on-call for this schedule",
        "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
                "properties": {},
                "required": [],
                "order": []
            },
            "blueprintIdentifier": "pagerdutySchedule"
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://api.pagerduty.com/oncalls",
            "agent": false,
            "synchronized": true,
            "method": "GET",
            "headers": {
                "Content-Type": "application/json",
                "Accept": "application/vnd.pagerduty+json;version=2",
                "Authorization": "Token token={{.secrets.PAGERDUTY_API_KEY}}"
            },
            "query": {
                "schedule_ids[]": "{{.entity.identifier}}"
            }
        },
        "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

### Change on-call user

Change the current on-call assignment for a schedule by creating an override.

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Change on-call user (click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "change_oncall_user",
        "title": "Change on-call user",
        "icon": "pagerduty",
        "description": "Create an override to change the current on-call user",
        "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
                "properties": {
                    "user_id": {
                        "icon": "User",
                        "title": "New On-call User ID",
                        "description": "PagerDuty User ID to assign as on-call",
                        "type": "string"
                    },
                    "start_time": {
                        "icon": "DefaultProperty",
                        "title": "Start Time",
                        "description": "Override start time (ISO 8601 format)",
                        "type": "string",
                        "default": "{{.timestamp | strftime(\"%Y-%m-%dT%H:%M:%SZ\")}}"
                    },
                    "end_time": {
                        "icon": "DefaultProperty", 
                        "title": "End Time",
                        "description": "Override end time (ISO 8601 format)",
                        "type": "string"
                    },
                    "from": {
                        "icon": "User",
                        "title": "From",
                        "description": "Email address of the user making the request",
                        "type": "string",
                        "format": "user",
                        "default": {
                            "jqQuery": ".user.email"
                        }
                    }
                },
                "required": [
                    "user_id",
                    "start_time", 
                    "end_time",
                    "from"
                ],
                "order": [
                    "user_id",
                    "start_time",
                    "end_time", 
                    "from"
                ]
            },
            "blueprintIdentifier": "pagerdutySchedule"
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://api.pagerduty.com/schedules/{{.entity.identifier}}/overrides",
            "agent": false,
            "synchronized": true,
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Accept": "application/vnd.pagerduty+json;version=2",
                "Authorization": "Token token={{.secrets.PAGERDUTY_API_KEY}}",
                "From": "{{.inputs.from}}"
            },
            "body": {
                "override": {
                    "start": "{{.inputs.start_time}}",
                    "end": "{{.inputs.end_time}}",
                    "user": {
                        "id": "{{.inputs.user_id}}",
                        "type": "user_reference"
                    }
                }
            }
        },
        "requiredApproval": true
    }
    ```
    </details>

5. Click `Save`.

### List schedule overrides

View all current and upcoming overrides for a schedule.

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>List schedule overrides (click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "list_schedule_overrides",
        "title": "List schedule overrides",
        "icon": "pagerduty",
        "description": "View all current and upcoming overrides for this schedule",
        "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
                "properties": {
                    "since": {
                        "icon": "DefaultProperty",
                        "title": "Since",
                        "description": "Start date for override search (ISO 8601 format)",
                        "type": "string",
                        "default": "{{.timestamp | strftime(\"%Y-%m-%dT%H:%M:%SZ\")}}"
                    },
                    "until": {
                        "icon": "DefaultProperty",
                        "title": "Until", 
                        "description": "End date for override search (ISO 8601 format)",
                        "type": "string",
                        "default": "{{(.timestamp + 604800) | strftime(\"%Y-%m-%dT%H:%M:%SZ\")}}"
                    }
                },
                "required": [],
                "order": [
                    "since",
                    "until"
                ]
            },
            "blueprintIdentifier": "pagerdutySchedule"
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://api.pagerduty.com/schedules/{{.entity.identifier}}/overrides",
            "agent": false,
            "synchronized": true,
            "method": "GET",
            "headers": {
                "Content-Type": "application/json",
                "Accept": "application/vnd.pagerduty+json;version=2",
                "Authorization": "Token token={{.secrets.PAGERDUTY_API_KEY}}"
            },
            "query": {
                "since": "{{.inputs.since}}",
                "until": "{{.inputs.until}}"
            }
        },
        "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

### Delete schedule override

Remove an existing override from a schedule.

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Delete schedule override (click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "delete_schedule_override",
        "title": "Delete schedule override",
        "icon": "pagerduty",
        "description": "Remove an existing override from this schedule",
        "trigger": {
            "type": "self-service",
            "operation": "DELETE",
            "userInputs": {
                "properties": {
                    "override_id": {
                        "icon": "DefaultProperty",
                        "title": "Override ID",
                        "description": "ID of the override to delete",
                        "type": "string"
                    },
                    "from": {
                        "icon": "User",
                        "title": "From",
                        "description": "Email address of the user making the request",
                        "type": "string", 
                        "format": "user",
                        "default": {
                            "jqQuery": ".user.email"
                        }
                    }
                },
                "required": [
                    "override_id",
                    "from"
                ],
                "order": [
                    "override_id",
                    "from"
                ]
            },
            "blueprintIdentifier": "pagerdutySchedule"
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://api.pagerduty.com/schedules/{{.entity.identifier}}/overrides/{{.inputs.override_id}}",
            "agent": false,
            "synchronized": true,
            "method": "DELETE",
            "headers": {
                "Content-Type": "application/json",
                "Accept": "application/vnd.pagerduty+json;version=2",
                "Authorization": "Token token={{.secrets.PAGERDUTY_API_KEY}}",
                "From": "{{.inputs.from}}"
            }
        },
        "requiredApproval": true
    }
    ```
    </details>

5. Click `Save`.

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. **Test viewing current on-call user:**
   - Navigate to a PagerDuty Schedule in your catalog.
   - Click on `View current on-call user`.
   - Click `Execute`.
   - Review the response to see who is currently on-call.

3. **Test listing schedule overrides:**
   - Navigate to a PagerDuty Schedule in your catalog.
   - Click on `List schedule overrides`.
   - Optionally adjust the date range.
   - Click `Execute`.
   - Review any existing overrides for the schedule.

4. **Test changing on-call user:**
   - Navigate to a PagerDuty Schedule in your catalog.
   - Click on `Change on-call user`.
   - Fill in the required information:
     - New On-call User ID: PagerDuty user ID to assign
     - Start Time: When the override should begin
     - End Time: When the override should end
     - From: Your email address
   - Click `Execute`.

## Visualize on-call schedules

With your on-call management actions in place and data flowing, we can create a dedicated dashboard in Port to visualize on-call coverage, schedules, and team assignments.

### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.

2. Click on the **`+ New`** button in the left sidebar.

3. Select **New dashboard**.

4. Name the dashboard **PagerDuty On-call Management**.

5. Input `Monitor and manage your PagerDuty on-call schedules and assignments` under **Description**.

6. Select the `PagerDuty` icon.

7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our PagerDuty on-call data.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Schedules by timezone (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.

2. Title: `Schedules by timezone` (add the `PagerDuty` icon).

3. Choose the **PagerDuty Schedule** blueprint.

4. Under `Breakdown by property`, select the **Timezone** property.

5. Click `Save`.

</details>

<details>
<summary><b>Total schedules count (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.

2. Title: `Total schedules` (add the `Schedule` icon).

3. Select `Count entities` **Chart type** and choose **PagerDuty Schedule** as the **Blueprint**.

4. Select `count` for the **Function**.

5. Select `custom` as the **Unit** and input `schedules` as the **Custom unit**.

6. Click `Save`.

</details>

<details>
<summary><b>Recent schedule updates (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.

2. Title: `Schedules updated this week` (add the `Update` icon).

3. Select `Count entities` **Chart type** and choose **PagerDuty Schedule** as the **Blueprint**.

4. Select `count` for the **Function**.

5. Add this JSON to the **Additional filters** editor to filter schedules updated this week:
    ```json showLineNumbers
    [
        {
            "combinator": "and",
            "rules": [
                {
                    "property": "updated_at",
                    "operator": ">=",
                    "value": "{{(now - 604800) | strftime(\"%Y-%m-%dT%H:%M:%SZ\")}}"
                }
            ]
        }
    ]
    ```

6. Select `custom` as the **Unit** and input `schedules` as the **Custom unit**.

7. Click `Save`.

</details>

<details>
<summary><b>Users by role (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.

2. Title: `Users by role` (add the `User` icon).

3. Choose the **PagerDuty User** blueprint.

4. Under `Breakdown by property`, select the **Role** property.

5. Click `Save`.

</details>

<details>
<summary><b>Total users count (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.

2. Title: `Total users` (add the `User` icon).

3. Select `Count entities` **Chart type** and choose **PagerDuty User** as the **Blueprint**.

4. Select `count` for the **Function**.

5. Select `custom` as the **Unit** and input `users` as the **Custom unit**.

6. Click `Save`.

</details>

<details>
<summary><b>All schedules table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.

2. Title the widget **All Schedules**.

3. Choose the **PagerDuty Schedule** blueprint.

4. Click `Save` to add the widget to the dashboard.

5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.

6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Description**: Description of the schedule.
    - **Timezone**: The timezone of the schedule.
    - **Created At**: When the schedule was created.
    - **Updated At**: When the schedule was last updated.

7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

<details>
<summary><b>All users table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.

2. Title the widget **All Users**.

3. Choose the **PagerDuty User** blueprint.

4. Click `Save` to add the widget to the dashboard.

5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.

6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Email**: User's email address.
    - **Role**: User's role in PagerDuty.
    - **Time Zone**: User's timezone.
    - **Created At**: When the user account was created.

7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

## Related guides

- **[Manage and visualize your PagerDuty incidents](/guides/all/manage-and-visualize-pagerduty-incidents)**: Complete guide for incident management
- **[Change On-Call User](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-on-call-user)**: GitHub workflow for changing on-call assignments
- **[Create PagerDuty service](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/create-pagerduty-service)**: Create new PagerDuty services
- **[PagerDuty Integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty)**: Complete setup guide for PagerDuty integration 
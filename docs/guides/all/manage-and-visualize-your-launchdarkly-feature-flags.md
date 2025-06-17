---
displayed_sidebar: null
description: Learn how to manage and visualize your LaunchDarkly feature flags using dashboards and self-service actions in Port.
---

import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'

# Manage and visualize your LaunchDarkly feature flags

This guide demonstrates how to bring your LaunchDarkly feature flag management experience into Port. You will learn how to:

- Ingest LaunchDarkly data into Port's software catalog using **Port's LaunchDarkly** integration.
- Set up **self-service actions** to manage feature flags (create, toggle, and archive).
- Build **dashboards** in Port to monitor and take action on your feature flag resources.

<img src="/img/guides/launchDarklyDashboard1.png" border="1px" width="100%" />

<img src="/img/guides/launchDarklyDashboard2.png" border="1px" width="100%" />



## Common use cases

- Monitor the status and usage of all feature flags across projects from a single dashboard.
- Empower development teams to create and manage feature flags without direct LaunchDarkly access.
- Automate feature flag lifecycle management through self-service actions.
- Track temporary flags to ensure cleanup and technical debt reduction.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](/getting-started/overview).
- Access to your LaunchDarkly organization with permissions to manage feature flags.
- [LaunchDarkly API access token](https://docs.launchdarkly.com/home/account/api#access-tokens) with appropriate permissions.
- Optional - Install Port's [LaunchDarkly integration](/build-your-software-catalog/sync-data-to-catalog/feature-management/launchdarkly).

## Set up data model

If you haven't installed the [LaunchDarkly integration](/build-your-software-catalog/sync-data-to-catalog/feature-management/launchdarkly), you'll need to create blueprints for LaunchDarkly projects, environments, and feature flags.
However, we highly recommend you install the [LaunchDarkly integration](/build-your-software-catalog/sync-data-to-catalog/feature-management/launchdarkly) to have these automatically set up for you.

<h3>Create the LaunchDarkly project blueprint</h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>LaunchDarkly project blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "launchDarklyProject",
      "description": "This blueprint represents a project in LaunchDarkly.",
      "title": "LaunchDarkly Project",
      "icon": "Launchdarkly",
      "schema": {
        "properties": {
          "tags": {
            "type": "array",
            "title": "Tags",
            "items": {
              "type": "string"
            },
            "description": "Tags associated with the project for organizational purposes."
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

5. Click "Save" to create the blueprint.

<h3>Create the LaunchDarkly feature flag blueprint</h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>LaunchDarkly feature flag blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "launchDarklyFeatureFlag",
      "description": "This blueprint represents a feature flag in LaunchDarkly.",
      "title": "LaunchDarkly Feature Flag",
      "icon": "Launchdarkly",
      "schema": {
        "properties": {
          "kind": {
            "type": "string",
            "title": "Flag Kind",
            "description": "The type of the feature flag (e.g., boolean)."
          },
          "description": {
            "type": "string",
            "title": "Description",
            "description": "A description of what the flag controls."
          },
          "creationDate": {
            "type": "string",
            "format": "date-time",
            "title": "Creation Date",
            "description": "The date and time when the flag was created."
          },
          "clientSideAvailability": {
            "type": "object",
            "title": "Client-Side Availability",
            "description": "Availability of the flag for client-side applications."
          },
          "temporary": {
            "type": "boolean",
            "title": "Temporary Flag",
            "description": "Indicates if the flag is temporary."
          },
          "tags": {
            "type": "array",
            "title": "Tags",
            "items": {
              "type": "string"
            },
            "description": "Tags associated with the feature flag."
          },
          "maintainer": {
            "type": "string",
            "title": "Maintainer",
            "description": "Email address of the maintainer of the flag."
          },
          "customProperties": {
            "type": "object",
            "title": "Custom Properties",
            "description": "Custom properties associated with the flag."
          },
          "archived": {
            "type": "boolean",
            "title": "Archived",
            "description": "Indicates if the flag is archived."
          },
          "deprecated": {
            "type": "boolean",
            "title": "Deprecated",
            "description": "Indicates if the flag is deprecated."
          },
          "variations": {
            "type": "array",
            "title": "Variations",
            "description": "An array of possible variations for the flag"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "project": {
          "title": "Project",
          "target": "launchDarklyProject",
          "required": true,
          "many": false
        }
      }
    }
    ```
    </details>

5. Click "Save" to create the blueprint.

<h3>Create the LaunchDarkly environment blueprint</h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>LaunchDarkly environment blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "launchDarklyEnvironment",
      "description": "This blueprint represents an environment in LaunchDarkly",
      "title": "LaunchDarkly Environment",
      "icon": "Launchdarkly",
      "schema": {
        "properties": {
          "defaultTtl": {
            "type": "number",
            "title": "Default TTL",
            "description": "The default time-to-live (in minutes) for feature flag settings in this environment."
          },
          "secureMode": {
            "type": "boolean",
            "title": "Secure Mode",
            "description": "Indicates whether Secure Mode is enabled for the environment, enhancing security by verifying user tokens."
          },
          "defaultTrackEvents": {
            "type": "boolean",
            "title": "Default Track Events",
            "description": "Indicates whether event tracking is enabled by default for all flags in this environment."
          },
          "requireComments": {
            "type": "boolean",
            "title": "Require Comments",
            "description": "Indicates whether comments are required for changes made in this environment."
          },
          "confirmChanges": {
            "type": "boolean",
            "title": "Confirm Changes",
            "description": "Indicates whether changes need to be confirmed before being applied in this environment."
          },
          "tags": {
            "type": "array",
            "title": "Tags",
            "description": "A list of tags associated with the environment for organizational purposes."
          },
          "critical": {
            "type": "boolean",
            "title": "Critical Environment",
            "description": "Indicates whether this environment is considered critical, which may affect change management and notifications."
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "project": {
          "title": "Project",
          "target": "launchDarklyProject",
          "required": true,
          "many": false
        }
      }
    }
    ```
    </details>

5. Click "Save" to create the blueprint.

## Set up self-service actions

Now let us create self-service actions to manage your LaunchDarkly feature flags directly from Port using synced webhooks. You will implement workflows to:

1. Create a new feature flag.
2. Toggle a feature flag in an environment.
3. Archive a feature flag.

To implement these use-cases, follow the steps below:

<h3>Add Port secrets</h3>

<ExistingSecretsCallout integration="LaunchDarkly" />

To add these secrets to your portal:

1. Click on the `...` button in the top right corner of your Port application.
2. Click on **Credentials**.
3. Click on the `Secrets` tab.
4. Click on `+ Secret` and add the following secrets:
   - `LAUNCHDARKLY_ACCESS_TOKEN`: Your LaunchDarkly API access token

:::info API token requirements
Make sure your LaunchDarkly API token has the following permissions:
- **Writer** role or **Admin** role.
- Access to the projects where you want to create/manage flags.
- The token should be a **Personal API Access Token** or **Service Token** with `createFlag`, `updateFlag`, and `deleteFlag` permissions.
:::

### Create a new feature flag

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Create feature flag action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "create_launchdarkly_feature_flag",
      "title": "Create Feature Flag",
      "icon": "Launchdarkly",
      "description": "Create a new feature flag in LaunchDarkly",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "project": {
              "title": "Project",
              "description": "LaunchDarkly project to create the flag in",
              "type": "string",
              "blueprint": "launchDarklyProject",
              "format": "entity"
            },
            "flag_key": {
              "title": "Flag Key",
              "description": "Unique key for the feature flag",
              "type": "string"
            },
            "flag_name": {
              "title": "Flag Name",
              "description": "Human-readable name for the feature flag",
              "type": "string"
            },
            "flag_description": {
              "title": "Description",
              "description": "Description of what this flag controls",
              "type": "string"
            },
            "temporary": {
              "title": "Temporary Flag",
              "description": "Whether this is a temporary flag",
              "type": "boolean",
              "default": false
            },
            "tags": {
              "title": "Tags",
              "description": "Comma-separated list of tags",
              "type": "string"
            }
          },
          "required": [
            "project",
            "flag_key",
            "flag_name"
          ],
          "order": [
            "project",
            "flag_key",
            "flag_name",
            "flag_description",
            "temporary",
            "tags"
          ]
        },
        "blueprintIdentifier": "launchDarklyFeatureFlag"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://app.launchdarkly.com/api/v2/flags/{{.inputs.project.identifier}}",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Authorization": "{{.secrets.LAUNCHDARKLY_ACCESS_TOKEN}}",
          "Content-Type": "application/json"
        },
        "body": {
          "key": "{{.inputs.flag_key}}",
          "name": "{{.inputs.flag_name}}",
          "description": "{{.inputs.flag_description}}",
          "temporary": "{{.inputs.temporary}}",
          "tags": "{{.inputs.tags | split(\",\") | map(. | trim)}}"
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Create Feature Flag` action in the self-service page. 🎉

### Toggle a feature flag

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Toggle feature flag action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "toggle_launchdarkly_feature_flag",
      "title": "Toggle Feature Flag",
      "icon": "Launchdarkly",
      "description": "Toggle a feature flag on or off in a specific environment",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "environment": {
              "title": "Environment",
              "description": "Environment to toggle the flag in",
              "type": "string",
              "blueprint": "launchDarklyEnvironment",
              "format": "entity",
              "dataset": {
                "combinator": "and",
                "rules": [
                  {
                    "operator": "relatedTo",
                    "blueprint": "launchDarklyProject",
                    "value": {
                      "jqQuery": ".entity.relations.project"
                    }
                  }
                ]
              }
            },
            "enabled": {
              "title": "Enable Flag",
              "description": "Whether to enable or disable the flag",
              "type": "boolean"
            }
          },
          "required": [
            "environment"
          ],
          "order": [
            "environment",
            "enabled"
          ]
        },
        "blueprintIdentifier": "launchDarklyFeatureFlag"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://app.launchdarkly.com/api/v2/flags/{{.entity.relations.project}}/{{.entity.identifier | sub(\"-[^-]+$\"; \"\")}}",
        "agent": false,
        "synchronized": true,
        "method": "PATCH",
        "headers": {
          "Authorization": "{{.secrets.LAUNCHDARKLY_ACCESS_TOKEN}}",
          "Content-Type": "application/json"
        },
        "body": [
          {
            "op": "replace",
            "path": "/environments/{{.inputs.environment.identifier | sub(\"-[^-]+$\"; \"\")}}/on",
            "value": "{{.inputs.enabled}}"
          }
        ]
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Toggle Feature Flag` action in the self-service page. 🎉

### Archive a feature flag

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Archive feature flag action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "archive_launchdarkly_feature_flag",
      "title": "Archive Feature Flag",
      "icon": "Launchdarkly",
      "description": "Archive a feature flag in LaunchDarkly",
      "trigger": {
        "type": "self-service",
        "operation": "DELETE",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "launchDarklyFeatureFlag"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://app.launchdarkly.com/api/v2/flags/{{.entity.relations.project}}/{{.entity.identifier | sub(\"-[^-]+$\"; \"\")}}",
        "agent": false,
        "synchronized": true,
        "method": "PATCH",
        "headers": {
          "Authorization": "{{.secrets.LAUNCHDARKLY_ACCESS_TOKEN}}",
          "Content-Type": "application/json"
        },
        "body": {
          "patch": [
            {
              "op": "replace",
              "path": "/archived",
              "value": true
            }
          ]
        }
      },
      "requiredApproval": true
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Archive Feature Flag` action in the self-service page. 🎉

<h3>Create automations to update entities</h3>

To keep your catalog updated with the latest flag information, create an automation to update the feature flag entities in Port after each action completes successfully.   

You do not need to create an automation if you have installed the [LaunchDarkly Port integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/feature-management/launchdarkly/), the entities will be updated automatically.

<h4>Automation for create flag action</h4>

1. Head to the [automation](https://app.getport.io/settings/automations) page.
2. Click on the `+ Automation` button.
3. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Create feature flag automation (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "launchDarklyFeatureFlag_sync_created_flag",
      "title": "Sync Created Feature Flag",
      "description": "Update Port with created feature flag data",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "create_launchdarkly_feature_flag"
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
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "launchDarklyFeatureFlag",
        "mapping": {
          "identifier": "{{.event.diff.after.response.key}}-{{.event.diff.after.properties.project.identifier}}",
          "title": "{{.event.diff.after.response.name}}",
          "properties": {
            "kind": "{{.event.diff.after.response.kind}}",
            "description": "{{.event.diff.after.response.description}}",
            "creationDate": "{{(.event.diff.after.response.creationDate / 1000) | strftime(\"%Y-%m-%dT%H:%M:%SZ\")}}",
            "clientSideAvailability": "{{.event.diff.after.response.clientSideAvailability}}",
            "temporary": "{{.event.diff.after.response.temporary}}",
            "tags": "{{.event.diff.after.response.tags}}",
            "maintainer": "{{.event.diff.after.response.maintainer}}",
            "customProperties": "{{.event.diff.after.response.customProperties}}",
            "archived": "{{.event.diff.after.response.archived}}",
            "deprecated": "{{.event.diff.after.response.deprecated}}",
            "variations": "{{.event.diff.after.response.variations}}"
          },
          "relations": {
            "project": "{{.event.diff.after.properties.project.identifier}}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>
  
4. Click "Save" to create the automation.

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. **Test creating a feature flag:**
   - Click on `Create Feature Flag`.
   - Fill in the required information:
     - Project: Your LaunchDarkly project.
     - Flag Key: A unique identifier (e.g., "new-checkout-flow")
     - Flag Name: A human-readable name (e.g., "New Checkout Flow")
     - Description: What the flag controls.
     - Set temporary flag if needed.
     - Add relevant tags.
   - Click `Execute`.

3. **Test toggling a feature flag:**
   - Click on `Toggle Feature Flag`.
   - Select an existing feature flag.
   - Choose the environment (production, staging, etc.)
   - Toggle the enabled input on or off.
   - Click `Execute`.

4. **Test archiving a feature flag:**
   - Click on `Archive Feature Flag`.
   - Select an existing feature flag.
   - Click `Execute`.

## Visualize metrics

With your feature flags synced and actions configured, we can create a dedicated dashboard in Port to monitor and manage LaunchDarkly feature flags using customizable widgets. In addition, you can trigger flag management actions directly from the dashboard.


### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.

2. Click on the **`+ New`** button in the left sidebar.

3. Select **New dashboard**.

4. Name the dashboard **LaunchDarkly Feature Flags**.

5. Input `Monitor and manage LaunchDarkly feature flags` under **Description**.

6. Select the `Launchdarkly` icon.

7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our LaunchDarkly feature flags.

### Add widgets

In the new dashboard, create the following widgets:


<details>
<summary><b>Total feature flags (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.

2. Title: `Total feature flags` (add the `Launchdarkly` icon).

3. Select `Count entities` **Chart type** and choose **LaunchDarkly Feature Flag** as the **Blueprint**.

4. Select `count` for the **Function**.

5. Select `custom` as the **Unit** and input `flags` as the **Custom unit**.

6. Click `Save`.

</details>

<details>
<summary><b>Create feature flag action (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Action card**.

2. Choose the **Create Feature Flag**, **Toggle Feature Flag**, and **Archive Feature Flag** actions we created in this guide.

3. Title: `Manage Feature Flags` (add the `Launchdarkly` icon).

4. Click `Save`.

</details>

<details>
<summary><b>Feature flags table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.

2. Title the widget **All Feature Flags**.

3. Choose the **LaunchDarkly Feature Flag** blueprint.

4. Click `Save` to add the widget to the dashboard.

5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.

6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
   - **Title**: The name of each feature flag.
   - **Description**: What the flag controls.
   - **Temporary Flag**: Whether the flag is temporary.
   - **Archived**: Whether the flag is archived.
   - **Tags**: Tags associated with the flag.
   - **Project**: The related LaunchDarkly project.
   
7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

<details>
<summary><b>Temporary vs permanent flags (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.

2. Title: `Temporary vs permanent flags` (add the `Launchdarkly` icon).

3. Choose the **LaunchDarkly Feature Flag** blueprint.

4. Under `Breakdown by property`, select **Temporary Flag** property.

5. Click `Save`.

</details>

<details>
<summary><b>Feature flags table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.

2. Title the widget **All Feature Flags by Project**.

3. Choose the **LaunchDarkly Feature Flag** blueprint.

4. Click `Save` to add the widget to the dashboard.

5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.

6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
   - **Title**: The name of each feature flag.
   - **Description**: What the flag controls.
   - **Temporary Flag**: Whether the flag is temporary.
   - **Archived**: Whether the flag is archived.
   - **Tags**: Tags associated with the flag.
   - **Project**: The related LaunchDarkly project.

7. Under the `Group by` section, select **Project** property.

8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>


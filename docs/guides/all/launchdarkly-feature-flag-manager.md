---
displayed_sidebar: null
description: Manage LaunchDarkly feature flags directly from Port - create, view, and toggle feature flags with ease using self-service actions.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LaunchDarkly feature flag manager

## Overview
This guide demonstrates how to build a comprehensive LaunchDarkly feature flag manager that allows you to create, view, and toggle feature flags directly from Port. 

You can implement these actions using:
1. **Synced webhooks**: A simpler approach that directly interacts with LaunchDarkly's API through Port
2. **GitHub workflows**: A flexible approach that allows for complex workflows and custom logic

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your LaunchDarkly organization with permissions to manage feature flags.
- [LaunchDarkly API access token](https://docs.launchdarkly.com/home/account/api#access-tokens) with appropriate permissions.
- [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed (required for GitHub Actions implementation).
- Optional - Install Port's [LaunchDarkly integration](/build-your-software-catalog/sync-data-to-catalog/feature-management/launchdarkly) 



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

## Implementation

<Tabs>
  <TabItem value="webhook" label="Synced webhook" default>

    You can manage LaunchDarkly feature flags by leveraging Port's **synced webhooks** and **secrets** to directly interact with LaunchDarkly's API. This method simplifies the setup by handling everything within Port.

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
    - **Writer** role or **Admin** role
    - Access to the projects where you want to create/manage flags
    - The token should be a **Personal API Access Token** or **Service Token** with `createFlag`, `updateFlag`, and `deleteFlag` permissions
    :::


    <h3>Set up self-service actions</h3>

    <h4>Create feature flag action</h4>

       1. Head to the [self-service](https://app.getport.io/self-serve) page.

       2. Click on the `+ Action` button.

       3. Click on the `{...} Edit JSON` button.
       
       4. Copy and paste the following JSON configuration:

            <details>
            <summary><b>Create LaunchDarkly feature flag (webhook) (click to expand)</b></summary>

            ```json showLineNumbers
            {
              "identifier": "create_launchdarkly_feature_flag_webhook",
              "title": "Create Feature Flag Webhook",
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
       
       5. Click "Save" to create the action.

    <h4>Toggle feature flag action</h4>

       1. Click on the `+ Action` button again.

       2. Click on the `{...} Edit JSON` button.

       3. Copy and paste the following JSON configuration:

            <details>
            <summary><b>Toggle LaunchDarkly feature flag (webhook) (click to expand)</b></summary>

            ```json showLineNumbers
            {
              "identifier": "toggle_launchdarkly_feature_flag_webhook",
              "title": "Toggle Feature Flag Webhook",
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
                      "format": "entity"
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

       5. Click "Save" to create the action.

       <h4>Archive feature flag action</h4>

       1. Click on the `+ Action` button again.

       2. Click on the `{...} Edit JSON` button.

       3. Copy and paste the following JSON configuration:

            <details>
            <summary><b>Archive LaunchDarkly feature flag (webhook) (click to expand)</b></summary>

            ```json showLineNumbers
            {
              "identifier": "archive_launchdarkly_feature_flag_webhook",
              "title": "Archive Feature Flag Webhook",
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

       5. Click "Save" to create the action.

       <h3>Create automations to update entities</h3>

       To keep your catalog updated with the latest flag information, create an automation to update the feature flag entities in Port after each action completes successfully.   

       You do not need to create an automation if you have installed the [LaunchDarkly Port integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/feature-management/launchdarkly/). The entities will be updated automatically.

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
                  "actionIdentifier": "create_launchdarkly_feature_flag_webhook"
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
                  "identifier": "{{.event.diff.after.response.key}}-{{.event.diff.after.inputs.project.identifier}}",
                  "title": "{{.event.diff.after.response.name}}",
                  "properties": {
                    "kind": "{{.event.diff.after.response.kind}}",
                    "description": "{{.event.diff.after.response.description}}",
                    "creationDate": "{{.event.diff.after.response.creationDate | todate}}",
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
                    "project": "{{.event.diff.after.inputs.project.identifier}}"
                  }
                }
              },
              "publish": true
            }
            ```
            </details>
          
        4. Click "Save" to create the automation.


   </TabItem>
   <TabItem value="github" label="GitHub workflow">

     To implement this use-case using GitHub workflow, follow these steps:

     <h3>Add GitHub secrets</h3>

     In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
     - `LAUNCHDARKLY_ACCESS_TOKEN` - Your LaunchDarkly API access token
     - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
     - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

     <h3>Add GitHub workflows</h3>
     
     We will create three workflows for creating, toggling, and archiving a feature flag.

     <h4>Create feature flag workflow</h4>

        Create the file `.github/workflows/create-feature-flag.yml` in the `.github/workflows` folder of your repository.

        <GithubDedicatedRepoHint/>

        <details>
        <summary><b>Create feature flag workflow (click to expand)</b></summary>

        ```yaml showLineNumbers
        name: Create LaunchDarkly Feature Flag
        on:
          workflow_dispatch:
            inputs:
              project_key:
                description: LaunchDarkly project key
                required: true
                type: string
              flag_key:
                description: Unique key for the feature flag
                required: true
                type: string
              flag_name:
                description: Human-readable name for the feature flag
                required: true
                type: string
              flag_description:
                description: Description of what this flag controls
                required: false
                type: string
              temporary:
                description: Whether this is a temporary flag
                required: false
                type: boolean
                default: false
              tags:
                description: Comma-separated list of tags
                required: false
                type: string
              port_context:
                required: true
                description: includes blueprint, run ID, and entity identifier from Port.

        jobs:
          create-feature-flag:
            runs-on: ubuntu-latest
            steps:
              - name: Log Executing Request to Create Feature Flag
                uses: port-labs/port-github-action@v1
                with:
                  clientId: ${{ secrets.PORT_CLIENT_ID }}
                  clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                  baseUrl: https://api.getport.io
                  operation: PATCH_RUN
                  runId: ${{fromJson(inputs.port_context).run_id}}
                  logMessage: "Creating feature flag in LaunchDarkly..."

              - name: Process Tags
                id: process_tags
                run: |
                  if [ -z "${{ inputs.tags }}" ] || [ "${{ inputs.tags }}" = "null" ]; then
                    echo "tags_array=[]" >> $GITHUB_OUTPUT
                  else
                    # Convert comma-separated tags to JSON array
                    tags_json=$(echo '${{ inputs.tags }}' | sed 's/,/","/g' | sed 's/^/"/' | sed 's/$/"/' | sed 's/^/[/' | sed 's/$/]/')
                    echo "tags_array=$tags_json" >> $GITHUB_OUTPUT
                  fi

              - name: Create Feature Flag
                id: create_flag
                uses: fjogeleit/http-request-action@v1
                with:
                  url: 'https://app.launchdarkly.com/api/v2/flags/${{ inputs.project_key }}'
                  method: 'POST'
                  customHeaders: '{"Content-Type": "application/json", "Authorization": "${{ secrets.LAUNCHDARKLY_ACCESS_TOKEN }}"}'
                  data: >-
                    {
                      "key": "${{ inputs.flag_key }}",
                      "name": "${{ inputs.flag_name }}",
                      "description": "${{ inputs.flag_description }}",
                      "temporary": ${{ inputs.temporary }},
                      "tags": ${{ steps.process_tags.outputs.tags_array }}
                    }

              - name: Log Create Feature Flag Request Failure 
                if: failure()
                uses: port-labs/port-github-action@v1
                with:
                  clientId: ${{ secrets.PORT_CLIENT_ID }}
                  clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                  baseUrl: https://api.getport.io
                  operation: PATCH_RUN
                  runId: ${{fromJson(inputs.port_context).run_id}}
                  logMessage: "Request to create feature flag failed"

              - name: Convert Timestamp to ISO Format
                if: steps.create_flag.outcome == 'success'
                id: convert_timestamp
                run: |
                  # Extract timestamp from response
                  creation_timestamp=$(echo '${{ steps.create_flag.outputs.response }}' | jq -r '.creationDate')
                  
                  # Convert Unix timestamp (milliseconds) to ISO 8601 format
                  if [ "$creation_timestamp" != "null" ] && [ "$creation_timestamp" != "" ]; then
                    creation_date=$(date -u -d "@$((creation_timestamp / 1000))" +"%Y-%m-%dT%H:%M:%SZ")
                    echo "creation_date_iso=$creation_date" >> $GITHUB_OUTPUT
                  else
                    echo "creation_date_iso=" >> $GITHUB_OUTPUT
                  fi

              - name: UPSERT Entity
                uses: port-labs/port-github-action@v1
                with:
                  identifier: "${{ fromJson(steps.create_flag.outputs.response).key }}-${{ inputs.project_key }}"
                  title: "${{ fromJson(steps.create_flag.outputs.response).name }}"
                  blueprint: ${{fromJson(inputs.port_context).blueprint}}
                  properties: |-
                    {
                      "kind": "${{ fromJson(steps.create_flag.outputs.response).kind }}",
                      "description": "${{ fromJson(steps.create_flag.outputs.response).description }}",
                      "creationDate": "${{ steps.convert_timestamp.outputs.creation_date_iso }}",
                      "clientSideAvailability": ${{ toJson(fromJson(steps.create_flag.outputs.response).clientSideAvailability) }},
                      "temporary": ${{ fromJson(steps.create_flag.outputs.response).temporary }},
                      "tags": ${{ toJson(fromJson(steps.create_flag.outputs.response).tags) }},
                      "maintainer": "${{ fromJson(steps.create_flag.outputs.response).maintainer }}",
                      "customProperties": ${{ toJson(fromJson(steps.create_flag.outputs.response).customProperties) }},
                      "archived": ${{ fromJson(steps.create_flag.outputs.response).archived }},
                      "deprecated": ${{ fromJson(steps.create_flag.outputs.response).deprecated }},
                      "variations": ${{ toJson(fromJson(steps.create_flag.outputs.response).variations) }}
                    }
                  relations: |-
                    {
                      "project": "${{ inputs.project_key }}"
                    }
                  clientId: ${{ secrets.PORT_CLIENT_ID }}
                  clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                  baseUrl: https://api.getport.io
                  operation: UPSERT
                  runId: ${{fromJson(inputs.port_context).run_id}}

              - name: Log After Upserting Entity
                uses: port-labs/port-github-action@v1
                with:
                  clientId: ${{ secrets.PORT_CLIENT_ID }}
                  clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                  baseUrl: https://api.getport.io
                  operation: PATCH_RUN
                  runId: ${{fromJson(inputs.port_context).run_id}}
                  logMessage: "Feature flag created successfully ✅"
        ```
        </details>

     <h4>Toggle feature flag workflow</h4>

        Create the file `.github/workflows/toggle-feature-flag.yml` in the `.github/workflows` folder of your repository.

        <details>
        <summary><b>Toggle feature flag workflow (click to expand)</b></summary>

        ```yaml showLineNumbers
        name: Toggle LaunchDarkly Feature Flag
        on:
          workflow_dispatch:
            inputs:
              project_key:
                description: LaunchDarkly project key
                required: true
                type: string
              flag_key:
                description: LaunchDarkly flag key (without project suffix)
                required: true
                type: string
              environment_key:
                description: Environment key (without project suffix)
                required: true
                type: string
              enabled:
                description: Whether to enable or disable the flag
                required: true
                type: boolean
              port_context:
                required: true
                description: includes blueprint, run ID, and entity identifier from Port.

        jobs:
          toggle-feature-flag:
            runs-on: ubuntu-latest
            steps:
              - name: Log Executing Request to Toggle Feature Flag
                uses: port-labs/port-github-action@v1
                with:
                  clientId: ${{ secrets.PORT_CLIENT_ID }}
                  clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                  baseUrl: https://api.getport.io
                  operation: PATCH_RUN
                  runId: ${{fromJson(inputs.port_context).run_id}}
                  logMessage: "Toggling feature flag in LaunchDarkly..."

              - name: Toggle Feature Flag
                id: toggle_flag
                uses: fjogeleit/http-request-action@v1
                with:
                  url: 'https://app.launchdarkly.com/api/v2/flags/${{ inputs.project_key }}/${{ inputs.flag_key }}'
                  method: 'PATCH'
                  customHeaders: '{"Content-Type": "application/json", "Authorization": "${{ secrets.LAUNCHDARKLY_ACCESS_TOKEN }}"}'
                  data: >-
                    [
                      {
                        "op": "replace",
                        "path": "/environments/${{ inputs.environment_key }}/on",
                        "value": ${{ inputs.enabled }}
                      }
                    ]

              - name: Log Toggle Feature Flag Request Failure 
                if: failure()
                uses: port-labs/port-github-action@v1
                with:
                  clientId: ${{ secrets.PORT_CLIENT_ID }}
                  clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                  baseUrl: https://api.getport.io
                  operation: PATCH_RUN
                  runId: ${{fromJson(inputs.port_context).run_id}}
                  logMessage: "Request to toggle feature flag failed"

              - name: Log After Toggling Flag
                uses: port-labs/port-github-action@v1
                with:
                  clientId: ${{ secrets.PORT_CLIENT_ID }}
                  clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                  baseUrl: https://api.getport.io
                  operation: PATCH_RUN
                  runId: ${{fromJson(inputs.port_context).run_id}}
                  logMessage: "Feature flag toggled successfully ✅"
        ```
        </details>

     <h4>Archive feature flag workflow</h4>

        Create the file `.github/workflows/archive-feature-flag.yml` in the `.github/workflows` folder of your repository.

        <details>
        <summary><b>Archive feature flag workflow (click to expand)</b></summary>

        ```yaml showLineNumbers
        name: Archive LaunchDarkly Feature Flag
        on:
          workflow_dispatch:
            inputs:
              project_key:
                description: LaunchDarkly project key
                required: true
                type: string
              flag_key:
                description: LaunchDarkly flag key (without project suffix)
                required: true
                type: string
              port_context:
                required: true
                description: includes blueprint, run ID, and entity identifier from Port.

        jobs:
          archive-feature-flag:
            runs-on: ubuntu-latest
            steps:
              - name: Log Executing Request to Archive Feature Flag
                uses: port-labs/port-github-action@v1
                with:
                  clientId: ${{ secrets.PORT_CLIENT_ID }}
                  clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                  baseUrl: https://api.getport.io
                  operation: PATCH_RUN
                  runId: ${{fromJson(inputs.port_context).run_id}}
                  logMessage: "Archiving feature flag in LaunchDarkly..."

              - name: Archive Feature Flag
                id: archive_flag
                uses: fjogeleit/http-request-action@v1
                with:
                  url: 'https://app.launchdarkly.com/api/v2/flags/${{ inputs.project_key }}/${{ inputs.flag_key }}'
                  method: 'PATCH'
                  customHeaders: '{"Content-Type": "application/json", "Authorization": "${{ secrets.LAUNCHDARKLY_ACCESS_TOKEN }}"}'
                  data: >-
                    [
                      {
                        "op": "replace",
                        "path": "/archived",
                        "value": true
                      }
                    ]

              - name: Log Archive Feature Flag Request Failure 
                if: failure()
                uses: port-labs/port-github-action@v1
                with:
                  clientId: ${{ secrets.PORT_CLIENT_ID }}
                  clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                  baseUrl: https://api.getport.io
                  operation: PATCH_RUN
                  runId: ${{fromJson(inputs.port_context).run_id}}
                  logMessage: "Request to archive feature flag failed"

              - name: Log After Archiving Flag
                uses: port-labs/port-github-action@v1
                with:
                  clientId: ${{ secrets.PORT_CLIENT_ID }}
                  clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                  baseUrl: https://api.getport.io
                  operation: PATCH_RUN
                  runId: ${{fromJson(inputs.port_context).run_id}}
                  logMessage: "Feature flag archived successfully ✅"
        ```
        </details>

     <h3>Set up self-service actions</h3>

     <h4>Create LaunchDarkly feature flag github action</h4>

        1. Head to the [self-service](https://app.getport.io/self-serve) page.

        2. Click on the `+ Action` button.

        3. Click on the `{...} Edit JSON` button.

        4. Copy and paste the following JSON configuration:

            <details>
            <summary><b>Create LaunchDarkly feature flag github action (click to expand)</b></summary>

            <GithubActionModificationHint/>

            ```json showLineNumbers
            {
              "identifier": "create_launchdarkly_feature_flag_github",
              "title": "Create Feature Flag Workflow",
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
                "type": "GITHUB",
                "org": "<GITHUB_ORG>",
                "repo": "<GITHUB_REPO>",
                "workflow": "create-feature-flag.yml",
                "workflowInputs": {
                  "project_key": "{{.inputs.project.identifier}}",
                  "flag_key": "{{.inputs.flag_key}}",
                  "flag_name": "{{.inputs.flag_name}}",
                  "flag_description": "{{.inputs.flag_description}}",
                  "temporary": "{{.inputs.temporary}}",
                  "tags": "{{.inputs.tags}}",
                  "port_context": {
                    "blueprint": "{{.action.blueprint}}",
                    "entity": "{{.entity.identifier}}",
                    "run_id": "{{.run.id}}",
                    "relations": "{{.entity.Relations}}"
                  }
                },
                "reportWorkflowStatus": true
              },
              "requiredApproval": false
            }
            ```
            </details>

        5. Click on the `Save` button.

     <h4>Toggle LaunchDarkly feature flag github action</h4>

        1. Click on the `+ Action` button again.

        2. Click on the `{...} Edit JSON` button.

        3. Copy and paste the following JSON configuration:

            <details>
            <summary><b>Toggle LaunchDarkly feature flag github action (click to expand)</b></summary>

            <GithubActionModificationHint/>

            ```json showLineNumbers
            {
              "identifier": "toggle_launchdarkly_feature_flag_github",
              "title": "Toggle Feature Flag Workflow",
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
                      "format": "entity"
                    },
                    "enabled": {
                      "title": "Enable Flag",
                      "description": "Whether to enable or disable the flag",
                      "type": "boolean",
                      "default": true
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
                "type": "GITHUB",
                "org": "<GITHUB_ORG>",
                "repo": "<GITHUB_REPO>",
                "workflow": "toggle-feature-flag.yml",
                "workflowInputs": {
                  "project_key": "{{.entity.relations.project}}",
                  "flag_key": "{{.entity.identifier | sub(\"-[^-]+$\"; \"\")}}",
                  "environment_key": "{{.inputs.environment.identifier | sub(\"-[^-]+$\"; \"\")}}",
                  "enabled": "{{.inputs.enabled}}",
                  "port_context": {
                    "blueprint": "{{.action.blueprint}}",
                    "entity": "{{.entity.identifier}}",
                    "run_id": "{{.run.id}}",
                    "relations": "{{.entity.Relations}}"
                  }
                },
                "reportWorkflowStatus": true
              },
              "requiredApproval": false
            }
            ```
            </details>
        4. Click on the `Save` button.

     <h4>Archive LaunchDarkly feature flag github action</h4>

        1. Click on the `+ Action` button again.

        2. Click on the `{...} Edit JSON` button.

        3. Copy and paste the following JSON configuration:

            <details>
            <summary><b>Archive LaunchDarkly feature flag github action (click to expand)</b></summary>

            <GithubActionModificationHint/>

            ```json showLineNumbers
            {
              "identifier": "archive_launchdarkly_feature_flag_github",
              "title": "Archive Feature Flag Workflow",
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
                "type": "GITHUB",
                "org": "<GITHUB_ORG>",
                "repo": "<GITHUB_REPO>",
                "workflow": "archive-feature-flag.yml",
                "workflowInputs": {
                  "project_key": "{{.entity.relations.project}}",
                  "flag_key": "{{.entity.identifier | sub(\"-[^-]+$\"; \"\")}}",
                  "port_context": {
                    "blueprint": "{{.action.blueprint}}",
                    "entity": "{{.entity.identifier}}",
                    "run_id": "{{.run.id}}",
                    "relations": "{{.entity.Relations}}"
                  }
                },
                "reportWorkflowStatus": true
              },
              "requiredApproval": true
            }
            ```
            </details>

        4. Click on the `Save` button.

   </TabItem>
</Tabs>




## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. **Test creating a feature flag:**
   - Click on `Create Feature Flag Workflow` or `Create Feature Flag Webhook`
   - Fill in the required information:
     - Project: Your LaunchDarkly project
     - Flag Key: A unique identifier (e.g., "new-checkout-flow")
     - Flag Name: A human-readable name (e.g., "New Checkout Flow")
     - Description: What the flag controls
     - Set temporary flag if needed
     - Add relevant tags
   - Click `Execute`

3. **Test toggling a feature flag:**
   - Click on `Toggle Feature Flag Workflow` or `Toggle Feature Flag Webhook`
   - Select an existing feature flag
   - Choose the environment (production, staging, etc.)
   - Toggle the enabled input on or off
   - Click `Execute`

4. **Test archiving a feature flag:**
   - Click on `Archive Feature Flag Workflow` or `Archive Feature Flag Webhook`
   - Select an existing feature flag
   - Click `Execute`
   


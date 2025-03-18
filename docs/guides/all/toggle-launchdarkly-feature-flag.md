---
displayed_sidebar: null
description: Learn how to toggle LaunchDarkly feature flags in Port, enabling dynamic feature management and testing in your applications.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Toggle LaunchDarkly Feature Flag

## Overview
This guide will help you implement a self-service action in Port that allows you to toggle LaunchDarkly feature flags directly from Port.
This functionality streamlines feature management by enabling users to control feature flags without leaving Port.

You can implement this action in two ways:
1. **GitHub workflow**: A more flexible approach that allows for complex workflows and custom logic, suitable for teams that want to maintain their automation in Git.
2. **Synced webhooks**: A simpler approach that directly interacts with LaunchDarkly's API through Port, ideal for quick implementation and minimal setup.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your LaunchDarkly organization with permissions to manage feature flags.
- A LaunchDarkly API token with permission to toggle feature flags. [Learn more](https://docs.launchdarkly.com/home/account-security/api-access-tokens)
- Optional - Install Port's LaunchDarkly integration [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/feature-management/launchdarkly)

	:::tip LaunchDarkly Integration
	This step is not required for this example, but it will create all the blueprint boilerplate for you, and also ingest and update the catalog in real time with your LaunchDarkly Feature Flags.
	:::

## Set up data model

If you haven't installed the LaunchDarkly integration, you'll need to create a blueprint for LaunchDarkly feature flags.
However, we highly recommend you install the LaunchDarkly integration to have these automatically set up for you.

<h3>Create the LaunchDarkly feature flag blueprint</h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>LaunchDarkly Feature Flag Blueprint (Click to expand)</b></summary>

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
        "environments": {
          "title": "Environments",
          "target": "launchDarklyEnvironment",
          "required": false,
          "many": true
        }
      }
    }
    ```
    </details>

5. Click "Save" to create the blueprint.

## Implementation

<Tabs>
  <TabItem value="webhook" label="Synced webhook" default>

    You can toggle LaunchDarkly feature flags by leveraging Port's **synced webhooks** and **secrets** to directly interact with the LaunchDarkly's API. This method simplifies the setup by handling everything within Port.

    <h3>Add Port secrets</h3>

    <ExistingSecretsCallout integration="LaunchDarkly" />

    To add these secrets to your portal:

    1. Click on the `...` button in the top right corner of your Port application.

    2. Click on **Credentials**.

    3. Click on the `Secrets` tab.

    4. Click on `+ Secret` and add the following secrets:
       - `LAUNCHDARKLY_ACCESS_TOKEN`: Your LaunchDarkly API token

    <h3>Set up self-service action</h3>

    Follow these steps to create the self-service action:

    1. Head to the [self-service](https://app.getport.io/self-serve) page.
    2. Click on the `+ New Action` button.
    3. Click on the `{...} Edit JSON` button.
    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Toggle LaunchDarkly Feature Flag (Webhook) (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "toggle_feature_flag_webhook",
          "title": "Toggle Feature Flag (Webhook)",
          "icon": "Launchdarkly",
          "description": "Toggle a LaunchDarkly feature flag using a webhook",
          "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
              "properties": {
                "project_key": {
                  "description": "LaunchDarkly Project Key",
                  "title": "Project Key",
                  "icon": "Launchdarkly",
                  "type": "string"
                },
                "flag_key": {
                  "description": "LaunchDarkly Flag Key (without project suffix)",
                  "title": "Flag Key",
                  "icon": "Launchdarkly",
                  "type": "string"
                },
                "environment_key": {
                  "description": "LaunchDarkly Environment Key where the flag exists",
                  "title": "Environment Key",
                  "icon": "Launchdarkly",
                  "type": "string"
                },
                "flag_state": {
                  "title": "Flag State",
                  "description": "Desired state of the feature flag (true for enabled, false for disabled)",
                  "icon": "Launchdarkly",
                  "type": "boolean",
                  "default": true
                }
              },
              "required": [
                "project_key",
                "flag_key",
                "environment_key"
              ],
              "order": [
                "project_key",
                "flag_key",
                "environment_key",
                "flag_state"
              ]
            },
            "blueprintIdentifier": "launchDarklyFeatureFlag"
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://app.launchdarkly.com/api/v2/flags/{{.inputs.project_key}}/{{.inputs.flag_key}}",
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
                "path": "/environments/{{.inputs.environment_key}}/on",
                "value": "{{.inputs.flag_state}}"
              }
            ]
          },
          "requiredApproval": false
        }
        ```
        </details>

    5. Click `Save`.

    Now you should see the `Toggle Feature Flag (Webhook)` action in the self-service page. 🎉

    <h3>Create an automation to update entity in port</h3>

    To keep your catalog updated with the latest feature flag state, you can create an automation that will update the LaunchDarkly feature flag entity in Port immediately after the webhook action completes successfully.

    Follow these steps to add the automation:

    1. Head to the [automation](https://app.getport.io/settings/automations) page.

    2. Click on the `+ Automation` button.

    3. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Update LaunchDarkly feature flag in Port automation (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "launchDarklyFeatureFlag_sync_after_toggle",
          "title": "Sync LaunchDarkly Feature Flag After Toggle",
          "description": "Update LaunchDarkly feature flag data in Port after toggling",
          "trigger": {
            "type": "automation",
            "event": {
              "type": "RUN_UPDATED",
              "actionIdentifier": "toggle_feature_flag_webhook"
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
              "identifier": "{{.event.diff.after.entity.identifier}}",
              "title": "{{.event.diff.after.entity.title}}",
              "properties": {
                "kind": "{{.event.diff.after.entity.properties.kind}}",
                "description": "{{.event.diff.after.entity.properties.description}}",
                "temporary": "{{.event.diff.after.entity.properties.temporary}}",
                "tags": "{{.event.diff.after.entity.properties.tags}}",
                "archived": "{{.event.diff.after.entity.properties.archived}}",
                "deprecated": "{{.event.diff.after.entity.properties.deprecated}}"
              }
            }
          },
          "publish": true
        }
        ```
        </details>

    4. Click `Save`.

    Now when you execute the webhook action, the feature flag data in Port will be automatically updated with the latest information from LaunchDarkly.

  </TabItem>

  <TabItem value="github" label="GitHub workflow">

      To implement this use-case using a GitHub workflow, follow these steps:

      <h3>Add GitHub secrets</h3>

      In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
      - `LAUNCHDARKLY_ACCESS_TOKEN` - A LaunchDarkly API token with permission to toggle feature flags.
      - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
      - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

      <h3>Add GitHub workflow</h3>

      Create the file `.github/workflows/toggle-feature-flag.yaml` in the `.github/workflows` folder of your repository.

      <GithubDedicatedRepoHint/>

      <details>
      <summary><b>GitHub Workflow (Click to expand)</b></summary>

      ```yaml showLineNumbers
      name: Toggle LaunchDarkly Feature Flag

      on:
        workflow_dispatch:
          inputs:
            project_key:
              description: 'LaunchDarkly Project Key'
              required: true
              type: string
            environment_key:
              description: 'LaunchDarkly Environment Key where the flag exists'
              required: true
              type: string
            flag_state:
              description: 'Desired state of the feature flag (true for enabled, false for disabled)'
              required: true
              type: boolean
            port_context:
              required: true
              description: includes blueprint, run ID, and entity identifier from Port.

      jobs:
        toggle-feature-flag:
          runs-on: ubuntu-latest
          steps:
            - name: Log Before Toggling
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "Attempting to toggle feature flag '${{fromJson(inputs.port_context).entity}}' in '${{ github.event.inputs.environment_key }}' environment to ${{ github.event.inputs.flag_state }}."

            - name: Toggle Feature Flag in LaunchDarkly
              id: "toggle_feature_flag"
              uses: fjogeleit/http-request-action@v1
              with:
                url: 'https://app.launchdarkly.com/api/v2/flags/${{ github.event.inputs.project_key }}/${{fromJson(inputs.port_context).entity}}'
                method: 'PATCH'
                customHeaders: '{"Authorization": "${{ secrets.LAUNCHDARKLY_ACCESS_TOKEN }}", "Content-Type": "application/json"}'
                data: >-
                  [{
                    "op": "replace",
                    "path": "/environments/${{ github.event.inputs.environment_key }}/on",
                    "value": ${{ github.event.inputs.flag_state }}
                  }]

            - name: Convert CreationDate to date-time format
              id: format_date
              run: |
                timestamp="${{ fromJson(steps.toggle_feature_flag.outputs.response).creationDate }}"
                epoch_seconds=$(($timestamp / 1000))
                formatted_date=$(date -u -d "@${epoch_seconds}" +"%Y-%m-%dT%H:%M:%SZ")
                echo "creationDate=${formatted_date}" >> $GITHUB_OUTPUT
                echo "creationDate=${formatted_date}"
                
            - name: Log Before Upserting Entity
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "Moving on to upsert updates to Port"
                
            - name: UPSERT Entity
              uses: port-labs/port-github-action@v1
              with:
                identifier: "${{ fromJson(steps.toggle_feature_flag.outputs.response).key }}"
                title: "${{ fromJson(steps.toggle_feature_flag.outputs.response).description }}"
                blueprint: ${{fromJson(inputs.port_context).blueprint}}
                properties: |-
                  {
                    "kind": "${{ fromJson(steps.toggle_feature_flag.outputs.response).kind }}",
                    "description": "${{ fromJson(steps.toggle_feature_flag.outputs.response).description }}",
                    "creationDate": "${{ steps.format_date.outputs.creationDate }}",
                    "includeInSnippet": ${{ fromJson(steps.toggle_feature_flag.outputs.response).includeInSnippet }},
                    "clientSideAvailability": ${{ toJson(fromJson(steps.toggle_feature_flag.outputs.response).clientSideAvailability) }},
                    "temporary": ${{ fromJson(steps.toggle_feature_flag.outputs.response).temporary }},
                    "tags": ${{ toJson(fromJson(steps.toggle_feature_flag.outputs.response).tags) }},
                    "maintainer": ${{ toJson(fromJson(steps.toggle_feature_flag.outputs.response)._maintainer) }},
                    "environments": ${{ toJson(fromJson(steps.toggle_feature_flag.outputs.response).environments) }},
                    "variations": ${{ toJson(fromJson(steps.toggle_feature_flag.outputs.response).variations) }},
                    "customProperties": ${{ toJson(fromJson(steps.toggle_feature_flag.outputs.response).customProperties) }},
                    "archived": ${{ fromJson(steps.toggle_feature_flag.outputs.response).archived }},
                    "projectKey": "${{ github.event.inputs.project_key }}"
                  }
                relations: "${{ toJson(fromJson(inputs.port_context).relations) }}"
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: UPSERT
                runId: ${{fromJson(inputs.port_context).run_id}}
                
            - name: Log After Toggling
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "Feature flag '${{fromJson(inputs.port_context).entity}}' in '${{ github.event.inputs.environment_key }}' environment set to ${{ github.event.inputs.flag_state }}."
      ```
      </details>

      <h3>Set up self-service action</h3>

      We will create a self-service action to handle toggling LaunchDarkly feature flags.
      To create a self-service action follow these steps:

      1. Head to the [self-service](https://app.getport.io/self-serve) page.
      2. Click on the `+ New Action` button.
      3. Click on the `{...} Edit JSON` button.
      4. Copy and paste the following JSON configuration into the editor.

          <details>
          <summary><b>Toggle LaunchDarkly Feature Flag (Click to expand)</b></summary>

          <GithubActionModificationHint/>

          ```json showLineNumbers
          {
            "identifier": "launchDarklyFeatureFlag_toggle_a_feature_flag",
            "title": "Toggle LaunchDarkly Feature Flag",
            "icon": "Launchdarkly",
            "description": "Toggle a Feature Flag in launchdarkly",
            "trigger": {
              "type": "self-service",
              "operation": "DAY-2",
              "userInputs": {
                "properties": {
                  "project_key": {
                    "description": "LaunchDarkly Project Key",
                    "title": "project_key",
                    "icon": "Launchdarkly",
                    "type": "string"
                  },
                  "flag_key": {
                    "description": "LaunchDarkly Flag Key (without project suffix)",
                    "title": "Flag Key",
                    "icon": "Launchdarkly",
                    "type": "string"
                  },
                  "environment_key": {
                    "description": "LaunchDarkly Environment Key where the flag exists",
                    "title": "environment_key",
                    "icon": "Launchdarkly",
                    "type": "string"
                  },
                  "flag_state": {
                    "title": "flag_state",
                    "description": "Desired state of the feature flag (true for enabled, false for disabled)",
                    "icon": "Launchdarkly",
                    "type": "boolean",
                    "default": true
                  }
                },
                "required": [
                  "project_key",
                  "flag_key",
                  "environment_key"
                ],
                "order": [
                  "project_key",
                  "flag_key",
                  "environment_key",
                  "flag_state"
                ]
              },
              "blueprintIdentifier": "launchDarklyFeatureFlag"
            },
            "invocationMethod": {
              "type": "GITHUB",
              "org": "<GITHUB_ORG>",
              "repo": "<GITHUB_REPO>",
              "workflow": "toggle-feature-flag.yaml",
              "workflowInputs": {
                "project_key": "{{.inputs.\"project_key\"}}",
                "flag_key": "{{.inputs.\"flag_key\"}}",
                "environment_key": "{{.inputs.\"environment_key\"}}",
                "flag_state": "{{.inputs.\"flag_state\"}}",
                "port_context": {
                  "blueprint": "{{.action.blueprint}}",
                  "entity": "{{.entity.identifier}}",
                  "run_id": "{{.run.id}}",
                  "relations": "{{.entity.relations}}"
                }
              },
              "reportWorkflowStatus": true
            },
            "requiredApproval": false
          }
          ```
          </details>

      5. Click `Save`.

      Now you should see the `Toggle LaunchDarkly Feature Flag` action in the self-service page. 🎉

  </TabItem>
</Tabs>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Choose either the GitHub workflow or webhook implementation:
   - For GitHub workflow: Click on `Toggle LaunchDarkly Feature Flag`
   - For webhook: Click on `Toggle Feature Flag (Webhook)`

3. Select the LaunchDarkly feature flag you want to toggle

4. Enter the required information:
   - Project Key: The LaunchDarkly project key where the flag is located
   - Flag Key: The LaunchDarkly flag key (without project suffix)
   - Environment Key: The environment where you want to toggle the flag
   - Flag State: Set to true to enable the flag or false to disable it

5. Click on `Execute`

6. Done! Wait for the feature flag's status to be changed in LaunchDarkly

## More relevant guides and examples
- [Create a LaunchDarkly feature flag](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/LaunchDarkly/create-feature-flag)
- [Archive a LaunchDarkly feature flag](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/LaunchDarkly/archive-feature-flag)
- [Add tags to a LaunchDarkly feature flag](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/LaunchDarkly/add-tags-to-feature-flag)
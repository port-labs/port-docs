---
displayed_sidebar: null
description: Learn how to toggle LaunchDarkly feature flags in Port, enabling dynamic feature management and testing in your applications.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Toggle LaunchDarkly Feature Flag

# Overview

This GitHub action allows you to quickly toggle LaunchDarkly Feature Flags via Port Actions with ease.

## Prerequisites

1. Install the Ports GitHub app from [here](https://github.com/apps/getport-io/installations/new).

2. Create the following GitHub action secrets
    - `LAUNCHDARKLY_ACCESS_TOKEN` - a token with permission to toggle a feature flag in LaunchDarkly [Learn more](https://docs.launchdarkly.com/home/account-security/api-access-tokens)
    - `PORT_CLIENT_ID` - Port Client ID [Learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
    - `PORT_CLIENT_SECRET` - Port Client Secret. [Learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token) 

3. Optional - Install Port's LaunchDarkly integration. [Learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/feature-management/launchdarkly)

	:::tip LaunchDarkly Integration
	This step is not required for this example, but it will create all the blueprint boilerplate for you, and also ingest and update the catalog in real time with your LaunchDarkly Feature Flags.
	:::

4. In Case you decided not to install the LaunchDarkly integration, you will need to create a blueprint for LaunchDarkly Feature Flag in Port.

<details>
<summary>LaunchDarkly Feature Flag Blueprint</summary>
	
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


## GitHub Workflow

1. Create a workflow file under `.github/workflows/toggle-feature-flag.yaml` with the following content:

<GithubDedicatedRepoHint/>

<details>
<summary>GitHub Workflow</summary>

```yaml showLineNumbers title="toggle-feature-flag.yaml"

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

## Port Configuration

Create a new self service action using the following JSON configuration.

<details>
<summary><b>Toggle A Feature Flag (Click to expand)</b></summary>

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
        "environment_key"
      ],
      "order": [
        "project_key",
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

Now you should see the `Toggle LaunchDarkly Feature Flag` action in the self-service page. 🎉

## Let's test it!

1. Head to the [Self Service hub](https://app.getport.io/self-serve).
2. Click on the `Toggle LaunchDarkly Feature Flag` action.
3. Choose the feature flag you want to toggle (In case you didn't install the [LaunchDarkly integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/feature-management/launchdarkly), it means you don't have any feature flags in Port yet, so you will need to create one manually in Port to test this action).
4. Enter the associated `projectKey` and `environmentKey` for the flag and toggle `flagState` (ON by default).
5. Click on `Execute`.
6. Done! wait for the feature flag's status to be changed in LaunchDarkly.

Congrats 🎉 You've toggled your first LaunchDarkly feature flag from Port!
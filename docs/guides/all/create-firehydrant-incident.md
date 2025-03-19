---
displayed_sidebar: null
description: Learn how to create a FireHydrant incident in Port, ensuring timely resolution and effective incident management.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create a FireHydrant Incident

## Overview
This guide will help you implement a self-service action in Port that allows you to create FireHydrant incidents directly from Port.
This functionality streamlines incident management by enabling users to create incidents without leaving Port.

You can implement this action in two ways:
1. **GitHub workflow**: A more flexible approach that allows for complex workflows and custom logic, suitable for teams that want to maintain their automation in Git.
2. **Synced webhooks**: A simpler approach that directly interacts with FireHydrant's API through Port, ideal for quick implementation and minimal setup.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your FireHydrant organization with permissions to manage incidents.
- Optional - Install Port's [FireHydrant integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/firehydrant).

## Set up data model

If you haven't installed the FireHydrant integration, you will need to manually create a blueprint for FireHydrant incidents.  
We highly recommend that you install the FireHydrant integration to have such resources automatically set up for you.

<h3>Create the FireHydrant incident blueprint</h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>FireHydrant Incident Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "firehydrantIncident",
    "description": "This blueprint represents a firehydrant incident",
    "title": "FireHydrant Incident",
    "icon": "FireHydrant",
    "schema": {
        "properties": {
        "url": {
            "type": "string",
            "title": "Incident URL",
            "format": "url",
            "description": "the link to the incident"
        },
        "priority": {
            "title": "Priority",
            "type": "string",
            "enum": [
            "P1",
            "P2",
            "P3",
            "P4"
            ],
            "enumColors": {
            "P1": "red",
            "P2": "red",
            "P3": "orange",
            "P4": "orange"
            }
        },
        "severity": {
            "title": "Severity",
            "type": "string"
        },
        "tags": {
            "title": "Tags",
            "items": {
            "type": "string"
            },
            "type": "array"
        },
        "currentMilestone": {
            "type": "string",
            "title": "Current Milestone",
            "default": "started",
            "enum": [
            "started",
            "detected",
            "acknowledged",
            "investigating",
            "identified",
            "mitigated",
            "resolved",
            "postmortem_started",
            "postmortem_completed",
            "closed"
            ],
            "enumColors": {
            "started": "red",
            "detected": "red",
            "acknowledged": "orange",
            "investigating": "yellow",
            "identified": "yellow",
            "mitigated": "green",
            "resolved": "green",
            "postmortem_started": "purple",
            "postmortem_completed": "blue",
            "closed": "green"
            }
        },
        "functionalities": {
            "title": "Functionalities Impacted",
            "items": {
            "type": "string"
            },
            "type": "array"
        },
        "customerImpact": {
            "title": "Customers Impacted",
            "type": "string"
        },
        "createdBy": {
            "title": "Created By",
            "type": "string"
        },
        "createdAt": {
            "title": "Created At",
            "type": "string",
            "format": "date-time"
        },
        "description": {
            "title": "Description",
            "type": "string"
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

## Implementation

<Tabs>
  <TabItem value="webhook" label="Synced webhook" default>
   
    You can create FireHydrant incidents by leveraging Port's **synced webhooks** and **secrets** to directly interact with FireHydrant's API. This method simplifies the setup by handling everything within Port.

    <h3>Add Port secrets</h3>

    <ExistingSecretsCallout integration="FireHydrant" />

    To add these secrets to your portal:

    1. Click on the `...` button in the top right corner of your Port application.

    2. Click on **Credentials**.

    3. Click on the `Secrets` tab.

    4. Click on `+ Secret` and add the following secrets:
        - `FIREHYDRANT_API_KEY`: Your FireHydrant API key

    
    <h3> Set up self-service action </h3>

    We will create a self-service action to handle creating FireHydrant incidents using webhooks.
    To create a self-service action follow these steps:

    1. Head to the [self-service](https://app.getport.io/self-serve) page.
    2. Click on the `+ New Action` button.
    3. Click on the `{...} Edit JSON` button.
    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Create FireHydrant Incident (Webhook) (Click to expand)</b></summary>

        ```json showLineNumbers
        {
        "identifier": "create_firehydrant_incident_webhook",
        "title": "Create FireHydrant Incident (Webhook)",
        "icon": "FireHydrant",
        "description": "Create a new FireHydrant incident",
        "trigger": {
            "type": "self-service",
            "operation": "CREATE",
            "userInputs": {
            "properties": {
                "name": {
                "type": "string",
                "title": "Name",
                "description": "The name or title of the incident"
                },
                "priority": {
                "icon": "DefaultProperty",
                "title": "Priority",
                "type": "string",
                "enum": [
                    "P1",
                    "P2",
                    "P3",
                    "P4"
                ],
                "enumColors": {
                    "P1": "red",
                    "P2": "orange",
                    "P3": "blue",
                    "P4": "darkGray"
                }
                },
                "description": {
                "type": "string",
                "title": "Description",
                "description": "Detailed description about the incident"
                }
            },
            "required": [],
            "order": [
                "name",
                "description",
                "priority"
            ]
            }
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://api.firehydrant.io/v1/incidents",
            "agent": false,
            "synchronized": true,
            "method": "POST",
            "headers": {
            "Authorization": "{{.secrets.FIREHYDRANT_API_KEY}}",
            "Content-Type": "application/json"
            },
            "body": {
            "name": "{{.inputs.name}}",
            "priority": "{{.inputs.priority}}",
            "description": "{{.inputs.description}}"
            }
        },
        "requiredApproval": false
        }
        ```
        </details>

    5. Click `Save`.

    Now you should see the `Create FireHydrant Incident (Webhook)` action in the self-service page. 🎉

    <h3> Create an automation to upsert entity in port </h3>

    After each execution of the action, we would like to update the relevant entity in Port with the latest status.  

    To achieve this, we can create an automation that will be triggered when the action completes successfully.

    To create the automation:

    1. Head to the [automation](https://app.getport.io/settings/automations) page.

    2. Click on the `+ Automation` button.

    3. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Update FireHydrant incident in Port automation (Click to expand)</b></summary>

        ```json showLineNumbers
            {
            "identifier": "firehydrant_incident_sync_status",
            "title": "Sync FireHydrant Incident Status",
            "description": "Update FireHydrant incident data in Port after creation",
            "trigger": {
                "type": "automation",
                "event": {
                "type": "RUN_UPDATED",
                "actionIdentifier": "create_firehydrant_incident_webhook"
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
                "blueprintIdentifier": "firehydrantIncident",
                "mapping": {
                "identifier": "{{.event.diff.after.response.id}}",
                "title": "{{.event.diff.after.response.name}}",
                "properties": {
                    "url": "{{.event.diff.after.response.incident_url}}",
                    "priority": "{{.event.diff.after.response.priority}}",
                    "severity": "{{.event.diff.after.response.severity}}",
                    "tags": "{{.event.diff.after.response.tag_list}}",
                    "currentMilestone": "{{.event.diff.after.response.current_milestone}}",
                    "description": "{{.event.diff.after.response.description}}",
                    "customerImpact": "{{.event.diff.after.response.customers_impacted}}",
                    "createdBy": "{{.event.diff.after.response.created_by.name}}",
                    "createdAt": "{{.event.diff.after.response.created_at}}"
                },
                "relations": {}
                }
            },
            "publish": true
            }
        ```
        </details>

    4. Click `Save`.

    Now when you execute the webhook action, the incident data in Port will be automatically updated with the latest information from FireHydrant.

  </TabItem>
  <TabItem value="github" label="GitHub workflow">
  
    To implement this use-case using a GitHub workflow, follow these steps:

    <h3> Add GitHub secrets </h3>

    In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
      - `FIREHYDRANT_API_KEY` - Your FireHydrant API key. [Follow the FireHydrant documentation](https://docs.firehydrant.com/docs/api-keys) to generate your key.
      - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
      - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

      <h3> Add GitHub workflow </h3>

      Create the file `.github/workflows/create-firehydrant-incident.yaml` in the `.github/workflows` folder of your repository.

      <GithubDedicatedRepoHint/>

      <details>
      <summary><b>GitHub Workflow (Click to expand)</b></summary>

      ```yaml showLineNumbers
        name: Create FireHydrant Incident

        on:
        workflow_dispatch:
            inputs:
            name:
                description: The name or title of the incident
                required: true
                type: string
            priority:
                description: New priority level for the incident (e.g., P1)
                required: true
                type: string
            description:
                description: The detailed description of the incident
                required: false
                type: string
            port_context:
                required: true
                description: includes blueprint, run ID, and entity identifier from Port.

        jobs:
        trigger-incident:
            runs-on: ubuntu-latest
            steps:
            - name: Inform execution of request to trigger incident
                uses: port-labs/port-github-action@v1
                with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "About to trigger an incident in FireHydrant..."

            - name: Trigger Incident in FireHydrant
                id: trigger_incident
                uses: fjogeleit/http-request-action@v1
                with:
                url: 'https://api.firehydrant.io/v1/incidents'
                method: 'POST'
                customHeaders: '{"Content-Type": "application/json", "Authorization": "${{ secrets.FIREHYDRANT_API_KEY }}"}'
                data: >-
                    {
                        "name": "${{ github.event.inputs.name }}",
                        "description": "${{ github.event.inputs.description }}",
                        "priority": "${{ github.event.inputs.priority }}"
                    }

            - name: Inform Port of FireHydrant failure request
                if: failure()
                uses: port-labs/port-github-action@v1
                with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "Request to trigger FireHydrant incident failed ..."

            - name: Inform Port of successful FireHydrant incident creation
                uses: port-labs/port-github-action@v1
                with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "Incident successfully created in FireHydrant. Upserting the response entity in Port..."

            - name: Upsert FireHydrant entity to Port 
                id: upsert_entity
                uses: port-labs/port-github-action@v1
                with:
                identifier: "${{ fromJson(steps.trigger_incident.outputs.response).id }}"
                title: "${{ fromJson(steps.trigger_incident.outputs.response).name }}"
                blueprint: "firehydrantIncident"
                properties: |-
                    {
                    "url": "${{ fromJson(steps.trigger_incident.outputs.response).incident_url }}",
                    "priority": "${{ fromJson(steps.trigger_incident.outputs.response).priority }}",
                    "severity": "${{ fromJson(steps.trigger_incident.outputs.response).severity }}",
                    "tags": "${{ fromJson(steps.trigger_incident.outputs.response).tag_list}}",
                    "currentMilestone": "${{ fromJson(steps.trigger_incident.outputs.response).current_milestone }}",
                    "description": "${{ fromJson(steps.trigger_incident.outputs.response).description}}",
                    "customerImpact": "${{ fromJson(steps.trigger_incident.outputs.response).customers_impacted }}",
                    "createdBy": "${{ fromJson(steps.trigger_incident.outputs.response).created_by.name }}",
                    "createdAt": "${{ fromJson(steps.trigger_incident.outputs.response).created_at }}"
                    }
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: UPSERT
                runId: ${{fromJson(inputs.port_context).run_id}}

            - name: Inform Entity upsert failure
                if: steps.upsert_entity.outcome == 'failure'
                uses: port-labs/port-github-action@v1
                with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "Failed to report the created incident back to Port ..."

            - name: Inform completion of FireHydrant incident creation
                uses: port-labs/port-github-action@v1
                with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "Incident creation process was successful ✅"
      ```
      </details>

      <h3> Set up self-service action </h3>

      We will create a self-service action to handle escalating FireHydrant incidents.
      To create a self-service action follow these steps:

      1. Head to the [self-service](https://app.getport.io/self-serve) page.
      2. Click on the `+ New Action` button.
      3. Click on the `{...} Edit JSON` button.
      4. Copy and paste the following JSON configuration into the editor.

          <details>
          <summary><b>Escalate FireHydrant Incident (Click to expand)</b></summary>

          <GithubActionModificationHint/>

          ```json showLineNumbers
            {
            "identifier": "create_firehydrant_incident",
            "title": "Create FireHydrant Incident",
            "icon": "FireHydrant",
            "description": "Create a new FireHydrant incident",
            "trigger": {
                "type": "self-service",
                "operation": "CREATE",
                "userInputs": {
                "properties": {
                    "name": {
                    "type": "string",
                    "title": "Name",
                    "description": "The name or title of the incident"
                    },
                    "description": {
                    "type": "string",
                    "title": "Description",
                    "description": "Detailed description of the incident"
                    },
                    "priority": {
                    "type": "string",
                    "title": "Priority",
                    "enum": [
                        "P1",
                        "P2",
                        "P3",
                        "P4"
                    ],
                    "enumColors": {
                        "P1": "red",
                        "P2": "orange",
                        "P3": "blue",
                        "P4": "lightGray"
                    }
                    }
                },
                "required": [],
                "order": [
                    "name",
                    "description"
                ]
                }
            },
            "invocationMethod": {
                "type": "GITHUB",
                "org": "<GITHUB_ORG>",
                "repo": "<GITHUB_REPO>",
                "workflow": "create-firehydrant-incident.yaml",
                "workflowInputs": {
                "{{ spreadValue() }}": "{{ .inputs }}",
                "port_context": {
                    "run_id": "{{ .run.id }}"
                }
                },
                "reportWorkflowStatus": true
            },
            "requiredApproval": false
            }
          ```
          </details>

      5. Click `Save`.

      Now you should see the `Create FireHydrant Incident` action in the self-service page. 🎉

  </TabItem>
</Tabs>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal.

2. Choose either the GitHub workflow or webhook implementation:
   - For GitHub workflow: Click on `Create FireHydrant Incident`.
   - For webhook: Click on `Create FireHydrant Incident (Webhook)`.

3. Enter the required information:
   - Incident name.
   - Description of the incident.
   - Priority level (from P1 to P4).

5. Click on `Execute`.

6. Done! Wait for the incident to be created in FireHydrant.

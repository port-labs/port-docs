---
displayed_sidebar: null
description: Learn how to trigger FireHydrant incidents in Port, ensuring effective incident management and prompt issue response.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Trigger FireHydrant Incident

## Overview
This guide will help you implement a self-service action in Port that allows you to trigger FireHydrant incidents directly from Port.
This functionality streamlines incident management by enabling users to trigger incidents without leaving Port.

You can implement this action in two ways:
1. **GitHub workflow**: A more flexible approach that allows for complex workflows and custom logic, suitable for teams that want to maintain their automation in Git.
2. **Synced webhooks**: A simpler approach that directly interacts with FireHydrant's API through Port, ideal for quick implementation and minimal setup.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your FireHydrant organization with permissions to manage incidents.
- Optional - Install Port's [FireHydrant integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/firehydrant).

## Set up data model

If you haven't installed the FireHydrant integration, you will need to manually create blueprints for FireHydrant incidents and services.  
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

<h3>Create the FireHydrant service blueprint</h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>FireHydrant Service Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "firehydrantService",
      "description": "This blueprint represents a FireHydrant service in our software catalog",
      "title": "FireHydrant Service",
      "icon": "FireHydrant",
      "schema": {
        "properties": {
          "name": {
            "title": "Name",
            "description": "The name of the service in FireHydrant",
            "type": "string"
          },
          "description": {
            "title": "Description",
            "description": "Description of the service",
            "type": "string"
          },
          "status": {
            "title": "Status",
            "description": "Current status of the service",
            "type": "string"
          }
        }
      },
      "calculationProperties": {},
      "relations": {}
    }
    ```

    </details>

5. Click "Save" to create the blueprint.

<h3>Update the service blueprint</h3>

You'll need to add a relation to your service blueprint to link it with FireHydrant services:

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Find your service blueprint and click on it.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add the following relation to the `relations` object:

    ```json showLineNumbers
    {
      "relations": {
        "fh_service": {
          "title": "FireHydrant Service",
          "target": "firehydrantService",
          "required": false,
          "many": false
        }
      }
    }
    ```

5. Click "Save" to update the blueprint.

## Get FireHydrant Condition IDs

Before implementing the action, you'll need to get the condition IDs that are specific to your FireHydrant organization. You can retrieve these IDs using the FireHydrant API:

```bash
curl -X GET "https://api.firehydrant.io/v1/severity_matrix/conditions" \
     -H "Authorization: YOUR_FIREHYDRANT_API_KEY" \
     -H "accept: application/json"
```

The response will include all available conditions with their IDs. For example:
```json
{
  "data": [
    {
      "id": "b1fc9184-b3f3-4af1-a111-68abcad9bf34",
      "name": "Unavailable",
      "position": 0
    },
    {
      "id": "465a5b4c-6f95-4707-a777-ab4bb8def27d",
      "name": "Degraded",
      "position": 1
    },
    {
      "id": "c2bc11e8-7fcc-428d-9007-26f00700834a",
      "name": "Bug",
      "position": 2
    },
    {
      "id": "9a2a8dbb-6b4e-4189-aca1-e2bb73b9c50b",
      "name": "Operational",
      "position": 3
    }
  ]
}
```

You'll need these condition IDs for both implementation methods below. Make sure to replace the example IDs with the ones from your API response.

## Implementation

<Tabs>
  <TabItem value="webhook" label="Synced webhook" default>

    You can trigger FireHydrant incidents by leveraging Port's **synced webhooks** and **secrets** to directly interact with FireHydrant's API.
    This method simplifies the setup by handling everything within Port.

    <h3>Add Port secrets</h3>

    <ExistingSecretsCallout integration="FireHydrant" />

    To add these secrets to your portal:

    1. Click on the `...` button in the top right corner of your Port application.

    2. Click on **Credentials**.

    3. Click on the `Secrets` tab.

    4. Click on `+ Secret` and add the following secrets:
        - `FIREHYDRANT_API_KEY`: Your FireHydrant API key

    <h3>Set up self-service action</h3>

    We will create a self-service action to handle triggering FireHydrant incidents using webhooks.
    To create a self-service action follow these steps:

    1. Head to the [self-service](https://app.getport.io/self-serve) page.
    2. Click on the `+ New Action` button.
    3. Click on the `{...} Edit JSON` button.
    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Trigger FireHydrant Incident (Webhook) (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "trigger_an_incident",
          "title": "Trigger an incident",
          "icon": "FireHydrant",
          "description": "Trigger an incident to a FireHydrant service",
          "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
              "properties": {
                "name": {
                  "icon": "DefaultProperty",
                  "type": "string",
                  "title": "Incident name"
                },
                "condition": {
                  "icon": "DefaultProperty",
                  "title": "Service status",
                  "type": "string",
                  "enum": [
                    "Unavailable",
                    "Degraded",
                    "Bug",
                    "Operational"
                  ],
                  "enumColors": {
                    "Unavailable": "lightGray",
                    "Degraded": "lightGray",
                    "Bug": "lightGray",
                    "Operational": "lightGray"
                  }
                },
                "incident_description": {
                  "type": "string",
                  "title": "Incident description"
                }
              },
              "required": [
                "name",
                "condition"
              ],
              "order": [
                "name",
                "condition",
                "incident_description"
              ]
            },
            "blueprintIdentifier": "service"
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://api.firehydrant.io/v1/incidents",
            "agent": false,
            "synchronized": true,
            "method": "POST",
            "headers": {
              "RUN_ID": "{{ .run.id }}",
              "Authorization": "{{ .secrets.FIREHYDRANT_API_KEY }}",
              "content-type": "application/json",
              "accept": "application/json"
            },
            "body": {
              "impacts": [
                {
                  "type": "service",
                  "id": "{{ .entity.relations.fh_service }}",
                  "condition_id": "{{ if .inputs.condition == \"Unavailable\" then \"b1fc9184-b3f3-4af1-a111-68abcad9bf34\" elif .inputs.condition == \"Degraded\" then \"465a5b4c-6f95-4707-a777-ab4bb8def27d\" elif .inputs.condition == \"Bug\" then \"c2bc11e8-7fcc-428d-9007-26f00700834a\" elif .inputs.condition == \"Operational\" then \"9a2a8dbb-6b4e-4189-aca1-e2bb73b9c50b\" else null end }}"
                }
              ],
              "name": "{{ .inputs.name }}",
              "description": "{{ .inputs.incident_description }}"
            }
          },
          "requiredApproval": false
        }
        ```

        </details>

    5. Click `Save`.

    Now you should see the `Trigger an incident` action in the self-service page. 🎉

    <h3>Create an automation to upsert entity in port</h3>

    After each execution of the action, we would like to update the relevant entity in Port with the latest status.  

    To achieve this, we can create an automation that will be triggered when the action completes successfully.

    To create the automation:

    1. Head to the [automation](https://app.getport.io/settings/automations) page.

    2. Click on the `+ Automation` button.

    3. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Update FireHydrant service in Port automation (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "firehydrantIncident_sync_after_trigger",
          "title": "Sync FireHydrant Incident After Trigger",
          "description": "Update FireHydrant incident data in Port after triggering",
          "trigger": {
            "type": "automation",
            "event": {
              "type": "RUN_UPDATED",
              "actionIdentifier": "trigger_an_incident"
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
            "blueprintIdentifier": "firehydrantService",
            "mapping": {
              "identifier": "{{.event.diff.after.response.id}}",
              "title": "{{.event.diff.after.response.name}}",
              "properties": {
                "name": "{{.event.diff.after.response.name}}",
                "description": "{{.event.diff.after.response.description}}",
                "status": "{{.event.diff.after.response.status}}"
              }
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

      <h3>Add GitHub secrets</h3>

      In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
      - `FIREHYDRANT_API_KEY` - Your FireHydrant API key. [Follow the FireHydrant documentation](https://docs.firehydrant.com/docs/api-keys) to generate your key.
      - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
      - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

      <h3>Add GitHub workflow</h3>

      Create the file `.github/workflows/trigger-firehydrant-incident.yml` in the `.github/workflows` folder of your repository.

      <GithubDedicatedRepoHint/>

      <details>
      <summary><b>Trigger FireHydrant Incident Workflow (Click to expand)</b></summary>

      ```yaml showLineNumbers
      name: Trigger FireHydrant Incident

      on:
        workflow_dispatch:
          inputs:
            name:
              description: The name of the incident
              required: true
              type: string
            condition:
              description: The service status
              required: true
              type: string
              default: "Unavailable"
              enum:
                - Unavailable
                - Degraded
                - Bug
                - Operational
            incident_description:
              description: Description of the incident
              required: false
              type: string
            port_context:
              required: true
              description: includes blueprint, run ID, and entity identifier from Port.

      jobs:
        trigger:
          runs-on: ubuntu-latest
          steps:
            - name: Inform start of FireHydrant incident creation
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: Starting request to create FireHydrant incident

            - name: Get condition ID
              id: condition_id
              run: |
                case "${{ inputs.condition }}" in
                  "Unavailable")
                    echo "condition_id=b1fc9184-b3f3-4af1-a111-68abcad9bf34" >> $GITHUB_OUTPUT
                    ;;
                  "Degraded")
                    echo "condition_id=465a5b4c-6f95-4707-a777-ab4bb8def27d" >> $GITHUB_OUTPUT
                    ;;
                  "Bug")
                    echo "condition_id=c2bc11e8-7fcc-428d-9007-26f00700834a" >> $GITHUB_OUTPUT
                    ;;
                  "Operational")
                    echo "condition_id=9a2a8dbb-6b4e-4189-aca1-e2bb73b9c50b" >> $GITHUB_OUTPUT
                    ;;
                esac

            - name: Trigger FireHydrant Incident
              id: trigger
              uses: fjogeleit/http-request-action@v1
              with:
                url: 'https://api.firehydrant.io/v1/incidents'
                method: 'POST'
                customHeaders: '{"Content-Type": "application/json", "Authorization": "${{ secrets.FIREHYDRANT_API_KEY }}"}'
                data: >-
                  {
                    "impacts": [
                      {
                        "type": "service",
                        "id": "${{ fromJson(inputs.port_context).entity.relations.fh_service }}",
                        "condition_id": "${{ steps.condition_id.outputs.condition_id }}"
                      }
                    ],
                    "name": "${{ inputs.name }}",
                    "description": "${{ inputs.incident_description }}"
                  }

            - name: Inform completion of FireHydrant incident creation
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: Finished request to create FireHydrant incident

            - name: Update FireHydrant service in Port
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: UPSERT
                runId: ${{ fromJson(inputs.port_context).run_id }}
                identifier: ${{ fromJson(steps.trigger.outputs.response).id }}
                title: ${{ fromJson(steps.trigger.outputs.response).name }}
                blueprint: firehydrantService
                properties: |-
                  {
                    "name": "${{ fromJson(steps.trigger.outputs.response).name }}",
                    "description": "${{ fromJson(steps.trigger.outputs.response).description }}",
                    "status": "${{ fromJson(steps.trigger.outputs.response).status }}"
                  }
      ```
      </details>

      <h3>Set up self-service action</h3>

      We will create a self-service action to handle triggering FireHydrant incidents.
      To create a self-service action follow these steps:

      1. Head to the [self-service](https://app.getport.io/self-serve) page.
      2. Click on the `+ New Action` button.
      3. Click on the `{...} Edit JSON` button.
      4. Copy and paste the following JSON configuration into the editor.

          <details>
          <summary><b>Trigger FireHydrant Incident Action (Click to expand)</b></summary>

          <GithubActionModificationHint/>

          ```json showLineNumbers
          {
            "identifier": "trigger_firehydrant_incident",
            "title": "Trigger FireHydrant Incident",
            "icon": "FireHydrant",
            "description": "Trigger a new FireHydrant incident",
            "trigger": {
              "type": "self-service",
              "operation": "DAY-2",
              "userInputs": {
                "properties": {
                  "name": {
                    "icon": "DefaultProperty",
                    "type": "string",
                    "title": "Incident name"
                  },
                  "condition": {
                    "icon": "DefaultProperty",
                    "title": "Service status",
                    "type": "string",
                    "enum": [
                      "Unavailable",
                      "Degraded",
                      "Bug",
                      "Operational"
                    ],
                    "enumColors": {
                      "Unavailable": "lightGray",
                      "Degraded": "lightGray",
                      "Bug": "lightGray",
                      "Operational": "lightGray"
                    }
                  },
                  "incident_description": {
                    "type": "string",
                    "title": "Incident description"
                  }
                },
                "required": [
                  "name",
                  "condition"
                ],
                "order": [
                  "name",
                  "condition",
                  "incident_description"
                ]
              },
              "blueprintIdentifier": "service"
            },
            "invocationMethod": {
              "type": "GITHUB",
              "org": "<GITHUB_ORG>",
              "repo": "<GITHUB_REPO>",
              "workflow": "trigger-firehydrant-incident.yml",
              "workflowInputs": {
                "name": "{{.inputs.\"name\"}}",
                "condition": "{{.inputs.\"condition\"}}",
                "incident_description": "{{.inputs.\"incident_description\"}}",
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

      Now you should see the `Trigger FireHydrant Incident` action in the self-service page. 🎉

  </TabItem>
</Tabs>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal.

2. Choose either the GitHub workflow or webhook implementation:
   - For GitHub workflow: Click on `Trigger FireHydrant Incident`.
   - For webhook: Click on `Trigger an incident`.

3. Select the service you want to trigger an incident for (make sure it has a FireHydrant service relation)

4. Fill in the incident details:
   - Name of the incident
   - Service status (Unavailable, Degraded, Bug, or Operational)
   - Incident description (optional)

5. Click on `Execute`.

6. Done! Wait for the incident to be created in FireHydrant. 
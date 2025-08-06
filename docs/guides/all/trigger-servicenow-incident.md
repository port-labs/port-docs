---
displayed_sidebar: null
description: Learn how to trigger a ServiceNow incident in Port, ensuring prompt issue resolution and effective incident management.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Trigger ServiceNow Incident

## Overview
This guide will help you implement a self-service action in Port that allows you to trigger incidents in ServiceNow directly from Port.
This functionality streamlines incident management by enabling users to quickly create ServiceNow incidents without leaving Port.

You can implement this action in two ways:
1. **GitHub workflow**: A more flexible approach that allows for complex workflows and custom logic, suitable for teams that want to maintain their automation in Git.
2. **Synced webhooks**: A simpler approach that directly interacts with ServiceNow's API through Port, ideal for quick implementation and minimal setup.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your ServiceNow instance with permissions to create incidents.
- ServiceNow instance URL, username and password. Head over to [ServiceNow](https://signon.service-now.com/x_snc_sso_auth.do?pageId=username) to get your credentials.
- Optional - Install Port's ServiceNow integration [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/servicenow).

  :::tip ServiceNow integration
  This step is not required for this example, but it will create all the blueprint boilerplate for you, and also update the catalog in real time with the new incident created.
  :::

## Set up data model

If you haven't installed the ServiceNow integration, you'll need to create a blueprint for ServiceNow incidents in Port.
However, we highly recommend you install the ServiceNow integration to have these automatically set up for you.

<h3>Create the ServiceNow incident blueprint</h3>

<details>
<summary> <b> ServiceNow Incident Blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "servicenowIncident",
  "title": "Servicenow Incident",
  "icon": "Service",
  "schema": {
    "properties": {
      "category": {
        "title": "Category",
        "type": "string"
      },
      "reopenCount": {
        "title": "Reopen Count",
        "type": "string"
      },
      "severity": {
        "title": "Severity",
        "type": "string"
      },
      "assignedTo": {
        "title": "Assigned To",
        "type": "string",
        "format": "url"
      },
      "urgency": {
        "title": "Urgency",
        "type": "string"
      },
      "contactType": {
        "title": "Contact Type",
        "type": "string"
      },
      "createdOn": {
        "title": "Created On",
        "type": "string",
        "format": "date-time"
      },
      "createdBy": {
        "title": "Created By",
        "type": "string"
      },
      "isActive": {
        "title": "Is Active",
        "type": "boolean"
      },
      "priority": {
        "title": "Priority",
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

## Implementation

<Tabs>
  <TabItem value="webhook" label="Synced webhook" default>

    You can trigger ServiceNow incidents by leveraging Port's **synced webhooks** and **secrets** to directly interact with the ServiceNow API. This method simplifies the setup by handling everything within Port.

    <h3>Add Port secrets</h3>

    <ExistingSecretsCallout integration="ServiceNow" />


    To add these secrets to your portal:

    1. Click on the `...` button in the top right corner of your Port application.

    2. Click on **Credentials**.

    3. Click on the `Secrets` tab.

    4. Click on `+ Secret` and add the following secrets:
       - `SERVICENOW_INSTANCE_URL` - Your ServiceNow instance URL.
       - `SERVICENOW_API_TOKEN`: A base64 encoded string of your servicenow instance credentials generated as:

            ```bash showLineNumbers
            echo -n "your-instance-username:your-instance-password" | base64
            ```

    <h3>Set up self-service action</h3>

    Follow these steps to create the self-service action:

    1. Head to the [self-service](https://app.getport.io/self-serve) page.
    2. Click on the `+ New Action` button.
    3. Click on the `{...} Edit JSON` button.
    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Trigger ServiceNow Incident (Webhook) (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "servicenowIncident_trigger_incident_webhook",
          "title": "Trigger ServiceNow Incident (Webhook)",
          "icon": "Service",
          "description": "Trigger a new incident in ServiceNow using webhook",
          "trigger": {
            "type": "self-service",
            "operation": "CREATE",
            "userInputs": {
              "properties": {
                "short_description": {
                  "icon": "DefaultProperty",
                  "title": "Short Description",
                  "description": "Description of the incident",
                  "type": "string"
                },
                "assigned_to": {
                  "icon": "DefaultProperty",
                  "title": "Assigned To",
                  "description": "User this incident is assigned to",
                  "type": "string"
                },
                "urgency": {
                  "title": "Urgency",
                  "icon": "DefaultProperty",
                  "type": "string",
                  "default": "2",
                  "enum": [
                    "1",
                    "2",
                    "3"
                  ],
                  "enumColors": {
                    "1": "red",
                    "2": "yellow",
                    "3": "green"
                  }
                },
                "sysparm_display_value": {
                  "title": "Sysparm Display Value",
                  "description": "Determines the type of data returned",
                  "icon": "DefaultProperty",
                  "type": "string",
                  "default": "all",
                  "enum": [
                    "true",
                    "false",
                    "all"
                  ]
                },
                "sysparm_input_display_value": {
                  "title": "Sysparm Input Display Value",
                  "description": "Flag that indicates whether to set field values using the display value or the actual value",
                  "type": "boolean",
                  "default": false
                }
              },
              "required": [
                "short_description",
                "assigned_to"
              ],
              "order": [
                "short_description",
                "assigned_to",
                "urgency",
                "sysparm_display_value",
                "sysparm_input_display_value"
              ]
            },
            "blueprintIdentifier": "servicenowIncident"
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "{{.secrets.SERVICENOW_INSTANCE_URL}}/api/now/table/incident",
            "agent": false,
            "synchronized": true,
            "method": "POST",
            "headers": {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": "Basic {{.secrets.SERVICENOW_API_TOKEN}}"
            },
            "body": {
              "short_description": "{{.inputs.short_description}}",
              "assigned_to": "{{.inputs.assigned_to}}",
              "urgency": "{{.inputs.urgency}}",
              "sysparm_display_value": "{{.inputs.sysparm_display_value}}",
              "sysparm_input_display_value": "{{.inputs.sysparm_input_display_value}}"
            }
          },
          "requiredApproval": false
        }
        ```
        </details>

    5. Click `Save`.

    Now you should see the `Trigger ServiceNow Incident (Webhook)` action in the self-service page. 🎉

    <h3>Create an automation to upsert entity in port</h3>

    After each execution of the action, we would like to update the relevant entity in Port with the latest status.  

    To achieve this, we can create an automation that will be triggered when the action completes successfully.

    To create the automation:

    1. Head to the [automation](https://app.getport.io/settings/automations) page.

    2. Click on the `+ Automation` button.

    3. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Update ServiceNow incident in Port automation (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "servicenowIncident_sync_after_trigger",
          "title": "Sync ServiceNow Incident After Trigger",
          "description": "Update ServiceNow incident data in Port after triggering",
          "trigger": {
            "type": "automation",
            "event": {
              "type": "RUN_UPDATED",
              "actionIdentifier": "servicenowIncident_trigger_incident_webhook"
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
            "blueprintIdentifier": "servicenowIncident",
            "mapping": {
              "identifier": "{{.event.diff.after.response.result.number}}",
              "title": "{{.event.diff.after.response.result.short_description}}",
              "properties": {
                "category": "{{.event.diff.after.response.result.category}}",
                "reopenCount": "{{.event.diff.after.response.result.reopen_count}}",
                "severity": "{{.event.diff.after.response.result.severity}}",
                "assignedTo": "{{.event.diff.after.response.result.assigned_to.link}}",
                "urgency": "{{.event.diff.after.response.result.urgency}}",
                "contactType": "{{.event.diff.after.response.result.contact_type}}",
                "createdOn": "{{.event.diff.after.response.result.sys_created_on}}",
                "createdBy": "{{.event.diff.after.response.result.sys_created_by}}",
                "isActive": "{{.event.diff.after.response.result.active}}",
                "priority": "{{.event.diff.after.response.result.priority}}"
              }
            }
          },
          "publish": true
        }
        ```
        </details>

    4. Click `Save`.

    Now when you execute the webhook action, the incident data in Port will be automatically updated with the latest information from ServiceNow.

  </TabItem>

  <TabItem value="github" label="GitHub workflow">

      To implement this use-case using a GitHub workflow, follow these steps:

      <h3>Add GitHub secrets</h3>

      In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
      - `SERVICENOW_USERNAME` - ServiceNow instance username
      - `SERVICENOW_PASSWORD` - ServiceNow instance password.
      - `SERVICENOW_INSTANCE_URL` - ServiceNow instance URL.
      - `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
      - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).

      <h3>Add GitHub workflow</h3>

      Create the file `.github/workflows/trigger-servicenow-incident.yml` in the `.github/workflows` folder of your repository.

      <GithubDedicatedRepoHint/>

      <details>
      <summary><b>GitHub Workflow (Click to expand)</b></summary>

      ```yaml showLineNumbers
      name: Create an incident in ServiceNow

      on:
        workflow_dispatch:
          inputs:
            short_description:
              type: string
            assigned_to:
              type: string
            urgency:
              type: string
            sysparm_display_value:
              type: string
            sysparm_input_display_value:
              type: boolean
            port_payload:
              required: true
              description: "Port's payload, including details for who triggered the action and general context (blueprint, run id, etc...)"
              type: string

          secrets:
            SERVICENOW_USERNAME:
              required: true
            SERVICENOW_PASSWORD:
              required: true
            SERVICENOW_INSTANCE_URL:
              required: true
            PORT_CLIENT_ID:
              required: true
            PORT_CLIENT_SECRET:
              required: true

      jobs:
        create-entity-in-port-and-update-run:
          outputs:
            id: formatted_date
            value: ${{ steps.format_date.outputs.formatted_date }}

          runs-on: ubuntu-latest
          steps:
            - name: Inform start of ServiceNow incident creation
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_payload).context.runId}}
                logMessage: Starting request to create ServiceNow incident

            - name: Create a ServiceNow incident
              id: servicenow_incident
              uses: fjogeleit/http-request-action@v1
              with:
                url: "${{ secrets.SERVICENOW_INSTANCE_URL }}/api/now/table/incident"
                method: "POST"
                username: ${{ secrets.SERVICENOW_USERNAME }}
                password: ${{ secrets.SERVICENOW_PASSWORD }}
                customHeaders: '{"Content-Type": "application/json"}'
                data: '{"short_description": "${{ inputs.short_description }}", "assigned_to": "${{ inputs.assigned_to }}", "urgency": "${{ inputs.urgency }}", "sysparm_display_value": "${{ inputs.sysparm_display_value }}", "sysparm_input_display_value": "${{ inputs.sysparm_input_display_value }}"}'

            - name: Inform completion of ServiceNow incident creation
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_payload).context.runId}}
                logMessage: Finished request to create ServiceNow incident

            - name: Inform start of ingesting ServiceNow incident into Port
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_payload).context.runId}}
                logMessage: Ingesting ServiceNow incident into Port

            - name: Convert createdOn to desired format
              id: format_date
              run: |
                original_date="${{ fromJson(steps.servicenow_incident.outputs.response).result.sys_created_on }}"
                formatted_date=$(date -d "${original_date}" -u +"%Y-%m-%dT%H:%M:%SZ")
                echo "formatted_date=${formatted_date}" >> $GITHUB_OUTPUT

            - name: UPSERT Entity
              uses: port-labs/port-github-action@v1
              with:
                identifier: ${{ fromJson(steps.servicenow_incident.outputs.response).result.number }}
                title: ${{ fromJson(steps.servicenow_incident.outputs.response).result.short_description }}
                blueprint: servicenowIncident
                properties: |-
                  {
                    "category": "${{ fromJson(steps.servicenow_incident.outputs.response).result.category }}",
                    "reopenCount": "${{ fromJson(steps.servicenow_incident.outputs.response).result.reopen_count }}",
                    "severity": "${{ fromJson(steps.servicenow_incident.outputs.response).result.severity }}",
                    "assignedTo": "${{ fromJson(steps.servicenow_incident.outputs.response).result.assigned_to.link }}",
                    "urgency": "${{ fromJson(steps.servicenow_incident.outputs.response).result.urgency }}",
                    "contactType": "${{ fromJson(steps.servicenow_incident.outputs.response).result.contact_type }}",
                    "createdOn": "${{ steps.format_date.outputs.formatted_date }}",
                    "createdBy": "${{ fromJson(steps.servicenow_incident.outputs.response).result.sys_created_by }}",
                    "isActive": "${{ fromJson(steps.servicenow_incident.outputs.response).result.active }}",
                    "priority": "${{ fromJson(steps.servicenow_incident.outputs.response).result.priority }}"
                  }
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: UPSERT
                runId: ${{ fromJson(inputs.port_payload).context.runId }}

            - name: Inform of workflow completion
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_payload).context.runId }}
                link: ${{ secrets.SERVICENOW_INSTANCE_URL }}/incident.do?sys_id=${{ fromJson(steps.servicenow_incident.outputs.response).result.sys_id }}
                logMessage: Finished ingesting ServiceNow incident into Port
      ```
      </details>

      <h3>Set up self-service action</h3>

      We will create a self-service action to handle triggering ServiceNow incidents.
      To create a self-service action follow these steps:

      1. Head to the [self-service](https://app.getport.io/self-serve) page.
      2. Click on the `+ New Action` button.
      3. Click on the `{...} Edit JSON` button.
      4. Copy and paste the following JSON configuration into the editor.

          <details>
          <summary><b>Trigger ServiceNow Incident Action (Click to expand)</b></summary>

          <GithubActionModificationHint/>

          ```json showLineNumbers
          {
              "identifier": "trigger_servicenow_incident",
              "title": "Trigger ServiceNow incident",
              "icon": "Service",
              "userInputs": {
                "properties": {
                  "short_description": {
                    "icon": "DefaultProperty",
                    "title": "Short Description",
                    "description": "Description of the event",
                    "type": "string"
                  },
                  "sysparm_input_display_value": {
                    "title": "Sysparm Input Display Value",
                    "description": "Flag that indicates whether to set field values using the display value or the actual value.",
                    "type": "boolean",
                    "default": false
                  },
                  "urgency": {
                    "title": "Urgency",
                    "icon": "DefaultProperty",
                    "type": "string",
                    "default": "2",
                    "enum": [
                      "1",
                      "2",
                      "3"
                    ],
                    "enumColors": {
                      "1": "lightGray",
                      "2": "lightGray",
                      "3": "lightGray"
                    }
                  },
                  "assigned_to": {
                    "icon": "DefaultProperty",
                    "title": "Assigned To",
                    "description": "User this incident is assigned to",
                    "type": "string"
                  },
                  "sysparm_display_value": {
                    "title": "Sysparm Display Value",
                    "description": "Determines the type of data returned, either the actual values from the database or the display values of the fields.",
                    "icon": "DefaultProperty",
                    "type": "string",
                    "default": "all",
                    "enum": [
                      "true",
                      "false",
                      "all"
                    ],
                    "enumColors": {
                      "true": "lightGray",
                      "false": "lightGray",
                      "all": "lightGray"
                    }
                  }
                },
                "required": [
                  "assigned_to",
                  "short_description"
                ],
                "order": [
                  "short_description",
                  "assigned_to",
                  "urgency",
                  "sysparm_display_value",
                  "sysparm_input_display_value"
                ]
              },
              "invocationMethod": {
                "type": "GITHUB",
                "org": "<GITHUB_ORG>",
                "repo": "<GITHUB_REPO>",
                "workflow": "trigger-servicenow-incident.yml",
                "omitUserInputs": false,
                "omitPayload": false,
                "reportWorkflowStatus": true
              },
              "trigger": "CREATE",
              "description": "Triggers an incident in ServiceNow",
              "requiredApproval": false
          }
          ```
          </details>

      5. Click `Save`.

      Now you should see the `Trigger ServiceNow incident` action in the self-service page. 🎉

  </TabItem>
</Tabs>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Choose either the GitHub workflow or webhook implementation:
   - For GitHub workflow: Click on `Trigger ServiceNow incident`
   - For webhook: Click on `Trigger ServiceNow Incident (Webhook)`

3. Fill in the required details:
   - Short description of the incident
   - User the incident should be assigned to
   - Urgency level
   - Any additional parameters required

4. Click on `Execute`

5. Done! Wait for the incident to be created in ServiceNow

---
displayed_sidebar: null
description: Learn how to trigger a Datadog incident in Port, ensuring effective monitoring and prompt issue response.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Trigger Datadog Incident

## Overview
This guide will help you implement a self-service action in Port that allows you to quickly trigger incidents in Datadog directly from Port using Port's self service actions.

You can implement this action in two ways:
1. **GitHub workflow**: A more flexible approach that allows for complex workflows and custom logic, suitable for teams that want to maintain their automation in Git.
2. **Synced webhooks**: A simpler approach that directly interacts with Datadog's API through Port, ideal for quick implementation and minimal setup.

## Prerequisites
1. Complete the [onboarding process](/getting-started/overview).
2. Access to your Datadog organization with permissions to create incidents.
3. [Port's GitHub app](https://github.com/apps/getport-io) installed.
4. [Datadog API token](https://app.datadoghq.com/account/settings) with `incident_write` permission scope.

## Set up data model

If you haven't installed the [Datadog integration](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/datadog/), you'll need to create a blueprint for Datadog incidents.
However we highly recommend you install the Datadog integration to have this automatically set up for you.

<h3> Create the Datadog incident blueprint </h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>Datadog Incident Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "datadogIncident",
      "description": "This blueprint represents a Datadog incident in our software catalog",
      "title": "Datadog Incident",
      "icon": "Datadog",
      "schema": {
        "properties": {
          "customerImpactScope": {
            "title": "Customer Impact Scope", 
            "description": "A summary of the impact customers experienced during the incident.",
            "type": "string"
          },
          "customerImpacted": {
            "title": "Customer Impacted",
            "description": "A flag indicating whether the incident caused customer impact.",
            "type": "boolean",
            "default": false
          },
          "customerImpactStart": {
            "title": "Customer Impact Start",
            "type": "string", 
            "description": "Start time of incident affecting customer",
            "format": "date-time"
          },
          "customerImpactEnd": {
            "title": "Customer Impact End",
            "description": "End timestamp of incident affecting customers",
            "type": "string",
            "format": "date-time"
          },
          "created": {
            "title": "Created At",
            "description": "Timestamp of incident creation",
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "title": "Updated At",
            "description": "Last time incident was updated",
            "type": "string",
            "format": "date-time"
          },
          "customerImpactDuration": {
            "title": "Customer Impact Duration",
            "description": "Duration of customer impact",
            "type": "number"
          },
          "timeToDetect": {
            "title": "Time To Detect",
            "description": "Number of seconds it took to detect incident",
            "type": "number"
          },
          "timeToRepair": {
            "title": "Time To Repair",
            "description": "Number of seconds it took to fix incident",
            "type": "number"
          },
          "severity": {
            "title": "Severity",
            "description": "Severity of incident",
            "type": "string"
          },
          "state": {
            "title": "State",
            "description": "State of the incident",
            "type": "string"
          },
          "createdBy": {
            "title": "Created By",
            "description": "Name of user that created this incident",
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

## Implementation

<Tabs>
  <TabItem value="webhook" label="Synced webhook" default>

    You can trigger Datadog incidents by leveraging Port's **synced webhooks** and **secrets** to directly interact with the Datadog's API.
    This method simplifies the setup by handling everything within Port.

    <h3>Add Port secrets</h3>

    <ExistingSecretsCallout integration="Datadog" />

    To add these secrets to your portal:

    1. Click on the `...` button in the top right corner of your Port application.

    2. Click on **Credentials**.

    3. Click on the `Secrets` tab.

    4. Click on `+ Secret` and add the following secrets:
       - `DD_API_KEY`: Your Datadog API Key.
       - `DD_APPLICATION_KEY`: Your Datadog Application Key.

    <h3>Set up self-service action</h3>

    Follow these steps to create the self-service action:

    1. Head to the [self-service](https://app.getport.io/self-serve) page.
    2. Click on the `+ New Action` button.
    3. Click on the `{...} Edit JSON` button.
    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Trigger Datadog Incident Action Using Synced Webhook (Click to expand)</b></summary>

        :::tip Modification Required
        Make sure to replace `<YOUR_DD_API_URL>` with your Datadog API URL.  
        Datadog API URL by default should be [https://api.datadoghq.com](https://api.datadoghq.com).
        However, if you are on the Datadog EU site, set the secret to `https://api.datadoghq.eu`.  
        If you have your region information you use `https://api.<region>.datadoghq.com` or `https://api.<region>.datadoghq.eu`.
        :::

        ```json showLineNumbers
        {
          "identifier": "datadogIncident_trigger_datadog_incident_webhook",
          "title": "Trigger Datadog Incident (Webhook)",
          "icon": "Datadog",
          "description": "Triggers a Datadog incident using a synced webhook",
          "trigger": {
            "type": "self-service",
            "operation": "CREATE",
            "userInputs": {
              "properties": {
                "title": {
                  "title": "Title",
                  "description": "The title of the incident, summarizing what happened.",
                  "type": "string"
                },
                "customerImpacted": {
                  "title": "Customer Impacted",
                  "description": "Indicates whether the incident caused customer impact.",
                  "type": "boolean",
                  "default": false
                },
                "customerImpactScope": {
                  "icon": "DefaultProperty",
                  "title": "Customer Impact Scope",
                  "description": "Summary of the impact experienced by customers.",
                  "type": "string"
                },
                "notificationHandleName": {
                  "title": "Notification Handle Name",
                  "description": "The name of the notification handle.",
                  "type": "string"
                },
                "notificationHandleEmail": {
                  "title": "Notification Handle Email",
                  "description": "The email address used for the notification.",
                  "type": "string",
                  "pattern": "^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
                }
              },
              "required": [
                "title",
                "customerImpacted",
                "notificationHandleName",
                "notificationHandleEmail",
                "customerImpactScope"
              ],
              "order": [
                "title",
                "customerImpacted",
                "customerImpactScope",
                "notificationHandleName",
                "notificationHandleEmail"
              ]
            },
            "blueprintIdentifier": "datadogIncident"
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "<YOUR_DD_API_URL>/api/v2/incidents",
            "agent": false,
            "synchronized": true,
            "method": "POST",
            "headers": {
              "Content-Type": "application/json",
              "DD-API-KEY": "{{ .secrets.DD_API_KEY }}",
              "DD-APPLICATION-KEY": "{{ .secrets.DD_APPLICATION_KEY }}"
            },
            "body": {
              "data": {
                "type": "incidents",
                "attributes": {
                  "customer_impact_scope": "{{.inputs.\"customerImpactScope\"}}",
                  "customer_impacted": "{{.inputs.\"customerImpacted\"}}",
                  "title": "{{.inputs.\"title\"}}",
                  "notification_handles": [
                    {
                      "display_name": "{{.inputs.\"notificationHandleName\"}}",
                      "handle": "{{.inputs.\"notificationHandleEmail\"}}"
                    }
                  ]
                }
              }
            }
          },
          "requiredApproval": false
        }
        ```

        </details>

    5. Click `Save`.

    Now you should see the `Trigger Datadog Incident (Webhook)` action in the self-service page. 🎉

    :::note Install the Datadog Integration
    Triggering the incident data via the api will not automatically update the incident data in your Port catalog.  
    To ensure that the Datadog incident data remains up to date in your catalog, [install the Datadog integration](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/datadog/) in Port.   
    :::

  </TabItem>

  <TabItem value="github" label="GitHub workflow">

      To implement this use-case using a GitHub workflow, follow these steps:

      <h3>Add GitHub secrets</h3>

      In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
      * `DD_API_URL` - Datadog API URL by default should be [https://api.datadoghq.com](https://api.datadoghq.com). However, if you are on the Datadog EU site, set the secret to `https://api.datadoghq.eu`. If you have your region information you use `https://api.<region>.datadoghq.com` or `https://api.<region>.datadoghq.eu`.
      * `DD_API_KEY` - Datadog API Key.
      * `DD_APPLICATION_KEY` - Datadog Application Key.
      * `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
      * `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)

      <h3>Add GitHub workflow</h3>

      Create the file `.github/workflows/trigger-datadog-incident.yml` in the `.github/workflows` folder of your repository.

      <GithubDedicatedRepoHint/>

      <details>
      <summary><b>Trigger Datadog Incident Workflow (Click to expand)</b></summary>

      ```yaml showLineNumbers
      name: Trigger Datadog Incident
      on:
        workflow_dispatch:
          inputs:
            title:
              type: string
            customerImpacted:
              type: boolean
              required: true
            customerImpactScope:
              type: string
              description: Required if customer_impacted:"true". A summary of the impact customers experienced during the incident.
            notificationHandleName:
              type: string
            notificationHandleEmail:
              type: string
            port_context:
              required: true
              type: string
      jobs:
        create-entity-in-port-and-update-run:

          runs-on: ubuntu-latest
          steps:
            - name: Inform start of Datadog incident creation
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: Starting request to create Datadog incident

            - name: Get current timestamp
              id: timestamp
              run: |
                echo "current_time=$(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> $GITHUB_OUTPUT

            - name: Create a Datadog incident (No Customer Impact)
              id: datadog_incident_no_impact
              if: ${{ !inputs.customerImpacted }}
              uses: fjogeleit/http-request-action@v1
              with:
                url: "${{ secrets.DD_API_URL }}/api/v2/incidents"
                method: "POST"
                customHeaders: '{"Content-Type": "application/json", "DD-API-KEY": "${{ secrets.DD_API_KEY }}", "DD-APPLICATION-KEY": "${{ secrets.DD_APPLICATION_KEY }}"}'
                data: >-
                  {
                    "data": {
                      "type": "incidents",
                      "attributes": {
                        "title": "${{ inputs.title }}",
                        "customer_impacted": "${{ inputs.customerImpacted }}",
                        "description": ${{ inputs.customerImpacted == 'true' && format('"{0}"','This is a hardcoded description because customers ARE impacted') || 'null' }},
                        "customer_impact_start": ${{ inputs.customerImpacted == 'false' && format('"{0}"', steps.timestamp.outputs.current_time) || 'null' }},
                        "notification_handles": [
                          {
                            "display_name": "${{ inputs.notificationHandleName }}",
                            "handle": "${{ inputs.notificationHandleEmail }}"
                          }
                        ]
                      }
                    }
                  }

            - name: Create a Datadog incident (With Customer Impact)
              id: datadog_incident_with_impact
              if: ${{ inputs.customerImpacted }}
              uses: fjogeleit/http-request-action@v1
              with:
                url: "${{ secrets.DD_API_URL }}/api/v2/incidents"
                method: "POST"
                customHeaders: '{"Content-Type": "application/json", "DD-API-KEY": "${{ secrets.DD_API_KEY }}", "DD-APPLICATION-KEY": "${{ secrets.DD_APPLICATION_KEY }}"}'
                data: '{"data": {"type": "incidents", "attributes": {"customer_impact_scope": "${{ inputs.customerImpactScope }}", "customer_impacted": "${{ inputs.customerImpacted }}", "title": "${{ inputs.title }}", "notification_handles": [{"display_name": "${{ inputs.notificationHandleName }}", "handle": "${{ inputs.notificationHandleEmail }}"}]}}}'

            - name: Set output ID
              id: datadog_incident
              run: |
                if ${{ inputs.customerImpacted }}; then
                  echo "response=${{ steps.datadog_incident_with_impact.outputs.response }}" >> $GITHUB_OUTPUT
                else
                  echo "response=${{ steps.datadog_incident_no_impact.outputs.response }}" >> $GITHUB_OUTPUT
                fi

            - name: Inform completion of Datadog incident creation
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: Finished request to create Datadog incident
            
            - name: Inform ingestion of Datadog incident into Port
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: Ingesting Datadog incident into Port

            - name: Convert dates to desired format
              id: format_date
              run: |
                if ${{ inputs.customerImpacted }}; then
                  response='${{ steps.datadog_incident_with_impact.outputs.response }}'
                else
                  response='${{ steps.datadog_incident_no_impact.outputs.response }}'
                fi
                
                # Extract dates using jq and convert them if they exist
                customer_impact_start=$(jq -r '.data.attributes.customer_impact_start // empty' <<< "$response")
                customer_impact_end=$(jq -r '.data.attributes.customer_impact_end // empty' <<< "$response")
                created=$(jq -r '.data.attributes.created // empty' <<< "$response")
                modified=$(jq -r '.data.attributes.modified // empty' <<< "$response")
                
                # Convert dates if they exist
                if [ ! -z "$customer_impact_start" ]; then
                  customer_impact_start=$(date -d "$customer_impact_start" -u +"%Y-%m-%dT%H:%M:%SZ")
                fi
                if [ ! -z "$customer_impact_end" ]; then
                  customer_impact_end=$(date -d "$customer_impact_end" -u +"%Y-%m-%dT%H:%M:%SZ")
                fi
                if [ ! -z "$created" ]; then
                  created=$(date -d "$created" -u +"%Y-%m-%dT%H:%M:%SZ")
                fi
                if [ ! -z "$modified" ]; then
                  modified=$(date -d "$modified" -u +"%Y-%m-%dT%H:%M:%SZ")
                fi
                
                # Output the results
                echo "customer_impact_start=${customer_impact_start:-}" >> $GITHUB_OUTPUT
                echo "customer_impact_end=${customer_impact_end:-}" >> $GITHUB_OUTPUT
                echo "created=${created:-}" >> $GITHUB_OUTPUT
                echo "modified=${modified:-}" >> $GITHUB_OUTPUT

            - name: UPSERT Entity (No Customer Impact)
              if: ${{ !inputs.customerImpacted }}
              uses: port-labs/port-github-action@v1
              with:
                identifier: ${{ fromJson(steps.datadog_incident_no_impact.outputs.response).data.id }}
                title: ${{ fromJson(steps.datadog_incident_no_impact.outputs.response).data.attributes.title }}
                blueprint: ${{ fromJson(inputs.port_context).blueprint }}
                properties: |-
                  {
                    "customerImpactScope": "${{ fromJson(steps.datadog_incident_no_impact.outputs.response).data.attributes.customer_impact_scope }}",
                    "customerImpacted": ${{ fromJson(steps.datadog_incident_no_impact.outputs.response).data.attributes.customer_impacted }}
                    ${{ steps.format_date.outputs.customer_impact_start != '' && format(', "customerImpactStart": "{0}"', steps.format_date.outputs.customer_impact_start) || '' }}
                    ${{ steps.format_date.outputs.customer_impact_end != '' && format(', "customerImpactEnd": "{0}"', steps.format_date.outputs.customer_impact_end) || '' }}
                    ${{ steps.format_date.outputs.created != '' && format(', "created": "{0}"', steps.format_date.outputs.created) || '' }}
                    ${{ steps.format_date.outputs.modified != '' && format(', "updatedAt": "{0}"', steps.format_date.outputs.modified) || '' }},
                    "createdBy": "${{ fromJson(steps.datadog_incident_no_impact.outputs.response).data.attributes.created_by.data.attributes.name }}",
                    "customerImpactDuration": "${{ fromJson(steps.datadog_incident_no_impact.outputs.response).data.attributes.customer_impact_duration }}",
                    "timeToDetect": "${{ fromJson(steps.datadog_incident_no_impact.outputs.response).data.attributes.time_to_detect }}",
                    "timeToRepair": "${{ fromJson(steps.datadog_incident_no_impact.outputs.response).data.attributes.time_to_repair }}",
                    "severity": "${{ fromJson(steps.datadog_incident_no_impact.outputs.response).data.attributes.severity }}",
                    "state": "${{ fromJson(steps.datadog_incident_no_impact.outputs.response).data.attributes.state }}"
                  }
                relations: "{}"
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: UPSERT
                runId: ${{ fromJson(inputs.port_context).run_id }}

            - name: UPSERT Entity (With Customer Impact)
              if: ${{ inputs.customerImpacted }}
              uses: port-labs/port-github-action@v1
              with:
                identifier: ${{ fromJson(steps.datadog_incident_with_impact.outputs.response).data.id }}
                title: ${{ fromJson(steps.datadog_incident_with_impact.outputs.response).data.attributes.title }}
                blueprint: ${{ fromJson(inputs.port_context).blueprint }}
                properties: |-
                  {
                    "customerImpactScope": "${{ fromJson(steps.datadog_incident_with_impact.outputs.response).data.attributes.customer_impact_scope }}",
                    "customerImpacted": ${{ fromJson(steps.datadog_incident_with_impact.outputs.response).data.attributes.customer_impacted }}
                    ${{ steps.format_date.outputs.customer_impact_start != '' && format(', "customerImpactStart": "{0}"', steps.format_date.outputs.customer_impact_start) || '' }}
                    ${{ steps.format_date.outputs.customer_impact_end != '' && format(', "customerImpactEnd": "{0}"', steps.format_date.outputs.customer_impact_end) || '' }}
                    ${{ steps.format_date.outputs.created != '' && format(', "created": "{0}"', steps.format_date.outputs.created) || '' }}
                    ${{ steps.format_date.outputs.modified != '' && format(', "updatedAt": "{0}"', steps.format_date.outputs.modified) || '' }},
                    "createdBy": "${{ fromJson(steps.datadog_incident_with_impact.outputs.response).data.attributes.created_by.data.attributes.name }}",
                    "customerImpactDuration": "${{ fromJson(steps.datadog_incident_with_impact.outputs.response).data.attributes.customer_impact_duration }}",
                    "timeToDetect": "${{ fromJson(steps.datadog_incident_with_impact.outputs.response).data.attributes.time_to_detect }}",
                    "timeToRepair": "${{ fromJson(steps.datadog_incident_with_impact.outputs.response).data.attributes.time_to_repair }}",
                    "severity": "${{ fromJson(steps.datadog_incident_with_impact.outputs.response).data.attributes.severity }}",
                    "state": "${{ fromJson(steps.datadog_incident_with_impact.outputs.response).data.attributes.state }}"
                  }
                relations: "{}"
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: UPSERT
                runId: ${{ fromJson(inputs.port_context).run_id }}

            - name: Inform completion of Datadog incident ingestion into Port
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                link: ${{ secrets.DD_API_URL }}/incidents/${{ inputs.customerImpacted && fromJson(steps.datadog_incident_with_impact.outputs.response).data.id || fromJson(steps.datadog_incident_no_impact.outputs.response).data.id }}
                logMessage: Finished request to ingest Datadog incident into Port

            - name: Inform of workflow completion
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: Workflow completed
      ```

      </details>

      <h3>Set up self-service action</h3>

      We will create a self-service action to handle triggering Datadog incidents.
      To create a self-service action follow these steps:

      1. Head to the [self-service](https://app.getport.io/self-serve) page.
      2. Click on the `+ New Action` button.
      3. Click on the `{...} Edit JSON` button.
      4. Copy and paste the following JSON configuration into the editor.

          <details>
          <summary><b>Trigger Datadog Incident Action (Click to expand)</b></summary>

          <GithubActionModificationHint/>

          ```json showLineNumbers
          {
            "identifier": "datadogIncident_trigger_datadog_incident",
            "title": "Trigger Datadog Incident",
            "icon": "Datadog",
            "description": "Triggers Datadog incident",
            "trigger": {
              "type": "self-service",
              "operation": "CREATE",
              "userInputs": {
                "properties": {
                  "customerImpacted": {
                    "icon": "DefaultProperty",
                    "title": "Customer Impacted",
                    "description": "A flag indicating whether the incident caused customer impact.",
                    "type": "boolean",
                    "default": false
                  },
                  "customerImpactScope": {
                    "icon": "DefaultProperty",
                    "title": "Customer Impact Scope",
                    "description": "A summary of the impact customers experienced during the incident. Required if \"Customer Impacted\" is true.",
                    "type": "string"
                  },
                  "title": {
                    "title": "Title",
                    "description": "The title of the incident, which summarizes what happened.",
                    "type": "string"
                  },
                  "notificationHandleName": {
                    "icon": "DefaultProperty",
                    "title": "Notification Handle Name",
                    "type": "string",
                    "description": "The name of the notified handle."
                  },
                  "notificationHandleEmail": {
                    "icon": "DefaultProperty",
                    "title": "Notification Handle Email",
                    "description": "The email address used for the notification.",
                    "type": "string",
                    "pattern": "^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"
                  }
                },
                "required": [
                  "customerImpacted",
                  "title",
                  "customerImpactScope",
                  "notificationHandleName",
                  "notificationHandleEmail"
                ],
                "order": [
                  "title",
                  "customerImpacted",
                  "customerImpactScope",
                  "notificationHandleName",
                  "notificationHandleEmail"
                ]
              },
              "blueprintIdentifier": "datadogIncident"
            },
            "invocationMethod": {
              "type": "GITHUB",
              "repo": "<GITHUB_REPO>",
              "org": "<GITHUB_ORG>",
              "workflow": "trigger-datadog-incident.yml",
              "workflowInputs": {
                "customerImpactScope": "{{.inputs.\"customerImpactScope\"}}",
                "customerImpacted": "{{.inputs.\"customerImpacted\"}}",
                "title": "{{.inputs.\"title\"}}",
                "notificationHandleName": "{{.inputs.\"notificationHandleName\"}}",
                "notificationHandleEmail": "{{.inputs.\"notificationHandleEmail\"}}",
                "port_context": {
                  "blueprint": "{{.action.blueprint}}",
                  "run_id": "{{.run.id}}"
                }
              },
              "reportWorkflowStatus": true
            },
            "requiredApproval": false
          }
          ```
          </details>

      5. Click `Save`.

      Now you should see the `Trigger Datadog Incident` action in the self-service page. 🎉

  </TabItem>
</Tabs>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Choose either the GitHub workflow or webhook implementation:
   - For GitHub workflow: Click on `Trigger Datadog Incident`
   - For webhook: Click on `Trigger Datadog Incident (Webhook)`

3. Fill in the incident details:
   - Title of the incident
   - Whether customers are impacted
   - Customer impact scope (if customers are impacted)
   - Notification handle name and email

4. Click on `Execute`

5. Wait for:
   - GitHub workflow: The workflow to complete and create the incident
   - Webhook: The incident to be created in Datadog

6. Check your Datadog incidents page to see the new incident

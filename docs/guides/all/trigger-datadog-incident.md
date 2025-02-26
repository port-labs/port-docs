---
displayed_sidebar: null
description: Learn how to trigger a Datadog incident in Port, ensuring effective monitoring and prompt issue response.
---

# Trigger Datadog Incident

This GitHub action allows you to quickly trigger incidents in Datadog directly from Port using Port's self service actions.

## Prerequisites
1. [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed.
2. Datadog API Key. Head over to your account's [API and application keys page](https://app.datadoghq.com/account/settings) to create a new API key. The API key should have the `incident_write` permission scope.
3. Datadog Application Key. This key is available on the same page as the Datadog API key.
4. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
    * `DD_API_URL` - Datadog API URL by default should be [https://api.datadoghq.com](https://api.datadoghq.com). However, if you are on the Datadog EU site, set the secret to `https://api.datadoghq.eu`. If you have your region information you use `https://api.<region>.datadoghq.com` or `https://api.<region>.datadoghq.eu`.
    * `DD_API_KEY` - Datadog API Key.
    * `DD_APPLICATION_KEY` - Datadog Application Key.
    * `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
    * `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)

5. Create a Datadog incident blueprint in Port using the schema below:

<details>
<summary><b>Datadog Incident Blueprint</b></summary>

```json showLineNumbers
{
    "identifier": "datadogIncident",
    "description": "This blueprint represents a Datadog incident in our software catalog",
    "title": "datadogIncident",
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


## GitHub Workflow
Create the file `trigger-datadog-incident.yml` in the `.github/workflows` folder of your repository and copy the content of the workflow configuration below:

:::tip Dedicated repository
We recommend creating a dedicated repository for the workflows that are used by Port actions.
:::

<details>
<summary><b>Trigger Datadog Incident Workflow (Click to expand)</b></summary>

```yaml
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

## Port Configuration
On the [self-service](https://app.getport.io/self-serve) page, create the Port action against the `Datadog Incident` blueprint. This will trigger the GitHub workflow.

<details>
<summary><b>Trigger Datadog Incident Action (Click to expand)</b></summary>

:::tip Modification Required
Make sure to replace `<GITHUB_ORG>` and `<GITHUB_REPO>` with your GitHub organization and repository names respectively
:::

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
    "repo": "<Enter GitHub repository>",
    "org": "<Enter GitHub organization>",
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

## Let's test it

1. Trigger the action from Port's [Self Serve hub](https://app.getport.io/self-serve)

2. Done! wait for the incident to be triggered in Datadog

Congrats 🎉 You've triggered your first incident in Datadog from Port!
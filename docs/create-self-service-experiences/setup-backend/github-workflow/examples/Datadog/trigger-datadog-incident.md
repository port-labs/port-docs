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
    * `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
    * `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)

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

```yaml showLineNumbers
name: Trigger Datadog Incident
on:
  workflow_dispatch:
    inputs:
      customerImpactScope:
        type: string
      customerImpacted:
        type: boolean
      title:
        type: string
      notificationHandleName:
        type: string
      notificationHandleEmail:
        type: string
      port_payload:
        required: true
        description: Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
        type: string
      secrets:
        DD_API_KEY:
          required: true
        DD_APPLICATION_KEY:
          required: true
        DD_API_URL:
          required: true
        PORT_CLIENT_ID:
          required: true
        PORT_CLIENT_SECRET:
          required: true
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
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Starting request to create Datadog incident

      - name: Create a Datadog incident
        id: datadog_incident
        uses: fjogeleit/http-request-action@v1
        with:
          url: "${{ secrets.DD_API_URL }}/api/v2/incidents"
          method: "POST"
          customHeaders: '{"Content-Type": "application/json", "DD-API-KEY": "${{ secrets.DD_API_KEY }}", "DD-APPLICATION-KEY": "${{ secrets.DD_APPLICATION_KEY }}"}'
          data: '{"data": {"type": "incidents", "attributes": {"customer_impact_scope": "${{ inputs.customerImpactScope }}", "customer_impacted": "${{ inputs.customerImpacted }}", "title": "${{ inputs.title }}", "notification_handles": [{"display_name": "${{ inputs.notificationHandleName }}", "handle": "${{ inputs.notificationHandleEmail }}"}]}}}'

      - name: Inform completion of Datadog incident creation
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Finished request to create Datadog incident
      
      - name: Inform ingestion of Datadog incident into Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Ingesting Datadog incident into Port

      - name: Convert dates to desired format
        id: format_date
        run: |
          customer_impact_start=$(date -d "${{ fromJson(steps.datadog_incident.outputs.response).data.attributes.customer_impact_start }}" -u +"%Y-%m-%dT%H:%M:%SZ")
          customer_impact_end=$(date -d "${{ fromJson(steps.datadog_incident.outputs.response).data.attributes.customer_impact_end }}" -u +"%Y-%m-%dT%H:%M:%SZ")
          created=$(date -d "${{ fromJson(steps.datadog_incident.outputs.response).data.attributes.created }}" -u +"%Y-%m-%dT%H:%M:%SZ")
          modified=$(date -d "${{ fromJson(steps.datadog_incident.outputs.response).data.attributes.modified }}" -u +"%Y-%m-%dT%H:%M:%SZ")
          echo "customer_impact_start=${customer_impact_start}" >> $GITHUB_OUTPUT
          echo "customer_impact_end=${customer_impact_end}" >> $GITHUB_OUTPUT
          echo "created=${created}" >> $GITHUB_OUTPUT
          echo "modified=${modified}" >> $GITHUB_OUTPUT

      - name: UPSERT Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{ fromJson(steps.datadog_incident.outputs.response).data.id }}
          title: ${{ fromJson(steps.datadog_incident.outputs.response).data.attributes.title }}
          blueprint: datadogIncident
          properties: |-
            {
              "customerImpactScope": "${{ fromJson(steps.datadog_incident.outputs.response).data.attributes.customer_impact_scope }}",
              "customerImpacted": "${{ fromJson(steps.datadog_incident.outputs.response).data.attributes.customer_impacted }}",
              "customerImpactStart": "${{ steps.format_date.outputs.customer_impact_start }}",
              "customerImpactEnd": "${{ steps.format_date.outputs.customer_impact_end }}",
              "createdBy": "${{ fromJson(steps.datadog_incident.outputs.response).data.attributes.created_by.data.attributes.name }}",
              "created": "${{ steps.format_date.outputs.created }}",
              "updatedAt": "${{ steps.format_date.outputs.modified }}",
              "customerImpactDuration": "${{ fromJson(steps.datadog_incident.outputs.response).data.attributes.customer_impact_duration }}",
              "timeToDetect": "${{ fromJson(steps.datadog_incident.outputs.response).data.attributes.time_to_detect }}",
              "timeToRepair": "${{ fromJson(steps.datadog_incident.outputs.response).data.attributes.time_to_repair }}",
              "severity": "${{ fromJson(steps.datadog_incident.outputs.response).data.attributes.severity }}",
              "state": "${{ fromJson(steps.datadog_incident.outputs.response).data.attributes.state }}"
            }
          relations: "{}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{fromJson(inputs.port_payload).context.runId}}
    
      - name: Inform completion of Datadog incident ingestion into Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          link: ${{ secrets.DD_API_URL }}/incidents/${{ fromJson(steps.datadog_incident.outputs.response).data.id }}
          logMessage: Finished request to ingest Datadog incident into Port

      - name: Inform of workflow completion
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
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
    "identifier": "trigger_datadog_incident",
    "title": "Trigger Datadog Incident",
    "icon": "Datadog",
    "userInputs": {
      "properties": {
        "customerImpactScope": {
          "title": "Customer Impact Scope",
          "description": "A summary of the impact customers experienced during the incident.",
          "type": "string"
        },
        "customerImpacted": {
          "title": "Customer Impacted",
          "description": "A flag indicating whether the incident caused customer impact.",
          "type": "boolean"
        },
        "title": {
          "title": "Title",
          "description": "The title of the incident, which summarizes what happened.",
          "type": "string"
        },
        "notificationHandleName": {
          "title": "Notification Handle Name",
          "type": "string",
          "description": "The name of the notified handle."
        },
        "notificationHandleEmail": {
          "title": "Notification Handle Email",
          "description": "The email address used for the notification.",
          "type": "string",
          "pattern": "^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"
        }
      },
      "required": [
        "customerImpacted",
        "title"
      ],
      "order": [
        "title",
        "customerImpacted",
        "customerImpactScope",
        "notificationHandleName",
        "notificationHandleEmail"
      ]
    },
    "invocationMethod": {
      "type": "GITHUB",
      "org": "<GITHUB_ORG>",
      "repo": "<GITHUB_REPO>",
      "workflow": "trigger-datadog-incident.yml",
      "omitUserInputs": false,
      "omitPayload": false,
      "reportWorkflowStatus": true
    },
    "trigger": "CREATE",
    "description": "Triggers Datadog incident",
    "requiredApproval": false
}
```
</details>

## Let's test it

1. Trigger the action from Port's [Self Serve hub](https://app.getport.io/self-serve)

2. Done! wait for the incident to be triggered in Datadog

Congrats 🎉 You've triggered your first incident in Datadog from Port!
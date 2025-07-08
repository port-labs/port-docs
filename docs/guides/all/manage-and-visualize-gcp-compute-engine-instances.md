---
displayed_sidebar: null
description: Learn how to monitor and manage your GCP Compute Engine instances using dashboards and self-service actions in Port.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Manage and visualize your GCP Compute Engine instances

This guide demonstrates how to bring your GCP Compute Engine management experience into Port. You will learn how to:

- Ingest Compute Engine data into Port's software catalog using **Port's GCP** integration.
- Set up **self-service actions** to manage Compute Engine instances (start and stop).
- Build **dashboards** in Port to monitor and take action on your Compute Engine resources.

<img src="/img/guides/gcpComputeDashboard1.png" border="1px" width="100%" />
<img src="/img/guides/gcpComputeDashboard2.png" border="1px" width="100%" />

## Common use cases

- Monitor the status and health of all Compute Engine instances across projects from a single dashboard.
- Empower platform teams to automate day-2 operations via GitHub workflows.
- Track instances without deletion protection for security compliance.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [GCP integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/gcp/) is installed in your account.

<GithubDedicatedRepoHint/>


## Set up data model

When installing the GCP integration in Port, the `GCP Project` blueprint is created by default.  
However, the `Compute Instance` blueprint is not created automatically so we will need to create it manually.

### Create the Compute Instance blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:
    <details>
    <summary><b>GCP Compute Instance blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "gcpComputeInstance",
      "description": "This blueprint represents a GCP Compute Instance in our software catalog",
      "title": "Compute Instance",
      "icon": "GoogleCloud",
      "schema": {
        "properties": {
          "subnetworks": {
            "title": "Subnetwork",
            "type": "array"
          },
          "cpuPlatform": {
            "title": "CPU Platform",
            "type": "string"
          },
          "status": {
            "type": "string",
            "title": "Status",
            "enum": [
              "RUNNING",
              "STOPPING",
              "TERMINATED"
            ],
            "enumColors": {
              "RUNNING": "green",
              "STOPPING": "lightGray",
              "TERMINATED": "red"
            }
          },
          "createdAt": {
            "type": "string",
            "title": "Created At",
            "format": "date-time"
          },
          "tags": {
            "type": "object",
            "title": "Tags"
          },
          "deletionProtection": {
            "type": "boolean",
            "title": "Deletion Protection"
          },
          "lastStartedAt": {
            "type": "string",
            "title": "Last Started At",
            "format": "date-time"
          },
          "selfLink": {
            "type": "string",
            "title": "Self Link",
            "format": "url"
          },
          "zone": {
            "type": "string",
            "title": "Zone"
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
          "target": "gcpProject",
          "required": false,
          "many": false
        }
      }
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


### Update the integration mapping

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Select the GCP integration.
3. Add the following YAML block into the editor to ingest compute instances from your GCP projects:

    <details>
    <summary><b>GCP integration configuration (Click to expand)</b></summary>

    ```yaml showLineNumbers
    deleteDependentEntities: true
    createMissingRelatedEntities: true
    enableMergeEntity: true
    resources:
      - kind: cloudresourcemanager.googleapis.com/Project
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .name
              title: .display_name
              blueprint: '"gcpProject"'
              properties:
                labels: .labels
      - kind: compute.googleapis.com/Instance
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .id
              title: .name
              blueprint: '"gcpComputeInstance"'
              properties:
                machineType: .machineType
                createdAt: .creationTimestamp
                status: .status
                subnetworks: .networkInterfaces[].subnetwork
                cpuPlatform: .cpuPlatform
                selfLink: .selfLink
                tags: .tags
                deletionProtection: .deletionProtection
                lastStartedAt: .lastStartTimestamp
                zone: .zone | split("/")[-1]
              relations:
                project: .__project.name
    ```
    </details>
    
4. Click `Save & Resync` to apply the mapping.


## Set up self-service actions

Now let us create self-service actions to manage your Compute Engine instances directly from Port using GitHub Actions. You will implement workflows to:

1. Start a Compute Engine instance.
2. Stop a Compute Engine instance.

To implement these use-cases, follow the steps below:

### Add GitHub secrets

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `GCP_SERVICE_ACCOUNT_KEY` - Your GCP service account key JSON (minified to a single line).

:::tip Minifying JSON for GitHub Secrets
To avoid aggressive log sanitization, minify your service account JSON into a single line before storing it as a GitHub secret. You can use an online tool or the following command to minify the json:

```bash
jq -c '.' your-service-account-key.json | pbcopy
```
:::

:::caution Required permissions
The GCP service account must have the following permissions:
- `compute.instances.start` - to start Compute Engine instances
- `compute.instances.stop` - to stop Compute Engine instances
- `compute.instances.get` - to read instance details (used to extract zone information)
- `compute.zones.get` - to list zones (for zone validation)

Alternatively, you can assign the `roles/compute.instanceAdmin.v1` role which includes these permissions.
:::


### Start a Compute Engine instance

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/start-gcp-instance.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>Start Compute Engine GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Start GCP Compute Engine Instance

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  start-instance:
    runs-on: ubuntu-latest
    # Add "id-token" with the intended permissions.
    permissions:
      contents: 'read'
      id-token: 'write'
    steps:
      - uses: 'actions/checkout@v4'
      
      - name: Inform Port of workflow start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring GCP credentials to start Compute Engine instance with name ${{ fromJson(inputs.port_context).entity.title }}

      - id: 'auth'
        uses: 'google-github-actions/auth@v2'
        with:
          credentials_json: '${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}'

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2
        
      - name: Start Compute Engine instance
        run: |
          gcloud compute instances start ${{ fromJson(inputs.port_context).entity.title }} --zone=${{ fromJson(inputs.port_context).entity.properties.zone }}
          
      - name: Inform Port about Compute Engine start success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ Compute Engine instance with name ${{ fromJson(inputs.port_context).entity.title }} started successfully
          summary: Compute Engine instance start completed successfully

      - name: Inform Port about Compute Engine start failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to start Compute Engine instance with name ${{ fromJson(inputs.port_context).entity.title }}
          summary: Compute Engine instance start failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Start Compute Engine instance action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "start_gcp_compute_instance",
      "title": "Start Compute Engine Instance",
      "icon": "GoogleCloud",
      "description": "Start a GCP Compute Engine Instance",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": []
        },
        "blueprintIdentifier": "gcpComputeInstance"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "start-gcp-instance.yaml",
        "workflowInputs": {
          "port_context": {
            "entity": "{{ .entity }}",
            "runId": "{{ .run.id }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Start Compute Engine Instance` action in the self-service page. 🎉


### Stop a Compute Engine instance

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/stop-gcp-instance.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>Stop Compute Engine GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Stop GCP Compute Engine Instance

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  stop-instance:
    runs-on: ubuntu-latest
    # Add "id-token" with the intended permissions.
    permissions:
      contents: 'read'
      id-token: 'write'
    steps:
      - uses: 'actions/checkout@v4'
      
      - name: Inform Port of workflow stop
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring GCP credentials to stop Compute Engine instance with name ${{ fromJson(inputs.port_context).entity.title }}

      - id: 'auth'
        uses: 'google-github-actions/auth@v2'
        with:
          credentials_json: '${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}'

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2
        
      - name: Stop Compute Engine instance
        run: |
          gcloud compute instances stop ${{ fromJson(inputs.port_context).entity.title }} --zone=${{ fromJson(inputs.port_context).entity.properties.zone }}
          
      - name: Inform Port about Compute Engine stop success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ Compute Engine instance with name ${{ fromJson(inputs.port_context).entity.title }} stopped successfully
          summary: Compute Engine instance stop completed successfully

      - name: Inform Port about Compute Engine stop failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to stop Compute Engine instance with name ${{ fromJson(inputs.port_context).entity.title }}
          summary: Compute Engine instance stop failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Stop Compute Engine instance action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "stop_gcp_compute_instance",
      "title": "Stop Compute Engine Instance",
      "icon": "GoogleCloud",
      "description": "Stop a GCP Compute Engine Instance",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": []
        },
        "blueprintIdentifier": "gcpComputeInstance"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "stop-gcp-instance.yaml",
        "workflowInputs": {
          "port_context": {
            "entity": "{{ .entity }}",
            "blueprint": "{{ .action.blueprint }}",
            "runId": "{{ .run.id }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Stop Compute Engine Instance` action in the self-service page. 🎉


## Visualize metrics

With your data and actions in place, we can create a dedicated dashboard in Port to visualize all Compute Engine instances by status, track deletion protection, and take action directly from the dashboard.


### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **GCP Compute Engine Management**.
5. Input `Start, stop or monitor your GCP Compute Engine instances` under **Description**.
6. Select the `GoogleCloud` icon.
7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our GCP Compute Engine instances.


### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Total instances (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Total instances` (add the `GoogleCloud` icon).
3. Select `Count entities` **Chart type** and choose **Compute Instance** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Select `custom` as the **Unit** and input `instances` as the **Custom unit**
6. Click `Save`.

</details>

<details>
<summary><b>Instances without deletion protection (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Instances without deletion protection` (add the `GoogleCloud` icon).
3. Select `Count entities` **Chart type** and choose **Compute Instance** as the **Blueprint**.
4. Add a filter: `deletionProtection` equals `false`.
5. Select `count` for the **Function**.
6. Select `custom` as the **Unit** and input `instances` as the **Custom unit**
7. Click `Save`.

</details>

<details>
<summary><b>Instance by status (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Instance by status` (add the `GoogleCloud` icon).
3. Choose the **Compute Instance** blueprint.
4. Under `Breakdown by property`, select the **Status** property
5. Click **Save**.

</details>

<details>
<summary><b>Compute instances view (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **All Instances**.
3. Choose the **Compute Instance** blueprint
4. Click **Save** to add the widget to the dashboard.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Status**: The current status of the instance.
    - **Created At**: When the instance was created.
    - **Deletion Protection**: Whether deletion protection is enabled.
    - **Project**: The name of each related GCP project.
    - **Zone**: The zone where the instance is located.
7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

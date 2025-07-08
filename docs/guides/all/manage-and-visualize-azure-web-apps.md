---
displayed_sidebar: null
description: Learn how to monitor and manage your Azure web apps using self-service actions in Port.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Manage and visualize your Azure web apps

This guide demonstrates how to bring your Azure web app management experience into Port. You will learn how to:

- Ingest Azure web app data into Port's software catalog using **Port's Azure** integration.
- Set up **self-service actions** to manage Azure web apps (start, stop, and restart web apps).
- Build **dashboards** in Port to monitor and take action on your Azure web app resources.

<img src="/img/guides/azureWebAppDashboard1.png" border="1px" width="100%" />
<img src="/img/guides/azureWebAppDashboard2.png" border="1px" width="100%" />


## Common use cases

- Monitor the status and health of all Azure web apps across subscriptions from a single view.
- Empower platform teams to automate web app lifecycle management via GitHub workflows.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [Azure integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/) is installed in your account.
<GithubDedicatedRepoHint/>


## Set up data model

When installing the Azure integration in Port, the `Azure Subscription` and `Azure Resource Group` blueprints are created by default.  
However, the `Web App` blueprint is not created automatically so we will need to create it manually.


### Create the Web App blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:
    <details>
    <summary><b>Azure Web App blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "azureWebApp",
      "description": "This blueprint represents an Azure Web App in our software catalog",
      "title": "Web App",
      "icon": "Azure",
      "schema": {
        "properties": {
          "location": {
            "title": "Location",
            "type": "string"
          },
          "enabled": {
            "title": "Enabled",
            "type": "boolean"
          },
          "defaultHostName": {
            "title": "Default Host Name",
            "type": "string"
          },
          "appServicePlanId": {
            "title": "App Service Plan ID",
            "type": "string"
          },
          "state": {
            "icon": "DefaultProperty",
            "title": "State",
            "type": "string",
            "enum": [
              "Running",
              "Stopped",
              "Starting",
              "Stopping",
              "Failed",
              "Restarting",
              "Pending",
              "Unknown",
              "Provisioning"
            ],
            "enumColors": {
              "Running": "green",
              "Stopped": "red",
              "Starting": "lime",
              "Stopping": "bronze",
              "Failed": "red",
              "Restarting": "yellow",
              "Pending": "lightGray",
              "Unknown": "lightGray",
              "Provisioning": "blue"
            }
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "resourceGroup": {
          "title": "Resource Group",
          "target": "azureResourceGroup",
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
2. Select the Azure integration.
3. Add the following YAML block into the editor to ingest Azure web apps from your Azure subscription:

    <details>
    <summary><b>Azure integration configuration (Click to expand)</b></summary>

    ```yaml showLineNumbers
    deleteDependentEntities: true
    createMissingRelatedEntities: true
    enableMergeEntity: true
    resources:
      - kind: subscription
        selector:
          query: 'true'
          apiVersion: '2022-09-01'
        port:
          entity:
            mappings:
              identifier: .id
              title: .display_name
              blueprint: '"azureSubscription"'
              properties:
                tags: .tags
      - kind: Microsoft.Resources/resourceGroups
        selector:
          query: 'true'
          apiVersion: '2022-09-01'
        port:
          entity:
            mappings:
              identifier: >-
                .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase |
                join("/")
              title: .name
              blueprint: '"azureResourceGroup"'
              properties:
                location: .location
                provisioningState: .properties.provisioningState + .properties.provisioning_state
                tags: .tags
              relations:
                subscription: >-
                  .id | split("/") | .[1] |= ascii_downcase |.[2] |= ascii_downcase
                  | .[:3] |join("/")
      - kind: Microsoft.Web/sites
        selector:
          query: 'true'
          apiVersion: '2022-03-01'
        port:
          entity:
            mappings:
              identifier: >-
                .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase |
                join("/")
              title: .name
              blueprint: '"azureWebApp"'
              properties:
                location: .location
                state: .properties.state
                enabled: .properties.enabled
                defaultHostName: .properties.defaultHostName
                appServicePlanId: .properties.serverFarmId
              relations:
                resourceGroup: >-
                  .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase
                  | .[:5] |join("/")
    ```
    </details>
    
4. Click `Save & Resync` to apply the mapping.


## Set up self-service actions

Now let us create self-service actions to manage your Azure web apps directly from Port using GitHub Actions. You will implement workflows to:

1. Start an Azure web app.
2. Stop an Azure web app.
3. Restart an Azure web app.

To implement these use-cases, follow the steps below:

### Add GitHub secrets

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `AZURE_CLIENT_ID` - Azure service principal client ID.
- `AZURE_CLIENT_SECRET` - Azure service principal client secret.
- `AZURE_TENANT_ID` - Azure tenant ID.

:::caution Required permissions
The Azure service principal must have the following permissions to manage web apps:
- `Microsoft.Web/sites/start/action`
- `Microsoft.Web/sites/stop/action`
- `Microsoft.Web/sites/restart/action`
- `Microsoft.Web/sites/read`

Alternatively, you can assign the `Website Contributor` built-in role which includes these permissions.
:::


### Start an Azure web app

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/start-azure-webapp.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>Start Azure Web App GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Start Azure Web App

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  start-webapp:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port of workflow start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring Azure credentials to start web app ${{ fromJson(inputs.port_context).entity.title }}

      - name: Azure Login
        uses: azure/login@v2
        env:
          AZURE_LOGIN_PRE_CLEANUP: true
          AZURE_LOGIN_POST_CLEANUP: true
        with:
          creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","subscriptionId":"${{ fromJson(inputs.port_context).subscription_id }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}"}'

      - name: Start Azure Web App
        run: |
          az webapp start --name ${{ fromJson(inputs.port_context).entity.title }} --resource-group ${{ fromJson(inputs.port_context).resource_group }}

      - name: Inform Port about web app start success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ Azure web app ${{ fromJson(inputs.port_context).entity.title }} started successfully
          summary: Azure web app started successfully

      - name: Inform Port about web app start failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to start Azure web app ${{ fromJson(inputs.port_context).entity.title }}
          summary: Azure web app start failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Start Azure Web App action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "start_azure_webapp",
      "title": "Start Azure Web App",
      "icon": "Azure",
      "description": "Starts an Azure web app",
      "trigger": {
        "type": "self-service",
        "operation": "UPDATE",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "azureWebApp"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "start-azure-webapp.yaml",
        "workflowInputs": {
          "port_context": {
            "runId": "{{ .run.id }}",
            "entity": "{{ .entity }}",
            "subscription_id": "{{.entity.relations.resourceGroup | split(\"/\")[2]}}",
            "resource_group": "{{.entity.relations.resourceGroup | split(\"/\")[-1]}}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Start Azure Web App` action in the self-service page. 🎉


### Stop an Azure web app

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/stop-azure-webapp.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>Stop Azure Web App GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Stop Azure Web App

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  stop-webapp:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port of workflow stop
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring Azure credentials to stop web app ${{ fromJson(inputs.port_context).entity.title }}

      - name: Azure Login
        uses: azure/login@v2
        env:
          AZURE_LOGIN_PRE_CLEANUP: true
          AZURE_LOGIN_POST_CLEANUP: true
        with:
          creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","subscriptionId":"${{ fromJson(inputs.port_context).subscription_id }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}"}'

      - name:  Azure Web App
        run: |
          az webapp stop --name ${{ fromJson(inputs.port_context).entity.title }} --resource-group ${{ fromJson(inputs.port_context).resource_group }}

      - name: Inform Port about web app stop success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ Azure web app ${{ fromJson(inputs.port_context).entity.title }} stopped successfully
          summary: Azure web app stopped successfully

      - name: Inform Port about web app stop failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to stop Azure web app ${{ fromJson(inputs.port_context).entity.title }}
          summary: Azure web app stop failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Stop Azure Web App action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "stop_azure_webapp",
      "title": "Stop Azure Web App",
      "icon": "Azure",
      "description": "Stops an Azure web app",
      "trigger": {
        "type": "self-service",
        "operation": "UPDATE",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "azureWebApp"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "stop-azure-webapp.yaml",
        "workflowInputs": {
          "port_context": {
            "runId": "{{ .run.id }}",
            "entity": "{{ .entity }}",
            "subscription_id": "{{.entity.relations.resourceGroup | split(\"/\")[2]}}",
            "resource_group": "{{.entity.relations.resourceGroup | split(\"/\")[-1]}}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Stop Azure Web App` action in the self-service page. 🎉


### Restart an Azure web app

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/restart-azure-webapp.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>Restart Azure Web App GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Restart Azure Web App

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  restart-webapp:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port of workflow restart
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring Azure credentials to restart web app ${{ fromJson(inputs.port_context).entity.title }}

      - name: Azure Login
        uses: azure/login@v2
        env:
          AZURE_LOGIN_PRE_CLEANUP: true
          AZURE_LOGIN_POST_CLEANUP: true
        with:
          creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","subscriptionId":"${{ fromJson(inputs.port_context).subscription_id }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}"}'

      - name:  Azure Web App
        run: |
          az webapp restart --name ${{ fromJson(inputs.port_context).entity.title }} --resource-group ${{ fromJson(inputs.port_context).resource_group }}

      - name: Inform Port about web app restart success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ Azure web app ${{ fromJson(inputs.port_context).entity.title }} restarted successfully
          summary: Azure web app restarted successfully

      - name: Inform Port about web app restart failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to restart Azure web app ${{ fromJson(inputs.port_context).entity.title }}
          summary: Azure web app restart failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Restart Azure Web App action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "restart_azure_webapp",
      "title": "Restart Azure Web App",
      "icon": "Azure",
      "description": "Restarts an Azure web app",
      "trigger": {
        "type": "self-service",
        "operation": "UPDATE",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "azureWebApp"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "restart-azure-webapp.yaml",
        "workflowInputs": {
          "port_context": {
            "runId": "{{ .run.id }}",
            "entity": "{{ .entity }}",
            "subscription_id": "{{.entity.relations.resourceGroup | split(\"/\")[2]}}",
            "resource_group": "{{.entity.relations.resourceGroup | split(\"/\")[-1]}}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Restart Azure Web App` action in the self-service page. 🎉


## Visualize web app metrics

With your data and actions in place, we can create a dedicated dashboard in Port to visualize all Azure web apps by status, location, and resource group. In addition, we can trigger actions (start, stop, restart) directly from the dashboard.

### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **Azure Web App Management**.
5. Input `Monitor and manage your Azure web apps` under **Description**.
6. Select the `Azure` icon.
7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our Azure web apps.


### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Total web apps (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Number Chart**.
2. Title: `Total web apps` (add the `Azure` icon).
3. Select `Count entities` **Chart type** and choose **Web App** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Select `custom` as the **Unit** and input `web apps` as the **Custom unit**.
6. Click **Save**.

</details>

<details>
<summary><b>Web apps by state (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Web apps by state` (add the `Azure` icon).
3. Choose the **Web App** blueprint.
4. Under `Breakdown by property`, select the **State** property.
5. Click **Save**.

</details>

<details>
<summary><b>Web apps by location (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Web apps by location` (add the `Azure` icon).
3. Choose the **Web App** blueprint.
4. Under `Breakdown by property`, select the **Location** property.
5. Click **Save**.

</details>

<details>
<summary><b>All web apps table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title: `All web apps` (add the `Azure` icon).
3. Choose the **Web App** blueprint.
4. Click **Save** to add the widget to the dashboard.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
   - **Title**: The web app name.
   - **State**: The current state of the web app.
   - **Location**: The Azure region where the web app is deployed.
   - **Enabled**: Whether the web app is enabled.
   - **Default Host Name**: The default hostname of the web app.
   - **Resource Group**: The name of each related Azure resource group.
7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

<details>
<summary><b>List of self service actions (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Action card**.
2. Choose the **Start Azure Web App**, **Stop Azure Web App** and **Restart Azure Web App** actions we created in this guide.
3. Title: `Manage web apps` (add the `Azure` icon).
4. Click **Save**.

</details>

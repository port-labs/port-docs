---
displayed_sidebar: null
description: Learn how to monitor and manage your Azure Virtual Machines using self-service actions in Port.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'


# Manage your Azure Virtual Machines

This guide demonstrates how to bring your Azure Virtual Machine management experience into Port. You will learn how to:

- Ingest Azure Virtual Machine data into Port's software catalog using **Port's Azure** integration.
- Set up **self-service actions** to manage Azure Virtual Machines (start, deallocate, and restart VMs).

<img src="/img/guides/azureVMDashboard1.png" border="1px" width="100%" />


## Common use cases

- Monitor the status and health of all Azure Virtual Machines across subscriptions from a single view.
- Empower platform teams to automate VM lifecycle management via GitHub workflows.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [Azure integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/) is installed in your account.
<GithubDedicatedRepoHint/>


## Set up data model

When installing the Azure integration in Port, the `Azure Subscription` and `Azure Resource Group` blueprints are created by default.  
However, the `Virtual Machine` blueprint is not created automatically so we will need to create it manually.


### Create the Virtual Machine blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:
    <details>
    <summary><b>Azure Virtual Machine blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "azureVirtualMachine",
      "description": "This blueprint represents an Azure Virtual Machine in our software catalog",
      "title": "Virtual Machine",
      "icon": "Azure",
      "schema": {
        "properties": {
          "location": {
            "title": "Location",
            "type": "string"
          },
          "provisioningState": {
            "title": "Provisioning State",
            "type": "string"
          },
          "vmSize": {
            "title": "VM Size",
            "type": "string"
          },
          "osDiskName": {
            "title": "OS Disk Name",
            "type": "string"
          },
          "osType": {
            "title": "OS Type",
            "type": "string"
          },
          "osDiskCaching": {
            "title": "OS Disk Caching",
            "type": "string"
          },
          "osDiskSizeGB": {
            "title": "OS Disk Size GB",
            "type": "number"
          },
          "osDiskCreateOption": {
            "title": "OS Disk Create Option",
            "type": "string"
          },
          "networkInterfaceIds": {
            "title": "Network Interface IDs",
            "type": "array"
          },
          "licenseType": {
            "title": "License Type",
            "type": "string"
          },
          "vmOsProfile": {
            "title": "VM OS Profile",
            "type": "object"
          },
          "vmHardwareProfile": {
            "title": "VM Hardware Profile",
            "type": "object"
          },
          "vmStorageProfile": {
            "title": "VM Storage Profile",
            "type": "object"
          },
          "tags": {
            "title": "Tags",
            "type": "object"
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
3. Add the following YAML block into the editor to ingest Azure Virtual Machines from your Azure subscription:

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
      - kind: Microsoft.Compute/virtualMachines
        selector:
          query: 'true'
          apiVersion: '2023-03-01'
        port:
          entity:
            mappings:
              identifier: >-
                .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase |
                join("/")
              title: .name
              blueprint: '"azureVirtualMachine"'
              properties:
                location: .location
                provisioningState: .properties.provisioningState
                vmSize: .properties.hardwareProfile.vmSize
                osDiskName: .properties.storageProfile.osDisk.name
                osType: .properties.storageProfile.osDisk.osType
                osDiskCaching: .properties.storageProfile.osDisk.caching
                osDiskSizeGB: .properties.storageProfile.osDisk.diskSizeGB
                osDiskCreateOption: .properties.storageProfile.osDisk.createOption
                networkInterfaceIds: .properties.networkProfile.networkInterfaces[].id
                licenseType: .properties.licenseType
                vmOsProfile: .properties.osProfile
                vmHardwareProfile: .properties.hardwareProfile
                vmStorageProfile: .properties.storageProfile
                tags: .tags
              relations:
                resourceGroup: >-
                  .id | split("/") | .[3] |= ascii_downcase | .[4] |= ascii_downcase
                  | .[:5] |join("/")
    ```
    </details>
    
4. Click `Save & Resync` to apply the mapping.


## Set up self-service actions

Now let us create self-service actions to manage your Azure Virtual Machines directly from Port using GitHub Actions. You will implement workflows to:

1. Start an Azure Virtual Machine.
2. Deallocate an Azure Virtual Machine.
3. Restart an Azure Virtual Machine.


### Add GitHub secrets

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `AZURE_CLIENT_ID` - Azure service principal client ID.
- `AZURE_CLIENT_SECRET` - Azure service principal client secret.
- `AZURE_TENANT_ID` - Azure tenant ID.

:::caution Required permissions
The Azure service principal must have the following permissions to manage Virtual Machines:
- `Microsoft.Compute/virtualMachines/start/action`
- `Microsoft.Compute/virtualMachines/powerOff/action`
- `Microsoft.Compute/virtualMachines/restart/action`
- `Microsoft.Compute/virtualMachines/read`

Alternatively, you can assign the `Virtual Machine Contributor` built-in role which includes these permissions.
:::


### Start an Azure Virtual Machine

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/start-azure-vm.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>Start Azure Virtual Machine GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Start Azure Virtual Machine

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  start-vm:
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
          logMessage: Configuring Azure credentials to start VM ${{ fromJson(inputs.port_context).entity.title }}

      - name: Azure Login
        uses: azure/login@v2
        env:
          AZURE_LOGIN_PRE_CLEANUP: true
          AZURE_LOGIN_POST_CLEANUP: true
        with:
          creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","subscriptionId":"${{ fromJson(inputs.port_context).subscription_id }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}"}'

      - name: Start Azure Virtual Machine
        run: |
          az vm start --name ${{ fromJson(inputs.port_context).entity.title }} --resource-group ${{ fromJson(inputs.port_context).resource_group }}

      - name: Inform Port about VM start success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ Azure VM ${{ fromJson(inputs.port_context).entity.title }} started successfully
          summary: Azure VM started successfully

      - name: Inform Port about VM start failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to start Azure VM ${{ fromJson(inputs.port_context).entity.title }}
          summary: Azure VM start failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Start Azure Virtual Machine action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "start_azure_vm",
      "title": "Start Azure Virtual Machine",
      "icon": "Azure",
      "description": "Starts an Azure Virtual Machine",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "azureVirtualMachine"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "start-azure-vm.yaml",
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


### Deallocate an Azure Virtual Machine

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/deallocate-azure-vm.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>Deallocate Azure Virtual Machine GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Deallocate Azure Virtual Machine

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  deallocate-vm:
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
          logMessage: Configuring Azure credentials to deallocate VM ${{ fromJson(inputs.port_context).entity.title }}

      - name: Azure Login
        uses: azure/login@v2
        env:
          AZURE_LOGIN_PRE_CLEANUP: true
          AZURE_LOGIN_POST_CLEANUP: true
        with:
          creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","subscriptionId":"${{ fromJson(inputs.port_context).subscription_id }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}"}'

      - name: Deallocate Azure Virtual Machine
        run: |
          az vm deallocate --name ${{ fromJson(inputs.port_context).entity.title }} --resource-group ${{ fromJson(inputs.port_context).resource_group }}

      - name: Inform Port about VM deallocate success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ Azure VM ${{ fromJson(inputs.port_context).entity.title }} deallocated successfully
          summary: Azure VM deallocated successfully

      - name: Inform Port about VM deallocate failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to deallocate Azure VM ${{ fromJson(inputs.port_context).entity.title }}
          summary: Azure VM deallocate failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Deallocate Azure Virtual Machine action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "deallocate_azure_vm",
      "title": "Deallocate Azure Virtual Machine",
      "icon": "Azure",
      "description": "Deallocates an Azure Virtual Machine",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "azureVirtualMachine"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "deallocate-azure-vm.yaml",
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


### Restart an Azure Virtual Machine

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/restart-azure-vm.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>Restart Azure Virtual Machine GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Restart Azure Virtual Machine

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  restart-vm:
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
          logMessage: Configuring Azure credentials to restart VM ${{ fromJson(inputs.port_context).entity.title }}

      - name: Azure Login
        uses: azure/login@v2
        env:
          AZURE_LOGIN_PRE_CLEANUP: true
          AZURE_LOGIN_POST_CLEANUP: true
        with:
          creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","subscriptionId":"${{ fromJson(inputs.port_context).subscription_id }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}"}'

      - name: Restart Azure Virtual Machine
        run: |
          az vm restart --name ${{ fromJson(inputs.port_context).entity.title }} --resource-group ${{ fromJson(inputs.port_context).resource_group }}

      - name: Inform Port about VM restart success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ Azure VM ${{ fromJson(inputs.port_context).entity.title }} restarted successfully
          summary: Azure VM restarted successfully

      - name: Inform Port about VM restart failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to restart Azure VM ${{ fromJson(inputs.port_context).entity.title }}
          summary: Azure VM restart failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Restart Azure Virtual Machine action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "restart_azure_vm",
      "title": "Restart Azure Virtual Machine",
      "icon": "Azure",
      "description": "Restarts an Azure Virtual Machine",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "azureVirtualMachine"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "restart-azure-vm.yaml",
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
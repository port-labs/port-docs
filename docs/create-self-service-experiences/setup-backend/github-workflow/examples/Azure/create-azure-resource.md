---
sidebar_position: 1
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Deploy Azure Resource using Terraform

In the following guide, you are going to create a self-service action in Port that executes a [GitHub workflow](/create-self-service-experiences/setup-backend/github-workflow/github-workflow.md) to deploy a [storage account](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview) in Azure using Terraform templates.


## Example - creating a storage account

Follow these steps to get started:

1. Create the following GitHub Action secrets:
    1. Create the following Port credentials:
        1. `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
        2. `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
    2. Create the following Azure Cloud credentials:
        :::tip
        Follow this [guide](https://learn.microsoft.com/en-us/azure/developer/terraform/get-started-cloud-shell-bash?tabs=bash#create-a-service-principal) to create a service principal in order to get the Azure credentials.
        :::
        1. `ARM_CLIENT_ID` - Azure Client ID (APP ID) of the application.
        2. `ARM_CLIENT_SECRET` - Azure Client Secret (Password) of the application.
        3. `ARM_SUBSCRIPTION_ID` - Azure Subscription ID.
        4. `ARM_TENANT_ID` - The Azure [Tenant ID](https://learn.microsoft.com/en-us/azure/azure-portal/get-subscription-tenant-id).
<br />
2. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).
<br />
3. Create a Port <PortTooltip id="blueprint">blueprint</PortTooltip> with the following JSON definition:

<details>
   <summary>Port Blueprint: Azure Storage Account</summary>
   :::note
   Keep in mind that this can be any blueprint you require; the provided example is just for reference.
   :::

```json showLineNumbers
{
    "identifier": "azureStorage",
    "title": "Azure Storage Account",
    "icon": "Azure",
    "schema": {
        "properties": {
            "storage_name": {
                "title": "Account Name",
                "type": "string",
                "minLength": 3,
                "maxLength": 63,
                "icon": "DefaultProperty"
            },
            "storage_location": {
                "icon": "DefaultProperty",
                "title": "Location",
                "type": "string"
            },
            "url": {
                "title": "URL",
                "format": "url",
                "type": "string",
                "icon": "DefaultProperty"
            }
        },
        "required": [
            "storage_name",
            "storage_location"
        ]
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "relations": {}
}
```

  </details>
<br />
3. Create a Port action in the [self-service page](https://app.getport.io/self-serve) or with the following JSON definition:

<details>

  <summary>Port Action: Create Azure Storage</summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::


```json showLineNumbers
[
  {
    "identifier": "create_azure_storage",
    "title": "Create Azure Storage",
    "icon": "Github",
    "userInputs": {
      "properties": {
        "storage_name": {
          "title": "Storage Name",
          "icon": "Azure",
          "type": "string"
        },
        "storage_location": {
          "title": "Storage Location",
          "icon": "Azure",
          "type": "string",
          "default": "westus2"
        }
      },
      "required": [
        "storage_name"
      ],
      "order": [
        "storage_name",
        "storage_location"
      ]
    },
    "invocationMethod": {
      "type": "GITHUB",
      "org": "<GITHUB-ORG>",
      "repo": "<GITHUB-REPO-NAME>",
      "workflow": "terraform-azure.yml",
      "omitUserInputs": false,
      "omitPayload": false,
      "reportWorkflowStatus": true
    },
    "trigger": "CREATE",
    "description": "Execute a workflow that terraforms an azure resource",
    "requiredApproval": false
  }
]
```

</details>
<br />
4. Create the following Terraform templates in a `terraform` folder at the root of your GitHub repository:
    :::tip
    Fork our [example repository](https://github.com/port-labs/pipelines-terraform-azure) to get started.
    :::

    1. `main.tf` - This file will contain the resource blocks which define the Storage Account to be created in the Azure cloud and the entity to be created in Port.
    2. `variables.tf` – This file will contain the variable declarations that will be used in the resource blocks e.g. the Port credentials and Port run id.
    3. `output.tf` – This file will contain the URL of the Storage Account that needs to be generated on successful completion of an “apply” operation. This URL will be used in the `endpoint` property when creating the Port entity.

<details>
  <summary><b>main.tf</b></summary>

```hcl showLineNumbers title="main.tf"
terraform {
    required_providers {
        azurerm = {
            source  = "hashicorp/azurerm"
            version = "~> 3.0.2"
        }
        port = {
            source  = "port-labs/port-labs"
            version = "~> 1.0.0"
        }
    }

    required_version = ">= 1.1.0"
}

provider "azurerm" {

    features {}
}

provider "port" {
    client_id = var.port_client_id
    secret    = var.port_client_secret
}

resource "azurerm_storage_account" "storage_account" {
    name                = var.storage_account_name
    resource_group_name = var.resource_group_name

    location                 = var.location
    account_tier             = "Standard"
    account_replication_type = "LRS"
    account_kind             = "StorageV2"
}

resource "port_entity" "azure_storage_account" {
    count      = length(azurerm_storage_account.storage_account) > 0 ? 1 : 0
    identifier = var.storage_account_name
    title      = var.storage_account_name
    blueprint  = "azureStorage"
    run_id     = var.port_run_id
    properties = {
        string_props = {
        "storage_name"     = var.storage_account_name,
        "storage_location" = var.location,
        "endpoint"         = azurerm_storage_account.storage_account.primary_web_endpoint
        }
    }

    depends_on = [azurerm_storage_account.storage_account]
}
```

</details>

<details>
  
  <summary><b>variables.tf</b></summary>
  :::note
  Replace the default `resource_group_name` with a resource group from your Azure account. Check this [guide](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal) to find your resource groups. You may also wish to set the default values of other variables.
  :::

```hcl showLineNumbers title="variables.tf"
variable "resource_group_name" {
    type        = string
    default     = "myTFResourceGroup"
    description = "RG name in Azure"
}

variable "location" {
    type        = string
    default     = "westus2"
    description = "RG location in Azure"
}

variable "storage_account_name" {
    type        = string
    description = "Storage Account name in Azure"
    default     = "demo"
}

variable "port_run_id" {
    type        = string
    description = "The runID of the action run that created the entity"
}

variable "port_client_id" {
    type        = string
    description = "The Port client ID"
}

variable "port_client_secret" {
    type        = string
    description = "The Port client secret"
}
```

</details>

<details>
<summary><b>output.tf</b></summary>
  
```hcl showLineNumbers title="output.tf"
output "endpoint_url" {
    value = azurerm_storage_account.storage_account.primary_web_endpoint
}
```

</details>
<br />
5. Create a workflow file under `.github/workflows/terraform-azure.yml` with the following content:

<details>

<summary>GitHub workflow script</summary>

```yaml showLineNumbers title="terraform-azure.yml"
name: "Terraform Infrastructure Change"

on: 
  workflow_dispatch:
    inputs:
      storage_name:
        required: true
        type: string
      storage_location:
        required: true
        type: string
      port_payload:
        required: true
        description:
            Port's payload, including details for who triggered the action and
            general context (blueprint, run id, etc...)
        type: string

env: 
  TF_LOG: INFO
  TF_INPUT: false
  # BUCKET_TF_STATE: # Uncomment this if you using a storage backend

jobs:
  terraform:
    name: "Deploy Azure Resource"
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
        working-directory: ./terraform


    steps:
      - name: Checkout the repository to the runner
        uses: actions/checkout@v2

      - name: Setup Terraform with specified version on the runner
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.6.0
      
      - name: Terraform init
        id: init
        run: terraform init
        # run: terraform init -backend-config="bucket=$BUCKET_TF_STATE" # Use this option instead if using a storage backend

      - name: Terraform format
        id: fmt
        run: terraform fmt -check
      
      - name: Terraform validate
        id: validate
        run: terraform validate

      - name: Run Terraform Plan and Apply (Azure)
        id: plan-azure
        env: 
            ARM_CLIENT_ID: ${{ secrets.ARM_CLIENT_ID }}
            ARM_CLIENT_SECRET: ${{ secrets.ARM_CLIENT_SECRET }}
            ARM_TENANT_ID: ${{ secrets.ARM_TENANT_ID }}
            ARM_SUBSCRIPTION_ID: ${{ secrets.ARM_SUBSCRIPTION_ID }}
            TF_VAR_port_client_id: ${{ secrets.PORT_CLIENT_ID }}
            TF_VAR_port_client_secret: ${{ secrets.PORT_CLIENT_SECRET }}
            TF_VAR_port_run_id: ${{fromJson(inputs.port_payload).context.runId}}
        run: |
          terraform plan \
            -input=false \
            -out=tfazure-${GITHUB_RUN_NUMBER}.tfplan \
            -var="storage_account_name=${{ github.event.inputs.storage_name }}" \
            -var="location=${{ github.event.inputs.storage_location }}" \
            -target=azurerm_storage_account.storage_account

          terraform apply -auto-approve -input=false tfazure-${GITHUB_RUN_NUMBER}.tfplan

      - name: Terraform Azure Status
        if: steps.plan-azure.outcome == 'failure'
        run: exit 1

      - name: Run Terraform Plan and Apply (Port)
        id: plan-port
        env: 
            ARM_CLIENT_ID: ${{ secrets.ARM_CLIENT_ID }}
            ARM_CLIENT_SECRET: ${{ secrets.ARM_CLIENT_SECRET }}
            ARM_TENANT_ID: ${{ secrets.ARM_TENANT_ID }}
            ARM_SUBSCRIPTION_ID: ${{ secrets.ARM_SUBSCRIPTION_ID }}
            TF_VAR_port_client_id: ${{ secrets.PORT_CLIENT_ID }}
            TF_VAR_port_client_secret: ${{ secrets.PORT_CLIENT_SECRET }}
            TF_VAR_port_run_id: ${{fromJson(inputs.port_payload).context.runId}}
        run: |
          terraform plan \
            -input=false \
            -out=tfport-${GITHUB_RUN_NUMBER}.tfplan \
            -var="storage_account_name=${{ github.event.inputs.storage_name }}" \
            -var="location=${{ github.event.inputs.storage_location }}"

          terraform apply -auto-approve -input=false tfport-${GITHUB_RUN_NUMBER}.tfplan

      - name: Terraform Port Status
        if: steps.plan-port.outcome == 'failure'
        run: exit 1

      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Created ${{ inputs.storage_name }}
```

</details>
<br />
6. Trigger the action from the [self-service](https://app.getport.io/self-serve) page of your Port application.

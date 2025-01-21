---
sidebar_position: 1
displayed_sidebar: null
description: Learn how to create Azure resources in Port, enabling efficient cloud management and scalable infrastructure deployment.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Deploy Azure Resource using Terraform

In the following guide, you are going to create a self-service action in Port that executes a [GitHub workflow](/actions-and-automations/setup-backend/github-workflow/github-workflow.md) to deploy a [storage account](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview) in Azure using Terraform templates.

:::tip Use Cases

- **Standardized Deployments**: Ensure consistency and minimize errors by defining your storage account infrastructure as code using Terraform templates.
- **Streamlined Provisioning**: Rapidly create new storage accounts on-demand, empowering users without requiring deep Azure cloud expertise.
:::

## Prerequisites

1. **Azure Subscription**: An active Azure subscription is required to deploy the storage account.
2. **Port Actions Knowledge**: Understanding how to create and use Port actions is necessary. Learn the basics [here](https://docs.port.io/actions-and-automations/create-self-service-experiences/setup-ui-for-action/).
3. **GitHub Repository**: A repository to store your GitHub workflow file for this action.


### GitHub Secrets

To successfully execute this workflow, we will add the following secrets to the GitHub repository containing the workflow:

**1. GitHub Action Secrets**

- Navigate to your GitHub repository's "Settings" tab.
- Select "Secrets" and then "Actions" from the side menu.
- Create the following secrets:
    - `PORT_CLIENT_ID`: Your Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/custom-integration/api/#get-api-token).
    - `PORT_CLIENT_SECRET`: Your Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/custom-integration/api/#get-api-token).

**2. Azure Cloud Credentials**

:::tip **Important**: 
For secure Azure interactions, we'll use a Service Principal. If you need help creating one, follow this [guide](https://learn.microsoft.com/en-us/azure/developer/terraform/get-started-cloud-shell-bash?tabs=bash#create-a-service-principal)
:::
- Once you have your Service Principal, create these GitHub Action secrets:
    - `ARM_CLIENT_ID`: Service Principal Application (Client) ID
    - `ARM_CLIENT_SECRET`: Service Principal Password
    - `ARM_SUBSCRIPTION_ID`: Your Azure Subscription ID
    - `ARM_TENANT_ID`: Your Azure [Tenant ID](https://learn.microsoft.com/en-us/azure/azure-portal/get-subscription-tenant-id)
    - `AZURE_RESOURCE_GROUP`; Your Azure resource group

## Port Configuration

:::tip Import Azure Resources
Import Azure resources into your Port account using the [Azure Exporter](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/)
:::

1. Create the `azureStorage` <PortTooltip id="blueprint">blueprint</PortTooltip>.
    - Head to the [Builder](https://app.getport.io/settings/data-model) page.
    - Click on the `+ Blueprint` button.
    - Click on the `{...} Edit JSON` button.
    - Copy and paste the following JSON configuration into the editor.

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
2. To create the Port action:
    - Head to the [self-service](https://app.getport.io/self-serve) page.
    - Click on the `+ New Action` button.
    - Click on the `{...} Edit JSON` button.
    - Copy and paste the following JSON configuration into the editor.

<details>

  <summary>Port Action: Create Azure Storage</summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::


```json showLineNumbers
{
  "identifier": "service_create_azure_storage",
  "title": "Create Azure Storage",
  "icon": "Github",
  "description": "Execute a workflow that terraforms an azure resource",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
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
    "blueprintIdentifier": "azureStorage"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "terraform-azure.yml",
    "workflowInputs": {
      "storage_name": "{{ .inputs.\"storage_name\" }}",
      "storage_location": "{{ .inputs.\"storage_location\" }}",
      "port_context": {
        "entity": "{{ .entity }}",
        "blueprint": "{{ .action.blueprint }}",
        "runId": "{{ .run.id }}",
        "trigger": "{{ .trigger }}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```

</details>

## GitHub Workflow

1. Create the following Terraform templates in a `terraform` folder at the root of your GitHub repository:
    :::tip
    Fork our [example repository](https://github.com/port-labs/pipelines-terraform-azure) to get started.
    :::

    1. `main.tf` - This file will contain the resource blocks which define the Storage Account to be created in the Azure cloud and the entity to be created in Port.
    2. `variables.tf` – This file will contain the variable declarations that will be used in the resource blocks e.g. the Port credentials and Port run id.
    3. `output.tf` – This file will contain the URL of the Storage Account that needs to be generated on successful completion of an "apply" operation. This URL will be used in the `endpoint` property when creating the Port entity.

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
            version = "~> 2.0.3"
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
    base_url  = var.base_url
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

variable "base_url" {
    type        = string
    description = "The Port API URL"
}

```

<PortApiRegionTip/>

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

2. Create a workflow file under `.github/workflows/terraform-azure.yml` with the following content:

<details>

<summary>GitHub workflow script</summary>

```yaml showLineNumbers title="terraform-azure.yml"
name: "Deploy Azure Resource"

on: 
  workflow_dispatch:
    inputs:
      storage_name:
        required: true
        type: string
      storage_location:
        required: true
        type: string
      port_context:
        required: true
        description: >-
          Action and general context (blueprint, run id, etc...)

env: 
  TF_LOG: INFO
  TF_INPUT: false

jobs:
  terraform:
    name: "Terraform Infrastructure Change Management"
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
        # We keep Terraform files in the terraform directory.
        working-directory: ./terraform
        # working-directory: ./


    steps:
      - name: Checkout the repository to the runner
        uses: actions/checkout@v4

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
            TF_VAR_port_run_id: ${{ fromJson(inputs.port_context).runId }}
            TF_VAR_resource_group_name: ${{ secrets.AZURE_RESOURCE_GROUP }}
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
            TF_VAR_port_run_id: ${{fromJson(inputs.port_context).runId}}
            TF_VAR_resource_group_name: arete-resources
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
          status: "SUCCESS"
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Created ${{ inputs.storage_name }}
```

</details>

## Let's Test It!

- On the [self-service](https://app.getport.io/self-serve) page, select the action and fill in the properties.
- Click the execute button to trigger the GitHub workflow.


## More Relevant Guides

1. [Provision AWS resources with Terraform](/guides/all/terraform-plan-and-apply-aws-resource)

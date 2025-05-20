---
sidebar_position: 3
displayed_sidebar: null
description: Follow this guide to create Azure resources for ADO in Port, ensuring seamless integration and cloud management.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import AzureDevopsTroubleshootingLink from '/docs/generalTemplates/azure-devops/_azure_devops_troubleshooting_link.mdx'

# Create Azure Resource with Terraform

In the following guide, you are going to build a self-service action in Port that executes an [Azure pipeline](/actions-and-automations/setup-backend/azure-pipeline/azure-pipeline.md) to deploy a [storage account](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview) in Azure using Terraform templates.


## Prerequisites

- You will need your [Port credentials](/build-your-software-catalog/custom-integration/api/api.md#find-your-port-credentials) to create the action.
- You will need your Azure DevOps organization.
- You will need the name of the [webhook](/actions-and-automations/setup-backend/azure-pipeline/#define-incoming-webhook-in-azure) that you configured in your Azure pipelines yaml.

## Example - creating a storage account

Follow these steps to get started:

1. Create the following as variables in your Azure Devops project:
    1. Create the Port credentials with the group id `port-credentials`.
        1. `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
        2. `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
    2. Create the Azure Cloud credentials with id `azure-service-principal`.
        :::tip
        Follow this [guide](https://learn.microsoft.com/en-us/azure/developer/terraform/get-started-cloud-shell-bash?tabs=bash#create-a-service-principal) to create a service principal in order to get the Azure credentials.
        :::
        1. `ARM_CLIENT_ID` - Azure Client ID (APP ID) of the application.
        2. `ARM_CLIENT_SECRET` - Azure Client Secret (Password) of the application.
        3. `ARM_SUBSCRIPTION_ID` - Azure Subscription ID.
        4. `ARM_TENANT_ID` - The Azure [Tenant ID](https://learn.microsoft.com/en-us/azure/azure-portal/get-subscription-tenant-id).

2. Create a Port <PortTooltip id="blueprint">blueprint</PortTooltip> with the following JSON definition:

<details>
   <summary>Port Azure Storage Account Blueprint</summary>
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

3. Create a Port action in the [self-service page](https://app.getport.io/self-serve) or with the following JSON definition:

<details>

  <summary>Port Action</summary>
   :::tip
- `<AZURE-DEVOPS-ORG>` - your Azure DevOps organization name, can be found in your Azure DevOps URL: `https://dev.azure.com/{AZURE-DEVOPS-ORG}`;
- `<AZURE-DEVOPS-WEBHOOK-NAME>` - the name you gave to the webhook resource in the Azure yaml pipeline file.
:::


```json showLineNumbers
{
  "identifier": "azureStorage_azure_pipelines_create_azure",
  "title": "Azure Pipelines Create Azure",
  "icon": "Azure",
  "description": "Use azure pipelines to terraform an azure resource ",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "storage_name": {
          "icon": "Azure",
          "title": "Storage Name",
          "description": "The Azure Storage Account",
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
    "type": "AZURE_DEVOPS",
    "webhook": "<AZURE-DEVOPS-WEBHOOK-NAME>",
    "org": "<AZURE-DEVOPS-ORG>",
    "payload": {
      "{{ spreadValue() }}": "{{ .inputs }}",
      "port_context": {
        "entity": "{{.entity}}",
        "blueprint": "{{.action.blueprint}}",
        "runId": "{{.run.id}}",
        "trigger": "{{ .trigger }}"
      }
    }
  },
  "requiredApproval": false 
}
```

</details>

4. Create the following Terraform templates in a `terraform` folder at the root of your GitHub repository:
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

    required_version = ">= 2.0.3"
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

1. Create an Azure pipeline:

<details>

<summary>Azure Devops pipelines script</summary>

```yaml showLineNumbers title="azure-pipelines.yml"
trigger: none

pool:
  vmImage: "ubuntu-latest"

resources:
  webhooks:
    - webhook: PortWebhook
      connection: PortWebhook

variables:
  - group: port-credentials
  - group: azure-service-principal
  - name: STORAGE_NAME
    value: ${{ parameters.PortWebhook.storage_name }}
  - name: STORAGE_LOCATION
    value: ${{ parameters.PortWebhook.storage_location }}
  - name: PORT_RUN_ID
    value: ${{ parameters.PortWebhook.port_context.runId }}

jobs:
- job: DeployJob
  displayName: 'Deploy to Azure and Port'
  steps:
  - checkout: self
    displayName: 'Checkout repository'
  
  - bash: |
      startedAt=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
      echo "##vso[task.setvariable variable=startedAt]$startedAt"
      echo "Started at $startedAt"
    displayName: 'Set Start Time'
  
  - script: |
      sudo apt-get update
      sudo apt-get install -y jq
    displayName: Install jq

    # The API call below uses the EU region. To use the US region, replace `api.getport.io` with `api.us.getport.io`
  - script: |
      accessToken=$(curl -X POST \
            -H 'Content-Type: application/json' \
            -d '{"clientId": "$(PORT_CLIENT_ID)", "clientSecret": "$(PORT_CLIENT_SECRET)"}' \
            -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
      echo "##vso[task.setvariable variable=accessToken;isOutput=true]$accessToken"
    displayName: 'Fetch Access Token and Run ID'
    name: getToken

  - bash: |      
      terraform init -input=false
    displayName: 'Initialize configuration'
    failOnStderr: true
    workingDirectory: 'terraform'

  - script: |
      terraform validate
    displayName: 'Terraform Validate'
    workingDirectory: 'terraform'

  - script: |
      tf_plan_and_apply() {
          local plan_type=$1
          local target_option=""
          
          if [ "$plan_type" == "azure" ]; then
            target_option="-target=azurerm_storage_account.storage_account"
          fi

          terraform plan \
            -input=false \
            -out=tf${plan_type}-${BUILD_BUILDNUMBER}.tfplan \
            -var="storage_account_name=${STORAGE_NAME}" \
            -var="location=${STORAGE_LOCATION}" \
            $target_option

          terraform apply -auto-approve -input=false tf${plan_type}-${BUILD_BUILDNUMBER}.tfplan
      }

      tf_plan_and_apply azure
      tf_plan_and_apply port
    displayName: 'Terraform changes to Azure and Port'
    workingDirectory: 'terraform'
    env:
      TF_VAR_resource_group_name: arete-resources
      TF_VAR_port_client_id: $(PORT_CLIENT_ID)
      TF_VAR_port_client_secret: $(PORT_CLIENT_SECRET)
      TF_VAR_port_run_id: $(PORT_RUN_ID)

  - script: |
      completedAt=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
      terraform_output=$(terraform output endpoint_url | sed 's/"//g')
      echo ${terraform_output}

      curl -X PATCH \
        -H 'Content-Type: application/json' \
        -H 'Authorization: Bearer $(getToken.accessToken)' \
        -d '{
            "status": "SUCCESS",
            "message": {"run_status":"Completed resource creation at $(completedAt)", "url":"$(terraform_output)" }
          }' \
        "https://api.getport.io/v1/actions/runs/$(PORT_RUN_ID)"
    displayName: 'Update Run Status'
    workingDirectory: 'terraform'
```

</details>

6. Trigger the action from the [self-service](https://app.getport.io/self-serve) page of your Port application.

<AzureDevopsTroubleshootingLink />

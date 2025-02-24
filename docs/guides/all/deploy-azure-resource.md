---
sidebar_position: 4
displayed_sidebar: null
description: Follow this guide to deploy Azure resources in Port, ensuring efficient cloud management and streamlined operations.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Deploy resource in Azure Cloud with Terraform

This example demonstrates how to deploy a [storage account](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview) in Azure using Terraform templates via Port Actions.

The workflow is executed through a Jenkins pipeline.

## Prerequisites

1. Install the following plugins in Jenkins:
   1. [Azure Credentials](https://plugins.jenkins.io/azure-credentials/) - This plugin provides the `Azure Service Principal` kind in Jenkins Credentials.
   2. [Terraform](https://plugins.jenkins.io/terraform/) - This plugin provides a build wrapper that simplifies the execution of Terraform commands, such as apply, plan, and destroy.
   3. [Generic Webhook Trigger](https://plugins.jenkins.io/generic-webhook-trigger/) - This plugin enables Jenkins to receive and trigger jobs based on incoming HTTP requests, extracting data from JSON or XML payloads and making it available as variables.

## Example - creating a storage account

Follow these steps to get started:

1. Create the following as Jenkins Credentials:
    1. Create the Port Credentials using the `Username with password` kind and the id `port-credentials`.
        1. `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
        2. `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
    2. Create the Azure Credentials using the `Azure Service Principal` kind and the id `azure`.
        :::tip
        Follow this [guide](https://learn.microsoft.com/en-us/azure/developer/terraform/get-started-cloud-shell-bash?tabs=bash#create-a-service-principal) to create a service principal in order to get the Azure credentials.
        :::
        1. `ARM_CLIENT_ID` - Azure Client ID (APP ID) of the application.
        2. `ARM_CLIENT_SECRET` - Azure Client Secret (Password) of the application.
        3. `ARM_SUBSCRIPTION_ID` - Azure Subscription ID.
        4. `ARM_TENANT_ID` - The Azure [Tenant ID](https://learn.microsoft.com/en-us/azure/azure-portal/get-subscription-tenant-id).
    3. `WEBHOOK_TOKEN` - The webhook token so that the job can only be triggered if that token is supplied.

2. Create a Port <PortTooltip id="blueprint">blueprint</PortTooltip> with the following properties:

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

3. Create a Port action in the [self-service hub](https://app.getport.io/self-serve) using the following JSON definition:

<details>

  <summary>Port Action</summary>
   :::note
   Make sure to replace the placeholders for `JENKINS_URL` and `JOB_TOKEN`.
   :::

```json showLineNumbers
{
  "identifier": "azureStorage_create_azure_storage",
  "title": "Create Azure Storage",
  "icon": "Azure",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "storage_name": {
          "title": "Storage Name",
          "type": "string",
          "minLength": 3,
          "maxLength": 63
        },
        "storage_location": {
          "icon": "DefaultProperty",
          "title": "Storage Location",
          "description": "storage account geo region",
          "type": "string"
        }
      },
      "required": [
        "storage_name"
      ],
      "order": [
        "storage_name"
      ]
    },
    "blueprintIdentifier": "azureStorage"
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://<JENKINS_HOST>/generic-webhook-trigger/invoke?token=<JOB_TOKEN>",
    "agent": false,
    "synchronized": false,
    "method": "POST",
    "body": {
      "action": "{{ .action.identifier[(\"azureStorage_\" | length):] }}",
      "resourceType": "run",
      "status": "TRIGGERED",
      "trigger": "{{ .trigger | {by, origin, at} }}",
      "context": {
        "entity": "{{.entity.identifier}}",
        "blueprint": "{{.action.blueprint}}",
        "runId": "{{.run.id}}"
      },
      "payload": {
        "entity": "{{ (if .entity == {} then null else .entity end) }}",
        "action": {
          "invocationMethod": {
            "type": "WEBHOOK",
            "agent": false,
            "url": "https://<JENKINS_HOST>/generic-webhook-trigger/invoke?token=<JOB_TOKEN>",
            "synchronized": false,
            "method": "POST"
          },
          "trigger": "{{.trigger.operation}}"
        },
        "properties": {
          "{{if (.inputs | has(\"storage_name\")) then \"storage_name\" else null end}}": "{{.inputs.\"storage_name\"}}",
          "{{if (.inputs | has(\"storage_location\")) then \"storage_location\" else null end}}": "{{.inputs.\"storage_location\"}}"
        },
        "censoredProperties": "{{.action.encryptedProperties}}"
      }
    }
  },
  "requiredApproval": false
}
```

</details>

4. Create the following Terraform templates in a `terraform` folder at the root of your GitHub repository:
    1. `main.tf` - This file will contain the resource blocks which define the Storage Account to be created in the Azure cloud and the entity to be created in Port.
    2. `variables.tf` – This file will contain the variable declarations that will be used in the resource blocks e.g. the Port credentials and Port run id.
    3. `output.tf` – This file will contain the URL of the Storage Account that needs to be generated on successful completion of an "apply" operation. This URL will be used in the `endpoint` property when creating the Port entity.

<details>
  <summary>Terraform `main.tf` template</summary>
  
  ```yaml showLineNumbers
    # Configure the Azure provider
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
  
  <summary>Terraform `variables.tf` template</summary>
  :::note
  Replace the default `resource_group_name` with a resource group from your Azure account. Check this [guide](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal) to find your resource groups. You may also wish to set the default values of other variables.
  :::

  ```yaml showLineNumbers
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
<summary>Terraform `output.tf` template</summary>
  
  ```yaml showLineNumbers
    output "endpoint_url" {
        value = azurerm_storage_account.storage_account.primary_web_endpoint
    }
  ```

</details>

5. Create a Jenkins pipeline:

    1. [Enable webhook trigger for a pipeline](/actions-and-automations/setup-backend/jenkins-pipeline#enabling-webhook-trigger-for-a-pipeline)
    2. [Define variables for a pipeline](/actions-and-automations/setup-backend/jenkins-pipeline#defining-variables): Define the STORAGE_NAME, STORAGE_LOCATION, PORT_RUN_ID and BLUEPRINT_ID variables.
    3. [Token Setup](/actions-and-automations/setup-backend/jenkins-pipeline#token-setup): Define the token to match `JOB_TOKEN` as configured in your Port Action.

<details>

<summary>Jenkins Pipeline Script</summary>
:::note
Please make sure to modify the `YOUR_USERNAME` and `YOUR_REPO` placeholders in the URL of the git repository in the `Checkout` stage. Alternatively you can use our [example repository](https://github.com/port-labs/pipelines-terraform-azure).
:::

```groovy showLineNumbers
import groovy.json.JsonSlurper

pipeline {
    agent any
    tools {
        "org.jenkinsci.plugins.terraform.TerraformInstallation" "terraform"
    }
    environment {
        TF_HOME = tool('terraform')
        TF_IN_AUTOMATION = "true"
        PATH = "$TF_HOME:$PATH"
        
        PORT_ACCESS_TOKEN = ""
        endpoint_url = ""

    }
    
    triggers {
        GenericTrigger(
            genericVariables: [
                [key: 'STORAGE_NAME', value: '$.payload.properties.storage_name'],
                [key: 'STORAGE_LOCATION', value: '$.payload.properties.storage_location'],
                [key: 'PORT_RUN_ID', value: '$.context.runId'],
                [key: 'BLUEPRINT_ID', value: '$.context.blueprint']
            ],
            causeString: 'Triggered by Port',
            allowSeveralTriggersPerBuild: true,
            tokenCredentialId: "WEBHOOK_TOKEN",
            
            regexpFilterExpression: '',
            regexpFilterText: '',
            printContributedVariables: true,
            printPostContent: true
        )
    }

    stages {
        stage('Checkout') {
            steps {
                // example repo: git@github.com:port-labs/pipelines-terraform-azure.git
                git branch: 'main', credentialsId: 'github', url: 'git@github.com:<YOUR_USERNAME>/<YOUR_REPO>.git'
            }
        }
        stage('Get access token') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'port-credentials', 
                    usernameVariable: 'PORT_CLIENT_ID', 
                    passwordVariable: 'PORT_CLIENT_SECRET')]) {
                    script {
                        // Execute the curl command and capture the output
                        def result = sh(returnStdout: true, script: """
                            accessTokenPayload=\$(curl -X POST \
                                -H "Content-Type: application/json" \
                                -d '{"clientId": "${PORT_CLIENT_ID}", "clientSecret": "${PORT_CLIENT_SECRET}"}' \
                                -s "https://api.getport.io/v1/auth/access_token")
                            echo \$accessTokenPayload
                        """)

                        // Parse the JSON response using JsonSlurper
                        def jsonSlurper = new JsonSlurper()
                        def payloadJson = jsonSlurper.parseText(result.trim())

                        // Access the desired data from the payload
                        PORT_ACCESS_TOKEN = payloadJson.accessToken
                    }
                }
            }
        }
        
        stage('Terraform Azure') {
            steps {
                withCredentials([azureServicePrincipal(
                    credentialsId: 'azure',
                    subscriptionIdVariable: 'ARM_SUBSCRIPTION_ID',
                    clientIdVariable: 'ARM_CLIENT_ID',
                    clientSecretVariable: 'ARM_CLIENT_SECRET',
                    tenantIdVariable: 'ARM_TENANT_ID'
                ), usernamePassword(credentialsId: 'port-credentials', usernameVariable: 'TF_VAR_port_client_id', passwordVariable: 'TF_VAR_port_client_secret')]) {
                    dir('terraform') {
                        script {
                            echo 'Initializing Terraform'
                            sh 'terraform init'
                            
                            echo 'Validating Terraform configuration'
                            sh 'terraform validate'
                            
                            echo 'Creating Terraform Plan for Azure changes'
                            sh """
                            terraform plan -out=tfazure -var storage_account_name=$STORAGE_NAME -var location=$STORAGE_LOCATION -var port_run_id=$PORT_RUN_ID -target=azurerm_storage_account.storage_account
                            """
                            
                            echo 'Applying Terraform changes to Azure'
                            sh 'terraform apply -auto-approve -input=false tfazure'

                            echo 'Creating Terraform Plan for Port changes'
                            sh """
                            terraform plan -out=tfport -var storage_account_name=$STORAGE_NAME -var location=$STORAGE_LOCATION -var port_run_id=$PORT_RUN_ID
                            """
                            
                            echo 'Applying Terraform changes to Port'
                            sh 'terraform apply -auto-approve -input=false tfport'
                        }
                    }
                }
            }
        }
        stage('Notify Port') {
            steps {
                script {
                    def logs_report_response = sh(script: """
                        curl -X POST \
                            -H "Content-Type: application/json" \
                            -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                            -d '{"message": "Created port entity"}' \
                            "https://api.getport.io/v1/actions/runs/$PORT_RUN_ID/logs"
                    """, returnStdout: true)

                    println(logs_report_response)
                }
            }
        }

        stage('Update Run Status') {
            steps {
                script {
                    def status_report_response = sh(script: """
                        curl -X PATCH \
                          -H "Content-Type: application/json" \
                          -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                          -d '{"status":"SUCCESS", "message": {"run_status": "Jenkins CI/CD Run completed successfully!"}}' \
                             "https://api.getport.io/v1/actions/runs/${PORT_RUN_ID}"
                    """, returnStdout: true)

                    println(status_report_response)
                }
            }
        }
    }
    
    post {

        failure {
            // Update Port Run failed.
            script {
                def status_report_response = sh(script: """
                    curl -X PATCH \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                        -d '{"status":"FAILURE", "message": {"run_status": "Failed to create azure resource ${STORAGE_NAME}"}}' \
                            "https://api.getport.io/v1/actions/runs/${PORT_RUN_ID}"
                """, returnStdout: true)

                println(status_report_response)
            }
        }

        // Clean after build
        always {
            cleanWs(cleanWhenNotBuilt: false,
                    deleteDirs: true,
                    disableDeferredWipeout: false,
                    notFailBuild: true,
                    patterns: [[pattern: '.gitignore', type: 'INCLUDE'],
                               [pattern: '.propsfile', type: 'EXCLUDE']])
        }
    }
}
```

</details>

6. Trigger the action from the [self-service](https://app.getport.io/self-serve) tab of your Port application.

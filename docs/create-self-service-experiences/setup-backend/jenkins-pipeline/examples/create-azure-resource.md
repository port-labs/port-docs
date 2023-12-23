---
sidebar_position: 1
---

# Create resource in Azure Cloud with Terraform

This example demonstrates how to deploy a storage account in Azure using a Terraform template via Port Actions.

The workflow is executed through a Jenkins pipeline.

## Prerequisites
1. Install the following plugins in Jenkins: 
   1. Azure Credentials
   2. Terraform Plugin

## Example - creating a storage account

Follow these steps to get started:

1. Create the following as Jenkins Credentials:

   1. `PORT_CLIENT_ID` - Port Client ID [learn more](../../../../build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
   2. `PORT_CLIENT_SECRET` - Port Client Secret [learn more](../../../../build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
   3. We will create the Azure Credentials using the `Azure Service Principal` option under "Manage Jenkins->Credentials->System->Global credentials"
      
      1. `ARM_CLIENT_ID` - Azure Client ID (APP ID) of the application
      2. `ARM_CLIENT_SECRET` - Azure Client Secret (Password) of the application
      3. `ARM_SUBSCRIPTION_ID` - Azure Subscription ID.
      4. `ARM_TENANT_ID` - The Azure Tenant ID

:::tip
Follow this [article](https://learn.microsoft.com/en-us/cli/azure/azure-cli-sp-tutorial-1?tabs=bash) to create a service principal in order to get the Azure credentials.
:::

2. Create a Port blueprint with the following properties:

:::note
Keep in mind this can be any blueprint you would like and this is just an example.
:::

<details>
    <summary>Port Azure Storage Account Blueprint</summary>

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


3. Create Port Action from [here](https://app.getport.io/self-serve) using the following JSON definition:

:::note
Please make sure to modify JENKINS_HOST and TOKEN placeholders to match your environment.
:::

  <details>
  <summary>Port Action</summary>

```json showLineNumbers
{
    "identifier": "create_azure_storage",
    "title": "Create Azure Storage",
    "icon": "S3",
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
    "invocationMethod": {
        "type": "WEBHOOK",
        "agent": false,
        "url": "https://<JENKINS_HOST>/generic-webhook-trigger/invoke?token=<TOKEN>",
        "synchronized": false,
        "method": "POST"
    },
    "trigger": "CREATE",
    "requiredApproval": false
}
```

  </details>

4. Create a Terraform templates in your GitHub repository:

<details>
  <summary>Terraform `main.tf` template</summary>
  
  ```yaml
    # Configure the Azure provider
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
  <summary>Terraform `variables.tf` template</summary>
  
  ```yaml
    # Service Principal Variables

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
<summary>Terraform `output.tf` template</summary>
  
  ```yaml
    output "endpoint_url" {
        value = azurerm_storage_account.storage_account.primary_web_endpoint
    }
  ```
</details>

5. Create a Jenkins pipeline file  with the following content:
:::note
Please make sure to modify `YOUR_USERNAME` and `YOUR_REPO` placeholder in the git repo of the `Checkout` stage.
:::

<details>
<summary>Jenkins Pipeline Script</summary>

```yml showLineNumbers
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
                [key: 'storage_name', value: '$.payload.properties.storage_name'],
                [key: 'storage_location', value: '$.payload.properties.storage_location'],
                [key: 'PORT_RUN_ID', value: '$.context.runId'],
                [key: 'BLUEPRINT_ID', value: '$.context.blueprint']
            ],
            causeString: 'Triggered by Port',
            allowSeveralTriggersPerBuild: true,
            tokenCredentialId: "webhook-token",
            
            regexpFilterExpression: '',
            regexpFilterText: '',
            printContributedVariables: true,
            printPostContent: true
        )
    }

    stages {
        stage('Checkout') {
            steps {
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
                    script {
                        echo 'Initializing Terraform'
                        sh 'terraform init'
                        
                        echo 'Validating Terraform configuration'
                        sh 'terraform validate'
                        
                        echo 'Creating Terraform Plan'
                        sh """
                        terraform plan -out=tfazure -var storage_account_name=$storage_name -var location=$storage_location -var port_run_id=$PORT_RUN_ID -target=azurerm_storage_account.storage_account
                        """
                        
                        echo 'Applying Terraform changes'
                        sh 'terraform apply -auto-approve -input=false tfazure'
                    }
                }
            }

        }
        stage('Notify Azure Stage') {
            steps {
                script {
                    def logs_report_response = sh(script: """
                        curl -X POST \
                            -H "Content-Type: application/json" \
                            -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                            -d '{"message": "Created azure resource"}' \
                            "https://api.getport.io/v1/actions/runs/$PORT_RUN_ID/logs"
                    """, returnStdout: true)

                    println(logs_report_response)
                }
            }
        }
        stage('Terraform Port') {
            steps {
                withCredentials([azureServicePrincipal(
                    credentialsId: 'azure',
                    subscriptionIdVariable: 'ARM_SUBSCRIPTION_ID',
                    clientIdVariable: 'ARM_CLIENT_ID',
                    clientSecretVariable: 'ARM_CLIENT_SECRET',
                    tenantIdVariable: 'ARM_TENANT_ID'
                ), usernamePassword(credentialsId: 'port-credentials', usernameVariable: 'TF_VAR_port_client_id', passwordVariable: 'TF_VAR_port_client_secret')]) {
                    script {

                        echo 'Creating Terraform Plan'
                        sh """
                        terraform plan -out=tfport -var storage_account_name=$storage_name -var location=$storage_location -var port_run_id=$PORT_RUN_ID
                        """
                        
                        echo 'Applying Terraform changes'
                        sh 'terraform apply -auto-approve -input=false tfport'
                    }
                }
            }

        }

        stage('Notify Port Stage') {
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
                        -d '{"status":"FAILURE", "message": {"run_status": "Failed to create azure resource ${storage_name}"}}' \
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

6. Trigger the action from the [Self-service](https://app.getport.io/self-serve) tab of your Port application.

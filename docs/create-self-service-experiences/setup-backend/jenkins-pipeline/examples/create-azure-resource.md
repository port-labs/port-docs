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
    }

    required_version = ">= 1.1.0"
    }

    provider "azurerm" {
        client_id       = var.client_id
        client_secret   = var.client_secret
        subscription_id = var.subscription_id
        tenant_id       = var.tenant_id

        features {}
    }

    resource "azurerm_storage_account" "storage_account" {
        name                = var.storage_account_name
        resource_group_name = var.resource_group_name

        location                 = var.location
        account_tier             = "Standard"
        account_replication_type = "LRS"
        account_kind             = "StorageV2"
    }
  ```
</details>

<details>
  <summary>Terraform `variables.tf` template</summary>
  
  ```yaml
    # Service Principal Variables
    variable "client_id" {
        description =   "Client ID (APP ID) of the application"
        default     = "XXXXXX-1111-2222-3333-YYYYYYYYYY"
        type        =   string
    }

    variable "client_secret" {
        description =   "Client Secret (Password) of the application"
        default     = "XXXXXX-1111-2222-3333-YYYYYYYYYY"
        type        =   string
    }

    variable "subscription_id" {
        description =   "Subscription ID"
        default     = "XXXXXX-1111-2222-3333-YYYYYYYYYY"
        type        =   string
    }

    variable "tenant_id" {
        description =   "Tenant ID"
        default     = "XXXXXX-1111-2222-3333-YYYYYYYYYY"
        type        =   string
    }

    variable "resource_group_name" {
        type        = string
        default     = "YourResourceGroup"
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
Please make sure to modify `YOUR_USERNAME` and `YOUR_REPO` placeholder in the pipeline.
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
        
        PORT_CLIENT_ID = credentials('PORT_CLIENT_ID')
        PORT_CLIENT_SECRET = credentials('PORT_CLIENT_SECRET')
        
        PORT_ACCESS_TOKEN = ""
        endpoint_url = ""

    }
    
    // uncomment for webhook trigger
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
        
        stage('Terraform') {
            steps {
                withCredentials([azureServicePrincipal(
                    credentialsId: 'azure',
                    subscriptionIdVariable: 'ARM_SUBSCRIPTION_ID',
                    clientIdVariable: 'ARM_CLIENT_ID',
                    clientSecretVariable: 'ARM_CLIENT_SECRET',
                    tenantIdVariable: 'ARM_TENANT_ID'
                )]) {
                    script {
                        echo 'Initializing Terraform'
                        sh 'terraform init'
                        
                        echo 'Validating Terraform configuration'
                        sh 'terraform validate'
                        
                        echo 'Creating Terraform Plan'
                        sh """
                        terraform plan -out=tfplan -var storage_account_name=$storage_name -var location=$storage_location -var "client_id=$ARM_CLIENT_ID" -var "client_secret=$ARM_CLIENT_SECRET" -var "subscription_id=$ARM_SUBSCRIPTION_ID" -var "tenant_id=$ARM_TENANT_ID"
                        """
                        
                        echo 'Applying Terraform changes'
                        sh 'terraform apply -auto-approve -input=false tfplan'
                    }
                }
            }
        }
		stage('Create entity') {
            steps {
                script {
                    def terraformOutput = sh(script: 'terraform output endpoint_url | sed \'s/"//g\'', returnStdout: true)
                    // Remove any newline characters
                    terraformOutput = terraformOutput.replaceAll('\n', '')
                    
                    // Maintain the previous functionality of trimming the string
                    endpoint_url = terraformOutput.trim()
                
                    def status_report_response = sh(script: """
						curl --location --request POST "https://api.getport.io/v1/blueprints/$BLUEPRINT_ID/entities?upsert=true&run_id=$PORT_RUN_ID&create_missing_related_entities=true" \
        --header "Authorization: Bearer $PORT_ACCESS_TOKEN" \
        --header "Content-Type: application/json" \
        --data-raw '{
				"identifier": "$storage_name",
				"title": "$storage_name",
				"properties": {"storage_name":"$storage_name","storage_location":"$storage_location", "endpoint": "$endpoint_url"},
				"relations": {}
			}'""", returnStdout: true)

                    println(status_report_response)
                }
            }
        }
        stage('Send logs example') {
            steps {
                script {
                    def logs_report_response = sh(script: """
                        curl -X POST \
                            -H "Content-Type: application/json" \
                            -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                            -d '{"message": "this is a log test message example"}' \
                            "https://api.getport.io/v1/actions/runs/$PORT_RUN_ID/logs"
                    """, returnStdout: true)

                    println(logs_report_response)
                }
            }
        }
        stage('Update status example') {
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

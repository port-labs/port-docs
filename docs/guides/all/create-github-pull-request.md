---
sidebar_position: 3
displayed_sidebar: null
description: Follow this guide to create a GitHub pull request in Port, ensuring seamless code review and collaboration.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import FindCredentials from "/docs/build-your-software-catalog/custom-integration/api/_template_docs/_find_credentials.mdx";


# Create Github pull request

This example illustrates how to open a pull-request in a GitHub repository from within Port using a Jenkins pipeline.

The workflow involves adding a resource block to a Terraform `main.tf` file and subsequently generating a PR for the modification on GitHub. In this specific instance, the added resource is a storage account in the Azure cloud.

:::info Prerequisites

- This guide assumes you have a Port account and a basic knowledge of working with Port. If you haven't done so, go ahead and complete the [quickstart](/getting-started/overview). **Setup the `Service` blueprint that you will be using in this guide.**
- You will need a GitHub repository in which you can place the files that we will use in this guide. If you don't have one, we recommend [creating a new repository](https://docs.github.com/en/get-started/quickstart/create-a-repo) named `port-actions`.
- [Generic Webhook Trigger](https://plugins.jenkins.io/generic-webhook-trigger/) - This plugin enables Jenkins to receive and trigger jobs based on incoming HTTP requests, extracting data from JSON or XML payloads and making it available as variables.
:::


## Example - modify `main.tf` to add a resource block

### Setup the action's frontend

1. Head to the [Self-service tab](https://app.getport.io/self-serve) in your Port application, and click on `+ New action`.

2. Each action in Port is directly tied to a <PortTooltip id="blueprint">blueprint</PortTooltip>. Our action creates a resource that is associated with a service and will be provisioned as part of the service's CD process.
   
   Choose `Service` from the dropdown list.

3. This action does not create/delete entities, but rather performs an operation on an existing <PortTooltip id="entity">entity</PortTooltip>. Therefore, we will choose `Day-2` as the action type.  
   Fill out the form like this and click `Next`:

<img src='/img/self-service-actions/setup-backend/jenkins-pipeline/iacActionDetails.png' width='50%' />

<br/><br/>

4. We want the developer who uses this action to specify simple inputs and not be overwhelmed with all the configurations available for an Azure storage account. For this action, we will define a name and a location.  
   Click on `+ New input`, fill out the form like this and click `Create`:

<img src='/img/self-service-actions/setup-backend/jenkins-pipeline/iacActionInputName.png' width='50%' />

<br/><br/>

5. Now let's create the location input of our resource.  
   Click on `+ New input`, fill out the form like this and click `Create`:

<img src='/img/self-service-actions/setup-backend/jenkins-pipeline/iacActionInputLocation.png' width='50%' />

<br/><br/>

6. Now we'll define the backend of the action. Select the `Run Jenkins pipeline` invocation type.
   - Replace the `Webhook URL` with your jenkins job URL.
   - Make sure the URL is in the format `http://JENKINS_URL/generic-webhook-trigger/invoke?token=<JOB_TOKEN>`
   - Click `Next`:
   

<img src='/img/self-service-actions/setup-backend/jenkins-pipeline/iacActionBackend.png' width='75%' />

<br/><br/>
   :::tip
   Learn more about the Jenkins invocation type [here](/actions-and-automations/setup-backend/jenkins-pipeline/).
   :::


7. The last step is customizing the action's permissions. For simplicity's sake, we will use the default settings. For more information, see the [permissions](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/) page. Click `Create`.

The action's frontend is now ready 🥳

### Setup the action's backend

Now we want to write the Jenkins pipeline that our action will trigger.

1. First, let's obtain the necessary token and secrets:

    - Go to your [GitHub tokens page](https://github.com/settings/tokens), create a personal access token with `repo` and `admin:org` scope, and copy it (this token is needed to create a pull-request from our pipeline).

    <img src='/img/guides/personalAccessToken.png' width='80%' />

    - <FindCredentials />

2. Create the following as Jenkins Credentials:
    1. Create the Port Credentials using the `Username with password` kind and the id `port-credentials`.
        1. `PORT_CLIENT_ID` - Port Client ID.
        2. `PORT_CLIENT_SECRET` - Port Client Secret.
    2. `WEBHOOK_TOKEN` - The webhook token so that the job can only be triggered if that token is supplied.
    3. `GITHUB_TOKEN` - The personal access token obtained from the previous step.

3. We will now create a simple `.tf` file that will serve as a template for our new resource:

- In your GitHub repository, create a file named `create-azure-storage.tf` under `/templates/` (it's path should be `/templates/create-azure-storage.tf`).
- Copy the following snippet and paste it in the file's contents:

<details>
<summary><b>create-azure-storage.tf</b></summary>

```hcl showLineNumbers title="create-azure-storage.tf"

resource "azurerm_storage_account" "storage_account" {
  name                = "{{ storage_name }}"
  resource_group_name = "YourResourcesGroup" # replace this with one of your resource groups in your azure cloud account

  location                 = "{{ storage_location }}"
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
}
```

</details>

Add the `main.tf` file in the root of your repository.

<details>
<summary><b>main.tf</b></summary>

```hcl showLineNumbers title="main.tf"
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

  features {}
}
```

</details>
  
4. Now let's create the pipeline file:

    1. [Enable webhook trigger for a pipeline](/actions-and-automations/setup-backend/jenkins-pipeline#enabling-webhook-trigger-for-a-pipeline)
    2. [Define variables for a pipeline](/actions-and-automations/setup-backend/jenkins-pipeline#defining-variables): Define the STORAGE_NAME, STORAGE_LOCATION, REPO_URL and PORT_RUN_ID variables.
    3. [Token Setup](/actions-and-automations/setup-backend/jenkins-pipeline#token-setup): Define the token to match `JOB_TOKEN` as configured in your Port Action.

Our pipeline will consist of 3 steps for the selected service's repository:

- Adding a resource block to the `main.tf` using the template and replacing its variables with the data from the action's input.
- Creating a pull request in the repository to add the new resource.
- Reporting & logging the action result back to Port.

In your Jenkins pipeline, use the following snippet as its content:

<details>
<summary><b>Jenkins pipeline</b></summary>

```groovy showLineNumbers title="Jenkinsfile"
import groovy.json.JsonSlurper

pipeline {
    agent any

    environment {
        GITHUB_TOKEN = credentials("GITHUB_TOKEN")
        
        NEW_BRANCH_PREFIX = 'infra/new-resource'
        NEW_BRANCH_NAME = "${NEW_BRANCH_PREFIX}-${STORAGE_NAME}"
        TEMPLATE_FILE = "templates/create-azure-storage.tf"
        
        PORT_ACCESS_TOKEN = ""
        REPO = ""
    }
    
   
    
    triggers {
        GenericTrigger(
            genericVariables: [
                [key: 'STORAGE_NAME', value: '$.payload.properties.storage_name'],
                [key: 'STORAGE_LOCATION', value: '$.payload.properties.storage_location'],
                [key: 'REPO_URL', value: '$.payload.entity.properties.url'],
                [key: 'PORT_RUN_ID', value: '$.context.runId']
            ],
            causeString: 'Triggered by Port',
            allowSeveralTriggersPerBuild: true,

            regexpFilterExpression: '',
            regexpFilterText: '',
            printContributedVariables: true,
            printPostContent: true
        )
    }


    stages {
        stage('Checkout') {
            steps {
                script {
                    def path = REPO_URL.substring(REPO_URL.indexOf("/") + 1);
                    def pathUrl = path.replace("/github.com/", "");
                    
                    REPO = pathUrl
                }
        
                git branch: 'main', credentialsId: 'github', url: "git@github.com:${REPO}.git"
            }
        }
        
        stage('Make Changes') {
            steps {
                script {
                    sh """cat ${TEMPLATE_FILE} | sed "s/{{ storage_name }}/${STORAGE_NAME}/g; s/{{ storage_location }}/${STORAGE_LOCATION}/g" >> main.tf"""
                    
                }
            }
        }
        stage('Create Branch and Commit') {
            steps {
                script {
                    sh "git checkout -b ${NEW_BRANCH_NAME}"
                    sh "git commit -am 'Add a new resource block file'"
                    sh "git push origin ${NEW_BRANCH_NAME}"
                }
            }
        }

        stage('Create pull request') {
            steps {
                script {
                    repo = REPO
                    branch_name = NEW_BRANCH_NAME
                    base_branch = 'main'
                    title = 'New resource block ' + STORAGE_NAME
                    body = 'This pull request adds a new resource block to the project.'

                    createPullRequestCurl(repo, branch_name, base_branch, title, body)
                }
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
        stage('Notify Port') {
            steps {
                script {
                    def logs_report_response = sh(script: """
                        curl -X POST \
                            -H "Content-Type: application/json" \
                            -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                            -d '{"message": "Created GitHub PR for new terraform resource ${STORAGE_NAME}"}"}' \
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


def createPullRequestCurl(repo, headBranch, baseBranch, title, body) {
    curlCommand = "curl -X POST https://api.github.com/repos/$repo/pulls -H 'Authorization: Bearer ${GITHUB_TOKEN}' -d '{ \"head\": \"$headBranch\", \"base\": \"$baseBranch\", \"title\": \"$title\", \"body\": \"$body\", \"draft\": false }'"

    try {
        response = sh(script: curlCommand)

        if (response.contains('201 Created')) {
            println "Pull request created successfully"
        } else {
            println "Failed to create pull request"
            println response
        }
    } catch (Exception e) {
        println "Error occurred during CURL request: ${e.getMessage()}"
    }
}
```

</details>

All done! The action is ready to be executed 🚀

### Execute the action

After creating an action, it will appear under the `Self-service` tab of your Port application:

<img src='/img/self-service-actions/setup-backend/jenkins-pipeline/iacActionExecute.png' />

1. Click on `Execute`.

2. Enter a name for your Azure storage account and a location, select any service from the list and click `Execute`. A small popup will appear, click on `View details`:
<img src='/img/self-service-actions/setup-backend/jenkins-pipeline/iacActionAfterCreation.png' width='35%' />
<img src='/img/self-service-actions/setup-backend/jenkins-pipeline/iacActionExecutePopup.png' width='40%' />

3. This page provides details about the action run. We can see that the backend returned `Success` and the pull-request was created successfully:

<img src='/img/self-service-actions/setup-backend/jenkins-pipeline/iacActionRunAfterExecution.png' width='90%' />

<br />
All done! You can now create PRs for your services directly from Port 💪🏽


:::tip 
You may create a Jenkins pipeline to trigger the resource deployment on merging the PR. Checkout this example [pipeline](https://github.com/port-labs/jenkins-terraform-azure/blob/main/Jenkinsfile).
:::


More relevant guides and examples:

- [Deploy resource in Azure Cloud with Terraform](/guides/all/deploy-azure-resource.md)
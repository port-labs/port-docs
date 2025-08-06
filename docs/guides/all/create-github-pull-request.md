---
sidebar_position: 3
displayed_sidebar: null
description: Create GitHub pull requests from Port using Jenkins pipelines for automated infrastructure changes
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import FindCredentials from "/docs/build-your-software-catalog/custom-integration/api/_template_docs/_find_credentials.mdx";


# Create GitHub pull requests from Port

This guide demonstrates how to open a pull-request in a GitHub repository from within Port using a Jenkins pipeline.

The workflow involves adding a resource block to a Terraform `main.tf` file and subsequently generating a PR for the modification on GitHub. In this specific instance, the added resource is a storage account in the Azure cloud.

## Common use cases

- Automate infrastructure provisioning by creating pull requests for Terraform changes.
- Enable developers to request infrastructure resources through self-service actions.
- Maintain proper GitOps workflows with automated branch creation and PR generation.
- Streamline the process of adding new cloud resources to your infrastructure codebase.

## Prerequisites

This guide assumes you have:

- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Jenkins with the [Generic Webhook Trigger](https://plugins.jenkins.io/generic-webhook-trigger/) plugin installed


## Implementation

### Set up self-service action

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Open GitHub Pr with Jenkins action(Click to expand)</b></summary>

    :::info Placeholders
    - `YOUR_JENKINS_URL` - The URL of your Jenkins server.
    - `JOB_TOKEN` - The token of the Jenkins job.
    :::

    ```json showLineNumbers
    {
      "identifier": "open_github_pr_with_jenkins",
      "title": "Open GitHub PR with Jenkins",
      "icon": "Microservice",
      "description": "This action opens a PR after modifying a file using Jenkins",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "storage_name": {
              "type": "string",
              "title": "Storage Name"
            },
            "storage_location": {
              "type": "string",
              "title": "Storage Location"
            }
          },
          "required": [],
          "order": [
            "storage_name",
            "storage_location"
          ]
        },
        "blueprintIdentifier": "service"
      },
      "invocationMethod": {
        "type": "JENKINS",
        "url": "http://YOUR_JENKINS_URL/generic-webhook-trigger/invoke?token=<JOB_TOKEN>",
        "agent": false,
        "body": {
          "{{ spreadValue() }}": "{{ .inputs }}",
          "port_context": {
            "runId": "{{ .run.id }}",
            "blueprint": "{{ .action.blueprint }}",
            "entity": "{{ .entity }}"
          }
        }
      },
      "requiredApproval": false
    }
    ```

    :::tip Jenkins invocation type
    Learn more about the Jenkins invocation type [here](/actions-and-automations/setup-backend/jenkins-pipeline/).
    :::

    </details>

5. Click `Save`.

Now you should see the `Open GitHub Pr with Jenkins` action in the self-service page. 🎉

### Configure Jenkins pipeline

Now we want to write the Jenkins pipeline that our action will trigger.

### Set up credentials and tokens

1. First, let's obtain the necessary token and secrets:

    - Go to your [GitHub tokens page](https://github.com/settings/tokens), create a personal access token with `repo` and `admin:org` scope, and copy it (this token is needed to create a pull-request from our pipeline).

        <img src='/img/guides/personalAccessToken.png' width='80%' />

    - <FindCredentials />

2. Create the following as Jenkins Credentials:
    -  Create the Port Credentials using the `Username with password` kind and the id `port-credentials`.

        - `PORT_CLIENT_ID` - Port Client ID.

        - `PORT_CLIENT_SECRET` - Port Client Secret.

    -  `WEBHOOK_TOKEN` - The webhook token so that the job can only be triggered if that token is supplied.

    -  `GITHUB_TOKEN` - The personal access token obtained from the previous step.

### Create Terraform templates

We will now create a simple `.tf` file that will serve as a template for our new resource:

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

    - Add the `main.tf` file in the root of your repository.

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
  
### Create the Jenkins pipeline

Now let's create the pipeline file:

    1. [Enable webhook trigger for a pipeline](/actions-and-automations/setup-backend/jenkins-pipeline#enabling-webhook-trigger-for-a-pipeline).

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

## Let's test it!

Now let's test the action to ensure it works correctly:

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.

2. Click on the `Open GitHub PR with Jenkins` action.

3. Enter a name for your Azure storage account and a location.

4. Select any service from the list and click `Execute`.

5. A small popup will appear - click on `View details` to see the action run details.

6. Verify that the backend returned `Success` and the pull-request was created successfully in your GitHub repository.

7. Check your GitHub repository to confirm the new pull request has been created with the Terraform changes.
All done! You can now create PRs for your services directly from Port 💪🏽


:::tip Create a Jenkins pipeline to trigger the resource deployment on merging the PR
You may create a Jenkins pipeline to trigger the resource deployment on merging the PR. Checkout this example [pipeline](https://github.com/port-labs/jenkins-terraform-azure/blob/main/Jenkinsfile).
:::


More relevant guides and examples:

- [Deploy resource in Azure Cloud with Terraform](/guides/all/deploy-azure-resource.md)
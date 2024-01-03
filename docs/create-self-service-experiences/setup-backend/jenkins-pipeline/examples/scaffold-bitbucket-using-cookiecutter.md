---
sidebar_position: 2
---

# Scaffold BitBucket Repositories Using Cookiecutter

This example demonstrates how to quickly scaffold BitBucket repositories using a [Cookiecutter Template](https://www.cookiecutter.io/templates) via Port Actions.

In addition, as cookiecutter is an open-source project you can make your own project template, learn more about it [here](https://cookiecutter.readthedocs.io/en/2.0.2/tutorials.html#create-your-very-own-cookiecutter-project-template).

## Example - scaffolding golang template

Follow these steps to get started with the Golang template:

1. Create the following as Jenkins Credentials:

   1. `BITBUCKET_USERNAME` - a user with access to the BitBucket Workspace and Project.
   2. `BITBUCKET_APP_PASSWORD` - an [App Password](https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/) with the `Repositories:Read` and `Repositories:Write` permissions permissions.
   3. `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
   4. `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).

2. Create a Port blueprint with the following properties:

:::note
Keep in mind this can be any blueprint you would like and this is just an example.
:::

```json showLineNumbers
{
  "identifier": "microservice",
  "title": "Microservice",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "description": {
        "title": "Description",
        "type": "string"
      },
      "url": {
        "title": "URL",
        "format": "url",
        "type": "string"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

3. Create Port action using the following JSON definition:

:::note
Make sure to replace the placeholders for JENKINS_URL and JOB_TOKEN.
:::

```json showLineNumbers
[
  {
    "identifier": "scaffold_bitbucket",
    "title": "Scaffold Golang Microservice - BitBucket",
    "description": "Creates a repo for new golang Microservice on Bitbucket",
    "icon": "Go",
    "userInputs": {
      "properties": {
        "repo_name": {
          "icon": "Microservice",
          "title": "Repo Name",
          "type": "string"
        },
        "bitbucket_workspace_name": {
          "icon": "BitBucket",
          "title": "Bitbucket Workspace Name",
          "type": "string"
        },
        "bitbucket_project_key": {
          "title": "Bitbucket Project Key",
          "icon": "BitBucket",
          "description": "Bitbucket project key symbol",
          "type": "string"
        }
      },
      "required": [
        "repo_name",
        "bitbucket_workspace_name",
        "bitbucket_project_key"
      ]
    },
    "invocationMethod": {
      "type": "WEBHOOK",
      "agent": false,
      "url": "https://<JENKINS_URL>/generic-webhook-trigger/invoke?token=<JOB_TOKEN>",
      "synchronized": false,
      "method": "POST"
    },
    "trigger": "CREATE"
  }
]
```

4. Create a Jenkins Pipeline with the following configuration:

   1. [Enable webhook trigger for a pipeline](../jenkins-pipeline.md#enabling-webhook-trigger-for-a-pipeline)
   2. [Define variables for a pipeline](../jenkins-pipeline.md#defining-variables): Define the REPO_NAME, BITBUCKET_WORKSPACE_NAME, BITBUCKET_PROJECT_KEY and RUN_ID variables.

      ![Define Vars](../../../../../static/img/self-service-actions/setup-backend/jenkins-pipeline/scaffold-jenkins-bitbucket-vars.png)

   3. [Token Setup](../jenkins-pipeline.md#token-setup): Define the token to match `JOB_TOKEN` as configured in your Port Action.

5. Add the following content to the new pipeline:

<details>
<summary>Jenkins Pipeline Script</summary>

```yml showLineNumbers
import groovy.json.JsonSlurper

pipeline {
    agent any

    environment {
        COOKIECUTTER_TEMPLATE = 'https://github.com/lacion/cookiecutter-golang'
        REPO_NAME = "${REPO_NAME}"
        BITBUCKET_WORKSPACE_NAME = "${BITBUCKET_WORKSPACE_NAME}"
        BITBUCKET_PROJECT_KEY = "${BITBUCKET_PROJECT_KEY}"
        SCAFFOLD_DIR = "scaffold_${REPO_NAME}"
        PORT_ACCESS_TOKEN = ""
        PORT_BLUEPRINT_ID = "microservice"
        PORT_RUN_ID = "${RUN_ID}"
    }

    stages {
        stage('Get access token') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'PORT_CLIENT_ID', variable: 'PORT_CLIENT_ID'),
                        string(credentialsId: 'PORT_CLIENT_SECRET', variable: 'PORT_CLIENT_SECRET')
                    ]) {
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
        } // end of stage Get access token

        stage('Create BitBucket Repository') {
            steps {
                script {
                    def logs_report_response = sh(script: """
                        curl -X POST \
                          -H "Content-Type: application/json" \
                          -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                          -d '{"message": "Creating BitBucket repository: ${REPO_NAME} in Workspace: ${BITBUCKET_WORKSPACE_NAME}, Project: ${BITBUCKET_PROJECT_KEY}..."}' \
                             "https://api.getport.io/v1/actions/runs/${PORT_RUN_ID}/logs"
                    """, returnStdout: true)

                    println(logs_report_response)
                }
                script {
                    withCredentials([
                        string(credentialsId: 'BITBUCKET_USERNAME', variable: 'BITBUCKET_USERNAME'),
                        string(credentialsId: 'BITBUCKET_APP_PASSWORD', variable: 'BITBUCKET_APP_PASSWORD')
                    ]) {
                        sh """
                            curl -i -u ${BITBUCKET_USERNAME}:${BITBUCKET_APP_PASSWORD} \\
                            -d '{"is_private": true, "scm": "git", "project": {"key": "${BITBUCKET_PROJECT_KEY}"}}' \\
                            https://api.bitbucket.org/2.0/repositories/${BITBUCKET_WORKSPACE_NAME}/${REPO_NAME}
                        """
                    }
                }
            }
        } // end of stage Create BitBucket Repository

        stage('Scaffold Cookiecutter Template') {
            steps {
                script {
                    def logs_report_response = sh(script: """
                        curl -X POST \
                          -H "Content-Type: application/json" \
                          -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                          -d '{"message": "Scaffolding ${REPO_NAME}..."}' \
                             "https://api.getport.io/v1/actions/runs/${PORT_RUN_ID}/logs"
                    """, returnStdout: true)

                    println(logs_report_response)
                }
                script {
                    withCredentials([
                        string(credentialsId: 'BITBUCKET_USERNAME', variable: 'BITBUCKET_USERNAME'),
                        string(credentialsId: 'BITBUCKET_APP_PASSWORD', variable: 'BITBUCKET_APP_PASSWORD')
                    ]) {
                        def yamlContent = """
default_context:
  full_name: "Full Name"
  github_username: "bitbucketuser"
  app_name: "${REPO_NAME}"
  project_short_description": "A Golang project."
  docker_hub_username: "dockerhubuser"
  docker_image: "dockerhubuser/alpine-base-image:latest"
  docker_build_image: "dockerhubuser/alpine-golang-buildimage"
"""
                    // Write the YAML content to a file
                    writeFile(file: 'cookiecutter.yaml', text: yamlContent)

                        sh("""
                            rm -rf ${SCAFFOLD_DIR} ${REPO_NAME}
                            git clone https://${BITBUCKET_USERNAME}:${BITBUCKET_APP_PASSWORD}@bitbucket.org/${BITBUCKET_WORKSPACE_NAME}/${REPO_NAME}.git

                            cookiecutter ${COOKIECUTTER_TEMPLATE} --output-dir ${SCAFFOLD_DIR} --no-input --config-file cookiecutter.yaml -f

                            rm -rf ${SCAFFOLD_DIR}/${REPO_NAME}/.git*
                            cp -r ${SCAFFOLD_DIR}/${REPO_NAME}/* "${REPO_NAME}/"

                            cd ${REPO_NAME}
                            git config user.name "Jenkins Pipeline Bot"
                            git config user.email "jenkins-pipeline[bot]@users.noreply.jenkins.com"
                            git add .
                            git commit -m "Scaffolded project ${REPO_NAME}"
                            git push -u origin master
                            cd ..

                            rm -rf ${SCAFFOLD_DIR} ${REPO_NAME}
                        """)
                    }

                }
            }
        } // end of stage Clone Cookiecutter Template

        stage('CREATE Microservice entity') {
            steps {
                script {
                    def logs_report_response = sh(script: """
                        curl -X POST \
                          -H "Content-Type: application/json" \
                          -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                          -d '{"message": "Creating ${REPO_NAME} Microservice Port entity..."}' \
                             "https://api.getport.io/v1/actions/runs/${PORT_RUN_ID}/logs"
                    """, returnStdout: true)

                    println(logs_report_response)
                }
                script {
                    def status_report_response = sh(script: """
						curl --location --request POST "https://api.getport.io/v1/blueprints/$PORT_BLUEPRINT_ID/entities?upsert=true&run_id=$PORT_RUN_ID&create_missing_related_entities=true" \
        --header "Authorization: Bearer $PORT_ACCESS_TOKEN" \
        --header "Content-Type: application/json" \
        --data-raw '{
				"identifier": "${REPO_NAME}",
				"title": "${REPO_NAME}",
				"properties": {"description":"${REPO_NAME} golang project","url":"https://bitbucket.org/${BITBUCKET_WORKSPACE_NAME}/${REPO_NAME}/src"},
				"relations": {}
			}'

                    """, returnStdout: true)

                    println(status_report_response)
                }
            }
        } // end of stage CREATE Microservice entity

        stage('Update Port Run Status') {
            steps {
                script {
                    def status_report_response = sh(script: """
                        curl -X PATCH \
                          -H "Content-Type: application/json" \
                          -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                          -d '{"status":"SUCCESS", "message": {"run_status": "Scaffold Jenkins Pipeline completed successfully!"}}' \
                             "https://api.getport.io/v1/actions/runs/${PORT_RUN_ID}"
                    """, returnStdout: true)

                    println(status_report_response)
                }
            }
        } // end of stage Update Port Run Status
    }

    post {

        failure {
            // Update Port Run failed.
            script {
                def status_report_response = sh(script: """
                    curl -X PATCH \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                        -d '{"status":"FAILURE", "message": {"run_status": "Failed to Scaffold ${REPO_NAME}"}}' \
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

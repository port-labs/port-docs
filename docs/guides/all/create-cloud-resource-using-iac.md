---
displayed_sidebar: null
description: Learn how to create cloud resources using Infrastructure as Code (IaC) in Port for efficient and automated deployments.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Create cloud resources using IaC


This guide shows how to open a pull request in your Git repository—directly from Port—to create a new cloud resource using GitOps. 


## Prerequisites

- A Port account with permissions to create self-service actions.
- The [Git Integration](/build-your-software-catalog/sync-data-to-catalog/git/) that is relevant for you needs to be installed.
- A repository in your Git provider in which you can create a workflow/pipeline. We recommend naming it `Port-actions`.


## Common use cases

- Platform engineers can define the logic of creating a cloud resource, including standard enforcement, security and permission boundaries.
- Developers can easily create and track cloud resources directly from Port.


## Set up data model

To enable tracking of cloud resource definitions in Port, we'll add a new **URL** property to the existing `Repository` blueprint. 
This property will point to the location of IaC templates in your Git repository, letting us seamlessly link infrastructure code to each repository.


### Add a resource definitions property

In this guide we will add a new property to our `Repository` <PortTooltip id="blueprint">blueprint</PortTooltip>, which we can use to access our cloud resource definitions.

1. Go to your [Data model](https://app.getport.io/settings/data-model) page.
2. Expand your `Repository` <PortTooltip id="blueprint">blueprint</PortTooltip>, then click on `+ New property`.
3. Choose `URL` as the type, fill it like this and click `Save`:

    <img src='/img/guides/iacPropertyForm.png' width='40%' border='1px' />

This property is empty for now in all repositories, we will fill it as part of the action we're about to create 😎

## Setup the action's frontend

1. Head to the [Self-service page](https://app.getport.io/self-serve) of your portal.
2. Click on the `+ Action` button in the top-right corner :

    <img src='/img/guides/addActionIcon.png' width='35%' border='1px' />

3. Fill the basic form with the following:
    - **Title**: Enter `Create s3 bucket`
    - **Identifier** Toggle the switch icon off and type a  `create_s3_bucket`
    - **Description**: Enter the description (e.g., Create an s3 bucket)
    - **Icon**: Type s3 and choose the Icon (optional)
    - **Operation**:  Choose `Day-2`  from the dropdown
    - **Blueprint**:  Choose `Repository` from the dropdown
      
      <img src='/img/guides/iacActionDetails.png' width='50%' border='1px' />
     <br/>

4. Click on `Next`, and add the following inputs: `Name` and `Visibility`.

    To create the `Name` input field:

      - Click on `+ Input`.
      - Enter the **Title** `Name`.
      - Select the **Type** `Text`.
      - Add the **Description** (optional).
      - Set **Required** to `True`.
      - Click on the `Create` button.  
        <br/>
   
           <img src='/img/guides/iacActionInputName.png' width='50%' border='1px' />
        <br/>

   To create the `Visibility` input field:

      - Click on `+ Input`.
      - Enter the **Title**  `Visibility`.
      - Choose the **Type** `Select`.
      - Set **Required** to `True`.
      - Configure Additional Information:
          - **Item Type**: `String`.
          - **Limit**: `1 option`.
          - **Add Options**:
              - **Option 1**: `public` (choose a color).
              - **Option 2**: `private` (choose a color).
      - Click on the `Create` button.  
        <br/>

           <img src='/img/guides/iacActionInputVisibility.png' width='50%' border='1px' />
        <br/>

5. Click on `Next` to configure the **Backend**.

Now we'll define the backend of the action. Port supports multiple invocation types, depending on the Git provider you are using.

<Tabs groupId="git-provider" queryString defaultValue="github" values={[
{label: "GitHub", value: "github"},
{label: "GitLab", value: "gitlab"},
{label: "Bitbucket (Jenkins)", value: "bitbucket"}
]}>


<TabItem value="github">

Fill out the form with your values:

- Replace the `Organization` and `Repository` values with your values (this is where the workflow will reside and run).
  
- Name the workflow `port-create-bucket.yml`.
  
- Fill out your workflow details:  
  <img src='/img/guides/iacGithubBackend.png' width='50%' border='1px' />
  <br/>

- Scroll down to the `Configure the invocation payload` section.  
  This is where you can define which data will be sent to your backend each time the action is executed.  

  For this example, we will send some details that our backend needs to know - the inputs, along with the entity and the id of the action run.  
  Copy the following JSON snippet and paste it in the payload code box:

  ```json showLineNumbers
  {
    "port_context": {
      "entity": "{{ .entity.identifier }}",
      "runId": "{{ .run.id }}"
    },
    "name": "{{ .inputs.name }}",
    "visibility": "{{ .inputs.visibility }}"
  }
  ```

</TabItem>

<TabItem value="gitlab">

:::tip
You will need a few parameters for this part that are generated in the [setup the action's backend](#setup-the-actions-backend) section, it is recommended to complete the steps there and then follow the instructions here with all of the required information in hand.
:::

First, choose `Trigger Webhook URL` as the invocation type, then fill out the form:

- For the `Endpoint URL` you need to add a URL in the following format:
  ```text showLineNumbers
  https://gitlab.com/api/v4/projects/{GITLAB_PROJECT_ID}/ref/main/trigger/pipeline?token={GITLAB_TRIGGER_TOKEN}
  ```
    - The value for `{GITLAB_PROJECT_ID}` is the ID of the GitLab group that you create in the [setup the action's backend](#setup-the-actions-backend) section which stores the `.gitlab-ci.yml` pipeline file.
      - To find the project ID, browse to the GitLab page of the group you created, at the top right corner of the page, click on the vertical 3 dots button (next to `Fork`) and select `Copy project ID`
    - The value for `{GITLAB_TRIGGER_TOKEN}` is the trigger token you create in the [setup the action's backend](#setup-the-actions-backend) section.

- Set `HTTP method` to `POST`.

- Set `Request type` to `Async`.

- Set `Use self-hosted agent` to `No`.

  <img src='/img/guides/iacGitlabBackendForm.png' width='80%' border='1px' />

- Scroll down to the `Configure the invocation payload` section.  
  This is where you can define which data will be sent to your backend each time the action is executed.  

  For this example, we will send some details that our backend needs to know - the inputs, along with the entity and the id of the action run.   
  Copy the following JSON snippet and paste it in the "Body" code box:

  ```json showLineNumbers
  {
    "port_context": {
      "entity": "{{ .entity.identifier }}",
      "runId": "{{ .run.id }}",
    },
    "name": "{{ .inputs.name }}",
    "visibility": "{{ .inputs.visibility }}",
  }
  ```

</TabItem>

<TabItem value="bitbucket">

First, choose `Jenkins` as the invocation type.

- Follow the instructions under `Define a webhook to trigger a Jenkins job` to obtain your webhook URL.

Then, fill out your workflow details:

- Replace the `Webhook URL` with your value (this is where the pipeline will reside and run).

- Leave the `Use self-hosted agent` option set to `No`.
  <img src='/img/guides/scaffoldBitbucketBackendDetails.png' width='55%' border='1px' />

- Scroll down to the `Configure the invocation payload` section.  
  This is where you can define which data will be sent to your backend each time the action is executed.  

  For this example, we will send some details that our backend needs to know - the three user inputs, and the id of the action run.  
  Copy the following JSON snippet and paste it in the payload code box:

  ```json showLineNumbers
  {
    "port_context": {
      "entity": "{{ .entity.identifier }}",
      "runId": "{{ .run.id }}",
    },
    "name": "{{ .inputs.name }}",
    "visibility": "{{ .inputs.visibility }}",
    "bitbucket_workspace_name": "{{ .inputs.bitbucket_workspace_name }}",
  }
  ```

</TabItem>

</Tabs>

<br/>

The last step is customizing the action's permissions. For simplicity's sake, we will use the default settings. For more information, see the [permissions](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/) page. Click `Create`.

The action's frontend is now ready 🥳

## Setup the action's backend

Now we want to write the logic that our action will trigger.

<Tabs groupId="git-provider" queryString defaultValue="github" values={[
{label: "GitHub", value: "github"},
{label: "GitLab", value: "gitlab"},
{label: "Bitbucket (Jenkins)", value: "bitbucket"}
]}>

<TabItem value="github">

1. First, let's create the necessary token and secrets. If you've already completed the [scaffold a new service guide](/guides/all/scaffold-a-new-service), you should already have these configured and you can skip this step.

    - Go to your [Github tokens page](https://github.com/settings/tokens), create a personal access token with `repo` and `admin:org` scope, and copy it (this token is needed to create a pull-request from our workflow).

      <img src='/img/guides/personalAccessToken.png' width='80%' />

    - Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

2. In the repository where your workflow will reside, create 3 new secrets under `Settings->Secrets and variables->Actions`:

    - `ORG_ADMIN_TOKEN` - the personal access token you created in the previous step.
    - `PORT_CLIENT_ID` - the client ID you copied from your Port app.
    - `PORT_CLIENT_SECRET` - the client secret you copied from your Port app.

      <img src='/img/guides/repositorySecret.png' width='60%' />

      <br/><br/>

3. Now let's create the workflow file that contains our logic. Our workflow will consist of 3 steps:

    - Creating a copy of the template file in the selected service's repository and replacing its variables with the data from the action's input.
    - Creating a pull request in the selected service's repository to add the new resource.
    - Reporting & logging the action result back to Port, and updating the relevant service's `Resource definitions` property with the URL of the service's resources directory.

4. Under `.github/workflows/`, create a new file named `port-create-bucket.yml` and use the following snippet as its content:

    <details>
    <summary><b>Github workflow (click to expand)</b></summary>

    ```yaml showLineNumbers
    name: Create cloud resource
    on:
      workflow_dispatch:
        inputs:
          port_context:
            required: true
            description: Includes the entity identifier, and the action's run id
          name:
            required: true
            description: The name of the new resource
            type: string
          visibility:
            required: true
            description: The visibility of the new resource
            type: string
    jobs:
      createResource:
        runs-on: ubuntu-latest
        steps:
          # Checkout the workflow's repository
          - uses: actions/checkout@v4
          # Checkout the service's repository
          - uses: actions/checkout@v4
            with:
              repository: "${{ fromJson(inputs.port_context).entity }}"
              path: ./targetRepo
              token: ${{ secrets.ORG_ADMIN_TOKEN }}
          - name: Copy template file
            run: |
              mkdir -p ./targetRepo/resources
              cp templates/cloudResource.tf ./targetRepo/resources/${{ inputs.name }}.tf
          - name: Update new file data
            run: |
              sed -i 's/{{ bucket_name }}/${{ inputs.name }}/' ./targetRepo/resources/${{ inputs.name }}.tf
              sed -i 's/{{ bucket_acl }}/${{ inputs.visibility }}/' ./targetRepo/resources/${{ inputs.name }}.tf
          - name: Open a pull request
            uses: peter-evans/create-pull-request@v5
            with:
              token: ${{ secrets.ORG_ADMIN_TOKEN }}
              path: ./targetRepo
              commit-message: Create new resource - ${{ inputs.name }}
              committer: GitHub <noreply@github.com>
              author: ${{ github.actor }} <${{ github.actor }}@users.noreply.github.com>
              signoff: false
              branch: new-resource-${{ inputs.name }}
              delete-branch: true
              title: Create new resource - ${{ inputs.name }}
              body: |
                Create new ${{ inputs.visibility }} resource - ${{ inputs.name }}
              draft: false
      create-entity-in-port-and-update-run:
        runs-on: ubuntu-latest
        needs: createResource
        steps:
          - name: UPSERT Entity
            uses: port-labs/port-github-action@v1
            with:
              identifier: ${{ fromJson(inputs.port_context).entity }}
              blueprint: githubRepository
              properties: |-
                {
                  "resource_definitions": "${{ github.server_url }}/${{ fromJson(inputs.port_context).entity }}/blob/main/resources/"
                }
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              baseUrl: https://api.getport.io
              operation: UPSERT
              runId: ${{ fromJson(inputs.port_context).runId }}
          - name: Create a log message
            uses: port-labs/port-github-action@v1
            with:
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              baseUrl: https://api.getport.io
              operation: PATCH_RUN
              runId: ${{ fromJson(inputs.port_context).runId }}
              logMessage: Pull request created successfully for "${{ inputs.name }}" 🚀
    ```

    </details>

</TabItem>

<TabItem value="gitlab">

First, let's create a GitLab project that will store our new bucket creation pipeline - Go to your GitLab account and create a new project.

Next, let's create the necessary token and secrets:
   
  - Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

  - Go to your [project](https://gitlab.com/), and follow the steps [here](https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html#create-a-project-access-token) to create a new project access token with the following permission scopes: `write_repository`, then save its value as it will be required in the next step.
  <img src='/img/guides/gitlabProjectAccessTokenPerms.png' width='80%' border='1px' />

  - Go to your GitLab project, from the `Settings` menu at the sidebar on the left, select `CI/CD`.

  - Expand the `Variables` section and save the following secrets:
    - `PORT_CLIENT_ID` - Your Port client ID.
    - `PORT_CLIENT_SECRET` - Your Port client secret.
    - `GITLAB_ACCESS_TOKEN` - The GitLab group access token you created in the previous step.
    <br/>
    <img src='/img/guides/gitlabPipelineVariables.png' width='80%' border='1px' />

  - Expand the `Pipeline trigger tokens` section and add a new token, give it a meaningful description such as `Bucket creator token` and save its value
     - This is the `{GITLAB_TRIGGER_TOKEN}` that you need for the defining the backend of the Action.
  
      <img src='/img/guides/gitlabPipelineTriggerToken.png' width='80%' border='1px' />

Now let's create the pipeline file that contains our logic. In the root of your GitLab project, create a new file named `.gitlab-ci.yml` and use the following snippet as its content:

    <details>
    <summary><b>GitLab pipeline (click to expand)</b></summary>

    ```yaml showLineNumbers title=".gitlab-ci.yml"
    image: python:3.10.0-alpine

    stages: # List of stages for jobs, and their order of execution
      - fetch-port-access-token
      - create-tf-resource-pr
      - create-entity
      - update-run-status

    fetch-port-access-token: # Example - get the Port API access token and RunId
      stage: fetch-port-access-token
      except:
        - pushes
      before_script:
        - apk update
        - apk add jq curl -q
      script:
        - |
          echo "Getting access token from Port API"
          accessToken=$(curl -X POST \
            -H 'Content-Type: application/json' \
            -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
            -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
          echo "ACCESS_TOKEN=$accessToken" >> data.env
          runId=$(cat $TRIGGER_PAYLOAD | jq -r '.port_context.runId')
          echo "RUN_ID=$runId" >> data.env
          curl -X POST \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $accessToken" \
            -d '{"message":"🏃‍♂️ Starting S3 bucket creation process..."}' \
            "https://api.getport.io/v1/actions/runs/$runId/logs"
          curl -X PATCH \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $accessToken" \
            -d '{"link":"'"$CI_PIPELINE_URL"'"}' \
            "https://api.getport.io/v1/actions/runs/$runId"
      artifacts:
        reports:
          dotenv: data.env

    create-tf-resource-pr:
      before_script: |
        apk update
        apk add jq curl git -q
      stage: create-tf-resource-pr
      except:
        - pushes
      script:
        - | 
          git config --global user.email "bucketCreator@email.com"
          git config --global user.name "Bucket Creator"
          git config --global init.defaultBranch "main"
          git clone https://:${GITLAB_ACCESS_TOKEN}@gitlab.com/${CI_PROJECT_NAMESPACE}/${CI_PROJECT_NAME}.git sourceRepo
          cat $TRIGGER_PAYLOAD
          git clone https://:${GITLAB_ACCESS_TOKEN}@gitlab.com/${CI_PROJECT_NAMESPACE}/$(cat $TRIGGER_PAYLOAD | jq -r '.context.entity').git targetRepo
        - |
          bucket_name=$(cat $TRIGGER_PAYLOAD | jq -r '.name')
          visibility=$(cat $TRIGGER_PAYLOAD | jq -r '.visibility')
          echo "BUCKET_NAME=${bucket_name}" >> data.env
          echo "Creating a new S3 bucket Terraform resource file"
          mkdir -p targetRepo/resources/
          cp sourceRepo/templates/cloudResource.tf targetRepo/resources/${bucket_name}.tf
          sed -i "s/{{ bucket_name }}/${bucket_name}/" ./targetRepo/resources/${bucket_name}.tf
          sed -i "s/{{ bucket_acl }}/${visibility}/" ./targetRepo/resources/${bucket_name}.tf
        - |
          cd ./targetRepo
          git add resources/${bucket_name}.tf
          git commit -m "Added ${bucket_name} resource file"
          git checkout -b new-bucket-branch-${bucket_name}
          git push origin new-bucket-branch-${bucket_name}
          PROJECT_NAME=$(cat $TRIGGER_PAYLOAD | jq -r '.port_context.entity | @uri')
          PROJECTS=$(curl --header "PRIVATE-TOKEN: $GITLAB_ACCESS_TOKEN" "https://gitlab.com/api/v4/groups/$CI_PROJECT_NAMESPACE_ID/projects?search=$(cat $TRIGGER_PAYLOAD | jq -r '.port_context.entity')")
          PROJECT_ID=$(echo ${PROJECTS} | jq '.[] | select(.name=="'$PROJECT_NAME'") | .id' | head -n1)

          PR_RESPONSE=$(curl --request POST --header "PRIVATE-TOKEN: ${GITLAB_ACCESS_TOKEN}" "https://gitlab.com/api/v4/projects/${PROJECT_ID}/merge_requests?source_branch=new-bucket-branch-${bucket_name}&target_branch=main&title=New-Bucket-Request")
          PR_URL=$(echo ${PR_RESPONSE} | jq -r '.web_url')
          curl -X POST \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -d "{\"message\":\"📡 Opened pull request with new bucket resource!\nPR Url: ${PR_URL}\"}" \
            "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"

      artifacts:
        reports:
          dotenv: data.env

    create-entity:
      stage: create-entity
      except:
        - pushes
      before_script:
        - apk update
        - apk add jq curl -q
      script:
        - |
          echo "Creating Port entity to match new S3 bucket"
          SERVICE_ID=$(cat $TRIGGER_PAYLOAD | jq -r '.port_context.entity')
          PROJECT_URL="https://gitlab.com/${CI_PROJECT_NAMESPACE_ID}/${SERVICE_ID}/-/blob/main/resources/"
          echo "SERVICE_ID=${SERVICE_ID}" >> data.env
          echo "PROJECT_URL=${PROJECT_URL}" >> data.env
          curl -X POST \
              -H 'Content-Type: application/json' \
              -H "Authorization: Bearer $ACCESS_TOKEN" \
              -d '{"message":"🚀 Updating the service with the new resource definition!"}' \
              "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"
          curl --location --request POST "https://api.getport.io/v1/blueprints/gitlabRepository/entities?upsert=true&run_id=$RUN_ID&create_missing_related_entities=true" \
            --header "Authorization: Bearer $ACCESS_TOKEN" \
            --header "Content-Type: application/json" \
            -d '{"identifier": "'"$SERVICE_ID"'","title": "'"$SERVICE_ID"'","properties": {"resource_definitions": "'"$PROJECT_URL"'"}, "relations": {}}'

    update-run-status:
      stage: update-run-status
      except:
        - pushes
      image: curlimages/curl:latest
      script:
        - |
          echo "Updating Port action run status and final logs"
          curl -X POST \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -d '{"message":"✅ PR Opened for bucket '"$BUCKET_NAME"'!"}' \
            "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"
          curl -X PATCH \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -d '{"status":"SUCCESS",  "message": {"run_status": "Run completed successfully!"}}' \
            "https://api.getport.io/v1/actions/runs/$RUN_ID"
    ```

    </details>

</TabItem>

<TabItem value="bitbucket">

First, let's create the necessary tokens and secrets:
  - Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

  - Configure the following as Jenkins credentials:
    - `BITBUCKET_USERNAME` - a user with access to the Bitbucket workspace and project.
    - `BITBUCKET_APP_PASSWORD` - an [App Password](https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/) with the `Repositories:Read` and `Repositories:Write` permissions.
    - `PORT_CLIENT_ID` - Your Port client ID.
    - `PORT_CLIENT_SECRET` - Your Port client secret.
    <br/>
    <img src='/img/guides/bitbucketJenkinsCredentials.png' width='90%' border='1px' />

    <br/>

Next, create a Jenkins pipeline with the following configuration:
    - [Enable the webhook trigger for the pipeline](/actions-and-automations/setup-backend/jenkins-pipeline/jenkins-pipeline.md#enabling-webhook-trigger-for-a-pipeline).

    - Define the value of the [`token`](/actions-and-automations/setup-backend/jenkins-pipeline/jenkins-pipeline.md#token-setup) field, the token you specify will be used to trigger the scaffold pipeline specifically. For example, you can use `bucket-creator-token`.

    - [Define variables for the pipeline](/actions-and-automations/setup-backend/jenkins-pipeline/jenkins-pipeline.md#defining-variables): define the `SERVICE_NAME`, `BITBUCKET_WORKSPACE_NAME`, `BITBUCKET_PROJECT_KEY`, `BUCKET_NAME`, `VISIBILITY` and `RUN_ID` variables. Scroll down to the `Post content parameters` and **for each variable** add configuration like so (look at the table below for the full variable list):

     <img src='/img/guides/jenkinsGenericVariable.png' width='100%' border='1px' />

Create the following variables and their related JSONPath expression:

| Variable Name            | JSONPath Expression                             |
| ------------------------ | ----------------------------------------------- |
| SERVICE_NAME             | `$.port_context.entity`                         |
| BITBUCKET_WORKSPACE_NAME | `$.bitbucket_workspace_name`                    |
| RUN_ID                   | `$.port_context.runId`                          |
| BUCKET_NAME              | `$.name`                                        |
| VISIBILITY               | `$.visibility`                                  |
    

Add the following content to the new Jenkins pipeline:

  <details>
  <summary><b>Jenkins pipeline (click to expand)</b></summary>

  ```groovy showLineNumbers
  import groovy.json.JsonSlurper

  pipeline {
      agent any

      environment {
          REPO_NAME = "${SERVICE_NAME}"
          BITBUCKET_WORKSPACE_NAME = "${BITBUCKET_WORKSPACE_NAME}"
          PORT_ACCESS_TOKEN = ""
          PORT_BLUEPRINT_ID = "bitbucketRepository"
          PORT_RUN_ID = "${RUN_ID}"
          VISIBILITY="${VISIBILITY}"
          PR_URL=""
          SOURCE_REPO="port-actions" // UPDATE WITH YOUR SOURCE REPO NAME
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

          stage('Create Terraform resource Pull request') {
              steps {
                  script {
                      withCredentials([
                          string(credentialsId: 'BITBUCKET_USERNAME', variable: 'BITBUCKET_USERNAME'),
                          string(credentialsId: 'BITBUCKET_APP_PASSWORD', variable: 'BITBUCKET_APP_PASSWORD')
                      ]) {
                      // Set Git configuration
                      sh "git config --global user.email 'bucketCreator@email.com'"
                      sh "git config --global user.name 'Bucket Creator'"
                      sh "git config --global init.defaultBranch 'main'"

                      // Clone source repository
                      sh "git clone https://${BITBUCKET_USERNAME}:${BITBUCKET_APP_PASSWORD}@bitbucket.org/${BITBUCKET_WORKSPACE_NAME}/${SOURCE_REPO}.git sourceRepo"
                      // Clone source repository
                      sh "git clone https://${BITBUCKET_USERNAME}:${BITBUCKET_APP_PASSWORD}@bitbucket.org/${BITBUCKET_WORKSPACE_NAME}/${REPO_NAME}.git targetRepo"
                      

                      def logs_report_response = sh(script: """
                          curl -X POST \
                            -H "Content-Type: application/json" \
                            -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                            -d '{"message": "Creating a new S3 bucket Terraform resource file: ${REPO_NAME} in Workspace: ${BITBUCKET_WORKSPACE_NAME}"}' \
                              "https://api.getport.io/v1/actions/runs/${PORT_RUN_ID}/logs"
                      """, returnStdout: true)
                      
                      println(logs_report_response)
                  }}
                  script {
                      withCredentials([
                          string(credentialsId: 'BITBUCKET_USERNAME', variable: 'BITBUCKET_USERNAME'),
                          string(credentialsId: 'BITBUCKET_APP_PASSWORD', variable: 'BITBUCKET_APP_PASSWORD')
                      ]) {
                          sh """
                          bucket_name=${BUCKET_NAME}
                          visibility=${VISIBILITY}
                          echo 'Creating a new S3 bucket Terraform resource file'
                          mkdir -p targetRepo/resources/
                          cp sourceRepo/templates/cloudResource.tf targetRepo/resources/${BUCKET_NAME}.tf
                          sed -i 's/{{ bucket_name }}/${BUCKET_NAME}/' ./targetRepo/resources/${BUCKET_NAME}.tf
                          sed -i 's/{{ bucket_acl }}/${VISIBILITY}/' ./targetRepo/resources/${BUCKET_NAME}.tf
                          cd ./targetRepo
                          git add resources/${bucket_name}.tf
                          git commit -m "Added ${bucket_name} resource file"
                          git checkout -b new-bucket-branch-${bucket_name}
                          git push origin new-bucket-branch-${bucket_name}
                      """
                      def pr_response = sh(script:"""
                          curl -u ${BITBUCKET_USERNAME}:${BITBUCKET_APP_PASSWORD} --header 'Content-Type: application/json' \\
                              -d '{"title": "New Bucket request for ${BUCKET_NAME}", "source": {"branch": {"name": "new-bucket-branch-${BUCKET_NAME}"}}}' \\
                              https://api.bitbucket.org/2.0/repositories/${BITBUCKET_WORKSPACE_NAME}/${SERVICE_NAME}/pullrequests
                      """, returnStdout: true)
                      def jsonSlurper = new JsonSlurper()
                      def payloadJson = jsonSlurper.parseText(pr_response.trim())
                          
                      // Access the desired data from the payload
                      PR_URL = payloadJson.links.html.href
                      println("${PR_URL}")
                      }
                  }
              }
          } // end of Create Terraform resource Pull request stage


          stage('Update service entity') {
              steps {
                  script {
                      def logs_report_response = sh(script: """
                          curl -X POST \
                            -H "Content-Type: application/json" \
                            -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                            -d '{"message": "🚀 Updating the service with the new resource definition!"}' \
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
          "properties": {"resource_definitions":"https://bitbucket.org/${BITBUCKET_WORKSPACE_NAME}/${REPO_NAME}/src/main/resources/"},
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
                          curl -X POST \
                            -H "Content-Type: application/json" \
                            -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                            -d '{"message":"✅ PR Opened for bucket '"${BUCKET_NAME}"'!"}' \
                              "https://api.getport.io/v1/actions/runs/${PORT_RUN_ID}/logs"
                          curl -X PATCH \
                            -H "Content-Type: application/json" \
                            -H "Authorization: Bearer ${PORT_ACCESS_TOKEN}" \
                            -d '{"link":"${PR_URL}","status":"SUCCESS", "message": {"run_status": "Run completed successfully!"}}' \
                              "https://api.getport.io/v1/actions/runs/${PORT_RUN_ID}"
                          rm -rf ./sourceRepo ./targetRepo
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
                          -d '{"status":"FAILURE", "message": {"run_status": "Run failed!❌"}}' \
                              "https://api.getport.io/v1/actions/runs/${PORT_RUN_ID}"
                  """, returnStdout: true)
                  sh "rm -rf ./sourceRepo ./targetRepo"
                  println(status_report_response)
              }
          }

          // Clean after build
          always {
              cleanWs(cleanWhenNotBuilt: true,
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

</TabItem>

</Tabs>

<PortApiRegionTip/>

<br/>

We will now create a simple `.tf` file that will serve as a template for our new resource:

  - In your source repository (`port-actions` for example), create a file named `cloudResource.tf` under `/templates/` (it's path should be `/templates/cloudResource.tf`).
  - Copy the following snippet and paste it in the file's contents:

  <details>
  <summary><b>cloudResource.tf (click to expand)</b></summary>

  ```hcl showLineNumbers title="cloudResource.tf"
  resource "aws_s3_bucket" "example" {
  provider = aws.bucket_region
  name = "{{ bucket_name }}"
  acl = "{{ bucket_acl }}"
  }
  ```

  </details>
  

All done! The action is ready to be executed 🚀

<br/>

## Execute the action

After creating an action, it will appear under the `Self-service` tab of your Port application:

<img src='/img/guides/iacActionAfterCreation.png' width='30%' border='1px' />

1. Click `Execute`. On the top right corner of the page, click on the action button to view the action progress:

    <img src='/img/guides/executionDetailsS3Iac.png' width='45%' border="1px" />

    <br/><br/>

2. This page provides details about the action run. We can see that the backend returned `Success` and the pull-request was created successfully:

    <img src='/img/guides/iacActionRunAfterExecution.png' width='90%' />


### Access the bucket's definition from Port

You may have noticed that even though we updated the service's `Resource definitions` URL, it still leads to a non-existent page. This is because we do not have any resources in the repository yet, let's take care of that:

1. Merge the pull-request.
2. Go to the <PortTooltip id="entity">entity</PortTooltip> page of the service that you executed the action for:

    <img src='/img/guides/iacEntityAfterAction.png' width='50%' />

    <br/>

3. Click on the `Resource definitions` link to access the service's resources.

All done! You can now create resources for your services directly from Port 💪🏽

## Possible daily routine integrations

- Send a slack message to relevant people in the organization, notifying about the new resource.
- Send a weekly/monthly report for managers/devops showing the new resources created in this timeframe and their owners.

## Conclusion

Developer portals need to support and integrate with git-ops practices seamlessly. Developers should be able to perform routine tasks independently, without having to create bottlenecks within the organization.  
With Port, platform engineers can design precise and flexible self-service actions for their developers, while integrating with many different backends to suit your specific needs.

More relevant guides and examples:

- [Deploy AWS resources using AWS CloudFormation](https://docs.port.io/guides/all/deploy-cloudformation-template)
- [Create an S3 bucket using Self-Service Actions](https://docs.port.io/guides/all/s3-using-webhook)

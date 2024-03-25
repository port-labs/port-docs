---
sidebar_position: 1
title: Scaffold a new service
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Scaffold a new service

This guide takes 7 minutes to complete, and aims to demonstrate the power of self-service actions in Port.

:::tip Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart). We will use the `Service` blueprint that was created during the onboarding process.
- You will need a Git repository (Github, GitLab, or Bitbucket) in which you can place a workflow/pipeline that we will use in this guide. If you don't have one, we recommend creating a new repository named `Port-actions`.

:::

<br/>

### The goal of this guide

In this guide we will create an action that initializes a new Git repository. In reality, such an action can be used by developers to scaffold new services.

After completing it, you will get a sense of how it can benefit different personas in your organization:

- Developers will be able to scaffold new services easily.
- R&D managers will be able to get an overview of new services - how many were created and by who.
- Platform engineers will be able to control permissions to ensure only the relevant people can create new services.

<br/>

### Setup the action's frontend

:::tip Onboarding

As part of the onboarding process, you should already have an action named `Scaffold a new service` in your [self-service tab](https://app.getport.io/self-serve).  
In that case, you can hover over the action, click the `...` button in the top right corner, and choose "Edit":

<img src='/img/guides/editActionBackend.png' width='45%' />

Then, skip to the [Define backend type](#define-backend-type) step.

If you **skipped** the onboarding, or you want to create the action from scratch, complete the `Create the action's frontend` steps below.

:::

<details>
<summary><b>Create the action's frontend</b></summary>

<Tabs groupId="git-provider" queryString defaultValue="github" values={[
{label: "GitHub", value: "github"},
{label: "GitLab", value: "gitlab"},
{label: "Bitbucket (Jenkins)", value: "bitbucket"}
]}>

<TabItem value="github">

1. Click on `New action`:

<img src='/img/guides/actionsCreateNew.png' width='50%' />

2. Each action in Port is directly tied to a <PortTooltip id="blueprint">blueprint</PortTooltip>. Since we are creating a repository, let's use the `Service` blueprint that was created for us as part of the [onboarding](/quickstart) process. Choose it from the dropdown.

3. Fill in the basic details of the action like this, then click `Next`:

<img src='/img/guides/actionScaffoldBasicDetails.png' width='60%' />

4. The next step is to define the action's inputs. When someone uses this action, all we want them to enter is the new repository's name. Click on `New input`, fill in the form like this, then click on `Create`:

<img src='/img/guides/actionScaffoldInputName.png' width='50%' />

</TabItem>

<TabItem value="gitlab">

1. Click on `New action`:

<img src='/img/guides/actionsCreateNew.png' width='50%' />

2. Each action in Port is directly tied to a <PortTooltip id="blueprint">blueprint</PortTooltip>. Since we are creating a repository, let's use the `Service` blueprint that was created for us as part of the [onboarding](/quickstart) process. Choose it from the dropdown.

3. Fill in the basic details of the action like this, then click `Next`:

<img src='/img/guides/actionScaffoldBasicDetails.png' width='60%' />

4. The next step is to define the action's inputs. When someone uses this action, all we want them to enter is the new repository's name. Click on `New input`, fill in the form like this, then click on `Create`:

<img src='/img/guides/actionScaffoldInputName.png' width='50%' />

</TabItem>

<TabItem value="bitbucket">

1. Click on `New action`:

<img src='/img/guides/actionsCreateNew.png' width='50%' />

2. Each action in Port is directly tied to a <PortTooltip id="blueprint">blueprint</PortTooltip>. Since we are creating a repository, let's use the `Service` blueprint that was created for us as part of the [onboarding](/quickstart) process. Choose it from the dropdown.

3. Fill in the basic details of the action like this, then click `Next`:

<img src='/img/guides/actionScaffoldBasicDetails.png' width='60%' />

4. The next step is to define the action's inputs. When someone uses this action, all we want them to enter is the new repository's name. Click on `New input`, fill in the form like this, then click on `Create`:

<img src='/img/guides/actionScaffoldInputName.png' width='50%' />

5. The action requires two more inputs, so click on `New input` again and fill the form out like this:

<img src='/img/guides/bitbucketWorkspaceActionInputConfig.png' width='50%' />

<img src='/img/guides/bitbucketProjectKeyActionInputConfig.png' width='50%' />

</TabItem>

</Tabs>



:::info notes

- We set the `Required` field to `true` to ensure that a name is always provided when using this action.
- We set the type to `Text` since this is a name, but note all of the different types of input that Port allows.
- When using `Text` inputs, you can set constraints and limitations to enforce certain patterns.

:::

</details>

<br/>

#### Define backend type

Now we'll define the backend of the action. Port supports multiple invocation types, one of them should be selected for you depending on the Git provider you selected in the beginning of the onboarding process.

<Tabs groupId="git-provider" queryString defaultValue="github" values={[
{label: "GitHub", value: "github"},
{label: "GitLab", value: "gitlab"},
{label: "Bitbucket (Jenkins)", value: "bitbucket"}
]}>

<TabItem value="github">

Fill out the form with your values:
- Replace the `Organization` and `Repository` values with your values (this is where the workflow will reside and run).
- Name the workflow `port-create-repo.yml`.
- Set `Omit user inputs` to `Yes`.
- Fill out the rest of the form like this, then click `Next`:

:::tip Important

In our workflow, the cookiecutter uses the payload for the inputs. We omit the user inputs in order to avoid sending additional inputs to the workflow.

:::

<img src='/img/guides/scaffoldBackend.png' width='75%' />

</TabItem>

<TabItem value="gitlab">

:::tip
You will need a few parameters for this part that are generated in the [setup the action's backend](#setup-the-actions-backend) section, it is recommended to complete the steps there and then follow the instructions here with all of the required information in hand.
:::

Fill out the form with your values:
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

<img src='/img/guides/gitlabActionBackendForm.png' width='75%' />

</TabItem>

<TabItem value="bitbucket">

:::tip
You will need a few parameters for this part that are generated in the [setup the action's backend](#setup-the-actions-backend) section, it is recommended to complete the steps there and then follow the instructions here with all of the required information in hand.
:::

Fill out the form with your values:
- For the `Endpoint URL` you need to add a URL in the following format:
  ```text showLineNumbers
  https://{JENKINS_URL}/generic-webhook-trigger/invoke?token={JOB_TOKEN}
  ```
    - The value for `{JENKINS_URL}` is the URL of your Jenkins server.
    - The value for `{JOB_TOKEN}` is the unique token used to trigger the pipeline you create in the [setup the action's backend](#setup-the-actions-backend) section.
- Set `HTTP method` to `POST`.
- Set `Request type` to `Async`.
- Set `Use self-hosted agent` to `No`.

<img src='/img/guides/bitbucketActionBackendForm.png' width='75%' />

</TabItem>

</Tabs>

The last step is customizing the action's permissions. For simplicity's sake, we will use the default settings. For more information, see the [permissions](/create-self-service-experiences/set-self-service-actions-rbac/) page. Click `Create`.

The action's frontend is now ready 🥳

<br/>

### Setup the action's backend

Now we want to write the logic that our action will trigger.

<Tabs groupId="git-provider" queryString defaultValue="github" values={[
{label: "GitHub", value: "github"},
{label: "GitLab", value: "gitlab"},
{label: "Bitbucket (Jenkins)", value: "bitbucket"}
]}>

<TabItem value="github">

:::info Important
If the Github organization which will house your workflow is not the same as the one you'll create the new repository in, install Port's [Github app](https://github.com/apps/getport-io) in the other organization as well.
:::

1. First, let's create the necessary token and secrets:

- Go to your [Github tokens page](https://github.com/settings/tokens), create a personal access token (classic) with `repo`, `admin:repo_hook` and `admin:org` scope, and copy it (this token is needed to create a repo from our workflow).

  <img src='/img/guides/personalAccessToken.png' width='80%' />

:::info SAML SSO
If your organization uses SAML SSO, you will need to authorize your token. Follow [these instructions](https://docs.github.com/en/enterprise-cloud@latest/authentication/authenticating-with-saml-single-sign-on/authorizing-a-personal-access-token-for-use-with-saml-single-sign-on) and then continue this guide.
:::

- Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

2. In the repository where your workflow will reside, create 3 new secrets under `Settings->Secrets and variables->Actions`:

- `ORG_ADMIN_TOKEN` - the personal access token you created in the previous step.
- `PORT_CLIENT_ID` - the client ID you copied from your Port app.
- `PORT_CLIENT_SECRET` - the client secret you copied from your Port app.

<img src='/img/guides/repositorySecret.png' width='50%' />

<br/><br/>

3. Now let's create the workflow file that contains our logic. Under `.github/workflows`, create a new file named `port-create-repo.yml` and use the following snippet as its content (remember to change `<YOUR-ORG-NAME>` on line 19 to your GitHub organization name):

<details>
<summary><b>Github workflow (click to expand)</b></summary>

```yaml showLineNumbers title="port-create-repo.yml"
name: Scaffold a new service
on:
  workflow_dispatch:
    inputs:
      port_payload:
        required: true
        description: "Port's payload, including details for who triggered the action and general context (blueprint, run id, etc...)"
        type: string
    secrets:
      ORG_ADMIN_TOKEN:
        required: true
      PORT_CLIENT_ID:
        required: true
      PORT_CLIENT_SECRET:
        required: true
jobs:
  scaffold-service:
    env:
# highlight-next-line
      ORG_NAME: <YOUR-ORG-NAME>
    runs-on: ubuntu-latest
    steps:
      - uses: port-labs/cookiecutter-gha@v1.1.1
        id: scaff
        with:
          portClientId: ${{ secrets.PORT_CLIENT_ID }}
          portClientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          token: ${{ secrets.ORG_ADMIN_TOKEN }}
          portRunId: ${{ fromJson(inputs.port_payload).context.runId }}
          repositoryName: ${{ fromJson(inputs.port_payload).payload.properties.service_name }}
          portUserInputs: '{"cookiecutter_app_name": "${{ fromJson(inputs.port_payload).payload.properties.service_name }}" }'
          cookiecutterTemplate: https://github.com/lacion/cookiecutter-golang
          blueprintIdentifier: "service"
          organizationName: ${{ env.ORG_NAME }}
```

</details>

:::tip
This workflow uses Port's [cookiecutter Github action](https://github.com/port-labs/cookiecutter-gha) to scaffold the new repository.
:::

</TabItem> 

<TabItem value="gitlab">

1. First, let's create a GitLab project that will store our new scaffolder pipeline - Go to your GitLab account and create a new project.

2. Next, let's create the necessary token and secrets:

- Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.
- Go to your [root group](https://gitlab.com/dashboard/groups), and follow the steps [here](https://docs.gitlab.com/ee/user/group/settings/group_access_tokens.html#create-a-group-access-token-using-ui) to create a new group access token with the following permission scopes: `api, read_api, read_repository, write_repository`, then save its value as it will be required in the next step.
  <img src='/img/guides/gitlabGroupAccessTokenPerms.png' width='80%' />
- Go to the new GitLab project you created in step 1, from the `Settings` menu at the sidebar on the left, select `CI/CD`.
- Expand the `Variables` section and save the following secrets:
  - `PORT_CLIENT_ID` - Your Port client ID.
  - `PORT_CLIENT_SECRET` - Your Port client secret.
  - `GITLAB_ACCESS_TOKEN` - The GitLab group access token you created in the previous step.
  <br/>
  <img src='/img/guides/gitlabPipelineVariables.png' width='80%' />
- Expand the `Pipeline trigger tokens` section and add a new token, give it a meaningful description such as `Scaffolder token` and save its value
  - This is the `{GITLAB_TRIGGER_TOKEN}` that you need for the [define backend type](#define-backend-type) section.

<br/>

  <img src='/img/guides/gitlabPipelineTriggerToken.png' width='80%' />

<br/><br/>

:::tip
Now that you have both the new GitLab project and its respective trigger token, you can go to the [define backend type](#define-backend-type) section and complete the action configuration in Port.
:::

3. Now let's create the pipeline file that contains our logic. In the new GitLab project you created at step 1, at the root of the project, create a new file named `.gitlab-ci.yml` and use the following snippet as its content:

<details>
<summary><b>GitLab pipeline (click to expand)</b></summary>

```yaml showLineNumbers title=".gitlab-ci.yml"
image: python:3.10.0-alpine

variables:
  # This is an example, you can replace it with any other cookiecutter template
  COOKIECUTTER_TEMPLATE_URL: "https://gitlab.com/AdriaanRol/cookiecutter-pypackage-gitlab"

stages: # List of stages for jobs, and their order of execution
  - fetch-port-access-token
  - scaffold
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
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')
      echo "RUN_ID=$runId" >> data.env
      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"message":"🏃‍♂️ Starting new GitLab project scaffold"}' \
        "https://api.getport.io/v1/actions/runs/$runId/logs"
      curl -X PATCH \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"link":"'"$CI_PIPELINE_URL"'"}' \
        "https://api.getport.io/v1/actions/runs/$runId"
  artifacts:
    reports:
      dotenv: data.env

scaffold:
  before_script: |
    apk update
    apk add jq curl git -q
    pip3 install cookiecutter==2.3.0 -q
  stage: scaffold
  except:
    - pushes
  script:
    - |
      echo "Creating new GitLab repository"
      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"message":"⚙️ Creating new GitLab repository"}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"

      service_name=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.service_name')
      CREATE_REPO_RESPONSE=$(curl -X POST -s "$CI_API_V4_URL/projects" --header "Private-Token: $GITLAB_ACCESS_TOKEN" --form "name=$service_name" --form "namespace_id=$CI_PROJECT_NAMESPACE_ID")
      PROJECT_URL=$(echo $CREATE_REPO_RESPONSE | jq -r .http_url_to_repo)

      echo "Checking if the repository creation was successful"
      if [[ -z "$PROJECT_URL" ]]; then
          echo "Failed to create GitLab repository."
          exit 1
      fi
      echo "Repository created"
      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"message":"✅ Repository created"}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"

      FIRST_NAME=$(cat $TRIGGER_PAYLOAD | jq -r '.trigger.by.user.firstName')
      LAST_NAME=$(cat $TRIGGER_PAYLOAD | jq -r '.trigger.by.user.lastName')
      EMAIL=$(cat $TRIGGER_PAYLOAD | jq -r '.trigger.by.user.email')
      BLUEPRINT_ID=$(cat $TRIGGER_PAYLOAD | jq -r '.context.blueprint')

      echo "PROJECT_URL=$PROJECT_URL" >> data.env
      echo "BLUEPRINT_ID=$BLUEPRINT_ID" >> data.env
      echo "SERVICE_NAME=$service_name" >> data.env

      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"message":"🏗️ Generating new project template from Cookiecutter"}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"

      # Generate cookiecutter.yaml file
      cat <<EOF > cookiecutter.yaml
      default_context:
        full_name: "${FIRST_NAME} ${LAST_NAME}"
        email: "${EMAIL}"
        project_short_description: "Project scaffolded by Port"
        gitlab_username: "${gitlab_username}"
        project_name: "${service_name}"
      EOF
      cookiecutter $COOKIECUTTER_TEMPLATE_URL --no-input --config-file cookiecutter.yaml --output-dir scaffold_out

      echo "Initializing new repository..."
      git config --global user.email "scaffolder@email.com"
      git config --global user.name "Mighty Scaffolder"
      git config --global init.defaultBranch "main"

      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"message":"📡 Uploading repository template"}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"

      modified_service_name=$(echo "$service_name" | sed 's/[[:space:]-]/_/g')
      cd scaffold_out/$modified_service_name
      git init
      git add .
      git commit -m "Initial commit"
      GITLAB_HOSTNAME=$(echo "$CI_API_V4_URL" | cut -d'/' -f3)
      git remote add origin https://:$GITLAB_ACCESS_TOKEN@$GITLAB_HOSTNAME/${CI_PROJECT_NAMESPACE}/${service_name}.git
      git push -u origin main

      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"message":"👍 Repository updated"}' \
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
      echo "Creating Port entity to match new repository"
      curl -X POST \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $ACCESS_TOKEN" \
          -d '{"message":"🚀 Creating new '"$BLUEPRINT_ID"' entity: '"$SERVICE_NAME"'"}' \
          "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"
      curl --location --request POST "https://api.getport.io/v1/blueprints/$BLUEPRINT_ID/entities?upsert=true&run_id=$RUN_ID&create_missing_related_entities=true" \
        --header "Authorization: Bearer $ACCESS_TOKEN" \
        --header "Content-Type: application/json" \
        -d '{"identifier": "'"$SERVICE_NAME"'","title": "'"$SERVICE_NAME"'","properties": {"url": "'"$PROJECT_URL"'"}, "relations": {}}'

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
        -d '{"message":"✅ Scaffold '"$SERVICE_NAME"' finished successfully!"}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"
      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"message":"🔗 Project URL: '"$PROJECT_URL"'"}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID/logs"
      curl -X PATCH \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"status":"SUCCESS", "message": {"run_status": "Scaffold '"$SERVICE_NAME"' finished successfully! Project URL: '"$PROJECT_URL"'"}}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID"
```

</details>
</TabItem>

<TabItem value="bitbucket">

1. First, install the [generic webhook trigger](https://plugins.jenkins.io/generic-webhook-trigger/) plugin in your Jenkins.
2. Next, let's create the necessary tokens and secrets
   - Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.
   - Configure the following as Jenkins credentials:
     - `BITBUCKET_USERNAME` - a user with access to the Bitbucket workspace and project.
     - `BITBUCKET_APP_PASSWORD` - an [App Password](https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/) with the `Repositories:Read` and `Repositories:Write` permissions permissions.
     - `PORT_CLIENT_ID` - Your Port client ID.
     - `PORT_CLIENT_SECRET` - Your Port client secret.
     <br/>
     <img src='/img/guides/bitbucketJenkinsCredentials.png' width='80%' />

<br/>

1. Create a Jenkins pipeline with the following configuration:
   - [Enable the webhook trigger for the pipeline](/create-self-service-experiences/setup-backend/jenkins-pipeline/jenkins-pipeline.md#enabling-webhook-trigger-for-a-pipeline)
   - Define the value of the [`token`](/create-self-service-experiences/setup-backend/jenkins-pipeline/jenkins-pipeline.md#token-setup) field, the token you specify will be used to trigger the scaffold pipeline specifically. For example, you can use `scaffolder-token`.
   - [Define variables for the pipeline](/create-self-service-experiences/setup-backend/jenkins-pipeline/jenkins-pipeline.md#defining-variables): define the `SERVICE_NAME`, `BITBUCKET_WORKSPACE_NAME`, `BITBUCKET_PROJECT_KEY`, and `RUN_ID` variables. Scroll down to the `Post content parameters` and **for each variable** add configuration like so (look at the table bellow for the full variable list):

   <img src='/img/guides/jenkinsGenericVariable.png' width='100%' />

    Create the following varaibles and their related JSONPath expression:

    | Variable Name            | JSONPath Expression                             |
    | ------------------------ | ----------------------------------------------- |
    | SERVICE_NAME             | `$.payload.properties.service_name`             |
    | BITBUCKET_WORKSPACE_NAME | `$.payload.properties.bitbucket_workspace_name` |
    | BITBUCKET_PROJECT_KEY    | `$.payload.properties.bitbucket_project_key`    |
    | RUN_ID                   | `$.context.runId`                               |


:::tip
Now that you have the `JOB_TOKEN` value, you can go to the [define backend type](#define-backend-type) section and complete the action configuration in Port.
:::

4. Add the following content to the new Jenkins pipeline:

<details>
<summary><b>Jenkins pipeline (click to expand)</b></summary>

```groovy showLineNumbers
import groovy.json.JsonSlurper

pipeline {
    agent any

    environment {
        COOKIECUTTER_TEMPLATE = 'https://github.com/lacion/cookiecutter-golang'
        SERVICE_NAME = "${SERVICE_NAME}"
        BITBUCKET_WORKSPACE_NAME = "${BITBUCKET_WORKSPACE_NAME}"
        BITBUCKET_PROJECT_KEY = "${BITBUCKET_PROJECT_KEY}"
        SCAFFOLD_DIR = "scaffold_${SERVICE_NAME}"
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
                          -d '{"message": "Creating BitBucket repository: ${SERVICE_NAME} in Workspace: ${BITBUCKET_WORKSPACE_NAME}, Project: ${BITBUCKET_PROJECT_KEY}..."}' \
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
                            https://api.bitbucket.org/2.0/repositories/${BITBUCKET_WORKSPACE_NAME}/${SERVICE_NAME}
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
                          -d '{"message": "Scaffolding ${SERVICE_NAME}..."}' \
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
  app_name: "${SERVICE_NAME}"
  project_short_description": "A Golang project."
  docker_hub_username: "dockerhubuser"
  docker_image: "dockerhubuser/alpine-base-image:latest"
  docker_build_image: "dockerhubuser/alpine-golang-buildimage"
"""
                    // Write the YAML content to a file
                    writeFile(file: 'cookiecutter.yaml', text: yamlContent)

                        sh("""
                            rm -rf ${SCAFFOLD_DIR} ${SERVICE_NAME}
                            git clone https://${BITBUCKET_USERNAME}:${BITBUCKET_APP_PASSWORD}@bitbucket.org/${BITBUCKET_WORKSPACE_NAME}/${SERVICE_NAME}.git

                            cookiecutter ${COOKIECUTTER_TEMPLATE} --output-dir ${SCAFFOLD_DIR} --no-input --config-file cookiecutter.yaml -f

                            rm -rf ${SCAFFOLD_DIR}/${SERVICE_NAME}/.git*
                            cp -r ${SCAFFOLD_DIR}/${SERVICE_NAME}/* "${SERVICE_NAME}/"

                            cd ${SERVICE_NAME}
                            git config user.name "Jenkins Pipeline Bot"
                            git config user.email "jenkins-pipeline[bot]@users.noreply.jenkins.com"
                            git add .
                            git commit -m "Scaffolded project ${SERVICE_NAME}"
                            git push -u origin master
                            cd ..

                            rm -rf ${SCAFFOLD_DIR} ${SERVICE_NAME}
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
                          -d '{"message": "Creating ${SERVICE_NAME} Microservice Port entity..."}' \
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
				"identifier": "${SERVICE_NAME}",
				"title": "${SERVICE_NAME}",
				"properties": {"description":"${SERVICE_NAME} golang project","url":"https://bitbucket.org/${BITBUCKET_WORKSPACE_NAME}/${SERVICE_NAME}/src"},
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
                        -d '{"status":"FAILURE", "message": {"run_status": "Failed to Scaffold ${SERVICE_NAME}"}}' \
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
</TabItem>

</Tabs>

:::info Cookiecutter template
The cookiecutter templates provided in the workflows are just examples, you can replace them with any other cookiecutter template you want to use, by changing the value of the relevant template variable in the workflow.
:::

All done! The action is ready to be used 🚀

<br/>

### Execute the action

After creating an action, it will appear under the `Self-service` tab of your Port application:

<img src='/img/guides/selfServiceAfterScaffoldCreation.png' width='75%' />

1. Click on `Create` to begin executing the action.

2. Enter a name for your new repository, then click `Execute`. A small popup will appear, click on `View details`:

<img src='/img/guides/executionDetails.png' width='45%' />

<br/><br/>

:::tip Trigger bitbucket scaffolder

To trigger the Bitbucket scaffolder, you will need to provide two additional parameters:
- Bitbucket Workspace Name - the name of the workspace to create the new repository in
- Bitbucket Project Key - the key of the Bitbucket project to create the new repository in.
  - To find the Bitbucket project key, go to `https://bitbucket.org/YOUR_BITBUCKET_WORKSPACE/workspace/projects/`, find the desired project in the list, and copy the value seen in the `Key` column in the table
:::

1. This page provides details about the action run. As you can see, the backend returned `Success` and the repo was successfully created (this can take a few moments):

<img src='/img/guides/runStatusScaffolding.png' width='90%' />

<br/><br/>

:::tip Logging action progress
💡 Note the `Log stream` at the bottom, this can be used to report progress, results and errors. Click [here](/create-self-service-experiences/reflect-action-progress/reflect-action-progress.md) to learn more.
:::

Congratulations! You can now create services easily from Port 💪🏽

### Possible daily routine integrations

- Send a slack message in the R&D channel to let everyone know that a new service was created.
- Send a weekly/monthly report for managers showing all the new services created in this timeframe and their owners.

### Conclusion

Creating a service is not just a periodic task developers undertake, but a vital step that can occur on a monthly basis. However, it's crucial to recognize that this is only a fragment of the broader experience that we're striving to create for developers.
Our ultimate goal is to facilitate a seamless transition from ideation to production. In doing so, we aim to eliminate the need for developers to navigate through a plethora of tools, reducing friction and accelerating the time-to-production.  
In essence, we're not just building a tool, but sculpting an ecosystem that empowers developers to bring new features to life with utmost efficiency.


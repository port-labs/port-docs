---
sidebar_position: 5
title: Let developers enrich services using Gitops
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import FindCredentials from "/docs/build-your-software-catalog/custom-integration/api/\_template_docs/\_find_credentials_collapsed.mdx";

# Let developers enrich services using Gitops

This guide takes 10 minutes to complete, and aims to demonstrate Port's flexibility when working with Gitops.

:::tip Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart). We will use the `Service` blueprint that was created during the onboarding process.
- You will need a Git repository (Github, GitLab, or Bitbucket) in which you can place a workflow/pipeline that we will use in this guide. If you don't have one, we recommend creating a new repository named `Port-actions`.

:::

<br/>

### The goal of this guide

In this guide we will enrich a service in Port using Gitops. In reality, this can be used by developers to independently add additional valuable data about their services to Port.

After completing it, you will get a sense of how it can benefit different personas in your organization:

- Developers will be able to enrich their services without needing to nag devops engineers.
- Platform engineers will be able to create RBAC-controlled actions for developers, empowering their independence.
- R&D managers will be able to track additional, valuable data about services in the organization.

<br/>

### Add new properties to your `Service` blueprint

Let's start by adding two new properties to the `Service` <PortTooltip id="blueprint">blueprint</PortTooltip>, that we will later populate using Gitops.

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model), expand the `Service` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New property`.

2. The first property will be the service's type, chosen from a predefined list of options. Fill out the form like this, then click `Create`:

<img src='/img/guides/gitopsServicePropType.png' width='50%' />

<br/><br/>

3. The second property will be the lifecycle state of the service, also chosen from a predefined list of options. Fill out the form like this, then click `Create`:

_Note the colors of the inputs, this will make it easier to see a service's lifecycle in your catalog_ 😎

<img src='/img/guides/gitopsServicePropLifecycle.png' width='50%' />

<br/><br/>

### Model domains for your services

Services that share a business purpose (e.g. payments, shipping) are often grouped together using domains. Let's create a <PortTooltip id="blueprint">blueprint</PortTooltip> to represent a domain in Port:

1. In your [Builder](https://app.getport.io/dev-portal/data-model), click on the `Add` button in the top right corner, then choose `Custom blueprint`:

<img src='/img/quickstart/builderAddCustomBlueprint.png' width='30%' />

<br/><br/>

2. Click on the `Edit JSON` button in the top right corner, replace the content with the following definition, then click `Create`:

<details>
<summary><b>Blueprint JSON (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "domain",
  "title": "Domain",
  "icon": "TwoUsers",
  "schema": {
    "properties": {
      "architecture": {
        "title": "Architecture",
        "type": "string",
        "format": "url",
        "spec": "embedded-url"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

<br/>

### Connect your services to their domains

Now that we have a <PortTooltip id="blueprint">blueprint</PortTooltip> to represent a domain, let's connect it to our services. We will do this by adding a relation to the `Service` blueprint:

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model), expand the `Service` blueprint, and click on `New relation`:

<img src='/img/guides/serviceCreateRelation.png' width='30%' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/gitopsDomainRelationForm.png' width='50%' />

<br/><br/>

### Create domains via Gitops

Now that we have a `Domain` <PortTooltip id="blueprint">blueprint</PortTooltip>, we can create some domains in Port. This can be done manually from the UI, or via Gitops which is the method we will use in this guide.

1. In your `Port-actions` (or equivalent) Github repository, create a new file named `port.yml` in the root directory, and use the following snippet as its content:

<details>
<summary><b>port.yml (click to expand)</b></summary>

```yaml showLineNumbers
- identifier: payment
  title: Payment
  blueprint: domain
  properties:
    architecture: https://lucid.app/documents/embedded/c3d64493-a5fe-4b18-98d5-66d355080de3
- identifier: shipping
  title: Shipping
  blueprint: domain
  properties:
    architecture: https://lucid.app/documents/embedded/c3d64493-a5fe-4b18-98d5-66d355080de3
```

</details>

<br/>

2. Head back to your [software catalog](https://app.getport.io/domains), you will see that Port has created two new `domain` <PortTooltip id="entity">entities</PortTooltip>:

<img src='/img/guides/gitopsDomainEntities.png' width='50%' />

The `architecture` property is a URL to a Lucidchart diagram. This is a handy way to track a domain's architecture in your software catalog.

<br/>

### Create an action to enrich services

As platform engineers, we want to enable our developers to perform certain actions on their own. Let's create an action that developers can use to add data to a service, and allocate it to a domain.

#### Setup the action's frontend

:::tip Onboarding

As part of the onboarding process, you should already have an action named `Enrich service` in your [self-service tab](https://app.getport.io/self-serve). In that case, you can skip to the [Define backend type](#define-backend-type) step.  

If you **skipped** the onboarding, or you want to create the action from scratch, complete steps 1-5 below.

:::

<details>
<summary><b>Create the action's frontend (steps 1-5)</b></summary>

1. Go to your [Self-service page](https://app.getport.io/self-serve), then click on the `+ New action` button in the top right corner.

2. From the dropdown, choose the `Service` <PortTooltip id="blueprint">blueprint</PortTooltip>.

3. Fill out the basic details like this, then click `Next`:

<img src='/img/guides/gitopsActionBasicDetails.png' width='50%' />

<br/><br/>

4. We want our developers to be able to choose the domain to which the service will be assigned. Click on `New input`, fill out the form like this, then click `Next`:

<img src='/img/guides/gitopsActionInputDomain.png' width='50%' />

<br/><br/>

5. Let's add two more inputs for our new service properties - `type` and `lifecycle`. Create two new inputs, fill out their forms like this, then click `Next`:

<img src='/img/guides/gitopsActionInputType.png' width='50%' />

<br/>

<img src='/img/guides/gitopsActionInputLifecycle.png' width='50%' />

<br/><br/>

</details>

#### Define backend type

Now we'll define the backend of the action. Port supports multiple invocation types, for this tutorial we will use a `Github workflow`, a `GitLab pipeline`, or a `Jenkins pipeline`(choose this option if you are using Bitbucket).

<Tabs groupId="git-provider" queryString values={[
{label: "Github", value: "github"},
{label: "GitLab", value: "gitlab"},
{label: "Bitbucket (Jenkins)", value: "bitbucket"},
]}>

<TabItem value="github">

  - You will need to have [Port's Github app](https://github.com/apps/getport-io) installed in your Github organization (the one that contains the repository you'll work with).
  - Replace the `Organization` and `Repository` values with your values (this is where the workflow will reside and run).
  - Name the workflow `port-enrich-service.yml`.
  - Fill out the rest of the form like this, then click `Next`:

<img src='/img/guides/gitopsActionBackendForm.png' width='75%' />

</TabItem>

<TabItem value="gitlab">

   - Choose `Trigger Webhook URL` as the invocation type. 
   
   - The endpoint URL should look like this:  
   `https://gitlab.com/api/v4/projects/<PROJECT_ID>/ref/main/trigger/pipeline?token=<TRIGGER_TOKEN>`.  
   We will create the `PROJECT_ID` and `TRIGGER_TOKEN` in the next section and come back to update the URL.
   
   - Fill out the rest of the form like this, then click `Next`:

<img src='/img/guides/gitLabWebhookSetup.png' width='70%' />

:::info Webhook protection

The webhook URL can be triggered by anyone with access to it.  
In order to protect the webhook, see the [Validating webhook signatures page](../create-self-service-experiences/setup-backend/webhook/signature-verification.md).

:::

</TabItem>

<TabItem value="bitbucket">

    - You will need to have [Port's Bitbucket app](https://marketplace.atlassian.com/apps/1229886/port-connector-for-bitbucket?hosting=cloud&tab=overview) installed in your Bitbucket workspace (the one that contains the repository you'll work with).
    - Choose `Run Jenkins pipeline` as the invocation type.
    - The webhook URL should look like this:  
    `http://<JENKINS_URL>/generic-webhook-trigger/invoke?token=enrichService`  
      - Replace `JENKINS_URL` with your configured Jenkins URL.
      - We will use `enrichService` as `JOB_TOKEN`, we will set this token in Jenkins in the next section.

<img src='/img/guides/jenkinsWebhookSetup.png' width='75%' />

</TabItem>

</Tabs>

The last step is customizing the action's permissions. For simplicity's sake, we will use the default settings. For more information, see the [permissions](/create-self-service-experiences/set-self-service-actions-rbac/) page. Click `Create`.

#### Setup the action's backend

Our action will create a pull-request in the service's repository, containing a `port.yml` file that will add data to the service in Port. Choose a backend type below to setup the workflow:

<Tabs groupId="git-provider" queryString values={[
{label: "Github", value: "github"},
{label: "GitLab", value: "gitlab"},
{label: "Bitbucket (Jenkins)", value: "bitbucket"},
]}>

<TabItem value="github">

1. First, let's create the necessary token and secrets. If you've already completed the [`scaffold a new service guide`](/guides-and-tutorials/scaffold-a-new-service), you should already have these configured and you can skip this step.

- Go to your [Github tokens page](https://github.com/settings/tokens), create a personal access token with `repo` and `admin:org` scope, and copy it (this token is needed to create a pull-request from our workflow).

  <img src='/img/guides/personalAccessToken.png' width='80%' />

- Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

2. In your `Port-actions` (or equivalent) Github repository, create 3 new secrets under `Settings->Secrets and variables->Actions`:

- `ORG_ADMIN_TOKEN` - the personal access token you created in the previous step.
- `PORT_CLIENT_ID` - the client ID you copied from your Port app.
- `PORT_CLIENT_SECRET` - the client secret you copied from your Port app.

<img src='/img/guides/repositorySecret.png' width='60%' />

</TabItem>

<TabItem value="gitlab">

1. Under your [root group](https://gitlab.com/dashboard/groups), access `Settings->Access Tokens`, and create a `Maintainer` role token with the `api`, `read_repository`, and `write_repository` scopes. Copy the token's value.

2. Create a new project named `Port-pipelines`. Copy its GitLab project ID and replace the `(PROJECT_ID)` in the webhook URL . Then, under Settings->CI/CD, create a new Pipeline trigger token and use it to replace `(TRIGGER_TOKEN)` in the webhook URL.

3. In the same menu (CI/CD), add the following variables to the pipeline:

- PORT_CLIENT_ID
- PORT_CLIENT_SECRET  
  :::tip
  To find your Port credentials, go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`.
  :::
- GITLAB_ACCESS_TOKEN - the token created in step 1.

<img src='/img/guides/gitlabVariables.png' width='80%' />

</TabItem>

<TabItem value="bitbucket">

1. Create a Bitbucket [app password](https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/) with `Pull requests:write` permissions, and copy its value.

2. Create the following [Jenkins credentials](https://www.jenkins.io/doc/book/using/using-credentials/#configuring-credentials
) in your Jenkins instance:

  - A `username with password` credential named `BITBUCKET_CREDENTIALS` with your Bitbucket username as the username, and the `app password` you created in the previous step as the password.
  <FindCredentials />
  - A `secret text` credential named `PORT_CLIENT_ID` with your Port client ID as the secret.
  - A `secret text` credential named `PORT_CLIENT_SECRET` with your Port client secret as the secret.

3. Create a Jenkins Pipeline with the following configuration:

  - [Enable webhook trigger](https://docs.getport.io/create-self-service-experiences/setup-backend/jenkins-pipeline/#enabling-webhook-trigger-for-a-pipeline) for the pipeline.
  - [Define post-content variables](https://docs.getport.io/create-self-service-experiences/setup-backend/jenkins-pipeline/#defining-variables) for the pipeline with the following names and values:
    
    | Name | Value |
    | --- | --- |
    | LIFECYCLE | $.payload.properties.lifecycle |
    | TYPE | $.payload.properties.type |
    | DOMAIN | $.payload.properties.domain |
    | ENTITY_IDENTIFIER | $.payload.entity.identifier |
    | REPO_URL | $.payload.entity.properties.url |
    | RUN_ID | $.context.runId |

  - Set `enrichService` as the pipeline's token.

</TabItem>

</Tabs>

---

We will now create a YML file that will serve as a template for our services' `port.yml` configuration file.

- In your repository, create a file named `enrichService.yml` under `/templates/` (its path should be `/templates/enrichService.yml`).
- Copy the following snippet and paste it in the file's contents:

<details>
<summary><b>enrichService.yml (click to expand)</b></summary>

```yaml showLineNumbers
# enrichService.yml

- identifier: "{{ service_identifier }}"
  blueprint: service
  properties:
    type: "{{ service_type }}"
    lifecycle: "{{ service_lifecycle }}"
  relations:
    domain: "{{ domain_identifier }}"
```

</details>

---

Now let's create the file that contains our logic:

<Tabs groupId="git-provider" queryString values={[
{label: "Github", value: "github"},
{label: "GitLab", value: "gitlab"},
{label: "Bitbucket (Jenkins)", value: "bitbucket"},
]}>

<TabItem value="github">

In the same repository, under `.github/workflows`, create a new file named `port-enrich-service.yml` and use the following snippet as its content:

<details>
<summary><b>Github workflow (click to expand)</b></summary>

```yaml showLineNumbers
name: Enrich service
on:
  workflow_dispatch:
    inputs:
      domain:
        required: true
        description: The domain to which the service will be assigned
        type: string
      type:
        required: true
        description: The service's type
        type: string
      lifecycle:
        required: true
        description: The service's lifecycle
        type: string
      port_payload:
        required: true
        description: Port's payload, including details for who triggered the action and general context
        type: string
jobs:
  enrichService:
    runs-on: ubuntu-latest
    steps:
      # Checkout the workflow's repository
      - uses: actions/checkout@v3
      # Checkout the service's repository
      - uses: actions/checkout@v3
        with:
          repository: "${{ github.repository_owner }}/${{fromJson(inputs.port_payload).context.entity}}"
          path: ./targetRepo
          token: ${{ secrets.ORG_ADMIN_TOKEN }}
      - name: Copy template yml file
        run: |
          cp templates/enrichService.yml ./targetRepo/port.yml
      - name: Update new file data
        run: |
          sed -i 's/{{ service_identifier }}/${{fromJson(inputs.port_payload).context.entity}}/' ./targetRepo/port.yml
          sed -i 's/{{ domain_identifier }}/${{ inputs.domain }}/' ./targetRepo/port.yml
          sed -i 's/{{ service_type }}/${{ inputs.type }}/' ./targetRepo/port.yml
          sed -i 's/{{ service_lifecycle }}/${{ inputs.lifecycle }}/' ./targetRepo/port.yml
      - name: Open a pull request
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.ORG_ADMIN_TOKEN }}
          path: ./targetRepo
          commit-message: Enrich service - ${{fromJson(inputs.port_payload).context.entity}}
          committer: GitHub <noreply@github.com>
          author: ${{ github.actor }} <${{ github.actor }}@users.noreply.github.com>
          signoff: false
          branch: add-port-yml
          delete-branch: true
          title: Create port.yml - ${{fromJson(inputs.port_payload).context.entity}}
          body: |
            Add port.yaml to enrich service in Port.
          draft: false
      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Pull request to add port.yml created successfully for service "${{fromJson(inputs.port_payload).context.entity}}" 🚀
```

</details>

</TabItem>

<TabItem value="gitlab">

In the same repository, create a new file called `.gitlab-ci.yml` and inside it paste the following:
<details>
<summary><b> GitLab pipeline (click to expand)</b></summary>

```yaml showLineNumbers
stages:
  - enrichService

enrichService:
  stage: enrichService
  only:
    - triggers # This pipeline will be triggered via the GitLab webhook service.
  before_script:
    - apt-get update && apt-get install -y jq && apt-get install -y yq
  script:
    - PAYLOAD=$(cat $TRIGGER_PAYLOAD)
    - runID=$(echo $PAYLOAD | jq -r '.context.runId')
    - >
      access_token=$(curl --location --request POST 'https://api.getport.io/v1/auth/access_token' --header 'Content-Type: application/json' --data-raw "{\"clientId\": \"$PORT_CLIENT_ID\",\"clientSecret\": \"$PORT_CLIENT_SECRET\"}" | jq '.accessToken' | sed 's/"//g')
    - >
      curl --location --request PATCH "https://api.getport.io/v1/actions/runs/$runID" --header "Authorization: $access_token" --header 'Content-Type: application/json' --data-raw "{\"link\": [\"$CI_PIPELINE_URL\"]
      }"
    - git config --global user.email "gitRunner@git.com"
    - git config --global user.name "Git Runner"
    - SERVICE_IDENTIFIER=$(echo $PAYLOAD | jq -r '.payload.entity.identifier')
    - DOMAIN_IDENTIFIER=$(echo $PAYLOAD | jq -r '.payload.properties.domain')
    - SERVICE_TYPE=$(echo $PAYLOAD | jq -r '.payload.properties.type')
    - SERVICE_LIFECYCLE=$(echo $PAYLOAD | jq -r '.payload.properties.lifecycle')
    - git clone https://:${GITLAB_ACCESS_TOKEN}@gitlab.com/${CI_PROJECT_PATH}.git
    - git clone https://:${GITLAB_ACCESS_TOKEN}@gitlab.com/${SERVICE_IDENTIFIER}.git ./targetRepo
    - cp templates/enrichService.yml ./targetRepo/port.yml
    - yq --in-place --arg SERVICE_ID $SERVICE_IDENTIFIER  '.[0].identifier = $SERVICE_ID' ./targetRepo/port.yml -y
    - yq --in-place --arg TYPE $SERVICE_TYPE  '.[0].properties.type = $TYPE' ./targetRepo/port.yml -y
    - yq --in-place --arg LIFECYCLE $SERVICE_LIFECYCLE '.[0].properties.lifecycle = $LIFECYCLE' ./targetRepo/port.yml -Y
    - yq --in-place --arg DOMAIN $DOMAIN_IDENTIFIER  '.[0].relations.domain = $DOMAIN' ./targetRepo/port.yml -Y
    - cd targetRepo
    - git pull
    - git checkout -b add-port-yml
    - git add port.yml
    - git commit -m "Enrich service - ${SERVICE_IDENTIFIER}"
    - set +e
    - output=$(git push origin add-port-yml -o merge_request.create 2>&1)
    - echo "$output"
    - runStatus="SUCCESS"
    - |
      if echo "$output" | grep -qi "rejected"; then
          runStatus="FAILURE"
      elif echo "$output" | grep -qi "error"; then
          runStatus="FAILURE"
      fi
    - echo "$runStatus"
    - |
      if [ "$runStatus" = "SUCCESS" ]; then
          # Generic regex for GitLab merge request URLs
          mergeRequestUrl=$(echo "$output" | grep -oP 'https:\/\/gitlab\.com\/[^\/]+\/[^\/]+\/-\/merge_requests\/\d+')
          echo "Merge Request URL: $mergeRequestUrl"
          curl --location --request POST "https://api.getport.io/v1/actions/runs/$runID/logs" \
          --header 'Content-Type: application/json' \
          --header "Authorization: $access_token" \
          --data-raw "{\"message\": \"PR opened at $mergeRequestUrl\"}"
      else
          curl --location --request POST "https://api.getport.io/v1/actions/runs/$runID/logs" \
          --header 'Content-Type: application/json' \
          --header "Authorization: $access_token" \
          --data-raw "{\"message\": \"The Job failed. Please check the job logs for more information.\"}"
      fi
    - >
      curl --location --request PATCH "https://api.getport.io/v1/actions/runs/$runID" --header "Authorization: $access_token" --header 'Content-Type: application/json' --data-raw "{\"status\": \"${runStatus}\"}"
```

</details>

</TabItem>

<TabItem value="bitbucket">

Create a Jenkins pipeline script with the following content (replace `<PORT-ACTIONS-REPO-URL>` with the URL of the repository you used in the previous step):

<details>
<summary><b>Jenkins pipeline script (click to expand)</b></summary>

```groovy showLineNumbers
import groovy.json.JsonSlurper

pipeline {
    agent any
    
    environment {
        DOMAIN = "${DOMAIN}"
        LIFECYCLE = "${LIFECYCLE}"
        ENTITY_IDENTIFIER = "${ENTITY_IDENTIFIER}"
        TYPE = "${TYPE}"
        REPO_URL = "${REPO_URL}"
        BITBUCKET_ORG_NAME = ""
        BITBUCKET_CREDENTIALS = credentials("BITBUCKET_CREDENTIALS")
        PORT_ACCESS_TOKEN = ""
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
        }
        stage('checkoutTemplate') {
            steps {
                git credentialsId: 'BITBUCKET_CREDENTIALS', url: 'https://hadar-co@bitbucket.org/portsamples/port-actions.git', branch: 'main'
            }
        }
        stage('checkoutDestination') {
            steps {
                sh 'mkdir -p destinationRepo'
                dir('destinationRepo') {
                    git credentialsId: 'BITBUCKET_CREDENTIALS', url: "${REPO_URL}", branch: 'master'
                }
            }
        }
        stage('copyTemplateFile') {
            steps {
                sh 'cp templates/enrichService.yml ./destinationRepo/port.yml'
            }
        }
        stage('updateFileData') {
            steps {
                sh """#!/bin/bash
                    sed -i .bak 's/{{ service_identifier }}/${ENTITY_IDENTIFIER}/' ./destinationRepo/port.yml
                    sed -i .bak 's/{{ domain_identifier }}/${DOMAIN}/' ./destinationRepo/port.yml
                    sed -i .bak 's/{{ service_type }}/${TYPE}/' ./destinationRepo/port.yml
                    sed -i .bak 's/{{ service_lifecycle }}/${LIFECYCLE}/' ./destinationRepo/port.yml
                """
            }
        }
        stage('CreateBranch') {
            steps {
                dir('destinationRepo') {
                    script {
                        sh '''#!/bin/bash
                            ORG_URL="${REPO_URL%/*}"
                            BITBUCKET_ORG_NAME="${ORG_URL##*org/}"
                            curl https://api.bitbucket.org/2.0/repositories/${BITBUCKET_ORG_NAME}/${ENTITY_IDENTIFIER}/refs/branches \
                            -u ${BITBUCKET_CREDENTIALS} -X POST -H "Content-Type: application/json" \
                            -d '{
                                "name" : "add-port-yml",
                                "target" : {
                                    "hash" : "master"
                                }
                            }'
                        '''
                    }
                }
            }
        }
        stage('PushPortYml') {
            steps {
                dir('destinationRepo') {
                   script {
                        sh '''#!/bin/bash
                            ORG_URL="${REPO_URL%/*}"
                            BITBUCKET_ORG_NAME="${ORG_URL##*org/}"
                            curl -X POST -u ${BITBUCKET_CREDENTIALS} https://api.bitbucket.org/2.0/repositories/${BITBUCKET_ORG_NAME}/${ENTITY_IDENTIFIER}/src \
                            -F message="Add port.yml" -F branch=add-port-yml \
                            -F port.yml=@port.yml
                        '''
                    }
                }
            }
        }
        stage('CreatePullRequest') {
            steps {
                dir('destinationRepo') {
                    script {
                        sh '''#!/bin/bash
                            ORG_URL="${REPO_URL%/*}"
                            BITBUCKET_ORG_NAME="${ORG_URL##*org/}"
                            curl -v https://api.bitbucket.org/2.0/repositories/${BITBUCKET_ORG_NAME}/${ENTITY_IDENTIFIER}/pullrequests \
                            -u ${BITBUCKET_CREDENTIALS} \
                            --request POST \
                            --header 'Content-Type: application/json' \
                            --data '{
                                "title": "Add port.yml",
                                "source": {
                                    "branch": {
                                        "name": "add-port-yml"
                                    }
                                }
                            }'
                        '''
                    }
                }
            }
        }
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
        }
    }
}
```
</details>

</TabItem>

</Tabs>

---

The action is ready to be executed 🚀

#### Execute the action

1. After creating an action, it will appear under the [Self-service page](https://app.getport.io/self-serve). Find your new `Enrich service` action, and click on `Execute`.

2. Choose a service from the dropdown, a domain to assign it to, and any values for its type and lifecycle, then click `Execute`:

<img src='/img/guides/gitopsEnrichActionExecute.png' width='50%' />

<br/><br/>

3. A small popup will appear, click on `View details`:

<img src='/img/guides/gitopsActionExecutePopup.png' width='40%' />

<br/><br/>

This page provides details about the action run. We can see that the backend returned `Success` and the pull-request was created successfully.

4. Head over to your service's repository, you will see that a new pull-request was created:

<img src='/img/guides/gitopsActionRepoPullRequest.png' width='70%' />

<br/>

5. Merge the pull-request, then head back to your [software catalog](https://app.getport.io/services).

6. Find your service, and click on its identifier. This will take you to the service's catalog page, where you can see your new properties populated with data:

<img src='/img/guides/gitopsServicePageAfterAction.png' width='80%' />

<br/><br/>

All done! 💪🏽

### Possible daily routine integrations

- Fetch data from a Sentry project and reflect it in your software catalog.
- Create and onboard services with a few clicks from your developer portal.

### Conclusion

Gitops is a common practice in modern software development, as it ensures that the state of your infrastructure is always in sync with your codebase.  
Port allows you to easily integrate your Gitops practices with your software catalog, reflecting the state of your infrastructure, and allowing you to empower your developers with controlled actions.

More guides & tutorials will be available soon, in the meantime feel free to reach out with any questions via our [community slack](https://www.getport.io/community) or [Github project](https://github.com/port-labs?view_as=public).

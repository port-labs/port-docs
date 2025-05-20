---
displayed_sidebar: null
description: Learn how developers can enrich repositories using GitOps in Port, enabling efficient and automated service management.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import FindCredentials from "/docs/build-your-software-catalog/custom-integration/api/\_template_docs/\_find_credentials_collapsed.mdx";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Enrich services using GitOps

This guide will walk you through the process of enriching a service in Port using Gitops.   
In practice, this can be used by developers to independently add additional valuable data to their services in Port.



## Common use cases

- Developers can enrich their services without needing to nag devops engineers.
- Platform engineers can create RBAC-controlled actions for developers, empowering their independence.
- R&D managers can track additional, valuable data about services in the organization.


## Prerequisites

- A Port account with permissions to create self-service actions.
- The [Git Integration](/build-your-software-catalog/sync-data-to-catalog/git/) that is relevant for you needs to be installed.
- [Automatic discovery](/getting-started/set-up-automatic-discovery#full-example) of services using git as source of truth is set up.
- A repository in your Git provider in which you can create a workflow/pipeline. If you don't have one, we recommend creating a new repository named `Port-actions`.


## Set up data model

To support GitOps-based repository enrichment in your portal,
we will add two new properties to the existing `service` <PortTooltip id="blueprint">blueprint</PortTooltip>,
and create a new `Domain` blueprint that groups related services together.

Let's add the following properties to track important metadata about our services:
- A **Type** property to classify services (e.g., microservice, library, CLI)
- A **Lifecycle** property to track development stages (development, staging, production)


### Add new properties to the service blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model), expand the `service` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New property`.

2. The first property will be the service **Type**, chosen from a predefined list of options. Fill out the form like the example below, and click `Create`:

    <img src="/img/guides/gitopsServicePropType1.png" width="45%" border='1px'  style={{ display: 'inline-block', marginRight: '1rem' }} />

    <img src="/img/guides/gitopsServicePropType2.png"  width="45%" border='1px' style={{ display: 'inline-block' }}  />

3. The second property will be the lifecycle state of the service, also chosen from a predefined list of options. Fill out the form like the example below, and click `Create`:

    _Note the colors of the inputs, this will make it easier to see a repository's lifecycle in your catalog_ 😎

   <img src="/img/guides/gitopsServicePropLifecycle1.png" width="45%" border='1px'  style={{ display: 'inline-block', marginRight: '1rem' }} />

   <img src="/img/guides/gitopsServicePropLifecycle2.png"  width="45%" border='1px' style={{ display: 'inline-block' }}  />


### Create a Domain blueprint

To group services by business or functional areas, let's define a `Domain` blueprint:

1. In your [Builder](https://app.getport.io/settings/data-model), click on the `+ Blueprint` button:

    <img src='/img/quickstart/builderAddCustomBlueprint.png' width='50%' border='1px' />

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

### Connect services to domains

Now that we have a <PortTooltip id="blueprint">blueprint</PortTooltip> to represent a domain, let's connect it to our services.
We will do this by adding a relation to the `service` blueprint:

1. Go to your [Builder](https://app.getport.io/settings/data-model), expand the `service` blueprint, and click on `New relation`:

    <img src='/img/guides/serviceCreateRelationNew.png' width='30%' border="1px" />

2. Fill out the form like this, then click `Create`:

    <img src='/img/guides/gitopsDomainRelationForm.png' width='50%' border="1px" />

<br/><br/>

## Create domains via Gitops

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

2. Head back to your [software catalog](https://app.getport.io/domains), you will see that Port has created two new `domain` <PortTooltip id="entity">entities</PortTooltip>:

      <img src='/img/guides/gitopsDomainEntities.png' width='50%' />

The `architecture` property is a URL to a Lucidchart diagram. This is a handy way to track a domain's architecture in your software catalog.

<br/>

## Create an action to enrich services

As platform engineers, we want to enable our developers to perform certain actions on their own. Let's create an action that developers can use to add data to a service, and allocate it to a domain.

1. Head to the [Self-service page](https://app.getport.io/self-serve) of your portal.
2. Click on the `+ Action` button in the top-right corner :

    <img src='/img/guides/addActionIcon.png' width='35%' border='1px' />

3. Fill the basic form with the  following:
    - **Title**: Enter `Enrich Service`
    - **Identifier** Toggle the switch icon off and  type a  `service_enrich_service`
    - **Description**:  Enter the description (e.g., Enrich service with data.)
    - **Icon**: Type `Microservice` and choose the  Icon (optional)
    - **Operation**:  Choose `Day-2`  from the dropdown
    - **Blueprint**:  Choose `Service` from the dropdown

      <img src='/img/guides/enrichActionDetails.png' width='70%' border='1px' />
     <br/>

4. Click on `Next`, and add the `Domain`  input:
      - Click on `+ Input`.
      - Enter the **Title** `Domain`.
      - Select the **Type** `Entity selection`.
      - Add the **Description** (optional).
      - Set **Required** to `True`.
      - Select `Domain` as the **Blueprint**
      - Click on the `Create` button. 
   
        <br/>
          <img src='/img/guides/gitopsDomainInput.png' width='50%' border='1px' />

        <br/><br/>
    
    
        :::tip Entity selection input type 
          The `Entity selection` type allows the executing user to choose an entity directly from the catalog.
        :::
5. Click on `+ Input` again to add the `Type` input:
      - Enter the **Title** `Type`.
      - Select the **Type** `Select`.
      - Add the **Options** `frontend`, `backend`, `library`.
      - Add the **Description** (optional).
      - Set **Required** to `True`.
      - Click on the `Create` button.

        <br/>
          <img src='/img/guides/gitopsTypeInput.png' width='50%' border='1px' />

        <br/><br/>

6. Click on `+ Input` one more time to add the `Lifecycle` input:
      - Enter the **Title** `Lifecycle`.
      - Select the **Type** `Select`.
      - Add the **Options** `Production`, `Experimental`, `Deprecated`.
      - Add the **Description** (optional).
      - Set **Required** to `True`.
      - Click on the `Create` button.

        <br/>
          <img src='/img/guides/gitopsLifecycleInput.png' width='50%' border='1px' />

        <br/><br/>


7. Click on `Next` to configure the **Backend**.


### Define backend type

Now we'll define the backend of the action. Port supports multiple invocation types, for this tutorial we will use a `Github workflow`, a `GitLab pipeline`, or a `Jenkins pipeline` (choose this option if you are using Bitbucket).

<Tabs groupId="git-provider" queryString values={[
{label: "Github", value: "github"},
{label: "GitLab", value: "gitlab"},
{label: "Bitbucket (Jenkins)", value: "bitbucket"},
]}>

<TabItem value="github">

Note that you will need to have [Port's Github app](https://github.com/apps/getport-io) installed in your Github organization (the one that contains the repository you'll work with).  
Follow these steps to setup the backend:

1. Select `Run Github Workflow` as the invocation type.

2. Fill out the form with your values:

    - Replace the `Organization` and `Repository` values with your values (this is where the workflow will reside and run).

    - Name the workflow `port-enrich-service.yml`.

    - Fill out your workflow details:
        <img src='/img/guides/gitopsActionBackendForm.png' width='50%' border='1px' />

    - Scroll down to the `Configure the invocation payload` section.  
      This is where you can define which data will be sent to your backend each time the action is executed.  

      For this example, we will send some details that our backend needs to know - the user inputs, the entity, and the id of the action run.  
      Copy the following JSON snippet and paste it in the payload code box:

      ```json showLineNumbers
      {
        "port_context": {
          "entity": "{{ .entity.identifier }}",
          "runId": "{{ .run.id }}"
        },
        "domain": "{{ .inputs.domain.identifier }}",
        "type": "{{ .inputs.type }}",
        "lifecycle": "{{ .inputs.lifecycle }}"
      }
      ```
</TabItem>

<TabItem value="gitlab">

First, choose `Trigger Webhook URL` as the invocation type. 
 
- The endpoint URL should look like this:  
  `https://gitlab.com/api/v4/projects/<PROJECT_ID>/ref/main/trigger/pipeline?token=<TRIGGER_TOKEN>`.  
  We will create the `PROJECT_ID` and `TRIGGER_TOKEN` in the next section and come back to update the URL.

- Fill out the rest of the form like this, then click `Next`:
    <img src='/img/guides/gitopsGitlabActionBackendForm.png' width='80%' border='1px' />

    <br/><br/>

    :::info Webhook protection

    The webhook URL can be triggered by anyone with access to it.  
    In order to protect the webhook, see the [Validating webhook signatures page](/actions-and-automations/setup-backend/webhook/signature-verification.md).

    :::

- Scroll down to the `Configure the invocation payload` section.  
  This is where you can define which data will be sent to your backend each time the action is executed.  

  For this example, we will send some details that our backend needs to know, including the service name, and the id of the action run.  
  Copy the following JSON snippet and paste it in the payload code box:

  ```json showLineNumbers
  {
    "port_context": {
      "entity": "{{ .entity.identifier }}",
      "runId": "{{ .run.id }}"
    },
    "domain": "{{ .inputs.domain.identifier }}",
    "type": "{{ .inputs.type }}",
    "lifecycle": "{{ .inputs.lifecycle }}"
  }
  ```

</TabItem>

<TabItem value="bitbucket">

Note that you will need to have [Port's Bitbucket app](https://marketplace.atlassian.com/apps/1229886/port-connector-for-bitbucket?hosting=cloud) installed in your Bitbucket workspace (the one that contains the repository you'll work with).

First, choose `Jenkins` as the invocation type.

- Follow the instructions under `Define a webhook to trigger a Jenkins job` to obtain your webhook URL.

- Use `enrichService` as the name of your new job token.
 
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
      "repo_url": "{{ .entity.properties.url }}",
      "runId": "{{ .run.id }}"
    },
    "domain": "{{ .inputs.domain.identifier }}",
    "type": "{{ .inputs.type }}",
    "lifecycle": "{{ .inputs.lifecycle }}"
  }
  ```

</TabItem>

</Tabs>

The last step is customizing the action's permissions. For simplicity's sake, we will use the default settings. For more information, see the [permissions](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/) page. Click `Create`.

### Setup the action's backend

Our action will create a pull-request in the  repository, containing a `port.yml` file that will add data to the repository in Port. Choose a backend type below to setup the workflow:

<Tabs groupId="git-provider" queryString values={[
{label: "Github", value: "github"},
{label: "GitLab", value: "gitlab"},
{label: "Bitbucket (Jenkins)", value: "bitbucket"},
]}>

<TabItem value="github">

1. First, let's create the necessary token and secrets. If you've already completed the [`scaffold a new service guide`](/guides/all/scaffold-a-new-service), you should already have these configured and you can skip this step.

    - Go to your [Github tokens page](https://github.com/settings/tokens), create a personal access token with `repo` and `admin:org` scope, and copy it (this token is needed to create a pull-request from our workflow).

        <img src='/img/guides/personalAccessToken.png' width='80%' />

    - Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

2. In your `Port-actions` (or equivalent) Github repository, create 3 new secrets under `Settings->Secrets and variables->Actions`:

   - `ORG_ADMIN_TOKEN` - the personal access token you created in the previous step.
   - `PORT_CLIENT_ID` - the client ID you copied from your Port app.
   - `PORT_CLIENT_SECRET` - the client secret you copied from your Port app.
      <br/>
       <img src='/img/guides/repositorySecret.png' width='60%' />
       <br/><br/>

</TabItem>

<TabItem value="gitlab">

- Go to your [Port application](https://app.getport.io/), click on the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

- Under your [root group](https://gitlab.com/dashboard/groups), access `Settings->Access Tokens`, and create a `Maintainer` role token with the `api`, `read_repository`, and `write_repository` scopes. Copy the token's value.

- Create a new project named `Port-pipelines`. Copy its GitLab project ID and replace the `(PROJECT_ID)` in the webhook URL. Then, under Settings->CI/CD, create a new Pipeline trigger token and use it to replace `(TRIGGER_TOKEN)` in the webhook URL.

- In the same menu (CI/CD), add the following variables to the pipeline:
  - `PORT_CLIENT_ID` - Your Port client ID.
  
  - `PORT_CLIENT_SECRET` - Your Port client secret.
  
  - `GITLAB_ACCESS_TOKEN` - The GitLab group access token you created in the previous step.
    
    <img src='/img/guides/gitlabVariables.png' width='80%' />

</TabItem>

<TabItem value="bitbucket">

1. Create a Bitbucket [app password](https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/) with `Pull requests:write` permissions, and copy its value.

2. Create the following [Jenkins credentials](https://www.jenkins.io/doc/book/using/using-credentials/#configuring-credentials) in your Jenkins instance:

    - A `username with password` credential named `BITBUCKET_CREDENTIALS` with your Bitbucket username as the username, and the `app password` you created in the previous step as the password.
      <FindCredentials />
    - A `secret text` credential named `PORT_CLIENT_ID` with your Port client ID as the secret.
    - A `secret text` credential named `PORT_CLIENT_SECRET` with your Port client secret as the secret.

3. Create a Jenkins Pipeline with the following configuration:

    - [Enable webhook trigger](https://docs.port.io/actions-and-automations/setup-backend/jenkins-pipeline/#enabling-webhook-trigger-for-a-pipeline) for the pipeline.
    - [Define post-content variables](https://docs.port.io/actions-and-automations/setup-backend/jenkins-pipeline/#defining-variables) for the pipeline with the following names and values:
      
      | Name | Value |
      | --- | --- |
      | LIFECYCLE | $.lifecycle |
      | TYPE | $.type |
      | DOMAIN | $.domain |
      | ENTITY_IDENTIFIER | $.port_context.entity |
      | REPO_URL | $.port_context.repo_url |
      | RUN_ID | $.port_context.runId |

    - Set `enrichService` as the pipeline's token.

</TabItem>

</Tabs>

---

We will now create a YML file that will serve as a template for our repository's `port.yml` configuration file.

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
      port_context:
        required: true
        description: Includes the entity identifier and the action's run id
      domain:
        required: true
        description: The domain to assign the service to
        type: string
      type:
        required: true
        description: The type of the service
        type: string
      lifecycle:
        required: true
        description: The lifecycle state of the service
        type: string
jobs:
  enrichService:
    runs-on: ubuntu-latest
    steps:
      # Checkout the workflow's repository
      - uses: actions/checkout@v4
      
      # Extract repository name
      - name: Extract repository name
        id: repo-name
        run: |
          entity="${{ fromJson(inputs.port_context).entity }}"
          repo_name=${entity#*/}  # Remove everything before the first '/'
          echo "repo_name=$repo_name" >> $GITHUB_OUTPUT
          
      # Checkout the service's repository
      - uses: actions/checkout@v4
        with:
          repository: "${{ github.repository_owner }}/${{ steps.repo-name.outputs.repo_name }}"
          path: ./targetRepo
          token: ${{ secrets.ORG_ADMIN_TOKEN }}
          
      - name: Copy template yml file
        run: |
          cp templates/enrichService.yml ./targetRepo/port.yml
          
      - name: Update new file data
        run: |
          sed -i "s|{{ service_identifier }}|${{ fromJson(inputs.port_context).entity }}|" ./targetRepo/port.yml
          sed -i "s|{{ domain_identifier }}|${{ inputs.domain }}|" ./targetRepo/port.yml
          sed -i "s|{{ service_type }}|${{ inputs.type }}|" ./targetRepo/port.yml
          sed -i "s|{{ service_lifecycle }}|${{ inputs.lifecycle }}|" ./targetRepo/port.yml
          
      - name: Open a pull request
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.ORG_ADMIN_TOKEN }}
          path: ./targetRepo
          commit-message: Enrich service - ${{ fromJson(inputs.port_context).entity}}
          committer: GitHub <noreply@github.com>
          author: ${{ github.actor }} <${{ github.actor }}@users.noreply.github.com>
          signoff: false
          branch: add-port-yml
          delete-branch: true
          title: Create port.yml - ${{ fromJson(inputs.port_context).entity }}
          body: |
            Add port.yaml to enrich service in Port.
          draft: false
          
      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          logMessage: Pull request to add port.yml created successfully for service "${{ fromJson(inputs.port_context).entity }}" 🚀
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
    - runID=$(echo $PAYLOAD | jq -r '.port_context.runId')
    - >
      access_token=$(curl --location --request POST 'https://api.getport.io/v1/auth/access_token' --header 'Content-Type: application/json' --data-raw "{\"clientId\": \"$PORT_CLIENT_ID\",\"clientSecret\": \"$PORT_CLIENT_SECRET\"}" | jq '.accessToken' | sed 's/"//g')
    - >
      curl --location --request PATCH "https://api.getport.io/v1/actions/runs/$runID" --header "Authorization: $access_token" --header 'Content-Type: application/json' --data-raw "{\"link\": [\"$CI_PIPELINE_URL\"]
      }"
    - git config --global user.email "gitRunner@git.com"
    - git config --global user.name "Git Runner"
    - SERVICE_IDENTIFIER=$(echo $PAYLOAD | jq -r '.port_context.entity')
    - DOMAIN_IDENTIFIER=$(echo $PAYLOAD | jq -r '.domain')
    - SERVICE_TYPE=$(echo $PAYLOAD | jq -r '.type')
    - SERVICE_LIFECYCLE=$(echo $PAYLOAD | jq -r '.lifecycle')
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
                git credentialsId: 'BITBUCKET_CREDENTIALS', url: "${REPO_URL}", branch: 'main'
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
                    sed -i "s|{{ service_identifier }}|${ENTITY_IDENTIFIER}|" ./destinationRepo/port.yml
                    sed -i "s|{{ domain_identifier }}|${DOMAIN}|" ./destinationRepo/port.yml
                    sed -i "s|{{ service_type }}|${TYPE}|" ./destinationRepo/port.yml
                    sed -i "s|{{ service_lifecycle }}|${LIFECYCLE}|" ./destinationRepo/port.yml
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
                          -d '{"status":"SUCCESS", "message": {"run_status": "Enrich service completed successfully!"}}' \
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

<PortApiRegionTip/>

---

The action is ready to be executed 🚀

### Execute the action

1. After creating an action, it will appear under the [Self-service page](https://app.getport.io/self-serve). Find your new `Enrich service` action, and click on `Execute`.

2. Choose a service from the dropdown, a domain to assign it to, and any values for its type and lifecycle, then click `Execute`:

    <img src='/img/guides/gitopsEnrichActionExecute.png' width='50%' border="1px" />

3. Click on the running actions icon on the top right conner to view running actions.:

    <img src='/img/guides/gitopsActionExecutePopup.png' width='40%' border="1px" />

    <br/>

4. Head over to your repository, you will see that a new pull-request was created:

    <img src='/img/guides/gitopsActionRepoPullRequest.png' width='90%' border="1px" />
    
    This page provides details about the action run. We can see that the backend returned `Success` and the pull-request was created successfully.

5. Merge the pull-request, then head back to your [software catalog](https://app.getport.io/services).

6. Find your service, and click on its identifier. This will take you to the service's entity page, where you can see your new properties populated with data:

    <img src='/img/guides/gitopsServicePageAfterAction.png' width='100%' border="1px" />

    <br/>



## Possible enhancements
- More Custom Properties: Add extra fields (e.g., repository owner, security posture) to your Repository blueprint.
- Sentry or Other Integrations: Fetch data from tools like Sentry or Jira and reflect it in your software catalog automatically.
- Customized GitOps Templates: Adjust the enrichRepository.yml file for more complex updates—e.g., adding environment variables, custom tags, or even provisioning logic.
- Advanced RBAC: Limit who can run the "Enrich repository" action or which properties certain teams can modify.
- Multi-step Workflows: Chain additional steps to notify Slack, create a Jira ticket, or update other systems before merging.

## Conclusion

Gitops is a common practice in modern software development, as it ensures that the state of your infrastructure is always in sync with your codebase.  
Port allows you to easily integrate your Gitops practices with your software catalog, reflecting the state of your infrastructure, and allowing you to empower your developers with controlled actions.

More guides & tutorials will be available soon, in the meantime feel free to reach out with any questions via our [community slack](https://www.getport.io/community) or [Github project](https://github.com/port-labs?view_as=public).

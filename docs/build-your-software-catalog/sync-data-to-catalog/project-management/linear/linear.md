import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_azure_premise.mdx"
import HelmParameters from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean-advanced-parameters-helm.mdx"
import DockerParameters from "./\_linear_one_time_docker_parameters.mdx"
import AdvancedConfig from '/docs/generalTemplates/\_ocean_advanced_configuration_note.md'
import LinearIssueBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/linear/\_example_linear_issue_blueprint.mdx"
import LinearIssueConfiguration from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/linear/\_example_linear_issue_configuration.mdx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"

# Linear

Our Linear integration allows you to import `issues`, `teams`, and `labels` from your Linear account into Port, according to your mapping and definition.


## Overview
This integration allows you to:

- Map and organize your desired Linear resources and their metadata in Port (see supported resources below).
- Watch for Linear object changes (create/update/delete) in real-time, and automatically apply the changes to your software catalog.

### Supported Resources

The resources that can be ingested from Linear into Port are listed below.  
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [Team](https://studio.apollographql.com/public/Linear-API/variant/current/schema/reference/objects/TeamConnection)
- [Issue](https://studio.apollographql.com/public/Linear-API/variant/current/schema/reference/objects/IssueConnection)
- [Label](https://studio.apollographql.com/public/Linear-API/variant/current/schema/reference/objects/IssueLabelConnection)

## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-Time (Self-hosted)">

<h2> Prerequisites </h2>

<Prerequisites />

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                                | Description                                                                                                                                | Example                          | Required |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | ------- |
| `port.clientId`                          | Your port [client id](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)            |                                  | ✅      |
| `port.clientSecret`                      | Your port [client secret](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)        |                                  | ✅      |
| `port.baseUrl`                | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US |                                  | ✅      |
| `integration.secrets.linearApiKey` | Linear [API key](https://developers.linear.app/docs/graphql/working-with-the-graphql-api#personal-api-keys) used to query the Linear GraphQL API                                                                                                   |                  | ✅      |
| `integration.config.appHost`             | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Linear                         | https://my-ocean-integration.com | ✅       |

<HelmParameters/>

<br/>
<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-linear-integration port-labs/port-ocean \
  --set port.clientId="PORT_CLIENT_ID"  \
  --set port.clientSecret="PORT_CLIENT_SECRET"  \
  --set port.baseUrl="https://api.getport.io"  \
  --set initializePortResources=true  \
  --set sendRawDataExamples=true  \
  --set scheduledResyncInterval=120 \
  --set integration.identifier="my-linear-integration"  \
  --set integration.type="linear"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.secrets.linearApiKey="string"
```

<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-linear-integration` in your git repository with the content:

:::note
Remember to replace the placeholder for `LINEAR_API_KEY`.
:::

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-linear-integration
  type: linear
  eventListener:
    type: POLLING
  secrets:
  // highlight-start
    linearApiKey: LINEAR_API_KEY
  // highlight-end
```

<br/>

1. Install the `my-ocean-linear-integration` ArgoCD Application by creating the following `my-ocean-linear-integration.yaml` manifest:

:::note Replace placeholders

Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.  
Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).

:::

<details>
  <summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-linear-integration
  namespace: argocd
spec:
  destination:
    namespace: mmy-ocean-linear-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-linear-integration/values.yaml
      // highlight-start
      parameters:
        - name: port.clientId
          value: YOUR_PORT_CLIENT_ID
        - name: port.clientSecret
          value: YOUR_PORT_CLIENT_SECRET
        - name: port.baseUrl
          value: https://api.getport.io
  - repoURL: YOUR_GIT_REPO_URL
  // highlight-end
    targetRevision: main
    ref: values
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

<PortApiRegionTip/>

</details>
<br/>

1. Apply your application manifest with `kubectl`:

```bash
kubectl apply -f my-ocean-linear-integration.yaml
```

</TabItem>
</Tabs>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="One-time (CI)">

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Linear integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Realtime updates in Port
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                        | Description                                                                                                                                                                                                                                                                              | Example                       | Required |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------|----------|
| `port_client_id`                 | Your Port client ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) id                                                                                                                               |                               | ✅        |
| `port_client_secret`             | Your Port client ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret                                                                                                                           |                               | ✅        |
| `port_base_url`             | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US |                               | ✅        |
| `config -> linear_api_key` | Linear [API key](https://developers.linear.app/docs/graphql/working-with-the-graphql-api#personal-api-keys) used to query the Linear GraphQL API                                                                                                                                                                                                                                                 |               | ✅        |
| `initialize_port_resources`      | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources) |                               | ❌        |
| `identifier`                     | The identifier of the integration that will be installed                                                                                                                                                                                                                                 |                               | ❌        |
| `version`                        | The version of the integration that will be installed                                                                                                                                                                                                                                    | latest                        | ❌        |`
| `sendRawDataExamples`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                       |   true    |                   | ❌       |
<br/>

:::tip Ocean Sail Github Action
The following example uses the **Ocean Sail** Github Action to run the Linear integration.
For further information about the action, please visit the [Ocean Sail Github Action](https://github.com/marketplace/actions/ocean-sail)
:::

<br/>

Here is an example for `linear-integration.yml` workflow file:

```yaml showLineNumbers
name: Linear Exporter Workflow

# This workflow is responsible for running Linear exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with:
          type: 'linear'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            linear_api_key: ${{ secrets.OCEAN__INTEGRATION__CONFIG__LINEAR_API_KEY }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Linear integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip Tip for Jenkins agent
Your Jenkins agent should be able to run docker commands.
:::

:::warning Realtime updates in Port
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/) of `Secret Text` type:

<DockerParameters/>

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Linear Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__LINEAR_API_KEY', variable: 'OCEAN__INTEGRATION__CONFIG__LINEAR_API_KEY'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="linear"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__LINEAR_API_KEY=$OCEAN__INTEGRATION__CONFIG__LINEAR_API_KEY \
                                -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
                                -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
                                -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
                                $image_name

                            exit $?
                        ''')
                    }
                }
            }
        }
    }
}
```

  </TabItem>

  <TabItem value="azure" label="Azure Devops">
<AzurePremise name="Linear" />

<DockerParameters />

<br/>

Here is an example for `linear-integration.yml` pipeline file:

```yaml showLineNumbers
trigger:
  - main

pool:
  vmImage: "ubuntu-latest"

variables:
  - group: port-ocean-credentials

steps:
  - script: |
      # Set Docker image and run the container
      integration_type="linear"
      version="latest"

      image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

      docker run -i --rm \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__LINEAR_API_KEY=$(OCEAN__INTEGRATION__CONFIG__LINEAR_API_KEY) \
        -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
        -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $image_name

      exit $?
    displayName: "Ingest Data into Port"
```

  </TabItem>

  <TabItem value="gitlab" label="GitLab">
This workflow will run the Linear integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Realtime updates in Port
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to [configure the following GitLab variables](https://docs.gitlab.com/ee/ci/variables/#for-a-project):

<DockerParameters/>

<br/>


Here is an example for `.gitlab-ci.yml` pipeline file:

```yaml showLineNumbers
default:
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  before_script:
    - docker info
    
variables:
  INTEGRATION_TYPE: linear
  VERSION: latest

stages:
  - ingest

ingest_data:
  stage: ingest
  variables:
    IMAGE_NAME: ghcr.io/port-labs/port-ocean-$INTEGRATION_TYPE:$VERSION
  script:
    - |
      docker run -i --rm --platform=linux/amd64 \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__LINEAR_API_KEY=$OCEAN__INTEGRATION__CONFIG__LINEAR_API_KEY \
        -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
        -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $IMAGE_NAME

  rules: # Run only when changes are made to the main branch
    - if: '$CI_COMMIT_BRANCH == "main"'
```

</TabItem>

  </Tabs>

  <PortApiRegionTip/>

  <AdvancedConfig/>

</TabItem>

</Tabs>



## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.



## Examples

To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

Additional examples of blueprints and the relevant integration configurations:

### Team

<details>
<summary>Team blueprint</summary>

```json showLineNumbers
{
  "identifier": "linearTeam",
  "title": "Linear Team",
  "icon": "Linear",
  "description": "A Linear team",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description",
        "description": "Team description"
      },
      "workspaceName": {
        "type": "string",
        "title": "Workspace Name",
        "description": "The name of the workspace this team belongs to"
      },
      "url": {
        "title": "Team URL",
        "type": "string",
        "format": "url",
        "description": "URL to the team in Linear"
      }
    }
  },
  "calculationProperties": {}
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: team
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .key
          title: .name
          blueprint: '"linearTeam"'
          properties:
            description: .description
            workspaceName: .organization.name
            url: "\"https://linear.app/\" + .organization.urlKey + \"/team/\" + .key"
```

</details>

### Label

<details>
<summary>Label blueprint</summary>

```json showLineNumbers
{
  "identifier": "linearLabel",
  "title": "Linear Label",
  "icon": "Linear",
  "description": "A Linear label",
  "schema": {
    "properties": {
      "isGroup": {
        "type": "boolean",
        "title": "Is group",
        "description": "Whether this label is considered to be a group"
      }
    }
  },
  "calculationProperties": {},
  "relations": {
    "parentLabel": {
      "target": "linearLabel",
      "title": "Parent Label",
      "required": false,
      "many": false
    },
    "childLabels": {
      "target": "linearLabel",
      "title": "Child Labels",
      "required": false,
      "many": true
    }
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: label
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"linearLabel"'
          properties:
            isGroup: .isGroup
          relations:
            parentLabel: .parent.id
            childLabels: "[.children.edges[].node.id]"
```

</details>

### Issue

<details>
<summary>Issue blueprint</summary>

```json showLineNumbers
{
  "identifier": "linearIssue",
  "title": "Linear Issue",
  "icon": "Linear",
  "schema": {
    "properties": {
      "url": {
        "title": "Issue URL",
        "type": "string",
        "format": "url",
        "description": "URL to the issue in Linear"
      },
      "status": {
        "title": "Status",
        "type": "string",
        "description": "The status of the issue"
      },
      "assignee": {
        "title": "Assignee",
        "type": "string",
        "format": "user",
        "description": "The user assigned to the issue"
      },
      "creator": {
        "title": "Creator",
        "type": "string",
        "description": "The user that created to the issue",
        "format": "user"
      },
      "priority": {
        "title": "Priority",
        "type": "string",
        "description": "The priority of the issue"
      },
      "created": {
        "title": "Created At",
        "type": "string",
        "description": "The created datetime of the issue",
        "format": "date-time"
      },
      "updated": {
        "title": "Updated At",
        "type": "string",
        "description": "The updated datetime of the issue",
        "format": "date-time"
      }
    }
  },
  "calculationProperties": {},
  "relations": {
    "team": {
      "target": "linearTeam",
      "title": "Team",
      "description": "The Linear team that contains this issue",
      "required": false,
      "many": false
    },
    "parentIssue": {
      "title": "Parent Issue",
      "target": "linearIssue",
      "required": false,
      "many": false
    },
    "labels": {
      "target": "linearLabel",
      "title": "Labels",
      "required": false,
      "many": true
    }
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: issue
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .identifier
          title: .title
          blueprint: '"linearIssue"'
          properties:
            url: .url
            status: .state.name
            assignee: .assignee.email
            creator: .creator.email
            priority: .priorityLabel
            created: .createdAt
            updated: .updatedAt
          relations:
            team: .team.key
            labels: .labelIds
            parentIssue: .parent.identifier
```

</details>



## Alternative installation via webhook

While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from Linear. If so, use the following instructions:

**Note** that when using the webhook installation method, data will be ingested into Port only when the webhook is triggered.

<details>

<summary><b>Webhook installation (click to expand)</b></summary>

In this example you are going to create a webhook integration between [Linear](https://linear.app/) and Port, which will ingest Linear issue entities.

<h2> Port configuration </h2>

Create the following blueprint definition:

<details>
<summary>Linear issue blueprint</summary>

<LinearIssueBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>Linear issue webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Linear mapper`;
   2. Identifier : `linear_mapper`;
   3. Description : `A webhook configuration to map Linear issues to Port`;
   4. Icon : `Linear`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <LinearIssueConfiguration/>

3. Click **Save** at the bottom of the page.

</details>

<h2> Create a webhook in Linear </h2>

You can follow the instruction in [Linear's docs](https://developers.linear.app/docs/graphql/webhooks#configuring-with-the-settings-ui), they are also outlined here for reference:

1. Log in to Linear as a user with admin permissions.
2. Click the workspace label at the top left corner.
3. Choose **Workspace Settings**.
4. At the bottom of the sidebar on the left, under **My Account**, choose **API**.
5. Click on **Create new webhook**.
6. Input the following details:
   1. `Label` - use a meaningful name such as Port Webhook.
   2. `URL` - enter the value of the `url` key you received after creating the webhook configuration.
   3. Under `Data change events` - mark issues.
7. Click **Create webhook** at the bottom of the page.

:::tip Linear events and payload
In order to view the different payloads and events available in Linear webhooks, [look here](https://developers.linear.app/docs/graphql/webhooks#the-webhook-payload)
:::

Done! any change you make to an issue (open, close, edit, etc.) will trigger a webhook event that Linear will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2> Let's Test It </h2>

This section includes a sample webhook event sent from Linear when an issue is created or updated. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

<h3> Payload </h3>

Here is an example of the payload structure sent to the webhook URL when a Linear issue is created:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "action": "create",
  "actor": {
    "id": "11c5ce7d-229b-4487-b23b-f404e4a8c85d",
    "name": "Mor Paz",
    "type": "user"
  },
  "createdAt": "2024-05-19T17:55:29.277Z",
  "data": {
    "id": "d62a755d-5389-4dbd-98bb-3db03f239d9d",
    "createdAt": "2024-05-19T17:55:29.277Z",
    "updatedAt": "2024-05-19T17:55:29.277Z",
    "number": 5,
    "title": "New issue again",
    "priority": 0,
    "boardOrder": 0,
    "sortOrder": -3975,
    "labelIds": [],
    "teamId": "92d25fa4-fb1c-449f-b314-47f82e8f280d",
    "previousIdentifiers": [],
    "creatorId": "11c5ce7d-229b-4487-b23b-f404e4a8c85d",
    "stateId": "f12cad17-9b8f-470d-b20a-5e17da8e46b9",
    "priorityLabel": "No priority",
    "botActor": null,
    "identifier": "POR-5",
    "url": "https://linear.app/getport/issue/POR-5/new-issue-again",
    "state": {
      "id": "f12cad17-9b8f-470d-b20a-5e17da8e46b9",
      "color": "#e2e2e2",
      "name": "Todo",
      "type": "unstarted"
    },
    "team": {
      "id": "92d25fa4-fb1c-449f-b314-47f82e8f280d",
      "key": "POR",
      "name": "Port"
    },
    "subscriberIds": [
      "11c5ce7d-229b-4487-b23b-f404e4a8c85d"
    ],
    "labels": []
  },
  "url": "https://linear.app/getport/issue/POR-5/new-issue-again",
  "type": "Issue",
  "organizationId": "36968e1b-496c-4610-8c25-641364da172e",
  "webhookTimestamp": 1716141329394,
  "webhookId": "ee1fa20e-6b57-4448-86f7-39d9672ddedd"
}
```

</details>

<h3> Mapping Result </h3>

The combination of the sample payload and the webhook configuration generates the following Port entity:

```json showLineNumbers
{
  "identifier": "POR-5",
  "title": "New issue again",
  "team": [],
  "properties": {
    "status": "Todo",
    "url": "https://linear.app/getport/issue/POR-5/new-issue-again",
    "created": "2024-05-19T17:55:29.277Z",
    "priority": "No priority",
    "updated": "2024-05-19T17:55:29.277Z"
  },
  "relations": {
    "labels": []
  },
  "icon": "Linear"
}
```

</details>
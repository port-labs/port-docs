import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_azure_premise.mdx"
import HelmParameters from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean-advanced-parameters-helm.mdx"
import DockerParameters from "./\_clickup_one_time_docker_parameters.mdx"
import AdvancedConfig from '/docs/generalTemplates/\_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Clickup

Our Clickup integration allows you to import `teams`, `projects` and `issues` from your Clickup account into Port, according to your mapping and definition.

## Common use cases

- Map teams, projects and issues in your Clickup organization environment.
- Watch for object changes (create/update/delete).
- Create/delete Clickup objects using self-service actions.

## Prerequisites

<Prerequisites />

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                                | Description                                                                                                                                | Example                          | Required |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | -------- |
| `port.clientId`                          | Your port [client id](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)            |                                  | ✅       |
| `port.clientSecret`                      | Your port [client secret](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)        |                                  | ✅       |
| `port.baseUrl`                | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US |                                  | ✅       |
| `integration.clickupApikey` | The personal token of the user Clickup account                                                                                                   |                  | ✅       |

<HelmParameters/>

<br/>
<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-clickup-integration port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \
	--set port.clientSecret="PORT_CLIENT_SECRET"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
	--set scheduledResyncInterval=120 \
	--set integration.identifier="my-clickup-integration"  \
	--set integration.type="clickup"  \
	--set integration.eventListener.type="POLLING"  \
  --set integration.clickupApikey="string"
```

<PortApiRegionTip/>

</TabItem>

</Tabs>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-clickup-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `CLICKUP_URL` `CLICKUP_APIKEY`.
:::

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-clickup-integration
  type: clickup
  eventListener:
    type: POLLING
  secrets:
  // highlight-start
    clickupApikey: CLICKUP_APIKEY
  // highlight-end
```

<br/>

2. Install the `my-ocean-clickup-integration` ArgoCD Application by creating the following `my-ocean-clickup-integration.yaml` manifest:

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
  name: my-ocean-clickup-integration
  namespace: argocd
spec:
  destination:
    namespace: mmy-ocean-clickup-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-clickup-integration/values.yaml
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
kubectl apply -f my-ocean-clickup-integration.yaml
```

</TabItem>
</Tabs>

</TabItem>

</TabItem>

<TabItem value="one-time" label="Scheduled">

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Clickup integration once and then exit, this is useful for **scheduled** ingestion of data.

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                        | Description                                                                                                                                                                                                                                                                              | Example                       | Required |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------|----------|
| `port_client_id`                 | Your Port client ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) id                                                                                                                               |                               | ✅        |
| `port_client_secret`             | Your Port client ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret                                                                                                                           |                               | ✅        |
| `port_base_url`             | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US |                               | ✅        |

| `config -> clickup_apikey` | The personal token of the user                                                           |                                         | ✅        |

| `initialize_port_resources`      | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources) |                               | ❌        |

| `identifier`                     | The identifier of the integration that will be installed                                                                                                                         |                               | ❌        |

| `version`                        | The version of the integration that will be installed                                     | latest                        | ❌        |`

<br/>

:::tip Ocean Sail Github Action
The following example uses the **Ocean Sail** Github Action to run the Clickup integration.
For further information about the action, please visit the [Ocean Sail Github Action](https://github.com/marketplace/actions/ocean-sail)
:::

<br/>

Here is an example for `clickup-integration.yml` workflow file:

```yaml showLineNumbers
name: Clickup Exporter Workflow

# This workflow responsible for running Jira exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with:
          type: 'clickup'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            clickup_apikey: ${{ secrets.OCEAN__INTEGRATION__CONFIG__CLICKUP_APIKEY }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Jira integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip Tip for Jenkins agent
Your Jenkins agent should be able to run docker commands.
:::

:::warning Realtime updates in Port
If you want the integration to update Port in real time you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/) of `Secret Text` type:

<DockerParameters/>

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Clickup Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__CLICKUP_APIKEY', variable: 'OCEAN__INTEGRATION__CONFIG__CLICKUP_APIKEY'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="jira"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__CLICKUP_APIKEY=$OCEAN__INTEGRATION__CONFIG__CLICKUP_APIKEY \
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
<AzurePremise name="Jira" />

<DockerParameters />

<br/>

Here is an example for `clickup-integration.yml` pipeline file:

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
      integration_type="clickup"
      version="latest"

      image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

      docker run -i --rm \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__INTEGRATION__CONFIG__CLICKUP_APIKEY=$(OCEAN__INTEGRATION__CONFIG__CLICKUP_APIKEY) \
        -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
        -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $image_name

      exit $?
    displayName: "Ingest Data into Port"
```

  </TabItem>

<TabItem value="gitlab" label="GitLab">
This workflow will run the Jira integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Realtime updates in Port
If you want the integration to update Port in real time you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
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
  INTEGRATION_TYPE: clickup
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
        -e OCEAN__INTEGRATION__CONFIG__CLICKUP_APIKEY=$OCEAN__INTEGRATION__CONFIG__CLICKUP_APIKEY \
        -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
        -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $IMAGE_NAME

  rules: # Run only when changes are made to the main branch
    - if: '$CI_COMMIT_BRANCH == "main"'
    - when: manual
```

</TabItem>

  </Tabs>

</TabItem>

</Tabs>

<PortApiRegionTip/>

<AdvancedConfig/>

## Ingesting Clickup objects

The Clickup integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `team` data from Clickup:

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
          identifier: .id
          title: .name
          blueprint: '"clickupTeam"'
          properties:
            url: "\"https://app.clickup.com/\" + .id"
            members:  '[.members[] | .user.email]'
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Clickup's API events.

:::info Additional parameters
In the example above, two additional parameters are used:  
`createMissingRelatedEntities` - used to enable the creation of missing related entities in Port. This is useful when you want to create an entity and its related entities in one call, or if you want to create an entity whose related entity does not exist yet.

`deleteDependentEntities` - used to enable deletion of dependent Port entities. This is useful when you have two blueprints with a required relation, and the target entity in the relation should be deleted. In this scenario, the delete operation will fail if this parameter is set to `false`. If set to `true`, the source entity will be deleted as well.
:::

### Configuration structure

The integration configuration determines which resources will be queried from Clickup, and which entities and properties will be created in Port.

:::tip Supported resources (`Kind`)
The following resources can be used to map data from Clickup, it is possible to reference any field that appears in the API responses linked below for the mapping configuration
- [`Team`](https://clickup.com/api/clickupreference/operation/GetAuthorizedTeams/)
- [`Project`](https://clickup.com/api/clickupreference/operation/GetLists/)
- [`Issue`](https://clickup.com/api/clickupreference/operation/GetTasks/)
  :::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: team
      selector:
      ...
  ```

- The `kind` key is a specifier for a Clickup object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: team
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: team
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-end
      port:
  ```

To use JQL filtering, add to the `selector` object a `jql` key with your desired JQL query as the value. For example:

```yaml showLineNumbers
resources:
  # highlight-next-line
  - kind: project # JQL filtering can only be used with the "project" kind
    selector:
      query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
    port:
```


- The `port`, `entity` and the `mappings` keys are used to map the Jira object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: project
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one Clickup object to a Port entity. Each value is a JQ query.
            identifier: .id
            title: .name
            blueprint: '"clickupProject"'
            properties:
                url: "\"https://app.clickup.com/\" + .__team_id + \"/v/li/\" + .id"
                startDate: if .start_date==null then .start_date else .start_date | tonumber / 1000 | todate end
                endDate: if .due_date==null then .due_date else .due_date | tonumber / 1000 | todate end
                totalIssues: .task_count
          relations:
            team: .__team_id
        # highlight-end
  ```

:::tip Blueprint key
Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
:::

### Ingest data into Port

To ingest Clickup objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Jira.
3. Choose the **Ingest Data** option from the menu.
4. Select Clickup under the Project management providers category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Team

<details>
<summary>Team blueprint</summary>

```json showLineNumbers
{
  "identifier": "clickupTeam",
  "description": "This blueprint represents a Clickup team",
  "title": "Clickup Team",
  "icon": "Clickup",
  "schema": {
    "properties": {
      "url": {
        "type": "string",
        "title": "URL",
        "format": "url"
      },
      "members": {
        "type": "array",
        "title": "Members",
        "items": {
          "type": "string",
          "format": "user"
        }
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
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
          identifier: .id
          title: .name
          blueprint: '"clickupTeam"'
          properties:
            url: "\"https://app.clickup.com/\" + .id"
            members:  '[.members[] | .user.email]'
```

</details>

### Project

<details>
<summary>Project blueprint</summary>

```json showLineNumbers
{
  "identifier": "clickupProject",
  "description": "This blueprint represents a ClickUp project",
  "title": "ClickUp Project",
  "icon": "Clickup",
  "schema": {
    "properties": {
      "url": {
        "title": "Project URL",
        "type": "string",
        "format": "url",
        "description": "URL to the project in Clickup"
      },
      "startDate": {
        "title": "Project start date",
        "type": "string",
        "format": "date-time",
        "description": "The start date of this project"
      },
      "endDate": {
        "title": "Project end date",
        "type": "string",
        "format": "date-time",
        "description": "The end date of this project"
      },
      "totalIssues": {
        "title": "Total Issues",
        "type": "number",
        "description": "The total number of issues in the project"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "team": {
      "title": "Team",
      "target": "clickupTeam",
      "required": false,
      "many": false
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
  - kind: project
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"clickupProject"'
          properties:
            url: "\"https://app.clickup.com/\" + .__team_id + \"/v/li/\" + .id"
            startDate: if .start_date==null then .start_date else .start_date | tonumber / 1000 | todate end
            endDate: if .due_date==null then .due_date else .due_date | tonumber / 1000 | todate end
            totalIssues: .task_count
          relations:
            team: .__team_id
```

</details>

### Issue
<details>
<summary>Issue blueprint</summary>

```json showLineNumbers
{
  "identifier": "clickupIssue",
  "title": "ClickUp Issue",
  "icon": "Clickup",
  "schema": {
    "properties": {
      "url": {
        "title": "Issue URL",
        "type": "string",
        "format": "url",
        "description": "URL to the issue in Clickup"
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
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "project": {
      "title": "Project",
      "description": "The Clickup project that manages this issue",
      "target": "clickupProject",
      "required": false,
      "many": false
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
          identifier: .id
          title: .name
          blueprint: '"clickupIssue"'
          properties:
            url: "\"https://app.clickup.com/t/\" + .id"
            status: .status.status
            assignee: .assignees[0].email
            creator:  .creator.email
            priority: .priority
            created:  if .date_created==null then .date_created else .date_created | tonumber / 1000 | todate end
            updated:  if .date_updated==null then .date_updated else .date_updated | tonumber / 1000 | todate end
          relations: 
            project:  .list.id
```

</details>
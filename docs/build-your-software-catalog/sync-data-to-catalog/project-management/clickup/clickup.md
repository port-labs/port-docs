import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_azure_premise.mdx"
import HelmParameters from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean-advanced-parameters-helm.mdx"
import DockerParameters from "./\_clickup_one_time_docker_parameters.mdx"
import AdvancedConfig from '/docs/generalTemplates/\_ocean_advanced_configuration_note.md'
import ClickupIssueBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/clickup/\_example_clickup_issue_blueprint.mdx"
import ClickupIssueConfiguration from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/clickup/\_example_clickup_issue_configuration.mdx"
import PortApiRegionTip from "/docs/generalTemplates/\_port_region_parameter_explanation_template.md"

# Clickup

Our Clickup integration allows you to sync data from Clickup to Port. This integration can be used to map Clickup teams, projects/lists, and issues/tasks to Port entities.

## Common use cases

- Map teams, lists, and tasks to Port entities.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Create/delete Clickup objects using self-service actions.

## Prerequisites

<Prerequisites />

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                                  | Description                                                                                                                       | Example                          | Required |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------- |
| `port.clientId`                            | Your port [client id](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)     |                                  | ✅       |
| `port.clientSecret`                        | Your port [client secret](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials) |                                  | ✅       |
| `port.baseUrl`                             | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                           |                                  | ✅       |
| `integration.secrets.clickupPersonalToken` | Clickup [personal token](https://clickup.com/api/developer-portal/authentication/#personal-token) used to access the Clickup API  |                                  | ✅       |
| `integration.config.appHost`               | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Clickup             | https://my-ocean-integration.com | ❌       |

<HelmParameters/>

<br/>
<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-clickup-integration port-labs/port-ocean \
	--set port.clientId="<PORT_CLIENT_ID>"  \
	--set port.clientSecret="<PORT_CLIENT_SECRET>"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
	--set scheduledResyncInterval=120 \
	--set integration.identifier="my-clickup-integration"  \
	--set integration.type="clickup"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.secrets.clickupPersonalToken="<CLICKUP_PERSONAL_TOKEN>"
```

<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-clickup-integration` in your git repository with the content:

:::note
Remember to replace the placeholder for `CLICKUP_PERSONAL_TOKEN`.
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
    clickupPersonalToken: CLICKUP_PERSONAL_TOKEN
  // highlight-end
```

<br/>

1. Install the `my-ocean-clickup-integration` ArgoCD Application by creating the following `my-ocean-clickup-integration.yaml` manifest:

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

<TabItem value="one-time" label="Scheduled">

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Clickup integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Realtime updates in Port
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                          | Description                                                                                                                                                                                                                                                                              | Example | Required |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- | --- |
| `port_client_id`                   | Your Port client ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) id                                                                                                                               |         | ✅       |
| `port_client_secret`               | Your Port client ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret                                                                                                                           |         | ✅       |
| `port_base_url`                    | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                  |         | ✅       |
| `config -> clickup_personal_token` | Clickup [personal token](https://clickup.com/api/developer-portal/authentication/#personal-token) used to access the Clickup API                                                                                                                                                         |         | ✅       |
| `initialize_port_resources`        | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources) |         | ❌       |
| `identifier`                       | The identifier of the integration that will be installed                                                                                                                                                                                                                                 |         | ❌       |
| `version`                          | The version of the integration that will be installed                                                                                                                                                                                                                                    | latest  | ❌       | `   |

<br/>

:::tip Ocean Sail Github Action
The following example uses the **Ocean Sail** Github Action to run the Clickup integration.
For further information about the action, please visit the [Ocean Sail Github Action](https://github.com/marketplace/actions/ocean-sail)
:::

<br/>

Here is an example for `clickup-integration.yml` workflow file:

```yaml showLineNumbers
name: Clickup Exporter Workflow

# This workflow is responsible for running Clickup exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with:
          type: "clickup"
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            clickup_personal_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__CLICKUP_PERSONAL_TOKEN }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Clickup integration once and then exit, this is useful for **scheduled** ingestion of data.

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
        stage('Run Clickup Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__CLICKUP_PERSONAL_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__CLICKUP_PERSONAL_TOKEN'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="clickup"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__CLICKUP_PERSONAL_TOKEN=$OCEAN__INTEGRATION__CONFIG__CLICKUP_PERSONAL_TOKEN \
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
<AzurePremise name="Clickup" />

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
        -e OCEAN__INTEGRATION__CONFIG__CLICKUP_PERSONAL_TOKEN=$(OCEAN__INTEGRATION__CONFIG__CLICKUP_PERSONAL_TOKEN) \
        -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
        -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $image_name

      exit $?
    displayName: "Ingest Data into Port"
```

  </TabItem>

  <TabItem value="gitlab" label="GitLab">
This workflow will run the Clickup integration once and then exit, this is useful for **scheduled** ingestion of data.

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
        -e OCEAN__INTEGRATION__CONFIG__CLICKUP_PERSONAL_TOKEN=$OCEAN__INTEGRATION__CONFIG__CLICKUP_PERSONAL_TOKEN \
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

</TabItem>

</Tabs>

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
          blueprint: '"clickupTeam"'
          identifier: .id | tostring
          title: .name
          properties:
            url: '"https://app.clickup.com/" + .id + "/home"'
            members: "[.members[] | .user.email]"
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Clickup's API events.

:::info Additional parameters
In the example above, two additional parameters are used:  
`createMissingRelatedEntities` - used to enable the creation of missing related entities in Port. This is useful when you want to create an entity and its related entities in one call, or if you want to create an entity whose related entity does not exist yet.

`deleteDependentEntities` - used to enable deletion of dependent Port entities. This is useful when you have two blueprints with a required relation, and the target entity in the relation should be deleted. In this scenario, the delete operation will fail if this parameter is set to `false`. If set to `true`, the source entity will be deleted as well.
:::

### Configuration structure

The integration configuration determines which resources will be queried from Clickup, and which entities and properties will be created in Port.

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

- The `port`, `entity` and the `mappings` keys are used to map the Clickup object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: team
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
        mappings: # Mappings between one Clickup object to a Port entity. Each value is a JQ query.
          blueprint: '"clickupTeam"'
          identifier: .id | tostring
          title: .name
          properties:
            url: '"https://app.clickup.com/" + .id + "/home"'
            members: "[.members[] | .user.email]"
        # highlight-end
    - kind: team # In this instance project is mapped again with a different filter
      selector:
        query: '.name == "MyTeamName"'
      port:
        entity:
          mappings: ...
  ```

:::tip Blueprint key
Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
:::

### Ingest data into Port

To ingest Clickup objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Clickup.
3. Choose the **Ingest Data** option from the menu.
4. Click on `+ Data source` at the top right corner
5. Select Clickup under the Project management providers category.
6. Modify the [configuration](#configuration-structure) according to your needs.
7. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Team

<details>
<summary>Team blueprint</summary>

```json showLineNumbers
{
  "identifier": "clickupTeam",
  "title": "Clickup Team",
  "icon": "Clickup",
  "description": "A Clickup team",
  "schema": {
    "properties": {
      "url": {
        "title": "Team URL",
        "type": "string",
        "format": "url",
        "description": "URL to the team in Clickup"
      },
      "members": {
        "title": "Members",
        "type": "array",
        "items": {
          "type": "string",
          "format": "user"
        },
        "description": "The members of the team"
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
          blueprint: '"clickupTeam"'
          identifier: .id | tostring
          title: .name
          properties:
            url: '"https://app.clickup.com/" + .id + "/home"'
            members: "[.members[] | .user.email]"
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
          blueprint: '"clickupProject"'
          identifier: .id | tostring
          title: .name
          properties:
            url: '"https://app.clickup.com/" + .team_id + "/v/l/li/" + .id'
            startDate: .start_date
            endDate: .due_date
            totalIssues: .task_count
          relations:
            team: .team_id
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
          blueprint: '"clickupIssue"'
          identifier: .id | tostring
          title: .name
          properties:
            url: .url
            status: .status.status
            assignee: .assignees[0].user.email
            creator: .creator.email
            priority: .priority.priority
            created: .date_created
            updated: .date_updated
          relations:
            project: .list.id
```

</details>

## Let's Test It

This section includes a sample response data from Clickup. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Clickup:

<details>
<summary> Team response data</summary>

```json showLineNumbers
{
  "id": "1234567890",
  "name": "Port Workspace",
  "color": "#40BC86",
  "avatar": null,
  "members": [
    {
      "user": {
        "id": 123457,
        "username": "John Doe",
        "email": "johndoe@gmail.com",
        "color": "",
        "profilePicture": null,
        "initials": "JD",
        "role": 1,
        "custom_role": null,
        "last_active": "1720012290191",
        "date_joined": "1716978857429",
        "date_invited": "1716978857429"
      }
    },
    {...},
    {...}
  ]
}
```

</details>

<details>
<summary>Project response data</summary>

```json showLineNumbers
{
  "id": "124",
  "name": "Updated List Name",
  "orderindex": 1,
  "content": "Updated List Content",
  "status": {
    "status": "red",
    "color": "#e50000",
    "hide_label": true
  },
  "priority": {
    "priority": "high",
    "color": "#f50000"
  },
  "assignee": null,
  "due_date": "1567780450202",
  "due_date_time": true,
  "start_date": null,
  "start_date_time": null,
  "space": {
    "id": "789",
    "name": "Space Name",
    "access": true
  },
  "inbound_address": "add.task.124.ac725f.31518a6a-05bb-4997-92a6-1dcfe2f527ca@tasks.clickup.com",
  "archived": false,
  "override_statuses": false,
  "statuses": [
    {
      "status": "to do",
      "orderindex": 0,
      "color": "#d3d3d3",
      "type": "open"
    },
    {
      "status": "complete",
      "orderindex": 1,
      "color": "#6bc950",
      "type": "closed"
    }
  ],
  "permission_level": "create"
}
```

</details>

<details>
<summary> Issue response data</summary>

```json showLineNumbers
{
  "id": "string",
  "custom_id": "string",
  "custom_item_id": 0,
  "name": "string",
  "text_content": "string",
  "description": "string",
  "status": {
    "status": "in progress",
    "color": "#d3d3d3",
    "orderindex": 1,
    "type": "custom"
  },
  "orderindex": "string",
  "date_created": "string",
  "date_updated": "string",
  "date_closed": "string",
  "creator": {
    "id": 183,
    "username": "John Doe",
    "color": "#827718",
    "profilePicture": "https://attachments-public.clickup.com/profilePictures/183_abc.jpg"
  },
  "assignees": ["string"],
  "watchers": ["string"],
  "checklists": ["string"],
  "tags": ["string"],
  "parent": "string",
  "priority": "string",
  "due_date": "string",
  "start_date": "string",
  "points": 0,
  "time_estimate": "string",
  "time_spent": "string",
  "custom_fields": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "type_config": {},
      "date_created": "string",
      "hide_from_guests": true,
      "value": {
        "id": 183,
        "username": "John Doe",
        "email": "john@example.com",
        "color": "#7b68ee",
        "initials": "JD",
        "profilePicture": null
      },
      "required": true
    }
  ],
  "list": {
    "id": "123"
  },
  "folder": {
    "id": "456"
  },
  "space": {
    "id": "789"
  },
  "url": "string",
  "markdown_description": "string",
  "attachments": [
    {
      "id": "62447c77-2086-4cda-b274-f53eccf0547b.csv",
      "date": 1711570108374,
      "title": "Canny - Exported posts - 2024-03-09.csv",
      "type": 1,
      "source": 1,
      "version": 0,
      "extension": "csv",
      "thumbnail_small": null,
      "thumbnail_medium": null,
      "thumbnail_large": null,
      "is_folder": null,
      "mimetype": "text/csv",
      "hidden": false,
      "parent_id": "36fjfqy",
      "size": 140970,
      "total_comments": 0,
      "resolved_comments": 0,
      "user": [
        {
          "id": [
            {
              "type": "integer",
              "contentEncoding": "int32"
            }
          ],
          "username": {
            "type": "string"
          },
          "initials": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "color": {
            "type": "string"
          },
          "profilePicture": {
            "type": "string"
          }
        }
      ],
      "deleted": false,
      "orientation": null,
      "url": "https://t6931406.p.clickup-attachments.com/t6931406/62447c77-2086-4cda-b274-f53eccf0547b/Canny%20-%20Exported%20posts%20-%202024-03-09.csv",
      "email_data": null,
      "url_w_query": "https://t6931406.p.clickup-attachments.com/t6931406/62447c77-2086-4cda-b274-f53eccf0547b/Canny%20-%20Exported%20posts%20-%202024-03-09.csv?view=open",
      "url_w_host": "https://t6931406.p.clickup-attachments.com/t6931406/62447c77-2086-4cda-b274-f53eccf0547b/Canny%20-%20Exported%20posts%20-%202024-03-09.csv"
    }
  ]
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Team entity in Port</summary>

```json showLineNumbers
{
  "identifier": "1234567890",
  "title": "Port",
  "icon": null,
  "blueprint": "clickupTeam",
  "team": [],
  "properties": {
    "url": "https://app.clickup.com/1234567890/home",
    "members": ["johndoe@gmail.com"]
  },
  "relations": {},
  "createdAt": "2024-05-19T16:19:15.232Z",
  "createdBy": "KZ5zDPudPshQMShUb4cLopBEE1fNSJGE",
  "updatedAt": "2024-05-19T16:19:15.232Z",
  "updatedBy": "KZ5zDPudPshQMShUb4cLopBEE1fNSJGE"
}
```

</details>

<details>
<summary>Project entity in Port</summary>

```json showLineNumbers
{
  "identifier": "124",
  "title": "New-sample-project",
  "icon": null,
  "blueprint": "clickupProject",
  "team": [],
  "properties": {
    "url": "https://app.clickup.com/1234567890/v/l/li/124",
    "startDate": "2024-05-19T16:19:15.232Z",
    "endDate": null,
    "totalIssues": 0
  },
  "relations": {
    "team": "1234567890"
  },
  "createdAt": "2024-05-19T16:19:17.747Z",
  "createdBy": "KZ5zDPudPshQMShUb4cLopBEE1fNSJGE",
  "updatedAt": "2024-05-19T16:19:17.747Z",
  "updatedBy": "KZ5zDPudPshQMShUb4cLopBEE1fNSJGE"
}
```

</details>

<details>
<summary>Issue entity in Port</summary>

```json showLineNumbers
{
  "identifier": "123456789",
  "title": "sub issue with new title",
  "icon": null,
  "blueprint": "clickupIssue",
  "team": [],
  "properties": {
    "url": "https://app.clickup.com/t/123456789",
    "status": "in progress",
    "assignee": "johndoe@gmail.com",
    "creator": "johndoe@gmail.com",
    "priority": "high",
    "created": "2024-05-19T16:19:21.143Z",
    "updated": "2024-05-19T16:19:21.143Z"
  },
  "relations": {
    "project": "124"
  },
  "createdAt": "2024-05-19T16:19:21.143Z",
  "createdBy": "KZ5zDPudPshQMShUb4cLopBEE1fNSJGE",
  "updatedAt": "2024-05-19T16:19:21.143Z",
  "updatedBy": "KZ5zDPudPshQMShUb4cLopBEE1fNSJGE"
}
```

</details>

## Alternative installation via webhook

While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from Clickup. If so, use the following instructions:

<details>

<summary><b>Webhook installation (click to expand)</b></summary>

In this example you are going to create a webhook integration between [Clickup](https://clickup.com) and Port, which will ingest Clickup issue entities.

<h2> Port configuration </h2>

Create the following blueprint definition:

<details>
<summary>Clickup issue blueprint</summary>

<ClickupIssueBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>Clickup issue webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Clickup mapper`;
   2. Identifier : `clickup_mapper`;
   3. Description : `A webhook configuration to map Clickup issues to Port`;
   4. Icon : `Clickup`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <ClickupIssueConfiguration/>

3. Click **Save** at the bottom of the page.

</details>

<h2> Create a webhook in Clickup </h2>

You can follow the instruction in [Clickup's docs](https://clickup.com/api/clickupreference/operation/CreateWebhook/).

:::tip Clickup events and payload
In order to view the different payloads and events available in Clickup webhooks, [look here](https://clickup.com/api/developer-portal/webhooks/)
:::

Done! Any change you make to an issue (open, close, edit, etc.) will trigger a webhook event that Clickup will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2> Let's Test It </h2>

This section includes a sample webhook event sent from Clickup when an issue is created or updated. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

<h3> Payload </h3>

Here is an example of the payload structure sent to the webhook URL when a Clickup issue is created:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "event": "taskCreated",
  "history_items": [
    {
      "after": {
        "color": "#87909e",
        "orderindex": 0,
        "status": "backlog",
        "type": "open"
      },
      "before": {
        "color": "#000000",
        "orderindex": -1,
        "status": null,
        "type": "removed"
      },
      "data": { "status_type": "open" },
      "date": "1719819965305",
      "field": "status",
      "id": "4094040432463129479",
      "parent_id": "901505267161",
      "source": null,
      "type": 1,
      "user": {
        "color": "",
        "email": "johndoe@gmail.com",
        "id": 74465043,
        "initials": "JD",
        "profilePicture": null,
        "username": "John Doe"
      }
    },
    {
      "after": null,
      "before": null,
      "data": {
        "subcategory_id": "901505267161",
        "trace_id": "5739374162032180008",
        "via": "user"
      },
      "date": "1719819965305",
      "field": "task_creation",
      "id": "4094040432446352262",
      "parent_id": "901505267161",
      "source": "user",
      "type": 1,
      "user": {
        "color": "",
        "email": "johndoe@gmail.com",
        "id": 74465043,
        "initials": "JD",
        "profilePicture": null,
        "username": "John Doe"
      }
    }
  ],
  "task_id": "86bzdxgmn",
  "webhook_id": "41d252c6-9a98-4810-909c-a77ec5558345"
}
```

</details>

<h3> Mapping Result </h3>

The combination of the sample payload and the webhook configuration generates the following Port entity:

```json showLineNumbers
{
  "identifier": "86bzdxgmn",
  "title": "New-sample-issue",
  "team": [],
  "properties": {
    "url": "https://app.clickup.com/t/86bzdxgmn",
    "status": "backlog",
    "assignee": "johndoe@gmail.com",
    "creator": "johndoe@gmail.com",
    "priority": "high",
    "created": "2024-05-19T16:19:21.143Z",
    "updated": "2024-05-19T16:19:21.143Z"
  },
  "relations": {
    "project": "124"
  },
  "icon": "Clickup"
}
```

</details>

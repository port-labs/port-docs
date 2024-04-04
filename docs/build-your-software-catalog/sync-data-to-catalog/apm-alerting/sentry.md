import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_sentry-docker-parameters.mdx"
import AdvancedConfig from '../../../generalTemplates/\_ocean_advanced_configuration_note.md'
import SentryCommentsBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/sentry/\_example_sentry_comments_blueprint.mdx";
import SentryCommentsConfiguration from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/sentry/\_example_sentry_comment_webhook_configuration.mdx"
import SentryIssuesBluePrint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/sentry/\_example_sentry_issue_event_blueprint.mdx"
import SentryIssuesConfiguration from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/sentry/\_example_sentry_issue_event_webhook_configuration.mdx"

# Sentry

Our Sentry integration allows you to import `projects`, `issues`, `project-tag` and `issue-tag` from your Sentry cloud account into Port, according to your mapping and definition.

A `Project` is essentially a container for all the data and information related to a specific application or service that you want to monitor.

An `Issue` is a group of incidents that describe the underlying problem of your symptoms.

A `Tag` is a key/value pair used to attach additional metadata to objects. This metadata can include information such as the environment, runtime, log level, and more.

## Common use cases

- Map your monitored projects and issues into Port.

## Prerequisites

<Prerequisites />

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                               | Description                                                                                                   | Required |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| `port.clientId`                         | Your port client id                                                                                           | ✅       |
| `port.clientSecret`                     | Your port client secret                                                                                       | ✅       |
| `port.baseUrl`                          | Your port base url, relevant only if not using the default port app                                           | ❌       |
| `integration.identifier`                | Change the identifier to describe your integration                                                            | ✅       |
| `integration.type`                      | The integration type                                                                                          | ✅       |
| `integration.eventListener.type`        | The event listener type                                                                                       | ✅       |
| `integration.secrets.sentryToken`       | The Sentry API token                                                                                     | ✅       |
| `integration.config.sentryHost`         | The Sentry host. For example https://sentry.io                                                                | ✅       |
| `integration.config.sentryOrganization` | The Sentry organization slug                                                                                  | ✅       |
| `scheduledResyncInterval`               | The number of minutes between each resync                                                                     | ❌       |
| `initializePortResources`               | Default true, When set to true the integration will create default blueprints and the port App config Mapping | ❌       |

<br/>

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-sentry-integration port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \
	--set port.clientSecret="PORT_CLIENT_SECRET"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
	--set integration.identifier="my-sentry-integration"  \
	--set integration.type="sentry"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.config.sentryHost="https://sentry.io"  \
	--set integration.secrets.sentryToken="string"  \
	--set integration.config.sentryOrganization="string"
```
</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-sentry-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `SENTRY_HOST` `SENTRY_ORGANIZATION` and `SENTRY_TOKEN`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-sentry-integration
  type: sentry
  eventListener:
    type: POLLING
  config:
  // highlight-start
    sentryHost: SENTRY_HOST
    sentryOrganization: SENTRY_ORGANIZATION
  // highlight-end
  secrets:
  // highlight-next-line
    sentryToken: SENTRY_TOKEN
```
<br/>

2. Install the `my-ocean-sentry-integration` ArgoCD Application by creating the following `my-ocean-sentry-integration.yaml` manifest:
:::note
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
  <summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-sentry-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-sentry-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-sentry-integration/values.yaml
      // highlight-start
      parameters:
        - name: port.clientId
          value: YOUR_PORT_CLIENT_ID
        - name: port.clientSecret
          value: YOUR_PORT_CLIENT_SECRET
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

</details>
<br/>

3. Apply your application manifest with `kubectl`:
```bash
kubectl apply -f my-ocean-sentry-integration.yaml
```
</TabItem>
</Tabs>

</TabItem>

<TabItem value="one-time" label="Scheduled">
 <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Sentry integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `sentry-integration.yml` workflow file:

```yaml showLineNumbers
name: Sentry Exporter Workflow

# This workflow responsible for running Sentry exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with: 
          type: 'sentry'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          config: |
            sentry_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN }}
            sentry_host: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SENTRY_HOST }}
            sentry_organization: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Sentry integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Jenkins agent should be able to run docker commands.
:::
:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/) of `Secret Text` type:

<DockerParameters />

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Sentry Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__SENTRY_HOST', variable: 'OCEAN__INTEGRATION__CONFIG__SENTRY_HOST'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION', variable: 'OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="sentry"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN=$OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN \
                                -e OCEAN__INTEGRATION__CONFIG__SENTRY_HOST=$OCEAN__INTEGRATION__CONFIG__SENTRY_HOST \
                                -e OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION=$OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION \
                                -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
                                -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
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
  
  <AzurePremise name="Sentry" />

<DockerParameters /> 

<br/>

Here is an example for `sentry-integration.yml` pipeline file:

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
    integration_type="sentry"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
       -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
      -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
      -e OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN=${OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN} \
      -e OCEAN__INTEGRATION__CONFIG__SENTRY_HOST=${OCEAN__INTEGRATION__CONFIG__SENTRY_HOST} \
      -e OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION=${OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION} \
      -e OCEAN__PORT__CLIENT_ID=${OCEAN__PORT__CLIENT_ID} \
      -e OCEAN__PORT__CLIENT_SECRET=${OCEAN__PORT__CLIENT_SECRET} \
      $image_name

    exit $?
  displayName: 'Ingest Data into Port'

```

  </TabItem>

  </Tabs>
</TabItem>

</Tabs>

### Event listener

The integration uses polling to pull the configuration from Port every minute and check it for changes. If there is a change, a resync will occur.

<AdvancedConfig/>

## Ingesting Sentry objects

The Sentry integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `Issue` data from Sentry:

```yaml showLineNumbers
resources:
  - kind: issue
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: ".id"
          title: ".title"
          blueprint: '"sentryIssue"'
          properties:
            link: ".permalink"
            status: ".status"
            isUnhandled: ".isUnhandled"
          relations:
            project: ".project.slug"
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Sentry's API events.

### Configuration structure

The integration configuration determines which resources will be queried from Sentry, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Sentry, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Project`](https://docs.sentry.io/api/projects/list-your-projects/)
- [`Issue`](https://docs.sentry.io/api/events/list-a-projects-issues/)
- [`Project Tag`](https://docs.sentry.io/api/projects/list-a-tags-values/)
- [`Issue Tag`](https://docs.sentry.io/api/events/list-a-tags-values-related-to-an-issue/)


:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: project
      selector:
      ...
  ```

- The `kind` key is a specifier for a Sentry object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: project
        selector:
        ...
  ```

- The `port`, `entity` and the `mappings` keys are used to map the Sentry object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: project
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings:
            identifier: .slug
            title: .name
            blueprint: '"sentryProject"'
            properties:
              dateCreated: .dateCreated
              platform: .platform
              status: .status
              link: .organization.links.organizationUrl + "/projects/" + .name
          # highlight-end
  ```

:::tip Blueprint key
Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
:::

### Ingest data into Port

To ingest Sentry objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Sentry.
3. Choose the **Ingest Data** option from the menu.
4. Select Sentry under the APM & alerting category.
5. Add the contents of your [integration configuration](#configuration-structure) to the editor.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Project

<details>
<summary>Project blueprint</summary>

```json showLineNumbers
{
  "identifier": "sentryProject",
  "title": "Sentry Project",
  "icon": "Sentry",
  "schema": {
    "properties": {
      "dateCreated": {
        "title": "Date Created",
        "type": "string",
        "format": "date-time"
      },
      "platform": {
        "type": "string",
        "title": "Platform"
      },
      "status": {
        "title": "Status",
        "type": "string",
        "enum": [
          "active",
          "disabled",
          "pending_deletion",
          "deletion_in_progress"
        ]
      },
      "link": {
        "title": "Link",
        "type": "string",
        "format": "url"
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

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
resources:
  - kind: project
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .slug
          title: .name
          blueprint: '"sentryProject"'
          properties:
            dateCreated: .dateCreated
            platform: .platform
            status: .status
            link: .organization.links.organizationUrl + "/projects/" + .name
```

</details>

### Issue

<details>
<summary>Issue blueprint</summary>

```json showLineNumbers
{
  "identifier": "sentryIssue",
  "title": "Sentry Issue",
  "icon": "Sentry",
  "schema": {
    "properties": {
      "link": {
        "title": "Link",
        "type": "string",
        "format": "url"
      },
      "status": {
        "title": "Status",
        "type": "string",
        "enum": [
          "resolved",
          "unresolved",
          "ignored",
          "reprocessing"
        ],
        "enumColors": {
          "resolved": "green",
          "unresolved": "red",
          "ignored": "lightGray",
          "reprocessing": "yellow"
        }
      },
      "isUnhandled": {
        "title": "isUnhandled",
        "type": "boolean"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "projectEnvironment": {
      "title": "Sentry Project",
      "target": "sentryProject",
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
- kind: issue
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: ".id"
          title: ".title"
          blueprint: '"sentryIssue"'
          properties:
            link: ".permalink"
            status: ".status"
            isUnhandled: ".isUnhandled"
          relations:
            project: ".project.slug"
```

</details>

### Project Environment

<details>
<summary>Project environment blueprint</summary>

```json showLineNumbers
{
  "identifier": "sentryProject",
  "title": "Sentry Project Environment",
  "icon": "Sentry",
  "schema": {
    "properties": {
      "dateCreated": {
        "title": "Date Created",
        "type": "string",
        "format": "date-time"
      },
      "platform": {
        "type": "string",
        "title": "Platform"
      },
      "status": {
        "title": "Status",
        "type": "string",
        "enum": [
          "active",
          "disabled",
          "pending_deletion",
          "deletion_in_progress"
        ]
      },
      "link": {
        "title": "Link",
        "type": "string",
        "format": "url"
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

<details>
<summary>Integration configuration</summary>

:::tip Environment tags
The`selector.tag` key in the `project-tag` kind defines which Sentry tag data is synced to Port. In the configuration provided below, you will ingest all `environment` tag from your Sentry account to Port. For instance, if a Sentry project has 3 environments namely development, staging and production, this configuration will create 3 entities in the `Sentry Project Environment` catalog. You will then use the `issue-tag` kind to connect each issue to its environment.
:::

```yaml showLineNumbers
- kind: project-tag
  selector:
    query: "true"
    tag: "environment"
  port:
    entity:
      mappings:
        identifier: .slug + "-" + .__tags.name
        title: .name + "-" + .__tags.name
        blueprint: '"sentryProject"'
        properties:
          dateCreated: .dateCreated
          platform: .platform
          status: .status
          link: .organization.links.organizationUrl + "/projects/" + .name

  - kind: issue-tag
    selector:
      query: "true"
      tag: "environment"
    port:
      entity:
        mappings:
          identifier: .id
          title: .title
          blueprint: '"sentryIssue"'
          properties:
            link: .permalink
            status: .status
            isUnhandled: .isUnhandled
          relations:
            projectEnvironment: '[(.project.slug as $slug | .__tags[] | "\($slug)-\(.name)")]'
```

</details>

## Let's Test It

This section includes a sample response data from Sentry. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Sentry:

<details>
<summary> Project response data</summary>

```json showLineNumbers
{
  "id": "4504931759095808",
  "slug": "python-fastapi",
  "name": "python-fastapi",
  "platform": "python-fastapi",
  "dateCreated": "2023-03-31T06:18:37.290732Z",
  "isBookmarked": false,
  "isMember": false,
  "features": [
    "alert-filters",
    "minidump",
    "race-free-group-creation",
    "similarity-indexing",
    "similarity-view",
    "span-metrics-extraction",
    "span-metrics-extraction-resource",
    "releases"
  ],
  "firstEvent": "2023-03-31T06:25:54.666640Z",
  "firstTransactionEvent": false,
  "access": [],
  "hasAccess": true,
  "hasMinifiedStackTrace": false,
  "hasMonitors": false,
  "hasProfiles": false,
  "hasReplays": false,
  "hasFeedbacks": false,
  "hasSessions": false,
  "isInternal": false,
  "isPublic": false,
  "avatar": {
    "avatarType": "letter_avatar",
    "avatarUuid": null
  },
  "color": "#913fbf",
  "status": "active",
  "organization": {
    "id": "4504931754901504",
    "slug": "test-org",
    "status": {
      "id": "active",
      "name": "active"
    },
    "name": "Test Org",
    "dateCreated": "2023-03-31T06:17:33.619189Z",
    "isEarlyAdopter": false,
    "require2FA": false,
    "requireEmailVerification": false,
    "avatar": {
      "avatarType": "letter_avatar",
      "avatarUuid": null,
      "avatarUrl": null
    },
    "features": [
      "performance-tracing-without-performance",
      "performance-consecutive-http-detector",
      "performance-large-http-payload-detector",
      "escalating-issues",
      "minute-resolution-sessions",
      "performance-issues-render-blocking-assets-detector",
      "event-attachments"
    ],
    "links": {
      "organizationUrl": "https://test-org.sentry.io",
      "regionUrl": "https://us.sentry.io"
    },
    "hasAuthProvider": false
  }
}
```

</details>

<details>
<summary> Issue response data</summary>

```json showLineNumbers
{
  "id": "4605173695",
  "shareId": "None",
  "shortId": "PYTHON-FASTAPI-2",
  "title": "ZeroDivisionError: division by zero",
  "culprit": "index",
  "permalink": "https://test-org.sentry.io/issues/4605173695/",
  "logger": "None",
  "level": "error",
  "status": "unresolved",
  "statusDetails": {},
  "substatus": "new",
  "isPublic": false,
  "platform": "python",
  "project": {
    "id": "4504931759095808",
    "name": "python-fastapi",
    "slug": "python-fastapi",
    "platform": "python-fastapi"
  },
  "type": "error",
  "metadata": {
    "value": "division by zero",
    "type": "ZeroDivisionError",
    "filename": "app.py",
    "function": "index",
    "display_title_with_tree_label": false,
    "in_app_frame_mix": "mixed"
  },
  "numComments": 0,
  "assignedTo": "None",
  "isBookmarked": false,
  "isSubscribed": false,
  "subscriptionDetails": "None",
  "hasSeen": false,
  "annotations": [],
  "issueType": "error",
  "issueCategory": "error",
  "isUnhandled": true,
  "count": "1",
  "userCount": 0,
  "firstSeen": "2023-11-06T08:31:27.058163Z",
  "lastSeen": "2023-11-06T08:31:27.058163Z",
  "stats": {
    "24h": [
      [1699174800, 0],
      [1699178400, 0],
      [1699182000, 0],
      [1699250400, 0],
      [1699254000, 0],
      [1699257600, 1]
    ]
  }
}
```

</details>

<details>
<summary> Project environment response data</summary>

```json showLineNumbers
{
   "id":"4504931759095808",
   "slug":"python-fastapi",
   "name":"python-fastapi",
   "platform":"python-fastapi",
   "dateCreated":"2023-03-31T06:18:37.290732Z",
   "isBookmarked":false,
   "isMember":false,
   "features":[
      "alert-filters",
      "minidump",
      "race-free-group-creation",
      "similarity-indexing",
      "similarity-view",
      "span-metrics-extraction",
      "span-metrics-extraction-resource",
      "releases"
   ],
   "firstEvent":"2023-03-31T06:25:54.666640Z",
   "firstTransactionEvent":false,
   "access":[
      
   ],
   "hasAccess":true,
   "hasMinifiedStackTrace":false,
   "hasMonitors":false,
   "hasProfiles":false,
   "hasReplays":false,
   "hasFeedbacks":false,
   "hasSessions":false,
   "isInternal":false,
   "isPublic":false,
   "avatar":{
      "avatarType":"letter_avatar",
      "avatarUuid":null
   },
   "color":"#913fbf",
   "status":"active",
   "organization":{
      "id":"4504931754901504",
      "slug":"pages-org",
      "status":{
         "id":"active",
         "name":"active"
      },
      "name":"Pages Org",
      "dateCreated":"2023-03-31T06:17:33.619189Z",
      "isEarlyAdopter":false,
      "require2FA":false,
      "requireEmailVerification":false,
      "avatar":{
         "avatarType":"letter_avatar",
         "avatarUuid":null,
         "avatarUrl":null
      },
      "links":{
         "organizationUrl":"https://pages-org.sentry.io",
         "regionUrl":"https://us.sentry.io"
      },
      "hasAuthProvider":false
   },
   "__tags":{
      "key":"environment",
      "name":"production",
      "value":"production",
      "count":10,
      "lastSeen":"2024-03-04T17:17:33Z",
      "firstSeen":"2024-03-04T17:14:22Z"
   }
}
```

</details>


### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Project entity in Port</summary>

```json showLineNumbers
{
  "identifier": "python-fastapi",
  "title": "python-fastapi",
  "icon": null,
  "blueprint": "sentryProject",
  "team": [],
  "properties": {
    "dateCreated": "2023-03-31T06:18:37.290732Z",
    "platform": "python-fastapi",
    "status": "active",
    "link": "https://test-org.sentry.io/projects/python-fastapi"
  },
  "relations": {},
  "createdAt": "2023-11-06T08:49:17.700Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-11-06T08:59:11.446Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Issue entity in Port</summary>

```json showLineNumbers
{
  "identifier": "4605173695",
  "title": "ZeroDivisionError: division by zero",
  "icon": null,
  "blueprint": "sentryIssue",
  "team": [],
  "properties": {
    "link": "https://test-org.sentry.io/issues/4605173695/",
    "status": "unresolved",
    "isUnhandled": true
  },
  "relations": {
    "project": "python-fastapi"
  },
  "createdAt": "2023-11-06T08:49:20.406Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-11-06T08:49:20.406Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Project environment entity in Port</summary>

```json showLineNumbers
{
  "identifier": "python-fastapi-production",
  "title": "python-fastapi-production",
  "icon": null,
  "blueprint": "sentryProject",
  "team": [],
  "properties": {
    "dateCreated": "2023-03-31T06:18:37.290732Z",
    "platform": "python-fastapi",
    "status": "active",
    "link": "https://test-org.sentry.io/projects/python-fastapi"
  },
  "relations": {},
  "createdAt": "2024-03-07T12:18:17.111Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-03-07T12:31:52.041Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

## Alternative installation via webhook

While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from Sentry. If so, use the following instructions:

<details>

<summary><b>Webhook installation (click to expand)</b></summary>

In this example you are going to create a webhook integration between [Sentry](https://sentry.io) and Port, which will ingest issues entities.

<h2>Port configuration</h2>

Create the following blueprint definition:

<details>

<summary>Sentry issue blueprint</summary>
<SentryIssuesBluePrint/>

</details>

Create the following webhook configuration [using Port UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints):

<details>

<summary>Sentry issue webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Sentry issue mapper`;
   2. Identifier : `sentry_issue_mapper`;
   3. Description : `A webhook configuration to map Sentry Issues to Port`;
   4. Icon : `Sentry`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <SentryIssuesConfiguration/>

3. Scroll down to **Advanced settings** and input the following details:
   1. Signature Header Name : `sentry-hook-signature`;
   2. Signature Algorithm : Select `sha256` from dropdown option;
   3. Click **Save** at the bottom of the page.

</details>

:::tip
We have left out the `secret` field from the security object in the webhook configuration because the secret value is generated by Sentry when creating the webhook.
So when following this example, please first create the webhook configuration in Port. Use the webhook URL from the response and create the webhook in Sentry.
After getting the secret from Sentry, you can go back to Port and update the [webhook configuration](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints) with the secret.
:::

<h2>Create a webhook in Sentry</h2>

1. Log in to Sentry with your organization's credentials;
2. Click the gear icon (Setting) at the left sidebar of the page;
3. Choose **Developer Settings**;
4. At the upper corner of this page, click on **Create New Integration**;
5. Sentry provides two types of integrations: Internal and Public. For the purpose of this guide, choose **Internal Integration** and click on the **Next** button;
6. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. `Webhook URL` - enter the value of the `url` key you received after creating the webhook configuration;
   3. `Overview` - enter a description for the webhook;
   4. `Permissions` - Grant your webhook **Read** permissions for the **Issue & Event** category;
   5. `Webhooks` - Under this section, enable the issues checkbox to allow Sentry to report issue events to Port;
7. Click **Save Changes** at the bottom of the page.

:::tip
Now that the webhook is created, you can take the secret value generated by Sentry and use it to update the `security` object in your Port webhook configuration
:::

<h2>Relate comments to Issues</h2>

The following example adds a `sentryComment` blueprint, in addition to the `sentryIssue` blueprint shown in the previous example. In addition, it also adds a `sentryIssue` relation. The webhook will create or update the relation between the 2 existing entities, allowing you to map which issue a comment is made on:

<details>

<summary>Sentry comments blueprint (including the sentryIssue relation)</summary>
<SentryCommentsBlueprint/>

</details>

Create the following webhook configuration [using Port UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints):

<details>

<summary>Sentry comments webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Sentry comment mapper`;
   2. Identifier : `sentry_comment_mapper`;
   3. Description : `A webhook configuration to map Sentry Comments to Port`;
   4. Icon : `Sentry`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <SentryCommentsConfiguration/>

3. Scroll down to **Advanced settings** and input the following details:
   1. Signature Header Name : `sentry-hook-signature`;
   2. Signature Algorithm : Select `sha256` from dropdown option;
   3. Click **Save** at the bottom of the page.

</details>

:::tip
In order to view the different payloads and events available in Sentry webhooks, [click here](https://docs.sentry.io/product/integrations/integration-platform/webhooks/)
:::

Done! any issue and comment in Sentry will trigger a webhook event. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2>Let's Test It</h2>

This section includes a sample webhook event sent from Sentry when an issue or comment is created. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

<h3>Payload</h3>

Here is an example of the payload structure sent to the webhook URL when a Sentry issue or comment is created:

<details>
<summary> Sentry issue webhook event payload</summary>

```json showLineNumbers
{
  "action": "created",
  "installation": {
    "uuid": "54a3e698-f389-4d86-b9f8-50093a228449"
  },
  "data": {
    "issue": {
      "id": "4253613038",
      "shareId": "None",
      "shortId": "PYTHON-B",
      "title": "NameError: name 'total' is not defined",
      "culprit": "__main__ in <module>",
      "permalink": "None",
      "logger": "None",
      "level": "error",
      "status": "unresolved",
      "statusDetails": {},
      "substatus": "new",
      "isPublic": false,
      "platform": "python",
      "project": {
        "id": "4504989602480128",
        "name": "python",
        "slug": "python",
        "platform": "python"
      },
      "type": "error",
      "metadata": {
        "value": "name 'total' is not defined",
        "type": "NameError",
        "filename": "sentry.py",
        "function": "<module>",
        "display_title_with_tree_label": false
      },
      "numComments": 0,
      "assignedTo": "None",
      "isBookmarked": false,
      "isSubscribed": false,
      "subscriptionDetails": "None",
      "hasSeen": false,
      "annotations": [],
      "issueType": "error",
      "issueCategory": "error",
      "isUnhandled": true,
      "count": "1",
      "userCount": 0,
      "firstSeen": "2023-06-15T17:10:09.914274Z",
      "lastSeen": "2023-06-15T17:10:09.914274Z"
    }
  },
  "actor": {
    "type": "application",
    "id": "sentry",
    "name": "Sentry"
  }
}
```

</details>

<details>
<summary> Sentry comment webhook event payload</summary>

```json showLineNumbers
{
  "action": "created",
  "installation": {
    "uuid": "d5a2de51-0138-496a-8e79-c17747c3a40d"
  },
  "data": {
    "comment_id": "1729635072",
    "issue_id": "4253613038",
    "project_slug": "python",
    "timestamp": "2023-06-15T17:15:53.383120Z",
    "comment": "Hello admin please take a look at this"
  },
  "actor": {
    "type": "user",
    "id": 2683666,
    "name": "user@domain.com"
  }
}
```

</details>

<h3>Mapping Result</h3>

The combination of the sample payload and the webhook configuration generates the following Port `sentryIssue` entity:

```json showLineNumbers
{
  "identifier": "4253613038",
  "title": "NameError: name 'total' is not defined",
  "blueprint": "sentryIssue",
  "properties": {
    "action": "created",
    "level": "error",
    "platform": "python",
    "status": "unresolved",
    "projectID": "4504989602480128"
  },
  "relations": {}
}
```

In addition, the following Port `sentryComment` entity will be generated:

```json showLineNumbers
{
  "identifier": "1729635072",
  "title": "Comment Event",
  "blueprint": "sentryComment",
  "properties": {
    "action": "created",
    "comment": "Hello admin please take a look at this",
    "project": "python",
    "issue_id": "4253613038",
    "timestamp": "2023-06-15T17:15:53.383120Z"
  },
  "relations": {
    "sentryIssue": "4253613038"
  }
}
```
</details>

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"

# Sentry

Our Sentry integration allows you to import `projects` and `issues` from your Sentry cloud account into Port, according to your mapping and definition.

A `Project` is essentially a container for all the data and information related to a specific application or service that you want to monitor.

An `Issue` is a group of incidents that describe the underlying problem of your symptoms.

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
| `integration.secrets.sentryToken`       | The Sentry API token token                                                                                    | ✅       |
| `integration.config.sentryHost`         | The Sentry host. For example https://sentry.io                                                                | ✅       |
| `integration.config.sentryOrganization` | The Sentry organization slug                                                                                  | ✅       |
| `scheduledResyncInterval`               | The number of minutes between each resync                                                                     | ❌       |
| `initializePortResources`               | Default true, When set to true the integration will create default blueprints and the port App config Mapping | ❌       |

<br/>

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install sentry port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \
	--set port.clientSecret="PORT_CLIENT_SECRET"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
	--set integration.identifier="sentry"  \
	--set integration.type="sentry"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.config.sentryHost="https://sentry.io"  \
	--set integration.secrets.sentryToken="string"  \
	--set integration.config.sentryOrganization="string"
```

</TabItem>

<TabItem value="one-time" label="Scheduled">
 <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Sentry integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                                         | Description                                                                                                        | Required |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN`        | The Sentry API token                                                                                               | ✅       |
| `OCEAN__INTEGRATION__CONFIG__SENTRY_HOST`         | The Sentry host. For example https://sentry.io                                                                     | ✅       |
| `OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION` | The Sentry organization slug                                                                                       | ✅       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`                | Default true, When set to false the integration will not create default blueprints and the port App config Mapping | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`                  | Change the identifier to describe your integration, if not set will use the default one                            | ❌       |
| `OCEAN__PORT__CLIENT_ID`                          | Your port client id                                                                                                | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                      | Your port client secret                                                                                            | ✅       |
| `OCEAN__PORT__BASE_URL`                           | Your port base url, relevant only if not using the default port app                                                | ❌       |

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
      - name: Run Sentry Integration
        run: |
          # Set Docker image and run the container
          integration_type="sentry"
          version="latest"

          image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

          docker run -i --rm --platform=linux/amd64 \
          -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
          -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
          -e OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN=${{ secrets.OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN }} \
          -e OCEAN__INTEGRATION__CONFIG__SENTRY_HOST=${{ secrets.OCEAN__INTEGRATION__CONFIG__SENTRY_HOST }} \
          -e OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION=${{ secrets.OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION }} \
          -e OCEAN__PORT__CLIENT_ID=${{ secrets.OCEAN__PORT__CLIENT_ID }} \
          -e OCEAN__PORT__CLIENT_SECRET=${{ secrets.OCEAN__PORT__CLIENT_SECRET }} \
          $image_name

          exit $?
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

| Parameter                                         | Description                                                                                                                                                      | Required |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN`        | The Sentry API token                                                                                                                                             | ✅       |
| `OCEAN__INTEGRATION__CONFIG__SENTRY_HOST`         | The Sentry host. For example https://sentry.io                                                                                                                   | ✅       |
| `OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION` | The Sentry organization slug                                                                                                                                     | ✅       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`                | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                               | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`                  | Change the identifier to describe your integration, if not set will use the default one                                                                          | ❌       |
| `OCEAN__PORT__CLIENT_ID`                          | Your port client id ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                      | Your port client secret ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials)) | ✅       |
| `OCEAN__PORT__BASE_URL`                           | Your port base url, relevant only if not using the default port app                                                                                              | ❌       |

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
  </Tabs>
</TabItem>

</Tabs>

### Event listener

The integration uses polling to pull the configuration from Port every minute and check it for changes. If there is a change, a resync will occur.

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
          blueprint: '"issue"'
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
            blueprint: '"project"'
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
  "identifier": "project",
  "title": "project",
  "icon": "Sentry",
  "schema": {
    "properties": {
      "dateCreated": {
        "title": "dateCreated",
        "type": "string",
        "format": "date-time"
      },
      "platform": {
        "type": "string",
        "title": "platform"
      },
      "status": {
        "title": "status",
        "type": "string",
        "enum": [
          "active",
          "disabled",
          "pending_deletion",
          "deletion_in_progress"
        ]
      },
      "link": {
        "title": "link",
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
          blueprint: '"project"'
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
  "identifier": "issue",
  "title": "issue",
  "icon": "Sentry",
  "schema": {
    "properties": {
      "link": {
        "title": "link",
        "type": "string",
        "format": "url"
      },
      "status": {
        "title": "status",
        "type": "string"
      },
      "isUnhandled": {
        "icon": "DefaultProperty",
        "title": "isUnhandled",
        "type": "boolean"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "project": {
      "title": "project",
      "target": "project",
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
- kind: issue
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: ".id"
          title: ".title"
          blueprint: '"issue"'
          properties:
            link: ".permalink"
            status: ".status"
            isUnhandled: ".isUnhandled"
          relations:
            project: ".project.slug"
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

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Project entity in Port</summary>

```json showLineNumbers
{
  "identifier": "python-fastapi",
  "title": "python-fastapi",
  "icon": null,
  "blueprint": "project",
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
  "blueprint": "issue",
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

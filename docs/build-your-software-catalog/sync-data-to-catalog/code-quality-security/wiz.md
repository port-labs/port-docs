import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '../../../generalTemplates/_ocean_advanced_configuration_note.md'

# Wiz

Our Wiz integration allows you to import `projects`, `issues`, `controls`, and `serviceTickets` from your Wiz account into Port, according to your mapping and definitions.

## Common use cases

- Map `projects`, `issues`, `controls`, and `serviceTickets` in your Wiz organization environment.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Create/delete Wiz objects using self-service actions.

## Prerequisites

<Prerequisites />

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                           | Description                                                                                                        | Required |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `port.clientId`                     | Your port client id                                                                                                | ✅       |
| `port.clientSecret`                 | Your port client secret                                                                                            | ✅       |
| `integration.identifier`            | Change the identifier to describe your integration                                                                 | ✅       |
| `integration.type`                  | The integration type                                                                                               | ✅       |
| `integration.eventListener.type`    | The event listener type                                                                                            | ✅       |
| `integration.secrets.wizClientId`   | The Wiz Client ID                                                                                                  | ✅       |
| `integration.secrets.wizClientSecret`| The Wiz Client Secret                                                                                             | ✅       |
| `integration.config.wizApiUrl`      | The Wiz API URL.                                                                                                   | ✅       |
| `integration.config.wizTokenUrl`    | The Wiz Token Authentication URL                                                                                   | ✅       |
| `integration.config.appHost`        | The host of the Port Ocean app. Used to set up the integration endpoint as the target for Webhooks created in Wiz  | ❌       |
| `integration.secret.wizWebhookToken`  | This is a password you create, that is used to verify webhook events to Port                                       | ❌       |
| `scheduledResyncInterval`           | The number of minutes between each resync                                                                          | ❌       |
| `initializePortResources`           | Default true, When set to true the integration will create default blueprints and the port App config Mapping      | ❌       |

<br/>

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-wiz-integration port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \
	--set port.clientSecret="PORT_CLIENT_SECRET"  \
	--set initializePortResources=true  \
	--set scheduledResyncInterval=120 \
	--set integration.identifier="my-wiz-integration"  \
	--set integration.type="wiz"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.secrets.wizClientId="WIZ_CLIENT_ID"  \
	--set integration.secrets.wizClientSecret="WIZ_CLIENT_SECRET" \
        --set integration.secrets.wizApiUrl="WIZ_API_URL"  \
	--set integration.config.wizTokenUrl="WIZ_TOKEN_URL"  \
        --set integration.config.wizWebhookToken="WIZ_WEBHOOK_TOKEN" 
```

</TabItem>

<TabItem value="one-time" label="Scheduled">
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Wiz integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                                     | Description                                                                                                        | Required |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_ID`     | The Wiz Client ID                                                                                                | ✅       |
| `OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_SECRET` | The Wiz Cient Secret                                                                                             | ✅       |
| `OCEAN__INTEGRATION__CONFIG__WIZ_API_URL`     | The Wiz API URL.                                                                                                   | ❌       |
| `OCEAN__INTEGRATION__CONFIG__WIZ_TOKEN_URL`     | The Wiz Token URL.                                                                                               | ❌       |
| `OCEAN__INTEGRATION__CONFIG__WIZ_WEBHOOK_TOKEN` | The token used to verify webhook requests into Port.                                                              | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Provide a unique identifier for your integration. If not provided, the default identifier will be used.            | ❌       |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id                                                                                                | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client secret                                                                                            | ✅       |
| `OCEAN__PORT__BASE_URL`                       | Your port base url, relevant only if not using the default port app                                                | ❌       |

<br/>

Here is an example for `wiz-integration.yml` workflow file:

```yaml showLineNumbers
name: Wiz Exporter Workflow

# This workflow responsible for running Wiz exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - name: Run Wiz Integration
        run: |
          # Set Docker image and run the container
          integration_type="wiz"
          version="latest"

          image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

          docker run -i --rm --platform=linux/amd64 \
          -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
          -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
          -e OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_ID=${{ secrets.OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_ID }} \
          -e OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_SECRET=${{ secrets.OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_SECRET }} \
          -e OCEAN__INTEGRATION__CONFIG__WIZ_API_URL=${{ secrets.OCEAN__INTEGRATION__CONFIG__WIZ_API_URL }} \
          -e OCEAN__INTEGRATION__CONFIG__WIZ_TOKEN_URL=${{ secrets.OCEAN__INTEGRATION__CONFIG__WIZ_TOKEN_URL }} \
          -e OCEAN__INTEGRATION__CONFIG__WIZ_WEBHOOK_TOKEN=${{ secrets.OCEAN__INTEGRATION__CONFIG__WIZ_WEBHOOK_TOKEN }} \
          -e OCEAN__PORT__CLIENT_ID=${{ secrets.OCEAN__PORT__CLIENT_ID }} \
          -e OCEAN__PORT__CLIENT_SECRET=${{ secrets.OCEAN__PORT__CLIENT_SECRET }} \
          $image_name

          exit $?
```

</TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Wiz integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Jenkins agent should be able to run docker commands.
:::
:::warning
If you want the integration to update Port in real time using webhooks you should use
the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
of `Secret Text` type:

| Parameter                                     | Description                                                                                                                                                      | Required |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_ID`   | The Wiz Client ID token                                                                                        | ✅       |
| `OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_SECRET` | The Wiz Client Secret                                                                                        | ✅       |
| `OCEAN__INTEGRATION__CONFIG__WIZ_API_URL`       | The Wiz API URL.                                                                                                 | ✅       |
| `OCEAN__INTEGRATION__CONFIG__WIZ_TOKEN_URL`     | The Wiz Token URL.                                                                                               | ✅       |
| `OCEAN__INTEGRATION__CONFIG__WIZ_WEBHOOK_TOKEN` | The token used to verify webhook requests into Port.                                                   | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Provide a unique identifier for your integration. If not provided, the default identifier will be used.        | ❌       |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials)) secret | ✅       |
| `OCEAN__PORT__BASE_URL`                       | Your port base url, relevant only if not using the default port app                                                                                              | ❌       |

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```text showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Wiz Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_ID', variable: 'OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_ID'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_SECRET', variable: 'OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_SECRET'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__WIZ_API_URL', variable: 'OCEAN__INTEGRATION__CONFIG__WIZ_API_URL'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__WIZ_TOKEN_URL', variable: 'OCEAN__INTEGRATION__CONFIG__WIZ_TOKEN_URL'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__WIZ_WEBHOOK_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__WIZ_WEBHOOK_TOKEN'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="wiz"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_ID=$OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_ID \
                                -e OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_SECRET=$OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_SECRET \
                                -e OCEAN__INTEGRATION__CONFIG__WIZ_API_URL=$OCEAN__INTEGRATION__CONFIG__WIZ_API_URL \
                                -e OCEAN__INTEGRATION__CONFIG__WIZ_TOKEN_URL=$OCEAN__INTEGRATION__CONFIG__WIZ_TOKEN_URL \
                                -e OCEAN__INTEGRATION__CONFIG__WIZ_WEBHOOK_TOKEN=$OCEAN__INTEGRATION__CONFIG__WIZ_WEBHOOK_TOKEN \
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

<AdvancedConfig/>

## Ingesting Wiz objects

The Wiz integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `project` data from Wiz:

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: project
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"wizProject"'
          identifier: .id
          title: .name
          properties:
            archived: .archived
            businessUnit: .businessUnit
            description: .description
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Wiz's API events.

### Configuration structure

The integration configuration determines which resources will be queried from Wiz, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Wiz, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Project`](https://integrate.wiz.io/reference/pull-projects)
- [`Issue`](https://integrate.wiz.io/reference/issues-tutorial)
- [`Control`](https://integrate.wiz.io/docs/welcome#controls)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: project
      selector:
      ...
  ```

- The `kind` key is a specifier for a Wiz object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: project
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: project
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-end
      port:
  ```

- The `port`, `entity` and the `mappings` keys are used to map the Wiz object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: project
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one Wiz object to a Port entity. Each value is a JQ query.
            identifier: .id
            title: .attributes.name
            blueprint: '"wizProject"'
            identifier: .id
            title: .name
            properties:
              archived: .archived
              businessUnit: .businessUnit
              description: .description
        # highlight-end
    - kind: project # In this instance project is mapped again with a different filter
      selector:
        query: '.name == "MyProjectName"'
      port:
        entity:
          mappings: ...
  ```

  :::tip Blueprint key
  Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

### Ingest data into Port

To ingest Wiz objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Wiz.
3. Choose the **Ingest Data** option from the menu.
4. Select Wiz under the Code quality & security providers category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Project

<details>
<summary>Project blueprint</summary>

```json showLineNumbers
{
  "identifier": "wizProject",
  "description": "This blueprint represents a wiz project",
  "title": "Wiz Project",
  "icon": "Box",
  "schema": {
    "properties": {
      "archived": {
        "type": "boolean",
        "title": "Archived?",
        "description": "Is the project archived?"
      },
      "businessUnit": {
        "type": "string",
        "title": "Business Unit",
        "description": "the business unit of the project"
      },
      "description": {
        "type": "string",
        "title": "Description",
        "description": "the project description"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "issues": {
      "target": "wizIssue",
      "title": "Issues",
      "description": "The issues affecting this project",
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
resources:
  - kind: project
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"wizProject"'
          identifier: .id
          title: .name
          properties:
            archived: .archived
            businessUnit: .businessUnit
            description: .description
```

</details>

### Control

<details>
<summary>Control blueprint</summary>

```json showLineNumbers
{
  "identifier": "wizControl",
  "description": "This blueprint represents a wiz source rule",
  "title": "Wiz Control",
  "icon": "Flag",
  "schema": {
    "properties": {
      "controlDescription": {
        "type": "string",
        "title": "Control Description",
        "description": "the control description"
      },
      "resolutionRecommendation": {
        "type": "string",
        "title": "Control Recommendation",
        "description": "the control recommendation on resolving issues"
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
  - kind: control
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"wizControl"'
          identifier: .id
          title: .name
          properties:
            controlDescription: .controlDescription
            resolutionRecommendation: .resolutionRecommendation
```

</details>

### Issue

<details>
<summary>Issue blueprint</summary>

```yaml showLineNumbers
{
  "identifier": "wizIssue",
  "description": "This blueprint represents a wiz issue",
  "title": "Wiz Issue",
  "icon": "Alert",
  "schema": {
    "properties": {
      "url": {
        "type": "string",
        "title": "Issue URL",
        "format": "url",
        "description": "the link to the issue"
      },
      "status": {
        "title": "Status",
        "type": "string",
        "enum": [
          "OPEN",
          "IN_PROGRESS",
          "RESOLVED",
          "REJECTED"
        ],
        "enumColors": {
          "OPEN": "blue",
          "IN_PROGRESS": "orange",
          "RESOLVED": "green",
          "REJECTED": "darkGray"
        }
      },
      "severity": {
        "title": "Severity",
        "type": "string",
        "enum": [
          "INFORMATIONAL",
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL"
        ],
        "enumColors": {
          "INFORMATIONAL": "blue",
          "LOW": "yellow",
          "MEDIUM": "orange",
          "HIGH": "red",
          "CRITICAL": "red"
        }
      },
      "type": {
        "title": "Type",
        "type": "string"
      },
      "vulnerability": {
        "title": "Vulnerability",
        "type": "object",
        "description": "The identified security risk"
      },
      "notes": {
        "title": "Notes",
        "type": "array"
      },
      "createdAt": {
        "title": "Created At",
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time"
      },
      "dueAt": {
        "title": "Due At",
        "type": "string",
        "format": "date-time"
      },
      "resolvedAt": {
        "title": "Resolved At",
        "type": "string",
        "format": "date-time"
      },
      "statusChangedAt": {
        "title": "Status ChangedAt",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "projects": {
      "target": "wizProject",
      "title": "Affected Projects",
      "description": "The projects affected by this issue",
      "required": false,
      "many": true
    },
    "serviceTickets": {
      "target": "wizServiceTicket",
      "title": "Service Tickets",
      "description": "The service tickets belonging to this issue",
      "required": false,
      "many": true
    },
    "control": {
      "target": "wizControl",
      "title": "Control",
      "description": "The control that flagged this issue",
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
resources:
  - kind: issue
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"wizIssue"'
          identifier: .id
          title: .entitySnapshot.name + " | " + .entitySnapshot.type
          properties:
            # https://integrate.wiz.io/reference/issues-query#:~:text=Direct%20a%20user%20to%20an%20Issue%20in%20Wiz
            url: .id as $id | "https://app.wiz.io/issues#~(issue~'" + $id + ")"
            status: .status
            severity: .severity
            type: .type
            notes: .notes
            vulnerability: .entitySnapshot
            createdAt: .createdAt
            updatedAt: .updatedAt
            statusChangedAt: .statusChangedAt
            resolvedAt: .resolvedAt
          relations:
            projects: .projects[].id
            serviceTickets: .serviceTickets[].externalId
            control: .sourceRule.id
```

</details>


### Service Ticket

<details>
<summary>Service Ticket blueprint</summary>

```yaml showLineNumbers
{
  "identifier": "wizServiceTicket",
  "description": "This blueprint represents a wiz service ticket",
  "title": "Wiz Service Ticket",
  "icon": "Book",
  "schema": {
    "properties": {
      "url": {
        "type": "string",
        "title": "Ticket URL",
        "format": "url",
        "description": "the service ticket URL"
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
  - kind: serviceTicket
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        blueprint: '"wizServiceTicket"'
        identifier: .externalId
        title: .name
        properties:
          url: .url
```

</details>
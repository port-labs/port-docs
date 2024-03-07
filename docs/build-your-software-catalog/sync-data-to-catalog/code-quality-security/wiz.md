import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_wiz-docker-parameters.mdx"
import AdvancedConfig from '../../../generalTemplates/\_ocean_advanced_configuration_note.md'
import WizBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/wiz/\_example_wiz_issue_blueprint.mdx";
import WizConfiguration from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/wiz/\_example_wiz_issue_webhook_configuration.mdx";

# Wiz

Our Wiz integration allows you to import `projects`, `issues`, `controls`, and `serviceTickets` from your Wiz account into Port, according to your mapping and definitions.

## Common use cases

- Map `projects`, `issues`, `controls`, and `serviceTickets` in your Wiz organization environment.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.

## Prerequisites

<Prerequisites />

Your Wiz credentials should have the `read:projects` and `read:issues` permission scopes. Visit the Wiz [documentation](https://integrate.wiz.io/reference/prerequisites) for a guide on how to get your credentials as well as set permissions.

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                                        | Description                                                                                                                                             | Required |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `port.clientId`                                  | Your port client id ([Get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `port.clientSecret`                              | Your port client secret ([Get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) | ✅       |
| `integration.identifier`                         | Change the identifier to describe your integration                                                                                                      | ✅       |
| `integration.type`                               | The integration type                                                                                                                                    | ✅       |
| `integration.eventListener.type`                 | The event listener type                                                                                                                                 | ✅       |
| `integration.secrets.wizClientId`                | The Wiz Client ID                                                                                                                                       | ✅       |
| `integration.secrets.wizClientSecret`            | The Wiz Client Secret                                                                                                                                   | ✅       |
| `integration.config.wizApiUrl`                   | The Wiz API URL.                                                                                                                                        | ✅       |
| `integration.config.wizTokenUrl`                 | The Wiz Token Authentication URL                                                                                                                        | ✅       |
| `integration.config.appHost`                     | The host of the Port Ocean app. Used to set up the integration endpoint as the target for Webhooks created in Wiz                                       | ❌       |
| `integration.secret.wizWebhookVerificationToken` | This is a password you create, that is used to verify webhook events to Port                                                                            | ❌       |
| `scheduledResyncInterval`                        | The number of minutes between each resync                                                                                                               | ❌       |
| `initializePortResources`                        | Default true, When set to true the integration will create default blueprints and the port App config Mapping                                           | ❌       |

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
	--set integration.config.wizTokenUrl="WIZ_TOKEN_URL"
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

<DockerParameters />

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

<DockerParameters />
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

<AzurePremise name="Wiz" />

<DockerParameters />

<br/>

Here is an example for `wiz-integration.yml` pipeline file:

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
      integration_type="wiz"
      version="latest"

      image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

      docker run -i --rm \
          -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
          -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
          -e OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_ID=${OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_ID} \
          -e OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_SECRET=${OCEAN__INTEGRATION__CONFIG__WIZ_CLIENT_SECRET} \
          -e OCEAN__INTEGRATION__CONFIG__WIZ_API_URL=${OCEAN__INTEGRATION__CONFIG__WIZ_API_URL} \
          -e OCEAN__INTEGRATION__CONFIG__WIZ_TOKEN_URL=${OCEAN__INTEGRATION__CONFIG__WIZ_TOKEN_URL} \
          -e OCEAN__PORT__CLIENT_ID=${OCEAN__PORT__CLIENT_ID} \
          -e OCEAN__PORT__CLIENT_SECRET=${OCEAN__PORT__CLIENT_SECRET} \
          $image_name

      exit $?
    displayName: "Ingest Data into Port"
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
      query: "true"
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
      query: "true"
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
      query: "true"
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
  "schema":
    {
      "properties":
        {
          "url":
            {
              "type": "string",
              "title": "Issue URL",
              "format": "url",
              "description": "the link to the issue",
            },
          "status":
            {
              "title": "Status",
              "type": "string",
              "enum": ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"],
              "enumColors":
                {
                  "OPEN": "blue",
                  "IN_PROGRESS": "orange",
                  "RESOLVED": "green",
                  "REJECTED": "darkGray",
                },
            },
          "severity":
            {
              "title": "Severity",
              "type": "string",
              "enum": ["INFORMATIONAL", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
              "enumColors":
                {
                  "INFORMATIONAL": "blue",
                  "LOW": "yellow",
                  "MEDIUM": "orange",
                  "HIGH": "red",
                  "CRITICAL": "red",
                },
            },
          "type": { "title": "Type", "type": "string" },
          "vulnerability":
            {
              "title": "Vulnerability",
              "type": "object",
              "description": "The identified security risk",
            },
          "notes": { "title": "Notes", "type": "array" },
          "createdAt":
            { "title": "Created At", "type": "string", "format": "date-time" },
          "updatedAt":
            { "title": "Updated At", "type": "string", "format": "date-time" },
          "dueAt":
            { "title": "Due At", "type": "string", "format": "date-time" },
          "resolvedAt":
            { "title": "Resolved At", "type": "string", "format": "date-time" },
          "statusChangedAt":
            {
              "title": "Status ChangedAt",
              "type": "string",
              "format": "date-time",
            },
        },
      "required": [],
    },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations":
    {
      "projects":
        {
          "target": "wizProject",
          "title": "Affected Projects",
          "description": "The projects affected by this issue",
          "required": false,
          "many": true,
        },
      "serviceTickets":
        {
          "target": "wizServiceTicket",
          "title": "Service Tickets",
          "description": "The service tickets belonging to this issue",
          "required": false,
          "many": true,
        },
      "control":
        {
          "target": "wizControl",
          "title": "Control",
          "description": "The control that flagged this issue",
          "required": false,
          "many": false,
        },
    },
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
resources:
  - kind: issue
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"wizIssue"'
          identifier: .id
          title: .entitySnapshot.name + " | " + .entitySnapshot.type
          properties:
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
  "schema":
    {
      "properties":
        {
          "url":
            {
              "type": "string",
              "title": "Ticket URL",
              "format": "url",
              "description": "the service ticket URL",
            },
        },
      "required": [],
    },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {},
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

## Alternative installation via webhook

While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from Wiz. If so, use the following instructions:

<details>

<summary><b>Webhook installation (click to expand)</b></summary>

In this example you are going to create a webhook integration between [Wiz](https://wiz.io/) and Port, which will ingest Wiz issue entities into Port.

<h2>Port configuration</h2>

Create the following blueprint definition:

<details>
<summary>Wiz issue blueprint</summary>

<WizBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>Wiz issue webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Wiz Mapper`;
   2. Identifier : `wiz_mapper`;
   3. Description : `A webhook configuration to map Wiz issues to Port`;
   4. Icon : `Box`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <WizConfiguration/>

</details>

<h2>Create a webhook in Wiz</h2>

1. Send an email to win@wiz.io requesting for access to the developer documentation or reach out to your Wiz account manager.
2. Follow this [guide](https://integrate.wiz.io/reference/webhook-tutorial#create-a-custom-webhook) in the documentation to create a webhook.

Done! Any issue created in Wiz will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

</details>

## Let's Test It

This section includes a sample response data from Wiz. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Wiz:

<details>
<summary>Project response data</summary>

```json showLineNumbers
{
  "id": "d6ac50bb-aec0-52fc-80ab-bacd7b02f178",
  "name": "Project1",
  "isFolder": false,
  "archived": false,
  "businessUnit": "Dev",
  "description": "Test project"
}
```

</details>

<details>
<summary>Control response data</summary>

```json showLineNumbers
{
  "__typename": "Control",
  "id": "9d7ef6e4-baed-47ba-99ec-a78a801f1e19",
  "name": "Publicly Exposed Assets with DataFindings ",
  "controlDescription": "",
  "resolutionRecommendation": "",
  "securitySubCategories": [
    {
      "title": "Data Security",
      "category": {
        "name": "8 Data Security",
        "framework": {
          "name": "Wiz"
        }
      }
    }
  ]
}
```

</details>

<details>
<summary>Issue response data</summary>

```json showLineNumbers
{
  "id": "fffedba9-587f-4251-8c96-d966c183f10c",
  "sourceRule": {
    "__typename": "Control",
    "id": "9d7ef6e4-baed-47ba-99ec-a78a801f1e19",
    "name": "Publicly Exposed Assets with DataFindings ",
    "controlDescription": "",
    "resolutionRecommendation": "",
    "securitySubCategories": [
      {
        "title": "Data Security",
        "category": {
          "name": "8 Data Security",
          "framework": {
            "name": "Wiz"
          }
        }
      }
    ]
  },
  "createdAt": "2023-08-23T07:56:09.903743Z",
  "updatedAt": "2023-09-12T08:33:16.327851Z",
  "dueAt": null,
  "type": "TOXIC_COMBINATION",
  "resolvedAt": "2023-08-30T08:17:54.613564Z",
  "statusChangedAt": "2023-08-30T08:17:54.613564Z",
  "projects": [
    {
      "id": "d6ac50bb-aec0-52fc-80ab-bacd7b02f178",
      "name": "Project1",
      "slug": "project1",
      "businessUnit": "Dev",
      "riskProfile": {
        "businessImpact": "MBI"
      }
    }
  ],
  "status": "RESOLVED",
  "severity": "HIGH",
  "entitySnapshot": {
    "id": "3d7dafdc-0087-55e0-81fd-a9e2b152fb47",
    "type": "DATA_FINDING",
    "nativeType": "",
    "name": "GDPR 2415",
    "status": null,
    "cloudPlatform": null,
    "cloudProviderURL": "",
    "providerId": "data##wizt-recEIECHXqlRPMZRw##wfke-jpb8-twwk-l7mm",
    "region": "",
    "resourceGroupExternalId": "",
    "subscriptionExternalId": "",
    "subscriptionName": "",
    "subscriptionTags": null,
    "tags": {},
    "externalId": "data##wizt-recEIECHXqlRPMZRw##wfke-jpb8-twwk-l7mm"
  },
  "serviceTickets": [],
  "notes": [
    {
      "createdAt": "2023-09-12T08:33:16.29091Z",
      "updatedAt": "2023-09-12T08:33:16.366971Z",
      "text": "test",
      "user": null,
      "serviceAccount": {
        "name": "bot-ise"
      }
    },
    {
      "createdAt": "2023-09-12T08:22:20.13926Z",
      "updatedAt": "2023-09-12T08:33:16.369728Z",
      "text": "test",
      "user": null,
      "serviceAccount": {
        "name": "bot-ise"
      }
    },
    {
      "createdAt": "2023-09-12T08:21:49.663314Z",
      "updatedAt": "2023-09-12T08:33:16.371541Z",
      "text": "test",
      "user": null,
      "serviceAccount": {
        "name": "bot-ise"
      }
    }
  ]
}
```

</details>

<details>
<summary>Service Ticket response data</summary>

```json showLineNumbers

```

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary><b>Project entity in Port(Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "d6ac50bb-aec0-52fc-80ab-bacd7b02f178",
  "title": "Project1",
  "blueprint": "wizProject",
  "team": [],
  "icon": "NewRelic",
  "properties": {
    "archived": false,
    "businessUnit": "Dev",
    "description": "Test project"
  },
  "createdAt": "2024-2-6T09:30:57.924Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-2-6T11:49:20.881Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary><b>Control entity in Port(Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "9d7ef6e4-baed-47ba-99ec-a78a801f1e19",
  "title": "Publicly Exposed Assets with DataFindings",
  "blueprint": "wizControl",
  "icon": "Flag",
  "properties": {
    "controlDescription": "",
    "resolutionRecommendation": ""
  },
  "createdAt": "2024-2-6T09:30:57.924Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-2-6T11:49:20.881Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary><b>Issue entity in Port(Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "fffedba9-587f-4251-8c96-d966c183f10c",
"title": "GDPR 2415 | DATA_FINDING",
"blueprint": "wizIssue",
"icon": "Alert",
"properties": {
  "url": "https://app.wiz.io/issues#~(issue~'fffedba9-587f-4251-8c96-d966c183f10c)",
  "status": "RESOLVED",
  "severity": "HIGH",
  "type": "TOXIC_COMBINATION",
  "notes": [],
  "vulnerability": {
    "id": "3d7dafdc-0087-55e0-81fd-a9e2b152fb47",
    "type": "DATA_FINDING",
    "nativeType": "",
    "name": "GDPR 2415",
    "status": null,
    "cloudPlatform": null,
    "cloudProviderURL": "",
    "providerId": "data##wizt-recEIECHXqlRPMZRw##wfke-jpb8-twwk-l7mm",
    "region": "",
    "resourceGroupExternalId": "",
    "subscriptionExternalId": "",
    "subscriptionName": "",
    "subscriptionTags": null,
    "tags": {},
    "externalId": "data##wizt-recEIECHXqlRPMZRw##wfke-jpb8-twwk-l7mm"
  },
  "createdAt": "2023-08-23T07:56:09.903743Z",
  "updatedAt": "2023-09-12T08:33:16.327851Z",
  "resolvedAt": "2023-08-30T08:17:54.613564Z",
  "statusChangedAt": "2023-08-30T08:17:54.613564Z",
},
"relations": {
  "projects": ["d6ac50bb-aec0-52fc-80ab-bacd7b02f178"],
  "serviceTickets": [],
  "control": "9d7ef6e4-baed-47ba-99ec-a78a801f1e19"
},
"createdAt": "2023-08-23T07:56:09.903743Z",
"createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
"updatedAt": "2023-09-12T08:33:16.327851Z",
"updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>
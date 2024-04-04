import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Dynatrace

Our Dyantrace integration allows you to import `problem`, `slo`, and `entity` resources from your Dynatrace instance into Port, according to your mapping and definition.

## Common use cases

- Map your monitored entities, problems and SLOs in Dynatrace.
- Watch for object changes (create/update) in real-time, and automatically apply the changes to your entities in Port.

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                             | Description                                                                                                                         | Required |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `port.clientId`                       | Your port [client id](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)     | ✅       |
| `port.clientSecret`                   | Your port [client secret](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials) | ✅       |
| `port.baseUrl`                        | Your port base url, relevant only if not using the default port app                                                                 | ❌       |
| `integration.identifier`              | Change the identifier to describe your integration                                                                                  | ✅       |
| `integration.type`                    | The integration type                                                                                                                | ✅       |
| `integration.eventListener.type`      | The event listener type                                                                                                             | ✅       |
| `integration.secrets.dynatraceApiKey` | API Key for Dynatrace instance                                                                                                      | ✅       |
| `integration.config.dynatraceHostUrl` | The API URL of the Dynatrace instance                                                                                                   | ✅       |
| `scheduledResyncInterval`             | The number of minutes between each resync                                                                                           | ❌       |
| `initializePortResources`             | Default true, When set to true the integration will create default blueprints and the port App config Mapping                       | ❌       |

<br/>

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-dynatrace-integration port-labs/port-ocean \
  --set port.clientId="CLIENT_ID"  \
  --set port.clientSecret="CLIENT_SECRET"  \
  --set initializePortResources=true  \
  --set scheduledResyncInterval=60  \
  --set integration.identifier="my-dynatrace-integration"  \
  --set integration.type="dynatrace"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.secrets.dynatraceApiKey="<your-api-key>"  \
  --set integration.config.dynatraceHostUrl="<your-isntance-url>"
```

</TabItem>

<TabItem value="one-time" label="Scheduled">
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Dynatrace integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                                        | Description                                                                                                        | Required |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY`  | The Dynatrace API key                                                                                              | ✅       |
| `OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL` | The Dynatrace API host URL                                                                                             | ✅       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`               | Default true, When set to false the integration will not create default blueprints and the port App config Mapping | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`                 | Change the identifier to describe your integration, if not set will use the default one                            | ❌       |
| `OCEAN__PORT__CLIENT_ID`                         | Your port client id                                                                                                | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                     | Your port client secret                                                                                            | ✅       |
| `OCEAN__PORT__BASE_URL`                          | Your port base url, relevant only if not using the default port app                                                | ❌       |

<br/>

Here is an example for `dynatrace-integration.yml` workflow file:

```yaml showLineNumbers
name: Dynatrace Exporter Workflow

# This workflow responsible for running Dynatrace exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with:
          type: 'dynatrace'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          config: |
            dynatrace_api_key: ${{ secrets.OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY }}
            dynatrace_host_url: ${{ secrets.OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Dynatrace integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Jenkins agent should be able to run docker commands.
:::
:::warning
If you want the integration to update Port in real time using webhooks you should use
the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
of `Secret Text` type:

| Parameter                                        | Description                                                                                                        | Required |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY`  | The Dynatrace API key                                                                                              | ✅       |
| `OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL` | The Dynatrace host URL                                                                                             | ✅       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`               | Default true, When set to false the integration will not create default blueprints and the port App config Mapping | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`                 | Change the identifier to describe your integration, if not set will use the default one                            | ❌       |
| `OCEAN__PORT__CLIENT_ID`                         | Your port client id                                                                                                | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                     | Your port client secret                                                                                            | ✅       |
| `OCEAN__PORT__BASE_URL`                          | Your port base url, relevant only if not using the default port app                                                | ❌       |

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```text showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Dynatrace Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY', variable: 'OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL', variable: 'OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="dynatrace"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY=$OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY \
                                -e OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL=$OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL \
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

### Generating Dynatrace API key

1. Navigate to `<instanceURL>/ui/apps/dynatrace.classic.tokens/ui/access-tokens`. For example, if you access your Dynatrace instance at `https://npm82883.apps.dynatrace.com`, you should navigate to `https://npm82883.apps.dynatrace.com/ui/apps/dynatrace.classic.tokens/ui/access-tokens`.
2. Click **Generate new token** to create a new token. Ensure the permissions: `DataExport`, `Read entities`, `Read problems` and `Read SLO` are assigned to the token. The `DataExport` permission allows Dynatrace to perform healthchecks before ingestion starts.

### Constructing Dynatrace Host URL
Your Dynatrace host URL should be `https://<environment-id>.live.dynatrace.com`. Note that there is a difference between the instance URL and the API host URL. The former contains `apps` while the latter (as shown prior) uses `live`. This means if your environment ID is `npm82883`, your API host URL should be `https://npm82883.live.dynatrace.com`.


## Ingesting Dynatrace objects

The Dynatrace integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `entity` data from Dynatrace:

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: entity
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .entityId
          title: .displayName
          blueprint: '"dynatraceEntity"'
          properties:
            firstSeen: ".firstSeenTms / 1000 | todate"
            lastSeen: ".lastSeenTms / 1000 | todate"
            type: .type
            tags: .tags[].stringRepresentation
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Dynatrace's API events.

### Configuration structure

The integration configuration determines which resources will be queried from Dynatrace, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Dynatrace, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`problem`](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/problems-v2/problems/get-problems-list#definition--Problem)
- [`entity`](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/entity-v2/get-entities-list#definition--Entity)
- [`slo`](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/service-level-objectives/get-all#definition--SLO)
- [`entity types`](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/entity-v2/get-entity-type#definition--EntityType) for selectors in the `entity` resource.

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: entity
      selector:
      ...
  ```

- The `kind` key is a specifier for an Dynatrace object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: entity
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: entity
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
        entityTypes: ["APPLICATION", "SERVICE"] # An optional list of entity types to filter by. If not specified, defaults to ["APPLICATION", "SERVICE"].
      # highlight-end
      port:
  ```

- The `port`, `entity` and the `mappings` keys are used to map the Dynatrace object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array:

  ```yaml showLineNumbers
  resources:
    - kind: entity
      selector:
        query: "true"
        entityTypes: ["APPLICATION", "SERVICE"]
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one Dynatrace object to a Port entity. Each value is a JQ query.
            identifier: .entityId
            title: .displayName
            blueprint: '"dynatraceEntity"'
            properties:
              firstSeen: ".firstSeenTms / 1000 | todate"
              lastSeen: ".lastSeenTms / 1000 | todate"
              type: .type
              tags: .tags[].stringRepresentation
              managementZones: .managementZones[].name
              properties: .properties
              fromRelationships: .fromRelationships
              toRelationships: .toRelationships
        # highlight-end
    - kind: entity # In this instance entity is mapped again with a different filter
      selector:
        query: '.displayName == "MyEntityName"'
        entityTypes: ["APPLICATION", "SERVICE"]
      port:
        entity:
          mappings: ...
  ```

  :::tip Blueprint key
  Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

## Configuring real-time updates

Currently, the Dynatrace API lacks support for programmatic webhook creation. To set up a webhook configuration in Dynatrace for sending alert notifications to the Ocean integration, follow these steps:

### Prerequisite

Prepare a webhook `URL` using this format: `{app_host}/integration/webhook/problem`. The `app_host` parameter should match the ingress or external load balancer where the integration will be deployed. For example, if your ingress or load balancer exposes the Dynatrace Ocean integration at `https://myservice.domain.com`, your webhook `URL` should be `https://myservice.domain.com/integration/webhook/problem`.

### Create a webhook in Dynatrace

1. Go to Dynatrace.
2. Go to **Settings** > **Integration** > **Problem notifications**.
3. Select **Add notification**.
4. Select **Custom integration** from the available notification types.
5. Configure the notification using the following details.
   1. `Enabled` - ensure the notification is enabled.
   2. `Display name` - use a meaningful name such as Port Ocean Webhook.
   3. `Webhook URL` - enter the value of the `URL` you created above.
   4. Enable **Call webhook is new events merge into existing problems**.
   5. `Custom payload` - paste the following configuration:
   ```
   {
       "State":"{State}",
       "ProblemID":"{ProblemID}",
       "ProblemTitle":"{ProblemTitle}"
   }
   ```
   You can customize to your taste, the only important thing is the `ProblemID` key. The webhook integration will not work without it.
   6. `Alerting profile` - select the corresponding alerting profile.
   7. Leave the rest of the fields as is.
6. Click **Save changes**.

### Ingest data into Port

To ingest Dynatrace objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Dynatrace.
3. Choose the **Ingest Data** option from the menu.
4. Select Dynatrace under the Incident Management category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Entity

<details>
<summary>Entity blueprint</summary>

```json showLineNumbers
{
  "identifier": "dynatraceEntity",
  "description": "This blueprint represents a Dynatrace Entity",
  "title": "Dynatrace Entity",
  "icon": "Dynatrace",
  "schema": {
    "properties": {
      "firstSeen": {
        "type": "string",
        "title": "First Seen",
        "description": "The timestamp at which the entity was first seen, in UTC milliseconds.",
        "format": "date-time"
      },
      "lastSeen": {
        "type": "string",
        "title": "Last Seen",
        "description": "The timestamp at which the entity was last seen, in UTC milliseconds.",
        "format": "date-time"
      },
      "type": {
        "type": "string",
        "title": "Type",
        "description": "The type of the entity."
      },
      "tags": {
        "type": "array",
        "title": "Tags",
        "description": "A list of tags of the entity.",
        "items": {
          "type": "string"
        }
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
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: entity
    selector:
      query: "true"
      entityTypes: ["APPLICATION", "SERVICE"] # An optional list of entity types to filter by. If not specified, defaults to ["APPLICATION", "SERVICE"].
    port:
      entity:
        mappings:
          identifier: .entityId
          title: .displayName
          blueprint: '"dynatraceEntity"'
          properties:
            firstSeen: ".firstSeenTms / 1000 | todate"
            lastSeen: ".lastSeenTms / 1000 | todate"
            type: .type
            tags: .tags[].stringRepresentation
```

</details>

### Problem

<details>
<summary> Problem blueprint</summary>

```json showlineNumbers
{
  "identifier": "dynatraceProblem",
  "description": "This blueprint represents a Dynatrace Problem",
  "title": "Dynatrace Problem",
  "icon": "Dynatrace",
  "schema": {
    "properties": {
      "entityTags": {
        "type": "array",
        "title": "Entity Tags",
        "description": "A list of all entity tags of the problem.",
        "items": {
          "type": "string"
        }
      },
      "evidenceDetails": {
        "type": "array",
        "title": "Evidence Details",
        "description": "A list of all evidence details of the problem.",
        "items": {
          "type": "string"
        }
      },
      "managementZones": {
        "type": "array",
        "title": "Management Zones",
        "description": "A list of all management zones that the problem belongs to.",
        "items": {
          "type": "string"
        }
      },
      "problemFilters": {
        "type": "array",
        "title": "Problem Filters",
        "description": "A list of alerting profiles that match the problem.",
        "items": {
          "type": "string"
        }
      },
      "severityLevel": {
        "type": "string",
        "title": "Severity Level",
        "description": "The severity level of the problem.",
        "enum": [
          "AVAILABILITY",
          "CUSTOM_ALERT",
          "ERROR",
          "INFO",
          "MONITORING_UNAVAILABLE",
          "PERFORMANCE",
          "RESOURCE_CONTENTION"
        ],
        "enumColors": {
          "AVAILABILITY": "blue",
          "CUSTOM_ALERT": "turquoise",
          "ERROR": "red",
          "INFO": "green",
          "MONITORING_UNAVAILABLE": "darkGray",
          "PERFORMANCE": "orange",
          "RESOURCE_CONTENTION": "yellow"
        }
      },
      "status": {
        "type": "string",
        "title": "Status",
        "description": "The status of the problem.",
        "enum": ["CLOSED", "OPEN"],
        "enumColors": {
          "CLOSED": "green",
          "OPEN": "red"
        }
      },
      "startTime": {
        "type": "string",
        "title": "Start Time",
        "description": "The start time of the problem, in UTC milliseconds.",
        "format": "date-time"
      },
      "endTime": {
        "type": "string",
        "title": "End Time",
        "description": "The end time of the problem, in UTC milliseconds.",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "impactedEntities": {
      "title": "Impacted Entities",
      "target": "dynatraceEntity",
      "required": false,
      "many": true
    },
    "linkedProblemInfo": {
      "title": "Linked Problem Info",
      "target": "dynatraceProblem",
      "required": false,
      "many": false
    },
    "rootCauseEntity": {
      "title": "Root Cause Entity",
      "target": "dynatraceEntity",
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
  - kind: problem
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .problemId
          title: .title
          blueprint: '"dynatraceProblem"'
          properties:
            entityTags: .entityTags[].stringRepresentation
            evidenceDetails: .evidenceDetails.details[].displayName
            managementZones: .managementZones[].name
            problemFilters: .problemFilters[].name
            severityLevel: .severityLevel
            status: .status
            startTime: ".startTime / 1000 | todate"
            endTime: ".endTime | if . == -1 then null else (./1000 | todate) end"
          relations:
            impactedEntities: .impactedEntities[].entityId.id
            linkedProblemInfo: .linkedProblemInfo.problemId
            rootCauseEntity: .rootCauseEntity.entityId.id
```

</details>

### SLO

<details>
<summary> SLO blueprint</summary>

```json showlineNumbers
{
  "identifier": "dynatraceSlo",
  "description": "This blueprint represents a Dynatrace SLO",
  "title": "Dynatrace SLO",
  "icon": "Dynatrace",
  "schema": {
    "properties": {
      "status": {
        "type": "string",
        "title": "Status",
        "description": "The status of the SLO.",
        "enum": ["FAILURE", "WARNING", "SUCCESS"],
        "enumColors": {
          "FAILURE": "red",
          "WARNING": "yellow",
          "SUCCESS": "green"
        }
      },
      "target": {
        "type": "number",
        "title": "Target",
        "description": "The target value of the SLO."
      },
      "enabled": {
        "type": "boolean",
        "title": "Enabled",
        "description": "Whether the SLO is enabled."
      },
      "warning": {
        "type": "number",
        "title": "Warning",
        "description": "The warning value of the SLO. At warning state the SLO is still fulfilled but is getting close to failure."
      },
      "error": {
        "type": "string",
        "title": "Error",
        "description": "The error of the SLO calculation. If the value differs from NONE, there is something wrong with the SLO calculation."
      },
      "errorBudget": {
        "type": "number",
        "title": "Error Budget",
        "description": "The error budget of the calculated SLO."
      },
      "evaluatedPercentage": {
        "type": "number",
        "title": "Evaluated Percentage",
        "description": "The calculated status value of the SLO."
      },
      "evaluationType": {
        "type": "string",
        "title": "Evaluation Type",
        "description": "The type of the SLO evaluation."
      },
      "filter": {
        "type": "string",
        "title": "Filter",
        "description": "The filter for the SLO evaluation."
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
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: slo
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"dynatraceSlo"'
          properties:
            status: .status
            target: .target
            enabled: .enabled
            warning: .warning
            error: .error
            errorBudget: .errorBudget
            evaluatedPercentage: .evaluatedPercentage
            evaluationType: .evaluationType
            filter: .filter
```

</details>

## Let's Test It

This section includes a sample response data from Dynatrace. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Dynatrace:

<details>
<summary>Entity response data</summary>

```json showLineNumbers
{
  "displayName": "my host",
  "entityId": "HOST-06F288EE2A930951",
  "firstSeenTms": 1574697667547,
  "fromRelationships": {
    "isInstanceOf": [
      {
        "id": "HOST_GROUP-0E489369D663A4BF",
        "type": "HOST_GROUP"
      }
    ]
  },
  "icon": {
    "customIconPath": "host",
    "primaryIconType": "linux",
    "secondaryIconType": "microsoft-azure-signet"
  },
  "lastSeenTms": 1588242361417,
  "managementZones": [
    {
      "id": "6239538939987181652",
      "name": "main app"
    }
  ],
  "properties": {
    "bitness": 64,
    "cpuCores": 8,
    "monitoringMode": "FULL_STACK",
    "networkZoneId": "aws.us.east01",
    "osArchitecture": "X86",
    "osType": "LINUX"
  },
  "tags": [
    {
      "context": "CONTEXTLESS",
      "key": "architecture",
      "stringRepresentation": "architecture:x86",
      "value": "x86"
    },
    {
      "context": "ENVIRONMENT",
      "key": "Infrastructure",
      "stringRepresentation": "[ENVIRONMENT]Infrastructure:Linux",
      "value": "Linux"
    }
  ],
  "toRelationships": {
    "isDiskOf": [
      {
        "id": "DISK-0393340DCA3853B0",
        "type": "DISK"
      }
    ]
  },
  "type": "HOST"
}
```

</details>

<details>
<summary>Problem response data</summary>

```json showLineNumbers
{
  "affectedEntities": [
    {
      "entityId": {
        "id": "string",
        "type": "string"
      },
      "name": "string"
    }
  ],
  "displayId": "string",
  "endTime": 1574697669865,
  "entityTags": [
    {
      "context": "CONTEXTLESS",
      "key": "architecture",
      "stringRepresentation": "architecture:x86",
      "value": "x86"
    },
    {
      "context": "ENVIRONMENT",
      "key": "Infrastructure",
      "stringRepresentation": "[ENVIRONMENT]Infrastructure:Linux",
      "value": "Linux"
    }
  ],
  "evidenceDetails": {
    "details": [
      {
        "displayName": "Availability evidence",
        "entity": {},
        "evidenceType": "AVAILABILITY_EVIDENCE",
        "groupingEntity": {},
        "rootCauseRelevant": true,
        "startTime": 1
      },
      {
        "displayName": "User action evidence",
        "entity": {},
        "evidenceType": "USER_ACTION_EVIDENCE",
        "groupingEntity": {},
        "rootCauseRelevant": true,
        "startTime": 1
      }
    ],
    "totalCount": 1
  },
  "impactAnalysis": {
    "impacts": [
      {
        "estimatedAffectedUsers": 1,
        "impactType": "APPLICATION",
        "impactedEntity": {}
      }
    ]
  },
  "impactLevel": "APPLICATION",
  "impactedEntities": [{}],
  "linkedProblemInfo": {
    "displayId": "string",
    "problemId": "string"
  },
  "managementZones": [
    {
      "id": "string",
      "name": "HOST"
    }
  ],
  "problemFilters": [
    {
      "id": "E2A930951",
      "name": "BASELINE"
    }
  ],
  "problemId": "06F288EE2A930951",
  "recentComments": {
    "comments": [
      {
        "authorName": "string",
        "content": "string",
        "context": "string",
        "createdAtTimestamp": 1,
        "id": "string"
      }
    ],
    "nextPageKey": "AQAAABQBAAAABQ==",
    "pageSize": 1,
    "totalCount": 1
  },
  "rootCauseEntity": {},
  "severityLevel": "AVAILABILITY",
  "startTime": 1574697667547,
  "status": "CLOSED",
  "title": "title"
}
```

</details>

<details>
<summary>SLO response data</summary>

```json showLineNumbers
{
  "burnRateMetricKey": "func:slo.errorBudgetBurnRate.payment_service_availability",
  "denominatorValue": 90,
  "description": "Rate of successful payments per week",
  "enabled": true,
  "error": "NONE",
  "errorBudget": 1.25,
  "errorBudgetBurnRate": {
    "burnRateType": "SLOW",
    "burnRateValue": 1.25,
    "burnRateVisualizationEnabled": true,
    "estimatedTimeToConsumeErrorBudget": 24,
    "fastBurnThreshold": 1.5,
    "sloValue": 95
  },
  "errorBudgetMetricKey": "func:slo.errorBudget.payment_service_availability",
  "evaluatedPercentage": 96.25,
  "evaluationType": "AGGREGATE",
  "filter": "type(\"SERVICE\")",
  "id": "123e4567-e89b-42d3-a456-556642440000",
  "metricDenominator": "builtin:service.requestCount.server",
  "metricExpression": "(100)*(builtin:service.errors.server.successCount:splitBy())/(builtin:service.requestCount.server:splitBy())",
  "metricKey": "func:slo.payment_service_availability",
  "metricNumerator": "builtin:service.errors.server.successCount",
  "metricRate": "builtin:service.successes.server.rate",
  "name": "Payment service availability",
  "normalizedErrorBudgetMetricKey": "func:slo.normalizedErrorBudget.payment_service_availability",
  "numeratorValue": 80,
  "problemFilters": "[type(\"SERVICE\")]",
  "relatedOpenProblems": 1,
  "relatedTotalProblems": 1,
  "status": "WARNING",
  "target": 95,
  "timeframe": "-1d",
  "useRateMetric": true,
  "warning": 97.5
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary>Entity entity in Port</summary>

```json showLineNumbers
{
  "identifier": "HOST-06F288EE2A930951",
  "title": "my host",
  "blueprint": "dynatraceEntity",
  "team": [],
  "icon": "Dynatrace",
  "properties": {
    "firstSeen": "2019-11-25T14:14:27Z",
    "lastSeen": "2020-04-30T14:52:41Z",
    "type": "HOST",
    "tags": ["architecture:x86", "[ENVIRONMENT]Infrastructure:Linux"]
  },
  "relations": {},
  "createdAt": "2024-2-6T09:30:57.924Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-2-6T11:49:20.881Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary>Problem entity in Port</summary>

```json showLineNumbers
{
  "identifier": "06F288EE2A930951",
  "title": "title",
  "blueprint": "dynatraceProblem",
  "team": [],
  "icon": "Dynatrace",
  "properties": {
    "entityTags": ["architecture:x86", "[ENVIRONMENT]Infrastructure:Linux"],
    "evidenceDetails": ["Availability evidence", "User action evidence"],
    "managementZones": ["HOST"],
    "problemFilters": ["BASELINE"],
    "severityLevel": "AVAILABILITY",
    "status": "CLOSED",
    "startTime": "2019-11-25T14:14:27Z",
    "endTime": "2020-04-30T14:52:41Z"
  },
  "relations": {
    "impactedEntities": ["HOST-06F288EE2A930951"],
    "linkedProblemInfo": "06F288EE2A930951",
    "rootCauseEntity": "HOST-06F288EE2A930951"
  },
  "createdAt": "2024-2-6T09:30:57.924Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-2-6T11:49:20.881Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary>SLO entity in Port</summary>

```json showLineNumbers
{
  "identifier": "123e4567-e89b-42d3-a456-556642440000",
  "title": "Payment service availability",
  "blueprint": "dynatraceSlo",
  "team": [],
  "icon": "Dynatrace",
  "properties": {
    "status": "WARNING",
    "target": 95,
    "enabled": true,
    "warning": 97.5,
    "error": "NONE",
    "errorBudget": 1.25,
    "evaluatedPercentage": 96.25,
    "evaluationType": "AGGREGATE",
    "filter": "type(\"SERVICE\")"
  },
}
```
</details>
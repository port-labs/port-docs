import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# New relic

Our Newrelic integration allows you to import `entities` and `issues` from your Newrelic cloud account into Port, according to your mapping and definition.

An `Entity` can be a host, an application, a service, a database, or any other component that sends data to New Relic.  
An `Issue` is a group of incidents that describe the underlying problem of your symptoms.

## Common use cases

- Map your monitored applications and services in New Relic with their current open alerts.
- Watch for new alerts and updates raised on your monitored applications and automatically synchronize them into Port.

## Installation

Install the integration via Helm by running this command:

:::note
If you are using new relic's EU region, add the following flag to the command:

`--set integration.config.newRelicGraphqlURL="https://api.eu.newrelic.com/graphql"`
:::

```bash showLineNumbers
# The following script will install an Ocean integration at your K8s cluster using helm
# initializePortResources: When set to true the integration will create default blueprints + JQ Mappings
# scheduledResyncInterval: the number of minutes between each resync
# integration.identifier: Change the identifier to describe your integration

helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-newrelic-integration port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \
	--set port.clientSecret="PORT_CLIENT_SECRET"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
  --set scheduledResyncInterval=120 \
	--set integration.identifier="my-newrelic-integration"  \
	--set integration.type="newrelic"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.secrets.newRelicAPIKey="<NR_API_KEY>"  \
	--set-string integration.secrets.newRelicAccountID=<NR_ACCOUNT_ID>
```

### Event listener

The integration uses polling to pull the configuration from Port every minute and check it for changes. If there is a change, a resync will occur.

## Ingesting Newrelic objects

The Newrelic integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `Issue` data from Newrelic:

```yaml showLineNumbers
resources:
  - kind: newRelicAlert
    selector:
      query: "true"
      newRelicTypes: ["ISSUE"]
    port:
      entity:
        mappings:
          blueprint: '"newRelicAlert"'
          identifier: .issueId
          title: .title[0]
          properties:
            priority: .priority
            state: .state
            sources: .sources
            conditionName: .conditionName
            alertPolicyNames: .policyName
            activatedAt: .activatedAt
          relations:
            newRelicService: .__APPLICATION.entity_guids + .__SERVICE.entity_guids
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Newrelic's API events.

### Configuration structure

The integration configuration determines which resources will be queried from Newrelic, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Newrelic, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Entity`](https://docs.newrelic.com/docs/new-relic-solutions/new-relic-one/core-concepts/what-entity-new-relic/)
- [`Issue`](https://docs.newrelic.com/docs/alerts-applied-intelligence/new-relic-alerts/get-started/alerts-ai-overview-page/#issues)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: project
      selector:
      ...
  ```

- The `kind` key is a specifier for a Newrelic object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: project
        selector:
        ...
  ```

- The `selector` key allows you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: newRelicService
      selector:
        query: "true"
        newRelicTypes: ["SERVICE", "APPLICATION"]
        calculateOpenIssueCount: true
        entityQueryFilter: "type in ('SERVICE','APPLICATION')"
        entityExtraPropertiesQuery: |
          ... on ApmApplicationEntityOutline {
            guid
            name
          }
  ```

  - **newRelicTypes** - An array of Newrelic entity types that will be fetched. The default value is ['SERVICE', 'APPLICATION']. This is related to the type field in the Newrelic entity.
  - **calculateOpenIssueCount:**
    - A boolean value that indicates if the integration should calculate the number of open issues for each entity. The default value is `false``.
    - **NOTE** - This can cause a performance degradation as the integration will have to calculate the number of open issues for each entity, which unfortunately is not supported by the New Relic API.
  - **entityQueryFilter:**
    - A filter that will be applied to the New Relic API query. This will be placed inside the `query` field of the `entitySearch` query in the New Relic GraphQL API. For examples of query filters [click here](https://docs.newrelic.com/docs/apis/nerdgraph/examples/nerdgraph-entities-api-tutorial/#search-query).
    - Not specifying this field will cause the integration to fetch all the entities and map them to the blueprint defined in the `kind`.
    - Rule of thumb - Most of the time the `EntityQueryFilter` will be the same as the `NewRelicTypes`. For example, if we want to fetch all the services and applications we will set the `EntityQueryFilter` to `type in ('SERVICE','APPLICATION')` and the `NewRelicTypes` to `['SERVICE', 'APPLICATION']`.
  - **entityExtraPropertiesQuery:**
    - An optional property that allows defining extra properties to fetch for each Newrelic entity. This will be concatenated with the default query properties we are requesting under the `entities` section in the `entitySearch` query in the Newrelic GraphQL API. For examples of additional query properties [click here](https://docs.newrelic.com/docs/apis/nerdgraph/examples/nerdgraph-entities-api-tutorial/#apm-summary).

- The `port`, `entity` and the `mappings` keys are used to map the Newrelic object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: newRelicAlert
      selector:
        query: "true"
        newRelicTypes: ["ISSUE"]
      port:
        # highlight-start
        entity:
          mappings:
            blueprint: '"newRelicAlert"'
            identifier: .issueId
            title: .title[0]
            properties:
              priority: .priority
              state: .state
              sources: .sources
              conditionName: .conditionName
              alertPolicyNames: .policyName
              activatedAt: .activatedAt
            relations:
              newRelicService: .__APPLICATION.entity_guids + .__SERVICE.entity_guids
        # highlight-end
    - kind: newRelicAlert # In this instance project is mapped again with a different filter
      selector:
        query: '.name == "MyIssuetName"'
      port:
        entity:
          mappings: ...
  ```

  :::tip Blueprint key
  Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

### Tags

Some Newrelic `entities` have a property named `tags` which contains potentially useful information such as machine information, hostname, agent name & version, and more. For example:

```json showLineNumbers
"tags": [
  {
    "key": "coreCount",
    "values": [
      "10"
    ]
  },
  {
    "key": "hostStatus",
    "values": [
      "running"
    ]
  },
]
```

Before mapping, this integration performs a tranformation on each `tag`, after which the example above would look like this:

```json showLineNumbers
tags = ["coreCount":"10","hostStatus":"running"]
```

### Ingest data into Port

To ingest Newrelic objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Newrelic.
3. Choose the **Ingest Data** option from the menu.
4. Select Newrelic under the APM & alerting category.
5. Add the contents of your [integration configuration](#configuration-structure) to the editor.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Service (Entity)

<details>
<summary>Service blueprint</summary>

```json showLineNumbers
{
  "identifier": "newRelicService",
  "description": "This blueprint represents a New Relic service or application in our software catalog",
  "title": "New Relic Service",
  "icon": "NewRelic",
  "schema": {
    "properties": {
      "has_apm": {
        "title": "Has APM",
        "type": "boolean"
      },
      "open_issues_count": {
        "title": "Open Issues Count",
        "type": "number",
        "default": 0
      },
      "link": {
        "title": "Link",
        "type": "string",
        "format": "url"
      },
      "reporting": {
        "title": "Reporting",
        "type": "boolean"
      },
      "tags": {
        "title": "Tags",
        "type": "object"
      },
      "account_id": {
        "title": "Account ID",
        "type": "string"
      },
      "type": {
        "title": "Type",
        "type": "string"
      },
      "domain": {
        "title": "Domain",
        "type": "string"
      },
      "throughput": {
        "title": "Throughput",
        "type": "number"
      },
      "response_time_avg": {
        "title": "Response Time AVG",
        "type": "number"
      },
      "error_rate": {
        "title": "Error Rate",
        "type": "number"
      },
      "instance_count": {
        "title": "Instance Count",
        "type": "number"
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
- kind: newRelicService
  selector:
    query: "true"
    newRelicTypes: ["SERVICE", "APPLICATION"]
    calculateOpenIssueCount: true
    entityQueryFilter: "type in ('SERVICE','APPLICATION')"
    entityExtraPropertiesQuery: |
      ... on ApmApplicationEntityOutline {
        guid
        name
        alertSeverity
        applicationId
        apmBrowserSummary {
          ajaxRequestThroughput
          ajaxResponseTimeAverage
          jsErrorRate
          pageLoadThroughput
          pageLoadTimeAverage
        }
        apmSummary {
          apdexScore
          errorRate
          hostCount
          instanceCount
          nonWebResponseTimeAverage
          nonWebThroughput
          responseTimeAverage
          throughput
          webResponseTimeAverage
          webThroughput
        }
      }
  port:
    entity:
      mappings:
        blueprint: '"newRelicService"'
        identifier: .guid
        title: .name
        properties:
          has_apm: 'if .domain | contains("APM") then "true" else "false" end'
          link: .permalink
          open_issues_count: .__open_issues_count
          reporting: .reporting
          tags: .tags
          domain: .domain
          type: .type
```

</details>

### Issue

<details>
<summary>Issue blueprint</summary>

```json showLineNumbers
{
  "identifier": "newRelicAlert",
  "description": "This blueprint represents a New Relic alert in our software catalog",
  "title": "New Relic Alert",
  "icon": "NewRelic",
  "schema": {
    "properties": {
      "priority": {
        "type": "string",
        "title": "Priority",
        "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
        "enumColors": {
          "CRITICAL": "red",
          "HIGH": "red",
          "MEDIUM": "yellow",
          "LOW": "green"
        }
      },
      "state": {
        "type": "string",
        "title": "State",
        "enum": ["ACTIVATED", "CLOSED", "CREATED"],
        "enumColors": {
          "ACTIVATED": "yellow",
          "CLOSED": "green",
          "CREATED": "lightGray"
        }
      },
      "trigger": {
        "type": "string",
        "title": "Trigger"
      },
      "sources": {
        "type": "array",
        "title": "Sources"
      },
      "alertPolicyNames": {
        "type": "array",
        "title": "Alert Policy Names"
      },
      "conditionName": {
        "type": "array",
        "title": "Condition Name"
      },
      "activatedAt": {
        "type": "string",
        "title": "Time Issue was activated"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "newRelicService": {
      "title": "New Relic Service",
      "target": "newRelicService",
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
- kind: newRelicAlert
  selector:
    query: "true"
    newRelicTypes: ["ISSUE"]
  port:
    entity:
      mappings:
        blueprint: '"newRelicAlert"'
        identifier: .issueId
        title: .title[0]
        properties:
          priority: .priority
          state: .state
          sources: .sources
          conditionName: .conditionName
          alertPolicyNames: .policyName
          activatedAt: .activatedAt
        relations:
          newRelicService: .__APPLICATION.entity_guids + .__SERVICE.entity_guids
```

</details>

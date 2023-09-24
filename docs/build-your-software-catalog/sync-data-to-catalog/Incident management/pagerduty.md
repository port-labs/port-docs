import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Pagerduty

Our Pagerduty integration allows you to import `services` and `incidents` from your Pagerduty account into Port, according to your mapping and definitions.

## Common use cases

- Map `services` and `incidents` in your Pagerduty organization environment.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.

## installation

Install the integration via Helm by running this command:

```bash showLineNumbers
# The following script will install an Ocean integration at your K8s cluster using helm
# initializePortResources: When set to true the integration will create default blueprints + JQ Mappings
# scheduledResyncInterval: the number of minutes between each resync
# integration.identifier: Change the identifier to describe your integration
# integration.secrets.token: PagerDuty API token
# integration.config.apiUrl: Pagerduty api url. If not specified, the default will be https://api.pagerduty.com

helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-pagerduty-integration port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \
	--set port.clientSecret="PORT_CLIENT_SECRET"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
  --set scheduledResyncInterval=120 \
	--set integration.identifier="my-pagerduty-integration"  \
	--set integration.type="pagerduty"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.secrets.token="string"  \
	--set integration.config.apiUrl="string"
```

## Ingesting Pagerduty objects

The Pagerduty integration uses a YAML configuration to describe the process of loading data into the developer portal. See [examples](#examples) below.

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Pagerduty's API events.

### Configuration structure

The integration configuration determines which resources will be queried from Pagerduty, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Pagerduty, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Service`](https://developer.pagerduty.com/api-reference/e960cca205c0f-list-services)
- [`Incident`](https://developer.pagerduty.com/api-reference/9d0b4b12e36f9-list-incidents)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: service
      selector:
      ...
  ```

- The `kind` key is a specifier for a Pagerduty object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: service
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: service
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-end
      port:
  ```

- The `port`, `entity` and the `mappings` keys are used to map the Pagerduty object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: service
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one Pagerduty object to a Port entity. Each value is a JQ query.
            identifier: .id
            title: .name
            blueprint: '"pagerdutyService"'
            properties:
              status: .status
        # highlight-end
    - kind: service # In this instance service is mapped again with a different filter
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

To ingest Pagerduty objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Pagerduty.
3. Choose the **Ingest Data** option from the menu.
4. Select Pagerduty under the Incident management category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Service

<details>
<summary>Service blueprint</summary>

```json showLineNumbers
{
  "identifier": "pagerdutyService",
  "description": "This blueprint represents a PagerDuty service in our software catalog",
  "title": "PagerDuty Service",
  "icon": "pagerduty",
  "schema": {
    "properties": {
      "status": {
        "title": "Status",
        "type": "string"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {
    "service": {
      "title": "Service URL",
      "calculation": "'https://api.pagerduty.com/services/' + .identifier",
      "type": "string",
      "format": "url"
    }
  },
  "relations": {}
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
resources:
  - kind: services
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"pagerdutyService"'
          properties:
            status: .status
```

</details>

### Incident

<details>
<summary>Incident blueprint</summary>

```json showLineNumbers
{
  "identifier": "pagerdutyIncident",
  "description": "This blueprint represents a PagerDuty incident in our software catalog",
  "title": "PagerDuty Incident",
  "icon": "pagerduty",
  "schema": {
    "properties": {
      "status": {
        "type": "string",
        "title": "Incident Status",
        "enum": [
          "triggered",
          "annotated",
          "acknowledged",
          "reassigned",
          "escalated",
          "reopened",
          "resolved"
        ]
      },
      "url": {
        "type": "string",
        "format": "url",
        "title": "Incident URL"
      },
      "urgency": {
        "type": "string",
        "title": "Incident Urgency",
        "enum": ["high", "low"]
      },
      "responder": {
        "type": "string",
        "title": "Assignee"
      },
      "escalation_policy": {
        "type": "string",
        "title": "Escalation Policy"
      },
      "created_at": {
        "title": "Create At",
        "type": "string",
        "format": "date-time"
      },
      "updated_at": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "pagerdutyService": {
      "title": "PagerDuty Service",
      "target": "pagerdutyService",
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
  - kind: incidents
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .title
          blueprint: '"pagerdutyIncident"'
          properties:
            status: .status
            url: .self
            urgency: .urgency
            responder: .assignments[0].assignee.summary
            escalation_policy: .escalation_policy.summary
            created_at: .created_at
            updated_at: .updated_at
          relations:
            pagerdutyService: .service.id
```

</details>

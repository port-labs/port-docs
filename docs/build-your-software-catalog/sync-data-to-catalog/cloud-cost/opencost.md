import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# OpenCost

Our OpenCost integration allows you to import `cost` from your OpenCost account into Port, according to your mapping and definition.

## Common use cases

- Map your monitored Kubernetes resources and cost allocations in OpenCost.

## installation

Install the integration via Helm by running this command:

```bash showLineNumbers
# The following script will install an Ocean integration in your K8s cluster using helm
# integration.identifier: Change the identifier to describe your integration
# integration.config.opencostHost: The URL of you OpenCost server. Used to make API calls
# integration.config.window: Duration of time over which to query. Accepts words like today, week, month, yesterday, lastweek, lastmonth. Durations like 30m, 12h, 7d are also accepted by the API. If none is provided, it defaults to today

helm upgrade --install my-opencost-integration port-labs/port-ocean \
	--set port.clientId="CLIENT_ID"  \
	--set port.clientSecret="CLIENT_SECRET"  \
	--set initializePortResources=true  \
	--set integration.identifier="my-opencost-integration"  \
	--set integration.type="opencost"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.config.opencostHost="https://example.com"
```

## Ingesting OpenCost objects

The OpenCost integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `cost` data from OpenCost:

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: cost
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"openCostResourceAllocation"'
          identifier: .name
          title: .name
          properties:
            cluster: .properties.cluster
            namespace: .properties.namespace
            startDate: .start
            endDate: .end
            cpuCoreHours: .cpuCoreHours
            cpuCost: .cpuCost
            cpuEfficiency: .cpuEfficiency
            gpuHours: .gpuHours
            gpuCost: .gpuCost
            networkCost: .networkCost
            loadBalancerCost: .loadBalancerCost
            pvCost: .pvCost
            ramBytes: .ramBytes
            ramCost: .ramCost
            ramEfficiency: .ramEfficiency
            sharedCost: .sharedCost
            externalCost: .externalCost
            totalCost: .totalCost
            totalEfficiency: .totalEfficiency
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from OpenCost's API events.

### Configuration structure

The integration configuration determines which resources will be queried from OpenCost, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from OpenCost, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Cost`](https://www.opencost.io/docs/integrations/api-examples)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: cost
      selector:
      ...
  ```

- The `kind` key is a specifier for an OpenCost object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: cost
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: cost
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-end
      port:
  ```

- The `port`, `entity` and the `mappings` keys are used to map the OpenCost object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: cost
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one OpenCost object to a Port entity. Each value is a JQ query.
            identifier: .name
            title: .name
            blueprint: '"openCostResourceAllocation"'
            properties:
              cluster: .properties.cluster
              namespace: .properties.namespace
              startDate: .start
              endDate: .end
              cpuCoreHours: .cpuCoreHours
              cpuCost: .cpuCost
              cpuEfficiency: .cpuEfficiency
              gpuHours: .gpuHours
              gpuCost: .gpuCost
              networkCost: .networkCost
              loadBalancerCost: .loadBalancerCost
              pvCost: .pvCost
              ramBytes: .ramBytes
              ramCost: .ramCost
              ramEfficiency: .ramEfficiency
              sharedCost: .sharedCost
              externalCost: .externalCost
              totalCost: .totalCost
              totalEfficiency: .totalEfficiency
        # highlight-end
    - kind: cost # In this instance cost is mapped again with a different filter
      selector:
        query: '.name == "MyNodeName"'
      port:
        entity:
          mappings: ...
  ```

  :::tip Blueprint key
  Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

### Ingest data into Port

To ingest OpenCost objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using OpenCost.
3. Choose the **Ingest Data** option from the menu.
4. Select OpenCost under the Cloud cost providers category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Cost

<details>
<summary>Cost blueprint</summary>

```json showLineNumbers
{
  "identifier": "openCostResourceAllocation",
  "description": "This blueprint represents an OpenCost resource allocation in our software catalog",
  "title": "OpenCost Resource Allocation",
  "icon": "Cluster",
  "schema": {
    "properties": {
      "cluster": {
        "type": "string",
        "title": "Cluster"
      },
      "namespace": {
        "type": "string",
        "title": "Namespace"
      },
      "startDate": {
        "title": "Start Date",
        "type": "string",
        "format": "date-time"
      },
      "endDate": {
        "title": "End Date",
        "type": "string",
        "format": "date-time"
      },
      "cpuCoreHours": {
        "title": "CPU Core Hours",
        "type": "number"
      },
      "cpuCost": {
        "title": "CPU Cost",
        "type": "number"
      },
      "cpuEfficiency": {
        "title": "CPU Efficiency",
        "type": "number"
      },
      "gpuHours": {
        "title": "GPU Hours",
        "type": "number"
      },
      "gpuCost": {
        "title": "GPU Cost",
        "type": "number"
      },
      "networkCost": {
        "title": "Network Cost",
        "type": "number"
      },
      "loadBalancerCost": {
        "title": "Load Balancer Cost",
        "type": "number"
      },
      "pvCost": {
        "title": "PV Cost",
        "type": "number"
      },
      "ramBytes": {
        "title": "RAM Bytes",
        "type": "number"
      },
      "ramCost": {
        "title": "RAM Cost",
        "type": "number"
      },
      "ramEfficiency": {
        "title": "RAM Efficiency",
        "type": "number"
      },
      "sharedCost": {
        "title": "Shared Cost",
        "type": "number"
      },
      "externalCost": {
        "title": "External Cost",
        "type": "number"
      },
      "totalCost": {
        "title": "Total Cost",
        "type": "number"
      },
      "totalEfficiency": {
        "title": "Total Efficiency",
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
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: cost
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"openCostResourceAllocation"'
          identifier: .name
          title: .name
          properties:
            cluster: .properties.cluster
            namespace: .properties.namespace
            startDate: .start
            endDate: .end
            cpuCoreHours: .cpuCoreHours
            cpuCost: .cpuCost
            cpuEfficiency: .cpuEfficiency
            gpuHours: .gpuHours
            gpuCost: .gpuCost
            networkCost: .networkCost
            loadBalancerCost: .loadBalancerCost
            pvCost: .pvCost
            ramBytes: .ramBytes
            ramCost: .ramCost
            ramEfficiency: .ramEfficiency
            sharedCost: .sharedCost
            externalCost: .externalCost
            totalCost: .totalCost
            totalEfficiency: .totalEfficiency
```

</details>

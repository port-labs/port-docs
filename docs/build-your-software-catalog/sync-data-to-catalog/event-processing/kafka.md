import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"

# Kafka

Our Kafka integration allows you to import `brokers` and `topics` from your Kafka `clusters` into Port, according to your mapping and definition.

## Common use cases

- Map brokers and topics in your Kafka clusters.
- Watch for object changes (create/update/delete) on schedule, and automatically apply the changes to your entities in Port.
- Create/delete Kafka objects using self-service actions.

## Prerequisites

<Prerequisites />

## installation

Install the integration via Helm by running this command:

```bash showLineNumbers
# The following script will install an Ocean integration at your K8s cluster using helm
# initializePortResources: When set to true the integration will create default blueprints + JQ Mappings
# integration.identifier: Change the identifier to describe your integration
# integration.secrets.clusterConfMapping: Mapping of Kafka cluster names to Kafka client config. example: {"local":{"bootstrap.servers": "localhost:9092"}}
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install kafka port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \
	--set port.clientSecret="PORT_CLIENT_SECRET"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
	--set scheduledResyncInterval=60  \
	--set integration.identifier="my-kafka-integration"  \
	--set integration.type="kafka"  \
	--set integration.eventListener.type="POLLING"  \
	--set-json integration.secrets.clusterConfMapping='{"local": {"bootstrap.servers": "localhost:9092"}}'
```

## Ingesting Kafka objects

The Kafka integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `cluster` data from Kafka:

```yaml showLineNumbers
createMissingRelatedEntities: false
deleteDependentEntities: true
resources:
  - kind: cluster
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .name
          title: .name
          blueprint: '"cluster"'
          properties:
            controllerId: .controller_id
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Kafka metadata objects.

### Configuration structure

The integration configuration determines which resources will be queried from Kafka, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Kafka, it is possible to reference any field that appears in the examples below for the mapping configuration.

<details>
<summary>Cluster example</summary>

```json showLineNumbers
{
  "name": "local",
  "controller_id": "1"
}
```

</details>

<details>
<summary>Broker example</summary>

```json showLineNumbers
{
  "id": "1",
  "address": "localhost:9092/1",
  "cluster_name": "local",
  "config": {"key": "value", ...}
}
```

</details>

<details>
<summary>Topic example</summary>

```json showLineNumbers
{
  "name": "_consumer_offsets",
  "cluster_name": "local",
  "partitions": [
    {
      "id": 0,
      "leader": 2,
      "replicas": [2, 1, 3],
      "isrs": [3, 2, 1]
    }
  ],
  "config": {"key": "value", ...}
}
```

</details>

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: cluster
      selector:
      ...
  ```

- The `kind` key is a specifier for a Kafka object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: cluster
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: cluster
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-end
      port:
  ```

- The `port`, `entity` and the `mappings` keys are used to map the Kafka object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: cluster
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one Kafka cluster to a Port entity. Each value is a JQ query.
            identifier: .name
            title: .name
            blueprint: '"cluster"'
            properties:
              controllerId: .controller_id
        # highlight-end
    - kind: cluster # In this instance cluster is mapped again with a different filter
      selector:
        query: '.name == "MyClusterName"'
      port:
        entity:
          mappings: ...
  ```

  :::tip Blueprint key
  Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

### Ingest data into Port

To ingest Kafka objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Kafka.
3. Choose the **Ingest Data** option from the menu.
4. Select Kafka under the Event Processing providers category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Cluster

<details>
<summary>Cluster blueprint</summary>

```json showLineNumbers
{
  "identifier": "cluster",
  "title": "Cluster",
  "icon": "Kafka",
  "schema": {
    "properties": {
      "controllerId": {
        "title": "Controller ID",
        "type": "string"
      }
    }
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: false
deleteDependentEntities: true
resources:
  - kind: cluster
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .name
          title: .name
          blueprint: '"cluster"'
          properties:
            controllerId: .controller_id
```

</details>

### Broker

<details>
<summary>Broker blueprint</summary>

```json showLineNumbers
{
  "identifier": "broker",
  "title": "Broker",
  "icon": "Kafka",
  "schema": {
    "properties": {
      "address": {
        "title": "Address",
        "type": "string"
      },
      "region": {
        "title": "Region",
        "type": "string"
      },
      "version": {
        "title": "Version",
        "type": "string"
      },
      "config": {
        "title": "Config",
        "type": "object"
      }
    }
  },
  "relations": {
    "cluster": {
      "target": "cluster",
      "required": true,
      "many": false
    }
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: false
deleteDependentEntities: true
resources:
  - kind: broker
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .cluster_name + "_" + (.id | tostring)
          title: .cluster_name + " " + (.id | tostring)
          blueprint: '"broker"'
          properties:
            address: .address
            region: .config."broker.rack"
            version: .config."inter.broker.protocol.version"
            config: .config
          relations:
            cluster: .cluster_name
```

</details>

### Topic

<details>
<summary>Topic blueprint</summary>

```json showLineNumbers
{
  "identifier": "topic",
  "title": "Topic",
  "icon": "Kafka",
  "schema": {
    "properties": {
      "replicas": {
        "title": "Replicas",
        "type": "number"
      },
      "partitions": {
        "title": "Partitions",
        "type": "number"
      },
      "compaction": {
        "title": "Compaction",
        "type": "boolean"
      },
      "retention": {
        "title": "Retention",
        "type": "boolean"
      },
      "deleteRetentionTime": {
        "title": "Delete Retention Time",
        "type": "number"
      },
      "partitionsMetadata": {
        "title": "Partitions Metadata",
        "type": "array"
      },
      "config": {
        "title": "Config",
        "type": "object"
      }
    }
  },
  "relations": {
    "cluster": {
      "target": "cluster",
      "required": true,
      "many": false
    },
    "brokers": {
      "target": "broker",
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
createMissingRelatedEntities: false
deleteDependentEntities: true
resources:
  - kind: topic
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .cluster_name + "_" + .name
          title: .cluster_name + " " + .name
          blueprint: '"topic"'
          properties:
            replicas: .partitions[0].replicas | length
            partitions: .partitions | length
            compaction: .config."cleanup.policy" | contains("compact")
            retention: .config."cleanup.policy" | contains("delete")
            deleteRetentionTime: .config."delete.retention.ms"
            partitionsMetadata: .partitions
            config: .config
          relations:
            cluster: .cluster_name
            brokers: '[.cluster_name + "_" + (.partitions[].replicas[] | tostring)] | unique'
```

</details>

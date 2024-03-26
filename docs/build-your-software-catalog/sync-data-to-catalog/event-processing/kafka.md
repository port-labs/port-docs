import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '../../../generalTemplates/_ocean_advanced_configuration_note.md'
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_kafka_one_time_docker_params.mdx"
import HelmParameters from "../templates/\_ocean-advanced-parameters-helm.mdx"


# Kafka

Our Kafka integration allows you to import `brokers` and `topics` from your Kafka `clusters` into Port, according to your mapping and definition.

## Common use cases

- Map brokers and topics in your Kafka clusters.
- Watch for object changes (create/update/delete) on schedule, and automatically apply the changes to your entities in Port.
- Create/delete Kafka objects using self-service actions.

## Prerequisites

<Prerequisites />

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                                | Description                                                                                                                                | Example                          | Required |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | -------- |
| `port.clientId`                          | Your port [client id](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)            |                                  | ✅       |
| `port.clientSecret`                      | Your port [client secret](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)        |                                  | ✅       |
| `integration.secrets.clusterConfMapping` | The Mapping of Kafka cluster names to Kafka client config  |  | ✅       |


<HelmParameters/>

<br/>
<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
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
</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-kafka-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `KAFKA_CLUSTER_CONFIG_MAPPING`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-kafka-integration
  type: kafka
  eventListener:
    type: POLLING
  secrets:
  // highlight-next-line
    clusterConfMapping: KAFKA_CLUSTER_CONFIG_MAPPING
```
<br/>

2. Install the `my-ocean-kafka-integration` ArgoCD Application by creating the following `my-ocean-kafka-integration.yaml` manifest:
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
  name: my-ocean-kafka-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-kafka-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-kafka-integration/values.yaml
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
kubectl apply -f my-ocean-kafka-integration.yaml
```
</TabItem>
</Tabs>

</TabItem>

<TabItem value="one-time" label="Scheduled">

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Kafka integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters/>

<br/>

Here is an example for `kafka-integration.yml` workflow file:

```yaml showLineNumbers
name: Kafka Exporter Workflow

# This workflow responsible for running Kafka exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with:
          type: 'kafka'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          config: |
            cluster_conf_mapping: ${{ secrets.OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Kafka integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Jenkins agent should be able to run docker commands.
:::
:::warning
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
        stage('Run Kafka Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING', variable: 'OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="kafka"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING=$OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING \
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
<AzurePremise name="Kafka" />

<DockerParameters />

<br/>

Here is an example for `kafka-integration.yml` pipeline file:

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
    integration_type="kafka"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING=${OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING} \
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

<AdvancedConfig/>

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
          blueprint: '"kafkaCluster"'
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
            blueprint: '"kafkaCluster"'
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
  "identifier": "kafkaCluster",
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
          blueprint: '"kafkaCluster"'
          properties:
            controllerId: .controller_id
```

</details>

### Broker

<details>
<summary>Broker blueprint</summary>

```json showLineNumbers
{
  "identifier": "kafkaBroker",
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
      "target": "kafkaCluster",
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
          blueprint: '"kafkaBroker"'
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
  "identifier": "kafkaTopic",
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
      "target": "kafkaCluster",
      "required": true,
      "many": false
    },
    "brokers": {
      "target": "kafkaBroker",
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
          blueprint: '"kafkaTopic"'
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

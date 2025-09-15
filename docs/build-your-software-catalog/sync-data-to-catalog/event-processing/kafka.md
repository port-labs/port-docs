import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '../../../generalTemplates/_ocean_advanced_configuration_note.md'
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_kafka_one_time_docker_params.mdx"
import HelmParameters from "../templates/\_ocean-advanced-parameters-helm.mdx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"
import MetricsAndSyncStatus from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_metrics_and_sync_status.mdx"
import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"


# Kafka

Port's Kafka integration allows you to model Kafka resources in your software catalog and ingest data into them.

## Overview

- Map and organize your desired Kafka resources and their metadata in Port (see supported resources below).
- Watch for Kafka object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.


## Setup

Choose one of the following installation methods:  
Not sure which method is right for your use case? Check the available [installation methods](/build-your-software-catalog/sync-data-to-catalog/#installation-methods).

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)" default>

<IntegrationVersion integration="kafka" />

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2> Prerequisites </h2>

<Prerequisites />


For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Kafka" />


<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-kafka-integration` in your git repository with the content:

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


    <details>
      <summary>ArgoCD Application</summary>

      :::info Replace placeholders
        - Replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL` with your actual values.
      :::

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
        targetRevision: 0.9.5
        helm:
          valueFiles:
          - $values/argocd/my-ocean-kafka-integration/values.yaml
          // highlight-start
          parameters:
            - name: port.clientId
              value: YOUR_PORT_CLIENT_ID
            - name: port.clientSecret
              value: YOUR_PORT_CLIENT_SECRET
            - name: port.baseUrl
              value: https://api.getport.io
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

    <PortApiRegionTip/>

    </details>


3. Apply your application manifest with `kubectl`:

    ```bash
    kubectl apply -f my-ocean-kafka-integration.yaml
    ```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                                | Description                                                                                                                                                                                                                                                                                    | Example | Required |
|------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|----------|
| `port.clientId`                          | Your port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                                  |         | ✅        |
| `port.clientSecret`                      | Your port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                              |         | ✅        |
| `port.baseUrl`                           | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                        |         | ✅        |
| `integration.secrets.clusterConfMapping` | JSON object mapping Kafka cluster names to their client configurations. Each cluster config should include `bootstrap.servers`, `security.protocol`, and authentication details. See [Cluster configuration examples](#cluster-config-mapping-examples) for detailed examples. |         | ✅        |
| `integration.eventListener.type`         | The event listener type. Read more about [event listeners](https://ocean.getport.io/framework/features/event-listener)                                                                                                                                                                         |         | ✅        |
| `integration.type`                       | The integration to be installed                                                                                                                                                                                                                                                                |         | ✅        |
| `scheduledResyncInterval`                | The number of minutes between each resync. When not set the integration will resync for each event listener resync event. Read more about [scheduledResyncInterval](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) |         | ❌        |
| `initializePortResources`                | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources)       |         | ❌        |
| `sendRawDataExamples`                    | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                            |         | ❌        |


</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the Kafka integration once and then exit, this is useful for **scheduled** ingestion of data.



  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters/>

<br/>

Here is an example for `kafka-integration.yml` workflow file:

```yaml showLineNumbers
name: Kafka Exporter Workflow

on:
  workflow_dispatch:
  schedule:
    - cron: '0 */1 * * *' # Determines the scheduled interval for this workflow. This example runs every hour.

jobs:
  run-integration:
    runs-on: ubuntu-latest
    timeout-minutes: 30 # Set a time limit for the job

    steps:
      - uses: port-labs/ocean-sail@v1
        with:
          type: 'kafka'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            cluster_conf_mapping: ${{ secrets.OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">

:::tip
Your Jenkins agent should be able to run docker commands.
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
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING=$OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING \
                                -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
                                -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
                                -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
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

<AzurePremise  />

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
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING=$(OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING) \
        -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
        -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $image_name

    exit $?
  displayName: 'Ingest Data into Port'

```

</TabItem>
<TabItem value="gitlab" label="GitLab">

Make sure to [configure the following GitLab variables](https://docs.gitlab.com/ee/ci/variables/#for-a-project):

<DockerParameters />

<br/>


Here is an example for `.gitlab-ci.yml` pipeline file:

```yaml showLineNumbers
default:
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  before_script:
    - docker info
    
variables:
  INTEGRATION_TYPE: kafka
  VERSION: latest

stages:
  - ingest

ingest_data:
  stage: ingest
  variables:
    IMAGE_NAME: ghcr.io/port-labs/port-ocean-$INTEGRATION_TYPE:$VERSION
  script:
    - |
      docker run -i --rm --platform=linux/amd64 \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING=$OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING \
        -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
        -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $IMAGE_NAME

  rules: # Run only when changes are made to the main branch
    - if: '$CI_COMMIT_BRANCH == "main"'
```

</TabItem>
  </Tabs>

<PortApiRegionTip/>

</TabItem>

</Tabs>

<AdvancedConfig/>

### Cluster config mapping examples

The `clusterConfMapping` parameter is crucial for connecting to your Kafka clusters. 
The cluster configuration mapping should be a JSON object with cluster names as keys and Kafka client configurations as values. Each client configuration follows the standard Kafka client properties format.

Below are some examples of how to configure the `clusterConfMapping` parameter for different Kafka cluster configurations.

<h4> Basic SASL_SSL authentication </h4>

For clusters with SASL authentication over SSL:

<details>
<summary><b>Basic SASL_SSL authentication (click to expand)</b></summary>

<Tabs groupId="config-format" queryString="config-format">
<TabItem value="helm-argocd" label="Helm/ArgoCD" default>

```yaml showLineNumbers
integration:
  secrets:
    clusterConfMapping: |
      {
        "production-cluster": {
          "bootstrap.servers": "broker1:9092,broker2:9092,broker3:9092",
          "security.protocol": "SASL_SSL",
          "sasl.mechanism": "SCRAM-SHA-256",
          "sasl.username": "your-username",
          "sasl.password": "your-password"
        },
        "staging-cluster": {
          "bootstrap.servers": "staging-broker1:9092,staging-broker2:9092",
          "security.protocol": "SASL_SSL",
          "sasl.mechanism": "SCRAM-SHA-256",
          "sasl.username": "staging-username",
          "sasl.password": "staging-password"
        }
      }
```

</TabItem>
<TabItem value="ci-cd" label="CI/CD Environment Variable">

```bash showLineNumbers
export OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING='{
  "production-cluster": {
    "bootstrap.servers": "broker1:9092,broker2:9092,broker3:9092",
    "security.protocol": "SASL_SSL",
    "sasl.mechanism": "SCRAM-SHA-256",
    "sasl.username": "your-username",
    "sasl.password": "your-password"
  },
  "staging-cluster": {
    "bootstrap.servers": "staging-broker1:9092,staging-broker2:9092",
    "security.protocol": "SASL_SSL",
    "sasl.mechanism": "SCRAM-SHA-256",
    "sasl.username": "staging-username",
    "sasl.password": "staging-password"
  }
}'
```

</TabItem>
</Tabs>

</details>

<h4> Plain text authentication </h4>

For clusters without SSL encryption:

<details>
<summary><b>Plain text authentication (click to expand)</b></summary>

<Tabs groupId="config-format" queryString="config-format">
<TabItem value="helm-argocd" label="Helm/ArgoCD" default>

```yaml showLineNumbers
integration:
  secrets:
    clusterConfMapping: |
      {
        "internal-cluster": {
          "bootstrap.servers": "internal-broker1:9092,internal-broker2:9092",
          "security.protocol": "SASL_PLAINTEXT",
          "sasl.mechanism": "PLAIN",
          "sasl.username": "internal-username",
          "sasl.password": "internal-password"
        }
      }
```

</TabItem>
<TabItem value="ci-cd" label="CI/CD Environment Variable">

```bash showLineNumbers
export OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING='{
  "internal-cluster": {
    "bootstrap.servers": "internal-broker1:9092,internal-broker2:9092",
    "security.protocol": "SASL_PLAINTEXT",
    "sasl.mechanism": "PLAIN",
    "sasl.username": "internal-username",
    "sasl.password": "internal-password"
  }
}'
```

</TabItem>
</Tabs>

</details>

<h4> mTLS authentication </h4>

For clusters with mutual TLS authentication:

<details>
<summary><b>mTLS authentication (click to expand)</b></summary>

<Tabs groupId="config-format" queryString="config-format">
<TabItem value="helm-argocd" label="Helm/ArgoCD" default>

```yaml showLineNumbers
integration:
  secrets:
    clusterConfMapping: |
      {
        "secure-cluster": {
          "bootstrap.servers": "secure-broker1:9092,secure-broker2:9092",
          "security.protocol": "SSL",
          "ssl.ca.location": "/path/to/ca-cert.pem",
          "ssl.certificate.location": "/path/to/client-cert.pem",
          "ssl.key.location": "/path/to/client-key.pem",
          "ssl.key.password": "key-password"
        }
      }
```

</TabItem>
<TabItem value="ci-cd" label="CI/CD Environment Variable">

```bash showLineNumbers
export OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING='{
  "secure-cluster": {
    "bootstrap.servers": "secure-broker1:9092,secure-broker2:9092",
    "security.protocol": "SSL",
    "ssl.ca.location": "/path/to/ca-cert.pem",
    "ssl.certificate.location": "/path/to/client-cert.pem",
    "ssl.key.location": "/path/to/client-key.pem",
    "ssl.key.password": "key-password"
  }
}'
```

</TabItem>
</Tabs>

</details>

<h4> Confluent cloud configuration </h4>

For Confluent Cloud clusters:

<details>
<summary><b>Confluent cloud configuration (click to expand)</b></summary>

<Tabs groupId="config-format" queryString="config-format">
<TabItem value="helm-argocd" label="Helm/ArgoCD" default>

```yaml showLineNumbers
integration:
  secrets:
    clusterConfMapping: |
      {
        "confluent-cloud-cluster": {
          "bootstrap.servers": "pkc-abcd85.us-west-2.aws.confluent.cloud:9092",
          "security.protocol": "SASL_SSL",
          "sasl.mechanism": "PLAIN",
          "sasl.username": "your-api-key",
          "sasl.password": "your-api-secret"
        }
      }
```

</TabItem>
<TabItem value="ci-cd" label="CI/CD Environment Variable">

```bash showLineNumbers
export OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING='{
  "confluent-cloud-cluster": {
    "bootstrap.servers": "pkc-abcd85.us-west-2.aws.confluent.cloud:9092",
    "security.protocol": "SASL_SSL",
    "sasl.mechanism": "PLAIN",
    "sasl.username": "your-api-key",
    "sasl.password": "your-api-secret"
  }
}'
```

</TabItem>
</Tabs>

</details>

<h4> Advanced configuration with custom properties </h4>

For clusters requiring additional custom properties:

<details>
<summary><b>Advanced configuration with custom properties (click to expand)</b></summary>

<Tabs groupId="config-format" queryString="config-format">
<TabItem value="helm-argocd" label="Helm/ArgoCD" default>

```yaml showLineNumbers
integration:
  secrets:
    clusterConfMapping: |
      {
        "advanced-cluster": {
          "bootstrap.servers": "broker1:9092,broker2:9092,broker3:9092",
          "security.protocol": "SASL_SSL",
          "sasl.mechanism": "SCRAM-SHA-512",
          "sasl.username": "advanced-username",
          "sasl.password": "advanced-password",
          "ssl.ca.location": "/path/to/ca-cert.pem",
          "ssl.endpoint.identification.algorithm": "https",
          "request.timeout.ms": 30000,
          "session.timeout.ms": 10000,
          "enable.auto.commit": false
        }
      }
```

</TabItem>
<TabItem value="ci-cd" label="CI/CD Environment Variable">

```bash showLineNumbers
export OCEAN__INTEGRATION__CONFIG__CLUSTER_CONF_MAPPING='{
  "advanced-cluster": {
    "bootstrap.servers": "broker1:9092,broker2:9092,broker3:9092",
    "security.protocol": "SASL_SSL",
    "sasl.mechanism": "SCRAM-SHA-512",
    "sasl.username": "advanced-username",
    "sasl.password": "advanced-password",
    "ssl.ca.location": "/path/to/ca-cert.pem",
    "ssl.endpoint.identification.algorithm": "https",
    "request.timeout.ms": 30000,
    "session.timeout.ms": 10000,
    "enable.auto.commit": false
  }
}'
```

</TabItem>
</Tabs>

</details>


You can configure multiple clusters in the same mapping by adding additional cluster configurations as shown in the examples above. Each cluster will be processed independently by the integration.


:::caution Security considerations
- Store sensitive information like passwords and API keys securely using your platform's secret management system.
- For Kubernetes deployments, use Kubernetes secrets to store the `clusterConfMapping` value.
- For CI/CD pipelines, use environment variable encryption features provided by your CI/CD platform.
:::

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
- kind: cluster
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .name
        title: .name
        blueprint: '"kafkaCluster"'
        properties:
          controllerId: .controller_id
- kind: broker
  selector:
    query: 'true'
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
- kind: topic
  selector:
    query: 'true'
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
- kind: consumer_group
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .cluster_name + "_" + .group_id
        title: .group_id
        blueprint: '"kafkaConsumerGroup"'
        properties:
          state: .state
          members: '[.members[].client_id]'
          coordinator: .coordinator.id
          partition_assignor: .partition_assignor
          is_simple_consumer_group: .is_simple_consumer_group
          authorized_operations: .authorized_operations
        relations:
          cluster: .cluster_name
```

</details>

<MetricsAndSyncStatus/>


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


### Consumer Group

<details>
<summary>Consumer Group blueprint</summary>

```json showLineNumbers
{
  "identifier": "kafkaConsumerGroup",
  "title": "Consumer Group",
  "icon": "Kafka",
  "schema": {
    "properties": {
      "state": {
        "title": "State",
        "type": "string",
        "description": "The current state of the consumer group."
      },
      "members": {
        "title": "Members",
        "type": "array",
        "description": "List of members in the consumer group.",
        "items": {
          "type": "string"
        }
      },
      "coordinator": {
        "title": "Coordinator",
        "type": "number",
        "description": "Broker ID of the coordinator for the consumer group."
      },
      "partition_assignor": {
        "title": "Partition Assignor",
        "type": "string",
        "description": "Strategy used to assign partitions to consumers."
      },
      "is_simple_consumer_group": {
        "title": "Is Simple Consumer Group",
        "type": "boolean",
        "description": "Indicates if the group is a simple consumer group."
      },
      "authorized_operations": {
        "title": "Authorized Operations",
        "type": "array",
        "description": "List of operations authorized for the consumer group.",
        "items": {
          "type": "string"
        }
      }
    }
  },
  "calculationProperties": {},
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
  - kind: consumer_group
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .cluster_name + "_" + .group_id
          title: .group_id
          blueprint: '"kafkaConsumerGroup"'
          properties:
            state: .state
            members: .members | map(.client_id)
            coordinator: .coordinator.id
            partition_assignor: .partition_assignor
            is_simple_consumer_group: .is_simple_consumer_group
            authorized_operations: .authorized_operations
          relations:
            cluster: .cluster_name
```

</details>

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_kubecost-docker-parameters.mdx"
import AdvancedConfig from '../../../generalTemplates/_ocean_advanced_configuration_note.md'

# Kubecost

Our Kubecost integration allows you to import `kubesystem` and `cloud` cost allocations from your Kubecost instance into Port, according to your mapping and definition.

## Common use cases

- Map your monitored Kubernetes resources and cloud cost allocations in Kubecost.

## Prerequisites

<Prerequisites />

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                         | Description                                                                                                   | Required |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| `port.clientId`                   | Your port client id                                                                                           | ✅       |
| `port.clientSecret`               | Your port client secret                                                                                       | ✅       |
| `port.baseUrl`                    | Your port base url, relevant only if not using the default port app                                           | ❌       |
| `integration.identifier`          | Change the identifier to describe your integration                                                            | ✅       |
| `integration.type`                | The integration type                                                                                          | ✅       |
| `integration.eventListener.type`  | The event listener type                                                                                       | ✅       |
| `integration.config.kubecostHost` | The Kubecost server URL                                                                                       | ✅       |
| `scheduledResyncInterval`         | The number of minutes between each resync                                                                     | ❌       |
| `initializePortResources`         | Default true, When set to true the integration will create default blueprints and the port App config Mapping | ❌       |

<br/>

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-kubecost-integration port-labs/port-ocean \
  --set port.clientId="CLIENT_ID"  \
  --set port.clientSecret="CLIENT_SECRET"  \
  --set initializePortResources=true  \
  --set scheduledResyncInterval=60 \
  --set integration.identifier="my-kubecost-integration"  \
  --set integration.type="kubecost"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.config.kubecostHost="https://kubecostInstance:9090"
```
</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-kubecost-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `KUBECOST_HOST`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-kubecost-integration
  type: kubecost
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    kubecostHost: KUBECOST_HOST
```
<br/>

2. Install the `my-ocean-kubecost-integration` ArgoCD Application by creating the following `my-ocean-kubecost-integration.yaml` manifest:
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
  name: my-ocean-kubecost-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-kubecost-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-kubecost-integration/values.yaml
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
kubectl apply -f my-ocean-kubecost-integration.yaml
```
</TabItem>
</Tabs>

</TabItem>

<TabItem value="one-time" label="Scheduled">
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Kubecost integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `kubecost-integration.yml` workflow file:

```yaml showLineNumbers
name: Kubecost Exporter Workflow

# This workflow responsible for running Kubecost exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with:
          type: 'kubecost'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          config: |
            kubecost_host: ${{ secrets.OCEAN__INTEGRATION__CONFIG__KUBECOST_HOST }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Kubecost integration once and then exit, this is useful for **scheduled** ingestion of data.

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
        stage('Run Kubecost Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__KUBECOST_HOST', variable: 'OCEAN__INTEGRATION__CONFIG__KUBECOST_HOST'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="kubecost"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__KUBECOST_HOST=$OCEAN__INTEGRATION__CONFIG__KUBECOST_HOST \
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

<AzurePremise name="Kubecost" />

<DockerParameters />  

<br/>

Here is an example for `kubecost-integration.yml` pipeline file:

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
    integration_type="kubecost"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__INTEGRATION__CONFIG__KUBECOST_HOST=${OCEAN__INTEGRATION__CONFIG__KUBECOST_HOST} \
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

## Ingesting Kubecost objects

The Kubecost integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting cost allocation data from Kubecost:

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: kubesystem
    selector:
      query: "true"
      window: "month"
    port:
      entity:
        mappings:
          blueprint: '"kubecostResourceAllocation"'
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
            pvBytes: .pvBytes
            ramBytes: .ramBytes
            ramCost: .ramCost
            ramEfficiency: .ramEfficiency
            sharedCost: .sharedCost
            externalCost: .externalCost
            totalCost: .totalCost
            totalEfficiency: .totalEfficiency
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Kubecost's API events.

### Configuration structure

The integration configuration determines which resources will be queried from Kubecost, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Kubecost, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`kubesystem`](https://docs.kubecost.com/apis/apis-overview/api-allocation#allocation-schema)
- [`cloud`](https://docs.kubecost.com/apis/apis-overview/cloud-cost-api#cloud-cost-aggregate-api)

:::

:::note
You will be able to see `cloud` cost data after you have successfully configured the Cloud Billing API on your Kubecost instance according to this [documentation](https://docs.kubecost.com/install-and-configure/install/cloud-integration)
:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: kubesystem
      selector:
      ...
  ```

- The `kind` key is a specifier for an Kubecost object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: kubesystem
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: kubesystem
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
        window: "month"
        aggregate: "pod"
        idle: true
      # highlight-end
      port:
  ```

  - **window** - Duration of time over which to query. Accepts: words like `today`, `week`, `month`, `yesterday`, `lastweek`, `lastmonth`; durations like `30m`, `12h`, `7d`; RFC3339 date pairs like `2021-01-02T15:04:05Z,2021-02-02T15:04:05Z`; Unix timestamps like `1578002645,1580681045`.
  - **aggregate** - Field by which to aggregate the results. Accepts: `cluster`, `node`, `namespace`, `controllerKind`, `controller`, `service`, `pod`, `container`, `label:name`, and `annotation:name`. Also accepts comma-separated lists for multi-aggregation, like `namespace,label:app`.
  - **step** - Duration of a single allocation set. If unspecified, this defaults to the window, so that you receive exactly one set for the entire window. If specified, such as `30m`, `2h`, `1d` etc, it works chronologically backward, querying in durations of step until the full window is covered. Default is `window`.
  - **accumulate** - If true, sum the entire range of sets into a single set. Default value is `false`.
  - **idle** - If true, include idle cost (i.e. the cost of the un-allocated assets) as its own allocation. Default is `true`.
  - **external** - If true, include external, or out-of-cluster costs in each allocation. Default is `false`.
  - **filterClusters** - Comma-separated list of clusters to match; e.g. `cluster-one,cluster-two` will return results from only those two clusters.
  - **filterNodes** - Comma-separated list of nodes to match; e.g. `node-one,node-two` will return results from only those two nodes.
  - **filterNamespaces** - Comma-separated list of namespaces to match; e.g. `namespace-one,namespace-two` will return results from only those two namespaces.
  - **filterControllerKinds** - Comma-separated list of controller kinds to match; e.g. `deployment`, job will return results with only those two controller kinds.
  - **filterControllers** - Comma-separated list of controllers to match; e.g. `deployment-one,statefulset-two` will return results from only those two controllers.
  - **filterPods** - Comma-separated list of pods to match; e.g. `pod-one,pod-two` will return results from only those two pods.
  - **filterAnnotations** - Comma-separated list of annotations to match; e.g. `name:annotation-one,name:annotation-two` will return results with either of those two annotation key-value-pairs.
  - **filterControllerKinds** - Comma-separated list of controller kinds to match; e.g. `deployment`, job will return results with only those two controller kinds.
  - **filterLabels** - Comma-separated list of annotations to match; e.g. `app:cost-analyzer, app:prometheus` will return results with either of those two label key-value-pairs.
  - **filterServices** - Comma-separated list of services to match; e.g. `frontend-one,frontend-two` will return results with either of those two services.
  - **shareIdle** - If true, idle cost is allocated proportionally across all non-idle allocations, per-resource. That is, idle CPU cost is shared with each non-idle allocation's CPU cost, according to the percentage of the total CPU cost represented. Default is `false`.
  - **splitIdle** - If true, and shareIdle == false, Idle Allocations are created on a per cluster or per node basis rather than being aggregated into a single idle allocation. Default is `false`.
  - **idleByNode** - If true, idle allocations are created on a per node basis. Which will result in different values when shared and more idle allocations when split. Default is `false`.
  - And any query parameter that could be found in the [Kubecost allocation API](https://docs.kubecost.com/apis/apis-overview/api-allocation#allocation-api) and [Kubecost Cloud API](https://docs.kubecost.com/apis/apis-overview/cloud-cost-api#cloud-cost-aggregate-api)

- The `port`, `entity` and the `mappings` keys are used to map the Kubecost object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: kubesystem
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one Kubecost object to a Port entity. Each value is a JQ query.
            identifier: .name
            title: .name
            blueprint: '"KubecostResourceAllocation"'
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
    - kind: kubesystem # In this instance cost is mapped again with a different filter
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

To ingest Kubecost objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Kubecost.
3. Choose the **Ingest Data** option from the menu.
4. Select Kubecost under the Cloud cost providers category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Cost allocation

<details>
<summary>Cost allocation blueprint</summary>

```json showLineNumbers
{
  "identifier": "kubecostResourceAllocation",
  "description": "This blueprint represents an Kubecost resource allocation in our software catalog",
  "title": "Kubecost Resource Allocation",
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
      "pvBytes": {
        "title": "PV Bytes",
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
  - kind: kubesystem
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"kubecostResourceAllocation"'
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
            pvBytes: .pvBytes
            ramBytes: .ramBytes
            ramCost: .ramCost
            ramEfficiency: .ramEfficiency
            sharedCost: .sharedCost
            externalCost: .externalCost
            totalCost: .totalCost
            totalEfficiency: .totalEfficiency
```

</details>

### Cloud cost

<details>
<summary> Cloud cost blueprint</summary>

```json showlineNumbers
{
  "identifier": "kubecostCloudAllocation",
  "description": "This blueprint represents an Kubecost cloud resource allocation in our software catalog",
  "title": "Kubecost Cloud Allocation",
  "icon": "Cluster",
  "schema": {
    "properties": {
      "provider": {
        "type": "string",
        "title": "Provider"
      },
      "accountID": {
        "type": "string",
        "title": "Account ID"
      },
      "invoiceEntityID": {
        "type": "string",
        "title": "Invoice Entity ID"
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
      "listCost": {
        "title": "List Cost Value",
        "type": "number"
      },
      "listCostPercent": {
        "title": "List Cost Percent",
        "type": "number"
      },
      "netCost": {
        "title": "Net Cost Value",
        "type": "number"
      },
      "netCostPercent": {
        "title": "Net Cost Percent",
        "type": "number"
      },
      "amortizedNetCost": {
        "title": "Amortized Net Cost",
        "type": "number"
      },
      "amortizedNetCostPercent": {
        "title": "Amortized Net Cost Percent",
        "type": "number"
      },
      "invoicedCost": {
        "title": "Invoice Cost",
        "type": "number"
      },
      "invoicedCostPercent": {
        "title": "Invoice Cost Percent",
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
  - kind: cloud
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"kubecostCloudAllocation"'
          identifier: .properties.service
          title: .properties.service
          properties:
            provider: .properties.provider
            accountID: .properties.accountID
            invoiceEntityID: .properties.invoiceEntityID
            startDate: .window.start
            endDate: .window.end
            listCost: .listCost.cost
            listCostPercent: .listCost.kubernetesPercent
            netCost: .netCost.cost
            netCostPercent: .netCost.kubernetesPercent
            amortizedNetCost: .amortizedNetCost.cost
            amortizedNetCostPercent: .amortizedNetCost.kubernetesPercent
            invoicedCost: .invoicedCost.cost
            invoicedCostPercent: .invoicedCost.kubernetesPercent
```

</details>

## Let's Test It

This section includes a sample response data from Kubecost. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Kubecost:

<details>
<summary> Cost response data</summary>

```json showLineNumbers
{
  "name": "argocd",
  "properties": {
    "cluster": "cluster-one",
    "node": "gke-my-regional-cluster-default-pool-e8093bfa-0bjg",
    "namespace": "argocd",
    "providerID": "gke-my-regional-cluster-default-pool-e8093bfa-0bjg",
    "namespaceLabels": {
      "kubernetes_io_metadata_name": "argocd"
    }
  },
  "window": {
    "start": "2023-10-30T00:00:00Z",
    "end": "2023-10-30T01:00:00Z"
  },
  "start": "2023-10-30T00:00:00Z",
  "end": "2023-10-30T01:00:00Z",
  "minutes": 60,
  "cpuCores": 0.00515,
  "cpuCoreRequestAverage": 0,
  "cpuCoreUsageAverage": 0.00514,
  "cpuCoreHours": 0.00515,
  "cpuCost": 0.00012,
  "cpuCostAdjustment": 0,
  "cpuEfficiency": 1,
  "gpuCount": 0,
  "gpuHours": 0,
  "gpuCost": 0,
  "gpuCostAdjustment": 0,
  "networkTransferBytes": 2100541.53,
  "networkReceiveBytes": 2077024.88318,
  "networkCost": 0,
  "networkCrossZoneCost": 0,
  "networkCrossRegionCost": 0,
  "networkInternetCost": 0,
  "networkCostAdjustment": 0,
  "loadBalancerCost": 0.02708,
  "loadBalancerCostAdjustment": 0,
  "pvBytes": 0,
  "pvByteHours": 0,
  "pvCost": 0,
  "pvs": "None",
  "pvCostAdjustment": 0,
  "ramBytes": 135396181.33333,
  "ramByteRequestAverage": 0,
  "ramByteUsageAverage": 135394433.70477,
  "ramByteHours": 135396181.33333,
  "ramCost": 0.00041,
  "ramCostAdjustment": 0,
  "ramEfficiency": 1,
  "externalCost": 0,
  "sharedCost": 0,
  "totalCost": 0.02761,
  "totalEfficiency": 1,
  "proportionalAssetResourceCosts": {},
  "lbAllocations": {
    "cluster-one/argocd/argocd-server": {
      "service": "argocd/argocd-server",
      "cost": 0.027083333333333334,
      "private": false,
      "ip": ""
    }
  },
  "sharedCostBreakdown": {}
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Cost entity in Port</summary>

```json showLineNumbers
{
  "identifier": "argocd",
  "title": "argocd",
  "icon": null,
  "blueprint": "kubecostResourceAllocation",
  "team": [],
  "properties": {
    "cluster": "cluster-one",
    "namespace": "argocd",
    "startDate": "2023-10-30T04:00:00.000Z",
    "endDate": "2023-10-30T05:00:00.000Z",
    "cpuCoreHours": 0.0051,
    "cpuCost": 0.00012,
    "cpuEfficiency": 1,
    "gpuHours": 0,
    "gpuCost": 0,
    "networkCost": 0,
    "loadBalancerCost": 0.02708,
    "pvCost": 0,
    "pvBytes": 0,
    "ramBytes": 135396181.33333,
    "ramCost": 0.00041,
    "ramEfficiency": 1,
    "sharedCost": 0,
    "externalCost": 0,
    "totalCost": 0.02761,
    "totalEfficiency": 1
  },
  "relations": {},
  "createdAt": "2023-10-30T13:25:42.717Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-10-30T13:28:37.379Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

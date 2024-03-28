import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_opencost-docker-parameters.mdx"
import AdvancedConfig from '../../../generalTemplates/_ocean_advanced_configuration_note.md'

# OpenCost

Our OpenCost integration allows you to import `cost` from your OpenCost instance into Port, according to your mapping and definition.

## Common use cases

- Map your monitored Kubernetes resources and cost allocations in OpenCost.

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
| `integration.config.opencostHost` | The Opencost server URL                                                                                       | ✅       |
| `scheduledResyncInterval`         | The number of minutes between each resync                                                                     | ❌       |
| `initializePortResources`         | Default true, When set to true the integration will create default blueprints and the port App config Mapping | ❌       |

<br/>

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-opencost-integration port-labs/port-ocean \
	--set port.clientId="CLIENT_ID"  \
	--set port.clientSecret="CLIENT_SECRET"  \
	--set initializePortResources=true  \
	--set integration.identifier="my-opencost-integration"  \
	--set integration.type="opencost"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.config.opencostHost="https://myOpenCostInstance:9003"
```
</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-opencost-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `OPENCOST_HOST`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-opencost-integration
  type: opencost
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    opencostHost: OPENCOST_HOST
```
<br/>

2. Install the `my-ocean-opencost-integration` ArgoCD Application by creating the following `my-ocean-opencost-integration.yaml` manifest:
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
  name: my-ocean-opencost-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-opencost-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-opencost-integration/values.yaml
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
kubectl apply -f my-ocean-opencost-integration.yaml
```
</TabItem>
</Tabs>

</TabItem>

<TabItem value="one-time" label="Scheduled">
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Opencost integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `opencost-integration.yml` workflow file:

```yaml showLineNumbers
name: Opencost Exporter Workflow

# This workflow responsible for running Opencost exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with:
          type: 'opencost'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          config: |
            opencost_host: ${{ secrets.OCEAN__INTEGRATION__CONFIG__OPENCOST_HOST }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the OpenCost integration once and then exit, this is useful for **scheduled** ingestion of data.

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
        stage('Run Opencost Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__OPENCOST_HOST', variable: 'OCEAN__INTEGRATION__CONFIG__OPENCOST_HOST'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="opencost"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__OPENCOST_HOST=$OCEAN__INTEGRATION__CONFIG__OPENCOST_HOST \
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

Here is an example for `opencost-integration.yml` pipeline file:

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
    integration_type="opencost"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__INTEGRATION__CONFIG__OPENCOST_HOST=${OCEAN__INTEGRATION__CONFIG__OPENCOST_HOST} \
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
      window: "month"
      aggregate: "pod"
      step: "window"
      resolution: "1m"
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
        window: "month"
        aggregate: "pod"
        step: "window"
        resolution: "1m"
      # highlight-end
      port:
  ```

  - **window** - Duration of time over which to query. Accepts: words like `today`, `week`, `month`, `yesterday`, `lastweek`, `lastmonth`; durations like `30m`, `12h`, `7d`; RFC3339 date pairs like `2021-01-02T15:04:05Z,2021-02-02T15:04:05Z`; Unix timestamps like `1578002645,1580681045`.
  - **aggregate** - Field by which to aggregate the results. Accepts: `cluster`, `node`, `namespace`, `controllerKind`, `controller`, `service`, `pod`, `container`, `label:name`, and `annotation:name`. Also accepts comma-separated lists for multi-aggregation, like `namespace,label:app`.
  - **step** - Duration of a single allocation set. If unspecified, this defaults to the window, so that you receive exactly one set for the entire window. If specified, such as `30m`, `2h`, `1d` etc, it works chronologically backward, querying in durations of step until the full window is covered. Default is `window`.
  - **resolution** - Duration to use as resolution in Prometheus queries. Smaller values (i.e. higher resolutions) will provide better accuracy, but worse performance (i.e. slower query time, higher memory use). Larger values (i.e. lower resolutions) will perform better, but at the expense of lower accuracy for short-running workloads. Default is `1m`.

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
      window: "month"
      aggregate: "pod"
      step: "window"
      resolution: "1m"
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

## Let's Test It

This section includes a sample response data from OpenCost. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from OpenCost aggregated on the `namespace` level:

<details>
<summary> Cost response data</summary>

```json showLineNumbers
{
  "name": "ingress-nginx",
  "properties": {
    "cluster": "cluster-one",
    "node": "minikube",
    "container": "controller",
    "controller": "ingress-nginx-controller",
    "controllerKind": "deployment",
    "namespace": "ingress-nginx",
    "pod": "ingress-nginx-controller-7799c6795f-29n7j",
    "services": [
      "ingress-nginx-controller-admission",
      "ingress-nginx-controller"
    ],
    "labels": {
      "app_kubernetes_io_component": "controller",
      "app_kubernetes_io_instance": "ingress-nginx",
      "app_kubernetes_io_name": "ingress-nginx",
      "gcp_auth_skip_secret": "true",
      "kubernetes_io_metadata_name": "ingress-nginx",
      "pod_template_hash": "7799c6795f"
    },
    "namespaceLabels": {
      "app_kubernetes_io_instance": "ingress-nginx",
      "app_kubernetes_io_name": "ingress-nginx",
      "kubernetes_io_metadata_name": "ingress-nginx"
    }
  },
  "window": {
    "start": "2023-10-30T00:00:00Z",
    "end": "2023-10-31T00:00:00Z"
  },
  "start": "2023-10-30T09:05:00Z",
  "end": "2023-10-30T11:50:00Z",
  "minutes": 165,
  "cpuCores": 0.1,
  "cpuCoreRequestAverage": 0.1,
  "cpuCoreUsageAverage": 0,
  "cpuCoreHours": 0.275,
  "cpuCost": 0.00869,
  "cpuCostAdjustment": 0,
  "cpuEfficiency": 0,
  "gpuCount": 0,
  "gpuHours": 0,
  "gpuCost": 0,
  "gpuCostAdjustment": 0,
  "networkTransferBytes": 0,
  "networkReceiveBytes": 0,
  "networkCost": 0,
  "networkCrossZoneCost": 0,
  "networkCrossRegionCost": 0,
  "networkInternetCost": 0,
  "networkCostAdjustment": 0,
  "loadBalancerCost": 0,
  "loadBalancerCostAdjustment": 0,
  "pvBytes": 0,
  "pvByteHours": 0,
  "pvCost": 0,
  "pvs": "None",
  "pvCostAdjustment": 0,
  "ramBytes": 94371840,
  "ramByteRequestAverage": 94371840,
  "ramByteUsageAverage": 0,
  "ramByteHours": 259522560,
  "ramCost": 0.00102,
  "ramCostAdjustment": 0,
  "ramEfficiency": 0,
  "externalCost": 0,
  "sharedCost": 0,
  "totalCost": 0.00972,
  "totalEfficiency": 0,
  "lbAllocations": "None"
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Cost entity in Port</summary>

```json showLineNumbers
{
  "identifier": "ingress-nginx",
  "title": "ingress-nginx",
  "blueprint": "openCostResourceAllocation",
  "team": [],
  "properties": {
    "cluster": "cluster-one",
    "namespace": "ingress-nginx",
    "startDate": "2023-10-30T09:05:00.000Z",
    "endDate": "2023-10-30T11:50:00.000Z",
    "cpuCoreHours": 0.275,
    "cpuCost": 0.00869,
    "cpuEfficiency": 0,
    "gpuHours": 0,
    "gpuCost": 0,
    "networkCost": 0,
    "loadBalancerCost": 0,
    "pvCost": 0,
    "ramBytes": 94371840,
    "ramCost": 0.00102,
    "ramEfficiency": 0,
    "sharedCost": 0,
    "externalCost": 0,
    "totalCost": 0.00972,
    "totalEfficiency": 0
  },
  "relations": {},
  "createdAt": "2023-10-15T09:30:57.924Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-10-30T11:49:20.881Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

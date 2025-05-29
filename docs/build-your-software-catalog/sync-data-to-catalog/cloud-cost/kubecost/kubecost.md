---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_kubecost-docker-parameters.mdx"
import AdvancedConfig from '../../../../generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"


# Kubecost

Port's Kubecost integration allows you to model Kubecost resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Map and organize your desired Kubecost resources and their metadata in Port (see supported resources below).
- Watch for Kubecost object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.


### Supported Resources

The resources that can be ingested from Kubecost into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`kubesystem`](https://docs.kubecost.com/apis/monitoring-apis/api-allocation#allocation-api)
- [`cloud`](https://docs.kubecost.com/apis/monitoring-apis/cloud-cost-api#cloud-cost-querying-api)


## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2> Prerequisites </h2>

<Prerequisites />


For details about the available parameters for the installation, see the table below.


<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Kubecost" />

<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

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
<br/>

1. Apply your application manifest with `kubectl`:
```bash
kubectl apply -f my-ocean-kubecost-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                               | Description                                                                                                                         | Required |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                         | Your port client id                                                                                                                 | ✅        |
| `port.clientSecret`                     | Your port client secret                                                                                                             | ✅        |
| `port.baseUrl`                          | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                             | ✅        |
| `integration.identifier`                | Change the identifier to describe your integration                                                                                  | ✅        |
| `integration.type`                      | The integration type                                                                                                                | ✅        |
| `integration.eventListener.type`        | The event listener type                                                                                                             | ✅        |
| `integration.config.kubecostHost`       | The Kubecost server URL                                                                                                             | ✅        |
| `integration.config.kubecostApiVersion` | The API version of the Kubecost instance. Possible values are v1 and v2. The default value is v2                                    | ❌        |
| `scheduledResyncInterval`               | The number of minutes between each resync                                                                                           | ❌        |
| `initializePortResources`               | Default true, When set to true the integration will create default blueprints and the port App config Mapping                       | ❌        |
| `sendRawDataExamples`                   | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true | ❌        |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the Kubecost integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option
:::

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `kubecost-integration.yml` workflow file:

```yaml showLineNumbers
name: Kubecost Exporter Workflow

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
          type: 'kubecost'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            kubecost_host: ${{ secrets.OCEAN__INTEGRATION__CONFIG__KUBECOST_HOST }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">

:::tip
Your Jenkins agent should be able to run docker commands.
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
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__KUBECOST_HOST=$OCEAN__INTEGRATION__CONFIG__KUBECOST_HOST \
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

<AzurePremise />

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
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__KUBECOST_HOST=$(OCEAN__INTEGRATION__CONFIG__KUBECOST_HOST) \
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
  INTEGRATION_TYPE: kubecost
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
        -e OCEAN__INTEGRATION__CONFIG__KUBECOST_HOST=$OCEAN__INTEGRATION__CONFIG__KUBECOST_HOST \
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

<AdvancedConfig/>

</TabItem>

</Tabs>


## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
- kind: kubesystem
  selector:
    query: 'true'
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
- kind: cloud
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        blueprint: '"kubecostCloudAllocation"'
        identifier: .properties.provider + "/" + .properties.providerID + "/" + .properties.category + "/" + .properties.service | gsub("[^A-Za-z0-9@_.:\\\\/=-]"; "-")
        title: .properties.provider + "/" + .properties.service
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
          identifier: .properties.provider + "/" + .properties.providerID + "/" + .properties.category + "/" + .properties.service | gsub("[^A-Za-z0-9@_.:\\\\/=-]"; "-")
          title: .properties.provider + "/" + .properties.service
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
  "icon": "Cluster",
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

## Advanced
For advanced configuration including customizing how Kubecost kinds are ingested, read the [advanced section of Kubecost](/build-your-software-catalog/sync-data-to-catalog/cloud-cost/kubecost/advanced.md) guide.

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_opencost-docker-parameters.mdx"
import AdvancedConfig from '../../../generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"


# OpenCost

Port's Opencost integration allows you to model Opencost resources in your software catalog and ingest data into them.



## Overview

This integration allows you to:

- Map and organize your desired Opencost resources and their metadata in Port (see supported resources below).
- Watch for Opencost object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.


### Supported Resources

The resources that can be ingested from Opencost into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`Cost`](https://www.opencost.io/docs/integrations/api-examples#allocation-examples)
- [`Cloudcost`](https://www.opencost.io/docs/integrations/api-examples#cloudcost-examples)



## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2> Prerequisites </h2>

<Prerequisites />


For details about the available parameters for the installation, see the table below.


<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Opencost" />

<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

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
kubectl apply -f my-ocean-opencost-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                         | Description                                                                                                                         | Required |
|-----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                   | Your port client id                                                                                                                 | ✅        |
| `port.clientSecret`               | Your port client secret                                                                                                             | ✅        |
| `port.baseUrl`                    | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                             | ✅        |
| `integration.identifier`          | Change the identifier to describe your integration                                                                                  | ✅        |
| `integration.type`                | The integration type                                                                                                                | ✅        |
| `integration.eventListener.type`  | The event listener type                                                                                                             | ✅        |
| `integration.config.opencostHost` | The Opencost server URL                                                                                                             | ✅        |
| `scheduledResyncInterval`         | The number of minutes between each resync                                                                                           | ❌        |
| `initializePortResources`         | Default true, When set to true the integration will create default blueprints and the port App config Mapping                       | ❌        |
| `sendRawDataExamples`             | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true | ❌        |


<br/>


</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the Opencost integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option
:::

  <Tabs groupId="cicd-method" queryString="cicd-method">

  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `opencost-integration.yml` workflow file:

```yaml showLineNumbers
name: Opencost Exporter Workflow

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
          type: 'opencost'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            opencost_host: ${{ secrets.OCEAN__INTEGRATION__CONFIG__OPENCOST_HOST }}
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
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__OPENCOST_HOST=$OCEAN__INTEGRATION__CONFIG__OPENCOST_HOST \
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
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__OPENCOST_HOST=$(OCEAN__INTEGRATION__CONFIG__OPENCOST_HOST) \
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
  INTEGRATION_TYPE: opencost
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
        -e OCEAN__INTEGRATION__CONFIG__OPENCOST_HOST=$OCEAN__INTEGRATION__CONFIG__OPENCOST_HOST \
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
- kind: cost
  selector:
    query: 'true'
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
- kind: cloudcost
  selector:
    query: 'true'
    cloudcostAggregate: provider
  port:
    entity:
      mappings:
        blueprint: '"openCostCloudcost"'
        identifier: .properties.provider + "-" + .window.start + "-" + .window.end
        title: .properties.provider + "-" + .window.start + "-" + .window.end
        properties:
          startDate: .window.start
          endDate: .window.end
          listCost: .listCost.cost
          netCost: .netCost.cost
          amortizedNetCost: .amortizedNetCost.cost
          invoicedCost: .invoicedCost.cost
          amortizedCost: .amortizedCost.cost
```

</details>




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
      filter: 'labels:"app:internal-service","app:service-2"+service:"notification","account","functions"'
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

### Cloudcost

<details>
<summary>Cloudcost blueprint</summary>

```json showLineNumbers
{
  "identifier": "openCostCloudcost",
  "description": "This blueprint represents cloud cost allocations from your OpenCost instance",
  "title": "OpenCost CloudCost",
  "icon": "Opencost",
  "schema": {
    "properties": {
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
        "title": "List Cost",
        "type": "number"
      },
      "netCost": {
        "title": "Net Cost",
        "type": "number"
      },
      "amortizedNetCost": {
        "title": "Amortized Net Cost",
        "type": "number"
      },
      "invoicedCost": {
        "title": "Invoiced Cost",
        "type": "number"
      },
      "amortizedCost": {
        "title": "Amortized Cost",
        "type": "number"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
- kind: cloudcost
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .properties.provider + "-" + .window.start + "-" + .window.end
          title: .properties.provider + "-" + .window.start + "-" + .window.end
          blueprint: '"openCostCloudcost"'
          properties:
            startDate: .window.start
            endDate: .window.end
            listCost: .listCost.cost
            netCost: .netCost.cost
            amortizedNetCost: .amortizedNetCost.cost
            invoicedCost: .invoicedCost.cost
            amortizedCost: .amortizedCost.cost
```

</details>


## Let's Test It

This section includes a sample response data from OpenCost. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from OpenCost

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

<details>
<summary> Cloudcost response data</summary>

```json showLineNumber
{
  "properties": {
    "provider": "AWS",
    "accountID": "123456789012",
    "invoiceEntityID": "AWS-123456789012",
    "service": "Amazon Elastic Compute Cloud",
    "category": "Compute",
    "region": "us-east-1",
    "labels": {
      "environment": "production",
      "team": "platform"
    }
  },
  "window": {
    "start": "2024-03-01T00:00:00Z",
    "end": "2024-03-31T23:59:59Z"
  },
  "listCost": {
    "cost": 1250.75,
    "kubernetesPercent": 0.85
  },
  "netCost": {
    "cost": 1100.50,
    "kubernetesPercent": 0.85
  },
  "amortizedNetCost": {
    "cost": 1050.25,
    "kubernetesPercent": 0.85
  },
  "invoicedCost": {
    "cost": 1250.75,
    "kubernetesPercent": 0.85
  },
  "amortizedCost": {
    "cost": 1200.30,
    "kubernetesPercent": 0.85
  },
  "items": [
    {
      "resourceId": "i-0abc123def456789",
      "name": "eks-node-1",
      "properties": {
        "instanceType": "m5.xlarge",
        "operatingSystem": "Linux"
      },
      "tags": {
        "Name": "eks-node-1",
        "kubernetes.io/cluster/my-cluster": "owned"
      },
      "cost": 625.37,
      "start": "2024-03-01T00:00:00Z",
      "end": "2024-03-31T23:59:59Z"
    },
    {
      "resourceId": "i-0def456789abc1234",
      "name": "eks-node-2",
      "properties": {
        "instanceType": "m5.xlarge",
        "operatingSystem": "Linux"
      },
      "tags": {
        "Name": "eks-node-2",
        "kubernetes.io/cluster/my-cluster": "owned"
      },
      "cost": 625.38,
      "start": "2024-03-01T00:00:00Z",
      "end": "2024-03-31T23:59:59Z"
    }
  ]
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


<details>
<summary> Cloudcost entity in Port</summary>

```json showLineNumbers
{
  "identifier": "aws_2024_03_01_t_00_00_00_z_2024_03_31_t_23_59_59_z",
  "title": "AWS-2024-03-01T00:00:00Z-2024-03-31T23:59:59Z",
  "properties": {
    "startDate": "2024-03-01T00:00:00Z",
    "endDate": "2024-03-31T23:59:59Z",
    "listCost": 1250.75,
    "netCost": 1100.5,
    "amortizedNetCost": 1050.25,
    "invoicedCost": 1250.75,
    "amortizedCost": 1200.3
  },
  "relations": {},
  "icon": "Opencost"
}
```

</details>

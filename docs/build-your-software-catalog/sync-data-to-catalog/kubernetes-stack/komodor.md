import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./_komodor-docker-parameters.mdx"
import AdvancedConfig from '../../../generalTemplates/\_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"


# Komodor

Port's Komodor integration allows you to model [Komodor](https://komodor.com/) resources in your software catalog and ingest data into them.

## Overview

This integration allows you to map, organize, and sync your desired Komodor resources and their metadata in Port.

### Supported Resources

The resources that can be ingested from Komodor into Port are listed below:

 - [`Services`](https://api.komodor.com/api/docs/index.html#/Services/post_api_v2_services_search)
 - [`Health Monitoring`](https://help.komodor.com/hc/en-us/categories/22390793120274-Health-Management)

### Prerequisites

#### Generate a Komodor Api Key

1. Log in to the [Komodor platfrom](https://app.komodor.com).
2. Access API Keys management page:
   - Click on your user profile in the top-right corner of the platform.
   - Select `API Keys` from the dropdown menu.
3. Generate a new API key:
   - Click the `Generate Key` button.
   - Provide a descriptive name for the API key to help you identify its purpose later (e.g., "Port.io api key").
4. Copy the token and save it in a secure location.

To read more, see the [Komodor documentation](https://help.komodor.com/hc/en-us/articles/22434108566674-Using-the-Komodor-API).

:::info API key permissions
Make sure the user who creates the API key has view permissions (ideally full access) for the resources you wish to ingest into Port, since the API key inherits the user's permissions.
:::

## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation method means that the integration will be able to update Port in real time.

<h2>Prerequisites</h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Komodor" />

<PortApiRegionTip/>

</TabItem>

<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-komodor-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `KOMODOR_TOKEN`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-komodor-integration
  type: komodor
  eventListener:
    type: POLLING
  secrets:
  // highlight-next-line
  komodorApiKey: KOMODOR_API_KEY
```
<br/>

2. Install the `my-ocean-komodor-integration` ArgoCD Application by creating the following `my-ocean-komodor-integration.yaml` manifest:
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
  name: my-ocean-komodor-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-komodor-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-komodor-integration/values.yaml
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
kubectl apply -f my-ocean-komodor-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.
Note the parameters specific to this integration, they are last in the table.

| Parameter                               | Description                                                                                                                                            | Required |
|-----------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                         | Your port client id                                                                                                                                    | ✅        |
| `port.clientSecret`                     | Your port client secret                                                                                                                                | ✅        |
| `port.baseUrl`                          | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                | ✅        |
| `integration.identifier`                | Change the identifier to describe your integration                                                                                                     | ✅        |
| `integration.type`                      | The integration type                                                                                                                                   | ✅        |
| `integration.eventListener.type`        | The event listener type                                                                                                                                | ✅        |
| `scheduledResyncInterval`               | The number of minutes between each resync                                                                                                              | ❌        |
| `initializePortResources`               | Default true, When set to true the integration will create default blueprints and the port App config Mapping                                          | ❌        |
| `integration.secrets.komodorApiKey`     | The Komodor API key [token](https://help.komodor.com/hc/en-us/articles/22434108566674-Using-the-Komodor-API).                                          | ✅        |

<br/>
<AdvancedConfig/>

<h3>Event listener</h3>

The integration uses polling to pull the configuration from Port every minute and check it for changes. If there is a change, a resync will occur.

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the Komodor integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option
:::

 <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `komodor-integration.yml` workflow file:

```yaml showLineNumbers
name: Komodor Exporter Workflow

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
          type: 'komodor'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            komodor_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__KOMODOR_TOKEN }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">

:::tip
Your Jenkins agent should be able to run docker commands.
:::

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/) of `Secret Text` type:

<DockerParameters />

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Komodor Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__KOMODOR_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__KOMODOR_TOKEN'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="komodor"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__KOMODOR_TOKEN=$OCEAN__INTEGRATION__CONFIG__KOMODOR_TOKEN \
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

Here is an example for `komodor-integration.yml` pipeline file:

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
    integration_type="komodor"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
       -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
      -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
      -e OCEAN__INTEGRATION__CONFIG__KOMODOR_TOKEN=$(OCEAN__INTEGRATION__CONFIG__KOMODOR_TOKEN) \
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

<DockerParameters/>

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
  INTEGRATION_TYPE: komodor
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
        -e OCEAN__INTEGRATION__CONFIG__KOMODOR_TOKEN=$OCEAN__INTEGRATION__CONFIG__KOMODOR_TOKEN \
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

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from Komodor's API into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration you get after installing the Komodor integration.

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>


```yaml showLineNumbers

deleteDependentEntities: true
createMissingRelatedEntities: false
enableMergeEntity: true
resources:
- kind: komodorService
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .kind + "-" + .cluster + "-" + .namespace + "-" + .service
        title: .service
        blueprint: '"komodorService"'
        properties:
          service_id: .uid
          status: .status
          cluster_name: .cluster
          workload_kind: .kind
          namespace_name: .namespace
          service_name: .service
          komodor_link: .link + "&utmSource=port"
          labels: .labels
          last_deploy_at: .lastDeploy.endTime | todate
          last_deploy_status: .lastDeploy.status
- kind: komodorHealthMonitoring
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: .komodorUid | gsub("\\|"; "-") | sub("-+$"; "")
        blueprint: '"komodorHealthMonitoring"'
        properties:
          status: .status
          resource_identifier: .komodorUid | gsub("\\|"; "-") | sub("-+$"; "")
          severity: .severity
          supporting_data: .supportingData
          komodor_link: .link + "&utmSource=port"
          created_at: .createdAt | todate
          last_evaluated_at: .lastEvaluatedAt | todate
          check_type: .checkType
          workload_type: .komodorUid | split("|") | .[0]
          cluster_name: .komodorUid | split("|") | .[1]
          namespace_name: .komodorUid | split("|") | .[2]
          workload_name: .komodorUid | split("|") | .[3]
- kind: komodorHealthMonitoring
  selector:
    query: ( .komodorUid | split("|") as $parts | (length == 4 and all($parts[]; length > 0)) )
  port:
    entity:
      mappings:
        identifier: .id
        title: .komodorUid | gsub("\\|"; "-") | sub("-+$"; "")
        blueprint: '"komodorHealthMonitoring"'
        properties: {}
        relations:
          service: .komodorUid | gsub("\\|"; "-")
```

</details>


## Examples
Examples of blueprints and the relevant integration configurations:
### Services

<details>
<summary>Service Blueprint</summary>

```json showLineNumbers
{
 "identifier": "komodorService",
 "title": "Komodor Service",
 "icon": "Komodor",
 "schema": {
   "properties": {
     "status": {
       "type": "string",
       "title": "Status",
       "enum": [
         "healthy",
         "unhealthy"
       ],
       "enumColors": {
         "healthy": "green",
         "unhealthy": "red"
       }
     },
     "cluster_name": {
       "icon": "Cluster",
       "type": "string",
       "title": "Cluster"
     },
     "workload_kind": {
       "icon": "Deployment",
       "type": "string",
       "title": "Kind"
     },
     "service_name": {
       "icon": "DefaultProperty",
       "type": "string",
       "title": "Service"
     },
     "namespace_name": {
       "icon": "Environment",
       "type": "string",
       "title": "Namespace"
     },
     "last_deploy_at": {
       "type": "string",
       "title": "Last Deploy At",
       "format": "date-time"
     },
     "komodor_link": {
       "type": "string",
       "title": "Komodor Link",
       "format": "url",
       "icon": "LinkOut"
     },
     "labels": {
       "icon": "JsonEditor",
       "type": "object",
       "title": "Labels"
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
deleteDependentEntities: true
createMissingRelatedEntities: false
enableMergeEntity: true
resources:
  - kind: komodorService
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .uid
          title: .service
          blueprint: '"komodorService"'
          properties:
            service_id: .uid
            status: .status
            cluster_name: .cluster
            workload_kind: .kind
            namespace_name: .namespace
            service_name: .service
            komodor_link: .link + "&utmSource=port"
            labels: .labels
            last_deploy_at: .lastDeploy.endTime | todate
            last_deploy_status: .lastDeploy.status
```

</details>

### Health Monitors

<details>
<summary>Health Monitor blueprint</summary>

```json showLineNumber
{
  "identifier": "komodorHealthMonitoring",
  "title": "Komodor Health Monitoring",
  "icon": "Komodor",
  "schema": {
    "properties": {
      "supporting_data": {
        "icon": "JsonEditor",
        "type": "object",
        "title": "Supporting Data"
      },
      "komodor_link": {
        "icon": "LinkOut",
        "type": "string",
        "title": "Komodor Link",
        "format": "url"
      },
      "severity": {
        "type": "string",
        "title": "Severity",
        "enum": [
          "high",
          "medium",
          "low"
        ],
        "enumColors": {
          "high": "red",
          "medium": "orange",
          "low": "yellow"
        }
      },
      "created_at": {
        "type": "string",
        "title": "Created at",
        "format": "date-time"
      },
      "last_evaluated_at": {
        "icon": "Clock",
        "type": "string",
        "title": "Last Evaluated At",
        "format": "date-time"
      },
      "check_type": {
        "type": "string",
        "title": "Check Type"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "enum": [
          "open",
          "confirmed",
          "resolved",
          "dismissed",
          "ignored",
          "manually_resolved"
        ],
        "enumColors": {
          "open": "red",
          "confirmed": "turquoise",
          "resolved": "green",
          "dismissed": "purple",
          "ignored": "darkGray",
          "manually_resolved": "bronze"
        }
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "service": {
      "title": "Service",
      "target": "komodorService",
      "required": false,
      "many": false
    }
  }
}
```
</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: false
enableMergeEntity: true
resources:
  - kind: komodorHealthMonitoring
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .komodorUid | gsub("\\|"; "-") | sub("-+$"; "")
          blueprint: '"komodorHealthMonitoring"'
          properties:
            status: .status
            resource_identifier: .komodorUid | gsub("\\|"; "-") | sub("-+$"; "")
            severity: .severity
            supporting_data: .supportingData
            komodor_link: .link + "&utmSource=port"
            created_at: .createdAt | todate
            last_evaluated_at: .lastEvaluatedAt | todate
            check_type: .checkType
            workload_type: .komodorUid | split("|") | .[0]
            cluster_name: .komodorUid | split("|") | .[1]
            namespace_name: .komodorUid | split("|") | .[2]
            workload_name: .komodorUid | split("|") | .[3]
  - kind: komodorHealthMonitoring
    selector:
      query: (.komodorUid | split("|") | length) == 4
    port:
      entity:
        mappings:
          identifier: .id
          title: .komodorUid | gsub("\\|"; "-") | sub("-+$"; "")
          blueprint: '"komodorHealthMonitoring"'
          properties: {}
          relations:
            service: .komodorUid | gsub("\\|"; "-")
```

</details>

## Let's Test It

This section includes a sample response data from Komodor. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Komodor. All variables are written in uppercase letters for improved readability:

<details>
<summary>Service response data</summary>

```json showLineNumbers
{
  "data": {
    "services": [
      {
        "annotations": {
          "checksum/config": "CHECKSUM",
          "deployment.kubernetes.io/revision": "1",
          "meta.helm.sh/release-name": "komodor-agent",
          "meta.helm.sh/release-namespace": "komodor"
        },
        "cluster": "test",
        "kind": "Deployment",
        "labels": {
          "app.kubernetes.io/instance": "komodor-agent",
          "app.kubernetes.io/managed-by": "Helm",
          "app.kubernetes.io/name": "komodor-agent",
          "app.kubernetes.io/version": "X.X.X",
          "helm.sh/chart": "komodor-agent-X.X.X"
        },
        "lastDeploy": {
          "endTime": 1740140297,
          "startTime": 1740140297,
          "status": "success"
        },
        "link": "https://app.komodor.com/services/ACCOUNT.CLUSTER.SERVICE?workspaceId=null&referer=public-api",
        "namespace": "komodor",
        "service": "komodor-agent",
        "status": "healthy",
        "uid": "INTERNAL_KOMODOR_UID"
      }
    ]
  },
  "meta": {
    "nextPage": 1,
    "page": 0,
    "pageSize": 1
  }
}
```

</details>

<details>
<summary>Health Monitor response data </summary>

```json showLineNumbers
{
  "checkType": "restartingContainers",
  "createdAt": 1742447493,
  "id": "RANDOM_UID",
  "komodorUid": "WORKLOAD_KIND|CLUSTER_NAME|NAMESPACE_NAME|WORKLOAD_NAME",
  "lastEvaluatedAt": 1743292800,
  "link": "https://app.komodor.com/health/risks/drawer?checkCategory=workload-health&checkType=restartingContainers&violationId=78f44264-dbe1-4d0f-9096-9925f5e74ae8",
  "severity": "medium",
  "status": "open",
  "supportingData": {
    "restartingContainers": {
      "containers": [
        {
          "name": "CONTAINER_NAME",
          "restarts": 969
        }
      ],
      "restartReasons": {
        "breakdown": [
          {
            "message": "Container Exited With Error - Exit Code: 1",
            "percent": 100,
            "numOccurences": 1825,
            "reason": "ProcessExit"
          }
        ],
        "additionalInfo": {
          "podSamples": [
            {
              "podName": "POD_NAME_1",
              "restarts": 607
            },
            {
              "podName": "POD_NAME_2",
              "restarts": 170
            },
            {
              "podName": "POD_NAME_3",
              "restarts": 57
            },
            {
              "podName": "POD_NAME_4",
              "restarts": 53
            },
            {
              "podName": "POD_NAME_5",
              "restarts": 22
            }
          ],
          "numRestartsOnTimeseries": 909,
          "numRestartsOnDB": 1825
        }
      }
    }
  }
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entities:

<details>
<summary>Service entity in Port</summary>

```json showLineNumbers
{
  "identifier": "SERVICE_ID",
  "title": "komodor-agent",
  "blueprint": "komodorService",
  "properties": {
    "serviceId": "KOMODOR_INTERNAL_ID",
    "status": "healthy",
    "cluster_name": "test",
    "workload_kind": "Deployment",
    "namespace_name": "komodor",
    "service_name": "komodor-agent",
    "link_to_komodor": "https://app.komodor.com/services/ACCOUNT_NAME.CLUSTER.SERVICE?workspaceId=null&referer=public-api",
    "labels": {
      "app.kubernetes.io/instance": "komodor-agent",
      "app.kubernetes.io/managed-by": "Helm",
      "app.kubernetes.io/name": "komodor-agent",
      "app.kubernetes.io/version": "X.X.X",
      "helm.sh/chart": "komodor-agent-X.X.X"
    },
    "last_deploy_at": "2025-01-22T08:26:42Z",
    "last_deploy_status": "success"
  }
}
```

</details>

<details>
<summary>Health Monitor entity in Port</summary>

```json showLineNumbers
{
  "identifier": "random-uuid",
  "title": "KIND|CLUSTER|NAMESPACE|NAME",
  "blueprint": "komodorHealthMonitoring",
  "properties": {
    "status": "open",
    "resource_identifier": "KIND-CLUSTER-NAMESPACE-NAME",
    "severity": "medium",
    "supporting_data": {
      "restartingContainers": {
        "containers": [
          {
            "name": "container-name",
            "restarts": 969
          }
        ],
        "restartReasons": {
          "breakdown": [
            {
              "message": "Container Exited With Error - Exit Code: 1",
              "percent": 100,
              "numOccurences": 1825,
              "reason": "ProcessExit"
            }
          ],
          "additionalInfo": {
            "podSamples": [
              {
                "podName": "POD_NAME_1",
                "restarts": 607
              },
              {
                "podName": "POD_NAME_2",
                "restarts": 170
              },
              {
                "podName": "POD_NAME_3",
                "restarts": 57
              },
              {
                "podName": "POD_NAME_4",
                "restarts": 53
              },
              {
                "podName": "POD_NAME_5",
                "restarts": 22
              }
            ],
            "numRestartsOnTimeseries": 909,
            "numRestartsOnDB": 1825
          }
        }
      }
    },
    "komodor_link": "https://app.komodor.com/health/risks/drawer?checkCategory=workload-health&checkType=restartingContainers&violationId=UID&utmSource=port",
    "created_at": "2025-03-20T05:11:33Z",
    "last_evaluated_at": "2025-03-30T00:00:00Z",
    "check_type": "restartingContainers",
    "workload_type": "WORKLOAD_KIND",
    "cluster_name": "CLUSTER_NAME",
    "namespace_name": "NAMESPACE_NAME",
    "workload_name": "NAME"
  },
  "relations": {
    "service": [
      "ServiceUID"
    ]
  }
}
```

</details>

## Connect Komodor services to k8s workloads

### Prerequisites 

- Install Komodor integration.
- Install Port's k8s exporter integration on your cluster.
- Install Komodor agent on your cluster.

### Create the relation
	
1. Navigate to the [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Click on the Komodor Service blueprint.

3. Click on the `...` button in the top right corner, choose `Edit blueprint`, then click on the `Edit JSON` button. 

4. Update the existing JSON by incorporating the following data in it.

    <details>
      <summary><b>Mapping configuration (Click to expand)</b></summary>

      ```json showLineNumbers"
      {
        "relations": {
          "workload": {
            "title": "Workload",
            "target": "workload",
            "required": false,
            "many": false
          }
        }
      }
      ```
      
      </details>


### Set up mapping configuration

1. Navigate to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.

2. Click on the Komodor integration, and scroll to the mapping section in the bottom-left corner.

3. Copy the following configuration and paste it in the editor, then click `Save & Resync`.

    <details>
    <summary><b>Mapping configuration (Click to expand)</b></summary>

    ```yaml showLineNumbers"
      - kind: komodorService
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .kind + "-" + .cluster + "-" + .namespace + "-" + .service
              blueprint: '"komodorService"'
              properties: {}
              relations:
                workload: .service + "-" + .kind + "-" + .namespace + "-" + .cluster
    ```

    </details>

:::important Default values
This assumes that both your Komodor integration and Kubernetes exporter are using their default key and field values. If any mappings or blueprints have been modified in either integration, you may need to adjust these values accordingly.
:::
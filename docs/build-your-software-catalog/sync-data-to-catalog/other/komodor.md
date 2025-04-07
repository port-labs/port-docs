import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import AdvancedConfig from '../../../generalTemplates/\_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"


# Komodor

Port's Komodor integration allows you to model Komodor resources in your software catalog and ingest data into them

## Overview

This integation allows you to:

- Map, organize, and sync your desired Komodor resources and their metadata in Port (See supported resources below)
- Sync your Komodor resources and their metadata to Port

### Supported Resources

The resources that can be ingestd into Port are listed below.
It is possible to modify the default mapping to references the fields in the API response, Dependent on your needs.

- [Services](https://api.komodor.com/api/docs/index.html#/Services/post_api_v2_services_search)
- [Health Monitoring](https://api.komodor.com/api/docs/index.html#/Health%20risks/getHealthRisks)

## Prerequisites

### [Generate a Komodor Api Key](https://help.komodor.com/hc/en-us/articles/22434108566674-Using-the-Komodor-API)

1. Log in to Komodor:
   - Navigate to the Komodor dashboard and log in with your account credentials.
2. Access API Key Management:
   - Click on your account profile or settings in the top-right corner of the dashboard.
   - Select API Keys from the dropdown menu.
3. Create a New Key:
   - Click the Generate Key button.
   - Provide a descriptive name for the API key to help you identify its purpose later (e.g., "CI/CD Pipeline Access").
4. Save the Key:
   - Once generated, the API key will be displayed.
   - Store the API key securely in a secrets manager or an environment variable.

:::note
 Your api key will inherit the permissions of the user that created it.
 Make sure that the user that created the key has the view permissions on the resources you wish to ingest in Port. 
:::

## Setup

Choose the only installation method:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

</Tabs>

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from Komodor's API into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

## Examples

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

Here is an example of the payload structure from Komodor, Any variable is in capital for ease of reading:

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

The combination of the sample payload and the Ocean configuration generates the following Port entity:

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

## Creating relations between komodor service and Ports k8s exporter workload

#### Prequesites 

- Have Komodor integration installed.
- Have Port's k8s exporter integration installed on your cluster
- Have komodor agent installed on your cluster

1. In port, navigate to the komodor integration, and then click on it and scroll to the Mapping section
2. Add the following mapping
```yaml title="mapping"
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
            Workload: .service + "-" + .kind + "-" + .namespace + "-" + .cluster
```
- Note: This is as another kind to the mapping, not as a replacement or addition to the existing komodorService kind.
- This will ensure that komodor service will find and create relations with the k8s workload that exists in port, while not failing to injest data from any cluster you do not have Port k8s exporter installed on.
3. Click `Save & Resync`
4. Navigate to the Data model tab (still in Ports builder section)
5. Click on the Komodor Service blueprint, and modify it so the json ends up having the following relations value: 
```json title="blueprint"
{
  "relations": {
    "Workload": {
      "title": "Workload",
      "target": "workload",
      "required": false,
      "many": false
    }
  }
}
```

:::note
This is only a change in the relations key. There is no need to change the schema or other properties, As long as you don't have another property that is called Workload.
:::

:::important 
This is assuming both your Komodor integration and k8s exporter are using the default values for keys and fields. Any modification to the mappings or blueprints in either Komodor or k8s integration may require changing this values.
:::
---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_servicenow_docker_parameters.mdx"
import HelmParameters from "../templates/\_ocean-advanced-parameters-helm.mdx"
import AdvancedConfig from '../../../generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"

import ServiceNowChangeRequestBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/servicenow/\_example_servicenow_change_request.mdx"
import ServiceNowWebhookConfig from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/servicenow/\_example_servicenow_webhook_config.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"


# ServiceNow

Port's ServiceNow integration allows you to model ServiceNow resources in your software catalog and ingest data into them.


## Overview

This integration allows you to:

- Map and organize your desired ServiceNow resources and their metadata in Port (see supported resources below).

### Supported Resources

The resources that can be ingested from ServiceNow into Port are listed below. 

- `Group` - (`<your-servicenow-url>/api/now/table/sys_user_group`)
- `Service Catalog` - (`<your-servicenow-url>/api/now/table/sc_catalog`)
- `Incident` - (`<your-servicenow-url>/api/now/table/incident`)

:::tip Ingesting extra resources
While the section above only lists three supported resources, Port's ServiceNow integration uses the [ServiceNow Table API](https://developer.servicenow.com/dev.do#!/reference/api/xanadu/rest/c_TableAPI#table-GET) to ingest entities.  
This means you can ingest a lot more resources from your ServiceNow instance as long as the underlying resource can be found in the Table API. All you need is to specify the `table name` as a new `kind` in the [Data sources configuration page](/build-your-software-catalog/sync-data-to-catalog/#customize-your-integrations), and the records from the table will be ingested to Port.
:::



## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2>Prerequisites</h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.


<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Servicenow" />


<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-servicenow-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `SERVICENOW_URL` `SERVICENOW_USERNAME` and `SERVICENOW_PASSWORD`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-servicenow-integration
  type: servicenow
  eventListener:
    type: POLLING
  config:
  // highlight-start
    servicenowUrl: SERVICENOW_URL
    servicenowUsername: SERVICENOW_USERNAME
  // highlight-end
  secrets:
  // highlight-next-line
    servicenowPassword: SERVICENOW_PASSWORD
```
<br/>

2. Install the `my-ocean-servicenow-integration` ArgoCD Application by creating the following `my-ocean-servicenow-integration.yaml` manifest:
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
  name: my-ocean-servicenow-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-servicenow-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-servicenow-integration/values.yaml
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
kubectl apply -f my-ocean-servicenow-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                                | Description                                                                                                                                                                                                                                                                                    | Required |
|------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                          | Your Port client id ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))                                                                                                                                     | ✅        |
| `port.clientSecret`                      | Your Port client secret ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))                                                                                                                                 | ✅        |
| `port.baseUrl`                           | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                        | ✅        |
| `integration.identifier`                 | Change the identifier to describe your integration                                                                                                                                                                                                                                             | ✅        |
| `integration.config.servicenowUsername`  | The ServiceNow account username                                                                                                                                                                                                                                                                | ✅        |
| `integration.secrets.servicenowPassword` | The ServiceNow account password                                                                                                                                                                                                                                                                | ✅        |
| `integration.config.servicenowUrl`       | The ServiceNow instance URL. For example https://example-id.service-now.com                                                                                                                                                                                                                    | ✅        |
| `integration.eventListener.type`         | The event listener type. Read more about [event listeners](https://ocean.getport.io/framework/features/event-listener)                                                                                                                                                                         | ✅        |
| `integration.type`                       | The integration to be installed                                                                                                                                                                                                                                                                | ✅        |
| `scheduledResyncInterval`                | The number of minutes between each resync. When not set the integration will resync for each event listener resync event. Read more about [scheduledResyncInterval](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) | ❌        |
| `initializePortResources`                | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources)       | ❌        |
| `sendRawDataExamples`                    | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                            | ❌        |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">


This workflow/pipeline will run the ServiceNow integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates 
If you want the integration to update Port in real time using webhooks you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option
:::

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `servicenow-integration.yml` workflow file:

```yaml showLineNumbers
name: ServiceNow Exporter Workflow

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
          type: 'servicenow'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            servicenow_username: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SERVICENOW_USERNAME }}
            servicenow_password: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SERVICENOW_PASSWORD }}
            servicenow_url: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SERVICENOW_URL }}
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
        stage('Run ServiceNow Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__SERVICENOW_USERNAME', variable: 'OCEAN__INTEGRATION__CONFIG__SERVICENOW_USERNAME'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__SERVICENOW_PASSWORD', variable: 'OCEAN__INTEGRATION__CONFIG__SERVICENOW_PASSWORD'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__SERVICENOW_URL', variable: 'OCEAN__INTEGRATION__CONFIG__SERVICENOW_URL'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="servicenow"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_USERNAME=$OCEAN__INTEGRATION__CONFIG__SERVICENOW_USERNAME \
                                -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_PASSWORD=$OCEAN__INTEGRATION__CONFIG__SERVICENOW_PASSWORD \
                                -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_URL=$OCEAN__INTEGRATION__CONFIG__SERVICENOW_URL \
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

Here is an example for `servicenow-integration.yml` pipeline file:

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
    integration_type="servicenow"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm --platform=linux/amd64 \
      -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
      -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
      -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
      -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_USERNAME=$(OCEAN__INTEGRATION__CONFIG__SERVICENOW_USERNAME) \
      -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_PASSWORD=$(OCEAN__INTEGRATION__CONFIG__SERVICENOW_PASSWORD) \
      -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_URL=$(OCEAN__INTEGRATION__CONFIG__SERVICENOW_URL) \
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
  INTEGRATION_TYPE: servicenow
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
        -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_USERNAME=$OCEAN__INTEGRATION__CONFIG__SERVICENOW_USERNAME \
        -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_PASSWORD=$OCEAN__INTEGRATION__CONFIG__SERVICENOW_PASSWORD \
        -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_URL=$OCEAN__INTEGRATION__CONFIG__SERVICENOW_URL \
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
resources:
- kind: sys_user_group
  selector:
    query: 'true'
    apiQueryParams:
      sysparmDisplayValue: 'true'
      sysparmExcludeReferenceLink: 'false'
  port:
    entity:
      mappings:
        identifier: .sys_id
        title: .name
        blueprint: '"servicenowGroup"'
        properties:
          description: .description
          isActive: .active
          createdOn: .sys_created_on | (strptime("%Y-%m-%d %H:%M:%S") | strftime("%Y-%m-%dT%H:%M:%SZ"))
          createdBy: .sys_created_by
- kind: sc_catalog
  selector:
    query: 'true'
    apiQueryParams:
      sysparmDisplayValue: 'true'
      sysparmExcludeReferenceLink: 'false'
  port:
    entity:
      mappings:
        identifier: .sys_id
        title: .title
        blueprint: '"servicenowCatalog"'
        properties:
          description: .description
          isActive: .active
          createdOn: .sys_created_on | (strptime("%Y-%m-%d %H:%M:%S") | strftime("%Y-%m-%dT%H:%M:%SZ"))
          createdBy: .sys_created_by
- kind: incident
  selector:
    query: 'true'
    apiQueryParams:
      sysparmDisplayValue: 'true'
      sysparmExcludeReferenceLink: 'false'
  port:
    entity:
      mappings:
        identifier: .number | tostring
        title: .short_description
        blueprint: '"servicenowIncident"'
        properties:
          category: .category
          reopenCount: .reopen_count
          severity: .severity
          assignedTo: .assigned_to.link
          urgency: .urgency
          contactType: .contact_type
          createdOn: .sys_created_on | (strptime("%Y-%m-%d %H:%M:%S") | strftime("%Y-%m-%dT%H:%M:%SZ"))
          createdBy: .sys_created_by
          isActive: .active
          priority: .priority
```

</details>



## Examples

Examples of blueprints and the relevant integration configurations:

### Group

<details>
<summary>Group blueprint</summary>

```json showLineNumbers
{
  "identifier": "servicenowGroup",
  "title": "Servicenow Group",
  "icon": "Servicenow",
  "schema": {
    "properties": {
      "description": {
        "title": "Description",
        "type": "string"
      },
      "isActive": {
        "title": "Is active",
        "type": "boolean"
      },
      "createdOn": {
        "title": "Created On",
        "type": "string",
        "format": "date-time"
      },
      "createdBy": {
        "title": "Created By",
        "type": "string"
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
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: sys_user_group
    selector:
      query: "true"
      apiQueryParams:
        sysparmDisplayValue: 'true'
        sysparmExcludeReferenceLink: 'false'
    port:
      entity:
        mappings:
          identifier: .sys_id
          title: .name
          blueprint: '"servicenowGroup"'
          properties:
            description: .description
            isActive: .active
            createdOn: '.sys_created_on | (strptime("%Y-%m-%d %H:%M:%S") | strftime("%Y-%m-%dT%H:%M:%SZ"))'
            createdBy: .sys_created_by
```

</details>

### Service Catalog

<details>
<summary>Service catalog blueprint</summary>

```json showLineNumbers
{
  "identifier": "servicenowCatalog",
  "title": "Servicenow Catalog",
  "icon": "Servicenow",
  "schema": {
    "properties": {
      "description": {
        "title": "Description",
        "type": "string"
      },
      "isActive": {
        "title": "Is Active",
        "type": "boolean"
      },
      "createdOn": {
        "title": "Created On",
        "type": "string",
        "format": "date-time"
      },
      "createdBy": {
        "title": "Created By",
        "type": "string"
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
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: sc_catalog
    selector:
      query: "true"
      apiQueryParams:
        sysparmDisplayValue: 'true'
        sysparmExcludeReferenceLink: 'false'
    port:
      entity:
        mappings:
          identifier: .sys_id
          title: .title
          blueprint: '"servicenowCatalog"'
          properties:
            description: .description
            isActive: .active
            createdOn: '.sys_created_on | (strptime("%Y-%m-%d %H:%M:%S") | strftime("%Y-%m-%dT%H:%M:%SZ"))'
            createdBy: .sys_created_by
```

</details>

### Incident

<details>
<summary>Incident blueprint</summary>

```json showLineNumbers
{
  "identifier": "servicenowIncident",
  "title": "Servicenow Incident",
  "icon": "Servicenow",
  "schema": {
    "properties": {
      "category": {
        "title": "Category",
        "type": "string"
      },
      "reopenCount": {
        "title": "Reopen Count",
        "type": "string"
      },
      "severity": {
        "title": "Severity",
        "type": "string"
      },
      "assignedTo": {
        "title": "Assigned To",
        "type": "string",
        "format": "url"
      },
      "urgency": {
        "title": "Urgency",
        "type": "string"
      },
      "contactType": {
        "title": "Contact Type",
        "type": "string"
      },
      "createdOn": {
        "title": "Created On",
        "type": "string",
        "format": "date-time"
      },
      "createdBy": {
        "title": "Created By",
        "type": "string"
      },
      "isActive": {
        "title": "Is Active",
        "type": "boolean"
      },
      "priority": {
        "title": "Priority",
        "type": "string"
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
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: incident
    selector:
      query: "true"
      apiQueryParams:
        sysparmDisplayValue: 'true'
        sysparmExcludeReferenceLink: 'false'
    port:
      entity:
        mappings:
          identifier: .number | tostring
          title: .short_description
          blueprint: '"servicenowIncident"'
          properties:
            category: .category
            reopenCount: .reopen_count
            severity: .severity
            assignedTo: .assigned_to.link
            urgency: .urgency
            contactType: .contact_type
            createdOn: '.sys_created_on | (strptime("%Y-%m-%d %H:%M:%S") | strftime("%Y-%m-%dT%H:%M:%SZ"))'
            createdBy: .sys_created_by
            isActive: .active
            priority: .priority
```

</details>

### Filtering ServiceNow resources
Port's ServiceNow integration provides an option to filter the data that is retrieved from the ServiceNow Table API using the following attributes:

1. `sysparmDisplayValue`: Determines the type of data returned, either the actual values from the database or the display values of the fields. The default is `true`
2. `sysparmFields`: Comma-separated list of fields to return in the response
3. `sysparmExcludeReferenceLink`: Flag that indicates whether to exclude Table API links for reference fields. The default is `false`
4. `sysparmQuery`: Encoded query used to filter the result set. The syntax is `<col_name><operator><value>`:
    1. `<col_name>`: Name of the table column to filter against
    2. `<operator>`: =, !=, ^, ^OR, LIKE, STARTSWITH, ENDSWITH, `ORDERBY<col_name>`, `ORDERBYDESC<col_name>`
    3. `<value>`: Value to match against

    Queries can be chained using ^ or ^OR for AND/OR logic. An example query could be this: `active=true^nameLIKEdev^urgency=3` which returns all active incidents with an urgency level of 3 and have a name like `dev` 

The filtering attributes described above can be enabled using the `selector.apiQueryParams` path, for example:

```yaml showLineNumbers
- kind: <name of table>
  selector:
    query: "true"
    apiQueryParams:
      sysparmDisplayValue: 'true'
      sysparmExcludeReferenceLink: 'false'
      sysparmQuery: active=true^nameLIKEdev^urgency=3
      sysparmFields: sys_id,priority,created_by,state,active
```

## Let's Test It

This section includes a sample response data from ServiceNow. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from ServiceNow:

<details>
<summary> Group response data</summary>

```json showLineNumbers
{
  "parent": "",
  "manager": "",
  "roles": "",
  "sys_mod_count": "0",
  "active": "true",
  "description": "\n\t\tGroup for all people who have the Analytics Admin role\n\t",
  "source": "",
  "sys_updated_on": "2020-03-17 11:39:14",
  "sys_tags": "",
  "type": "",
  "sys_id": "019ad92ec7230010393d265c95c260dd",
  "sys_updated_by": "admin",
  "cost_center": "",
  "default_assignee": "",
  "sys_created_on": "2020-03-17 11:39:14",
  "name": "Analytics Settings Managers",
  "exclude_manager": "false",
  "email": "",
  "include_members": "false",
  "sys_created_by": "admin"
}
```

</details>

<details>
<summary> Service Catalog response data</summary>

```json showLineNumbers
{
  "manager": {
    "link": "https://dev229583.service-now.com/api/now/table/sys_user/6816f79cc0a8016401c5a33be04be441",
    "value": "6816f79cc0a8016401c5a33be04be441"
  },
  "sys_mod_count": "0",
  "active": "true",
  "description": "Description for service catalog",
  "desktop_continue_shopping": "",
  "enable_wish_list": "false",
  "sys_updated_on": "2023-12-14 15:30:54",
  "sys_tags": "",
  "title": "Test Service Catalog",
  "sys_class_name": "sc_catalog",
  "desktop_image": "",
  "sys_id": "56e48e6a9743311083e6ff0de053af56",
  "sys_package": {
    "link": "https://dev229583.service-now.com/api/now/table/sys_package/global",
    "value": "global"
  },
  "desktop_home_page": "",
  "sys_update_name": "sc_catalog_56e48e6a9743311083e6ff0de053af56",
  "sys_updated_by": "admin",
  "sys_created_on": "2023-12-14 15:30:54",
  "sys_name": "Test Service Catalog",
  "sys_scope": {
    "link": "https://dev229583.service-now.com/api/now/table/sys_scope/global",
    "value": "global"
  },
  "editors": "",
  "sys_created_by": "admin",
  "sys_policy": ""
}
```

</details>

<details>
<summary> Incident response data</summary>

```json showLineNumbers
{
  "parent": "",
  "made_sla": "true",
  "caused_by": "",
  "watch_list": "",
  "upon_reject": "cancel",
  "sys_updated_on": "2016-12-14 02:46:44",
  "child_incidents": "0",
  "hold_reason": "",
  "origin_table": "",
  "task_effective_number": "INC0000060",
  "approval_history": "",
  "number": "INC0000060",
  "resolved_by": {
    "link": "https://dev229583.service-now.com/api/now/v1/table/sys_user/5137153cc611227c000bbd1bd8cd2007",
    "value": "5137153cc611227c000bbd1bd8cd2007"
  },
  "sys_updated_by": "employee",
  "opened_by": {
    "link": "https://dev229583.service-now.com/api/now/v1/table/sys_user/681ccaf9c0a8016400b98a06818d57c7",
    "value": "681ccaf9c0a8016400b98a06818d57c7"
  },
  "user_input": "",
  "sys_created_on": "2016-12-12 15:19:57",
  "sys_domain": {
    "link": "https://dev229583.service-now.com/api/now/v1/table/sys_user_group/global",
    "value": "global"
  },
  "state": "7",
  "route_reason": "",
  "sys_created_by": "employee",
  "knowledge": "false",
  "order": "",
  "calendar_stc": "102197",
  "closed_at": "2016-12-14 02:46:44",
  "cmdb_ci": {
    "link": "https://dev229583.service-now.com/api/now/v1/table/cmdb_ci/109562a3c611227500a7b7ff98cc0dc7",
    "value": "109562a3c611227500a7b7ff98cc0dc7"
  },
  "delivery_plan": "",
  "contract": "",
  "impact": "2",
  "active": "false",
  "work_notes_list": "",
  "business_service": {
    "link": "https://dev229583.service-now.com/api/now/v1/table/cmdb_ci_service/27d32778c0a8000b00db970eeaa60f16",
    "value": "27d32778c0a8000b00db970eeaa60f16"
  },
  "business_impact": "",
  "priority": "3",
  "sys_domain_path": "/",
  "rfc": "",
  "time_worked": "",
  "expected_start": "",
  "opened_at": "2016-12-12 15:19:57",
  "business_duration": "1970-01-01 08:00:00",
  "group_list": "",
  "work_end": "",
  "caller_id": {
    "link": "https://dev229583.service-now.com/api/now/v1/table/sys_user/681ccaf9c0a8016400b98a06818d57c7",
    "value": "681ccaf9c0a8016400b98a06818d57c7"
  },
  "reopened_time": "",
  "resolved_at": "2016-12-13 21:43:14",
  "approval_set": "",
  "subcategory": "email",
  "work_notes": "",
  "universal_request": "",
  "short_description": "Unable to connect to email",
  "close_code": "Solved (Permanently)",
  "correlation_display": "",
  "delivery_task": "",
  "work_start": "",
  "assignment_group": {
    "link": "https://dev229583.service-now.com/api/now/v1/table/sys_user_group/287ebd7da9fe198100f92cc8d1d2154e",
    "value": "287ebd7da9fe198100f92cc8d1d2154e"
  },
  "additional_assignee_list": "",
  "business_stc": "28800",
  "cause": "",
  "description": "I am unable to connect to the email server. It appears to be down.",
  "origin_id": "",
  "calendar_duration": "1970-01-02 04:23:17",
  "close_notes": "This incident is resolved.",
  "notify": "1",
  "service_offering": "",
  "sys_class_name": "incident",
  "closed_by": {
    "link": "https://dev229583.service-now.com/api/now/v1/table/sys_user/681ccaf9c0a8016400b98a06818d57c7",
    "value": "681ccaf9c0a8016400b98a06818d57c7"
  },
  "follow_up": "",
  "parent_incident": "",
  "sys_id": "1c741bd70b2322007518478d83673af3",
  "contact_type": "self-service",
  "reopened_by": "",
  "incident_state": "7",
  "urgency": "2",
  "problem_id": "",
  "company": {
    "link": "https://dev229583.service-now.com/api/now/v1/table/core_company/31bea3d53790200044e0bfc8bcbe5dec",
    "value": "31bea3d53790200044e0bfc8bcbe5dec"
  },
  "reassignment_count": "2",
  "activity_due": "2016-12-13 01:26:36",
  "assigned_to": {
    "link": "https://dev229583.service-now.com/api/now/v1/table/sys_user/5137153cc611227c000bbd1bd8cd2007",
    "value": "5137153cc611227c000bbd1bd8cd2007"
  },
  "severity": "3",
  "comments": "",
  "approval": "not requested",
  "sla_due": "",
  "comments_and_work_notes": "",
  "due_date": "",
  "sys_mod_count": "15",
  "reopen_count": "0",
  "sys_tags": "",
  "escalation": "0",
  "upon_approval": "proceed",
  "correlation_id": "",
  "location": "",
  "category": "inquiry"
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Group entity in Port</summary>

```json showLineNumbers
{
  "identifier": "019ad92ec7230010393d265c95c260dd",
  "title": "Analytics Settings Managers",
  "icon": "ServiceNow",
  "blueprint": "servicenowGroup",
  "team": [],
  "properties": {
    "description": "\n\t\tGroup for all people who have the Analytics Admin role\n\t",
    "isActive": true,
    "createdOn": "2020-03-17T11:39:14Z",
    "createdBy": "admin"
  },
  "relations": {},
  "createdAt": "2023-12-18T08:37:21.637Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-12-18T08:37:21.637Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Service catalog entity in Port</summary>

```json showLineNumbers
{
  "identifier": "56e48e6a9743311083e6ff0de053af56",
  "title": "Test Service Catalog",
  "icon": "ServiceNow",
  "blueprint": "servicenowCatalog",
  "team": [],
  "properties": {
    "description": "Description for service catalog",
    "isActive": true,
    "createdOn": "2023-12-14T15:30:54Z",
    "createdBy": "admin"
  },
  "relations": {},
  "createdAt": "2023-12-18T08:37:28.087Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-12-18T08:37:28.087Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Incident entity in Port</summary>

```json showLineNumbers
{
  "identifier": "INC0000060",
  "title": "Unable to connect to email",
  "icon": "ServiceNow",
  "blueprint": "servicenowIncident",
  "team": [],
  "properties": {
    "category": "inquiry",
    "reopenCount": "0",
    "severity": "3",
    "assignedTo": "https://dev229583.service-now.com/api/now/table/sys_user/5137153cc611227c000bbd1bd8cd2007",
    "urgency": "2",
    "contactType": "self-service",
    "createdOn": "2016-12-12T15:19:57Z",
    "createdBy": "employee",
    "isActive": false,
    "priority": "3"
  },
  "relations": {},
  "createdAt": "2023-12-15T14:52:06.347Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-12-15T15:34:18.248Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

## Relevant Guides

For relevant guides and examples, see the [guides section](https://docs.port.io/guides?tags=ServiceNow).

## Alternative installation via webhook
While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from ServiceNow. If so, use the following instructions:

**Note** that when using the webhook installation method, data will be ingested into Port only when the webhook is triggered.

<details>

<summary><b>Webhook installation (click to expand)</b></summary>

In this example you are going to create a webhook integration between [ServiceNow](https://www.servicenow.com/) and Port, which will ingest ServiceNow change requests into Port. This integration will involve setting up a webhook to receive notifications from Servicenow whenever a change request is created or updated.

<h2>Import ServiceNow change request</h2>

<h3>Port configuration</h3>

Create the blueprint definition:

<details>
<summary>Servicenow change request blueprint</summary>

<ServiceNowChangeRequestBlueprint/>

</details>


Create the following webhook configuration [using Port UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>Servicenow webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Servicenow Mapper`;
   2. Identifier : `servicenow_mapper`;
   3. Description : `A webhook configuration to map Servicenow change requests to Port`;
   4. Icon : `Servicenow`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <ServiceNowWebhookConfig/>

3. Scroll down to **Advanced settings**, leave the form blank and click **Save** at the bottom of the page

</details>

<h3>Create a webhook in ServiceNow</h3>

1. Log in to your [ServiceNow](https://www.servicenow.com/) instance
2. Go to **System Definition** > **Business Rules**.
3. Click **New** to create a business rule:
   - **Name**: `Change Request Webhook`
   - **Table**: `Change Request [change_request]`
   - **Is Active**, **Advanced**: Check both
4. In the **When to run** tab, provide the following details:
   - **Insert**, **Update**: Check both
   - **When**: `Async`
   - **Order**: leave the default value of `100`
5. In the **Advanced** tab, add the following script:

<details>
<summary>ServiceNow configuration code (click to expand)</summary>

```javascript
(function executeRule(current, previous /*null when async*/) {

    gs.info('Triggering outbound REST API call for Change Request ID: ' + current.number);

    if (current == null){
        gs.error('Current record is null. Exiting the Business Rule.');
        return;
    }

    // Prepare the REST message
    var restMessage = new sn_ws.RESTMessageV2();
    restMessage.setHttpMethod('POST');
    restMessage.setEndpoint('https://ingest.getport.io/<WEBHOOK_KEY>');
    restMessage.setRequestHeader('Content-Type', 'application/json');

    // Construct the payload with additional fields
    var payload = {
        "sys_id": current.sys_id.toString(),
        "number": current.number.toString(),
        "state": current.state.toString(),
        "short_description": current.short_description.toString(),
        "description": current.description.toString(),
        "sys_updated_by": current.sys_updated_by.toString(),
        "sys_updated_on": current.sys_updated_on.toString(),
        "approval": current.approval.toString(),
        
        "priority": current.priority ? current.priority.toString() : '',
        "phase": current.phase ? current.phase.toString() : '',
        "business_service": current.business_service ? current.business_service.toString() : '',
        "phase_state": current.phase_state ? current.phase_state.toString() : '',
        "category": current.category ? current.category.toString() : '',
        "tags": current.u_external_tag ? current.sys_tags.toString() : '',
        
        "impact": current.impact ? current.impact.toString() : '',
        "urgency": current.urgency ? current.urgency.toString() : '',
        "risk": current.risk ? current.risk.toString() : '',
        "assignment_group": current.assignment_group ? current.assignment_group.toString() : '',
        "opened_by": current.opened_by ? current.opened_by.toString() : '',
        "sys_domain": current.sys_domain ? current.sys_domain.toString() : ''
    };

    // Set the request body with the payload
    restMessage.setRequestBody(JSON.stringify(payload));

    // Execute the outbound REST call
    try {
        var response = restMessage.execute();  // Use async to avoid blocking
        gs.info('Business Rule executed for Change Request: ' + current.number.toString());
        gs.info('Response Status Code: ' + response.getStatusCode());
        gs.info('Response Body: ' + response.getBody());
    } catch (error) {
        gs.error('Error in outbound REST call: ' + error.message);
    }

})(current, previous);
```
</details>

6. Save and activate the Business Rule.


Done! any change that happens to your change requests in ServiceNow will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2>Let's Test It</h2>

This section includes a sample webhook event sent from ServiceNow when a change request is created or updated. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

<h3>Payload</h3>

Here is an example of the payload structure sent to the webhook URL when a ServiceNow change request is created or updated:

<details>
<summary>Webhook event payload</summary>

```json showLineNumbers
{
  "body": {
    "sys_id": "8a76536683f5de104665c730ceaad3bd",
    "number": "CHG0030040",
    "state": "3",
    "short_description": "Automated change request from GitLab CI/CD",
    "description": "needs approval",
    "sys_updated_by": "admin",
    "sys_updated_on": "2024-11-14 10:57:08",
    "approval": "approved",
    "priority": "2",
    "phase": "requested",
    "business_service": "getport-labs/awesome-projec",
    "phase_state": "open",
    "category": "Network",
    "tags": "r_QWB886MmmkIBRGD5",
    "impact": "3",
    "urgency": "3",
    "risk": "3",
    "assignment_group": "287ebd7da9fe198100f92cc8d1d2154e",
    "opened_by": "6816f79cc0a8016401c5a33be04be441",
    "sys_domain": "global"
  },
  "queryParams": {}
}
```

</details>

<h3>Mapping Result</h3>

The combination of the sample payload and the webhook configuration generates the following Port entity:

```json showLineNumbers
{
    "identifier": "8a76536683f5de104665c730ceaad3bd",
    "title": "Automated change request from GitLab CI/CD",
    "blueprint": "servicenowChangeRequest",
    "properties": {
      "number": "CHG0030040",
      "state": "open",
      "approval": "approved",
      "category": "Network",
      "priority": "2",
      "description": "needs approval",
      "service": "getport-labs/awesome-projec",
      "tags": "r_QWB886MmmkIBRGD5",
      "createdOn": "2024-11-14 10:57:08",
      "createdBy": "6816f79cc0a8016401c5a33be04be441"
    },
    "relations": {},
    "filter": true
  }
```
</details>

## Alternative authentication via OAuth

This guide outlines how your team can configure and manage your own Ocean integration with ServiceNow using OAuth 2.0 authentication.

<details>

<summary><b>Migration Path to OAuth (click to expand)</b></summary>

The existing ServiceNow integration uses basic authentication configured via `integrations/servicenow/.port/spec.yaml`, requiring:
- `servicenowUrl`  
- `servicenowUsername`
- `servicenowPassword`

The OAuth approach replaces this with secure token management handled by Port.

#### Step 1: Modify Configuration (spec.yaml)

Update your `spec.yaml` file to use Port's SaaS OAuth flow:

```yaml
saas:
  enabled: true
  liveEvents:
    enabled: false
  oauthConfiguration:
    requiredSecrets:
      - name: servicenowToken
        value: '.oauthData.accessToken'
        description: 'Access Token for ServiceNow OAuth2 integration'
    valuesOverride:
      integrationSpec:
        apiUrl: '{{ .configs.servicenowUrl }}'
```

This configuration:
- Enables OAuth authentication
- Instructs Port to manage token exchange
- Makes tokens securely available to your integration code
- Maintains URL configuration flexibility

#### Step 2: Refactor Integration Client (client.py)

Replace the basic auth logic with a subclass of `OAuthClient`:

```python
from port_ocean.clients.auth.oauth_client import OAuthClient

class ServicenowClient(OAuthClient):
    def __init__(self, servicenow_url: str, servicenow_token: str | None = None):
        super().__init__()
        self.servicenow_url = servicenow_url
        self.servicenow_token = servicenow_token
        self.http_client = http_async_client
        self.http_client.headers.update(self.headers)

    def _get_auth_header(self) -> str:
        token = self.external_access_token or self.servicenow_token
        if not token:
            raise ValueError("ServiceNow token not found")
        return f"Bearer {token}"

    def refresh_request_auth_creds(self, request: httpx.Request) -> httpx.Request:
        request.headers["Authorization"] = self._get_auth_header()
        return request

    @property
    def headers(self) -> dict[str, Any]:
        return {
            "Authorization": self._get_auth_header(),
            "Content-Type": "application/json",
        }

```

### Troubleshooting OAuth Integration

#### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Token not found | OAuth not configured | Check `spec.yaml` configuration |
| 401 Unauthorized | Invalid/expired token | Verify OAuth setup in ServiceNow |
| Connection timeout | Network/firewall issues | Check connectivity and timeout settings |

#### Debugging Steps

1. **Verify OAuth Configuration**:
   ```bash
   # Check if OAuth is enabled
   grep -A 10 "oauthConfiguration" .port/spec.yaml
   ```

2. **Check Token Availability**:
   ```python
   # In your integration code
   logger.info(f"External token available: {bool(self.external_access_token)}")
   logger.info(f"Local token available: {bool(self.servicenow_token)}")
   ```

3. **Test API Connectivity**:
   ```python
   # Test basic connectivity
   response = await client.http_client.get(f"{base_url}/api/now/table/sys_user")
   logger.info(f"API Response Status: {response.status_code}")
   ```

</details>
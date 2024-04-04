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

# ServiceNow

Our ServiceNow integration allows you to import `sys_user_group`, `sc_catalog`, and `incident` from your ServiceNow instance into Port, according to your mapping and definitions.

- A `sys_user_group` corresponds to user groups in ServiceNow.
- A `sc_catalog` corresponds to service catalogs in ServiceNow.
- An `incident` represents incidents and tickets within ServiceNow.

## Common use cases

- Map `sys_user_group`, `sc_catalog`, and `incident` in your ServiceNow account.

## Prerequisites

<Prerequisites />

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                                | Description                                                                                                                                                      | Required |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `port.clientId`                          | Your Port client id ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `port.clientSecret`                      | Your Port client secret ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) | ✅       |
| `integration.identifier`                 | Change the identifier to describe your integration                                                                                                               | ✅       |
| `integration.config.servicenowUsername`  | The ServiceNow account username                                                                                                                                  | ✅       |
| `integration.secrets.servicenowPassword` | The ServiceNow account password                                                                                                                                  | ✅       |
| `integration.config.servicenowUrl`       | The ServiceNow instance URL. For example https://example-id.service-now.com                                                                                      | ✅       |

<HelmParameters />

<br/>

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-servicenow-integration port-labs/port-ocean \
	--set port.clientId="CLIENT_ID"  \
	--set port.clientSecret="CLIENT_SECRET"  \
	--set initializePortResources=true  \
	--set integration.identifier="my-servicenow-integration"  \
	--set integration.type="servicenow"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.config.servicenowUsername="<SERVICENOW_USERNAME>"  \
	--set integration.secrets.servicenowPassword="<SERVICENOW_PASSWORD>"  \
    --set integration.config.servicenowUrl="<SERVICENOW_URL>"
```
</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

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
kubectl apply -f my-ocean-servicenow-integration.yaml
```
</TabItem>
</Tabs>

</TabItem>

<TabItem value="one-time" label="Scheduled">
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

This workflow will run the ServiceNow integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `servicenow-integration.yml` workflow file:

```yaml showLineNumbers
name: ServiceNow Exporter Workflow

# This workflow responsible for running ServiceNow exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with: 
          type: 'servicenow'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          config: |
          servicenow_username: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SERVICENOW_USERNAME }}
          servicenow_password: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SERVICENOW_PASSWORD }}
          servicenow_url: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SERVICENOW_URL }}

```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the ServiceNow integration once and then exit, this is useful for **scheduled** ingestion of data.

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
                                -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_USERNAME=$OCEAN__INTEGRATION__CONFIG__SERVICENOW_USERNAME \
                                -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_PASSWORD=$OCEAN__INTEGRATION__CONFIG__SERVICENOW_PASSWORD \
                                -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_URL=$OCEAN__INTEGRATION__CONFIG__SERVICENOW_URL \
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
<AzurePremise name="ServiceNow" />

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
      -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_USERNAME=${OCEAN__INTEGRATION__CONFIG__SERVICENOW_USERNAME} \
      -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_PASSWORD=${OCEAN__INTEGRATION__CONFIG__SERVICENOW_PASSWORD} \
      -e OCEAN__INTEGRATION__CONFIG__SERVICENOW_URL=${OCEAN__INTEGRATION__CONFIG__SERVICENOW_URL} \
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

## Ingesting ServiceNow objects

The ServiceNow integration uses a YAML configuration to describe the process of loading data into the developer portal. See [examples](#examples) below.

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from ServiceNow's API events.

### Configuration structure

The integration configuration determines which resources will be queried from ServiceNow, and which entities and properties will be created in Port.

:::tip Supported resources and more
Our ServiceNow integration currently supports the below resources for the mapping configuration. It is possible to extend the current capabilities by referencing any table that is supported in the [ServiceNow Table API](https://developer.servicenow.com/dev.do#!/reference/api/utah/rest/c_TableAPI#table-GET). When choosing this approach, the `kind` key in the mapping configuration should match the table name in ServiceNow as the integration uses the value of the `kind` key to fetch data from the Table API.

- User Groups
- Service Catalog
- Incident

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: sc_catalog
      selector:
      ...
  ```

- The `kind` key is a specifier for a ServiceNow object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: sc_catalog
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: sc_catalog
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-end
      port:
  ```

- The `port`, `entity` and the `mappings` keys are used to map the ServiceNow object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: sc_catalog
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one ServiceNow object to a Port entity. Each value is a JQ query.
            identifier: .sys_id
            title: .title
            blueprint: '"servicenowCatalog"'
            properties:
              description: .description
              isActive: .active
              createdBy: .sys_created_by
        # highlight-end
    - kind: sc_catalog # In this instance sc_catalog is mapped again with a different filter
      selector:
        query: '.title == "MyServiceCatalogName"'
      port:
        entity:
          mappings: ...
  ```

  :::tip Blueprint key
  Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

### Ingest data into Port

To ingest ServiceNow objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select the Data Sources tab at the left sidebar.
3. Click on `+ Data Source` at the top right corner.
4. Select ServiceNow under the Incident Management category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Run the installation command.
7. Click `Next` and you can view the integration configuration and update it as necessary.

## Examples

Examples of blueprints and the relevant integration configurations:

### Group

<details>
<summary>Group blueprint</summary>

```json showLineNumbers
{
  "identifier": "servicenowGroup",
  "title": "Servicenow Group",
  "icon": "Service",
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
resources:
  - kind: sys_user_group
    selector:
      query: "true"
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
  "icon": "Service",
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
resources:
  - kind: sc_catalog
    selector:
      query: "true"
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
  "icon": "Service",
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
resources:
  - kind: incident
    selector:
      query: "true"
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
  "icon": null,
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
  "icon": null,
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
  "icon": null,
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

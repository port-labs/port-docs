---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_pagerduty_docker_params.mdx"
import AdvancedConfig from '../../../../generalTemplates/\_ocean_advanced_configuration_note.md'
import PagerDutyServiceBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/pagerduty/\_example_pagerduty_service.mdx"
import PagerDutyIncidentBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/pagerduty/\_example_pagerduty_incident.mdx"
import PagerDutyWebhookConfig from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/pagerduty/\_example_pagerduty_webhook_config.mdx"
import PagerDutyWebhookHistory from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/pagerduty/\_example_pagerduty_webhook_history_config.mdx"
import PagerDutyScript from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/pagerduty/\_example_pagerduty_shell_history_config.mdx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"

# PagerDuty

Port's PagerDuty integration allows you to model PagerDuty resources in your software catalog and ingest data into them.



## Overview

This integration allows you to:

- Map and organize your desired PagerDuty resources and their metadata in Port (see supported resources below).
- Watch for PagerDuty object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.


### Supported Resources

The resources that can be ingested from PagerDuty into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`Schedule`](https://developer.pagerduty.com/api-reference/846ecf84402bb-list-schedules)
- [`Oncall`](https://developer.pagerduty.com/api-reference/3a6b910f11050-list-all-of-the-on-calls)
- [`Service`](https://developer.pagerduty.com/api-reference/e960cca205c0f-list-services)
- [`Incident`](https://developer.pagerduty.com/api-reference/9d0b4b12e36f9-list-incidents)
- [`Escalation Policy`](https://developer.pagerduty.com/api-reference/51b21014a4f5a-list-escalation-policies)


## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (Self-hosted)">

<h2> Prerequisites </h2>

<Prerequisites />

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                        | Description                                                                                                             | Required |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------- |
| `port.clientId`                  | Your port client id                                                                                                     | ✅      |
| `port.clientSecret`              | Your port client secret                                                                                                 | ✅      |
| `port.baseUrl`                   | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                 | ✅      |
| `integration.identifier`         | Change the identifier to describe your integration                                                                      | ✅      |
| `integration.type`               | The integration type                                                                                                    | ✅      |
| `integration.eventListener.type` | The event listener type                                                                                                 | ✅      |
| `integration.secrets.token`      | PagerDuty API token                                                                                                | ✅      |
| `integration.config.apiUrl`      | Pagerduty api url. If not specified, the default will be https://api.pagerduty.com                                      | ✅      |
| `integration.config.appHost`     | The host of the Port Ocean app. Used to set up the integration endpoint as the target for Webhooks created in PagerDuty | ✅       |
| `scheduledResyncInterval`        | The number of minutes between each resync                                                                               | ❌      |
| `initializePortResources`        | Default true, When set to true the integration will create default blueprints and the port App config Mapping           | ❌      |
| `sendRawDataExamples`       | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true  | ❌      |

<br/>

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-pagerduty-integration port-labs/port-ocean \
  --set port.clientId="PORT_CLIENT_ID"  \
  --set port.clientSecret="PORT_CLIENT_SECRET"  \
  --set port.baseUrl="https://api.getport.io"  \
  --set initializePortResources=true  \
  --set sendRawDataExamples=true \
  --set scheduledResyncInterval=120  \
  --set integration.identifier="my-pagerduty-integration"  \
  --set integration.type="pagerduty"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.secrets.token="string"  \
  --set integration.config.apiUrl="string"
```
<PortApiRegionTip/>
</TabItem>

<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-pagerduty-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `PAGERDUTY_API_URL` and `PAGERDUTY_API_TOKEN`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-pagerduty-integration
  type: pagerduty
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    apiUrl: PAGERDUTY_API_URL
  secrets:
  // highlight-next-line
    token: PAGERDUTY_API_TOKEN
```
<br/>

2. Install the `my-ocean-pagerduty-integration` ArgoCD Application by creating the following `my-ocean-pagerduty-integration.yaml` manifest:
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
  name: my-ocean-pagerduty-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-pagerduty-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-pagerduty-integration/values.yaml
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
kubectl apply -f my-ocean-pagerduty-integration.yaml
```
</TabItem>
</Tabs>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the PagerDuty integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `pagerduty-integration.yml` workflow file:

```yaml showLineNumbers
name: PagerDuty Exporter Workflow

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
          type: 'pagerduty'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__TOKEN }} 
            api_url: ${{ secrets.OCEAN__INTEGRATION__CONFIG__API_URL }} 
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">

This pipeline will run the PagerDuty integration once and then exit, this is useful for **scheduled** ingestion of data.

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
        stage('Run PagerDuty Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__TOKEN'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__API_URL', variable: 'OCEAN__INTEGRATION__CONFIG__API_URL'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="pagerduty"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__TOKEN=$OCEAN__INTEGRATION__CONFIG__TOKEN \
                                -e OCEAN__INTEGRATION__CONFIG__API_URL=$OCEAN__INTEGRATION__CONFIG__API_URL \
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
<AzurePremise name="PagerDuty" />

<DockerParameters />

<br/>

Here is an example for `pagerduty-integration.yml` pipeline file:

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
    integration_type="pagerduty"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"
    
    docker run -i --rm --platform=linux/amd64 \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__TOKEN=$(OCEAN__INTEGRATION__CONFIG__TOKEN) \
        -e OCEAN__INTEGRATION__CONFIG__API_URL=$(OCEAN__INTEGRATION__CONFIG__API_URL) \
        -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
        -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $image_name

    exit $?
  displayName: 'Ingest Data into Port'

```

  </TabItem>
<TabItem value="gitlab" label="GitLab">
This workflow will run the PagerDuty integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Realtime updates in Port
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

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
  INTEGRATION_TYPE: pagerduty
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
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true  \
        -e OCEAN__INTEGRATION__CONFIG__TOKEN=$OCEAN__INTEGRATION__CONFIG__TOKEN \
        -e OCEAN__INTEGRATION__CONFIG__API_URL=$OCEAN__INTEGRATION__CONFIG__API_URL \
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


## Capabilities

### Ingesting service analytics
To enrich your PagerDuty service entities with analytics data, follow the steps below:

1. Update the service blueprint to include analytics properties. You can add any property that is returned from the [PagerDuty aggregated service analytics API](https://developer.pagerduty.com/api-reference/694e92fe4f943-get-aggregated-service-data)
    <details>
    <summary>Updated service blueprint</summary>

    ```json showLineNumbers
    {
      "identifier":"pagerdutyService",
      "description":"This blueprint represents a PagerDuty service in our software catalog",
      "title":"PagerDuty Service",
      "icon":"pagerduty",
      "schema":{
          "properties":{
            "status":{
                "title":"Status",
                "type":"string"
            },
            "url":{
                "title":"URL",
                "type":"string",
                "format":"url"
            },
            "oncall":{
                "title":"On Call",
                "type":"array",
                "items":{
                  "type":"string",
                  "format":"user"
                }
            },
            # highlight-start
            "meanSecondsToResolve":{
                "title":"Mean Seconds to Resolve",
                "type":"number"
            },
            "meanSecondsToFirstAck":{
                "title":"Mean Seconds to First Acknowledge",
                "type":"number"
            },
            "meanSecondsToEngage":{
                "title":"Mean Seconds to Engage",
                "type":"number"
            },
            "totalIncidentCount":{
                "title":"Total Incident Count",
                "type":"number"
            },
            "totalIncidentsAcknowledged":{
                "title":"Total Incidents Acknowledged",
                "type":"number"
            },
            "totalIncidentsAutoResolved":{
                "title":"Total Incidents Auto Resolved",
                "type":"number"
            },
            "totalIncidentsManualEscalated":{
                "title":"Total Incident Manual Escalated",
                "type":"number"
            }
            # highlight-end
          },
          "required":[]
      },
      "mirrorProperties":{},
      "calculationProperties":{},
      "relations":{}
    }
    ```

    </details>

2. Add `serviceAnalytics` property to the integration `selector` key. When set to `true`, the integration will fetch data from the [PagerDuty aggregated service analytics API](https://developer.pagerduty.com/api-reference/694e92fe4f943-get-aggregated-service-data) and ingest it to Port. By default, this property is set to `true`.

   Also, by default, the integration aggregates the analytics over a period of 3 months. Use the `analyticsMonthsPeriod` filter to override this date range. The accepted values are positive number between 1 to 12. In the provided example below, we aggregate the analytics over the past 6 months.

    ```yaml showLineNumbers
    resources:
      - kind: services
        selector:
          query: "true"
          # highlight-start
          serviceAnalytics: "true"
          analyticsMonthsPeriod: 6
          # highlight-end
        port:
          entity:
            mappings:
              identifier: .id
              title: .name
              blueprint: '"pagerdutyService"'
              properties:
                status: .status
                url: .html_url
                oncall: .__oncall_user | sort_by(.escalation_level) | .[0].user.email
                secondaryOncall: .__oncall_user | sort_by(.escalation_level) | .[1].user.email
    ```

3. Establish a mapping between the analytics properties and the service analytics data response. Following a convention, the aggregated result of the PagerDuty service analytics API is saved to the `__analytics` key and merged with the response of the service API. Consequently, users can access specific metrics such as the mean seconds to resolve by referencing `__analytics.mean_seconds_to_resolve`.

    ```yaml showLineNumbers
    resources:
      - kind: services
        selector:
          query: "true"
          serviceAnalytics: "true"
          analyticsMonthsPeriod: 6
        port:
          entity:
            mappings:
              identifier: .id
              title: .name
              blueprint: '"pagerdutyService"'
              properties:
                status: .status
                url: .html_url
                oncall: .__oncall_user | sort_by(.escalation_level) | .[0].user.email
                secondaryOncall: .__oncall_user | sort_by(.escalation_level) | .[1].user.email
                # highlight-next-line
                meanSecondsToResolve: .__analytics.mean_seconds_to_resolve
    ```
4. Below is the complete integration configuration for enriching the service blueprint with analytics data.

    <details>
    <summary>Service analytics integration configuration</summary>

    ```yaml showLineNumbers
    resources:
      - kind: services
        selector:
          query: "true"
          serviceAnalytics: "true"
          analyticsMonthsPeriod: 6
        port:
          entity:
            mappings:
              identifier: .id
              title: .name
              blueprint: '"pagerdutyService"'
              properties:
                status: .status
                url: .html_url
                oncall: .__oncall_user | sort_by(.escalation_level) | .[0].user.email
                secondaryOncall: .__oncall_user | sort_by(.escalation_level) | .[1].user.email
                meanSecondsToResolve: .__analytics.mean_seconds_to_resolve
                meanSecondsToFirstAck: .__analytics.mean_seconds_to_first_ack
                meanSecondsToEngage: .__analytics.mean_seconds_to_engage
                totalIncidentCount: .__analytics.total_incident_count
                totalIncidentsAcknowledged: .__analytics.total_incidents_acknowledged
                totalIncidentsAutoResolved: .__analytics.total_incidents_auto_resolved
                totalIncidentsManualEscalated: .__analytics.total_incidents_manual_escalated
    ```
    </details>

### Ingesting incident analytics
To enrich your PagerDuty incident entities with analytics data, follow the steps below:

1. Update the incident blueprint to include an `analytics` property.
    <details>
    <summary>Updated incident blueprint</summary>

    ```json showLineNumbers
    {
      "identifier": "pagerdutyIncident",
      "description": "This blueprint represents a PagerDuty incident in our software catalog",
      "title": "PagerDuty Incident",
      "icon": "pagerduty",
      "schema": {
        "properties": {
          "status": {
            "type": "string",
            "title": "Incident Status",
            "enum": [
              "triggered",
              "annotated",
              "acknowledged",
              "reassigned",
              "escalated",
              "reopened",
              "resolved"
            ],
            "enumColors": {
              "triggered": "red",
              "annotated": "blue",
              "acknowledged": "yellow",
              "reassigned": "blue",
              "escalated": "yellow",
              "reopened": "red",
              "resolved": "green"
            }
          },
          "url": {
            "type": "string",
            "format": "url",
            "title": "Incident URL"
          },
          "urgency": {
            "title": "Incident Urgency",
            "type": "string",
            "enum": [
              "high",
              "low"
            ],
            "enumColors": {
              "high": "red",
              "low": "green"
            }
          },
          "priority": {
            "type": "string",
            "title": "Priority",
            "enum": [
              "P1",
              "P2",
              "P3",
              "P4",
              "P5"
            ],
            "enumColors": {
              "P1": "red",
              "P2": "yellow",
              "P3": "blue",
              "P4": "lightGray",
              "P5": "darkGray"
            }
          },
          "description": {
            "type": "string",
            "title": "Description"
          },
          "assignees": {
            "title": "Assignees",
            "type": "array",
            "items": {
              "type": "string",
              "format": "user"
            }
          },
          "escalation_policy": {
            "type": "string",
            "title": "Escalation Policy"
          },
          "created_at": {
            "title": "Create At",
            "type": "string",
            "format": "date-time"
          },
          "updated_at": {
            "title": "Updated At",
            "type": "string",
            "format": "date-time"
          },
          # highlight-start
          "analytics": {
            "title": "Analytics",
            "type": "object"
          }
          # highlight-end
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "relations": {
        "pagerdutyService": {
          "title": "PagerDuty Service",
          "target": "pagerdutyService",
          "required": false,
          "many": true
        }
      }
    }
    ```

    </details>

2. Add `incidentAnalytics` property to the integration `selector` key. When set to `true`, the integration will fetch data from the [PagerDuty Analytics API](https://developer.pagerduty.com/api-reference/328d94baeaa0e-get-raw-data-single-incident) and ingest it to Port. By default, this property is set to `false`.

    ```yaml showLineNumbers
    resources:
      - kind: incidents
        selector:
          query: "true"
          # highlight-next-line
          incidentAnalytics: "true"
        port:
          entity:
            mappings:
              identifier: .id | tostring
              title: .title
              blueprint: '"pagerdutyIncident"'
              properties:
                status: .status
                url: .self
    ```

3. Establish a mapping between the `analytics` blueprint property and the analytics data response.

    ```yaml showLineNumbers
    resources:
    - kind: incidents
      selector:
        query: 'true'
        include: ['assignees']
      port:
        entity:
          mappings:
            identifier: .id | tostring
            title: .title
            blueprint: '"pagerdutyIncident"'
            properties:
              status: .status
              url: .self
              urgency: .urgency
              assignees: .assignments | map(.assignee.email)
              escalation_policy: .escalation_policy.summary
              created_at: .created_at
              updated_at: .updated_at
              priority: if .priority != null then .priority.summary else null end
              description: .description
              # highlight-next-line
              analytics: .__analytics
            relations:
              pagerdutyService: .service.id
    ```
4. Below is the complete integration configuration for enriching the incident blueprint with analytics data.

    <details>
    <summary>Incident analytics integration configuration</summary>

    ```yaml showLineNumbers
    resources:
    - kind: incidents
      selector:
        query: 'true'
        include: ['assignees']
      port:
        entity:
          mappings:
            identifier: .id | tostring
            title: .title
            blueprint: '"pagerdutyIncident"'
            properties:
              status: .status
              url: .self
              urgency: .urgency
              assignees: .assignments | map(.assignee.email)
              escalation_policy: .escalation_policy.summary
              created_at: .created_at
              updated_at: .updated_at
              priority: if .priority != null then .priority.summary else null end
              description: .description
              # highlight-next-line
              analytics: .__analytics
            relations:
              pagerdutyService: .service.id
    ```
    </details>

## Examples

To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

Additional examples of blueprints and the relevant integration configurations can be found on the pagerduty [examples page](example.md)


## Relevant Guides

For relevant guides and examples, see the [guides section](https://docs.getport.io/guides?tags=PagerDuty).


## Alternative installation via webhook
While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from PagerDuty. If so, use the following instructions:

**Note** that when using the webhook installation method, data will be ingested into Port only when the webhook is triggered.

<details>

<summary><b>Webhook installation (click to expand)</b></summary>

In this example you are going to create a webhook integration between [PagerDuty](https://www.pagerduty.com/) and Port, which will ingest PagerDuty services and its related incidents into Port. This integration will involve setting up a webhook to receive notifications from PagerDuty whenever an incident is created or updated, allowing Port to ingest and process the incident entities accordingly.

<h2>Import PagerDuty services and incidents</h2>

<h3>Port configuration</h3>

Create the following blueprint definitions:

<details>
<summary>PagerDuty service blueprint</summary>

<PagerDutyServiceBlueprint/>

</details>

<details>
<summary>PagerDuty incident blueprint</summary>

<PagerDutyIncidentBlueprint/>

</details>

Create the following webhook configuration [using Port UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>PagerDuty webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `PagerDuty Mapper`;
   2. Identifier : `pagerduty_mapper`;
   3. Description : `A webhook configuration to map PagerDuty services and its related incidents to Port`;
   4. Icon : `Pagerduty`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <PagerDutyWebhookConfig/>

3. Scroll down to **Advanced settings** and input the following details:

   1. secret: `WEBHOOK_SECRET`;
   2. Signature Header Name : `X-Pagerduty-Signature`;
   3. Signature Algorithm : Select `sha256` from dropdown option;
   4. Signature Prefix : `v1=`
   5. Click **Save** at the bottom of the page.

   Remember to update the `WEBHOOK_SECRET` with the real secret you receive after subscribing to the webhook in PagerDuty.

</details>

<h3>Create a webhook in PagerDuty</h3>

1. Go to [PagerDuty](https://www.pagerduty.com/) and select the account you want to configure the webhook for.
2. Navigate to **Integrations** in the navigation bar and click on **Generic Webhooks (v3)**.
3. Click **New Webhook** and provide the following information:
   1. `Webhook URL` - enter the value of the `url` key you received after [creating the webhook configuration](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints).
   2. `Scope Type` - select whether you want to receive webhook events for a specific service (select `Service` if applicable) or for all services in your account (select `Account` if applicable).
   3. `Description` - provide an optional description for your webhook.
   4. `Event Subscription` - choose the event types you would like to subscribe to.
   5. `Custom Header` - enter any optional HTTP header to be added to your webhook payload.
4. Click **Add webhook** to create your webhook.
5. Alternatively, you can use the `curl` method to create the webhook. Copy the code below and run it in your terminal:

```curl showLineNumbers
  curl --request POST \
  --url \
 https://api.pagerduty.com/webhook_subscriptions
  --header 'Accept: application/vnd.pagerduty+json;version=2' \
  --header 'Authorization: Token token=<YOUR_PAGERDUTY_API_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data \
 '{
  "webhook_subscription": {
  "delivery_method": {
    "type": "http_delivery_method",
    "url": "https://ingest.getport.io/<YOUR_PORT_WEBHOOK_KEY>",
    "custom_headers": [
      {
        "name": "your-header-name",
        "value": "your-header-value"
      }
    ]
  },
  "description": "Sends PagerDuty v3 webhook events to Port.",
  "events": [
      "service.created",
      "service.updated",
      "incident.triggered",
      "incident.responder.added",
      "incident.acknowledged",
      "incident.annotated",
      "incident.delegated",
      "incident.escalated",
      "incident.priority_updated",
      "incident.reassigned",
      "incident.reopened",
      "incident.resolved",
      "incident.responder.replied",
      "incident.status_update_published",
      "incident.unacknowledged"
  ],
  "filter": {
    "type": "account_reference"
  },
  "type": "webhook_subscription"
  }
  }'
```

:::tip
In order to view the different events available in PagerDuty webhooks, [look here](https://developer.pagerduty.com/docs/db0fa8c8984fc-overview#event-types)
:::

Done! any change that happens to your services or incidents in PagerDuty will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2>Let's Test It</h2>

This section includes a sample webhook event sent from PagerDuty when an incident is created or updated. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

<h3>Payload</h3>

Here is an example of the payload structure sent to the webhook URL when a PagerDuty incident is created:

<details>
<summary>Webhook event payload</summary>

```json showLineNumbers
{
  "event": {
    "id": "01DVUHO6P4XQDFJ9AHOADT3UQ4",
    "event_type": "incident.triggered",
    "resource_type": "incident",
    "occurred_at": "2023-06-12T11:56:08.355Z",
    "agent": {
      "html_url": "https://your_account.pagerduty.com/users/PJCRRLH",
      "id": "PJCRRLH",
      "self": "https://api.pagerduty.com/users/PJCRRLH",
      "summary": "username",
      "type": "user_reference"
    },
    "client": "None",
    "data": {
      "id": "Q01J2OS7YBWLNY",
      "type": "incident",
      "self": "https://api.pagerduty.com/incidents/Q01J2OS7YBWLNY",
      "html_url": "https://your_account.pagerduty.com/incidents/Q01J2OS7YBWLNY",
      "number": 7,
      "status": "triggered",
      "incident_key": "acda20953f7446248f90260db65144f8",
      "created_at": "2023-06-12T11:56:08Z",
      "title": "Test PagerDuty Incident",
      "service": {
        "html_url": "https://your_account.pagerduty.com/services/PWJAGSD",
        "id": "PWJAGSD",
        "self": "https://api.pagerduty.com/services/PWJAGSD",
        "summary": "Port Internal Service",
        "type": "service_reference"
      },
      "assignees": [
        {
          "html_url": "https://your_account.pagerduty.com/users/PRGAUI4",
          "id": "PRGAUI4",
          "self": "https://api.pagerduty.com/users/PRGAUI4",
          "summary": "username",
          "type": "user_reference"
        }
      ],
      "escalation_policy": {
        "html_url": "https://your_account.pagerduty.com/escalation_policies/P7LVMYP",
        "id": "P7LVMYP",
        "self": "https://api.pagerduty.com/escalation_policies/P7LVMYP",
        "summary": "Test Escalation Policy",
        "type": "escalation_policy_reference"
      },
      "teams": [],
      "priority": "None",
      "urgency": "high",
      "conference_bridge": "None",
      "resolve_reason": "None"
    }
  }
}
```

</details>

<h3>Mapping Result</h3>

The combination of the sample payload and the webhook configuration generates the following Port entity:

```json showLineNumbers
{
  "identifier": "Q01J2OS7YBWLNY",
  "title": "Test PagerDuty Incident",
  "blueprint": "pagerdutyIncident",
  "team": [],
  "properties": {
    "status": "triggered",
    "url": "https://your_account.pagerduty.com/incidents/Q01J2OS7YBWLNY",
    "details": "Test PagerDuty Incident",
    "urgency": "high",
    "responder": "Username",
    "escalation_policy": "Test Escalation Policy"
  },
  "relations": {
    "microservice": "PWJAGSD"
  }
}
```

<h2>Import PagerDuty historical data</h2>

In this example you are going to use the provided Bash script to fetch data from the PagerDuty API and ingest it to Port.

The script extracts services and incidents from PagerDuty, and sends them to Port as microservice and incident entities respectively.

<h3>Port configuration</h3>

This example utilizes the same [blueprint](#prerequisites) definition from the previous section, along with a new webhook configuration:

Create the following webhook configuration [using Port UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>PagerDuty webhook configuration for historical data</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `PagerDuty History Mapper`;
   2. Identifier : `pagerduty_history_mapper`;
   3. Description : `A webhook configuration to map PagerDuty Historical services and its related incidents to Port`;
   4. Icon : `Pagerduty`;
2. **Integration configuration** tab - fill the following JQ mapping:
   <PagerDutyWebhookHistory/>

3. Scroll down to **Advanced settings** and input the following details:
   1. secret: `WEBHOOK_SECRET`;
   2. Signature Header Name : `X-Pagerduty-Signature`;
   3. Signature Algorithm : Select `sha256` from dropdown option;
   4. Signature Prefix : `v1=`
   5. Click **Save** at the bottom of the page.

Remember to update the `WEBHOOK_SECRET` with the real secret you receive after subscribing to the webhook in PagerDuty.

</details>

<details>
<summary> PagerDuty Bash script for historical data </summary>

<PagerDutyScript/>

</details>

<h3>How to Run the script</h3>

This script requires two configuration values:

1. `PD_TOKEN`: your PagerDuty API token;
2. `PORT_URL`: your Port webhook URL.

Then trigger the script by running:

```bash showLineNumbers
bash pagerduty_to_port.sh
```

This script fetches services and incidents from PagerDuty and sends them to Port.

:::tip
The script writes the JSON payload for each service and incident to a file named `output.json`. This can be useful for debugging if you encounter any issues.
:::

Done! you can now import historical data from PagerDuty into Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
</details>
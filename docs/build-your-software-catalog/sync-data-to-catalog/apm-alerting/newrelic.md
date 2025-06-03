import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import DockerParameters from "./\_newrelic-docker-parameters.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import AdvancedConfig from '../../../generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"


# New Relic

Port's New Relic integration allows you to model New Relic resources in your software catalog and ingest data into them.



## Overview

This integration allows you to:

- Map and organize your desired New Relic resources and their metadata in Port (see supported resources below).
- Watch for New Relic object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.


## BaseUrl & webhook configuration

:::warning AppHost deprecation
**`integration.config.appHost` is deprecated**: Please use `baseUrl` for webhook URL settings instead.
:::

The `baseUrl` parameter enables real-time updates from Octopus to Port.  
If not provided:
- The integration will still function normally
- You should use [`scheduledResyncInterval`](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) to configure updates at a set interval.
- Manual resyncs can be triggered via Port's UI

The `integration.secrets.webhookUsername` and `integration.secrets.webhookSecret` parameter secures your webhooks. If not provided, the integration will process webhooks without validating the source of the events.


In order for the Octopus integration to update the data in Port on every change in the Octopus resources, you need to specify the `baseUrl` parameter.
The `baseUrl` parameter should be set to the `url` of your NewRelic integration instance. In addition, your NewRelic instance (whether it is NewRelic SaaS or a self-hosted version of NewRelic) needs to have the option to send webhook requests to the NewRelic integration instance, so please configure your network accordingly.

### Supported Resources

The resources that can be ingested from New Relic into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`Entity`](https://docs.newrelic.com/docs/new-relic-solutions/new-relic-one/core-concepts/what-entity-new-relic/)
- [`Issue`](https://docs.newrelic.com/docs/alerts-applied-intelligence/new-relic-alerts/get-started/alerts-ai-overview-page/#issues)


## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation integration="NewRelic"/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2> Prerequisites </h2>

<Prerequisites />


For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="NewRelic" />

<PortApiRegionTip/>



</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-newrelic-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `NEW_RELIC_API_KEY` and `NEW_RELIC_ACCOUNT_ID`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-newrelic-integration
  type: newrelic
  eventListener:
    type: POLLING
  secrets:
  // highlight-start
    newRelicAPIKey: NEW_RELIC_API_KEY
    newRelicAccountID: NEW_RELIC_ACCOUNT_ID
  // highlight-end
```
<br/>

:::note
If you are using New Relic's EU region, add the highlighted code (GraphQL configuration value) to the `values.yaml`:

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-newrelic-integration
  type: newrelic
  eventListener:
    type: POLLING
  // highlight-start
  config:
    newRelicGraphqlURL: https://api.eu.newrelic.com/graphql
  // highlight-end
  secrets:
    newRelicAPIKey: NEW_RELIC_API_KEY
    newRelicAccountID: NEW_RELIC_ACCOUNT_ID
```
:::

2. Install the `my-ocean-newrelic-integration` ArgoCD Application by creating the following `my-ocean-newrelic-integration.yaml` manifest:
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
  name: my-ocean-newrelic-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-newrelic-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-newrelic-integration/values.yaml
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
kubectl apply -f my-ocean-newrelic-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                               | Description                                                                                                   | Required |
|-----------------------------------------|---------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                         | Your port client id                                                                                           | ✅        |
| `port.clientSecret`                     | Your port client secret                                                                                       | ✅        |
| `port.baseUrl`                          | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                       | ✅        |
| `integration.identifier`                | Change the identifier to describe your integration                                                            | ✅        |
| `integration.type`                      | The integration type                                                                                          | ✅        |
| `integration.eventListener.type`        | The event listener type                                                                                       | ✅        |
| `integration.secrets.newRelicAPIKey`    | The New Relic API key                                                                                         | ✅        |
| `integration.secrets.newRelicAccountID` | The New Relic account ID                                                                                      | ✅        |
| `scheduledResyncInterval`               | The number of minutes between each resync                                                                     | ❌        |
| `initializePortResources`               | Default true, When set to true the integration will create default blueprints and the port App config Mapping | ❌        |
| `integration.secrets.webhookUsername`           | Webhook username used for authenticating incoming events. [Learn more](http://docs.newrelic.com/docs/alerts/get-notified/intro-notifications/)                                   | ❌        |
| `integration.secrets.webhookSecret`           | Webhook secret for authenticating incoming events. [Learn more](http://docs.newrelic.com/docs/alerts/get-notified/intro-notifications/)                                           | ❌        |
| `baseUrl`               | The base url of the instance where the New Relic integration is hosted, used for real-time updates. (e.g.`https://mynewrelicoceanintegration.com`)                     | ❌        |
<br/>

<AdvancedConfig/>

<h3>Event listener</h3>

The integration uses polling to pull the configuration from Port every minute and check it for changes. If there is a change, a resync will occur.

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the New Relic integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using webhooks you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option
:::

 <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />
<br/>

Here is an example for `newrelic-integration.yml` workflow file:

:::note
If you are using New Relic's EU region, add the following flag to the docker command:

`-e OCEAN__INTEGRATION__CONFIG__NEW_RELIC_URL=https://api.eu.newrelic.com/graphql`
:::

```yaml showLineNumbers
name: New Relic Exporter Workflow

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
          type: 'newrelic'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            new_relic_api_key: ${{ secrets.OCEAN__INTEGRATION__CONFIG__NEW_RELIC_API_KEY }} 
            new_relic_account_id: ${{ secrets.OCEAN__INTEGRATION__CONFIG__NEW_RELIC_ACCOUNT_ID }}
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

:::note
If you are using New Relic's EU region, add the following flag to the docker command:

`-e OCEAN__INTEGRATION__CONFIG__NEW_RELIC_URL=https://api.eu.newrelic.com/graphql`
:::

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run New Relic Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__NEW_RELIC_API_KEY', variable: 'OCEAN__INTEGRATION__CONFIG__NEW_RELIC_API_KEY'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__NEW_RELIC_ACCOUNT_ID', variable: 'OCEAN__INTEGRATION__CONFIG__NEW_RELIC_ACCOUNT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="newrelic"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__NEW_RELIC_API_KEY=$OCEAN__INTEGRATION__CONFIG__NEW_RELIC_API_KEY \
                                -e OCEAN__INTEGRATION__CONFIG__NEW_RELIC_ACCOUNT_ID=$OCEAN__INTEGRATION__CONFIG__NEW_RELIC_ACCOUNT_ID \
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
<AzurePremise name/>

<DockerParameters />

<br/>

Here is an example for `newrelic-integration.yml` pipeline file:

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
    integration_type="newrelic"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__INTEGRATION__CONFIG__NEW_RELIC_API_KEY=$(OCEAN__INTEGRATION__CONFIG__NEW_RELIC_API_KEY) \
        -e OCEAN__INTEGRATION__CONFIG__NEW_RELIC_ACCOUNT_ID=$(OCEAN__INTEGRATION__CONFIG__NEW_RELIC_ACCOUNT_ID) \
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
  INTEGRATION_TYPE: newrelic
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
        -e OCEAN__INTEGRATION__CONFIG__NEW_RELIC_API_KEY=$OCEAN__INTEGRATION__CONFIG__NEW_RELIC_API_KEY \
        -e OCEAN__INTEGRATION__CONFIG__NEW_RELIC_ACCOUNT_ID=$OCEAN__INTEGRATION__CONFIG__NEW_RELIC_ACCOUNT_ID \
        -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
        -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $IMAGE_NAME

  rules: # Run only when changes are made to the main branch
    - if: '$CI_COMMIT_BRANCH == "main"'
```

</TabItem>

  </Tabs>

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
deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
- kind: newRelicService
  selector:
    query: 'true'
    newRelicTypes:
    - SERVICE
    - APPLICATION
    calculateOpenIssueCount: true
    entityQueryFilter: type in ('SERVICE','APPLICATION')
    entityExtraPropertiesQuery: |-
      ... on ApmApplicationEntityOutline {
        guid
        name
        apmSummary {
          apdexScore
          errorRate
          hostCount
          instanceCount
          responseTimeAverage
          throughput
        }
      }
  port:
    entity:
      mappings:
        identifier: .guid
        title: .name
        blueprint: '"newRelicService"'
        properties:
          has_apm: if .domain | contains("APM") then "true" else "false" end
          link: .permalink
          open_issues_count: .open_issues_count
          reporting: .reporting
          tags: .tags
          type: .type
          throughput: .apmSummary.throughput
          error_rate: .apmSummary.errorRate
          response_time_avg: .apmSummary.responseTimeAverage
          instance_count: .apmSummary.instanceCount
          apdex: .apmSummary.apdexScore
- kind: newRelicAlert
  selector:
    query: .state == "ACTIVATED" or .state == "CREATED"
    newRelicTypes:
    - ISSUE
  port:
    entity:
      mappings:
        identifier: .issueId
        title: .title[0]
        blueprint: '"newRelicAlert"'
        properties:
          priority: .priority
          state: .state
          sources: .sources
          conditionName: .conditionName
          alertPolicyNames: .policyName
          activatedAt: if .activatedAt == null then null else .activatedAt / 1000 | todate end
          link: '"https://one.newrelic.com/launcher/nrai.launcher?pane=" + ("{\"isPhoton\": true, \"id\": \"\(.issueId)\", \"nerdletId\": \"nrai.issue-redirect\"}" | @base64)'
          description: .description
        relations:
          alert_to_workload: .__APPLICATION.entity_guids + .__SERVICE.entity_guids
          cloud_resource:
            combinator: '"and"'
            rules:
            - property: '"guid"'
              operator: '"in"'
              value: .entityGuids
- kind: newRelicServiceLevel
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .serviceLevel.indicators[0].id
        title: .serviceLevel.indicators[0].name
        blueprint: '"newRelicServiceLevel"'
        properties:
          description: .serviceLevel.indicators[0].description
          targetThreshold: .serviceLevel.indicators[0].objectives[0].target
          createdAt: if .serviceLevel.indicators[0].createdAt != null then (.serviceLevel.indicators[0].createdAt | tonumber / 1000 | todate) else null end
          updatedAt: .serviceLevel.indicators[0].updatedAt
          createdBy: .serviceLevel.indicators[0].createdBy.email
          sli: .__SLI.SLI
          tags: .tags
          slo_compliance: .__SLI.SLI >= .serviceLevel.indicators[0].objectives[0].target
        relations:
          workload: .tags."nr.associatedEntityGuid"[0]
- kind: entity
  selector:
    query: 'true'
    entityQueryFilter: >-
      type IN ( 'AWSEC2INSTANCE', 'AWSS3BUCKET', 'AWSRDSDBINSTANCE', 'AWSLAMBDAFUNCTION', 'AWSELBLOADBALANCER', 'AZUREVIRTUALMACHINE', 'AZURESQLDATABASE', 'GCPCOMPUTEINSTANCE', 'GCPSTORAGEBUCKET', 'GCPSQLDATABASEINSTANCE' )
  port:
    entity:
      mappings:
        identifier: .guid
        title: .name
        blueprint: '"newRelicCloudResource"'
        properties:
          infrastructureIntegrationType: .type
          reporting: .reporting
          link: .permalink
          tags: .tags
- kind: entities
  selector:
    query: 'true'
    entityQueryFilter: type IN ( 'DASHBOARD' )
  port:
    entity:
      mappings:
        identifier: .guid
        title: .name
        blueprint: '"newRelicDashboards"'
        properties:
          dashboard_link: .permalink
- kind: newRelicService
  selector:
    query: 'true'
    newRelicTypes:
    - SERVICE
    - APPLICATION
    entityQueryFilter: type in ('SERVICE','APPLICATION')
  port:
    entity:
      mappings:
        identifier: .guid
        title: .name
        blueprint: '"workload"'
        relations:
          new_relic_workload: .guid

```

</details>



### Additional Configuration

  - **newRelicTypes** - An array of Newrelic entity types that will be fetched. The default value is ['SERVICE', 'APPLICATION']. This is related to the type field in the Newrelic entity.
  - **calculateOpenIssueCount:**
    - A boolean value that indicates if the integration should calculate the number of open issues for each entity. The default value is `false``.
    - **NOTE** - This can cause a performance degradation as the integration will have to calculate the number of open issues for each entity, which unfortunately is not supported by the New Relic API.
  - **entityQueryFilter:**
    - A filter that will be applied to the New Relic API query. This will be placed inside the `query` field of the `entitySearch` query in the New Relic GraphQL API. For examples of query filters [click here](https://docs.newrelic.com/docs/apis/nerdgraph/examples/nerdgraph-entities-api-tutorial/#search-query).
    - Not specifying this field will cause the integration to fetch all the entities and map them to the blueprint defined in the `kind`.
    - Rule of thumb - Most of the time the `EntityQueryFilter` will be the same as the `NewRelicTypes`. For example, if we want to fetch all the services and applications we will set the `EntityQueryFilter` to `type in ('SERVICE','APPLICATION')` and the `NewRelicTypes` to `['SERVICE', 'APPLICATION']`.
  - **entityExtraPropertiesQuery:**
    - An optional property that allows defining extra properties to fetch for each Newrelic entity. This will be concatenated with the default query properties we are requesting under the `entities` section in the `entitySearch` query in the Newrelic GraphQL API. For examples of additional query properties [click here](https://docs.newrelic.com/docs/apis/nerdgraph/examples/nerdgraph-entities-api-tutorial/#apm-summary).

- The `port`, `entity` and the `mappings` keys are used to map the Newrelic object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;



## Capabilities  

### Tags

Some Newrelic `entities` have a property named `tags` which contains potentially useful information such as machine information, hostname, agent name & version, and more. For example:

```json showLineNumbers
"tags": [
  {
    "key": "coreCount",
    "values": [
      "10"
    ]
  },
  {
    "key": "hostStatus",
    "values": [
      "running"
    ]
  },
]
```

Before mapping, this integration performs a transformation on each `tag`, after which the example above would look like this:

```json showLineNumbers
tags = ["coreCount":"10","hostStatus":"running"]
```



## Examples

Examples of blueprints and the relevant integration configurations:

### Service (Entity)

<details>
<summary>Service blueprint</summary>

```json showLineNumbers
{
  "identifier": "newRelicService",
  "description": "This blueprint represents a New Relic service or application in our software catalog",
  "title": "New Relic Service",
  "icon": "NewRelic",
  "schema": {
    "properties": {
      "has_apm": {
        "title": "Has APM",
        "type": "boolean"
      },
      "open_issues_count": {
        "title": "Open Issues Count",
        "type": "number",
        "default": 0
      },
      "link": {
        "title": "Link",
        "type": "string",
        "format": "url"
      },
      "reporting": {
        "title": "Reporting",
        "type": "boolean"
      },
      "tags": {
        "title": "Tags",
        "type": "object"
      },
      "account_id": {
        "title": "Account ID",
        "type": "string"
      },
      "type": {
        "title": "Type",
        "type": "string"
      },
      "domain": {
        "title": "Domain",
        "type": "string"
      },
      "throughput": {
        "title": "Throughput",
        "type": "number"
      },
      "response_time_avg": {
        "title": "Response Time AVG",
        "type": "number"
      },
      "error_rate": {
        "title": "Error Rate",
        "type": "number"
      },
      "instance_count": {
        "title": "Instance Count",
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
  - kind: newRelicService
    selector:
      query: "true"
      newRelicTypes: ["SERVICE", "APPLICATION"]
      calculateOpenIssueCount: true
      entityQueryFilter: "type in ('SERVICE','APPLICATION')"
      entityExtraPropertiesQuery: |
        ... on ApmApplicationEntity {
          guid
          name
          alertSeverity
          applicationId
          apmBrowserSummary {
            ajaxRequestThroughput
            ajaxResponseTimeAverage
            jsErrorRate
            pageLoadThroughput
            pageLoadTimeAverage
          }
          apmSummary {
            apdexScore
            errorRate
            hostCount
            instanceCount
            nonWebResponseTimeAverage
            nonWebThroughput
            responseTimeAverage
            throughput
            webResponseTimeAverage
            webThroughput
          }
        }
    port:
      entity:
        mappings:
          blueprint: '"newRelicService"'
          identifier: .guid
          title: .name
          properties:
            has_apm: 'if .domain | contains("APM") then "true" else "false" end'
            link: .permalink
            open_issues_count: .__open_issues_count
            reporting: .reporting
            tags: .tags
            domain: .domain
            type: .type
```

</details>

### Issue

<details>
<summary>Issue blueprint</summary>

```json showLineNumbers
{
  "identifier": "newRelicAlert",
  "description": "This blueprint represents a New Relic alert in our software catalog",
  "title": "New Relic Alert",
  "icon": "NewRelic",
  "schema": {
    "properties": {
      "priority": {
        "type": "string",
        "title": "Priority",
        "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
        "enumColors": {
          "CRITICAL": "red",
          "HIGH": "red",
          "MEDIUM": "yellow",
          "LOW": "green"
        }
      },
      "state": {
        "type": "string",
        "title": "State",
        "enum": ["ACTIVATED", "CLOSED", "CREATED"],
        "enumColors": {
          "ACTIVATED": "yellow",
          "CLOSED": "green",
          "CREATED": "lightGray"
        }
      },
      "trigger": {
        "type": "string",
        "title": "Trigger"
      },
      "sources": {
        "type": "array",
        "title": "Sources"
      },
      "alertPolicyNames": {
        "type": "array",
        "title": "Alert Policy Names"
      },
      "conditionName": {
        "type": "array",
        "title": "Condition Name"
      },
      "activatedAt": {
        "type": "string",
        "title": "Time Issue was activated"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "newRelicService": {
      "title": "New Relic Service",
      "target": "newRelicService",
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
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: newRelicAlert
    selector:
      query: "true"
      newRelicTypes: ["ISSUE"]
    port:
      entity:
        mappings:
          blueprint: '"newRelicAlert"'
          identifier: .issueId
          title: .title[0]
          properties:
            priority: .priority
            state: .state
            sources: .sources
            conditionName: .conditionName
            alertPolicyNames: .policyName
            activatedAt: .activatedAt
          relations:
            newRelicService: .__APPLICATION.entity_guids + .__SERVICE.entity_guids
```

</details>


### Service Level

<details>
<summary>Service Level blueprint</summary>

```json showLineNumbers
{
    "identifier": "newRelicServiceLevel",
    "description": "This blueprint represents a New Relic Service Level",
    "title": "New Relic Service Level",
    "icon": "NewRelic",
    "schema": {
      "properties": {
        "description": {
          "title": "Description",
          "type": "string"
        },
        "targetThreshold": {
          "icon": "DefaultProperty",
          "title": "Target Threshold",
          "type": "number"
        },
        "createdAt": {
          "title": "Created At",
          "type": "string",
          "format": "date-time"
        },
        "updatedAt": {
          "title": "Updated At",
          "type": "string",
          "format": "date-time"
        },
        "createdBy": {
          "title": "Creator",
          "type": "string",
          "format": "user"
        },
        "sli": {
          "type": "number",
          "title": "SLI"
        },
        "tags": {
          "type": "object",
          "title": "Tags"
        }
      },
      "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
      "newRelicService": {
        "title": "New Relic service",
        "target": "newRelicService",
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
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: newRelicServiceLevel
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"newRelicServiceLevel"'
          identifier: .serviceLevel.indicators[0].id
          title: .serviceLevel.indicators[0].name
          properties:
            description: .serviceLevel.indicators[0].description
            targetThreshold: .serviceLevel.indicators[0].objectives[0].target
            createdAt: if .serviceLevel.indicators[0].createdAt != null then (.serviceLevel.indicators[0].createdAt | tonumber / 1000 | todate) else null end
            updatedAt: .serviceLevel.indicators[0].updatedAt
            createdBy: .serviceLevel.indicators[0].createdBy.email
            sli: .__SLI.SLI
            tags: .tags
          relations:
            newRelicService: .serviceLevel.indicators[0].guid
```

</details>

## Let's Test It

This section includes a sample response data from New Relic. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from New Relic:

<details>
<summary><b>Service (Entity) response data (Click to expand)</b></summary>


```json showLineNumbers
{
  "accountId": 4444532,
  "alertSeverity": "NOT_CONFIGURED",
  "domain": "INFRA",
  "entityType": "INFRASTRUCTURE_HOST_ENTITY",
  "guid": "MTIzNDU2Nzg5fElORlJBfE5BfDY1MjQwNDc0NjE4MzUyMDkwOTU=",
  "lastReportingChangeAt": 1715351571254,
  "name": "UserMacbook",
  "permalink": "https://one.eu.newrelic.com/redirect/entity/MTIzNDU2Nzg5fElORlJBfE5BfDY1MjQwNDc0NjE4MzUyMDkwOTU=",
  "reporting": true,
  "tags": [
    {
      "key": "account",
      "values": [
        "Account 4444831"
      ]
    },
    {
      "key": "accountId",
      "values": [
        "4444831"
      ]
    },
    {
      "key": "agentName",
      "values": [
        "Infrastructure"
      ]
    },
    {
      "key": "agentVersion",
      "values": [
        "1.50.0"
      ]
    },
    {
      "key": "coreCount",
      "values": [
        "8"
      ]
    },
    {
      "key": "fullHostname",
      "values": [
        "usermacbook"
      ]
    },
    {
      "key": "hostStatus",
      "values": [
        "running"
      ]
    },
    {
      "key": "hostname",
      "values": [
        "Usermacbook"
      ]
    },
    {
      "key": "instanceType",
      "values": [
        "MacBook Air MacBookAir10,1"
      ]
    },
    {
      "key": "kernelVersion",
      "values": [
        "23.2.0"
      ]
    },
    {
      "key": "linuxDistribution",
      "values": [
        "macOS 14.2.1"
      ]
    },
    {
      "key": "operatingSystem",
      "values": [
        "macOS"
      ]
    },
    {
      "key": "processorCount",
      "values": [
        "8"
      ]
    },
    {
      "key": "systemMemoryBytes",
      "values": [
        "17179869184"
      ]
    },
    {
      "key": "trustedAccountId",
      "values": [
        "4444532"
      ]
    }
  ],
  "type": "HOST"
}
```

</details>

<details>
<summary><b>Issue response data (Click to expand)</b></summary>


```json showLineNumbers
{
  "issueId": "MjQwNzIwN3xBUE18QVBQTElDQVRJT058MjIwMzEwNzV8MTA0NzYwNzA5",
  "title": "My Issue",
  "priority": "CRITICAL",
  "state": "ACTIVATED",
  "sources": ["My Source"],
  "conditionName": ["My Condition"],
  "policyName": ["My Policy"],
  "activatedAt": "2022-01-01T00:00:00Z"
}
```
</details>

<details>
<summary><b>Service Level response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "serviceLevel": {
    "indicators": [
      {
        "createdAt": 1721030560937,
        "createdBy": {
          "email": "user@domain.com"
        },
        "description": "Proportion of requests that are served faster than a threshold.",
        "guid": "NDM2OTY4MHxFWFR8U0VSVklDRV9MRVZFTHw1OTk0MzQ",
        "id": "599434",
        "name": "Service Level Name - Metric",
        "objectives": [
          {
            "description": null,
            "name": null,
            "target": 95,
            "timeWindow": {
              "rolling": {
                "count": 7,
                "unit": "DAY"
              }
            }
          }
        ],
        "resultQueries": {
          "indicator": {
            "nrql": "SELECT clamp_max(sum(newrelic.sli.good) / sum(newrelic.sli.valid) * 100, 100) AS 'SLI' FROM Metric WHERE entity.guid = 'NDM2OTY4MHxFWFR8U0VSVklDRV9MRVZFTHw1OTk0MzQ' UNTIL 2 minutes AGO"
          }
        },
        "updatedAt": null,
        "updatedBy": null
      }
    ]
  },
  "tags": {
    "account": [
      "Account [REDACTED]"
    ],
    "accountId": [
      "[REDACTED]"
    ],
    "category": [
      "latency"
    ],
    "nr.associatedEntityGuid": [
      "NDM2OTY4MHxBUE18QVBQTElDQVRJT058NTkxMTYyMjE0"
    ],
    "nr.associatedEntityName": [
      "Service Name 01"
    ],
    "nr.associatedEntityType": [
      "APM_APPLICATION"
    ],
    "nr.sliComplianceCategory": [
      "Non-compliant"
    ],
    "nr.sloPeriod": [
      "7d"
    ],
    "nr.sloTarget": [
      "95.0%"
    ],
    "trustedAccountId": [
      "[REDACTED]"
    ]
  },
  "__SLI": {
    "SLI": 87.56
  }
}
```
</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary><b>Service (Entity) entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "MTIzNDU2Nzg5fElORlJBfE5BfDY1MjQwNDc0NjE4MzUyMDkwOTU=",
  "title": "UserMacbook",
  "blueprint": "newRelicAlert",
  "team": [],
  "icon": "NewRelic",
  "properties": {
    "has_apm": false,
    "link": "https://one.eu.newrelic.com/redirect/entity/MTIzNDU2Nzg5fElORlJBfE5BfDY1MjQwNDc0NjE4MzUyMDkwOTU=",
    "open_issues_count": null,
    "reporting": true,
    "tags": [
      {
        "key": "account",
        "values": [
          "Account 4444831"
        ]
      },
      {
        "key": "accountId",
        "values": [
          "4444831"
        ]
      },
      {
        "key": "agentName",
        "values": [
          "Infrastructure"
        ]
      },
      {
        "key": "agentVersion",
        "values": [
          "1.50.0"
        ]
      },
      {
        "key": "coreCount",
        "values": [
          "8"
        ]
      },
      {
        "key": "fullHostname",
        "values": [
          "usermacbook"
        ]
      },
      {
        "key": "hostStatus",
        "values": [
          "running"
        ]
      },
      {
        "key": "hostname",
        "values": [
          "Usermacbook"
        ]
      },
      {
        "key": "instanceType",
        "values": [
          "MacBook Air MacBookAir10,1"
        ]
      },
      {
        "key": "kernelVersion",
        "values": [
          "23.2.0"
        ]
      },
      {
        "key": "linuxDistribution",
        "values": [
          "macOS 14.2.1"
        ]
      },
      {
        "key": "operatingSystem",
        "values": [
          "macOS"
        ]
      },
      {
        "key": "processorCount",
        "values": [
          "8"
        ]
      },
      {
        "key": "systemMemoryBytes",
        "values": [
          "17179869184"
        ]
      },
      {
        "key": "trustedAccountId",
        "values": [
          "4444532"
        ]
      }
    ],
    "domain": "INFRA",
    "type": "HOST"
  },
  "relations": {},
  "createdAt": "2024-2-6T09:30:57.924Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-2-6T11:49:20.881Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary><b>Issue entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "My Issue",
  "title": "My Issue",
  "blueprint": "newRelicAlert",
  "team": [],
  "icon": "NewRelic",
  "properties": {
    "priority": "CRITICAL",
    "state": "ACTIVATED",
    "sources": ["My Source"],
    "conditionName": ["My Condition"],
    "alertPolicyNames": ["My Policy"],
    "activatedAt": "2022-01-01T00:00:00Z"
  },
  "relations": {
    "newRelicService": "My Service"
  },
  "createdAt": "2024-2-6T09:30:57.924Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-2-6T11:49:20.881Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary><b>Service Level entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
    "blueprint": "newRelicServiceLevel",
    "identifier": "599434",
    "title": "Service Level Name - Metric",
    "icon": "NewRelic",
    "properties": {
      "description": "Proportion of requests that are served faster than a threshold.",
      "targetThreshold": 95,
      "createdAt": "2024-07-15T08:02:40Z",
      "updatedAt": null,
      "createdBy": "user@domain.com",
      "serviceLevelIndicator": 87.56,
      "tags": {
        "account": [
          "Account [REDACTED]"
        ],
        "accountId": [
          "[REDACTED]"
        ],
        "category": [
          "latency"
        ],
        "nr.associatedEntityGuid": [
          "NDM2OTY4MHxBUE18QVBQTElDQVRJT058NTkxMTYyMjE0"
        ],
        "nr.associatedEntityName": [
          "Service Name 01"
        ],
        "nr.associatedEntityType": [
          "APM_APPLICATION"
        ],
        "nr.sliComplianceCategory": [
          "Non-compliant"
        ],
        "nr.sloPeriod": [
          "7d"
        ],
        "nr.sloTarget": [
          "95.0%"
        ],
        "trustedAccountId": [
          "[REDACTED]"
        ]
      }
    },
    "relations": {
      "newRelicService": "NDM2OTY4MHxFWFR8U0VSVklDRV9MRVZFTHw1OTk0MzQ"
    },
  "createdAt": "2024-08-06T09:30:57.924Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-08-06T09:49:20.881Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
  }
```

</details>

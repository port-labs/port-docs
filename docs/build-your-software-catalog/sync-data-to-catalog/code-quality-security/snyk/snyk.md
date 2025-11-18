import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/\_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '../../../../generalTemplates/\_ocean_advanced_configuration_note.md'
import SnykBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/snyk/\_example_snyk_vulnerability_blueprint.mdx";
import SnykConfiguration from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/snyk/\_example_snyk_vulnerability_webhook_configuration.mdx";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"
import MetricsAndSyncStatus from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_metrics_and_sync_status.mdx"
import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"

# Snyk

<IntegrationVersion integration="snyk" />

Port's Snyk integration allows you to model Snyk resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Map and organize your desired Snyk resources and their metadata in Port (see supported resources below).
- Watch for Snyk object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.

### Supported resources

The resources that can be ingested from Snyk into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`Organization`](https://snyk.docs.apiary.io/#reference/organizations/the-snyk-organization-for-a-request/list-all-the-organizations-a-user-belongs-to)
- [`Target`](https://apidocs.snyk.io/?version=2023-08-21%7Ebeta#get-/orgs/-org_id-/targets)
- [`Project`](https://apidocs.snyk.io/?version=2023-08-21#get-/orgs/-org_id-/projects)
- [`Issue`](https://snyk.docs.apiary.io/#reference/projects/aggregated-project-issues/list-all-aggregated-issues)

## Setup

### Prerequisites

1. A Snyk enterprise account.
2. A Port organization with admin permissions.

:::info Snyk Enterprise
The Snyk API is available for Enterprise customers only. Authentication using personal tokens from Snyk Free or Team plans is not supported. [Learn More](https://docs.snyk.io/snyk-api/authentication-for-api).
:::

Choose one of the following installation methods:  
Not sure which method is right for your use case? Check the available [installation methods](/build-your-software-catalog/sync-data-to-catalog/#installation-methods).

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port (Recommended)" default>

<OceanSaasInstallation integration="Snyk" />

</TabItem>

<TabItem value="real-time-self-hosted" label="Self-hosted">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2>Prerequisites</h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm">

By default, the integration fetches all organizations associated with the provided Snyk token. If you wish to customize access, the following parameters are available:

`integration.config.organizationId`: Use this parameter to restrict access to a specific organization. If specified, the integration will fetch data only for the provided organization.

`integration.config.groups`: When you want to limit access to all organizations within specific Snyk groups, use this parameter. Provide a comma-separated list of Snyk group IDs, and the integration will filter data accordingly.

:::note Default behaviour
If neither parameter is provided, the integration will operate with the default behavior of fetching all organizations associated with the supplied Snyk token.
:::

<OceanRealtimeInstallation integration="Snyk" />


<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-snyk-integration` in your git repository with the content:

:::note Default behaviour
By default, the integration fetches all organizations associated with the provided Snyk token.

Remember to replace the placeholder for `SNYK_TOKEN`.
:::

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-snyk-integration
  type: snyk
  eventListener:
    type: POLLING
  secrets:
  // highlight-next-line
    token: SNYK_TOKEN
```
<br/>

 If you wish to customize access, the following configurations are available:

 - The `organizationId` key is used to restrict access to a specific organization. If specified in the `values.yaml` file, the integration will fetch data only for the provided organization.

:::note Configuration variable replacement
Remember to replace the placeholders for `SNYK_TOKEN` and `SNYK_ORGANIZATION_ID`.
:::

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-snyk-integration
  type: snyk
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    organizationId: SNYK_ORGANIZATION_ID
  secrets:
    token: SNYK_TOKEN
```
<br/>

 - The `groups` key is used to restrict access to all organizations within specific Snyk groups. In the `values.yaml` file, provide a comma-separated list of Snyk group IDs to the `groups` key, and the integration will filter data for all organizations in the group(s).

:::note Configuration variable replacement
Remember to replace the placeholders for `SNYK_TOKEN` and `SNYK_GROUPS`.
:::

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-snyk-integration
  type: snyk
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    groups: SNYK_GROUPS
  secrets:
    token: SNYK_TOKEN
```
<br/>

2. Install the `my-ocean-snyk-integration` ArgoCD Application by creating the following `my-ocean-snyk-integration.yaml` manifest:
:::note Configuration variable replacement
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
  <summary><b>ArgoCD Application (click to expand)</b></summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-snyk-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-snyk-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.9.5
    helm:
      valueFiles:
      - $values/argocd/my-ocean-snyk-integration/values.yaml
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
kubectl apply -f my-ocean-snyk-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.


| Parameter                           | Description                                                                                                                         | Required |
|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                     | Your Port client id                                                                                                                 | ✅        |
| `port.clientSecret`                 | Your Port client secret                                                                                                             | ✅        |
| `port.baseUrl`                      | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                             | ✅        |
| `integration.identifier`            | Change the identifier to describe your integration                                                                                  | ✅        |
| `integration.type`                  | The integration type                                                                                                                | ✅        |
| `integration.eventListener.type`    | The event listener type                                                                                                             | ✅        |
| `integration.secrets.token`         | The Snyk API token                                                                                                                  | ✅        |
| `integration.config.organizationId` | The Snyk organization ID. Fetches data for this organization when provided                                                          | ❌        |
| `integration.config.groups`         | A comma-separated list of Snyk group ids to filter data for. Fetches data for organizations within the specified groups             | ❌        |
| `integration.config.apiUrl`         | The Snyk API URL. If not specified, the default will be https://api.snyk.io                                                         | ❌        |
| `integration.config.appHost`        | The host of the Port Ocean app. Used to set up the integration endpoint as the target for Webhooks created in Snyk                  | ✅        |
| `integration.secret.webhookSecret`  | This is a password you create, that Snyk uses to sign webhook events to Port                                                        | ❌        |
| `scheduledResyncInterval`           | The number of minutes between each resync                                                                                           | ❌        |
| `initializePortResources`           | Default true, When set to true the integration will create default blueprints and the port App config Mapping                       | ❌        |
| `sendRawDataExamples`               | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true | ❌        |
| `service.portName`                    | The name of the port in the Kubernetes Service resource for the main Ocean service. Default is `ocean-port`.                                                                                                                                                                                      | ❌        |
| `liveEvents.service.portName`         | The name of the port in the Kubernetes Service resource for the live events service. Default is `ocean-port`.                                                                                                                                                                                     | ❌        |
| `actionsProcessor.service.portName`   | The name of the port in the Kubernetes Service resource for the actions processor service. Default is `ocean-port`.                                                                                                                                                                               | ❌        |


<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="CI">

This workflow/pipeline will run the Snyk integration once and then exit, this is useful for **scheduled** ingestion of data.



  By default, the integration fetches **all organizations** associated with the provided Snyk token.  
  If you wish to customize access, the following parameters are available:

  `OCEAN__INTEGRATION__CONFIG__ORGANIZATION_ID`: Use this parameter to restrict access to a specific organization. If specified, the integration will fetch data only for the provided organization.

  `OCEAN__INTEGRATION__CONFIG__GROUPS`: When you want to limit access to all organizations within specific Snyk groups, use this parameter. Provide a comma-separated list of Snyk group IDs, and the integration will filter data accordingly.

  <Tabs groupId="cicd-method" queryString="cicd-method">
   <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                                     | Description                                                                                                                                       | Required |
|-----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `OCEAN__INTEGRATION__CONFIG__TOKEN`           | The Snyk API token                                                                                                                                | ✅        |
| `OCEAN__INTEGRATION__CONFIG__ORGANIZATION_ID` | The Snyk organization ID. Provide this parameter to limit access to a specific organization.                                                      | ❌        |
| `OCEAN__INTEGRATION__CONFIG__GROUPS`          | A comma-separated list of Snyk group ids to filter data for. Provide this parameter to limit access to all organizations within specific group(s) | ❌        |
| `OCEAN__INTEGRATION__CONFIG__API_URL`         | The Snyk API URL. If not specified, the default will be https://api.snyk.io                                                                       | ❌        |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                | ❌        |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`               | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true               | ❌        |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Change the identifier to describe your integration, if not set will use the default one                                                           | ❌        |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id                                                                                                                               | ✅        |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client secret                                                                                                                           | ✅        |
| `OCEAN__PORT__BASE_URL`                       | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                           | ✅        |

<br/>

Here is an example for `snyk-integration.yml` workflow file:

```yaml showLineNumbers
name: Snyk Exporter Workflow

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
          type: 'snyk'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__TOKEN }}
```

</TabItem>
   <TabItem value="jenkins" label="Jenkins">

:::tip Jenkins agent requirements
Your Jenkins agent should be able to run docker commands.
:::


Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
of `Secret Text` type:

| Parameter                                     | Description                                                                                                                                                      | Required |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `OCEAN__INTEGRATION__CONFIG__TOKEN`           | The Snyk API token                                                                                                                                               | ✅       |
| `OCEAN__INTEGRATION__CONFIG__ORGANIZATION_ID` | The Snyk organization ID. Provide this parameter to limit access to a specific organization | ❌  |
| `OCEAN__INTEGRATION__CONFIG__GROUPS` | A comma-separated list of Snyk group ids to filter data for. Provide this parameter to limit access to all organizations within specific group(s)                                       | ❌      |
| `OCEAN__INTEGRATION__CONFIG__API_URL`         | The Snyk API URL. If not specified, the default will be https://api.snyk.io                                                                                      | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                               | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                       | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Change the identifier to describe your integration, if not set will use the default one                                                                          | ❌       |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                          | ✅       |

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```text showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Snyk Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__TOKEN'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="snyk"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__TOKEN=$OCEAN__INTEGRATION__CONFIG__TOKEN \
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

:::tip Azure DevOps agent requirements
Your Azure Devops agent should be able to run docker commands.
:::


Make sure to configure the following variables using [Azure Devops variable groups](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/variable-groups?view=azure-devops&tabs=yaml). Add them into in a variable group named `port-ocean-credentials`:

| Parameter                                     | Description                                                                                                                                                      | Required |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `OCEAN__INTEGRATION__CONFIG__TOKEN`           | The Snyk API token                                                                                                                                               | ✅       |
| `OCEAN__INTEGRATION__CONFIG__ORGANIZATION_ID` | The Snyk organization ID. Provide this parameter to limit access to a specific organization | ❌  |
| `OCEAN__INTEGRATION__CONFIG__GROUPS` | A comma-separated list of Snyk group ids to filter data for. Provide this parameter to limit access to all organizations within specific group(s)                                       | ❌      |
| `OCEAN__INTEGRATION__CONFIG__API_URL`         | The Snyk API URL. If not specified, the default will be https://api.snyk.io                                                                                      | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                               | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                       | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Change the identifier to describe your integration, if not set will use the default one                                                                          | ❌       |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                          | ✅       |

<br/>

Here is an example for `snyk-integration.yml` pipeline file:

```yaml showLineNumbers
trigger:
- main

pool:
  vmImage: "ubuntu-latest"

variables:
  - group: port-ocean-credentials # OCEAN__PORT__CLIENT_ID, OCEAN__PORT__CLIENT_SECRET, OCEAN__INTEGRATION__CONFIG__TOKEN


steps:
- script: |
    echo Add other tasks to build, test, and deploy your project.
    # Set Docker image and run the container
    integration_type="snyk"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
    -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
    -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
    -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
    -e OCEAN__INTEGRATION__CONFIG__TOKEN=$(OCEAN__INTEGRATION__CONFIG__TOKEN) \
    -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
    -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
    -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
    $image_name

    exit $?
  displayName: 'Ingest Synk Data into Port'

```

  </TabItem>
  <TabItem value="gitlab" label="GitLab">

Make sure to [configure the following GitLab variables](https://docs.gitlab.com/ee/ci/variables/#for-a-project):

| Parameter                                     | Description                                                                                                                                                    | Required |
|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `OCEAN__INTEGRATION__CONFIG__TOKEN`           | The Snyk API token                                                                                                                                             | ✅        |
| `OCEAN__INTEGRATION__CONFIG__ORGANIZATION_ID` | The Snyk organization ID. Provide this parameter to limit access to a specific organization                                                                    | ❌        |
| `OCEAN__INTEGRATION__CONFIG__GROUPS`          | A comma-separated list of Snyk group ids to filter data for. Provide this parameter to limit access to all organizations within specific group(s)              | ❌        |
| `OCEAN__INTEGRATION__CONFIG__API_URL`         | The Snyk API URL. If not specified, the default will be https://api.snyk.io                                                                                    | ❌        |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                             | ❌        |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`               | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                            | ❌        |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Change the identifier to describe your integration, if not set will use the default one                                                                        | ❌        |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅        |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret | ✅        |
| `OCEAN__PORT__BASE_URL`                       | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                        | ✅        |


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
  INTEGRATION_TYPE: synk
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
        -e OCEAN__INTEGRATION__CONFIG__TOKEN=$OCEAN__INTEGRATION__CONFIG__TOKEN \
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
deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
  - kind: organization
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .attributes.name
          blueprint: '"snykOrganization"'
          properties:
            slug: .attributes.slug
            url: ("https://app.snyk.io/org/" + .attributes.slug | tostring)
  - kind: project
    selector:
      query: 'true'
      attachIssuesToProject: 'false'
    port:
      entity:
        mappings:
          identifier: .id
          title: .attributes.name
          blueprint: '"snykProject"'
          properties:
            url: ("https://app.snyk.io/org/" + .__organization.slug + "/project/" + .id | tostring)
            businessCriticality: .attributes.business_criticality
            environment: .attributes.environment
            lifeCycle: .attributes.lifecycle
            highOpenVulnerabilities: .meta.latest_issue_counts.high
            mediumOpenVulnerabilities: .meta.latest_issue_counts.medium
            lowOpenVulnerabilities: .meta.latest_issue_counts.low
            criticalOpenVulnerabilities: .meta.latest_issue_counts.critical
            tags: .attributes.tags
            targetOrigin: .attributes.origin
          relations:
            snyk_target: '.relationships.target.data.id'
  - kind: target
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .attributes.display_name
          blueprint: '"snykTarget"'
          properties:
            origin: .relationships.integration.data.attributes.integration_type
          relations:
            snyk_organization: '.relationships.organization.data.id'
  - kind: vulnerability
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .attributes.title
          blueprint: '"snykVulnerability"'
          properties:
            score: .attributes.risk.score.value
            packageNames: '[.attributes.coordinates[].representations[].dependency?.package_name | select(. != null)]'
            packageVersions: '[.attributes.coordinates[].representations[].dependency?.package_version | select(. != null)]'
            severity: .attributes.effective_severity_level
            url: ("https://app.snyk.io/org/" + .__organization.slug + "/project/" + .relationships.scan_item.data.id + "#issue-" + .attributes.key | tostring)
            publicationTime: .attributes.created_at
            status: .attributes.status
            type: .attributes.type
          relations:
            project: .relationships.scan_item.data.id
```

</details>

<MetricsAndSyncStatus/>


## Examples

Examples of blueprints and the relevant integration configurations:

### Organization

<details>
<summary><b>Organization blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "snykOrganization",
  "title": "Snyk Organization",
  "icon": "Snyk",
  "schema": {
    "properties": {
      "url": {
        "type": "string",
        "title": "URL",
        "format": "url",
        "icon": "Snyk"
      },
      "slug": {
        "type": "string",
        "title": "Slug"
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
<summary><b>Integration configuration (click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: organization
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"snykOrganization"'
          properties:
            slug: .slug
            url: ("https://app.snyk.io/org/" + .slug | tostring)
```
</details>

### Target

<details>
<summary><b>Target blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "snykTarget",
  "title": "Snyk Target",
  "icon": "Snyk",
  "schema": {
    "properties": {
      "criticalOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open Critical Vulnerabilities"
      },
      "highOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open High Vulnerabilities"
      },
      "mediumOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open Medium Vulnerabilities"
      },
      "lowOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open Low Vulnerabilities"
      },
      "origin": {
        "title": "Target Origin",
        "type": "string",
        "enum": [
          "artifactory-cr",
          "aws-config",
          "aws-lambda",
          "azure-functions",
          "azure-repos",
          "bitbucket-cloud",
          "bitbucket-server",
          "cli",
          "cloud-foundry",
          "digitalocean-cr",
          "docker-hub",
          "ecr",
          "gcr",
          "github",
          "github-cr",
          "github-enterprise",
          "gitlab",
          "gitlab-cr",
          "google-artifact-cr",
          "harbor-cr",
          "heroku",
          "ibm-cloud",
          "kubernetes",
          "nexus-cr",
          "pivotal",
          "quay-cr",
          "terraform-cloud",
          "bitbucket-connect-app",
          "acr",
          "api"
        ]
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "snyk_organization": {
      "title": "Snyk Organization",
      "target": "snykOrganization",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary><b>Integration configuration (click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: target
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .attributes.display_name
          blueprint: '"snykTarget"'
          properties:
            origin: .relationships.integration.data.attributes.integration_type
            highOpenVulnerabilities: '[.__projects[].meta.latest_issue_counts.high] | add'
            mediumOpenVulnerabilities: '[.__projects[].meta.latest_issue_counts.medium] | add'
            lowOpenVulnerabilities: '[.__projects[].meta.latest_issue_counts.low] | add'
            criticalOpenVulnerabilities: '[.__projects[].meta.latest_issue_counts.critical] | add'
          relations:
            snyk_organization: '.relationships.organization.data.id'
```

</details>

### Project

<details>
<summary><b>Project blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "snykProject",
  "title": "Snyk Project",
  "icon": "Snyk",
  "schema": {
    "properties": {
      "url": {
        "type": "string",
        "title": "URL",
        "format": "url",
        "icon": "Snyk"
      },
      "businessCriticality": {
        "title": "Business Criticality",
        "type": "array",
        "items": {
          "type": "string",
          "enum": [
            "critical",
            "high",
            "medium",
            "low"
          ]
        },
        "icon": "DefaultProperty"
      },
      "environment": {
        "items": {
          "type": "string",
          "enum": [
            "frontend",
            "backend",
            "internal",
            "external",
            "mobile",
            "saas",
            "onprem",
            "hosted",
            "distributed"
          ]
        },
        "icon": "Environment",
        "title": "Environment",
        "type": "array"
      },
      "lifeCycle": {
        "title": "Life Cycle",
        "type": "array",
        "items": {
          "type": "string",
          "enum": [
            "development",
            "sandbox",
            "production"
          ]
        },
        "icon": "DefaultProperty"
      },
      "highOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open High Vulnerabilities"
      },
      "mediumOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open Medium Vulnerabilities"
      },
      "lowOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open Low Vulnerabilities"
      },
      "tags": {
        "type": "array",
        "title": "Tags",
        "icon": "DefaultProperty"
      },
      "targetOrigin": {
        "type": "string",
        "title": "Target Origin"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "snyk_target": {
      "title": "Snyk Target",
      "target": "snykTarget",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary><b>Integration configuration (click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: project
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .attributes.name
          blueprint: '"snykProject"'
          properties:
            url: ("https://app.snyk.io/org/" + .__organization.slug + "/project/" + .id | tostring)
            businessCriticality: .attributes.business_criticality
            environment: .attributes.environment
            lifeCycle: .attributes.lifecycle
            highOpenVulnerabilities: .meta.latest_issue_counts.high
            mediumOpenVulnerabilities: .meta.latest_issue_counts.medium
            lowOpenVulnerabilities: .meta.latest_issue_counts.low
            criticalOpenVulnerabilities: .meta.latest_issue_counts.critical
            tags: .attributes.tags
            targetOrigin: .origin
          relations:
            snyk_target: '.relationships.target.data.id'
```

</details>

### Vulnerability

<details>
<summary><b>Vulnerability blueprint (click to expand)</b></summary>

```yaml showLineNumbers
{
  "identifier": "snykVulnerability",
  "title": "Snyk Vulnerability",
  "icon": "Snyk",
  "schema": {
    "properties": {
      "score": {
        "icon": "Star",
        "type": "number",
        "title": "Score"
      },
      "packageName": {
        "type": "string",
        "title": "Package Name",
        "icon": "DefaultProperty"
      },
      "packageVersions": {
        "icon": "Package",
        "title": "Package Versions",
        "type": "array"
      },
      "type": {
        "type": "string",
        "title": "Type",
        "enum": [
          "vuln",
          "license",
          "configuration"
        ],
        "icon": "DefaultProperty"
      },
      "severity": {
        "icon": "Alert",
        "title": "Issue Severity",
        "type": "string",
        "enum": ["low", "medium", "high", "critical"],
        "enumColors": {
          "low": "green",
          "medium": "yellow",
          "high": "red",
          "critical": "red"
        }
      },
      "url": {
        "icon": "Link",
        "type": "string",
        "title": "Issue URL",
        "format": "url"
      },
      "language": {
        "type": "string",
        "title": "Language",
        "icon": "DefaultProperty"
      },
      "publicationTime": {
        "type": "string",
        "format": "date-time",
        "title": "Publication Time",
        "icon": "DefaultProperty"
      },
      "isPatched": {
        "type": "boolean",
        "title": "Is Patched",
        "icon": "DefaultProperty"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "project": {
      "title": "Project",
      "target": "snykProject",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary><b>Integration configuration (click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: issue
    selector:
      query: '.issueType == "vuln"'
    port:
      entity:
        mappings:
          identifier: .issueData.id
          title: .issueData.title
          blueprint: '"snykVulnerability"'
          properties:
            score: .priorityScore
            packageName: .pkgName
            packageVersions: .pkgVersions
            type: .issueType
            severity: .issueData.severity
            url: .issueData.url
            language: .issueData.language // .issueType
            publicationTime: .issueData.publicationTime
            isPatched: .isPatched
          relations:
            project: '.links.paths | split("/") | .[8]'
```

</details>

## Let's Test It

This section includes a sample response data from Snyk. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Snyk:

<details>
<summary><b>Organization response data (click to expand)</b></summary>

```json showLineNumbers
{
  "id": "a37b1727-ed7c-4f2c-9b59-7c5908e",
  "type": "org",
  "attributes": {
    "group_id": "c7ec7fa4-50ae-450f-8b48-49270cfc54b5",
    "is_personal": false,
    "name": "NFR - Shared",
    "slug": "nfr-shared",
    "created_at": "2023-08-14T18:34:58Z",
    "updated_at": "2025-08-22T10:09:27Z"
  },
  "relationships": {
    "member_role": {
      "data": {
        "id": "d8ba290b-aa9e-4957-9f0b-9409d7b4",
        "type": "org_role"
      }
    }
  },
  "group_id": "c7ec7fa4-50ae-450f-8b48-49270cfc",
  "is_personal": false,
  "name": "NFR - Shared",
  "slug": "nfr-shared",
  "created_at": "2023-08-14T18:34:58Z",
  "updated_at": "2025-08-22T10:09:27Z"
}
```

</details>

<details>
<summary><b>Target response data (click to expand)</b></summary>

```json showLineNumbers
{
  "attributes": {
    "created_at": "2022-09-01T00:00:00Z",
    "display_name": "snyk-fixtures/goof",
    "is_private": false,
    "url": "http://github.com/snyk/local-goof"
  },
  "id": "55a348e2-c3ad-4bbc-b40e-9b232d1f4121",
  "relationships": {
    "integration": {
      "data": {
        "attributes": {
          "integration_type": "gitlab"
        },
        "id": "7667dae6-602c-45d9-baa9-79e1a640f199",
        "type": "integration"
      }
    },
    "organization": {
      "data": {
        "id": "e661d4ef-5ad5-4cef-ad16-5157cefa83f5",
        "type": "organization"
      }
    }
  },
  "type": "target"
}
```

</details>

<details>
<summary><b>Project response data (click to expand)</b></summary>

```json showLineNumbers
{
  "type": "project",
  "id": "4db4ea77-1bb5-43e3-9542-3db993c8e",
  "meta": {
    "latest_issue_counts": {
      "updated_at": "2025-11-12T01:32:36.078Z",
      "critical": 0,
      "high": 0,
      "medium": 0,
      "low": 0
    }
  },
  "attributes": {
    "name": "experimental/Py:src/requirements.txt",
    "type": "pip",
    "target_file": "src/requirements.txt",
    "target_reference": "main",
    "origin": "github",
    "created": "2025-08-01T04:50:31.081Z",
    "status": "active",
    "business_criticality": [],
    "environment": [],
    "lifecycle": [],
    "tags": [],
    "read_only": false,
    "settings": {
      "recurring_tests": {
        "frequency": "daily"
      },
      "pull_requests": {}
    }
  },
  "relationships": {
    "organization": {
      "data": {
        "type": "org",
        "id": "a37b1727-9dc0-4f2c-9b59-7c5908e4d4d2"
      },
      "links": {
        "related": "/rest/orgs/a37b1727-9dc0-4f2c-9b59-7c5908e4d4d2"
      }
    },
    "target": {
      "data": {
        "id": "d25f0f1b-c45c-40b5-9dc2-d04b8a4a659f",
        "type": "target",
        "attributes": {
          "display_name": "experimental/Py",
          "url": "https://github.com/experimental/Py"
        },
        "meta": {
          "integration_data": {
            "id": 929419086,
            "name": "Py",
            "owner": "experimental"
          }
        }
      },
      "links": {
        "related": "/rest/orgs/a37b1727-9dc0-4f2c-9b59-7c5908e4d4d2/targets/d25f0f1b-c45c-40b5-9dc2-d04b8a4a"
      }
    },
    "importer": {
      "data": {
        "type": "user",
        "id": "412b9360-5ae2-48d6-8d47-a9e27a10ff"
      },
      "links": {
        "related": "/rest/orgs/a37b1727-9dc0-4f2c-9b59-7c5908e4d4d2/users/412b9360-5ae2-48d6-8d47-a9e27a10"
      }
    }
  },
  "__organization": {
    "id": "a37b1727-9dc0-4f2c-9b59-7c5908e4",
    "type": "org",
    "attributes": {
      "group_id": "c7ec7fa4-50ae-450f-8b48-49270cfc5",
      "is_personal": false,
      "name": "Port NFR - Shared",
      "slug": "port-nfr-shared",
      "created_at": "2023-08-14T18:34:58Z",
      "updated_at": "2025-08-22T10:09:27Z"
    },
    "relationships": {
      "member_role": {
        "data": {
          "id": "d8ba290b-aa9e-4957-9f0b-9409d7b4f",
          "type": "org_role"
        }
      }
    },
    "group_id": "c7ec7fa4-50ae-450f-8b48-49270cfc",
    "is_personal": false,
    "name": "NFR - Shared",
    "slug": "nfr-shared",
    "created_at": "2023-08-14T18:34:58Z",
    "updated_at": "2025-08-22T10:09:27Z"
  }
}
```

</details>

<details>
<summary><b>Vulnerability response data (click to expand)</b></summary>

```json showLineNumbers
{
  "id": "ff2dc68c-8889-431c-91d1-6ed46dfd2",
  "type": "issue",
  "attributes": {
    "classes": [
      {
        "id": "CWE-506",
        "source": "CWE",
        "type": "weakness"
      }
    ],
    "coordinates": [
      {
        "is_fixable_manually": false,
        "is_fixable_snyk": false,
        "is_fixable_upstream": false,
        "is_patchable": false,
        "is_pinnable": false,
        "is_upgradeable": false,
        "reachability": "no-info",
        "representations": [
          {
            "dependency": {
              "package_name": "techdocs-cli-embedded-app",
              "package_version": "0.2.83-next.2"
            }
          }
        ]
      }
    ],
    "created_at": "2023-09-03T15:00:43.639Z",
    "effective_severity_level": "critical",
    "ignored": false,
    "key": "SNYK-JS-TECHDOCSCLIEMBEDDEDAPP-5868849",
    "problems": [
      {
        "id": "SNYK-JS-TECHDOCSCLIEMBEDDEDAPP-5868849",
        "source": "SNYK",
        "type": "vulnerability",
        "updated_at": "2025-04-10T06:43:02.418711Z"
      }
    ],
    "resolution": {
      "details": "",
      "resolved_at": "2023-09-19T03:19:14.456Z",
      "type": "disappeared"
    },
    "status": "resolved",
    "title": "Malicious Package",
    "type": "package_vulnerability",
    "updated_at": "2023-09-19T03:19:14.456Z"
  },
  "relationships": {
    "organization": {
      "data": {
        "id": "a37b1727-9dc0-4f2c-9b59-7c5908e4d4d2",
        "type": "organization"
      },
      "links": {
        "related": "/orgs/a37b1727-9dc0-4f2c-9b59-7c5908e4d4d2"
      }
    },
    "scan_item": {
      "data": {
        "id": "049630b0-d8id-4e8c-97f8-1daf396642fb",
        "type": "project"
      },
      "links": {
        "related": "/orgs/a37b1727-9dc0-4f2c-9b59-7c5908e4d4d2/projects/049630b0-c683-4e8c-97f8-1daf396642fb"
      }
    }
  },
  "__organization": {
    "id": "a37b1727-9dc0-4f2c-9b59-7c5908e4",
    "type": "org",
    "attributes": {
      "group_id": "c7ec7fa4-50ae-450f-8b48-49270cfc",
      "is_personal": false,
      "name": "NFR - Shared",
      "slug": "nfr-shared",
      "created_at": "2023-08-14T18:34:58Z",
      "updated_at": "2025-08-22T10:09:27Z"
    },
    "relationships": {
      "member_role": {
        "data": {
          "id": "d8ba290b-de7a-4957-9f0b-9409d7b4",
          "type": "org_role"
        }
      }
    },
    "group_id": "c7ec7fa4-10dx-450f-8b48-49270cfc54b5",
    "is_personal": false,
    "name": "NFR - Shared",
    "slug": "nfr-shared",
    "created_at": "2023-08-14T18:34:58Z",
    "updated_at": "2025-08-22T10:09:27Z"
  }
}
```

</details>

## Alternative installation via webhook
While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from Snyk. If so, use the following instructions:

<details>

<summary><b>Webhook installation (click to expand)</b></summary>

In this example you are going to create a webhook integration between [Snyk](https://snyk.io/) and Port, which will ingest Snyk code and infrastructure vulnerability entities into Port.

<h3>Port configuration</h3>

Create the following blueprint definition:

<details>
<summary><b>Snyk vulnerability blueprint (click to expand)</b></summary>

<SnykBlueprint/>

</details>

Create the following webhook configuration [using Port UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary><b>Snyk vulnerability webhook configuration (click to expand)</b></summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Snyk Mapper`;
   2. Identifier : `snyk_mapper`;
   3. Description : `A webhook configuration to map Snyk vulnerability to Port`;
   4. Icon : `Snyk`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <SnykConfiguration/>

3. Scroll down to **Advanced settings** and input the following details:
   1. secret: `WEBHOOK_SECRET`;
   2. Signature Header Name : `x-hub-signature`;
   3. Signature Algorithm : Select `sha256` from dropdown option;
   4. Signature Prefix : `sha256=`
   5. Click **Save** at the bottom of the page.

Remember to replace the `WEBHOOK_SECRET` with the real secret you specify when creating the webhook in Snyk.

</details>

<h3>Create a webhook in Snyk</h3>

1. Go to [Snyk](https://snyk.io/) and select an account you want to configure the webhook for;
2. Click on **Settings** at the left of the page and copy your organization ID under the **Organization ID** section;
3. Navigate to your [Snyk accounts page](https://snyk.io/account/) and copy your API token. You will use this value to authorize the REST API;
4. Open any REST API client such as POSTMAN and make the following API call to create your webhook:
   1. `API URL` - use https://api.snyk.io/v1/org/`YOUR_ORG_ID`/webhooks;
   2. `Method` - select POST
   3. `Authorization` - The API token should be supplied in an Authorization header as `Authorization: token YOUR_API_KEY`;
   4. `Request Body` - The body of your request should be in a JSON format. Past the following information in the body text
   ```json
   {
     "url": "https://ingest.getport.io/<YOUR_PORT_WEBHOOK_KEY>",
     "secret": "WEBHOOK_SECRET"
   }
   ```
5. Click **Send** to create your Snyk webhook;

:::note Webhook creation using cURL
You can also create the Snyk webhook using the `curl` command below:

```curl showLineNumbers
curl -X POST \
     -H "Authorization: token YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://ingest.getport.io/<YOUR_PORT_WEBHOOK_KEY>", "secret": "WEBHOOK_SECRET"}' \
     https://api.snyk.io/v1/org/<YOUR_ORG_ID>/webhooks
```

:::

Done! Any vulnerability detected on your source code will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
</details>

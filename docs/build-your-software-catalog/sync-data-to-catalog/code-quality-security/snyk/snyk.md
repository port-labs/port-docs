import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/\_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '../../../../generalTemplates/\_ocean_advanced_configuration_note.md'
import SnykBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/snyk/\_example_snyk_vulnerability_blueprint.mdx";
import SnykConfiguration from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/snyk/\_example_snyk_vulnerability_webhook_configuration.mdx";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"

# Snyk

Our Snyk integration allows you to import `organizations`, `targets`, `projects` and `issues` from your Snyk account into Port, according to your mapping and definitions.

## Common use cases

- Map `organizations`, `targets`, `projects` and `issues` in your Snyk environment.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Create/delete Snyk objects using self-service actions.

## Prerequisites

<Prerequisites />

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-always-on" label="Real Time & Always On">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:


| Parameter                           | Description                                                                                                        | Required |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `port.clientId`                     | Your Port client id                                                                                                | ✅       |
| `port.clientSecret`                 | Your Port client secret                                                                                            | ✅       |
| `port.baseUrl`                      | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                            | ✅       |
| `integration.identifier`            | Change the identifier to describe your integration                                                                 | ✅       |
| `integration.type`                  | The integration type                                                                                               | ✅       |
| `integration.eventListener.type`    | The event listener type                                                                                            | ✅       |
| `integration.secrets.token`         | The Snyk API token                                                                                                 | ✅       |
| `integration.config.organizationId` | The Snyk organization ID. Fetches data for this organization when provided                                                                     |❌       |
| `integration.config.groups` | A comma-separated list of Snyk group ids to filter data for. Fetches data for organizations within the specified groups                                                          |❌       |
| `integration.config.apiUrl`         | The Snyk API URL. If not specified, the default will be https://api.snyk.io                                        | ❌       |
| `integration.config.appHost`        | The host of the Port Ocean app. Used to set up the integration endpoint as the target for Webhooks created in Snyk | ❌       |
| `integration.secret.webhookSecret`  | This is a password you create, that Snyk uses to sign webhook events to Port                                       | ❌       |
| `scheduledResyncInterval`           | The number of minutes between each resync                                                                          | ❌       |
| `initializePortResources`           | Default true, When set to true the integration will create default blueprints and the port App config Mapping      | ❌       |
| `sendRawDataExamples`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                       | ❌       |


<br/>

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm">

By default, the integration fetches all organizations associated with the provided Snyk token. If you wish to customize access, the following parameters are available:

`integration.config.organizationId`: Use this parameter to restrict access to a specific organization. If specified, the integration will fetch data only for the provided organization.

`integration.config.groups`: When you want to limit access to all organizations within specific Snyk groups, use this parameter. Provide a comma-separated list of Snyk group IDs, and the integration will filter data accordingly.

:::note Default behaviour
If neither parameter is provided, the integration will operate with the default behavior of fetching all organizations associated with the supplied Snyk token.
:::

To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-snyk-integration port-labs/port-ocean \
  --set port.clientId="PORT_CLIENT_ID"  \
  --set port.clientSecret="PORT_CLIENT_SECRET"  \
  --set port.baseUrl="https://api.getport.io"  \
  --set initializePortResources=true  \
  --set sendRawDataExamples=true  \
  --set scheduledResyncInterval=120 \
  --set integration.identifier="my-snyk-integration"  \
  --set integration.type="snyk"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.secrets.token="SNYK_TOKEN"
```
<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

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
  <summary>ArgoCD Application</summary>

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
    targetRevision: 0.1.14
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

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time" label="Scheduled">

  By default, the integration fetches all organizations associated with the provided Snyk token. If you wish to customize access, the following parameters are available:

  `OCEAN__INTEGRATION__CONFIG__ORGANIZATION_ID`: Use this parameter to restrict access to a specific organization. If specified, the integration will fetch data only for the provided organization.

  `OCEAN__INTEGRATION__CONFIG__GROUPS`: When you want to limit access to all organizations within specific Snyk groups, use this parameter. Provide a comma-separated list of Snyk group IDs, and the integration will filter data accordingly.

  :::note Default behaviour
  If neither parameter is provided, the integration will operate with the default behavior of fetching all organizations associated with the supplied Snyk token.
  :::

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Snyk integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                                     | Description                                                                                                        | Required |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `OCEAN__INTEGRATION__CONFIG__TOKEN`           | The Snyk API token                                                                                                 | ✅       |
| `OCEAN__INTEGRATION__CONFIG__ORGANIZATION_ID` | The Snyk organization ID. Provide this parameter to limit access to a specific organization.                                                                                       | ❌      |
| `OCEAN__INTEGRATION__CONFIG__GROUPS` | A comma-separated list of Snyk group ids to filter data for. Provide this parameter to limit access to all organizations within specific group(s)                                                   | ❌      |
| `OCEAN__INTEGRATION__CONFIG__API_URL`         | The Snyk API URL. If not specified, the default will be https://api.snyk.io                                        | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                       | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Change the identifier to describe your integration, if not set will use the default one                            | ❌       |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id                                                                                                | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client secret                                                                                            | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                              | ✅       |

<br/>

Here is an example for `snyk-integration.yml` workflow file:

```yaml showLineNumbers
name: Snyk Exporter Workflow

# This workflow responsible for running Snyk exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

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
This pipeline will run the Snyk integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Jenkins agent should be able to run docker commands.
:::
:::warning
If you want the integration to update Port in real time using webhooks you should use
the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
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
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret | ✅       |
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
This pipeline will run the Snyk integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Azure Devops agent should be able to run docker commands.
:::
:::warning
If you want the integration to update Port in real time using webhooks you should use
the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
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
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret | ✅       |
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
This pipeline will run the Synk integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Realtime updates in Port
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to [configure the following GitLab variables](https://docs.gitlab.com/ee/ci/variables/#for-a-project):

| Parameter                                     | Description                                                                                                                                                      | Required |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `OCEAN__INTEGRATION__CONFIG__TOKEN`           | The Snyk API token                                                                                                                                               | ✅       |
| `OCEAN__INTEGRATION__CONFIG__ORGANIZATION_ID` | The Snyk organization ID. Provide this parameter to limit access to a specific organization | ❌  |
| `OCEAN__INTEGRATION__CONFIG__GROUPS` | A comma-separated list of Snyk group ids to filter data for. Provide this parameter to limit access to all organizations within specific group(s)                                       | ❌      |
| `OCEAN__INTEGRATION__CONFIG__API_URL`         | The Snyk API URL. If not specified, the default will be https://api.snyk.io                                                                                      | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                               | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                       | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Change the identifier to describe your integration, if not set will use the default one                                                                          | ❌       |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                          | ✅       |


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

## Ingesting Snyk objects

The Snyk integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `project` data from Snyk:

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: project
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id
          title: .attributes.name
          blueprint: '"snykProject"'
          properties:
            url: ("https://app.snyk.io/org/" + .relationships.organization.data.id + "/project/" + .id | tostring)
            owner: .__owner.email
            businessCriticality: .attributes.business_criticality
            environment: .attributes.environment
            lifeCycle: .attributes.lifecycle
            highOpenVulnerabilities: .meta.latest_issue_counts.high
            mediumOpenVulnerabilities: .meta.latest_issue_counts.medium
            lowOpenVulnerabilities: .meta.latest_issue_counts.low
            criticalOpenVulnerabilities: .meta.latest_issue_counts.critical
            importedBy: .__importer.email
            tags: .attributes.tags
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Snyk's API events.

:::note
In a case where an api request to Snyk's api will receive error code `SNYK-9999` which means that Snyk experienced an internal error, the resync will continue to export and log that error.  This might result in some data missing from the portal. In such cases head to the Event Log inside the integration section and look for that error it will have all the information required to contact snyk to investigate that error
:::

### Configuration structure

The integration configuration determines which resources will be queried from Snyk, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Snyk, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Organization`](https://snyk.docs.apiary.io/#reference/organizations/the-snyk-organization-for-a-request/list-all-the-organizations-a-user-belongs-to)
- [`Target`](https://apidocs.snyk.io/?version=2023-08-21%7Ebeta#get-/orgs/-org_id-/targets)
- [`Project`](https://apidocs.snyk.io/?version=2023-08-21#get-/orgs/-org_id-/projects)
- [`Issue`](https://snyk.docs.apiary.io/#reference/projects/aggregated-project-issues/list-all-aggregated-issues)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: project
      selector:
      ...
  ```

- The `kind` key is a specifier for a Snyk object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: project
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: project
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-end
      port:
  ```

- The `port`, `entity` and the `mappings` keys are used to map the Snyk object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: project
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one Snyk object to a Port entity. Each value is a JQ query.
            identifier: .id
            title: .attributes.name
            blueprint: '"snykProject"'
            properties:
              url: ("https://app.snyk.io/org/" + .relationships.organization.data.id + "/project/" + .id | tostring)
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
        # highlight-end
    - kind: project # In this instance project is mapped again with a different filter
      selector:
        query: '.name == "MyProjectName"'
      port:
        entity:
          mappings: ...
  ```

  :::tip Blueprint key
  Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

### Ingest data into Port

To ingest Snyk objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Snyk.
3. Choose the **Ingest Data** option from the menu.
4. Select Snyk under the Code quality & security providers category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Organization

<details>
<summary>Organization blueprint</summary>

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
<summary>Integration configuration</summary>

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
<summary>Target blueprint</summary>

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
    "synk_organization": {
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
<summary>Integration configuration</summary>

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
            synk_organization: '.relationships.organization.data.id'
```

</details>

### Project

<details>
<summary>Project blueprint</summary>

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
<summary>Integration configuration</summary>

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
            url: ("https://app.snyk.io/org/" + .relationships.organization.data.id + "/project/" + .id | tostring)
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
<summary>Vulnerability blueprint</summary>

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
<summary>Integration configuration</summary>

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
<summary>Organization response data</summary>

```json showLineNumbers
{
  "name": "My Other Org",
  "id": "a04d9cbd-ae6e-44af-b573-0556b0ad4bd2",
  "slug": "my-other-org",
  "url": "https://api.snyk.io/org/my-other-org",
  "group": {
    "name": "ACME Inc.",
    "id": "a060a49f-636e-480f-9e14-38e773b2a97f"
  }
}
```

</details>

<details>
<summary>Target response data</summary>

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
<summary>Project response data</summary>

```json showLineNumbers
{
  "name": "snyk/goof",
  "id": "af137b96-6966-46c1-826b-2e79ac49bbd9",
  "created": "2018-10-29T09:50:54.014Z",
  "origin": "github",
  "type": "maven",
  "readOnly": false,
  "testFrequency": "daily",
  "totalDependencies": 42,
  "issueCountsBySeverity": {
    "low": 13,
    "medium": 8,
    "high": 1,
    "critical": 3
  },
  "imageId": "sha256:caf27325b298a6730837023a8a342699c8b7b388b8d878966b064a1320043019",
  "imageTag": "latest",
  "imageBaseImage": "alpine:3",
  "imagePlatform": "linux/arm64",
  "imageCluster": "Production",
  "hostname": null,
  "remoteRepoUrl": "https://github.com/snyk/goof.git",
  "lastTestedDate": "2019-02-05T08:54:07.704Z",
  "browseUrl": "https://app.snyk.io/org/4a18d42f-0706-4ad0-b127-24078731fbed/project/af137b96-6966-46c1-826b-2e79ac49bbd9",
  "importingUser": {
    "id": "e713cf94-bb02-4ea0-89d9-613cce0caed2",
    "name": "example-user@snyk.io",
    "username": "exampleUser",
    "email": "example-user@snyk.io"
  },
  "isMonitored": false,
  "branch": null,
  "targetReference": null,
  "tags": [
    {
      "key": "example-tag-key",
      "value": "example-tag-value"
    }
  ],
  "attributes": {
    "criticality": ["high"],
    "environment": ["backend"],
    "lifecycle": ["development"]
  },
  "remediation": {
    "upgrade": {},
    "patch": {},
    "pin": {}
  }
}
```

</details>

<details>
<summary>Vulnerability response data</summary>

```json showLineNumbers
{
  "id": "npm:ms:20170412",
  "issueType": "vuln",
  "pkgName": "ms",
  "pkgVersions": ["1.0.0"],
  "issueData": {
    "id": "npm:ms:20170412",
    "title": "Regular Expression Denial of Service (ReDoS)",
    "severity": "low",
    "originalSeverity": "high",
    "url": "https://snyk.io/vuln/npm:ms:20170412",
    "description": "`## Overview\\r\\n[`ms`](https://www.npmjs.com/package/ms) is a tiny millisecond conversion utility.\\r\\n\\r\\nAffected versions of this package are vulnerable to Regular Expression Denial of Service (ReDoS) due to an incomplete fix for previously reported vulnerability [npm:ms:20151024](https://snyk.io/vuln/npm:ms:20151024). The fix limited the length of accepted input string to 10,000 characters, and turned to be insufficient making it possible to block the event loop for 0.3 seconds (on a typical laptop) with a specially crafted string passed to `ms",
    "identifiers": {
      "CVE": [],
      "CWE": ["CWE-400"],
      "OSVDB": []
    },
    "credit": ["Snyk Security Research Team"],
    "exploitMaturity": "no-known-exploit",
    "semver": {
      "vulnerable": [">=0.7.1 <2.0.0"],
      "unaffected": ""
    },
    "publicationTime": "2017-05-15T06:02:45Z",
    "disclosureTime": "2017-04-11T21:00:00Z",
    "CVSSv3": "CVSS:3.0/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:L",
    "cvssScore": 3.7,
    "language": "js",
    "patches": [
      {
        "id": "patch:npm:ms:20170412:0",
        "urls": [
          "https://snyk-patches.s3.amazonaws.com/npm/ms/20170412/ms_100.patch"
        ],
        "version": "=1.0.0",
        "comments": [],
        "modificationTime": "2019-12-03T11:40:45.863964Z"
      }
    ],
    "nearestFixedInVersion": "2.0.0",
    "path": "[DocId: 1].input.spec.template.spec.containers[snyk2].securityContext.privileged",
    "violatedPolicyPublicId": "SNYK-CC-K8S-1",
    "isMaliciousPackage": true
  },
  "introducedThrough": [
    {
      "kind": "imageLayer",
      "data": {}
    }
  ],
  "isPatched": false,
  "isIgnored": false,
  "ignoreReasons": [
    {
      "reason": "",
      "expires": "",
      "source": "cli"
    }
  ],
  "fixInfo": {
    "isUpgradable": false,
    "isPinnable": false,
    "isPatchable": false,
    "isFixable": false,
    "isPartiallyFixable": false,
    "nearestFixedInVersion": "2.0.0",
    "fixedIn": ["2.0.0"]
  },
  "priority": {
    "score": 399,
    "factors": [{}, "name: `isFixable`", "description: `Has a fix available`"]
  },
  "links": {
    "paths": ""
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
<summary>Snyk vulnerability blueprint</summary>

<SnykBlueprint/>

</details>

Create the following webhook configuration [using Port UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>Snyk vulnerability webhook configuration</summary>

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

:::note
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
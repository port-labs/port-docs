import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import AzurePremise from "../../templates/\_ocean_azure_premise.mdx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import DynatraceProblemBlueprint from "/docs/build-your-software-catalog/sync-data-to-catalog/apm-alerting/resources/dynatrace/\_example_dynatrace_problem_blueprint.mdx";
import DynatraceProblemConfiguration from "/docs/build-your-software-catalog/sync-data-to-catalog/apm-alerting/resources/dynatrace/\_example_dynatrace_problem_webhook_configuration.mdx"
import DynatraceMicroserviceBlueprint from "/docs/build-your-software-catalog/sync-data-to-catalog/apm-alerting/resources/dynatrace/\_example_dynatrace_microservice_blueprint.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_helm_prerequisites_block.mdx"

# Dynatrace

Port's Dynatrace integration allows you to model Dynatrace resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Map and organize your desired Dynatrace resources and their metadata in Port (see supported resources below).
- Watch for Dynatrace object changes (create/update/delete) in real-time, and automatically apply the changes to your software catalog.

### Supported Resources

The resources that can be ingested from Dynatrace into Port are listed below. It is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`problem`](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/problems-v2/problems/get-problems-list#definition--Problem)
- [`entity`](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/entity-v2/get-entities-list#definition--Entity)
- [`slo`](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/service-level-objectives/get-all#definition--SLO)
- [`team`](https://docs.dynatrace.com/docs/discover-dynatrace/references/dynatrace-api/environment-api/settings/objects/get-object)

## Prerequisites

### Generate a Dynatrace API key

1. Navigate to `<instanceURL>/ui/apps/dynatrace.classic.tokens/ui/access-tokens`. For example, if you access your Dynatrace instance at `https://npm82883.apps.dynatrace.com`, you should navigate to `https://npm82883.apps.dynatrace.com/ui/apps/dynatrace.classic.tokens/ui/access-tokens`.

2. Click **Generate new token** to create a new token. Ensure the permissions: `DataExport`, `Read entities`, `Read problems`, `Read SLO` and `Read settings` are assigned to the token. The `DataExport` permission allows Dynatrace to perform healthchecks before ingestion starts. The `Read settings` scope allows the integration to ingest teams.

### Construct your Dynatrace Host URL
Your Dynatrace host URL should be `https://<environment-id>.live.dynatrace.com`. Note that there is a difference between the instance URL and the API host URL. The former contains `apps` while the latter (as shown prior) uses `live`. This means if your environment ID is `npm82883`, your API host URL should be `https://npm82883.live.dynatrace.com`.


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

<OceanRealtimeInstallation integration="Dynatrace" />

<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-dynatrace-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `DYNATRACE_HOST_URL` and `DYNATRACE_API_KEY`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-dynatrace-integration
  type: dynatrace
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    dynatraceHostUrl: DYNATRACE_HOST_URL
  secrets:
  // highlight-next-line
    dynatraceApiKey: DYNATRACE_API_KEY
```
<br/>

2. Install the `my-ocean-dynatrace-integration` ArgoCD Application by creating the following `my-ocean-dynatrace-integration.yaml` manifest:

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
  name: my-ocean-dynatrace-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-dynatrace-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-dynatrace-integration/values.yaml
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
kubectl apply -f my-ocean-dynatrace-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                             | Description                                                                                                                                                               | Required |
|---------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                       | Your port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                             | ✅        |
| `port.clientSecret`                   | Your port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                         | ✅        |
| `port.baseUrl`                        | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                   | ✅        |
| `integration.identifier`              | Change the identifier to describe your integration                                                                                                                        | ✅        |
| `integration.type`                    | The integration type                                                                                                                                                      | ✅        |
| `integration.eventListener.type`      | The event listener type                                                                                                                                                   | ✅        |
| `integration.secrets.dynatraceApiKey` | API Key for Dynatrace instance, docs can be found [here](https://docs.dynatrace.com/docs/discover-dynatrace/references/dynatrace-api/basics/dynatrace-api-authentication) | ✅        |
| `integration.config.dynatraceHostUrl` | The API URL of the Dynatrace instance                                                                                                                                     | ✅        |
| `scheduledResyncInterval`             | The number of minutes between each resync                                                                                                                                 | ❌        |
| `initializePortResources`             | Default true, When set to true the integration will create default blueprints and the port App config Mapping                                                             | ❌        |


</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the Dynatrace integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using webhooks, use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option.
:::

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                                        | Description                                                                                                                                                       | Required |
|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY`  | The Dynatrace API key , docs can be found [here](https://docs.dynatrace.com/docs/discover-dynatrace/references/dynatrace-api/basics/dynatrace-api-authentication) | ✅        |
| `OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL` | The Dynatrace API host URL                                                                                                                                        | ✅        |
| `OCEAN__INITIALIZE_PORT_RESOURCES`               | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                                | ❌        |
| `OCEAN__INTEGRATION__IDENTIFIER`                 | Change the identifier to describe your integration, if not set will use the default one                                                                           | ❌        |
| `OCEAN__PORT__CLIENT_ID`                         | Your port client id                                                                                                                                               | ✅        |
| `OCEAN__PORT__CLIENT_SECRET`                     | Your port client secret                                                                                                                                           | ✅        |
| `OCEAN__PORT__BASE_URL`                          | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                           | ✅        |


<br/>

Here is an example for `dynatrace-integration.yml` workflow file:

```yaml showLineNumbers
name: Dynatrace Exporter Workflow

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
          type: 'dynatrace'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            dynatrace_api_key: ${{ secrets.OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY }}
            dynatrace_host_url: ${{ secrets.OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">

:::tip
Your Jenkins agent should be able to run docker commands.
:::

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
of `Secret Text` type:

| Parameter                                        | Description                                                                                                        | Required |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY`  | The Dynatrace API key                                                                                              | ✅       |
| `OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL` | The Dynatrace host URL                                                                                             | ✅       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`               | Default true, When set to false the integration will not create default blueprints and the port App config Mapping | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`                 | Change the identifier to describe your integration, if not set will use the default one                            | ❌       |
| `OCEAN__PORT__CLIENT_ID`                         | Your port client id                                                                                                | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                     | Your port client secret                                                                                            | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                 | ✅       |


<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```groovy showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Dynatrace Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY', variable: 'OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL', variable: 'OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="dynatrace"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY=$OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY \
                                -e OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL=$OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL \
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

| Parameter                                        | Description                                                                                                        | Required |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|----------|
| `OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY`  | The Dynatrace API key                                                                                              | ✅        |
| `OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL` | The Dynatrace API host URL                                                                                         | ✅        |
| `OCEAN__INITIALIZE_PORT_RESOURCES`               | Default true, When set to false the integration will not create default blueprints and the port App config Mapping | ❌        |
| `OCEAN__INTEGRATION__IDENTIFIER`                 | Change the identifier to describe your integration, if not set will use the default one                            | ❌        |
| `OCEAN__PORT__CLIENT_ID`                         | Your port client id                                                                                                | ✅        |
| `OCEAN__PORT__CLIENT_SECRET`                     | Your port client secret                                                                                            | ✅        |
| `OCEAN__PORT__BASE_URL`                          | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                            | ✅        |


<br/>

Here is an example for `dyntrace-integration.yml` pipeline file:

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
    integration_type="dynatrace"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY=$(OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY) \
        -e OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL=$(OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL) \
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


| Parameter                                        | Description                                                                                                        | Required |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY`  | The Dynatrace API key                                                                                              | ✅       |
| `OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL` | The Dynatrace API host URL                                                                                             | ✅       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`               | Default true, When set to false the integration will not create default blueprints and the port App config Mapping | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`                 | Change the identifier to describe your integration, if not set will use the default one                            | ❌       |
| `OCEAN__PORT__CLIENT_ID`                         | Your port client id                                                                                                | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                     | Your port client secret                                                                                            | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                 | ✅       |


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
  INTEGRATION_TYPE: dynatrace
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
        -e OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY=$OCEAN__INTEGRATION__CONFIG__DYNATRACE_API_KEY \
        -e OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL=$OCEAN__INTEGRATION__CONFIG__DYNATRACE_HOST_URL \
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
- kind: entity
  selector:
    query: 'true'
    entityFields: firstSeenTms,lastSeenTms,tags
    entityTypes:
    - APPLICATION
    - SERVICE
  port:
    entity:
      mappings:
        identifier: .entityId
        title: .displayName
        blueprint: '"dynatraceEntity"'
        properties:
          firstSeen: (.firstSeenTms // 0) / 1000 | todate
          lastSeen: (.lastSeenTms // 0) / 1000 | todate
          type: .type
          tags: .tags // [] | .[].stringRepresentation
- kind: problem
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .problemId
        title: .title
        blueprint: '"dynatraceProblem"'
        properties:
          entityTags: .entityTags[].stringRepresentation
          evidenceDetails: .evidenceDetails.details // [] | .[].displayName
          managementZones: .managementZones[].name
          problemFilters: .problemFilters[].name
          severityLevel: .severityLevel
          status: .status
          startTime: .startTime / 1000 | todate
          endTime: .endTime | if . == -1 then null else (./1000 | todate) end
        relations:
          impactedEntities: .impactedEntities[].entityId.id
          linkedProblemInfo: .linkedProblemInfo.problemId
          rootCauseEntity: .rootCauseEntity.entityId.id
- kind: slo
  selector:
    query: 'true'
    attachRelatedEntities: true
  port:
    entity:
      mappings:
        identifier: .id
        title: .name
        blueprint: '"dynatraceSlo"'
        properties:
          status: .status
          target: .target
          enabled: .enabled
          warning: .warning
          error: .error
          errorBudget: .errorBudget
          evaluatedPercentage: .evaluatedPercentage
          evaluationType: .evaluationType
          filter: .filter
        relations:
          entities: if .__entities != null then .__entities | map(.entityId) else [] end
```

</details>


### Ingest additional resource types
By default, the `entity` kind ingests only entities of type `APPLICATION` and `SERVICE` due to the large number of available resources. However, you can configure the `entity` kind mapping to ingest entities of other types.

To do this, use the `entityTypes` selector in the entity mapping like so:

<details>
<summary><b>Mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: entity
    selector:
      query: "true"
      # highlight-next-line
      entityTypes: ["APPLICATION", "SERVICE"]
    port:
      entity:
        mappings:
          identifier: .entityId
          title: .displayName
          blueprint: '"dynatraceEntity"'
          properties:
            firstSeen: ".firstSeenTms / 1000 | todate"
            lastSeen: ".lastSeenTms / 1000 | todate"
            type: .type
            tags: .tags[].stringRepresentation
            managementZones: .managementZones[].name
            properties: .properties
            fromRelationships: .fromRelationships
            toRelationships: .toRelationships
```

</details>

#### Available resource types
You can retrieve a list of available resource types by using the [Dynatrace Entity Types API](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/entity-v2/get-entity-type#definition--EntityType).   Below is a list of resource types retrieved from the API:

<details>
<summary><b>Dynatrace entity types (Click to expand)</b></summary>

- `APM_SECURITY_GATEWAY`
- `APPLICATION`
- `APPLICATION_METHOD`
- `APPLICATION_METHOD_GROUP`
- `APPMON_SERVER`
- `APPMON_SYSTEM_PROFILE`
- `AUTO_SCALING_GROUP`
- `AWS_APPLICATION_LOAD_BALANCER`
- `AWS_AVAILABILITY_ZONE`
- `AWS_CREDENTIALS`
- `AWS_LAMBDA_FUNCTION`
- `AWS_NETWORK_LOAD_BALANCER`
- `AZURE_API_MANAGEMENT_SERVICE`
- `AZURE_APPLICATION_GATEWAY`
- `AZURE_APP_SERVICE_PLAN`
- `AZURE_COSMOS_DB`
- `AZURE_CREDENTIALS`
- `AZURE_EVENT_HUB`
- `AZURE_EVENT_HUB_NAMESPACE`
- `AZURE_FUNCTION_APP`
- `AZURE_IOT_HUB`
- `AZURE_LOAD_BALANCER`
- `AZURE_MGMT_GROUP`
- `AZURE_REDIS_CACHE`
- `AZURE_REGION`
- `AZURE_SERVICE_BUS_NAMESPACE`
- `AZURE_SERVICE_BUS_QUEUE`
- `AZURE_SERVICE_BUS_TOPIC`
- `AZURE_SQL_DATABASE`
- `AZURE_SQL_ELASTIC_POOL`
- `AZURE_SQL_SERVER`
- `AZURE_STORAGE_ACCOUNT`
- `AZURE_SUBSCRIPTION`
- `AZURE_TENANT`
- `AZURE_VM`
- `AZURE_VM_SCALE_SET`
- `AZURE_WEB_APP`
- `BOSH_DEPLOYMENT`
- `BROWSER`
- `CF_FOUNDATION`
- `CINDER_VOLUME`
- `CLOUD_APPLICATION`
- `CLOUD_APPLICATION_INSTANCE`
- `CLOUD_APPLICATION_NAMESPACE`
- `CONTAINER_GROUP`
- `CONTAINER_GROUP_INSTANCE`
- `CUSTOM_APPLICATION`
- `CUSTOM_DEVICE`
- `CUSTOM_DEVICE_GROUP`
- `DATASTORE`
- `DCRUM_APPLICATION`
- `DCRUM_SERVICE`
- `DCRUM_SERVICE_INSTANCE`
- `DEVICE_APPLICATION_METHOD`
- `DEVICE_APPLICATION_METHOD_GROUP`
- `DISK`
- `DOCKER_CONTAINER_GROUP`
- `DOCKER_CONTAINER_GROUP_INSTANCE`
- `DYNAMO_DB_TABLE`
- `EBS_VOLUME`
- `EC2_INSTANCE`
- `ELASTIC_LOAD_BALANCER`
- `ENVIRONMENT`
- `EXTERNAL_SYNTHETIC_TEST`
- `EXTERNAL_SYNTHETIC_TEST_STEP`
- `GCP_ZONE`
- `GEOLOCATION`
- `GEOLOC_SITE`
- `GOOGLE_COMPUTE_ENGINE`
- `HOST`
- `HOST_GROUP`
- `HTTP_CHECK`
- `HTTP_CHECK_STEP`
- `HYPERVISOR`
- `HYPERVISOR_CLUSTER`
- `HYPERVISOR_DISK`
- `KUBERNETES_CLUSTER`
- `KUBERNETES_NODE`
- `KUBERNETES_SERVICE`
- `MOBILE_APPLICATION`
- `MULTIPROTOCOL_MONITOR`
- `NETWORK_INTERFACE`
- `NEUTRON_SUBNET`
- `OPENSTACK_AVAILABILITY_ZONE`
- `OPENSTACK_COMPUTE_NODE`
- `OPENSTACK_PROJECT`
- `OPENSTACK_REGION`
- `OPENSTACK_VM`
- `OS`
- `PROCESS_GROUP`
- `PROCESS_GROUP_INSTANCE`
- `QUEUE`
- `QUEUE_INSTANCE`
- `RELATIONAL_DATABASE_SERVICE`
- `RUNTIME_COMPONENT`
- `S3BUCKET`
- `SERVICE`
- `SERVICE_INSTANCE`
- `SERVICE_METHOD`
- `SERVICE_METHOD_GROUP`
- `SOFTWARE_COMPONENT`
- `SWIFT_CONTAINER`
- `SYNTHETIC_LOCATION`
- `SYNTHETIC_TEST`
- `SYNTHETIC_TEST_STEP`
- `VCENTER`
- `VIRTUALMACHINE`
- `VMWARE_DATACENTER`
- `cloud:aws:acmprivateca`
- `cloud:aws:api_gateway`
- `cloud:aws:app_runner`
- `cloud:aws:appstream`
- `cloud:aws:appsync`
- `cloud:aws:athena`
- `cloud:aws:aurora`
- `cloud:aws:autoscaling`
- `cloud:aws:billing`
- `cloud:aws:cassandra`
- `cloud:aws:chatbot`
- `cloud:aws:cloud_front`
- `cloud:aws:cloudhsm`
- `cloud:aws:cloudsearch`
- `cloud:aws:codebuild`
- `cloud:aws:cognito`
- `cloud:aws:connect`
- `cloud:aws:datasync`
- `cloud:aws:dax`
- `cloud:aws:dms`
- `cloud:aws:documentdb`
- `cloud:aws:dxcon`
- `cloud:aws:dynamodb`
- `cloud:aws:ebs`
- `cloud:aws:ec2_spot`
- `cloud:aws:ec2api`
- `cloud:aws:ecs`
- `cloud:aws:ecs:cluster`
- `cloud:aws:efs`
- `cloud:aws:eks:cluster`
- `cloud:aws:elasticache`
- `cloud:aws:elasticbeanstalk`
- `cloud:aws:elasticinference`
- `cloud:aws:elastictranscoder`
- `cloud:aws:emr`
- `cloud:aws:es`
- `cloud:aws:events`
- `cloud:aws:fsx`
- `cloud:aws:gamelift`
- `cloud:aws:glue`
- `cloud:aws:inspector`
- `cloud:aws:iot`
- `cloud:aws:iot_things_graph`
- `cloud:aws:iotanalytics`
- `cloud:aws:kafka`
- `cloud:aws:kinesis:data_analytics`
- `cloud:aws:kinesis:data_firehose`
- `cloud:aws:kinesis:data_stream`
- `cloud:aws:kinesis:video_stream`
- `cloud:aws:lambda`
- `cloud:aws:lex`
- `cloud:aws:logs`
- `cloud:aws:media_tailor`
- `cloud:aws:mediaconnect`
- `cloud:aws:mediaconvert`
- `cloud:aws:mediapackagelive`
- `cloud:aws:mediapackagevod`
- `cloud:aws:mq`
- `cloud:aws:nat_gateway`
- `cloud:aws:neptune`
- `cloud:aws:opsworks`
- `cloud:aws:polly`
- `cloud:aws:qldb`
- `cloud:aws:rds`
- `cloud:aws:redshift`
- `cloud:aws:rekognition`
- `cloud:aws:robomaker`
- `cloud:aws:route53`
- `cloud:aws:route53resolver`
- `cloud:aws:s3`
- `cloud:aws:sage_maker:batch_transform_job`
- `cloud:aws:sage_maker:endpoint`
- `cloud:aws:sage_maker:endpoint_instance`
- `cloud:aws:sage_maker:ground_truth`
- `cloud:aws:sage_maker:processing_job`
- `cloud:aws:sage_maker:training_job`
- `cloud:aws:servicecatalog`
- `cloud:aws:ses`
- `cloud:aws:sns`
- `cloud:aws:sqs`
- `cloud:aws:ssm-runcommand`
- `cloud:aws:states`
- `cloud:aws:storagegateway`
- `cloud:aws:swf`
- `cloud:aws:textract`
- `cloud:aws:transfer`
- `cloud:aws:transitgateway`
- `cloud:aws:translate`
- `cloud:aws:trustedadvisor`
- `cloud:aws:usage`
- `cloud:aws:vpn`
- `cloud:aws:waf`
- `cloud:aws:wafv2`
- `cloud:aws:workmail`
- `cloud:aws:workspaces`
- `cloud:azure:apimanagement:service`
- `cloud:azure:app:containerapps`
- `cloud:azure:app:managedenvironments`
- `cloud:azure:appconfiguration:configurationstores`
- `cloud:azure:appplatform:spring`
- `cloud:azure:automation:automationaccounts`
- `cloud:azure:batch:account`
- `cloud:azure:blockchain:blockchainmembers`
- `cloud:azure:cache:redis`
- `cloud:azure:cdn:cdnwebapplicationfirewallpolicies`
- `cloud:azure:cdn:profiles`
- `cloud:azure:classic_storage_account`
- `cloud:azure:classic_storage_account:blob`
- `cloud:azure:classic_storage_account:file`
- `cloud:azure:classic_storage_account:queue`
- `cloud:azure:classic_storage_account:table`
- `cloud:azure:classic_virtual_machine`
- `cloud:azure:cognitiveservices:allinone`
- `cloud:azure:cognitiveservices:anomalydetector`
- `cloud:azure:cognitiveservices:bingautosuggest`
- `cloud:azure:cognitiveservices:bingcustomsearch`
- `cloud:azure:cognitiveservices:bingentitysearch`
- `cloud:azure:cognitiveservices:bingsearch`
- `cloud:azure:cognitiveservices:bingspellcheck`
- `cloud:azure:cognitiveservices:computervision`
- `cloud:azure:cognitiveservices:contentmoderator`
- `cloud:azure:cognitiveservices:customvisionprediction`
- `cloud:azure:cognitiveservices:customvisiontraining`
- `cloud:azure:cognitiveservices:face`
- `cloud:azure:cognitiveservices:immersivereader`
- `cloud:azure:cognitiveservices:inkrecognizer`
- `cloud:azure:cognitiveservices:luis`
- `cloud:azure:cognitiveservices:luisauthoring`
- `cloud:azure:cognitiveservices:openai`
- `cloud:azure:cognitiveservices:personalizer`
- `cloud:azure:cognitiveservices:qnamaker`
- `cloud:azure:cognitiveservices:speech`
- `cloud:azure:cognitiveservices:textanalytics`
- `cloud:azure:cognitiveservices:translator`
- `cloud:azure:containerinstance:containergroup`
- `cloud:azure:containerregistry:registries`
- `cloud:azure:containerservice:managedcluster`
- `cloud:azure:datafactory:v1`
- `cloud:azure:datafactory:v2`
- `cloud:azure:datalakeanalytics:accounts`
- `cloud:azure:datalakestore:accounts`
- `cloud:azure:datashare:accounts`
- `cloud:azure:devices:iothubs`
- `cloud:azure:devices:provisioningservices`
- `cloud:azure:documentdb:databaseaccounts:global`
- `cloud:azure:documentdb:databaseaccounts:mongo`
- `cloud:azure:eventgrid:domains`
- `cloud:azure:eventgrid:systemtopics`
- `cloud:azure:eventgrid:topics`
- `cloud:azure:eventhub:clusters`
- `cloud:azure:frontdoor`
- `cloud:azure:hdinsight:cluster`
- `cloud:azure:hybridcompute:machines`
- `cloud:azure:insights:components`
- `cloud:azure:iotcentral:iotapps`
- `cloud:azure:keyvault:vaults`
- `cloud:azure:kusto:clusters`
- `cloud:azure:logic:integrationserviceenvironments`
- `cloud:azure:logic:workflows`
- `cloud:azure:machinelearningservices:workspaces`
- `cloud:azure:maps:accounts`
- `cloud:azure:mariadb:server`
- `cloud:azure:media:mediaservices`
- `cloud:azure:media:mediaservices:streamingendpoints`
- `cloud:azure:mysql:flexibleservers`
- `cloud:azure:mysql:server`
- `cloud:azure:netapp:netappaccounts:capacitypools`
- `cloud:azure:netapp:netappaccounts:capacitypools:volumes`
- `cloud:azure:network:applicationgateways`
- `cloud:azure:network:azurefirewalls`
- `cloud:azure:network:dnszones`
- `cloud:azure:network:expressroutecircuits`
- `cloud:azure:network:loadbalancers:basic`
- `cloud:azure:network:loadbalancers:gateway`
- `cloud:azure:network:loadbalancers:standard`
- `cloud:azure:network:networkinterfaces`
- `cloud:azure:network:networkwatchers:connectionmonitors`
- `cloud:azure:network:networkwatchers:connectionmonitors:previe`
- `cloud:azure:network:privatednszones`
- `cloud:azure:network:publicipaddresses`
- `cloud:azure:notificationhubs:namespaces:notificationhubs`
- `cloud:azure:postgresql:flexibleservers`
- `cloud:azure:postgresql:server`
- `cloud:azure:postgresql:serverv2`
- `cloud:azure:powerbidedicated:capacities`
- `cloud:azure:recoveryservices:vaults`
- `cloud:azure:relay:namespaces`
- `cloud:azure:search:searchservices`
- `cloud:azure:servicefabricmesh:applications`
- `cloud:azure:signalrservice:signalr`
- `cloud:azure:sql:managed`
- `cloud:azure:sql:servers`
- `cloud:azure:sql:servers:databases:datawarehouse`
- `cloud:azure:sql:servers:databases:dtu`
- `cloud:azure:sql:servers:databases:hyperscale`
- `cloud:azure:sql:servers:databases:vcore`
- `cloud:azure:sql:servers:elasticpools:dtu`
- `cloud:azure:sql:servers:elasticpools:vcore`
- `cloud:azure:storage:storageaccounts`
- `cloud:azure:storage:storageaccounts:blob`
- `cloud:azure:storage:storageaccounts:file`
- `cloud:azure:storage:storageaccounts:queue`
- `cloud:azure:storage:storageaccounts:table`
- `cloud:azure:storagesync:storagesyncservices`
- `cloud:azure:streamanalytics:streamingjobs`
- `cloud:azure:synapse:workspaces`
- `cloud:azure:synapse:workspaces:bigdatapools`
- `cloud:azure:synapse:workspaces:sqlpools`
- `cloud:azure:timeseriesinsights:environments`
- `cloud:azure:timeseriesinsights:eventsources`
- `cloud:azure:traffic_manager_profile`
- `cloud:azure:virtual_network_gateway`
- `cloud:azure:web:appslots`
- `cloud:azure:web:functionslots`
- `cloud:azure:web:hostingenvironments:v2`
- `cloud:azure:web:serverfarms`
- `cloud:gcp:autoscaler`
- `cloud:gcp:bigquery_biengine_model`
- `cloud:gcp:cloud_function`
- `cloud:gcp:cloud_run_revision`
- `cloud:gcp:cloudsql_database`
- `cloud:gcp:filestore_instance`
- `cloud:gcp:gae_app`
- `cloud:gcp:gce_instance`
- `cloud:gcp:gcs_bucket`
- `cloud:gcp:https_lb`
- `cloud:gcp:instance_group`
- `cloud:gcp:internal_http_lb_rule`
- `cloud:gcp:internal_network_lb_rule`
- `cloud:gcp:k8s_cluster`
- `cloud:gcp:k8s_container`
- `cloud:gcp:k8s_node`
- `cloud:gcp:k8s_pod`
- `cloud:gcp:network_lb_rule`
- `cloud:gcp:project`
- `cloud:gcp:pubsub_snapshot`
- `cloud:gcp:pubsub_subscription`
- `cloud:gcp:pubsub_topic`
- `cloud:gcp:pubsublite_subscription_partition`
- `cloud:gcp:pubsublite_topic_partition`
- `cloud:gcp:tcp_ssl_proxy_rule`
- `cloud:gcp:tpu_worker`
- `os:service`
</details>



## Capabilities

### Configure real-time updates

Currently, the Dynatrace API lacks support for programmatic webhook creation.
To set up a webhook configuration in Dynatrace for sending alert notifications to the Ocean integration,
follow these steps:

:::info Webhook configuration
Prepare a webhook `URL` using this format: `{app_host}/integration/webhook/problem`.  
The `app_host` parameter should match the ingress or external load balancer where the integration will be deployed.  
For example, if your ingress or load balancer exposes the Dynatrace Ocean integration at `https://myservice.domain.com`,
your webhook `URL` should be `https://myservice.domain.com/integration/webhook/problem`.
:::

1. Go to Dynatrace.
2. Go to **Settings** > **Integration** > **Problem notifications**.
3. Select **Add notification**.
4. Select **Custom integration** from the available notification types.
5. Configure the notification using the following details.
    1. `Enabled` - ensure the notification is enabled.
    2. `Display name` - use a meaningful name such as Port Ocean Webhook.
    3. `Webhook URL` - enter the value of the `URL` you created above.
    4. Enable **Call webhook is new events merge into existing problems**.
    5. `Custom payload` - paste the following configuration:
        ```
        {
            "State":"{State}",
            "ProblemID":"{ProblemID}",
            "ProblemTitle":"{ProblemTitle}"
        }
        ```
       You can customize to your taste, the only important thing is the `ProblemID` key. The webhook integration will not work without it.
    6. `Alerting profile` - select the corresponding alerting profile.
    7. Leave the rest of the fields as is.
6. Click **Save changes**.


## Examples

Examples of blueprints and the relevant integration configurations:

### Entity

<details>
<summary>Entity blueprint</summary>

```json showLineNumbers
{
  "identifier": "dynatraceEntity",
  "description": "This blueprint represents a Dynatrace Entity",
  "title": "Dynatrace Entity",
  "icon": "Dynatrace",
  "schema": {
    "properties": {
      "firstSeen": {
        "type": "string",
        "title": "First Seen",
        "description": "The timestamp at which the entity was first seen, in UTC milliseconds.",
        "format": "date-time"
      },
      "lastSeen": {
        "type": "string",
        "title": "Last Seen",
        "description": "The timestamp at which the entity was last seen, in UTC milliseconds.",
        "format": "date-time"
      },
      "type": {
        "type": "string",
        "title": "Type",
        "description": "The type of the entity."
      },
      "tags": {
        "type": "array",
        "title": "Tags",
        "description": "A list of tags of the entity.",
        "items": {
          "type": "string"
        }
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
  - kind: entity
    selector:
      query: "true"
      entityTypes: ["APPLICATION", "SERVICE"] # An optional list of entity types to filter by. If not specified, defaults to ["APPLICATION", "SERVICE"].
    port:
      entity:
        mappings:
          identifier: .entityId
          title: .displayName
          blueprint: '"dynatraceEntity"'
          properties:
            firstSeen: ".firstSeenTms / 1000 | todate"
            lastSeen: ".lastSeenTms / 1000 | todate"
            type: .type
            tags: .tags[].stringRepresentation
```

</details>

### Problem

<details>
<summary> Problem blueprint</summary>

```json showlineNumbers
{
  "identifier": "dynatraceProblem",
  "description": "This blueprint represents a Dynatrace Problem",
  "title": "Dynatrace Problem",
  "icon": "Dynatrace",
  "schema": {
    "properties": {
      "entityTags": {
        "type": "array",
        "title": "Entity Tags",
        "description": "A list of all entity tags of the problem.",
        "items": {
          "type": "string"
        }
      },
      "evidenceDetails": {
        "type": "array",
        "title": "Evidence Details",
        "description": "A list of all evidence details of the problem.",
        "items": {
          "type": "string"
        }
      },
      "managementZones": {
        "type": "array",
        "title": "Management Zones",
        "description": "A list of all management zones that the problem belongs to.",
        "items": {
          "type": "string"
        }
      },
      "problemFilters": {
        "type": "array",
        "title": "Problem Filters",
        "description": "A list of alerting profiles that match the problem.",
        "items": {
          "type": "string"
        }
      },
      "severityLevel": {
        "type": "string",
        "title": "Severity Level",
        "description": "The severity level of the problem.",
        "enum": [
          "AVAILABILITY",
          "CUSTOM_ALERT",
          "ERROR",
          "INFO",
          "MONITORING_UNAVAILABLE",
          "PERFORMANCE",
          "RESOURCE_CONTENTION"
        ],
        "enumColors": {
          "AVAILABILITY": "blue",
          "CUSTOM_ALERT": "turquoise",
          "ERROR": "red",
          "INFO": "green",
          "MONITORING_UNAVAILABLE": "darkGray",
          "PERFORMANCE": "orange",
          "RESOURCE_CONTENTION": "yellow"
        }
      },
      "status": {
        "type": "string",
        "title": "Status",
        "description": "The status of the problem.",
        "enum": ["CLOSED", "OPEN"],
        "enumColors": {
          "CLOSED": "green",
          "OPEN": "red"
        }
      },
      "startTime": {
        "type": "string",
        "title": "Start Time",
        "description": "The start time of the problem, in UTC milliseconds.",
        "format": "date-time"
      },
      "endTime": {
        "type": "string",
        "title": "End Time",
        "description": "The end time of the problem, in UTC milliseconds.",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "impactedEntities": {
      "title": "Impacted Entities",
      "target": "dynatraceEntity",
      "required": false,
      "many": true
    },
    "linkedProblemInfo": {
      "title": "Linked Problem Info",
      "target": "dynatraceProblem",
      "required": false,
      "many": false
    },
    "rootCauseEntity": {
      "title": "Root Cause Entity",
      "target": "dynatraceEntity",
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
  - kind: problem
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .problemId
          title: .title
          blueprint: '"dynatraceProblem"'
          properties:
            entityTags: .entityTags[].stringRepresentation
            evidenceDetails: .evidenceDetails.details[].displayName
            managementZones: .managementZones[].name
            problemFilters: .problemFilters[].name
            severityLevel: .severityLevel
            status: .status
            startTime: ".startTime / 1000 | todate"
            endTime: ".endTime | if . == -1 then null else (./1000 | todate) end"
          relations:
            impactedEntities: .impactedEntities[].entityId.id
            linkedProblemInfo: .linkedProblemInfo.problemId
            rootCauseEntity: .rootCauseEntity.entityId.id
```

</details>

### SLO

<details>
<summary> SLO blueprint</summary>

```json showlineNumbers
{
  "identifier": "dynatraceSlo",
  "description": "This blueprint represents a Dynatrace SLO",
  "title": "Dynatrace SLO",
  "icon": "Dynatrace",
  "schema": {
    "properties": {
      "status": {
        "type": "string",
        "title": "Status",
        "description": "The status of the SLO.",
        "enum": ["FAILURE", "WARNING", "SUCCESS"],
        "enumColors": {
          "FAILURE": "red",
          "WARNING": "yellow",
          "SUCCESS": "green"
        }
      },
      "target": {
        "type": "number",
        "title": "Target",
        "description": "The target value of the SLO."
      },
      "enabled": {
        "type": "boolean",
        "title": "Enabled",
        "description": "Whether the SLO is enabled."
      },
      "warning": {
        "type": "number",
        "title": "Warning",
        "description": "The warning value of the SLO. At warning state the SLO is still fulfilled but is getting close to failure."
      },
      "error": {
        "type": "string",
        "title": "Error",
        "description": "The error of the SLO calculation. If the value differs from NONE, there is something wrong with the SLO calculation."
      },
      "errorBudget": {
        "type": "number",
        "title": "Error Budget",
        "description": "The error budget of the calculated SLO."
      },
      "evaluatedPercentage": {
        "type": "number",
        "title": "Evaluated Percentage",
        "description": "The calculated status value of the SLO."
      },
      "evaluationType": {
        "type": "string",
        "title": "Evaluation Type",
        "description": "The type of the SLO evaluation."
      },
      "filter": {
        "type": "string",
        "title": "Filter",
        "description": "The filter for the SLO evaluation."
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "entities": {
      "title": "Related Entities",
      "target": "dynatraceEntity",
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
  - kind: slo
    selector:
      query: "true"
      attachRelatedEntities: true
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"dynatraceSlo"'
          properties:
            status: .status
            target: .target
            enabled: .enabled
            warning: .warning
            error: .error
            errorBudget: .errorBudget
            evaluatedPercentage: .evaluatedPercentage
            evaluationType: .evaluationType
            filter: .filter
          relations:
            entities: if .__entities != null then .__entities | map(.entityId) else [] end
```

</details>

### Team

<details>
<summary>Team blueprint</summary>

```json showLineNumbers
{
  "identifier": "dynatraceTeam",
  "description": "This blueprint represents a Dynatrace team in our software catalog",
  "title": "Dynatrace Team",
  "icon": "Dynatrace",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description"
      },
      "responsibilities": {
        "type": "object",
        "title": "Responsibilities"
      },
      "productivityToolsContact": {
        "type": "array",
        "title": "Productivity Tools Contact",
        "items": {
          "type": "string",
          "format": "url"
        }
      },
      "emailContact": {
        "type": "string",
        "title": "Email Contact",
        "format": "user"
      },
      "additionalDetails": {
        "items": {
          "type": "object"
        },
        "type": "array",
        "title": "Additional Details"
      },
      "links": {
        "icon": "DefaultProperty",
        "type": "array",
        "title": "Links",
        "items": {
          "type": "string",
          "format": "url"
        }
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
  - kind: team
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .value.identifier
          title: .value.name
          blueprint: '"dynatraceTeam"'
          properties:
            description: .value.descriptions
            links: '[.value.links[] | .url]'
            emailContact: .value.contactDetails[] | select(.integrationType == "EMAIL") | .email
            productivityToolsContact: '[.value.contactDetails[] | select(.integrationType != "EMAIL" and .url != null) | .url]'
            responsibilities: .value.responsibilities
            additionalDetails: .value.additionalInformation
```

</details>

## Let's Test It

This section includes a sample response data from Dynatrace. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Dynatrace:

<details>
<summary>Entity response data</summary>

```json showLineNumbers
{
  "displayName": "my host",
  "entityId": "HOST-06F288EE2A930951",
  "firstSeenTms": 1574697667547,
  "fromRelationships": {
    "isInstanceOf": [
      {
        "id": "HOST_GROUP-0E489369D663A4BF",
        "type": "HOST_GROUP"
      }
    ]
  },
  "icon": {
    "customIconPath": "host",
    "primaryIconType": "linux",
    "secondaryIconType": "microsoft-azure-signet"
  },
  "lastSeenTms": 1588242361417,
  "managementZones": [
    {
      "id": "6239538939987181652",
      "name": "main app"
    }
  ],
  "properties": {
    "bitness": 64,
    "cpuCores": 8,
    "monitoringMode": "FULL_STACK",
    "networkZoneId": "aws.us.east01",
    "osArchitecture": "X86",
    "osType": "LINUX"
  },
  "tags": [
    {
      "context": "CONTEXTLESS",
      "key": "architecture",
      "stringRepresentation": "architecture:x86",
      "value": "x86"
    },
    {
      "context": "ENVIRONMENT",
      "key": "Infrastructure",
      "stringRepresentation": "[ENVIRONMENT]Infrastructure:Linux",
      "value": "Linux"
    }
  ],
  "toRelationships": {
    "isDiskOf": [
      {
        "id": "DISK-0393340DCA3853B0",
        "type": "DISK"
      }
    ]
  },
  "type": "HOST"
}
```

</details>

<details>
<summary>Problem response data</summary>

```json showLineNumbers
{
  "affectedEntities": [
    {
      "entityId": {
        "id": "string",
        "type": "string"
      },
      "name": "string"
    }
  ],
  "displayId": "string",
  "endTime": 1574697669865,
  "entityTags": [
    {
      "context": "CONTEXTLESS",
      "key": "architecture",
      "stringRepresentation": "architecture:x86",
      "value": "x86"
    },
    {
      "context": "ENVIRONMENT",
      "key": "Infrastructure",
      "stringRepresentation": "[ENVIRONMENT]Infrastructure:Linux",
      "value": "Linux"
    }
  ],
  "evidenceDetails": {
    "details": [
      {
        "displayName": "Availability evidence",
        "entity": {},
        "evidenceType": "AVAILABILITY_EVIDENCE",
        "groupingEntity": {},
        "rootCauseRelevant": true,
        "startTime": 1
      },
      {
        "displayName": "User action evidence",
        "entity": {},
        "evidenceType": "USER_ACTION_EVIDENCE",
        "groupingEntity": {},
        "rootCauseRelevant": true,
        "startTime": 1
      }
    ],
    "totalCount": 1
  },
  "impactAnalysis": {
    "impacts": [
      {
        "estimatedAffectedUsers": 1,
        "impactType": "APPLICATION",
        "impactedEntity": {}
      }
    ]
  },
  "impactLevel": "APPLICATION",
  "impactedEntities": [{}],
  "linkedProblemInfo": {
    "displayId": "string",
    "problemId": "string"
  },
  "managementZones": [
    {
      "id": "string",
      "name": "HOST"
    }
  ],
  "problemFilters": [
    {
      "id": "E2A930951",
      "name": "BASELINE"
    }
  ],
  "problemId": "06F288EE2A930951",
  "recentComments": {
    "comments": [
      {
        "authorName": "string",
        "content": "string",
        "context": "string",
        "createdAtTimestamp": 1,
        "id": "string"
      }
    ],
    "nextPageKey": "AQAAABQBAAAABQ==",
    "pageSize": 1,
    "totalCount": 1
  },
  "rootCauseEntity": {},
  "severityLevel": "AVAILABILITY",
  "startTime": 1574697667547,
  "status": "CLOSED",
  "title": "title"
}
```

</details>

<details>
<summary>SLO response data</summary>

```json showLineNumbers
{
  "burnRateMetricKey": "func:slo.errorBudgetBurnRate.payment_service_availability",
  "denominatorValue": 90,
  "description": "Rate of successful payments per week",
  "enabled": true,
  "error": "NONE",
  "errorBudget": 1.25,
  "errorBudgetBurnRate": {
    "burnRateType": "SLOW",
    "burnRateValue": 1.25,
    "burnRateVisualizationEnabled": true,
    "estimatedTimeToConsumeErrorBudget": 24,
    "fastBurnThreshold": 1.5,
    "sloValue": 95
  },
  "errorBudgetMetricKey": "func:slo.errorBudget.payment_service_availability",
  "evaluatedPercentage": 96.25,
  "evaluationType": "AGGREGATE",
  "filter": "type(\"SERVICE\")",
  "id": "123e4567-e89b-42d3-a456-556642440000",
  "metricDenominator": "builtin:service.requestCount.server",
  "metricExpression": "(100)*(builtin:service.errors.server.successCount:splitBy())/(builtin:service.requestCount.server:splitBy())",
  "metricKey": "func:slo.payment_service_availability",
  "metricNumerator": "builtin:service.errors.server.successCount",
  "metricRate": "builtin:service.successes.server.rate",
  "name": "Payment service availability",
  "normalizedErrorBudgetMetricKey": "func:slo.normalizedErrorBudget.payment_service_availability",
  "numeratorValue": 80,
  "problemFilters": "[type(\"SERVICE\")]",
  "relatedOpenProblems": 1,
  "relatedTotalProblems": 1,
  "status": "WARNING",
  "target": 95,
  "timeframe": "-1d",
  "useRateMetric": true,
  "warning": 97.5,
  "__entities": [{"entityId": "SERVICE-EF25D598399706BD", "type": "SERVICE", "displayName": "oidic-authentication-service"}]
}
```

</details>

<details>
<summary>Team response data</summary>

```json showLineNumbers
{
  "objectId": "vu9U3hXa3q0AAAABABdidWlsdGluOm93bmVyc2hpcC50ZWFtcwAGdGVuYW50AAZ0ZW5hbnQAJDBkNGU5YjRmLWU3YzktM2Q2Ni1iYTlmLWUyNjRiMjhmZjI4ML7vVN4V2t6t",
  "value": {
    "name": "integration-devs",
    "description": "Task to improve all integrations in Port",
    "identifier": "integration-devs",
    "supplementaryIdentifiers": [
      {
        "supplementaryIdentifier": "integral"
      }
    ],
    "responsibilities": {
      "development": false,
      "security": true,
      "operations": false,
      "infrastructure": false,
      "lineOfBusiness": false
    },
    "contactDetails": [
      {
        "integrationType": "MS_TEAMS",
        "msTeams": "internal developer portal",
        "url": "https://microsoft.teams.com"
      },
      {
        "integrationType": "JIRA",
        "jira": {
          "project": "DEMO",
          "defaultAssignee": "support@devex.io"
        },
        "url": "https://mydomain.atlassian.net/jira/your-work"
      },
      {
        "integrationType": "EMAIL",
        "email": "support@getport.io"
      },
      {
        "integrationType": "SLACK",
        "slackChannel": "devex",
        "url": "https://app.slack.com/client/SOMEID"
      }
    ],
    "links": [
      {
        "linkType": "REPOSITORY",
        "url": "https://github.com/getport"
      },
      {
        "linkType": "URL",
        "url": "https://myjira.io/teams/integration_bugs"
      }
    ],
    "additionalInformation": [
      {
        "key": "hero",
        "value": "batman",
        "url": "https://example.com"
      }
    ]
  }
}
```

</details>


### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary>Entity entity in Port</summary>

```json showLineNumbers
{
  "identifier": "HOST-06F288EE2A930951",
  "title": "my host",
  "blueprint": "dynatraceEntity",
  "team": [],
  "icon": "Dynatrace",
  "properties": {
    "firstSeen": "2019-11-25T14:14:27Z",
    "lastSeen": "2020-04-30T14:52:41Z",
    "type": "HOST",
    "tags": ["architecture:x86", "[ENVIRONMENT]Infrastructure:Linux"]
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
<summary>Problem entity in Port</summary>

```json showLineNumbers
{
  "identifier": "06F288EE2A930951",
  "title": "title",
  "blueprint": "dynatraceProblem",
  "team": [],
  "icon": "Dynatrace",
  "properties": {
    "entityTags": ["architecture:x86", "[ENVIRONMENT]Infrastructure:Linux"],
    "evidenceDetails": ["Availability evidence", "User action evidence"],
    "managementZones": ["HOST"],
    "problemFilters": ["BASELINE"],
    "severityLevel": "AVAILABILITY",
    "status": "CLOSED",
    "startTime": "2019-11-25T14:14:27Z",
    "endTime": "2020-04-30T14:52:41Z"
  },
  "relations": {
    "impactedEntities": ["HOST-06F288EE2A930951"],
    "linkedProblemInfo": "06F288EE2A930951",
    "rootCauseEntity": "HOST-06F288EE2A930951"
  },
  "createdAt": "2024-2-6T09:30:57.924Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-2-6T11:49:20.881Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary>SLO entity in Port</summary>

```json showLineNumbers
{
  "identifier": "123e4567-e89b-42d3-a456-556642440000",
  "title": "Payment service availability",
  "blueprint": "dynatraceSlo",
  "team": [],
  "icon": "Dynatrace",
  "properties": {
    "status": "WARNING",
    "target": 95,
    "enabled": true,
    "warning": 97.5,
    "error": "NONE",
    "errorBudget": 1.25,
    "evaluatedPercentage": 96.25,
    "evaluationType": "AGGREGATE",
    "filter": "type(\"SERVICE\")"
  },
  "relations": {
    "entities": [
      "SERVICE-EF25D598399706BD"
    ]
  }
}
```
</details>

<details>
<summary>Team entity in Port</summary>

```json showLineNumbers
{
  "identifier": "integration-devs",
  "title": "integration-devs",
  "blueprint": "dynatraceTeam",
  "properties": {
    "description": "Task to improve all integrations in Port",
    "links": [
      "https://github.com/getport",
      "https://myapp.io/teams/integration_bugs"
    ],
    "emailContact": "support@devex.io",
    "additionalDetails": [
      {
        "key": "hero",
        "value": "batman",
        "url": "https://example.com"
      }
    ],
    "productivityContactDetails": [
      "https://microsoft.teams.com",
      "https://mydomain.atlassian.net/jira/your-work",
      "https://app.slack.com/client/SOMEID"
    ],
    "responsibilities": {
      "development": false,
      "security": true,
      "operations": false,
      "infrastructure": false,
      "lineOfBusiness": false
    }
  }
}
```
</details>


## Alternative installation via webhook
While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest problem from Dynatrace. If so, use the following instructions:

**Note** that when using this method, data will be ingested into Port only when the webhook is triggered.
<details>
<summary><b>Webhook installation (click to expand)</b></summary>

<h2>Port configuration</h2>

Create the following blueprint definitions:

<details>
<summary>Dynatrace microservice blueprint</summary>
<DynatraceMicroserviceBlueprint/>
</details>

<details>
<summary>Dynatrace problem blueprint</summary>
<DynatraceProblemBlueprint/>
</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints):

<details>
<summary>Dynatrace problem webhook configuration</summary>

1. **Basic details** tab - fill the following details:

    1. Title : `Dynatrace Problem Mapper`;
    2. Identifier : `dynatrace_problem_mapper`;
    3. Description : `A webhook configuration for problem events from Dynatrace`;
    4. Icon : `Dynatrace`;

2. **Integration configuration** tab - fill the following JQ mapping:

   <DynatraceProblemConfiguration/>

3. Click **Save** at the bottom of the page.

</details>

:::note
The webhook configuration's relation mapping will function properly only when the identifiers of the Port microservice entities match the names of the entities in your Dynatrace.

If there is a mismatch, you can utilize [Dynatrace Tags](https://www.dynatrace.com/support/help/manage/tags-and-metadata) to align the actual identifier in Port.

To do this, create a tag with the key `proj` and value `microservice_identifier`.

Then, update the relation JQ syntax to establish a connection between the Dynatrace problem and the Port microservice. Here is the updated JQ Mappings:

```json showLineNumbers
{
    "blueprint": "dynatraceProblem",
    "entity": {
     ...Properties mappings,
      "relations": {
         "microservice": ".body.ProblemTags | split(\", \") | map(select(test(\"proj:\")) | sub(\"proj:\";\"\"))"
      }
    }
}
```

<details>
<summary>JQ expression explained</summary>
The above JQ expression will split the tags by comma and space, then filter the tags that start with `proj:` and remove the `proj:` prefix from the tag value.
</details>
:::

<h2>Create a webhook in Dynatrace</h2>

1. Log in to Dynatrace with your credentials.
2. Click on **Settings** at the left sidebar of the page.
3. Choose **Integration** and click on **Problem notifications**.
4. Select **Add notification**.
5. Select **Custom integration** from the available integration types.
6. Input the following details:
    1. `Display name` - use a meaningful name such as Port Webhook.
    2. `Webhook URL` - enter the value of the `url` key you received after creating the webhook configuration.
    3. `Overview` - you can add an optional HTTP header to your webhook request.
    4. `Custom payload` - When a problem is detected or resolved on your entity, this payload will be sent to the webhook URL. You can enter this JSON placeholder in the textbox:

       ```json showLineNumbers
       {
          "State":"{State}",
          "PID":"{PID}",
          "ProblemTitle":"{ProblemTitle}",
          "ImpactedEntity": "{ImpactedEntity}",
          "ProblemDetailsText": "{ProblemDetailsText}",
          "ProblemImpact": "{ProblemImpact}",
          "ProblemSeverity": "{ProblemSeverity}",
          "ProblemURL": "{ProblemURL}",
          "ProblemTags": "{ProblemTags}",
          "ImpactedEntities": {ImpactedEntities}
       }
       ```

    5. `Alerting profile` - configure your preferred alerting rule or use the default one.
7. Click **Save changes** at the bottom of the page.

:::tip
 To view the different payloads and events available in Dynatrace webhooks, [look here](https://www.dynatrace.com/support/help/observe-and-explore/notifications-and-alerting/problem-notifications/webhook-integration).
:::

Done! Any problem detected on your Dynatrace entity will trigger a webhook event. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2>Let's Test It</h2>

This section includes a sample response data from Dynatrace. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

<h3>Payload</h3>

Here is an example of the payload structure from Dynatrace:

<details>
<summary>Problem response data</summary>

```json showLineNumbers
{
  "affectedEntities": [
    {
      "entityId": {
        "id": "string",
        "type": "string"
      },
      "name": "string"
    }
  ],
  "displayId": "string",
  "endTime": 1574697669865,
  "entityTags": [
    {
      "context": "CONTEXTLESS",
      "key": "architecture",
      "stringRepresentation": "architecture:x86",
      "value": "x86"
    },
    {
      "context": "ENVIRONMENT",
      "key": "Infrastructure",
      "stringRepresentation": "[ENVIRONMENT]Infrastructure:Linux",
      "value": "Linux"
    }
  ],
  "evidenceDetails": {
    "details": [
      {
        "displayName": "Availability evidence",
        "entity": {},
        "evidenceType": "AVAILABILITY_EVIDENCE",
        "groupingEntity": {},
        "rootCauseRelevant": true,
        "startTime": 1
      },
      {
        "displayName": "User action evidence",
        "entity": {},
        "evidenceType": "USER_ACTION_EVIDENCE",
        "groupingEntity": {},
        "rootCauseRelevant": true,
        "startTime": 1
      }
    ],
    "totalCount": 1
  },
  "impactAnalysis": {
    "impacts": [
      {
        "estimatedAffectedUsers": 1,
        "impactType": "APPLICATION",
        "impactedEntity": {}
      }
    ]
  },
  "impactLevel": "APPLICATION",
  "impactedEntities": [{}],
  "linkedProblemInfo": {
    "displayId": "string",
    "problemId": "string"
  },
  "managementZones": [
    {
      "id": "string",
      "name": "HOST"
    }
  ],
  "problemFilters": [
    {
      "id": "E2A930951",
      "name": "BASELINE"
    }
  ],
  "problemId": "06F288EE2A930951",
  "recentComments": {
    "comments": [
      {
        "authorName": "string",
        "content": "string",
        "context": "string",
        "createdAtTimestamp": 1,
        "id": "string"
      }
    ],
    "nextPageKey": "AQAAABQBAAAABQ==",
    "pageSize": 1,
    "totalCount": 1
  },
  "rootCauseEntity": {},
  "severityLevel": "AVAILABILITY",
  "startTime": 1574697667547,
  "status": "CLOSED",
  "title": "title"
}
```

</details>

<h3>Mapping Result</h3>

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary>Problem entity in Port</summary>

```json showLineNumbers
{
  "identifier": "06F288EE2A930951",
  "title": "title",
  "blueprint": "dynatraceProblem",
  "team": [],
  "icon": "Dynatrace",
  "properties": {
    "entityTags": ["architecture:x86", "[ENVIRONMENT]Infrastructure:Linux"],
    "evidenceDetails": ["Availability evidence", "User action evidence"],
    "managementZones": ["HOST"],
    "problemFilters": ["BASELINE"],
    "severityLevel": "AVAILABILITY",
    "status": "CLOSED",
    "startTime": "2019-11-25T14:14:27Z",
    "endTime": "2020-04-30T14:52:41Z"
  },
  "relations": {
    "impactedEntities": ["HOST-06F288EE2A930951"],
    "linkedProblemInfo": "06F288EE2A930951",
    "rootCauseEntity": "HOST-06F288EE2A930951"
  },
  "createdAt": "2024-2-6T09:30:57.924Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-2-6T11:49:20.881Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
  
}
```

</details>

<h2>Ingest Dynatrace Entities</h2>

In this example,
you will create a `dynatrace_entity` blueprint that ingests monitored entities from your Dynatrace account.
You will then add a Python script to make API calls to Dynatrace REST API and fetch data for your account.

- [Code Repository Example](https://github.com/port-labs/example-dynatrace-entities)

</details>

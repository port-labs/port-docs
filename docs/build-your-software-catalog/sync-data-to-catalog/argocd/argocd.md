import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_helm_prerequisites_block.mdx"
import ProjecttBlueprint from '/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/argocd/\_example_project_blueprint.mdx'
import ApplicationBlueprint from '/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/argocd/\_example_application_blueprint.mdx'
import EventBlueprint from '/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/argocd/\_example_event_blueprint.mdx'

import ArgoCDWebhookConfig from '/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/argocd/\_example_webhook_configuration.mdx'
import ArgoCDEventWebhookConfig from '/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/argocd/\_example_events_webhook_config.mdx'
import ArgoCDEventManifest from '/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/argocd/\_example_events_manifest.mdx'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"


# ArgoCD

Port's ArgoCD integration allows you to model ArgoCD resources in your software catalog and ingest data into them.


## Overview

This integration allows you to:

- Map and organize your desired ArgoCD resources and their metadata in Port (see supported resources below).
- Watch for ArgoCD object changes (create/update/delete) in real-time, and automatically apply the changes to your software catalog.

### Supported Resources

The resources that can be ingested from ArgoCD into Port are listed below.
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`cluster`](https://cd.apps.argoproj.io/swagger-ui#operation/ClusterService_List)
- [`project`](https://cd.apps.argoproj.io/swagger-ui#operation/ProjectService_List)
- [`application`](https://cd.apps.argoproj.io/swagger-ui#operation/ApplicationService_List)
- [`deployment-history`](https://cd.apps.argoproj.io/swagger-ui#operation/ApplicationService_List) 
- [`kubernetes-resource`](https://cd.apps.argoproj.io/swagger-ui#operation/ApplicationService_List)
- [`managed-resource`](https://cd.apps.argoproj.io/swagger-ui#operation/ApplicationService_ManagedResources)

## Prerequisites

### Generate an ArgoCD token

1. Navigate to `<serverURL>/settings/accounts/<user>`. For example, if you access your ArgoCD at `https://localhost:8080`, you should navigate to `https://localhost:8080/settings/accounts/<user>`  

2. The user should have `apiKey` capabilities to allow generating authentication tokens for API access. If you don't have a user created yet, follow the guide on [how to create a new ArgoCD user](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#create-new-user)

3. Newly created users may have limited scope to resources by default. For that reason, You will need to configure the RBAC policy for the new user by following [this guide](https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/)

4. Ensure that the policy definition grants enough permission to `read` resources such as `applications`, `clusters`, `projects`, `repositories` etc.

5. Under **Tokens** on your ArgoCD UI, Click **Generate New** to create a new token for the user or use the CLI:

   ```bash
   argocd account generate-token --account <username>
   ```

6. Create an ArgoCD user with readonly permissions

    1. Create an `argocd-user.yaml` file with the below manifest to create a new user `port-ocean-user`

     <details>
   <summary><b> Create user manifest (click to expand) </b></summary>
   
   ```yaml showLineNumbers
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: argocd-cm
     namespace: argocd
     labels:
       app.kubernetes.io/name: argocd-cm
       app.kubernetes.io/part-of: argocd
   data:
     # add an additional local user with apiKey and login capabilities
     #   apiKey - allows generating API keys
     #   login - allows to login using UI
     accounts.port-ocean-user: apiKey, login
     accounts.port-ocean-user.enabled: "true"
   ```
   </details>

    2. Apply the manifest with `kubectl` to create the user:

     ```bash
     kubectl apply -f argocd-user.yaml
     ```

    3. Grant read only RBAC policy to the new user using the below manifest file (`argocd-rbac-cm.yaml`)

     <details>
   <summary><b> RBAC policy to grant readonly role to the new user (click to expand) </b></summary>
   
   ```yaml showLineNumbers
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: argocd-rbac-cm
     namespace: argocd
   data:
     policy.default: role:readonly
     policy.csv: |
       p, role:read-only-role, applications, *, */*, allow
       p, role:read-only-role, clusters, get, *, allow
       p, role:read-only-role, repositories, get, *, allow
       p, role:read-only-role, projects, get, *, allow
       p, role:read-only-role, logs, get, *, allow
   
       g, port-ocean-user, role:read-only-role
   ```
   </details>

    4. Apply the `argocd-rbac-cm.yaml` manifest with `kubectl`:

     ```bash
     kubectl apply -f argocd-rbac-cm.yaml
     ```

    5. Go to your ArgoCD UI to generate a new token for the user or use the CLI
     ```bash
     argocd account generate-token --account <username>
     ```


## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)" default>

Using this installation method means that the integration will be able to update Port in real time using webhooks.

<h2> Prerequisites </h2>

<Prerequisites/>


For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Argocd" />

<PortApiRegionTip/>
</TabItem>

<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-argocd-integration` in your git repository with the content:

:::note Variable Replacement 
Remember to replace the placeholders for `TOKEN` and `SERVER_URL`, which represents your ArgoCD API token and server url respectively.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-argocd-integration
  type: argocd
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    serverUrl: SERVER_URL
  secrets:
  // highlight-next-line
    token: TOKEN
```
<br/>

2. Install the `my-ocean-argocd-integration` ArgoCD Application by creating the following `my-ocean-argocd-integration.yaml` manifest:
:::note Variable Replacement 
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
  <summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-argocd-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-argocd-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.18
    helm:
      valueFiles:
      - $values/argocd/my-ocean-argocd-integration/values.yaml
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
kubectl apply -f my-ocean-argocd-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.
Note the parameters specific to this integration, they are last in the table.

| Parameter                              | Description                                                                                                                                                          | Required |
|----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                        | Your port client id                                                                                                                                                  | ✅        |
| `port.clientSecret`                    | Your port client secret                                                                                                                                              | ✅        |
| `port.baseUrl`                         | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                              | ✅        |
| `initializePortResources`              | Default true, When set to true the integration will create default blueprints and the port App config Mapping                                                        | ❌        |
| `sendRawDataExamples`                  | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                  | ❌        |
| `integration.identifier`               | Change the identifier to describe your integration                                                                                                                   | ✅        |
| `integration.type`                     | The integration type                                                                                                                                                 | ✅        |
| `integration.eventListener.type`       | The event listener type                                                                                                                                              | ✅        |
| `integration.secrets.token`            | The ArgoCD API token, docs can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_account_generate-token/)                          | ✅        |
| `integration.config.serverUrl`         | The ArgoCD server url                                                                                                                                                | ✅        |
| `integration.config.ignoreServerError` | Whether to ignore server errors when fetching data from ArgoCD. The default value is `false` meaning the integration will raise exceptions and fail the resync event | ❌        |
| `scheduledResyncInterval`              | The number of minutes between each resync                                                                                                                            | ❌        |


</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the ArgoCD integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using webhooks you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option
:::

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                                         | Description                                                                                                                                                          | Required |
|---------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `OCEAN__INTEGRATION__CONFIG__TOKEN`               | The ArgoCD API token                                                                                                                                                 | ✅        |
| `OCEAN__INTEGRATION__CONFIG__SERVER_URL`          | The ArgoCD server URL                                                                                                                                                | ✅        |
| `OCEAN__INTEGRATION__CONFIG__IGNORE_SERVER_ERROR` | Whether to ignore server errors when fetching data from ArgoCD. The default value is `false` meaning the integration will raise exceptions and fail the resync event | ❌        |
| `OCEAN__INITIALIZE_PORT_RESOURCES`                | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                                   | ❌        |
| `OCEAN__INTEGRATION__IDENTIFIER`                  | Change the identifier to describe your integration, if not set will use the default one                                                                              | ❌        |
| `OCEAN__PORT__CLIENT_ID`                          | Your port client id                                                                                                                                                  | ✅        |
| `OCEAN__PORT__CLIENT_SECRET`                      | Your port client secret                                                                                                                                              | ✅        |
| `OCEAN__PORT__BASE_URL`                           | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                              | ✅        |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                   | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                  | ❌        |

<br/>

Here is an example for `argocd-integration.yml` workflow file:

```yaml showLineNumbers
name: ArgoCD Exporter Workflow

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
          type: 'argocd'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__TOKEN }}
            server_url: ${{ OCEAN__INTEGRATION__CONFIG__SERVER_URL }}
            ignore_server_error: false
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">

:::tip
Your Jenkins agent should be able to run docker commands.
:::

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
of `Secret Text` type:

| Parameter                                | Description                                                                                                        | Required |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `OCEAN__INTEGRATION__CONFIG__TOKEN`      | The ArgoCD API token                                                                                               | ✅       |
| `OCEAN__INTEGRATION__CONFIG__SERVER_URL` | The ArgoCD server URL                                                                                              | ✅       |
| `OCEAN__INTEGRATION__CONFIG__IGNORE_SERVER_ERROR` |  Whether to ignore server errors when fetching data from ArgoCD. The default value is `false` meaning the integration will raise exceptions and fail the resync event    | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`       | Default true, When set to false the integration will not create default blueprints and the port App config Mapping | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`         | Change the identifier to describe your integration, if not set will use the default one                            | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                   | ❌       |
| `OCEAN__PORT__CLIENT_ID`                 | Your port client id                                                                                                | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`             | Your port client secret                                                                                            | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                        | ✅       |

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```text showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run ArgoCD Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__TOKEN'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__SERVER_URL', variable: 'OCEAN__INTEGRATION__CONFIG__SERVER_URL'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="argocd"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__TOKEN=$OCEAN__INTEGRATION__CONFIG__TOKEN \
                                -e OCEAN__INTEGRATION__CONFIG__SERVER_URL=$OCEAN__INTEGRATION__CONFIG__SERVER_URL \
                                -e OCEAN__INTEGRATION__CONFIG__IGNORE_SERVER_ERROR=false \
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
<TabItem value="gitlab" label="GitLab">

Make sure to [configure the following GitLab variables](https://docs.gitlab.com/ee/ci/variables/#for-a-project):


| Parameter                                         | Description                                                                                                                                                          | Required |
|---------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `OCEAN__INTEGRATION__CONFIG__TOKEN`               | The ArgoCD API token                                                                                                                                                 | ✅        |
| `OCEAN__INTEGRATION__CONFIG__SERVER_URL`          | The ArgoCD server URL                                                                                                                                                | ✅        |
| `OCEAN__INTEGRATION__CONFIG__IGNORE_SERVER_ERROR` | Whether to ignore server errors when fetching data from ArgoCD. The default value is `false` meaning the integration will raise exceptions and fail the resync event | ❌        |
| `OCEAN__INITIALIZE_PORT_RESOURCES`                | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                                   | ❌        |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                   | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                  | ❌        |
| `OCEAN__INTEGRATION__IDENTIFIER`                  | Change the identifier to describe your integration, if not set will use the default one                                                                              | ❌        |
| `OCEAN__PORT__CLIENT_ID`                          | Your port client id                                                                                                                                                  | ✅        |
| `OCEAN__PORT__CLIENT_SECRET`                      | Your port client secret                                                                                                                                              | ✅        |
| `OCEAN__PORT__BASE_URL`                           | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                              | ✅        |

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
  INTEGRATION_TYPE: argocd
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
        -e OCEAN__INTEGRATION__CONFIG__SERVER_URL=$OCEAN__INTEGRATION__CONFIG__SERVER_URL \
        -e OCEAN__INTEGRATION__CONFIG__IGNORE_SERVER_ERROR=false \
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
- kind: cluster
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .name
        title: .name
        blueprint: '"argocdCluster"'
        properties:
          applicationsCount: .info.applicationsCount
          serverVersion: .serverVersion
          labels: .labels
          updatedAt: .connectionState.attemptedAt
          server: .server
- kind: cluster
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .name + "-" + .item | tostring
        title: .name + "-" + .item
        blueprint: '"argocdNamespace"'
        relations:
          cluster: .name
    itemsToParse: .namespaces
- kind: project
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .metadata.name
        title: .metadata.name
        blueprint: '"argocdProject"'
        properties:
          createdAt: .metadata.creationTimestamp
          description: .spec.description
- kind: application
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .metadata.uid
        title: .metadata.name
        blueprint: '"argocdApplication"'
        properties:
          gitRepo: .spec.source.repoURL
          gitPath: .spec.source.path
          destinationServer: .spec.destination.server
          revision: .status.sync.revision
          targetRevision: .spec.source.targetRevision
          syncStatus: .status.sync.status
          healthStatus: .status.health.status
          createdAt: .metadata.creationTimestamp
          labels: .metadata.labels
          annotations: .metadata.annotations
        relations:
          project: .spec.project
          namespace: .metadata.namespace
          environment:
            combinator: '"and"'
            rules:
            - operator: '"="'
              property: '"argoCluster"'
              value: .spec.destination.server
          cluster:
            combinator: '"and"'
            rules:
            - operator: '"="'
              property: '"server"'
              value: .spec.destination.server
- kind: application
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .metadata.uid + "-" + (.item.id | tostring)
        title: .metadata.name + "-" + (.item.id | tostring)
        blueprint: '"argocdDeploymentHistory"'
        properties:
          deployedAt: .item.deployedAt
          deployStartedAt: .item.deployStartedAt
          revision: .item.source.repoURL + "/commit/" + .item.revision
          initiatedBy: .item.initiatedBy.username
          repoURL: .item.source.repoURL
          sourcePath: .item.source.path
        relations:
          application: .metadata.uid
          anotherRelation: .item.source.repoURL
    itemsToParse: .status.history // []
```

</details>




## Capabilities

### Configure real-time updates
Currently, the ArgoCD REST API lacks support for programmatic webhook creation. To set up a webhook configuration in ArgoCD for sending notifications to the Ocean integration, follow these steps:

1. Install ArgoCD notifications manifest;

```bash 
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/manifests/install.yaml
```

2. Install ArgoCD triggers and templates manifest;

```bash 
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/catalog/install.yaml
```

3. Use `kubectl` to connect to the Kubernetes cluster where your ArgoCD instance is deployed;

```bash 
kubectl config use-context <your-cluster-context>
```

4. Set the current namespace to your ArgoCD namespace, use the following command;

```bash 
kubectl config set-context --current --namespace=<your-namespace>
```

5. Create a YAML file (e.g. `argocd-webhook-config.yaml`) that configures the webhook notification service. The example below shows how to set up a webhook to send real-time events whenever ArgoCD applications are updated. The YAML file includes the following components:

   1. Notification service definition;
   2. Template for the webhook message body;
   3. Trigger definitions;
   4. Subscriptions to the notifications.

   Here's an example YAML. Make sure to replace `<WEBHOOK_URL>` with the actual URL of the ingress or service where the ocean integration will be deployed. By default, incoming webhook events are sent to `/integration/webhook` path in Ocean so do not replace the path parameter.

   <details>

   <summary>webhook manifest file </summary>

   ```yaml showLineNumbers
   apiVersion: v1
   kind: ConfigMap
   metadata:
   name: argocd-notifications-cm
   data:
   trigger.on-sync-operation-change: |
     - description: Application syncing has updated
     send:
     - app-status-change
     when: app.status.operationState.phase in ['Error', 'Failed', 'Succeeded', 'Running']
   trigger.on-deployed: |
     - description: Application is synced and healthy
     send:
     - app-status-change
     when: app.status.operationState.phase in ['Succeeded'] and app.status.health.status == 'Healthy'
   trigger.on-health-degraded: |
     - description: Application has degraded
     send:
     - app-status-change
     when: app.status.health.status == 'Degraded'
   service.webhook.port-ocean: |
     url: <WEBHOOK_URL>
     headers:
     - name: Content-Type
     value: application/json
   template.app-status-change: |
     webhook:
     port-ocean:
         method: POST
         path: /integration/webhook
         body: |
         {
             "action": "upsert",
             "application_name": "{{.app.metadata.name}}"
         }
   subscriptions: |
     - recipients:
     - port-ocean
     triggers:
     - on-deployed
     - on-health-degraded
     - on-sync-operation-change
   ```

   </details>

6. Use `kubectl` to apply the YAML file to your cluster. Run the following command, replacing `<your-namespace>` with your ArgoCD namespace and `<path-to-yaml-file>` with the actual path to your YAML file:

```bash
kubectl apply -n <your-namespace> -f <path-to-yaml-file>
```

This command deploys the webhook notification configuration to your ArgoCD notification configmap (`argocd-notifications-cm`), allowing Ocean to receive real-time events.


## Examples

To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

Examples of blueprints and the relevant integration configurations can be found on the argocd [examples page](example.md)

## Relevant Guides

For relevant guides and examples, see the [guides section](https://docs.port.io/guides?tags=ArgoCD).


## Alternative installation via webhook

While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from ArgoCD. If so, use the following instructions:

<details>
<summary><b>Webhook installation (click to expand)</b></summary>

In this example you are going to create a webhook integration between [ArgoCD](https://argo-cd.readthedocs.io/en/stable/) and Port, which will ingest application entities and map them to your ArgoCD projects.

<h2>Port configuration</h2>

Create the following blueprint definition:

<details>
<summary>Project blueprint</summary>

<ProjecttBlueprint/>

</details>

<details>
<summary>Application blueprint</summary>

<ApplicationBlueprint/>

</details>

Create the following webhook configuration [using Port UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>

<summary>Application webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `ArgoCD Application Mapper`;
   2. Identifier : `argocd_application_mapper`;
   3. Description : `A webhook configuration to map ArgoCD applications to Port`;
   4. Icon : `Argo`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <ArgoCDWebhookConfig/>

3. Click **Save** at the bottom of the page.

</details>

<h2>Create a webhook in ArgoCD</h2>

To set up a webhook configuration in ArgoCD for sending notifications to Port, follow these steps:

<h3>Prerequisite</h3>

1. You have access to a Kubernetes cluster where ArgoCD is deployed.
2. You have `kubectl` installed and configured to access your cluster.

<h3>Steps</h3>

1. Install ArgoCD notifications manifest;

```bash 
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/manifests/install.yaml
```

2. Install ArgoCD triggers and templates manifest;

```bash 
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/catalog/install.yaml
```

3. Use `kubectl` to connect to the Kubernetes cluster where your ArgoCD instance is deployed;

```bash 
kubectl config use-context <your-cluster-context>
```

4. Set the current namespace to your ArgoCD namespace, use the following command;

```bash 
kubectl config set-context --current --namespace=<your-namespace>
```

5. Create a YAML file (e.g. `argocd-webhook-config.yaml`) that configures the webhook notification service. The example below shows how to set up a webhook to send real-time events whenever ArgoCD applications are updated. The YAML file includes the following components:

   1. Notification service definition;
   2. Template for the webhook message body;
   3. Trigger definitions;
   4. Subscriptions to the notifications.

   Here's an example YAML. Make sure to replace `<YOUR_WEBHOOK_URL>` with the value of `url` key you received after creating the webhook configuration.

   <details>

   <summary>webhook manifest file </summary>

   ```yaml showLineNumbers
   apiVersion: v1
   kind: ConfigMap
   metadata:
   name: argocd-notifications-cm
   data:
   trigger.on-sync-operation-change: |
     - description: Application syncing has updated
     send:
     - app-status-change
     when: app.status.operationState.phase in ['Error', 'Failed', 'Succeeded', 'Running']
   trigger.on-deployed: |
     - description: Application is synced and healthy
     send:
     - app-status-change
     when: app.status.operationState.phase in ['Succeeded'] and app.status.health.status == 'Healthy'
   trigger.on-health-degraded: |
     - description: Application has degraded
     send:
     - app-status-change
     when: app.status.health.status == 'Degraded'
   service.webhook.port-webhook: |
     url: <YOUR_WEBHOOK_URL>
     headers:
     - name: Content-Type
     value: application/json
   template.app-status-change: |
     webhook:
     port-webhook:
         method: POST
         body: |
         {
             "uid": "{{.app.metadata.uid}}",
             "name": "{{.app.metadata.name}}",
             "namespace": "{{.app.metadata.namespace}}",
             "sync_status": "{{.app.status.sync.status}}",
             "health_status": "{{.app.status.health.status}}",
             "git_repo": "{{.app.spec.source.repoURL}}",
             "git_path": "{{.app.spec.source.path}}",
             "destination_server": "{{.app.spec.destination.server}}",
             "created_at": "{{.app.metadata.creationTimestamp}}",
             "project": "{{.app.spec.project}}"
         }
   subscriptions: |
     - recipients:
     - port-webhook
     triggers:
     - on-deployed
     - on-health-degraded
     - on-sync-operation-change
   ```

   </details>

6. Use `kubectl` to apply the YAML file to your cluster. Run the following command, replacing `<your-namespace>` with your ArgoCD namespace and `<path-to-yaml-file>` with the actual path to your YAML file:

```bash
kubectl apply -n <your-namespace> -f <path-to-yaml-file>
```

This command deploys the webhook notification configuration to your ArgoCD notification configmap (`argocd-notifications-cm`), allowing Port to receive real-time events.

Done! any change that happens to your applications in ArgoCD will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2>Argocd Events</h2>

In this example you are going to create a webhook integration between [ArgoCD](https://argo-cd.readthedocs.io/en/stable/) and Port, which will ingest all events entities and map them to your ArgoCD applications.

<h3>Port configuration</h3>

Create the following blueprint definition:

<details>
<summary>Events blueprint</summary>

<EventBlueprint/>

</details>

Create the following webhook configuration [using Port UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>

<summary>Application webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `ArgoCD Event Mapper`;
   2. Identifier : `argocd_event_mapper`;
   3. Description : `A webhook configuration to map ArgoCD events to Port`;
   4. Icon : `Argo`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <ArgoCDEventWebhookConfig/>

3. Click **Save** at the bottom of the page.

</details>

<h3> Create a webhook in ArgoCD </h3>

To set up a webhook configuration in ArgoCD for sending notifications to Port, follow these steps:

<h4> Prerequisite </h4>

1. You have access to a Kubernetes cluster where ArgoCD is deployed.
2. You have `kubectl` installed and configured to access your cluster.

<h4> Steps </h4>

1. Install ArgoCD notifications manifest;

```bash 
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/manifests/install.yaml
```

2. Install ArgoCD triggers and templates manifest;

```bash 
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/catalog/install.yaml
```

3. Use `kubectl` to connect to the Kubernetes cluster where your ArgoCD instance is deployed;

```bash 
kubectl config use-context <your-cluster-context>
```

4. Set the current namespace to your ArgoCD namespace, use the following command;

```bash 
kubectl config set-context --current --namespace=<your-namespace>
```

5. Create a YAML file (e.g. `argocd-events-config.yaml`) that configures the webhook notification service. The example below shows how to set up a webhook to send real-time events from ArgoCD. The YAML file includes the following components:

   1. Notification service definition;
   2. Template for the webhook message body;
   3. Trigger definitions;
   4. Subscriptions to the notifications.

   Here's an example YAML. Make sure to replace `<YOUR_WEBHOOK_URL>` with the value of `url` key you received after creating the webhook configuration.

   <details>

   <summary>event manifest file </summary>
   <ArgoCDEventManifest/>

   </details>

6. Use `kubectl` to apply the YAML file to your cluster. Run the following command, replacing `<your-namespace>` with your ArgoCD namespace and `<path-to-yaml-file>` with the actual path to your YAML file:

```bash
kubectl apply -n <your-namespace> -f <path-to-yaml-file>
```

This command deploys the webhook notification configuration to your ArgoCD notification configmap (`argocd-notifications-cm`), allowing Port to receive real-time events.

Done! any change that happens to your applications in ArgoCD will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

</details>


import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import ProjecttBlueprint from '/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/argocd/\_example_project_blueprint.mdx'
import ApplicationBlueprint from '/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/argocd/\_example_application_blueprint.mdx'
import EventBlueprint from '/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/argocd/\_example_event_blueprint.mdx'

import ArgoCDWebhookConfig from '/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/argocd/\_example_webhook_configuration.mdx'
import ArgoCDEventWebhookConfig from '/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/argocd/\_example_events_webhook_config.mdx'
import ArgoCDEventManifest from '/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/argocd/\_example_events_manifest.mdx'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# ArgoCD

Our ArgoCD integration allows you to import `cluster`, `project`, `application`, `deployment-history`, `kubernetes-resource` and `managed-resource` from your ArgoCD instance into Port, according to your mapping and definition.

## Common use cases

- Map your monitored Kubernetes resources in ArgoCD.
- Watch for object changes (create/update) in real-time, and automatically apply the changes to your entities in Port.

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                        | Description                                                                                                   | Required |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| `port.clientId`                  | Your port client id                                                                                           | ✅       |
| `port.clientSecret`              | Your port client secret                                                                                       | ✅       |
| `port.baseUrl`                | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                           | ✅       |
| `integration.identifier`         | Change the identifier to describe your integration                                                            | ✅       |
| `integration.type`               | The integration type                                                                                          | ✅       |
| `integration.eventListener.type` | The event listener type                                                                                       | ✅       |
| `integration.secrets.token`      | The ArgoCD API token token                                                                                    | ✅       |
| `integration.config.serverUrl`   | The ArgoCD server url                                                                                         | ✅       |
| `scheduledResyncInterval`        | The number of minutes between each resync                                                                     | ❌       |
| `initializePortResources`        | Default true, When set to true the integration will create default blueprints and the port App config Mapping | ❌       |
| `sendRawDataExamples`            | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true | ❌       |

<br/>

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-argocd-integration port-labs/port-ocean \
  --set port.clientId="CLIENT_ID"  \
  --set port.clientSecret="CLIENT_SECRET"  \
  --set port.baseUrl="https://api.getport.io"  \  
  --set initializePortResources=true  \
  --set sendRawDataExamples=true \
  --set scheduledResyncInterval=60  \
  --set integration.identifier="my-argocd-integration"  \
  --set integration.type="argocd"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.secrets.token="<your-token>"  \
  --set integration.config.serverUrl="<your-server-url>"
```

<PortApiRegionTip/>
</TabItem>

<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

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
          value: https://api.geport.io
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

</TabItem>

<TabItem value="one-time" label="Scheduled">
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the ArgoCD integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                                | Description                                                                                                        | Required |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `OCEAN__INTEGRATION__CONFIG__TOKEN`      | The ArgoCD API token                                                                                               | ✅       |
| `OCEAN__INTEGRATION__CONFIG__SERVER_URL` | The ArgoCD server URL                                                                                              | ✅       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`       | Default true, When set to false the integration will not create default blueprints and the port App config Mapping | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`         | Change the identifier to describe your integration, if not set will use the default one                            | ❌       |
| `OCEAN__PORT__CLIENT_ID`                 | Your port client id                                                                                                | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`             | Your port client secret                                                                                            | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                        | ✅       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                |  ❌       |

<br/>

Here is an example for `argocd-integration.yml` workflow file:

```yaml showLineNumbers
name: ArgoCD Exporter Workflow

# This workflow responsible for running ArgoCD exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

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
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the ArgoCD integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Jenkins agent should be able to run docker commands.
:::
:::warning
If you want the integration to update Port in real time using webhooks you should use
the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
of `Secret Text` type:

| Parameter                                | Description                                                                                                        | Required |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `OCEAN__INTEGRATION__CONFIG__TOKEN`      | The ArgoCD API token                                                                                               | ✅       |
| `OCEAN__INTEGRATION__CONFIG__SERVER_URL` | The ArgoCD server URL                                                                                              | ✅       |
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
This pipeline will run the ArgoCD integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Realtime updates in Port
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to [configure the following GitLab variables](https://docs.gitlab.com/ee/ci/variables/#for-a-project):


| Parameter                                | Description                                                                                                        | Required |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `OCEAN__INTEGRATION__CONFIG__TOKEN`      | The ArgoCD API token                                                                                               | ✅       |
| `OCEAN__INTEGRATION__CONFIG__SERVER_URL` | The ArgoCD server URL                                                                                              | ✅       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`       | Default true, When set to false the integration will not create default blueprints and the port App config Mapping | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true     | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`         | Change the identifier to describe your integration, if not set will use the default one                            | ❌       |
| `OCEAN__PORT__CLIENT_ID`                 | Your port client id                                                                                                | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`             | Your port client secret                                                                                            | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                         | ✅       |

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

### Generating ArgoCD token

1. Navigate to `<serverURL>/settings/accounts/<user>`. For example, if you access your ArgoCD at `https://localhost:8080`, you should navigate to `https://localhost:8080/settings/accounts/<user>`
2. The user should have `apiKey` capabilities to allow generating authentication tokens for API access. If you don't have a user created yet, follow the guide on [how to create a new ArgoCD user](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#create-new-user)
3. Newly created users may have limited scope to resources by default. For that reason, You will need to configure RBAC policy for the new user by following [this guide](https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/)
4. Ensure that the policy definition grants enough permission to `read` resources such as `applications`, `clusters`, `projects`, `repositories` etc.
5. Under **Tokens** on your ArgoCD UI, Click **Generate New** to create a new token for the user or use the CLI:

```bash
argocd account generate-token --account <username>
```

:::tip Creating ArgoCD user with readonly permissions

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
:::

## Ingesting ArgoCD objects

The ArgoCD integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `application` data from ArgoCD:

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: application
    selector:
      query: "true"
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
            namespace: .metadata.namespace
            syncStatus: .status.sync.status
            healthStatus: .status.health.status
            createdAt: .metadata.creationTimestamp
          relations:
            project: .spec.project
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from ArgoCD's API events.

### Configuration structure

The integration configuration determines which resources will be queried from ArgoCD, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from ArgoCD, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`cluster`](https://cd.apps.argoproj.io/swagger-ui#operation/ClusterService_List)
- [`project`](https://cd.apps.argoproj.io/swagger-ui#operation/ProjectService_List)
- [`application`](https://cd.apps.argoproj.io/swagger-ui#operation/ApplicationService_List)
- [`deployment-history`](https://cd.apps.argoproj.io/swagger-ui#operation/ApplicationService_List) - You can reference any valid property from the `.status.history` object of the ArgoCD application
- [`kubernetes-resource`](https://cd.apps.argoproj.io/swagger-ui#operation/ApplicationService_List) - You can reference any valid property from the `.status.resources` object of the ArgoCD application
- [`managed-resource`](https://cd.apps.argoproj.io/swagger-ui#operation/ApplicationService_ManagedResources)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: application
      selector:
      ...
  ```

- The `kind` key is a specifier for an ArgoCD object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: application
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: application
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-end
      port:
  ```

- The `port`, `entity` and the `mappings` keys are used to map the ArgoCD object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: application
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one ArgoCD object to a Port entity. Each value is a JQ query.
            identifier: .metadata.uid
            title: .metadata.name
            blueprint: '"argocdApplication"'
            properties:
              gitRepo: .spec.source.repoURL
              gitPath: .spec.source.path
              destinationServer: .spec.destination.server
              namespace: .metadata.namespace
              syncStatus: .status.sync.status
              healthStatus: .status.health.status
              createdAt: .metadata.creationTimestamp
            relations:
              project: .spec.project
        # highlight-end
    - kind: application # In this instance application is mapped again with a different filter
      selector:
        query: '.metadata.name == "MyApplicationName"'
      port:
        entity:
          mappings: ...
  ```

  :::tip Blueprint key
  Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

## Configuring real-time updates

Currently, the ArgoCD REST API lacks support for programmatic webhook creation. To set up a webhook configuration in ArgoCD for sending notifications to the Ocean integration, follow these steps:

### Prerequisite

1. You have access to a Kubernetes cluster where ArgoCD is deployed.
2. You have `kubectl` installed and configured to access your cluster.

### Steps

1. Install ArgoCD notifications manifest;

```bash showLineNumbers
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/manifests/install.yaml
```

2. Install ArgoCD triggers and templates manifest;

```bash showLineNumbers
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/catalog/install.yaml
```

3. Use `kubectl` to connect to the Kubernetes cluster where your ArgoCD instance is deployed;

```bash showLineNumbers
kubectl config use-context <your-cluster-context>
```

4. Set the current namespace to your ArgoCD namespace, use the following command;

```bash showLineNumbers
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

### Ingest data into Port

To ingest ArgoCD objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using ArgoCD.
3. Choose the **Ingest Data** option from the menu.
4. Select ArgoCD under the Kubernetes Stack providers category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Cluster

<details>
<summary>Cluster blueprint</summary>

```json showLineNumbers
  {
    "identifier": "argocdCluster",
    "description": "This blueprint represents an ArgoCD cluster",
    "title": "ArgoCD Cluster",
    "icon": "Argo",
    "schema": {
      "properties": {
        "applicationsCount": {
          "title": "Applications Count",
          "type": "number",
          "description": "The number of applications managed by Argo CD on the cluster",
          "icon": "DefaultProperty"
        },
        "serverVersion": {
          "title": "Server Version",
          "type": "string",
          "description": "Contains information about the Kubernetes version of the cluster",
          "icon": "DefaultProperty"
        },
        "labels": {
          "title": "Labels",
          "type": "object",
          "description": "Contains information about cluster metadata",
          "icon": "DefaultProperty"
        },
        "updatedAt": {
          "icon": "DefaultProperty",
          "title": "Updated At",
          "type": "string",
          "format": "date-time"
        },
        "server": {
          "title": "Server",
          "description": "The API server URL of the Kubernetes cluster",
          "type": "string",
          "icon": "DefaultProperty"
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
  - kind: cluster
    selector:
      query: "true"
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
```

</details>

### Namespace

<details>
<summary>Namespace blueprint</summary>

```json showLineNumbers
  {
    "identifier": "argocdNamespace",
    "description": "This blueprint represents an ArgoCD namespace",
    "title": "ArgoCD Namespace",
    "icon": "Argo",
    "schema": {
      "properties": {},
      "required": []
    },
    "aggregationProperties": {},
    "mirrorProperties": {},
    "calculationProperties": {},
    "relations": {
      "cluster": {
        "title": "ArgoCD Cluster",
        "target": "argocdCluster",
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
  - kind: cluster
    selector:
      query: "true"
    port:
      itemsToParse: .namespaces
      entity:
        mappings:
          identifier: .name + "-" + .item | tostring
          title: .name + "-" + .item
          blueprint: '"argocdNamespace"'
          properties: {}
          relations:
            cluster: .name
```

</details>

### Project

<details>
<summary> Project blueprint</summary>

```json showlineNumbers
  {
    "identifier": "argocdProject",
    "description": "This blueprint represents an ArgoCD Project",
    "title": "ArgoCD Project",
    "icon": "Argo",
    "schema": {
      "properties": {
        "createdAt": {
          "title": "Created At",
          "type": "string",
          "format": "date-time",
          "icon": "DefaultProperty"
        },
        "description": {
          "title": "Description",
          "description": "Project description",
          "type": "string",
          "icon": "DefaultProperty"
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
  - kind: project
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .metadata.name
          title: .metadata.name
          blueprint: '"argocdProject"'
          properties:
            createdAt: .metadata.creationTimestamp
            description: .spec.description
```

</details>

### Application

<details>
<summary> Application blueprint</summary>

```json showlineNumbers
  {
    "identifier": "argocdApplication",
    "description": "This blueprint represents an ArgoCD Application",
    "title": "Running Service",
    "icon": "Argo",
    "schema": {
      "properties": {
        "gitRepo": {
          "type": "string",
          "icon": "Git",
          "title": "Repository URL",
          "description": "The URL of the Git repository containing the application source code"
        },
        "gitPath": {
          "type": "string",
          "title": "Path",
          "description": "The path within the Git repository where the application manifests are located"
        },
        "destinationServer": {
          "type": "string",
          "title": "Destination Server",
          "description": "The URL of the target cluster's Kubernetes control plane API"
        },
        "revision": {
          "type": "string",
          "title": "Revision",
          "description": "Revision contains information about the revision the comparison has been performed to"
        },
        "targetRevision": {
          "type": "string",
          "title": "Target Revision",
          "description": "Target Revision defines the revision of the source to sync the application to. In case of Git, this can be commit, tag, or branch"
        },
        "syncStatus": {
          "type": "string",
          "title": "Sync Status",
          "enum": [
            "Synced",
            "OutOfSync",
            "Unknown"
          ],
          "enumColors": {
            "Synced": "green",
            "OutOfSync": "red",
            "Unknown": "lightGray"
          },
          "description": "Status is the sync state of the comparison"
        },
        "healthStatus": {
          "type": "string",
          "title": "Health Status",
          "enum": [
            "Healthy",
            "Missing",
            "Suspended",
            "Degraded",
            "Progressing",
            "Unknown"
          ],
          "enumColors": {
            "Healthy": "green",
            "Missing": "yellow",
            "Suspended": "purple",
            "Degraded": "red",
            "Progressing": "blue",
            "Unknown": "lightGray"
          },
          "description": "Status holds the status code of the application or resource"
        },
        "createdAt": {
          "title": "Created At",
          "type": "string",
          "format": "date-time",
          "description": "The created timestamp of the application"
        },
        "labels": {
          "type": "object",
          "title": "Labels",
          "description": "Map of string keys and values that can be used to organize and categorize object"
        },
        "annotations": {
          "type": "object",
          "title": "Annotations",
          "description": "Annotations are unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata"
        }
      },
      "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "relations": {
      "project": {
        "title": "ArgoCD Project",
        "target": "argocdProject",
        "required": false,
        "many": false
      },
      "cluster": {
        "title": "ArgoCD Cluster",
        "target": "argocdCluster",
        "required": false,
        "many": false
      },
      "namespace": {
        "title": "ArgoCD Namespace",
        "target": "argocdNamespace",
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
  - kind: application
    selector:
      query: "true"
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
            cluster: .spec.destination.name
```

</details>

### Deployment history

<details>
<summary> Deployment history blueprint</summary>

```json showlineNumbers
  {
    "identifier": "argocdDeploymentHistory",
    "description": "This blueprint represents an ArgoCD deployment history",
    "title": "ArgoCD Deployment History",
    "icon": "Argo",
    "schema": {
      "properties": {
        "deployedAt": {
          "title": "Deployed At",
          "type": "string",
          "format": "date-time"
        },
        "deployStartedAt": {
          "title": "Deploy Started At",
          "type": "string",
          "format": "date-time"
        },
        "revision": {
          "title": "Revision",
          "type": "string"
        },
        "initiatedBy": {
          "title": "Initiated By",
          "type": "string"
        },
        "repoURL": {
          "title": "Repository URL",
          "type": "string"
        },
        "sourcePath": {
          "title": "Source Path",
          "type": "string"
        }
      },
      "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
      "application": {
        "title": "Application",
        "target": "argocdApplication",
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
  - kind: application
    selector:
      query: "true"
    port:
      itemsToParse: .status.history
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
```

</details>

### Kubernetes Resource

<details>
<summary> Images blueprint</summary>

```json showlineNumbers
 {
    "identifier": "image",
    "description": "This blueprint represents an image",
    "title": "Image",
    "icon": "AWS",
    "schema": {
      "properties": {},
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
<summary> Kubernetes resource blueprint</summary>

```json showlineNumbers
  {
    "identifier": "argocdKubernetesResource",
    "description": "This blueprint represents an ArgoCD kubernetes resource",
    "title": "Kubernetes Resource",
    "icon": "Argo",
    "schema": {
      "properties": {
        "kind": {
          "title": "Kind",
          "type": "string"
        },
        "version": {
          "title": "Version",
          "type": "string"
        },
        "namespace": {
          "title": "Namespace",
          "type": "string"
        },
        "labels": {
          "type": "object",
          "title": "Labels"
        },
        "annotations": {
          "type": "object",
          "title": "Annotations"
        }
      },
      "required": []
    },
    "mirrorProperties": {
      "healthStatus": {
        "title": "Health Status",
        "path": "application.healthStatus"
      },
      "syncStatus": {
        "title": "Sync Status",
        "path": "application.syncStatus"
      }
    },
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
      "application": {
        "title": "Application",
        "target": "argocdApplication",
        "required": false,
        "many": false
      },
      "image": {
        "title": "Image",
        "target": "image",
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
  - kind: managed-resource
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .__application.metadata.uid + "-" + .kind + "-" + .name
          title: .__application.metadata.name + "-" + .kind + "-" + .name
          blueprint: '"argocdKubernetesResource"'
          properties:
            kind: .kind
            namespace: .namespace
            version: .resourceVersion
            annotations: .liveState | fromjson | .metadata.annotations
            labels: .liveState | fromjson | .metadata.labels
          relations:
            application: .__application.metadata.uid
            image: 'if .kind == "Deployment" then .liveState | fromjson | .spec.template.spec.containers[0].image else null end'
```
</details>


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

```bash showLineNumbers
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/manifests/install.yaml
```

2. Install ArgoCD triggers and templates manifest;

```bash showLineNumbers
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/catalog/install.yaml
```

3. Use `kubectl` to connect to the Kubernetes cluster where your ArgoCD instance is deployed;

```bash showLineNumbers
kubectl config use-context <your-cluster-context>
```

4. Set the current namespace to your ArgoCD namespace, use the following command;

```bash showLineNumbers
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

```bash showLineNumbers
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/manifests/install.yaml
```

2. Install ArgoCD triggers and templates manifest;

```bash showLineNumbers
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/catalog/install.yaml
```

3. Use `kubectl` to connect to the Kubernetes cluster where your ArgoCD instance is deployed;

```bash showLineNumbers
kubectl config use-context <your-cluster-context>
```

4. Set the current namespace to your ArgoCD namespace, use the following command;

```bash showLineNumbers
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

More relevant guides and examples:

- [Rollback ArgoCD deployment](/actions-and-automations/setup-backend/github-workflow/examples/argocd/rollback-argocd-deployment)
- [Self-service action to synchronize ArgoCD application](/actions-and-automations/setup-backend/github-workflow/examples/argocd/sync-argocd-app)
---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_azure_premise.mdx"
import HelmParameters from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean-advanced-parameters-helm.mdx"
import DockerParameters from "/docs/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/bitbucket-server/_resources/_bitbucket_cloud_one_time_docker_parameters.mdx"
import AdvancedConfig from '/docs/generalTemplates/\_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "./\_templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"
import BitbucketProjectBlueprint from "/docs/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/bitbucket-server/_resources/\_example_bitbucket_project_blueprint.mdx";
import BitbucketUserBlueprint from "/docs/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/bitbucket-server/_resources/\_example_bitbucket_user_blueprint.mdx";
import BitbucketPullrequestBlueprint from "/docs/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/bitbucket-server/_resources/\_example_bitbucket_pull_request_blueprint.mdx";
import BitbucketRepositoryBlueprint from "/docs/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/bitbucket-server/_resources/\_example_bitbucket_repository_blueprint.mdx";
import BitbucketWebhookConfiguration from "/docs/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/bitbucket-server/_resources/\_example_bitbucket_webhook_config.mdx";
import BitbucketServerPythonScript from "/docs/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/bitbucket-server/_resources/\_example_bitbucket_python_script.mdx";

# Bitbucket (self-hosted)

Port's Bitbucket (Self-Hosted) integration allows you to model Bitbucket Server / Bitbucket Data Center resources in your software catalog and ingest data into them.

**Note:** While Bitbucket Server has been [deprecated and replaced by Bitbucket Data Center](https://www.atlassian.com/blog/announcements/journey-to-cloud), they expose the same set of APIs and this integration covers both.

:::info Bitbucket Self-Hosted
This documentation covers Port's integration with **Bitbucket (Self-Hosted)**. 
For information about integrating with Bitbucket Cloud, please refer to the [Bitbucket Cloud integration documentation](/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/bitbucket-cloud/bitbucket-cloud.md).
:::


## Overview
This integration allows you to:

- Map and organize your desired Bitbucket resources and their metadata in Port (see supported resources below).
- Watch for Bitbucket object changes (create/update/delete) in real-time, and automatically apply the changes to your software catalog.

### Supported resources

The resources that can be ingested from Bitbucket (Self-Hosted) into Port are listed below.  
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [Project](https://developer.atlassian.com/server/bitbucket/rest/v906/api-group-project/#api-api-latest-projects-get)
- [Repository](https://developer.atlassian.com/server/bitbucket/rest/v906/api-group-project/#api-api-latest-projects-projectkey-repos-get)
- [Pull Request](https://developer.atlassian.com/server/bitbucket/rest/v906/api-group-pull-requests/#api-api-latest-projects-projectkey-repos-repositoryslug-pull-requests-get)
- [User](https://developer.atlassian.com/server/bitbucket/rest/v906/api-group-permission-management/#api-api-latest-admin-users-get)


## Setup


Choose one of the following installation methods:  
Not sure which method is right for your use case? See the installation methods](/build-your-software-catalog/sync-data-to-catalog/#installation-methods) documentation for guidance.

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation integration="BitbucketServer"/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-Time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2> Prerequisites </h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Bitbucket Self-Hosted" webhookSecret="integration.secrets.bitbucketWebhookSecret" />

<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-bitbucket-server-integration` in your git repository with the content:

:::note
Remember to replace the placeholder for `BITBUCKET_USERNAME`, `BITBUCKET_PASSWORD`, `BITBUCKET_BASE_URL`, `BITBUCKET_WEBHOOK_SECRET`, `BITBUCKET_IS_VERSION_8_POINT_7_OR_OLDER`.
:::

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-bitbucket-server-integration
  type: bitbucket-server
  eventListener:
    type: POLLING
  config:
  // highlight-start
    bitbucketBaseUrl: BITBUCKET_BASE_URL
    bitbucketUsername: BITBUCKET_USERNAME
    bitbucketIsVersion8Point7OrOlder: BITBUCKET_IS_VERSION_8_POINT_7_OR_OLDER
  // highlight-end
  secrets:
  // highlight-start
    bitbucketPassword: BITBUCKET_PASSWORD
    bitbucketWebhookSecret: BITBUCKET_WEBHOOK_SECRET
  // highlight-end
```

<br/>

1. Install the `my-ocean-bitbucket-server-integration` ArgoCD Application by creating the following `my-ocean-bitbucket-server-integration.yaml` manifest:

:::note Replace placeholders

Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.  
Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).

:::

<details>
  <summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-bitbucket-server-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-bitbucket-server-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.9.5
    helm:
      valueFiles:
      - $values/argocd/my-ocean-bitbucket-server-integration/values.yaml
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
kubectl apply -f my-ocean-bitbucket-server-integration.yaml
```

</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                        | Description                                                                                                                         | Required |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                  | Your port client id                                                                                                                 | ✅        |
| `port.clientSecret`              | Your port client secret                                                                                                             | ✅        |
| `port.baseUrl`                   | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                             | ✅        |
| `integration.identifier`         | Change the identifier to describe your integration                                                                                  | ✅        |
| `integration.type`               | The integration type                                                                                                                | ✅        |
| `integration.eventListener.type` | The event listener type                                                                                                             | ✅        |
| `integration.config.bitbucketUsername` | Bitbucket username |                                  | ✅        |
| `integration.secrets.bitbucketPassword` | Bitbucket password |                                  | ✅        |
| `integration.secrets.bitbucketWebhookSecret` | Bitbucket webhook secret used to verify the webhook request |                       | ❌        |
| `integration.config.bitbucketBaseUrl` | Bitbucket base url| ✅        |
| `integration.config.bitbucketIsVersion8Point7OrOlder` | Bitbucket is version 8.7 or older | ❌        |
| `scheduledResyncInterval`        | The number of minutes between each resync                                                                                           | ❌        |
| `initializePortResources`        | Default true, When set to true the integration will create default blueprints and the port App config Mapping                       | ❌        |
| `sendRawDataExamples`            | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true | ❌        |
| `liveEvents.baseUrl`                       | The base url of the instance where the Bitbucket (Self-Hosted) integration is hosted, used for real-time updates. (e.g.`https://mybitbucket-self-hosted-ocean-integration.com`)                 | ❌        |


**Note:** You should set the `integration.config.bitbucketIsVersion8Point7OrOlder` parameter to `true` if you are using Bitbucket (Self-Hosted) version 8.7 or older. This is because webhook events are setup differently in Bitbucket (Self-Hosted) 8.7 and above.


<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the Bitbucket (Self-Hosted) integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using webhooks you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option.
:::

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                   | Description                                                                                                                                                                                                                                                                              | Example | Required |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|----------|
| `port_client_id`            | Your Port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) id                                                                                                                               |         | ✅        |
| `port_client_secret`        | Your Port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret                                                                                                                           |         | ✅        |
| `port_base_url`             | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                  |         | ✅        |
| `config -> bitbucket_username`  | Bitbucket username |         | ✅        |
| `config -> bitbucket_password`  | Bitbucket password |         | ✅        |
| `config -> bitbucket_base_url`  | Bitbucket base url |         | ✅        |
| `config -> bitbucket_webhook_secret`  | Bitbucket webhook secret used to verify the webhook request |         | ❌        |
| `config -> bitbucket_is_version_8_point_7_or_older`  | Bitbucket is version 8.7 or older |         | ❌        |
| `initialize_port_resources` | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources) |         | ❌        |
| `identifier`                | The identifier of the integration that will be installed                                                                                                                                                                                                                                 |         | ❌        |
| `version`                   | The version of the integration that will be installed                                                                                                                                                                                                                                    | latest  | ❌        |`
| `sendRawDataExamples`       | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                      | true    |          | ❌       |
| `liveEvents.baseUrl`               | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Bitbucket (Self-Hosted)                                                                                                                                                                          | https://my-ocean-integration.com | ❌        |
<br/>

:::tip Ocean Sail Github Action
The following example uses the **Ocean Sail** Github Action to run the Bitbucket (Self-Hosted) integration.
For further information about the action, please visit the [Ocean Sail Github Action](https://github.com/marketplace/actions/ocean-sail)
:::

<br/>

Here is an example for `bitbucket-server-integration.yml` workflow file:

```yaml showLineNumbers
name: Bitbucket (Self-Hosted) Exporter Workflow

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
          type: 'bitbucket-server'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            bitbucket_username: ${{ secrets.OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME }}
            bitbucket_password: ${{ secrets.OCEAN__INTEGRATION__CONFIG__BITBUCKET_PASSWORD }}
            bitbucket_base_url: ${{ secrets.OCEAN__INTEGRATION__CONFIG__BITBUCKET_BASE_URL }}
            bitbucket_webhook_secret: ${{ secrets.OCEAN__INTEGRATION__CONFIG__BITBUCKET_WEBHOOK_SECRET }}
            bitbucket_is_version_8_point_7_or_older: ${{ secrets.OCEAN__INTEGRATION__CONFIG__BITBUCKET_IS_VERSION_8_POINT_7_OR_OLDER }}
```

**Note:** You should set the `bitbucket_is_version_8_point_7_or_older` parameter to `true` if you are using Bitbucket (Self-Hosted) version 8.7 or older. This is because webhook events are setup differently in Bitbucket (Self-Hosted) 8.7 and above.

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">

:::tip Tip for Jenkins agent
Your Jenkins agent should be able to run docker commands.
:::


Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/) of `Secret Text` type:

<DockerParameters/>

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Bitbucket Self-Hosted Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME', variable: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_PASSWORD', variable: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_PASSWORD'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_BASE_URL', variable: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_BASE_URL'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_WEBHOOK_SECRET', variable: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_WEBHOOK_SECRET'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_IS_VERSION_8_POINT_7_OR_OLDER', variable: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_IS_VERSION_8_POINT_7_OR_OLDER'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="bitbucket-server"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME \
                                -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_PASSWORD=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_PASSWORD \
                                -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_BASE_URL=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_BASE_URL \
                                -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_WEBHOOK_SECRET=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_WEBHOOK_SECRET \
                                -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_IS_VERSION_8_POINT_7_OR_OLDER=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_IS_VERSION_8_POINT_7_OR_OLDER \
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

**Note:** You should set the `OCEAN__INTEGRATION__CONFIG__BITBUCKET_IS_VERSION_8_POINT_7_OR_OLDER` parameter to `true` if you are using Bitbucket (Self-Hosted) version 8.7 or older. This is because webhook events are setup differently in Bitbucket (Self-Hosted) 8.7 and above.

  </TabItem>
  <TabItem value="azure" label="Azure Devops">
<AzurePremise />

<DockerParameters />

<br/>

Here is an example for `bitbucket-server-integration.yml` pipeline file:

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
      integration_type="bitbucket-server"
      version="latest"

      image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

      docker run -i --rm \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME=$(OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME) \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_PASSWORD=$(OCEAN__INTEGRATION__CONFIG__BITBUCKET_PASSWORD) \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_BASE_URL=$(OCEAN__INTEGRATION__CONFIG__BITBUCKET_BASE_URL) \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_WEBHOOK_SECRET=$(OCEAN__INTEGRATION__CONFIG__BITBUCKET_WEBHOOK_SECRET) \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_IS_VERSION_8_POINT_7_OR_OLDER=$(OCEAN__INTEGRATION__CONFIG__BITBUCKET_IS_VERSION_8_POINT_7_OR_OLDER) \
        -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
        -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $image_name

      exit $?
    displayName: "Ingest Data into Port"
```

**Note:** You should set the `OCEAN__INTEGRATION__CONFIG__BITBUCKET_IS_VERSION_8_POINT_7_OR_OLDER` parameter to `true` if you are using Bitbucket (Self-Hosted) version 8.7 or older. This is because webhook events are setup differently in Bitbucket (Self-Hosted) 8.7 and above.

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
  INTEGRATION_TYPE: bitbucket-server
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
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_PASSWORD=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_PASSWORD \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_BASE_URL=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_BASE_URL \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_WEBHOOK_SECRET=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_WEBHOOK_SECRET \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_IS_VERSION_8_POINT_7_OR_OLDER=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_IS_VERSION_8_POINT_7_OR_OLDER \
        -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
        -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $IMAGE_NAME

  rules: # Run only when changes are made to the main branch
    - if: '$CI_COMMIT_BRANCH == "main"'
```

**Note:** You should set the `OCEAN__INTEGRATION__CONFIG__BITBUCKET_IS_VERSION_8_POINT_7_OR_OLDER` parameter to `true` if you are using Bitbucket (Self-Hosted) version 8.7 or older. This is because webhook events are setup differently in Bitbucket (Self-Hosted) 8.7 and above.

</TabItem>

  </Tabs>

  <PortApiRegionTip/>

  <AdvancedConfig/>

</TabItem>



</Tabs>



## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.



## Examples

To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

Additional examples of blueprints and the relevant integration configurations:

### Project

<details>
<summary>Project blueprint</summary>

```json showLineNumbers
{
    "identifier": "bitbucketProject",
    "description": "A software catalog to represent Bitbucket project",
    "title": "Bitbucket Project",
    "icon": "BitBucket",
    "schema": {
        "properties": {
            "public": {
                "icon": "DefaultProperty",
                "title": "Public",
                "type": "boolean"
            },
            "description": {
                "title": "Description",
                "type": "string",
                "icon": "DefaultProperty"
            },
            "type": {
                "icon": "DefaultProperty",
                "title": "Type",
                "type": "string"
            },
            "link": {
                "title": "Link",
                "icon": "DefaultProperty",
                "type": "string"
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
          identifier: .key
          title: .name
          blueprint: '"bitbucketProject"'
          properties:
            public: .public
            type: .type
            description: .description
            link: .links.self[0].href
```

</details>

### Repository

<details>
<summary>Repository blueprint</summary>

```json showLineNumbers
{
    "identifier": "bitbucketRepository",
    "description": "A software catalog to represent Bitbucket repositories",
    "title": "Bitbucket Repository",
    "icon": "BitBucket",
    "schema": {
        "properties": {
            "forkable": {
                "icon": "DefaultProperty",
                "title": "Is Forkable",
                "type": "boolean"
            },
            "description": {
                "title": "Description",
                "type": "string",
                "icon": "DefaultProperty"
            },
            "public": {
                "icon": "DefaultProperty",
                "title": "Is Public",
                "type": "boolean"
            },
            "state": {
                "icon": "DefaultProperty",
                "title": "State",
                "type": "string"
            },
            "link": {
                "title": "Link",
                "icon": "DefaultProperty",
                "type": "string"
            },
            "documentation": {
                "icon": "DefaultProperty",
                "title": "Documentation",
                "type": "string",
                "format": "markdown"
            },
            "swagger_url": {
                "title": "Swagger URL",
                "type": "string",
                "format": "url",
                "spec": "async-api",
                "icon": "DefaultProperty"
            },
            "readme": {
                "title": "Readme",
                "type": "string",
                "format": "markdown",
                "icon": "DefaultProperty"
            }
        },
        "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
        "latestCommitAuthor": {
            "title": "Latest Commit By",
            "description": "The user that made the most recent commit to the base branch",
            "target": "bitbucketUser",
            "required": false,
            "many": false
        },
        "project": {
            "title": "Project",
            "target": "bitbucketProject",
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
  - kind: repository
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .slug
          title: .name
          blueprint: '"bitbucketRepository"'
          properties:
            description: .description
            state: .state
            forkable: .forkable
            public: .public
            link: .links.self[0].href
            documentation: .__readme
          relations:
            project: .project.key
            latestCommitAuthor: .__latestCommit.author.emailAddress
```

</details>

### Pull Request

<details>
<summary>Pull Request blueprint</summary>

```json showLineNumbers
{
    "identifier": "bitbucketPullRequest",
    "description": "A software catalog to represent Bitbucket pull requests",
    "title": "Bitbucket Pull Request",
    "icon": "BitBucket",
    "schema": {
        "properties": {
            "created_on": {
                "title": "Created On",
                "type": "string",
                "format": "date-time",
                "icon": "DefaultProperty"
            },
            "updated_on": {
                "title": "Updated On",
                "type": "string",
                "format": "date-time",
                "icon": "DefaultProperty"
            },
            "description": {
                "title": "Description",
                "type": "string",
                "icon": "DefaultProperty"
            },
            "state": {
                "icon": "DefaultProperty",
                "title": "State",
                "type": "string",
                "enum": [
                    "OPEN",
                    "MERGED",
                    "DECLINED",
                    "SUPERSEDED"
                ],
                "enumColors": {
                    "OPEN": "yellow",
                    "MERGED": "green",
                    "DECLINED": "red",
                    "SUPERSEDED": "purple"
                }
            },
            "owner": {
                "title": "Owner",
                "type": "string",
                "icon": "DefaultProperty"
            },
            "link": {
                "title": "Link",
                "icon": "DefaultProperty",
                "type": "string"
            },
            "destination": {
                "title": "Destination Branch",
                "type": "string",
                "icon": "DefaultProperty"
            },
            "source": {
                "title": "Source Branch",
                "type": "string",
                "icon": "DefaultProperty"
            },
            "reviewers": {
                "items": {
                    "type": "string"
                },
                "title": "Reviewers",
                "type": "array",
                "icon": "DefaultProperty"
            },
            "merge_commit": {
                "title": "Merge Commit",
                "type": "string",
                "icon": "DefaultProperty"
            },
            "mergedAt": {
                "title": "Merged At",
                "type": "string",
                "format": "date-time",
                "icon": "DefaultProperty"
            }
        },
        "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
        "participants": {
            "title": "Participants",
            "description": "Users that contributed to the PR",
            "target": "bitbucketUser",
            "required": false,
            "many": true
        },
        "repository": {
            "title": "Repository",
            "target": "bitbucketRepository",
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
  - kind: pull-request
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .title
          blueprint: '"bitbucketPullRequest"'
          properties:
            created_on: .createdDate | (tonumber / 1000 | strftime("%Y-%m-%dT%H:%M:%SZ"))
            updated_on: .updatedDate | (tonumber / 1000 | strftime("%Y-%m-%dT%H:%M:%SZ"))
            merge_commit: .fromRef.latestCommit
            state: .state
            owner: .author.user.emailAddress
            link: .links.self[0].href
            destination: .toRef.displayId
            source: .fromRef.displayId
            mergedAt: .closedDate as $d | if $d == null then null else ($d / 1000 | strftime("%Y-%m-%dT%H:%M:%SZ")) end
            reviewers: "[.reviewers[].user.emailAddress]"
          relations:
            repository: .toRef.repository.slug
            participants: "[.participants[].user.emailAddress]"
```

</details>

### User

<details>
<summary>User blueprint</summary>

```json showLineNumbers
{
    "identifier": "bitbucketUser",
    "description": "A software catalog to represent Bitbucket users",
    "title": "Bitbucket User",
    "icon": "BitBucket",
    "schema": {
        "properties": {
            "username": {
                "type": "string",
                "title": "Username",
                "description": "The username of the user"
            },
            "url": {
                "title": "URL",
                "description": "The link to the user profile",
                "icon": "BitBucket",
                "type": "string"
            },
            "portUser": {
                "title": "Port User",
                "type": "string",
                "icon": "DefaultProperty",
                "format": "user"
            }
        },
        "required": [
            "username"
        ]
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
  - kind: user
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .emailAddress
          title: .displayName
          blueprint: '"bitbucketUser"'
          properties:
            username: .name
            url: .links.self[0].href
            portUser: .emailAddress
```

</details>


## Let's test it

This section includes sample response data from Bitbucket (Self-Hosted). In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Bitbucket (Self-Hosted):

<details>
<summary> Project response data</summary>

```json showLineNumbers
{
  "key": "PROJ",
  "id": 1,
  "name": "Project",
  "public": false,
  "type": "NORMAL",
  "links": {
    "self": [
      {
        "href": "http://localhost:7990/projects/PROJ"
      }
    ]
  }
}
```

</details>

<details>
<summary> Repository response data</summary>

```json showLineNumbers
{
  "slug": "repostiroy-3",
  "id": 3,
  "name": "Repostiroy-3",
  "hierarchyId": "0a8dadb07bb606236d8c",
  "scmId": "git",
  "state": "AVAILABLE",
  "statusMessage": "Available",
  "forkable": true,
  "project": {
    "key": "PRO3",
    "id": 3,
    "name": "Project Three",
    "public": false,
    "type": "NORMAL",
    "links": {
      "self": [
        {
          "href": "http://localhost:7990/projects/PRO3"
        }
      ]
    }
  },
  "public": false,
  "archived": false,
  "links": {
    "clone": [
      {
        "href": "ssh://git@localhost:7999/pro3/repostiroy-3.git",
        "name": "ssh"
      },
      {
        "href": "http://localhost:7990/scm/pro3/repostiroy-3.git",
        "name": "http"
      }
    ],
    "self": [
      {
        "href": "http://localhost:7990/projects/PRO3/repos/repostiroy-3/browse"
      }
    ]
  },
  "__readme": "",
  "__latestCommit": {
    "id": "965068d1461f119139bb6be582bb22a555a195ba",
    "displayId": "965068d1461",
    "author": {
      "name": "[REDACTED]",
      "emailAddress": "admin@gmail.com",
      "active": true,
      "displayName": "Admin",
      "id": 3,
      "slug": "[REDACTED]",
      "type": "NORMAL",
      "links": {
        "self": [
          {
            "href": "http://localhost:7990/users/[REDACTED]"
          }
        ]
      }
    },
    "authorTimestamp": 1747744649000,
    "committer": {
      "name": "[REDACTED]",
      "emailAddress": "admin@gmail.com",
      "active": true,
      "displayName": "Admin",
      "id": 3,
      "slug": "[REDACTED]",
      "type": "NORMAL",
      "links": {
        "self": [
          {
            "href": "http://localhost:7990/users/[REDACTED]"
          }
        ]
      }
    },
    "committerTimestamp": 1747744649000,
    "message": "Pull request #1: readme.md edited online with Bitbucket\n\nMerge in PRO3/repostiroy-3 from main to master\n\n* commit '3e4df0573a0ba1845ebdfa919c907745497313aa':\n  readme.md edited online with Bitbucket",
    "parents": [
      {
        "id": "9534663d88977c0aa5c25249986eae851fd83a8d",
        "displayId": "9534663d889"
      },
      {
        "id": "3e4df0573a0ba1845ebdfa919c907745497313aa",
        "displayId": "3e4df0573a0"
      }
    ]
  }
}
```

</details>

<details>
<summary>Pull Request response data</summary>

```json showLineNumbers
{
  "id": 1,
  "version": 1,
  "title": "readme.md edited online with Bitbucket",
  "state": "OPEN",
  "open": true,
  "closed": false,
  "draft": false,
  "createdDate": 1747730324792,
  "updatedDate": 1747730324792,
  "fromRef": {
    "id": "refs/heads/main",
    "displayId": "main",
    "latestCommit": "3e4df0573a0ba1845ebdfa919c907745497313aa",
    "type": "BRANCH",
    "repository": {
      "slug": "repostiroy-3",
      "id": 3,
      "name": "Repostiroy 3",
      "hierarchyId": "0a8dadb07bb606236d8c",
      "scmId": "git",
      "state": "AVAILABLE",
      "statusMessage": "Available",
      "forkable": true,
      "project": {
        "key": "PRO3",
        "id": 3,
        "name": "Project Three",
        "public": false,
        "type": "NORMAL",
        "links": {
          "self": [
            {
              "href": "http://localhost:7990/projects/PRO3"
            }
          ]
        }
      },
      "public": false,
      "archived": false,
      "links": {
        "clone": [
          {
            "href": "ssh://git@localhost:7999/pro3/repostiroy-3.git",
            "name": "ssh"
          },
          {
            "href": "http://localhost:7990/scm/pro3/repostiroy-3.git",
            "name": "http"
          }
        ],
        "self": [
          {
            "href": "http://localhost:7990/projects/PRO3/repos/repostiroy-3/browse"
          }
        ]
      }
    }
  },
  "toRef": {
    "id": "refs/heads/master",
    "displayId": "master",
    "latestCommit": "9534663d88977c0aa5c25249986eae851fd83a8d",
    "type": "BRANCH",
    "repository": {
      "slug": "repostiroy-3",
      "id": 3,
      "name": "Repostiroy 3",
      "hierarchyId": "0a8dadb07bb606236d8c",
      "scmId": "git",
      "state": "AVAILABLE",
      "statusMessage": "Available",
      "forkable": true,
      "project": {
        "key": "PRO3",
        "id": 3,
        "name": "Project Three",
        "public": false,
        "type": "NORMAL",
        "links": {
          "self": [
            {
              "href": "http://localhost:7990/projects/PRO3"
            }
          ]
        }
      },
      "public": false,
      "archived": false,
      "links": {
        "clone": [
          {
            "href": "ssh://git@localhost:7999/pro3/repostiroy-3.git",
            "name": "ssh"
          },
          {
            "href": "http://localhost:7990/scm/pro3/repostiroy-3.git",
            "name": "http"
          }
        ],
        "self": [
          {
            "href": "http://localhost:7990/projects/PRO3/repos/repostiroy-3/browse"
          }
        ]
      }
    }
  },
  "locked": false,
  "author": {
    "user": {
      "name": "[REDACTED]",
      "emailAddress": "admin@gmail.com",
      "active": true,
      "displayName": "Admin",
      "id": 3,
      "slug": "[REDACTED]",
      "type": "NORMAL",
      "links": {
        "self": [
          {
            "href": "http://localhost:7990/users/[REDACTED]"
          }
        ]
      }
    },
    "role": "AUTHOR",
    "approved": false,
    "status": "UNAPPROVED"
  },
  "reviewers": [],
  "participants": [],
  "properties": {
    "mergeResult": {
      "outcome": "CLEAN",
      "current": false
    },
    "resolvedTaskCount": 0,
    "commentCount": 0,
    "openTaskCount": 0
  },
  "links": {
    "self": [
      {
        "href": "http://localhost:7990/projects/PRO3/repos/repostiroy-3/pull-requests/1"
      }
    ]
  }
}
```

</details>


<details>
<summary> User response data</summary>

```json showLineNumbers
{
  "name": "[REDACTED]",
  "emailAddress": "admin@gmail.com",
  "active": true,
  "displayName": "Admin",
  "id": 3,
  "slug": "[REDACTED]",
  "type": "NORMAL",
  "links": {
    "self": [
      {
        "href": "http://localhost:7990/users/[REDACTED]"
      }
    ]
  }
}  
```

</details>

### Mapping result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Project entity in Port</summary>

```json showLineNumbers
{
  "blueprint": "bitbucketProject",
  "identifier": "PROJ",
  "createdAt": "2025-05-20T09:14:22.361Z",
  "updatedBy": "jqoQ34Azuy08BJFFUZAKyP3sXranvmgc",
  "createdBy": "jqoQ34Azuy08BJFFUZAKyP3sXranvmgc",
  "team": [],
  "title": "Project",
  "relations": {},
  "properties": {
    "public": false,
    "link": "http://localhost:7990/projects/PROJ",
    "description": null,
    "type": "NORMAL"
  },
  "updatedAt": "2025-05-22T20:46:27.616Z"
}
```

</details>

<details>
<summary>Repository entity in Port</summary>

```json showLineNumbers
{
  "blueprint": "bitbucketRepository",
  "identifier": "repostiroy-3",
  "createdAt": "2025-05-20T13:14:09.505Z",
  "updatedBy": "jqoQ34Azuy08BJFFUZAKyP3sXranvmgc",
  "createdBy": "jqoQ34Azuy08BJFFUZAKyP3sXranvmgc",
  "team": [],
  "title": "Repostiroy-3",
  "relations": {
    "project": "PRO3",
    "latestCommitAuthor": "admin@gmail.com"
  },
  "properties": {
    "public": false,
    "documentation": "",
    "link": "http://localhost:7990/projects/PRO3/repos/repostiroy-3/browse",
    "forkable": true,
    "description": null,
    "state": "AVAILABLE",
    "readme": null,
    "swagger_url": null
  },
  "updatedAt": "2025-05-20T13:14:09.505Z"
}
```

</details>

<details>
<summary>Pull Request entity in Port</summary>

```json showLineNumbers
{
  "blueprint": "bitbucketPullRequest",
  "identifier": "1",
  "createdAt": "2025-05-20T09:22:29.565Z",
  "updatedBy": "jqoQ34Azuy08BJFFUZAKyP3sXranvmgc",
  "createdBy": "jqoQ34Azuy08BJFFUZAKyP3sXranvmgc",
  "team": [],
  "title": "readme.md edited online with Bitbucket",
  "relations": {
    "repository": "repostiroy-3",
    "participants": []
  },
  "properties": {
    "updated_on": "2025-05-20T12:37:29Z",
    "owner": "admin@gmail.com",
    "created_on": "2025-05-20T08:38:44Z",
    "mergedAt": "2025-05-20T12:37:29Z",
    "link": "http://localhost:7990/projects/PRO3/repos/repostiroy-3/pull-requests/1",
    "destination": "master",
    "description": null,
    "state": "MERGED",
    "source": "main",
    "reviewers": [],
    "merge_commit": "3e4df0573a0ba1845ebdfa919c907745497313aa"
  },
  "updatedAt": "2025-05-20T12:37:34.111Z"
}
```

</details>


<details>
<summary> User entity in Port</summary>

```json showLineNumbers
{
  "blueprint": "bitbucketUser",
  "identifier": "admin@gmail.com",
  "createdAt": "2025-05-20T09:10:04.195Z",
  "updatedBy": "jqoQ34Azuy08BJFFUZAKyP3sXranvmgc",
  "createdBy": "jqoQ34Azuy08BJFFUZAKyP3sXranvmgc",
  "team": [],
  "title": "Admin",
  "relations": {},
  "properties": {
    "portUser": "admin@gmail.com",
    "url": "http://localhost:7990/users/admin",
    "username": "admin"
  },
  "updatedAt": "2025-05-20T09:10:04.195Z"
}
```

</details>


## GitOps
The Bitbucket (Self-Hosted) Ocean integration by itself does not support GitOps yet. This capability is planned for a future release and is WIP. If you really need GitOps support, you can use the [webhook gitops](gitops.md) installation method.

## Alternative installation via webhooks

While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest users, projects, repositories and pull request entities from Bitbucket (Self-Hosted). If so, use the following instructions:

**Note** that when using this method, data will be ingested into Port only when the webhook is triggered.

<details>
<summary><b>Webhook installation (click to expand)</b></summary>

<h3>Port configuration</h3>

Create the following blueprint definitions:

<details>
<summary>Bitbucket project blueprint</summary>

<BitbucketProjectBlueprint/>

</details>

<details>
<summary>Bitbucket user blueprint</summary>

<BitbucketUserBlueprint/>

</details>

<details>
<summary>Bitbucket repository blueprint</summary>

<BitbucketRepositoryBlueprint/>

</details>

<details>
<summary>Bitbucket pull request blueprint</summary>

<BitbucketPullrequestBlueprint/>

</details>

:::tip Blueprint Properties
You may modify the properties in your blueprints depending on what you want to track in your Bitbucket account.
:::

<h3>Let's test it</h3>

This section includes a sample webhook event sent from Bitbucket when a pull request is merged. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

<h4>Payload</h4>

Here is an example of the payload structure sent to the webhook URL when a Bitbucket pull request is merged:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "body": {
    "eventKey": "pr:merged",
    "date": "2023-11-16T11:03:42+0000",
    "actor": {
      "name": "admin",
      "emailAddress": "username@gmail.com",
      "active": true,
      "displayName": "Test User",
      "id": 2,
      "slug": "admin",
      "type": "NORMAL",
      "links": {
        "self": [
          {
            "href": "http://myhost:7990/users/admin"
          }
        ]
      }
    },
    "pullRequest": {
      "id": 2,
      "version": 2,
      "title": "lint code",
      "description": "here is the description",
      "state": "MERGED",
      "open": false,
      "closed": true,
      "createdDate": 1700132280533,
      "updatedDate": 1700132622026,
      "closedDate": 1700132622026,
      "fromRef": {
        "id": "refs/heads/dev",
        "displayId": "dev",
        "latestCommit": "9e08604e14fa72265d65696608725c2b8f7850f2",
        "type": "BRANCH",
        "repository": {
          "slug": "data-analyses",
          "id": 1,
          "name": "data analyses",
          "description": "This is for my repository and all the blah blah blah",
          "hierarchyId": "24cfae4b0dd7bade7edc",
          "scmId": "git",
          "state": "AVAILABLE",
          "statusMessage": "Available",
          "forkable": true,
          "project": {
            "key": "MOPP",
            "id": 1,
            "name": "My On Prem Project",
            "description": "On premise test project is sent to us for us",
            "public": false,
            "type": "NORMAL",
            "links": {
              "self": [
                {
                  "href": "http://myhost:7990/projects/MOPP"
                }
              ]
            }
          },
          "public": false,
          "archived": false,
          "links": {
            "clone": [
              {
                "href": "ssh://git@myhost:7999/mopp/data-analyses.git",
                "name": "ssh"
              },
              {
                "href": "http://myhost:7990/scm/mopp/data-analyses.git",
                "name": "http"
              }
            ],
            "self": [
              {
                "href": "http://myhost:7990/projects/MOPP/repos/data-analyses/browse"
              }
            ]
          }
        }
      },
      "toRef": {
        "id": "refs/heads/main",
        "displayId": "main",
        "latestCommit": "e461aae894b6dc951f405dca027a3f5567ea6bee",
        "type": "BRANCH",
        "repository": {
          "slug": "data-analyses",
          "id": 1,
          "name": "data analyses",
          "description": "This is for my repository and all the blah blah blah",
          "hierarchyId": "24cfae4b0dd7bade7edc",
          "scmId": "git",
          "state": "AVAILABLE",
          "statusMessage": "Available",
          "forkable": true,
          "project": {
            "key": "MOPP",
            "id": 1,
            "name": "My On Prem Project",
            "description": "On premise test project is sent to us for us",
            "public": false,
            "type": "NORMAL",
            "links": {
              "self": [
                {
                  "href": "http://myhost:7990/projects/MOPP"
                }
              ]
            }
          },
          "public": false,
          "archived": false,
          "links": {
            "clone": [
              {
                "href": "ssh://git@myhost:7999/mopp/data-analyses.git",
                "name": "ssh"
              },
              {
                "href": "http://myhost:7990/scm/mopp/data-analyses.git",
                "name": "http"
              }
            ],
            "self": [
              {
                "href": "http://myhost:7990/projects/MOPP/repos/data-analyses/browse"
              }
            ]
          }
        }
      },
      "locked": false,
      "author": {
        "user": {
          "name": "admin",
          "emailAddress": "username@gmail.com",
          "active": true,
          "displayName": "Test User",
          "id": 2,
          "slug": "admin",
          "type": "NORMAL",
          "links": {
            "self": [
              {
                "href": "http://myhost:7990/users/admin"
              }
            ]
          }
        },
        "role": "AUTHOR",
        "approved": false,
        "status": "UNAPPROVED"
      },
      "reviewers": [],
      "participants": [],
      "properties": {
        "mergeCommit": {
          "displayId": "1cbccf99220",
          "id": "1cbccf99220b23f89624c7c604f630663a1aaf8e"
        }
      },
      "links": {
        "self": [
          {
            "href": "http://myhost:7990/projects/MOPP/repos/data-analyses/pull-requests/2"
          }
        ]
      }
    }
  },
  "headers": {
    "X-Forwarded-For": "10.0.148.57",
    "X-Forwarded-Proto": "https",
    "X-Forwarded-Port": "443",
    "Host": "ingest.getport.io",
    "X-Amzn-Trace-Id": "Self=1-6555f719-267a0fce1e7a4d8815de94f7;Root=1-6555f719-1906872f41621b17250bb83a",
    "Content-Length": "2784",
    "User-Agent": "Atlassian HttpClient 3.0.4 / Bitbucket-8.15.1 (8015001) / Default",
    "Content-Type": "application/json; charset=UTF-8",
    "accept": "*/*",
    "X-Event-Key": "pr:merged",
    "X-Hub-Signature": "sha256=bf366faf8d8c41a4af21d25d922b87c3d1d127b5685238b099d2f311ad46e978",
    "X-Request-Id": "d5fa6a16-bb6c-40d6-9c50-bc4363e79632",
    "via": "HTTP/1.1 AmazonAPIGateway",
    "forwarded": "for=154.160.30.235;host=ingest.getport.io;proto=https"
  },
  "queryParams": {}
}
```

</details>


<details>
<summary> Mapping result </summary>

```json showLineNumbers
{
   "identifier":"2",
   "title":"lint code",
   "blueprint":"bitbucketPullrequest",
   "properties":{
      "created_on":"2023-11-16T10:58:00Z",
      "updated_on":"2023-11-16T11:03:42Z",
      "merge_commit":"9e08604e14fa72265d65696608725c2b8f7850f2",
      "state":"MERGED",
      "owner":"Test User",
      "link":"http://myhost:7990/projects/MOPP/repos/data-analyses/pull-requests/2",
      "destination":"main",
      "source":"dev",
      "participants":[],
      "reviewers":[]
   },
   "relations":{
      "repository":"data-analyses"
   },
   "filter":true
}
```
</details>

<h3>Import Bitbucket historical issues</h3>

In this example you are going to use the provided Python script to set up webhooks and fetch data from the Bitbucket Server / Bitbucket Data Center API and ingest it to Port.

<h4>Prerequisites</h4>

This example utilizes the [blueprint](#port-configuration) definition from the previous section.

In addition, provide the following environment variables:

- `PORT_CLIENT_ID` - Your Port client id
- `PORT_CLIENT_SECRET` - Your Port client secret
- `BITBUCKET_HOST` - Bitbucket Server / Bitbucket Data Center host such as `http://localhost:7990`
- `BITBUCKET_USERNAME` - Bitbucket username to use when accessing the Bitbucket resources
- `BITBUCKET_PASSWORD` - Bitbucket account password
- `BITBUCKET_PROJECTS_FILTER` - An optional comma separated list of Bitbucket projects to filter. If not provided, all projects will be fetched.
- `WEBHOOK_SECRET` - An optional secret to use when creating a webhook in Port. If not provided, `bitbucket_webhook_secret` will be used.
- `PORT_API_URL` - An optional variable that defaults to the EU Port API `https://api.getport.io/v1`. For US organizations use `https://api.us.getport.io/v1` instead.
- `IS_VERSION_8_7_OR_OLDER` - An optional variable that specifies whether the Bitbucket version is older than 8.7. This setting determines if webhooks should be created at the repository level (for older versions `<=8.7`) or at the project level (for newer versions `>=8.8`).
- `PULL_REQUEST_STATE` - An optional variable to specify the state of Bitbucket pull requests to be ingested. Accepted values are `"ALL"`, `"OPEN"`, `"MERGED"`, or `"DECLINED"`. If not specified, the default value is `OPEN`.

:::tip Webhook Configuration
This app will automatically set up a webhook that allows Bitbucket to send events to Port. To understand more about how Bitbucket sends event payloads via webhooks, you can refer to [this documentation](https://confluence.atlassian.com/bitbucketserver/event-payload-938025882.html).

Ensure that the Bitbucket credentials you use have `PROJECT_ADMIN` permissions to successfully configure the webhook. For more details on the necessary permissions and setup, see the [official Bitbucket documentation](https://developer.atlassian.com/server/bitbucket/rest/v910/api-group-project/#api-api-latest-projects-projectkey-webhooks-post).
:::


Find your Port credentials using this [guide](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)


Use the following Python script to set up webhook and ingest historical Bitbucket users, projects, repositories and pull requests into port:

<details>
<summary>Bitbucket Python script</summary>

:::tip Latest Version
You can pull the latest version of this code by cloning this [repository](https://github.com/port-labs/bitbucket-workspace-data/)
:::

<BitbucketServerPythonScript/>

</details>

<details>
<summary>Bitbucket webhook configuration</summary>

<BitbucketWebhookConfiguration/>

</details>

Done! you are now able to import historical users, projects, repositories and pull requests from Bitbucket into Port and any change that happens to your project, repository or pull requests in Bitbucket will trigger a webhook event to the webhook URL provided by Port. Port will parse the events and objects according to the mapping and update the catalog entities accordingly.

</details>

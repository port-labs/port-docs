---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_jenkins-docker-parameters.mdx"
import AdvancedConfig from '../../../../generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import JenkinsBuildBlueprint from './\_example_jenkins_build_blueprint.mdx'
import JenkinsBuildWebhookConfig from './\_example_jenkins_build_webhook_configuration.mdx'
import JenkinsJobBlueprint from './\_example_jenkins_job_blueprint.mdx'
import JenkinsJobWebhookConfig from './\_example_jenkins_job_webhook_configuration.mdx'

# Jenkins

Port's Jenkins integration allows you to import `jobs`, `builds`, `stages`, and `users` from your Jenkins environment into Port, according to your mapping and definitions.

## Common use cases

- Map `jobs`, `builds`, `stages`, and `users` in your Jenkins environment.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.

## Prerequisites

<Prerequisites />

To generate a token for authenticating the Jenkins API calls:
1. In the Jenkins banner frame, click your user name to open the user menu.
2. Navigate to Your **Username** > **Configure** > **API Token**.
3. Click Add new Token.
4. Click Generate.
5. Copy the API token that is generated to use as the `JENKINS_TOKEN`.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/jenkins/configure-api-token.png' width='80%' border='1px' />


:::info Install Required Plugins
To ensure full functionality of the Jenkins integration, please install the following plugins:

1. **People View Plugin**: Required for user information API (for Jenkins versions 2.452 and above)
   - Navigate to **Manage Jenkins** -> **Plugins**
   - Search for and install the [**"People View"** plugin](https://plugins.jenkins.io/people-view/)

2. **Pipeline: Stage View Plugin**: Required for fetching stages data
   - Navigate to **Manage Jenkins** -> **Plugins**
   - Search for and install the [**"Pipeline: Stage View"** plugin](https://plugins.jenkins.io/pipeline-stage-view/)

These plugins are essential for the integration to access user information and pipeline stage data.
:::

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
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------- |
| `port.clientId`                     | Your port client id ([Get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))                                                                                               | ✅      |
| `port.clientSecret`                 | Your port client secret ([Get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))                                                                                           | ✅      |
| `port.baseUrl`                | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US |  ✅      |
| `integration.identifier`            | Change the identifier to describe your integration                                                                 | ✅      |
| `integration.type`                  | The integration type                                                                                               | ✅      |
| `integration.eventListener.type`    | The event listener type                                                                                            | ✅      |
| `integration.secrets.jenkinsUser`   | The Jenkins username                                                                                               | ✅      |
| `integration.secrets.jenkinsToken`  | The Jenkins password or token                                                                                     | ✅      |
| `integration.config.jenkinsHost`    | The Jenkins host                                                                                                  | ✅      |
| `integration.config.appHost`        | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Jenkins  | ✅       |
| `scheduledResyncInterval`           | The number of minutes between each resync                                                                          | ❌      |
| `initializePortResources`           | Default true, When set to true the integration will create default blueprints and the port App config Mapping      | ❌      |
| `sendRawDataExamples`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                       | ❌      |


<br/>

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-jenkins-integration port-labs/port-ocean \
  --set port.clientId="PORT_CLIENT_ID"  \
  --set port.clientSecret="PORT_CLIENT_SECRET"  \
  --set port.baseUrl="https://api.getport.io"  \
  --set initializePortResources=true  \
  --set sendRawDataExamples=true  \
  --set scheduledResyncInterval=120 \
  --set integration.identifier="my-jenkins-integration"  \
  --set integration.type="jenkins"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.secrets.jenkinsUser="JENKINS_USER"  \
  --set integration.secrets.jenkinsToken="JENKINS_TOKEN" \
  --set integration.config.jenkinsHost="JENKINS_HOST"  
```
<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-jenkins-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `JENKINS_USER`, `JENKINS_TOKEN` and `JENKINS_HOST`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-jenkins-integration
  type: jenkins
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    jenkinsHost: JENKINS_HOST
  secrets:
  // highlight-start
    jenkinsUser: JENKINS_USER
    jenkinsToken: JENKINS_TOKEN
  // highlight-end
```
<br/>

2. Install the `my-ocean-jenkins-integration` ArgoCD Application by creating the following `my-ocean-jenkins-integration.yaml` manifest:

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
  name: my-ocean-jenkins-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-jenkins-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-jenkins-integration/values.yaml
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
kubectl apply -f my-ocean-jenkins-integration.yaml
```
</TabItem>
</Tabs>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time" label="Scheduled">
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Jenkins integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />
<br/>

Here is an example for `jenkins-integration.yml` workflow file:

```yaml showLineNumbers
name: Jenkins Exporter Workflow

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
          type: 'jenkins'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            jenkins_host: ${{ secrets.OCEAN__INTEGRATION__CONFIG__JENKINS_HOST }}
            jenkins_user: ${{ secrets.OCEAN__INTEGRATION__CONFIG__JENKINS_USER }}
            jenkins_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__JENKINS_TOKEN }}
```

</TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Jenkins integration once and then exit, this is useful for **scheduled** ingestion of data.

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
        stage('Run Jenkins Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__JENKINS_USER', variable: 'OCEAN__INTEGRATION__CONFIG__JENKINS_USER'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__JENKINS_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__JENKINS_TOKEN'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__JENKINS_HOST', variable: 'OCEAN__INTEGRATION__CONFIG__JENKINS_HOST'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="jenkins"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__JENKINS_USER=$OCEAN__INTEGRATION__CONFIG__JENKINS_USER \
                                -e OCEAN__INTEGRATION__CONFIG__JENKINS_TOKEN=$OCEAN__INTEGRATION__CONFIG__JENKINS_TOKEN \
                                -e OCEAN__INTEGRATION__CONFIG__JENKINS_HOST=$OCEAN__INTEGRATION__CONFIG__JENKINS_HOST \
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
<AzurePremise name="Jenkins" />

<DockerParameters />
<br/>

Here is an example for `jenkins-integration.yml` pipeline file:

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
    integration_type="jenkins"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__JENKINS_USER=$(OCEAN__INTEGRATION__CONFIG__JENKINS_USER) \
        -e OCEAN__INTEGRATION__CONFIG__JENKINS_TOKEN=$(OCEAN__INTEGRATION__CONFIG__JENKINS_TOKEN) \
        -e OCEAN__INTEGRATION__CONFIG__JENKINS_HOST=$(OCEAN__INTEGRATION__CONFIG__JENKINS_HOST) \
        -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
        -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $image_name

    exit $?
  displayName: 'Ingest Data into Port'

```

  </TabItem>

  <TabItem value="gitlab" label="GitLab">
This workflow will run the Jenkins integration once and then exit, this is useful for **scheduled** ingestion of data.

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
  INTEGRATION_TYPE: jenkins
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
        -e OCEAN__INTEGRATION__CONFIG__JENKINS_USER=$OCEAN__INTEGRATION__CONFIG__JENKINS_USER \
        -e OCEAN__INTEGRATION__CONFIG__JENKINS_TOKEN=$OCEAN__INTEGRATION__CONFIG__JENKINS_TOKEN \
        -e OCEAN__INTEGRATION__CONFIG__JENKINS_HOST=$OCEAN__INTEGRATION__CONFIG__JENKINS_HOST \
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

## Ingesting Jenkins objects

The Jenkins integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `job` data from Jenkins:

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: job
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .url | split("://")[1] | sub("^.*?/"; "") | gsub("%20"; "-") | gsub("/"; "-") | .[:-1]
          title: .fullName
          blueprint: '"jenkinsJob"'
          properties:
            jobName: .name
            url: .url
            jobStatus: '{"notbuilt": "created", "blue": "passing", "red": "failing"}[.color]'
            timestamp: .time
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Jenkins's API events.

### Configuration structure

The integration configuration determines which resources will be queried from Jenkins, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Jenkins, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- `job` - (`<your-jenkins-host>/api/json`)
- `build` - (`<your-jenkins-host>/api/json`)
- `user` - (`<your-jenkins-host>/people/api/json`)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: job
      selector:
      ...
  ```

- The `kind` key is a specifier for a Jenkins object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: job
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: job
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-end
      port:
  ```

- The `port`, `entity` and the `mappings` keys are used to map the Jenkins object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: job
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one Jenkins object to a Port entity. Each value is a JQ query.
            identifier: .url | split("://")[1] | sub("^.*?/"; "") | gsub("%20"; "-") | gsub("/"; "-") | .[:-1]
            title: .fullName
            blueprint: '"jenkinsJob"'
            properties:
              jobName: .name
              url: .url
              jobStatus: '{"notbuilt": "created", "blue": "passing", "red": "failing"}[.color]'
              timestamp: .time
        # highlight-end
    - kind: job # In this instance job is mapped again with a different filter
      selector:
        query: '.name == "MyJobName"'
      port:
        entity:
          mappings: ...
  ```

  :::tip Blueprint key
  Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

### Ingest data into Port

To ingest Jenkins objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Jenkins.
3. Choose the **Ingest Data** option from the menu.
4. Select Jenkins under the CI/CD category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Job

<details>
<summary>Job blueprint</summary>

```json showLineNumbers
{
  "identifier": "jenkinsJob",
  "description": "This blueprint represents a job in Jenkins",
  "title": "Jenkins Job",
  "icon": "Jenkins",
  "schema": {
      "properties": {
          "jobName": {
              "type": "string",
              "title": "Job Name"
          },
          "jobStatus": {
              "type": "string",
              "title": "Job Status",
              "enum": [
                  "created",
                  "unknown",
                  "passing",
                  "failing"
              ],
              "enumColors": {
                  "passing": "green",
                  "created": "darkGray",
                  "failing": "red",
                  "unknown": "orange"
              }
          },
          "timestamp": {
              "type": "string",
              "format": "date-time",
              "title": "Timestamp",
              "description": "Last updated timestamp of the job"
          },
          "url": {
              "type": "string",
              "title": "Project URL"
          },
          "parentJob": {
              "type": "object",
              "title": "Parent Job"
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
  - kind: job
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .url | split("://")[1] | sub("^.*?/"; "") | gsub("%20"; "-") | gsub("/"; "-") | .[:-1]
          title: .fullName
          blueprint: '"jenkinsJob"'
          properties:
            jobName: .name
            url: .url
            jobStatus: '{"notbuilt": "created", "blue": "passing", "red": "failing"}[.color]'
            timestamp: .time
            parentJob: .__parentJob
```

</details>

### Build

:::note Build Limit
The integration fetches up to 100 builds per Jenkins job, allowing you to view the 100 latest builds in Port for each job.
:::

<details>
<summary>Build blueprint</summary>

```yaml showLineNumbers
{
  "identifier": "jenkinsBuild",
  "description": "This blueprint represents a build event from Jenkins",
  "title": "Jenkins Build",
  "icon": "Jenkins",
  "schema": {
      "properties": {
          "buildStatus": {
              "type": "string",
              "title": "Build Status",
              "enum": [
                  "SUCCESS",
                  "FAILURE",
                  "UNSTABLE"
              ],
              "enumColors": {
                  "SUCCESS": "green",
                  "FAILURE": "red",
                  "UNSTABLE": "yellow"
              }
          },
          "buildUrl": {
              "type": "string",
              "title": "Build URL",
              "description": "URL to the build"
          },
          "timestamp": {
              "type": "string",
              "format": "date-time",
              "title": "Timestamp",
              "description": "Last updated timestamp of the build"
          },
          "buildDuration": {
              "type": "number",
              "title": "Build Duration",
              "description": "Duration of the build"
          }
      },
      "required": []
  },
  "mirrorProperties": {
      "previousBuildStatus": {
          "title": "Previous Build Status",
          "path": "previousBuild.buildStatus"
      }
  },
  "calculationProperties": {},
  "relations": {
      "parentJob": {
          "title": "Jenkins Job",
          "target": "jenkinsJob",
          "required": false,
          "many": false
      },
      "previousBuild": {
          "title": "Previous Build",
          "target": "jenkinsBuild",
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
  - kind: build
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .url | split("://")[1] | sub("^.*?/"; "") | gsub("%20"; "-") | gsub("/"; "-") | .[:-1]
          title: .displayName
          blueprint: '"jenkinsBuild"'
          properties:
            buildStatus: .result
            buildUrl: .url
            buildDuration: .duration
            timestamp: '.timestamp / 1000 | todate'
          relations:
            parentJob: .url | split("://")[1] | sub("^.*?/"; "") | gsub("%20"; "-") | gsub("/"; "-") | .[:-1] | gsub("-[0-9]+$"; "")
            previousBuild: .previousBuild.url | split("://")[1] | sub("^.*?/"; "") | gsub("%20"; "-") | gsub("/"; "-") | .[:-1]
```

</details>


### User

<details>
<summary>User blueprint</summary>

```json showLineNumbers
{
  "identifier": "jenkinsUser",
  "description": "This blueprint represents a jenkins user",
  "title": "Jenkins User",
  "icon": "Jenkins",
  "schema": {
      "properties": {
          "url": {
              "type": "string",
              "title": "URL",
              "format": "url"
          },
          "lastUpdateTime": {
              "type": "string",
              "format": "date-time",
              "title": "Last Update",
              "description": "Last updated timestamp of the user"
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
  - kind: user
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .user.id
        title: .user.fullName
        blueprint: '"jenkinsUser"'
        properties:
          url: .user.absoluteUrl
          lastUpdateTime: if .lastChange then (.lastChange/1000) else now end | strftime("%Y-%m-%dT%H:%M:%SZ")

```

</details>

### Stage

<details>
<summary>Stage blueprint</summary>

```json showLineNumbers
{
  "identifier": "jenkinsStage",
  "description": "This blueprint represents a stage in a Jenkins build",
  "title": "Jenkins Stage",
  "icon": "Jenkins",
  "schema": {
    "properties": {
      "status": {
        "type": "string",
        "title": "Stage Status",
        "enum": [
          "SUCCESS",
          "FAILURE",
          "UNSTABLE",
          "ABORTED",
          "IN_PROGRESS",
          "NOT_BUILT",
          "PAUSED_PENDING_INPUT"
        ],
        "enumColors": {
          "SUCCESS": "green",
          "FAILURE": "red",
          "UNSTABLE": "yellow",
          "ABORTED": "darkGray",
          "IN_PROGRESS": "blue",
          "NOT_BUILT": "lightGray",
          "PAUSED_PENDING_INPUT": "orange"
        }
      },
      "startTimeMillis": {
        "type": "number",
        "title": "Start Time (ms)",
        "description": "Timestamp in milliseconds when the stage started"
      },
      "durationMillis": {
        "type": "number",
        "title": "Duration (ms)",
        "description": "Duration of the stage in milliseconds"
      },
      "stageUrl": {
        "type": "string",
        "title": "Stage URL",
        "description": "URL to the stage"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "parentBuild": {
      "title": "Jenkins Build",
      "target": "jenkinsBuild",
      "required": true,
      "many": false
    }
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

:::note Control Stage Fetching
To prevent overwhelming your Ocean instance with potentially thousands of stages from Jenkins, the integration requires you to specify a specific job. This ensures that Ocean only retrieves stages related to that job, keeping things focused and efficient.

**Important**: The integration will also fetch stages from all nested jobs within the specified job.
:::

```yaml showLineNumbers
- kind: stage
  selector:
    query: 'true'
    # Example jobUrl - replace with your own Jenkins job URL
    jobUrl: http://your-jenkins-server/job/your-project/job/your-job
  port:
    entity:
      mappings:
        identifier: >-
          ._links.self.href  | sub("^.*?/"; "") | gsub("%20"; "-") |
          gsub("%252F"; "-") | gsub("/"; "-")
        title: .name
        blueprint: '"jenkinsStage"'
        properties:
          status: .status
          startTimeMillis: .startTimeMillis
          durationMillis: .durationMillis
          stageUrl: env.OCEAN__INTEGRATION__CONFIG__JENKINS_HOST  + ._links.self.href
        relations:
          parentBuild: >-
            ._links.self.href | sub("/execution/node/[0-9]+/wfapi/describe$";
            "") | sub("^.*?/"; "") | gsub("%20"; "-") | gsub("%252F"; "-") |
            gsub("/"; "-")
# Additional stage configurations follow the same pattern.
# Make sure to replace the jobUrl with your own Jenkins job URLs for each configuration.
- kind: stage
  selector:
    query: 'true'
    # Example jobUrl - replace with your own Jenkins job URL
    jobUrl: http://your-jenkins-server/job/your-project/job/another-job
  port:
    entity:
      mappings:
        identifier: >-
          ._links.self.href  | sub("^.*?/"; "") | gsub("%20"; "-") |
          gsub("%252F"; "-") | gsub("/"; "-")
        title: .name
        blueprint: '"jenkinsStage"'
        properties:
          status: .status
          startTimeMillis: .startTimeMillis
          durationMillis: .durationMillis
          stageUrl: env.OCEAN__INTEGRATION__CONFIG__JENKINS_HOST  + ._links.self.href
        relations:
          parentBuild: >-
            ._links.self.href | sub("/execution/node/[0-9]+/wfapi/describe$";
            "") | sub("^.*?/"; "") | gsub("%20"; "-") | gsub("%252F"; "-") |
            gsub("/"; "-")
- kind: stage
  selector:
    query: 'true'
    # Example jobUrl - replace with your own Jenkins job URL
    jobUrl: http://your-jenkins-server/job/your-project/job/third-job
  port:
    entity:
      mappings:
        identifier: >-
          ._links.self.href  | sub("^.*?/"; "") | gsub("%20"; "-") |
          gsub("%252F"; "-") | gsub("/"; "-")
        title: .name
        blueprint: '"jenkinsStage"'
        properties:
          status: .status
          startTimeMillis: .startTimeMillis
          durationMillis: .durationMillis
          stageUrl: env.OCEAN__INTEGRATION__CONFIG__JENKINS_HOST  + ._links.self.href
        relations:
          parentBuild: >-
            ._links.self.href | sub("/execution/node/[0-9]+/wfapi/describe$";
            "") | sub("^.*?/"; "") | gsub("%20"; "-") | gsub("%252F"; "-") |
            gsub("/"; "-")
```

</details>

## Let's Test It

This section includes a sample response data from Jenkins. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Jenkins:

<details>
<summary>Job response data</summary>

```json showLineNumbers
{
  "_class" : "hudson.model.FreeStyleProject",
  "displayName" : "Hello Job",
  "fullName" : "Hello Job",
  "name" : "Hello Job",
  "url" : "http://localhost:8080/job/Hello%20Job/",
  "buildable" : true,
  "builds" : [
    {
      "_class" : "hudson.model.FreeStyleBuild",
      "displayName" : "#2",
      "duration" : 221,
      "fullDisplayName" : "Hello Job #2",
      "id" : "2",
      "number" : 2,
      "result" : "SUCCESS",
      "timestamp" : 1700569094576,
      "url" : "http://localhost:8080/job/Hello%20Job/2/"
    },
    {
      "_class" : "hudson.model.FreeStyleBuild",
      "displayName" : "#1",
      "duration" : 2214,
      "fullDisplayName" : "Hello Job #1",
      "id" : "1",
      "number" : 1,
      "result" : "SUCCESS",
      "timestamp" : 1700567994163,
      "url" : "http://localhost:8080/job/Hello%20Job/1/"
    }
  ],
  "color" : "blue"
}
```

</details>

<details>
<summary>Build response data</summary>

```json showLineNumbers
{
  "_class" : "hudson.model.FreeStyleBuild",
  "displayName" : "#2",
  "duration" : 221,
  "fullDisplayName" : "Hello Job #2",
  "id" : "2",
  "number" : 2,
  "result" : "SUCCESS",
  "timestamp" : 1700569094576,
  "url" : "http://localhost:8080/job/Hello%20Job/2/"
}
```

</details>

<details>
<summary>User response data</summary>

```json showLineNumbers
{
  "user" : {
    "absoluteUrl" : "http://localhost:8080/user/admin",
    "fullName" : "admin",
    "description" : "System Administrator",
    "id" : "admin"
  },
  "lastChange" : 1700569094576
}
```

</details>

<details>
<summary>Stage response data</summary>

```json showLineNumbers
{
  "_links": {
    "self": {
      "href": "/job/Phalbert/job/salesdash/job/master/227/execution/node/17/wfapi/describe"
    }
  },
  "id": "17",
  "name": "Declarative: Post Actions",
  "execNode": "",
  "status": "SUCCESS",
  "startTimeMillis": 1717073271079,
  "durationMillis": 51,
  "pauseDurationMillis": 0
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary>Job entity</summary>

```json showLineNumbers
{
  "identifier": "hello-job",
  "title": "Hello Job",
  "blueprint": "jenkinsJob",
  "properties": {
    "jobName": "Hello Job",
    "url": "http://localhost:8080/job/Hello%20Job/",
    "jobStatus": "passing",
    "timestamp": "2023-09-08T14:58:14Z"
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
<summary>Build entity</summary>

```json showLineNumbers
{
  "identifier": "hello-job-2",
  "title": "Hello Job #2",
  "blueprint": "jenkinsBuild",
  "properties": {
    "buildStatus": "SUCCESS",
    "buildUrl": "http://localhost:8080/job/Hello%20Job/2/",
    "buildDuration": 221,
    "timestamp": "2023-09-08T14:58:14Z"
  },
  "relations": {
    "parentJob": "hello-job"
  },
  "createdAt": "2023-12-18T08:37:21.637Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-12-18T08:37:21.637Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary>User entity</summary>

```json showLineNumbers
{
  "identifier": "admin",
  "title": "admin",
  "blueprint": "jenkinsUser",
  "properties": {
    "url": "http://localhost:8080/user/admin",
    "lastUpdateTime": "2023-09-08T14:58:14Z"
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
<summary>Stage entity</summary>

```json showLineNumbers
{
  "identifier": "job-Phalbert-job-salesdash-job-master-229-execution-node-17-wfapi-describe",
  "title": "Declarative: Post Actions",
  "icon": null,
  "blueprint": "jenkinsStage",
  "team": [],
  "properties": {
    "status": "SUCCESS",
    "startTimeMillis": 1717073272012,
    "durationMillis": 26,
    "stageUrl": "http://localhost:8080/job/Phalbert/job/salesdash/job/master/229/execution/node/17/wfapi/describe"
  },
  "relations": {
    "parentBuild": "job-Phalbert-job-salesdash-job-master-229"
  },
  "createdAt": "2024-08-28T10:27:33.549Z",
  "createdBy": "<port-client-id>",
  "updatedAt": "2024-08-28T10:27:30.274Z",
  "updatedBy": "<port-client-id>"
}
```

</details>


## Alternative installation via webhook

While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest job and build entities from Jenkins. If so, use the following instructions:

**Note** that when using this method, data will be ingested into Port only when the webhook is triggered.

<details>
<summary><b>Webhook installation (click to expand)</b></summary>

<h2>Port configuration</h2>

Create the following blueprint definitions:

<details>
<summary>Jenkins job blueprint</summary>

<JenkinsJobBlueprint/>

</details>

<details>
<summary>Jenkins build blueprint (including the Jenkins job relation)</summary>

<JenkinsBuildBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints):

<details>
<summary>Jenkins job and build webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Jenkins Mapper`;
   2. Identifier : `jenkins_mapper`;
   3. Description : `A webhook configuration to map Jenkins builds and jobs to Port`;
   4. Icon : `Jenkins`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <JenkinsBuildWebhookConfig/>

3. Click **Save** at the bottom of the page.

</details>

<h2>Create a webhook in Jenkins</h2>

1. Go to your Jenkins dashboard.
2. At the sidebar on the left side of the page, select **Manage Jenkins** and click on **Manage Plugins**.
3. Navigate to the **Available Plugins** tab and search for **Generic Event** in the search bar. Install the [Generic Event](https://plugins.jenkins.io/generic-event/) or a suitable plugin that can notify some endpoints about all events that happen in Jenkins.
4. Go back to your Jenkins dashboard and click on **Manage Jenkins** at the left side menu.
5. Click on the **Configure System** tab and scroll down to the **Event Dispatcher** section.
6. Enter the value of the `url` key you received after creating the webhook configuration in the textbox.
7. Click on **Save** at the bottom of the page.

:::tip
In order to view the different payloads and events available in Jenkins webhooks, [click here](https://plugins.jenkins.io/generic-event/).
:::

Done! Any changes to a job or build process (queued, started, completed, finalized, etc.) will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2>Let's Test It</h2>

This section includes a sample response data from Jenkins. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

<h3>Payload</h3>

Here is an example of the payload structure from Jenkins:

<details>
<summary>Job response data</summary>

```json showLineNumbers
{
  "_class" : "hudson.model.FreeStyleProject",
  "displayName" : "Hello Job",
  "fullName" : "Hello Job",
  "name" : "Hello Job",
  "url" : "http://localhost:8080/job/Hello%20Job/",
  "buildable" : true,
  "builds" : [
    {
      "_class" : "hudson.model.FreeStyleBuild",
      "displayName" : "#2",
      "duration" : 221,
      "fullDisplayName" : "Hello Job #2",
      "id" : "2",
      "number" : 2,
      "result" : "SUCCESS",
      "timestamp" : 1700569094576,
      "url" : "http://localhost:8080/job/Hello%20Job/2/"
    },
    {
      "_class" : "hudson.model.FreeStyleBuild",
      "displayName" : "#1",
      "duration" : 2214,
      "fullDisplayName" : "Hello Job #1",
      "id" : "1",
      "number" : 1,
      "result" : "SUCCESS",
      "timestamp" : 1700567994163,
      "url" : "http://localhost:8080/job/Hello%20Job/1/"
    }
  ],
  "color" : "blue"
}
```

</details>

<details>
<summary>Build response data</summary>

```json showLineNumbers
{
  "_class" : "hudson.model.FreeStyleBuild",
  "displayName" : "#2",
  "duration" : 221,
  "fullDisplayName" : "Hello Job #2",
  "id" : "2",
  "number" : 2,
  "result" : "SUCCESS",
  "timestamp" : 1700569094576,
  "url" : "http://localhost:8080/job/Hello%20Job/2/"
}
```

</details>

<h3>Mapping Result</h3>

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary>Job entity</summary>

```json showLineNumbers
{
  "identifier": "hello-job",
  "title": "Hello Job",
  "blueprint": "jenkinsJob",
  "properties": {
    "jobName": "Hello Job",
    "url": "http://localhost:8080/job/Hello%20Job/",
    "jobStatus": "passing",
    "timestamp": "2023-09-08T14:58:14Z"
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
<summary>Build entity</summary>

```json showLineNumbers
{
  "identifier": "hello-job-2",
  "title": "Hello Job #2",
  "blueprint": "jenkinsBuild",
  "properties": {
    "buildStatus": "SUCCESS",
    "buildUrl": "http://localhost:8080/job/Hello%20Job/2/",
    "buildDuration": 221,
    "timestamp": "2023-09-08T14:58:14Z"
  },
  "relations": {
    "parentJob": "hello-job"
  },
  "createdAt": "2023-12-18T08:37:21.637Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-12-18T08:37:21.637Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```
</details>

</details>



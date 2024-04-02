---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_jenkins-docker-parameters.mdx"
import AdvancedConfig from '../../../generalTemplates/_ocean_advanced_configuration_note.md'

# Jenkins

Our Jenkins integration allows you to import `jobs`, `builds`, and `users` from your Jenkins environment into Port, according to your mapping and definitions.

## Common use cases

- Map `jobs`, `builds`, and `users` in your Jenkins environment.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.

## Prerequisites

<Prerequisites />

To generate a token for authenticating the Jenkins API calls:
1. In the Jenkins banner frame, click your user name to open the user menu.
2. Navigate to Your **Username** > **Configure** > **API Token**.
3. Click Add new Token.
4. Click Generate.
5. Copy the API token that is generated to use as the `JENKINS_TOKEN`.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/jenkins/configure-api-token.png' width='80%' />


## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                           | Description                                                                                                        | Required |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `port.clientId`                     | Your port client id ([Get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))                                                                                               | ✅       |
| `port.clientSecret`                 | Your port client secret ([Get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))                                                                                           | ✅       |
| `integration.identifier`            | Change the identifier to describe your integration                                                                 | ✅       |
| `integration.type`                  | The integration type                                                                                               | ✅       |
| `integration.eventListener.type`    | The event listener type                                                                                            | ✅       |
| `integration.secrets.jenkinsUser`   | The Jenkins username                                                                                               | ✅       |
| `integration.secrets.jenkinsToken`  | The Jenkins password or token                                                                                     | ✅       |
| `integration.config.jenkinsHost`    | The Jenkins host                                                                                                  | ✅       |
| `integration.config.appHost`        | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Jenkins  | ❌       |
| `scheduledResyncInterval`           | The number of minutes between each resync                                                                          | ❌       |
| `initializePortResources`           | Default true, When set to true the integration will create default blueprints and the port App config Mapping      | ❌       |

<br/>

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-jenkins-integration port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \
	--set port.clientSecret="PORT_CLIENT_SECRET"  \
	--set initializePortResources=true  \
	--set scheduledResyncInterval=120 \
	--set integration.identifier="my-jenkins-integration"  \
	--set integration.type="jenkins"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.secrets.jenkinsUser="JENKINS_USER"  \
	--set integration.secrets.jenkinsToken="JENKINS_TOKEN" \
	--set integration.config.jenkinsHost="JENKINS_HOST"  
```

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

# This workflow responsible for running Jenkins exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with: 
          type: 'jenkins'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
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
                                -e OCEAN__INTEGRATION__CONFIG__JENKINS_USER=$OCEAN__INTEGRATION__CONFIG__JENKINS_USER \
                                -e OCEAN__INTEGRATION__CONFIG__JENKINS_TOKEN=$OCEAN__INTEGRATION__CONFIG__JENKINS_TOKEN \
                                -e OCEAN__INTEGRATION__CONFIG__JENKINS_HOST=$OCEAN__INTEGRATION__CONFIG__JENKINS_HOST \
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
        -e OCEAN__INTEGRATION__CONFIG__JENKINS_USER=${OCEAN__INTEGRATION__CONFIG__JENKINS_USER} \
        -e OCEAN__INTEGRATION__CONFIG__JENKINS_TOKEN=${OCEAN__INTEGRATION__CONFIG__JENKINS_TOKEN} \
        -e OCEAN__INTEGRATION__CONFIG__JENKINS_HOST=${OCEAN__INTEGRATION__CONFIG__JENKINS_HOST} \
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

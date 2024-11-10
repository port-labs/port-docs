---
sidebar_position: 2
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_octopus-deploy-docker-parameters.mdx"
import AdvancedConfig from '../../../../generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "./\_octopus_deploy_ocean_saas_installation.mdx"

# Octopus Deploy Integration

Port's Octopus Deploy integration allows you to import `spaces`, `projects`, `releases`, `deployments`, and `machines` from Octopus Deploy into Port based on your mappings and definitions.

## Common Use Cases

- Map `spaces`, `projects`, `releases`, `deployments`, and `machines` from Octopus Deploy to Port.
- Monitor real-time changes (create/update/delete) in Octopus Deploy and automatically sync them with your entities in Port.


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

| Parameter                           | Description                                                                                                                                             | Required |
|-------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------| -------- |
| `port.clientId`                     | Your port client id ([Get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `port.clientSecret`                 | Your port client secret ([Get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) | ✅       |
| `port.baseUrl`                      | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                 |  ✅       |
| `integration.identifier`            | Change the identifier to describe your integration                                                                                                      | ✅       |
| `integration.type`                  | The integration type                                                                                                                                    | ✅       |
| `integration.eventListener.type`    | The event listener type                                                                                                                                 | ✅       |
| `integration.secrets.octopusApiKey` | The Octopus API Key                                                                                                                                     | ✅       |
| `integration.config.serverUrl`      | The Octopus host                                                                                                                                        | ✅       |
| `integration.config.appHost`        | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Octopus                                   | ❌       |
| `scheduledResyncInterval`           | The number of minutes between each resync                                                                                                               | ❌       |
| `initializePortResources`           | Default true, When set to true the integration will create default blueprints and the port App config Mapping                                           | ❌       |
| `sendRawDataExamples`               | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                     | ❌       |


<br/>

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install octopus port-labs/port-ocean \
	--set port.clientId=<YOUR_PORT_CLIENT_ID>  \
	--set port.clientSecret=<YOUR_PORT_CLIENT_SECRET>  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
	--set sendRawDataExamples=true  \
	--set integration.identifier="octopus"  \
	--set integration.type="octopus"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.secrets.octopusApiKey="Enter value here"  \
	--set integration.config.serverUrl="https://example.com"  
```
<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD">
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-octopus-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `OCTOPUS_HOST`, `APP_HOST` and `OCTOPUS_API_KEY`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-octopus-integration
  type: octopus
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    serverUrl: OCTOPUS_HOST
  // highlight-next-line
    appHost: APP_HOST
  secrets:
  // highlight-start
    octopusApiKey: OCTOPUS_API_KEY
  // highlight-end
```
<br/>

2. Install the `my-octopus-integration` ArgoCD Application by creating the following `my-octopus-integration.yaml` manifest:

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
  name: my-octopus-integration
  namespace: argocd
spec:
  destination:
    namespace: my-octopus-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-octopus-integration/values.yaml
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
kubectl apply -f my-octopus-integration.yaml
```
</TabItem>
</Tabs>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time" label="Scheduled">
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Octopus integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />
<br/>

Here is an example for `octopus-integration.yml` workflow file:

```yaml showLineNumbers
name: Octopus Exporter Workflow

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
          type: 'octopus'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            octopus_api_key: ${{ secrets.OCEAN__INTEGRATION__CONFIG__OCTOPUS_API_KEY }}
            server_url: ${{ OCEAN__INTEGRATION__CONFIG__SERVER_URL }}
```

</TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Octopus integration once and then exit, this is useful for **scheduled** ingestion of data.

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
        stage('Run Octopus Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__OCTOPUS_API_KEY', variable: 'OCEAN__INTEGRATION__CONFIG__OCTOPUS_API_KEY'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__SERVER_URL', variable: 'OCEAN__INTEGRATION__CONFIG__SERVER_URL'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="octopus"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__OCTOPUS_API_KEY=$OCEAN__INTEGRATION__CONFIG__OCTOPUS_API_KEY \
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
<TabItem value="azure" label="Azure Devops">
<AzurePremise name="Octopus" />

<DockerParameters />
<br/>

Here is an example for `octopus-integration.yml` pipeline file:

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
    integration_type="octopus"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__OCTOPUS_API_KEY=$(OCEAN__INTEGRATION__CONFIG__OCTOPUS_API_KEY) \
        -e OCEAN__INTEGRATION__CONFIG__SERVER_URL=$(OCEAN__INTEGRATION__CONFIG__SERVER_URL) \
        -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
        -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $image_name

    exit $?
  displayName: 'Ingest Data into Port'

```

  </TabItem>

  <TabItem value="gitlab" label="GitLab">
This workflow will run the Octopus integration once and then exit, this is useful for **scheduled** ingestion of data.

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
  INTEGRATION_TYPE: octopus
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
        -e OCEAN__INTEGRATION__CONFIG__OCTOPUS_API_KEY=$OCEAN__INTEGRATION__CONFIG__OCTOPUS_API_KEY \
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

<AdvancedConfig/>

</TabItem>

</Tabs>

### Generating Octopus API Key

To generate a Api Key for authenticating the Octopus Deploy API calls:
1. Log into the Octopus Web Portal, click your profile image and select Profile.
2. Click My API Keys.
3. Click New API key, state the purpose of the API key, set the expiry and click Generate new.
4. Copy the new API key to your clipboard and use as `OCTOPUS_API_KEY`.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/octopus-deploy/configure-api-token.png' width='80%' border='1px' />


## Ingesting Octopus Objects

The Octopus integration uses a YAML configuration to define how data is loaded into the developer portal.

Below is an example snippet from the configuration that shows how to retrieve `space` data from Octopus:


```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: space
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .Id
          title: .Name
          blueprint: '"octopusSpace"'
          properties:
            url: env.OCEAN__INTEGRATION__CONFIG__SERVER_URL + "/app#/" + .Id
            description: .Description
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Octopus's API events.


### Ingest data into Port

To ingest Octopus objects using the [integration configuration](/build-your-software-catalog/customize-integrations/configure-mapping), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Octopus.
3. Choose the **Ingest Data** option from the menu.
4. Click the Octopus integration to open the edit page.
5. Modify the [configuration](/build-your-software-catalog/customize-integrations/configure-mapping) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Space

<details>
<summary>Space blueprint</summary>

```json showLineNumbers
{
  "identifier": "octopusSpace",
  "title": "Octopus Space",
  "icon": "Octopus",
  "description": "A space in Octopus Deploy",
  "schema": {
    "properties": {
      "url": {
        "type": "string",
        "title": "Space URL",
        "format": "url",
        "description": "The Link to the Space in Octopus Deploy"
      },
      "description": {
        "type": "string",
        "title": "Description",
        "description": "The description of the space"
      }
    }
  },
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
  - kind: space
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .Id
          title: .Name
          blueprint: '"octopusSpace"'
          properties:
            url: env.OCEAN__INTEGRATION__CONFIG__SERVER_URL + "/app#/" + .Id
            description: .Description
```

</details>

### Project

<details>
<summary>Project blueprint</summary>

```yaml showLineNumbers
{
  "identifier": "octopusProject",
  "title": "Octopus Project",
  "icon": "Octopus",
  "description": "An Octopus project",
  "schema": {
    "properties": {
      "slug": {
        "type": "string",
        "title": "Slug",
        "description": "The slug identifier of the project"
      },
      "url": {
        "type": "string",
        "title": "Project URL",
        "format": "url",
        "description": "The URL to access the project in Octopus Deploy"
      },
      "description": {
        "type": "string",
        "title": "Description",
        "description": "The project description"
      },
      "isDisabled": {
        "type": "boolean",
        "title": "Is Disabled",
        "description": "Indicates if the project is disabled"
      },
      "tenantedDeploymentMode": {
        "type": "string",
        "title": "Tenanted Deployment Mode",
        "description": "The deployment mode regarding tenants"
      }
    }
  },
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
            identifier: .Id
            title: .Name
            blueprint: '"octopusProject"'
            properties:
              url: env.OCEAN__INTEGRATION__CONFIG__SERVER_URL + "/app#/" + .SpaceId + "/projects/" + .Id
              description: .Description
              isDisabled: .IsDisabled
              tenantedDeploymentMode: .TenantedDeploymentMode
```

</details>


### Release

<details>
<summary>Release blueprint</summary>

```json showLineNumbers
{
  "identifier": "octopusRelease",
  "title": "Octopus Release",
  "icon": "Octopus",
  "description": "A release in Octopus Deploy",
  "schema": {
    "properties": {
      "version": {
        "type": "string",
        "title": "Version",
        "description": "The version of the release"
      },
      "assembledDate": {
        "type": "string",
        "title": "Assembled Date",
        "format": "date-time",
        "description": "The datetime the release was assembled"
      },
      "channelId": {
        "type": "string",
        "title": "Channel ID",
        "description": "The ID of the channel associated with the release"
      },
      "releaseNotes": {
        "type": "string",
        "title": "Release Notes",
        "description": "Notes provided for the release"
      },
      "url": {
        "type": "string",
        "title": "Release URL",
        "format": "url",
        "description": "The URL to access the release in Octopus Deploy"
      }
    }
  },
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
  - kind: release
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .Id
          title: ".ProjectId + \"(\" + .Version + \")\""
          blueprint: '"octopusRelease"'
          properties:
            version: .Version
            assembledDate: .Assembled
            channelId: .ChannelId
            releaseNotes: .ReleaseNotes
            url: env.OCEAN__INTEGRATION__CONFIG__SERVER_URL + "/app#/" + .SpaceId + "/releases/" + .Id

```

</details>


### Deployment

<details>
<summary>Deployment blueprint</summary>

```json showLineNumbers
{
  "identifier": "octopusDeployment",
  "title": "Octopus Deployment",
  "icon": "Octopus",
  "description": "A deployment in Octopus Deploy",
  "schema": {
    "properties": {
      "createdAt": {
        "type": "string",
        "title": "Created At",
        "format": "date-time",
        "description": "The datetime when the deployment was created"
      },
      "deployedBy": {
        "type": "string",
        "title": "Deployed By",
        "description": "The user or system that performed the deployment"
      },
      "taskId": {
        "type": "string",
        "title": "Task ID",
        "description": "The ID of the task associated with the deployment"
      },
      "failureEncountered": {
        "type": "boolean",
        "title": "Failure Encountered",
        "description": "Indicates if any failure was encountered during the deployment"
      },
      "comments": {
        "type": "string",
        "title": "Comments",
        "description": "Comments regarding the deployment"
      },
      "url": {
        "type": "string",
        "title": "Deployment URL",
        "format": "url",
        "description": "The URL to access the deployment in Octopus Deploy"
      }
    }
  },
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
  - kind: deployment
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .Id
          title: .Name
          blueprint: '"octopusDeployment"'
          properties:
            createdAt: .Created
            deployedBy: .DeployedBy
            taskId: .TaskId
            failureEncountered: .FailureEncountered
            comments: .Comments
            url: env.OCEAN__INTEGRATION__CONFIG__SERVER_URL + "/app#/" + .SpaceId + "/deployments/" + .Id

```

</details>


### Machine

<details>
<summary>Machine blueprint</summary>

```json showLineNumbers
{
  "identifier": "octopusMachine",
  "title": "Octopus Machine",
  "icon": "Octopus",
  "description": "A deployment target in Octopus Deploy",
  "schema": {
    "properties": {
      "roles": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "title": "Roles",
        "description": "Roles assigned to the target"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "description": "The health status of the target"
      },
      "url": {
        "type": "string",
        "title": "Machine URL",
        "format": "url",
        "description": "The URL of the target"
      },
      "isDisabled": {
        "type": "boolean",
        "title": "Is Disabled",
        "description": "Indicates if the target is disabled"
      },
      "operatingSystem": {
        "type": "string",
        "title": "Operating System",
        "description": "The operating system of the target"
      },
      "architecture": {
        "type": "string",
        "title": "Architecture",
        "description": "The architecture of the target"
      },
      "statusSummary": {
        "type": "string",
        "title": "Status Summary",
        "description": "Summary of the target's status"
      },
      "endpointType": {
        "type": "string",
        "title": "Endpoint Type",
        "description": "The type of deployment target endpoint"
      },
      "communicationStyle": {
        "type": "string",
        "title": "Communication Style",
        "description": "The communication style of the target"
      }
    }
  },
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
  - kind: machine
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .Id
          title: .Name
          blueprint: '"octopusMachine"'
          properties:
            roles: .Roles
            status: .HealthStatus
            url: env.OCEAN__INTEGRATION__CONFIG__SERVER_URL + "/app#/" + .SpaceId + "/infrastructure/machines/" + .Id + "/settings"
            isDisabled: .IsDisabled
            operatingSystem: .OperatingSystem
            architecture: .Architecture
            statusSummary: .StatusSummary
            endpointType: .Endpoint.DeploymentTargetTypeId
            communicationStyle: .Endpoint.CommunicationStyle

```

</details>

## Let's Test It

This section includes a sample response data from Octopus. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Octopus:

<details>
<summary>Space response data</summary>

```json showLineNumbers
{
  "Id": "Spaces-1",
  "Name": "Default",
  "Slug": "default",
  "Description": "Description cannot be empty",
  "IsDefault": true,
  "IsPrivate": false,
  "TaskQueueStopped": false,
  "SpaceManagersTeams": [
    "teams-administrators",
    "teams-managers",
    "teams-spacemanagers-Spaces-1"
  ],
  "SpaceManagersTeamMembers": [],
  "Icon": null,
  "ExtensionSettings": [],
  "LastModifiedOn": "0001-01-01T00:00:00.000+00:00",
  "Links": {
    "Self": "/api/spaces/Spaces-1",
    "SpaceHome": "/api/Spaces-1",
    "Web": "/app#/spaces/Spaces-1",
    "Logo": "/api/spaces/Spaces-1/logo?cb=2024.3.10989",
    "Search": "/api/spaces/Spaces-1/search"
  }
}
```

</details>

<details>
<summary>Project response data</summary>

```json showLineNumbers
{
  "Id": "Projects-1",
  "SpaceId": "Spaces-1",
  "VariableSetId": "variableset-Projects-1",
  "DeploymentProcessId": "deploymentprocess-Projects-1",
  "ClonedFromProjectId": null,
  "DiscreteChannelRelease": false,
  "IncludedLibraryVariableSetIds": [],
  "DefaultToSkipIfAlreadyInstalled": false,
  "TenantedDeploymentMode": "Untenanted",
  "DefaultGuidedFailureMode": "EnvironmentDefault",
  "VersioningStrategy": {
    "Template": null,
    "DonorPackage": null
  },
  "ReleaseCreationStrategy": {
    "ChannelId": null,
    "ReleaseCreationPackage": null,
    "ReleaseCreationPackageStepId": null
  },
  "Templates": [],
  "AutoDeployReleaseOverrides": [],
  "ReleaseNotesTemplate": null,
  "DeploymentChangesTemplate": null,
  "ForcePackageDownload": false,
  "Icon": {
    "Id": "map-signs",
    "Color": "#5E2EA2"
  },
  "AllowIgnoreChannelRules": true,
  "ExecuteDeploymentsOnResilientPipeline": null,
  "ExtensionSettings": [],
  "Name": "Sample Project",
  "Slug": "sample-project",
  "Description": "Explore how to automate your deployments with Octopus Deploy.\n\nEdit the custom script step, tweak the variables, and run your first deployment. Experiment and make it your own!",
  "IsDisabled": false,
  "ProjectGroupId": "ProjectGroups-2",
  "LifecycleId": "Lifecycles-2",
  "AutoCreateRelease": false,
  "IsVersionControlled": false,
  "PersistenceSettings": {
    "Type": "Database"
  },
  "ProjectConnectivityPolicy": {
    "SkipMachineBehavior": "None",
    "TargetRoles": [],
    "AllowDeploymentsToNoTargets": false,
    "ExcludeUnhealthyTargets": false
  },
  "Links": {
    "Self": "/api/Spaces-1/projects/Projects-1",
    "Variables": "/api/Spaces-1/projects/Projects-1/variables",
    "Releases": "/api/Spaces-1/projects/Projects-1/releases{/version}{?skip,take,searchByVersion}",
    "Channels": "/api/Spaces-1/projects/Projects-1/channels{/id}{?skip,take,partialName}",
    "Triggers": "/api/Spaces-1/projects/Projects-1/triggers{?skip,take,partialName,triggerActionType,triggerActionCategory,runbooks}",
    "ScheduledTriggers": "/api/Spaces-1/projects/Projects-1/triggers/scheduled{?skip,take,partialName,ids}",
    "OrderChannels": "/api/Spaces-1/projects/Projects-1/channels/order",
    "Progression": "/api/Spaces-1/projects/Projects-1/progression{?releaseHistoryCount}",
    "RunbookTaskRunDashboardItemsTemplate": "/api/Spaces-1/progression/runbooks/taskRuns{?skip,take,ids,projectIds,runbookIds,environmentIds,tenantIds,taskIds}",
    "DeploymentProcess": "/api/Spaces-1/projects/Projects-1/deploymentprocesses",
    "DeploymentSettings": "/api/Spaces-1/projects/Projects-1/deploymentsettings",
    "Web": "/app#/Spaces-1/projects/Projects-1",
    "Logo": "/api/Spaces-1/projects/Projects-1/logo?cb=map-signs-%235E2EA2-2024.3.10989",
    "Metadata": "/api/Spaces-1/projects/Projects-1/metadata",
    "Runbooks": "/api/Spaces-1/projects/Projects-1/runbooks{?skip,take,partialName}",
    "RunbookSnapshots": "/api/Spaces-1/projects/Projects-1/runbookSnapshots{/name}{?skip,take,searchByName}",
    "Summary": "/api/Spaces-1/projects/Projects-1/summary",
    "GitConnectionTest": "/api/Spaces-1/projects/Projects-1/git/connectivity-test",
    "InsightsMetrics": "/api/Spaces-1/projects/Projects-1/insights/metrics{?channelId,environmentId,tenantId,tenantFilter,timeRange,granularity,timeZone}",
    "GitCompatibilityReport": "/api/Spaces-1/projects/Projects-1/git/compatibility-report",
    "ConvertToGit": "/api/Spaces-1/projects/Projects-1/git/convert",
    "ConvertToVcs": "/api/Spaces-1/projects/Projects-1/git/convert"
  }
}
```

</details>

<details>
<summary>Release response data</summary>

```json showLineNumbers
{
  "Id": "Releases-44",
  "SpaceId": "Spaces-1",
  "ProjectId": "Projects-41",
  "Version": "0.0.2",
  "ChannelId": "Channels-41",
  "ReleaseNotes": null,
  "ProjectDeploymentProcessSnapshotId": "deploymentprocess-Projects-41-s-1-QXLY2",
  "IgnoreChannelRules": false,
  "BuildInformation": [],
  "Assembled": "2024-08-21T16:17:46.750+00:00",
  "LibraryVariableSetSnapshotIds": [],
  "SelectedPackages": [],
  "SelectedGitResources": [],
  "ProjectVariableSetSnapshotId": "variableset-Projects-41-s-0-S6LJL",
  "VersionControlReference": null,
  "Links": {
    "Self": "/api/Spaces-1/releases/Releases-44",
    "Project": "/api/Spaces-1/projects/Projects-41",
    "Channel": "/api/Spaces-1/projects/Projects-41/channels/Channels-41",
    "Progression": "/api/Spaces-1/releases/Releases-44/progression",
    "Deployments": "/api/Spaces-1/releases/Releases-44/deployments{?skip,take}",
    "DeploymentTemplate": "/api/Spaces-1/releases/Releases-44/deployments/template",
    "Artifacts": "/api/Spaces-1/artifacts?regarding=Releases-44",
    "ProjectVariableSnapshot": "/api/Spaces-1/variables/variableset-Projects-41-s-0-S6LJL",
    "ProjectDeploymentProcessSnapshot": "/api/Spaces-1/deploymentprocesses/deploymentprocess-Projects-41-s-1-QXLY2",
    "Web": "/app#/Spaces-1/releases/Releases-44",
    "SnapshotVariables": "/api/Spaces-1/releases/Releases-44/snapshot-variables",
    "Defects": "/api/Spaces-1/releases/Releases-44/defects",
    "ReportDefect": "/api/Spaces-1/releases/Releases-44/defects",
    "ResolveDefect": "/api/Spaces-1/releases/Releases-44/defects/resolve",
    "DeploymentPreviews": "/api/Spaces-1/releases/Releases-44/deployments/previews/",
    "Variables": "/api/Spaces-1/projects/Projects-41/releases/Releases-44/variables"
  }
}
```

</details>

<details>
<summary>Deployment response data</summary>

```json showLineNumbers
{
  "Id": "Deployments-1",
  "SpaceId": "Spaces-1",
  "ReleaseId": "Releases-1",
  "ChannelId": "Channels-2",
  "DeploymentProcessId": "deploymentprocess-Projects-1-s-1-CGNSF",
  "Changes": [],
  "ChangesMarkdown": null,
  "EnvironmentId": "Environments-1",
  "TenantId": null,
  "ForcePackageDownload": false,
  "ForcePackageRedeployment": false,
  "Priority": "LifecycleDefault",
  "SkipActions": [],
  "SpecificMachineIds": [],
  "ExcludedMachineIds": [],
  "ManifestVariableSetId": null,
  "TaskId": "ServerTasks-11599",
  "ProjectId": "Projects-1",
  "UseGuidedFailure": false,
  "Comments": null,
  "FormValues": {},
  "QueueTime": null,
  "QueueTimeExpiry": null,
  "Name": "Deploy to Development",
  "Created": "2024-08-02T05:07:42.445+00:00",
  "TentacleRetentionPeriod": null,
  "ChangeRequestSettings": null,
  "DeployedBy": "System",
  "DeployedById": null,
  "FailureEncountered": false,
  "DeployedToMachineIds": [],
  "ExecutionPlanLogContext": {
    "Steps": []
  },
  "Links": {
    "Self": "/api/Spaces-1/deployments/Deployments-1",
    "Release": "/api/Spaces-1/releases/Releases-1",
    "Environment": "/api/Spaces-1/environments/Environments-1",
    "Project": "/api/Spaces-1/projects/Projects-1",
    "Task": "/api/tasks/ServerTasks-11599",
    "Web": "/app#/Spaces-1/deployments/Deployments-1",
    "Artifacts": "/api/Spaces-1/artifacts?regarding=Deployments-1",
    "Interruptions": "/api/Spaces-1/interruptions?regarding=Deployments-1",
    "DeploymentProcess": "/api/Spaces-1/deploymentprocesses/deploymentprocess-Projects-1-s-1-CGNSF"
  }
}
],
"Links": {
"Self": "/api/Spaces-1/deployments?skip=0&take=30",
"Template": "/api/Spaces-1/deployments{?skip,take,ids,projects,environments,tenants,channels,taskState,partialName}",
"Page.All": "/api/Spaces-1/deployments?skip=0&take=2147483647",
"Page.Current": "/api/Spaces-1/deployments?skip=0&take=30",
"Page.Last": "/api/Spaces-1/deployments?skip=0&take=30"
}
```

</details>

<details>
<summary>Machine response data</summary>

```json showLineNumbers
{
  "Id": "Machines-4",
  "EnvironmentIds": [
    "Environments-1"
  ],
  "Roles": [
    "test-server"
  ],
  "TenantedDeploymentParticipation": "Untenanted",
  "TenantIds": [],
  "TenantTags": [],
  "SpaceId": "Spaces-1",
  "Name": "ECS Instance Dev",
  "Thumbprint": null,
  "Uri": null,
  "IsDisabled": false,
  "MachinePolicyId": "MachinePolicies-1",
  "HealthStatus": "Unhealthy",
  "HasLatestCalamari": true,
  "StatusSummary": "There was a problem communicating with this machine (last checked: Tuesday, 27 August 2024 5:39:57 PM +00:00)",
  "IsInProcess": false,
  "Endpoint": {
    "CommunicationStyle": "StepPackage",
    "DeploymentTargetTypeId": "aws-ecs-target",
    "StepPackageId": "aws-ecs-target",
    "StepPackageVersion": "3.0.1",
    "LastSavedStepPackageVersion": "3.0.1",
    "Inputs": {
      "clusterName": " team-isaac",
      "region": "eu-west-1",
      "authentication": {
        "credentials": {
          "type": "account",
          "account": "Accounts-1"
        },
        "role": {
          "type": "noAssumedRole"
        }
      }
    },
    "DefaultWorkerPoolId": "",
    "Id": null,
    "LastModifiedOn": null,
    "LastModifiedBy": null,
    "Links": {
      "Logo": "/api/steps/deploymenttargets/aws-ecs-target/3.0.1/logo"
    }
  },
  "OperatingSystem": "Unknown",
  "ShellName": "Unknown",
  "ShellVersion": "Unknown",
  "Architecture": "Unknown",
  "Slug": "ecs-instance-dev",
  "SkipInitialHealthCheck": false,
  "Links": {
    "Self": "/api/Spaces-1/machines/Machines-4",
    "Connection": "/api/Spaces-1/machines/Machines-4/connection",
    "TasksTemplate": "/api/Spaces-1/machines/Machines-4/tasks{?skip,take,type}",
    "SinglyScopedVariableDetails": "/api/Spaces-1/machines/Machines-4/singlyScopedVariableDetails"
  }
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary>Space entity</summary>

```json showLineNumbers
{
  "identifier": "Spaces-1",
  "title": "Default",
  "icon": null,
  "blueprint": "octopusSpace",
  "team": [],
  "properties": {
    "url": "https://testport.octopus.app/app#/Spaces-1",
    "description": null
  },
  "relations": {},
  "createdAt": "2024-08-22T14:27:34.746Z",
  "createdBy": "zhOWp1YybWfY12bAxNz3d1ByX18iA1yT",
  "updatedAt": "2024-08-22T14:27:34.746Z",
  "updatedBy": "zhOWp1YybWfY12bAxNz3d1ByX18iA1yT"
}
```

</details>

<details>
<summary>Project entity</summary>

```json showLineNumbers
{
  "identifier": "Projects-1",
  "title": "Sample Project",
  "icon": null,
  "blueprint": "octopusProject",
  "team": [],
  "properties": {
    "slug": null,
    "url": "https://testport.octopus.app/app#/Spaces-1/projects/Projects-1",
    "description": "Explore how to automate your deployments with Octopus Deploy.\n\nEdit the custom script step, tweak the variables, and run your first deployment. Experiment and make it your own!",
    "isDisabled": false,
    "tenantedDeploymentMode": "Untenanted"
  },
  "relations": {},
  "createdAt": "2024-08-22T14:27:37.814Z",
  "createdBy": "zhOWp1YybWfY12bAxNz3d1ByX18iA1yT",
  "updatedAt": "2024-08-22T14:27:37.814Z",
  "updatedBy": "zhOWp1YybWfY12bAxNz3d1ByX18iA1yT"
}
```

</details>

<details>
<summary>Release entity</summary>

```json showLineNumbers
{
  "identifier": "Releases-44",
  "title": "Projects-41(0.0.2)",
  "icon": null,
  "blueprint": "octopusRelease",
  "team": [],
  "properties": {
    "version": "0.0.2",
    "assembledDate": "2024-08-21T16:17:46.750+00:00",
    "channelId": "Channels-41",
    "releaseNotes": null,
    "url": "https://testport.octopus.app/app#/Spaces-1/releases/Releases-44"
  },
  "relations": {},
  "createdAt": "2024-08-22T14:27:41.697Z",
  "createdBy": "zhOWp1YybWfY12bAxNz3d1ByX18iA1yT",
  "updatedAt": "2024-08-22T14:27:41.697Z",
  "updatedBy": "zhOWp1YybWfY12bAxNz3d1ByX18iA1yT"
}
```

</details>

<details>
<summary>Deployment entity</summary>

```json showLineNumbers
{
  "identifier": "Deployments-1",
  "title": "Deploy to Development",
  "icon": null,
  "blueprint": "octopusDeployment",
  "team": [],
  "properties": {
    "createdAt": "2024-08-02T05:07:42.445+00:00",
    "deployedBy": "System",
    "taskId": "ServerTasks-11599",
    "failureEncountered": false,
    "comments": null,
    "url": "https://testport.octopus.app/app#/Spaces-1/deployments/Deployments-1"
  },
  "relations": {},
  "createdAt": "2024-08-22T14:27:45.276Z",
  "createdBy": "zhOWp1YybWfY12bAxNz3d1ByX18iA1yT",
  "updatedAt": "2024-08-22T14:27:45.276Z",
  "updatedBy": "zhOWp1YybWfY12bAxNz3d1ByX18iA1yT"
}
```

</details>

<details>
<summary>Machine entity</summary>

```json showLineNumbers
{
  "identifier": "Machines-4",
  "title": "ECS Instance Dev",
  "icon": null,
  "blueprint": "octopusMachine",
  "team": [],
  "properties": {
    "roles": [
      "test-server"
    ],
    "status": "Unhealthy",
    "url": "https://testport.octopus.app/app#/Spaces-1/infrastructure/machines/Machines-4/settings",
    "isDisabled": false,
    "operatingSystem": "Unknown",
    "architecture": "Unknown",
    "statusSummary": "There was a problem communicating with this machine (last checked: Monday, 26 August 2024 5:40:16 PM +00:00)",
    "endpointType": "aws-ecs-target",
    "communicationStyle": "StepPackage"
  },
  "relations": {},
  "createdAt": "2024-08-22T14:27:53.944Z",
  "createdBy": "zhOWp1YybWfY12bAxNz3d1ByX18iA1yT",
  "updatedAt": "2024-08-27T12:29:12.362Z",
  "updatedBy": "zhOWp1YybWfY12bAxNz3d1ByX18iA1yT"
}
```

</details>

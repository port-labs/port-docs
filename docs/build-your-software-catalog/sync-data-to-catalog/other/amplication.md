import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./_amplication-docker-parameters.mdx"
import AdvancedConfig from '../../../generalTemplates/\_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"


# Amplication

Port's Amplication integration allows you to model [Amplication](https://amplication.com) resources in your software catalog, from which you can then automate code generation using predefined templates, ensuring standardization for resource creation.

## Overview

This integration allows you to:

- Automate scaffolding of new services using Amplication’s templates.
- Ensure standardization by enforcing predefined golden paths for resource creation.
- Leverage code generation to accelerate development and maintain consistency.
- Poll Amplication for templates, resources, and outdated version alerts to keep you in sync with your Amplication resources.

### Supported Resources

The resources that can be ingested from Amplication into Port are listed below:

- [`Template`](https://docs.amplication.com/day-zero/live-templates)
- [`Resource`](https://docs.amplication.com/day-one/overview)
- [`Outdated Version Alert`](https://docs.amplication.com/day-two/automated-alerts)

## Prerequisites

### Generate an Amplication API token

1. Navigate to `https://app.amplication.com/` and go to the settings tab of your workspace.

2. Navigate to the `API Tokens` section and generate a new token.

3. Copy the token and save it in a secure location.

### Amplication host URL

Your Amplication host URL should be `https://server.amplication.com/graphql`.

## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2>Prerequisites</h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Amplication" />

<PortApiRegionTip/>

</TabItem>

<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-amplication-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `AMPLICATION_HOST` and `AMPLICATION_TOKEN`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-amplication-integration
  type: amplication
  eventListener:
    type: POLLING
  config:
  // highlight-start
    amplicationHost: AMPLICATION_HOST
  // highlight-end
  secrets:
  // highlight-next-line
    amplicationToken: AMPLICATION_TOKEN
```
<br/>

2. Install the `my-ocean-amplication-integration` ArgoCD Application by creating the following `my-ocean-amplication-integration.yaml` manifest:
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
  name: my-ocean-amplication-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-amplication-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-amplication-integration/values.yaml
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
kubectl apply -f my-ocean-amplication-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.
Note the parameters specific to this integration, they are last in the table.

| Parameter                               | Description                                                                                                                                            | Required |
|-----------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                         | Your port client id                                                                                                                                    | ✅        |
| `port.clientSecret`                     | Your port client secret                                                                                                                                | ✅        |
| `port.baseUrl`                          | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                | ✅        |
| `integration.identifier`                | Change the identifier to describe your integration                                                                                                     | ✅        |
| `integration.type`                      | The integration type                                                                                                                                   | ✅        |
| `integration.eventListener.type`        | The event listener type                                                                                                                                | ✅        |
| `scheduledResyncInterval`               | The number of minutes between each resync                                                                                                              | ❌        |
| `initializePortResources`               | Default true, When set to true the integration will create default blueprints and the port App config Mapping                                          | ❌        |
| `integration.secrets.amplicationToken`  | The Amplication API [token](https://docs.amplication.com/docs/api-reference/authentication).                                                           | ✅        |
| `integration.config.amplicationHost`    | The Amplication host. For example https://server.amplication.com/graphql                                                                               | ✅        |


<br/>

<AdvancedConfig/>

<h3>Event listener</h3>

The integration uses polling to pull the configuration from Port every minute and check it for changes. If there is a change, a resync will occur.

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the Amplication integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option
:::

 <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `amplication-integration.yml` workflow file:

```yaml showLineNumbers
name: Amplication Exporter Workflow

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
          type: 'amplication'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            amplication_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__AMPLICATION_TOKEN }}
            amplication_host: ${{ secrets.OCEAN__INTEGRATION__CONFIG__AMPLICATION_HOST }}
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

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Amplication Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__AMPLICATION_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__AMPLICATION_TOKEN'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__AMPLICATION_HOST', variable: 'OCEAN__INTEGRATION__CONFIG__AMPLICATION_HOST'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="amplication"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__AMPLICATION_TOKEN=$OCEAN__INTEGRATION__CONFIG__AMPLICATION_TOKEN \
                                -e OCEAN__INTEGRATION__CONFIG__AMPLICATION_HOST=$OCEAN__INTEGRATION__CONFIG__AMPLICATION_HOST \
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

  <AzurePremise  />

<DockerParameters />

<br/>

Here is an example for `amplication-integration.yml` pipeline file:

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
    integration_type="amplication"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
       -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
      -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
      -e OCEAN__INTEGRATION__CONFIG__AMPLICATION_TOKEN=$(OCEAN__INTEGRATION__CONFIG__AMPLICATION_TOKEN) \
      -e OCEAN__INTEGRATION__CONFIG__AMPLICATION_HOST=$(OCEAN__INTEGRATION__CONFIG__AMPLICATION_HOST) \
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
  INTEGRATION_TYPE: amplication
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
        -e OCEAN__INTEGRATION__CONFIG__AMPLICATION_TOKEN=$OCEAN__INTEGRATION__CONFIG__AMPLICATION_TOKEN \
        -e OCEAN__INTEGRATION__CONFIG__AMPLICATION_HOST=$OCEAN__INTEGRATION__CONFIG__AMPLICATION_HOST \
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

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from Amplication's API into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
resources:
- kind: amplication_template
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: .name
        blueprint: '"AmplicationTemplate"'
        properties:
          description: .description
          project: .project.name
          project_id: .project.id
          blueprint: .blueprint.name
          blueprint_id: .blueprint.id
- kind: amplication_resource
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: .name
        blueprint: '"AmplicationResource"'
        properties:
          description: .description
          project: .project.name
          project_id: .project.id
          blueprint: .blueprint.name
          blueprint_id: .blueprint.id
          git_organization: .gitRepository.gitOrganization.provider
          git_repository: .gitRepository.gitOrganization.name + "/" + .gitRepository.name
        relations:
          template: if .serviceTemplate != null then .serviceTemplate.id else null end
- kind: amplication_alert
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: 'if .block != null then .type + ": " + .block.displayName else .type end'
        blueprint: '"AmplicationAlert"'
        properties:
          block_id: if .block != null then .block.id else null end
          block_displayName: if .block != null then .block.displayName else null end
          type: .type
          outdatedVersion: .outdatedVersion
          latestVersion: .latestVersion
          status: .status
        relations:
          resource: .resourceId
```

</details>



## Examples

Examples of blueprints and the relevant integration configurations:

### Templates

<details>
<summary>Template Blueprint</summary>

```json showLineNumbers
{
  "identifier": "AmplicationTemplate",
  "description": "Blueprint for templates coming from Amplication's app",
  "title": "Amplication Template",
  "icon": "Amplication",
  "schema": {
    "properties": {
      "name": {
        "type": "string",
        "title": "Name"
      },
      "description": {
        "type": "string",
        "title": "Description"
      },
      "project": {
        "type": "string",
        "title": "Project"
      },
      "project_id": {
        "type": "string",
        "title": "Project ID"
      },
      "blueprint": {
        "type": "string",
        "title": "Blueprint"
      },
      "blueprint_id": {
        "type": "string",
        "title": "Blueprint ID"
      }
    },
    "required": [
      "name",
      "project_id",
      "project"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {
    "resource_count": {
      "title": "Resource Count",
      "icon": "Amplication",
      "type": "number",
      "description": "Number of resources created from this template",
      "target": "AmplicationResource",
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    }
  },
  "relations": {}
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: True
resources:
  - kind: amplication_template
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"AmplicationTemplate"'
          properties:
            name: .name
            description: .description
            project: .project.name
            project_id: .project.id
            blueprint: .blueprint.name
            blueprint_id: .blueprint.id
```

</details>


### Resources

<details>
<summary>Resource blueprint</summary>

```json showLineNumbers
{
  "identifier": "AmplicationResource",
  "description": "Blueprint for resources coming from Amplication's app",
  "title": "Amplication Resource",
  "icon": "Amplication",
  "schema": {
    "properties": {
      "name": {
        "type": "string",
        "title": "Name"
      },
      "description": {
        "type": "string",
        "title": "Description"
      },
      "project": {
        "type": "string",
        "title": "Project"
      },
      "project_id": {
        "type": "string",
        "title": "Project ID"
      },
      "git_organization": {
        "icon": "Git",
        "type": "string",
        "title": "Git Organization"
      },
      "git_repository": {
        "icon": "Git",
        "type": "string",
        "title": "Git Repository"
      },
      "blueprint": {
        "type": "string",
        "title": "Blueprint"
      },
      "blueprint_id": {
        "type": "string",
        "title": "Blueprint ID"
      }
    },
    "required": [
      "name",
      "project",
      "project_id"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {
    "new_alerts_count": {
      "title": "Alerts Count",
      "icon": "Alert",
      "type": "number",
      "description": "Number of new outdated version alerts this resource has",
      "target": "AmplicationAlert",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "status",
            "operator": "=",
            "value": "New"
          }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    }
  },
  "relations": {
    "template": {
      "target": "AmplicationTemplate",
      "title": "Template",
      "description": "The template of this resource",
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
createMissingRelatedEntities: True
resources:
  - kind: amplication_resource
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"AmplicationResource"'
          properties:
            name: .name
            description: .description
            project: .project.name
            project_id: .project.id
            blueprint: .blueprint.name
            blueprint_id: .blueprint.id
            git_organization: .gitRepository.gitOrganization.provider
            git_repository: '.gitRepository.gitOrganization.name + "/" + .gitRepository.name'
          relations:
            template: if .serviceTemplate != null and .serviceTemplate != "None" then .serviceTemplate.id else null end
```

</details>


### Outdated Version Alerts

<details>
<summary>Outdated Version Alert blueprint</summary>

```json showLineNumbers
{
  "identifier": "AmplicationAlert",
  "description": "Blueprint for outdated version alerts coming from Amplication's app",
  "title": "Amplication Version Alert",
  "icon": "Amplication",
  "schema": {
    "properties": {
      "block_id": {
        "type": "string",
        "title": "Block ID"
      },
      "block_displayName": {
        "type": "string",
        "title": "Plugin Name"
      },
      "type": {
        "type": "string",
        "title": "Type",
        "default": "Other",
        "enum": [
          "PluginVersion",
          "TemplateVersion",
          "CodeEngineVersion",
          "Other"
        ],
        "enumColors": {
          "PluginVersion": "blue",
          "TemplateVersion": "orange",
          "CodeEngineVersion": "purple",
          "Other": "bronze"
        }
      },
      "outdatedVersion": {
        "type": "string",
        "title": "Outdated Version"
      },
      "latestVersion": {
        "type": "string",
        "title": "Latest Version"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "default": "New",
        "enum": [
          "New",
          "Resolved",
          "Ignored",
          "Canceled"
        ],
        "enumColors": {
          "New": "turquoise",
          "Resolved": "red",
          "Ignored": "green",
          "Canceled": "blue"
        }
      }
    },
    "required": [
      "block_id",
      "block_displayName",
      "type",
      "outdatedVersion",
      "latestVersion",
      "status"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "resource": {
      "title": "Resource",
      "target": "AmplicationResource",
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
createMissingRelatedEntities: True
resources:
  - kind: amplication_alert
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: '.type + ": " + .block.displayName'
          blueprint: '"AmplicationAlert"'
          properties:
            block_id: .block.id
            block_displayName: .block.displayName
            type: .type
            outdatedVersion: .outdatedVersion
            latestVersion: .latestVersion
            status: .status
          relations:
            resource: .resourceId
```

</details>

## Let's Test It

This section includes a sample response data from Amplication. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Amplication:

<details>
<summary>Template response data</summary>

```json showLineNumbers
{
  "id": "cm6zln01a0209utjtlorazri1",
  "name": "Port Node.js Template",
  "description": "Template created from an existing resource",
  "resourceType": "ServiceTemplate",
  "project": {
    "id": "cm6zlfk2o01liutjtdw8xj7f0",
    "name": "Port Integration"
  },
  "blueprint": {
    "id": "cm6gb3j00000p14gz2n11otq4",
    "name": "Node.js Service (Amplication's Standard)"
  }
}
```

</details>

<details>
<summary>Resource response data</summary>

```json showLineNumbers
{
  "id": "cm6gr9t4s0000jx5t8l8prvik",
  "name": "Sample Resource Name",
  "description": "General description for the resource",
  "resourceType": "Service",
  "project": {
    "id": "cm6gb3j0a000q14gzlq9m7h1o",
    "name": "Sample Project"
  },
  "blueprint": {
    "id": "cm6gb3j00000p14gz2n11otq4",
    "name": "Node.js Service (Amplication's Standard)"
  },
  "serviceTemplate": null,
  "gitRepository": {
    "name": "examplerepo",
    "gitOrganization": {
      "name": "examplecompany",
      "provider": "Github"
    }
  }
}
```

</details>

<details>
<summary>Alert response data</summary>

```json showLineNumbers
{
  "id": "cm71nzqfh00lftp1dh9bslk0n",
  "createdAt": "2025-02-12T08:44:11.022Z",
  "updatedAt": "2025-02-12T08:44:11.022Z",
  "resourceId": "cm71nzdyn00kltp1dyoe4abpu",
  "blockId": "cm67mln9k004k55uul3j4ywww",
  "block": {
    "id": "cm67mln9k004k55uul3j4ywww",
    "displayName": "Resource Template Version"
  },
  "type": "TemplateVersion",
  "outdatedVersion": "0.1.0",
  "latestVersion": "0.2.0",
  "status": "New"
}
```

</details>


### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary>Template entity in Port</summary>

```json showLineNumbers
{
  "identifier": "cm6zln01a0209utjtlorazri1",
  "title": "Port Node.js Template",
  "team": [],
  "properties": {
    "name": "Port Node.js Template",
    "description": "Template created from an existing resource",
    "project": "Port Integration",
    "project_id": "cm6zlfk2o01liutjtdw8xj7f0",
    "blueprint": "Node.js Service (Amplication's Standard)",
    "blueprint_id": "cm6gb3j00000p14gz2n11otq4"
  },
  "relations": {},
  "icon": "Amplication"
}
```

</details>

<details>
<summary>Resource entity in Port</summary>

```json showLineNumbers
{
  "identifier": "cm6gr9t4s0000jx5t8l8prvik",
  "title": "Sample Resource Name",
  "team": [],
  "properties": {
    "name": "Sample Resource Name",
    "description": "General description for the resource",
    "project": "Sample Project",
    "project_id": "cm6gb3j0a000q14gzlq9m7h1o",
    "git_organization": "Github",
    "git_repository": "examplecompany/examplerepo",
    "blueprint": "Node.js Service (Amplication's Standard)",
    "blueprint_id": "cm6gb3j00000p14gz2n11otq4"
  },
  "relations": {},
  "icon": "Amplication"
}
```

</details>


<details>
<summary>Alert entity in Port</summary>

```json showLineNumbers
{
  "identifier": "cm71nzqfh00lftp1dh9bslk0n",
  "title": "TemplateVersion: Resource Template Version",
  "icon": "Amplication",
  "team": [],
  "properties": {
    "block_id": "cm67mln9k004k55uul3j4ywww",
    "block_displayName": "Resource Template Version",
    "type": "PluginVersion",
    "outdatedVersion": "0.1.0",
    "latestVersion": "0.2.0",
    "status": "New"
  },
  "relations": {
    "resource": "cm6gr9t4s0000jx5t8l8prvik"
  }
}
```

</details>

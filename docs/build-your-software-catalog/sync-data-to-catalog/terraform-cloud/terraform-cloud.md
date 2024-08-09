---
sidebar_position: 1
title: Terraform Cloud
description: Terraform integration in Port
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import DockerParameters from "./\_terraform_one_time_docker_parameters.mdx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"

# Terraform Cloud and Terraform Enterprise

The Terraform Cloud Integration for Port enables seamless import and synchronization of `organizations`, `projects`, `workspaces`, `runs`, and `state versions` from your Terraform infrastructure management into Port. This integration allows you to effectively monitor and manage your Terraform Cloud workspaces and runs within the Port platform.

An `Organization` is a shared space for one or more teams to collaborate on workspaces.

A `Project` in Terraform Cloud is a collection of infrastructure configurations, often corresponding to a code repository. It serves as the primary organizational unit, grouping related `workspaces`, `runs`, and `state versions` to manage and structure Terraform code for efficient deployment and collaboration.

A `Workspace` represents a workspace in Terraform cloud. A workspace is a logical environment where Terraform manages infrastructure, such as a set of cloud resources.

A `Run` represents an instance of Terraform operations (plan, apply, or destroy) executed within a workspace. Each run holds information about the operation status, duration, and other relevant metadata.

A `State Version` represents a versioned state file in Terraform. Each state version is immutable and represents the state of your managed infrastructure at a particular point in time. State versions are used to track the changes in your infrastructure and help with auditing, rollbacks, and historical analysis.


## Common use cases

- Synchronization of Infrastructure Management: Automatically synchronize workspace, run and state version data from Terraform Cloud into Port for centralized tracking and management.
- Monitoring Run Statuses: Keep track of run outcomes (success, failure, etc.) and durations, providing insights into the health and performance of your infrastructure management processes.
- Identify drifts between your Terraform configuration and what's effectively deployed in your Cloud.

## Terraform Enterprise (Self Hosted)

Port supports both Terraform Cloud and Terraform Enterprise versions (self hosted). The following data model and use cases are common for both integrations. 
If installing Port exporter for Terraform Enterprise, you will be required to specify your Terraform 's host URL by passing the following parameter to the installer: `integration.config.appHost` 


## Prerequisites

To install the integration, you need a Kubernetes cluster that the integration's container chart will be deployed to.

Please make sure that you have [`kubectl`](https://kubernetes.io/docs/tasks/tools/#kubectl) and [`helm`](https://helm.sh/) installed on your machine, and that your `kubectl` CLI is connected to the Kubernetes cluster where you plan to install the integration.

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

| Parameter                                | Description                                                                                                   | Required |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| `port.clientId`                          | Your Port client id                                                                                           | ✅       |
| `port.clientSecret`                      | Your Port client secret                                                                                       | ✅       |
| `port.baseUrl`                   | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                               | ✅       |
| `integration.identifier`                 | Change the identifier to describe your integration                                                            | ✅       |
| `integration.type`                       | The integration type                                                                                          | ✅       |
| `integration.eventListener.type`         | The event listener type                                                                                       | ✅       |
| `integration.config.terraformCloudHost` | Your Terraform host. For example https://app.terraform.io  token                                                                           | ✅       |
| `integration.config.terraformCloudToken` | The Terraform cloud API token                                                                           | ✅       |
| `integration.config.appHost`             | Your application's host url. Required when installing Terraform Enterprise (self hosted)                                                                                   | ❌       |
| `scheduledResyncInterval`                | The number of minutes between each resync                                                                     | ❌       |
| `initializePortResources`                | When set to true the integration will create default blueprints and the port App config Mapping, defaults is true.  | ❌       |
| `sendRawDataExamples`                | Enable sending raw data examples from the third party API to port for testing and managingthe integration mapping, default is true.  | ❌       |

<br/>
<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm">
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install terraform port-labs/port-ocean \
  --set port.clientId="PORT_CLIENT_ID"  \
  --set port.clientSecret="PORT_CLIENT_SECRET"  \
  --set port.baseUrl="https://api.getport.io"  \
  --set initializePortResources=true  \
  --set sendRawDataExamples=true  \
  --set integration.identifier="my-terraform-cloud-integration"  \
  --set integration.type="terraform-cloud"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.secrets.terraformCloudHost="string" \
  --set integration.secrets.terraformCloudToken="string" 
```
<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-terraform-cloud-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for  `TERRAFORM_CLOUD_HOST` and `TERRAFORM_CLOUD_TOKEN`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-terraform-cloud-integration
  type: terraform-cloud
  eventListener:
    type: POLLING
  secrets:
  // highlight-start
    terraformCloudHost: TERRAFORM_CLOUD_HOST
    terraformCloudToken: TERRAFORM_CLOUD_TOKEN
  // highlight-end
```
<br/>

2. Install the `my-ocean-terraform-cloud-integration` ArgoCD Application by creating the following `my-ocean-terraform-cloud-integration.yaml` manifest:
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
  name: my-ocean-terraform-cloud-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-terraform-cloud-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-terraform-cloud-integration/values.yaml
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
kubectl apply -f my-ocean-terraform-cloud-integration.yaml
```
</TabItem>
</Tabs>

<h3>Event listener</h3>

The integration uses polling to pull the configuration from Port every minute and check it for changes. If there is a change, a resync will occur.

</TabItem>

<TabItem value="one-time" label="Scheduled">

 <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Terraform cloud integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters/>

<br/>

Here is an example for `terraform-integration.yml` workflow file:

```yaml showLineNumbers
name: Terraform Exporter Workflow

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with: 
          type: "terraform-cloud"
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            terraform_cloud_host: ${{ secrets.OCEAN__INTEGRATION__CONFIG__TERRAFORM_CLOUD_HOST }}
            terraform_cloud_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__TERRAFORM_CLOUD_TOKEN }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Terraform  cloud integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Jenkins agent should be able to run docker commands.
:::
:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [Terraform Cloud Credentials](https://www.jenkins.io/doc/book/using/using-credentials/) of `Secret Text` type:

<DockerParameters/>

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Terraform Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__TERRAFORM_CLOUD_HOST', variable: 'OCEAN__INTEGRATION__CONFIG__TERRAFORM_CLOUD_HOST'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__TERRAFORM_CLOUD_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__TERRAFORM_CLOUD_TOKEN'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET')
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="terraform-cloud"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__TERRAFORM_COUD_HOST=$OCEAN__INTEGRATION__CONFIG__TERRAFORM_CLOUD_HOST \
                                -e OCEAN__INTEGRATION__CONFIG__TERRAFORM_COUD_TOKEN=$OCEAN__INTEGRATION__CONFIG__TERRAFORM_CLOUD_TOKEN \
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
This workflow will run the Terraform cloud integration once and then exit, this is useful for **scheduled** ingestion of data.

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
  INTEGRATION_TYPE: terraform
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
        -e OCEAN__INTEGRATION__CONFIG__TERRAFORM_CLOUD_HOST=$OCEAN__INTEGRATION__CONFIG__TERRAFORM_CLOUD_HOST \
        -e OCEAN__INTEGRATION__CONFIG__TERRAFORM_CLOUD_TOKEN=$OCEAN__INTEGRATION__CONFIG__TERRAFORM_CLOUD_TOKEN \
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

## Ingesting Terraform Cloud objects

The Terraform integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `Workspace` from Terraform cloud:

```yaml showLineNumbers
resources:
  - kind: workspace
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id
          title: .attributes.name
          blueprint: '"terrafomCloudWorkspace"'
          properties:
            organization: .relationships.organization.data.id
            createdAt: .attributes."created-at"
            updatedAt: .attributes."updated-at"
            terraformVersion: .attributes."terraform-version"
            locked: .attributes.locked
            executionMode: .attributes."execution-mode"
            resourceCount: .attributes."resource-count"
            latestChangeAt: .attributes."latest-change-at"
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Terraform's API events.

### Configuration structure

The integration configuration determines which resources will be queried from Terraform Cloud, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Terraform Cloud, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Organization`](https://developer.hashicorp.com/terraform/cloud-docs/api-docs/organizations)
- [`Project`](https://developer.hashicorp.com/terraform/cloud-docs/api-docs/projects)
- [`Workspace`](https://www.terraform.io/docs/cloud/api/workspaces.html)
- [`Run`](https://www.terraform.io/docs/cloud/api/runs.html)
- [`State Version`](https://developer.hashicorp.com/terraform/cloud-docs/api-docs/state-versions)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: workspace
      selector:
      ...
  ```

- The `kind` key is a specifier for a Terraform object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: run
        selector:
        ...
  ```

- The `port`, `entity` and the `mappings` keys are used to map the Terraform Cloud object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

```yaml showLineNumbers
resources:
  - kind: workspace
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id
          title: .attributes.name
          blueprint: '"terrafomCloudWorkspace"'
          properties:
            organization: .relationships.organization.data.id
            createdAt: .attributes."created-at"
            updatedAt: .attributes."updated-at"
            terraformVersion: .attributes."terraform-version"
            locked: .attributes.locked
            executionMode: .attributes."execution-mode"
            resourceCount: .attributes."resource-count"
            latestChangeAt: .attributes."latest-change-at"
          relations:
            currentStateVersion: .relationships."current-state-version".data.id
```

:::tip Blueprint key
Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
:::

### Ingest data into Port

To ingest Terraform Cloud objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Terraform Cloud.
3. Choose the **Ingest Data** option from the menu.
4. Select Terraform Cloud under the IaC category.
5. Add the contents of your [integration configuration](#configuration-structure) to the editor.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Organization

<details>
<summary>Organization blueprint</summary>

```json showLineNumbers
  {
    "identifier": "terraformCloudOrganization",
    "description": "This blueprint represents an organization in Terraform Cloud",
    "title": "Terraform Cloud Organization",
    "icon": "Terraform",
    "schema": {
      "properties": {
        "externalId": {
          "type": "string",
          "title": "External ID",
          "description": "The external ID of the organization"
        },
        "ownerEmail": {
          "type": "string",
          "title": "Owner Email",
          "description": "The email associated with the organization"
        },
        "collaboratorAuthPolicy": {
          "type": "string",
          "title": "Collaborator Authentication Policy",
          "description": "Policy for collaborator authentication"
        },
        "planExpired": {
          "type": "string",
          "title": "Plan Expired",
          "description": "Indicates if plan is expired"
        },
        "planExpiresAt": {
          "type": "string",
          "format": "date-time",
          "title": "Plan Expiry Date",
          "description": "The data and time which the plan expires"
        },
        "permissions": {
          "type": "object",
          "title": "Permissions",
          "description": "Permissions associated with the organization"
        },
        "samlEnabled": {
          "type": "boolean",
          "title": "SAML Enabled",
          "description": "Indicates if SAML is enabled for the organization"
        },
        "defaultExecutionMode": {
          "type": "string",
          "title": "Default Execution Mode",
          "description": "The default execution mode for the organization"
        }
      }
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
- kind: organization
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .id
        title: .attributes.name
        blueprint: '"terraformCloudOrganization"'
        properties:
          externalId: .attributes."external-id"
          ownerEmail: .attributes.email
          collaboratorAuthPolicy: .attributes."collaborator-auth-policy"
          planExpired: .attributes."plan-expired"
          planExpiresAt: .attributes."plan-expires-at"
          permissions: .attributes.permissions
          samlEnabled: .attributes."saml-enabled"
          defaultExecutionMode: .attributes."default-execution-mode"
```
</details>

### Project
<details>
<summary>Project blueprint</summary>

```json showLineNumbers
  {
    "identifier": "terraformCloudProject",
    "description": "This blueprint represents a project in Terraform Cloud",
    "title": "Terraform Cloud Project",
    "icon": "Terraform",
    "schema": {
      "properties": {
        "name": {
          "type": "string",
          "title": "Project Name",
          "description": "The name of the Terraform Cloud project"
        },
        "permissions": {
          "type": "object",
          "title": "Permissions",
          "description": "The permisssions on the project"
        }
      }
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
      "organization": {
        "title": "Terraform Cloud Organization",
        "target": "terraformCloudOrganization",
        "required": true,
        "many": false
      }
    }
  }
```
</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
- kind: project
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .id
        title: .attributes.name
        blueprint: '"terraformCloudProject"'
        properties:
          name: .attributes.name
          permissions: .attributes.permissions
        relations:
          organization: .relationships.organization.data.id
```
</details>

### Workspace

<details>
<summary>Workspace blueprint</summary>

```json showLineNumbers
  {
    "identifier": "terraformCloudWorkspace",
    "description": "This blueprint represents a workspace in Terraform Cloud",
    "title": "Terraform Cloud Workspace",
    "icon": "Terraform",
    "schema": {
      "properties": {
        "organization": {
          "type": "string",
          "title": "Organization",
          "description": "The organization within which the workspace belongs to"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time",
          "title": "Creation Time",
          "description": "The creation timestamp of the workspace"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time",
          "title": "Last Updated",
          "description": "The last update timestamp of the workspace"
        },
        "terraformVersion": {
          "type": "string",
          "title": "Terraform Cloud Version",
          "description": "Version of Terraform cloud used by the workspace"
        },
        "locked": {
          "type": "boolean",
          "title": "Locked Status",
          "description": "Indicates whether the workspace is locked"
        },
        "executionMode": {
          "type": "string",
          "title": "Execution Mode",
          "description": "The execution mode of the workspace"
        },
        "resourceCount": {
          "type": "number",
          "title": "Resource Count",
          "description": "Number of resources managed by the workspace"
        },
        "latestChangeAt": {
          "type": "string",
          "format": "date-time",
          "title": "Latest Change",
          "description": "Timestamp of the latest change in the workspace"
        },
        "tags": {
          "type": "array",
          "title": "Workspace Tags",
          "description": "Terraform workspace tags"
        }
      }
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
      "currentStateVersion": {
        "title": "Current State Version",
        "target": "terraformCloudStateVersion",
        "required": false,
        "many": false
      },
      "project": {
        "title": "Terraform Cloud Project",
        "target": "terraformCloudProject",
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
- kind: workspace
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .id
        title: .attributes.name
        blueprint: '"terraformCloudWorkspace"'
        properties:
          organization: .relationships.organization.data.id
          createdAt: .attributes."created-at"
          updatedAt: .attributes."updated-at"
          terraformVersion: .attributes."terraform-version"
          locked: .attributes.locked
          executionMode: .attributes."execution-mode"
          resourceCount: .attributes."resource-count"
          latestChangeAt: .attributes."latest-change-at"
          tags: .__tags
        relations:
          currentStateVersion: .relationships."current-state-version".data.id
          project: .relationships.project.data.id
```

</details>

### Run

<details>
<summary>Run blueprint</summary>

```json showLineNumbers
{
  "identifier": "terraformCloudRun",
  "description": "This blueprint represents a run in Terraform cloud",
  "title": "Terraform Cloud Run",
  "icon": "Terraform",
  "schema": {
    "properties": {
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Creation Time",
        "description": "The creation timestamp of the run"
      },
      "status": {
        "type": "string",
        "title": "Run Status",
        "description": "The current status of the run"
      },
      "hasChanges": {
        "type": "boolean",
        "title": "Has Changes",
        "description": "Indicates whether the run has changes"
      },
      "isDestroy": {
        "type": "boolean",
        "title": "Is Destroy",
        "description": "Indicates whether the run is a destroy operation"
      },
      "message": {
        "type": "string",
        "title": "Run Message",
        "description": "Message associated with the run"
      },
      "terraformVersion": {
        "type": "string",
        "title": "Terraform Cloud Version",
        "description": "Version of Terraform cloud used in the run"
      },
      "appliedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Applied Time",
        "description": "Timestamp when the run was applied"
      },
      "plannedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Planned Time",
        "description": "Timestamp when the run was planned"
      },
      "source": {
        "type": "string",
        "title": "Run Source",
        "description": "The source of the run initiation"
      }
    }
  },
  "relations": {
    "terraformCloudWorkspace": {
      "title": "Terraform Cloud Workspace",
      "target": "terraformCloudWorkspace",
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
- kind: run
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .id
        title: .attributes.message
        blueprint: '"terraformCloudRun"'
        properties:
          createdAt: .attributes."created-at"
          status: .attributes.status
          hasChanges: .attributes."has-changes"
          isDestroy: .attributes."is-destroy"
          message: .attributes.message
          terraformVersion: .attributes."terraform-version"
          appliedAt: .attributes."status-timestamps"."applied-at"
          plannedAt: .attributes."status-timestamps"."planned-at"
          source: .attributes.source
        relations:
          terraformCloudWorkspace: .relationships.workspace.data.id
```

</details>

### State Version

<details>
<summary>State Version blueprint</summary>

```json showLineNumbers
{
  "identifier": "terraformCloudStateVersion",
  "description": "This blueprint represents a version of a Terraform state version",
  "title": "Terraform Cloud State Versions",
  "icon": "Terraform",
  "schema": {
    "properties": {
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Creation Time",
        "description": "Timestamp when the state version was created"
      },
      "serial": {
        "type": "number",
        "title": "Serial Number",
        "description": "A unique identifier for this version within the workspace"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "description": "The current status of the state version (e.g., 'queued', 'finished')"
      },
      "size": {
        "type": "number",
        "title": "Size",
        "description": "The size of the resources"
      },
      "isResourcesProcessed": {
        "type": "boolean",
        "title": "Is Resources Processed",
        "description": "Whethere the resources has been processed"
      },
      "hostedStateDownloadUrl": {
        "type": "string",
        "title": "Download Url",
        "format": "url",
        "description": "Hosted state version download url "
      },
      "hostedJsonDownloadUrl": {
        "type": "string",
        "title": "Download Url",
        "format": "url",
        "description": "Url for downloading state version in json format"
      },
      "outputData": {
        "type": "array",
        "title": "Output",
        "description": "output returned from state version"
      },
      "vcsCommitUrl": {
        "type": "string",
        "title": "VCS Commit URL",
        "format": "url",
        "description": "URL of the VCS commit that triggered this state version"
      }
    }
  },
  "relations": {},
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {}
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
- kind: state-version
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .id
        title: .id
        blueprint: '"terraformCloudStateVersion"'
        properties:
          createdAt: .attributes."created-at"
          serial: .attributes.serial
          status: .attributes.status
          size: .attributes.size
          isResourcesProcessed: .attributes."resources-processed"
          hostedStateDownloadUrl: .attributes."hosted-state-download-url"
          hostedJsonDownloadUrl: .attributes."hosted-json-state-download-url"
          vcsCommitUrl: .attributes."vcs-commit-url"
          outputData: .__output
```

</details>

## Let's Test It

This section includes a sample response data from Terraform Cloud. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Terraform:

<details>
<summary> Organization response data</summary>

```json showLineNumbers
{
  "id":"example-org-484f07",
  "type":"organizations",
  "attributes":{
      "external-id":"org-S8Wo1fyUtpSFHbGQ",
      "created-at":"2023-12-19T14:16:20.491Z",
      "email":"example@getport.io",
      "session-timeout":"None",
      "session-remember":"None",
      "collaborator-auth-policy":"password",
      "plan-expired":false,
      "plan-expires-at":"2024-01-18T14:16:20.637Z",
      "plan-is-trial":true,
      "plan-is-enterprise":false,
      "plan-identifier":"free_standard",
      "cost-estimation-enabled":false,
      "managed-resource-count":5,
      "send-passing-statuses-for-untriggered-speculative-plans":false,
      "allow-force-delete-workspaces":false,
      "assessments-enforced":false,
      "is-in-degraded-mode":false,
      "default-execution-mode":"remote",
      "remaining-testable-count":5,
      "aggregated-commit-status-enabled":false,
      "name":"example-org-484f07",
      "permissions":{
        "can-update":true,
        "can-update-authentication":true,
        "can-destroy":true,
        "can-access-via-teams":true,
        "can-create-module":true,
        "can-create-team":false,
        "can-create-workspace":true,
        "can-manage-users":true,
        "can-manage-subscription":true,
        "can-manage-sso":true,
        "can-update-oauth":true,
        "can-update-sentinel":true,
        "can-update-ssh-keys":true,
        "can-update-api-token":true,
        "can-traverse":true,
        "can-view-usage":true,
        "can-start-trial":false,
        "can-update-agent-pools":true,
        "can-manage-tags":true,
        "can-manage-varsets":true,
        "can-read-varsets":true,
        "can-manage-public-providers":true,
        "can-create-provider":true,
        "can-manage-public-modules":true,
        "can-manage-custom-providers":true,
        "can-manage-run-tasks":true,
        "can-read-run-tasks":true,
        "can-create-project":true,
        "can-manage-assessments":true,
        "can-read-assessments":true,
        "can-view-explorer":true,
        "can-deploy-no-code-modules":false,
        "can-manage-no-code-modules":false,
        "can-use-new-pnp-activation-ui":true
      },
      "saml-enabled":false,
      "fair-run-queuing-enabled":false,
      "owners-team-saml-role-id":"None",
      "two-factor-conformant":true
  },
  "relationships":{
      "default-agent-pool":{
        "data":"None"
      },
      "meta":{
        "links":{
            "related":"/api/v2/organizations/example-org-484f07/meta"
        }
      },
      "oauth-tokens":{
        "links":{
            "related":"/api/v2/organizations/example-org-484f07/oauth-tokens"
        }
      },
      "authentication-token":{
        "links":{
            "related":"/api/v2/organizations/example-org-484f07/authentication-token"
        }
      },
      "entitlement-set":{
        "data":{
            "id":"org-S8Wo1fyUtpSFHbGQ",
            "type":"entitlement-sets"
        },
        "links":{
            "related":"/api/v2/organizations/example-org-484f07/entitlement-set"
        }
      },
      "subscription":{
        "data":{
            "id":"sub-THrhah4DkbD4etzy",
            "type":"subscriptions"
        },
        "links":{
            "related":"/api/v2/organizations/example-org-484f07/subscription"
        }
      },
      "default-project":{
        "data":{
            "id":"prj-d1JbKcLJBhwN66Vs",
            "type":"projects"
        },
        "links":{
            "related":"/api/v2/projects/prj-d1JbKcLJBhwN66Vs"
        }
      }
  },
  "links":{
      "self":"/api/v2/organizations/example-org-484f07"
  }
}
```
</details>


<details>
<summary> Workspace response data</summary>

```json showLineNumbers
{
  "id":"ws-DBJebej1fNCZomkr",
  "type":"workspaces",
  "attributes":{
      "allow-destroy-plan":true,
      "auto-apply":false,
      "auto-apply-run-trigger":false,
      "auto-destroy-activity-duration":"None",
      "auto-destroy-at":"None",
      "auto-destroy-status":"None",
      "created-at":"2023-12-12T12:43:36.192Z",
      "environment":"default",
      "locked":false,
      "name":"example-workspace-2",
      "queue-all-runs":false,
      "speculative-enabled":true,
      "structured-run-output-enabled":true,
      "terraform-version":"1.6.5",
      "working-directory":"",
      "global-remote-state":false,
      "updated-at":"2023-12-12T12:43:36.192Z",
      "resource-count":0,
      "apply-duration-average":"None",
      "plan-duration-average":"None",
      "policy-check-failures":"None",
      "run-failures":"None",
      "workspace-kpis-runs-count":"None",
      "latest-change-at":"2023-12-12T12:43:36.192Z",
      "operations":true,
      "execution-mode":"remote",
      "vcs-repo":"None",
      "vcs-repo-identifier":"None",
      "permissions":{
        "can-update":true,
        "can-destroy":true,
        "can-queue-run":true,
        "can-read-variable":true,
        "can-update-variable":true,
        "can-read-state-versions":true,
        "can-read-state-outputs":true,
        "can-create-state-versions":true,
        "can-queue-apply":true,
        "can-lock":true,
        "can-unlock":true,
        "can-force-unlock":true,
        "can-read-settings":true,
        "can-manage-tags":true,
        "can-manage-run-tasks":true,
        "can-force-delete":true,
        "can-manage-assessments":true,
        "can-manage-ephemeral-workspaces":false,
        "can-read-assessment-results":true,
        "can-queue-destroy":true
      },
      "actions":{
        "is-destroyable":true
      },
      "description":"None",
      "file-triggers-enabled":false,
      "trigger-prefixes":[
        
      ],
      "trigger-patterns":[
        
      ],
      "assessments-enabled":false,
      "last-assessment-result-at":"None",
      "source":"tfe-ui",
      "source-name":"None",
      "source-url":"None",
      "tag-names":[
        "foo",
        "bar"
      ],
      "setting-overwrites":{
        "execution-mode":false,
        "agent-pool":false
      }
  },
  "relationships":{
      "organization":{
        "data":{
            "id":"example-org-162af6",
            "type":"organizations"
        }
      },
      "current-run":{
        "data":"None"
      },
      "latest-run":{
        "data":"None"
      },
      "outputs":{
        "data":[
            
        ]
      },
      "remote-state-consumers":{
        "links":{
            "related":"/api/v2/workspaces/ws-DBJebej1fNCZomkr/relationships/remote-state-consumers"
        }
      },
      "current-state-version":{
        "data":"None"
      },
      "current-configuration-version":{
        "data":"None"
      },
      "agent-pool":{
        "data":"None"
      },
      "readme":{
        "data":"None"
      },
      "project":{
        "data":{
            "id":"prj-wnLLjhXa3XArrRFR",
            "type":"projects"
        }
      },
      "current-assessment-result":{
        "data":"None"
      },
      "vars":{
        "data":[
            
        ]
      }
  },
  "links":{
      "self":"/api/v2/organizations/example-org-162af6/workspaces/example-workspace-2",
      "self-html":"/app/example-org-162af6/workspaces/example-workspace-2"
  },
  "__tags":[
      {
        "id":"tag-moR1pPNpT2vowy55",
        "type":"tags",
        "attributes":{
            "name":"foo",
            "created-at":"2024-01-09T19:41:45.183Z",
            "instance-count":1
        },
        "relationships":{
            "organization":{
              "data":{
                  "id":"example-org-162af6",
                  "type":"organizations"
              }
            }
        }
      },
      {
        "id":"tag-PNyYYGibnxZcnVho",
        "type":"tags",
        "attributes":{
            "name":"bar",
            "created-at":"2024-01-09T19:41:45.197Z",
            "instance-count":1
        },
        "relationships":{
            "organization":{
              "data":{
                  "id":"example-org-162af6",
                  "type":"organizations"
              }
            }
        }
      }
  ]
}
```

</details>

<details>
<summary> Run response data</summary>

```json showLineNumbers
{
  "data": [
    {
      "id": "run-SFSeL9fg6Kibje8L",
      "type": "runs",
      "attributes": {
        "actions": {
          "is-cancelable": false,
          "is-confirmable": false,
          "is-discardable": false,
          "is-force-cancelable": false
        },
        "allow-config-generation": true,
        "allow-empty-apply": false,
        "auto-apply": false,
        "canceled-at": "None",
        "created-at": "2023-12-13T12:12:40.252Z",
        "has-changes": false,
        "is-destroy": false,
        "message": "just checking this out",
        "plan-only": false,
        "refresh": true,
        "refresh-only": false,
        "replace-addrs": [],
        "save-plan": false,
        "source": "tfe-ui",
        "status-timestamps": {
          "planned-at": "2023-12-13T12:12:54+00:00",
          "queuing-at": "2023-12-13T12:12:40+00:00",
          "planning-at": "2023-12-13T12:12:49+00:00",
          "plan-queued-at": "2023-12-13T12:12:40+00:00",
          "plan-queueable-at": "2023-12-13T12:12:40+00:00",
          "planned-and-finished-at": "2023-12-13T12:12:54+00:00"
        },
        "status": "planned_and_finished",
        "target-addrs": "None",
        "trigger-reason": "manual",
        "terraform-version": "1.6.5",
        "permissions": {
          "can-apply": true,
          "can-cancel": true,
          "can-comment": true,
          "can-discard": true,
          "can-force-execute": true,
          "can-force-cancel": true,
          "can-override-policy-check": true
        },
        "variables": []
      },
      "relationships": {
        "workspace": {
          "data": {
            "id": "ws-WWhD18B59v5ndTTP",
            "type": "workspaces"
          }
        },
        "apply": {
          "data": {
            "id": "apply-ToVWRgBe4mmGwTf7",
            "type": "applies"
          },
          "links": {
            "related": "/api/v2/runs/run-SFSeL9fg6Kibje8L/apply"
          }
        },
        "configuration-version": {
          "data": {
            "id": "cv-ompZmuF15X68njap",
            "type": "configuration-versions"
          },
          "links": {
            "related": "/api/v2/runs/run-SFSeL9fg6Kibje8L/configuration-version"
          }
        },
        "created-by": {
          "data": {
            "id": "user-Vg6uYxyhrQSHNrKU",
            "type": "users"
          },
          "links": {
            "related": "/api/v2/runs/run-SFSeL9fg6Kibje8L/created-by"
          }
        },
        "plan": {
          "data": {
            "id": "plan-3rXS4BMT8TEkdchh",
            "type": "plans"
          },
          "links": {
            "related": "/api/v2/runs/run-SFSeL9fg6Kibje8L/plan"
          }
        },
        "run-events": {
          "data": [
            {
              "id": "re-WgvYmckRJjafwU5R",
              "type": "run-events"
            },
            {
              "id": "re-46PfZixftNeifEG9",
              "type": "run-events"
            },
            {
              "id": "re-LCCwB2pQNPrGnveF",
              "type": "run-events"
            },
            {
              "id": "re-YoviSEov4cscqfi7",
              "type": "run-events"
            }
          ],
          "links": {
            "related": "/api/v2/runs/run-SFSeL9fg6Kibje8L/run-events"
          }
        },
        "task-stages": {
          "data": [],
          "links": {
            "related": "/api/v2/runs/run-SFSeL9fg6Kibje8L/task-stages"
          }
        },
        "policy-checks": {
          "data": [],
          "links": {
            "related": "/api/v2/runs/run-SFSeL9fg6Kibje8L/policy-checks"
          }
        },
        "comments": {
          "data": [],
          "links": {
            "related": "/api/v2/runs/run-SFSeL9fg6Kibje8L/comments"
          }
        }
      },
      "links": {
        "self": "/api/v2/runs/run-SFSeL9fg6Kibje8L"
      }
    }
  ]
}
```

</details>

<details>
<summary> State Version response data</summary>

```json showLineNumbers
{
  "id": "sv-wZEoyjPg1KYsjYZg",
  "type": "state-versions",
  "attributes": {
    "created-at": "2023-12-20T07:08:14.113Z",
    "size": 8554,
    "hosted-state-download-url": "https://app.terraform.io/api/state-versions/sv-wZEoyjPg1KYsjYZg/hosted_state",
    "hosted-json-state-download-url": "https://app.terraform.io/api/state-versions/sv-wZEoyjPg1KYsjYZg/hosted_json_state",
    "modules": {
      "root": {
        "random_string": 1,
        "aws_db_instance": 1,
        "aws_db_subnet_group": 1,
        "data.aws_availability_zones": 1
      },
      "root.vpc": {
        "aws_eip": 2,
        "aws_vpc": 1,
        "aws_route": 3,
        "aws_subnet": 4,
        "aws_nat_gateway": 2,
        "aws_route_table": 3,
        "aws_internet_gateway": 1,
        "aws_route_table_association": 4
      },
      "root.elb-http.elb": {
        "aws_elb": 1
      },
      "root.ec2-instances": {
        "aws_instance": 4,
        "data.aws_ami": 1
      },
      "root.lb-security-group.sg": {
        "aws_security_group": 1,
        "aws_security_group_rule": 6
      },
      "root.app-security-group.sg": {
        "aws_security_group": 1,
        "aws_security_group_rule": 6
      },
      "root.elb-http.elb-attachment": {
        "aws_elb_attachment": 4
      }
    },
    "providers": {
      "provider[\"registry.terraform.io/hashicorp/aws\"]": {
        "aws_eip": 2,
        "aws_elb": 1,
        "aws_vpc": 1,
        "aws_route": 3,
        "aws_subnet": 4,
        "aws_instance": 4,
        "data.aws_ami": 1,
        "aws_db_instance": 1,
        "aws_nat_gateway": 2,
        "aws_route_table": 3,
        "aws_elb_attachment": 4,
        "aws_security_group": 2,
        "aws_db_subnet_group": 1,
        "aws_internet_gateway": 1,
        "aws_security_group_rule": 12,
        "aws_route_table_association": 4,
        "data.aws_availability_zones": 1
      },
      "provider[\"registry.terraform.io/hashicorp/random\"]": {
        "random_string": 1
      }
    },
    "resources": [
      {
        "name": "available",
        "type": "data.aws_availability_zones",
        "count": 1,
        "module": "root",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "database",
        "type": "aws_db_instance",
        "count": 1,
        "module": "root",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "private",
        "type": "aws_db_subnet_group",
        "count": 1,
        "module": "root",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "lb_id",
        "type": "random_string",
        "count": 1,
        "module": "root",
        "provider": "provider[\"registry.terraform.io/hashicorp/random\"]",
        "index-keys": []
      },
      {
        "name": "this_name_prefix",
        "type": "aws_security_group",
        "count": 1,
        "module": "root.app_security_group.sg",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "egress_rules",
        "type": "aws_security_group_rule",
        "count": 1,
        "module": "root.app_security_group.sg",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "ingress_rules",
        "type": "aws_security_group_rule",
        "count": 4,
        "module": "root.app_security_group.sg",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "ingress_with_self",
        "type": "aws_security_group_rule",
        "count": 1,
        "module": "root.app_security_group.sg",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "amazon_linux",
        "type": "data.aws_ami",
        "count": 1,
        "module": "root.ec2_instances",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "app",
        "type": "aws_instance",
        "count": 4,
        "module": "root.ec2_instances",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "this",
        "type": "aws_elb",
        "count": 1,
        "module": "root.elb_http.elb",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "this",
        "type": "aws_elb_attachment",
        "count": 4,
        "module": "root.elb_http.elb_attachment",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "this_name_prefix",
        "type": "aws_security_group",
        "count": 1,
        "module": "root.lb_security_group.sg",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "egress_rules",
        "type": "aws_security_group_rule",
        "count": 1,
        "module": "root.lb_security_group.sg",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "ingress_rules",
        "type": "aws_security_group_rule",
        "count": 4,
        "module": "root.lb_security_group.sg",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "ingress_with_self",
        "type": "aws_security_group_rule",
        "count": 1,
        "module": "root.lb_security_group.sg",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "nat",
        "type": "aws_eip",
        "count": 2,
        "module": "root.vpc",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "this",
        "type": "aws_internet_gateway",
        "count": 1,
        "module": "root.vpc",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "this",
        "type": "aws_nat_gateway",
        "count": 2,
        "module": "root.vpc",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "private_nat_gateway",
        "type": "aws_route",
        "count": 2,
        "module": "root.vpc",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "public_internet_gateway",
        "type": "aws_route",
        "count": 1,
        "module": "root.vpc",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "private",
        "type": "aws_route_table",
        "count": 2,
        "module": "root.vpc",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "public",
        "type": "aws_route_table",
        "count": 1,
        "module": "root.vpc",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "private",
        "type": "aws_route_table_association",
        "count": 2,
        "module": "root.vpc",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "public",
        "type": "aws_route_table_association",
        "count": 2,
        "module": "root.vpc",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "private",
        "type": "aws_subnet",
        "count": 2,
        "module": "root.vpc",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "public",
        "type": "aws_subnet",
        "count": 2,
        "module": "root.vpc",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      },
      {
        "name": "this",
        "type": "aws_vpc",
        "count": 1,
        "module": "root.vpc",
        "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
        "index-keys": []
      }
    ],
    "resources-processed": true,
    "serial": 3,
    "state-version": 4,
    "status": "finalized",
    "terraform-version": "1.6.6",
    "vcs-commit-url": "None",
    "vcs-commit-sha": "None"
  },
  "relationships": {
    "run": {
      "data": {
        "id": "run-9XBzSuHzfgwTZNak",
        "type": "runs"
      }
    },
    "rollback-state-version": {
      "data": "None"
    },
    "created-by": {
      "data": {
        "id": "user-VGzYMVaTX6nVYZ3U",
        "type": "users"
      },
      "links": {
        "self": "/api/v2/users/user-VGzYMVaTX6nVYZ3U",
        "related": "/api/v2/runs/run-9XBzSuHzfgwTZNak/created-by"
      }
    },
    "workspace": {
      "data": {
        "id": "ws-pN259iR1J3cW8ivr",
        "type": "workspaces"
      }
    },
    "outputs": {
      "data": [
        {
          "id": "wsout-uJCPifEGM1fC5UF1",
          "type": "state-version-outputs"
        },
        {
          "id": "wsout-SD3QFXBkcK41c8Vq",
          "type": "state-version-outputs"
        },
        {
          "id": "wsout-ryDfZJ4dwxuqR5NU",
          "type": "state-version-outputs"
        },
        {
          "id": "wsout-5vnxsMuMaorwojVL",
          "type": "state-version-outputs"
        },
        {
          "id": "wsout-cP7abYGPeXpgJfrt",
          "type": "state-version-outputs"
        }
      ],
      "links": {
        "related": "/api/v2/state-versions/sv-wZEoyjPg1KYsjYZg/outputs"
      }
    }
  },
  "links": {
    "self": "/api/v2/state-versions/sv-wZEoyjPg1KYsjYZg"
  },
  "__output": [
    {
      "id": "wsout-syLHF4vVm1ELesRH",
      "type": "state-version-outputs",
      "attributes": {
        "name": "lb_url",
        "sensitive": false,
        "type": "string",
        "value": "http://lb-r4c-project-alpha-dev-81440499.eu-west-1.elb.amazonaws.com/",
        "detailed-type": "string"
      },
      "links": {
        "self": "/api/v2/state-version-outputs/wsout-syLHF4vVm1ELesRH"
      }
    },
    {
      "id": "wsout-yCuZCAT1MBrpW9rL",
      "type": "state-version-outputs",
      "attributes": {
        "name": "vpc_id",
        "sensitive": false,
        "type": "string",
        "value": "vpc-085a343aa3f06a9d7",
        "detailed-type": "string"
      },
      "links": {
        "self": "/api/v2/state-version-outputs/wsout-yCuZCAT1MBrpW9rL"
      }
    },
    {
      "id": "wsout-ujnf5q4ZS3LTEFmL",
      "type": "state-version-outputs",
      "attributes": {
        "name": "web_server_count",
        "sensitive": false,
        "type": "number",
        "value": 4,
        "detailed-type": "number"
      },
      "links": {
        "self": "/api/v2/state-version-outputs/wsout-ujnf5q4ZS3LTEFmL"
      }
    }
  ]
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> organization entity in Port</summary>

```json showLineNumbers
{
  "identifier": "example-org-484f07",
  "title": "example-org-484f07",
  "team": [],
  "properties": {
    "externalId": "org-S8Wo1fyUtpSFHbGQ",
    "collaboratorAuthPolicy": "password",
    "permissions": {
      "can-update": true,
      "can-update-authentication": true,
      "can-destroy": true,
      "can-access-via-teams": true,
      "can-create-module": true,
      "can-create-team": false,
      "can-create-workspace": true,
      "can-manage-users": true,
      "can-manage-subscription": true,
      "can-manage-sso": true,
      "can-update-oauth": true,
      "can-update-sentinel": true,
      "can-update-ssh-keys": true,
      "can-update-api-token": true,
      "can-traverse": true,
      "can-view-usage": true,
      "can-start-trial": false,
      "can-update-agent-pools": true,
      "can-manage-tags": true,
      "can-manage-varsets": true,
      "can-read-varsets": true,
      "can-manage-public-providers": true,
      "can-create-provider": true,
      "can-manage-public-modules": true,
      "can-manage-custom-providers": true,
      "can-manage-run-tasks": true,
      "can-read-run-tasks": true,
      "can-create-project": true,
      "can-manage-assessments": true,
      "can-read-assessments": true,
      "can-view-explorer": true,
      "can-deploy-no-code-modules": false,
      "can-manage-no-code-modules": false,
      "can-use-new-pnp-activation-ui": true
    },
    "samlEnabled": false,
    "defaultExecutionMode": "remote",
    "ownerEmail": "example@getport.io",
    "planExpired": "false",
    "planExpiresAt": "2024-01-18T14:16:20.637Z"
  },
  "relations": {},
  "icon": "Terraform"
}
```
</details>

<details>
<summary> project entity in Port</summary>

```json showLineNumbers
{
  "identifier": "prj-wnLLjhXa3XArrRFR",
  "title": "Default Project",
  "team": [],
  "properties": {
    "name": "Default Project",
    "permissions": {
      "can-read": true,
      "can-update": true,
      "can-destroy": true,
      "can-create-workspace": true,
      "can-move-workspace": true,
      "can-deploy-no-code-modules": true,
      "can-read-teams": true,
      "can-manage-teams": true
    },
    "organizationId": "example-org-162af6"
  },
  "relations": {},
  "icon": "Terraform"
}
```
</details>

<details>
<summary> workspace entity in Port</summary>

```json showLineNumbers
{
  "identifier": "ws-DBJebej1fNCZomkr",
  "title": "example-workspace-2",
  "team": [],
  "properties": {
    "createdAt": "2023-12-12T12:43:36.192Z",
    "updatedAt": "2023-12-12T12:43:36.192Z",
    "terraformVersion": "1.6.5",
    "locked": false,
    "executionMode": "remote",
    "resourceCount": 0,
    "latestChangeAt": "2023-12-12T12:43:36.192Z",
    "organization": "example-org-162af6",
    "tags": [
      {
        "id": "tag-moR1pPNpT2vowy55",
        "type": "tags",
        "attributes": {
          "name": "foo",
          "created-at": "2024-01-09T19:41:45.183Z",
          "instance-count": 1
        },
        "relationships": {
          "organization": {
            "data": {
              "id": "example-org-162af6",
              "type": "organizations"
            }
          }
        }
      },
      {
        "id": "tag-PNyYYGibnxZcnVho",
        "type": "tags",
        "attributes": {
          "name": "bar",
          "created-at": "2024-01-09T19:41:45.197Z",
          "instance-count": 1
        },
        "relationships": {
          "organization": {
            "data": {
              "id": "example-org-162af6",
              "type": "organizations"
            }
          }
        }
      }
    ]
  },
  "relations": {
    "project": "prj-wnLLjhXa3XArrRFR"
  },
  "icon": "Terraform"
}
```

</details>

<details>
<summary> Run entity in Port</summary>

```json showLineNumbers
{
  "identifier": "run-SFSeL9fg6Kibje8L",
  "title": "just checking this out",
  "blueprint": "terraformRun",
  "properties": {
    "runId": "run-SFSeL9fg6Kibje8L",
    "createdAt": "2021-08-16T21:50:58.726Z",
    "status": "planned_and_finished",
    "hasChanges": false,
    "isDestroy": false,
    "message": "just checking this out",
    "terraformVersion": "0.11.1",
    "appliedAt": null,
    "plannedAt": "2023-12-13T12:12:54+00:00",
    "source": "tfe-api"
  },
  "relations": {}
}
```

</details>

<details>
<summary> State Version in Port</summary>

```json showLineNumbers
{
  "identifier": "sv-wZEoyjPg1KYsjYZg",
  "title": "sv-wZEoyjPg1KYsjYZg",
  "team": [],
  "properties": {
    "createdAt": "2023-12-20T07:08:14.113Z",
    "serial": 3,
    "status": "finalized",
    "hostedStateDownloadUrl": "https://app.terraform.io/api/state-versions/sv-wZEoyjPg1KYsjYZg/hosted_state",
    "hostedJsonDownloadUrl": "https://app.terraform.io/api/state-versions/sv-wZEoyjPg1KYsjYZg/hosted_json_state",
    "outputData": [
      {
        "id": "wsout-syLHF4vVm1ELesRH",
        "type": "state-version-outputs",
        "attributes": {
          "name": "lb_url",
          "sensitive": false,
          "type": "string",
          "value": "http://lb-r4c-project-alpha-dev-81440499.eu-west-1.elb.amazonaws.com/",
          "detailed-type": "string"
        },
        "links": {
          "self": "/api/v2/state-version-outputs/wsout-syLHF4vVm1ELesRH"
        }
      },
      {
        "id": "wsout-yCuZCAT1MBrpW9rL",
        "type": "state-version-outputs",
        "attributes": {
          "name": "vpc_id",
          "sensitive": false,
          "type": "string",
          "value": "vpc-085a343aa3f06a9d7",
          "detailed-type": "string"
        },
        "links": {
          "self": "/api/v2/state-version-outputs/wsout-yCuZCAT1MBrpW9rL"
        }
      },
      {
        "id": "wsout-ujnf5q4ZS3LTEFmL",
        "type": "state-version-outputs",
        "attributes": {
          "name": "web_server_count",
          "sensitive": false,
          "type": "number",
          "value": 4,
          "detailed-type": "number"
        },
        "links": {
          "self": "/api/v2/state-version-outputs/wsout-ujnf5q4ZS3LTEFmL"
        }
      }
    ],
    "size": 8554,
    "isResourcesProcessed": true
  },
  "relations": {},
  "icon": "Terraform"
}
```

</details>

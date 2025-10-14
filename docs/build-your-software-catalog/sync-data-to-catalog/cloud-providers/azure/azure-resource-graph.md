---
sidebar_position: 5
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import CredentialsGuide from "/docs/build-your-software-catalog/custom-integration/api/\_template_docs/\_find_credentials.mdx";
import AzureAppRegistration from "./\_azure_app_registration_guide.mdx"
import DockerParameters from "./\_azure_docker_params.mdx"
import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Azure Resource Graph

Sync your Azure environment to Port at scale using Azure Resource Graph and Ocean framework. This integration is designed for high-volume data ingestion across multiple subscriptions, offering several key advantages:

- **Centralized Syncing**: Ingest resources from all your Azure subscriptions with a single deployment.
- **High-Speed Ingestion**: Leverage Azure Resource Graph to query and sync up to 5000 subscriptions simultaneously for maximum performance.
- **Customizable Mapping**: Take full control over which resource types are ingested and how they are mapped to your software catalog.

## Overview

This integration provides a robust solution for syncing your Azure resources to Port by leveraging our open-source [Ocean framework](https://ocean.port.io). It uses the Azure SDK to efficiently query the Azure Resource Graph API, ensuring high-performance data ingestion even in large-scale environments.

On each run, the integration performs a full synchronization, so your software catalog always reflects the current state of your Azure resources. You can use declarative YAML mapping to transform raw data and model it according to your software catalog's structure.

The integration is packaged as a Docker container and can be deployed in any environment that supports it, such as Kubernetes or your CI/CD pipeline. This gives you full control over its execution schedule and operational management.

## Supported resources

The integration syncs data from two main Azure Resource Graph tables:

- `Resources`: This table includes a wide array of Azure resources, such as virtual machines, storage accounts, network interfaces, and more. The integration syncs their properties, tags, and metadata.
- `ResourceContainers`: This table contains management groups, subscriptions, and resource groups, providing the hierarchical context for your Azure resources.

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration you get after installing the Azure integration.

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

  ```yaml showLineNumbers
resources:
  - kind: resource
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: '.id | gsub(" ";"_")'
          title: .name
          blueprint: '"azureCloudResources"'
          properties:
            tags: .tags
            type: .type
            location: .location
  - kind: resourceContainer
    selector:
      query: .type == "microsoft.resources/subscriptions"
    port:
      entity:
        mappings:
          identifier: '.id | gsub(" ";"_")'
          title: .name
          blueprint: '"azureSubscription"'
          properties:
            subscriptionId: .subscriptionId
            location: .location
  - kind: resourceContainer
    selector:
      query: .type == "microsoft.resources/subscriptions/resourcegroups"
    port:
      entity:
        mappings:
          identifier: '.id | gsub(" ";"_")'
          title: .name
          blueprint: '"azureResourceGroup"'
          properties:
            tags: .tags
            location: .location
          relations:
            subscription: '("/subscriptions/" + .subscriptionId) | gsub(" ";"_")'
  ```
</details>

## Setup

### Port setup

#### Port credentials

<CredentialsGuide />

### Azure setup

This integration requires the standard [Azure app registration](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app?tabs=certificate%2Cexpose-a-web-api) setup.

Keep the following credentials handy after setup:
- `AZURE_CLIENT_ID`: The client ID of the Azure service principal
- `AZURE_CLIENT_SECRET`: The client secret of the Azure service principal
- `AZURE_TENANT_ID`: The tenant ID of the Azure service principal

<AzureAppRegistration/>

## Installation

<Tabs groupId="installation-methods" queryString="installation-methods" defaultValue="helm">

<TabItem value="helm" label="Helm (Scheduled)" >

The Azure resource graph exporter is deployed using helm on kubernetes.

This way of deployment supports scheduled resyncs of resources from Azure to Port.

<h2> Prerequisites </h2>
- [Port API credentials](#port-credentials)
- [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0
- Azure App Registration Credentials

<h2> Installation </h2>

<IntegrationVersion integration="azure-resource-graph" />

Now that you have the Azure App Registration details, you can install the Azure exporter using Helm.

You should have the following information ready:

- Port API credentials, you can check out the [Port API documentation](#port-credentials).
	- `PORT_CLIENT_ID`
	- `PORT_CLIENT_SECRET`
- Azure Credentials:
	- `AZURE_CLIENT_ID`: The Application (client) ID from the Azure App Registration.
	- `AZURE_CLIENT_SECRET`: The Application (client) Secret from the Azure App Registration.
	- `AZURE_TENANT_ID`: The Directory (tenant) ID from the Azure App Registration.

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install azure port-labs/port-ocean \
  --set port.clientId="PORT_CLIENT_ID"  \
  --set port.clientSecret="PORT_CLIENT_SECRET"  \
  --set port.baseUrl="https://api.getport.io"  \
  --set initializePortResources=true  \
  --set sendRawDataExamples=true  \
  --set scheduledResyncInterval=1440 \
  --set integration.type="azure-rg"  \
  --set integration.identifier="azure-resource-graph"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.config.azureClientId="<AZURE_CLIENT_ID>"  \
  --set integration.config.azureClientSecret="<AZURE_CLIENT_SECRET>" \
  --set integration.config.azureTenantId="<AZURE_TENANT_ID>"
```

<PortApiRegionTip/>

</TabItem>

<TabItem value="ci" label="CI/CD (Scheduled)">

<Tabs groupId="ci-methods" defaultValue="azureDevOps" queryString="ci-methods">

<TabItem value="azureDevOps" label="Azure DevOps">

The Azure exporter is deployed using Azure DevOps pipline, which supports scheduled resyncs of resources from Azure to Port.

<h2> Prerequisites </h2>

- [Port API credentials](#port-credentials)
- Access to an Azure DevOps project with permission to configure pipelines and secrets.
- Azure App Registration Credentials

<h2> Installation </h2>

Now that you have the Azure App Registration details, you can set up the Azure exporter using an Azure DevOps pipeline.

Make sure to configure the following [secret variables](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/set-secret-variables?view=azure-devops&tabs=yaml%2Cbash) in a variable group:

- Port API credentials, you can check out the [Port API documentation](#port-credentials).
	- `PORT_CLIENT_ID`
	- `PORT_CLIENT_SECRET`
- Azure Credentials:
	- `OCEAN__SECRET__AZURE_CLIENT_ID`: The Application (client) ID from the Azure App Registration.
	- `OCEAN__SECRET__AZURE_CLIENT_SECRET`: The Application (client) Secret from the Azure App Registration.
	- `OCEAN__SECRET__AZURE_TENANT_ID`: The Directory (tenant) ID from the Azure App Registration.

Here is an example for `azure-pipeline-integration.yml` workflow file:  
Make sure to change the highlighted line to your variable group's name.

<details>
<summary><b>Azure pipline integration (Click to expand)</b></summary>

```yaml showLineNumbers
name: Azure Resource Graph Exporter Pipeline

trigger: none

schedules:
  - cron: "0 */4 * * *"
    displayName: Every 4 Hours
    branches:
      include:
        - main
    always: true

variables:
  # highlight-start
  - group: port-azure-exporter-secrets  # Contains the secrets used below
    # highlight-end

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: Bash@3
    displayName: 'Run Ocean Sail (Azure-RG)'
    inputs:
      targetType: 'inline'
      script: |
        set -euo pipefail

        echo "Building .env file for Ocean Sail..."

        echo "OCEAN__PORT__CLIENT_ID=$(PORT_CLIENT_ID)" > .sail-env
        echo "OCEAN__PORT__CLIENT_SECRET=$(PORT_CLIENT_SECRET)" >> .sail-env
        echo "OCEAN__PORT__BASE_URL=https://api.getport.io" >> .sail-env

        echo "OCEAN__EVENT_LISTENER={\"type\":\"ONCE\"}" >> .sail-env
        echo "OCEAN__INITIALIZE_PORT_RESOURCES=true" >> .sail-env

        echo "OCEAN__INTEGRATION__CONFIG__AZURE_CLIENT_ID=$(OCEAN__SECRET__AZURE_CLIENT_ID)" >> .sail-env
        echo "OCEAN__INTEGRATION__CONFIG__AZURE_CLIENT_SECRET=$(OCEAN__SECRET__AZURE_CLIENT_SECRET)" >> .sail-env
        echo "OCEAN__INTEGRATION__CONFIG__AZURE_TENANT_ID=$(OCEAN__SECRET__AZURE_TENANT_ID)" >> .sail-env

        echo "Running Ocean Sail container..."
        docker run -i --rm \
          --platform=linux/amd64 \
          --env-file .sail-env \
          ghcr.io/port-labs/port-ocean-azure-rg:latest

  - task: Bash@3
    displayName: 'Clean up .env file'
    condition: always()
    inputs:
      targetType: 'inline'
      script: |
        rm -f .sail-env
```

</details>

</TabItem>

<TabItem value="github" label="GitHub Actions">

The Azure exporter is deployed using Github Actions, which supports scheduled resyncs of resources from Azure to Port.

- [Port API credentials](#port-credentials)
- Azure App Registration Credentials

<h2> Installation </h2>

Now that you have the Azure App Registration details, you can set up the Azure exporter using Github Actions.

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

- Port API credentials, you can check out the [Port API documentation](#port-credentials).
	- `PORT_CLIENT_ID`
	- `PORT_CLIENT_SECRET`
- Azure Credentials:
	- `OCEAN__SECRET__AZURE_CLIENT_ID`: The Application (client) ID from the Azure App Registration.
	- `OCEAN__SECRET__AZURE_CLIENT_SECRET`: The Application (client) Secret from the Azure App Registration.
	- `OCEAN__SECRET__AZURE_TENANT_ID`: The Directory (tenant) ID from the Azure App Registration.

<DockerParameters />

<br/>

Here is an example for `azure-rg-integration.yml` workflow file:

<details>
<summary><b>GitHub Action integration (Click to expand)</b></summary>

		```yaml showLineNumbers
		name: Azure Resource Graph Exporter Workflow

		on:
		workflow_dispatch:
		schedule:
			- cron: '0 */4 * * *' 

		jobs:
		run-integration:
			runs-on: ubuntu-latest
			steps:
			- name: Run azure-rg Integration
				uses: port-labs/ocean-sail@v1
				with:
				type: azure-rg
				port_client_id: ${{ secrets.PORT_CLIENT_ID }}
				port_client_secret: ${{ secrets.PORT_CLIENT_SECRET }}
				port_base_url: "https://api.getport.io"
				config: |
					azure_client_id: ${{ secrets.OCEAN__SECRET__AZURE_CLIENT_ID }}
					azure_client_secret: ${{ secrets.OCEAN__SECRET__AZURE_CLIENT_SECRET }}
					azure_tenant_id: ${{ secrets.OCEAN__SECRET__AZURE_TENANT_ID }}
		```
</details>

</TabItem>

<TabItem value="argocd" label="ArgoCD">

<h2> Prerequisites </h2>

- [Port API credentials](#port-credentials)
- [ArgoCD](https://argoproj.github.io/argo-cd/getting_started/) >= 2.0.0
- Azure App Registration Credentials

<h2> Installation </h2>

1. Create a `values.yaml` file in `argocd/azure-rg-integration` in your git repository with the content:

```yaml showLineNumbers
  initializePortResources: true
  scheduledResyncInterval: 120
  integration:
    identifier: azure-rg-integration
    type: azure-rg
    eventListener:
      type: POLLING
	  config:
      azureClientId: <AZURE_CLIENT_ID>
		  azureClientSecret: <AZURE_CLIENT_SECRET>
		  azureTenantId: <AZURE_TENANT_ID>
```

2. Install the `azure-rg-integration` ArgoCD Application by creating the following `azure-rg-integration.yaml` manifest:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.  
Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
<summary><b>ArgoCD Application (Click to expand)</b></summary>

		```yaml showLineNumbers
		apiVersion: argoproj.io/v1alpha1
		kind: Application
		metadata:
		name: my-ocean-azure-rg-integration
		namespace: argocd
		spec:
		destination:
			namespace: mmy-ocean-azure-rg-integration
			server: https://kubernetes.default.svc
		project: default
		sources:
		- repoURL: 'https://port-labs.github.io/helm-charts/'
			chart: port-ocean
			targetRevision: 0.9.5
			helm:
			valueFiles:
			- $values/argocd/my-ocean-azure-rg-integration/values.yaml
			// highlight-start
			parameters:
				- name: port.clientId
				value: YOUR_PORT_CLIENT_ID
				- name: port.clientSecret
				value: YOUR_PORT_CLIENT_SECRET
				- name: port.baseUrl
				value: https://api.getport.io
					// highlight-end
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
</details>

<PortApiRegionTip/>

3. Apply the `azure-rg-integration.yaml` manifest to your Kubernetes cluster.

```bash
kubectl apply -f azure-rg-integration.yaml
```

</TabItem>

<TabItem value="gitlab" label="GitLab">

Make sure to [configure the following GitLab variables](https://docs.gitlab.com/ee/ci/variables/#for-a-project):

| Parameter                                     | Description                                                                                                                           | Required |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id.                                                                                                                  | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client secret.                                                                                                              | ✅       |
| `OCEAN__PORT__BASE_URL`                       | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US.                                              | ✅       |
| `OCEAN__INTEGRATION__CONFIG__AZURE_CLIENT_ID` | The client ID of the Azure App Registration.                                                                                          | ✅       |
| `OCEAN__INTEGRATION__CONFIG__AZURE_CLIENT_SECRET` | The client secret of the Azure App Registration.                                                                                  | ✅       |
| `OCEAN__INTEGRATION__CONFIG__AZURE_TENANT_ID` | The tenant ID of the Azure App Registration.                                                                                          | ✅       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, when set to false the integration will not create default blueprints and the port App config mapping.                   | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`               | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true.  | ❌       |

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
  INTEGRATION_TYPE: azure-rg
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
          -e OCEAN__PORT__CLIENT_ID=$PORT_CLIENT_ID \
          -e OCEAN__PORT__CLIENT_SECRET=$PORT_CLIENT_SECRET \
          -e OCEAN__PORT__BASE_URL="https://api.port.io" \
          -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
          -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
          -e OCEAN__EVENT_LISTENER='{"type": "ONCE"}' \
          -e OCEAN__INTEGRATION__CONFIG__AZURE_CLIENT_ID="Enter value here" \
          -e OCEAN__INTEGRATION__CONFIG__AZURE_CLIENT_SECRET="Enter value here" \
          -e OCEAN__INTEGRATION__CONFIG__AZURE_TENANT_ID="Enter value here" \
          $IMAGE_NAME

  rules: # Run only when changes are made to the main branch
    - if: '$CI_COMMIT_BRANCH == "main"'
```

</TabItem>

</Tabs>

</TabItem>

<TabItem value="on-prem" label="On-Prem (Once)">

<h2> Prerequisites </h2>
- [Port API credentials](#port-credentials)
- [Docker](https://docs.docker.com/get-docker/)
- Azure App Registration Credentials

<h2> Installation </h2>

Now that you have the Azure App Registration details, you can install the Azure exporter using Docker.

You should have the following information ready:

- Port API credentials, you can check out the [Port API documentation](#port-credentials).
	- `PORT_CLIENT_ID`
	- `PORT_CLIENT_SECRET`
- Azure Credentials:
	- `AZURE_CLIENT_ID`: The Application (client) ID from the Azure App Registration.
	- `AZURE_CLIENT_SECRET`: The Application (client) Secret from the Azure App Registration.
	- `AZURE_TENANT_ID`: The Directory (tenant) ID from the Azure App Registration.

<details>
<summary>Environment Variables</summary>

| Variable                                          | Description                                                                                                                           |
|---------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| `OCEAN__PORT__CLIENT_ID`                          | Your Port client ID.     |
| `OCEAN__PORT__CLIENT_SECRET`                      | Your Port client secret. |
| `OCEAN__PORT__BASE_URL`                           | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                               |
| `OCEAN__INTEGRATION__CONFIG__AZURE_CLIENT_ID`     | The client ID of the Azure App Registration.                                                                                          |
| `OCEAN__INTEGRATION__CONFIG__AZURE_CLIENT_SECRET` | The client secret of the Azure App Registration.                                                                                      |
| `OCEAN__INTEGRATION__CONFIG__AZURE_TENANT_ID`     | The tenant ID of the Azure App Registration.                                                                                          |
| `OCEAN__EVENT_LISTENER`                           | [The event listener object](https://ocean.getport.io/framework/features/event-listener/).                                             |
| `OCEAN__INTEGRATION__IDENTIFIER`                  | The identifier of the integration.                                                                                                    |
| `OCEAN__INTEGRATION__TYPE`                        | should be set to `azure-rg`.                                                                                                             |
| `OCEAN__INITIALIZE_PORT_RESOURCES`                 | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources) |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                |

</details>

For example:

```bash
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__PORT__CLIENT_ID="$PORT_CLIENT_ID" \
  -e OCEAN__PORT__CLIENT_SECRET="$PORT_CLIENT_SECRET" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__EVENT_LISTENER='{"type": "ONCE"}' \
  -e OCEAN__INTEGRATION__CONFIG__AZURE_CLIENT_ID=AZURE_CLIENT_ID \
  -e OCEAN__INTEGRATION__CONFIG__AZURE_CLIENT_SECRET=$AZURE_CLIENT_SECRET \
  -e OCEAN__INTEGRATION__CONFIG__AZURE_TENANT_ID=$AZURE_TENANT_ID \
ghcr.io/port-labs/port-ocean-azure-rg:latest
```

</TabItem>

</Tabs>

## Examples

### Mapping Azure Cloud resources

The following example demonstrates how to ingest your Azure Subscriptions to Port.  
You can use the following Port blueprint definitions and integration configuration:


<details>
  <summary><b>Blueprint (click to expand)</b></summary>

  ```json showLineNumbers
{
    "identifier": "azureCloudResources",
    "description": "This blueprint represents an Azure Cloud Resource in our software catalog",
    "title": "Azure Cloud Resources",
    "icon": "Azure",
    "schema": {
      "properties": {
        "tags": {
          "title": "Tags",
          "type": "object"
        },
        "type": {
          "title": "Type",
          "type": "string"
        },
        "location": {
          "title": "Location",
          "type": "string"
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
  <summary><b>Mapping configuration (click to expand)</b></summary>
  
  ```yaml showLineNumbers
  resources:
    - kind: resource
      selector:
        query: 'true'
        resource_types:
          - microsoft.insights/datacollectionendpoints
      port:
        entity:
          mappings:
            identifier: .id | gsub(" ";"_")
            title: .name
            blueprint: '"azureCloudResources"'
            properties:
              tags: .tags
              type: .type
              location: .location
  ```
</details>

#### Configuration options

You can filter resources from Azure Resource Graph by specifying `resource_types` in the mapping configuration. This provides precise control over synced data, streamlining ingestion and keeping your catalog focused on relevant resources.

### Mapping cloud resources and resource groups

The following example demonstrates how to ingest your Azure Subscriptions to Port.  
You can use the following Port blueprint definitions and integration configuration:


<details>
  <summary><b>Blueprints (click to expand)</b></summary>

  ```json showLineNumbers

[
    {
      "identifier": "azureResourceGroup",
      "description": "This blueprint represents an Azure Resource Group in our software catalog",
      "title": "Azure Resource Group",
      "icon": "Azure",
      "schema": {
        "properties": {
          "location": {
            "title": "Location",
            "type": "string"
          },
          "tags": {
            "title": "Tags",
            "type": "object"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    },
    {
      "identifier": "azureCloudResources",
      "description": "This blueprint represents an AzureCloud Resource in our software catalog",
      "title": "Azure Cloud Resources",
      "icon": "Git",
      "schema": {
        "properties": {
          "tags": {
            "title": "Tags",
            "type": "object"
          },
          "type": {
            "title": "Type",
            "type": "string"
          },
          "location": {
            "title": "Location",
            "type": "string"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "resource_group": {
          "title": "Resource Group",
          "target": "azureResourceGroup",
          "required": false,
          "many": false
        }
      }
    }
]
  ```
</details>

<details>
  <summary><b>Mapping configuration (click to expand)</b></summary>

  ```yaml showLineNumbers
resources:
  - kind: resourceContainer
    selector:
      query: .type == "microsoft.resources/subscriptions/resourcegroups"
      tags:
        included:
          environment: staging
        exluded:
          environment: production
    port:
      entity:
        mappings:
          identifier: .id | gsub(" ";"_")
          title: .name
          blueprint: '"azureResourceGroup"'
          properties:
            tags: .tags
            location: .location

  - kind: resource
    selector:
      query: 'true'
      tags:
        included:
          environment: staging
        exluded:
          environment: production
    port:
      entity:
        mappings:
          identifier: .id | gsub(" ";"_")
          title: .name
          blueprint: '"azureCloudResources"'
          properties:
            tags: .tags
            type: .type
            location: .location
          relations:
            resource_group: >-
              ("/subscriptions/" + .subscriptionId + "/resourceGroups/"  + .resourceGroup) | gsub(" ";"_")
  ```
</details>

#### Configuration options

The integration provides advanced filtering capabilities for Azure resources by leveraging tags from their parent resource groups. This allows you to define both inclusion and exclusion rules within a single configuration, offering precise control over which resources are synchronized. #AI! make this more succint

## Frequently asked questions

### Why should I filter resources by their resource group tags?

Filtering resources based on their parent resource group's tags is a powerful feature that simplifies resource management and synchronization. Here's why it's beneficial:

- **Simplified Tagging Strategy**: Instead of tagging every individual resource, you can apply tags at the resource group level. This is often more manageable and ensures that all resources within a group share a common context (e.g., environment, application, or owner).
- **Consistent Classification**: Resource groups usually have a more consistent tagging strategy compared to individual resources. By filtering at this level, you can reliably include or exclude entire sets of related resources.
- **Improved Efficiency**: By filtering at the query level, you reduce the amount of data synced from Azure. This not only speeds up the ingestion process but also minimizes the volume of data processed, leading to a more efficient and focused software catalog.

---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_azure_docker_params.mdx"
import HelmParameters from "../../templates/\_ocean-advanced-parameters-helm.mdx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import AzureAppRegistration from "./\_azure_app_registration_guide.mdx"

# Installation

:::tip First Time Installation
For your first deployment of the Azure exporter, we recommend starting with the Helm/scheduled installation method to perform the initial data sync. Once the initial data sync is complete, you can switch to the Terraform deployment method for real-time data sync.
:::

## Installation Methods

<Tabs groupId="installation-methods" queryString="installation-methods" defaultValue="azure-multi-subscriptions">
<TabItem value="azure-multi-subscriptions" label="Azure Multi Subscriptions">

For organizations working with multiple Azure subscriptions, we offer a dedicated sync solution that provides near real-time data synchronization without infrastructure requirements.

For complete setup instructions and detailed features, see our [Azure multi subscriptions guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/multi-subscriptions.md).

</TabItem>

<TabItem value="helm" label="Helm (Scheduled)" >

The Azure exporter is deployed using helm on kubernetes.

This way of deployment supports scheduled resyncs of resources from Azure to Port.

<h2> Prerequisites </h2>
- [Port API credentials](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)
- [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0
- [Azure App Registration Credentials](See below)

<AzureAppRegistration/>

<h2> Installation </h2>

Now that you have the Azure App Registration details, you can install the Azure exporter using Helm.

You should have the following information ready:

- Port API credentials, you can check out the [Port API documentation](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
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
  --set integration.identifier="azure"  \
  --set integration.type="azure"  \
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

- [Port API credentials](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)
- Access to an Azure DevOps project with permission to configure pipelines and secrets.
- Azure App Registration Credentials (See below)

<AzureAppRegistration/>

<h2> Installation </h2>

Now that you have the Azure App Registration details, you can set up the Azure exporter using an Azure DevOps pipeline.

Make sure to configure the following [seceret variables](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/set-secret-variables?view=azure-devops&tabs=yaml%2Cbash) in a variable group:

- Port API credentials, you can check out the [Port API documentation](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
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
name: Azure Exporter Pipeline

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
    displayName: 'Run Ocean Sail (Azure)'
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
          ghcr.io/port-labs/port-ocean-azure:latest

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

- [Port API credentials](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)
- Azure App Registration Credentials (See below)

<AzureAppRegistration/>


<h2> Installation </h2>

Now that you have the Azure App Registration details, you can set up the Azure exporter using Github Actions.

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

- Port API credentials, you can check out the [Port API documentation](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
	- `PORT_CLIENT_ID`
	- `PORT_CLIENT_SECRET`
- Azure Credentials:
	- `OCEAN__SECRET__AZURE_CLIENT_ID`: The Application (client) ID from the Azure App Registration.
	- `OCEAN__SECRET__AZURE_CLIENT_SECRET`: The Application (client) Secret from the Azure App Registration.
	- `OCEAN__SECRET__AZURE_TENANT_ID`: The Directory (tenant) ID from the Azure App Registration.

<DockerParameters />

<br/>

Here is an example for `azure-integration.yml` workflow file:

<details>
<summary><b>GitHub Action integration (Click to expand)</b></summary>

		```yaml showLineNumbers
		name: Azure Exporter Workflow

		on:
		workflow_dispatch:
		schedule:
			- cron: '0 */4 * * *' 

		jobs:
		run-integration:
			runs-on: ubuntu-latest
			steps:
			- name: Run azure Integration
				uses: port-labs/ocean-sail@v1
				with:
				type: azure
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

- [Port API credentials](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)
- [ArgoCD](https://argoproj.github.io/argo-cd/getting_started/) >= 2.0.0
- Azure App Registration Credentials (See below)

<AzureAppRegistration/>

<h2> Installation </h2>

1. Create a `values.yaml` file in `argocd/azure-integration` in your git repository with the content:

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: azure-integration
  type: azure
  eventListener:
    type: POLLING
	config:
    azureClientId: <AZURE_CLIENT_ID>
		azureClientSecret: <AZURE_CLIENT_SECRET>
		azureTenantId: <AZURE_TENANT_ID>
```

2. Install the `azure-integration` ArgoCD Application by creating the following `azure-integration.yaml` manifest:

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
		name: my-ocean-azure-integration
		namespace: argocd
		spec:
		destination:
			namespace: mmy-ocean-azure-integration
			server: https://kubernetes.default.svc
		project: default
		sources:
		- repoURL: 'https://port-labs.github.io/helm-charts/'
			chart: port-ocean
			targetRevision: 0.1.14
			helm:
			valueFiles:
			- $values/argocd/my-ocean-azure-integration/values.yaml
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

3. Apply the `azure-integration.yaml` manifest to your Kubernetes cluster.
```bash
kubectl apply -f azure-integration.yaml
```

</TabItem>

</Tabs>

</TabItem>

<TabItem value="terraform" label="Terraform">

The azure exporter is deployed using Terraform on Azure Container App.
It uses our Terraform [Ocean](https://ocean.getport.io) Integration
Factory [module](https://registry.terraform.io/modules/port-labs/integration-factory/ocean/latest) to deploy the
exporter.

This way of deployment supports real-time data sync from Azure to Port.

The Azure exporter is initially configured to collect Azure resources from the subscription where it's deployed.
However, it can be adjusted to ingest resources from multiple subscriptions. To learn how to configure the Azure
exporter for this purpose, check out the instructions in
the [Multiple subscriptions setup](#multiple-subscriptions-setup) section.

:::tip
Multiple ways to deploy the Azure exporter could be found in the Azure Integration
example [README](https://registry.terraform.io/modules/port-labs/integration-factory/ocean/latest/examples/azure_container_app_azure_integration)
:::

<h2> Azure infrastructure used by the Azure exporter </h2>

The Azure exporter uses the following Azure infrastructure:

- Azure Container App;
- Azure Event Grid (Used for real-time data sync to Port):
	- Azure Event Grid System Topic of type `Microsoft.Resources.Subscriptions`;
	- Azure Event Grid Subscription;

:::warning Event Grid System Topic limitation 
Due to a limitation in Azure **only one** Event Grid system topic of type `Microsoft.Resources.Subscriptions` can be
created per subscription, so if you already have one you'll need to pass it to the integration
using `event_grid_system_topic_name=<your-event-grid-system-topic-name>`.

In case a system topic already exists and is not provided to the deployment of the integration, the integration will due
to not being able to create a new one.
:::

<h2> Prerequisites </h2>

- [Terraform](https://www.terraform.io/downloads.html) >= 1.9.1
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) >= 2.26.0
- [Permissions](#permissions)

<h2> Permissions </h2>

In order to successfully deploy the Azure exporter, it's crucial to ensure that the user who deploys the integration in
the Azure subscription has the appropriate access permissions. One of the following permission assignments are required:

- Option 1: the user can have the `Owner` Azure role assigned to him for the subscription that the integration will be
	deployed on. This role provides comprehensive control and access rights;
- Option 2: for a more limited approach, the user should possess the minimum necessary permissions required to carry out
	the integration deployment. These permissions will grant the user access to specific resources and actions essential
	for the task without granting full `Owner` privileges. The following steps will guide you through the process of
	creating a custom role and assigning it to the user along with other required roles:

	- Create
		a [custom role](https://learn.microsoft.com/en-us/azure/role-based-access-control/custom-roles#steps-to-create-a-custom-role)
		with the following permissions:

		<details>

		<summary> Custom Resource Definition </summary>

		```json showLineNumbers
		{
			"id": "<ROLE_DEFINITION_ID>",
			"properties": {
				"roleName": "Azure Exporter Deployment",
				"description": "",
				"assignableScopes": ["/subscriptions/<SUBSCRIPTION_ID>"],
				"permissions": [
					{
						"actions": [
							"Microsoft.ManagedIdentity/userAssignedIdentities/read",
							"Microsoft.ManagedIdentity/userAssignedIdentities/write",
							"Microsoft.ManagedIdentity/userAssignedIdentities/assign/action",
							"Microsoft.ManagedIdentity/userAssignedIdentities/listAssociatedResources/action",
							"Microsoft.Authorization/roleDefinitions/read",
							"Microsoft.Authorization/roleDefinitions/write",
							"Microsoft.Authorization/roleAssignments/write",
							"Microsoft.Authorization/roleAssignments/read",
							"Microsoft.Resources/subscriptions/resourceGroups/write",
							"Microsoft.OperationalInsights/workspaces/tables/write",
							"Microsoft.Resources/deployments/read",
							"Microsoft.Resources/deployments/write",
							"Microsoft.OperationalInsights/workspaces/read",
							"Microsoft.OperationalInsights/workspaces/write",
							"microsoft.app/containerapps/write",
							"microsoft.app/managedenvironments/read",
							"microsoft.app/managedenvironments/write",
							"Microsoft.Resources/subscriptions/resourceGroups/read",
							"Microsoft.OperationalInsights/workspaces/sharedkeys/action",
							"microsoft.app/managedenvironments/join/action",
							"microsoft.app/containerapps/listsecrets/action",
							"microsoft.app/containerapps/delete",
							"microsoft.app/containerapps/stop/action",
							"microsoft.app/containerapps/start/action",
							"microsoft.app/containerapps/authconfigs/write",
							"microsoft.app/containerapps/authconfigs/delete",
							"microsoft.app/containerapps/revisions/restart/action",
							"microsoft.app/containerapps/revisions/activate/action",
							"microsoft.app/containerapps/revisions/deactivate/action",
							"microsoft.app/containerapps/sourcecontrols/write",
							"microsoft.app/containerapps/sourcecontrols/delete",
							"microsoft.app/managedenvironments/delete",
							"Microsoft.Authorization/roleAssignments/delete",
							"Microsoft.Authorization/roleDefinitions/delete",
							"Microsoft.OperationalInsights/workspaces/delete",
							"Microsoft.ManagedIdentity/userAssignedIdentities/delete",
							"Microsoft.Resources/subscriptions/resourceGroups/delete"
						],
						"notActions": [],
						"dataActions": [],
						"notDataActions": []
					}
				]
			}
		}
		```

		</details>

	- [Assign the following roles](https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal)
		to the user on the subscription that will be used to deploy

1. Login to [Port](https://app.getport.io) and browse to the [builder page](https://app.getport.io/dev-portal)
2. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your Azure integration.
	<img src='/img/integrations/azure-exporter/DevPortalIngestCloudProvider.png' width='70%' border='1px' /> <br/><br/>

3. Edit and copy the installation command.
	:::tip Installation Command
	The installation command includes placeholders that allow you to customize the integration's configuration. For
	example, you can update the command and specify the `event_grid_system_topic_name` parameter if you already have one.

	- Specify the `event_grid_system_topic_name` parameter if you already have an Event Grid system topic of
		type `Microsoft.Resources.Subscriptions` in your subscription;
	- Specify the `event_grid_event_filter_list` parameter if you want to listen to more events;
	- Specify the `action_permissions_list` parameter if you want the integration to have more permissions.

	 :::
	<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/azure-terraform-install.png' width='80%' border='1px' /> <br/><br/>
	:::tip Actions Permissions
	To find more actions that could be assigned to the exporter, you can use the [Azure Resource provider operation reference](https://learn.microsoft.com/en-us/azure/role-based-access-control/resource-provider-operations) and look for the resources that you want to export to Port.
	:::

4. Run the command in your terminal to deploy the Azure exporter.

</TabItem>

<TabItem value="on-prem" label="On-Prem (Once)">

<h2> Prerequisites </h2>
- [Port API credentials](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)
- [Docker](https://docs.docker.com/get-docker/)
- [Azure App Registration Credentials](?installation-methods=on-premise#azure-app-registration)

<AzureAppRegistration/>

<h2> Installation </h2>

Now that you have the Azure App Registration details, you can install the Azure exporter using Docker.

You should have the following information ready:

- Port API credentials, you can check out the [Port API documentation](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
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
| `OCEAN__INTEGRATION__TYPE`                        | should be set to `azure`.                                                                                                             |
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
ghcr.io/port-labs/port-ocean-azure:latest
```

</TabItem>

</Tabs>

## FAQ: Multiple Subscriptions Support

<h3> How do I configure the Azure exporter to ingest resources from multiple subscriptions? </h3>

To configure the Azure exporter to ingest resources from other subscriptions, follow these steps:

1. **Navigate to the Subscription:**
   - Go to the Azure portal and select the subscription you want to ingest resources from.

2. **Assign Permissions:**
   - In the subscription's `Access control (IAM)` section, go to the Role assignment tab.
   - Choose the appropriate role for the managed identity responsible for the integration.
   - Assign this role to the managed identity associated with the integration.

3. **Repeat the Process:**
   - Repeat the above steps for each subscription you wish to include.

<h3> How do I set up real-time data ingestion from multiple subscriptions? </h3>

For the most efficient approach to multi-subscription data ingestion without infrastructure requirements, we recommend using our [Azure multi subscriptions](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/multi-subscriptions.md) method.

If you prefer using the Terraform deployment method with Event Grid, you will need to set up an Event Grid System Topic and an Event Grid Subscription in each subscription you want to ingest resources from. The system topic should be of type `Microsoft.Resources.Subscriptions`. Refer to the [Azure Integration example](https://github.com/port-labs/terraform-ocean-integration-factory/blob/main/examples/azure_container_app_azure_integration/main.tf) for more information.

## Next Steps

- Refer to the [Resource Templates](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/resource_templates/resource_templates.md) page for templates on how to map Azure resources to Port.
- Check out the [Azure multi subscriptions](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/multi-subscriptions.md) guide for setting up synchronization of Azure resources.

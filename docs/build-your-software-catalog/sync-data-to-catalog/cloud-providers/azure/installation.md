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

# Installation

<Tabs groupId="installation-methods" queryString="installation-methods" defaultValue="helm">
<TabItem value="helm" label="Helm" >

## Pre-requisites
- [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0
- [Kubernetes](https://kubernetes.io/docs/setup/) cluster
- [Azure App Registration]

## Azure App Registration

1. Create an Azure App Registration in the Azure portal.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/app-registration/1-app-registration.png' width='85%' border='1px' /> <br/><br/>

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/app-registration/2-register-an-application.png' width='85%' border='1px' /> <br/><br/>

2. Copy the `Application (client) ID` and `Directory (tenant) ID` from the App Registration.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/app-registration/3-result-of-app-registration.png' width='85%' border='1px' /> <br/><br/>

3. Create a client secret for the App Registration.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/app-registration/4-creating-client-secret.png' width='85%' border='1px' /> <br/><br/>

4. Copy the `Application (client) Secret` from the App Registration.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/app-registration/5-copy-secret-value.png' width='85%' border='1px' /> <br/><br/>

5. Create a new role assignment for the App Registration. Go to the `Access control (IAM)` section of the subscription you want to ingest resources from.<br/><br/>Click on `Add role assignment`.

:::info Multi Account Support
It is supported to ingest resources from multiple subscriptions, for that you will have to repeat the role assignment for each subscription you want to ingest resources from.
:::

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/app-registration/6-add-role-assignment.png' width='85%' border='1px' /> <br/><br/>

6. Assign the `Reader` role to the App Registration.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/app-registration/7-assign-member-to-role.png' width='85%' border='1px' /> <br/><br/>


## Installation

Now that you have the Azure App Registration details, you can install the Azure exporter using Helm.

You should have the following information ready:

- Port API credentials, you check out the [Port API documentation](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
  - `PORT_CLIENT_ID`
  - `PORT_CLIENT_SECRET`
- Azure Credentials:
  - `AZURE_CLIENT_ID`: The Application (client) ID from the Azure App Registration.
  - `AZURE_CLIENT_SECRET`: The Application (client) Secret from the Azure App Registration.
  - `AZURE_TENANT_ID`: The Directory (tenant) ID from the Azure App Registration.

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-azure-integration port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \
	--set port.clientSecret="PORT_CLIENT_SECRET"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
	--set scheduledResyncInterval=1440 \
	--set integration.identifier="my-azure-integration"  \
	--set integration.type="azure"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.config.azureClientId="<AZURE_CLIENT_ID>"  \
	--set integration.config.azureClientSecret="<AZURE_CLIENT_SECRET>" \
	--set integration.config.azureTenantId="<AZURE_TENANT_ID>"
```

<PortApiRegionTip/>

</TabItem>

<TabItem value="terraform" label="Terraform">

The azure exporter is deployed using Terraform on Azure Container App.
It uses our Terraform [Ocean](https://ocean.getport.io) Integration Factory [module](https://registry.terraform.io/modules/port-labs/integration-factory/ocean/latest) to deploy the exporter.


The Azure exporter is initially configured to collect Azure resources from the subscription where it's deployed. However, it can be adjusted to ingest resources from multiple subscriptions. To learn how to configure the Azure exporter for this purpose, check out the instructions in the [Multiple subscriptions setup](#multiple-subscriptions-setup) section.

:::tip
Multiple ways to deploy the Azure exporter could be found in the Azure Integration example [README](https://registry.terraform.io/modules/port-labs/integration-factory/ocean/latest/examples/azure_container_app_azure_integration)
:::

## Azure infrastructure used by the Azure exporter

The Azure exporter uses the following Azure infrastructure:

- Azure Container App;
- Azure Event Grid (Used for real-time data sync to Port):
  - Azure Event Grid System Topic of type `Microsoft.Resources.Subscriptions`;
  - Azure Event Grid Subscription;

:::warning
Due to a limitation in Azure **only one** Event Grid system topic of type `Microsoft.Resources.Subscriptions` can be created per subscription, so if you already have one you'll need to pass it to the integration using `event_grid_system_topic_name=<your-event-grid-system-topic-name>`.

In case a system topic already exists and is not provided to the deployment of the integration, the integration will due to not being able to create a new one.
:::

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) >= 0.15.0
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) >= 2.26.0
- [Permissions](#permissions)

## Permissions

In order to successfully deploy the Azure exporter, it's crucial to ensure that the user who deploys the integration in the Azure subscription has the appropriate access permissions. One of the following permission assignments are required:

- Option 1: the user can have the `Owner` Azure role assigned to him for the subscription that the integration will be deployed on. This role provides comprehensive control and access rights;
- Option 2: for a more limited approach, the user should possess the minimum necessary permissions required to carry out the integration deployment. These permissions will grant the user access to specific resources and actions essential for the task without granting full `Owner` privileges. The following steps will guide you through the process of creating a custom role and assigning it to the user along with other required roles:

  - Create a [custom role](https://learn.microsoft.com/en-us/azure/role-based-access-control/custom-roles#steps-to-create-a-custom-role) with the following permissions:

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

  - [Assign the following roles](https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal) to the user on the subscription that will be used to deploy

1. Login to [Port](https://app.getport.io) and browse to the [builder page](https://app.getport.io/dev-portal)
2. Open the ingest modal by expanding one of the blueprints and clicking the ingest button on the blueprints.

![Dev Portal Builder Ingest Button](/img/integrations/azure-exporter/DevPortalBuilderIngestButton.png)

3. Click on the Azure Exporter option under the Cloud Providers section:

   ![Dev Portal Builder Azure Exporter Option](/img/integrations/azure-exporter/DevPortalIngestCloudProvider.png)

4. Edit and copy the installation command.
   :::tip
   The installation command includes placeholders that allow you to customize the integration's configuration. For example, you can update the command and specify the `event_grid_system_topic_name` parameter if you already have one.

   - Specify the `event_grid_system_topic_name` parameter if you already have an Event Grid system topic of type `Microsoft.Resources.Subscriptions` in your subscription;
   - Specify the `event_grid_event_filter_list` parameter if you want to listen to more events;
   - Specify the `action_permissions_list` parameter if you want the integration to have more permissions.

   :::

   ![Dev Portal Builder Azure Exporter Installation](/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/azure-terraform-install.png)

5. Run the command in your terminal to deploy the Azure exporter.

</TabItem>

</Tabs>


## Multiple subscriptions setup

To configure the Azure exporter to ingest resources from other subscriptions, you'll need to assign permissions to the managed identity running the integration in the subscriptions which you wish to ingest resources from.

1. Head to the Azure portal and navigate to the subscription you want to ingest resources from.
2. In the subscription's `Access control (IAM)` section, go to the Role assignment tab and choose the appropriate role for the managed identity responsible for the integration.
3. Assign this role to the managed identity associated with the integration.
4. Repeat this process for each subscription you wish to include.

For real-time data ingestion from multiple subscriptions, set up an Event Grid System Topic and an Event Grid Subscription in each subscription you want to include, connecting them to the Azure exporter.

For a detailed example using Terraform to configure the Event Grid System Topic and Event Grid Subscription, based on the installation output of the Azure exporter, refer to [this example](https://github.com/port-labs/terraform-ocean-integration-factory/blob/main/examples/azure_container_app_azure_integration/main.tf))


## Further information

- Refer to the [examples](./examples/examples.md) page for practical configurations and their corresponding blueprint definitions.

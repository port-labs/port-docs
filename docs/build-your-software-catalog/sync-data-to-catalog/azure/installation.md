---
sidebar_position: 1
---

# Installation

The azure exporter is deployed using Terraform on Azure Container App.
It uses our Terraform [Ocean](https://ocean.getport.io) Integration Factory [module](https://registry.terraform.io/modules/port-labs/integration-factory/ocean/latest) to deploy the exporter.

:::tip
Multiple ways to deploy the Azure exporter could be found in the Azure Integration example [README](https://registry.terraform.io/modules/port-labs/integration-factory/ocean/latest/examples/azure_container_app_azure_integration)
:::

## Azure infrastructure used by the Azure exporter

The Azure exporter uses the following Azure infrastructure:

- Azure Container App;
- Azure Event Grid (Used for real-time data sync to Port):
  - Azure Event Grid System Topic of type `Microsoft.Resources.Subscriptions`;
  - Azure Event Grid Subscription;

:::caution
Due to a limitation in Azure **only one** Event Grid system topic of type `Microsoft.Resources.Subscriptions` can be created per subscription, so if you already have one you'll need to pass it to the integration using `event_grid_system_topic_name=<your-event-grid-system-topic-name>`.

In case a system topic already exists and is not provided to the deployment of the integration, the integration will due to not being able to create a new one.
:::

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) >= 0.15.0
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) >= 2.26.0
- [Permissions](#permissions)

## Permissions

In order to successfully deploy the Azure exporter, it's crucial to ensure that the user who deploys the integration in the Azure subscription has the appropriate access permissions.

- Option 1: The user can have Owner role for the specific subscription designated for deploying the integration. This role provides comprehensive control and access rights.
- Option 2: For a more limited approach, the user should possess the minimum necessary permissions required to carry out the integration deployment. These permissions will grant the user access to specific resources and actions essential for the task without granting full Owner privileges. The following steps will guide you through the process of creating a custom role and assigning it along with other roles to the user.

  - Create a [custom role](https://learn.microsoft.com/en-us/azure/role-based-access-control/custom-roles#steps-to-create-a-custom-role) with the following permissions:

    <details>

    <summary> Custom Resource Definition </summary>

    ```json
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


  - [Assign the following roles](https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal) to the user on the subscription that will be used to deploy the integration:
    - The custom `Azure Exporter Deployment` role we defined above;
    - The `API Management Workspace Contributor` role;
    - The `EventGrid Contributor` role;
    - The `ContainerApp Reader` role;
    - The `EventGrid EventSubscription Contributor` role;

## Installation

1. Login to [Port](https://app.getport.io) and browse to the [builder page](https://app.getport.io/dev-portal)
2. Open the ingest modal by expanding one of the blueprints and clicking the ingest button on the blueprints.

   ![Dev Portal Builder Ingest Button](../../../../static/img/integrations/azure-exporter/DevPortalBuilderIngestButton.png)

3. Click on the Azure Exporter option under the Cloud Providers section:

   ![Dev Portal Builder Azure Exporter Option](../../../../static/img/integrations/azure-exporter/DevPortalIngestCloudProvider.png)

4. Edit and copy the installation command.
   :::tip
   The installation command includes placeholders that allow you to customize the integration's configuration. For example, you can update the command and specify the `event_grid_system_topic_name` parameter if you already have one.

   - Specify the `event_grid_system_topic_name` parameter if you already have an Event Grid system topic of type `Microsoft.Resources.Subscriptions` in your subscription;
   - Specify the `event_grid_event_filter_list` parameter if you want to listen to more events;
   - Specify the `action_permissions_list` parameter if you want the integration to have more permissions.

   :::

   ![Dev Portal Builder Azure Exporter Installation](../../../../static/img/integrations/azure-exporter/DevPortalIngestAzureInstallation.png)

5. Run the command in your terminal to deploy the Azure exporter.

## Mapping configuration

You can update the exporter's configuration in the integration page, you can use the configuration to add or remove Azure resources that will be ingested from your subscription.

![Dev Portal Ingest Azure Mapping Configuration](../../../../static/img/integrations/azure-exporter/DevPortalIngestAzureMappingConfiguration.png)

## Further information

- Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

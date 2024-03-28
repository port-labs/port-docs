---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_azure_docker_params.mdx"
import HelmParameters from "../../templates/\_ocean-advanced-parameters-helm.mdx"

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

  - [Assign the following roles](https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal) to the user on the subscription that will be used to deploy the integration:
    - The custom `Azure Exporter Deployment` role we defined above.
    - The `API Management Workspace Contributor` role.
    - The `EventGrid Contributor` role.
    - The `ContainerApp Reader` role.
    - The `EventGrid EventSubscription Contributor` role.

## Installation

:::tip Get your Azure Account Credentials
Follow this [guide](https://learn.microsoft.com/en-us/azure/developer/terraform/get-started-cloud-shell-bash?tabs=bash#create-a-service-principal) to create a service principal in order to get your Azure account credentials:
- AZURE_CLIENT_ID
- AZURE_CLIENT_SECRET
- AZURE_TENANT_ID
- AZURE_SUBSCRIPTION_ID

Or [register an app](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade) in the Azure portal to get your credentials.
:::

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="ui" label="From the UI">
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

   ![Dev Portal Builder Azure Exporter Installation](/img/integrations/azure-exporter/DevPortalIngestAzureInstallation.png)

5. Run the command in your terminal to deploy the Azure exporter.

</TabItem>

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                                | Description                                                                                                                                | Example                          | Required |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | -------- |
| `port.clientId`                          | Your port [client id](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)              |                                  | ✅       |
| `port.clientSecret`                      | Your port [client secret](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)          |                                  | ✅       |
| `integration.secrets.subscriptionId`            | Your Azure Subscription ID            |   | ✅       |
| `integration.config.appHost`             | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Jira                         | https://my-ocean-integration.com | ❌       |

<HelmParameters/>

<br/>

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-azure-integration port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \
	--set port.clientSecret="PORT_CLIENT_SECRET"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
	--set scheduledResyncInterval=120 \
	--set integration.identifier="my-azure-integration"  \
	--set integration.type="azure"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.secrets.subscriptionId="<AZURE_SUBSCRIPTION_ID>"  \
        --set "extraEnv[0].name=AZURE_CLIENT_ID"  \
        --set "extraEnv[0].value=xxxx-your-client-id-xxxxx"  \
        --set "extraEnv[1].name=AZURE_CLIENT_SECRET"  \
        --set "extraEnv[1].value=xxxxxxx-your-client-secret-xxxx"  \
        --set "extraEnv[2].name=AZURE_TENANT_ID"  \
        --set "extraEnv[2].value=xxxx-your-tenant-id-xxxxx"  \
        --set "extraEnv[3].name=AZURE_SUBSCRIPTION_ID"  \
        --set "extraEnv[3].value=xxxx-your-subscription-id-xxxxx"
```

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-azure-integration` in your git repository with the content:


```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-azure-integration
  type: azure
  eventListener:
    type: POLLING
  secrets:
    subscriptionId: xxxx-your-subscription-id-xxxxx
  extraEnvs:
    - name: AZURE_CLIENT_ID
      value: xxxx-your-client-id-xxxxx
    - name: AZURE_CLIENT_SECRET
      value: xxxxxxx-your-client-secret-xxxx
    - name: AZURE_TENANT_ID
      value: xxxx-your-tenant-id-xxxxx
    - name: AZURE_SUBSCRIPTION_ID
      value: xxxx-your-subscription-id-xxxxx
```

<br/>

2. Install the `my-ocean-azure-integration` ArgoCD Application by creating the following `my-ocean-azure-integration.yaml` manifest:

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
<br/>

3. Apply your application manifest with `kubectl`:

```bash
kubectl apply -f my-ocean-azure-integration.yaml
```

</TabItem>
</Tabs>

</TabItem>

<TabItem value="one-time" label="Scheduled">
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Azure integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `azure-integration.yml` workflow file:

```yaml showLineNumbers
name: Azure Exporter Workflow

# This workflow responsible for running Azure exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        env:
          AZURE_CLIENT_ID: ${{ secrets.OCEAN__SECRET__AZURE_CLIENT_ID }}
          AZURE_CLIENT_SECRET: ${{ secrets.OCEAN__SECRET__AZURE_CLIENT_SECRET }}
          AZURE_TENANT_ID: ${{ secrets.OCEAN__SECRET__AZURE_TENANT_ID }}
          AZURE_SUBSCRIPTION_ID: ${{ secrets.OCEAN__SECRET__AZURE_SUBSCRIPTION_ID }}
        with:
          type: "azure"
          identifier: "my-azure-integration"
          port_client_id: ${{ secrets.OCEAN__PORT_CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT_CLIENT_SECRET }}
          config: |
            subscriptionId: ${{ secrets.OCEAN__SECRET__AZURE_SUBSCRIPTION_ID }} 
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Azure integration once and then exit, this is useful for **scheduled** ingestion of data.

:::info
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
        stage('Run Azure Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__TOKEN'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__API_URL', variable: 'OCEAN__INTEGRATION__CONFIG__API_URL'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                        string(credentialsId: 'OCEAN__SECRET__AZURE_CLIENT_ID', variable: 'OCEAN__SECRET__AZURE_CLIENT_ID'),
                        string(credentialsId: 'OCEAN__SECRET__AZURE_CLIENT_SECRET', variable: 'OCEAN__SECRET__AZURE_CLIENT_SECRET'),
                        string(credentialsId: 'OCEAN__SECRET__AZURE_TENANT_ID', variable: 'OCEAN__SECRET__AZURE_TENANT_ID'),
                        string(credentialsId: 'OCEAN__SECRET__AZURE_SUBSCRIPTION_ID', variable: 'OCEAN__SECRET__AZURE_SUBSCRIPTION_ID'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="azure"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__TOKEN=$OCEAN__INTEGRATION__CONFIG__TOKEN \
                                -e OCEAN__INTEGRATION__CONFIG__API_URL=$OCEAN__INTEGRATION__CONFIG__API_URL \
                                -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
                                -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
                                -e OCEAN__INTEGRATION__SECRET__AZURE_SUBSCRIPTION_ID=$OCEAN__SECRET__AZURE_SUBSCRIPTION_ID \
                                -e AZURE_CLIENT_ID=$OCEAN__SECRET__AZURE_CLIENT_ID \
                                -e AZURE_CLIENT_SECRET=$OCEAN__SECRET__AZURE_CLIENT_SECRET \
                                -e AZURE_TENANT_ID=$OCEAN__SECRET__AZURE_TENANT_ID \
                                -e AZURE_SUBSRIPTION_ID=$OCEAN__SECRET__AZURE_SUBSCRIPTION_ID
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
<AzurePremise name="Azure" />

<DockerParameters />

<br/>

Here is an example for `azure-integration.yml` pipeline file:

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
      integration_type="azure"
      version="latest"

      image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

      docker run -i --rm --platform=linux/amd64 \
          -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
          -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
          -e OCEAN__INTEGRATION__CONFIG__TOKEN=${OCEAN__INTEGRATION__CONFIG__TOKEN} \
          -e OCEAN__INTEGRATION__CONFIG__API_URL=${OCEAN__INTEGRATION__CONFIG__API_URL} \
          -e OCEAN__PORT__CLIENT_ID=${OCEAN__PORT__CLIENT_ID} \
          -e OCEAN__PORT__CLIENT_SECRET=${OCEAN__PORT__CLIENT_SECRET} \
          -e OCEAN__INTEGRATION__SECRET__AZURE_SUBSCRIPTION_ID=$OCEAN__SECRET__AZURE_SUBSCRIPTION_ID \
          -e AZURE_CLIENT_ID=${OCEAN__SECRET__AZURE_CLIENT_ID} \
          -e AZURE_CLIENT_SECRET=${OCEAN__SECRET__AZURE_CLIENT_SECRET} \
          -e AZURE_TENANT_ID=${OCEAN__SECRET__AZURE_TENANT_ID} \
          -e AZURE_SUBSRIPTION_ID=${OCEAN__SECRET__AZURE_SUBSCRIPTION_ID}
          $image_name

      exit $?
    displayName: "Ingest Data into Port"
```

  </TabItem>

  </Tabs>
</TabItem>

</Tabs>

## Mapping configuration

You can update the exporter's configuration in the integration page, you can use the configuration to add or remove Azure resources that will be ingested from your subscription.

![Dev Portal Ingest Azure Mapping Configuration](/img/integrations/azure-exporter/DevPortalIngestAzureMappingConfiguration.png)

## Further information

- Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

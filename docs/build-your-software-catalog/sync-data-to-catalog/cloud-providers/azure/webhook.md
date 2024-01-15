---
sidebar_position: 5
description: Ingest Azure DevOps resources into your catalog
---

import ProjectBlueprint from './resources/azuredevops/\_example_project_blueprint.mdx'
import RepositoryBlueprint from './resources/azuredevops/\_example_repository_blueprint.mdx'
import PipelineBlueprint from './resources/azuredevops/\_example_pipeline_blueprint.mdx'
import WorkItemBlueprint from './resources/azuredevops/\_example_work_item_blueprint.mdx'

import AzureDevopsWebhookConfig from './resources/azuredevops/\_example_webhook_configuration.mdx'

# Azure DevOps

In this example, you are going to use the provided script to fetch data from the Azure DevOps API and ingest it to Port. You will also create a webhook integration between [Azure DevOps](https://azure.microsoft.com/en-us/products/devops) and Port, which will ingest projects, repositories, work items and pipelines entities.

## Port configuration

Create the following blueprint definition:

<details>
<summary>Project blueprint</summary>

<ProjectBlueprint/>

</details>

<details>
<summary>Repository blueprint</summary>

<RepositoryBlueprint/>

</details>

<details>
<summary>Pipeline blueprint</summary>

<PipelineBlueprint/>

</details>

<details>
<summary>Work item blueprint</summary>

<WorkItemBlueprint/>

</details>

## Running the python script

To ingest data from your Azure DevOps account to Port, run the following commands:

```bash
export PORT_CLIENT_ID=<ENTER CLIENT ID>
export PORT_CLIENT_SECRET=<ENTER CLIENT SECRET>
export AZURE_DEVOPS_ORG_ID=<ENTER AZURE DEVOPS ORGANIZATION ID>
export AZURE_DEVOPS_APP_PASSWORD=<ENTER AZURE DEVOPS APP PASSWORD>

git clone https://github.com/port-labs/azure-devops-resources.git

cd azure-devops-resources

pip install -r ./requirements.txt

python app.py

```

:::tip
Find more information about the python script [here](https://github.com/port-labs/azure-devops-resources)

Follow the official documentation on how to [create an azure devops app password](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows).
:::

## Port Webhook Configuration

Create the following webhook configuration [using Port UI](../../webhook/?operation=ui#configuring-webhook-endpoints)

<details>

<summary>Webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Azure DevOps Mapper`;
   2. Identifier : `azure_devops_mapper`;
   3. Description : `A webhook configuration to map Azure DevOps resources to Port`;
   4. Icon : `AzureDevops`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <AzureDevopsWebhookConfig/>

3. Click **Save** at the bottom of the page.

</details>

## Create a webhook in Azure DevOps

1. From your Azure DevOps account, open the project where you want to add the webhook;
2. Click **Project settings** on the left sidebar;
3. On the General section, select **Service hook** on the left sidebar;
4. Click the plus **+** button to create a webhook for the project;
5. A pop up page will be shown. Select **Web Hooks** from the list and click **Next**;
6. Under **Trigger**, select the type of event you want to receive webhook notifications for. The example webhook configuration supports the following events:
   1. Code pushed
   2. Run state changed
   3. Run job state changed
   4. Run stage state changed
   5. Work item created
   6. Work item updated
7. Leave the **Filters** section unchanged and click **Next**;
8. On the final page (**Action Settings**), enter the value of the webhook `URL` you received after creating the webhook configuration in Port in the `URL` textbox;
9. Test your webhook subscription and click **Finish**

Follow [this documentation](https://learn.microsoft.com/en-us/azure/devops/service-hooks/events?toc=%2Fazure%2Fdevops%2Fmarketplace-extensibility%2Ftoc.json&view=azure-devops) to learn more about webhook events in Azure DevOps.

Done! Any change that happens to your repository, work item or pipeline in Azure DevOps will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

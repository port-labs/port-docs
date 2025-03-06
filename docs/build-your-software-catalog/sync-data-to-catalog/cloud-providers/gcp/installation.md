---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import CreateServiceAccountAndKey from './\_create-service-account-and-key.mdx'
import GivePermissionsToNewServiceAccount from './\_give-permissions-to-new-service-account.mdx'

# Installation

## Installation Methods

The Google Cloud Ocean integration relies on the Google Cloud Client libraries, which are authenticated using Application Default Credentials.

In these guides, you can install the integration in various ways, according to the authentication method + platform you choose to run the integration on.

:::tip First Time Installation
For your first deployment of the GCP exporter, we recommend starting with the Helm/scheduled installation method to perform the initial data sync. Once the initial data sync is complete, you can switch to the Terraform deployment method for real-time data sync.
:::

<Tabs groupId="installation-platforms" queryString="installation-platforms" defaultValue="helm">
<TabItem value="helm" label="Helm (Scheduled)">  

The Ocean Google Cloud integration uses Google's ADC (Application Default Credentials). In order to properly set-up, this guide will be divided into two parts:

1. Creating a service account.
2. Running the Helm Command.

<CreateServiceAccountAndKey/>

<h2> Running the Helm command </h2>

:::info Data security
The Ocean integration does not store the encoded file anywhere.  
It is saved locally, and is NOT sent to Port at any time.
:::

1. Take the service account [key file you create](#fetching-key-file), and run this command:

  Linux/Mac (Bash/Zsh):

    ```bash
    cat <new-configuration-file> | base64 | pbcopy
    ```

  PowerShell:
    ```powershell
    [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("<new-configuration-file>")) | Set-Clipboard
    ```
  
  Windows Command Prompt (creates a file : new-configuration-file.b64):
    ```cmd
    certutil -encode <new-configuration-file> new-configuration-file.b64 && type new-configuration-file.b64 | clip
    ``` 

2. Run the following command:

   ```bash
   helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
   helm upgrade --install gcp port-labs/port-ocean \
     --set port.clientId="$PORT_CLIENT_ID"  \
     --set port.clientSecret="$PORT_CLIENT_SECRET_ID"  \
     --set port.baseUrl="https://api.getport.io"  \
     --set initializePortResources=true  \
     --set sendRawDataExamples=true  \
     --set scheduledResyncInterval=1440 \
     --set integration.identifier="ocean-gcp-integration"  \
     --set integration.type="gcp"  \
     --set integration.eventListener.type="POLLING"  \
     --set integration.config.encodedADCConfiguration="<paste_the_encoded_file_content_here>"
   ```

<h2> Optional- Scale permissions for a Service account </h2>

<GivePermissionsToNewServiceAccount/>

</TabItem>

<TabItem value="ci" label="CI/CD (Scheduled)">

<Tabs groupId="ci-methods" defaultValue="github" queryString="ci-methods">

<TabItem value="github" label="GitHub Actions">

The Ocean Google Cloud integration uses Google's ADC (Application Default Credentials). In order to properly set-up, this guide will be divided into two parts:

1. Creating a service account.
2. Setting up the GitHub Actions workflow.

<CreateServiceAccountAndKey/>

<h2> Setting up the GitHub Actions workflow </h2>

:::info Data security
The Ocean integration does not store the encoded file anywhere.  
It is saved locally, and is NOT sent to Port at any time.
:::

1. Take the service account [key file you create](#fetching-key-file), and run this command:

  Linux/Mac (Bash/Zsh):

    ```bash
    cat <new-configuration-file> | base64 | pbcopy
    ```

  PowerShell:
    ```powershell
    [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("<new-configuration-file>")) | Set-Clipboard
    ```
  
  Windows Command Prompt (creates a file : new-configuration-file.b64):
    ```cmd
    certutil -encode <new-configuration-file> new-configuration-file.b64 && type new-configuration-file.b64 | clip
    ``` 

   
Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

- Port API credentials, you can check out the [Port API documentation](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
  - `OCEAN__PORT_CLIENT_ID`
  - `OCEAN__PORT_CLIENT_SECRET`

- Google Cloud Service Account Key
  - `OCEAN__SECRET__ENCODED_ADC_CONFIGURATION` - Paste the encoded file content here.

Here is an example for `gcp-integration.yml` workflow file:

```yaml
name: GCP Integration

on:
  workflow_dispatch:
  schedule:
    - cron: '0 */4 * * *' # Determines the scheduled interval for this workflow. This example runs every 4 hours.

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - name: Run gcp Integration
        uses: port-labs/ocean-sail@v1
        with:
          type: gcp
          port_client_id: ${{ secrets.PORT_CLIENT_ID }}
          port_client_secret: ${{ secrets.PORT_CLIENT_SECRET }}
          port_base_url: "https://api.getport.io"
          config: |
            encoded_adc_configuration: ${{ secrets.OCEAN__SECRET__ENCODED_ADC_CONFIGURATION }}
```
</TabItem>

</Tabs>

</TabItem>

<TabItem value="docker" label="Docker(Once)">

The Ocean Google Cloud integration uses Google's ADC (Application Default Credentials). In order to properly set-up, this guide will be divided into two parts:

1. Creating a service account.
2. Running the Docker Command.

<CreateServiceAccountAndKey/>

<h2> Running the Docker command </h2>

:::warning
The Ocean integration doesn't store the encoded file anywhere but locally. It's NOT being sent to Port.
:::

1. Take the service account [key file you create](#fetching-key-file), and run this command:

  Linux/Mac (Bash/Zsh):

    ```bash
    cat <new-configuration-file> | base64 | pbcopy
    ```

  PowerShell:
    ```powershell
    [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("<new-configuration-file>")) | Set-Clipboard
    ```
  
  Windows Command Prompt (creates a file : new-configuration-file.b64):
    ```cmd
    certutil -encode <new-configuration-file> new-configuration-file.b64 && type new-configuration-file.b64 | clip
    ``` 

2. Run the following command:

   ```bash
   docker run -i --rm --platform=linux/amd64 \
   -e OCEAN__PORT__CLIENT_ID="$PORT_CLIENT_ID" \
   -e OCEAN__PORT__CLIENT_SECRET="$PORT_CLIENT_SECRET" \
   -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
   -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
   -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
   -e OCEAN__EVENT_LISTENER='{"type": "ONCE"}' \
   -e OCEAN__INTEGRATION__CONFIG__ENCODED_ADC_CONFIGURATION="<paste_the_encoded_file_content_here>" \
   ghcr.io/port-labs/port-ocean-gcp:latest
   ```

<h2> Optional- Scale permissions for a Docker Service account </h2>

<GivePermissionsToNewServiceAccount/>

</TabItem>

<TabItem value="terraform" label="Terraform ( Real Time Events )">  

The GCP integration is deployed using Terraform on Google Cloud Cloud Run.  
It uses our Terraform [Ocean](https://ocean.getport.io) Integration Factory [module](https://registry.terraform.io/modules/port-labs/integration-factory/ocean/latest) to deploy the integration.

<h2> Prerequisites </h2>

- [Terraform](https://www.terraform.io/downloads.html) >= 1.9.1
- [hashicorp/google Terraform Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs) >= 5.25
- [hashicorp/google-beta Terraform Provider](https://registry.terraform.io/providers/hashicorp/google-beta/latest) >= 5.25
- [A logged in gCloud CLI](https://cloud.google.com/sdk/gcloud) with enough [Permissions](#required-permissions-to-run-terraform-apply)
- [Artifact Registry Image](#artifact-registry-image)
- Enabled APIs:
  - [Cloud Asset API](https://cloud.google.com/asset-inventory/docs/export-asset-metadata)
  - [Cloud Resource Manager API](https://cloud.google.com/resource-manager/docs/manage-google-cloud-resources)
  - [Cloud Quota API](https://cloud.google.com/docs/quotas/development-environment)

<h2> Artifact Registry Image </h2>

In order to run the Cloud Run Service, it's mandatory to have a working Image. Currently our GHCR based images aren't supported by Google Cloud's Cloud run platform, so a manual installation to Dockerhub\Artifact registry is required. In the guide we specify an Artifact registry approach, but a similar DockerHub approach should yield the same results:  

1. Create an Artifact Registry in GCP.
2. Pull our AMD based image from our GHCR registry

   ```docker pull ghcr.io/port-labs/port-ocean-gcp --platform amd64```
3. Tag this image

   ```docker tag ghcr.io/port-labs/port-ocean-gcp:latest <your_artifact_registry_/_dockerhub>/port-ocean-gcp:<your_version>```
4. Push the image to your artifact registry:

   ```docker push <your_artifact_registry_/_dockerhub>/port-ocean-gcp:<your_version>```

<h2> Required permissions to run terraform apply </h2>

In order to successfully deploy the Google Cloud integration, it's crucial to ensure that the user who deploys the integration in the GCP Organization has the appropriate access permissions.

The Google Cloud integration uses the following GCP infrastructure:

- GCP Cloud Run.
- GCP PubSub Topic & Subscription.
- GCP Roles & Service accounts.
- GCP Cloud Assets
  - GCP Cloud Asset Inventory
  - GCP Cloud Asset Feed  (Used for real-time data sync to Port)

:::tip
   Our Terraform module creates a dedicated service account with it's own permissions, and is not related to these permissions.
:::

You can either deploy using your own permissions, or [impersonating a service account](https://cloud.google.com/docs/authentication/provide-credentials-adc#service-account). Either way, the following permissions should be granted:

<details>
<summary> Required Permissions </summary>
```
cloudasset.assets.exportResource
cloudasset.feeds.create
cloudasset.feeds.delete
cloudasset.feeds.get
cloudasset.feeds.list
cloudasset.feeds.update
iam.roles.create
iam.roles.delete
iam.roles.get
iam.roles.undelete
iam.roles.update
iam.serviceAccountKeys.get
iam.serviceAccounts.actAs
iam.serviceAccounts.create
iam.serviceAccounts.delete
iam.serviceAccounts.get
pubsub.subscriptions.consume
pubsub.subscriptions.create
pubsub.subscriptions.delete
pubsub.subscriptions.get
pubsub.subscriptions.list
pubsub.subscriptions.update
pubsub.topics.attachSubscription
pubsub.topics.create
pubsub.topics.delete
pubsub.topics.get
pubsub.topics.list
pubsub.topics.update
resourcemanager.organizations.getIamPolicy
resourcemanager.organizations.setIamPolicy
run.operations.get
run.services.create
run.services.delete
run.services.get
serviceusage.services.use
```
</details>

<h2> Installation walkthrough </h2>

Run the following commands. Make sure to replace `<placeholders>` with actual values.
:::tip
If you want the integration to collect resources from more projects/folders/organization, make sure that you set up [permissions properly](#optional---scaling-the-permissions).
:::

```bash
echo 'provider "google-beta" { user_project_override = true }
provider "google" { user_project_override = true }
module "gcp" {
source = "port-labs/integration-factory/ocean//examples/gcp_cloud_run" 
version = ">=0.0.31" 
port_client_id = "<your_port_client_id>" 
port_client_secret = "<your_port_client_secret>" 
gcp_ocean_integration_image = "<your_artifact_registry_/_dockerhub>/port-ocean-gcp:<your_version>" 
gcp_organization = "<your_gcp_organization>" 
gcp_ocean_setup_project = "<your_gcp_project>" 
gcp_included_projects = ["<your_gcp_project>"] # The Project list that the integration digests resources from.
gcp_project_filter = "<filter>" # The filter string used to retrieve GCP projects, allowing complex filtering by combining multiple conditions with logical operators (AND | OR).
integration_identifier = "gcp"
scheduled_resync_interval = 1440
event_listener = {
  type = "POLLING"
}
}' > main.tf
# Initializing Terraform and Providers
terraform init
# Creating the resources (Cloud Run, PubSub Topic + Subscription, Cloud Assets Feed, Service account + Role)
terraform apply
```

<h2> Configuration options </h2>

The Port GCP integration's Terraform module offers a set of configurations:

| Configuration | Default value | Required | Description |
| --- | --- | --- | --- |
| `port_client_id` |  | True | The Port client id.  |
| `port_client_secret` |  | True | The Port client secret.  |
| `gcp_organization` |  | True | Your Google Cloud Organization Id.  |
| `gcp_ocean_setup_project` |  | True | The Project to create all the Integration's infrastructure (Topic, Subscription, Service account etc.) on.  |
| `gcp_ocean_integration_image` |  | True | The Artifact Registry / Dockerhub image to deploy.  |
| `integration_identifier` |  | True | The Integration's identifier in Port  |
| `port_base_url` | 'https://api.getport.io' | False | The Port Base url.  |
| `gcp_included_projects` | [] | False | The Projects list you want the integration to collect from. If left empty, It will collect *All* projects in the organization. `This option will be deprecated soon.`  |
| `gcp_cloud_run_cpu` | 2 | False | The CPU limit for the Cloud Run service  |
| `gcp_cloud_run_memory` | 1024Mi | False | The Memory limit for the Cloud Run service  |
| `gcp_project_filter` |  | False | The filter string used to retrieve GCP projects, allowing complex filtering by combining multiple conditions with logical operators. Follows GCP's [filter expressions syntax](https://registry.terraform.io/providers/hashicorp/google/latest/docs/data-sources/projects#filter-1). Example `parent.id:184606565139 labels.environment:production AND labels.team:devops OR labels priority:high` |
| `gcp_excluded_projects` | [] | False | The Projects list you want the integration NOT to collect from. This will be overridden by any value in gcp_included_projects besides []. `This option will be deprecated soon.` |
| `assets_types_for_monitoring` | ["cloudresourcemanager.googleapis.com/Organization", "cloudresourcemanager.googleapis.com/Project", "storage.googleapis.com/Bucket", "cloudfunctions.googleapis.com/Function", "pubsub.googleapis.com/Subscription", "pubsub.googleapis.com/Topic"] | False | The list of asset types the integration will digest real-time events for.  |
| `ocean_integration_service_account_permissions` | ["cloudasset.assets.exportResource", "cloudasset.assets.listCloudAssetFeeds", "cloudasset.assets.listResource", "cloudasset.assets.searchAllResources", "cloudasset.feeds.create", "cloudasset.feeds.list", "pubsub.topics.list", "pubsub.topics.get", "pubsub.subscriptions.list", "pubsub.subscriptions.get", "resourcemanager.projects.get", "resourcemanager.projects.list", "resourcemanager.folders.get", "resourcemanager.folders.list", "resourcemanager.organizations.get", "cloudquotas.quotas.get", "run.routes.invoke", "run.jobs.run"] | False | The permissions granted to the integration's service_account. We recommend not changing it to prevent unexpected errors.  |
| `assets_feed_topic_id` | "ocean-integration-topic" | False | The name of the topic created to receive real time events.  |
| `assets_feed_id` | "ocean-gcp-integration-assets-feed" | False | The ID for the Ocean GCP Integration feed.  |
| `service_account_name` | "ocean-service-account" | False | The name of the service account used by the Ocean integration.  |
| `role_name` | "OceanIntegrationRole" | False | The name of the role created for the Integration's Service account.  |
| `gcp_ocean_integration_cloud_run_location` | "europe-west1" | False | Location in which the Cloud Run will run.  |
| `environment_variables` | [] | False | List of environment variables set to the Cloud Run job. We recommend not changing this variable.  |
| `initialize_port_resources` | True | False | Boolean to initialize Port resources.  |
| `event_listener` | Polling | False | Port's event listener configurations.  |
| `integration_version` | "latest" | False | The version of the integration to deploy.  |
| `integration_type` | "gcp" | False | The type of the integration.  |
| `scheduled_resync_interval` | 1440 | False | The interval to resync the integration (in minutes).  |
| `ocean_service_account_custom_roles` | [] | False | A list of custom roles you want to grant the Integration's Service account. The module will grant these permissions to every available project and to the setup project `gcp_ocean_setup_project`. Example value: ["organizations/1234567890/roles/MyCustomRole", "organizations/1234567890/roles/MyOtherCustomRole"]  |

<h2>Optional - Project Filtering</h2>

You have the option to specify which projects are included or excluded for real-time events. This can be particularly useful when you have a large number of projects and want to target specific ones based on certain criteria.

:::warning Deprecation Notice
The variables `gcp_included_projects` and `gcp_excluded_projects` are deprecated and will be removed in future releases. We recommend using the gcp_project_filter variable for project filtering moving forward.
:::

You can use the following three filtering strategies together:

- `gcp_excluded_projects`
- `gcp_included_projects`
- `gcp_project_filter`

However, please note the priority conditions when using them simultaneously.

<h2>Priority Conditions</h2>
You can use all three filtering strategies together, but it's important to understand how they interact. The following priority conditions apply:

- **gcp_included_projects (Highest Priority):**
  - When specified, only the projects listed in `gcp_included_projects` are included.
  - All other filters (`gcp_excluded_projects` and `gcp_project_filter`) are ignored.
  - Use this when you have a specific list of projects to include, regardless of other criteria.

- **gcp_excluded_projects:**
  - If `gcp_included_projects` is not specified but `gcp_excluded_projects` is provided, all projects are included except those listed.
  - The `gcp_project_filter` is still applied, further refining the included projects.

- **gcp_project_filter:**
  - If neither `gcp_included_projects` nor `gcp_excluded_projects` are specified, and `gcp_project_filter` is provided, only projects matching the filter criteria are included.
  - This allows for flexible and complex filtering using GCP's native filtering syntax.

- **Default Behavior (Lowest Priority):**
  - If none of the above variables are specified, all projects in your GCP organization are included by default.

<h2> Optional - Scaling the permissions </h2>

If you want the integration to collect resources from multiple projects/folders or to have it collect from the entire organization, you need to have permissions to create/view additional resources. Follow these instructions to make sure you are equipped with enough permissions.

1. Make sure you are connected to your Organization.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/gcp/your_organization.png' width='50%' border='1px' /> <br/><br/>

1. In the search text box, search for `roles`. Click the `IAM & Admin` option.
2. Click on `CREATE ROLE`.
3. Click on `ADD PERMISSIONS`, and select all the permissions from [the above section](#required-permissions-to-run-terraform-apply)
4. In the search text box, search for `manage resources`. Click the `IAM & Admin` option.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/gcp/search_manage_resources.png' width='50%' border='1px' /> <br/><br/>

5. In the `Resources` Table, you see all projects+folders connected to your organization.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/gcp/manage_resources_table.png' width='50%' border='1px' /> <br/><br/>

6. Pick your desired scope (organization/folders/projects), using the left checkboxes.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/gcp/click_desired_scope.png' width='50%' border='1px' /> <br/><br/>

7. This will open up a menu on the right side.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/gcp/permissions_menu.png' width='50%' border='1px' /> <br/><br/>

8. Click on `ADD PRINCIPLE`

9.  Here, Enter your's or your service account's email, and grant it your newly created `Role`.

</TabItem>
</Tabs>

## Further Examples

Refer to the [examples](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/gcp/examples/) page for practical configurations and their corresponding blueprint definitions.

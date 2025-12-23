---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import CreateServiceAccount from './\_create-service-account.mdx'
import CreateKey from './\_create-key.mdx'
import GivePermissionsToNewServiceAccount from './\_give-permissions-to-new-service-account.mdx'
import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"

# Installation

<IntegrationVersion integration="gcp" />

## Installation Methods

The Google Cloud Ocean integration relies on the Google Cloud Client libraries, which are authenticated using Application Default Credentials.

In these guides, you can install the integration in various ways, according to the authentication method + platform you choose to run the integration on.

:::tip First Time Installation
For your first deployment of the GCP exporter, we recommend starting with the Helm/scheduled installation method to perform the initial data sync. Once the initial data sync is complete, you can switch to the Terraform deployment method for real-time data sync.
:::

<Tabs groupId="installation-platforms" queryString="installation-platforms" defaultValue="helm">
<TabItem value="helm" label="Helm (Scheduled)">  

The Ocean Google Cloud integration uses Google's ADC (Application Default Credentials). In order to properly set up, this guide will be divided into four parts:

1. Checking the prerequisites.
2. Creating a service account.
3. Choosing an authentication method.
4. Installing the integration using Helm.

<CreateServiceAccount/>

<h2> Choose authentication method </h2>

After creating the service account, choose one of the following authentication methods:

<Tabs groupId="helm-auth-method" queryString="helm-auth-method" defaultValue="service-account-key">

<TabItem value="workload-identity" label="Workload Identity (Recommended)">

The Ocean Google Cloud integration can use Google's Workload Identity to authenticate without requiring service account key files. This method is recommended for Kubernetes deployments.

<Tabs groupId="kube-deployments" queryString="kube-deployments" defaultValue="gke">

<TabItem value="gke" label="Google Kubernetes Engine (GKE)">

<h3> Setting up Kubernetes </h3>

1. Set up a Kubernetes cluster in the Kubernetes Engine in GCP.

2. Enable Workload Identity in the cluster:

   ```bash
   gcloud container clusters update CLUSTER_NAME --workload-pool=PROJECT_ID.svc.id.goog --region REGION
   ```
   Replace the following placeholders:
   - `CLUSTER_NAME` with the cluster name
   - `PROJECT_ID` with the Kubernetes cluster's project id
   - `REGION` The region of the cluster
3. Make sure you are connected to the cluster through the CLI:
   ```bash
   gcloud container clusters get-credentials CLUSTER_NAME --region REGION --project PROJECT_ID
   ```
   Replace the following placeholders:
   - `CLUSTER_NAME` with the cluster name
   - `PROJECT_ID` with the Kubernetes cluster's project id
   - `REGION` The region of the cluster
4. Bind the Kubernetes service account to the GCP service account:
  :::tip
  No need for the Kubernetes service account to exist in this point , We'll create it once we deploy the helm chart
  :::
   ```bash showLineNumbers
   gcloud iam service-accounts add-iam-policy-binding GCP_SERVICE_ACCOUNT_EMAIL \
     --role roles/iam.workloadIdentityUser \
     --member "serviceAccount:PROJECT_ID.svc.id.goog[NAMESPACE/KUBERNETES_SA_NAME]"
   ```

   Replace the following placeholders:
   - `GCP_SERVICE_ACCOUNT_EMAIL` with your GCP service account email.
   - `PROJECT_ID` with your GCP project ID.
   - `NAMESPACE` with your Kubernetes namespace.
   - `KUBERNETES_SA_NAME` with the Kubernetes service account name that will be used in the integration's values.yaml. (Note: the service account doesn't need to exist)

<h3> Configuring and running the Helm command </h3>

1. Add the Port Labs Helm repository:

   ```bash
   helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
   ```

2. Create a `values.yaml` file with the following configuration:

   ```yaml showLineNumbers
   port:
     clientId: "<port-client-id>"
     clientSecret: "<port-client-secret-id>"
     baseUrl: "https://api.getport.io"
   
   initializePortResources: true
   sendRawDataExamples: true
   scheduledResyncInterval: 1440
   
   integration:
     identifier: "ocean-gcp-integration"
     type: "gcp"
     eventListener:
       type: "POLLING"
     config:
       extraConfig:
         GCP_PROJECT: "<base-gcp-project>"
   
   podServiceAccount:
     create: true
     name: "<service-account-from-step-3>"
     annotations:
       iam.gke.io/gcp-service-account: "<gcp-service-account-email>"
   ```

   Replace the following placeholders:
   - `<port-client-id>` with your Port client ID.
   - `<port-client-secret-id>` with your Port client secret.
   - `<base-gcp-project>` with your base GCP project ID.
   - `<service-account-from-step-3>` with the Kubernetes service account name from step 3.
   - `<gcp-service-account-email>` with the GCP service account email from step 7 in the *Creating a service account* guide above.

3. Install the integration using Helm:

   ```bash
   helm upgrade --install gcp port-labs/port-ocean -f values.yaml
   ```

</TabItem>
<TabItem value="self-hosted-kubernetes" label="Self-hosted Kubernetes">

### Setting up Kubernetes

  1. Make sure your cluster meets the following criteria:

      - You're running Kubernetes 1.20 or later.

        Previous versions of Kubernetes used a different ServiceAccount token format that is not compatible with the instructions in this document.

      - You configured kube-apiserver so that it supports [ServiceAccount token volume projections](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#serviceaccount-token-volume-projection).

  The cluster doesn't need to be accessible over the internet.


### Configure workload identity federation

  :::note
    Ensure billing is enabled in your Google cloud project.
  :::

  1. [Enable](https://console.cloud.google.com/flows/enableapi?apiid=iam.googleapis.com,cloudresourcemanager.googleapis.com,iamcredentials.googleapis.com,sts.googleapis.com&redirect=https://console.cloud.google.com) the IAM, Resource Manager, Service Account Credentials, and Security Token Service APIs.
  
  2. Create workload identity pool and provider:

      - Get your cluster issuer url, this will be used in later steps:
            ```sh showLineNumbers
               kubectl get --raw /.well-known/openid-configuration | jq -r .issuer
            ```
      - Download the cluster's JSON Web Key Set (JWKS):
            ```sh showLineNumbers
               kubectl get --raw /openid/v1/jwks > cluster-jwks.json
            ```
        In one of the following steps, you upload the JWKS so that Workload Identity Federation can verify the authenticity of the Kubernetes ServiceAccount tokens issued by your cluster.
  3. Create a new workload identity pool:

     ```sh showLineNumbers
      gcloud iam workload-identity-pools create POOL_ID \
      --location="global" \
      --description="DESCRIPTION" \
      --display-name="DISPLAY_NAME"
        ```

    replace the following placeholders:
      - `POOL_ID` with a unique identifier for the new pool.
      - `DESCRIPTION` with a description of the pool.
      - `DISPLAY_NAME` with the name of the pool.

  4. Add the Kubernetes cluster as a workload identity pool provider and upload the cluster's JWKS:
    ```sh showLineNumbers
    gcloud iam workload-identity-pools providers create-oidc WORKLOAD_PROVIDER_ID \
      --location="global" \
      --workload-identity-pool="POOL_ID" \
      --issuer-uri="ISSUER" \
      --attribute-mapping="google.subject=assertion.sub" \
      --jwk-json-path="cluster-jwks.json"
            ```
    replace the following placeholders:
      - `WORKLOAD_PROVIDER_ID` with a unique identifier for the new provider.
      - `POOL_ID` with id of the pool created in step 3.
      - `ISSUER` with the cluster url we determined earier.


  ### Grant access to Kubernetes workload

  1. Grant the Kubernetes ServiceAccount access to impersonate the IAM service account:
      The Kubernetes ServiceAccount does not have to exist yet, we'll create it in a later step when we deploy the workload, just take note of the name.
      ```sh showLineNumbers
          gcloud iam service-accounts add-iam-policy-binding \
            SERVICE_ACCOUNT_EMAIL \
              --member="principal://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/subject/MAPPED_SUBJECT" \
              --role=roles/iam.workloadIdentityUser
          ```
      Replace the following placeholders:
      - `SERVICE_ACCOUNT_EMAIL` with email of your service account.
      - `PROJECT_NUMBER` with the Google Cloud project number (Not project id).
      - `POOL_ID` with the pool id we created in step 3
      - `MAPPED_SUBJECT` with the full name of the Kubernetes service account we'll create, including namespace. It should look something like: `system:serviceaccount:default:my-kube-workload-id-serviceaccount`

    
  ### Deploy the Kubernetes workload

  1. Create a credentials file:
      ```sh showLineNumbers
        gcloud iam workload-identity-pools create-cred-config \
            projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/WORKLOAD_PROVIDER_ID \
            --service-account=SERVICE_ACCOUNT_EMAIL \
            --credential-source-file=/var/run/service-account/token \
            --credential-source-type=text \
            --sts-location=global \
            --output-file=credential-configuration.json
          ```
      Replace the following placeholders: 
      - `SERVICE_ACCOUNT_EMAIL` with email of your service account.
      - `PROJECT_NUMBER` with the Google Cloud project number (Not project id).
      - `POOL_ID` with the pool id we created in step 3
      - `WORKLOAD_PROVIDER_ID` with id of the cluster workload provider we created in step 4 of [configure workload identity federation](#configure-workload-identity-federation)

    :::note
          Unlike a [service account key](https://docs.cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys), a credential configuration file doesn't contain a private key and doesn't need to be kept confidential. Details about the credential configuration file are available at https://google.aip.dev/auth/4117.
    :::

  2. Create a base64 representation of the credentials file and copy it to your clip board:
     ```sh showLineNumbers
      cat credential-configuration.json | base64 | pbcopy
          ```

  3. Make a values.yaml file with the following configuration:


            ```yaml showLineNumbers
            port:
              clientId: "PORT_CLIENT_ID"
              clientSecret: "PORT_CLIENT_SECRET"
              baseUrl: "https://api.getport.io"

            initializePortResources: true
            sendRawDataExamples: true
            scheduledResyncInterval: 1440

            integration:
              identifier: "ocean-gcp-integration"
              type: "gcp"
              eventListener:
                type: "POLLING"
              config:
                  encodedADCConfiguration: "BASE64_ENCODED_CREDENTIALS"
              extraConfig:
                  GCP_PROJECT: "GCP_PROJECT_ID"

            extraVolumeMounts:
              - name: token
                mountPath: "/var/run/service-account"
                readOnly: true
            extraVolumes:
              - name: token
                projected:
                  sources:
                  - serviceAccountToken:
                      audience: "https://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/WORKLOAD_PROVIDER_ID"
                      expirationSeconds: 3600
                      path: token

            podServiceAccount:
              create: true
              name: "my-kube-workload-id-serviceaccount`"
              annotations:
                iam.gke.io/gcp-service-account: "SERVICE_ACCOUNT_EMAIL"
              ```

    Replace the following placeholders values:
    - `PORT_CLIENT_ID` with your Port client id.
    - `PORT_CLIENT_SECRET` with your Port client secret.
    - `BASE64_ENCODED_CREDENTIALS`  with base64 encoded credentials file from step 2.
    - `GCP_PROJECT_ID` with your GCP project's id.
    - `PROJECT_NUMBER` with your GCP project's number.
    - `POOL_ID` with the pool id we created earlier.
    - `WORKLOAD_PROVIDER_ID` with the workload provider id we created earlier.
    - `SERVICE_ACCOUNT_EMAIL` with your service account email.

  3. Install the integration using helm:
     ```sh showLineNumbers
     helm upgrade --install gcp port-labs/port-ocean -f values.yaml
            ```


</TabItem>

</Tabs>

  For additional information on GCP workload identity, including deploying to other Kubernetes providers, please refer to [GCP workload identity documentation](https://docs.cloud.google.com/iam/docs/workload-identity-federation).

</TabItem>
<TabItem value="service-account-key" label="Service Account Key">

The Ocean Google Cloud integration uses Google's ADC (Application Default Credentials) with a service account key file.

<CreateKey/>

<h3> Running the Helm command </h3>

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

</TabItem>
</Tabs>

<h3> Optional - Scale permissions for a service account </h3>

<GivePermissionsToNewServiceAccount/>

</TabItem>

<TabItem value="ci" label="CI/CD (Scheduled)">

<Tabs groupId="ci-methods" defaultValue="github" queryString="ci-methods">

<TabItem value="github" label="GitHub Actions">

The Ocean Google Cloud integration uses Google's ADC (Application Default Credentials). In order to properly set-up, this guide will be divided into two parts:

1. Creating a service account.
2. Setting up the GitHub Actions workflow.

<CreateServiceAccount/>
<CreateKey/>

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

<CreateServiceAccount/>
<CreateKey/>

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

The GCP integration is deployed using Terraform on Google Cloud Run.  
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

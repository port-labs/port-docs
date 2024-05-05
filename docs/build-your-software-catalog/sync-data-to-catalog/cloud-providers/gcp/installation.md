---
sidebar_position: 1
---

# Installation

The GCP integration is deployed using Terraform on Google Cloud Cloud Run.  
It uses our Terraform [Ocean](https://ocean.getport.io) Integration Factory [module](https://registry.terraform.io/modules/port-labs/integration-factory/ocean/latest) to deploy the integration.

## Infrastructure

The Google Cloud integration uses the following GCP infrastructure:

- GCP Cloud Run.
- GCP PubSub Topic & Subscription.
- GCP Roles & Service accounts.
- GCP Cloud Assets
  - GCP Cloud Asset Inventory
  - GCP Cloud Asset Feed  (Used for real-time data sync to Port)

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) >= 0.15.0
- [A logged in gCloud CLI](https://cloud.google.com/sdk/gcloud)
- [Artifact Registry Image](https://cloud.google.com/artifact-registry/docs/docker/manage-images)
- [Permissions](#permissions)

## Artifact Registry Image

In order to run the Cloud Run Service, it's mandatory to have a working Image. Currently our GHCR based images aren't supported by Google Cloud's Cloud run platform, so a manual installation to Dockerhub\Artifact registry is required. In the guide we specify an Artifact registry approach, but a similar DockerHub approach should yield the same results:  

1. Create an Artifact Registry in GCP.
2. Pull our AMD based image from our GHCR registry
    
    ```docker pull ghcr.io/port-labs/port-ocean-gcp --platform amd64```
3. Tag this image
   
   ```docker tag ghcr.io/port-labs/port-ocean-gcp:latest <your_artifact_registry_/_dockerhub>/port-ocean-gcp:<your_version>```
4. Push the image to your artifact registry:
   
   ```docker push <your_artifact_registry_/_dockerhub>/port-ocean-gcp:<your_version>```

## Permissions

In order to successfully deploy the GCP integration, it's crucial to ensure that the user who deploys the integration in the GCP Organization has the appropriate access permissions.

:::tip
   The installation process also includes an Integration-Specific service account. Pay attention that the permissions required here are not the same as the permissions that the integration's service account has. 
:::

- The user can have the `Owner` GCP role assigned to him for the Organization that the integration will be deployed on. This role provides comprehensive control and access rights;
- For a more limited approach, the user should possess the minimum necessary permissions required to carry out the integration deployment. These permissions will grant the user access to specific resources and actions essential for the task without granting full `Owner` privileges. The following steps will guide you through the process of creating a custom role and assigning it to the user along with other required roles:

  - Create a [service account](https://cloud.google.com/iam/docs/service-accounts-create) in a project
  - Create a [custom organization role](https://cloud.google.com/resource-manager/docs/access-control-org) with these permissions:
    <details>
    <summary> Custom Role Permissions </summary>
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
  - Go to the `Manage Resources` window at your organization's GCP
    - Click on the Organization
    - At the right side, Clock on `Add Principal`
    - Here, Enter your new service account principal, and grant it your newly created Role.

## Installation walkthrough

1. Go to Port's [Data Sources](https://app.getport.io/settings/data-sources?section=integrationS) and click on GCP
2. Edit and copy the installation command.
3. Run the command in your terminal to deploy the GCP integration.

## [Further Examples](./examples/examples.md)

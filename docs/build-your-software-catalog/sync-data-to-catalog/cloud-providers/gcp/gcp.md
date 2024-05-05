---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Image from "@theme/IdealImage";

# GCP

Our integration with GCP provides the ability to export your Google Cloud resources to Port, according to your configuration.
After the initial import of data, the integration will also listen to live events from Googel Cloud to update data inside Port in real time.

Our integration with GCP supports real-time event processing, this allows for an accurate **real-time** representation of your Google Cloud infrastructure inside Port.

:::tip
Port's Google Cloud exporter is open source, view the source code [**here**](https://github.com/port-labs/ocean/tree/main/integrations/gcp).
:::

## 💡 GCP integration common use cases

Our GCP integration makes it easy to fill the software catalog with data directly from your GCP Organization, for example:

- Map all the resources in your Google Cloud Projects, including **Container Clusters**, **Cloud Run Services**, **BigQuery Tables**, **Compute engine Autoscaler** and other GCP objects;
- Watch for Google Cloud object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port;
- Use relations to create complete, easily digestible views of your Google Cloud infrastructure inside Port.

## Installation

To install Port's Google Cloud exporter, follow the [installation](./installation.md) guide.

## How it works

Port's Google Cloud exporter can retrieve all the resources supported by the [Cloud Assets API](https://cloud.google.com/asset-inventory/docs/supported-asset-types), and export them to Port as entities of existing blueprints.

The GCP exporter allows you to perform extract, transform, load (ETL) on data from the Cloud Assets API into the desired software catalog data model.

The exporter is deployed using an GCP's [Cloud Run](https://cloud.google.com/run?hl=en) that is deployed to your GCP Project.

The GCP exporter uses a YAML configuration to describe the ETL process to load data into the developer portal. The approach reflects a middle-ground between an overly opinionated GCP visualization that might not work for everyone and a too-broad approach that could introduce unneeded complexity into the developer portal.

Here is an example snippet from the config which demonstrates the ETL process for getting `PubSub Subscription` data from GCP and into the software catalog:

```yaml showLineNumbers
resources:
  # Extract
  # highlight-start
  - kind: pubsub.googleapis.com/Subscription
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    # highlight-end
    port:
      entity:
        mappings:
          # Transform & Load
          # highlight-start
          identifier: '.name'
          title: '.versioned_resources | max_by(.version).resource | .name'
          blueprint: '"gcpPubSubSubscription"'
          properties:
            location: .location
            topicMesssageRetentionDuration: ".versioned_resources | max_by(.version).resource | .topicMessageRetentionDuration"
            pushConfig: ".versioned_resources | max_by(.version).resource | .pushConfig"
            retainAckedMessages: ".versioned_resources | max_by(.version).resource | .retainAckedMessages"
         relations:
            project: ".project"
          # highlight-end
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Google Cloud's Cloud Asset API events.

### The integration configuration structure

The integration configuration is a YAML file that describes the ETL process to load data into the developer portal.

- The `resources` section describes the Google Cloud resources to be ingested into Port.
  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: pubsub.googleapis.com/Subscription
      selector:
      ...
  ```
- The `kind` field describes the GCP resource type to be ingested into Port.
  The `kind` field should be set to the GCP resource type as it appears in the [Supported Asset Docs](https://cloud.google.com/asset-inventory/docs/supported-asset-types).
  ```yaml showLineNumbers
  resources:
    # highlight-start
    - kind: pubsub.googleapis.com/Subscription
      # highlight-end
      selector:
      ...
  ```
- The `selector` field describes the GCP resource selection criteria.

  ```yaml showLineNumbers
  resources:
    - kind: pubsub.googleapis.com/Subscription
      # highlight-start
      selector:
        query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
      # highlight-end
  ```

  - The `query` field is a [JQ boolean query](https://stedolan.github.io/jq/manual/#Basicfilters), if evaluated to `false` - the resource will be skipped. Example use case - skip syncing resources that are not in a specific region.
    ```yaml showLineNumbers
    query: .location == "global"
    ```

- The `port` field describes the Port entity to be created from the GCP resource.
  ```yaml showLineNumbers
  resources:
    - kind: pubsub.googleapis.com/Subscription
      selector:
        query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
      # highlight-start
      port:
      entity:
        mappings:
          identifier: '.name'
          title: '.versioned_resources | max_by(.version).resource | .name'
          blueprint: '"gcpPubSubSubscription"'
          properties:
            location: .location
            topicMesssageRetentionDuration: ".versioned_resources | max_by(.version).resource | .topicMessageRetentionDuration"
            pushConfig: ".versioned_resources | max_by(.version).resource | .pushConfig"
            retainAckedMessages: ".versioned_resources | max_by(.version).resource | .retainAckedMessages"
         relations:
            project: ".project"
        # highlight-end
  ```
  - The `entity` field describes the Port entity to be created from the GCP resource.
    ```yaml showLineNumbers
    resources:
      - kind: Microsoft.App/containerApps
        selector:
          query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
        port:
        # highlight-start
        entity:
         mappings:
          # Transform & Load
          identifier: '.name'
          title: '.versioned_resources | max_by(.version).resource | .name'
          blueprint: '"gcpPubSubSubscription"'
          properties:
            location: .location
            topicMesssageRetentionDuration: ".versioned_resources | max_by(.version).resource | .topicMessageRetentionDuration"
            pushConfig: ".versioned_resources | max_by(.version).resource | .pushConfig"
            retainAckedMessages: ".versioned_resources | max_by(.version).resource | .retainAckedMessages"
         relations:
            project: ".project"
          # highlight-end
    ```

### Authorization

The exporter will need to have access to your GCP Organization in order to export your resources to Port.
This is done by assigning a [Service Account](https://cloud.google.com/iam/docs/service-account-overview) to the exporter, and granting that identity the required permissions to your GCP Organization.

As part of the installation process, you will be provided with the default required permissions that the exporter will have to your GCP Organization.
This will be defined by specifying the [permissions](https://cloud.google.com/iam/docs/service-account-overview#service-account-permissions) that the exporter will be allowed to perform on your GCP Organization.

Here is an example of permissions that could be assigned to the exporter:

```yaml showLineNumbers
"cloudasset.assets.exportResource",
"cloudasset.assets.listCloudAssetFeeds",
"cloudasset.assets.listResource",
"cloudasset.assets.searchAllResources",
"cloudasset.feeds.create",
"cloudasset.feeds.list",
"pubsub.topics.list",
"pubsub.topics.get",
"resourcemanager.projects.get",
"resourcemanager.projects.list",
"resourcemanager.folders.get",
"resourcemanager.folders.list",
"resourcemanager.organizations.get",
"run.routes.invoke",
"run.jobs.run",
```

## Getting started

Continue to the [installation](./installation.md) guide to learn how to install the GCP exporter.

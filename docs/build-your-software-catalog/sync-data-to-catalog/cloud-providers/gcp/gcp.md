---
sidebar_position: 2
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Image from "@theme/IdealImage";

# GCP

Our GCP integration allows you to import your Google Cloud resources into Port, according to your configuration.  
After the initial import of data, the integration will also listen to live events from Google Cloud to update data in Port in real time.  

The integration with GCP supports real-time event processing, which allows for an accurate **real-time** representation of your Google Cloud infrastructure inside Port.

:::tip
Port's Google Cloud integration is open source, view the source code [**here**](https://github.com/port-labs/ocean/tree/main/integrations/gcp).
:::

## 💡 GCP integration common use cases

Easily fill your software catalog with data directly from your GCP Organization, for example:  

- Map all the resources in your Google Cloud Projects, including **Container Clusters**, **Cloud Run Services**, **BigQuery Tables**, **Compute engine Autoscaler** and other GCP objects.
- Watch for Google Cloud object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Use relations to create complete, easily digestible views of your Google Cloud infrastructure inside Port.

## How it works

Port's Google Cloud integration can retrieve all the resources supported by the [Cloud Assets API](https://cloud.google.com/asset-inventory/docs/supported-asset-types), and export them to Port as entities of existing blueprints.

The GCP integration allows you to perform extract, transform, load (ETL) on data from the Cloud Assets API into the desired software catalog data model.

## Getting started

Continue to the [installation](./installation.md) guide to learn how to install the GCP integration.

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration you get after installing the GCP integration.

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
- kind: cloudresourcemanager.googleapis.com/Project
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .name
        blueprint: '"gcpProject"'
        title: .display_name
        properties:
          labels: .labels
- kind: container.googleapis.com/Cluster
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .name
        title: .name | split("/") | last
        blueprint: '"gcpCloudResource"'
        properties:
          type: .name | split("/") | .[-2]
          location: .location
          labels: .labels
        relations:
          project: .__project.name
- kind: cloudfunctions.googleapis.com/CloudFunction
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .name
        title: .name | split("/") | last
        blueprint: '"gcpCloudResource"'
        properties:
          type: .name | split("/") | .[-2]
          location: .location
          labels: .labels
        relations:
          project: .__project.name
- kind: pubsub.googleapis.com/Topic
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .name
        title: .name | split("/") | last
        blueprint: '"gcpCloudResource"'
        properties:
          type: .name | split("/") | .[-2]
          location: .location
          labels: .labels
        relations:
          project: .__project.name
- kind: compute.googleapis.com/Disk
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .name
        title: .name | split("/") | last
        blueprint: '"gcpCloudResource"'
        properties:
          type: .name | split("/") | .[-2]
          location: .location
          labels: .labels
        relations:
          project: .__project.name
- kind: pubsub.googleapis.com/Subscription
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .name
        title: .name | split("/") | last
        blueprint: '"gcpCloudResource"'
        properties:
          type: .name | split("/") | .[-2]
          location: .location
          labels: .labels
        relations:
          project: .__project.name
- kind: iam.googleapis.com/ServiceAccount
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .name
        title: .name | split("/") | last
        blueprint: '"gcpCloudResource"'
        properties:
          type: .name | split("/") | .[-2]
          location: .location
          labels: .labels
        relations:
          project: .__project.name
```

</details>

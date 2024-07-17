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

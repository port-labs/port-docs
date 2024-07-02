---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Image from "@theme/IdealImage";

# Azure

Our integration with Azure provides the ability to export your Azure resources to Port, according to your configuration.
After the initial import of data, the integration will also listen to live events from Azure to update data inside Port in real time.

Our integration with Azure supports real-time event processing, this allows for an accurate **real-time** representation of your Azure infrastructure inside Port.

:::tip
Port's Azure exporter is open source, view the source code [**here**](https://github.com/port-labs/ocean/tree/main/integrations/azure).
:::

## 💡 Azure integration common use cases

Our Azure integration makes it easy to fill the software catalog with data directly from your Azure subscription, for example:

- Map resources from your Azure subscriptions, such as **AKS**, **Storage Accounts**, **Container Apps**, **Load Balancers** and other Azure resources.
- Watch for Azure object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Use relations to create complete, easily digestible views of your Azure infrastructure inside Port.

## Getting started

Continue to the [installation](./installation.md) guide to learn how to install the Azure exporter.

---
sidebar_position: 3
sidebar_label: Create a custom integration
---

import Image from "@theme/IdealImage";

# Create a custom integration

Port allows you to create custom integrations to ingest data from any tool or platform. You can model the data in Port any way you like, and ingest data using one of the supported methods described in this page.

## Why create a custom integration?

- The tool you want to integrate with is not yet available in our [integrations library](/build-your-software-catalog/sync-data-to-catalog/#available-plug--play-integrations).
- You wish to create your own data model and/or ingest data using a different method than the one provided in our integrations.
- You wish to integrate Port with an internal tool in your organization.

## How to create a custom integration

Generally, integrating a platform/tool with Port consists of 3 steps:

<Image img="/img/software-catalog/integration-process.png" border="1px" style={{borderRadius: "8px"}}></Image>

### 1. Define your data model

- Define how your data will be represented in Port, by creating one or more [blueprints](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/) and their properties.
- Determine the relationships between your new blueprints and other data models in your catalog, using [relations](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/).

### 2. Ingest data to catalog

Use one of the supported methods to ingest data from your tool into Port:
  - [Webhooks](/build-your-software-catalog/custom-integration/webhook/)
  - [Port API](/build-your-software-catalog/custom-integration/api/)
  - [IaC](/build-your-software-catalog/custom-integration/iac/)

### 3. Configure the integration

  - When using a webhook, the last step is to [configure the integration's mapping](/build-your-software-catalog/customize-integrations/configure-mapping), in order to tell your integration where to find the data in your tool, and how to map it to your blueprint/s.
  - When using Port's API, there is no need to configure mapping. Since you are directly interacting with the software catalog, the mapping is done as part of the ingestion process.

## Develop an Ocean integration

Most of Port's integrations were developed using the **Ocean framework**.  
Ocean is an open-source framework that simplifies the development of integrations with external tools, providing many out-of-the-box functionalities.  

In addition to the methods described above, you can also write your own Ocean integration for a specific tool.

Want to write and/or contribute an integration? Check out the [**Ocean documentation**](https://ocean.getport.io) to get started, and reach out to us if you have any questions 🌟
---
sidebar_position: 3
sidebar_label: Create a custom integration
---

# Create a custom integration

Port allows you to create custom integrations to ingest data from any tool or platform. You can model the data in Port any way you like, and ingest data using one of the supported methods described in this page.

## Why create a custom integration?

* The tool you want to integrate with is not yet available in our [integrations library](#available-plug--play-integrations).
* You wish to create your own data model and/or ingest data using a different method than the one provided in our integrations.

## How to create a custom integration

Generally, integrating a platform/tool with Port consists of 3 steps:

<img src='/img/software-catalog/integration-process.png' width='85%' />

### 1. Define your data model

- Define how your data will be represented in Port, by creating one or more [blueprints](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/) and their properties.
- Determine the relationships between your new blueprints and other data models in your catalog, using [relations](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/).

### 2. Ingest data to catalog

- Use one of the supported methods to ingest data from your tool into Port:
  - [Webhooks](/)
  - [Port API](/)

### 3. Configure the integration and its mapping

  - Tell your new integration where to find the data in your tool, and how to map it to your Port blueprints and properties.
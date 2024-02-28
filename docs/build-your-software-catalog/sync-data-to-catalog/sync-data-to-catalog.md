---
title: Integrate Port with any tool
sidebar_label: Integrate Port with any tool
---

import DocCardList from '@theme/DocCardList';

# Integrate Port with any tool

Port is designed to be flexible. It can be integrated with any tool, and can be used to build a software catalog that reflects your exact data model.

Port comes with a wide variety of available integrations for popular tools and platforms, modeled and configured by us to provide you with a plug & play experience.  

Once installed, you can customize and extend these integrations to fit your exact needs.

:::info custom integrations
Don't see the tool you wish to integrate with Port in the available integrations below?  
We provide you with the required tools to model your data and ingest it with ease, see [`Create a custom integration`](/build-your-software-catalog/custom-integration).
:::

## Integration process

Generally, integrating a platform/tool with Port consists of 3 steps:

<img src='/img/software-catalog/integration-process.png' width='85%' />

<br/><br/>

**The available integrations below take care of all of these steps for you, and can be customized after installation.**

## Available plug & play integrations

<DocCardList />

## Customize your integrations

Now that you've installed an itegration, let's see how you can customize it:

1. [**Configure your data model**](/build-your-software-catalog/customize-integrations/configure-data-model) - Update the integration's data model in Port to ingest additional data that is not included by default.

2. [**Configure your data mapping**](/build-your-software-catalog/customize-integrations/configure-mapping) - Update the integration's data mapping in Port to match the data model and fetch your desired data from the tool.

## Entities

An entity is an instance of a [blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/), it represents the data defined by a blueprint's properties.

After installing an integration, a page will be created in your catalog, populated with entities representing the ingested data.

For example, once you complete Port's [onboarding process](/quickstart) and connect your Git provider to Port, a new [Services page](https://app.getport.io/services) will be created in your software catalog, populated with entities representing your services (Git repositories):

<img src='/img/software-catalog/entitiesExample.png' width='75%' border='1px' />

<br/><br/>

Clicking on an entity in the table will take to its [entity page](/customize-pages-dashboards-and-plugins/page/entity-page), where you can view its properties, relations and more.

### Entity structure

By default, each entity has the following meta-properties: `identifier`, `title`, `team`. See the table below for more details.

#### JSON structure

```json showLineNumbers
{
  "identifier": "unique-ID",
  "title": "Title",
  "team": [],
  "blueprint": "blueprintName",
  "properties": {
    "property1": "",
    "property2": ""
  },
  "relations": {}
}
```

#### Structure table

| Field        | Type     | Description                                                                                                                                                                                                                                                            |
| ------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identifier` | `String` | Unique identifier. <br /> Note that while the identifier is unique, it can be changed after creation.                                                                                                                                                                  |
| `title`      | `String` | Entity name that will be shown in the UI.                                                                                                                                                                                                                              |
| `team`       | `Array`  | **Optional Field.** An array of the associated [teams](/sso-rbac/rbac/).                                                                               |
| `blueprint`  | `String` | The name of the [blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint) that this entity is based on.                                                                                                                                                |
| `properties` | `Object` | An object containing key-value pairs, where each key is a property **as defined in the blueprint definition**, and each value applies the `type` of the property.                                                                                                      |
| `relations`  | `object` | An object containing key-value pairs.<br /> Each key is the identifier of the [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints) that is defined on the blueprint. |
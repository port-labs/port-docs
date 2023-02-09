---
title: Sync data to Software Catalog
sidebar_label: 🔌 Sync data to Software Catalog
---

# 🔌 Sync data to Software Catalog

Port offers several integrations, allowing you to easily ingest and manage data with the tools you are already use in your infrastructure.

![Catalog Architecture](../../../static/img/sync-data-to-catalog/catalog-arch.jpg)

## Introduction

Port's integration methods allow you to ingest both [blueprints](../define-your-data-model/setup-blueprint/setup-blueprint.md#blueprint-structure) and [entities](#entity-json-structure).

By using Port's integrations you ensure that the software catalog is always up to date, and that live data is ingested directly from your systems, which is the most reliable source-of-truth for your environment.

## Creating Entities

An entity is an object that matches the type defined by a blueprint, and it represents the data of the software components which is defined by the blueprint properties.

## Entity JSON structure

This is the basic structure of an entity:

```json showLineNumbers
{
  "identifier": "unique-ID",
  "title": "Title",
  "team": "",
  "blueprint": "blueprintName",
  "properties": {
    "property1": "",
    "property2": ""
  },
  "relations": {}
}
```

### Structure table

| Field        | Type     | Description                                                                                                                                                                                                                                                            |
| ------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identifier` | `String` | Unique identifier. <br /> Note that while the identifier is unique, it can be changed after creation.                                                                                                                                                                  |
| `title`      | `String` | Entity name that will be shown in the UI.                                                                                                                                                                                                                              |
| `team`       | `Array`  | **Optional Field.** An array of the associated teams. <br /> Note that group permissions are handled according to this array, see [Teams and ownership](#teams-and-ownership).                                                                                         |
| `blueprint`  | `String` | The name of the [blueprint](../define-your-data-model/setup-blueprint/setup-blueprint.md) that this entity is based on.                                                                                                                                                |
| `properties` | `Object` | An object containing key-value pairs, where each key is a property **as defined in the blueprint definition**, and each value applies the `type` of the property.                                                                                                      |
| `relations`  | `object` | An object containing key-value pairs.<br /> Each key is the identifier of the [relation](../define-your-data-model/relate-blueprints/relate-blueprints.md) that is defined on the blueprint.<br /><br />See more in the [related entities](#related-entities) section. |

#### Teams and ownership

:::info teams and ownership
The `team` key defines ownership over an entity and controls who can modify or delete an existing entity.

To Explore more about ownership in Port see our [permissions](../../sso-rbac/rbac/rbac.md) section.
:::

### Related entities

When two blueprints are connected, creating an entity of the `source` blueprint will show an additional option - a `relation`.

This option is shown under the `relations` section as follows:

#### Single relation example

When a relation between blueprints is configured with `many = false`, you can add a relation to an entity by adding the `relationIdentifier` as key, and the `relatedEntityIdentifier` as value:

```json showLineNumbers
"relations": {
    "relation-identifier": "relatedEntityIdentifier"
}
```

#### Many relation example

When a relation between blueprints is configured with `many = true`, you can add a relation to an entity by adding the `relationIdentifier` as key, and an array of `relatedEntityIdentifier`(s) as value:

```json showLineNumbers
"relations": {
    "relation-identifier": ["relatedEntityIdentifier1", "relatedEntityIdentifier2"]
}
```

:::tip
Click for more details about [**relations**](../define-your-data-model/relate-blueprints/relate-blueprints.md).
:::

## Sync integration methods

Port offers a variety of data sync integrations and methods, these make it easy to ingest data to the catalog and keep it up to date.

Use the links below to learn about the different data sync methods Port offers:

- [REST](../../api-reference/api-reference.mdx);
- [CI/CD](./ci-cd/ci-cd.md);
- [Kubernetes & ArgoCD & K8s CRDs](./kubernetes/kubernetes.md);
- [IaC](./iac/iac.md);
- [Git providers](./git-provider/git-provider.md) and [GitOps](./gitops/gitops.md);
- Cloud provider - coming soon;

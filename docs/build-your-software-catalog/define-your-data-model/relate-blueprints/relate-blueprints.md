---
sidebar_position: 2
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Relate Blueprints

Relations allow you to model the connections between different assets in your software catalog.

## What is a relation?

Relations enable us to make connections between blueprints, consequently connecting the entities based on these blueprints. Doing so provides logical context to the software catalog.

## Use cases for relations

Relations can be used to represent the logical connections between assets in your software catalog, for example:

- The package version a microservice uses;
- The different version releases of a library;
- The Kubernetes clusters that exist in a cloud account;
- etc.

In this [live demo](https://demo.getport.io/dev-portal) example, we can see the DevPortal setup page with all of the blueprints and their relations.

## Relation schema structure

The basic structure of a relation object:

```json showLineNumbers
{
  "myRelation": {
    "title": "My title",
    "target": "My target blueprint",
    "required": true,
    "many": false
  }
}
```

:::info
A relation exists under the `relations` key in the [Blueprint JSON schema](../setup-blueprint/setup-blueprint.md#blueprint-schema-structure)
:::

## Structure table

| Field      | Description                                                                                            | Notes                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `title`    | Relation name that will be shown in the UI                                                             | Human-readable name for the relation                                    |
| `target`   | Target blueprint identifier                                                                            | The target blueprint has to exist when defining the relation            |
| `required` | Boolean flag to define whether the target must be provided when creating a new entity of the blueprint |
| `many`     | Boolean flag to define whether multiple target entities can be mapped to the Relation                  | For more information refer to [X-to-many relation](#x-to-many-relation) |

:::note
A Relation can't be configured with both `many` and `required` set to `true`
:::

## Types of relations

### Single

A single type relation is used to map a single target entity to the source.

#### Use cases

- Map a build job to the resulting new version;
- Map a library version to the library repository;
- Map a Kubernetes pod to the service it is providing;
- etc.

In this [live demo](https://demo.getport.io/packageVersionEntity?identifier=AnalyticsTracker_1_2_9) example, we can see a specific package version and it's related core packages.

#### Single Relation Structure

A single type relation is distinguished by the `many: false` configuration:

<Tabs groupId="definition" defaultValue="api" values={[
{label: "API", value: "api"},
{label: "Terraform", value: "tf"}
]}>

<TabItem value="api">

```json showLineNumbers
{
  "myRelation": {
    "title": "My title",
    "target": "myTargetBlueprint",
    "required": false,
    "many": false
  }
}
```

</TabItem>
<TabItem value="tf">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # ...user-defined properties
  # highlight-start
  relations {
    identifier = "myRelation"
    title      = "My relation"
    target     = "myTargetBlueprint"
    required   = false
    many       = false
  }
  # highlight-end
}
```

</TabItem>
</Tabs>

### Many

A many type relation is used to map multiple target entities to the source.

#### Use cases

- Map the packages used by a service;
- Map the cloud resources used by a service;
- Map the services deployed in a developer environment;
- etc.

In this [live demo](https://demo.getport.io/developerEnvEntity?identifier=test-shizuko) example, we can see a specific developer environment and the running services it uses.

#### Many Relation Structure

A many type relation is distinguished by the `many: true` configuration:

<Tabs groupId="definition" defaultValue="api" values={[
{label: "API", value: "api"},
{label: "Terraform", value: "tf"}
]}>

<TabItem value="api">

```json showLineNumbers
{
  "myRelation": {
    "title": "My title",
    "target": "myTargetBlueprint",
    "required": false,
    "many": true
  }
}
```

</TabItem>
<TabItem value="tf">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # ...user-defined properties
  # highlight-start
  relations {
    identifier = "myRelation"
    title      = "My relation"
    target     = "myTargetBlueprint"
    required   = false
    many       = true
  }
  # highlight-end
}
```

</TabItem>
</Tabs>

:::note
A Relation can't be configured with both `many` and `required` set to `true`
:::

## Apply Relations to Port

Relations are part of the structure of a Blueprint.

JSON example with highlighting on the area of the relations definition

Once added to the blueprint definition, you can [apply the blueprint](../setup-blueprint/setup-blueprint.md#apply-blueprints-to-port) to Port

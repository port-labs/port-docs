---
sidebar_position: 2
title: Relate blueprints
sidebar_label: Relate blueprints
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Relate Blueprints

<center>

<iframe width="568" height="320" src="https://www.youtube.com/embed/McUWOC4gcu4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>

<br/>

Relations define connections between [blueprints](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/), consequently connecting the [entities](/build-your-software-catalog/sync-data-to-catalog/#entities) based on these blueprints.  
This provides logical context to the software catalog.

## Common relations

Relations can be used to represent the logical connections between assets in your software catalog, for example:

- The **packages** that a **microservice** uses.
- The **run** history of a **CI job**.
- The **Kubernetes clusters** that exist in a **cloud account**.

In this [live demo](https://demo.getport.io/settings) example, we can see the DevPortal Builder page with all of the blueprints and their relations. 🎬

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

:::info relation declaration
A relation exists under the `relations` key in the [Blueprint JSON schema](../setup-blueprint/setup-blueprint.md#blueprint-schema-structure).
:::

## Structure table

| Field        | Description                                                                                            | Notes                                                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identifier` | Unique identifier                                                                                      | The identifier is used for API calls, programmatic access and distinguishing between different relations. <br></br> <br></br> The identifier is the key of the relation schema object, in the [schema structure](#relation-schema-structure) above, the identifier is `myRelation` |
| `title`      | Relation name that will be shown in the UI                                                             | Human-readable name for the relation                                                                                                                                                                                                                                               |
| `target`     | Target blueprint identifier                                                                            | The target blueprint has to exist when defining the relation                                                                                                                                                                                                                       |
| `required`   | Boolean flag to define whether the target must be provided when creating a new entity of the blueprint |
| `many`       | Boolean flag to define whether multiple target entities can be mapped to the Relation                  | For more information refer to [many relation](#many)                                                                                                                                                                                                                               |

## Types of relations

### :bust_in_silhouette: Single

A single type relation is used to map a single target entity to the source.

#### 💡 Common Single Relations

- Map a **Deployment** to the **Running Service** that it deployed.
- Map a **package version** to the **package**.
- Map a **K8s cluster** to the **cloud account** it is provisioned in.

In this [live demo](https://demo.getport.io/githubWorkflowEntity?identifier=wish_list_build_185674921&activeTab=3) example, we can see a specific Deployment Workflow and its related Service. 🎬

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

<ApiRef />

</TabItem>
<TabItem value="tf">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
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

### 👥 Many

A many type relation is used to map multiple target entities to the source.

#### 💡 Common Many Relations

- Map dependencies between services.
- Map the **packages** used by a **service**.
- Map the **cloud resources** used by a **service**.
- Map the **services deployed** in a **developer environment**.

In this [live demo](https://demo.getport.io/jiraIssueEntity?identifier=WISH-789&activeTab=1) example, we can see a specific Jira issue and its related Services. 🎬

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

<ApiRef />

</TabItem>
<TabItem value="tf">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
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

:::note Relation Configuration Restriction
A Relation can't be configured with both `many` and `required` set to `true`.
:::

## Configure relations in Port

Relations are part of the structure of a [blueprint](../setup-blueprint/setup-blueprint.md#blueprint-structure).

<Tabs groupId="definition" queryString defaultValue="api" values={[
{label: "API", value: "api"},
{label: "UI", value: "ui"},
{label: "Terraform", value: "tf"}
]}>

<TabItem value="api">

```json showLineNumbers
{
  "identifier": "myIdentifier",
  "title": "My title",
  "description": "My description",
  "icon": "My icon",
  "calculationProperties": {},
  "schema": {
    "properties": {},
    "required": []
  },
  // highlight-start
  "relations": {
    "myRelation": {
      "title": "My title",
      "target": "My target blueprint",
      "required": true,
      "many": false
    }
  }
  // highlight-end
}
```

<ApiRef />

</TabItem>

<TabItem value="ui">

1. Go to the [Builder page](https://app.getport.io/settings) of your portal.
2. Expand the blueprint from which you would like to create a relation.
3. Click on the `+ New relation` button:
   
    <img src='/img/software-catalog/customize-integrations/createRelation.png' width='30%' border='1px' />
4. Fill in the form with your desired values, then click `Create`.

</TabItem>

<TabItem value="tf">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # ...user-defined properties
  # highlight-start
  relations = {
    "myRelation" = {
      title    = "My title"
      target   = "My target blueprint"
      required = true
      many     = false
    }
  }
  # highlight-end
}
```

</TabItem>
</Tabs>

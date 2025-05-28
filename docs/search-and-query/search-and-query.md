---
title: Search & query
sidebar_label: Search & query
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import CombinatorIntro from "./\_combinator_intro.md"
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Search & query

Port's API provides tools to easily query, search and filter software catalog data. Port's search and queries can be used across the Port product: in the catalog such as in initial filters to create advanced dynamic filtering, or in the self service actions form, to dynamically select a dropdown list.

## Common queries usage

High quality search is essential to effectively track assets in your software catalog, using Port's search you can:

- Find all running services that are not healthy.
- List all libraries that have known vulnerabilities.
- Filter all services running in a specific cluster (in a query or self service form).
- Catalog initial filters based on the logged in user's properties.

## Search request

A search request contains filters and rules to find matching <PortTooltip id="entity">entities</PortTooltip> in your software catalog.  
To search for entities using the API, see the [search](/api-reference/search-a-blueprints-entities) route.

A search request is comprised of the following elements:

| Field        | Description                                               |
| ------------ | --------------------------------------------------------- |
| `combinator` | Defines the logical operation to apply to the query rules |
| `rules`      | An array of search rules to filter results with           |

For example:

```json showLineNumbers
{
  "combinator": "and",
  "rules": [
    {
      "property": "$blueprint",
      "operator": "=",
      "value": "myBlueprint"
    },
    {
      "property": "$identifier",
      "operator": "contains",
      "value": "myIdentifierPart"
    }
  ]
}
```

The query above searches for all entities based on the `myBlueprint` blueprint whose `identifier` contains the string `myIdentifierPart`.

## Combinator

<CombinatorIntro />

<Tabs groupId="combinators" defaultValue="and" values={[
{label: "And", value: "and"},
{label: "Or", value: "or"}
]}>

<TabItem value="and">

```json showLineNumbers
{
  // highlight-next-line
  "combinator": "and",
  "rules": [
    {
      "property": "$blueprint",
      "operator": "=",
      "value": "myBlueprint"
    },
    {
      "property": "$identifier",
      "operator": "contains",
      "value": "myIdentifierPart"
    }
  ]
}
```

</TabItem>

<TabItem value="or">

```json showLineNumbers
{
  // highlight-next-line
  "combinator": "or",
  "rules": [
    {
      "property": "$blueprint",
      "operator": "=",
      "value": "myBlueprint"
    },
    {
      "property": "$identifier",
      "operator": "contains",
      "value": "myIdentifierPart"
    }
  ]
}
```

</TabItem>

</Tabs>

## Rules

A search rule is a small filtering unit, used to control the search output.

Here is an example search rule:

```json showLineNumbers
{
  "property": "$blueprint",
  "operator": "=",
  "value": "microservice"
}
```

Port has 2 types of search rule operators:

1. Comparison (e.g. `=`, `>`).
2. Relation (e.g. `relatedTo`).

### Comparison operators

#### Structure

| Field      | Description                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `operator` | Search operator to use when evaluating this rule, see a list of available operators below                                                                                                                                                                                                                                                                      |
| `property` | Property to filter by according to its value. It can be a [meta-property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/meta-properties.md) such as `$identifier`, or one of the [standard properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/properties.md#available-properties) |
| `value`    | The value to filter by                                                                                                                                                                                                                                                                                                                                         |

#### Operators

A wide variety of operators are available, see them [here](./comparison-operators).

___

### Relation operators

#### Structure

| Field       | Description                                                                               |
| ----------- | ----------------------------------------------------------------------------------------- |
| `operator`  | Search operator to use when evaluating this rule, see a list of available operators below |
| `blueprint` | Blueprint of the entity identifier specified in the `value` field                         |
| `value`     | Value to filter by                                                                        |

#### Operators

<Tabs groupId="relation" defaultValue="relatedTo" values={[
{label: "RelatedTo", value: "relatedTo"},
]}>

<TabItem value="relatedTo">

The `relatedTo` operator will return all entities that have a relationship with the specified entity:

```json showLineNumbers
{
  "operator": "relatedTo",
  "blueprint": "myBlueprint",
  "value": "myEntity"
}
```

The operator also supports multiple related entities as the searched value:

```json showLineNumbers
{
  "operator": "relatedTo",
  "blueprint": "myBlueprint",
  "value": ["myFirstEntity", "mySecondEntity"]
}
```
This query will return all of the entities that are related to one or more of the identifiers in the value array.

<h4> Required </h4>

The `relatedTo` operator also supports the `required` property - which allows you to search for:

- Related entities from all relations (relations with either required `true` or `false`);
- Related entities only from required relations (relations with required `true`);
- Related entities only from non-required relations (relations with required `false`).

For example, to search only for related entities that _require_ the `myEntity` entity from the `myBlueprint` blueprint, use the following search rule:

```json showLineNumbers
{
  "operator": "relatedTo",
  "required": true,
  "value": "myEntity",
  "blueprint": "myBlueprint"
}
```

<h4> Direction </h4>

The `relatedTo` operator also supports the `direction` property - which allows you to search for dependent entities in a specific direction on the dependency graph. To better understand the functionality of this property, let's take a look at the example below:

Let's assume that we have the blueprints `deploymentConfig` and `microservice` with the following relation definition (declared on the `deploymentConfig` blueprint):

```json showLineNumbers
"relations": {
  "microservice": {
    "description": "The service this Deployment Config belongs to",
    "many": false,
    "required": false,
    "target": "microservice",
    "title": "Microservice"
  }
}
```

In addition, we have the following entities:

```text showLineNumbers
Deployment Configs:
- Order-Service-Production
- Cart-Service-Production

Microservices:
- Order Service
- Cart Service

Environments:
- Production
```

And the following relations:

```text showLineNumbers
Order-Service-Production -> Order-Service
Order-Service-Production -> Production

Cart-Service-Production -> Cart-Service
Cart-Service-Production -> Production
```

By looking at the resulting graph layout, we can also map the directions:

![Dependency graph upstream downstream diagram](/img/software-catalog/search-in-port/search-direction-diagram.png)

- To search for entities which the source depends on - use `"direction": "upstream"`;
- To search for entities which depend on the source - use `"direction": "downstream"`.

In the example shown above, if we want to get the `Microservice` and `Environment` that _Order-Service-Production_ depends on, the search rule would be:

```json showLineNumbers
{
  "operator": "relatedTo",
  "blueprint": "deploymentConfig",
  "value": "Order-Service-Production",
  "direction": "upstream"
}
```

And the result shall be:

<details>
<summary>Order-Service-Production upstream related entities</summary>

```json showLineNumbers
{
  "ok": true,
  "matchingBlueprints": ["microservice", "environment"],
  "entities": [
    {
      "identifier": "Order-Service",
      "title": "Order-Service",
      "blueprint": "microservice",
      "properties": {
        "on-call": "mor@getport.io",
        "language": "Python",
        "slack-notifications": "https://slack.com/Order-Service",
        "launch-darkly": "https://launchdarkly.com/Order-Service"
      },
      "relations": {},
      "createdAt": "2022-11-17T15:54:20.432Z",
      "createdBy": "auth0|62ab380295b34240aa511cdb",
      "updatedAt": "2022-11-17T15:54:20.432Z",
      "updatedBy": "auth0|62ab380295b34240aa511cdb"
    },
    {
      "identifier": "Production",
      "title": "Production",
      "blueprint": "environment",
      "properties": {
        "awsRegion": "eu-west-1",
        "configUrl": "https://github.com/config-labs/kube/config.yml",
        "slackChannel": "https://yourslack.slack.com/archives/CHANNEL-ID",
        "onCall": "Mor P",
        "namespace": "Production"
      },
      "relations": {},
      "createdAt": "2022-09-19T08:54:23.025Z",
      "createdBy": "Cnc3SiO7T0Ld1y1u0BsBZFJn0SCiPeLS",
      "updatedAt": "2022-10-16T09:28:32.960Z",
      "updatedBy": "auth0|62ab380295b34240aa511cdb"
    }
  ]
}
```

</details>

If we want to get all of the `deploymentConfigs` that are deployed in the _Production_ `Environment`, the search rule would be:

```json showLineNumbers
{
  "operator": "relatedTo",
  "blueprint": "environment",
  "value": "Production",
  "direction": "downstream"
}
```

And the result shall be:

<details>
<summary>Production downstream related entities</summary>

```json showLineNumbers
{
  "ok": true,
  "matchingBlueprints": ["deploymentConfig"],
  "entities": [
    {
      "identifier": "Order-Service-Production",
      "title": "Order-Service-Production",
      "blueprint": "deploymentConfig",
      "properties": {
        "url": "https://github.com/port-labs/order-service",
        "config": {
          "encryption": "SHA256"
        },
        "monitor-links": [
          "https://grafana.com",
          "https://prometheus.com",
          "https://datadog.com"
        ]
      },
      "relations": {
        "microservice": "Order-Service",
        "environment": "Production"
      },
      "createdAt": "2022-11-17T15:55:55.591Z",
      "createdBy": "auth0|62ab380295b34240aa511cdb",
      "updatedAt": "2022-11-17T15:55:55.591Z",
      "updatedBy": "auth0|62ab380295b34240aa511cdb"
    },
    {
      "identifier": "Cart-Service-Production",
      "title": "Cart-Service-Production",
      "blueprint": "deploymentConfig",
      "properties": {
        "url": "https://github.com/port-labs/cart-service",
        "config": {
          "foo": "bar"
        },
        "monitor-links": [
          "https://grafana.com",
          "https://prometheus.com",
          "https://datadog.com"
        ]
      },
      "relations": {
        "microservice": "Cart-Service",
        "environment": "Production"
      },
      "createdAt": "2022-11-17T15:55:10.714Z",
      "createdBy": "auth0|62ab380295b34240aa511cdb",
      "updatedAt": "2022-11-17T15:55:20.253Z",
      "updatedBy": "auth0|62ab380295b34240aa511cdb"
    }
  ]
}
```

</details>

</TabItem>
</Tabs>

### Dynamic properties

When using Port's UI, you can use properties of the logged-in user when writing rules by using the following functions:

- `getUserTeams` - a list of the teams the user belongs to.
- `getUserEmail` - the user's email.
- `getUserFullName` - the user's full name.
- `blueprint` - the blueprint identifier of the current page.

:::info UI only
Since we don't have context of the logged-in user when using the API, these functions are only available when using the UI. This is useful when creating [chart/table widgets](/customize-pages-dashboards-and-plugins/dashboards/#chart-filters) and [catalog pages](/customize-pages-dashboards-and-plugins/page/catalog-page#page-creation).
:::

#### Usage examples

```json showLineNumbers
[
  {
    "property": "$team",
    "operator": "containsAny",
    "value": ["{{getUserTeams()}}"]
  }
]
```

```json showLineNumbers
[
  {
    "property": "emails",
    "operator": "contains",
    "value": "{{getUserEmail()}}"
  }
]
```

```json showLineNumbers
[
  {
    "property": "name",
    "operator": "=",
    "value": "{{getUserFullName()}}"
  }
]
```

```json showLineNumbers
[
  {
    "property": "$blueprint",
    "operator": "=",
    "value": "{{blueprint}}"
  }
]
```

### Contextual query rules

:::info Closed beta feature
This capability is currently in closed beta, and is not yet generally available.  
If you would like to join the beta, please reach out to us.
:::
To implement specific and/or complex queries, you can add the context of the triggering user to a query rule, allowing you to access that user's entity and/or owning teams.  
You can mix contextual query rules freely with other rules as part of your queries.
This can be used in either the `property` or `value` key in a query rule:

<Tabs groupId="context" defaultValue="property" values={[
{label: "Property", value: "property"},
{label: "Value", value: "value"},
]}>
<TabItem value="property">
```json showLineNumbers
{
   ...other rule keys
   "property": {
      "context": "user" | "userTeams",
      "property": "prop"
  }
}
```
</TabItem>
<TabItem value="value">
```json showLineNumbers
{
  ...other rule keys
   "value": {
      "context": "user" | "userTeams",
      "property": "prop"
  }
}
```
</TabItem>
</Tabs>

#### Available contexts
| Context       | Description                                                                               |
| ----------- | ----------------------------------------------------------------------------------------- |
| `user`  | The entity of the user triggering the query |
| `userTeams` | The entities of the owning teams of the user triggering the query                                                                     |

#### Usage examples

```json showLineNumbers
[ 
  ...other rules
  { // filter entities with the same department as the user
    "property": "department",
    "operator": "containsAny",
    "value": {
      "context": "user",
      "property": "department"
    }
  }
]
```
```json showLineNumbers
[ 
  ...other rules
  { // only users with `manager` role will get the entities
    "property": {
      "context": "user",
      "property": "role"
    },
    "operator": "=",
    "value": "manager"
  }
]
```
```json showLineNumbers
[
  ...other rules
  { // only users in these team will get the entities
    "property": {
      "context": "userTeams",
      "property": "$identifier"
    },
    "operator": "containsAny",
    "value": ["Spider Team", "Builder Team"]
  }
]
```

### Filter by relations/scorecards

When using the [search a blueprint's entities](/api-reference/search-a-blueprints-entities) API route, you can also filter results by <PortTooltip id="relation">relations</PortTooltip> or <PortTooltip id="scorecard">scorecards</PortTooltip>.

See the following examples for each filter type:

<Tabs groupId="filterby" defaultValue="relation" values={[
{label: "Relation", value: "relation"},
{label: "Scorecard", value: "scorecard"},
{label: "Scorecard rule", value: "scorecardRule"},
]}>

<TabItem value="relation">
```json showLineNumbers
{
  "relation": "relationId",
  "operator": "=",
  "value": "value"
}
```
</TabItem>

<TabItem value="scorecard">
```json showLineNumbers
{
  "scorecard": "scorecardId",
  "operator": "=",
  "value": "Bronze"
}
```
</TabItem>

<TabItem value="scorecardRule">
```json showLineNumbers
{
  "scorecard": "scorecardId",
  "scorecardRule": "scorecardRuleId",
  "operator": "=",
  "value": "Bronze"
}
```
</TabItem>

</Tabs>

## Examples

Refer to the [examples](./examples.md) page for practical code snippets for search.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced search use cases and outputs.

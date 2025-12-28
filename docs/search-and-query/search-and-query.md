---
title: Search & query
sidebar_label: Search & query
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import CombinatorIntro from "./\_combinator_intro.md"
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Search & query

Port's API provides tools to easily query, search and filter software catalog data. Port's search and query syntax can be used across the Port product to dynamically filter entities, control permissions, configure automations, and more.

## Where to use search & query?

You can use the search and query syntax in the following areas:

- **Catalog pages** - Initial filters for pages and blueprint read permissions.
- **Entity pages** - Filters for custom related entity tabs.
- **Dashboard widgets** - Dashboard-level filters and widget-specific filters for [data widgets](/customize-pages-dashboards-and-plugins/dashboards/data-widgets).
- **Self-service actions** - Action conditions, entity input datasets, and dynamic permissions.
- **Scorecards** - Filters to determine which entities a rule evaluates.
- **Aggregation properties** - Filters to determine which entities are included in [aggregation calculations](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property).
- **API** - Search endpoints ([search entities](/api-reference/search-entities) and [search a blueprint's entities](/api-reference/search-a-blueprints-entities)).

For practical examples of using search & query in each of these areas, see the [examples](/search-and-query/examples) page.

## Common queries usage

High quality search is essential to effectively track assets in your software catalog.  

Using Port's search you can:

- Find all running services that are not healthy.
- List all libraries that have known vulnerabilities.
- Filter all services running in a specific cluster (in a query or self service form).
- Catalog initial filters based on the logged in user's properties.


## Search request

A search request contains filters and rules to find matching <PortTooltip id="entity">entities</PortTooltip> in your software catalog.  
To search for entities using the API, see the [search](/api-reference/search-a-blueprints-entities) route.

A search request is comprised of the following elements:

| Field        | Description                                                |
| ------------ | ---------------------------------------------------------- |
| `combinator` | Defines the logical operation to apply to the query rules. |
| `rules`      | An array of search rules to filter results with.           |

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

Several relation-based operators are available, see them [here](./relation-operators).

### Contextual query rules

To implement specific and/or complex queries, you can add the context of the triggering user to a query rule, allowing you to access that user's properties and/or owning teams.  
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

<img src="/img/entities-search/contextual-search-rules.png" border="1px" width="90%" />

The following rule will result in the entities owned by any one of the user's teams:
```json showLineNumbers
[ 
  ...other rules
  { 
    "property": "$team",
    "operator": "containsAny",
    "value": {
      "context": "userTeams",
      "property": "$identifier"
    }
  }
]
```
The following rule will result in entities with the same department as the user's:
```json showLineNumbers
[ 
  ...other rules
  { 
    "property": "department",
    "operator": "=",
    "value": {
      "context": "user",
      "property": "department"
    }
  }
]
```
The following rule asserts that only users with `manager` role will get the resulting entities:
```json showLineNumbers
[ 
  ...other rules
  { 
    "property": {
      "context": "user",
      "property": "company_role"
    },
    "operator": "=",
    "value": "manager"
  }
]
```
The following rule asserts that only users in the user's team/s will get the resulting entities:
```json showLineNumbers
[
  ...other rules
  { 
    "property": {
      "context": "userTeams",
      "property": "$identifier"
    },
    "operator": "containsAny",
    "value": ["Spider Team", "Builder Team"]
  }
]
```

For examples of using contextual values with relation path filters, see [filter with contextual values](/search-and-query/relation-operators#filter-with-contextual-values).

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


### Dynamic properties

:::warning Deprecation Notice
Dynamic properties are deprecated and will be discontinued soon, please use [contextual query rules](#contextual-query-rules) instead.
:::

When using Port's UI, you can use properties of the logged-in user when writing rules by using the following functions:

- `getUserTeams` - a list of the teams the user belongs to.
- `getUserEmail` - the user's email.
- `getUserFullName` - the user's full name.
- `blueprint` - the blueprint identifier of the current page.

:::info UI only
Since we don't have context of the logged-in user when using the API, these functions are only available when using the UI. This is useful when creating [chart/table widgets](/customize-pages-dashboards-and-plugins/dashboards/custom-widgets/#chart-filters) and [catalog pages](/customize-pages-dashboards-and-plugins/page/catalog-page#page-creation).
:::
Several relation-based operators are available, see them [here](./relation-operators).

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

## Examples

Refer to the [examples](./examples.md) page for practical code snippets for search.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced search use cases and outputs.

---
title: Search & query
sidebar_label: Search & query
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Search & query

import CombinatorIntro from "./\_combinator_intro.md"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

Port's API provides tools to easily query, search and filter software catalog data.

## Common queries usage

High quality search is essential to effectively track assets in your software catalog, using Port's search you can:

- Find all running services that are not healthy.
- List all libraries that have known vulnerabilities.
- Get all services running in a specific cluster.

## Search request

The base search route is `https://api.getport.io/v1/entities/search`, it receives HTTP POST requests.

A search request defines the logical relation between different search rules, and contains filters and rules to find matching <PortTooltip id="entity">entities</PortTooltip>.
Each search request is represented by a JSON object, as shown in the following example:

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

The above query searches for all entities based on the `myBlueprint` blueprint whose `identifier` contains the string `myIdentifierPart`.

## Search request elements

| Field        | Description                                               |
| ------------ | --------------------------------------------------------- |
| `combinator` | Defines the logical operation to apply to the query rules |
| `rules`      | An array of search rules to filter results with           |

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

1. Comparison operators (`=` `>`, etc.);
2. Relation operators (`relatedTo`, etc.).

### Comparison and operators

#### Structure

| Field      | Description                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `operator` | Search operator to use when evaluating this rule, see a list of available operators below                                                                                                                                                                                                                                                                      |
| `property` | Property to filter by according to its value. It can be a [meta-property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/meta-properties.md) such as `$identifier`, or one of the [standard properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/properties.md#available-properties) |
| `value`    | The value to filter by                                                                                                                                                                                                                                                                                                                                         |

#### Operators

<Tabs className="operators-tabs" groupId="comparison" defaultValue="=" values={[
{label: "=", value: "="},
{label: "!=", value: "!="},
{label: ">", value: ">"},
{label: ">=", value: ">="},
{label: "<", value: "<"},
{label: "<=", value: "<="},
{label: "isEmpty", value: "isEmpty"},
{label: "isNotEmpty", value: "isNotEmpty"},
{label: "Property schema", value: "property-schema"},
{label: "Between", value: "between"},
{label: "notBetween", value: "notBetween"},
{label: "Contains", value: "contains"},
{label: "ContainsAny", value: "containsAny"},
{label: "In", value: "in"}
]}>

<TabItem value="=">

The `=` operator checks exact matches of the specified value:

```json showLineNumbers
{
  "operator": "=",
  "property": "myProperty",
  "value": "myExactValue"
}
```

</TabItem>

<TabItem value="!=">

The `!=` operator checks exact matches of the specified value and returns all results that fail to satisfy the check:

```json showLineNumbers
{
  "operator": "!=",
  "property": "myProperty",
  "value": "myExactValue"
}
```

</TabItem>

<TabItem value=">">

The `>` operator checks values larger than the specified value:

```json showLineNumbers
{
  "operator": ">",
  "property": "myNumericProperty",
  "value": 7
}
```

</TabItem>

<TabItem value=">=">

The `>=` operator checks values larger than or equal to the specified value:

```json showLineNumbers
{
  "operator": ">=",
  "property": "myNumericProperty",
  "value": 7
}
```

</TabItem>

<TabItem value="<">

The `<` operator checks values less than the specified value:

```json showLineNumbers
{
  "operator": "<",
  "property": "myNumericProperty",
  "value": 7
}
```

</TabItem>

<TabItem value="<=">

The `<=` operator checks values less than or equal to the specified value:

```json showLineNumbers
{
  "operator": "<=",
  "property": "myNumericProperty",
  "value": 7
}
```

</TabItem>

<TabItem value="isEmpty">

The `isEmpty` operator checks if the value of the specified property is `null`:

```json showLineNumbers
{
  "operator": "isEmpty",
  "property": "myProperty"
}
```

</TabItem>

<TabItem value="isNotEmpty">

The `isNotEmpty` operator checks if the value of the specified property is not `null`:

```json showLineNumbers
{
  "operator": "isNotEmpty",
  "property": "myProperty"
}
```

</TabItem>

<TabItem value="property-schema">

The `propertySchema` filter can be used with any standard operator. It allows you to filter entities based on a properties matching a specific type (for example, find all string properties with a given value):

<Tabs values={[
{label: "String", value: "string"},
{label: "URL", value: "url"}
]}>

<TabItem value="string">

```json showLineNumbers
{
  // highlight-start
  "propertySchema": {
    "type": "string"
  },
  // highlight-end
  "operator": "=",
  "value": "My value"
}
```

</TabItem>

<TabItem value="url">

```json showLineNumbers
{
  // highlight-start
  "propertySchema": {
    "type": "string",
    "format": "url"
  },
  // highlight-end
  "operator": "=",
  "value": "https://example.com"
}
```

</TabItem>

</Tabs>

:::tip

- The `propertySchema` can be used with any Port [property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/properties.md#supported-properties);
- The `propertySchema` replaces the `property` filter when performing property schema search.

:::

</TabItem>

<TabItem value="between">

The `between` operator checks datetime values and returns entities whose relevant datetime property matches the given range:

```json showLineNumbers
{
  "operator": "between",
  "property": "$createdAt",
  "value": {
    "preset": "lastWeek"
  }
}
```

**Available Presets:**

- tomorrow
- today
- yesterday
- lastWeek
- last2Weeks
- lastMonth
- last3Months
- last6Months
- last12Months

The `between` operator also supports standard date ranges:

```json showLineNumbers
{
  "combinator": "and",
  "rules": [
    {
      "operator": "between",
      "property": "$createdAt",
      "value": {
        "from": "2022-07-26T16:38:06.839Z",
        "to": "2022-07-29T17:00:28.006Z"
      }
    }
  ]
}
```

</TabItem>

<TabItem value="notBetween">

The `notBetween` operator checks datetime values and returns entities whose relevant datetime property does not match the given range:

```json showLineNumbers
{
  "operator": "notBetween",
  "property": "$createdAt",
  "value": {
    "preset": "lastWeek"
  }
}
```

</TabItem>

<TabItem value="contains">

The `contains` operator checks if the specified substring exists in the specified property:

```json showLineNumbers
{
  "operator": "contains",
  "property": "myStringProperty",
  "value": "mySubString"
}
```

</TabItem>

<TabItem value="containsAny">

The `containsAny` operator checks if **any** of the specified strings exist in the target array:

```json showLineNumbers
{
  "operator": "containsAny",
  "property": "myArrayProperty",
  "value": ["Value1", "Value2", ...]
}
```

</TabItem>

<TabItem value="in">

The `in` operator checks if a `string` property is equal to one or more specified `string` values:

<Tabs values={[
{label: "Standard", value: "array"},
{label: "Dynamic Filter", value: "myTeamsDynamicFilter"}
]}>

<TabItem value="array">

```json showLineNumbers
{
  "property": "myStringProperty",
  "operator": "in",
  "value": ["Value1", "Value2"]
}
```

</TabItem>

<TabItem value="myTeamsDynamicFilter">

```json showLineNumbers
{
  "property": "$team",
  "operator": "in",
  "value": ["myTeamsDynamicFilter"]
}
```

:::note

- In order to filter entities that **belong to your teams** you can use the special `myTeamsDynamicFilter` filter.

:::

**UI:**

- Choose field of type `string` format `team` or the metadata `Team` field;
- Choose `has any of` operator:

![My Teams Filter](/img/software-catalog/pages/MyTeamsFilter.png)

</TabItem>

</Tabs>

</TabItem>

</Tabs>

### Relation structure and operators

#### Structure

| Field       | Description                                                                               |
| ----------- | ----------------------------------------------------------------------------------------- |
| `operator`  | Search operator to use when evaluating this rule, see a list of available operators below |
| `blueprint` | Blueprint of the entity identifier specified in the `value` field                         |
| `value`     | Value to filter by                                                                        |

#### Operators

<Tabs groupId="relation" defaultValue="relatedTo" values={[
{label: "Related To", value: "relatedTo"},
{label: "Required", value: "required"},
{label: "Direction", value: "direction"},
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

</TabItem>

<TabItem value="required">

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

</TabItem>

<TabItem value="direction">

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


## Examples

Refer to the [examples](./examples.md) page for practical code snippets for search.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced search use cases and outputs.

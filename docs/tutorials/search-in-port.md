---
sidebar_position: 4
---

# Search In Port

The Port API comes with a built-in search route that allows you to quickly and easily find what you're looking for in the Service Catalog.

Using the search route, you can search for Entities using various filters and rules.

## Search basics

Search in Port is performed by writing simple querying rules which can be combined together to construct a more complex and precise query.

The base search route is `https://api.getport.io/entities/search`, it receives `HTTP POST` requests.

## Search request

A search request defines the logical relation between the different search rules, and contains a list search rules used to match and filter entities.

Each search request is represented by a **JSON object**, as shown in the following section:

```json showLineNumbers
{
    "combinator": "and",
    "rules": [
        {
            "property": "$blueprint",
            "operator": "=",
            "value": "Microservice"
        },
        {
            "property": "$identifier",
            "operator": "contains",
            "value": "admin"
        }
    ]
}
```
---

### Search request structure table

| Field | Description 
|---|---|
| `combinator` | Defines whether the query performs a logical `and` or an `or` between the different conditions 
| `rules` | An array of search rules to filter results with 

## Search rules

A search rule is a small filtering unit, used to control the output 

Here is an example search rule:

```json showLineNumbers
{
    "property": "$blueprint",
    "operator": "=",
    "value": "Microservice"
}
```
---

### Search rule structure table

| Field | Description 
|---|---|
| `operator` | The search operator to use when evaluating this rule, see a list of available operators below 
| `property` | The property to filter according to its value, can be an internal property such as `$identifier` or a standard property such as `slack_channel` 
| `value` | The value to filter by 

## Search operators

Search currently supports the following operators:

| Operator | Description 
|---|---|
| `=` | Equality operator
| `!=` | Inequality operator
| `>`,`>=`,`<`,`<=` | Numeric comparison operators
| `between` | Date range matching
| `contains` | String pattern matching
| `relatedTo` | Returns entities that have a relation with our rule target 
| `dependedOn` | Returns entities that the rule target depends on 

## Operator examples

Here are examples for each available search rule operator:

### `=` operator

The following rule will return entities whose identifier is `port-api`:

```json showLineNumbers
{
    "operator": "=",
    "property": "$identifier",
    "value": "port-api"
}
```

:::info Available properties
We can search over a variety of properties:

- "meta-properties" such as `$identifier`, `$title`, `$createdAt` and more
- user-defined properties that appear under the `properties` key in the `blueprint` definition
:::

### `!=` operator

The following rule will return entities whose identifier **is not** `port-api`:

```json showLineNumbers
{
    "operator": "!=",
    "property": "$identifier",
    "value": "port-api"
}
```

### `>`,`>=`,`<`,`<=` operators

The following rule will return entities whose version value is less than `5`:

```json showLineNumbers
{
    "operator": "<",
    "property": "version",
    "value": 5
}
```

### `between` operator

The following rule will return entities which were created in the last week:

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
- lastMonth

The `between` operator also supports standard date ranges:

```json showLineNumbers

```

### `contains` operator

The following rule will return entities whose environment property contains the word `prod`:

```json showLineNumbers
{
    "operator": "contains",
    "property": "environment",
    "value": "prod"
}
```

### `relatedTo` operator

The following rule will return all entities that have a relation graph with `port-api` entity:

```json showLineNumbers
{
    "operator": "relatedTo",
    "value": "port-api"
}
```

:::info entity page and search
The output received from the `relatedTo` operator without any other rule added to the search, is the same output you will receive when viewing the [entity page](../platform-overview/port-components/page.md#entity-page) of the entity you specified in the `value` field
:::

### `dependedOn` operator


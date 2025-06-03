---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Comparison operators

This page details the available comparison operators when writing [rules](/search-and-query/#rules) as part of the search route.

### = (Equal)

The `=` operator checks exact matches of the specified value:

```json showLineNumbers
{
  "operator": "=",
  "property": "myProperty",
  "value": "myExactValue"
}
```

This operator can also be used to check the value of `boolean` properties:

```json showLineNumbers
{
  "operator": "=",
  "property": "myBooleanProperty",
  "value": true
}
```

For datetime properties, the `=` operator only supports ISO8601 format strings:

```json showLineNumbers
{
  "operator": "=",
  "property": "$createdAt",
  "value": "2022-07-26T16:38:06.839Z"
}
```

:::info DateTime format support
The `=` operator only supports ISO8601 format strings for datetime values.   
To use preset date ranges (like "lastWeek", "today", etc.), use the [between](#between) or [notBetween](#notbetween) operators instead.
:::

### != (Not Equal)

The `!=` operator checks exact matches of the specified value and returns all results that fail to satisfy the check:

```json showLineNumbers
{
  "operator": "!=",
  "property": "myProperty",
  "value": "myExactValue"
}
```

This operator can also be used to check the value of `boolean` properties:

```json showLineNumbers
{
  "operator": "!=",
  "property": "myBooleanProperty",
  "value": false
}
```

### > (Greater Than)

The `>` operator checks values larger than the specified value:

```json showLineNumbers
{
  "operator": ">",
  "property": "myNumericProperty",
  "value": 7
}
```

### >= (Greater Than or Equal)

The `>=` operator checks values larger than or equal to the specified value:

```json showLineNumbers
{
  "operator": ">=",
  "property": "myNumericProperty",
  "value": 7
}
```

### < (Less Than)

The `<` operator checks values less than the specified value:

```json showLineNumbers
{
  "operator": "<",
  "property": "myNumericProperty",
  "value": 7
}
```

### \<\= (Less Than or Equal)

The `<=` operator checks values less than or equal to the specified value:

```json showLineNumbers
{
  "operator": "<=",
  "property": "myNumericProperty",
  "value": 7
}
```

### isEmpty

The `isEmpty` operator checks if the value of the specified property is `null`:

```json showLineNumbers
{
  "operator": "isEmpty",
  "property": "myProperty"
}
```

### isNotEmpty

The `isNotEmpty` operator checks if the value of the specified property is not `null`:

```json showLineNumbers
{
  "operator": "isNotEmpty",
  "property": "myProperty"
}
```

### propertySchema

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

### between

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

### notBetween

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

### contains

The `contains` operator checks if the specified substring exists in the specified property:

```json showLineNumbers
{
  "operator": "contains",
  "property": "myStringProperty",
  "value": "mySubString"
}
```

### doesNotContains

The `contains` operator checks if the specified value **does not** exists in the specified property:

```json showLineNumbers
{
  "operator": "doesNotContains",
  "property": "myStringProperty",
  "value": "otherValue"
}
```

### containsAny

The `containsAny` operator checks if **any** of the specified strings exist in the target array:

```json showLineNumbers
{
  "operator": "containsAny",
  "property": "myArrayProperty",
  "value": ["Value1", "Value2", ...]
}
```

### beginsWith

The `beginsWith` operator checks if the specified property starts with the specified value**

```json showLineNumbers
{
  "operator": "beginsWith",
  "property": "myStringProperty",
  "value": "myString"
}
```

### doesNotBeginsWith

The `doesNotBeginsWith` operator checks if the specified property **does not** start with the specified value

```json showLineNumbers
{
  "operator": "doesNotBeginsWith",
  "property": "myStringProperty",
  "value": "otherValue"
}
```

### endsWith

The `endsWith` operator checks if the specified property ends with the specified value

```json showLineNumbers
{
  "operator": "endsWith",
  "property": "myStringProperty",
  "value": "myString"
}
```

### doesNotEndsWith

The `doesNotEndsWith` operator checks if the specified property **does not** end with the specified value

```json showLineNumbers
{
  "operator": "doesNotEndsWith",
  "property": "myStringProperty",
  "value": "otherValue"
}
```

### in

The `in` operator checks if a `string` property is equal to one or more specified `string` values

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

### notIn

The `notIn` operator checks if a `string` property is **not equal** to all of the specified `string` values

```json showLineNumbers
{
  "property": "myStringProperty",
  "operator": "notIn",
  "value": ["Value1", "Value2"]
}
```

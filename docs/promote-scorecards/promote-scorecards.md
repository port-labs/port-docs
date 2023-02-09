---
sidebar_position: 1
title: Promote Scorecards
sidebar_label: 📊 Promote Scorecards
---

import CombinatorIntro from "../build-your-software-catalog/search-and-query/\_combinator_intro.md"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# 📊 Promote Scorecards

## What is a Scorecard?

**Scorecards** enable us to create a set of rules that will determine the level of our Port Entities, based on their properties.
Each scorecard has a set of rules that affects its total level, a rule has a `level` property which is one of the following: `Gold`, `Silver` or `Bronze`. Each rule has specific conditions, and the scorecard level increases when they pass.

**For example**, to keep track of your organization's `Services` maturity, we can create a set of scorecards on top of a `Service` [Blueprint](../build-your-software-catalog/define-your-data-model/setup-blueprint/setup-blueprint.md) that will keep track of their progress. here are some scorecards that we can set:

## 💡 Scorecard use cases

Scorecards can be used to evaluate the maturity, producton readiness and engineering quality of any entity in your software catalog, for example:

- Does a service has an on-call defined?
- Does a README.md file exist in the repository?
- Is Grafana defined for the K8s cluster?
- etc.

In this [live demo](https://demo.getport.io/serviceEntity?identifier=load-generator&activeTab=8) example, you can see the scorecards defined on a service and their evaluation. 🎬

## Scorecard structure table

A single scorecard defines a category to group different checks, validations and evaluations, here is the structure of a single scorecard:

| Field        | Type     | Description                                                                                                                                         |
| ------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`      | `String` | Scorecard name that will be shown in theUI                                                                                                          |
| `identifier` | `String` | The unique identifier of the `Scorecard`. The identifier is used for API calls, programmatic access and distinguishing between different scorecards |
| `filter`     | `Object` | Optional set of conditions to filter entities that will be evaluated by the scorecard                                                               |
| `rules`      | `Object` | The rules that we create for each scorecard to determine it's level                                                                                 |

A scorecard contains and groups multiple rules that are relevant to its specific category, for example a scorecard for _service maturity_ can contain 3 rules, while the _production readiness_ scorecard can contain 2 completely different rules.

## Filter and rule elements

Filters and rules enable you to generate checks inside a scorecard only for the entities and properties that you really care about.

Both filters and rules follow the same querying structure:

<Tabs groupId="filters-and-rules" defaultValue="rules" values={[
{label: "Rules", value: "rules"},
{label: "Filters", value: "filter"}
]}>

<TabItem value="rules">

A scorecard rule is a single evaluation consisting of multiple checks, each rule has a level which directly translates to how important it is for the check to pass (the more basic the check, the lower its level):

| Field        | Type     | Description                                                                                                                                      |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`      | `String` | `Rule` name that will be shown in the UI                                                                                                         |
| `identifier` | `String` | The unique identifier of the `Rule`                                                                                                              |
| `level`      | `String` | one of `Gold` `Silver` `Bronze`                                                                                                                  |
| `query`      | `Object` | The query is built from an array of [`conditions`](#condition-structure-table) and a [`combinator`](#combinator) (or / and) that will define the |

</TabItem>

<TabItem value="filter">

A scorecard filter is used to make sure only relevant entities are evaluated, only entities that the filter evaluates to `true` on will have the specified rule checked:

| Field                                      | Description                                               |
| ------------------------------------------ | --------------------------------------------------------- |
| [`combinator`](#combinator)                | Defines the logical operation to apply to the query rules |
| [`conditions`](#condition-structure-table) | An array of boolean conditions to filter entities with    |

</TabItem>

</Tabs>

### Combinator

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
  "conditions": [
    {
      "operator": "isNotEmpty",
      "property": "on_call"
    },
    {
      "operator": "<",
      "property": "open_incidents",
      "value": 5
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
  "conditions": [
    {
      "operator": "isNotEmpty",
      "property": "on_call"
    },
    {
      "operator": "<",
      "property": "open_incidents",
      "value": 5
    }
  ]
}
```

</TabItem>

</Tabs>

### Conditions

Conditions are small boolean checks that help when determining the final status of a `query` according to the specified [`combinator`](#combinator):

| Field      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `operator` | Search operator to use when evaluating this rule, for example `=`, `!=`, `contains`, `doesNotContains`, `isEmpty`, `isNotEmpty` below                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `property` | Property to filter by according to its value. It can be a [meta-property](../build-your-software-catalog/define-your-data-model/setup-blueprint/properties/meta-properties.md) such as `$identifier`, or any other standard entity property such as `slack_channel` including [Mirror Properties](../build-your-software-catalog/define-your-data-model/setup-blueprint/properties/mirror-property/mirror-property.md) and [Calculation Properties](../build-your-software-catalog/define-your-data-model/setup-blueprint/properties/calculation-property/calculation-property.md) |
| `value`    | Value to compare to (not required in isEmpty and isNotEmpty operators)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

#### Available operators

| Operator           | Supported Types                                  | Description                                                           |
| ------------------ | ------------------------------------------------ | --------------------------------------------------------------------- |
| `=`                | `String`, `Number`, `Boolean`                    | checks if the rule value is equal to the entity value                 |
| `!=`               | `String`, `Number`, `Boolean`                    | checks if the rule value is not equal to the entity value             |
| `<=`               | `String`, `Number`                               | checks if the rule value is less than or equal to the entity value    |
| `>=`               | `String`, `Number`                               | checks if the rule value is greater than or equal to the entity value |
| `<`                | `String`, `Number`                               | checks if the rule value is less than the entity value                |
| `>`                | `String`, `Number`                               | checks if the rule value is greater than the entity value             |
| `contains`         | `String`, `Number`                               | checks if the rule value is contained within the entity value         |
| `doesNotContains`  | `String`, `Number`                               | checks if the rule value is not contained within the entity value     |
| `endsWith`         | `String`, `Number`                               | checks if the rule value ends with the entity value                   |
| `doesNotEndsWith`  | `String`, `Number`                               | checks if the rule value does not end with the entity value           |
| `beginsWith`       | `String`, `Number`                               | checks if the rule value begins with the entity value                 |
| `doesNotBeginWith` | `String`, `Number`                               | checks if the rule value does not begin with the entity value         |
| `isEmpty`          | `String`, `Number`, `Boolean`, `Array`, `Object` | checks if the rule value is an empty string, array, or object         |
| `isNotEmpty`       | `String`, `Number`, `Boolean`, `Array`, `Object` | checks if the rule value is not an empty string, array, or object     |

## Scorecard total level calculation

A Scorecard is built from several rules, and each one of them has a `level` property.

The available `Scorecard` levels are

`Basic` -> `Bronze` -> `Silver` -> `Gold`

Once an Entity passes all of the rules for a certain level, it level changes accordingly.

:::note
You can't define a rule with a `Basic` level, the `Basic` level this level represents if an Entity hasn't passed the rules determining a `Bronze` level, it will be a `Basic` Tier.
:::

## Scorecard example

Please see the following example of an ownership scorecard.

It has two rules:

1. Check that a defined on-call exists and that the number of `open_incidents` is lower than 5
2. Check if a team exists.

```json showLineNumbers
[
  {
    "title": "Ownership",
    "identifier": "ownership",
    "rules": [
      {
        "title": "Has on call?",
        "identifier": "has_on_call",
        "level": "Gold",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "operator": "isNotEmpty",
              "property": "on_call"
            },
            {
              "operator": "<",
              "property": "open_incidents",
              "value": 5
            }
          ]
        }
      },
      {
        "title": "Has a team?",
        "identifier": "has_team",
        "level": "Silver",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "operator": "isNotEmpty",
              "property": "$team"
            }
          ]
        }
      }
    ]
  }
]
```

## Scorecard UI indications

After configuring scorecards for the blueprint, entities matching the defined rules and filters will be evaluated and their scorecards will be displayed in the specific entity page:

![Developer Portal Scorecards Tab](../../static/img/software-catalog/scorecard/tutorial/ScorecardsTab.png)

## Next steps

[Explore How to Create, Edit, and Delete Scorecards with basic examples](./tutorial)

[Dive into advanced operations on Scorecards with our API ➡️ ](../api-reference/api-reference.mdx)

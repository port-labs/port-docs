---
sidebar_position: 1
title: Promote Scorecards
sidebar_label: 📊 Promote Scorecards
---

import CombinatorIntro from "../search-and-query/\_combinator_intro.md"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# 📊 Promote Scorecards

## What is a Scorecard?

**Scorecards** enable us to create a set of rules that will determine the level of our Port entities, based on their properties.
Each scorecard has a set of rules that affects its total level, a rule has a `level` property which is one of the following: `Gold`, `Silver` or `Bronze`. Each rule has specific conditions, and the scorecard level increases when they pass.

**For example**, to keep track of your organization's `Services` maturity, we can create a set of scorecards on top of a `Service` [blueprint](../build-your-software-catalog/define-your-data-model/setup-blueprint/setup-blueprint.md) that will keep track of their progress.

## 💡 Scorecard use cases

Scorecards can be used to evaluate the maturity, producton readiness and engineering quality of any entity in your software catalog, for example:

- Does a service has an on-call defined?
- Does a README.md file exist in the repository?
- Is Grafana defined for the K8s cluster?
- etc.

In this [live demo](https://demo.getport.io/serviceEntity?identifier=load-generator&activeTab=8) example, you can see the scorecards defined on a service and their evaluation. 🎬

## Scorecard structure table

A single scorecard defines a category to group different checks, validations and evaluations. Here is the structure of a single scorecard:

| Field                        | Type     | Description                                                                                                                                         |
| ---------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                      | `String` | Scorecard name that will be shown in the UI                                                                                                         |
| `identifier`                 | `String` | The unique identifier of the `Scorecard`. The identifier is used for API calls, programmatic access and distinguishing between different scorecards |
| [`filter`](#filter-elements) | `Object` | Optional set of [conditions](#conditions) to filter entities that will be evaluated by the scorecard                                                |
| [`rules`](#rule-elements)    | `Object` | The rules that we create for each scorecard to determine it's level                                                                                 |

A scorecard contains and groups multiple rules that are relevant to its specific category, for example a scorecard for _service maturity_ can contain 3 rules, while the _production readiness_ scorecard can contain 2 completely different rules.

## Rule elements

Rules enable you to generate checks inside a scorecard only for entities and properties.

A scorecard rule is a single evaluation consisting of multiple checks, each rule has a level which directly translates to how important it is for the check to pass (the more basic the check, the lower its level):

| Field        | Type     | Description                                                                                                                       |
| ------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `title`      | `String` | `Rule` name that will be shown in the UI                                                                                          |
| `identifier` | `String` | The unique identifier of the `Rule`                                                                                               |
| `level`      | `String` | one of `Gold` `Silver` `Bronze`                                                                                                   |
| `query`      | `Object` | The query is built from an array of [`conditions`](#conditions) and a [`combinator`](#combinator) (or / and) that will define the |

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

The available `Scorecard` levels are:

`Basic` -> `Bronze` -> `Silver` -> `Gold`

An entity **always** starts at the **`Basic`** level.

A **rule's** lowest possible level is `Bronze`.

Once an entity passes all of the rules for a certain level, its level changes accordingly, for example:

1. An entity starts at level `Basic`;
2. It has two rules with level `Bronze`;
3. Once the entity passes those two rules, its level would be `Bronze`;
4. It has four rules with level `Silver`;
5. Once the entity passes those four rules (and the rules from `Bronze` level), its level would be `Silver`;
6. etc.

:::note multiple rules scenario
In the example listed above, let's assume the entity passes just one of the two `Bronze` rules, but it passes all of the `Silver` rules. The `level` of the scorecard will still be `Basic`, because not all `Bronze` rules have been satisfied.
:::

## Filter elements

Filters enable you to apply scorecard checks only for the entities and properties that you really care about.

Filters follow the same querying structure as [rules](#rule-elements).

A scorecard filter is used to make sure only relevant entities are evaluated, only entities that the filter evaluates to `true` on will have the specified rule checked:

| Field                       | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| [`combinator`](#combinator) | Defines the logical operation to apply to the query rules |
| [`conditions`](#conditions) | An array of boolean conditions to filter entities with    |

## Scorecard example

Please see the following example of an ownership scorecard.

It has one filter:

1. Only evaluate entities that are related to production (indicated by checking that the `is_production` property is set to `true`).

It has two rules:

1. Check that a defined on-call exists and that the number of `open_incidents` is lower than 5;
2. Check if a team exists.

```json showLineNumbers
[
  {
    "title": "Ownership",
    "identifier": "ownership",
    "filter": {
      "combinator": "and",
      "conditions": [
        {
          "property": "is_production",
          "operator": "=",
          "value": true
        }
      ]
    },
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

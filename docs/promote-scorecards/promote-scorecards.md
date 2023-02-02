---
sidebar_position: 1
---

# Promote Scorecards 📊

## What is a Scorecard?

**Scorecards** enable us to create a set of rules that will determine the level of our Port Entities, based on their properties.
Each scorecard has a set of rules that affects its total level, a rule has a `level` property which is one of the following: `Gold`, `Silver` or `Bronze`. Each rule has specific conditions, and the scorecard level increases when they pass.

**For example**, to keep track of your organization's `Services` maturity, we can create a set of scorecards on top of a `Service` [Blueprint](../build-your-software-catalog/define-your-data-model/setup-blueprint/setup-blueprint.md) that will keep track of their progress. here are some scorecards that we can set:

- Ownership
  - Has a defined on-call?
  - Has a team?
- Security
  - Does it's Snyk vulnerabilities < 1
- Production Readiness
  - Using a Monitoring service?
- Development Quality
  - Have a linter configured?
  - Have tests?

In the end, within the specific Entity profile, we will get a tab per scorecard that shows the rules' progress and status.

![Developer Portal Scorecards Tab](../../static/img/software-catalog/scorecard/tutorial/ScorecardsTab.png)

## Scorecard structure table

| Field        | Type     | Description                                                          |
| ------------ | -------- | -------------------------------------------------------------------- |
| `title`      | `String` | Scorecard name that will be shown in theUI                           |
| `identifier` | `String` | The unique identifier of the `Scorecard`                             |
| `rules`      | `Object` | The rules that we create for each scorecard to deterimate it's level |

## Scorecard structure rule table

| Field        | Type     | Description                                                                                                                     |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `title`      | `String` | `Rule` name that will be shown in the UI                                                                                        |
| `identifier` | `String` | The unique identifier of the `Rule`                                                                                             |
| `level`      | `String` | one of `Gold` `Silver` `Bronze`                                                                                                 |
| `query`      | `Object` | The query is built from an array of [conditions](#condition-structure-table) and a `combinator` (or / and) that will define the |

## Condition structure table

| Field      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `operator` | Search operator to use when evaluating this rule, for example `=` `!=` `contains` `doesNotContains` `isEmpty` `isNotEmpty` below                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `property` | Property to filter by according to its value. It can be a [meta-property](../build-your-software-catalog/define-your-data-model/setup-blueprint/properties/meta-properties.md) such as `$identifier`, or any other standard entity property such as `slack_channel` includeing [Mirror Properties](../build-your-software-catalog/define-your-data-model/setup-blueprint/properties/mirror-property/mirror-property.md) and [Calculation Properties](../build-your-software-catalog/define-your-data-model/setup-blueprint/properties/calculation-property/calculation-property.md) |
| `value`    | Value to compare to (not required in isEmpty and isNotEmpty operators)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Available operators

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

## Next steps

[Explore How to Create, Edit, and Delete Scorecards with basic examples](./tutorial)

[Dive into advanced operations on Scorecards with our API ➡️ ](../api-reference.md)

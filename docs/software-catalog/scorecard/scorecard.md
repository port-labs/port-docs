---
sidebar_position: 1
---

# Scorecard

## What is a Scorecard?

**Scorecards** enable us to create a set of rules that will determine our Port entity's level based on its properties.
Each scorecard has a set of rules that affects its total level, a rule has a `level` property which is one of the following: `Gold`, `Silver` or `Bronze`. Each rule has specific conditions and when they pass the scorecard level increases.

**For example**, to keep track of your organization's `Services` maturity, we can create a set of scorecards on top of a `Service` [Blueprint](../blueprint/blueprint.md) that will keep track of their progress, here are some scorecards that we can set:

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

In the end, within the specific entity page we will get a tab per scorecard which shows the progress and the rules status.

![Developer Portal Scorecards Tab](../../../static/img/software-catalog/scorecard/tutorial/ScorecardsTab.png)

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

| Field      | Description                                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `operator` | Search operator to use when evaluating this rule, for example `=` `!=` `contains` `doesNotContains` `isEmpty` `isNotEmpty` below                                                                                                     |
| `property` | Property to filter by according to its value. It can be a [meta-property](../../software-catalog/blueprint/mirror-properties.md#meta-property-mirror-property) such as `$identifier`, or a standard property such as `slack_channel` |
| `value`    | The value to compare to (not required in isEmpty and isNotEmpty operators)                                                                                                                                                           |

## Scorecard total level calculation

As shown above, a Scorecard is built from several rules, and each one of them has a `level` property.
The available levels are `Gold`, `Silver`, `Bronze`, if an entity passes all of the rules from a certain level it gets to that level, while ensuring it passed all previous levels.

:::note
if entity didn't pass all of the rules of the `Bronze` level it will be in a `Basic` Tier.
:::

## Scorecard example

Please see the following example of an ownership scorecard. It has two rules, one for checking if a defined on-call exists and another for checking if a team exists. The conditions for each rule use the "isNotEmpty" operator to check if the specified property is not empty.

```json showLineNumbers
{
  "title": "Ownership",
  "identifier": "ownership",
  "rules": [
    {
      "title": "Has a defined on call?",
      "identifier": "has_on_call",
      "level": "Gold",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": "isNotEmpty",
            "property": "on_call"
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
```

## Next Steps

[Explore How to Create, Edit, and Delete Scorecards with basic examples](./tutorial)

[Dive into advanced operations on Scorecards with our API ➡️ ](../../api-providers/rest.md)

---
sidebar_position: 2
title: Concepts and structure
sidebar_label: Concepts and structure
---

import CombinatorIntro from "/docs/search-and-query/\_combinator_intro.md"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Concepts and structure

In your [Builder](https://app.getport.io/settings/data-model) page scorecards are represented by three blueprints:
- [`Scorecard`](#scorecard-structure) - Represents a collection of rules and levels for evaluating entities.
- [`Rule`](#rule-blueprint) - Defines specific criteria for evaluation.
- [`Rule Result`](#rule-result-blueprint) - Stores the evaluation results for each entity.

## Scorecard structure

A single scorecard defines a category to group different checks, validations and evaluations.  
Below is the structure of a single `scorecard` blueprint:

| Name | Type | Description |
|------|------|-------------|
| `Blueprint` | String (format: blueprints) | The target blueprint whose entities will be evaluated. |
| [`Levels`](#levels) | Array of objects | An array of levels with titles and colors (e.g., Bronze, Silver, Gold). |
| [`Filter`](#filter-elements) | Object | Optional query to filter which entities should be evaluated. |
| `Rules tested` | Number ([aggregation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property)) | Number of [rule](#rule-elements) evaluations performed. |
|` Rules passed` | Number ([aggregation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property)) | Number of successful [rule](#rule-elements) evaluations. |
| `% of rules passed` | Number ([calculation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property)) | Calculated percentage of passed rules. |

Relations: The scorecard blueprint doesn't have any relations by default.

A scorecard contains and groups multiple rules that are relevant to its specific category, for example a scorecard for _service maturity_ can contain 3 rules, while the _production readiness_ scorecard can contain 2 completely different rules.

## Levels

Levels are the different stages that an entity can be in, according to the rules that it passes.  
By default, the levels are: `Basic`, `Bronze`, `Silver`, `Gold`.

The levels can be customized according to your organization's standards and with the colors that you prefer.

<img src='/img/scorecards/custom-scorecards-example.png' width='50%' border='1px' />
<br/><br/>

Below is an example of a few level types that can be defined:

:::tip Level Hierarchy 
The levels are defined in the order of importance, where the first level is the most basic level and the last level is the most advanced.  
The basic level is the default level for all entities.  

If the entity didn't pass any rule, it will be at the `Basic` level, and thus can't have a rule associated with it.
:::


<Tabs queryString="Levels" defaultValue="Default">

<TabItem value="Default">

```json showLineNumbers
{
  "identifier": "Ownership",
  "title": "Ownership",
  # highlight-start
  "levels": [
    {
      "color": "paleBlue",
      "title": "Basic"
    },
    {
      "color": "bronze",
      "title": "Bronze"
    },
    {
      "color": "silver",
      "title": "Silver"
    },
    {
      "color": "gold",
      "title": "Gold"
    }
  ],
	# highlight-end
  "rules": [
    {
      "identifier": "has-resp-team",
      "title": "Has responsible team",
      "description": "The service has a designated responsible team assigned, ensuring clear ownership and accountability for the service's development, maintenance, and support, promoting effective collaboration, timely issue resolution, and efficient decision-making.",
      "level": "Bronze",
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
</TabItem>


<TabItem value="Custom">

```json showLineNumbers
{
  "identifier": "monitoringMaturity",
  "title": "Monitoring Maturity",
  # highlight-start
  "levels": [
    {
      "color": "paleBlue",
      "title": "low"
    },
    {
      "color": "bronze",
      "title": "medium"
    },
    {
      "color": "gold",
      "title": "high"
    }
  ],
	# highlight-end
  "rules": []
}
```

</TabItem>

<TabItem value="Traffic Light">

```json showLineNumbers
{
  "identifier": "ProductionReadiness",
  "title": "Production Readiness",
	# highlight-start
  "levels": [
    {
      "color": "red",
      "title": "Red"
    },
    {
      "color": "orange",
      "title": "Orange"
    },
    {
      "color": "yellow",
      "title": "Yellow"
    },
    {
      "color": "green",
      "title": "Green"
    }
  ],
	# highlight-end
  "rules": []
}
```

</TabItem>

</Tabs>

## Rule elements

Rules enable you to generate checks inside a scorecard only for entities and properties.

A scorecard rule is a single evaluation consisting of multiple checks, each rule has a level which directly translates to how important it is for the check to pass (the more basic the check, the lower its level).

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

| Field      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `operator` | Search operator to use when evaluating this rule, for example `=`, `!=`, `contains`, `doesNotContains`, `isEmpty`, `isNotEmpty` (see all available operators below)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `property` | Property to filter by according to its value. It can be a [meta-property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/meta-properties.md) such as `$identifier`, or any other standard entity property such as `slack_channel` including [Mirror Properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/mirror-property) and [Calculation Properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property/calculation-property.md) |
| `value`    | Value to compare to (not required in isEmpty and isNotEmpty operators)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

#### Available operators

| Operator            | Supported Types                                  | Description                                                            |
|---------------------|--------------------------------------------------|------------------------------------------------------------------------|
| `=`                 | `String`, `Number`, `Boolean`                    | checks if the rule value is equal to the entity value.                 |
| `!=`                | `String`, `Number`, `Boolean`                    | checks if the rule value is not equal to the entity value.             |
| `<=`                | `Number`                                         | checks if the rule value is less than or equal to the entity value.    |
| `>=`                | `Number`                                         | checks if the rule value is greater than or equal to the entity value. |
| `<`                 | `Number`                                         | checks if the rule value is less than the entity value.                |
| `>`                 | `Number`                                         | checks if the rule value is greater than the entity value.             |
| `contains`          | `String`, `Number`                               | checks if the rule value is contained within the entity value.         |
| `containsAny`       | `Array`                                          | checks if any of the specified strings exist in the target array.      |
| `doesNotContains`   | `String`, `Number`                               | checks if the rule value is not contained within the entity value.     |
| `endsWith`          | `String`, `Number`                               | checks if the rule value ends with the entity value.                   |
| `doesNotEndsWith`   | `String`, `Number`                               | checks if the rule value does not end with the entity value.           |
| `beginsWith`        | `String`, `Number`                               | checks if the rule value begins with the entity value.                 |
| `doesNotBeginsWith` | `String`, `Number`                               | checks if the rule value does not begin with the entity value.         |
| `isEmpty`           | `String`, `Number`, `Boolean`, `Array`, `Object` | checks if the rule value is an empty string, array, or object.         |
| `isNotEmpty`        | `String`, `Number`, `Boolean`, `Array`, `Object` | checks if the rule value is not an empty string, array, or object.     |

### Rule blueprint

The `Rule` blueprint contains the following properties:
| Name | Type | Description |
|------|------|-------------|
| `Level` | String (enum) | The required level for this rule (must be one of the scorecard's defined levels). |
| `Query` | Object | The evaluation criteria for entities. |
| `Rule description` | String | Optional explanation of the rule's logic. |
| `Entities tested` | Number ([aggregation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property)) | Number of entities evaluated by this rule. |
| `Entities passed` | Number ([aggregation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property)) | Number of entities that passed this rule. |
| `% of entities passed` | Number ([calculation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property)) | Calculated percentage of passed entities. |

Relations:
| Name | Target Blueprint | Required | Many | Description |
|:----:|:----------------:|:---------:|:-----:|:-----------:|
| Scorecard | Scorecard | true | false | The scorecard this rule belongs to |

### Rule result blueprint

The `Rule result` blueprint contains the following properties:
| Name | Type | Description |
|------|------|-------------|
| `Result` | String (enum) | Whether the entity passed the rule ("Passed" or "Not passed"). |
| `Entity` | String | The identifier of the evaluated entity. |
| `Entity link` | String (url) | Calculated URL to the evaluated entity. |
| `Result last change` | Date-Time (mirror) | Last time the rule result changed. |
| `Scorecard` | String (mirror) | Mirror property showing the parent scorecard title. |
| `Blueprint` | String (mirror) | Mirror property showing the target blueprint. |
| `Level` | String (mirror) | Mirror property from the related rule. |

Relations:
| Name | Target Blueprint | Required | Many | Description |
|------|-----------------|----------|-------|-------------|
| Rule | Rule | true | false | The rule that generated this result. |
| [Blueprint Identifier] | [Dynamic] | false | false | Automatically created relation to the target blueprint when a new scorecard is created. |
| Owning Teams | Teams | false | true | The relation to the Team blueprint is created by default. |

:::info Dynamic Relations
When a new scorecard is created, Port automatically creates a relation in the Rule Result blueprint to the scorecard's target blueprint. For example, if you create a scorecard for the "service" blueprint, a new relation named "service" will be added to the Rule Result blueprint.
:::

## Scorecard total level calculation

A Scorecard is built from several rules, and each one of them has a `level` property.

Each scorecard has a set of levels, for example

```json
{
  "levels": [
    {
      "color": "paleBlue",
      "title": "Basic"
    },
    {
      "color": "bronze",
      "title": "Bronze"
    },
    {
      "color": "silver",
      "title": "Silver"
    },
    {
      "color": "gold",
      "title": "Gold"
    }
  ]
}
```

An entity **always** starts at the **`Basic`** level of the scorecard, and it can progress to higher levels by passing the rules of each level.

Once an entity passes all the rules for a certain level, its level changes accordingly, for example:

1. An entity starts at level `Basic`.
2. It has two rules with level `Bronze`.
3. Once the entity passes those two rules, its level would be `Bronze`.
4. It has four rules with level `Silver`.
5. Once the entity passes those four rules (and the rules from `Bronze` level), its level would be `Silver`.

:::note multiple rules scenario
In the example listed above, let's assume the entity passes just one of the two `Bronze` rules, but it passes all of
the `Silver` rules. The `level` of the scorecard will still be `Basic`, because not all `Bronze` rules have been
satisfied.
:::

## Filter elements

Filters allow you to apply scorecard checks only for entities that meet certain criteria.

Filters follow the same querying structure as [rules](#rule-elements).

A scorecard filter is used to make sure only relevant entities are evaluated, only entities that the filter evaluates to `true` on will have the specified rule checked:

| Field                       | Description                                               |
|-----------------------------|-----------------------------------------------------------|
| [`combinator`](#combinator) | Defines the logical operation to apply to the query rules.|
| [`conditions`](#conditions) | An array of boolean conditions to filter entities with.   |

## Important Notes

1. The scorecard blueprints are protected and their core structure cannot be modified:
   - Default properties cannot be changed or deleted.
   - Required relations cannot be modified.
   - The blueprints themselves cannot be deleted.

2. You can extend the blueprints with:
   - New properties.
   - New non-required relations.
   - Additional configurations that don't affect the core functionality.

3. Rule Results are automatically generated and managed by Port:
   - They cannot be created, deleted, or modified directly.
   - You can update the custom properties you created for the rule results.
   - Rule results are not searchable in the global search.
   - They are updated automatically when rules are evaluated.

## Validation Rules

The system enforces several validation rules to maintain data integrity:

1. Rule levels must match one of the levels defined in their parent scorecard.
2. Scorecard blueprint built-in relations cannot be renamed or modified.
3. Rule results maintain immutable core properties while allowing updates to custom properties.

## Scorecard UI indications

After configuring scorecards for the blueprint, each entity created from it will have a `Scorecards` tab in
its [entity page](/customize-pages-dashboards-and-plugins/page/entity-page), detailing the different checks and their results:

 <img src='/img/software-catalog/scorecard/tutorial/ScorecardsTab.png' width='100%' border='1px' />

Additionally, the [catalog page](/customize-pages-dashboards-and-plugins/page/catalog-page) of each blueprint will automatically have a column for each scorecard rule.  
For example, this `Microservice` blueprint has five rules configured, and we can see a column for each of them in the catalog:

 <img src='/img/software-catalog/scorecard/catalogPageScorecardColumns.png' width='100%' border='1px' />

### Customizing views

You can use table operations (sort, edit, group-by, etc.) to create various helpful views of your scorecards.  
For example, here are the scores of all `Microservice` in an organization grouped by team:

 <img src='/img/software-catalog/scorecard/catalogViewScorecardsByTeam.png' width='100%' border='1px' />

Note that every column (scorecard metric) in the table has an aggregation in the bottom, hover over it to see the compliance of this metric across all entities in the table.

### Rule result summaries

Scorecard rules are automatically added as columns in the relevant catalog page, and each such column is summarized on the bottom.  
For example, these microservices have some rules defined in their scorecards, and we can see that:

- 100% of `Ecosystem team's` microservices have an on-call defined, but only 67% of them have domain configured.
- The bottom of the table contains an aggregation of the results of each rule for all microservices (across all teams). Six
	out of eight microservices in total have a domain configured.

<img src='/img/software-catalog/scorecard/catalogRuleSummaries.png' width='100%' border='1px' />

## Next steps
  
Next, let’s look at how you can create and [manage scorecards](/scorecards/manage-scorecards) in Port, whether through the UI, API, or Terraform.

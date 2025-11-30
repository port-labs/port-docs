---
sidebar_position: 2
title: Concepts and structure
sidebar_label: Concepts and structure
---

import CombinatorIntro from "/docs/search-and-query/\_combinator_intro.md"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Concepts and structure

This page demonstrates the concepts of scorecards and their structure in Port.

## Concepts

Scorecards in Port help evaluate entities in your software catalog against defined standards and requirements.  

Each scorecard consists of [**rules**](#rule-elements) that define specific [**conditions**](#conditions) an entity must meet, and [**levels**](#levels) that represent different stages of compliance or maturity.

When a scorecard is applied to an entity, Port evaluates each rule by checking whether the entity's properties satisfy the rule's conditions. Based on which rules pass or fail, the entity is assigned a level that reflects its current state.

### Levels

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

**Total level calculation**

A Scorecard is built from several rules, and each one of them has a `level` property. Each scorecard has a set of levels (as shown in the examples above).

An entity **always** starts at the `Basic` level of the scorecard, and it can progress to higher levels by passing the rules of each level.

Once an entity passes all the rules for a certain level, its level changes accordingly, for example:

1. An entity starts at level `Basic`.
2. It has two rules with level `Bronze`.
3. Once the entity passes those two rules, its level would be `Bronze`.
4. It has four rules with level `Silver`.
5. Once the entity passes those four rules (and the rules from `Bronze` level), its level would be `Silver`.

:::info Multiple rules scenario
In the example listed above, let's assume the entity passes just one of the two `Bronze` rules, but it passes all of
the `Silver` rules. The `level` of the scorecard will still be `Basic`, because not all `Bronze` rules have been
satisfied.
:::

### Rule elements

Rules enable you to generate checks inside a scorecard only for entities and properties.

A scorecard rule is a single evaluation consisting of multiple checks, each rule has a level which directly translates to how important it is for the check to pass (the more basic the check, the lower its level).

**Conditions**

Conditions are small boolean checks that help when determining the final status of a `query` according to the specified [`combinator`](#combinator):

| Field      | Description  |
|------------|--------------|
| `operator` | Search operator to use when evaluating this rule, for example `=`, `!=`, `contains`, `doesNotContains`, `isEmpty`, `isNotEmpty` (see all [available operators](#available-operators) below).   |
| `property` | Property to filter by according to its value. It can be a [meta-property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/meta-properties.md) such as `$identifier`, or any other standard entity property such as `slack_channel` including [mirror properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/mirror-property) and [calculation properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property/calculation-property.md). |
| `value`    | Value to compare to (not required in `isEmpty` and `isNotEmpty` operators).  |

**Combinator**

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

**Available operators**

| Operator            | Supported Types                                  | Description                                                            |
|---------------------|--------------------------------------------------|------------------------------------------------------------------------|
| `=`                 | `String`, `Number`, `Boolean`                    | Checks if the rule value is equal to the entity value.                 |
| `!=`                | `String`, `Number`, `Boolean`                    | Checks if the rule value is not equal to the entity value.             |
| `<=`                | `Number`                                         | Checks if the rule value is less than or equal to the entity value.    |
| `>=`                | `Number`                                         | Checks if the rule value is greater than or equal to the entity value. |
| `<`                 | `Number`                                         | Checks if the rule value is less than the entity value.                |
| `>`                 | `Number`                                         | Checks if the rule value is greater than the entity value.             |
| `contains`          | `String`, `Number`                               | Checks if the rule value is contained within the entity value.         |
| `containsAny`       | `Array`                                          | Checks if any of the specified strings exist in the target array.      |
| `doesNotContains`   | `String`, `Number`                               | Checks if the rule value is not contained within the entity value.     |
| `endsWith`          | `String`, `Number`                               | Checks if the rule value ends with the entity value.                   |
| `doesNotEndsWith`   | `String`, `Number`                               | Checks if the rule value does not end with the entity value.           |
| `beginsWith`        | `String`, `Number`                               | Checks if the rule value begins with the entity value.                 |
| `doesNotBeginsWith` | `String`, `Number`                               | Checks if the rule value does not begin with the entity value.         |
| `isEmpty`           | `String`, `Number`, `Boolean`, `Array`, `Object` | Checks if the rule value is an empty string, array, or object.         |
| `isNotEmpty`        | `String`, `Number`, `Boolean`, `Array`, `Object` | Checks if the rule value is not an empty string, array, or object.     |

### Filter elements

Filters allow you to apply scorecard checks only for entities that meet certain criteria.

Filters follow the same querying structure as [rules](#rule-elements).

A scorecard filter is used to make sure only relevant entities are evaluated, only entities that the filter evaluates to `true` on will have the specified rule checked:

| Field                       | Description                                               |
|-----------------------------|-----------------------------------------------------------|
| [`combinator`](#combinator) | Defines the logical operation to apply to the query rules.|
| [`conditions`](#conditions) | An array of boolean conditions to filter entities with.   |

## Blueprints structure

:::info Feature rollout
This feature is being rolled out gradually in the next couple of weeks. The new blueprints structure provides enhanced flexibility for managing and customizing scorecards, scorecard rules and scorecard rule results.
:::

In your [Builder](https://app.getport.io/settings/data-model) page scorecards are represented by three blueprints:
- [`Scorecard`](#scorecard-structure) - Represents a collection of rules and levels for evaluating entities.
- [`Rule`](#rule-structure) - Defines specific criteria for evaluation.
- [`Rule Result`](#rule-result-structure) - Stores the evaluation results for each entity.

:::warning Default scorecard properties
The properties below are default `scorecard`, `scorecard rule` and `scorecard rule result` properties. They cannot be deleted or modified. 
:::

### Scorecard

A single scorecard defines a category to group different checks, validations and evaluations.  
Below is the structure of the default `scorecard` blueprint:

| Name | Type | Description |
|------|------|-------------|
| `Identifier` | String | The unique identifier of the scorecard (Maximum 100 characters). |
| `Blueprint` | String (format: blueprints) | The target blueprint whose entities will be evaluated. |
| [`Levels`](#levels) | Array of objects | An array of levels with titles and colors (e.g., Bronze, Silver, Gold). |
| [`Filter`](#filter-elements) | Object | Optional query to filter which entities should be evaluated. |
| `Rules tested` | Number ([aggregation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property)) | Number of [rule](#rule-elements) evaluations performed. |
|` Rules passed` | Number ([aggregation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property)) | Number of successful [rule](#rule-elements) evaluations. |
| `% of rules passed` | Number ([calculation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property)) | Calculated percentage of passed rules. |

### Scorecard Rule

The `Rule` blueprint contains the following properties:
| Name | Type | Description |
|------|------|-------------|
| `Identifier` | String | The unique identifier of the rule (Maximum 100 characters). |
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

### Scorecard Rule Result

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

## Limitations

<h3>Core limitations</h3>

1. The scorecard blueprints are **protected** and their core structure **cannot be modified**:
   - Default properties cannot be changed or deleted.
   - Required relations cannot be modified.
   - The blueprints themselves cannot be deleted.

2. You can **extend** the blueprints with:
   - New properties.
   - New non-required relations.
   - Additional configurations that do not affect the core functionality.

3. Rule results are **automatically generated and managed** by Port:
   - They cannot be created, deleted, or modified directly.
   - You can update the custom properties you created for the rule results.
   - Rule results are not searchable in the global search.
   - They are updated automatically when rules are evaluated.

<h3>Validation rules</h3>

The system enforces several validation rules to maintain data integrity:

1. Rule levels must match one of the levels defined in their parent scorecard.
2. Scorecard blueprint built-in relations cannot be renamed or modified.
3. Rule results maintain immutable core properties while allowing updates to custom properties.

<h3>Delayed rule results</h3>

When creating scorecards, adding new rules, or modifying existing rules for blueprints that contain a large number of entities, it may take some time for the `rule results` to appear in your catalog.

This delay occurs because Port needs to create or update rule result blueprint instances for each entity and rule combination. The more entities you have in the blueprint, the more rule results need to be created or updated, which increases the processing time.

<h3>Rule result entity limits</h3>

Port supports up to **5 million** rule result entities.

To monitor how many rule result entities you have, you can:

1. Use the following [API path](/api-reference/get-a-blueprints-entity-count): Query the `_rule_result` blueprint identifier.
2. Create a [number chart](/customize-pages-dashboards-and-plugins/dashboards/#number-chart):
   - Type: `count entities`.
   - Function: `count`.
   - Blueprint: `_rule_result`.
   
If you reach this limit, you can:
- Contact [Port support](https://support.port.io) for assistance.
- Review your scorecards to reduce the number of rules.
- Reduce the number of entities in the blueprints that your scorecards are defined for.

## Scorecard views

Scorecards are available in two contexts in Port's software catalog:

1. **Entity's scorecards** - You can view an entity's scorecard evaluation at the `scorecards` tab on the entity's specific page, which shows how the entity performs against the scorecard rules.
2. **Scorecards dashboards** - Each **scorecard** has its own entity page with a default dashboard and view that provides a comprehensive overview of the scorecard's performance across all entities.

### Entity's scorecards

Each entity with a configured scorecard will have a `scorecards` tab in its [entity page](/customize-pages-dashboards-and-plugins/page/entity-page), detailing the different checks and their results:

 <img src='/img/software-catalog/scorecard/tutorial/ScorecardsTab.png' width='100%' border='1px' />
 <br></br><br></br>

Additionally, the [catalog page](/customize-pages-dashboards-and-plugins/page/catalog-page) of each blueprint will automatically have a column for each scorecard rule.  
For example, this `Microservice` blueprint has five rules configured, and we can see a column for each of them in the catalog:

 <img src='/img/software-catalog/scorecard/catalogPageScorecardColumns.png' width='100%' border='1px' />

#### Customizing views

You can use table operations (sort, edit, group-by, etc.) to create various helpful views of your scorecards.  
For example, here are the scores of all `Microservice` in an organization grouped by team:

 <img src='/img/software-catalog/scorecard/catalogViewScorecardsByTeam.png' width='100%' border='1px' />

Note that every column (scorecard metric) in the table has an aggregation in the bottom, hover over it to see the compliance of this metric across all entities in the table.

#### Rule result summaries

Scorecard rules are automatically added as columns in the relevant catalog page, and each such column is summarized on the bottom.  
For example, these microservices have some rules defined in their scorecards, and we can see that:

- 100% of `Ecosystem team's` microservices have an on-call defined, but only 67% of them have domain configured.
- The bottom of the table contains an aggregation of the results of each rule for all microservices (across all teams). Six
	out of eight microservices in total have a domain configured.

<img src='/img/software-catalog/scorecard/catalogRuleSummaries.png' width='100%' border='1px' />
 
### Scorecards dashboards

By default, admins have a **Scorecard catalog** folder in their software catalog that contains three dashboards:

- [**Scorecards**](https://app.getport.io/_scorecards) - Displays your scorecards across all blueprints.
- [**Scorecards rules**](https://app.getport.io/_rules) - Displays the different scorecard rules across all scorecards.
- [**Scorecards rule results**](https://app.getport.io/_rule_results) - Displays the rule results for each scorecard rules.

#### Scorecard specific entity page

Each scorecard, rule, and rule result has its own [entity page](/customize-pages-dashboards-and-plugins/page/entity-page) with a default dashboard. For scorecards, the dashboard provides a comprehensive overview of the scorecard's performance across all entities.

The scorecard entity page dashboard includes default widgets such as:

- **% of rules passed** - A numerical display showing the overall percentage of rules that have passed for the scorecard.
- **Rules passed** - A pie chart visualizing the breakdown of passed versus not passed rules.
- **% of passed rules over time** - A line chart tracking the historical trend of the percentage of rules passed over time.
- **Rule results summary** - A detailed table breaking down individual rule results, including level, rule name, entity, and result status.

You can customize the dashboard by adding additional widgets or modifying existing ones to display other aggregations, calculations, and visualizations based on your requirements.

## Scorecard permission management

Admins can control who can view and manage scorecards.

Scorecard editing permissions can be granted via the scorecard blueprint permissions configuration. By setting permissions on the `Scorecard` blueprint, you control who can create, edit, and delete scorecards across your organization.

To edit a scorecard permissions:

1. Navigate to the [Builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on the `...` button in the top right corner of the blueprint.

3. Choose `Edit blueprint`.

4. Go to the `Permissions` tab and edit the scorecard permissions.

5. Click `Save`.

**Permission examples:**

Here are some common permission configurations:

- Security scorecards can be edited only by the security team.
- The Production Readiness scorecard can be edited by directors.
- If the scorecard category is `production`, only SREs can edit it.

**Permission behavior:**

- If a user has the `register` permission to the `scorecard` blueprint, they can create scorecards on any other blueprint. The rules defined in the scorecard will be created as a result, even if the user is not a `scorecard rule` blueprint moderator.
- A user with a `moderator` role on a blueprint can create scorecards **for that specific blueprint**. They can add them using the `+ New scorecard` button in the blueprint’s scorecards tab in the [Builder](https://app.getport.io/settings/data-model) page.
- Non-admin users with edit, create, or delete permissions can perform those operations through the scorecard table or widget in the catalog page.

For more information on configuring permissions, refer to the RBAC [documentation](/build-your-software-catalog/set-catalog-rbac/).

## Next steps
  
Next, let’s look at how you can create and [manage scorecards](/scorecards/manage-scorecards) in Port, whether through the UI, API, or Terraform.

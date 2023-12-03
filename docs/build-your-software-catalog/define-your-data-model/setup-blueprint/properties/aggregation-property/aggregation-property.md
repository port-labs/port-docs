---
sidebar_position: 17
description: Aggregation Property allows you to calculate metrics based on the relations in your catalog
---

import ApiRef from "../../../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# 🧬 Aggregation Property

Aggregation properties allow you to calculate metrics based on the [relations](/build-your-software-catalog/define-your-data-model/relate-blueprints/#what-is-a-relation) in your catalog.

Using the aggregation property enables you to see relevant metrics on related entities, without having to manually calculate them.

Aggregations can be performed on any blueprint that is related in any way to the current blueprint (directly, indirectly, upstream or downstream).

## When to use Aggregation Properties?

Aggregation property ideally will be defined on blueprints which are in the **higher abstraction level** in your catalog.

Those blueprints are usually the ones that are **related to many other blueprints** in your catalog, and therefore, they are the ones that can benefit the most from aggregation properties.

## 💡 Common aggregation usage

For example, if you have a microservice blueprint, you can define aggregation properties on it to calculate metrics based on related entities such as:

- Number of open jira issues related to a microservice.
- Number of CRITICAL and HIGH vulnerabilities that are not resolved related to a microservice.
- Average deployment frequency in the last week.
- Build success rate in the last month.

The aggregation property enables you to specify scorecards and initiative rules based on metrics of related entities.

:::tip
For example - If you have a microservice blueprint, with related Alert blueprint, you can define a rule that will check if the number of open CRITICAL and HIGH alerts that are related to each microservice is greater than 0.
:::

## API definition

The `aggregationProperties` key is a top-level key in the JSON of an entity (similar to `identifier`, `title`, `properties`, etc..)

The aggregation property supports calculations by entities or by property.

- Calculations by **entities** are performed on the entities that match the query (e.g. count the number of entities that match the query).

- Calculations by **property** are performed on the property of the entities that match the query (e.g. sum the value of the property of the entities that match the query).

### Calculate By Entities

Calculate by entities is used to calculate metrics based on the entities that match the query.

Supported functions:

- `count` - Count the number of entities that match the query. For example, count the number of open Jira issues related to a microservice.
- `average` - Calculate the average of entities per a defined time period. For example, calculate the average deployment frequency per week.

<Tabs groupId="CalculateByEntities" defaultValue="Entities Count">

<TabItem value="Entities Count">

In this example, we have a microservice blueprint and we want to calculate the number of open Jira issues related to each microservice.

```json
{
  "aggregationProperties": {
    "numberOfOpenJiraIssues": {
      "title": "Number of open Jira issues",
      "targetBlueprint": "jiraIssue",
      "calculationSpec": {
        "calculationBy": "entities",
        "func": "count",
        "query": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "=",
              "value": "OPEN"
            }
          ]
        }
      }
    }
  }
}
```

The `aggregationProperties` contains a key called `numberOfOpenJiraIssues` which is the identifier of the aggregation property we want to define.

- `title` - The title of the aggregation property.
- `targetBlueprint` - The blueprint we want to aggregate data from.
- `calculationSpec` - The calculation specification.
  - `calculationBy` - The calculation will be performed on the entities that match the query (e.g. count the number of entities that match the query).
  - `func` - `count` is the function we want to use for the calculation.
  - `query` - The query that will be performed on the target blueprint. The query is based on the Filters to include or exclude specific data based on Port's [Search Rules](../../../../../search-and-query/search-and-query.md#rules)

</TabItem>

<TabItem value="Entities Average">

In this example, we have a microservice blueprint, and we want to calculate the average deployment frequency for each of the microservices.

```json
{
  "aggregationProperties": {
    "averageDeploymentFrequency": {
      "title": "Average deployment frequency",
      "targetBlueprint": "deployment",
      "calculationSpec": {
        "calculationBy": "entities",
        "func": "average",
        "averageOf": "week",
        "measureTimeBy": "$createdAt",
        "query": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "=",
              "value": "SUCCESS"
            }
          ]
        }
      }
    }
  }
}
```

The `aggregationProperties` contains a key called `averageDeploymentFrequency` which is the identifier of the aggregation property we want to define.

- `title` - The title of the aggregation property.
- `targetBlueprint` - The blueprint we want to aggregate data from.
- `calculationSpec` - The calculation specification.
  - `calculationBy` - The calculation will be performed on the entities that match the query (e.g. count the number of entities that match the query).
  - `func` - `average` is the function we want to use for the calculation.
  - `averageOf` - The time period we want to calculate the average for. Supported Options are: `hour, day ,week and month` In this example, we want to calculate the average deployment frequency for each week.
  - `measureTimeBy` - The time property we want to measure the average by. You can use any date property in the target blueprint by default, we add $createdAt and $updatedAt as [meta-properties](../meta-properties.md) to each entity.
  - `query` - The query that will be performed on the target blueprint. The query is based on the Filters to include or exclude specific data based on Port's [Search Rules](../../../../../search-and-query/search-and-query.md#rules)

</TabItem>

</Tabs>

### Calculate By Property

Calculate by property is used to calculate metrics based on the property of the entities that match the query.

The property type must be a number.

Supported functions:

- `sum` - Sum the value of the property of the entities that match the query. For example, sum the story points of open Jira issues related to a microservice.
- `average` - Calculate the average of the property of the entities that match the query. For example, average cpu usage of a microservice.
- `min` - Calculate the minimum value of the property of the entities that match the query. For example, lowest alert severity of a microservice in the last week.
- `max` - Calculate the maximum value of the property of the entities that match the query. For example, highest alert severity of a microservice in the last week.
- `median` - Calculate the median value of the property of the entities that match the query. For example, median cpu usage of a microservice in the last week.

<Tabs groupId="CalculateByProperty" defaultValue="Sum">

<TabItem value="Sum">

In this example, we have a microservice blueprint, and we want to calculate the sum of the story points of open Jira issues related to each microservice.

```json
{
  "aggregationProperties": {
    "sumOfStoryPoints": {
      "title": "Sum of story points",
      "targetBlueprint": "jiraIssue",
      "calculationSpec": {
        "calculationBy": "property",
        "func": "sum",
        "property": "storyPoints",
        "query": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "=",
              "value": "OPEN"
            }
          ]
        }
      }
    }
  }
}
```

The `aggregationProperties` contains a key called `sumOfStoryPoints` which is the identifier of the aggregation property we want to define.

- `title` - The title of the aggregation property.
- `targetBlueprint` - The blueprint we want to aggregate data from.
- `calculationSpec` - The calculation specification.
  - `calculationBy` - The calculation will be performed on the property of the entities that match the query (e.g. sum the value of the property of the entities that match the query).
  - `func` - `sum` is the function we want to use for the calculation.
  - `property` - The property we want to calculate the sum of. The property type must be a number.
  - `query` - The query that will be performed on the target blueprint. The query is based on the Filters to include or exclude specific data based on Port's [Search Rules](../../../../../search-and-query/search-and-query.md#rules)

</TabItem>

<TabItem value="Average">

In this example, we have a microservice blueprint, and we want to calculate the average cpu usage of each microservice.

```json
{
  "aggregationProperties": {
    "averageCpuUsage": {
      "title": "Average CPU usage",
      "targetBlueprint": "deployment",
      "calculationSpec": {
        "calculationBy": "property",
        "func": "average",
        "property": "cpuUsage",
        "query": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "=",
              "value": "SUCCESS"
            }
          ]
        }
      }
    }
  }
}
```

The `aggregationProperties` contains a key called `averageCpuUsage` which is the identifier of the aggregation property we want to define.

- `title` - The title of the aggregation property.
- `targetBlueprint` - The blueprint we want to aggregate data from.
- `calculationSpec` - The calculation specification.
  - `calculationBy` - `property` The calculation will be performed on the property of the entities that match the query (e.g. average the value of the property of the entities that match the query).
  - `func` - `average` is the function we want to use for the calculation.
  - `property` - The property we want to calculate the average of. The property type must be a number.
  - `query` - The query that will be performed on the target blueprint. The query is based on the Filters to include or exclude specific data based on Port's [Search Rules](../../../../../search-and-query/search-and-query.md#rules)
  - `averageOf` - The time period we want to calculate the average for. Supported Options are: `hour, day ,week and month` In this example, we want to calculate the average cpu usage for each week.
  - `measureTimeBy` - The time property we want to measure the average by. You can use any date property in the target blueprint by default, we add $createdAt and $updatedAt as [meta-properties](../meta-properties.md) to each entity.

</TabItem>

<TabItem value="Min">

In this example, we have a microservice blueprint, and we want to calculate the minimum value of the alert severity of each microservice in the last week.

```json
{
  "aggregationProperties": {
    "minAlertSeverity": {
      "title": "Minimum alert severity",
      "targetBlueprint": "alert",
      "calculationSpec": {
        "calculationBy": "property",
        "func": "min",
        "property": "severity",
        "query": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "=",
              "value": "OPEN"
            },
            {
              "property": "$createdAt",
              "operator": "between",
              "value": {
                "preset": "lastWeek"
              }
            }
          ]
        }
      }
    }
  }
}
```

The `aggregationProperties` contains a key called `minAlertSeverity` which is the identifier of the aggregation property we want to define.

- `title` - The title of the aggregation property.
- `targetBlueprint` - The blueprint we want to aggregate data from.
- `calculationSpec` - The calculation specification.
  - `calculationBy` - `property` The calculation will be performed on the property of the entities that match the query (e.g. minimum value of the property of the entities that match the query).
  - `func` - `min` is the function we want to use for the calculation.
  - `property` - The property we want to calculate the minimum of. The property type must be a number.
  - `query` - The query that will be performed on the target blueprint. The query is based on the Filters to include or exclude specific data based on Port's [Search Rules](../../../../../search-and-query/search-and-query.md#rules)

</TabItem>

<TabItem value="Max">

In this example, we have a microservice blueprint, and we want to calculate the maximum value of the alert severity of each microservice in the last week.

```json
{
  "aggregationProperties": {
    "maxAlertSeverity": {
      "title": "Maximum alert severity",
      "targetBlueprint": "alert",
      "calculationSpec": {
        "calculationBy": "property",
        "func": "max",
        "property": "severity",
        "query": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "=",
              "value": "OPEN"
            },
            {
              "property": "$createdAt",
              "operator": "between",
              "value": {
                "preset": "lastWeek"
              }
            }
          ]
        }
      }
    }
  }
}
```

The `aggregationProperties` contains a key called `maxAlertSeverity` which is the identifier of the aggregation property we want to define.

- `title` - The title of the aggregation property.
- `targetBlueprint` - The blueprint we want to aggregate data from.
- `calculationSpec` - The calculation specification.
  - `calculationBy` - `property` The calculation will be performed on the property of the entities that match the query (e.g. maximum value of the property of the entities that match the query).
  - `func` - `max` is the function we want to use for the calculation.
  - `property` - The property we want to calculate the maximum of. The property type must be a number.
  - `query` - The query that will be performed on the target blueprint. The query is based on the Filters to include or exclude specific data based on Port's [Search Rules](../../../../../search-and-query/search-and-query.md#rules)

</TabItem>

<TabItem value="Median">

In this example, we have a microservice blueprint, and we want to calculate the median value of the cpu usage across all related pods of each microservice.

```json
{
  "aggregationProperties": {
    "medianCpuUsage": {
      "title": "Median CPU usage",
      "targetBlueprint": "pod",
      "calculationSpec": {
        "calculationBy": "property",
        "func": "median",
        "property": "cpuUsage",
        "query": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "=",
              "value": "SUCCESS"
            },
            {
              "property": "$createdAt",
              "operator": "between",
              "value": {
                "preset": "lastWeek"
              }
            }
          ]
        }
      }
    }
  }
}
```

The `aggregationProperties` contains a key called `medianCpuUsage` which is the identifier of the aggregation property we want to define.

- `title` - The title of the aggregation property.
- `targetBlueprint` - The blueprint we want to aggregate data from.
- `calculationSpec` - The calculation specification.
  - `calculationBy` - `property` The calculation will be performed on the property of the entities that match the query (e.g. median value of the property of the entities that match the query).
  - `func` - `median` is the function we want to use for the calculation.
  - `property` - The property we want to calculate the median of. The property type must be a number.
  - `query` - The query that will be performed on the target blueprint. The query is based on the Filters to include or exclude specific data based on Port's [Search Rules](../../../../../search-and-query/search-and-query.md#rules)

</TabItem>

</Tabs>

### Limitations

The aggregation property result for all entities of a blueprint will be recalculated every 15 minutes.

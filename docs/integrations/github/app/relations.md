---
sidebar_position: 5
---

# Relations

## Managing Relations

:::note Prerequisites

- An existing Relation between two Blueprints.

:::

You can use the `relations` key in the `port.yml` file.

For each Relation you may (or must if required) provide its identifier as key, and the related Entity identifier as value.

### Example

In order to manage two Entities and a Relation (`example1` package => `example2` microservice):

```yaml showLineNumbers
- identifier: example1
  title: Example 1
  blueprint: Package
  properties:
    owner: port-labs
  relations:
    package-microservice: example2
- identifier: example2
  title: Example 2
  blueprint: Microservice
  properties:
    owner: port-labs
    runtime: NodeJs
    slack-channel: prod-alerts
    grafana: https://play.grafana.org/d/000000012/grafana-play-home
```

The Relation identifier is provided as key (`package-microservice`), and the microservice Entity to relate to, is provided as value (`example2`).

### Deletion of dependent entities

There are 2 options to delete an Entity from `port.yml` that has dependent Entities (that have required relation(s) to the Entity you want to delete):

1. You can remove the dependent Entities in the same operation (through `port.yml`, if you manage the dependent Entities there).
2. Enable `deleteDependentEntities` flag in [Advanced configurations](./advanced-configuration) (disabled by default).

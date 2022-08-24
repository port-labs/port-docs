---
sidebar_position: 5
---

# Relations

## How to manage?

:::note Prerequisites
- An existing relation from blueprint to blueprint.
:::

You can use the `relations` key in `port.yml` file. 

For each relation you may (or must if required) provide its identifier as key, and the related entity identifier as value.

### Example
In order to manage two entities and a relation (`example1` package => `example2` microservice):
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
The relation identifier provided as key (`package-microservice`), and the microservice entity to relate to, provided as value (`example2`).

### Deletion of dependents entities

If you want to delete an entity from `port.yml` that has dependents entities (that has required relation(s) to the entity you want to delete), there are two options:
1. You can remove also the dependents entities in the same operation (through `port.yml`, if you manage the dependents entities there).
2. Enable `deleteDependentEntities` flag in [Advanced configurations](./advanced-configuration) (disabled by default).

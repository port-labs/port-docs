---
sidebar_position: 4
---

# Multiple entities

## How does it work?

In order to manage multiple entities (of one or more blueprints), there are two ways (which you can combine):

1. Use YAML sequences (arrays/lists) in your `port.yml` file.

Here is an example:

```yaml showLineNumbers
- identifier: example1
  title: Example 1
  blueprint: Microservice
  properties: 
    owner: port-labs
    runtime: NodeJs
    slack-channel: prod-alerts
    grafana: https://play.grafana.org/d/000000012/grafana-play-home
- identifier: example2
  title: Example 2
  blueprint: Microservice
  properties: 
    owner: port-labs
    runtime: NodeJs
    slack-channel: prod-alerts
    grafana: https://play.grafana.org/d/000000012/grafana-play-home
```


2. Use multiple `port.yml` files (e.g., Monorepo use-case). 
By default, we search for all `port.yml` files in your repo (Use `specPath` (Glob Patterns) in [Advanced configurations](./advanced-configuration) to control it)

![img.png](img.png)
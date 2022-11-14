---
sidebar_position: 4
---

# Multiple entities

## How does it work?

There are two methods to manage multiple Entities (of one or more Blueprints). The methods can be merged if need be:

1. Use [YAML sequences](#YAML-sequences) (arrays/lists) in your `port.yml` file.
2. Use [multiple](#multiple-files) `port.yml` files (e.g., Monorepo use-case).

### YAML sequences

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

### Multiple files

By default, we search for all `port.yml` files in your repo (Use `specPath` (Glob Patterns) in [Advanced configurations](./advanced-configuration) to control it):

![GitHub app tree of port.yml files](../../../../static/img/integrations/github-app/GithubTreeOfPortYamlFiles.png)

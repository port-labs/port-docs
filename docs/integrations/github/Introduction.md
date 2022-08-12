---
sidebar_position: 1
---

# Introduction

Our Github app allows you to quickly and easily map out your Software Catalog according to your existing code repositories and projects

You can visit [our GitHub App](https://github.com/apps/getport-io) page to get started.

Here you'll find a step-by-step guide to installing the GitHub App of Port.

## What does our GitHub application give you?

- Automatic updates to the entities mapped from Github based on updates to the `port.yml` file
- Additional metadata provided by Github see [Auto Importing Properties](./auto-importing-properties), available directly from Port

## How does our GitHub App Work?

In order to use the Github App all you need to do is include a `port.yml` file in your code repositories, or multiple `port.yml` files in your Monorepo.

The `port.yml` file format is very similar to a standard [Port Entity](../../platform-overview/port-components/entity.md#), here is an example:

```yaml showLineNumbers
identifier: example
title: Example
blueprint: Microservice
properties: 
  repository: https://github.com/port-labs/github-app-setup-example
  owner: port-labs
  runtime: NodeJs
  slack-channel: prod-alerts
  grafana: https://play.grafana.org/d/000000012/grafana-play-home
```

### Triggers

1. Merging a branch to the `main` (default) branch will trigger the app to search for port.yml files
2. Opening or updating a `pull request` will trigger a checkrun which validates the port.yml files

### Permissions

Port's Github App requires the following permissions:

- **Read** access to code and metadata
- **Read** and **write** access to checks and pull requests

:::note
You will also be prompted to confirm these permissions when first installing the App
:::


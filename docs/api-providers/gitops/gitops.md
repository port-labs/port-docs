---
sidebar_position: 1
---

# GitOps GitHub App

Our GitHub app allows you to quickly and easily map out your Software Catalog, according to your existing code repositories and projects.

You can install the our GitHub App by following [our installation guide](../../exporters/github-exporter/installation.md).

## What Does Our GitHub Application Offer You?​

- Automatic updates to Entities mapped from GitHub, based on updates to the `port.yml` file.
- Additional metadata provided by GitHub. See [Auto Importing Properties](./auto-importing-properties), available directly from Port

## How does it Work?

In order to use the GitHub App, all you need to do is include a `port.yml` file in your code repositories, or multiple `port.yml` files in your Monorepo.

The `port.yml` file format is very similar to a standard [Port Entity](../../software-catalog/entity/entity.md), here is an example:

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

1. Merging a branch to the `main` (default) branch will trigger the app to search for `port.yml` files.
2. Opening or updating a `pull request` will trigger a check run which validates the `port.yml` files.

### Permissions

Port's Github App requires the following permissions:

- **Read** access to code and metadata;
- **Read** and **write** access to checks and pull requests.

:::note
You will be prompted to confirm these permissions when first installing the App.

:::

---
sidebar_position: 1
---

# Bitbucket App GitOps

Our Bitbucket app allows you to quickly and easily map out your Software Catalog, according to your existing code repositories and projects.

You can install our Bitbucket App by following [our installation guide](../../git-provider/bitbucket-exporter/installation.md).

## What Does Our Bitbucket Application Offer You?​

- Automatic updates to Entities mapped from Bitbucket, based on updates to the `port.yml` file.

## How does it Work?

In order to use the GitHub App, all you need to do is include a `port.yml` file in your code repositories, or multiple `port.yml` files in your Monorepo.

The `port.yml` file format is very similar to a standard [Port Entity](../../sync-data-to-catalog.md#entity-json-structure), here is an example:

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

Push directly or Merging a branch to the `main` (default) branch will trigger the app to search for `port.yml` files.

### Permissions

Port's Bitbucket App requires the following permissions:

- **Read** your account information.
- **Read** your repositories and their pull requests.

:::note
You will be prompted to confirm these permissions when first installing the App.

:::

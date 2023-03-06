---
sidebar_position: 1
---

# Quickstart

:::note Prerequisites

[Please install our GitHub app](../../git-provider/github-exporter/installation.md).
:::

1. Clone our example repo: [github-app-setup-example](https://github.com/port-labs/github-app-setup-example).

2. Use the `microservice.json` file as a base for your [Blueprint](../../../define-your-data-model/setup-blueprint/setup-blueprint.md).

:::tip
You can add any property you want into the base `microservice.json` file
:::

1. Once you are satisfied with your Blueprint, go ahead and create it in Port.

2. Now let's get the data inside Port:

   If you don't have a `port.yml` file, please create one in your repository in a format that matches the example shown in this [GitHub Repository](https://github.com/port-labs/github-app-setup-example/blob/main/port.yml), and then commit/merge it into the `main` branch.

   If you already have a `port.yml` file in the `main` branch of the cloned example repository, update it to match the Blueprint that you created (the example itself does not require any changes, so if you have just created the Blueprint, without changing `microservice.json`, it will work out of the box).

3. After the changes have been merged, you will see the data specified in the `port.yml` file appear in the page matching your new Blueprint in Port!

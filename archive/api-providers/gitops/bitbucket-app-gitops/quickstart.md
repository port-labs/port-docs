---
sidebar_position: 1
---

# Quickstart

:::note Prerequisites

[Please install our Bitbucket app](../../../exporters/bitbucket-exporter/installation.md).
:::

1. Clone our example repo: [bitbucket-app-setup-example](https://bitbucket.com/port-labs/bitbucket-app-setup-example).

2. Use the `microservice.json` file as a base for your [Blueprint](../../../software-catalog/blueprint/blueprint.md).

:::tip
You can add any property you want into the base `microservice.json` file
:::

3. Once you are satisfied with your Blueprint, go ahead and create it in Port [via UI](../../../software-catalog/blueprint/tutorial.md#from-the-ui) or [via API](../../../software-catalog/blueprint/tutorial.md#from-the-api).

4. Now let's get the data inside Port:

   If you don't have a `port.yml` file, please create one in your repository in a format that matches the example shown in this [Bitbucket Repository](https://bitbucket.org/port-labs/bitbucket-app-setup-example/src/master/port.yml), and then commit/merge it into the `main` branch.

   If you already have a `port.yml` file in the `main` branch of the cloned example repository, update it to match the Blueprint that you created (the example itself does not require any changes, so if you have just created the Blueprint, without changing `microservice.json`, it will work out of the box).

5. After the changes have been merged, you will see the data specified in the `port.yml` file appear in the page matching your new Blueprint in Port!

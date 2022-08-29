---
sidebar_position: 3
---

# Quickstart
:::note Prerequisites

[Please install our GitHub app](./installation).
:::
1. Clone our example repo: [github-app-setup-example](https://github.com/port-labs/github-app-setup-example)
:::note
This repo is `private` at the moment, so you’ll get a 404.
Please contact us with your GitHub user for access.
:::

2.  Use the `microservice.json` file as a base for your [Blueprint](../../platform-overview/port-components//blueprint.md)

:::tip
You can add any property you want into the base `microservice.json` file
:::

3. Once you are satisfied with your Blueprint, go ahead and create it in Port [via UI](../../tutorials/blueprint-basics.md#from-the-ui) or [via API](../../tutorials/blueprint-basics.md#from-the-api) 

4. Now let's get the data inside Port:

    If you don't have a `port.yml` file, please create one in your repository in a format that matches the example shown in this [GitHub Repository](https://github.com/port-labs/github-app-setup-example/blob/main/port.yml) and then commit/merge it into the `main` branch

    If you already have a `port.yml` file in the `main` branch of the cloned example repository, update it to match the blueprint that you created (The example itself does not require any changes, so if you just created the blueprint without changing `microservice.json`, it should all work out of the box)

5. After the changes have been merged, you should see the data specified in the `port.yml` file appear in the page matching your new blueprint in Port!

:::tip
You might have noticed we didn't supply the repository link in the port.yml but it is shown in port automatically, if you want to know how it works you can refer to the [Auto importing properties](./Auto%20importing%20properties) section
:::

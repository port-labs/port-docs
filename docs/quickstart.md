---
sidebar_position: 2
title: Quickstart
sidebar_label: ⏱️ Quickstart
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# ⏱️ Quickstart

This guide takes 5-7 minutes to complete, and aims to demonstrate the potential of a developer portal for you and your developers.

:::tip note
This guide will include Port concepts and components that are a bit more advanced. Do not worry about understanding everything now, use this guide to get a sense of what you can achieve with Port and gain some hands-on experience with it 😎
:::

### Agenda

In this guide we will model a repository from your Git provider in Port, using your real data.

Sign up
Create “Repository” blueprint (provide code, use API) with simple scorecard (e.g. must have team name).
Install Git provider app
Add mapping to data sources (we will provide it, just copy-paste).
Add simple dashboard
What can your devs now achieve using what we created?

### 1. Sign-up to Port

❇️ Head over to [app.getport.io](https://app.getport.io) and create an account.

### 2. Create your first blueprint!

[Blueprints](/build-your-software-catalog/define-your-data-model/setup-blueprint/) are one of Port's basic building blocks, used to represent any data source in your infrastructure.  
We will now create a `Repository` blueprint to model a Git repository on Github/Bitbucket.

We will use Port's API to create the blueprint:

1. You will need to authorize your Port account against the API:
   - Get your bearer token:
     - Go to your [Port app](https://app.getport.io).
     - Hover over the `...` icon at the top right.
     - Click on `Credentials`, then click on `Generate API token` and copy the token.

![credentials](/img/quickstart/credentials.png)

2. Go to [api.getport.io](https://api.getport.io), click on `Authorize`, paste your token, and click `Authorize` again.

![apiAuthorize](/img/quickstart/apiAuthorize.png)

---

Now that we can use the API, let's go ahead and create our `Repository` blueprint:

1. Select the `POST` request for blueprints, then click on `Try it out`:

![apiBlueprintPost](/img/quickstart/apiBlueprintPost.png)

2. In the request body, replace the existing example with the following definition, then click `Execute`:

```json showLineNumbers
{
  "identifier": "repository",
  "title": "Repository",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown"
      },
      "url": {
        "title": "Repository URL",
        "type": "string",
        "format": "url"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

Congratulations, you have successfully modeled a basic Git repository 🥳  
You can now see the blueprint in the `Builder` tab of your Port app:

![builderAfterBpCreate](/img/quickstart/builderAfterBpCreate.png)

Now let's create an Entity based on our new blueprint and fill it with real data!

### 3. Ingest data into your repository

1. To export and sync data from Github or BitBucket, Port provides a simple application. Choose your preferred provider and install the app:

<Tabs values={[
{label: "Github", value: "Github"},
{label: "BitBucket", value: "BitBucket"}
]}>

<TabItem value="Github">

Install [Github app](https://github.com/apps/getport-io).

</TabItem>

<TabItem value="BitBucket">

Install [BitBucket app](https://marketplace.atlassian.com/apps/1229886/port-connector-for-bitbucket?hosting=cloud&tab=overview).

</TabItem>

</Tabs>

Once installed, you should now see new data sources in your `Builder` waiting to be used, for example:

![dataSourcesGithub](/img/quickstart/dataSourcesGithub.png)

2. Finally, we need to map the desired information from our Git provider's API to the properties of the blueprint we created in Port. For this guide, we will provide you with mapping so you do not need to do anything yourself.

In the `Data sources` page, click on the exporter you installed. In the `Mapping` tab paste the following snippet, then click `Save & Resync`:

```yaml showLineNumbers
resources:
  - kind: repository
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    port:
      entity:
        mappings:
          identifier: ".name" # The Entity identifier will be the repository name.
          title: ".name"
          blueprint: '"repository"'
          properties:
            readme: file://README.md # fetching the README.md file that is within the root folder of the repository and ingesting its contents as a markdown property
            url: .html_url
```

## Now head back to your `Catalog`,

---
sidebar_position: 2
title: Setup Methods
sidebar_label: 🔧 Setup Methods
---

import CredentialsGuide from "../build-your-software-catalog/sync-data-to-catalog/api/\_template_docs/\_find_credentials.mdx";
import ApiRef from "../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# 🔧 Setup Methods

Port supports a variety integrations, apps and tools that allow you to model your software catalog, ingest data and invoke actions, some of the core setup methods are:

- Port's API;
- Port's Terraform provider;
- Port's web UI.

See the section below to understand how to use the different methods to define your blueprints and relations:

:::tip prerequisites

To use Port's API and Terraform provider, you will need API credentials.

<CredentialsGuide />
:::

<Tabs groupId="config" queryString="current-method" defaultValue="api" values={[
{label: "API", value: "api"},
{label: "Terraform", value: "tf"},
{label: "UI", value: "ui"},
]}>

<TabItem value="api">

Port's [API](../api-reference/api-reference.mdx) provides a convenient REST interface to perform CRUD operations in your software catalog.

Port's API base URL is: `https://api.getport.io/v1`

The API supports all common HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

All API endpoints follow a resource based access schema, for example:

- Blueprint based routes start with: `https://api.getport.io/v1/blueprints`;
- Entity based routes start with: `https://api.getport.io/v1/blueprints/{blueprint_identifier}/entities` (because they are a resource tied to blueprints);
- Self-service action based routes start with: `https://api.getport.io/v1/blueprints/{blueprint_identifier}/actions`;
- Scorecards based routes start with:`https://api.getport.io/v1/blueprints/{blueprint_identifier}/scorecards`;
- etc.

To learn more about the JSON structure of different API objects, refer to their respective category and structure reference, for example - [blueprint structure](../build-your-software-catalog/define-your-data-model/setup-blueprint/setup-blueprint.md#blueprint-structure).

<ApiRef />

</TabItem>

<TabItem value="tf">

Port's [Terraform provider](https://registry.terraform.io/providers/port-labs/port-labs/) allows you to configure your software catalog using Infrastructure as Code (IaC).

To install the Terraform provider create a `.tf` file specifying the provider:

```hcl showLineNumbers
terraform {
  required_providers {
    port-labs = {
      source  = "port-labs/port-labs"
      version = "~> 0.5.1"
    }
  }
}

provider "port-labs" {
  client_id = "{YOUR CLIENT ID}"     # or set the env var PORT_CLIENT_ID
  secret    = "{YOUR CLIENT SECRET}" # or set the env var PORT_CLIENT_SECRET
}
```

Then run the following command to install the provider in your Terraform workspace:

```shell showLineNumbers
terraform init
```

To learn more about the terraform resource definition of different API objects, refer to their respective category and structure reference, for example - [configure blueprints in Port](../build-your-software-catalog/define-your-data-model/setup-blueprint/setup-blueprint.md?definition=tf#configure-blueprints-in-port).

</TabItem>

<TabItem value="ui">

To configure your software catalog using the UI, go to the [DevPortal Setup](https://app.getport.io/dev-portal) page and follow the `add blueprint` UI, `sync data` modal and other visual tools that help you configure Port.

</TabItem>

</Tabs>

---
sidebar_position: 11
sidebar_class_name: custom-sidebar-item sidebar-menu-usage-methods
---

import CredentialsGuide from "/docs/build-your-software-catalog/custom-integration/api/\_template_docs/\_find_credentials.mdx";
import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"
import InstallTerraform from "/docs/build-your-software-catalog/sync-data-to-catalog/iac/terraform/\_terraform_provider_base.mdx"

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Usage methods

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

Port's [API](/api-reference/api-reference.mdx) provides a convenient REST interface to perform CRUD operations in your software catalog.

Port's API base URL is: `https://api.getport.io/v1`

The API supports all common HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

All API endpoints follow a resource based access schema, for example:

- Blueprint based routes start with: `https://api.getport.io/v1/blueprints`;
- Entity based routes start with: `https://api.getport.io/v1/blueprints/{blueprint_identifier}/entities` (because they are a resource tied to blueprints);
- Self-service action based routes start with: `https://api.getport.io/v1/blueprints/{blueprint_identifier}/actions`;
- Scorecards based routes start with:`https://api.getport.io/v1/blueprints/{blueprint_identifier}/scorecards`;
- etc.

To learn more about the JSON structure of different API objects, refer to their respective category and structure reference, for example - [blueprint structure](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/setup-blueprint.md#blueprint-structure).

<ApiRef />

</TabItem>

<TabItem value="tf">

Port's [Terraform provider](https://registry.terraform.io/providers/port-labs/port-labs/) allows you to configure your software catalog using Infrastructure-as-Code (IaC).

<InstallTerraform />

To create a blueprint using Port's Terraform provider you need a `.tf` file defining a [`port_blueprint`](https://registry.terraform.io/providers/port-labs/port-labs/latest/docs/resources/port_blueprint) resource:

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  title      = "My blueprint"
  icon       = "My icon"
  identifier = "myIdentifier"
  description = "My description"
}
```

Then run `terraform plan` to view the new blueprint that will be created, and `terraform apply` to create the blueprint you defined, inside Port's software catalog.

To learn more about the Terraform resource definition of different API objects, refer to their respective category and structure reference, for example - [configure blueprints in Port](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/setup-blueprint.md?definition=tf#configure-blueprints-in-port) and [Terraform provider](/build-your-software-catalog/sync-data-to-catalog/iac/terraform/terraform.md).

</TabItem>

<TabItem value="ui">

To configure your software catalog using the UI, go to the [DevPortal Builder](https://app.getport.io/dev-portal) page and follow the `add blueprint` UI, `ingest data` modal and other visual tools that help you configure Port.

</TabItem>

</Tabs>

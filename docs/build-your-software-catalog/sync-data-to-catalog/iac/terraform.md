---
sidebar_position: 1
---

import InstallTerraform from "./\_terraform_provider_base.mdx"

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Terraform

Our integration with Terraform allows you to combine the state of your infrastructure with the entities representing them in Port.

Bu using Port's Terraform provider you make it easy to integrate Port with your existing IaC definitions, every resource provisioned by Terraform can also be reported to the software catalog using the same `.tf` definition file.

:::info port terraform provider
You can view the official registry page for our Terraform provider [here](https://registry.terraform.io/providers/port-labs/port-labs/)
:::

## 💡 Terraform provider common use cases

Our Terraform provider makes it easy to fill the software catalog with data directly from your IaC definitions, for example:

- Report **cloud accounts**;
- Report **databases**;
- Report **lambdas** and **managed Kubernetes services**;
- etc.

## Installation

<InstallTerraform/>

## Sync data using the Terraform provider

To sync data to the software catalog using the Terraform provider, you will define [`port-labs_entity`](https://registry.terraform.io/providers/port-labs/port-labs/latest/docs/resources/entity) resources in your Terraform definition files:

<Tabs groupId="sync-data" queryString="current-scenario" defaultValue="create" values={[
{label: "Create", value: "create"},
{label: "Update", value: "update"},
{label: "Delete", value: "delete"},
]} >

<TabItem value="create">

To create an entity using Terraform, add a `port-labs_entity` resource to your `.tf` definition file:

```hcl showLineNumbers
resource "port-labs_entity" "myEntity" {
  title     = "My Entity"
  blueprint = "myBlueprint"

  properties {
    name  = "myStringProp"
    value = "Example microservice"
  }
  properties {
    name  = "myNumberProp"
    value = 1
  }
  properties {
    name  = "myArrayProp"
    items = ["#rnd", "#deployments"]
  }
  properties {
    name  = "myObjectProp"
    value = jsonencode({ "foo" : "bar" })
  }
  properties {
    name  = "deployed"
    value = "true"
  }
}
```

</TabItem>

</Tabs>

## Usage

### Creating Blueprints

First, we will create two Blueprints (microservice and package) and then connect a microservice to multiple packages. Add the following to your Terraform files:

```hcl showLineNumbers
resource "port-labs_blueprint" "microservice" {
  title      = "Microservice"
  icon       = "Microservice"
  identifier = "microservice"
  properties {
    identifier = "slackChannels"
    type       = "array"
    title      = "Slack Channels"
    required   = true
  }
  properties {
    identifier = "repoUrl"
    type       = "string"
    format     = "url"
    title      = "Repository URL"
    required   = true
  }
  properties {
    identifier = "description"
    type       = "string"
    title      = "Description"
    required   = false
  }
  properties {
    identifier = "config"
    type       = "object"
    title      = "Config"
  }
  properties {
    identifier = "replicas"
    type       = "number"
    title      = "Number of Replicas"
  }
  properties {
    identifier = "deployed"
    type       = "boolean"
    title      = "Is Deployed"
  }
}
resource "port-labs_blueprint" "package" {
  title      = "Package"
  icon       = "Package"
  identifier = "package"
  properties {
    identifier = "name"
    type       = "string"
    title      = "name"
  }
  properties {
    identifier = "version"
    type       = "string"
    title      = "version"
  }
  relations {
    identifier = "package"
    title      = "Packages"
    target     = port-labs_blueprint.microservice.id
  }
}
```

### Creating entities

Next, we would like to create a microservice (for example, "Golang Monolith") and connect to it a few packages. To do so, Add the following resources to your Terraform files:

```hcl showLineNumbers
resource "port-labs_entity" "golang_monolith" {
  title     = "Golang Monolith"
  blueprint = port-labs_blueprint.microservice.id
  properties {
    name  = "slackChannels" # should match the identifier of the property in the blueprint schema.
    items = ["#rnd", "#deployments"]
  }
  properties {
    name  = "config"
    value = jsonencode({ "PORT" : "8080" })
  }
  properties {
    name  = "description"
    value = "Example microservice"
  }
  properties {
    name  = "deployed"
    value = "true"
  }
  properties {
    name  = "replicas"
    value = 1
  }
}
resource "port-labs_entity" "fmt" {
  title     = "fmt"
  blueprint = port-labs_blueprint.package.id
  relations {
    identifier = port-labs_entity.golang_monolith.id
    name       = "package"
  }
  properties {
    name  = "version"
    value = 1.1
  }
}
resource "port-labs_entity" "net" {
  title     = "net"
  blueprint = port-labs_blueprint.package.id
  relations {
    identifier = port-labs_entity.golang_monolith.id
    name       = "package"
  }
  properties {
    name  = "version"
    value = 12.3
  }
}
```

- Run the command `terraform plan` to see the resulting set of actions Terraform will take: (You will see this result `Plan: 5 to add, 0 to change, 0 to destroy`)

:::note Prerequisites
Don't forget to set your Port client id and secret in order for the provider to authenticate with Port's API:

```shell
export `PORT_CLIENT_ID`=YOUR_CLIENT_ID
export `PORT_CLIENT_SECRET`=YOUR_CLIENT_SECRET
```

:::

To create the Blueprints and Entities above, run:

```shell showLineNumbers
terraform apply
```

That's it! the Entity has been created and visible in the UI.

![Entities](../../../../static/img/integrations/terraform-provider/Entities.png)

For more examples, check out the examples and test cases in the [public repository](https://github.com/port-labs/terraform-provider-port).

### Update a resource

- To update a resource, change the value of the resource in the Terraform configuration files and use the command `terraform apply`.

### Delete a resource

- To delete a resource, you need to run `terraform destroy --target port-labs.{resource-name}`.

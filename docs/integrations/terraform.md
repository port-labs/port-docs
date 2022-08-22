---
sidebar_position: 2
---

# Terraform Provider

Our integration with Terraform allows you to combine the state of your infrastructure with the entities representing them in Port. For the official documentation of the Port Terraform provider checkout out the [registry page](https://registry.terraform.io/providers/port-labs/port-labs/)

Here you'll find a step-by-step guide to installing the Port Terraform Provider.

## What does our Terraform Provider give you?

- Automatic management of entities based on resources in terraform files.
- The option to define resources in yml files and reflect them in Port using the provider

## Installation

:::note Prerequisites

Terraform CLI (Installation guide: https://learn.hashicorp.com/tutorials/terraform/install-cli).
:::

First, require the provider in your terraform configuration (refer [here](https://registry.terraform.io/providers/port-labs/port-labs/latest/docs/resources/entity) for our resources schema):

```hcl
terraform {
  required_providers {
    port-labs = {
      source  = "port-labs/port-labs"
      version = "~> 0.0.1"
    }
  }
}

provider "port-labs" {
  client_id = "{YOUR CLIENT ID}"     # or set the env var PORT_CLIENT_ID
  secret    = "{YOUR CLIENT SECRET}" # or set the env var PORT_CLIENT_SECRET
}
```

To make terraform install the port provider, run the command:

```shell
terraform init
```

The command should print something like this when the `init` command is finish:

`Terraform has been successfully initialized!`

In order to validate that the module initialization worked, run the command:

```shell
 terraform plan
```

The result should be : `No changes. Your infrastructure matches the configuration.`

## Usage

### Creating Blueprints

First, we will create two blueprints - Microservice and Package and we will connect to multiple packages. Add the following to your terraform files:

```hcl
resource "port-labs_blueprint" "microservice" {
  title      = "Microservice"
  icon       = "Microservice"
  identifier = "microservice"
  properties {
    identifier = "slackChannels"
    type       = "array"
    title      = "Slack Channels"
  }
  properties {
    identifier = "repoUrl"
    type       = "string"
    format     = "url"
    title      = "Repository URL"
  }
  properties {
    identifier = "description"
    type       = "string"
    title      = "Description"
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

Next, we would like to create a microservice (say, "Golang Monolith") and connect to it a few packages. Add the following resources to your terraform files:

```hcl
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

- Run the command `terraform plan` to see the resulting set of actions terraform will take: (You should see this result `Plan: 5 to add, 0 to change, 0 to destroy`)

:::note Prerequisites
Don't forget to set your port client id and secret in order for the provider to authenticate with Port's API:

```shell
export `PORT_CLIENT_ID`=YOUR_CLIENT_ID
export `PORT_CLIENT_SECRET`=YOUR_CLIENT_SECRET
```

:::

To create the blueprints and entities above, run:

```shell
terraform apply
```

That's it! the entity should now be created and visible in the UI.

![Entities](../../static/img/integrations/terraform-provider/Entities.png)

For more examples, see the examples and test cases in the [public repository](https://github.com/port-labs/terraform-provider-port).

### Update a resource

- To update a resource, change the value of the resource in the terraform configuration files and use the command `terraform apply`.

### Delete a resource

- To delete a resource, you need to run `terraform destory --target port-labs.{resource-name}`.

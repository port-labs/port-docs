---
sidebar_position: 2
---

# Terraform Provider

Our integration with Terraform allows you to combine the state of your infrastructure with the entities representing them in Port. For the official documentation of the Port Terraform provider checkout out the [registry page](https://registry.terraform.io/providers/port-labs/port/)

Here you'll find a step-by-step guide to installing the Port Terraform Provider.

## Installation
First, require the provider in your terraform configuration:
```hcl
terraform {
  required_providers {
    atlas = {
      source  = "port-labs/port"
      version = "~> 0.0.1"
    }
  }
}
port {
    client_id  = "YOUR CLIENT ID" # or set the env var PORT_CLIENT_ID
    secret     = "YOUR CLIENT SECRET" # set the env var PORT_CLIENT_SECRET
}
```

to make terraform install the port provider, run:
```shell
terraform init
```

## Usage

Assume you have a blueprint for your microservices, and that a microservice has two properties: `slackChannel` and `repoUrl`. We can create a microservice entity by adding the following resources to our terraform file:
```hcl
resource "port_entity" "golang_monolith" {
  title = "Golang Monolith"
  blueprint = "microservice"
  properties {
    name = "slackChannel"
    value = "#data-query"
    type = "string"
  }
  properties {
    name = "repoUrl"
    value = "https://github.com"
    type = "string"
  }
}
```

:::note Prerequisites
Don't forget to set your port client id and secret in order for the provider to authenticate with the Port's API:
```shell
export PORT_CLIENT_ID=YOUR_CLIENT_ID
export PORT_CLIENT_SECRET=YOUR_CLIENT_SECRET
```
:::

to create the `Golang Monolith` entity, run:
```shell
terraform apply
```

That's it! the entity should now be created and visible in the UI.  
For more examples, see the examples and test cases in the [public repository](https://github.com/port-labs/terraform-provider-port).

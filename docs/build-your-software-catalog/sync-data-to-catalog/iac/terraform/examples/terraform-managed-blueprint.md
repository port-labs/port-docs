---
sidebar_position: 1
title: Terraform-Managed Blueprint
description: Comprehensive blueprint with properties, relations and mirror properties
---

# Terraform-Managed Blueprint Example

This example includes a complete blueprint resource definition in terraform, which includes:

- [Blueprint](../../../../define-your-data-model/setup-blueprint/setup-blueprint.md?definition=tf#configure-blueprints-in-port) definition examples;
- All [property](../../../../define-your-data-model/setup-blueprint/properties/properties.md) type definitions;
- [Relation](../../../../define-your-data-model/relate-blueprints/relate-blueprints.md?definition=tf#configure-relations-in-port) definition example;
- [Mirror property](../../../../define-your-data-model/setup-blueprint/properties/mirror-property/mirror-property.md) definition example;
- [Calculation property](../../../../define-your-data-model/setup-blueprint/properties/calculation-property/calculation-property.md) definition example.

Here is the example definition:

```hcl showLineNumbers
terraform {
  required_providers {
    port-labs = {
      source  = "port-labs/port-labs"
      version = "~> 1.0.0"
    }
  }
}

provider "port-labs" {
  client_id = "PORT_CLIENT_ID"     # or set the env var PORT_CLIENT_ID
  secret    = "PORT_CLIENT_SECRET" # or set the env var PORT_CLIENT_SECRET
}

resource "port-labs_blueprint" "myBlueprint" {
  depends_on = [
    port-labs_blueprint.other
  ]
  # ...blueprint properties
  identifier = "test-docs"
  icon       = "Microservice"
  title      = "Test Docs"

  properties {
    identifier = "myStringProp"
    title      = "My string"
    required   = false
    type       = "string"
  }

  properties {
    identifier = "myNumberProp"
    title      = "My number"
    required   = false
    type       = "number"
  }

  properties {
    identifier = "myBooleanProp"
    title      = "My boolean"
    required   = false
    type       = "boolean"
  }

  properties {
    identifier = "myObjectProp"
    title      = "My object"
    required   = false
    type       = "object"
  }

  properties {
    identifier = "myArrayProp"
    title      = "My array"
    required   = false
    type       = "array"
  }

  properties {
    identifier = "myUrlProp"
    title      = "My url"
    required   = false
    type       = "string"
    format     = "url"
  }

  properties {
    identifier = "myEmailProp"
    title      = "My email"
    required   = false
    type       = "string"
    format     = "email"
  }

  properties {
    identifier = "myUserProp"
    title      = "My user"
    required   = false
    type       = "string"
    format     = "user"
  }

  properties {
    identifier = "myTeamProp"
    title      = "My team"
    required   = false
    type       = "string"
    format     = "team"
  }

  properties {
    identifier = "myDatetimeProp"
    title      = "My datetime"
    required   = false
    type       = "string"
    format     = "date-time"
  }

  properties {
    identifier = "myTimerProp"
    title      = "My timer"
    required   = false
    type       = "string"
    format     = "timer"
  }

  properties {
    identifier = "myYAMLProp"
    title      = "My yaml"
    required   = false
    type       = "string"
    format     = "yaml"
  }

  mirror_properties {
    identifier = "myMirrorProp"
    title      = "My mirror property"
    path       = "myRelation.myStringProp"
  }

  # Mirror property of a meta-property
  mirror_properties {
    identifier = "myMirrorPropWithMeta"
    title      = "My mirror property of meta property"
    path       = "myRelation.$identifier"
  }

  calculation_properties {
    identifier  = "myCalculation"
    title       = "My calculation property"
    calculation = ".properties.myStringProp + .properties.myStringProp"
    type        = "string"
  }

  # Calculation property making use of meta-properties
  calculation_properties {
    identifier  = "myCalculationWithMeta"
    title       = "My calculation property with meta properties"
    calculation = ".identifier + \"-\" + .title + \"-\" + .properties.myStringProp"
    type        = "string"
  }

  relations {
    target     = port-labs_blueprint.other.identifier
    title      = "myRelation"
    identifier = "myRelation"
    many       = false
    required   = false
  }
}

resource "port-labs_blueprint" "other" {
  # ...blueprint properties
  identifier = "test-docs-relation"
  icon       = "Microservice"
  title      = "Test Docs Relation"

  properties {
    identifier = "myStringProp"
    title      = "My string"
    required   = false
    type       = "string"
  }
}
```

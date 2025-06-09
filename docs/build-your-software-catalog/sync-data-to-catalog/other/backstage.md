import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_helm_prerequisites_block.mdx"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"
import ScheduledCiInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_scheduled_ci_installation.mdx"

# Backstage

Port's Backstage integration allows you to model Backstage resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Map and organize your desired Backstage resources and their metadata in Port (see supported resources below).
- Watch for Backstage object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.

### Supported Resources

The resources that can be ingested from Backstage into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`Entities API`](https://backstage.io/docs/features/software-catalog/software-catalog-api/#get-entitiesby-query)
- [`Component`](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-component)
- [`Template`](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-template)
- [`API`](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-api)
- [`Group`](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-group)
- [`User`](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-user)
- [`Resource`](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-resource)
- [`System`](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-system)
- [`Domain`](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-domain)


## Prerequisites

### Create a Backstage token

Port will authenticate to Backstage via [static tokens](https://backstage.io/docs/auth/service-to-service-auth/#static-tokens).  
Configure a token for Port using the following Backstage configuration:

```yaml showLineNumbers
backend:
  auth:
    externalAccess:
      - type: static
        options:
          token: YOUR-TOKEN
          subject: port-ocean-access
```

Replace `YOUR-TOKEN` with your Backstage token.  
To create a token, Backstage recommends to use the following command:
```bash
node -p 'require("crypto").randomBytes(24).toString("base64")'
```

## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation method means that the integration will be able to update Port in real time using webhooks.

<h2>Prerequisites</h2>
 
<Prerequisites/>

<OceanRealtimeInstallation integration="Backstage" />

For details about the available parameters for the installation, see the table below.

This table summarizes the parameters used for the installation.  
Note the parameters specific to this integration, they are last in the table. 

| Parameter                                | Description                                                                                                                         | Required |
|------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                          | Your Port client id, used to identify your account                                                                                  | ✅        |
| `port.clientSecret`                      | Your Port client secret, used to identify your account                                                                              | ✅        |
| `port.baseUrl`                           | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                             | ✅        |
| `initializePortResources`                | Default: `true`. When `true`, the integration will create default blueprints and configuration mapping                              | ❌        |
| `sendRawDataExamples`                    | Default: `true`. Enable sending raw data examples from the third party API to Port for testing and managing the integration mapping | ❌        |
| `integration.identifier`                 | The integration's identifier, used to reference the integration when using Port's API                                               | ✅        |
| `integration.type`                       | The integration type, used to denote the integrated tool/platform                                                                   | ✅        |
| `integration.eventListener.type`         | The method used to listen to events from the 3rd party tool (`POLLING` or `KAFKA`)                                                  | ✅        |
| **`integration.secrets.backstageToken`** | The Backstage token used to authenticate Port to Backstage                                                                          | ✅        |
| **`integration.config.backstageUrl`**    | The URL of the Backstage instance, including the port of the Backend API (usually 7007)                                             | ✅        |

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

<ScheduledCiInstallation integration="Backstage" />

</TabItem>

</Tabs>


## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
- kind: component
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .metadata.identifier
        title: .metadata.title // .metadata.name
        blueprint: '"component"'
        properties:
          type: .spec.type
          lifecycle: .spec.lifecycle
          language: .spec.language
          description: .metadata.description
          labels: .metadata.labels
          annotations: .metadata.annotations
          links: .metadata.links
          tags: .metadata.tags
        relations:
          owningUser: .relations[] | select(.type == "ownedBy" and (.targetRef | startswith("user:"))) | .targetRef
          owningGroup: .relations[] | select(.type == "ownedBy" and (.targetRef | startswith("group:"))) | .targetRef
          system: '"system:" + (.metadata.namespace // "default") + "/" + .spec.system'
          subcomponentOf: .relations[] | select(.type == "subcomponentOf" and (.targetRef | startswith("component:"))) | .targetRef
          providesApis: .relations[] | select(.type == "providesApi" and (.targetRef | startswith("api:"))) | .targetRef
          consumesApis: .relations[] | select(.type == "consumesApi" and (.targetRef | startswith("api:"))) | .targetRef
          dependsOnComponent: .relations[] | select(.type == "dependsOn" and (.targetRef | startswith("component:"))) | .targetRef
          dependsOnResource: .relations[] | select(.type == "dependsOn" and (.targetRef | startswith("resource:"))) | .targetRef
- kind: API
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .metadata.identifier
        title: .metadata.title // .metadata.name
        blueprint: '"api"'
        properties:
          type: .spec.type
          lifecycle: .spec.lifecycle
          definition: .spec.definition | tostring
          definitionOpenAPI: if .spec.type == "open-api" then .spec.definition else null end
          definitionAsyncAPI: if .spec.type == "async-api" then .spec.definition else null end
          definitionGRPC: if .spec.type == "grpc" then .spec.definition else null end
          definitionGraphQL: if .spec.type == "graphql" then .spec.definition else null end
          description: .metadata.description
          labels: .metadata.labels
          annotations: .metadata.annotations
          links: .metadata.links
          tags: .metadata.tags
        relations:
          owningUser: .relations[] | select(.type == "ownedBy" and (.targetRef | startswith("user:"))) | .targetRef
          owningGroup: .relations[] | select(.type == "ownedBy" and (.targetRef | startswith("group:"))) | .targetRef
          system: '"system:" + (.metadata.namespace // "default") + "/" + .spec.system'
- kind: group
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .metadata.identifier
        title: .metadata.title // .metadata.name
        blueprint: '"group"'
        properties:
          description: .metadata.description
          type: .metadata.type
          email: .metadata.email
          labels: .metadata.labels
          annotations: .metadata.annotations
          links: .metadata.links
          tags: .metadata.tags
        relations:
          parent: .relations[] | select(.type == "childOf" and (.targetRef | startswith("group:"))) | .targetRef
          members: .relations[] | select(.type == "hasMember" and (.targetRef | startswith("user:"))) | .targetRef
- kind: user
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .metadata.identifier
        title: .metadata.title // .metadata.name
        blueprint: '"user"'
        properties:
          email: .metadata.email
          description: .metadata.description
          labels: .metadata.labels
          annotations: .metadata.annotations
          links: .metadata.links
          tags: .metadata.tags
- kind: resource
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .metadata.identifier
        title: .metadata.title // .metadata.name
        blueprint: '"resource"'
        properties:
          type: .spec.type
          description: .metadata.description
          labels: .metadata.labels
          annotations: .metadata.annotations
          links: .metadata.links
          tags: .metadata.tags
        relations:
          owningUser: .relations[] | select(.type == "ownedBy" and (.targetRef | startswith("user:"))) | .targetRef
          owningGroup: .relations[] | select(.type == "ownedBy" and (.targetRef | startswith("group:"))) | .targetRef
          system: '"system:" + (.metadata.namespace // "default") + "/" + .spec.system'
          dependsOnResource: .relations[] | select(.type == "dependsOn" and (.targetRef | startswith("resource:"))) | .targetRef
          dependsOnComponent: .relations[] | select(.type == "dependsOn" and (.targetRef | startswith("component:"))) | .targetRef
- kind: system
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .metadata.identifier
        title: .metadata.title // .metadata.name
        blueprint: '"system"'
        properties:
          description: .metadata.description
          labels: .metadata.labels
          annotations: .metadata.annotations
          links: .metadata.links
          tags: .metadata.tags
        relations:
          owningUser: .relations[] | select(.type == "ownedBy" and (.targetRef | startswith("user:"))) | .targetRef
          owningGroup: .relations[] | select(.type == "ownedBy" and (.targetRef | startswith("group:"))) | .targetRef
          domain: .relations[] | select(.type == "partOf" and (.targetRef | startswith("domain:"))) | .targetRef
- kind: domain
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .metadata.identifier
        title: .metadata.title // .metadata.name
        blueprint: '"domain"'
        properties:
          description: .metadata.description
          labels: .metadata.labels
          annotations: .metadata.annotations
          links: .metadata.links
          tags: .metadata.tags
        relations:
          owningUser: .relations[] | select(.type == "ownedBy" and (.targetRef | startswith("user:"))) | .targetRef
          owningGroup: .relations[] | select(.type == "ownedBy" and (.targetRef | startswith("group:"))) | .targetRef
```

</details>



## Limitations

Currently, the integration does not support [custom entity](https://backstage.io/docs/features/software-catalog/extending-the-model/#implementing-custom-model-extensions) kinds. 

## Examples

To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

Additional examples of blueprints and the relevant integration configurations:

### Component

<details>
<summary><b>Component blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "component",
  "title": "Component",
  "icon": "Cloud",
  "schema": {
    "properties": {
      "type": {
        "title": "Type",
        "type": "string"
      },
      "lifecycle": {
        "title": "Lifecycle",
        "type": "string"
      },
      "language": {
        "type": "string",
        "title": "Language"
      },
      "description": {
        "type": "string",
        "format": "markdown",
        "title": "Description"
      },
      "labels": {
        "type": "object",
        "title": "Labels"
      },
      "annotations": {
        "type": "object",
        "title": "Annotations"
      },
      "links": {
        "type": "array",
        "items": {
          "format": "url",
          "type": "string"
        },
        "title": "Links"
      },
      "tags": {
        "type": "array",
        "title": "Tags"
      }
    },
    "required": []
  },
  "calculationProperties": {}
}
```

</details>

<details>
<summary><b>Mapping configuration (click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: component
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .metadata.identifier
          title: .metadata.title // .metadata.name
          blueprint: '"component"'
          properties:
            type: .spec.type
            lifecycle: .spec.lifecycle
            language: .spec.language
            description: .metadata.description
            labels: .metadata.labels
            annotations: .metadata.annotations
            links: .metadata.links
            tags: .metadata.tags
```

</details>

### Group

<details>
<summary><b>Group blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "group",
  "title": "Group",
  "icon": "TwoUsers",
  "schema": {
    "properties": {
      "type": {
        "title": "Type",
        "type": "string"
      },
      "email": {
        "title": "Email",
        "type": "string",
        "format": "email"
      },
      "description": {
        "type": "string",
        "format": "markdown",
        "title": "Description"
      },
      "labels": {
        "type": "object",
        "title": "Labels"
      },
      "annotations": {
        "type": "object",
        "title": "Annotations"
      },
      "links": {
        "type": "array",
        "items": {
          "format": "url",
          "type": "string"
        },
        "title": "Links"
      },
      "tags": {
        "type": "array",
        "title": "Tags"
      }
    },
    "required": []
  },
  "calculationProperties": {}
}
```

</details>

<details>
<summary><b>Mapping configuration (click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: group
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .metadata.identifier
          title: .metadata.title // .metadata.name
          blueprint: '"group"'
          properties:
            description: .metadata.description
            type: .metadata.type
            email: .metadata.email
            labels: .metadata.labels
            annotations: .metadata.annotations
            links: .metadata.links
            tags: .metadata.tags
```

</details>


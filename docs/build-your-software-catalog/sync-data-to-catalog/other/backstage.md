import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_helm_prerequisites_block.mdx"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"

# Backstage

Port's Backstage integration allows you to model Backstage resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Map and organize your desired Backstage resources and their metadata in Port (see supported resources below).
- Periodically ingest Backstage resources into Port.

### Supported Resources

The resources that can be ingested from Backstage into Port are listed below.  
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [Entities API](https://backstage.io/docs/features/software-catalog/software-catalog-api/#get-entitiesby-query)
- [Component](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-component)
- [Template](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-template)
- [API](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-api)
- [Group](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-group)
- [User](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-user)
- [Resource](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-resource)
- [System](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-system)
- [Domain](https://backstage.io/docs/features/software-catalog/descriptor-format#kind-domain)


## Setup

Port will authenticate to Backstage via [static tokens](https://backstage.io/docs/auth/service-to-service-auth/#static-tokens).
Configure one token for Port using the following Backstage configuration:

```yaml showLineNumbers
backend:
  auth:
    externalAccess:
      - type: static
        options:
          token: XXXXXXXXXXXXXXXXXXXX
          subject: port-ocean-access
```

Replace XXXX with a token you can randomly generate, Backstage recommands:
```bash
node -p 'require("crypto").randomBytes(24).toString("base64")'
```


Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

<h2> Prerequisites </h2>
 
<Prerequisites/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

</TabItem>

</Tabs>


## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

## Capabilities

<!-- Add any unique capability here using a ### header. For example:
### Ingest files from your repositories
-->

## Limitations

The integration do not support custom entity kinds yet. feel free to ask in the community bla bla

## Examples

<!-- Make sure to add examples of supported blueprints and mappings -->
<!--If there are 5 or more examples, create a new page for the examples and link to it here. -->

To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

Additional examples of blueprints and the relevant integration configurations:

<!-- Here is an example of blueprint and integration configuration (Replace with the integration resources) -->
### Team

<details>
<summary><b>Team blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "linearTeam",
  "title": "Linear Team",
  "icon": "Linear",
  "description": "A Linear team",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description",
        "description": "Team description"
      },
      "workspaceName": {
        "type": "string",
        "title": "Workspace Name",
        "description": "The name of the workspace this team belongs to"
      },
      "url": {
        "title": "Team URL",
        "type": "string",
        "format": "url",
        "description": "URL to the team in Linear"
      }
    }
  },
  "calculationProperties": {}
}
```

</details>

<details>
<summary><b>Integration configuration (click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: team
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .key
          title: .name
          blueprint: '"linearTeam"'
          properties:
            description: .description
            workspaceName: .organization.name
            url: "\"https://linear.app/\" + .organization.urlKey + \"/team/\" + .key"
```

</details>

## Relevant Guides

<!-- This section should contain one or more links (using bullets) to the guides section, filtered by technology/use-case. -->
<!-- Make sure to replace the ?tags=<X> with your integration identifier -->
- For relevant guides and examples, see the [guides section](https://docs.getport.io/guides?tags=<X>).
- For guides on USE_CASE, see the [guides section](https://docs.getport.io/guides?tags=<USE_CASE>).

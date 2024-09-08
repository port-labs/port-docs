import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_helm_prerequisites_block.mdx"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import IngestDataIntoPort from "/docs/generalTemplates/_ingest_data_into_port.md"

# Integration Name

Port's X integration allows you to ingest X resources into Port.

## Capabilities

- If real time is supported - Watch for X object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- If real time is not supported - Periodically ingest X resources into Port.
- If there are any special capabilities of the integration such as gitops, multi-account support, etc. - Describe them here.

### Supported Resources

- List the resources that can be ingested using this integration.
- If there are any limitations, describe them here.
- If we support generic resources and its based on the third party api capabilities link to the docs and how to find it. e.g. like in aws. 

## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (Self-hosted)">

<h2> Prerequisites </h2>
 
<Prerequisites/>

</TabItem>

<TabItem value="one-time-ci" label="One-time (CI)">

</TabItem>

</Tabs>


## Configuration

In Port, integrations use a [yaml mapping](/docs/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third party api to Port.

<IngestDataIntoPort/>

## Examples

Examples of blueprints and the relevant integration configurations:

### Team

<details>
<summary>Team blueprint</summary>

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
<summary>Integration configuration</summary>

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

## Common Use Cases

- Describe common use cases for the integration. e.g. "Joined view of urgent task by domain and team"


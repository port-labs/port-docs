import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Sentry

Our Sentry integration allows you to import `projects` and `issues` from your Sentry cloud account int o Port, according to your mapping and definition.

A `Project` is a collection of scope events to a distinct application in your organization and assign responsibility to specific users and teams.

An `Issue` is a group of incidents that describe the underlying problem of your symptoms.

## Common use cases

- Map your monitored projects and issues into Port.

## Installation

Install the integration via Helm by running this command:

```bash showLineNumbers
# The following script will install an Ocean integration at your K8s cluster using helm
# initializePortResources: When set to true the integration will create default blueprints + JQ Mappings
# integration.identifier: Change the identifier to describe your integration
# integration.config.sentryHost: Sentry host URL
# integration.secrets.sentryToken: Sentry token
# integration.config.sentryOrganization: Sentry organization
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install sentry port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \
	--set port.clientSecret="PORT_CLIENT_SECRET"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
	--set integration.identifier="sentry"  \
	--set integration.type="sentry"  \
	--set integration.eventListener.type="KAFKA"  \
	--set integration.config.sentryHost="https://example.com"  \
	--set integration.secrets.sentryToken="string"  \
	--set integration.config.sentryOrganization="string"
```

### Event listener

The integration uses polling to pull the configuration from Port every minute and check it for changes. If there is a change, a resync will occur.

## Ingesting Sentry objects

The Sentry integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `Issue` data from Newrelic:

```yaml showLineNumbers
resources:
  - kind: issue
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: ".id"
          title: ".title"
          blueprint: '"issue"'
          properties:
            link: ".permalink"
            status: ".status"
            isUnhandled: ".isUnhandled"
          relations:
            project: ".project.slug"
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Sentry's API events.

### Configuration structure

The integration configuration determines which resources will be queried from Sentry, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Sentry, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Project`](https://docs.sentry.io/api/projects/list-your-projects/)
- [`Issue`](https://docs.sentry.io/api/events/list-a-projects-issues/)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: project
      selector:
      ...
  ```

- The `kind` key is a specifier for a Sentry object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: project
        selector:
        ...
  ```

- The `port`, `entity` and the `mappings` keys are used to map the Newrelic object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: project
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings:
            identifier: .slug
            title: .name
            blueprint: '"project"'
            properties:
              dateCreated: .dateCreated
              platform: .platform
              status: .status
              link: .organization.links.organizationUrl + "/projects/" + .name
          # highlight-end
  ```

  :::tip Blueprint key
  Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

### Ingest data into Port

To ingest Sentry objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Sentry.
3. Choose the **Ingest Data** option from the menu.
4. Select Sentry under the APM & alerting category.
5. Add the contents of your [integration configuration](#configuration-structure) to the editor.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Project

<details>
<summary>Project blueprint</summary>

```json showLineNumbers
{
  "identifier": "project",
  "title": "project",
  "icon": "Sentry",
  "schema": {
    "properties": {
      "dateCreated": {
        "title": "dateCreated",
        "type": "string",
        "format": "date-time"
      },
      "platform": {
        "type": "string",
        "title": "platform"
      },
      "status": {
        "title": "status",
        "type": "string",
        "enum": [
          "active",
          "disabled",
          "pending_deletion",
          "deletion_in_progress"
        ]
      },
      "link": {
        "title": "link",
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

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
resources:
  - kind: project
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .slug
          title: .name
          blueprint: '"project"'
          properties:
            dateCreated: .dateCreated
            platform: .platform
            status: .status
            link: .organization.links.organizationUrl + "/projects/" + .name
```

</details>

### Issue

<details>
<summary>Issue blueprint</summary>

```json showLineNumbers
{
  "identifier": "issue",
  "title": "issue",
  "icon": "Sentry",
  "schema": {
    "properties": {
      "link": {
        "title": "link",
        "type": "string",
        "format": "url"
      },
      "status": {
        "title": "status",
        "type": "string"
      },
      "isUnhandled": {
        "icon": "DefaultProperty",
        "title": "isUnhandled",
        "type": "boolean"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "project": {
      "title": "project",
      "target": "project",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
- kind: issue
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: ".id"
          title: ".title"
          blueprint: '"issue"'
          properties:
            link: ".permalink"
            status: ".status"
            isUnhandled: ".isUnhandled"
          relations:
            project: ".project.slug"
```

</details>

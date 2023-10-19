import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Snyk

Our Snyk integration allows you to import `targets`, `projects` and `issues` from your Snyk account into Port, according to your mapping and definitions.

## Common use cases

- Map `targets`, `projects` and `issues` in your Snyk organization environment.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Create/delete Snyk objects using self-service actions.

## installation

Install the integration via Helm by running this command:

```bash showLineNumbers
# The following script will install an Ocean integration at your K8s cluster using helm
# initializePortResources: When set to true the integration will create default blueprints + JQ Mappings
# scheduledResyncInterval: the number of minutes between each resync
# integration.identifier: Change the identifier to describe your integration

helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-snyk-integration port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \
	--set port.clientSecret="PORT_CLIENT_SECRET"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
  --set scheduledResyncInterval=120 \
	--set integration.identifier="my-snyk-integration"  \
	--set integration.type="snyk"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.secrets.token="SNYK_TOKEN"  \
	--set integration.config.organizationId="ORG_ID"
```

## Ingesting Snyk objects

The Snyk integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `project` data from Snyk:

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: project
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id
          title: .attributes.name
          blueprint: '"snykProject"'
          properties:
            url: ("https://app.snyk.io/org/" + .relationships.organization.data.id + "/project/" + .id | tostring)
            owner: .__owner.email
            businessCriticality: .attributes.business_criticality
            environment: .attributes.environment
            lifeCycle: .attributes.lifecycle
            highOpenVulnerabilities: .meta.latest_issue_counts.high
            mediumOpenVulnerabilities: .meta.latest_issue_counts.medium
            lowOpenVulnerabilities: .meta.latest_issue_counts.low
            criticalOpenVulnerabilities: .meta.latest_issue_counts.critical
            importedBy: .__importer.email
            tags: .attributes.tags
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Snyk's API events.

### Configuration structure

The integration configuration determines which resources will be queried from Snyk, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Snyk, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Target`](https://apidocs.snyk.io/?version=2023-08-21%7Ebeta#get-/orgs/-org_id-/targets)
- [`Project`](https://apidocs.snyk.io/?version=2023-08-21#get-/orgs/-org_id-/projects)
- [`Issue`](https://snyk.docs.apiary.io/#reference/projects/aggregated-project-issues/list-all-aggregated-issues)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: project
      selector:
      ...
  ```

- The `kind` key is a specifier for a Snyk object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: project
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: project
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-end
      port:
  ```

- The `port`, `entity` and the `mappings` keys are used to map the Snyk object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: project
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one Snyk object to a Port entity. Each value is a JQ query.
            identifier: .id
            title: .attributes.name
            blueprint: '"snykProject"'
            properties:
              url: ("https://app.snyk.io/org/" + .relationships.organization.data.id + "/project/" + .id | tostring)
              owner: .__owner.email
              businessCriticality: .attributes.business_criticality
              environment: .attributes.environment
              lifeCycle: .attributes.lifecycle
              highOpenVulnerabilities: .meta.latest_issue_counts.high
              mediumOpenVulnerabilities: .meta.latest_issue_counts.medium
              lowOpenVulnerabilities: .meta.latest_issue_counts.low
              criticalOpenVulnerabilities: .meta.latest_issue_counts.critical
              importedBy: .__importer.email
              tags: .attributes.tags
        # highlight-end
    - kind: project # In this instance project is mapped again with a different filter
      selector:
        query: '.name == "MyProjectName"'
      port:
        entity:
          mappings: ...
  ```

  :::tip Blueprint key
  Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

### Ingest data into Port

To ingest Snyk objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Snyk.
3. Choose the **Ingest Data** option from the menu.
4. Select Snyk under the Code quality & security providers category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Target

<details>
<summary>Target blueprint</summary>

```json showLineNumbers
{
  "identifier": "snykTarget",
  "title": "Snyk Target",
  "icon": "Snyk",
  "schema": {
    "properties": {
      "criticalOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open Critical Vulnerabilities"
      },
      "highOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open High Vulnerabilities"
      },
      "mediumOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open Medium Vulnerabilities"
      },
      "lowOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open Low Vulnerabilities"
      },
      "origin": {
        "title": "Target Origin",
        "type": "string",
        "enum": [
          "artifactory-cr",
          "aws-config",
          "aws-lambda",
          "azure-functions",
          "azure-repos",
          "bitbucket-cloud",
          "bitbucket-server",
          "cli",
          "cloud-foundry",
          "digitalocean-cr",
          "docker-hub",
          "ecr",
          "gcr",
          "github",
          "github-cr",
          "github-enterprise",
          "gitlab",
          "gitlab-cr",
          "google-artifact-cr",
          "harbor-cr",
          "heroku",
          "ibm-cloud",
          "kubernetes",
          "nexus-cr",
          "pivotal",
          "quay-cr",
          "terraform-cloud"
        ]
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
- kind: target
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .attributes.displayName
        title: .attributes.displayName
        blueprint: '"snykTarget"'
        properties:
          origin: .attributes.origin
          highOpenVulnerabilities: "[.__projects[].meta.latest_issue_counts.high] | add"
          mediumOpenVulnerabilities: "[.__projects[].meta.latest_issue_counts.medium] | add"
          lowOpenVulnerabilities: "[.__projects[].meta.latest_issue_counts.low] | add"
          criticalOpenVulnerabilities: "[.__projects[].meta.latest_issue_counts.critical] | add"
```

</details>

### Project

<details>
<summary>Project blueprint</summary>

```json showLineNumbers
{
  "identifier": "snykProject",
  "description": "This blueprint represents a snyk project in our software catalog",
  "title": "Snyk Project",
  "icon": "Snyk",
  "schema": {
    "properties": {
      "url": {
        "type": "string",
        "title": "URL",
        "format": "url",
        "icon": "Snyk"
      },
      "owner": {
        "type": "string",
        "title": "Owner",
        "format": "user",
        "icon": "TwoUsers"
      },
      "businessCriticality": {
        "title": "Business Criticality",
        "type": "array",
        "items": {
          "type": "string",
          "enum": ["critical", "high", "medium", "low"]
        },
        "icon": "DefaultProperty"
      },
      "environment": {
        "items": {
          "type": "string",
          "enum": [
            "frontend",
            "backend",
            "internal",
            "external",
            "mobile",
            "saas",
            "onprem",
            "hosted",
            "distributed"
          ]
        },
        "icon": "Environment",
        "title": "Environment",
        "type": "array"
      },
      "lifeCycle": {
        "title": "Life Cycle",
        "type": "array",
        "items": {
          "type": "string",
          "enum": ["development", "sandbox", "production"]
        },
        "icon": "DefaultProperty"
      },
      "highOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open High Vulnerabilities"
      },
      "mediumOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open Medium Vulnerabilities"
      },
      "lowOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open Low Vulnerabilities"
      },
      "criticalOpenVulnerabilities": {
        "icon": "Vulnerability",
        "type": "number",
        "title": "Open Low Vulnerabilities"
      },
      "importedBy": {
        "icon": "TwoUsers",
        "type": "string",
        "title": "Imported By",
        "format": "user"
      },
      "tags": {
        "type": "array",
        "title": "Tags",
        "icon": "DefaultProperty"
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
          identifier: .id
          title: .attributes.name
          blueprint: '"snykProject"'
          properties:
            url: ("https://app.snyk.io/org/" + .relationships.organization.data.id + "/project/" + .id | tostring)
            owner: .__owner.email
            businessCriticality: .attributes.business_criticality
            environment: .attributes.environment
            lifeCycle: .attributes.lifecycle
            highOpenVulnerabilities: .meta.latest_issue_counts.high
            mediumOpenVulnerabilities: .meta.latest_issue_counts.medium
            lowOpenVulnerabilities: .meta.latest_issue_counts.low
            criticalOpenVulnerabilities: .meta.latest_issue_counts.critical
            importedBy: .__importer.email
            tags: .attributes.tags
```

</details>

## Issue

<details>
<summary>Issue blueprint</summary>

```yaml showLineNumbers
{
  "identifier": "snykVulnerability",
  "description": "This blueprint represents a Snyk vulnerability in our software catalog",
  "title": "Snyk Vulnerability",
  "icon": "Snyk",
  "schema":
    {
      "properties":
        {
          "score": { "icon": "Star", "type": "number", "title": "Score" },
          "packageName":
            {
              "type": "string",
              "title": "Package Name",
              "icon": "DefaultProperty",
            },
          "packageVersions":
            { "icon": "Package", "title": "Package Versions", "type": "array" },
          "type":
            {
              "type": "string",
              "title": "Type",
              "enum": ["vuln", "license", "configuration"],
              "icon": "DefaultProperty",
            },
          "severity":
            {
              "icon": "Alert",
              "title": "Issue Severity",
              "type": "string",
              "enum": ["low", "medium", "high", "critical"],
              "enumColors":
                {
                  "low": "green",
                  "medium": "yellow",
                  "high": "red",
                  "critical": "red",
                },
            },
          "url":
            {
              "icon": "Link",
              "type": "string",
              "title": "Issue URL",
              "format": "url",
            },
          "language":
            {
              "type": "string",
              "title": "Language",
              "icon": "DefaultProperty",
            },
          "publicationTime":
            {
              "type": "string",
              "format": "date-time",
              "title": "Publication Time",
              "icon": "DefaultProperty",
            },
          "isPatched":
            {
              "type": "boolean",
              "title": "Is Patched",
              "icon": "DefaultProperty",
            },
        },
      "required": [],
    },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations":
    {
      "snykProject":
        {
          "title": "Project",
          "target": "snykProject",
          "required": false,
          "many": false,
        },
    },
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
resources:
  - kind: vulnerability
    selector:
      query: '.issueType == "vuln"'
    port:
      entity:
        mappings:
          identifier: .issueData.id
          title: .issueData.title
          blueprint: '"snykVulnerability"'
          properties:
            score: .priorityScore
            packageName: .pkgName
            packageVersions: .pkgVersions
            type: .issueType
            severity: .issueData.severity
            url: .issueData.url
            language: .issueData.language // .issueType
            publicationTime: .issueData.publicationTime
            isPatched: .isPatched
          relations:
            snykProject: .__project.id
```

</details>

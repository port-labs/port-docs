import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# SonarQube

Our SonarQube integration allows you to import `projects`, `issues` and `analyses` from your SonarQube account into Port, according to your mapping and definitions.

## Common use cases

- Map `projects`, `issues` and `analyses` in your SonarQube organization environment.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Create/delete SonarQube objects using self-service actions.

## installation

Install the integration via Helm by running this command:

```bash showLineNumbers
# The following script will install an Ocean integration at your K8s cluster using helm
# initializePortResources: When set to true the integration will create default blueprints + JQ Mappings
# scheduledResyncInterval: the number of minutes between each resync
# integration.identifier: Change the identifier to describe your integration
# integration.secrets.sonarApiToken: The SonarQube API token
# integration.config.sonarOrganizationId: The SonarQube organization ID

helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-sonarqube-integration port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \
	--set port.clientSecret="PORT_CLIENT_SECRET"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
  --set scheduledResyncInterval=120 \
	--set integration.identifier="my-sonarqube-integration"  \
	--set integration.type="sonarqube"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.secrets.sonarApiToken="string"  \
	--set integration.config.sonarOrganizationId="string"
```

## Ingesting SonarQube objects

The SonarQube integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `project` data from SonarQube:

```yaml showLineNumbers
resources:
  - kind: projects
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeProject"'
          identifier: .key
          title: .name
          properties:
            organization: .organization
            link: .link
            lastAnalysisStatus: .branch.status.qualityGateStatus
            lastAnalysisDate: .analysisDateAllBranches
            numberOfBugs: .measures[]? | select(.metric == "bugs") | .value
            numberOfCodeSmells: .measures[]? | select(.metric == "code_smells") | .value
            numberOfVulnerabilities: .measures[]? | select(.metric == "vulnerabilities") | .value
            numberOfHotSpots: .measures[]? | select(.metric == "security_hotspots") | .value
            numberOfDuplications: .measures[]? | select(.metric == "duplicated_files") | .value
            coverage: .measures[]? | select(.metric == "coverage") | .value
            mainBranch: .branch.name
            tags: .tags
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from SonarQube's API events.

### Configuration structure

The integration configuration determines which resources will be queried from SonarQube, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from SonarQube, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- `Project` - represents a SonarQube project. Retrieves data from [`components`](https://next.sonarqube.com/sonarqube/web_api/api/components), [`measures`](https://next.sonarqube.com/sonarqube/web_api/api/measures), and [`branches`](https://next.sonarqube.com/sonarqube/web_api/api/project_branches).
- [`Issue`](https://next.sonarqube.com/sonarqube/web_api/api/issues)
- `Analysis` - represents a SonarQube analysis and latest activity.

:::

:::note
The current version of the Sonarqube integration does not support the `analysis` kind for clients using on-premises Sonarqube installation.
:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: project
      selector:
      ...
  ```

- The `kind` key is a specifier for a SonarQube object:

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

- The `port`, `entity` and the `mappings` keys are used to map the SonarQube object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: project
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings:
            blueprint: '"sonarQubeProject"'
            identifier: .key
            title: .name
            properties:
              organization: .organization
              link: .link
              lastAnalysisStatus: .branch.status.qualityGateStatus
              lastAnalysisDate: .analysisDateAllBranches
              numberOfBugs: .measures[]? | select(.metric == "bugs") | .value
              numberOfCodeSmells: .measures[]? | select(.metric == "code_smells") | .value
              numberOfVulnerabilities: .measures[]? | select(.metric == "vulnerabilities") | .value
              numberOfHotSpots: .measures[]? | select(.metric == "security_hotspots") | .value
              numberOfDuplications: .measures[]? | select(.metric == "duplicated_files") | .value
              coverage: .measures[]? | select(.metric == "coverage") | .value
              mainBranch: .branch.name
              tags: .tags
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

To ingest SonarQube objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using SonarQube.
3. Choose the **Ingest Data** option from the menu.
4. Select SonarQube under the Code quality & security providers category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Project

<details>
<summary>Project blueprint</summary>

```json showLineNumbers
{
  "identifier": "sonarQubeProject",
  "title": "SonarQube Project",
  "icon": "sonarqube",
  "schema": {
    "properties": {
      "organization": {
        "type": "string",
        "title": "Organization",
        "icon": "TwoUsers"
      },
      "link": {
        "type": "string",
        "format": "url",
        "title": "Link",
        "icon": "Link"
      },
      "lastAnalysisStatus": {
        "type": "string",
        "title": "Last Analysis Status",
        "enum": ["PASSED", "OK", "FAILED", "ERROR"],
        "enumColors": {
          "PASSED": "green",
          "OK": "green",
          "FAILED": "red",
          "ERROR": "red"
        }
      },
      "lastAnalysisDate": {
        "type": "string",
        "format": "date-time",
        "icon": "Clock",
        "title": "Last Analysis Date"
      },
      "numberOfBugs": {
        "type": "number",
        "title": "Number Of Bugs"
      },
      "numberOfCodeSmells": {
        "type": "number",
        "title": "Number Of CodeSmells"
      },
      "numberOfVulnerabilities": {
        "type": "number",
        "title": "Number Of Vulnerabilities"
      },
      "numberOfHotSpots": {
        "type": "number",
        "title": "Number Of HotSpots"
      },
      "numberOfDuplications": {
        "type": "number",
        "title": "Number Of Duplications"
      },
      "coverage": {
        "type": "number",
        "title": "Coverage"
      },
      "mainBranch": {
        "type": "string",
        "icon": "Git",
        "title": "Main Branch"
      },
      "tags": {
        "type": "array",
        "title": "Tags"
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
  - kind: projects
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeProject"'
          identifier: .key
          title: .name
          properties:
            organization: .organization
            link: .link
            lastAnalysisStatus: .branch.status.qualityGateStatus
            lastAnalysisDate: .analysisDateAllBranches
            numberOfBugs: .measures[]? | select(.metric == "bugs") | .value
            numberOfCodeSmells: .measures[]? | select(.metric == "code_smells") | .value
            numberOfVulnerabilities: .measures[]? | select(.metric == "vulnerabilities") | .value
            numberOfHotSpots: .measures[]? | select(.metric == "security_hotspots") | .value
            numberOfDuplications: .measures[]? | select(.metric == "duplicated_files") | .value
            coverage: .measures[]? | select(.metric == "coverage") | .value
            mainBranch: .branch.name
            tags: .tags
```

</details>

### Issue

<details>
<summary>Issue blueprint</summary>

```json showLineNumbers
{
{
  "identifier": "sonarQubeIssue",
  "title": "SonarQube Issue",
  "icon": "sonarqube",
  "schema": {
    "properties": {
      "type": {
        "type": "string",
        "title": "Type",
        "enum": [
          "CODE_SMELL",
          "BUG",
          "VULNERABILITY"
        ]
      },
      "severity": {
        "type": "string",
        "title": "Severity",
        "enum": [
          "MAJOR",
          "INFO",
          "MINOR",
          "CRITICAL",
          "BLOCKER"
        ],
        "enumColors": {
          "MAJOR": "orange",
          "INFO": "green",
          "CRITICAL": "red",
          "BLOCKER": "red",
          "MINOR": "yellow"
        }
      },
      "link": {
        "type": "string",
        "format": "url",
        "icon": "Link",
        "title": "Link"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "enum": [
          "OPEN",
          "CLOSED",
          "RESOLVED",
          "REOPENED",
          "CONFIRMED"
        ]
      },
      "assignees": {
        "title": "Assignees",
        "type": "string",
        "icon": "TwoUsers"
      },
      "tags": {
        "type": "array",
        "title": "Tags"
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At"
      }
    }
  },
  "relations": {
    "sonarQubeProject": {
      "target": "sonarQubeProject",
      "required": false,
      "title": "SonarQube Project",
      "many": false
    }
  }
}
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
resources:
  - kind: issues
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeIssue"'
          identifier: .key
          title: .message
          properties:
            type: .type
            severity: .severity
            link: .link
            status: .status
            assignees: .assignee
            tags: .tags
            createdAt: .creationDate
          relations:
            sonarQubeProject: .project
```

</details>

### Analysis

<details>
<summary>Analysis blueprint</summary>

```yaml showLineNumbers
{
  "identifier": "sonarQubeAnalysis",
  "title": "SonarQube Analysis",
  "icon": "sonarqube",
  "schema":
    {
      "properties":
        {
          "branch":
            { "type": "string", "title": "Branch", "icon": "GitVersion" },
          "fixedIssues": { "type": "number", "title": "Fixed Issues" },
          "newIssues": { "type": "number", "title": "New Issues" },
          "coverage": { "title": "Coverage", "type": "number" },
          "duplications": { "type": "number", "title": "Duplications" },
          "createdAt":
            { "type": "string", "format": "date-time", "title": "Created At" },
        },
    },
  "relations":
    {
      "sonarQubeProject":
        {
          "target": "sonarQubeProject",
          "required": false,
          "title": "SonarQube Project",
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
  - kind: analysis
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeAnalysis"'
          identifier: .analysisId
          title: .commit.message
          properties:
            branch: .branch_name
            fixedIssues: .measures.violations_fixed
            newIssues: .measures.violations_added
            coverage: .measures.coverage_change
            duplications: .measures.duplicated_lines_density_change
            createdAt: .analysis_date
          relations:
            sonarQubeProject: .project
```

</details>

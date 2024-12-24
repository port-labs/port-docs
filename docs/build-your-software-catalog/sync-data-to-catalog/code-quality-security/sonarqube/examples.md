---
sidebar_position: 2
---

# Examples
To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

## Project

<details>
<summary><b>Projects blueprint (Click to expand)</b></summary>

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
      "lastAnalysisDate": {
        "type": "string",
        "format": "date-time",
        "icon": "Clock",
        "title": "Last Analysis Date"
      },
      "qualityGateStatus": {
        "title": "Quality Gate Status",
        "type": "string",
        "enum": [
          "OK",
          "WARN",
          "ERROR"
        ],
        "enumColors": {
          "OK": "green",
          "WARN": "yellow",
          "ERROR": "red"
        }
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
      "mainBranchLastAnalysisDate": {
        "type": "string",
        "format": "date-time",
        "icon": "Clock",
        "title": "Main Branch Last Analysis Date"
      },
      "revision": {
        "type": "string",
        "title": "Revision"
      },
      "managed": {
        "type": "boolean",
        "title": "Managed"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {
    "criticalOpenIssues": {
      "title": "Number Of Open Critical Issues",
      "type": "number",
      "target": "sonarQubeIssue",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "status",
            "operator": "in",
            "value": ["OPEN", "REOPENED"]
          },
          {
            "property": "severity",
            "operator": "=",
            "value": "CRITICAL"
          }
        ]
      },
      "calculationSpec": {
        "calculationBy": "entities",
        "func": "count"
      }
    },
    "numberOfOpenIssues": {
      "title": "Number Of Open Issues",
      "type": "number",
      "target": "sonarQubeIssue",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "status",
            "operator": "in",
            "value": [
              "OPEN",
              "REOPENED"
            ]
          }
        ]
      },
      "calculationSpec": {
        "calculationBy": "entities",
        "func": "count"
      }
    }
  },
  "relations": {}
}
```

</details>

<details>
<summary><b>Integration configuration (Click to expand)</b></summary>

:::tip filter projects
The integration provides an option to filter the data that is retrieved from the SonarQube API depending on the integration version based on the following attributes:

<h3>SonarQube integration version `<=0.1.121`</h3>

1. `query`: Limits the search to component names that contain the supplied string
2. `alertStatus`: To filter a project's quality gate status. Accepts a list of values such as `OK`, `ERROR` and `WARN`
3. `languages`: To filter projects using a list of languages or a single language
4. `tags`: To filter a list of tags or a single tag
5. `qualifier`: To filter on a component qualifier. Accepts values such as `TRK` (for projects only) and `APP` (for applications only)

These attributes can be enabled using the path: `selector.apiFilters.filter`. By default, the integration fetches only SonarQube projects using the `qualifier` attribute.

<h3>SonarQube integration version `>=0.1.122`</h3>
1. `analyzed_before`: To retrieve projects analyzed before the given date. Accepts date format like so `2017-10-19` or `2017-10-19T13:00:00+0200`

2. `on_provisioned_only`: To retrieve projects on provisioned only. Accepts boolean `true` or `false`.

3. `projects`: List of projects to retrieve only. Specify the projects as an array of keys.

4. `qualifier`: To filter based on the project's qualifier. Possible values are `TRK`, `VW` and `APP`. Defaults to `TRK`. Specify this as an array of values.

These attributes can be enabled using the `selector` path.
:::

:::tip Define your own metrics
Besides filtering the API data, the integration provides a mechanism to allow users to define their own list of metrics used in SonarQube to evaluate the code. This list can be defined in the `selector.metrics` property. A complete list of valid SonarQube metrics can be in the [SonarQube documentation](https://docs.sonarsource.com/sonarqube/latest/user-guide/code-metrics/metrics-definition/)
:::

:::note Supported Sonar environment
Please note that the API filters are supported on on-premise Sonar environments (SonarQube) only, and will not work on SonarCloud.
:::

<h3>Project mapping for integration version `<=0.1.121`</h3>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: projects
    selector:
      query: "true"
      apiFilters:
        filter:
          qualifier: TRK
      metrics:
        - code_smells
        - coverage
        - bugs
        - vulnerabilities
        - duplicated_files
        - security_hotspots
        - new_violations
        - new_coverage
        - new_duplicated_lines_density
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeProject"'
          identifier: .key
          title: .name
          properties:
            organization: .organization
            link: .__link
            lastAnalysisStatus: .__branch.status.qualityGateStatus
            lastAnalysisDate: .__branch.analysisDate
            numberOfBugs: .__measures[]? | select(.metric == "bugs") | .value
            numberOfCodeSmells: .__measures[]? | select(.metric == "code_smells") | .value
            numberOfVulnerabilities: .__measures[]? | select(.metric == "vulnerabilities") | .value
            numberOfHotSpots: .__measures[]? | select(.metric == "security_hotspots") | .value
            numberOfDuplications: .__measures[]? | select(.metric == "duplicated_files") | .value
            coverage: .__measures[]? | select(.metric == "coverage") | .value
            mainBranch: .__branch.name
            tags: .tags
```


<h3>Project mapping for integratiion version `>= 0.1.115`</h3>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: projects_ga
    selector:
      query: 'true'
      apiFilters:
        qualifier:
          - TRK
      metrics:
        - code_smells
        - coverage
        - bugs
        - vulnerabilities
        - duplicated_files
        - security_hotspots
        - new_violations
        - new_coverage
        - new_duplicated_lines_density
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeProject"'
          identifier: .key
          title: .name
          properties:
            organization: .organization
            link: .__link
            qualityGateStatus: .__branch.status.qualityGateStatus
            lastAnalysisDate: .analysisDate
            numberOfBugs: .__measures[]? | select(.metric == "bugs") | .value
            numberOfCodeSmells: .__measures[]? | select(.metric == "code_smells") | .value
            numberOfVulnerabilities: .__measures[]? | select(.metric == "vulnerabilities") | .value
            numberOfHotSpots: .__measures[]? | select(.metric == "security_hotspots") | .value
            numberOfDuplications: .__measures[]? | select(.metric == "duplicated_files") | .value
            coverage: .__measures[]? | select(.metric == "coverage") | .value
            mainBranch: .__branch.name
            mainBranchLastAnalysisDate: .__branch.analysisDate
            revision: .revision
            managed: .managed
```

</details>

## Issue

<details>
<summary><b>Issue blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "sonarQubeIssue",
  "title": "SonarQube Issue",
  "icon": "sonarqube",
  "schema": {
    "properties": {
      "type": {
        "type": "string",
        "title": "Type",
        "enum": ["CODE_SMELL", "BUG", "VULNERABILITY"]
      },
      "severity": {
        "type": "string",
        "title": "Severity",
        "enum": ["MAJOR", "INFO", "MINOR", "CRITICAL", "BLOCKER"],
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
        "enum": ["OPEN", "CLOSED", "RESOLVED", "REOPENED", "CONFIRMED"]
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
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "sonarQubeProject": {
      "target": "sonarQubeProject",
      "required": false,
      "title": "SonarQube Project",
      "many": false
    }
  }
}
```

</details>

<details>
<summary><b>Integration configuration (Click to expand)</b></summary>

:::tip filter issues
The integration provides an option to filter the data that is retrieved from the SonarQube API using the following attributes:

1. `assigned`: To retrieve assigned or unassigned issues. Accepts values: `yes`, `no`, `true`, `false`
2. `assignees`: A list of assignee logins
3. `cleanCodeAttributeCategories`: List of clean code attribute categories. Accepts values: `ADAPTABLE`, `CONSISTENT`, `INTENTIONAL`, `RESPONSIBLE`
4. `createdBefore`: To retrieve issues created before the given date
5. `createdAfter`: To retrieve issues created after the given date
6. `impactSeverities`: List of impact severities. Accepts values: `HIGH`, `LOW`, `MEDIUM`
7. `impactSoftwareQualities`: List of impact software qualities. Accepts values: `MAINTAINABILITY`, `RELIABILITY`, `SECURITY`
8. `statuses`: List of statuses. Accepts values: `OPEN`, `CONFIRMED`, `FALSE_POSITIVE`, `ACCEPTED`, `FIXED`
9. `languages`: List of languages
10. `resolved`: To retrieve resolved or unresolved issues. Accepts values: `yes`, `no`, `true`, `false`
11. `scopes`: List of scopes. Accepts values: `MAIN`, `TESTS`
12. `tags`: List of tags

These attributes can be enabled using the path: `selector.apiFilters`. By default, the integration fetches unresolved SonarQube issues. It is also possible to configure the integration to fetch issues from a SonarQube project using the path: `selector.projectApiFilters.filter` while specifying any of [the above project attributes](#project)
:::

:::note Supported Sonar environment
Please note that the API filters are supported on on-premise Sonar environments (SonarQube) only, and will not work on SonarCloud.
:::

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: issues
    selector:
      query: "true"
      apiFilters:
        resolved: 'false'
      projectApiFilters:
        filter:
          qualifier: TRK
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeIssue"'
          identifier: .key
          title: .message
          properties:
            type: .type
            severity: .severity
            link: .__link
            status: .status
            assignees: .assignee
            tags: .tags
            createdAt: .creationDate
          relations:
            sonarQubeProject: .project
```

</details>

## Saas Analysis

<details>
<summary><b>Saas analysis blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "sonarQubeAnalysis",
  "title": "SonarQube Analysis",
  "icon": "sonarqube",
  "schema": {
    "properties": {
      "branch": {
        "type": "string",
        "title": "Branch",
        "icon": "GitVersion"
      },
      "fixedIssues": {
        "type": "number",
        "title": "Fixed Issues"
      },
      "newIssues": {
        "type": "number",
        "title": "New Issues"
      },
      "coverage": {
        "title": "Coverage",
        "type": "number"
      },
      "duplications": {
        "type": "number",
        "title": "Duplications"
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At"
      }
    }
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "sonarQubeProject": {
      "target": "sonarQubeProject",
      "required": false,
      "title": "SonarQube Project",
      "many": false
    }
  }
}
```

</details>

<details>
<summary><b>Integration configuration (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: saas_analysis
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeAnalysis"'
          identifier: .analysisId
          title: .__commit.message // .analysisId
          properties:
            branch: .__branchName
            fixedIssues: .measures.violations_fixed
            newIssues: .measures.violations_added
            coverage: .measures.coverage_change
            duplications: .measures.duplicated_lines_density_change
            createdAt: .__analysisDate
          relations:
            sonarQubeProject: .__project
```

</details>

## On-Premise Analysis

<details>
<summary><b>On-premise analysis blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "sonarQubeAnalysis",
  "title": "SonarQube Analysis",
  "icon": "sonarqube",
  "schema": {
    "properties": {
      "branch": {
        "type": "string",
        "title": "Branch",
        "icon": "GitVersion"
      },
      "fixedIssues": {
        "type": "number",
        "title": "Fixed Issues"
      },
      "newIssues": {
        "type": "number",
        "title": "New Issues"
      },
      "coverage": {
        "title": "Coverage",
        "type": "number"
      },
      "duplications": {
        "type": "number",
        "title": "Duplications"
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At"
      }
    }
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "sonarQubeProject": {
      "target": "sonarQubeProject",
      "required": false,
      "title": "SonarQube Project",
      "many": false
    }
  }
}
```

</details>

<details>
<summary><b>Integration configuration (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: onprem_analysis
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeAnalysis"'
          identifier: .__project + "-" + .key
          title: .title
          properties:
            branch: .branch
            newIssues: .__measures[]? | select(.metric == "new_violations") | .period.value
            coverage: .__measures[]? | select(.metric == "new_coverage") | .period.value
            duplications: .__measures[]? | select(.metric == "new_duplicated_lines_density") | .period.value
            createdAt: .analysisDate
          relations:
            sonarQubeProject: .__project
```

</details>

## Portfolio

<details>
<summary><b>Portfolio blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "sonarQubePortfolio",
  "title": "SonarQube Portfolio",
  "icon": "sonarqube",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description"
      },
      "visibility": {
        "type": "string",
        "title": "Visibility",
        "enum": [
          "PUBLIC",
          "PRIVATE"
        ],
        "enumColors": {
          "PUBLIC": "green",
          "PRIVATE": "lightGray"
        }
      },
      "selectionMode": {
        "type": "string",
        "title": "Selection Mode",
        "enum": [
          "AUTO",
          "MANUAL",
          "NONE"
        ],
        "enumColors": {
          "AUTO": "blue",
          "MANUAL": "green",
          "NONE": "lightGray"
        }
      },
      "disabled": {
        "type": "boolean",
        "title": "Disabled"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "referencedBy": {
      "title": "Referenced By",
      "target": "sonarQubePortfolio",
      "required": false,
      "many": true
    },
    "subPortfolios": {
      "title": "Sub Portfolios",
      "target": "sonarQubePortfolio",
      "required": false,
      "many": true
    }
  }
}
```

</details>

<details>
<summary><b>Integration configuration (Click to expand)</b></summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
resources:
  - kind: portfolios
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .key
          title: .name
          blueprint: '"sonarQubePortfolio"'
          properties:
            description: .description
            visibility: if .visibility then .visibility | ascii_upcase else null end
            selectionMode: if .selectionMode then .selectionMode | ascii_upcase else null end
            disabled: .disabled
          relations:
            subPortfolios: .subViews | map(select((.qualifier | IN("VW", "SVW"))) | .key)
            referencedBy: .referencedBy | map(select((.qualifier | IN("VW", "SVW"))) | .key)
```

</details>
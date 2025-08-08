---
sidebar_position: 3
---

### Benchmarking OWASP Top 10 for code

<img src="/img/guides/owasp/chart.png" width="100%" border="1px" />

The following outlines the OWASP Top 10 Benchmarking Scorecard for each repository using Snyk, leveraging the following blueprints:

1. Repository – The primary entity where the Scorecard will reside.
2. Snyk Target – Contains entities that will be evaluated against 10 rules, each corresponding to an entry in the OWASP Top 10.
3. Snyk Vulnerability – Contains entities representing individual vulnerabilities of various types.

**Prerequisites:**
- GitHub / SCM – Repositories must be onboarded to Snyk and listed in the Portal Catalog.
- Snyk – The Exporter must be configured in your portal.


#### Snyk Vulnerability

To accurately benchmark against the OWASP Top 10 for code, most static analysis tools support generating Common Weakness Enumeration (CWE) IDs. If CWEs are not yet included in your blueprint, you can add them to the Snyk Vulnerability blueprint by following these steps:
- Navigate to the Builder.
- Go to Data Sources.
  - Under Exporters for Snyk, select Snyk Vulnerability Blueprint.
  - In the Mapping section, under the vulnerability kind, add the following property mapping.

```json showLineNumbers
cwe: .attributes.classes[0].id
```
5. Resync data from Snyk exporter.
6. Navigate to catalog table to confirm that CWEs are now visible.

#### Snyk Target

- The Snyk Vulnerability and Snyk Target entities are connected through both the Snyk Target ID (via Snyk Target) and the Snyk Project ID (via Snyk Project).
- Now that CWEs are available, we can leverage the Snyk Target blueprint to classify security issues and group them by CWE categories, following the OWASP Top 10 framework.
- Accordingly, the Snyk Target blueprint can be updated to support classification of vulnerabilities under the OWASP Top 10(http://owasp.org/Top10), as demonstrated in L300–L774.
- The objective is to create 10 dedicated properties within Snyk Target, each corresponding to one of the OWASP Top 10 categories for code.

<details>
<summary><b>Snyk Target Blueprint reference</b></summary>
```json showLineNumbers
{
  "identifier": "snykTarget",
  "title": "Snyk Target",
  "icon": "Snyk",
  "schema": {
    "properties": {
      "snyk_project_types": {
        "items": {
          "type": "string"
        },
        "type": "array",
        "title": "Snyk project types"
      },
      "snyk_product_types": {
        "items": {
          "type": "string"
        },
        "type": "array",
        "title": "Snyk product types"
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
          "terraform-cloud",
          "bitbucket-connect-app",
          "acr",
          "api"
        ]
      }
    },
    "required": []
  },
  "mirrorProperties": {
    "repository_url": {
      "title": "Repository url",
      "path": "repository.url"
    }
  },
  "calculationProperties": {},
  "aggregationProperties": {
    "connected_services": {
      "title": "Connected services ",
      "icon": "Microservice",
      "type": "number",
      "target": "service",
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "criticalOpenVulnerabilities": {
      "title": "Open Critical Vulnerabilities",
      "icon": "Vulnerability",
      "type": "number",
      "target": "snykVulnerability",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "severity",
            "operator": "=",
            "value": "critical"
          }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "highOpenVulnerabilities": {
      "title": "Open High Vulnerabilities",
      "icon": "Vulnerability",
      "type": "number",
      "target": "snykVulnerability",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "severity",
            "operator": "=",
            "value": "high"
          }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "a1_access_control_flaws": {
      "title": "A1 Access Control Flaws",
      "icon": "Bug",
      "type": "number",
      "target": "snykVulnerability",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "type",
            "operator": "=",
            "value": "code"
          },
          {
            "property": "status",
            "operator": "=",
            "value": "open"
          },
          {
            "property": "category",
            "operator": "notIn",
            "value": [
              "CWE-22",
              "CWE-23",
              "CWE-35",
              "CWE-59",
              "CWE-200",
              "CWE-201",
              "CWE-219",
              "CWE-264",
              "CWE-275",
              "CWE-276",
              "CWE-284",
              "CWE-285",
              "CWE-352",
              "CWE-359",
              "CWE-377",
              "CWE-402",
              "CWE-425",
              "CWE-441",
              "CWE-497",
              "CWE-538",
              "CWE-540",
              "CWE-548",
              "CWE-552",
              "CWE-566",
              "CWE-601",
              "CWE-639",
              "CWE-651",
              "CWE-668",
              "CWE-706",
              "CWE-862",
              "CWE-863",
              "CWE-913",
              "CWE-922",
              "CWE-1275"
            ]
          }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "a10_ssrf": {
      "title": "A10 SSRF",
      "icon": "Bug",
      "type": "number",
      "target": "snykVulnerability",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "type",
            "operator": "=",
            "value": "code"
          },
          {
            "property": "status",
            "operator": "=",
            "value": "open"
          },
          {
            "property": "category",
            "operator": "notIn",
            "value": [
              "CWE-918"
            ]
          }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "a2_cryptographic_failures": {
      "title": "A2 Cryptographic Failures",
      "icon": "Bug",
      "type": "number",
      "target": "snykVulnerability",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "type",
            "operator": "=",
            "value": "code"
          },
          {
            "property": "status",
            "operator": "=",
            "value": "open"
          },
          {
            "property": "category",
            "operator": "notIn",
            "value": [
              "CWE-259",
              "CWE-261",
              "CWE-296",
              "CWE-310",
              "CWE-319",
              "CWE-321",
              "CWE-322",
              "CWE-323",
              "CWE-324",
              "CWE-325",
              "CWE-326",
              "CWE-327",
              "CWE-328",
              "CWE-329",
              "CWE-330",
              "CWE-331",
              "CWE-335",
              "CWE-336",
              "CWE-337",
              "CWE-338",
              "CWE-340",
              "CWE-347",
              "CWE-523",
              "CWE-720",
              "CWE-757",
              "CWE-759",
              "CWE-760",
              "CWE-780",
              "CWE-818",
              "CWE-916"
            ]
          }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "a3_injection": {
      "title": "A3 Injection",
      "icon": "Bug",
      "type": "number",
      "target": "snykVulnerability",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "type",
            "operator": "=",
            "value": "code"
          },
          {
            "property": "status",
            "operator": "=",
            "value": "open"
          },
          {
            "property": "category",
            "operator": "notIn",
            "value": [
              "CWE-20",
              "CWE-74",
              "CWE-75",
              "CWE-77",
              "CWE-78",
              "CWE-79",
              "CWE-80",
              "CWE-83",
              "CWE-87",
              "CWE-88",
              "CWE-89",
              "CWE-90",
              "CWE-91",
              "CWE-93",
              "CWE-94",
              "CWE-95",
              "CWE-96",
              "CWE-97",
              "CWE-98",
              "CWE-99",
              "CWE-100",
              "CWE-113",
              "CWE-116",
              "CWE-138",
              "CWE-184",
              "CWE-470",
              "CWE-471",
              "CWE-564",
              "CWE-610",
              "CWE-643",
              "CWE-644",
              "CWE-652",
              "CWE-917"
            ]
          }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "a4_insecure_design": {
      "title": "A4 Insecure Design",
      "icon": "Bug",
      "type": "number",
      "target": "snykVulnerability",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "status",
            "operator": "=",
            "value": "open"
          },
          {
            "property": "type",
            "operator": "=",
            "value": "code"
          },
          {
            "property": "category",
            "operator": "notIn",
            "value": [
              "CWE-73",
              "CWE-183",
              "CWE-209",
              "CWE-213",
              "CWE-235",
              "CWE-256",
              "CWE-257",
              "CWE-266",
              "CWE-269",
              "CWE-280",
              "CWE-311",
              "CWE-312",
              "CWE-313",
              "CWE-316",
              "CWE-419",
              "CWE-430",
              "CWE-434",
              "CWE-444",
              "CWE-451",
              "CWE-472",
              "CWE-501",
              "CWE-522",
              "CWE-525",
              "CWE-539",
              "CWE-579",
              "CWE-598",
              "CWE-602",
              "CWE-642",
              "CWE-646",
              "CWE-650",
              "CWE-653",
              "CWE-656",
              "CWE-657",
              "CWE-799",
              "CWE-807",
              "CWE-840",
              "CWE-841",
              "CWE-927",
              "CWE-1021",
              "CWE-1173"
            ]
          }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "a5_security_misconfigurations": {
      "title": "A5 Security Misconfigurations",
      "icon": "Bug",
      "type": "number",
      "target": "snykVulnerability",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "status",
            "operator": "=",
            "value": "open"
          },
          {
            "property": "type",
            "operator": "=",
            "value": "code"
          },
          {
            "property": "category",
            "operator": "notIn",
            "value": [
              "CWE-2",
              "CWE-11",
              "CWE-13",
              "CWE-15",
              "CWE-16",
              "CWE-260",
              "CWE-315",
              "CWE-520",
              "CWE-526",
              "CWE-537",
              "CWE-541",
              "CWE-547",
              "CWE-611",
              "CWE-614",
              "CWE-756",
              "CWE-776",
              "CWE-942",
              "CWE-1004",
              "CWE-1032",
              "CWE-1174"
            ]
          }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "a6_vulnerable_components": {
      "title": "A6 Vulnerable components",
      "icon": "Bug",
      "type": "number",
      "target": "snykVulnerability",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "type",
            "operator": "=",
            "value": "code"
          },
          {
            "property": "status",
            "operator": "=",
            "value": "open"
          },
          {
            "property": "category",
            "operator": "notIn",
            "value": [
              "CWE-937",
              "CWE-1035",
              "CWE-1104"
            ]
          }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "a7_authentication_failures": {
      "title": "A7 Authentication Failures",
      "icon": "Bug",
      "type": "number",
      "target": "snykVulnerability",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "status",
            "operator": "=",
            "value": "open"
          },
          {
            "property": "type",
            "operator": "=",
            "value": "code"
          },
          {
            "property": "category",
            "operator": "notIn",
            "value": [
              "CWE-255",
              "CWE-259",
              "CWE-287",
              "CWE-288",
              "CWE-290",
              "CWE-294",
              "CWE-295",
              "CWE-297",
              "CWE-300",
              "CWE-302",
              "CWE-304",
              "CWE-306",
              "CWE-307",
              "CWE-346",
              "CWE-384",
              "CWE-521",
              "CWE-613",
              "CWE-620",
              "CWE-640",
              "CWE-798",
              "CWE-940",
              "CWE-1216"
            ]
          }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "a8_integrity_failures": {
      "title": "A8 Integrity Failures",
      "icon": "Bug",
      "type": "number",
      "target": "snykVulnerability",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "type",
            "operator": "=",
            "value": "code"
          },
          {
            "property": "status",
            "operator": "=",
            "value": "open"
          },
          {
            "property": "category",
            "operator": "notIn",
            "value": [
              "CWE-345",
              "CWE-353",
              "CWE-426",
              "CWE-494",
              "CWE-502",
              "CWE-565",
              "CWE-784",
              "CWE-829",
              "CWE-830",
              "CWE-915"
            ]
          }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "a9_logging": {
      "title": "A9 Logging",
      "icon": "Bug",
      "type": "number",
      "target": "snykVulnerability",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "status",
            "operator": "=",
            "value": "open"
          },
          {
            "property": "type",
            "operator": "=",
            "value": "code"
          },
          {
            "property": "category",
            "operator": "notIn",
            "value": [
              "CWE-117",
              "CWE-223",
              "CWE-532",
              "CWE-778"
            ]
          }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    }
  },
  "relations": {
    "repository": {
      "title": "Repository",
      "target": "githubRepository",
      "required": true,
      "many": false
    },
    "snyk_organization": {
      "title": "Snyk Organization",
      "target": "snykOrganization",
      "required": false,
      "many": false
    }
  }
}
```
</details>


#### Repository

The Snyk Target entity should have a defined relationship with the Repository entity.
If your current model does not include a reverse relationship from Repository back to Snyk Target, please introduce this relationship so that the snyk target id is visible in the association.

<img src="/img/guides/owasp/repo-overview.png" width="100%" border="1px" />

From the previous step, bring in all newly identified OWASP Identifiers as mirrored properties for the Repository entity.
Add these mirrored properties in the Mirrored Property section, between L850–L894.


<img src="/img/guides/owasp/repo.png" width="100%" border="1px" />
One can also observe quickly that all repositories now have pass/fail percentages for each property as above.

<details>
<summary><b>GitHub Repository Blueprint reference</b></summary>
```json showLineNumbers
{
  "identifier": "githubRepository",
  "title": "Repository",
  "icon": "Github",
  "ownership": {
    "type": "Direct"
  },
  "schema": {
    "properties": {
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown"
      },
      "url": {
        "icon": "DefaultProperty",
        "title": "Repository URL",
        "type": "string",
        "format": "url"
      },
      "defaultBranch": {
        "title": "Default branch",
        "type": "string"
      },
      "last_contributor": {
        "title": "Last contributor",
        "icon": "TwoUsers",
        "type": "string",
        "format": "user"
      },
      "last_push": {
        "icon": "GitPullRequest",
        "title": "Last push",
        "description": "Last commit to the main branch",
        "type": "string",
        "format": "date-time"
      },
      "require_code_owner_review": {
        "title": "Require code owner review",
        "type": "boolean",
        "icon": "DefaultProperty",
        "description": "Requires review from code owners before a pull request can be merged"
      },
      "require_approval_count": {
        "title": "Require approvals",
        "type": "number",
        "icon": "DefaultProperty",
        "description": "The number of approvals required before merging a pull request"
      }
    },
    "required": []
  },
  "mirrorProperties": {
    "snyk_target_id": {
      "title": "snyk_target_id",
      "path": "snyk_target.$identifier"
    },
    "a1_access_control_flaws": {
      "title": "A1 Access Control Flaws",
      "path": "snyk_target.a1_access_control_flows"
    },
    "a2_cryptographic_failures": {
      "title": "A2 Cryptographic Failures",
      "path": "snyk_target.a2_cryptographic_failures"
    },
    "a3_injection": {
      "title": "A3 Injection",
      "path": "snyk_target.a3_injection"
    },
    "a4_insecure_design": {
      "title": "A4 Insecure Design",
      "path": "snyk_target.a4_insecure_design"
    },
    "a5_security_misconfigurations": {
      "title": "A5 Security Misconfigurations",
      "path": "snyk_target.a5_security_misconfigurations"
    },
    "a6_vulnerable_components": {
      "title": "A6 Vulnerable Components",
      "path": "snyk_target.a6_vulnerable_components"
    },
    "a7_authentication_failures": {
      "title": "A7 Authentication Failures",
      "path": "snyk_target.a7_authentication_failures"
    },
    "a8_integrity_failures": {
      "title": "A8 Integrity Failures",
      "path": "snyk_target.a8_integrity_failures"
    },
    "a9_logging": {
      "title": "A9 Logging",
      "path": "snyk_target.a9_logging"
    },
    "a10_ssrf": {
      "title": "A10 SSRF",
      "path": "snyk_target.a10_ssrf"
    },
    "lead_time_for_change": {
      "title": "Lead Time for Change",
      "path": "$team.lead_time_for_change"
    },
    "updated_by": {
      "title": "Updated by",
      "path": "$team.$updatedBy"
    }
  },
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "githubTeams": {
      "title": "GitHub Teams",
      "target": "githubTeam",
      "required": false,
      "many": true
    },
    "snyk_target": {
      "title": "Snyk target",
      "target": "snykTarget",
      "required": false,
      "many": false
    }
  }
}
```
</details>


#### Scorecard

<img src="/img/guides/owasp/scorecard-fail.png" width="80%" border="1px" />

Finally, We have all the mirrored properties at the repository level. Therefore, we can now build a scorecard for each repository. Below is the JSON required to build OWASP Top 10 Score card at the repository level.


<details>
<summary><b>Owasp Top 10 Scorecard</b></summary>
```json showLineNumbers
{
  "identifier": "OwaspScoreCard",
  "title": "Owasp Top 10",
  "levels": [
    {
      "color": "paleBlue",
      "title": "Basic"
    },
    {
      "color": "bronze",
      "title": "Bronze"
    },
    {
      "color": "silver",
      "title": "Silver"
    },
    {
      "color": "gold",
      "title": "Gold"
    }
  ],
  "rules": [
    {
      "identifier": "has_owasp_a6",
      "title": "A06 Vulnerable Components",
      "level": "Gold",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "value": 0,
            "operator": "=",
            "property": "a6_vulnerable_components"
          }
        ]
      }
    },
    {
      "identifier": "has_owasp_a1",
      "title": "A01 Broken Access Control",
      "level": "Bronze",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "value": 0,
            "operator": "=",
            "property": "a1_access_control_flaws"
          }
        ]
      }
    },
    {
      "identifier": "has_owasp_a4",
      "title": "A04 Insecure Design",
      "level": "Gold",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "value": 0,
            "operator": "=",
            "property": "a4_insecure_design"
          }
        ]
      }
    },
    {
      "identifier": "has_owasp_a8",
      "title": "A08 Integrity Failures",
      "level": "Silver",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "value": 0,
            "operator": "=",
            "property": "a8_integrity_failures"
          }
        ]
      }
    },
    {
      "identifier": "has_owasp_a7",
      "title": "A07 Authentication Failures",
      "level": "Bronze",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "value": 0,
            "operator": "=",
            "property": "a7_authentication_failures"
          }
        ]
      }
    },
    {
      "identifier": "has_owasp_a3",
      "title": "A03 Injection",
      "level": "Bronze",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "value": 0,
            "operator": "=",
            "property": "a3_injection"
          }
        ]
      }
    },
    {
      "identifier": "has_owasp_a5",
      "title": "A05 Security Misconfigurations",
      "level": "Gold",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "value": 0,
            "operator": "=",
            "property": "a5_security_misconfigurations"
          }
        ]
      }
    },
    {
      "identifier": "has_owasp_a2",
      "title": "A02 Cryptographic Failures",
      "level": "Silver",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "value": 0,
            "operator": "=",
            "property": "a2_cryptographic_failures"
          }
        ]
      }
    },
    {
      "identifier": "has_owasp_a9",
      "title": "A09 Logging ",
      "level": "Silver",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "value": 0,
            "operator": "=",
            "property": "a9_logging"
          }
        ]
      }
    },
    {
      "identifier": "has_owasp_a10",
      "title": "A10 SSRF",
      "level": "Bronze",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "value": 0,
            "operator": "=",
            "property": "a10_ssrf"
          }
        ]
      }
    }
  ]
}
```
</details>

#### Next steps

The following steps are recommended as next steps.

1. Quality standards:
  - Eliminate chaos and promote `minimum viable security product` with tiering.
  - Establish a customised standard that best meets your organisation's culture by classufying the OWASP Top 10.
2. Self Serve actions:
  - Automatically assign Owners and create a self-service action that triggers an alert to repository owners when tier standards are unmet.
3. Portal Initiative:
  - Self serve action: Create a self-serve action to improve OWASP Tiers for specific repositories.
  - Create an initiative within Portal to reduce a specific security weaknesss or promote a specific tier as a standard operating procedure.
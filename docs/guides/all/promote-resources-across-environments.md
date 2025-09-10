---
displayed_sidebar: null
description: Build an OWASP Top 10 security scorecard in Port using vulnerability data from Snyk.
---

import LogoImage from '/src/components/guides-section/LogoImage/LogoImage.jsx';

# Promote resources across environments

This guide explores the concept of managing a portal across multiple environments, e.g. promoting a service from a development environment to a production environment.

The guide suggests two approaches to achieve this, each with their own pros and cons:

1. Using IaC (Terraform) to define and manage resources.
2. Using Port resource definitions (in JSON format) in a dedicated Git repository to define and manage resources.

## Prerequisites

- A Port account with the [onboarding process](https://docs.port.io/getting-started/overview) completed.

- For the first approach, you will need to have a Terraform account and be able to create and manage resources in your desired environment.

- For the second approach, you will need to have a dedicated Git repository to store the resource definitions. In this guide, we will use GitHub as an example.

## Approach 1: Use IaC (Terraform)

Port offers a [Terraform provider](https://registry.terraform.io/providers/port-labs/port/latest/docs) that allows you to define and manage portal resources (blueprints, scorecards, automations, etc.) as Terraform code.

The following steps outline the recommended process for managing your resources across environments using Terraform, while maintaining consistency and minimizing errors:

1. **Set up development environment**  
   Using Port's UI in your development environment, create the resources you want to promote to your production environment.  
   As an example, we will use the `Service` blueprint, and the `Own services` self-service action. These two resources are automatically created when you create a Port account.

2. **Update Terraform configuration**  
   In your Terraform configuration, add the following import blocks:

   <details>
   <summary><b>Import blocks (click to expand)</b></summary>
    ```hcl showLineNumbers
    terraform {
      required_providers {
        port = {
          source  = "port-labs/port-labs"
          version = "~> 2.0.3"
        }
      }
    }

    provider "port" {
      client_id = "{YOUR CLIENT ID}"     # or set the environment variable PORT_CLIENT_ID
      secret    = "{YOUR CLIENT SECRET}" # or set the environment variable PORT_CLIENT_SECRET
      base_url  = "https://api.getport.io"
    }

    import {
      id = "set_ownership"
      to = port_action.own_services
    }

    import {
      id = "service"
      to = port_blueprint.service
    }
    ```
    </details>

3. **Generate Terraform configuration**  
   Using the Terraform CLI, generate configuration files from the resources created in your development environment:
   
   ```bash showLineNumbers
   terraform init
   terraform plan -generate-config-out=generated.tf
   ```

4. **Validate the configuration**  
   Check the resulting `generated.tf` file, ensuring it includes the desired configuration for both the `Own services` and `Service` resources.

5. **Copy and adjust for Production**  
   - Copy the `generated.tf` file to your production environment.
   - Remove the provider blocks - since the provider is usually set at a higher level, remove the `provider = port-labs` lines from both resources.
   - Remove null properties - clean up the configuration by removing all properties that are set to `null`.

6. **Dynamic referencing**  
   If you have dependencies between two or more resources, you will need to manually handle them using dynamic referencing.

   For example, a self-service action that creates new instances of a blueprint will depend on that blueprint.  
   In such a case, use dynamic referencing instead of hardcoding the blueprint identifier:

    ```hcl showLineNumbers

    resource "port_action" "scaffold_a_new_service" {
      identifier                    = "scaffold_a_new_service"
      required_approval             = "false"
      self_service_trigger = {
        # highlight-next-line
        blueprint_identifier = port_blueprint.service.identifier # instead of "service"
        operation            = "DAY-2"
        user_properties = {
        }
      }
    …
    }
    ```

7. **Apply Changes in Production**  
   Before applying any changes, run `terraform plan` in your production environment to view the planned changes and ensure everything is set up correctly.
   
   Once you're satisfied with the plan, run `terraform apply` to apply the changes to your production environment.


## Approach 2: Use JSON resource definitions

Being an API-first solution, Port allows you to define portal resources (blueprints, scorecards, automations, etc.) as JSON objects.  
This approach demonstrates how to manage your resource definitions in a dedicated Git repository.

1. **Organize your Git repository**  
   In your dedicated Git repository, create a folder for each environment you want to manage (e.g. `development`, `production`, etc.).  
   In each environment folder, create a folder for each resource type (e.g. `blueprints`, `scorecards`, `automations`, etc.).  
   
2. **Set up development environment**  
   - Using Port's UI in your development environment, create the resources you want to promote to your production environment.  

   - Save the resource definitions to a JSON file. This can be done in the following ways:
     - Using [Port's API](https://docs.port.io/api-reference/port-api), call the relevant GET endpoint to retrieve the definition/s of the desired resource type.
     - Using Port's UI, click on the `...` button in the top right corner of a resource, then click `Edit`.  
     - For **entities** - you can export all entities of a specific blueprint at once by clicking on the <LogoImage logo="export" verticalAlign="text-top" /> (`Export`) button in the top right corner of the relevant catalog page.
      
   - Save your JSON definitions in the `development` folder in your Git repository.

3. **Promote to production environment**  
   - Copy the relevant JSON definitions to the `production` folder in your Git repository.
   - Using [Port's API](https://docs.port.io/api-reference/port-api), call the relevant POST endpoint to apply the resource definitions to your production environment.


### Update Snyk mapping configuration

1. Head over to your [Data sources](https://app.port.io/settings/data-sources) page.

2. Under `Exporters`, click on your Snyk integration.

3. In the **Mapping** tab, edit the YAML in the bottom-left panel and add the following entry under the `vulnerability` kind:  

    <details>
    <summary><b>Mapping configuration (click to expand)</b></summary>
          ```yaml showLineNumbers
          resources:
            - kind: vulnerability
              port:
                entity:
                  mappings:
                  //highlight-start
                    cwe: .attributes.classes[0].id  
                  //highlight-end
          ```
    </details>
      
4. Click on the `Save & Resync` button to save the changes and resync the integration.

### Update Snyk Target blueprint

With the addition of the `CWE` property to the `Snyk Vulnerability` blueprint, you can now classify vulnerabilities by CWE and align them with the [OWASP Top 10](http://owasp.org/Top10) categories.

Update the `Snyk Target` blueprint to include 10 aggregation properties, one for each OWASP Top 10 code category, so issues can be grouped and reported by category.

To update the `Snyk Target` blueprint, follow these steps:

1. Navigate to the [Data model](https://app.getport.io/settings/data-model) page of your portal.

2. Click on the `Snyk Target` blueprint.

3. Click on the `...` button in the top right corner, then click on the `{...} Edit JSON` button. 

4. Update the aggregation properties to include the snippet JSON snippet below:

    <details>
    <summary><b>Snyk Target blueprint (click to expand)</b></summary>
    ```json showLineNumbers
    {
      "aggregationProperties": {
        "a1_access_control_flaws": {
          "title": "A1 Access Control Flaws",
          "icon": "Shield",
          "type": "number",
          "description": "Check if repo is free of OWASP Top 10 A1 - Access Control Flaws",
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
                "operator": "in",
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
                  "CWE-352",
                  "CWE-359"
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
          "icon": "Shield",
          "type": "number",
          "description": "OWASP Top 10 A2 Cryptographic Failures",
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
                "operator": "in",
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
          "icon": "Shield",
          "type": "number",
          "description": "Check if repo is free of OWASP Top 10 A3 - Injection flaws",
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
                "operator": "in",
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
          "icon": "Shield",
          "type": "number",
          "description": "OWASP top 10 A4 - Insecure design security weakness",
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
                "operator": "in",
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
          "icon": "Shield",
          "type": "number",
          "description": "OWASP Top 10 - A5 Security misconfigurations",
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
                "operator": "in",
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
          "icon": "Shield",
          "type": "number",
          "description": "OWASP A6 - Vulnerable and outdated components in use.",
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
                "operator": "in",
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
          "icon": "Shield",
          "type": "number",
          "description": "OWASP Top 10 - Identification & Authentication Failures",
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
                "operator": "in",
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
          "icon": "Shield",
          "type": "number",
          "description": "OWASP Top 10 - A8 - Software & Integrity failures",
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
                "operator": "in",
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
          "icon": "Shield",
          "type": "number",
          "description": "OWASP Top 10 - A9 Security logging & Monitoring",
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
                "operator": "in",
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
        },
        "a10_ssrf": {
          "title": "A10 SSRF",
          "icon": "Shield",
          "type": "number",
          "description": "OWASP Top 10 - A10 Server side request forgery",
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
                "operator": "in",
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
        }
      }
    }
    ```
    </details>

5. Click on `Save` to update the blueprint.

### Add mirror properties to the Repository blueprint

:::tip Relation requirement
The `Snyk Target` blueprint should have a defined relation with the `GitHub Repository` blueprint to be able to mirror properties from the `Snyk Target` blueprint to the `GitHub Repository` blueprint.

If your current model does not include a relation from the `Repository` blueprint to the `Snyk Target` blueprint, [add it](https://docs.port.io/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/).
:::


The next step is to add the OWASP identifiers as mirrored properties to the `GitHub Repository` blueprint, and update the GitHub mapping configuration so that each `GitHub Repository` is automatically linked to its corresponding `Snyk Target`.  
This link is what allows the mirrored OWASP properties to pull their values from the related Snyk data. 

Follow the steps below to add the OWASP mirror properties to the `GitHub Repository` blueprint:

1. Navigate to the [Data model](https://app.getport.io/settings/data-model) page of your portal.

2. Click on the `GitHub Repository` blueprint.

3. Click on the `...` button in the top right corner, then click on the `{...} Edit JSON` button. 

4. Update the mirrorProperties to include the snippet below:

    <details>
    <summary><b>Add mirror properties to GitHub Repository blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "mirrorProperties": {
        "a1_access_control_flaws": {
          "title": "A1 Access Control Flaws",
          "path": "snyk_target.a1_access_control_flaws"
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
        }
      }
    }
    ```
    </details>

5.  Click on `Save` to update the blueprint.

### Update GitHub mapping configuration

1. Head over to your [Data sources](https://app.port.io/settings/data-sources) page.

2. Under `Exporters`, click on your desired GitHub organization.

3. In the **Mapping** tab, edit the YAML in the bottom-left panel and add the following entry under the `repository` kind:  

    <details>
    <summary><b>Mapping configuration (click to expand)</b></summary>
          ```yaml showLineNumbers
        - kind: repository
         selector:
           query: 'true' 
         port:
           entity:
             mappings:
               identifier: .full_name
               blueprint: '"githubRepository"'
               //highlight-start
               relations:
                 snyk_target:
                   combinator: '"and"'
                   rules:
                     - property: '"$title"'
                       operator: '"="'
                       value: .full_name
               //highlight-end
          ```
    </details>
      
4. Click on the `Save & Resync` button to save the changes and resync the integration.

## Set up the scorecard

The final step is to create a scorecard that reflects the security maturity of a `Respository` against the OWASP Top 10 categories.

<img src='/img/guides/owasp/scorecard-pass.png' width='80%' border='1px' />
<br></br>
<br></br>

To create an OWASP Top 10 Scorecard, follow these steps:

1. Go to your [Data model](https://app.getport.io/settings/data-model) page.

2. Search for the **GitHub Repository** blueprint and select it.

3. Click on the `Scorecards` tab.

4. Click on `+ New Scorecard` to create a new scorecard.

5. Add this JSON configuration and click `Save`.

    <details>
    <summary><b>OWASP Top 10 Scorecard (click to expand)</b></summary>
    ```json showLineNumbers
    {
      "identifier": "OWASPScoreCard",
      "title": "OWASP Top 10",
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

6. Click on `Save` to create the scorecard.

## Troubleshooting

Some common issues you may encounter during the implementation:

1. **Invalid token:** The `SNYK_TOKEN` does not have privileges or otherwise has been revoked. Ensure that the token is valid and has required permissions so that issues and targets across the Snyk Group can be queried for.
2. **OWASP Top 10 2021:** `CWE` field is key to accurately measuring and benchmarking against OWASP Top 10. The current measurement rules are based on the latest OWASP Top 10 i.e. OWASP Top 10 2021 as of this write-up. Discrepancy may arise if following this example without consideration for reviewing against latest OWASP Top 10 issues and the associated CWEs.
3. **Missing property data:** This can happen when `CWE` property has been defined on the `Snyk Vulnerability` blueprint, however a sync has not yet occurred.

## Next steps

Consider the following as next steps:

1. **Quality standards:**
   - Eliminate chaos and promote `minimum viable security product` with tiering.
   - Establish a customized standard that best meets your organization's culture by classifying the OWASP Top 10.
2. **Self-service actions:**
   - Automatically assign Owners and create a self-service action that triggers an alert to repository owners when tier standards are unmet.
3. **Portal Initiative:**
   - Self-service action: Create a self-service action to improve OWASP Tiers for specific repositories.
   - Create an initiative within Port to reduce a specific security weakness or promote a specific tier as a standard operating procedure.
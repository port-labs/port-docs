---
title: Ingest security issues from `.sarif` files to services
displayed_sidebar: null
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Ingest security issues from `.sarif` files and relate them to services

This guide will demonstrate how to ingest security issues from `.sarif` files and relate them to the corresponding service entities in Port.

:::info Prerequisites

- Ensure you have a Port account and have completed the [onboarding process](https://docs.getport.io/quickstart).
- The `Service` blueprint should be created during the onboarding process.
- Ensure you have [GitHub installed and configured](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/github/installation.md) in your environment.

:::

<br/>

Add the `Security Issue` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

<details>
<summary><b>Security Issue Blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "security_issue",
  "title": "Security Issue",
  "icon": "Alert",
  "schema": {
    "properties": {
      "rule_name": {
        "type": "string",
        "title": "Rule Name"
      },
      "rule_desc": {
        "type": "string",
        "title": "Rule Description"
      },
      "location": {
        "type": "string",
        "title": "Location"
      },
      "message": {
        "type": "string",
        "title": "Message"
      }
    },
    "required": [
      "rule_name",
      "location",
      "message"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```

</details>

<br/>

### How to Relate the Security Issues to the Service

Once the security issues have been ingested, the next step is to establish relationships between these `security_issue` entities and the corresponding `service` entities.

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal, select the `Service` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation` to create a relation between the `service` and `security_issue` blueprints.

2. **Add this JSON to establish the relationship**:

```json
{
  "security_issues": {
    "title": "Security Issues",
    "target": "security_issue",
    "required": false,
    "many": true
  }
}
```

3. Head back to the [data sources page](https://app.getport.io/settings/data-sources) and ensure that the `relations` section in your mapping includes the relationship to the service:

<details>
<summary><b>Relation Mapping (Click to expand)</b></summary>

```yaml showLineNumbers
relations:
  issue_service: .repo.name
```

</details>

:::info Mapping Details

This establishes a relation between the `security_issue` and `service` entities based on the repository name (`.repo.name`). Ensure that the `identifier` for the `service` blueprint matches the `.repo.name` value.

:::

<br/>

[//]: # (<img src='/img/guides/serviceSecurityIssues.png' width='100%' border='1px' />)

### How to Ingest Security Issues from `.sarif` Files

To ingest security issues listed in `.sarif` files, follow these steps:

1. **Go to the [data sources page](https://app.getport.io/settings/data-sources)** in your Port portal, and select your GitHub integration.
2. **Modify the mapping** to include the `file` kind with the configuration provided below:

<details>
<summary><b>Port Configuration (Click to expand)</b></summary>

```yaml showLineNumbers
- kind: file
  selector:
    query: 'true'
    files:
      - path: '**/*.sarif'
  port:
    itemsToParse: |
      .file.content.runs[0] as $content |
      $content.tool.driver.rules as $rules |
      [ $content.results[] ] |
      map(
        . as $result |
        {
          ruleId: .ruleId,
          error: .message.text,
          loc: .locations[0].physicalLocation.artifactLocation.uri,
          ruleName: ($rules[] | select(.id == $result.ruleId) | .name),
          ruleDesc: ($rules[] | select(.id == $result.ruleId) | .shortDescription.text)
        })
    entity:
      mappings:
        identifier: .repo.name + "_" + .item.ruleId
        title: .item.error
        blueprint: '"security_issue"'
        properties:
          rule_name: .item.ruleName
          rule_desc: .item.ruleDesc
          location: .item.loc
          message: .item.error
        relations:
          issue_service: .repo.name
```

</details>

:::info Configuration Details

- **`kind: file`** specifies that the source is a file, in this case, `.sarif` files.
- **`files:`** defines the path pattern to locate `.sarif` files within your repositories.
- **`itemsToParse:`** processes the `.sarif` file content to extract security issues.
- **`identifier:`** constructs a unique identifier for each security issue by combining the repository name and the rule ID.
- **`properties:`** captures essential details like rule name, description, location, and message.
- **`relations:`** establishes a relation between the security issue and the corresponding service.

:::



### Conclusion

By following these steps, you can effectively ingest security issues from `.sarif` files and relate them to the corresponding service entities in Port 🎉.


## Relevant Guides

- For relevant guides and examples, see the [guides section](https://docs.getport.io/guides?tags=AppSec).

---
sidebar_position: 2
---
import JiraServerProjectBlueprint from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira-server/examples/_jira_server_project_blueprint.mdx"
import JiraServerUserBlueprint from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira-server/examples/_jira_server_user_blueprint.mdx"
import JiraServerIssueBlueprint from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira-server/examples/_jira_server_issue_blueprint.mdx"

# Examples

To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

## Defaults

### Default blueprints

The integration creates the following default blueprints:

<details>
<summary><b>Jira Server Project blueprint (Click to expand)</b></summary>

<JiraServerProjectBlueprint/>

</details>

<details>
<summary><b>Jira Server User blueprint (Click to expand)</b></summary>

<JiraServerUserBlueprint/>

</details>

<details>
<summary><b>Jira Server Issue blueprint (Click to expand)</b></summary>

<JiraServerIssueBlueprint/>

</details>

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

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
          identifier: .key
          title: .name
          blueprint: '"jiraServerProject"'
          properties:
            url: (.self | split("/") | .[:3] | join("/")) + "/projects/" + .key

  - kind: user
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .key
          title: .displayName
          blueprint: '"jiraServerUser"'
          properties:
            emailAddress: .emailAddress
            active: .active
            timeZone: .timeZone
            locale: .locale
            avatarUrl: .avatarUrls["48x48"]

  - kind: issue
    selector:
      query: "true"
      jql: "(statusCategory != Done) OR (created >= -1w) OR (updated >= -1w)"
    port:
      entity:
        mappings:
          identifier: .key
          title: .fields.summary
          blueprint: '"jiraServerIssue"'
          properties:
            url: (.self | split("/") | .[:3] | join("/")) + "/browse/" + .key
            status: .fields.status.name
            issueType: .fields.issuetype.name
            components: .fields.components | map(.name)
            creator: .fields.creator.name
            priority: .fields.priority.name
            labels: .fields.labels
            created: .fields.created
            updated: .fields.updated
            resolutionDate: .fields.resolutiondate
          relations:
            project: .fields.project.key
            parentIssue: .fields.parent.key
            subtasks: .fields.subtasks | map(.key)
            assignee: .fields.assignee.name
            reporter: .fields.reporter.name
```

</details>


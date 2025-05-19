---
sidebar_position: 2
---
import JiraIssueExampleBlueprint from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira/examples/_jira_example_issue_blueprint.mdx"
import JiraIssueExampleConfiguration from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira/examples/\_jira_example_issue_configuration.mdx"
import JiraTeamBlueprint from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira/examples/_jira_exporter_example_team_blueprint.mdx"
import JiraTeamConfiguration from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira/examples/\_jira_exporter_example_team_configuration.mdx"
import JiraUserBlueprint from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira/examples/_jira_exporter_example_user_blueprint.mdx"
import JiraUserConfiguration from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira/examples/\_jira_exporter_example_user_configuration.mdx"


# Examples
To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.




### Project

<details>
<summary><b>Project blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "jiraProject",
  "title": "Jira Project",
  "icon": "Jira",
  "description": "A Jira project",
  "schema": {
    "properties": {
      "url": {
        "title": "Project URL",
        "type": "string",
        "format": "url",
        "description": "URL to the project in Jira"
      },
      "totalIssues": {
        "title": "Total Issues",
        "type": "number",
        "description": "The total number of issues in the project"
      }
    }
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary><b>Integration configuration (Click to expand)</b></summary>

The `project` kind has a selector property, `expand` that specifies additional fields to be included in the response. It accepts a comma-separated string that allows you to include more fields in the response data that can be used in the mapping configuration. Possible values are `description`, `lead`, `issueTypes`, `url`, `projectKeys`, `insight`.

If not specified, it defaults to `"insight"`.


```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: project
    selector:
      query: "true"
      expand: "description,lead,issueTypes,url,projectKeys,insight"
    port:
      entity:
        mappings:
          identifier: .key
          title: .name
          blueprint: '"jiraProject"'
          properties:
            url: (.self | split("/") | .[:3] | join("/")) + "/projects/" + .key
            totalIssues: .insight.totalIssueCount
```

</details>

### User

<details>
<summary><b>User blueprint (Click to expand)</b></summary>

<JiraUserBlueprint/>

</details>

<details>
<summary><b>Integration configuration (Click to expand)</b></summary>

<JiraUserConfiguration/>

</details>

### Team

<details>
<summary><b>Team blueprint</b></summary>

<JiraTeamBlueprint/>

</details>

<details>
<summary><b>Integration configuration</b></summary>

<JiraTeamConfiguration/>

</details>

### Issue

<details>
<summary><b>Issue blueprint (Click to expand)</b></summary>

<JiraIssueExampleBlueprint/>

</details>

<details>
<summary><b>Integration configuration (Click to expand)</b></summary>

<JiraIssueExampleConfiguration/>

</details>


### Slack notifications
Using Port's automation capabilities, you can set up real-time Slack notifications when issues are created or updated in Jira.

<details>
<summary><b>Automation for new bug reports (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "jira_new_bug_notification",
  "title": "Notify Slack on New Jira Bug",
  "icon": "Slack",
  "description": "Sends a Slack notification when a new bug is created in Jira",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_CREATED",
      "blueprintIdentifier": "jiraIssue"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.after.properties.issueType == \"Bug\""
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "YOUR_SLACK_WEBHOOK_URL",
    "agent": false,
    "synchronized": true,
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "text": "🐛 New Bug Reported\n\n*Issue:* {{ .event.diff.after.title }}\n*Project:* {{ .event.diff.after.relations.project }}\n*Status:* {{ .event.diff.after.properties.status }}\n*Priority:* {{ .event.diff.after.properties.priority }}\n\n<{{ .event.diff.after.properties.url }}|View in Jira> | <https://app.getport.io/jiraIssueEntity?identifier={{ .event.context.entityIdentifier }}|View in Port>"
    }
  },
  "publish": true
}
```

</details>

<details>
<summary><b>Automation for high-priority tasks (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "jira_high_priority_task",
  "title": "Notify Slack on High-Priority Jira Task",
  "icon": "Slack",
  "description": "Sends a Slack notification when a high-priority task is created or updated in Jira",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "jiraIssue"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.after.properties.priority == \"Highest\" or .diff.after.properties.priority == \"High\"",
        ".diff.before.properties.priority != \"Highest\" and .diff.before.properties.priority != \"High\""
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "YOUR_SLACK_WEBHOOK_URL",
    "agent": false,
    "synchronized": true,
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "text": "⚠️ High-Priority Issue Alert\n\n*Issue:* {{ .event.diff.after.title }}\n*Type:* {{ .event.diff.after.properties.issueType }}\n*Priority:* {{ .event.diff.after.properties.priority }}\n*Status:* {{ .event.diff.after.properties.status }}\n\n<{{ .event.diff.after.properties.url }}|View in Jira> | <https://app.getport.io/jiraIssueEntity?identifier={{ .event.context.entityIdentifier }}|View in Port>"
    }
  },
  "publish": true
}
```

</details>

:::tip Slack webhook URL
Replace `YOUR_SLACK_WEBHOOK_URL` with your actual Slack incoming webhook URL. For information on creating Slack webhooks, see the [Slack API documentation](https://api.slack.com/messaging/webhooks).
:::

These automations allow your team to receive immediate notifications in Slack when bugs are reported or issues are updated with high priority, making your project management workflow more efficient.

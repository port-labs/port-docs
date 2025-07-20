---
sidebar_position: 3
title: Scorecards as blueprints
sidebar_label: Scorecards as blueprints
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

:::info Closed beta feature
This capability is currently in closed beta, and is not yet generally available.  
If you would like to join the beta, please reach out to us.
:::

Port allows you to manage scorecards as <PortTooltip id="blueprint">blueprints</PortTooltip>. This feature enables you to create and manage scorecards that evaluate entities in your data model based on customizable rules and levels.

## Why manage scorecards as blueprints?

With this powerful feature you can accomplish the following:

1. **RBAC Management**
   - Control who can create and modify scorecards and rules.
   - Define which teams can view specific scorecard results.
   - Manage permissions for rule creation and modification at a granular level.

2. **Automations and Actions**
   - Create workflows that trigger based on rule results.
   - Set up automated notifications when entities change compliance levels.
   - Build self-service actions to remediate failed rules.
   - Integrate with external systems to sync scorecard data.

3. **Reports and Dashboards**
   - Build custom dashboards to visualize compliance across your organization.
   - Track progress of entities through different levels.
   - Generate reports on rule effectiveness and entity compliance.
   - Monitor trends in rule results over time.

## Overview

After enabling `scorecards as blueprints`, three new blueprints will be created in your [data model](https://app.getport.io/settings/data-model):
- `Scorecard` - Represents a collection of rules and levels for evaluating entities.
- `Rule` - Defines specific criteria for evaluation.
- `Rule Result` - Stores the evaluation results for each entity.

## Blueprint Structure

<Tabs groupId="scorecard-blueprint-structure" queryString values={[
{label: "Scorecard", value: "scorecard"},
{label: "Rule", value: "rule"},
{label: "Rule Result", value: "rule-result"},
]}>

<TabItem value="scorecard">

The `Scorecard` blueprint contains the following properties:
| Name | Type | Description |
|------|------|-------------|
| Blueprint | string (format: blueprints) | The target blueprint whose entities will be evaluated |
| Levels | array of objects | An array of levels with titles and colors (e.g., Bronze, Silver, Gold) |
| Filter | object | Optional query to filter which entities should be evaluated |
| Rules Tested | number ([aggregation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property)) | Number of rule evaluations performed |
| Rules Passed | number ([aggregation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property)) | Number of successful rule evaluations |
| % of Rules Passed | number ([calculation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property)) | Calculated percentage of passed rules |

Relations:
| Name | Target Blueprint | Required | Many | Description |
|------|-----------------|----------|-------|-------------|
| - | - | - | - | No default relations |

</TabItem>

<TabItem value="rule">

The `Rule` blueprint contains the following properties:
| Name | Type | Description |
|------|------|-------------|
| Level | string (enum) | The required level for this rule (must be one of the scorecard's defined levels) |
| Query | object | The evaluation criteria for entities |
| Rule Description | string | Optional explanation of the rule's logic |
| Entities Tested | number ([aggregation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property)) | Number of entities evaluated by this rule |
| Entities Passed | number ([aggregation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property)) | Number of entities that passed this rule |
| % of Entities Passed | number ([calculation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property)) | Calculated percentage of passed entities |

Relations:
| Name | Target Blueprint | Required | Many | Description |
|------|-----------------|----------|-------|-------------|
| scorecard | Scorecard | true | false | The scorecard this rule belongs to |

</TabItem>

<TabItem value="rule-result">

The `Rule result` blueprint contains the following properties:
| Name | Type | Description |
|------|------|-------------|
| Result | string (enum) | Whether the entity passed the rule ("Passed" or "Not passed") |
| Entity | string | The identifier of the evaluated entity |
| Result Last Change | string (date-time) | Timestamp of the last result change |
| Level | string (mirror) | Mirror property from the related rule |
| Scorecard | string (mirror) | Mirror property showing the parent scorecard title |
| Blueprint | string (mirror) | Mirror property showing the target blueprint |
| Entity Link | string (url) | Calculated URL to the evaluated entity |

Relations:
| Name | Target Blueprint | Required | Many | Description |
|------|-----------------|----------|-------|-------------|
| rule | Rule | true | false | The rule that generated this result |
| [Blueprint Identifier] | [Dynamic] | false | false | Automatically created relation to the target blueprint when a new scorecard is created |

:::info Dynamic Relations
When a new scorecard is created, Port automatically creates a relation in the Rule Result blueprint to the scorecard's target blueprint. For example, if you create a scorecard for the "service" blueprint, a new relation named "service" will be added to the Rule Result blueprint.
:::

</TabItem>
</Tabs>

## Important Notes

1. The scorecard blueprints are protected and their core structure cannot be modified:
   - Default properties cannot be changed or deleted.
   - Required relations cannot be modified.
   - The blueprints themselves cannot be deleted.

2. You can extend the blueprints with:
   - New properties.
   - New non-required relations.
   - Additional configurations that don't affect the core functionality.

3. Rule Results are automatically generated and managed by Port:
   - They cannot be created, deleted, or modified directly.
   - You can update the custom properties you created for the rule results.
   - Rule results are not searchable in the global search.
   - They are updated automatically when rules are evaluated.

## Validation Rules

The system enforces several validation rules to maintain data integrity:

1. Rule levels must match one of the levels defined in their parent scorecard.
2. Scorecard blueprint built-in relations cannot be renamed or modified.
3. Rule results maintain immutable core properties while allowing updates to custom properties.

## Scorecard automation examples

### Send a Slack/Teams message whenever a scorecard rule result is updated

#### Automation definition

By using the `ENTITY_UPDATED` trigger type, we can run custom logic whenever an entity of a specific type is updated.  

The following configuration will cause a message to be sent whenever a scorecard rule result is updated:

<details>
<summary><b>Automation configuration (Click to expand)</b></summary>

**Remember to change `github-org-name` and `github-repo-name` to your GitHub organization name and repository in the highlighted lines.**

```json showLineNumbers
{
"identifier": "ruleResultUpdated",
"title": "Rule result updated",
"trigger": {
    "type": "automation",
    "event": {
    "type": "ENTITY_UPDATED",
    "blueprintIdentifier": "_rule_result"
    }
},
"invocationMethod": {
    "type": "GITHUB",
    # highlight-start
    "org": "github-org-name",
    "repo": "github-repo-name",
    # highlight-end
    "workflow": "notify-rule-result-updated.yaml",
    "workflowInputs": {
    "rule_result_name": "{{ .event.context.entityIdentifier }}",
    "entity_link": "{{ .event.diff.after.properties.entity_link }}"
    },
    "reportWorkflowStatus": true
},
"publish": true
}
```
</details>

* `invocationMethod.workflowInputs` is the payload to be passed to the GitHub workflow upon every execution. In this example, we pass the rule result's identifier and the link to the evaluated entity.

* `invocationMethod.reportWorkflowStatus` is set to `true` to automatically update the action run in Port with the status of the GitHub workflow.

#### Backend - GitHub workflow

The `notify-rule-result-updated.yaml` workflow will contain the logic to send a Slack/Teams message.

<h4>Prerequisite - set up webhooks</h4>

The workflow requires a Slack webhook URL and/or a Microsoft Teams webhook URL to send the message.  

Slack:
1. To set up a Slack webhook, follow the instructions [here](https://api.slack.com/messaging/webhooks).
2. Once you have the webhook URL, add it as a secret in your GitHub repository named `SLACK_WEBHOOK_URL`.

Microsoft Teams:
1. To set up a Microsoft Teams webhook, follow the instructions [here](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook).
2. Once you have the webhook URL, add it as a secret in your GitHub repository named `TEAMS_WEBHOOK_URL`.

<details>
<summary><b>GitHub workflow (Click to expand)</b></summary>

**📝 Important:**  
This workflow includes steps to send a message via **Slack** and **Microsoft Teams**.  
**Use only the step(s) that apply to your use case.**

```yaml showLineNumbers title="notify-rule-result-updated.yaml"
name: Notify when rule result is updated

on:
  workflow_dispatch:
    inputs:
      # Note that the inputs are the same as the payload (workflowInputs) defined in the automation
      rule_result_name:
        description: "The rule result's name"
        required: true
        type: string
      entity_link:
        description: "A link to the evaluated entity"
        required: true
        type: string

jobs:
  send_message:
    runs-on: ubuntu-latest
    steps:
      - name: Send message to Slack
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          curl -X POST -H 'Content-type: application/json' --data '{"text":"The rule result ${{ inputs.rule_result_name }} has been updated. See evaluated entity: https://app.port.io${{ inputs.entity_link }}"}' $SLACK_WEBHOOK_URL
      
      - name: Send message to Microsoft Teams
        env:
          TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
        run: |
          curl -H 'Content-Type: application/json' -d '{"text":"The rule result ${{ inputs.rule_result_name }} has been updated. See evaluated entity: https://app.port.io${{ inputs.entity_link }}"}' $TEAMS_WEBHOOK_URL
```
</details>

---

### Create a GitHub issue whenever a scorecard rule result is degraded

#### Automation definition

By using the `ENTITY_UPDATED` trigger type, we can run custom logic whenever an entity of a specific type is updated.  

The following configuration will create a GitHub issue whenever a scorecard rule result's `Result` property changes from `Passed` to `Not passed`:

<details>
<summary><b>Automation configuration (Click to expand)</b></summary>

**Remember to change `github-org-name` and `github-repo-name` to your GitHub organization name and repository in the highlighted lines.**

```json showLineNumbers
{
  "identifier": "ruleResultDegraded",
  "title": "Rule result degraded",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "_rule_result"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.before.properties.result == \"Passed\"",
        ".diff.after.properties.result == \"Not passed\""
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "GITHUB",
    # highlight-start    
    "org": "github-org-name",
    "repo": "github-repo-name",
    # highlight-end
    "workflow": "create-issue-on-rule-degradation.yaml",
    "workflowInputs": {
      "rule_result_name": "{{ .event.context.entityIdentifier }}",
      "entity_link": "{{ .event.diff.after.properties.entity_link }}"
    },
    "reportWorkflowStatus": true
  },
  "publish": true
}
```
</details>

* `trigger.condition` checks the rule result's `Result` property before and after the update. The automation will only run for rule results that have been degraded.

* `invocationMethod.workflowInputs` is the payload to be passed to the GitHub workflow upon every execution. In this example, we pass the rule result's identifier and the link to the evaluated entity.

* `invocationMethod.reportWorkflowStatus` is set to `true` to automatically update the action run in Port with the status of the GitHub workflow.

#### Backend - GitHub workflow

The `create-issue-on-rule-degradation.yaml` workflow will contain the logic to create a GitHub issue.

<details>
<summary><b>GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers title="create-issue-on-rule-degradation.yaml"
name: Create issue when rule is degraded

on:
  workflow_dispatch:
    inputs:
      # Note that the inputs are the same as the payload (workflowInputs) defined in the automation
      rule_result_name:
        description: 'The rule result name'
        required: true
        type: string
      entity_link:
        description: 'A link to the evaluated entity'
        required: true
        type: string

# Grant write access to issues so the workflow can create them
permissions:
  contents: read
  issues: write

jobs:
  send_message:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: create an issue
      uses: dacbd/create-issue-action@main
      with:
        token: ${{ github.token }}
        # By default, the issue will be created in the same repository as the workflow
        repo: ${{ github.context.repo.repo}}
        title: '${{ inputs.rule_result_name }} - degraded rule result'
        body: |
          The rule result ${{ inputs.rule_result_name }} has been degraded.
          See evaluated entity: https://app.port.io${{ inputs.entity_link }}
```
</details>
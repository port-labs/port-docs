
import SetupWebhookTip from "/docs/actions-and-automations/templates/_setup_webhooks_slack_teams.md"

# Scorecard automation examples

## Send a Slack/Teams message whenever a scorecard rule result is **updated**

### Automation definition

By using the `ENTITY_UPDATED` trigger type, we can run custom logic whenever an entity of a specific type is updated.  

The following configuration will cause a message to be sent whenever a scorecard rule result is updated:

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
    "org": "github-org-name",
    "repo": "github-repo-name",
    "workflow": "notify-rule-result-updated.yaml",
    "workflowInputs": {
      "rule_result_name": "{{ .event.context.entityIdentifier }}",
      "entity_link": "{{ .event.after.properties.entity_link }}"
    },
    "reportWorkflowStatus": true
  },
  "publish": true
}
```

* `invocationMethod.workflowInputs` is the payload to be passed to the GitHub workflow upon every execution. In this example, we pass the rule result's identifier and the link to the evaluated entity.

* `invocationMethod.reportWorkflowStatus` is set to `true` to automatically update the action run in Port with the status of the GitHub workflow.

### Backend - GitHub workflow

The `notify-rule-result-updated.yaml` workflow will contain the logic to send a Slack/Teams message.

<SetupWebhookTip />

```yaml showLineNumbers title="notify-rule-result-updated.yaml"
name: Notify when rule result is updated

on:
  workflow_dispatch:
    inputs:
      # Note that the inputs are the same as the payload (workflowInputs) defined in the automation
      rule_result_name:
        description: 'The rule result's name'
        required: true
        type: string
      entity_link:
        description: 'A link to the evaluated entity'
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
          curl -X POST -H 'Content-type: application/json' --data '{"text":"The rule result ${{ inputs.rule_result_name }} has been updated. See evaluated entity: ${{ inputs.entity_link }}"}' $SLACK_WEBHOOK_URL
      
      - name: Send message to Microsoft Teams
        env:
          TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
        run: |
          curl -H 'Content-Type: application/json' -d '{"text":"The rule result ${{ inputs.rule_result_name }} has been updated. See evaluated entity: ${{ inputs.entity_link }}"}' $TEAMS_WEBHOOK_URL
```

---

## Create a GitHub issue whenever a scorecard rule result is **degraded**

### Automation definition

By using the `ENTITY_UPDATED` trigger type, we can run custom logic whenever an entity of a specific type is updated.  

The following configuration will create a GitHub issue whenever a scorecard rule result's `Passed` property changes from `Passed` to `Not passed`:

```json showLineNumbers
{
  "identifier": "ruleResultUpdated",
  "title": "Rule result updated",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "_rule_result"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.before.properties.passed == \"Passed\"",
        ".diff.after.properties.passed == \"Not passed\""
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "github-org-name",
    "repo": "github-repo-name",
    "workflow": "create-issue-on-rule-degradation.yaml",
    "workflowInputs": {
      "rule_result_name": "{{ .event.context.entityIdentifier }}",
      "entity_link": "{{ .event.after.properties.entity_link }}"
    },
    "reportWorkflowStatus": true
  },
  "publish": true
}
```

* `trigger.condition` checks the rule result's "passed" property before and after the update. The automation will only run for rule results that have been degraded.

* `invocationMethod.workflowInputs` is the payload to be passed to the GitHub workflow upon every execution. In this example, we pass the rule result's identifier and the link to the evaluated entity.

* `invocationMethod.reportWorkflowStatus` is set to `true` to automatically update the action run in Port with the status of the GitHub workflow.

### Backend - GitHub workflow

The `create-issue-on-rule-degradation.yaml` workflow will contain the logic to create a GitHub issue.

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
          See evaluated entity: ${{ inputs.entity_link }}
```
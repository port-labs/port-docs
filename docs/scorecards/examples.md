---
sidebar_position: 4
---

# Examples


### Ownership scorecard

The following example demonstrates an ownership scorecard.

It has one filter defined:

- Only evaluate entities that are related to production (indicated by checking that the `is_production` property is set to `true`).

It has two rules:

- Check that a defined on-call exists and that the number of `open_incidents` is lower than 5.
- Check if a team exists.

<details>
<summary><b>Ownership scorecard definition (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "ownership",
  "title": "Ownership",
  "filter": {
      "combinator": "and",
      "conditions": [
        {
          "property": "is_production",
          "operator": "=",
          "value": true
        }
      ]
    },
  "rules": [
      {
        "title": "Has on call?",
        "identifier": "has_on_call",
        "level": "Gold",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "operator": "isNotEmpty",
              "property": "on_call"
            },
            {
              "operator": "<",
              "property": "open_incidents",
              "value": 5
            }
          ]
        }
      },
      {
        "title": "Has a team?",
        "identifier": "has_team",
        "level": "Silver",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "operator": "isNotEmpty",
              "relation": "team"
            }
          ]
        }
      }
  ],
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
  ]
}
```
</details>
___

### Ensure relation existence

Say we have a `service` blueprint that has a relation to another blueprint named `domain`.  
We can define a scorecard that checks that all of our services have a related domain. Services with empty `domain` relations will fail this check:

<details>
<summary><b>Ensure relation existence scorecard definition (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "domain_definition",
  "title": "Domain definition",
  "rules": [
    {
      "identifier": "hasDomain",
      "title": "Has domain",
      "level": "Bronze",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": "isNotEmpty",
            "relation": "domain"
          }
        ]
      }
    }
  ],
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
  ]
}
```
</details>

___

### DORA metrics based on number of deployments

To assess the deployment frequency of a `service`, simply checking the `deployment` relation is not enough — we need to know the exact number of deployments. To achieve this, we can:

- Add an [aggregation property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property.md) to the `service` blueprint that counts the number of related `deployment` entities.
- Add a scorecard with a rule based on the new aggregation property:

<details>
<summary><b>DORA metrics scorecard definition (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "dora_metrics",
  "title": "DORA Metrics",
  "rules": [
    {
      "identifier": "deployFreqBronze",
      "title": "Deployment frequency > 2",
      "level": "Bronze",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": ">",
            "property": "deployment_frequency",
            "value": 3
          }
        ]
      }
    },
    {
      "identifier": "deployFreqSilver",
      "title": "Deployment frequency > 4",
      "level": "Silver",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": ">",
            "property": "deployment_frequency",
            "value": 4
          }
        ]
      }
    }
  ],
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
  ]
}
```
</details>

___

## Automation examples

### Send a Slack/Teams message whenever a scorecard rule result is updated

#### Automation definition

By using the `ENTITY_UPDATED` trigger type, we can run custom logic whenever an entity of a specific type is updated.  

The following configuration will cause a message to be sent whenever a scorecard rule result is updated:

<details>
<summary><b>Automation configuration (click to expand)</b></summary>

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
<summary><b>GitHub workflow (click to expand)</b></summary>

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
<summary><b>Automation configuration (click to expand)</b></summary>

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
<summary><b>GitHub workflow (click to expand)</b></summary>

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
---
sidebar_position: 11
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Create Surveys

This guide is designed to help you implement and manage a complete survey experience within your organization using Port.  
With surveys, you can collect structured feedback, track user responses, and visualize the results on a custom dashboard.  In this guide, you'll build the core components: blueprints for surveys, questions, and responses; a webhook datasource to capture survey data; a self-service action for survey participation; and a dashboard to monitor your survey metrics.

## Prerequisites

- Complete the [Port onboarding process](https://docs.getport.io/quickstart)
- Admin access to your Port environment
- Basic understanding of Port's [data model concepts](/build-your-software-catalog/customize-integrations/configure-data-model)

## Setting up the data model

First, let's create the necessary blueprints to store survey data. We'll create three blueprints: Survey, Question, and Response.

### Survey Blueprint

1. Navigate to your [Port Builder](https://app.getport.io/settings/data-model) page
2. Click the `+ Blueprint` button to create a new blueprint
3. Name it `Survey` and add the schema below:

<details>
<summary><b>Survey blueprint (click to expand)</b></summary>

```json
{
  "identifier": "survey",
  "title": "Survey",
  "icon": "Bar",
  "schema": {
    "properties": {
      "title": {
        "type": "string",
        "title": "Title"
      },
      "description": {
        "type": "string",
        "title": "Description",
        "format": "markdown"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```
</details>

### Question Blueprint

Create another blueprint for survey questions:

<details>
<summary><b>Question blueprint (click to expand)</b></summary>

```json
{
  "identifier": "question",
  "title": "Question",
  "icon": "Bulb",
  "schema": {
    "properties": {
      "numeric_question": {
        "type": "boolean",
        "title": "Numeric Question"
      }
    },
    "required": [
      "numeric_question"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {
    "avg_score_scorecard": {
      "title": "Avg Score - Scorecard",
      "icon": "DefaultProperty",
      "calculation": "if (.properties.avg_score == null) then null else if (.properties.avg_score < 3) then \"low\" elif (.properties.avg_score <= 4) then \"medium\" else \"high\" end end",
      "type": "string",
      "colorized": true,
      "colors": {
        "low": "red",
        "medium": "yellow",
        "high": "green"
      }
    }
  },
  "aggregationProperties": {
    "avg_score": {
      "title": "Avg Score",
      "icon": "DefaultProperty",
      "type": "number",
      "target": "response",
      "calculationSpec": {
        "func": "average",
        "averageOf": "total",
        "property": "numeric_value",
        "measureTimeBy": "$createdAt",
        "calculationBy": "property"
      }
    }
  },
  "relations": {
    "survey": {
      "title": "Survey",
      "target": "survey",
      "required": false,
      "many": false
    }
  }
}
```
</details>

### Response Blueprint

Finally, create a blueprint for survey responses:

<details>
<summary><b>Response blueprint (click to expand)</b></summary>

```json
{
  "identifier": "response",
  "title": "Response",
  "icon": "Register",
  "schema": {
    "properties": {
      "value": {
        "icon": "DefaultProperty",
        "type": "string",
        "title": "Answer"
      }
    },
    "required": []
  },
  "mirrorProperties": {
    "team": {
      "title": "Team",
      "path": "user.$team.$identifier"
    },
    "avg_score": {
      "title": "Avg Score",
      "path": "question.avg_score"
    }
  },
  "calculationProperties": {
    "numeric_value": {
      "title": "Numeric Value",
      "icon": "DefaultProperty",
      "calculation": ".properties.value | (tonumber // null)",
      "type": "number"
    }
  },
  "aggregationProperties": {},
  "relations": {
    "user": {
      "title": "User",
      "target": "_user",
      "required": false,
      "many": false
    },
    "question": {
      "title": "Question",
      "target": "question",
      "required": false,
      "many": false
    }
  }
}
```
</details>

## Creating a webhook datasource

To capture survey responses, we'll set up a webhook datasource:

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page
2. Click `+ Data Source`
3. Select `Webhook`
4. Select `Custom Integration`
5. Title it `Calculate Survey Response`
6. Configure the webhook with the following mapping:

<details>
<summary><b>Webhook configuration (click to expand)</b></summary>

```json
[
  {
    "blueprint": "question",
    "operation": "create",
    "filter": "true",
    "itemsToParse": ".body.responses",
    "entity": {
      "identifier": ".item.key",
      "title": ".item.key",
      "properties": {
        "numeric_question": ".item.value | type == \"number\""
      },
      "relations": {
        "survey": ".body.port_context.actionId"
      }
    }
  },
  {
    "blueprint": "response",
    "operation": "create",
    "filter": "true",
    "itemsToParse": ".body.responses",
    "entity": {
      "identifier": "[.headers.run_id, .item.key, .item.value] | join(\"_\") | gsub(\" |/|,|\\\\.|\\\\(|\\\\)\"; \"\")",
      "title": "[.headers.run_id, .item.key, .item.value] | join(\" \") | gsub(\" |/|,|\\\\.|\\\\(|\\\\)\"; \"\")",
      "properties": {
        "value": ".item.value"
      },
      "relations": {
        "question": ".item.key",
        "user": ".body.port_context.user"
      }
    }
  }
]
```
</details>

:::note Webhook URL
Make sure to copy and save the webhook URL - you'll need it when configuring the survey action in the next section.
:::

## Setting up the survey action

Now let's create an action that allows users to submit survey responses:

1. Go to the [Self Service Actions](https://app.getport.io/actions) page
2. Click `+ Action`
3. Select `Create Entity`
4. Configure the action:

:::note Webhook URL
Make sure to replace the example URL (`https://example.com`) with the webhook URL you saved from the previous step.
:::

<details>
<summary><b>Survey action configuration (click to expand)</b></summary>

```json
{
  "identifier": "answer_example_survey",
  "title": "Answer Example Survey",
  "icon": "Chat",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "how_would_you_rate_this_rating": {
          "type": "number",
          "title": "Example Rating Question (0-5)",
          "enum": [
            5,
            4,
            3,
            2,
            1,
            0
          ],
          "enumColors": {
            "0": "lightGray",
            "1": "red",
            "2": "orange",
            "3": "yellow",
            "4": "blue",
            "5": "green"
          }
        },
        "select_from_options": {
          "type": "string",
          "title": "Example Selection Question",
          "enum": [
            "Option A",
            "Option B",
            "Option C",
            "Option D"
          ]
        },
        "what_do_you_think_on_this_open": {
          "type": "string",
          "title": "Example Open-Ended Question"
        }
      },
      "required": [],
      "steps": [
        {
          "title": "First Step",
          "order": [
            "how_would_you_rate_this_rating",
            "select_from_options"
          ]
        },
        {
          "title": "Second Step",
          "order": [
            "what_do_you_think_on_this_open"
          ]
        }
      ]
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://example.com",
    "agent": false,
    "synchronized": true,
    "method": "POST",
    "headers": {
      "RUN_ID": "{{ .run.id }}"
    },
    "body": {
      "responses": "{{ .inputs | to_entries | map( if (.value | type) == \"array\" then (. as {key: $k, value: $vals} | $vals | map({\"key\": $k, \"value\": .})) else {\"key\": .key, \"value\": .value} end ) | flatten }}",
      "port_context": {
        "runId": "{{ .run.id }}",
        "actionId": "{{.action.identifier}}",
        "user": "{{.trigger.by.user.email}}"
      }
    }
  },
  "requiredApproval": false
}
```
</details>

## Creating a dashboard

Let's create a dashboard to visualize survey data:

1. Go to your [software catalog](https://app.getport.io/organization/catalog)
2. Click on the `+ New` button in the left sidebar
3. Select `New dashboard`
4. Name it "Survey Analytics"

Add these widgets to track survey metrics:

<details>
<summary><b>Action History Widget</b></summary>
1. Click `+ Widget` and select `Action History`
2. Click on the "Survey Response" self-service action we just created
3. Configure columns:
   - Hide all meta properties 
   - Reorder columns:
     1. Start Time
     2. Port User Info
     3. All survey question columns

![Survey Dashboard Example](/img/guides/survey-responses-dashboard-example.png)
</details>

:::note
For better tracking, we recommend creating these widgets in the Question blueprint as well. This will allow you to view the metrics for individual questions when viewing their entity pages.
:::


<details>
<summary><b>Avg. Score Widget</b></summary>

1. Click `+ Widget` and select `Number Chart`
2. Configure as follows:
   - Title: "&#123;selected question&#125; Avg. Score"
   - Chart Type: Display single property
   - Blueprint: Question (can be omitted if configuring on the question entity page)
   - Entity: The specific question you want to track (can be omitted if configuring on the question entity page)
   - Property: Avg Score
   
This widget displays the average score calculated from all responses for the chosen question

![Avg Score Widget](/img/guides/avgScoreWidget.png)

</details>

<details>
<summary><b>Response distribution widget</b></summary>

1. Click `+ Widget` and select `Pie chart`
2. Configure as follows:
   - Title: "&#123;selected question&#125; distribution"
   - Blueprint: Response
   - Breakdown by property: Answer
   - Additional filters: 
   ```json
   {
     "combinator": "and",
     "rules": [
       {
         "operator": "relatedTo",
         "blueprint": "question",
         "value": "{question_identifier}"
       },
       {
         "operator": "=",
         "value": "response",
         "property": "$blueprint"
       }
     ]
   }
   ```

This widget shows the distribution of answers across all responses for the selected question.

![Answer Distribution Widget](/img/guides/answerDistributionWidget.png)
</details>

<details>
<summary><b>Response timeline visualization</b></summary>

1. Click `+ Widget` and select `Line Chart`
2. Configure as follows:
   - Title: "&#123;specific_question&#125; over time"
   - Blueprint: Question (can be omitted if configuring on the question entity page)
   - Entity: &#123;specific_question&#125; (can be omitted if configuring on the question entity page)
   - Propeties: Avg Score
   - Time Interval: Your desired time interval
   - Time Range: Your desired time range

This widget shows the average score for the selected question over time.

</details>

## Troubleshooting

Common issues and solutions:

1. **Webhook not receiving data**:
   - Verify webhook URL is correct
   - Validate payload format

2. **Action execution fails**:
   - Confirm all required fields are filled
   - Ensure the webhook URL is properly configured
   - Make sure the action body is properly configured

Congrats 🎉 You have successfully set up surveys in your portal!

---
sidebar_position: 11
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Create Surveys

This guide is designed to help you implement and manage a complete survey experience within your organization using Port.  

With surveys, you can collect structured feedback, track user responses, and visualize the results in a custom dashboard.  
This guide will help you build the core components:
- Blueprints for surveys, questions, and responses.
- A webhook datasource to capture survey data.
- A self-service action for survey participation.
- A dashboard to monitor your survey metrics.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Admin access to your Port organization.
- Basic understanding of Port's [data model concepts](/build-your-software-catalog/customize-integrations/configure-data-model).

## Set up the data model

First, let's create the necessary blueprints to model our survey data.  
We'll create three blueprints: `Survey`, `Question`, and `Response`.

To create the blueprints:
1. Navigate to the [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Click on the `+ Blueprint` button.

3. Click on the `Edit JSON` button.

4. Copy the relevant blueprint JSON from the guide and paste it into the editor.

5. Click `Save`.

### Survey blueprint

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

### Question blueprint

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

### Response blueprint

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

## Create a webhook datasource

To capture survey responses, we'll set up a webhook datasource:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.

2. Click on the `+ Data Source` button.

3. Select `Webhook`.

4. Select `Custom Integration`.

5. For the title, enter `Calculate survey response`, then click `Next`.

6. In section 3 (mapping configuration), copy & paste the following mapping:

    <details>
    <summary><b>Webhook configuration (click to expand)</b></summary>

    The following mapping configuration defines how to handle incoming data, specifying which piece of data to map to which property on the relevant entity.

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

    :::tip Webhook URL
    Make sure to copy and save the webhook URL - you will need it when configuring the survey action in the next section.
    :::

## Set up a survey action

Now let's create an action that allows users to submit survey responses:

1. Go to the [self-service](https://app.getport.io/actions) page of your portal.

2. Click on the `+ Action` button.

3. Click on the `Edit JSON` button.

4. Copy & paste the action configuration below, then click on `Save`.

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

    :::tip Webhook URL
    Make sure to replace the example URL (`https://example.com`) with the webhook URL you saved from the previous step.
    :::

## Create a dashboard

First, let's create a dedicated dashboard for our survey data:

1. Go to your [software catalog](https://app.getport.io/organization/catalog).

2. Click on the `+ New` button in the left sidebar.

3. Select `New dashboard`.

4. Name it "Survey Analytics".

Next, let's add some widgets to visualize survey metrics.  

Go to the dashboard you just created, then create widgets as described below (expand each widget's details to see the instructions).

<details>
<summary><b>Action history widget</b></summary>
1. Click on the `+ Widget` button and select `Action History`.

2. For the `Action` property, select the "Survey Response" action we just created.

3. Customize the widget as you see fit, by hiding columns/filtering/sorting.

<img src="/img/guides/survey-responses-dashboard-example.png" border='1px' />

</details>




<details>
<summary><b>Average score widget</b></summary>

1. Click on the `+ Widget` button and select `Number Chart`.

2. Configure the widget as follows:
   - **Title**: "\{selected question\} Avg. Score"
   
   - **Chart Type**: Display single property
   
   - **Blueprint**: Question (can be omitted if configuring on the question entity page)
   
   - **Entity**: The specific question you want to track (can be omitted if configuring on the question entity page)
   
   - **Property**: Avg Score
   
This widget displays the average score calculated from all responses for the chosen question:

<img src="/img/guides/AvgScoreWidget.png" width="50%" border='1px' />

</details>

<details>
<summary><b>Response distribution widget</b></summary>

1. Click on the `+ Widget` button and select `Pie chart`.

2. Configure the widget as follows:
   - **Title**: "\{selected question\} distribution"
   
   - **Blueprint**: Response
   
   - **Breakdown by property**: Answer
   
   - **Additional filters**: 
   
      ```json showLineNumbers
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

This widget shows the distribution of answers across all responses for the selected question:

<img src="/img/guides/AnswerDistributionWidget.png" width="50%" border='1px' />

</details>

<details>
<summary><b>Response timeline visualization</b></summary>
1. Click on the `+ Widget` button and select `Line Chart`.

2. Configure the widget as follows:
   - **Title**: "\{specific_question\} over time"
   
   - **Blueprint**: Question (can be omitted if configuring on the question entity page)
   
   - **Entity**: \{specific_question\} (can be omitted if configuring on the question entity page)
   
   - **Property**: Avg Score
   
   - **Time Interval**: Your desired time interval
   
   - **Time Range**: Your desired time range

This widget shows the average score for the selected question over time.

</details>

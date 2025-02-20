---
sidebar_position: 11
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Create surveys in your portal

This guide is designed to help you implement and manage a complete survey experience within your organization using Port.  

With surveys, you can collect structured feedback, track user responses, and visualize the results in a custom dashboard.  
In this guide, we will build the core components:
- **Blueprints** for surveys, questions, and responses.
- A **webhook datasource** to capture survey data.
- A **self-service action** for survey participation.
- A **dashboard** to monitor survey metrics.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Admin access to your Port environment.

## Set up the data model

First, let's create the necessary blueprints to store survey data.  
We will create several blueprints: `Survey Template`, `Survey`, `Question`, `Question Template`, and `Response`.

### Survey template blueprint

1. Navigate to your [Port Builder](https://app.getport.io/settings/data-model) page.

2. Click the `+ Blueprint` button to create a new blueprint.

3. Click on the `Edit JSON` button.

4. Copy the definition below and paste it in the editor:

    <details>
    <summary><b>Survey Template blueprint (click to expand)</b></summary>

    ```json
    {
      "identifier": "survey_template",
      "title": "Survey Template",
      "icon": "GroupBy",
      "schema": {
        "properties": {
          "description": {
            "type": "string",
            "title": "Description"
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

### Survey blueprint

Create a blueprint for survey:

<details>
<summary><b>Survey blueprint (click to expand)</b></summary>

```json
{
  "identifier": "survey",
  "title": "Survey",
  "icon": "Bar",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description",
        "format": "markdown"
      },
      "version": {
        "icon": "DefaultProperty",
        "type": "string",
        "title": "Version"
      },
      "start_date": {
        "type": "string",
        "title": "Start date",
        "format": "date-time"
      },
      "end_date": {
        "type": "string",
        "title": "End date",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "survey_template": {
      "title": "Survey Template",
      "target": "survey_template",
      "required": false,
      "many": false
    }
  }
}
```
</details>

### Question template blueprint

Create a blueprint for question templates:

<details>
<summary><b>Question Template blueprint (click to expand)</b></summary>

```json
{
  "identifier": "question_template",
  "title": "Question Template",
  "icon": "Template",
  "schema": {
    "properties": {
      "numeric_question": {
        "type": "boolean",
        "title": "Numeric Question"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "survey_template": {
      "title": "Survey Template",
      "target": "survey_template",
      "required": false,
      "many": false
    }
  }
}
```
</details>

### Question blueprint

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
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "question_template": {
      "title": "Question Template",
      "target": "question_template",
      "required": false,
      "many": false
    },
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
    "question_template_identifier": {
      "title": "Question Template Identifier",
      "path": "question.question_template.$identifier"
    },
    "survey_title": {
      "title": "Survey Title",
      "path": "question.survey.$title"
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
    "current_team": {
      "title": "Current Team",
      "target": "_team",
      "required": false,
      "many": true
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

## Add calculation and aggregation properties

Now that we have our basic blueprints set up, let's add [calculation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property) and [aggregation](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property) properties to enable advanced metrics and analytics for our surveys.

### Add score tracking to question template

Go to the [builder page](https://app.getport.io/settings/data-model), find and expand the `Question Template` blueprint.  

Click on the `...` button and select `Edit blueprint`, then click on the `Edit JSON` button.  

1. Let's add a calculation property to create a scorecard based on average scores.  
   Under the `calculationProperties` key, paste the following JSON:

    ```json showLineNumbers
    "calculationProperties": {
      "avg_score_scorecard": {
        "title": "Score Standards",
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
    }
    ```

    This calculation property creates a color-coded scorecard that categorizes average scores into three levels:
    - Low (red): scores below 3
    - Medium (yellow): scores between 3 and 4
    - High (green): scores above 4

2. Let's add an aggregation property to calculate the average score from responses.  
   Under the `aggregationProperties` key, paste the following JSON:

    ```json showLineNumbers
    "aggregationProperties": {
      "avg_score": {
        "title": "Avg. Score",
        "type": "number",
        "target": "response",
        "calculationSpec": {
          "func": "average",
          "averageOf": "total",
          "property": "numeric_value",
          "calculationBy": "property",
          "measureTimeBy": "$createdAt"
        }
      }
    }
    ```

    This aggregation property:
    - Calculates the average of all numeric responses
    - Uses the `numeric_value` from responses
    - Updates in real-time as new responses are submitted

### Add score tracking to question

Go to the [builder page](https://app.getport.io/settings/data-model), find and expand the `Question` blueprint.  

Click on the `...` button and select `Edit blueprint`, then click on the `Edit JSON` button.  

1. Under the `calculationProperties` key, paste the following JSON:

    ```json showLineNumbers
    "calculationProperties": {
      "avg_score_scorecard": {
        "title": "Score Standards",
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
    }
    ```

2. Under the `aggregationProperties` key, paste the following JSON:

    ```json showLineNumbers
    "aggregationProperties": {
      "avg_score": {
        "title": "Avg. Score",
        "icon": "DefaultProperty",
        "type": "number",
        "target": "response",
        "calculationSpec": {
          "func": "average",
          "averageOf": "total",
          "property": "numeric_value",
          "calculationBy": "property",
          "measureTimeBy": "$createdAt"
        }
      }
    }
    ```

### Add mirror properties to response

Go to the [builder page](https://app.getport.io/settings/data-model), find and expand the `Response` blueprint.  

Click on the `...` button and select `Edit blueprint`, then click on the `Edit JSON` button.  

Under the `mirrorProperties` key, paste the following JSON:

```json showLineNumbers
"mirrorProperties": {
  "avg_score": {
    "title": "Avg Score",
    "path": "question.avg_score"
  }
}
```

This [mirror property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/mirror-property) allows responses to reflect the average score from their related questions, providing easy access to this metric at the response level.

## Create a webhook datasource

To capture survey responses, let's set up a webhook datasource:

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page of your portal.

2. Click `+ Data Source`.

3. Select `Webhook`.

4. Select `Custom Integration`.

5. Title it `Calculate Survey Response`.

6. Configure the webhook with the following mapping:

    <details>
    <summary><b>Webhook configuration (click to expand)</b></summary>

    ```json showLineNumbers
    [
      {
        "blueprint": "survey_template",
        "operation": "create",
        "filter": "true",
        "entity": {
          "identifier": ".body.port_context.actionId",
          "title": ".body.port_context.actionId"
        }
      },
      {
        "blueprint": "survey",
        "operation": "create",
        "filter": "true",
        "entity": {
          "identifier": "[(.body.port_context.actionId | ascii_downcase | gsub(\" \"; \"_\")), (.body.port_context.version | ascii_downcase | gsub(\" \"; \"_\"))] | join(\"_\")",
          "title": "[.body.port_context.actionId, .body.port_context.version] | join(\" \")",
          "properties": {
            "version": ".body.port_context.version"
          },
          "relations": {
            "survey_template": ".body.port_context.actionId"
          }
        }
      },
      {
        "blueprint": "question",
        "operation": "create",
        "itemsToParse": ".body.responses",
        "entity": {
          "identifier": "[.item.key,(.body.port_context.actionId | ascii_downcase | gsub(\" \"; \"_\")), (.body.port_context.version | ascii_downcase | gsub(\" \"; \"_\"))] | join (\"_\")",
          "title": "[.item.key,(.body.port_context.actionId | ascii_downcase | gsub(\" \"; \"_\")), (.body.port_context.version | ascii_downcase | gsub(\" \"; \"_\"))] | join (\"_\")",
          "properties": {
            "numeric_question": ".item.value | type == \"number\""
          },
          "relations": {
            "question_template": ".item.key",
            "survey": "[(.body.port_context.actionId | ascii_downcase | gsub(\" \"; \"_\")), (.body.port_context.version | ascii_downcase | gsub(\" \"; \"_\"))] | join(\"_\")"
          }
        }
      },
      {
        "blueprint": "question_template",
        "operation": "create",
        "itemsToParse": ".body.responses",
        "entity": {
          "identifier": ".item.key",
          "title": ".item.key",
          "properties": {
            "numeric_question": ".item.value | type == \"number\""
          },
          "relations": {
            "survey_template": "(.body.port_context.actionId | ascii_downcase | gsub(\" \"; \"_\"))"
          }
        }
      },
      {
        "blueprint": "response",
        "operation": "create",
        "itemsToParse": ".body.responses",
        "entity": {
          "identifier": "[.headers.run_id, .item.key, .item.value] | join(\"_\") | gsub(\" |/|,|\\\\.|\\\\(|\\\\)\"; \"\")",
          "title": "[.headers.run_id, .item.key, .item.value] | join(\" \") | gsub(\" |/|,|\\\\.|\\\\(|\\\\)\"; \"\")",
          "properties": {
            "value": ".item.value"
          },
          "relations": {
            "question": "[.item.key,(.body.port_context.actionId | ascii_downcase | gsub(\" \"; \"_\")), (.body.port_context.version | ascii_downcase | gsub(\" \"; \"_\"))] | join (\"_\")",
            "user": ".body.port_context.user",
            "current_team": ".body.port_context.teams"
          }
        }
      }
    ]
    ```
    </details>

    :::tip Webhook URL
    Make sure to copy and save the webhook URL - you'll need it when configuring the survey action in the next section.
    :::

## Understanding survey versions

The `version` property in the survey configuration enables you to run the same survey multiple times and track responses over time. This is particularly useful for:

- Running periodic surveys (e.g., quarterly developer satisfaction surveys).
- Comparing results across different time periods.
- Tracking trends and improvements.

When you create a new instance of a survey:
1. The survey template remains the same.
2. A new survey entity is created with a unique version (e.g., "Q1 2024", "Q2 2024").
3. All responses are linked to this specific version.
4. The aggregation properties will show metrics both per version and across all versions.

For example, you can:
- Compare average scores between Q1 and Q2.
- Track improvement trends over multiple quarters.
- View combined statistics across all versions of the survey.

The distinction between Question Templates and Questions is similar:
- Question Templates define the base structure of questions that can be reused across different survey versions.
- Questions are specific instances of these templates, linked to a particular survey version.
- This allows you to track responses to the same question across different survey versions while maintaining the connection to the original template.

:::tip
Use a consistent versioning format (e.g., "Q1 2024", "Q2 2024") to make it easier to organize and compare survey results.
:::

## Set up a survey action

Now let's create an action that allows users to submit survey responses:

1. Go to the [Self Service Actions](https://app.getport.io/actions) page of your portal.

2. Click `+ Action` button to create a new action.

3. Click on the `Edit JSON` button.

4. Copy the configuration below and paste it in the editor:

    <details>
    <summary><b>Survey action configuration (click to expand)</b></summary>

    Make sure to replace the example URL (`https://example.com`) with the webhook URL from the previous step.
    ```json showLineNumbers
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
            },
            "version": {
              "title": "Version",
              "icon": "DefaultProperty",
              "type": "string",
              "default": "Q1 2025",
              "visible": false
            },
            "user": {
              "type": "string",
              "title": "user",
              "blueprint": "_user",
              "format": "entity",
              "default": {
                "jqQuery": ".user.email"
              },
              "visible": false
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
                "what_do_you_think_on_this_open",
                "version",
                "user"
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
          "responses": "{{ .inputs | del(.[\"user\"]) | to_entries | map( if (.value | type) == \"array\" then (. as {key: $k, value: $vals} | $vals | map({\"key\": $k, \"value\": .})) else {\"key\": .key, \"value\": .value} end ) | flatten }}",
          "port_context": {
            "runId": "{{ .run.id }}",
            "actionId": "{{.action.identifier}}",
            "user": "{{.trigger.by.user.email}}",
            "teams": "{{ .inputs.user.team }}",
            "version": "{{ .inputs.version }}"
          }
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

    :::info Hidden Inputs
    It's important to define `userInputs.properties.version` and `userInputs.properties.user` as hidden inputs (see `visible: false`) in the form for versioning and tracking purposes.
    :::

## Create a dashboard

Let's create a dashboard, where we will visualize survey data:

1. Go to your [software catalog](https://app.getport.io/organization/catalog).

2. Click on the `+ New` button in the left sidebar.

3. Select `New dashboard`.

4. Name it "Survey Analytics".

Add the following widgets to track survey metrics:

<details>
<summary><b>Action history widget (click to expand)</b></summary>
1. Click `+ Widget` and select `Action History`.

2. Click on the "Survey Response" self-service action we just created.
    <img src="/img/guides/survey-responses-dashboard-example.png" width="90%"/>
</details>

<details>
<summary><b>Average score widget (click to expand)</b></summary>

1. Click `+ Widget` and select `Number Chart`.

2. Configure the widget as follows:
   - **Title**: "\{selected question\} Avg. Score".
   - **Chart Type**: Display single property.
   - **Blueprint**: Question (can be omitted if configuring on the question entity page).
   - **Entity**: The specific question you want to track (can be omitted if configuring on the question entity page).
   - **Property**: Avg. Score.  

This widget displays the average score calculated from all responses for the chosen question.

:::note Survey version
You can swap `question` for `question_template` if you want to see the distribution of answers from all versions of the survey.
:::

<img src="/img/guides/AvgScoreWidget.png" width="40%"/>

</details>

<details>
<summary><b>Response distribution widget (click to expand)</b></summary>

1. Click `+ Widget` and select `Pie chart`.

2. Configure the widget as follows:
   - **Title**: "\{selected question\} distribution".
   - **Blueprint**: Response.
   - **Breakdown by property**: Answer.
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

This widget shows the distribution of answers across all responses for the selected question.

<img src="/img/guides/AnswerDistributionWidget.png" width="40%"/>

</details>

<details>
<summary><b>Response timeline visualization (click to expand)</b></summary>

1. Click `+ Widget` and select `Line Chart`.

2. Configure the widget as follows:
   - **Title**: "\{specific_question\} over time".
   - **Blueprint**: Question (can be omitted if configuring on the question entity page).
   - **Entity**: \{specific_question\} (can be omitted if configuring on the question entity page).
   - **Propeties**: Avg Score.
   - **Time Interval**: Your desired time interval.
   - **Time Range**: Your desired time range.

This widget shows the average score for the selected question over time.

</details>

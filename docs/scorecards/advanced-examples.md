---
sidebar_position: 5
title: Advanced examples
sidebar_label: Advanced examples
---

# Advanced examples

Scorecards can track more than pass or fail compliance. By extending their data models and connecting them with automations, you can build SLA aware workflows and visual dashboards that help teams stay accountable and proactive. 

This page demonstrates how to extend the scorecard data model and use those extensions to create powerful workflows and visualizations.

 <img src='/img/software-catalog/scorecard/MyActionItemsDashboard.png' width='90%' border='1px' />

## Extend the data model

The scorecard blueprints (`Scorecard`, `Scorecard rule`, and `Scorecard rule result`) can be extended with additional properties to support more advanced use cases.  

For example, you can add properties like:

- **Due date** - Track when a rule or rule result needs to be addressed. This property can be automatically updated by automations based on business logic.
- **SLA (Service Level Agreement)** - Define the expected time to remediate issues identified by a rule, enabling SLA tracking and compliance monitoring.
- **Hours until SLA due** - A calculation property that dynamically calculates the time remaining until the SLA due date, useful for triggering reminders and tracking approaching deadlines.

### Extended scorecard rule blueprint

The following example shows an extended `Scorecard rule` blueprint with additional properties including `Due date` and `SLA`:

<details>
<summary><b>Scorecard rule blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "_rule",
  "description": "This blueprint represents a specific scorecard rule",
  "title": "Scorecard Rule",
  "icon": "Star",
  "schema": {
    "properties": {
      "level": {
        "icon": "Columns",
        "type": "string",
        "title": "Level",
        "description": "The level that this rule is required to pass",
        "enum": [
          "F",
          "C",
          "B",
          "A",
          "Basic",
          "Maturing",
          "Bronze",
          "Silver",
          "Gold"
        ],
        "enumColors": {
          "F": "red",
          "C": "yellow",
          "B": "orange",
          "A": "green",
          "Basic": "paleBlue",
          "Maturing": "purple",
          "Bronze": "bronze",
          "Silver": "silver",
          "Gold": "gold"
        }
      },
      "rule_description": {
        "icon": "DefaultBlueprint",
        "type": "string",
        "title": "Rule description",
        "description": "Short description of the rule's logic"
      },
      "query": {
        "icon": "Search",
        "title": "Query",
        "type": "object",
        "description": "Query definition of the rule. Entities matched will be marked as \"passed\"",
        "properties": {
          "combinator": {
            "type": "string",
            "enum": [
              "and",
              "or"
            ]
          },
          "conditions": {
            "type": "array",
            "minItems": 1
          }
        },
        "default": {
          "combinator": "and",
          "conditions": [
            {
              "operator": "isNotEmpty",
              "property": "$team"
            }
          ]
        },
        "required": [
          "combinator",
          "conditions"
        ]
      },
      # highlight-start
      "sla": {
        "type": "number",
        "title": "SLA",
        "description": "Days to remediate action item ",
        "icon": "Clock"
      },
      # highlight-end
      "is_fundamental": {
        "icon": "DefaultProperty",
        "type": "boolean",
        "title": "Is Fundamental?",
        "default": false
      },
      "importance": {
        "icon": "DefaultProperty",
        "title": "Importance ",
        "type": "string",
        "default": "Low",
        "enum": [
          "Low",
          "Medium",
          "High",
          "Highest"
        ],
        "enumColors": {
          "Low": "green",
          "Medium": "yellow",
          "High": "orange",
          "Highest": "red"
        }
      },
      "labels": {
        "icon": "DefaultProperty",
        "type": "array",
        "title": "Labels",
        "items": {
          "enum": [
            "appsec",
            "incident-readiness",
            "hubbernetes"
          ],
          "enumColors": {
            "appsec": "red",
            "incident-readiness": "green",
            "hubbernetes": "blue"
          },
          "type": "string"
        }
      },
      "validation_type": {
        "type": "string",
        "title": "Validation type",
        "enum": [
          "One-time",
          "Ongoing"
        ],
        "enumColors": {
          "One-time": "red",
          "Ongoing": "blue"
        }
      },
      # highlight-start
      "due_date": {
        "title": "Due date",
        "icon": "Flag",
        "type": "string",
        "format": "date-time"
      },
      # highlight-end
      "criticality": {
        "type": "string",
        "title": "Criticality",
        "enum": [
          "High",
          "Medium",
          "Low"
        ],
        "enumColors": {
          "High": "red",
          "Medium": "yellow",
          "Low": "purple"
        }
      }
    },
    "required": [
      "level",
      "query"
    ]
  },
  "mirrorProperties": {
    "blueprint": {
      "path": "scorecard.blueprint"
    }
  },
  "calculationProperties": {
    "of_entities_passed": {
      "title": "% of entities passed",
      "icon": "LineChart",
      "calculation": "(.properties.entities_passed/.properties.entities_tested)*100",
      "type": "number",
      "colorized": false
    }
  },
  "aggregationProperties": {
    "entities_tested": {
      "title": "Entities tested",
      "icon": "Properties",
      "type": "number",
      "target": "_rule_result",
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "entities_passed": {
      "title": "Entities passed",
      "icon": "Rocket",
      "type": "number",
      "target": "_rule_result",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "result",
            "operator": "=",
            "value": "Passed"
          }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    }
  },
  "relations": {
    "point_of_contact": {
      "title": "Point of contact",
      "target": "_user",
      "required": false,
      "many": false
    },
    "scorecard": {
      "title": "Scorecard",
      "target": "_scorecard",
      "required": true,
      "many": false
    },
    "rule_owner": {
      "title": "Rule Owner",
      "target": "_team",
      "required": false,
      "many": false
    }
  }
}
```
</details>

### Extended scorecard rule result blueprint

The following example shows an extended `Scorecard rule result` blueprint with additional properties including `Due date`, `SLA`, and `Hours until SLA due`:

<details>
<summary><b>Scorecard rule result blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "_rule_result",
  "description": "This blueprint represents the result of a specific rule test on an entity",
  "title": "Scorecard Rule Result",
  "icon": "Siren",
  "ownership": {
    "type": "Direct"
  },
  "schema": {
    "properties": {
      "result": {
        "icon": "Sort",
        "title": "Result",
        "description": "Whether this entity passed the related rule's query",
        "type": "string",
        "enum": [
          "Not passed",
          "Passed"
        ],
        "enumColors": {
          "Not passed": "red",
          "Passed": "green"
        }
      },
      "entity": {
        "icon": "General",
        "type": "string",
        "title": "Entity",
        "description": "The entity tested"
      },
      "result_last_change": {
        "icon": "AuditLog",
        "type": "string",
        "title": "Result last change",
        "format": "date-time",
        "description": "Last time the rule result changed"
      },
      # highlight-start
      "sla_due_date": {
        "type": "string",
        "title": "SLA due date",
        "description": "Time to remediate based based on the SLA ",
        "icon": "HourGlass",
        "format": "timer"
      },
      "due_date": {
        "type": "string",
        "title": "Due Date",
        "icon": "Clock",
        "format": "date-time"
      },
      "hours_until_sla_due": {
        "type": "string",
        "title": "Hours until SLA due",
        "format": "timer"
      }
      # highlight-end
    },
    "required": [
      "result",
      "entity"
    ]
  },
  "mirrorProperties": {
    "level": {
      "path": "rule.level"
    },
    "scorecard": {
      "path": "rule.scorecard.$title"
    },
    "blueprint": {
      "path": "rule.scorecard.blueprint"
    },
    "sla": {
      "path": "rule.sla"
    },
    "is_fundamental": {
      "title": "Is Fundamental?",
      "path": "rule.is_fundamental"
    },
    "criticality": {
      "title": "Criticality",
      "path": "rule.criticality"
    }
  },
  "calculationProperties": {
    "entity_link": {
      "title": "Entity link",
      "icon": "LinkOut",
      "calculation": "\"/\" + .properties.blueprint + \"Entity?identifier=\" + .properties.entity",
      "type": "string",
      "format": "url"
    },
  },
  "aggregationProperties": {},
  "relations": {
    "rule": {
      "title": "Rule",
      "target": "_rule",
      "required": true,
      "many": false
    }
  }
}
```
</details>

## Automate SLA tracking

With the data model extended, automations can enforce and monitor SLA timelines automatically.  

Let’s look at two examples:

1. [Set due dates automatically when rules fail](#set-action-item-due-date).
2. [Send reminders when SLA deadlines approach](#send-reminder-for-upcoming-due-dates).

### Set action item due date

When a scorecard rule fails (changes from `Passed` to `Not passed`), this automation sets the `SLA due date` and `Hours until SLA due` properties on the rule result based on the SLA defined on the rule. This ensures that action items have a clear deadline for remediation based on the rule's SLA requirements, and enables timer-based reminders when the deadline approaches.

The automation triggers when:
- A rule result's `result` property changes from "Passed" to "Not passed".
- The `result last change` property is updated (indicating the result actually changed).

The `SLA due date` value is calculated by:
1. Taking the SLA value (in days) from the rule.
2. Converting it to seconds (multiplying by 24 * 60 * 60).
3. Adding it to the `result last change` timestamp (when the rule failed).
4. Converting the result to a date-time format.

The `Hours until SLA due` property is set to 24 hours before the `SLA due date`, creating a timer property that expires when the reminder should be sent. This timer is used by the reminder automation (described in the next section) to trigger notifications when action items are approaching their SLA deadlines.

<details>
<summary><b>Action item due date automation definition (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "set-action-item-due-date",
  "title": "Set action item due-date",
  "description": "When a requirement fails, set a due date to it's action item based on the SLA defined on the requirement",
  "icon": "HourGlass",
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
        ".diff.after.properties.result == \"Not passed\"",
        ".diff.before.properties.result_last_change != .diff.after.properties.result_last_change"
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "_rule_result",
    "mapping": {
      "identifier": "{{ .event.context.entityIdentifier }}",
      "properties": {
        "sla_due_date": "{{((.event.diff.before.properties.sla * 24 * 60 * 60) + ( .event.diff.after.properties.result_last_change | split(\".\")| .[0] | . + \"Z\" | fromdate)) | todate}}",
        "hours_until_sla_due": "{{(((.event.diff.before.properties.sla * 24 * 60 * 60) + ( .event.diff.after.properties.result_last_change | split(\".\")| .[0] | . + \"Z\" | fromdate)) - (24 * 60 * 60)) | todate}}"
      }
    }
  },
  "publish": true
}
```
</details>

This automation creates a timer that counts down to the remediation deadline. The timer can be displayed in dashboards to track SLA compliance, and it can also be used by other automations, such as the reminder automation below, to notify developers when the due date is approaching.

### Send reminder for upcoming due dates

Once SLA due dates are set, you can add another automation to send reminders when deadlines approach. This uses the calculation property `Hour until SLA due` to detect when an item is within 24 hours of expiration.

<details>
<summary><b>Send reminder automation definition (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "send_reminder_for_upcoming_due_date",
  "title": "Send reminder for upcoming due date",
  "description": "Sends a reminder when an action item is approaching its SLA due date (within 24 hours)",
  "icon": "HourGlassExpired",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "TIMER_PROPERTY_EXPIRED",
      "blueprintIdentifier": "_rule_result",
      "propertyIdentifier": "hours_until_sla_due"
    },
    "condition": {
      "type": "JQ",
      "expressions": [],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "SLACK",
    "url": "https://hooks.slack.com/services/YOUR-WEBHOOK-URL
    "agent": false,
    "synchronized": true,
    "body": {
        "text": "⚠️ *Action Item SLA Due Date Reminder*\n\nThis is a reminder that an action item's SLA due date is approaching within 24 hours.\n\n*Action Item Information:*\n• *Rule Result Identifier:* {{ .event.context.entityIdentifier }}\n• *Blueprint:* {{ .event.context.blueprintIdentifier }}\n\n*Required Action:*\nPlease review and address this action item promptly to ensure SLA compliance. The action item requires remediation to meet the defined service level agreement.\n\nYou can view the complete action item details and related information in your Port catalog at: https://app.getport.io{{ .event.diff.after.properties.entity_link }} you have any questions or need assistance, please contact your team lead or the responsible party for this action item."
    },
    "method": "POST",
    "headers": {}
  },
  "publish": true
}
```
</details>

## Handle SLA exceptions

Not all action items can be resolved before their SLA expires. With the following self-service action, teams can request extensions or exceptions directly from the catalog.

### Request a due date extension

When an action item's due date is approaching and the issue cannot be resolved in time, teams can use this self-service action to request an extension from management. The action creates an exception request that goes through an approval workflow (director and VP approval).

This action is particularly useful when:
- The due date is almost here and the action item has not been addressed yet.
- External dependencies or resource constraints prevent timely remediation.
- Additional time is needed to properly address the issue.

<details>
<summary><b>Due date extension action definition (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "request_a_due_date_extension",
  "title": "Request a due date extension",
  "description": "Request an exception to extend the due date for an action item. This will require director and VP approval.",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "reason_for_exception": {
          "icon": "DefaultProperty",
          "type": "string",
          "title": "Reason for Exception",
          "minLength": 10,
          "maxLength": 500
        },
        "exception_category": {
          "icon": "DefaultProperty",
          "type": "string",
          "title": "Exception Category",
          "description": "This will help the user to auto select the reason for exceptions",
          "enum": [
            "Complexity",
            "No resources",
            "MSFT dependencies"
          ],
          "enumColors": {
            "Complexity": "purple",
            "No resources": "red",
            "MSFT dependencies": "green"
          }
        },
        "date_of_resolution": {
          "type": "string",
          "title": "Date of Resolution",
          "format": "date-time"
        },
        "director_approval": {
          "icon": "DefaultProperty",
          "type": "array",
          "title": "Director Approval",
          "description": "For now we will have the requestor manually select the approver, but in the future we want Port to automatically select the next level manager for approval.",
          "items": {
            "type": "string",
            "format": "user"
          }
        },
        "vp_approval": {
          "icon": "DefaultProperty",
          "type": "array",
          "title": "VP Approval",
          "items": {
            "type": "string",
            "format": "user"
          }
        }
      },
      "required": [
        "reason_for_exception",
        "date_of_resolution",
        "director_approval",
        "vp_approval"
      ],
      "order": [
        "exception_category",
        "reason_for_exception",
        "date_of_resolution",
        "director_approval",
        "vp_approval"
      ]
    },
    "blueprintIdentifier": "_rule_result"
  },
  "invocationMethod": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "exception_request",
    "mapping": {
      "identifier": "{{ .entity.identifier + \"_exception\"}}",
      "title": "{{ .entity.title + \"_exception\"}}",
      "properties": {
        "justification": "{{.inputs.reason_for_exception}}",
        "requested_due_date": "{{.inputs.date_of_resolution}}",
        "category": "{{.inputs.exception_category}}"
      },
      "relations": {
        "action_item": "{{ .entity.identifier }}",
        "requirement": "{{ .entity.relations.rule }}",
        "approving_directors": "{{.inputs.director_approval}}",
        "approving_v_ps": "{{.inputs.vp_approval}}"
      }
    }
  },
  "requiredApproval": false,
  "icon": "HourGlass"
}
```
</details>

## Visualize and track action items

This dashboard provides a centralized view of all action items that need attention. This dashboard is built on the `Scorecard rule result` blueprint and displays rule results that have failed, grouped by blueprint and rule.

Who can benefit from this dashboard?

- **Developers**: Can quickly see what issues need to be addressed for their services, prioritize work based on due dates and criticality, and track their remediation progress.
- **Team leaders**: Can monitor team-wide action items, identify patterns across services, and ensure timely remediation. They can use the dashboard to send Slack messages to developers, on-call engineers, or owning teams when action items require attention.

### Dashboard setup

1. Navigate to your [Software Catalog](https://app.getport.io/catalog) page.
2. Click the **+ New** button in the sidebar on the left side of the page.
3. Select **New catalog page** from the dropdown menu.
4. In the modal that appears, configure the following settings:
   - **Title**: Enter `My Action Items`.
   - **Identifier**: Enter `my_action_items`.
   - **Blueprint**: Select `Scorecard Rule Result` from the dropdown.
5. Set up the initial filter to show only rule results that have failed:
   - Click on **filters**, then `+ Filter`.
   - Select the `Result` property.
   - Choose the operator `=`.
   - Set the value to `Not passed`.

   Or copy and paste the following JSON code:

   ```json showLineNumbers
   {
     "combinator": "and",
     "rules": [
       {
         "property": "result",
         "operator": "=",
         "value": "Not passed"
       }
     ]
   }
   ```
   Then click `Save`.
6. Click **Create** to save the dashboard.

After creating the dashboard, **group by** `Blueprint` and `Rule`.  

This configuration creates a view where action items are organized by the target blueprint and the specific rule that failed, making it easy to identify which entities have issues and what they are.

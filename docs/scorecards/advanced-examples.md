---
sidebar_position: 5
title: Advanced examples
sidebar_label: Advanced examples
---

# Advanced examples

The scorecards blueprint data model can be extended to meet your organization's specific needs. You can add custom properties to the scorecard blueprints, create automations and self-service actions that leverage these properties, and build dashboards and insights pages that provide visibility into your scorecard data. 

This page demonstrates how to extend the scorecard data model and use those extensions to create powerful workflows and visualizations.

 <img src='/img/software-catalog/scorecard/MyActionItemsDashboard.png' width='90%' border='1px' />

## Set up data model

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
      "first_approver": {
        "icon": "DefaultProperty",
        "type": "string",
        "title": "1st Approver",
        "format": "user"
      },
      "final_approver": {
        "type": "array",
        "title": "Final Approver",
        "items": {
          "type": "string",
          "format": "user"
        }
      },
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

The following example shows an extended `Scorecard rule result` blueprint with additional properties including `Due date`, `SLA due date`, and `Hours until SLA due date`:

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
    "first_approver": {
      "title": "1st Approver",
      "path": "rule.first_approver"
    },
    "final_approver": {
      "title": "Final Approver",
      "path": "rule.final_approver"
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
    # highlight-start
    "hours_until_sla_due": {
      "title": "Hours until SLA due",
      "icon": "Clock",
      "description": "Number of hours remaining until the SLA due date",
      "calculation": "((.properties.sla_due_date | fromdate) - (now | fromdate)) / 3600",
      "type": "number"
    }
    # highlight-end
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

## Automations

After expanding the scorecard data model with properties like `Due date` and `SLA` and `Hours until SLA due date`, you can create automations that respond to scorecard rule result changes. These automations can update properties, send notifications to teams, and trigger workflows to help ensure timely remediation of issues.

### Set action item due date

When a scorecard rule fails (changes from "Passed" to "Not passed"), this automation sets the `SLA due date` on the rule result based on the SLA defined on the rule. This ensures that action items have a clear deadline for remediation based on the rule's SLA requirements.

The automation triggers when:
- A rule result's `result` property changes from "Passed" to "Not passed".
- The `result last change` property is updated (indicating the result actually changed).

The `SLA due date` value is calculated by:
1. Taking the SLA value (in days) from the rule.
2. Converting it to seconds (multiplying by 24 * 60 * 60).
3. Adding it to the `result last change` timestamp (when the rule failed).
4. Converting the result to a date-time format.

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
        "sla_due_date": "{{((.event.diff.before.properties.sla * 24 * 60 * 60) + ( .event.diff.after.properties.result_last_change | split(\".\")| .[0] | . + \"Z\" | fromdate)) | todate}}"
      }
    }
  },
  "publish": true
}
```
</details>

This automation creates a timer that counts down to the remediation deadline. The timer can be displayed in dashboards to track SLA compliance, and it can also be used by other automations, such as the reminder automation below, to notify developers when the due date is approaching.

### Send reminder for upcoming due dates

This automation sends reminders to developers when action items are approaching their due dates. It uses a calculation property that dynamically calculates when to send the reminder (e.g., 24 hours before the SLA due date).

To implement this, you need to have a calculation property in your `Scorecard rule result` blueprint. The property calculates the time remaining until the SLA due date. The automation then triggers when this value reaches a threshold (e.g., 24 hours remaining).

This calculation property computes the difference between the `SLA due date` and the current time, converting it to hours. The automation can then trigger when this value is between 0 and 24 (indicating the due date is within 24 hours).

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
      "propertyIdentifier": "sla_due_date"
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
      "text": "⚠️ *Action Item SLA Due Date Reminder*\n\nThis is a reminder that an action item's SLA due date is approaching within 24 hours.\n\n*Action Item Information:*\n• *Rule Result Identifier:* {{ .event.context.entityIdentifier }}\n• *Blueprint:* {{ .event.context.blueprintIdentifier }}\n• *Property:* {{ .event.context.propertyIdentifier }}\n\n*Required Action:*\nPlease review and address this action item promptly to ensure SLA compliance. The action item requires remediation to meet the defined service level agreement.\n\nYou can view the complete action item details and related information in your Port catalog at: https://app.getport.io\n\nIf you have any questions or need assistance, please contact your team lead or the responsible party for this action item."
    },
    "method": "POST",
    "headers": {}
  },
  "publish": true
}
```
</details>

## Self-service actions

Self-service actions enable teams to manage their scorecard data and request exceptions when needed.

### Ask for due date extension

When an action item's due date is approaching and the issue cannot be resolved in time, teams can use this self-service action to request an extension from management. The action creates an exception request that goes through an approval workflow (director and VP approval).

This action is particularly useful when:
- The due date is almost here and the action item hasn't been addressed.
- External dependencies or resource constraints prevent timely remediation.
- Additional time is needed to properly address the issue.

<details>
<summary><b>Due date extension automation definition (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "ask_for_due_date_extension",
  "title": "Ask for Due Date Extension",
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

## My action items dashboard

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

After creating the dashboard, **group by** `Blueprint` and `Rule` from the available options.

This configuration creates a view where action items are organized by the target blueprint and the specific rule that failed, making it easy to identify which services have issues and what are they.

The dashboard automatically filters to show only rule results where `result = "Not passed"`, ensuring that only actionable items are displayed. The grouping by blueprint and rule helps teams understand:
- Which services have the most issues.
- What types of rules are failing most frequently.
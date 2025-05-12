---
sidebar_position: 2
---

# Examples
To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

## User

<details>
<summary>User blueprint</summary>

```json showLineNumbers
{
  "identifier": "pagerdutyUser",
  "description": "This blueprint represents a PagerDuty user in our software catalog",
  "title": "PagerDuty User",
  "icon": "pagerduty",
  "schema": {
    "properties": {
      "role": {
        "icon": "DefaultProperty",
        "title": "Role",
        "type": "string",
        "enum": [
          "admin",
          "user",
          "observer",
          "limited_user",
          "owner",
          "read_only_user",
          "restricted_access",
          "read_only_limited_user"
        ]
      },
      "url": {
        "icon": "DefaultProperty",
        "type": "string",
        "format": "url",
        "title": "User URL"
      },
      "job_title": {
        "title": "Job Title",
        "icon": "DefaultProperty",
        "type": "string"
      },
      "contact_methods": {
        "title": "Contact Methods",
        "icon": "DefaultProperty",
        "type": "array"
      },
      "description": {
        "type": "string",
        "title": "Description"
      },
      "teams": {
        "title": "Teams",
        "icon": "DefaultProperty",
        "type": "array"
      },
      "time_zone": {
        "icon": "DefaultProperty",
        "type": "string",
        "title": "Time Zone"
      },
      "email": {
        "type": "string",
        "title": "Email",
        "format": "user"
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

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: users
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"pagerdutyUser"'
          properties:
            url: .html_url
            time_zone: .time_zone
            email: .email
            description: .description
            role: .role
            job_title: .job_title
            teams: .teams
            contact_methods: .contact_methods
```
</details>

## Schedule

<details>
<summary>Schedule blueprint</summary>

```json showLineNumbers
{
  "identifier": "pagerdutySchedule",
  "description": "This blueprint represents a PagerDuty schedule in our software catalog",
  "title": "PagerDuty Schedule",
  "icon": "pagerduty",
  "schema": {
    "properties": {
      "url": {
        "title": "Schedule URL",
        "type": "string",
        "format": "url"
      },
      "timezone": {
        "title": "Timezone",
        "type": "string"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "users": {
        "title": "Users",
        "type": "array",
        "items": {
          "type": "string",
          "format": "user"
        }
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

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: schedules
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"pagerdutySchedule"'
          properties:
            url: .html_url
            timezone: .time_zone
            description: .description
            users: '[.users[] | select(has("__email")) | .__email]'
```

</details>

## Oncall

<details>
<summary>Oncall blueprint</summary>

```json showLineNumbers
{
  "identifier": "pagerdutyOncall",
  "description": "This blueprint represents a PagerDuty oncall schedule in our software catalog",
  "title": "PagerDuty Oncall Schedule",
  "icon": "pagerduty",
  "schema": {
    "properties": {
      "url": {
        "title": "Oncall Schedule URL",
        "type": "string",
        "format": "url"
      },
      "user": {
        "title": "User",
        "type": "string",
        "format": "user"
      },
      "startDate": {
        "title": "Start Date",
        "type": "string",
        "format": "date-time"
      },
      "endDate": {
        "title": "End Date",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "pagerdutySchedule": {
      "title": "PagerDuty Schedule",
      "target": "pagerdutySchedule",
      "required": false,
      "many": true
    }
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: oncalls
    selector:
      query: 'true'
      apiQueryParams:
        include: ['users']
    port:
      entity:
        mappings:
          identifier: .user.id + "-" + .schedule.id + "-" + .start
          title: .user.name
          blueprint: '"pagerdutyOncall"'
          properties:
            user: .user.email
            startDate: .start
            endDate: .end
            url: .schedule.html_url
          relations:
            pagerdutySchedule: .schedule.id
```
</details>

## Service

<details>
<summary>Service blueprint</summary>

```json showLineNumbers
{
  "identifier": "pagerdutyService",
  "description": "This blueprint represents a PagerDuty service in our software catalog",
  "title": "PagerDuty Service",
  "icon": "pagerduty",
  "schema": {
    "properties": {
      "status": {
        "title": "Status",
        "type": "string",
        "enum": [
          "active",
          "warning",
          "critical",
          "maintenance",
          "disabled"
        ],
        "enumColors": {
          "active": "green",
          "warning": "yellow",
          "critical": "red",
          "maintenance": "lightGray",
          "disabled": "darkGray"
        }
      },
      "url": {
        "title": "URL",
        "type": "string",
        "format": "url"
      },
      "oncall": {
        "title": "On Call",
        "type": "string",
        "format": "user"
      },
      "secondaryOncall": {
        "title": "Secondary On Call",
        "type": "string",
        "format": "user"
      },
      "escalationLevels": {
        "title": "Escalation Levels",
        "type": "number"
      },
      "meanSecondsToResolve": {
        "title": "Mean Seconds to Resolve",
        "type": "number"
      },
      "meanSecondsToFirstAck": {
        "title": "Mean Seconds to First Acknowledge",
        "type": "number"
      },
      "meanSecondsToEngage": {
        "title": "Mean Seconds to Engage",
        "type": "number"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: services
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"pagerdutyService"'
          properties:
            status: .status
            url: .html_url
            oncall: .__oncall_user | sort_by(.escalation_level) | .[0].user.email
            secondaryOncall: .__oncall_user | sort_by(.escalation_level) | .[1].user.email
            escalationLevels: .__oncall_user | map(.escalation_level) | unique | length
            meanSecondsToResolve: .__analytics.mean_seconds_to_resolve
            meanSecondsToFirstAck: .__analytics.mean_seconds_to_first_ack
            meanSecondsToEngage: .__analytics.mean_seconds_to_engage
```

</details>

## Incident

<details>
<summary>Incident blueprint</summary>

```json showLineNumbers
{
  "identifier": "pagerdutyIncident",
  "description": "This blueprint represents a PagerDuty incident in our software catalog",
  "title": "PagerDuty Incident",
  "icon": "pagerduty",
  "schema": {
    "properties": {
      "status": {
        "type": "string",
        "title": "Incident Status",
        "enum": [
          "triggered",
          "annotated",
          "acknowledged",
          "reassigned",
          "escalated",
          "reopened",
          "resolved"
        ],
        "enumColors": {
          "triggered": "red",
          "annotated": "blue",
          "acknowledged": "yellow",
          "reassigned": "blue",
          "escalated": "yellow",
          "reopened": "red",
          "resolved": "green"
        }
      },
      "url": {
        "type": "string",
        "format": "url",
        "title": "Incident URL"
      },
      "urgency": {
        "title": "Incident Urgency",
        "type": "string",
        "enum": [
          "high",
          "low"
        ],
        "enumColors": {
          "high": "red",
          "low": "green"
        }
      },
      "priority": {
        "type": "string",
        "title": "Priority",
        "enum": [
          "P1",
          "P2",
          "P3",
          "P4",
          "P5"
        ],
        "enumColors": {
          "P1": "red",
          "P2": "yellow",
          "P3": "blue",
          "P4": "lightGray",
          "P5": "darkGray"
        }
      },
      "description": {
        "type": "string",
        "title": "Description"
      },
      "assignees": {
        "title": "Assignees",
        "type": "array",
        "items": {
          "type": "string",
          "format": "user"
        }
      },
      "escalation_policy": {
        "type": "string",
        "title": "Escalation Policy"
      },
      "created_at": {
        "title": "Create At",
        "type": "string",
        "format": "date-time"
      },
      "updated_at": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "pagerdutyService": {
      "title": "PagerDuty Service",
      "target": "pagerdutyService",
      "required": false,
      "many": true
    }
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

:::tip Double mapping for incidents 
The mapping for incidents is divided into two types:

**Ongoing Incidents**: This mapping is used for incidents with a status of `triggered` or `acknowledged`.
**Resolved Incidents**: This mapping is used for incidents that have been `resolved`.

The separation is necessary to prevent overwriting the previously ingested `assignee` data. When an incident is resolved, the `assignee` field in the Incident API response is set to `null`, which could otherwise overwrite the existing assignee information.
:::

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: incidents
    selector:
      query: 'true'
      apiQueryParams:
        include:
          - assignees
          - first_trigger_log_entries
        statuses:
          - triggered
          - acknowledged
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .title
          blueprint: '"pagerdutyIncident"'
          properties:
            status: .status
            url: .html_url
            urgency: .urgency
            assignees: .assignments | map(.assignee.email)
            escalation_policy: .escalation_policy.summary
            created_at: .created_at
            updated_at: .updated_at
            priority: if .priority != null then .priority.summary else null end
            description: .description
            triggered_by: .first_trigger_log_entry.agent.summary
          relations:
            pagerdutyService: .service.id
  - kind: incidents
    selector:
      query: 'true'
      apiQueryParams:
        include:
          - assignees
          - first_trigger_log_entries
        statuses:
          - resolved
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .title
          blueprint: '"pagerdutyIncident"'
          properties:
            status: .status
            url: .html_url
            urgency: .urgency
            escalation_policy: .escalation_policy.summary
            created_at: .created_at
            updated_at: .updated_at
            priority: if .priority != null then .priority.summary else null end
            description: .description
            triggered_by: .first_trigger_log_entry.agent.summary
          relations:
            pagerdutyService: .service.id
```

</details>

## Escalation Policy

<details>
<summary>Escalation Policy blueprint</summary>

```json showLineNumbers
{
   "identifier": "pagerdutyEscalationPolicy",
   "description": "This blueprint represents a PagerDuty escalation policy in our software catalog",
   "title": "PagerDuty Escalation Policy",
   "icon": "pagerduty",
   "schema": {
      "properties": {
         "url": {
            "title": "URL",
            "type": "string",
            "format": "url"
         },
         "summary": {
            "title": "Summary",
            "type": "string"
         },
         "primaryOncall": {
            "title": "Primary Oncall",
            "type": "string",
            "format": "user"
         },
         "escalationRules": {
            "title": "Escalation Rules",
            "type": "array",
            "items": {
               "type": "object"
            }
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

<details>
<summary>Integration configuration</summary>

:::tip Attach oncall users
When `attachOncallUsers` is set to `true`, it fetches the oncall data per escalation policy. To disable this feature, set the value to `false`.
:::

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
   - kind: escalation_policies
     selector:
       query: 'true'
       attachOncallUsers: 'true'
     port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"pagerdutyEscalationPolicy"'
          properties:
            url: .html_url
            description: .summary
            primaryOncall: .__oncall_users | sort_by(.escalation_level) | .[0].user.email
            escalationRules: .escalation_rules
```
</details>

## Slack notifications

Using Port's automation capabilities, you can set up real-time Slack notifications when incidents are created or updated in PagerDuty.

<details>
<summary>Automation for New Incidents</summary>

```json showLineNumbers
{
  "identifier": "pagerduty_new_incident_notification",
  "title": "Notify Slack on New PagerDuty Incident",
  "icon": "Slack",
  "description": "Sends a Slack notification when a new incident is created in PagerDuty",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_CREATED",
      "blueprintIdentifier": "pagerdutyIncident"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.after.properties.status == \"triggered\""
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
      "text": "🚨 New PagerDuty Incident\n\n*Incident:* {{ .event.diff.after.title }}\n*Status:* {{ .event.diff.after.properties.status }}\n*Urgency:* {{ .event.diff.after.properties.urgency }}\n*Service:* {{ .event.diff.after.relations.pagerdutyService }}\n\n<{{ .event.diff.after.properties.url }}|View in PagerDuty> | <https://app.getport.io/pagerdutyIncidentEntity?identifier={{ .event.context.entityIdentifier }}|View in Port>"
    }
  },
  "publish": true
}
```

</details>

<details>
<summary>Automation for Incident Status Changes</summary>

```json showLineNumbers
{
  "identifier": "pagerduty_incident_status_change",
  "title": "Notify Slack on PagerDuty Incident Status Change",
  "icon": "Slack",
  "description": "Sends a Slack notification when a PagerDuty incident status changes",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "pagerdutyIncident"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.before.properties.status != .diff.after.properties.status"
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
    "headers": {},
    "body": {
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "🔄 PagerDuty Incident Status Change",
            "emoji": true
          }
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": "*Incident:*\n{{ .event.diff.after.title }}"
            },
            {
              "type": "mrkdwn",
              "text": "*Status:*\n{{ if eq .event.diff.after.properties.status \"resolved\" }}✅ Resolved{{ else if eq .event.diff.after.properties.status \"acknowledged\" }}👀 Acknowledged{{ else }}🚨 {{ .event.diff.after.properties.status }}{{ end }}"
            }
          ]
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": "*Previous Status:*\n{{ .event.diff.before.properties.status }}"
            },
            {
              "type": "mrkdwn",
              "text": "*Updated:*\n{{ .event.diff.after.properties.updated_at }}"
            }
          ]
        }
      ]
    }
  },
  "publish": true
}
```

</details>

:::tip Slack webhook URL
Replace `YOUR_SLACK_WEBHOOK_URL` with your actual Slack incoming webhook URL. For information on creating Slack webhooks, see the [Slack API documentation](https://api.slack.com/messaging/webhooks).
:::

These automations allow your team to receive immediate notifications in Slack when incidents are created or change status, making incident response faster and more efficient.
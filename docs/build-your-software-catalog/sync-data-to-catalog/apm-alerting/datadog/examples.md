---
sidebar_position: 2
---

# Examples

To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

## Monitor

<details>
<summary>Monitor blueprint</summary>

```json showLineNumbers
{
  "identifier": "datadogMonitor",
  "description": "This blueprint represents a datadog monitor",
  "title": "Datadog Monitor",
  "icon": "Datadog",
  "schema": {
    "properties": {
      "monitorType": {
        "type": "string",
        "title": "Monitor Type"
      },
      "tags": {
        "type": "array",
        "title": "Tags"
      },
      "overallState": {
        "type": "string",
        "title": "Overall state",
        "enum": [
          "Alert",
          "Ignored",
          "No Data",
          "OK",
          "Skipped",
          "Unknown",
          "Warn"
        ],
        "enumColors": {
          "Alert": "red",
          "Ignored": "darkGray",
          "No Data": "lightGray",
          "OK": "green",
          "Skipped": "yellow",
          "Unknown": "purple",
          "Warn": "orange"
        }
      },
      "priority": {
        "type": "string",
        "title": "Priority"
      },
      "thresholds": {
        "type": "object",
        "title": "Thresholds"
      },
      "createdBy": {
        "type": "string",
        "title": "Creator"
      },
      "createdAt": {
        "title": "Created At",
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time"
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
  - kind: monitor
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"datadogMonitor"'
          identifier: .id | tostring
          title: .name
          properties:
            tags: .tags
            monitorType: .type
            overallState: .overall_state
            thresholds: .thresholds
            priority: .priority
            createdBy: .creator.email
            createdAt: .created
            updatedAt: .modified
```

</details>

## Service

<details>
<summary>Service blueprint</summary>

```json showLineNumbers
{
  "identifier": "datadogService",
  "description": "This blueprint represents a Datadog service",
  "title": "Datadog Service",
  "icon": "Datadog",
  "schema": {
    "properties": {
      "application": {
        "title": "Application",
        "type": "string"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "tags": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "title": "Tags"
      },
      "languages": {
        "items": {
          "type": "string"
        },
        "title": "Languages",
        "type": "array"
      },
      "type": {
        "title": "Type",
        "type": "string",
        "enum": [
          "web",
          "db",
          "custom",
          "cache",
          "function",
          "browser",
          "mobile"
        ],
        "enumColors": {
          "web": "lightGray",
          "db": "lightGray",
          "custom": "lightGray",
          "cache": "lightGray",
          "function": "lightGray",
          "browser": "lightGray",
          "mobile": "lightGray"
        }
      },
      "owners": {
        "type": "array",
        "title": "Service Owners",
        "items": {
          "type": "string"
        }
      },
      "links": {
        "title": "Service Links",
        "type": "array",
        "description": "Links to external resources and repositories",
        "items": {
          "type": "string",
          "format": "url"
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
  - kind: service
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"datadogService"'
          identifier: .attributes.schema."dd-service"
          title: .attributes.schema."dd-service"
          properties:
            application: .attributes.schema.application
            languages: .attributes.schema.languages
            description: .attributes.schema.description
            tags: .attributes.schema.tags
            type: .attributes.schema.type
            links: .attributes.schema.links | map(.url)
            owners: '[.attributes.schema.contacts[] | select(.type == "email") | .contact]'
```

</details>

## SLO

<details>
<summary>SLO blueprint</summary>

```json showLineNumbers
{
  "identifier": "datadogSlo",
  "description": "This blueprint represents a datadog SLO",
  "title": "Datadog SLO",
  "icon": "Datadog",
  "schema": {
    "properties": {
      "tags": {
        "type": "array",
        "title": "Tags"
      },
      "sloType": {
        "title": "Type",
        "type": "string"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "warningThreshold": {
        "icon": "DefaultProperty",
        "title": "Warning Threshold",
        "type": "number"
      },
      "targetThreshold": {
        "icon": "DefaultProperty",
        "title": "Target Threshold",
        "type": "number"
      },
      "createdAt": {
        "title": "Created At",
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time"
      },
      "createdBy": {
        "title": "Creator",
        "type": "string"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {
    "sli_average": {
      "title": "SLI Average",
      "type": "number",
      "target": "datadogSloHistory",
      "calculationSpec": {
        "func": "average",
        "averageOf": "total",
        "property": "sliValue",
        "measureTimeBy": "$createdAt",
        "calculationBy": "property"
      }
    }
  },
  "relations": {
    "monitors": {
      "title": "SLO Monitors",
      "description": "The monitors tracking this SLO",
      "target": "datadogMonitor",
      "required": false,
      "many": true
    },
    "services": {
      "title": "Services",
      "description": "The services tracked by this SLO",
      "target": "datadogService",
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
  - kind: slo
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .name
          blueprint: '"datadogSlo"'
          properties:
            tags: .tags
            sloType: .type
            description: .description
            warningThreshold: .warning_threshold
            targetThreshold: .target_threshold
            createdBy: .creator.email
            createdAt: .created_at | todate
            updatedAt: .modified_at | todate
          relations:
            monitors: .monitor_ids | map(tostring)
            services: >-
              .monitor_tags + .tags | map(select(startswith("service:"))) |
              unique | map(split(":")[1])
```

:::tip Service Relation
Based on the [best practices for tagging infrastructure](https://www.datadoghq.com/blog/tagging-best-practices/), the default mapping connects SLOs to services using tags that starts with the `service` keyword.
:::

</details>

## SLO history

<details>
<summary>SLO history blueprint</summary>

```json showLineNumbers
{
  "identifier": "datadogSloHistory",
  "description": "This blueprint represents a datadog SLO history",
  "title": "Datadog SLO History",
  "icon": "Datadog",
  "schema": {
    "properties": {
      "monitor_type": {
        "icon": "DefaultProperty",
        "title": "Type",
        "type": "string"
      },
      "sliValue": {
        "icon": "DefaultProperty",
        "title": "SLI Value",
        "type": "number"
      },
      "sampling_start_date": {
        "icon": "DefaultProperty",
        "type": "string",
        "title": "Sampling Start Date",
        "format": "date-time"
      },
      "sampling_end_date": {
        "icon": "DefaultProperty",
        "type": "string",
        "title": "Sampling End Date",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {
    "slo_target": {
      "title": "SLO Target",
      "path": "slo.targetThreshold"
    },
    "slo_warning_threshold": {
      "title": "SLO Warning Threshold",
      "path": "slo.warningThreshold"
    }
  },
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "slo": {
      "title": "SLO",
      "description": "The SLO to which this history belongs to",
      "target": "datadogSlo",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

:::tip Configuration Options
The SLO history selector supports two time-related configurations:

- `timeframe`: How many days to look back for each SLO history data point. Must be greater than 0 (default: 7 days)
- `periodOfTimeInMonths`: How far back in time to fetch SLO history. Must be between 1-12 months (default: 6 months)
:::

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: sloHistory
    selector:
      query: "true"
      timeframe: 7
      periodOfTimeInMonths: 6
    port:
      entity:
        mappings:
          identifier: .slo.id | tostring
          title: .slo.name
          blueprint: '"datadogSloHistory"'
          properties:
            monitory_type: .type
            sampling_start_date: .from_ts | todate
            sampling_end_date: .to_ts | todate
            sliValue: .overall.sli_value
          relations:
            slo: .slo.id
```

</details>

## Service Metric

<details>
<summary>Service Metric blueprint</summary>

```json showLineNumbers
{
  "identifier": "datadogServiceMetric",
  "description": "This blueprint represents a Datadog service metric",
  "title": "Datadog Service Metric",
  "icon": "Datadog",
  "schema": {
    "properties": {
      "query": {
        "type": "string",
        "title": "Query",
        "description": "The Datadog query used to retrieve this metric"
      },
      "series": {
        "type": "array",
        "title": "Series",
        "description": "Array containing detailed information about the metric series"
      },
      "res_type": {
        "type": "string",
        "title": "Response Type",
        "description": "The type of response from the Datadog API"
      },
      "from_date": {
        "type": "string",
        "format": "date-time",
        "title": "From Date",
        "description": "Unix timestamp of the start of the queried time period"
      },
      "to_date": {
        "type": "string",
        "format": "date-time",
        "title": "To Date",
        "description": "Unix timestamp of the end of the queried time period"
      },
      "env": {
        "type": "string",
        "title": "Environment",
        "description": "The environment of the service"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "service": {
      "title": "Service",
      "description": "The service associated with this query",
      "target": "datadogService",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

:::tip Configuration Mapping for Flexible Metric Fetching
The `datadogSelector` section within each `serviceMetric` resource demonstrates how to fetch multiple metrics (e.g., `system.mem.used`, `system.disk.used`) from Datadog with a variety of filters. You can control the:

- **Metric:** Specify the exact metric name (e.g., `avg:system.mem.used`)
- **Environment:** Filter by specific environments (e.g., `prod`, or use `*` for all)
- **Service:** Filter by specific services in your [datadog service catalog](https://docs.datadoghq.com/service_catalog/) (use `*` for all)
- **Timeframe:** Define the time range for data retrieval (in minutes)

This configuration allows you to tailor your data fetching to specific needs and scenarios.

**Note**: The `env` and `service` filters let you specify custom tag names in your Datadog account. For example, your service tag could be `servicename`, and your environment tag could be `envt` or `environment`.
:::

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: serviceMetric
    selector:
      query: "true"
      datadogSelector:
        metric: "avg:system.mem.used"
        env:
          tag: env
          value: "*"
        service:
          tag: servicename
          value: "*"
        timeframe: 10
    port:
      entity:
        mappings:
          blueprint: '"datadogServiceMetric"'
          identifier: .__query_id
          title: .query
          properties:
            query: .__query
            series: .series
            res_type: .res_type
            from_date: ".from_date / 1000 | todate"
            to_date: ".to_date / 1000 | todate"
            env: .__env
          relations:
            service: .__service
  - kind: serviceMetric
    selector:
      query: "true"
      datadogSelector:
        metric: "avg:system.disk.used"
        env:
          tag: env
          value: "prod"
        service:
          tag: servicename
          value: "*"
        timeframe: 5
    port:
      entity:
        mappings:
          blueprint: '"datadogServiceMetric"'
          identifier: .__query_id
          title: .query
          properties:
            query: .__query
            series: .series
            res_type: .res_type
            from_date: ".from_date / 1000 | todate"
            to_date: ".to_date / 1000 | todate"
            env: .__env
          relations:
            service: .__service
```

:::tip Service Relation
Based on the [best practices for tagging infrastructure](https://www.datadoghq.com/blog/tagging-best-practices/), the default JQ maps service metrics to services using tags that starts with the `service` keyword
:::

</details>

## Users

<details>
<summary>User blueprint</summary>

```json showLineNumbers
{
  "identifier": "datadogUser",
  "description": "This blueprint represents a Datadog user account. Users can be assigned to teams, granted specific permissions, and can interact with various Datadog features based on their access levels.",
  "title": "Datadog User",
  "icon": "Datadog",
  "schema": {
    "properties": {
      "email": {
        "type": "string",
        "format": "email",
        "title": "Email",
        "description": "The email address associated with the user account"
      },
      "handle": {
        "type": "string",
        "title": "Handle",
        "description": "The unique handle identifier for the user within Datadog"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "description": "The current status of the user account (e.g., active, pending, disabled)"
      },
      "disabled": {
        "type": "boolean",
        "title": "Disabled",
        "description": "Indicates whether the user account is currently disabled"
      },
      "verified": {
        "type": "boolean",
        "title": "Verified",
        "description": "Indicates whether the user's email address has been verified"
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At",
        "description": "The timestamp when the user account was created"
      }
    },
    "required": []
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
resources:
  - kind: user
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .attributes.name
          blueprint: '"datadogUser"'
          properties:
            email: .attributes.email
            handle: .attributes.handle
            status: .attributes.status
            disabled: .attributes.disabled
            verified: .attributes.verified
            createdAt: .attributes.created_at | todate
```

</details>

## Team

<details>
<summary>Team blueprint</summary>

```json showLineNumbers
{
    "identifier": "datadogTeam",
    "description": "This blueprint represents a Datadog team",
    "title": "Datadog Team",
    "icon": "Datadog",
    "schema": {
      "properties": {
        "description": {
          "type": "string",
          "title": "Description",
          "description": "A description of the team's purpose and responsibilities"
        },
        "handle": {
          "type": "string",
          "title": "Handle",
          "description": "The unique handle identifier for the team within Datadog"
        },
        "userCount": {
          "type": "number",
          "title": "User Count",
          "description": "The total number of users that are members of this team"
        },
        "summary": {
          "type": "string",
          "title": "Summary",
          "description": "A brief summary of the team's purpose or main responsibilities"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time",
          "title": "Created At",
          "description": "The timestamp when the team was created"
        }
      },
      "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
      "members": {
        "target": "datadogUser",
        "title": "Members",
        "description": "Users who are members of this team",
        "many": true,
        "required": false
      }
    }
  }
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
  - kind: team
    selector:
      query: 'true'
      includeMembers: 'true'
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .attributes.name
          blueprint: '"datadogTeam"'
          properties:
            description: .attributes.description
            handle: .attributes.handle
            userCount: .attributes.user_count
            summary: .attributes.summary
            createdAt: .attributes.created_at | todate
          relations:
            members: if .__members then [.__members[] | .id] else [] end
```

</details>

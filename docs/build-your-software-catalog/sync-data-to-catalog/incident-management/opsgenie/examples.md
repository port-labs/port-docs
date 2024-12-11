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
  "identifier": "opsGenieUser",
  "description": "This blueprint represents an OpsGenie user in our software catalog",
  "title": "OpsGenie User",
  "icon": "OpsGenie",
  "schema": {
    "properties": {
      "role": {
        "title": "Role",
        "type": "string"
      },
      "email": {
        "type": "string",
        "title": "Email",
        "format": "user"
      },
      "address": {
        "type": "object",
        "title": "Address"
      },
      "timeZone": {
        "type": "string",
        "title": "Time Zone"
      },
      "isVerified": {
        "type": "boolean",
        "title": "Is Verified"
      },
      "isBlocked": {
        "type": "boolean",
        "title": "Is Blocked"
      },
      "createdAt": {
        "type": "string",
        "title": "Created At",
        "format": "date-time"
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
  - kind: user
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .fullName
          blueprint: '"opsGenieUser"'
          properties:
            email: .username
            role: .role.name
            timeZone: .timeZone
            isVerified: .verified
            isBlocked: .blocked
            address: .userAddress
            createdAt: .createdAt
```

</details>


## Team

<details>
<summary>Team blueprint</summary>

```json showLineNumbers
{
  "identifier": "opsGenieTeam",
  "description": "This blueprint represents an OpsGenie team in our software catalog",
  "title": "OpsGenie Team",
  "icon": "OpsGenie",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description",
        "icon": "DefaultProperty"
      },
      "url": {
        "title": "URL",
        "type": "string",
        "description": "URL to the service",
        "format": "url",
        "icon": "DefaultProperty"
      },
      "oncallUsers": {
        "type": "array",
        "title": "Current Oncalls",
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
  "relations": {
    "members": {
      "title": "Members",
      "target": "opsGenieUser",
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
  - kind: team
    selector:
      query: 'true'
      includeMembers: true
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"opsGenieTeam"'
          properties:
            description: .description
            url: .links.web
          relations:
            members: if .__members != null then .__members | map(.user.id) else [] end
```

</details>


## Schedule

<details>
<summary>Schedule blueprint</summary>

```json showLineNumbers
{
  "identifier": "opsGenieSchedule",
  "description": "This blueprint represents a OpsGenie schedule in our software catalog",
  "title": "OpsGenie Schedule",
  "icon": "OpsGenie",
  "schema": {
    "properties": {
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
      },
      "rotationType": {
        "type": "string",
        "title": "Rotation Type"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "ownerTeam": {
      "title": "Owner Team",
      "target": "opsGenieTeam",
      "required": false,
      "many": false
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
  - kind: schedule
    selector:
      query: 'true'
      apiQueryParams:
        expand: rotation
    port:
      itemsToParse: .rotations
      entity:
        mappings:
          identifier: .id + "_" + .item.id
          title: .name + "_" + .item.name
          blueprint: '"opsGenieSchedule"'
          properties:
            timezone: .timezone
            description: .description
            startDate: .item.startDate
            endDate: .item.endDate
            rotationType: .item.type
            users: '[.item.participants[] | select(has("username")) | .username]'
          relations:
            ownerTeam: .ownerTeam.id
```

</details>


## Service

<details>
<summary>Service blueprint</summary>

```json showLineNumbers
{
  "identifier": "opsGenieService",
  "description": "This blueprint represents an OpsGenie service in our software catalog",
  "title": "OpsGenie Service",
  "icon": "OpsGenie",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description",
        "icon": "DefaultProperty"
      },
      "url": {
        "title": "URL",
        "type": "string",
        "description": "URL to the service",
        "format": "url",
        "icon": "DefaultProperty"
      },
      "tags": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "title": "Tags",
        "icon": "DefaultProperty"
      }
    },
    "required": []
  },
  "mirrorProperties": {
    "oncallUsers": {
      "title": "Current Oncalls",
      "path": "ownerTeam.oncallUsers"
    }
  },
  "calculationProperties": {
  },
  "aggregationProperties": {
    "numberOfOpenIncidents": {
      "title": "Number of open incidents",
      "type": "number",
      "target": "opsGenieIncident",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "status",
            "operator": "=",
            "value": "open"
          }
        ]
      },
      "calculationSpec": {
        "calculationBy": "entities",
        "func": "count"
      }
    }
  },
  "relations": {
    "ownerTeam": {
      "title": "Owner Team",
      "target": "opsGenieTeam",
      "required": false,
      "many": false
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
  - kind: service
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"opsGenieService"'
          properties:
            description: .description
            url: .links.web
            tags: .tags
          relations:
            ownerTeam: .teamId
```

</details>

## Incident

<details>
<summary>Incident blueprint</summary>

```json showLineNumbers
{
  "identifier": "opsGenieIncident",
  "description": "This blueprint represents an OpsGenie incident in our software catalog",
  "title": "OpsGenie Incident",
  "icon": "OpsGenie",
  "schema": {
    "properties": {
      "description": {
        "title": "Description",
        "type": "string"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "enum": [
          "closed",
          "open",
          "resolved"
        ],
        "enumColors": {
          "closed": "blue",
          "open": "red",
          "resolved": "green"
        },
        "description": "The status of the incident"
      },
      "url": {
        "type": "string",
        "format": "url",
        "title": "URL"
      },
      "tags": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "title": "Tags"
      },
      "priority": {
        "type": "string",
        "title": "Priority"
      },
      "createdAt": {
        "title": "Create At",
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
  "relations": {
    "services": {
      "title": "Impacted Services",
      "target": "opsGenieService",
      "many": true,
      "required": false
    },
    "respondingTeam": {
      "title": "Responding Team",
      "target": "opsGenieTeam",
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
  - kind: incident
    selector:
      query: 'true'
      apiQueryParams:
        status: open
    port:
      entity:
        mappings:
          identifier: .id
          title: .message
          blueprint: '"opsGenieIncident"'
          properties:
            status: .status
            responders: .responders
            priority: .priority
            tags: .tags
            url: .links.web
            createdAt: .createdAt
            updatedAt: .updatedAt
            description: .description
          relations:
            services: .impactedServices
            respondingTeam: .responders | [.[] | select(.type == "team") | .id]
```

</details>

## Alert

<details>
<summary>Alert blueprint</summary>

```json showLineNumbers
{
  "identifier": "opsGenieAlert",
  "description": "This blueprint represents an OpsGenie alert in our software catalog",
  "title": "OpsGenie Alert",
  "icon": "OpsGenie",
  "schema": {
    "properties": {
      "description": {
        "title": "Description",
        "type": "string"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "enum": [
          "closed",
          "open"
        ],
        "enumColors": {
          "closed": "green",
          "open": "red"
        },
        "description": "The status of the alert"
      },
      "acknowledged": {
        "type": "boolean",
        "title": "Acknowledged"
      },
      "tags": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "title": "Tags"
      },
      "integration": {
        "type": "string",
        "title": "Integration",
        "description": "The name of the Integration"
      },
      "priority": {
        "type": "string",
        "title": "Priority"
      },
      "sourceName": {
        "type": "string",
        "title": "Source Name",
        "description": "Alert source name"
      },
      "createdBy": {
        "title": "Created By",
        "type": "string",
        "format": "user"
      },
      "createdAt": {
        "title": "Create At",
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time"
      },
      "count": {
        "title": "Count",
        "type": "number"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "relatedIncident": {
      "title": "Related Incident",
      "target": "opsGenieIncident",
      "required": false,
      "many": false
    },
    "respondingTeam": {
      "title": "Responding Team",
      "target": "opsGenieTeam",
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
  - kind: alert
    selector:
      query: 'true'
      apiQueryParams:
        status: open
    port:
      entity:
        mappings:
          identifier: .id
          title: .message
          blueprint: '"opsGenieAlert"'
          properties:
            status: .status
            acknowledged: .acknowledged
            responders: .responders
            priority: .priority
            sourceName: .source
            tags: .tags
            count: .count
            createdBy: .owner
            createdAt: .createdAt
            updatedAt: .updatedAt
            description: .description
            integration: .integration.name
          relations:
            relatedIncident: 'if (.alias | contains("_")) then (.alias | split("_")[0]) else null end'
            respondingTeam: .responders | [.[] | select(.type == "team") | .id]
```

</details>

:::tip filter alerts and incidents
The integration provides an option to filter the data that is retrieved from the OpsGenie API using the following attributes:

1. `createdAt`: The date and time the alert or incident was created
2. `lastOccurredAt`: The date and time the alert or incident was last occurred
3. `snoozedUntil`: The date and time the alert or incident was snoozed until
4. `priority`: The priority of the alert or incident. Accepts values such as `P1`, `P2`, `P3`, `P4` and `P5`
5. `status`: The status of the alert or incident. Accepts values such as `open`, `closed` and `resolved`
6. `isSeen`: Whether the alert or incident has been seen. Accepts a boolean `true` or `false`
7. `acknowledged`: Whether the alert or incident has been acknowledged. Accepts a boolean `true` or `false`
8. `snoozed`: Whether the alert or incident has been snoozed. Accepts a boolean `true` or `false`
9. `owner`: The owner of the alert or incident. Accepts an OpsGenie username
10. `teams`: The teams associated with the alert or incident
11. `acknowledgedBy`: The user who acknowledged the alert or incident
12. `closedBy`: The user who closed the alert or incident
13. `message`: The message of the alert or incident

These attributes can be enabled using the path: `selector.apiQueryParams`. By default, the integration fetches `open` alerts and incidents.
:::

## Current On-call
To bring the current on-call users, update your configuration mapping to populate the `OpsGenieTeam` blueprint with team and on-call data. This will enable you to view on-call information at the service level:

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: schedule-oncall
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .ownerTeam.id
          title: .ownerTeam.name
          blueprint: '"opsGenieTeam"'
          properties:
            oncallUsers: .__currentOncalls.onCallRecipients
```

</details>
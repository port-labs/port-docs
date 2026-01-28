---
sidebar_position: 4
title: Examples
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Workflow examples

<ClosedBetaFeatureNotice id="workflows" />

This page provides real-world examples of workflows for common use cases.

## Self-service examples

### Scaffold a new microservice

Create a new service repository and register it in Port:

```json showLineNumbers
{
  "identifier": "scaffold-service",
  "title": "Scaffold New Service",
  "icon": "Microservice",
  "description": "Create a new microservice from a template",
  "nodes": [
    {
      "identifier": "trigger",
      "title": "Service Details",
      "config": {
        "type": "SELF_SERVE_TRIGGER",
        "userInputs": {
          "properties": {
            "serviceName": {
              "type": "string",
              "title": "Service Name",
              "description": "Name for the new service (lowercase, no spaces)"
            },
            "language": {
              "type": "string",
              "title": "Language",
              "enum": ["python", "nodejs", "go", "java"],
              "enumColors": {
                "python": "blue",
                "nodejs": "green",
                "go": "turquoise",
                "java": "orange"
              }
            },
            "team": {
              "type": "string",
              "format": "team",
              "title": "Owning Team"
            },
            "description": {
              "type": "string",
              "title": "Description"
            }
          },
          "required": ["serviceName", "language", "team"]
        }
      }
    },
    {
      "identifier": "create-repo",
      "title": "Create Repository",
      "config": {
        "type": "INTEGRATION_ACTION",
        "installationId": "gh-integration-123",
        "integrationProvider": "GITHUB",
        "integrationInvocationType": "CREATE",
        "integrationActionExecutionProperties": {
          "repo": "my-org/platform-templates",
          "workflowId": "scaffold-service.yml",
          "inputs": {
            "service_name": "{{ .outputs.trigger.serviceName }}",
            "language": "{{ .outputs.trigger.language }}",
            "description": "{{ .outputs.trigger.description }}"
          },
          "reportStatus": true
        }
      }
    },
    {
      "identifier": "create-entity",
      "title": "Register in Port",
      "config": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "service",
        "mapping": {
          "identifier": "{{ .outputs.trigger.serviceName }}",
          "title": "{{ .outputs.trigger.serviceName }}",
          "team": "{{ .outputs.trigger.team }}",
          "properties": {
            "language": "{{ .outputs.trigger.language }}",
            "description": "{{ .outputs.trigger.description }}",
            "repository": "https://github.com/my-org/{{ .outputs.trigger.serviceName }}",
            "status": "development",
            "createdAt": "{{ now | date \"2006-01-02T15:04:05Z\" }}"
          }
        }
      }
    },
    {
      "identifier": "notify",
      "title": "Send Notification",
      "config": {
        "type": "WEBHOOK",
        "url": "https://hooks.slack.com/services/xxx",
        "method": "POST",
        "body": {
          "text": "New service *{{ .outputs.trigger.serviceName }}* created",
          "blocks": [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "New service *{{ .outputs.trigger.serviceName }}* has been scaffolded:\n• Language: {{ .outputs.trigger.language }}\n• Team: {{ .outputs.trigger.team }}\n• Repository: https://github.com/my-org/{{ .outputs.trigger.serviceName }}"
              }
            }
          ]
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "create-repo"
    },
    {
      "sourceIdentifier": "create-repo",
      "targetIdentifier": "create-entity"
    },
    {
      "sourceIdentifier": "create-entity",
      "targetIdentifier": "notify"
    }
  ]
}
```

### Deploy with condition based on environment

```json showLineNumbers
{
  "identifier": "deploy-service",
  "title": "Deploy Service",
  "icon": "Deployment",
  "nodes": [
    {
      "identifier": "trigger",
      "title": "Deployment Request",
      "config": {
        "type": "SELF_SERVE_TRIGGER",
        "userInputs": {
          "properties": {
            "service": {
              "type": "string",
              "format": "entity",
              "blueprint": "service",
              "title": "Service"
            },
            "version": {
              "type": "string",
              "title": "Version"
            },
            "environment": {
              "type": "string",
              "title": "Environment",
              "enum": ["development", "staging", "production"]
            }
          },
          "required": ["service", "version", "environment"]
        }
      }
    },
    {
      "identifier": "check-env",
      "title": "Check Environment",
      "config": {
        "type": "CONDITION",
        "options": [
          {
            "identifier": "production",
            "title": "Production",
            "expression": ".outputs.trigger.environment == \"production\""
          },
          {
            "identifier": "non-production",
            "title": "Non-Production",
            "expression": ".outputs.trigger.environment != \"production\""
          }
        ]
      }
    },
    {
      "identifier": "deploy-prod",
      "title": "Deploy to Production",
      "config": {
        "type": "WEBHOOK",
        "url": "https://api.example.com/deploy/production",
        "method": "POST",
        "body": {
          "service": "{{ .outputs.trigger.service }}",
          "version": "{{ .outputs.trigger.version }}",
          "requiresApproval": true
        }
      }
    },
    {
      "identifier": "deploy-nonprod",
      "title": "Deploy to Non-Production",
      "config": {
        "type": "WEBHOOK",
        "url": "https://api.example.com/deploy",
        "method": "POST",
        "body": {
          "service": "{{ .outputs.trigger.service }}",
          "version": "{{ .outputs.trigger.version }}",
          "environment": "{{ .outputs.trigger.environment }}"
        }
      }
    },
    {
      "identifier": "update-status",
      "title": "Update Deployment Status",
      "config": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "service",
        "mapping": {
          "identifier": "{{ .outputs.trigger.service }}",
          "properties": {
            "lastDeployedVersion": "{{ .outputs.trigger.version }}",
            "lastDeployedAt": "{{ now | date \"2006-01-02T15:04:05Z\" }}"
          }
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "check-env"
    },
    {
      "sourceIdentifier": "check-env",
      "targetIdentifier": "deploy-prod",
      "sourceOptionIdentifier": "production"
    },
    {
      "sourceIdentifier": "check-env",
      "targetIdentifier": "deploy-nonprod",
      "sourceOptionIdentifier": "non-production"
    },
    {
      "sourceIdentifier": "deploy-prod",
      "targetIdentifier": "update-status"
    },
    {
      "sourceIdentifier": "deploy-nonprod",
      "targetIdentifier": "update-status"
    }
  ]
}
```

## Automation examples

### Auto-assign team on service creation

```json showLineNumbers
{
  "identifier": "auto-assign-team",
  "title": "Auto-assign Team on Service Creation",
  "nodes": [
    {
      "identifier": "trigger",
      "title": "On Service Created",
      "config": {
        "type": "EVENT_TRIGGER",
        "event": {
          "type": "ENTITY_CREATED",
          "blueprintIdentifier": "service"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.team == null or .diff.after.team == []"
          ]
        }
      }
    },
    {
      "identifier": "assign-team",
      "title": "Assign Default Team",
      "config": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "service",
        "mapping": {
          "identifier": "{{ .outputs.trigger.diff.after.identifier }}",
          "team": "platform-team"
        }
      }
    },
    {
      "identifier": "notify",
      "title": "Notify Platform Team",
      "config": {
        "type": "WEBHOOK",
        "url": "https://hooks.slack.com/services/xxx",
        "method": "POST",
        "body": {
          "text": "Service *{{ .outputs.trigger.diff.after.title }}* was created without a team and has been assigned to Platform Team"
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "assign-team"
    },
    {
      "sourceIdentifier": "assign-team",
      "targetIdentifier": "notify"
    }
  ]
}
```

### Notify on critical service degradation

```json showLineNumbers
{
  "identifier": "notify-degradation",
  "title": "Notify on Service Degradation",
  "nodes": [
    {
      "identifier": "trigger",
      "title": "On Status Change",
      "config": {
        "type": "EVENT_TRIGGER",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "service"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.properties.tier == \"critical\"",
            ".diff.before.properties.healthStatus == \"healthy\"",
            ".diff.after.properties.healthStatus != \"healthy\""
          ],
          "combinator": "and"
        }
      }
    },
    {
      "identifier": "notify-slack",
      "title": "Alert Slack",
      "config": {
        "type": "WEBHOOK",
        "url": "https://hooks.slack.com/services/xxx",
        "method": "POST",
        "body": {
          "text": "ALERT: Critical service {{ .outputs.trigger.diff.after.title }} health status changed from {{ .outputs.trigger.diff.before.properties.healthStatus }} to {{ .outputs.trigger.diff.after.properties.healthStatus }}",
          "attachments": [
            {
              "color": "danger",
              "fields": [
                {
                  "title": "Service",
                  "value": "{{ .outputs.trigger.diff.after.title }}",
                  "short": true
                },
                {
                  "title": "Previous Status",
                  "value": "{{ .outputs.trigger.diff.before.properties.healthStatus }}",
                  "short": true
                },
                {
                  "title": "Current Status",
                  "value": "{{ .outputs.trigger.diff.after.properties.healthStatus }}",
                  "short": true
                }
              ]
            }
          ]
        }
      }
    },
    {
      "identifier": "create-incident",
      "title": "Create PagerDuty Incident",
      "config": {
        "type": "WEBHOOK",
        "url": "https://events.pagerduty.com/v2/enqueue",
        "method": "POST",
        "body": {
          "routing_key": "{{ .secrets[\"pagerduty-key\"] }}",
          "event_action": "trigger",
          "payload": {
            "summary": "Critical service {{ .outputs.trigger.diff.after.title }} is degraded",
            "severity": "critical",
            "source": "port-workflows",
            "custom_details": {
              "service": "{{ .outputs.trigger.diff.after.identifier }}",
              "previous_status": "{{ .outputs.trigger.diff.before.properties.healthStatus }}",
              "current_status": "{{ .outputs.trigger.diff.after.properties.healthStatus }}"
            }
          }
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "notify-slack"
    },
    {
      "sourceIdentifier": "notify-slack",
      "targetIdentifier": "create-incident"
    }
  ]
}
```

### TTL-based environment cleanup

```json showLineNumbers
{
  "identifier": "cleanup-expired-env",
  "title": "Cleanup Expired Environments",
  "nodes": [
    {
      "identifier": "trigger",
      "title": "On TTL Expired",
      "config": {
        "type": "EVENT_TRIGGER",
        "event": {
          "type": "TIMER_EXPIRED",
          "blueprintIdentifier": "environment",
          "propertyIdentifier": "ttl"
        }
      }
    },
    {
      "identifier": "mark-expired",
      "title": "Mark as Expired",
      "config": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "environment",
        "mapping": {
          "identifier": "{{ .outputs.trigger.diff.after.identifier }}",
          "properties": {
            "status": "expired"
          }
        }
      }
    },
    {
      "identifier": "trigger-cleanup",
      "title": "Trigger Infrastructure Cleanup",
      "config": {
        "type": "WEBHOOK",
        "url": "https://api.example.com/cleanup",
        "method": "POST",
        "body": {
          "environmentId": "{{ .outputs.trigger.diff.after.identifier }}",
          "cloudProvider": "{{ .outputs.trigger.diff.after.properties.cloudProvider }}",
          "region": "{{ .outputs.trigger.diff.after.properties.region }}"
        }
      }
    },
    {
      "identifier": "notify-owner",
      "title": "Notify Owner",
      "config": {
        "type": "WEBHOOK",
        "url": "https://hooks.slack.com/services/xxx",
        "method": "POST",
        "body": {
          "text": "Environment *{{ .outputs.trigger.diff.after.title }}* has expired and is being cleaned up.",
          "channel": "{{ .outputs.trigger.diff.after.properties.slackChannel }}"
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "mark-expired"
    },
    {
      "sourceIdentifier": "mark-expired",
      "targetIdentifier": "trigger-cleanup"
    },
    {
      "sourceIdentifier": "trigger-cleanup",
      "targetIdentifier": "notify-owner"
    }
  ]
}
```

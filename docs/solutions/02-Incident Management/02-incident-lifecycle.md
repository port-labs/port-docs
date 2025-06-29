---
title: Incident Lifecycle
---

# Manage the Incident's Lifecycle

When incidents happen, speed and clarity matter. But when your alerts are scattered across tools and workflows for managing an incident's lifecycle are fragmented, even simple incidents can spiral into slow, chaotic responses.

There is a huge advantage in bringing your alerts and full incident lifecycle into a single control pane, the same place where you will manage incident communication, or actively investigate the incident.

This solution page, will show you how to unify all your signals, take ownership faster, and close incidents with confidence.

## Unify Alerts

Your observability and APM tools are great at surfacing signals. However, when each alert lives in its own silo, or lack the broader sociotechnical and business context, it’s hard to get the full picture. In Port, we centralize all your suspected alerts and relevant telemetry in one place—so you can instantly see:

- What’s firing?
- Which services are affected?
- Is this part of a known issue?
- What other issues may be related?

By unifying these alerts, you remove the guesswork and eliminate the “hunt” across tabs and tools.

To do so, we first start by creating our alert blueprint:

```
{
  "identifier": "alert",
  "title": "Alert",
  "icon": "Alert",
  "schema": {
    "properties": {
      "title": {
        "type": "string",
        "title": "Title",
        "description": "A short summary of the alert"
      },
      "description": {
        "type": "string",
        "title": "Description",
        "description": "Detailed description of the alert"
      },
      "severity": {
        "type": "string",
        "title": "Severity",
        "description": "Severity level (e.g., critical, warning, info)"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "description": "Current status (e.g., open, acknowledged, resolved)"
      },
      "source": {
        "type": "string",
        "title": "Source System",
        "description": "The system that generated the alert (e.g., Prometheus, Grafana, Datadog, etc.)"
      },
      "externalId": {
        "type": "string",
        "title": "External ID",
        "description": "The unique identifier of the alert in the source system"
      },
      "startedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Started At",
        "description": "Timestamp when the alert started"
      },
      "endedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Ended At",
        "description": "Timestamp when the alert ended (if resolved)"
      },
      "rawPayload": {
        "type": "object",
        "title": "Raw Payload",
        "description": "Original payload from the source system for extensibility"
      }
    },
    "required": ["title", "severity", "status", "source", "externalId", "startedAt"]
  },
  "calculationProperties": {},
  "relations": {}
}
```

Follow the following guides to bring your alert sources into Port (TODO - we will rewrite all guides to coerce alerts to the default blueprint):
- [Prometheus](https://docs.port.io/build-your-software-catalog/custom-integration/webhook/examples/prometheus)
- [Grafana](https://docs.port.io/build-your-software-catalog/custom-integration/webhook/examples/grafana)
- [Dynatrace Problems](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/apm-alerting/dynatrace/#problem)
- [Datadog Monitors](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/apm-alerting/datadog/examples#monitor)
- [New Relic Issue](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/apm-alerting/newrelic#issue)
- [Sentry Issue](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/apm-alerting/newrelic#issue)

Now, we need to create a dashboard to show our alerts, 
- TODO: Create Guide

Finally, we a self-service actions, to simplify the process of triggering an incident for a given alert.
- TODO: Create guide & SSA

## Manage Incident Lifecycle


Now that you can see all the alerts in context, the next decision is simple: Is there already an incident open for this?

Port makes it easy to know and manage:

- Has an incident already been triggered for this issue?
- If yes, take ownership or update status directly.
- If no, open a new incident—with all the context pre-attached.

No duplication. No friction. Just decisive action in the right place.

We'll go over each lifecycle stage for the incident and explore our guides within this context.


### Acknowledge or Reassign Incident

Where developers are greeted with a created incident (either automatically created by an upstream alert, or manually by another user), they have the opportunity to either:

1. acknowledge (accepting "custody" over the incident), or 
2. reassign ownership (shifting the incident to someone else for acknowledgement)

Here are guides for different 3rd party incident management tools:

- Pagerduty:
    - [Acknowledge Incident](https://docs.port.io/guides/all/acknowledge-incident)
    - [Reassign Incident](https://docs.port.io/guides/all/change-pagerduty-incident-owner)
- Opsgenie (TODO - write guides):
    - [Acknowledge Incident](#)
    - [Reassign Incident](#)
- ServiceNow (TODO - write guides):
    - [Acknowledge Incident](#)
    - [Reassign Incident](#)
- Port Native (No incident SaaS)  (TODO - write guides)
    - [Acknowledge Incident](#)
    - [Reassign Incident](#)

### Trigger Incident

Sometimes, no incident is created for us. It could be that:

- There is no alert or automation, and the incident is reported by a customer or employee
- There is an alert, but no automation, as the alert is not indicative of an incident without review
- There are alerts and automations for creating incidents, but it is an unforeseen cause that we were unprepared for and the incident is discovered by a customer or employee

Regardless of the case, it is important to streamline the triggering of incidents and enable developers to do so independently.

- Pagerduty:
    - [Trigger an Incident](https://docs.port.io/guides/all/create-pagerduty-incident)
- Opsgenie (TODO - write guides):
    - [Trigger an Incident](https://docs.port.io/guides/all/create-an-opsgenie-incident)
- ServiceNow (TODO - write guides):
    - [Trigger an Incident](https://docs.port.io/guides/all/trigger-servicenow-incident)
- Port Native (No incident SaaS)  (TODO - write guides)
    - [Trigger an Incident](#)
- JIRA (TODO - write guides)
    - [Trigger an Incident](#)
- Incident.io
    - [Trigger an Incident](https://docs.port.io/guides/all/create-incident-io-incident)
- Firehydrant
    - [Trigger an Incident](https://docs.port.io/guides/all/create-firehydrant-incident)

### Associate the Incident with Impacted Services

Incidents are opened based off an observed behaviour, without an understanding of cause or source. If the cause was always known or the impacted services - incident management would be simple after all!

As such, incidents are rarely associated with services when created. An automation or a person will create an incident, and subsequently, as developers and SREs work to diagnose the issue, it becomes clear which service may be failing or at fault.

Port makes it really easy to associate an active incident with one or more affected services. Once identified, Port can also use trace data (which service calls and is called by another), to drive automations for services up and downstream of the issue.

- Pagerduty (TODO - write guides):
    - [Associate Incident with Service](#)
- Opsgenie (TODO - write guides):
    - [Associate Incident with Service](#)
- ServiceNow (TODO - write guides):
    - [Associate Incident with Service](#)
- Port Native (No incident SaaS)  (TODO - write guides)
    - [Associate Incident with Service](#)

### Escalate Incident

When an incident needs more eyes, or different knowledge and experience, Port simplifies your escalation workflow, to help you notify the right people or teams quickly. Whether that means paging on-call engineers, looping in SREs, or alerting leadership, it’s all accessible from the same view.

Since the incident lives alongside its context, escalations come with everything someone new needs to ramp up fast.

- Pagerduty:
    - [Escalate an Incident](https://docs.port.io/guides/all/escalate-an-incident)
- Opsgenie (TODO - write guides):
    - [Escalate an Incident](#)
- ServiceNow (TODO - write guides):
    - [Escalate an Incident](#)
- Port Native (No incident SaaS)  (TODO - write guides)
    - [Escalate an Incident](#)

One further step you can take is to enable your oncall engineers to colleagues with relevant experience. Need a Redis expert, or a Mongo sharding wizard - make it easy for your engineers to find the right help when they need it.
    - [Skill Exchange](#)

- TODO: link to skill exchange action

### Resolve Incident

Once resolution is in sight, closing the incident from Port is just as seamless. All communication, alerts, updates, and logs remain attached to the incident record—making it easier to review later during postmortems or retrospectives.

- Pagerduty:
    - [Resolve an Incident](https://docs.port.io/guides/all/resolve-pagerduty-incident)

You’re not just marking something as done. You’re creating a complete, traceable lifecycle—all in one place.

[Follow this guide](https://docs.port.io/guides/all/resolve-pagerduty-incident)

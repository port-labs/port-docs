---
sidebar_position: 6
---

# Timer Properties

Timer properties allow you to define an expiration date on a specific property. Timer properties allows the provisioning of a temporary anything through developer self-service actions:

- Temporary integration environments;
- Temporary cloud or environment permissions;
- Temporary cloud resources and more.

## Timer properties JSON schema

```json showLineNumbers
"properties": {
    "prop1": {
        "title": "Timer property",
        "type": "string",
        "format": "timer"
    }
}
```

## Timer properties deep dive

Let's look at some examples of basic timer properties definitions to better understand how timer properties work.

In the following example, we will create a timer property called locked, that will expire in 2 hours:

```json showLineNumbers
  "identifier": "e_mtLQRs6sqQOaz7QP",
  "title": "Timer Example",
  "icon": "Microservice",
  "blueprint": "timerExample",
  "properties": {
    "timer": "2022-12-01T16:50:00+02:00"
  },
  "relations": {}
```

![Timer entity](../../../static/img/software-catalog/entity/TTLCreateEntity.png)

After 2 hours, the property status will change to `Expired`, and an event of `Timer Expired` will be sent to the [ChangeLog](../blueprint/blueprint.md#changelog-destination).

The following [action invocation body](../../self-service-actions/self-service-actions-deep-dive/self-service-actions-deep-dive.md#self-service-action-run-payload) is sent to the Webhook/Kafka topic:

```json showLineNumbers
{
  "identifier": "event_4QyQDmuzaAhY8lM2",
  "context": {
    "blueprintIdentifier": "timerExample",
    "entityId": "e_mtLQRs6sqQOaz7QP",
    "blueprintId": "bp_djjY7NcdzHdpxI1y",
    "entityIdentifier": "e_mtLQRs6sqQOaz7QP"
  },
  "action": "TIMER_EXPIRED",
  "trigger": {
    "at": "2022-12-01T16:50:00+02:00",
    "by": {
      "port": true,
      "orgId": "org_example"
    },
    "origin": "API"
  },
  "additionalData": {
    "property": "timer"
  },
  "_orgId": "org_example",
  "resourceType": "entity",
  "status": "SUCCESS"
}
```

![Timer entity expired](../../../static/img/software-catalog/entity/TTLExpiredEntity.png)

![Timer Audit log](../../../static/img/software-catalog/entity/AuditLogTTL.png)

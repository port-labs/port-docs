---
sidebar_position: 6
---

# TTL Properties

TTL Properties allow you to define an expiration date on a specific property.

## TTL Properties JSON schema

```json showLineNumbers
"properties": {
    "prop1": {
        "title": "TTl property",
        "type": "string",
        "format": "TTL"
    }
}
```

## `TTL` Properties deep dive

Let's look at some examples of basic TTL Properties definitions to better understand how TTL Properties work:

In the following example, we create a TTL Property called locked, that will be expired in 2 hours:

```json showLineNumbers
  "identifier": "e_mtLQRs6sqQOaz7QP",
  "title": "TTL-example",
  "icon": "Microservice",
  "blueprint": "TTL-example",
  "properties": {
    "ttl": "2022-12-01T16:50:00+02:00"
  },
  "relations": {}
```

![TTL entity](../../../static/img/software-catalog/entity/TTLCreateEntity.png)

After 2 hours, the property will become `Expired`, and a event will send to the [ChangeLog](../blueprint/blueprint.md#changelog-destination).

![TTL entity expired](../../../static/img/software-catalog/entity/TTLExpiredEntity.png)

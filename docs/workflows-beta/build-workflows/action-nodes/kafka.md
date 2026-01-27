---
sidebar_position: 4
title: Kafka
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Kafka

<ClosedBetaFeatureNotice id="workflows-beta" />

The Kafka action node publishes messages to Port's dedicated Kafka topic for your organization. This allows you to process workflow events using your own consumers.

## Prerequisites

To use Kafka as an action type, you need a dedicated Kafka topic from Port. Contact [Port's support team](mailto:support@getport.io) to provision one.

## Configuration

| Field | Type | Description |
| ----- | ---- | ----------- |
| `type` | `"KAFKA"` | **Required.** Must be `"KAFKA"` |
| `payload` | `object` \| `array` | The message payload to publish |

## Basic example

```json showLineNumbers
{
  "identifier": "publish-event",
  "title": "Publish to Kafka",
  "config": {
    "type": "KAFKA",
    "payload": {
      "eventType": "deployment.started",
      "service": "{{ .outputs.trigger.service }}",
      "version": "{{ .outputs.trigger.version }}",
      "environment": "{{ .outputs.trigger.environment }}",
      "timestamp": "{{ now | date \"2006-01-02T15:04:05Z\" }}"
    }
  }
}
```

## Message format

The Kafka action publishes messages to your organization's topic (`{orgId}.runs`). Your consumer will receive the payload you configured, wrapped with additional metadata about the workflow run.

## Use cases

### Event-driven architecture

Publish workflow events for downstream processing:

```json showLineNumbers
{
  "config": {
    "type": "KAFKA",
    "payload": {
      "event": "service.deployed",
      "data": {
        "serviceId": "{{ .outputs.trigger.service }}",
        "version": "{{ .outputs.trigger.version }}",
        "environment": "{{ .outputs.trigger.environment }}"
      },
      "metadata": {
        "timestamp": "{{ now | date \"2006-01-02T15:04:05Z\" }}"
      }
    }
  }
}
```

### Trigger external processing

Send data to be processed by external systems:

```json showLineNumbers
{
  "config": {
    "type": "KAFKA",
    "payload": {
      "action": "provision-infrastructure",
      "parameters": {
        "cloudProvider": "{{ .outputs.trigger.cloudProvider }}",
        "region": "{{ .outputs.trigger.region }}",
        "instanceType": "{{ .outputs.trigger.instanceType }}",
        "count": "{{ .outputs.trigger.count }}"
      },
      "callback": {
      }
    }
  }
}
```

### Array payload

You can also publish an array of messages:

```json showLineNumbers
{
  "config": {
    "type": "KAFKA",
    "payload": [
      {
        "type": "notification",
        "channel": "slack",
        "message": "Deployment started"
      },
      {
        "type": "notification", 
        "channel": "email",
        "message": "Deployment started"
      }
    ]
  }
}
```

## Consumer setup

Your Kafka consumer should listen to the `{orgId}.runs` topic. The message will contain:

- Your custom `payload` from the workflow configuration
- Workflow run metadata
- Node execution context

Example consumer setup (Python):

```python
from kafka import KafkaConsumer
import json

consumer = KafkaConsumer(
    '{orgId}.runs',
    bootstrap_servers=['your-kafka-brokers'],
    group_id='{orgId}.your-consumer-group',
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

for message in consumer:
    payload = message.value
    # Process the workflow event
    print(f"Received: {payload}")
```

## Reporting back to Port

After processing the Kafka message, you can update the workflow run status using Port's API:

```bash
curl -X PATCH "https://api.getport.io/v1/workflows/runs/{run_id}/nodes/{node_run_id}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "result": "SUCCESS",
    "output": {
      "processedAt": "2024-01-15T10:30:00Z"
    }
  }'
```

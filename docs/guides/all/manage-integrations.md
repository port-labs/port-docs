---
sidebar_position: 3
sidebar_label: Monitor integrations
description: Learn how to monitor and manage your Port Ocean integrations for improved visibility and performance tracking.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Monitor integrations

This guide will help you set up monitoring and management capabilities for your Port Ocean integrations.

By implementing this monitoring setup, you'll be able to track:
- Overall integration sync status and timing
- Detailed metrics per integration kind
- Object counts at various stages (raw, transformed, ingested)
- Sync duration and performance metrics

<img src='/img/guides/integrationsTableStats.png' width='90%' />
<img src='/img/guides/IntegrationsTableSyncKindStats.png' width='90%' />


## Prerequisites

Before you begin, make sure you have:
- Self-hosted Ocean integrations installed
- Port Ocean version v0.22.0 or later

## Common use cases

- Monitor the health and performance of your integrations
- Track sync status and timing across different integration kinds
- Identify potential issues in the extract-transform-load (ETL) pipeline
- Measure the efficiency of your data ingestion process

## Data model setup

Use the following two blueprints to structure your integration data in Port:

**Integration**
Tracks overall resync status, duration, and timing.

<details>
  <summary>Integration Blueprint</summary>

```json showLineNumbers
{
  "identifier": "integration",
  "title": "Integration",
  "icon": "Ocean",
  "schema": {
    "properties": {
      "last_resync_completion_status": {
        "type": "string",
        "title": "Last Resync Completion Status",
        "icon": "Reset",
        "enum": [
          "SUCCESS",
          "FAILED"
        ],
        "enumColors": {
          "SUCCESS": "green",
          "FAILED": "red"
        }
      },
      "last_resync_duration": {
        "type": "number",
        "title": "Last Resync Duration Seconds",
        "icon": "Clock"
      },
      "last_resync_at": {
        "icon": "Updates",
        "type": "string",
        "title": "Last Resync At",
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

**Integration Kind Metrics**
Tracks detailed metrics for specific integration kinds, including raw, transformed, and ingested objects.

<details>
  <summary>Integration Kind Metrics Blueprint</summary>

```json showLineNumbers
{
  "identifier": "integration_kind_metrics",
  "description": "Metrics on integration sync kind",
  "title": "Integration Kind Metrics",
  "icon": "Ocean",
  "schema": {
    "properties": {
      "kind": {
        "icon": "Sync",
        "type": "string",
        "title": "Kind"
      },
      "raw_objects": {
        "icon": "JsonEditor",
        "type": "number",
        "title": "Raw Objects"
      },
      "transformed_objects": {
        "icon": "Travel",
        "type": "number",
        "title": "Transformed Objects"
      },
      "entities_ingested": {
        "icon": "Port",
        "type": "number",
        "title": "Entities Ingested"
      },
      "duration": {
        "icon": "Clock",
        "type": "number",
        "title": "Duration"
      },
      "last_completion_status": {
        "type": "string",
        "title": "Last Completion Status",
        "icon": "Reset",
        "enum": [
          "SUCCESS",
          "FAILED"
        ],
        "enumColors": {
          "SUCCESS": "green",
          "FAILED": "red"
        }
      },
      "last_sync_at": {
        "type": "string",
        "title": "Last Sync At",
        "icon": "Clock",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "integration": {
      "title": "Integration",
      "target": "integration",
      "required": false,
      "many": false
    }
  }
}
```

</details>

## Webhook setup

1. In Port, navigate to **Webhooks**.
2. Create a new webhook.
3. Copy and store the generated webhook URL - you'll need it later.
4. Add the following mapping below.

**For Integration Kind Metrics**:
<details>
  <summary>Integration Kind Metrics Webhook Mapping</summary>

```json showLineNumbers
{
  "blueprint": "integration_kind_metrics",
  "operation": "create",
  "filter": ".body.kind_identifier != '__runtime__'",
  "entity": {
    "identifier": ".body.kind_identifier",
    "title": ".body.kind_identifier",
    "properties": {
      "kind": ".body.kind",
      "duration": ".body.metrics.phase.resync.duration_seconds|round",
      "raw_objects": ".body.metrics.phase.extract.object_count",
      "transformed_objects": ".body.metrics.phase.transform.object_count",
      "entities_ingested": ".body.metrics.phase.load.object_count",
      "last_completion_status": "if .body.metrics.phase.resync.success == 1 then \"SUCCESS\" else \"FAILED\" end",
      "last_sync_at": "now | todateiso8601"
    },
    "relations": {
      "integration": ".body.integration_type + \"-\" + .body.integration_identifier"
    }
  }
}
```

</details>

**For Integration Runtime Status**:
<details>
  <summary>Integration Runtime Status Webhook Mapping</summary>

```json showLineNumbers
{
  "blueprint": "integration",
  "operation": "create",
  "filter": ".body.kind_identifier == '__runtime__'",
  "entity": {
    "identifier": ".body.integration_type + \"-\" + .body.integration_identifier",
    "title": ".body.integration_identifier",
    "properties": {
      "last_resync_duration": ".body.metrics.phase.resync.duration_seconds|round",
      "last_resync_completion_status": "if .body.metrics.phase.resync.success == 1 then \"SUCCESS\" else \"FAILED\" end",
      "last_resync_at": "now | todateiso8601"
    }
  }
}
```

</details>

Ensure the mappings are correctly added to handle both cases distinctly.

## Configure metrics collection

:::info Version requirement
Make sure you've updated the port-ocean version to use v0.22.0 or later.
:::

To activate metrics collection, pass the following parameters when configuring your integration:

```env showLineNumbers
OCEAN__METRICS__ENABLED=true
OCEAN__METRICS__WEBHOOK_URL=<THE GENERATED WEBHOOK URL>
```

Replace `<THE GENERATED WEBHOOK URL>` with the URL you generated in Step 2.

:::tip
Remember to repeat this step for each integration you want to monitor.
:::

## Create a monitoring dashboard

Now you can set up a dashboard to visualize your integration metrics:

1. Navigate to the **Dashboards** page in Port
2. Click **+ Create Dashboard**
3. Add the following widgets:
   - Integration Status Table - Shows the current status of all integrations
   - Sync Duration Chart - Displays sync duration trends
   - Object Count Comparison - Compares raw vs transformed vs ingested objects
4. Configure each widget to use the data from your integration and integration_kind_metrics entities

## Testing your monitoring

After completing these steps:
1. Trigger your integration sync
2. Check Port to verify the status updates and metrics
3. Review your dashboard to ensure all widgets are populated with data
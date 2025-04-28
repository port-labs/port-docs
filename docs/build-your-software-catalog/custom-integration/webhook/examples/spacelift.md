---
sidebar_position: 20
description: Ingest Spacelift stacks into your catalog
---

import SpaceliftStackBlueprint from './resources/spacelift/\_example_stack_blueprint.mdx'
import SpaceliftStackWebhookConfig from './resources/spacelift/\_example_stack_webhook_configuration.mdx'

# Spacelift

In this example you are going to create a webhook integration between [Spacelift](https://spacelift.io/) and Port, which will ingest stack entities.

## Port configuration

Create the following blueprint definition:

<details>
<summary>Stack blueprint</summary>

<SpaceliftStackBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>

<summary>Stack webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Spacelift Stack Mapper`;
   2. Identifier : `spacelift_stack_mapper`;
   3. Description : `A webhook configuration to map Spacelift stacks to Port`;
   4. Icon : `Git`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <SpaceliftStackWebhookConfig/>

3. Click **Save** at the bottom of the page.

</details>

## Create a webhook in Spacelift

To send webhook events from Spacelift to an external system like Port, you must first create a webhook and then link it to a notification policy. Follow the steps below to complete the setup:

1. Go to **Webhooks** in your Spacelift account;
2. Click **Create webhook**;
3. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. `Endpoint URL` - enter the value of the `url` key you received after creating the webhook configuration;
   3. `Space` - select the space that should have access to the webhook;
4. Enable the **Webhook** toggle;
5. Click **Create** to create the webhook.

## Sending notifications

Spacelift delivers webhook events through notification policies. You must create a policy that triggers events to Port.

To create a notification policy:

1. Go to **Policies** in Spacelift;
2. Click **Create policy**;
3. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook Notification;
   2. `Type` - select `Notification policy` from the list;
   3. `Space` - select the space that should have access to the policy;
   4. `Description` - add a detailed description;
4. Click **Continue** to open the YAML editor where you can bind the notification to the webhook;
5. Add one of the following configurations:

    <details>
    <summary><b>Notification policy configuration (click to expand)</b></summary>

    :::tip Webhook identifier replacement
    Be sure to replace `<YOUR-WEBHOOK-ID>` with the ID you copied from the Spacelift webhook you created
    :::

    ```yaml showLineNumbers
    # Option 1: Trigger on tracked runs finishing

    webhook[{"endpoint_id": "<YOUR-WEBHOOK-ID>"}] {
    input.run_updated.run.type == "TRACKED"
    input.run_updated.run.state == "FINISHED"
    }

    # Option 2: Trigger on any run update

    webhook[{"endpoint_id": "<YOUR-WEBHOOK-ID>"}] {
    input.run_updated != null
    }
    ```
    </details>

6. Click **Create policy**.

Done! any change that happens to your stacks in Spacelift will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

## Let's Test It

This section includes a sample response data from Spacelift. In addition, it includes the entity created from the event based on the configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Spacelift:

<details>
<summary><b>Webhook response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "body": {
    "account": "peygis",
    "state": "FINISHED",
    "stateVersion": 5,
    "timestamp": 1745599888,
    "timestamp_millis": 1745599888383,
    "run": {
      "id": "01JSPXRQR2F3Y06HD85YYXRSZ7",
      "branch": "main",
      "commit": {
        "authorLogin": "PeyGis",
        "authorName": "PagesCoffy",
        "hash": "87c5ffdcf063445657c7082a447cb6a7d60f2c9d",
        "message": "Merge pull request #2 from PeyGis/PeyGis-patch-2",
        "timestamp": 1745516998,
        "url": "https://github.com/PeyGis/argocd-app/commit/87c5ffdcf063445657c7082a447cb6a7d60f2c9d"
      },
      "createdAt": 1745599880,
      "delta": {
        "added": 0,
        "changed": 0,
        "deleted": 0,
        "resources": 0
      },
      "driftDetection": false,
      "triggeredBy": "api::01JSMHTFM9TXWW1XK4AZN1SA8K",
      "type": "TRACKED",
      "url": "https://peygis.app.spacelift.io/stack/ai-agent/run/01JSPXRQR2F3Y06HD85YYXRSZ7"
    },
    "stack": {
      "id": "ai-agent",
      "name": "ai-agent",
      "description": "here is the node",
      "labels": [
        "node"
      ],
      "repository": "PeyGis/argocd-app",
      "url": "https://peygis.app.spacelift.io/stack/ai-agent",
      "vcs": "GITHUB"
    },
    "workerPool": {
      "public": true,
      "labels": [],
      "id": "",
      "name": ""
    },
    "event_source": "spacelift",
    "event_type": "run_state_changed_event"
  },
  "headers": {
    "Host": "ingest.getport.io",
    "User-Agent": "Go-http-client/2.0",
    "Content-Length": "1063",
    "Accept-Encoding": "gzip",
    "Content-Type": "application/json",
    "Traceparent": "00-000000000000000045dc17949932896c-7363f5faf7992244-01",
    "Tracestate": "dd=s:1;p:3705f90ce0614b5d",
    "X-Datadog-Parent-Id": "3964848880668986205",
    "X-Datadog-Sampling-Priority": "1",
    "X-Datadog-Trace-Id": "5033924410486196588",
    "X-Forwarded-Host": "ingest.getport.io",
    "X-Forwarded-Server": "public-traefik-5649595896-pgqbw",
    "X-Real-Ip": "10.0.30.189",
    "X-Replaced-Path": "/xI35fItWHlrYpVQE",
    "X-Signature": "sha1=dd9dc0209c2791f029ccd0cfce0a2548a3e448df",
    "X-Signature-256": "sha256=52a747571c1e7f464424cb4211331f195105bd6dba39aa9a2f4b7124fe747d36",
    "host": "ingest.getport.io",
    "user-agent": "Go-http-client/2.0",
    "content-length": "1063",
    "accept-encoding": "gzip",
    "content-type": "application/json",
    "traceparent": "00-000000000000000045dc17949932896c-7363f5faf7992244-01",
    "tracestate": "dd=s:1;p:3705f90ce0614b5d",
    "x-datadog-parent-id": "3964848880668986205",
    "x-datadog-sampling-priority": "1",
    "x-datadog-trace-id": "5033924410486196588",
    "x-forwarded-host": "ingest.getport.io",
    "x-forwarded-server": "public-traefik-5649595896-pgqbw",
    "x-real-ip": "10.0.30.189",
    "x-replaced-path": "/xI35fItWHlrYpVQE",
    "x-signature": "sha1=dd9dc0209c2791f029ccd0cfce0a2548a3e448df",
    "x-signature-256": "sha256=52a747571c1e7f464424cb4211331f195105bd6dba39aa9a2f4b7124fe747d36"
  },
  "queryParams": {}
}
```

</details>

### Mapping Result

The combination of the sample payload and the webhook configuration generates the following Port entity:

<details>
<summary><b>Stack entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "blueprint": "space_lift_stack",
  "identifier": "ai-agent",
  "createdAt": "2025-04-24T17:57:01.014Z",
  "updatedBy": "space_lift_stack_mapper",
  "createdBy": "space_lift_stack_mapper",
  "team": [],
  "title": "ai-agent",
  "relations": {},
  "properties": {
    "link": "https://peygis.app.spacelift.io/stack/ai-agent",
    "description": "AI agent stack",
    "git_provider": "GITHUB",
    "label": [
      "ai",
      "llm"
    ],
    "state": "FINISHED",
    "repository": "PeyGis/codecov-example",
    "branch": "main",
    "space": null
  },
  "updatedAt": "2025-04-25T13:36:08.155Z"
}
```
</details>

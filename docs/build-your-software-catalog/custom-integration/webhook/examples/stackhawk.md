---
sidebar_position: 12
description: Ingest StackHawk application vulnerabilities into Port
---

import StackHawkVulnerabilityBlueprint from "./resources/stackhawk/\_example_vulnerability_blueprint.mdx";
import StackHawkWebhookConfig from "./resources/stackhawk/\_example_webhook_configuration.mdx";

# StackHawk

In this example, you are going to create a webhook integration between [StackHawk](https://www.stackhawk.com/) and Port, which will ingest application vulnerabilities into Port. This integration will involve setting up a webhook to receive notifications from StackHawk whenever an application is scanned for vulnerabilities, allowing Port to ingest and process the vulnerability entities accordingly.

## Prerequisites

Create the following blueprint definitions and webhook configuration:

<details>
<summary>StackHawk vulnerability blueprint</summary>

<StackHawkVulnerabilityBlueprint/>

</details>

<details>
<summary>StackHawk webhook configuration</summary>

Remember to update the `WEBHOOK_SECRET` and `AUTH_SIGNATURE_HEADER` with the real secret and header value you provided when subscribing to the webhook in StackHawk.

<StackHawkWebhookConfig/>

</details>

### Create the StackHawk webhook

1. Go to [StackHawk](https://app.stackhawk.com) and select the account you want to configure the webhook for.
2. Navigate to **Integrations** in the left navigation bar and click on **Generic Webhook**.
3. Click on **Add Webhook** and provide the following information:
   1. `Name` - enter a name for your webhook.
   2. `Description` - provide a detailed description for your webhook.
   3. `Scan Data For` - choose the application(s) you want to receive webhook events for or choose `Select All` if you want to configure a global webhook for all your applications.
   4. `Scan Events` - choose `Scan Completed` event type.
   5. `Webhook Endpoint URL` - enter the value of the `url` key you received after [creating the webhook configuration](/build-your-software-catalog/custom-integration/webhook#configuring-webhook-endpoints).
   6. `Auth Header Name` - enter the name of the HTTP header that will contain your auth token/key. For example, you can enter `x-stackhawk-port-webhook`.
   7. `Auth Header Value` - enter the secret authentication token that will be added to your webhook payload.
4. Click **Create and Test** to create your webhook.

:::tip
In order to view the different events available in StackHawk webhooks, [look here](https://docs.stackhawk.com/workflow-integrations/webhook.html)
:::

Done! Any changes that happen to your applications in StackHawk will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

## Test the webhook

This section includes a sample webhook event sent from StackHawk when an application is scanned. In addition, it also includes the entity created from the event based on the webhook configuration provided in the previous section.

### Payload

Here is an example of the payload structure sent to the webhook URL when an application is scanned:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "service": "StackHawk",
  "scanCompleted": {
    "scan": {
      "id": "c30e848d-35a7-4357-a113-35ce3392e967",
      "hawkscanVersion": "3.1.0",
      "env": "Development",
      "status": "COMPLETED",
      "application": "Python App",
      "startedTimestamp": "2023-06-23T11:01:18.273Z",
      "scanURL": "https://app.stackhawk.com/scans/c30e848d-35a7-4357-a113-35ce3392e967",
      "tags": ["test-application"]
    },
    "scanDuration": "72",
    "spiderDuration": "49",
    "completedScanStats": {
      "urlsCount": "2",
      "duration": "121",
      "scanResultsStats": {
        "totalCount": "5",
        "lowCount": "7",
        "mediumCount": "4",
        "highCount": "0",
        "lowTriagedCount": "0",
        "mediumTriagedCount": "0",
        "highTriagedCount": "0"
      }
    },
    "findings": [
      {
        "pluginId": "10021",
        "pluginName": "X-Content-Type-Options Header Missing",
        "severity": "Low",
        "host": "https://example.com",
        "paths": [
          {
            "path": "",
            "method": "GET",
            "status": "NEW",
            "pathURL": "https://app.stackhawk.com/scans/c30e848d-35a7-4357-a113-35ce3392e967/finding/10021/path/769898/message/4"
          }
        ],
        "pathStats": [
          {
            "status": "NEW",
            "count": 1
          }
        ],
        "totalCount": "1",
        "category": "Information Leakage",
        "findingURL": "https://app.stackhawk.com/scans/c30e848d-35a7-4357-a113-35ce3392e967/finding/10021"
      },
      {
        "pluginId": "10035",
        "pluginName": "Strict-Transport-Security Header Not Set",
        "severity": "Low",
        "host": "https://example.com",
        "paths": [
          {
            "path": "/robots.txt",
            "method": "GET",
            "status": "NEW",
            "pathURL": "https://app.stackhawk.com/scans/c30e848d-35a7-4357-a113-35ce3392e967/finding/10035/path/769897/message/7"
          },
          {
            "path": "/sitemap.xml",
            "method": "GET",
            "status": "NEW",
            "pathURL": "https://app.stackhawk.com/scans/c30e848d-35a7-4357-a113-35ce3392e967/finding/10035/path/769896/message/6"
          },
          {
            "path": "",
            "method": "GET",
            "status": "NEW",
            "pathURL": "https://app.stackhawk.com/scans/c30e848d-35a7-4357-a113-35ce3392e967/finding/10035/path/769898/message/4"
          }
        ],
        "pathStats": [
          {
            "status": "NEW",
            "count": 3
          }
        ],
        "totalCount": "3",
        "category": "Information Leakage",
        "findingURL": "https://app.stackhawk.com/scans/c30e848d-35a7-4357-a113-35ce3392e967/finding/10035"
      }
    ]
  }
}
```

</details>

### Mapping result

The combination of the sample payload and the webhook configuration generates the following Port entities (in the sample above, multiple entities will be generated because the `findings` array contains multiple objects):

```json showLineNumbers
{
  "identifier": "Python-App-10020-1",
  "title": "Missing Anti-clickjacking Header",
  "blueprint": "stackHawkVulnerability",
  "properties": {
    "severity": "Medium",
    "host": "https://example.com",
    "totalCount": 1,
    "category": "Information Leakage",
    "url": "https://app.stackhawk.com/scans/c30e848d-35a7-4357-a113-35ce3392e967/finding/10020-1",
    "tags": ["test-application"]
  },
  "relations": {}
}
```

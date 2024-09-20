---
displayed_sidebar: null
description: Learn how to ingest cloud resources using Datadog in Port, enhancing visibility and performance monitoring.
---

# Ingest cloud resources with Datadog

This guide aims to show you how to ingest cloud resources using Datadog to have a good grasp of the cloud resources/entities you have from your cloud provider.


## Common use cases
- Map your monitored resources from cloud providers in Datadog

## Prerequisites
This guide assumes the following:
- You have a Port account and that you have finished the [onboarding process](/quickstart).
- You have [installed and setup Port's Datadog integration](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/datadog.md)
- You have installed integrations for [GCP](https://docs.datadoghq.com/integrations/google_cloud_platform/?tab=project), [AWS](https://docs.datadoghq.com/integrations/#cat-aws) and [Azure](https://docs.datadoghq.com/integrations/azure/) on your Datadog environment


## Ingesting cloud resources into Port
We will be making use of the `hosts` kind in Port's Datadog integration which provides information on hosts existing on the cloud providers we have configured. So far, we are only interested in hosts with `gcp`, `aws`, and `azure` in the `sources` property.

1. Having installed the Datadog integration, create the `datadogCloud` blueprint in your Port environment using the blueprint below:

<details>
<summary><b>Datadog Cloud Resource Blueprint (Click to expand</b></summary>

```json showLineNumbers
{
    "identifier": "datadogCloudResource",
    "description": "This blueprint represents a cloud resource in Datadog",
    "title": "Datadog Cloud Resource",
    "icon": "Datadog",
    "schema": {
      "properties": {
        "up": {
          "type": "boolean",
          "title": "Is Running?",
          "description": "Is the host up?"
        },
        "host_name": {
          "type": "string",
          "title": "Host Name",
          "description": "the name of the host"
        },
        "description": {
          "type": "string",
          "title": "Description",
          "description": "the host description"
        },
        "platform": {
          "type": "string",
          "title": "Platform",
          "description": "the host platform"
        },
        "machine": {
          "type": "string",
          "title": "Machine",
          "description": "The CPU architecture of the host machine (e.g., amd64, x86, x64, arm, arm64)."
        },
        "cpu_cores": {
          "type": "number",
          "title": "CPU Cores",
          "description": "the host CPU cores"
        },
        "agent_version": {
          "type": "string",
          "title": "Datadog Agent Version",
          "description": "the Datadog agent version installed on the host"
        },
        "is_muted": {
          "type": "boolean",
          "title": "Is Host Muted?",
          "description": "Indicates whether alerts for that specific host are temporarily suppressed."
        },
        "sources": {
          "title": "Sources",
          "type": "array",
          "description": "Source or cloud provider associated with your host."
        },
        "tags": {
          "title": "Tags",
          "type": "object",
          "description": "Tags associated with the host."
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

2. Head over to the [Data Sources page](https://app.getport.io/settings/data-sources) in your Port environment and select the Datadog integration

3. Create a new mapping config with the following

<details>
<summary><b>Datadog Cloud Resource mapping config (Click to expand)</b></summary>

```yaml showLineNumbers

```

</details>
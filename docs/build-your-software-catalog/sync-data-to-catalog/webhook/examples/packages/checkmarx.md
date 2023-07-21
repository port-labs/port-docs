---
sidebar_position: 9
description: Ingest Checkmarx KICS scan into your catalog
---

import PythonScript from './resources/checkmarx/\_example_python_script.mdx'
import CheckmarxBlueprint from './resources/checkmarx/\_example_checkmarx_blueprint.mdx'
import CheckmarxWebhookConfig from './resources/checkmarx/\_example_checkmarx_webhook_config.mdx'

# Checkmarx KICS

In this example, you will create a `checkmarxScan` blueprint that ingests all scan results in your Checkmarx KICS file using a combination of Port's [API](../../../api/api.md) and [webhook functionality](../../webhook.md).

To ingest the scan results to Port, use a script that sends information about the scans according to the webhook configuration.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Checkmarx KICS blueprint</summary>
<CheckmarxBlueprint/>
</details>

<details>
<summary>Checkmarx KICS webhook configuration</summary>
<CheckmarxWebhookConfig/>

</details>

## Working with Port's API and Python script

Here is an example snippet showing how to integrate Port's API and webhook with your existing pipelines using Python:

<details>
<summary>Python script example</summary>

<PythonScript/>

</details>

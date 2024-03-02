---
sidebar_position: 10
description: Ingest Trivy vulnerabilities into your catalog
---

import PythonScript from './resources/trivy/\_example_python_script.mdx'
import TrivyBlueprint from './resources/trivy/\_example_trivy_blueprint.mdx'
import TrivyWebhookConfig from './resources/trivy/\_example_trivy_webhook_config.mdx'

# Trivy

In this example, you will create a `trivyVulnerability` blueprint that ingests all vulnerabilities in your Trivy result file using a combination of Port's [API](/build-your-software-catalog/custom-integration/api) and [webhook functionality](/build-your-software-catalog/custom-integration/webhook).

:::info Recommended installation option
While the script provided in this example facilitates scheduled ingestion of Trivy scan results to Port, we highly recommend that you [use our Trivy Kubernetes exporter](/build-your-software-catalog/sync-data-to-catalog/kubernetes/templates/trivy) to continuously scan your kubernetes cluster and ingest vulnerabilities to Port in real time. 
:::

To ingest the scan results to Port, use a script that sends information about the vulnerabilities according to the webhook configuration.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Trivy vulnerability blueprint</summary>
<TrivyBlueprint/>
</details>

<details>
<summary>Trivy webhook configuration</summary>
<TrivyWebhookConfig/>

</details>

## Working with Port's API and Python script

Here is an example snippet showing how to integrate Port's API and webhook with your existing pipelines using Python:

<details>
<summary>Python script example</summary>

<PythonScript/>

</details>

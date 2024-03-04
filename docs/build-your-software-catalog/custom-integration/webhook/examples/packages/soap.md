---
sidebar_position: 8
description: Ingest SOAP API definitions into your catalog
---

import PythonScript from './resources/soap/\_example_python_script.mdx'
import SOAPBlueprint from './resources/soap/\_example_soap_blueprint.mdx'
import SOAPWebhookConfig from './resources/soap/\_example_soap_webhook_config.mdx'

# SOAP API

In this example you are going to create a `soapApi` blueprint that ingests all paths in your SOAP API definition files using a combination of Port's [API](/build-your-software-catalog/custom-integration/api) and [webhook functionality](/build-your-software-catalog/custom-integration/webhook).

To ingest the API paths to Port, a script that sends information about the API definition according to the webhook configuration is used.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>SOAP blueprint</summary>
<SOAPBlueprint/>
</details>

<details>
<summary>Package webhook configuration</summary>

<SOAPWebhookConfig/>

</details>

## Working with Port's API and Python script

Here is an example snippet showing how to integrate Port's API and webhook with your existing pipelines using Python:

<details>
<summary>Python script example</summary>

<PythonScript/>

</details>

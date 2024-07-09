---
sidebar_position: 1
description: Ingest Humanitec applications, environments, workloads, resources and resource graphs into your catalog
title: Humanitec Integration
---

# Humanitec Integration

import HumanitecApplicationBlueprint from "./resources/\_humanitec_application_blueprint.mdx";
import HumanitecEnvironmentBlueprint from "./resources/_humanitec_environment_blueprint.mdx";
import HumanitecWorkloadBlueprint from "./resources/_humanitec_workload_blueprint.mdx";
import HumanitecResourceBlueprint from "./resources/_humanitec_resource_blueprint.mdx";
import HumanitecResourceGraphBlueprint from "./resources/_humanitec_resource_graph_blueprint.mdx";
import HumanitecExporterCacheScript from "./resources/_humanitec_exporter_cache.mdx";
import HumanitecExporterMainScript from "./resources/_humanitec_exporter_main.mdx";
import HumanitecExporterRequirements from "./resources/_humanitec_exporter_requirements.mdx";
import HumanitecExporterPortClient from "./resources/_humanitec_exporter_port_client.mdx";
import HumanitecExporterHumanitecClient from "./resources/_humanitec_exporter_humanitec_client.mdx";

# Overview 

In this example, you are going to create a github worklow integration to facilitate the ingestion of Humanitec applications, environments, workloads, resources and resource graphs into your port catalog on schedule

:::tip Prerequisites

1. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
   - `HUMANITEC_API_KEY` - [Humanitec API Key](https://developer.humanitec.com/platform-orchestrator/reference/api-references/#authentication)
   - `HUMANITEC_ORG_ID` - [Humanitec Organization ID](https://developer.humanitec.com/concepts/organizations/)
   - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
   - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
:::

## Port blueprints

Create the following blueprint definitions in port:

<HumanitecApplicationBlueprint/>

<HumanitecEnvironmentBlueprint/>

<HumanitecWorkloadBlueprint/>

<HumanitecResourceBlueprint/>

<HumanitecResourceGraphBlueprint/>

:::tip Blueprint Properties
You may select the blueprints depending on what you want to track in your Humanitec account.
:::

## GitHub Workflow

:::tip
Fork our [humanitec integration repository](https://github.com/port-labs/humanitec-integration-script.git) to get started.
:::
1. Create the following Python files in a folder name `integration` folder at the root of your GitHub repository:
    1. `main.py` - Orchestrates the synchronization of data from Humanitec to Port, ensuring that resource entities are accurately mirrored and updated on your port catalog.
    2. `requirements.txt` - This file contains the dependencies or necessary external packages need to run the integration
  
<details>
<summary>Main Executable Script</summary>

<HumanitecExporterMainScript/>

</details>

<details>
<summary>Requirements</summary>

<HumanitecExporterRequirements/>

</details>

2. Create the following Python files in a folder named `client` at the base directory of the `integration` folder:
    1. `port_client.py` – Manages authentication and API requests to Port, facilitating the creation and updating of entities within Port's system.
    2. `humanitec_client.py` – Handles API interactions with Humanitec, including retrieving data with caching mechanisms to optimize performance.
    3. `cache.py` - Provides an in-memory caching mechanism with thread-safe operations for setting, retrieving, and deleting cache entries asynchronously.

<details>
<summary>Port Client</summary>

<HumanitecExporterPortClient/>

</details>

<details>
<summary>Humanitec Client</summary>

<HumanitecExporterHumanitecClient/>

</details>


<details>
<summary>Cache</summary>

<HumanitecExporterCacheScript/>

</details>

3. Create the file `.github/workflows/humanitec-exporter.yaml` in the `.github/workflows` folder of your repository.

:::tip Cron
Adjust the cron expression to fit your schedule. By default, the workflow is set to run at 2:00 AM every Monday ('0 2 * * 1').
:::

<details>
<summary>GitHub Workflow</summary>

```yaml showLineNumbers title="humanitec-exporter.yaml"
name: Ingest Humanitec Integration Resources

on:
  schedule:
    - cron: '0 2 * * 1'
  workflow_dispatch:

jobs:
  ingest-humanitec-resources: 
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.x'

      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      
      - name: Ingest Entities to Port
        env:
            PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
            PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
            API_KEY: ${{ secrets.HUMANITEC_API_KEY }}
            ORG_ID: ${{secrets.HUMANITEC_ORG_ID }}    
        run: |
          python integration/main.py
```

</details>


Done! any change that happens to your application, environment, workloads or resources in Humanitec will be synced to port on the schedule interval defined in the github workflow.
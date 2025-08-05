---
sidebar_position: 1
description: Learn how to integrate Humanitec with Port, enabling seamless application deployment and environment management.
title: Humanitec Integration
displayed_sidebar: null
---

import HumanitecApplicationBlueprint from "/docs/guides/templates/humanitec/\_humanitec_application_blueprint.mdx";
import HumanitecEnvironmentBlueprint from "/docs/guides/templates/humanitec/_humanitec_environment_blueprint.mdx";
import HumanitecWorkloadBlueprint from "/docs/guides/templates/humanitec/_humanitec_workload_blueprint.mdx";
import HumanitecResourceBlueprint from "/docs/guides/templates/humanitec/_humanitec_resource_blueprint.mdx";
import HumanitecResourceGraphBlueprint from "/docs/guides/templates/humanitec/_humanitec_resource_graph_blueprint.mdx";
import HumanitecExporterCacheScript from "/docs/guides/templates/humanitec/_humanitec_exporter_cache.mdx";
import HumanitecExporterMainScript from "/docs/guides/templates/humanitec/_humanitec_exporter_main.mdx";
import HumanitecExporterRequirements from "/docs/guides/templates/humanitec/_humanitec_exporter_requirements.mdx";
import HumanitecExporterPortClient from "/docs/guides/templates/humanitec/_humanitec_exporter_port_client.mdx";
import HumanitecExporterHumanitecClient from "/docs/guides/templates/humanitec/_humanitec_exporter_humanitec_client.mdx";
import HumanitecGroups from "/docs/guides/templates/humanitec/_humanitec_groups.mdx";
import HumanitecUsers from "/docs/guides/templates/humanitec/_humanitec_users.mdx";
import HumanitecPipelines from "/docs/guides/templates/humanitec/_humanitec_pipelines.mdx";
import HumanitecDeploymentDeltas from "/docs/guides/templates/humanitec/_humanitec_deployment_deltas.mdx";
import HumanitecDeploymentSets from "/docs/guides/templates/humanitec/_humanitec_deployment_sets.mdx";
import HumanitecSecretStores from "/docs/guides/templates/humanitec/_humanitec_secret_stores.mdx";
import HumanitecValueSetVersions from "/docs/guides/templates/humanitec/_humanitec_value_set_versions.mdx";
import HumanitecSharedValues from "/docs/guides/templates/humanitec/_humanitec_shared_values.mdx";


# Humanitec Integration

This guide demonstrates how to create a GitHub worklow integration to facilitate the ingestion of Humanitec applications, environments, workloads, resources, resource graphs, pipelines, deployment deltas, deployment sets, secret stores, shared values, value set versions, users, groups into your Port catalog on schedule.

<img src="/img/guides/humanitecEnvironments.png" alt="Humanitec Integration" width="75%" border="1px" />

## Common use cases

- Empower platform teams to gain visibility and advanced insights into your Humanitec entities including application, environments, users, and groups from Port among other entities.
- Track the status of changes to your Humanitec entities from Port.
- Prepare your Port environment to build useful experiences for Platform Engineering teams with Self Service Actions.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- You have a Humanitec account and a [Service User created](https://developer.humanitec.com/platform-orchestrator/docs/platform-orchestrator/security/service-users/) (You need an Administrator or Manager privilege to create a Service User).
- You have a GitHub account and a repository.


## Set up data model

As a first step, you need to create blueprint definitions in Port for the Humanitec entities you want to ingest. To do this follow the steps below:

1. Go to the [Builder](https://app.getport.io/settings/data-model/data-model) page in your Port organization.
2. Click on the **+ Blueprint** button at the top of the page.
3. Click on `{...} Edit JSON` button at the top right corner.
4. Copy and paste the following blueprint JSON into the editor, repeating the process for each blueprint:

  <HumanitecApplicationBlueprint/>

  <HumanitecEnvironmentBlueprint/>

  <HumanitecWorkloadBlueprint/>

  <HumanitecResourceGraphBlueprint/>

  <HumanitecResourceBlueprint/>

  <HumanitecSecretStores/>

  <HumanitecSharedValues/>

  <HumanitecValueSetVersions/>

  <HumanitecDeploymentSets/>

  <HumanitecPipelines/>

  <HumanitecDeploymentDeltas/>

  <HumanitecUsers/>

  <HumanitecGroups/>


:::tip Blueprint Properties
You may select the blueprints depending on what you want to track in your Humanitec account.
:::

## Set up the integration

Fork our [humanitec integration repository](https://github.com/port-labs/humanitec-integration-script.git) to get started.


### Add secrets to your GitHub repository

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
   - `HUMANITEC_API_KEY` - [Humanitec API Key](https://developer.humanitec.com/platform-orchestrator/docs/platform-orchestrator/security/service-users/#generate-an-api-token-from-a-service-user)
   - `HUMANITEC_ORG_ID` - [Humanitec Organization ID](https://developer.humanitec.com/concepts/organizations/)
   - `PORT_CLIENT_ID` - Your Port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
   - `PORT_CLIENT_SECRET` - Your Port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).


### Create the Python files

1. Create the following Python files in a folder named `integration` at the base directory of your GitHub repository:
    - `main.py` - Orchestrates the synchronization of data from Humanitec to Port, ensuring that resource entities are accurately mirrored and updated on your Port catalog.
    - `requirements.txt` - This file contains the dependencies or necessary external packages need to run the integration



    <details>
    <summary><b>Main Executable Script (Click to expand)</b></summary>

    <HumanitecExporterMainScript/>

    </details>


    <details>
    <summary><b>Requirements (Click to expand)</b></summary>

    <HumanitecExporterRequirements/>

    </details>


2. Create the following Python files in a folder named `clients` at the base directory of the `integration` folder:
    - `port_client.py` – Manages authentication and API requests to Port, facilitating the creation and updating of entities within Port's system.
    - `humanitec_client.py` – Handles API interactions with Humanitec, including retrieving data with caching mechanisms to optimize performance.
    - `cache.py` - Provides an in-memory caching mechanism with thread-safe operations for setting, retrieving, and deleting cache entries asynchronously.

  <details>
  <summary><b>Port Client (Click to expand)</b></summary>

  <HumanitecExporterPortClient/>

  </details>

  <details>
  <summary><b>Humanitec Client (Click to expand)</b></summary>

  <HumanitecExporterHumanitecClient/>

  </details>


  <details>
  <summary><b>Cache (Click to expand)</b></summary>

  <HumanitecExporterCacheScript/>

  </details>

### Create the GitHub workflow

Create the file `.github/workflows/humanitec-exporter.yaml` in the `.github/workflows` folder of your repository.

:::tip Cron
Adjust the cron expression to fit your schedule. By default, the workflow is set to run at 2:00 AM every Monday ('0 2 * * 1').
:::


<details>
<summary><b>GitHub Workflow (Click to expand)</b></summary>

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


Done! Any change that happens to your application, environment, workloads, resources, resource graphs, pipelines, deployment deltas, deployment sets, secret stores, shared values, value set versions, users, groups in Humanitec will be synced to Port on the schedule interval defined in the GitHub workflow.


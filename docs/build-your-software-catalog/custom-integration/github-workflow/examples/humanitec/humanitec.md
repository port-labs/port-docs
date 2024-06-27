---
sidebar_position: 1
description: Ingest Humanitec applications, environments, workloads and workload versions into your catalog
---

# Humanitec Integration

import HumanitecApplicationBlueprint from "./resources/\_humanitec_application_blueprint.mdx";
import HumanitecEnvironmentBlueprint from "./resources/_humanitec_environment_blueprint.mdx";
import HumanitecWorkloadBlueprint from "./resources/_humanitec_workload_blueprint.mdx";
import HumanitecWorkloadVersionBlueprint from "./resources/_humanitec_workload_version_blueprint.mdx";
import HumanitecExporterPythonScript from "./resources/_humanitec_exporter_python_script.mdx";

# Overview 

In this example you are going to create a github worklow integration to facilitate the ingestion of Humanitec applications, environments, workloads and workload version into Port.

## Prerequisites
2. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
   - `HUMANITEC_API_TOKEN` - [HUMANITEC API TOKEN](https://developer.humanitec.com/platform-orchestrator/reference/api-references/#authentication)
   - `HUMANITEC_ORG_ID` - [HUMANITEC ORGANIZATION ID](https://developer.humanitec.com/concepts/organizations/)
   - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
   - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

## Port configuration

Create the following blueprint definitions:

<HumanitecApplicationBlueprint/>

<HumanitecEnvironmentBlueprint/>

<HumanitecWorkloadBlueprint/>

<HumanitecWorkloadVersionBlueprint/>

:::tip Blueprint Properties
You may modify the properties in your blueprints depending on what you want to track in your Bitbucket account.
:::

## GitHub Workflow

Create the file `.github/workflows/humanitec-exporter.yaml` in the `.github/workflows` folder of your repository.

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
            HUMANITEC_API_TOKEN: ${{ secrets.HUMANITEC_API_TOKEN }}
            HUMANITEC_BASE_URL: ${{ secrets.HUMANITEC_BASE_URL }}
            HUMANITEC_ORG_ID: ${{secrets.HUMANITEC_ORG_ID }}    
        run: |
          python humanitec-exporter.py
```

</details>

Create a python script `humanitec-exporter.py` to ingest Humanitec applications, environments, workloads and workload versions into port:

<details>
<summary>Humanitec Python script</summary>

<HumanitecExporterPythonScript/>

</details>

Done! any change that happens to your project, repository or pull requests in Humanitec will be synced to port on the schedule interval defined in the github workload. Port will parse the events according to the mapping and update the catalog entities accordingly.
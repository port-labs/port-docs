---
title: Troubleshooting
description: Common questions and solutions for Azure DevOps integration and pipelines in Port.
sidebar_position: 99
---

# Azure DevOps Troubleshooting

This page contains common problems users face when integrating Azure DevOps (ADO) with Port, and how to solve them.


#### How do I install the Azure DevOps integration?
<details>
<summary><b>Answer (click to expand)</b></summary>

**Azure DevOps UI Checks**
- Follow the [installation guide](./installation.md) to set up the Azure DevOps integration.
- Double-check your organization and project names for typos in the Azure DevOps UI.

**Code, Pipeline, or API Checks**
- Ensure you have a Personal Access Token (PAT) with the required scopes: `Code (Read & Write)`, `Build (Read & Execute)`, and `Project and Team (Read, Write)`.
- For a step-by-step walkthrough, see the [Azure DevOps docs](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/azure-devops/installation).

</details>

---

#### How do I troubleshoot a pipeline?
<details>
<summary><b>Answer (click to expand)</b></summary>

**Azure DevOps UI Checks**
- In Project Settings → Pipelines, verify the pipeline is enabled.
- Check the pipeline run history for failures or incomplete runs.
- Try running the pipeline manually from the UI.
- Check service connection permissions on the project and pipeline.
- Confirm that your agents (Microsoft-hosted or self-hosted) are online (see Agent Pools in the UI).

**Code, Pipeline, or API Checks**
- For self-hosted agents, ensure IPs are whitelisted.
- Make sure enough runners are available and enabled to process webhook triggers.
- The YAML file must be on the same branch as configured.
- Validate the YAML file for errors (see next question for validation steps).
- Add debug logging to your YAML for more detailed logs:
  ```yaml
  variables:
    system.debug: 'true'
  ```
- For more, see [Azure DevOps pipeline troubleshooting](https://learn.microsoft.com/en-us/azure/devops/pipelines/troubleshooting?view=azure-devops).

</details>

---

#### How do I troubleshoot a webhook?
<details>
<summary><b>Answer (click to expand)</b></summary>

**Azure DevOps UI Checks**
- Go to Project Settings → Service Connections and verify the webhook is present and enabled.
- Ensure the webhook name matches the one referenced in your pipeline YAML.
- Test the webhook by triggering a manual event and checking the pipeline run history.

**Code, Pipeline, or API Checks**
- Test the webhook with a direct API call:
  ```bash
  curl -X POST 'https://dev.azure.com/{org_name}/_apis/public/distributedtask/webhooks/{webhook_name}?api-version=6.0-preview' -d '{}' -H "Content-Type: application/json"
  ```
  Replace `{org_name}` and `{webhook_name}` with your actual values.

</details>

---

#### How do I validate a pipeline YAML file?
<details>
<summary><b>Answer (click to expand)</b></summary>

**Azure DevOps UI Checks**
- Use the Azure DevOps UI YAML editor to check for errors.

**Code, Pipeline, or API Checks**
- Validate your YAML file with the Azure CLI:
  ```bash
  az pipelines validate --name <pipeline-name> --path <path-to-yaml>
  ```
- See [YAML schema validation](https://learn.microsoft.com/en-us/azure/devops/pipelines/yaml-schema?view=azure-pipelines#validate-your-pipeline).

</details>

---

#### How do I check if a pipeline exists using the API?
<details>
<summary><b>Answer (click to expand)</b></summary>

**Azure DevOps UI Checks**
- In the Azure DevOps UI, navigate to Pipelines and search for the pipeline by name or ID.

**Code, Pipeline, or API Checks**
- Use the Azure DevOps REST API:
  ```bash
  curl -X GET 'https://dev.azure.com/{organization}/{project}/_apis/pipelines/{pipelineId}?api-version=7.1-preview.1' -H "Content-Type: application/json"
  ```
  Replace `{organization}`, `{project}`, and `{pipelineId}` with your actual values. See [Pipelines - Get](https://learn.microsoft.com/en-us/rest/api/azure/devops/pipelines/pipelines/get?view=azure-devops-rest-7.1) for details.

</details>

---

#### How do I trigger a pipeline using the API?
<details>
<summary><b>Answer (click to expand)</b></summary>

**Azure DevOps UI Checks**
- You can trigger a pipeline manually from the Azure DevOps UI by clicking "Run pipeline".

**Code, Pipeline, or API Checks**
- Trigger a pipeline with:
  ```bash
  curl -X POST 'https://dev.azure.com/{org_name}/_apis/public/distributedtask/webhooks/{webhook_name}?api-version=6.0-preview' -d '{}' -H "Content-Type: application/json"
  ```
  Replace `{org_name}` and `{webhook_name}` with your actual values. See [Azure DevOps REST API docs](https://learn.microsoft.com/en-us/rest/api/azure/devops/distributedtask/webhooks/create?view=azure-devops-rest-7.1) for more.

</details>

---

#### How do I troubleshoot a pipeline that is stuck "in progress" and nothing happens?
<details>
<summary><b>Answer (click to expand)</b></summary>

**Azure DevOps UI Checks**
- Check the [run history](https://dev.azure.com/) and logs for errors.
- Verify the pipeline status in the UI.
- For self-hosted agents, check their status in Agent Pools.

**Code, Pipeline, or API Checks**
- Ensure the action backend is set up correctly (organization, repository, workflow file name).
- For self-hosted agents, verify they are not blocked by network/firewall rules.

</details>



---
title: Troubleshooting
description: Common questions and solutions for Azure DevOps integration and pipelines in Port.
sidebar_position: 99
---

# Azure DevOps troubleshooting

This page contains common problems users face when using Azure DevOps (ADO) pipelines as a backend for Port actions and automations, and how to solve them.


## Prerequisites
Before troubleshooting, ensure you have:
1. Properly installed the [Azure DevOps integration](/build-your-software-catalog/sync-data-to-catalog/git/azure-devops/installation).
2. Configured the Personal Access Token (PAT) with correct scopes.
3. Verified organization and project names.


## Understanding the trigger flow

The ADO trigger flow is more complex than other pipelines because it requires multiple components working together:

<img src="/img/self-service-actions/setup-backend/azurepipeline/ADOpipelineFlowImg.png" width="90%" border='1px' />

## Troubleshoot pipeline issues

Follow these steps in order to diagnose and fix common pipeline issues.

### Issue: pipeline not triggering

**Symptoms you might be seeing:**
- Pipeline doesn't start automatically when expected.
- No webhook events appear in the ADO logs.
- Manual pipeline runs work, but automatic triggers don't.
- You're making changes but pipelines aren't being triggered.

**Troubleshooting flow:**

1. **Verify pipeline configuration**
   - Ensure the pipeline YAML file is correctly configured and adheres to Azure DevOps syntax.
   - **Important:** Trigger the pipeline manually in the UI first (this is required for initial setup).
   - Check if the pipeline is enabled in Project Settings → Pipelines.
   - Validate the YAML syntax:
     ```bash
     az pipelines validate --name <pipeline-name> --path <path-to-yaml>
     ```

      :::info First-run requirement
      Azure DevOps pipelines must be manually triggered at least once before webhooks can activate them automatically.
      :::

2. **Check webhook configuration**
   - Verify webhook presence in Project Settings → Service Connections.
   - Check webhook logs for any failed attempts.
   - Check if the webhook name matches the one referenced in your pipeline.
   - Test webhook manually:
     ```bash
     curl -X POST 'https://dev.azure.com/{org_name}/_apis/public/distributedtask/webhooks/{webhook_name}?api-version=6.0-preview' \
     -H "Content-Type: application/json" \
     -d '{
       "resource": {
         "id": "test-run-id",
         "status": "completed"
       }
     }'
     ```
     :::tip Undefined webhook name error
      If you see an "undefined webhook name" error in Port, this may mean your Service Connection or webhook is misconfigured or missing. Try creating a new Service Connection and re-linking your pipeline.
     :::

3. **Verify agent availability**
   - Check agent status in Agent Pools (are they online?)
   - For self-hosted agents, verify network/firewall rules.
   - Ensure sufficient runners are available (not all in use).
   - Check if there are any queued jobs that aren't starting.

4. **Review pipeline logs**
   - If you see partial runs, enable debug logging:
     ```yaml
     variables:
       system.debug: 'true'
     ```
   - Check run history for detailed error messages.
   - Look for permission errors or timeout issues.

5. **Inspect variable and secret management**
   - Verify all required variables are defined.
   - Ensure variables are accessible to the pipeline.
   - Check for any missing or incorrect values.
   - Verify PAT tokens haven't expired.

6. **Reset the service hook**
   - If your pipeline triggers are still not working after completing all the above steps, try deleting and recreating the **Service Hook** in Project Settings → Service Hooks. Stale or misconfigured service hooks are a common cause of trigger issues, and recreating them often resolves the problem.

7. **Last resort: Test with a new service connection, service hook, and minimal pipeline**
   - **Create a new Service Connection** in Azure DevOps (Project Settings → Service Connections).
   - **Create a new Service Hook** in Azure DevOps (Project Settings → Service Hooks).
   - **Create a minimal "hello world" pipeline** using the sample YAML below.
   - **Trigger the new pipeline** from Port and check if it runs successfully.

      <details>
      <summary><b>Sample minimal pipeline YAML</b></summary>

      ```yaml showLineNumbers
      trigger: none  # Disables automatic triggers on code commits.

      resources:
        webhooks:
          - webhook: port_trigger
            connection: port_trigger

      jobs:
      - job: port_trigger
        steps:
          - script: |
              echo "Webhook triggered by API call"
      ```
      </details>

      - If this minimal pipeline works, the issue may be with your original pipeline's configuration or logic.   
      - If it still does not work, please contact support with details of your setup and any error messages.

8. **Check parameter and variable passing**
   - If your pipeline uses parameters or variables from Port, make sure you are passing them correctly.   
   See [Advanced SSA form input documentation](#) for details.

### Issue: pipeline stuck "in progress"

**Symptoms you might be seeing:**
- Pipeline shows as running but makes no progress.
- Agent appears to be processing but status doesn't update.
- Pipeline has been running for an unusually long time.
- The job seems to hang at a specific step.

**Troubleshooting flow:**

1. **Check run history and logs**
   - Review the [run history](https://dev.azure.com/) for errors.
   - Verify pipeline status in the UI.
   - Check agent status in Agent Pools (is it still connected?)
   - Look for timeout errors or hanging processes.

2. **Verify service connections**
   - Ensure all external service connections are valid.
   - Check permissions on service connections.
   - Verify PAT token hasn't expired.
   - Check if you can manually use the service connections.

3. **Investigate resource issues**
   - Check if the agent is running out of disk space.
   - Verify memory/CPU usage isn't causing the agent to hang.
   - Check if any long-running processes are blocking the pipeline.

### Issue: pipeline runs but port catalog not updated

**Symptoms you might be seeing:**
- Pipeline completes successfully in ADO.
- Changes aren't reflected in your Port catalog.
- No obvious errors in pipeline logs.
- Port entities aren't being created/updated.

**Troubleshooting flow:**

1. **Check Port integration**
   - Verify Port SSA configuration is correctly set up.
   - Ensure entity mappings are defined properly.
   - Check Port API credentials are valid.
   - Verify API endpoints are correct and accessible.

2. **Review pipeline output**
   - Look for Port API call errors (status codes 4xx or 5xx).
   - Verify entity data format matches your blueprint.
   - Check for rate limiting issues.
   - Verify payload formatting (JSON structure).

3. **Validate Port permissions**
   - Ensure the API token has sufficient permissions.
   - Verify the blueprint exists and is properly configured.
   - Check if you can create entities manually in Port.

## Advanced troubleshooting tools

### Checking pipeline status with API
Use this API to verify pipeline configuration and status when the UI doesn't provide enough information or you need programmatic access:

```bash
curl -X GET 'https://dev.azure.com/{organization}/{project}/_apis/pipelines/{pipelineId}?api-version=7.1-preview.1' \
-H "Content-Type: application/json"
```

### Manual pipeline trigger with API
Use this API when testing or troubleshooting webhook issues, or when you need to trigger pipelines programmatically:

```bash
curl -X POST 'https://dev.azure.com/{organization}/{project}/_apis/pipelines/{pipelineId}/runs?api-version=7.1-preview.1' \
-H "Content-Type: application/json" \
-d '{
  "resources": {
    "repositories": {
      "self": {
        "refName": "refs/heads/main"
      }
    }
  }
}'
```

For more details, see the [Azure DevOps REST API documentation](https://learn.microsoft.com/en-us/rest/api/azure/devops/pipelines/pipelines?view=azure-devops-rest-7.1).





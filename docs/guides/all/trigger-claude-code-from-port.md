---
displayed_sidebar: null
description: Learn how to trigger Claude Code from Port to enable AI-powered coding assistance in your development workflow while tracking its usage.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'


# Trigger Claude Code from Port

This guide demonstrates how to trigger Claude Code from Port, enabling AI-powered coding assistance in your development workflow. By leveraging Claude Code, you can significantly reduce manual coding tasks and enhance productivity, allowing developers to focus on more complex problem-solving. 
You will learn how to create self-service actions that can trigger Claude Code and configure the necessary GitHub workflows to handle the execution process with comprehensive usage tracking.

<img src="/img/guides/trigger-claude-code-from-port-flow.jpg" border="1px" width="100%" />


## Common use cases

- **Trigger Claude Code for automated code generation** and assistance
- **Enhance code quality** – use Claude Code for refactoring, updates, and documentation, reducing technical debt.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [Port's GitHub app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- You have access to [create and configure AI agents](https://docs.port.io/ai-agents/overview#getting-started-with-ai-agents) in Port.
- Claude Code is enabled in your repository.
- You have an Anthropic API key for Claude Code access.


## Set up data model

We need to create blueprints to support our Claude Code workflow. These blueprints will be used to track Claude Code executions and their usage metrics.

### Create Claude Code execution blueprint

This blueprint will track Claude Code executions, including token usage, costs, and execution details.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Claude Code Execution blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "claudeCodeExecution",
      "title": "Claude Code Execution",
      "icon": "Code",
      "schema": {
        "properties": {
          "prompt": {
            "title": "Prompt",
            "type": "string",
            "format": "markdown",
            "description": "The prompt that was sent to Claude Code"
          },
          "status": {
            "title": "Status",
            "type": "string",
            "enum": [
              "pending",
              "running",
              "success",
              "failed"
            ],
            "enumColors": {
              "pending": "blue",
              "running": "yellow",
              "success": "green",
              "failed": "red"
            }
          },
          "executionTime": {
            "title": "Execution Time (ms)",
            "type": "number",
            "description": "Total execution time in milliseconds"
          },
          "inputTokens": {
            "title": "Input Tokens",
            "type": "number",
            "description": "Number of input tokens consumed"
          },
          "outputTokens": {
            "title": "Output Tokens",
            "type": "number",
            "description": "Number of output tokens generated"
          },
          "totalCost": {
            "title": "Total Cost (USD)",
            "type": "number",
            "description": "Total cost of the Claude Code execution"
          },
          "repository": {
            "title": "Repository",
            "type": "string",
            "description": "The repository where Claude Code was executed"
          },
          "claudeResponse": {
            "type": "string",
            "title": "Response",
            "format": "markdown"
          }
        },
        "required": [
          "prompt",
          "status"
        ]
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the blueprint.


## Set up self-service actions

We will create self-service actions that can trigger Claude Code executions. First, we need to add the necessary secrets to Port.

### Add GitHub secrets

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `PORT_GITHUB_TOKEN`: A [GitHub fine-grained personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) is required. This token must have read and write permissions for the "Contents", "Issues", "Metadata" and "Pull request" section of your repositories.
- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude Code access.


### Create Claude Code action

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Claude Code action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "run_claude_code",
      "title": "Run Claude Code",
      "icon": "Code",
      "description": "Open a Claude Code PR on any given repository",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "prompt": {
              "type": "string",
              "title": "Prompt",
              "description": "The prompt to pass to Claude Code (AI Coding Agent)",
              "format": "multi-line"
            },
            "service": {
              "type": "string",
              "description": "The service associated with the Claude's Code implementation",
              "blueprint": "service",
              "title": "Service",
              "format": "entity"
            }
          },
          "required": [
            "prompt",
            "service"
          ],
          "order": [
            "prompt",
            "service"
          ]
        }
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB_ORG>",
        "repo": "<GITHUB_REPO>",
        "workflow": "claude-backend.yaml",
        "workflowInputs": {
          "command": "{{ .inputs.prompt }}",
          "repo_name": "{{ .inputs.service.title }}",
          "run_id": "{{ .run.id }}"
        },
        "reportWorkflowStatus": false
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save` to create the action.


## Set up GitHub workflow

Create the file `.github/workflows/claude-backend.yaml` in the `.github/workflows` folder of your repository.

This workflow will execute Claude Code with the provided prompt, track execution progress, and report back to Port with usage metrics including token consumption, costs, and execution details.

<details>
<summary><b>GitHub workflow for Claude Code execution (Click to expand)</b></summary>

:::note Replace Git Credentials
Ensure you replace the Git credentials with your actual credentials. Update the `<GIT USERNAME>` and `<GIT USER EMAIL>` fields with your GitHub username and email to ensure proper commit attribution.
:::

```yaml showLineNumbers
name: Trigger Claude Code

on:
  workflow_dispatch:
    inputs:
      repo_name:
        required: true
        description: "The name of the repo to pull code from"
      command:
        required: true
        description: "The command to run"
      run_id:
        required: false
        description: "Port action run ID to update"

permissions:
  contents: read
  packages: write
        
jobs:
  claude-generic:
    env:
      GITHUB_TOKEN: ${{ secrets.PORT_GITHUB_TOKEN }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.PORT_GITHUB_TOKEN }}
          repository: port-labs/${{ inputs.repo_name }}
          ref: main

      - name: Configure Git 
        run: |
          git config --global user.name "<GIT USERNAME>"
          git config --global user.email "<GIT USER EMAIL>"

      - name: Execute Claude Code
        id: claude_execution
        uses: anthropics/claude-code-base-action@beta
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          allowed_tools: "Bash(git:*),Bash(gh:*),Bash(jq:*),Edit,GlobTool,GrepTool,BatchTool"
          system_prompt: |
            You are a senior backend engineer. Focus on security, performance, and maintainability.
            You will receive repository and a command. You will follow the commands, and open a PR if relevant.
            Do NOT make any changes directly to main EVER, only through a PR via a new branch.
          prompt: ${{ inputs.command }}

      - name: Parse Claude Code Execution Results
        id: parse_results
        run: |
          # Get the execution file path from the claude_execution step
          EXECUTION_FILE="${{ steps.claude_execution.outputs.execution_file }}"
          
          if [ -f "$EXECUTION_FILE" ]; then
            # Parse the execution results
            RESULT=$(cat "$EXECUTION_FILE" | jq -r '.[] | select(.type == "result") | .')
            
            if [ "$RESULT" != "" ]; then
              # Extract key metrics
              CONCLUSION=$(echo "$RESULT" | jq -r '.subtype // "unknown"')
              DURATION_MS=$(echo "$RESULT" | jq -r '.duration_ms // 0')
              INPUT_TOKENS=$(echo "$RESULT" | jq -r '.usage.input_tokens // 0')
              OUTPUT_TOKENS=$(echo "$RESULT" | jq -r '.usage.output_tokens // 0')
              TOTAL_COST=$(echo "$RESULT" | jq -r '.total_cost_usd // 0')
              SESSION_ID=$(echo "$RESULT" | jq -r '.session_id // ""')
              CLAUDE_RESPONSE=$(echo "$RESULT" | jq -r '.result // ""')
              
              # Set outputs for next steps
              {
                echo "claude_response<<EOF"
                echo "$CLAUDE_RESPONSE"
                echo "EOF"
              } >> $GITHUB_OUTPUT
              echo "conclusion=$CONCLUSION" >> $GITHUB_OUTPUT
              echo "duration_ms=$DURATION_MS" >> $GITHUB_OUTPUT
              echo "input_tokens=$INPUT_TOKENS" >> $GITHUB_OUTPUT
              echo "output_tokens=$OUTPUT_TOKENS" >> $GITHUB_OUTPUT
              echo "total_cost=$TOTAL_COST" >> $GITHUB_OUTPUT
              echo "session_id=$SESSION_ID" >> $GITHUB_OUTPUT
              
              echo "✅ Parsed Claude Code execution results:"
            else
              echo "❌ No result found in execution file"
              echo "conclusion=failure" >> $GITHUB_OUTPUT
              echo "duration_ms=0" >> $GITHUB_OUTPUT
              echo "input_tokens=0" >> $GITHUB_OUTPUT
              echo "output_tokens=0" >> $GITHUB_OUTPUT
              echo "total_cost=0" >> $GITHUB_OUTPUT
            fi
          else
            echo "❌ Execution file not found: $EXECUTION_FILE"
            echo "conclusion=failure" >> $GITHUB_OUTPUT
            echo "duration_ms=0" >> $GITHUB_OUTPUT
            echo "input_tokens=0" >> $GITHUB_OUTPUT
            echo "output_tokens=0" >> $GITHUB_OUTPUT
            echo "total_cost=0" >> $GITHUB_OUTPUT
          fi

      - name: Create Claude Code Execution Entity in Port
        if: ${{ inputs.run_id != '' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.port.io
          operation: UPSERT
          identifier: "claude-exec-${{ inputs.run_id }}"
          title: "claude-exec-${{ inputs.run_id }}"
          icon: "Code"
          blueprint: "claudeCodeExecution"
          properties: |-
            {
              "prompt": "${{ inputs.command }}",
              "status": "${{ steps.parse_results.outputs.conclusion == 'success' && 'success' || 'failed' }}",
              "executionTime": ${{ steps.parse_results.outputs.duration_ms }},
              "claudeResponse": ${{ toJSON(steps.parse_results.outputs.claude_response) }},
              "inputTokens": ${{ steps.parse_results.outputs.input_tokens }},
              "outputTokens": ${{ steps.parse_results.outputs.output_tokens }},
              "totalCost": ${{ steps.parse_results.outputs.total_cost }},
              "repository": "${{ inputs.repo_name }}"
            }

      - name: Update Port Action Run Status to Success
        if: ${{ inputs.run_id != '' && steps.parse_results.outputs.conclusion == 'success' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.us.port.io
          operation: PATCH_RUN
          runId: ${{ inputs.run_id }}
          status: "SUCCESS"
          logMessage: |
            ✅ Claude Code execution completed successfully!
            
            **Execution Summary:**
            - Duration: ${{ steps.parse_results.outputs.duration_ms }}ms
            - Input tokens: ${{ steps.parse_results.outputs.input_tokens }}
            - Output tokens: ${{ steps.parse_results.outputs.output_tokens }}
            - Total cost: ${{ steps.parse_results.outputs.total_cost }}
            - Session ID: ${{ steps.parse_results.outputs.session_id }}
      
      - name: Update Port Action Run Status to Failed
        if: ${{ inputs.run_id != '' && steps.parse_results.outputs.conclusion != 'success' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.us.port.io
          operation: PATCH_RUN
          runId: ${{ inputs.run_id }}
          status: "FAILURE"
          logMessage: |
            ❌ Claude Code execution failed. Check GitHub Actions logs for details!
            
            **Execution Summary:**
            - Duration: ${{ steps.parse_results.outputs.duration_ms }}ms
            - Input tokens: ${{ steps.parse_results.outputs.input_tokens }}
            - Output tokens: ${{ steps.parse_results.outputs.output_tokens }}
            - Total cost: ${{ steps.parse_results.outputs.total_cost }}
            - Session ID: ${{ steps.parse_results.outputs.session_id }}
```

</details>


## Test the workflow

Now let us test the complete workflow to ensure everything works correctly.

<h3> Run the self-service action </h3>

1. Go to [Self-Service](https://app.getport.io/self-serve).  
2. Run the **`Run Claude Code`** action.  
3. Fill in the fields:  
   - **Prompt** – what you want Claude Code to do (e.g., "Generate Terraform modules for creating an AWS S3 bucket")  
   - **Service** – the related service  
4. Click **Execute** and confirm a PR is created in your repo.  

<h3> Verify execution tracking </h3>

1. Open the [Software Catalog](https://app.getport.io/catalog).  
2. Check the **Claude Code Execution** entity for the new record.  

<img src="/img/guides/claude-code-execution-entity.png" border="1px" width="70%" />
<img src="/img/guides/claude-tf-pr.png" border="1px" width="70%" />



## Related guides

- [Set up the Task Manager AI agent](/guides/all/setup-task-manager-ai-agent) - Create an AI agent to manage and prioritize development tasks
- [Trigger GitHub Copilot from Port](/guides/all/trigger-github-copilot-from-port) - Set up GitHub Copilot integration with Port
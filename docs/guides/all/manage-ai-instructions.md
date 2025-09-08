---
displayed_sidebar: null
description: Learn how to centralize AI instructions in Port and automatically sync them to GitHub repositories, ensuring consistency and governance across your development teams.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Manage AI Instructions with Port

In the age of AI coding agents (Claude, Copilot, Gemini, Cursor), teams need a single source of truth for how autonomous agents should contribute to repositories. Traditionally, these rules are stored manually in different locations based on the coding agent's specification - such as `.cursor/rules`, `.github/copilot-instructions`, or other agent-specific folders. However, managing these scattered files at scale is cumbersome and leads to inconsistency.

To deal with this challenge, you can adopt the [`AGENTS.md`](https://agents.md) structure as a unified standard for all AI coding instructions, regardless of the specific agent being used, and automate it with Port.

This guide demonstrates how to centralize these instructions inside your internal developer portal, and automatically sync them back into GitHub repositories whenever they are updated. This ensures consistency, visibility, and automation — without developers needing to manually edit `AGENTS.md`.


<img src="/img/guides/sync-ai-instructions-workflow.jpg" border="1px" width="100%" />

## Common use cases

- **Centralize AI guidelines** by managing all AI agent instructions from a single location in Port
- **Ensure consistency** across repositories by automatically syncing updated instructions via pull requests
- **Reduce manual overhead** by eliminating the need for developers to manually update `AGENTS.md` files

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [GitHub integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- You have access to [create and configure AI agents](https://docs.port.io/ai-interfaces/ai-agents/overview#access-to-the-feature) in Port.
- You have completed the setup in one of the following trigger coding agents guides:
  - [Trigger Claude Code from Port](https://docs.port.io/guides/all/trigger-claude-code-from-port) - for Claude Code integration
  - [Trigger GitHub Copilot from Port](https://docs.port.io/guides/all/trigger-github-copilot-from-port) - for GitHub Copilot integration
  - [Trigger Gemini Assistant from Port](https://docs.port.io/guides/all/trigger-gemini-assistant-from-port) - for Google Gemini integration


## Set up data model

We will enhance the GitHub repository blueprint to include AI instructions and configure the GitHub integration to sync these instructions automatically.

### Update the repository blueprint

To track AI instructions, we need to add a property for managing AI agent contribution guidelines.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find and select your existing repository blueprint (e.g., `githubRepository`).
3. Click on `{...} Edit JSON`.
4. Add the following property to the `properties` section:

    <details>
    <summary><b>AI instructions property (click to expand)</b></summary>

    ```json showLineNumbers
    "ai_instructions": {
      "title": "AI Instructions",
      "description": "Rules and contribution guidelines for AI coding agents",
      "type": "string",
      "format": "markdown"
    }
    ```
    </details>

5. Click `Save` to update the blueprint.


### Update GitHub integration mapping

Now we need to configure the GitHub integration to automatically sync the AI instructions between Port and GitHub repositories.

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Find your GitHub integration and click on it.
3. Go to the `Mapping` tab.
4. Update the mapping configuration to include the AI instructions property:

    <details>
    <summary><b>GitHub integration mapping configuration (click to expand)</b></summary>

    ```yaml showLineNumbers
    deleteDependentEntities: false
    createMissingRelatedEntities: true
    enableMergeEntity: true
    resources:
      - kind: repository
        selector:
          query: true
        port:
          entity:
            mappings:
              identifier: .full_name
              title: .name
              blueprint: '"service"'
              properties:
                readme: file://README.md
                ai_instructions: file://AGENTS.md
                url: .html_url
                defaultBranch: .default_branch
    ```
    </details>

5. Click `Save` to update the integration configuration.

:::caution File path considerations
The integration will look for the `AGENTS.md` file at the root of each repository. Ensure your repositories follow this standardized file structure for consistent mapping across your organization.
:::

## Centralizing AI instructions

The AGENTS.md pattern involves creating a centralized `AGENTS.md` file at the root of your repository that serves as the single source of truth for all AI coding instructions. To make your AI coding agents reference this standardized file, you need to configure them to point to it:

<Tabs groupId="agent-config" queryString>
<TabItem value="cursor" label="Cursor" default>

Create a `.cursor/rules` file in your repository with the following configuration:

```yaml showLineNumbers
---
description: General Guidelines
globs:
alwaysApply: true
---

@AGENTS.md
```

This configuration tells Cursor to always apply the guidelines from the `AGENTS.md` file to all files in your repository.

</TabItem>

<TabItem value="copilot" label="GitHub Copilot">

In your repository settings or create a `.github/copilot-instructions.md` file with:

```markdown showLineNumbers
Reference the `AGENTS.md` file for all coding guidelines and instructions.
```

</TabItem>

<TabItem value="claude" label="Claude Code">


For Claude Code, you can reference the `AGENTS.md` file in your `CLAUDE.md`:

```markdown showLineNumbers
Please follow the coding guidelines and instructions specified in the `AGENTS.md` file at the root of this repository.
```

</TabItem>

<TabItem value="other" label="Other AI Agents">

For other AI coding agents, configure them to reference the `AGENTS.md` file in their respective configuration files:

- **Gemini CLI**: Add reference in your `GEMINI.md` custom instructions file 
- **Custom agents**: Include instructions to read and follow the `AGENTS.md` file

The key is to ensure all agents point to the same centralized source of truth.

</TabItem>
</Tabs>

## Configure AI agent

Before setting up the automation, we need to create an AI agent that will handle the actual file updates in GitHub repositories. Choose the configuration that matches your preferred AI coding agent:

<Tabs groupId="ai-agent" queryString>
<TabItem value="claude" label="Claude Code" default>

1. Go to the [AI agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>AI Instructions Manager Claude agent configuration (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "ai_instructions_manager",
      "title": "AI Instructions Manager",
      "icon": "Details",
      "team": [],
      "properties": {
        "description": "AI agent that manages the AGENTS.md file in repositories via Claude Code",
        "status": "active",
        "allowed_blueprints": [
          "service"
        ],
        "allowed_actions": [
          "run_claude_code"
        ],
        "prompt": "You are an AI agent responsible for keeping the AGENTS.md file up to date in GitHub repositories.\n\nWhen you invoke the `run_claude_code` action:\n1. Set `repo_name` to the target repository.\n2. Construct the `command` so it includes the full new AGENTS.md Markdown provided by Port, not just a placeholder reference. The command must:\n   - Clearly instruct Claude to replace the contents of `AGENTS.md` at the root of the repository.\n   - Include the full Markdown text from Port inside a fenced code block.\n   - End with instructions to commit on a new branch and open a PR with:\n     - Title: 'chore: sync AGENTS.md from Port'\n     - Description: 'This PR updates AGENTS.md based on the latest instructions from Port.'\n\nExample `command` format:\n\n```\nPlease update the repository by creating or replacing the AGENTS.md file at the root with the following content:\n\n```markdown\n<the full Markdown instructions provided by Port go here>\n```\n\nCommit this change on a new branch and open a pull request titled: 'chore: sync AGENTS.md from Port' with description: 'This PR updates AGENTS.md based on the latest instructions from Port.'\n```\n\nAlways embed the actual Markdown content directly. Never leave it as a placeholder or a reference.",
        "execution_mode": "Automatic"
      },
      "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the agent.

</TabItem>

<TabItem value="copilot" label="GitHub Copilot">

1. Go to the [AI agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>AI Instructions Manager Copilot agent configuration (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "ai_instructions_manager",
      "title": "AI Instructions Manager",
      "icon": "Github",
      "team": [],
      "properties": {
        "description": "AI agent that manages coding rules and instructions via GitHub Copilot",
        "status": "active",
        "allowed_blueprints": [
          "service"
        ],
        "allowed_actions": [
          "create_github_issue"
        ],
        "prompt": "You are an AI agent responsible for keeping the AGENTS.md file up to date in GitHub repositories.\n\nWhen you invoke the `create_github_issue` action:\n1. Set the `title` to: 'Update AGENTS.md with latest AI instructions from Port'.\n2. Always include the following labels: ['ai-instructions', 'auto_assign'].\n3. Set the `body` to include **explicit task instructions** for GitHub Copilot, followed by the new Markdown content. Use this template:\n\n---\n## Task for Copilot\nUpdate the `AGENTS.md` file at the root of the repository. Replace its contents entirely with the Markdown provided below. Commit the change on a new branch and open a pull request with:\n- Title: 'chore: sync AGENTS.md from Port'\n- Description: 'This PR updates AGENTS.md based on the latest instructions from Port.'\n\n## New AGENTS.md Content\nMARKDOWN START\n<the full Markdown provided from Port>\nMARKDOWN END\n---\n\nDo not ask for clarification. Always assume the Markdown from Port is final. The issue body above is the full instruction for Copilot.",
        "execution_mode": "Automatic"
      },
      "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the agent.

</TabItem>

<TabItem value="gemini" label="Google Gemini">

1. Go to the [AI agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>AI Instructions Manager Gemini agent configuration (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "ai_instructions_manager",
      "title": "AI Instructions Manager",
      "icon": "Code",
      "team": [],
      "properties": {
        "description": "AI agent that manages the AGENTS.md file in repositories via Google Gemini",
        "status": "active",
        "allowed_blueprints": [
          "service"
        ],
        "allowed_actions": [
          "trigger_gemini_assistant"
        ],
        "prompt": "You are an AI agent responsible for keeping the AGENTS.md file up to date in GitHub repositories.\n\nWhen you invoke the `trigger_gemini_assistant` action:\n1. Set `repo_name` to the target repository.\n2. Construct the `prompt` so it includes the full new AGENTS.md Markdown provided by Port, not just a placeholder reference. The prompt must:\n   - Clearly instruct Gemini to replace the contents of `AGENTS.md` at the root of the repository.\n   - Include the full Markdown text from Port inside a fenced code block.\n   - End with instructions to commit on a new branch and open a PR with:\n     - Title: 'chore: sync AGENTS.md from Port'\n     - Description: 'This PR updates AGENTS.md based on the latest instructions from Port.'\n\nExample `prompt` format:\n\n```\nPlease update the repository by creating or replacing the AGENTS.md file at the root with the following content:\n\n```markdown\n<the full Markdown instructions provided by Port go here>\n```\n\nCommit this change on a new branch and open a pull request titled: 'chore: sync AGENTS.md from Port' with description: 'This PR updates AGENTS.md based on the latest instructions from Port.'\n```\n\nAlways embed the actual Markdown content directly. Never leave it as a placeholder or a reference.",
        "execution_mode": "Automatic"
      },
      "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the agent.

</TabItem>
</Tabs>

:::tip Agent customization
You can customize the agent's behavior by:
- Modifying the prompt to include additional instructions
- Adding more allowed blueprints or actions
- Adjusting the execution mode based on your security requirements
- Including team assignments for better governance
:::


## Set up automation

When `ai_instructions` changes in Port, you want those updates to be reflected in GitHub. For this, configure an **automation** that triggers whenever the property changes, and forwards the updated Markdown to the AI agent that manages `AGENTS.md`.

1. Go to the [Automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Update AI Instructions automation (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "update_ai_instructions",
      "title": "Update AI Instructions",
      "description": "Automation to trigger the AI agent when the AI instructions changes",
      "icon": "AI",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "service"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.before.properties.ai_instructions != .diff.after.properties.ai_instructions"
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/agent/ai_instructions_manager/invoke",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "prompt": "Update the repository '{{ .event.context.entityIdentifier }}'.\n\nCreate or replace the file `AGENTS.md` at the root with the following exact content\nMARKDOWN START:\n\n{{ .event.diff.after.properties.ai_instructions }}\n\nMARKDOWN END.\nCommit this change on a new branch and open a pull request.",
          "labels": {
            "source": "AI Instructions Manager",
            "entityIdentifier": "{{ .event.context.entityIdentifier }}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.

## Test the workflow

Now let us test the complete workflow to ensure everything works correctly.

### Update AI instructions in Port

1. Go to your [software catalog](https://app.us.getport.io/organization/catalog) page.
2. Find a repository entity that has AI instructions defined and edit it's content.

### Verify GitHub pull request

1. Check your GitHub repository for a new pull request.
2. Review the changes to ensure the `AGENTS.md` file was updated correctly.
3. Merge the pull request to complete the sync.

<img src="/img/guides/manage-ai-instructions-pr-test.png" border="1px" width="100%" />


## Related guides

- [Enforce AI coding security standards](https://docs.port.io/guides/all/enforce-ai-coding-security-standards) - Set up comprehensive AI coding security rules
- [Track AI-driven pull requests](https://docs.port.io/guides/all/track-ai-driven-pull-requests) - Monitor AI agent contributions to your codebase
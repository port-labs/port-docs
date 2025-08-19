---
displayed_sidebar: null
description: Learn how to track and monitor AI-driven pull requests in your development workflow using Port's software catalog and automation capabilities.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Track AI-driven pull requests

As engineering teams integrate AI coding agents like GitHub Copilot, Claude, and Devin into their workflows, they face the challenge of managing an increased volume of pull requests. Tracking and reviewing these AI-generated contributions can be overwhelming without a centralized system. Port's AI control center addresses this issue by identifying pull requests originating from coding agents and displaying them in real-time, allowing you to efficiently monitor and act upon them.

<img src="/img/guides/ai-driven-pr-dashboard.png" border="1px" width="100%" />
<img src="/img/guides/ai-driven-pr-dashboard-total-prs.png" border="1px" width="100%"/>



## Common use cases

- **Act fast on AI agent contributions**: Quickly respond to pull requests from AI coding agents using your AI control center.
- **Quality assurance**: Ensure AI-generated code meets your team's standards and review processes.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [Port's GitHub integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.

:::info Alternative setup
This guide assumes you're using GitHub to manage your code. However, the principles and steps outlined here can be adapted to other Git platforms such as GitLab, BitBucket etc.
:::


## Identifying AI-driven pull requests

Before tracking statuses, we need to identify whether a PR was created or influenced by an AI coding agent.  
This logic differs depending on the agent:

<Tabs>
<TabItem value="copilot" label="GitHub Copilot" default>

**How we detect it**
- Copilot PRs are usually authored by the GitHub Copilot bot (`github-copilot[bot]`).  
- They often start as **draft PRs** or use `"WIP"` in the title.  
- Commits are signed with the Copilot signature.

**Example**
- PR title: `"WIP: Initial refactor"`.
- Author: `github-copilot[bot]`.
- Draft: `true`.

</TabItem>


<TabItem value="claude" label="Claude Code">

**How we detect it**
- PRs can be authored by either the **human user** or Claude itself. When authored by a human, Claude’s comments reveal its involvement.  
- Claude typically adds **long, structured review comments**, often in a blockquote style or with headers like **“Here’s what I changed”**.  
- No `draft` or `"WIP"` markers are added automatically when authored by Claude.

**Example**
- Author: `janedoe` (human) or `claude-bot`.
- Comment by Claude Code: `“Here are the changes I made for better error handling…”`.

</TabItem>


<TabItem value="devin" label="Devin">

**How we detect it**
- Devin usually opens a regular PR (not draft, no WIP).  
- Commits are authored by a **dedicated GitHub user** configured for Devin.  
- Commit messages often follow a **concise, imperative style** (e.g., `Fix API error handling`).  

**Example**
- PR: opened by `devin-bot` (or the GitHub user assigned to Devin).
- Commits: `author: Devin <bot@devin.ai>`.
- No draft/WIP markers.

</TabItem>
</Tabs>


## Data model setup

We will create and configure blueprints to support tracking AI-driven pull requests. This includes setting up the AI coding agent blueprint and enhancing the existing pull request blueprint.


### Creating AI coding agent blueprint

This blueprint will represent all known coding agents in your system.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Copy and paste the following JSON schema:

    <details>
    <summary><b>AI Coding Agent blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "ai_coding_agent",
      "description": "This blueprint represents an AI coding agent",
      "title": "AI Coding Agent",
      "icon": "AI",
      "schema": {
        "properties": {},
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {
        "total_p_rs_handled": {
          "title": "Total PRs handled",
          "type": "number",
          "target": "githubPullRequest",
          "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
          },
          "pathFilter": [
            {
              "fromBlueprint": "githubPullRequest",
              "path": [
                "ai_coding_agent"
              ]
            }
          ]
        },
        "total_open_p_rs": {
          "title": "Total open PRs",
          "icon": "DefaultProperty",
          "type": "number",
          "target": "githubPullRequest",
          "query": {
            "combinator": "and",
            "rules": [
              {
                "property": "status",
                "operator": "=",
                "value": "open"
              }
            ]
          },
          "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
          },
          "pathFilter": [
            {
              "fromBlueprint": "githubPullRequest",
              "path": [
                "ai_coding_agent"
              ]
            }
          ]
        }
      },
      "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the blueprint.

:::note Populate Coding Agents
Ensure that this blueprint is populated with the names of coding agents such as Copilot, Claude, Devin, etc. This will help in accurately tracking and managing AI-driven pull requests.
:::


### Update pull request blueprint

When installing Port's GitHub app, the `Service` and `Pull request` blueprints are created by default. However, we need to update the `Pull request` blueprint with new properties and add relations.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find and select your existing `Pull request` blueprint.
3. Click on `{...} Edit JSON`.
4. Add the following property to the `properties` section:

    <details>
    <summary><b>Draft and coding agent status property (Click to expand)</b></summary>

    ```json showLineNumbers
    "draft": {
      "icon": "DefaultProperty",
      "type": "boolean",
      "title": "Draft",
      "description": "Whether the PR is in draft mode. Draft PR usually requires more attention."
    },
    "workStatus": {
      "type": "string",
      "title": "Coding agent status",
      "description": "The most important status definition for a PR. \"Approved\" means needs to nudge reviewers/address comments, when \"Awaiting review\" requires urgent attention.",
      "enum": [
        "In Progress",
        "Awaiting review",
        "Requested changes",
        "Approved",
        "Unknown"
      ],
      "enumColors": {
        "In Progress": "yellow",
        "Awaiting review": "orange",
        "Requested changes": "turquoise",
        "Approved": "green",
        "Unknown": "lightGray"
      }
    }
    ```
    </details>

5. Add the following relation to the `relations` section:

    <details>
    <summary><b>AI coding agent relation (Click to expand)</b></summary>

    ```json showLineNumbers
    "ai_coding_agent": {
      "title": "AI Coding Agent",
      "target": "ai_coding_agent",
      "required": false,
      "many": false
    }
    ```
    </details>

6. Click `Save` to update the blueprint.


### Update GitHub integration configuration

Now we will update the GitHub integration configuration to ensure that the new properties added to the pull requests are correctly mapped.

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Find your GitHub integration and click on it.
3. Go to the `Mapping` tab.
4. Add the following YAML block into the editor to map the pull request properties:

    <details>
    <summary><b>Updated GitHub integration configuration (Click to expand)</b></summary>

    ```yaml showLineNumbers
    - kind: pull-request
      selector:
        query: "true"
      port:
        entity:
          mappings:
            identifier: .id|tostring
            title: .title
            blueprint: '"githubPullRequest"'
            properties:
              status: .status
              closedAt: .closed_at
              updatedAt: .updated_at
              mergedAt: .merged_at
              createdAt: .created_at
              prNumber: .number
              link: .html_url
              labels: '[.labels[].name]'
              branch: .head.ref
              draft: .draft
              workStatus: >-
                if (.title | test("WIP"; "i")) then
                  "In Progress"
                elif (.draft == true and ((.requested_reviewers // []) | length) >
                0) then
                  "Awaiting review"
                elif (.draft == true and (.title | test("WIP"; "i") | not) and
                ((.requested_reviewers // []) | length) == 0) then
                  "Requested changes"
                elif (.draft != true) then
                  "Approved"
                else
                  "Unknown"
                end
              leadTimeHours: >-
                (.created_at as $createdAt | .merged_at as $mergedAt | ($createdAt
                | sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime)
                as $createdTimestamp | ($mergedAt | if . == null then null else
                sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime end)
                as $mergedTimestamp | if $mergedTimestamp == null then null else
                (((($mergedTimestamp - $createdTimestamp) / 3600) * 100 | floor) /
                100) end)
            relations:
              repository: .head.repo.name
    ```
    :::tip Work Status JQ explanation
    This JQ determines the work status of a PR based on:
    - **In Progress**: PR title contains "WIP" (work in progress)
    - **Awaiting review**: Draft PR with assigned reviewers
    - **Requested changes**: Draft PR without reviewers (likely needs changes)
    - **Approved**: Non-draft PR (ready for final review)
    - **Unknown**: Any other state
    :::
    </details>

:::tip Alternative mapping for Claude/Devin PRs
The default `workStatus` mapping is optimized for **GitHub Copilot**, which usually opens **draft PRs** or adds **"WIP"** to titles.  

For **Claude or Devin**, PRs are typically created as *regular, non-draft PRs* with no WIP indicators.  
In that case, you can use this simplified mapping that relies only on **reviewers** and **merge status**:

<details> 
<summary><b>Alternative mapping for Claude/Devin PRs (Click to expand)</b></summary>

```yaml showLineNumbers
workStatus: >-
  if ((.requested_reviewers // []) | length) > 0 then
    "Awaiting review"
  elif ((.requested_reviewers // []) | length) == 0 then
    "In Progress"
  else
    "Unknown"
  end
```
</details>
:::

## Set up automations

To effectively track the status of coding agents, we will create several automations. You have the flexibility to determine if a coding agent participated in a PR creation by examining its comments, commits, or both, depending on your specific needs. This allows you to tailor the tracking process to best fit your requirements.

### Add Port secrets

Before setting up the automations, ensure you have added the necessary secrets to securely interact with the GitHub REST API within your portal. This is essential for accessing the required data.

To add the secret to your portal:

1. Click on the `...` button in the top right corner of your Port application.
2. Click on **Credentials**.
3. Click on the `Secrets` tab.
4. Click on `+ Secret` and add the following secret:

    - `GITHUB_TOKEN` - Your [GitHub fine-grained access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) with access to read repository commits and comments.

Once the secret is added, you can proceed with setting up the automations based on your chosen method of tracking AI participation:

<Tabs groupId="ai-participation">
<TabItem value="commits" label="Commits (AI wrote code)">

### Commits Automation Flow

This flow identifies AI involvement in code writing by analyzing commit data.

1. **Run automation** to fetch commits for each PR update.
2. **Run second automation** to extract and identify coding agent names from commits.


<h4> Automation 1: Get commits on PR updated </h4>

This automation only runs when the `ai_coding_agent` relation is null (before and after) to ensure that it only processes pull requests that have not yet been associated with an AI coding agent.

1. Go to the [Automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Get commits on PR updated automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "get_commits_on_pr_updated",
      "title": "Get Commits on PR Updated",
      "description": "Automation to get the commits upon PR updates",
      "icon": "GitPullRequest",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "githubPullRequest"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.before.relations.ai_coding_agent == null",
            ".diff.after.relations.ai_coding_agent == null"
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "{{ .event.diff.after.properties.link | sub(\"https://github.com/\"; \"https://api.github.com/repos/\") | sub(\"/pull/\"; \"/pulls/\") + \"/commits\" }}",
        "agent": false,
        "synchronized": true,
        "method": "GET",
        "headers": {
          "Accept": "application/vnd.github+json",
          "Authorization": "Bearer {{ .secrets.GITHUB_TOKEN }}",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
          "Identifier": "{{ .event.context.entityIdentifier | tostring }}",
          "Pr-Link": "{{ .event.diff.after.properties.link }}"
        },
        "body": {}
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.


<h4> Automation 2: Update PR with AI coding agent (commit-based) </h4>

This automation only runs if the commits response contains a match for AI agents, ensuring that only relevant pull requests are updated with AI coding agent information.

1. Go back to the [Automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Update PR with AI coding agent using commit automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "update_pr_with_ai_coding_agent",
      "title": "Update PR with AI Coding Agent Using Commit",
      "description": "Automation to update the PR with the AI coding agent involved in it (from commits)",
      "icon": "GitPullRequest",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "get_commits_on_pr_updated"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.status == \"SUCCESS\"",
            ".diff.before.response | [ .[] | (.commit.author.name // \"\") | select(test(\"(?i)copilot|claude|devin\")) ] | length > 0"
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "githubPullRequest",
        "mapping": {
          "identifier": "{{ .event.diff.before.payload.headers.Identifier | tostring }}",
          "relations": {
            "ai_coding_agent": "{{ .event.diff.before.response | [.[] | .commit.author.name // \"\"  | if test(\"(?i)copilot\") then \"Copilot\" elif test(\"(?i)claude\") then \"Claude\" elif test(\"(?i)devin\") then \"Devin\" else empty end] | unique | first }}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.

</TabItem>
<TabItem value="comments" label="Comments (AI reviewed code)">

### Comments Automation Flow

This flow identifies AI involvement in code review by analyzing comment data.

1. **Run automation** to fetch comments for each PR update.
2. **Run second automation** to extract and identify coding agent names from comments.

<h4> Automation 1: Get comments on PR updated </h4>

1. Go to the [Automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Get comments on PR updated automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "get_comments_on_pr_updated",
      "title": "Get Comments on PR Updated",
      "description": "Fetch PR comments upon PR updates",
      "icon": "GitPullRequest",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "githubPullRequest"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.before.relations.ai_coding_agent == null",
            ".diff.after.relations.ai_coding_agent == null"
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "{{ .event.diff.after.properties.link | sub(\"https://github.com/\"; \"https://api.github.com/repos/\") | sub(\"/pull/\"; \"/issues/\") + \"/comments\" }}",
        "agent": false,
        "synchronized": true,
        "method": "GET",
        "headers": {
          "Accept": "application/vnd.github+json",
          "Authorization": "Bearer {{ .secrets.GITHUB_TOKEN }}",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
          "Identifier": "{{ .event.context.entityIdentifier | tostring  }}"
        },
        "body": {}
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.

<h4> Automation 2: Update PR with AI coding agent (comment-based) </h4>

This automation only runs if the comments response contains a match for AI agents, ensuring that the PR is updated only when relevant AI activity is detected.

1. Go back to the [Automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Update PR with AI coding agent using comments automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "update_pr_with_ai_coding_agent_comment",
      "title": "Update PR with AI Coding Agent Using Comments",
      "description": "Automation to update the PR with the AI coding agent mentioned in PR comments",
      "icon": "GitPullRequest",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "get_comments_on_pr_updated"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.status == \"SUCCESS\"",
            ".diff.before.response | [ .[] | ((.user.login // \"\") + \" \" + (.body // \"\")) | select(test(\"(?i)copilot|claude|devin\")) ] | length > 0"
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "githubPullRequest",
        "mapping": {
          "identifier": "{{ .event.diff.before.payload.headers.Identifier | tostring }}",
          "relations": {
            "ai_coding_agent": "{{ .event.diff.before.response | [.[] | (.user.login // \"\") + \" \" + (.body // \"\") | if test(\"(?i)copilot\") then \"Copilot\" elif test(\"(?i)claude\") then \"Claude\" elif test(\"(?i)devin\") then \"Devin\" else empty end] | unique | first }}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.

</TabItem>
</Tabs>


## Create dashboard

With your data model and automations in place, we can create a dedicated dashboard in Port to visualize all AI-driven pull requests and track their status.


### Create AI Control Center dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **AI Control Center**.
5. Input `Track and monitor AI-driven pull requests in your development workflow` under **Description**.
6. Select the `AI` icon.
7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from AI-driven pull requests.


### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Dashboard description (Click to expand)</b></summary>

1. Click `+ Widget` and select **Markdown**.
2. Copy and paste the following content:

```markdown
## 🔍 What This Dashboard Shows

This dashboard gives your team full visibility into what AI agents are doing right now.

- ✅ Track every pull request opened or modified by AI agents
- 🧠 Stay aligned across human and AI contributors—no guessing, no Slack chases

Built with Port to bring clarity to your AI-driven SDLC.
```

3. Click `Save`.

<img src="/img/guides/ai-driven-pr-dashboard-info-markdown.png" border="1px" width="100%" />

</details>

<details>
<summary><b>AI-driven pull requests table (Click to expand)</b></summary>

1. Click `+ Widget` and select **Table**.
2. Title: `AI-driven pull requests` (add the `GitPullRequest` icon).
3. Choose the **Pull Request** blueprint.
4. Add a filter with the following configuration:

```json showLineNumbers
{
  "combinator": "or",
  "rules": [
    {
      "blueprint": "ai_coding_agent",
      "operator": "relatedTo",
      "value": "Claude",
      "direction": "downstream"
    },
    {
      "blueprint": "ai_coding_agent",
      "operator": "relatedTo",
      "value": "Copilot",
      "direction": "downstream"
    }
  ]
}
```

5. Click `Save` to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Title**: The title of the pull request.
    - **Link**: The URL to the pull request.
    - **PR Urgency**: The urgency level of the PR.
    - **Repository**: The repository where the PR was created.
    - **AI Coding Agent**: The AI agent involved in the PR.
8. Click on the **Group by** option and select **Work Status** to group PRs by their current status.
9. Click on the **save icon** in the top right corner of the widget to save the customized table.

<img src="/img/guides/ai-driven-pr-dashboard.png" border="1px" width="100%" />

</details>

<details>
<summary><b>Open PRs assigned to agents (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Open PRs assigned to agents` (add the `AI` icon).
3. Select `Aggregate by property` **Chart type** and choose **AI Coding Agent** as the **Blueprint**.
4. Select `Total open PRs` as the **Property** and choose `sum` for the **Function**.
5. Select `custom` as the **Unit** and input `prs` as the **Custom unit**
6. Click `Save`.

<img src="/img/guides/ai-driven-pr-dashboard-open-pr.png" border="1px" width="70%"/>

</details>

<details>
<summary><b>Total PRs assigned to agents (click to expand)</b></summary>

1. Click `+ Widget` and select **Line Chart**.
2. Title: `PRs assigned to agents`, (add the `LineChart` icon).
3. Select `Count Entities (All Entities)` **Chart type** and choose **Pull Request** as the **Blueprint**.
4. Input `Total PRs` as the **Y axis** **Title** and choose `AI Coding Agent` as the breakdown **Property**.
5. Set `count` as the **Function**.
6. Input `Date` as the **X axis** **Title** and choose `Created At` as the **Measure time by**.
7. Set **Time Interval** to `Week` and **Time Range** to `In the past 90 days`.
8. Click `Save`.

<img src="/img/guides/ai-driven-pr-dashboard-total-prs.png" border="1px" width="100%"/>

</details>

## Test the workflow

Now let us test the complete workflow to ensure everything works correctly.

<h4>Trigger a test PR update</h4>

1. In a repository integrated into Port, trigger a new coding agent to open a pull request.
2. Once the PR is opened, verify that it appears in Port and check its AI work status.
3. After a new commit is made, ensure the selected coding agent is correctly identified.

<h4>Check the dashboard</h4>

The AI-driven pull requests should now appear in your AI Control Center dashboard, properly categorized and grouped by work status.

## Related guides
- [Trigger GitHub Copilot from Port](https://docs.port.io/guides/all/trigger-github-copilot-from-port)
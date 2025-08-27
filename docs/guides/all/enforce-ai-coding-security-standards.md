---
displayed_sidebar: null
description: Learn how to enforce AI coding security standards by checking for Cursor rules, GitHub Copilot instructions, and Claude Code rules using Port scorecards and GitHub integration.
---

# Enforce AI coding security standards

Security engineers need to ensure that development teams follow proper AI coding security standards. This guide demonstrates how to use Port scorecards to automatically check if repositories have the necessary AI coding rules defined, helping enforce security best practices across your organization.

<img src='/img/guides/ai-coding-security-standards-dashboard.png' border="1px" width="100%" />

## Common use cases

- Enforce consistent AI coding standards across development teams
- Identify repositories that need security review for AI coding practices


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [GitHub integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.

:::tip Alternative integrations
While this guide uses GitHub, you can adapt it for other Git providers like GitLab, Azure DevOps, or Bitbucket by updating the file path mappings accordingly.
:::


## Set up data model

We will enhance the GitHub repository blueprint to include AI coding security rules and then configure the GitHub integration to ingest these files automatically.


### Update the repository blueprint

To track AI coding security rules, we need to add a property to store the content of AI coding instruction files.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find and select your existing repository blueprint (e.g., `githubRepository`).
3. Click on `{...} Edit JSON`.
4. Add the following property to the `properties` section:

    <details>
    <summary><b>AI coding security rules property (click to expand)</b></summary>

    ```json showLineNumbers
    "ai_coding_rules": {
      "type": "string",
      "title": "AI Coding Rules",
      "format": "markdown",
      "description": "AI coding security rules and instructions for Cursor, GitHub Copilot, or Claude Code"
    }
    ```
    </details>

5. Click `Save` to update the blueprint.

:::tip File naming conventions
The property name `ai_coding_rules` is generic and can store rules for any AI coding tool. Common file locations include:
- `.cursor/rules/cursor-rules.md` for Cursor
- `.github/copilot-instructions.md` for GitHub Copilot  
- `CLAUDE.md` for Claude Code
:::


### Update GitHub integration mapping

Now we need to configure the GitHub integration to automatically ingest the AI coding security rules files from repositories.

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Find your GitHub integration and click on it.
3. Go to the `Mapping` tab.
4. Update the mapping configuration to include the `ai_coding_rules` property:

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
                ai_coding_rules: file://.cursor/rules/cursor-rules.md
                url: .html_url
                defaultBranch: .default_branch
    ```
    </details>

5. Click `Save` to update the integration configuration.

:::caution File path considerations
The integration will look for files at the exact path specified. If your repositories use different file locations, we recommend standardizing file naming across your organization.
:::


## Create AI coding security scorecard

We will create a scorecard that automatically evaluates repositories based on whether they have AI coding security rules defined.


### Configure the scorecard

1. Go to your [builder](https://app.getport.io/settings/data-model) page.
2. Search for the **Service** blueprint and select it.
3. Click on the `Scorecards` tab.
4. Click on `+ New Scorecard` to create a new scorecard.
5. Add this JSON configuration:

    <details>
    <summary><b>AI coding security scorecard configuration (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "ai_security_rules",
      "title": "AI Security Rules",
      "description": "Evaluates repositories based on their AI coding security rules compliance",
      "icon": "Shield",
      "blueprint": "githubRepo",
      "levels": [
        {
          "color": "paleBlue",
          "title": "Basic",
          "description": "No AI coding security rules defined"
        },
        {
          "color": "bronze",
          "title": "Bronze",
          "description": "Basic AI coding security rules present"
        },
        {
          "color": "silver",
          "title": "Silver",
          "description": "Comprehensive AI coding security rules with best practices"
        },
        {
          "color": "gold",
          "title": "Gold",
          "description": "Advanced AI coding security rules with security controls and monitoring"
        }
      ],
      "rules": [
        {
          "identifier": "has_coding_rules",
          "title": "Has Coding Rules",
          "level": "Gold",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "ai_coding_rules"
              }
            ]
          }
        },
        {
          "identifier": "has_security_guide",
          "title": "Contains Security Guidelines",
          "level": "Silver",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "ai_coding_rules"
              },
              {
                "operator": "contains",
                "property": "ai_coding_rules",
                "value": "security"
              }
            ]
          }
        },
        {
          "identifier": "has_codereview_guide",
          "title": "Contains Code Review Guidelines",
          "level": "Bronze",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "ai_coding_rules"
              },
              {
                "operator": "contains",
                "property": "ai_coding_rules",
                "value": "review"
              }
            ]
          }
        }
      ]
    }
    ```
    </details>

6. Click `Save` to create the scorecard.

:::tip Rule customization
You can customize the scoring rules based on your organization's specific requirements:
- Add rules for specific security keywords or patterns
- Include rules for minimum content length
- Create rules for specific AI tool compliance
- Add rules for regular updates to security guidelines
:::



## Create dashboard

Now let's create a dashboard to visualize the AI coding security standards across your repositories, making it easy to track compliance and identify areas for improvement.

### Set up the dashboard

1. Go to your [dashboards](https://app.getport.io/dashboards) page in Port.
2. Click on `+ New Dashboard`.
3. Name your dashboard "AI Coding Security Standards".
4. Add the following widgets to visualize your secure coding practices:

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Overall distribution of security compliance levels (click to expand)</b></summary>

1. Click `+ Widget` and select **Pie chart**.
2. Title: `Security Compliance Distribution` (add the `Pie` icon).
3. Choose your repository blueprint (e.g., `githubRepository`).
4. Under `Breakdown by property`, select **AI Security Rules**.
5. Click **Save**.

</details>

<details>
<summary><b>Repositories without security rules (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **Repositories Missing AI Security Rules**.
3. Choose your repository blueprint (e.g., `githubRepository`).
4. Add filter where `AI Coding Rules` is empty.
5. Click **Save** to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Repository Name**: The name of the repository.
    - **URL**: The link to the repository.
    - **Last Updated**: When the repository was last updated.
    - **AI Security Rules**: The AI coding security rules content.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

## Related guides

- [Auto-fix services when scorecards degrade](https://docs.port.io/guides/all/self-heal-scorecards-with-ai/)

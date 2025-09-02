---
displayed_sidebar: null
description: Learn how to enforce AI coding security standards by checking for comprehensive Cursor security rules and GitHub Copilot instructions using Port scorecards and GitHub integration.
---

# Enforce AI coding security standards

Security engineers need to ensure that development teams follow proper AI coding security standards. This guide demonstrates how to use Port scorecards to automatically check if repositories have AI coding rules defined, helping enforce security best practices across your organization.

<img src='/img/guides/ai-coding-security-standards-dashboard.png' border="1px" width="100%" />

## Common use cases

- **Enforce security standards** by ensuring repositories have detailed Cursor security rules and GitHub Copilot instructions
- **Track security compliance** across development teams with specific, actionable security requirements
- **Identify security gaps** in AI coding practices and prioritize remediation efforts
- **Maintain consistent security standards** across all repositories and development workflows

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [GitHub integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.

:::tip Alternative integrations
While this guide uses GitHub, you can adapt it for other Git providers like GitLab, Azure DevOps, or Bitbucket by updating the file path mappings accordingly.
:::

## Set up data model

We will enhance the GitHub repository blueprint to include AI coding security rules and GitHub Copilot instructions, then configure the GitHub integration to ingest these files automatically.

### Update the repository blueprint

To track AI coding security standards, we need to add properties for both Cursor security rules and GitHub Copilot instructions.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find and select your existing repository blueprint (e.g., `githubRepository`).
3. Click on `{...} Edit JSON`.
4. Add the following properties to the `properties` section:

    <details>
    <summary><b>AI coding security rules properties (click to expand)</b></summary>

    ```json showLineNumbers
    "cursor_authentication_rules": {
      "type": "string",
      "title": "Authentication Rules",
      "format": "markdown",
      "description": "Authentication and authorization security rules"
    },
    "cursor_command_injection_rules": {
      "type": "string",
      "title": "Command Injection Rules",
      "format": "markdown",
      "description": "Command injection protection rules"
    },
    "cursor_database_rules": {
      "type": "string",
      "title": "Database Security Rules",
      "format": "markdown",
      "description": "Database security and SQL injection prevention rules"
    },
    "cursor_file_upload_rules": {
      "type": "string",
      "title": "File Upload Security Rules",
      "format": "markdown",
      "description": "File upload validation and security rules"
    },
    "cursor_input_validation_rules": {
      "type": "string",
      "title": "Input Validation Rules",
      "format": "markdown",
      "description": "Input validation and XSS prevention rules"
    },
    "cursor_owasp_rules": {
      "type": "string",
      "title": "OWASP Top 10 Rules",
      "format": "markdown",
      "description": "OWASP Top 10 security vulnerability prevention rules"
    },
    "cursor_logging_rules": {
      "type": "string",
      "title": "Security Logging Rules",
      "format": "markdown",
      "description": "Security logging and error handling rules"
    },
    "copilot_documentation_instructions": {
      "type": "string",
      "title": "Documentation Instructions",
      "format": "markdown",
      "description": "GitHub Copilot documentation writing guidelines"
    },
    "copilot_general_coding_instructions": {
      "type": "string",
      "title": "General Coding Instructions",
      "format": "markdown",
      "description": "GitHub Copilot general coding standards"
    },
    "copilot_language_specific_instructions": {
      "type": "string",
      "title": "Language-Specific Instructions",
      "format": "markdown",
      "description": "GitHub Copilot language-specific coding standards"
    }
    ```
    </details>

5. Click `Save` to update the blueprint.

:::tip File structure
This setup expects the following file structure in your repositories:
- **Cursor rules**: `.cursor/rules/security/*.md` files
- **GitHub Copilot instructions**: `.github/instructions/*.instructions.md` files
:::

### Update GitHub integration mapping

Now we need to configure the GitHub integration to automatically ingest all the AI coding security rules and instructions files from repositories.

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Find your GitHub integration and click on it.
3. Go to the `Mapping` tab.
4. Update the mapping configuration to include all the security and instruction properties:

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
                cursor_authentication_rules: file://.cursor/rules/security/authentication.md
                cursor_command_injection_rules: file://.cursor/rules/security/command-injection.md
                cursor_database_rules: file://.cursor/rules/security/database.md
                cursor_file_upload_rules: file://.cursor/rules/security/file-upload.md
                cursor_input_validation_rules: file://.cursor/rules/security/input-validation.md
                cursor_owasp_rules: file://.cursor/rules/security/owasp-10.md
                cursor_logging_rules: file://.cursor/rules/security/logging.md
                copilot_documentation_instructions: file://.github/instructions/documentation.instructions.md
                copilot_general_coding_instructions: file://.github/instructions/general-coding.instructions.md
                copilot_language_specific_instructions: file://.github/instructions/language-specific.instructions.md
                url: .html_url
                defaultBranch: .default_branch
    ```
    </details>

5. Click `Save` to update the integration configuration.

:::caution File path considerations
The integration will look for files at the exact paths specified. Ensure your repositories follow the standardized file structure for consistent mapping across your organization.
:::

### Configure the scorecard

We will create a detailed scorecard that evaluates repositories based on their comprehensive AI coding security rules and GitHub Copilot instructions compliance:

1. Go to your [builder](https://app.getport.io/settings/data-model) page.
2. Search for the **Service** blueprint and select it.
3. Click on the `Scorecards` tab.
4. Click on `+ New Scorecard` to create a new scorecard.
5. Add this JSON configuration:

    <details>
    <summary><b>AI coding security scorecard configuration (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "ai_coding_security_standards",
      "title": "AI Coding Security Standards",
      "levels": [
        {
          "color": "red",
          "title": "Critical",
          "description": "Missing essential security rules - immediate attention required"
        },
        {
          "color": "orange",
          "title": "High Risk",
          "description": "Missing critical security rules - high priority remediation needed"
        },
        {
          "color": "yellow",
          "title": "Medium Risk",
          "description": "Some security rules present but gaps exist - moderate priority"
        },
        {
          "color": "blue",
          "title": "Compliant",
          "description": "Most security rules implemented - good security posture"
        },
        {
          "color": "green",
          "title": "Elite",
          "description": "Comprehensive security rules and best practices implemented"
        }
      ],
      "rules": [
        {
          "identifier": "auth_rules",
          "title": "Authentication & Authorization Rules",
          "level": "Elite",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "cursor_authentication_rules"
              }
            ]
          }
        },
        {
          "identifier": "cmd_injection",
          "title": "Command Injection Protection",
          "level": "Elite",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "cursor_command_injection_rules"
              }
            ]
          }
        },
        {
          "identifier": "db_security",
          "title": "Database Security Rules",
          "level": "Elite",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "cursor_database_rules"
              }
            ]
          }
        },
        {
          "identifier": "file_upload",
          "title": "File Upload Security",
          "level": "Elite",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "cursor_file_upload_rules"
              }
            ]
          }
        },
        {
          "identifier": "input_validation",
          "title": "Input Validation & XSS Prevention",
          "level": "Elite",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "cursor_input_validation_rules"
              }
            ]
          }
        },
        {
          "identifier": "owasp_compliance",
          "title": "OWASP Top 10 Compliance",
          "level": "Elite",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "cursor_owasp_rules"
              }
            ]
          }
        },
        {
          "identifier": "security_logging",
          "title": "Security Logging & Error Handling",
          "level": "Elite",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "cursor_logging_rules"
              }
            ]
          }
        },
        {
          "identifier": "copilot_docs",
          "title": "GitHub Copilot Documentation Standards",
          "level": "Compliant",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "copilot_documentation_instructions"
              }
            ]
          }
        },
        {
          "identifier": "copilot_coding",
          "title": "GitHub Copilot Coding Standards",
          "level": "Compliant",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "copilot_general_coding_instructions"
              }
            ]
          }
        },
        {
          "identifier": "lang_standards",
          "title": "Language-Specific Coding Standards",
          "level": "Compliant",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "copilot_language_specific_instructions"
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
<summary><b>Overall security compliance distribution (click to expand)</b></summary>

1. Click `+ Widget` and select **Pie chart**.
2. Title: `Security Compliance Distribution` (add the `Pie` icon).
3. Choose your repository blueprint (e.g., `githubRepository`).
4. Under `Breakdown by property`, select **AI Coding Security Standards**.
5. Click **Save**.

</details>

<details>
<summary><b>Repositories without security rules (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **Repositories Missing AI Security Rules**.
3. Choose your repository blueprint (e.g., `githubRepository`).
4. Add filter where `AI Coding Security Standards` equals `Critical`.
5. Click **Save** to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Repository Name**: The name of the repository.
    - **URL**: The link to the repository.
    - **Last Updated**: When the repository was last updated.
    - **AI Coding Security Standards**: The AI coding security rules content.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

## Related guides

- [Auto-fix services when scorecards degrade](https://docs.port.io/guides/all/self-heal-scorecards-with-ai/)

---
displayed_sidebar: null
description: Learn how to enhance your entities with AI-powered insights from external APIs in Port
---
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'

# Enrich entities using AI

## Overview
This guide will help you implement a self-service action in Port that uses AI to enrich entity properties with data from external APIs. This pattern enables you to automatically enhance your entities with intelligent insights from various AI services, making your software catalog more informative and actionable.


In this guide, we'll implement a security feature that uses OpenAI's API to analyze security issues and provide insights and possible remediation steps.


## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to OpenAI API with appropriate permissions (for this example).
- A blueprint for your entity type in Port (if you don't have one already).

## Set up data model

If you have one of Port's security integrations installed ([Snyk](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/snyk/), [Wiz](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/wiz/), or [SonarQube](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube/)), you can simply follow these steps to add the `ai_summary` property to your existing **issue** or **vulnerability** blueprint:

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Search for the blueprint you want to update.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON snippet to the properties of the blueprint:

    ```json
          "ai_summary": {
            "type": "string",
            "title": "AI Analysis",
            "description": "AI-generated analysis and remediation steps",
            "format": "markdown"
          }
    ```
5. Click `Save`.

However, if you don't have a security integration installed, follow these steps to create a new blueprint with structure below:

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on the `+ Blueprint` button.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Copy and paste the following JSON configuration into the editor.

    ```json showLineNumbers
    {
      "identifier": "security_issue",
      "title": "Security Issue",
      "schema": {
        "properties": {
          "rule_name": {
            "type": "string",
            "title": "Rule Name",
            "description": "Name of the security rule or CVE"
          },
          "ai_summary": {
            "type": "string",
            "title": "AI Analysis",
            "description": "AI-generated analysis and remediation steps",
            "format": "markdown"
          }
        }
      }
    }
    ```
5. Click `Save`.

## Implementation

### Add Port secrets

To add this secret to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secret:
   - `OPEN_AI_API_KEY` - Your OpenAI API key

### Create a self-service action

Follow these steps to create the self-service action:

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Enrich entity with security issue analysis (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "enrich_security_issue_with_ai",
      "title": "Enrich entity with security issue analysis using AI",
      "icon": "Codacy",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "security_issue"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.openai.com/v1/chat/completions",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json",
          "Authorization": "Bearer {{ .secrets.OPEN_AI_API_KEY }}"
        },
        "body": {
          "model": "gpt-3.5-turbo",
          "messages": [
            {
              "role": "system",
              "content": "you are a security expert and should help remediate issues. Lookup for this CVE and provide in markdown few sentences on what is it and how to resolve. Limit to 500 chars. Return in markdown formatting."
            },
            {
              "role": "user",
              "content": " {{ .entity.properties.rule_name }} "
            }
          ]
        }
      }
    }
    ```
    :::tip Blueprint identifier
    Remember to replace the `security_issue` identifier with the identifier of your blueprint if you are using 
    any of Port's security integrations. ie `snykVulnerability`, `wizIssue`, `sonarQubeIssue` for Snyk, Wiz, and SonarQube respectively.
    :::
    </details>

5. Click `Save`.

### Create an automation to update entity

After each execution of the action, we want to update the relevant entity in Port with the AI-generated analysis.

To create the automation:

1. Head to the [automation](https://app.getport.io/settings/automations) page.

2. Click on the `+ Automation` button.

3. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Update Entity with AI Analysis (Click to expand)</b></summary>


    ```json showLineNumbers
    {
      "identifier": "updateSecurityMarkdown",
      "title": "Update security markdown based on AI analysis",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "enrich_security_issue_with_ai"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.status == \"SUCCESS\""
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "security_issue",
        "mapping": {
          "identifier": "{{ .event.diff.after.entity.identifier }} ",
          "properties": {
            "ai_summary": "{{ .event.diff.after.response.choices[0].message.content }}"
          }
        }
      },
      "publish": true
    }
    ```
    :::tip Blueprint identifier
    Remember to replace the `security_issue` identifier with the identifier of your blueprint if you are using 
    any of Port's security integrations. ie `snykVulnerability`, `wizIssue`, `sonarQubeIssue` for Snyk, Wiz, and SonarQube respectively.
    :::

    </details>

4. Click `Save`.

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Click on the `Enrich entity with security issue analysis using AI` action

3. Choose the security issue you want to analyze

4. Click on `Execute`

5. Wait for the AI to analyze the security issue

6. Verify that the entity in Port has been updated with the AI-generated analysis in the `ai_summary` field


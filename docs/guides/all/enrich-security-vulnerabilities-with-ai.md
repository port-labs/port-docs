---
title: Enrich security vulnerabilities using AI
displayed_sidebar: null
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Enrich security vulnerabilities using AI

This guide demonstrates how to leverage 3rd-party AI tools within Port to get additional details on security vulnerabilities and mitigation strategies.

## Common Use Cases

- **Rapid Vulnerability Assessment**: Quickly understand the impact and severity of newly discovered vulnerabilities in your codebase
- **Automated Remediation Guidance**: Get immediate, AI-powered suggestions for fixing security issues without extensive research
- **Security Knowledge Sharing**: Democratize security expertise across development teams by providing AI-generated explanations
- **Efficient Triage**: Help security teams prioritize vulnerabilities based on AI-enhanced context and impact analysis
- **Developer Education**: Use AI-generated explanations as learning opportunities for developers to understand security concepts

## Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](https://docs.getport.io/quickstart).
- You will need at least one code security tool integrated. You can check our [integrations section](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/).
- You will need access to the LLM API you wish to integrate (e.g., OpenAI ChatGPT).
- You should have a security issue blueprint set up in your Port installation (such as the `snykVulnerability` blueprint).

### About CVEs

A Common Vulnerabilities and Exposures (CVE) is a unique identifier assigned to a specific security vulnerability. CVEs help track and reference known security issues across different security tools and databases. For example, `CVE-2021-44228` refers to the Log4Shell vulnerability in Log4j.

### Required Blueprint Fields

This guide assumes your security issue blueprint includes a `cveID` field to store the CVE identifier. If your blueprint doesn't have this field, you'll need to add it first:

1. Go to the [Builder](https://app.getport.io/settings/data-model) page
2. Find your security issue blueprint
3. Click "Edit JSON"
4. Add the following field to your blueprint's properties:

```json
{
  "cveID": {
    "type": "string",
    "title": "CVE ID",
    "description": "The CVE identifier for this security vulnerability"
  }
}
```

5. Click "Save" to update the blueprint

## The goal of this guide

Code security tools provide context for issues in your code. This guide will show how to leverage AI to understand these issues better and how to fix them.
After completing it, developers can resolve issues faster and more independently by getting AI-powered insights about vulnerabilities and their remediation steps.

## Configure AI Integration

To configure the AI integration with your LLM provider, follow these steps:

1. Go to your Port [settings page](https://app.getport.io/settings/secrets)
2. Click on "Add new secret"
3. Enter a name for your secret (e.g., `gpt_token`)
4. Paste your LLM API token (e.g., OpenAI API key)
5. Click "Save"

:::tip
For more information about managing secrets in Port, see the [secrets documentation](https://docs.getport.io/sso-rbac/port-secrets/).
:::

## Create Blueprint Fields

We'll add a new markdown field to store AI-generated insights about security vulnerabilities. This field will be added to your existing security issue blueprint (e.g., `snykVulnerability`).

1. Go to the [Builder](https://app.getport.io/settings/data-model) page in your Port installation
2. Find your security issue blueprint (e.g., `snykVulnerability`)
3. Click on "Edit JSON"
4. Add the following field to your blueprint's properties:

```json
{
  "ai_summary": {
    "type": "string",
    "title": "ai_summary",
    "format": "markdown"
  }
}
```

5. Click "Save" to update the blueprint

## Define Action Configuration

1. Navigate to the [Self-service tab](https://app.getport.io/self-serve) in your Port application
2. Click on "New action"
3. Click on "Edit JSON" and paste the following configuration:

<details>
<summary><b>Action Configuration (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "enrichSecurityVulnerabilityUsingAI",
  "title": "Enrich security vulnerability using AI",
  "icon": "Codacy",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {},
      "required": [],
      "order": []
    },
    "blueprintIdentifier": "snykVulnerability"
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
      "Authorization": "Bearer {{ .secrets.gpt_token }}"
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
          "content": " {{ .entity.properties.cveID }} "
        }
      ]
    }
  }
}
```

</details>

4. Click "Create" to save the action

## Create Automation Workflow

To automatically update the security issue with the AI response, create an automation:

1. Navigate to the [Automations](https://app.getport.io/settings/automations) page
2. Click on "New automation"
3. Click on "Edit JSON" and paste the following configuration:

<details>
<summary><b>Automation Configuration (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "updateSecurityIssueWithAIResponse",
  "title": "Update security issue based on AI",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "RUN_UPDATED",
      "actionIdentifier": "enrichSecurityVulnerabilityUsingAI"
    },
    "condition": {
      "type": "JQ",
      "expressions": [".diff.after.status == \"SUCCESS\""],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "snykVulnerability",
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

</details>

4. Click "Create" to save the automation

## Verify Integration

To test the AI enrichment functionality:

1. Navigate to your security issues page in Port
2. Select a security issue that has a CVE ID
3. Click on the "..." menu
4. Select "Enrich security vulnerability using AI"
5. Wait a few seconds for the action to complete
6. Refresh the page
7. You should now see the AI-generated summary in the "AI Summary" field

![AI-generated summary for CVE-2022-48196](/img/guides/ai-security-summary-example.png)

The image above shows an example of an AI-generated summary for CVE-2022-48196, demonstrating how the AI provides:

- A brief explanation of the vulnerability
- Potential impact
- Recommended remediation steps

By following these steps, you've set up an AI-powered system to help developers understand and fix security vulnerabilities more effectively 🎉

## Possible Enhancements

Here are some ways you could extend this integration:

- **Multiple AI Models**: Configure the action to use different AI models based on the vulnerability type
- **Enhanced Prompts**: Customize the AI prompt to include more context about your specific technology stack
- **Automated Notifications**: Set up Slack notifications when new AI-enriched vulnerabilities are detected
- **Historical Analysis**: Store and analyze AI-generated remediation suggestions to build an knowledge base
- **Custom Scoring**: Use AI insights to develop a custom vulnerability scoring system

:::info AI Integration
The integration uses OpenAI's GPT-3.5 Turbo model by default, but you can modify the configuration to use other AI models:

- Change the `url` in the action configuration to point to your preferred AI service (e.g., Azure OpenAI, Anthropic, or your own hosted model)
- Adjust the prompt in the `content` field to match your use case (e.g., focus on specific vulnerability types or include company-specific mitigation policies)
- Modify the response parsing in the automation if the AI service returns a different format (the current automation expects the response in the OpenAI API format)
- Update the model parameter in the configuration to use a different model version or provider-specific model identifier

:::tip
Remember to update your API authentication headers according to your chosen AI provider's requirements.
:::

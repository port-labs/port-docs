---
sidebar_position: 2
title: Setup & Configuration
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Setup & Configuration

:::info Closed Beta
Port's AI offerings are currently in closed beta and will be gradually rolled out to users by the end of 2025.
:::

This guide covers all technical details for setting up and configuring LLM providers, including permissions, changing defaults, validation flow, and troubleshooting common issues.

## Permissions & Access Control

:::warning Admin access required
Managing LLM provider settings requires organization administrator permissions. Only admins can modify default providers or add new provider configurations.
:::

<Tabs groupId="user-permissions" queryString>
<TabItem value="admin" label="Admin Users">

**Administrators** can perform all LLM provider management operations:

**Configuration Operations**
- [Get default LLM provider and model](/api-reference/get-default-llm-provider-and-model) - View current default provider settings
- [Change default LLM provider and model](/api-reference/change-default-llm-provider-and-model) - Update organization default providers
- [Create or connect an LLM provider](/api-reference/create-or-connect-an-llm-provider) - Create and configure new LLM provider connections
- [Get a specific provider configuration](/api-reference/get-a-specific-provider-configuration) - View existing provider configurations
- [Delete a specific provider configuration](/api-reference/delete-a-specific-provider-configuration) - Delete provider configurations

**Management Capabilities**
- Set organization-wide default providers and models
- Configure provider-specific settings and credentials
- Manage provider access and permissions
- Test provider connections with validation

</TabItem>
<TabItem value="member" label="Organization Members">

**Organization members** have read-only access to LLM provider information:

**Read-Only Operations**
- [Get default LLM provider and model](/api-reference/get-default-llm-provider-and-model) - View current default provider settings
- [Get configured LLM providers](/api-reference/get-configured-llm-providers) - View available providers and their status
- See which models are currently configured as defaults

**No Management Access**
- Cannot modify provider configurations
- Cannot change default settings
- Cannot add or remove providers

</TabItem>
</Tabs>

## Prerequisites

Before configuring LLM providers, ensure you have:

1. **Access to Port AI**: Your organization has access to the Port AI features.
2. **Provider Accounts**: Active accounts with the LLM providers you want to use
3. **Admin Permissions**: Organization administrator role in Port

## Step 1: Store API Keys in Secrets

Before configuring providers, store your API keys in Port's secrets system. The secret names you choose are flexible - you'll reference them in your provider configuration.

1. Click on the `...` button in the top right corner of your Port application
2. Click on **Credentials**
3. Click on the `Secrets` tab
4. Click on `+ Secret` and add the required secrets for your chosen provider(s):

<Tabs groupId="provider-secrets" queryString>
<TabItem value="openai" label="OpenAI">

**Required Secret:**
- API Key secret (e.g., `openai-api-key`) - Your OpenAI API key

</TabItem>
<TabItem value="anthropic" label="Anthropic">

**Required Secret:**
- API Key secret (e.g., `anthropic-api-key`) - Your Anthropic API key

</TabItem>
<TabItem value="azure" label="Azure OpenAI">

**Required Secret:**
- API Key secret (e.g., `azure-openai-api-key`) - Your Azure OpenAI API key

</TabItem>
<TabItem value="bedrock" label="AWS Bedrock">

**Required Secrets:**
- Access Key ID secret (e.g., `aws-bedrock-access-key-id`) - Your AWS access key ID
- Secret Access Key secret (e.g., `aws-bedrock-secret-access-key`) - Your AWS secret access key

</TabItem>
</Tabs>

:::tip Secret naming flexibility
You can choose any names for your secrets. The examples above are suggestions - use names that make sense for your organization. You'll reference these exact names in your provider configuration.
:::

:::info One-time view
After creating a secret, you will be able to view its value only once. Afterwards, you will be able to delete the secret or edit its value, but not to view it.
:::

For more details on managing secrets, see the [Port Secrets documentation](/sso-rbac/port-secrets).

## Step 2: Configure LLM Providers

Use the [Create or connect an LLM provider](/api-reference/create-or-connect-an-llm-provider) API to configure your providers. The interactive API reference provides detailed examples and allows you to test the configuration for each provider type (OpenAI, Anthropic, Azure OpenAI, AWS Bedrock).

## Step 3: Validate Configuration

Test your provider configuration with connection validation using the [Create or connect an LLM provider](/api-reference/create-or-connect-an-llm-provider) API with the `validate_connection=true` parameter. The interactive API reference shows how to test your configuration before saving it.

## Getting Your Current Configuration

Retrieve your organization's current LLM provider defaults using the [Get default LLM provider and model](/api-reference/get-default-llm-provider-and-model) API. The interactive API reference shows the response format and allows you to test the endpoint.

### System Defaults

When no organization-specific defaults are configured, Port uses these system defaults:
- **Default Provider**: `port`
- **Default Model**: `claude-sonnet-4-20250514`

## Changing Default Providers

Update your organization's default LLM provider and model using the [Change default LLM provider and model](/api-reference/change-default-llm-provider-and-model) API. The interactive API reference provides the request format and response examples.

## Validation Flow

The system validates provider configurations to ensure they work correctly before saving. This includes checking credentials, testing connections, and verifying model availability.

For detailed information about how validation works during API requests, see [Selecting LLM Provider](/ai-interfaces/port-ai/llm-providers-management/selecting-llm-provider#provider-validation).

## Configuration Hierarchy

LLM provider settings follow a hierarchy from organization defaults to system defaults. 

For detailed information about how defaults are selected during API requests, see [Selecting LLM Provider](/ai-interfaces/port-ai/llm-providers-management/selecting-llm-provider#default-provider-selection).

## Frequently Asked Questions

<details>
<summary>I'm getting "LLM provider not found" - what should I do?</summary>

This error occurs when trying to use a provider that hasn't been configured:

```json
{
  "ok": false,
  "error": {
    "name": "LLMProviderNotFoundError",
    "message": "LLM provider 'openai' not found for organization"
  }
}
```

**Solution**: Create the provider configuration first using the steps above, or contact your organization administrator.

</details>

<details>
<summary>Why is my connection test failing?</summary>

Connection test failures usually indicate credential or configuration issues:

```json
{
  "ok": false,
  "error": {
    "name": "LLMProviderModelTestError",
    "message": "Connection test failed for provider 'openai'",
    "details": {
      "testedModels": {
        "gpt-5": { "isValid": false, "message": "Invalid API key" }
      }
    }
  }
}
```

**Solution**: 
- Verify your API key is correct and stored properly in secrets
- Ensure the API key has the required permissions for your provider
- Check if your provider account has sufficient quota/credits

</details>

<details>
<summary>I'm getting "apiKeySecretName is required" error</summary>

This indicates missing required configuration parameters:

```json
{
  "ok": false,
  "error": {
    "name": "LLMProviderInvalidConfigError", 
    "message": "apiKeySecretName is required"
  }
}
```

**Solution**: Check the provider-specific configuration requirements in the setup steps above and ensure all required fields are provided.

</details>

<details>
<summary>I don't have permission to manage LLM providers</summary>

```json
{
  "name": "llm_provider_manage_forbidden",
  "message": "You do not have permission to manage LLM providers"
}
```

**Solution**: Only organization administrators can manage LLM providers. Contact your admin to get the necessary permissions or ask them to configure the providers for you.

</details>

<details>
<summary>How can I debug provider configuration issues?</summary>

Here are useful debugging tips:

- **Check Logs**: Monitor AI invocation logs for detailed error messages
- **Validate Secrets**: Ensure API keys are stored correctly in Port's secrets system
- **Test Connection**: Use `validate_connection=true` parameter when creating providers
- **Verify Permissions**: Ensure your provider API keys have the required permissions
- **Check Quotas**: Monitor usage limits and billing status for external providers
- **Provider Status**: Check if your external provider service is experiencing outages

</details>

<details>
<summary>What should I do if a model isn't enabled for my provider?</summary>

```json
{
  "ok": false,
  "error": {
    "name": "LLMProviderModelNotEnabledError",
    "message": "Model 'gpt-5' is not enabled for provider 'openai'"
  }
}
```

**Solution**: This usually means the model needs to be enabled in your provider configuration. Contact your organization administrator to enable the specific model for your provider.

</details>

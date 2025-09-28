---
sidebar_position: 3
title: Selecting LLM Provider
---

# Selecting LLM Provider

:::info Closed Beta
Port's AI offerings are currently in closed beta and will be gradually rolled out to users by the end of 2025.
:::

When interacting with [Port AI](/ai-interfaces/port-ai/api-interaction) through the API, you can select which provider and model to use for specific requests. This gives you fine-grained control over AI processing on a per-request basis.

## Port AI Integration

LLM providers integrate seamlessly with Port AI. You can specify the provider and model when making API requests, overriding the organization's default settings for specific use cases.

### Port AI API with Custom Provider

Specify a custom provider and model when making Port AI API requests. See the [Selecting Model](/ai-interfaces/port-ai/api-interaction#selecting-model) section for detailed examples of how to include provider and model parameters in your requests.

## Default Provider Selection

If no provider is specified in your API request, the system uses default values:

1. **Organization Defaults**: If your organization has configured custom defaults
2. **System Defaults**: Port's fallback settings:
   - **Default Provider**: `port`
   - **Default Model**: `claude-sonnet-4-20250514`

## Provider Validation

When you specify a provider and model in your API request, the system validates that:

1. **Provider exists**: The specified provider is configured for your organization
2. **Provider is enabled**: The provider configuration is active
3. **Model is available**: The requested model is enabled for that provider
4. **Permissions**: You have access to use the specified provider

## Use Cases for Custom Provider Selection

- **Cost Optimization**: Choose different providers based on request complexity or your existing contracts
- **Compliance Requirements**: Use specific providers for sensitive data that must stay within certain infrastructure
- **Performance Optimization**: Select providers based on response time needs or model capabilities
- **Regional Requirements**: Use providers that meet data residency or regional compliance needs

## Frequently Asked Questions

<details>
<summary>What happens if I specify a provider that doesn't exist?</summary>

If you specify a provider that isn't configured for your organization, you'll receive an error:

```json
{
  "ok": false,
  "error": {
    "name": "LLMProviderNotFoundError",
    "message": "LLM provider 'openai' not found for organization"
  }
}
```

**Solution**: Make sure the provider is properly configured in your organization settings, or contact your admin.

</details>

<details>
<summary>Why am I getting a "Model not enabled" error?</summary>

This error occurs when the model isn't available for the specified provider:

```json
{
  "ok": false,
  "error": {
    "name": "LLMProviderModelNotEnabledError",
    "message": "Model 'gpt-5' is not enabled for provider 'anthropic'"
  }
}
```

**Solution**: Check which models are available for your provider, or contact your admin to enable the model.

</details>

<details>
<summary>What happens if I don't specify a provider in my request?</summary>

The system will automatically use your organization's default provider and model. If no organization defaults are set, it falls back to Port's system defaults (`port` provider with `claude-sonnet-4-20250514` model).

</details>

<details>
<summary>Can I use different providers for different types of requests?</summary>

Yes! You can specify different providers and models for each API request. This allows you to optimize for cost, performance, compliance, or other requirements on a per-request basis.

</details>

<details>
<summary>How do I know which providers and models are available to me?</summary>

Use the [Get configured LLM providers](/api-reference/get-configured-llm-providers) API to see all configured providers for your organization, or check with your organization administrator about available options.

</details>

<details>
<summary>Does specifying a custom provider affect streaming?</summary>

No, all responses are streamed by default regardless of which provider you specify. You can use any configured provider with streaming enabled.

</details>

<details>
<summary>Will my request fail if the specified provider is temporarily unavailable?</summary>

If a provider connection fails, the system will return an error with details about the issue. The system does not automatically fall back to other providers to ensure predictable behavior.

</details>

<details>
<summary>Can I use provider selection with Port AI API?</summary>

Yes! You can specify custom providers and models when making Port AI API requests. This allows you to choose the best model for specific tasks. Learn more about [Port AI API interactions](/ai-interfaces/port-ai/api-interaction).

</details>

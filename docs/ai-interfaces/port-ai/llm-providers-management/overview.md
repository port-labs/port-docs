---
sidebar_position: 1
title: Overview
---

# LLM Provider Management

import BetaFeatureNotice from '/docs/generalTemplates/_beta_feature_notice.md'

<BetaFeatureNotice id="ai-form" />

Manage and configure the Large Language Model (LLM) providers that power all AI interactions in Port. This feature gives you control over which AI models are used across Port AI Assistant, AI Agents, and other AI-powered features.

## LLM Approach Overview

Port offers two approaches for AI model usage:

### Port's Managed AI Infrastructure (Default)
Port provides state-of-the-art LLMs through our secured cloud infrastructure by default:
- **No data training**: We never train models on your data
- **Enterprise security**: Your data is processed securely and not stored
- **Automatic updates**: Always access to the latest model versions
- **Zero setup**: Works immediately with no configuration required

[Learn more about our data controls and security measures](/ai-interfaces/port-ai/security-and-data-controls).

### Bring Your Own LLM
For organizations requiring additional control, Port also supports configuring your own LLM providers:
- **Data privacy**: Keep AI processing within your own infrastructure
- **Compliance**: Meet specific regulatory or organizational requirements

## Supported LLMs and Providers

Port supports the following LLM providers and models:

- **OpenAI**: `gpt-5`
- **Anthropic**: `claude-sonnet-4-20250514`, `claude-haiku-4-5-20251001`
- **Azure OpenAI**: `gpt-5`
- **AWS Bedrock**: `claude-sonnet-4-20250514`, `claude-haiku-4-5-20251001`

Port AI leverages `gpt-5` and `claude-haiku-4-5-20251001` by default when no custom provider is configured.

## How This Affects Port AI Features

All [Port AI](/ai-interfaces/port-ai/overview) features rely on the configured default providers. When working directly with the API, you can even select which provider and model to use for specific requests.

## Frequently Asked Questions

<details>
<summary><b>What are the benefits of using Port's managed AI infrastructure? (Click to expand)</b></summary>

Port's managed AI infrastructure provides several advantages:

- **Zero setup**: Works immediately with no configuration required
- **Automatic updates**: Always access to the latest model versions
- **Enterprise security**: Your data is processed securely and not stored
- **No data training**: We never train models on your data
- **Reliable performance**: Optimized for Port's AI features

This is the recommended approach for most organizations as it provides the best balance of security, performance, and ease of use.

</details>

<details>
<summary><b>When should I consider bringing my own LLM provider? (Click to expand)</b></summary>

Consider bringing your own LLM provider when you need:

- **Enhanced data privacy**: Keep AI processing within your own infrastructure.
- **Compliance requirements**: Meet specific regulatory or organizational requirements.
- **Custom models**: Define custom configuration on models not available through Port's managed infrastructure.
- **Integration requirements**: Connect with existing AI infrastructure.

</details>

<details>
<summary><b>How does data handling differ between Port's managed infrastructure and bring your own LLM? (Click to expand)</b></summary>

**Port's Managed Infrastructure:**
- Data is processed within Port's secure cloud infrastructure.
- Your data is not used for model training.
- Complete logical separation between different customers' data.
- Data processing occurs within Port's controlled environment.

**Bring Your Own LLM:**
- Data is processed by your chosen LLM provider.
- You control where and how your data is processed.
- Must comply with your provider's data handling policies.
- Port still retain interaction data for operational purposes.

**Detailed Information:**
- [Data Processing by LLM Providers](/ai-interfaces/port-ai/security-and-data-controls#how-is-my-data-processed-by-llm-providers) - How your data is processed by AI models
- [Bring Your Own LLM Data Retention](/ai-interfaces/port-ai/security-and-data-controls#does-port-still-retain-ai-interaction-data-when-using-bring-your-own-llm) - Data handling with custom LLM providers
- [Data Privacy & Retention](/ai-interfaces/port-ai/security-and-data-controls#data-privacy--retention) - What data we store and why

</details>

<details>
<summary><b>What security controls apply when using my own LLM provider? (Click to expand)</b></summary>

When using your own LLM provider, you maintain the same security controls as Port's managed infrastructure:

- **RBAC compliance**: Port AI still respects your organization's access controls.
- **Data governance**: All interactions respect your configured data access policies.
- **Audit trail**: AI interactions are still logged and trackable.
- **Permission inheritance**: Port AI cannot access data you don't have permission to view.

**Additional considerations:**
- You're responsible for your LLM provider's security measures.
- Ensure your provider meets your compliance requirements.
- Monitor your provider's data handling practices.

**Detailed Information:**
- [Data Access & Permissions](/ai-interfaces/port-ai/security-and-data-controls#data-access--permissions) - How AI respects your organization's access controls.
- [Security and Permissions](/ai-interfaces/port-ai/security-and-data-controls#security-and-permissions) - How Port AI respects your security controls.
- [Compliance & Security Standards](/ai-interfaces/port-ai/security-and-data-controls#compliance--security-standards) - Integration with compliance requirements.

</details>

<details>
<summary><b>Can I opt out of data storage when using my own LLM provider? (Click to expand)</b></summary>

Yes, you can opt out of data storage even when using your own LLM provider. However, there are important considerations:

**What you can opt out of:**
- 30-day interaction data storage by Port.
- Port's operational data retention.

**Impact of opting out:**
- May impact Port's ability to provide support and troubleshoot issues.
- Could affect AI feature performance and reliability.

**Detailed Information:**
- [Opt-out Options](/ai-interfaces/port-ai/security-and-data-controls#can-i-opt-out-of-data-storage) - How to opt out of data storage
- [Bring Your Own LLM Data Retention](/ai-interfaces/port-ai/security-and-data-controls#does-port-still-retain-ai-interaction-data-when-using-bring-your-own-llm) - Data handling with custom LLM providers

</details>

<details>
<summary><b>How do I configure my own LLM providers? (Click to expand)</b></summary>

To configure your own LLM providers:

1. **Configure your providers** - Set up your preferred LLM providers using the [Create or connect an LLM provider](/api-reference/create-or-connect-an-llm-provider) API endpoint.
2. **Select defaults** - Once providers are configured, you can view and select default providers and models through the UI (**Builder** → **Organization Settings** → **AI** tab) or via the [Change default LLM provider and model](/api-reference/change-default-llm-provider-and-model) API.

:::info UI vs API
- **Viewing and selecting defaults**: Available in both UI and API.
- **Adding new custom providers**: Requires the API.
:::

This feature is designed for organizations with specific compliance, privacy, or integration requirements that cannot be met by Port's managed infrastructure.

</details>

<details>
<summary><b>What happens to my existing AI interactions when I switch LLM providers? (Click to expand)</b></summary>

When you switch LLM providers:

- **Existing AI invocations**: All previous interactions remain accessible and unchanged.
- **New interactions**: Will use your newly configured provider.
- **Data continuity**: No data is lost during the transition.
- **Performance**: Response times and capabilities may change based on your new provider.

**Important considerations:**
- Test your new provider configuration thoroughly.
- Monitor performance and adjust settings as needed.
- Ensure your new provider meets your security and compliance requirements.

</details>
---
sidebar_position: 1
title: Overview
---

# LLM Provider Management

:::info Closed Beta
Port's AI offerings are currently in closed beta and will be gradually rolled out to users by the end of 2025.
:::

:::warning Limited Availability
The ability to configure your own LLM providers has limited availability. Please reach out to the Port support team for additional information and access.
:::


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
- **Anthropic**: `claude-sonnet-4-20250514`
- **Azure OpenAI**: `gpt-5`
- **AWS Bedrock**: `claude-sonnet-4-20250514`

Port AI leverages `gpt-5` and `claude-sonnet-4-20250514` by default when no custom provider is configured.

## How This Affects Port AI Features

All [Port AI](/ai-interfaces/port-ai/overview) features rely on the configured default providers. When working directly with the API, you can even select which provider and model to use for specific requests.
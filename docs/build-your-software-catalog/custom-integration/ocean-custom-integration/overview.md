---
sidebar_position: 1
title: Overview
description: Understanding the Ocean custom integration
---

# Overview

This integration allows Port customers to connect to any custom API, internal system, or HTTP service without requiring custom development. Each integration instance connects to one API backend, and you can map multiple endpoints through standard Ocean resource configuration.


## When to use this integration?

This integration is ideal when:

- **No native Port integration exists** for your tool or service.
- You're working with **internal or custom-built APIs**.
- Your API follows **REST conventions** (JSON responses, HTTP methods).
- You want a **configuration-only solution** without custom code.


## Installation methods

The Ocean custom integration can be installed in two ways, depending on your requirements and infrastructure preferences:

- [Hosted by Port](/build-your-software-catalog/custom-integration/ocean-custom-integration/installation-types/hosted-by-port)
- [Self-hosted](/build-your-software-catalog/custom-integration/ocean-custom-integration/installation-types/self-hosted/setup)

### Hosted by Port

Port hosts and manages the integration infrastructure for you. This is the simplest option - you configure the connection settings through the Port UI, and Port handles the rest. The integration runs on Port's infrastructure with a customizable resync interval to keep your data up to date.

**Best for:** Quick setup, or when you prefer a managed solution.

### Self-hosted

You run the integration in your own infrastructure using Helm or Docker. This gives you full control over resources, configuration, and performance tuning. The integration runs continuously in your environment and can be customized to meet your specific needs.

**Best for:** High-scale environments with large datasets that require better control over resources and performance tuning.

## Next steps

**[Review the configuration guide](/build-your-software-catalog/custom-integration/ocean-custom-integration/configuration)** - Learn about prerequisites, resource mapping, and advanced configuration options that apply to both installation methods.


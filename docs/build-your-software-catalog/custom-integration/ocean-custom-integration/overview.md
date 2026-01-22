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

## Prerequisites

Before installing, gather this information about your API:

### 1. Authentication

How does your API verify requests?

- **Bearer Token:** OAuth2 tokens, personal access tokens (most modern APIs).
- **API Key:** Custom header like `X-API-Key` or `Authorization`.
- **Basic Auth:** Username and password (legacy systems).
- **Custom Authentication:** OAuth2, JWT, and other dynamic token-based flows (self-hosted only). See [custom authentication](/build-your-software-catalog/custom-integration/ocean-custom-integration/installation-types/self-hosted/custom-authentication) for details.
- **None:** Public APIs.

**Where to find it:** Check your API's documentation or settings page. Look for sections titled "API Keys," "Access Tokens," or "Authentication."

### 2. Endpoints

Which API endpoint returns the data you want to ingest?

**Example:** `/api/v1/users`, `/v2/projects`, `/tickets`

**How to find it:** Check your API documentation for available endpoints. Look for GET endpoints that return lists of resources.

### 3. Data structure

Where is the actual data in your API's response?

**Direct array:**

```json
[
  {"id": 1, "name": "Alice"},
  {"id": 2, "name": "Bob"}
]
```

**Nested data:**

```json
{
  "data": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ]
}
```

**Deeply nested:**

```json
{
  "response": {
    "users": {
      "items": [
        {"id": 1, "name": "Alice"}
      ]
    }
  }
}
```

You will use a [JQ](https://jqlang.org/manual/) `data_path` expression in your mapping to tell the integration where to find the array of items (e.g., `.data`, `.users.items`).


## Installation methods

The Ocean custom integration can be installed in two ways, depending on your requirements and infrastructure preferences:

- [Hosted by Port](/build-your-software-catalog/custom-integration/ocean-custom-integration/installation-types/hosted-by-port)
- [Self-hosted](/build-your-software-catalog/custom-integration/ocean-custom-integration/installation-types/self-hosted/setup)

### Hosted by Port

Port hosts and manages the integration infrastructure for you. This is the simplest option, you configure the connection settings through the Port UI, and Port handles the rest. The integration runs on Port's infrastructure with a customizable resync interval to keep your data up to date.

**Best for:** Quick setup, or when you prefer a managed solution.

### Self-hosted

You run the integration in your own infrastructure using Helm or Docker. This gives you full control over resources, configuration, and performance tuning. The integration runs continuously in your environment and can be customized to meet your specific needs.

**Best for:** High-scale environments with large datasets that require better control over resources and performance tuning.

## Next steps

**[Review the configuration guide](/build-your-software-catalog/custom-integration/ocean-custom-integration/configuration)** - Learn about prerequisites, resource mapping, and advanced configuration options that apply to both installation methods.


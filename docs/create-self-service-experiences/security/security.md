---
title: Security
---

# Security

This page includes additional configurations required to allow Port to interact with your [backend](../setup-backend/setup-backend.md) when using self-service actions.

## Port IP addresses for allow lists

When Port makes outbound calls (for example when using the [Webhook](../setup-backend/webhook/webhook.md) invocation method), the source IP addresses are static.

Port outbound calls will originate from one of the following IP addresses:

```text showLineNumbers
3.251.12.205
```

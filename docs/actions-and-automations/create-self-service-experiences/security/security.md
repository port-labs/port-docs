---
title: Security
---

# Security

This page includes additional configurations required to allow Port to interact with your [backend](/actions-and-automations/setup-backend/setup-backend.md) when using self-service actions.

## Port IP addresses for allow lists

When Port makes outbound calls (for example when using the [Webhook](/actions-and-automations/setup-backend/webhook/webhook.md) invocation method), the source IP addresses are static.

Port outbound calls will originate from one of the following IP addresses:

```text showLineNumbers
44.221.30.248, 44.193.148.179, 34.197.132.205, 3.251.12.205, 34.252.219.131, 54.75.236.107
```

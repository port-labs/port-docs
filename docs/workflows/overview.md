---
sidebar_position: 1
title: Overview
---

# Workflows (Beta)

:::warning Closed Beta Notice
This feature is currently in closed beta with limited availability. Workflows may undergo breaking changes and occasional downtime without prior notice. There is no SLA or guaranteed issue-resolution timeline during this period. Support is provided directly by the Workflows team.
:::

Workflows provide a visual, node-based way to build automations and self-service experiences in Port. Unlike traditional actions and automations, workflows allow you to chain multiple operations together, add conditional logic, and create complex automation flows with an intuitive graph-based interface.

Workflows can be triggered in two ways: manually by users for on-demand operations, or automatically in response to events in your software catalog.

## 1. Self-service workflows

Self-service workflows are triggered manually by users through Port's UI or API. Users provide inputs through a form, making these ideal for on-demand operations that require human input or decision-making. Self-service workflows drive developer productivity by providing controlled, repeatable ways to perform tasks with guardrails.

Common use cases include:
- Provisioning cloud resources.
- Scaffolding new microservices.
- Deploying services to environments.

For more information and instructions for creating self-service workflows, see [self-service trigger](/workflows/build-workflows/self-service-trigger/).

## 2. Event-driven workflows

Event-driven workflows run automatically in response to changes in your software catalog. Use events in your infrastructure as triggers to run custom automation flows. Event-driven workflows enforce policies, send notifications, or perform any logic you need without manual intervention. They free up your team to focus on other priorities by handling routine and repetitive tasks automatically.

Common use cases include:
- Auto-assigning teams to new entities.
- Triggering cleanup when resources are deleted.
- Sending notifications when critical services change status.

For more information and instructions for defining event-driven workflows, see [event trigger](/workflows/build-workflows/event-trigger).

For more information about workflow components and structure, see [concepts and structure](/workflows/concepts).

## When to use workflows

Use workflows when you need to:

- **Chain multiple operations together** - Execute a sequence of actions where each step depends on the previous one.
- **Add conditional logic** - Create different execution paths based on runtime data or entity properties.
- **Visualize complex flows** - See the entire automation logic in a visual graph for easier understanding and maintenance.
- **Combine self-service and automation** - Use the same action types for both manual and automated workflows.
- **Pass data between steps** - Reference outputs from previous nodes to build dynamic payloads and make decisions.

## Comparison with actions & automations

Workflows are the next evolution of Port's [Actions & Automations](/actions-and-automations/overview). While they share many concepts, there are some key differences:

| Feature | Actions & Automations | Workflows (Beta) |
| ------- | --------------------- | ---------------- |
| Multi-step view | No | Yes |
| Backend types | All supported | Webhook, Kafka, Upsert Entity, GitHub (more coming soon) |
| Secret user inputs | Yes | Not yet supported |
| Multi-steps user inputs form | Yes | Not yet supported |
| Run from specific entity | Yes | Not yet supported |
| Port Execution Agent | Yes | Not yet supported |
| Approval flows | Yes (only for self-service actions) | Not yet supported |
| Re-run from UI | Yes | Not yet supported |
| Port's GitHub Action support | Yes | Not yet supported |
| MCP tools | Yes | Not yet supported |
| Dynamic permissions | Yes | Not yet supported |
| Custom widget button text | Yes | Not yet supported |
| Terraform / Pulumi resources | Yes | Not yet supported |

## Next steps

- [Concepts and structure](/workflows/concepts) - Learn about workflow components and structure.
- [Quickstart and build with AI](/workflows/build-workflows/quickstart) - Get started building your first workflow.
- [Interact with runs](/workflows/runs) - Monitor and manage workflow executions.
- [Examples](/workflows/examples) - See real-world workflow examples.

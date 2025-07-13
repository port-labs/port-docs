---
sidebar_position: 2
title: Self-Service Actions
sidebar_label: ⚡️ Self-Service Actions
---

# ⚡️ Self-Service Actions

In Port, you can make your Software Catalog active by defining Self-Service Actions for your developers to perform, without assistance or dependency on DevOps teams.

Port enables developer Self-Service in 2 distinct ways:

- [Self-Service Actions](./self-service-actions-deep-dive/self-service-actions-deep-dive.md) - configure **Create** and **Delete** actions to provision and control the resource usage in your organization. Configure **Day-2 Operations** to keep your infrastructure up-to-date.

## Getting started

- To learn more about Self-Service Actions, their structure, and how to start configuring your Self-Service Actions, refer to the [deep dive](./self-service-actions-deep-dive/self-service-actions-deep-dive.md);
- To learn how to interact with action run objects, update the status of invoked Self-Service Actions and keep track of Entities created and modified by Self-Service Action runs, refer to the [Action Runs Tutorial](./self-service-actions-deep-dive/action-runs-tutorial.md).

## Architecture and technology-specific Self-Service Actions

The power of Port's self-service actions is enabled by using one of the following: [Webhooks](./webhook/webhook.md), [Kafka topics](./kafka/kafka.md) and [GitHub Workflow](./github-workflow/github-workflow.md). Go to each self-service action type's respective page to learn more and see practical examples.

:::note
In order to make use of Port's Kafka topics for Self-Service Actions, please contact us at [support.port.io](http://support.port.io/)
:::

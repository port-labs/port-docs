---
sidebar_position: 2
---

# Self-Service Actions

In Port, you can make your Software Catalog active by defining Self-Service Actions for your developers to perform, without assistance or dependency on DevOps teams.

Port enables developer Self-Service in 2 distinct ways:

- [Self-Service Actions](./self-service-actions-deep-dive.md) - configure **Create** and **Delete** actions to provision and control the resource usage in your organization. Configure **Day-2 Operations** to keep your infrastructure up-to-date.
- [Real-time Changelog](./kafka/examples/changelog-basic-change-listener-using-aws-lambda.md) - every change that occurs in Port generates a new audit log entry.

## Getting started

- To learn more about Self-Service Actions, their structure, and how to start configuring your Self-Service Actions, refer to the [deep dive](./self-service-actions-deep-dive.md);
- To learn how to interact with action run objects, update the status of invoked Self-Service Actions and keep track of Entities created and modified by Self-Service Action runs, refer to the [Action Runs Tutorial](./action-runs-tutorial.md).

## Architecture and technology-specific Self-Service Actions

The power of Port's Self-Service Actions is enabled either by using [Webhooks](./webhook/webhook.md) or by using [Kafka topics](./kafka/kafka.md), go to each Self-Service Action type's respective page to learn more and see practical examples.

:::note
In order to make use of Port's Kafka topics for Self-Service Actions, please contact us at support@getport.io
:::

---
sidebar_position: 2
---

# Self-Service Actions

In Port, you can make your Software Catalog active by defining Self-Service Actions for your developers to perform, without assistance or dependency on DevOps teams.

Port enables developer Self-Service in 2 distinct ways:

- [Self-Service Actions](./setting-self-service-actions-in-port) - configure **Create** and **Delete** actions to provision and control the resource usage in your organization. Configure **Day-2 Operations** to keep your infrastructure up-to-date.
- [Real-time Changelog](../tutorials/self-service-actions/kafka-actions/changelog-basic-change-listener-using-aws-lambda.md) - every change that occurs in Port generates a new audit log entry.

The power of Port's Self-Service Actions is enabled either by using [Webhooks](./port-execution-architecture/port-execution-webhook.md) or by using [Kafka topics](./port-execution-architecture/port-execution-kafka.md).

:::note
In order to make use of Port's Kafka topics for Self-Service Actions, please contact us at support@getport.io
:::

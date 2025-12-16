---
sidebar_position: 1
---

# Port execution agent

Port's [execution agent](https://github.com/port-labs/port-agent) provides you with a secure and convenient way to listen and act on invocations of self-service actions and changes in the software catalog.

By using the execution agent, you don't need to expose a public endpoint for Port to contact.

:::info Kafka Topic required
To use the execution agent, you need to have a dedicated Kafka topic.  
Contact [Port's support team](http://support.port.io/) to receive one.
:::

The data flow when using the Port execution agent is as follows:

- A new self-service action or change in the software catalog is invoked.
- Port sends the invocation event to your dedicated Kafka topic.
- The execution agent pulls the new invocation event from your Kafka topic, and sends it to the URL you specified.

<img src="/img/self-service-actions/portExecutionAgentArchitecture.svg" width="80%" border='1px' />

## Next steps

- [Explore How to install and use the agent](/actions-and-automations/setup-backend/webhook/port-execution-agent/installation-methods/helm.md)
- [Control the payload sent to your endpoint](/actions-and-automations/setup-backend/webhook/port-execution-agent/control-the-payload.md)

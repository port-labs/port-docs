---
sidebar_position: 1
---

# Port execution agent

Our execution agent provides you with a secure and convenient way to listen and act on invocations of Self-Service Actions and changes in the software catalog.

By using the execution agent, you don't need to expose a public endpoint for Port to contact.

:::tip Public repository
Our Port agent is open source - see it [**here**](https://github.com/port-labs/port-agent)
:::

:::note
To use the execution agent, please contact us via Intercom to receive a dedicated Kafka topic.
:::

The data flow when using the Port execution agent is as follows:

- A new Self-Service Action or change in the software catalog is invoked;
- Port sends the invocation event to your dedicated Kafka topic;
- The execution agent pulls the new invocation event from your Kafka topic, and sends it to the URL you specified.

![Port Agent Architecture](/img/self-service-actions/portExecutionAgentArchitecture.png)

## Next steps

- [Explore How to install and use the agent](/create-self-service-experiences/setup-backend/webhook/port-execution-agent/installation-methods/helm.md)
- [Control the payload sent to your endpoint](/create-self-service-experiences/setup-backend/webhook/port-execution-agent/control-the-payload.md)

---
sidebar_position: 1
---

# Port Execution Agent

Our execution agent provides you a secure and convenient way to listen and act on invocations of Self-Service Actions and changes in the Software Catalog.

By using the execution agent, you don't need to expose a public endpoint for Port to contact.

The data flow when using the Port execution agent is:

- A new Self-Service Action or Change in the Software Catalog is invoked;
- Port sends the invocation event to your dedicated Kafka topic;
- The execution agent pulls the new invocation event from your Kafka topic, and sends it to a URL inside your private network.

![Port Agent Architecture](../../../../static/img/platform-overview/self-service-actions/portAgentArchitecture.png)

## Next Steps

[Explore How to install and use the agent](./quickstart)

---
sidebar_position: 2
---

# Usage

When using the execution agent, in the `url` field you need to provide a URL to a service (for example, a REST API) that will accept the invocation event.

- The service can be a private service running inside your private network;
- Or, it can be a public accessible service from the public internet (**note** in this scenario, the execution agent needs corresponding outbound network rules that will allow it to contact the public service).

:::note
**IMPORTANT**: To make use of the **Port execution agent**, you need to configure:

<!-- TODO: add back the URLs here for changelog destination -->

- [Self-Service Action invocation method](/create-self-service-experiences/self-service-actions-deep-dive/self-service-actions-deep-dive.md#invocation-method-structure-fields) / Change Log destination `type` field value should be equal to `WEBHOOK`.
- [Self-Service Action invocation method](/create-self-service-experiences/self-service-actions-deep-dive/self-service-actions-deep-dive.md#invocation-method-structure-fields) / Change Log `agent` field value should be equal to `true`.

For example:

```json showLineNumbers
{ "type": "WEBHOOK", "agent": true, "url": "URL_TO_API_INSIDE_YOUR_NETWORK" }
```

:::

Well Done! **Port Agent** is now running in your environment and will trigger any webhook that you've configured (for self-service actions, or changes in the software catalog).

When a new invocation is detected, the agent will pull it from your Kafka topic and forward it to the internal API in your private network.

![Port Execution Agent Logs](/img/self-service-actions/port-execution-agent/portAgentLogs.png)


## Next Steps

Follow one of the guides below:

- [Self-Service Actions Deep Dive](/create-self-service-experiences/self-service-actions-deep-dive/self-service-actions-deep-dive.md) - Set up a blueprint and self-service actions.
- [Changelog Listener](/create-self-service-experiences/setup-backend/webhook/examples/changelog-listener.md) - Create a blueprint with `changelogDestination` to listen and act on changes in the software catalog.
- [GitLab Pipeline Trigger](/create-self-service-experiences/setup-backend/gitlab-pipeline/gitlab-pipeline.md) - Create an action that triggers GitLab Pipeline execution.

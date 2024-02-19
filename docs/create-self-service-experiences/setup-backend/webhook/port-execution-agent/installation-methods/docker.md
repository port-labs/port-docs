---
sidebar_position: 3
---

# Docker

This page we will walk through the installation of the Port execution agent using docker.

## Installation

:::note
Remember to replace the placeholders for `<PORT_CLIENT_ID>`, `<PORT_CLIENT_SECRET>`, `<PORT_ORG_ID>` and `<INSTALLATION_NAME>`.
:::

```bash showLineNumbers
docker run \
  -e PORT_CLIENT_ID=<PORT_CLIENT_ID> \
  -e PORT_CLIENT_SECRET=<PORT_CLIENT_SECRET> \
  -e PORT_ORG_ID=<PORT_ORG_ID> \
  -e KAFKA_CONSUMER_GROUP_ID=<PORT_ORG_ID>-<INSTALLATION_NAME> \
  -e STREAMER_NAME=KAFKA \
  -e KAFKA_CONSUMER_BROKERS="b-1-public.publicclusterprod.t9rw6w.c1.kafka.eu-west-1.amazonaws.com:9196,b-2-public.publicclusterprod.t9rw6w.c1.kafka.eu-west-1.amazonaws.com:9196,b-3-public.publicclusterprod.t9rw6w.c1.kafka.eu-west-1.amazonaws.com:9196" \
  -e KAFKA_CONSUMER_SECURITY_PROTOCOL=SASL_SSL \
  -e KAFKA_CONSUMER_AUTHENTICATION_MECHANISM=SCRAM-SHA-512 \
  -e KAFKA_CONSUMER_AUTO_OFFSET_RESET=largest \
  ghcr.io/port-labs/port-agent:latest
```

## Next Steps

- Refer to the [usage guide](/create-self-service-experiences/setup-backend/webhook/port-execution-agent/usage.md) to set up a webhook.
- Customize the [payload mapping](/create-self-service-experiences/setup-backend/webhook/port-execution-agent/control-the-payload.md?installationMethod=docker) to control the payload sent to the target.
---
sidebar_position: 2
---

# Usage

To make use of the **Port execution agent**, you need to configure:

<!-- TODO: add back the URLs here for changelog destination -->

- [Self-Service Action invocation method](/actions-and-automations/setup-backend/#invocation-method-structure-fields) / Change Log destination `type` field value should be equal to `WEBHOOK`.
- [Self-Service Action invocation method](/actions-and-automations/setup-backend/#invocation-method-structure-fields) / Change Log `agent` field value should be equal to `true`.

For example:

```json showLineNumbers
{ "type": "WEBHOOK", "agent": true, "url": "URL_TO_API_INSIDE_YOUR_NETWORK" }
```

When using the execution agent, in the `url` field you need to provide a URL to a service (for example, a REST API) that will accept the invocation event.

- The service can be a private service running inside your private network;
- Or, it can be a public accessible service from the public internet (**note** in this scenario, the execution agent needs corresponding outbound network rules that will allow it to contact the public service).

Once configured, the Port Agent will run in your environment and trigger webhooks for self-service actions or software catalog changes.

![Port Execution Agent Logs](/img/self-service-actions/port-execution-agent/portAgentLogs.png)

:::info Advanced configuration
For a complete list of all available configuration parameters and their descriptions, see the [Port Agent Helm chart README](https://github.com/port-labs/helm-charts/tree/main/charts/port-agent).
:::

## Streamer types

The Port Agent supports two streamer mechanisms for receiving and processing action runs:

### Kafka streamer (default)

The default and recommended streamer mechanism that uses Kafka for real-time event streaming.

**When to use:**
- Where higher latency is acceptable

Install the agent with Kafka streamer:
```bash showLineNumbers
helm upgrade --install my-port-agent port-labs/port-agent \
    --create-namespace --namespace port-agent \
    --set env.normal.PORT_ORG_ID="YOUR_ORG_ID" \
    --set env.normal.STREAMER_NAME=KAFKA \
    --set env.normal.KAFKA_CONSUMER_GROUP_ID="YOUR_CONSUMER_GROUP_ID" \
    --set env.secret.PORT_CLIENT_ID="YOUR_CLIENT_ID" \
    --set env.secret.PORT_CLIENT_SECRET="YOUR_CLIENT_SECRET"
```

### POLLING streamer

An alternative streamer mechanism that polls the Port API via HTTP to retrieve pending action runs.

**When to use:**
- When Kafka connectivity is restricted or unavailable in your environment
- For simpler network configurations requiring only HTTP access
- Where higher latency is acceptable

**Considerations:**
- **Polling-based:** Not suitable for time-sensitive operations requiring immediate execution

**Configuration:**

For the Helm installation, set:

```bash showLineNumbers
--set env.normal.STREAMER_NAME=POLLING
```

Note: POLLING streamer does not require `KAFKA_CONSUMER_GROUP_ID`.

## When to use POLLING vs Kafka

### Comparison

| Aspect | POLLING | Kafka |
|--------|---------|-------|
| Horizontal scaling | ✅ Unlimited pods | ❌ Limited by partition count |
| Latency | Polling-based | Real-time |
| Dynamic scaling | ✅ Add/remove pods instantly | ❌ Requires support ticket to add partitions |

## Self-signed certificate configuration

For self-hosted 3rd-party applications with self-signed certificates, the agent can be configured to trust custom CA certificates. The `selfSignedCertificate` parameters control this behavior.

### Option 1: Provide certificate in Helm values

Use this option to provide the certificate content directly in your Helm values file or via the `--set-file` flag.

**How to use:**
1. Set `selfSignedCertificate.enabled` to `true`
2. Provide the certificate content in `selfSignedCertificate.certificate`
3. Keep `selfSignedCertificate.secret.useExistingSecret` as `false` (default)

**Method A: Inline certificate in values.yaml**

Configure in your `values.yaml`:
```yaml showLineNumbers
selfSignedCertificate:
  enabled: true
  certificate: |
    -----BEGIN CERTIFICATE-----
    <YOUR_CERTIFICATE_CONTENT>
    -----END CERTIFICATE-----
  secret:
    name: ""
    key: crt
    useExistingSecret: false
```

Install with:
```bash showLineNumbers
helm install my-port-agent port-labs/port-agent \
   --create-namespace --namespace port-agent \
   -f values.yaml
```

**Method B: Reference certificate file using `--set-file`**

Configure in your `custom_values.yaml`:
```yaml showLineNumbers
selfSignedCertificate:
  enabled: true
  certificate: ""
  secret:
    name: ""
    key: crt
    useExistingSecret: false
```

Install with:
```bash showLineNumbers
helm install my-port-agent port-labs/port-agent \
   --create-namespace --namespace port-agent \
   -f custom_values.yaml \
   --set selfSignedCertificate.enabled=true \
   --set-file selfSignedCertificate.certificate=/PATH/TO/CERTIFICATE.crt
```

### Option 2: Use existing Kubernetes secret

Use this option to reference a pre-existing Kubernetes secret that you manage separately. The secret must contain the certificate data.

**How to use:**
1. Set `selfSignedCertificate.enabled` to `true`.
2. Set `selfSignedCertificate.secret.useExistingSecret` to `true`.
3. Specify the secret name in `selfSignedCertificate.secret.name`.
4. Specify the key within the secret in `selfSignedCertificate.secret.key` (defaults to `crt`).
5. Leave `selfSignedCertificate.certificate` empty.

**Complete configuration:**
```yaml showLineNumbers
selfSignedCertificate:
  enabled: true
  certificate: ""
  secret:
    name: my-ca-cert
    key: ca.crt
    useExistingSecret: true
```

### Automatic configuration

When `selfSignedCertificate.enabled` is set to `true`, the Helm chart automatically:
- Mounts the certificate to `/usr/local/share/ca-certificates/cert.crt`
- Sets `SSL_CERT_FILE` and `REQUESTS_CA_BUNDLE` environment variables to point to the certificate

### Multiple certificates

For environments requiring multiple custom certificates, use the `extraVolumes` and `extraVolumeMounts` parameters alongside the built-in `selfSignedCertificate` feature. One certificate must be provided via `selfSignedCertificate`, and additional certificates can be mounted as extra volumes.

**Configuration:**
```yaml showLineNumbers
selfSignedCertificate:
  enabled: true
  secret:
    name: primary-cert
    key: ca.crt
    useExistingSecret: true

extraVolumes:
  - name: additional-certs
    secret:
      secretName: secondary-certs
extraVolumeMounts:
  - name: additional-certs
    mountPath: /usr/local/share/ca-certificates/cert2.crt
    subPath: cert2.crt
    readOnly: true
```

:::info Certificate requirements
- Each certificate must be provided in PEM format as a separate file
- Certificates must be mounted to `/usr/local/share/ca-certificates/` with a `.crt` file extension
:::

## Overriding configurations

You can override default values using the `--set` flag during agent installation/upgrade:

```bash showLineNumbers
helm upgrade --install my-port-agent port-labs/port-agent \
    --create-namespace --namespace port-agent \
    --set env.normal.PORT_ORG_ID="YOUR_ORG_ID" \
    --set env.normal.KAFKA_CONSUMER_GROUP_ID="YOUR_CONSUMER_GROUP_ID" \
    --set env.secret.PORT_CLIENT_ID="YOUR_CLIENT_ID" \
    --set env.secret.PORT_CLIENT_SECRET="YOUR_CLIENT_SECRET" \
    --set secret.useExistingSecret=false \
    --set replicaCount=2 \
    --set resources.limits.memory="512Mi"
```

## Extra environment variables

To pass extra environment variables to the agent's runtime, you can use the `env.normal` section for non-sensitive variables.

Using Helm's `--set` flag:
```bash showLineNumbers
helm upgrade --install my-port-agent port-labs/port-agent \
  # Standard installation flags
  # ...
  --set env.normal.HTTP_PROXY=http://my-proxy.com:1111 \
  --set env.normal.HTTPS_PROXY=http://my-proxy.com:2222
```

Using the `values.yaml` file:
```yaml showLineNumbers
# The rest of the configuration
# ...
env:
  normal:
    HTTP_PROXY: "http://my-proxy.com:1111"
    HTTPS_PROXY: "http://my-proxy.com:2222"
    NO_PROXY: "127.0.0.1,localhost"
```

### Proxy configuration

#### `HTTP_PROXY`, `HTTPS_PROXY` & `ALL_PROXY`
`HTTP_PROXY`, `HTTPS_PROXY`, and `ALL_PROXY` are environment variables used to specify a proxy server for handling HTTP, HTTPS, or all types of requests, respectively. The values assigned to these settings should be the URL of the proxy server.

For example:
```sh showLineNumbers
HTTP_PROXY=http://my-proxy.com:1111
HTTPS_PROXY=http://my-proxy.com:2222
ALL_PROXY=http://my-proxy.com:3333
```

#### `NO_PROXY`

`NO_PROXY` allows blacklisting certain addresses from being handled through a proxy. This variable accepts a comma-separated list of hostnames or URLs.

For example:
```sh showLineNumbers
NO_PROXY=http://127.0.0.1,google.com
```

For more information, see the Requests [proxy configuration documentation](https://requests.readthedocs.io/en/latest/user/advanced/#proxies).

## Next Steps

Follow one of the guides below:

- [GitLab Pipeline Trigger](/actions-and-automations/setup-backend/gitlab-pipeline/gitlab-pipeline.md) - Create an action that triggers GitLab Pipeline execution.

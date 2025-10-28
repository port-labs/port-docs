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

- [Self-Service Action invocation method](/actions-and-automations/setup-backend/#invocation-method-structure-fields) / Change Log destination `type` field value should be equal to `WEBHOOK`.
- [Self-Service Action invocation method](/actions-and-automations/setup-backend/#invocation-method-structure-fields) / Change Log `agent` field value should be equal to `true`.

For example:

```json showLineNumbers
{ "type": "WEBHOOK", "agent": true, "url": "URL_TO_API_INSIDE_YOUR_NETWORK" }
```
:::

Well Done! **Port Agent** is now running in your environment and will trigger any webhook that you've configured (for self-service actions, or changes in the software catalog).

When a new invocation is detected, the agent will pull it from your Kafka topic and forward it to the internal API in your private network.

![Port Execution Agent Logs](/img/self-service-actions/port-execution-agent/portAgentLogs.png)

## Configuration

The following table lists the configuration parameters of the `port-agent` chart and default values.

| Parameter                                            | Description                                                                                | Default                                    |
|------------------------------------------------------|--------------------------------------------------------------------------------------------|--------------------------------------------|
| `image.repository`                                   | Image repository                                                                           | `ghcr.io/port-labs/port-agent`             |
| `image.pullPolicy`                                   | Image pull policy                                                                          | `IfNotPresent`                             |
| `image.tag`                                          | Image tag                                                                                  | `""`                                       |
| `replicaCount`                                       | Number of port-agent replicas                                                              | `1`                                        |
| `imagePullSecrets`                                   | Image pull secrets                                                                         | `[]`                                       |
| `nameOverride`                                       | Chart name override                                                                        | `""`                                       |
| `fullnameOverride`                                   | Fully qualified app name override                                                          | `""`                                       |
| `secret.annotations`                                 | Annotations for Secret object                                                              | `{}`                                       |
| `secret.name`                                        | Secret object name                                                                         | `""`                                       |
| `secret.useExistingSecret`                           | Enable this if you wish to create your own secret with credentials                         | `false`                                    |
| `podServiceAccount.name`                             | Service account to attach to the pod                                                       | `null`                                     |
| `env.normal.STREAMER_NAME`                           | Streamer name, available: [`KAFKA`]                                                        | `"KafkaToWebhookStreamer"`                 |
| `env.normal.PORT_ORG_ID`                             | Your Port org id - **Required**                                                            | `""`                                       |
| `env.normal.PORT_API_BASE_URL`                       | Port API base url                                                                          | `"https://api.getport.io"`                 |
| `env.normal.KAFKA_CONSUMER_GROUP_ID`                 | Kafka consumer group id - **Required if using any Kafka streamer**                         | `""`                                       |
| `env.normal.KAFKA_CONSUMER_SECURITY_PROTOCOL`        | Kafka consumer security protocol                                                           | `"SASL_SSL"`                               |
| `env.normal.KAFKA_CONSUMER_AUTHENTICATION_MECHANISM` | Kafka consumer authentication mechanism                                                    | `"SCRAM-SHA-512"`                          |
| `env.normal.KAFKA_CONSUMER_AUTO_OFFSET_RESET`        | Kafka consumer auto offset reset                                                           | `"largest"`                                |
| `env.secret.PORT_CLIENT_ID`                          | Port API client id                                                                         | `""`                                       |
| `env.secret.PORT_CLIENT_SECRET`                      | Port API client secret                                                                     | `""`                                       |
| `controlThePayloadConfig`                            | Override the default control the payload configuration file with custom json configuration | `""`                                       |
| `podAnnotations`                                     | Annotations to be added to the pod                                                         | `{}`                                       |
| `podSecurityContext`                                 | Security context applied to the pod                                                        | `{}`                                       |
| `containerSecurityContext`                           | Security context applied to the container                                                  | `{}`                                       |
| `extraVolumes`                                       | Additional volumes to be added to the pod                                                  | `[]`                                       |
| `extraVolumeMounts`                                  | Additional volume mounts to be added to the container                                      | `[]`                                       |
| `resources`                                          | Container resource requests & limits                                                       | `{}`                                       |
| `nodeSelector`                                       | NodeSelector applied to the pod                                                            | `{}`                                       |
| `tolerations`                                        | Tolerations applied to the pod                                                             | `[]`                                       |
| `affinity`                                           | Affinity applied to the pod                                                                | `{}`                                       |
| `selfSignedCertificate.enabled`                      | Enable self-signed certificate trust for the agent                                         | `false`                                    |
| `selfSignedCertificate.certificate`                  | The value of the self-signed certificate                                                   | `""`                                       |
| `selfSignedCertificate.secret.useExistingSecret`     | Enable this if you wish to use your own secret with the self-signed certificate            | `false`                                    |
| `selfSignedCertificate.secret.key`                   | The key in the existing self-signed certificate secret                                     | `crt`                                      |
| `selfSignedCertificate.secret.name`                  | The name of an existing secret containing the self-signed certificate                      | `""`                                       |

:::note
Ensure your Kafka topic has enough partitions when increasing `replicaCount` beyond 1. Each replica acts as a consumer in the consumer group.
:::

## Self-signed certificate configuration

For self-hosted 3rd-party applications with self-signed certificates, the agent can be configured to trust custom CA certificates. The `selfSignedCertificate` parameters control this behavior.

### Option 1: Provide certificate in Helm values

Use this option to provide the certificate content directly in your Helm values file or via the `--set-file` flag. The Helm chart will create and manage a Kubernetes secret containing the certificate.

**How to use:**
1. Set `selfSignedCertificate.enabled` to `true`
2. Provide the certificate content in `selfSignedCertificate.certificate`
3. Keep `selfSignedCertificate.secret.useExistingSecret` as `false` (default)

**Method A: Inline certificate in values.yaml**

Configure in your `values.yaml`:
```yaml
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
```bash
helm install my-port-agent port-labs/port-agent \
   --create-namespace --namespace port-agent \
   -f values.yaml
```

**Method B: Reference certificate file using `--set-file`**

Configure in your `custom_values.yaml`:
```yaml
selfSignedCertificate:
  enabled: true
  certificate: ""
  secret:
    name: ""
    key: crt
    useExistingSecret: false
```

Install with:
```bash
helm install my-port-agent port-labs/port-agent \
   --create-namespace --namespace port-agent \
   -f custom_values.yaml \
   --set selfSignedCertificate.enabled=true \
   --set-file selfSignedCertificate.certificate=/PATH/TO/CERTIFICATE.crt
```

### Option 2: Use existing Kubernetes secret

Use this option to reference a pre-existing Kubernetes secret that you manage separately. The secret must contain the certificate data.

**How to use:**
1. Set `selfSignedCertificate.enabled` to `true`
2. Set `selfSignedCertificate.secret.useExistingSecret` to `true`
3. Specify the secret name in `selfSignedCertificate.secret.name`
4. Specify the key within the secret in `selfSignedCertificate.secret.key` (defaults to `crt`)
5. Leave `selfSignedCertificate.certificate` empty

**Complete configuration:**
```yaml
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
```yaml
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

When installing the Port Agent, you can override default values in the `helm upgrade` command:

By using the `--set` flag, you can override specific agent configuration parameters during agent installation/upgrade:

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

## All configuration parameters

- A complete list of configuration parameters is available in the [Port Agent Helm chart repository](https://github.com/port-labs/helm-charts/tree/main/charts/port-agent);
- An example `values.yaml` file with all available parameters is available [here](https://github.com/port-labs/helm-charts/blob/main/charts/port-agent/values.yaml).

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

---
sidebar_position: 2
---

# Configuration

## How to configure the Kubernetes exporter?

When installing the K8s exporter, you can override values in the `helm install` command, either with the `--set` flag to specify values directly, or the `--set-file` flag to set individual values from a file:

```bash showLineNumbers
helm install my-port-k8s-exporter port-labs/port-k8s-exporter \
    --create-namespace --namespace port-k8s-exporter \
    --set secret.secrets.portClientId=CLIENT_ID --set secret.secrets.portClientSecret=CLIENT_SECRET \
    --set-file configMap.config=config.yaml
```

Alternatively, you can use a YAML file that specifies the values while installing the chart. For example:

```bash showLineNumbers
helm install my-port-k8s-exporter port-labs/port-k8s-exporter \
   --create-namespace --namespace port-k8s-exporter \
   -f custom_values.yaml
```

### Required configuration

| Parameter                         | Description                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `secret.secrets.portClientId`     | Port Client ID                                                              |
| `secret.secrets.portClientSecret` | Port Client Secret                                                              |
| `configMap.config`                | Port K8s Exporter `config.yaml`. Look at [Quickstart](./quickstart) for example |

### Advanced Configuration

| Parameter        | Description                                                                                                           | Default                | Use-Cases                                                                                                                                                                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resyncInterval` | The interval in minutes to send a repeated sync event for all known existing objects (regardless of new cluster events). | `0` (re-sync disabled) | Re-sync every X minutes. For example, your Entity might have a related target Entity that does not exist yet at the time of a sync event. The sync will fail, but later when the target Entity is available, the Entity creation will succeed (re-sync occurs continually every X minutes). |

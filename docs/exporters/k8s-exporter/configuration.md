---
sidebar_position: 2
---

# Configuration

## How to configure the Kubernetes Exporter?

When installing the K8s exporter, you can override values in the `helm install` command, either with the `--set` flag to specify values directly, or the `--set-file` flag to set individual values from a file:

```showLineNumbers
helm install my-port-k8s-exporter port-labs/port-k8s-exporter \
    --create-namespace --namespace port-k8s-exporter \
    --set secret.secrets.portClientId=CLIENT_ID --set secret.secrets.portClientSecret=CLIENT_SECRET \
    --set-file configMap.config=config.yaml
```

Alternatively, you can use a YAML file that specifies the values while installing the chart. For example:

```showLineNumbers
helm install my-port-k8s-exporter port-labs/port-k8s-exporter \
   --create-namespace --namespace port-k8s-exporter \
   -f custom_values.yaml
```

### Required Configuration

| Parameter                         | Description                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `secret.secrets.portClientId`     | Port Client ID.                                                                  |
| `secret.secrets.portClientSecret` | Port Client Secret.                                                              |
| `configMap.config`                | Port K8s Exporter `config.yaml`. Look at [Quickstart](./quickstart) for example. |

### Advanced Configuration

| Parameter        | Description                                                                | Default                | Use-Cases                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `resyncInterval` | The interval in minutes before sending a sync event for all known objects. | `0` (re-sync disabled) | Reconciliation every X minutes. For example, if your Entity has a related target Entity that still does not exists, it will try again later. |

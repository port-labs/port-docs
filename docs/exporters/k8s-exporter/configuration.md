---
sidebar_position: 2
---

# Configuration

## How to configure the Kubernetes Exporter?

You can override values in `helm install` command, with either the `--set` flag or the `--set-file` flag to set individual values from a file:

    helm install my-port-k8s-exporter port-labs/port-k8s-exporter \
        --create-namespace --namespace port-k8s-exporter \
        --set secret.secrets.portClientId=CLIENT_ID --set secret.secrets.portClientSecret=CLIENT_SECRET \
        --set-file configMap.config=config.yaml

Alternatively, you can use a YAML file that specifies the values while installing the chart. For example:

    helm install my-port-k8s-exporter port-labs/port-k8s-exporter \
       --create-namespace --namespace port-k8s-exporter \
       -f custom_values.yaml

### Required Configuration

| Parameter                             | Description                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| **`secret.secrets.portClientId`**     | Port Client ID.                                                                  |
| **`secret.secrets.portClientSecret`** | Port Client Secret.                                                              |
| **`configMap.config`**                | Port K8s Exporter `config.yaml`. Look at [Quickstart](./quickstart) for example. |

### Advanced Configuration

| Parameter        | Description                                                                | Default                | Use-Cases                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `resyncInterval` | The interval in minutes before sending a sync event for all known objects. | `0` (re-sync disabled) | Reconciliation every X minutes. For example, if your entity has a related target entity that still does not exists, it will try again later. |

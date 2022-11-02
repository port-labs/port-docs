---
sidebar_position: 3
---

# Kubernetes Exporter

Our integration with Kubernetes allows you to export Kubernetes objects to Port as Entities of existing Blueprints.

Here you'll find a step-by-step guide to installing the K8s Exporter in your Kubernetes Cluster.

## What does our Kubernetes Exporter offer you?

- List and export existing Kubernetes objects in your cluster.
- Watch live for changes (Create/Update/Delete) of Kubernetes objects and automatically apply the changes to your Entities in Port.
- Configure which Kubernetes objects are relevant, and how to map and transform objects to Port Entities.

## Installation using Helm Chart

:::info
The helm chart with full installation & usage guide can be found [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-k8s-exporter).
:::

:::note Prerequisites

[Helm](https://helm.sh) must be installed to use the chart. Please refer to
Helm's [documentation](https://helm.sh/docs) to get started.
:::

1. Add Port's Helm repo by using the following command:

```
helm repo add port-labs https://port-labs.github.io/helm-charts
```

If you already added this repo earlier, run `helm repo update` to retrieve
the latest versions of the charts. You can then run `helm search repo port-labs` to see the charts.

2. Prepare the exporter `config.yaml` configuration file. Look [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-k8s-exporter#exporter) for instructions and examples.

:::note

For this section, you will need to have the `PORT_CLIENT_ID` and `PORT_CLIENT_SECRET`

To find your Port API credentials go to [Port](https://app.getport.io), click on `Credentials` at the bottom left corner and you will be able to view and copy your `Client ID` and `Client Secret`:
:::

3. After configuring the `config.yml` file from the previous step. Install the `Kubernetes Exporter` chart by using the following command:

```
helm install my-port-k8s-exporter port-labs/port-k8s-exporter \
    --create-namespace --namespace port-k8s-exporter \
    --set secret.secrets.portClientId=PORT_CLIENT_ID --set secret.secrets.portClientSecret=PORT_CLIENT_SECRET \
    --set-file configMap.config=config.yaml
```

Done! the exporter will begin creating and updating objects from your Kubernetes cluster as Port Entities shortly.

![Developer Portal Kubernetes Exporter Audit Log](../../static/img/integrations/k8s-exporter/AuditLog.png)

---
sidebar_position: 1
---
import FindCredentials from "../../api/\_template_docs/\_find_credentials_collapsed.mdx";
import ExporterBaseInstallCommand from "../\_exporter_base_install_command.mdx";


# Helm

This page will walk you through the installation of the Port Kubernetes Exporter in your Kubernetes cluster using Helm.

:::info
You can observe the helm chart and the available parameters [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-k8s-exporter).
:::

## Prerequisites

- [Helm](https://helm.sh) must be installed to use the chart. Please refer to the Helm [documentation](https://helm.sh/docs/intro/install/) for further details about the installation.
- You will need your [Port credentials](/build-your-software-catalog/sync-data-to-catalog/api/api.md#find-your-port-credentials) to install the Kubernetes exporter.

:::tip
<FindCredentials />
:::

## Installation

1. Add Port's Helm repo by using the following command:

```bash
helm repo add port-labs https://port-labs.github.io/helm-charts
helm repo update
```

You can then run `helm search repo port-labs` to see the charts.

2. Prepare a [`config.yml`](/build-your-software-catalog/sync-data-to-catalog/kubernetes/#exporter-configyml-file) file that will define which Kubernetes objects to ingest to Port.

3. Install the exporter service on your Kubernetes cluster by running the following command:

   <ExporterBaseInstallCommand />

Done! the exporter will begin creating and updating objects from your Kubernetes cluster as Port entities shortly.

### Updating exporter configuration

In order to **update** the `config.yml` file deployed on your Kubernetes cluster, make your changes to the file and save it locally, then run the installation command again:

<ExporterBaseInstallCommand />

To update the file in-place, you can edit the configmap directly by running:

```bash
kubectl edit cm port-k8s-exporter -n port-k8s-exporter
```

## Next Steps

- Refer to the [examples](/build-your-software-catalog/sync-data-to-catalog/kubernetes/basic-example.md) page for practical configurations and their corresponding blueprint definitions.
- Refer to the [advanced](/build-your-software-catalog/sync-data-to-catalog/kubernetes/advanced.md) page for advanced use cases and outputs.
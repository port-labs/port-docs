---
sidebar_position: 1
---

# Installation Script

Here, you will read about Port's K8s exporter installation script, which will assist you in the process of installing Port's K8s exporter helm chart.

This script can help you with:

- setting up your custom Port [blueprints](../../define-your-data-model/setup-blueprint/);
- installing Port's k8s exporter using helm (check out the Helm chart's [installation documentation](./kubernetes.md#installation));
- deploying your custom [`config.yaml`](./kubernetes.md#exporter-configyml-file)

:::note
Check out the [complete k8s](./full-kubernetes-exporter.md) use-case page, which showcases a full example for installing Port's K8s exporter using the installation script with custom configuration.
:::

## K8s exporter installation script

:::tip
You can view the bash script [here](https://github.com/port-labs/template-assets/blob/main/kubernetes/install.sh).
:::

### Script configuration

The script supports configuration via environment variables.

For each variable you'd like to set, run the following command before running the script:

```bash showLineNumbers
export {VARIABLE_NAME}={value}
```

#### General installation configuration

| Environment Variable | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Default             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `TARGET_NAMESPACE`   | **Optional** - The Kubernetes namespace in which the exporter will be installed                                                                                                                                                                                                                                                                                                                                                                                      | `port-k8s-exporter` |
| `DEPLOYMENT_NAME`    | **Optional** - The Kubernetes deployment name the exporter will be installed as                                                                                                                                                                                                                                                                                                                                                                                      | `port-k8s-exporter` |
| `CLUSTER_NAME`       | **Optional** - The cluster's name as it will be exported to Port                                                                                                                                                                                                                                                                                                                                                                                                     | `my-cluster`        |
| `CUSTOM_BP_PATH`     | **Optional** - The URL/path to a json file with an array of blueprint objects to create. Can be either a `https://domain.com/path/to/blueprint.json` format URL, or a local path to a file `envs/production/blueprint.json`. It is important to order the blueprints while taking in to account the necessary relations for each blueprint. Once a blueprint was created, attempting to recreate it using the script will fail. To do so, first delete the blueprint |                     |
| `TEMPLATE_NAME`      | **Optional** - A list of pre-made templates to install on top of the base `kubernetes_config.yaml` defined in the default `CONFIG_YAML_URL`. This parameter is only relevant if a custom `CONFIG_YAML_URL` was not configured. It adds the associated `.tmpl` files the can be found [here](https://github.com/port-labs/template-assets/tree/main/kubernetes) (example: `export TEMPLATE_NAME="template1 template2 template3"`)                                     |                     |

:::note
The script replaces all occurrences of the string `{CLUSTER_NAME}` from the `config.yaml` set in the `CONFIG_YAML_URL`([defined here](./full-kubernetes-exporter.md#helm-chart-installation-configuration)) with the value of the environment variable `CLUSTER_NAME`. This is useful for when creating a generic `config.yaml` which has no static cluster name.
:::

#### Helm Chart Installation configuration

Required configuration as defined in the exporter's [advanced configuration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/kubernetes/advanced#required-configuration) section.

| Environment Variable | Description                                                                                                                                                                               | Default                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `PORT_CLIENT_ID`     | **Required** - Your Port organization's Client ID used to authenticate the exporter to Port                                                                                               |                                                                                            |
| `PORT_CLIENT_SECRET` | **Required** - Your Port organization's Client Secret used to authenticate the exporter to Port                                                                                           |                                                                                            |
| `CONFIG_YAML_URL`    | **Optional** - The URL/path to the `config.yaml` file. Can be either an https format URL`https://domain.com/path/to/config.yaml`, or a local path to a file `envs/production/config.yaml` | `https://github.com/port-labs/template-assets/blob/main/kubernetes/kubernetes_config.yaml` |

## Common issues

Here is a list of common issues for when using Port's K8s exporter installation script:

### Installation only works on some clusters

When running the installation script on multiple k8s clusters, it is important note that custom templates (supplied via the `TEMPLATE_NAME` variable) can only be installed on clusters which have the corresponding technologies' CRDs.

For example, attempting to install the `argo` template (by running `export TEMPLATE_NAME="argo"`) on a cluster which doesn't have ArgoCD installed, will result with the exporter container being stuck in error state.

To avoid this, either run the installation in different terminals per cluster, or unset the `TEMPLATE_NAME` variable:

```
unset TEMPLATE_NAME
```

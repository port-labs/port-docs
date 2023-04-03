---
sidebar_position: 4
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import DeleteDependents from '../../../generalTemplates/\_delete_dependents_kubernetes_explanation_template.md'
import CreateMissingRelatedEntities from '../../../generalTemplates/\_create_missing_related_entities_kubernetes_explanation_template.md'

# Advanced

The K8s exporter supports additional flags and the option to provide additional configuration sources, making it easier to configure its behavior to your liking.

## Required configuration

The following parameters are required with every K8s exporter installation/upgrade:

| Parameter                         | Description                                                               |
| --------------------------------- | ------------------------------------------------------------------------- |
| `secret.secrets.portClientId`     | Port Client ID                                                            |
| `secret.secrets.portClientSecret` | Port Client Secret                                                        |
| `configMap.config`                | Port K8s Exporter [`config.yml`](./kubernetes.md#exporter-configyml-file) |

## Advanced configuration

The following advanced configuration parameters are available:

<Tabs groupId="advanced" queryString="current-config-param" defaultValue="resyncInterval" values={[
{label: "Resync Interval", value: "resyncInterval"},
{label: "State Key", value: "stateKey"},
{label: "Delete Dependents", value: "deleteDependents"},
{label: "Create Missing Related Entities", value: "createMissingRelatedEntities"},
{label: "Verbosity (Log Level)", value: "verbosity"},
]} >

<TabItem value="resyncInterval">

The `resyncInterval` parameter specifies the interval in minutes to send a repeated sync event for all known existing objects (in addition to new cluster events).

- Default value: `0` (re-sync disabled)
- Use case: Re-sync every X minutes. This parameter is useful when reporting entities with relations inside your cluster in instances where an entity is reported before its related target has been created in Port. The initial sync will fail, but later when the target entity is available, the entity creation will succeed.

</TabItem>

<TabItem value="stateKey">

The `stateKey` parameter specifies a unique state key per K8s exporter installation. Enables deletion of stale Port entities that had been created by the exporter, and shouldn't be synced (anymore) according to your existing `config.yaml`. The exporter will check for pending deletions during pod initialization, and also respond to deletion events in the cluster.

- Default: `""`.
  - When empty, a `UUID` will be automatically generated and kept in the ConfigMap. Changing the state key will cause the existing exporter to lose track of entities it reported previously from the cluster, and will therefore not delete them from Port.
- Use case: Deletion of stale Port entities. For example:
  - Removal of entire resource (like `pods`) from the `config.yaml`, will also remove them from the software catalog.
  - Modification of an entity's identifier will cause the stale entity to be removed and created again with the correct identifier.

</TabItem>

<TabItem value="deleteDependents">

<DeleteDependents/>

- Default: `false` (disabled)
- Use case: Deletion of dependent Port entities. Must be enabled if you want to delete a target entity (and its source entities) when the entity's blueprint has required relations.

</TabItem>

<TabItem value="createMissingRelatedEntities">

<CreateMissingRelatedEntities/>

- Default: `false` (disabled)
- Use case: Creation of missing related Port entities. For example:
  - Creation of related entity that has no matching resource kind in K8s, like `cluster`;
  - Creation of an entity and its related entity, even though the related entity doesn't exist yet in Port.

</TabItem>

<TabItem value="verbosity">

The `verbosity` parameter is used to control the verbosity level of info logs in K8s exporter's pod.

- Default: `0` (show all info and error logs, including info logs of successful updates)
- Use case: Set the value to `-1`, if you want to clear out info logs of successful entities' updates. Error logs and some info logs (initialization and teardown logs), will be reported.

</TabItem>

</Tabs>

## Security Configuration

The following security parameters can be modified to give the K8s exporter more granular access to your cluster:

| Parameter               | Description                                                                                                                                                                      | Default |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `clusterRole.apiGroups` | The API groups that the K8s Exporter can access. Make sure to grant access to the relevant API groups, with respect to the resources that you've configured in the `config.yaml` | `{'*'}` |
| `clusterRole.resources` | The resources that the K8s Exporter can access. Make sure to grant access to the relevant resources, with respect to the resources that you've configured in the `config.yaml`   | `{'*'}` |

## Overriding configurations

When installing the K8s exporter, it is possible to override default values in the `helm upgrade` command:

By using the `--set` flag, you can override specific exporter configuration parameters during exporter installation/upgrade:

```bash showLineNumbers
helm upgrade --install my-port-k8s-exporter port-labs/port-k8s-exporter \
    --create-namespace --namespace port-k8s-exporter \
    --set secret.secrets.portClientId=CLIENT_ID --set secret.secrets.portClientSecret=CLIENT_SECRET \
    # highlight-next-line
    --set deleteDependents=true
    --set-file configMap.config=config.yaml
```

For example, to set the parameters from the [security configuration](#security-configuration) section:

```bash showLineNumbers
--set clusterRole.apiGroups="{argoproj.io,'',apps}" \
--set clusterRole.resources="{rollouts,pods,replicasets}"
```

## All configuration parameters

- A complete list of configuration parameters available when using the helm chart is available [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-k8s-exporter#chart);
- An example skeleton `config.yml` file is available [here](https://github.com/port-labs/helm-charts/blob/main/charts/port-k8s-exporter/values.yaml).

---
sidebar_position: 6
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import DeleteDependents from '/docs/generalTemplates/\_delete_dependents_kubernetes_explanation_template.md'
import CreateMissingRelatedEntities from '/docs/generalTemplates/\_create_missing_related_entities_kubernetes_explanation_template.md'

# Advanced

The K8s exporter supports additional flags and the option to provide additional configuration sources, making it easier to configure its behavior to your liking.

## Required configuration

The following parameters are required with every K8s exporter installation/upgrade:

| Parameter                         | Description                                                               |
| --------------------------------- | ------------------------------------------------------------------------- |
| `secret.secrets.portClientId`     | Port Client ID                                                            |
| `secret.secrets.portClientSecret` | Port Client Secret                                                        |

## Advanced installation parameters

The following advanced configuration parameters are available:

<Tabs groupId="advanced" queryString="current-config-param" defaultValue="resyncInterval" values={[
{label: "Resync Interval", value: "resyncInterval"},
{label: "State Key", value: "stateKey"},
{label: "Verbosity (Log Level)", value: "verbosity"},
{label: "Event listener type", value: "eventListenerType"},
{label: "CRDs to discover", value: "crdsToDiscover"},
]} >

<TabItem value="resyncInterval">

The `resyncInterval` parameter specifies the interval in minutes to send a repeated sync event for all known existing objects (in addition to new cluster events).

- **Default value**: `0` (re-sync disabled)
- **Use case**: Re-sync every X minutes. This parameter is useful when reporting entities with relations inside your cluster in instances where an entity is reported before its related target has been created in Port. The initial sync will fail, but later when the target entity is available, the entity creation will succeed.

</TabItem>

<TabItem value="stateKey">

The `stateKey` parameter specifies a unique state key per K8s exporter installation. Enables deletion of stale Port entities that had been created by the exporter, and shouldn't be synced (anymore) according to your existing exporter app configuration. The exporter will check for pending deletions during pod initialization, and also respond to deletion events in the cluster.

- **Default value**: `""`.
  - When empty, a `UUID` will be automatically generated and kept in the ConfigMap. Changing the state key will cause the existing exporter to lose track of entities it reported previously from the cluster, and will therefore not delete them from Port.
- **Use case**: Deletion of stale Port entities. For example:
  - Removal of entire resource (like `pods`) from the exporter app config, will also remove them from the software catalog.
  - Modification of an entity's identifier will cause the stale entity to be removed and created again with the correct identifier.

</TabItem>

<TabItem value="eventListenerType">

The K8S exporter provides support for multiple event listeners. The event listener is used to receive events and resync requests from Port and forward them to the exporter.

By configuring an event listener the integration will listen to and react to the following events sent from Port:

- **Configuration update** - the integration will use the data of the new configuration to perform a resync of information from the k8s cluster
- **Resync request** - the integration will perform a resync of data from the k8s cluster to Port based on the existing configuration

The following event listener types are supported:

- **POLLING** - the integration will automatically query Port for updates in the integration configuration and perform a
  resync if changes are detected.

- **KAFKA** - the integration will consume incoming resync requests from your dedicated Kafka topic, provisioned to you by Port

Available event listeners configuration parameters can be found [here](https://github.com/port-labs/helm-charts/blob/main/charts/port-k8s-exporter/README.md#chart)

:::caution multiple exporter instances
The event listeners that are currently available do not support multiple instances of the same exporter
:::

:::danger resync
If a resync event is received by your integration while it is actively performing a resync, the currently running resync will be aborted and a new resync process will start.

If a new resync trigger consistently aborts a running resync, it means that your integration never finishes a complete resync process (which means some information from the cluster might never appear in Port).
:::

</TabItem>

<TabItem value="verbosity">

The `verbosity` parameter is used to control the verbosity level of info logs in K8s exporter's pod.

- **Default value**: `0` (show all info and error logs, including info logs of successful updates)
- **Use case**: Set the value to `-1`, if you want to clear out info logs of successful entity updates. Error logs and some info logs (initialization and teardown logs), will be reported.

</TabItem>

<TabItem value="crdsToDiscover">

The `crdsToDiscover` parameter is used to specify a filter for the CRDs that the K8s exporter should discover and export to Port, without the need to create a mapping and the blueprint manually.

For more information how to use the `crdsToDiscover` parameter, please refer to the [K8S API extension guide](/guides/all/manage-resources-using-k8s-crds.md)

- **Default value**: `""` (no filter)

</TabItem>

</Tabs>

## Security Configuration

The following security parameters can be modified to give the K8s exporter more granular access to your cluster:

| Parameter               | Description                                                                                                                                                                         | Default |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----|
| `clusterRole.apiGroups` | The API groups that the K8s Exporter can access. Make sure to grant access to the relevant API groups, with respect to the resources that you've configured in the resource mapping | `{'*'}` |
| `clusterRole.resources` | The resources that the K8s Exporter can access. Make sure to grant access to the relevant resources, with respect to the resources that you've configured in the resource mapping   | `{'*'}` |
| `serviceAccount.create` | Whether to create the default ServiceAccount, ClusterRole and ClusterRoleBinding resources.                                                                                         | `true` |
| `serviceAccount.name`   | The name of the custom ServiceAccount resource to use, relevant only when `serviceAccount.create` is set to `false`                                                          | |

## Overriding configurations

When installing the K8s exporter, it is possible to override default values in the `helm upgrade` command:

By using the `--set` flag, you can override specific exporter configuration parameters during exporter installation/upgrade:

```bash showLineNumbers
helm upgrade --install k8s-exporter port-labs/port-k8s-exporter \
    --create-namespace --namespace port-k8s-exporter \
	--set secret.secrets.portClientId="YOUR_PORT_CLIENT_ID"  \
	--set secret.secrets.portClientSecret="YOUR_PORT_CLIENT_SECRET"  \
	--set stateKey="k8s-exporter"  \
    # highlight-next-line
	--set eventListenerType="KAFKA"  \
	--set extraEnv=[{"name":"CLUSTER_NAME","value":"my-cluster"}] 
```

For example, to set the parameters from the [security configuration](#security-configuration) section:

```bash showLineNumbers
--set clusterRole.apiGroups="{argoproj.io,'',apps}" \
--set clusterRole.resources="{rollouts,pods,replicasets}"
```

## All configuration parameters

- A complete list of configuration parameters available when using the helm chart is available [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-k8s-exporter#chart);
- An example skeleton `values.yml` file is available [here](https://github.com/port-labs/helm-charts/blob/main/charts/port-k8s-exporter/values.yaml).


## Extra environment variables
To pass extra environment variables to the exporter's runtime, you can use the Helm chart provided with the installation. You can do this in one of two ways:

1. Using Helm's `--set` flag:
```sh showLineNumbers
helm upgrade --install <MY_INSTALLATION_NAME> port-labs/port-k8s-exporter \
  # Standard installation flags
  # ...
  --set "extraEnv[0].name"=HTTP_PROXY \
  --set "extraEnv[0].value"=http://my-proxy.com:1111
```

2. The Helm `values.yaml` file:
```yaml showLineNumbers
# The rest of the configuration
# ...
extraEnvs:
  - name: HTTP_PROXY
    value: http://my-proxy.com:1111
```
### Proxy Configuration

#### `HTTP_PROXY` & `HTTPS_PROXY`
`HTTP_PROXY` and `HTTPS_PROXY` are environment variables used to specify a proxy server for handling HTTP or HTTPS, respectively. The values assigned to these settings should be the URL of the proxy server.

For example:
```sh showLineNumbers
HTTP_PROXY=http://my-proxy.com:1111
HTTPS_PROXY=http://my-proxy.com:2222
```

### `NO_PROXY`

`NO_PROXY` allows blacklisting certain addresses from being handled through a proxy. This variable accepts a comma-seperated list of hostnames or urls.

For example:
```sh showLineNumbers
NO_PROXY=http://127.0.0.1,google.com
```

## Advanced resource mapping configuration

<Tabs groupId="advanced" queryString="current-resource-mapping-configuration" defaultValue="deleteDependents" values={[
{label: "Delete Dependents", value: "deleteDependents"},
{label: "Create Missing Related Entities", value: "createMissingRelatedEntities"},
]} >
<TabItem value="deleteDependents">
<DeleteDependents/>
- **Default value**: `false` (disabled)
- **Use case**: Deletion of dependent Port entities. Must be enabled if you want to delete a target entity (and its source entities) when the entity's blueprint has required relations.
</TabItem>
<TabItem value="createMissingRelatedEntities">
<CreateMissingRelatedEntities/>
  - **Default value**: `true` to allow the Kubernetes app to create barebones related entities, in case those related entities do not exist in the software catalog.
  - **Use case**: use `false` if you do not want this default behavior (do not create missing related entities).
</TabItem>
</Tabs>
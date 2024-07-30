
# Advanced configuration for Kubecost objects

This guide provides information for configuring how Kubecost objects are ingested into your Kubecost installation. The Kubecost integration uses a YAML configuration to describe the process of loading data into the developer portal.

Each kind has specific configuration for both the v1 and v2 of the Kubecost API

## Available configuration for `kubesystem` kind (v1)
- **window** - Duration of time over which to query. Accepts: words like `today`, `week`, `month`, `yesterday`, `lastweek`, `lastmonth`; durations like `30m`, `12h`, `7d`; RFC3339 date pairs like `2021-01-02T15:04:05Z,2021-02-02T15:04:05Z`; Unix timestamps like `1578002645,1580681045`.
- **aggregate** - Field by which to aggregate the results. Accepts: `cluster`, `node`, `namespace`, `controllerKind`, `controller`, `service`, `pod`, `container`, `label:name`, and `annotation:name`. Also accepts comma-separated lists for multi-aggregation, like `namespace,label:app`.
- **step** - Duration of a single allocation set. If unspecified, this defaults to the window, so that you receive exactly one set for the entire window. If specified, such as `30m`, `2h`, `1d` etc, it works chronologically backward, querying in durations of step until the full window is covered. Default is `window`.
- **accumulate** - If true, sum the entire range of sets into a single set. Default value is `false`.
- **idle** - If true, include idle cost (i.e. the cost of the un-allocated assets) as its own allocation. Default is `true`.
- **external** - If true, include external, or out-of-cluster costs in each allocation. Default is `false`.
- **filterClusters** - Comma-separated list of clusters to match; e.g. `cluster-one,cluster-two` will return results from only those two clusters.
- **filterNodes** - Comma-separated list of nodes to match; e.g. `node-one,node-two` will return results from only those two nodes.
- **filterNamespaces** - Comma-separated list of namespaces to match; e.g. `namespace-one,namespace-two` will return results from only those two namespaces.
- **filterControllerKinds** - Comma-separated list of controller kinds to match; e.g. `deployment`, job will return results with only those two controller kinds.
- **filterControllers** - Comma-separated list of controllers to match; e.g. `deployment-one,statefulset-two` will return results from only those two controllers.
- **filterPods** - Comma-separated list of pods to match; e.g. `pod-one,pod-two` will return results from only those two pods.
- **filterAnnotations** - Comma-separated list of annotations to match; e.g. `name:annotation-one,name:annotation-two` will return results with either of those two annotation key-value-pairs.
- **filterControllerKinds** - Comma-separated list of controller kinds to match; e.g. `deployment`, job will return results with only those two controller kinds.
- **filterLabels** - Comma-separated list of annotations to match; e.g. `app:cost-analyzer, app:prometheus` will return results with either of those two label key-value-pairs.
- **filterServices** - Comma-separated list of services to match; e.g. `frontend-one,frontend-two` will return results with either of those two services.
- **shareIdle** - If true, idle cost is allocated proportionally across all non-idle allocations, per-resource. That is, idle CPU cost is shared with each non-idle allocation's CPU cost, according to the percentage of the total CPU cost represented. Default is `false`.
- **splitIdle** - If true, and shareIdle == false, Idle Allocations are created on a per cluster or per node basis rather than being aggregated into a single idle allocation. Default is `false`.
- **idleByNode** - If true, idle allocations are created on a per node basis. Which will result in different values when shared and more idle allocations when split. Default is `false`.
- And any query parameter that could be found in the [Kubecost allocation API](https://docs.kubecost.com/apis/apis-overview/api-allocation#allocation-api) and [Kubecost Cloud API](https://docs.kubecost.com/apis/apis-overview/cloud-cost-api#cloud-cost-aggregate-api)

<details>
<summary><b>Mapping config example for v1 `kubesystem` kind (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: kubesystem
    selector:
      query: "true"
      window: "7d"
      aggregate: service
      step: "1d" # this will result in 7 entries which is 1 day over the course of `window` time period: 7 days
      accumulate: false
      idle: true
      external: false
      filterLabels: "app:internal-service"
      filterServices: "notification,account,functions"
    port:
      entity:
        mappings:
          blueprint: '"kubecostResourceAllocation"'
          identifier: .name
          title: .name
          properties:
            cluster: .properties.cluster
            namespace: .properties.namespace
            startDate: .start
            endDate: .end
            cpuCoreHours: .cpuCoreHours
            cpuCost: .cpuCost
            cpuEfficiency: .cpuEfficiency
            gpuHours: .gpuHours
            gpuCost: .gpuCost
            networkCost: .networkCost
            loadBalancerCost: .loadBalancerCost
            pvCost: .pvCost
            pvBytes: .pvBytes
            ramBytes: .ramBytes
            ramCost: .ramCost
            ramEfficiency: .ramEfficiency
            sharedCost: .sharedCost
            externalCost: .externalCost
            totalCost: .totalCost
            totalEfficiency: .totalEfficiency
```

</details>

## Available configuration for `kubesystem` kind (v2)
- **window** - Duration of time over which to query. Accepts: words like `today`, `week`, `month`, `yesterday`, `lastweek`, `lastmonth`; durations like `30m`, `12h`, `7d`; RFC3339 date pairs like `2021-01-02T15:04:05Z,2021-02-02T15:04:05Z`; Unix timestamps like `1578002645,1580681045`.
- **aggregate** - Field by which to aggregate the results. Accepts: `cluster`, `node`, `namespace`, `controllerKind`, `controller`, `service`, `pod`, `container`, `label:name`, and `annotation:name`. Also accepts comma-separated lists for multi-aggregation, like `namespace,label:app`.
- **step** - Duration of a single allocation set. If unspecified, this defaults to the window, so that you receive exactly one set for the entire window. If specified, such as `30m`, `2h`, `1d` etc, it works chronologically backward, querying in durations of step until the full window is covered. Default is `window`.
- **accumulate** - If true, sum the entire range of sets into a single set. Default value is `false`.
- **idle** - If true, include idle cost (i.e. the cost of the un-allocated assets) as its own allocation. Default is `true`.
- **external** - If true, include external, or out-of-cluster costs in each allocation. Default is `false`.
- **offset** - Refers to the number of line items you are offsetting. Pairs with limit. See [Kubecost docs on Using offset and limit parameters to parse payload results](https://docs.kubecost.com/apis/apis-overview#using-offset-and-limit-parameters-to-parse-payload-results) for more
- **limit** - Refers to the number of line items per page. Pair with the offset parameter to filter your payload to specific pages of line items.
- **filter** - Filter your results by any category which you can aggregate by, can support multiple filterable items in the same category in a comma-separated list. See the [Kubecost filter syntax guide](https://docs.kubecost.com/apis/filters-api) for more.
- **format** - Set to `csv` to download an accumulated version of the allocation results in CSV format. Set to `pdf` to download an accumulated version of the allocation results in PDF format. By default, results will be in JSON format.
- **costMetric** - Cost metric format. Learn about cost metric calculations in Kubecost Allocations Dashboard documentation. Possible values are `cumulative`, `hourly`, `daily`, and `monthly`. Default is `cumulative`.
- **shareIdle** - If `true`, idle cost is allocated proportionally across all non-idle allocations, per-resource. That is, idle CPU cost is shared with each non-idle allocation's CPU cost, according to the percentage of the total CPU cost represented. Default is `false`.
- **splitIdle** - If `true`, and `shareIdle == false`, idle allocations are created on a per cluster or per node basis rather than being aggregated into a single "idle" allocation. Default is `false`.
- **idleByNode** - If `true`, idle allocations are created on a per node basis. Which will result in different values when shared and more idle allocations when split. `splitIdle` should only be configured to `true` when aggregate is configured to `node` or `cluster`. Default is `false`.
- **includeSharedCostBreakdown** - Provides breakdown of cost metrics for any shared resources. Default is `true`.
- **reconcile** - If `true`, pulls data from the Assets cache and corrects prices of Allocations according to their related Assets. The corrections from this process are stored in each cost category's cost adjustment field. If the integration with your cloud provider's billing data has been set up, this will result in the most accurate costs for Allocations. Default is `true`.
- **shareTenancyCosts** - If `true`, share the cost of cluster overhead assets such as cluster management costs and node attached volumes across tenants of those resources. Results are added to the sharedCost field. Cluster management and attached volumes are shared by cluster. Default is `true`.
- **shareNamespaces** - Comma-separated list of namespaces to share; e.g. `namespace-one,namespace-two` will return results from only those two namespaces.
- **shareLabels** - Comma-separated list of labels to share; e.g. `env:staging`, `app:test` will share the costs of those two label values with the remaining non-idle, unshared allocations.
- **shareCost** - Floating-point value representing a monthly cost to share with the remaining non-idle, unshared allocations; e.g. `30.42` ($1.00/day == $30.42/month) for the query `yesterday` (1 day) will split and distribute exactly $1.00 across the allocations. Default is `0.0`.
- **shareSplit** - Determines how to split shared costs among non-idle, unshared allocations. By default, the split will be `weighted`; i.e. proportional to the cost of the allocation, relative to the total. The other option is `even`; i.e. each allocation gets an equal portion of the shared cost. Default is `weighted`.

<details>
<summary><b>Mapping config example for v2 `kubesystem` kind (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: kubesystem
    selector:
      query: "true"
      window: "7d"
      aggregate: service
      step: "1d" # this will result in 7 entries which is 1 day over the course of `window` time period: 7 days
      accumulate: false
      idle: true
      filter: 'labels:"app:internal-service","app:service-2"+service:"notification","account","functions"' # replaces all `filter*` properties needed in v1
    port:
      entity:
        mappings:
          blueprint: '"kubecostResourceAllocation"'
          identifier: .name
          title: .name
          properties:
            cluster: .properties.cluster
            namespace: .properties.namespace
            startDate: .start
            endDate: .end
            cpuCoreHours: .cpuCoreHours
            cpuCost: .cpuCost
            cpuEfficiency: .cpuEfficiency
            gpuHours: .gpuHours
            gpuCost: .gpuCost
            networkCost: .networkCost
            loadBalancerCost: .loadBalancerCost
            pvCost: .pvCost
            pvBytes: .pvBytes
            ramBytes: .ramBytes
            ramCost: .ramCost
            ramEfficiency: .ramEfficiency
            sharedCost: .sharedCost
            externalCost: .externalCost
            totalCost: .totalCost
            totalEfficiency: .totalEfficiency
```

</details>

## Available configuration for `cloud` kind (v1)
- **window** - Duration of time over which to query. Accepts: words like `today`, `week`, `month`, `yesterday`, `lastweek`, `lastmonth`; durations like `30m`, `12h`, `7d`; RFC3339 date pairs like `2021-01-02T15:04:05Z,2021-02-02T15:04:05Z`; Unix timestamps like `1578002645,1580681045`.
- **aggregate** - Field by which to aggregate the results. Accepts: invoiceEntityID, accountID, provider, service, and label:\<name\>. Supports multi-aggregation using comma-separated lists. Example: `accountID,service`, `namespace,label:app`.
- **filterInvoiceEntityIDs** - Filter for account
- **filterAccountIDs** - GCP only, filter for projectID
- **filterProviders** - Filter for cloud service provider
- **filterLabel** - Filter for a specific label. Does not support filtering for multiple labels at once.
- **filterServices** - Comma-separated list of services to match; e.g. `frontend-one,frontend-two` will return results with either of those two services.

<details>
<summary><b>Mapping config example for v1 `kubecostCloudAllocation` kind (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: cloud
    selector:
      query: "true"
      window: 7d
      aggregate: service
      filterAccountIDs: "984573291056,374859201234"
      filterLabel: label-one,label-two
      filterServices: notification,account,chat
    port:
      entity:
        mappings:
          blueprint: '"kubecostCloudAllocation"'
          identifier: .properties.provider + "/" + .properties.providerID + "/" + .properties.category + "/" + .properties.service | gsub("[^A-Za-z0-9@_.:\\\\/=-]"; "-")
          title: .properties.provider + "/" + .properties.service
          properties:
            provider: .properties.provider
            accountID: .properties.accountID
            invoiceEntityID: .properties.invoiceEntityID
            startDate: .window.start
            endDate: .window.end
            listCost: .listCost.cost
            listCostPercent: .listCost.kubernetesPercent
            netCost: .netCost.cost
            netCostPercent: .netCost.kubernetesPercent
            amortizedNetCost: .amortizedNetCost.cost
            amortizedNetCostPercent: .amortizedNetCost.kubernetesPercent
            invoicedCost: .invoicedCost.cost
            invoicedCostPercent: .invoicedCost.kubernetesPercent

```
</details>

## Available configuration for `cloud` kind (v2)
- **window** - Duration of time over which to query. Accepts: words like `today`, `week`, `month`, `yesterday`, `lastweek`, `lastmonth`; durations like `30m`, `12h`, `7d`; RFC3339 date pairs like `2021-01-02T15:04:05Z,2021-02-02T15:04:05Z`; Unix timestamps like `1578002645,1580681045`.
- **aggregate** - Field by which to aggregate the results. Accepts: invoiceEntityID, accountID, provider, service, and label:\<name\>. Supports multi-aggregation using comma-separated lists. Example: `accountID,service`, `namespace,label:app`.
- **accumulate** - If true, sum the entire range of sets into a single set. Default value is `false`.
- **offset** - Refers to the number of line items you are offsetting. Pairs with limit. See [Kubecost docs on Using offset and limit parameters to parse payload results](https://docs.kubecost.com/apis/apis-overview#using-offset-and-limit-parameters-to-parse-payload-results) for more
- **limit** - Refers to the number of line items per page. Pair with the offset parameter to filter your payload to specific pages of line items.
- **filter** - Filter your results by any category which you can aggregate by, can support multiple filterable items in the same category in a comma-separated list. See the [Kubecost filter syntax guide](https://docs.kubecost.com/apis/filters-api) for more.

<details>
<summary><b>Mapping config example for v2 `kubecostCloudAllocation` kind (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: cloud
    selector:
      query: "true"
      window: 7d
      aggregate: service
      accumulate: false
      filter: 'labels:"app:internal-service","app:service-2"+service:"notification","account","functions"' # replaces all `filter*` properties needed in v1
    port:
      entity:
        mappings:
          blueprint: '"kubecostCloudAllocation"'
          identifier: .properties.provider + "/" + .properties.providerID + "/" + .properties.category + "/" + .properties.service | gsub("[^A-Za-z0-9@_.:\\\\/=-]"; "-")
          title: .properties.provider + "/" + .properties.service
          properties:
            provider: .properties.provider
            accountID: .properties.accountID
            invoiceEntityID: .properties.invoiceEntityID
            startDate: .window.start
            endDate: .window.end
            listCost: .listCost.cost
            listCostPercent: .listCost.kubernetesPercent
            netCost: .netCost.cost
            netCostPercent: .netCost.kubernetesPercent
            amortizedNetCost: .amortizedNetCost.cost
            amortizedNetCostPercent: .amortizedNetCost.kubernetesPercent
            invoicedCost: .invoicedCost.cost
            invoicedCostPercent: .invoicedCost.kubernetesPercent
  
```

</details>

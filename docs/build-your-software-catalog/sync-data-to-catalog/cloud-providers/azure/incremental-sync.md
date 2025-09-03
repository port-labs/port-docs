---
sidebar_position: 4
---

# Azure incremental sync integration

:::info Standalone Integration
This is a **separate, standalone integration** that runs independently from the Port Azure exporter. It's designed for lightweight, efficient synchronization of Azure resources using Azure Resource Graph change detection.
:::

## Overview

The Azure incremental sync integration provides a lightweight, efficient way to synchronize Azure resources to Port by detecting and ingesting only recent changes. Unlike the Azure exporter that requires full rescans or Event Grid setup, this integration uses Azure Resource Graph's change history tables to identify modifications within a configurable time window.

## How it works

### Change detection via Azure resource graph

The integration queries Azure Resource Graph's change history tables:

- **`resourcechanges`** - For individual Azure resources (VMs, storage accounts, etc.).
- **`resourcecontainerchanges`** - For resource containers (subscriptions, resource groups).

### Query strategy

1. **Incremental Mode**: Queries changes within a configurable time window (default: 15 minutes).
2. **Full sync**: You can run a manual full sync workflow once to get all existing Azure resources into Port before relying on incremental polling.
3. **Smart Joins**: Combines change data with current resource metadata for complete information.


### Key benefits

| Approach | Advantages | Considerations |
|----------|------------|----------------|
| **Azure Exporter (Ocean-based)** - **Full Sync + Event Grid**. | **Complete schema** from ARM APIs, initial full sync plus **push-based** near real-time updates via Event Grid (**Terraform deployment only**). | Requires Terraform deployment for Event Grid, heavier API usage for full scans. |
| **Azure Incremental Sync (Standalone)** - **Polling ARG**. | **Lightweight** and cost-efficient, detects and ingests only recent changes via Azure Resource Graph, simple to deploy (e.g., GitHub Actions). | **Partial schema** (limited to ARG fields), **polling** must run frequently to avoid missed changes. |


## When to use

- **Use the Azure Exporter (Ocean-based)** when you need the **full ARM schema** plus **near real-time** updates through **Event Grid** (best for production and comprehensive visibility).  
- **Use the Azure Incremental Sync** when you need **lightweight change tracking** through **Azure Resource Graph polling**, can accept a **partial schema**, and want a simple scheduled workflow (e.g., GitHub Actions).

## Prerequisites

### Azure set up

1. **Azure App Registration** with the following permissions:
   - **Azure Service Management**: `user_impersonation`
   - **Azure Resource Graph**: `Read` permission

2. **Role Assignments**:
   - `Reader` role on subscriptions for listing and Resource Graph access.

3. **Required Values**:
   - `AZURE_CLIENT_ID`: Azure service principal client ID
   - `AZURE_CLIENT_SECRET`: Azure service principal client secret  
   - `AZURE_TENANT_ID`: Azure tenant ID

### Port set up

1. **Blueprints**: Create the required blueprints in Port before syncing.
2. **Webhook**: Set up a webhook data source for ingesting Azure resources.
3. **Webhook Mapping**: Configure the webhook mapping for Azure resource types.

## Configuration

### Environment variables

```bash
# Required
AZURE_CLIENT_ID=your_client_id
AZURE_CLIENT_SECRET=your_client_secret
AZURE_TENANT_ID=your_tenant_id
PORT_WEBHOOK_INGEST_URL=your_webhook_url

# Optional
SYNC_MODE=incremental                    # incremental (default) or full
CHANGE_WINDOW_MINUTES=15                # Time window for change detection
SUBSCRIPTION_BATCH_SIZE=1000            # Subscriptions per batch (max 1000)
RESOURCE_TYPES='["microsoft.keyvault/vaults","Microsoft.Network/virtualNetworks"]'
RESOURCE_GROUP_TAG_FILTERS='{"include": {"Environment": "Production"}, "exclude": {"Temporary": "true"}}'
```

### Resource group tag filtering

The integration supports powerful filtering based on resource group tags:

```json
{
  "include": {"Environment": "Production", "Team": "Platform"},
  "exclude": {"Temporary": "true", "Stage": "deprecated"}
}
```

**Filter logic:**
- **Include filters**: ALL conditions must match (AND logic).
- **Exclude filters**: ANY condition will exclude (OR logic).
- **Combined**: Resources must match include criteria AND NOT match exclude criteria.

## Deployment options

### GitHub actions (recommended)

The integration is primarily designed to run via GitHub Actions workflows:

```yaml showLineNumbers
name: "Azure Incremental Sync"
on:
  schedule:
    - cron: "*/15 * * * *"  # Every 15 minutes

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          repository: port-labs/incremental-sync
          
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          
      - name: Install dependencies
        run: |
          cd integrations/azure_incremental
          pip install poetry
          make install
          
      - name: Run sync
        run: |
          cd integrations/azure_incremental
          make run
        env:
          AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
          AZURE_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
          AZURE_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
          PORT_WEBHOOK_INGEST_URL: ${{ secrets.PORT_WEBHOOK_INGEST_URL }}
          CHANGE_WINDOW_MINUTES: 15
```

### Local execution

For development and testing:

```bash
# Clone the repository
git clone https://github.com/port-labs/incremental-sync.git
cd incremental-sync/integrations/azure_incremental

# Install dependencies
make install

# Set environment variables
export AZURE_CLIENT_ID=your_client_id
export AZURE_CLIENT_SECRET=your_client_secret
export AZURE_TENANT_ID=your_tenant_id
export PORT_WEBHOOK_INGEST_URL=your_webhook_url

# Run the integration
make run
```

## Azure resource graph queries

### Incremental resource query

The integration uses sophisticated KQL queries to detect changes:

```kusto showLineNumbers
resourcechanges 
| extend changeTime=todatetime(properties.changeAttributes.timestamp)
| extend targetResourceId=tostring(properties.targetResourceId)
| extend changeType=tostring(properties.changeType)
| where changeTime > ago(15m)
| summarize arg_max(changeTime, *) by resourceId
| join kind=leftouter ( 
    resources 
    | extend sourceResourceId=tolower(id) 
    | project sourceResourceId, name, location, tags, subscriptionId, resourceGroup 
) on $left.resourceId == $right.sourceResourceId 
| join kind=leftouter (
    resourcecontainers
    | where type =~ 'microsoft.resources/subscriptions/resourcegroups'
    | project rgName=tolower(name), rgTags=tags, rgSubscriptionId=subscriptionId
) on $left.subscriptionId == $right.rgSubscriptionId and $left.resourceGroup == $right.rgName
```

### Resource container query

For subscriptions and resource groups:

```kusto showLineNumbers
resourcecontainerchanges
| extend changeTime = todatetime(properties.changeAttributes.timestamp)
| extend resourceType = tostring(properties.targetResourceType) 
| extend resourceId = tolower(properties.targetResourceId) 
| extend changeType = tostring(properties.changeType)
| where changeTime > ago(15m)
| summarize arg_max(changeTime, *) by resourceId
| join kind=leftouter ( 
    resourcecontainers 
    | extend sourceResourceId=tolower(id) 
    | project sourceResourceId, type, name, location, tags, subscriptionId, resourceGroup 
) on $left.resourceId == $right.sourceResourceId
```

## Performance considerations

### Rate limiting

The integration includes built-in rate limiting:
- **Capacity**: 250 requests
- **Refill Rate**: 25 requests per second
- **Automatic backoff** when rate limits are exceeded

### Batch Processing

- **Subscription batching**: Processes subscriptions in configurable batches (default: 1000).
- **Resource batching**: Sends resources to Port in batches of 100 for optimal performance.

### Change window optimization

- **Default window**: 15 minutes
- **Polling frequency**: Should be shorter than the change window.
- **Recommended**: Poll every 5-10 minutes for a 15-minute window.

## Troubleshooting

### Common issues

**No changes detected:**
- Verify polling interval aligns with `CHANGE_WINDOW_MINUTES`.
- Try increasing the time window (e.g., 30 minutes).
- Check Azure Resource Graph permissions.

**Missing deletes:**
- Ensure webhook mapping handles `changeType=Delete` correctly.
- Verify Port webhook configuration for delete operations.

**Resource Graph delays:**
- Allow 1-2 minute lag for Azure Resource Graph updates
- Consider increasing `CHANGE_WINDOW_MINUTES` if needed

### Logging

The integration provides detailed logging:
- **Resource discovery**: Subscription and resource counts
- **Query execution**: Azure Resource Graph query results
- **Port operations**: Webhook ingestion status
- **Rate limiting**: Automatic backoff notifications


## Comparison with Azure exporter

| Feature | Azure Exporter | Incremental Sync Integration |
|---------|------------------------------|------------------------------|
| **Architecture** | Ocean-based integration | Standalone Python application |
| **APIs Used** | **Azure Resource Manager (ARM) REST API** + **Event Grid** | **Azure Resource Graph (ARG)** (`resources`, `resourcechanges`, `resourcecontainerchanges`) |
| **Schema Depth** | **Complete schema**: full set of fields from ARM APIs. | **Partial schema**: limited to fields exposed by ARG tables. |
| **Deployment** | Helm, Docker, ContainerApp | GitHub Actions, local execution. |
| **Change Detection** | Event Grid, full rescans | Azure Resource Graph change history. |
| **Real-time Updates** | Yes (**Event Grid, Terraform only**) | Near real-time (configurable polling). |
| **Resource Usage** | Higher (full resource scanning) | Lower (change-based detection). |
| **Setup Complexity** | Medium (Ocean integration) | Low (standalone app). |

## Next steps

1. **Review the [README](https://github.com/port-labs/incremental-sync)** for complete setup instructions.
2. **Set up Azure app registration** with required permissions.
3. **Create Port blueprints** for Azure resources.
4. **Configure webhook mapping** for resource ingestion.
5. **Deploy via GitHub Actions** or run locally for testing.

:::tip Best practice
Start with incremental sync for ongoing operations and use full sync only for initial onboarding or when you need to ensure complete data consistency.
:::

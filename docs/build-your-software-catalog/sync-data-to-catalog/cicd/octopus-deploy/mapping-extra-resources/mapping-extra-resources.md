---
sidebar_position: 0
---
import RunbookBlueprint from './blueprints/\_runbook.mdx'
import RunbookMapping from './mappings/\_runbook.mdx'
import TaskBlueprint from './blueprints/\_task.mdx'
import TaskMapping from './mappings/\_task.mdx'
import TeamBlueprint from './blueprints/\_team.mdx'
import TeamMapping from './mappings/\_team.mdx'
import WorkePoolBlueprint from './blueprints/\_workerpool.mdx'
import WorkerPoolMapping from './mappings/\_workerpool.mdx'
import WorkerBlueprint from './blueprints/\_worker.mdx'
import WorkerMapping from './mappings/\_worker.mdx'
import EnvironmentBlueprint from './blueprints/\_environment.mdx'
import EnvironmentMapping from './mappings/\_environment.mdx'
import ProxyBlueprint from './blueprints/\_proxy.mdx'
import ProxyMapping from './mappings/\_proxy.mdx'
import AccountBlueprint from './blueprints/\_account.mdx'
import AccountMapping from './mappings/\_account.mdx'
import PackageBlueprint from './blueprints/\_package.mdx'
import PackageMapping from './mappings/\_package.mdx'
import SubscriptionBlueprint from './blueprints/\_subscription.mdx'
import SubscriptionMapping from './mappings/\_subscription.mdx'

# Ingest additional resources

In addition to the supported resources listed in the [integration page](/build-your-software-catalog/sync-data-to-catalog/cicd/octopus-deploy), other resources can be ingested, as described on this page.

This page will help you understand what kind of Octopus Deploy resources are supported by the integration and how to map them into Port.

## Check if a resource is supported

The Octopus Deploy integration relies on Octopus' API-first architecture, which maintains a consistent pattern for most resources. This means that you can bring virtually any resource into Port, as long as it follows the standard API structure. Here’s how to determine if a resource is supported:

1. Visit the [Octopus Deploy API Swagger documentation](https://demo.octopus.com/swaggerui/index.html) to see the available resources and their API structure.
2. **Check the resource path**: Determine if the API of the resource you want to integrate follows the standard pattern **`GET /{spaceId}/{resources}`**
   - **If the resource follows this pattern**: Great! It can be integrated.
   - **If not**: Please contact us or contribute by [adding support](https://ocean.getport.io/develop-an-integration/) to [the integration](https://github.com/port-labs/ocean/tree/main/integrations/octopus) yourself.

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party API into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform, and perform other operations on existing fields and values from the integration API.
ged
### Mapping the Resource to Port

After determining that the resource is supported by the API, you can map it to Port by following these steps:
- **Define the resource kind**: The value of `kind` should be the value of the resource in the api pattern **`GET /{spaceId}/{resources}`** without the trailing `s`. For example, if API path is **`GET /{spaceId}/runbooks`**, the value of `kind` should be `runbook`.
- **Define the selector**: The selector is a JQ query that filters the resources you want to ingest. If the query evaluates to `false`, the resource will be skipped.
- **Define the properties**: The properties are the fields of the Port entity. You can map the resource fields to the entity properties using JQ queries.
- **Define the blueprint**: The blueprint is the name of the Port entity blueprint that you want to use for the resource.
- **Define the relations**: You can define `relations` between the resource and other resources in Port by mapping the related fields.

## Example configurations

Here are some examples of how to expand the integration to include additional resources

### Runbook
<RunbookBlueprint />

<RunbookMapping />

### Task
<TaskBlueprint />

<TaskMapping />

### Team
<TeamBlueprint />

<TeamMapping />

### WorkerPool
<WorkePoolBlueprint />

<WorkerPoolMapping />

### Worker
<WorkerBlueprint />

<WorkerMapping />

### Environment
<EnvironmentBlueprint />

<EnvironmentMapping />

### Proxy
<ProxyBlueprint />

<ProxyMapping />

### Account
<AccountBlueprint />

<AccountMapping />

### Package
<PackageBlueprint />

<PackageMapping />

### Subscription
<SubscriptionBlueprint />

<SubscriptionMapping />

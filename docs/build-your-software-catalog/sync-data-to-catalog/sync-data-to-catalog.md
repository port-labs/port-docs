import DocCardList from '@theme/DocCardList';
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import IntegrationsTable from "/src/components/IntegrationsTable/IntegrationsTable.jsx"
import OceanContribution from "/docs/generalTemplates/_ocean_contribution.md"

# Install an integration

Port is designed to be flexible. It can be integrated with any tool, and can be used to build a software catalog that reflects your exact data model.

Port comes with a wide variety of available integrations for popular tools and platforms, modeled and configured by us to provide you with a plug & play experience.  

Once installed, you can customize and extend these integrations to fit your exact needs.

:::info custom integrations
Don't see the tool you wish to integrate with Port in the available integrations below?  
Port provides you with the required tools to model your data and ingest it with ease, see [`Create a custom integration`](/build-your-software-catalog/custom-integration).
:::

## Integration process

<img src='/img/build-your-software-catalog/sync-data-to-catalog/integration_diagram.png' width='100%' border='1px' style={{ "borderRadius": "12px" }} />
<br/><br/>

Generally, installing an available integration results in the following:

1. The integration's default **data model** is created for you:
   1. Default <PortTooltip id="blueprint">blueprints</PortTooltip> will be created in the [Builder](https://app.port.io/settings/data-model) page of your portal.
   2. Default [mapping](/build-your-software-catalog/customize-integrations/configure-mapping) will be defined in the integration's [data source](https://app.getport.io/settings/data-sources) page.

2. Data from the integrated tool is ingested into Port.  
   The sync mechanism and frequency depend on the installation method.

After the installation, you can customize the blueprints and/or mapping to ingest more/less data (see below).

## Available plug & play integrations

<IntegrationsTable />

<br/>
<OceanContribution />

## Installation methods

Below is a breakdown of the supported installation methods for Port integrations.  

| Installation type                    | Security                                | Ease of Installation | Syncing mechanism                                                    | Infrastructure & Maintenance Responsibility                                        | Use Case Fit                                                                                     |
| ------------------------------------ | --------------------------------------- | -------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Hosted by Port (OAuth)**           | Port manages OAuth tokens securely      | 🟩🟩🟩🟩             | Automatic updates using the sync method supported by the integration | No infrastructure to deploy or maintain. Port handles scaling, uptime, and updates | Ideal for quick setup with minimal operational effort when Port can connect to the source system |
| **Hosted by Port** | Port stores API credentials securely. You must generate and update these credentials manually   | 🟩🟩🟩⬜ | Automatic updates using the sync method supported by the integration | No infrastructure to deploy or maintain. Port handles scaling, uptime, and updates, but you manage credential renewal| Best for quick setup when you prefer not to grant OAuth permissions and are comfortable maintaining API tokens |
| **Self-hosted (Real-time)**          | Managed entirely in your infrastructure | 🟩⬜⬜⬜                | Real-time updates via webhooks                                       | You provision, monitor, and maintain the integration                       | Best for high-security environments or custom networking requirements                            |
| **Scheduled (CI)**                   | Managed in your CI/CD environment       | 🟩🟩⬜⬜               | Batch or periodic sync triggered by pipeline runs                    | Minimal infrastructure requirements. You manage the CI/CD environment and triggers | Suitable when real-time updates are unnecessary and you want full control over the sync schedule |


## Customize your integrations

Now that you've installed an integration, let's see how you can customize it:

1. [**Configure your data model**](/build-your-software-catalog/customize-integrations/configure-data-model) - Update the integration's data model in Port to ingest additional data that is not included by default.

2. [**Configure your data mapping**](/build-your-software-catalog/customize-integrations/configure-mapping) - Update the integration's data mapping in Port to match the data model and fetch your desired data from the tool.

## Entities
כא
An entity is an instance of a [blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/), it represents the data defined by a blueprint's properties.

After installing an integration, a page will be created in your catalog, populated with entities representing the ingested data.

For example, once you complete Port's [onboarding process](/getting-started/overview) and connect your Git provider to Port, a new [Services page](https://app.getport.io/services) will be created in your software catalog, populated with entities representing your services (Git repositories):

<img src='/img/software-catalog/entitiesExample.png' width='75%' border='1px' />

<br/><br/>

Clicking on an entity in the table will take to its [entity page](/customize-pages-dashboards-and-plugins/page/entity-page), where you can view its properties, relations and more.

### Entity structure

By default, each entity has the following meta-properties: `identifier`, `title`, `team`. See the table below for more details.

#### JSON structure

```json showLineNumbers
{
  "identifier": "unique-ID",
  "title": "Title",
  "team": [],
  "blueprint": "blueprintName",
  "properties": {
    "property1": "",
    "property2": ""
  },
  "relations": {}
}
```

#### Structure table

| Field        | Type     | Description                                                                                                                                                                                                                                                            |
| ------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identifier` | `String` | Unique identifier. <br /> Note that while the identifier is unique, it can be changed after creation.                                                                                                                                                                  |
| `title`      | `String` | Entity name that will be shown in the UI.                                                                                                                                                                                                                              |
| `team`       | `Array`  | **Optional Field.** An array of the associated [teams](/sso-rbac/rbac/).                                                                               |
| `blueprint`  | `String` | The name of the [blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint) that this entity is based on.                                                                                                                                                |
| `properties` | `Object` | An object containing key-value pairs, where each key is a property **as defined in the blueprint definition**, and each value matches the `type` of the property.                                                                                                      |
| `relations`  | `object` | An object containing key-value pairs.<br /> Each key is the identifier of the [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints) that is defined on the blueprint. |

:::tip Entity identifier limit
Entity identifiers are limited to a maximum of 1000 characters.
:::

## Monitoring and sync status

Every integration has a dedicated page that displays detailed monitoring metrics and sync status, helping you track the data ingestion process. This monitoring view is available for all Ocean integrations.

To access the integration's monitoring metrics and sync status, navigate to the [data sources](https://app.getport.io/settings/data-sources) page. Under the `Exporters` section, select your integration.  

The `Sync Status` tab offers a detailed overview of the data ingestion and reconciliation processes.  
It updates on initial installation, manual resyncs, and at scheduled intervals. Note that it does not reflect changes from **live events**.

It includes the following sections:  

### Sync by kind
Shows the monitoring metrics and sync status for each `kind`.  

 **Sync stages overview**:
      - **Fetch data**:  
        The first step in the data ingestion process is fetching the data from the data source.  
          In this section, you will find the following fields:
          - Fetched: Number of objects fetched from the data source.
          - Failed: If the fetch fails, this field will show `1` and `Fetched` will show `0`. Otherwise, it shows `0`.
      - **Map data**:  
        The next step is mapping these objects according to the integration's [mapping configuration](https://docs.port.io/build-your-software-catalog/customize-integrations/configure-mapping).  
          In this section, you will find the following fields:
          - Transformed: Number of objects that were mapped to blueprint entities.
          - Filtered out: Number of objects that were filtered out according to the mapping conditions.
          - Failed: Number of objects that failed to map, you can find more information about the failure reasons in the **Troubleshooting tips** section below in the UI or refer to the `Audit log` or `Event log` tabs, available in the same window.
      - **Ingest to Port**:  
        Final step is ingesting the mapped objects to Port.  
          In this section, you will find the following fields:
          - Ingested: Number of objects that were inserted or updated successfully.
          - Not changed: Number of objects that were already up to date, so no changes were made to them.
          - Failed: Number of objects that failed to ingest. To learn more about the failure reasons, see the `Audit log` or `Event log` tabs, available in the same window.
      
**Details**: Displays the duration of the sync.  

### Reconciliation
  This section provides visibility into both the reingestion and deletion processes.  

  When the `createMissingRelatedEntities` flag is set to `false`, Port will **not** automatically create related entities that are referenced in the mapping but not yet present in Port. The reingestion process ensures that once the missing related entities are ingested, the dependent entities will be reingested.  

  The deletion process ensures that entities that are no longer present in the data source are removed.  
    
  In this section, you will find the following data:  

  **Ingestion retry**:  
      -   Reingested entities: Displays the number of entities that were ingested successfully on retry after dependencies resolved.  
      -  Failed: Displays the number of entities that failed to reingest. 

  **Delete**: 
      -   Deleted entities: Displays the number of entities that were removed from Port to match the data source.
      -   Failed: Displays the number of entities that failed to delete.  
    
  **Details**: Displays the duration of the reconciliation.

  **Note**: The same data is also available through the [Get an integration's metrics and sync status](https://docs.port.io/api-reference/get-an-integrations-metrics-and-sync-status) API endpoint.

:::tip Prometheus Metrics Endpoint
If you are using the **self-hosted integration method**, you can get raw Prometheus metrics by accessing the following endpoint: `{your_integration's_base_url}/metrics/`.

<details>
<summary><b>Understanding the metrics (click to expand)</b></summary>

**Types of Metrics Available**
- **duration_seconds**: Measures how long it takes for a phase to complete.  
  _Labels_: `kind`, `phase`
- **object_count**: Counts the number of objects handled in each phase.  
  _Labels_: `kind`, `phase`, `object_count_type`
- **success** : Indicates whether the phase completed successfully.   
  _Labels_: `kind`, `phase`

**Types of Labels Available**
- **kind**: The specific type of resource handled by the integration (varies per integration).
- **phase**: The step in the ETL process:  
    - `extract`: Fetch data from the source.
    - `transform`: Map or modify data before loading.
    - `load`: Ingest the data into Port.
    - `resync`: Full ETL process for a specific kind.
    - `delete`: Part of the reconciliation phase.
- **object_count_type**: Subtype of object count, which varies by phase:
    - For `transform`: `transformed`, `filtered_out`, `failed`.
    - For `load`: `loaded`, `failed`, `skipped`.
    - For `extract`: `raw_extracted`, `failed`.
    - For `deletion`: `deleted`.
    
</details>
:::


### FAQ

<details>
<summary><b>Which integrations support this view? (Click to expand)</b></summary>

The monitoring view is available for all Ocean integrations, including both SaaS and on-premise environments.
</details>

<details>
<summary><b>Can I view previous syncs data? (Click to expand)</b></summary>

The monitoring page displays data only from the most recent sync. Historical sync information is not currently retained in this view.
</details>

<details>
<summary><b>What are the troubleshooting tips based on? (Click to expand)</b></summary>

The troubleshooting tips are based on the observed metrics at each sync stage. They offer context-aware suggestions depending on the sync outcome. For example, if no data is fetched, the tip might recommend checking the integration's permissions. These tips are not tied to error logs.
</details>

<details>
<summary><b>When is the monitoring view updated? (Click to expand)</b></summary>

The monitoring view is updated following every sync, whether it is scheduled or manually triggered.
</details>

<details>
<summary><b>Does ingestion retry always attempt to process all failures? (Click to expand)</b></summary>

No, retries only apply when `CreateMissingRelatedEntities` is set to `false`.
</details>

<details>
<summary><b>Can I see the reasons for sync failures? (Click to expand)</b></summary>

The monitoring view includes potential failure via troubleshooting tips, but they are not definitive. For more detailed and precise insights, refer to the `Audit Log` and `Event Log` tabs at the top of the modal.
</details>

<details>
<summary><b>What happens if the same `kind` appears more than once in the mapping? (Click to expand)</b></summary>

If a `kind` appears multiple times in the mapping file, it will also appear multiple times in the monitoring view, following the exact order defined in the mapping.
</details>
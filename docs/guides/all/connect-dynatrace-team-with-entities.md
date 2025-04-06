---
displayed_sidebar: null
description: Learn how to map Dynatrace teams to monitored entities in Port
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Assign teams to monitored entities

This guide explains how to assign team ownership to Dynatrace entities, allowing you to easily identify which team is responsible for each monitored entity.

## Common use cases
- Quickly determine which team owns a specific entity and contact them when needed.

## Prerequisites
This guide assumes the following:
- You have a Port account and you have completed the [onboarding process](/getting-started/overview).
- You have installed Port's [Dynatrace integration](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/dynatrace/dynatrace.md).
- You have entities from cloud providers configured on Dynatrace. See [Dynatrace documentation](https://docs.dynatrace.com/managed#deploy-on) for this.


## Set up data model

To establish team ownership,  we will modify the `Dynatrace Entity` blueprint by adding an `owned_by` relation.  
Follow the steps below to **update** the `Dynatrace Entity` blueprint:

1. Go to the [data model page](https://app.getport.io/settings/data-model) of your portal, and locate the`Dynatrace Entity` blueprint.
2. Hover over it, click on the `...` button on the right, and select "Edit JSON".
3. Add the `owned_by` relation as shown below, then click `Save`:

   <details>
   <summary><b>Team relation (Click to expand)</b></summary>

   ```json showLineNumbers
    "relations": {
      "owned_by": {
        "title": "Owned By",
        "target": "dynatraceTeam",
        "required": false,
        "many": true
      }
    }
   ```
   </details>


## Creating the mapping configuration
Now that the relationship between teams and monitored entities is defined, the next step is to assign the appropriate team to each `Dynatrace Entity`. This can be done by adding mapping logic based on your ingested resources.
Dynatrace supports multiple methods for assigning team ownership, including Kubernetes labels and annotations, host metadata, environment variables, and tags.

To set up the mapping, navigate to the Dynatrace integration in the [Data Sources page](https://app.getport.io/settings/data-sources) and add the following mapping based on your preferred method:

<Tabs>
<TabItem value="direct_mapping" label="Direct Mapping" default>

The most straightforward way to set a relation's value is to explicitly specify the related entity's identifier.  
Add the following snippet to your mapping configuration to map Dynatrace entities with teams using Kubernetes labels and annotations:

<details>
<summary><b>Dynatrace ownership configuration using Kubernetes labels and annotations</b></summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
  - kind: entity
    selector:
      query: 'true'
      entityTypes:
        - `CLOUD_APPLICATION`
        - `KUBERNETES_SERVICE`
        - `KUBERNETES_CLUSTER`
        # Add more entity types
      entityFields: firstSeenTms,lastSeenTms,tags,properties,managementZones,fromRelationships,toRelationships
    port:
      entity:
        mappings:
          identifier: .displayName | gsub(" "; "-")
          title: .displayName
          blueprint: '"dynatraceEntity"'
          properties:
            firstSeen: .firstSeenTms / 1000 | todate
            lastSeen: .lastSeenTms / 1000 | todate
            type: .type
            tags: .tags[].stringRepresentation
          relations:
            owned_by: .properties.kubernetesLabels | to_entries | map(select(.key == "dt.owner" or .key == "owner") | .value) | if length == 0 then null else . end
```
:::tip ownership keys
In this example, the `dt.owner` and `owner` keys from Kubernetes resource labels are used to define ownership. You should use the keys configured in your Dynatrace environment. For more details on setting up ownership keys, refer to the [Dynatrace documentation](https://docs.dynatrace.com/docs/deliver/ownership/assign-ownership#format)
:::

</details>


<details>
<summary><b>Dynatrace ownership configuration using tags</b></summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
  - kind: entity
    selector:
      query: 'true'
      entityTypes:
        - `cloud:gcp:k8s_cluster`
        - `cloud:gcp:pubsub_subscription`
        - `cloud:gcp:pubsub_topic`
        - `cloud:gcp:gcs_bucket`
        - `cloud:gcp:gae_app`
        - `cloud:aws:acmprivateca`
        - `cloud:aws:api_gateway`
        - `cloud:aws:app_runner`
        - `cloud:aws:appstream`
        - `cloud:aws:appsync`
        - `cloud:azure:apimanagement:service`
        - `cloud:azure:app:containerapps`
        - `cloud:azure:app:managedenvironments`
        - `cloud:azure:appconfiguration:configurationstores`
        - `cloud:azure:appplatform:spring`
        # see below section for more entity types
    port:
      entity:
        mappings:
          identifier: .displayName | gsub(" "; "-")
          title: .displayName
          blueprint: '"dynatraceEntity"'
          properties:
            firstSeen: .firstSeenTms / 1000 | todate
            lastSeen: .lastSeenTms / 1000 | todate
            type: .type
            tags: .tags[] | map(.stringRepresentation)
          relations:
            owned_by: .tags | map(select(.key == "dt.owner" or .key == "owner") | .value) | if length == 0 then null else . end
```
:::tip ownership keys
In this example, the `dt.owner` and `owner` keys from the tags are used to define ownership. You should use the keys configured in your Dynatrace environment. For more details on setting up ownership keys, refer to the [Dynatrace documentation](https://docs.dynatrace.com/docs/deliver/ownership/assign-ownership#format)
:::
</details>

</TabItem>

<TabItem value="search_query" label="Search query">

You can also use a [search query](https://docs.port.io/build-your-software-catalog/customize-integrations/configure-mapping#mapping-relations-using-search-queries) to dynamically match Dynatrace entities with teams based on specific criteria.   
This approach is particularly useful when you don't know the entity's identifier, but you do know the value of one of its properties. 

Add the snippet below to your mapping configuration to match teams with entities by either using the entity's management zone name or a Kubernetes label.
You can customize these matching rules according to your organization's team structure and naming conventions.

<details>
<summary><b>Dynatrace ownership configuration using search query</b></summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
  - kind: entity
    selector:
      query: 'true'
      entityTypes:
        - `CLOUD_APPLICATION`
        - `KUBERNETES_SERVICE`
        - `KUBERNETES_CLUSTER`
        # Add more entity types
      entityFields: firstSeenTms,lastSeenTms,tags,properties,managementZones,fromRelationships,toRelationships
    port:
      entity:
        mappings:
          identifier: .displayName | gsub(" "; "-")
          title: .displayName
          blueprint: '"dynatraceEntity"'
          properties:
            firstSeen: .firstSeenTms / 1000 | todate
            lastSeen: .lastSeenTms / 1000 | todate
            type: .type
            tags: .tags[].stringRepresentation
            managementZone: .managementZones[0].name
          relations:
            owned_by:
              combinator: '"or"'
              rules:
                - property: '"name"'
                  operator: '"="'
                  value: .managementZones[0].name
                - property: '"identifier"'
                  operator: '"="'
                  value: .properties.kubernetesLabels.team
```

</details>

</TabItem>
</Tabs>

Next, click on the **resync** button and watch your Dynatrace `entities` being mapped to the `teams` as shown below in this example:

<img src='/img/guides/dynatraceEntityTeamOwnership.png' border='1px' />
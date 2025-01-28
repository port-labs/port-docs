---
displayed_sidebar: null
description: Learn how to map Dynatrace teams to monitored entities in Port
---

# Assign teams to monitored entities

This guide aims to show you how to assign team owners to your Dynatrace entities to teams to have a better understanding of the team responsible for your monitored entities.


## Common use cases
- Easily find the responsible team of your entities and contact them when need arises

## Prerequisites
This guide assumes the following:
- You have a Port account and that you have finished the [onboarding process](/quickstart).
- You have [installed and setup Port's Dynatrace integration](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/dynatrace/dynatrace.md)
- You have entities from cloud providers configured on Dynatrace. See [Dynatrace documentation](https://docs.dynatrace.com/managed#deploy-on) for this.


## Set up data model

In this setup, we will update the `Dynatrace Entity` blueprint to create the `owned_by` relation. Follow the steps below to **update** the `Dynatrace Entity` blueprint:

1. Navigate to the `Dynatrace Entity` blueprint in your Port [Builder](https://app.getport.io/settings/data-model).
2. Hover over it, click on the `...` button on the right, and select "Edit JSON".
3. Add the `owned_by` relation:

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
Now that we have defined the relationship between the team and monitored entities, we need to assign the relevant team to each of our `Dynatrace Entity`. This can be done by adding some mapping logic.

We will be using of the `entity` and `team` kind in Port's Dynatrace integration which provides information on entities being monitored and teams in Dynatrace respectively. Dynatrace offers several methods that can be used to define the team ownership. These are Kubernetes labels and annotations, host metadata, environment variables, and tags.

Next, locate the Dynatrace integration in the [Data Sources page](https://app.getport.io/settings/data-sources) and add the following mapping based on the methods:


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
            owned_by: .properties.kubernetesLabels | to_entries | map(select(.key == "dt.ower" or .key == "owner") | .value) | if length == 0 then null else . end
```
:::tip ownership keys
In this example, we are using the `dt.owner` and `owner` key from the kubernetes resource label. You are advised to use the ownership keys you have defined in your Dynatrace environment. More information on how create the keys can be found in [this docs](https://docs.dynatrace.com/docs/deliver/ownership/assign-ownership#format)
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

</details>

Next, click on resync and watch your Dynatrace entities being mapped to the teams based on the configuration:

<img src='/img/guides/dynatraceEntityTeamOwnership.png' border='1px' />


By following this guide, you have successfully configures your Dyntrace integration to map entities to their team owners.
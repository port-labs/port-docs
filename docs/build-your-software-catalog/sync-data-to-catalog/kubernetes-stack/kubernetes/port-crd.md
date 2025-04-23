---
sidebar_position: 7
---

# Port Entity CRD

[Port's K8s exporter](./kubernetes.md) allows exporting data from any resource in your Kubernetes clusters, including [Custom Resource Definitions](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)(CRDs).
To take advantage of the flexibility of Port's K8s exporter, Port provides additional CRDs which make it possible to use K8s resource definitions as a source of [entities](/build-your-software-catalog/sync-data-to-catalog/sync-data-to-catalog.md#creating-entities) in your software catalog.

:::tip
All CRDs provided by Port can be found [here.](https://github.com/port-labs/port-crds)
:::

# Port CRDs

A Port entity can represent any kind of data in your infrastructure, from nodes to pods to non-Kubernetes related entities such as repositories or microservices. To achieve this level of abstraction, 2 CRDs are provided:

## Namespace scoped entity CRD - `getport.io/v1/Entity`

<details>
  <summary>Entity CRD</summary>

```
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: entities.getport.io
spec:
  group: getport.io
  versions:
  - name: v1
    served: true
    storage: true
    additionalPrinterColumns:
      - name: Blueprint ID
        type: string
        jsonPath: .spec.blueprint
      - name: Entity ID
        type: string
        jsonPath: .spec.identifier
      - name: Properties
        type: string
        jsonPath: .spec.properties
      - name: Relations
        type: string
        jsonPath: .spec.relations
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              blueprint:
                type: string
              identifier:
                type: string
              properties:
                type: object
                x-kubernetes-preserve-unknown-fields: true
              relations:
                type: object
                x-kubernetes-preserve-unknown-fields: true
            required:
              - blueprint
              - identifier
  scope: Namespaced
  names:
    plural: entities
    singular: entity
    kind: Entity
    shortNames:
    - ent
```

</details>

## Cluster scoped entity CRD - `getport.io/v1/ClusterEntity`

<details>
  <summary>Cluster Entity CRD</summary>

```
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: clusterentities.getport.io
spec:
  group: getport.io
  versions:
  - name: v1
    served: true
    storage: true
    additionalPrinterColumns:
      - name: Blueprint ID
        type: string
        jsonPath: .spec.blueprint
      - name: Entity ID
        type: string
        jsonPath: .spec.identifier
      - name: Properties
        type: string
        jsonPath: .spec.properties
      - name: Relations
        type: string
        jsonPath: .spec.relations
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              blueprint:
                type: string
              identifier:
                type: string
              properties:
                type: object
                x-kubernetes-preserve-unknown-fields: true
              relations:
                type: object
                x-kubernetes-preserve-unknown-fields: true
            required:
              - blueprint
              - identifier
  scope: Cluster
  names:
    plural: clusterentities
    singular: clusterentity
    kind: ClusterEntity
    shortNames:
    - cent
```

</details>

## Port CRDs Structure

Port CRDs provide four key attributes:

- `Blueprint ID` **Required**: The [blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/setup-blueprint.md#what-is-a-blueprint) identifier (string) of the entity you wish to map;
- `Entity ID` **Required**: The [entity](/build-your-software-catalog/sync-data-to-catalog/sync-data-to-catalog.md#creating-entities) identifier (string) of the entity you wish to map;
- `Properties` **Optional**: The [properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/properties.md) field (object) holds the properties data of the entity you want to map;
- `Relations` **Optional**: The [relations](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/relate-blueprints.md) field (object) holds the relations data of the entity you want to map.

<details>
  <summary>CRD examples</summary>

```yaml showLineNumbers
# Namespaced Port Entity CRD example
apiVersion: getport.io/v1
kind: Entity
metadata:
  name: example-entity-resource
  namespace: example-namespace
spec:
  blueprint: blueprint-identifier
  identifier: entity-identifier
  properties:
    myStringProp: string
    myArrayProp:
      - string_1
      - string_2
      - string_3
    myUrlProp: https://test-url.com
  relations:
    mySingleRelation: relation-target-id
    myManyRelations:
      - relation-target-id-1
      - relation-target-id-2

# Namespaced Port Cluster Entity CRD example
apiVersion: getport.io/v1
kind: ClusterEntity
metadata:
  name: example-cluster-entity-resource
spec:
  blueprint: blueprint-identifier
  identifier: entity-identifier
  properties:
    myStringProp: string
    myArrayProp:
      - string_1
      - string_2
      - string_3
    myUrlProp: https://test-url.com
  relations:
    mySingleRelation: relation-target-id
    myManyRelation:
      - relation-target-id-1
      - relation-target-id-2
```

</details>

## Deploying Port's CRDs

To deploy Port's CRDs in your K8s cluster, run the following commands:

```bash showLineNumbers
# Run this to install Port's namespace-scoped CRD
kubectl apply -f https://raw.githubusercontent.com/port-labs/port-crds/main/port-entity-crd-namespace.yaml

# Run this to install Port's cluster-scoped CRD
kubectl apply -f https://raw.githubusercontent.com/port-labs/port-crds/main/port-entity-crd-cluster.yaml
```

## Exporting Port's custom resources

To export the Port entity CRDs using Port's K8s exporter, you will need to add a new resources to your exporter configuration. This mapping configuration will match the blueprint data model you defined in your software catalog.

To learn how to use Port CRDs to fit your needs, you will follow an example. It will give you a general understanding of how to map any data you would like.

### Example - Mapping a microservice using Port CRDs

The goal for this example is to map a microservice using Port's CRD and Port's K8s exporter. For this example, you will map a microservice as a Port entity.

:::note Prerequisites
Before getting started:

- Prepare your [Port credentials](/build-your-software-catalog/custom-integration/api/api.md#find-your-port-credentials);
- Be familiar with [Port's K8s exporter](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/kubernetes.md) and configuration;
- Make sure you are connected to a K8s cluster using `kubectl`.

:::

1. **Deploy the Port CRD** - follow the [deployment step](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/port-crd.md#deploying-ports-crds) to deploy the Port CRD. You will only need the cluster-scoped entity CRD.

2. **Creating the blueprint** - You will begin by defining the blueprint which will represent a microservice in your software catalog.
   Create the following blueprint in your Port environment:

```json showLineNumbers
{
  "identifier": "microservice",
  "title": "Microservice",
  "icon": "Microservice",
  "description": "This blueprint represents a microservice",
  "schema": {
    "properties": {
      "description": {
        "title": "Description",
        "description": "A short description for this microservice",
        "type": "string"
      },
      "onCall": {
        "title": "On-Call",
        "description": "Who the on-call for this microservice is",
        "type": "string"
      },
      "slackChannel": {
        "title": "Slack Channel",
        "description": "The URL of this microservice's Slack channel",
        "format": "url",
        "type": "string"
      },
      "datadogUrl": {
        "title": "Datadog URL",
        "description": "The URL of this microservice's DataDog dashboard",
        "format": "url",
        "type": "string"
      },
      "language": {
        "type": "string",
        "description": "The language this microservice is written in",
        "title": "Language"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

3. **Create a Port entity custom resource in your cluster** - create an Entity CR which will represent a microservice, using the scheme defined in your blueprint:

   1. Create the following file as `port-entity.yaml`:

```yaml showLineNumbers
# Namespaces Port Entity CRD example
apiVersion: getport.io/v1
kind: ClusterEntity
metadata:
  name: my-microservice-entity
spec:
  blueprint: microservice
  identifier: my-awesome-microservice
  properties:
    description: This entity represents my awesome microservice
    onCall: some@email.com
    slackChannel: https://domain.slack.com/archives/12345678
    datadogUrl: https://www.datadoghq.com/
    language: typescript
```

4.  Apply the CRD manifest to your cluster:

```bash showLineNumbers
kubectl apply -f port-entity.yaml
```

4. **Create a mapping configuration for the K8s exporter** - create (or add to an existing) the following exporter configuration to map this CRD using Port's k8s exporter:
   
   1. Open the [data sources](https://app.getport.io/settings/data-sources) page in your Port environment and click on the integration you wish to add the mapping to;

   2. Add the following mapping configuration to your exporter configuration:
   
   :::tip Adding the mapping configuration
   If you already have an exporter configuration, you can add the following mapping to your existing configuration by appending the lines after the `resources` key to your existing configuration.
   :::

   ```yaml showLineNumbers
   resources:
     - kind: getport.io/v1/ClusterEntities # Map entities of type 'Port Cluster Entities'
       selector:
         query: .spec.blueprint == "microservice" # This will make sure to only query ClusterEntites were .spec.blueprint == 'microservice'
       port:
         entity:
           mappings:
             - identifier: .spec.identifier
               title: .spec.identifier
               blueprint: .spec.blueprint
               properties:
                 description: .spec.properties.description
                 onCall: .spec.properties.onCall
                 slackChannel: .spec.properties.slackChannel
                 datadogUrl: .spec.properties.datadogUrl
                 language: .spec.properties.language
   ```

   3. Click on the `Save & Resync` button to apply the configuration to your integration.

You will now be able to see the newly exported entity in your Port environment.

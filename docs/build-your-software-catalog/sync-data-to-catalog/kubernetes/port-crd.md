---
sidebar_position: 7
---

# Entity CRD

Port's K8s exporter allows exporting data from any resource in your Kubernetes clusters, including [CustomResourceDefinitions](port-crd.md)(CRDs).
To take advantage of the flexibility of Port's K8s exporter, Port provides additional CRDs which allow to use K8s resource definitions as a source of [entities](../../sync-data-to-catalog/sync-data-to-catalog.md#creating-entities) in your software catalog.

:::tip
All CRDs provided by Port can be found [here.](https://github.com/port-labs/port-crds)
:::

# Port CRDs

A Port entity can represent any kind of data in your infrastructure, from nodes to pods, and even external data such as repositories. This means Port entities can reference both cluster-scoped Kubernetes resources, and namespace-scoped Kubernetes resources. To achieve this, 2 CRDs are provided:

**Namespace scoped entity CRD** - `getport.io/v1/Entity`

<details>
  <summary>Entity CRD definition</summary>

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

**Cluster scoped entity CRD** - `getport.io/v1/ClusterEntity`

<details>
  <summary>Cluster Entity CRD definition</summary>

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

## Port CRD Structure

Port CRDs provide four key attributes:

- `Blueprint ID` **Required** : The [blueprint](../../define-your-data-model/setup-blueprint/setup-blueprint.md#what-is-a-blueprint) identifier (string) of the entity you wish to map.

- `Entity ID` **Required** : The [entity](../../sync-data-to-catalog/sync-data-to-catalog.md#creating-entities) identifier (string) of the entity you wish to map.

- `Properties` **Optional** : The [properties](../../define-your-data-model/setup-blueprint/properties/properties.md) field (object) holds the property data of the entity you want to map.

- `Relations` **Optional** : The [relations](../../define-your-data-model/relate-blueprints/relate-blueprints.md) field (object) holds the relations data of the entity you want to map.

```yaml showLineNumbers
# Namespaces Port Entity CRD example
apiVersion: getport.io/v1
kind: Entity
metadata:
  name: example-entity-resource
  namespace: example-namespace
spec:
  blueprint: "<Blueprint ID>"
  identifier: "<Entity ID>"
  properties:
    myStringProp: string
    myArrayProp:
      - string_1
      - string_2
      - string_3
    myUrlProp: https://test-url.com
  relations:
    singleRelation: relation-target-id
    multipleRelations:
      - relation-target-id-1
      - relation-target-id-2
```

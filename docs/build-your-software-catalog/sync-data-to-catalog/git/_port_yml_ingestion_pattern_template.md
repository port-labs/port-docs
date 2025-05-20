{/* When using this template, pass the prop `provider={PROVIDER_NAME}` */}

The `port.yml` ingestion pattern allows you to configure the {props.provider} integration to ingest `port.yml` files as part of the resync process. This approach is particularly useful when you want to maintain data integrity and ensure that your `port.yml` files are properly synchronized with Port.

`port.yml` files operate in the GitOps methodology, meaning they are ingested into Port whenever a commit to the main branch of the repository is detected.

Here's how to configure the integration to parse and ingest `port.yml` files:

```yaml showLineNumbers
enableMergeEntity: true
resources:
  - kind: file
    selector:
      query: "true"
      files:
        - path: "**/port.yml"
    port:
      entity:
        mappings:
          identifier: .file.content.identifier
          title: .file.content.title
          blueprint: .file.content.blueprint
          properties:
            property_a: .file.content.properties.property_a
            property_b: .file.content.properties.property_b
          relations: 
            relation_a: .file.content.relations.relation_a
            relation_b: .file.content.relations.relation_b
```

For multiple entities in a single `port.yml` file, use the `itemsToParse` key:

```yaml showLineNumbers
enableMergeEntity: true
resources:
  - kind: file
    selector:
      query: "true"
      files:
        - path: "**/port.yml"
    port:
      itemsToParse: .file.content
      entity:
        mappings:
          identifier: .item.identifier
          title: .item.title
          blueprint: .item.blueprint
          properties:
            property_a: .item.properties.property_a
            property_b: .item.properties.property_b
          relations:
            relation_a: .item.relations.relation_a
            relation_b: .item.relations.relation_b
```

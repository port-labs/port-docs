---
sidebar_position: 5
---

# Advanced

The AWS v3 integration supports additional configuration options to access optional properties from AWS resources.

## Optional actions configuration

Some AWS resource properties require additional API calls to retrieve. You can use the `includeActions` parameter to access these optional properties.

### Configuration

You can add `includeActions` to your resource configuration under the `selector` section:

```yaml showLineNumbers
resources:
  - kind: AWS::EC2::Instance
    selector:
      query: 'true'
      includeActions:
        # Optional: Include up to 3 additional actions for more properties
        - GetInstanceStatusAction
    port:
      entity:
        mappings:
          # ... your mappings
```

:::caution Action limit
You can include a **maximum of 3 optional actions per resource kind** (excluding default actions). To use more than 3 actions, you can configure multiple resource kinds in your integration.
:::

### Finding available actions

Each AWS resource has its own set of available actions. To find which actions are available for a specific resource, you can:

1. Check the resource's properties table in the [Examples](./examples.md) page
2. Look at the "Action Required" column to see which properties need optional actions
3. Use the action names shown in that column in your `includeActions` list

## Property availability

AWS resource properties fall into two categories:

- **Default properties**: Always available, no additional configuration needed
- **Optional properties**: Require specific actions via `includeActions`

Each resource example includes a properties reference table with an "Action Required" column showing which properties need optional actions.

## Configuration examples

### Multiple actions example

```yaml showLineNumbers
resources:
  - kind: AWS::S3::Bucket
    selector:
      query: 'true'
      includeActions:
        - GetBucketEncryptionAction
        - GetBucketPublicAccessBlockAction
    port:
      entity:
        mappings:
          identifier: .Properties.Arn
          title: .Properties.BucketName
          blueprint: '"s3Bucket"'
          properties:
            # Default properties (always available)
            arn: .Properties.Arn
            region: .Properties.LocationConstraint
            creationDate: .Properties.CreationDate
            tags: .Properties.Tags
            # Optional properties (require includeActions)
            bucketEncryption: .Properties.BucketEncryption
            publicAccessBlock: .Properties.PublicAccessBlockConfiguration
          relations:
            account: .__ExtraContext.AccountId
```




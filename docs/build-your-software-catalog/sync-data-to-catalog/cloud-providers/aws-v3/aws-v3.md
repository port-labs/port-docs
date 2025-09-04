---
sidebar_position: 3
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Image from "@theme/IdealImage";
import MetricsAndSyncStatus from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_metrics_and_sync_status.mdx"

# AWS Hosted by Port

:::warning Beta Feature
AWS Hosted by Port is currently in **beta mode** and is not yet available for all Port users. Contact your Port representative to request access to this integration.
:::

Port's AWS Hosted by Port integration allows you to import your AWS resources into Port with **zero maintenance required**. The integration is fully hosted and managed by Port, providing a seamless experience for discovering and managing your AWS infrastructure.

The integration periodically syncs your AWS resources to ensure your Port catalog stays up-to-date with your AWS infrastructure.

:::tip
AWS Hosted by Port is fully managed by Port - no maintenance, updates, or infrastructure management required on your end.
:::

## 💡 AWS Hosted by Port common use cases

Easily fill your software catalog with data directly from your AWS Organization, for example:

- Map all the resources in your AWS Accounts, including **ECS Clusters**, **S3 Buckets**, and **EC2 Instances** with zero maintenance required.
- Keep your Port catalog synchronized with your AWS infrastructure through periodic updates.
- Use relations to create complete, easily digestible views of your AWS infrastructure inside Port.
- Enjoy a fully managed experience with no infrastructure to maintain or updates to apply.

## How it works

AWS Hosted by Port connects to your AWS accounts using **OIDC (OpenID Connect)** authentication to securely access your AWS resources:

### Single Account Setup
1. **Role Assumption**: The integration assumes the IAM role you create in your AWS account
2. **Resource Discovery**: It discovers and exports your AWS resources to Port
3. **Periodic Sync**: The integration periodically syncs to keep your Port catalog up-to-date

### Multi-Account Setup
1. **Organization Access**: The integration connects to your AWS Organizations master account
2. **Account Discovery**: It lists all member accounts in your organization
3. **Cross-Account Access**: For each account, it assumes the appropriate IAM role
4. **Resource Export**: It exports resources from all accounts to Port
5. **Periodic Sync**: The integration periodically syncs across all accounts

The integration currently supports the following AWS resource types:
- **S3 Buckets**: Complete bucket information including properties, tags, and metadata
- **ECS Clusters**: Cluster details, services, and task definitions
- **EC2 Instances**: Instance information, security groups, and networking details

:::info More Resource Types Coming Soon
We're actively working on adding support for additional AWS resource types to provide comprehensive coverage of your AWS infrastructure.
:::

## Key advantages over standard AWS integration

AWS Hosted by Port provides several advantages over the standard AWS integration:

- **Fully Hosted**: No infrastructure to maintain, update, or monitor
- **Simplified Installation**: Just deploy CloudFormation templates to create IAM roles
- **Complete Data**: Ensures no missing or incomplete resource information
- **Periodic Sync**: Regular updates to keep your catalog current
- **Zero Maintenance**: Port handles all updates, scaling, and infrastructure management

## Getting started

Continue to the [installation](./installations/installation.md) guide to learn how to install AWS Hosted by Port.

## Multiple accounts support

To properly configure permissions for production and to enable multiple accounts collection check out our [multiple accounts guide](./installations/multi_account.md)

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration you get after installing AWS Hosted by Port.

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
- kind: AWS::Organizations::Account
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .Id
        title: .Name
        blueprint: '"awsAccount"'
        properties:
          arn: .Arn
          email: .Email
          status: .Status
          joined_method: .JoinedMethod
          joined_timestamp: .JoinedTimestamp | sub(" "; "T")
- kind: AWS::S3::Bucket
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        identifier: .Identifier
        title: .Identifier
        blueprint: '"cloudResource"'
        properties:
          kind: .__Kind
          region: .Properties.RegionalDomainName | capture(".*\\.(?<region>[^\\.]+)\\.amazonaws\\.com")
            | .region
          tags: .Properties.Tags
          arn: .Properties.Arn
          link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn="
            + .Arn
        relations:
          account: .__AccountId
- kind: AWS::EC2::Instance
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .Identifier
        title: .Identifier
        blueprint: '"cloudResource"'
        properties:
          kind: .__Kind
          region: .__Region
          tags: .Properties.Tags
          arn: .Properties.Arn
          link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn="
            + .Arn
        relations:
          account: .__AccountId
- kind: AWS::ECS::Cluster
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        identifier: .Properties.Arn
        title: .Identifier
        blueprint: '"cloudResource"'
        properties:
          kind: .__Kind
          region: .__Region
          tags: .Properties.Tags
          arn: .Properties.Arn
          link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn="
            + .Arn
        relations:
          account: .__AccountId
- kind: AWS::Lambda::Function
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        identifier: .Properties.FunctionName
        title: .Properties.FunctionName
        blueprint: '"cloudResource"'
        properties:
          kind: .__Kind
          region: .__Region
          runtime: .Properties.Runtime
          memory_size: .Properties.MemorySize
          timeout: .Properties.Timeout
          tags: .Properties.Tags
          arn: .Properties.Arn
          link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn="
            + .Arn
        relations:
          account: .__AccountId
- kind: AWS::RDS::DBInstance
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        identifier: .Properties.DBInstanceIdentifier
        title: .Properties.DBInstanceIdentifier
        blueprint: '"cloudResource"'
        properties:
          kind: .__Kind
          region: .__Region
          engine: .Properties.Engine
          engine_version: .Properties.EngineVersion
          instance_class: .Properties.DBInstanceClass
          tags: .Properties.Tags
          arn: .Properties.Arn
          link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn="
            + .Arn
        relations:
          account: .__AccountId
```

</details>

<MetricsAndSyncStatus/>

## Advanced Configuration

### AWS SDK v3 Specific Features

The AWS-v3 integration leverages several AWS SDK v3 specific features:

- **Modular Architecture**: Only imports the specific AWS services you need, reducing bundle size
- **Enhanced TypeScript Support**: Full TypeScript support with better type inference
- **Improved Error Handling**: More granular error types and better error messages
- **Better Performance**: Optimized for performance with reduced memory footprint

### Resource Discovery Optimization

The AWS-v3 integration includes several optimizations for resource discovery:

- **Parallel Processing**: Processes multiple regions and services in parallel
- **Smart Caching**: Implements intelligent caching to reduce API calls
- **Rate Limiting**: Built-in rate limiting to respect AWS API limits
- **Retry Logic**: Enhanced retry logic with exponential backoff

### Configuration Examples

#### Basic Configuration

```yaml showLineNumbers
resources:
- kind: AWS::S3::Bucket
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        identifier: .Identifier
        title: .Identifier
        blueprint: '"s3Bucket"'
        properties:
          region: .Properties.RegionalDomainName | capture(".*\\.(?<region>[^\\.]+)\\.amazonaws\\.com") | .region
          tags: .Properties.Tags
          arn: .Properties.Arn
```

#### Advanced Configuration with Relations

```yaml showLineNumbers
resources:
- kind: AWS::ECS::Service
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        identifier: .Properties.ServiceArn
        title: .Properties.ServiceName
        blueprint: '"ecsService"'
        properties:
          cluster: .Properties.ClusterArn
          desired_count: .Properties.DesiredCount
          running_count: .Properties.RunningCount
          tags: .Properties.Tags
          arn: .Properties.ServiceArn
        relations:
          cluster: .Properties.ClusterArn
          account: .__AccountId
```

## Troubleshooting

### Common Issues

#### AWS SDK v3 Compatibility

If you encounter compatibility issues with AWS SDK v3:

1. Ensure you're using the latest version of the AWS-v3 integration
2. Check that your AWS credentials are properly configured
3. Verify that the required AWS services are available in your region

#### Performance Issues

For performance optimization:

1. Use the `useGetResourceAPI: 'true'` flag for resources that support it
2. Implement proper filtering in your selector queries
3. Consider using parallel processing for large-scale deployments

#### Memory Usage

To optimize memory usage:

1. Use specific resource kinds instead of broad queries
2. Implement proper pagination for large datasets
3. Monitor memory usage and adjust configuration accordingly

### Debug Mode

Enable debug mode for detailed logging:

```yaml showLineNumbers
debug: true
log_level: "DEBUG"
```

This will provide detailed information about:
- API calls being made
- Resource processing status
- Error details and stack traces
- Performance metrics

## Migration from AWS Integration

If you're migrating from the standard AWS integration to AWS-v3:

1. **Backup Configuration**: Save your current configuration
2. **Update Mapping**: Review and update your mapping configuration if needed
3. **Test Integration**: Test the new integration in a development environment
4. **Deploy**: Deploy to production once testing is complete

### Configuration Changes

The main differences in configuration:

- Enhanced error handling options
- Additional performance tuning parameters
- Improved resource discovery settings
- Better support for complex resource relationships

## Support and Resources

- **Documentation**: [AWS SDK v3 Documentation](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)
- **Community**: [Port Community Forum](https://github.com/port-labs/port/discussions)
- **Issues**: [Report Issues](https://github.com/port-labs/ocean/issues)
- **Source Code**: [AWS-v3 Integration](https://github.com/port-labs/ocean/tree/main/integrations/aws-v3)

---
sidebar_position: 4
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# AWS Hosted by Port Examples

This page provides comprehensive examples for configuring AWS Hosted by Port with the currently supported AWS services and use cases.

## Currently Supported AWS Resources

AWS Hosted by Port currently supports the following AWS resource types:

- **S3 Buckets**: Complete bucket information including properties, tags, and metadata
- **ECS Clusters**: Cluster details, services, and task definitions  
- **EC2 Instances**: Instance information, security groups, and networking details

:::info More Resource Types Coming Soon
We're actively working on adding support for additional AWS resource types to provide comprehensive coverage of your AWS infrastructure.
:::

## Basic Examples

### S3 Buckets

Map S3 buckets with detailed properties:

```yaml showLineNumbers
resources:
- kind: AWS::S3::Bucket
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        - identifier: .Identifier
          title: .Identifier
          blueprint: '"s3Bucket"'
          properties:
            kind: .__Kind
            region: .Properties.RegionalDomainName | capture(".*\\.(?<region>[^\\.]+)\\.amazonaws\\.com") | .region
            account_id: .__AccountId
            creation_date: .Properties.CreationDate
            tags: .Properties.Tags
            arn: .Properties.Arn
            link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn=" + .Arn
          relations:
            account: .__AccountId
```

### EC2 Instances

Map EC2 instances with comprehensive details:

```yaml showLineNumbers
resources:
- kind: AWS::EC2::Instance
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        - identifier: .Identifier
          title: .Identifier
          blueprint: '"ec2Instance"'
          properties:
            kind: .__Kind
            region: .__Region
            account_id: .__AccountId
            instance_type: .Properties.InstanceType
            state: .Properties.State.Name
            launch_time: .Properties.LaunchTime
            public_ip: .Properties.PublicIpAddress
            private_ip: .Properties.PrivateIpAddress
            vpc_id: .Properties.VpcId
            subnet_id: .Properties.SubnetId
            security_groups: .Properties.SecurityGroups
            tags: .Properties.Tags
            arn: .Properties.Arn
            link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn=" + .Arn
          relations:
            account: .__AccountId
            vpc: .Properties.VpcId
```


## Advanced Examples

### ECS Clusters and Services

Map ECS clusters and their services with relationships:

```yaml showLineNumbers
resources:
# ECS Clusters
- kind: AWS::ECS::Cluster
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        - identifier: .Properties.ClusterArn
          title: .Properties.ClusterName
          blueprint: '"ecsCluster"'
          properties:
            kind: .__Kind
            region: .__Region
            account_id: .__AccountId
            cluster_name: .Properties.ClusterName
            status: .Properties.Status
            running_tasks_count: .Properties.RunningTasksCount
            pending_tasks_count: .Properties.PendingTasksCount
            active_services_count: .Properties.ActiveServicesCount
            capacity_providers: .Properties.CapacityProviders
            tags: .Properties.Tags
            arn: .Properties.ClusterArn
            link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn=" + .Arn
          relations:
            account: .__AccountId

# ECS Services
- kind: AWS::ECS::Service
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        - identifier: .Properties.ServiceArn
          title: .Properties.ServiceName
          blueprint: '"ecsService"'
          properties:
            kind: .__Kind
            region: .__Region
            account_id: .__AccountId
            service_name: .Properties.ServiceName
            cluster_arn: .Properties.ClusterArn
            task_definition: .Properties.TaskDefinition
            desired_count: .Properties.DesiredCount
            running_count: .Properties.RunningCount
            pending_count: .Properties.PendingCount
            launch_type: .Properties.LaunchType
            platform_version: .Properties.PlatformVersion
            status: .Properties.Status
            tags: .Properties.Tags
            arn: .Properties.ServiceArn
            link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn=" + .Arn
          relations:
            account: .__AccountId
            cluster: .Properties.ClusterArn
```


## Multi-Account Examples

### Organization-Wide Resource Mapping

Map resources across multiple accounts in an organization:

```yaml showLineNumbers
resources:
# Organization Account
- kind: AWS::Organizations::Account
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        - identifier: .Id
          title: .Name
          blueprint: '"awsAccount"'
          properties:
            arn: .Arn
            email: .Email
            status: .Status
            joined_method: .JoinedMethod
            joined_timestamp: .JoinedTimestamp | sub(" "; "T")
            account_id: .Id
          relations:
            organization: .__OrganizationId

# Cross-Account S3 Buckets
- kind: AWS::S3::Bucket
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        - identifier: .Identifier
          title: .Identifier
          blueprint: '"s3Bucket"'
          properties:
            kind: .__Kind
            region: .Properties.RegionalDomainName | capture(".*\\.(?<region>[^\\.]+)\\.amazonaws\\.com") | .region
            account_id: .__AccountId
            creation_date: .Properties.CreationDate
            tags: .Properties.Tags
            arn: .Properties.Arn
            environment: .Properties.Tags.Environment // "unknown"
            project: .Properties.Tags.Project // "unknown"
            cost_center: .Properties.Tags.CostCenter // "unknown"
            link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn=" + .Arn
          relations:
            account: .__AccountId
```

## Filtering Examples

### Environment-Based Filtering

Filter resources by environment tags:

```yaml showLineNumbers
resources:
- kind: AWS::EC2::Instance
  selector:
    query: '.Properties.Tags | select(.Key == "Environment") | .Value == "production"'
  port:
    entity:
      mappings:
        - identifier: .Identifier
          title: .Identifier
          blueprint: '"ec2Instance"'
          properties:
            kind: .__Kind
            region: .__Region
            account_id: .__AccountId
            instance_type: .Properties.InstanceType
            state: .Properties.State.Name
            environment: .Properties.Tags | select(.Key == "Environment") | .Value
            project: .Properties.Tags | select(.Key == "Project") | .Value
            tags: .Properties.Tags
            arn: .Properties.Arn
          relations:
            account: .__AccountId

- kind: AWS::S3::Bucket
  selector:
    query: '.Properties.Tags | select(.Key == "Environment") | .Value == "production"'
  port:
    entity:
      mappings:
        - identifier: .Identifier
          title: .Identifier
          blueprint: '"s3Bucket"'
          properties:
            kind: .__Kind
            region: .Properties.RegionalDomainName | capture(".*\\.(?<region>[^\\.]+)\\.amazonaws\\.com") | .region
            account_id: .__AccountId
            environment: .Properties.Tags | select(.Key == "Environment") | .Value
            project: .Properties.Tags | select(.Key == "Project") | .Value
            tags: .Properties.Tags
            arn: .Properties.Arn
          relations:
            account: .__AccountId
```

### Resource Type Filtering

Filter specific resource types:

```yaml showLineNumbers
resources:
# Only t3.micro instances
- kind: AWS::EC2::Instance
  selector:
    query: '.Properties.InstanceType == "t3.micro"'
  port:
    entity:
      mappings:
        - identifier: .Identifier
          title: .Identifier
          blueprint: '"ec2Instance"'
          properties:
            kind: .__Kind
            region: .__Region
            account_id: .__AccountId
            instance_type: .Properties.InstanceType
            state: .Properties.State.Name
            tags: .Properties.Tags
            arn: .Properties.Arn
          relations:
            account: .__AccountId

# Only t3.micro instances
- kind: AWS::EC2::Instance
  selector:
    query: '.Properties.InstanceType == "t3.micro"'
  port:
    entity:
      mappings:
        - identifier: .Identifier
          title: .Identifier
          blueprint: '"ec2Instance"'
          properties:
            kind: .__Kind
            region: .__Region
            account_id: .__AccountId
            instance_type: .Properties.InstanceType
            state: .Properties.State.Name
            tags: .Properties.Tags
            arn: .Properties.Arn
          relations:
            account: .__AccountId
```

## Complex Relationship Examples

### ECS Cluster and Service Relationships

Map ECS clusters and their services with relationships:

```yaml showLineNumbers
resources:
# ECS Clusters
- kind: AWS::ECS::Cluster
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        - identifier: .Properties.ClusterArn
          title: .Properties.ClusterName
          blueprint: '"ecsCluster"'
          properties:
            kind: .__Kind
            region: .__Region
            account_id: .__AccountId
            cluster_name: .Properties.ClusterName
            status: .Properties.Status
            running_tasks_count: .Properties.RunningTasksCount
            pending_tasks_count: .Properties.PendingTasksCount
            active_services_count: .Properties.ActiveServicesCount
            capacity_providers: .Properties.CapacityProviders
            tags: .Properties.Tags
            arn: .Properties.ClusterArn
            link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn=" + .Arn
          relations:
            account: .__AccountId

# ECS Services
- kind: AWS::ECS::Service
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        - identifier: .Properties.ServiceArn
          title: .Properties.ServiceName
          blueprint: '"ecsService"'
          properties:
            kind: .__Kind
            region: .__Region
            account_id: .__AccountId
            service_name: .Properties.ServiceName
            cluster_arn: .Properties.ClusterArn
            task_definition: .Properties.TaskDefinition
            desired_count: .Properties.DesiredCount
            running_count: .Properties.RunningCount
            pending_count: .Properties.PendingCount
            launch_type: .Properties.LaunchType
            platform_version: .Properties.PlatformVersion
            status: .Properties.Status
            tags: .Properties.Tags
            arn: .Properties.ServiceArn
            link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn=" + .Arn
          relations:
            account: .__AccountId
            cluster: .Properties.ClusterArn
```

## Performance Optimization Examples

### Parallel Processing Configuration

Configure the integration for optimal performance:

```yaml showLineNumbers
# Performance configuration
performance:
  parallel_processing:
    enabled: true
    max_concurrent_requests: 10
    max_concurrent_accounts: 5
  
  caching:
    enabled: true
    cache_ttl: "1h"
    cache_size: 1000
  
  rate_limiting:
    enabled: true
    requests_per_second: 10
    burst_limit: 20

aws:
  access_key_id: "YOUR_ACCESS_KEY"
  secret_access_key: "YOUR_SECRET_KEY"
  region: "us-east-1"
  
  # Enable performance optimizations
  optimizations:
    use_get_resource_api: true
    parallel_discovery: true
    smart_caching: true

resources:
  - kind: AWS::S3::Bucket
    selector:
      query: 'true'
      useGetResourceAPI: 'true'
    port:
      entity:
        mappings:
          - identifier: .Identifier
            title: .Identifier
            blueprint: '"s3Bucket"'
            properties:
              kind: .__Kind
              region: .Properties.RegionalDomainName | capture(".*\\.(?<region>[^\\.]+)\\.amazonaws\\.com") | .region
              account_id: .__AccountId
              tags: .Properties.Tags
              arn: .Properties.Arn
            relations:
              account: .__AccountId
```

## Error Handling Examples

### Robust Error Handling

Configure comprehensive error handling:

```yaml showLineNumbers
# Error handling configuration
error_handling:
  retry_policy:
    max_retries: 3
    retry_delay: "5s"
    exponential_backoff: true
  
  error_notification:
    enabled: true
    webhook_url: "https://your-webhook-url.com/errors"
    email_notifications: ["admin@yourcompany.com"]
  
  fallback_behavior:
    skip_failed_resources: true
    continue_on_error: true
    log_errors: true

aws:
  access_key_id: "YOUR_ACCESS_KEY"
  secret_access_key: "YOUR_SECRET_KEY"
  region: "us-east-1"

resources:
  - kind: AWS::S3::Bucket
    selector:
      query: 'true'
      useGetResourceAPI: 'true'
    port:
      entity:
        mappings:
          - identifier: .Identifier
            title: .Identifier
            blueprint: '"s3Bucket"'
            properties:
              kind: .__Kind
              region: .Properties.RegionalDomainName | capture(".*\\.(?<region>[^\\.]+)\\.amazonaws\\.com") | .region
              account_id: .__AccountId
              tags: .Properties.Tags
              arn: .Properties.Arn
              # Add error handling for missing properties
              creation_date: .Properties.CreationDate // "unknown"
              versioning: .Properties.Versioning.Status // "unknown"
            relations:
              account: .__AccountId
```

## Custom Blueprint Examples

### Custom Resource Blueprints

Create custom blueprints for specific use cases:

```yaml showLineNumbers
resources:
# Custom Application Blueprint
- kind: AWS::ECS::Service
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        - identifier: .Properties.ServiceArn
          title: .Properties.ServiceName
          blueprint: '"application"'
          properties:
            name: .Properties.ServiceName
            type: '"microservice"'
            environment: .Properties.Tags.Environment // "unknown"
            team: .Properties.Tags.Team // "unknown"
            cost_center: .Properties.Tags.CostCenter // "unknown"
            status: .Properties.Status
            desired_count: .Properties.DesiredCount
            running_count: .Properties.RunningCount
            cluster: .Properties.ClusterArn
            task_definition: .Properties.TaskDefinition
            launch_type: .Properties.LaunchType
            tags: .Properties.Tags
            arn: .Properties.ServiceArn
            link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn=" + .Arn
          relations:
            account: .__AccountId
            cluster: .Properties.ClusterArn

# Custom Database Blueprint
- kind: AWS::RDS::DBInstance
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        - identifier: .Properties.DBInstanceIdentifier
          title: .Properties.DBInstanceIdentifier
          blueprint: '"database"'
          properties:
            name: .Properties.DBInstanceIdentifier
            type: '"relational"'
            engine: .Properties.Engine
            version: .Properties.EngineVersion
            environment: .Properties.TagList | select(.Key == "Environment") | .Value // "unknown"
            team: .Properties.TagList | select(.Key == "Team") | .Value // "unknown"
            cost_center: .Properties.TagList | select(.Key == "CostCenter") | .Value // "unknown"
            status: .Properties.DBInstanceStatus
            instance_class: .Properties.DBInstanceClass
            allocated_storage: .Properties.AllocatedStorage
            multi_az: .Properties.MultiAZ
            backup_retention: .Properties.BackupRetentionPeriod
            tags: .Properties.TagList
            arn: .Properties.DBInstanceArn
            link: .Properties | select(.DBInstanceArn != null) | "https://console.aws.amazon.com/go/view?arn=" + .DBInstanceArn
          relations:
            account: .__AccountId
```

## Testing and Validation

### Configuration Validation

Test your configuration before deployment:

```bash showLineNumbers
# Validate configuration syntax
python -c "import yaml; yaml.safe_load(open('config.yaml'))"

# Test resource discovery
python main.py --dry-run --config config.yaml

# Validate mapping syntax
python main.py --validate-mappings --config config.yaml
```

### Performance Testing

Test performance with different configurations:

```bash showLineNumbers
# Test with small resource set
python main.py --config config-small.yaml --benchmark

# Test with full resource set
python main.py --config config-full.yaml --benchmark

# Compare performance
python benchmark.py --config1 config-small.yaml --config2 config-full.yaml
```

## Best Practices

### 1. Resource Selection

- Use specific resource kinds instead of broad queries
- Implement proper filtering to reduce API calls
- Use `useGetResourceAPI: 'true'` when available

### 2. Performance Optimization

- Enable parallel processing for large deployments
- Use caching for frequently accessed resources
- Implement rate limiting to respect AWS limits

### 3. Error Handling

- Implement comprehensive error handling
- Use fallback values for missing properties
- Set up monitoring and alerting

### 4. Security

- Use least privilege IAM policies
- Encrypt sensitive configuration data
- Implement proper access controls

### 5. Maintenance

- Regular configuration reviews
- Monitor performance metrics
- Update configurations as AWS services evolve

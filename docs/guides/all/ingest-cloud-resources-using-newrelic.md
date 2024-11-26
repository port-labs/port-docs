---
displayed_sidebar: null
description: Learn how to ingest cloud resources using New Relic in Port, enhancing visibility and performance monitoring.
---

# Ingest Cloud Resources with New Relic

This guide aims to show you how to ingest cloud resources using New Relic to have a comprehensive view of the cloud resources/entities you have from your cloud providers.

## Common Use Cases

- Map your monitored resources from cloud providers in New Relic.
- Enhance visibility of your cloud infrastructure within Port without relying solely on direct integrations.

## Prerequisites

This guide assumes the following:

- You have a Port account and have completed the [onboarding process](https://docs.getport.io/quickstart).
- You have [installed and set up Port's New Relic integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/apm-alerting/newrelic).
- You have entities from cloud providers configured in New Relic. See [New Relic's documentation](https://docs.newrelic.com/docs/infrastructure/) for details on setting up cloud integrations.

## Ingesting cloud resources into Port

We will utilize the `entity` kind in Port's New Relic integration, which provides information on entities monitored in New Relic. 
Entities are ingested based on their respective `infrastructureIntegrationType`.

<details>
<summary><b>Examples of cloud resources infrastructure integration types</b></summary>

- `AWS_EC2_INSTANCE`
- `AWS_S3_BUCKET`
- `AWS_RDS_DB_INSTANCE`
- `AWS_LAMBDA_FUNCTION`
- `AWS_ELB_LOAD_BALANCER`
- `AZURE_VIRTUAL_MACHINE`
- `AZURE_SQL_DATABASE`
- `GCP_COMPUTE_INSTANCE`
- `GCP_STORAGE_BUCKET`
- `GCP_SQL_DATABASE_INSTANCE`

</details>


## Data model setup
Follow the steps below to set your data model up for ingesting cloud resources from New Relic:

1. Creating the blueprint configuration

After installing the New Relic integration, create the following blueprint configuration in Port:

<details>
<summary><b>New Relic entity cloud resource blueprint (click to expand)</b></summary>

```json
{
  "identifier": "newRelicEntityCloudResource",
  "description": "This blueprint represents a New Relic cloud resource entity.",
  "title": "New Relic Cloud Resource",
  "icon": "NewRelic",
  "schema": {
    "properties": {
      "accountId": {
        "type": "string",
        "title": "Account ID",
        "description": "The New Relic account ID associated with the entity."
      },
      "domain": {
        "type": "string",
        "title": "Domain",
        "description": "The domain of the entity (e.g., INFRA, APM)."
      },
      "type": {
        "type": "string",
        "title": "Entity Type",
        "description": "The type of the entity."
      },
      "infrastructureIntegrationType": {
        "type": "string",
        "title": "Infrastructure Integration Type",
        "description": "The cloud provider integration type."
      },
      "tags": {
        "type": "object",
        "title": "Tags",
        "description": "Tags associated with the entity."
      },
      "reporting": {
        "type": "boolean",
        "title": "Reporting",
        "description": "Indicates if the entity is reporting data."
      },
      "link": {
        "type": "string",
        "title": "Entity Link",
        "description": "A link to the entity in New Relic.",
        "format": "url"
      }
    },
    "required": []
  },
  "relations": {}
}
```

</details>

2. Configuring the integration mapping

Locate the New Relic integration in the [Data Sources page](https://app.getport.io/settings/data-sources) and add the following mapping for cloud resources:

<details>
<summary><b>New Relic Service (Entity) mapping configuration (click to expand)</b></summary>

```yaml
  - kind: newRelicService
    selector:
      query: 'true'
      newRelicTypes: ["HOST"]
      entityQueryFilter: |
        infrastructureIntegrationType IN (
          'AWS_EC2_INSTANCE',
          'AWS_S3_BUCKET',
          'AWS_RDS_DB_INSTANCE',
          'AWS_LAMBDA_FUNCTION',
          'AWS_ELB_LOAD_BALANCER',
          'AZURE_VIRTUAL_MACHINE',
          'AZURE_SQL_DATABASE',
          'GCP_COMPUTE_INSTANCE',
          'GCP_STORAGE_BUCKET',
          'GCP_SQL_DATABASE_INSTANCE'
        )
      entityExtraPropertiesQuery: |
        ... on InfraHostEntityOutline {
          infrastructureIntegrationType
          # Include additional properties if needed
        }
    port:
      entity:
        mappings:
          blueprint: '"newRelicEntityCloudResource"'
          identifier: .guid
          title: .name
          properties:
            accountId: .accountId
            domain: .domain
            type: .type
            infrastructureIntegrationType: .infrastructureIntegrationType
            reporting: .reporting
            link: .permalink
            tags: .tags
```

</details>

3. Resyncing Data

After configuring the mapping, click on `Resync` to start ingesting your cloud resources from New Relic into Port.

<img src="/img/guides/newRelicIngestedData.png" border='1px' />


## More entity types
Based on New Relic's documentation and common integrations, here's a comprehensive list of `infrastructureIntegrationType` values you can include in your mapping:

<details>
<summary><b>Common Infrastructure Integration Types</b></summary>

- **AWS Integration Types**

  - `AWS_EC2_INSTANCE`
  - `AWS_EBS_VOLUME`
  - `AWS_S3_BUCKET`
  - `AWS_RDS_DB_INSTANCE`
  - `AWS_LAMBDA_FUNCTION`
  - `AWS_ELB_LOAD_BALANCER`
  - `AWS_DYNAMODB_TABLE`
  - `AWS_ELASTICACHE_NODE`
  - `AWS_REDSHIFT_CLUSTER`
  - `AWS_KINESIS_STREAM`
  - `AWS_SNS_TOPIC`
  - `AWS_SQS_QUEUE`
  - `AWS_ELASTIC_BEANSTALK`
  - `AWS_AUTOSCALING_GROUP`
  - `AWS_CLOUDFRONT_DISTRIBUTION`
  - `AWS_API_GATEWAY`
  - `AWS_ECS_CLUSTER`
  - `AWS_EKS_CLUSTER`

- **Azure Integration Types**

  - `AZURE_VIRTUAL_MACHINE`
  - `AZURE_VM_SCALE_SET`
  - `AZURE_APP_SERVICE`
  - `AZURE_FUNCTION_APP`
  - `AZURE_SQL_DATABASE`
  - `AZURE_STORAGE_ACCOUNT`
  - `AZURE_COSMOS_DB`
  - `AZURE_REDIS_CACHE`
  - `AZURE_SERVICE_BUS_NAMESPACE`
  - `AZURE_EVENT_HUB_NAMESPACE`
  - `AZURE_LOAD_BALANCER`
  - `AZURE_APPLICATION_GATEWAY`
  - `AZURE_CONTAINER_INSTANCE`
  - `AZURE_KUBERNETES_SERVICE`

-  **GCP Integration Types**

    - `GCP_COMPUTE_INSTANCE`
    - `GCP_STORAGE_BUCKET`
    - `GCP_CLOUD_SQL_DATABASE`
    - `GCP_FUNCTION`
    - `GCP_PUBSUB_TOPIC`
    - `GCP_BIGQUERY_DATASET`
    - `GCP_CLOUD_SPANNER_INSTANCE`
    - `GCP_KUBERNETES_CLUSTER`
    - `GCP_CLOUD_RUN_SERVICE`

- **Other Integration Types**

  - `APACHE_HTTPD_SERVER`
  - `NGINX_SERVER`
  - `MYSQL_DATABASE`
  - `POSTGRESQL_DATABASE`
  - `REDIS_INSTANCE`
  - `DOCKER_CONTAINER`
  - `KUBERNETES_CLUSTER`

</details>

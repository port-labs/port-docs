# Amazon Relational Database Service

import RdsDbInstanceBlueprint from './aws-rds-db-instance/_rds_db_instance_blueprint.mdx'
import RdsDbInstanceConfig from './aws-rds-db-instance/_rds_db_instance_port_app_config.mdx'



## AWS::RDS::DBInstance

The following example demonstrates how to ingest your AWS RDS DB instances to Port.

#### RDS DB Instance Supported Actions

The table below summarizes the available actions for ingesting Amazon RDS DB Instance resources in Port:

| Action                          | Description                                                                                                         | Type     | Required AWS Permission |
|---------------------------------|---------------------------------------------------------------------------------------------------------------------|----------|-------------------------|
| **DescribeDBInstancesAction**   | Discover DB instances and retrieve configuration details. [Reference](https://docs.aws.amazon.com/rds/latest/APIReference/API_DescribeDBInstances.html) | Default  | `rds:DescribeDBInstances` |
| **ListTagsForResourceAction**   | Retrieve tags for each DB instance. [Reference](https://docs.aws.amazon.com/rds/latest/APIReference/API_ListTagsForResource.html)                         | Optional | `rds:ListTagsForResource` |

::::info Optional properties note
Properties of optional actions will not appear in the response unless you explicitly include the action that provides them in your configuration.
::::

You can use the following Port blueprint definitions and integration configuration:

<RdsDbInstanceBlueprint/>

<RdsDbInstanceConfig/>

For more details about RDS DB instance properties, refer to the [AWS RDS API documentation](https://docs.aws.amazon.com/rds/latest/APIReference/Welcome.html).

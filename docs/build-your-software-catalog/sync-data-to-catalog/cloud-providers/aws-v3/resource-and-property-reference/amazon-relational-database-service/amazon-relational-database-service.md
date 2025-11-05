# Amazon Relational Database Service

import RdsDbInstanceBlueprint from './aws-rds-db-instance/_rds_db_instance_blueprint.mdx'
import RdsDbInstanceConfig from './aws-rds-db-instance/_rds_db_instance_port_app_config.mdx'



## AWS::RDS::DBInstance

The following example demonstrates how to ingest your AWS RDS DB instances to Port.

#### RDS DB Instance supported actions

The table below summarizes the available actions for ingesting Amazon RDS DB Instance resources in Port:

| Action                          | Description                                                                                                         | Type     | Required AWS Permission |
|---------------------------------|---------------------------------------------------------------------------------------------------------------------|----------|-------------------------|
| [DescribeDBInstancesAction](https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_DescribeDBInstances.html)   | Discover DB instances and retrieve configuration details. | Default  | `rds:DescribeDBInstances` |
| [ListTagsForResourceAction](https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_ListTagsForResource.html)   | Retrieve tags for each DB instance.                         | Optional | `rds:ListTagsForResource` |

::::info Optional Properties Note
Properties of optional actions will not appear in the response unless you explicitly include the action that provides them in your configuration.
::::

You can use the following Port blueprint definitions and integration configuration:

<RdsDbInstanceBlueprint/>

<RdsDbInstanceConfig/>

For more details about RDS DB instance properties, refer to the [AWS RDS API documentation](https://docs.aws.amazon.com/rds/latest/APIReference/Welcome.html).

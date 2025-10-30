# AWS Account

import AwsAccountBlueprint from './aws-account-info/_aws_account_blueprint.mdx'
import AwsAccountConfig from './aws-account-info/_aws_account_port_app_config.mdx'



## AWS::Account::Info

The following example demonstrates how to ingest AWS account information using a custom resource designed for account resync without AWS Organizations permissions.

::::info Custom resource for account resync
Use `AWS::Account::Info` to resync AWS account data when you do not have organization-level permissions. If you do have AWS Organizations permissions and want to retrieve richer data (e.g., org account metadata, parents, and tags), see the AWS Organizations documentation under [AWS Organizations](../aws-organizations/aws-organizations.md).
::::

You can use the following Port blueprint definitions and integration configuration:

<AwsAccountBlueprint/>

<AwsAccountConfig/>

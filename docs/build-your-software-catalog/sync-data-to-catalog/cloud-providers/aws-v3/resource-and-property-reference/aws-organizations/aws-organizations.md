# AWS Organizations

import OrganizationsAccountBlueprint from './aws-organizations-account/_organizations_accounts_blueprint.mdx'
import OrganizationsAccountConfig from './aws-organizations-account/_organizations_accounts_port_app_config.mdx'
import OrganizationsAccountProperties from './aws-organizations-account/_organizations_accounts_properties.mdx'



## AWS::Organizations::Account

The following example demonstrates how to ingest your AWS Organizations accounts to Port.

#### Organizations Account Supported Actions

The table below summarizes the available actions for ingesting AWS Organizations Account resources in Port:

| Action                       | Description                                                      | Type     | Required AWS Permission           |
|-----------------------------|------------------------------------------------------------------|----------|-----------------------------------|
| **ListAccountsAction**      | Discover organization accounts and retrieve account metadata. [Reference](https://docs.aws.amazon.com/organizations/latest/APIReference/API_ListAccounts.html)    | Default  | `organizations:ListAccounts`      |
| **ListTagsForResourceAction** | Retrieve tags for the specified account. [Reference](https://docs.aws.amazon.com/organizations/latest/APIReference/API_ListTagsForResource.html)                      | Optional | `organizations:ListTagsForResource`|
| **ListParentsAction**       | Retrieve parent information for the specified account. [Reference](https://docs.aws.amazon.com/organizations/latest/APIReference/API_ListParents.html)         | Optional | `organizations:ListParents`       |

:::info Optional properties note
Properties of optional actions will not appear in the response unless you explicitly include the action that provides them in your configuration.
:::

You can use the following Port blueprint definitions and integration configuration:

<OrganizationsAccountBlueprint/>

<OrganizationsAccountConfig/>

For more details about Organizations accounts, refer to the [AWS Organizations API documentation](https://docs.aws.amazon.com/organizations/latest/APIReference/Welcome.html).

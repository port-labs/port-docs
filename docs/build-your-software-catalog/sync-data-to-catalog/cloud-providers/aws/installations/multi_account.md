---
sidebar_position: 1
---

import CenterRoundedImage from "/src/components/CenterRoundedImage/index.jsx";

# Multi account support

This guide will provide you with the necessary tools for enabling our Ocean AWS Integration to digest multiple account's data.

## Our Permissions model

A few key concepts in the AWS's permissions model:

1. *Policy*: A document that defines permissions, specifying what actions are allowed or denied for particular resources and under what conditions.
2. *Role*: An identity with specific permissions and trust policies.
3. *AssumeRole*: An action that allows for a user / service account to impersonate a Role with temporary credentials. Allowing roles to assume-roles for other roles is enabled via `Trust Policies`.
4. *Trust Policy*: A document attached to a role that specifies which principals (users, groups, or roles) are allowed to assume the role.
5. *Account*: A container that holds all your AWS resources and services, identified uniquely by an AWS account ID.
6. *Root Account*: The primary account created when setting up an AWS environment, the only account that has access to other accounts in the AWS Organization.
7. *Integration Account*: The account where the Port AWS integration will be installed
8. *Member Account*(s): The target accounts which the Port AWS integration will fetch resources from 

### How are permissions granted?

*Very* Briefly, a permission to perform a certain action in AWS must be granted from *both* the entity which performs the action *and* the entity which is affected from the action. This means, that if I want to add permissions to read from a S3 bucket and I'm using a certain role, I *have* to give permissions to the role from the S3's permissions policy *and* to read the S3 bucket from the Role. This is an oversimplification, but it works when trying to understand how you set permissions up from scratch. For more information, check [AWS's docs](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)

Let's assume you have 2 different accounts:

1. Our `integration account`, where you deploy the Port AWS integration.
2. A `Root account`.

<CenterRoundedImage imgSrc='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-single-step-1.jpg' />

And the final flow that allows data to be read is where the `integration account` assumes the `Root account` (to list information about the organization), and in addition, actually fetches the data from the `integration account`.

<CenterRoundedImage imgSrc='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-single-step-2.jpg' />

First, we will create a role with permissions (If you're running the terraform installation, this will be done for you). We'll call this role `ReadOnlyPermissionsOceanRole`, with `I can read resources in this account` policy.

<CenterRoundedImage imgSrc='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-role-step-1.jpg' />

Then we'll go to the root account, and give it permissions to view some metadata about other accounts. We'll call this role `OrganizationalOceanRole`, and give it `I can view metadata about accounts`.

<CenterRoundedImage imgSrc='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-role-step-2.jpg' />

Then, In order for the integration's role to get accounts metadata, We'll need to give our integration role, `ReadOnlyPermissionsOceanRole`, permissions to assume the role of the root account, `OrganizationalOceanRole`.

<CenterRoundedImage imgSrc='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-role-step-3.jpg' width='50%' border='1px' />

Connecting it all we get the final flow:

<CenterRoundedImage imgSrc='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-single-step-3.jpg' width='50%' border='1px' />

That's the flow you need to understand if you want to install the integration in one account.


### How does multiple accounts work?

If we look back at the flow from the single account, we see that it's basically the same, just with several member accounts that the integration role has the possibility to `assumeRole` into:

<CenterRoundedImage imgSrc='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-multi-step-1.jpg' />

And the final flow is similar:

<CenterRoundedImage imgSrc='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-multi-step-2.jpg' />

Together with the permissions and trust policies:

<CenterRoundedImage imgSrc='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-role-step-4.jpg' />

## Multiple Accounts Setup

### Integration Account

:::tip
The name of this role (not the ARN) is referenced as `integration_account` in this doc.
:::

<details>
<summary>Permissions</summary>
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "sts:AssumeRole",
            "Resource": "arn:aws:iam::<root_account>:role/<RootRole>"
        }
    ]
}
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "sts:AssumeRole",
            "Resource": "arn:aws:iam::<member_account>:role/<accountReadRoleName>"
        }
    ]
}
{
    "Statement": [
        {
            "Action": "account:ListRegions",
            "Effect": "Allow",
            "Resource": "*"
        }
    ],
    "Version": "2012-10-17"
}
```
</details>

### Member account

:::tip
The name of this role (not the ARN) is referenced as `accountReadRoleName` in this doc.
:::

<details>
<summary>Permissions</summary>
```
AWS::ReadOnlyAccess
```
</details>

<details>
<summary>Trust relationships</summary>
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "sts:AssumeRole",
            "Resource": "arn:aws:iam::<integration_account>:role/<IntegrationRole>"
        }
    ]
}
```
</details>

### Root Account

:::tip
The name of this role (not the ARN) is referenced as `organizationRoleArn` in this doc.
:::

<details>
<summary>Permissions</summary>
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "organizations:Describe*",
                "organizations:List*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "account:GetAlternateContact",
                "account:GetContactInformation",
                "account:ListRegions",
                "account:GetRegionOptStatus",
                "account:GetPrimaryEmail"
            ],
            "Resource": "*"
        }
    ]
}
```
</details>

<details>
<summary>Trust relationships</summary>
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::<integration_account>:role/<IntegrationRole>"
            },
            "Action": "sts:AssumeRole",
        }
    ]
}
```
</details>


### Expanding to multiple accounts

In order to keep adding accounts to the integration's scope, permissions must be delivered for and from each of the accounts.
For each account you want to have, you should make sure the following applies:

In each non-root account (target member account), The Role `accountReadRoleName` must exist (with the same name and permissions), with `accountReadRoleName` from the integration account in it's trust policy. See [reference](#member-account)

### Running the integration

Now, after you set-up permissions properly, You can run your integration with two new integration configurations:

1. `organizationRoleArn` - Which represents the root-account's role-assuming delegation role
2. `accountReadRoleName` - Which represents the name of the roles spread in all the accounts we want to assume-role to

These should be provided when [installing the integration](./installation.md#multiple-account-support) if you want to enable multiple account support.

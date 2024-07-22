---
sidebar_position: 1
sidebar_class_name: hidden
---

# Multi account support

This guide will provide you with the necessary tools for enabling our Ocean AWS Integration to digest multiple account's data.

## Our Permissions model

A few key concepts in the AWS's permissions model:

1. *Policy*: A document that defines permissions, specifying what actions are allowed or denied for particular resources and under what conditions.
2. *Role*: An identity with specific permissions and trust policies.
3. *AssumeRole*: An action that allows for a user / service account to impersonate a Role with temporary credentials. Allowing roles to assume-roles for other roles is enabled via `Trust Policies`.
4. *Trust Policy*: A document attached to a role that specifies which principals (users, groups, or roles) are allowed to assume the role.
5. *Account*: A container that holds all your AWS resources and services, identified uniquely by an AWS account ID.
6. *Root Account*: The primary account created when setting up an AWS environment, providing full administrative access to all AWS resources and services.

### How are permissions granted?

*Very* Briefly, a permission to perform a certain action in AWS must be granted from *both* the entity which performs the action *and* the entity which is affected from the action. This means, that if I want to add permissions to read from a S3 bucket and I'm using a certain role, I *have* to give permissions to the role from the S3's permissions policy *and* to read the S3 bucket from the Role. This is an oversimplification, but it works when trying to understand how you set permissions up from scratch. For more information, check [AWS's docs](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)

Let's assume you have 3 different accounts:

1. Our `integration account`, where you deploy the integration.
2. A `Root account`.
3. `Other account`- A third non-root account, which you want the integration to fetch resources from.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/at_first.png' width='50%' border='1px' /> <br/><br/>

First, we will create a role with permissions (If you're running the terraform installation, this will be done for you). We'll call this role `ReadOnlyPermissionsOceanRole`, with `I can read resources in this account` policy.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/add_integration_readonly.png' width='50%' border='1px' /> <br/><br/>

Then we'll go to the root account, and give it permissions to view some metadata about other accounts. We'll call this role `OrganizationalOceanRole`, and give it `I can view metadata about accounts`.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/add_organization_role.png' width='50%' border='1px' /> <br/><br/>

Then, In order for the integration's role to get accounts metadata, We'll need to give our integration role, `ReadOnlyPermissionsOceanRole`, permissions to assume the role of the root account, `OrganizationalOceanRole`.

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/added_first_trust_policy.png' width='50%' border='1px' /> <br/><br/>

That's the flow you need to understand if you want to install the integration in one account.

### How does multiple accounts work?

Multiple accounts is all about bouncing between accounts using AssumeRole to get their metadata using a role with `I can read resources in this account` permissions. We'll have to give `OrganizationalOceanRole` permissions to AssumeRole to the role `ReadOnlyPermissionsOceanRole` in the accounts we want it to digest.

:::warning
The integration expects the non-root account's role the be named the same (`accountReadRoleName` is the integration's configuration for this name).
:::

<!--- TODO: Update diagrams to show sts:AssumeRole permission as well as trust policy --->
<!--- TODO: Update diagrams to show Ocean integration role assuming accountReadRoleName in other accounts directly?  --->

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/new_account.png' width='50%' border='1px' /> <br/><br/>

## Multiple Accounts Setup

### Prerequisites

1. Name of a role in the integration's account giving it the following Policies: (This was created for you if you ran our terraform module)
   1. `arn:aws:iam::aws:policy/ReadOnlyAccess`
   2. Custom policy with `account:ListRegions` permissions
   3. `sts:AssumeRole` on `arn:aws:iam::<root_account>:role/<organizationRoleArn>`

:::tip
You can create the custom policy using the following json:

<details>
    <summary> List regions custom policy </summary>
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "account:ListRegions",
                "Resource": "*"
            }
        ]
    }
    ```
    </details>

:::

:::tip
The name of this role (not the ARN) is referenced as `accountReadRoleName` in this doc.
:::

## Walkthrough

1. Creating a new Role in the root account of your AWS. [here](#creating-the-root-account-role)
2. Give this role the right permissions. [here](#adding-sufficient-permissions-to-the-role)
3. Enabling assume role to and from this role to make cross-account requests. [here](#enabling-assumerole-to-this-role)
4. Adding multiple accounts. [here](#expanding-to-multiple-accounts)
5. Running the integration with the created resources. [here](#running-the-integration)

### Creating the root-account role

:::tip
The ARN of this role is referenced as `organizationRoleArn` in this doc.
:::

1. Go into the root account
2. Go to `IAM -> Roles`
3. Click on the top right `Create Role` button.
4. Pick `AWS Account`. Click on `next`.
5. Scroll to the bottom, click `Next`
6. Name and give tags to your new role, Click on `Create Role`
7. The new role was Created!

### Adding sufficient permissions to the role

1. Go to `IAM->Roles`
2. Click on your new created role
3. Click on `Add permissions` -> `Create inline policy`
4. Pick the JSON policy editor
5. Paste the following custom policy:

    <details>
    <summary> Root Account Policy </summary>
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AWSOrganizationsReadOnly",
                "Effect": "Allow",
                "Action": [
                    "organizations:Describe*",
                    "organizations:List*"
                ],
                "Resource": "*"
            },
            {
                "Sid": "AWSOrganizationsReadOnlyAccountData",
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

6. Click on `Next`
7. Give it a meaningful name, `Create policy`

### Enabling AssumeRole to this role

#### Add permissions from the root account

1. Go to your root-account's newly created Role
2. Click on `Trust Relationships`
3. Click on `Edit trust policy`, paste the following trust policy (Make sure to replace the `<integration_account>` to your integration's non root account ID):

    <details>
    <summary> Root Account Trust Policy </summary>
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "AWS": "arn:aws:iam::<integration_account>:role/<accountReadRoleName>"
                },
                "Action": "sts:AssumeRole",
                "Condition": {}
            }
        ]
    }
    ```
    </details>

4. Click on `Update policy`
5. Done!

#### Add permissions from the integration's account

1. Switch to your non-root account.
2. Click on the Role created for the integration (either by you or by our terraform module).
3. On the `Trust Relationships` tab, make sure that you have the following policy:

<!--- TODO: Clarify this is actually needed. The organization role doesn't have sts:AssumeRole permission in any of its policies --->

    <details>
    <summary> Non-root Account Trust Policy </summary>
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "AWS": "arn:aws:iam::<root_account>:role/<organizationRoleArn>"
                },
                "Action": "sts:AssumeRole",
                "Condition": {}
            }
        ]
    }
    ```
    </details>

5. Done!

### Expanding to multiple accounts

In order to keep adding accounts to the integration's scope, permissions must be delivered for and from each of the accounts.
For each account you want to have, you should make sure the following applies:

1. In each non-root account, The Role `accountReadRoleName` must exist (with the same name and permissions), with `accountReadRoleName` from the integration account in it's trust policy. [Reference](#add-permissions-from-the-integrations-account)

### Running the integration

Now, after you set-up permissions properly, You can run your integration with two new integration configurations:

1. `organizationRoleArn` - Which represents the root-account's role-assuming delegation role
2. `accountReadRoleName` - Which represents the name of the roles spread in all the accounts we want to assume-role to

These should be provided when [installing the integration](./installation.md#multiple-account-support) if you want to enable multiple account support.

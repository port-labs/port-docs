---
sidebar_position: 1
---

# Multi account support

This guide will provide you with the necessary tools for enabling our Ocean AWS Integration to digest multiple account's data.

## Prerequisites

1. Name of a role in the integration's account giving it the following Policies: (This was created for you if you ran our terraform module)
   1. `arn:aws:iam::aws:policy/ReadOnlyAccess`
   2. Custom policy with `account:ListRegions` permissions

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
The name of this role (not the ARN) is refernced as `accountReadRoleName` in this doc.
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

1. Go into the root account $How do i find it?
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
3. Click on `Edit trust policy`, paste the following trust policy (Make sure to replace the `<non_root_account>` to your integration's non root account ID):

    <details>
    <summary> Root Account Trust Policy </summary>
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "AWS": "arn:aws:iam::<non_root_account>:root/<accountReadRoleName>"
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

    <details>
    <summary> Root Account Trust Policy </summary>
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "AWS": "arn:aws:iam::<non_root_account>:root/<organizationRoleArn>"
                },
                "Action": "sts:AssumeRole",
                "Condition": {}
            }
        ]
    }
    ```
    </details>

4. Done!

### Expanding to multiple accounts

In order to keep adding accounts to the integration's scope, permissions must be delivered for and from each of the accounts.
For each account you want to have, you should make sure the following applies:

1. In your root-account, The additional account must in the scope of the trust policy of the `organizationRoleArn`. [Reference](#add-permissions-from-the-root-account)
2. In your non-root account, The Role `accountReadRoleName` must exist (with the same name and permissions), with `organizationRoleArn` in it's trust policy. [Reference](#add-permissions-from-the-integrations-account)

### Running the integration

Now, after you set-up permissions properly, You can run your integration with two new integration configurations:

1. `organizationRoleArn` - Which represents the root-account's role-assuming delegation role
2. `accountReadRoleName` - Which represents the name of the roles spread in all the accounts we want to assume-role to

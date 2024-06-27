---
sidebar_position: 3
---

# Multi account support

This guide will provide you with the necessary tools for enabling our Ocean AWS Integration to digest multiple account's data. There's a brief explaination about how AWS permissions model work, you can ignore that and continue to the practical walkthrough,

## Some architectural overview

### (Very) Brief to AWS's permissions model

### Permissions we're gonna request

## Walkthrough

For enabling multiaccount, there's 3 main steps:

1. Creating a new Role in the root account of your AWS. [here](#creating-the-root-account-role)
2. Give this role the right permissions. [here](#adding-sufficient-permissions-to-the-role)
3. Enabling assume role to this role to make cross-account requests.
4. Adding multiple accounts to the policies scope.

### Creating the root-account role

1. Go into the root account $How do i find it?
2. Go to `IAM->Roles`
3. Click on the top right `Create Role` button.
4. Pick `AWS Account` ($Does this makes sense? ). Click on `next`.
5. Scroll to the bottom, click `Next`
6. Name and give tags to your new role, Click on `Create Role`
7. The new role was Created!

### Adding sufficient permissions to the role

1. Go to `IAM->Roles`
2. Click on your new created role
3. Click on `Add permissions` -> `Create inline policy`
4. Pick the JSON policy editor
5. Paste the following policy:

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
                    "organizations:Describe*", // You can provide specific accounts here
                    "organizations:List*" // You can provide specific accounts here
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
2. Click on `Trust Relationships` $Screenshot here
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

#### Adding permissions from the integration's account

1. Switch to your non-root account.
2. Click on the Role created for the integration (either by you or by our terraform module)
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

### Creating the root-account role

In order to keep adding accounts to the integration's scope, permissions must be delivered for and from each of the accounts.
For each account you want to have, you should make sure the following applies:

1. In your root-account, The additional account must in the scope of the trust policy
2. In your non-root account, The 
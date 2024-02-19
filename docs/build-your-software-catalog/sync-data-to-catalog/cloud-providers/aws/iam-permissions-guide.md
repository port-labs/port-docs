---
sidebar_position: 5
tags:
  - AWS
  - IAM Permissions
  - Guide
  - Github Actions
---

# AWS IAM Permission Management

## Overview

Developers need access to different cloud resources on a daily basis. With all of your most important AWS resources being exported to Port, you can create an experience for requesting IAM permissions for your developers directly from Port.

It is important to be able to keep track of the permissions being allocated to your developers, whether it is who requested the permissions, or what permissions they requested.

In this step-by-step guide, you wou will create Port blueprints and actions, which will allow you to request and revoke IAM permissions for different AWS resources using Port. You will also be able to keep track of which permissions were requested, and who requested them.

## Prerequisites
- Prepare your Port organization's `Client ID` and `Client Secret`. To find you Port credentials, click [here](/docs/build-your-software-catalog/sync-data-to-catalog/api/api.md#find-your-port-credentials)!
- In your AWS console, [create an IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) called `port-iam-management-user` with the following IAM permissions policy:
    <details>

        <summary>IAM policy json </summary>

        ```json showLineNumbers
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "iam:CreateRole",
                        "iam:UpdateRole",
                        "iam:DeleteRole",
                        "iam:AttachRolePolicy",
                        "iam:DetachRolePolicy"
                    ],
                    "Resource": "*"
                }
            ]
        }
        ```
    </details>
- [Create access credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) for the IAM user `port-iam-management-user` (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`).

- In your Github organization, create a new repository called `port-iam-permissions`. You will use this repository to maintain your Github workflows, and other dependency files.

- Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new). Make sure to give the Port Github app permissions for the `port-iam-permissions` repository.

- Create the following secrets as [Github Actions secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions) in the `port-iam-permissions` repository:
    - `PORT_CLIENT_ID` - Your Port Client ID.
    - `PORT_CLIENT_SECRET` - Your Port Client Secret.
    - `AWS_ACCESS_KEY_ID` - The `AWS_ACCESS_KEY_ID` generated for the `port-iam-management-user` IAM user.
    - `AWS_SECRET_ACCESS_KEY` - The `AWS_SECRET_ACCESS_KEY` generated for the `port-iam-management-user` IAM user.
    - `AWS_REGION` - Your primary AWS region (you can set this to `us-east-1` if you are unsure).

## Data Model
For this guide, we will be creating [blueprints](/docs/build-your-software-catalog/define-your-data-model/define-your-data-model.md) responsible for managing and keeping track of your different AWS resources, and your developers' IAM permission requests. 

Let's create the following blueprints in your Port organization:

<details>
    <summary>`AWS Resource` blueprint</summary>

    The entities of this blueprint will represent different AWS resources we want to manage IAM permissions for.
    
    ```json showLineNumbers
    {
        "identifier": "aws_resource",
        "title": "AWS Resource",
        "icon": "AWS",
        "schema": {
            "properties": {
                "tags": {
                    "items": {
                        "type": "object"
                    },
                    "title": "Tags",
                    "type": "array",
                    "icon": "DefaultProperty"
                },
                "resource_type": {
                    "icon": "DefaultProperty",
                    "title": "Resource Type",
                    "type": "string",
                    "enum": [
                        "S3",
                        "EC2"
                    ],
                    "enumColors": {
                        "S3": "blue",
                        "EC2": "green"
                    }
                }
            },
            "required": ["resource_type"]
        },
        "mirrorProperties": {},
        "calculationProperties": {},
        "aggregationProperties": {},
        "relations": {}
    }
    ```
    </details>

<details>
    <summary>`IAM Permissions` blueprint</summary>

    The entities of this blueprint will represent different AWS IAM permissions that can be associated to an IAM Policy (`s3:DeleteBucket`, `s3:PutObject`, `ec2:StopInstances`, `ec2:TerminateInstances`...    ).

    ```json showLineNumbers
    {
        "identifier": "iam_permissions",
        "title": "IAM Permissions",
        "icon": "Lock",
        "schema": {
            "properties": {
                "resource_type": {
                    "icon": "AWS",
                    "title": "Resource Type",
                    "type": "string",
                    "enum": [
                        "S3",
                        "EC2"
                    ],
                    "enumColors": {
                        "S3": "lightGray",
                        "EC2": "lightGray"
                    }
                }
            },
            "required": ["resource_type"]
        },
        "mirrorProperties": {},
        "calculationProperties": {},
        "aggregationProperties": {},
        "relations": {}
    }
    ```
    </details>


<details>
    <summary>`Provisioned Permissions` blueprint</summary>

    The entities of this blueprint will represent the permissions which were created and managed using Port.

    ```json showLineNumbers
    {
        "identifier": "provisioned_permissions",
        "description": "This blueprint represents a set of provisioned permissions for some AWS resource",
        "title": "Provisioned Permissions",
        "icon": "Lock",
        "schema": {
            "properties": {
                "requester": {
                    "title": "Requester",
                    "type": "string",
                    "format": "user",
                    "icon": "DefaultProperty"
                },
                "iam_policy": {
                    "title": "IAM Policy",
                    "type": "object",
                    "icon": "Lock",
                    "description": "The IAM policy given for this temporary permission"
                },
                "sign_in_url": {
                    "icon": "DefaultProperty",
                    "title": "Sign-in URL",
                    "type": "string",
                    "description": "The sign-in URL for this temporary permission",
                    "format": "url"
                },
                "policy_arn": {
                    "title": "Policy ARN",
                    "type": "string",
                    "icon": "DefaultProperty"
                },
                "role_arn": {
                    "title": "Role ARN",
                    "type": "string",
                    "icon": "DefaultProperty"
                }
            },
            "required": []
        },
        "mirrorProperties": {},
        "calculationProperties": {},
        "aggregationProperties": {},
        "relations": {
            "permissions": {
                "title": "Permissions",
                "target": "iam_permissions",
                "required": false,
                "many": true
            },
            "aws_resource": {
                "title": "AWS Resource",
                "target": "aws_resource",
                "required": false,
                "many": false
            }
        }
    }
    ```
    </details>

:::note
For this guide's simplicity, the blueprints above have pre-defined options for resource types, which are `EC2` and `S3`. 

The blueprints can be modified to support for any type of AWS resource by adding extra options to the `resource_type` properties, both in the `AWS Resource` and the `IAM Permissions` blueprints.
:::

<p align="center">
<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/iam-permissions-data-model.png' width='75%' border='1px' />
</p>

## Actions
We want to be able to provision and revoke permissions for AWS resources from Port. To do so, we will need to create some [Port actions](/docs/create-self-service-experiences/create-self-service-experiences.md) in our Port organization. 

We will define Port the actions using the Port UI.

### Actions backend - Github Workflows
As mentioned in the [prerequisites](#prerequisites), in this guide we will be using [Github actions](https://docs.github.com/en/actions) as a backend for our Port actions. To do this, we will create 2 Github workflow files, and 2 JSON files which will be used as templates for developer IAM permissions. 

The files mentioned above should be created in the `port-iam-permissions` repository you set up in the prerequisites section.

In the workflow files, we will be using the [AWS CLI](https://aws.amazon.com/cli/) to interact with AWS, and to create and delete the relevant resources when managing the IAM permissions using Port.

Create the following files your `port-iam-permissions` repository, in the correct folder as appears in the filename:

<details>
    <summary>`Create permissions for AWS resource` Github workflow</summary>

    This workflow is responsible for creating new IAM permissions for an AWS resource.

    ```yaml showLineNumbers title=".github/workflows/create-iam-permissions.yaml"
    name: Create permissions for AWS resource
    on:
        workflow_dispatch:
            inputs:
                port_payload:
                    type: string
                    required: true
                    description: The Port Payload for triggering this action                

    jobs:
        create-iam-permissions:
            name: Create IAM permissions
            runs-on: ubuntu-latest
            env:
            POLICY_NAME: Permission-${{github.run_id}}
            steps:
                - uses: actions/checkout@v3
                with:
                    persist-credentials: true
                - name: Configure AWS Credentials
                uses: aws-actions/configure-aws-credentials@v4
                with:
                    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
                    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
                    aws-region: ${{ secrets.AWS_REGION }}
                - name: Create JSON for permissions
                id: create-jsons
                run: |
                    permissions=$(echo '${{ inputs.port_payload }}' | jq -c '.payload.properties.permissions')
                    echo "PERMISSIONS_ARRAY=${permissions}" >> $GITHUB_OUTPUT
                    jq -r --argjson permissions "${permissions}" --arg resource "${{fromJson(inputs.port_payload).context.entity}}/*" '.Statement[0].Action=$permissions | .Statement[0].Resource=$resource' .github/templates/iamPolicyDocument.json > temp_policy_document.json
                    jq -r --arg aws_acc_id "${{ secrets.AWS_ACCOUNT_ID }}" '.Statement[0].Principal.AWS="arn:aws:iam::"+$aws_acc_id+":root"' .github/templates/iamTrustPolicy.json > temp_trust_policy.json
                - name: Apply policies and attachments
                id: apply-policies
                run: |
                    # Create the policy
                    policy_arn=$(aws iam create-policy --policy-name $POLICY_NAME --policy-document file://temp_policy_document.json --no-cli-pager | jq '.Policy.Arn')
                    echo ${policy_arn}
                    echo "POLICY_ARN=${policy_arn}" >> $GITHUB_OUTPUT
                    # Create the role with assume-role policy
                    echo "ROLE_ARN=$(aws iam create-role --role-name $POLICY_NAME --assume-role-policy-document file://temp_trust_policy.json --no-cli-pager | jq '.Role.Arn')" >> $GITHUB_OUTPUT
                    # Attach policy to the role
                    aws iam attach-role-policy --role-name $POLICY_NAME --policy-arn arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:policy/$POLICY_NAME
                - name: Create varialbes
                id: create-variables
                run: |
                    echo "POLICY=$(cat temp_policy_document.json | jq -c '.')" >> $GITHUB_OUTPUT
                    echo "SIGN_IN_URL=https://signin.aws.amazon.com/switchrole?account=${{ secrets.AWS_ACCOUNT_ID }}&roleName=${{ env.POLICY_NAME }}&displayName=${{ env.POLICY_NAME }}" >> $GITHUB_OUTPUT
                - name: "Report permission to Port 🚢"
                uses: port-labs/port-github-action@v1
                with:
                    clientId: ${{ secrets.PORT_CLIENT_ID }}
                    clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                    identifier: ${{ env.POLICY_NAME }}
                    title: ${{ env.POLICY_NAME }}
                    blueprint: provisioned_permissions
                    properties: |
                    {
                        "iam_policy": ${{ steps.create-variables.outputs.POLICY }},
                        "requester": "${{ fromJson(inputs.port_payload).trigger.by.user.email }}",
                        "sign_in_url": "${{ steps.create-variables.outputs.SIGN_IN_URL }}",
                        "role_arn": ${{ steps.apply-policies.outputs.ROLE_ARN }},
                        "policy_arn": ${{ steps.apply-policies.outputs.POLICY_ARN }}
                    }
                    relations: |
                    {
                        "aws_resource": "${{ fromJson(inputs.port_payload).context.entity }}",
                        "permissions": ${{ steps.create-jsons.outputs.PERMISSIONS_ARRAY }}
                    }
                - uses: port-labs/port-github-action@v1
                with:
                    clientId: ${{ secrets.PORT_CLIENT_ID }}
                    clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                    operation: PATCH_RUN
                    runId: ${{ fromJson(inputs.port_payload).context.runId}}
                    logMessage: |
                    Created permission for the AWS resource "${{ fromJson(inputs.port_payload).context.entity }}"🚀
                    Requester for this permission is: ${{ fromJson(inputs.port_payload).trigger.by.user.email }}
                    The sign-in URL: ${{ steps.create-variables.outputs.SIGN_IN_URL }}
    ```
</details>

<details>
    <summary>`Create permissions for AWS resource` Github workflow</summary>

    This workflow is responsible for deleting IAM permissions for an AWS resource.

    ```yaml showLineNumbers title=".github/workflows/delete-iam-permissions.yaml"
   name: Delete IAM permissions for AWS resource
    on:
        workflow_dispatch:
            inputs:
                port_payload:
                    type: string
                    required: true
                    description: The Port Payload for triggering this action                

    jobs:
        delete-permissions:
            name: Delete IAM permissions
            runs-on: ubuntu-latest
            env:
            POLICY_ARN: ${{ fromJson(inputs.port_payload).payload.entity.properties.policy_arn }}
            steps:
                - uses: actions/checkout@v3
                with:
                    persist-credentials: true
                - name: Configure AWS Credentials
                uses: aws-actions/configure-aws-credentials@v4
                with:
                    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
                    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
                    aws-region: ${{ secrets.AWS_REGION }}
                - name: Delete policies
                id: delete-policies
                run: |
                    # Detach the policy from the role
                    aws iam detach-role-policy --role-name ${{ fromJson(inputs.port_payload).context.entity }} --policy-arn ${{ env.POLICY_ARN }}
                    # Delete the policy
                    aws iam delete-policy --policy-arn "${{ env.POLICY_ARN }}" --no-cli-pager
                    # Delete the role
                    aws iam delete-role --role-name ${{ fromJson(inputs.port_payload).context.entity }} --no-cli-pager
                - name: "Delete permission from Port 🚢"
                uses: port-labs/port-github-action@v1
                with:
                    clientId: ${{ secrets.PORT_CLIENT_ID }}
                    clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                    identifier: ${{ fromJson(inputs.port_payload).context.entity }}
                    operation: DELETE
                    blueprint: provisioned_permissions
                - uses: port-labs/port-github-action@v1
                with:
                    clientId: ${{ secrets.PORT_CLIENT_ID }}
                    clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                    operation: PATCH_RUN
                    runId: ${{ fromJson(inputs.port_payload).context.runId}}
                    logMessage: |
                    Permission "${{ fromJson(inputs.port_payload).context.entity}}" has been deleted.
                    To get more information regarding this deletion, contact "${{ fromJson(inputs.port_payload).trigger.by.user.email }}".
    ```

</details> 

<details>
    <summary>`IAM policy JSON` template file</summary>

    This file will act as a template for the generated IAM policies.

    ```json showLineNumbers title=".github/templates/iamPolicyDocument.yaml"
   {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [],
                "Resource": ""
            }
        ]
    }
    ```

</details> 
<details>
    <summary>`IAM trust policy JSON` template file</summary>

    This file will act as a template for the generated IAM trust policies.
    
    ***Replace the `<YOUR_AWS_ACCOUNT_ID>` with the AWS account ID you want to allocate permissions for.***

    ```json showLineNumbers title=".github/templates/iamTrustPolicy.yaml"
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"AWS": "arn:aws:iam::<YOUR_AWS_ACCOUNT_ID>:root"}, 
                "Action": "sts:AssumeRole"
            }
        ]
    }

    ```

</details> 

### Creating the Port actions
After creating our backend in Github, we need to create the Port actions to trigger the workflows we created.

:::tip
Don't know how to create Port actions using JSONs in the Port UI?
Click [here](https://docs.getport.io/create-self-service-experiences/setup-ui-for-action/?configure=ui#configuring-actions-in-port)!
:::

Let's create the Port actions to tirgger the workflows we just created:
<details>
    <summary>`Request permissions` Port action</summary>

    This is a `DAY-2` action on the `AWS Resource` blueprint, for requesting and provisioning new IAM permissions.

    ***Replace the `<YOUR_GITHUB_ORG>` with your Github organization.***

    ```json showLineNumbers
    {
        "identifier": "request_permissions",
        "title": "Request permissions",
        "icon": "Unlock",
        "userInputs": {
            "properties": {
                "permissions": {
                    "title": "Permissions",
                    "type": "array",
                    "items": {
                        "type": "string",
                        "format": "entity",
                        "blueprint": "iam_permissions",
                        "dataset": {
                            "combinator": "and",
                            "rules": [
                                {
                                    "property": "resource_type",
                                    "operator": "=",
                                    "value": {
                                    "jqQuery": ".entity.properties.resource_type"
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            "required": [
                "permissions"
            ],
            "order": [
                "permissions"
            ]
        },
        "invocationMethod": {
            "type": "GITHUB",
            "org": "<YOUR_GITHUB_ORG>",
            "repo": "port-iam-permissions",
            "workflow": "create-iam-permissions.yaml",
            "omitUserInputs": true,
            "omitPayload": false,
            "reportWorkflowStatus": true
        },
        "trigger": "DAY-2",
        "description": "Request permissions for an AWS resource",
        "requiredApproval": false
    }
    ```
</details>

<details>
    <summary>`Revoke permissions` Port action</summary>

    This is a `DELETE` action on the `Provisioned Permissions` blueprint, for revoking IAM permissions.

    ***Replace the `<YOUR_GITHUB_ORG>` with your Github organization.***

    ```json showLineNumbers
    {
        "identifier": "revoke_permissions",
        "title": "Revoke permissions",
        "icon": "Alert",
        "userInputs": {
            "properties": {},
            "required": []
        },
        "invocationMethod": {
            "type": "GITHUB",
            "org": "<YOUR_GITHUB_ORG>",
            "repo": "port-iam-permissions",
            "workflow": "delete-iam-permissions.yaml",
            "omitUserInputs": true,
            "omitPayload": false,
            "reportWorkflowStatus": true
        },
        "trigger": "DELETE",
        "description": "Revokes IAM permissions",
        "requiredApproval": false
    }
    ```
</details>

## Manage permissions using Port
Before we get to provisioning and revoking permissions, we have 2 things to complete:
1. Define which AWS resources we want provision permissions for.
2. Define which permissions we want to allow our developers to request and provision.

### Defining AWS resources
Managing the AWS resources we want to provision permissions for will be done via Port entities. Navigate to the [AWS Resources](https://app.getport.io/aws_resources) catalog page to create some example entities.

:::note
For this guide's simplicity, we will be creating AWS resource entities manually. This can also be done using Port's [AWS Exporter](/docs/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws.md). Go to the [Next Steps](#next-steps) section to read more.
:::

In the `AWS Resources` catalog page, click the `Manually add AWS Resource` to create an entity (or click the `+ AWS Resource` button).
The identifier of the entity is the `AWS ARN` of the AWS resource, make sure to toggle off the `Autogenerate` for the identifier.
Let's create 2 `AWS Resource` entities:

1. We will create one entity of type `S3`:
    * Title: `My awesome S3 bucket`
    * Identifier: `arn:aws:s3:::my-s3-bucket`
    * Resource Type: `S3`

2. We will create another entity of resource type `EC2`:
    * Title: `My awesome EC2 machine`
    * Identifier: `arn:aws:ec2:us-east-1:12345678:instance/i-abc123456789`
    * Resource Type: `EC2`
 
<p align="center">
<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/iam-permissions-create-aws-resource-entity.png' width='50%' border='1px' />
</p>

### Defining allowed IAM permissions
Managing the IAM permissions we want to allow our developer to provision will be done via Port entities. Navigate to the [IAM Permissions](https://app.getport.io/iam_permissions) catalog page to create some example entities.

In the `IAM Permissions` catalog page, click the `Manually add IAM Permission` to create an entity (or click the `+ IAM Permissions` button).
The identifier of the entity is the IAM Permission you want to allow to run (for example `s3:PutObject`), make sure to toggle off the `Autogenerate` for the identifier.
Let's create 2 `IAM Permissions` entities:

1. We will create one entity with the resource type `S3`:
    * Title: `Put S3 objects`
    * Identifier: `s3:PutObject`
    * Resource Type: `S3`

2. We will create another entity with the resource type `EC2`:
    * Title: `Stop EC2 Instance`
    * Identifier: `ec2:StopInstances`
    * Resource Type: `EC2`
 
<p align="center">
<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/iam-permissions-create-iam-permissions-entity.png' width='50%' border='1px' />
</p>


## Next Steps
- Install Port's AWS exporter
- Define property for enabling creations only on specific AWS resources

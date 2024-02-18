---
sidebar_position: 5
---

# AWS IAM permission management

Developers need access to different cloud resources on a daily basis. With all of your most important AWS resources being exported to Port, you can create an experience for requesting IAM permissions for your developers.

It is important to be able to keep track of the permissions being allocated to your developers, whether it is who requested the permissions, or what permissions they requested.

In this step-by-step guide, you wou will create Port blueprints and actions, which will allow you to request and revoke IAM permissions for different AWS resources using Port. You will also be able to keep track of which permissions were requested, and who requested them.

## Prerequisites
- In your Github organization, create a new repository called `port-iam-permissions`. This repository will be used to hold our Github workflows.
- Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new). Make sure to give the Port Github app permissions for the `port-iam-permissions` repository.
- In your AWS console, [create an IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) called `port-iam-management-user` with the following IAM permission policy:
    <details>

        <summary>IAM policy json </summary>

        ```json showLineNumber
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
- [Create access credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) for the IAM user `port-iam-management-user` (`AWS_ACCEESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`).

## Data Model
For this guide, we will be creating [blueprints](/docs/build-your-software-catalog/define-your-data-model/define-your-data-model.md) responsible for managing and keeping track of your different AWS resources, and your developers' IAM permission requests. 
Let's create the following blueprints in your Port organization:

<details>
    <summary>`AWS Resource` blueprint</summary>

    The entities of this blueprint will represent different AWS resources we want to manage IAM permissions for.
    
    ```json showLineNumber
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
            "required": []
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

    The entities of this blueprint will represent different AWS IAM permissions that can be associated to an IAM Policy (`s3:DeleteBucket`, `s3:PutObject`, `ec2:StopInstances`, `ec2:TerminateInstances`).

    ```json showLineNumber
    {
        "identifier": "iamPermissions",
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
            "required": []
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

    ```json showLineNumber
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
                "target": "iamPermissions",
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

To do so, we will define Port actions using the Port UI. These actions will trigger Github workflows which will be used as our actions' backends.

### Creating the Github Workflows

### Creating the Port actions
We will be creating two action, one to trigger the , and revoking them:
<details>
    <summary>`Request permissions` action</summary>

    This is a `DAY-2` actions on the `AWS Resource` blueprint, for requesting and provisioning new IAM permissions.

    ```json showLineNumber
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
                        "blueprint": "iamPermissions",
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
            "org": "<YOUR_GITHUB_ORG",
            "repo": "iam-permissions-handler",
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

- `Request Permissions` - A `DAY-2` action for the `AWS Resource` blueprint.
- `Revoke Permissions` - A `DELETE` action for the `Provisioned Permission` blueprint.



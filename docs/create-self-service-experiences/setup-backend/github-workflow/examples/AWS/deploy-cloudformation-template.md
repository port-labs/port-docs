---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Deploy AWS resources using AWS CloudFormation

This example demonstrates how to deploy an AWS resource using an [AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) template, via Port Actions.

We will use an AWS managed GitHub Action called [aws-actions/aws-cloudformation-github-deploy](https://github.com/aws-actions/aws-cloudformation-github-deploy).

## Steps 

1. Create the following GitHub action secrets:

   1. `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
   2. `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
   3. `AWS_ACCESS_KEY_ID` - AWS credentials.
   4. `AWS_SECRET_ACCESS_KEY` - AWS credentials.
   5. `AWS_REGION` - AWS region name to deploy your resources to.

2. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).

3. Create a Port blueprint with the following JSON definition (choose your desired resource):

<Tabs groupId="awsResource" queryString>
<TabItem value="ec2" label="EC2 Instance">

  <details>
    <summary>Port EC2 Instance Blueprint</summary>

```json showLineNumbers
{
  "identifier": "ec2_instance",
  "description": "AWS EC2 Instance",
  "title": "EC2 Instance",
  "icon": "EC2",
  "schema": {
    "properties": {
      "instance_name": {
        "title": "Instance Name",
        "type": "string"
      },
      "instance_type": {
        "title": "Instance Type",
        "type": "string"
      },
      "image_id": {
        "title": "Image ID",
        "type": "string"
      },
      "key_pair_name": {
        "title": "Key Pair Name",
        "type": "string"
      },
      "security_group_ids": {
        "title": "Security Group IDs",
        "type": "string"
      }
    },
    "required": [
      "instance_name",
      "instance_type",
      "image_id",
      "key_pair_name",
      "security_group_ids"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

  </details>
  </TabItem>

  <TabItem value="s3" label="S3 Bucket">
  <details>
    <summary>Port S3 Bucket Blueprint</summary>

```json showLineNumbers
{
  "identifier": "s3_bucket",
  "title": "S3 Bucket",
  "icon": "S3",
  "schema": {
    "properties": {
      "bucket_name": {
        "title": "Bucket Name",
        "type": "string",
        "minLength": 3,
        "maxLength": 63,
        "icon": "DefaultProperty"
      },
      "bucket_acl": {
        "icon": "DefaultProperty",
        "title": "Bucket ACL",
        "type": "string",
        "default": "Private"
      }
    },
    "required": ["bucket_name", "bucket_acl"]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

  </details>
  </TabItem>

  <TabItem value="rds" label="RDS Instance">
  <details>
  <summary>Port RDS Instance Blueprint</summary>

```json showLineNumbers
{
  "identifier": "rds_instance",
  "title": "RDS Instance",
  "icon": "AmazonRDS",
  "schema": {
    "properties": {
      "db_instance_identifier": {
        "title": "DB Instance Identifier",
        "type": "string",
        "minLength": 1,
        "maxLength": 63,
        "icon": "DefaultProperty"
      },
      "db_master_password": {
        "icon": "DefaultProperty",
        "title": "DB Master Password",
        "type": "string"
      },
      "db_master_username": {
        "title": "DB Master Username",
        "type": "string",
        "minLength": 1,
        "maxLength": 63,
        "icon": "DefaultProperty"
      },
      "db_engine": {
        "title": "DB Engine",
        "type": "string",
        "icon": "DefaultProperty"
      },
      "allocated_storage": {
        "title": "Allocated Storage",
        "type": "number",
        "default": 20,
        "minimum": 5,
        "maximum": 1000,
        "icon": "DefaultProperty"
      },
      "db_instance_class": {
        "title": "DB Instance Class",
        "type": "string",
        "icon": "DefaultProperty"
      }
    },
    "required": [
      "db_instance_identifier",
      "db_master_password",
      "db_master_username",
      "db_engine",
      "allocated_storage",
      "db_instance_class"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

  </details>
  </TabItem>

</Tabs>
<br/>

1. Create Port Action using the following JSON definition:

:::note
Please make sure to modify GITHUB_ORG, GITHUB_REPO and GITHUB_WORKFLOW_FILE placeholders to match your environment.
:::
<Tabs groupId="awsResource" queryString>
<TabItem value="ec2" label="EC2 Instance">

  <details>
  <summary>Port Action</summary>

```json showLineNumbers
{
  "identifier": "deploy_ec2_instance",
  "title": "Deploy EC2 Instance",
  "icon": "EC2",
  "userInputs": {
    "properties": {
      "instance_name": {
        "title": "Instance Name",
        "type": "string"
      },
      "instance_type": {
        "title": "Instance Type",
        "type": "string",
        "default": "t2.micro",
        "enum": ["t2.micro", "t2.small"],
        "enumColors": {
          "t2.micro": "lightGray",
          "t2.small": "lightGray"
        }
      },
      "image_id": {
        "title": "Image ID",
        "type": "string"
      },
      "key_pair_name": {
        "title": "Key Pair Name",
        "type": "string"
      },
      "security_group_ids": {
        "title": "Security Group IDs",
        "icon": "DefaultProperty",
        "type": "string",
        "description": "Use comma delimited values for multiple SGs"
      }
    },
    "required": [
      "instance_name",
      "instance_type",
      "image_id",
      "key_pair_name",
      "security_group_ids"
    ],
    "order": [
      "instance_name",
      "instance_type",
      "image_id",
      "key_pair_name",
      "security_group_ids"
    ]
  },
  "invocationMethod": {
    "type": "GITHUB",
    "omitPayload": false,
    "omitUserInputs": false,
    "reportWorkflowStatus": true,
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "<GITHUB_WORKFLOW_FILE>"
  },
  "trigger": "CREATE",
  "requiredApproval": false
}
```

  </details>
  </TabItem>

  <TabItem value="s3" label="S3 Bucket">
  <details>
  <summary>Port Action</summary>

```json showLineNumbers
{
  "identifier": "create_s3_bucket",
  "title": "Create S3 Bucket",
  "icon": "S3",
  "userInputs": {
    "properties": {
      "bucket_name": {
        "title": "Bucket Name",
        "type": "string",
        "minLength": 3,
        "maxLength": 63
      },
      "bucket_acl": {
        "icon": "DefaultProperty",
        "title": "Bucket ACL",
        "description": "bucket access control list",
        "type": "string",
        "default": "Private",
        "enum": [
          "Private",
          "PublicRead",
          "PublicReadWrite",
          "AuthenticatedRead"
        ],
        "enumColors": {
          "Private": "lightGray",
          "PublicRead": "lightGray",
          "PublicReadWrite": "lightGray",
          "AuthenticatedRead": "lightGray"
        }
      }
    },
    "required": ["bucket_name", "bucket_acl"],
    "order": ["bucket_name", "bucket_acl"]
  },
  "invocationMethod": {
    "type": "GITHUB",
    "omitPayload": false,
    "omitUserInputs": false,
    "reportWorkflowStatus": true,
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "<GITHUB_WORKFLOW_FILE>"
  },
  "trigger": "CREATE",
  "requiredApproval": false
}
```

  </details>
  </TabItem>

  <TabItem value="rds" label="RDS Instance">
  <details>
  <summary>Port Action</summary>

```json showLineNumbers
{
  "identifier": "deploy_rds_instance",
  "title": "Deploy RDS",
  "icon": "AmazonRDS",
  "userInputs": {
    "properties": {
      "db_instance_identifier": {
        "title": "DB Instance Identifier",
        "type": "string",
        "minLength": 1,
        "maxLength": 63
      },
      "db_master_password": {
        "title": "DB Master Password",
        "type": "string",
        "encryption": "aes256-gcm"
      },
      "db_master_username": {
        "title": "DB Master Username",
        "type": "string"
      },
      "db_engine": {
        "title": "DB Engine",
        "type": "string",
        "default": "mysql",
        "enum": ["mysql", "postgres", "sqlserver", "oracle"],
        "enumColors": {
          "mysql": "lightGray",
          "postgres": "lightGray",
          "sqlserver": "lightGray",
          "oracle": "lightGray"
        }
      },
      "allocated_storage": {
        "title": "Allocated Storage",
        "type": "number",
        "default": 20,
        "minimum": 5,
        "maximum": 1000
      },
      "db_instance_class": {
        "title": "DB Instance Class",
        "type": "string",
        "default": "db.t2.micro",
        "enum": ["db.t2.micro", "db.t2.small", "db.m4.large"],
        "enumColors": {
          "db.t2.micro": "lightGray",
          "db.t2.small": "lightGray",
          "db.m4.large": "lightGray"
        }
      }
    },
    "required": [
      "db_instance_identifier",
      "db_master_password",
      "db_master_username",
      "db_engine",
      "allocated_storage",
      "db_instance_class"
    ],
    "order": [
      "db_instance_identifier",
      "db_master_username",
      "db_master_password",
      "db_engine",
      "db_instance_class",
      "allocated_storage"
    ]
  },
  "invocationMethod": {
    "type": "GITHUB",
    "omitPayload": false,
    "omitUserInputs": false,
    "reportWorkflowStatus": true,
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "<GITHUB_WORKFLOW_FILE>"
  },
  "trigger": "CREATE",
  "requiredApproval": false
}
```

  </details>
  </TabItem>
</Tabs>
<br/>

5. Create a CloudFormation template file in your GitHub repository:
<Tabs groupId="awsResource" queryString>
<TabItem value="ec2" label="EC2 Instance">
  <details>
  <summary>AWS CloudFormation Template</summary>

```yml showLineNumbers
AWSTemplateFormatVersion: "2010-09-09"
Description: CloudFormation Template to Deploy an EC2 Instance

Parameters:
  InstanceName:
    Description: Name for the EC2 instance
    Type: String
    MinLength: 1
    MaxLength: 255
    Default: MyEC2InstanceName
    ConstraintDescription: Instance name must not be empty

  InstanceType:
    Description: EC2 instance type
    Type: String
    Default: t2.micro
    AllowedValues:
      - t2.micro
      - t2.small
      - t2.medium
      # Add more instance types as needed
    ConstraintDescription: Must be a valid EC2 instance type

  ImageId:
    Description: ID of the Amazon Machine Image (AMI) to use
    Type: AWS::EC2::Image::Id
    ConstraintDescription: Must be a valid AMI ID

  KeyPairName:
    Description: Name of the key pair for SSH access
    Type: String
    MinLength: 1
    MaxLength: 255
    ConstraintDescription: Key pair name must not be empty

  SecurityGroupIds:
    Description: List of Security Group IDs for the EC2 instance
    Type: List<AWS::EC2::SecurityGroup::Id>
    ConstraintDescription: Must be a list of valid Security Group IDs

Resources:
  EC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: !Ref InstanceType
      ImageId: !Ref ImageId
      KeyName: !Ref KeyPairName
      SecurityGroupIds: !Ref SecurityGroupIds
      Tags:
        - Key: Name
          Value: !Ref InstanceName

Outputs:
  InstanceId:
    Description: ID of the created EC2 instance
    Value: !Ref EC2Instance
```

  </details>
  </TabItem>

  <TabItem value="s3" label="S3 Bucket">
  <details>
  <summary>AWS CloudFormation Template</summary>

```yml showLineNumbers
AWSTemplateFormatVersion: "2010-09-09"
Description: CloudFormation Template for an S3 Bucket

Parameters:
  BucketName:
    Description: Name for the S3 bucket
    Type: String
    MinLength: 3
    MaxLength: 63
    ConstraintDescription: The bucket name must be between 3 and 63 characters.

  BucketAcl:
    Description: Access control for the S3 bucket
    Type: String
    Default: Private
    AllowedValues:
      - Private
      - PublicRead
      - PublicReadWrite
      - AuthenticatedRead
    ConstraintDescription: Choose a valid access control option.

Resources:
  S3Bucket:
    Type: "AWS::S3::Bucket"
    Properties:
      BucketName: !Ref BucketName
      AccessControl: !Ref BucketAcl

Outputs:
  S3BucketName:
    Description: Name of the created S3 bucket
    Value: !Ref S3Bucket
```

  </details>
  </TabItem>

  <TabItem value="rds" label="RDS Instance">
  <details>
  <summary>AWS CloudFormation Template</summary>

```yml showLineNumbers
AWSTemplateFormatVersion: "2010-09-09"
Description: CloudFormation Template for an Amazon RDS Instance

Parameters:
  DBInstanceIdentifier:
    Description: Identifier for the RDS instance
    Type: String
    MinLength: 1
    MaxLength: 63
    Default: myrdsinstance
    ConstraintDescription: The DB instance identifier must be between 1 and 63 characters.

  DBMasterUsername:
    Description: Master username for the RDS instance
    Type: String
    MinLength: 1
    MaxLength: 63
    Default: admin
    ConstraintDescription: The master username must be between 1 and 63 characters.

  DBMasterPassword:
    Description: Master password for the RDS instance
    Type: String
    NoEcho: true
    MinLength: 8
    MaxLength: 41
    Default: MySecurePassword
    ConstraintDescription: The master password must be between 8 and 41 characters.

  DBEngine:
    Description: Database engine for the RDS instance
    Type: String
    Default: mysql
    AllowedValues:
      - mysql
      - postgres
      - sqlserver
      - oracle
    ConstraintDescription: Choose a valid database engine.

  AllocatedStorage:
    Description: Allocated storage for the RDS instance (in GB)
    Type: Number
    Default: 20
    MinValue: 5
    MaxValue: 6144
    ConstraintDescription: Allocated storage must be between 5 and 6144 GB.

  DBInstanceClass:
    Description: DB instance class for the RDS instance
    Type: String
    Default: db.t2.micro
    AllowedValues:
      - db.t2.micro
      - db.t2.small
      - db.m4.large
      # Add more instance types as needed
    ConstraintDescription: Choose a valid DB instance class.

Resources:
  RDSInstance:
    Type: "AWS::RDS::DBInstance"
    Properties:
      DBInstanceIdentifier: !Ref DBInstanceIdentifier
      AllocatedStorage: !Ref AllocatedStorage
      DBInstanceClass: !Ref DBInstanceClass
      Engine: !Ref DBEngine
      MasterUsername: !Ref DBMasterUsername
      MasterUserPassword: !Ref DBMasterPassword

Outputs:
  RDSInstanceEndpoint:
    Description: Endpoint for the created RDS instance
    Value: !GetAtt RDSInstance.Endpoint.Address
```

  </details>
  </TabItem>

</Tabs>
<br/>

6. Create a workflow file under `.github/workflows/deploy-cloudformation-template.yml` with the following content:
:::note
Please make sure to modify CF_TEMPLATE_FILE placeholder to match the CloudFormation template file path.
:::
<Tabs groupId="awsResource" queryString>
<TabItem value="ec2" label="EC2 Instance">
  <details>
  <summary>GitHub workflow</summary>

```yml showLineNumbers
name: Deploy CloudFormation - EC2 Instance

on:
  workflow_dispatch:
    inputs:
      instance_name:
        required: true
        type: string
        description: instance name
      instance_type:
        required: true
        type: string
        description: instance type
      image_id:
        required: true
        type: string
        description: image id
      key_pair_name:
        required: true
        type: string
        description: key pair name
      security_group_ids:
        required: true
        type: string
        description: security group ids
      port_payload:
        required: true
        description:
          Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
        type: string

jobs:
  deploy-cloudformation-template:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS Credentials 🔒
        id: aws-credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Deploy to AWS CloudFormation
        uses: aws-actions/aws-cloudformation-github-deploy@v1
        with:
          name: ${{ inputs.instance_name }}
          template: <CF_TEMPLATE_FILE>
          parameter-overrides: >-
            InstanceName=${{ inputs.instance_name }},
            InstanceType=${{ inputs.instance_type }},
            ImageId=${{ inputs.image_id }},
            KeyPairName=${{ inputs.key_pair_name }},
            SecurityGroupIds="${{ inputs.security_group_ids }}"

      - name: UPSERT EC2 Instance Entity in Port
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{ inputs.instance_name }}
          title: ${{ inputs.instance_name }}
          team: "[]"
          icon: EC2
          blueprint: ec2_instance
          properties: |-
            {
              "instance_name": "${{ inputs.instance_name }}",
              "instance_type": "${{ inputs.instance_type }}",
              "image_id": "${{ inputs.image_id }}",
              "key_pair_name": "${{ inputs.key_pair_name }}",
              "security_group_ids": "${{ inputs.security_group_ids }}"
            }
          relations: "{}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: UPSERT
          runId: ${{fromJson(inputs.port_payload).context.runId}}
```

  </details>
  </TabItem>
  
  <TabItem value="s3" label="S3 Bucket">
  <details>
  <summary>GitHub workflow</summary>

```yml showLineNumbers
name: Deploy CloudFormation - S3 Bucket

on:
  workflow_dispatch:
    inputs:
      bucket_name:
        required: true
        type: string
        description: bucket name
      bucket_acl:
        required: true
        type: string
        description: bucket acl
      port_payload:
        required: true
        description:
          Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
        type: string

jobs:
  deploy-cloudformation-template:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS Credentials 🔒
        id: aws-credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Deploy to AWS CloudFormation
        uses: aws-actions/aws-cloudformation-github-deploy@v1
        with:
          name: ${{ inputs.bucket_name }}
          template: <CF_TEMPLATE_FILE>
          parameter-overrides: >-
            BucketName=${{ inputs.bucket_name }},
            BucketAcl=${{ inputs.bucket_acl }}

      - name: UPSERT S3 Bucket Entity in Port
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{ inputs.bucket_name }}
          title: ${{ inputs.bucket_name }}
          team: "[]"
          icon: S3
          blueprint: s3_bucket
          properties: |-
            {
              "bucket_name": "${{ inputs.bucket_name }}",
              "bucket_acl": "${{ inputs.bucket_acl }}"
            }
          relations: "{}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: UPSERT
          runId: ${{fromJson(inputs.port_payload).context.runId}}
```

  </details>
  </TabItem>

  <TabItem value="rds" label="RDS Instance">
  <details>
  <summary>GitHub workflow</summary>

```yml showLineNumbers
name: Deploy CloudFormation - RDS Instance

on:
  workflow_dispatch:
    inputs:
      db_instance_identifier:
        required: true
        type: string
        description: db_instance_identifier
      db_master_username:
        required: true
        type: string
        description: db_master_username
      db_master_password:
        required: true
        type: string
        description: db_master_password
      db_engine:
        required: true
        type: string
        description: db_engine
      db_instance_class:
        required: true
        type: string
        description: db_instance_class
      allocated_storage:
        required: true
        type: number
        description: allocated_storage
      port_payload:
        required: true
        description:
          Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
        type: string

jobs:
  deploy-cloudformation-template:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set Up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.x

      - name: Configure AWS Credentials 🔒
        id: aws-credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Decrypt aes256-gcm String
        id: decrypt_password
        run: |
          pip install --upgrade pip
          pip install pycryptodome
          python decrypt_password.py
        env:
          PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
          PASSWORD: ${{ inputs.db_master_password }}

      - name: Deploy to AWS CloudFormation
        uses: aws-actions/aws-cloudformation-github-deploy@v1
        with:
          name: ${{ inputs.db_instance_identifier }}
          template: <CF_TEMPLATE_FILE>
          parameter-overrides: >-
            DBInstanceIdentifier=${{ inputs.db_instance_identifier }},
            DBMasterUsername=${{ inputs.db_master_username }},
            DBMasterPassword=${{ steps.decrypt_password.outputs.decrypted_value }},
            DBEngine=${{ inputs.db_engine }},
            DBInstanceClass=${{ inputs.db_instance_class}},
            AllocatedStorage=${{ inputs.allocated_storage }}

      - name: UPSERT RDS Instance Entity in Port
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{ inputs.db_instance_identifier }}
          title: ${{ inputs.db_instance_identifier }}
          team: "[]"
          icon: RDS
          blueprint: rds_instance
          properties: |-
            {
              "db_instance_identifier": "${{ inputs.db_instance_identifier }}",
              "db_master_username": "${{ inputs.db_master_username }}",
              "db_master_password": "${{ inputs.db_master_password }}",
              "db_engine": "${{ inputs.db_engine }}",
              "db_instance_class": "${{ inputs.db_instance_class }}",
              "allocated_storage": ${{ inputs.allocated_storage }}
            }
          relations: "{}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: UPSERT
          runId: ${{fromJson(inputs.port_payload).context.runId}}
```

  </details>
  <br/>
  Create decrypt_password.py file with the following content to decrypt the password values:
  <details>
  <summary>Decrypt Password Script</summary>

```python showLineNumbers
import base64
import os
from Crypto.Cipher import AES

key = os.getenv('PORT_CLIENT_SECRET')[:32].encode()

encrypted_property_value = base64.b64decode(os.getenv('PASSWORD'))

iv = encrypted_property_value[:16]
ciphertext = encrypted_property_value[16:-16]
mac = encrypted_property_value[-16:]
cipher = AES.new(key, AES.MODE_GCM, iv)

# decrypt the property
decrypted_property_value = cipher.decrypt_and_verify(ciphertext, mac)
print(f"::set-output name=decrypted_value::{decrypted_property_value}")
```

  </details>
  </TabItem>

</Tabs>

<br/>

7. Trigger the action from the [Self-service](https://app.getport.io/self-serve) tab of your Port application.

## What's next?

- [Connect Port's AWS exporter](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws)
  to make sure all of the properties and entities are automatically ingested from AWS.
  - You can learn how to setup Port's AWS exporter [here](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/Installation).
  - You can see example configurations and use cases [here](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/examples).

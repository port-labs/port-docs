---
displayed_sidebar: null
description: Learn how to monitor your AWS data and storage security, including S3 bucket and RDS configurations using dashboards.
---

# Visualize your AWS storage and security configuration

This guide demonstrates how to set up a monitoring solution to gain visibility into security configurations from your AWS S3 and RDS instances using Port's **AWS** integration.

<img src="/img/guides/awsStorageAndSecurityDashboard.png" border="1px" width="100%" />
<img src="/img/guides/awsStorageAndSecurityDashboard2.png" border="1px" width="100%" />


## Common use cases

- Identify publicly accessible S3 buckets to prevent accidental data exposure.
- Track RDS instances with weak or missing encryption settings.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [AWS integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/) is installed in your account.


## Set up data model

When installing the AWS integration in Port, the `AWS Account` blueprint is created by default.  
However, the `S3` and `RDS Instance` blueprints are not created automatically so we will need to create them manually.

### Create the S3 blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:
    <details>
    <summary><b>AWS S3 blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "awsS3Bucket",
        "description": "This blueprint represents an AWS S3 bucket in our software catalog",
        "title": "S3",
        "icon": "Bucket",
        "schema": {
            "properties": {
            "link": {
                "type": "string",
                "format": "url",
                "title": "Link"
            },
            "regionalDomainName": {
                "type": "string",
                "title": "Regional Domain Name"
            },
            "versioningStatus": {
                "type": "string",
                "title": "Versioning Status",
                "enum": [
                "Enabled",
                "Suspended"
                ]
            },
            "encryption": {
                "type": "array",
                "title": "Encryption"
            },
            "lifecycleRules": {
                "type": "array",
                "title": "Lifecycle Rules"
            },
            "publicAccessConfig": {
                "type": "object",
                "title": "Public Access"
            },
            "tags": {
                "type": "array",
                "title": "Tags"
            },
            "arn": {
                "type": "string",
                "title": "ARN"
            },
            "region": {
                "type": "string",
                "title": "Region"
            },
            "blockPublicAccess": {
                "type": "boolean",
                "title": "Block Public Access"
            }
            },
            "required": []
        },
        "mirrorProperties": {},
        "calculationProperties": {},
        "aggregationProperties": {},
        "relations": {
            "account": {
            "title": "account",
            "target": "awsAccount",
            "required": false,
            "many": false
            }
        }
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


### Create the RDS instance blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:
    <details>
    <summary><b>AWS RDS instance blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "rdsInstance",
        "description": "This blueprint represents an AWS RDS DBInstance in our software catalog",
        "title": "RDS Instance",
        "icon": "AWS",
        "schema": {
            "properties": {
            "link": {
                "type": "string",
                "format": "url",
                "title": "Link"
            },
            "dbInstanceClass": {
                "type": "string",
                "title": "DB Instance Class"
            },
            "dbInstanceStatus": {
                "type": "string",
                "title": "DB Instance Status"
            },
            "engine": {
                "type": "string",
                "title": "Engine"
            },
            "storageType": {
                "type": "string",
                "title": "Storage Type"
            },
            "engineVersion": {
                "type": "string",
                "title": "Engine Version"
            },
            "port": {
                "type": "number",
                "title": "Port"
            },
            "allocatedStorage": {
                "type": "number",
                "title": "Allocated Storage"
            },
            "endpoint": {
                "type": "string",
                "title": "Endpoint"
            },
            "multiAZ": {
                "type": "boolean",
                "title": "Multi-AZ"
            },
            "deletionProtection": {
                "type": "boolean",
                "title": "Deletion Protection"
            },
            "availabilityZone": {
                "type": "string",
                "title": "Availability Zone"
            },
            "masterUsername": {
                "type": "string",
                "title": "Master Username"
            },
            "publicAccess": {
                "type": "boolean",
                "title": "Public Access"
            },
            "vpcSecurityGroups": {
                "type": "array",
                "items": {
                "type": "string"
                },
                "title": "VPC Security Groups"
            },
            "arn": {
                "type": "string",
                "title": "ARN"
            },
            "storageEncrypted": {
                "type": "boolean",
                "title": "Storage Encrypted"
            }
            },
            "required": []
        },
        "mirrorProperties": {},
        "calculationProperties": {},
        "aggregationProperties": {},
        "relations": {
            "account": {
            "title": "Account",
            "target": "awsAccount",
            "required": true,
            "many": false
            }
        }
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


## Update integration mapping

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Select the AWS integration.
3. Add the following YAML block into the editor to ingest storage data from AWS:

    <details>
    <summary><b>AWS integration configuration (Click to expand)</b></summary>

    ```yaml showLineNumbers
    deleteDependentEntities: true
    createMissingRelatedEntities: true
    enableMergeEntity: true
    resources:
        - kind: AWS::Organizations::Account
            selector:
            query: 'true'
            port:
            entity:
                mappings:
                identifier: .Id
                title: .Name
                blueprint: '"awsAccount"'
                properties:
                    arn: .Arn
                    email: .Email
                    status: .Status
                    joined_method: .JoinedMethod
                    joined_timestamp: .JoinedTimestamp | sub(" "; "T")
        - kind: AWS::S3::Bucket
            selector:
            query: 'true'
            useGetResourceAPI: true
            port:
            entity:
                mappings:
                identifier: .Identifier
                title: .Identifier
                blueprint: '"awsS3Bucket"'
                properties:
                    regionalDomainName: .Properties.RegionalDomainName
                    encryption: .Properties.BucketEncryption.ServerSideEncryptionConfiguration
                    lifecycleRules: .Properties.LifecycleConfiguration.Rules
                    publicAccessConfig: .Properties.PublicAccessBlockConfiguration
                    blockPublicAccess: >-
                    .Properties.PublicAccessBlockConfiguration | (.BlockPublicAcls and
                    .IgnorePublicAcls and .BlockPublicPolicy and
                    .RestrictPublicBuckets)
                    tags: .Properties.Tags
                    arn: .Properties.Arn
                    region: .Properties.RegionalDomainName | capture(".*\\.(?<region>[^\\.]+)\\.amazonaws\\.com") | .region
                    link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn=" + .Arn
                relations:
                    account: .__AccountId
    - kind: AWS::RDS::DBInstance
        selector:
        query: 'true'
        useGetResourceAPI: 'true'
        port:
        entity:
            mappings:
            identifier: .Identifier
            title: .Properties.DBInstanceIdentifier
            blueprint: '"rdsInstance"'
            properties:
                link: 'https://console.aws.amazon.com/go/view?arn=' + .Properties.DBInstanceArn
                dbInstanceClass: .Properties.DBInstanceClass
                dbInstanceStatus: .Properties.DBInstanceStatus
                engine: .Properties.Engine
                storageType: .Properties.StorageType
                engineVersion: .Properties.EngineVersion
                port: .Properties.Endpoint.Port
                allocatedStorage: .Properties.AllocatedStorage
                endpoint: .Properties.Endpoint.Address
                multiAZ: .Properties.MultiAZ
                deletionProtection: .Properties.DeletionProtection
                availabilityZone: .Properties.AvailabilityZone
                masterUsername: .Properties.MasterUsername
                publicAccess: .Properties.PubliclyAccessible
                vpcSecurityGroups: .Properties.VpcSecurityGroups
                arn: .Properties.DBInstanceArn
                storageEncrypted: .Porperties.StorageEncrypted
            relations:
                account: .__AccountId
    ```
    </details>
    
4. Click `Save & Resync` to apply the mapping.


## Visualize metrics

Once the AWS storage data is synced, we can create a dedicated dashboard in Port to monitor and analyze security configurations and access controls using customizable widgets.

### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **AWS Storage Security Overview**.
5. Select the `AWS` icon.
6. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize security insights from our AWS storage.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>RDS by availability zone (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `RDS by availability zone` (add the `AmazonRDS` icon).
3. Choose the **RDS Instance** blueprint.
4. Under `Breakdown by property`, select the **Availability Zone** property 
   <img src="/img/guides/RDSByAvailabilityZone.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b>RDS by public access (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `RDS by public access` (add the `AmazonRDS` icon).
3. Choose the **RDS Instance** blueprint.
4. Under `Breakdown by property`, select the **Public Access** property 
   <img src="/img/guides/RDSByPublicAccess.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b>Unprotected RDS by engine (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Unprotected RDS by engine` (add the `AmazonRDS` icon).
3. Choose the **RDS Instance** blueprint.
4. Under `Breakdown by property`, select the **Engine** property.
5. Add this JSON to the **Additional filters** editor to filter unprotected RDS instances:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"deletionProtection",
                    "operator":"=",
                    "value":false
                }
            ]
        }
    ]
    ```
   <img src="/img/guides/RDSByEngine.png" width="50%"/>

6. Click **Save**.

</details>


<details>
<summary><b>RDS without SSL (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `RDS without SSL` (add the `AmazonRDS` icon).
3. Select `Count entities` **Chart type** and choose **RDS Instance** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter RDS instances without SSL configuration:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"storageEncrypted",
                    "operator":"=",
                    "value":false
                }
            ]
        }
    ]
    ```
   <img src="/img/guides/RDSWithoutSSL.png" width="50%"/>

6. Click `Save`.

</details>

<details>
<summary><b>S3 buckets by public access (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `S3 by public access` (add the `S3` icon).
3. Choose the **S3** blueprint.
4. Under `Breakdown by property`, select the **Block Public Access** property 
   <img src="/img/guides/S3ByPublicAccess.png" width="50%" />

5. Click **Save**.

</details>


<details>
<summary><b>Unencrypted S3 buckets (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Unencrypted S3 buckets` (add the `S3` icon).
3. Select `Count entities` **Chart type** and choose **S3** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter S3 buckets without encryption configurations:
    ```json showlineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"encryption",
                    "operator":"isNotEmpty"
                }
            ]
        }
    ]
    ```
   <img src="/img/guides/UnencryptedS3.png" width="50%"/>

6. Click `Save`.

</details>
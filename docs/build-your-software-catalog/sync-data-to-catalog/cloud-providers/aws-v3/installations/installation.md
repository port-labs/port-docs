---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Installation

This guide will walk you through installing AWS Hosted by Port in your Port environment.

## Installation Process

AWS Hosted by Port is available through **Port's Ocean SaaS platform** and requires you to create IAM roles in your AWS accounts to grant the integration access to read your resources.

:::info How the Integration Works
AWS Hosted by Port runs on Port's infrastructure and connects to your AWS accounts using **OIDC (OpenID Connect)** authentication. This means:
- No need to share AWS access keys or secrets
- More secure than traditional access key authentication
- Uses IAM roles with temporary credentials
- Works with AWS Organizations for multi-account setups
- **Zero maintenance required** - Port handles all infrastructure management
- **Periodic synchronization** - Keeps your Port catalog up-to-date with your AWS resources
:::

:::warning Beta Access Required
AWS Hosted by Port is currently in beta mode. Contact your Port representative to request access to this integration before proceeding with installation.
:::

## Supported AWS Resources

AWS Hosted by Port currently supports the following AWS resource types:

- **S3 Buckets**: Complete bucket information including properties, tags, and metadata
- **ECS Clusters**: Cluster details, services, and task definitions  
- **EC2 Instances**: Instance information, security groups, and networking details

:::info More Resource Types Coming Soon
We're actively working on adding support for additional AWS resource types to provide comprehensive coverage of your AWS infrastructure.
:::

## Installation Methods

<Tabs groupId="installation-method" queryString values={[
{label: "Single Account", value: "single-account"},
{label: "Multi-Account (Organizations)", value: "multi-account"}
]}>

<TabItem value="single-account" label="Single Account">

### Single Account Installation

For a single AWS account, you'll deploy a CloudFormation stack that creates the necessary IAM roles.

#### Step 1: Deploy CloudFormation Stack

1. **Access the CloudFormation Template**:
   - Navigate to the [single-account integration template](https://port-cloudformation-templates.s3.eu-west-1.amazonaws.com/stable/ocean/aws-v3/single-account-integration.yaml)
   - Download the template or copy the S3 URL for direct deployment

2. **Deploy via AWS Console**:
   - Go to [AWS CloudFormation](https://console.aws.amazon.com/cloudformation/) in your AWS Console
   - Click **Create Stack** → **With new resources (standard)**
   - Choose **Template is ready** → **Upload a template file**
   - Upload the downloaded template or paste the S3 URL directly

3. **Configure Stack Parameters**:
   
   **Required Parameters**:
   - **Port Organisation ID**: Your Port organization ID (e.g., `org_1234567890`)
     - *Find this in Port → Settings → General*
   - **Integration Identifier**: A unique identifier for this integration (e.g., `aws-v3-prod`)
     - *Use lowercase letters, numbers, and hyphens only*
   
   **Optional Parameters**:
   - **Custom Role Name**: Leave empty for auto-generated name, or specify a custom name
     - *Default: `PortIntegrationRole-{IntegrationIdentifier}`*
   
   **Advanced Parameters** (keep defaults unless you have specific requirements):
   - **OIDC Provider URL**: Keep the default value (do not change)
   - **OIDC JWT Subject**: Keep the default value (do not change)
   - **Create OIDC Provider**: Set to `true` (unless you already have one)

#### Step 2: Configure Integration in Port

1. **Navigate to Port Ocean**:
   - Go to your Port Ocean environment
   - Navigate to **Settings** → **Integrations**

2. **Add AWS Hosted by Port Integration**:
   - Click **+ Add Integration**
   - Select **AWS Hosted by Port** from the cloud providers section
   - Enter your integration details:
     - **Integration Identifier**: Must match what you used in CloudFormation
       - *Example: `aws-v3-production`*
     - **AWS Account ID**: Your AWS account ID (12-digit number)
       - *Find this in AWS Console → Account menu*
     - **AWS Region**: Your primary AWS region
       - *Example: `us-east-1`, `us-west-2`, `eu-west-1`*

3. **Verify Connection**:
   - Port will automatically detect the IAM role created by CloudFormation
   - The integration will start discovering your AWS resources

:::tip Why Can't I Use an Existing Role?
AWS Hosted by Port requires specific OIDC trust relationships and permissions that are automatically configured by the CloudFormation template. Using an existing role would require manual configuration of these complex trust relationships, which is why we provide the CloudFormation template to ensure proper setup.
:::

</TabItem>

<TabItem value="multi-account" label="Multi-Account (Organizations)">

### Multi-Account Installation with AWS Organizations

For multiple AWS accounts, you'll use AWS Organizations and deploy the integration across multiple accounts using CloudFormation StackSets.

:::info Understanding AWS Organizations
- **Master Account**: The main account that manages your organization (also called "management account")
- **Member Accounts**: Individual AWS accounts in your organization
- **Organizational Units (OUs)**: Logical groupings of accounts (like folders in a file system)
- **OU IDs**: Unique identifiers for organizational units (format: `ou-abcd-12345678`)

**Example Organization Structure**:
```
Master Account (123456789012)
├── Production OU (ou-prod-12345678)
│   ├── Account: prod-app (234567890123)
│   └── Account: prod-db (345678901234)
├── Staging OU (ou-staging-87654321)
│   └── Account: staging (456789012345)
└── Development OU (ou-dev-11223344)
    └── Account: dev (567890123456)
```
:::

#### Step 1: Prepare Your Organization

1. **Access Master Account**:
   - Log into your AWS Organizations master account
   - Navigate to [AWS Organizations](https://console.aws.amazon.com/organizations/) service

2. **Find Your OU IDs**:
   - Go to **Organizational units** in the left sidebar
   - Click on each organizational unit you want to target
   - Copy the OU ID from the details page (format: `ou-abcd-12345678`)
   - You can also target specific account IDs if needed

:::tip Finding OU IDs
1. Go to AWS Organizations → Organizational units
2. Click on the OU name (e.g., "Production")
3. Copy the OU ID from the details (e.g., `ou-prod-12345678`)
4. Repeat for each OU you want to include

**Common OU Naming Patterns**:
- `ou-prod-12345678` (Production)
- `ou-staging-87654321` (Staging)  
- `ou-dev-11223344` (Development)
- `ou-shared-55667788` (Shared Services)
:::

:::caution Master Account Access Required
You must run the multi-account installation from your AWS Organizations **master account**. This is because only the master account can deploy StackSets across member accounts.
:::

#### Step 2: Deploy Multi-Account CloudFormation Stack

1. **Access the CloudFormation Template**:
   - Navigate to the [multi-account integration template](https://port-cloudformation-templates.s3.eu-west-1.amazonaws.com/stable/ocean/aws-v3/multi-account-integration.yaml)

2. **Deploy via AWS Console**:
   - In your **master account**, go to AWS CloudFormation
   - Click **Create Stack** → **With new resources (standard)**
   - Choose **Template is ready** → **Upload a template file**
   - Upload the template or use the S3 URL directly

3. **Configure Stack Parameters**:

   **Scope of Rollout**:
   - **Target OU IDs**: Comma-separated list of OU IDs
     - *Example: `ou-prod-12345678,ou-staging-87654321`*
   - **Account Scope**: Choose from:
     - `ALL`: All accounts in the specified OUs
     - `INTERSECTION`: Only accounts that are in both the OUs and the specified account list
     - `DIFFERENCE`: All accounts in OUs except those in the specified account list
   - **Target Account IDs**: Comma-separated list of specific account IDs
     - *Example: `123456789012,098765432109`*

   **Port Identifiers**:
   - **Port Organization ID**: Your Port organization ID
     - *Example: `org_abc123def456`*
   - **Integration Identifier**: A unique identifier for this integration
     - *Example: `aws-v3-multi-account`*

   **IAM Role Settings**:
   - **Custom Role Name**: Leave empty for auto-generated name, or specify a custom name
     - *Default: `PortIntegrationRole-{IntegrationIdentifier}`*

   **OIDC Settings** (keep defaults):
   - **OIDC Provider URL**: Keep the default value (do not change)
   - **OIDC JWT Subject**: Keep the default value (do not change)

   **Advanced**:
   - **StackSet Name**: Custom name for the StackSet
     - *Default: `Port-Integration-v3`*
   - **Create OIDC Provider**: Set to `true` (unless you already have one)

:::tip Account Filtering Examples

**Scenario 1: Deploy to all production accounts**
- Target OU IDs: `ou-prod-12345678`
- Account Scope: `ALL`
- Target Account IDs: (leave empty)
- *Result: All accounts in the Production OU*

**Scenario 2: Deploy to specific accounts only**
- Target OU IDs: `ou-prod-12345678,ou-staging-87654321`
- Account Scope: `INTERSECTION`
- Target Account IDs: `123456789012,234567890123`
- *Result: Only these 2 accounts if they're in the specified OUs*

**Scenario 3: Deploy to all accounts except test accounts**
- Target OU IDs: `ou-prod-12345678`
- Account Scope: `DIFFERENCE`
- Target Account IDs: `345678901234,456789012345`
- *Result: All accounts in Production OU except the 2 test accounts*

:::

#### Step 3: Monitor Deployment

1. **Check StackSet Status**:
   - Go to **CloudFormation** → **StackSets** in your master account
   - Monitor the deployment progress across all target accounts
   - Ensure all stack instances show "CURRENT" status

2. **Verify IAM Roles**:
   - Check that the IAM roles were created in each target account
   - Verify the roles have the correct trust relationships

#### Step 4: Configure Integration in Port

1. **Navigate to Port Ocean**:
   - Go to your Port Ocean environment
   - Navigate to **Integrations**

2. **Add AWS Hosted by Port Integration**:
   - Click **+ Add Integration**
   - Select **AWS Hosted by Port** from the cloud providers section
   - Enter your integration details:
     - **Integration Identifier**: Must match what you used in CloudFormation
     - **AWS Organization ID**: Your AWS Organizations ID
     - **Target Accounts**: Specify which accounts to include

3. **Verify Multi-Account Connection**:
   - Port will automatically detect the IAM roles across all accounts
   - The integration will start discovering resources from all configured accounts

</TabItem>

</Tabs>

## Verify Installation

After installation, verify that the integration is working:

1. **Check Integration Status**:
   - Go to **Settings** → **Integrations**
   - Verify the AWS Hosted by Port integration shows as "Active"
   - Check for any error messages

2. **Verify Data Flow**:
   - Go to **Software Catalog**
   - Look for entities created by the integration
   - Verify that AWS resources are being imported correctly


## Troubleshooting

### Common Installation Issues

#### CloudFormation Stack Creation Failures

**Error**: `Stack creation failed: CREATE_FAILED`

**Solutions**:
- **Invalid Port Organization ID**: Verify the format is `org_` followed by alphanumeric characters
- **Duplicate Integration Identifier**: Use a unique identifier that hasn't been used before
- **Insufficient IAM Permissions**: Ensure your AWS user has CloudFormation and IAM permissions
- **OIDC Provider Already Exists**: Set "Create OIDC Provider" to `false` if you already have one

#### StackSet Deployment Failures (Multi-Account)

**Error**: `StackSet deployment failed on account X`

**Solutions**:
- **Target Account Not in OU**: Verify the account is actually in the specified organizational unit
- **Insufficient Permissions**: Ensure the master account has StackSets permissions
- **Account Suspended**: Check if the target account is suspended or has billing issues

#### Port Integration Connection Issues

**Error**: `Integration shows "Failed" status in Port`

**Solutions**:
- **Integration Identifier Mismatch**: Ensure the identifier in Port matches CloudFormation exactly
- **IAM Role Not Found**: Verify the CloudFormation stack completed successfully
- **OIDC Trust Relationship Issues**: Check that the OIDC provider was created correctly

### Getting Help

If you encounter issues during installation:

1. **Check Logs**: Review integration logs for error details
2. **Documentation**: Refer to the [AWS Hosted by Port documentation](../aws-v3.md)
3. **Community**: Ask questions in the [Port Community Forum](https://github.com/port-labs/port/discussions)
4. **Support**: Contact Port support for enterprise customers

## Next Steps

After successful installation:

1. **Configure Multiple Accounts**: Set up [multi-account support](./multi_account.md)
2. **Customize Mapping**: Learn about [advanced configuration](../aws-v3.md#advanced-configuration)
3. **Set Up Monitoring**: Configure [monitoring and alerting](../aws-v3.md#troubleshooting)
4. **Optimize Performance**: Review [performance tuning](../aws-v3.md#resource-discovery-optimization)


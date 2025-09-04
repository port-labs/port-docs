---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Installation

This guide will walk you through installing AWS Hosted by Port in your Port environment.

## Prerequisites

Before installing AWS Hosted by Port, ensure you have:

1. **Port Ocean Account**: Access to Port's Ocean SaaS platform
2. **AWS Account(s)**: AWS account(s) with appropriate permissions
3. **AWS Organizations** (for multi-account): If using multiple accounts, set up AWS Organizations
4. **CloudFormation Access**: Ability to deploy CloudFormation stacks in your AWS accounts
5. **Beta Access**: Contact your Port representative to request access to this beta feature

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

2. **Deploy via AWS Console**:
   - Go to AWS CloudFormation in your AWS Console
   - Click **Create Stack** → **With new resources (standard)**
   - Choose **Template is ready** → **Upload a template file**
   - Upload the template or use the S3 URL directly

3. **Configure Stack Parameters**:
   - **Port Organisation ID**: Your Port organization ID (e.g., `org_1234567890`)
   - **Integration Identifier**: A unique identifier for this integration (e.g., `aws-v3-prod`)
   - **Custom Role Name**: Leave empty for auto-generated name, or specify a custom name
   - **OIDC Provider URL**: Keep the default value (do not change)
   - **OIDC JWT Subject**: Keep the default value (do not change)
   - **Create OIDC Provider**: Set to `true` (unless you already have one)

#### Step 2: Configure Integration in Port

1. **Navigate to Port Ocean**:
   - Go to your Port Ocean environment
   - Navigate to **Integrations**

2. **Add AWS Hosted by Port Integration**:
   - Click **+ Add Integration**
   - Select **AWS Hosted by Port** from the cloud providers section
   - Enter your integration details:
     - **Integration Identifier**: Must match what you used in CloudFormation
     - **AWS Account ID**: Your AWS account ID
     - **AWS Region**: Your primary AWS region

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
- **Master Account**: The main account that manages your organization
- **Member Accounts**: Individual AWS accounts in your organization
- **Organizational Units (OUs)**: Logical groupings of accounts (like folders)
- **OU IDs**: Unique identifiers for organizational units (e.g., `ou-abcd-12345678`)
:::

#### Step 1: Prepare Your Organization

1. **Access Master Account**:
   - Log into your AWS Organizations master account
   - Navigate to **AWS Organizations** service

2. **Identify Target OUs**:
   - Go to **Organizational units** in the AWS Organizations console
   - Note the OU IDs you want to include (e.g., `ou-abcd-12345678`)
   - You can also target specific account IDs if needed

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
   - **Target OU IDs**: Comma-separated list of OU IDs (e.g., `ou-abcd-12345678,ou-efgh-87654321`)
   - **Account Scope**: Choose from:
     - `ALL`: All accounts in the specified OUs
     - `INTERSECTION`: Only accounts that are in both the OUs and the specified account list
     - `DIFFERENCE`: All accounts in OUs except those in the specified account list
   - **Target Account IDs**: Comma-separated list of specific account IDs (e.g., `123456789012,098765432109`)

   **Port Identifiers**:
   - **Port Organization ID**: Your Port organization ID (e.g., `org_1234567890`)
   - **Integration Identifier**: A unique identifier for this integration (e.g., `aws-v3-multi`)

   **IAM Role Settings**:
   - **Custom Role Name**: Leave empty for auto-generated name, or specify a custom name

   **OIDC Settings**:
   - **OIDC Provider URL**: Keep the default value (do not change)
   - **OIDC JWT Subject**: Keep the default value (do not change)

   **Advanced**:
   - **StackSet Name**: Custom name for the StackSet (default: `Port-Integration-v3`)
   - **Create OIDC Provider**: Set to `true` (unless you already have one)

:::tip Account Filtering Examples
- **All accounts in OU**: Set Account Scope to `ALL`, leave Target Account IDs empty
- **Specific accounts only**: Set Account Scope to `INTERSECTION`, specify account IDs
- **All except specific accounts**: Set Account Scope to `DIFFERENCE`, specify account IDs to exclude
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

## Post-Installation Configuration

### 1. Verify Installation

After installation, verify that the integration is working:

1. **Check Integration Status**:
   - Go to **Settings** → **Integrations**
   - Verify the AWS-v3 integration shows as "Active"
   - Check for any error messages

2. **Verify Data Flow**:
   - Go to **Software Catalog**
   - Look for entities created by the integration
   - Verify that AWS resources are being imported correctly

### 2. Configure Blueprints

The integration creates default blueprints, but you may want to customize them:

1. **Review Default Blueprints**:
   - `awsAccount`: For AWS accounts
   - `cloudResource`: For general AWS resources

2. **Customize Blueprints**:
   - Add additional properties as needed
   - Configure relations between resources
   - Set up proper identifiers and titles

### 3. Set Up Monitoring

Configure monitoring for your integration:

1. **Enable Logging**:
   - Set up log aggregation
   - Configure log levels
   - Set up alerts for errors

2. **Monitor Performance**:
   - Track API call rates
   - Monitor resource discovery performance
   - Set up dashboards for key metrics

## Troubleshooting

### Common Installation Issues

#### 1. Authentication Errors

**Problem**: AWS authentication failures

**Solution**:
- Verify AWS credentials are correct
- Check IAM permissions
- Ensure the AWS region is properly configured

#### 2. Port API Errors

**Problem**: Cannot connect to Port API

**Solution**:
- Verify Port credentials
- Check network connectivity
- Ensure the Port base URL is correct

#### 3. Resource Discovery Issues

**Problem**: Resources not being discovered

**Solution**:
- Check AWS permissions for resource listing
- Verify the resource kinds in your configuration
- Review selector queries

### Getting Help

If you encounter issues during installation:

1. **Check Logs**: Review integration logs for error details
2. **Documentation**: Refer to the [AWS-v3 documentation](../aws-v3.md)
3. **Community**: Ask questions in the [Port Community Forum](https://github.com/port-labs/port/discussions)
4. **Support**: Contact Port support for enterprise customers

## Next Steps

After successful installation:

1. **Configure Multiple Accounts**: Set up [multi-account support](./multi_account.md)
2. **Customize Mapping**: Learn about [advanced configuration](../aws-v3.md#advanced-configuration)
3. **Set Up Monitoring**: Configure [monitoring and alerting](../aws-v3.md#troubleshooting)
4. **Optimize Performance**: Review [performance tuning](../aws-v3.md#resource-discovery-optimization)

---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Installation

This guide will walk you through installing AWS Hosted by Port in your Port environment.

## Installation Process

AWS Hosted by Port is available through **Port's Ocean SaaS platform**. The installation process is simple - you only need to create IAM roles in your AWS accounts to grant the integration access to read your resources. The integration handles everything else automatically.

:::info How the Integration Works
AWS Hosted by Port runs on **Port's servers** and connects to your AWS accounts using **OIDC (OpenID Connect)** authentication. Here's how it works:

1. **You create IAM roles** in your AWS accounts using our CloudFormation templates
2. **Port's servers assume these roles** using OIDC to get temporary AWS credentials
3. **Port discovers your AWS resources** by calling AWS APIs with the assumed roles
4. **Port exports the resources** to your Port account in the software catalog
5. **Port periodically syncs** to keep your catalog up-to-date with your AWS infrastructure
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

#### Step 1: Access AWS Console

1. **Log into your AWS account**:
   - Go to [AWS Console](https://console.aws.amazon.com/)
   - Sign in with your AWS account credentials

#### Step 2: Deploy CloudFormation Stack

1. **Access the CloudFormation Template**:
   - Go to [Port Data Sources](https://app.getport.io/settings/data-sources)
   - Click **+ Add Integration** → **AWS Hosted by Port**
   - Select **Single Account** and click the **"Click here"** link in step 3
   - This will open CloudFormation with pre-configured parameters

2. **Deploy via AWS Console**:
   - In the CloudFormation console, review the pre-configured parameters
   - Scroll down to the bottom of the page
   - Check the box **"I acknowledge that AWS CloudFormation might create IAM resources with custom names"**
   - Click **Create Stack**


#### Step 3: Configure Integration in Port

1. **Navigate to Port**:
   - Go to your Port environment
   - Navigate to **[Port Data Sources](https://app.getport.io/settings/data-sources)**

2. **Add AWS Hosted by Port Integration**:
   - Click **+ Add Integration**
   - Select **AWS Hosted by Port** from the cloud providers section

3. **Get the Role ARN**:
   - After CloudFormation deployment completes, go to the **Outputs** tab
   - Copy the **Role ARN** value

4. **Complete Integration Setup**:
   - Return to the Port integration form
   - Paste the **Role ARN** into the **Account Role Arn** field
   - Click **Done**

5. **Verify Connection**:
   - Port will automatically detect the IAM role created by CloudFormation
   - The integration will start discovering your AWS resources

:::tip Why Can't I Use an Existing Role?
AWS Hosted by Port requires specific OIDC trust relationships and permissions that are automatically configured by the CloudFormation template. Using an existing role would require manual configuration of these complex trust relationships, which is why we provide the CloudFormation template to ensure proper setup.

**Learn More**: For detailed information about the IAM role architecture and permissions, see the [IAM Role Architecture](./iam-role-architecture.md) guide.
:::

</TabItem>

<TabItem value="multi-account" label="Multi-Account (Organizations)">

### Multi-Account Installation with AWS Organizations

For multiple AWS accounts, you'll use AWS Organizations and deploy the integration across multiple accounts using CloudFormation StackSets.

:::info Understanding AWS Organizations
- **Management Account**: The main account that manages your organization (also called "master account")
- **Member Accounts**: Individual AWS accounts in your organization
- **Organizational Units (OUs)**: Logical groupings of accounts (like folders in a file system)
- **OU IDs**: Unique identifiers for organizational units (format: `ou-abcd-12345678`)
- **Root**: The top-level container for all accounts and OUs (format: `r-xxxxxxxxx`)

**Example Organization Structure**:
```
Root (r-123456789)
├── Management Account (123456789012)
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

1. **Access Management Account**:
   - Log into your AWS Organizations management account
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

:::caution Management Account Access Required
You must run the multi-account installation from your AWS Organizations **management account**. This is because only the management account can deploy StackSets across member accounts.
:::

#### Step 2: Deploy Multi-Account CloudFormation Stack

1. **Access the CloudFormation Template**:
   - Go to [Port Data Sources](https://app.getport.io/settings/data-sources)
   - Click **+ Add Integration** → **AWS Hosted by Port**
   - Select **Multiple Accounts** and click the **"Click here"** link in step 3
   - This will open CloudFormation with pre-configured parameters

2. **Deploy via AWS Console**:
   - In the CloudFormation console, review the pre-configured parameters
   - Scroll down to the bottom of the page
   - Check the box **"I acknowledge that AWS CloudFormation might create IAM resources with custom names"**
   - Click **Create Stack**


#### Step 3: Monitor Deployment

1. **Check StackSet Status**:
   - Go to **CloudFormation** → **StackSets** in your management account
   - Monitor the deployment progress across all target accounts
   - Ensure all stack instances show "CREATE_COMPLETE" status

2. **Verify IAM Roles**:
   - Check that the IAM roles were created in each target account

#### Step 4: Configure Integration in Port

1. **Navigate to Port**:
   - Go to your Port environment
   - Navigate to **[Port Data Sources](https://app.getport.io/settings/data-sources)**

2. **Add AWS Hosted by Port Integration**:
   - Click **+ Add Integration**
   - Select **AWS Hosted by Port** from the cloud providers section

3. **Get the Role ARN**:
   - After CloudFormation deployment completes, go to the **Outputs** tab
   - Copy the **PortintegrationRoleArn** value

4. **Complete Integration Setup**:
   - Return to the Port integration form
   - Paste the **Management Account Role ARN** into the **Account Role Arn** field
   - Click **Done**

5. **Verify Multi-Account Connection**:
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


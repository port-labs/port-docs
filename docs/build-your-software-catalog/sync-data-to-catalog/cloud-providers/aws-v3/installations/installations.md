---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Installation

:::warning Beta Access Required
AWS Hosted by Port is currently in beta mode. Contact your Port representative to request access to this integration before proceeding with installation.
:::

AWS Hosted by Port is available through **Port's Ocean SaaS platform**.  

The installation process is simple - you only need to create IAM roles in your AWS accounts to grant the integration access to read your resources. The integration handles everything else automatically.

**How the integration works:**

AWS Hosted by Port runs on **Port's servers** and connects to your AWS accounts using **OIDC (OpenID Connect)** authentication. Here's how it works:

1. **You create IAM roles** in your AWS accounts using our CloudFormation templates.
2. **Port's servers assume these roles** using OIDC to get temporary AWS credentials.
3. **Port discovers your AWS resources** by calling AWS APIs with the assumed roles.
4. **Port exports the resources** to your Port account in the software catalog.
5. **Port periodically syncs** to keep your catalog up-to-date with your AWS infrastructure.

## Installation methods

<Tabs groupId="installation-method" queryString values={[
{label: "Single Account", value: "single-account"},
{label: "Multi-Account (Organizations)", value: "multi-account"}
]}>

<TabItem value="single-account" label="Single Account">

For a single AWS account, you'll deploy a CloudFormation stack that creates the necessary IAM roles.

<h4>Step 1: Access AWS Console</h4>

-  **Log into your AWS account**:
   - Go to [AWS Console](https://console.aws.amazon.com/).
   - Sign in with your AWS account credentials.

<h4>Step 2: Deploy CloudFormation Stack</h4>

- **Access the CloudFormation Template**:
   - Go to [Data Sources](https://app.getport.io/settings/data-sources) page.
   - Click on the `+ Data source` button in the top right corner of the page.
   - Select **AWS Hosted by Port** from the cloud providers section.
   - Select **Single Account** and click the `Click here` link in step 3.
   - This will open CloudFormation with pre-configured parameters.

- **Deploy via AWS Console**:
   - In the CloudFormation console, review the pre-configured parameters.
   - Scroll down to the bottom of the page.
   - Check the box that states **"I acknowledge that AWS CloudFormation might create IAM resources with custom names"**.
   - Click `Create Stack`.


<h4>Step 3: Configure Integration in Port</h4>

- Navigate to the [Data Sources](https://app.getport.io/settings/data-sources) page of your portal.

- **Add AWS Hosted by Port Integration**:
   - Click on the `+ Data source` button in the top right corner of the page.
   - Select **AWS Hosted by Port** from the cloud providers section.

- **Get the Role ARN**:
   - After CloudFormation deployment completes, go to the **Outputs** tab.
   - Copy the **Role ARN** value.

- **Complete Integration Setup**:
   - Return to the Port integration form.
   - Paste the **Role ARN** into the **Account Role Arn** field.
   - Click `Done`.

- **Verify Connection**:
   - Port will automatically detect the IAM role created by CloudFormation.
   - The integration will start discovering your AWS resources.

:::tip Why Can't I Use an Existing Role?
AWS Hosted by Port requires specific OIDC trust relationships and permissions that are automatically configured by the CloudFormation template. Using an existing role would require manual configuration of these complex trust relationships, which is why we provide the CloudFormation template to ensure proper setup.

For detailed information about the IAM role architecture and permissions, see the [IAM Role Architecture](./iam-role-architecture.md) documentation.
:::

</TabItem>

<TabItem value="multi-account" label="Multi-Account (Organizations)">

For multiple AWS accounts, you'll use AWS Organizations and deploy the integration across multiple accounts using CloudFormation StackSets.

<h4>Understanding AWS Organizations</h4>

- **Management Account**: The main account that manages your organization (also called "master account").
- **Member Accounts**: Individual AWS accounts in your organization.
- **Organizational Units (OUs)**: Logical groupings of accounts (like folders in a file system).
- **OU IDs**: Unique identifiers for organizational units (format: `ou-abcd-12345678`).
- **Root**: The top-level container for all accounts and OUs (format: `r-xxxxxxxxx`).

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

<h4>Step 1: Prepare Your Organization</h4>

:::caution Management Account Access Required
You must run the multi-account installation from your AWS Organizations **management account**. This is because only the management account can deploy StackSets across member accounts.
:::

- **Access Management Account**:
   - Log into your AWS Organizations management account.
   - Navigate to [AWS Organizations](https://console.aws.amazon.com/organizations/) service.

- **Find Your OU IDs**:
   - In AWS Organizations, open **organizational units** in the left sidebar.
   - Click an OU (e.g., **Production**).
   - Copy the OU ID from the details page (format `ou-xxxx-xxxxxxxx`).
   - Repeat for each OU you want to include.
   - You can also target specific account IDs if needed.

:::tip Common OU Naming Patterns Examples
- `ou-prod-12345678` (Production)
- `ou-staging-87654321` (Staging)  
- `ou-dev-11223344` (Development)
- `ou-shared-55667788` (Shared Services)
:::

<h4>Step 2: Deploy Multi-Account CloudFormation Stack</h4>

- **Access the CloudFormation Template**:
   - Go to the  [Data sources](https://app.getport.io/settings/data-sources) page of your portal.
   - Click on the `+ Data source` button in the top right corner of the page.
   - Select **AWS Hosted by Port** from the cloud providers section.
   - Select **Multiple Accounts** and click the `Click here` link in step 3.
   - This will open CloudFormation with pre-configured parameters.

- **Deploy via AWS Console**:
   - In the CloudFormation console, review the pre-configured parameters.
   - Scroll down to the bottom of the page.
   - Check the box **"I acknowledge that AWS CloudFormation might create IAM resources with custom names"**.
   - Click `Create Stack`.


<h4>Step 3: Monitor Deployment</h4>

- **Check StackSet Status**:
   - Go to **CloudFormation** → **StackSets** in your management account.
   - Monitor the deployment progress across all target accounts.
   - Ensure all stack instances show `CREATE_COMPLETE` status.

- **Verify IAM Roles**:
   - Check that the IAM roles were created in each target account.

<h4>Step 4: Configure Integration in Port</h4>

- Navigate to the [Data sources](https://app.getport.io/settings/data-sources) page of your portal.

- **Add AWS Hosted by Port Integration**:
   - Click on the `+ Data source` button in the top right corner of the page.
   - Select **AWS Hosted by Port** from the cloud providers section.

- **Get the Role ARN**:
   - After CloudFormation deployment completes, go to the **Outputs** tab.
   - Copy the **PortintegrationRoleArn** value.

- **Complete Integration Setup**:
   - Return to the Port integration form.
   - Paste the **Management Account Role ARN** into the **Account Role Arn** field.
   - Click `Done`.

- **Verify Multi-Account Connection**:
   - Port will automatically detect the IAM roles across all accounts.
   - The integration will start discovering resources from all configured accounts.

</TabItem>

</Tabs>

## Verify installation

After installation, verify that the integration is working:

1. **Check Integration Status**:
   - Go to **Settings** → **Integrations**.
   - Verify the AWS Hosted by Port integration shows as "Active".
   - Check for any error messages.

2. **Verify Data Flow**:
   - Go to **Software Catalog**
   - Look for entities created by the integration.
   - Verify that AWS resources are being imported correctly.


## Troubleshooting

Common Installation Issue - CloudFormation Stack Creation Failures.

**Error**: `Stack creation failed: CREATE_FAILED`

**Solutions**:
- **Invalid Port Organization ID**: Verify the format is `org_` followed by alphanumeric characters.
- **Duplicate Integration Identifier**: Use a unique identifier that hasn't been used before.
- **Insufficient IAM Permissions**: Ensure your AWS user has CloudFormation and IAM permissions.
- **OIDC Provider Already Exists**: Set "Create OIDC Provider" to `false` if you already have one.


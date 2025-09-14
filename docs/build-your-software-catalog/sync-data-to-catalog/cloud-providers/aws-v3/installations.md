---
sidebar_position: 2
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Installation

:::warning Beta Feature
AWS Hosted by Port is currently in **beta mode** and is not yet available for all Port users. Contact Port's support team to get access to this integration.
:::

AWS Hosted by Port is available through [Port's Ocean SaaS framework](https://ocean.getport.io/integrations-library/).  

The installation process is simple - you only need to create IAM roles in your AWS accounts to grant the integration access to read your resources. The integration handles everything else automatically.

**How the integration works:**

AWS Hosted by Port runs on **Port's servers** and connects to your AWS accounts using **OIDC (OpenID Connect)** authentication. Here's how it works:

1. **You create IAM roles** in your AWS accounts using Port's CloudFormation templates.
2. **Port's servers assume these roles** using OIDC to get temporary AWS credentials.
3. **Port discovers your AWS resources** by calling AWS APIs with the assumed roles.
4. **Port exports the resources** to your Port account in the software catalog.
5. **Port periodically syncs** to keep your catalog up-to-date with your AWS infrastructure.

:::tip Why Can't I Use an Existing Role?
AWS Hosted by Port requires specific OIDC trust relationships and permissions that are automatically configured by the CloudFormation template. Using an existing role would require manual configuration of these complex trust relationships, which is why we provide the CloudFormation template to ensure proper setup.

For detailed information about the IAM role architecture and permissions, see the [IAM Role Architecture](./iam-role-architecture.md) documentation.
:::

## Installation methods

<Tabs groupId="installation-method" queryString values={[
{label: "Single Account", value: "single-account"},
{label: "Multi-Account (Organizations)", value: "multi-account"}
]}>

<TabItem value="single-account" label="Single Account">

For a single AWS account, you will deploy a CloudFormation stack that creates the necessary IAM roles.

<h4>Step 1: Access AWS Console</h4>

-  **Log into your AWS account**:
   - Go to [AWS Console](https://console.aws.amazon.com/).
   - Sign in with your AWS account credentials.

<h4>Step 2: Deploy CloudFormation Stack</h4>

- **Access the CloudFormation template**:
   - Go to [Data Sources](https://app.getport.io/settings/data-sources) page.
   - Click on the `+ Data source` button in the top right corner of the page.
   - Select **AWS Hosted by Port** from the cloud providers section.
   - Select **Single Account**.
   - In step 3 of the installation form, click the `Click here` link. This will open CloudFormation with pre-configured parameters.
   - This will open CloudFormation with pre-configured parameters.

- **Deploy via AWS console**:
   - In the CloudFormation console, review the pre-configured parameters.
   - Scroll down to the bottom of the page.
   - Check the box that states **"I acknowledge that AWS CloudFormation might create IAM resources with custom names"**.  
      <img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/CloudFormationcheckbox.png' width='100%' border='1px' />
   - Click `Create Stack`.


<h4>Step 3: Configure Integration in Port</h4>

- **Get the role ARN**:
   - Ensure the stack shows `CREATE_COMPLETE` status.
      <img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/CreateCompleteStatus.png' width='60%' border='1px' />
   - After CloudFormation deployment completes, go to the **Outputs** tab.
   - Copy the value of **PortIntegrationRoleArn**.
      <img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/PortIntegreationRoleArnValue.png' width='90%' border='1px' />
   - Paste it into the **Account Role Arn** field in the Port integration form.
   - Click `Done`.

- **Verify connection**:
   - Port will automatically detect the IAM role created by CloudFormation.
   - The integration will start discovering your AWS resources.

</TabItem>

<TabItem value="multi-account" label="Multi-Account (Organizations)">

For multiple AWS accounts, you will use AWS Organizations and deploy the integration across multiple accounts using CloudFormation StackSets.

<h4>Understanding AWS Organizations</h4>

- **Management account**: The main account that manages your organization.
- **Member accounts**: Individual AWS accounts in your organization.
- **Organizational units (OUs)**: Logical groupings of accounts (like folders in a file system).
- **OU IDs**: Unique identifiers for organizational units (format: `ou-abcd-12345678`).
- **Root**: The top-level container for all accounts and OUs (format: `r-xxxxxxxxx`).

**Example organization structure**:
```
Root (r-1234)
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

- **Find your OU ID**:
   - Log into your AWS Organizations management account.
   - Navigate to [AWS Organizations](https://us-east-1.console.aws.amazon.com/organizations/v2/home/accounts) service.
   - Under **Organizational structure** copy the OU ID from the details page (format `ou-xxxx-xxxxxxxx` or `r-xxxx`).
   - You can also target specific account IDs if needed using the `Account scope` field.

<h4>Step 2: Deploy Multi-Account CloudFormation Stack</h4>

- **Access the CloudFormation template**:
   - Go to the  [Data sources](https://app.getport.io/settings/data-sources) page of your portal.
   - Click on the `+ Data source` button in the top right corner of the page.
   - Select **AWS Hosted by Port** from the cloud providers section.
   - Select **Multiple Accounts** and paste the OU ID you previously copied.
   - Choose the scope of the account (**All accounts**, **All accounts except selected**, **Selected accounts only**).
   - In step 3 of the installation form, click the `Click here` link, this will open CloudFormation with pre-configured parameters.

- **Deploy via AWS console**:
   - In the CloudFormation console, review the pre-configured parameters.
   - Scroll down to the bottom of the page.
   - Check the box **"I acknowledge that AWS CloudFormation might create IAM resources with custom names"**. 
      <img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/CloudFormationcheckbox.png' width='100%' border='1px' />
   - Click `Create Stack`.


<h4>Step 3: Monitor Deployment</h4>

- **Check StackSet status**:
   - Go to **CloudFormation** → **Stacks** in your management account.
   - Make sure your stack status is `CREATE_COMPLETE`.
     <img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/CreateCompleteStatus.png' width='60%' border='1px' />

- **Verify IAM roles**:
   - Check that the IAM roles were created in each target account.

<h4>Step 4: Configure Integration in Port</h4>

- **Get the role ARN**:
   - After CloudFormation deployment completes, go to the **Outputs** tab.
   - Copy the value of **PortIntegrationRoleArn**.
      <img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/PortIntegreationRoleArnValue.png' width='90%' border='1px' />
   - Paste it into the **Account Role Arn** field in the Port integration form.
   - Click `Done`.

- **Verify multi-Account connection**:
   - Port will automatically detect the IAM roles across all accounts.
   - The integration will start discovering resources from all configured accounts.

</TabItem>

</Tabs>

## Troubleshooting

Common Installation Issue - CloudFormation Stack Creation Failures.

**Error**: `Stack creation failed: CREATE_FAILED`

**Solutions**:
- **Insufficient IAM permissions**: Ensure your AWS user has CloudFormation and IAM permissions.
- **OIDC provider already Eeists**: Set "Create OIDC Provider" to `false` if you already have one.


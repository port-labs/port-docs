---
sidebar_position: 2
---

# Multi-Account Configuration

This guide explains how to configure AWS Hosted by Port to work with multiple AWS accounts using AWS Organizations and CloudFormation StackSets.

## Overview

AWS Hosted by Port supports multiple AWS accounts through **AWS Organizations** using CloudFormation StackSets. This approach provides:

- **Centralized Management**: Deploy the integration across multiple accounts from a single master account
- **OIDC Authentication**: Secure authentication using OpenID Connect without sharing credentials
- **Automated Deployment**: CloudFormation StackSets automatically deploy IAM roles to all target accounts
- **Account Filtering**: Flexible targeting of specific accounts or organizational units
- **Periodic Synchronization**: Regular updates across all accounts to keep your Port catalog current

## Prerequisites

Before setting up multi-account support:

1. **AWS Organizations**: Set up AWS Organizations with a master account
2. **Master Account Access**: Administrative access to your AWS Organizations master account
3. **CloudFormation Permissions**: Ability to deploy CloudFormation StackSets
4. **Port Ocean Account**: Access to Port's Ocean SaaS platform

## Understanding AWS Organizations

Before proceeding, it's important to understand key AWS Organizations concepts:

### Key Terms

- **Master Account**: The main account that manages your organization (also called "management account")
- **Member Accounts**: Individual AWS accounts in your organization
- **Organizational Units (OUs)**: Logical groupings of accounts (like folders in a file system)
- **OU IDs**: Unique identifiers for organizational units (format: `ou-abcd-12345678`)

### Finding Your OU IDs

1. **Access AWS Organizations**:
   - Log into your AWS Organizations master account
   - Navigate to **AWS Organizations** service

2. **Locate OU IDs**:
   - Go to **Organizational units** in the left sidebar
   - Click on any organizational unit
   - The OU ID is displayed in the details (e.g., `ou-abcd-12345678`)

:::info Why OU IDs Matter
OU IDs are used to target specific groups of accounts for deployment. You can deploy the integration to all accounts in an OU, or use account filtering to be more selective.
:::

## Multi-Account Installation Process

The AWS-v3 integration uses CloudFormation StackSets to deploy IAM roles across multiple accounts. Here's how it works:

### Step 1: Deploy Multi-Account CloudFormation Stack

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

### Step 2: Understanding Account Filtering

The CloudFormation template provides flexible account targeting:

#### Account Scope Options

- **ALL**: Deploy to all accounts in the specified OUs
  - Example: Deploy to all accounts in `ou-prod-12345678`
  - Leave "Target Account IDs" empty

- **INTERSECTION**: Deploy only to accounts that are in both the OUs AND the account list
  - Example: Deploy only to accounts `123456789012` and `234567890123` if they're in `ou-prod-12345678`
  - Specify both OU IDs and Target Account IDs

- **DIFFERENCE**: Deploy to all accounts in OUs EXCEPT those in the account list
  - Example: Deploy to all accounts in `ou-prod-12345678` except `345678901234`
  - Specify OU IDs and accounts to exclude

#### Examples

**Deploy to all production accounts**:
- Target OU IDs: `ou-prod-12345678`
- Account Scope: `ALL`
- Target Account IDs: (leave empty)

**Deploy to specific accounts only**:
- Target OU IDs: `ou-prod-12345678,ou-staging-87654321`
- Account Scope: `INTERSECTION`
- Target Account IDs: `123456789012,234567890123`

**Deploy to all accounts except test accounts**:
- Target OU IDs: `ou-prod-12345678`
- Account Scope: `DIFFERENCE`
- Target Account IDs: `345678901234,456789012345`

### Step 3: Monitor Deployment

1. **Check StackSet Status**:
   - Go to **CloudFormation** → **StackSets** in your master account
   - Monitor the deployment progress across all target accounts
   - Ensure all stack instances show "CURRENT" status

2. **Verify IAM Roles**:
   - Check that the IAM roles were created in each target account
   - Verify the roles have the correct trust relationships

### Step 4: Configure Integration in Port

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

## Common Configuration Issues

### Issue 1: "Client did not know what is OU"

**Problem**: Users are unfamiliar with AWS Organizations terminology.

**Solution**: 
- Explain that OUs are like folders that group AWS accounts
- Show them how to find OU IDs in the AWS Organizations console
- Provide examples of common OU structures (Production, Development, Staging)

### Issue 2: "Client didn't know he needs to go to the master account"

**Problem**: Users try to deploy from member accounts instead of the master account.

**Solution**:
- Clearly explain that multi-account deployment must be done from the master account
- Provide instructions on how to identify the master account
- Explain why this is necessary (only master accounts can deploy StackSets)

### Issue 3: "Client didn't understand how the installation works"

**Problem**: Users don't understand the OIDC-based authentication model.

**Solution**:
- Explain that the integration runs on Port's infrastructure
- Clarify that no AWS credentials are shared
- Describe how OIDC provides secure, temporary access

### Issue 4: "Client didn't understand why he can't use an existing role"

**Problem**: Users want to reuse existing IAM roles.

**Solution**:
- Explain that the integration requires specific OIDC trust relationships
- Describe how the CloudFormation template configures these automatically
- Mention that manual configuration would be complex and error-prone

### Issue 5: "Client didn't understand the filter accounts is used by account id and separated by ,"

**Problem**: Users don't understand the account filtering syntax.

**Solution**:
- Provide clear examples of comma-separated account IDs
- Show different filtering scenarios (ALL, INTERSECTION, DIFFERENCE)
- Include visual examples with actual account IDs

## Best Practices

### 1. Security

- **Least Privilege**: The CloudFormation template creates roles with read-only access
- **OIDC Authentication**: More secure than traditional access keys
- **Audit Logging**: Enable CloudTrail for all accounts
- **Regular Reviews**: Periodically review IAM roles and permissions

### 2. Organization Structure

- **Logical Grouping**: Organize accounts into meaningful OUs
- **Naming Conventions**: Use consistent naming for OUs and accounts
- **Environment Separation**: Separate production, staging, and development accounts

### 3. Deployment Strategy

- **Staged Rollout**: Deploy to non-production accounts first
- **Testing**: Verify the integration works in one account before rolling out to all
- **Monitoring**: Monitor deployment status across all accounts

### 4. Maintenance

- **Regular Updates**: Keep the CloudFormation templates updated
- **Account Management**: Add new accounts to appropriate OUs
- **Cleanup**: Remove access for accounts that no longer need it

## Troubleshooting

### Common Issues

#### 1. StackSet Deployment Failures

**Problem**: StackSet deployment fails on some accounts

**Solution**:
- Check CloudFormation events for specific error messages
- Verify that target accounts have the necessary permissions
- Ensure accounts are in the correct OUs

#### 2. IAM Role Creation Issues

**Problem**: IAM roles are not created in target accounts

**Solution**:
- Verify StackSet deployment status
- Check IAM permissions in target accounts
- Ensure the integration identifier matches between CloudFormation and Port

#### 3. Port Integration Connection Issues

**Problem**: Port cannot connect to AWS accounts

**Solution**:
- Verify IAM roles exist in target accounts
- Check OIDC provider configuration
- Ensure integration identifier matches

### Debug Mode

Enable debug mode for detailed logging:

```yaml showLineNumbers
debug: true
log_level: "DEBUG"

aws:
  debug: true
  log_requests: true
  log_responses: true
```

This will provide detailed information about:
- Cross-account role assumptions
- Account discovery process
- Resource discovery per account
- API call details and responses

## Migration Guide

### From Single Account to Multi-Account

1. **Backup Current Configuration**: Save your existing single-account configuration
2. **Set Up AWS Organizations**: Ensure your accounts are properly organized
3. **Deploy Multi-Account Stack**: Use the CloudFormation template to deploy across accounts
4. **Update Port Configuration**: Modify your Port integration to include multiple accounts
5. **Test and Validate**: Verify the integration works across all accounts
6. **Monitor Performance**: Ensure the integration performs well with multiple accounts

### Configuration Migration

```yaml showLineNumbers
# Before (Single Account)
integration:
  identifier: "aws-v3-single"
  account_id: "123456789012"
  region: "us-east-1"

# After (Multi-Account)
integration:
  identifier: "aws-v3-multi"
  organization_id: "o-1234567890"
  target_accounts: ["123456789012", "234567890123", "345678901234"]
  regions: ["us-east-1", "us-west-2"]
```

## Support and Resources

- **AWS Organizations**: [AWS Organizations Documentation](https://docs.aws.amazon.com/organizations/)
- **CloudFormation StackSets**: [AWS CloudFormation StackSets Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html)
- **Port Community**: [Port Community Forum](https://github.com/port-labs/port/discussions)
- **Issues**: [Report Issues](https://github.com/port-labs/ocean/issues)

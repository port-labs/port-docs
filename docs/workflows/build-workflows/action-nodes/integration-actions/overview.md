---
sidebar_position: 1
title: Overview
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Integration actions overview

<ClosedBetaFeatureNotice id="workflows" />

Integration actions allow workflows to trigger operations in connected platforms like GitHub. These actions leverage Port's existing integrations to perform operations directly, without requiring you to set up separate webhook authentication.

## How it works

Integration actions use your existing Port integrations to authenticate and execute operations. When you configure an integration action:

1. The workflow uses the credentials from your installed integration
2. Port executes the operation on your behalf
3. Results are returned to the workflow for use in subsequent nodes

## Common configuration

All integration actions share these fields:

| Field | Type | Description |
| ----- | ---- | ----------- |
| `type` | `"INTEGRATION_ACTION"` | **Required.** Must be `"INTEGRATION_ACTION"` |
| `installationId` | `string` | **Required.** The ID of the installed integration |
| `integrationProvider` | `string` | **Required.** The integration provider (e.g., `"GITHUB"`) |
| `integrationInvocationType` | `string` | **Required.** The type of operation |
| `integrationActionExecutionProperties` | `object` | **Required.** Operation-specific configuration |

## Finding your installation ID

To find the installation ID for your integration:

1. Navigate to your [Data Sources page](https://app.getport.io/settings/data-sources)
2. Find the integration you want to use
3. Click on it to view details
4. The installation ID is displayed in the integration settings

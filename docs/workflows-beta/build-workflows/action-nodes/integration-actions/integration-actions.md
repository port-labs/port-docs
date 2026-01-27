---
sidebar_position: 0
title: Integration actions
---

import DocCardList from '@theme/DocCardList';
import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Integration actions

<ClosedBetaFeatureNotice id="workflows-beta" />

Integration actions allow workflows to trigger operations in connected platforms like GitHub. These actions leverage Port's existing integrations to perform operations directly, without requiring you to set up separate webhook authentication.

## Available integrations

| Integration | Description | Status |
| ----------- | ----------- | ------ |
| [GitHub](/workflows-beta/build-workflows/action-nodes/integration-actions/github) | Trigger GitHub Actions workflows | Available |
| GitLab | Trigger GitLab pipelines | Coming soon |
| Azure DevOps | Trigger Azure pipelines | Coming soon |
| Jenkins | Trigger Jenkins jobs | Coming soon |

:::note Expanding integration support
We're actively working on adding more integration actions. If you need a specific integration, please reach out to [Port's support team](mailto:support@getport.io).
:::

## Sections

<DocCardList />

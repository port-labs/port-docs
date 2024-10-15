---
sidebar_position: 1
displayed_sidebar: null
---

# Implement working agreements and measure pull request standards 

## Overview

Creating high-performing engineering teams requires not just technical expertise but also effective collaboration and clear expectations.
**working agreements** help teams establish shared understandings of processes and standards, enhancing collaboration, promoting accountability, 
facilitating onboarding, and improving efficiency.**pull requests (PRs)** are a critical part of the workflow. Measuring PR standards is essential for assessing code quality,
review processes, and team efficiency. By integrating **working agreements** and **measurable PR metrics**, 
teams can monitor adherence to best practices and continuously improve their workflows.

:::info Metrics
Metrics are essential for assessing how well teams adhere to their working agreements. 
They enable teams to track compliance, identify bottlenecks, and drive continuous improvement. 
For detailed insights into key metrics like `deployment frequency`, `lead time for changes`, and `change failure rate`,
please refer to our [DORA Metrics guide](/guides/all/setup-dora-metrics).
:::


## Example Implementation

The following working agreements and pr checks have been implemented in our [demo environment](https://demo.getport.io/settings/data-model) on the `pull request` blueprint:

- **PR Description Cannot be Empty**: Ensures that every PR has a description.
- **PR Has Linked Issue**: Verifies that each PR is linked to an issue.
- **PR Has No Unchecked Checkboxes**: Checks that there are no unchecked items in the PR description.
- **PR Requires Reviewers**: Confirms that at least one reviewer is assigned to the PR.
- **PR Is Linked to a Milestone**: Ensures the PR is associated with a milestone.
- **PR Changed X Files or Less**: Validates that the number of changed files is within acceptable limits.
- **PR Has Been Open for X Days**: Monitors how long a PR has been open.
- **PR Batch Size Calculation**: Calculates the batch size of the PR.

These checks are implemented using Port's [scorecards](/#scorecards) on the `pull request` blueprint.







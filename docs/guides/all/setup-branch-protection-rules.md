---
displayed_sidebar: null
description: Learn how to drive DevOps and DevSecOps governance in your organization by enforcing branch protection rules using scorecards 
---

# Enforce branch protection rules with scorecards

Branch protection rules are powerful ways to ensure critical branches in your repositories like `main` or `release` follow security and governance best practices. By tracking these rules with Port's scorecards, platform and security teams can monitor organizational compliance, enforce DevSecOps policies, and ensure consistent engineering standards across all teams.

This guide demonstrates how to track GitHub branch protection settings using Port's scorecards, providing visibility and automation around repository health and security posture.

## Common use cases

- **Drive engineering compliance**: Spot missing branch protections and guide teams to fix them.
- **Make sure production is safe**: Check that every service meets the right rules before it goes live.

## Prerequisites

- Install Port's [GitHub app](https://github.com/apps/getport-io) in your GitHub organization.


## Set up data model

Follow the steps below to create the branch blueprint:

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>GitHub Branch Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "branch_protection",
    "title": "Branch",
    "icon": "Microservice",
    "schema": {
        "properties": {
        "require_approval_count": {
            "title": "Require approvals",
            "type": "number",
            "icon": "DefaultProperty",
            "description": "The number of approvals required before merging a pull request"
        },
        "is_protected": {
            "title": "Is branch protected",
            "type": "boolean",
            "icon": "DefaultProperty",
            "description": "Indicates whether certain rules must be met before changes can be merged"

        },
        "require_code_owner_review": {
            "title": "Require code owner review",
            "type": "boolean",
            "icon": "DefaultProperty",
            "description": "Requires review from code owners before a pull request can be merged"

        },
        "allow_deletions": {
            "title": "Allow deletions",
            "type": "boolean",
            "icon": "DefaultProperty",
            "description": "Allows users with bypass permissions to delete matching references in the branch"

        },
        "allow_force_pushes": {
            "title": "Allow force pushes",
            "type": "boolean",
            "icon": "DefaultProperty",
            "description": "Permits users with push access to force push changes to the branch"

        },
        "url": {
            "title": "Branch url",
            "type": "string",
            "format": "url",
            "description": "URL of the branch in the repository"
        },
        "require_signed_commits": {
            "title": "Require signed commits",
            "type": "boolean",
            "icon": "DefaultProperty",
            "description": "Ensures that commits pushed to the branch are signed"
        },
        "require_linear_history": {
            "title": "Require linear history",
            "type": "boolean",
            "icon": "DefaultProperty",
            "description": "Enforces a linear history in the branch by preventing merge commits"
        },
        "restrict_creations": {
            "title": "Restrict creations",
            "type": "boolean",
            "icon": "DefaultProperty",
            "description": "Restricts the creation of matching references in the branch, allowing only users with bypass permissions"
        },
        "restrict_updates": {
            "title": "Restrict updates",
            "type": "boolean",
            "icon": "DefaultProperty",
            "description": "Prevents updates to matching references in the branch, limiting changes to users with bypass permissions"
        },
        "require_conversation_resolution": {
            "title": "Require conversation resolution",
            "type": "boolean",
            "icon": "DefaultProperty",
            "description": "Ensures that all comments and conversations are resolved before merging a pull request"
        },
        "lock_branch": {
            "title": "Lock branch",
            "type": "boolean",
            "icon": "DefaultProperty",
            "description": "Locks the branch, preventing any changes from being made unless explicitly unlocked"

        },
        "block_force_pushes": {
            "title": "Block force pushes",
            "type": "boolean",
            "icon": "DefaultProperty",
            "description": "Prevent users with push access from force pushing to refs"
        }
        },
        "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
        "repository": {
        "title": "Repository",
        "target": "service",
        "required": false,
        "many": false
        }
    }
    }
    ```
    </details>
5. Click `Save` to create the blueprint.

<h3> Update GitHub integration configuration </h3>

1. Go to your [Data Source](https://app.getport.io/settings/data-sources) page.
2. Select the GitHub integration.
3. Add the following YAML block into the `Mapping` editor to ingest the branch protection rules data:

    <details>
    <summary><b>GitHub Branch Protection Rules Configuration (Click to expand)</b></summary>

    :::note supported branch protection rules
    Currently only default branch protection rules are supported
    :::

    ```yaml showLineNumbers
    - kind: branch
        selector:
        query: '.repository.default_branch == .branch.name'
        port:
        entity:
            mappings:
            identifier: .repository.name + "_" + .branch.name
            title: .repository.name + " " + .branch.name
            blueprint: '"branch_protection"'
            properties:
                is_protected: .branch.protected
                url: .branch._links.html
                require_approval_count: >-
                .branch.protectionRules.required_pull_request_reviews.required_approving_review_count
                require_code_owner_review: >-
                .branch.protectionRules.required_pull_request_reviews.require_code_owner_reviews
                allow_force_pushes: .branch.protectionRules.allow_force_pushes.enabled
                allow_deletions: .branch.protectionRules.allow_deletions.enabled
                require_signed_commits: .branch.protectionRules.required_signatures.enabled
                require_linear_history: .branch.protectionRules.required_linear_history.enabled
                restrict_creations: .branch.protectionRules.block_creations.enabled
                restrict_updates: .branch.protectionRules.restrict_updates.enabled
                require_conversation_resolution: >-
                .branch.protectionRules.required_conversation_resolution.enabled
                lock_branch: .branch.protectionRules.lock_branch.enabled
                block_force_pushes: .branch.protectionRules.allow_force_pushes.enabled == false
            relations:
                repository: .repository.name
    ```
    </details>

4. Click `Save & Resync` to apply the mapping.

## Set up scorecard

Let's create a scorecard that will evaluate the health of each repo based on its protection configuration:

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Search for the **Branch** blueprint and select it.
3. Click on the `Scorecards` tab.
4. Click on `+ New Scorecard` to create a new scorecard.
5. Add this JSON configuration:
    <details>
    <summary><b>Protection Metrics Scorecard (click to expand)</b></summary>

    ```json showLineNumbers
        [
        {
            "identifier": "branch_protection",
            "title": "Protection Metrics",
            "levels": [
            {
                "color": "paleBlue",
                "title": "Basic"
            },
            {
                "color": "darkGray",
                "title": "Low"
            },
            {
                "color": "orange",
                "title": "Medium"
            },
            {
                "color": "red",
                "title": "High"
            }
            ],
            "rules": [
            {
                "identifier": "restrict_create",
                "title": "Restrict Creations",
                "description": "Prevents unauthorized creation of release branches. Low unless automated CI/CD pipelines are used, then Medium due to a potential software supply chain risk.",
                "level": "Low",
                "query": {
                "combinator": "and",
                "conditions": [
                    {
                    "operator": "=",
                    "property": "restrict_creations",
                    "value": true
                    }
                ]
                }
            },
            {
                "identifier": "restrict_update",
                "title": "Restrict Updates",
                "description": "Prevents unauthorized changes to important tags or refs. Medium security level as changes could introduce vulnerabilities.",
                "level": "Medium",
                "query": {
                "combinator": "and",
                "conditions": [
                    {
                    "operator": "=",
                    "property": "restrict_updates",
                    "value": true
                    }
                ]
                }
            },
            {
                "identifier": "restrict_delete",
                "title": "Restrict Deletions",
                "description": "Prevents unauthorized deletions, reducing risks of accidental or malicious data loss. Low security value.",
                "level": "Low",
                "query": {
                "combinator": "and",
                "conditions": [
                    {
                    "operator": "=",
                    "property": "allow_deletions",
                    "value": false
                    }
                ]
                }
            },
            {
                "identifier": "linear_history",
                "title": "Require Linear History",
                "description": "Enforces a simpler, more auditable code history. Low security value.",
                "level": "Low",
                "query": {
                "combinator": "and",
                "conditions": [
                    {
                    "operator": "=",
                    "property": "require_linear_history",
                    "value": true
                    }
                ]
                }
            },
            {
                "identifier": "signed_commits",
                "title": "Require Signed Commits",
                "description": "Validates the author of the code with verified signatures to prevent spoofing. Medium security level but with a high effort required.",
                "level": "Medium",
                "query": {
                "combinator": "and",
                "conditions": [
                    {
                    "operator": "=",
                    "property": "require_signed_commits",
                    "value": true
                    }
                ]
                }
            },
            {
                "identifier": "pr_approval",
                "title": "Require PR Approval",
                "description": "Requires at least 1 approver on a PR before merging, ensuring a minimum change control in place. High security level.",
                "level": "High",
                "query": {
                "combinator": "and",
                "conditions": [
                    {
                    "operator": ">=",
                    "property": "require_approval_count",
                    "value": 1
                    }
                ]
                }
            },
            {
                "identifier": "code_owner_rev",
                "title": "Require Code Owner Review",
                "description": "Requires code owner review for PR merges, ensuring only authorized personnel can approve changes. High security level.",
                "level": "High",
                "query": {
                "combinator": "and",
                "conditions": [
                    {
                    "operator": "=",
                    "property": "require_code_owner_review",
                    "value": true
                    }
                ]
                }
            },
            {
                "identifier": "conv_resolution",
                "title": "Require Conversation Resolution",
                "description": "Ensures all conversations are resolved before merging a PR. Medium security level.",
                "level": "Medium",
                "query": {
                "combinator": "and",
                "conditions": [
                    {
                    "operator": "=",
                    "property": "require_conversation_resolution",
                    "value": true
                    }
                ]
                }
            },
            {
                "identifier": "allow_force_push",
                "title": "Allow Force Pushes",
                "description": "Allows force pushing, which can overwrite history. High security risk.",
                "level": "High",
                "query": {
                "combinator": "and",
                "conditions": [
                    {
                    "operator": "=",
                    "property": "allow_force_pushes",
                    "value": true
                    }
                ]
                }
            },
            {
                "identifier": "block_force_push",
                "title": "Block Force Pushes",
                "description": "Prevents force pushing to branches, mitigating the risk of history overwrites. High security level.",
                "level": "High",
                "query": {
                "combinator": "and",
                "conditions": [
                    {
                    "operator": "=",
                    "property": "block_force_pushes",
                    "value": true
                    }
                ]
                }
            }
            ]
        }
        ]
    ```
    </details>

6. Click on `Save` to create the scorecard.


After setting up the scorecard metrics on a branch, it should look like this:

<img src="/img/guides/branchProtectionMetric.png" width="80%" border="1px" />
---
displayed_sidebar: null
description: Learn how to measure standards compliance across your software delivery, tracking quality, security, and organizational alignment using Port's GitHub integration and scorecards.
---

# Track standards adherence

Visibility into standards adherence is essential for ensuring that software delivery consistently meets defined expectations for quality, security, and compliance.

This visibility is achieved through standards and scorecards, which translate organizational expectations into clear, observable indicators across repositories and services. By making adherence visible, teams can identify gaps, understand risk, and scale delivery without relying on manual reviews or audits.

This guide helps engineering managers, platform engineers and product leaders answer critical questions about their delivery standards:

- **Quality**: Are repositories following engineering best practices like documentation, CI/CD requirements, and code review policies?
- **Security**: Are security controls properly implemented, including repository visibility and branch protection?
- **Compliance**: Are organizational and regulatory expectations being met consistently?

By the end of this guide, you will have scorecards and dashboards that track key standards metrics, enabling you to identify gaps, prioritize improvements, and ensure that what ships is secure, compliant, and aligned with organizational expectations.

<img src="/img/guides/standards-dashboard.png" border="1px" width="100%" />

## Common use cases

- Track repository hygiene and production readiness across teams.
- Monitor security compliance including repository visibility and branch protection.
- Identify repositories missing documentation, CI/CD pipelines, or PR templates.
- Measure adherence to organizational standards and best practices.

## Prerequisites

This guide assumes the following:

- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [GitHub integration](/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- The `githubPullRequest` and `githubRepository` blueprints are already created (these are created when you install the GitHub integration).

:::tip Initial scope

This guide focuses on measuring standards using source control management (SCM) data, including repositories, pull requests, workflows, and branch protection settings. This is the first iteration of standards measurement and will expand in future versions to include additional metrics and data sources such as security scanning tools, documentation platforms, and other compliance systems.
:::

## Key metrics overview

We will track seven key metrics to measure standards compliance:

| Metric | What it measures | Why it matters |
|--------|------------------|----------------|
| **Private visibility enabled** | Repository visibility is set to private (not public or internal) | Prevents accidental code and IP exposure |
| **Has a README file** | Repository contains a README file in the default branch | Improves onboarding and discoverability |
| **Repo has a pipeline** | Repository is configured with an automated CI pipeline | Increases delivery reliability through automation |
| **Default branch is protected** | Default branch (e.g. main) has protection rules | Reduces risk from unsafe changes |
| **Service owner assigned** | Repository is explicitly linked to a service owner | Establishes clear ownership and accountability |
| **Has a PR template** | Repository includes a pull request template | Improves review quality and flow efficiency |
| **Forced push disabled** | Force pushes are disabled on protected branches | Preserves auditability and compliance |

## Set up data model

We will create blueprints to model your GitHub standards data. The `githubPullRequest` and `githubRepository` blueprints should already exist from the GitHub integration installation.

### Create the branch protection blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Branch protection blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "branchProtection",
      "title": "Branch Protection",
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
      "relations": {}
    }
    ```

    </details>

5. Click `Save` to create the blueprint.

### Create the pull request template blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Pull request template blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "pullRequestTemplate",
      "description": "Pull request Template",
      "title": "Pull Request Template",
      "icon": "Markdown",
      "schema": {
        "properties": {
          "content": {
            "type": "string",
            "title": "Content",
            "format": "markdown"
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
          "target": "githubRepository",
          "required": false,
          "many": false
        }
      }
    }
    ```

    </details>

5. Click `Save` to create the blueprint.

### Update the GitHub repository blueprint

We need to update the existing `githubRepository` blueprint to add properties and relations for standards tracking.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find the `githubRepository` blueprint and click on it.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Update the JSON schema to include the visibility property, aggregation properties, mirror properties, and the default branch protection relation:

    <details>
    <summary><b>Updated GitHub repository blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "githubRepository",
      "title": "Repository",
      "icon": "Github",
      "ownership": {
        "type": "Direct"
      },
      "schema": {
        "properties": {
          "readme": {
            "title": "README",
            "type": "string",
            "format": "markdown"
          },
          "url": {
            "icon": "DefaultProperty",
            "title": "Repository URL",
            "type": "string",
            "format": "url"
          },
          "defaultBranch": {
            "title": "Default branch",
            "type": "string"
          },
          "last_push": {
            "icon": "GitPullRequest",
            "title": "Last push",
            "description": "Last commit to the main branch",
            "type": "string",
            "format": "date-time"
          },
          "visibility": {
            "type": "string",
            "title": "Visibility"
          }
        },
        "required": []
      },
      "mirrorProperties": {
        "is_branched_protected": {
          "title": "Is Branched Protected",
          "path": "default_branch_settings.is_protected"
        },
        "force_push_disabled": {
          "title": "Force Push Disabled",
          "path": "default_branch_settings.block_force_pushes"
        }
      },
      "calculationProperties": {},
      "aggregationProperties": {
        "total_pipeline": {
          "title": "Total Pipeline",
          "type": "number",
          "target": "githubWorkflow",
          "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
          }
        },
        "has_pr_template": {
          "title": "Has PR Template",
          "type": "number",
          "target": "pullRequestTemplate",
          "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
          }
        }
      },
      "relations": {
        "default_branch_settings": {
          "title": "Default Branch Settings",
          "target": "branchProtection",
          "required": false,
          "many": false
        },
        "service": {
          "title": "Service",
          "target": "service",
          "required": false,
          "many": false
        }
      }
    }
    ```

    </details>

5. Click `Save` to update the blueprint.

## Update integration mapping

Now we'll configure the GitHub integration to ingest branch protection and PR template data into your catalog.

1. Go to your [Data Source](https://app.getport.io/settings/data-sources) page.
2. Select the GitHub integration.
3. Add the following YAML blocks to your existing mapping configuration:

    <details>
    <summary><b>GitHub integration configuration additions (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: branch
        selector:
          query: .repository.default_branch == .branch.name
        port:
          entity:
            mappings:
              identifier: .repository.name + "_" + .branch.name
              title: .repository.name + " " + .branch.name
              blueprint: '"branchProtection"'
              properties:
                is_protected: .branch.protected
                url: .branch._links.html
                require_approval_count: >-
                  .branch.protectionRules.required_pull_request_reviews.required_approving_review_count
                require_code_owner_review: >-
                  .branch.protectionRules.required_pull_request_reviews.require_code_owner_reviews
                allow_force_pushes: .branch.protectionRules.allow_force_pushes.enabled
                require_signed_commits: .branch.protectionRules.required_signatures.enabled
                block_force_pushes: .branch.protectionRules.allow_force_pushes.enabled == false
      - kind: repository
        selector:
          query: 'true'
          teams: true
        port:
          entity:
            mappings:
              identifier: .full_name
              title: .name
              blueprint: '"githubRepository"'
              properties:
                readme: file://README.md
                url: .html_url
                defaultBranch: .default_branch
                last_push: .pushed_at
                visibility: .visibility
              relations:
                default_branch_settings: .name + "_" + .default_branch
      - kind: file
        selector:
          query: 'true'
          files:
            - path: .github/pull_request_template.md
        port:
          entity:
            mappings:
              identifier: .repo.name + "_" + .file.name
              title: .repo.name + "_" + .file.name
              blueprint: '"pullRequestTemplate"'
              properties:
                content: .file.content
              relations:
                repository: .repo.full_name
    ```

    </details>

    :::tip Existing mappings
    If you already have mappings for repositories, make sure to add the `branch` and `file` kinds to your existing configuration. The mapping above includes all required kinds for this guide.
    :::

4. Click `Save & Resync` to apply the mapping.

## Set up scorecards

Scorecards enable you to define and track standards compliance for your repositories. We'll create three scorecards to measure different aspects of standards.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Search for the `githubRepository` blueprint and select it.
3. Click on the `Scorecards` tab.
4. Click on `+ New Scorecard` to create a new scorecard.

### Create the readiness baseline scorecard

1. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
2. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Readiness baseline scorecard (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "readiness_baseline",
      "title": "Readiness Baseline",
      "rules": [
        {
          "identifier": "has_a_responsible_team",
          "level": "Bronze",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "$team"
              }
            ]
          },
          "description": "Repository is explicitly linked to a service owner or responsible team",
          "title": "Ownership defined"
        },
        {
          "identifier": "has_a_readme_file",
          "level": "Silver",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "readme"
              }
            ]
          },
          "description": "README exists on the default branch and provides basic usage or context",
          "title": "Has a README file"
        },
        {
          "identifier": "readiness_baseline_met",
          "level": "Gold",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "$team"
              },
              {
                "operator": "isNotEmpty",
                "property": "readme"
              }
            ]
          },
          "description": "All lower-level readiness rules pass",
          "title": "Readiness baseline met"
        }
      ],
      "levels": [
        {
          "color": "paleBlue",
          "title": "Basic"
        },
        {
          "color": "bronze",
          "title": "Bronze"
        },
        {
          "color": "blue",
          "title": "Silver"
        },
        {
          "color": "gold",
          "title": "Gold"
        }
      ]
    }
    ```

    </details>

3. Click `Save` to create the scorecard.

### Create the delivery hygiene scorecard

1. Click on `+ New Scorecard` again.
2. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
3. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Delivery hygiene scorecard (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "delivery_hygiene",
      "title": "Delivery Hygiene",
      "rules": [
        {
          "identifier": "automated_delivery_enabled",
          "level": "Bronze",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": ">",
                "property": "total_pipeline",
                "value": 0
              }
            ]
          },
          "description": "CI pipeline runs on commits and/or pull requests",
          "title": "Automated delivery enabled"
        },
        {
          "identifier": "safe_change_workflow",
          "level": "Silver",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "=",
                "property": "is_branched_protected",
                "value": true
              }
            ]
          },
          "description": "Protection rules are enabled on the default branch",
          "title": "Safe change workflow"
        },
        {
          "identifier": "has_a_pr_template",
          "level": "Silver",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "has_pr_template"
              }
            ]
          },
          "description": "Repository includes a pull request template guiding contributors",
          "title": "Has a PR Template"
        },
        {
          "identifier": "delivery_baseline_met",
          "level": "Gold",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "=",
                "property": "is_branched_protected",
                "value": true
              },
              {
                "operator": ">",
                "property": "total_pipeline",
                "value": 0
              },
              {
                "operator": "isNotEmpty",
                "property": "has_pr_template"
              }
            ]
          },
          "description": "All delivery hygiene rules pass",
          "title": "Delivery baseline met"
        }
      ],
      "levels": [
        {
          "color": "paleBlue",
          "title": "Basic"
        },
        {
          "color": "bronze",
          "title": "Bronze"
        },
        {
          "color": "blue",
          "title": "Silver"
        },
        {
          "color": "gold",
          "title": "Gold"
        }
      ]
    }
    ```

    </details>

4. Click `Save` to create the scorecard.

### Create the security and compliance scorecard

1. Click on `+ New Scorecard` again.
2. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
3. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Security and compliance scorecard (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "security_and_compliance",
      "title": "Security & Compliance",
      "rules": [
        {
          "identifier": "private_visibility_enabled",
          "level": "Silver",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "=",
                "property": "visibility",
                "value": "private"
              }
            ]
          },
          "description": "Repository visibility is private (not public or internal)",
          "title": "Private visibility enabled"
        },
        {
          "identifier": "forced_push_disabled",
          "level": "Bronze",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "=",
                "property": "force_push_disabled",
                "value": true
              }
            ]
          },
          "description": "Force pushes are disabled on protected branches",
          "title": "Forced push disabled"
        },
        {
          "identifier": "compliance_baseline_met",
          "level": "Gold",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "=",
                "property": "visibility",
                "value": "private"
              },
              {
                "operator": "=",
                "property": "force_push_disabled",
                "value": true
              }
            ]
          },
          "description": "All security and compliance rules pass",
          "title": "Compliance baseline met"
        }
      ],
      "levels": [
        {
          "color": "paleBlue",
          "title": "Basic"
        },
        {
          "color": "blue",
          "title": "Silver"
        },
        {
          "color": "bronze",
          "title": "Bronze"
        },
        {
          "color": "gold",
          "title": "Gold"
        }
      ]
    }
    ```

    </details>

4. Click `Save` to create the scorecard.

## Visualize metrics

Once the GitHub data is synced and scorecards are configured, we can create a dedicated dashboard in Port to monitor and analyze standards compliance.

### Create a dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **Comply with standards**.
5. Input `Track your security, production readiness and quality standards` under **Description**.
6. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize standards compliance.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Services scorecard (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **Services Scorecard**.
3. Choose the **GitHub Repository** blueprint.
4. Click **Save** to add the widget to the dashboard.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Title**: The repository name.
    - **Readiness Baseline**: The readiness baseline scorecard level.
    - **Delivery Hygiene**: The delivery hygiene scorecard level.
    - **Security & Compliance**: The security and compliance scorecard level.
7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

<details>
<summary><b>Teams scorecard (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **Teams Scorecard**.
3. Choose the **GitHub Repository** blueprint.
4. Click **Save** to add the widget to the dashboard.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Title**: The repository name.
    - **Readiness Baseline**: The readiness baseline scorecard level.
    - **Delivery Hygiene**: The delivery hygiene scorecard level.
    - **Security & Compliance**: The security and compliance scorecard level.
7. Click on the **Group by any Column** button in the top right corner and select **Owning Team**.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

## Related guides

- [Enforce branch protection rules with scorecards](https://docs.port.io/guides/all/setup-branch-protection-rules/)
- [Define scorecards with AI](https://docs.port.io/guides/all/build-port-scorecards-with-mcp/)
- [Auto-fix services when scorecards degrade](https://docs.port.io/guides/all/self-heal-scorecards-with-ai/)

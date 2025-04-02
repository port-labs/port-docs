---
sidebar_position: 2
title: Connect GitHub pull request to SonarQube analysis
displayed_sidebar: null
description: Learn how to connect GitHub PRs with Sonar analysis in Port, ensuring code quality and streamlined review processes.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect GitHub PR to SonarQube analysis

## Overview
This guide aims to cover how to connect a GitHub pull request with a SonarQube analysis to understand the scan results of your PR.

## Prerequisites
- This guide assumes you have a Port account and that you have finished the [onboarding process](/getting-started/overview).
- Install Port's [SonarQube integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube)
- Install Port's [GitHub app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/#setup)

## Set up data model

We highly recommend you install both the GitHub app and SonarQube integration to have pull requests and analyses automatically ingested into Port in real-time.
However, if you haven't installed [Port's GitHub app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) and [SonarQube integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube), you'll need to create blueprints for GitHub pull requests and SonarQube analyses in Port. Skip this section if you have already installed the GitHub app and SonarQube integration.

### Add the pull request blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>GitHub Pull Request Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "githubPullRequest",
        "title": "Pull Request",
        "icon": "Github",
        "schema": {
            "properties": {
                "creator": {
                    "title": "Creator",
                    "type": "string"
                },
                "assignees": {
                    "title": "Assignees",
                    "type": "array"
                },
                "reviewers": {
                    "title": "Reviewers",
                    "type": "array"
                },
                "status": {
                    "title": "Status",
                    "type": "string",
                    "enum": [
                        "merged",
                        "open",
                        "closed"
                    ],
                    "enumColors": {
                        "merged": "purple",
                        "open": "green",
                        "closed": "red"
                    }
                },
                "closedAt": {
                    "title": "Closed At",
                    "type": "string",
                    "format": "date-time"
                },
                "updatedAt": {
                    "title": "Updated At",
                    "type": "string",
                    "format": "date-time"
                },
                "mergedAt": {
                    "title": "Merged At",
                    "type": "string",
                    "format": "date-time"
                },
                "link": {
                    "type": "string",
                    "format": "url"
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

### Add pull request mapping config

1. Go to your [data sources page](https://app.getport.io/settings/data-sources), and select the Github data source:

    <img src='/img/guides/githubIntegration.png' border='1px' />

2. Add the following YAML block into the editor to map the pull request data:

    <details>
    <summary><b>Relation mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
        - kind: pull-request
          selector:
              query: "true"
          port:
              entity:
              mappings:
              identifier: ".head.repo.name + '-' + (.number|tostring)" # The Entity identifier will be the repository name + the pull request number
              title: ".title"
              blueprint: '"githubPullRequest"'
              properties:
                  creator: ".user.login"
                  assignees: "[.assignees[].login]"
                  reviewers: "[.requested_reviewers[].login]"
                  status: ".status"
                  closedAt: ".closed_at"
                  updatedAt: ".updated_at"
                  mergedAt: ".merged_at"
                  prNumber: ".id"
                  link: ".html_url"
    ```
    </details>

3. Click `Save & Resync` to apply the mapping.


### Add the SonarQube analysis blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>SonarQube Analysis Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "sonarQubeAnalysis",
      "title": "SonarQube Analysis",
      "icon": "sonarqube",
      "schema": {
        "properties": {
          "branch": {
            "title": "Branch",
            "type": "string",
            "description": "The branch analyzed"
          },
          "fixedIssues": {
            "title": "Fixed Issues",
            "type": "number",
            "description": "Number of issues fixed in this analysis"
          },
          "newIssues": {
            "title": "New Issues",
            "type": "number",
            "description": "Number of new issues found in this analysis"
          },
          "coverage": {
            "title": "Coverage",
            "type": "number",
            "description": "Code coverage percentage"
          },
          "duplications": {
            "title": "Duplications",
            "type": "number",
            "description": "Number of code duplications"
          },
          "createdAt": {
            "title": "Created At",
            "type": "string",
            "format": "date-time",
            "description": "When the analysis was created"
          }
        }
      },
      "calculationProperties": {},
      "mirrorProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

5. Click `Save` to create the blueprint.

### Add SonarQube mapping config

1. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your SonarQube integration.

2. Under the `resources` key, add the following YAML block to map SonarQube analyses:

    <details>
    <summary><b>SonarQube Analysis mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
      - kind: analysis
        selector:
          query: "true"
        port:
          entity:
            mappings:
              identifier: .analysisId
              title: .__commit.message
              blueprint: '"sonarQubeAnalysis"'
              properties:
                branch: .branch.name
                fixedIssues: .measures.violations_fixed
                newIssues: .measures.violations_added
                coverage: .measures.coverage_change
                duplications: .measures.duplicated_lines_density_change
                createdAt: .branch.analysisDate
    ```

    </details>

3. Click `Save & Resync` to apply the mapping.

Great! Now that the mapping is configured, you will need to manually ingest your SonarQube analyses data into Port.


## Relate pull requests to SonarQube analyses

Now that Port is synced with our SonarQube resources, let's map the SonarQube analyses to the Github pull requests.

First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/relate-blueprints.md) between our `githubPullRequest` and the corresponding `sonarQubeAnalysis`.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

    <img src='/img/guides/githubPRSonarRelation.png' width='60%' border='1px' />

    <br/><br/>

2. Fill out the form like this, then click `Create`:

    <img src='/img/guides/githubPREditSonarRelation.png' width='60%' border='1px' />

    <br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant SonarQube analysis to each of our pull requests.   
This can be done by adding some mapping logic using a[search query](https://docs.port.io/build-your-software-catalog/customize-integrations/configure-mapping#mapping-relations-using-search-queries), which allow us to match PRs with SonarQube analyses based on the knowledge of the value of one of the entity's properties.

The following steps demonstrate how to match PRs with SonarQube analyses using search queries.

<Tabs>
<TabItem value="title_branch_matching" label="Match by Title & Branch" default>

1. Go to your [data sources page](https://app.getport.io/settings/data-sources)
2. Click on your Github integration:
    <img src='/img/guides/githubIntegrationWithBlueprints.png' border='1px' />

    <br/><br/>

3. Under the `resources` key, locate the Pull Request block
4. Replace it with the following YAML block to map the pull request entities with SonarQube analyses:

    <details>
    <summary><b>Relation mapping (click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: pull-request
        selector:
          query: "true"
        port:
          entity:
            mappings:
              identifier: .head.repo.name + '-' + (.number|tostring)
              title: .title
              blueprint: '"githubPullRequest"'
              properties:
                creator: .user.login
                assignees: "[.assignees[].login]"
                reviewers: "[.requested_reviewers[].login]"
                status: .status
                closedAt: .closed_at
                updatedAt: .updated_at
                mergedAt: .merged_at
                prNumber: .id
                link: .html_url
              relations:
                sonarAnalysis:
                  combinator: '"and"'
                  rules:
                    - property: '"$title"'
                      operator: '"="'
                      value: .title
                    - property: '"branch"'
                      operator: '"="'
                      value: .head.ref
    ```

    </details>

5. Click `Save & Resync` to apply the changes

:::tip Mapping explanation
This configuration uses the `title` and `branch` properties to establish a relationship with SonarQube analysis based on matching properties. The `title` property is common to both GitHub pull requests and SonarQube analyses, making it a reliable identifier for matching related entities. The `branch` property gives information about the source and destination of the code changes.
:::

</TabItem>

<TabItem value="commit_sha_matching" label="Match by Commit SHA">

1. Go to your [data sources page](https://app.getport.io/settings/data-sources)
2. Click on your Github integration:
    <img src='/img/guides/githubIntegrationWithBlueprints.png' border='1px' />

    <br/><br/>

3. Under the `resources` key, locate the Pull Request block
4. Replace it with the following YAML block to map the pull request entities with SonarQube analyses using commit SHA:

    <details>
    <summary><b>Search query mapping (click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: pull-request
        selector:
          query: "true"
        port:
          entity:
            mappings:
              identifier: .head.repo.name + '-' + (.number|tostring)
              title: .title
              blueprint: '"githubPullRequest"'
              properties:
                creator: .user.login
                assignees: "[.assignees[].login]"
                reviewers: "[.requested_reviewers[].login]"
                status: .status
                closedAt: .closed_at
                updatedAt: .updated_at
                mergedAt: .merged_at
                prNumber: .id
                link: .html_url
              relations:
                sonarAnalysis:
                  combinator: '"and"'
                  rules:
                    - property: '"commitSha"'
                      operator: '"="'
                      value: .head.sha
    ```

    </details>

5. Click `Save & Resync` to apply the changes

:::tip Mapping explanation
This configuration uses the `commitSha` property to establish a relationship with SonarQube analysis. This is a reliable way to match PRs with their corresponding SonarQube analyses since each commit has a unique SHA.
:::

</TabItem>
</Tabs>

After applying the mapping configuration above, you will see the pull request entities in your software catalog with their related SonarQube analyses.

<img src='/img/guides/githubPREntityAfterAnalysisMapping.png' width="100%" border='1px' />



## Configure mirror properties on pull request

When looking at a `Pull Request`, some of its `sonarAnalysis` properties may be especially important to us, and we would like to see them directly in the `Pull Request's` context. This can be achieved using [mirror properties](https://docs.port.io/build-your-software-catalog/define-your-data-model/setup-blueprint/properties/mirror-property/), so let's create some:

1. The first one will be the number of new issues added to the analysis. Under the relation we just created, click on `New mirror property`:

    <img src='/img/guides/githubPRCreateMirrorProp.png' width='50%' border='1px' />

    <br/><br/>

2. Fill the form out like this, then click `Create`:

    <img src='/img/guides/githubPrCreateMirrorPropNewIssue.png' width='50%' border='1px' />

    <br/><br/>

3. The second one will be the analysis code duplication. Create another mirror property, fill the form out like this, then click `Create`:

    <img src='/img/guides/githubPrCreateMirrorPropDuplication.png' width='50%' border='1px' />

    <br/><br/>

4. The third one will be the analysis coverage. Create another mirror property, fill the form out like this, then click `Create`:

    <img src='/img/guides/githubPrCreateMirrorPropCoverage.png' width='50%' border='1px' />

    <br/><br/>

5. The fourth one will be the quality gate status of the analysis. Create another mirror property, fill the form out like this, then click `Create`:

    <img src='/img/guides/githubPrCreateMirrorPropQGStatus.png' width='50%' border='1px' />

    <br/><br/>

You should now be able to see these additional properties added to pull request entity in your software catalog.

## Conclusion

By following these steps, you can seamlessly connect a GitHub pull request with a SonarQube analysis using either:
- Title and branch matching (matching based on PR title and branch name)
- Commit SHA matching (matching based on the commit SHA)

Choose the approach that best fits your team's workflow and requirements. Title and branch matching is more flexible but may require more configuration, while commit SHA matching is more precise but requires the SonarQube analysis to be run on the exact commit.

More relevant guides and examples:

- [Port's SonarQube integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube)
- [Integrate scorecards with Slack](https://docs.port.io/promote-scorecards/manage-using-3rd-party-apps/slack)
- [Connect GitHub repository with SonarQube Project](https://docs.port.io/guides/all/connect-github-repository-with-sonarqube-project)
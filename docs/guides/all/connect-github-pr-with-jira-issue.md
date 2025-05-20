---
sidebar_position: 10
title: Connect GitHub Pull Request with Jira Issue
displayed_sidebar: null
description: Effortlessly connect GitHub PRs with Jira issues in Port, enhancing traceability and improving project workflows.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect GitHub Pull Request with Jira Issue

## Overview
This guide aims to cover how to connect a GitHub pull request with a Jira Issue to understand the scan results of your pull request.

## Prerequisites
- This guide assumes you have a Port account and that you have finished the [onboarding process](/getting-started/overview).
- Install Port's [Jira integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/jira/).
- Install Port's [GitHub app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/#setup).



## Set up data model

We highly recommend you install both the GitHub app and Jira integration to have pull requests and issues automatically ingested into Port in real-time.
However, if you haven't installed [Port's GitHub app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) and [Jira integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/jira/), you'll need to create blueprints for GitHub pull requests and Jira issues in Port. Skip this section if you have already installed the GitHub app and Jira integration.

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

Great! Now that the mapping is configured, you will need to manually ingest your pull requests data into Port


### Add Jira issue blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>Jira Issue Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "jiraIssue",
      "title": "Jira Issue",
      "icon": "Jira",
      "schema": {
        "properties": {
          "url": {
            "title": "Issue URL",
            "type": "string",
            "format": "url",
            "description": "URL to the issue in Jira"
          },
          "status": {
            "title": "Status",
            "type": "string",
            "description": "The status of the issue"
          },
          "issueType": {
            "title": "Type",
            "type": "string",
            "description": "The type of the issue"
          },
          "components": {
            "title": "Components",
            "type": "array",
            "description": "The components related to this issue"
          },
          "assignee": {
            "title": "Assignee",
            "type": "string",
            "format": "user",
            "description": "The user assigned to the issue"
          },
          "reporter": {
            "title": "Reporter",
            "type": "string",
            "description": "The user that reported to the issue",
            "format": "user"
          },
          "creator": {
            "title": "Creator",
            "type": "string",
            "description": "The user that created to the issue",
            "format": "user"
          },
          "priority": {
            "title": "Priority",
            "type": "string",
            "description": "The priority of the issue"
          },
          "created": {
            "title": "Created At",
            "type": "string",
            "description": "The created datetime of the issue",
            "format": "date-time"
          },
          "updated": {
            "title": "Updated At",
            "type": "string",
            "description": "The updated datetime of the issue",
            "format": "date-time"
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

### Add Jira mapping config

1. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your Jira integration.

2. Under the `resources` key, add the following YAML block to map Jira issues:

    <details>
    <summary><b>Jira Issue mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: issue
        selector:
          query: "true"
        port:
          entity:
            mappings:
              identifier: .key
              title: .fields.summary
              blueprint: '"jiraIssue"'
              properties:
                url: .self
                status: .fields.status.name
                issueType: .fields.issuetype.name
                components: "[.fields.components[].name]"
                assignee: .fields.assignee.emailAddress
                reporter: .fields.reporter.emailAddress
                creator: .fields.creator.emailAddress
                priority: .fields.priority.name
                created: .fields.created
                updated: .fields.updated
    ```

    </details>

3. Click `Save & Resync` to apply the mapping.

Great! Now that the mapping is configured, you will need to manually ingest your Jira issues data into Port



## Relate pull requests to Jira issues

Now that Port is synced with our Jira resources, let's map the Jira issues to the Github pull requests.

First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/relate-blueprints.md) between our `githubPullRequest` and the corresponding `jiraIssue`.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

    <img src='/img/guides/githubPRNewJiraIssueRelation.png' width='60%' border='1px' />

    <br/><br/>

2. Fill out the form like this, then click `Create`:

    <img src='/img/guides/githubPRCreateNewRelation.png' width='60%' border='1px' />

    <br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant Jira Issue to each of our pull requests.   
This can be done by adding some mapping logic, using one of the following methods: 

<Tabs>
<TabItem value="direct_identifier_mapping" label="Direct identifier mapping" default>

The most straightforward way to set a relation's value is to explicitly specify the related entity's identifier.   
Follow the steps below to map pull request entities with Jira issues using direct identifier mapping:


1. Go to your [data sources page](https://app.getport.io/settings/data-sources)

2. Click on your Github integration:
    <img src='/img/guides/githubIntegrationWithBlueprints.png' border='1px' />

    <br/><br/>

3. Under the `resources` key, find the Pull Request block

4. Replace it with the following YAML configuration to map pull request entities with Jira issues:

    <details>
    <summary><b>Relation mapping (click to expand)</b></summary>

    ```yaml showLineNumbers
        - kind: pull-request
        selector:
            query: "true"
        port:
            entity:
            mappings:
            identifier: .head.repo.name + (.id|tostring)
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
              repository: .head.repo.name
              jiraIssue: .title | match("^[A-Za-z]+-[0-9]+") .string
    ```

    </details>

5. Click `Save & Resync` to apply the changes

:::tip Mapping explanation
The configuration mapping above ingests all pull requests from Github. It then goes ahead to establish a relation between the `githubPullRequest` entities and the `jiraIssue` entities &nbsp;🎉.

Please note that the `.head.repo.name` property refers to the name of the repository while the `.id` property refers to the ID of the pull request itself. In our GitHub integration mapping, we have defined these two pieces of information as the identifiers for the `githubPullRequest` entities.

For the `jiraIssue` relation, we extract the Jira Issue key from the title of the pull request. Therefore, only pull requests containing the key of the Jira issue will be mapped to their respective Jira issues. Below are few examples and corresponding output:

| Pull request title                          | Jira issue  |
| ------------------------------------------- | ----------- |
| PORT-4837 \| This is the evening of the day | PORT-4837   |
| GET-14 - This is the evening of the day     | GET-14      |
| This is the evening of the day              | (no output) |

:::

</TabItem>

<TabItem value="search_query" label="Search query">

 You can also use a [search query](https://docs.port.io/build-your-software-catalog/customize-integrations/configure-mapping#mapping-relations-using-search-queries) to match PRs with Jira issues based on multiple criteria.

 This approach is particularly useful when you don't know the entity's identifier, but you do know the value of one of its properties. 

Follow the steps below to match PRs with Jira issues based on multiple criteria (title, description, branch name).
You can customize these matching rules based on your team's conventions and requirements.

1. Go to your [data sources page](https://app.getport.io/settings/data-sources)
2. Click on your Github integration
    <img src='/img/guides/githubIntegrationWithBlueprints.png' border='1px' />

    <br/><br/>
3. Under the `resources` key, locate the Pull Request block
4. Replace it with the following YAML block to map the pull request entities with Jira issues using search queries:

    <details>
    <summary><b>Search query mapping (click to expand)</b></summary>

    ```yaml showLineNumbers
      - kind: pull-request
        selector:
          query: "true"
        port:
          entity:
            mappings:
              identifier: .head.repo.name + (.id|tostring)
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
                jiraIssue:
                  combinator: '"or"'
                  rules:
                    # Match Jira issue key in PR title
                    - property: '"$identifier"'
                      operator: '"="'
                      value: (.title // "") | match("^[A-Za-z]+-[0-9]+") .string

                    # Match Jira issue key in PR description
                    - property: '"$identifier"'
                      operator: '"="'
                      value: (.body // "") | match("[A-Za-z]+-[0-9]+") .string
                    
                    # Match Jira issue key in PR branch name
                    - property: '"$identifier"'
                      operator: '"="'
                      value: (.head.ref // "") | match("[A-Za-z]+-[0-9]+") .string
    ```

    </details>

5. Click `Save & Resync` to apply the changes

</TabItem>
</Tabs>

<img src='/img/guides/githubPREntityAfterJiraIssueMapping.png' border='1px' />

## Conclusion

By following these steps, you can seamlessly connect a GitHub pull request with a Jira Issue using either:
- Direct identifier mapping (extracting Jira issue keys from PR titles)
- Search relations (matching based on multiple criteria like title, description, and branch name)

Choose the approach that best fits your team's workflow and requirements. Search relations offer more flexibility but may require more configuration, while direct identifier mapping is simpler but less flexible.

More relevant guides and examples:

- [Port's Jira integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/jira/)
- [Integrate scorecards with Slack](https://docs.port.io/promote-scorecards/manage-using-3rd-party-apps/slack)

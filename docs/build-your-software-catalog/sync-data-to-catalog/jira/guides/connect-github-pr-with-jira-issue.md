---
sidebar_position: 10
title: Connect GitHub Pull Request with Jira Issue
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect GitHub Pull Request with Jira Issue

This guide aims to cover how to connect a GitHub pull request with a Jira Issue to understand the scan results of your PR.

:::tip Prerequisites
- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart).
- Ensure you have [Jira installed and configured in your environment](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/jira/)
- Ensure you have a registered organization in Port and your Port user role is set to `Admin`.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install a relevant integration.

:::

<br/>

## Integrate GitHub resources with Port

The goal of this section is to fill the software catalog with data directly from your GitHub organization. [Port's GitHub app](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/github/) allows you to import `repositories`, `pull requests`, `workflows`, `teams` and other GitHub objects. For the purpose of this guide, we shall focus on pull requests (PR) object only. Follow the steps below to ingest your PR data to Port.

:::info Note
For the GitHub app installation you will need to have a registered organization in Port and your Port user role must be set to `Admin` (see [prerequisites](#connect-github-pull-request-with-jira-issue)).

:::

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model)

2. Create a GitHub pull request <PortTooltip id="blueprint">blueprint</PortTooltip> using this schema:
<details>
<summary>GitHub pull request blueprint (click to expand)</summary>

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

3. Install Port's GitHub app by following the [installation guide](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/github/installation)

4. Now that the integration is installed successfully, we need to ingest `githubPullRequest` data from the GitHub organization into the software catalog. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/dev-portal/data-sources), and click on your GitHub integration:

<img src='/img/guides/githubIntegration.png' border='1px' />

Add the following YAML block into the editor to ingest pull request data. Then click `Save & Resync`:

<details>
<summary>Relation mapping (click to expand)</summary>

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

You should now be able to see your GitHub pull requests ingested successfully in the software catalog.

## Integrate Jira into Port

The goal of this section is to bring our Jira issues into Port. [Port's Jira integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/jira/) (powered by [Ocean](https://ocean.getport.io/)) allows you to import `projects` and `issues` from your Jira account into Port. The integration automatically creates <PortTooltip id="blueprint">blueprints</PortTooltip> and <PortTooltip id="entity">entities</PortTooltip> for these resources.

:::info Note
For this installation you will need Helm and a running K8s cluster (see [prerequisites](#connect-github-pull-request-with-jira-issue)).

:::

1. Install Port's Jira integration using Helm, by running the command below in your terminal.

- Replace `CLIENT_ID` and `CLIENT_SECRET` with your credentials (get them [here](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials)).

- Replace `jiraHost` with the host URL to your Jira application. To obtain it, simply copy it from the url address bar when you are on your Jira dashboard. It has the format, `<org name>.atlassian.com`. If you are on Jira self-hosted, you can simply use the host URL where your Jira application is hosted.

- Replace `atlassianUserEmail` with the email associated with your Atlassian account.

- Replace `atlassianUserToken` with a token generated from your Atlassian account. Follow the Atlassian guide on [using personal access tokens](https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html)

<details>
<summary>Installation command (click to expand)</summary>

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-jira-integration port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \  # REPLACE VALUE
	--set port.clientSecret="PORT_CLIENT_SECRET"  \  # REPLACE VALUE
	--set initializePortResources=true  \
	--set integration.identifier="my-jira-integration"  \
	--set integration.type="jira"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.secrets.jiraHost="MY_JIRA_HOST"  \  # REPLACE VALUE
	--set integration.secrets.atlassianUserEmail="MY_ATLASSIAN_USER_EMAIL"  \  # REPLACE VALUE
	--set integration.config.atlassianUserToken="MY_ATLASSIAN_USER_TOKEN"  # REPLACE VALUE
```

</details>

2. Great! Now that the integration is installed, we should see some new components in Port:

- Go to your [Builder](https://app.getport.io/dev-portal/data-model), you should now see four new <PortTooltip id="blueprint">blueprints</PortTooltip> created by the integration - `Jira Project` and `Jira Issue`.
- Go to your [Software catalog](https://app.getport.io/services), click on `Jira Issue` in the sidebar, you should now see new <PortTooltip id="entity">entities</PortTooltip> created for all your Jira issues

## Create the Jira Issue relation

Now that Port is synced with our Jira resources, let's map the Jira issues to the Github pull requests.
First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/relate-blueprints.md) between our `githubPullRequest` and the corresponding `jiraIssue`.

1. Head back to the [Builder](https://app.getport.io/dev-portal/data-model), choose the `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/guides/githubPRNewJiraIssueRelation.png' width='60%' border='1px' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/githubPRCreateNewRelation.png' width='60%' border='1px' />

<br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant Jira Issue to each of our pull requests. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/dev-portal/data-sources), and click on your Github integration:

<img src='/img/guides/githubIntegrationWithBlueprints.png' border='1px' />

<br/><br/>

Under the `resources` key, locate the Pull Request block and replace it with the following YAML block to map the pull request entities with Jira issues. Then click `Save & Resync`:

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

<img src='/img/guides/githubPREntityAfterJiraIssueMapping.png' border='1px' />

## Conclusion

By following these steps, you can seamlessly connect a GitHub pull request with a Jira Issue.

More relevant guides and examples:

- [Port's Jira integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/jira/)
- [Integrate scorecards with Slack](https://docs.getport.io/promote-scorecards/manage-using-3rd-party-apps/slack)

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

This guide aims to cover how to connect a GitHub pull request with a SonarQube analysis to understand the scan results of your PR.

:::info Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/getting-started/overview).
- Ensure you have [SonarQube ocean integration](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube/sonarqube.md) installed and configured in your environment.
- Ensure you have a registered organization in Port and your Port user role is set to `Admin`.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install a relevant integration.

:::

<br/>

## Integrate GitHub resources with Port

The goal of this section is to fill the software catalog with data directly from your GitHub organization. [Port's GitHub app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) allows you to import `repositories`, `pull requests`, `workflows`, `teams` and other GitHub objects. For the purpose of this guide, we shall focus on pull requests (PR) object only. Follow the steps below to ingest your PR data to Port.

:::info Note
For the GitHub app installation you will need to have a registered organization in Port and your Port user role must be set to `Admin` (see [prerequisites](#)).
:::

1. Go to your [Builder](https://app.getport.io/settings/data-model)

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

3. Install Port's GitHub app by following the [installation guide](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/#setup)

4. Now that the integration is installed successfully, we need to ingest `githubPullRequest` data from the GitHub organization into the software catalog. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your GitHub integration:

    <img src='/img/guides/githubAppIntegration.png' border='1px' />


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

## Integrate SonarQube into Port

The goal of this section is to bring our SonarQube analysis data into Port. [Port's SonarQube integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube) (powered by [Ocean](https://ocean.getport.io/)) allows you to import `projects`, `issues` and `analyses` from your SonarQube account into Port. The integration automatically creates <PortTooltip id="blueprint">blueprints</PortTooltip> and <PortTooltip id="entity">entities</PortTooltip> for these resources.

:::info Note
For this installation you will need Helm and a running K8s cluster (see [prerequisites](#)).
:::

1. Install Port's SonarQube integration using Helm, by running the command below in your terminal.

   - Replace `CLIENT_ID` and `CLIENT_SECRET` with your credentials (get them [here](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials)).

   - Replace `sonarApiToken` with your SonarQube token. To obtain it, [follow this documentation](https://docs.sonarsource.com/sonarqube/9.6/user-guide/user-account/generating-and-using-tokens/#generating-a-token).

   - Replace `sonarOrganizationId` with your SonarQube organization ID. To obtain it, [follow this documentation](https://docs.sonarsource.com/sonarcloud/appendices/project-information/#project-and-organization-keys). Note that the SonarQube organization ID is not required when using on-prem sonarqube instance.

   <details>
   <summary>Installation command (click to expand)</summary>

   ```bash showLineNumbers
   helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
   helm upgrade --install my-sonarqube-integration port-labs/port-ocean \
   	--set port.clientId="PORT_CLIENT_ID"  \  # REPLACE VALUE
   	--set port.clientSecret="PORT_CLIENT_SECRET"  \  # REPLACE VALUE
   	--set initializePortResources=true  \
   	--set integration.identifier="my-sonarqube-integration"  \
   	--set integration.type="sonarqube"  \
   	--set integration.eventListener.type="POLLING"  \
   	--set integration.secrets.sonarApiToken="MY_API_TOKEN"  \  # REPLACE VALUE
   	--set integration.config.sonarOrganizationId="MY_ORG_KEY"  # REPLACE VALUE
   ```
   </details>

2. Great! Now that the integration is installed, we should see some new components in Port:

   - Go to your [Builder](https://app.getport.io/settings/data-model), you should now see three new <PortTooltip id="blueprint">blueprints</PortTooltip> created by the integration - `SonarQube Project`, `SonarQube Issue` and `SonarQube Analysis`.
   - Go to your [Software catalog](https://app.getport.io/services), click on `SonarQube Analysis` in the sidebar, you should now see new <PortTooltip id="entity">entities</PortTooltip> created for all your SonarQube analysis.


## Create the Sonar analysis relation

Now that Port is synced with our SonarQube resources, let's map the SonarQube analysis to the pull requests to display the result of the sonar scan.
First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) between our `githubPullRequest` and the corresponding `sonarQubeAnalysis`.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/guides/githubPRSonarRelation.png' width='60%' border='1px' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/githubPREditSonarRelation.png' width='60%' border='1px' />

<br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related,
we need to assign the relevant SonarQube analysis to each of our pull requests.
This can be done by adding some mapping logic.
Go to your [data sources page](https://app.getport.io/settings/data-sources),
and click on your GitHub Pull Request integration:
<img src='/img/guides/githubPrIntegrationDataSource.png' border='1px' />

<br/><br/>

## Relation Mapping
There are two ways
to establish the relationship between a GitHub `pull-request` entity and a SonarQube `analysis` entity:

### Matching Common Pull Request Title and Branch

The first way is to use the `title` and `branch` properties:
- **Why use `title` and `branch` properties?**
  The `title` property is common to both GitHub pull requests and SonarQube analyses,
  making it a reliable identifier for matching related entities.
  The `branch` property gives information about the source and destination of the the code changes. Combining the title with the branch offers a robust mapping, ensuring that entities are correctly matched in situations where there are similar pull request titles but on different branches.

- Go to your [data sources page](https://app.getport.io/settings/data-sources) and click on the GitHub exporter:
  <img src='/img/guides/githubExporter.png' width='100%' border='1px' />


- Replace the mapping YAML with this content:

  ```yaml showLineNumbers
  resources:
     - kind: pull-request
       selector:
          query: 'true'
       port:
          entity:
             mappings:
                identifier: .head.repo.name + '-' + (.number|tostring)
                title: .title
                blueprint: '"githubPullRequest"'
                properties:
                   creator: .user.login
                   assignees: '[.assignees[].login]'
                   reviewers: '[.requested_reviewers[].login]'
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

This configuration uses the `title` and `branch` properties to establish a relationship with SonarQube analysis based on matching properties.

### Matching Pull Request Commit SHA

The second way is to use the `commitSha` property that is common to both the pull request and SonarQube analysis:
   
- Go to the [data model](https://app.getport.io/settings/data-model) page of your portal
- Go to the `SonarQube` <PortTooltip id="blueprint">blueprint</PortTooltip>.
- Hover over it, click on the `...` button on the right, and select `Edit JSON`.
<br></br>

<img src='/img/guides/sonarQubeAnalysisBlueprintUpdate.png' width='40%' border='1px' />

<br></br>

Add the `commitSha` **property** and `Save`:

- Go to your [data sources page](https://app.getport.io/settings/data-sources) and click on the GitHub exporter:

- Replace the `pull-request` mapping YAML with this content:

```yaml showLineNumbers
  resources:
     - kind: pull-request
       selector:
          query: 'true'
       port:
          entity:
             mappings:
                identifier: .head.repo.name + '-' + (.number|tostring)
                title: .title
                blueprint: '"githubPullRequest"'
                properties:
                   creator: .user.login
                   assignees: '[.assignees[].login]'
                   reviewers: '[.requested_reviewers[].login]'
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


:::tip Mapping explanation

In this implementation,
we used search relation features
to map relationships between `githubPullRequest` entities and `sonarAnalysis` entities based on specific **properties** rather than direct identifiers.
By using **properties** like `title`, `branch`, and `commitSha`, we are able to establish a between the two entities.
:::

<img src='/img/guides/githubPREntityAfterAnalysisMapping.png' width="70%" border='1px' />

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

5. The third one will be the quality gate status of the analysis. Create another mirror property, fill the form out like this, then click `Create`:

<img src='/img/guides/githubPrCreateMirrorPropQGStatus.png' width='50%' border='1px' />

<br/><br/>

You should now be able to see these additional properties added to pull request entity in your software catalog.

## Conclusion

By following these steps, you can seamlessly connect a GitHub pull request with a SonarQube analysis.

More relevant guides and examples:

- [Port's SonarQube integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube)
- [Integrate scorecards with Slack](https://docs.port.io/promote-scorecards/manage-using-3rd-party-apps/slack)
- [Connect GitHub repository with SonarQube Project](https://docs.port.io/guides/all/connect-github-repository-with-sonarqube-project)
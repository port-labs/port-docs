# Add tags to SonarQube project

This guide shows how to quickly add tags to a SonarQube project via Port's self-service actions with ease. Tagging projects in SonarQube allows you to categorize and label your projects based on various attributes such as technology stack, business domain, team ownership etc. In this action, we will add tags to enable you to more easily connect a SonarQube project to a service in Port.

## Prerequisites
1. [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed.
2. SonarQube instance URL, SonarQube API token. Check [SonarQube's documentation](https://docs.sonarsource.com/sonarqube/latest/user-guide/user-account/generating-and-using-tokens/) on how to retrieve your API Token
3. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
    * `SONARQUBE_HOST_URL` - SonarQube instance URL. `https://sonarqube.com` if using Sonarcloud.
    * `SONARQUBE_API_TOKEN` - SonarQube API token. This can be a Project Analysis token for the specific project, a Global Analysis token or a user token. Requires the following permission: 'Administer' rights on the specified project.
    * `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
    * `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)

4. Optional - Install Port's SonarQube integration [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube)

:::tip SonarQube integration

The above step is not required for this example, but it will create all the blueprint boilerplate for you, and also update the catalog in real time with the new incident created.

:::

5. In case you decided not to install the SonarQube integration, you will need to create a blueprint for the SonarQube Project in Port.

<details>
<summary> <b> SonarQube Project Blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "sonarQubeProject",
  "title": "SonarQube Project",
  "icon": "sonarqube",
  "schema": {
    "properties": {
      "organization": {
        "type": "string",
        "title": "Organization",
        "icon": "TwoUsers"
      },
      "link": {
        "type": "string",
        "format": "url",
        "title": "Link",
        "icon": "Link"
      },
      "lastAnalysisDate": {
        "type": "string",
        "format": "date-time",
        "icon": "Clock",
        "title": "Last Analysis Date"
      },
      "numberOfBugs": {
        "type": "number",
        "title": "Number Of Bugs"
      },
      "numberOfCodeSmells": {
        "type": "number",
        "title": "Number Of CodeSmells"
      },
      "numberOfVulnerabilities": {
        "type": "number",
        "title": "Number Of Vulnerabilities"
      },
      "numberOfHotSpots": {
        "type": "number",
        "title": "Number Of HotSpots"
      },
      "numberOfDuplications": {
        "type": "number",
        "title": "Number Of Duplications"
      },
      "coverage": {
        "type": "number",
        "title": "Coverage"
      },
      "mainBranch": {
        "type": "string",
        "icon": "Git",
        "title": "Main Branch"
      },
      "tags": {
        "type": "array",
        "title": "Tags"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```
</details>

## GitHub Workflow

Create the file `add-tags-to-sonarqube-project.yml` in the `.github/workflows` folder of your repository and copy the content of the workflow configuration below:

:::tip
We recommend creating a dedicated repository for the workflows that are used by Port actions.
:::

<details>
<summary><b>Add tags to SonarQube project workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Add tags to SonarQube project
on:
  workflow_dispatch:
    inputs:
      tags:
        type: string
        required: true
      port_payload:
        required: true
        description: Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
        type: string
    secrets:
      SONARQUBE_HOST_URL:
        required: true
      SONARQUBE_API_TOKEN:
        required: true

jobs:
  create-entity-in-port-and-update-run:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port of start of request to SonarQube
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Starting request to add tags to SonarQube project
      
      - name: Add tags to SonarQube project
        uses: fjogeleit/http-request-action@v1
        with:
          url: "${{ secrets.SONARQUBE_HOST_URL }}/api/project_tags/set?project=${{ fromJson(inputs.port_payload).context.entity }}&tags=${{ inputs.tags }}"
          method: "POST"
          bearerToken: ${{ secrets.SONARQUBE_API_TOKEN }}
          customHeaders: '{"Content-Type": "application/json"}'

      - name: Inform Port of completion of request to SonarQube
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Finished request to create SonarQube project
```
</details>

## Port Configuration

On the [self-service](https://app.getport.io/self-serve) page, create the Port action against the `SonarQube Project` blueprint. This will trigger the GitHub workflow.

<details>
<summary><b>Add tags to SonarQube project action (Click to expand)</b></summary>

:::tip Modification Required
Make sure to replace `<GITHUB_ORG>` and `<GITHUB_REPO>` with your GitHub organization and repository names respectively.
:::

```json showLineNumbers
{
  "identifier": "add_tags_to_sonar_qube_project",
  "title": "Add Tags to SonarQube project",
  "icon": "sonarqube",
  "userInputs": {
    "properties": {
      "tags": {
        "title": "Tags",
        "description": "Comma separated list of tags",
        "icon": "DefaultProperty",
        "type": "string"
      }
    },
    "required": [
      "tags"
    ],
    "order": [
      "tags"
    ]
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "add-tags-to-sonarqube-project.yml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "DAY-2",
  "description": "Adds additional tags to a project in SonarQube",
  "requiredApproval": false
}
```
</details>

:::info API limitations
Due to SonarQube API's limitation, this action replaces the tags on the project with the new ones specified. If you want to add to the already existing tags, copy the existing tags and add it with the new ones you are adding.
:::

## Let's test it

1. Trigger the action from Port's [Self Serve](https://app.getport.io/self-serve)

2. Done! wait for the project tags to be updated in SonarQube

Congrats 🎉 You've added tags to your SonarQube project from Port!


## More relevant guides and examples
- [A mini guide to connect SonarQube project to a service](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube/guides/connect-sonar-project-to-service)
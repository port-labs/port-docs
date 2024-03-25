# Add tags to SonarQube project

## Overview
This guide shows how to quickly add tags to a SonarQube project via Port self-service actions with ease.

## Prerequisites
* SonarQube instance URL, SonarQube API token. Check [SonarQube's documentation](https://docs.sonarsource.com/sonarqube/latest/user-guide/user-account/generating-and-using-tokens/) on how to retrieve your API Token
* [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed.

## Steps
1. Create the following GitHub action secrets
    * `SONARQUBE_HOST_URL` - SonarQube instance URL. `https://sonarqube.com` if using Sonarcloud.
    * `SONARQUBE_API_TOKEN` - SonarQube API token. This can be a Project Analysis token for the specific project, a Global Analysis token or a user token. Requires the following permission: 'Administer' rights on the specified project.
    * `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
    * `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)

2. Optional - Install Port's SonarQube integration [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube)

:::info Blueprint

The above step is not required for this example, but it will create all the blueprint boilerplate for you, and also update the catalog in real time with the new incident created.

:::

3. After you installed the integration, the blueprints `sonarQubeProject`, `sonarQubeIssue` and `sonarQubeAnalysis` will appear, create the following action with the following JSON file on the `sonarQubeProject` blueprint:

<details>
<summary><b>Add tags to SonarQube project (Click to expand)</b></summary>

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
    "org": "<Enter GitHub organization>",
    "repo": "<Enter GitHub repository>",
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

:::info Customization information

In the `invocationMethod` section, replace the `org` and `repo` values with your own repository details

:::

4. Create a workflow file under `.github/workflows/add-tags-to-sonarqube-project.yml` using the workflow:

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
      - name: Create a log message
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

      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Finished request to create ServiceNow incident
```

</details>

5. Trigger the action from Port's [Self Serve](https://app.getport.io/self-serve)

6. Done! wait for the project tags to be updated in SonarQube

Congrats 🎉 You've added tags to your SonarQube project from Port!

:::info API limitations

Due to SonarQube API's limitation, this action replaces the tags on the project with the new ones specified. If you want to add to the already existing tags, copy the existing tags and add it with the new ones you are adding.

:::
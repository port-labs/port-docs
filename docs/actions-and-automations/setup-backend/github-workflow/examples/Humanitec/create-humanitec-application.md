import GithubActionModificationHint from '../../\_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '../../\_github_dedicated_workflows_repository_hint.mdx'
import HumanitecApplicationBlueprint from './blueprints/_humanitec_application_blueprint.mdx'

# Create Application In Humanitec

## Overview
This self service guide provides a comprehensive walkthrough on how to create an application in Humanitec from Port using Port's self service actions.

:::tip Prerequisites
1. [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed.
2. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
   - `HUMANITEC_API_KEY` - [Humanitec API Key](https://developer.humanitec.com/platform-orchestrator/reference/api-references/#authentication)
   - `HUMANITEC_ORG_ID` - [Humanitec Organization ID](https://developer.humanitec.com/concepts/organizations/)
   - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
   - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
3. Optional - Install Port's Humanitec integration [learn more](/docs/build-your-software-catalog/custom-integration/api/ci-cd/github-workflow/guides/humanitec/humanitec.md)
:::

:::tip Humanitec Integration
This step is not required for this example, but it will create all the blueprint boilerplate for you, and also ingest and update the catalog in real time with your Humanitec Application.
:::

<HumanitecApplicationBlueprint/>

## GitHub Workflow

Create the file `.github/workflows/create-humanitec-application.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary>GitHub Workflow</summary>

```yaml showLineNumbers title="create-humanitec-application.yaml"
name: Create Humanitec Application
on:
  workflow_dispatch:
    inputs:
      application_name:
        type: string
        required: true
        description: The Human-friendly name for the Application. 
      environment:
        description: The ID the Environment is referenced as.
        required: true
        type: string
      environment_name:
        type: string
        description: The Human-friendly name for the Environment
        required: true
      environment_type:
        required: true
        type: string
        description: The Environment Type. This is used for organizing and managing Environments.
      port_context:
        required: true
        description: includes blueprint, run ID, and entity identifier from Port.

jobs:
  create-application:
    runs-on: ubuntu-latest
    steps:
      - name: Create Application
        id: create_application
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.humanitec.io/orgs/${{secrets.HUMANITEC_ORG_ID}}/apps'
          method: 'POST'
          customHeaders: '{"Content-Type": "application/json", "Authorization": "Bearer ${{ secrets.HUMANITEC_API_ KEY
          data: >-
            {
              "env": {
              "id": ${{inputs.environment}},
              "name": ${{inputs.environment_name}},
              "type": ${{inputs.environment_type}}
              },
              "id": ${{fromJson(inputs.port_context).entity}},
              "name": ${{inputs.applicatioin_name}}
            }

      - name: Log Create Application Request Failure 
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Failed to create application ..."

      - name: UPSERT Humanitec Application to Port
        uses: port-labs/port-github-action@v1
        with:
          identifier: "${{ fromJson(steps.create_application.outputs.response).id }}" 
          title: "${{ fromJson(steps.create_application.outputs.response).id }}"
          icon: Microservice
          blueprint: "${{fromJson(inputs.port_context).blueprint}}"
          properties: |-
            {
              "createdAt": "${{ fromJson(steps.create_application.outputs.response).created_at }}"
            }
          relations: "{}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{fromJson(inputs.port_context).run_id}}
          
      - name: Log Create Application Request Success
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: |
             Humanitech application has been successfully created! ✅
```

</details>

## Port Configuration

Create a new self service action using the following JSON configuration.

<details>
<summary><b> Create Application In Humanitec (click to expand) </b></summary>

<GithubActionModificationHint/>

```json showLineNumbers
{
  "identifier": "create_application",
  "title": "Create Application",
  "icon": "Microservice",
  "description": "Create Humanitec Application",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "application_name": {
          "icon": "Microservice",
          "type": "string",
          "title": "Application Name",
          "description": "The Human-friendly name for the Application."
        },
        "environment": {
          "icon": "Environment",
          "title": "Environment",
          "description": "Environment ID",
          "type": "string",
          "blueprint": "humanitecEnvironment",
          "format": "entity"
        },
        "environment_type": {
          "type": "string",
          "title": "Environment Type",
          "description": "The Environment Type. This is used for organizing and managing Environments.",
          "icon": "Environment"
        },
        "environment_name": {
          "type": "string",
          "description": "The Human-friendly name for the Environment.",
          "title": "Environment Name",
          "icon": "Environment"
        }
      },
      "required": [
        "application_name"
      ],
      "order": [
        "application_name",
        "environment",
        "environment_name",
        "environment_type"
      ]
    },
    "blueprintIdentifier": "humanitecApplication"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "create-humanitec-application.yaml",
    "workflowInputs": {
      "application_name": "{{ .inputs.\"application_name\" }}",
      "environment": "{{ .inputs.\"environment\" }}",
      "environment_type": "{{ .inputs.\"environment_type\" }}",
      "environment_name": "{{ .inputs.\"environment_name\" }}"
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```
</details>

Now you should see the `Create Application` action in the self-service page. 🎉

## Let's test it!

1. Go to the [Self Service page](https://app.getport.io/self-serve) of your portal.

2. Click on the `Create Application` action.

3. Enter the required details for the `Application Name`, and optionally include `Environment`, `Environment Type`, and `Environment Name`.
4. Click on `Execute`.

5. Done! wait for the application to be created in Humanitec.


Congrats 🎉 You've created a Humanitec application in Port 🔥

## More Self Service Humanitec Actions Examples
- [Deploy Humanitec application](/docs/actions-and-automations/setup-backend/github-workflow/examples/Humanitec/deploy-humanitec-application.md)

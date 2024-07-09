import GithubActionModificationHint from '../../\_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '../../\_github_dedicated_workflows_repository_hint.mdx'
import HumanitecApplicationBlueprint from './blueprints/_humanitec_application_blueprint.mdx'

# Deploy Application In Humanitec

## Overview
This self service guide provides a comprehensive walkthrough on how to deploy an application in Humanitec from Port using Port's self service actions.

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

Create the file `.github/workflows/deploy-humanitec-application.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary>GitHub Workflow</summary>

```yaml showLineNumbers title="deploy-humanitec-application.yaml"
name: Deploy Humanitec Application
on:
  workflow_dispatch:
    inputs:
      delta_id:
        type: string
        description: The Delta ID
        required: true
      comment:
        type: string
        description: An optional comment to help communicate the purpose of the Deployment.
        required: false
      environment:
        type: string
        description: The Environment ID
        required: true
      port_context:
        required: true
        description: includes blueprint, run ID, and entity identifier from Port.

jobs:
  deploy-application:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Application
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.humanitec.io/orgs/${{secrets.HUMANITEC_ORG_ID}}/apps/${{fromJson(inputs.port_context).entity}}/envs/${{inputs.environment}}/deploys'
          method: 'POST'
          customHeaders: '{"Content-Type": "application/json", "Authorization": "Bearer ${{ secrets.HUMANITEC_API_KEY }}"}'

      - name: Log Deploy Application Request Failure 
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Failed to deploy application ..."

      - name: Log Deploy Application Request Success
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: |
             Application has been successfully deployed ! ✅
```

</details>

## Port Configuration

Create a new self service action using the following JSON configuration.

<details>
<summary><b> Deploy application In Humanitec (click to expand) </b></summary>

<GithubActionModificationHint/>

```json showLineNumbers
{
  "identifier": "deploy_application",
  "title": "Deploy Application",
  "icon": "Microservice",
  "description": "Deploy humanitec Application",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "delta_id": {
          "type": "string",
          "title": "Delta ID",
          "description": "Delta ID",
          "icon": "Deployment"
        },
        "comment": {
          "type": "string",
          "description": "Comment on the deployment",
          "title": "Comment"
        },
        "environment": {
          "type": "string",
          "title": "Environment",
          "description": "Deployment environment ID",
          "blueprint": "humanitecEnvironment",
          "format": "entity"
        }
      },
      "required": [
        "delta_id"
      ],
      "order": [
        "delta_id",
        "comment"
      ]
    },
    "blueprintIdentifier": "humanitecApplication"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "deploy-humanitec-application.yaml",
    "workflowInputs": {
      "delta_id": "{{ .inputs.\"delta_id\" }}",
      "comment": "{{ .inputs.\"comment\" }}",
      "port_context": {
        "blueprint": "{{.action.blueprint}}",
        "entity": "{{.entity.identifier}}",
        "run_id": "{{.run.id}}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```
</details>

Now you should see the `Deploy Application` action in the self-service page. 🎉

## Let's test it!

1. Go to the [Self Service page](https://app.getport.io/self-serve) of your portal.
2. Click on the `Deploy Application` action
3. Choose the humanitec application you want to deploy (In case you didn't install the [Humanitec integration](/docs/build-your-software-catalog/custom-integration/api/ci-cd/github-workflow/guides/humanitec/humanitec.md), it means you don't have any Humanitec applications in Port yet, so you will need to create one manually in Port to test this action)
4. Select the new application
5. Enter the `Delta ID` of the deployment, select an `Environment` you want to deploy to and brief `Comment` about the deployment.
6. Click on `Execute`
7. Done! wait for the application to be deployed in Humanitec

Congrats 🎉 You've deployed a Humanitec application in Port 🔥

## More Self Service Humanitec Actions Examples
- [Create Humanitec application](/docs/actions-and-automations/setup-backend/github-workflow/examples/Humanitec/create-humanitec-application.md)

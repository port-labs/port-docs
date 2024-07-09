import GithubActionModificationHint from '../../\_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '../../\_github_dedicated_workflows_repository_hint.mdx'
import HumanitecApplicationBlueprint from './blueprints/_humanitec_application_blueprint.mdx'

# Delete Application In Humanitec

## Overview
This self service guide provides a comprehensive walkthrough on how to delete an application in Humanitec from Port using Port's self service actions.

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

Create the file `.github/workflows/delete-humanitec-application.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary>GitHub Workflow</summary>

```yaml showLineNumbers title="delete-humanitec-application.yaml"
name: Delete Humanitec Application
on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: includes blueprint, run ID, and entity identifier from Port.

jobs:
  delete-application:
    runs-on: ubuntu-latest
    steps:
      - name: Delete Application
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.humanitec.io/orgs/${{secrets.HUMANITEC_ORG_ID}}/apps/${{fromJson(inputs.port_context).entity}}'
          method: 'DELETE'
          customHeaders: '{"Content-Type": "application/json", "Authorization": "Bearer ${{ secrets.HUMANITEC_API_KEY }}"}'

      - name: Log Delete Application Request Failure 
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Request to delete application failed ..."

      - name: Log Delete Application Request Success
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: |
             Humanitech application has been successfully deleted! ✅
             Deleting entity from port

      - name: Get Port Token
        id: port_access_token
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.getport.io/v1/auth/access_token'
          method: 'POST'
          customHeaders: '{"Content-Type": "application/json", "accept": "application/json"}'
          data: |
            {
              "clientId": "${{ secrets.PORT_CLIENT_ID }}",
              "clientSecret": "${{ secrets.PORT_CLIENT_SECRET }}"
            }
          
      - name: Delete Application From Port
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.getport.io/v1/blueprints/${{fromJson(inputs.port_context).blueprint}}/entities/${{fromJson(inputs.port_context).entity}}?delete_dependents=false'
          method: 'DELETE'
          customHeaders: '{"Content-Type": "application/json", "Authorization": "Bearer ${{ fromJson(steps.port_access_token.outputs.response).accessToken }}"}'
  
      - name: Log Delete Application From Port Request Failure 
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Request to delete application failed ..."
          
      - name: Log Delete Application Entity From Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: |
              Application has been successfully deleted from port ✅
```

</details>

## Port Configuration

Create a new self service action using the following JSON configuration.

<details>
<summary><b> Delete application In Humanitec (click to expand) </b></summary>

<GithubActionModificationHint/>

```json showLineNumbers
{
  "identifier": "delete_application",
  "title": "Delete Application",
  "icon": "Microservice",
  "description": "Delete an application on humanitec",
  "trigger": {
    "type": "self-service",
    "operation": "DELETE",
    "userInputs": {
      "properties": {},
      "required": [],
      "order": []
    },
    "blueprintIdentifier": "humanitecApplication"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "delete-humanitec-application.yaml",
    "workflowInputs": {
      "port_context": {
        "entity": "{{.entity.identifier}}",
        "blueprint": "{{.action.blueprint}}",
        "run_id": "{{.run.id}}",
        "relations": "{{.entity.relations}}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```
</details>

Now you should see the `Delete Application` action in the self-service page. 🎉

## Let's test it!

1. Go to the [Self Service page](https://app.getport.io/self-serve) of your portal.
2. Click on the `Delete Application` action
3. Choose the humanitec application you want to delete (In case you didn't install the [Humanitec integration](/docs/build-your-software-catalog/custom-integration/api/ci-cd/github-workflow/guides/humanitec/humanitec.md), it means you don't have any Humanitec applications in Port yet, so you will need to create one manually in Port to test this action)
5. Click on `Execute`
6. Done! wait for the application to be deleted in Humanitec

Congrats 🎉 You've deleted a Humanitec application in Port 🔥

## More Self Service Humanitec Actions Examples
- [Create Humanitec application](/docs/actions-and-automations/setup-backend/github-workflow/examples/Humanitec/create-humanitec-application.md)
- [Deploy Humanitec application](/docs/actions-and-automations/setup-backend/github-workflow/examples/Humanitec/deploy-humanitec-application.md)

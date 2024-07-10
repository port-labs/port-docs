import GithubActionModificationHint from '../../\_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '../../\_github_dedicated_workflows_repository_hint.mdx'
import HumanitecWorkloadBlueprint from './blueprints/_humanitec_workload_blueprint.mdx'

# Create Workload Profile

## Overview
This self service guide provides a comprehensive walkthrough on how to create a workload profile in Humanitec from Port using Port's self service actions.

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
This step is not required for this example, but it will create all the blueprint boilerplate for you, and also ingest and update the catalog in real time with your Humanitec Workload Profile.
:::

<HumanitecWorkloadBlueprint/>

## GitHub Workflow

Create the file `.github/workflows/create-humanitec-workload-profile.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary>GitHub Workflow</summary>

```yaml showLineNumbers title="create-humanitec-workload-profile.yaml"
name: Create Humanitec Workload Profile
on:
  workflow_dispatch:
    inputs:
      id:
        description: 'The workload profile ID'
        required: true
        type: string
      spec_definition:
        description: 'Workload specification definition'
        required: true
      workload_profile_chart_id:
        description: 'Workload Profile Chart ID'
        required: true
        type: string
      workload_profile_chart_version:
        description: 'Workload Profile Chart Version'
        required: true
        type: string
      port_context:
        required: true
        description: includes blueprint, run ID, and entity identifier from Port.

jobs:
  create-workload-profile:
    runs-on: ubuntu-latest
    steps:
      - name: Create Workload Profile
        id : create_workload_profile
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.humanitec.io/orgs/${{secrets.HUMANITEC_ORG_ID}}/workload-profiles'
          method: 'POST'
          customHeaders: '{"Content-Type": "application/json", "Authorization": "Bearer ${{ secrets.HUMANITEC_API_KEY }}"}'
          data: >-
            {
              "id": "${{ github.event.inputs.id }}",
              "spec_definition": ${{ github.event.inputs.spec_definition }},
              "workload_profile_chart": {
                "id": "${{ github.event.inputs.workload_profile_chart_id }}",
                "version": "${{ github.event.inputs.workload_profile_chart_version }}"
                }
              }
          
      - name: Log Create Workload Profile Request Failure 
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Request to create workload profile failed ..."
          
      - name: Log Request Success
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: |
             Humanitech workload profile created! ✅
             Reporting created entity to port ... 🚴‍♂️

      - name: UPSERT Humanitec Workload Profile
        uses: port-labs/port-github-action@v1
        with:
          identifier: "${{ fromJson(steps.create_workload_profile.outputs.response).id }}" 
          title: "${{ fromJson(steps.create_workload_profile.outputs.response).id }}"
          icon: Microservice
          blueprint: "${{fromJson(inputs.port_context).blueprint}}"
          properties: |-
            {
              "description": "${{ fromJson(steps.create_workload_profile.outputs.response).description }}",
              "version": "${{ fromJson(steps.create_workload_profile.outputs.response).version }}",
              "createdAt": "${{ fromJson(steps.create_workload_profile.outputs.response).created_at }}",
              "specDefinition": ${{ toJson(fromJson(steps.create_workload_profile.outputs.response).spec_definition) }}
            }
          relations: "{}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{fromJson(inputs.port_context).run_id}}

      - name: Log After Upserting Entity
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: |
              Upserting was successful ✅
```

</details>

## Port Configuration

Create a new self service action using the following JSON configuration.

<details>
<summary><b> Create Workload Profile (click to expand) </b></summary>

<GithubActionModificationHint/>

```json showLineNumbers
{
  "identifier": "create_workload_profile",
  "title": "Create Workload Profile",
  "icon": "Cluster",
  "description": "Create a workload profile in humanitec",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "spec_definition": {
          "icon": "DefaultProperty",
          "type": "object",
          "title": "Spec Definition",
          "description": "Workload spec definition"
        },
        "workload_profile_chart_id": {
          "type": "string",
          "title": "Workload Profile Chart ID",
          "description": "Workload Profile Chart ID"
        },
        "workload_profile_chart_version": {
          "type": "string",
          "title": "Workload Profile Chart Version",
          "description": "Workload profile chart version. References a workload profile chart."
        },
        "workload_profile_id": {
          "type": "string",
          "title": "Workload Profile Id",
          "description": "Workflow profile ID",
          "icon": "Cluster"
        }
      },
      "required": [
        "workload_profile_chart_id",
        "workload_profile_chart_version",
        "spec_definition"
      ],
      "order": [
        "workload_profile_id",
        "spec_definition",
        "workload_profile_chart_id",
        "workload_profile_chart_version"
      ]
    },
    "blueprintIdentifier": "humanitecWorkload"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "create-workload-profile.yaml",
    "workflowInputs": {
      "id": "{{ .inputs.\"id\" }}",
      "spec_definition": "{{ .inputs.\"spec_definition\" }}",
      "workload_profile_chart_id": "{{ .inputs.\"workload_profile_chart_id\" }}",
      "workload_profile_chart_version": "{{ .inputs.\"workload_profile_chart_version\" }}",
      "port_context": {
        "entity": "{{.entity.identifier}}",
        "blueprint": "{{.action.blueprint}}",
        "run_id": "{{.run.id}}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```
</details>

Now you should see the `Create Workload Profile` action in the self-service page. 🎉

## Let's test it!

1. Go to the [Self Service page](https://app.getport.io/self-serve) of your portal.
2. Click on the `Create Workload Profile` action
3. Enter the required details for `Workload Profile ID`, `Spec Definition`, `Workload Profile Chart ID`,and `Workload Profile Chart Version`.
5. Click on `Execute`
6. Done! wait for the workload profile to be created in Humanitec

Congrats 🎉 You've created a workload profile in Humanitec from Port 🔥

## More Self Service Humanitec Actions Examples
- [Create Humanitec application](/docs/actions-and-automations/setup-backend/github-workflow/examples/Humanitec/create-humanitec-application.md)
- [Deploy Humanitec application](/docs/actions-and-automations/setup-backend/github-workflow/examples/Humanitec/deploy-humanitec-application.md)
- [Delete Humanitec application](/docs/actions-and-automations/setup-backend/github-workflow/examples/Humanitec/delete-humanitec-application.md)

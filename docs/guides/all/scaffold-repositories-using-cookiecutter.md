---
sidebar_position: 2
displayed_sidebar: null
description: Learn how to scaffold repositories using Cookiecutter in Port, streamlining project initialization and development.
---

# Scaffold Repositories Using Cookiecutter

This example demonstrates how to quickly scaffold Azure DevOps repositories using a [Cookiecutter Template](https://www.cookiecutter.io/templates) via Port Actions.

In addition, as cookiecutter is an open-source project you can make your own project template, learn more about it [here](https://cookiecutter.readthedocs.io/en/2.0.2/tutorials.html#create-your-very-own-cookiecutter-project-template).

## Example - scaffolding python template

Follow these steps to get started with the Python template:

1. Create an Azure DevOps Repository called `python_scaffolder` in your Azure Devops Organization/Project and [configure a service connection](/actions-and-automations/setup-backend/azure-pipeline#define-incoming-webhook-in-azure).

:::note
Use `port_trigger` for both `WebHook Name` and `Service connection name` when configuring your [Service Connection](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints?view=azure-devops&tabs=yaml)
:::
<br/>

2. Create a Port blueprint with the following JSON definition:

:::note
Keep in mind this can be any blueprint you would like and this is just an example.
:::

<details>
  <summary>Port Microservice Blueprint</summary>

```json showLineNumbers
{
  "identifier": "microservice",
  "title": "Microservice",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "description": {
        "title": "Description",
        "type": "string"
      },
      "url": {
        "title": "URL",
        "format": "url",
        "type": "string"
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
<br/>

3. Create Port action using the following JSON definition:

:::note
Make sure to replace the placeholder for AZURE_DEVOPS_ORGANIZATION_NAME to where your `python_scaffolder` resides in.
Also validate that `invocationMethod.webhook` equals `port_trigger`.
:::

<details>
  <summary>Port Action</summary>

```json showLineNumbers
{
  "identifier": "microservice_azure_scaffolder",
  "title": "Azure Scaffolder",
  "icon": "Azure",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "service_name": {
          "icon": "DefaultProperty",
          "title": "Service Name",
          "type": "string",
          "description": "Name of the service to scaffold"
        },
        "azure_organization": {
          "icon": "DefaultProperty",
          "title": "Azure Organization",
          "type": "string",
          "description": "Your Azure DevOps organization name"
        },
        "azure_project": {
          "icon": "DefaultProperty",
          "title": "Azure Project",
          "type": "string",
          "description": "Your Azure DevOps project name"
        },
        "description": {
          "icon": "DefaultProperty",
          "title": "Description",
          "type": "string",
          "description": "Service description"
        }
      },
      "required": [
        "service_name"
      ],
      "order": [
        "service_name",
        "azure_organization",
        "azure_project",
        "description"
      ]
    },
    "blueprintIdentifier": "microservice"
  },
  "invocationMethod": {
    "type": "AZURE_DEVOPS",
    "webhook": "port_trigger",
    "org": "<AZURE_DEVOPS_ORGANIZATION_NAME>",
    "payload": {
      "properties": {
        "service_name": "{{.inputs.\"service_name\"}}",
        "azure_organization": "{{.inputs.\"azure_organization\"}}",
        "azure_project": "{{.inputs.\"azure_project\"}}",
        "description": "{{.inputs.\"description\"}}"
      },
      "port_context": {
        "entity": "{{.entity}}",
        "blueprint": "{{.action.blueprint}}",
        "runId": "{{.run.id}}",
        "trigger": "{{ .trigger }}"
      }
    }
  },
  "requiredApproval": false
}
```

</details>
<br/>

4. In your `python_scaffolder` Azure DevOps Repository, create an Azure Pipeline file under `azure-pipelines.yml` in the root of the repo's main branch with the following content:

<details>
<summary>Azure DevOps Pipeline Script</summary>

```yml showLineNumbers
trigger: none

pool:
  vmImage: "ubuntu-latest"

variables:
  RUN_ID: "${{ parameters.port_trigger.port_context.runId }}"
  BLUEPRINT_ID: "${{ parameters.port_trigger.port_context.blueprint }}"
  SERVICE_NAME: "${{ parameters.port_trigger.properties.service_name }}"
  DESCRIPTION: "${{ parameters.port_trigger.properties.description }}"
  AZURE_ORGANIZATION: "${{ parameters.port_trigger.properties.azure_organization }}"
  AZURE_PROJECT: "${{ parameters.port_trigger.properties.azure_project }}"
  # PERSONAL_ACCESS_TOKEN: $(PERSONAL_ACCESS_TOKEN) // set up PERSONAL_ACCESS_TOKEN as a sercet variable

resources:
  webhooks:
    - webhook: port_trigger
      connection: port_trigger

stages:
  - stage: fetch_port_access_token
    jobs:
      - job: fetch_port_access_token
        steps:
          - script: |
              sudo apt-get update
              sudo apt-get install -y jq
          - script: |
              accessToken=$(curl -X POST \
                    -H 'Content-Type: application/json' \
                    -d '{"clientId": "$(PORT_CLIENT_ID)", "clientSecret": "$(PORT_CLIENT_SECRET)"}' \
                    -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
              echo "##vso[task.setvariable variable=accessToken;isOutput=true]$accessToken"
            displayName: Fetch Access Token and Run ID
            name: getToken

  - stage: scaffold
    dependsOn:
      - fetch_port_access_token
    jobs:
      - job: scaffold
        variables:
          COOKIECUTTER_TEMPLATE_URL: "https://github.com/brettcannon/python-azure-web-app-cookiecutter"
        steps:
          - script: |
              sudo apt-get update
              sudo apt-get install -y jq
              sudo pip install cookiecutter -q
          - script: |
              # Create the repository
              PROJECT_ID=$(curl -X GET "https://dev.azure.com/${{ variables.AZURE_ORGANIZATION }}/_apis/projects/${{ variables.AZURE_PROJECT }}?api-version=7.0" \
              -H "Authorization: Basic $(PERSONAL_ACCESS_TOKEN)" \
              -H "Content-Type: application/json" \
              -H "Content-Length: 0" | jq .id)

              if [[ -z "$PROJECT_ID" ]]; then
                echo "Failed to fetch Azure Devops Project ID."
                exit 1
              fi

              PAYLOAD='{"name":"${{ variables.SERVICE_NAME }}","project":{"id":'$PROJECT_ID'}}'

              CREATE_REPO_RESPONSE=$(curl -X POST "https://dev.azure.com/${{ variables.AZURE_ORGANIZATION }}/_apis/git/repositories?api-version=7.0" \
              -H "Authorization: Basic $(PERSONAL_ACCESS_TOKEN)" \
              -H "Content-Type: application/json" \
              -d $PAYLOAD)

              PROJECT_URL=$(echo $CREATE_REPO_RESPONSE | jq -r .webUrl)

              if [[ -z "$PROJECT_URL" ]]; then
                echo "Failed to create Azure Devops repository."
                exit 1
              fi

              echo "##vso[task.setvariable variable=PROJECT_URL;isOutput=true]$PROJECT_URL"

              cat <<EOF > cookiecutter.yaml
              default_context:
                site_name: "${{ variables.SERVICE_NAME }}"
                python_version: "3.6.0"
              EOF
              cookiecutter $COOKIECUTTER_TEMPLATE_URL --no-input --config-file cookiecutter.yaml --output-dir scaffold_out

              echo "Initializing new repository..."
              git config --global user.email "scaffolder@email.com"
              git config --global user.name "Mighty Scaffolder"
              git config --global init.defaultBranch "main"

              cd "scaffold_out/${{ variables.SERVICE_NAME }}"
              git init
              git add .
              git commit -m "Initial commit"
              decoded_pat=$(echo $(PERSONAL_ACCESS_TOKEN) | base64 -d)
              git remote add origin https://$decoded_pat@dev.azure.com/${{ variables.AZURE_ORGANIZATION }}/${{ variables.AZURE_PROJECT }}/_git/${{ variables.SERVICE_NAME }}
              git push -u origin --all
            name: scaffold

  - stage: upsert_entity
    dependsOn:
      - fetch_port_access_token
      - scaffold
    jobs:
      - job: upsert_entity
        variables:
          accessToken: $[ stageDependencies.fetch_port_access_token.fetch_port_access_token.outputs['getToken.accessToken'] ]
          PROJECT_URL: $[ stageDependencies.scaffold.scaffold.outputs['scaffold.PROJECT_URL'] ]
        steps:
          - script: |
              sudo apt-get update
              sudo apt-get install -y jq
          - script: |
              curl -X POST \
                -H 'Content-Type: application/json' \
                -H 'Authorization: Bearer $(accessToken)' \
                -d '{
                    "identifier": "${{ variables.SERVICE_NAME }}",
                    "title": "${{ variables.SERVICE_NAME }}",
                    "properties": {"description":"${{ variables.DESCRIPTION }}","url":"$(PROJECT_URL)" },
                    "relations": {}
                  }' \
                "https://api.getport.io/v1/blueprints/${{ variables.BLUEPRINT_ID }}/entities?upsert=true&run_id=${{ variables.RUN_ID }}&create_missing_related_entities=true"

  - stage: update_run_status
    dependsOn:
      - upsert_entity
      - fetch_port_access_token
      - scaffold
    jobs:
      - job: update_run_status
        variables:
          accessToken: $[ stageDependencies.fetch_port_access_token.fetch_port_access_token.outputs['getToken.accessToken'] ]
          PROJECT_URL: $[ stageDependencies.scaffold.scaffold.outputs['scaffold.PROJECT_URL'] ]
        steps:
          - script: |
              sudo apt-get update
              sudo apt-get install -y jq
          - script: |
              curl -X PATCH \
                -H 'Content-Type: application/json' \
                -H 'Authorization: Bearer $(accessToken)' \
                -d '{"status":"SUCCESS", "message": {"run_status": "Scaffold ${{ variables.SERVICE_NAME }} finished successfully!\\n Project URL: $(PROJECT_URL)" }}' \
                "https://api.getport.io/v1/actions/runs/${{ variables.RUN_ID }}"

  - stage: update_run_status_failed
    dependsOn:
      - upsert_entity
      - fetch_port_access_token
      - scaffold
    condition: failed()
    jobs:
      - job: update_run_status_failed
        variables:
          accessToken: $[ stageDependencies.fetch_port_access_token.fetch_port_access_token.outputs['getToken.accessToken'] ]
        steps:
          - script: |
              curl -X PATCH \
                -H 'Content-Type: application/json' \
                -H 'Authorization: Bearer $(accessToken)' \
                -d '{"status":"FAILURE", "message": {"run_status": "Scaffold ${{ variables.SERVICE_NAME }} failed" }}' \
                "https://api.getport.io/v1/actions/runs/${{ variables.RUN_ID }}"
```

</details>
<br/>

5. To configure the Pipeline in your project go to Pipelines -> Create Pipeline -> Azure Repos Git and choose `python_scaffolder` and click Save(in "Run" dropdown menu).
   <br/>

6. Create the following variables as [Secret Variables](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/set-secret-variables?view=azure-devops&tabs=yaml%2Cbash):

   1. `PERSONAL_ACCESS_TOKEN` - a base64-encoded [Personal Access Token](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows) with the following scopes:

      - Code: Full.
      - Release: Read, write & execute.

      Use the following script to encode your PAT:

      ```bash
      MY_PAT=YourPAT
      B64_PAT=$(printf ":%s" "$MY_PAT" | base64)
      echo $B64_PAT
      ```

   2. `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
   3. `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).

<br/>

7. Trigger the action from the [Self-service](https://app.getport.io/self-serve) tab of your Port application.

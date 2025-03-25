---
sidebar_position: 2
displayed_sidebar: null
description: Learn how to scaffold Azure DevOps repositories using Cookiecutter templates via Port Actions.
---

# Scaffold Repositories Using Cookiecutter

## Overview
This guide will help you implement a self-service action in Port that allows you to quickly scaffold Azure DevOps repositories using Cookiecutter templates. This streamlines project initialization and ensures consistent repository structure across your organization.  

## Prerequisites
1. Complete the [onboarding process](/getting-started/overview).
2. Access to Azure DevOps with permissions to create repositories and pipelines.

## Set up data model

If you haven't installed the [Azure DevOps integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/azure-devops/installation), you'll need to create a blueprint for Azure DevOps repositories.  
However, we highly recommend you install the Azure DevOps integration to have this automatically set up for you.

<h3> Create the Azure DevOps repository blueprint </h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>Azure DevOps Repository Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "azureDevopsRepository",
      "title": "Azure DevOps Repository",
      "icon": "Azure",
      "schema": {
        "properties": {
          "url": {
            "title": "URL",
            "type": "string",
            "format": "url",
            "description": "The URL of the Azure DevOps repository"
          },
          "readme": {
            "title": "README",
            "type": "string",
            "description": "The content of the repository's README file"
          },
          "defaultBranch": {
            "title": "Default Branch",
            "type": "string",
            "description": "The default branch of the repository"
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

5. Click "Save" to create the blueprint.

## Implementation

### Set up Azure DevOps environment

1. Create an Azure DevOps Repository called `python_scaffolder` in your Azure DevOps Organization/Project:

2. Configure a [service connection](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints?view=azure-devops&tabs=yaml) to Azure DevOps:

   :::info Service connection configuration
   Use `port_trigger` for both `WebHook Name` and `Service connection name` when configuring your [Service Connection](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints?view=azure-devops&tabs=yaml)
   :::

### Create the self-service action

1. Head to the [self-service](https://app.getport.io/self-serve) page in Port.
2. Click on `+ New Action`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Scaffolding new repository (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "azure_scaffolder",
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
        "blueprintIdentifier": "azureDevopsRepository"
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

    :::tip Replace the organization name
    Make sure to replace `<AZURE_DEVOPS_ORGANIZATION_NAME>` with your actual Azure DevOps organization name.
    :::

5. Click `Save` to create the action.

### Create the Azure DevOps pipeline

1. In your `python_scaffolder` repository, create a file called `azure-pipelines.yml` in the root with the following content:

    <details>
    <summary><b>Azure DevOps Pipeline YAML (Click to expand)</b></summary>

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

    :::tip Customize the template
    You can create your own Cookiecutter templates by following the [official guide](https://cookiecutter.readthedocs.io/en/2.0.2/tutorials.html#create-your-very-own-cookiecutter-project-template). Simply update the `COOKIECUTTER_TEMPLATE_URL` variable in the pipeline YAML to use your own template.
    :::

2. Configure the pipeline in Azure DevOps:
   - Go to Pipelines → Create Pipeline → Azure Repos Git and choose `python_scaffolder`.
   - Click Save (in the "Run" dropdown menu).

3. Create the following secret variables in your pipeline:
   - `PERSONAL_ACCESS_TOKEN` - A base64-encoded Azure DevOps PAT with Code (Full) and Release (Read, write & execute) permissions.  
        To encode your Personal Access Token:

        ```bash
        MY_PAT=YourPAT
        B64_PAT=$(printf ":%s" "$MY_PAT" | base64)
        echo $B64_PAT
        ```
   - `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
   - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).

  

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal.
2. Click on the `Azure Scaffolder` action.
3. Fill in the required details:
   - Service Name (required).
   - Azure Organization (if different from default).
   - Azure Project (if different from default).
   - Description.
4. Click on `Execute`.
5. Wait for the Azure DevOps pipeline to create your new repository with the Cookiecutter template.

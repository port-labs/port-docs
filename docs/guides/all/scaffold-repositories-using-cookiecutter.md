---
sidebar_position: 2
displayed_sidebar: null
description: Learn how to scaffold Azure DevOps repositories using Cookiecutter templates via Port Actions.
---
import AzureDevopsTroubleshootingLink from '/docs/generalTemplates/azure-devops/_azure_devops_troubleshooting_link.mdx'

# Scaffold Azure DevOps Repositories Using Cookiecutter

## Overview
This guide will help you implement a self-service action in Port that allows you to quickly scaffold Azure DevOps repositories using Cookiecutter templates. This streamlines project initialization and ensures consistent repository structure across your organization.  

## Prerequisites
1. Complete the [onboarding process](/getting-started/overview).
2. Access to Azure DevOps with permissions to create repositories and pipelines.

## Set up data model

If you haven't installed the [Azure DevOps integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/azure-devops/installation), you'll need to create blueprints for Azure DevOps repositories and projects.  
However, we highly recommend you install the Azure DevOps integration to have these automatically set up for you.

<h3> Create the Azure DevOps project blueprint </h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>Azure DevOps Project Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "project",
      "title": "Project",
      "icon": "AzureDevops",
      "schema": {
        "properties": {
          "state": {
            "title": "State",
            "type": "string",
            "icon": "AzureDevops",
            "description": "The current lifecycle state of the project."
          },
          "revision": {
            "title": "Revision",
            "type": "string",
            "icon": "AzureDevops",
            "description": "The revision number, indicating how many times the project configuration has been updated."
          },
          "visibility": {
            "title": "Visibility",
            "type": "string",
            "icon": "AzureDevops",
            "description": "Indicates whether the project is private or public"
          },
          "defaultTeam": {
            "title": "Default Team",
            "type": "string",
            "icon": "Team",
            "description": "Default Team of the project"
          },
          "link": {
            "title": "Link",
            "type": "string",
            "format": "url",
            "icon": "AzureDevops",
            "description": "Link to azure devops project"
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

5. Click "Save" to create the blueprint.

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

### Create a self-service action

1. Head to the [self-service](https://app.getport.io/self-serve) page in Port.
2. Click on `+ New Action`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Scaffold Azure Repository Action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "azure_scaffolder",
      "title": "Scaffold Azure Repository",
      "icon": "Azure",
      "description": "Scaffold a new repository in Azure DevOps",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "service_name": {
              "title": "Service Name",
              "description": "The new service's name",
              "type": "string"
            },
            "azure_organization": {
              "icon": "DefaultProperty",
              "type": "string",
              "title": "Azure Organization",
              "description": "The Azure DevOps organization name",
              "default": "<YOUR_DEFAULT_AZURE_DEVOPS_ORGANIZATION_NAME>"
            },
            "description": {
              "type": "string",
              "title": "description",
              "description": "description of the scaffold"
            },
            "azure_project": {
              "icon": "DefaultProperty",
              "title": "azure project",
              "type": "string",
              "description": "Your Azure DevOps project ID",
              "blueprint": "project",
              "sort": {
                "property": "$identifier",
                "order": "ASC"
              },
              "format": "entity"
            }
          },
          "required": [
            "service_name",
            "azure_organization",
            "azure_project"
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
            "description": "{{.inputs.\"description\"}}",
            "azure_project": "{{.inputs.\"azure_project\"}}"
          },
          "port_context": {
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

### Create an Azure DevOps pipeline

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
      AZURE_PROJECT: "${{ parameters.port_trigger.properties.azure_project.title }}"
      PROJECT_ID: "${{ parameters.port_trigger.properties.azure_project.identifier }}"
      # Ensure that PERSONAL_ACCESS_TOKEN is set as a secret variable in your pipeline settings

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
                  # Use shell variable syntax for accessing variables
                  PAYLOAD="{\"name\":\"$SERVICE_NAME\",\"project\":{\"id\":\"$PROJECT_ID\"}}"

                  echo "SERVICE_NAME: $SERVICE_NAME"
                  echo "AZURE_ORGANIZATION: $AZURE_ORGANIZATION"
                  echo "PROJECT_ID: $PROJECT_ID"
                  echo "PAYLOAD: $PAYLOAD"

                  if [[ -z \"$PERSONAL_ACCESS_TOKEN\" ]]; then
                    echo "PERSONAL_ACCESS_TOKEN is not set or is empty."
                    exit 1
                  else
                    echo "PERSONAL_ACCESS_TOKEN is set."
                  fi

                  # Create the repository
                  CREATE_REPO_RESPONSE=$(curl -s -u :$PERSONAL_ACCESS_TOKEN \
                    -X POST "https://dev.azure.com/$AZURE_ORGANIZATION/$PROJECT_ID/_apis/git/repositories?api-version=7.0" \
                    -H "Content-Type: application/json" \
                    -d "$PAYLOAD")

                  # Output the response for debugging
                  echo "CREATE_REPO_RESPONSE: $CREATE_REPO_RESPONSE"

                  PROJECT_URL=$(echo $CREATE_REPO_RESPONSE | jq -r .webUrl)

                  if [[ -z "$PROJECT_URL" ]] || [[ "$PROJECT_URL" == "null" ]]; then
                    echo "Failed to create Azure DevOps repository."
                    exit 1
                  fi

                  echo "##vso[task.setvariable variable=PROJECT_URL;isOutput=true]$PROJECT_URL"

                  # Create a sanitized version of SERVICE_NAME for cookiecutter (replace underscores with hyphens)
                  COOKIECUTTER_NAME=$(echo "$SERVICE_NAME" | tr '_' '-')
                  echo "Original SERVICE_NAME: $SERVICE_NAME"
                  echo "Sanitized COOKIECUTTER_NAME: $COOKIECUTTER_NAME"

                  cat <<EOF > cookiecutter.yaml
                  default_context:
                    site_name: "$COOKIECUTTER_NAME"
                    python_version: "3.6.0"
                  EOF
                  cookiecutter $COOKIECUTTER_TEMPLATE_URL --no-input --config-file cookiecutter.yaml --output-dir scaffold_out

                  # Rename the output directory if needed to match the original SERVICE_NAME
                  if [[ "$COOKIECUTTER_NAME" != "$SERVICE_NAME" ]]; then
                    echo "Renaming cookiecutter output directory to match repository name..."
                    mv "scaffold_out/$COOKIECUTTER_NAME" "scaffold_out/$SERVICE_NAME"
                  fi

                  echo "Initializing new repository..."
                  git config --global user.email "scaffolder@email.com"
                  git config --global user.name "Mighty Scaffolder"
                  git config --global init.defaultBranch "main"

                  cd "scaffold_out/$SERVICE_NAME"
                  git init
                  git add .
                  git commit -m "Initial commit"

                  # Configure Git to use the PAT for authentication - use the URL format with credentials embedded
                  # URL encode the project name to handle spaces correctly
                  ENCODED_PROJECT=$(echo "$AZURE_PROJECT" | sed 's/ /%20/g')
                  git remote add origin "https://$PERSONAL_ACCESS_TOKEN@dev.azure.com/$AZURE_ORGANIZATION/$ENCODED_PROJECT/_git/$SERVICE_NAME"
                  
                  # Set git timeout values to avoid connection issues
                  git config --global http.lowSpeedLimit 1000
                  git config --global http.lowSpeedTime 300

                  # Push code to the repository
                  git push -u origin --all

                env:
                  PERSONAL_ACCESS_TOKEN: $(PERSONAL_ACCESS_TOKEN)
                displayName: "Create Repository in Azure DevOps"
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
                        "relations": {
                          "project":"${{ variables.PROJECT_ID }}"
                        }
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
                    -H "Authorization: Bearer $accessToken" \
                    -d '{"status":"FAILURE", "message": {"run_status": "Scaffold '"$SERVICE_NAME"' failed" }}' \
                    "https://api.getport.io/v1/actions/runs/$RUN_ID"

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
2. Click on the **Azure Scaffolder** action.
3. Fill in the required details:
   - **Service Name** (required)
   - **Azure Organization** (pre-filled or enter your organization)
   - **Description** (optional)
   - **Azure Project**: Select an existing project from the dropdown list.
     
     :::info Can't find your project?
     If you don't see your project in the dropdown, make sure it exists in your Port catalog. If you haven't installed the Azure DevOps integration, you may need to [add a project entity manually](https://app.getport.io/software-catalog) first.
     :::
4. Click on **Execute**.
5. Wait for the Azure DevOps pipeline to create your new repository with the Cookiecutter template.

<AzureDevopsTroubleshootingLink />  



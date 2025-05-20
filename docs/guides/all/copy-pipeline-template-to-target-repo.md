---
displayed_sidebar: null
description: Learn how to copy pipeline template from one repository to another using Port Actions.
---

import AzureDevopsTroubleshootingLink from '/docs/generalTemplates/azure-devops/_azure_devops_troubleshooting_link.mdx'

# Copy Pipeline Template to Target Repo

This guide demonstrates how to copy pipeline templates between Azure DevOps repositories using a self-service action in Port. 

Once implemented:
- Platform teams can define standard pipeline templates in a base repository.
- Developers can easily copy these templates to their repositories using a self-service action in their portal.
- Teams can maintain consistent CI/CD configurations across projects.


## Prerequisites

- Ensure you have a Port account and have completed the [onboarding process](https://docs.getport.io/quickstart).
- You can either:
    - Install the [Azure DevOps integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/azure-devops/#installation) to create the blueprint and mappings automatically, or
    - Alternatively, create only the `Azure DevOps Repository` blueprint and ingest repositories directly using [Port’s APIs](https://docs.getport.io/api-reference/create-an-entity)


## Set up infrastructure

First, let's set up the necessary Azure DevOps components to handle the pipeline copying process.

### Create a pipeline copier repository

1. Create an Azure DevOps repository called `pipeline_copier` in your Azure DevOps Organization/Project and [configure a service connection](/actions-and-automations/setup-backend/azure-pipeline#define-incoming-webhook-in-azure).

   :::info Use an existing repository
   You may use an existing repository instead of creating a new one. Just ensure that you add the `azure-pipelines.yaml` file in **Step 4**  to the repository's root.
   :::

2. Configure your [Service Connection](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints?view=azure-devops&tabs=yaml) by setting the `WebHook Name` and `Service connection name` to `port_trigger` 

3. Update the `azureDevopsRepository` blueprint and mapping configuration with the `defaultBranch` property, depending on how your setup was created:

    - If you installed the **Azure DevOps integration**, update the `defaultBranch` property in the mapping config file.
    - If you created the blueprint **manually** (without the integration), add the JSON blueprint below and use Port's API to ingest the repository data.

      :::info Using Port's API
      If you’re not using the Azure DevOps integration, you will need to use [Port's API](https://docs.port.io/api-reference/create-an-entity) to ingest repository data based on the blueprint you created.
      :::
    
    To create the necessary data model manually, use the following blueprint JSON and mapping configuration:
    
    <details>
      <summary>Azure DevOps repository blueprint</summary>
    
    ```json showLineNumbers
    {
      "identifier": "azureDevopsRepository",
      "title": "Repository",
      "icon": "AzureDevops",
      "schema": {
        "properties": {
          "url": {
            "title": "URL",
            "format": "url",
            "type": "string",
            "icon": "Link"
          },
          "readme": {
            "title": "README",
            "type": "string",
            "format": "markdown",
            "icon": "Book"
          },
          "defaultBranch": {
            "title": "Default Branch",
            "type": "string"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "project": {
          "title": "Project",
          "target": "project",
          "required": true,
          "many": false
        }
      }
    }
    ```
    </details>
    
    
    <details>
      <summary>Azure DevOps repository mapping config</summary>
    
    ```yaml showLineNumbers
      - kind: repository
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .project.name + "/" + .name | gsub(" "; "")
              title: .name
              blueprint: '"azureDevopsRepository"'
              properties:
                url: .url
                readme: file://README.md
                defaultBranch: .defaultBranch # Add this line
              relations:
                project: .project.id | gsub(" "; "")
    
    ```
    </details>
    

4. Create a self-service action in Port using the following JSON definition:

    :::tip Organization and repository placeholders
    Replace `<AZURE_DEVOPS_ORGANIZATION_NAME>` with your **Azure DevOps organization name** in the `pipeline-copier` repository
    and ensure `invocationMethod.webhook` is set to `port_trigger`.
    :::

    <details>
      <summary>Port Action</summary>

    ```json showLineNumbers
    {
      "identifier": "copy_pipeline_template",
      "title": "Copy Pipeline Template to Target Repo",
      "icon": "Azure",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "base_repo": {
              "type": "string",
              "title": "Base Repository",
              "icon": "Azure",
              "blueprint": "azureDevopsRepository",
              "format": "entity"
            },
            "target_repo": {
              "type": "string",
              "title": "Target Repository",
              "icon": "Azure",
              "blueprint": "azureDevopsRepository",
              "format": "entity"
            }
          },
          "required": [
            "base_repo",
            "target_repo"
          ],
          "order": [
            "base_repo",
            "target_repo"
          ]
        }
      },
      "invocationMethod": {
        "type": "AZURE_DEVOPS",
        "webhook": "port_trigger",
        "org": "<AZURE_DEVOPS_ORGANIZATION_NAME>",
        "payload": {
          "base_repo_url": "{{ .inputs.base_repo.properties.url }}",
          "target_repo_url": "{{ .inputs.target_repo.properties.url }}",
          "base_repo_branch": "{{ .inputs.base_repo.properties.defaultBranch }}",
          "target_repo_branch": "{{ .inputs.target_repo.properties.defaultBranch }}",
          "azure_organization": "<AZURE_DEVOPS_ORGANIZATION_NAME>",
          "pipeline_file_name": "pipeline.yaml", # Update this if your pipeline file name is different
          "port_context": {
            "runId": "{{ .run.id }}"
          }
        }
      },
      "requiredApproval": false
    }
    ```

    </details>




5. In your `pipeline_copier` Azure DevOps Repository, create an Azure Pipeline file under `azure-pipelines.yml` in the root of the repo's main branch with the following content:

    <details>
    <summary>Azure DevOps Pipeline Script</summary>

    ```yml showLineNumbers
    trigger: none

    pool:
      vmImage: "ubuntu-latest"


    variables:
      RUN_ID: "${{ parameters.port_trigger.port_context.runId }}"
      BASE_REPO_URL: "${{ parameters.port_trigger.base_repo_url }}"
      TARGET_REPO_URL: "${{ parameters.port_trigger.target_repo_url }}"
      BASE_REPO_BRANCH_REF: "${{ parameters.port_trigger.base_repo_branch }}"
      TARGET_REPO_BRANCH_REF: "${{ parameters.port_trigger.target_repo_branch }}"
      AZURE_ORGANIZATION: "${{ parameters.port_trigger.azure_organization }}"
      PIPELINE_FILE_NAME: "${{ parameters.port_trigger.pipeline_file_name }}"
      # Ensure that PERSONAL_ACCESS_TOKEN is set as a secret variable in your pipeline settings

    resources:
      webhooks:
        - webhook: port_trigger
          connection: port_trigger

    stages:
      # Stage 1: Fetch Port Access Token
      - stage: fetch_port_access_token
        jobs:
          - job: fetch_port_access_token
            steps:
              - script: |
                  sudo apt-get update
                  sudo apt-get install -y jq
                displayName: "Install jq"
              - script: |
                  accessToken=$(curl -X POST \
                        -H 'Content-Type: application/json' \
                        -d '{"clientId": "$(PORT_CLIENT_ID)", "clientSecret": "$(PORT_CLIENT_SECRET)"}' \
                        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
                  echo "##vso[task.setvariable variable=accessToken;isOutput=true]$accessToken"
                displayName: "Fetch Port Access Token"
                name: getToken

      # Stage 2: Copy and Create Pipeline
      - stage: copy_and_create_pipeline
        displayName: "Copy and Create Pipeline"
        dependsOn:
          - fetch_port_access_token
        jobs:
          - job: copy_and_create_pipeline
            displayName: "Copy Pipeline and Create ADO Pipeline"
            variables:
              accessToken: $[ stageDependencies.fetch_port_access_token.fetch_port_access_token.outputs['getToken.accessToken'] ]
            steps:
              - script: |
                  sudo apt-get update
                  sudo apt-get install -y jq git
                displayName: "Install jq and git"

              - script: |
                  # Set default branch ref if TARGET_REPO_BRANCH_REF is empty
                  if [ -z "$TARGET_REPO_BRANCH_REF" ]; then
                    echo "TARGET_REPO_BRANCH_REF is empty. Setting default to 'refs/heads/main'."
                    TARGET_REPO_BRANCH_REF="refs/heads/main"
                  fi

                  # Extract project names from URLs
                  BASE_PROJECT_NAME=$(echo "$BASE_REPO_URL" | awk -F'/' '{print $5}')
                  TARGET_PROJECT_NAME=$(echo "$TARGET_REPO_URL" | awk -F'/' '{print $5}')

                  # Extract repository names from URLs
                  BASE_REPO_NAME=$(basename "$BASE_REPO_URL")
                  TARGET_REPO_NAME=$(basename "$TARGET_REPO_URL")

                  # Extract branch names from refs (e.g., "refs/heads/main" -> "main")
                  BASE_REPO_BRANCH=${BASE_REPO_BRANCH_REF##*/}
                  TARGET_REPO_BRANCH=${TARGET_REPO_BRANCH_REF##*/}

                  # Validate extracted values
                  if [ -z "$BASE_PROJECT_NAME" ] || [ -z "$TARGET_PROJECT_NAME" ] || [ -z "$BASE_REPO_NAME" ] || [ -z "$TARGET_REPO_NAME" ] || [ -z "$BASE_REPO_BRANCH" ] || [ -z "$TARGET_REPO_BRANCH" ] || [ -z "$PIPELINE_FILE_NAME" ]; then
                    echo "Error: One or more required variables are empty."
                    exit 1
                  fi

                  # Construct API URLs
                  BASE_REPO_API_URL="https://dev.azure.com/${AZURE_ORGANIZATION}/${BASE_PROJECT_NAME}/_apis/git/repositories/${BASE_REPO_NAME}"
                  TARGET_REPO_API_URL="https://dev.azure.com/${AZURE_ORGANIZATION}/${TARGET_PROJECT_NAME}/_apis/git/repositories/${TARGET_REPO_NAME}"

                  # Fetch pipeline file content from base_repo at specified branch
                  HTTP_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -u :$PERSONAL_ACCESS_TOKEN \
                    "${BASE_REPO_API_URL}/items?path=/${PIPELINE_FILE_NAME}&versionDescriptor.versionType=branch&versionDescriptor.version=${BASE_REPO_BRANCH}&api-version=6.0&format=text")

                  # Extract the body and status
                  PIPELINE_CONTENT=$(echo "$HTTP_RESPONSE" | sed -e 's/HTTPSTATUS\:.*//g')
                  HTTP_STATUS=$(echo "$HTTP_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

                  # Check if the status is 200 OK
                  if [ "$HTTP_STATUS" -ne 200 ]; then
                    echo "Failed to retrieve ${PIPELINE_FILE_NAME} from base repository."
                    echo "HTTP Status: $HTTP_STATUS"
                    echo "Response: $PIPELINE_CONTENT"
                    exit 1
                  fi

                  # Base64 encode the pipeline content
                  PIPELINE_CONTENT_BASE64=$(echo "$PIPELINE_CONTENT" | base64 -w 0)

                  # Check if the pipeline file exists in target_repo
                  response_target_code=$(curl -s -o /dev/null -w "%{http_code}" -u :$PERSONAL_ACCESS_TOKEN \
                    "${TARGET_REPO_API_URL}/items?path=/${PIPELINE_FILE_NAME}&versionDescriptor.versionType=branch&versionDescriptor.version=${TARGET_REPO_BRANCH}&api-version=6.0")

                  if [ "$response_target_code" == "200" ]; then
                    echo "${PIPELINE_FILE_NAME} already exists in target repository. Skipping copy."
                  else
                    # Initialize LAST_COMMIT_ID to zeros by default
                    LAST_COMMIT_ID="0000000000000000000000000000000000000000"

                    # Get repository info to check if it's empty
                    REPO_INFO=$(curl -s -u :$PERSONAL_ACCESS_TOKEN \
                      "${TARGET_REPO_API_URL}?api-version=6.0")

                    DEFAULT_BRANCH=$(echo "$REPO_INFO" | jq -r '.defaultBranch')

                    if [ -z "$DEFAULT_BRANCH" ] || [ "$DEFAULT_BRANCH" == "null" ]; then
                      echo "Target repository is empty."
                      REPO_IS_EMPTY=true
                    else
                      echo "Target repository is not empty."
                      REPO_IS_EMPTY=false
                    fi

                    if [ "$REPO_IS_EMPTY" = true ]; then
                      echo "Repository is empty. Using LAST_COMMIT_ID as zeros for initial commit."
                    else
                      # Repository is not empty, check if branch exists
                      BRANCH_INFO=$(curl -s -u :$PERSONAL_ACCESS_TOKEN \
                        "${TARGET_REPO_API_URL}/refs/heads/${TARGET_REPO_BRANCH}?api-version=6.0")

                      BRANCH_EXISTS=$(echo "$BRANCH_INFO" | jq -r '.value[0].objectId')

                      if [ -n "$BRANCH_EXISTS" ] && [ "$BRANCH_EXISTS" != "null" ]; then
                        LAST_COMMIT_ID="$BRANCH_EXISTS"
                        echo "Branch exists. LAST_COMMIT_ID: $LAST_COMMIT_ID"
                      else
                        echo "Branch does not exist. Need to create branch."

                        # Get the commit ID of the default branch to base the new branch on
                        DEFAULT_BRANCH_NAME=${DEFAULT_BRANCH##*/}

                        DEFAULT_BRANCH_INFO=$(curl -s -u :$PERSONAL_ACCESS_TOKEN \
                          "${TARGET_REPO_API_URL}/refs/heads/${DEFAULT_BRANCH_NAME}?api-version=6.0")

                        DEFAULT_BRANCH_COMMIT_ID=$(echo "$DEFAULT_BRANCH_INFO" | jq -r '.value[0].objectId')

                        if [ -n "$DEFAULT_BRANCH_COMMIT_ID" ] && [ "$DEFAULT_BRANCH_COMMIT_ID" != "null" ]; then
                          # Use the default branch's commit ID as LAST_COMMIT_ID
                          LAST_COMMIT_ID="$DEFAULT_BRANCH_COMMIT_ID"
                          echo "Using default branch ${DEFAULT_BRANCH_NAME} commit ID: $LAST_COMMIT_ID as base for new branch."
                        else
                          echo "Failed to get default branch commit ID."
                          exit 1
                        fi
                      fi
                    fi

                    # Create a push to add the pipeline file using base64 encoded content
                    ADD_FILE_RESPONSE=$(curl -s -u :$PERSONAL_ACCESS_TOKEN \
                      -X POST \
                      -H "Content-Type: application/json" \
                      -d "{
                            \"refUpdates\": [{
                              \"name\": \"refs/heads/${TARGET_REPO_BRANCH}\",
                              \"oldObjectId\": \"${LAST_COMMIT_ID}\"
                            }],
                            \"commits\": [{
                              \"comment\": \"Adding ${PIPELINE_FILE_NAME}\",
                              \"changes\": [{
                                \"changeType\": \"add\",
                                \"item\": { \"path\": \"/${PIPELINE_FILE_NAME}\" },
                                \"newContent\": {
                                  \"content\": \"${PIPELINE_CONTENT_BASE64}\",
                                  \"contentType\": \"base64encoded\"
                                }
                              }]
                            }]
                          }" \
                      "${TARGET_REPO_API_URL}/pushes?api-version=6.0")

                    if ! echo "$ADD_FILE_RESPONSE" | jq -e '.commits' > /dev/null; then
                      echo "Failed to add ${PIPELINE_FILE_NAME} to target repository."
                      echo "API Response: $ADD_FILE_RESPONSE"
                      exit 1
                    fi
                  fi

                  # Check if the pipeline already exists
                  EXISTING_PIPELINE_RESPONSE=$(curl -s -u :$PERSONAL_ACCESS_TOKEN \
                    "https://dev.azure.com/${AZURE_ORGANIZATION}/${TARGET_PROJECT_NAME}/_apis/pipelines?api-version=6.0-preview.1")

                  PIPELINE_NAME="Pipeline for ${TARGET_REPO_NAME}"
                  EXISTING_PIPELINE_ID=$(echo "$EXISTING_PIPELINE_RESPONSE" | jq -r --arg PIPELINE_NAME "$PIPELINE_NAME" '.value[] | select(.name==$PIPELINE_NAME) | .id')

                  if [ -n "$EXISTING_PIPELINE_ID" ]; then
                    # Optionally update the existing pipeline or skip creation
                    echo "Pipeline already exists with ID: $EXISTING_PIPELINE_ID. Skipping creation."
                  else
                    # Create the pipeline in Azure DevOps
                    CREATE_PIPELINE_RESPONSE=$(curl -s -u :$PERSONAL_ACCESS_TOKEN \
                      -X POST \
                      -H "Content-Type: application/json" \
                      -d "{
                            \"name\": \"${PIPELINE_NAME}\",
                            \"configuration\": {
                              \"type\": \"yaml\",
                              \"path\": \"/${PIPELINE_FILE_NAME}\",
                              \"repository\": {
                                \"id\": \"${TARGET_REPO_NAME}\",
                                \"type\": \"azureReposGit\"
                              }
                            }
                          }" \
                      "https://dev.azure.com/${AZURE_ORGANIZATION}/${TARGET_PROJECT_NAME}/_apis/pipelines?api-version=7.1-preview.1")

                    PIPELINE_ID=$(echo "$CREATE_PIPELINE_RESPONSE" | jq -r '.id')

                    if [ -z "$PIPELINE_ID" ] || [ "$PIPELINE_ID" == "null" ]; then
                      echo "Failed to create pipeline."
                      echo "API Response: $CREATE_PIPELINE_RESPONSE"
                      exit 1
                    fi
                  fi

                displayName: "Copy ${PIPELINE_FILE_NAME} and Create ADO Pipeline"
                env:
                  PERSONAL_ACCESS_TOKEN: $(PERSONAL_ACCESS_TOKEN)

      - stage: update_run_status
        dependsOn:
          - fetch_port_access_token
          - copy_and_create_pipeline
        condition: succeeded()
        jobs:
          - job: update_run_status
            variables:
              accessToken: $[ stageDependencies.fetch_port_access_token.fetch_port_access_token.outputs['getToken.accessToken'] ]
            steps:
              - script: |
                  curl -X PATCH \
                    -H 'Content-Type: application/json' \
                    -H 'Authorization: Bearer $(accessToken)' \
                    -d '{"status":"SUCCESS","statusLabel":"Successfully copied file","message": {"run_status": "Copying finished successfully!" }}' \
                    "https://api.getport.io/v1/actions/runs/${{ variables.RUN_ID }}"
                displayName: "Update Port with Success Status"

      - stage: update_run_status_failed
        dependsOn:
          - fetch_port_access_token
          - copy_and_create_pipeline
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
                    -d '{"status":"FAILURE","statusLabel":"Failed to copy file","message": {"run_status": "Copying pipeline failed" }}' \
                    "https://api.getport.io/v1/actions/runs/${{ variables.RUN_ID }}"
                displayName: "Update Port with Failure Status"

    ```

    </details>


6. To configure the Pipeline in your project go to Pipelines -> Create Pipeline -> Azure Repos Git and choose `pipeline_copier` and click Save (in "Run" dropdown menu). 



7. Create the following variables as [Secret Variables](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/set-secret-variables?view=azure-devops&tabs=yaml%2Cbash):

   - `PERSONAL_ACCESS_TOKEN` - a [Personal Access Token](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows) with the following scopes:
        - Code: Full.
        - Build: Read, Read & execute.
        - Project and Team: Read, Write.

   - `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
   - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).

## Execute the action
1. Head over to the [Self-service](https://app.getport.io/self-serve) page of your Port application.

2. Click on the `Copy Pipeline Template to Target Repo` action.

3. Select the `Base Repository` where the template resides.

4. Select the `Target Repository` where the repository will be copied to.

5. Click the `Execute` button to trigger the action.

<AzureDevopsTroubleshootingLink />

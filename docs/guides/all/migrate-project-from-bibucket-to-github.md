---
displayed_sidebar: null
description: Migrate repositories from Bitbucket to GitHub using Port self-service actions and GitHub Actions
---
# Migrate repositories from Bitbucket to GitHub using Port self-service actions

This guide demonstrates how to migrate repositories from Bitbucket to GitHub using Port's self-service actions together with a GitHub Actions workflow.

We will use Port to model your repositories, trigger a standardized migration flow, and keep visibility of progress using scorecards and logs.

Once implemented you will be able to:
- Set up Bitbucket and GitHub integrations so Port discovers repositories and metadata.
- Model repositories with blueprints and scorecards to track migration readiness and status.
- Trigger a repeatable migration flow from Port that runs a GitHub Actions workflow.


## Prerequisites

You should have the following in place for this migration:

- A Port account (sign up at https://port.io to create one)
- A Bitbucket account with the specified project and set of repositories you want to migrate to GitHub
- A GitHub organization where you have owner permissions or permissions to create a repository

## Set up data model

To represent your Bitbucket and GitHub repositories in your portal, we need to create blueprints for each service type, set up data source integrations, and configure scorecards to track migration status.

### Create the GitHub Service blueprint

1. Go to the [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following JSON schema:

    <details>
    <summary><b>GitHub Service blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "githubService",
      "title": "GitHub Service",
      "icon": "Github",
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
          "language": {
            "title": "Language",
            "type": "string",
            "icon": "DefaultProperty"
          },
          "codeowners": {
            "type": "string",
            "title": "Codeowners",
            "description": "Codeowners file",
            "icon": "Team",
            "format": "markdown"
          },
          "jenkinsfile": {
            "type": "string",
            "title": "Jenkins Configuration",
            "description": "Jenkins",
            "icon": "CICD",
            "format": "markdown"
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

5. Click on `Save` to create the blueprint.

### Create the Bitbucket Service blueprint

1. Go to the [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following JSON schema:

    <details>
    <summary><b>Bitbucket Service blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "bitbucketService",
      "title": "Bitbucket Service",
      "icon": "Service",
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
          "language": {
            "title": "Language",
            "type": "string",
            "icon": "DefaultProperty"
          },
          "codeowners": {
            "type": "string",
            "title": "Codeowners",
            "description": "Codeowners file",
            "icon": "Team",
            "format": "markdown"
          },
          "jenkinsfile": {
            "type": "string",
            "title": "Jenkins Configuration",
            "description": "Jenkins",
            "icon": "CICD",
            "format": "markdown"
          }
        },
        "required": []
      },
      "mirrorProperties": {
        "github_service_name": {
          "title": "githubServiceName",
          "path": "githubService.$title"
        }
      },
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "githubService": {
          "title": "Github Repo URL",
          "target": "githubService",
          "required": false,
          "many": false
        },
        "project": {
          "title": "Project",
          "target": "bitbucketProject",
          "required": false,
          "many": false
        }
      }
    }
    ```

    </details>

5. Click on `Save` to create the blueprint.

### Set up GitHub integration

1. Set up the Port's GitHub integration by following [Port's setup guide for GitHub](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/#setup).

2. Configure the mapping:
    1. From the [data sources](https://app.getport.io/settings/data-sources) page, locate the GitHub integration you installed and click on it.
    2. Under the **Mapping** field, paste the following mapping configuration:
    
    <details>
    <summary><b>GitHub mapping configuration (Click to expand)</b></summary>

    ```yaml showLineNumbers
    createMissingRelatedEntities: true
    resources:
      - kind: repository
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .name
              title: .name
              blueprint: '"githubService"'
              properties:
                readme: file://README.md
                url: .html_url
                language: .language
                codeowners: file://.github/CODEOWNERS
                jenkinsfile: file://Jenkinsfile
    ```

    </details>

3. Click on the **Save & Resync** button at the bottom right corner.

### Set up Bitbucket integration

1. Set up the Port's Bitbucket integration by following [Port's setup guide for Bitbucket](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/bitbucket-cloud/).

2. Configure the mapping:
    1. From the [data sources](https://app.getport.io/settings/data-sources) page, locate the Bitbucket integration you installed and click on it.
    2. Under the **Mapping** field, paste the following mapping configuration:
    
    <details>
    <summary><b>Bitbucket mapping configuration (Click to expand)</b></summary>

    ```yaml showLineNumbers
    branch: main
    resources:
      - kind: repository
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .name
              title: .name
              blueprint: '"bitbucketService"'
              properties:
                readme: file://README.md
                url: ".links.html.href"
                language: .language
                jenkinsfile: file://Jenkinsfile
                codeowners: file://.bitbucket/CODEOWNERS
              relations:
                githubService:
                  combinator: '"and"'
                  rules:
                    - property: '"$title"'
                      operator: '"="'
                      value: .name
    ```

    </details>

3. Click on the **Save & Resync** button at the bottom right corner.

## Set up scorecards

The **scorecards** for tracking migration status will be **included** in the two blueprints (`githubService` and `bitbucketService`). They're **descriptive** only—there's no automated step that triggers or blocks action based on the scorecards. However, they help teams quickly see which repositories:

- Are still in Bitbucket vs. which have been migrated to GitHub,
- Have certain configuration files (e.g. `README.md`, `Jenkinsfile`),
- Or meet other custom criteria you want to display in the Port dashboard.

The migration process will automatically update relevant fields in Port, keeping these scorecards in sync with the actual state of your repositories.

### Create GitHub service scorecard

1. From the [data model](https://app.getport.io/settings/data-model) page, select the **Data model** page on the left sidebar.
2. Locate your previously-created GitHub blueprint.
3. Click on the **Scorecards** tab.
4. Click on **New scorecard**.
5. Paste the scorecard JSON definition below:

    <details>
    <summary><b>GitHub service scorecard (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "bbToGithubMigration",
      "title": "Migration",
      "levels": [
        {
          "color": "paleBlue",
          "title": "Basic"
        },
        {
          "color": "bronze",
          "title": "Bronze"
        },
        {
          "color": "silver",
          "title": "Silver"
        },
        {
          "color": "gold",
          "title": "Gold"
        }
      ],
      "rules": [
        {
          "identifier": "hasReadme",
          "title": "Has Readme",
          "description": "Checks if the service has a README file",
          "level": "Bronze",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "readme"
              }
            ]
          }
        },
        {
          "identifier": "hasCodeowner",
          "title": "Has Codeowners",
          "description": "Checks if the service has a CODEOWNERS file",
          "level": "Silver",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "property": "codeowners",
                "operator": "isNotEmpty"
              }
            ]
          }
        },
        {
          "identifier": "hasCICD",
          "title": "Has CI/CD",
          "description": "Checks if the service has a CI/CD configured",
          "level": "Gold",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "property": "jenkinsfile",
                "operator": "isNotEmpty"
              }
            ]
          }
        }
      ]
    }
    ```

    </details>

### Create Bitbucket service scorecard

1. From the [data model](https://app.getport.io/settings/data-model) page, select the **Data model** page on the left sidebar.
2. Locate your previously-created Bitbucket blueprint.
3. Click on the **Scorecards** tab.
4. Click on **New scorecard**.
5. Paste the scorecard JSON definition below:

    <details>
    <summary><b>Bitbucket service scorecard (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "bbToGithubMigration",
      "title": "Migration",
      "levels": [
        {
          "color": "paleBlue",
          "title": "Basic"
        },
        {
          "color": "bronze",
          "title": "Bronze"
        },
        {
          "color": "silver",
          "title": "Silver"
        },
        {
          "color": "gold",
          "title": "Gold"
        }
      ],
      "rules": [
        {
          "identifier": "hasReadme",
          "title": "Has Readme",
          "description": "Checks if the service has a README file",
          "level": "Bronze",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "readme"
              }
            ]
          }
        },
        {
          "identifier": "hasCodeowner",
          "title": "Has Codeowners",
          "description": "Checks if the service has a CODEOWNERS file",
          "level": "Silver",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "property": "codeowners",
                "operator": "isNotEmpty"
              }
            ]
          }
        },
        {
          "identifier": "hasCICD",
          "title": "Has CI/CD",
          "description": "Checks if the service has a CI/CD configured",
          "level": "Silver",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "property": "jenkinsfile",
                "operator": "isNotEmpty"
              }
            ]
          }
        },
        {
          "identifier": "hasGitHubService",
          "title": "Has GitHub equivalent",
          "description": "Checks if the service has been migrated to GitHub",
          "level": "Gold",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "property": "github_service_name",
                "operator": "isNotEmpty"
              }
            ]
          }
        }
      ]
    }
    ```

    </details>

6. Click on **Save** to create the scorecard.

:::info Scorecard differences
The Bitbucket scorecard additionally tracks the existence of a GitHub repository counterpart for each Bitbucket repository, helping you monitor migration status.
:::

## Set up self-service actions

We'll create a self-service action that allows users to trigger the migration flow from Port's UI.

### Create the migration action

1. Go to the [Self-service](https://app.getport.io/self-serve) page.

2. Click on `+ Action`.

3. Click on `Edit JSON` to enter JSON mode.

4. Copy and paste the following action configuration:

    <details>
    <summary><b>Self-service action configuration (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "migrate_service_from_bitbucket_to_git_hub",
      "title": "Migrate Service From Bitbucket To GitHub",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "service": {
              "type": "array",
              "title": "Service",
              "items": {
                "type": "string",
                "format": "entity",
                "blueprint": "bitbucketRepository"
              }
            },
            "visibility": {
              "type": "string",
              "title": "Visibility",
              "default": "Internal",
              "icon": "Permissions",
              "description": "Visibility of the repositories selected",
              "enum": [
                "Private",
                "Public",
                "Internal"
              ],
              "enumColors": {
                "Private": "lightGray",
                "Public": "lightGray",
                "Internal": "lightGray"
              }
            }
          },
          "required": [
            "service",
            "visibility"
          ],
          "order": [
            "service"
          ]
        },
        "blueprintIdentifier": "githubService"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "YOUR-ORG",
        "repo": "YOUR-REPOSITORY",
        "workflow": "migrate-to-github.yml",
        "workflowInputs": {
          "repositories": "{{ [.inputs.service[] | {name: .identifier, project: .relations.project, workspace: .properties.workspace }] }}",
          "visibility": "{{ .inputs.visibility | ascii_downcase }}",
          "port_context": {
            "run_id": "{{ .run.id }}",
            "blueprint": "{{ .action.blueprint }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false,
      "icon": "GitSubIcon"
    }
    ```

    </details>

5. Replace the `org` and `repo` fields with:
    - `org`: Your GitHub organization or user where the GitHub workflow resides
    - `repo`: The repository in the `org` where the GitHub workflow resides

6. Click `Save` to create the action.

:::tip Workflow name
Make sure the workflow name matches the filename of your GitHub Actions workflow (in this guide, `"migrate-to-github.yml"`).
:::

## Create the GitHub Actions workflow

Create a file in your repository at `.github/workflows/migrate-to-github.yml`. This workflow handles the actual migration steps—cloning from Bitbucket, creating the repo in GitHub, and pushing the code.

<details>
<summary><b>GitHub Actions workflow (Click to expand)</b></summary>

```yaml showLineNumbers
# This workflow is used to migrate a Bitbucket repository to GitHub repository
# The repository is cloned from Bitbucket and pushed to GitHub even when the repository does not exist on GitHub
# The workflow is triggered when a new repository is created in Bitbucket

name: Migrate Bitbucket Repositories to GitHub

on:
  workflow_dispatch:
    inputs:
      repositories:
        description: "JSON array of objects, each with 'name', 'workspace', and 'project'"
        required: true
        type: string
      visibility:
        description: "Repository visibility (public, private, internal)"
        required: true
        type: string
        default: private
      port_context:
        description: "JSON string with blueprint, run_id, etc. from Port."
        required: true
        type: string

jobs:
  migrate-bitbucket-repos:
    runs-on: ubuntu-latest
    steps:
      # 1) Inform Port that migration is starting
      - name: Inform Port about migration start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).run_id }}
          logMessage: "Starting Bitbucket → GitHub repository migration... 🚀"

      # 3) Loop over each repository, create on GitHub, mirror from Bitbucket
      - name: Migrate repositories
        id: migrate_repos
        run: |
          echo "Authenticating with GitHub..."
          gh auth status

          # Track successful migrations
          successful_repos=()

          REPOS_JSON='${{ inputs.repositories }}'
          echo "Raw input: $REPOS_JSON"

          for row in $(echo "$REPOS_JSON" | jq -rc '.[]'); do

            echo "$row"
            REPO_NAME=$(echo "${row}" | jq -r '.name')
            PROJECT=$(echo "${row}" | jq -r '.workspace')
            echo $REPO_NAME
            echo $PROJECT
            echo "::group::Migrating ${REPO_NAME}"

            # 3b) Mirror from Bitbucket to GitHub
            echo "Cloning ${REPO_NAME} from Bitbucket project '${PROJECT}'..."
            git clone --mirror "https://${BB_USERNAME}:${BB_PASSWORD}@bitbucket.org/${PROJECT}/${REPO_NAME}.git"
            if [ $? -ne 0 ]; then
              echo "Failed to clone Bitbucket repository: ${REPO_NAME}"
              echo "::endgroup::"
              continue
            fi
              
            cd "${REPO_NAME}.git"

            # 3a) Create GitHub repository
            echo "Creating GitHub repo ${REPO_NAME}..."
            gh repo create "${GITHUB_ORG}/${REPO_NAME}" --${{ inputs.visibility }} --push --source .
            if [ $? -ne 0 ]; then
              echo "Failed to create GitHub repository: ${REPO_NAME}"
              echo "::endgroup::"
              continue
            fi

            # # 3b) Mirror from Bitbucket to GitHub
            # echo "Cloning ${REPO_NAME} from Bitbucket project '${PROJECT}'..."
            # git clone --mirror "https://${BB_USERNAME}:${BB_PASSWORD}@bitbucket.org/${PROJECT}/${REPO_NAME}.git"
            # if [ $? -ne 0 ]; then
            #   echo "Failed to clone Bitbucket repository: ${REPO_NAME}"
            #   echo "::endgroup::"
            #   continue
            # fi

            # cd "${REPO_NAME}.git"

            # echo "Pushing mirror to GitHub..."
            # git remote set-url --push origin "https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_ORG}/${REPO_NAME}.git"
            # git repo create ${REPO_NAME} --${{ inputs.visibility }} --source .
            # if [ $? -ne 0 ]; then
            #   echo "Failed to push to GitHub repository: ${REPO_NAME}"
            #   cd ..
            #   rm -rf "${REPO_NAME}.git"
            #   echo "::endgroup::"
            #   continue
            # fi

            cd ..
            rm -rf "${REPO_NAME}.git"

            # Add to successful migrations list
            successful_repos+=("${REPO_NAME}")

            echo "Successfully migrated ${REPO_NAME}"
            echo "::endgroup::"
          done

          # Expose the list of successfully migrated repos to future steps
          echo "successful_repos=${successful_repos[*]}" >> "$GITHUB_OUTPUT"
          echo "Successfully migrated repositories: ${successful_repos[*]}"
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
          BB_USERNAME: ${{ secrets.BB_USERNAME }}
          BB_PASSWORD: ${{ secrets.BB_PASSWORD }}
          GITHUB_ORG: ${{ secrets.GH_ORG }}
        shell: bash

      # 4) Use a separate step to collect repository data for Port
      - name: Collect repository data for Port
        if: env.successful_repos != ''
        id: collect_repo_data
        run: |
          # Create a JSON array to store all repository data
          echo "repo_data=[]" >> $GITHUB_OUTPUT

          for REPO in $successful_repos; do
            echo "Collecting data for ${REPO}..."

            # Get repository details from GitHub
            REPO_INFO=$(gh api "repos/${GH_ORG}/${REPO}")
            VISIBILITY=$(echo "$REPO_INFO" | jq -r '.visibility')
            URL=$(echo "$REPO_INFO" | jq -r '.html_url')
            DESCRIPTION=$(echo "$REPO_INFO" | jq -r '.description // ""')

            # Create the payload for Port API and add to array
            REPO_PAYLOAD=$(cat << EOF
            {
                "identifier": "${REPO}",
                "title": "${REPO}",
                "blueprint": "${{ fromJson(inputs.port_context).blueprint }}",
                "properties": {
                    "visibility": "${VISIBILITY}",
                    "url": "${URL}",
                    "description": "${DESCRIPTION}",
                    "source": "bitbucket",
                    "migrationDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
                },
                "relations": {}
            }
            EOF
            )
            
            # Append to the output in a format that can be parsed as JSON
            echo "repo_data=$(echo $repo_data | jq --argjson new "$REPO_PAYLOAD" '. + [$new]')" >> $GITHUB_OUTPUT

            echo "Collected data for ${REPO}"
          done
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
          GH_ORG: ${{ secrets.GH_ORG }}

      # 5) Final log message in Port for the migration job
      - name: Inform Port of migration completion
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).run_id }}
          logMessage: |
            Repository migration completed! ✅
            Successfully migrated: ${{ env.successful_repos }}
            Proceeding to register repositories in Port...

  # New job to upsert repositories to Port using matrix
  upsert-to-port:
    needs: migrate-bitbucket-repos
    if: needs.migrate-bitbucket-repos.outputs.repo_data != '[]'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        repo: ${{ fromJson(needs.migrate-bitbucket-repos.outputs.repo_data) }}
    steps:
      - name: Upsert repository to Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: UPSERT_ENTITY
          blueprint: ${{ matrix.repo.blueprint }}
          identifier: ${{ matrix.repo.identifier }}
          title: ${{ matrix.repo.title }}
          properties: ${{ toJSON(matrix.repo.properties) }}
          relations: ${{ toJSON(matrix.repo.relations) }}

      - name: Log repository registration
        run: echo "Successfully registered ${{ matrix.repo.title }} in Port"

```

</details>

:::info Required secrets
You'll need to set up the following secrets in your GitHub repository (under **Settings → Secrets and variables → Actions**):

- **`GH_TOKEN`**: Your GitHub Personal Access Token (PAT) with permissions to create repositories
- **`BB_USERNAME`**: Your Bitbucket username
- **`BB_PASSWORD`**: A Bitbucket API token. Create one following [Atlassian's guide on API Tokens](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)
- **`GH_ORG`**: The GitHub organization where you're creating migrated repos
- **`PORT_CLIENT_ID`** and **`PORT_CLIENT_SECRET`**: For Port's GitHub Action
:::

## Let's test it

1. Go to the [Self-service](https://app.getport.io/self-serve) page.

2. Find the "Migrate Service From Bitbucket To GitHub" action.

3. Click `Execute`.

4. Choose one or more repositories from the dropdown and set the visibility.

5. Monitor the action execution in Port's logs.

6. Verify that repositories are successfully migrated to your GitHub organization.

# Migrate repositories from Bitbucket to GitHub using Port self-service actions

## Introduction

Migrating repositories from Bitbucket Server to GitHub Enterprise can streamline development workflows, centralize code management, and take advantage of GitHub’s extensive ecosystem. By using [Port](https://port.io/)’s self-service action (SSA), this process can be made as easy as possible. In this guide, we will be walking through the process of setting up our Port environment to make migration processes easy. Here is an outline of the steps we will be taking:

1. **Set up relevant integrations on Port** – Provide Port access to both Bitbucket and GitHub, enabling Port to discover your repositories and metadata.
2. **Set Up Repository Blueprints** – Define blueprints that map critical repository properties from Bitbucket and GitHub into Port.
3. **Set up Scorecards for tracking Migration status** — **Scorecards** enable us to define and track metrics relevant to the migration process such as: presence of a [README.md](http://README.md) file or the presence of a CI/CD setup in place.
4. **Configure the Self-Service Action** – Providing a consistent and repeatable way in Port that triggers the migration logic.
5. **Setting up a GitHub Workflow** – The SSA calls a GitHub Actions workflow that handles the actual repo migration from Bitbucket to GitHub.
6. **Execute the Migration** – A simple button click in Port’s UI triggers the entire process.

Port ensures all the relevant repository data—like URLs, readmes, codeowner files, etc.—is synced for visibility. The built-in scorecards in the blueprints let you and your team track migration progress at a glance.

---

## Prerequisites

You should have the following in place for this migration:

- A Port account (sign up at https://port.io to create one)
- A Bitbucket account with the specified project and set of repositories you want to migrate to GitHub
- A GitHub organization where you have owner permissions or permissions to create a repository

## Setting up the GitHub and Bitbucket integrations on Port

### GitHub Integration

1. Set up the Port’s GitHub integration by following [Port’s setup guide for GitHub](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/#setup). 
2. Create a blueprint for a GitHub service so Port can catalog your GitHub repositories:
    1. Go to the [Builder](https://app.getport.io/settings/data-model) page on your Port dashboard and select **Data Model** on the left side bar
    2. Click on **+ Blueprint** to create a blueprint
    3. Click on the **Edit JSON** button to enter JSON mode and paste the blueprint definition below
    
<details>
<summary><b>GitHub Service blueprint (click to expand)</b></summary>

```json showLineNumbers title="GitHub Service blueprint"
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
    
    d. Click on **Save**
    
3. **Mapping Configuration**:
    
    Next, we define a mapping configuration to ingest GitHub repositories, associating them to the `githubService` blueprint in Port.
    
    1. From the [Builder](https://app.getport.io/settings/data-model) page, select [data sources](https://app.getport.io/settings/data-sources)
    2. Scroll till you locate the GitHub integration you installed and click on it
    3. Under the **Mapping** field, paste the following mapping configuration
    
<details>
<summary><b>GitHub mapping configuration (click to expand)</b></summary>

```yaml showLineNumbers title="GitHub mapping configuration"
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
    
    d. Click on the **Save & Resync** button at the bottom right corner
    
- It extracts specific repository files (e.g., `README.md`, `CODEOWNERS`, `Jenkinsfile`) and includes them in the blueprint properties.

---

### Bitbucket Integration

1. Set up the Port’s Bitbucket integration by following [Port’s setup guide for Bitbucket](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/bitbucket-cloud/). 
2. Create a blueprint for a Bitbucket service so Port can catalog your Bitbucket repositories:
    1. Go to the [Builder](https://app.getport.io/settings/data-model) page on your Port dashboard and select **Data Model** on the left side bar
    2. Click on **+ Blueprint** to create a blueprint
    3. Click on the **Edit JSON** button to enter JSON mode and paste the blueprint definition below
    
<details>
<summary><b>Bitbucket Service blueprint (click to expand)</b></summary>

```json showLineNumbers title="Bitbucket Service blueprint"
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
    
    d. Click on **Save**
    
- It includes the GitHub service equivalent to track the existence of the relevant migrated GitHub service
1. **Mapping Configuration**:
    
    Next, we define a mapping configuration to ingest Bitbucket repositories, associating them to the `bitbucketService` blueprint in Port.
    
    1. From the [Builder](https://app.getport.io/settings/data-model) page, select [data sources](https://app.getport.io/settings/data-sources)
    2. Scroll till you locate the Bitbucket integration you installed and click on it
    3. Under the **Mapping** field, paste the following mapping configuration
    
<details>
<summary><b>Bitbucket mapping configuration (click to expand)</b></summary>

```yaml showLineNumbers title="Bitbucket mapping configuration"
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
    
    d. Click on the **Save & Resync** button at the bottom right corner
    
- It extracts specific repository files (e.g., `README.md`, `CODEOWNERS`, `Jenkinsfile`) and includes them in the blueprint properties.

---

## Scorecards (in the blueprints)

The **scorecards** for tracking migration status will be **included** in the two blueprints (`githubService` and `bitbucketService`). They’re **descriptive** only—there’s no automated step that triggers or blocks action based on the scorecards. However, they help teams quickly see which repositories:

- Are still in Bitbucket vs. which have been migrated to GitHub,
- Have certain configuration files (e.g. `README.md`, `Jenkinsfile`),
- Or meet other custom criteria you want to display in the Port dashboard.

The migration process will automatically update relevant fields in Port, keeping these scorecards in sync with the actual state of your repositories.

### `githubService` scorecard

1. From the **Builder** page, select the **Data model** page on the left sidebar
2. Locate your previously-created GitHub blueprint (you can use the search input for this)
3. On the blueprint, click on the **Scorecards** tab
4. Click on **New scorecard**
5. Paste the scorecard JSON definition below:
    
    ```json
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
    

---

### `bitbucketService` scorecard

1. From the **Builder** page, select the **Data model** page on the left sidebar
2. Locate your previously-created Bitbucket blueprint (you can use the search input for this)
3. On the blueprint, click on the **Scorecards** tab
4. Click on **New scorecard**
5. Paste the scorecard JSON definition below:
    
    ```json
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
    
- While the Bitbucket scorecard is largely similar to that of GitHub, this scorecard additionally tracks the existence of a GitHub repository counterpart for each Bitbucket repository

## What’s Next

With your GitHub and Bitbucket integrations set up and your blueprints ready, the next steps are:

1. **Configuring the Self-Service Action (SSA)** – We’ll define the JSON for the action that triggers the migration logic.
2. **Setting Up a GitHub Actions Workflow** – This receives calls from Port’s SSA and performs the actual repository migration.
3. **Executing the Migration** – A user simply selects a Bitbucket repo in Port and clicks **Execute**, kicking off the entire pipeline.

---

## Configure the self-service action (SSA)

A **Self-Service Action (SSA)** in Port is how you define a user-facing action (in this case, “Migrate Service From Bitbucket To GitHub”). To set this up, follow the steps below:

1. Go to the [**Self-service**](https://app.port.io/organization/self-serve) page
2. Click on the **+ Action** button at the top right corner
3. Click on **Edit JSON** to enter JSON mode
4. Paste the following JSON replacing the `org` and `repo`  fields with:
    - `org`: The GitHub organization or user where the GitHub workflow containing the logic for the migration resides
    - `repo`: The repository in the `org` where the GitHub workflow containing the logic for the migration resides

The following JSON outlines the structure and parameters for this action:

<details>
<summary><b>Self-service action configuration (click to expand)</b></summary>

```json showLineNumbers title="Self-service action configuration"
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

### Key points to customize

- **`org`**: Replace `"YOUR-ORG"` with **your GitHub organization**.
- **`repo`**: Replace `"YOUR-REPOSITORY"` with the repository where your workflow file resides.
- **`workflow`**: Make sure the name matches the filename of your GitHub Actions workflow (in this guide, `"migrate-to-github.yml"`).

Once you save this JSON in Port, you’ll have a new action in the UI that you can execute whenever you want to migrate a repository from Bitbucket to GitHub.

---

## Create the GitHub Actions workflow

This YAML file (named `migrate-to-github.yml` in the example) lives in your designated GitHub repository (the same one referenced in the SSA JSON above). It handles the actual migration steps—cloning from Bitbucket, creating the repo in GitHub, and pushing the code.

Create a file in your repository, `.github/workflows/migrate-to-github.yml`

<details>
<summary><b>GitHub Actions workflow (click to expand)</b></summary>

```yaml showLineNumbers title="migrate-to-github.yml"
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

### Required action secrets

You’ll need to set up the following **secrets** in your GitHub repository (under **Settings → Secrets and variables → Actions**):

- **`GH_TOKEN`**: Your GitHub Personal Access Token (PAT). This token should have permissions to create repositories in the Github organization
- **`BB_USERNAME`**: Your Bitbucket username.
- **`BB_PASSWORD`**: An API token created in Bitbucket. You can do that by following [Atlassian’s guide on API Tokens](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)
- **`GH_ORG`**: The GitHub organization where you’re creating the migrated repos.

Additionally, you’ll need these secrets to inform Port’s run status:

- **`PORT_CLIENT_ID`** and **`PORT_CLIENT_SECRET`** (if using the Port GitHub Action).

---

## Trigger and migration flow

With everything in place:

1. **Open Port**, navigate to your [Self-Service Actions](https://app.getport.io/organization/self-serve).
2. Select the **Migrate Service From Bitbucket To GitHub** action you configured.
3. **Choose one or more repositories** from the dropdown (these come from your `bitbucketService` blueprint).
4. Click **Execute**.
5. **Port** will immediately dispatch the request to GitHub Actions. You can watch the logs in Port (and in GitHub Actions if you need deeper insight).

**Note**: By default, there is no automatic email or Slack notification. All output is displayed in Port’s UI and/or in the GitHub Actions logs.

---

## Known issues & troubleshooting

1. **Insufficient GitHub PAT Scopes**
    - Ensure your `GH_TOKEN` has permissions to create new repos in the target organization. If you see errors related to “permission denied,” check the token’s scopes (e.g., `repo` for private repos, `admin:org` if needed).
2. **Credential Errors**
    - If the `BB_USERNAME` or `BB_PASSWORD` (token) is incorrect, the mirror clone step will fail. Revisit your Bitbucket token under **Settings → Atlassian account settings → Security → API tokens**.
3. **Port Run Errors**
    - Check that **`PORT_CLIENT_ID`** or **`PORT_CLIENT_SECRET`**, are set correctly. Logs in Port typically show if authentication fails.

---

## Wrapping up

At this point, you have:

1. **Blueprints** for Bitbucket and GitHub repositories (both containing scorecards).
2. **A Self-Service Action (SSA)** in Port that triggers GitHub Actions.
3. **A GitHub Workflow** that clones from Bitbucket, creates/mirrors to GitHub, and reports back to Port.

Simply select the repositories in Port and click **Execute** whenever you want to move them from Bitbucket to GitHub. You can monitor each step’s progress in Port’s logs and confirm a successful migration in your GitHub organization.

---

With that, your team is all set to migrate Bitbucket repositories to GitHub in a self-service, automated fashion!
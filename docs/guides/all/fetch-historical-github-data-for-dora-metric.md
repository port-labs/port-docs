---
sidebar_position: 10
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx";
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'

# Fetch Historical GitHub Data for DORA Metrics

Organizations using Port often want to track **engineering metrics** like DORA. These metrics provide insight into how teams build, test, and deploy software. But to calculate meaningful metrics, you first need data.

This guide demonstrates how to **fetch historical GitHub data** using GitHub Actions.  
This data will become the foundation for building and visualizing your engineering metrics such as deployment frequency, lead time for changes, and more.

### Use cases
- These workflows are designed for **one-time or on-demand use** to help you backfill historical data. This is especially useful when onboarding to Port or when certain types of data (e.g., old PRs, releases, workflow runs) were never synced in real time.


### Prerequisites
- Complete the [Port onboarding process](https://docs.port.io/getting-started/overview).
- Access to a GitHub repository that is connected to Port.
- In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
    - `GH_TOKEN` - A GitHub personal access token (PAT) with access to read PR, release, workflow run, and deployment.
    - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
    - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

## Tracking deployments

In this section, we focus on **deployment tracking**. A deployment refers to shipping code to a live environment such as Production, Staging, or QA. We'll provide ready-to-use GitHub Actions that extract historical deployment-related data and send it to Port.

### Data model setup

You will need to manually create blueprints for Github **Repository** and **User** as you will need them when defining the self service actions.

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint` button to create a new blueprint.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add the following JSON schemas separately into the editor while clicking `Save` to create the blueprint one after the other:

    <details>
    <summary><b>GitHub Repository Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "githubRepository",
    "title": "Repository",
    "icon": "Github",
    "ownership": {
        "type": "Direct"
    },
    "schema": {
        "properties": {
        "readme": {
            "title": "README",
            "type": "string",
            "format": "markdown"
        },
        "url": {
            "icon": "DefaultProperty",
            "title": "Repository URL",
            "type": "string",
            "format": "url"
        },
        "defaultBranch": {
            "title": "Default branch",
            "type": "string"
        },
        "last_contributor": {
            "title": "Last contributor",
            "icon": "TwoUsers",
            "type": "string",
            "format": "user"
        },
        "last_push": {
            "icon": "GitPullRequest",
            "title": "Last push",
            "description": "Last commit to the main branch",
            "type": "string",
            "format": "date-time"
        },
        "require_code_owner_review": {
            "title": "Require code owner review",
            "type": "boolean",
            "icon": "DefaultProperty",
            "description": "Requires review from code owners before a pull request can be merged"
        },
        "require_approval_count": {
            "title": "Require approvals",
            "type": "number",
            "icon": "DefaultProperty",
            "description": "The number of approvals required before merging a pull request"
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


    <details>
    <summary><b>GitHub User Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "githubUser",
    "title": "Github User",
    "icon": "Github",
    "schema": {
        "properties": {
        "email": {
            "title": "Email",
            "type": "string"
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


### Tracking strategies
Choose your preferred historical strategy below. Each one targets a different kind of GitHub event that could indicate a deployment:

<Tabs groupId="deployment-strategies" queryString defaultValue="pr-merge" values={[
{label: "PR Merge", value: "pr-merge"},
{label: "Workflow Run", value: "workflow-run"},
{label: "Releases/Tags", value: "releases-tags"},
{label: "Deployments", value: "deployments"}
]}>

<TabItem value="pr-merge" label="PR/MR Merge">

One of the ways to track deployments is by monitoring when pull requests (PRs) are merged into a branch, typically the **main** or **master** branch.

We will create a GitHub Action that extracts this historical data and pushes it to Port.

<h3> Step 1: Add GitHub Workflow </h3>

Create the file `.github/workflows/create_deployment_for_pull_request.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary><b>Fetch Historical Pull Request GitHub Workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Fetch Historical PR Deployment Data

on:
  workflow_dispatch:
    inputs:
      config:
        description: 'JSON input configuration for fetching PRs'
        required: true
        type: string
      port_payload:
        required: true
        description: Port's payload, including details for who triggered the action and general context (blueprint, run id, etc...)

jobs:
  fetch-prs:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Inform execution of request to fetch historical pull request data
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).runId}}
          logMessage: "About to fetch pull request data from GitHub..."

      - name: Fetch Port Access Token
        id: fetch_port_token
        run: |
          PORT_ACCESS_TOKEN=$(curl -s -L 'https://api.getport.io/v1/auth/access_token' \
            -H 'Content-Type: application/json' \
            -H 'Accept: application/json' \
            -d '{
              "clientId": "${{ secrets.PORT_CLIENT_ID }}",
              "clientSecret": "${{ secrets.PORT_CLIENT_SECRET }}"
            }' | jq -r '.accessToken')

          echo "PORT_ACCESS_TOKEN=$PORT_ACCESS_TOKEN" >> "$GITHUB_ENV"
          
      - name: Parse Input Configuration
        id: parse_config
        run: |
          echo '${{ inputs.config }}' > config.json
          CONFIG_JSON=$(jq -c . config.json)
          echo "CONFIG_JSON=$CONFIG_JSON" >> "$GITHUB_ENV"
      
      - name: Extract Filters from JSON
        id: extract_filters
        run: |
          CONFIG_JSON=$(echo '${{ env.CONFIG_JSON }}' | jq -c .)

          # Extract individual fields
          DEPLOY_BRANCH=$(echo "$CONFIG_JSON" | jq -r '.deploy_branch // "main"')
          PR_RULES_FIELDS=$(echo "$CONFIG_JSON" | jq -c '.pr_rules_fields // []')
          PR_STATUS_OP=$(echo "$CONFIG_JSON" | jq -r '.pr_rules_status_op // empty')
          PR_STATUS_VALUE=$(echo "$CONFIG_JSON" | jq -r '.pr_rules_status_options // empty')
          PR_AUTHOR_OP=$(echo "$CONFIG_JSON" | jq -r '.pr_rules_author_op // empty')
          PR_AUTHORS=$(echo "$CONFIG_JSON" | jq -r 'if .pr_rules_author then .pr_rules_author | map(.identifier) | join(" ") else "" end')
          PR_LABEL_OP=$(echo "$CONFIG_JSON" | jq -r '.pr_rules_label_op // empty')
          PR_LABEL_VALUE=$(echo "$CONFIG_JSON" | jq -r '.pr_rules_label_str // empty')
          PR_TITLE_OP=$(echo "$CONFIG_JSON" | jq -r '.pr_rules_title_op // empty')
          PR_TITLE_VALUE=$(echo "$CONFIG_JSON" | jq -r '.pr_rules_title_str // empty')
          PR_REPO_OP=$(echo "$CONFIG_JSON" | jq -r '.pr_rules_repo_op // empty')
          PR_REPO_VALUE=$(echo "$CONFIG_JSON" | jq -r 'if .pr_rules_repository then .pr_rules_repository | map(.identifier) | join(" ") else "" end')

          echo "DEPLOY_BRANCH=$DEPLOY_BRANCH" >> "$GITHUB_ENV"
          echo "PR_RULES_FIELDS=$PR_RULES_FIELDS" >> "$GITHUB_ENV"
          echo "PR_STATUS_OP=$PR_STATUS_OP" >> "$GITHUB_ENV"
          echo "PR_STATUS_VALUE=$PR_STATUS_VALUE" >> "$GITHUB_ENV"
          echo "PR_AUTHOR_OP=$PR_AUTHOR_OP" >> "$GITHUB_ENV"
          echo "PR_AUTHORS=$PR_AUTHORS" >> "$GITHUB_ENV"
          echo "PR_LABEL_OP=$PR_LABEL_OP" >> "$GITHUB_ENV"
          echo "PR_LABEL_VALUE=$PR_LABEL_VALUE" >> "$GITHUB_ENV"
          echo "PR_TITLE_OP=$PR_TITLE_OP" >> "$GITHUB_ENV"
          echo "PR_TITLE_VALUE=$PR_TITLE_VALUE" >> "$GITHUB_ENV"
          echo "PR_REPO_OP=$PR_REPO_OP" >> "$GITHUB_ENV"
          echo "PR_REPO_VALUE=$PR_REPO_VALUE" >> "$GITHUB_ENV"

      - name: Fetch All Repositories (if no repo filter applied)
        if: ${{ !contains(env.PR_RULES_FIELDS, 'Repository') }}
        id: fetch_repos
        run: |
          GH_TOKEN=${{ secrets.GH_TOKEN }}
          REPOS=()
          PAGE=1
          ORG=${{ github.repository_owner }}

          while :; do
            RESPONSE=$(curl -s -H "Authorization: token $GH_TOKEN" \
              "https://api.github.com/users/$ORG/repos?per_page=100&page=$PAGE")

            NEW_REPOS=$(echo "$RESPONSE" | jq -r '.[].full_name')
            if [[ -z "$NEW_REPOS" ]]; then break; fi

            REPOS+=($NEW_REPOS)
            ((PAGE++))
          done

          echo "REPO_LIST=${REPOS[*]}" >> "$GITHUB_ENV"

      - name: Set Single Repo if Repository Filter Exists
        if: ${{ contains(env.PR_RULES_FIELDS, 'Repository') }}
        run: |
          echo "REPO_LIST=${{ env.PR_REPO_VALUE }}" >> "$GITHUB_ENV"
          
      - name: Fetch PR Data
        id: upsert_pr_entity
        run: |
          GH_TOKEN=${{ secrets.GH_TOKEN }}
          REPOS=(${{ env.REPO_LIST }})
          CUTOFF_DATE=$(date -d '3 months ago' --utc +%Y-%m-%dT%H:%M:%SZ)
          FILTERED_PRS=""
          BLUEPRINT_ID="githubPullRequest"
          
          for REPO in "${REPOS[@]}"; do
            echo "Processing repo: $REPO"
            PAGE=1
      
            while true; do

              PR_STATE_FILTER="all" # Default to 'all' if no status filter is provided
              
              if [[ "$PR_STATUS_OP" == "is" ]]; then
                PR_STATE_FILTER="$PR_STATUS_VALUE"
              elif [[ "$PR_STATUS_OP" == "is not" ]]; then
                PR_STATE_FILTER=$([[ "$PR_STATUS_VALUE" == "closed" ]] && echo "open" || echo "closed")
              fi
              
              RESPONSE=$(curl -s -H "Authorization: token $GH_TOKEN" \
                "https://api.github.com/repos/$REPO/pulls?state=$PR_STATE_FILTER&per_page=100&page=$PAGE")

              # Convert JSON response into an array (to avoid broken pipe issues)
              PR_LIST=()
              while IFS= read -r PR; do
                PR_LIST+=("$PR")
              done < <(echo "$RESPONSE" | jq -c '.[]')

              # Stop if no more PRs are found
              if [[ "${#PR_LIST[@]}" -eq 0 ]]; then
                echo "No more PRs found for $REPO. Moving to the next repo..."
                break
              fi

              for PR in "${PR_LIST[@]}"; do
                PR_CREATED_AT=$(echo "$PR" | jq -r '.created_at')

                if [[ "$PR_CREATED_AT" < "$CUTOFF_DATE" ]]; then
                  #echo "PR is older than 3 months. Stopping further fetch for $REPO."
                  break 2  # Exit both loops
                fi

                PR_MATCHES_FILTERS=true

                PR_LABELS=($(echo "$PR" | jq -r '.labels[].name'))
                LABEL_MATCH=false
                
                for LABEL in "${PR_LABELS[@]}"; do
                  case "$PR_LABEL_OP" in
                    "equals") [[ "$LABEL" == "$PR_LABEL_VALUE" ]] && LABEL_MATCH=true ;;
                    "contains") [[ "$LABEL" == *"$PR_LABEL_VALUE"* ]] && LABEL_MATCH=true ;;
                    "starts with") [[ "$LABEL" == "$PR_LABEL_VALUE"* ]] && LABEL_MATCH=true ;;
                    "does not contain") [[ "$LABEL" == *"$PR_LABEL_VALUE"* ]] && LABEL_MATCH=false || LABEL_MATCH=true ;;
                    "does not start with") [[ "$LABEL" == "$PR_LABEL_VALUE"* ]] && LABEL_MATCH=false || LABEL_MATCH=true ;;
                  esac
                  [[ "$LABEL_MATCH" == true ]] && break  # Exit early if a match is found
                done
                
                # Apply final decision
                if [[ "$PR_LABEL_OP" =~ ^(equals|contains|starts with)$ && "$LABEL_MATCH" == false ]]; then
                  PR_MATCHES_FILTERS=false
                elif [[ "$PR_LABEL_OP" =~ ^(does not contain|does not start with)$ && "$LABEL_MATCH" == true ]]; then
                  PR_MATCHES_FILTERS=false
                fi


                PR_AUTHOR=$(echo "$PR" | jq -r '.user.login')  # Extract actual PR author
                AUTHOR_MATCH=false
                
                for AUTHOR in $PR_AUTHORS; do
                  echo "$AUTHOR"
                  case "$PR_AUTHOR_OP" in
                    "is") [[ "$PR_AUTHOR" == "$AUTHOR" ]] && AUTHOR_MATCH=true && break ;;
                    "is not") [[ "$PR_AUTHOR" == "$AUTHOR" ]] && AUTHOR_MATCH=false ;;
                  esac
                done
                
                # Apply final decision
                if [[ "$PR_AUTHOR_OP" == "is" && "$AUTHOR_MATCH" == false ]]; then
                  PR_MATCHES_FILTERS=false
                elif [[ "$PR_AUTHOR_OP" == "is not" && "$AUTHOR_MATCH" == true ]]; then
                  PR_MATCHES_FILTERS=false
                fi

                PR_TITLE=$(echo "$PR" | jq -r '.title')
                
                case "$PR_TITLE_OP" in
                  "equals") [[ "$PR_TITLE" != "$PR_TITLE_VALUE" ]] && PR_MATCHES_FILTERS=false ;;
                  "contains") [[ "$PR_TITLE" != *"$PR_TITLE_VALUE"* ]] && PR_MATCHES_FILTERS=false ;;
                  "does not contain") [[ "$PR_TITLE" == *"$PR_TITLE_VALUE"* ]] && PR_MATCHES_FILTERS=false ;;
                  "starts with") [[ "$PR_TITLE" != "$PR_TITLE_VALUE"* ]] && PR_MATCHES_FILTERS=false ;;
                  "does not start with") [[ "$PR_TITLE" == "$PR_TITLE_VALUE"* ]] && PR_MATCHES_FILTERS=false ;;
                esac


                if $PR_MATCHES_FILTERS; then
                  PR_IDENTIFIER=$(echo "$PR" | jq -r '.id')
                  PR_TITLE=$(echo "$PR" | jq -r '.title')
                  PR_NUMBER=$(echo "$PR" | jq -r '.number')
                  PR_LINK=$(echo "$PR" | jq -r '.html_url')
                  PR_BRANCH=$(echo "$PR" | jq -r '.head.ref')
                  PR_CREATED_AT=$(echo "$PR" | jq -r '.created_at')
                  PR_UPDATED_AT=$(echo "$PR" | jq -r '.updated_at')
                  PR_CLOSED_AT=$(echo "$PR" | jq -r '.closed_at')
                  PR_MERGED_AT=$(echo "$PR" | jq -r '.merged_at')
                  PR_STATUS=$(echo "$PR" | jq -r '.state')
                  REPO_IDENTIFIER=$(echo "$PR" | jq -r '.head.repo.full_name')
                  PR_CREATOR=$(echo "$PR" | jq -r '.user.login')
      
                curl --location --request POST "https://api.getport.io/v1/blueprints/${BLUEPRINT_ID}/entities?upsert=true&merge=true&run_id=${{fromJson(inputs.port_payload).runId}}" \
                  --header "Authorization: Bearer ${{ env.PORT_ACCESS_TOKEN }}" \
                  --header "Content-Type: application/json" \
                  --data-raw "{
                    \"identifier\": \"${PR_IDENTIFIER}\",
                    \"title\": \"${PR_TITLE}\",
                    \"properties\": {
                      \"status\": \"${PR_STATUS}\",
                      \"closedAt\": \"${PR_CLOSED_AT}\",
                      \"updatedAt\": \"${PR_CLOSED_AT}\",
                      \"mergedAt\": \"${PR_MERGED_AT}\",
                      \"createdAt\": \"${PR_CREATED_AT}\",
                      \"link\": \"${PR_LINK}\",
                      \"prNumber\": ${PR_NUMBER},
                      \"branch\": \"${PR_BRANCH}\"
                    },
                    \"relations\": {
                      \"repository\": \"${REPO_IDENTIFIER}\",
                      \"git_hub_creator\": \"${PR_CREATOR}\"
                    }
                  }"
                fi
              done

              ((PAGE++))
            done
          done

      - name: Inform entity upsert failure
        if: steps.upsert_pr_entity.outcome == 'failure'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).runId}}
          logMessage: "Failed to report the created entities back to Port ..."

      - name: Inform completion of pull request upsert
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).runId}}
          logMessage: "Fetching of historical PR was successful ✅"
```
</details>

<h3> Step 2: Set Up Self-Service Action </h3>

Create a self-service action in Port to run this workflow.
1. Head to the [self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Create a deployment for every GitHub Pull Request (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
    "identifier": "create_a_deployment_for_every_pull_request",
    "title": "Create a deployment for every GitHub Pull Request",
    "icon": "GitPullRequest",
    "description": "Track deployments triggered via merged pull requests",
    "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
        "properties": {
            "your_deployment_integration": {
            "icon": "DefaultProperty",
            "title": "Which integration is used to define your deployment",
            "type": "string",
            "enum": [
                "GitHub"
            ],
            "enumColors": {
                "GitHub": "lightGray"
            },
            "default": "GitHub"
            },
            "your_deployment_type": {
            "icon": "DefaultProperty",
            "title": "How do you define deployment?",
            "type": "string",
            "enum": [
                "PR/MR merge"
            ],
            "enumColors": {
                "PR/MR merge": "lightGray"
            },
            "default": "PR/MR merge"
            },
            "pr_rules_fields": {
            "title": "PR rules - fields",
            "icon": "DefaultProperty",
            "type": "array",
            "default": [
                "Status"
            ],
            "items": {
                "enum": [
                "Status",
                "Repository",
                "Label",
                "Author",
                "Title"
                ],
                "enumColors": {
                "Status": "lightGray",
                "Repository": "lightGray",
                "Label": "lightGray",
                "Author": "lightGray",
                "Title": "lightGray"
                },
                "type": "string"
            }
            },
            "pr_rules_status_options": {
            "icon": "DefaultProperty",
            "title": "PR rules - Status - options",
            "type": "string",
            "default": "closed",
            "enum": [
                "open",
                "closed"
            ],
            "enumColors": {
                "open": "lightGray",
                "closed": "lightGray"
            }
            },
            "pr_rules_status_op": {
            "icon": "DefaultProperty",
            "title": "PR rules - Status - operator",
            "type": "string",
            "default": "is",
            "enum": [
                "is",
                "is not"
            ],
            "enumColors": {
                "is": "lightGray",
                "is not": "lightGray"
            }
            },
            "pr_rules_repo_str": {
            "type": "string",
            "title": "PR rules - Repository - string to look for",
            "visible": {
                "jqQuery": "if (.form.pr_rules_repo_op == \"is\" or .form.pr_rules_repo_op == \"is not\" or .form.pr_rules_repo_op == null) then false else true end"
            }
            },
            "pr_rules_repo_op": {
            "title": "PR rules - Repository operator",
            "icon": "DefaultProperty",
            "type": "string",
            "enum": [
                "starts with",
                "does not start with",
                "contains",
                "does not contain",
                "is",
                "is not"
            ],
            "enumColors": {
                "starts with": "lightGray",
                "does not start with": "lightGray",
                "contains": "lightGray",
                "does not contain": "lightGray",
                "is": "lightGray",
                "is not": "lightGray"
            },
            "visible": {
                "jqQuery": ".form.pr_rules_fields | index(\"Repository\") != null"
            }
            },
            "pr_rules_label_str": {
            "type": "string",
            "title": "PR rules - Label - string to look for",
            "visible": {
                "jqQuery": ".form.pr_rules_fields | index(\"Label\") != null"
            }
            },
            "pr_rules_label_op": {
            "title": "PR rules - Label - operator",
            "icon": "DefaultProperty",
            "type": "string",
            "enum": [
                "starts with",
                "does not start with",
                "contains",
                "does not contain",
                "equals"
            ],
            "enumColors": {
                "starts with": "lightGray",
                "does not start with": "lightGray",
                "contains": "lightGray",
                "does not contain": "lightGray",
                "equals": "lightGray"
            },
            "visible": {
                "jqQuery": ".form.pr_rules_fields | index(\"Label\") != null"
            }
            },
            "pr_rules_author_op": {
            "title": "PR rules - Author - operator",
            "icon": "DefaultProperty",
            "type": "string",
            "enum": [
                "is",
                "is not"
            ],
            "enumColors": {
                "is": "lightGray",
                "is not": "lightGray"
            },
            "visible": {
                "jqQuery": ".form.pr_rules_fields | index(\"Author\") != null"
            }
            },
            "deploy_branch": {
            "type": "string",
            "title": "Deploy branch",
            "description": "We will create deployments for every PR merged to this branch",
            "icon": "Branch",
            "default": "main"
            },
            "pr_rules_title_str": {
            "type": "string",
            "title": "PR rules - Title - string to look for",
            "visible": {
                "jqQuery": ".form.pr_rules_fields | index(\"Title\") != null"
            }
            },
            "pr_rules_title_op": {
            "title": "PR rules - Title - operator",
            "icon": "DefaultProperty",
            "type": "string",
            "enum": [
                "starts with",
                "does not start with",
                "contains",
                "does not contain",
                "equals"
            ],
            "enumColors": {
                "starts with": "lightGray",
                "does not start with": "lightGray",
                "contains": "lightGray",
                "does not contain": "lightGray",
                "equals": "lightGray"
            },
            "visible": {
                "jqQuery": ".form.pr_rules_fields | index(\"Title\") != null"
            }
            },
            "pr_rules_repository": {
            "type": "array",
            "title": "PR rules - Repository",
            "items": {
                "type": "string",
                "format": "entity",
                "blueprint": "githubRepository"
            },
            "visible": {
                "jqQuery": ".form.pr_rules_repo_op | IN(\"is\", \"is not\")"
            }
            },
            "pr_rules_author": {
            "title": "PR rules - Author",
            "icon": "DefaultProperty",
            "type": "array",
            "items": {
                "type": "string",
                "format": "entity",
                "blueprint": "githubUser"
            },
            "visible": {
                "jqQuery": ".form.pr_rules_fields | index(\"Author\") != null"
            }
            }
        },
        "required": [
            "your_deployment_integration",
            "your_deployment_type",
            "deploy_branch"
        ],
        "steps": [
            {
            "title": "Deployment setup",
            "order": [
                "your_deployment_integration",
                "your_deployment_type",
                "deploy_branch",
                "pr_rules_fields",
                "pr_rules_status_op",
                "pr_rules_status_options",
                "pr_rules_author_op",
                "pr_rules_author",
                "pr_rules_label_op",
                "pr_rules_label_str",
                "pr_rules_repo_op",
                "pr_rules_repository",
                "pr_rules_repo_str",
                "pr_rules_title_op",
                "pr_rules_title_str"
            ]
            }
        ]
        }
    },
    "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB_ORG>",
        "repo": "<GITHUB_REPO>",
        "workflow": "create_deployment_for_pull_request.yaml",
        "workflowInputs": {
        "config": {
            "{{ spreadValue() }}": "{{ .inputs }}"
        },
        "port_payload": {
            "runId": "{{ .run.id }}"
        }
        },
        "reportWorkflowStatus": true
    },
    "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Create a deployment for every GitHub Pull Request` action in the self-service page. 🎉

:::tip Hardcoded values
The workflow uses `CUTOFF_DATE = 3 months ago` to define how far back in time to fetch data.
:::

</TabItem>

<TabItem value="workflow-run" label="Workflow Run">

Another method to track deployments is by analyzing GitHub Workflow Runs.

This workflow will fetch historical GitHub Actions workflow runs, transform the data, and send it to Port to be tracked as deployments.

<h3> Step 1: Add GitHub Workflow </h3>

Create the file `.github/workflows/create_deployment_for_workflow_run.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary><b>Fetch Historical Workflow Run GitHub Workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Fetch Historical Workflow Run Data

on:
  workflow_dispatch:
    inputs:
      config:
        description: 'JSON input configuration for fetching Workflow Runs'
        required: true
        type: string
      port_payload:
        required: true
        description: Port's payload including context (blueprint, run id, etc.)

jobs:
  fetch-workflow-runs:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Inform execution start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).runId}}
          logMessage: "Starting workflow run data collection..."

      - name: Fetch Port Access Token
        id: fetch_port_token
        run: |
          PORT_ACCESS_TOKEN=$(curl -s -L 'https://api.getport.io/v1/auth/access_token' \
            -H 'Content-Type: application/json' \
            -H 'Accept: application/json' \
            -d '{
              "clientId": "${{ secrets.PORT_CLIENT_ID }}",
              "clientSecret": "${{ secrets.PORT_CLIENT_SECRET }}"
            }' | jq -r '.accessToken')
          echo "PORT_ACCESS_TOKEN=$PORT_ACCESS_TOKEN" >> "$GITHUB_ENV"

      - name: Parse Input Configuration
        id: parse_config
        run: |
          echo '${{ inputs.config }}' > config.json
          CONFIG_JSON=$(jq -c . config.json)  # Proper JSON parsing
          echo "CONFIG_JSON=$CONFIG_JSON" >> "$GITHUB_ENV"

      - name: Extract Filters from JSON
        id: extract_filters
        run: |
          CONFIG_JSON=$(echo '${{ env.CONFIG_JSON }}' | jq -c .)
          
          WORKFLOW_FIELDS=$(echo "$CONFIG_JSON" | jq -c '.workflow_incl_rules_fields // []')
          BRANCH_OP=$(echo "$CONFIG_JSON" | jq -r '.workflow_incl_rules_branch_op // empty')
          BRANCH_STR=$(echo "$CONFIG_JSON" | jq -r '.workflow_incl_rules_branch_str // empty')
          NAME_OP=$(echo "$CONFIG_JSON" | jq -r '.workflow_incl_rules_name_op // empty')
          NAME_STR=$(echo "$CONFIG_JSON" | jq -r '.workflow_incl_rules_name_str // empty')
          AUTHOR_OP=$(echo "$CONFIG_JSON" | jq -r '.workflow_incl_rules_author_op // empty')
          AUTHOR_STR=$(echo "$CONFIG_JSON" | jq -r '.workflow_incl_rules_author_str // empty')
          REPO_OP=$(echo "$CONFIG_JSON" | jq -r '.workflow_incl_rules_repo_op // empty')
          REPO_STR=$(echo "$CONFIG_JSON" | jq -r '.workflow_incl_rules_repo_str // empty')

          echo "WORKFLOW_FIELDS=$WORKFLOW_FIELDS" >> "$GITHUB_ENV"
          echo "BRANCH_OP=$BRANCH_OP" >> "$GITHUB_ENV"
          echo "BRANCH_STR=$BRANCH_STR" >> "$GITHUB_ENV"
          echo "NAME_OP=$NAME_OP" >> "$GITHUB_ENV"
          echo "NAME_STR=$NAME_STR" >> "$GITHUB_ENV"
          echo "AUTHOR_OP=$AUTHOR_OP" >> "$GITHUB_ENV"
          echo "AUTHOR_STR=$AUTHOR_STR" >> "$GITHUB_ENV"
          echo "REPO_OP=$REPO_OP" >> "$GITHUB_ENV"
          echo "REPO_STR=$REPO_STR" >> "$GITHUB_ENV"

      - name: Fetch Repositories
        if: ${{ !contains(env.WORKFLOW_FIELDS, 'Repository name') }}
        id: fetch_repos
        run: |
          GH_TOKEN=${{ secrets.GH_TOKEN }}
          REPOS=()
          PAGE=1
          ORG=${{ github.repository_owner }}

          while :; do
            RESPONSE=$(curl -s -H "Authorization: token $GH_TOKEN" \
              "https://api.github.com/users/$ORG/repos?per_page=100&page=$PAGE")

            NEW_REPOS=$(echo "$RESPONSE" | jq -r '.[].full_name')
            [[ -z "$NEW_REPOS" ]] && break
            REPOS+=($NEW_REPOS)
            ((PAGE++))
          done
          echo "REPO_LIST=${REPOS[*]}" >> "$GITHUB_ENV"

      - name: Set Filtered Repositories
        if: ${{ contains(env.WORKFLOW_FIELDS, 'Repository name') }}
        run: |
          echo "REPO_LIST=$REPO_STR" >> "$GITHUB_ENV"

      - name: Fetch Workflow Runs
        id: upsert_workflow_entity
        run: |
          GH_TOKEN=${{ secrets.GH_TOKEN }}
          REPOS=(${{ env.REPO_LIST }})
          CUTOFF_DATE=$(date -d '3 months ago' --utc +%Y-%m-%dT%H:%M:%SZ)
          BLUEPRINT_ID="githubWorkflowRun"

          for REPO in "${REPOS[@]}"; do
            echo "Processing repo: $REPO"
            PAGE=1

            while true; do
              RESPONSE=$(curl -s -H "Authorization: token $GH_TOKEN" \
                "https://api.github.com/repos/$REPO/actions/runs?per_page=100&page=$PAGE")

              RUNS=$(echo "$RESPONSE" | jq -c '.workflow_runs[]?')
              [[ -z "$RUNS" ]] && break

              while IFS= read -r RUN; do
                CREATED_AT=$(echo "$RUN" | jq -r '.created_at?  // empty')
                [[ "$CREATED_AT" < "$CUTOFF_DATE" ]] && break 2

                MATCH=true
                NAME=$(echo "$RUN" | jq -r '.name')
                BRANCH=$(echo "$RUN" | jq -r '.head_branch')
                AUTHOR=$(echo "$RUN" | jq -r '.actor.login')

                
                # Branch filter
                if [[ -n "$BRANCH_OP" ]]; then
                  case "$BRANCH_OP" in
                    "equals") [[ "$BRANCH" != "$BRANCH_STR" ]] && MATCH=false ;;
                    "contains") [[ "$BRANCH" != *"$BRANCH_STR"* ]] && MATCH=false ;;
                    "starts with") [[ "$BRANCH" != "$BRANCH_STR"* ]] && MATCH=false ;;
                    "does not contain") [[ "$BRANCH" == *"$BRANCH_STR"* ]] && MATCH=false ;;
                    "does not start with") [[ "$BRANCH" == "$BRANCH_STR"* ]] && MATCH=false ;;
                  esac
                fi

                # Name filter
                if $MATCH && [[ -n "$NAME_OP" ]]; then
                  case "$NAME_OP" in
                    "equals") [[ "$NAME" != "$NAME_STR" ]] && MATCH=false ;;
                    "contains") [[ "$NAME" != *"$NAME_STR"* ]] && MATCH=false ;;
                    "starts with") [[ "$NAME" != "$NAME_STR"* ]] && MATCH=false ;;
                    "does not contain") [[ "$NAME" == *"$NAME_STR"* ]] && MATCH=false ;;
                    "does not start with") [[ "$NAME" == "$NAME_STR"* ]] && MATCH=false ;;
                  esac
                fi

                # Author filter
                if $MATCH && [[ -n "$AUTHOR_OP" ]]; then
                  case "$AUTHOR_OP" in
                    "equals") [[ "$AUTHOR" != "$AUTHOR_STR" ]] && MATCH=false ;;
                    "contains") [[ "$AUTHOR" != *"$AUTHOR_STR"* ]] && MATCH=false ;;
                    "starts with") [[ "$AUTHOR" != "$AUTHOR_STR"* ]] && MATCH=false ;;
                    "does not contain") [[ "$AUTHOR" == *"$AUTHOR_STR"* ]] && MATCH=false ;;
                    "does not start with") [[ "$AUTHOR" == "$AUTHOR_STR"* ]] && MATCH=false ;;
                  esac
                fi

                # Repository filter
                if $MATCH && [[ -n "$REPO_OP" ]]; then
                  REPO_NAME=$(echo "$REPO" | awk -F/ '{print $2}')
                  case "$REPO_OP" in
                    "equals") [[ "$REPO_NAME" != "$REPO_STR" ]] && MATCH=false ;;
                    "contains") [[ "$REPO_NAME" != *"$REPO_STR"* ]] && MATCH=false ;;
                    "starts with") [[ "$REPO_NAME" != "$REPO_STR"* ]] && MATCH=false ;;
                    "does not contain") [[ "$REPO_NAME" == *"$REPO_STR"* ]] && MATCH=false ;;
                    "does not start with") [[ "$REPO_NAME" == "$REPO_STR"* ]] && MATCH=false ;;
                  esac
                fi

                if $MATCH; then
                  RUN_ID=$(echo "$RUN" | jq -r '.id')
                  STATUS=$(echo "$RUN" | jq -r '.status')
                  CONCLUSION=$(echo "$RUN" | jq -r '.conclusion // "in_progress"')
                  HTML_URL=$(echo "$RUN" | jq -r '.html_url')
                  COMMIT_HASH=$(echo "$RUN" | jq -r '.head_sha')
                  STARTED_AT=$(echo "$RUN" | jq -r '.run_started_at')
                  RUN_NUMBER=$(echo "$RUN" | jq -r '.run_number')
                  RUN_ATTEMPT=$(echo "$RUN" | jq -r '.run_attempt')
 
                  curl -X POST "https://api.getport.io/v1/blueprints/${BLUEPRINT_ID}/entities?upsert=true&merge=true&run_id=${{fromJson(inputs.port_payload).runId}}" \
                    -H "Authorization: Bearer ${{ env.PORT_ACCESS_TOKEN }}" \
                    -H "Content-Type: application/json" \
                    -d "{
                      \"identifier\": \"$RUN_ID\",
                      \"title\": \"$NAME\",
                      \"properties\": {
                        \"triggeringActor\": \"$AUTHOR\",
                        \"name\": \"$NAME\",
                        \"status\": \"$STATUS\",
                        \"conclusion\": \"$CONCLUSION\",
                        \"runStartedAt\": \"$STARTED_AT\",
                        \"createdAt\": \"$CREATED_AT\",
                        \"link\": \"$HTML_URL\",
                        \"runNumber\": \"$RUN_NUMBER\",
                        \"runAttempt\": \"$RUN_ATTEMPT\"
                      }
                    }"
                fi
              done <<< "$RUNS"

              ((PAGE++))
            done
          done

      - name: Inform entity upsert failure
        if: steps.upsert_workflow_entity.outcome == 'failure'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).runId}}
          logMessage: "Failed to report the created entities back to Port ..."

      - name: Inform completion of workflow upsert
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).runId}}
          logMessage: "Fetching of historical workflow run was successful ✅"
```
</details>

<h3> Step 2: Set Up Self-Service Action </h3>

Create a self-service action in Port to run this workflow.
1. Head to the [self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Create a deployment for every GitHub Pull Request (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
    "identifier": "create_a_deployment_for_every_gh_workflow",
    "title": "Create a deployment for every GitHub Workflow Run",
    "icon": "GithubActions",
    "description": "Track deployments triggered via GitHub Action runs—ideal for CI/CD pipelines",
    "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
        "properties": {
            "your_deployment_integration": {
            "icon": "DefaultProperty",
            "title": "Which integration is used to define your deployment",
            "type": "string",
            "enum": [
                "GitHub"
            ],
            "enumColors": {
                "GitHub": "lightGray"
            },
            "default": "GitHub"
            },
            "your_deployment_type": {
            "icon": "DefaultProperty",
            "title": "How do you define deployment?",
            "type": "string",
            "enum": [
                "GitHub workflow run"
            ],
            "enumColors": {
                "GitHub workflow run": "lightGray"
            },
            "default": "GitHub workflow run"
            },
            "workflow_incl_rules_fields": {
            "title": "Workflow inclusion rules - fields",
            "icon": "DefaultProperty",
            "type": "array",
            "default": [],
            "items": {
                "enum": [
                "Head branch",
                "Name",
                "Status",
                "Author",
                "Repository name"
                ],
                "enumColors": {
                "Head branch": "lightGray",
                "Name": "lightGray",
                "Status": "lightGray",
                "Author": "lightGray",
                "Repository name": "lightGray"
                },
                "type": "string"
            }
            },
            "workflow_incl_rules_name_op": {
            "icon": "DefaultProperty",
            "title": "Workflow inclusion rules - Name - operator",
            "type": "string",
            "enum": [
                "contains",
                "doesn't contain",
                "equals",
                "starts with",
                "doesn't start with"
            ],
            "enumColors": {
                "contains": "lightGray",
                "doesn't contain": "lightGray",
                "equals": "lightGray",
                "starts with": "lightGray",
                "doesn't start with": "lightGray"
            },
            "visible": {
                "jqQuery": ".form.workflow_incl_rules_fields | index(\"Name\") != null"
            }
            },
            "workflow_incl_rules_name_str": {
            "icon": "DefaultProperty",
            "type": "string",
            "title": "Workflow inclusion rules - Name - string to look for",
            "visible": {
                "jqQuery": ".form.workflow_incl_rules_fields | index(\"Name\") != null"
            }
            },
            "workflow_incl_rules_branch_op": {
            "title": "Workflow inclusion rules - Head branch operator",
            "icon": "DefaultProperty",
            "type": "string",
            "enum": [
                "starts with",
                "doesn't start with",
                "contains",
                "doesn't contain",
                "equals"
            ],
            "enumColors": {
                "starts with": "lightGray",
                "doesn't start with": "lightGray",
                "contains": "lightGray",
                "doesn't contain": "lightGray",
                "equals": "lightGray"
            },
            "visible": {
                "jqQuery": ".form.workflow_incl_rules_fields | index(\"Head branch\") != null"
            }
            },
            "workflow_incl_rules_branch_str": {
            "title": "Workflow inclusion rules - Head branch - string to look for",
            "icon": "DefaultProperty",
            "type": "string",
            "visible": {
                "jqQuery": ".form.workflow_incl_rules_fields | index(\"Head branch\") != null"
            }
            },
            "workflow_incl_rules_repo_op": {
            "icon": "DefaultProperty",
            "title": "Workflow inclusion rules - Repository name - operator",
            "type": "string",
            "enum": [
                "contains",
                "doesn't contain",
                "equals",
                "starts with",
                "doesn't start with"
            ],
            "enumColors": {
                "contains": "lightGray",
                "doesn't contain": "lightGray",
                "equals": "lightGray",
                "starts with": "lightGray",
                "doesn't start with": "lightGray"
            },
            "visible": {
                "jqQuery": ".form.workflow_incl_rules_fields | index(\"Repository name\") != null"
            }
            },
            "workflow_incl_rules_repo_str": {
            "icon": "DefaultProperty",
            "title": "Workflow inclusion rules - Repository name - string to look for",
            "type": "string",
            "visible": {
                "jqQuery": ".form.workflow_incl_rules_fields | index(\"Repository name\") != null"
            }
            },
            "workflow_incl_rules_author_str": {
            "type": "string",
            "title": "Workflow inclusion rules - Author - string to look for",
            "visible": {
                "jqQuery": ".form.workflow_incl_rules_fields | index(\"Author\") != null"
            }
            },
            "workflow_incl_rules_author_op": {
            "icon": "DefaultProperty",
            "title": "Workflow inclusion rules - Author - operator",
            "type": "string",
            "enum": [
                "starts with",
                "doesn't start with",
                "contains",
                "doesn't contain",
                "equals"
            ],
            "enumColors": {
                "starts with": "lightGray",
                "doesn't start with": "lightGray",
                "contains": "lightGray",
                "doesn't contain": "lightGray",
                "equals": "lightGray"
            },
            "visible": {
                "jqQuery": ".form.workflow_incl_rules_fields | index(\"Author\") != null"
            }
            }
        },
        "required": [
            "your_deployment_integration",
            "your_deployment_type"
        ],
        "steps": [
            {
            "title": "Deployment setup",
            "order": [
                "your_deployment_integration",
                "your_deployment_type",
                "workflow_incl_rules_fields",
                "workflow_incl_rules_branch_op",
                "workflow_incl_rules_branch_str",
                "workflow_incl_rules_name_op",
                "workflow_incl_rules_name_str",
                "workflow_incl_rules_repo_op",
                "workflow_incl_rules_repo_str",
                "workflow_incl_rules_author_op",
                "workflow_incl_rules_author_str"
            ]
            }
        ]
        }
    },
    "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB_ORG>",
        "repo": "<GITHUB_REPO>",
        "workflow": "create_deployment_for_workflow_run.yaml",
        "workflowInputs": {
        "config": {
            "{{ spreadValue() }}": "{{ .inputs }}"
        },
        "port_payload": {
            "runId": "{{ .run.id }}"
        }
        },
        "reportWorkflowStatus": true
    },
    "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Create a deployment for every GitHub Workflow Run` action in the self-service page. 🎉

:::tip Hardcoded values
The workflow uses `CUTOFF_DATE = 3 months ago` to define how far back in time to fetch data.
:::

</TabItem>


<TabItem value="releases-tags" label="Release/Tags">

GitHub Releases and Tags are often used to mark production-ready versions or significant project milestones. Tracking these allows teams to monitor release frequency and lead time for changes.

This workflow fetches historical GitHub releases and sends them to Port to be used as deployment entities.

<h3> Step 1: Add GitHub Workflow </h3>

Create the file `.github/workflows/create_deployment_for_release.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary><b>Fetch Historical Release GitHub Workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Fetch Historical Release Data

on:
  workflow_dispatch:
    inputs:
      config:
        description: 'JSON input configuration for fetching Releases'
        required: true
        type: string
      port_payload:
        required: true
        description: Port's payload, including details for who triggered the action and general context (blueprint, run id, etc...)

jobs:
  fetch-releases:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Inform execution of request to fetch historical release data
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).runId}}
          logMessage: "About to fetch release data from GitHub..."

      - name: Fetch Port Access Token
        id: fetch_port_token
        run: |
          PORT_ACCESS_TOKEN=$(curl -s -L 'https://api.getport.io/v1/auth/access_token' \
            -H 'Content-Type: application/json' \
            -H 'Accept: application/json' \
            -d '{
              "clientId": "${{ secrets.PORT_CLIENT_ID }}",
              "clientSecret": "${{ secrets.PORT_CLIENT_SECRET }}"
            }' | jq -r '.accessToken')

          echo "PORT_ACCESS_TOKEN=$PORT_ACCESS_TOKEN" >> "$GITHUB_ENV"
          
      - name: Parse Input Configuration
        id: parse_config
        run: |
          echo '${{ inputs.config }}' > config.json
          CONFIG_JSON=$(jq -c . config.json)  # Proper JSON parsing
          echo "CONFIG_JSON=$CONFIG_JSON" >> "$GITHUB_ENV"
    
      - name: Extract Filters from JSON
        id: extract_filters
        run: |
          CONFIG_JSON=$(echo '${{ env.CONFIG_JSON }}' | jq -c .)
          # Extract individual fields
          RELEASE_RULES_FIELDS=$(echo "$CONFIG_JSON" | jq -c '.release_rules_fields // []')
          RELEASE_AUTHOR_OP=$(echo "$CONFIG_JSON" | jq -r '.release_rules_author_op // empty')
          RELEASE_AUTHOR_STR=$(echo "$CONFIG_JSON" | jq -r '.release_rules_author_str // empty')
          RELEASE_TAG_OP=$(echo "$CONFIG_JSON" | jq -r '.release_rules_tag_op // empty')
          RELEASE_TAG_STR=$(echo "$CONFIG_JSON" | jq -r '.release_rules_tag_str // empty')
          RELEASE_TARGET_OP=$(echo "$CONFIG_JSON" | jq -r '.release_rules_target_op // empty')
          RELEASE_TARGET_STR=$(echo "$CONFIG_JSON" | jq -r '.release_rules_target_str // empty')
          RELEASE_REPO_OP=$(echo "$CONFIG_JSON" | jq -r '.release_rules_repo_op // empty')
          RELEASE_REPO_VALUE=$(echo "$CONFIG_JSON" | jq -r 'if .release_rules_repository then .release_rules_repository | map(.identifier) | join(" ") else "" end')

          echo "RELEASE_RULES_FIELDS=$RELEASE_RULES_FIELDS" >> "$GITHUB_ENV"
          echo "RELEASE_AUTHOR_OP=$RELEASE_AUTHOR_OP" >> "$GITHUB_ENV"
          echo "RELEASE_AUTHOR_STR=$RELEASE_AUTHOR_STR" >> "$GITHUB_ENV"
          echo "RELEASE_TAG_OP=$RELEASE_TAG_OP" >> "$GITHUB_ENV"
          echo "RELEASE_TAG_STR=$RELEASE_TAG_STR" >> "$GITHUB_ENV"
          echo "RELEASE_TARGET_OP=$RELEASE_TARGET_OP" >> "$GITHUB_ENV"
          echo "RELEASE_TARGET_STR=$RELEASE_TARGET_STR" >> "$GITHUB_ENV"
          echo "RELEASE_REPO_OP=$RELEASE_REPO_OP" >> "$GITHUB_ENV"
          echo "RELEASE_REPO_VALUE=$RELEASE_REPO_VALUE" >> "$GITHUB_ENV"

      - name: Fetch All Repositories (if no repo filter applied)
        if: ${{ !contains(env.RELEASE_RULES_FIELDS, 'Repository') }}
        id: fetch_repos
        run: |
          GH_TOKEN=${{ secrets.GH_TOKEN }}
          REPOS=()
          PAGE=1
          ORG=${{ github.repository_owner }}

          while :; do
            RESPONSE=$(curl -s -H "Authorization: token $GH_TOKEN" \
              "https://api.github.com/users/$ORG/repos?per_page=100&page=$PAGE")

            NEW_REPOS=$(echo "$RESPONSE" | jq -r '.[].full_name')
            if [[ -z "$NEW_REPOS" ]]; then break; fi

            REPOS+=($NEW_REPOS)
            ((PAGE++))
          done

          echo "REPO_LIST=${REPOS[*]}" >> "$GITHUB_ENV"

      - name: Set Single Repo if Repository Filter Exists
        if: ${{ contains(env.RELEASE_RULES_FIELDS, 'Repository') }}
        run: |
          echo "REPO_LIST=${{ env.RELEASE_REPO_VALUE }}" >> "$GITHUB_ENV"
          
      - name: Fetch Release Data
        id: upsert_release_entity
        run: |
          GH_TOKEN=${{ secrets.GH_TOKEN }}
          REPOS=(${{ env.REPO_LIST }})
          THREE_MONTHS_AGO=$(date -d '3 months ago' --utc +%Y-%m-%dT%H:%M:%SZ)
          BLUEPRINT_ID="release"
          
          for REPO in "${REPOS[@]}"; do
            echo "Processing repo: $REPO"
            PAGE=1

            while true; do
              RESPONSE=$(curl -s -H "Authorization: token $GH_TOKEN" \
                "https://api.github.com/repos/$REPO/releases?per_page=100&page=$PAGE")

              RELEASE_LIST=()
              while IFS= read -r RELEASE; do
                RELEASE_LIST+=("$RELEASE")
              done < <(echo "$RESPONSE" | jq -c '.[]')

              if [[ "${#RELEASE_LIST[@]}" -eq 0 ]]; then
                break
              fi

              for RELEASE in "${RELEASE_LIST[@]}"; do
                # RELEASE_CREATED_AT=$(echo "$RELEASE" | jq -r '.created_at')
                RELEASE_CREATED_AT=$(echo "$RELEASE" | jq -r '.created_at? // empty')
                if [[ "$RELEASE_CREATED_AT" < "$THREE_MONTHS_AGO" ]]; then
                  echo "Release is older than 3 months. Skipping"
                  break 2
                fi

                RELEASE_MATCHES_FILTERS=true

                # Apply Author filter
                if [[ -n "$RELEASE_AUTHOR_OP" ]]; then
                  AUTHOR=$(echo "$RELEASE" | jq -r '.author.login')
                  case "$RELEASE_AUTHOR_OP" in
                    "equals") [[ "$AUTHOR" != "$RELEASE_AUTHOR_STR" ]] && RELEASE_MATCHES_FILTERS=false ;;
                    "contains") [[ "$AUTHOR" != *"$RELEASE_AUTHOR_STR"* ]] && RELEASE_MATCHES_FILTERS=false ;;
                    "starts with") [[ "$AUTHOR" != "$RELEASE_AUTHOR_STR"* ]] && RELEASE_MATCHES_FILTERS=false ;;
                    "does not contain") [[ "$AUTHOR" == *"$RELEASE_AUTHOR_STR"* ]] && RELEASE_MATCHES_FILTERS=false ;;
                    "does not start with") [[ "$AUTHOR" == "$RELEASE_AUTHOR_STR"* ]] && RELEASE_MATCHES_FILTERS=false ;;
                  esac
                fi

                # Apply Tag filter
                if [[ -n "$RELEASE_TAG_OP" ]]; then
                  TAG=$(echo "$RELEASE" | jq -r '.tag_name')
                  case "$RELEASE_TAG_OP" in
                    "equals") [[ "$TAG" != "$RELEASE_TAG_STR" ]] && RELEASE_MATCHES_FILTERS=false ;;
                    "contains") [[ "$TAG" != *"$RELEASE_TAG_STR"* ]] && RELEASE_MATCHES_FILTERS=false ;;
                    "starts with") [[ "$TAG" != "$RELEASE_TAG_STR"* ]] && RELEASE_MATCHES_FILTERS=false ;;
                    "does not contain") [[ "$TAG" == *"$RELEASE_TAG_STR"* ]] && RELEASE_MATCHES_FILTERS=false ;;
                    "does not start with") [[ "$TAG" == "$RELEASE_TAG_STR"* ]] && RELEASE_MATCHES_FILTERS=false ;;
                  esac
                fi

                # Apply Target Commitish filter
                if [[ -n "$RELEASE_TARGET_OP" ]]; then
                  TARGET=$(echo "$RELEASE" | jq -r '.target_commitish')
                  case "$RELEASE_TARGET_OP" in
                    "equals") [[ "$TARGET" != "$RELEASE_TARGET_STR" ]] && RELEASE_MATCHES_FILTERS=false ;;
                    "contains") [[ "$TARGET" != *"$RELEASE_TARGET_STR"* ]] && RELEASE_MATCHES_FILTERS=false ;;
                    "starts with") [[ "$TARGET" != "$RELEASE_TARGET_STR"* ]] && RELEASE_MATCHES_FILTERS=false ;;
                    "does not contain") [[ "$TARGET" == *"$RELEASE_TARGET_STR"* ]] && RELEASE_MATCHES_FILTERS=false ;;
                    "does not start with") [[ "$TARGET" == "$RELEASE_TARGET_STR"* ]] && RELEASE_MATCHES_FILTERS=false ;;
                  esac
                fi

                if $RELEASE_MATCHES_FILTERS; then
                  RELEASE_ID=$(echo "$RELEASE" | jq -r '.id')
                  RELEASE_NAME=$(echo "$RELEASE" | jq -r '.name')
                  TAG_NAME=$(echo "$RELEASE" | jq -r '.tag_name')
                  TARGET_COMMITISH=$(echo "$RELEASE" | jq -r '.target_commitish')
                  CREATED_AT=$(echo "$RELEASE" | jq -r '.created_at')
                  BODY=$(echo "$RELEASE" | jq -r '.body' | sed 's/"/\\"/g')
                  AUTHOR=$(echo "$RELEASE" | jq -r '.author.login')

                  curl --location --request POST "https://api.getport.io/v1/blueprints/${BLUEPRINT_ID}/entities?upsert=true&merge=true&run_id=${{fromJson(inputs.port_payload).runId}}" \
                    --header "Authorization: Bearer ${{ env.PORT_ACCESS_TOKEN }}" \
                    --header "Content-Type: application/json" \
                    --data-raw "{
                      \"identifier\": \"${RELEASE_ID}\",
                      \"title\": \"${RELEASE_NAME}\",
                      \"properties\": {
                        \"author\": \"${AUTHOR}\",
                        \"repository\": \"${REPO}\",
                        \"release_creation_time\": \"${CREATED_AT}\",
                        \"description\": \"${BODY}\",
                        \"tag\": \"${TAG_NAME}\"
                      },
                      \"relations\": {
                      }
                    }"
                fi
              done

              ((PAGE++))
            done
          done

      - name: Inform entity upsert failure
        if: steps.upsert_release_entity.outcome == 'failure'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).runId}}
          logMessage: "Failed to report the created entities back to Port ..."

      - name: Inform completion of release upsert
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).runId}}
          logMessage: "Fetching of historical release was successful ✅"
```
</details>

<h3> Step 2: Set Up Self-Service Action </h3>

Create a self-service action in Port to run this workflow.
1. Head to the [self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Create a deployment for every GitHub Release (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
    "identifier": "create_a_deployment_for_every_gh_release",
    "title": "Create a deployment for every GitHub Release",
    "icon": "Version",
    "description": "Track tagged version deployments via GitHub Releases",
    "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
        "properties": {
            "your_deployment_integration": {
            "icon": "DefaultProperty",
            "title": "Which integration is used to define your deployment",
            "type": "string",
            "enum": [
                "GitHub"
            ],
            "enumColors": {
                "GitHub": "lightGray"
            },
            "default": "GitHub"
            },
            "your_deployment_type": {
            "icon": "DefaultProperty",
            "title": "How do you define deployment?",
            "type": "string",
            "enum": [
                "GitHub release"
            ],
            "enumColors": {
                "GitHub release": "lightGray"
            },
            "default": "GitHub release"
            },
            "release_rules_fields": {
            "title": "Release rules - fields",
            "icon": "DefaultProperty",
            "type": "array",
            "default": [],
            "items": {
                "enum": [
                "Author",
                "Tag",
                "Target commitish",
                "Repository"
                ],
                "enumColors": {
                "Author": "lightGray",
                "Tag": "lightGray",
                "Target commitish": "lightGray",
                "Repository": "lightGray"
                },
                "type": "string"
            }
            },
            "release_rules_author_op": {
            "icon": "DefaultProperty",
            "title": "Release rules - Author operator",
            "type": "string",
            "enum": [
                "starts with",
                "doesn't start with",
                "contains",
                "doesn't contain",
                "equals"
            ],
            "enumColors": {
                "starts with": "lightGray",
                "doesn't start with": "lightGray",
                "contains": "lightGray",
                "doesn't contain": "lightGray",
                "equals": "lightGray"
            },
            "visible": {
                "jqQuery": ".form.release_rules_fields | index(\"Author\") != null"
            }
            },
            "release_rules_author_str": {
            "icon": "DefaultProperty",
            "title": "Release rules - Author - string to look for",
            "type": "string",
            "visible": {
                "jqQuery": ".form.release_rules_fields | index(\"Author\") != null"
            }
            },
            "release_rules_tag_op": {
            "icon": "DefaultProperty",
            "title": "Release rules - Tag - operator",
            "type": "string",
            "enum": [
                "contains",
                "doesn't contain",
                "equals",
                "starts with",
                "doesn't start with"
            ],
            "enumColors": {
                "contains": "lightGray",
                "doesn't contain": "lightGray",
                "equals": "lightGray",
                "starts with": "lightGray",
                "doesn't start with": "lightGray"
            },
            "visible": {
                "jqQuery": ".form.release_rules_fields | index(\"Tag\") != null"
            }
            },
            "release_rules_tag_str": {
            "icon": "DefaultProperty",
            "title": "Release rules - Tag - string to look for",
            "type": "string",
            "visible": {
                "jqQuery": ".form.release_rules_fields | index(\"Tag\") != null"
            }
            },
            "release_rules_target_op": {
            "icon": "DefaultProperty",
            "title": "Release rules - Target commitish - operator",
            "type": "string",
            "enum": [
                "contains",
                "doesn't contain",
                "equals",
                "starts with",
                "doesn't start with"
            ],
            "enumColors": {
                "contains": "lightGray",
                "doesn't contain": "lightGray",
                "equals": "lightGray",
                "starts with": "lightGray",
                "doesn't start with": "lightGray"
            },
            "visible": {
                "jqQuery": ".form.release_rules_fields | index(\"Target commitish\") != null"
            }
            },
            "release_rules_target_str": {
            "icon": "DefaultProperty",
            "title": "Release rules - Target commitish - string to look for",
            "type": "string",
            "visible": {
                "jqQuery": ".form.release_rules_fields | index(\"Target commitish\") != null"
            }
            },
            "release_rules_repo_str": {
            "type": "string",
            "title": "Release rules - Repository - string to look for",
            "visible": {
                "jqQuery": "if (.form.release_rules_repo_op == \"is\" or .form.release_rules_repo_op == \"isn't\" or .form.release_rules_repo_op == null) then false else true end"
            }
            },
            "release_rules_repo_op": {
            "title": "Release rules - Repository operator",
            "icon": "DefaultProperty",
            "type": "string",
            "enum": [
                "starts with",
                "doesn't start with",
                "contains",
                "doesn't contain",
                "is",
                "isn't"
            ],
            "enumColors": {
                "starts with": "lightGray",
                "doesn't start with": "lightGray",
                "contains": "lightGray",
                "doesn't contain": "lightGray",
                "is": "lightGray",
                "isn't": "lightGray"
            },
            "visible": {
                "jqQuery": ".form.release_rules_fields | index(\"Repository\") != null"
            }
            },
            "release_rules_repository": {
            "type": "array",
            "title": "Release rules - Repository",
            "items": {
                "type": "string",
                "format": "entity",
                "blueprint": "githubRepository"
            },
            "visible": {
                "jqQuery": ".form.release_rules_repo_op | IN(\"is\", \"isn't\")"
            }
            }
        },
        "required": [
            "your_deployment_integration",
            "your_deployment_type"
        ],
        "steps": [
            {
            "title": "Deployment setup",
            "order": [
                "your_deployment_integration",
                "your_deployment_type",
                "release_rules_fields",
                "release_rules_author_op",
                "release_rules_author_str",
                "release_rules_tag_op",
                "release_rules_tag_str",
                "release_rules_target_op",
                "release_rules_target_str",
                "release_rules_repo_op",
                "release_rules_repo_str",
                "release_rules_repository"
            ]
            }
        ]
        }
    },
    "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB_ORG>",
        "repo": "<GITHUB_REPO>",
        "workflow": "create_deployment_for_release.yaml",
        "workflowInputs": {
        "config": {
            "{{ spreadValue() }}": "{{ .inputs }}"
        },
        "port_payload": {
            "runId": "{{ .run.id }}"
        }
        },
        "reportWorkflowStatus": true
    },
    "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Create a deployment for every GitHub Release` action in the self-service page. 🎉

:::tip Hardcoded values
The workflow uses `CUTOFF_DATE = 3 months ago` to define how far back in time to fetch data.
:::

</TabItem>

<TabItem value="deployments" label="Deployments">
GitHub Deployments represent the actual act of releasing code to an environment. These are often created manually or by CI/CD tools when deploying code.

This workflow will fetch historical deployment events recorded in GitHub and convert them into entities in Port for tracking and analysis.

<h3> Step 1: Add GitHub Workflow </h3>

Create the file `.github/workflows/create_deployment_for_deployment.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary><b>Fetch Historical Deployment GitHub Workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Fetch Historical Deployment Data

on:
  workflow_dispatch:
    inputs:
      config:
        description: 'JSON input configuration for fetching Workflow Runs'
        required: true
        type: string
      port_payload:
        required: true
        description: Port's payload including context (blueprint, run id, etc.)

jobs:
  fetch-deployments:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Inform execution start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).runId}}
          logMessage: "Starting deployment data collection..."

      - name: Fetch Port Access Token
        id: fetch_port_token
        run: |
          PORT_ACCESS_TOKEN=$(curl -s -L 'https://api.getport.io/v1/auth/access_token' \
            -H 'Content-Type: application/json' \
            -H 'Accept: application/json' \
            -d '{
              "clientId": "${{ secrets.PORT_CLIENT_ID }}",
              "clientSecret": "${{ secrets.PORT_CLIENT_SECRET }}"
            }' | jq -r '.accessToken')
          echo "PORT_ACCESS_TOKEN=$PORT_ACCESS_TOKEN" >> "$GITHUB_ENV"

      - name: Parse Input Configuration
        id: parse_config
        run: |
          echo '${{ inputs.config }}' > config.json
          CONFIG_JSON=$(jq -c . config.json)  # Proper JSON parsing
          echo "CONFIG_JSON=$CONFIG_JSON" >> "$GITHUB_ENV"

      - name: Extract Filters from JSON
        id: extract_filters
        run: |
          CONFIG_JSON=$(echo '${{ env.CONFIG_JSON }}' | jq -c .)
          
          DEPLOY_FIELDS=$(echo "$CONFIG_JSON" | jq -c '.dep_rules_fields // []')
          ENV_OP=$(echo "$CONFIG_JSON" | jq -r '.dep_rules_env_op // empty')
          ENV_VALUES=$(echo "$CONFIG_JSON" | jq -r 'if .dep_rules_env_str then .dep_rules_env_str | join(" ") else "" end')
          REPO_OP=$(echo "$CONFIG_JSON" | jq -r '.dep_rules_repo_op // empty')

          # Handle repository filter based on operation type
          if [[ "$REPO_OP" == "is" || "$REPO_OP" == "isn't" ]]; then
            REPO_VALUES=$(echo "$CONFIG_JSON" | jq -r 'if .dep_rules_repository then .dep_rules_repository | map(.identifier) | join(" ") else "" end')
          else
            REPO_VALUES=$(echo "$CONFIG_JSON" | jq -r '.dep_rules_repo_str // ""')
          fi

          echo "DEPLOY_FIELDS=$DEPLOY_FIELDS" >> "$GITHUB_ENV"
          echo "ENV_OP=$ENV_OP" >> "$GITHUB_ENV"
          echo "ENV_VALUES=$ENV_VALUES" >> "$GITHUB_ENV"
          echo "REPO_OP=$REPO_OP" >> "$GITHUB_ENV"
          echo "REPO_VALUES=$REPO_VALUES" >> "$GITHUB_ENV"

      - name: Fetch Repositories
        if: ${{ !contains(env.DEPLOY_FIELDS, 'Repository') || !contains(env.REPO_OP, 'is') }}
        id: fetch_repos
        run: |
          GH_TOKEN=${{ secrets.GH_TOKEN }}
          REPOS=()
          PAGE=1
          ORG=${{ github.repository_owner }}

          while :; do
            RESPONSE=$(curl -s -H "Authorization: token $GH_TOKEN" \
              "https://api.github.com/users/$ORG/repos?per_page=100&page=$PAGE")

            NEW_REPOS=$(echo "$RESPONSE" | jq -r '.[].full_name')
            [[ -z "$NEW_REPOS" ]] && break
            REPOS+=($NEW_REPOS)
            ((PAGE++))
          done
          echo "REPO_LIST=${REPOS[*]}" >> "$GITHUB_ENV"

      - name: Set Filtered Repositories
        if: ${{ contains(env.DEPLOY_FIELDS, 'Repository') && contains(env.REPO_OP, 'is') }}
        run: |
          echo "REPO_LIST=$REPO_VALUES" >> "$GITHUB_ENV"

      - name: Fetch Deployments
        id: upsert_deployment_entity
        run: |
          GH_TOKEN=${{ secrets.GH_TOKEN }}
          REPOS=(${{ env.REPO_LIST }})
          CUTOFF_DATE=$(date -d '3 months ago' --utc +%Y-%m-%dT%H:%M:%SZ)
          BLUEPRINT_ID="gh_deployment"
      
          for REPO in "${REPOS[@]}"; do
            echo "Processing repo: $REPO"
            PAGE=1
            while true; do
              RESPONSE=$(curl -s -H "Authorization: token $GH_TOKEN" \
                "https://api.github.com/repos/$REPO/deployments?per_page=100&page=$PAGE")
              DEPLOYMENTS=$(echo "$RESPONSE" | jq -c '.[]?')
              [[ -z "$DEPLOYMENTS" ]] && break
      
              while IFS= read -r DEPLOYMENT; do
                CREATED_AT=$(echo "$DEPLOYMENT" | jq -r '.created_at // empty')
                echo "Processing Deployment ID: $(echo "$DEPLOYMENT" | jq -r '.id')"
      
                if [[ "$CREATED_AT" < "$CUTOFF_DATE" ]]; then
                  echo "Skipping old deployment..."
                  break 2
                fi
      
                MATCH=true  # Default to true
                ENVIRONMENT=$(echo "$DEPLOYMENT" | jq -r '.environment // empty')
                REPO_NAME=$(echo "$REPO" | awk -F/ '{print $2}')

                # ENVIRONMENT FILTER
                if [[ -n "$ENV_VALUES" && -n "$ENV_OP" ]]; then
                  ENV_MATCH=false
                  for ENV in $ENV_VALUES; do
                    case "$ENV_OP" in
                      "equals") [[ "$ENVIRONMENT" == "$ENV" ]] && ENV_MATCH=true ;;
                      "contains") [[ "$ENVIRONMENT" == *"$ENV"* ]] && ENV_MATCH=true ;;
                      "starts with") [[ "$ENVIRONMENT" == "$ENV"* ]] && ENV_MATCH=true ;;
                      "does not contain") [[ "$ENVIRONMENT" != *"$ENV"* ]] && ENV_MATCH=true ;;
                      "does not start with") [[ "$ENVIRONMENT" != "$ENV"* ]] && ENV_MATCH=true ;;
                    esac
                    [[ "$ENV_MATCH" == "true" ]] && break
                  done
      
                  if [[ "$ENV_MATCH" != "true" ]]; then
                    MATCH=false
                  fi
                fi

                # REPOSITORY FILTER
                if [[ -n "$REPO_VALUES" && -n "$REPO_OP" ]]; then
                  case "$REPO_OP" in
                    "isn't") [[ "$REPO_NAME" == "$REPO_VALUES" ]] && MATCH=false ;;
                    "contains") [[ "$REPO_NAME" != *"$REPO_VALUES"* ]] && MATCH=false ;;
                    "starts with") [[ "$REPO_NAME" != "$REPO_VALUES"* ]] && MATCH=false ;;
                    "does not contain") [[ "$REPO_NAME" == *"$REPO_VALUES"* ]] && MATCH=false ;;
                    "does not start with") [[ "$REPO_NAME" == "$REPO_VALUES"* ]] && MATCH=false ;;
                  esac
                fi
      
                if $MATCH; then
                  DEPLOYMENT_ID=$(echo "$DEPLOYMENT" | jq -r '.id')
                  SHA=$(echo "$DEPLOYMENT" | jq -r '.sha')
                  REF=$(echo "$DEPLOYMENT" | jq -r '.ref')
                  DESCRIPTION=$(echo "$DEPLOYMENT" | jq -r '.description // empty' | sed 's/"/\\"/g')
                  PROD_ENVIRONMENT=$(echo "$DEPLOYMENT" | jq -r '.production_environment')
                  TRANSIENT_ENVIRONMENT=$(echo "$DEPLOYMENT" | jq -r '.transient_environment')
                  STATUSES_URL=$(echo "$DEPLOYMENT" | jq -r '.statuses_url // empty')
                  UPDATED_AT=$(echo "$DEPLOYMENT" | jq -r '.updated_at // empty')
                  LINK=$(echo "$DEPLOYMENT" | jq -r '.url')
                  TASK=$(echo "$DEPLOYMENT" | jq -r '.task')
      
                  echo "Sending to Port: Identifier=$REPO_NAME-$DEPLOYMENT_ID, Env=$ENVIRONMENT"
      
                  RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null -X POST "https://api.getport.io/v1/blueprints/${BLUEPRINT_ID}/entities?upsert=true&merge=true&run_id=${{fromJson(inputs.port_payload).runId}}" \
                    -H "Authorization: Bearer ${{ env.PORT_ACCESS_TOKEN }}" \
                    -H "Content-Type: application/json" \
                    -d "{
                      \"identifier\": \"$REPO_NAME-$DEPLOYMENT_ID\",
                      \"title\": \"$TASK $ENVIRONMENT\",
                      \"properties\": {
                        \"environment\": \"$ENVIRONMENT\",
                        \"productionEnvironment\": \"$PROD_ENVIRONMENT\",
                        \"transientEnvironment\": \"$TRANSIENT_ENVIRONMENT\",
                        \"sha\": \"$SHA\",
                        \"ref\": \"$REF\",
                        \"createdAt\": \"$CREATED_AT\",
                        \"url\": \"$LINK\",
                        \"description\": \"$DESCRIPTION\"
                      }
                    }")
      
                  echo "Port API Response Code: $RESPONSE"
                fi
              done <<< "$DEPLOYMENTS"
              ((PAGE++))
            done
          done


      - name: Inform entity upsert failure
        if: steps.upsert_deployment_entity.outcome == 'failure'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).runId}}
          logMessage: "Failed to report the created entities back to Port ..."

      - name: Inform completion of workflow upsert
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).runId}}
          logMessage: "Fetching of historical Github deployment has completed ✅"
```
</details>

<h3> Step 2: Set Up Self-Service Action </h3>

Create a self-service action in Port to run this workflow.
1. Head to the [self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Create a deployment for every GitHub Deployment (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
    "identifier": "create_a_deployment_for_every_gh_deployment",
    "title": "Create a deployment for every GitHub Deployment",
    "icon": "Rocket",
    "description": "Track deployments triggered via GitHub’s deployment API",
    "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
        "properties": {
            "your_deployment_integration": {
            "icon": "DefaultProperty",
            "title": "Which integration is used to define your deployment",
            "type": "string",
            "enum": [
                "GitHub"
            ],
            "enumColors": {
                "GitHub": "lightGray"
            },
            "default": "GitHub"
            },
            "your_deployment_type": {
            "icon": "DefaultProperty",
            "title": "How do you define deployment?",
            "type": "string",
            "default": "GitHub Deployments",
            "enum": [
                "GitHub Deployments"
            ],
            "enumColors": {
                "GitHub Deployments": "lightGray"
            }
            },
            "dep_rules_fields": {
            "title": "Deployment rules - fields",
            "icon": "DefaultProperty",
            "type": "array",
            "default": [
                "Environment"
            ],
            "items": {
                "enum": [
                "Environment",
                "Repository"
                ],
                "enumColors": {
                "Environment": "lightGray",
                "Repository": "lightGray"
                },
                "type": "string"
            }
            },
            "dep_rules_env_op": {
            "title": "Deployment rules - environment operator",
            "icon": "DefaultProperty",
            "type": "string",
            "default": "equals",
            "enum": [
                "starts with",
                "doesn't start with",
                "contains",
                "doesn't contain",
                "equals"
            ],
            "enumColors": {
                "starts with": "lightGray",
                "doesn't start with": "lightGray",
                "contains": "lightGray",
                "doesn't contain": "lightGray",
                "equals": "lightGray"
            }
            },
            "dep_rules_env_str": {
            "icon": "DefaultProperty",
            "title": "Deployment rules - environment - values",
            "type": "array",
            "default": [
                "prod"
            ],
            "items": {
                "enum": [
                "prod",
                "Test",
                "Staging",
                "Development"
                ],
                "enumColors": {
                "prod": "lightGray",
                "Test": "lightGray",
                "Staging": "lightGray",
                "Development": "lightGray"
                },
                "type": "string"
            }
            },
            "dep_rules_repo_str": {
            "type": "string",
            "title": "Deployment rules - Repository - string to look for",
            "visible": {
                "jqQuery": "if (.form.dep_rules_repo_op == \"is\" or .form.dep_rules_repo_op == \"isn't\" or .form.dep_rules_repo_op == null) then false else true end"
            }
            },
            "dep_rules_repo_op": {
            "title": "Deployment rules - Repository operator",
            "icon": "DefaultProperty",
            "type": "string",
            "enum": [
                "starts with",
                "doesn't start with",
                "contains",
                "doesn't contain",
                "is",
                "isn't"
            ],
            "enumColors": {
                "starts with": "lightGray",
                "doesn't start with": "lightGray",
                "contains": "lightGray",
                "doesn't contain": "lightGray",
                "is": "lightGray",
                "isn't": "lightGray"
            },
            "visible": {
                "jqQuery": ".form.dep_rules_fields | index(\"Repository\") != null"
            }
            },
            "dep_rules_repository": {
            "type": "array",
            "title": "Deployment rules - Repository",
            "items": {
                "type": "string",
                "format": "entity",
                "blueprint": "githubRepository"
            },
            "visible": {
                "jqQuery": ".form.dep_rules_repo_op | IN(\"is\", \"isn't\")"
            }
            }
        },
        "required": [
            "your_deployment_integration",
            "your_deployment_type"
        ],
        "steps": [
            {
            "title": "Deployment setup",
            "order": [
                "your_deployment_integration",
                "your_deployment_type",
                "dep_rules_fields",
                "dep_rules_env_op",
                "dep_rules_env_str",
                "dep_rules_repo_op",
                "dep_rules_repository",
                "dep_rules_repo_str"
            ]
            }
        ]
        }
    },
    "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB_ORG>",
        "repo": "<GITHUB_REPO>",
        "workflow": "create_deployment_for_deployment.yaml",
        "workflowInputs": {
        "config": {
            "{{ spreadValue() }}": "{{ .inputs }}"
        },
        "port_payload": {
            "runId": "{{ .run.id }}"
        }
        },
        "reportWorkflowStatus": true
    },
    "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Create a deployment for every GitHub Deployment` action in the self-service page. 🎉

:::tip Hardcoded values
The workflow uses `CUTOFF_DATE = 3 months ago` to define how far back in time to fetch data.
:::

</TabItem>

</Tabs>

<br/>
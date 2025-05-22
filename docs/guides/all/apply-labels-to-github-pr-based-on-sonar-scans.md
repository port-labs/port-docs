---
displayed_sidebar: null
description: Learn how to automatically label your GitHub pull request based on SonarQube scan reports
---

import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'


# Auto-label your GitHub PRs with Sonar Scans

This guide demonstrates how to set up an automation in Port that applies color-coded labels to your GitHub pull requests based on SonarCloud scan reports. These labels help you classify vulnerabilities, code smells, security hotspots, and bugs right from the pull request view.

## Common use cases

- **Enforce code quality standards:** Highlight PRs with poor test coverage, high duplication, or critical issues.
- **Encourage developer accountability:** Make quality regressions visible and traceable at the PR level.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- Port's [SonarQube integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube/) is installed in your account.


## Set up data model

To connect scan data with the correct pull requests, you'll need to link the `Pull Request` blueprint with the `SonarQube Analysis` blueprint.

Follow the [Connect GitHub PR to SonarQube analysis guide](https://docs.port.io/guides/all/connect-github-pr-with-sonar-analysis) to set this up.


## Set up automation

Once the SonarQube scan entities are linked to their corresponding pull requests, you can configure an automation in Port that triggers a GitHub workflow on PR updates and applies Sonar-based labels directly to the pull request.

This setup involves two parts:

1. Adding a GitHub PAT as a Port secret.

2. Defining the automation in Port.

### Add Port secrets

To add a secret to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secrets:
    - `GITHUB_TOKEN` - A [GitHub Personal Access Token (classic)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic) with **repo** and **workflow** scopes.


### Define automation backend

1. Go to the [Automations](https://app.getport.io/settings/automations) page in your portal.
2. Click on the `+ Automation` button.
3. Copy and paste the following JSON configuration into the editor:

    <details>
    <summary><b>Apply SonarCloud label automation (Click to expand)</b></summary>

    :::tip Replace placeholders

    Make sure to replace `<YOUR_GITHUB_ORG>` and `<YOUR_GITHUB_REPO>` in the url field below with the actual organization and repository where your `apply-sonar-scan-on-pr.yaml` workflow resides.

    :::

    ```json showLineNumbers
    {
        "identifier": "addLabelOnGithubPR",
        "title": "Add Sonar Scan Label On PR Updated",
        "description": "Automation to add Sonar scan label to the GitHub PR upon update",
        "trigger": {
            "type": "automation",
            "event": {
            "type": "ENTITY_UPDATED",
            "blueprintIdentifier": "githubPullRequest"
            },
            "condition": {
            "type": "JQ",
            "expressions": [
                ".diff.after.relations.sonarAnalysis != null"
            ],
            "combinator": "and"
            }
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://api.github.com/repos/<YOUR_GITHUB_ORG>/<YOUR_GITHUB_REPO>/actions/workflows/apply-sonar-scan-on-pr.yaml/dispatches",
            "method": "POST",
            "headers": {
            "Accept": "application/vnd.github+json",
            "Authorization": "Bearer {{ .secrets.GITHUB_TOKEN }}",
            "Content-Type": "application/json"
            },
            "body": {
            "ref": "main",
            "inputs": {
                "prNumber": "{{ .event.diff.after.properties.prNumber | tostring }}",
                "repository": "{{ .event.diff.after.relations.repository }}",
                "sonarEntity": "{{ .event.diff.after.relations.sonarAnalysis }}",
                "runID": "{{ .run.id }}"
            }
            }
        },
        "publish": true
    }
    ```
    </details>

4. Click `Save`.


### Create the GitHub workflow

Now let us define the GitHub Actions workflow that receives the input and applies labels to the pull request. 

<GithubDedicatedRepoHint/>

In your dedicated workflow repository, ensure you have a `.github/workflows` directory.
1. Create a new file named `apply-sonar-scan-on-pr.yaml`  
2. Copy and paste the following workflow configuration:
      <details>
      <summary><b>Apply SonarCloud labels workflow (Click to expand)</b></summary>

        ```yaml showLineNumbers
        name: Apply Sonar Scan on PR

        on:
          workflow_dispatch:
            inputs:
              prNumber:
                required: true
                type: string
              repository:
                required: true
                type: string
              sonarEntity:
                required: true
                type: string
              runID:
                required: true
                type: string
        jobs:
          analyze_sonar:
            runs-on: ubuntu-latest
            env:
              GH_TOKEN: ${{ secrets.MY_GITHUB_TOKEN }}
            steps:
              - name: Checkout
                uses: actions/checkout@v4

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

              - name: Get Sonar Entity from Port
                id: get_sonar
                run: |
                  sonar_entity_id="${{ github.event.inputs.sonarEntity }}"
                  echo "🔍 Fetching Sonar entity $sonar_entity_id"

                  sonar_response=$(curl -s -X GET "https://api.port.io/v1/blueprints/sonarQubeAnalysis/entities/$sonar_entity_id" \
                    -H "Content-Type: application/json" \
                    -H "Authorization: Bearer ${{ env.PORT_ACCESS_TOKEN }}")

                  echo "$sonar_response"

                  FIXED_ISSUES=$(echo "$sonar_response" | jq '.entity.properties.fixedIssues // 0')
                  NEW_ISSUES=$(echo "$sonar_response" | jq '.entity.properties.newIssues // 0')
                  COVERAGE=$(echo "$sonar_response" | jq '.entity.properties.coverage // 0')
                  DUPLICATIONS=$(echo "$sonar_response" | jq '.entity.properties.duplications // 0')

                  echo "FIXED_ISSUES=$FIXED_ISSUES" >> "$GITHUB_ENV"
                  echo "NEW_ISSUES=$NEW_ISSUES" >> "$GITHUB_ENV"
                  echo "COVERAGE=$COVERAGE" >> "$GITHUB_ENV"
                  echo "DUPLICATIONS=$DUPLICATIONS" >> "$GITHUB_ENV"

              - name: Classify and Apply Sonar Labels
                id: apply_pr_label
                run: |
                  set -e

                  repo="${{ github.event.inputs.repository }}"
                  owner="${{ github.repository_owner }}"
                  pr_number=$(echo "${{ github.event.inputs.prNumber }}" | grep -o '[0-9]\+$')

                  # Classify coverage
                  if (( $(echo "$COVERAGE < 25" | bc -l) )); then
                    coverage_label="Sonar: Coverage - 0-25%"
                  elif (( $(echo "$COVERAGE < 50" | bc -l) )); then
                    coverage_label="Sonar: Coverage - 25-50%"
                  elif (( $(echo "$COVERAGE < 75" | bc -l) )); then
                    coverage_label="Sonar: Coverage - 50-75%"
                  else
                    coverage_label="Sonar: Coverage - 75-100%"
                  fi

                  # Classify new issues
                  if (( NEW_ISSUES == 0 )); then
                    new_issues_label="Sonar: Issues - A"
                  elif (( NEW_ISSUES <= 5 )); then
                    new_issues_label="Sonar: Issues - B"
                  elif (( NEW_ISSUES <= 10 )); then
                    new_issues_label="Sonar: Issues - C"
                  elif (( NEW_ISSUES <= 20 )); then
                    new_issues_label="Sonar: Issues - D"
                  else
                    new_issues_label="Sonar: Issues - E"
                  fi

                  # Classify fixed issues
                  if (( FIXED_ISSUES == 0 )); then
                    fixed_issues_label="Sonar: Fixed - A"
                  elif (( FIXED_ISSUES <= 5 )); then
                    fixed_issues_label="Sonar: Fixed - B"
                  elif (( FIXED_ISSUES <= 10 )); then
                    fixed_issues_label="Sonar: Fixed - C"
                  elif (( FIXED_ISSUES <= 20 )); then
                    fixed_issues_label="Sonar: Fixed - D"
                  else
                    fixed_issues_label="Sonar: Fixed - E"
                  fi

                  # Classify duplications
                  if (( $(echo "$DUPLICATIONS < 5" | bc -l) )); then
                    dup_label="Sonar: Duplication - A"
                  elif (( $(echo "$DUPLICATIONS < 10" | bc -l) )); then
                    dup_label="Sonar: Duplication - B"
                  elif (( $(echo "$DUPLICATIONS < 20" | bc -l) )); then
                    dup_label="Sonar: Duplication - C"
                  elif (( $(echo "$DUPLICATIONS < 30" | bc -l) )); then
                    dup_label="Sonar: Duplication - D"
                  else
                    dup_label="Sonar: Duplication - E"
                  fi

                  labels_to_apply=("$coverage_label" "$new_issues_label" "$fixed_issues_label" "$dup_label")

                  echo "🏷️ Will apply labels: ${labels_to_apply[*]}"

                  # Define a function to assign colors based on grade
                  get_label_color() {
                    label="$1"
                    if [[ "$label" == *" - A" || "$label" == *"75-100%" ]]; then
                      echo "2cbe4e"  # Green
                    elif [[ "$label" == *" - B" || "$label" == *"50-75%" ]]; then
                      echo "a2eeef"  # Light blue
                    elif [[ "$label" == *" - C" || "$label" == *"25-50%" ]]; then
                      echo "fbca04"  # Yellow
                    elif [[ "$label" == *" - D" || "$label" == *"0-25%" ]]; then
                      echo "f66a0a"  # Orange
                    else
                      echo "d73a4a"  # Red for E or anything else
                    fi
                  }

                  # Create labels if they don’t exist, using dynamic colors
                  for label in "${labels_to_apply[@]}"; do
                    color=$(get_label_color "$label")
                    echo "🛠️ Ensuring label exists: $label with color #$color"
                    curl -s -o /dev/null -w "%{http_code}" -X POST "https://api.github.com/repos/$owner/$repo/labels" \
                      -H "Authorization: Bearer $GH_TOKEN" \
                      -H "Accept: application/vnd.github+json" \
                      -d "{\"name\": \"$label\", \"color\": \"$color\"}" | grep -qE "201|422"
                  done

                  # Apply to PR
                  echo "🏷️ Applying labels to PR #$pr_number..."
                  curl -s -X POST "https://api.github.com/repos/$owner/$repo/issues/$pr_number/labels" \
                    -H "Authorization: Bearer $GH_TOKEN" \
                    -H "Accept: application/vnd.github+json" \
                    -d "{\"labels\": [\"${labels_to_apply[0]}\", \"${labels_to_apply[1]}\", \"${labels_to_apply[2]}\", \"${labels_to_apply[3]}\"]}"


              - name: Update Port action status
                if: always()
                run: |
                  if [ "${{ steps.apply_pr_label.outcome }}" == "failure" ]; then
                    STATUS="FAILURE"
                  else
                    STATUS="SUCCESS"
                  fi
              
                  curl -L -X PATCH "https://api.port.io/v1/actions/runs/${{ github.event.inputs.runID }}" \
                  -H "Content-Type: application/json" \
                  -H "Accept: application/json" \
                  -H "Authorization: Bearer ${{ env.PORT_ACCESS_TOKEN }}" \
                  -d '{
                    "status": "'"$STATUS"'",
                    "statusLabel": "'"$STATUS"'",
                    "link": "'"${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"'",
                    "summary": "Pull request labeling completed with status: '"$STATUS"'"
                  }'
        ```
      </details>

      :::info Required GitHub Secrets
      For this workflow to function properly, you need to add the following secrets to your GitHub repository:

      - `PORT_CLIENT_ID`: The client ID of your Port account.
      - `PORT_CLIENT_SECRET`: The client ID of your Port account.
      - `MY_GITHUB_TOKEN`: The fine grained GitHub personal access token with `Read and Write` access to **issues**, **pull requests** across all repositories in your organization.
      :::

3. Commit and push the changes to your repository.


Once a pull request associated with a SonarCloud analysis is updated, the automation will be triggered automatically. It will evaluate the latest scan results and apply color-coded labels to the PR, reflecting the quality status of the code.

<img src="/img/guides/sonarCloudPRLabel.png" width="600px" border="1px" />








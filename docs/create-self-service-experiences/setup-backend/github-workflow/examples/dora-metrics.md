---
sidebar_position: 10
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Dora Metrics

In this guide, we will create a self-service action in Port that executes a GitHub workflow to compute the dora metrics for a service.

## Prerequisites
1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).
2. A GitHub repository in which you can trigger a workflow that we will use in this guide.

Below you can find the JSON for the `Service` blueprint required for the guide:

<details>
<summary><b>Service blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "service",
  "title": "Service",
  "icon": "Github",
  "schema": {
    "properties": {
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown",
        "icon": "Book"
      },
      "url": {
        "title": "URL",
        "format": "url",
        "type": "string",
        "icon": "Link"
      },
      "language": {
        "icon": "Git",
        "type": "string",
        "title": "Language",
        "enum": [
          "GO",
          "Python",
          "Node",
          "React"
        ],
        "enumColors": {
          "GO": "red",
          "Python": "green",
          "Node": "blue",
          "React": "yellow"
        }
      },
      "slack": {
        "icon": "Slack",
        "type": "string",
        "title": "Slack",
        "format": "url"
      },
      "code_owners": {
        "title": "Code owners",
        "description": "This service's code owners",
        "type": "string",
        "icon": "TwoUsers"
      },
      "type": {
        "title": "Type",
        "description": "This service's type",
        "type": "string",
        "enum": [
          "Backend",
          "Frontend",
          "Library"
        ],
        "enumColors": {
          "Backend": "purple",
          "Frontend": "pink",
          "Library": "green"
        },
        "icon": "DefaultProperty"
      },
      "lifecycle": {
        "title": "Lifecycle",
        "type": "string",
        "enum": [
          "Production",
          "Staging",
          "Development"
        ],
        "enumColors": {
          "Production": "green",
          "Staging": "yellow",
          "Development": "blue"
        },
        "icon": "DefaultProperty"
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

## Create Github workflow

Follow these steps to get started:

1. Create the following GitHub Action secrets:
    - `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `PATTOKEN` - GitHub PAT token. Ensure that Read access to actions and metadata permission is set. [learn more](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
2. Create an action in the [self-service page](https://app.getport.io/self-serve) on the `Service` blueprint with the following JSON definitions:

<details>

  <summary><b>Port Action: Dora Metrics (click to expand)</b></summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::


```json showLineNumbers
{
  "identifier": "dora_metrics",
  "title": "Dora Metrics",
  "icon": "Github",
  "userInputs": {
    "properties": {
      "timeframe": {
        "icon": "Github",
        "title": "Timeframe",
        "description": "Time frame in weeks to calculate metrics on",
        "type": "number",
        "default": 4,
        "minimum": 1
      },
      "workflow": {
        "title": "workflow",
        "description": "The name of the workflows to process. Multiple workflows can be separated by a comma (,) .",
        "icon": "Github",
        "type": "string"
      },
      "repository": {
        "title": "Repository",
        "format": "url",
        "type": "string",
        "icon": "Github",
        "default": {
          "jqQuery": ".entity.properties.url"
        }
      }
    },
    "required": [
      "timeframe",
      "workflow"
    ],
    "order": [
      "timeframe",
      "workflow"
    ]
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "dora-metrics.yaml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "DAY-2",
  "description": "Estimate dora metrics for a service",
  "requiredApproval": false
}
```

</details>

3. In your Github repository, create a workflow file under `.github/workflows/dora-metrics.yml` with the following content:

<details>

<summary><b>GitHub workflow: Ingest DORA Metrics (click to expand)</b></summary>

```yaml showLineNumbers title="dora-metrics.yml"
name: Ingest DORA Metrics

on:
  workflow_dispatch:
    inputs:
      repository:
        description: 'Comma-separated list of repositories to analyze (eg. https://github.com/port-labs/self-service-actions)'
        required: true
      timeframe:
        description: 'Time frame within which metrics should be computed. e.g. 4 for Last 4 weeks'
        required: true
      workflow:
        description: 'The name of the workflows to process. Multiple workflows can be separated by a comma (,).'
        required: true
      port_payload:
        required: true
        description: 'Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)'
        type: string
      
jobs:
  compute-dora-metrics:
    runs-on: ubuntu-latest
    steps:
    
      - name: Checkout code
        uses: actions/checkout@v2
        
      - name: Transform Workflow Inputs
        run: |
          days=$(( ${{ github.event.inputs.timeframe }} * 7 ))
          repository_path=$(echo "${{ github.event.inputs.repository }}" | awk -F'com/' '{print $NF}')
          # repo_name="${repository_path##*/}"
          cleaned_name=$(echo "${repository_path##*/}" | tr -c '[:alnum:]' ' ')
          title=$(echo "$cleaned_name" | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1')

          # export to github enviroment vars
          echo "TIMEFRAME_IN_DAYS=$days" >> $GITHUB_ENV
          echo "REPOSITORY=$repository_path" >> $GITHUB_ENV
          echo "TITLE=$title" >> $GITHUB_ENV
        shell: bash

      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.x'

      - name: Report Failure In Settting Up Dependencies
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Installing required packages for the action..."
          
      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r dora/requirements.txt

      - name: Report Failure In Computing PR Metrics
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Failed to install required packages for the action ..."

      - name: Log Before Running PR Metrics
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Computing PR metrics on the repository ..."
          
      - name: Compute PR Metrics
        env:
          GITHUB_TOKEN: ${{ secrets.PATTOKEN }}  # Use the automatically provided GITHUB_TOKEN
          REPOSITORY: ${{ env.REPOSITORY }}
        run: python dora/calculate_pr_metrics.py

      - name: Report Failure In Computing PR Metrics
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Failed to compute Pull Request Metrics❌"

      - name: Report Success In Computing PR Metrics
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Successfully Computed Pull Request metric for the service ✅"
          
      - name: Log Before Running Deployment Frequency
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Computing deployment frequency metric ..."
          
      - name: Deployment Frequency
        id: deployment_fequency
        env:
          WORKFLOWS: ${{ inputs.workflow }}
          GITHUB_TOKEN: ${{ secrets.PATTOKEN }} 
          REPOSITORY: ${{ env.REPOSITORY }}
        run: python dora/deploymentfrequency.py

      - name: Report Failure In Computing Deployment Frequency
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Failed to compute Deployment Frequency ❌"
          
      - name: Report Success In Computing Deployment Frequency
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Successfully computed deployment frequency ✅"
          
      - name: Log Before Running Lead Time for Changes
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Computing lead time for changes metric ..."
          
      - name: Lead Time For Changes
        id: lead_time_for_changes
        env:
          WORKFLOWS: ${{ inputs.workflow }}
          GITHUB_TOKEN: ${{ secrets.PATTOKEN }} 
          REPOSITORY: ${{ env.REPOSITORY }}
        run: python dora/leadtimeforchanges.py

      - name: Report Failure In Lead Time For Changes
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Failed to compute lead time for changes ❌"
          
      - name: Report Success In Lead Time For Changes
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Successfully computed lead time for changes ✅"
          
      - name: Log Before Upserting Entity
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Upserting DORA Metrics to Port"

      - name: UPSERT Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: "${{ fromJson(env.metrics).id }}"
          title: ${{ env.TITLE }}
          blueprint: doraMetrics
          properties: |-
            {
              "timeFrameInWeeks": ${{ github.event.inputs.timeframe }},
              "totalDeployments": "${{ fromJson(env.deployment_frequency_report).total_deployments }}",
              "deploymentRating": "${{ fromJson(env.deployment_frequency_report).rating }}",
              "numberOfUniqueDeploymentDays": "${{ fromJson(env.deployment_frequency_report).number_of_unique_deployment_days }}",
              "deploymentFrequency": "${{ fromJson(env.deployment_frequency_report).deployment_frequency }}",
              "leadTimeForChangesInHours": "${{ fromJson(env.lead_time_for_changes_report).lead_time_for_changes_in_hours }}",
              "leadTimeRating": "${{ fromJson(env.lead_time_for_changes_report).rating }}",
              "workflowAverageTimeDuration": "${{ fromJson(env.lead_time_for_changes_report).workflow_average_time_duration }}",
              "prAverageTimeDuration": "${{ fromJson(env.lead_time_for_changes_report).pr_average_time_duration }}",
              "averageOpenToCloseTime": "${{ fromJson(env.metrics).average_open_to_close_time }}",
              "averageTimeToFirstReview": "${{ fromJson(env.metrics).average_time_to_first_review }}",
              "averageTimeToApproval": "${{ fromJson(env.metrics).average_time_to_approval }}",
              "prsOpened": "${{ fromJson(env.metrics).prs_opened }}",
              "weeklyPrsMerged": "${{ fromJson(env.metrics).weekly_prs_merged }}",
              "averageReviewsPerPr": "${{ fromJson(env.metrics).average_reviews_per_pr }}",
              "averageCommitsPerPr": "${{ fromJson(env.metrics).average_commits_per_pr }}",
              "averageLocChangedPerPr": "${{ fromJson(env.metrics).average_loc_changed_per_pr }}",
              "averagePrsReviewedPerWeek": "${{ fromJson(env.metrics).average_prs_reviewed_per_week }}"
            }
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{ fromJson(inputs.port_payload).context.runId }}

      - name: Report Failure In Upserting Entity
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Failed to upsert entity to port ❌"
          
      - name: Report Successful Upserting of Entity
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Entity upserting was successful ✅"
```

</details>
<br />

4. Create a text file (`requirements.txt`) in a folder name `dora` to host the required dependencies for running the action.
<details>
  <summary><b>Requirements</b></summary>

```text showLineNumbers title="requirements.txt"
PyGithub==2.3.0
requests==2.31.0
pytz==2024.1
```

</details>

5. Create the following python scripts (`calculate_pr_metrics.py`, `deploymentfrequency.py` and `leadtimeforchanges.py` ) in a folder named `dora` at the root of your GitHub repository:

<details>
  <summary><b>Calculate PR Metrics</b></summary>

```python showLineNumbers title="calculate_pr_metrics.py"
import os
from github import Github
from datetime import datetime, timedelta, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed
import json


class RepositoryMetrics:
    def __init__(self, repo_name, time_frame):
        self.github_client = Github(os.getenv("GITHUB_TOKEN"))
        self.repo_name = repo_name
        self.time_frame = int(time_frame)
        self.start_date = datetime.utcnow().replace(tzinfo=timezone.utc) - timedelta(
            days=self.time_frame
        )
        self.repo = self.github_client.get_repo(f"{self.repo_name}")

    def calculate_pr_metrics(self):
        prs = self.repo.get_pulls(state="all", sort="created", direction="desc")
        results = []

        with ThreadPoolExecutor() as executor:
            futures = [
                executor.submit(self.process_pr, pr)
                for pr in prs
                if pr.created_at >= self.start_date
            ]
            for future in as_completed(futures):
                results.append(future.result())

        metrics = self.aggregate_results(results)
        return metrics

    def process_pr(self, pr):
        pr_metrics = {
            "open_to_close_time": timedelta(0),
            "time_to_first_review": timedelta(0),
            "time_to_approval": timedelta(0),
            "prs_opened": 1,
            "prs_merged": int(pr.merged),
            "total_reviews": 0,
            "total_commits": 0,
            "total_loc_changed": 0,
            "review_dates": [],
        }

        if pr.merged:
            pr_metrics["open_to_close_time"] = pr.merged_at - pr.created_at
            commits = pr.get_commits()
            pr_metrics["total_commits"] = commits.totalCount
            for file in pr.get_files():
                pr_metrics["total_loc_changed"] += file.additions + file.deletions

        reviews = pr.get_reviews()
        for review in reviews:
            if review.state in ["APPROVED", "CHANGES_REQUESTED", "COMMENTED"]:
                pr_metrics["review_dates"].append(review.submitted_at)
                pr_metrics["total_reviews"] += 1
                if pr_metrics["time_to_first_review"] == timedelta(0):
                    pr_metrics["time_to_first_review"] = (
                        review.submitted_at - pr.created_at
                    )
                if review.state == "APPROVED" and pr_metrics[
                    "time_to_approval"
                ] == timedelta(0):
                    pr_metrics["time_to_approval"] = review.submitted_at - pr.created_at

        return pr_metrics

    def aggregate_results(self, results):
        aggregated = {
            "total_open_to_close_time": timedelta(0),
            "total_time_to_first_review": timedelta(0),
            "total_time_to_approval": timedelta(0),
            "prs_opened": 0,
            "prs_merged": 0,
            "total_reviews": 0,
            "total_commits": 0,
            "total_loc_changed": 0,
            "review_dates": [],
        }

        for result in results:
            aggregated["total_open_to_close_time"] += result["open_to_close_time"]
            aggregated["total_time_to_first_review"] += result["time_to_first_review"]
            aggregated["total_time_to_approval"] += result["time_to_approval"]
            aggregated["prs_opened"] += result["prs_opened"]
            aggregated["prs_merged"] += result["prs_merged"]
            aggregated["total_reviews"] += result["total_reviews"]
            aggregated["total_commits"] += result["total_commits"]
            aggregated["total_loc_changed"] += result["total_loc_changed"]
            aggregated["review_dates"].extend(result["review_dates"])

        review_weeks = {
            review_date.isocalendar()[1] for review_date in aggregated["review_dates"]
        }
        average_prs_reviewed_per_week = len(review_weeks) / max(1, self.time_frame)

        metrics = {
            "id": self.repo.id,
            "average_open_to_close_time": self.timedelta_to_decimal_hours(
                aggregated["total_open_to_close_time"] / aggregated["prs_merged"]
            )
            if aggregated["prs_merged"]
            else 0,
            "average_time_to_first_review": self.timedelta_to_decimal_hours(
                aggregated["total_time_to_first_review"] / aggregated["prs_opened"]
            )
            if aggregated["prs_opened"]
            else 0,
            "average_time_to_approval": self.timedelta_to_decimal_hours(
                aggregated["total_time_to_approval"] / aggregated["prs_opened"]
            )
            if aggregated["prs_opened"]
            else 0,
            "prs_opened": aggregated["prs_opened"],
            "weekly_prs_merged": self.timedelta_to_decimal_hours(
                aggregated["total_open_to_close_time"] / max(1, self.time_frame)
            )
            if aggregated["prs_merged"]
            else 0,
            "average_reviews_per_pr": round(aggregated["total_reviews"]
            / aggregated["prs_opened"],2)
            if aggregated["prs_opened"]
            else 0,
            "average_commits_per_pr": round(aggregated["total_commits"]
            / aggregated["prs_opened"],2)
            if aggregated["prs_opened"]
            else 0,
            "average_loc_changed_per_pr": round(aggregated["total_loc_changed"]
            / aggregated["prs_opened"],2)
            if aggregated["prs_opened"]
            else 0,
            "average_prs_reviewed_per_week": round(average_prs_reviewed_per_week,2),
        }

        return metrics

    def timedelta_to_decimal_hours(self, td):
        return round(td.total_seconds() / 3600, 2)


def main():
    repo_name = os.getenv("REPOSITORY")
    time_frame = os.getenv("TIMEFRAME_IN_DAYS")
    print("Repository Name:", repo_name)
    print("TimeFrame (in weeks):", time_frame)

    repo_metrics = RepositoryMetrics(repo_name, time_frame)
    metrics = repo_metrics.calculate_pr_metrics()

    metrics_json = json.dumps(metrics, default=str)
    with open(os.getenv("GITHUB_ENV"), "a") as github_env:
        github_env.write(f"metrics={metrics_json}\n")


if __name__ == "__main__":
    main()
```
</details>

<details>
  <summary><b>Deployment Frequency</b></summary>

```python showLineNumbers title="deploymentfrequency.py"
from github import Github
import datetime
import pytz  # Make sure to install pytz if you haven't: pip install pytz
import os
import json

class DeploymentFrequency:
    def __init__(self, owner_repo, workflows, branch, number_of_days, pat_token=""):
        self.owner_repo = owner_repo
        self.workflows = workflows.split(',')
        self.branch = branch
        self.number_of_days = number_of_days
        self.pat_token = pat_token
        self.github = Github(pat_token) if pat_token else Github()
        self.owner, self.repo_name = owner_repo.split('/')
        self.repo = self.github.get_repo(f"{self.owner}/{self.repo_name}")

    def fetch_workflow_runs(self):
        workflow_runs_list = []
        unique_dates = set()
        now_utc = datetime.datetime.now(pytz.utc)

        for workflow_name in self.workflows:
            workflows = self.repo.get_workflows()
            for workflow in workflows:
                if workflow.name == workflow_name:
                    runs = workflow.get_runs(branch=self.branch)
                    for run in runs:
                        run_date = run.created_at.replace(tzinfo=pytz.utc)
                        if run_date > now_utc - datetime.timedelta(days=self.number_of_days):
                            workflow_runs_list.append(run)
                            unique_dates.add(run_date.date())

        return workflow_runs_list, unique_dates

    def calculate_deployments_per_day(self, workflow_runs_list):
        if self.number_of_days > 0:
            return len(workflow_runs_list) / self.number_of_days
        return 0

    def compute_rating(self, deployments_per_day):
        daily_deployment = 1
        weekly_deployment = 1 / 7
        monthly_deployment = 1 / 30
        yearly_deployment = 1 / 365

        if deployments_per_day > daily_deployment:
            return "Elite", "brightgreen"
        elif weekly_deployment <= deployments_per_day <= daily_deployment:
            return "High", "green"
        elif monthly_deployment <= deployments_per_day < weekly_deployment:
            return "Medium", "yellow"
        elif yearly_deployment < deployments_per_day < monthly_deployment:
            return "Low", "red"
        else:
            return "None", "lightgrey"

    def report(self):
        workflow_runs_list, unique_dates = self.fetch_workflow_runs()
        deployments_per_day = self.calculate_deployments_per_day(workflow_runs_list)
        rating, color = self.compute_rating(deployments_per_day)

        results = {
            "deployment_frequency": round(deployments_per_day, 2),
            "rating": rating,
            "number_of_unique_deployment_days": len(unique_dates),
            "total_deployments": len(workflow_runs_list)
        }

        print(f"Owner/Repo: {self.owner}/{self.repo_name}")
        print(f"Workflows: {', '.join(self.workflows)}")
        print(f"Branch: {self.branch}")
        print(f"Number of days: {self.number_of_days}")
        print(f"Deployment frequency over the last {self.number_of_days} days is {deployments_per_day} per day")
        print(f"Rating: {rating} ({color})")
        return json.dumps(results, default=str)

if __name__ == "__main__":
    owner_repo = os.getenv('REPOSITORY')
    token = os.getenv('GITHUB_TOKEN')
    workflows = os.getenv('WORKFLOWS')
    branch = 'main'
    time_frame = int(os.getenv('TIMEFRAME_IN_DAYS'))
    number_of_days = 30 if not time_frame else time_frame
    
    df = DeploymentFrequency(owner_repo,workflows, branch, number_of_days, pat_token=token)
    report = df.report()
    
    with open(os.getenv('GITHUB_ENV'), 'a') as github_env:
        github_env.write(f"deployment_frequency_report={report}\n")
```
</details>

<details>
  <summary><b>Lead Time For Changes</b></summary>

```python showLineNumbers title="leadtimeforchanges.py"
import requests
from datetime import datetime, timedelta
import base64
import json
import os

def main(owner_repo, workflows, branch, number_of_days, commit_counting_method="last", pat_token="", actions_token="", app_id="", app_installation_id="", app_private_key=""):
    owner, repo = owner_repo.split('/')
    workflows_array = workflows.split(',')
    if commit_counting_method == "":
        commit_counting_method = "last"
    print(f"Owner/Repo: {owner}/{repo}")
    print(f"Number of days: {number_of_days}")
    print(f"Workflows: {workflows_array[0]}")
    print(f"Branch: {branch}")
    print(f"Commit counting method '{commit_counting_method}' being used")

    auth_header = get_auth_header(pat_token, actions_token, app_id, app_installation_id, app_private_key)

    prs_response = get_pull_requests(owner, repo, branch, auth_header)
    pr_processing_result = process_pull_requests(prs_response, number_of_days, commit_counting_method, owner, repo, auth_header)

    workflows_response = get_workflows(owner, repo, auth_header)
    workflow_processing_result = process_workflows(workflows_response, workflows_array, owner, repo, branch, number_of_days, auth_header)

    return evaluate_lead_time(pr_processing_result, workflow_processing_result, number_of_days)

def get_auth_header(pat_token, actions_token, app_id, app_installation_id, app_private_key):
    headers = {}
    if pat_token:
        encoded_credentials = base64.b64encode(f":{pat_token}".encode()).decode()
        headers['Authorization'] = f"Basic {encoded_credentials}"
    elif actions_token:
        headers['Authorization'] = f"Bearer {actions_token}"
    # Add more authentication methods as needed
    return headers

def get_pull_requests(owner, repo, branch, headers):
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls?state=all&head={branch}&per_page=100&state=closed"
    response = requests.get(url, headers=headers)
    if response.status_code == 404:
        print("Repo is not found or you do not have access")
        exit()
    return response.json()

def process_pull_requests(prs, number_of_days, commit_counting_method, owner, repo, headers):
    pr_counter = 0
    total_pr_hours = 0
    for pr in prs:
        merged_at = pr.get('merged_at')
        if merged_at and datetime.strptime(merged_at, "%Y-%m-%dT%H:%M:%SZ") > datetime.utcnow() - timedelta(days=number_of_days):
            pr_counter += 1
            commits_url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr['number']}/commits?per_page=100"
            commits_response = requests.get(commits_url, headers=headers).json()
            if commits_response:
                if commit_counting_method == "last":
                    start_date = commits_response[-1]['commit']['committer']['date']
                elif commit_counting_method == "first":
                    start_date = commits_response[0]['commit']['committer']['date']
                start_date = datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%SZ")
                merged_at = datetime.strptime(merged_at, "%Y-%m-%dT%H:%M:%SZ")
                duration = merged_at - start_date
                total_pr_hours += duration.total_seconds() / 3600
    return pr_counter, total_pr_hours

def get_workflows(owner, repo, headers):
    url = f"https://api.github.com/repos/{owner}/{repo}/actions/workflows"
    response = requests.get(url, headers=headers)
    if response.status_code == 404:
        print("Repo is not found or you do not have access")
        exit()
    return response.json()

def process_workflows(workflows_response, workflow_names, owner, repo, branch, number_of_days, headers):
    workflow_ids = [wf['id'] for wf in workflows_response['workflows'] if wf['name'] in workflow_names]
    total_workflow_hours = 0
    workflow_counter = 0
    for workflow_id in workflow_ids:
        runs_url = f"https://api.github.com/repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs?per_page=100&status=completed"
        runs_response = requests.get(runs_url, headers=headers).json()
        for run in runs_response['workflow_runs']:
            if run['head_branch'] == branch and datetime.strptime(run['created_at'], "%Y-%m-%dT%H:%M:%SZ") > datetime.utcnow() - timedelta(days=number_of_days):
                workflow_counter += 1
                start_time = datetime.strptime(run['created_at'], "%Y-%m-%dT%H:%M:%SZ")
                end_time = datetime.strptime(run['updated_at'], "%Y-%m-%dT%H:%M:%SZ")
                duration = end_time - start_time
                total_workflow_hours += duration.total_seconds() / 3600
    return workflow_counter, total_workflow_hours

def calculate_rating(lead_time_for_changes_in_hours):
    daily_deployment=24
    weekly_deployment=24*7
    monthly_deployment=24*30
    every_six_months_deployment=24*30*6
    
    if lead_time_for_changes_in_hours <= 0:
        rating = "None"
        color = "lightgrey"
    elif lead_time_for_changes_in_hours < 1:
        rating = "Elite"
        color = "brightgreen"
    elif lead_time_for_changes_in_hours <= daily_deployment:
        rating = "Elite"
        color = "brightgreen"
    elif daily_deployment < lead_time_for_changes_in_hours <= weekly_deployment:
        rating = "High"
        color = "green"
    elif weekly_deployment < lead_time_for_changes_in_hours <= monthly_deployment:
        rating = "High"
        color = "green"
    elif monthly_deployment < lead_time_for_changes_in_hours <= every_six_months_deployment:
        rating = "Medium"
        color = "yellow"
    else: 
        # lead_time_for_changes_in_hours > every_six_months_deployment
        rating = "Low"
        color = "red"
        
    display_metric = round(lead_time_for_changes_in_hours, 2)
    display_unit = "hours"
        
    return {
        "rating": rating,
        "color": color,
        "display_metric": display_metric,
        "display_unit": display_unit
    }


def evaluate_lead_time(pr_result, workflow_result, number_of_days):
    pr_counter, total_pr_hours = pr_result
    workflow_counter, total_workflow_hours = workflow_result
    if pr_counter == 0:
        pr_counter = 1
    if workflow_counter == 0:
        workflow_counter = 1
    pr_average = total_pr_hours / pr_counter
    workflow_average = total_workflow_hours / workflow_counter
    lead_time_for_changes_in_hours = pr_average + workflow_average
    print(f"PR average time duration: {pr_average} hours")
    print(f"Workflow average time duration: {workflow_average} hours")
    print(f"Lead time for changes in hours: {lead_time_for_changes_in_hours}")

    report = {
            "pr_average_time_duration" : round(pr_average,2),
            "workflow_average_time_duration" : round(workflow_average,2),
            "lead_time_for_changes_in_hours": round(lead_time_for_changes_in_hours,2)
    }
    rating = calculate_rating(lead_time_for_changes_in_hours)
    report.update(rating)
    
    return json.dumps(report, default=str)
    
if __name__ == "__main__":
    owner_repo = os.getenv('REPOSITORY')
    token = os.getenv('GITHUB_TOKEN')
    workflows = os.getenv('WORKFLOWS')
    branch = 'main'
    time_frame = int(os.getenv('TIMEFRAME_IN_DAYS'))
    number_of_days = 30 if not time_frame else time_frame
    
    report = main(owner_repo, workflows, branch, number_of_days)
    with open(os.getenv('GITHUB_ENV'), 'a') as github_env:
        github_env.write(f"lead_time_for_changes_report={report}\n")
```
</details>

6. Trigger the actions from the [self-service](https://app.getport.io/self-serve) page of your Port application.
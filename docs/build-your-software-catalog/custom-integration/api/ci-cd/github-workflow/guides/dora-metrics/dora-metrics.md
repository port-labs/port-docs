---
sidebar_position: 10
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# DORA Metrics

In this guide, we will create a GitHub action that computes the DORA Metrics for services (repositories) and teams on schedule and ingests the results to Port.


## Prerequisites
1. A GitHub repository in which you can trigger a workflow that we will use in this guide.
2. Create the following GitHub action secrets:

    - `PORT_CLIENT_ID` - [Port Client ID](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `PORT_CLIENT_SECRET` - [Port Client Secret](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `GH_PAT_CLASSIC` - [GitHub Personal Access Token (Classic)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#personal-access-tokens-classic). Ensure that the `read:org` and `repo`, scopes are set for the token to grant this action access to the repositories and teams the metrics are to be estimated for . [learn more].

## Create Github workflow

1. In your Github repository, create a workflow file under `.github/workflows/dora-metrics.yml` with the following content:

<details>
<summary> GitHub Workflow </summary>

```yaml showLineNumbers title="dora-metrics.yml"
name: Ingest DORA Metrics

on:
  schedule:
    - cron: '0 2 * * 1'
  workflow_dispatch:

jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
      owner: ${{ steps.set-matrix.outputs.owner }}
      doraTimeFrame: ${{ steps.set-matrix.outputs.doraTimeFrame }}
      doraBlueprint: ${{ steps.set-matrix.outputs.doraBlueprintID }}
      teamBlueprint: ${{ steps.set-matrix.outputs.teamBlueprintID }}
      githubHost: ${{ steps.set-matrix.outputs.githubHost }}
      sync_services: ${{ steps.set-matrix.outputs.sync_services }}
      sync_teams: ${{ steps.set-matrix.outputs.sync_teams }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install jq
        run: sudo apt-get install jq

      - name: Read Config and Output Matrix
        id: set-matrix
        run: |
          CONFIG_JSON=$(cat dora/dora-config-v2.json)
          MATRIX_JSON=$(echo $CONFIG_JSON | jq -c '{include: .items}')
          OWNER=$(echo $CONFIG_JSON | jq -r '.owner')
          GITHUB_HOST=$(echo $CONFIG_JSON | jq -r '.githubHost')
          DORA_TIME_FRAME=$(echo $CONFIG_JSON | jq -r '.doraTimeFrame')
          SERVICE_BLUEPRINT=$(echo $CONFIG_JSON | jq -r '.port.blueprints.service // empty')
          TEAM_BLUEPRINT=$(echo $CONFIG_JSON | jq -r '.port.blueprints.team // empty')
          SYNC_SERVICES=$([[ -n "$SERVICE_BLUEPRINT" ]] && echo "true" || echo "false")
          SYNC_TEAMS=$([[ -n "$TEAM_BLUEPRINT" ]] && echo "true" || echo "false")
          echo "matrix=$MATRIX_JSON" >> $GITHUB_OUTPUT
          echo "owner=$OWNER" >> $GITHUB_OUTPUT
          echo "githubHost=$GITHUB_HOST" >> $GITHUB_OUTPUT
          echo "doraTimeFrame=$(( DORA_TIME_FRAME * 7 ))" >> $GITHUB_OUTPUT
          echo "doraBlueprint=$SERVICE_BLUEPRINT" >> $GITHUB_OUTPUT
          echo "teamBlueprint=$TEAM_BLUEPRINT" >> $GITHUB_OUTPUT
          echo "sync_services=$SYNC_SERVICES" >> $GITHUB_OUTPUT
          echo "sync_teams=$SYNC_TEAMS" >> $GITHUB_OUTPUT

  compute-team-metrics:
    needs: setup
    runs-on: ubuntu-latest
    if: needs.setup.outputs.sync_teams == 'true'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r dora/requirements.txt
          
      - name: Compute Team Metrics
        run: |
          python dora/calculate_team_metrics.py --owner "${{ needs.setup.outputs.owner }}" --time-frame "${{ needs.setup.outputs.doraTimeFrame }}" --token "${{ secrets.GH_PAT_CLASSIC }}" --port-client-id "${{ secrets.PORT_CLIENT_ID }}" --port-client-secret "${{ secrets.PORT_CLIENT_SECRET }}" --github-host "${{ needs.setup.outputs.githubHost }}"

  compute-repo-metrics:
    needs: setup
    runs-on: ubuntu-latest
    if: needs.setup.outputs.sync_services == 'true'
    strategy:
      fail-fast: false
      matrix: ${{ fromJson(needs.setup.outputs.matrix) }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          repository: ${{ matrix.include.repository }}

      - name: Transform Workflow Parameters
        run: |
          cleaned_name=$(echo "${{ matrix.repository }}" | tr -c '[:alnum:]' ' ')
          TITLE=$(echo "${cleaned_name}" | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1')
          echo "ENTITY_TITLE=$TITLE" >> $GITHUB_ENV

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.x'

      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r dora/requirements.txt

      - name: Compute PR Metrics
        run: |
          python dora/calculate_pr_metrics.py  --owner "${{ needs.setup.outputs.owner }}" --repo "${{ matrix.repository }}" --token "${{ secrets.GH_PAT_CLASSIC }}" --time-frame "${{ needs.setup.outputs.doraTimeFrame }}" --platform github-actions --github-host "${{ needs.setup.outputs.githubHost }}"
          
      - name: Deployment Frequency
        id: deployment_frequency
        run: python dora/deployment_frequency.py --owner "${{ needs.setup.outputs.owner }}" --repo "${{ matrix.repository }}" --token "${{ secrets.GH_PAT_CLASSIC }}" --workflows '${{ toJson(matrix.workflows) }}' --time-frame "${{ needs.setup.outputs.doraTimeFrame }}" --branch "${{ matrix.branch }}" --platform github-actions --github-host "${{ needs.setup.outputs.githubHost }}"
      
      - name: Lead Time For Changes
        id: lead_time_for_changes
        run: python dora/lead_time_for_changes.py --owner "${{ needs.setup.outputs.owner }}" --repo "${{ matrix.repository }}" --token "${{ secrets.GH_PAT_CLASSIC }}" --workflows '${{ toJson(matrix.workflows) }}' --time-frame "${{ needs.setup.outputs.doraTimeFrame }}" --branch ${{ matrix.branch }} --platform github-actions --github-host "${{ needs.setup.outputs.githubHost }}"

      - name: UPSERT Repository DORA Metrics
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{ fromJson(env.metrics).id }}
          title: ${{ env.ENTITY_TITLE }}
          blueprint: doraMetrics
          properties: |-
            {
              "timeFrameInWeeks": "${{ needs.setup.outputs.doraTimeFrame }}",
              "totalDeployments": "${{ fromJson(env.deployment_frequency_report).total_deployments }}",
              "deploymentRating": "${{ fromJson(env.deployment_frequency_report).rating }}",
              "numberOfUniqueDeploymentDays": "${{ fromJson(env.deployment_frequency_report).number_of_unique_deployment_days }}",
              "numberOfUniqueDeploymentWeeks": "${{ fromJson(env.deployment_frequency_report).number_of_unique_deployment_weeks }}",
              "numberOfUniqueDeploymentMonths": "${{ fromJson(env.deployment_frequency_report).number_of_unique_deployment_months }}",
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
```

</details>

2. Create a text file (`requirements.txt`) and a json file (`dora-config.json`) in a folder named `dora` to host the required dependencies and configurations for running the workflow respectively.
<details>
  <summary> Requirements </summary>

```text showLineNumbers title="requirements.txt"
PyGithub==2.3.0
httpx==0.27.0
```

</details>


<details>
  <summary>Workflow Configuration</summary>
:::tip
You can choose to run any of the metric jobs (`compute-team-metrics` or `compute-repo-metrics`) optionally. This is controlled by setting or unsetting the corresponding Port blueprint parameters in your configuration file (`dora/dora-config.json`)
:::

| Name                 | Description                                                                                          | Required | Default            |
|----------------------|------------------------------------------------------------------------------------------------------|----------|--------------------
| owner              | GitHub organization or user name                                                            | true    | -               |
| repository              | your GitHub repository name                                                              | true    | -               |
| doraTimeframe              | Time frame in weeks to calculate metrics on                                                                | false    | 4               |
| branch              | your preferred GitHub repository branch to estimate metrics on                                                              | false    | main              |
| workflows              | An array of workflows to process. Multiple workflows can be separated by a comma (,)                                                              | false    | []               |
| githubHost              | The api host of your github instance                                                              | false    | https://api.github.com               |
| blueprints              | blueprint identifiers in port for dora metrics and github team                                                              | true    | -               |
| items              | An array of defined repository configs (`repository`, `branch`, `workflows`) to compute dora metrics on, required only to compute dora metrics for repositories (not required for team metrics) |false |

```json showLineNumbers title="example dora-config.json"
{
  "owner": "port-labs",
  "doraTimeFrame": 2,
  "githubHost": "https://api.github.com",
  "port": {
    "blueprints":{
      "dora": "doraMetrics",
      "team": "githubTeam"
    }
  },
  "items": [
    {
      "repository": "port-docs",
      "branch": "main",
      "workflows": ["build.yml"]
    },
    {
      "repository": "ocean",
      "branch": "main",
      "workflows": []
    }
  ]
}
```
</details>


## DORA for Services (Repositories)

1. Create a blueprint for hosting DORA Metrics for the services in port


<details>
<summary>DORA Metrics blueprint (click to expand)</summary>

```json showLineNumbers title="DORA Blueprint"
{
  "identifier": "doraMetrics",
  "title": "DORA Metrics",
  "icon": "Github",
  "schema": {
    "properties": {
      "averageOpenToCloseTime": {
        "icon": "DefaultProperty",
        "title": "Average Open To Close Time",
        "type": "number",
        "description": "Average time from PR open to close in hours."
      },
      "averageTimeToFirstReview": {
        "title": "Average Time To First Review",
        "type": "string",
        "icon": "DefaultProperty",
        "description": "Average time until first PR review in hours."
      },
      "averageTimeToApproval": {
        "title": "Average Time To Approval",
        "type": "number",
        "icon": "DefaultProperty",
        "description": "Average time from PR open to approval in hours."
      },
      "prsOpened": {
        "title": "PRs Opened",
        "type": "number",
        "icon": "DefaultProperty",
        "description": "Total PRs opened in the timeframe."
      },
      "weeklyPrsMerged": {
        "title": "Weekly PRs Merged",
        "type": "number",
        "icon": "DefaultProperty",
        "description": "Average number of PRs merged per week."
      },
      "averageReviewsPerPr": {
        "title": "Average Review Per PR",
        "type": "number",
        "icon": "DefaultProperty",
        "description": "Average number of reviews per PR."
      },
      "averageCommitsPerPr": {
        "title": "Average Commits Per PR",
        "type": "number",
        "icon": "DefaultProperty",
        "description": "Average number of commits per PR."
      },
      "averageLocChangedPerPr": {
        "title": "Average Loc Changed Per Per",
        "type": "number",
        "icon": "DefaultProperty",
        "description": "Average lines of code changed per PR."
      },
      "averagePrsReviewedPerWeek": {
        "title": "Average PRs Review Per Week",
        "type": "number",
        "icon": "DefaultProperty",
        "description": "Average PRs reviewed per week."
      },
      "totalDeployments": {
        "title": "Total Deployments",
        "type": "string",
        "icon": "DefaultProperty",
        "description": "Total number of deployments in the timeframe."
      },
      "deploymentRating": {
        "icon": "DefaultProperty",
        "title": "Deployment Rating",
        "description": "Qualitative rating of deployment success. e.g Elite",
        "type": "string",
        "enum": [
          "Elite",
          "High",
          "Medium",
          "Low",
          "None"
        ],
        "enumColors": {
          "Elite": "green",
          "High": "turquoise",
          "Medium": "yellow",
          "Low": "red",
          "None": "lightGray"
        }
      },
      "numberOfUniqueDeploymentDays": {
        "title": "Unique Deployment Days",
        "type": "string",
        "icon": "DefaultProperty",
        "description": "Days with at least one deployment."
      },
      "numberOfUniqueDeploymentWeeks": {
        "title": "Unique Deployment Weeks",
        "type": "string",
        "icon": "DefaultProperty",
        "description": "Number of weeks with at least one deployment."
      },
      "numberOfUniqueDeploymentMonths": {
        "title": "Unique Deployment Months",
        "type": "string",
        "icon": "DefaultProperty",
        "description": "Number of months with at least one deployment."
      },
      "deploymentFrequency": {
        "title": "Deployment Frequency",
        "type": "string",
        "icon": "DefaultProperty",
        "description": "Frequency of deployments"
      },
      "leadTimeForChangesInHours": {
        "title": "Lead Time For Changes In Hours",
        "type": "string",
        "icon": "DefaultProperty",
        "description": "Average time from commit to deployment in hours."
      },
      "leadTimeRating": {
        "title": "Lead Time Rating",
        "type": "string",
        "icon": "DefaultProperty",
        "description": "Qualitative rating of lead time for changes, e.g Elite.",
        "enum": [
          "Elite",
          "High",
          "Medium",
          "Low",
          "None"
        ],
        "enumColors": {
          "Elite": "green",
          "High": "turquoise",
          "Medium": "yellow",
          "Low": "red",
          "None": "lightGray"
        }
      },
      "workflowAverageTimeDuration": {
        "title": "Workflow Average Time Duration",
        "type": "string",
        "icon": "DefaultProperty",
        "description": "Average duration of CI/CD workflows in hours."
      },
      "timeFrameInWeeks": {
        "icon": "DefaultProperty",
        "title": "TimeFrame in Weeks",
        "type": "number",
        "description": "Timeframe for the metrics in weeks."
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

2. Create the following python scripts (`calculate_pr_metrics.py`, `deployment_frequency.py` and `lead_time_for_changes.py`) in the folder named `dora` created earlier at the root of your GitHub repository to run DORA for repositories:

<details>
  <summary>Pull Request Metrics</summary>

```python showLineNumbers title="calculate_pr_metrics.py"
import os
from github import Github
import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import logging
import argparse

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class RepositoryMetrics:
    def __init__(self, owner, repo, time_frame,token,github_host):
        try:
            self.github_client = (
                Github(login_or_token=token, base_url=github_host)
                if github_host
                else Github(token)
            )
            self.owner = owner
        except GithubException as e:
            logging.error(f"Failed to initialize GitHub client: {e}")
            raise
        except Exception as e:
            logging.error(
                f"Unexpected error during initialization: {e} - verify that your github credentials are valid"
            )
            raise
        self.repo_name = f"{owner}/{repo}"
        self.time_frame = int(time_frame)
        self.start_date = datetime.datetime.now(datetime.UTC).replace(
            tzinfo=datetime.timezone.utc
        ) - datetime.timedelta(days=self.time_frame)
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
            "open_to_close_time": datetime.timedelta(0),
            "time_to_first_review": datetime.timedelta(0),
            "time_to_approval": datetime.timedelta(0),
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
                if pr_metrics["time_to_first_review"] == datetime.timedelta(0):
                    pr_metrics["time_to_first_review"] = (
                        review.submitted_at - pr.created_at
                    )
                if review.state == "APPROVED" and pr_metrics[
                    "time_to_approval"
                ] == datetime.timedelta(0):
                    pr_metrics["time_to_approval"] = review.submitted_at - pr.created_at

        return pr_metrics

    def aggregate_results(self, results):
        aggregated = {
            "total_open_to_close_time": datetime.timedelta(0),
            "total_time_to_first_review": datetime.timedelta(0),
            "total_time_to_approval": datetime.timedelta(0),
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

        # Calculate average PRs reviewed per week
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
            "average_reviews_per_pr": round(
                aggregated["total_reviews"] / aggregated["prs_opened"], 2
            )
            if aggregated["prs_opened"]
            else 0,
            "average_commits_per_pr": round(
                aggregated["total_commits"] / aggregated["prs_opened"], 2
            )
            if aggregated["prs_opened"]
            else 0,
            "average_loc_changed_per_pr": round(
                aggregated["total_loc_changed"] / aggregated["prs_opened"], 2
            )
            if aggregated["prs_opened"]
            else 0,
            "average_prs_reviewed_per_week": round(average_prs_reviewed_per_week, 2),
        }

        return metrics

    def timedelta_to_decimal_hours(self, td):
        return round(td.total_seconds() / 3600, 2)

if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description='Calculate Pull Request Metrics.')
    parser.add_argument('--owner', required=True, help='Owner of the repository')
    parser.add_argument('--repo', required=True, help='Repository name')
    parser.add_argument('--token', required=True, help='GitHub token')
    parser.add_argument('--time-frame', type=int, default=30, help='Time Frame in days')
    parser.add_argument('--platform', default='github-actions', choices=['github-actions', 'self-hosted'], help='CI/CD platform type')
    parser.add_argument(
            "--github-host",
            help="Base URL for self-hosted GitHub instance (e.g., https://api.github-example.com)",
            default=None,
        )
    args = parser.parse_args()

    logging.info(f"Repository Name: {args.owner}/{args.repo}")
    logging.info(f"TimeFrame (in days): {args.time_frame}")

    repo_metrics = RepositoryMetrics(args.owner, args.repo, args.time_frame, token=args.token,github_host = args.github_host)
    metrics = repo_metrics.calculate_pr_metrics()
    metrics_json = json.dumps(metrics, default=str)
    print(metrics_json)
    
    if args.platform == "github-actions":
        with open(os.getenv("GITHUB_ENV"), "a") as github_env:
            github_env.write(f"metrics={metrics_json}\n")
```
</details>

<details>
  <summary><b>Deployment Frequency</b></summary>

```python showLineNumbers title="deployment_frequency.py"
import datetime
import os
import json
from github import Github
import argparse
import logging


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class DeploymentFrequency:
    def __init__(self, owner, repo, workflows, branch, number_of_days, token, github_host):
        self.owner, self.repo = owner, repo
        self.branch = branch
        self.number_of_days = number_of_days
        self.token = token
        try:
            self.github = (
                Github(login_or_token=token, base_url=github_host)
                if github_host
                else Github(token)
            )
            self.owner = owner
        except GithubException as e:
            logging.error(f"Failed to initialize GitHub client: {e}")
            raise
        except Exception as e:
            logging.error(
                f"Unexpected error during initialization: {e} - verify that your github credentials are valid"
            )
            raise
        self.repo_object = self.github.get_repo(f"{self.owner}/{self.repo}")
        try:
            self.workflows = json.loads(workflows)
        except JSONDecodeError:
            logging.error("Invalid JSON format for workflows. Using an empty list.")
            self.workflows = []

    def get_workflows(self):
        if not self.workflows:
            workflows = self.repo_object.get_workflows()
            workflow_ids = [workflow.id for workflow in workflows]
            logging.info(f"Found {len(workflow_ids)} workflows in Repo")
        else:
            workflow_ids = self.workflows
            logging.info(f"Workflows: {workflow_ids}")
        return workflow_ids

    def fetch_workflow_runs(self):
        workflow_ids = self.get_workflows()
        workflow_runs_list = []
        unique_dates = set()
        for workflow_id in workflow_ids:
            for run in self.repo_object.get_workflow(workflow_id).get_runs():
                run_date = run.created_at.replace(tzinfo=None)
                if run.head_branch == self.branch and run_date > datetime.datetime.now() - datetime.timedelta(days=self.number_of_days):
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

    def __call__(self):
        workflow_runs_list, unique_dates = self.fetch_workflow_runs()
        deployments_per_day = self.calculate_deployments_per_day(workflow_runs_list)
        rating, color = self.compute_rating(deployments_per_day)

        logging.info(f"Owner/Repo: {self.owner}/{self.repo}")
        logging.info(f"Branch: {self.branch}")
        logging.info(f"Number of days: {self.number_of_days}")
        logging.info(f"Deployment frequency over the last {self.number_of_days} days is {deployments_per_day} per day")
        logging.info(f"Rating: {rating} ({color})")

        return json.dumps({
            "deployment_frequency": round(deployments_per_day, 2),
            "rating": rating,
            "number_of_unique_deployment_days": len(unique_dates),
            "number_of_unique_deployment_weeks": len({date.isocalendar()[1] for date in unique_dates}),
            "number_of_unique_deployment_month": len({date.month for date in unique_dates}),
            "total_deployments": len(workflow_runs_list),
        }, default=str)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Calculate Deployment Frequency.')
    parser.add_argument('--owner', required=True, help='Owner of the repository')
    parser.add_argument('--repo', required=True, help='Repository name')
    parser.add_argument('--token', required=True, help='GitHub token')
    parser.add_argument(
            "--github-host",
            help="Base URL for self-hosted GitHub instance (e.g., https://api.example-github.com)",
            default=None,
        )
    parser.add_argument('--workflows', required=True, help='GitHub workflows as a JSON string.')
    parser.add_argument('--branch', default='main', help='Branch name')
    parser.add_argument('--time-frame', type=int, default=30, help='Time Frame in days')
    parser.add_argument('--platform', default='github-actions', choices=['github-actions', 'self-hosted'], help='CI/CD platform type')
    args = parser.parse_args()

    deployment_frequency = DeploymentFrequency(args.owner, args.repo, args.workflows, args.branch, args.time_frame, token = args.token, github_host = args.github_host)
    report = deployment_frequency()
    print(report)
    
    if args.platform == "github-actions":
       with open(os.getenv("GITHUB_ENV"), "a") as github_env:
           github_env.write(f"deployment_frequency_report={report}\n")
```
</details>

<details>
  <summary>Lead Time For Changes</summary>

```python showLineNumbers title="lead_time_for_changes.py"
import datetime
import os
import json
from github import Github
import argparse
import logging


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class LeadTimeForChanges:
    def __init__(
        self,
        owner,
        repo,
        workflows,
        branch,
        number_of_days,
        token,
        github_host,
        commit_counting_method="last",
        ignore_workflows=True
    ):
        self.owner = owner
        self.repo = repo
        self.branch = branch
        self.number_of_days = number_of_days
        self.commit_counting_method = commit_counting_method
        try:
            self.github = (
                Github(login_or_token=token, base_url=github_host)
                if github_host
                else Github(token)
            )
            self.owner = owner
        except GithubException as e:
            logging.error(f"Failed to initialize GitHub client: {e}")
            raise
        except Exception as e:
            logging.error(
                f"Unexpected error during initialization: {e} - verify that your github credentials are valid"
            )
            raise
        self.repo_object = self.github.get_repo(f"{self.owner}/{self.repo}")
        self.ignore_workflows = ignore_workflows
        try:
            self.workflows = json.loads(workflows) if workflows else None
        except JSONDecodeError:
            logging.error("Invalid JSON format for workflows. Using an empty list.")
            self.workflows = []

    def __call__(self):
        logging.info(f"Owner/Repo: {self.owner}/{self.repo}")
        logging.info(f"Number of days: {self.number_of_days}")
        logging.info(f"Branch: {self.branch}")
        logging.info(f"Commit counting method '{self.commit_counting_method}' being used")

        pr_result = self.process_pull_requests()
        workflow_result = self.process_workflows() if not(self.ignore_workflows) else None

        return self.evaluate_lead_time(pr_result, workflow_result)

    def get_pull_requests(self):
        return list(self.repo_object.get_pulls(state='closed', base=self.branch))

    def process_pull_requests(self):
        prs = self.get_pull_requests()
        pr_counter = 0
        total_pr_hours = 0
        # Ensure now is also offset-aware by using UTC
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        for pr in prs:
            if pr.merged and pr.merge_commit_sha and pr.merged_at > now_utc - datetime.timedelta(days=self.number_of_days):
                pr_counter += 1
                commits = list(pr.get_commits())
                if commits:
                    if self.commit_counting_method == "last":
                        start_date = commits[-1].commit.committer.date
                    elif self.commit_counting_method == "first":
                        start_date = commits[0].commit.committer.date
                    merged_at = pr.merged_at
                    duration = merged_at - start_date
                    total_pr_hours += duration.total_seconds() / 3600
        return pr_counter, total_pr_hours

    def get_workflows(self):
        if not self.workflows:
            workflows = self.repo_object.get_workflows()
            workflow_ids = [workflow.id for workflow in workflows]
            logging.info(f"Found {len(workflow_ids)} workflows in Repo")
        else:
            workflow_ids = self.workflows
            logging.info(f"Workflows: {workflow_ids}")
        return workflow_ids

    def process_workflows(self):
        workflow_ids = self.get_workflows()
        total_workflow_hours = 0
        workflow_counter = 0
        for workflow_id in workflow_ids:
            runs = list(self.repo_object.get_workflow(workflow_id).get_runs())
            for run in runs:
                if run.head_branch == self.branch and run.created_at > datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=self.number_of_days):
                    workflow_counter += 1
                    duration = run.updated_at - run.created_at
                    total_workflow_hours += duration.total_seconds() / 3600
        return workflow_counter, total_workflow_hours
        
    def calculate_rating(self, lead_time_for_changes_in_hours):
        daily_deployment = 24
        weekly_deployment = 24 * 7
        monthly_deployment = 24 * 30
        every_six_months_deployment = 24 * 30 * 6

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
        elif (
            monthly_deployment
            < lead_time_for_changes_in_hours
            <= every_six_months_deployment
        ):
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
            "display_unit": display_unit,
        }


    def evaluate_lead_time(self, pr_result, workflow_result):
        pr_counter, total_pr_hours = pr_result
        if pr_counter == 0:
            pr_counter = 1
        pr_average = total_pr_hours / pr_counter 

        if workflow_result:
            workflow_counter, total_workflow_hours = workflow_result
            if workflow_counter == 0:
                workflow_counter = 1
    
            workflow_average = total_workflow_hours / workflow_counter

        else:
            workflow_average = 0
            logging.info("Excluded workflows in computing metric")
            
        lead_time_for_changes_in_hours = pr_average + workflow_average
        logging.info(f"PR average time duration: {pr_average} hours")
        logging.info(f"Workflow average time duration: {workflow_average} hours")
        logging.info(f"Lead time for changes in hours: {lead_time_for_changes_in_hours}")

        report = {
            "pr_average_time_duration": round(pr_average, 2),
            "workflow_average_time_duration": round(workflow_average, 2),
            "lead_time_for_changes_in_hours": round(lead_time_for_changes_in_hours, 2),
        }
        rating = self.calculate_rating(lead_time_for_changes_in_hours)
        report.update(rating)

        return json.dumps(report, default=str)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Calculate lead time for changes.')
    parser.add_argument('--owner', required=True, help='Owner of the repository')
    parser.add_argument('--repo', required=True, help='Repository name')
    parser.add_argument('--token', required=True, help='GitHub token')
    parser.add_argument('--workflows', default='[]', help='GitHub workflows as a JSON string.')
    parser.add_argument('--branch', default='main', help='Branch name')
    parser.add_argument('--time-frame', type=int, default=30, help='Time Frame in days')
    parser.add_argument('--platform', default='github-actions', choices=['github-actions', 'self-hosted'], help='CI/CD platform type')
    parser.add_argument('--ignore_workflows', action='store_true', help='Exclude workflows. Default is False.')
    parser.add_argument(
            "--github-host",
            help="Base URL for self-hosted GitHub instance (e.g., https://api.example-github.com)",
            default=None,
        )
    args = parser.parse_args()

    lead_time_for_changes = LeadTimeForChanges(
        args.owner, args.repo, args.workflows, args.branch, args.time_frame, token=args.token,github_host= args.github_host, ignore_workflows=args.ignore_workflows
    )
    report = lead_time_for_changes()
    logging.info(f"Lead Time for Changes >> {report}")
    
    if args.platform == "github-actions":
       with open(os.getenv("GITHUB_ENV"), "a") as github_env:
           github_env.write(f"lead_time_for_changes_report={report}\n")
```
</details>

## Team Metrics

1. Add the following new properties, `averageResponseTime`, `averageResponseTime`,and `timeFrame` to your GitHub Team blueprint in port

<details>
<summary> GitHub Team blueprint (click to expand) </summary>

```json showLineNumbers title="github team blueprint" {29,30,31,32,33,34,35,36,37,38,39,40,41}
{
  "identifier": "githubTeam",
  "title": "GitHub Team",
  "icon": "Github",
  "schema": {
    "properties": {
      "slug": {
        "title": "Slug",
        "type": "string"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "link": {
        "title": "Link",
        "icon": "Link",
        "type": "string",
        "format": "url"
      },
      "permission": {
        "title": "Permission",
        "type": "string"
      },
      "notificationSetting": {
        "title": "Notification Setting",
        "type": "string"
      },
      "responseRate": {
        "type": "number",
        "title": "Response Rate"
      },
      "averageResponseTime": {
        "type": "number",
        "title": "Response Time"
      },
      "timeFrame": {
        "icon": "DefaultProperty",
        "type": "number",
        "title": "Time Frame In Days"
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


2. Create the following python scripts (`team_metrics`, and `port.py` ) in the folder named `dora` created earlier at the root of your GitHub repository to compute the team response metrics. 

<details>
  <summary> Team Metrics </summary>

```python showLineNumbers title="team_metrics.py"
import os
import asyncio
from github import Github, Team, PullRequest, GithubException
import datetime
import json
import logging
import argparse
import re
from concurrent.futures import ThreadPoolExecutor
import threading
from typing import Any, Dict, List, Tuple
from port import PortAPI

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


class TeamMetrics:
    def __init__(
        self, owner: str, time_frame: int, token: str, github_host: str | None
    ) -> None:
        try:
            self.github_client = (
                Github(login_or_token=token, base_url=github_host)
                if github_host
                else Github(token)
            )
            self.owner = owner
        except GithubException as e:
            logging.error(f"Failed to initialize GitHub client: {e}")
            raise
        except Exception as e:
            logging.error(
                f"Unexpected error during initialization: {e} - verify that your github credentials are valid"
            )
            raise

        self.time_frame = time_frame
        self.start_date = datetime.datetime.now(
            datetime.timezone.utc
        ) - datetime.timedelta(days=self.time_frame)
        self.semaphore = threading.Semaphore(5)  # Limit concurrent requests

    @staticmethod
    def convert_to_slug(name: str) -> str:
        """Convert a team name to a slug by replacing spaces with hyphens and lowercasing."""
        return re.sub(r"\s+", "-", name.strip()).lower()

    async def get_teams(self) -> List[Team.Team]:
        try:
            logging.info(f"Fetching teams for organization {self.owner}")
            org = self.github_client.get_organization(self.owner)
            teams:List[Team.Team] = [team for team in org.get_teams()]
            logging.info(f"Found {len(teams)} teams in {self.owner} >> {teams}")
            return [team for team in teams]
        except GithubException as e:
            logging.error(f"Failed to fetch teams: {e}")
            raise
        except Exception as e:
            logging.error(f"Unexpected error while fetching teams: {e}")
            raise

    def get_team_members(self, team: Team.Team) -> List[str]:
        try:
            logging.info(f"Fetching team members for team {team.slug}")
            return [member.login for member in team.get_members()]
        except GithubException as e:
            logging.error(f"Failed to fetch team members for team {team.slug}: {e}")
            raise
        except Exception as e:
            logging.error(
                f"Unexpected error while fetching team members for team {team.slug}: {e}"
            )
            raise

    def get_team_repositories(self, team: Team.Team) -> List[str]:
        try:
            logging.info(f"Fetching repositories for team {team.slug}")
            return [repo.full_name for repo in team.get_repos()]
        except GithubException as e:
            logging.error(f"Failed to fetch repositories for team {team.slug}: {e}")
            raise
        except Exception as e:
            logging.error(
                f"Unexpected error while fetching repositories for team {team.slug}: {e}"
            )
            raise

    async def calculate_response_metrics(
        self,
        prs: List[PullRequest.PullRequest],
        team_members: List[str],
        team_slug: str,
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        logging.info(f"Calculating response rate and time for team {team_slug}")
        total_requests = 0
        responded_requests = 0
        total_response_time = datetime.timedelta(0)
        total_responses = 0

        def fetch_reviews(pr: PullRequest.PullRequest) -> None:
            nonlocal responded_requests, total_response_time, total_responses, total_requests
            try:
                with self.semaphore:  # Ensure limited concurrent requests
                    if any(team.slug == team_slug for team in pr.requested_teams):
                        total_requests += 1
                        reviews = pr.get_reviews()
                        for review in reviews:
                            if review.user.login in team_members:
                                responded_requests += 1
                                response_time = review.submitted_at - pr.created_at
                                total_response_time += response_time
                                total_responses += 1
                                break
            except GithubException as e:
                logging.error(f"Failed to fetch reviews for PR {pr.number}: {e}")
            except Exception as e:
                logging.error(
                    f"Unexpected error while fetching reviews for PR {pr.number}: {e}"
                )

        with ThreadPoolExecutor(max_workers=10) as executor:
            loop = asyncio.get_event_loop()
            futures = [loop.run_in_executor(executor, fetch_reviews, pr) for pr in prs]
            for future in asyncio.as_completed(futures):
                await future

        response_rate = (
            (responded_requests / total_requests) * 100 if total_requests else 0
        )
        average_response_time = (
            self.timedelta_to_decimal_hours(total_response_time / total_responses)
            if total_responses
            else 0
        )

        logging.info(
            f"Successfully retrieved team response metrics for team {team_slug}"
        )
        return {"response_rate": round(response_rate, 2)}, {
            "average_response_time": average_response_time
        }

    @staticmethod
    def timedelta_to_decimal_hours(td: datetime.timedelta) -> float:
        return round(td.total_seconds() / 3600, 2)

    async def calculate_metrics_for_team(self, team: Team.Team) -> Dict[str, Any]:
        all_prs = []
        try:
            team_members = self.get_team_members(team)
            repos = self.get_team_repositories(team)
            logging.info(f"Found {len(repos)} repositories for the team {team.slug}")

            for repo_name in repos:
                repo = self.github_client.get_repo(repo_name)
                prs = repo.get_pulls(state="all", sort="created", direction="desc")
                filtered_prs = [pr for pr in prs if pr.created_at >= self.start_date]
                all_prs.extend(filtered_prs)
                logging.info(
                    f"Fetched {len(filtered_prs)} pull requests from {repo_name}"
                )

            response_rate, response_time = await self.calculate_response_metrics(
                all_prs, team_members, team.slug
            )
            team_info = self.get_team_info(team)
            return {**response_rate, **response_time, **team_info, "time_frame": self.time_frame}
        except GithubException as e:
            logging.error(f"Failed to calculate metrics for team {team.slug}: {e}")
            raise
        except Exception as e:
            logging.error(
                f"Unexpected error while calculating metrics for team {team.slug}: {e}"
            )
            raise

    def get_team_info(self, team: Team.Team) -> Dict[str, Any]:
        try:
            logging.info(
                f"Fetching team info from {self.owner} organization for team {team.slug}"
            )
            return {
                "id": team.id,
                "name": team.name,
                "description": team.description,
                "members_count": team.members_count,
                "repos_count": team.repos_count,
                "slug": team.slug,
                "link": team.html_url,
                "permission": team.permission,
                "notification_setting": team.notification_setting,
            }
        except GithubException as e:
            logging.error(f"Failed to fetch team info for team {team.slug}: {e}")
            raise
        except Exception as e:
            logging.error(
                f"Unexpected error while fetching team info for team {team.slug}: {e}"
            )
            raise

    async def calculate_metrics_for_all_teams(self) -> List[Dict[str, Any]]:
        try:
            teams = await self.get_teams()
            tasks = [self.calculate_metrics_for_team(team) for team in teams]
            return await asyncio.gather(*tasks)
        except Exception as e:
            logging.error(f"Failed to calculate metrics for all teams: {e}")
            raise


class TeamEntityProcessor:
    def __init__(self, port_api: PortAPI) -> None:
        self.port_api = port_api

    @staticmethod
    def remove_symbols_and_title_case(input_string: str) -> str:
        cleaned_string = re.sub(r"[^A-Za-z0-9\s]", " ", input_string)
        title_case_string = cleaned_string.title()
        return title_case_string

    async def process_team_entities(self, team_dora: List[Dict[str, Any]]):
        blueprint_id = "githubTeam"
        tasks = [
            self.port_api.add_entity(
                blueprint_id=blueprint_id,
                entity_object={
                    "identifier": str(data["id"]),
                    "title": self.remove_symbols_and_title_case(data["name"]),
                    "properties": {
                        "description": data["description"],
                        "members_count": data["members_count"],
                        "repos_count": data["repos_count"],
                        "slug": data["slug"],
                        "link": data["link"],
                        "permission": data["permission"],
                        "notificationSetting": data["notification_setting"],
                        "responseRate": data["response_rate"],
                        "averageResponseTime": data["average_response_time"],
                        "timeFrame": data["time_frame"]
                    },
                    "relations": {},
                },
            )
            for data in team_dora
        ]
        await asyncio.gather(*tasks)


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Calculate Team Metrics.")
    parser.add_argument("--owner", required=True, help="Owner of the organization")
    parser.add_argument("--token", required=True, help="GitHub token")
    parser.add_argument("--time-frame", type=int, default=30, help="Time Frame in days")
    parser.add_argument(
        "--github-host",
        help="Base URL for self-hosted GitHub instance (e.g., https://api.github-example.com)",
        default=None,
    )
    parser.add_argument("--port-client-id", help="Port Client ID", required=True)
    parser.add_argument(
        "--port-client-secret", help="Port Client Secret", required=True
    )
    args = parser.parse_args()

    logging.info(f"Owner: {args.owner}")
    logging.info(f"Time Frame (in days): {args.time_frame}")

    team_metrics = TeamMetrics(
        args.owner, args.time_frame, token=args.token, github_host=args.github_host
    )

    loop = asyncio.get_event_loop()
    metrics = loop.run_until_complete(team_metrics.calculate_metrics_for_all_teams())
    port_api = PortAPI(args.port_client_id, args.port_client_secret)
    processor = TeamEntityProcessor(port_api=port_api)
    asyncio.run(processor.process_team_entities(metrics))
```
</details>

<details>
  <summary><b>Upsert Team Metrics to Port</b></summary>

```python showLineNumbers title="port.py"

import httpx
import logging
from typing import Any, Dict, List,


logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


class PortAPI:
    def __init__(self,port_client_id:str,port_client_secret:str):
        self.base_url = "https://api.getport.io/v1"
        self.port_client_id = port_client_id
        self.port_client_secret = port_client_secret

    @property
    async def headers(self)->Dict[str,str]:

        access_token_object:dict = await self.get_token()
        access_token:str = access_token_object["accessToken"]

        port_headers = {"Authorization": f"Bearer {access_token}"}
        return port_headers

    async def get_token(self) -> Dict[str, Any]:
        credentials = {"clientId": self.port_client_id, "clientSecret": self.port_client_secret}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/auth/access_token",
                    json=credentials
                )
                logging.info(f"Successfully retrieved port token")
                response.raise_for_status()
                return response.json()
            except httpx.RequestError as exc:
                logging.error(f"An error occurred while requesting {exc.request.url!r}: {exc}")
            except httpx.HTTPStatusError as exc:
                logging.error(f"Error response {exc.response.status_code} while requesting {exc.request.url!r}: {exc.response.text}")


    async def add_entity(self, blueprint_id: str, entity_object: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/blueprints/{blueprint_id}/entities?upsert=true&merge=true",
                    json=entity_object,
                    headers=await self.headers,
                )
                response.raise_for_status()
                logging.info(f"Entity added: {response.json()}")
            except httpx.RequestError as exc:
                logging.error(f"An error occurred while requesting {exc.request.url!r}: {exc}")
            except httpx.HTTPStatusError as exc:
                logging.error(f"Error response {exc.response.status_code} while requesting {exc.request.url!r}: {exc.response.text}") 
```
</details>

<br/>
Congrats 🎉 You've successfully created a scheduled GitHub workflow that periodically calculates and ingests `DORA Metrics` for GitHub repository(s).

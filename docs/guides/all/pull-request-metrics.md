---
sidebar_position: 10
displayed_sidebar: null
description: Learn how to track pull request metrics in Port, gaining insights into code quality and collaboration efficiency.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Pull-request metrics (~~Deprecated~~)

:::warning Deprecated
This guide is deprecated and is no longer recommended for use. Please refer to the new guides for the most up-to-date information:

- [Track DORA metrics](https://docs.port.io/guides/all/create-and-track-dora-metrics-in-your-portal)
- [Measuring pull request standards](https://docs.port.io/guides/all/working_agreements_and_measuring_pr_standards)
:::

In this guide, we will create a GitHub action that computes pull-request metrics for a service (repository) on schedule and ingests the results to Port.


## Prerequisites
1. A GitHub repository in which you can trigger a workflow that we will use in this guide.
2. A blueprint in Port representing a Github service (repository).
3. A blueprint in Port representing Dora Metrics.

:::note Mapping convention

DORA Metrics entities have a one to one relationship with service. The guide assumes that the service ID is the name of the repository, and as such, the relationship uses the the repository name as the ID.
:::

## Create blueprints in Port

1. Create the `Service` and `DORA Metrics` blueprint.
    - Go to your [Builder](https://app.getport.io/settings/data-model) page.

    - Click on the `+ Blueprint` button.
    - Click on the `{...} Edit JSON` button.
    - Copy and paste the following JSON configuration into the editor.

<details>
<summary><b>Service blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "service",
  "title": "Service",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown"
      },
      "url": {
        "title": "Service URL",
        "type": "string",
        "format": "url"
      },
      "defaultBranch": {
        "title": "Default branch",
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


<details>
<summary><b>DORA Metrics blueprint (click to expand)</b></summary>

```json showLineNumbers
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
        "type": "number",
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
        "type": "number",
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
        "type": "number",
        "icon": "DefaultProperty",
        "description": "Days with at least one deployment."
      },
      "deploymentFrequency": {
        "title": "Deployment Frequency",
        "type": "number",
        "icon": "DefaultProperty",
        "description": "Frequency of deployments"
      },
      "leadTimeForChangesInHours": {
        "title": "Lead Time For Changes In Hours",
        "type": "number",
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
        "type": "number",
        "icon": "DefaultProperty",
        "description": "Average duration of CI/CD workflows in hours."
      },
      "timeFrameInWeeks": {
        "icon": "DefaultProperty",
        "title": "TimeFrame in Weeks",
        "type": "number",
        "description": "Timeframe for the metrics in weeks."
      },
      "numberOfUniqueDeploymentWeeks": {
        "title": "Unique Deployment Weeks",
        "type": "number",
        "icon": "DefaultProperty",
        "description": "Number of weeks with at least one deployment."
      },
      "numberOfUniqueDeploymentMonths": {
        "title": "Unique Deployment Months",
        "type": "number",
        "icon": "DefaultProperty",
        "description": "Number of months with at least one deployment."
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "service": {
      "title": "Service",
      "target": "service",
      "required": false,
      "many": false
    }
  }
}
```
</details>

## Create Github workflow

Follow these steps to get started:

1. Create the following GitHub action secrets:

    - `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `GH_PAT_CLASSIC` - [GitHub Personal Access Token (Classic)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#personal-access-tokens-classic). Ensure that the read:org and repo, scopes are set for the token to grant this action access to the repositories and teams the metrics are to be estimated for.

2. In your Github repository, create a workflow file under `.github/workflows/dora-metrics.yml` with the following content:

<details>
<summary><b>GitHub workflow: Ingest DORA Metrics (click to expand)</b></summary>

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
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install jq
        run: sudo apt-get install jq

      - name: Read Config and Output Matrix
        id: set-matrix
        run: |
          CONFIG_JSON=$(jq -c . dora/dora-config.json)
          MATRIX_JSON=$(echo $CONFIG_JSON | jq -c '{include: .}')
          echo "matrix=${MATRIX_JSON}" >> $GITHUB_OUTPUT

  compute-dora-metrics:
    needs: setup
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix: ${{fromJson(needs.setup.outputs.matrix)}}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          repository: ${{ matrix.include.repository }}
          
      - name: Transform Workflow Parameters
        run: |
          echo "TIMEFRAME_IN_DAYS=$(( ${{ matrix.timeframe }} * 7 ))" >> $GITHUB_ENV
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
          python dora/calculate_pr_metrics.py  --owner ${{ matrix.owner }} --repo "${{ matrix.repository }}" --token "${{ secrets.GH_PAT_CLASSIC }}" --time-frame ${{env.TIMEFRAME_IN_DAYS}} --platform github-actions
          
      - name: Deployment Frequency
        id: deployment_frequency
        run:  python dora/deployment_frequency.py --owner ${{ matrix.owner }} --repo "${{ matrix.repository }}" --token "${{ secrets.GH_PAT_CLASSIC }}" --workflows '${{ toJson(matrix.workflows) }}' --time-frame ${{env.TIMEFRAME_IN_DAYS}} --branch "${{ matrix.branch }}" --platform github-actions

      - name: Lead Time For Changes
        id: lead_time_for_changes
        run:  python dora/lead_time_for_changes.py --owner ${{ matrix.owner }} --repo "${{ matrix.repository }}" --token "${{ secrets.GH_PAT_CLASSIC }}" --workflows '${{ toJson(matrix.workflows) }}' --time-frame ${{env.TIMEFRAME_IN_DAYS}} --branch ${{ matrix.branch }} --platform github-actions
        

      - name: UPSERT Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: "${{ matrix.repository }}-${{env.TIMEFRAME_IN_DAYS}}"
          title: ${{ env.ENTITY_TITLE }}
          blueprint: doraMetrics
          properties: |-
            {
              "timeFrameInWeeks": ${{ matrix.timeframe }},
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
          relations: |- 
            {
            "service": "${{ matrix.repository }}"
            }
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
```

</details>

3. Create a text file (`requirements.txt`) and a json file (`dora-config.json`) in a folder named `dora` to host the required dependencies and configurations for running the workflow respectively.
<details>
  <summary><b>Requirements</b></summary>

```text showLineNumbers title="requirements.txt"
PyGithub==2.3.0
```

</details>


<details>
  <summary><b>Dora Configuration Template</b></summary>
:::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
- `<REPO-BRANCH>` - your preferred GitHub repository branch to estimate metrics on.
:::

| Name       | Description                                                                                                             | Required | Default |
|------------|-------------------------------------------------------------------------------------------------------------------------|----------|---------|
| owner      | GitHub organization or user name                                                                                        | true     | -       |
| repository | your GitHub repository name. The GitHub repository name should be represented as an entity ID in the service blueprint. | true     | -       |
| timeframe  | Time frame in weeks to calculate metrics on                                                                             | false    | 4       |
| branch     | your preferred GitHub repository branch to estimate metrics on                                                          | false    | main    |
| workflows  | An array of workflows to process. Multiple workflows can be separated by a comma (,)                                    | false    | []      |


```json showLineNumbers title="dora-config.json"
[
  {
    "owner": "<GITHUB-ORG>",
    "repository": "<GITHUB-REPO-NAME>",
    "branch": "<REPO-BRANCH>",
    "timeframe": 4,
    "workflows": ["ci.yaml","cd.yaml"]
  }
]
```
</details>

4. Create the following python scripts (`calculate_pr_metrics.py`, `deployment_frequency.py` and `lead_time_for_changes.py` ) in the folder named `dora` created earlier at the root of your GitHub repository:

<details>
  <summary><b>Calculate PR Metrics</b></summary>

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
            "number_of_unique_deployment_months": len({date.month for date in unique_dates}),
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
  <summary><b>Lead Time For Changes</b></summary>

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


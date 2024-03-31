---
sidebar_position: 10
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# DORA Metrics

In this guide, we will create a github action that computes the DORA Metrics for a service (repository) on schedule and ingests the results to Port.

## Prerequisites
1. A GitHub repository in which you can trigger a workflow that we will use in this guide.
2. A blueprint in port to host the Dora Metrics.

Below, you can find the JSON for the `DORA Metrics` blueprint required for the guide:

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
        "title": "Deployment Rating",
        "type": "string",
        "icon": "DefaultProperty",
        "description": "Qualitative rating of deployment success. e.g Elite"
      },
      "numberOfUniqueDeploymentDays": {
        "title": "Number of Unique Deployments",
        "type": "string",
        "icon": "DefaultProperty",
        "description": "Days with at least one deployment."
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
        "description": "Qualitative rating of lead time for changes, e.g Elite."
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

## Create Github workflow

Follow these steps to get started:

1. Create the following GitHub Action secrets:
    - `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `PATTOKEN` - GitHub PAT fine-grained token. Ensure that read-only access to actions and metadata permission is set. Grant this action access to the repositories where the metrics are to be estimated for . [learn more](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token).

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
        uses: actions/checkout@v2

      - name: Install jq
        run: sudo apt-get install jq

      - name: Read Config and Output Matrix
        id: set-matrix
        run: |
          CONFIG_JSON=$(jq -c . src/dora-config.json)
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
        uses: actions/checkout@v2
        with:
          repository: ${{ matrix.include.repository }}
          
      - name: Transform Workflow Parameters
        run: |
          echo "TIMEFRAME_IN_DAYS=$(( ${{ matrix.timeframe }} * 7 ))" >> $GITHUB_ENV
          cleaned_name=$(echo "${{ matrix.repository }}" | tr -c '[:alnum:]' ' ')
          TITLE=$(echo "${cleaned_name}" | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1')
          echo "ENTITY_TITLE=$TITLE" >> $GITHUB_ENV

      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.x'

      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r src/requirements.txt

      - name: Compute PR Metrics
        env:
          GITHUB_TOKEN: ${{ secrets.PATTOKEN }}
          REPOSITORY: ${{ matrix.repository }}
          OWNER: ${{ matrix.owner }}
        run: |
          python src/calculate_pr_metrics.py

      - name: Deployment Frequency
        id: deployment_frequency
        env:
          WORKFLOWS: ${{ toJson(matrix.workflows) }}
          GITHUB_TOKEN: ${{ secrets.PATTOKEN }}
          REPOSITORY: ${{ matrix.repository }}
          OWNER: ${{ matrix.owner }}
          BRANCH: ${{ matrix.branch }}
        run: python src/deploymentfrequency.py

      - name: Lead Time For Changes
        env:
          WORKFLOWS: ${{ toJson(matrix.workflows) }}
          GITHUB_TOKEN: ${{ secrets.PATTOKEN }}
          REPOSITORY: ${{ matrix.repository }}
          OWNER: ${{ matrix.owner }}
          BRANCH: ${{ matrix.branch }}
        run: python src/leadtimeforchanges.py

      - name: UPSERT Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{ fromJson(env.metrics).id }}
          title: ${{ env.ENTITY_TITLE }}
          blueprint: doraMetrics
          properties: |-
            {
              "timeFrameInWeeks": ${{ matrix.timeframe }},
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
```

</details>

3. Create a text file (`requirements.txt`) and a json file (`dora-config.json`) in a folder named `dora` to host the required dependencies and configurations for running the workflow respectively.
<details>
  <summary><b>Requirements</b></summary>

```text showLineNumbers title="requirements.txt"
PyGithub==2.3.0
loguru==0.7.2
httpx==0.27.0
```

</details>


<details>
  <summary><b>Dora Configuration Template</b></summary>
:::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
- `<REPO-BRANCH>` - your preferred GitHub repository branch to estimate metrics on.
:::

| Name                 | Description                                                                                          | Required | Default            |
|----------------------|------------------------------------------------------------------------------------------------------|----------|--------------------
| owner              | GitHub organization or user name                                                            | true    | -               |
| repository              | your GitHub repository name                                                              | true    | -               |
| timeframe              | The email address of a valid user associated with the account making the request.                                                              | false    | 4               |
| branch              | your preferred GitHub repository branch to estimate metrics on                                                              | false    | main              |
| workflows              | The workflows within the repositories branch to include in estimating the metrics                                                              | false    | []               |


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


class RepositoryMetrics:
    def __init__(self, owner, repo, time_frame):
        self.github_client = Github(os.getenv("GITHUB_TOKEN"))
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


def main():
    owner = os.getenv("OWNER")
    repo = os.getenv("REPOSITORY")
    time_frame = os.getenv("TIMEFRAME_IN_DAYS")  # os.getenv('TIME_FRAME')
    print("Repository Name:", f"{owner}/{repo}")
    print("TimeFrame (in days):", time_frame)

    repo_metrics = RepositoryMetrics(owner, repo, time_frame)
    metrics = repo_metrics.calculate_pr_metrics()

    metrics_json = json.dumps(metrics, default=str)  # Ensure proper serialization
    with open(os.getenv("GITHUB_ENV"), "a") as github_env:
        github_env.write(f"metrics={metrics_json}\n")


if __name__ == "__main__":
    main()

```
</details>

<details>
  <summary><b>Deployment Frequency</b></summary>

```python showLineNumbers title="deployment_frequency.py"
import datetime
import os
import base64
import json
import httpx
from loguru import logger
import asyncio

PAGE_SIZE = 100


class DeploymentFrequency:
    def __init__(self, owner, repo, workflows, branch, number_of_days, pat_token=""):
        self.owner, self.repo = owner, repo
        self.workflow_url = (
            f"https://api.github.com/repos/{self.owner}/{self.repo}/actions/workflows"
        )
        self.workflows = json.loads(workflows)
        self.branch = branch
        self.number_of_days = number_of_days
        self.pat_token = pat_token
        self.auth_header = self.get_auth_header

    @property
    def get_auth_header(self):
        encoded_credentials = base64.b64encode(f":{self.pat_token}".encode()).decode()
        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/json",
        }
        return headers

    async def send_api_requests(self, url, params=None):
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url, headers=self.auth_header, params=params
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error occurred: {e.response.status_code}")
            except Exception as e:
                logger.error(f"An error occurred: {e}")

    async def get_workflows(self):
        if not (self.workflows):
            workflows = await self.send_api_requests(self.workflow_url)
            if workflows:
                workflow_ids = [workflow["id"] for workflow in workflows["workflows"]]
                logger.info(f"Found {len(workflow_ids)} workflows in Repo")
                return workflow_ids
        else:
            return self.workflows

    async def fetch_workflow_runs(self):
        workflow_ids = await self.get_workflows()
        workflow_runs_list = []
        unique_dates = set()
        for workflow_id in workflow_ids:
            runs_url = f"{self.workflow_url}/{workflow_id}/runs"
            params = {"per_page": PAGE_SIZE, "status": "completed"}
            runs_response = await self.send_api_requests(runs_url, params=params)
            for run in runs_response["workflow_runs"]:
                run_date = datetime.datetime.strptime(
                    run["created_at"], "%Y-%m-%dT%H:%M:%SZ"
                )
                if run[
                    "head_branch"
                ] == self.branch and run_date > datetime.datetime.now() - datetime.timedelta(
                    days=self.number_of_days
                ):
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

    async def __call__(self):
        workflow_runs_list, unique_dates = await self.fetch_workflow_runs()
        deployments_per_day = self.calculate_deployments_per_day(workflow_runs_list)
        rating, color = self.compute_rating(deployments_per_day)

        logger.info(f"Owner/Repo: {self.owner}/{self.repo}")
        logger.info(f"Workflows: {self.workflows}")
        logger.info(f"Branch: {self.branch}")
        logger.info(f"Number of days: {self.number_of_days}")
        logger.info(
            f"Deployment frequency over the last {self.number_of_days} days is {deployments_per_day} per day"
        )
        logger.info(f"Rating: {rating} ({color})")

        return json.dumps(
            {
                "deployment_frequency": round(deployments_per_day, 2),
                "rating": rating,
                "number_of_unique_deployment_days": len(unique_dates),
                "total_deployments": len(workflow_runs_list),
            },
            default=str,
        )


if __name__ == "__main__":
    owner = os.getenv("OWNER")
    repo = os.getenv("REPOSITORY")
    pat_token = os.getenv("GITHUB_TOKEN")
    workflows = os.getenv("WORKFLOWS", "[]")
    branch = os.getenv("BRANCH", "main")
    time_frame = int(os.getenv("TIMEFRAME_IN_DAYS", 30))

    deployment_frequency = DeploymentFrequency(
        owner, repo, workflows, branch, time_frame, pat_token
    )
    report = asyncio.run(deployment_frequency())

    with open(os.getenv("GITHUB_ENV"), "a") as github_env:
        github_env.write(f"deployment_frequency_report={report}\n")
```
</details>

<details>
  <summary><b>Lead Time For Changes</b></summary>

```python showLineNumbers title="lead_time_for_changes.py"
import httpx
from datetime import datetime, timedelta, timezone
import base64
import json
import os
from loguru import logger
import asyncio

PAGE_SIZE = 100


class LeadTimeForChanges:
    def __init__(
        self,
        owner,
        repo,
        workflows,
        branch,
        number_of_days,
        commit_counting_method="last",
        pat_token="",
    ):
        self.owner = owner
        self.repo = repo
        self.workflows = json.loads(workflows)
        self.branch = branch
        self.number_of_days = number_of_days
        self.commit_counting_method = commit_counting_method
        self.pat_token = pat_token
        self.auth_header = self.get_auth_header
        self.github_url = f"https://api.github.com/repos/{self.owner}/{self.repo}"

    async def __call__(self):
        logger.info(f"Owner/Repo: {self.owner}/{self.repo}")
        logger.info(f"Number of days: {self.number_of_days}")
        logger.info(f"Workflows: {self.workflows}")
        logger.info(f"Branch: {self.branch}")
        logger.info(
            f"Commit counting method '{self.commit_counting_method}' being used"
        )

        pr_result = await self.process_pull_requests()
        workflow_result = await self.process_workflows()

        return await self.evaluate_lead_time(pr_result, workflow_result)

    @property
    def get_auth_header(self):
        encoded_credentials = base64.b64encode(f":{self.pat_token}".encode()).decode()
        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/json",
        }
        return headers

    async def send_api_requests(self, url, params=None):
        backoff_time = 1
        max_backoff_time = 60

        async with httpx.AsyncClient() as client:
            while True:
                try:
                    response = await client.get(
                        url, headers=self.auth_header, params=params
                    )

                    # Check for rate limiting (HTTP status 429)
                    if response.status_code == 429 or 403:
                        reset_time = float(response.headers.get("X-RateLimit-Reset", 0))
                        current_time = time.time()
                        wait_time = max(reset_time - current_time, 3)
                        logger.warning(
                            f"Rate limit exceeded. Waiting for {wait_time} seconds."
                        )
                        await asyncio.sleep(wait_time)
                        continue

                    response.raise_for_status()
                    return response.json()

                except httpx.HTTPStatusError as e:
                    if e.response.status_code in {500, 502, 503, 504}:
                        logger.warning(
                            f"Server error ({e.response.status_code}). Retrying in {backoff_time} seconds."
                        )
                        await asyncio.sleep(backoff_time)
                        backoff_time = min(backoff_time * 2, max_backoff_time)
                    else:
                        logger.error(f"HTTP error occurred: {e.response.status_code}")
                        break

                except Exception as e:
                    logger.error(f"An error occurred: {e}")
                    break

    async def get_pull_requests(self):
        url = f"{self.github_url}/pulls"
        params = {"state": "closed", "head": self.branch, "per_page": PAGE_SIZE}
        return await self.send_api_requests(url, params=params)

    async def process_pull_requests(self):
        prs = await self.get_pull_requests()
        pr_counter = 0
        total_pr_hours = 0
        for pr in prs:
            merged_at = pr.get("merged_at")
            if merged_at and datetime.strptime(merged_at, "%Y-%m-%dT%H:%M:%SZ").replace(
                tzinfo=timezone.utc
            ) > datetime.now(timezone.utc) - timedelta(days=self.number_of_days):
                pr_counter += 1
                commits_url = f"{self.github_url}/pulls/{pr['number']}/commits"
                params = {"per_page": PAGE_SIZE}
                commits_response = await self.send_api_requests(
                    commits_url, params=params
                )
                if commits_response:
                    if self.commit_counting_method == "last":
                        start_date = commits_response[-1]["commit"]["committer"]["date"]
                    elif self.commit_counting_method == "first":
                        start_date = commits_response[0]["commit"]["committer"]["date"]
                    start_date = datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%SZ")
                    merged_at = datetime.strptime(merged_at, "%Y-%m-%dT%H:%M:%SZ")
                    duration = merged_at - start_date
                    total_pr_hours += duration.total_seconds() / 3600
        return pr_counter, total_pr_hours

    async def get_workflows(self):
        if not (self.workflows):
            workflow_url = f"{self.github_url}/workflows"
            workflows = await self.send_api_requests(workflow_url)
            if workflows:
                workflow_ids = [workflow["id"] for workflow in workflows["workflows"]]
                logger.info(f"Found {len(workflow_ids)} workflows in Repo")
                return workflow_ids
        else:
            return self.workflows

    async def process_workflows(self):
        workflow_ids = await self.get_workflows()
        total_workflow_hours = 0
        workflow_counter = 0
        for workflow_id in workflow_ids:
            runs_url = f"{self.github_url}/actions/workflows/{workflow_id}/runs"
            params = {"per_page": PAGE_SIZE, "status": "completed"}
            runs_response = await self.send_api_requests(runs_url, params=params)
            for run in runs_response["workflow_runs"]:
                if run["head_branch"] == self.branch and datetime.strptime(
                    run["created_at"], "%Y-%m-%dT%H:%M:%SZ"
                ).replace(tzinfo=timezone.utc) > datetime.now(timezone.utc) - timedelta(
                    days=self.number_of_days
                ):
                    workflow_counter += 1
                    start_time = datetime.strptime(
                        run["created_at"], "%Y-%m-%dT%H:%M:%SZ"
                    )
                    end_time = datetime.strptime(
                        run["updated_at"], "%Y-%m-%dT%H:%M:%SZ"
                    )
                    duration = end_time - start_time
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

    async def evaluate_lead_time(self, pr_result, workflow_result):
        pr_counter, total_pr_hours = pr_result
        workflow_counter, total_workflow_hours = workflow_result
        if pr_counter == 0:
            pr_counter = 1
        if workflow_counter == 0:
            workflow_counter = 1
        pr_average = total_pr_hours / pr_counter
        workflow_average = total_workflow_hours / workflow_counter
        lead_time_for_changes_in_hours = pr_average + workflow_average
        logger.info(f"PR average time duration: {pr_average} hours")
        logger.info(f"Workflow average time duration: {workflow_average} hours")
        logger.info(f"Lead time for changes in hours: {lead_time_for_changes_in_hours}")

        report = {
            "pr_average_time_duration": round(pr_average, 2),
            "workflow_average_time_duration": round(workflow_average, 2),
            "lead_time_for_changes_in_hours": round(lead_time_for_changes_in_hours, 2),
        }
        rating = self.calculate_rating(lead_time_for_changes_in_hours)
        report.update(rating)

        return json.dumps(report, default=str)


if __name__ == "__main__":
    owner = os.getenv("OWNER")
    repo = os.getenv("REPOSITORY")
    token = os.getenv("GITHUB_TOKEN")  # Your personal access token or GitHub App token
    workflows = os.getenv("WORKFLOWS", "[]")
    branch = os.getenv("BRANCH", "main")
    time_frame = int(os.getenv("TIMEFRAME_IN_DAYS", 30))

    lead_time_for_changes = LeadTimeForChanges(
        owner, repo, workflows, branch, time_frame, pat_token=token
    )
    report = asyncio.run(lead_time_for_changes())
    with open(os.getenv("GITHUB_ENV"), "a") as github_env:
        github_env.write(f"lead_time_for_changes_report={report}\n")
```
</details>

5. Congrats 🎉 You've successfully scheduled a github action to periodically ingest estimated `DORA Metrics` for github repository(s).

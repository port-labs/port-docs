import os
import re
from github import Github
import datetime
import json
import logging
import argparse

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class TeamMetrics:
    def __init__(self, owner, repo, timeframe, team_name, pat_token):
        self.github_client = Github(pat_token)
        self.repo_name = f"{owner}/{repo}"
        self.team_name = team_name
        self.team_slug = self.convert_to_slug(team_name)
        self.timeframe = int(timeframe)
        self.start_date = datetime.datetime.now(datetime.UTC).replace(
            tzinfo=datetime.timezone.utc
        ) - datetime.timedelta(days=self.timeframe)
        self.repo = self.github_client.get_repo(f"{self.repo_name}")
        self.team = self.get_team_info(owner, self.team_slug)

    def convert_to_slug(self, name):
        """Convert a team name to a slug by replacing spaces with hyphens and lowercasing."""
        slug = re.sub(r'\s+', '-', name.strip()).lower()
        logging.info(f"Converted team name '{name}' to slug '{slug}'")
        return slug

    def get_team_info(self, owner, team_slug):
        org = self.github_client.get_organization(owner)
        try:
            team = org.get_team_by_slug(team_slug)
            return {
                "team_id": team.id,
                "team_name": team.name,
                "team_description": team.description,
                "team_members_count": team.members_count,
                "team_repos_count": team.repos_count,
            }
        except Exception as e:
            logging.error(f"Error fetching team info for slug '{team_slug}': {e}")
            raise

    def calculate_metrics(self):
        prs = self.repo.get_pulls(state="all", sort="created", direction="desc")
        response_rate = self.calculate_response_rate(prs)
        response_time = self.calculate_response_time(prs)
        metrics = {**response_rate, **response_time}
        return metrics

    def calculate_response_rate(self, prs):
        total_requests = 0
        responded_requests = 0

        for pr in prs:
            if pr.created_at >= self.start_date:
                total_requests += 1
                if pr.get_reviews().totalCount > 0:
                    responded_requests += 1

        response_rate = (responded_requests / total_requests) * 100 if total_requests else 0

        return {f"{self.team_slug}_response_rate": round(response_rate, 2)}

    def calculate_response_time(self, prs):
        total_response_time = datetime.timedelta(0)
        total_responses = 0

        for pr in prs:
            if pr.created_at >= self.start_date:
                reviews = pr.get_reviews()
                for review in reviews:
                    if review.user.login == self.team_slug:
                        response_time = review.submitted_at - pr.created_at
                        total_response_time += response_time
                        total_responses += 1
                        break

        average_response_time = self.timedelta_to_decimal_hours(
            total_response_time / total_responses
        ) if total_responses else 0

        return {f"{self.team_slug}_average_response_time": average_response_time}

    def timedelta_to_decimal_hours(self, td):
        return round(td.total_seconds() / 3600, 2)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Calculate Team Metrics for Pull Requests.')
    parser.add_argument('--owner', required=True, help='Owner of the repository')
    parser.add_argument('--repo', required=True, help='Repository name')
    parser.add_argument('--token', required=True, help='GitHub token')
    parser.add_argument('--timeframe', type=int, default=30, help='Timeframe in days')
    parser.add_argument('--team_name', required=True, help='Team name to calculate metrics for')
    parser.add_argument('--platform', default='github-actions', choices=['github-actions', 'self-hosted'], help='CI/CD platform type')
    args = parser.parse_args()

    logging.info(f"Repository Name: {args.owner}/{args.repo}")
    logging.info(f"TimeFrame (in days): {args.timeframe}")
    logging.info(f"Team Name: {args.team_name}")

    try:
        team_metrics = TeamMetrics(args.owner, args.repo, args.timeframe, args.team_name, pat_token=args.token)
        metrics = team_metrics.calculate_metrics()
        metrics["team_info"] = team_metrics.team  # Include team information in the response payload
        metrics_json = json.dumps(metrics, default=str)
        print(metrics_json)
    except Exception as e:
        logging.error(f"An error occurred: {e}")

    if args.platform == "github-actions":
        with open(os.getenv("GITHUB_ENV"), "a") as github_env:
            github_env.write(f"metrics={metrics_json}\n")

---
title: Improve lead time
sidebar_position: 5
---

# Improve lead time

Lead time for changes is a DORA metric that focuses how long it takes for a desired change to go from initial commit to being successfully deployed in production. Reducing lead time enables faster delivery of value to customers and quicker feedback loops for product teams to test their ideas. In theory (all other things being equal), this leads to higher quality software and increased business agility. By optimizing lead time, organizations can respond more rapidly to market demands.

Lead time is made up of coding time, review time and then integration/deployment time. We will dig into where a developer portal can help you across each of these categories.

![Lead time for change](/img/solutions/engineering-360/lead-time-for-change.png)

## Improve coding time 

While coding time is best optimized through stable and detailed requirements, a good development platform and AI enhanced developement tools, the data in the software catalog has a role to play.

Port can enhance the detail on your tasks, through a task-assistance AI Agent:

- [Enrich task with AI](/guides/all/enrich-tasks-with-ai/)

## Improve review time

Review is typically the greatest bottleneck and contributor to long lead times. 
Changes are still a pain to integrate. We want to protect production from risk, and make sure that the changes meet our standards and will be maintainable for the team in the future.

There are a few ways that Port can help:

### Chase PR reviewers

Sometimes, it's just a matter of our developers having a small context window, or being in the wrong chat session without enhanced memory. A simple reminder works for overdue bills, and it works for chasing PR reviews too.

- [Self-service action to nudge PR reviewers](/guides/all/nudge-pr-reviewers/)
- [Automated Slack alert for overdue PRs](/guides/all/automate-slack-alert-for-overdue-prs/)

### Avoid wasted time around PRs not meeting conventions 

Standards are important. Teams need to agree on the right detail to include on a PR to make it reviewable by others. 
However, the last thing engineering leaders want to see are lengthy back and forth threads on a PR, detailing missing details that need to be added before someone starts a review.
For this, it is useful to measure PR standards, to ensure teams are aligned on the "right way" and can self-govern their own PRs, for a faster pickup from reviewers.

- [Working agreements and measuring PR standards](/guides/all/working_agreements_and_measuring_pr_standards/)
- [Track and enforce GitLab project maturity](/guides/all/track-gitlab-project-maturity-with-scorecards/)

### Enrich pull-requests with catalog context to decrease review time

To a developer looking at tens of Pull Requests that are awaiting their review, all may appear equal.
However, many factors could influence what order they perform reviews, or how long they spend on each, for example:
- How long the PR has been open.
- Whether the PR relates to a serious bug or customer escalation.
- Architectural complexity, or other risk factors around the related components that may affect the level of detail on the review.
- Criticality of the system, or whether the change relates to an important user flow.

Adding this context can help developers prioritize their efforts better

- [Setup PR enricher agent](/guides/all/setup-pr-enricher-ai-agent/)

### Optionally auto-approve and merge some changes

It could be that there is simply too much to review. Perhaps with a mature development platform, monitoring and incident management capabilities, your team will gain the comfort to auto approve and merge a subset of changes, creating focus on other changes that should be reviewed.

- [Auto-approve and merge dependabot PRs](/guides/all/auto-approve-and-merge-dependabot-prs/)

## Improve deployment time

Once a pull request is merged, the change is integrated, but not yet in production.
Often, the software needs to be rebuilt, deployed, promoted (once, twice, sometimes even thrice) and sometimes tested along the way. Many issues along the way can lead to deployments that take tens of minutes or even over an hour to complete. Environment preparation, creation of requisite cloud infrastructure, flaky end-to-end tests, approvals and other factors can cause delays. 

It's worth tracking deployment times across pipelines and looking for outliers. Remember that slow deployments don't just affect lead time, but MTTR too, where fast deployments contribute to faster resolution to incidents that require code changes.

- [Pull Request and build metrics](/guides/all/pull-github-metrics-and-build-visualizations)
- [Track GitLab Deployments](/guides/all/visualize-and-manage-gitlab-deployments/)

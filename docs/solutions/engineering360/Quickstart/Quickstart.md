# Quickstart
Ready to get started with Engineering360? This quickstart guide will walk you through setting up DORA metrics and developer surveys in Port. We’ll cover the basic setup steps, prerequisites, and how to see your data flowing in. By the end, you’ll have all the foundational components in place and your Engineering360 dashboards up and running.

## DORA Metrics
### Prerequisites
Before installing Engineering360 DORA metrics components, ensure the following prerequisites are in place:
- Admin permissions (in order to install the experience and execute self-service actions).
- A connected GitHub integration (for deployment tracking) or access to custom API setup.
- A connected PagerDuty integration (for incident tracking) or access to custom API setup.

### Install the experience

1. Go to your software catalog.

2. Click on the + New button in the left sidebar, then choose New experience.

3. In the modal, choose New DORA metrics dashboard.

4. Choose a title for your dashboard and click Create.

*put here image*

### Configure your deployments & incidents
After installation, you need to:

1. Configure Deployments:

- Choose the relevant deployment method according to your organization's definition of a deployment (Merged PRs, GitHub Workflows, GitHub Releases, Github Deployments, Custom API, etc).
- Apply filters (target branch, PR labels, etc) to align with your process.

2. Configure Incidents:

- Choose the relevant incident method according to your organization's definition of an incident (PagerDuty, Custom API, etc).
- Connect to a source like PagerDuty or configure via Custom API.

### Track results
Navigate to the DORA metrics dashboard created in the "DORA setup & dashboard" folder in your software catalog.

Once your data starts accumulating, you will see visualized metrics including:

- Deployment frequency.
- Lead time for changes.
- Mean time to recovery (MTTR).
- Change failure rate.

These metrics give you a high-level view of your engineering velocity and reliability, helping your team identify areas for improvement.


## Surveys
### Prerequisites
Before installing Engineering360 surveys components, ensure the following prerequisites are in place:
- Admin permissions (in order to install the experience and execute self-service actions).
- A communication channel (e.g., Slack, email) to distribute survey links.

### Install the experience

1. Go to your software catalog.

2. Click on the + New button in the left sidebar, then choose New experience.

3. In the modal, choose New Survey.

4. Choose a survey type and give it a unique identifier (this will allow you to run this survey multiple times and track its results over time).

*put here image*

### Configure & distribute the survey
After installation, you need to:

1. Adjust Survey Visibility:

- Go to the self-service page of your portal.
- Find the survey, then click the ... button and select Edit.
- Go to the Permissions tab and configure who can respond to the survey (i.e. who can execute this action)

2. Distribute the Survey:

- Hover over the action card, then click on the chain icon to copy the link to the survey.

*put here image*

### View results
Navigate to the survey dashboard created in the "DORA setup & dashboard" folder in your software catalog.

Once responses are submitted, you'll see developer sentiment and trends visualized in real time.

*put here image*

These insights help platform and engineering teams understand friction points, monitor developer experience, and prioritize where to invest future resources.



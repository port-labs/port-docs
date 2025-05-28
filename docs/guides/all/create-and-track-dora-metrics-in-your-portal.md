---
sidebar_position: 11
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Create & track DORA metrics in your portal

<center>
<iframe width="568" height="320" src="https://www.youtube.com/embed/Tnef7-mdKes" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>
</center><br/>

This guide will walk you through the setup and use of DORA metrics in your portal.  
We will learn how to configure DORA metrics, track them, and view insights to drive engineering improvements.

This guide sets up all the foundational components and works out of the box with [GitHub](/build-your-software-catalog/sync-data-to-catalog/git/github/) and [PagerDuty](/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty/) integrations. 

If you define GitLab as your preferred deployment method, complete this guide, then proceed to the [GitLab guide](/guides/all/set-up-deployments-dora-gitlab) to adjust the relevant components.

If you define Jira issues as your preferred deployment and incident method, complete this guide, then proceed to the [Jira guide](/guides/all/setup-dora-metrics-jira) to adjust the relevant components.

## Port DORA metrics overview

The DORA Metrics experience helps you track the four key engineering performance indicators: **Deployment frequency**, **Lead time for changes**, **Mean time to recovery (MTTR)**, and **Change failure rate**.  

This experience provides:
- A prebuilt setup for collecting DORA metrics.
- Flexible configuration of what counts as deployments and incidents.
- Automated data ingestion via integrations and APIs.
- A centralized dashboard for visibility and insights.

### New components

When you install the DORA Metrics experience, Port automatically generates the following components to help you configure, ingest, and visualize your engineering performance data:

<h4> Blueprints </h4>
- `Deployment` and `Incident` — the main components used to calculate your DORA metrics.

<h4> Dashboard pages </h4>
- `Set up your deployments` — A dashboard page to define what qualifies as a *deployment* in your organization.
- `Set up your incidents` — A dashboard page to define what qualifies as an *incident* in your organization.
- `DORA metrics` — A dashboard page that helps you track your organization's engineering performance over time.

<h4> Self-service actions </h4>
- `Create a deployment` — an action that creates a deployment.  
  By default, the dashboard page will contain multiple actions to create a deployment, one for each definition of a deployment.
- `Create an incident` — an action that creates an incident.  
  By default, the dashboard page will contain multiple actions to create an incident, one for each definition of an incident.

<h4> Integration mapping </h4>
When a user executes the self-service action to define deployments or incidents, the relevant [integration mapping](/build-your-software-catalog/customize-integrations/configure-mapping) (according to the selected deployment/incident method) is updated with a new block.  

This automates a manual step that would otherwise require editing the integration mapping directly.  

*Note:* filters in the action use an `AND` operator. To achieve `OR` logic, run the action multiple times with different filter sets.

<h4> Additional components </h4>

Port also creates supporting technical mechanisms to ensure stable and reliable data ingestion:
- **Blueprints** — Used to avoid accidental data loss during resyncs.  
  For example, closed pull requests are deleted on resync by default to avoid ingesting historical data.  
  To preserve relevant data:
  - Closed PRs are first ingested into a hidden `_deployment_event` blueprint.
  - An automation that upserts the data into the main `Deployment` blueprint.
  - This ensures only the hidden blueprint is affected by resync deletions.

- **Automations** — Ensure reliable data flow from configuration to ingestion:

  - Your self-service actions define how deployments and incidents are tracked.
  - These definitions update integration mappings, which ingest data into hidden blueprints.
  - Automations then upsert that data into the main blueprints, protecting it from resync deletions.


## Prerequisites
To set up DORA metrics in your portal, you will need:

- Admin permissions (in order to install the experience and execute self-service actions).
- A connected GitHub integration (for deployment tracking) or access to custom API setup.
- A connected PagerDuty integration or access to custom API setup.

## Set up DORA metrics
1. Go to your [software catalog](https://app.getport.io/organization/catalog).

2. Click on the `+ New` button in the left sidebar, then choose `New experience`.

3. In the modal, choose `New DORA metrics dashboard`.

4. Choose a title for your dashboard and click `Create`.

    <img src='/img/guides/doraChooseName.png' width='60%' border='1px' />

## Configure your deployments & incidents

After installation, you need to:
1. **Configure Deployments:**  
     - Choose the relevant deployment method according to your organization's definition of a deployment (Merged PRs, GitHub Workflows, GitHub Releases, Github Deployments, Custom API, etc).
     - Apply filters (target branch, PR labels, etc) to align with your process.

2. **Configure Incidents:**
     - Choose the relevant incident method according to your organization's definition of an incident (PagerDuty, Custom API, etc).
     - Connect to a source like PagerDuty or configure via Custom API.

## Track results

Navigate to the DORA metrics dashboard created in the "DORA setup & dashboard" folder in your [software catalog](https://app.getport.io/organization/catalog).  

Once your data starts accumulating, you will see visualized metrics including:
- Deployment frequency.
- Lead time for changes.
- Mean time to recovery (MTTR).
- Change failure rate.

These metrics give you a high-level view of your engineering velocity and reliability, helping your team identify areas for improvement.

<img src='/img/guides/doraDashboardExample.png' width='80%' border='1px' />
# What gets installed

When you set up Engineering360 in Port, you get a complete “starter kit” built from Port’s core building blocks: blueprints, dashboards, actions, and automations. Think of it as an API for engineering intelligence—out of the box, you can track DORA metrics and collect developer sentiment with ready-made components. This foundation is fully customizable, so you can extend, automate, and adapt every part to fit your unique engineering workflows.

In this section, you’ll find guides to what gets installed, how to integrate and customize each building block, and ways to unlock even more value from your Engineering360 starter kit.

### DORA metrics
This experience provides:
- A prebuilt setup for collecting DORA metrics.
- Flexible configuration of what counts as deployments and incidents.
- Automated data ingestion via integrations and APIs.
- A centralized dashboard for visibility and insights.

When you install the DORA Metrics experience, Port automatically generates the following components to help you configure, ingest, and visualize your engineering performance data:

#### Blueprints
`Deployment` and `Incident` — the main components used to calculate your DORA metrics.
#### Dashboard pages
`Set up your deployments` — A dashboard page to define what qualifies as a deployment in your organization.
`Set up your incidents` — A dashboard page to define what qualifies as an incident in your organization.
`DORA metrics` — A dashboard page that helps you track your organization's engineering performance over time.
#### Self-service actions
`Create a deployment` — an action that creates a deployment.
* By default, the dashboard page will contain multiple actions to create a deployment, one for each definition of a deployment.
`Create an incident` — an action that creates an incident.
* By default, the dashboard page will contain multiple actions to create an incident, one for each definition of an incident.
#### Integration mapping
When a user executes the self-service action to define deployments or incidents, the relevant integration mapping (according to the selected deployment/incident method) is updated with a new block.
This automates a manual step that would otherwise require editing the integration mapping directly.
:::Note:
filters in the action use an AND operator. To achieve OR logic, run the action multiple times with different filter sets.
:::
#### Additional components
Port also creates supporting technical mechanisms to ensure stable and reliable data ingestion:
#### Blueprints    — Used to avoid accidental data loss during resyncs.
For example, closed pull requests are deleted on resync by default to avoid ingesting historical data.
To preserve relevant data:
Closed PRs are first ingested into a hidden `_dora_deployment_event` blueprint.
An automation that upserts the data into the main `Deployment` blueprint.
This ensures only the hidden blueprint is affected by resync deletions.
#### Automations — Ensure reliable data flow from configuration to ingestion:
Your self-service actions define how deployments and incidents are tracked.
These definitions update integration mappings, which ingest data into hidden blueprints.
Automations then upsert that data into the main blueprints, protecting it from resync deletions.
### Surveys
When you set up a survey, Port automatically creates the following components to enable survey distribution and feedback collection:
#### Blueprints
These blueprints model the survey data and are only created the first time you install a survey:        
`Survey Template` — Defines the structure of a survey that can be reused multiple times.        
`Survey` — Represents each instance of a survey template.       
`Question Template` — Defines reusable question formats like "text" or "selection".     
`Question` — Contains the actual questions being asked in a particular survey.      
`Response` — Stores individual survey responses submitted by users.

#### Self-service action
A self-service action will be created for each survey instance.
This action allows developers to respond to the survey.

You can control who can respond to the survey via the action's permissions.

#### Dashboard page
Visualizes survey submissions and aggregates trends in developer sentiment.

#### Additional resources
To capture responses, the experience also includes a webhook data source that ingests survey responses when submitted via the self-service action.


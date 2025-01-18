---
displayed_sidebar: null
title: Automate the Onboarding of Services, Workloads, and Environments
description: Create an ongoing, real-time software catalog by automatically populating Port with data from your integrated tools.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Automate the Onboarding of Services, Workloads, and Environments

This guide outlines how to **automatically** onboard services, workloads, and environments into Port’s **software catalog** based on data from your connected tools (e.g., Jira, PagerDuty, Kubernetes, etc.).   
By leveraging **Port’s integrations** and **custom automations**, you can keep your catalog up to date **in real time**—no more manual entries!

## Prerequisites

- You’ve set up **integrations** for the tools selected during onboarding. Port supports various [plug & play integrations](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/#available-plug--play-integrations) such as:
   - [Jira](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/jira/)
   - [PagerDuty](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty/)
   - [Kubernetes](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/kubernetes/)
   - And many more…
- You have [blueprints](https://docs.port.io/build-your-software-catalog/blueprints/) in Port (or plan to create them) for **service**, **workload**, and **environment** entities.
- (Optional) If you want **Slack notifications** or other external calls, make sure you’ve configured the relevant webhook or Slack app with the appropriate scopes.

## Data Model Setup

Before automating the onboarding process, ensure your blueprints capture the right data and relationships. For example:

### 1. Service Blueprint

If you don’t already have a `service` blueprint, create one or edit an existing one in the [Port Builder](https://app.getport.io/settings/data-model). A `service` blueprint might look like this (simplified example):

```json
{
  "title": "Service",
  "properties": {
    "description": {
      "type": "string",
      "title": "Description"
    }
  },
  "relations": {
    "jira_project": {
      "title": "Jira Project",
      "type": "relation",
      "target": "jiraProject"
    },
    "pager_duty_service": {
      "title": "PagerDuty Service",
      "type": "relation",
      "target": "pagerdutyService"
    }
  }
}
```

:::tip
You can add additional properties or relations for GitHub repositories, OpsGenie services, etc. The exact schema depends on your organization’s needs.
:::

2. Workload Blueprint

A workload blueprint might represent runtime workloads—like Kubernetes deployments or other deployable components:

<details>
<summary>Workload Blueprint (click to expand)</summary>

```json
{
  "title": "Workload",
  "properties": {
    "version": {
      "type": "string",
      "title": "Version"
    }
  },
  "relations": {
    "service": {
      "title": "Service",
      "type": "relation",
      "target": "service"
    },
    "environment": {
      "title": "Environment",
      "type": "relation",
      "target": "environment"
    }
  }
}
```
</details>


3. Environment Blueprint

If you want to track environments (AWS accounts, Kubernetes clusters, etc.), you might have a blueprint called environment:

{
  "title": "Environment",
  "properties": {
    "region": {
      "type": "string",
      "title": "Region"
    }
  },
  "relations": {
    "aws_account": {
      "title": "AWS Account",
      "type": "relation",
      "target": "awsAccount"
    },
    "k8s_cluster": {
      "title": "K8s Cluster",
      "type": "relation",
      "target": "k8s_cluster"
    }
  }
}

Ingest Data from Tools

With the relevant blueprints set up, you can configure each integration to ingest data:
	•	Jira → jiraProject blueprint entities
	•	PagerDuty → pagerdutyService blueprint entities
	•	Kubernetes → k8sDeployment or k8sService blueprint entities
	•	etc.

To do this, navigate to Data Sources in Port and configure each tool. Refer to each tool’s documentation for details.

:::tip
At this point, you should see incoming entities (e.g., jiraProject, pagerdutyService) in Port that we can now use to create or update our service, workload, and environment entities.
:::

Automation Setup

Below, we provide JSON examples of Automations that automatically create or update your catalog’s entities (services, workloads, environments) whenever new items appear from integrated tools. The concept is:
	1.	Trigger: Something like on ENTITY create (for new jiraProject, pagerdutyService, k8sDeployment, etc.)
	2.	Action: Upsert a service, workload, or environment entity to match your blueprint data model.

Automation Example: Create a Service from Jira Projects

Use this to auto-create a service entity in Port each time a new jiraProject entity is synced:

<details>
<summary>Automation JSON (click to expand)</summary>


{
   "identifier": "autoServiceFromJiraProject",
   "title": "Create or Update Service from Jira Project",
   "description": "Whenever a new jiraProject is created, create or update a Service entity in Port.",
   "trigger": {
      "type": "ENTITY",
      "condition": {
         "blueprint": "jiraProject",
         "operation": "create"
      }
   },
   "invocationMethod": {
      "type": "HTTP",
      "method": "POST",
      "url": "/v1/blueprints/service/entities",
      "body": {
         "identifier": "${event.payload.entity.identifier}",
         "title": "${event.payload.entity.title}",
         "properties": {
            "description": "${event.payload.entity.properties.description}"
         },
         "relations": {
            "jira_project": "${event.payload.entity.identifier}"
         }
      }
   },
   "publish": true
}

</details>


Explanation
	•	Trigger: On jiraProject create events in Port.
	•	Action: Creates a new service entity (or updates if one exists with the same identifier).
	•	Relations: The new service references its corresponding Jira project via the jira_project relation.

Automation Example: Create a Service from PagerDuty Services

If PagerDuty was one of the selected tools, you might define a similar automation for new pagerdutyService entities:

<details>
<summary>Automation JSON (click to expand)</summary>


{
   "identifier": "autoServiceFromPagerduty",
   "title": "Create or Update Service from PagerDuty",
   "description": "Whenever a new pagerdutyService is created, create or update a Service entity in Port.",
   "trigger": {
      "type": "ENTITY",
      "condition": {
         "blueprint": "pagerdutyService",
         "operation": "create"
      }
   },
   "invocationMethod": {
      "type": "HTTP",
      "method": "POST",
      "url": "/v1/blueprints/service/entities",
      "body": {
         "identifier": "${event.payload.entity.identifier}",
         "title": "${event.payload.entity.title}",
         "properties": {
            "description": "${event.payload.entity.properties.description}"
         },
         "relations": {
            "pager_duty_service": "${event.payload.entity.identifier}"
         }
      }
   },
   "publish": true
}

</details>


Explanation
	•	Trigger: On pagerdutyService entity creation.
	•	Action: Creates/updates a service in Port, linking the PagerDuty service to the pager_duty_service relation.

Automation Example: Create a Workload from K8s Deployments

If Kubernetes was selected during onboarding, you can have an automation to create workload entities each time a k8sDeployment is ingested:

<details>
<summary>Automation JSON (click to expand)</summary>


{
   "identifier": "autoWorkloadFromK8s",
   "title": "Create or Update Workload from K8s Deployment",
   "description": "Whenever a new k8sDeployment is created, create or update a Workload entity in Port.",
   "trigger": {
      "type": "ENTITY",
      "condition": {
         "blueprint": "k8sDeployment",
         "operation": "create"
      }
   },
   "invocationMethod": {
      "type": "HTTP",
      "method": "POST",
      "url": "/v1/blueprints/workload/entities",
      "body": {
         "identifier": "${event.payload.entity.identifier}",
         "title": "${event.payload.entity.title}",
         "properties": {
            "version": "${event.payload.entity.properties.version}"
         },
         "relations": {
            "service": "${event.payload.entity.properties.serviceId}",
            "environment": "${event.payload.entity.properties.environmentId}"
         }
      }
   },
   "publish": true
}

</details>


Explanation
	•	Trigger: On k8sDeployment creation in Port (assuming your integration maps K8s deployments to the k8sDeployment blueprint).
	•	Action: Upserts a workload entity, transferring relevant properties (e.g., version, replicas) and linking to the parent service and/or environment.

Automation Example: Create an Environment from AWS Accounts

If you also integrated AWS or any other infrastructure tool, you can set up an automation for awsAccount or cloudEnvironment blueprint:

<details>
<summary>Automation JSON (click to expand)</summary>


{
   "identifier": "autoEnvironmentFromAWS",
   "title": "Create or Update Environment from AWS Account",
   "description": "Whenever a new awsAccount is created, create or update an Environment in Port.",
   "trigger": {
      "type": "ENTITY",
      "condition": {
         "blueprint": "awsAccount",
         "operation": "create"
      }
   },
   "invocationMethod": {
      "type": "HTTP",
      "method": "POST",
      "url": "/v1/blueprints/environment/entities",
      "body": {
         "identifier": "${event.payload.entity.identifier}",
         "title": "${event.payload.entity.title}",
         "properties": {
            "region": "${event.payload.entity.properties.defaultRegion}"
         },
         "relations": {
            "aws_account": "${event.payload.entity.identifier}"
         }
      }
   },
   "publish": true
}

</details>


Explanation
	•	Trigger: On awsAccount creation in Port.
	•	Action: Creates or updates an environment entity referencing the AWS account.

Putting It All Together

With these Automations:
	1.	Jira → automatically creates or updates a service entity whenever a new Jira Project (jiraProject) is synced.
	2.	PagerDuty → similarly creates or updates a service for each PagerDuty service.
	3.	Kubernetes → creates or updates a workload for each K8s resource you choose to map (deployments, pods, etc.).
	4.	AWS (or other infra) → creates or updates an environment entity when a new account or environment is discovered.

Establishing Relationships

In your blueprint definitions, add or refine relations so that services, workloads, and environments properly reference each other. For instance, if your K8s deployment references a service by name, ensure your automation sets relations.service to that matching name or identifier.

Handling Edge Cases
	•	If multiple tools refer to the same service, you may want additional logic to unify them (e.g., standard naming or checking if a service with that name already exists).
	•	If a new environment is partially discovered by different integrations (AWS, K8s), you might update an existing environment entity rather than creating a new one.

Example Slack Notification (Optional)

You can also configure Slack or other chat tools to alert you when a new service, workload, or environment is created. For example, you might have an Automation triggered by entity.create that sends a Slack message with the new entity details:

{
   "identifier": "slackAlertNewService",
   "title": "Alert Slack on New Service",
   "description": "Sends a Slack message when a new Service is created in Port.",
   "trigger": {
      "type": "ENTITY",
      "condition": {
         "blueprint": "service",
         "operation": "create"
      }
   },
   "invocationMethod": {
      "type": "WEBHOOK",
      "url": "https://hooks.slack.com/services/<YOUR_WEBHOOK>",
      "body": {
         "text": "A new Service has been created: *${event.payload.entity.title}*"
      }
   },
   "publish": true
}

This is entirely optional, but it showcases how you can send notifications to your team whenever certain events happen in Port.

Conclusion

By configuring these integrations, blueprints, and automations, you can maintain a real-time software catalog in Port. Every time a new project or resource appears in your environment—whether in Jira, PagerDuty, Kubernetes, AWS, or another tool—Port will automatically create or update the corresponding entity and link it to the right relationships.

This eliminates repetitive manual onboarding steps and ensures everyone has an up-to-date view of services, workloads, and environments in your organization.




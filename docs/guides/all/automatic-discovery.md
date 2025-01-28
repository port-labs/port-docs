---
displayed_sidebar: null
title: Set up automatic discovery
description: Create an ongoing, real-time software catalog by automatically populating Port with data from your integrated tools.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"


# Set up automatic discovery

This guide will walk you through automating the onboarding of services, workloads, and environments into Port’s software catalog.

Once implemented:
- Services, workloads, and environments will be automatically added to your catalog based on data from connected tools (e.g., Jira, PagerDuty, Kubernetes, etc.).
- The catalog will stay up to date in real time, eliminating the need for manual entries through Port’s integrations and custom automations.

## Common use cases
- Automatically onboard new services, workloads, or environments as they are created in connected tools like Jira, PagerDuty, or Kubernetes.
- Ensure your software catalog reflects the latest changes in your infrastructure without manual intervention.
- Simplify management by standardizing and centralizing service and workload metadata, ensuring consistency and accessibility across all teams.
- Enable real-time visibility into your organization’s services, workloads, and environments for better decision-making.

## Prerequisites

Before setting up automatic discovery, ensure the following prerequisites are met:

- You’ve installed **integrations** for the tools selected during onboarding. Port supports various [plug & play integrations](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/#available-plug--play-integrations) such as:
    - [Jira](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/jira/)
    - [PagerDuty](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty/)
    - [Kubernetes](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/kubernetes/)


## Set up data model

To onboard services, workloads, and environments into your catalog, this guide leverages on the default blueprints provided during onboarding. These include:

- Service: Represents the core components of your software catalog.
- Workload: Defines the operational aspects associated with your services.
- Environment: Tracks deployment environments such as staging, production, or development.

💡 **Reminder:**  
Ensure  the  Jira,  PagerDuty and Kubernetes integration are installed. This allows you to relate various entities with their relevant blueprints.

## Create automations

Next let's  create the automations to automatically create or update services, workloads, and environments in Port whenever an entity is upserted from an integrated tool.

:::tip Adding automations
1. **Go to the [Automations](https://app.getport.io/settings/automations)** page in your Port portal.
2. **Click on "+ Automation"** to add a new automation.
3. **Add this JSON schema** to define the logic for your automation.

By following these steps, you can paste and manage the JSON schema required to create automations in Port.
:::

### Onboard service from Jira

Use this automation to auto-create a service entity in Port each time a new Jira project entity is synced:

<details>
<summary><b> Onboard service from jira automation (Click to expand)</b></summary>

```json showLineNumbers
   {
  "identifier": "onboard_new_service_from_jira",
  "title": "Onboard New Service from Jira Project",
  "icon": "Microservice",
  "description": "Automatically creates a new service entity when a Jira project is created",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_CREATED",
      "blueprintIdentifier": "jiraProject"
    }
  },
  "invocationMethod": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "service",
    "mapping": {
      "identifier": "{{ .event.diff.after.identifier }}_service",
      "title": "{{ .event.diff.after.title }} Service",
      "properties": {
        "description": "Automatically created from Jira project {{ .event.diff.after.title }}"
      },
      "relations": {
        "jiraProject": "{{ .event.diff.after.identifier }}"
      }
    }
  },
  "publish": true
}
```
</details>

Take note that you can enrich your service blueprint with additional properties that relate to the Jira project entity.




### Onboard service from PagerDuty

Use this automation to auto-create a service entity in Port each time a new PagerDuty service entity is synced:

<details>
<summary><b>Onboard service from pagerduty automation (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "onboard_service_from_pagerduty",
  "title": "Onboard New Service from PagerDuty",
  "icon": "Microservice",
  "description": "Automatically creates a new service entity when a PagerDuty service is created",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_CREATED",
      "blueprintIdentifier": "pagerdutyService"
    }
  },
  "invocationMethod": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "service_rep",
    "mapping": {
      "identifier": "{{ .event.diff.after.identifier }}_service",
      "title": "{{ .event.diff.after.title }} Service",
      "relations": {
        "pagerdutyService": "{{ .event.diff.after.identifier }}"
      }
    }
  },
  "publish": true
}

```
</details>

Take note that you can enrich your service blueprint with additional properties that relate to the PagerDuty service entity.





[//]: # (Automation Example: Create a Workload from K8s Deployments)

[//]: # ()
[//]: # (If Kubernetes was selected during onboarding, you can have an automation to create workload entities each time a k8sDeployment is ingested:)

[//]: # ()
[//]: # (<details>)

[//]: # (<summary>Automation JSON &#40;click to expand&#41;</summary>)

[//]: # ()
[//]: # ()
[//]: # ({)

[//]: # (   "identifier": "autoWorkloadFromK8s",)

[//]: # (   "title": "Create or Update Workload from K8s Deployment",)

[//]: # (   "description": "Whenever a new k8sDeployment is created, create or update a Workload entity in Port.",)

[//]: # (   "trigger": {)

[//]: # (      "type": "ENTITY",)

[//]: # (      "condition": {)

[//]: # (         "blueprint": "k8sDeployment",)

[//]: # (         "operation": "create")

[//]: # (      })

[//]: # (   },)

[//]: # (   "invocationMethod": {)

[//]: # (      "type": "HTTP",)

[//]: # (      "method": "POST",)

[//]: # (      "url": "/v1/blueprints/workload/entities",)

[//]: # (      "body": {)

[//]: # (         "identifier": "${event.payload.entity.identifier}",)

[//]: # (         "title": "${event.payload.entity.title}",)

[//]: # (         "properties": {)

[//]: # (            "version": "${event.payload.entity.properties.version}")

[//]: # (         },)

[//]: # (         "relations": {)

[//]: # (            "service": "${event.payload.entity.properties.serviceId}",)

[//]: # (            "environment": "${event.payload.entity.properties.environmentId}")

[//]: # (         })

[//]: # (      })

[//]: # (   },)

[//]: # (   "publish": true)

[//]: # (})

[//]: # ()
[//]: # (</details>)

[//]: # ()
[//]: # ()
[//]: # (Explanation)

[//]: # (	•	Trigger: On k8sDeployment creation in Port &#40;assuming your integration maps K8s deployments to the k8sDeployment blueprint&#41;.)

[//]: # (	•	Action: Upserts a workload entity, transferring relevant properties &#40;e.g., version, replicas&#41; and linking to the parent service and/or environment.)

[//]: # ()
[//]: # (Automation Example: Create an Environment from AWS Accounts)

[//]: # ()
[//]: # (If you also integrated AWS or any other infrastructure tool, you can set up an automation for awsAccount or cloudEnvironment blueprint:)

[//]: # ()
[//]: # (<details>)

[//]: # (<summary>Automation JSON &#40;click to expand&#41;</summary>)

[//]: # ()
[//]: # ()
[//]: # ({)

[//]: # (   "identifier": "autoEnvironmentFromAWS",)

[//]: # (   "title": "Create or Update Environment from AWS Account",)

[//]: # (   "description": "Whenever a new awsAccount is created, create or update an Environment in Port.",)

[//]: # (   "trigger": {)

[//]: # (      "type": "ENTITY",)

[//]: # (      "condition": {)

[//]: # (         "blueprint": "awsAccount",)

[//]: # (         "operation": "create")

[//]: # (      })

[//]: # (   },)

[//]: # (   "invocationMethod": {)

[//]: # (      "type": "HTTP",)

[//]: # (      "method": "POST",)

[//]: # (      "url": "/v1/blueprints/environment/entities",)

[//]: # (      "body": {)

[//]: # (         "identifier": "${event.payload.entity.identifier}",)

[//]: # (         "title": "${event.payload.entity.title}",)

[//]: # (         "properties": {)

[//]: # (            "region": "${event.payload.entity.properties.defaultRegion}")

[//]: # (         },)

[//]: # (         "relations": {)

[//]: # (            "aws_account": "${event.payload.entity.identifier}")

[//]: # (         })

[//]: # (      })

[//]: # (   },)

[//]: # (   "publish": true)

[//]: # (})

[//]: # ()
[//]: # (</details>)

[//]: # ()
[//]: # ()
[//]: # (Explanation)

[//]: # (	•	Trigger: On awsAccount creation in Port.)

[//]: # (	•	Action: Creates or updates an environment entity referencing the AWS account.)

[//]: # ()
[//]: # (Putting It All Together)

[//]: # ()
[//]: # (With these Automations:)

[//]: # (	1.	Jira → automatically creates or updates a service entity whenever a new Jira Project &#40;jiraProject&#41; is synced.)

[//]: # (	2.	PagerDuty → similarly creates or updates a service for each PagerDuty service.)

[//]: # (	3.	Kubernetes → creates or updates a workload for each K8s resource you choose to map &#40;deployments, pods, etc.&#41;.)

[//]: # (	4.	AWS &#40;or other infra&#41; → creates or updates an environment entity when a new account or environment is discovered.)

[//]: # ()
[//]: # (Establishing Relationships)

[//]: # ()
[//]: # (In your blueprint definitions, add or refine relations so that services, workloads, and environments properly reference each other. For instance, if your K8s deployment references a service by name, ensure your automation sets relations.service to that matching name or identifier.)

[//]: # ()
[//]: # (Handling Edge Cases)

[//]: # (	•	If multiple tools refer to the same service, you may want additional logic to unify them &#40;e.g., standard naming or checking if a service with that name already exists&#41;.)

[//]: # (	•	If a new environment is partially discovered by different integrations &#40;AWS, K8s&#41;, you might update an existing environment entity rather than creating a new one.)

[//]: # ()
[//]: # (Example Slack Notification &#40;Optional&#41;)

[//]: # ()
[//]: # (You can also configure Slack or other chat tools to alert you when a new service, workload, or environment is created. For example, you might have an Automation triggered by entity.create that sends a Slack message with the new entity details:)

[//]: # ()
[//]: # ({)

[//]: # (   "identifier": "slackAlertNewService",)

[//]: # (   "title": "Alert Slack on New Service",)

[//]: # (   "description": "Sends a Slack message when a new Service is created in Port.",)

[//]: # (   "trigger": {)

[//]: # (      "type": "ENTITY",)

[//]: # (      "condition": {)

[//]: # (         "blueprint": "service",)

[//]: # (         "operation": "create")

[//]: # (      })

[//]: # (   },)

[//]: # (   "invocationMethod": {)

[//]: # (      "type": "WEBHOOK",)

[//]: # (      "url": "https://hooks.slack.com/services/<YOUR_WEBHOOK>",)

[//]: # (      "body": {)

[//]: # (         "text": "A new Service has been created: *${event.payload.entity.title}*")

[//]: # (      })

[//]: # (   },)

[//]: # (   "publish": true)

[//]: # (})

[//]: # ()
[//]: # (This is entirely optional, but it showcases how you can send notifications to your team whenever certain events happen in Port.)

[//]: # ()
[//]: # (Conclusion)

[//]: # ()
[//]: # (By configuring these integrations, blueprints, and automations, you can maintain a real-time software catalog in Port. Every time a new project or resource appears in your environment—whether in Jira, PagerDuty, Kubernetes, AWS, or another tool—Port will automatically create or update the corresponding entity and link it to the right relationships.)

[//]: # ()
[//]: # (This eliminates repetitive manual onboarding steps and ensures everyone has an up-to-date view of services, workloads, and environments in your organization.)

[//]: # ()
[//]: # ()


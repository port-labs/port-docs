---
sidebar_position: 11
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Set up deployments and incidents using Jira issues

The [Create & track DORA metrics in your portal](/guides/all/create-and-track-dora-metrics-in-your-portal) guide walks you through installing the DORA metrics experience in Port, using GitHub and PagerDuty as the default deployment and incident methods.

This guide assumes you have already completed that setup and shows how to adapt it for Jira users.

By following this guide, you will see how to define deployments and incidents in Port using Jira issues. By the end, you will be able to leverage DORA metrics using Jira, providing accurate deployment and incident insights in your portal.

## Prerequisites

To set up Jira issues for DORA metrics in your portal, you will need:

- Admin permissions (to install the experience and execute self-service actions).
- An installed DORA Metrics experience, based on: [Create & track DORA metrics in your portal](/guides/all/create-and-track-dora-metrics-in-your-portal).
- An installed [Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/).

## Configure your deployments and incidents

### Map Jira issues as deployments or incidents

- Navigate to [**Data Sources**](https://app.getport.io/settings/data-sources) and select your Jira integration.
- Add new mappings to ingest Jira issues as deployment or incident entities.

:::info Technical note: mapping deployments and incidents
These mappings ingest Jira events into the `dora_deployment_event` or `dora_incident_event` blueprints. For more details, see the [Create & track DORA metrics in your portal](/guides/all/create-and-track-dora-metrics-in-your-portal).
:::

**Deployments using Jira issues:**

```yaml showLineNumbers
- kind: issue
  selector:
  query: 'true'
  jql: (statusCategory != Done) OR (created >= -4w) OR (updated >= -4w)
  port:
  entity:
       mappings:
       identifier: .key
       title: .fields.summary
       blueprint: '"dora_deployment_event"'
       properties:
           deployment_type: '"Jira Issue"'
           deployment_time: .fields.resolutiondate
           status: >-
           if (.fields.resolutiondate != null) then "success" else "pending"
           end
           lead_time_hours: >-
           if (.fields.resolutiondate != null and .fields.created != null)
           then ((.fields.resolutiondate[0:19] + "Z" | fromdateiso8601) -
           (.fields.created[0:19] + "Z" | fromdateiso8601)) / 86400 else null
           end
    ```

**Incidents using Jira issues:**

```yaml showLineNumbers
- kind: issue
  selector:
  query: 'true'
  jql: >-
      ((statusCategory != Done) OR (created >= -1w) OR (updated >= -1w))
  port:
  entity:
      mappings:
      identifier: .key
      title: .fields.summary
      blueprint: '"dora_incident_event"'
      properties:
          incident_type: '"Jira Issue"'
          description: .fields.description.content| .. | objects | select(.type? == "text") | .text
          incident_url: ( .self | split("/") | .[0:3] | join("/") ) + "/browse/" + .key
          created_at: .fields.created
          resolved_at: .fields.resolutiondate
          time_to_resolve: >-
          if (.fields.resolutiondate != null and .fields.created != null)
          then ((.fields.resolutiondate[0:19] + "Z" | fromdateiso8601) -
          (.fields.created[0:19] + "Z" | fromdateiso8601)) / 86400 else null
          end
    ```


You can map Jira custom fields to track additional incident information. Here's an example of mapping custom fields for urgency, status, and priority:

```yaml
urgency: .fields.customfield_00000
status: .fields.customfield_00000
priority: .fields.customfield_00000
```

After you save the mappings, Port will begin ingesting matching Jira issues as deployments or incidents.

### Filtering or tagging (optional)

You can filter or tag deployments and incidents by project, issue types, statuses, or other criteria.  
This can be accomplished by using JQL (Jira Query Language) within your mapping configuration. For additional information, refer to [JQL documentation]( https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/jira/#jql-support-for-issues).


### Test your configuration

    - Create or move to done a Jira ticket matching your mappings.
    - In Port, navigate to the corresponding deployment or incident blueprint to verify that the new entity appears correctly.

## Next steps

- Once your Jira integration data begins populating, view your DORA metrics dashboard to analyze deployment and incident trends.
- Link deployments and incidents to teams or services for more detailed insights.

![DORA Metrics Dashboard Example](/img/guides/doraDashboardExample.png)

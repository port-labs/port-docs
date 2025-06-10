# Jira Integration for DORA Metrics

Port allows you to track DORA metrics using Jira issues, providing flexibility to define exactly what counts as a "deployment" or an "incident" in your workflow. You directly configure data mapping, ensuring accuracy without needing additional self-service actions.

### Prerequisites

* An installed Jira integration.
* An installed DORA Metrics experience.
* Admin permissions in Port to modify integrations and mappings.

## Configure your deployments and incidents

With Port’s Jira integration, you manually define the mapping logic to ingest Jira issues into Port’s DORA framework. You can map Jira issues as deployments, incidents, or both, based on your organization's definitions.

1. **Map Jira issues as deployments**:

   * Navigate to **Data Sources** and select your Jira integration.
   * Add a new mapping to ingest Jira issues as deployment entities.


:::info Technical note: how deployments are mapped
Mappings ingest Jira issues into the `dora_deployment_event` blueprint. For more details, see [Create & track DORA metrics in your portal](/guides/all/create-and-track-dora-metrics-in-your-portal).
:::

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
            if (.fields.resolutiondate != null) then "success" else "pending" end
          lead_time_hours: >-
            if (.fields.resolutiondate != null and .fields.created != null)
            then ((.fields.resolutiondate[0:19] + "Z" | fromdateiso8601) -
            (.fields.created[0:19] + "Z" | fromdateiso8601)) / 3600 else null end
```

2. **Map Jira issues as incidents**:

```yaml showLineNumbers
- kind: issue
  selector:
    query: 'true'
    jql: ((statusCategory != Done) OR (created >= -4w) OR (updated >= -4w))
  port:
    entity:
      mappings:
        identifier: .key
        title: .fields.summary
        blueprint: '"dora_incident_event"'
        properties:
          incident_type: '"Jira Issue"'
          description: .fields.description.content | .. | objects | select(.type? == "text") | .text
          incident_url: (.self | split("/") | .[0:3] | join("/")) + "/browse/" + .key
          created_at: .fields.created
          resolved_at: .fields.resolutiondate
          time_to_resolve: >-
            if (.fields.resolutiondate != null and .fields.created != null)
            then ((.fields.resolutiondate[0:19] + "Z" | fromdateiso8601) -
            (.fields.created[0:19] + "Z" | fromdateiso8601)) / 3600 else null end
```


You can map Jira custom fields to track additional incident information. Here's an example of mapping custom fields for urgency, status, and priority:

```yaml
urgency: .fields.customfield_00000
status: .fields.customfield_00000
priority: .fields.customfield_00000
```


* **Save the mapping**: Port will immediately start ingesting matching Jira issues as deployments or incidents.

### Filtering and Tagging

Refine your mappings further using Jira Query Language (JQL). This lets you precisely define which issues should count towards your DORA metrics.

**Example:** Track only deployments with specific issue types and statuses:

```yaml
jql: project = "APP" AND issuetype in ("Deployment") AND status = "Done"
```

### Save and Test

After saving your mappings, Port begins ingesting Jira events immediately.

**Test your configuration:**

* Create or resolve a Jira issue matching your mapping criteria.
* In Port, navigate to the relevant deployment or incident blueprint to confirm the new entities appear correctly.

### Customization and Advanced Mapping

For more complex setups, combine multiple mappings or customize additional properties to better reflect your organization's requirements. You can add or modify relations to services and teams within your mappings, enhancing the depth of insights provided by your DORA dashboards.

### Next Steps

As your workflows develop, update your mappings or incorporate additional sources for more comprehensive insights. Explore further integration possibilities and advanced mapping techniques in the additional guides provided.

With Jira integration properly configured, you'll have precise, actionable DORA metrics reflecting your organization's actual operational practices.

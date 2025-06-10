# GitLab Integration for DORA Metrics

Port enables you to track DORA metrics from your GitLab repositories by directly configuring your data mapping—no self-service actions required. You have full flexibility to define exactly what counts as a “deployment” for your organization, whether it’s a merged merge request or a completed CI/CD job.

### Prerequisites
- An installed GitLab integration.
- An installed DORA Metrics experience.
- Admin permissions in Port to modify integrations and mappings.

### Configuring Deployments from GitLab

With Port’s GitLab integration, you manually define the mapping logic to ingest the right deployment events into Port’s DORA framework. You can map either merge requests, jobs, or both, depending on how you define a “deployment”.

1. Map merge requests and/or jobs as deployments
    - Go to the Data Sources then click on the GitLab integration
    - Add a new mapping to ingest GitLab merge requests as deployment entities.


:::info Technical note: how deployments are mapped
Keep in mind that the mapping ingests the deployments into the dora_deployment_event blueprint, for further information visit Create & track DORA metrics in your portal.
:::

```yaml showLineNumbers
- kind: merge-request
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id | tostring
        title: .title
        blueprint: '"dora_deployment_event"'
        properties:
          deployment_type: '"MR merged"'
          deployment_time: .merged_at
          leadTimeHours: >-
            (.created_at as $createdAt | .merged_at as $mergedAt | ($createdAt
            | sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime)
            as $createdTimestamp | ($mergedAt | if . == null then null else
            sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime end)
            as $mergedTimestamp | if $mergedTimestamp == null then null else
            (((($mergedTimestamp - $createdTimestamp) / 3600) * 100 | floor) /
            100) end)
```

- Alternatively, map jobs as deployments:

```yaml showLineNumbers
  - kind: job
    selector:
    query: 'true'
    port:
    entity:
        mappings:
        identifier: .id | tostring
        title: .title // (.id | tostring)
        blueprint: '"dora_deployment_event"'
        properties:
            deployment_type: '"GitLab Job"'
            deployment_time: .finished_at
            status: .status
            leadTimeHours: >-
            (.commit.committed_date as $createdAt | .finished_at as $mergedAt |
            ($createdAt | sub("\\.\\d+(Z|\\+00:00)$"; "Z") | 
            strptime("%Y-%m-%dT%H:%M:%SZ") | mktime) as $createdTimestamp | 
            ($mergedAt | if . == null then null else sub("\\.\\d+(Z|\\+00:00)$"; "Z")
            | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime end) as $mergedTimestamp |
            if $mergedTimestamp == null then null else 
            (((($mergedTimestamp - $createdTimestamp) / 3600) * 100 | floor) / 100) end)

```
- Save the mapping. Port will begin ingesting matching events as deployments.

2. (Optional) Filtering or tagging

### Filtering and Tagging

You can further refine your configuration by applying filters or tags within your mapping:

* **Example:** Only count deployments where the target branch is `main` and the state is `closed`:

  ```yaml
  query: ([.state == "closed"] | any) and ([.target_branch == "main"] | any)
  ```

This ensures you’re only tracking the deployments that matter most to your process.

### Save and Test

After saving your mapping, Port will begin ingesting the selected GitLab events as deployments.
**Test your configuration:** Trigger a new merge request and complete it, or run a deployment job. Then, check the relevant deployment blueprint in Port to verify the new deployment appears as expected.

### Customization and Advanced Mapping

For more advanced scenarios, you can combine multiple mappings or further customize properties to reflect your organization’s needs. You can also add or modify relationships to services and teams within your mapping to make your DORA dashboards even more insightful and actionable.

### Next Steps

As your workflows evolve, you can update your mapping or combine sources for a more complete view. For more integrations and advanced deployment mapping options, check out the additional guides in this section.

With your GitLab integration configured, you now have accurate, actionable DORA metrics reflecting your team’s real delivery practices.


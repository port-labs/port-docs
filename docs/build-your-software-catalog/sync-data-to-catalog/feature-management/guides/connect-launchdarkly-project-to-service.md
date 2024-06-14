import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect Launchdarkly project to a service

This guide aims to cover how to connect a Launchdarkly `project` to an existing service in Port.

:::tip Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart). We will use the `Service` blueprint that was created during the onboarding process.
- Ensure you have [Launchdarkly installed and configured](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/jira.md#installation) in your environment.

:::

<br/>

### Add Tags to projects in Launchdarkly

[Tagging projects in LaunchDarkly](/https://docs.launchdarkly.com/home/account/tags#projects) allows you to categorize and filter them. You can use tags to group projects that are related to a specific service or feature. In this guide, we will add a tag to indicate what service the project is related to:

1. **Log in to LaunchDarkly** as a user with the necessary permissions to manage projects.
2. **Navigate to the account settings page**
3. **Click on the name of the project** you want to add tags to. The Environments tab appears.
4. **Click on the `Settings` tab**
5. **In the "General information" section**, select a tag or create a new tag from the Tags menu
5. **Add a tag** that represents the service the project is related to, `port-auth-service`. 
6. **Click Update information.**

For this guide, let's assume there is a service entity identified by `auth-service` in your `Service` blueprint in Port.

<img src='/img/guides/jiraAddLabelToIssue.png' width='60%' border='1px' />

:::note Control the label name
Since our Launchdarkly `project` may already have several tags, we will need a mechanism to control how these labels will be related to our `Service` blueprint. A way to achieve this relation is to prefix the label name with the keyword `port-`. We will then use JQ to select the labels that starts with this keyword. So, our example label will be named `port-auth-service`, which will correspond to a Service entity identified by `auth-service` in Port.
:::

### Create the service relation

Now that Port is synced with our Launchdarkly resources, let's reflect the Launchdarkly project in our services to display the issue associated with a service.
First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) between our services and the corresponding Launchdarkly project.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `Launchdarkly project` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/guides/jiraAddRelationToIssue.png' width='60%' border='1px' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/jiraCreateRelationOnIssue.png' width='60%' border='1px' />

<br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant Launchdarkly Projects to each of our services. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your Launchdarkly integration:

<img src='/img/guides/jiraIntegrationDataSources.png' border='1px' />
<br/><br/>

Under the `resources` key, modify the mapping for the `project` kind by using the following YAML block. Then click `Save & Resync`:

<details>
<summary><b>Relation mapping (Click to expand)</b></summary>

```yaml
  - kind: project
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .key
          title: .name
          blueprint: '"launchDarklyProject"'
          properties:
            tags: .tags
          relation:
            service: .tags | map(select(startswith("port"))) | map(sub("port-"; ""; "g")) | .[0]
```

</details>

:::tip JQ explanation

The JQ below selects all labels that start with the keyword `port`. It then removes "port-" from each label, leaving only the part that comes after it. It then selects the first match, which is equivalent to the service in Port.

```yaml
service: .tags | map(select(startswith("port"))) | map(sub("port-"; ""; "g")) | .[0]
```

:::

What we just did was map the `Launchdarkly Project` to the relation between it and our `Services`.  
Now, if our `Service` identifier is equal to the Launchdarkly project tag, the `service` will automatically be linked to it &nbsp;🎉

<img src='/img/guides/jiraIssueAfterServiceMapping.png' width='80%' border='1px' />

### Conclusion

By following these steps, you can seamlessly connect a Launchdarkly project with an existing service blueprint in Port using project tags.

More relevant guides and examples:

- [Port's Launchdarkly integration](/build-your-software-catalog/sync-data-to-catalog/feature-management/launchdarkly/)
- [Toggle Launchdarkly Feature Flag](/create-self-service-experiences/setup-backend/github-workflow/examples/Launchdarkly/toggle-launchdarkly-feature-flag)

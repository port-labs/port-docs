---
displayed_sidebar: null
description: Effortlessly connect Jira issues to services in Port, ensuring streamlined issue tracking and resolution.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect Jira issue to a service

This guide aims to cover how to connect a Jira `issue` to an existing service in Port.

:::info Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/getting-started/overview). We will use the `Service` blueprint that was created during the onboarding process.
- Ensure you have [Jira installed and configured](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/jira.md#installation) in your environment.

:::

<br/>

### Add labels to issues in Jira

Labelling issues in Jira allows you to categorize and filter them. You can use labels to group issues that are related to a specific service in Port. In this guide, we will add a label to tell us what service the issue is related to:

1. **Log in to Jira** as a user with the `Administer Jira` global permission.
2. **Navigate to the issue** you want to label.
3. **Click on the issue** to open it.
4. **Click on the `Labels` field** on the right hand side to add a label.
5. **Add a label** that represents the service the issue is related to, `port-auth-service`. For this guide, let's assume there is a service entity identified by `auth-service` in your `Service` blueprint in Port.

<img src='/img/guides/jiraAddLabelToIssue.png' width='60%' border='1px' />

:::note Control the label name
Since our Jira `issue` may already have several labels, we will need a mechanism to control how these labels will be related to our `Service` blueprint. A way to achieve this relation is to prefix the label name with the keyword `port-`. We will then use JQ to select the labels that starts with this keyword. So, our example label will be named `port-auth-service`, which will correspond to a Service entity identified by `auth-service` in Port.
:::

### Create the service relation

Now that Port is synced with our Jira resources, let's reflect the Jira Issue in our services to display the issue associated with a service.
First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) between our services and the corresponding Jira Issue.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `Jira Issue` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/guides/jiraAddRelationToIssue.png' width='60%' border='1px' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/jiraCreateRelationOnIssue.png' width='60%' border='1px' />

<br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant Jira Issues to each of our services. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your Jira integration:

<img src='/img/guides/jiraIntegrationDataSources.png' border='1px' />
<br/><br/>

Under the `resources` key, modify the mapping for the `issue` kind by using the following YAML block. Then click `Save & Resync`:

<details>
<summary><b>Relation mapping (Click to expand)</b></summary>

```yaml
- kind: issue
    selector:
      query: 'true'
      jql: status != Done
    port:
      entity:
        mappings:
          identifier: .key
          title: .fields.summary
          blueprint: '"jiraIssue"'
          properties:
            url: (.self | split("/") | .[:3] | join("/")) + "/browse/" + .key
            status: .fields.status.name
            issueType: .fields.issuetype.name
            components: .fields.components
            assignee: .fields.assignee.displayName
            reporter: .fields.reporter.displayName
            creator: .fields.creator.displayName
            priority: .fields.priority.id
            created: .fields.created
            updated: .fields.updated
          relations:
            board: .boardId | tostring
            sprint: .sprint.id | tostring
            project: .fields.project.key
            parentIssue: .fields.parent.key
            subtasks: .fields.subtasks | map(.key)
            // highlight-start
            service: .fields.labels | map(select(startswith("port"))) | map(sub("port-"; ""; "g")) | .[0]
            // highlight-end
```

</details>

:::tip JQ explanation

The JQ below selects all labels that start with the keyword `port`. It then removes "port-" from each label, leaving only the part that comes after it. It then selects the first match, which is equivalent to the service in Port.

```yaml
service: .fields.labels | map(select(startswith("port"))) | map(sub("port-"; ""; "g")) | .[0]
```

:::

What we just did was map the `Jira Issue` to the relation between it and our `Services`.  
Now, if our `Service` identifier is equal to the Jira issue label, the `service` will automatically be linked to it &nbsp;🎉

<img src='/img/guides/jiraIssueAfterServiceMapping.png' width='80%' border='1px' />

### Conclusion

By following these steps, you can seamlessly connect a Jira issue with an existing service blueprint in Port using issue labels.

More relevant guides and examples:

- [Port's Jira integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/jira/)
- [Self-service action to change the status of a Jira issue](https://docs.port.io/guides/all/change-status-and-assignee-of-jira-ticket)
- [Self-service action to report a bug in Jira from Port](https://docs.port.io/guides/all/report-a-bug)

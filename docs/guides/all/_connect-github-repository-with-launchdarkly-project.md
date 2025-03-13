---
displayed_sidebar: null
description: Seamlessly connect your GitHub repository with a LaunchDarkly project in Port for efficient feature management.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect GitHub repository (service) to a Launchdarkly project

This guide aims to demonstrate how to connect a GitHub repository (referred to as Service for the rest of the guide) to a Launchdarkly project in Port.

:::info Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/getting-started/overview). We will use the `Service` blueprint that was created during the onboarding process.
- Ensure you have [Launchdarkly installed and configured](/build-your-software-catalog/sync-data-to-catalog/feature-management/launchdarkly/launchdarkly.md#installation) in your environment.
- Ensure you have [GitHub installed and configured](/build-your-software-catalog/sync-data-to-catalog/git/github/#setup)

:::

<br/>

### Add topics to services in GitHub

Tagging repositories with topics allows you to categorize, filter and add metadata information to them. You can use topics to group repositories related to a Launchdarkly project. In this guide, we will add a topic to tell us what Launchdarkly project the repo is related to:

1. **Log in to GitHub** as a user with enough permissions to edit topics for a repository.
2. **Navigate to the repository** you want to add a topic to.
3. **Click on the settings icon**
<img src='/img/build-your-software-catalog/sync-data-to-catalog/github/editGitHubTopics.png' width='60%' border='1px' />

4. **Click on the `Topics` field** to add a topic.

5. **Add a topic** that represents the Launchdarkly project the service is related to, `port-launchdarkly-kafka`. For this guide, let's assume there is a service entity identified by `kafka` in your `LaunchdarklyProject` blueprint in Port.
<img src='/img/build-your-software-catalog/sync-data-to-catalog/github/addLaunchdarklyTopicToService.png' width='60%' border='1px' />

:::note Control the topic name
Since our GitHub repository may already have several labels, we will need a mechanism to control how these topics will be related to our `LaunchdarklyProject` blueprint. A way to achieve this relation is to prefix the topic name with the keyword `port-launchdarkly-`. We will then use JQ to select the topics that starts with this keyword. So, our example topic will be named `port-launchdarkly-kafka`, which will correspond to a Launchdarkly Project entity identified by `kafka` in Port.
:::

### Create the Project relation

Now that Port is synced with our GitHub resources, let's reflect the topic in our services to display the Launchdarkly project associated with a service.
First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) between our services and the corresponding Launchdarkly Project.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `Service` (GitHub repository) <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/build-your-software-catalog/sync-data-to-catalog/github/addNewRelationToService.png' width='40%' border='1px' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/build-your-software-catalog/sync-data-to-catalog/github/createLaunchDarklyProjectRelationOnService.png' width='50%' border='1px' />

<br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant Services to each of our Launchdarkly Projects. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your GitHub integration:

<img src='/img/build-your-software-catalog/sync-data-to-catalog/github/githubServiceDataSources.png' width='60%' border='1px' />
<br/><br/>

Under the `resources` key, modify the mapping for the `service` kind by using the following YAML block. Then click `Save & Resync`:

<details>
<summary><b>Relation mapping (Click to expand)</b></summary>

```yaml
resources:
  - kind: repository
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .name
          title: .name
          blueprint: '"service"'
          properties:
            readme: file://README.md
            url: .html_url
            language: .language
          relations:
            // highlight-start
            launchDarklyProject: .topics | map(select(startswith("port-launchdarkly-"))) | map(sub("port-launchdarkly-"; ""; "g"))
            // highlight-end
```

</details>

:::tip JQ explanation

The JQ below selects all topics that start with the keyword `port-launchdarkly-`. It then removes "port-launchdarkly-" from each topic, leaving only the part that comes after it. It then selects the first match, which is equivalent to the Launchdarkly Project in Port.

```yaml
launchDarklyProject: .topics | map(select(startswith("port-launchdarkly-"))) | map(sub("port-launchdarkly-"; ""; "g"))
```

:::

What we just did was map the `Launchdarkly Project` to the relation between it and our `Services`.  
Now, if our `Launchdarkly Project` identifier is equal to the GitHub service label, the `service` will automatically be linked to it &nbsp;🎉

<img src='/img/build-your-software-catalog/sync-data-to-catalog/github/githubServiceAfterMappingLaunchDarkly.png' width='60%' border='1px' />

### Conclusion

By following these steps, you can seamlessly connect a GitHub repository with an existing Launchdarkly Project blueprint in Port using topics.

More relevant guides and examples:
- [Port's Launchdarkly integration](/build-your-software-catalog/sync-data-to-catalog/feature-management/launchdarkly)
- [Toggle Launchdarkly Feature Flag](/guides/all/toggle-launchdarkly-feature-flag)

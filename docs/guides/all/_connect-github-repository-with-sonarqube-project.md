---
displayed_sidebar: null
description: Learn how to connect GitHub repositories with SonarQube projects in Port, enhancing code quality and oversight.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect GitHub repository (service) to a SonarQube project

This guide aims to demonstrate how to connect a GitHub repository (referred to as Service for the rest of the guide) to a SonarQube project in Port.

:::info Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/getting-started/overview). We will use the `Service` blueprint that was created during the onboarding process.
- Ensure you have [SonarQube installed and configured](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube/sonarqube.md#installation) in your environment.
- Ensure you have [GitHub installed and configured](/build-your-software-catalog/sync-data-to-catalog/git/github/#setup)

:::

<br/>

### Add topics to services in GitHub

Tagging repositories with topics allows you to categorize, filter and add metadata information to them. You can use topics to group repositories related to a SonarQube project inp ort. In this guide, we will add a topic to tell us what SonarQube project the issue is related to:

1. **Log in to GitHub** as a user with sufficient permissions to edit topics for a repository.
2. **Navigate to the repository** you want to add a topic to.
3. **Click on the settings icon**
<img src='/img/build-your-software-catalog/sync-data-to-catalog/github/editGitHubTopics.png' width='60%' border='1px' />

4. **Click on the `Topics` field** to add a topic.

5. **Add a topic** that represents the SonarQube project the service is related to, `port-sonarqube-kafka`. For this guide, let's assume there is a service entity identified by `kafka` in your `sonarQubeProject` blueprint in Port.
<img src='/img/build-your-software-catalog/sync-data-to-catalog/github/addTopicToService.png' width='60%' border='1px' />

:::note Control the topic name
Since our GitHub repository may already have several labels, we will need a mechanism to control how these topics will be related to our `sonarQubeProject` blueprint. A way to achieve this relation is to prefix the topic name with the keyword `port-sonarqube-`. We will then use JQ to select the topics that starts with this keyword. So, our example topic will be named `port-sonarqube-kafka`, which will correspond to a SonarQube Project entity identified by `kafka` in Port.
:::

### Create the Project relation

Now that Port is synced with our GitHub resources, let's reflect the topic in our services to display the SonarQube project associated with a service.
First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) between our services and the corresponding SonarQube Project.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `Service` (GitHub repository) <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/build-your-software-catalog/sync-data-to-catalog/github/addNewRelationToService.png' width='50%' border='1px' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/build-your-software-catalog/sync-data-to-catalog/github/createSonarQubeRelationOnService.png' width='50%' border='1px' />

<br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant Services to each of our SonarQube Projects. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your GitHub integration:

<img src='/img/build-your-software-catalog/sync-data-to-catalog/github/githubServiceDataSources.png' width='60%' border='1px' />
<br/><br/>

Under the `resources` key, modify the mapping for the `service` kind by using the following YAML block. Then click `Save & Resync`:

<details>
<summary><b>Relation mapping (Click to expand)</b></summary>

```yaml
- kind: repository
    selector:
      query: 'true'
      collaborators: true
    port:
      entity:
        mappings:
          identifier: .name
          title: .name
          blueprint: '"githubRepository"'
          properties:
            readme: file://README.md
            url: .html_url
            defaultBranch: .default_branch
          relations:
            // highlight-start
            sonarQubeProject: .topics | map(select(startswith("port-sonarqube-"))) | map(sub("port-sonarqube-"; ""; "g"))
            // highlight-end
```

</details>

:::tip JQ explanation

The JQ below selects all topics that start with the keyword `port-sonarqube-`. It then removes "port-sonarqube-" from each topic, leaving only the part that comes after it. It then selects the first match, which is equivalent to the SonarQube Project in Port.

```yaml
sonarQubeProject: .topics | map(select(startswith("port-sonarqube-"))) | map(sub("port-sonarqube-"; ""; "g"))
```

:::

What we just did was map the `SonarQube Project` to the relation between it and our `Services`.  
Now, if our `SonarQube Project` identifier is equal to the GitHub service label, the `service` will automatically be linked to it &nbsp;🎉

<img src='/img/build-your-software-catalog/sync-data-to-catalog/github/githubServiceAfterMapping.png' width='60%' border='1px' />

### Conclusion

By following these steps, you can seamlessly connect a GitHub repository with an existing SonarQube Project blueprint in Port using topics.

More relevant guides and examples:
- [Port's SonarQube integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/jira/)
- [Mini guide to connect SonarQube Project to a service](https://docs.port.io/guides/all/connect-sonar-project-to-service)
- [Self-service action to add tags to SonarQube Project](https://docs.port.io/guides/all/add-tags-to-sonarqube-project)

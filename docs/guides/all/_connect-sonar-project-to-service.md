---
displayed_sidebar: null
description: Effortlessly connect Sonar projects to services in Port, ensuring code quality and streamlined service management.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect SonarQube project to service

This guide aims to demonstrate how to connect a SonarQube project to a service in Port.

:::info Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/getting-started/overview). We will use the `Service` blueprint that was created during the onboarding process.
- Ensure you have [SonarQube ocean integration](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube/sonarqube.md) installed and configured in your environment.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install a relevant integration.

:::

<br/>

### Add Topics to GitHub Repositories

[Adding topics your repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics#adding-topics-to-your-repository) allows you to categorize and label your projects based on various attributes such as technology stack, business domain, team ownership, etc. In this guide, we will add a topic attribute to indicate the SonarQube project that analyzes the repository:

1. **Login to your [GitHub account](https://github.com/login)**.
2. Once logged in, navigate to the repository you want to tag.
3. In the top right corner of the page, to the right of "About", click the settings icon.
4. Type the topic name (`sonarqube-my_project_key`) into the input field provided. For this guide, let's assume there is a SonarQube project identified by `my_project_key` that analyzes this repository.

<img src='/img/guides/githubRepoAddTopics.png' width='60%' />

:::note Control the topic name
Since our `Service` may already have several topics, we will need a mechanism to control how these topics will be related to our `SonarQube Projects`. A way to achieve this relation is to prefix the topic name with the keyword `port-`. We will then use GitHub API to select the topics that start with this keyword. So, our example topic will be named `port-my_project_key`, which will correspond to a SonarQube project identified by `my_project_key`.
:::


### Create the service relation

Now that Port is synced with our SonarQube resources, let's reflect the SonarQube project in our services to display the projects used in a service.
First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) between our services and the corresponding Sonarqube project.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `service` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/guides/githubServiceCreateRelation.png' width='60%' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/githubServiceEditRelation.png' width='60%' />

<br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant Services to each of our SonarQube Projects. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your Github integration:

<img src='/img/guides/githubIntegrationDataSources.jpg' />

<br/><br/>

Under the `resources` key, modify the mapping for the `service` kind by using the following YAML block. Then click `Save & Resync`:

<details>
<summary>Relation mapping (click to expand)</summary>

```yaml showLineNumbers
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
          project: .topics | map(select(startswith("port-"))) | map(sub("port-"; ""; "g")) | .[0]
```
</details>

:::tip JQ explanation

The JQ below selects all topics that start with the keyword `port`. It then removes "port-" from each topic, leaving only the part that comes after it. It then selects the first match, which is equivalent to the service in Port.

```yaml
project: .topics | map(select(startswith("port-"))) | map(sub("port-"; ""; "g")) | .[0]
```
:::

What we just did was map the `SonarQube Project` to the relation between it and our `Services`.  
Now, if our `Sonarqube Project` identifier is equal to the Service topic, the `project` will automatically be linked to it &nbsp;🎉

![entitiesAfterServiceMapping](/img/guides/entitiesAfterServiceMapping.png)

### Conclusion

By following these steps, you can seamlessly connect a `Service` with a `SonarQube Project` blueprint in Port using topics.

More relevant guides and examples:

- [A self-service action to add tags to SonarQube project](https://docs.port.io/create-self-service-experiences/setup-backend/github-workflow/examples/SonarQube/add-tags-to-sonarqube-project)
- [Port's SonarQube integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube)
- [Integrate scorecards with Slack](https://docs.port.io/promote-scorecards/manage-using-3rd-party-apps/slack)
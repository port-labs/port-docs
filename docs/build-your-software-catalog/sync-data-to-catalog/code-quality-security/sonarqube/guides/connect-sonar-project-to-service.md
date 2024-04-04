import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect SonarQube project to service

This guide aims to demonstrate how to connect a SonarQube project to an existing service in Port.

:::tip Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart). We will use the `Service` blueprint that was created during the onboarding process.
- Ensure you have [SonarQube ocean integration](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube/sonarqube.md) installed and configured in your environment.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install a relevant integration.

:::

<br/>

### Add tags to projects in SonarQube

Tagging projects in SonarQube allows you to categorize and label your projects based on various attributes such as technology stack, business domain, team ownership etc. In this guide, we will add a tag attribute to tell us the name of the service that implements the project:

1. Login to your [SonarQube account](https://www.sonarsource.com/)
2. Once logged in, navigate to the projects panel and choose the project you want to tag
3. Within the project dashboard, locate the **Project Information** tab specific to the selected project
4. Look for a section labeled **Tags** or similar. This is where you can manage tags associated with the project
5. To add a new tag, click on the **plus** icon and type the tag name (`port-auth-service`) into the input field provided. For this guide, let's assume there is a service entity identified by `auth-service` in your `Service` blueprint in Port. 

<img src='/img/guides/sonarProjectAddTags.png' width='60%' />

:::note Control the tag name
Since our `SonarQube project` may already have several tags, we will need a mechanism to control how these tags will be related to our `Service` blueprint. A way to achieve this relation is to prefix the tag name with the keyword `port-`. We will then use JQ to select the tags that starts with this keyword. So, our example tag will be named `port-auth-service`, which will correspond to a Service entity identified by `auth-service` in Port.
:::


### Create the service relation

Now that Port is synced with our SonarQube resources, let's reflect the SonarQube project in our services to display the projects used in a service.
First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) between our services and the corresponding Sonarqube project.

1. Head back to the [Builder](https://app.getport.io/dev-portal/data-model), choose the `SonarQube Project` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/guides/sonarProjectCreateRelation.png' width='60%' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/sonarProjectEditRelation.png' width='60%' />

<br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant SonarQube project to each of our services. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/dev-portal/data-sources), and click on your SonarQube integration:

<img src='/img/guides/sonarQubeIntegrationDataSources.png' />

<br/><br/>

Under the `resources` key, modify the mapping for the `projects` kind by using the following YAML block. Then click `Save & Resync`:

<details>
<summary>Relation mapping (click to expand)</summary>

```yaml showLineNumbers
  - kind: projects
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .key
          title: .name
          blueprint: '"sonarQubeProject"'
          properties:
            organization: .organization
            link: .__link
            lastAnalysisStatus: .__branch.status.qualityGateStatus
            lastAnalysisDate: .__branch.analysisDate
            numberOfBugs: .__measures[]? | select(.metric == "bugs") | .value
            numberOfCodeSmells: .__measures[]? | select(.metric == "code_smells") | .value
            numberOfVulnerabilities: .__measures[]? | select(.metric == "vulnerabilities") | .value
            numberOfHotSpots: .__measures[]? | select(.metric == "security_hotspots") | .value
            numberOfDuplications: .__measures[]? | select(.metric == "duplicated_files") | .value
            coverage: .__measures[]? | select(.metric == "coverage") | .value
            mainBranch: .__branch.name
          relations:
            service: .tags | map(select(startswith("port"))) | map(sub("port-"; ""; "g")) | .[0]
```

</details>

:::tip JQ explanation

The JQ below selects all tags that start with the keyword `port`. It then removes "port-" from each tag, leaving only the part that comes after it. It then selects the first match, which is equivalent to the service in Port.

```yaml
service: .tags | map(select(startswith("port"))) | map(sub("port-"; ""; "g")) | .[0]
```
:::

What we just did was map the `SonarQube Project` to the relation between it and our `Services`.  
Now, if our `Service` identifier is equal to the SonarQube project tag, the `service` will automatically be linked to it &nbsp;🎉

![entitiesAfterServiceMapping](/img/guides/entitiesAfterServiceMapping.png)

### Conclusion

By following these steps, you can seamlessly connect a SonarQube project with an existing service blueprint in Port using project tags.

More relevant guides and examples:

- [A self-service action to add tags to SonarQube project](https://docs.getport.io/create-self-service-experiences/setup-backend/github-workflow/examples/SonarQube/add-tags-to-sonarqube-project)
- [Port's SonarQube integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube)
- [Integrate scorecards with Slack](https://docs.getport.io/promote-scorecards/manage-using-3rd-party-apps/slack)
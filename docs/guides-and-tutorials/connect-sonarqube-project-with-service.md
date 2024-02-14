---
sidebar_position: 8
title: Connect sonarqube project with service
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect sonarqube project with service

This guide aims to cover how to connect a SonarQube project with an existing service in Port.

:::tip Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart). We will use the `Service` blueprint that was created during the onboarding process.
- Ensure you have SonarQube installed and configured in your environment.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install a relevant integration.

:::

<br/>

## Integrate SonarQube into Port

This goal of this section is to bring our SonarQube data into Port. [Port's SonarQube integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube) (powered by [Ocean](https://ocean.getport.io/)) allows you to import `projects`, `issues` and `analyses` from your SonarQube account into Port. The integration automatically creates <PortTooltip id="blueprint">blueprints</PortTooltip> and <PortTooltip id="entity">entities</PortTooltip> for these resources.

:::info Note
For this installation you will need Helm and a running K8s cluster (see [prerequisites](/guides-and-tutorials/ensure-production-readiness)).
:::

1. Install Port's SonarQube integration using Helm, by running the command below in your terminal.

- Replace `CLIENT_ID` and `CLIENT_SECRET` with your credentials (get them [here](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials)).

- Replace `sonarApiToken` with your SonarQube token. To obtain it, [follow this documentation](https://docs.sonarsource.com/sonarqube/9.8/user-guide/user-account/generating-and-using-tokens/#generating-a-token)

- Replace `sonarOrganizationId` with your SonarQube organization ID. To obtain it, [follow this documentation](https://docs.sonarsource.com/sonarcloud/appendices/project-information/#project-and-organization-keys). Note that the SonarQube organization ID is not required when using on-prem sonarqube instance.

<details>
<summary>Installation command (click to expand)</summary>

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-sonarqube-integration port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \  # REPLACE VALUE
	--set port.clientSecret="PORT_CLIENT_SECRET"  \  # REPLACE VALUE
	--set initializePortResources=true  \
	--set integration.identifier="my-sonarqube-integration"  \
	--set integration.type="sonarqube"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.secrets.sonarApiToken="MY_API_TOKEN"  \  # REPLACE VALUE
	--set integration.config.sonarOrganizationId="MY_ORG_KEY"  # REPLACE VALUE
```
</details>

Great! Now that the integration is installed, we should see some new components in Port:

- Go to your [Builder](https://app.getport.io/dev-portal/data-model), you should now see three new <PortTooltip id="blueprint">blueprints</PortTooltip> created by the integration - `SonarQube Project`, `SonarQube Issue` and `SonarQube Analysis`.
- Go to your [Software catalog](https://app.getport.io/services), click on `SonarQube Project` in the sidebar, you should now see new <PortTooltip id="entity">entities</PortTooltip> created for all your projects.

## Add tags to projects in SonarQube

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


## Create the service relation

Now that Port is synced with our SonarQube resources, let's reflect the SonarQube project in our services to display the projects used in a service.
First, we will need to create a [relation](/build-your-software-catalog/define-your-data-model/relate-blueprints/#what-is-a-relation) between our services and the corresponding Sonarqube project.

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
            service: .tags | map(select(startswith("port"))) | map(sub("port-"; ""; "g"))
```

</details>

:::tip JQ explanation

The JQ below selects all tags that start with the keyword `port`. It then removes "port-" from each tag, leaving only the part that comes after it.

```yaml
service: .tags | map(select(startswith("port"))) | map(sub("port-"; ""; "g"))
```
:::

What we just did was map the `SonarQube Project` to the relation between it and our `Services`.  
Now, if our `Service` identifier is equal to the SonarQube projects tag, the `service` will automatically be linked to it &nbsp;🎉

![entitiesAfterServiceMapping](/img/guides/entitiesAfterServiceMapping.png)

### Conclusion

By following these steps, you can seamlessly connect a SonarQube project with an existing service blueprint in Port using project tags.

More relevant guides and examples:

- [Port's OpsGenie integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/incident-management/opsgenie/)
- [Integrate scorecards with Slack](https://docs.getport.io/promote-scorecards/manage-using-3rd-party-apps/slack)

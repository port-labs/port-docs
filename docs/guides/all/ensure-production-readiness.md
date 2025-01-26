---
sidebar_position: 2
title: Ensure production readiness
displayed_sidebar: null
description: Follow this guide to ensure production readiness in Port, optimizing your deployments for reliability and performance.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Ensure production readiness

This guide takes 10 minutes to complete, and aims to cover:

- Some advanced types of properties that can be added to <PortTooltip id="blueprint">blueprints</PortTooltip>, and what can be achieved by using them.
- The value and flexibility of scorecards in Port.

<br/>
🎬 If you would like to follow along to a **video** that implements this guide, check out this one by @TeKanAid 🎬
<center>

<iframe width="568" height="320" src="https://www.youtube.com/embed/tMYaKlMIvZk?start=946" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>

<br/><br/>

:::info Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/getting-started/overview). We will use the `service` blueprint that was created during the onboarding process.

:::

### The goal of this guide

In this guide we will set various standards for the production readiness of our services, and see how to use them as part of our CI.

After completing it, you will get a sense of how it can benefit different personas in your organization:

- Platform engineers will be able to define policies for any service, and automatically pass/fail releases accordingly.
- Developers will be able to easily see which policies set by the platform engineer are not met, and what they need to fix.
- R&D managers will get a bird's-eye-view of the state of all services in the organization.

<br/>

## Expand your service blueprint

In this guide we will add two new properties to our `service` <PortTooltip id="blueprint">blueprint</PortTooltip>, which we will then use to set production readiness standards:

1. The service's `on-call`, fetched from Pagerduty.
2. The service's `Code owners`, fetched from Github.

### Add an on-call to your services

Port offers various integrations with incident response platforms.  
In this guide, we will use **Pagerduty** to get our services' on-call. 

#### Create the necessary Pagerduty resources

If you already have a Pagerduty account that you can play around with, feel free to skip this step.

1. Create a [Pagerduty account](https://www.pagerduty.com/sign-up/) (free 14-day trial).

2. Create a new service:

![pagerdutyServiceCreation](/img/guides/pagerdutyServiceCreation.png)

- Name the service `DemoPdService`.
- Choose the existing `Default` escalation policy.
- Under `Reduce noise` use the recommended settings.
- Under `Integrations` scroll down and click on `Create service without an integration`.

#### Integrate Pagerduty into Port

Now let's bring our Pagerduty data into Port. Port's Pagerduty integration automatically fetches `Services` and `Incidents`, and creates <PortTooltip id="blueprint">blueprints</PortTooltip> and <PortTooltip id="entity">entities</PortTooltip> for them.  
To install the integration:

1. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on the `+ Data source` button in the top-right corner.

2. Under the `Incident Management` section, choose `Pagerduty`.

3. As you can see in this form, Port supports multiple installation methods. This integration can be installed in your environment (e.g. on your Kubernetes cluster), or it can be hosted by Port, on Port's infrastructure.  
   For this guide, we will use the `Hosted by Port` method.  

4. Enter the required parameters:
   - Token - Your Pagerduty API token. To create one, see the [Pagerduty documentation](https://support.pagerduty.com/docs/api-access-keys).
      :::info Port secrets
      The `Token` field is a Port secret, meaning it will be encrypted and stored securely in Port.  
      Select a secret from the dropdown, or create a new one by clicking on `+ Add secret`.  

      Learn more about Port secrets [here](/sso-rbac/port-secrets/).  
      :::
   - API URL - The Pagerduty API URL. For most users, this will be `https://api.pagerduty.com`. If you use the EU data centers, set this to `https://api.eu.pagerduty.com`.

5. Click `Done`. Port will now install the integration and start fetching your Pagerduty data. This may take a few minutes.    
   You can see the integration in the `Data sources` page, when ready it will look like this:
   <img src='/img/guides/prodReadinessInstallationCompleteDataSources.png' width='75%' border='1px' />

Great! Now that the integration is installed, we should see some new components in Port:

- Go to your [Builder](https://app.getport.io/settings/data-model), you should now see two new <PortTooltip id="blueprint">blueprints</PortTooltip> created by the integration - `PagerDuty Service` and `PagerDuty Incident`.
- Go to your [Software catalog](https://app.getport.io/services), click on `PagerDuty Services` in the sidebar, you should now see a new <PortTooltip id="entity">entity</PortTooltip> created for our `DemoPdService`, with a populated `On-call` property.

#### Add an on-call property to the service blueprint

Now that Port is synced with our Pagerduty resources, let's reflect the Pagerduty service's on-call in our services.  
First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/#what-is-a-relation) between our services and the corresponding Pagerduty services.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `Service` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/guides/serviceCreateRelation.png' width='40%' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/prodReadinessRelationCreation.png' width='50%' />

<br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, let's create a [mirror property](https://docs.port.io/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/mirror-property/) in our service to display its on-call.

1. Choose the `Service` <PortTooltip id="blueprint">blueprint</PortTooltip> again, and under the `PagerDuty Service` relation, click on `New mirror property`.  
   Fill the form out like this, then click `Create`:

<img src='/img/guides/mirrorPropertyCreation.png' width='40%' />

<br/><br/>

2. Now that our mirror property is set, we need to assign the relevant Pagerduty service to each of our services. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your Pagerduty integration:

<img src='/img/guides/pdDataSources.png' width='60%' />

<br/><br/>

Add the following YAML block to the mapping under the `resources` key, then click `save & resync`:

<details>
<summary>Relation mapping (click to expand)</summary>

```yaml showLineNumbers
- kind: services
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .name | gsub("[^a-zA-Z0-9@_.:/=-]"; "-") | tostring
        title: .name
        blueprint: '"service"'
        properties: {}
        relations:
          pagerduty_service: .id
```

</details>

What we just did was map the `Pagerduty service` to the relation between it and our `services`.  
Now, if our `service` identifier is equal to the Pagerduty service's name, the `service` will automatically have its `on-call` property filled: &nbsp;🎉

![entitiesAfterOnCallMapping](/img/guides/entitiesAfterOnCallMapping.png)

**Note** that you can always perform this assignment manually if you wish:

1. Go to your [Software catalog](https://app.getport.io/services), choose any service in the table under `Services`, click on the `...`, and click `Edit`:

![editServiceEntity](/img/guides/editServiceEntity.png)

2. In the form you will now see a property named `PagerDuty Service`, choose the `DemoPdService` we created from the dropdown, then click `Update`:

<img src='/img/guides/editServiceChoosePdService.png' width='40%' />

<br/><br/>

### Display each service's code owners

Git providers allow you to add a `CODEOWNERS` file to a repository specifying its owner/s. See the relevant documentation for details and examples:

<Tabs groupId="git-provider" queryString defaultValue="github" values={[
{label: "GitHub", value: "github"},
{label: "GitLab", value: "gitlab"},
{label: "Bitbucket", value: "bitbucket"}
]}>

<TabItem value="github" label="Github">

[Github codeowners documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

</TabItem>

<TabItem value="gitlab" label="GitLab">

[GitLab codeowners documentation](https://docs.gitlab.com/ee/user/project/codeowners/)

</TabItem>

<TabItem value="bitbucket" label="BitBucket">

[BitBucket codeowners documentation](https://confluence.atlassian.com/bitbucketserver/code-owners-1296171116.html)

</TabItem>

</Tabs>

<br/>
Let's see how we can easily ingest a CODEOWNERS file into our existing services:

#### Add a codeowners property to the service blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) again, choose the `Service` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click `New property`.

2. Fill in the form like this:  
   _Note the `identifier` field value, we will need it in the next step._

<img src='/img/guides/addCodeownersForm.png' width='40%' />

3. Next we will update the Github exporter mapping and add the new property. Go to your [data sources page](https://app.getport.io/settings/data-sources).

4. Under `Exporters`, click on the Github exporter with your organization name.

5. In the mapping YAML (the bottom-left panel), add the line `code_owners: file://CODEOWNERS` as shown here, then click `Save & Resync`:

<img src='/img/guides/prodReadinessMappingAddCodeOwners.png' width='70%' border='1px' />
<br/><br/>

_Remember the `identifier` from step 2? This tells Port how to populate the new property_ 😎

Going back to our Catalog, we can now see that our <PortTooltip id="entity">entities</PortTooltip> have their code owners displayed:

![entityAfterCodeowners](/img/guides/entityAfterCodeowners.png)

<br/>

### Update your service's scorecard

Now let's use the properties we created to set standards for our services.  

#### Add rules to existing scorecard

Say we want to ensure each service meets our new requirements, with different levels of importance. Our `Service` blueprint already has a scorecard called `Production readiness`, with three rules.  
Let's add our metrics to it: 

- `Bronze` - each service must have a `Readme` (we have already defined this in the quickstart guide).
- `Silver` - each service must have an on-call defined.

Now let's implement it:

1. Go to your [Builder](https://app.getport.io/settings/data-model), choose the `Service` <PortTooltip id="blueprint">blueprint</PortTooltip>, click on `Scorecards`, then click our existing `Production readiness` scorecard:

<img src='/img/guides/editReadinessScorecard.png' width='30%' />

<br/><br/>

2. Replace the content with this, then click `Save`:

<details>
<summary><b>Scorecard schema (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "ProductionReadiness",
  "title": "Production Readiness",
  "rules": [
    {
      "identifier": "hasReadme",
      "description": "Checks if the service has a readme file in the repository",
      "title": "Has a readme",
      "level": "Bronze",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": "isNotEmpty",
            "property": "readme"
          }
        ]
      }
    },
    {
      "identifier": "usesSupportedLang",
      "description": "Checks if the service uses one of the supported languages. You can change this rule to include the supported languages in your organization by editing the blueprint via the \"Builder\" page",
      "title": "Uses a supported language",
      "level": "Silver",
      "query": {
        "combinator": "or",
        "conditions": [
          {
            "operator": "=",
            "property": "language",
            "value": "Python"
          },
          {
            "operator": "=",
            "property": "language",
            "value": "JavaScript"
          },
          {
            "operator": "=",
            "property": "language",
            "value": "React"
          },
          {
            "operator": "=",
            "property": "language",
            "value": "GoLang"
          }
        ]
      }
    },
    {
      "identifier": "hasTeam",
      "description": "Checks if the service has a team that owns it (according to the \"Team\" property of the service)",
      "title": "Has a Team",
      "level": "Gold",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": "isNotEmpty",
            "property": "$team"
          }
        ]
      }
    },
    {
      "identifier": "hasOncall",
      "title": "Has On-call",
      "level": "Gold",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": "isNotEmpty",
            "property": "on_call"
          }
        ]
      }
    }
  ]
}
```

</details>

Now go to your Catalog and click on any of your services.  
Click on the `Scorecards` tab and you will see the score of the service, with details of which checks passed/failed:

<img src='/img/guides/prodReadinessEntityAfterScorecard.png' width='100%' border='1px' />

### Possible daily routine integrations

- Use Port's API to check for scorecard compliance from your CI and pass/fail it accordingly.
- Notify periodically via Slack about services that fail gold/silver/bronze validations.
- Send a weekly/monthly report for managers showing the number of services that do not meet specific standards.

### Conclusion

Production readiness is something that needs to be monitored and handled constantly. In a microservice-heavy environment, things like codeowners and on-call management are critical.  
With Port, standards are easy to set-up, prioritize and track. Using Port's API, you can also create/get/modify your scorecards from anywhere, allowing seamless integration with other platforms and services in your environment.

More relevant guides and examples:

- [Port's OpsGenie integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/opsgenie/)
- [Integrate scorecards with Slack](https://docs.port.io/promote-scorecards/manage-using-3rd-party-apps/slack)

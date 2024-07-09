---
sidebar_position: 2
title: Ensure production readiness
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

<iframe width="568" height="320" src="https://www.youtube.com/embed/tMYaKlMIvZk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>

<br/><br/>

:::tip Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart). We will use the `Service` blueprint that was created during the onboarding process.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install a relevant integration.

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

In this guide we will use Pagerduty to get our services' on-call. Note that Port also has integrations for other incident response platforms.

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

:::info K8s cluster required
For this installation you will need Helm and a running K8s cluster (see [prerequisites](/guides-and-tutorials/ensure-production-readiness)).
:::

1. Install Port's Pagerduty integration using Helm, by running the command below in your terminal.

:::tip Alternative installation
The command below will install the integration in `Realtime & always on` mode. If you prefer to use a one-time (scheduled) installation instead, see the [Pagerduty installation](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty/?installation-methods=one-time#installation) section.
:::

- Replace `CLIENT_ID` and `CLIENT_SECRET` with your credentials (get them [here](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)).

- Replace `token` with your Pagerduty token. To obtain it:
  - Hover over your avatar in the top right corner of your Pagerduty app, then click `My profile`.
  - Click the `User settings` tab and scroll to the bottom.
  - Click on `Create API User Token` and provide a name.
  - Copy the new token value.

![pagerdutyUserSettings](/img/guides/pagerdutyUserSettings.png)

<details>
<summary><b>Installation command (click to expand)</b></summary>

```bash showLineNumbers
helm repo add port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-pagerduty-integration port-labs/port-ocean \
    --set port.clientId="CLIENT_ID" \   # REPLACE VALUE
    --set port.clientSecret="CLIENT_SECRET"  \   # REPLACE VALUE
    --set port.baseUrl="https://api.getport.io"  \
    --set initializePortResources=true  \
    --set integration.identifier="my-pagerduty-integration"  \
    --set integration.type="pagerduty"  \
    --set integration.eventListener.type="POLLING"  \
    --set integration.secrets.token="token"  \   # REPLACE VALUE
    --set integration.config.apiUrl="https://api.pagerduty.com"
```

<PortApiRegionTip/>

</details>

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

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, let's create a [mirror property](https://docs.getport.io/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/mirror-property/) in our service to display its on-call.

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

Git providers allow you to add a `CODEOWNERS` file to a repository specifiying its owner/s. See the relevant documentation for details and examples:

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

5. In the mapping YAML, add the line `code_owners: file://CODEOWNERS` as shown here, then click `Resync`:

![mappingAddCodeOwners](/img/guides/mappingAddCodeOwners.png)

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
<summary>Scorecard schema (click to expand)</summary>

```json showLineNumbers
{
  "identifier": "ProductionReadiness",
  "title": "Production Readiness",
  "rules": [
    {
      "identifier": "hasReadme",
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
      "identifier": "hasTeam",
      "title": "Has Team",
      "level": "Silver",
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
      "identifier": "hasSlackChannel",
      "title": "Has a Slack channel",
      "level": "Gold",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": "isNotEmpty",
            "property": "slack"
          }
        ]
      }
    },
    {
      "identifier": "hasCodeowners",
      "title": "Has Codeowners",
      "description": "Checks if a service has a codeowners file",
      "level": "Silver",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": "isNotEmpty",
            "property": "code_owners"
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

Now go to your Catalog and click on any of your services. Click on the `Scorecards` tab and you will see the score of the service, with details of which checks passed/failed:

<img src='/img/guides/entityAfterReadinessScorecard.png' width='100%' />

### Possible daily routine integrations

- Use Port's API to check for scorecard compliance from your CI and pass/fail it accordingly.
- Notify periodically via Slack about services that fail gold/silver/bronze validations.
- Send a weekly/monthly report for managers showing the number of services that do not meet specific standards.

### Conclusion

Production readiness is something that needs to be monitored and handled constantly. In a microservice-heavy environment, things like codeowners and on-call management are critical.  
With Port, standards are easy to set-up, prioritize and track. Using Port's API, you can also create/get/modify your scorecards from anywhere, allowing seamless integration with other platforms and services in your environment.

More relevant guides and examples:

- [Port's OpsGenie integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/incident-management/opsgenie/)
- [Integrate scorecards with Slack](https://docs.getport.io/promote-scorecards/manage-using-3rd-party-apps/slack)

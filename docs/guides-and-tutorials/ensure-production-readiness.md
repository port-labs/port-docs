---
sidebar_position: 2
title: Ensure production readiness
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Ensure production readiness

This guide takes 8 minutes to complete, and aims to cover:

- Some advanced types of properties that can be added to blueprints, and what can be achieved by using them.
- The value and flexibility of scorecards in Port.

:::tip Prerequisites

- This guide assumes you have a Port account and a basic knowledge of working with Port. If you haven't done so, go ahead and complete the [quickstart](/quickstart).

- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).

- [Helm](https://helm.sh/docs/intro/install/) - required to install a relevant integration.

:::

### The goal of this guide

In this guide we will set various standards for the production readiness of our services, and see how to use them as part of our CI.

After completing it, you will get a sense of how your organization's daily routine could look like:

- Platform engineers will be able to define policies for any service, and automatically pass/fail releases accordingly.
- Developers will be able to easily see which policies set by the platform engineer are not met, and what they need to fix.
- R&D managers will get a bird's-eye-view of the state of all services in the organization.

## Expand your service blueprint

In this guide we will add 3 new properties to our `service` blueprint, which we will then use to set production readiness standards:

1. The service's `on-call`, fetched from Pagerduty.
   - Add relation to pdService
2. The service's `Code owners`, fetched from Github.
3. A url to the relevant `Slack channel`, calculated using the service's data.

### Add an on-call to your services

For this demo we will use Pagerduty to get our services' on-call. Note that Port also has integrations for other incident response platforms.

#### Create the necessary Pagerduty resources

If you already have a Pagerduty account that you can play around with, feel free to skip this step.

1. Create a [Pagerduty account](https://www.pagerduty.com/sign-up/)(free 14-day trial).

2. Create a new service:

![pagerdutyServiceCreation](/img/guides/pagerdutyServiceCreation.png)

- Name the service `DemoPdService`.
- Choose the existing `Default` escalation policy.
- Under `Reduce noise` use the recommended settings.
- Under `Integrations` scroll down and click on `Create service without an integration`.

3. Create an incident?

#### Integrate Pagerduty into Port

Now let's bring our Pagerduty data into Port. Port's Pagerduty integration automatically fetches `Services` and `Incidents`, and creates blueprints and entities for them.

1. Install Port's Pagerduty integration using Helm, by running the command below in your terminal.

:::info Note
For this installation you will need Helm and a running K8s cluster (see [prerequisites](/guides-and-tutorials/ensure-production-readiness)).
:::

- Replace `CLIENT_ID` and `CLIENT_SECRET` with your credentials (get them [here](/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials)).

- Replace `token` with your Pagerduty token. To obtain it:
  - Hover over your avatar in the top right corner of your Pagerduty app, then click `My profile`.
  - Click the `User settings` tab and scroll to the bottom.
  - Click on `Create API User Token` and provide a name.
  - Copy the new token value.

![pagerdutyUserSettings](/img/guides/pagerdutyUserSettings.png)

<details>
<summary>Installation command (click to expand)</summary>

```bash showLineNumbers
helm repo add port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-pagerduty-integration port-labs/port-ocean \
	--set port.clientId="CLIENT_ID" \ # REPLACE
	--set port.clientSecret="CLIENT_SECRET"  \ # REPLACE
	--set initializePortResources=true  \
	--set integration.identifier="my-pagerduty-integration"  \
	--set integration.type="pagerduty"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.secrets.token="token"  \ # REPLACE
	--set integration.config.appHost="https://example.com"  \
    --set integration.config.apiUrl="https://api.pagerduty.com"  \
```

</details>

Great! Now that the integration is installed, we should see some new components in Port:

- Go to your [Builder](https://app.getport.io/dev-portal/data-model), you should now see two new blueprints created by the integration - `PagerDuty Service` and `PagerDuty Incident`.
- Go to your [Software catalog](https://app.getport.io/services), click on `PagerDuty Services` in the sidebar, you should now see a new entity created for our `DemoPdService`, with a populated `On-call` property.

#### Add an on-call property to the service blueprint

Now that Port is synced with our Pagerduty resources, let's reflect the Pagerduty service's on-call in our services.  
First, we will need to create a [relation](/build-your-software-catalog/define-your-data-model/relate-blueprints/#what-is-a-relation) between our services and the corresponding Pagerduty services.

1. Head back to the [Builder](https://app.getport.io/dev-portal/data-model), choose the `Service` blueprint, and click on `New relation`:

<img src='/img/guides/serviceCreateRelation.png' width='30%' />

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/relationCreation.png' width='40%' />

Now that the blueprints are related, let's create a [mirror property](/build-your-software-catalog/define-your-data-model/setup-blueprint/properties/mirror-property/) in our service to display its on-call.

1. Choose the `Service` blueprint again, and under the `PagerDutyService` relation, click on `New mirror property`.  
   Fill the form out like this, then click `Create`:

<img src='/img/guides/mirrorPropertyCreation.png' width='40%' />

2. Now that our mirror property is set, we need to assign the relevant Pagerduty service to each of our services. Let's see an example - go to your [Software catalog](https://app.getport.io/services), choose any service in the table under `Services`, click on the `...`, and click `Edit`:

![editServiceEntity](/img/guides/editServiceEntity.png)

3. In the form you will now see a property named `PagerDutyService`, choose the `DemoPdService` we created from the dropdown, then click `Update`:

<img src='/img/guides/editServiceChoosePdService.png' width='40%' />

You can now see the on-call in the service: 🎉

![serviceAfterAssigningPdService](/img/guides/serviceAfterAssigningPdService.png)

### Display each service's code owners

Github allows adding a `CODEOWNERS` file to a repository. Let's see how we can easily ingest this into our existing services:

#### Add a codeowners property to the service blueprint

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model) again, choose the `Service` blueprint, and click `New property`.

2. Fill in the form like this:  
   _Note the `identifier` field value, we will need it in the next step._

<img src='/img/guides/addCodeownersForm.png' width='40%' />

3. Next we will update the Github exporter mapping and add the new property. Go to your [data sources page](https://app.getport.io/dev-portal/data-sources).

4. Under `Exporters`, click on the Github exporter with your organization name.

5. In the mapping YAML, add the line `code_owners: file://CODEOWNERS` as shown here, then click `Resync`:

![mappingAddCodeOwners](/img/guides/mappingAddCodeOwners.png)

_Remember the `identifier` from step 2? This tells Port how to populate the new property_ 😎

Going back to our Catalog, we can now see that our entities have their code owners displayed:

![entityAfterCodeowners](/img/guides/entityAfterCodeowners.png)

### Display each service's relevant Slack channel

We will now use a [calculation property](/build-your-software-catalog/define-your-data-model/setup-blueprint/properties/calculation-property/) to build a URL to the relevant Slack channel.

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model) yet again, choose the `Service` blueprint, and click `New property`.

2. Fill out the form like this, then click `Create`:

3. Add `on-call` from Pagerduty
   - Add relation to pdService
4. Add `Code owners` from Github
5. Add `Slack channel` calculation prop

### Possible daily routine integrations

- Send a slack message in the R&D channel to let everyone know that a new service was created.
- Send a weekly/monthly report for managers showing all the new services created in this timeframe and their owners.

### Set production-readiness standards

Add scorecards:
Basic

Has slack notification channel

Bronze

Has Owner - True

Has less than 3 incidents

Silver

Has On-Call - True

Gold

Has zero incidents

### Ensure standards are met in your CI

### Conclusion

Creating a service is not just a periodic task developers undertake, but a vital step that can occur on a monthly basis. However, it's crucial to recognize that this is only a fragment of the broader experience that we're striving to create for developers.  
Our ultimate goal is to facilitate a seamless transition from ideation to production. In doing so, we aim to eliminate the need for developers to navigate through a plethora of tools, reducing friction and accelerating the time-to-production.  
In essence, we're not just building a tool, but sculpting an ecosystem that empowers developers to bring new features to life with utmost efficiency.

More guides & tutorials will be available soon, in the meantime feel free to reach out with any questions via our [community slack](https://www.getport.io/community) or [Github project](https://github.com/port-labs?view_as=public).

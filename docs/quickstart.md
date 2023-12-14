---
sidebar_position: 2
title: Quickstart
sidebar_label: ⏱️ Quickstart
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# ⏱️ Quickstart

This guide takes 7 minutes to complete, and aims to demonstrate the potential of a developer portal for you and your developers.

<center>

<iframe width="60%" height="400" src="https://www.youtube.com/embed/Oqq-VA4a_fQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>

### The goal of this guide

In this guide we will model a repository from your Git provider in Port, using your real data.

After completing it, you will get a sense of how it can benefit different personas in your organization:

- Developers will be able to see all the services in the organization and their relevant metadata.
- Developers will be able to follow the organization's standards for production readiness.
- R&D managers will be able to get a bird's eye view of the organization's production readiness.
- Platform engineers will be able to customize Port to curate the developer's and R&D manager's experience.

### 1. Sign-up to Port

Head over to [app.getport.io](https://app.getport.io) and create an account.

### 2. Create your first blueprint!

[Blueprints](/build-your-software-catalog/define-your-data-model/setup-blueprint/) are one of Port's basic building blocks, used to represent any data source in your infrastructure.  
We will now create a `Service` blueprint to model a Git repository on Github/Bitbucket.

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model), click on the `Add` button in the top right corner, then choose `Custom blueprint`:

<img src='/img/quickstart/builderAddCustomBlueprint.png' width='30%' />

<br/><br/>

2. Click on the `Edit JSON` button in the top right corner. Here you can define a blueprint and its properties using JSON.

3. Replace the example content with the following definition, then click `Create`:

<details>
<summary><b>Blueprint JSON (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "service",
  "title": "Service",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown"
      },
      "url": {
        "title": "Repository URL",
        "type": "string",
        "format": "url"
      },
      "language": {
        "title": "Language",
        "type": "string"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

Congratulations, you have successfully modeled a basic Git repository 🥳  
You can now see the blueprint in your `Builder`:

![builderAfterBpCreate](/img/quickstart/builderAfterBpCreate.png)

Now let's connect our blueprint to a data source and fill it with real data!

### 3. Ingest data into your repository

1. To export and sync data from Github or BitBucket, Port provides a simple application. Choose your preferred provider and install the app:

<Tabs groupId="git-provider" queryString values={[
{label: "Github", value: "github"},
{label: "BitBucket", value: "bitbucket"},
{label: "Gitlab", value: "gitlab"}
]}>

<TabItem value="github">

Install [Github app](https://github.com/apps/getport-io) in the entire organization.

</TabItem>

<TabItem value="bitbucket">

Install [BitBucket app](https://marketplace.atlassian.com/apps/1229886/port-connector-for-bitbucket?hosting=cloud&tab=overview) in the entire organization.

</TabItem>

<TabItem value="gitlab">

Port supports Gitlab using the [ocean integration](http://ocean.getport.io). Follow [these instructions](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/gitlab/installation) to install the integration, then come back to this guide.

</TabItem>

</Tabs>

:::info NOTE
Make sure to install the app in the entire organization (and not in a single repository). This way Port will automatically create entities for all repositories.
:::

Once installed, you will see new data sources in the `Data Sources` tab of the builder page, waiting to be used (may take a few seconds to appear):

![dataSourcesGithub](/img/quickstart/dataSourcesGithub.png)

2. Finally, we need to map the desired information from our Git provider's API to the properties of the blueprint we created in Port. For this guide, we will provide you with mapping so you do not need to do anything yourself. If you want to dive further into this, see [Port's Git integrations](/build-your-software-catalog/sync-data-to-catalog/git/).

In the `Data sources` tab, click on the exporter you installed. In the `Mapping` tab paste the following snippet (choose your Git provider), then click `Save & Resync`:

<Tabs groupId="git-provider" queryString values={[
{label: "Github", value: "github"},
{label: "BitBucket", value: "bitbucket"},
{label: "Gitlab", value: "gitlab"}
]}>

<TabItem value="github">

<details>
<summary><b>Github blueprint mapping (click to expand)</b></summary>

```yaml showLineNumbers
resources:
  - kind: repository
    selector:
      query: "true"
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
```

</details>
</TabItem>

<TabItem value="bitbucket">

<details>
<summary><b>BitBucket blueprint mapping (click to expand)</b></summary>

```yaml showLineNumbers
resources:
  - kind: repository
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: ".name"
          title: ".name"
          blueprint: '"service"'
          properties:
            readme: file://README.md
            url: ".links.html.href"
            language: ".language"
```

</details>
</TabItem>

<TabItem value="gitlab">
<details>
<summary><b>Gitlab blueprint mapping (click to expand)</b></summary>

```yaml showLineNumbers
resources:
  - kind: project
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .path_with_namespace | gsub(" "; "")
          title: .name
          blueprint: '"service"'
          properties:
            readme: file://README.md
            url: .web_url
            language: .__languages | to_entries | max_by(.value) | .key
```

</details>
</TabItem>
</Tabs>

<img src='/img/quickstart/githubRepoMapping.png' width='750rem' />

---

Now head back to your `Catalog`, and go to the `Services` page. We can see that Port has created entities for us representing our repositories, filled with real data: 🥳

![catalogAfterRepoCreation](/img/quickstart/catalogAfterRepoCreation.png)

Clicking on a service name in the table will take us to its entity page:

![entityAfterIngestion](/img/quickstart/entityAfterIngestion.png)

As you can see, Port has pulled the repository's name, url and language, and its readme file is displayed in a new `README` tab in the entity page.

### 4. Set standards using **scorecards**

In this step we will see how to set metrics for our resources.

Let's add a scorecard to the `Service` blueprint:

1. Head over to the `Builder` page and double-click on the blueprint. Choose the `Scorecards` tab, then click on `New scorecard`:

<img src='/img/quickstart/blueprintAddScorecard.png' width='250rem' />

<br/><br/>

2. Replace the contents with the following JSON and click `Save`:

<details>
<summary><b>Scorecard JSON (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "ProductionReadiness",
  "title": "Production Readiness",
  "rules": [
    {
      "identifier": "hasReadme",
      "title": "Has readme",
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
    }
  ]
}
```

</details>

What we have just done is add a "Bronze" level metric that ensures all `Services` have a readme file.  
Going back to the entity we created in our `Catalog`, we can see that its `Scorecards` tab displays our new metric. Since our repository has a readme file, we pass with flying colors:

![entityPageAfterScorecard](/img/quickstart/entityPageAfterScorecard.png)

#### What more can you achieve with scorecards?

- Evaluate the maturity & producton readiness of your services.
- Enforce the standards that matter to you (e.g. ensure each service has an on-call defined).
- Track DORA metrics.
- Define thresholds (gold/silver/bronze) and prioritize metrics & KPIs.

### 5. Customize views and dashboards

Port is designed to be very flexible when it comes to data visualization and presentation.  
Let's create a simple new view for our service (and future services):

1. Head back to the `Services` page in your `Catalog`. Click on `Group by` and choose `Production Readiness` from the dropdown:

![groupByView](/img/quickstart/groupByView.png)

This table is now grouped by the scorecard we created in the previous step.

Say you really like this view, and want your developers to see the `Services` table in this format. Notice that the `Save this view` button is now enabled?

2. Click on the arrow to the right of the `Save this view` button, then click on `Save as a new page`:

<img src='/img/quickstart/saveAsNewPage.png' width='500rem' />

<br/><br/>

Choose a name and icon, and click on `Save page`.  
A second `Services` page is now created in your `Catalog`. You can further customize views and create pages in any way that suits you.

#### Create a dashboard

Dashboards allow you to visualize data that interests you and your developers.  
Let's create a simple pie chart showing the language distribution in our services:

1. Go to the `Home` tab of your Port app.
2. In the top-right corner, click on `Add` and choose `Pie chart`.

![createPieChart](/img/quickstart/createPieChart.png)

3. Fill the form out like this, then click `Save`:

<img src='/img/quickstart/pieChartLanguagesForm.png' width='380rem' />

<br/><br/>

You will now see a pie chart with the number of services and their language distribution in the `Home` tab of your Port app:

<img src='/img/quickstart/pieChartLanguages.png' width='300rem' />

<br/><br/>

This is just an example, in a real-life environment with many different resources you can visualize more complex data based on any property in any of your blueprints.

### Conclusion

Hopefully you now have a basic grasp of what you can do with Port, but this is just the tip of the iceberg. With Port's full suite of features, you can create a truly powerful, personalized developer portal.

### What's next?

- [Self-service actions guide](/guides-and-tutorials/scaffold-a-new-service) (~7 minutes)  
  Increase your developers' productivity and independence by creating powerful actions for them to use.

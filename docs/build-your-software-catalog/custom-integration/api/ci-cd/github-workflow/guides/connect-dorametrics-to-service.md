import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect DORA Metrics to Service

This guide aims to demonstrate how to connect DORA Metrics to a service in Port.

:::tip Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart).
- Install port [GitHub integration](/build-your-software-catalog/sync-data-to-catalog/git/github/installation) 
- We will use the `Github Service` blueprint that was created during the installation process.
- Ensure you have [DORA Metrics](/build-your-software-catalog/custom-integration/api/ci-cd/github-workflow/guides/dora-metrics.md) configured in your environment.
:::

### Create the service relation

First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) between our services and the corresponding DORA Metrics.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `service` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/guides/githubServiceCreateRelation.png' width='60%' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/githubServiceDoraEditRelation.png' width='60%' />

<br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant Services to each of our DORA Metrics. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your Github integration:

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
          doraMetrics: .id
```
</details>

What we just did was map the `DORA Metrics` to the relation between it and our `Services`.  
Now, if our `DORA Metrics` identifier is equal to the repository id, the `metrics` will automatically be linked to it &nbsp;🎉

![entitiesAfterServiceMapping](/img/guides/entitiesAfterServiceMapping.png)

### Conclusion

By following these steps, you can seamlessly connect a `Service` with `DORA Metrics` blueprint in Port using the repository id.

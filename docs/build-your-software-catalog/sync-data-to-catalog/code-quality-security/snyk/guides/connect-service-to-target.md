import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect service to Snyk target

This guide aims to demonstrate how to connect a service entity to its related Snyk target using integration mapping updates.

:::tip Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart). We will use the `Service` blueprint that was created during the onboarding process.
- Ensure you have [Snyk ocean integration](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/snyk/snyk.md) installed and configured in your environment.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install a relevant integration.

:::

<br/>

### Create the service relation

After installing the Snyk integration, your Port catalog will be synced with Snyk resources. Let's connect the Snyk target to our services. First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) between our services and the corresponding Snyk target.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `service` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/guides/githubServiceCreateRelation.png' width='40%' border="1px" />

<br/><br/>

2. Fill out the form as shown below, then click `Create`:

<img src='/img/guides/githubServiceEditSnykRelation.png' width='40%' border="1px"/>

<br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant Services to each of our Snyk targets. This can be done by adding some mapping logic:
1. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your Snyk integration
2. Under the `resources` key, add a new mapping for the `target` kind by using the following YAML block. Then click `Save & Resync`:

<details>
<summary>Relation mapping (click to expand)</summary>

```yaml showLineNumbers
  - kind: target
    selector:
      query: .relationships.integration.data.attributes.integration_type == "github"
    port:
      entity:
        mappings:
          identifier: .attributes.display_name | split("/") | .[1]
          title: .attributes.display_name | split("/") | .[1]
          blueprint: '"service"'
          properties: {}
          relations:
            snyk_target: .id
```
</details>

:::tip JQ explanation

The `selector.query` filters all targets from your Snyk environment that was added from Github. Since the identifier of the `Service` entities themselves are the github repository names, the JQ (`.attributes.display_name | split("/") | .[1]`) splits the `display_name` attribute (which is in the format `account/repo`) and maps the index 1 (`repo`), which is equivalent to the service entity identifier in Port.

:::
3. Resync the integration and you will see your `Service` entities connected to their Snyk targets:
<img src='/img/guides/serviceEntitiesAfterSnykTargetMapping.png' width='80%' border="1px" />

### Conclusion

By following these steps, you can seamlessly connect a `Service` with a `Snyk Target` blueprint in Port using integration mapping updates.

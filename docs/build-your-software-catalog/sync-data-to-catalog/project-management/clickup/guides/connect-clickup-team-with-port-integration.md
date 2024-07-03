import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_azure_premise.mdx"
import HelmParameters from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean-advanced-parameters-helm.mdx"
import DockerParameters from "./_clickup_parameters.mdx"
import AdvancedConfig from '/docs/generalTemplates/_ocean_advanced_configuration_note.md'
import ClickUpTeamBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/clickup/_example_clickup_team_blueprint.mdx"
import ClickUpTaskBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/clickup/_example_clickup_task_blueprint.mdx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Connect ClickUp Team with Port Integration

This guide aims to cover how to connect a ClickUp team with the Port integration to manage and understand your team data.

:::tip Prerequisites
- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart).
- Ensure you have [ClickUp installed and configured in your environment](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/project-management/clickup/)
- Ensure you have a registered organization in Port and your Port user role is set to `Admin`.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install a relevant integration.

:::

<br/>

## Integrate ClickUp resources with Port

The goal of this section is to fill the software catalog with data directly from your ClickUp organization. [Port's ClickUp integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/project-management/clickup/) allows you to import `teams`, `projects`, and `tasks`. For the purpose of this guide, we shall focus on the team object only. Follow the steps below to ingest your team data to Port.

:::info Note
For the ClickUp integration installation, you will need to have a registered organization in Port and your Port user role must be set to `Admin` (see [prerequisites](#connect-clickup-team-with-port-integration)).

:::

1. Go to your [Builder](https://app.getport.io/settings/data-model)

2. Create a ClickUp team <PortTooltip id="blueprint">blueprint</PortTooltip> using this schema:
   <details>
   <summary>ClickUp team blueprint (click to expand)</summary>
   
   ```json showLineNumbers
   {
     "identifier": "clickupTeam",
     "title": "Team",
     "icon": "ClickUp",
     "schema": {
       "properties": {
         "name": {
           "title": "Name",
           "type": "string"
         },
         "members": {
           "title": "Members",
           "type": "array"
         },
         "createdAt": {
           "title": "Created At",
           "type": "string",
           "format": "date-time"
         },
         "link": {
           "type": "string",
           "format": "url"
         }
       },
       "required": []
     },
     "mirrorProperties": {},
     "calculationProperties": {},
     "aggregationProperties": {},
     "relations": {}
   }
   ```
   
   </details>

3. Install Port's ClickUp integration by following the [installation guide](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/project-management/clickup/installation)

4. Now that the integration is installed successfully, we need to ingest `clickupTeam` data from the ClickUp organization into the software catalog. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your ClickUp integration:

[//]: # (@todo -> add images here)

Add the following YAML block into the editor to ingest team data. Then click `Save & Resync`:

<details>
<summary>Relation mapping (click to expand)</summary>

```yaml showLineNumbers
resources:
  - kind: team
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: ".id"
          title: ".name"
          blueprint: '"clickupTeam"'
          properties:
            name: ".name"
            members: "[.members[].username]"
            createdAt: ".date_created"
            link: ".url"
```

</details>

You should now be able to see your ClickUp teams ingested successfully in the software catalog.

## Create the ClickUp Team relation

Now that Port is synced with our ClickUp resources, let's map the ClickUp teams to the relevant entities in Port.
First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/relate-blueprints.md) between our `clickupTeam` and the corresponding Port entities.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `Team` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

[//]: # (   @todo -> add images here)
   
   <br/><br/>

2. Fill out the form like this, then click `Create`:

[//]: # (@todo -> add images here)

<br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant Port entity to each of our ClickUp teams. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your ClickUp integration:

[//]: # (@todo -> add images here)

<br/><br/>

Under the `resources` key, locate the Team block and replace it with the following YAML block to map the team entities with Port entities. Then click `Save & Resync`:

<details>
<summary><b>Relation mapping (click to expand)</b></summary>

```yaml showLineNumbers
- kind: team
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .id
        title: .name
        blueprint: '"clickupTeam"'
        properties:
          name: .name
          members: "[.members[].username]"
          createdAt: .date_created
          link: .url
        relations:
          project: .project.name
```

</details>

:::tip Mapping explanation
The configuration mapping above ingests all teams from ClickUp. It then goes ahead to establish a relation between the `clickupTeam` entities and the `Port` entities &nbsp;🎉.

Please note that the `.id` property refers to the ID of the team itself. In our ClickUp integration mapping, we have defined these two pieces of information as the identifiers for the `clickupTeam` entities.

For the `Port` relation, we map the project name from the team properties.
:::

[//]: # (@todo -> add images here)

## Conclusion

By following these steps, you can seamlessly connect a ClickUp team with the Port integration.

More relevant guides and examples:

- [Port's ClickUp integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/project-management/clickup/)
- [Integrate scorecards with Slack](https://docs.getport.io/promote-scorecards/manage-using-3rd-party-apps/slack)